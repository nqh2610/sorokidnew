import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import cache, { CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// Helper để kiểm tra quyền admin
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'Unauthorized', status: 401 };
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });
  
  if (!user || user.role !== 'admin') {
    return { error: 'Forbidden', status: 403 };
  }
  
  return { user, session };
}

// GET /api/admin/levels - Lấy tất cả levels (kể cả inactive)
export async function GET(request) {
  try {
    // 🔧 Rate limiting
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.MODERATE);
    if (rateLimitError) return rateLimitError;

    const auth = await checkAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // 🔧 Parallel queries
    const [levels, lessonCounts] = await Promise.all([
      prisma.level.findMany({ orderBy: { order: 'asc' } }),
      prisma.lesson.groupBy({
        by: ['levelId'],
        _count: { id: true }
      })
    ]);

    // 🔧 Map để lookup O(1)
    const countMap = new Map(lessonCounts.map(lc => [lc.levelId, lc._count.id]));

    const levelsWithStats = levels.map(level => ({
      ...level,
      lessonCount: countMap.get(level.id) || 0
    }));

    return NextResponse.json({ 
      levels: levelsWithStats,
      stats: {
        total: levels.length,
        active: levels.filter(l => l.isActive).length
      }
    });
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/levels - Tạo level mới
export async function POST(request) {
  try {
    // 🔧 Rate limiting cho admin write
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
    if (rateLimitError) return rateLimitError;

    const auth = await checkAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, name, icon, description, order, isActive } = body;

    // Validate
    if (!id || !name) {
      return NextResponse.json({ error: 'ID và tên level là bắt buộc' }, { status: 400 });
    }

    // Kiểm tra trùng ID
    const existing = await prisma.level.findUnique({
      where: { id: parseInt(id) }
    });

    if (existing) {
      return NextResponse.json({ error: 'Level ID đã tồn tại' }, { status: 400 });
    }

    const level = await prisma.level.create({
      data: {
        id: parseInt(id),
        name,
        icon: icon || '📚',
        description: description || '',
        order: order || parseInt(id),
        isActive: isActive !== false
      }
    });

    return NextResponse.json({ success: true, level });
  } catch (error) {
    console.error('Error creating level:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/levels - Cập nhật level
export async function PUT(request) {
  try {
    const auth = await checkAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, name, icon, description, order, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Level ID là bắt buộc' }, { status: 400 });
    }

    const existing = await prisma.level.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Level không tồn tại' }, { status: 404 });
    }

    const level = await prisma.level.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existing.name,
        icon: icon || existing.icon,
        description: description ?? existing.description,
        order: order ?? existing.order,
        isActive: isActive ?? existing.isActive
      }
    });

    return NextResponse.json({ success: true, level });
  } catch (error) {
    console.error('Error updating level:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/levels - Xóa level
export async function DELETE(request) {
  try {
    const auth = await checkAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Level ID là bắt buộc' }, { status: 400 });
    }

    // Kiểm tra xem level có lessons không
    const lessonCount = await prisma.lesson.count({
      where: { levelId: parseInt(id) }
    });

    if (lessonCount > 0) {
      return NextResponse.json({ 
        error: `Không thể xóa level đang có ${lessonCount} bài học. Vui lòng xóa hoặc di chuyển các bài học trước.` 
      }, { status: 400 });
    }

    await prisma.level.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting level:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
