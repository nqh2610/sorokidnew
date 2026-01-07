import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { GAME_STAGES } from '@/config/adventure-stages-addsub.config';

export const dynamic = 'force-dynamic';

/**
 * DEBUG API - Kiểm tra dữ liệu Progress của user
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Lấy dữ liệu thô từ database
    const [user, lessonProgress, exerciseResults, competeResults] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true }
      }),
      
      prisma.progress.findMany({
        where: { userId },
        select: { levelId: true, lessonId: true, completed: true, starsEarned: true, completedAt: true },
        orderBy: [{ levelId: 'asc' }, { lessonId: 'asc' }]
      }),
      
      prisma.exerciseResult.findMany({
        where: { userId },
        select: { id: true, exerciseType: true, difficulty: true, isCorrect: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100 // Lấy 100 bài gần nhất
      }),
      
      prisma.competeResult.findMany({
        where: { userId },
        select: { id: true, arenaId: true, correct: true, stars: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    ]);

    // Phân tích từng stage
    const stageAnalysis = [];
    
    // Tạo map để tra cứu - coi như completed nếu có record và completed !== false
    const lessonMap = new Map();
    lessonProgress.forEach(p => {
      if (p.completed !== false) {
        lessonMap.set(`${p.levelId}-${p.lessonId}`, p);
      }
    });

    // Nhóm exercise results
    const exerciseGroups = {};
    exerciseResults.forEach(e => {
      const key = `${e.exerciseType}-${e.difficulty}`;
      if (!exerciseGroups[key]) {
        exerciseGroups[key] = { total: 0, correct: 0 };
      }
      exerciseGroups[key].total++;
      if (e.isCorrect) exerciseGroups[key].correct++;
    });

    // Kiểm tra 10 stages đầu
    GAME_STAGES.slice(0, 15).forEach(stage => {
      const analysis = {
        stageId: stage.stageId,
        name: stage.name,
        type: stage.type,
        bossType: stage.bossType || null,
        checkResult: null,
        dbData: null,
        isCompleted: false
      };

      if (stage.type === 'lesson') {
        const key = `${stage.levelId}-${stage.lessonId}`;
        analysis.checkKey = key;
        analysis.dbData = lessonMap.get(key) || null;
        analysis.isCompleted = lessonMap.has(key);
      }
      else if (stage.type === 'boss' && stage.bossType === 'practice') {
        const condition = stage.completeCondition || stage.practiceInfo;
        if (condition) {
          const key = `${condition.mode}-${condition.difficulty}`;
          analysis.checkKey = key;
          analysis.condition = condition;
          analysis.dbData = exerciseGroups[key] || { total: 0, correct: 0 };
          analysis.minCorrect = condition.minCorrect || 10;
          analysis.isCompleted = (exerciseGroups[key]?.correct || 0) >= (condition.minCorrect || 10);
        }
      }
      else if (stage.type === 'boss' && stage.bossType === 'compete') {
        // Dùng competeInfo hoặc completeCondition
        const condition = stage.competeInfo || stage.completeCondition;
        if (condition) {
          const arenaKey = condition.arenaId || `${condition.mode}-${condition.difficulty}-${condition.questions}`;
          analysis.checkKey = arenaKey;
          analysis.condition = condition;
          const match = competeResults.find(c =>
            c.arenaId === condition.arenaId ||
            c.arenaId === `${condition.mode}-${condition.difficulty}-${condition.questions}`
          );
          analysis.dbData = match || null;
          if (match) {
            const total = condition.questions || parseInt(match.arenaId.split('-').pop()) || 10;
            const minCorrect = condition.minCorrect || Math.ceil((condition.minPercent || 60) * total / 100);
            analysis.minCorrect = minCorrect;
            analysis.isCompleted = match.correct >= minCorrect;
          }
        }
      }

      stageAnalysis.push(analysis);
    });

    return NextResponse.json({
      user,
      summary: {
        totalLessonProgress: lessonProgress.length,
        completedLessons: lessonProgress.filter(p => p.completed).length,
        totalExercises: exerciseResults.length,
        totalCompete: competeResults.length
      },
      lessonProgress: lessonProgress.slice(0, 20), // 20 bài đầu
      exerciseGroups,
      competeResults: competeResults.slice(0, 10), // 10 trận đầu
      stageAnalysis
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
