import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// POST /api/user/change-password - Đổi mật khẩu
export async function POST(request) {
  try {
    // 🔒 Rate limiting STRICT cho đổi mật khẩu (chống brute-force)
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // Validate input trước khi query database
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ 
        error: 'Vui lòng điền đầy đủ thông tin' 
      }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ 
        error: 'Mật khẩu mới không khớp' 
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        error: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
      }, { status: 400 });
    }

    // 🔧 TỐI ƯU: Chỉ select password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json({ 
        error: 'Tài khoản này đăng nhập bằng Google, không thể đổi mật khẩu' 
      }, { status: 400 });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ 
        error: 'Mật khẩu hiện tại không đúng' 
      }, { status: 400 });
    }

    // 🔧 TỐI ƯU: Dùng cost factor 10 (tối ưu cho shared hosting)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
