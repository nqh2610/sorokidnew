/**
 * Script chuyển đổi blog từ format mới sang format cũ
 * Format mới: { title, content (string với markdown) }
 * Format cũ: { type, text/items/level... }
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog', 'posts');

// Danh sách 20 file cần chuyển đổi
const FILES_TO_CONVERT = [
  'ai-la-trieu-phu-game-show-kiem-tra-kien-thuc-trong-lop.json',
  'bi-quyet-thi-giao-vien-day-gioi-cap-huyen-tinh.json',
  'boc-tham-kiem-tra-mieng-cong-bang-cho-tat-ca.json',
  'cong-cu-day-hoc-khien-ban-giam-hieu-bat-ngo-khi-du-gio.json',
  'cuoc-dua-ki-thu-bien-lop-hoc-thanh-duong-dua.json',
  'den-may-man-cuoi-tiet-game-thuong-phat-hoc-sinh-thich.json',
  'dong-ho-bam-gio-may-chieu-cong-cu-quan-ly-thoi-gian.json',
  'dua-thu-hoat-hinh-game-dua-ngua-tao-dong-luc-hoc-tap.json',
  'flash-zan-5-phut-dau-gio-luyen-tinh-nham-nhanh.json',
  'hoat-dong-ice-breaker-pha-bang-khoi-dong-lop-hoc.json',
  'hoc-qua-du-an-pbl-huong-dan-thuc-hanh-cho-giao-vien.json',
  'hoc-sinh-hoi-co-choi-game-khong-va-cau-tra-loi.json',
  'kinh-nghiem-day-thao-giang-thanh-cong-tu-giao-vien-20-nam.json',
  'ky-thuat-brainstorming-dong-nao-trong-lop-hoc.json',
  'ky-thuat-kwl-biet-muon-biet-da-hoc-trong-lop.json',
  'lop-hoc-dao-nguoc-flipped-classroom-huong-dan-thuc-te.json',
  'tiet-du-gio-dau-tien-cam-xuc-va-bai-hoc.json',
  'tro-choi-o-chu-cong-cu-tao-crossword-cho-lop-hoc.json',
  'tu-tiet-thao-giang-that-bai-den-bai-hoc-quy-gia.json',
  'xuc-xac-3d-cong-cu-random-vui-nhon-trong-lop-hoc.json'
];

/**
 * Kiểm tra xem section có phải format mới không
 * Format mới có "title" và "content" (string)
 */
function isNewFormat(section) {
  return typeof section.title === 'string' && typeof section.content === 'string';
}

/**
 * Chuyển đổi một section từ format mới sang format cũ
 */
function convertSection(section) {
  if (!isNewFormat(section)) {
    // Đã là format cũ rồi, giữ nguyên
    return [section];
  }

  const result = [];

  // Thêm heading từ title
  result.push({
    type: 'heading',
    level: 2,
    text: section.title
  });

  // Parse content string
  const content = section.content;
  
  // Tách theo đoạn (2 dòng trống hoặc \n\n)
  const blocks = content.split(/\n\n+/);
  
  let currentListItems = [];
  
  for (let block of blocks) {
    block = block.trim();
    if (!block) continue;

    // Kiểm tra xem block có phải là list không
    const lines = block.split('\n');
    const listLines = [];
    const nonListLines = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        // Đây là một list item
        listLines.push(trimmedLine.substring(2).trim());
      } else if (trimmedLine) {
        // Không phải list item
        nonListLines.push(trimmedLine);
      }
    }

    // Nếu có non-list lines trước list, xử lý chúng
    if (nonListLines.length > 0 && listLines.length > 0) {
      // Có cả paragraph và list trong cùng block
      // Tách ra thành paragraph và list riêng
      result.push({
        type: 'paragraph',
        text: nonListLines.join(' ')
      });
      result.push({
        type: 'list',
        items: listLines
      });
    } else if (listLines.length > 0) {
      // Chỉ có list
      result.push({
        type: 'list',
        items: listLines
      });
    } else if (nonListLines.length > 0) {
      // Chỉ có paragraph
      result.push({
        type: 'paragraph',
        text: nonListLines.join('\n')
      });
    }
  }

  return result;
}

/**
 * Chuyển đổi toàn bộ sections của một blog post
 */
function convertSections(sections) {
  const result = [];
  
  for (const section of sections) {
    const converted = convertSection(section);
    result.push(...converted);
  }
  
  return result;
}

/**
 * Xử lý một file
 */
function processFile(filename) {
  const filePath = path.join(BLOG_DIR, filename);
  
  try {
    // Đọc file
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Kiểm tra xem có sections không
    if (!data.content || !data.content.sections) {
      console.log(`⏭️  ${filename}: Không có sections, bỏ qua`);
      return { status: 'skipped', reason: 'no sections' };
    }
    
    // Kiểm tra format
    const firstSection = data.content.sections[0];
    if (!firstSection) {
      console.log(`⏭️  ${filename}: Sections rỗng, bỏ qua`);
      return { status: 'skipped', reason: 'empty sections' };
    }
    
    if (!isNewFormat(firstSection)) {
      console.log(`⏭️  ${filename}: Đã là format cũ, bỏ qua`);
      return { status: 'skipped', reason: 'already old format' };
    }
    
    // Chuyển đổi
    console.log(`🔄 ${filename}: Đang chuyển đổi...`);
    const originalSectionsCount = data.content.sections.length;
    data.content.sections = convertSections(data.content.sections);
    const newSectionsCount = data.content.sections.length;
    
    // Ghi file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ ${filename}: Chuyển đổi thành công (${originalSectionsCount} sections → ${newSectionsCount} items)`);
    return { 
      status: 'converted', 
      originalSections: originalSectionsCount,
      newItems: newSectionsCount
    };
    
  } catch (error) {
    console.error(`❌ ${filename}: Lỗi - ${error.message}`);
    return { status: 'error', error: error.message };
  }
}

// Main
console.log('='.repeat(60));
console.log('CHUYỂN ĐỔI BLOG FORMAT MỚI → FORMAT CŨ');
console.log('='.repeat(60));
console.log(`Thư mục: ${BLOG_DIR}`);
console.log(`Số file cần xử lý: ${FILES_TO_CONVERT.length}`);
console.log('='.repeat(60));

const results = {
  converted: 0,
  skipped: 0,
  error: 0
};

for (const filename of FILES_TO_CONVERT) {
  const result = processFile(filename);
  results[result.status]++;
}

console.log('='.repeat(60));
console.log('KẾT QUẢ:');
console.log(`✅ Đã chuyển đổi: ${results.converted} file`);
console.log(`⏭️  Bỏ qua: ${results.skipped} file`);
console.log(`❌ Lỗi: ${results.error} file`);
console.log('='.repeat(60));
