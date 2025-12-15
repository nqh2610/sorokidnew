import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getLevelInfo } from '@/lib/gamification';
import { cache, CACHE_KEYS, CACHE_TTL, getOrSet } from '@/lib/cache';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { withApiProtection } from '@/lib/apiWrapper';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

/**
 * 🚀 TỐI ƯU DASHBOARD API CHO SHARED HOSTING
 * 
 * Vấn đề: API này chạy ~20+ queries, rất nặng
 * Giải pháp:
 * 1. Cache kết quả trong 30s
 * 2. Rate limiting
 * 3. Tối ưu queries với select specific fields
 * 4. Batch queries với Promise.all
 * 5. API protection wrapper với timeout + circuit breaker
 */

// GET /api/dashboard/stats - Get all dashboard statistics
export const GET = withApiProtection(async (request) => {
  // Rate limiting
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.NORMAL);
  if (rateLimitError) {
    return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  
  // 🔧 CHECK CACHE FIRST
  const cacheKey = CACHE_KEYS.DASHBOARD_STATS(userId);
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  // Lấy tất cả dữ liệu song song để tối ưu performance
  const [
    user,
    progressData,
    exerciseData,
    competeData,
    questData,
    achievementData,
    leaderboardData,
    activityData,
    certificateData
  ] = await Promise.all([
    // 1. User info - CHỈ LẤY FIELDS CẦN THIẾT
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        totalStars: true,
        level: true,
        diamonds: true,
        streak: true,
        lastLoginDate: true,
        tier: true
      }
    }),

    // 2. Progress (bài học)
    getProgressStats(userId),

    // 3. Exercise (luyện tập)
    getExerciseStats(userId),

    // 4. Compete (thi đấu)
      getCompeteStats(userId),

      // 5. Quests (nhiệm vụ)
      getQuestStats(userId),

      // 6. Achievements (thành tích)
      getAchievementStats(userId),

      // 7. Leaderboard rank
      getLeaderboardRank(userId),

      // 8. Activity chart (7 ngày)
      getActivityChart(userId),

      // 9. Certificate progress
      getCertificateProgress(userId)
    ]);

    // Tính level info
    const levelInfo = getLevelInfo(user?.totalStars || 0);

    // Tính streak thực tế từ activityChart (đếm ngày liên tiếp có hoạt động)
    const calculatedStreak = calculateStreakFromActivity(activityData);

    // Lấy bài học tiếp theo cần học (Continue Learning)
    const nextLesson = await getNextLesson(userId, progressData);

    const response = {
      success: true,
      user: {
        ...user,
        streak: calculatedStreak, // Dùng streak tính toán thay vì từ DB
        levelInfo
      },
      nextLesson,
      progress: progressData,
      exercise: exerciseData,
      compete: competeData,
      quests: questData,
      achievements: achievementData,
      leaderboard: leaderboardData,
      activityChart: activityData,
      certificates: certificateData
    };

    // 🔧 CACHE KẾT QUẢ
    cache.set(cacheKey, response, CACHE_TTL.MEDIUM);

    return NextResponse.json(response);
}, { timeout: 20000, useCircuitBreaker: true }); // 20s timeout cho route nặng

