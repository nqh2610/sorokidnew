import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import cache, { CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET /api/admin/quests - Lấy danh sách nhiệm vụ
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
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    // 🔧 Cache cho kết quả (30s - admin data cần fresh)
    const cacheKey = `admin_quests_${type || 'all'}_${category || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const where = {};
    if (type) where.type = type;
    
    // 🔧 FIX: Map category filter để hỗ trợ cả tên cũ và mới
    if (category) {
      // Map "learn" sang các categories liên quan trong DB
      const categoryMapping = {
        'learn': ['learn', 'lesson', 'mastery'],
        'practice': ['practice', 'accuracy'],
        'compete': ['compete'],
        'social': ['social'],
        'streak': ['streak']
      };
      
      const mappedCategories = categoryMapping[category] || [category];
      where.category = { in: mappedCategories };
    }

    // 🔧 FIX N+1: Dùng groupBy thay vì query từng quest
    const [quests, completedStats, claimedStats] = await Promise.all([
      prisma.quest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { users: true } } }
      }),
      // GroupBy cho completed counts - 1 query thay vì N queries
      prisma.userQuest.groupBy({
        by: ['questId'],
        _count: { id: true },
        where: { completed: true }
      }),
      // GroupBy cho claimed counts - 1 query thay vì N queries
      prisma.userQuest.groupBy({
        by: ['questId'],
        _count: { id: true },
        where: { claimedAt: { not: null } }
      })
    ]);

    // 🔧 Tạo Map để lookup O(1) thay vì O(n)
    const completedMap = new Map(completedStats.map(s => [s.questId, s._count.id]));
    const claimedMap = new Map(claimedStats.map(s => [s.questId, s._count.id]));

    // Map quests với stats
    const questsWithStats = quests.map(quest => ({
      ...quest,
      requirement: JSON.parse(quest.requirement || '{}'),
      totalUsers: quest._count.users,
      completedCount: completedMap.get(quest.id) || 0,
      claimedCount: claimedMap.get(quest.id) || 0
    }));

    // Thống kê tổng
    const stats = {
      total: quests.length,
      active: quests.filter(q => q.isActive).length,
      daily: quests.filter(q => q.type === 'daily').length,
      weekly: quests.filter(q => q.type === 'weekly').length,
      special: quests.filter(q => q.type === 'special').length
    };

    const result = { quests: questsWithStats, stats };
    cache.set(cacheKey, result, CACHE_TTL.SHORT); // 30s cache

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/quests - Tạo nhiệm vụ mới
export async function POST(request) {
  try {
    // 🔧 Rate limiting cho admin write
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
    if (rateLimitError) return rateLimitError;

    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔧 Invalidate cache khi tạo mới
    cache.deletePattern('admin_quests_');
    cache.deletePattern('quests');

    const data = await request.json();
    const { title, description, type, category, requirement, stars, diamonds, expiresAt, isActive } = data;

    // Validate required fields
    if (!title || !description || !type || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate type
    if (!['daily', 'weekly', 'special'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be: daily, weekly, special' }, { status: 400 });
    }

    // Validate category - hỗ trợ tất cả categories trong database
    const validCategories = ['learn', 'lesson', 'practice', 'compete', 'social', 'streak', 'accuracy', 'mastery'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }, { status: 400 });
    }

    // Validate requirement JSON
    let requirementJson;
    try {
      requirementJson = typeof requirement === 'string' ? JSON.parse(requirement) : requirement;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid requirement JSON' }, { status: 400 });
    }

    const quest = await prisma.quest.create({
      data: {
        title,
        description,
        type,
        category,
        requirement: JSON.stringify(requirementJson),
        stars: parseInt(stars) || 50,
        diamonds: parseInt(diamonds) || 10,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== false
      }
    });

    return NextResponse.json({ 
      success: true, 
      quest: { ...quest, requirement: requirementJson }
    });
  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/quests - Cập nhật nhiệm vụ
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, title, description, type, category, requirement, stars, diamonds, expiresAt, isActive } = data;

    if (!id) {
      return NextResponse.json({ error: 'Quest ID required' }, { status: 400 });
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
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (requirementJson) updateData.requirement = JSON.stringify(requirementJson);
    if (stars !== undefined) updateData.stars = parseInt(stars);
    if (diamonds !== undefined) updateData.diamonds = parseInt(diamonds);
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const quest = await prisma.quest.update({
      where: { id },
      data: updateData
    });

    // 🔧 FIX: Clear cache sau khi cập nhật quest
    cache.deletePattern('admin_quests_');
    cache.deletePattern('quests');

    return NextResponse.json({
      success: true,
      quest: { ...quest, requirement: JSON.parse(quest.requirement || '{}') }
    });
  } catch (error) {
    console.error('Error updating quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/quests - Xóa nhiệm vụ
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Quest ID required' }, { status: 400 });
    }

    // Xóa user_quests liên quan trước
    await prisma.userQuest.deleteMany({
      where: { questId: id }
    });

    await prisma.quest.delete({
      where: { id }
    });

    // 🔧 FIX: Clear cache sau khi xóa quest
    cache.deletePattern('admin_quests_');
    cache.deletePattern('quests');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
