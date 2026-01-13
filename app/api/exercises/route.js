import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { invalidateUserCache } from '@/lib/cache';
import { withApiProtection, withTimeout } from '@/lib/apiWrapper';

export const dynamic = 'force-dynamic';

// POST /api/exercises - Save exercise result
export const POST = withApiProtection(async (request) => {
    // 🔒 Rate limiting cho write operations
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.MODERATE);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { exerciseType, difficulty, problem, userAnswer, correctAnswer, isCorrect, timeTaken } = body;

    // Validate input
    if (!exerciseType || !problem || userAnswer === undefined || correctAnswer === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 🔧 TỐI ƯU: Batch operations trong transaction
    const result = await prisma.$transaction(async (tx) => {
      // Save exercise result
      const exerciseResult = await tx.exerciseResult.create({
        data: {
          userId: session.user.id,
          exerciseType,
          difficulty: difficulty || 1,
          problem,
          userAnswer: String(userAnswer),
          correctAnswer: String(correctAnswer),
          isCorrect: !!isCorrect,
          timeTaken: timeTaken || 0
        }
      });

      // Award stars if correct
      let starsEarned = 0;
      if (isCorrect) {
        starsEarned = 10 * (difficulty || 1);
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            totalStars: { increment: starsEarned }
          }
        });
      }

      return { exerciseResult, starsEarned };
    });

    // 🔧 Invalidate cache
    invalidateUserCache(session.user.id);

    // 🔧 FIX: Await background operations với timeout để không leak process
    // Giới hạn 2s để không block response quá lâu
    try {
      await Promise.race([
        Promise.all([
          updateQuestProgress(session.user.id, 'complete_exercises', 1),
          checkExerciseAchievements(session.user.id)
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Background ops timeout')), 2000))
      ]);
    } catch (e) {
      // Timeout hoặc error - log và tiếp tục
      console.warn('Exercise background ops skipped:', e.message);
    }

    return NextResponse.json({ 
      result: result.exerciseResult, 
      starsEarned: result.starsEarned, 
      success: true 
    });
}, { timeout: 15000, useCircuitBreaker: true }); // 15s timeout

// GET /api/exercises - Get exercise history
export const GET = withTimeout(async (request) => {
  // 🔒 Rate limiting
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.NORMAL);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit')) || 50, 100); // Max 100
    const type = searchParams.get('type');

    const where = {
      userId: session.user.id,
      ...(type && { exerciseType: type })
    };

    // 🔧 TỐI ƯU: Select only needed fields
    const exercises = await prisma.exerciseResult.findMany({
      where,
      select: {
        id: true,
        exerciseType: true,
        difficulty: true,
        isCorrect: true,
        timeTaken: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Calculate statistics
    const stats = {
      total: exercises.length,
      correct: exercises.filter(e => e.isCorrect).length,
      accuracy: exercises.length > 0
        ? (exercises.filter(e => e.isCorrect).length / exercises.length) * 100
        : 0,
      avgTime: exercises.length > 0
        ? exercises.reduce((sum, e) => sum + e.timeTaken, 0) / exercises.length
        : 0
    };

    return NextResponse.json({ exercises, stats });
}, 10000); // 10s timeout cho GET

// 🔧 TỐI ƯU: Helper function to update quest progress - LIGHTWEIGHT VERSION
// Giảm N+1 queries bằng cách batch operations
async function updateQuestProgress(userId, questType, increment) {
  try {
    // 🔧 FIX: Chỉ query 1 lần thay vì loop
    const activeQuests = await prisma.quest.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      take: 5 // Giới hạn số quest check
    });

    // Lọc quests liên quan trong memory
    const relevantQuests = activeQuests.filter(q => {
      try {
        const req = JSON.parse(q.requirement);
        return req.type === questType;
      } catch { return false; }
    });

    if (relevantQuests.length === 0) return;

    // 🔧 FIX: Batch query userQuests
    const userQuests = await prisma.userQuest.findMany({
      where: {
        userId,
        questId: { in: relevantQuests.map(q => q.id) },
        completed: false
      }
    });

    // 🔧 FIX: Batch upsert thay vì từng cái một
    const upsertOps = relevantQuests.slice(0, 3).map(quest => {
      const req = JSON.parse(quest.requirement);
      const targetCount = req.count || 0;
      const userQuest = userQuests.find(uq => uq.questId === quest.id);
      const newProgress = (userQuest?.progress || 0) + increment;
      // 🔧 FIX BUG: Chỉ completed khi target > 0 VÀ progress >= target
      const completed = targetCount > 0 && newProgress >= targetCount;

      return prisma.userQuest.upsert({
        where: { userId_questId: { userId, questId: quest.id } },
        create: { userId, questId: quest.id, progress: increment, completed: targetCount > 0 && increment >= targetCount },
        update: { progress: newProgress, completed }
      });
    });

    await Promise.all(upsertOps);
  } catch (error) {
    console.error('Error updating quest progress:', error.message);
  }
}

// 🔧 TỐI ƯU: Helper function to check exercise-related achievements - LIGHTWEIGHT VERSION
async function checkExerciseAchievements(userId) {
  try {
    // 🔧 FIX: Lighter query - chỉ lấy counts
    const [exerciseCount, unlockedIds] = await Promise.all([
      prisma.exerciseResult.count({ where: { userId } }),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true }
      })
    ]);

    const allAchievements = await prisma.achievement.findMany({
      where: { category: { in: ['practice', 'accuracy'] } },
      take: 10 // Giới hạn
    });

    const unlockedSet = new Set(unlockedIds.map(ua => ua.achievementId));
    const pendingAchievements = allAchievements.filter(a => !unlockedSet.has(a.id));
    
    // 🔧 FIX: Early return
    if (pendingAchievements.length === 0) return;
    
    // 🔧 FIX: Chỉ check 2 achievements mỗi lần
    const toCheck = pendingAchievements.slice(0, 2);
    const toUnlock = [];

    for (const achievement of toCheck) {
      try {
        const req = JSON.parse(achievement.requirement);
        const targetCount = req.count || 0;
        // 🔧 FIX BUG: Chỉ unlock khi target > 0 VÀ đạt target
        if (req.type === 'complete_exercises' && targetCount > 0 && exerciseCount >= targetCount) {
          toUnlock.push(achievement);
        }
      } catch { continue; }
    }

    // 🔧 FIX: Batch unlock
    if (toUnlock.length > 0) {
      await prisma.$transaction([
        ...toUnlock.map(a => prisma.userAchievement.create({
          data: { userId, achievementId: a.id }
        })),
        prisma.user.update({
          where: { id: userId },
          data: {
            totalStars: { increment: toUnlock.reduce((s, a) => s + (a.stars || 0), 0) },
            diamonds: { increment: toUnlock.reduce((s, a) => s + (a.diamonds || 0), 0) }
          }
        })
      ]);
    }
  } catch (error) {
    console.error('Error checking achievements:', error.message);
  }
}
