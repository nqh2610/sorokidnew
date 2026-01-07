/**
 * Script reformat lại tất cả JSON files
 * Fix format bị hỏng bởi PowerShell
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
    
    // Fix wrong buttonLink in CTA
    if (json.cta && json.cta.buttonLink && linkFixes[json.cta.buttonLink]) {
      json.cta.buttonLink = linkFixes[json.cta.buttonLink];
    }
    
    // Reformat JSON với indent 2 spaces chuẩn
    const newContent = JSON.stringify(json, null, 2);
    
    // Chỉ ghi lại nếu content khác
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Reformatted: ${fileName}`);
      fixedCount++;
    }
  } catch (err) {
    console.error(`Error processing ${fileName}:`, err.message);
  }
});

console.log(`\nTotal reformatted: ${fixedCount} files`);
