/**
 * 🧪 TEST: Dashboard API Polling Check
 * 
 * Script này sẽ:
 * 1. Login vào hệ thống
 * 2. Vào trang dashboard
 * 3. Monitor các API calls trong 30 giây
 * 4. Report kết quả
 */

const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'demo@sorokids.com';
const TEST_PASSWORD = '123456';

async function main() {
  console.log('🚀 Starting Dashboard API Polling Test\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track API calls
  const apiCalls = [];
  let startTime = null;

  // Listen to all requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/')) {
      const elapsed = startTime ? Date.now() - startTime : 0;
      apiCalls.push({
        time: elapsed,
        url: url.replace(BASE_URL, ''),
        method: request.method()
      });
    }
  });

  try {
    // Step 1: Go to login page
    console.log('📄 Going to login page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Step 2: Fill login form
    console.log('🔑 Logging in as', TEST_EMAIL);
    await page.fill('input[name="email"], input[type="email"]', TEST_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', TEST_PASSWORD);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('**/dashboard**', { timeout: 30000 }).catch(() => {
      console.log('⚠️ Did not redirect to dashboard, checking current URL...');
    });
    
    console.log('📍 Current URL:', page.url());

    // Step 3: Navigate to dashboard if not already there
    if (!page.url().includes('/dashboard')) {
      console.log('📄 Navigating to dashboard...');
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    }

    // Step 4: Start monitoring
    startTime = Date.now();
    console.log('\n⏱️ Monitoring API calls for 30 seconds...\n');

    // Wait and monitor
    await page.waitForTimeout(30000);

    // Step 5: Report results
    console.log('\n' + '='.repeat(60));
    console.log('📊 API CALL SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\nTotal API calls in 30 seconds: ${apiCalls.length}`);
    
    // Group by endpoint
    const byEndpoint = {};
    apiCalls.forEach(call => {
      const endpoint = call.url.split('?')[0];
      byEndpoint[endpoint] = (byEndpoint[endpoint] || 0) + 1;
    });

    console.log('\nCalls per endpoint:');
    Object.entries(byEndpoint)
      .sort((a, b) => b[1] - a[1])
      .forEach(([endpoint, count]) => {
        const status = count > 5 ? '❌ POLLING!' : '✅ OK';
        console.log(`  ${status} ${endpoint}: ${count} calls`);
      });

    // Show timeline of first 20 calls
    if (apiCalls.length > 0) {
      console.log('\nFirst 20 API calls (time in ms):');
      apiCalls.slice(0, 20).forEach((call, i) => {
        console.log(`  ${i + 1}. [${call.time}ms] ${call.method} ${call.url.split('?')[0]}`);
      });
    }

    // Final verdict
    console.log('\n' + '='.repeat(60));
    if (apiCalls.length > 20) {
      console.log('❌ FAIL: Too many API calls detected! Dashboard is polling.');
    } else if (apiCalls.length > 10) {
      console.log('⚠️ WARNING: More API calls than expected.');
    } else {
      console.log('✅ PASS: API calls look normal.');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Test completed');
  }
}

main().catch(console.error);
