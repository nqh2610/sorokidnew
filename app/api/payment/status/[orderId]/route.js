import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// GET /api/payment/status/[orderId] - Kiểm tra trạng thái đơn hàng
export async function GET(request, { params }) {
  try {
    // 🔒 Rate limiting (frequently polled endpoint)
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.NORMAL);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;

    // 🔧 TỐI ƯU: Select only needed fields
    const order = await prisma.paymentOrder.findFirst({
      where: { orderCode: orderId },
      select: {
        orderCode: true,
        userId: true,
        status: true,
        amount: true,
        tier: true,
        previousTier: true,
        transactionType: true,
        paidAmount: true,
        paidAt: true,
        createdAt: true,
        expiresAt: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Chỉ user sở hữu hoặc admin mới xem được
    if (order.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kiểm tra xem đơn hàng đã hết hạn chưa
    const isExpired = order.expiresAt && new Date(order.expiresAt) < new Date();
    
    return NextResponse.json({
      orderId: order.orderCode,
      status: isExpired && order.status === 'pending' ? 'expired' : order.status,
      amount: order.amount,
      tier: order.tier,
      previousTier: order.previousTier,
      transactionType: order.transactionType,
      paidAmount: order.paidAmount,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      expiresAt: order.expiresAt,
      isExpired
    });
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
