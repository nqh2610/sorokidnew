import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import cache, { CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET /api/admin/achievements - Lấy danh sách thành tích
export async function GET(request) {
  try {
    // 🔧 Rate limiting cho admin endpoint
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.MODERATE);
    if (rateLimitError) return rateLimitError;

    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where = category ? { category } : {};

    // 🔧 Parallel queries thay vì sequential
    const [achievements, totalUsers] = await Promise.all([
      prisma.achievement.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        include: { _count: { select: { users: true } } }
      }),
      prisma.user.count()
    ]);

    const achievementsWithStats = achievements.map(achievement => ({
      ...achievement,
      requirement: JSON.parse(achievement.requirement || '{}'),
      unlockedCount: achievement._count.users,
      unlockRate: totalUsers > 0 ? Math.round((achievement._count.users / totalUsers) * 100) : 0
    }));

    // Thống kê tổng
    const stats = {
      total: achievements.length,
      categories: {
        learning: achievements.filter(a => a.category === 'learning').length,
        practice: achievements.filter(a => a.category === 'practice').length,
        compete: achievements.filter(a => a.category === 'compete').length,
        streak: achievements.filter(a => a.category === 'streak').length,
        social: achievements.filter(a => a.category === 'social').length
      },
      totalUsers
    };

    return NextResponse.json({ achievements: achievementsWithStats, stats });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/achievements - Tạo thành tích mới
export async function POST(request) {
  try {
    // 🔧 Rate limiting cho admin write
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
    if (rateLimitError) return rateLimitError;

    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, icon, category, requirement, stars, diamonds } = data;

    // Validate required fields
    if (!name || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate category
    if (!['learning', 'practice', 'compete', 'streak', 'social'].includes(category)) {
      return NextResponse.json({ error: 'Invalid category. Must be: learning, practice, compete, streak, social' }, { status: 400 });
    }

    // Check duplicate name
    const existing = await prisma.achievement.findUnique({
      where: { name }
    });
    if (existing) {
      return NextResponse.json({ error: 'Achievement name already exists' }, { status: 400 });
    }

    // Validate requirement JSON
    let requirementJson;
    try {
      requirementJson = typeof requirement === 'string' ? JSON.parse(requirement) : requirement;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid requirement JSON' }, { status: 400 });
    }

    const achievement = await prisma.achievement.create({
      data: {
        name,
        description,
        icon: icon || '🏆',
        category,
        requirement: JSON.stringify(requirementJson),
        stars: parseInt(stars) || 0,
        diamonds: parseInt(diamonds) || 0
      }
    });

    // 🔧 FIX: Clear cache sau khi tạo achievement
    cache.deletePattern('achievements');

    return NextResponse.json({ 
      success: true, 
      achievement: { ...achievement, requirement: requirementJson }
    });
  } catch (error) {
    console.error('Error creating achievement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/achievements - Cập nhật thành tích
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, name, description, icon, category, requirement, stars, diamonds } = data;

    if (!id) {
      return NextResponse.json({ error: 'Achievement ID required' }, { status: 400 });
    }

    // Validate requirement JSON if provided
    let requirementJson;
    if (requirement) {
      try {
        requirementJson = typeof requirement === 'string' ? JSON.parse(requirement) : requirement;
      } catch (e) {
        return NextResponse.json({ error: 'Invalid requirement JSON' }, { status: 400 });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (icon) updateData.icon = icon;
    if (category) updateData.category = category;
    if (requirementJson) updateData.requirement = JSON.stringify(requirementJson);
    if (stars !== undefined) updateData.stars = parseInt(stars);
    if (diamonds !== undefined) updateData.diamonds = parseInt(diamonds);

    const achievement = await prisma.achievement.update({
      where: { id },
      data: updateData
    });

    // 🔧 FIX: Clear cache sau khi cập nhật achievement
    cache.deletePattern('achievements');

    return NextResponse.json({ 
      success: true, 
      achievement: { ...achievement, requirement: JSON.parse(achievement.requirement) }
    });
  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/achievements - Xóa thành tích
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Achievement ID required' }, { status: 400 });
    }

    // Xóa user_achievements liên quan trước
    await prisma.userAchievement.deleteMany({
      where: { achievementId: id }
    });

    await prisma.achievement.delete({
      where: { id }
    });

    // 🔧 FIX: Clear cache sau khi xóa achievement
    cache.deletePattern('achievements');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
