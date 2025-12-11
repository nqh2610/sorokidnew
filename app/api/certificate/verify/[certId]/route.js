import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/certificate/verify/[certId] - Xác minh chứng chỉ (public)
export async function GET(request, { params }) {
  try {
    const { certId } = params;

    const certificate = await prisma.certificate.findUnique({
      where: { id: certId },
      include: {
        user: {
          select: {
            name: true,
            avatar: true
          }
        }
      }
    });

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
