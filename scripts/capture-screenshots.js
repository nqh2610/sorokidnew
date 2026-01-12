/**
 * 📸 SCRIPT CHỤP SCREENSHOTS CHO APP STORE
 * 
 * Chạy: node scripts/capture-screenshots.js
 * 
 * Cần:
 * - npm install playwright
 * - Server đang chạy ở localhost:3000
 * 
 * ⚠️ SỬA THÔNG TIN ĐĂNG NHẬP BÊN DƯỚI TRƯỚC KHI CHẠY
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../public/screenshots');
const AUTH_FILE = path.join(__dirname, '../.auth-state.json');

// ⚠️ THÔNG TIN ĐĂNG NHẬP
const LOGIN_EMAIL = 'alice@sorokids.com';
const LOGIN_PASSWORD = '123456';

// Các màn hình cần chụp - CHỈ CÁC URL CHẮC CHẮN TỒN TẠI
const SCREENS = [
  // === TRANG CÔNG KHAI (không cần đăng nhập) ===
  {
    name: '01-home',
    url: '/',
    title: 'Trang chủ Sorokid',
    wait: 2000,
    requireAuth: false,
    action: null
  },
  
  // === TRANG CẦN ĐĂNG NHẬP ===
  {
    name: '02-dashboard',
    url: '/dashboard',
    title: 'Dashboard học tập',
    wait: 2000,
    requireAuth: true,
    action: null
  },
  {
    name: '03-learn',
    url: '/learn',
    title: 'Danh sách bài học',
    wait: 2000,
    requireAuth: true,
    action: null
  },
  {
    name: '04-practice',
    url: '/practice',
    title: 'Menu luyện tập',
    wait: 2000,
    requireAuth: true,
    action: null
  },
  {
    name: '05-practice-auto',
    url: '/practice/auto',
    title: 'Luyện tập tự động',
    wait: 3000,
    requireAuth: true,
    action: async (page) => {
      const startBtn = page.locator('button:has-text("Bắt đầu"), button:has-text("Start"), button:has-text("Chơi")');
      if (await startBtn.count() > 0) {
        await startBtn.first().click();
        await page.waitForTimeout(2000);
      }
    }
  },
  {
    name: '06-compete',
    url: '/compete',
    title: 'Thi đấu',
    wait: 2000,
    requireAuth: true,
    action: null
  },
  {
    name: '07-compete-auto',
    url: '/compete/auto',
    title: 'Thi đấu tự động',
    wait: 3000,
    requireAuth: true,
    action: async (page) => {
      const startBtn = page.locator('button:has-text("Bắt đầu"), button:has-text("Start"), button:has-text("Chơi")');
      if (await startBtn.count() > 0) {
        await startBtn.first().click();
        await page.waitForTimeout(2000);
      }
    }
  },
  {
    name: '08-adventure',
    url: '/adventure',
    title: 'Đi tìm kho báu',
    wait: 3000,
    requireAuth: true,
    action: null
  },
  {
    name: '09-leaderboard',
    url: '/leaderboard',
    title: 'Bảng xếp hạng',
    wait: 2000,
    requireAuth: true,
    action: null
  },
  
  // === TOOLBOX (không cần đăng nhập) ===
  {
    name: '10-toolbox',
    url: '/tool',
    title: 'Toolbox - Tất cả công cụ',
    wait: 2000,
    requireAuth: false,
    action: null
  },
  {
    name: '11-tool-soroban',
    url: '/tool/ban-tinh-soroban',
    title: 'Bàn tính Soroban',
    wait: 2000,
    requireAuth: false,
    action: null
  },
  {
    name: '12-tool-flashzan',
    url: '/tool/flash-zan',
    title: 'Flash Anzan',
    wait: 2000,
    requireAuth: false,
    action: async (page) => {
      const startBtn = page.locator('button:has-text("Bắt đầu"), button:has-text("Start"), button:has-text("Chơi"), button:has-text("▶")');
      if (await startBtn.count() > 0) {
        await startBtn.first().click();
        await page.waitForTimeout(1500);
      }
    }
  },
  {
    name: '13-tool-stopwatch',
    url: '/tool/dong-ho-bam-gio',
    title: 'Đồng hồ bấm giờ',
    wait: 2000,
    requireAuth: false,
    action: null
  },
  {
    name: '14-tool-wheel',
    url: '/tool/chiec-non-ky-dieu',
    title: 'Chiếc nón kỳ diệu',
    wait: 2000,
    requireAuth: false,
    action: null
  },
  {
    name: '15-tool-dice',
    url: '/tool/xuc-xac',
    title: 'Xúc xắc',
    wait: 2000,
    requireAuth: false,
    action: null
  }
];

// Kích thước màn hình cần chụp - THÊM LAPTOP
const DEVICES = [
  // Mobile
  {
    name: 'iphone',
    width: 1284,
    height: 2778,
    scale: 3,
    folder: 'iphone-6.7',
    isMobile: true
  },
  {
    name: 'iphone-small',
    width: 1170,
    height: 2532,
    scale: 3,
    folder: 'iphone-6.1',
    isMobile: true
  },
  // Tablet
  {
    name: 'ipad',
    width: 2048,
    height: 2732,
    scale: 2,
    folder: 'ipad-12.9',
    isMobile: true
  },
  // Android
  {
    name: 'android-phone',
    width: 1080,
    height: 1920,
    scale: 1,
    folder: 'android-phone',
    isMobile: true
  },
  // LAPTOP / DESKTOP
  {
    name: 'laptop',
    width: 1440,
    height: 900,
    scale: 1,
    folder: 'laptop',
    isMobile: false
  },
  {
    name: 'desktop',
    width: 1920,
    height: 1080,
    scale: 1,
    folder: 'desktop',
    isMobile: false
  }
];

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Đăng nhập vào tài khoản
async function login(context) {
  console.log('🔐 Đang đăng nhập...');
  
  const page = await context.newPage();
  
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Điền form đăng nhập - tìm input đầu tiên và thứ hai
    const inputs = await page.locator('input').all();
    console.log(`  Tìm thấy ${inputs.length} input fields`);
    
    if (inputs.length >= 2) {
      await inputs[0].fill(LOGIN_EMAIL); // Email/Username
      await inputs[1].fill(LOGIN_PASSWORD); // Password
      console.log(`  Đã điền: ${LOGIN_EMAIL}`);
    }
    
    await page.waitForTimeout(500);
    
    // Click nút đăng nhập - nút submit có emoji 🚀
    const loginBtn = page.locator('button[type="submit"]');
    await loginBtn.click();
    console.log('  Đã click nút Đăng nhập');
    
    // Đợi chuyển trang - đợi lâu hơn
    await page.waitForTimeout(5000);
    
    // Kiểm tra có thông báo lỗi không
    const errorMsg = await page.locator('.text-red-500, .text-red-600, [role="alert"]').textContent().catch(() => null);
    if (errorMsg) {
      console.log(`  ⚠️ Lỗi: ${errorMsg}`);
    }
    
    // Kiểm tra URL
    const url = page.url();
    console.log(`  URL hiện tại: ${url}`);
    
    if (url.includes('dashboard') || !url.includes('login')) {
      // Lưu storage state để dùng lại
      await context.storageState({ path: AUTH_FILE });
      console.log('✅ Đăng nhập thành công! Đã lưu session.\n');
      await page.close();
      return true;
    } else {
      console.log('⚠️ Vẫn ở trang login - kiểm tra lại tài khoản\n');
      await page.close();
      return false;
    }
  } catch (err) {
    console.log(`❌ Lỗi đăng nhập: ${err.message}`);
    await page.close();
    return false;
  }
}

async function captureScreenshots() {
  console.log('📸 SOROKID SCREENSHOT CAPTURE\n');
  console.log('='.repeat(50));
  console.log(`📱 Sẽ chụp ${SCREENS.length} màn hình x ${DEVICES.length} thiết bị\n`);
  
  const browser = await chromium.launch({ headless: false }); // Mở browser để xem
  
  // Kiểm tra có session cũ không
  let context;
  if (fs.existsSync(AUTH_FILE)) {
    console.log('📂 Đang tải session đã lưu...\n');
    context = await browser.newContext({
      storageState: AUTH_FILE,
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });
    
    // Kiểm tra session còn hợp lệ không
    const testPage = await context.newPage();
    await testPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
    const url = testPage.url();
    await testPage.close();
    
    if (url.includes('login')) {
      console.log('⚠️ Session hết hạn, đăng nhập lại...\n');
      await context.close();
      context = null;
    } else {
      console.log('✅ Session còn hợp lệ!\n');
    }
  }
  
  // Nếu chưa có session, tạo mới và đăng nhập
  if (!context) {
    context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });
    
    const loggedIn = await login(context);
    if (!loggedIn) {
      console.log('❌ Không thể đăng nhập. Dừng script.\n');
      await browser.close();
      return;
    }
  }
  
  // Chụp cho từng device
  for (const device of DEVICES) {
    console.log(`\n📱 ${device.name.toUpperCase()} (${device.width}x${device.height})...`);
    console.log('─'.repeat(40));
    
    const deviceDir = path.join(OUTPUT_DIR, device.folder);
    await ensureDir(deviceDir);
    
    // Tạo context mới cho mỗi device để có đúng viewport
    const deviceContext = await browser.newContext({
      storageState: AUTH_FILE,
      viewport: { 
        width: Math.floor(device.width / device.scale), 
        height: Math.floor(device.height / device.scale) 
      },
      deviceScaleFactor: device.scale,
      isMobile: device.isMobile,
      hasTouch: device.isMobile
    });
    
    const page = await deviceContext.newPage();
    
    // Chụp từng màn hình
    for (const screen of SCREENS) {
      try {
        console.log(`  📷 ${screen.title}...`);
        
        // Chuyển đến trang
        const response = await page.goto(`${BASE_URL}${screen.url}`, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        }).catch(() => null);
        
        // Kiểm tra status 404
        if (response && response.status() === 404) {
          console.log(`    ⚠️ 404 Not Found - bỏ qua`);
          continue;
        }
        
        // Kiểm tra có bị redirect về login không
        const currentUrl = page.url();
        if (currentUrl.includes('login') && screen.requireAuth) {
          console.log(`    ⚠️ Cần đăng nhập - session hết hạn`);
          continue;
        }
        
        // Kiểm tra có phải trang 404 không (dựa vào content)
        const pageTitle = await page.title();
        const content = await page.content();
        if (pageTitle.includes('404') || content.includes('404') || content.includes('Not Found')) {
          console.log(`    ⚠️ Trang không tồn tại - bỏ qua`);
          continue;
        }
        
        // Đợi thêm để animations hoàn thành
        await page.waitForTimeout(screen.wait);
        
        // Thực hiện action nếu có (click bắt đầu, etc.)
        if (screen.action) {
          try {
            await screen.action(page);
          } catch (e) {
            console.log(`    ⚠️ Action lỗi: ${e.message.slice(0, 30)}`);
          }
        }
        
        // Ẩn các popup/banner không cần thiết
        await page.evaluate(() => {
          // Ẩn các toast, popup, PWA banner
          const hideSelectors = [
            '[role="dialog"]',
            '.toast',
            '.Toastify',
            '[data-testid="toast"]'
          ];
          hideSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.style.display = 'none');
          });
        });
        
        const filename = `${screen.name}.png`;
        await page.screenshot({
          path: path.join(deviceDir, filename),
          fullPage: false
        });
        
        console.log(`    ✅ ${filename}`);
      } catch (err) {
        console.log(`    ❌ ${err.message.slice(0, 50)}`);
      }
    }
    
    await deviceContext.close();
  }
  
  await context.close();
  await browser.close();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Screenshots captured successfully!\n');
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log('\nFolders:');
  DEVICES.forEach(d => console.log(`  - ${d.folder}/`));
}

// Main
captureScreenshots().catch(console.error);