// Thống kê tiến độ học tập - TỐI ƯU: Batch queries
async function getProgressStats(userId) {
  // 🔧 TỐI ƯU: Batch tất cả queries cùng lúc
  const [progress, lessons, levelsFromDB] = await Promise.all([
    prisma.progress.findMany({
      where: { userId },
      select: {
        levelId: true,
        lessonId: true,
        completed: true,
        starsEarned: true,
        timeSpent: true,
        accuracy: true
      }
    }),
    prisma.lesson.findMany({
      select: {
        id: true,
        levelId: true,
        lessonId: true,
        title: true,
        description: true,
        stars: true
      },
      orderBy: [{ levelId: 'asc' }, { lessonId: 'asc' }]
    }),
    prisma.level.findMany({
      select: { id: true, name: true, icon: true },
      orderBy: { order: 'asc' }
    })
  ]);
  
  // Tạo map levelId -> level info
  const levelMap = new Map(levelsFromDB.map(l => [l.id, l]));

  // 🔧 TỐI ƯU: Dùng Map để group nhanh hơn
  const lessonsByLevel = new Map();
  lessons.forEach(lesson => {
    if (!lessonsByLevel.has(lesson.levelId)) {
      lessonsByLevel.set(lesson.levelId, []);
    }
    lessonsByLevel.get(lesson.levelId).push(lesson);
  });

  // Tính stats theo từng level (bài học)
  const statsByLevel = {};

  // 🔧 TỐI ƯU: Dùng Map.forEach thay vì Object.keys
  for (const [levelId, levelLessons] of lessonsByLevel) {
    const completedInLevel = progress.filter(
      p => p.levelId === levelId && p.completed
    );

    // Đếm số lesson unique đã hoàn thành (tránh đếm trùng)
    const uniqueCompletedLessons = new Set(
      completedInLevel.map(p => p.lessonId)
    );
    // Giới hạn completedCount không vượt quá tổng số bài trong level
    const completedCount = Math.min(uniqueCompletedLessons.size, levelLessons.length);

    const totalStarsInLevel = completedInLevel.reduce((sum, p) => sum + (p.starsEarned || 0), 0);
    const maxStarsInLevel = levelLessons.reduce((sum, l) => sum + (l.stars || 0), 0);
    const totalTimeInLevel = completedInLevel.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const avgAccuracy = completedInLevel.length > 0
      ? completedInLevel.reduce((sum, p) => sum + (p.accuracy || 0), 0) / completedInLevel.length
      : 0;

    // Lấy tên level từ Map
    const levelInfo = levelMap.get(levelId);
    const levelName = levelInfo ? `${levelInfo.icon} ${levelInfo.name}` : `Level ${levelId}`;

    statsByLevel[levelId] = {
      name: levelName,
      total: levelLessons.length,
      completed: Math.min(completedCount, levelLessons.length),
      progress: levelLessons.length > 0 
        ? Math.min(100, Math.round((Math.min(completedCount, levelLessons.length) / levelLessons.length) * 100))
        : 0,
      totalStars: totalStarsInLevel,
      maxStars: maxStarsInLevel,
      totalTime: totalTimeInLevel,
      avgAccuracy: Math.round(avgAccuracy)
    };
  }

  // Tổng hợp
  const totalLessons = lessons.length;
  const completedLessons = progress.filter(p => p.completed).length;
  const totalStars = progress.reduce((sum, p) => sum + (p.starsEarned || 0), 0);
  const totalTime = progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
  const avgAccuracy = completedLessons > 0
    ? progress.filter(p => p.completed).reduce((sum, p) => sum + (p.accuracy || 0), 0) / completedLessons
    : 0;

  // Danh sách tất cả bài học với trạng thái
  const lessonsList = lessons.map(lesson => {
    const lessonProgress = progress.find(
      p => p.levelId === lesson.levelId && p.lessonId === lesson.lessonId
    );
    
    // Lấy tên level từ database
    const levelInfo = levelMap[lesson.levelId];
    const levelName = levelInfo ? `${levelInfo.icon} ${levelInfo.name}` : `Level ${lesson.levelId}`;
    
    return {
      levelId: lesson.levelId,
      lessonId: lesson.lessonId,
      title: lesson.title,
      description: lesson.description,
      levelName: levelName,
      completed: lessonProgress?.completed || false,
      starsEarned: lessonProgress?.starsEarned || 0,
      accuracy: lessonProgress?.accuracy || 0,
      timeSpent: lessonProgress?.timeSpent || 0
    };
  });

  return {
    totalLessons,
    completedLessons,
    overallProgress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    totalStars,
    totalTime,
    avgAccuracy: Math.round(avgAccuracy),
    byLevel: statsByLevel,
    lessons: lessonsList
  };
}

