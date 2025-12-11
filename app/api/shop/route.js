import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/shop
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where = {
      isActive: true,
      ...(category && { category })
    };

    const items = await prisma.shopItem.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Get user purchases to check owned items
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: session.user.id,
        item: { type: 'permanent' }
      },
      include: { item: true }
    });

    const ownedItemIds = purchases.map(p => p.itemId);

    const itemsWithOwnership = items.map(item => ({
      ...item,
      data: JSON.parse(item.data),
      owned: ownedItemIds.includes(item.id)
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, quantity = 1 } = await request.json();

    const item = await prisma.shopItem.findUnique({
      where: { id: itemId }
    });

    if (!item || !item.isActive) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const totalPrice = item.price * quantity;

    // Check if user has enough diamonds
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user.diamonds < totalPrice) {
      return NextResponse.json({ error: 'Not enough diamonds' }, { status: 400 });
    }

    // Check if already owned (for permanent items)
    if (item.type === 'permanent') {
      const existingPurchase = await prisma.purchase.findFirst({
        where: {
          userId: session.user.id,
          itemId: item.id
        }
      });

      if (existingPurchase) {
        return NextResponse.json({ error: 'Item already owned' }, { status: 400 });
      }
    }

    // Process purchase
    await prisma.$transaction([
      // Deduct diamonds
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          diamonds: { decrement: totalPrice }
        }
      }),
      // Create purchase record
      prisma.purchase.create({
        data: {
          userId: session.user.id,
          itemId: item.id,
          quantity,
          totalPrice
        }
      }),
      // Create notification
      prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'purchase',
          title: 'Mua hàng thành công!',
          message: `Bạn đã mua "${item.name}" thành công!`,
          data: JSON.stringify({ itemId: item.id })
        }
      })
    ]);

    return NextResponse.json({ success: true, message: 'Purchase successful' });
  } catch (error) {
    console.error('Error processing purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
