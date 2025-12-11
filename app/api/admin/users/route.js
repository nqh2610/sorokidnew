import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/users - Lấy danh sách người dùng
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } }
      ];
    }
    
    // Filter by tier (tier được lưu trực tiếp trong users table)
    if (filter !== 'all') {
      where.tier = filter;
    }

    // Get users with tier directly from users table
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        level: true,
        totalStars: true,
        diamonds: true,
        streak: true,
        role: true,
        tier: true,
        tierPurchasedAt: true,
        lastLoginDate: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Format users với tier info
    const usersWithTier = users.map(user => ({
      ...user,
      tier: user.tier || 'free',
      activatedAt: user.tierPurchasedAt
    }));

    const total = await prisma.user.count({ where });

    // Calculate stats từ users table
    const statsData = await prisma.user.groupBy({
      by: ['tier'],
      _count: { id: true }
    });
    
    let stats = { total: 0, free: 0, basic: 0, advanced: 0 };
    for (const s of statsData) {
      // tier null được coi là free
      const tierName = s.tier || 'free';
      if (stats[tierName] !== undefined) {
        stats[tierName] += s._count.id;
      }
      stats.total += s._count.id;
    }

    return NextResponse.json({
      users: usersWithTier,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/users - Cập nhật user
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, updates } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Allowed fields to update
    const allowedFields = ['name', 'role', 'totalStars', 'diamonds', 'level'];
    const filteredUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: filteredUpdates
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
