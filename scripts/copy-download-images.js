/**
 * Script copy ảnh từ public/download sang public/blog
 * và cập nhật JSON với tên file mới
 * 
 * Ảnh trong download đều là ảnh:
 * - Trẻ châu Á học Soroban
 * - Phụ huynh kèm con học
 * - Bàn tính Soroban thật
 */

const fs = require('fs');
const path = require('path');

const DOWNLOAD_DIR = path.join(__dirname, '../public/download');
const BLOG_DIR = path.join(__dirname, '../public/blog');
const POSTS_DIR = path.join(__dirname, '../content/blog/posts');

// Mapping ảnh download -> bài viết + tên file mới + alt text
const IMAGE_MAPPING = [
  // ===== ẢNH TRẺ HỌC SOROBAN (có bàn tính) =====
  {
    source: 'tre-hoc-bang-ban-tinh.jpg',
    slug: 'cau-tao-ban-tinh-soroban',
    newName: 'tre-chau-a-hoc-soroban-tai-nha.jpg',
    alt: 'Trẻ em châu Á đang học Soroban với bàn tính tại nhà'
  },
  {
    source: 'tre-lam-bai-tap-toan-soroban-2.jpg',
    slug: 'cach-bieu-dien-so-tren-soroban',
    newName: 'tre-bieu-dien-so-tren-soroban.jpg',
    alt: 'Trẻ em học cách biểu diễn số trên bàn tính Soroban'
  },
  {
    source: 'ngolongnd_soroban4.jpg',
    slug: 'bieu-dien-so-hang-chuc-tram-soroban',
    newName: 'hoc-so-hang-chuc-tram-soroban.jpg',
    alt: 'Trẻ em châu Á học biểu diễn số hàng chục, trăm trên Soroban'
  },
  {
    source: 'ban-tinh-soroban-1-e1643124423573.jpg',
    slug: 'cach-cam-va-tu-the-hoc-soroban',
    newName: 'cach-cam-ban-tinh-soroban-dung.jpg',
    alt: 'Cách cầm bàn tính Soroban đúng tư thế khi học'
  },
  {
    source: 'bat-mi-cach-day-tre-hoc-toan-bang-ban-tinh-soroban-don-gian-hieu-qua-202309270828482690.jpg',
    slug: 'phep-cong-don-gian-tren-soroban',
    newName: 'day-tre-phep-cong-soroban.jpg',
    alt: 'Phụ huynh dạy trẻ phép cộng đơn giản trên Soroban'
  },
  {
    source: 'DSCN2645-1200.jpg',
    slug: 'phep-cong-co-nho-thuc-hanh-soroban',
    newName: 'tre-thuc-hanh-phep-cong-co-nho.jpg',
    alt: 'Trẻ em thực hành phép cộng có nhớ trên bàn tính Soroban'
  },
  {
    source: 'day-toan-tu-duy-soroban-1200x628.jpg',
    slug: 'phep-tru-don-gian-tren-soroban',
    newName: 'hoc-phep-tru-soroban-tai-nha.jpg',
    alt: 'Trẻ em châu Á học phép trừ đơn giản trên Soroban tại nhà'
  },
  {
    source: 'DSCN2645-1200 (1).jpg',
    slug: 'phep-tru-co-muon-soroban',
    newName: 'tre-hoc-phep-tru-co-muon.jpg',
    alt: 'Trẻ em học phép trừ có mượn trên bàn tính Soroban'
  },
  {
    source: 'hoc-toan-soroban-tai-nha.jpg',
    slug: 'phep-nhan-tren-soroban',
    newName: 'phu-huynh-day-phep-nhan-soroban.jpg',
    alt: 'Phụ huynh châu Á dạy con phép nhân trên Soroban tại nhà'
  },
  {
    source: 'khoa-hoc-toan-soroban.jpeg',
    slug: 'phep-chia-tren-soroban',
    newName: 'tre-hoc-phep-chia-soroban.jpg',
    alt: 'Trẻ em học phép chia trên bàn tính Soroban'
  },
  {
    source: 'tai-lieu-hoc-toan-soroban.jpg',
    slug: 'quy-tac-ban-cua-5-soroban',
    newName: 'hoc-quy-tac-ban-cua-5.jpg',
    alt: 'Trẻ em châu Á học quy tắc bạn của 5 trên Soroban'
  },
  {
    source: 'Toan-thong-minh-Soroban-–-Phuong-phap-hoc-toan-hieu-qua-1.jpg',
    slug: 'quy-tac-ban-cua-10-soroban',
    newName: 'hoc-quy-tac-ban-cua-10.jpg',
    alt: 'Trẻ em học quy tắc bạn của 10 trên Soroban'
  },
  {
    source: 'img_6726.jpg',
    slug: 'tinh-nham-soroban-anzan',
    newName: 'tre-luyen-tinh-nham-anzan.jpg',
    alt: 'Trẻ em luyện tính nhẩm Soroban Anzan'
  },
  {
    source: 'maxresdefault.jpg',
    slug: 'soroban-la-gi-vi-sao-phu-hop-voi-tre-tieu-hoc',
    newName: 'soroban-phu-hop-tre-tieu-hoc.jpg',
    alt: 'Soroban phù hợp cho trẻ tiểu học châu Á'
  },
  {
    source: '5-2.jpg',
    slug: 'soroban-giup-tre-tinh-nham-tot-hon-nhu-the-nao',
    newName: 'soroban-giup-tre-tinh-nham.jpg',
    alt: 'Soroban giúp trẻ châu Á tính nhẩm tốt hơn'
  },
  {
    source: 't7.jpg',
    slug: 'soroban-co-that-su-tot-nhu-loi-don',
    newName: 'gia-dinh-hoc-soroban-tai-nha.jpg',
    alt: 'Gia đình châu Á cùng học Soroban tại nhà'
  },
  {
    source: 'curso-introducao-ao-soroban-adaptado.jpg',
    slug: 'lo-trinh-hoc-soroban-cho-tre',
    newName: 'lo-trinh-hoc-soroban-tre-em.jpg',
    alt: 'Lộ trình học Soroban cho trẻ em từ cơ bản đến nâng cao'
  },
  {
    source: 'A Guide To Abacus Learning - Age Requirements.jpg',
    slug: 'may-tuoi-cho-con-hoc-soroban-la-phu-hop',
    newName: 'do-tuoi-phu-hop-hoc-soroban.jpg',
    alt: 'Độ tuổi phù hợp cho trẻ bắt đầu học Soroban'
  },
  {
    source: 'Abacus Learning - A Center for Kids of All Ages.jpg',
    slug: 'hoc-soroban-mat-bao-lau-de-tinh-nham-duoc',
    newName: 'thoi-gian-hoc-soroban-tinh-nham.jpg',
    alt: 'Thời gian cần thiết để trẻ học Soroban tính nhẩm được'
  },
  {
    source: "Children's Abacus Skill Test In Maths Classes.jpg",
    slug: 'sai-lam-pho-bien-khi-hoc-soroban',
    newName: 'tranh-sai-lam-hoc-soroban.jpg',
    alt: 'Những sai lầm phổ biến cần tránh khi học Soroban'
  },
  {
    source: 'Fun and Creative Abacus Maths Classes For Children.jpg',
    slug: 'lam-sao-biet-con-hoc-soroban-dung-huong',
    newName: 'dau-hieu-con-hoc-soroban-dung.jpg',
    alt: 'Dấu hiệu nhận biết con học Soroban đúng hướng'
  },
  {
    source: 'OIP.jpg',
    slug: 'hoc-soroban-online-co-phu-hop-cho-phu-huynh-ban-ron',
    newName: 'hoc-soroban-online-tai-nha.jpg',
    alt: 'Trẻ học Soroban online tại nhà cho phụ huynh bận rộn'
  },
  {
    source: '619OD5pod+L.jpg',
    slug: 'chon-lop-soroban-hay-hoc-online',
    newName: 'chon-lop-hay-hoc-online-soroban.jpg',
    alt: 'Lựa chọn lớp học Soroban hay học online tại nhà'
  },

  // ===== ẢNH PHỤ HUYNH KÈM CON HỌC =====
  {
    source: 'istockphoto-1194272048-612x612.jpg',
    slug: 'vi-sao-cang-kem-con-hoc-toan-ca-nha-cang-met',
    newName: 'me-kem-con-hoc-toan-tai-nha.jpg',
    alt: 'Mẹ châu Á kiên nhẫn kèm con học toán tại nhà'
  },
  {
    source: 'istockphoto-1210826708-612x612.jpg',
    slug: 'phu-huynh-co-nen-truc-tiep-day-con-hoc-toan-khong',
    newName: 'bo-truc-tiep-day-con-hoc-toan.jpg',
    alt: 'Bố châu Á trực tiếp dạy con học toán tại nhà'
  },
  {
    source: 'istockphoto-1285337694-612x612.jpg',
    slug: 'dong-hanh-cung-con-hoc-toan-la-gi',
    newName: 'gia-dinh-dong-hanh-hoc-toan.jpg',
    alt: 'Gia đình châu Á đồng hành cùng con học toán'
  },
  {
    source: 'istockphoto-160311341-612x612.jpg',
    slug: 'phu-huynh-khong-gioi-toan-co-kem-con-hoc-duoc-khong',
    newName: 'me-kem-con-du-khong-gioi-toan.jpg',
    alt: 'Mẹ châu Á kèm con học toán dù không giỏi toán'
  },
  {
    source: '360_F_290471266_D6bXQxJW05p4HsamFNyOalTdkgLSlFYp.jpg',
    slug: 'sai-lam-pho-bien-khi-kem-con-hoc-toan',
    newName: 'tranh-sai-lam-kem-con-hoc-toan.jpg',
    alt: 'Tránh sai lầm phổ biến khi kèm con học toán'
  },
  {
    source: '3fc5f6b0f93ce4382a59f99af77aac22.jpg',
    slug: '10-phut-moi-ngay-phu-huynh-nen-lam-gi-khi-con-hoc-toan',
    newName: '10-phut-kem-con-hoc-toan.jpg',
    alt: 'Phụ huynh dành 10 phút mỗi ngày kèm con học toán'
  },
];

