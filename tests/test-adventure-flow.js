/**
 * 🧪 QUICK TEST: Adventure Map Navigation Flow
 * 
 * Script kiểm tra logic auto-start từ Adventure Map
 * Chạy: node tests/test-adventure-flow.js
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Colors for console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

/**
 * Kiểm tra các điều kiện trong source code
 */
async function checkSourceCodeLogic() {
  const fs = require('fs');
  const path = require('path');
  
  console.log('\n📂 Kiểm tra logic trong source code...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Adventure page lưu sessionStorage đúng cách
  try {
    const adventurePath = path.join(__dirname, '../app/adventure/page.jsx');
    const adventureCode = fs.readFileSync(adventurePath, 'utf8');
    
    const hasLearnGameMode = adventureCode.includes("sessionStorage.setItem('learnGameMode'");
    const hasPracticeGameMode = adventureCode.includes("sessionStorage.setItem('practiceGameMode'");
    const hasCompeteGameMode = adventureCode.includes("sessionStorage.setItem('competeGameMode'");
    
    if (hasLearnGameMode && hasPracticeGameMode && hasCompeteGameMode) {
      log.success('Adventure page lưu sessionStorage cho tất cả game modes');
      results.passed++;
    } else {
      log.error('Adventure page thiếu sessionStorage cho một số modes');
      results.failed++;
    }
    results.tests.push({ name: 'Adventure sessionStorage', passed: hasLearnGameMode && hasPracticeGameMode && hasCompeteGameMode });
  } catch (e) {
    log.error(`Lỗi đọc adventure page: ${e.message}`);
    results.failed++;
  }

  // Test 2: Practice page xử lý auto-start đúng cách
  try {
    const practicePath = path.join(__dirname, '../app/practice/page.jsx');
    const practiceCode = fs.readFileSync(practicePath, 'utf8');
    
    const hasSessionStorageCheck = practiceCode.includes("sessionStorage.getItem('practiceGameMode')");
    const hasFromAdventure = practiceCode.includes("from === 'adventure'") || practiceCode.includes("from: 'adventure'");
    const hasAutoStart = practiceCode.includes('startGameDirectly') || practiceCode.includes('auto-start');
    
    if (hasSessionStorageCheck && hasFromAdventure) {
      log.success('Practice page kiểm tra practiceGameMode từ sessionStorage');
      results.passed++;
    } else {
      log.error('Practice page không xử lý practiceGameMode đúng cách');
      results.failed++;
    }
    results.tests.push({ name: 'Practice sessionStorage check', passed: hasSessionStorageCheck && hasFromAdventure });
    
    // Test 2b: Flash Anzan có countdown interval
    const hasCountdownInterval = practiceCode.includes('countdownInterval') && practiceCode.includes('setInterval');
    const flashAutoStartSection = practiceCode.match(/if\s*\(\s*autoMode\s*===\s*['"]flashAnzan['"]\s*\)/);
    
    if (flashAutoStartSection && hasCountdownInterval) {
      log.success('Practice Flash Anzan có countdown interval');
      results.passed++;
    } else {
      log.warn('Practice Flash Anzan có thể thiếu countdown interval');
      results.failed++;
    }
    results.tests.push({ name: 'Practice Flash countdown', passed: flashAutoStartSection && hasCountdownInterval });
    
  } catch (e) {
    log.error(`Lỗi đọc practice page: ${e.message}`);
    results.failed++;
  }

  // Test 3: Compete page xử lý auto-start đúng cách  
  try {
    const competePath = path.join(__dirname, '../app/compete/page.jsx');
    const competeCode = fs.readFileSync(competePath, 'utf8');
    
    const hasSessionStorageCheck = competeCode.includes("sessionStorage.getItem('competeGameMode')");
    const hasFromAdventure = competeCode.includes("from === 'adventure'") || competeCode.includes("from: 'adventure'");
    const hasAutoStart = competeCode.includes('createArena') && competeCode.includes('setSelectedArena');
    
    if (hasSessionStorageCheck && hasFromAdventure && hasAutoStart) {
      log.success('Compete page kiểm tra competeGameMode và auto-start');
      results.passed++;
    } else {
      log.error('Compete page không xử lý competeGameMode đúng cách');
      results.failed++;
    }
    results.tests.push({ name: 'Compete sessionStorage check', passed: hasSessionStorageCheck && hasFromAdventure });
    
    // Test 3b: Compete không bị block bởi URL params
    const urlParamsEffect = competeCode.match(/useEffect.*modeFromUrl.*selectedMode/s);
    const sessionStorageFirst = competeCode.indexOf("sessionStorage.getItem('competeGameMode')") < 
                                 competeCode.indexOf("modeFromUrl && modeInfo[modeFromUrl]");
    
    if (sessionStorageFirst) {
      log.success('Compete page ưu tiên sessionStorage trước URL params');
      results.passed++;
    } else {
      log.warn('Compete page có thể bị URL params ghi đè sessionStorage');
      results.failed++;
    }
    results.tests.push({ name: 'Compete priority order', passed: sessionStorageFirst });
    
    // Test 3c: Flash Anzan trong compete có countdown
    const flashCountdownCompete = competeCode.includes('startFlashChallenge') && 
                                   competeCode.includes('countdownInterval');
    if (flashCountdownCompete) {
      log.success('Compete Flash Anzan có countdown interval');
      results.passed++;
    } else {
      log.warn('Compete Flash Anzan có thể thiếu countdown');
      results.failed++;
    }
    results.tests.push({ name: 'Compete Flash countdown', passed: flashCountdownCompete });
    
  } catch (e) {
    log.error(`Lỗi đọc compete page: ${e.message}`);
    results.failed++;
  }

  // Test 4: Adventure config có đúng cấu trúc
  try {
    const configPath = path.join(__dirname, '../config/adventure-stages-addsub.config.js');
    const configCode = fs.readFileSync(configPath, 'utf8');
    
    const hasPracticeInfo = configCode.includes('practiceInfo:');
    const hasCompeteInfo = configCode.includes('competeInfo:');
    const hasBossType = configCode.includes("bossType: 'practice'") && configCode.includes("bossType: 'compete'");
    const hasMode = configCode.includes('mode:');
    const hasDifficulty = configCode.includes('difficulty:');
    
    if (hasPracticeInfo && hasCompeteInfo && hasBossType && hasMode && hasDifficulty) {
      log.success('Adventure config có đầy đủ thông tin cho practice và compete');
      results.passed++;
    } else {
      log.error('Adventure config thiếu thông tin');
      results.failed++;
    }
    results.tests.push({ name: 'Adventure config structure', passed: hasPracticeInfo && hasCompeteInfo });
    
  } catch (e) {
    log.error(`Lỗi đọc config: ${e.message}`);
    results.failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 KẾT QUẢ: ${results.passed} passed, ${results.failed} failed`);
  console.log('='.repeat(50));
  
  results.tests.forEach(t => {
    console.log(`  ${t.passed ? '✅' : '❌'} ${t.name}`);
  });
  
  return results;
}

/**
 * Kiểm tra server đang chạy
 */
async function checkServerRunning() {
  return new Promise((resolve) => {
    const url = new URL(BASE_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.get(BASE_URL, (res) => {
      resolve(res.statusCode < 500);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 ADVENTURE MAP NAVIGATION TEST');
  console.log('================================\n');
  
  // Check source code logic
  const codeResults = await checkSourceCodeLogic();
  
  // Check if server is running
  console.log('\n🌐 Kiểm tra server...');
  const serverRunning = await checkServerRunning();
  
  if (serverRunning) {
    log.success(`Server đang chạy tại ${BASE_URL}`);
    console.log('\n💡 Để test UI đầy đủ, hãy:');
    console.log('   1. Mở trình duyệt tại ' + BASE_URL);
    console.log('   2. Đăng nhập');
    console.log('   3. Vào Adventure Map');
    console.log('   4. Click vào các boss luyện tập/thi đấu');
    console.log('   5. Kiểm tra xem có vào thẳng màn chơi không');
  } else {
    log.warn(`Server không chạy tại ${BASE_URL}`);
    console.log('\n💡 Để test đầy đủ, hãy chạy: npm run dev');
  }
  
  // Final summary
  console.log('\n' + '='.repeat(50));
  if (codeResults.failed === 0) {
    log.success('TẤT CẢ LOGIC TESTS ĐỀU PASSED!');
    console.log('\n🎉 Code logic đúng. Cần manual test UI để xác nhận hoàn toàn.');
  } else {
    log.error(`Có ${codeResults.failed} tests failed. Cần kiểm tra lại code.`);
  }
  console.log('='.repeat(50) + '\n');
  
  process.exit(codeResults.failed > 0 ? 1 : 0);
}

// Run
runTests().catch(console.error);
