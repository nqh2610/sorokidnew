/**
 * 🧪 AUTOMATED ADVENTURE MAP TEST
 * 
 * Test tự động navigation từ Adventure Map đến Practice/Compete
 * Chạy: node tests/run-adventure-test.js
 */

const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';

// Test scenarios
const TEST_SCENARIOS = [
  {
    name: '⚡ Flash Anzan - Luyện Tập',
    setup: () => {
      return {
        key: 'practiceGameMode',
        value: JSON.stringify({
          from: 'adventure',
          mode: 'flashAnzan',
          zoneId: 'zone-flash-1',
          difficulty: 'easy',
          operation: 'add',
          digits: 1,
          numbers: 3,
          speed: 1000
        })
      };
    },
    targetUrl: '/practice',
    expectedNotToSee: ['Chọn Chế Độ', 'CHỌN SỐ CHỮ SỐ'],
    expectedToSee: ['3', '2', '1', 'TẬP TRUNG'] // countdown hoặc game
  },
  {
    name: '⚡ Flash Anzan - Thi Đấu',
    setup: () => {
      return {
        key: 'competeGameMode',
        value: JSON.stringify({
          from: 'adventure',
          mode: 'flashAnzan',
          zoneId: 'zone-flash-compete-1',
          difficulty: 'easy',
          operation: 'add',
          digits: 1,
          numbers: 3,
          speed: 1000
        })
      };
    },
    targetUrl: '/compete',
    expectedNotToSee: ['Chọn Chế Độ', 'CHỌN SỐ CHỮ SỐ', 'CHỌN TỐC ĐỘ THI ĐẤU'],
    expectedToSee: ['3', '2', '1', 'TẬP TRUNG']
  },
  {
    name: '🧠 Mental Math - Luyện Tập',
    setup: () => {
      return {
        key: 'practiceGameMode',
        value: JSON.stringify({
          from: 'adventure',
          mode: 'mentalMath',
          zoneId: 'zone-mental-1',
          difficulty: 'easy',
          mentalSubMode: 'addSubMixed'
        })
      };
    },
    targetUrl: '/practice',
    expectedNotToSee: ['Chọn Chế Độ', 'CHỌN CHẾ ĐỘ TÍNH'],
    expectedToSee: ['câu', '=', '+', '-'] // game question elements
  },
  {
    name: '🧠 Mental Math - Thi Đấu',
    setup: () => {
      return {
        key: 'competeGameMode',
        value: JSON.stringify({
          from: 'adventure',
          mode: 'mentalMath',
          zoneId: 'zone-mental-compete-1',
          difficulty: 'easy',
          mentalSubMode: 'addSubMixed'
        })
      };
    },
    targetUrl: '/compete',
    expectedNotToSee: ['Chọn Chế Độ', 'Chọn Số Câu Hỏi'],
    expectedToSee: ['câu', '=']
  }
];

async function runTests() {
  console.log('🚀 Starting Adventure Map Navigation Tests...\n');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: true // Chạy không hiện browser, đổi thành false để debug
  });
  
  const results = { passed: 0, failed: 0, tests: [] };
  
  for (const scenario of TEST_SCENARIOS) {
    console.log(`\n📋 Testing: ${scenario.name}`);
    console.log('-'.repeat(50));
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Setup sessionStorage trước khi navigate
      const { key, value } = scenario.setup();
      
      // Đi đến trang trước để có thể set sessionStorage
      await page.goto(BASE_URL + '/adventure', { waitUntil: 'domcontentloaded' });
      
      // Set sessionStorage
      await page.evaluate(({ key, value }) => {
        sessionStorage.setItem(key, value);
      }, { key, value });
      
      console.log(`   ✓ Set ${key} in sessionStorage`);
      
      // Navigate đến target page
      await page.goto(BASE_URL + scenario.targetUrl, { waitUntil: 'networkidle' });
      console.log(`   ✓ Navigated to ${scenario.targetUrl}`);
      
      // Đợi một chút để page render
      await page.waitForTimeout(2000);
      
      // Lấy text content của page
      const bodyText = await page.evaluate(() => document.body.innerText);
      
      // Check không có màn hình chọn mode
      let hasSelectionScreen = false;
      for (const notExpected of scenario.expectedNotToSee) {
        if (bodyText.includes(notExpected)) {
          console.log(`   ❌ FOUND selection screen: "${notExpected}"`);
          hasSelectionScreen = true;
        }
      }
      
      // Check có game/countdown
      let hasGameContent = false;
      for (const expected of scenario.expectedToSee) {
        if (bodyText.includes(expected)) {
          console.log(`   ✓ Found expected content: "${expected}"`);
          hasGameContent = true;
          break;
        }
      }
      
      // Check for countdown số lớn (1, 2, 3)
      const hasCountdown = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        for (const el of elements) {
          const text = el.innerText?.trim();
          if (['1', '2', '3'].includes(text) && el.children.length === 0) {
            const style = window.getComputedStyle(el);
            const fontSize = parseFloat(style.fontSize);
            if (fontSize > 40) { // Countdown thường có font size lớn
              return true;
            }
          }
        }
        return false;
      });
      
      if (hasCountdown) {
        console.log(`   ✓ Countdown detected (large number)`);
        hasGameContent = true;
      }
      
      // Check for input field (Mental Math)
      const hasInput = await page.evaluate(() => {
        return document.querySelector('input[type="text"], input[type="number"]') !== null;
      });
      
      if (hasInput && scenario.name.includes('Mental')) {
        console.log(`   ✓ Input field found (Mental Math game)`);
        hasGameContent = true;
      }
      
      // Determine result
      const passed = !hasSelectionScreen && hasGameContent;
      
      if (passed) {
        console.log(`\n   ✅ PASSED: Auto-start hoạt động đúng!`);
        results.passed++;
      } else {
        console.log(`\n   ❌ FAILED: ${hasSelectionScreen ? 'Hiện màn chọn mode' : 'Không tìm thấy game content'}`);
        results.failed++;
        
        // Screenshot để debug
        await page.screenshot({ 
          path: `test-results/${scenario.name.replace(/[^a-z0-9]/gi, '_')}.png`,
          fullPage: true 
        });
        console.log(`   📸 Screenshot saved`);
      }
      
      results.tests.push({ name: scenario.name, passed });
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      results.failed++;
      results.tests.push({ name: scenario.name, passed: false, error: error.message });
    }
    
    await context.close();
  }
  
  await browser.close();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`   Total: ${results.passed + results.failed}`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log('='.repeat(60));
  
  if (results.failed > 0) {
    console.log('\n⚠️ Failed tests:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   - ${t.name}${t.error ? `: ${t.error}` : ''}`);
    });
  } else {
    console.log('\n🎉 All tests passed! Adventure Map navigation works correctly!');
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Tạo thư mục test-results nếu chưa có
const fs = require('fs');
if (!fs.existsSync('test-results')) {
  fs.mkdirSync('test-results');
}

runTests().catch(console.error);
