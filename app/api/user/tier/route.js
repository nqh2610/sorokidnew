import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getEffectiveTier, getTrialInfo, getTrialSettings } from '@/lib/tierSystem';

// GET /api/user/tier - Lấy tier hiện tại của user (có tính trial)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        tier: 'free',
        effectiveTier: 'free',
        tierPurchasedAt: null,
        trialInfo: null
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        tier: true,
        tierPurchasedAt: true,
        trialExpiresAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        tier: 'free',
        effectiveTier: 'free',
        tierPurchasedAt: null,
        trialInfo: null
      });
    }

    // Lấy effective tier (có tính trial)
    const effectiveTier = await getEffectiveTier(user);
    const trialSettings = await getTrialSettings();
    const trialInfo = getTrialInfo(user, trialSettings.trialTier);

    return NextResponse.json({
      tier: user.tier || 'free',
      effectiveTier,
      tierPurchasedAt: user.tierPurchasedAt,
      trialInfo
    });

  } catch (error) {
    console.error('Error fetching user tier:', error);
    return NextResponse.json({ 
      tier: 'free',
      effectiveTier: 'free',
      tierPurchasedAt: null,
      trialInfo: null
    });
  }
}
