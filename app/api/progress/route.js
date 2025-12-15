import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateLessonStars, getLevelInfo, checkLevelUp } from '@/lib/gamification';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { invalidateUserCache } from '@/lib/cache';
import { withApiProtection, withTimeout } from '@/lib/apiWrapper';

export const dynamic = 'force-dynamic';

// POST /api/progress - Save lesson progress
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
    const { levelId, lessonId, completed, starsEarned, timeSpent, accuracy } = body;

    // Validate input
    if (!levelId || !lessonId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 🔧 TỐI ƯU: Batch queries với Promise.all
    const [currentUser, existingProgress] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, totalStars: true, streak: true, level: true }
      }),
      prisma.progress.findUnique({
        where: {
          userId_levelId_lessonId: {
            userId: session.user.id,
            levelId: parseInt(levelId),
            lessonId: parseInt(lessonId)
          }
        },
        select: { starsEarned: true, accuracy: true }
      })
    ]);

    // Đếm số lần làm bài này (cho bonus chăm chỉ)
    const attemptCount = existingProgress ? 2 : 1; // Simplified

    const oldLessonStars = existingProgress?.starsEarned || 0;
    const newLessonStars = starsEarned || 0;
    
    // Chỉ cập nhật sao bài học nếu đạt được nhiều sao hơn lần trước
    const shouldUpdateLessonStars = newLessonStars > oldLessonStars;
    const lessonStarsToSave = shouldUpdateLessonStars ? newLessonStars : oldLessonStars;

    // Tính SAO ⭐ kiếm được từ bài học này
    const standardTime = 300; // 5 phút = 300 giây (thời gian chuẩn)
    const starsResult = calculateLessonStars(
      newLessonStars,
      accuracy || 0,
      timeSpent || 0,
      standardTime,
      currentUser?.streak || 0,
      attemptCount
    );

    // Luôn cộng sao khi hoàn thành bài (khuyến khích làm lại)
    const starsToAdd = completed ? starsResult.totalStars : 0;

    // Upsert progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_levelId_lessonId: {
          userId: session.user.id,
          levelId: parseInt(levelId),
          lessonId: parseInt(lessonId)
        }
      },
      update: {
        completed: completed || false,
        starsEarned: lessonStarsToSave,
        timeSpent: (timeSpent || 0),
        accuracy: shouldUpdateLessonStars ? (accuracy || 0) : (existingProgress?.accuracy || 0),
        completedAt: completed ? new Date() : null
      },
      create: {
        userId: session.user.id,
        levelId: parseInt(levelId),
        lessonId: parseInt(lessonId),
        completed: completed || false,
        starsEarned: newLessonStars,
        timeSpent: timeSpent || 0,
        accuracy: accuracy || 0,
        completedAt: completed ? new Date() : null
      }
    });

    // Cập nhật user stars nếu cần
    let levelUpInfo = null;
    if (completed && starsToAdd > 0) {
      const oldTotalStars = currentUser?.totalStars || 0;
      const newTotalStars = oldTotalStars + starsToAdd;
      
      // Tính level mới từ tổng sao
      const newLevelInfo = getLevelInfo(newTotalStars);
      
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalStars: { increment: starsToAdd },
          level: newLevelInfo.level
        }
      });

      // Kiểm tra lên level
      levelUpInfo = checkLevelUp(oldTotalStars, newTotalStars);

      // 🔧 FIX: Check achievements SYNC (await) để không để process treo
      // Giới hạn thời gian check để không block response quá lâu
      try {
        await Promise.race([
          checkAchievements(session.user.id),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Achievement check timeout')), 3000))
        ]);
      } catch (e) {
        // Timeout hoặc error - log và tiếp tục (không block user)
        console.warn('Achievement check skipped:', e.message);
      }
    }

    // Lấy thông tin level hiện tại
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    const levelInfo = getLevelInfo(updatedUser?.totalStars || 0);

    return NextResponse.json({ 
      progress, 
      success: true,
      isNewRecord: shouldUpdateLessonStars,
      oldLessonStars,
      newLessonStars: lessonStarsToSave,
      // Thông tin SAO kiếm được
      starsEarned: starsToAdd,
      starsBreakdown: starsResult.breakdown,
      // Thông tin Level
      levelInfo,
      levelUp: levelUpInfo
    });
}, { timeout: 15000, useCircuitBreaker: true }); // 15s timeout

