import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validateEmail, validatePassword, validateUsername } from '@/lib/auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // 🔒 Rate limiting STRICT cho đăng ký (chống spam tạo tài khoản)
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const { email, username, password, name } = await request.json();

    // Validate input trước khi query database
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    if (!validateUsername(username)) {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    }
    if (!validatePassword(password)) {
      return NextResponse.json({ error: 'Password too short' }, { status: 400 });
    }

    // 🔧 TỐI ƯU: Chỉ select id để kiểm tra tồn tại
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true }
    });

    if (existing) {
      return NextResponse.json({ error: 'User exists' }, { status: 409 });
    }

    // 🔧 TỐI ƯU: Hash password với cost factor 10 (cân bằng bảo mật/hiệu năng)
    const hashedPassword = await hashPassword(password);

    // 🔧 TỐI ƯU: Chỉ select các field cần thiết trả về
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        createdAt: true
      }
    });

    return NextResponse.json({ message: 'Success', user }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
