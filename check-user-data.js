const { PrismaClient } = require('@prisma/client');

// Use production database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://nhsortag_soro:dNu6PJPiiLo66XWz@sorokid.com:3306/nhsortag_sorokids'
    }
  }
});

async function main() {
  // Tìm user Sorokid
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { contains: 'sorokid', mode: 'insensitive' } },
        { email: { contains: 'sorokid', mode: 'insensitive' } }
      ]
    },
    select: { id: true, name: true, email: true }
  });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log('✅ User found:', user);
  
  // Kiểm tra progress
  const progress = await prisma.progress.findMany({
    where: { userId: user.id }
  });
  console.log('\n📚 Progress records:', progress.length);
  if (progress.length > 0) {
    console.log('Sample:', progress.slice(0, 5));
  }
  
  // Kiểm tra exercises
  const exercises = await prisma.exerciseResult.findMany({
    where: { userId: user.id },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log('\n🏋️ Exercise records:', exercises.length);
  if (exercises.length > 0) {
    console.log('Sample:', exercises.slice(0, 3));
  }
  
  // Kiểm tra compete
  const compete = await prisma.competeResult.findMany({
    where: { userId: user.id },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log('\n⚔️ Compete records:', compete.length);
  if (compete.length > 0) {
    console.log('Sample:', compete.slice(0, 3));
  }
  
  // Kiểm tra certificates
  const certs = await prisma.certificate.findMany({
    where: { userId: user.id }
  });
  console.log('\n🏆 Certificate records:', certs.length);
  if (certs.length > 0) {
    console.log('Certs:', certs);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
