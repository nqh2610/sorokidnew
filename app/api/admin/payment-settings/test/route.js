import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/admin/payment-settings/test - Test webhook connection
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await request.json();

    // Get API key from payment_settings JSON
    const paymentSettings = await prisma.systemSettings.findUnique({
      where: { key: 'payment_settings' }
    });

    let apiKey = '';
    if (paymentSettings?.value) {
      try {
        const parsed = JSON.parse(paymentSettings.value);
        apiKey = parsed.apiKey || '';
      } catch (e) {
        // ignore parse error
      }
    }

    if (!apiKey) {
      return NextResponse.json({ 
        success: false,
        error: 'Chưa cấu hình API Key. Vui lòng nhập API Key và lưu trước.' 
      }, { status: 400 });
    }

    // Test connection based on provider
    if (provider === 'sepay') {
      // Test SePay API connection
      try {
        const response = await fetch('https://my.sepay.vn/userapi/transactions/list', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Update isActive trong payment_settings JSON
          if (paymentSettings?.value) {
            try {
              const parsed = JSON.parse(paymentSettings.value);
              parsed.isActive = true;
              await prisma.systemSettings.update({
                where: { key: 'payment_settings' },
                data: { value: JSON.stringify(parsed), updatedAt: new Date() }
              });
            } catch (e) {
              // ignore
            }
          }

          return NextResponse.json({ 
            success: true,
            message: 'Kết nối SePay thành công!',
            transactionCount: data.transactions?.length || 0
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          return NextResponse.json({ 
            success: false,
            error: errorData.message || 'API Key không hợp lệ hoặc đã hết hạn'
          }, { status: 400 });
        }
      } catch (fetchError) {
        console.error('SePay fetch error:', fetchError);
        return NextResponse.json({ 
          success: false,
          error: 'Không thể kết nối đến SePay. Vui lòng kiểm tra kết nối mạng.'
        }, { status: 500 });
      }
    } else if (provider === 'casso') {
      // Test Casso API connection
      try {
        const response = await fetch('https://oauth.casso.vn/v2/userInfo', {
          method: 'GET',
          headers: {
            'Authorization': `Apikey ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Update isActive trong payment_settings JSON
          if (paymentSettings?.value) {
            try {
              const parsed = JSON.parse(paymentSettings.value);
              parsed.isActive = true;
              await prisma.systemSettings.update({
                where: { key: 'payment_settings' },
                data: { value: JSON.stringify(parsed), updatedAt: new Date() }
              });
            } catch (e) {
              // ignore
            }
          }

          return NextResponse.json({ 
            success: true,
            message: 'Kết nối Casso thành công!',
            user: data.data?.user?.name || 'Unknown'
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          return NextResponse.json({ 
            success: false,
            error: errorData.message || 'API Key không hợp lệ hoặc đã hết hạn'
          }, { status: 400 });
        }
      } catch (fetchError) {
        console.error('Casso fetch error:', fetchError);
        return NextResponse.json({ 
          success: false,
          error: 'Không thể kết nối đến Casso. Vui lòng kiểm tra kết nối mạng.'
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({ 
        success: false,
        error: 'Provider không được hỗ trợ'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error testing webhook:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Lỗi server. Vui lòng thử lại sau.'
    }, { status: 500 });
  }
}
