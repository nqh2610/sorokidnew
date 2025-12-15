import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import cache, { CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET /api/admin/lessons - Lấy danh sách bài học
export async function GET(request) {
  try {
    // 🔧 Rate limiting
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.MODERATE);
    if (rateLimitError) return rateLimitError;

    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get('levelId');

    const where = levelId ? { levelId: parseInt(levelId) } : {};

    // 🔧 Parallel queries
    const [levels, lessons] = await Promise.all([
      prisma.level.findMany({ orderBy: { id: 'asc' } }),
      prisma.lesson.findMany({
        where,
        orderBy: [{ levelId: 'asc' }, { order: 'asc' }]
      })
    ]);

    // Thống kê
    const stats = {
      totalLessons: lessons.length,
      totalLevels: levels.length,
      lockedLessons: lessons.filter(l => l.isLocked).length
    };

    return NextResponse.json({ 
      lessons: lessons.map(l => ({
        ...l,
        content: JSON.parse(l.content || '{}')
      })),
      levels,
      stats
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/lessons - Tạo bài học mới
export async function POST(request) {
  try {
    // 🔧 Rate limiting cho admin write
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
    if (rateLimitError) return rateLimitError;

    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { levelId, lessonId, title, description, content, difficulty, duration, stars, videoUrl, order, isLocked } = data;

    // Validate required fields
    if (!levelId || !lessonId || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate content JSON
    let contentJson;
    try {
      contentJson = typeof content === 'string' ? JSON.parse(content) : content;
      if (!contentJson.theory || !Array.isArray(contentJson.theory)) {
        return NextResponse.json({ error: 'Content must have theory array' }, { status: 400 });
      }
      if (!contentJson.practice || !Array.isArray(contentJson.practice)) {
        return NextResponse.json({ error: 'Content must have practice array' }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid content JSON' }, { status: 400 });
    }

    // Check duplicate
    const existing = await prisma.lesson.findUnique({
      where: { levelId_lessonId: { levelId: parseInt(levelId), lessonId: parseInt(lessonId) } }
    });
    if (existing) {
      return NextResponse.json({ error: 'Lesson already exists' }, { status: 400 });
    }

    const lesson = await prisma.lesson.create({
      data: {
        levelId: parseInt(levelId),
        lessonId: parseInt(lessonId),
        title,
        description,
        content: JSON.stringify(contentJson),
        difficulty: parseInt(difficulty) || 1,
        duration: parseInt(duration) || 15,
        stars: parseInt(stars) || 10,
        videoUrl: videoUrl || null,
        order: parseInt(order) || lessonId,
        isLocked: isLocked || false
      }
    });

    // 🔧 FIX: Clear cache sau khi tạo lesson
    cache.deletePattern('lessons');

    return NextResponse.json({ 
      success: true, 
      lesson: { ...lesson, content: contentJson }
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/lessons - Cập nhật bài học
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, title, description, content, difficulty, duration, stars, videoUrl, order, isLocked } = data;

    if (!id) {
      return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 });
    }

    // Validate content JSON if provided
    let contentJson;
    if (content) {
      try {
        contentJson = typeof content === 'string' ? JSON.parse(content) : content;
      } catch (e) {
        return NextResponse.json({ error: 'Invalid content JSON' }, { status: 400 });
      }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (contentJson) updateData.content = JSON.stringify(contentJson);
    if (difficulty !== undefined) updateData.difficulty = parseInt(difficulty);
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (stars !== undefined) updateData.stars = parseInt(stars);
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl || null;
    if (order !== undefined) updateData.order = parseInt(order);
    if (isLocked !== undefined) updateData.isLocked = isLocked;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: updateData
    });

    // 🔧 FIX: Clear cache sau khi cập nhật lesson
    cache.deletePattern('lessons');

    return NextResponse.json({ 
      success: true, 
      lesson: { ...lesson, content: JSON.parse(lesson.content) }
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/lessons - Xóa bài học
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 });
    }

    await prisma.lesson.delete({
      where: { id }
    });

    // 🔧 FIX: Clear cache sau khi xóa lesson
    cache.deletePattern('lessons');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
