import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { cache, CACHE_KEYS, CACHE_TTL, getOrSet } from '@/lib/cache';
import { withTimeout, withApiProtection } from '@/lib/apiWrapper';

export const dynamic = 'force-dynamic';

// GET /api/quests
export const GET = withTimeout(async (request) => {
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
    const type = searchParams.get('type'); // daily, weekly, special

    // 🔧 TỐI ƯU: Cache quests config (ít thay đổi)
    const quests = await getOrSet(
      CACHE_KEYS.QUESTS + (type || ''),
      async () => {
        const where = {
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ],
          ...(type && { type })
        };

        return prisma.quest.findMany({
          where,
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            requirement: true,
            stars: true,
            diamonds: true
          },
          orderBy: { createdAt: 'desc' }
        });
      },
      CACHE_TTL.LONG
    );

    // Get user progress for these quests (không cache)
    const userQuests = await prisma.userQuest.findMany({
      where: {
        userId: session.user.id,
        questId: { in: quests.map(q => q.id) }
      },
      select: {
        questId: true,
        progress: true,
        completed: true,
        claimedAt: true,
        id: true
      }
    });

    const questsWithProgress = quests.map(quest => {
      const userQuest = userQuests.find(uq => uq.questId === quest.id);
      
      // 🔧 Safe JSON parse với fallback
      let requirement = {};
      try {
        requirement = quest.requirement ? JSON.parse(quest.requirement) : {};
      } catch (e) {
        console.error(`Failed to parse requirement for quest ${quest.id}:`, e.message);
        requirement = {};
      }

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
}, 10000); // 10s timeout

// POST /api/quests - Claim quest reward
export const POST = withApiProtection(async (request) => {
  // 🔒 Rate limiting cho claim (strict - tránh abuse)
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
  if (rateLimitError) {
    return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { questId } = await request.json();

  // 🔧 TỐI ƯU: Dùng transaction
  const result = await prisma.$transaction(async (tx) => {
    const userQuest = await tx.userQuest.findUnique({
        where: {
          userId_questId: {
            userId: session.user.id,
            questId
          }
        },
        include: { quest: true }
      });

      if (!userQuest) {
        throw new Error('Quest not found');
      }

      if (!userQuest.completed) {
        throw new Error('Quest not completed');
      }

      if (userQuest.claimedAt) {
        throw new Error('Quest already claimed');
      }

      // Mark as claimed
      await tx.userQuest.update({
        where: { id: userQuest.id },
        data: { claimedAt: new Date() }
      });

      // Award rewards - PHẢI DÙNG tx TRONG transaction
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          totalStars: { increment: userQuest.quest.stars },
          diamonds: { increment: userQuest.quest.diamonds }
        }
      });

      return {
        stars: userQuest.quest.stars,
        diamonds: userQuest.quest.diamonds
      };
    });

    return NextResponse.json({
      success: true,
      rewards: result
    });
}, { timeout: 10000, useCircuitBreaker: true }); // 10s timeout
