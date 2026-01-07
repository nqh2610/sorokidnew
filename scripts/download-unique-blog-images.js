/**
 * Script download ảnh phù hợp cho từng bài viết blog
 * Mỗi bài có 1 ảnh riêng biệt, không trùng lặp
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Mapping: slug bài viết -> URL ảnh Unsplash phù hợp với nội dung
const imageMapping = {
  // ===== DANH MỤC: Soroban cho phụ huynh (kiến thức Soroban) =====
  
  // Cấu tạo bàn tính Soroban
  'cau-tao-ban-tinh-soroban': 'https://images.unsplash.com/photo-1635372722656-389f87a941b7?w=800&h=400&fit=crop',
  
  // Cách biểu diễn số 0-9 trên Soroban
  'cach-bieu-dien-so-tren-soroban': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=400&fit=crop',
  
  // Biểu diễn số hàng chục, trăm, nghìn
  'bieu-dien-so-hang-chuc-tram-soroban': 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&h=400&fit=crop',
  
  // Cách cầm Soroban và tư thế học đúng
  'cach-cam-va-tu-the-hoc-soroban': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
  
  // Phép cộng đơn giản trên Soroban
  'phep-cong-don-gian-tren-soroban': 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=800&h=400&fit=crop',
  
  // Phép cộng có nhớ trên Soroban
  'phep-cong-co-nho-thuc-hanh-soroban': 'https://images.unsplash.com/photo-1596496050827-8299e0220de1?w=800&h=400&fit=crop',
  
  // Phép trừ đơn giản trên Soroban  
  'phep-tru-don-gian-tren-soroban': 'https://images.unsplash.com/photo-1632571401005-458e9d244591?w=800&h=400&fit=crop',
  
  // Phép trừ có mượn trên Soroban
  'phep-tru-co-muon-soroban': 'https://images.unsplash.com/photo-1453733190371-0a9bedd82893?w=800&h=400&fit=crop',
  
  // Quy tắc Bạn của 5 trong Soroban
  'quy-tac-ban-cua-5-soroban': 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=400&fit=crop',
  
  // Quy tắc Bạn của 10 trong Soroban
  'quy-tac-ban-cua-10-soroban': 'https://images.unsplash.com/photo-1594912772922-4063bcd89e0c?w=800&h=400&fit=crop',
  
  // Phép nhân trên Soroban
  'phep-nhan-tren-soroban': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop',
  
  // Phép chia trên Soroban
  'phep-chia-tren-soroban': 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&h=400&fit=crop',
  
  // Tính nhẩm Soroban (Anzan)
  'tinh-nham-soroban-anzan': 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&h=400&fit=crop',
  
  // Lộ trình học Soroban cho trẻ
  'lo-trinh-hoc-soroban-cho-tre': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop',
  
  // 10 sai lầm phổ biến khi học Soroban
  'sai-lam-pho-bien-khi-hoc-soroban': 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=800&h=400&fit=crop',

  // ===== DANH MỤC: Tâm lý & hành vi (con sợ toán, không thích học) =====
  
  // Con sợ toán - mình đã vô tình làm gì sai?
  'con-so-hoc-toan-phu-huynh-dang-lam-sai-o-dau': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=400&fit=crop',
  
  // Con nói "con ghét toán"
  'con-noi-con-ghet-toan-minh-da-phan-ung-sai': 'https://images.unsplash.com/photo-1476234251651-f353703a034d?w=800&h=400&fit=crop',
  
  // Con sợ kiểm tra toán đến mức đau bụng
  'con-so-kiem-tra-toan': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop',
  
  // Con không nghe lời khi bố mẹ dạy toán
  'con-khong-nghe-loi-khi-bo-me-day-toan': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=400&fit=crop',
  
  // Con học toán chậm hơn bạn
  'con-hoc-toan-cham-co-that-la-do-con': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=400&fit=crop',
  
  // Con làm bài chậm, bạn nộp rồi con chưa xong
  'con-lam-toan-cham-hon-ban': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop',

  // ===== DANH MỤC: Kỹ năng & phương pháp (cách học toán hiệu quả) =====
  
  // Con biết tính nhưng đọc đề không hiểu
  'con-biet-tinh-nhung-doc-de-khong-hieu': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop',
  
  // Con học thuộc bảng cửu chương rồi lại quên
  'con-hay-quen-bang-cuu-chuong': 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=800&h=400&fit=crop',
  
  // Con học toán mà không khóc - hóa ra có thể
  'lam-sao-de-con-hoc-toan-khong-ap-luc': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&h=400&fit=crop',
  
  // Con mình học toán trên app - tưởng chơi game hóa ra học thật
  'hoc-toan-nhu-choi-game-co-thuc-su-hieu-qua': 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=400&fit=crop',

  // ===== DANH MỤC: Vai trò phụ huynh (đồng hành cùng con) =====
  
  // Mình từng nghĩ đồng hành là ngồi kèm con học
  'dong-hanh-cung-con-hoc-toan-la-gi': 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&h=400&fit=crop',
  
  // Mình dốt toán từ nhỏ - giờ làm sao kèm con?
  'phu-huynh-khong-gioi-toan-co-kem-con-hoc-duoc-khong': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
  
  // Mình đã cố làm giáo viên của con
  'phu-huynh-co-nen-truc-tiep-day-con-hoc-toan-khong': 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=400&fit=crop',
  
  // 5 sai lầm mình từng mắc khi kèm con học toán
  'sai-lam-pho-bien-khi-kem-con-hoc-toan': 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&h=400&fit=crop',
  
  // Mình đã ngồi kèm con học toán đến mức cả hai đều khóc
  'vi-sao-cang-kem-con-hoc-toan-ca-nha-cang-met': 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=800&h=400&fit=crop',
  
  // Ba việc mình làm bây giờ - thay vì ngồi kèm con
  'ba-viec-phu-huynh-chi-nen-lam-khi-con-hoc': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800&h=400&fit=crop',
  
  // 10 phút mỗi tối - mình chỉ cần làm vậy thôi
  '10-phut-moi-ngay-phu-huynh-nen-lam-gi-khi-con-hoc-toan': 'https://images.unsplash.com/photo-1542744173-05336fcc7ad4?w=800&h=400&fit=crop',
  
  // Mình đã cố tự kèm con - đến khi nào thì nên dừng?
  'khi-nao-phu-huynh-nen-dung-cong-cu-ho-tro': 'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=800&h=400&fit=crop',

  // ===== DANH MỤC: Câu hỏi về Soroban (FAQ về việc cho con học) =====
  
  // Mình từng thắc mắc: Soroban là gì?
  'soroban-la-gi-vi-sao-phu-hop-voi-tre-tieu-hoc': 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&h=400&fit=crop',
  
  // Soroban có thật sự tốt như lời đồn?
  'soroban-co-that-su-tot-nhu-loi-don': 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&h=400&fit=crop',
  
  // Con mấy tuổi thì nên học Soroban?
  'may-tuoi-cho-con-hoc-soroban-la-phu-hop': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=400&fit=crop',
  
  // Học Soroban bao lâu thì con tính nhẩm được?
  'hoc-soroban-mat-bao-lau-de-tinh-nham-duoc': 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&h=400&fit=crop',
  
  // Con mình tính nhẩm nhanh hơn - nhờ Soroban
  'soroban-giup-tre-tinh-nham-tot-hon-nhu-the-nao': 'https://images.unsplash.com/photo-1595429035839-c99c298ffdde?w=800&h=400&fit=crop',
  
  // Lớp học, gia sư hay online - mình đã chọn cách nào?
  'chon-lop-soroban-hay-hoc-online': 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=400&fit=crop',
  
  // Mình đi làm cả ngày - làm sao kèm con học Soroban?
  'hoc-soroban-online-co-phu-hop-cho-phu-huynh-ban-ron': 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&h=400&fit=crop',
  
  // Làm sao biết con đang học Soroban đúng hướng?
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
