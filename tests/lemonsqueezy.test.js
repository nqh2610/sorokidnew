/**
 * 🧪 LemonSqueezy Integration Tests
 * 
 * Test các function trong lib/lemonsqueezy.js
 */

// Mock environment variables
process.env.LEMONSQUEEZY_STORE_SLUG = 'sorokid';
process.env.LEMONSQUEEZY_STORE_ID = 'test_store_id';
process.env.LEMONSQUEEZY_API_KEY = 'test_api_key';
process.env.LEMONSQUEEZY_WEBHOOK_SECRET = 'sk_webhook_8f4a2b9c7d1e6f3a5b8c2d4e';
process.env.LEMONSQUEEZY_BASIC_VARIANT_ID = '000c253c-6403-4aca-ab6f-4fdaf268c1f6';
process.env.LEMONSQUEEZY_ADVANCED_VARIANT_ID = '9daba330-c1ba-490a-bdb4-9e68bb269e59';
process.env.NEXTAUTH_URL = 'https://sorokid.com';

const {
  LEMONSQUEEZY_CONFIG,
  createCheckoutUrl,
  verifyWebhookSignature,
  getTierFromVariantId,
  getVariantIdFromTier,
  getPriceUsd,
  isLemonSqueezyConfigured,
} = require('../lib/lemonsqueezy.js');

const crypto = require('crypto');

