import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { clearTrialSettingsCache } from '@/lib/tierSystem';

// Default trial settings
const DEFAULT_TRIAL_SETTINGS = {
  isEnabled: true,
  trialDays: 7,
  trialTier: 'advanced'
};

// GET /api/admin/trial-settings - Lấy cấu hình trial
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Đọc từ database
    const settings = await prisma.systemSettings.findUnique({
      where: { key: 'trial_settings' }
    });

    if (settings) {
      try {
        const trialSettings = JSON.parse(settings.value);
        return NextResponse.json({ settings: trialSettings });
      } catch {
        return NextResponse.json({ settings: DEFAULT_TRIAL_SETTINGS });
      }
    }

    return NextResponse.json({ settings: DEFAULT_TRIAL_SETTINGS });
  } catch (error) {
    console.error('Error fetching trial settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/trial-settings - Cập nhật cấu hình trial
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { settings } = await request.json();

    // Validate settings
    if (typeof settings.isEnabled !== 'boolean') {
      return NextResponse.json({ error: 'isEnabled must be boolean' }, { status: 400 });
    }
    if (typeof settings.trialDays !== 'number' || settings.trialDays < 1 || settings.trialDays > 365) {
      return NextResponse.json({ error: 'trialDays must be between 1 and 365' }, { status: 400 });
    }
    if (!['basic', 'advanced', 'vip'].includes(settings.trialTier)) {
      return NextResponse.json({ error: 'trialTier must be basic, advanced or vip' }, { status: 400 });
    }

    // Lưu vào database
    await prisma.systemSettings.upsert({
      where: { key: 'trial_settings' },
      update: {
        value: JSON.stringify(settings),
        updatedAt: new Date()
      },
      create: {
        key: 'trial_settings',
        value: JSON.stringify(settings),
        updatedAt: new Date()
      }
    });

    // Clear cache để settings mới có hiệu lực ngay
    clearTrialSettingsCache();

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating trial settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
