import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    // Validate inputs
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    // Find valid reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: resetRecord.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy tài khoản' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true }
      })
    ]);

    console.log('[ResetPassword] Password reset successful for:', resetRecord.email);

    return NextResponse.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công!'
    });

  } catch (error) {
    console.error('[ResetPassword] Error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
