import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getOrSet, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET /api/lessons/[levelId]?lessonId=X
export async function GET(request, context) {
  try {
    // 🔒 Rate limiting
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.NORMAL);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const levelId = parseInt(params.levelId);
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    // Lấy userId từ session
    const userId = session.user?.id;

    if (lessonId) {
      // 🔧 TỐI ƯU: Parallel query cho lesson và progress
      const [lesson, progress] = await Promise.all([
        // Cache lesson content (static data)
        getOrSet(
          `lesson_${levelId}_${lessonId}`,
          async () => {
            return prisma.lesson.findUnique({
              where: {
                levelId_lessonId: {
                  levelId: levelId,
                  lessonId: parseInt(lessonId)
                }
              },
              select: {
                id: true,
                levelId: true,
                lessonId: true,
                title: true,
                description: true,
                content: true,
                difficulty: true,
                duration: true,
                stars: true,
                order: true
              }
            });
          },
          CACHE_TTL.LONG // 1 minute
        ),
        // Progress không cache (realtime)
        userId ? prisma.progress.findUnique({
          where: {
            userId_levelId_lessonId: {
              userId: userId,
              levelId: levelId,
              lessonId: parseInt(lessonId)
            }
          },
          select: { completed: true, starsEarned: true, accuracy: true }
        }) : null
      ]);

      if (!lesson) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
      }

      // Safe JSON parse
      let content = {};
      try {
        content = lesson.content ? JSON.parse(lesson.content) : {};
      } catch (e) {
        content = {};
      }

      return NextResponse.json({
        lesson: {
          ...lesson,
          content,
          completed: progress?.completed || false,
          starsEarned: progress?.starsEarned || 0,
          accuracy: progress?.accuracy || 0
        }
      });
    } else {
      // 🔧 TỐI ƯU: Parallel query cho lessons và progress
      const [lessons, userProgress] = await Promise.all([
        // Cache lessons list
        getOrSet(
          `lessons_level_${levelId}`,
          async () => {
            return prisma.lesson.findMany({
              where: { levelId },
              select: {
                id: true,
                levelId: true,
                lessonId: true,
                title: true,
                description: true,
                content: true,
                difficulty: true,
                duration: true,
                stars: true,
                order: true
              },
              orderBy: { order: 'asc' }
            });
          },
          CACHE_TTL.LONG
        ),
        // Progress không cache
        userId ? prisma.progress.findMany({
          where: {
            userId: userId,
            levelId
          },
          select: { lessonId: true, completed: true, starsEarned: true, accuracy: true }
        }) : []
      ]);

      // 🔧 TỐI ƯU: Dùng Map cho O(1) lookup
      const progressMap = new Map(userProgress.map(p => [p.lessonId, p]));

      const lessonsWithProgress = lessons.map(lesson => {
        const progress = progressMap.get(lesson.lessonId);
        // Safe JSON parse
        let content = {};
        try {
          content = lesson.content ? JSON.parse(lesson.content) : {};
        } catch (e) {
          content = {};
        }
        return {
          ...lesson,
          content,
          completed: progress?.completed || false,
          starsEarned: progress?.starsEarned || 0,
          accuracy: progress?.accuracy || 0
        };
      });

      return NextResponse.json({ lessons: lessonsWithProgress });
    }
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
