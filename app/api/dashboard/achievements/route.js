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
        orderBy: { earnedAt: 'desc' }
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

    // Format achievements with progress
    const formattedAchievements = allAchievements.map(achievement => {
      const isUnlocked = unlockedIds.has(achievement.id);
      const userAch = userAchievements.find(ua => ua.achievementId === achievement.id);
      
      // Calculate progress for locked achievements
      let progress = isUnlocked ? 100 : 0;
      if (!isUnlocked && achievement.condition) {
        progress = calculateProgress(achievement, userProgress);
      }

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        reward: achievement.reward,
        isUnlocked,
        earnedAt: userAch?.earnedAt || null,
        progress
      };
    });

    // Separate by category
    const unlocked = formattedAchievements.filter(a => a.isUnlocked);
    const locked = formattedAchievements.filter(a => !a.isUnlocked);
    
    // Recent unlocks (last 3)
    const recentUnlocks = unlocked.slice(0, 3);

    // Near completion (progress > 70%)
    const nearCompletion = locked
      .filter(a => a.progress >= 70)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);

    const response = {
      success: true,
      unlocked,
      locked,
      recentUnlocks,
      nearCompletion,
      stats: {
        totalUnlocked: unlocked.length,
        totalAchievements: allAchievements.length,
        percentComplete: Math.round((unlocked.length / allAchievements.length) * 100)
      }
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
 * Calculate progress percentage for locked achievement
 */
function calculateProgress(achievement, userStats) {
  if (!achievement.condition || !userStats) return 0;

  const condition = typeof achievement.condition === 'string' 
    ? JSON.parse(achievement.condition) 
    : achievement.condition;

  try {
    switch (condition.type) {
      case 'stars':
        return Math.min(100, Math.round((userStats.totalStars / condition.value) * 100));
      
      case 'streak':
        return Math.min(100, Math.round((userStats.streak / condition.value) * 100));
      
      case 'lessons':
        const completed = userStats._count?.progress || 0;
        return Math.min(100, Math.round((completed / condition.value) * 100));
      
      default:
        return 0;
    }
  } catch {
    return 0;
  }
}
