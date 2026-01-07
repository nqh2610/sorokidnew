import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { invalidateUserCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // 🔒 Rate limiting cho compete (moderate - tránh spam)
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.MODERATE);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { arenaId, correct, total, totalTime, stars } = await request.json();

    if (!arenaId || correct === undefined || !totalTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Parse total từ arenaId nếu không có (format: mode-difficulty-questions)
    const totalQuestions = total || parseInt(arenaId.split('-').pop()) || 10;

    // 🔧 TỐI ƯU: Dùng transaction và tối ưu queries
    const result = await prisma.$transaction(async (tx) => {
      // Kiểm tra xem user đã có kết quả trong đấu trường này chưa
      const existingResult = await tx.competeResult.findFirst({
        where: {
          userId: session.user.id,
          arenaId
        },
        select: { id: true, correct: true, totalTime: true }
      });

      let competeResult;
      let isNewRecord = false;

      if (existingResult) {
        // So sánh: số câu đúng quan trọng hơn, nếu bằng nhau thì so thời gian
        const isBetter = 
          correct > existingResult.correct || 
          (correct === existingResult.correct && totalTime < existingResult.totalTime);

        if (isBetter) {
          competeResult = await tx.competeResult.update({
            where: { id: existingResult.id },
            data: {
              correct,
              totalTime,
              stars: stars || 0,
              updatedAt: new Date()
            }
          });
          isNewRecord = true;
        } else {
          competeResult = existingResult;
        }
      } else {
        competeResult = await tx.competeResult.create({
          data: {
            userId: session.user.id,
            arenaId,
            correct,
            totalTime,
            stars: stars || 0
          }
        });
        isNewRecord = true;
      }

      return { competeResult, isNewRecord };
    });

    // 🔧 TỐI ƯU: Lấy rank với query tối ưu (giới hạn top 100)
    const allResults = await prisma.competeResult.findMany({
      where: { arenaId },
      select: { userId: true, correct: true, totalTime: true },
      orderBy: [
        { correct: 'desc' },
        { totalTime: 'asc' }
      ],
      take: 100 // Giới hạn để tiết kiệm resources
    });

    // Lọc kết quả tốt nhất của mỗi user
    const bestResults = [];
    const seenUsers = new Set();
    
    for (const r of allResults) {
      if (!seenUsers.has(r.userId)) {
        seenUsers.add(r.userId);
        bestResults.push(r);
      }
    }

    const rank = bestResults.findIndex(r => r.userId === session.user.id) + 1;

    // Invalidate cache
    invalidateUserCache(session.user.id);

    return NextResponse.json({
      success: true,
      result: result.competeResult,
      rank: rank || '>100',
      totalPlayers: seenUsers.size,
      isNewRecord: result.isNewRecord
    });
  } catch (error) {
    console.error('Error saving compete result:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
