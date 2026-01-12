import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username || username.length < 3) {
      return NextResponse.json({ available: false });
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Lấy session của user hiện tại
    const session = await getServerSession(authOptions);
    const currentUserEmail = session?.user?.email;

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
    return NextResponse.json({ available: false });
  }
}
