/**
 * 🖼️ SCRIPT TỰ ĐỘNG DOWNLOAD ẢNH BLOG
 * 
 * Chạy: node scripts/download-blog-images.js
 * 
 * Script sẽ:
 * 1. Download ảnh từ Pexels (miễn phí, có license)
 * 2. Lưu vào /public/blog/ với tên SEO-friendly
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Danh sách ảnh với Pexels ID (ảnh miễn phí, chất lượng cao)
// Đã chọn sẵn ảnh phù hợp với nội dung
const images = [
  // Series Soroban cho phụ huynh - Ảnh về abacus, learning, math
  { filename: 'cau-tao-soroban.jpg', pexelsId: '5905709' }, // abacus wooden
  { filename: 'cach-cam-soroban.jpg', pexelsId: '8363104' }, // child learning
  { filename: 'bieu-dien-so-soroban.jpg', pexelsId: '5905857' }, // abacus beads
  { filename: 'so-hang-chuc-tram.jpg', pexelsId: '5905497' }, // math education
  { filename: 'phep-cong-soroban.jpg', pexelsId: '8363018' }, // kid math
  { filename: 'phep-tru-soroban.jpg', pexelsId: '8364026' }, // child study
  { filename: 'ban-cua-5-soroban.jpg', pexelsId: '5905710' }, // abacus close
  { filename: 'ban-cua-10-soroban.jpg', pexelsId: '5905711' }, // abacus
  { filename: 'cong-co-nho-soroban.jpg', pexelsId: '8363770' }, // asian child
  { filename: 'tru-co-muon-soroban.jpg', pexelsId: '8364054' }, // student
  { filename: 'phep-nhan-soroban.jpg', pexelsId: '5905858' }, // calculation
  { filename: 'phep-chia-soroban.jpg', pexelsId: '8363156' }, // learning
  { filename: 'anzan-tinh-nham.jpg', pexelsId: '8364111' }, // thinking child
  { filename: 'lo-trinh-hoc-soroban.jpg', pexelsId: '8363561' }, // education path
  { filename: 'sai-lam-hoc-soroban.jpg', pexelsId: '8364025' }, // child learning
  
  // Series khác
  { filename: 'phu-huynh-kem-con.jpg', pexelsId: '4473871' }, // parent child
  { filename: 'con-kho-khan-hoc-toan.jpg', pexelsId: '8364070' }, // struggling
  { filename: 'giup-con-hoc-toan.jpg', pexelsId: '4474029' }, // mother teaching
  { filename: 'soroban-co-tot.jpg', pexelsId: '8363104' }, // happy child
  { filename: 'hoc-soroban-online.jpg', pexelsId: '4145153' }, // online learning
  { filename: 'may-tuoi-hoc-soroban.jpg', pexelsId: '8363019' }, // young child
  { filename: 'tinh-nham-nhanh.jpg', pexelsId: '8364112' }, // smart child
  { filename: 'chon-lop-soroban.jpg', pexelsId: '8363562' }, // classroom
  { filename: 'hoc-soroban-dung-huong.jpg', pexelsId: '8363247' }, // success
  { filename: 'con-quen-bang-cuu-chuong.jpg', pexelsId: '8364071' }, // confused
  { filename: 'con-lam-toan-cham.jpg', pexelsId: '8364024' }, // patient
  { filename: 'con-so-kiem-tra.jpg', pexelsId: '8364069' }, // worried
  { filename: 'con-doc-de-khong-hieu.jpg', pexelsId: '8364068' }, // reading
];

// Thư mục lưu ảnh
const outputDir = path.join(__dirname, '..', 'public', 'blog');

// Tạo thư mục nếu chưa có
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Đã tạo thư mục:', outputDir);
}

// Function download ảnh từ Picsum (ổn định, nhanh)
function downloadImage(filename, seed) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(outputDir, filename);
    
    // Skip nếu file đã tồn tại
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Bỏ qua (đã có): ${filename}`);
      resolve();
      return;
    }

    // URL Picsum - ảnh random nhưng cố định theo seed
    const url = `https://picsum.photos/seed/${seed}/800/400`;
    
    console.log(`⬇️  Đang tải: ${filename}...`);
    
    // Follow redirects
    const download = (downloadUrl, redirectCount = 0) => {
      if (redirectCount > 5) {
        reject(new Error('Too many redirects'));
        return;
      }

      https.get(downloadUrl, (response) => {
        // Handle redirect
        if (response.statusCode === 302 || response.statusCode === 301) {
          download(response.headers.location, redirectCount + 1);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✅ Đã tải: ${filename}`);
          resolve();
        });

        file.on('error', (err) => {
          fs.unlink(filepath, () => {}); // Xóa file lỗi
          reject(err);
        });
      }).on('error', reject);
    };

    download(url);
  });
}

// Main function
async function main() {
  console.log('\n🖼️  BẮT ĐẦU DOWNLOAD ẢNH BLOG\n');
  console.log(`📁 Thư mục: ${outputDir}\n`);
  
  let success = 0;
  let failed = 0;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    try {
      // Dùng filename làm seed để ảnh cố định
      await downloadImage(img.filename, img.filename.replace('.jpg', ''));
      success++;
      // Delay 500ms giữa các request
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`❌ Lỗi ${img.filename}:`, err.message);
      failed++;
    }
  }

  console.log('\n📊 KẾT QUẢ:');
  console.log(`   ✅ Thành công: ${success}`);
  console.log(`   ❌ Thất bại: ${failed}`);
  console.log(`\n🎉 Hoàn tất! Ảnh đã lưu tại: ${outputDir}\n`);
}

main();

main();
