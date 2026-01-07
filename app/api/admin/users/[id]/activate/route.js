import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { invalidateUserCache } from '@/lib/cache';

// POST /api/admin/users/[id]/activate - Kích hoạt gói cho user
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { tier } = await request.json();

    if (!['free', 'basic', 'advanced'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const previousTier = user.tier || 'free';

    // Update user tier directly in users table
    await prisma.user.update({
      where: { id },
      data: {
        tier: tier,
        tierPurchasedAt: tier !== 'free' ? new Date() : null
      }
    });
    
    // 🔧 Invalidate cache để user thấy tier mới ngay lập tức
    invalidateUserCache(id);

    if (tier === 'free') {
      return NextResponse.json({ success: true, message: 'Đã chuyển về gói miễn phí' });
    }

    // Create manual order record in PaymentOrder table
    const orderCode = 'MN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    const amount = tier === 'basic' ? 199000 : 299000;
    
    try {
      await prisma.paymentOrder.create({
        data: {
          orderCode,
          userId: id,
          tier: tier,
          amount: amount,
          paidAmount: amount,
          status: 'completed',
          paidAt: new Date(),
          previousTier: previousTier,
          transactionType: 'manual',
          note: `Admin kích hoạt gói bởi ${session.user.email}`
        }
      });
    } catch (e) {
      // Error creating payment order
    }

    return NextResponse.json({ 
      success: true, 
      message: `Đã kích hoạt gói ${tier === 'basic' ? 'Cơ Bản' : 'Nâng Cao'} thành công` 
    });

  } catch (error) {
    console.error('Error activating package:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
