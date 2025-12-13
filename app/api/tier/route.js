import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { invalidateUserCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET /api/tier - Lấy thông tin tier của user hiện tại
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

    // Lấy thông tin user để lấy tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tier: true,
        tierPurchasedAt: true
      }
    });

    // Trả về tier từ user model
    return NextResponse.json({
      tier: user?.tier || 'free',
      tierInfo: {
        tierName: user?.tier || 'free',
        purchasedAt: user?.tierPurchasedAt
      },
      isExpired: false
    });
  } catch (error) {
    console.error('Error fetching tier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tier - Nâng cấp tier (admin hoặc sau khi thanh toán thành công)
export async function POST(request) {
  try {
    // 🔒 Rate limiting STRICT cho tier upgrade
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tierName, userId: targetUserId } = await request.json();

    // Chỉ admin mới được upgrade cho user khác
    let userId = session.user.id;
    if (targetUserId && targetUserId !== session.user.id) {
      if (session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = targetUserId;
    }

    // Validate tier
    const validTiers = ['free', 'basic', 'advanced', 'vip'];
    if (!validTiers.includes(tierName)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Update user tier directly
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        tier: tierName,
        tierPurchasedAt: new Date()
      }
    });

    // 🔧 Invalidate user cache after tier update
    invalidateUserCache(userId);

    return NextResponse.json({
      success: true,
      tier: updatedUser.tier,
      message: `Đã nâng cấp lên ${tierName} thành công`
    });
  } catch (error) {
    console.error('Error upgrading tier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