// Thống kê luyện tập
async function getExerciseStats(userId) {
  const exercises = await prisma.exerciseResult.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  const total = exercises.length;
  const correct = exercises.filter(e => e.isCorrect).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const avgTime = total > 0 
    ? Math.round(exercises.reduce((sum, e) => sum + e.timeTaken, 0) / total * 10) / 10
    : 0;

  // Stats theo loại bài tập
  const byType = {};
  exercises.forEach(e => {
    if (!byType[e.exerciseType]) {
      byType[e.exerciseType] = { total: 0, correct: 0 };
    }
    byType[e.exerciseType].total++;
    if (e.isCorrect) byType[e.exerciseType].correct++;
  });

  // Stats theo độ khó
  const byDifficulty = {};
  exercises.forEach(e => {
    const diff = e.difficulty || 1;
    if (!byDifficulty[diff]) {
      byDifficulty[diff] = { total: 0, correct: 0 };
    }
    byDifficulty[diff].total++;
    if (e.isCorrect) byDifficulty[diff].correct++;
  });

  // Bài tập hôm nay
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayExercises = exercises.filter(e => new Date(e.createdAt) >= today);

  return {
    total,
    correct,
    accuracy,
    avgTime,
    byType,
    byDifficulty,
    today: {
      total: todayExercises.length,
      correct: todayExercises.filter(e => e.isCorrect).length
    }
  };
}

// Thống kê thi đấu - TỐI ƯU: Giảm queries trong loop
async function getCompeteStats(userId) {
  const results = await prisma.competeResult.findMany({
    where: { userId },
    select: {
      arenaId: true,
      correct: true,
      totalTime: true,
      stars: true
    }
  });

  if (results.length === 0) {
    return {
      totalArenas: 0,
      totalMatches: 0,
      bestCorrect: 0,
      bestTime: 0,
      totalStars: 0,
      top3Count: 0
    };
  }

  // Số đấu trường đã tham gia (unique arenaId)
  const uniqueArenas = new Set(results.map(r => r.arenaId));
  
  // Kỷ lục cá nhân
  const bestCorrect = Math.max(...results.map(r => r.correct));
  const bestTime = Math.min(...results.map(r => r.totalTime));
  
  // Tổng sao từ thi đấu
  const totalStars = results.reduce((sum, r) => sum + (r.stars || 0), 0);

  // 🔧 TỐI ƯU: Batch query tất cả arenas cùng lúc thay vì loop
  // Lấy top 3 của TẤT CẢ arenas user đã tham gia trong 1 query
  let top3Count = 0;
  
  // Giới hạn chỉ check 10 arenas gần nhất để tiết kiệm queries
  const recentArenas = Array.from(uniqueArenas).slice(0, 10);
  
  if (recentArenas.length > 0) {
    // Query tất cả results của các arenas này
    const allArenaResults = await prisma.competeResult.findMany({
      where: { arenaId: { in: recentArenas } },
      select: {
        arenaId: true,
        userId: true,
        correct: true,
        totalTime: true
      },
      orderBy: [{ correct: 'desc' }, { totalTime: 'asc' }]
    });

    // Group by arenaId và check top 3
    const arenaGroups = {};
    allArenaResults.forEach(r => {
      if (!arenaGroups[r.arenaId]) arenaGroups[r.arenaId] = [];
      arenaGroups[r.arenaId].push(r);
    });

    for (const arenaId of recentArenas) {
      const arenaResults = (arenaGroups[arenaId] || []).slice(0, 3);
      if (arenaResults.some(r => r.userId === userId)) {
        top3Count++;
      }
    }
  }

  return {
    totalArenas: uniqueArenas.size,
    totalMatches: results.length,
    bestCorrect,
    bestTime: Math.round(bestTime * 10) / 10,
    totalStars,
    top3Count
  };
}

