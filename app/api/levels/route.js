import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getOrSet } from '@/lib/cache';

export const dynamic = 'force-dynamic';

/**
 * Chính sách tier cho levels:
 * - free: Level 1-5
 * - basic: Level 1-10
 * - advanced/vip: Tất cả levels (1-18)
 */
const TIER_LEVEL_LIMITS = {
  free: 5,
  basic: 10,
  advanced: 18,
  vip: 18
};

// GET /api/levels - Lấy danh sách levels
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

    // 🔧 TỐI ƯU: Cache levels và lesson counts (tĩnh, không thay đổi)
    const [levels, lessonCounts] = await Promise.all([
      getOrSet('all_levels', async () => {
        return prisma.level.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            order: true
          },
          orderBy: { order: 'asc' }
        });
      }, 300), // Cache 5 phút
      getOrSet('lesson_counts', async () => {
        return prisma.lesson.groupBy({
          by: ['levelId'],
          _count: { id: true }
        });
      }, 300) // Cache 5 phút
    ]);

    // 🔧 TỐI ƯU: Lấy user và progress song song
    const [user, userProgress] = await Promise.all([
      prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, tier: true }
      }),
      prisma.progress.findMany({
        where: { userId: session.user.id },
        select: { levelId: true, completed: true, starsEarned: true }
      })
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Tính maxLevel theo tier
    const userTier = user.tier || 'free';
    const maxLevel = TIER_LEVEL_LIMITS[userTier] || TIER_LEVEL_LIMITS.free;

    // 🔧 TỐI ƯU: Dùng Map để lookup nhanh hơn
    const lessonCountMap = new Map(lessonCounts.map(lc => [lc.levelId, lc._count.id]));
    const progressByLevel = new Map();
    
    for (const p of userProgress) {
      if (!progressByLevel.has(p.levelId)) {
        progressByLevel.set(p.levelId, { completed: 0, stars: 0 });
      }
      const levelData = progressByLevel.get(p.levelId);
      if (p.completed) levelData.completed++;
      levelData.stars += p.starsEarned || 0;
    }

    // Map levels với thông tin lock/progress
    const levelsWithAccess = levels.map(level => {
      const levelProgress = progressByLevel.get(level.id) || { completed: 0, stars: 0 };
      const lessonCount = lessonCountMap.get(level.id) || 0;
      
      const isLocked = level.id > maxLevel;
      const requiredTier = level.id <= 5 ? 'free' : level.id <= 10 ? 'basic' : 'advanced';

      return {
        ...level,
        lessonCount,
        completedLessons: levelProgress.completed,
        totalStars: levelProgress.stars,
        isLocked,
        requiredTier,
        progress: lessonCount > 0 ? Math.round((levelProgress.completed / lessonCount) * 100) : 0
      };
    });

    return NextResponse.json({ 
      levels: levelsWithAccess,
      userTier,
      maxLevel
    });
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
