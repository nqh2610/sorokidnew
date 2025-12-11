import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT /api/admin/users/[id] - Cập nhật thông tin user
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { name, email, username } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(username && { username })
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Xóa user
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Delete related records first (theo đúng schema thực tế)
    try {
      await prisma.paymentOrder.deleteMany({ where: { userId: id } });
    } catch (e) { console.log('Error deleting payment orders:', e.message); }
    
    try {
      await prisma.userProgress.deleteMany({ where: { userId: id } });
    } catch (e) { console.log('Error deleting user progress:', e.message); }
    
    try {
      await prisma.exerciseResult.deleteMany({ where: { userId: id } });
    } catch (e) { console.log('Error deleting exercise results:', e.message); }
    
    try {
      await prisma.userAchievement.deleteMany({ where: { userId: id } });
    } catch (e) { console.log('Error deleting user achievements:', e.message); }
    
    try {
      await prisma.userQuest.deleteMany({ where: { userId: id } });
    } catch (e) { console.log('Error deleting user quests:', e.message); }
    
    try {
      await prisma.certificate.deleteMany({ where: { userId: id } });
    } catch (e) { console.log('Error deleting certificates:', e.message); }
    
    try {
      await prisma.certificateProgress.deleteMany({ where: { userId: id } });
    } catch (e) { console.log('Error deleting certificate progress:', e.message); }
    
    try {
      await prisma.competeResult.deleteMany({ where: { odlerId: id } });
    } catch (e) { console.log('Error deleting compete results:', e.message); }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Đã xóa người dùng thành công' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
