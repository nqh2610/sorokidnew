/**
 * Script để cân bằng bài blog EN:
 * - Mỗi category chỉ published 5 bài có ảnh thật
 * - Còn lại scheduled để publish tự động sau
 */

const fs = require('fs');
const path = require('path');

const EN_BLOG_DIR = path.join(__dirname, '../content/blog/posts/en');
const POSTS_PER_CATEGORY = 5; // Số bài published mỗi category

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
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + 3 + (index * 2)); // Start 3 days from now, 1 post every 2 days
  return futureDate.toISOString();
}

async function main() {
  const files = fs.readdirSync(EN_BLOG_DIR).filter(f => f.endsWith('.json'));
  
  // Group posts by category
  const byCategory = {};
  const noImagePosts = [];
  
  for (const file of files) {
    const filePath = path.join(EN_BLOG_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const category = content.category || 'uncategorized';
    
    if (!byCategory[category]) {
      byCategory[category] = { withImage: [], noImage: [] };
    }
    
    if (isDefaultImage(content.image)) {
      byCategory[category].noImage.push({ file, filePath, content });
      noImagePosts.push({ file, filePath, content, category });
    } else {
      byCategory[category].withImage.push({ file, filePath, content });
    }
  }
  
  console.log('='.repeat(60));
  console.log('EN BLOG CATEGORY ANALYSIS');
  console.log('='.repeat(60));
  
  // Show stats per category
  for (const [cat, posts] of Object.entries(byCategory)) {
    console.log(`\n📂 ${cat}:`);
    console.log(`   With image: ${posts.withImage.length}`);
    console.log(`   No image: ${posts.noImage.length}`);
  }
  
  // Check for --fix flag
  const args = process.argv.slice(2);
  if (!args.includes('--fix')) {
    console.log('\n⚡ Run with --fix to balance categories (5 published per category)');
    return;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('BALANCING CATEGORIES');
  console.log('='.repeat(60));
  
  let totalPublished = 0;
  let totalScheduled = 0;
  let scheduleIndex = 0;
  
  for (const [cat, posts] of Object.entries(byCategory)) {
    console.log(`\n📂 ${cat}:`);
    
    // Sort posts with images by publishedAt (newest first) or title
    posts.withImage.sort((a, b) => {
      const dateA = new Date(a.content.publishedAt || 0);
      const dateB = new Date(b.content.publishedAt || 0);
      return dateB - dateA;
    });
    
    // Keep only first POSTS_PER_CATEGORY as published
    const toPublish = posts.withImage.slice(0, POSTS_PER_CATEGORY);
    const toSchedule = posts.withImage.slice(POSTS_PER_CATEGORY);
    
    // Mark first N as published
    for (const post of toPublish) {
      if (post.content.status !== 'published') {
        post.content.status = 'published';
        fs.writeFileSync(post.filePath, JSON.stringify(post.content, null, 2), 'utf-8');
      }
      console.log(`   ✅ ${post.file.substring(0, 50)}... [PUBLISHED]`);
      totalPublished++;
    }
    
    // Schedule the rest with images
    for (const post of toSchedule) {
      post.content.status = 'scheduled';
      post.content.publishedAt = generateFutureDate(scheduleIndex++);
      fs.writeFileSync(post.filePath, JSON.stringify(post.content, null, 2), 'utf-8');
      console.log(`   📅 ${post.file.substring(0, 50)}... -> ${post.content.publishedAt.split('T')[0]}`);
      totalScheduled++;
    }
    
    // Schedule posts without images (later dates)
    for (const post of posts.noImage) {
      post.content.status = 'scheduled';
      post.content.publishedAt = generateFutureDate(scheduleIndex++);
      fs.writeFileSync(post.filePath, JSON.stringify(post.content, null, 2), 'utf-8');
      console.log(`   📅 ${post.file.substring(0, 50)}... -> ${post.content.publishedAt.split('T')[0]} (no image)`);
      totalScheduled++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Total Published: ${totalPublished} (${POSTS_PER_CATEGORY} per category)`);
  console.log(`📅 Total Scheduled: ${totalScheduled}`);
}

main().catch(console.error);
