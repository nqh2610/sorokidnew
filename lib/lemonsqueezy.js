/**
 * 🍋 LEMON SQUEEZY INTEGRATION
 * 
 * Thanh toán quốc tế cho khách hàng ngoài Việt Nam
 * - Sử dụng LemonSqueezy làm Merchant of Record
 * - Hỗ trợ 95+ loại tiền tệ
 * - Tự động xử lý thuế VAT quốc tế
 * 
 * @version 1.0.0
 */

// LemonSqueezy API Configuration
export const LEMONSQUEEZY_CONFIG = {
  // API base URL
  apiUrl: 'https://api.lemonsqueezy.com/v1',
  
  // Checkout overlay URL
  checkoutUrl: 'https://checkout.lemonsqueezy.com',
  
  // Store ID - Cần cập nhật sau khi tạo tài khoản
  storeId: process.env.LEMONSQUEEZY_STORE_ID || '',
  
  // API Key - Cần thiết cho webhook và API calls
  apiKey: process.env.LEMONSQUEEZY_API_KEY || '',
  
  // Webhook Secret - Để verify webhook signatures
  webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '',
  
  // Product/Variant IDs mapping với các gói SoroKid
  // Cần tạo products trên LemonSqueezy dashboard và cập nhật IDs
  products: {
    basic: {
      productId: process.env.LEMONSQUEEZY_BASIC_PRODUCT_ID || '',
      variantId: process.env.LEMONSQUEEZY_BASIC_VARIANT_ID || '',
      // Giá $9 USD → Sau phí (5%+$0.50) nhận $8.05 ≈ 201,250đ (≈ 199,000đ VND)
      priceUsd: 9,
      originalPriceUsd: 15, // Giá gốc $15 → Giảm 40%
    },
    advanced: {
      productId: process.env.LEMONSQUEEZY_ADVANCED_PRODUCT_ID || '',
      variantId: process.env.LEMONSQUEEZY_ADVANCED_VARIANT_ID || '',
      // Giá $13 USD → Sau phí (5%+$0.50) nhận $11.85 ≈ 296,250đ (≈ 299,000đ VND)
      priceUsd: 13,
      originalPriceUsd: 25, // Giá gốc $25 → Giảm 48%
    },
  },
  
  // Webhook events cần handle
  webhookEvents: [
    'order_created',
    'order_refunded',
    'subscription_created',
    'subscription_updated',
    'subscription_cancelled',
  ],
};

/**
 * Tạo checkout URL với LemonSqueezy
 * @param {Object} params - Parameters
 * @param {string} params.variantId - LemonSqueezy variant ID
 * @param {string} params.userId - SoroKid user ID
 * @param {string} params.userEmail - User email
 * @param {string} params.userName - User name
 * @param {string} params.tier - Target tier (basic/advanced)
 * @param {string} params.currentTier - Current user tier
 * @returns {string} Checkout URL
 */
