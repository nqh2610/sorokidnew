const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('123456', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@sorokids.com' },
    update: {
      password: hashedPassword,
      name: 'Demo User',
      level: 5,
      totalStars: 450,
      diamonds: 25,
      streak: 7,
      role: 'student'
    },
    create: {
      email: 'demo@sorokids.com',
      username: 'demo_user',
      password: hashedPassword,
      name: 'Demo User',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      level: 5,
      totalStars: 450,
      diamonds: 25,
      streak: 7,
      role: 'student',
      lastLoginDate: new Date()
    },
  });
  console.log('✅ Demo user created:', demoUser.email);

  // Create some sample users for leaderboard
  const sampleUsers = [
    { email: 'alice@sorokids.com', username: 'alice_nguyen', name: 'Alice Nguyễn', totalStars: 850, level: 8, streak: 15, diamonds: 120 },
    { email: 'bob@sorokids.com', username: 'bob_tran', name: 'Bob Trần', totalStars: 720, level: 7, streak: 10, diamonds: 95 },
    { email: 'charlie@sorokids.com', username: 'charlie_le', name: 'Charlie Lê', totalStars: 680, level: 6, streak: 8, diamonds: 80 },
    { email: 'diana@sorokids.com', username: 'diana_pham', name: 'Diana Phạm', totalStars: 590, level: 6, streak: 12, diamonds: 75 },
    { email: 'evan@sorokids.com', username: 'evan_vo', name: 'Evan Võ', totalStars: 520, level: 5, streak: 5, diamonds: 60 },
    { email: 'fiona@sorokids.com', username: 'fiona_hoang', name: 'Fiona Hoàng', totalStars: 480, level: 5, streak: 7, diamonds: 55 },
    { email: 'george@sorokids.com', username: 'george_dang', name: 'George Đặng', totalStars: 420, level: 4, streak: 4, diamonds: 45 },
    { email: 'hannah@sorokids.com', username: 'hannah_bui', name: 'Hannah Bùi', totalStars: 380, level: 4, streak: 6, diamonds: 40 },
    { email: 'ivan@sorokids.com', username: 'ivan_do', name: 'Ivan Đỗ', totalStars: 340, level: 3, streak: 3, diamonds: 35 },
    { email: 'julia@sorokids.com', username: 'julia_ngo', name: 'Julia Ngô', totalStars: 290, level: 3, streak: 2, diamonds: 30 }
  ];

  for (const userData of sampleUsers) {
    const userPassword = await bcrypt.hash('123456', 12);
    await prisma.user.upsert({
      where: { email: userData.email },
      update: userData,
      create: {
        ...userData,
        password: userPassword,
        role: 'student',
        lastLoginDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random within last 7 days
      }
    });
  }
  console.log(`✅ Created ${sampleUsers.length} sample users for leaderboard`);

  console.log('✅ Seeding completed!');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
