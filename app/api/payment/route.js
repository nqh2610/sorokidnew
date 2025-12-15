import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getOrSet } from '@/lib/cache';

// Thứ tự tier (dùng để so sánh)
const TIER_ORDER = {
  free: 0,
  basic: 1,
  advanced: 2,
  vip: 3
};

// 🔧 TỐI ƯU: Cache pricing plans với TTL dài hơn
async function getPricingPlans() {
  return getOrSet('pricing_plans', async () => {
    try {
      const settings = await prisma.systemSettings.findUnique({
        where: { key: 'pricing_plans' }
      });
      if (settings?.value) {
        const plans = JSON.parse(settings.value);
        return Array.isArray(plans) ? plans : [];
      }
    } catch (e) {
      console.error('Error loading pricing plans:', e);
    }
    return [];
  }, 300); // Cache 5 phút
}

// 🔧 TỐI ƯU: Cache payment settings
async function getPaymentSettings() {
  return getOrSet('payment_settings', async () => {
    try {
      const settings = await prisma.systemSettings.findUnique({
        where: { key: 'payment_settings' }
      });
      if (settings?.value) {
        return JSON.parse(settings.value);
      }
    } catch (e) {
      console.error('Error loading payment settings:', e);
    }
    return {
      bankCode: 'MB',
      accountNumber: '0839969966',
      accountName: 'NGUYEN QUANG HUY',
      contentTemplate: 'SOROKID {orderId}'
    };
  }, 300); // Cache 5 phút
}

// GET /api/payment - Lấy thông tin thanh toán
export async function GET(request) {
  try {
    // 🔒 Rate limiting
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.NORMAL);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (orderId) {
      const order = await prisma.paymentOrder.findFirst({
        where: { orderCode: orderId },
        select: {
          id: true,
          orderCode: true,
          tier: true,
          amount: true,
          status: true,
          previousTier: true,
          transactionType: true,
          expiresAt: true,
          note: true
        }
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json({ order });
    }

    // 🔧 TỐI ƯU: Dùng cached data
    const [plans, paymentSettings] = await Promise.all([
      getPricingPlans(),
      getPaymentSettings()
    ]);
    
    return NextResponse.json({
      plans,
      paymentInfo: {
        bankCode: paymentSettings.bankCode,
        accountNumber: paymentSettings.accountNumber,
        accountName: paymentSettings.accountName
      }
    });
  } catch (error) {
    console.error('Error fetching payment info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/payment - Tạo đơn hàng thanh toán
export async function POST(request) {
  try {
    // 🔒 Rate limiting STRICT cho tạo đơn hàng
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    const { packageId } = await request.json();
    const userId = session.user.id;

    // 🔧 TỐI ƯU: Lấy plans và payment settings song song
    const [plans, paymentSettings, user, existingPendingOrder] = await Promise.all([
      getPricingPlans(),
      getPaymentSettings(),
      prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true }
      }),
      // 🔧 FIX: Tìm đơn hàng pending cùng gói, chưa hết hạn
      prisma.paymentOrder.findFirst({
        where: {
          userId,
          tier: packageId,
          status: 'pending',
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const targetPlan = plans.find(p => p.id === packageId);
    
    if (!targetPlan) {
      return NextResponse.json({ error: 'Gói không hợp lệ' }, { status: 400 });
    }

    const userCurrentTier = user?.tier || 'free';

    // Validate: chỉ cho phép nâng cấp lên gói cao hơn
    const currentTierOrder = TIER_ORDER[userCurrentTier] || 0;
    const targetTierOrder = TIER_ORDER[packageId] || 0;

    if (targetTierOrder <= currentTierOrder) {
      return NextResponse.json({ 
        error: 'Bạn chỉ có thể nâng cấp lên gói cao hơn' 
      }, { status: 400 });
    }

    // 🔧 FIX: Nếu có đơn pending cùng gói và cùng số tiền, tái sử dụng
    if (existingPendingOrder) {
      // Tính số tiền cho đơn mới để so sánh
      let newAmount = targetPlan.price;
      if (userCurrentTier !== 'free') {
        const currentPlan = plans.find(p => p.id === userCurrentTier);
        if (currentPlan) {
          const difference = targetPlan.price - currentPlan.price;
          if (difference > 0) newAmount = difference;
        }
      }
      
      // Nếu số tiền giống nhau, tái sử dụng đơn cũ
      if (existingPendingOrder.amount === newAmount) {
        const qrUrl = `https://img.vietqr.io/image/${paymentSettings.bankCode}-${paymentSettings.accountNumber}-compact2.png?amount=${existingPendingOrder.amount}&addInfo=${encodeURIComponent(existingPendingOrder.note)}&accountName=${encodeURIComponent(paymentSettings.accountName)}`;
        
        return NextResponse.json({
          success: true,
          reused: true, // Flag cho biết đã tái sử dụng
          order: {
            orderId: existingPendingOrder.orderCode,
            amount: existingPendingOrder.amount,
            packageName: targetPlan.name,
            targetTier: packageId,
            previousTier: existingPendingOrder.previousTier,
            transactionType: existingPendingOrder.transactionType,
            content: existingPendingOrder.note,
            qrUrl,
            expiresAt: existingPendingOrder.expiresAt,
            paymentInfo: {
              bankCode: paymentSettings.bankCode,
              accountNumber: paymentSettings.accountNumber,
              accountName: paymentSettings.accountName
            }
          }
        });
      }
    }

    // Tính số tiền cần thanh toán
    let amount = targetPlan.price;
    let transactionType = 'new';
    
    if (userCurrentTier !== 'free') {
      const currentPlan = plans.find(p => p.id === userCurrentTier);
      if (currentPlan) {
        const difference = targetPlan.price - currentPlan.price;
        if (difference > 0) {
          amount = difference;
          transactionType = 'upgrade';
        }
      }
    }

    // Generate order code
    const orderCode = `SK${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    
    // Nội dung chuyển khoản
    const content = (paymentSettings.contentTemplate || 'SOROKID {orderId}').replace('{orderId}', orderCode);

    // Tạo QR URL (VietQR format)
    const qrUrl = `https://img.vietqr.io/image/${paymentSettings.bankCode}-${paymentSettings.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(paymentSettings.accountName)}`;

    // Lưu đơn hàng vào database
    const order = await prisma.paymentOrder.create({
      data: {
        orderCode,
        userId,
        tier: packageId,
        amount: amount,
        status: 'pending',
        previousTier: userCurrentTier,
        transactionType,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 phút
        note: content
      }
    });

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderCode,
        amount: order.amount,
        packageName: targetPlan.name,
        targetTier: packageId,
        previousTier: userCurrentTier,
        transactionType,
        content,
        qrUrl,
        expiresAt: order.expiresAt,
        paymentInfo: {
          bankCode: paymentSettings.bankCode,
          accountNumber: paymentSettings.accountNumber,
          accountName: paymentSettings.accountName
        }
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
