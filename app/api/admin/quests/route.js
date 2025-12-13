import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/quests - Lấy danh sách nhiệm vụ
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    const where = {};
    if (type) where.type = type;
    if (category) where.category = category;

    const quests = await prisma.quest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    // Lấy thống kê hoàn thành
    const questsWithStats = await Promise.all(quests.map(async (quest) => {
      const completedCount = await prisma.userQuest.count({
        where: { questId: quest.id, completed: true }
      });
      const claimedCount = await prisma.userQuest.count({
        where: { questId: quest.id, claimedAt: { not: null } }
      });

      return {
        ...quest,
        requirement: JSON.parse(quest.requirement || '{}'),
        totalUsers: quest._count.users,
        completedCount,
        claimedCount
      };
    }));

    // Thống kê tổng
    const stats = {
      total: quests.length,
      active: quests.filter(q => q.isActive).length,
      daily: quests.filter(q => q.type === 'daily').length,
      weekly: quests.filter(q => q.type === 'weekly').length,
      special: quests.filter(q => q.type === 'special').length
    };

    return NextResponse.json({ quests: questsWithStats, stats });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/quests - Tạo nhiệm vụ mới
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Validate category
    if (!['learn', 'practice', 'compete', 'social'].includes(category)) {
      return NextResponse.json({ error: 'Invalid category. Must be: learn, practice, compete, social' }, { status: 400 });
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

    return NextResponse.json({ 
      success: true, 
      quest: { ...quest, requirement: JSON.parse(quest.requirement) }
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
