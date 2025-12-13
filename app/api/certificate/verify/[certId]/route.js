import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getOrSet, CACHE_TTL } from '@/lib/cache';

// GET /api/certificate/verify/[certId] - Xác minh chứng chỉ (public)
export async function GET(request, { params }) {
  try {
    // 🔒 Rate limiting RELAXED cho public endpoint
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.RELAXED);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const { certId } = params;

    // 🔧 TỐI ƯU: Cache certificate (immutable after issuance)
    const certificate = await getOrSet(
      `cert_verify_${certId}`,
      async () => {
        return prisma.certificate.findUnique({
          where: { id: certId },
          select: {
            id: true,
            userName: true,
            level: true,
            score: true,
            type: true,
            issuedAt: true,
            user: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        });
      },
      CACHE_TTL.STATIC // 1 hour - certificates don't change
    );

    if (!certificate) {
      return NextResponse.json({ 
        valid: false,
        error: 'Chứng chỉ không tồn tại hoặc không hợp lệ' 
      }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        id: certificate.id,
        userName: certificate.userName,
        level: certificate.level,
        score: certificate.score,
        type: certificate.type,
        issuedAt: certificate.issuedAt
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
