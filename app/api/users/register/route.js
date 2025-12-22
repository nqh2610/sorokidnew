import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validateEmail, validatePassword, validateUsername } from '@/lib/auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getTrialSettings } from '@/lib/tierSystem';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // 🔒 Rate limiting STRICT cho đăng ký (chống spam tạo tài khoản)
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const { email, username, password, name, phone } = await request.json();

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

    // Validate số điện thoại Việt Nam
    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }
    const cleanPhone = phone.replace(/[\s\-\.]/g, '');
    const vietnamPhoneRegex = /^(0|\+84|84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    if (!vietnamPhoneRegex.test(cleanPhone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // 🔧 Kiểm tra email đã tồn tại
    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    // 🔧 Kiểm tra username đã tồn tại
    const existingUsername = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (existingUsername) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    // 🔧 Kiểm tra số điện thoại đã tồn tại
    const existingPhone = await prisma.user.findFirst({
      where: { phone: cleanPhone },
      select: { id: true }
    });

    if (existingPhone) {
      return NextResponse.json({ error: 'Phone already exists' }, { status: 409 });
    }

    // 🔧 TỐI ƯU: Hash password với cost factor 10 (cân bằng bảo mật/hiệu năng)
    const hashedPassword = await hashPassword(password);

    // 🔧 Kiểm tra cài đặt trial từ admin
    // Nếu admin bật "Kích hoạt Trial" thì user mới sẽ được cấp trial tự động
    let trialExpiresAt = null;
    try {
      const trialSettings = await getTrialSettings();
      console.log('[Register] Trial settings:', trialSettings);
      if (trialSettings.isEnabled && trialSettings.trialDays > 0) {
        trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + trialSettings.trialDays);
        console.log('[Register] Trial enabled, expires at:', trialExpiresAt);
      } else {
        console.log('[Register] Trial disabled or days = 0');
      }
    } catch (error) {
      console.error('Error fetching trial settings:', error);
      // Nếu lỗi thì không cấp trial, user vẫn đăng ký được
    }

    // 🔧 TỐI ƯU: Chỉ select các field cần thiết trả về
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
        phone: cleanPhone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        trialExpiresAt // null nếu trial tắt, có giá trị nếu trial bật
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        phone: true,
        avatar: true,
        createdAt: true,
        trialExpiresAt: true
      }
    });

    return NextResponse.json({ message: 'Success', user }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
