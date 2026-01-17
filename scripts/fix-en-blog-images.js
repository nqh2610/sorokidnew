/**
 * Script để kiểm tra và cập nhật các bài blog EN không có ảnh
 * - Bài có ảnh thật: giữ nguyên status
 * - Bài không có ảnh (dùng default): chuyển sang scheduled với publishedAt trong tương lai
 */

const fs = require('fs');
const path = require('path');

const EN_BLOG_DIR = path.join(__dirname, '../content/blog/posts/en');

// Default/placeholder images
const DEFAULT_IMAGES = [
  '/blog/default-blog.svg',
  '/blog/default-blog-image.jpg',
  '/blog/default-blog-image.png',
];

function isDefaultImage(image) {
  if (!image) return true;
  if (DEFAULT_IMAGES.includes(image)) return true;
  if (image.toLowerCase().includes('default')) return true;
  return false;
}

function generateFutureDate(index) {
  // Spread posts over next 2 months, 1 post every 2 days
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + 7 + (index * 2)); // Start 1 week from now
  return futureDate.toISOString();
}

async function main() {
  const files = fs.readdirSync(EN_BLOG_DIR).filter(f => f.endsWith('.json'));
  
  const noImagePosts = [];
  const hasImagePosts = [];
  
  // First pass: categorize posts
  for (const file of files) {
    const filePath = path.join(EN_BLOG_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (isDefaultImage(content.image)) {
      noImagePosts.push({ file, filePath, content });
    } else {
      hasImagePosts.push({ file, filePath, content });
    }
  }
  
  console.log('='.repeat(60));
  console.log('EN BLOG IMAGE ANALYSIS');
  console.log('='.repeat(60));
  console.log(`\n✅ Posts WITH real images: ${hasImagePosts.length}`);
  console.log(`⚠️  Posts WITHOUT real images: ${noImagePosts.length}`);
  
  // Show posts without images
  console.log('\n--- Posts without real images (will be scheduled) ---');
  noImagePosts.forEach((p, i) => {
    console.log(`  ${i+1}. ${p.file}`);
    console.log(`     Image: ${p.content.image || 'NULL'}`);
    console.log(`     Current status: ${p.content.status}`);
  });
  
  // Show posts with images
  console.log('\n--- Posts with real images (will stay published) ---');
  hasImagePosts.forEach((p, i) => {
    console.log(`  ${i+1}. ${p.file} - ${p.content.status}`);
  });
  
  // Ask for confirmation
  const args = process.argv.slice(2);
  if (!args.includes('--fix')) {
    console.log('\n⚡ Run with --fix to update posts without images to scheduled status');
    return;
  }
  
  // Update posts without images
  console.log('\n🔧 Updating posts without images...');
  
  let updated = 0;
  for (let i = 0; i < noImagePosts.length; i++) {
    const { file, filePath, content } = noImagePosts[i];
    
    // Only update if currently published
    if (content.status === 'published') {
      content.status = 'scheduled';
      content.publishedAt = generateFutureDate(i);
      
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
      console.log(`  ✓ ${file} -> scheduled for ${content.publishedAt.split('T')[0]}`);
      updated++;
    } else {
      console.log(`  - ${file} (already ${content.status})`);
    }
  }
  
  console.log(`\n✅ Updated ${updated} posts to scheduled status`);
}

main().catch(console.error);
