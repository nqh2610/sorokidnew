import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { 
  verifyWebhookSignature, 
  getTierFromVariantId,
  LEMONSQUEEZY_CONFIG 
} from '@/lib/lemonsqueezy';

// Force dynamic route - không cache webhook
export const dynamic = 'force-dynamic';

/**
 * POST /api/payment/international/webhook
 * 
 * LemonSqueezy Webhook Handler
 * Xử lý các events từ LemonSqueezy khi thanh toán hoàn tất
 */
export async function POST(request) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Get signature from headers (App Router cần await)
    const headersList = await headers();
    const signature = headersList.get('x-signature');
    
    // Verify webhook signature
    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      console.error('[LemonSqueezy Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Parse the webhook payload
    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data || {};
    
    console.log(`[LemonSqueezy Webhook] Received event: ${eventName}`);
    
    // Handle different event types
    switch (eventName) {
      case 'order_created':
        await handleOrderCreated(payload, customData);
        break;
        
      case 'order_refunded':
        await handleOrderRefunded(payload, customData);
        break;
        
      case 'subscription_created':
        await handleSubscriptionCreated(payload, customData);
        break;
        
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(payload, customData);
        break;
        
      default:
        console.log(`[LemonSqueezy Webhook] Unhandled event: ${eventName}`);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('[LemonSqueezy Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Handle order_created event
 * Khi user hoàn tất thanh toán
 */
async function handleOrderCreated(payload, customData) {
  const { data } = payload;
  const attributes = data?.attributes || {};
  
  // Extract info
  const orderId = data?.id;
  const orderNumber = attributes.order_number;
  const status = attributes.status; // 'paid', 'pending', 'failed', 'refunded'
  const totalUsd = attributes.total_usd / 100; // Convert cents to dollars
  const userEmail = attributes.user_email;
  const variantId = attributes.first_order_item?.variant_id?.toString();
  
  // Get custom data passed during checkout
  const userId = customData.user_id;
  const targetTier = customData.target_tier;
  const currentTier = customData.current_tier || 'free';
  
  console.log(`[LemonSqueezy Webhook] Order created:`, {
    orderId,
    orderNumber,
    status,
    totalUsd,
    userId,
    targetTier,
    currentTier,
  });
  
  // Only process paid orders
  if (status !== 'paid') {
    console.log(`[LemonSqueezy Webhook] Skipping order with status: ${status}`);
    return;
  }
  
  // Check for duplicate order - prevent double processing
  const existingOrder = await prisma.paymentOrder.findFirst({
    where: { 
      externalOrderId: orderId?.toString(),
      paymentMethod: 'lemonsqueezy'
    }
  });
  
  if (existingOrder) {
    console.log(`[LemonSqueezy Webhook] Order ${orderId} already processed, skipping`);
    return;
  }
  
  // Validate userId
  if (!userId) {
    console.error('[LemonSqueezy Webhook] Missing user_id in custom data');
    // Try to find user by email
    if (userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true }
      });
      if (user) {
        await upgradeTier(user.id, targetTier || getTierFromVariantId(variantId), orderId, totalUsd, currentTier);
      }
    }
    return;
  }
  
  // Determine tier from variant ID if not in custom data
  const tier = targetTier || getTierFromVariantId(variantId);
  if (!tier) {
    console.error('[LemonSqueezy Webhook] Could not determine tier');
    return;
  }
  
  // Upgrade user tier
  await upgradeTier(userId, tier, orderId, totalUsd, currentTier);
}

/**
 * Handle order_refunded event
 * Khi order bị refund
 */
async function handleOrderRefunded(payload, customData) {
  const { data } = payload;
  const orderId = data?.id;
  const userId = customData.user_id;
  
  console.log(`[LemonSqueezy Webhook] Order refunded:`, { orderId, userId });
  
  // Find the payment order
  const paymentOrder = await prisma.paymentOrder.findFirst({
    where: { 
      externalOrderId: orderId?.toString(),
      paymentMethod: 'lemonsqueezy'
    }
  });
  
  if (paymentOrder) {
    // Revert to previous tier
    await prisma.$transaction([
      // Update order status
      prisma.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: { status: 'refunded' }
      }),
      // Revert user tier
      prisma.user.update({
        where: { id: paymentOrder.userId },
        data: { tier: paymentOrder.previousTier || 'free' }
      })
    ]);
    
    console.log(`[LemonSqueezy Webhook] User ${paymentOrder.userId} reverted to ${paymentOrder.previousTier || 'free'}`);
  }
}

/**
 * Handle subscription_created event (if using subscriptions)
 */
async function handleSubscriptionCreated(payload, customData) {
  // For now, SoroKid uses one-time payments
  // This is placeholder for future subscription support
  console.log('[LemonSqueezy Webhook] Subscription created (not implemented)');
}

/**
 * Handle subscription_cancelled event
 */
async function handleSubscriptionCancelled(payload, customData) {
  // Placeholder for future subscription support
  console.log('[LemonSqueezy Webhook] Subscription cancelled (not implemented)');
}

/**
 * Upgrade user tier after successful payment
 */
async function upgradeTier(userId, tier, externalOrderId, amountUsd, previousTier = 'free') {
  try {
    // Create order code
    const orderCode = `LSINT${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // Use transaction to ensure consistency
    await prisma.$transaction([
      // Create payment order record
      prisma.paymentOrder.create({
        data: {
          orderCode,
          userId,
          tier,
          amount: Math.round(amountUsd * 25000), // Convert to VND equivalent for record
          amountUsd,
          status: 'completed',
          previousTier,
          transactionType: previousTier === 'free' ? 'new' : 'upgrade',
          paymentMethod: 'lemonsqueezy',
          externalOrderId: externalOrderId?.toString(),
          completedAt: new Date(),
          note: `LemonSqueezy Order: ${externalOrderId}`,
        }
      }),
      // Update user tier
      prisma.user.update({
        where: { id: userId },
        data: { 
          tier,
          tierPurchasedAt: new Date()
        }
      })
    ]);
    
    console.log(`[LemonSqueezy Webhook] User ${userId} upgraded to ${tier}`);
    
  } catch (error) {
    console.error('[LemonSqueezy Webhook] Error upgrading tier:', error);
    throw error;
  }
}
