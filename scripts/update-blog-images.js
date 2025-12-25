/**
 * 🖼️ CẬP NHẬT ĐƯỜNG DẪN ẢNH TRONG CÁC FILE BLOG JSON
 * 
 * Chạy: node scripts/update-blog-images.js
 */

const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '..', 'content', 'blog', 'posts');

// Mapping: slug -> tên file ảnh
const imageMapping = {
  // Series Soroban cho phụ huynh (15 bài)
  'cau-tao-ban-tinh-soroban': '/blog/cau-tao-soroban.jpg',
  'cach-cam-va-tu-the-hoc-soroban': '/blog/cach-cam-soroban.jpg',
  'cach-bieu-dien-so-tren-soroban': '/blog/bieu-dien-so-soroban.jpg',
  'bieu-dien-so-hang-chuc-tram-soroban': '/blog/so-hang-chuc-tram.jpg',
  'phep-cong-don-gian-tren-soroban': '/blog/phep-cong-soroban.jpg',
  'phep-tru-don-gian-tren-soroban': '/blog/phep-tru-soroban.jpg',
  'quy-tac-ban-cua-5-soroban': '/blog/ban-cua-5-soroban.jpg',
  'quy-tac-ban-cua-10-soroban': '/blog/ban-cua-10-soroban.jpg',
  'phep-cong-co-nho-thuc-hanh-soroban': '/blog/cong-co-nho-soroban.jpg',
  'phep-tru-co-muon-soroban': '/blog/tru-co-muon-soroban.jpg',
  'phep-nhan-tren-soroban': '/blog/phep-nhan-soroban.jpg',
  'phep-chia-tren-soroban': '/blog/phep-chia-soroban.jpg',
  'tinh-nham-soroban-anzan': '/blog/anzan-tinh-nham.jpg',
  'lo-trinh-hoc-soroban-cho-tre': '/blog/lo-trinh-hoc-soroban.jpg',
  'sai-lam-pho-bien-khi-hoc-soroban': '/blog/sai-lam-hoc-soroban.jpg',
  
  // Series Soroban khác
  'soroban-la-gi-vi-sao-phu-hop-voi-tre-tieu-hoc': '/blog/soroban-co-tot.jpg',
  'soroban-co-that-su-tot-nhu-loi-don': '/blog/soroban-co-tot.jpg',
  'soroban-giup-tre-tinh-nham-tot-hon-nhu-the-nao': '/blog/tinh-nham-nhanh.jpg',
  'may-tuoi-cho-con-hoc-soroban-la-phu-hop': '/blog/may-tuoi-hoc-soroban.jpg',
  'hoc-soroban-mat-bao-lau-de-tinh-nham-duoc': '/blog/tinh-nham-nhanh.jpg',
  'hoc-soroban-online-co-phu-hop-cho-phu-huynh-ban-ron': '/blog/hoc-soroban-online.jpg',
  'chon-lop-soroban-hay-hoc-online': '/blog/chon-lop-soroban.jpg',
  'lam-sao-biet-con-hoc-soroban-dung-huong': '/blog/hoc-soroban-dung-huong.jpg',
  
  // Series Phụ huynh kèm con học toán
  '10-phut-moi-ngay-phu-huynh-nen-lam-gi-khi-con-hoc-toan': '/blog/phu-huynh-kem-con.jpg',
  'ba-viec-phu-huynh-chi-nen-lam-khi-con-hoc': '/blog/phu-huynh-kem-con.jpg',
  'dong-hanh-cung-con-hoc-toan-la-gi': '/blog/phu-huynh-kem-con.jpg',
  'phu-huynh-co-nen-truc-tiep-day-con-hoc-toan-khong': '/blog/giup-con-hoc-toan.jpg',
  'phu-huynh-khong-gioi-toan-co-kem-con-hoc-duoc-khong': '/blog/giup-con-hoc-toan.jpg',
  'sai-lam-pho-bien-khi-kem-con-hoc-toan': '/blog/phu-huynh-kem-con.jpg',
  'vi-sao-cang-kem-con-hoc-toan-ca-nha-cang-met': '/blog/phu-huynh-kem-con.jpg',
  'khi-nao-phu-huynh-nen-dung-cong-cu-ho-tro': '/blog/hoc-soroban-online.jpg',
  
  // Series Con gặp khó khăn khi học toán
  'con-hay-quen-bang-cuu-chuong': '/blog/con-quen-bang-cuu-chuong.jpg',
  'con-lam-toan-cham-hon-ban': '/blog/con-lam-toan-cham.jpg',
  'con-so-kiem-tra-toan': '/blog/con-so-kiem-tra.jpg',
  'con-biet-tinh-nhung-doc-de-khong-hieu': '/blog/con-doc-de-khong-hieu.jpg',
  'con-so-hoc-toan-phu-huynh-dang-lam-sai-o-dau': '/blog/con-kho-khan-hoc-toan.jpg',
  'con-hoc-toan-cham-co-that-la-do-con': '/blog/con-lam-toan-cham.jpg',
  'con-noi-con-ghet-toan-minh-da-phan-ung-sai': '/blog/con-kho-khan-hoc-toan.jpg',
  'con-khong-nghe-loi-khi-bo-me-day-toan': '/blog/con-kho-khan-hoc-toan.jpg',
  
  // Series Cách giúp con học toán nhẹ nhàng
  'lam-sao-de-con-hoc-toan-khong-ap-luc': '/blog/giup-con-hoc-toan.jpg',
  'hoc-toan-nhu-choi-game-co-thuc-su-hieu-qua': '/blog/hoc-soroban-online.jpg',
};

// Đọc tất cả file JSON
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));

let updated = 0;
let skipped = 0;

files.forEach(filename => {
  const filepath = path.join(postsDir, filename);
  const content = fs.readFileSync(filepath, 'utf8');
  const post = JSON.parse(content);
  
  const slug = post.slug;
  const newImage = imageMapping[slug];
  
  if (newImage && post.image !== newImage) {
    post.image = newImage;
    fs.writeFileSync(filepath, JSON.stringify(post, null, 2), 'utf8');
    console.log(`✅ ${slug} → ${newImage}`);
    updated++;
  } else if (!newImage) {
    // Nếu không có mapping, dùng ảnh mặc định
    const defaultImage = '/blog/soroban-co-tot.jpg';
    if (post.image !== defaultImage) {
      post.image = defaultImage;
      fs.writeFileSync(filepath, JSON.stringify(post, null, 2), 'utf8');
      console.log(`⚠️  ${slug} → ${defaultImage} (default)`);
      updated++;
    } else {
      skipped++;
    }
  } else {
    skipped++;
  }
});

console.log(`\n📊 Kết quả:`);
console.log(`   ✅ Đã cập nhật: ${updated}`);
console.log(`   ⏭️  Bỏ qua: ${skipped}`);