async function main() {
  console.log('🚀 Copy ảnh từ download sang blog...\n');

  let copied = 0;
  let updated = 0;
  let errors = [];

  for (const item of IMAGE_MAPPING) {
    const sourcePath = path.join(DOWNLOAD_DIR, item.source);
    const destPath = path.join(BLOG_DIR, item.newName);
    const jsonPath = path.join(POSTS_DIR, `${item.slug}.json`);

    // Kiểm tra file nguồn tồn tại
    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠️  Không tìm thấy: ${item.source}`);
      errors.push(item.source);
      continue;
    }

    // Copy file
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied: ${item.source} -> ${item.newName}`);
      copied++;
    } catch (err) {
      console.error(`❌ Lỗi copy ${item.source}: ${err.message}`);
      errors.push(item.source);
      continue;
    }

    // Cập nhật JSON
    if (fs.existsSync(jsonPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        content.image = `/blog/${item.newName}`;
        content.imageAlt = item.alt;
        fs.writeFileSync(jsonPath, JSON.stringify(content, null, 2), 'utf8');
        console.log(`   📝 Updated JSON: ${item.slug}`);
        updated++;
      } catch (err) {
        console.error(`   ❌ Lỗi update JSON ${item.slug}: ${err.message}`);
      }
    } else {
      console.log(`   ⚠️  JSON không tồn tại: ${item.slug}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 KẾT QUẢ:');
  console.log(`   Ảnh đã copy: ${copied}`);
  console.log(`   JSON đã cập nhật: ${updated}`);
  console.log(`   Lỗi: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  Files không tìm thấy:');
    errors.forEach(e => console.log(`   - ${e}`));
  }
  console.log('='.repeat(60));
}

main().catch(console.error);
