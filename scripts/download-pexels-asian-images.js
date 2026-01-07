/**
 * Script download ảnh từ Pexels cho blog Sorokid
 * 
 * TIÊU CHÍ CHỌN ẢNH:
 * ✅ Người châu Á (đặc biệt Đông/Đông Nam Á)
 * ✅ Ngữ cảnh tại nhà - gia đình
 * ✅ Phụ huynh + con học cùng nhau
 * ✅ Cảm xúc tự nhiên (vui vẻ, tập trung, nhẹ nhàng)
 * ✅ Bài Soroban: phải có bàn tính abacus
 * 
 * ❌ Không ảnh trung tâm/lớp học đông
 * ❌ Không ảnh người phương Tây
 * ❌ Không ảnh marketing/tạo dáng
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../public/blog');

// ====================================
// PEXELS IMAGE MAPPING - CURATED
// ====================================

// NHÓM 1: Bài về SOROBAN/ABACUS - Bắt buộc có bàn tính
const SOROBAN_IMAGES = {
  // Ảnh trẻ châu Á học với abacus tại nhà
  'asian-child-abacus-home': 'https://images.pexels.com/photos/8612925/pexels-photo-8612925.jpeg?w=1280', // Girl in yellow dress with abacus
  'asian-boy-abacus-play': 'https://images.pexels.com/photos/8763083/pexels-photo-8763083.jpeg?w=1280', // Children with father and abacus at home
  'child-abacus-cozy': 'https://images.pexels.com/photos/6693302/pexels-photo-6693302.jpeg?w=1280', // Child using abacus on bed
  'child-learning-abacus': 'https://images.pexels.com/photos/6692940/pexels-photo-6692940.jpeg?w=1280', // Overhead view child using abacus
  'girl-abacus-learning': 'https://images.pexels.com/photos/8612926/pexels-photo-8612926.jpeg?w=1280', // Pretty girl learning to count
  'abacus-home-setting': 'https://images.pexels.com/photos/6693301/pexels-photo-6693301.jpeg?w=1280', // Child using abacus cozy setting
  'kids-abacus-together': 'https://images.pexels.com/photos/8763110/pexels-photo-8763110.jpeg?w=1280', // Two children with abacus
  'father-child-abacus': 'https://images.pexels.com/photos/8763090/pexels-photo-8763090.jpeg?w=1280', // Father taking care kids with abacus
  'girl-abacus-floor': 'https://images.pexels.com/photos/8763107/pexels-photo-8763107.jpeg?w=1280', // Girl on floor with abacus
  'child-abacus-bed': 'https://images.pexels.com/photos/6693307/pexels-photo-6693307.jpeg?w=1280', // Child sitting on bed with abacus
  'young-boy-abacus': 'https://images.pexels.com/photos/6692917/pexels-photo-6692917.jpeg?w=1280', // Young boy sitting with abacus
  'child-hand-abacus': 'https://images.pexels.com/photos/8612931/pexels-photo-8612931.jpeg?w=1280', // Child hand using abacus
};

// NHÓM 2: Phụ huynh châu Á + con học cùng tại nhà
const PARENT_CHILD_STUDY_IMAGES = {
  'mother-teaching-daughter': 'https://images.pexels.com/photos/8055100/pexels-photo-8055100.jpeg?w=1280', // Mother helping daughter homework
  'father-daughter-homework': 'https://images.pexels.com/photos/8055133/pexels-photo-8055133.jpeg?w=1280', // Father helps daughter homework
  'family-studying-living': 'https://images.pexels.com/photos/8054841/pexels-photo-8054841.jpeg?w=1280', // Family enjoys studying in living room
  'mother-daughter-studying': 'https://images.pexels.com/photos/8055103/pexels-photo-8055103.jpeg?w=1280', // Mother and daughter studying
  'father-daughter-kitchen': 'https://images.pexels.com/photos/8055139/pexels-photo-8055139.jpeg?w=1280', // Father helps daughter in kitchen
  'asian-mother-child-toys': 'https://images.pexels.com/photos/7780915/pexels-photo-7780915.jpeg?w=1280', // Asian mother son bonding educational toys
  'mother-children-hugging': 'https://images.pexels.com/photos/4473314/pexels-photo-4473314.jpeg?w=1280', // Woman hugging children outdoors
  'mother-daughter-computer': 'https://images.pexels.com/photos/7943504/pexels-photo-7943504.jpeg?w=1280', // Mother smiling beside daughter computer
  'cheerful-mother-daughter': 'https://images.pexels.com/photos/4473865/pexels-photo-4473865.jpeg?w=1280', // Cheerful mother daughter resting bed
  'mother-children-work': 'https://images.pexels.com/photos/4474043/pexels-photo-4474043.jpeg?w=1280', // Mother children hugging at home
  'mother-daughter-drawing': 'https://images.pexels.com/photos/4473980/pexels-photo-4473980.jpeg?w=1280', // Cheerful mother daughter drawing
  'mother-daughter-coloring': 'https://images.pexels.com/photos/4473986/pexels-photo-4473986.jpeg?w=1280', // Little girl with mother coloring
  'mother-children-reading': 'https://images.pexels.com/photos/7105615/pexels-photo-7105615.jpeg?w=1280', // Mother children reading book together
};

// NHÓM 3: Trẻ châu Á học tập tại nhà (1-2 người)
const CHILD_STUDYING_HOME_IMAGES = {
  'girl-studying-home': 'https://images.pexels.com/photos/8055159/pexels-photo-8055159.jpeg?w=1280', // Asian girl studying with stationery
  'girl-online-classes': 'https://images.pexels.com/photos/8055469/pexels-photo-8055469.jpeg?w=1280', // Asian girl online classes
  'child-video-calling': 'https://images.pexels.com/photos/6267051/pexels-photo-6267051.jpeg?w=1280', // Asian child studying home laptop video call
  'girl-studying-laptop': 'https://images.pexels.com/photos/5905886/pexels-photo-5905886.jpeg?w=1280', // Focused ethnic girl studying laptop
};

// NHÓM 4: Cảm xúc - lo lắng, bối rối, vui vẻ
const EMOTION_IMAGES = {
  'child-worried-study': 'https://images.pexels.com/photos/5905886/pexels-photo-5905886.jpeg?w=1280', // Focused/thinking child
  'happy-family-moment': 'https://images.pexels.com/photos/4473865/pexels-photo-4473865.jpeg?w=1280', // Happy mother daughter
  'joyful-learning': 'https://images.pexels.com/photos/7943504/pexels-photo-7943504.jpeg?w=1280', // Smiling at computer
  'parent-support': 'https://images.pexels.com/photos/4814796/pexels-photo-4814796.jpeg?w=1280', // Girl hugging father
};

// ====================================
// MAPPING BÀI VIẾT -> ẢNH PHÙ HỢP
// ====================================
const BLOG_IMAGE_MAPPING = {
  // ===== BÀI VỀ SOROBAN - Bắt buộc có bàn tính =====
  'cau-tao-ban-tinh-soroban': {
    image: SOROBAN_IMAGES['asian-child-abacus-home'],
    filename: 'tre-hoc-soroban-tai-nha.jpg',
    alt: 'Trẻ em châu Á học Soroban với bàn tính tại nhà'
  },
  'cach-bieu-dien-so-tren-soroban': {
    image: SOROBAN_IMAGES['child-abacus-cozy'],
    filename: 'cach-bieu-dien-so-tren-soroban.jpg',
    alt: 'Trẻ em đang học cách biểu diễn số trên bàn tính Soroban'
  },
  'bieu-dien-so-hang-chuc-tram-soroban': {
    image: SOROBAN_IMAGES['child-learning-abacus'],
    filename: 'bieu-dien-so-hang-chuc-tram-soroban.jpg',
    alt: 'Trẻ em học biểu diễn số hàng chục, trăm trên Soroban'
  },
  'cach-cam-va-tu-the-hoc-soroban': {
    image: SOROBAN_IMAGES['child-hand-abacus'],
    filename: 'cach-cam-ban-tinh-soroban.jpg',
    alt: 'Cách cầm và tư thế học Soroban đúng cách'
  },
  'phep-cong-don-gian-tren-soroban': {
    image: SOROBAN_IMAGES['girl-abacus-learning'],
    filename: 'phep-cong-don-gian-soroban.jpg',
    alt: 'Trẻ em học phép cộng đơn giản trên Soroban'
  },
  'phep-cong-co-nho-thuc-hanh-soroban': {
    image: SOROBAN_IMAGES['asian-boy-abacus-play'],
    filename: 'phep-cong-co-nho-soroban.jpg',
    alt: 'Trẻ em thực hành phép cộng có nhớ trên Soroban cùng bố'
  },
  'phep-tru-don-gian-tren-soroban': {
    image: SOROBAN_IMAGES['abacus-home-setting'],
    filename: 'phep-tru-don-gian-soroban.jpg',
    alt: 'Trẻ em học phép trừ đơn giản trên Soroban tại nhà'
  },
  'phep-tru-co-muon-soroban': {
    image: SOROBAN_IMAGES['kids-abacus-together'],
    filename: 'phep-tru-co-muon-soroban.jpg',
    alt: 'Trẻ em học phép trừ có mượn trên Soroban'
  },
  'phep-nhan-tren-soroban': {
    image: SOROBAN_IMAGES['father-child-abacus'],
    filename: 'phep-nhan-tren-soroban.jpg',
    alt: 'Bố dạy con phép nhân trên Soroban tại nhà'
  },
  'phep-chia-tren-soroban': {
    image: SOROBAN_IMAGES['girl-abacus-floor'],
    filename: 'phep-chia-tren-soroban.jpg',
    alt: 'Trẻ em học phép chia trên Soroban'
  },
  'quy-tac-ban-cua-5-soroban': {
    image: SOROBAN_IMAGES['child-abacus-bed'],
    filename: 'quy-tac-ban-cua-5-soroban.jpg',
    alt: 'Trẻ em học quy tắc bạn của 5 trên Soroban'
  },
  'quy-tac-ban-cua-10-soroban': {
    image: SOROBAN_IMAGES['young-boy-abacus'],
    filename: 'quy-tac-ban-cua-10-soroban.jpg',
    alt: 'Trẻ em học quy tắc bạn của 10 trên Soroban'
  },
  'tinh-nham-soroban-anzan': {
    image: SOROBAN_IMAGES['asian-child-abacus-home'],
    filename: 'tinh-nham-soroban-anzan.jpg',
    alt: 'Trẻ em luyện tính nhẩm Soroban Anzan'
  },
  'soroban-la-gi-vi-sao-phu-hop-voi-tre-tieu-hoc': {
    image: SOROBAN_IMAGES['girl-abacus-learning'],
    filename: 'soroban-la-gi-tre-tieu-hoc.jpg',
    alt: 'Trẻ tiểu học học Soroban - phương pháp phù hợp'
  },
  'soroban-giup-tre-tinh-nham-tot-hon-nhu-the-nao': {
    image: SOROBAN_IMAGES['child-learning-abacus'],
    filename: 'soroban-giup-tinh-nham-tot.jpg',
    alt: 'Soroban giúp trẻ tính nhẩm tốt hơn'
  },
  'soroban-co-that-su-tot-nhu-loi-don': {
    image: SOROBAN_IMAGES['asian-boy-abacus-play'],
    filename: 'soroban-co-tot-nhu-loi-don.jpg',
    alt: 'Gia đình châu Á học Soroban tại nhà'
  },
  'lo-trinh-hoc-soroban-cho-tre': {
    image: SOROBAN_IMAGES['father-child-abacus'],
    filename: 'lo-trinh-hoc-soroban-cho-tre.jpg',
    alt: 'Lộ trình học Soroban cho trẻ cùng phụ huynh'
  },
  'may-tuoi-cho-con-hoc-soroban-la-phu-hop': {
    image: SOROBAN_IMAGES['kids-abacus-together'],
    filename: 'may-tuoi-hoc-soroban-phu-hop.jpg',
    alt: 'Độ tuổi phù hợp cho trẻ học Soroban'
  },
  'hoc-soroban-mat-bao-lau-de-tinh-nham-duoc': {
    image: SOROBAN_IMAGES['girl-abacus-floor'],
    filename: 'hoc-soroban-mat-bao-lau.jpg',
    alt: 'Trẻ em kiên trì học Soroban để tính nhẩm'
  },
  'sai-lam-pho-bien-khi-hoc-soroban': {
    image: SOROBAN_IMAGES['child-abacus-cozy'],
    filename: 'sai-lam-hoc-soroban.jpg',
    alt: 'Tránh sai lầm phổ biến khi học Soroban'
  },
  'lam-sao-biet-con-hoc-soroban-dung-huong': {
    image: SOROBAN_IMAGES['abacus-home-setting'],
    filename: 'con-hoc-soroban-dung-huong.jpg',
    alt: 'Dấu hiệu con học Soroban đúng hướng'
  },
  'hoc-soroban-online-co-phu-hop-cho-phu-huynh-ban-ron': {
    image: SOROBAN_IMAGES['child-abacus-bed'],
    filename: 'hoc-soroban-online-phu-huynh-ban-ron.jpg',
    alt: 'Học Soroban online cho phụ huynh bận rộn'
  },
  'chon-lop-soroban-hay-hoc-online': {
    image: SOROBAN_IMAGES['young-boy-abacus'],
    filename: 'chon-lop-soroban-hay-online.jpg',
    alt: 'Trẻ em học Soroban tại nhà hay lớp học'
  },

  // ===== BÀI VỀ PHỤ HUYNH KÈM CON HỌC TOÁN =====
  'vi-sao-cang-kem-con-hoc-toan-ca-nha-cang-met': {
    image: PARENT_CHILD_STUDY_IMAGES['mother-teaching-daughter'],
    filename: 'phu-huynh-kem-con-hoc-toan-met.jpg',
    alt: 'Phụ huynh châu Á đang kiên nhẫn kèm con học toán'
  },
  'phu-huynh-co-nen-truc-tiep-day-con-hoc-toan-khong': {
    image: PARENT_CHILD_STUDY_IMAGES['father-daughter-homework'],
    filename: 'phu-huynh-day-con-hoc-toan.jpg',
    alt: 'Bố châu Á trực tiếp dạy con học toán tại nhà'
  },
  'dong-hanh-cung-con-hoc-toan-la-gi': {
    image: PARENT_CHILD_STUDY_IMAGES['family-studying-living'],
    filename: 'dong-hanh-cung-con-hoc-toan.jpg',
    alt: 'Gia đình châu Á đồng hành cùng con học toán trong phòng khách'
  },
  'phu-huynh-khong-gioi-toan-co-kem-con-hoc-duoc-khong': {
    image: PARENT_CHILD_STUDY_IMAGES['mother-daughter-studying'],
    filename: 'phu-huynh-khong-gioi-toan-kem-con.jpg',
    alt: 'Mẹ châu Á kèm con học toán dù không giỏi toán'
  },
  'sai-lam-pho-bien-khi-kem-con-hoc-toan': {
    image: PARENT_CHILD_STUDY_IMAGES['father-daughter-kitchen'],
    filename: 'sai-lam-kem-con-hoc-toan.jpg',
    alt: 'Bố châu Á kiên nhẫn kèm con học toán tại nhà'
  },
  '10-phut-moi-ngay-phu-huynh-nen-lam-gi-khi-con-hoc-toan': {
    image: PARENT_CHILD_STUDY_IMAGES['mother-daughter-drawing'],
    filename: '10-phut-moi-ngay-kem-con-hoc-toan.jpg',
    alt: 'Mẹ châu Á dành 10 phút mỗi ngày kèm con học toán'
  },
  'ba-viec-phu-huynh-chi-nen-lam-khi-con-hoc': {
    image: PARENT_CHILD_STUDY_IMAGES['mother-children-reading'],
    filename: 'ba-viec-phu-huynh-nen-lam.jpg',
    alt: 'Mẹ châu Á đọc sách cùng con - việc nên làm khi kèm con học'
  },
  'khi-nao-phu-huynh-nen-dung-cong-cu-ho-tro': {
    image: PARENT_CHILD_STUDY_IMAGES['asian-mother-child-toys'],
    filename: 'phu-huynh-dung-cong-cu-ho-tro.jpg',
    alt: 'Mẹ châu Á dùng công cụ hỗ trợ dạy con học'
  },

  // ===== BÀI VỀ TRẺ GẶP KHÓ KHĂN VỚI TOÁN =====
  'con-so-hoc-toan-phu-huynh-dang-lam-sai-o-dau': {
    image: CHILD_STUDYING_HOME_IMAGES['girl-studying-home'],
    filename: 'con-so-hoc-toan-phu-huynh-lam-sai.jpg',
    alt: 'Trẻ em châu Á lo lắng khi học toán tại nhà'
  },
  'con-so-kiem-tra-toan': {
    image: EMOTION_IMAGES['child-worried-study'],
    filename: 'con-so-kiem-tra-toan.jpg',
    alt: 'Trẻ em châu Á căng thẳng trước bài kiểm tra toán'
  },
  'con-noi-con-ghet-toan-minh-da-phan-ung-sai': {
    image: EMOTION_IMAGES['parent-support'],
    filename: 'con-ghet-toan-phu-huynh-phan-ung.jpg',
    alt: 'Bố động viên con khi con nói ghét toán'
  },
  'con-khong-nghe-loi-khi-bo-me-day-toan': {
    image: PARENT_CHILD_STUDY_IMAGES['mother-children-hugging'],
    filename: 'con-khong-nghe-loi-hoc-toan.jpg',
    alt: 'Mẹ châu Á ôm con - cách xử lý khi con không nghe lời học toán'
  },
  'lam-sao-de-con-hoc-toan-khong-ap-luc': {
    image: EMOTION_IMAGES['happy-family-moment'],
    filename: 'con-hoc-toan-khong-ap-luc.jpg',
    alt: 'Mẹ con châu Á vui vẻ - học toán không áp lực'
  },
  'con-hoc-toan-cham-co-that-la-do-con': {
    image: PARENT_CHILD_STUDY_IMAGES['mother-daughter-coloring'],
    filename: 'con-hoc-toan-cham.jpg',
    alt: 'Mẹ châu Á kiên nhẫn kèm con học - con chậm không do con'
  },
  'con-lam-toan-cham-hon-ban': {
    image: CHILD_STUDYING_HOME_IMAGES['girl-online-classes'],
    filename: 'con-lam-toan-cham-hon-ban.jpg',
    alt: 'Trẻ em châu Á tập trung học toán theo tốc độ riêng'
  },
  'con-hay-quen-bang-cuu-chuong': {
    image: PARENT_CHILD_STUDY_IMAGES['mother-children-work'],
    filename: 'con-quen-bang-cuu-chuong.jpg',
    alt: 'Mẹ châu Á giúp con nhớ bảng cửu chương'
  },
  'con-biet-tinh-nhung-doc-de-khong-hieu': {
    image: CHILD_STUDYING_HOME_IMAGES['child-video-calling'],
    filename: 'con-biet-tinh-nhung-khong-hieu-de.jpg',
    alt: 'Trẻ em châu Á cần hỗ trợ đọc hiểu đề toán'
  },

  // ===== BÀI VỀ HỌC TOÁN NHƯ CHƠI GAME / ONLINE =====
  'hoc-toan-nhu-choi-game-co-thuc-su-hieu-qua': {
    image: EMOTION_IMAGES['joyful-learning'],
    filename: 'hoc-toan-nhu-choi-game.jpg',
    alt: 'Mẹ con châu Á vui vẻ học toán như chơi game'
  },
};

// Danh sách tất cả các bài blog
const ALL_BLOG_POSTS = [
  '10-phut-moi-ngay-phu-huynh-nen-lam-gi-khi-con-hoc-toan',
  'ba-viec-phu-huynh-chi-nen-lam-khi-con-hoc',
  'bieu-dien-so-hang-chuc-tram-soroban',
  'cach-bieu-dien-so-tren-soroban',
  'cach-cam-va-tu-the-hoc-soroban',
  'cau-tao-ban-tinh-soroban',
  'chon-lop-soroban-hay-hoc-online',
  'con-biet-tinh-nhung-doc-de-khong-hieu',
  'con-hay-quen-bang-cuu-chuong',
  'con-hoc-toan-cham-co-that-la-do-con',
  'con-khong-nghe-loi-khi-bo-me-day-toan',
  'con-lam-toan-cham-hon-ban',
  'con-noi-con-ghet-toan-minh-da-phan-ung-sai',
  'con-so-hoc-toan-phu-huynh-dang-lam-sai-o-dau',
  'con-so-kiem-tra-toan',
  'dong-hanh-cung-con-hoc-toan-la-gi',
  'hoc-soroban-mat-bao-lau-de-tinh-nham-duoc',
  'hoc-soroban-online-co-phu-hop-cho-phu-huynh-ban-ron',
  'hoc-toan-nhu-choi-game-co-thuc-su-hieu-qua',
  'khi-nao-phu-huynh-nen-dung-cong-cu-ho-tro',
  'lam-sao-biet-con-hoc-soroban-dung-huong',
  'lam-sao-de-con-hoc-toan-khong-ap-luc',
  'lo-trinh-hoc-soroban-cho-tre',
  'may-tuoi-cho-con-hoc-soroban-la-phu-hop',
  'phep-chia-tren-soroban',
  'phep-cong-co-nho-thuc-hanh-soroban',
  'phep-cong-don-gian-tren-soroban',
  'phep-nhan-tren-soroban',
  'phep-tru-co-muon-soroban',
  'phep-tru-don-gian-tren-soroban',
  'phu-huynh-co-nen-truc-tiep-day-con-hoc-toan-khong',
  'phu-huynh-khong-gioi-toan-co-kem-con-hoc-duoc-khong',
  'quy-tac-ban-cua-10-soroban',
  'quy-tac-ban-cua-5-soroban',
  'sai-lam-pho-bien-khi-hoc-soroban',
  'sai-lam-pho-bien-khi-kem-con-hoc-toan',
  'soroban-co-that-su-tot-nhu-loi-don',
  'soroban-giup-tre-tinh-nham-tot-hon-nhu-the-nao',
  'soroban-la-gi-vi-sao-phu-hop-voi-tre-tieu-hoc',
  'tinh-nham-soroban-anzan',
  'vi-sao-cang-kem-con-hoc-toan-ca-nha-cang-met'
];

// ====================================
// DOWNLOAD FUNCTIONS
// ====================================

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(OUTPUT_DIR, filename);
    
    // Skip if file exists
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  Skip (exists): ${filename}`);
      resolve({ filename, status: 'skipped' });
      return;
    }

    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filename).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }

      const file = fs.createWriteStream(filePath);
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve({ filename, status: 'downloaded' });
      });

      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete partial file
        reject(err);
      });
    });

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function updateBlogJson(slug, imageInfo) {
  const jsonPath = path.join(__dirname, '../content/blog/posts', `${slug}.json`);
  
  try {
    const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    content.image = `/blog/${imageInfo.filename}`;
    content.imageAlt = imageInfo.alt;
    fs.writeFileSync(jsonPath, JSON.stringify(content, null, 2), 'utf8');
    console.log(`📝 Updated JSON: ${slug}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to update JSON ${slug}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Pexels Image Download for Sorokid Blog');
  console.log('=' .repeat(60));
  console.log('📋 Tiêu chí ảnh:');
  console.log('   ✅ Người châu Á (Đông/Đông Nam Á)');
  console.log('   ✅ Ngữ cảnh tại nhà - gia đình');
  console.log('   ✅ Phụ huynh + con học cùng');
  console.log('   ✅ Bài Soroban: có bàn tính abacus');
  console.log('=' .repeat(60));

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = {
    downloaded: 0,
    skipped: 0,
    failed: 0,
    jsonUpdated: 0
  };

  // Process each blog post
  for (const slug of ALL_BLOG_POSTS) {
    const imageInfo = BLOG_IMAGE_MAPPING[slug];
    
    if (!imageInfo) {
      console.log(`⚠️  No mapping for: ${slug}`);
      continue;
    }

    try {
      const downloadResult = await downloadImage(imageInfo.image, imageInfo.filename);
      if (downloadResult.status === 'downloaded') {
        results.downloaded++;
      } else {
        results.skipped++;
      }

      // Update JSON file
      const jsonUpdated = await updateBlogJson(slug, imageInfo);
      if (jsonUpdated) results.jsonUpdated++;

      // Rate limiting - 300ms between requests
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`❌ Failed: ${slug} - ${err.message}`);
      results.failed++;
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`   Downloaded: ${results.downloaded}`);
  console.log(`   Skipped (exists): ${results.skipped}`);
  console.log(`   Failed: ${results.failed}`);
  console.log(`   JSON Updated: ${results.jsonUpdated}`);
  console.log('=' .repeat(60));

  // List unmapped posts
  const unmapped = ALL_BLOG_POSTS.filter(slug => !BLOG_IMAGE_MAPPING[slug]);
  if (unmapped.length > 0) {
    console.log('\n⚠️  Bài chưa có mapping ảnh:');
    unmapped.forEach(slug => console.log(`   - ${slug}`));
  }
}

main().catch(console.error);
