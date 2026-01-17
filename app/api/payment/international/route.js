import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { 
  createCheckoutUrl, 
  getVariantIdFromTier, 
  getPriceUsd,
  isLemonSqueezyConfigured,
  LEMONSQUEEZY_CONFIG 
} from '@/lib/lemonsqueezy';

// Thứ tự tier (dùng để so sánh)
const TIER_ORDER = {
  free: 0,
  basic: 1,
  advanced: 2,
  vip: 3
};

/**
 * POST /api/payment/international
 * 
 * Tạo checkout session cho thanh toán quốc tế qua LemonSqueezy
 * Chỉ dành cho users không phải Việt Nam (ngôn ngữ khác vi)
 */
export async function POST(request) {
  try {
    // Rate limiting
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.STRICT);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ 
        error: 'Please login to continue',
        errorCode: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    // Check if LemonSqueezy is configured
    if (!isLemonSqueezyConfigured()) {
      console.error('LemonSqueezy not configured');
      return NextResponse.json({ 
        error: 'International payment is not available at the moment',
        errorCode: 'NOT_CONFIGURED'
      }, { status: 503 });
    }

    const body = await request.json();
    const { packageId, locale } = body;
    const userId = session.user.id;

    // Validate locale - chỉ cho phép thanh toán quốc tế khi không phải tiếng Việt
    if (locale === 'vi') {
      return NextResponse.json({ 
        error: 'Vietnamese users should use domestic payment',
        errorCode: 'WRONG_PAYMENT_METHOD'
      }, { status: 400 });
    }

    // Validate package
    if (!packageId || !['basic', 'advanced'].includes(packageId)) {
      return NextResponse.json({ 
        error: 'Invalid package',
        errorCode: 'INVALID_PACKAGE'
      }, { status: 400 });
    }

    // Get user current tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true, email: true, name: true }
    });

    const userCurrentTier = user?.tier || 'free';

    // Validate: chỉ cho phép nâng cấp lên gói cao hơn
    const currentTierOrder = TIER_ORDER[userCurrentTier] || 0;
    const targetTierOrder = TIER_ORDER[packageId] || 0;

    if (targetTierOrder <= currentTierOrder) {
      return NextResponse.json({ 
        error: 'You can only upgrade to a higher plan',
        errorCode: 'INVALID_UPGRADE'
      }, { status: 400 });
    }

    // Get variant ID for the tier
    const variantId = getVariantIdFromTier(packageId);
    if (!variantId) {
      return NextResponse.json({ 
        error: 'Package not available for international payment',
        errorCode: 'PACKAGE_NOT_AVAILABLE'
      }, { status: 400 });
    }

    // Create LemonSqueezy checkout URL
    const checkoutUrl = createCheckoutUrl({
      variantId,
      userId,
      userEmail: user?.email || session.user.email,
      userName: user?.name || session.user.name,
      tier: packageId,
      currentTier: userCurrentTier,
    });

    // Log the checkout creation (for debugging)
    console.log(`[LemonSqueezy] Checkout created for user ${userId}, tier: ${packageId}`);

    return NextResponse.json({
      success: true,
      checkoutUrl,
      paymentMethod: 'lemonsqueezy',
      tier: packageId,
      priceUsd: getPriceUsd(packageId),
    });

  } catch (error) {
    console.error('Error creating international checkout:', error);
    return NextResponse.json({ 
      error: 'System error, please try again later',
      errorCode: 'SYSTEM_ERROR'
    }, { status: 500 });
  }
}

/**
 * GET /api/payment/international
 * 
 * Lấy thông tin thanh toán quốc tế và giá USD
 */
export async function GET(request) {
  try {
    const configured = isLemonSqueezyConfigured();
    
    return NextResponse.json({
      available: configured,
      paymentMethod: 'lemonsqueezy',
      products: {
        basic: {
          priceUsd: getPriceUsd('basic'),
          available: configured && !!LEMONSQUEEZY_CONFIG.products.basic.variantId,
        },
        advanced: {
          priceUsd: getPriceUsd('advanced'),
          available: configured && !!LEMONSQUEEZY_CONFIG.products.advanced.variantId,
        },
      },
      // Supported currencies info
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'and 90+ more'],
    });
  } catch (error) {
    console.error('Error getting international payment info:', error);
    return NextResponse.json({ 
      error: 'System error',
      available: false 
    }, { status: 500 });
  }
}
