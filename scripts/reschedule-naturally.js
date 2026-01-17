/**
 * 📅 RESCHEDULE BLOG POSTS - Natural Distribution
 * 
 * Phân bổ lại tất cả bài posts với lịch tự nhiên:
 * - Không publish quá nhiều bài cùng ngày
 * - Xen kẽ chủ đề
 * - Publish vào giờ làm việc (8h-22h)
 * - Tránh dồn bài vào cuối tuần
 * 
 * Usage: node scripts/reschedule-naturally.js
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR_VI = path.join(__dirname, '..', 'content', 'blog', 'posts');
const POSTS_DIR_EN = path.join(__dirname, '..', 'content', 'blog', 'posts', 'en');

// Starting from today (Jan 17, 2025)
const START_DATE = new Date('2025-01-17');

// Config
const POSTS_PER_DAY_MIN = 1;
const POSTS_PER_DAY_MAX = 3;
const WEEKEND_PROBABILITY = 0.3; // 30% chance of posting on weekend

function getAllJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.json') && !file.includes('categories'))
    .map(file => path.join(dir, file));
}

function readPost(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

function writePost(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function getRandomTime() {
  const hour = 8 + Math.floor(Math.random() * 14); // 8-22h
  const minute = Math.floor(Math.random() * 60);
  return { hour, minute };
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function main() {
  console.log('📅 Rescheduling blog posts naturally...\n');

  // Collect all posts
  const allPosts = [];
  
  // VI posts
  for (const filePath of getAllJsonFiles(POSTS_DIR_VI)) {
    const post = readPost(filePath);
    if (post && post.status === 'published') {
      allPosts.push({ filePath, post, locale: 'vi' });
    }
  }
  
  // EN posts
  for (const filePath of getAllJsonFiles(POSTS_DIR_EN)) {
    const post = readPost(filePath);
    if (post && post.status === 'published') {
      allPosts.push({ filePath, post, locale: 'en' });
    }
  }

  console.log(`Found ${allPosts.length} published posts`);
  console.log(`  - VI: ${allPosts.filter(p => p.locale === 'vi').length}`);
  console.log(`  - EN: ${allPosts.filter(p => p.locale === 'en').length}\n`);

  // Shuffle to mix VI and EN
  const shuffled = shuffleArray(allPosts);

  // Schedule posts
  let currentDate = new Date(START_DATE);
  let postsToday = 0;
  let maxPostsToday = POSTS_PER_DAY_MIN + Math.floor(Math.random() * (POSTS_PER_DAY_MAX - POSTS_PER_DAY_MIN + 1));

  for (let i = 0; i < shuffled.length; i++) {
    const item = shuffled[i];
    
    // Move to next day if needed
    if (postsToday >= maxPostsToday) {
      currentDate.setDate(currentDate.getDate() + 1);
      postsToday = 0;
      maxPostsToday = POSTS_PER_DAY_MIN + Math.floor(Math.random() * (POSTS_PER_DAY_MAX - POSTS_PER_DAY_MIN + 1));
      
      // Skip weekends sometimes
      if (isWeekend(currentDate) && Math.random() > WEEKEND_PROBABILITY) {
        // Skip to Monday
        const day = currentDate.getDay();
        currentDate.setDate(currentDate.getDate() + (day === 0 ? 1 : 2));
      }
    }

    // Random time
    const { hour, minute } = getRandomTime();
    const publishDate = new Date(currentDate);
    publishDate.setHours(hour, minute, Math.floor(Math.random() * 60), 0);

    // Update post
    item.post.publishedAt = publishDate.toISOString();
    
    // Also update schema.datePublished if exists
    if (item.post.schema && item.post.schema.datePublished !== undefined) {
      item.post.schema.datePublished = publishDate.toISOString().split('T')[0];
    }
    
    // Ensure status is published
    item.post.status = 'published';

    // Save
    writePost(item.filePath, item.post);
    postsToday++;

    const dateStr = publishDate.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    if (i < 10 || i >= shuffled.length - 5) {
      console.log(`[${item.locale.toUpperCase()}] ${item.post.slug.substring(0, 40)}... → ${dateStr}`);
    } else if (i === 10) {
      console.log('...');
    }
  }

  // Summary
  const firstDate = new Date(shuffled[0].post.publishedAt);
  const lastDate = new Date(shuffled[shuffled.length - 1].post.publishedAt);
  const days = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));

  console.log(`\n📊 Summary:`);
  console.log(`   Total posts scheduled: ${shuffled.length}`);
  console.log(`   First post: ${firstDate.toLocaleDateString('vi-VN')}`);
  console.log(`   Last post: ${lastDate.toLocaleDateString('vi-VN')}`);
  console.log(`   Duration: ${days} days (~${Math.round(days / 30)} months)`);
  console.log(`   Average: ${(shuffled.length / days).toFixed(1)} posts/day`);
  console.log(`\n✅ Done! All posts have been rescheduled naturally.`);
}

main();
