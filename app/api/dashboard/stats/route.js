import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getLevelInfo } from '@/lib/gamification';
import { cache, CACHE_KEYS, CACHE_TTL, getOrSet } from '@/lib/cache';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { withApiProtection } from '@/lib/apiWrapper';
import { CACHE_CONFIG } from '@/config/runtime.config';
import { getEffectiveTierSync, getTrialSettings } from '@/lib/tierSystem';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

/**
 * 🚀 TỐI ƯU DASHBOARD API CHO SHARED HOSTING v2.0
 * 
 * CHIẾN LƯỢC "SURVIVE SHARED HOST":
 * 1. ⏰ CACHE LÂU HƠN (90s thay vì 30s) - giảm 66% DB hits
 * 2. 🔄 STALE-WHILE-REVALIDATE - serve cached data ngay, refresh ngầm
 * 3. 📊 SEQUENTIAL QUERIES - không chiếm hết DB pool
 * 4. 🎯 PRIORITY DATA - Essential data trước, optional sau
 * 5. 💾 COMPONENT CACHE - Cache từng phần riêng biệt
 * 6. 🚨 GRACEFUL DEGRADATION - Trả cached/partial data khi overload
 */

// Cache TTL cho dashboard (90s cho shared host)
const DASHBOARD_CACHE_TTL = CACHE_CONFIG?.ttl?.dashboard || 90000;
const STALE_MAX_AGE = CACHE_CONFIG?.staleWhileRevalidate?.maxStaleAge || 300000;

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

  // 🔧 FIX: Tìm user bằng email nếu không có id (trường hợp vừa đăng ký)
  let userId = session.user.id;
  
  if (!userId && session.user.email) {
    const userByEmail = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    if (userByEmail) {
      userId = userByEmail.id;
    }
  }
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 404 });
  }
  
  const cacheKey = CACHE_KEYS.DASHBOARD_STATS(userId);

  // 🔧 Force refresh nếu có query param ?refresh=1
  let forceRefresh = false;
  try {
    const url = new URL(request.url);
    forceRefresh = url.searchParams.get('refresh') === '1';
  } catch (e) {
    // Ignore URL parsing errors
  }

  if (forceRefresh) {
    cache.delete(cacheKey);
  }

  // 🔧 STALE-WHILE-REVALIDATE PATTERN
  // Check cache - bao gồm cả stale data
  const cachedEntry = forceRefresh ? null : cache.cache?.get(cacheKey);
  const now = Date.now();
  
  if (cachedEntry) {
    const age = now - cachedEntry.createdAt;
    const isStale = now > cachedEntry.expiresAt;
    const isWithinStaleWindow = age < STALE_MAX_AGE;
    
    // Nếu còn fresh -> return ngay
    if (!isStale) {
      return NextResponse.json(cachedEntry.value);
    }
    
    // Nếu stale nhưng trong window -> return stale + refresh ngầm
    if (isStale && isWithinStaleWindow) {
      // Fire-and-forget: refresh cache ngầm
      refreshDashboardCache(userId, cacheKey).catch(() => {});
      // Return stale data ngay lập tức
      return NextResponse.json({
        ...cachedEntry.value,
        _stale: true, // Flag để frontend biết data có thể cũ
        _cachedAt: cachedEntry.createdAt
      });
    }
  }

  // Không có cache hoặc quá cũ -> fetch mới
  try {
    const response = await fetchDashboardData(userId);
    
    // Cache kết quả
    cache.set(cacheKey, response, DASHBOARD_CACHE_TTL);
    
    return NextResponse.json(response);
  } catch (error) {
    // 🚨 GRACEFUL DEGRADATION: Nếu lỗi, trả về stale cache nếu có
    if (cachedEntry) {
      console.warn(`[Dashboard] DB error, serving stale cache for ${userId}`);
      return NextResponse.json({
        ...cachedEntry.value,
        _stale: true,
        _error: 'Dữ liệu có thể không mới nhất'
      });
    }
    throw error;
  }
}, { timeout: 15000, useCircuitBreaker: true }); // Giảm timeout xuống 15s

/**
 * 🔄 Refresh cache ngầm (background)
 */
