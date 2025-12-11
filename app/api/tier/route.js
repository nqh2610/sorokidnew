import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/tier - Lấy thông tin tier của user hiện tại
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Lấy thông tin tier của user
    let userTier = null;
    try {
      userTier = await prisma.userTier.findUnique({
        where: { userId },
        include: {
          tier: true
        }
      });
    } catch (e) {
      // Table might not exist yet
    }

    // Kiểm tra xem tier đã hết hạn chưa
    if (userTier && userTier.expiresAt && new Date(userTier.expiresAt) < new Date()) {
      // Tier đã hết hạn, trả về free
      return NextResponse.json({
        tier: 'free',
        tierInfo: null,
        isExpired: true,
        expiredAt: userTier.expiresAt
      });
    }

    // Lấy danh sách tất cả các tiers để hiển thị
    let allTiers = [];
    try {
      allTiers = await prisma.tier.findMany({
        orderBy: { level: 'asc' }
      });
    } catch (e) {
      // Default tiers
      allTiers = [
        { name: 'free', displayName: 'Miễn phí', level: 0, maxLevel: 3, features: ['3 cấp độ đầu tiên', 'Bài học cơ bản'] },
        { name: 'premium', displayName: 'Premium', level: 1, maxLevel: 15, features: ['Tất cả 15 cấp độ', 'Không giới hạn luyện tập'] },
        { name: 'vip', displayName: 'VIP', level: 2, maxLevel: null, features: ['Tất cả tính năng Premium', 'Chứng chỉ', 'Ưu tiên hỗ trợ'] }
      ];
    }

    return NextResponse.json({
      tier: userTier?.tierName || 'free',
      tierInfo: userTier,
      isExpired: false,
      allTiers
    });
  } catch (error) {
    console.error('Error fetching tier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tier - Nâng cấp tier (admin hoặc sau khi thanh toán thành công)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tierName, months = 1, userId: targetUserId } = await request.json();

    // Chỉ admin mới được upgrade cho user khác
    let userId = session.user.id;
    if (targetUserId && targetUserId !== session.user.id) {
      if (session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = targetUserId;
    }

    // Validate tier
    const validTiers = ['free', 'premium', 'vip'];
    if (!validTiers.includes(tierName)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Tính ngày hết hạn
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    // Upsert user tier
    const userTier = await prisma.userTier.upsert({
      where: { userId },
      update: {
        tierName,
        expiresAt,
        updatedAt: new Date()
      },
      create: {
        userId,
        tierName,
        expiresAt
      }
    });

    return NextResponse.json({
      success: true,
      userTier,
      message: `Đã nâng cấp lên ${tierName} thành công`
    });
  } catch (error) {
    console.error('Error upgrading tier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
