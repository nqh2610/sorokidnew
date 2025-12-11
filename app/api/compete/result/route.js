import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { arenaId, correct, totalTime, stars } = await request.json();

    if (!arenaId || correct === undefined || !totalTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Kiểm tra xem user đã có kết quả trong đấu trường này chưa
    const existingResult = await prisma.competeResult.findFirst({
      where: {
        userId: session.user.id,
        arenaId
      }
    });

    let result;
    let isNewRecord = false;

    if (existingResult) {
      // So sánh: số câu đúng quan trọng hơn, nếu bằng nhau thì so thời gian
      const isBetter = 
        correct > existingResult.correct || 
        (correct === existingResult.correct && totalTime < existingResult.totalTime);

      if (isBetter) {
        // Cập nhật kết quả tốt hơn
        result = await prisma.competeResult.update({
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
        result = existingResult;
      }
    } else {
      // Tạo kết quả mới
      result = await prisma.competeResult.create({
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

    // Lấy hạng hiện tại
    const allResults = await prisma.competeResult.findMany({
      where: { arenaId },
      orderBy: [
        { correct: 'desc' },
        { totalTime: 'asc' }
      ]
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

    return NextResponse.json({
      success: true,
      result,
      rank,
      totalPlayers: seenUsers.size,
      isNewRecord
    });
  } catch (error) {
    console.error('Error saving compete result:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
