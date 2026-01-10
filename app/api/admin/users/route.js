import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hashPassword } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 🎮 Import game config để tính tiến độ
import { GAME_STAGES, GAME_ZONES } from '@/config/adventure-stages-addsub.config';
import { GAME_STAGES_MULDIV, GAME_ZONES_MULDIV } from '@/config/adventure-stages-muldiv.config';

/**
 * 🎮 Tính tiến độ game cho tất cả users từ data đã fetch
 * Không cần bảng mới - dùng progress, exercises, compete, certificates
 */
function calculateGameProgress(userIds, allProgress, allExercises, allCompete, allCerts) {
  const resultMap = new Map();
  
  // Group data by userId để lookup nhanh
  const progressByUser = new Map();
  const exercisesByUser = new Map();
  const competeByUser = new Map();
  const certsByUser = new Map();
  
  allProgress.forEach(p => {
    if (!progressByUser.has(p.userId)) progressByUser.set(p.userId, []);
    progressByUser.get(p.userId).push(p);
  });
  
  allExercises.forEach(e => {
    if (!exercisesByUser.has(e.userId)) exercisesByUser.set(e.userId, []);
    exercisesByUser.get(e.userId).push(e);
  });
  
  allCompete.forEach(c => {
    if (!competeByUser.has(c.userId)) competeByUser.set(c.userId, []);
    competeByUser.get(c.userId).push(c);
  });
  
  allCerts.forEach(c => {
    if (!certsByUser.has(c.userId)) certsByUser.set(c.userId, []);
    certsByUser.get(c.userId).push(c);
  });
  
  // Tính cho mỗi user
  for (const userId of userIds) {
    const userProgress = progressByUser.get(userId) || [];
    const userExercises = exercisesByUser.get(userId) || [];
    const userCompete = competeByUser.get(userId) || [];
    const userCerts = certsByUser.get(userId) || [];
    
    // 🎮 hasPlayed = true nếu có BẤT KỲ hoạt động nào
    const hasPlayed = userProgress.length > 0 || userExercises.length > 0 || userCompete.length > 0;
    
    // Tạo completion maps
    const completedLessons = new Map();
    const startedLessons = new Map(); // Lessons đã bắt đầu (dù chưa complete)
    userProgress.forEach(p => {
      const key = `${p.levelId}-${p.lessonId}`;
      startedLessons.set(key, true);
      if (p.completed) {
        completedLessons.set(key, true);
      }
    });
    
    // Map exercises thành sets
    const passedExercises = new Set();
    const attemptedExercises = new Set(); // Đã thử (dù đúng hay sai)
    userExercises.forEach(e => {
      attemptedExercises.add(`${e.exerciseType}-${e.difficulty}`);
      if (e.isCorrect) {
        passedExercises.add(`${e.exerciseType}-${e.difficulty}`);
      }
    });
    
    // Map compete results
    const passedArenas = new Set();
    const attemptedArenas = new Set(); // Đã thi (dù pass hay fail)
    userCompete.forEach(c => {
      attemptedArenas.add(c.arenaId);
      if (c.correct >= 8) { // 8/10 correct = pass
        passedArenas.add(c.arenaId);
      }
    });
    
    // Map certs
    const earnedCerts = new Set(userCerts.map(c => c.certType));
    
    // Tính highest stage cho AddSub và MulDiv
    let highestAddSub = 0;
    let highestMulDiv = 0;
    let totalCompleted = 0;
    let currentStage = 0; // Stage đang làm (chưa hoàn thành)
    
    // Check AddSub stages (1-88)
    for (const stage of GAME_STAGES) {
      if (checkStageCompleted(stage, completedLessons, passedExercises, passedArenas, earnedCerts)) {
        highestAddSub = Math.max(highestAddSub, stage.stage);
        totalCompleted++;
      } else if (checkStageStarted(stage, startedLessons, attemptedExercises, attemptedArenas)) {
        // Stage đã bắt đầu nhưng chưa hoàn thành
        currentStage = Math.max(currentStage, stage.stage);
      }
    }
    
    // Check MulDiv stages (89-138)
    for (const stage of GAME_STAGES_MULDIV) {
      if (checkStageCompleted(stage, completedLessons, passedExercises, passedArenas, earnedCerts)) {
        highestMulDiv = Math.max(highestMulDiv, stage.stage);
        totalCompleted++;
      } else if (checkStageStarted(stage, startedLessons, attemptedExercises, attemptedArenas)) {
        currentStage = Math.max(currentStage, stage.stage);
      }
    }
    
    // Tìm zone cao nhất
    let highestZone = null;
    const highestStage = Math.max(highestAddSub, highestMulDiv, currentStage);
    
    if (highestStage > 0) {
      // Tìm trong AddSub zones trước
      if (highestAddSub > 0 || (currentStage > 0 && currentStage <= 88)) {
        const stageToFind = highestAddSub || currentStage;
        for (const zone of GAME_ZONES) {
          if (stageToFind >= zone.startStage && stageToFind <= zone.endStage) {
            highestZone = zone.name;
            break;
          }
        }
      }
      // Nếu MulDiv cao hơn, tìm trong MulDiv zones
      if (highestMulDiv > highestAddSub && highestMulDiv > 0) {
        for (const zone of GAME_ZONES_MULDIV) {
          if (highestMulDiv >= zone.startStage && highestMulDiv <= zone.endStage) {
            highestZone = zone.name;
            break;
          }
        }
      }
    }
    
    resultMap.set(userId, {
      hasPlayed, // Đã sửa: true nếu có bất kỳ hoạt động nào
      highestStage,
      highestZone,
      currentZone: highestZone, // Alias cho zone hiện tại
      totalStages: totalCompleted,
      addSubStage: highestAddSub,
      mulDivStage: highestMulDiv,
      currentStage, // Stage đang làm (nếu có)
      startedLessons: startedLessons.size,
      attemptedExercises: attemptedExercises.size,
      attemptedArenas: attemptedArenas.size
    });
  }
  
  return resultMap;
}

