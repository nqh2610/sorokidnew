/**
 * 🖼️ DOWNLOAD ẢNH SOROBAN THẬT TỪ UNSPLASH (Link trực tiếp)
 * 
 * Chạy: node scripts/download-real-soroban-images.js
 * 
 * Ảnh từ Unsplash - miễn phí sử dụng thương mại
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Ảnh thật về soroban/abacus từ Unsplash (đã chọn sẵn)
const realImages = [
  // Ảnh Soroban/Abacus thật
  {
    filename: 'cau-tao-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop',
    desc: 'Abacus wooden classic'
  },
  {
    filename: 'soroban-co-tot.jpg',
    url: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=800&h=400&fit=crop',
    desc: 'Colorful abacus'
  },
  {
    filename: 'bieu-dien-so-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=400&fit=crop',
    desc: 'Abacus beads'
  },
  {
    filename: 'ban-cua-5-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop&q=80',
    desc: 'Soroban close up'
  },
  {
    filename: 'ban-cua-10-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=800&h=400&fit=crop&q=80',
    desc: 'Abacus calculation'
  },
  
  // Ảnh trẻ em học toán
  {
    filename: 'cach-cam-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
    desc: 'Child learning'
  },
  {
    filename: 'phep-cong-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&h=400&fit=crop',
    desc: 'Kids math class'
  },
  {
    filename: 'phep-tru-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=800&h=400&fit=crop',
    desc: 'Child studying'
  },
  {
    filename: 'cong-co-nho-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=400&fit=crop',
    desc: 'Asian child learning'
  },
  {
    filename: 'tru-co-muon-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=400&fit=crop',
    desc: 'Student practicing'
  },
  {
    filename: 'phep-nhan-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&h=400&fit=crop',
    desc: 'Math learning'
  },
  {
    filename: 'phep-chia-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop',
    desc: 'Classroom'
  },
  {
    filename: 'anzan-tinh-nham.jpg',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&q=85',
    desc: 'Mental math'
  },
  {
    filename: 'lo-trinh-hoc-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop',
    desc: 'Learning path'
  },
  {
    filename: 'sai-lam-hoc-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=400&fit=crop',
    desc: 'Study mistakes'
  },
  {
    filename: 'so-hang-chuc-tram.jpg',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop&q=90',
    desc: 'Numbers on abacus'
  },
  {
    filename: 'tinh-nham-nhanh.jpg',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&q=90',
    desc: 'Fast calculation'
  },
  
  // Ảnh phụ huynh dạy con
  {
    filename: 'phu-huynh-kem-con.jpg',
    url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&h=400&fit=crop&q=85',
    desc: 'Parent teaching child'
  },
  {
    filename: 'giup-con-hoc-toan.jpg',
    url: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800&h=400&fit=crop',
    desc: 'Mother helping child'
  },
  {
    filename: 'hoc-soroban-online.jpg',
    url: 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=800&h=400&fit=crop&q=85',
    desc: 'Online learning'
  },
  {
    filename: 'may-tuoi-hoc-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&q=80',
    desc: 'Young learner'
  },
  {
    filename: 'chon-lop-soroban.jpg',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop&q=85',
    desc: 'Class selection'
  },
  {
    filename: 'hoc-soroban-dung-huong.jpg',
    url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=400&fit=crop&q=85',
    desc: 'Right direction'
  },
  
  // Ảnh trẻ gặp khó khăn
  {
    filename: 'con-kho-khan-hoc-toan.jpg',
    url: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?w=800&h=400&fit=crop',
    desc: 'Struggling child'
  },
  {
    filename: 'con-quen-bang-cuu-chuong.jpg',
    url: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=400&fit=crop&q=85',
    desc: 'Forgetting'
  },
  {
    filename: 'con-lam-toan-cham.jpg',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&q=75',
    desc: 'Slow learner'
  },
  {
    filename: 'con-so-kiem-tra.jpg',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop',
    desc: 'Test anxiety'
  },
  {
    filename: 'con-doc-de-khong-hieu.jpg',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop&q=85',
    desc: 'Reading difficulty'
  },
];

const outputDir = path.join(__dirname, '..', 'public', 'blog');

// Tạo thư mục nếu chưa có
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(outputDir, filename);
    
    console.log(`⬇️  Đang tải: ${filename}...`);
    
    const download = (downloadUrl, redirectCount = 0) => {
      if (redirectCount > 10) {
        reject(new Error('Too many redirects'));
        return;
      }

      const protocol = downloadUrl.startsWith('https') ? https : require('http');
      
      protocol.get(downloadUrl, (response) => {
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
          fs.unlink(filepath, () => {});
          reject(err);
        });
      }).on('error', reject);
    };

    download(url);
  });
}

async function main() {
  console.log('\n🖼️  DOWNLOAD ẢNH SOROBAN THẬT\n');
  console.log(`📁 Thư mục: ${outputDir}\n`);
  
  let success = 0;
  let failed = 0;

  for (const img of realImages) {
    try {
      await downloadImage(img.url, img.filename);
      success++;
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`❌ Lỗi ${img.filename}:`, err.message);
      failed++;
    }
  }

  console.log('\n📊 KẾT QUẢ:');
  console.log(`   ✅ Thành công: ${success}`);
  console.log(`   ❌ Thất bại: ${failed}`);
  console.log(`\n🎉 Hoàn tất!\n`);
}

main();
