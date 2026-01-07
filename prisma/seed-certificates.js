/**
 * Seed script để tạo dữ liệu demo cho chứng chỉ
 * - nqh2610@gmail.com: Hoàn thành 2 chứng chỉ (Cộng Trừ + Toàn Diện)
 * - demo@sorokids.com: Hoàn thành 1 chứng chỉ (Cộng Trừ)
 * 
 * Chạy: node prisma/seed-certificates.js
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Bắt đầu seed dữ liệu chứng chỉ...\n');

  // Tìm 2 user
  const user1 = await prisma.user.findUnique({ where: { email: 'nqh2610@gmail.com' } });
  const user2 = await prisma.user.findUnique({ where: { email: 'demo@sorokids.com' } });

  if (!user1) {
    console.log('❌ Không tìm thấy user nqh2610@gmail.com');
    return;
  }
  if (!user2) {
    console.log('❌ Không tìm thấy user demo@sorokids.com');
    return;
  }

  console.log(`✅ Tìm thấy user 1: ${user1.name} (${user1.email})`);
  console.log(`✅ Tìm thấy user 2: ${user2.name} (${user2.email})`);

  // =====================================================
  // USER 1: nqh2610@gmail.com - 2 CHỨNG CHỈ
  // Cần: Chứng chỉ Cộng Trừ + Chứng chỉ Toàn Diện
  // =====================================================
  console.log('\n📝 Seeding cho user 1 (2 chứng chỉ)...');
  
  // Cập nhật tier lên advanced để có thể nhận cả 2 chứng chỉ
  await prisma.user.update({
    where: { id: user1.id },
    data: { tier: 'advanced' }
  });
  console.log('  ✓ Tier: advanced');

  // 1. Progress - Hoàn thành 18 level (cho cả 2 chứng chỉ)
  const user1Levels = Array.from({ length: 18 }, (_, i) => i + 1);
  for (const levelId of user1Levels) {
    // Mỗi level có 5 lesson
    for (let lessonId = 1; lessonId <= 5; lessonId++) {
      await prisma.progress.upsert({
        where: {
          userId_levelId_lessonId: {
            userId: user1.id,
            levelId,
            lessonId
          }
        },
        update: {
          completed: true,
          starsEarned: 3,
          accuracy: 95,
          completedAt: new Date()
        },
        create: {
          userId: user1.id,
          levelId,
          lessonId,
          completed: true,
          starsEarned: 3,
          accuracy: 95,
          completedAt: new Date()
        }
      });
    }
  }
  console.log('  ✓ Hoàn thành 18 Level học');

  // 2. ExerciseResult - Luyện tập 7 mode (cho Chứng chỉ Toàn Diện)
  const practiceModes = [
    'addition', 'subtraction', 'addSubMixed',
    'multiplication', 'division', 'mulDiv', 'mixed'
  ];
  
  for (const mode of practiceModes) {
    // Tạo 10 bài đúng cho mỗi mode ở difficulty 2+
    for (let i = 0; i < 10; i++) {
      await prisma.exerciseResult.create({
        data: {
          userId: user1.id,
          exerciseType: mode,
          difficulty: 2 + Math.floor(i / 5), // difficulty 2-3
          problem: `${mode}_problem_${i}`,
          userAnswer: '100',
          correctAnswer: '100',
          isCorrect: true,
          timeTaken: Math.floor(Math.random() * 10000) + 5000
        }
      });
    }
  }
  console.log('  ✓ Luyện tập 7 mode (10 bài đúng/mode)');

  // 3. Mental Math - 10 bài đúng
  for (let i = 0; i < 10; i++) {
    await prisma.exerciseResult.create({
      data: {
        userId: user1.id,
        exerciseType: 'mentalMath',
        difficulty: 2,
        problem: `mentalMath_${i}`,
        userAnswer: '50',
        correctAnswer: '50',
        isCorrect: true,
        timeTaken: Math.floor(Math.random() * 5000) + 2000
      }
    });
  }
  console.log('  ✓ Siêu Trí Tuệ: 10 bài đúng');

  // 4. Flash Anzan - 5 bài đúng ở level 2+
  for (let i = 0; i < 5; i++) {
    await prisma.exerciseResult.create({
      data: {
        userId: user1.id,
        exerciseType: 'flashAnzan',
        difficulty: 2 + Math.floor(i / 2), // level 2-3
        problem: `flashAnzan_level${2 + Math.floor(i / 2)}_${i}`,
        userAnswer: '30',
        correctAnswer: '30',
        isCorrect: true,
        timeTaken: Math.floor(Math.random() * 3000) + 1000
      }
    });
  }
  console.log('  ✓ Tia Chớp: 5 bài đúng (level 2+)');

  // 5. CompeteResult - Thi đấu 4 mode
  const competeModes = ['addition', 'subtraction', 'multiplication', 'division'];
  for (const mode of competeModes) {
    await prisma.competeResult.upsert({
      where: {
        userId_arenaId: {
          userId: user1.id,
          arenaId: `${mode}-2-10` // mode-difficulty-questionCount
        }
      },
      update: {
        correct: 8,
        totalTime: 60,
        stars: 3
      },
      create: {
        userId: user1.id,
        arenaId: `${mode}-2-10`,
        correct: 8,
        totalTime: 60,
        stars: 3
      }
    });
  }
  // Thêm addSubMixed cho Chứng chỉ Cộng Trừ
  await prisma.competeResult.upsert({
    where: {
      userId_arenaId: {
        userId: user1.id,
        arenaId: 'addSubMixed-2-10'
      }
    },
    update: { correct: 7, totalTime: 65, stars: 2 },
    create: {
      userId: user1.id,
      arenaId: 'addSubMixed-2-10',
      correct: 7,
      totalTime: 65,
      stars: 2
    }
  });
  console.log('  ✓ Thi đấu 5 mode (7-8 câu đúng/mode)');

  // =====================================================
  // USER 2: demo@sorokids.com - 1 CHỨNG CHỈ
  // Cần: Chứng chỉ Cộng Trừ
  // =====================================================
  console.log('\n📝 Seeding cho user 2 (1 chứng chỉ)...');

  // Cập nhật tier lên basic
  await prisma.user.update({
    where: { id: user2.id },
    data: { tier: 'basic' }
  });
  console.log('  ✓ Tier: basic');

  // 1. Progress - Hoàn thành 10 level (cho Chứng chỉ Cộng Trừ)
  const user2Levels = Array.from({ length: 10 }, (_, i) => i + 1);
  for (const levelId of user2Levels) {
    for (let lessonId = 1; lessonId <= 5; lessonId++) {
      await prisma.progress.upsert({
        where: {
          userId_levelId_lessonId: {
            userId: user2.id,
            levelId,
            lessonId
          }
        },
        update: {
          completed: true,
          starsEarned: 3,
          accuracy: 85,
          completedAt: new Date()
        },
        create: {
          userId: user2.id,
          levelId,
          lessonId,
          completed: true,
          starsEarned: 3,
          accuracy: 85,
          completedAt: new Date()
        }
      });
    }
  }
  console.log('  ✓ Hoàn thành 10 Level học');

  // 2. ExerciseResult - Luyện tập 3 mode cộng trừ
  const user2PracticeModes = ['addition', 'subtraction', 'addSubMixed'];
  for (const mode of user2PracticeModes) {
    for (let i = 0; i < 8; i++) {
      await prisma.exerciseResult.create({
        data: {
          userId: user2.id,
          exerciseType: mode,
          difficulty: 2,
          problem: `${mode}_problem_${i}`,
          userAnswer: '50',
          correctAnswer: '50',
          isCorrect: true,
          timeTaken: Math.floor(Math.random() * 10000) + 5000
        }
      });
    }
    // Thêm 2 bài sai để có accuracy ~80%
    for (let i = 0; i < 2; i++) {
      await prisma.exerciseResult.create({
        data: {
          userId: user2.id,
          exerciseType: mode,
          difficulty: 2,
          problem: `${mode}_wrong_${i}`,
          userAnswer: '99',
          correctAnswer: '100',
          isCorrect: false,
          timeTaken: Math.floor(Math.random() * 10000) + 5000
        }
      });
    }
  }
  console.log('  ✓ Luyện tập 3 mode cộng trừ');

  // 3. CompeteResult - Thi đấu 3 mode cộng trừ
  const user2CompeteModes = ['addition', 'subtraction', 'addSubMixed'];
  for (const mode of user2CompeteModes) {
    await prisma.competeResult.upsert({
      where: {
        userId_arenaId: {
          userId: user2.id,
          arenaId: `${mode}-2-10`
        }
      },
      update: { correct: 6, totalTime: 70, stars: 2 },
      create: {
        userId: user2.id,
        arenaId: `${mode}-2-10`,
        correct: 6,
        totalTime: 70,
        stars: 2
      }
    });
  }
  console.log('  ✓ Thi đấu 3 mode cộng trừ');

  console.log('\n✅ Hoàn thành seed dữ liệu!');
  console.log('📌 Lưu ý: User cần vào trang /certificate và bấm "Nhận chứng chỉ" để claim.');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
