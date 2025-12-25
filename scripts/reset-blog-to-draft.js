/**
 * Script reset tất cả bài viết về draft
 * Chạy 1 lần khi muốn bắt đầu lại từ đầu
 * 
 * Usage: node scripts/reset-blog-to-draft.js
 */

const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '..', 'content', 'blog', 'posts');

function resetToDraft() {
  console.log('⚠️  Reset tất cả bài viết về DRAFT...\n');
  
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));
  const today = new Date().toISOString().split('T')[0];
  
  let updated = 0;
  
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Set về draft
      content.status = 'draft';
      content.publishedAt = null;
      
      // Đảm bảo có createdAt
      if (!content.createdAt) {
        content.createdAt = today;
      }
      
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
      console.log(`✅ ${file} -> draft`);
      updated++;
    } catch (err) {
      console.log(`❌ ${file}: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Đã reset ${updated} bài viết về draft`);
  console.log('💡 Vào Admin > Blog để public từng bài');
}

// Confirm before running
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('⚠️  Bạn có chắc muốn reset TẤT CẢ bài viết về draft? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes') {
    resetToDraft();
  } else {
    console.log('❌ Đã hủy');
  }
  rl.close();
});
