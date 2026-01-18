import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GAME_STAGES } from '@/config/adventure-stages-addsub.config';

export const dynamic = 'force-dynamic';

/**
 * GET /api/adventure/test-db
 * Test database connection và kiểm tra dữ liệu progress
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const results = { userId, tests: [] };

    // Test 1: User info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true }
    });
    results.tests.push({ name: 'User Info', status: 'OK', data: user });

    // Test 2: Lesson Progress
    const lessonProgress = await prisma.progress.findMany({
      where: { userId },
      orderBy: [{ levelId: 'asc' }, { lessonId: 'asc' }]
    });
    results.tests.push({ 
      name: 'Lesson Progress', 
      status: 'OK', 
      count: lessonProgress.length,
      sample: lessonProgress.slice(0, 10).map(p => ({
        levelId: p.levelId,
        lessonId: p.lessonId,
        completed: p.completed,
        stars: p.starsEarned
      }))
    });

    // Test 3: Exercise Results
    const exerciseResults = await prisma.exerciseResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 200
    });
    
    // Group by type-difficulty
    const exerciseGroups = {};
    exerciseResults.forEach(e => {
      const key = `${e.exerciseType}-${e.difficulty}`;
      if (!exerciseGroups[key]) exerciseGroups[key] = { total: 0, correct: 0 };
      exerciseGroups[key].total++;
      if (e.isCorrect) exerciseGroups[key].correct++;
    });
    
    results.tests.push({ 
      name: 'Exercise Results', 
      status: 'OK', 
      count: exerciseResults.length,
      groups: exerciseGroups
    });

    // Test 4: Compete Results
    const competeResults = await prisma.competeResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    results.tests.push({ 
      name: 'Compete Results', 
      status: 'OK', 
      count: competeResults.length,
      sample: competeResults.slice(0, 5).map(c => {
        // Parse total from arenaId (format: mode-difficulty-questions)
        const total = parseInt(c.arenaId.split('-').pop()) || 10;
        return {
          arena: c.arenaId,
          score: `${c.correct}/${total}`,
          percent: Math.round((c.correct / total) * 100),
          stars: c.stars
        };
      })
    });

    // Test 5: Stage Analysis
    const lessonMap = new Map();
    lessonProgress.forEach(p => {
      if (p.completed !== false) {
        lessonMap.set(`${p.levelId}-${p.lessonId}`, p.starsEarned || 3);
      }
    });

    const stageAnalysis = GAME_STAGES.slice(0, 15).map(stage => {
      let status = 'locked';
      let reason = '';
      
      if (stage.type === 'lesson') {
        const key = `${stage.levelId}-${stage.lessonId}`;
        if (lessonMap.has(key)) {
          status = 'completed';
          reason = `Found in progress: ${key}`;
        } else {
          reason = `Key not found: ${key}. Available keys: ${Array.from(lessonMap.keys()).join(', ') || 'none'}`;
        }
      } else if (stage.type === 'boss' && stage.bossType === 'practice') {
        const condition = stage.completeCondition || stage.practiceInfo;
        if (condition) {
          const key = `${condition.mode}-${condition.difficulty}`;
          const group = exerciseGroups[key];
          const required = condition.minCorrect || 10;
          const have = group?.correct || 0;
          if (have >= required) {
            status = 'completed';
            reason = `${have}/${required} correct`;
          } else {
            reason = `Need ${required} correct, have ${have}. Key: ${key}`;
          }
        }
      } else if (stage.type === 'boss' && stage.bossType === 'compete') {
        const condition = stage.completeCondition;
        if (condition) {
          const match = competeResults.find(c => 
            c.arenaId === condition.arenaId || 
            c.arenaId === `${condition.mode}-${condition.difficulty}-${condition.questions}`
          );
          if (match) {
            // Parse total from arenaId or condition
            const total = condition.questions || parseInt(match.arenaId.split('-').pop()) || 10;
            const percent = Math.round((match.correct / total) * 100);
            if (percent >= (condition.minPercent || 70)) {
              status = 'completed';
              reason = `${percent}% >= ${condition.minPercent || 70}%`;
            } else {
              reason = `${percent}% < ${condition.minPercent || 70}%`;
            }
          } else {
            reason = `No compete result for arena: ${condition.arenaId || `${condition.mode}-${condition.difficulty}-${condition.questions}`}`;
          }
        }
      }
      
      return {
        stageId: stage.stageId,
        name: stage.name,
        type: stage.type,
        bossType: stage.bossType || null,
        status,
        reason
      };
    });

    results.tests.push({ 
      name: 'Stage Analysis', 
      status: 'OK', 
      data: stageAnalysis 
    });

    // Summary
    const completedCount = stageAnalysis.filter(s => s.status === 'completed').length;
    results.summary = {
      totalStages: GAME_STAGES.length,
      analyzed: stageAnalysis.length,
      completed: completedCount,
      lessonMapKeys: Array.from(lessonMap.keys())
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Test DB Error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
