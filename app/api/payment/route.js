import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// Thứ tự tier (dùng để so sánh)
const TIER_ORDER = {
  free: 0,
  basic: 1,
  advanced: 2,
  vip: 3
};

// Lấy pricing plans từ database
async function getPricingPlans() {
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
}

// Lấy payment settings từ database
async function getPaymentSettings() {
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
  // Default settings
  return {
    bankCode: 'MB',
    accountNumber: '0839969966',
    accountName: 'NGUYEN QUANG HUY',
    contentTemplate: 'SOROKID {orderId}'
  };
}

// GET /api/payment - Lấy thông tin thanh toán
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (orderId) {
      // Lấy thông tin đơn hàng cụ thể
      const order = await prisma.paymentOrder.findFirst({
        where: { orderCode: orderId }
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json({ order });
    }

    // Trả về thông tin pricing
    const plans = await getPricingPlans();
    const paymentSettings = await getPaymentSettings();
    
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
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    const { packageId, currentTier } = await request.json();

    // Lấy pricing plans
    const plans = await getPricingPlans();
    const targetPlan = plans.find(p => p.id === packageId);
    
    if (!targetPlan) {
      return NextResponse.json({ error: 'Gói không hợp lệ' }, { status: 400 });
    }

    // Lấy user để kiểm tra tier hiện tại
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true }
    });

    const userCurrentTier = user?.tier || 'free';

    // Validate: chỉ cho phép nâng cấp lên gói cao hơn
    const currentTierOrder = TIER_ORDER[userCurrentTier] || 0;
    const targetTierOrder = TIER_ORDER[packageId] || 0;

    if (targetTierOrder <= currentTierOrder) {
      return NextResponse.json({ 
        error: 'Bạn chỉ có thể nâng cấp lên gói cao hơn' 
      }, { status: 400 });
    }

    // Tính số tiền cần thanh toán
    let amount = targetPlan.price;
    let transactionType = 'new';
    
    if (userCurrentTier !== 'free') {
      // Tìm gói hiện tại để tính chênh lệch
      const currentPlan = plans.find(p => p.id === userCurrentTier);
      if (currentPlan) {
        const difference = targetPlan.price - currentPlan.price;
        if (difference > 0) {
          amount = difference;
          transactionType = 'upgrade';
        }
      }
    }

    // Lấy payment settings
    const paymentSettings = await getPaymentSettings();

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
        userId: session.user.id,
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
