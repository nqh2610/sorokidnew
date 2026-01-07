import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cache } from '@/lib/cache';

// GET /api/admin/payment-settings - Lấy cài đặt thanh toán
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Default settings
    let settings = {
      bankCode: 'BIDV',
      bankName: 'BIDV',
      accountNumber: '',
      accountName: '',
      webhookProvider: 'sepay',
      apiKey: '',
      isActive: false,
      basicPrice: 199000,
      advancedPrice: 299000
    };

    try {
      // Đọc từ record payment_settings (JSON format)
      const paymentSettings = await prisma.systemSettings.findUnique({
        where: { key: 'payment_settings' }
      });

      if (paymentSettings?.value) {
        const parsed = JSON.parse(paymentSettings.value);
        settings = {
          bankCode: parsed.bankCode || 'BIDV',
          bankName: parsed.bankName || 'BIDV',
          accountNumber: parsed.accountNumber || '',
          accountName: parsed.accountName || '',
          webhookProvider: parsed.webhookProvider || 'sepay',
          apiKey: parsed.apiKey || '',
          isActive: parsed.isActive || false,
          basicPrice: parsed.basicPrice || 199000,
          advancedPrice: parsed.advancedPrice || 299000
        };
      }
    } catch (e) {
      // SystemSettings parse error
    }

    return NextResponse.json({
      settings: {
        bankCode: settings.bankCode,
        bankName: settings.bankName,
        accountNumber: settings.accountNumber,
        accountName: settings.accountName,
        webhookProvider: settings.webhookProvider,
        apiKey: settings.apiKey ? '**********' : '',
        hasApiKey: !!settings.apiKey,
        isActive: settings.isActive,
        basicPrice: settings.basicPrice,
        advancedPrice: settings.advancedPrice,
        // Webhook URL đúng - không có /sepay suffix
        webhookUrl: `${process.env.NEXTAUTH_URL || 'https://sorokid.com'}/api/payment/webhook`
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
      advancedPrice,
      isActive
    } = await request.json();

    try {
      // Đọc settings hiện tại
      const existingSettings = await prisma.systemSettings.findUnique({
        where: { key: 'payment_settings' }
      });

      let currentSettings = {};
      if (existingSettings?.value) {
        try {
          currentSettings = JSON.parse(existingSettings.value);
        } catch (e) {
          currentSettings = {};
        }
      }

      // Merge với settings mới
      const newSettings = {
        ...currentSettings,
        bankCode: bankCode || currentSettings.bankCode || 'BIDV',
        bankName: bankCode || currentSettings.bankName || 'BIDV', // bankName = bankCode
        accountNumber: accountNumber || currentSettings.accountNumber || '',
        accountName: accountName || currentSettings.accountName || '',
        webhookProvider: webhookProvider || currentSettings.webhookProvider || 'sepay',
        basicPrice: basicPrice ?? currentSettings.basicPrice ?? 199000,
        advancedPrice: advancedPrice ?? currentSettings.advancedPrice ?? 299000,
        isActive: isActive ?? currentSettings.isActive ?? false
      };

      // Chỉ update apiKey nếu không phải masked value
      if (apiKey && apiKey !== '**********') {
        newSettings.apiKey = apiKey;
      } else if (currentSettings.apiKey) {
        newSettings.apiKey = currentSettings.apiKey;
      }

      // Lưu vào database
      await prisma.systemSettings.upsert({
        where: { key: 'payment_settings' },
        update: { 
          value: JSON.stringify(newSettings), 
          updatedAt: new Date() 
        },
        create: { 
          key: 'payment_settings', 
          value: JSON.stringify(newSettings), 
          updatedAt: new Date() 
        }
      });

      // 🔧 FIX: Clear cache sau khi lưu payment settings
      cache.delete('payment_settings');

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
