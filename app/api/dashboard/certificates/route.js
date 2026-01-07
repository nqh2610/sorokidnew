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
    const [allCertificates, userCertificates, userProgress] = await Promise.all([
      prisma.certificate.findMany({
        orderBy: { id: 'asc' }
      }),
      prisma.userCertificate.findMany({
        where: { userId },
        include: { certificate: true }
      }),
      // Get all progress to calculate level completion
      prisma.progress.findMany({
        where: { userId },
        select: {
          levelId: true,
          lessonId: true,
          completed: true
        }
      })
    ]);

    // Count lessons per level
    const levelLessonCounts = await prisma.lesson.groupBy({
      by: ['levelId'],
      _count: { lessonId: true }
    });

    const lessonCountMap = new Map();
    levelLessonCounts.forEach(lc => {
      lessonCountMap.set(lc.levelId, lc._count.lessonId);
    });

    // Calculate level completion
    const completedByLevel = new Map();
    userProgress.forEach(p => {
      if (p.completed) {
        const current = completedByLevel.get(p.levelId) || 0;
        completedByLevel.set(p.levelId, current + 1);
      }
    });

    // Map earned certificates
    const earnedIds = new Set(userCertificates.map(uc => uc.certificateId));

    // Format certificates
    const formattedCertificates = allCertificates.map(cert => {
      const isEarned = earnedIds.has(cert.id);
      const userCert = userCertificates.find(uc => uc.certificateId === cert.id);
      
      // Calculate progress for this certificate
      let progress = 0;
      if (cert.levelId) {
        const completed = completedByLevel.get(cert.levelId) || 0;
        const total = lessonCountMap.get(cert.levelId) || 1;
        progress = isEarned ? 100 : Math.round((completed / total) * 100);
      }

      return {
        id: cert.id,
        name: cert.name,
        description: cert.description,
        levelId: cert.levelId,
        image: cert.image,
        isEarned,
        earnedAt: userCert?.earnedAt || null,
        certificateId: userCert?.certificateId,
        progress
      };
    });

    // Split by status
    const earned = formattedCertificates.filter(c => c.isEarned);
    const inProgress = formattedCertificates.filter(c => !c.isEarned);
    
    // Next certificate to earn
    const nextCertificate = inProgress.length > 0 
      ? inProgress.reduce((max, c) => c.progress > max.progress ? c : max, inProgress[0])
      : null;

    const response = {
      success: true,
      earned,
      inProgress,
      nextCertificate,
      stats: {
        totalEarned: earned.length,
        totalCertificates: allCertificates.length,
        percentComplete: Math.round((earned.length / allCertificates.length) * 100)
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
