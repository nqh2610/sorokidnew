import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/achievements
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where = category ? { category } : {};

    const achievements = await prisma.achievement.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    // Get user achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id }
    });

    const unlockedIds = userAchievements.map(ua => ua.achievementId);
    const unlockedMap = {};
    userAchievements.forEach(ua => {
      unlockedMap[ua.achievementId] = ua.unlockedAt;
    });

    const achievementsWithStatus = achievements.map(achievement => ({
      ...achievement,
      requirement: JSON.parse(achievement.requirement),
      unlocked: unlockedIds.includes(achievement.id),
      unlockedAt: unlockedMap[achievement.id] || null
    }));

    return NextResponse.json({ achievements: achievementsWithStatus });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