// GET /api/progress
export const GET = withTimeout(async (request) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const progress = await prisma.progress.findMany({
    where: { userId: session.user.id },
    orderBy: [{ levelId: 'asc' }, { lessonId: 'asc' }]
  });

  // Calculate statistics by level
  const statsByLevel = {};
  progress.forEach(p => {
    if (!statsByLevel[p.levelId]) {
      statsByLevel[p.levelId] = {
        total: 0,
        completed: 0,
          totalStars: 0,
          totalTime: 0,
          avgAccuracy: 0
        };
      }
      statsByLevel[p.levelId].total++;
      if (p.completed) statsByLevel[p.levelId].completed++;
      statsByLevel[p.levelId].totalStars += p.starsEarned;
      statsByLevel[p.levelId].totalTime += p.timeSpent;
      statsByLevel[p.levelId].avgAccuracy += p.accuracy;
    });

    // Calculate averages
    Object.keys(statsByLevel).forEach(levelId => {
      const stats = statsByLevel[levelId];
      stats.avgAccuracy = stats.total > 0 ? stats.avgAccuracy / stats.total : 0;
      stats.progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    });

    return NextResponse.json({ progress, statsByLevel });
}, 10000); // 10s timeout

// Helper function to check achievements
// 🔧 TỐI ƯU: Giảm queries và thêm early return
async function checkAchievements(userId) {
  try {
    // 🔧 FIX: Query nhẹ hơn - chỉ lấy fields cần thiết
    const [user, unlockedIds, allAchievements] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          streak: true,
          _count: {
            select: {
              progress: { where: { completed: true } },
              exercises: true
            }
          }
        }
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true }
      }),
      prisma.achievement.findMany({
        select: { id: true, name: true, requirement: true, stars: true, diamonds: true }
      })
    ]);

    if (!user) return;

    const unlockedSet = new Set(unlockedIds.map(ua => ua.achievementId));
    const pendingAchievements = allAchievements.filter(a => !unlockedSet.has(a.id));
    
    // 🔧 FIX: Early return nếu không có achievement mới để check
    if (pendingAchievements.length === 0) return;
    
    // 🔧 FIX: Giới hạn chỉ check 3 achievements mỗi lần để không block
    const achievementsToCheck = pendingAchievements.slice(0, 3);
    const achievementsToUnlock = [];

    for (const achievement of achievementsToCheck) {
      // 🔧 Safe JSON parse với fallback
      let req = {};
      try {
        req = achievement.requirement ? JSON.parse(achievement.requirement) : {};
      } catch (e) {
        console.error(`Failed to parse achievement requirement ${achievement.id}:`, e.message);
        continue;
      }
      
      let shouldUnlock = false;

      switch (req.type) {
        case 'complete_lessons':
          shouldUnlock = user._count.progress >= req.count;
          break;
        case 'streak':
          shouldUnlock = user.streak >= req.count;
          break;
        case 'complete_exercises':
          shouldUnlock = user._count.exercises >= req.count;
          break;
        // Skip complex checks to keep it fast
        default:
          continue;
      }

      if (shouldUnlock) {
        achievementsToUnlock.push(achievement);
      }
    }

    // 🔧 FIX: Batch create achievements
    if (achievementsToUnlock.length > 0) {
      await prisma.$transaction([
        ...achievementsToUnlock.map(achievement => 
          prisma.userAchievement.create({
            data: { userId: user.id, achievementId: achievement.id }
          })
        ),
        prisma.user.update({
          where: { id: user.id },
          data: {
            totalStars: { 
              increment: achievementsToUnlock.reduce((sum, a) => sum + (a.stars || 0), 0)
            },
            diamonds: { 
              increment: achievementsToUnlock.reduce((sum, a) => sum + (a.diamonds || 0), 0)
            }
          }
        })
      ]);
    }
  } catch (error) {
    // 🔧 FIX: Fail fast - không propagate error
    console.error('Error checking achievements:', error.message);
  }
}
