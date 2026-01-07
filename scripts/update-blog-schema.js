/**
 * Script cập nhật schema JSON cho blog
 * Thêm fields: status, publishedAt, createdAt
 * 
 * Quy tắc:
 * - Nếu đã có publishedAt -> status = "published"
 * - Nếu chưa có publishedAt -> status = "draft", publishedAt = null
 * - createdAt = ngày hiện tại nếu chưa có
 */

const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '..', 'content', 'blog', 'posts');

function updateBlogSchema() {
  console.log('📝 Cập nhật schema cho blog posts...\n');
  
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  let updated = 0;
  let skipped = 0;
  
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let changed = false;
      
      // Thêm createdAt nếu chưa có
      if (!content.createdAt) {
        content.createdAt = today;
        changed = true;
      }
      
      // Thêm status dựa trên publishedAt
      if (!content.status) {
        if (content.publishedAt) {
          content.status = 'published';
        } else {
          content.status = 'draft';
          content.publishedAt = null;
        }
        changed = true;
      }
      
      // Đảm bảo publishedAt là null nếu status = draft
      if (content.status === 'draft' && content.publishedAt) {
        content.publishedAt = null;
        changed = true;
      }
      
      if (changed) {
        // Sắp xếp lại thứ tự fields cho dễ đọc
        const orderedContent = {
          slug: content.slug,
          title: content.title,
          description: content.description,
          category: content.category,
          keywords: content.keywords,
          status: content.status,
          publishedAt: content.publishedAt,
          createdAt: content.createdAt,
          image: content.image,
          readingTime: content.readingTime,
          content: content.content,
          faq: content.faq,
          cta: content.cta,
        };
        
        // Loại bỏ undefined
        Object.keys(orderedContent).forEach(key => {
          if (orderedContent[key] === undefined) {
            delete orderedContent[key];
          }
        });
        
        fs.writeFileSync(filePath, JSON.stringify(orderedContent, null, 2), 'utf8');
        console.log(`✅ ${file} -> status: ${content.status}`);
        updated++;
      } else {
        console.log(`⏭️  ${file} -> đã có schema`);
        skipped++;
      }
    } catch (err) {
      console.log(`❌ ${file}: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Kết quả: ${updated} cập nhật, ${skipped} bỏ qua`);
}

updateBlogSchema();
