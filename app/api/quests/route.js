import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/quests
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // daily, weekly, special

    const where = {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ],
      ...(type && { type })
    };

    const quests = await prisma.quest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Get user progress for these quests
    const userQuests = await prisma.userQuest.findMany({
      where: {
        userId: session.user.id,
        questId: { in: quests.map(q => q.id) }
      }
    });

    const questsWithProgress = quests.map(quest => {
      const userQuest = userQuests.find(uq => uq.questId === quest.id);
      const requirement = JSON.parse(quest.requirement);

      return {
        ...quest,
        requirement,
        progress: userQuest?.progress || 0,
        completed: userQuest?.completed || false,
        claimed: !!userQuest?.claimedAt,
        userQuestId: userQuest?.id
      };
    });

    return NextResponse.json({ quests: questsWithProgress });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/quests - Claim quest reward
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questId } = await request.json();

    const userQuest = await prisma.userQuest.findUnique({
      where: {
        userId_questId: {
          userId: session.user.id,
          questId
        }
      },
      include: { quest: true }
    });

    if (!userQuest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    if (!userQuest.completed) {
      return NextResponse.json({ error: 'Quest not completed' }, { status: 400 });
    }

    if (userQuest.claimedAt) {
      return NextResponse.json({ error: 'Quest already claimed' }, { status: 400 });
    }

    // Mark as claimed
    await prisma.userQuest.update({
      where: { id: userQuest.id },
      data: { claimedAt: new Date() }
    });

    // Award rewards
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalStars: { increment: userQuest.quest.stars },
        diamonds: { increment: userQuest.quest.diamonds }
      }
    });

    return NextResponse.json({
      success: true,
      rewards: {
        stars: userQuest.quest.stars,
        diamonds: userQuest.quest.diamonds
      }
    });
  } catch (error) {
    console.error('Error claiming quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
