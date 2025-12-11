import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/certificate - Lấy chứng chỉ của user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get('id');

    if (certificateId) {
      // Lấy chứng chỉ cụ thể
      const certificate = await prisma.certificate.findUnique({
        where: { id: certificateId },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      if (!certificate) {
        return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
      }

      return NextResponse.json({ certificate });
    }

    // Lấy tất cả chứng chỉ của user
    const certificates = await prisma.certificate.findMany({
      where: { userId: session.user.id },
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
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { level, score, certificateType = 'completion' } = await request.json();

    // Kiểm tra user tier (chỉ VIP mới có chứng chỉ)
    let userTier = null;
    try {
      userTier = await prisma.userTier.findUnique({
        where: { userId: session.user.id }
      });
    } catch (e) {
      // Table might not exist
    }

    const isVip = userTier?.tierName === 'vip' && 
                  (!userTier.expiresAt || new Date(userTier.expiresAt) > new Date());

    if (!isVip) {
      return NextResponse.json({ 
        error: 'Chứng chỉ chỉ dành cho thành viên VIP',
        requiresVip: true 
      }, { status: 403 });
    }

    // Kiểm tra xem đã có chứng chỉ cho level này chưa
    const existingCert = await prisma.certificate.findFirst({
      where: {
        userId: session.user.id,
        level,
        type: certificateType
      }
    });

    if (existingCert) {
      return NextResponse.json({ 
        error: 'Bạn đã có chứng chỉ cho cấp độ này',
        certificate: existingCert 
      }, { status: 400 });
    }

    // Lấy thông tin user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

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
