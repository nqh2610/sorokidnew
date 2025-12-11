import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/lessons/[levelId]?lessonId=X
export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const levelId = parseInt(params.levelId);
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    // Lấy userId từ database nếu chưa có trong session
    let userId = session.user?.id;
    if (!userId && session.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      userId = user?.id;
    }

    console.log('Fetching lesson:', { levelId, lessonId, userId });

    if (lessonId) {
      // Lấy 1 bài học cụ thể
      const lesson = await prisma.lesson.findUnique({
        where: {
          levelId_lessonId: {
            levelId: levelId,
            lessonId: parseInt(lessonId)
          }
        }
      });

      console.log('Found lesson:', lesson?.title);

      if (!lesson) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
      }

      // Get user progress (chỉ khi có userId)
      let progress = null;
      if (userId) {
        progress = await prisma.progress.findUnique({
          where: {
            userId_levelId_lessonId: {
              userId: userId,
              levelId: levelId,
              lessonId: parseInt(lessonId)
            }
          }
        });
      }

      return NextResponse.json({
        lesson: {
          ...lesson,
          content: JSON.parse(lesson.content),
          completed: progress?.completed || false,
          starsEarned: progress?.starsEarned || 0,
          accuracy: progress?.accuracy || 0
        }
      });
    } else {
      // Lấy tất cả bài học của level
      const lessons = await prisma.lesson.findMany({
        where: { levelId },
        orderBy: { order: 'asc' }
      });

      let userProgress = [];
      if (userId) {
        userProgress = await prisma.progress.findMany({
          where: {
            userId: userId,
            levelId
          }
        });
      }

      const lessonsWithProgress = lessons.map(lesson => {
        const progress = userProgress.find(p => p.lessonId === lesson.lessonId);
        return {
          ...lesson,
          content: JSON.parse(lesson.content),
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
