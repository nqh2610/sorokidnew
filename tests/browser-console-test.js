/**
 * 🧪 BROWSER CONSOLE TEST SCRIPT
 * 
 * Copy và paste script này vào Browser Console để test
 * 
 * Mở DevTools (F12) → Console → Paste script → Enter
 */

(async function testAdventureMapNavigation() {
  console.log('🧪 Testing Adventure Map Navigation...\n');
  
  const results = { passed: 0, failed: 0, tests: [] };
  
  // Helper
  const test = (name, condition) => {
    if (condition) {
      console.log(`✅ ${name}`);
      results.passed++;
    } else {
      console.log(`❌ ${name}`);
      results.failed++;
    }
    results.tests.push({ name, passed: condition });
  };
  
  // Test 1: Kiểm tra đang ở trang nào
  const currentPath = window.location.pathname;
  console.log(`📍 Current path: ${currentPath}`);
  
  // Test 2: Kiểm tra sessionStorage
  const practiceMode = sessionStorage.getItem('practiceGameMode');
  const competeMode = sessionStorage.getItem('competeGameMode');
  const learnMode = sessionStorage.getItem('learnGameMode');
  
  console.log('\n📦 SessionStorage:');
  if (practiceMode) {
    const data = JSON.parse(practiceMode);
    console.log('  practiceGameMode:', data);
    test('practiceGameMode has from=adventure', data.from === 'adventure');
    test('practiceGameMode has mode', !!data.mode);
    test('practiceGameMode has zoneId', !!data.zoneId);
    console.log(`  → Mode: ${data.mode}, Difficulty: ${data.difficulty}`);
  } else {
    console.log('  practiceGameMode: (empty)');
  }
  
  if (competeMode) {
    const data = JSON.parse(competeMode);
    console.log('  competeGameMode:', data);
    test('competeGameMode has from=adventure', data.from === 'adventure');
    test('competeGameMode has mode', !!data.mode);
    test('competeGameMode has zoneId', !!data.zoneId);
    console.log(`  → Mode: ${data.mode}, Difficulty: ${data.difficulty}`);
  } else {
    console.log('  competeGameMode: (empty)');
  }
  
  // Test 3: Kiểm tra UI state nếu đang ở practice
  if (currentPath === '/practice') {
    console.log('\n🎮 Checking Practice page state...');
    const bodyText = document.body.innerText;
    
    // Kiểm tra màn chọn mode
    const modeSelectKeywords = ['Chọn Chế Độ', 'CHỌN CHẾ ĐỘ', 'Chọn chế độ'];
    const hasModeSelect = modeSelectKeywords.some(k => bodyText.includes(k));
    
    // Kiểm tra màn chọn Flash Anzan steps
    const flashSelectKeywords = ['CHỌN SỐ CHỮ SỐ', 'CHỌN PHÉP TOÁN', 'CHỌN TỐC ĐỘ', 'CHỌN CẤP ĐỘ'];
    const hasFlashSelect = flashSelectKeywords.some(k => bodyText.includes(k));
    
    // Kiểm tra màn chọn Mental Math sub-mode
    const mentalSelectKeywords = ['CHỌN CHẾ ĐỘ TÍNH', 'Siêu Cộng', 'Siêu Trừ'];
    const hasMentalSelect = mentalSelectKeywords.some(k => bodyText.includes(k)) && !bodyText.includes('TẬP TRUNG');
    
    // Kiểm tra game đang chạy
    const gameRunningKeywords = ['TẬP TRUNG', 'câu', '/10', '/5'];
    const hasGame = gameRunningKeywords.some(k => bodyText.includes(k));
    const hasCountdown = bodyText.match(/^\s*[123]\s*$/m);
    const hasSoroban = document.querySelector('[class*="soroban"]');
    const hasFlashNumber = document.querySelector('[class*="flash"]');
    
    console.log(`  Mode select screen: ${hasModeSelect ? 'YES ❌' : 'NO ✅'}`);
    console.log(`  Flash select screen: ${hasFlashSelect ? 'YES ❌' : 'NO ✅'}`);
    console.log(`  Mental select screen: ${hasMentalSelect ? 'YES ❌' : 'NO ✅'}`);
    console.log(`  Game running: ${hasGame || hasCountdown || hasSoroban ? 'YES ✅' : 'NO ❌'}`);
    
    const isAutoStarted = !hasModeSelect && !hasFlashSelect && !hasMentalSelect && (hasGame || hasCountdown || hasSoroban || hasFlashNumber);
    test('Practice: Auto-start thành công (không hiện màn chọn)', isAutoStarted);
  }
  
  // Test 4: Kiểm tra UI state nếu đang ở compete
  if (currentPath === '/compete') {
    console.log('\n🏆 Checking Compete page state...');
    const bodyText = document.body.innerText;
    
    // Kiểm tra màn chọn mode
    const modeSelectKeywords = ['Chọn Chế Độ', 'CHỌN CHẾ ĐỘ', 'ĐẤU TRƯỜNG TIA CHỚP'];
    const hasModeSelect = modeSelectKeywords.some(k => bodyText.includes(k)) && !bodyText.includes('TẬP TRUNG');
    
    // Kiểm tra màn chọn Flash Anzan steps
    const flashSelectKeywords = ['CHỌN SỐ CHỮ SỐ', 'CHỌN PHÉP TOÁN', 'CHỌN TỐC ĐỘ THI ĐẤU'];
    const hasFlashSelect = flashSelectKeywords.some(k => bodyText.includes(k));
    
    // Kiểm tra màn chọn difficulty
    const diffSelectKeywords = ['CHỌN CẤP ĐỘ', 'Tập Sự', 'Chiến Binh', 'Dũng Sĩ'];
    const hasDiffSelect = diffSelectKeywords.filter(k => bodyText.includes(k)).length >= 2 && !bodyText.includes('TẬP TRUNG');
    
    // Kiểm tra màn chọn số câu
    const questionSelectKeywords = ['Chọn Số Câu Hỏi', '5 câu', '10 câu', '20 câu'];
    const hasQuestionSelect = questionSelectKeywords.filter(k => bodyText.includes(k)).length >= 2;
    
    // Kiểm tra game đang chạy
    const hasGame = bodyText.includes('TẬP TRUNG') || bodyText.includes('/5') || bodyText.includes('/10');
    const hasCountdown = bodyText.match(/^\s*[123]\s*$/m);
    const hasSoroban = document.querySelector('[class*="soroban"]');
    
    console.log(`  Mode select screen: ${hasModeSelect ? 'YES ❌' : 'NO ✅'}`);
    console.log(`  Flash select screen: ${hasFlashSelect ? 'YES ❌' : 'NO ✅'}`);
    console.log(`  Difficulty select: ${hasDiffSelect ? 'YES ❌' : 'NO ✅'}`);
    console.log(`  Question count select: ${hasQuestionSelect ? 'YES ❌' : 'NO ✅'}`);
    console.log(`  Game running: ${hasGame || hasCountdown || hasSoroban ? 'YES ✅' : 'NO ❌'}`);
    
    const isAutoStarted = !hasModeSelect && !hasFlashSelect && !hasDiffSelect && !hasQuestionSelect && (hasGame || hasCountdown || hasSoroban);
    test('Compete: Auto-start thành công (không hiện màn chọn)', isAutoStarted);
  }
  
  // Test 5: Nếu đang ở adventure, hướng dẫn test
  if (currentPath === '/adventure') {
    console.log('\n📍 Đang ở Adventure Map');
    console.log('   Để test, hãy click vào một trong các boss sau:');
    console.log('   🧠 Boss Siêu Trí Tuệ (Mental Math) - Luyện tập');
    console.log('   ⚡ Boss Tia Chớp (Flash Anzan) - Luyện tập');
    console.log('   🏆 Đấu Trường Siêu Trí Tuệ - Thi đấu');
    console.log('   🏆 Đấu Trường Tia Chớp - Thi đấu');
    console.log('   Sau đó chạy lại script này!');
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Results: ${results.passed} passed, ${results.failed} failed`);
  console.log('='.repeat(50));
  
  if (results.failed > 0) {
    console.log('\n⚠️ Có vấn đề! Kiểm tra:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   ❌ ${t.name}`);
    });
  } else if (results.passed > 0) {
    console.log('\n✅ Tất cả tests passed!');
  }
  
  return results;
})();
