import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// Cấu hình payment gateway (có thể thay đổi theo provider)
const PAYMENT_CONFIG = {
  bankCode: 'MB',
  accountNumber: '0839969966',
  accountName: 'NGUYEN QUANG HUY',
  // Template nội dung chuyển khoản
  contentTemplate: 'SOROKIDS {orderId}'
};

// Các gói thanh toán
const PRICING = {
  premium_1: { tier: 'premium', months: 1, price: 49000, name: 'Premium 1 tháng' },
  premium_3: { tier: 'premium', months: 3, price: 129000, name: 'Premium 3 tháng', save: '12%' },
  premium_12: { tier: 'premium', months: 12, price: 399000, name: 'Premium 1 năm', save: '32%' },
  vip_1: { tier: 'vip', months: 1, price: 99000, name: 'VIP 1 tháng' },
  vip_3: { tier: 'vip', months: 3, price: 259000, name: 'VIP 3 tháng', save: '13%' },
  vip_12: { tier: 'vip', months: 12, price: 799000, name: 'VIP 1 năm', save: '33%' }
};

// GET /api/payment - Lấy thông tin thanh toán
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (orderId) {
      // Lấy thông tin đơn hàng cụ thể
      const order = await prisma.paymentOrder.findUnique({
        where: { orderId }
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json({ order });
    }

    // Trả về thông tin pricing
    return NextResponse.json({
      pricing: PRICING,
      paymentInfo: {
        bankCode: PAYMENT_CONFIG.bankCode,
        accountNumber: PAYMENT_CONFIG.accountNumber,
        accountName: PAYMENT_CONFIG.accountName
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageId } = await request.json();

    // Validate package
    const packageInfo = PRICING[packageId];
    if (!packageInfo) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // Generate order ID
    const orderId = `SK${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    
    // Nội dung chuyển khoản
    const content = PAYMENT_CONFIG.contentTemplate.replace('{orderId}', orderId);

    // Tạo QR URL (VietQR format)
    const qrUrl = `https://img.vietqr.io/image/${PAYMENT_CONFIG.bankCode}-${PAYMENT_CONFIG.accountNumber}-compact2.png?amount=${packageInfo.price}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(PAYMENT_CONFIG.accountName)}`;

    // Lưu đơn hàng vào database
    const order = await prisma.paymentOrder.create({
      data: {
        orderId,
        userId: session.user.id,
        packageId,
        tierName: packageInfo.tier,
        months: packageInfo.months,
        amount: packageInfo.price,
        status: 'pending',
        paymentContent: content,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 phút
      }
    });

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        amount: order.amount,
        packageName: packageInfo.name,
        content,
        qrUrl,
        expiresAt: order.expiresAt,
        paymentInfo: {
          bankCode: PAYMENT_CONFIG.bankCode,
          accountNumber: PAYMENT_CONFIG.accountNumber,
          accountName: PAYMENT_CONFIG.accountName
        }
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
