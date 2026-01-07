import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cache } from '@/lib/cache';

// Default pricing plans
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

// GET /api/admin/pricing - Lấy danh sách gói (admin)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Đọc từ database
    const pricingSettings = await prisma.systemSettings.findUnique({
      where: { key: 'pricing_plans' }
    });

    let plans = DEFAULT_PLANS;
    
    if (pricingSettings?.value) {
      try {
        const parsed = JSON.parse(pricingSettings.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          plans = parsed;
        }
      } catch (e) {
        // Error parsing pricing plans
      }
    }

    // Sort theo order
    plans.sort((a, b) => (a.order || 0) - (b.order || 0));

    return NextResponse.json({ 
      success: true,
      plans 
    });

  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/pricing - Lưu tất cả gói
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plans } = await request.json();

    if (!Array.isArray(plans)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Validate từng plan
    for (const plan of plans) {
      if (!plan.id || !plan.name) {
        return NextResponse.json({ error: 'Mỗi gói cần có id và name' }, { status: 400 });
      }
    }

    // Lưu vào database
    await prisma.systemSettings.upsert({
      where: { key: 'pricing_plans' },
      update: { 
        value: JSON.stringify(plans), 
        updatedAt: new Date() 
      },
      create: { 
        key: 'pricing_plans', 
        value: JSON.stringify(plans), 
        updatedAt: new Date() 
      }
    });

    // 🔧 FIX: Xóa TẤT CẢ cache pricing để cập nhật ngay lập tức
    cache.delete('pricing_plans_public');
    cache.delete('pricing_plans');  // Cache trong API payment
    cache.deletePattern('pricing');  // Các cache khác có prefix pricing

    return NextResponse.json({ 
      success: true, 
      message: 'Đã lưu danh sách gói thành công'
    });

  } catch (error) {
    console.error('Error saving pricing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/pricing - Cập nhật 1 gói
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!plan?.id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Đọc plans hiện tại
    const pricingSettings = await prisma.systemSettings.findUnique({
      where: { key: 'pricing_plans' }
    });

    let plans = DEFAULT_PLANS;
    if (pricingSettings?.value) {
      try {
        plans = JSON.parse(pricingSettings.value);
      } catch (e) {
        plans = DEFAULT_PLANS;
      }
    }

    // Tìm và cập nhật plan
    const index = plans.findIndex(p => p.id === plan.id);
    if (index === -1) {
      // Thêm mới
      plans.push(plan);
    } else {
      // Cập nhật
      plans[index] = { ...plans[index], ...plan };
    }

    // Lưu lại
    await prisma.systemSettings.upsert({
      where: { key: 'pricing_plans' },
      update: { 
        value: JSON.stringify(plans), 
        updatedAt: new Date() 
      },
      create: { 
        key: 'pricing_plans', 
        value: JSON.stringify(plans), 
        updatedAt: new Date() 
      }
    });

    // 🔧 FIX: Xóa TẤT CẢ cache pricing để cập nhật ngay lập tức
    cache.delete('pricing_plans_public');
    cache.delete('pricing_plans');  // Cache trong API payment
    cache.deletePattern('pricing');  // Các cache khác có prefix pricing

    return NextResponse.json({ 
      success: true, 
      message: 'Đã cập nhật gói thành công'
    });

  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/pricing - Xóa 1 gói
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('id');

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Không cho xóa gói free
    if (planId === 'free') {
      return NextResponse.json({ error: 'Không thể xóa gói miễn phí' }, { status: 400 });
    }

    // Đọc plans hiện tại
    const pricingSettings = await prisma.systemSettings.findUnique({
      where: { key: 'pricing_plans' }
    });

    let plans = DEFAULT_PLANS;
    if (pricingSettings?.value) {
      try {
        plans = JSON.parse(pricingSettings.value);
      } catch (e) {
        plans = DEFAULT_PLANS;
      }
    }

    // Xóa plan
    plans = plans.filter(p => p.id !== planId);

    // Lưu lại
    await prisma.systemSettings.upsert({
      where: { key: 'pricing_plans' },
      update: { 
        value: JSON.stringify(plans), 
        updatedAt: new Date() 
      },
      create: { 
        key: 'pricing_plans', 
        value: JSON.stringify(plans), 
        updatedAt: new Date() 
      }
    });

    // 🔧 FIX: Xóa TẤT CẢ cache pricing để cập nhật ngay lập tức
    cache.delete('pricing_plans_public');
    cache.delete('pricing_plans');  // Cache trong API payment
    cache.deletePattern('pricing');  // Các cache khác có prefix pricing

    return NextResponse.json({ 
      success: true, 
      message: 'Đã xóa gói thành công'
    });

  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
