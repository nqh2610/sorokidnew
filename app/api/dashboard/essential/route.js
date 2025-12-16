import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getLevelInfo } from '@/lib/gamification';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * 🚀 DASHBOARD ESSENTIAL API - PHASE 1
 * 
 * API siêu nhẹ chỉ trả về data thiết yếu:
 * - User info (stars, level, tier)
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

    const userId = session.user.id;
    
    // Check cache first
    const cacheKey = `essential:${userId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // === QUERY 1: User info ===
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Tính level info (không query)
    const levelInfo = getLevelInfo(user.totalStars || 0);

    // === QUERY 2 & 3: Progress + Lessons (để tìm next lesson) ===
    const [userProgress, allLessons] = await Promise.all([
      prisma.progress.findMany({
        where: { userId },
        select: {
          levelId: true,
          lessonId: true,
          completed: true,
          starsEarned: true
        }
      }),
      prisma.lesson.findMany({
        select: {
          levelId: true,
          lessonId: true,
          title: true,
          duration: true
        },
        orderBy: [{ levelId: 'asc' }, { lessonId: 'asc' }]
      })
    ]);

    // Tìm next lesson
    const nextLesson = findNextLesson(allLessons, userProgress);

    // === QUERY 4: Quick stats (counts only) ===
    const [questsReadyCount, achievementCounts] = await Promise.all([
      // Đếm quests có thể claim
      prisma.userQuest.count({
        where: {
          userId,
          completed: true,
          claimed: false
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

    const response = {
      success: true,
      user: {
        ...user,
        levelInfo
      },
      nextLesson,
      quickStats: {
        lessonsCompleted: completedLessons,
        totalLessons,
        progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        questsReady: questsReadyCount,
        achievementProgress: `${achievementCounts}/${totalAchievements}`
      }
    };

    // Cache 60s
    cache.set(cacheKey, response, 60000);

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
