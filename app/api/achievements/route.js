import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getOrSet, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET /api/achievements
export async function GET(request) {
  try {
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
    const category = searchParams.get('category');

    // 🔧 TỐI ƯU: Cache achievements (static data) + parallel query
    const [achievements, userAchievements] = await Promise.all([
      getOrSet(
        `${CACHE_KEYS.ACHIEVEMENTS}_${category || 'all'}`,
        async () => {
          const where = category ? { category } : {};
          return prisma.achievement.findMany({
            where,
            select: {
              id: true,
              name: true,
              description: true,
              icon: true,
              category: true,
              requirement: true,
              stars: true,
              diamonds: true
            },
            orderBy: { createdAt: 'asc' }
          });
        },
        CACHE_TTL.STATIC // 1 hour - achievements rarely change
      ),
      prisma.userAchievement.findMany({
        where: { userId: session.user.id },
        select: { achievementId: true, unlockedAt: true }
      })
    ]);

    // 🔧 TỐI ƯU: Dùng Map và Set thay vì Array.includes()
    const unlockedSet = new Set(userAchievements.map(ua => ua.achievementId));
    const unlockedMap = new Map(userAchievements.map(ua => [ua.achievementId, ua.unlockedAt]));

    const achievementsWithStatus = achievements.map(achievement => {
      // Safe JSON parse
      let requirement = {};
      try {
        requirement = achievement.requirement ? JSON.parse(achievement.requirement) : {};
      } catch (e) {
        requirement = {};
      }
      return {
        ...achievement,
        requirement,
        unlocked: unlockedSet.has(achievement.id),
        unlockedAt: unlockedMap.get(achievement.id) || null
      };
    });

    return NextResponse.json({ achievements: achievementsWithStatus });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
