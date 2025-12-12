import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lấy user để check tier
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, tier: true, tierPurchasedAt: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Lấy tất cả levels từ database
    const levels = await prisma.level.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    // Lấy progress của user để tính toán completion
    const userProgress = await prisma.progress.findMany({
      where: { userId: user.id }
    });

    // Lấy số lessons cho mỗi level
    const lessonCounts = await prisma.lesson.groupBy({
      by: ['levelId'],
      _count: { id: true }
    });

    // Tính maxLevel theo tier
    const userTier = user.tier || 'free';
    const maxLevel = TIER_LEVEL_LIMITS[userTier] || TIER_LEVEL_LIMITS.free;

    // Map levels với thông tin lock/progress
    const levelsWithAccess = levels.map(level => {
      // Tính số lessons hoàn thành trong level này
      const levelProgress = userProgress.filter(p => p.levelId === level.id);
      const completedLessons = levelProgress.filter(p => p.completed).length;
      const lessonCount = lessonCounts.find(lc => lc.levelId === level.id)?._count?.id || 0;
      const totalStars = levelProgress.reduce((sum, p) => sum + (p.starsEarned || 0), 0);
      
      // Check xem level có bị lock không
      const isLocked = level.id > maxLevel;
      const requiredTier = level.id <= 5 ? 'free' : level.id <= 10 ? 'basic' : 'advanced';

      return {
        ...level,
        lessonCount,
        completedLessons,
        totalStars,
        isLocked,
        requiredTier,
        progress: lessonCount > 0 ? Math.round((completedLessons / lessonCount) * 100) : 0
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
