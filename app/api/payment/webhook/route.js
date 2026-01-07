import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { invalidateUserCacheCompletely } from '@/lib/cache';

export const dynamic = 'force-dynamic';

/**
 * 🔐 BẢO MẬT WEBHOOK PAYMENT
 * 
 * 1. Verify webhook signature (nếu provider hỗ trợ)
 * 2. Rate limiting để chống spam
 * 3. Validate dữ liệu đầu vào
 * 4. Idempotency check (không xử lý trùng)
 */

// Verify SePay webhook signature (nếu có)
function verifyWebhookSignature(body, signature, secret) {
  if (!secret || !signature) return true; // Skip nếu không có secret
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

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
  console.log('=== WEBHOOK RECEIVED ===');
  
  try {
    // 🔐 RATE LIMITING - Chống spam webhook
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
    if (rateLimitError) {
      console.warn('Webhook rate limited');
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const body = await request.json();
    
    // 📝 LOG FULL PAYLOAD FOR DEBUGGING
    console.log('Webhook Payload:', JSON.stringify(body, null, 2));
    
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

    // 🔐 VERIFY SIGNATURE (nếu có)
    const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET;
    const signature = request.headers.get('x-sepay-signature');
    
    if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
      console.warn('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Lấy thông tin từ webhook (SePay format)
    const {
      id: transactionId,
      content,
      transferAmount,
      transferType,
      transactionDate,
      referenceCode,
      gateway
    } = body;

    console.log(`Transaction: ID=${transactionId}, Amount=${transferAmount}, Type=${transferType}`);
    console.log(`Content: ${content}`);

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
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, tier: true }
        }
      }
    });

    if (!order) {
      console.log('Order not found or already processed:', orderCode);
      
      // Idempotency check
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
          note: `${order.note || ''} | ⚠️ Thiếu tiền: Nhận ${transferAmount.toLocaleString()}đ / Cần ${order.amount.toLocaleString()}đ`
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
    // SePay date format: "2025-12-15 15:29:26" -> cần replace space với T
    const paidAtDate = transactionDate 
      ? new Date(transactionDate.replace(' ', 'T')) 
      : new Date();
    
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: 'completed',
        transactionId: transactionId?.toString() || referenceCode,
        paidAmount: transferAmount,
        paidAt: paidAtDate,
        createdAt: new Date(), // 🔧 FIX: Cập nhật để giao dịch mới lên đầu danh sách
        note: `${order.note || ''} | ✅ Thanh toán thành công qua ${gateway || 'bank'}`
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

    // 🔧 QUAN TRỌNG: Invalidate TOÀN BỘ cache user để đảm bảo
    // user thấy tier mới ngay lập tức trên Dashboard, TopBar, etc.
    invalidateUserCacheCompletely(order.userId);

    console.log(`✅ User ${order.userId} (${order.user?.email}) upgraded to ${order.tier}`);

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
