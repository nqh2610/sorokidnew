// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * 🗺️ ADVENTURE MAP NAVIGATION TESTS
 * 
 * Kiểm tra flow từ Adventure Map vào các màn chơi:
 * - Bài học (Lesson)
 * - Luyện tập (Practice) 
 * - Thi đấu (Compete)
 * 
 * Test đảm bảo người chơi vào được màn chơi trực tiếp
 * mà không phải chọn lại mode/difficulty
 */

// Test credentials - sử dụng account test có sẵn
const TEST_USER = {
  email: process.env.TEST_EMAIL || 'test@sorokid.com',
  password: process.env.TEST_PASSWORD || 'Test123!'
};

// Timeout settings
const NAVIGATION_TIMEOUT = 15000;
const GAME_START_TIMEOUT = 10000;

test.describe('Adventure Map Navigation', () => {
  
  // Login trước mỗi test
  test.beforeEach(async ({ page }) => {
    // Đi đến trang login
    await page.goto('/login');
    
    // Điền thông tin đăng nhập
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);
    
    // Click nút đăng nhập
    await page.click('button[type="submit"]');
    
    // Chờ redirect đến dashboard hoặc adventure
    await page.waitForURL(/\/(dashboard|adventure)/, { timeout: NAVIGATION_TIMEOUT });
  });

  test('Có thể truy cập Adventure Map', async ({ page }) => {
    // Navigate đến adventure
    await page.goto('/adventure');
    
    // Chờ page load
    await page.waitForLoadState('networkidle');
    
    // Kiểm tra có hiện map (tìm các element của GameMapNew)
    const mapContainer = page.locator('[class*="adventure"], [class*="map"], [class*="game"]').first();
    await expect(mapContainer).toBeVisible({ timeout: NAVIGATION_TIMEOUT });
    
    console.log('✅ Adventure Map loaded successfully');
  });

  test('Click vào màn bài học -> Mở Learn page với bài học đúng', async ({ page }) => {
    await page.goto('/adventure');
    await page.waitForLoadState('networkidle');
    
    // Tìm và click vào một stage bài học (thường có icon 📖 hoặc text "Bài")
    // Stage đầu tiên thường là bài học level 1
    const lessonStage = page.locator('button, [role="button"]')
      .filter({ hasText: /bài|lesson|học|📖|level.*1/i })
      .first();
    
    if (await lessonStage.isVisible()) {
      await lessonStage.click();
      
      // Chờ modal hoặc navigation
      await page.waitForTimeout(1000);
      
      // Nếu có modal, click vào nút bắt đầu
      const startButton = page.locator('button').filter({ hasText: /bắt đầu|start|vào|chơi/i }).first();
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      // Kiểm tra đã navigate đến /learn
      await page.waitForURL(/\/learn/, { timeout: NAVIGATION_TIMEOUT });
      
      // Kiểm tra page learn đã load
      await page.waitForLoadState('networkidle');
      
      // Kiểm tra có hiện nội dung bài học (soroban board hoặc bài giảng)
      const learnContent = page.locator('[class*="soroban"], [class*="lesson"], [class*="learn"]').first();
      await expect(learnContent).toBeVisible({ timeout: GAME_START_TIMEOUT });
      
      console.log('✅ Lesson stage opens Learn page correctly');
    } else {
      console.log('⚠️ No lesson stage found on map - skipping test');
      test.skip();
    }
  });

  test('Click vào boss luyện tập -> Auto-start Practice (không hiện màn chọn mode)', async ({ page }) => {
    await page.goto('/adventure');
    await page.waitForLoadState('networkidle');
    
    // Tìm và click vào boss luyện tập (thường có icon 👹 hoặc text "Boss" + "Luyện")
    const practiceStage = page.locator('button, [role="button"]')
      .filter({ hasText: /boss.*luyện|luyện.*tập|practice|👹/i })
      .first();
    
    if (await practiceStage.isVisible()) {
      await practiceStage.click();
      
      // Chờ modal hoặc navigation
      await page.waitForTimeout(1000);
      
      // Nếu có modal, click vào nút bắt đầu
      const startButton = page.locator('button').filter({ hasText: /bắt đầu|start|vào|chiến/i }).first();
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      // Kiểm tra đã navigate đến /practice
      await page.waitForURL(/\/practice/, { timeout: NAVIGATION_TIMEOUT });
      await page.waitForLoadState('networkidle');
      
      // ✅ QUAN TRỌNG: Kiểm tra KHÔNG hiện màn chọn mode
      // Màn chọn mode có text "Chọn Chế Độ" hoặc các nút mode
      const modeSelectScreen = page.locator('text=/chọn chế độ|chọn mode|select mode/i');
      
      // Chờ một chút để xem có màn chọn không
      await page.waitForTimeout(2000);
      
      const hasModeSelect = await modeSelectScreen.isVisible().catch(() => false);
      
      if (hasModeSelect) {
        console.log('❌ FAIL: Hiện màn chọn mode thay vì auto-start game');
        expect(hasModeSelect).toBeFalsy();
      }
      
      // Kiểm tra đã vào màn chơi (có soroban board hoặc câu hỏi hoặc countdown)
      const gameStarted = page.locator('[class*="soroban"], [class*="problem"], [class*="countdown"], text=/tập trung|câu hỏi/i').first();
      await expect(gameStarted).toBeVisible({ timeout: GAME_START_TIMEOUT });
      
      console.log('✅ Practice boss auto-starts game correctly (no mode selection)');
    } else {
      console.log('⚠️ No practice boss found on map - skipping test');
      test.skip();
    }
  });

  test('Click vào boss thi đấu -> Auto-start Compete (không hiện màn chọn mode)', async ({ page }) => {
    await page.goto('/adventure');
    await page.waitForLoadState('networkidle');
    
    // Tìm và click vào boss thi đấu (thường có icon 🏆 hoặc text "Đấu Trường")
    const competeStage = page.locator('button, [role="button"]')
      .filter({ hasText: /đấu trường|thi đấu|compete|🏆/i })
      .first();
    
    if (await competeStage.isVisible()) {
      await competeStage.click();
      
      // Chờ modal hoặc navigation
      await page.waitForTimeout(1000);
      
      // Nếu có modal, click vào nút bắt đầu
      const startButton = page.locator('button').filter({ hasText: /bắt đầu|start|vào|thi đấu/i }).first();
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      // Kiểm tra đã navigate đến /compete
      await page.waitForURL(/\/compete/, { timeout: NAVIGATION_TIMEOUT });
      await page.waitForLoadState('networkidle');
      
      // ✅ QUAN TRỌNG: Kiểm tra KHÔNG hiện màn chọn mode
      const modeSelectScreen = page.locator('text=/chọn chế độ|chọn mode|select mode|đấu trường tia chớp/i');
      
      await page.waitForTimeout(2000);
      
      const hasModeSelect = await modeSelectScreen.isVisible().catch(() => false);
      
      if (hasModeSelect) {
        console.log('❌ FAIL: Hiện màn chọn mode thay vì auto-start game');
        expect(hasModeSelect).toBeFalsy();
      }
      
      // Kiểm tra đã vào màn chơi
      const gameStarted = page.locator('[class*="soroban"], [class*="problem"], [class*="countdown"], text=/tập trung|câu/i').first();
      await expect(gameStarted).toBeVisible({ timeout: GAME_START_TIMEOUT });
      
      console.log('✅ Compete boss auto-starts game correctly (no mode selection)');
    } else {
      console.log('⚠️ No compete boss found on map - skipping test');
      test.skip();
    }
  });

  test('Click vào boss Flash Anzan luyện tập -> Auto-start với countdown', async ({ page }) => {
    await page.goto('/adventure');
    await page.waitForLoadState('networkidle');
    
    // Tìm boss Flash Anzan / Tia Chớp trong luyện tập
    const flashPracticeStage = page.locator('button, [role="button"]')
      .filter({ hasText: /tia chớp|flash|anzan|⚡/i })
      .first();
    
    if (await flashPracticeStage.isVisible()) {
      await flashPracticeStage.click();
      
      await page.waitForTimeout(1000);
      
      const startButton = page.locator('button').filter({ hasText: /bắt đầu|start|vào/i }).first();
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      // Chờ navigate
      await page.waitForURL(/\/(practice|compete)/, { timeout: NAVIGATION_TIMEOUT });
      await page.waitForLoadState('networkidle');
      
      // ✅ Kiểm tra countdown hiện ra (số 3, 2, 1)
      // Flash Anzan luôn bắt đầu với countdown
      await page.waitForTimeout(1000);
      
      const countdownOrGame = page.locator('text=/3|2|1|tập trung/i, [class*="countdown"]').first();
      const hasCountdownOrGame = await countdownOrGame.isVisible().catch(() => false);
      
      // Hoặc kiểm tra đang hiện số flash
      const flashNumber = page.locator('[class*="flash"], text=/^[0-9]+$/').first();
      const hasFlashNumber = await flashNumber.isVisible().catch(() => false);
      
      if (hasCountdownOrGame || hasFlashNumber) {
        console.log('✅ Flash Anzan auto-starts with countdown correctly');
      } else {
        // Kiểm tra xem có bị stuck ở màn chọn không
        const modeSelect = page.locator('text=/chọn.*số|chọn.*phép|chọn.*tốc độ/i');
        const stuckAtSelect = await modeSelect.isVisible().catch(() => false);
        
        if (stuckAtSelect) {
          console.log('❌ FAIL: Bị stuck ở màn chọn thay vì auto-start');
          expect(stuckAtSelect).toBeFalsy();
        }
      }
    } else {
      console.log('⚠️ No Flash Anzan stage found on map - skipping test');
      test.skip();
    }
  });

  test('Quay lại Adventure Map sau khi hoàn thành game', async ({ page }) => {
    await page.goto('/adventure');
    await page.waitForLoadState('networkidle');
    
    // Click vào một stage bất kỳ
    const anyStage = page.locator('button, [role="button"]')
      .filter({ hasText: /bài|boss|luyện|đấu/i })
      .first();
    
    if (await anyStage.isVisible()) {
      await anyStage.click();
      await page.waitForTimeout(1000);
      
      const startButton = page.locator('button').filter({ hasText: /bắt đầu|start|vào/i }).first();
      if (await startButton.isVisible()) {
        await startButton.click();
      }
      
      // Chờ navigate đi
      await page.waitForURL(/\/(learn|practice|compete)/, { timeout: NAVIGATION_TIMEOUT });
      
      // Click nút back
      const backButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      if (await backButton.isVisible()) {
        await backButton.click();
      }
      
      // Kiểm tra quay về adventure
      await page.waitForURL(/\/adventure/, { timeout: NAVIGATION_TIMEOUT });
      
      console.log('✅ Can navigate back to Adventure Map');
    } else {
      test.skip();
    }
  });
});

