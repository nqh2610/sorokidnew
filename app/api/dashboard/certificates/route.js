import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * 📜 CERTIFICATES API - PHASE 2
 * 
 * Load certificate progress data (on-demand)
 * - Certificates earned
 * - Progress toward next certificate
 */

export async function GET(request) {
  try {
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.NORMAL);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Check cache
    const cacheKey = `certificates:${userId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Query certificates and user progress
    // Schema có Certificate (đã cấp) và CertificateProgress (tiến độ)
    const [earnedCertificates, certificateProgress] = await Promise.all([
      // Certificate đã cấp cho user này
      prisma.certificate.findMany({
        where: { userId },
        orderBy: { issuedAt: 'desc' }
      }),
      // Tiến độ certificate của user
      prisma.certificateProgress.findMany({
        where: { userId }
      })
    ]);

    // Map tiến độ certificate theo certType
    const progressMap = new Map();
    certificateProgress.forEach(cp => {
      progressMap.set(cp.certType, cp);
    });

    // Format earned certificates (đã cấp)
    const earned = earnedCertificates.map(cert => ({
      id: cert.id,
      certType: cert.certType,
      recipientName: cert.recipientName,
      honorTitle: cert.honorTitle,
      isExcellent: cert.isExcellent,
      code: cert.code,
      issuedAt: cert.issuedAt,
      isEarned: true,
      progress: 100
    }));

    // Format in-progress certificates
    const inProgress = certificateProgress
      .filter(cp => !cp.isCompleted)
      .map(cp => ({
        id: cp.id,
        certType: cp.certType,
        totalRequired: cp.totalRequired,
        totalCompleted: cp.totalCompleted,
        percentComplete: cp.percentComplete,
        isEarned: false,
        progress: Math.round(cp.percentComplete)
      }));

    // Next certificate to earn (highest progress)
    const nextCertificate = inProgress.length > 0 
      ? inProgress.reduce((max, c) => c.progress > max.progress ? c : max, inProgress[0])
      : null;

    // Định nghĩa các loại certificate có trong hệ thống
    const CERT_TYPES = ['basic', 'intermediate', 'advanced', 'expert'];
    const totalCertificates = CERT_TYPES.length;

    const response = {
      success: true,
      earned,
      inProgress,
      nextCertificate,
      stats: {
        totalEarned: earned.length,
        totalCertificates,
        percentComplete: totalCertificates > 0 
          ? Math.round((earned.length / totalCertificates) * 100) 
          : 0
      }
    };

    // Cache 2 minutes (certificates don't change often)
    cache.set(cacheKey, response, 120000);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Dashboard Certificates] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
