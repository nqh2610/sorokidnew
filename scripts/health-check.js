/**
 * 🏥 SOROKID HEALTH CHECK SCRIPT
 * 
 * Auto test để đảm bảo hệ thống chạy đúng
 * 
 * Chạy: node scripts/health-check.js
 * Hoặc: npm run health-check
 */

const http = require('http');
const https = require('https');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Config
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds
const SKIP_SERVER = process.argv.includes('--skip-server');

// Colors
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

// Helper: Make HTTP request
function httpGet(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const startTime = Date.now();
    
    const req = client.get(url, { timeout: TIMEOUT, ...options }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          time: Date.now() - startTime,
        });
      });
    });
    
    req.on('error', (e) => reject(new Error(e.message || 'Connection failed')));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Helper: Log test result
function logTest(name, passed, message, warning = false) {
  const status = passed ? `${c.green}✓ PASS${c.reset}` : 
                 warning ? `${c.yellow}⚠ WARN${c.reset}` : 
                 `${c.red}✗ FAIL${c.reset}`;
  
  console.log(`  ${status} ${name}`);
  if (message) {
    console.log(`       ${c.cyan}${message}${c.reset}`);
  }
  
  if (passed) results.passed++;
  else if (warning) results.warnings++;
  else results.failed++;
  
  results.tests.push({ name, passed, warning, message });
}

// ============ TEST FUNCTIONS ============

async function testServerRunning() {
  console.log(`\n${c.bold}1. Server Status${c.reset}`);
  
  try {
    const res = await httpGet(BASE_URL);
    logTest('Server is running', true, `Response: ${res.status} in ${res.time}ms`);
    return true;
  } catch (e) {
    logTest('Server is running', false, `Error: ${e.message}`);
    console.log(`\n${c.red}⚠️  Server not running! Start with: npm run dev${c.reset}\n`);
    return false;
  }
}

async function testStaticFiles() {
  console.log(`\n${c.bold}2. Static Files (NO 404)${c.reset}`);
  
  const staticPaths = [
    '/favicon.ico',
    '/manifest.json',
    '/robots.txt',
  ];
  
  for (const path of staticPaths) {
    try {
      const res = await httpGet(`${BASE_URL}${path}`);
      const passed = res.status === 200;
      logTest(`GET ${path}`, passed, `Status: ${res.status} in ${res.time}ms`);
    } catch (e) {
      logTest(`GET ${path}`, false, e.message);
    }
  }
}

async function testPageRoutes() {
  console.log(`\n${c.bold}3. Page Routes${c.reset}`);
  
  const routes = [
    { path: '/', name: 'Home' },
    { path: '/login', name: 'Login' },
    { path: '/register', name: 'Register' },
    { path: '/pricing', name: 'Pricing' },
    { path: '/en', name: 'Home (EN)' },
  ];
  
  for (const route of routes) {
    try {
      const res = await httpGet(`${BASE_URL}${route.path}`);
      const passed = res.status === 200;
      const slow = res.time > 3000;
      
      if (passed && slow) {
        logTest(`${route.name} (${route.path})`, true, `⚠️ SLOW: ${res.time}ms`, true);
      } else {
        logTest(`${route.name} (${route.path})`, passed, `Status: ${res.status} in ${res.time}ms`);
      }
    } catch (e) {
      logTest(`${route.name} (${route.path})`, false, e.message);
    }
  }
}

async function testProtectedRoutes() {
  console.log(`\n${c.bold}4. Protected Routes (should redirect)${c.reset}`);
  
  const protectedRoutes = [
    '/dashboard',
    '/learn',
    '/practice',
    '/adventure',
  ];
  
  for (const path of protectedRoutes) {
    try {
      const res = await httpGet(`${BASE_URL}${path}`);
      // Should redirect to login (302/307) or show login page
      const passed = res.status === 200 || res.status === 302 || res.status === 307;
      logTest(`GET ${path}`, passed, `Status: ${res.status} in ${res.time}ms`);
    } catch (e) {
      logTest(`GET ${path}`, false, e.message);
    }
  }
}

async function testAPIEndpoints() {
  console.log(`\n${c.bold}5. API Endpoints${c.reset}`);
  
  const apis = [
    { path: '/api/auth/providers', expectedStatus: 200 },
    { path: '/api/dashboard/essential', expectedStatus: 401 }, // Unauthorized without session
    { path: '/api/dashboard/quests', expectedStatus: 401 },
  ];
  
  for (const api of apis) {
    try {
      const res = await httpGet(`${BASE_URL}${api.path}`);
      const passed = res.status === api.expectedStatus;
      logTest(`API ${api.path}`, passed, `Expected: ${api.expectedStatus}, Got: ${res.status} in ${res.time}ms`);
    } catch (e) {
      logTest(`API ${api.path}`, false, e.message);
    }
  }
}

async function testI18nSystem() {
  console.log(`\n${c.bold}6. i18n System${c.reset}`);
  
  // Check dictionary files exist
  const dictPath = path.join(__dirname, '../lib/i18n/dictionaries');
  
  const files = ['vi.json', 'en.json'];
  for (const file of files) {
    const exists = fs.existsSync(path.join(dictPath, file));
    logTest(`Dictionary ${file} exists`, exists);
  }
  
  // Check split dictionaries
  const splitDirs = ['vi', 'en'];
  for (const dir of splitDirs) {
    const dirPath = path.join(dictPath, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
      logTest(`Split dictionaries (${dir})`, files.length > 0, `${files.length} namespace files`);
    }
  }
}

