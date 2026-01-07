const { PrismaClient } = require('@prisma/client');

// Force use local database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root:@localhost:3306/sorokids'
    }
  }
});

async function main() {
  // Tìm user nguyen van a
  const users = await prisma.user.findMany({
    where: { name: { contains: 'nguyen' } },
    select: { id: true, email: true, name: true, tier: true, trialExpiresAt: true }
  });
  console.log('Users found:', JSON.stringify(users, null, 2));
  
  // Check trial settings
  const settings = await prisma.systemSettings.findUnique({
    where: { key: 'trial_settings' }
  });
  console.log('Trial Settings:', settings ? settings.value : 'NOT FOUND');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
