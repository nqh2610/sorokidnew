import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/trial-users - Lấy danh sách user đang/đã hết trial
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all'; // 'active', 'expired', 'all'
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    const now = new Date();

    // Build where clause
    let whereClause = {
      trialExpiresAt: { not: null }
    };

    if (status === 'active') {
      whereClause.trialExpiresAt = { gt: now };
    } else if (status === 'expired') {
      whereClause.trialExpiresAt = { lte: now };
    }

    // Thêm điều kiện chỉ lấy user free (chưa mua gói)
    whereClause.tier = 'free';

    // Lấy danh sách user
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          tier: true,
          trialExpiresAt: true,
          createdAt: true,
          lastLoginDate: true
        },
        orderBy: { trialExpiresAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ]);

    // Thống kê
    const [activeCount, expiredCount, totalTrialUsers] = await Promise.all([
      prisma.user.count({
        where: {
          trialExpiresAt: { gt: now },
          tier: 'free'
        }
      }),
      prisma.user.count({
        where: {
          trialExpiresAt: { lte: now, not: null },
          tier: 'free'
        }
      }),
      prisma.user.count({
        where: {
          trialExpiresAt: { not: null },
          tier: 'free'
        }
      })
    ]);

    // Tính số ngày còn lại cho mỗi user
    const usersWithDays = users.map(user => {
      const trialEnd = new Date(user.trialExpiresAt);
      const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
      return {
        ...user,
        daysRemaining: Math.max(0, daysRemaining),
        isActive: daysRemaining > 0
      };
    });

    return NextResponse.json({
      users: usersWithDays,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        active: activeCount,
        expired: expiredCount,
        total: totalTrialUsers
      }
    });
  } catch (error) {
    console.error('Error fetching trial users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/trial-users - Cấp trial thủ công cho user
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, trialDays } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    if (!trialDays || trialDays < 1 || trialDays > 365) {
      return NextResponse.json({ error: 'trialDays must be between 1 and 365' }, { status: 400 });
    }

    // Kiểm tra user tồn tại
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, tier: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Chỉ cấp trial cho user free
    if (user.tier !== 'free') {
      return NextResponse.json({ error: 'User already has a paid tier' }, { status: 400 });
    }

    // Cấp trial
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + trialDays);

    await prisma.user.update({
      where: { id: userId },
      data: { trialExpiresAt }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Granted ${trialDays} days trial`,
      trialExpiresAt 
    });
  } catch (error) {
    console.error('Error granting trial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