function testFileSystem() {
  console.log(`\n${c.bold}7. Critical Files${c.reset}`);
  
  const criticalFiles = [
    'middleware.js',
    'next.config.js',
    'app/layout.jsx',
    'lib/prisma.js',
    'lib/auth.js',
    'lib/authOptions.js',
    'lib/i18n/dictionary.js',
    'lib/i18n/I18nContext.jsx',
  ];
  
  for (const file of criticalFiles) {
    const filePath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(filePath);
    logTest(file, exists, exists ? 'Found' : 'MISSING!');
  }
}

function testNoDeadCode() {
  console.log(`\n${c.bold}8. No Dead Code (previously created)${c.reset}`);
  
  const deadCodeFiles = [
    'lib/i18n/dictionaryOptimized.js',
    'lib/sessionCache.js',
    'lib/hooks/useCachedFetch.js',
    'lib/hooks/usePrefetch.js',
    'app/api/dashboard/unified/route.js',
  ];
  
  for (const file of deadCodeFiles) {
    const filePath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(filePath);
    logTest(`No dead code: ${file}`, !exists, exists ? '⚠️ Should be deleted!' : 'Clean');
  }
}

async function testDatabaseConnection() {
  console.log(`\n${c.bold}9. Database Connection${c.reset}`);
  
  try {
    // Try to require prisma and test connection
    const prismaPath = path.join(__dirname, '../lib/prisma.js');
    
    if (fs.existsSync(prismaPath)) {
      logTest('Prisma client file exists', true);
      
      // Check .env.local has DATABASE_URL (not commented)
      const envPath = path.join(__dirname, '../.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        
        // Find uncommented DATABASE_URL
        const hasDbUrl = lines.some(line => {
          const trimmed = line.trim();
          return trimmed.startsWith('DATABASE_URL') && !trimmed.startsWith('#');
        });
        
        logTest('DATABASE_URL configured', hasDbUrl, 
                hasDbUrl ? 'Found in .env.local' : 'Missing or all commented out');
      } else {
        logTest('DATABASE_URL configured', false, '.env.local file not found');
      }
    }
  } catch (e) {
    logTest('Database check', false, e.message);
  }
}

function testMiddlewareConfig() {
  console.log(`\n${c.bold}10. Middleware Configuration${c.reset}`);
  
  const middlewarePath = path.join(__dirname, '../middleware.js');
  
  if (fs.existsSync(middlewarePath)) {
    const content = fs.readFileSync(middlewarePath, 'utf8');
    
    // Check matcher excludes _next properly
    const hasCorrectMatcher = content.includes("'/((?!api|_next|");
    logTest('Middleware excludes _next/*', hasCorrectMatcher, 
            hasCorrectMatcher ? 'Correct pattern' : 'May match static files!');
    
    // Check no x-pathname (was removed)
    const hasXPathname = content.includes("x-pathname");
    logTest('No unused x-pathname header', !hasXPathname,
            hasXPathname ? '⚠️ Should be removed' : 'Clean');
    
    // Check no console.log debug
    const hasDebugLog = content.includes('[MW DEBUG]');
    logTest('No debug console.log', !hasDebugLog,
            hasDebugLog ? '⚠️ Remove for production' : 'Clean');
  }
}

// ============ MAIN ============

async function main() {
  console.log(`${c.bold}${c.blue}`);
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     🏥 SOROKID HEALTH CHECK              ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`${c.reset}`);
  console.log(`Testing: ${BASE_URL}`);
  console.log(`Time: ${new Date().toLocaleString()}`);
  
  // Run tests
  let serverOk = false;
  
  if (SKIP_SERVER) {
    console.log(`\n${c.yellow}⏭️  Skipping server tests (--skip-server)${c.reset}`);
    serverOk = false;
  } else {
    serverOk = await testServerRunning();
  }
  
  if (serverOk) {
    await testStaticFiles();
    await testPageRoutes();
    await testProtectedRoutes();
    await testAPIEndpoints();
  }
  
  testFileSystem();
  await testI18nSystem();
  testNoDeadCode();
  await testDatabaseConnection();
  testMiddlewareConfig();
  
  // Summary
  console.log(`\n${c.bold}${'═'.repeat(50)}${c.reset}`);
  console.log(`${c.bold}📊 SUMMARY${c.reset}\n`);
  
  console.log(`  ${c.green}✓ Passed:${c.reset}   ${results.passed}`);
  console.log(`  ${c.yellow}⚠ Warnings:${c.reset} ${results.warnings}`);
  console.log(`  ${c.red}✗ Failed:${c.reset}   ${results.failed}`);
  console.log(`  Total:     ${results.passed + results.warnings + results.failed}`);
  
  if (results.failed === 0 && results.warnings === 0) {
    console.log(`\n${c.green}${c.bold}✅ ALL TESTS PASSED!${c.reset}`);
  } else if (results.failed === 0) {
    console.log(`\n${c.yellow}${c.bold}⚠️ PASSED WITH WARNINGS${c.reset}`);
  } else {
    console.log(`\n${c.red}${c.bold}❌ SOME TESTS FAILED${c.reset}`);
    console.log(`\nFailed tests:`);
    results.tests.filter(t => !t.passed && !t.warning).forEach(t => {
      console.log(`  - ${t.name}: ${t.message}`);
    });
  }
  
  console.log('\n');
  
  // Exit code
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch(console.error);