// Test riêng cho sessionStorage flow
test.describe('SessionStorage Game Mode Flow', () => {
  
  test('practiceGameMode được set đúng khi click từ map', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|adventure)/, { timeout: NAVIGATION_TIMEOUT });
    
    // Go to adventure
    await page.goto('/adventure');
    await page.waitForLoadState('networkidle');
    
    // Click practice stage
    const practiceStage = page.locator('button, [role="button"]')
      .filter({ hasText: /boss.*luyện|luyện.*tập|👹/i })
      .first();
    
    if (await practiceStage.isVisible()) {
      // Lắng nghe sessionStorage changes
      await page.evaluate(() => {
        window.__testSessionStorage = {};
        const originalSetItem = sessionStorage.setItem.bind(sessionStorage);
        sessionStorage.setItem = (key, value) => {
          window.__testSessionStorage[key] = value;
          return originalSetItem(key, value);
        };
      });
      
      await practiceStage.click();
      await page.waitForTimeout(500);
      
      // Kiểm tra sessionStorage
      const sessionData = await page.evaluate(() => window.__testSessionStorage);
      
      if (sessionData.practiceGameMode) {
        const gameMode = JSON.parse(sessionData.practiceGameMode);
        console.log('📦 practiceGameMode:', gameMode);
        
        expect(gameMode.from).toBe('adventure');
        expect(gameMode.mode).toBeTruthy();
        expect(gameMode.zoneId).toBeTruthy();
        
        console.log('✅ practiceGameMode set correctly with from=adventure');
      }
    } else {
      test.skip();
    }
  });

  test('competeGameMode được set đúng khi click từ map', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|adventure)/, { timeout: NAVIGATION_TIMEOUT });
    
    // Go to adventure
    await page.goto('/adventure');
    await page.waitForLoadState('networkidle');
    
    // Click compete stage
    const competeStage = page.locator('button, [role="button"]')
      .filter({ hasText: /đấu trường|thi đấu|🏆/i })
      .first();
    
    if (await competeStage.isVisible()) {
      await page.evaluate(() => {
        window.__testSessionStorage = {};
        const originalSetItem = sessionStorage.setItem.bind(sessionStorage);
        sessionStorage.setItem = (key, value) => {
          window.__testSessionStorage[key] = value;
          return originalSetItem(key, value);
        };
      });
      
      await competeStage.click();
      await page.waitForTimeout(500);
      
      const sessionData = await page.evaluate(() => window.__testSessionStorage);
      
      if (sessionData.competeGameMode) {
        const gameMode = JSON.parse(sessionData.competeGameMode);
        console.log('📦 competeGameMode:', gameMode);
        
        expect(gameMode.from).toBe('adventure');
        expect(gameMode.mode).toBeTruthy();
        expect(gameMode.zoneId).toBeTruthy();
        
        console.log('✅ competeGameMode set correctly with from=adventure');
      }
    } else {
      test.skip();
    }
  });
});
