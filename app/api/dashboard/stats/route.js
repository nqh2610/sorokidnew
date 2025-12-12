import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getLevelInfo } from '@/lib/gamification';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// GET /api/dashboard/stats - Get all dashboard statistics
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Lấy tất cả dữ liệu song song để tối ưu performance
    const [
      user,
      progressData,
      exerciseData,
      competeData,
      questData,
      achievementData,
      leaderboardData,
      activityData
    ] = await Promise.all([
      // 1. User info
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
      getActivityChart(userId)
    ]);

    // Tính level info
    const levelInfo = getLevelInfo(user?.totalStars || 0);

    // Tính streak thực tế từ activityChart (đếm ngày liên tiếp có hoạt động)
    const calculatedStreak = calculateStreakFromActivity(activityData);

    // Lấy bài học tiếp theo cần học (Continue Learning)
    const nextLesson = await getNextLesson(userId, progressData);

    return NextResponse.json({
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
      activityChart: activityData
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Thống kê tiến độ học tập
async function getProgressStats(userId) {
  const progress = await prisma.progress.findMany({
    where: { userId }
  });

  const lessons = await prisma.lesson.findMany({
    orderBy: [{ levelId: 'asc' }, { lessonId: 'asc' }]
  });

  // Lấy danh sách Level từ database
  const levelsFromDB = await prisma.level.findMany({
    orderBy: { order: 'asc' }
  });
  
  // Tạo map levelId -> level info
  const levelMap = {};
  levelsFromDB.forEach(level => {
    levelMap[level.id] = level;
  });

  // Group lessons by level
  const lessonsByLevel = {};
  lessons.forEach(lesson => {
    if (!lessonsByLevel[lesson.levelId]) {
      lessonsByLevel[lesson.levelId] = [];
    }
    lessonsByLevel[lesson.levelId].push(lesson);
  });

  // Tính stats theo từng level (bài học)
  const statsByLevel = {};

  Object.keys(lessonsByLevel).forEach(levelId => {
    const levelLessons = lessonsByLevel[levelId];
    const completedInLevel = progress.filter(
      p => p.levelId === parseInt(levelId) && p.completed
    );

    // Đếm số lesson unique đã hoàn thành (tránh đếm trùng)
    const uniqueCompletedLessons = new Set(
      completedInLevel.map(p => p.lessonId)
    );
    // Giới hạn completedCount không vượt quá tổng số bài trong level
    const completedCount = Math.min(uniqueCompletedLessons.size, levelLessons.length);

    const totalStarsInLevel = completedInLevel.reduce((sum, p) => sum + p.starsEarned, 0);
    const maxStarsInLevel = levelLessons.reduce((sum, l) => sum + l.stars, 0); // Tổng sao tối đa của level
    const totalTimeInLevel = completedInLevel.reduce((sum, p) => sum + p.timeSpent, 0);
    const avgAccuracy = completedInLevel.length > 0
      ? completedInLevel.reduce((sum, p) => sum + p.accuracy, 0) / completedInLevel.length
      : 0;

    // Lấy tên level từ database
    const levelInfo = levelMap[parseInt(levelId)];
    const levelName = levelInfo ? `${levelInfo.icon} ${levelInfo.name}` : `Level ${levelId}`;

    statsByLevel[levelId] = {
      name: levelName,
      total: levelLessons.length,
      completed: Math.min(completedCount, levelLessons.length),
      progress: levelLessons.length > 0 
        ? Math.min(100, Math.round((Math.min(completedCount, levelLessons.length) / levelLessons.length) * 100))
        : 0,
      totalStars: totalStarsInLevel,
      maxStars: maxStarsInLevel, // Thêm maxStars
      totalTime: totalTimeInLevel,
      avgAccuracy: Math.round(avgAccuracy)
    };
  });

  // Tổng hợp
  const totalLessons = lessons.length;
  const completedLessons = progress.filter(p => p.completed).length;
  const totalStars = progress.reduce((sum, p) => sum + p.starsEarned, 0);
  const totalTime = progress.reduce((sum, p) => sum + p.timeSpent, 0);
  const avgAccuracy = completedLessons > 0
    ? progress.filter(p => p.completed).reduce((sum, p) => sum + p.accuracy, 0) / completedLessons
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

// Thống kê thi đấu
async function getCompeteStats(userId) {
  const results = await prisma.competeResult.findMany({
    where: { userId }
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

  // Đếm số lần vào top 3 (cần query thêm)
  let top3Count = 0;
  for (const arenaId of uniqueArenas) {
    const arenaResults = await prisma.competeResult.findMany({
      where: { arenaId },
      orderBy: [{ correct: 'desc' }, { totalTime: 'asc' }],
      take: 3
    });
    if (arenaResults.some(r => r.userId === userId)) {
      top3Count++;
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

// Thống kê nhiệm vụ
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

  // Tính progress thực tế cho mỗi quest
  const questsWithProgress = await Promise.all(quests.map(async (quest) => {
    const userQuest = userQuests.find(uq => uq.questId === quest.id);
    const requirement = JSON.parse(quest.requirement);
    
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

    // Tính progress thực tế
    const realProgress = await calculateQuestProgress(userId, requirement);
    const isCompleted = realProgress >= requirement.count;

    // Cập nhật UserQuest nếu cần
    if (realProgress > 0 || isCompleted) {
      await prisma.userQuest.upsert({
        where: {
          userId_questId: { userId, questId: quest.id }
        },
        create: {
          userId,
          questId: quest.id,
          progress: realProgress,
          completed: isCompleted
        },
        update: {
          progress: realProgress,
          completed: isCompleted
        }
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
      target: requirement.count,
      completed: isCompleted,
      claimed: false
    };
  }));

  const activeQuests = questsWithProgress.filter(q => !q.claimed);
  const completedQuests = questsWithProgress.filter(q => q.completed && !q.claimed);

  return {
    active: activeQuests.slice(0, 6), // Max 6 nhiệm vụ hiển thị
    completedCount: completedQuests.length,
    totalActive: activeQuests.length
  };
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

// Biểu đồ hoạt động 7 ngày
async function getActivityChart(userId) {
  const days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    // Lấy progress trong ngày
    const progressStars = await prisma.progress.aggregate({
      where: {
        userId,
        completedAt: {
          gte: date,
          lt: nextDate
        }
      },
      _sum: { starsEarned: true }
    });

    // Lấy exercise trong ngày (ước tính sao từ số câu đúng)
    const exerciseCount = await prisma.exerciseResult.count({
      where: {
        userId,
        isCorrect: true,
        createdAt: {
          gte: date,
          lt: nextDate
        }
      }
    });

    // Lấy compete stars trong ngày
    const competeStars = await prisma.competeResult.aggregate({
      where: {
        userId,
        createdAt: {
          gte: date,
          lt: nextDate
        }
      },
      _sum: { stars: true }
    });

    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const totalStars = (progressStars._sum.starsEarned || 0) + 
                       (exerciseCount * 10) + 
                       (competeStars._sum.stars || 0);

    days.push({
      day: dayNames[date.getDay()],
      date: date.toISOString().split('T')[0],
      stars: totalStars,
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
