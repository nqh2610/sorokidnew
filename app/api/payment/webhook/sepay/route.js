/**
 * 🔌 SePay Webhook Handler (Alias route)
 * 
 * Route này chuyển tiếp request đến webhook chính tại /api/payment/webhook
 * Mục đích: Tương thích với URL đã cấu hình trên SePay portal
 * 
 * URL: /api/payment/webhook/sepay
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

// Validate webhook payload
function validateWebhookPayload(body) {
  const errors = [];
  
  if (!body.content) errors.push('Missing content field');
  if (typeof body.transferAmount !== 'number' || body.transferAmount <= 0) {
    errors.push('Invalid transferAmount');
  }
  if (!body.transferType) errors.push('Missing transferType');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * POST /api/payment/webhook/sepay - Nhận webhook từ SePay
 * 
 * SePay format:
 * {
 *   "id": 35641348,
 *   "gateway": "BIDV",
 *   "transactionDate": "2025-12-15 15:29:26",
 *   "accountNumber": "96247G3A5R",
 *   "subAccount": null,
 *   "code": "TF2412150001234",
 *   "content": "SOROKID SK17657874666429B087F",
 *   "transferType": "in",
 *   "description": "...",
 *   "transferAmount": 1000,
 *   "referenceCode": "064089a2-9492-4e52-8643-ecd4cd432ea1",
 *   "accumulated": 503000
 * }
 */
export async function POST(request) {
  console.log('=== SEPAY WEBHOOK RECEIVED ===');
  
  try {
    // 🔐 RATE LIMITING
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
    if (rateLimitError) {
      console.warn('Webhook rate limited');
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const body = await request.json();
    
    // 📝 LOG FULL PAYLOAD FOR DEBUGGING
    console.log('SePay Webhook Payload:', JSON.stringify(body, null, 2));
    console.log('Headers:', Object.fromEntries(request.headers.entries()));

    // 🔐 VALIDATE PAYLOAD
    const validation = validateWebhookPayload(body);
    if (!validation.valid) {
      console.warn('Invalid webhook payload:', validation.errors);
      return NextResponse.json({ 
        success: false,
        error: 'Invalid payload',
        details: validation.errors 
      }, { status: 400 });
    }

    // Lấy thông tin từ webhook (SePay format)
    const {
      id: transactionId,
      content,
      transferAmount,
      transferType,
      transactionDate,
      referenceCode,
      gateway,
      accountNumber
    } = body;

    console.log(`Transaction: ID=${transactionId}, Amount=${transferAmount}, Type=${transferType}`);
    console.log(`Content: ${content}`);
    console.log(`Bank: ${gateway}, Account: ${accountNumber}`);

    // Chỉ xử lý giao dịch tiền vào
    if (transferType !== 'in') {
      console.log('Ignored: not incoming transfer');
      return NextResponse.json({ 
        success: true, 
        message: 'Ignored: not incoming transfer' 
      });
    }

    // Tìm order code từ nội dung chuyển khoản
    // Format: SOROKID SK1234567890ABC hoặc chỉ SK1234567890ABC
    const orderCodeMatch = content?.match(/SK[0-9A-Fa-f]+/i);
    if (!orderCodeMatch) {
      console.log('No order code found in content:', content);
      return NextResponse.json({ 
        success: true, 
        message: 'No order code found in content' 
      });
    }

    const orderCode = orderCodeMatch[0].toUpperCase();
    console.log('Found order code:', orderCode);

    // Tìm đơn hàng PENDING
    const order = await prisma.paymentOrder.findFirst({
      where: { 
        orderCode,
        status: 'pending'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, tier: true }
        }
      }
    });

    if (!order) {
      console.log('Order not found or already processed:', orderCode);
      
      // Kiểm tra xem order đã completed chưa (idempotency)
      const existingOrder = await prisma.paymentOrder.findFirst({
        where: { orderCode }
      });
      
      if (existingOrder?.status === 'completed') {
        console.log('Order already completed (idempotent check)');
        return NextResponse.json({ 
          success: true, 
          message: 'Order already processed' 
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Order not found or already processed' 
      });
    }

    console.log(`Found order: ${order.orderCode}, Expected: ${order.amount}đ, User: ${order.user?.email}`);

    // ⚠️ KIỂM TRA SỐ TIỀN - Phải >= số tiền đơn hàng
    if (transferAmount < order.amount) {
      console.warn(`❌ Amount insufficient: received ${transferAmount}đ, expected ${order.amount}đ`);
      
      const shortAmount = order.amount - transferAmount;
      
      // Cập nhật ghi chú về số tiền chưa đủ
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: {
          paidAmount: transferAmount,
          transactionId: transactionId?.toString() || referenceCode,
          note: `${order.note || ''} | ⚠️ Thiếu tiền: Nhận ${transferAmount.toLocaleString()}đ / Cần ${order.amount.toLocaleString()}đ (-${shortAmount.toLocaleString()}đ)`,
          updatedAt: new Date()
        }
      });
      
      // 🔔 TẠO NOTIFICATION CHO USER - Thông báo số tiền không đủ
      try {
        await prisma.notification.create({
          data: {
            userId: order.userId,
            type: 'payment_insufficient',
            title: '⚠️ Số tiền chuyển không đủ!',
            message: `Đơn hàng ${orderCode}: Bạn đã chuyển ${transferAmount.toLocaleString()}đ nhưng cần ${order.amount.toLocaleString()}đ. Còn thiếu ${shortAmount.toLocaleString()}đ để kích hoạt gói ${order.tier.toUpperCase()}. Vui lòng chuyển thêm hoặc liên hệ hỗ trợ.`,
            data: JSON.stringify({
              orderCode,
              tier: order.tier,
              required: order.amount,
              received: transferAmount,
              shortage: shortAmount
            }),
            isRead: false
          }
        });
        console.log('Notification created for insufficient amount');
      } catch (notifyError) {
        console.error('Error creating notification:', notifyError.message);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Amount insufficient: received ${transferAmount}, expected ${order.amount}` 
      });
    }

    // === ✅ THANH TOÁN THÀNH CÔNG - KÍCH HOẠT GÓI ===
    console.log('✅ Payment confirmed! Activating tier:', order.tier);

    // 1. Cập nhật đơn hàng thành completed
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: 'completed',
        transactionId: transactionId?.toString() || referenceCode,
        paidAmount: transferAmount,
        paidAt: transactionDate ? new Date(transactionDate.replace(' ', 'T')) : new Date(),
        note: `${order.note || ''} | ✅ Thanh toán thành công qua ${gateway}`,
        updatedAt: new Date()
      }
    });

    // 2. Cập nhật tier cho user
    const updatedUser = await prisma.user.update({
      where: { id: order.userId },
      data: {
        tier: order.tier,
        tierPurchasedAt: new Date()
      }
    });

    console.log(`✅ User ${order.userId} (${order.user?.email}) upgraded to ${order.tier}`);

    // 3. Tạo notification cho user (không throw error nếu fail)
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
            amount: transferAmount,
            transactionId: transactionId?.toString() || referenceCode
          }),
          isRead: false
        }
      });
      console.log('Notification created for user');
    } catch (notifyError) {
      console.error('Error creating notification (non-critical):', notifyError.message);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment confirmed and tier activated',
      data: {
        orderCode,
        tier: order.tier,
        userId: order.userId,
        userEmail: order.user?.email,
        amount: transferAmount
      }
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

// GET /api/payment/webhook/sepay - Health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    provider: 'sepay',
    message: 'SePay webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
