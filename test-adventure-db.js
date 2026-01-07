const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('🔍 Testing Adventure Database...\n');
    
    // Lấy admin user
    const admin = await prisma.user.findFirst({ 
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true }
    });
    console.log('👤 Admin user:', admin);
    
    if (!admin) {
      console.log('❌ No admin found');
      return;
    }
    
    const userId = admin.id;
    
    // Kiểm tra Progress
    const progress = await prisma.progress.findMany({
      where: { userId },
      orderBy: [{ levelId: 'asc' }, { lessonId: 'asc' }]
    });
    console.log('\n📚 Progress records:', progress.length);
    if (progress.length > 0) {
      console.log('   First 5:');
      progress.slice(0, 5).forEach(p => {
        console.log(`   - Level ${p.levelId}, Lesson ${p.lessonId}: completed=${p.completed}, stars=${p.starsEarned}`);
      });
    }
    
    // Kiểm tra ExerciseResult
    const exercises = await prisma.exerciseResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    console.log('\n🏋️ Exercise results:', exercises.length);
    
    // Group by type-difficulty
    const exerciseGroups = {};
    exercises.forEach(e => {
      const key = `${e.exerciseType}-${e.difficulty}`;
      if (!exerciseGroups[key]) exerciseGroups[key] = { total: 0, correct: 0 };
      exerciseGroups[key].total++;
      if (e.isCorrect) exerciseGroups[key].correct++;
    });
    console.log('   Grouped:');
    Object.entries(exerciseGroups).forEach(([key, val]) => {
      console.log(`   - ${key}: ${val.correct}/${val.total} correct`);
    });
    
    // Kiểm tra CompeteResult
    const compete = await prisma.competeResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    console.log('\n🏆 Compete results:', compete.length);
    if (compete.length > 0) {
      console.log('   Recent:');
      compete.slice(0, 5).forEach(c => {
        const pct = c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0;
        console.log(`   - Arena: ${c.arenaId}, Score: ${c.correct}/${c.total} (${pct}%)`);
      });
    }
    
    // Kiểm tra Certificate
    const certs = await prisma.certificate.findMany({
      where: { userId }
    });
    console.log('\n📜 Certificates:', certs.length);
    certs.forEach(c => {
      console.log(`   - ${c.certType}`);
    });
    
    console.log('\n✅ Test completed!');
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
