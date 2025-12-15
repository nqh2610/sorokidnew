import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // 🔒 Rate limiting MODERATE cho admin
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.MODERATE);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const packageType = searchParams.get('package');
    const transactionType = searchParams.get('type');

    // Build where clause
    const where = {};
    if (status && status !== 'all') where.status = status;
    // FIX: Schema uses 'tier' not 'tierName'
    if (packageType && packageType !== 'all') where.tier = packageType;
    if (transactionType && transactionType !== 'all') where.transactionType = transactionType;

    try {
      // 🔧 TỐI ƯU: Parallel queries + Include user để tránh N+1
      const [orders, statsResult] = await Promise.all([
        // Get orders với user info trong cùng 1 query
        prisma.paymentOrder.findMany({
          where,
          select: {
            id: true,
            orderCode: true,
            transactionType: true,
            previousTier: true,
            tier: true,
            amount: true,
            paidAmount: true,
            status: true,
            note: true,
            createdAt: true,
            paidAt: true,
            userId: true,
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 100 // Limit để tránh quá tải
        }),
        // Stats với groupBy (1 query thay vì 2)
        prisma.paymentOrder.groupBy({
          by: ['status'],
          _count: { id: true },
          _sum: { amount: true }
        })
      ]);

      // Format transactions
      const transactions = orders.map(order => ({
        id: order.id,
        orderId: order.orderCode,
        transactionType: order.transactionType || 'new',
        previousTier: order.previousTier,
        packageType: order.tier,
        amount: order.amount,
        paidAmount: order.paidAmount,
        status: order.status,
        note: order.note,
        createdAt: order.createdAt,
        completedAt: order.paidAt,
        user: order.user
      }));

      // Process stats
      let totalOrders = 0;
      let completedOrders = 0;
      let pendingOrders = 0;
      let totalRevenue = 0;
      
      statsResult.forEach(s => {
        totalOrders += s._count.id;
        if (s.status === 'completed') {
          completedOrders = s._count.id;
          totalRevenue = s._sum.amount || 0;
        }
        if (s.status === 'pending') pendingOrders = s._count.id;
      });

      const stats = { totalOrders, completedOrders, pendingOrders, totalRevenue };

      return NextResponse.json({ transactions, stats });

    } catch (e) {
      console.log('PaymentOrder error:', e.message);
      return NextResponse.json({ 
        transactions: [], 
        stats: { totalOrders: 0, completedOrders: 0, pendingOrders: 0, totalRevenue: 0 }
      });
    }

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/transactions - Xóa transactions theo status
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'cancelled' | 'expired' | 'all'
    const id = searchParams.get('id'); // Xóa theo ID cụ thể

    if (id) {
      // Xóa 1 transaction cụ thể
      await prisma.paymentOrder.delete({
        where: { id: parseInt(id) }
      });
      return NextResponse.json({ success: true, message: 'Đã xóa đơn hàng' });
    }

    if (!status || !['cancelled', 'expired'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Use cancelled or expired' }, { status: 400 });
    }

    const deletedCount = await prisma.paymentOrder.deleteMany({
      where: { status }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Đã xóa ${deletedCount.count} đơn hàng ${status === 'cancelled' ? 'đã hủy' : 'hết hạn'}` 
    });

  } catch (error) {
    console.error('Error deleting transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/transactions - Cập nhật status transaction
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, note } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const order = await prisma.paymentOrder.findUnique({ where: { id: parseInt(id) } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData = { status };
    if (note) updateData.note = note;
    
    // Nếu complete order, cập nhật tier cho user
    if (status === 'completed' && order.status !== 'completed') {
      updateData.paidAt = new Date();
      updateData.paidAmount = order.amount;
      
      // Update user tier
      await prisma.user.update({
        where: { id: order.userId },
        data: {
          tier: order.tierName,
          tierPurchasedAt: new Date()
        }
      });
    }

    await prisma.paymentOrder.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return NextResponse.json({ 
      success: true, 
      message: status === 'completed' ? 'Đã xác nhận thanh toán và kích hoạt gói' : 'Đã cập nhật trạng thái' 
    });

  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
