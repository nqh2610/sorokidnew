import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getLevelInfo } from '@/lib/gamification';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getOrSet, invalidateUserCache } from '@/lib/cache';
import { getEffectiveTierSync, getTrialInfo, getTrialSettings } from '@/lib/tierSystem';

export const dynamic = 'force-dynamic';

/**
 * 🔥 STREAK LOGIC:
 * - Streak được tính và cập nhật bởi /api/dashboard/stats (khi user vào dashboard)
 * - Streak cũng được cập nhật bởi /api/progress (khi user hoàn thành bài)
 * - Profile API chỉ cần trả về giá trị streak từ DB (đã được cập nhật)
 * - KHÔNG tính lại streak ở đây để tránh 4 queries thừa mỗi page load
 */

// GET /api/user/profile - Lấy thông tin profile
export async function GET(request) {
  try {
    // 🔒 Rate limiting
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.NORMAL);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 🔧 TỐI ƯU: Query user với tier và trialExpiresAt trong cùng 1 query
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        phone: true,
        avatar: true,
        totalStars: true,
        diamonds: true,
        streak: true,
        lastLoginDate: true,
        createdAt: true,
        tier: true, // Lấy tier từ User model
        trialExpiresAt: true // 🔧 Thêm để tính effective tier
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 🔧 Tính effective tier (có tính trial)
    const trialSettings = await getTrialSettings();
    const effectiveTier = getEffectiveTierSync(user, trialSettings.trialTier);
    const trialInfo = getTrialInfo(user, trialSettings.trialTier);

    // Tính level từ totalStars
    const levelInfo = getLevelInfo(user.totalStars || 0);

    // 🔥 Streak đã được cập nhật bởi dashboard/stats hoặc progress route
    // Chỉ cần trả về giá trị từ DB - KHÔNG query thêm

    const profileData = {
      ...user,
      // streak giữ nguyên từ user (đã được dashboard/progress cập nhật)
      tier: effectiveTier, // 🔧 Trả về effective tier (có tính trial)
      actualTier: user.tier, // Tier gốc
      trialInfo, // 🔧 Thêm thông tin trial
      level: levelInfo.level,
      levelInfo: {
        level: levelInfo.level,
        name: levelInfo.name,
        icon: levelInfo.icon,
        progressPercent: levelInfo.progressPercent
      }
    };

    return NextResponse.json({ user: profileData });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/profile - Cập nhật profile
export async function PUT(request) {
  try {
    // 🔒 Rate limiting MODERATE cho update profile
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.MODERATE);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { name, username, avatar, phone } = await request.json();

    // Validate username
    if (username) {
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json({ 
          error: 'Username chỉ được chứa chữ, số và dấu gạch dưới' 
        }, { status: 400 });
      }

      if (username.length < 3) {
        return NextResponse.json({ 
          error: 'Username phải có ít nhất 3 ký tự' 
        }, { status: 400 });
      }

      // 🔧 TỐI ƯU: Select chỉ id để kiểm tra tồn tại
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId }
        },
        select: { id: true }
      });

      if (existingUser) {
        return NextResponse.json({
          error: 'Username này đã được sử dụng'
        }, { status: 400 });
      }
    }

    // Validate phone nếu có
    if (phone) {
      const cleanPhone = phone.replace(/[\s\-\.]/g, '');
      const vietnamPhoneRegex = /^(0|\+84|84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])[0-9]{7}$/;
      if (!vietnamPhoneRegex.test(cleanPhone)) {
        return NextResponse.json({
          error: 'Số điện thoại không hợp lệ'
        }, { status: 400 });
      }

      // Kiểm tra số điện thoại đã được sử dụng bởi người khác chưa
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone: cleanPhone,
          NOT: { id: userId }
        },
        select: { id: true }
      });

      if (existingPhone) {
        return NextResponse.json({
          error: 'Số điện thoại này đã được sử dụng'
        }, { status: 400 });
      }
    }

    // Build update data
    const updateData = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;
    if (phone !== undefined) updateData.phone = phone ? phone.replace(/[\s\-\.]/g, '') : null;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        phone: true,
        avatar: true
      }
    });

    // 🔧 Invalidate cache sau khi update
    invalidateUserCache(userId);

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
