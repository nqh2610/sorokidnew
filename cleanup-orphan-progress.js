// cleanup-orphan-progress.js
process.env.DATABASE_URL = 'mysql://root:@localhost:3306/sorokids';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  try {
    // Xóa Progress records có lessonId không tồn tại trong Lesson
    const result = await prisma.$executeRaw`
      DELETE p FROM Progress p
      LEFT JOIN Lesson l ON p.levelId = l.levelId AND p.lessonId = l.lessonId
      WHERE l.lessonId IS NULL
    `;
    console.log('✅ Đã xóa', result, 'Progress records mồ côi');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}
cleanup();