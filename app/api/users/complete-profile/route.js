import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { invalidateUserCache } from '@/lib/authCache';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, username, phone } = await request.json();

    // Validate tất cả trước khi query DB
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên hiển thị' },
        { status: 400 }
      );
    }

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: 'Username phải có ít nhất 3 ký tự' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username chỉ được chứa chữ, số và dấu gạch dưới' },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: 'Vui lòng nhập số điện thoại' },
        { status: 400 }
      );
    }

    // Validate phone Việt Nam
    const cleanPhone = phone.replace(/[\s\-\.]/g, '');
    const vietnamPhoneRegex = /^(0|\+84|84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    if (!vietnamPhoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Số điện thoại không hợp lệ' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();
    const userEmail = session.user.email;

    // 🔧 TỐI ƯU: Gộp 3 queries thành 1 query duy nhất
    // Kiểm tra user tồn tại + username trùng + phone trùng trong 1 lần
    const [existingUser, conflictCheck] = await Promise.all([
      // Query 1: Kiểm tra user hiện tại có tồn tại
      prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true }
      }),
      // Query 2: Kiểm tra username hoặc phone đã được dùng bởi user khác
      prisma.user.findFirst({
        where: {
          OR: [
            { username: normalizedUsername },
            { phone: cleanPhone }
          ],
          NOT: { email: userEmail }
        },
        select: { username: true, phone: true }
      })
    ]);

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Không tìm thấy tài khoản. Vui lòng đăng nhập lại.' },
        { status: 404 }
      );
    }

    if (conflictCheck) {
      if (conflictCheck.username === normalizedUsername) {
        return NextResponse.json(
          { error: 'Username này đã được sử dụng' },
          { status: 400 }
        );
      }
      if (conflictCheck.phone === cleanPhone) {
        return NextResponse.json(
          { error: 'Số điện thoại này đã được sử dụng' },
          { status: 400 }
        );
      }
    }

    // Update user profile - chỉ 1 query
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        name: name.trim(),
        username: normalizedUsername,
        phone: cleanPhone,
        isProfileComplete: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        isProfileComplete: true,
      }
    });

    // 🔧 Xóa cache để session lấy data mới từ DB
    invalidateUserCache(userEmail);

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra. Vui lòng thử lại!' },
      { status: 500 }
    );
  }
}
