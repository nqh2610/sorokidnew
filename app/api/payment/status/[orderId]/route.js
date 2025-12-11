import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/payment/status/[orderId] - Kiểm tra trạng thái đơn hàng
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;

    const order = await prisma.paymentOrder.findUnique({
      where: { orderId }
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
      orderId: order.orderId,
      status: isExpired && order.status === 'pending' ? 'expired' : order.status,
      amount: order.amount,
      packageId: order.packageId,
      tierName: order.tierName,
      months: order.months,
      createdAt: order.createdAt,
      completedAt: order.completedAt,
      expiresAt: order.expiresAt,
      isExpired
    });
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