// Tính progress thực tế cho quest dựa trên dữ liệu user
async function calculateQuestProgress(userId, requirement) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Đầu tuần (Chủ nhật)

  const { type, count, minAccuracy } = requirement;

  switch (type) {
    // === LESSON QUESTS ===
    case 'complete_lessons': {
      // Daily: lessons hôm nay, Weekly: lessons trong tuần
      const isDaily = requirement.metric?.includes('today');
      const dateFilter = isDaily ? { gte: today } : { gte: weekStart };
      
      const completedLessons = await prisma.progress.count({
        where: {
          userId,
          completed: true,
          completedAt: dateFilter
        }
      });
      return Math.min(completedLessons, count);
    }

    case 'complete_levels': {
      // Đếm số level đã hoàn thành 100%
      const allLessons = await prisma.lesson.findMany();
      const userProgress = await prisma.progress.findMany({
        where: { userId, completed: true }
      });

      // Group lessons by level
      const lessonsByLevel = {};
      allLessons.forEach(l => {
        if (!lessonsByLevel[l.levelId]) lessonsByLevel[l.levelId] = 0;
        lessonsByLevel[l.levelId]++;
      });

      // Count completed levels
      const completedByLevel = {};
      userProgress.forEach(p => {
        if (!completedByLevel[p.levelId]) completedByLevel[p.levelId] = 0;
        completedByLevel[p.levelId]++;
      });

      let completedLevels = 0;
      for (const levelId in lessonsByLevel) {
        if (completedByLevel[levelId] >= lessonsByLevel[levelId]) {
          completedLevels++;
        }
      }
      return Math.min(completedLevels, count);
    }

    // === EXERCISE QUESTS ===
    case 'complete_exercises': {
      const isDaily = requirement.metric?.includes('today');
      const isWeekly = requirement.metric?.includes('week');
      
      let dateFilter = {};
      if (isDaily) dateFilter = { gte: today };
      else if (isWeekly) dateFilter = { gte: weekStart };
      
      const exercises = await prisma.exerciseResult.count({
        where: {
          userId,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      });
      return Math.min(exercises, count);
    }

    case 'accurate_exercises': {
      // Bài tập với accuracy >= minAccuracy
      const accurateCount = await prisma.exerciseResult.count({
        where: {
          userId,
          isCorrect: true
        }
      });
      // Simplified: count correct exercises as "accurate"
      return Math.min(accurateCount, count);
    }

    case 'accuracy_streak': {
      // Chuỗi bài tập liên tiếp đạt accuracy
      const recentExercises = await prisma.exerciseResult.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      let streak = 0;
      for (const ex of recentExercises) {
        if (ex.isCorrect) streak++;
        else break;
      }
      return Math.min(streak, count);
    }

    case 'perfect_exercises': {
      // Bài tập đạt 100%
      const isWeekly = requirement.metric?.includes('week');
      const dateFilter = isWeekly ? { gte: weekStart } : {};

      const perfectCount = await prisma.exerciseResult.count({
        where: {
          userId,
          isCorrect: true,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      });
      return Math.min(perfectCount, count);
    }

    case 'speed_exercises': {
      // Simplified: count recent fast exercises
      const exercises = await prisma.exerciseResult.count({
        where: {
          userId,
          createdAt: { gte: today },
          timeTaken: { lte: 60 } // Dưới 60 giây
        }
      });
      return Math.min(exercises, count);
    }

    // === STREAK QUESTS ===
    case 'login_streak': {
      // Tính streak thực tế từ activity data thay vì dùng giá trị từ DB
      const activityData = await getActivityChart(userId);
      const calculatedStreak = calculateStreakFromActivity(activityData);
      return Math.min(calculatedStreak, count);
    }

    default:
      return 0;
  }
}

// Thống kê nhiệm vụ - 🔧 TỐI ƯU: Batch calculate progress để giảm N+1 queries
async function getQuestStats(userId) {
  const quests = await prisma.quest.findMany({
    where: {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    }
  });

  const userQuests = await prisma.userQuest.findMany({
    where: {
      userId,
      questId: { in: quests.map(q => q.id) }
    }
  });

  // 🔧 FIX N+1: Pre-fetch TẤT CẢ data cần thiết trong 1 lần
  const preloadedData = await preloadQuestData(userId);
  
  // 🔧 FIX: Collect all upserts và batch cuối cùng
  const upsertOperations = [];

  // Tính progress cho mỗi quest (không query DB trong loop nữa)
  const questsWithProgress = quests.map((quest) => {
    const userQuest = userQuests.find(uq => uq.questId === quest.id);
    
    // 🔧 Safe JSON parse với fallback
    let requirement = {};
    try {
      requirement = quest.requirement ? JSON.parse(quest.requirement) : {};
    } catch (e) {
      console.error(`Failed to parse quest requirement ${quest.id}:`, e.message);
      requirement = { count: 0 };
    }
    
    // Nếu đã claim thì giữ nguyên progress cũ
    if (userQuest?.claimedAt) {
      return {
        id: quest.id,
        title: quest.title,
        description: quest.description,
        type: quest.type,
        stars: quest.stars,
        diamonds: quest.diamonds,
        requirement,
        progress: requirement.count,
        target: requirement.count,
        completed: true,
        claimed: true
      };
    }

    // 🔧 FIX: Tính progress từ preloaded data (không query DB)
    const realProgress = calculateQuestProgressSync(preloadedData, requirement);
    const isCompleted = realProgress >= (requirement.count || 0);

    // 🔧 FIX: Thu thập upsert thay vì execute ngay
    if (realProgress > 0 || isCompleted) {
      upsertOperations.push({
        where: { userId_questId: { userId, questId: quest.id } },
        create: { userId, questId: quest.id, progress: realProgress, completed: isCompleted },
        update: { progress: realProgress, completed: isCompleted }
      });
    }

    return {
      id: quest.id,
      title: quest.title,
      description: quest.description,
      type: quest.type,
      stars: quest.stars,
      diamonds: quest.diamonds,
      requirement,
      progress: realProgress,
      target: requirement.count || 0,
      completed: isCompleted,
      claimed: false
    };
  });

  // 🔧 FIX: Batch upsert (giới hạn 5 để không block lâu)
  if (upsertOperations.length > 0) {
    const limitedOps = upsertOperations.slice(0, 5);
    await Promise.all(limitedOps.map(op => 
      prisma.userQuest.upsert(op).catch(e => console.error('Quest upsert error:', e.message))
    ));
  }

  const activeQuests = questsWithProgress.filter(q => !q.claimed);
  const completedQuests = questsWithProgress.filter(q => q.completed && !q.claimed);

  return {
    active: activeQuests.slice(0, 6), // Max 6 nhiệm vụ hiển thị
    completedCount: completedQuests.length,
    totalActive: activeQuests.length
  };
}

/**
 * 🔧 Pre-load tất cả data cần thiết cho quest progress trong 1 batch
 * Giảm từ 20-50 queries xuống còn 4 queries
 */
async function preloadQuestData(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const [progressToday, progressWeek, exercisesToday, exercisesWeek, allLessons, user] = await Promise.all([
    // Progress hoàn thành hôm nay
    prisma.progress.count({
      where: { userId, completed: true, completedAt: { gte: today } }
    }),
    // Progress hoàn thành tuần này
    prisma.progress.count({
      where: { userId, completed: true, completedAt: { gte: weekStart } }
    }),
    // Exercises hôm nay
    prisma.exerciseResult.count({
      where: { userId, createdAt: { gte: today } }
    }),
    // Exercises tuần này
    prisma.exerciseResult.count({
      where: { userId, createdAt: { gte: weekStart } }
    }),
    // Tổng số lessons
    prisma.lesson.count(),
    // User streak
    prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true }
    })
  ]);

  return {
    progressToday,
    progressWeek,
    exercisesToday,
    exercisesWeek,
    totalLessons: allLessons,
    streak: user?.streak || 0
  };
}

