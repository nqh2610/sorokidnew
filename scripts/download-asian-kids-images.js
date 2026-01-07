/**
 * Script download ảnh phù hợp: trẻ em châu Á, học sinh tiểu học, học Soroban
 * Mỗi bài có 1 ảnh riêng biệt, không trùng lặp
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Mapping: slug bài viết -> URL ảnh Unsplash (Asian kids, elementary students, soroban/abacus)
const imageMapping = {
  // ===== DANH MỤC: Soroban cho phụ huynh (kiến thức Soroban) =====
  
  // Cấu tạo bàn tính Soroban - bàn tính gỗ
  'cau-tao-ban-tinh-soroban': 'https://images.unsplash.com/photo-1635372722656-389f87a941b7?w=800&h=400&fit=crop',
  
  // Cách biểu diễn số 0-9 - bé gái châu Á học đếm với abacus
  'cach-bieu-dien-so-tren-soroban': 'https://images.unsplash.com/photo-1596464716091-e8c4a72a3a80?w=800&h=400&fit=crop',
  
  // Biểu diễn số hàng chục, trăm - trẻ em châu Á viết số
  'bieu-dien-so-hang-chuc-tram-soroban': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
  
  // Cách cầm Soroban và tư thế - học sinh tiểu học châu Á ngồi học
  'cach-cam-va-tu-the-hoc-soroban': 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=400&fit=crop',
  
  // Phép cộng đơn giản - bé trai châu Á làm toán
  'phep-cong-don-gian-tren-soroban': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=400&fit=crop',
  
  // Phép cộng có nhớ - học sinh tiểu học trong lớp học
  'phep-cong-co-nho-thuc-hanh-soroban': 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=400&fit=crop',
  
  // Phép trừ đơn giản - bé châu Á tập trung học
  'phep-tru-don-gian-tren-soroban': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&h=400&fit=crop',
  
  // Phép trừ có mượn - học sinh suy nghĩ 
  'phep-tru-co-muon-soroban': 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=800&h=400&fit=crop',
  
  // Quy tắc Bạn của 5 - bé giơ 5 ngón tay
  'quy-tac-ban-cua-5-soroban': 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=800&h=400&fit=crop',
  
  // Quy tắc Bạn của 10 - bàn tay đếm
  'quy-tac-ban-cua-10-soroban': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop',
  
  // Phép nhân - học sinh làm bài tập
  'phep-nhan-tren-soroban': 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&h=400&fit=crop',
  
  // Phép chia - trẻ em học toán
  'phep-chia-tren-soroban': 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=800&h=400&fit=crop',
  
  // Tính nhẩm Anzan - bé nhắm mắt tập trung
  'tinh-nham-soroban-anzan': 'https://images.unsplash.com/photo-1602008131132-fa29bf0eb8f3?w=800&h=400&fit=crop',
  
  // Lộ trình học Soroban - sách vở bút
  'lo-trinh-hoc-soroban-cho-tre': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop',
  
  // 10 sai lầm học Soroban - mẹ châu Á dạy con
  'sai-lam-pho-bien-khi-hoc-soroban': 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&h=400&fit=crop',

  // ===== DANH MỤC: Tâm lý & hành vi =====
  
  // Con sợ toán - bé buồn lo lắng
  'con-so-hoc-toan-phu-huynh-dang-lam-sai-o-dau': 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=800&h=400&fit=crop',
  
  // Con ghét toán - trẻ em không vui
  'con-noi-con-ghet-toan-minh-da-phan-ung-sai': 'https://images.unsplash.com/photo-1476234251651-f353703a034d?w=800&h=400&fit=crop',
  
  // Con sợ kiểm tra - học sinh lo lắng
  'con-so-kiem-tra-toan': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop',
  
  // Con không nghe lời - phụ huynh và con
  'con-khong-nghe-loi-khi-bo-me-day-toan': 'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=800&h=400&fit=crop',
  
  // Con học chậm - bé suy nghĩ
  'con-hoc-toan-cham-co-that-la-do-con': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=400&fit=crop',
  
  // Con làm bài chậm - học sinh trong lớp
  'con-lam-toan-cham-hon-ban': 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=400&fit=crop',

  // ===== DANH MỤC: Kỹ năng & phương pháp =====
  
  // Đọc đề không hiểu - bé đọc sách
  'con-biet-tinh-nhung-doc-de-khong-hieu': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=400&fit=crop',
  
  // Quên bảng cửu chương - học sinh học thuộc
  'con-hay-quen-bang-cuu-chuong': 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&h=400&fit=crop',
  
  // Học không áp lực - trẻ em vui vẻ học tập
  'lam-sao-de-con-hoc-toan-khong-ap-luc': 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&h=400&fit=crop',
  
  // Học như chơi game - bé dùng tablet
  'hoc-toan-nhu-choi-game-co-thuc-su-hieu-qua': 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=800&h=400&fit=crop',

  // ===== DANH MỤC: Vai trò phụ huynh =====
  
  // Đồng hành cùng con - mẹ con châu Á học chung
  'dong-hanh-cung-con-hoc-toan-la-gi': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=400&fit=crop',
  
  // Phụ huynh dốt toán - mẹ con học chung
  'phu-huynh-khong-gioi-toan-co-kem-con-hoc-duoc-khong': 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&h=400&fit=crop',
  
  // Phụ huynh làm giáo viên - mẹ dạy con
  'phu-huynh-co-nen-truc-tiep-day-con-hoc-toan-khong': 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&h=400&fit=crop',
  
  // 5 sai lầm kèm con - gia đình học tập
  'sai-lam-pho-bien-khi-kem-con-hoc-toan': 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&h=400&fit=crop',
  
  // Cả nhà cùng mệt - stress gia đình
  'vi-sao-cang-kem-con-hoc-toan-ca-nha-cang-met': 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=800&h=400&fit=crop',
  
  // Ba việc nên làm - mẹ ôm con
  'ba-viec-phu-huynh-chi-nen-lam-khi-con-hoc': 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=800&h=400&fit=crop',
  
  // 10 phút mỗi tối - bố mẹ và con đọc sách
  '10-phut-moi-ngay-phu-huynh-nen-lam-gi-khi-con-hoc-toan': 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&h=400&fit=crop',
  
  // Khi nào dừng kèm con - phụ huynh suy nghĩ
  'khi-nao-phu-huynh-nen-dung-cong-cu-ho-tro': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop',

  // ===== DANH MỤC: Câu hỏi về Soroban =====
  
  // Soroban là gì - abacus Nhật Bản
  'soroban-la-gi-vi-sao-phu-hop-voi-tre-tieu-hoc': 'https://images.unsplash.com/photo-1635372722656-389f87a941b7?w=800&h=400&fit=crop',
  
  // Soroban có tốt không - học sinh giỏi vui vẻ
  'soroban-co-that-su-tot-nhu-loi-don': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=400&fit=crop',
  
  // Mấy tuổi học Soroban - trẻ em nhỏ châu Á
  'may-tuoi-cho-con-hoc-soroban-la-phu-hop': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=400&fit=crop',
  
  // Bao lâu tính nhẩm được - đồng hồ và tiến bộ
  'hoc-soroban-mat-bao-lau-de-tinh-nham-duoc': 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=400&fit=crop',
  
  // Con tính nhẩm nhanh - bé thông minh
  'soroban-giup-tre-tinh-nham-tot-hon-nhu-the-nao': 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=800&h=400&fit=crop',
  
  // Lớp hay online - laptop và sách
  'chon-lop-soroban-hay-hoc-online': 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&h=400&fit=crop',
  
  // Phụ huynh bận rộn - mẹ làm việc trên laptop
  'hoc-soroban-online-co-phu-hop-cho-phu-huynh-ban-ron': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&h=400&fit=crop',
  
  // Học đúng hướng - checklist và thành công
  'lam-sao-biet-con-hoc-soroban-dung-huong': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop',
};

const outputDir = path.join(__dirname, '..', 'public', 'blog');

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Xóa ảnh cũ
console.log('🗑️  Xóa ảnh cũ...');
const existingFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
existingFiles.forEach(file => {
  fs.unlinkSync(path.join(outputDir, file));
  console.log(`   Đã xóa: ${file}`);
});

// Download ảnh
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(outputDir, filename);
    const file = fs.createWriteStream(filePath);
    
    const request = (urlToFetch) => {
      https.get(urlToFetch, (response) => {
        // Handle redirect
        if (response.statusCode === 301 || response.statusCode === 302) {
          request(response.headers.location);
          return;
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode} for ${filename}`));
          return;
        }
        
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filename);
        });
      }).on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    };
    
    request(url);
  });
}

async function downloadAllImages() {
  console.log('\n📥 Bắt đầu download ảnh...\n');
  
  const entries = Object.entries(imageMapping);
  let success = 0;
  let failed = 0;
  
  for (const [slug, url] of entries) {
    const filename = `${slug}.jpg`;
    try {
      await downloadImage(url, filename);
      console.log(`✅ ${filename}`);
      success++;
      // Delay để tránh rate limit
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.log(`❌ ${filename}: ${err.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Kết quả: ${success} thành công, ${failed} thất bại`);
  console.log(`📁 Thư mục: ${outputDir}`);
}

// Cập nhật JSON files
async function updateJsonFiles() {
  console.log('\n📝 Cập nhật đường dẫn ảnh trong JSON...\n');
  
  const postsDir = path.join(__dirname, '..', 'content', 'blog', 'posts');
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));
  
  let updated = 0;
  
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const slug = file.replace('.json', '');
    
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Kiểm tra xem có ảnh cho slug này không
      if (imageMapping[slug]) {
        const imagePath = `/blog/${slug}.jpg`;
        content.image = imagePath;
        
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
        console.log(`✅ ${file} -> ${imagePath}`);
        updated++;
      } else {
        console.log(`⚠️  ${file} - không có mapping ảnh`);
      }
    } catch (err) {
      console.log(`❌ ${file}: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Đã cập nhật: ${updated} files`);
}

// Main
async function main() {
  await downloadAllImages();
  await updateJsonFiles();
  console.log('\n🎉 Hoàn tất!');
}

main().catch(console.error);
