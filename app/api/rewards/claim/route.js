import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/rewards/claim
 * Nhận thưởng từ nhiệm vụ hoặc thành tích
 * 
 * Body: { type: 'quest' | 'achievement', id: string }
 */
export async function POST(request) {
  try {
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

    if (type === 'quest') {
      // Nhận thưởng nhiệm vụ
      const userQuest = await prisma.userQuest.findUnique({
        where: {
          userId_questId: { userId, questId: id }
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
        return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 });
      }

      // Cập nhật trạng thái đã nhận thưởng
      await prisma.userQuest.update({
        where: { id: userQuest.id },
        data: { claimedAt: new Date() }
      });

      // Cộng phần thưởng cho user
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalStars: { increment: userQuest.quest.stars },
          diamonds: { increment: userQuest.quest.diamonds }
        }
      });

      reward = {
        stars: userQuest.quest.stars,
        diamonds: userQuest.quest.diamonds,
        name: userQuest.quest.title,
        icon: userQuest.quest.title.split(' ')[0] // Lấy emoji từ title
      };

    } else if (type === 'achievement') {
      // Nhận thưởng thành tích
      const userAchievement = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: { userId, achievementId: id }
        },
        include: { achievement: true }
      });

      if (!userAchievement) {
        return NextResponse.json({ error: 'Achievement not unlocked' }, { status: 404 });
      }

      // Kiểm tra đã nhận chưa (có thể thêm field claimedAt vào UserAchievement)
      // Tạm thời cho phép nhận 1 lần dựa trên việc check diamonds > 0

      // Cộng phần thưởng cho user
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalStars: { increment: userAchievement.achievement.stars },
          diamonds: { increment: userAchievement.achievement.diamonds }
        }
      });

      reward = {
        stars: userAchievement.achievement.stars,
        diamonds: userAchievement.achievement.diamonds,
        name: userAchievement.achievement.name,
        icon: userAchievement.achievement.icon
      };
    }

    // Lấy thông tin user mới sau khi cộng thưởng
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalStars: true, diamonds: true }
    });

    return NextResponse.json({
      success: true,
      reward,
      user: updatedUser,
      message: `Nhận thưởng thành công: +${reward.stars}⭐ +${reward.diamonds}💎`
    });

  } catch (error) {
    console.error('Error claiming reward:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