/**
 * 🔧 Calculate quest progress SYNCHRONOUSLY từ preloaded data
 * Không gọi DB trong function này
 */
function calculateQuestProgressSync(data, requirement) {
  const { type, count = 0 } = requirement;
  const isDaily = requirement.metric?.includes('today');
  const isWeekly = requirement.metric?.includes('week');

  switch (type) {
    case 'complete_lessons':
      return Math.min(isDaily ? data.progressToday : data.progressWeek, count);
    
    case 'complete_exercises':
      return Math.min(isDaily ? data.exercisesToday : data.exercisesWeek, count);
    
    case 'login_streak':
      return Math.min(data.streak, count);
    
    case 'accurate_exercises':
    case 'perfect_exercises':
    case 'speed_exercises':
      // Trả về giá trị estimate (không query thêm)
      return Math.min(isDaily ? data.exercisesToday : data.exercisesWeek, count);
    
    default:
      return 0;
  }
}

// Thống kê thành tích
async function getAchievementStats(userId) {
  const [allAchievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' }
    })
  ]);

  // Tất cả thành tích đã mở khóa
  const allUnlocked = userAchievements.map(ua => ({
    id: ua.achievement.id,
    name: ua.achievement.name,
    description: ua.achievement.description,
    icon: ua.achievement.icon,
    unlockedAt: ua.unlockedAt
  }));

  // 5 thành tích gần đây nhất
  const recentUnlocked = allUnlocked.slice(0, 5);

  return {
    total: allAchievements.length,
    unlocked: userAchievements.length,
    progress: allAchievements.length > 0 
      ? Math.round((userAchievements.length / allAchievements.length) * 100)
      : 0,
    recent: recentUnlocked,
    all: allUnlocked  // Thêm tất cả thành tích
  };
}

