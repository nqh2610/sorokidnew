import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTrialSettings, getTrialInfo } from '@/lib/tierSystem';

export async function GET() {
  try {
    // Lấy user đang đăng nhập
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get trial settings
    const trialSettings = await getTrialSettings();
    
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, tier: true, trialExpiresAt: true }
    });
    
    // Get trial info for this user
    const trialInfo = user ? getTrialInfo(user, trialSettings.trialTier) : null;
    
    return NextResponse.json({
      success: true,
      trialSettings,
      user,
      trialInfo
    });
  } catch (error) {
    console.error('[Test Trial] Error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
