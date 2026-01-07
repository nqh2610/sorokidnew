/**
 * Script chuyển đổi CTA từ title/description sang text
 * Để tương thích với code cũ trên host
 * FIX ENCODING cho tiếng Việt
 */

const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../content/blog/posts');

// Đọc tất cả file JSON
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));

// Map sửa link sai
const linkFixes = {
  "/tool/lucky-light": "/tool/den-may-man",
  "/tool/timer": "/tool/dong-ho-bam-gio",
  "/tool/flash-anzan": "/tool/flash-zan",
  "/tool/random-picker": "/tool/boc-tham"
};

let fixedCount = 0;

files.forEach(fileName => {
  const filePath = path.join(postsDir, fileName);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    
    let changed = false;
    
    // Fix CTA format: title/description -> text
    if (json.cta) {
      if (json.cta.title || json.cta.description) {
        let newText = '';
        if (json.cta.title) {
          newText = json.cta.title;
        }
        if (json.cta.description) {
          if (newText) newText += ' - ';
          newText += json.cta.description;
        }
        
        // Tạo CTA mới với thứ tự key đúng
        const newCta = {
          text: newText,
          buttonText: json.cta.buttonText,
          buttonLink: json.cta.buttonLink
        };
        json.cta = newCta;
        changed = true;
      }
      
      // Fix wrong buttonLink
      if (json.cta.buttonLink && linkFixes[json.cta.buttonLink]) {
        json.cta.buttonLink = linkFixes[json.cta.buttonLink];
        changed = true;
      }
    }
    
    if (changed) {
      // Sử dụng JSON.stringify với indent 2 spaces để format đẹp
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`Fixed: ${fileName}`);
      fixedCount++;
    }
  } catch (err) {
    console.error(`Error processing ${fileName}:`, err.message);
  }
});

console.log(`\nTotal fixed: ${fixedCount} files`);
