import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getOrSet, invalidateUserCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET /api/shop
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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const userId = session.user.id;

    // 🔧 TỐI ƯU: Cache shop items theo category
    const items = await getOrSet(
      `shop_items_${category || 'all'}`,
      async () => {
        const where = {
          isActive: true,
          ...(category && { category })
        };
        return prisma.shopItem.findMany({
          where,
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            category: true,
            type: true,
            image: true,
            data: true
          },
          orderBy: { createdAt: 'desc' }
        });
      },
      60 // Cache 1 phút
    );

    // 🔧 TỐI ƯU: Query purchases riêng, select chỉ itemId
    const purchases = await prisma.purchase.findMany({
      where: {
        userId,
        item: { type: 'permanent' }
      },
      select: { itemId: true }
    });

    const ownedItemIds = new Set(purchases.map(p => p.itemId));

    const itemsWithOwnership = items.map(item => ({
      ...item,
      data: typeof item.data === 'string' ? JSON.parse(item.data) : item.data,
      owned: ownedItemIds.has(item.id)
    }));

    return NextResponse.json({ items: itemsWithOwnership });
  } catch (error) {
    console.error('Error fetching shop items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/shop - Purchase item
export async function POST(request) {
  try {
    // 🔒 Rate limiting MODERATE cho mua hàng
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.MODERATE);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, quantity = 1 } = await request.json();
    const userId = session.user.id;

    // 🔧 TỐI ƯU: Dùng transaction để đảm bảo atomic operation
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.shopItem.findUnique({
        where: { id: itemId },
        select: { id: true, name: true, price: true, type: true, isActive: true }
      });

      if (!item || !item.isActive) {
        throw new Error('ITEM_NOT_FOUND');
      }

      const totalPrice = item.price * quantity;

      // Check user diamonds
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { diamonds: true }
      });

      if (user.diamonds < totalPrice) {
        throw new Error('NOT_ENOUGH_DIAMONDS');
      }

      // Check if already owned (for permanent items)
      if (item.type === 'permanent') {
        const existingPurchase = await tx.purchase.findFirst({
          where: { userId, itemId: item.id },
          select: { id: true }
        });

        if (existingPurchase) {
          throw new Error('ALREADY_OWNED');
        }
      }

      // Process purchase atomically
      await tx.user.update({
        where: { id: userId },
        data: { diamonds: { decrement: totalPrice } }
      });

      await tx.purchase.create({
        data: { userId, itemId: item.id, quantity, totalPrice }
      });

      await tx.notification.create({
        data: {
          userId,
          type: 'purchase',
          title: 'Mua hàng thành công!',
          message: `Bạn đã mua "${item.name}" thành công!`,
          data: JSON.stringify({ itemId: item.id })
        }
      });

      return { success: true, itemName: item.name };
    });

    // 🔧 Invalidate user cache
    invalidateUserCache(userId);

    return NextResponse.json({ success: true, message: 'Purchase successful' });
  } catch (error) {
    console.error('Error processing purchase:', error);
    
    // Return specific error messages
    if (error.message === 'ITEM_NOT_FOUND') {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    if (error.message === 'NOT_ENOUGH_DIAMONDS') {
      return NextResponse.json({ error: 'Not enough diamonds' }, { status: 400 });
    }
    if (error.message === 'ALREADY_OWNED') {
      return NextResponse.json({ error: 'Item already owned' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
