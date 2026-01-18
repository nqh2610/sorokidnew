/**
 * 🧪 Test API với authentication
 * Mục đích: Kiểm tra xem dashboard có gọi API liên tục không
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test credentials
const TEST_EMAIL = 'demo@sorokids.com';
const TEST_PASSWORD = '123456';

async function fetchWithCookies(url, cookies = '') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: cookies ? { 'Cookie': cookies } : {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function postJson(url, body, cookies = '') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const bodyStr = JSON.stringify(body);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        ...(cookies ? { 'Cookie': cookies } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });

    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

async function getCsrfToken() {
  const res = await fetchWithCookies(`${BASE_URL}/api/auth/csrf`);
  const json = JSON.parse(res.data);
  const cookies = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
  return { csrfToken: json.csrfToken, cookies };
}

async function login() {
  console.log('🔐 Getting CSRF token...');
  const { csrfToken, cookies } = await getCsrfToken();
  console.log('✅ CSRF token:', csrfToken?.substring(0, 20) + '...');
  console.log('🍪 Cookies:', cookies);

  console.log('🔑 Logging in as', TEST_EMAIL);
  const loginRes = await postJson(`${BASE_URL}/api/auth/callback/credentials`, {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    csrfToken,
    callbackUrl: `${BASE_URL}/dashboard`,
    json: true
  }, cookies);

  console.log('📝 Login response:', loginRes.status);
  
  // Get new cookies from login
  const allCookies = loginRes.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || cookies;
  return allCookies;
}

async function testDashboardAPIs(cookies) {
  console.log('\n🧪 Testing Dashboard APIs with session...\n');

  const apis = [
    '/api/dashboard/essential',
    '/api/dashboard/quests',
    '/api/dashboard/achievements',
    '/api/dashboard/certificates'
  ];

  for (const api of apis) {
    const start = Date.now();
    const res = await fetchWithCookies(`${BASE_URL}${api}`, cookies);
    const duration = Date.now() - start;
    
    const status = res.status;
    const icon = status === 200 ? '✅' : '❌';
    console.log(`${icon} ${api} - ${status} (${duration}ms)`);
    
    if (status === 200) {
      try {
        const json = JSON.parse(res.data);
        console.log(`   └─ success: ${json.success}`);
      } catch (e) {
        console.log(`   └─ Response: ${res.data.substring(0, 100)}...`);
      }
    } else {
      console.log(`   └─ Response: ${res.data.substring(0, 200)}`);
    }
  }
}

async function main() {
  try {
    // First test without auth
    console.log('🔒 Testing without authentication...\n');
    await testDashboardAPIs('');

    // Then try to login
    console.log('\n' + '='.repeat(50));
    const cookies = await login();
    
    if (cookies) {
      console.log('\n🍪 Session cookies:', cookies.substring(0, 100) + '...');
      await testDashboardAPIs(cookies);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
