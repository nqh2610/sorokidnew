import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
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
    if (packageType && packageType !== 'all') where.tierName = packageType;
    if (transactionType && transactionType !== 'all') where.transactionType = transactionType;

    // Get transactions from PaymentOrder table
    let transactions = [];
    let stats = {
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0
    };

    try {
      const orders = await prisma.paymentOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      // Get user info for each order
      transactions = await Promise.all(orders.map(async (order) => {
        let user = null;
        try {
          user = await prisma.user.findUnique({
            where: { id: order.userId },
            select: { id: true, name: true, email: true, avatar: true }
          });
        } catch (e) {}
        
        return {
          id: order.id,
          orderId: order.orderCode,
          transactionType: order.transactionType || 'new',
          previousTier: order.previousTier,
          packageType: order.tierName,
          amount: order.amount,
          paidAmount: order.paidAmount,
          status: order.status,
          note: order.note,
          createdAt: order.createdAt,
          completedAt: order.paidAt,
          user
        };
      }));

      // Calculate stats
      const allOrders = await prisma.paymentOrder.findMany();
      stats = {
        totalOrders: allOrders.length,
        completedOrders: allOrders.filter(o => o.status === 'completed').length,
        pendingOrders: allOrders.filter(o => o.status === 'pending').length,
        totalRevenue: allOrders
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + (o.amount || 0), 0)
      };
    } catch (e) {
      console.log('PaymentOrder table might not exist:', e.message);
    }

    return NextResponse.json({ transactions, stats });

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
