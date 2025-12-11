import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const arenaId = searchParams.get('arenaId');

    if (!arenaId) {
      return NextResponse.json({ error: 'Arena ID required' }, { status: 400 });
    }

    // Lấy kết quả tốt nhất của mỗi người chơi trong đấu trường này
    // Sắp xếp theo: số câu đúng (giảm dần), sau đó tổng thời gian (tăng dần)
    const results = await prisma.competeResult.findMany({
      where: { arenaId },
      orderBy: [
        { correct: 'desc' },
        { totalTime: 'asc' }
      ],
      include: {
        user: {
          select: { name: true }
        }
      },
      take: 50
    });

    // Lọc để chỉ lấy kết quả tốt nhất của mỗi user
    const bestResults = [];
    const seenUsers = new Set();
    
    for (const result of results) {
      if (!seenUsers.has(result.userId)) {
        seenUsers.add(result.userId);
        bestResults.push({
          id: result.id,
          oderId: result.oderId,
          userName: result.user.name,
          correct: result.correct,
          totalTime: result.totalTime,
          stars: result.stars,
          createdAt: result.createdAt,
          isCurrentUser: result.userId === session.user.id
        });
      }
    }

    // Tìm thứ hạng của user hiện tại
    const currentUserRank = bestResults.findIndex(r => r.isCurrentUser) + 1;
    const currentUserData = bestResults.find(r => r.isCurrentUser);

    // Trả về Top 20 và thông tin user hiện tại
    return NextResponse.json({ 
      leaderboard: bestResults.slice(0, 20),
      totalPlayers: bestResults.length,
      currentUserRank: currentUserRank > 0 ? currentUserRank : null,
      currentUserData: currentUserData || null
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