export function createCheckoutUrl({ variantId, userId, userEmail, userName, tier, currentTier }) {
  if (!variantId) {
    throw new Error('Variant ID is required');
  }
  
  // Base checkout URL - format: https://STORE.lemonsqueezy.com/checkout/buy/VARIANT_ID
  const storeSlug = process.env.LEMONSQUEEZY_STORE_SLUG || 'sorokid';
  const baseUrl = `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${variantId}`;
  
  // URL params
  const params = new URLSearchParams();
  
  // Custom data để truyền về webhook - LemonSqueezy sẽ forward về webhook
  params.set('checkout[custom][user_id]', userId);
  params.set('checkout[custom][target_tier]', tier);
  params.set('checkout[custom][current_tier]', currentTier || 'free');
  
  // Pre-fill user info
  if (userEmail) {
    params.set('checkout[email]', userEmail);
  }
  if (userName) {
    params.set('checkout[name]', userName);
  }
  
  // Success/cancel redirect URLs - quan trọng!
  const baseAppUrl = process.env.NEXTAUTH_URL || 'https://sorokid.com';
  params.set('checkout[success_url]', `${baseAppUrl}/pricing?payment=success&tier=${tier}`);
  params.set('checkout[cancel_url]', `${baseAppUrl}/pricing?payment=cancelled`);
  
  // Simplify checkout form - chỉ yêu cầu country, không cần full address
  // Tùy chọn: 'minimal' (chỉ country) hoặc 'required' (full address)
  // LemonSqueezy cần ít nhất country để tính thuế VAT
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Verify LemonSqueezy webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - X-Signature header
 * @returns {boolean} Is valid signature
 */
export function verifyWebhookSignature(payload, signature) {
  if (!LEMONSQUEEZY_CONFIG.webhookSecret) {
    console.warn('LEMONSQUEEZY_WEBHOOK_SECRET not configured');
    return false;
  }
  
  try {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', LEMONSQUEEZY_CONFIG.webhookSecret);
    const digest = hmac.update(payload).digest('hex');
    
    // Ensure both buffers have same length before comparing
    if (signature.length !== digest.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  } catch (error) {
    console.error('[LemonSqueezy] Signature verification error:', error);
    return false;
  }
}

/**
 * Call LemonSqueezy API
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response
 */
export async function lemonSqueezyApi(endpoint, options = {}) {
  if (!LEMONSQUEEZY_CONFIG.apiKey) {
    throw new Error('LEMONSQUEEZY_API_KEY not configured');
  }
  
  const url = `${LEMONSQUEEZY_CONFIG.apiUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Bearer ${LEMONSQUEEZY_CONFIG.apiKey}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`LemonSqueezy API error: ${response.status} - ${JSON.stringify(error)}`);
  }
  
  return response.json();
}

/**
 * Get order details from LemonSqueezy
 * @param {string} orderId - LemonSqueezy order ID
 * @returns {Promise<Object>} Order details
 */
export async function getOrder(orderId) {
  return lemonSqueezyApi(`/orders/${orderId}`);
}

/**
 * Get customer details from LemonSqueezy
 * @param {string} customerId - LemonSqueezy customer ID
 * @returns {Promise<Object>} Customer details
 */
export async function getCustomer(customerId) {
  return lemonSqueezyApi(`/customers/${customerId}`);
}

/**
 * Mapping tier từ variant ID
 * @param {string} variantId - LemonSqueezy variant ID
 * @returns {string|null} Tier name
 */
export function getTierFromVariantId(variantId) {
  for (const [tier, config] of Object.entries(LEMONSQUEEZY_CONFIG.products)) {
    if (config.variantId === variantId) {
      return tier;
    }
  }
  return null;
}

/**
 * Mapping variant ID từ tier
 * @param {string} tier - Tier name (basic/advanced)
 * @returns {string|null} Variant ID
 */
export function getVariantIdFromTier(tier) {
  return LEMONSQUEEZY_CONFIG.products[tier]?.variantId || null;
}

/**
 * Giá USD tương đương cho mỗi tier
 * @param {string} tier - Tier name
 * @returns {number} Price in USD
 */
export function getPriceUsd(tier) {
  return LEMONSQUEEZY_CONFIG.products[tier]?.priceUsd || 0;
}

/**
 * Check if LemonSqueezy is properly configured
 * @returns {boolean}
 */
export function isLemonSqueezyConfigured() {
  // storeId không bắt buộc, chỉ cần variant IDs và webhook secret
  const hasBasicVariant = !!LEMONSQUEEZY_CONFIG.products.basic.variantId;
  const hasAdvancedVariant = !!LEMONSQUEEZY_CONFIG.products.advanced.variantId;
  const hasWebhookSecret = !!LEMONSQUEEZY_CONFIG.webhookSecret;
  
  if (!hasBasicVariant || !hasAdvancedVariant) {
    console.warn('[LemonSqueezy] Missing variant IDs');
  }
  if (!hasWebhookSecret) {
    console.warn('[LemonSqueezy] Missing webhook secret');
  }
  
  return hasBasicVariant && hasAdvancedVariant && hasWebhookSecret;
}

// Default export object
const lemonSqueezy = {
  config: LEMONSQUEEZY_CONFIG,
  createCheckoutUrl,
  verifyWebhookSignature,
  lemonSqueezyApi,
  getOrder,
  getCustomer,
  getTierFromVariantId,
  getVariantIdFromTier,
  getPriceUsd,
  isLemonSqueezyConfigured,
};

export default lemonSqueezy;
