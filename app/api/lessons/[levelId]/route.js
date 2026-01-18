import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getOrSet, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET /api/lessons/[levelId]?lessonId=X&includeAllLessons=true
// 🚀 TỐI ƯU: Thêm param includeAllLessons để gộp 2 API calls thành 1
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
    const includeAllLessons = searchParams.get('includeAllLessons') === 'true';

    // Lấy userId từ session
    const userId = session.user?.id;

    if (lessonId) {
      // � TỐI ƯU: Gộp lesson hiện tại + danh sách tất cả lessons trong 1 request
      // Trước: 2 API calls riêng biệt - Sau: 1 API call duy nhất
      const queries = [
        // Query 1: Lesson hiện tại (cache)
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
          CACHE_TTL.LONG
        ),
        // Query 2: Progress lesson hiện tại (không cache)
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
      ];

      // 🚀 NẾU CẦN ALL LESSONS: Thêm vào Promise.all để tránh request thứ 2
      if (includeAllLessons) {
        queries.push(
          // Query 3: Tất cả lessons trong level (cache)
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
          // Query 4: Progress tất cả lessons (không cache)
          userId ? prisma.progress.findMany({
            where: { userId, levelId },
            select: { lessonId: true, completed: true, starsEarned: true, accuracy: true }
          }) : []
        );
      }

      const results = await Promise.all(queries);
      const lesson = results[0];
      const progress = results[1];
      const allLessons = includeAllLessons ? results[2] : null;
      const allProgress = includeAllLessons ? results[3] : [];

      if (!lesson) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
      }

      // Safe JSON parse cho lesson hiện tại
      let content = {};
      try {
        content = lesson.content ? JSON.parse(lesson.content) : {};
      } catch (e) {
        content = {};
      }

      const response = {
        lesson: {
          ...lesson,
          content,
          completed: progress?.completed || false,
          starsEarned: progress?.starsEarned || 0,
          accuracy: progress?.accuracy || 0
        }
      };

      // 🚀 GỘP: Nếu có includeAllLessons, thêm danh sách lessons vào response
      if (includeAllLessons && allLessons) {
        const progressMap = new Map(allProgress.map(p => [p.lessonId, p]));
        response.allLessons = allLessons.map(l => ({
          ...l,
          completed: progressMap.get(l.lessonId)?.completed || false,
          starsEarned: progressMap.get(l.lessonId)?.starsEarned || 0
        }));
      }

      return NextResponse.json(response);
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
