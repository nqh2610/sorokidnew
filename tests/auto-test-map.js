/**
 * 🧪 AUTO TEST: Adventure Map Navigation
 * Sử dụng Puppeteer để test tự động
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@sorokid.com';
const TEST_PASSWORD = 'Test123!';

// Colors
const c = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  pass: (msg) => console.log(`${c.green}✅ PASS: ${msg}${c.reset}`),
  fail: (msg) => console.log(`${c.red}❌ FAIL: ${msg}${c.reset}`),
  info: (msg) => console.log(`${c.cyan}ℹ️  ${msg}${c.reset}`),
  warn: (msg) => console.log(`${c.yellow}⚠️  ${msg}${c.reset}`),
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('\n🧪 ADVENTURE MAP AUTO TEST\n');
  console.log('='.repeat(50));
  
  const results = { passed: 0, failed: 0, tests: [] };
  let browser;
  
  try {
    log.info('Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Hiện browser để xem
      defaultViewport: { width: 1280, height: 800 },
      args: ['--no-sandbox']
    });
    
    const page = await browser.newPage();
    
    // ========== LOGIN ==========
    log.info('Logging in...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await delay(1000);
    
    // Điền form login
    await page.type('input[type="email"], input[name="email"]', TEST_EMAIL);
    await page.type('input[type="password"], input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Chờ redirect
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await delay(2000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard') || currentUrl.includes('/adventure')) {
      log.pass('Login thành công');
      results.passed++;
    } else {
      log.fail(`Login failed - URL: ${currentUrl}`);
      results.failed++;
      // Thử tiếp dù login fail
    }
    
    // ========== GO TO ADVENTURE ==========
    log.info('Navigating to Adventure Map...');
    await page.goto(`${BASE_URL}/adventure`, { waitUntil: 'networkidle2' });
    await delay(3000);
    
    // ========== TEST 1: Flash Anzan Practice ==========
    log.info('\n--- TEST 1: Flash Anzan Luyện Tập ---');
    
    // Tìm và click boss Flash Anzan (Tia Chớp)
    const flashPracticeButton = await page.$('button:has-text("Tia Chớp"), button:has-text("Flash"), button:has-text("⚡")');
    
    if (flashPracticeButton) {
      await flashPracticeButton.click();
      await delay(1500);
      
      // Click nút bắt đầu trong modal nếu có
      const startBtn = await page.$('button:has-text("Bắt đầu"), button:has-text("Vào"), button:has-text("Chiến")');
      if (startBtn) {
        await startBtn.click();
        await delay(2000);
      }
      
      // Chờ navigate đến practice
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      await delay(3000);
      
      const practiceUrl = page.url();
      const pageContent = await page.content();
      
      if (practiceUrl.includes('/practice')) {
        // Kiểm tra xem có auto-start không
        const hasSelectScreen = pageContent.includes('CHỌN CHẾ ĐỘ') || 
                                pageContent.includes('CHỌN SỐ CHỮ SỐ') ||
                                pageContent.includes('CHỌN CẤP ĐỘ');
        const hasCountdown = pageContent.includes('TẬP TRUNG') || 
                             pageContent.match(/<[^>]*>\s*[123]\s*<\/[^>]*>/);
        
        if (!hasSelectScreen && hasCountdown) {
          log.pass('Flash Anzan Practice: Auto-start thành công!');
          results.passed++;
        } else if (hasSelectScreen) {
          log.fail('Flash Anzan Practice: Bị stuck ở màn chọn mode');
          results.failed++;
        } else {
          log.warn('Flash Anzan Practice: Không xác định được trạng thái');
          results.failed++;
        }
      } else {
        log.fail(`Flash Anzan Practice: Không navigate đến /practice - URL: ${practiceUrl}`);
        results.failed++;
      }
    } else {
      log.warn('Không tìm thấy boss Flash Anzan trên map - skip test');
    }
    
    // ========== Back to Adventure ==========
    await page.goto(`${BASE_URL}/adventure`, { waitUntil: 'networkidle2' });
    await delay(2000);
    
    // ========== TEST 2: Mental Math Practice ==========
    log.info('\n--- TEST 2: Mental Math (Siêu Trí Tuệ) Luyện Tập ---');
    
    const mentalPracticeButton = await page.$('button:has-text("Siêu Trí Tuệ"), button:has-text("Mental"), button:has-text("🧠")');
    
    if (mentalPracticeButton) {
      await mentalPracticeButton.click();
      await delay(1500);
      
      const startBtn = await page.$('button:has-text("Bắt đầu"), button:has-text("Vào"), button:has-text("Chiến")');
      if (startBtn) {
        await startBtn.click();
        await delay(2000);
      }
      
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      await delay(3000);
      
      const practiceUrl = page.url();
      const pageContent = await page.content();
      
      if (practiceUrl.includes('/practice')) {
        const hasSelectScreen = pageContent.includes('CHỌN CHẾ ĐỘ') || 
                                pageContent.includes('CHỌN CHẾ ĐỘ TÍNH');
        const hasGame = pageContent.includes('input') && 
                        (pageContent.includes('câu') || pageContent.includes('Đáp án'));
        
        if (!hasSelectScreen && hasGame) {
          log.pass('Mental Math Practice: Auto-start thành công!');
          results.passed++;
        } else if (hasSelectScreen) {
          log.fail('Mental Math Practice: Bị stuck ở màn chọn mode');
          results.failed++;
        } else {
          log.warn('Mental Math Practice: Không xác định được trạng thái');
          results.failed++;
        }
      } else {
        log.fail(`Mental Math Practice: Không navigate đến /practice - URL: ${practiceUrl}`);
        results.failed++;
      }
    } else {
      log.warn('Không tìm thấy boss Mental Math trên map - skip test');
    }
    
    // ========== Back to Adventure ==========
    await page.goto(`${BASE_URL}/adventure`, { waitUntil: 'networkidle2' });
    await delay(2000);
    
    // ========== TEST 3: Flash Anzan Compete ==========
    log.info('\n--- TEST 3: Flash Anzan Thi Đấu ---');
    
    const flashCompeteButton = await page.$('button:has-text("Đấu Trường Tia Chớp"), button:has-text("🏆.*⚡")');
    
    if (flashCompeteButton) {
      await flashCompeteButton.click();
      await delay(1500);
      
      const startBtn = await page.$('button:has-text("Bắt đầu"), button:has-text("Vào"), button:has-text("Thi đấu")');
      if (startBtn) {
        await startBtn.click();
        await delay(2000);
      }
      
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      await delay(3000);
      
      const competeUrl = page.url();
      const pageContent = await page.content();
      
      if (competeUrl.includes('/compete')) {
        const hasSelectScreen = pageContent.includes('CHỌN CHẾ ĐỘ') || 
                                pageContent.includes('CHỌN SỐ CHỮ SỐ') ||
                                pageContent.includes('CHỌN TỐC ĐỘ');
        const hasCountdown = pageContent.includes('TẬP TRUNG');
        
        if (!hasSelectScreen && hasCountdown) {
          log.pass('Flash Anzan Compete: Auto-start thành công!');
          results.passed++;
        } else if (hasSelectScreen) {
          log.fail('Flash Anzan Compete: Bị stuck ở màn chọn mode');
          results.failed++;
        } else {
          log.warn('Flash Anzan Compete: Không xác định được trạng thái');
          results.failed++;
        }
      } else {
        log.fail(`Flash Anzan Compete: Không navigate đến /compete - URL: ${competeUrl}`);
        results.failed++;
      }
    } else {
      log.warn('Không tìm thấy Đấu Trường Tia Chớp trên map - skip test');
    }
    
    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(50));
    console.log(`📊 KẾT QUẢ: ${results.passed} PASSED, ${results.failed} FAILED`);
    console.log('='.repeat(50));
    
    if (results.failed === 0) {
      log.pass('TẤT CẢ TESTS ĐỀU PASSED! 🎉');
    } else {
      log.fail(`Có ${results.failed} tests failed. Cần kiểm tra lại.`);
    }
    
    // Giữ browser mở 5s để xem
    await delay(5000);
    
  } catch (error) {
    log.fail(`Test error: ${error.message}`);
    console.error(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  return results;
}

// Run
runTests().then(() => {
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
