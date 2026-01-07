/**
 * Script chuyển đổi CTA từ title/description sang text
 * Để tương thích với code cũ trên host
 */

const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../content/blog/posts');

// Danh sách file cần sửa
const filesToFix = [
  "ai-la-trieu-phu-game-show-kiem-tra-kien-thuc-trong-lop.json",
  "bi-quyet-thi-giao-vien-day-gioi-cap-huyen-tinh.json",
  "boc-tham-kiem-tra-mieng-cong-bang-cho-tat-ca.json",
  "cong-cu-day-hoc-khien-ban-giam-hieu-bat-ngo-khi-du-gio.json",
  "cuoc-dua-ki-thu-bien-lop-hoc-thanh-duong-dua.json",
  "den-may-man-cuoi-tiet-game-thuong-phat-hoc-sinh-thich.json",
  "dong-ho-bam-gio-may-chieu-cong-cu-quan-ly-thoi-gian.json",
  "dua-thu-hoat-hinh-game-dua-ngua-tao-dong-luc-hoc-tap.json",
  "flash-zan-5-phut-dau-gio-luyen-tinh-nham-nhanh.json",
  "hoat-dong-ice-breaker-pha-bang-khoi-dong-lop-hoc.json",
  "hoc-qua-du-an-pbl-huong-dan-thuc-hanh-cho-giao-vien.json",
  "hoc-sinh-hoi-co-choi-game-khong-va-cau-tra-loi.json",
  "kinh-nghiem-day-thao-giang-thanh-cong-tu-giao-vien-20-nam.json",
  "ky-thuat-brainstorming-dong-nao-trong-lop-hoc.json",
  "ky-thuat-kwl-biet-muon-biet-da-hoc-trong-lop.json",
  "lop-hoc-dao-nguoc-flipped-classroom-huong-dan-thuc-te.json",
  "tiet-du-gio-dau-tien-cam-xuc-va-bai-hoc.json",
  "tro-choi-o-chu-cong-cu-tao-crossword-cho-lop-hoc.json",
  "tu-tiet-thao-giang-that-bai-den-bai-hoc-quy-gia.json",
  "xuc-xac-3d-cong-cu-random-vui-nhon-trong-lop-hoc.json"
];

// Map sửa link sai
const linkFixes = {
  "/tool/lucky-light": "/tool/den-may-man",
  "/tool/timer": "/tool/dong-ho-bam-gio",
  "/tool/flash-anzan": "/tool/flash-zan",
  "/tool/random-picker": "/tool/boc-tham"
};

let fixedCount = 0;

filesToFix.forEach(fileName => {
  const filePath = path.join(postsDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Skip (not found): ${fileName}`);
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    
    let changed = false;
    
    // Fix CTA format: title/description -> text
    if (json.cta && (json.cta.title || json.cta.description)) {
      let newText = '';
      if (json.cta.title) {
        newText = json.cta.title;
      }
      if (json.cta.description) {
        if (newText) newText += ' - ';
        newText += json.cta.description;
      }
      
      json.cta.text = newText;
      delete json.cta.title;
      delete json.cta.description;
      changed = true;
    }
    
    // Fix wrong buttonLink
    if (json.cta && json.cta.buttonLink && linkFixes[json.cta.buttonLink]) {
      json.cta.buttonLink = linkFixes[json.cta.buttonLink];
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`Fixed: ${fileName}`);
      fixedCount++;
    } else {
      console.log(`No changes: ${fileName}`);
    }
  } catch (err) {
    console.error(`Error processing ${fileName}:`, err.message);
  }
});

console.log(`\nTotal fixed: ${fixedCount} files`);
