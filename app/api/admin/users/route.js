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
        { username: { contains: search } },
        { phone: { contains: search } }
      ];
    }
    
    // Filter by tier (tier được lưu trực tiếp trong users table)
    if (filter !== 'all') {
      where.tier = filter;
    }

    // Get users with tier directly from users table
    // 🔧 TỐI ƯU: Chỉ dùng _count, KHÔNG load full records
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        phone: true,
        avatar: true,
        level: true,
        totalStars: true,
        diamonds: true,
        streak: true,
        role: true,
        tier: true,
        tierPurchasedAt: true,
        trialExpiresAt: true,
        lastLoginDate: true,
        createdAt: true,
        // 🔧 TỐI ƯU: Chỉ dùng _count - KHÔNG load full records
        _count: {
          select: {
            progress: true,
            achievements: true,
            quests: true,
            competeResults: true,
            certificates: true,
            exercises: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // 🔧 TỐI ƯU: Aggregate query riêng - chỉ 2 queries thay vì load hàng nghìn records
    const userIds = users.map(u => u.id);

    const [competeAggregates, exerciseAggregates] = await Promise.all([
      // Tổng câu đúng từ thi đấu - GROUP BY userId
      prisma.competeResult.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _sum: { correct: true }
      }),
      // Thống kê exercises - GROUP BY userId
      prisma.exerciseResult.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _count: { _all: true },
        _sum: { timeTaken: true }
      })
    ]);

    // Đếm số bài đúng riêng (vì groupBy không hỗ trợ where trong _count)
    const correctExerciseCounts = await prisma.exerciseResult.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, isCorrect: true },
      _count: { _all: true }
    });

    // Map aggregates để lookup nhanh
    const competeMap = new Map(competeAggregates.map(a => [a.userId, a._sum.correct || 0]));
    const exerciseMap = new Map(exerciseAggregates.map(a => [a.userId, {
      count: a._count._all,
      totalTime: a._sum.timeTaken || 0
    }]));
    const correctMap = new Map(correctExerciseCounts.map(a => [a.userId, a._count._all]));

    // Format users với tier info và thống kê
    const usersWithTier = users.map(user => {
      // 🔧 TỐI ƯU: Lấy từ aggregate maps thay vì load records
      const totalCorrect = competeMap.get(user.id) || 0;

      // 🔧 TỐI ƯU: Lấy từ aggregate maps
      const exerciseStats = exerciseMap.get(user.id) || { count: 0, totalTime: 0 };
      const totalExercises = exerciseStats.count;
      const correctExercises = correctMap.get(user.id) || 0;
      const accuracy = totalExercises > 0
        ? Math.round((correctExercises / totalExercises) * 100)
        : 0;

      // timeTaken có thể lưu bằng ms hoặc giây - normalize về giây
      let avgSpeedRaw = totalExercises > 0 ? exerciseStats.totalTime / totalExercises : 0;
      const avgSpeed = avgSpeedRaw > 100
        ? Math.round(avgSpeedRaw / 1000 * 10) / 10  // ms -> giây
        : Math.round(avgSpeedRaw * 10) / 10;         // đã là giây

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        level: user.level,
        totalStars: user.totalStars,
        diamonds: user.diamonds,
        streak: user.streak,
        role: user.role,
        tier: user.tier || 'free',
        tierPurchasedAt: user.tierPurchasedAt,
        trialExpiresAt: user.trialExpiresAt,
        lastLoginDate: user.lastLoginDate,
        createdAt: user.createdAt,
        // 🔧 TỐI ƯU: Lấy từ _count
        completedLessons: user._count.progress,
        totalAchievements: user._count.achievements,
        completedQuests: user._count.quests,
        totalMatches: user._count.competeResults,
        totalCertificates: user._count.certificates,
        totalCorrect,
        activatedAt: user.tierPurchasedAt,
        // 🔥 Thêm thống kê luyện tập
        totalExercises,
        correctExercises,
        accuracy,        // Độ chính xác (%)
        avgSpeed         // Tốc độ trung bình (giây/bài)
      };
    });

    // 🔧 TỐI ƯU: Gộp tất cả stats queries vào Promise.all
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [total, statsData, activeToday, newThisWeek] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.groupBy({
        by: ['tier'],
        _count: { id: true }
      }),
      prisma.user.count({
        where: { lastLoginDate: { gte: today } }
      }),
      prisma.user.count({
        where: { createdAt: { gte: weekAgo } }
      })
    ]);

    let stats = { total: 0, free: 0, basic: 0, advanced: 0, activeToday, newThisWeek };
    for (const s of statsData) {
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

// POST /api/admin/users - Tạo user mới
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, username, phone, password, tier } = await request.json();

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
        phone: phone || null,
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
