// Set DATABASE_URL directly
process.env.DATABASE_URL = 'mysql://root:@localhost:3306/sorokids';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    // Tìm tất cả Progress records có lessonId không tồn tại trong Lesson table
    const orphanProgress = await prisma.$queryRaw`
      SELECT p.userId, p.levelId, p.lessonId, p.completed, p.starsEarned
      FROM progress p
      LEFT JOIN lessons l ON p.levelId = l.levelId AND p.lessonId = l.lessonId
      WHERE l.lessonId IS NULL
    `;
    
    console.log('\n=== PROGRESS "MỒ CÔI" (lessonId không còn tồn tại) ===\n');
    console.log('Tổng số records mồ côi:', orphanProgress.length);
    
    if (orphanProgress.length > 0) {
      // Group by levelId để dễ nhìn
      const byLevel = {};
      orphanProgress.forEach(p => {
        if (!byLevel[p.levelId]) byLevel[p.levelId] = [];
        byLevel[p.levelId].push(p.lessonId);
      });
      
      console.log('\nChi tiết:');
      Object.keys(byLevel).sort((a,b) => a-b).forEach(levelId => {
        console.log(`  Level ${levelId}: Lesson ${byLevel[levelId].join(', ')}`);
      });
      
      console.log('\n⚠️ Để xóa các records mồ côi này, chạy lệnh sau:');
      console.log('   node cleanup-orphan-progress.js');
      
      // Tạo script cleanup
      const cleanupScript = `
// cleanup-orphan-progress.js
process.env.DATABASE_URL = 'mysql://root:@localhost:3306/sorokids';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  try {
    // Xóa Progress records có lessonId không tồn tại trong Lesson
    const result = await prisma.$executeRaw\`
      DELETE p FROM Progress p
      LEFT JOIN Lesson l ON p.levelId = l.levelId AND p.lessonId = l.lessonId
      WHERE l.lessonId IS NULL
    \`;
    console.log('✅ Đã xóa', result, 'Progress records mồ côi');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}
cleanup();
`;
      require('fs').writeFileSync('cleanup-orphan-progress.js', cleanupScript.trim());
      console.log('   (Script đã được tạo)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
