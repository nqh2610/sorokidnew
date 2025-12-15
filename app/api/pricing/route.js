import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getOrSet, CACHE_TTL } from '@/lib/cache';

// Default pricing plans nếu chưa có trong DB
const DEFAULT_PLANS = [
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
    price: 199000,
    originalPrice: 299000,
    icon: 'Star',
    badge: null,
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
    price: 299000,
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

// GET /api/pricing - Lấy danh sách gói (public)
export async function GET(request) {
  try {
    // TỐI ƯU: Cache pricing plans (30 giây - ngắn hơn để cập nhật nhanh khi admin thay đổi)
    const plans = await getOrSet(
      'pricing_plans_public',
      async () => {
        const pricingSettings = await prisma.systemSettings.findUnique({
          where: { key: 'pricing_plans' },
          select: { value: true }
        });

        if (pricingSettings?.value) {
          try {
            const parsed = JSON.parse(pricingSettings.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.sort((a, b) => (a.order || 0) - (b.order || 0));
            }
          } catch (e) {
            console.log('Error parsing pricing plans:', e.message);
          }
        }
        return DEFAULT_PLANS;
      },
      CACHE_TTL.SHORT // 30 seconds - để cập nhật nhanh khi admin thay đổi giá
    );

    return NextResponse.json({ 
      success: true,
      plans 
    });

  } catch (error) {
    console.error('Error fetching pricing:', error);
    // Trả về default nếu lỗi
    return NextResponse.json({ 
      success: true,
      plans: DEFAULT_PLANS 
    });
  }
}
