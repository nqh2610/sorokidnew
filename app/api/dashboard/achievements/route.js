import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * 🏆 ACHIEVEMENTS API - PHASE 2
 *
 * Load achievements data riêng biệt (on-demand)
 * - Unlocked achievements
 * - Progress on locked achievements
 * - Recent unlocks
 *
 * Tier system (dựa vào độ khó):
 * - common: Dễ đạt (< 10 lessons, < 50 stars, < 3 streak)
 * - rare: Trung bình (10-30 lessons, 50-200 stars, 3-7 streak)
 * - epic: Khó (30-100 lessons, 200-1000 stars, 7-14 streak)
 * - legendary: Rất khó (> 100 lessons, > 1000 stars, > 14 streak)
 */

export async function GET(request) {
  try {
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.NORMAL);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Check cache
    const cacheKey = `achievements:${userId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Query achievements
    const [allAchievements, userAchievements, userProgress] = await Promise.all([
      prisma.achievement.findMany({
        orderBy: { id: 'asc' }
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' }
      }),
      // Get user stats for progress calculation
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          totalStars: true,
          streak: true,
          _count: {
            select: {
              progress: {
                where: { completed: true }
              }
            }
          }
        }
      })
    ]);

    // Map unlocked achievements
    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

    // Format achievements with progress and tier
    const formattedAchievements = allAchievements.map(achievement => {
      const isUnlocked = unlockedIds.has(achievement.id);
      const userAch = userAchievements.find(ua => ua.achievementId === achievement.id);

      // Parse condition để tính tier và progress
      const conditionData = parseCondition(achievement.condition);

      // Calculate progress for locked achievements
      let currentProgress = 0;
      let target = conditionData.value || 1;

      if (!isUnlocked && conditionData.type) {
        const progressResult = calculateProgressWithTarget(conditionData, userProgress);
        currentProgress = progressResult.current;
        target = progressResult.target;
      }

      // Determine tier based on condition difficulty
      const tier = determineTier(conditionData);

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        hint: achievement.hint || null, // Gợi ý khi chưa mở
        icon: achievement.icon,
        category: achievement.category,
        tier,
        reward: achievement.reward,
        unlocked: isUnlocked,
        unlockedAt: userAch?.unlockedAt || null,
        progress: currentProgress,
        target
      };
    });

    // Separate by unlock status
    const unlocked = formattedAchievements.filter(a => a.unlocked);
    const locked = formattedAchievements.filter(a => !a.unlocked);
    
    // Recent unlocks (last 3)
    const recentUnlocks = unlocked.slice(0, 3);

    // Near completion (progress > 70%)
    const nearCompletion = locked
      .filter(a => a.progress >= 70)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);

    // Trả về tất cả achievements (cả unlocked và locked) trong 1 mảng cho component
    // Sort: unlocked trước (theo tier cao nhất), rồi locked (theo progress cao nhất)
    const tierOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };

    const all = [
      ...unlocked.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]),
      ...locked.sort((a, b) => b.progress - a.progress)
    ];

    const response = {
      success: true,
      // Component cần
      total: allAchievements.length,
      unlocked: unlocked.length,
      progress: Math.round((unlocked.length / allAchievements.length) * 100),
      recent: recentUnlocks,
      all, // Tất cả achievements để hiển thị grid
      // Extra data
      nearCompletion
    };

    // Cache 90s (achievements don't change often)
    cache.set(cacheKey, response, 90000);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Dashboard Achievements] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * Parse condition từ DB (có thể là string JSON hoặc object)
 */
function parseCondition(condition) {
  if (!condition) return {};
  try {
    return typeof condition === 'string' ? JSON.parse(condition) : condition;
  } catch {
    return {};
  }
}

/**
 * Tính progress với target cho locked achievement
 */
function calculateProgressWithTarget(condition, userStats) {
  if (!condition || !userStats) return { current: 0, target: 1 };

  const target = condition.value || 1;
  let current = 0;

  switch (condition.type) {
    case 'stars':
      current = userStats.totalStars || 0;
      break;

    case 'streak':
      current = userStats.streak || 0;
      break;

    case 'lessons':
      current = userStats._count?.progress || 0;
      break;

    default:
      current = 0;
  }

  return { current: Math.min(current, target), target };
}

/**
 * Xác định tier dựa vào độ khó của condition
 */
function determineTier(condition) {
  if (!condition || !condition.type || !condition.value) return 'common';

  const value = condition.value;

  switch (condition.type) {
    case 'stars':
      if (value >= 1000) return 'legendary';
      if (value >= 200) return 'epic';
      if (value >= 50) return 'rare';
      return 'common';

    case 'streak':
      if (value >= 14) return 'legendary';
      if (value >= 7) return 'epic';
      if (value >= 3) return 'rare';
      return 'common';

    case 'lessons':
      if (value >= 100) return 'legendary';
      if (value >= 30) return 'epic';
      if (value >= 10) return 'rare';
      return 'common';

    default:
      return 'common';
  }
}
