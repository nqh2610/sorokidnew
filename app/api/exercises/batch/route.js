import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { invalidateUserCache } from '@/lib/cache';
import { withApiProtection } from '@/lib/apiWrapper';

export const dynamic = 'force-dynamic';

/**
 * 🚀 TỐI ƯU: Batch POST /api/exercises/batch
 * Nhận nhiều kết quả exercise cùng lúc thay vì từng cái
 * 
 * Trước: 10-50 POST requests/màn chơi
 * Sau: 1 POST request/màn chơi
 * 
 * Giảm: ~90% số lượng requests + connections
 */
export const POST = withApiProtection(async (request) => {
  // 🔒 Rate limiting cho batch (moderate)
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.MODERATE);
  if (rateLimitError) {
    return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { results } = body;

  // Validate input
  if (!results || !Array.isArray(results) || results.length === 0) {
    return NextResponse.json({ error: 'Missing or invalid results array' }, { status: 400 });
  }

  // Giới hạn batch size để tránh abuse
  if (results.length > 100) {
    return NextResponse.json({ error: 'Batch size exceeds limit (max 100)' }, { status: 400 });
  }

  // 🔧 TỐI ƯU: Single transaction cho tất cả operations
  const result = await prisma.$transaction(async (tx) => {
    // 1. Tạo tất cả exercise results trong 1 query
    const exerciseData = results.map(r => ({
      userId: session.user.id,
      exerciseType: r.exerciseType,
      difficulty: r.difficulty || 1,
      problem: r.problem,
      userAnswer: String(r.userAnswer),
      correctAnswer: String(r.correctAnswer),
      isCorrect: !!r.isCorrect,
      timeTaken: r.timeTaken || 0
    }));

    await tx.exerciseResult.createMany({
      data: exerciseData
    });

    // 2. Tính tổng stars earned
    const correctResults = results.filter(r => r.isCorrect);
    const totalStarsEarned = correctResults.reduce((sum, r) => {
      return sum + 10 * (r.difficulty || 1);
    }, 0);

    // 3. Cập nhật user stars nếu có
    if (totalStarsEarned > 0) {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          totalStars: { increment: totalStarsEarned }
        }
      });
    }

    return {
      count: results.length,
      correctCount: correctResults.length,
      totalStarsEarned
    };
  });

  // 🔧 Invalidate cache
  invalidateUserCache(session.user.id);

  // 🔧 Background ops: Quest progress & Achievements (async, không block response)
  // Giới hạn 2s timeout để không leak process
  try {
    await Promise.race([
      Promise.all([
        updateQuestProgress(session.user.id, 'complete_exercises', results.length),
        checkExerciseAchievements(session.user.id)
      ]),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
    ]);
  } catch (e) {
    console.warn('Exercise batch background ops skipped:', e.message);
  }

  return NextResponse.json({
    success: true,
    processed: result.count,
    correct: result.correctCount,
    totalStarsEarned: result.totalStarsEarned
  });
}, { timeout: 20000, useCircuitBreaker: true });

// Helper: Update quest progress
async function updateQuestProgress(userId, questType, increment) {
  try {
    const activeQuests = await prisma.quest.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      take: 5
    });

    const relevantQuests = activeQuests.filter(q => {
      try {
        const req = JSON.parse(q.requirement);
        return req.type === questType;
      } catch { return false; }
    });

    if (relevantQuests.length === 0) return;

    const userQuests = await prisma.userQuest.findMany({
      where: {
        userId,
        questId: { in: relevantQuests.map(q => q.id) },
        completed: false
      }
    });

    const upsertOps = relevantQuests.slice(0, 3).map(quest => {
      const req = JSON.parse(quest.requirement);
      const userQuest = userQuests.find(uq => uq.questId === quest.id);
      const newProgress = (userQuest?.progress || 0) + increment;
      const completed = newProgress >= req.count;

      return prisma.userQuest.upsert({
        where: { userId_questId: { userId, questId: quest.id } },
        create: { userId, questId: quest.id, progress: increment, completed: increment >= req.count },
        update: { progress: newProgress, completed }
      });
    });

    await Promise.all(upsertOps);
  } catch (error) {
    console.error('Batch: Error updating quest progress:', error.message);
  }
}

// Helper: Check exercise achievements
async function checkExerciseAchievements(userId) {
  try {
    const [exerciseCount, unlockedIds] = await Promise.all([
      prisma.exerciseResult.count({ where: { userId } }),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true }
      })
    ]);

    const allAchievements = await prisma.achievement.findMany({
      where: { category: { in: ['practice', 'accuracy'] } },
      take: 10
    });

    const unlockedSet = new Set(unlockedIds.map(ua => ua.achievementId));
    const pendingAchievements = allAchievements.filter(a => !unlockedSet.has(a.id));
    
    if (pendingAchievements.length === 0) return;
    
    const toCheck = pendingAchievements.slice(0, 2);
    const toUnlock = [];

    for (const achievement of toCheck) {
      try {
        const req = JSON.parse(achievement.requirement);
        if (req.type === 'complete_exercises' && exerciseCount >= req.count) {
          toUnlock.push(achievement);
        }
      } catch { continue; }
    }

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
    console.error('Batch: Error checking achievements:', error.message);
  }
}