// Lấy hạng trong bảng xếp hạng
async function getLeaderboardRank(userId) {
  const users = await prisma.user.findMany({
    where: { role: 'student' },
    orderBy: { totalStars: 'desc' },
    select: { id: true, totalStars: true }
  });

  const rank = users.findIndex(u => u.id === userId) + 1;
  const totalPlayers = users.length;

  return {
    rank: rank > 0 ? rank : null,
    totalPlayers,
    percentile: totalPlayers > 0 ? Math.round(((totalPlayers - rank + 1) / totalPlayers) * 100) : 0
  };
}

// Biểu đồ hoạt động 7 ngày - TỐI ƯU: Giảm từ 21 queries xuống 3 queries
async function getActivityChart(userId) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  // 🔧 TỐI ƯU: Batch query tất cả data trong 7 ngày cùng lúc
  const [progressData, exerciseData, competeData] = await Promise.all([
    // Progress stars trong 7 ngày
    prisma.progress.findMany({
      where: {
        userId,
        completedAt: { gte: weekAgo, lte: today }
      },
      select: { completedAt: true, starsEarned: true }
    }),
    // Exercise results trong 7 ngày
    prisma.exerciseResult.findMany({
      where: {
        userId,
        isCorrect: true,
        createdAt: { gte: weekAgo, lte: today }
      },
      select: { createdAt: true }
    }),
    // Compete results trong 7 ngày
    prisma.competeResult.findMany({
      where: {
        userId,
        createdAt: { gte: weekAgo, lte: today }
      },
      select: { createdAt: true, stars: true }
    })
  ]);

  // Group data theo ngày
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Tính stars từ progress
    const progressStars = progressData
      .filter(p => p.completedAt && p.completedAt.toISOString().split('T')[0] === dateStr)
      .reduce((sum, p) => sum + (p.starsEarned || 0), 0);
    
    // Tính stars từ exercises (10 stars mỗi câu đúng)
    const exerciseStars = exerciseData
      .filter(e => e.createdAt.toISOString().split('T')[0] === dateStr)
      .length * 10;
    
    // Tính stars từ compete
    const competeStars = competeData
      .filter(c => c.createdAt.toISOString().split('T')[0] === dateStr)
      .reduce((sum, c) => sum + (c.stars || 0), 0);

    days.push({
      day: dayNames[date.getDay()],
      date: dateStr,
      stars: progressStars + exerciseStars + competeStars,
      isToday: i === 0
    });
  }

  return days;
}

// Tính streak (số ngày liên tiếp có hoạt động) từ activityChart
function calculateStreakFromActivity(activityData) {
  // activityData là mảng 7 ngày từ cũ → mới (index 6 = hôm nay)
  // Đếm ngày liên tiếp có stars > 0 từ hôm nay trở về trước
  
  if (!activityData || activityData.length === 0) return 0;
  
  let streak = 0;
  
  // Duyệt từ hôm nay (cuối mảng) ngược lại
  for (let i = activityData.length - 1; i >= 0; i--) {
    if (activityData[i].stars > 0) {
      streak++;
    } else {
      // Nếu gặp ngày không hoạt động, dừng lại
      // Ngoại trừ nếu đó là hôm nay (cho phép chưa hoạt động hôm nay)
      if (i === activityData.length - 1) {
        // Hôm nay chưa hoạt động - tiếp tục đếm từ hôm qua
        continue;
      }
      break;
    }
  }
  
  return streak;
}