async function refreshDashboardCache(userId, cacheKey) {
  try {
    const response = await fetchDashboardData(userId);
    cache.set(cacheKey, response, DASHBOARD_CACHE_TTL);
  } catch (error) {
    console.warn(`[Dashboard] Background refresh failed for ${userId}:`, error.message);
  }
}

/**
 * 📊 FETCH DASHBOARD DATA - SEQUENTIAL để không chiếm hết DB pool
 * 
 * Thay vì Promise.all (9 parallel queries = chiếm hết 8 connections)
 * -> Sequential với priority ordering
 */
async function fetchDashboardData(userId) {
  // === PHASE 1: ESSENTIAL DATA (user cần thấy ngay) ===
  // User info - CHỈ LẤY FIELDS CẦN THIẾT
  const user = await prisma.user.findUnique({
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
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Tính level info ngay (không cần query)
  const levelInfo = getLevelInfo(user.totalStars || 0);

  // === PHASE 2: CORE DATA (batch 2-3 queries mỗi lần) ===
  const [progressData, exerciseData] = await Promise.all([
    getProgressStats(userId),
    getExerciseStats(userId),
  ]);

  // 🔥 STREAK ĐƠN GIẢN: Chỉ tính dựa trên đăng nhập, không cần query activity
  const calculatedStreak = calculateLoginStreak(user.streak, user.lastLoginDate);

  // Cập nhật streak và lastLoginDate nếu cần
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
  lastLogin?.setHours(0, 0, 0, 0);

  // Chỉ update nếu chưa login hôm nay hoặc streak thay đổi
  const needsUpdate = !lastLogin || lastLogin.getTime() < today.getTime() || calculatedStreak !== user.streak;
  if (needsUpdate) {
    await prisma.user.update({
      where: { id: userId },
      data: { streak: calculatedStreak, lastLoginDate: new Date() }
    }).catch(err => console.warn('Failed to update streak:', err.message));
  }

  // Next lesson (cần progress data)
  const nextLesson = await getNextLesson(userId, progressData);

  // === PHASE 3: SECONDARY DATA (có thể chậm hơn) ===
  const [questData, achievementData] = await Promise.all([
    getQuestStats(userId, calculatedStreak), // 🔥 Truyền calculatedStreak
    getAchievementStats(userId),
  ]);

  // === PHASE 4: OPTIONAL DATA (cache riêng, có thể skip nếu timeout) ===
  let competeData = { totalArenas: 0, totalMatches: 0 };
  let leaderboardData = { rank: null };
  let certificateData = { total: 0, earned: 0 };
  let activityData = []; // 🔥 Activity chart giờ là optional, không ảnh hưởng streak

  try {
    // Timeout ngắn hơn cho optional data - fail fast
    const optionalPromise = Promise.all([
      Promise.race([getCompeteStats(userId), timeoutPromise(1500, { totalArenas: 0 })]),
      Promise.race([getLeaderboardRank(userId), timeoutPromise(1000, { rank: null })]),
      Promise.race([getCertificateProgress(userId), timeoutPromise(1000, { total: 0, earned: 0 })]),
      Promise.race([getActivityChart(userId), timeoutPromise(1000, [])]), // Activity chart với timeout ngắn
    ]);

    [competeData, leaderboardData, certificateData, activityData] = await optionalPromise;
  } catch (error) {
    console.warn('[Dashboard] Optional data timeout, using defaults');
  }

  return {
    success: true,
    user: {
      ...user,
      streak: calculatedStreak,
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
}

/**
 * ⏱️ Timeout helper cho optional data
 */
function timeoutPromise(ms, fallback) {
  return new Promise(resolve => setTimeout(() => resolve(fallback), ms));
}

// Thống kê tiến độ học tập - TỐI ƯU: Batch queries
async function getProgressStats(userId) {
  // 🚀 PERF: Cache lessons và levels (static data, không thay đổi)
  const lessonsCacheKey = 'static_lessons_full';
  const levelsCacheKey = 'static_levels';

  let lessons = cache.get(lessonsCacheKey);
  let levelsFromDB = cache.get(levelsCacheKey);

  // Query và cache static data nếu chưa có (TTL 30 phút)
  if (!lessons || !levelsFromDB) {
    const [fetchedLessons, fetchedLevels] = await Promise.all([
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

    lessons = fetchedLessons;
    levelsFromDB = fetchedLevels;
    cache.set(lessonsCacheKey, lessons, 1800); // 30 phút
    cache.set(levelsCacheKey, levelsFromDB, 1800);
  }

  // Query progress (user-specific, không cache)
  const progress = await prisma.progress.findMany({
    where: { userId },
    select: {
      levelId: true,
      lessonId: true,
      completed: true,
      starsEarned: true,
      timeSpent: true,
      accuracy: true
    }
  });
  
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

// Thống kê luyện tập - 🔧 TỐI ƯU: Dùng aggregate thay vì load all records
async function getExerciseStats(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 🔧 TỐI ƯU: 4 aggregate queries song song thay vì load hàng trăm records
  const [totalStats, correctCount, todayStats, todayCorrect, byTypeStats, byDiffStats] = await Promise.all([
    // Tổng số bài + tổng thời gian
    prisma.exerciseResult.aggregate({
      where: { userId },
      _count: { _all: true },
      _sum: { timeTaken: true }
    }),
    // Số bài đúng
    prisma.exerciseResult.count({
      where: { userId, isCorrect: true }
    }),
    // Bài hôm nay
    prisma.exerciseResult.count({
      where: { userId, createdAt: { gte: today } }
    }),
    // Bài đúng hôm nay
    prisma.exerciseResult.count({
      where: { userId, isCorrect: true, createdAt: { gte: today } }
    }),
    // Stats theo loại bài tập
    prisma.exerciseResult.groupBy({
      by: ['exerciseType'],
      where: { userId },
      _count: { _all: true }
    }),
    // Stats theo độ khó
    prisma.exerciseResult.groupBy({
      by: ['difficulty'],
      where: { userId },
      _count: { _all: true }
    })
  ]);

  // Đếm correct theo type và difficulty (cần query riêng)
  const [byTypeCorrect, byDiffCorrect] = await Promise.all([
    prisma.exerciseResult.groupBy({
      by: ['exerciseType'],
      where: { userId, isCorrect: true },
      _count: { _all: true }
    }),
    prisma.exerciseResult.groupBy({
      by: ['difficulty'],
      where: { userId, isCorrect: true },
      _count: { _all: true }
    })
  ]);

  const total = totalStats._count._all || 0;
  const correct = correctCount || 0;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Tính avgTime - normalize nếu là ms
  let avgTimeRaw = total > 0 ? (totalStats._sum.timeTaken || 0) / total : 0;
  const avgTime = avgTimeRaw > 100
    ? Math.round(avgTimeRaw / 1000 * 10) / 10  // ms -> giây
    : Math.round(avgTimeRaw * 10) / 10;

  // Map byType stats
  const byTypeCorrectMap = new Map(byTypeCorrect.map(t => [t.exerciseType, t._count._all]));
  const byType = {};
  byTypeStats.forEach(t => {
    byType[t.exerciseType] = {
      total: t._count._all,
      correct: byTypeCorrectMap.get(t.exerciseType) || 0
    };
  });

  // Map byDifficulty stats
  const byDiffCorrectMap = new Map(byDiffCorrect.map(d => [d.difficulty, d._count._all]));
  const byDifficulty = {};
  byDiffStats.forEach(d => {
    const diff = d.difficulty || 1;
    byDifficulty[diff] = {
      total: d._count._all,
      correct: byDiffCorrectMap.get(d.difficulty) || 0
    };
  });

  return {
    total,
    correct,
    accuracy,
    avgTime,
    byType,
    byDifficulty,
    today: {
      total: todayStats,
      correct: todayCorrect,
      accuracy: todayStats > 0 ? Math.round((todayCorrect / todayStats) * 100) : 0
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
      // 🔥 Dùng login streak đơn giản - lấy từ user record
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { streak: true, lastLoginDate: true }
      });
      const loginStreak = calculateLoginStreak(user?.streak || 0, user?.lastLoginDate);
      return Math.min(loginStreak, count);
    }

    default:
      return 0;
  }
}

// Thống kê nhiệm vụ - 🔧 TỐI ƯU: Batch calculate progress để giảm N+1 queries
async function getQuestStats(userId, calculatedStreak = 0) {
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
  const preloadedData = await preloadQuestData(userId, calculatedStreak);
  
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
    const targetCount = requirement.count || 0;
    // 🔧 FIX BUG: Chỉ completed khi target > 0 VÀ progress >= target
    const isCompleted = targetCount > 0 && realProgress >= targetCount;

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
 * Giảm từ 20-50 queries xuống còn 6 queries
 * @param {string} userId - User ID
 * @param {number} calculatedStreak - Streak đã tính từ activity data
 */
async function preloadQuestData(userId, calculatedStreak = 0) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const [progressToday, progressWeek, exercisesToday, exercisesWeek, allLessons, userProgress, correctExercisesWeek] = await Promise.all([
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
    // Tổng số lessons (grouped by level)
    prisma.lesson.groupBy({
      by: ['levelId'],
      _count: true
    }),
    // User progress (grouped by level) - để tính complete_levels
    prisma.progress.groupBy({
      by: ['levelId'],
      where: { userId, completed: true },
      _count: true
    }),
    // Exercises đúng tuần này - cho perfect_exercises
    prisma.exerciseResult.count({
      where: { userId, isCorrect: true, createdAt: { gte: weekStart } }
    })
  ]);

  // Tính số levels đã hoàn thành
  const lessonsByLevel = {};
  allLessons.forEach(l => { lessonsByLevel[l.levelId] = l._count; });
  
  const progressByLevel = {};
  userProgress.forEach(p => { progressByLevel[p.levelId] = p._count; });
  
  let completedLevels = 0;
  for (const levelId in lessonsByLevel) {
    if ((progressByLevel[levelId] || 0) >= lessonsByLevel[levelId]) {
      completedLevels++;
    }
  }

  return {
    progressToday,
    progressWeek,
    exercisesToday,
    exercisesWeek,
    totalLessons: Object.values(lessonsByLevel).reduce((a, b) => a + b, 0),
    completedLevels,
    correctExercisesWeek,
    streak: calculatedStreak
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
      // Dùng correct exercises từ preloaded data
      return Math.min(isWeekly ? data.correctExercisesWeek : data.exercisesToday, count);
    
    case 'speed_exercises':
      // Estimate từ exercises (không có data time)
      return Math.min(isDaily ? data.exercisesToday : data.exercisesWeek, count);
    
    case 'complete_levels':
      // Dùng completedLevels từ preloaded data
      return Math.min(data.completedLevels || 0, count);
    
    case 'accuracy_streak':
      // Estimate từ correct exercises (không track streak chính xác)
      return Math.min(data.correctExercisesWeek || 0, count);
    
    default:
      return 0;
  }
}

// Thống kê thành tích - TỐI ƯU: Không include achievement (đã có từ allAchievements)
async function getAchievementStats(userId) {
  const [allAchievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany({
      orderBy: { id: 'asc' }
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, unlockedAt: true }, // Chỉ lấy fields cần thiết
      orderBy: { unlockedAt: 'desc' }
    })
  ]);

  const totalCount = allAchievements.length;
  const unlockedCount = userAchievements.length;

  // Early return nếu không có achievements
  if (totalCount === 0) {
    return { total: 0, unlocked: 0, progress: 0, recent: [], all: [] };
  }

  // Map để check nhanh - O(1) lookup
  const unlockedMap = new Map(userAchievements.map(ua => [ua.achievementId, ua.unlockedAt]));

  // Pre-allocate arrays để tránh push động
  const unlocked = [];
  const locked = [];

  // Single pass - không cần sort sau
  for (const achievement of allAchievements) {
    const unlockedAt = unlockedMap.get(achievement.id);
    const isUnlocked = unlockedAt !== undefined;

    const item = {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      hint: achievement.hint || null,
      icon: achievement.icon,
      unlocked: isUnlocked,
      unlockedAt: unlockedAt || null,
      progress: 0,
      target: 1
    };

    if (isUnlocked) {
      unlocked.push(item);
    } else {
      locked.push(item);
    }
  }

  // Concat thay vì sort - O(n) thay vì O(n log n)
  const all = unlocked.concat(locked);

  return {
    total: totalCount,
    unlocked: unlockedCount,
    progress: Math.round((unlockedCount / totalCount) * 100),
    recent: unlocked.slice(0, 5),
    all
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

// Biểu đồ hoạt động 7 ngày - TỐI ƯU: 3 queries + Map pre-grouping (O(n) thay vì O(7*n))
async function getActivityChart(userId) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  // 🔧 TỐI ƯU: Batch query tất cả data trong 7 ngày cùng lúc
  const [progressData, exerciseData, competeData] = await Promise.all([
    prisma.progress.findMany({
      where: { userId, completedAt: { gte: weekAgo, lte: today } },
      select: { completedAt: true, starsEarned: true }
    }),
    prisma.exerciseResult.findMany({
      where: { userId, isCorrect: true, createdAt: { gte: weekAgo, lte: today } },
      select: { createdAt: true }
    }),
    prisma.competeResult.findMany({
      where: { userId, createdAt: { gte: weekAgo, lte: today } },
      select: { createdAt: true, stars: true }
    })
  ]);

  // 🚀 PERF: Pre-group by date using Map - O(n) một lần thay vì O(7*n) filter mỗi ngày
  const progressByDate = new Map();
  const exerciseByDate = new Map();
  const competeByDate = new Map();

  // Group progress stars by date
  progressData.forEach(p => {
    if (p.completedAt) {
      const dateStr = p.completedAt.toISOString().split('T')[0];
      progressByDate.set(dateStr, (progressByDate.get(dateStr) || 0) + (p.starsEarned || 0));
    }
  });

  // Group exercise count by date (10 stars each)
  exerciseData.forEach(e => {
    const dateStr = e.createdAt.toISOString().split('T')[0];
    exerciseByDate.set(dateStr, (exerciseByDate.get(dateStr) || 0) + 1);
  });

  // Group compete stars by date
  competeData.forEach(c => {
    const dateStr = c.createdAt.toISOString().split('T')[0];
    competeByDate.set(dateStr, (competeByDate.get(dateStr) || 0) + (c.stars || 0));
  });

  // Build result array - O(7) lookups thay vì O(7*n) filters
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const progressStars = progressByDate.get(dateStr) || 0;
    const exerciseStars = (exerciseByDate.get(dateStr) || 0) * 10;
    const competeStars = competeByDate.get(dateStr) || 0;

    days.push({
      day: dayNames[date.getDay()],
      date: dateStr,
      stars: progressStars + exerciseStars + competeStars,
      isToday: i === 0
    });
  }

  return days;
}

/**
 * 🔥 STREAK ĐƠN GIẢN - Chỉ tính dựa trên đăng nhập
 * Không cần query activity data - nhanh hơn nhiều!
 *
 * Logic:
 * - Login hôm nay: giữ nguyên streak
 * - Login hôm qua + hôm nay: streak + 1
 * - Bỏ lỡ ngày: reset về 1
 *
 * @param {number} currentStreak - Streak hiện tại trong DB
 * @param {Date|null} lastLoginDate - Ngày login cuối cùng
 * @returns {number} - Streak mới
 */
function calculateLoginStreak(currentStreak, lastLoginDate) {
  if (!lastLoginDate) {
    // Chưa từng login -> bắt đầu streak mới
    return 1;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastLogin = new Date(lastLoginDate);
  lastLogin.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Đã login hôm nay rồi -> giữ nguyên streak
    return currentStreak || 1;
  } else if (diffDays === 1) {
    // Login hôm qua -> tăng streak
    return (currentStreak || 0) + 1;
  } else {
    // Bỏ lỡ >= 2 ngày -> reset streak
    return 1;
  }
}

// [DEPRECATED] Hàm cũ - giữ lại để tương thích với activity endpoint
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
    // Lấy user tier, trialExpiresAt và certificates đã có
    const [user, existingCerts, progressData, exerciseData, competeData] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { tier: true, trialExpiresAt: true } }),
      prisma.certificate.findMany({ where: { userId } }),
      prisma.progress.findMany({ where: { userId, completed: true } }),
      prisma.exerciseResult.findMany({ where: { userId } }),
      prisma.competeResult.findMany({ where: { userId } })
    ]);

    // 🔧 Tính effective tier (có tính trial)
    const trialSettings = await getTrialSettings();
    const userTier = getEffectiveTierSync(user, trialSettings.trialTier);
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
