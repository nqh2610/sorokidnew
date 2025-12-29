import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/users/[id] - Lấy thông tin chi tiết user kèm certificates
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        certificates: {
          select: {
            id: true,
            certType: true,
            recipientName: true,
            honorTitle: true,
            isExcellent: true,
            code: true,
            issuedAt: true
          },
          orderBy: { issuedAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username
      },
      certificates: user.certificates 
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/users/[id] - Cập nhật thông tin user
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { name, email, username, phone, updateCertificates, certificateIds } = await request.json();

    // Cập nhật user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(username && { username }),
        ...(phone !== undefined && { phone: phone || null })
      }
    });

    // Nếu có yêu cầu cập nhật tên trong certificates
    let updatedCertCount = 0;
    if (updateCertificates && name) {
      if (certificateIds && certificateIds.length > 0) {
        // Chỉ cập nhật các certificates được chọn
        const result = await prisma.certificate.updateMany({
          where: { 
            id: { in: certificateIds },
            userId: id 
          },
          data: { recipientName: name }
        });
        updatedCertCount = result.count;
      } else {
        // Cập nhật tất cả certificates của user
        const result = await prisma.certificate.updateMany({
          where: { userId: id },
          data: { recipientName: name }
        });
        updatedCertCount = result.count;
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      updatedCertificates: updatedCertCount 
    });
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
    } catch (e) { /* Error deleting payment orders */ }
    
    try {
      await prisma.userProgress.deleteMany({ where: { userId: id } });
    } catch (e) { /* Error deleting user progress */ }
    
    try {
      await prisma.exerciseResult.deleteMany({ where: { userId: id } });
    } catch (e) { /* Error deleting exercise results */ }
    
    try {
      await prisma.userAchievement.deleteMany({ where: { userId: id } });
    } catch (e) { /* Error deleting user achievements */ }
    
    try {
      await prisma.userQuest.deleteMany({ where: { userId: id } });
    } catch (e) { /* Error deleting user quests */ }
    
    try {
      await prisma.certificate.deleteMany({ where: { userId: id } });
    } catch (e) { /* Error deleting certificates */ }
    
    try {
      await prisma.certificateProgress.deleteMany({ where: { userId: id } });
    } catch (e) { /* Error deleting certificate progress */ }
    
    try {
      await prisma.competeResult.deleteMany({ where: { odlerId: id } });
    } catch (e) { /* Error deleting compete results */ }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Đã xóa người dùng thành công' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
