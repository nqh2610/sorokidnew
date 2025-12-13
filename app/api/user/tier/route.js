import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/user/tier - Lấy tier hiện tại của user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        tier: 'free',
        tierPurchasedAt: null
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        tier: true,
        tierPurchasedAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        tier: 'free',
        tierPurchasedAt: null 
      });
    }

    return NextResponse.json({
      tier: user.tier || 'free',
      tierPurchasedAt: user.tierPurchasedAt
    });

  } catch (error) {
    console.error('Error fetching user tier:', error);
    return NextResponse.json({ 
      tier: 'free',
      tierPurchasedAt: null 
    });
  }
}
