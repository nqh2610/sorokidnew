import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getLevelInfo } from '@/lib/gamification';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getEffectiveTierSync, getTrialInfo, getTrialSettings } from '@/lib/tierSystem';

export const dynamic = 'force-dynamic';

/**
 * 🚀 DASHBOARD ESSENTIAL API - PHASE 1
 * 
 * API siêu nhẹ chỉ trả về data thiết yếu:
 * - User info (stars, level, tier - có tính trial)
 * - Next lesson (CTA chính)
 * - Quick stats (tổng quan)
 * 
 * CHỈ 3-4 QUERIES - Load trong < 200ms
 */

export async function GET(request) {
  try {
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
    
    // Check cache first
    const cacheKey = `essential:${userId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // === QUERY 1: User info (bao gồm trialExpiresAt để tính trial) ===
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
        tier: true,
        trialExpiresAt: true // 🔧 Thêm để tính effective tier
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 🔧 Tính effective tier (có tính trial)
    const trialSettings = await getTrialSettings();
    const effectiveTier = getEffectiveTierSync(user, trialSettings.trialTier);
    const trialInfo = getTrialInfo(user, trialSettings.trialTier);

    // Tính level info (không query)
    const levelInfo = getLevelInfo(user.totalStars || 0);

    // === QUERY 2: User Progress ===
    // === QUERY 3: Lessons - 🚀 PERF: Cache lessons vì không thay đổi thường xuyên ===
    const lessonsCacheKey = 'all_lessons';
    let allLessons = cache.get(lessonsCacheKey);

    // Nếu chưa có cache lessons, query và cache 10 phút
    if (!allLessons) {
      allLessons = await prisma.lesson.findMany({
        select: {
          levelId: true,
          lessonId: true,
          title: true,
          duration: true
        },
        orderBy: [{ levelId: 'asc' }, { lessonId: 'asc' }]
      });
      cache.set(lessonsCacheKey, allLessons, 600); // Cache 10 phút
    }

    // Query progress riêng (không cache vì thay đổi theo user)
    const userProgress = await prisma.progress.findMany({
      where: { userId },
      select: {
        levelId: true,
        lessonId: true,
        completed: true,
        starsEarned: true
      }
    });

    // Tìm next lesson
    const nextLesson = findNextLesson(allLessons, userProgress);

    // === QUERY 4: Quick stats (counts only) ===
    const [questsReadyCount, achievementCounts] = await Promise.all([
      // Đếm quests có thể claim (completed nhưng chưa claimed)
      prisma.userQuest.count({
        where: {
          userId,
          completed: true,
          claimedAt: null  // Field đúng trong schema là claimedAt, không phải claimed
        }
      }),
      // Đếm achievements
      prisma.userAchievement.count({
        where: { userId }
      })
    ]);

    // Tính quick stats từ progress đã có
    const completedLessons = userProgress.filter(p => p.completed).length;
    const totalLessons = allLessons.length;

    // Tổng số achievements (hardcode hoặc cache)
    const totalAchievements = 30; // Hoặc query 1 lần và cache lâu

    // 🚀 TỐI ƯU: Tính progress by level ngay tại đây để không cần gọi stats API
    const progressByLevel = calculateProgressByLevel(allLessons, userProgress);

    const response = {
      success: true,
      user: {
        ...user,
        tier: effectiveTier, // 🔧 Trả về effective tier (có tính trial)
        actualTier: user.tier, // Tier gốc
        levelInfo,
        trialInfo // 🔧 Thêm thông tin trial
      },
      nextLesson,
      quickStats: {
        lessonsCompleted: completedLessons,
        totalLessons,
        progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        questsReady: questsReadyCount,
        achievementProgress: `${achievementCounts}/${totalAchievements}`
      },
      // 🚀 TỐI ƯU: Include progress để Dashboard không cần gọi stats API
      progress: progressByLevel
    };

    // 🔧 TỐI ƯU: Cache 45s - cân bằng giữa performance và freshness
    cache.set(cacheKey, response, 45000);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Dashboard Essential] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

/**
 * Tìm bài học tiếp theo cần học
 */
function findNextLesson(lessons, progress) {
  // Tạo map progress
  const progressMap = new Map();
  progress.forEach(p => {
    progressMap.set(`${p.levelId}-${p.lessonId}`, p);
  });

  // Tìm bài chưa hoàn thành hoặc đang học
  let inProgressLesson = null;
  let nextUncompletedLesson = null;

  for (const lesson of lessons) {
    const key = `${lesson.levelId}-${lesson.lessonId}`;
    const prog = progressMap.get(key);

    // Bài đang học dở (có progress nhưng chưa completed)
    if (prog && !prog.completed && prog.starsEarned > 0) {
      inProgressLesson = {
        levelId: lesson.levelId,
        lessonId: lesson.lessonId,
        title: lesson.title,
        estimatedTime: lesson.duration,
        isInProgress: true,
        currentProgress: prog
      };
      break;
    }

    // Bài chưa bắt đầu
    if (!prog || !prog.completed) {
      if (!nextUncompletedLesson) {
        nextUncompletedLesson = {
          levelId: lesson.levelId,
          lessonId: lesson.lessonId,
          title: lesson.title,
          estimatedTime: lesson.duration,
          isInProgress: false
        };
      }
    }
  }

  // Ưu tiên bài đang học dở, sau đó là bài chưa học
  if (inProgressLesson) return inProgressLesson;
  if (nextUncompletedLesson) return nextUncompletedLesson;

  // Đã hoàn thành tất cả
  return { isCompleted: true };
}

/**
 * 🚀 TỐI ƯU: Tính progress by level để gộp vào essential response
 * Giảm 1 API call (không cần gọi stats nữa)
 * 
 * Format output phải khớp với ProgressByLevel component:
 * { lessons: [...], byLevel: { 1: { progress: 100, ... }, ... } }
 */
function calculateProgressByLevel(lessons, progress) {
  // Group lessons by level
  const levelMap = new Map();
  
  lessons.forEach(lesson => {
    if (!levelMap.has(lesson.levelId)) {
      levelMap.set(lesson.levelId, { 
        total: 0, 
        completed: 0, 
        stars: 0,
        lessons: []
      });
    }
    const levelData = levelMap.get(lesson.levelId);
    levelData.total++;
    levelData.lessons.push({
      levelId: lesson.levelId,
      lessonId: lesson.lessonId,
      title: lesson.title
    });
  });

  // Count completed lessons and stars per level
  const progressMap = new Map();
  progress.forEach(p => {
    progressMap.set(`${p.levelId}-${p.lessonId}`, p);
    if (levelMap.has(p.levelId) && p.completed) {
      levelMap.get(p.levelId).completed++;
      levelMap.get(p.levelId).stars += (p.starsEarned || 0);
    }
  });

  // Mark completed lessons
  levelMap.forEach((levelData, levelId) => {
    levelData.lessons.forEach(lesson => {
      const key = `${lesson.levelId}-${lesson.lessonId}`;
      const prog = progressMap.get(key);
      lesson.completed = prog?.completed || false;
      lesson.starsEarned = prog?.starsEarned || 0;
    });
  });

  // Build byLevel object (format expected by ProgressByLevel component)
  const byLevel = {};
  const allLessons = [];
  
  levelMap.forEach((data, levelId) => {
    const percent = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
    byLevel[levelId] = {
      total: data.total,
      completed: data.completed,
      progress: percent,
      starsEarned: data.stars,
      maxStars: data.total * 3
    };
    
    // Add lessons to flat array
    data.lessons.forEach(lesson => {
      allLessons.push(lesson);
    });
  });

  return {
    lessons: allLessons,
    byLevel
  };
}