/**
 * Check nếu một stage đã BẮT ĐẦU (user đã thử làm requirement)
 */
function checkStageStarted(stage, startedLessons, attemptedExercises, attemptedArenas) {
  const req = stage.requirements;
  if (!req) return false;
  
  // Check nếu đã bắt đầu lesson
  if (req.lesson) {
    const key = `${req.lesson.levelId}-${req.lesson.lessonId}`;
    if (startedLessons.has(key)) return true;
  }
  
  // Check nếu đã thử practice
  if (req.practice) {
    const key = `${req.practice.type}-${req.practice.difficulty}`;
    if (attemptedExercises.has(key)) return true;
  }
  
  // Check nếu đã thử arena
  if (req.arena) {
    if (attemptedArenas.has(req.arena)) return true;
  }
  
  return false;
}

/**
 * Check nếu một stage đã hoàn thành
 */
function checkStageCompleted(stage, completedLessons, passedExercises, passedArenas, earnedCerts) {
  const req = stage.requirements;
  if (!req) return false;
  
  // Check lesson requirement
  if (req.lesson) {
    const key = `${req.lesson.levelId}-${req.lesson.lessonId}`;
    if (!completedLessons.has(key)) return false;
  }
  
  // Check practice requirement
  if (req.practice) {
    const key = `${req.practice.type}-${req.practice.difficulty}`;
    if (!passedExercises.has(key)) return false;
  }
  
  // Check arena requirement
  if (req.arena) {
    if (!passedArenas.has(req.arena)) return false;
  }
  
  // Check certificate requirement
  if (req.certificate) {
    if (!earnedCerts.has(req.certificate)) return false;
  }
  
  return true;
}

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

    // 🎮 Lấy dữ liệu để tính tiến độ game (stage cao nhất)
    const [allProgress, allExercises, allCompete, allCerts] = await Promise.all([
      prisma.progress.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, levelId: true, lessonId: true, completed: true }
      }),
      prisma.exerciseResult.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, exerciseType: true, difficulty: true, isCorrect: true }
      }),
      prisma.competeResult.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, arenaId: true, correct: true }
      }),
      prisma.certificate.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, certType: true }
      })
    ]);

    // 🎮 Tính stage cao nhất cho mỗi user
    const gameProgressMap = calculateGameProgress(userIds, allProgress, allExercises, allCompete, allCerts);

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

      // 🎮 Lấy tiến độ game
      const gameProgress = gameProgressMap.get(user.id) || { 
        hasPlayed: false, 
        highestStage: 0, 
        highestZone: null,
        totalStages: 0,
        addSubStage: 0,
        mulDivStage: 0
      };

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
        avgSpeed,        // Tốc độ trung bình (giây/bài)
        // 🎮 Tiến độ game
        gameProgress: {
          hasPlayed: gameProgress.hasPlayed,
          highestStage: gameProgress.highestStage,
          highestZone: gameProgress.highestZone,
          totalStages: gameProgress.totalStages,
          addSubStage: gameProgress.addSubStage,
          mulDivStage: gameProgress.mulDivStage
        }
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
