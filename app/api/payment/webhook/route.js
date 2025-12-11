import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/payment/webhook - Xác nhận thanh toán từ webhook
export async function POST(request) {
  try {
    // Verify webhook signature (implement based on payment provider)
    const signature = request.headers.get('x-webhook-signature');
    const body = await request.json();

    // TODO: Verify signature với payment provider
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const { orderId, status, transactionId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Tìm đơn hàng
    const order = await prisma.paymentOrder.findUnique({
      where: { orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Cập nhật trạng thái đơn hàng
    if (status === 'completed' || status === 'success') {
      // Cập nhật đơn hàng
      await prisma.paymentOrder.update({
        where: { orderId },
        data: {
          status: 'completed',
          transactionId,
          completedAt: new Date()
        }
      });

      // Tính ngày hết hạn
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + order.months);

      // Kiểm tra xem user đã có tier chưa
      const existingTier = await prisma.userTier.findUnique({
        where: { userId: order.userId }
      });

      if (existingTier) {
        // Nếu tier cũ chưa hết hạn, cộng thêm thời gian
        let newExpiresAt = expiresAt;
        if (existingTier.expiresAt && new Date(existingTier.expiresAt) > new Date()) {
          newExpiresAt = new Date(existingTier.expiresAt);
          newExpiresAt.setMonth(newExpiresAt.getMonth() + order.months);
        }

        await prisma.userTier.update({
          where: { userId: order.userId },
          data: {
            tierName: order.tierName,
            expiresAt: newExpiresAt,
            updatedAt: new Date()
          }
        });
      } else {
        // Tạo mới tier
        await prisma.userTier.create({
          data: {
            userId: order.userId,
            tierName: order.tierName,
            expiresAt
          }
        });
      }

      return NextResponse.json({ success: true, message: 'Payment confirmed' });
    } else if (status === 'failed' || status === 'cancelled') {
      await prisma.paymentOrder.update({
        where: { orderId },
        data: {
          status: 'failed'
        }
      });

      return NextResponse.json({ success: true, message: 'Payment cancelled' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