// Lấy bài học tiếp theo cần học
async function getNextLesson(userId, progressData) {
  const lessons = await prisma.lesson.findMany({
    orderBy: [{ levelId: 'asc' }, { lessonId: 'asc' }]
  });

  // Lấy danh sách Level từ database
  const levelsFromDB = await prisma.level.findMany();
  const levelMap = {};
  levelsFromDB.forEach(level => {
    levelMap[level.id] = level;
  });

  const completedProgress = await prisma.progress.findMany({
    where: { userId, completed: true }
  });

  const completedSet = new Set(
    completedProgress.map(p => `${p.levelId}-${p.lessonId}`)
  );

  // Tìm bài học chưa hoàn thành đầu tiên
  for (const lesson of lessons) {
    const key = `${lesson.levelId}-${lesson.lessonId}`;
    if (!completedSet.has(key)) {
      // Tìm progress hiện tại của bài này (nếu đang làm dở)
      const currentProgress = await prisma.progress.findUnique({
        where: {
          userId_levelId_lessonId: {
            userId,
            levelId: lesson.levelId,
            lessonId: lesson.lessonId
          }
        }
      });

      // Lấy tên level từ database
      const levelInfo = levelMap[lesson.levelId];
      const levelName = levelInfo ? `${levelInfo.icon} ${levelInfo.name}` : `Level ${lesson.levelId}`;

      return {
        levelId: lesson.levelId,
        lessonId: lesson.lessonId,
        title: lesson.title,
        levelName: levelName,
        description: lesson.description,
        difficulty: lesson.difficulty,
        estimatedTime: lesson.duration || 10,
        currentProgress: currentProgress ? {
          starsEarned: currentProgress.starsEarned,
          accuracy: currentProgress.accuracy,
          timeSpent: currentProgress.timeSpent
        } : null,
        isInProgress: !!currentProgress && !currentProgress.completed
      };
    }
  }

  // Nếu đã hoàn thành tất cả, gợi ý ôn tập
  if (lessons.length > 0) {
    const lastLesson = lessons[lessons.length - 1];
    return {
      levelId: lastLesson.levelId,
      lessonId: lastLesson.lessonId,
      title: 'Ôn tập tổng hợp',
      levelName: 'Đã hoàn thành tất cả! 🎉',
      description: 'Bạn đã học xong tất cả bài học. Hãy ôn tập lại hoặc luyện tập thêm!',
      isCompleted: true
    };
  }

  return null;
}

