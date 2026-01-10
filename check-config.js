const fs = require('fs');

console.log('='.repeat(60));
console.log('KIỂM TRA CẤU HÌNH GAME VÀ CHỨNG CHỈ');
console.log('='.repeat(60));

// Read AddSub config
const addSubContent = fs.readFileSync('./config/adventure-stages-addsub.config.js', 'utf8');

// Count stages
const stageIds = addSubContent.match(/stageId: (\d+),/g) || [];
console.log('\n📊 ADDSUB STAGES:');
console.log('   Tổng stages:', stageIds.length);

// Parse zone info manually
const zoneIdMatches = [...addSubContent.matchAll(/zoneId: '([^']+)',\s*\n\s*order: (\d+),[\s\S]*?stageRange: \[(\d+), (\d+)\]/g)];
console.log('   Tổng zones:', zoneIdMatches.length);

console.log('\n📍 CHI TIẾT ZONES:');
let prevEnd = 0;
zoneIdMatches.forEach(match => {
  const [_, zoneId, order, start, end] = match;
  const count = parseInt(end) - parseInt(start) + 1;
  const gap = parseInt(start) - prevEnd - 1;
  const status = gap === 0 ? '✅' : `❌ GAP=${gap}`;
  console.log(`   ${order.padStart(2)}. ${zoneId.padEnd(25)} [${start.padStart(2)}-${end.padStart(2)}] = ${count} stages ${status}`);
  prevEnd = parseInt(end);
});

// Verify total
console.log('\n   → Tổng stages từ zones:', prevEnd);
console.log('   → Khớp với GAME_STAGES:', prevEnd === stageIds.length ? '✅' : '❌');

// Check certificate
console.log('\n🏆 CHỨNG CHỈ:');
const hasCertZone = addSubContent.includes('hasCertificate: true');
console.log('   Zone có chứng chỉ:', hasCertZone ? '✅' : '❌');

const hasTreasure = addSubContent.includes("type: 'treasure'");
console.log('   Stage treasure:', hasTreasure ? '✅' : '❌');

const hasCertReq = addSubContent.includes('CERT_REQUIREMENTS_ADDSUB');
console.log('   Export CERT_REQUIREMENTS:', hasCertReq ? '✅' : '❌');

// Check stage 88 (treasure stage)
const stage88 = addSubContent.includes('stageId: 88');
console.log('   Stage 88 (kho báu):', stage88 ? '✅' : '❌');

const stage88Link = addSubContent.match(/stageId: 88[\s\S]*?link: '([^']+)'/)?.[1];
console.log('   Link stage 88:', stage88Link || '❌ Không tìm thấy');

// Check MULDIV
console.log('\n' + '='.repeat(60));
const mulDivContent = fs.readFileSync('./config/adventure-stages-muldiv.config.js', 'utf8');

const mulDivStageIds = mulDivContent.match(/stageId: (\d+),/g) || [];
console.log('\n📊 MULDIV STAGES:');
console.log('   Tổng stages:', mulDivStageIds.length);

// Parse MulDiv zones
const mulDivZones = [...mulDivContent.matchAll(/zoneId: '([^']+)',\s*\n\s*order: (\d+),[\s\S]*?stageRange: \[(\d+), (\d+)\]/g)];
console.log('   Tổng zones:', mulDivZones.length);

if (mulDivZones.length > 0) {
  console.log('\n📍 CHI TIẾT ZONES MULDIV:');
  let prevEnd = 88; // MulDiv bắt đầu sau AddSub
  mulDivZones.forEach(match => {
    const [_, zoneId, order, start, end] = match;
    const count = parseInt(end) - parseInt(start) + 1;
    const gap = parseInt(start) - prevEnd - 1;
    const status = gap === 0 ? '✅' : `❌ GAP=${gap}`;
    console.log(`   ${order.padStart(2)}. ${zoneId.padEnd(20)} [${start.padStart(3)}-${end.padStart(3)}] = ${count} stages ${status}`);
    prevEnd = parseInt(end);
  });
  console.log('\n   → Tổng stages MulDiv:', prevEnd - 88);
}

const mulDivCertZone = mulDivContent.includes('hasCertificate: true');
console.log('   Zone có chứng chỉ:', mulDivCertZone ? '✅' : '❌');

const mulDivTreasure = mulDivContent.includes("type: 'treasure'");
console.log('   Stage treasure:', mulDivTreasure ? '✅' : '❌');

console.log('\n' + '='.repeat(60));
console.log('✅ KIỂM TRA HOÀN TẤT');
console.log('='.repeat(60));
