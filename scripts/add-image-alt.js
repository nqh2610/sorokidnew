/**
 * Script thêm imageAlt vào các bài blog JSON
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '../content/blog/posts');

// Mapping slug -> alt text
const ALT_TEXT_MAPPING = {
  '10-phut-moi-ngay-phu-huynh-nen-lam-gi-khi-con-hoc-toan': 'Mẹ châu Á dành 10 phút mỗi ngày kèm con học toán',
  'ba-viec-phu-huynh-chi-nen-lam-khi-con-hoc': 'Mẹ châu Á đọc sách cùng con - việc nên làm khi kèm con học',
  'bieu-dien-so-hang-chuc-tram-soroban': 'Trẻ em học biểu diễn số hàng chục, trăm trên Soroban',
  'cach-bieu-dien-so-tren-soroban': 'Trẻ em đang học cách biểu diễn số trên bàn tính Soroban',
  'cach-cam-va-tu-the-hoc-soroban': 'Cách cầm và tư thế học Soroban đúng cách',
  'cau-tao-ban-tinh-soroban': 'Trẻ em châu Á học Soroban với bàn tính tại nhà',
  'chon-lop-soroban-hay-hoc-online': 'Trẻ em học Soroban tại nhà hay lớp học',
  'con-biet-tinh-nhung-doc-de-khong-hieu': 'Trẻ em châu Á cần hỗ trợ đọc hiểu đề toán',
  'con-hay-quen-bang-cuu-chuong': 'Mẹ châu Á giúp con nhớ bảng cửu chương',
  'con-hoc-toan-cham-co-that-la-do-con': 'Mẹ châu Á kiên nhẫn kèm con học - con chậm không do con',
  'con-khong-nghe-loi-khi-bo-me-day-toan': 'Mẹ châu Á ôm con - cách xử lý khi con không nghe lời học toán',
  'con-lam-toan-cham-hon-ban': 'Trẻ em châu Á tập trung học toán theo tốc độ riêng',
  'con-noi-con-ghet-toan-minh-da-phan-ung-sai': 'Bố động viên con khi con nói ghét toán',
  'con-so-hoc-toan-phu-huynh-dang-lam-sai-o-dau': 'Trẻ em châu Á lo lắng khi học toán tại nhà',
  'con-so-kiem-tra-toan': 'Trẻ em châu Á căng thẳng trước bài kiểm tra toán',
  'dong-hanh-cung-con-hoc-toan-la-gi': 'Gia đình châu Á đồng hành cùng con học toán trong phòng khách',
  'hoc-soroban-mat-bao-lau-de-tinh-nham-duoc': 'Trẻ em kiên trì học Soroban để tính nhẩm',
  'hoc-soroban-online-co-phu-hop-cho-phu-huynh-ban-ron': 'Học Soroban online cho phụ huynh bận rộn',
  'hoc-toan-nhu-choi-game-co-thuc-su-hieu-qua': 'Mẹ con châu Á vui vẻ học toán như chơi game',
  'khi-nao-phu-huynh-nen-dung-cong-cu-ho-tro': 'Mẹ châu Á dùng công cụ hỗ trợ dạy con học',
  'lam-sao-biet-con-hoc-soroban-dung-huong': 'Dấu hiệu con học Soroban đúng hướng',
  'lam-sao-de-con-hoc-toan-khong-ap-luc': 'Mẹ con châu Á vui vẻ - học toán không áp lực',
  'lo-trinh-hoc-soroban-cho-tre': 'Lộ trình học Soroban cho trẻ cùng phụ huynh',
  'may-tuoi-cho-con-hoc-soroban-la-phu-hop': 'Độ tuổi phù hợp cho trẻ học Soroban',
  'phep-chia-tren-soroban': 'Trẻ em học phép chia trên Soroban',
  'phep-cong-co-nho-thuc-hanh-soroban': 'Trẻ em thực hành phép cộng có nhớ trên Soroban cùng bố',
  'phep-cong-don-gian-tren-soroban': 'Trẻ em học phép cộng đơn giản trên Soroban',
  'phep-nhan-tren-soroban': 'Bố dạy con phép nhân trên Soroban tại nhà',
  'phep-tru-co-muon-soroban': 'Trẻ em học phép trừ có mượn trên Soroban',
  'phep-tru-don-gian-tren-soroban': 'Trẻ em học phép trừ đơn giản trên Soroban tại nhà',
  'phu-huynh-co-nen-truc-tiep-day-con-hoc-toan-khong': 'Bố châu Á trực tiếp dạy con học toán tại nhà',
  'phu-huynh-khong-gioi-toan-co-kem-con-hoc-duoc-khong': 'Mẹ châu Á kèm con học toán dù không giỏi toán',
  'quy-tac-ban-cua-10-soroban': 'Trẻ em học quy tắc bạn của 10 trên Soroban',
  'quy-tac-ban-cua-5-soroban': 'Trẻ em học quy tắc bạn của 5 trên Soroban',
  'sai-lam-pho-bien-khi-hoc-soroban': 'Tránh sai lầm phổ biến khi học Soroban',
  'sai-lam-pho-bien-khi-kem-con-hoc-toan': 'Bố châu Á kiên nhẫn kèm con học toán tại nhà',
  'soroban-co-that-su-tot-nhu-loi-don': 'Gia đình châu Á học Soroban tại nhà',
  'soroban-giup-tre-tinh-nham-tot-hon-nhu-the-nao': 'Soroban giúp trẻ tính nhẩm tốt hơn',
  'soroban-la-gi-vi-sao-phu-hop-voi-tre-tieu-hoc': 'Trẻ tiểu học học Soroban - phương pháp phù hợp',
  'tinh-nham-soroban-anzan': 'Trẻ em luyện tính nhẩm Soroban Anzan',
  'vi-sao-cang-kem-con-hoc-toan-ca-nha-cang-met': 'Phụ huynh châu Á đang kiên nhẫn kèm con học toán'
};

async function main() {
  console.log('🚀 Thêm imageAlt vào các bài blog...\n');
  
  let updated = 0;
  let skipped = 0;
  
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const slug = file.replace('.json', '');
    const altText = ALT_TEXT_MAPPING[slug];
    
    if (!altText) {
      console.log(`⚠️  No alt text mapping: ${slug}`);
      skipped++;
      continue;
    }
    
    const filePath = path.join(POSTS_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Kiểm tra xem đã có imageAlt chưa
    if (content.imageAlt && content.imageAlt === altText) {
      console.log(`⏭️  Already has alt: ${slug}`);
      skipped++;
      continue;
    }
    
    content.imageAlt = altText;
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
    console.log(`✅ Updated: ${slug}`);
    updated++;
  }
  
  console.log(`\n📊 Summary: ${updated} updated, ${skipped} skipped`);
}

main().catch(console.error);
