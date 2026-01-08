import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getOrSet } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // 🔒 Rate limiting
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.NORMAL);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const arenaId = searchParams.get('arenaId');

    if (!arenaId) {
      return NextResponse.json({ error: 'Arena ID required' }, { status: 400 });
    }

    // 🚀 PERF: Cache leaderboard 5 phút (leaderboard ít thay đổi)
    const bestResults = await getOrSet(
      `compete_leaderboard_${arenaId}`,
      async () => {
        // 🔧 TỐI ƯU: Chỉ select các field cần thiết
        const results = await prisma.competeResult.findMany({
          where: { arenaId },
          orderBy: [
            { correct: 'desc' },
            { totalTime: 'asc' }
          ],
          select: {
            id: true,
            userId: true,
            correct: true,
            totalTime: true,
            stars: true,
            createdAt: true,
            user: {
              select: { name: true, avatar: true }
            }
          },
          take: 100 // Giới hạn 100 kết quả
        });

        // Lọc để chỉ lấy kết quả tốt nhất của mỗi user
        const bestResultsList = [];
        const seenUsers = new Set();
        
        for (const result of results) {
          if (!seenUsers.has(result.userId)) {
            seenUsers.add(result.userId);
            bestResultsList.push({
              id: result.id,
              oderId: result.id,
              userId: result.userId,
              userName: result.user.name,
              avatar: result.user.avatar,
              correct: result.correct,
              totalTime: result.totalTime,
              stars: result.stars,
              createdAt: result.createdAt
            });
          }
        }
        return bestResultsList;
      },
      300 // 🚀 PERF: Cache 5 phút (300s)
    );

    const userId = session.user.id;

    // Thêm isCurrentUser flag
    const resultsWithFlag = bestResults.map(r => ({
      ...r,
      isCurrentUser: r.userId === userId
    }));

    // Tìm thứ hạng của user hiện tại
    const currentUserRank = resultsWithFlag.findIndex(r => r.isCurrentUser) + 1;
    const currentUserData = resultsWithFlag.find(r => r.isCurrentUser);

    return NextResponse.json({ 
      leaderboard: resultsWithFlag.slice(0, 20),
      totalPlayers: resultsWithFlag.length,
      currentUserRank: currentUserRank > 0 ? currentUserRank : null,
      currentUserData: currentUserData || null
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
