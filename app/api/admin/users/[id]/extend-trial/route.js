import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/admin/users/[id]/extend-trial - Gia hạn trial cho user
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { days } = await request.json();

    // Validate
    if (typeof days !== 'number' || days < 0 || days > 365) {
      return NextResponse.json({ error: 'Days must be between 0 and 365' }, { status: 400 });
    }

    // Kiểm tra user tồn tại
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, tier: true, email: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Tính trialExpiresAt
    let trialExpiresAt = null;
    if (days > 0) {
      trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + days);
    }

    // Cập nhật user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { trialExpiresAt },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        tier: true, 
        trialExpiresAt: true 
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: days > 0 
        ? `Đã cấp ${days} ngày trial cho ${user.name || user.email}` 
        : `Đã xóa trial của ${user.name || user.email}`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error extending trial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
