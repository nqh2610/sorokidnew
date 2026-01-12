import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username || username.length < 3) {
      return NextResponse.json({ available: false, reason: 'too_short' });
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Lấy session của user hiện tại
    let currentUserEmail = null;
    try {
      const session = await getServerSession(authOptions);
      currentUserEmail = session?.user?.email;
    } catch (sessionErr) {
      // Ignore session error, continue without excluding current user
      console.log('Session check failed (ignored):', sessionErr.message);
    }

    // Kiểm tra username có tồn tại không (loại trừ user hiện tại)
    const existingUser = await prisma.user.findFirst({
      where: { 
        username: normalizedUsername,
        // Loại trừ user hiện tại nếu đã đăng nhập
        ...(currentUserEmail && { NOT: { email: currentUserEmail } })
      },
      select: { id: true }
    });

    return NextResponse.json({
      available: !existingUser
    });
  } catch (error) {
    console.error('Check username error:', error);
    // 🔧 FIX: Trả về error status thay vì available: false
    // Để client biết đây là lỗi, không phải username đã tồn tại
    return NextResponse.json({ 
      available: true, // Cho phép tiếp tục, sẽ validate lại ở API complete-profile
      error: 'Database error',
      message: error.message 
    }, { status: 200 }); // Vẫn return 200 để không gây lỗi client
  }
}
