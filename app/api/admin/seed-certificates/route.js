import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/seed-certificates
 * Seed dữ liệu demo cho chứng chỉ
 * - nqh2610@gmail.com: 2 chứng chỉ (Cộng Trừ + Toàn Diện)
 * - demo@sorokids.com: 1 chứng chỉ (Cộng Trừ)
 */
export async function POST(request) {
  try {
    const results = [];

    // Tìm 2 user
    const user1 = await prisma.user.findUnique({ where: { email: 'nqh2610@gmail.com' } });
    const user2 = await prisma.user.findUnique({ where: { email: 'demo@sorokids.com' } });

    if (!user1) {
      return NextResponse.json({ error: 'Không tìm thấy user nqh2610@gmail.com' }, { status: 404 });
    }
    if (!user2) {
      return NextResponse.json({ error: 'Không tìm thấy user demo@sorokids.com' }, { status: 404 });
    }

    results.push(`✅ Tìm thấy user 1: ${user1.name} (${user1.email})`);
    results.push(`✅ Tìm thấy user 2: ${user2.name} (${user2.email})`);

    // =====================================================
    // USER 1: nqh2610@gmail.com - 2 CHỨNG CHỈ
    // =====================================================
    
    // Cập nhật tier lên advanced
    await prisma.user.update({
      where: { id: user1.id },
      data: { tier: 'advanced' }
    });
    results.push('User1: Tier → advanced');

    // 1. Progress - Hoàn thành 18 level
    const user1Levels = Array.from({ length: 18 }, (_, i) => i + 1);
    for (const levelId of user1Levels) {
      for (let lessonId = 1; lessonId <= 5; lessonId++) {
        await prisma.progress.upsert({
          where: { userId_levelId_lessonId: { userId: user1.id, levelId, lessonId } },
          update: { completed: true, starsEarned: 3, accuracy: 95, completedAt: new Date() },
          create: { userId: user1.id, levelId, lessonId, completed: true, starsEarned: 3, accuracy: 95, completedAt: new Date() }
        });
      }
    }
    results.push('User1: 18 Level học ✓');

    // 2. Luyện tập 7 mode
    const practiceModes = ['addition', 'subtraction', 'addSubMixed', 'multiplication', 'division', 'mulDiv', 'mixed'];
    for (const mode of practiceModes) {
      for (let i = 0; i < 10; i++) {
        await prisma.exerciseResult.create({
          data: {
            userId: user1.id,
            exerciseType: mode,
            difficulty: 2 + Math.floor(i / 5),
            problem: `${mode}_${Date.now()}_${i}`,
            userAnswer: '100',
            correctAnswer: '100',
            isCorrect: true,
            timeTaken: Math.floor(Math.random() * 10000) + 5000
          }
        });
      }
    }
    results.push('User1: 7 mode Luyện tập ✓');

    // 3. Siêu Trí Tuệ - 10 bài đúng
    for (let i = 0; i < 10; i++) {
      await prisma.exerciseResult.create({
        data: {
          userId: user1.id,
          exerciseType: 'mentalMath',
          difficulty: 2,
          problem: `mental_${Date.now()}_${i}`,
          userAnswer: '50',
          correctAnswer: '50',
          isCorrect: true,
          timeTaken: Math.floor(Math.random() * 5000) + 2000
        }
      });
    }
    results.push('User1: Siêu Trí Tuệ ✓');

    // 4. Tia Chớp - 5 bài đúng level 2+
    for (let i = 0; i < 5; i++) {
      await prisma.exerciseResult.create({
        data: {
          userId: user1.id,
          exerciseType: 'flashAnzan',
          difficulty: 2 + Math.floor(i / 2),
          problem: `flash_${Date.now()}_${i}`,
          userAnswer: '30',
          correctAnswer: '30',
          isCorrect: true,
          timeTaken: Math.floor(Math.random() * 3000) + 1000
        }
      });
    }
    results.push('User1: Tia Chớp ✓');

    // 5. Thi đấu 5 mode
    const competeModes = ['addition', 'subtraction', 'multiplication', 'division', 'addSubMixed'];
    for (const mode of competeModes) {
      await prisma.competeResult.upsert({
        where: { userId_arenaId: { userId: user1.id, arenaId: `${mode}-2-10` } },
        update: { correct: 8, totalTime: 60, stars: 3 },
        create: { userId: user1.id, arenaId: `${mode}-2-10`, correct: 8, totalTime: 60, stars: 3 }
      });
    }
    results.push('User1: 5 mode Thi đấu ✓');

    // =====================================================
    // USER 2: demo@sorokids.com - 1 CHỨNG CHỈ
    // =====================================================

    // Cập nhật tier lên basic
    await prisma.user.update({
      where: { id: user2.id },
      data: { tier: 'basic' }
    });
    results.push('User2: Tier → basic');

    // 1. Progress - Hoàn thành 10 level
    const user2Levels = Array.from({ length: 10 }, (_, i) => i + 1);
    for (const levelId of user2Levels) {
      for (let lessonId = 1; lessonId <= 5; lessonId++) {
        await prisma.progress.upsert({
          where: { userId_levelId_lessonId: { userId: user2.id, levelId, lessonId } },
          update: { completed: true, starsEarned: 3, accuracy: 85, completedAt: new Date() },
          create: { userId: user2.id, levelId, lessonId, completed: true, starsEarned: 3, accuracy: 85, completedAt: new Date() }
        });
      }
    }
    results.push('User2: 10 Level học ✓');

    // 2. Luyện tập 3 mode cộng trừ
    const user2PracticeModes = ['addition', 'subtraction', 'addSubMixed'];
    for (const mode of user2PracticeModes) {
      // 8 bài đúng
      for (let i = 0; i < 8; i++) {
        await prisma.exerciseResult.create({
          data: {
            userId: user2.id,
            exerciseType: mode,
            difficulty: 2,
            problem: `${mode}_${Date.now()}_${i}`,
            userAnswer: '50',
            correctAnswer: '50',
            isCorrect: true,
            timeTaken: Math.floor(Math.random() * 10000) + 5000
          }
        });
      }
      // 2 bài sai (accuracy ~80%)
      for (let i = 0; i < 2; i++) {
        await prisma.exerciseResult.create({
          data: {
            userId: user2.id,
            exerciseType: mode,
            difficulty: 2,
            problem: `${mode}_wrong_${Date.now()}_${i}`,
            userAnswer: '99',
            correctAnswer: '100',
            isCorrect: false,
            timeTaken: Math.floor(Math.random() * 10000) + 5000
          }
        });
      }
    }
    results.push('User2: 3 mode Luyện tập ✓');

    // 3. Thi đấu 3 mode cộng trừ
    const user2CompeteModes = ['addition', 'subtraction', 'addSubMixed'];
    for (const mode of user2CompeteModes) {
      await prisma.competeResult.upsert({
        where: { userId_arenaId: { userId: user2.id, arenaId: `${mode}-2-10` } },
        update: { correct: 6, totalTime: 70, stars: 2 },
        create: { userId: user2.id, arenaId: `${mode}-2-10`, correct: 6, totalTime: 70, stars: 2 }
      });
    }
    results.push('User2: 3 mode Thi đấu ✓');

    return NextResponse.json({
      success: true,
      message: 'Seed hoàn tất! User cần vào /certificate để nhận chứng chỉ.',
      results
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