// Lấy tiến độ chứng chỉ
async function getCertificateProgress(userId) {
  try {
    // Lấy user tier và certificates đã có
    const [user, existingCerts, progressData, exerciseData, competeData] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { tier: true } }),
      prisma.certificate.findMany({ where: { userId } }),
      prisma.progress.findMany({ where: { userId, completed: true } }),
      prisma.exerciseResult.findMany({ where: { userId } }),
      prisma.competeResult.findMany({ where: { userId } })
    ]);

    const userTier = user?.tier || 'free';
    const tierOrder = { free: 0, basic: 1, advanced: 2, vip: 3 };

    // Cấu hình chứng chỉ (đơn giản hóa)
    const certConfigs = {
      addSub: {
        name: 'Chứng chỉ Cộng Trừ',
        requiredTier: 'basic',
        requirements: {
          lessons: { levels: [1,2,3,4,5,6,7,8,9,10], weight: 40 },
          practice: { modes: ['addition', 'subtraction', 'addSubMixed'], minCorrect: 5, weight: 30 },
          compete: { modes: ['addition', 'subtraction', 'addSubMixed'], minCorrect: 5, weight: 20 },
          accuracy: { minAccuracy: 70, weight: 10 }
        }
      },
      complete: {
        name: 'Chứng chỉ Toàn Diện',
        requiredTier: 'advanced',
        requirements: {
          lessons: { levels: Array.from({length: 18}, (_, i) => i + 1), weight: 30 },
          practice: { modes: ['addition', 'subtraction', 'addSubMixed', 'multiplication', 'division', 'mulDiv', 'mixed'], minCorrect: 5, weight: 25 },
          mentalMath: { minCorrect: 5, weight: 10 },
          flashAnzan: { minLevel: 2, minCorrect: 3, weight: 10 },
          compete: { modes: ['addition', 'subtraction', 'multiplication', 'division'], minCorrect: 5, weight: 20 },
          accuracy: { minAccuracy: 75, weight: 5 }
        }
      }
    };

    const result = {};

    for (const [certType, config] of Object.entries(certConfigs)) {
      const hasCertificate = existingCerts.some(c => c.certType === certType);
      const hasRequiredTier = tierOrder[userTier] >= tierOrder[config.requiredTier];

      // Tính tiến độ từng requirement
      const details = {};
      let totalPercent = 0;
      const req = config.requirements;

      // Lessons
      if (req.lessons) {
        const completedLevels = new Set(progressData.map(p => p.levelId));
        const completed = req.lessons.levels.filter(l => completedLevels.has(l)).length;
        const total = req.lessons.levels.length;
        const percent = (completed / total) * req.lessons.weight;
        details.lessons = { completed, total, isComplete: completed >= total };
        totalPercent += percent;
      }

      // Practice
      if (req.practice) {
        let completedModes = 0;
        req.practice.modes.forEach(mode => {
          const correct = exerciseData.filter(e => e.exerciseType === mode && e.difficulty >= 2 && e.isCorrect).length;
          if (correct >= req.practice.minCorrect) completedModes++;
        });
        const percent = (completedModes / req.practice.modes.length) * req.practice.weight;
        details.practice = { completed: completedModes, total: req.practice.modes.length, isComplete: completedModes >= req.practice.modes.length };
        totalPercent += percent;
      }

      // Compete
      if (req.compete) {
        let completedModes = 0;
        req.compete.modes.forEach(mode => {
          const hasGoodResult = competeData.some(c => {
            const [arenaMode, diff] = c.arenaId.split('-');
            return arenaMode === mode && parseInt(diff) >= 2 && c.correct >= req.compete.minCorrect;
          });
          if (hasGoodResult) completedModes++;
        });
        const percent = (completedModes / req.compete.modes.length) * req.compete.weight;
        details.compete = { completed: completedModes, total: req.compete.modes.length, isComplete: completedModes >= req.compete.modes.length };
        totalPercent += percent;
      }

      // Mental Math
      if (req.mentalMath) {
        const correct = exerciseData.filter(e => e.exerciseType === 'mentalMath' && e.isCorrect).length;
        const isComplete = correct >= req.mentalMath.minCorrect;
        const percent = isComplete ? req.mentalMath.weight : (correct / req.mentalMath.minCorrect) * req.mentalMath.weight;
        details.mentalMath = { correct, required: req.mentalMath.minCorrect, isComplete };
        totalPercent += percent;
      }

      // Flash Anzan
      if (req.flashAnzan) {
        const correct = exerciseData.filter(e => e.exerciseType === 'flashAnzan' && e.difficulty >= req.flashAnzan.minLevel && e.isCorrect).length;
        const isComplete = correct >= req.flashAnzan.minCorrect;
        const percent = isComplete ? req.flashAnzan.weight : (correct / req.flashAnzan.minCorrect) * req.flashAnzan.weight;
        details.flashAnzan = { correct, required: req.flashAnzan.minCorrect, isComplete };
        totalPercent += percent;
      }

      // Accuracy
      if (req.accuracy) {
        const totalEx = exerciseData.length;
        const correctEx = exerciseData.filter(e => e.isCorrect).length;
        const accuracy = totalEx > 0 ? Math.round((correctEx / totalEx) * 100) : 0;
        const isComplete = accuracy >= req.accuracy.minAccuracy;
        const percent = isComplete ? req.accuracy.weight : 0;
        details.accuracy = { current: accuracy, required: req.accuracy.minAccuracy, isComplete };
        totalPercent += percent;
      }

      const isEligible = Object.values(details).every(d => d.isComplete);

      result[certType] = {
        hasCertificate,
        hasRequiredTier,
        totalPercent: Math.round(totalPercent),
        isEligible,
        details
      };
    }

    return result;
  } catch (error) {
    console.error('Error getting certificate progress:', error);
    return null;
  }
}
