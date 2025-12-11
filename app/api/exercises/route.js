import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/exercises - Save exercise result
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { exerciseType, difficulty, problem, userAnswer, correctAnswer, isCorrect, timeTaken } = body;

    // Validate input
    if (!exerciseType || !problem || userAnswer === undefined || correctAnswer === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save exercise result
    const result = await prisma.exerciseResult.create({
      data: {
        userId: session.user.id,
        exerciseType,
        difficulty: difficulty || 1,
        problem,
        userAnswer: String(userAnswer),
        correctAnswer: String(correctAnswer),
        isCorrect: !!isCorrect,
        timeTaken: timeTaken || 0
      }
    });

    // Award stars if correct
    let starsEarned = 0;
    if (isCorrect) {
      starsEarned = 10 * (difficulty || 1);
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalStars: { increment: starsEarned }
        }
      });
    }

    // Update quest progress
    await updateQuestProgress(session.user.id, 'complete_exercises', 1);

    // Check achievements
    await checkExerciseAchievements(session.user.id);

    return NextResponse.json({ result, starsEarned, success: true });
  } catch (error) {
    console.error('Error saving exercise result:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/exercises - Get exercise history
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const type = searchParams.get('type');

    const where = {
      userId: session.user.id,
      ...(type && { exerciseType: type })
    };

    const exercises = await prisma.exerciseResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Calculate statistics
    const stats = {
      total: exercises.length,
      correct: exercises.filter(e => e.isCorrect).length,
      accuracy: exercises.length > 0
        ? (exercises.filter(e => e.isCorrect).length / exercises.length) * 100
        : 0,
      avgTime: exercises.length > 0
        ? exercises.reduce((sum, e) => sum + e.timeTaken, 0) / exercises.length
        : 0
    };

    return NextResponse.json({ exercises, stats });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to update quest progress
async function updateQuestProgress(userId, questType, increment) {
  try {
    const activeQuests = await prisma.quest.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    for (const quest of activeQuests) {
      const req = JSON.parse(quest.requirement);
      if (req.type === questType) {
        const userQuest = await prisma.userQuest.findUnique({
          where: {
            userId_questId: {
              userId,
              questId: quest.id
            }
          }
        });

        if (userQuest && !userQuest.completed) {
          const newProgress = userQuest.progress + increment;
          const completed = newProgress >= req.count;

          await prisma.userQuest.update({
            where: { id: userQuest.id },
            data: {
              progress: newProgress,
              completed
            }
          });

          if (completed) {
            // Create notification
            await prisma.notification.create({
              data: {
                userId,
                type: 'quest',
                title: 'Nhiệm vụ hoàn thành!',
                message: `Bạn đã hoàn thành nhiệm vụ "${quest.title}"! Hãy nhận phần thưởng!`,
                data: JSON.stringify({ questId: quest.id })
              }
            });
          }
        } else if (!userQuest) {
          // Create new user quest
          await prisma.userQuest.create({
            data: {
              userId,
              questId: quest.id,
              progress: increment,
              completed: increment >= req.count
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error updating quest progress:', error);
  }
}

// Helper function to check exercise-related achievements
async function checkExerciseAchievements(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        exercises: {
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        achievements: true
      }
    });

    if (!user) return;

    const allAchievements = await prisma.achievement.findMany({
      where: {
        category: { in: ['practice', 'accuracy'] }
      }
    });

    const unlockedIds = user.achievements.map(ua => ua.achievementId);

    for (const achievement of allAchievements) {
      if (unlockedIds.includes(achievement.id)) continue;

      const req = JSON.parse(achievement.requirement);
      let shouldUnlock = false;

      if (req.type === 'complete_exercises') {
        shouldUnlock = user.exercises.length >= req.count;
      } else if (req.type === 'perfect_accuracy') {
        const recent = user.exercises.slice(0, req.count);
        shouldUnlock = recent.length === req.count && recent.every(e => e.isCorrect);
      }

      if (shouldUnlock) {
        await prisma.userAchievement.create({
          data: {
            userId: user.id,
            achievementId: achievement.id
          }
        });

        await prisma.user.update({
          where: { id: user.id },
          data: {
            totalStars: { increment: achievement.stars },
            diamonds: { increment: achievement.diamonds }
          }
        });

        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'achievement',
            title: 'Thành tích mới!',
            message: `Bạn đã mở khóa "${achievement.name}"!`,
            data: JSON.stringify({ achievementId: achievement.id })
          }
        });
      }
    }
  } catch (error) {
    console.error('Error checking exercise achievements:', error);
  }
}
