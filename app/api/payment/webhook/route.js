import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/payment/webhook - Nhận webhook từ SePay/Casso
 * Tự động kích hoạt gói khi thanh toán thành công
 * 
 * SePay format:
 * {
 *   "id": 123,
 *   "gateway": "MBBank",
 *   "transactionDate": "2024-01-15 10:30:00",
 *   "accountNumber": "0839969966",
 *   "subAccount": null,
 *   "code": null,
 *   "content": "SOROKID SK1234567890ABC",
 *   "transferType": "in",
 *   "description": "...",
 *   "transferAmount": 199000,
 *   "referenceCode": "FT24015...",
 *   "accumulated": 1000000
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Lấy thông tin từ webhook (SePay format)
    const {
      id: transactionId,
      content,
      transferAmount,
      transferType,
      transactionDate,
      referenceCode
    } = body;

    // Chỉ xử lý giao dịch tiền vào
    if (transferType !== 'in') {
      return NextResponse.json({ 
        success: true, 
        message: 'Ignored: not incoming transfer' 
      });
    }

    // Tìm order code từ nội dung chuyển khoản
    // Format: SOROKID SK1234567890ABC hoặc chỉ SK1234567890ABC
    const orderCodeMatch = content?.match(/SK[0-9A-F]+/i);
    if (!orderCodeMatch) {
      console.log('No order code found in content:', content);
      return NextResponse.json({ 
        success: true, 
        message: 'No order code found' 
      });
    }

    const orderCode = orderCodeMatch[0].toUpperCase();
    console.log('Found order code:', orderCode);

    // Tìm đơn hàng
    const order = await prisma.paymentOrder.findFirst({
      where: { 
        orderCode,
        status: 'pending'
      }
    });

    if (!order) {
      console.log('Order not found or already processed:', orderCode);
      return NextResponse.json({ 
        success: true, 
        message: 'Order not found or already processed' 
      });
    }

    // Kiểm tra số tiền
    if (transferAmount < order.amount) {
      console.log(`Amount mismatch: received ${transferAmount}, expected ${order.amount}`);
      
      // Cập nhật ghi chú về số tiền chưa đủ
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: {
          paidAmount: transferAmount,
          note: `${order.note || ''} | Đã nhận ${transferAmount}đ (thiếu ${order.amount - transferAmount}đ)`
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Amount insufficient' 
      });
    }

    // === THANH TOÁN THÀNH CÔNG - KÍCH HOẠT GÓI ===
    console.log('Payment confirmed! Activating tier:', order.tier);

    // 1. Cập nhật đơn hàng thành completed
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: 'completed',
        transactionId: transactionId?.toString() || referenceCode,
        paidAmount: transferAmount,
        paidAt: transactionDate ? new Date(transactionDate) : new Date()
      }
    });

    // 2. Cập nhật tier cho user
    await prisma.user.update({
      where: { id: order.userId },
      data: {
        tier: order.tier,
        tierPurchasedAt: new Date()
      }
    });

    console.log(`User ${order.userId} upgraded to ${order.tier}`);

    // 3. Tạo notification cho user
    try {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: 'payment_success',
          title: '🎉 Nâng cấp thành công!',
          message: `Bạn đã nâng cấp lên gói ${order.tier.toUpperCase()} thành công. Hãy bắt đầu khám phá các tính năng mới!`,
          data: JSON.stringify({
            orderCode,
            tier: order.tier,
            amount: transferAmount
          })
        }
      });
    } catch (notifyError) {
      console.error('Error creating notification:', notifyError);
      // Không throw lỗi, vì thanh toán đã thành công
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment confirmed and tier activated',
      data: {
        orderCode,
        tier: order.tier,
        userId: order.userId
      }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

// GET /api/payment/webhook - Health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
