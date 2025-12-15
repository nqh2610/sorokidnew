import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hashPassword } from '@/lib/auth';
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
        createdAt: true,
        totalEXP: true,
        // Đếm số bài học hoàn thành
        progress: {
          where: { completed: true },
          select: { id: true, timeSpent: true }
        },
        // Đếm số thành tích
        achievements: {
          select: { id: true }
        },
        // Đếm số nhiệm vụ hoàn thành
        quests: {
          where: { completed: true },
          select: { id: true }
        },
        // Đếm số trận thi đấu
        competeResults: {
          select: { id: true, correct: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Format users với tier info và thống kê
    const usersWithTier = users.map(user => {
      const completedLessons = user.progress?.length || 0;
      const totalTimeSpent = user.progress?.reduce((sum, p) => sum + (p.timeSpent || 0), 0) || 0;
      const totalAchievements = user.achievements?.length || 0;
      const completedQuests = user.quests?.length || 0;
      const totalMatches = user.competeResults?.length || 0;
      const totalCorrect = user.competeResults?.reduce((sum, r) => sum + (r.correct || 0), 0) || 0;
      
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        level: user.level,
        totalStars: user.totalStars,
        diamonds: user.diamonds,
        streak: user.streak,
        role: user.role,
        tier: user.tier || 'free',
        tierPurchasedAt: user.tierPurchasedAt,
        lastLoginDate: user.lastLoginDate,
        createdAt: user.createdAt,
        totalEXP: user.totalEXP || 0,
        completedLessons,
        totalTimeSpent,
        totalAchievements,
        completedQuests,
        totalMatches,
        totalCorrect,
        activatedAt: user.tierPurchasedAt
      };
    });

    const total = await prisma.user.count({ where });

    // Calculate stats từ users table
    const statsData = await prisma.user.groupBy({
      by: ['tier'],
      _count: { id: true }
    });
    
    let stats = { total: 0, free: 0, basic: 0, advanced: 0, activeToday: 0, newThisWeek: 0 };
    for (const s of statsData) {
      // tier null được coi là free
      const tierName = s.tier || 'free';
      if (stats[tierName] !== undefined) {
        stats[tierName] += s._count.id;
      }
      stats.total += s._count.id;
    }

    // Count active today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    stats.activeToday = await prisma.user.count({
      where: { lastLoginDate: { gte: today } }
    });

    // Count new this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    stats.newThisWeek = await prisma.user.count({
      where: { createdAt: { gte: weekAgo } }
    });

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

// POST /api/admin/users - Tạo user mới
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, username, password, tier } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email và mật khẩu là bắt buộc' }, { status: 400 });
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email đã được sử dụng' }, { status: 400 });
    }

    // Check if username exists (if provided)
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username }
      });
      if (existingUsername) {
        return NextResponse.json({ error: 'Username đã được sử dụng' }, { status: 400 });
      }
    }

    // Hash password (12 rounds từ lib/auth.js)
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        username: username || null,
        tier: tier || 'free',
        tierPurchasedAt: tier && tier !== 'free' ? new Date() : null,
        level: 1,
        totalStars: 0,
        diamonds: 0,
        streak: 0,
        role: 'user'
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        tier: newUser.tier
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
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
