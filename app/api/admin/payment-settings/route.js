import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/payment-settings - Lấy cài đặt thanh toán
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get settings from SystemSettings table (key-value pairs)
    let settings = {
      bankCode: 'BIDV',
      accountNumber: '',
      accountName: '',
      webhookProvider: 'sepay',
      apiKey: '',
      isActive: false,
      basicPrice: 199000,
      advancedPrice: 299000
    };

    try {
      const allSettings = await prisma.systemSettings.findMany();
      for (const s of allSettings) {
        if (s.settingKey === 'bankCode') settings.bankCode = s.settingValue;
        if (s.settingKey === 'accountNumber') settings.accountNumber = s.settingValue;
        if (s.settingKey === 'accountName') settings.accountName = s.settingValue;
        if (s.settingKey === 'webhookProvider') settings.webhookProvider = s.settingValue;
        if (s.settingKey === 'apiKey') settings.apiKey = s.settingValue;
        if (s.settingKey === 'isActive') settings.isActive = s.settingValue === 'true';
        if (s.settingKey === 'basicPrice') settings.basicPrice = parseInt(s.settingValue) || 199000;
        if (s.settingKey === 'advancedPrice') settings.advancedPrice = parseInt(s.settingValue) || 299000;
      }
    } catch (e) {
      console.log('SystemSettings table error:', e.message);
    }

    return NextResponse.json({
      settings: {
        bankCode: settings.bankCode,
        accountNumber: settings.accountNumber,
        accountName: settings.accountName,
        webhookProvider: settings.webhookProvider,
        apiKey: settings.apiKey ? '**********' : '',
        isActive: settings.isActive,
        basicPrice: settings.basicPrice,
        advancedPrice: settings.advancedPrice,
        webhookUrl: `${process.env.NEXTAUTH_URL || 'https://sorokid.com'}/api/payment/webhook/${settings.webhookProvider || 'sepay'}`
      }
    });

  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/payment-settings - Lưu cài đặt thanh toán
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      bankCode, 
      accountNumber, 
      accountName, 
      webhookProvider, 
      apiKey,
      basicPrice,
      advancedPrice
    } = await request.json();

    // Save settings as key-value pairs in SystemSettings
    const settingsToSave = [
      { key: 'bankCode', value: bankCode || 'BIDV' },
      { key: 'accountNumber', value: accountNumber || '' },
      { key: 'accountName', value: accountName || '' },
      { key: 'webhookProvider', value: webhookProvider || 'sepay' },
      { key: 'isActive', value: (accountNumber && apiKey && apiKey !== '**********') ? 'true' : 'false' },
      { key: 'basicPrice', value: String(basicPrice || 199000) },
      { key: 'advancedPrice', value: String(advancedPrice || 299000) }
    ];

    // Only update apiKey if it's not masked
    if (apiKey && apiKey !== '**********') {
      settingsToSave.push({ key: 'apiKey', value: apiKey });
    }

    try {
      for (const setting of settingsToSave) {
        await prisma.systemSettings.upsert({
          where: { settingKey: setting.key },
          update: { settingValue: setting.value, updatedAt: new Date() },
          create: { settingKey: setting.key, settingValue: setting.value }
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Cài đặt đã được lưu thành công'
      });
    } catch (e) {
      console.error('Error saving settings:', e);
      return NextResponse.json({ 
        error: 'Không thể lưu cài đặt. Vui lòng kiểm tra database.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error saving payment settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