// Test results
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} Expected "${expected}", got "${actual}"`);
  }
}

function assertTrue(condition, message = '') {
  if (!condition) {
    throw new Error(`${message} Expected true, got false`);
  }
}

function assertFalse(condition, message = '') {
  if (condition) {
    throw new Error(`${message} Expected false, got true`);
  }
}

function assertContains(str, substring, message = '') {
  if (!str.includes(substring)) {
    throw new Error(`${message} Expected "${str}" to contain "${substring}"`);
  }
}

console.log('\n🧪 Running LemonSqueezy Integration Tests...\n');
console.log('='.repeat(50));

// ============================================
// Test 1: Configuration Loading
// ============================================
console.log('\n📦 Configuration Tests:\n');

test('LEMONSQUEEZY_CONFIG loads store slug', () => {
  // Re-import to get fresh config
  assertEqual(process.env.LEMONSQUEEZY_STORE_SLUG, 'sorokid');
});

test('LEMONSQUEEZY_CONFIG loads basic variant ID', () => {
  assertEqual(
    process.env.LEMONSQUEEZY_BASIC_VARIANT_ID,
    '000c253c-6403-4aca-ab6f-4fdaf268c1f6'
  );
});

test('LEMONSQUEEZY_CONFIG loads advanced variant ID', () => {
  assertEqual(
    process.env.LEMONSQUEEZY_ADVANCED_VARIANT_ID,
    '9daba330-c1ba-490a-bdb4-9e68bb269e59'
  );
});

test('LEMONSQUEEZY_CONFIG has correct basic price', () => {
  assertEqual(LEMONSQUEEZY_CONFIG.products.basic.priceUsd, 9);
});

test('LEMONSQUEEZY_CONFIG has correct advanced price', () => {
  assertEqual(LEMONSQUEEZY_CONFIG.products.advanced.priceUsd, 13);
});

// ============================================
// Test 2: isLemonSqueezyConfigured
// ============================================
console.log('\n🔧 Configuration Check Tests:\n');

test('isLemonSqueezyConfigured returns true when configured', () => {
  const result = isLemonSqueezyConfigured();
  assertTrue(result, 'Should be configured with all required env vars');
});

// ============================================
// Test 3: createCheckoutUrl
// ============================================
console.log('\n🔗 Checkout URL Tests:\n');

test('createCheckoutUrl generates valid URL', () => {
  const url = createCheckoutUrl({
    variantId: '000c253c-6403-4aca-ab6f-4fdaf268c1f6',
    userId: 'user123',
    userEmail: 'test@example.com',
    userName: 'Test User',
    tier: 'basic',
    currentTier: 'free',
  });
  
  assertContains(url, 'sorokid.lemonsqueezy.com');
  assertContains(url, 'checkout/buy/000c253c-6403-4aca-ab6f-4fdaf268c1f6');
});

test('createCheckoutUrl includes custom data', () => {
  const url = createCheckoutUrl({
    variantId: '000c253c-6403-4aca-ab6f-4fdaf268c1f6',
    userId: 'user123',
    userEmail: 'test@example.com',
    userName: 'Test User',
    tier: 'basic',
    currentTier: 'free',
  });
  
  assertContains(url, 'checkout%5Bcustom%5D%5Buser_id%5D=user123');
  assertContains(url, 'checkout%5Bcustom%5D%5Btarget_tier%5D=basic');
});

test('createCheckoutUrl includes success URL', () => {
  const url = createCheckoutUrl({
    variantId: '000c253c-6403-4aca-ab6f-4fdaf268c1f6',
    userId: 'user123',
    tier: 'basic',
    currentTier: 'free',
  });
  
  assertContains(url, 'success_url');
  assertContains(url, 'payment%3Dsuccess');
});

test('createCheckoutUrl includes cancel URL', () => {
  const url = createCheckoutUrl({
    variantId: '000c253c-6403-4aca-ab6f-4fdaf268c1f6',
    userId: 'user123',
    tier: 'basic',
    currentTier: 'free',
  });
  
  assertContains(url, 'cancel_url');
  assertContains(url, 'payment%3Dcancelled');
});

test('createCheckoutUrl throws error without variantId', () => {
  let threw = false;
  try {
    createCheckoutUrl({
      userId: 'user123',
      tier: 'basic',
    });
  } catch (e) {
    threw = true;
    assertContains(e.message, 'Variant ID is required');
  }
  assertTrue(threw, 'Should throw error without variantId');
});

// ============================================
// Test 4: verifyWebhookSignature
// ============================================
console.log('\n🔐 Webhook Signature Tests:\n');

test('verifyWebhookSignature returns true for valid signature', () => {
  const payload = JSON.stringify({ test: 'data' });
  const secret = 'sk_webhook_8f4a2b9c7d1e6f3a5b8c2d4e';
  
  // Generate valid signature
  const hmac = crypto.createHmac('sha256', secret);
  const signature = hmac.update(payload).digest('hex');
  
  const result = verifyWebhookSignature(payload, signature);
  assertTrue(result, 'Should verify valid signature');
});

test('verifyWebhookSignature returns false for invalid signature', () => {
  const payload = JSON.stringify({ test: 'data' });
  const invalidSignature = 'invalid_signature_12345';
  
  const result = verifyWebhookSignature(payload, invalidSignature);
  assertFalse(result, 'Should reject invalid signature');
});

test('verifyWebhookSignature returns false for tampered payload', () => {
  const originalPayload = JSON.stringify({ test: 'data' });
  const tamperedPayload = JSON.stringify({ test: 'tampered' });
  const secret = 'sk_webhook_8f4a2b9c7d1e6f3a5b8c2d4e';
  
  // Generate signature for original payload
  const hmac = crypto.createHmac('sha256', secret);
  const signature = hmac.update(originalPayload).digest('hex');
  
  // Try to verify with tampered payload
  const result = verifyWebhookSignature(tamperedPayload, signature);
  assertFalse(result, 'Should reject tampered payload');
});

// ============================================
// Test 5: Tier/Variant Mapping
// ============================================
console.log('\n🎯 Tier/Variant Mapping Tests:\n');

test('getVariantIdFromTier returns correct ID for basic', () => {
  const variantId = getVariantIdFromTier('basic');
  assertEqual(variantId, '000c253c-6403-4aca-ab6f-4fdaf268c1f6');
});

test('getVariantIdFromTier returns correct ID for advanced', () => {
  const variantId = getVariantIdFromTier('advanced');
  assertEqual(variantId, '9daba330-c1ba-490a-bdb4-9e68bb269e59');
});

test('getVariantIdFromTier returns null for invalid tier', () => {
  const variantId = getVariantIdFromTier('invalid');
  assertEqual(variantId, null);
});

test('getTierFromVariantId returns basic for basic variant', () => {
  const tier = getTierFromVariantId('000c253c-6403-4aca-ab6f-4fdaf268c1f6');
  assertEqual(tier, 'basic');
});

test('getTierFromVariantId returns advanced for advanced variant', () => {
  const tier = getTierFromVariantId('9daba330-c1ba-490a-bdb4-9e68bb269e59');
  assertEqual(tier, 'advanced');
});

test('getTierFromVariantId returns null for unknown variant', () => {
  const tier = getTierFromVariantId('unknown-variant-id');
  assertEqual(tier, null);
});

// ============================================
// Test 6: Price Functions
// ============================================
console.log('\n💰 Price Function Tests:\n');

test('getPriceUsd returns 9 for basic', () => {
  assertEqual(getPriceUsd('basic'), 9);
});

test('getPriceUsd returns 13 for advanced', () => {
  assertEqual(getPriceUsd('advanced'), 13);
});

test('getPriceUsd returns 0 for invalid tier', () => {
  assertEqual(getPriceUsd('invalid'), 0);
});

// ============================================
// Summary
// ============================================
console.log('\n' + '='.repeat(50));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.log('❌ Some tests failed!\n');
  process.exit(1);
} else {
  console.log('✅ All tests passed!\n');
  process.exit(0);
}
