const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Miễn Phí',
    description: 'Bắt đầu học Soroban cơ bản',
    price: 0,
    originalPrice: 0,
    icon: 'Gift',
    badge: null,
    popular: false,
    disabled: true,
    order: 0,
    features: [
      { text: '5 Level cơ bản', included: true },
      { text: 'Luyện Cộng/Trừ Sơ cấp', included: true },
      { text: 'Thi đấu Sơ cấp', included: true },
      { text: 'Không có chứng nhận', included: false },
    ],
    maxLevels: 5,
    maxDifficulty: 2,
  },
  {
    id: 'basic',
    name: 'Cơ Bản',
    description: 'Học Cộng Trừ thành thạo',
    price: 149000,
    originalPrice: 299000,
    icon: 'Star',
    badge: '🎯 Tiết kiệm 50%',
    popular: false,
    disabled: false,
    order: 1,
    features: [
      { text: '10 Level Cộng Trừ', included: true, highlight: true },
      { text: 'Luyện tập Sơ - Trung cấp', included: true },
      { text: 'Thi đấu Sơ - Trung cấp', included: true },
      { text: 'Chứng nhận Sorokid Cộng Trừ', included: true, highlight: true },
    ],
    maxLevels: 10,
    maxDifficulty: 3,
  },
  {
    id: 'advanced',
    name: 'Nâng Cao',
    description: 'Full tính năng + 2 Chứng nhận Sorokid',
    price: 249000,
    originalPrice: 499000,
    icon: 'Crown',
    badge: '🔥 Phổ biến nhất',
    popular: true,
    disabled: false,
    order: 2,
    features: [
      { text: 'Full 18 Level - Không giới hạn', included: true, highlight: true },
      { text: 'Tất cả chế độ luyện tập & thi đấu', included: true },
      { text: 'Anzan - Tính nhẩm siêu tốc', included: true, highlight: true },
      { text: '2 Chứng nhận Sorokid', included: true, highlight: true },
    ],
    maxLevels: 18,
    maxDifficulty: 5,
  },
];

async function main() {
  console.log('Seeding pricing plans...');
  
  await prisma.systemSettings.upsert({
    where: { key: 'pricing_plans' },
    update: { 
      value: JSON.stringify(PRICING_PLANS),
      updatedAt: new Date()
    },
    create: {
      key: 'pricing_plans',
      value: JSON.stringify(PRICING_PLANS),
      updatedAt: new Date()
    }
  });

  console.log('✅ Pricing plans seeded successfully!');
  
  // Verify
  const result = await prisma.systemSettings.findUnique({
    where: { key: 'pricing_plans' }
  });
  
  const plans = JSON.parse(result.value);
  console.log('\nSaved plans:');
  plans.forEach(p => {
    console.log(`- ${p.name}: ${p.price.toLocaleString()}đ (gốc: ${p.originalPrice.toLocaleString()}đ)`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
