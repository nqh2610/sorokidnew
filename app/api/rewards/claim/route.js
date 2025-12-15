import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { invalidateUserCache } from '@/lib/cache';
import { withApiProtection } from '@/lib/apiWrapper';

export const dynamic = 'force-dynamic';

/**
 * POST /api/rewards/claim
 * Nhận thưởng từ nhiệm vụ hoặc thành tích
 * 
 * Body: { type: 'quest' | 'achievement', id: string }
 */
export const POST = withApiProtection(async (request) => {
  // 🔒 Rate limiting STRICT cho claim rewards (tránh abuse)
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
  if (rateLimitError) {
    return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { type, id } = await request.json();

  if (!type || !id) {
    return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });
  }

  let reward = { stars: 0, diamonds: 0, name: '', icon: '' };
  let updatedUser;

  // 🔧 TỐI ƯU: Dùng transaction để đảm bảo atomic
  if (type === 'quest') {
    const result = await prisma.$transaction(async (tx) => {
      const userQuest = await tx.userQuest.findUnique({
        where: {
          userId_questId: { userId, questId: id }
        },
        include: { quest: true }
      });

      if (!userQuest) throw new Error('Quest not found');
      if (!userQuest.completed) throw new Error('Quest not completed');
      if (userQuest.claimedAt) throw new Error('Reward already claimed');

      // Cập nhật trạng thái và cộng thưởng trong 1 transaction
      await tx.userQuest.update({
        where: { id: userQuest.id },
        data: { claimedAt: new Date() }
      });

      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          totalStars: { increment: userQuest.quest.stars },
          diamonds: { increment: userQuest.quest.diamonds }
        },
        select: { totalStars: true, diamonds: true }
      });

      return {
        reward: {
          stars: userQuest.quest.stars,
          diamonds: userQuest.quest.diamonds,
          name: userQuest.quest.title,
          icon: userQuest.quest.title.split(' ')[0]
        },
        user: updated
      };
    });

    reward = result.reward;
    updatedUser = result.user;

  } else if (type === 'achievement') {
    const result = await prisma.$transaction(async (tx) => {
      const userAchievement = await tx.userAchievement.findUnique({
        where: {
          userId_achievementId: { userId, achievementId: id }
        },
        include: { achievement: true }
      });

      if (!userAchievement) throw new Error('Achievement not unlocked');
      
      // 🔧 FIX: Check if already claimed để tránh double-claim
      if (userAchievement.claimedAt) throw new Error('Achievement reward already claimed');
      
      // 🔧 FIX: Mark achievement as claimed
      await tx.userAchievement.update({
        where: { id: userAchievement.id },
        data: { claimedAt: new Date() }
      });

      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          totalStars: { increment: userAchievement.achievement.stars },
          diamonds: { increment: userAchievement.achievement.diamonds }
        },
        select: { totalStars: true, diamonds: true }
      });

      return {
        reward: {
          stars: userAchievement.achievement.stars,
          diamonds: userAchievement.achievement.diamonds,
          name: userAchievement.achievement.name,
          icon: userAchievement.achievement.icon
        },
        user: updated
      };
    });

    reward = result.reward;
    updatedUser = result.user;
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  // 🔧 Invalidate cache
  invalidateUserCache(userId);

  return NextResponse.json({
    success: true,
    reward,
    user: updatedUser,
    message: `Nhận thưởng thành công: +${reward.stars}⭐ +${reward.diamonds}💎`
  });
}, { timeout: 10000, useCircuitBreaker: true }); // 10s timeout
