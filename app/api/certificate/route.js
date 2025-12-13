import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getOrSet, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET /api/certificate - Lấy chứng chỉ của user
export async function GET(request) {
  try {
    // 🔒 Rate limiting
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.NORMAL);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get('id');

    if (certificateId) {
      // 🔧 TỐI ƯU: Cache certificate (immutable)
      const certificate = await getOrSet(
        `cert_${certificateId}`,
        async () => {
          // Tìm theo id trước
          let cert = await prisma.certificate.findUnique({
            where: { id: certificateId },
            select: {
              id: true,
              code: true,
              userId: true,
              userName: true,
              level: true,
              score: true,
              type: true,
              issuedAt: true,
              user: {
                select: { name: true, email: true }
              }
            }
          });

          // Nếu không tìm thấy theo id, thử tìm theo code
          if (!cert) {
            cert = await prisma.certificate.findUnique({
              where: { code: certificateId },
              select: {
                id: true,
                code: true,
                userId: true,
                userName: true,
                level: true,
                score: true,
                type: true,
                issuedAt: true,
                user: {
                  select: { name: true, email: true }
                }
              }
            });
          }
          return cert;
        },
        CACHE_TTL.STATIC // 1 hour - certificates don't change
      );

      if (!certificate) {
        return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
      }

      return NextResponse.json({ certificate });
    }

    // Cần session để lấy tất cả chứng chỉ của user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔧 TỐI ƯU: Select only needed fields
    const certificates = await prisma.certificate.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        code: true,
        userName: true,
        level: true,
        score: true,
        type: true,
        issuedAt: true
      },
      orderBy: { issuedAt: 'desc' }
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/certificate - Tạo chứng chỉ mới (khi hoàn thành level)
export async function POST(request) {
  try {
    // 🔒 Rate limiting STRICT cho tạo chứng chỉ
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { level, score, certificateType = 'completion' } = await request.json();
    const userId = session.user.id;

    // 🔧 TỐI ƯU: Parallel queries cho user tier check + existing cert + user info
    const [user, existingCert] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, tier: true }
      }),
      prisma.certificate.findFirst({
        where: {
          userId: userId,
          level,
          type: certificateType
        },
        select: { id: true, code: true, level: true }
      })
    ]);

    // Kiểm tra user tier từ User model
    const isVip = user?.tier === 'vip' || user?.tier === 'advanced';

    if (!isVip) {
      return NextResponse.json({ 
        error: 'Chứng chỉ chỉ dành cho thành viên VIP hoặc Advanced',
        requiresVip: true 
      }, { status: 403 });
    }

    if (existingCert) {
      return NextResponse.json({ 
        error: 'Bạn đã có chứng chỉ cho cấp độ này',
        certificate: existingCert 
      }, { status: 400 });
    }

    // Tạo certificate ID
    const certId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Tạo chứng chỉ
    const certificate = await prisma.certificate.create({
      data: {
        id: certId,
        userId: session.user.id,
        userName: user.name || user.email,
        level,
        score,
        type: certificateType,
        issuedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      certificate,
      message: 'Chứng chỉ đã được cấp thành công!'
    });
  } catch (error) {
    console.error('Error creating certificate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
