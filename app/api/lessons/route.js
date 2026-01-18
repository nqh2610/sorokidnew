import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { cache, CACHE_KEYS, CACHE_TTL, getOrSet } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET /api/lessons?levelId=1
export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get('levelId');

    // Lấy userId từ session
    const userId = session.user?.id;

    // 🔧 TỐI ƯU: Cache lessons 3 phút (data tĩnh)
    const lessons = await getOrSet(
      CACHE_KEYS.LESSONS(levelId),
      async () => {
        const where = levelId ? { levelId: parseInt(levelId) } : {};
        return prisma.lesson.findMany({
          where,
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
          orderBy: [{ levelId: 'asc' }, { order: 'asc' }]
        });
      },
      180000 // 3 phút cache
    );

    // Get user progress for these lessons (không cache vì thay đổi)
    let userProgress = [];
    if (userId) {
      userProgress = await prisma.progress.findMany({
        where: {
          userId: userId,
          ...(levelId && { levelId: parseInt(levelId) })
        },
        select: {
          levelId: true,
          lessonId: true,
          completed: true,
          starsEarned: true,
          accuracy: true
        }
      });
    }

    // Map progress to lessons
    const lessonsWithProgress = lessons.map(lesson => {
      const progress = userProgress.find(
        p => p.levelId === lesson.levelId && p.lessonId === lesson.lessonId
      );
      
      // 🔧 Safe JSON parse với fallback
      let parsedContent = {};
      try {
        parsedContent = lesson.content ? JSON.parse(lesson.content) : {};
      } catch (e) {
        console.error(`Failed to parse content for lesson ${lesson.id}:`, e.message);
        parsedContent = {};
      }
      
      return {
        ...lesson,
        content: parsedContent,
        completed: progress?.completed || false,
        starsEarned: progress?.starsEarned || 0,
        accuracy: progress?.accuracy || 0
      };
    });

    return NextResponse.json({ lessons: lessonsWithProgress });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
