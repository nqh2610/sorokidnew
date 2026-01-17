/**
 * 📅 SCHEDULE BLOG POSTS
 * 
 * Tự động lên lịch publish cho tất cả bài draft
 * - Phân bổ đều trong 3-4 tháng
 * - Không publish quá 2 bài/ngày
 * - Tự nhiên: không publish vào cùng giờ
 * - Xen kẽ VI và EN
 * 
 * Usage: node scripts/schedule-posts.js
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR_VI = path.join(__dirname, '..', 'content', 'blog', 'posts');
const POSTS_DIR_EN = path.join(__dirname, '..', 'content', 'blog', 'posts', 'en');

// Configuration
const START_DATE = new Date('2025-01-17'); // Ngày bắt đầu (hôm nay)
const MAX_POSTS_PER_DAY = 2; // Tối đa 2 bài/ngày để tự nhiên
const MIN_HOURS_BETWEEN = 6; // Tối thiểu 6 giờ giữa các bài

/**
 * Đọc tất cả file JSON trong một thư mục
 */
function getAllJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.json') && !file.includes('categories'))
    .map(file => ({
      path: path.join(dir, file),
      filename: file
    }));
}

/**
 * Đọc và parse file JSON
 */
function readPost(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    // Silently skip invalid JSON files
    return null;
  }
}

/**
 * Ghi file JSON với formatting đẹp
 */
function writePost(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Tạo ngày publish ngẫu nhiên trong ngày (8h-22h)
 */
function getRandomTimeInDay(date) {
  const hour = 8 + Math.floor(Math.random() * 14); // 8-22h
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  
  const result = new Date(date);
  result.setHours(hour, minute, second, 0);
  return result;
}

/**
 * Tạo lịch publish tự nhiên
 */
function generatePublishSchedule(draftCount) {
  const schedule = [];
  let currentDate = new Date(START_DATE);
  let postsToday = 0;
  let lastPostTime = null;
  
  for (let i = 0; i < draftCount; i++) {
    // Reset nếu sang ngày mới
    if (postsToday >= MAX_POSTS_PER_DAY) {
      currentDate.setDate(currentDate.getDate() + 1);
      postsToday = 0;
      lastPostTime = null;
    }
    
    // Bỏ qua một số ngày ngẫu nhiên (1-20% ngày không có bài)
    if (Math.random() < 0.15 && postsToday === 0) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Tạo thời gian publish
    let publishTime = getRandomTimeInDay(currentDate);
    
    // Đảm bảo cách nhau ít nhất MIN_HOURS_BETWEEN
    if (lastPostTime) {
      const minNextTime = new Date(lastPostTime.getTime() + MIN_HOURS_BETWEEN * 60 * 60 * 1000);
      if (publishTime < minNextTime) {
        publishTime = getRandomTimeInDay(currentDate);
        publishTime.setHours(Math.max(publishTime.getHours(), minNextTime.getHours() + 1));
      }
    }
    
    schedule.push(publishTime.toISOString());
    lastPostTime = publishTime;
    postsToday++;
  }
  
  return schedule;
}

/**
 * Main function
 */
function main() {
  console.log('📅 Scheduling blog posts...\n');
  
  // Get all draft posts
  const viFiles = getAllJsonFiles(POSTS_DIR_VI);
  const enFiles = getAllJsonFiles(POSTS_DIR_EN);
  
  const drafts = [];
  
  // Collect VI drafts
  for (const file of viFiles) {
    const post = readPost(file.path);
    if (post && post.status === 'draft') {
      drafts.push({ ...file, post, locale: 'vi' });
    }
  }
  
  // Collect EN drafts
  for (const file of enFiles) {
    const post = readPost(file.path);
    if (post && post.status === 'draft') {
      drafts.push({ ...file, post, locale: 'en' });
    }
  }
  
  console.log(`Found ${drafts.length} draft posts:`);
  console.log(`  - VI: ${drafts.filter(d => d.locale === 'vi').length}`);
  console.log(`  - EN: ${drafts.filter(d => d.locale === 'en').length}`);
  console.log('');
  
  if (drafts.length === 0) {
    console.log('No draft posts found.');
    return;
  }
  
  // Shuffle để xen kẽ VI và EN
  // Ưu tiên các cặp VI-EN nếu có translations
  drafts.sort(() => Math.random() - 0.5);
  
  // Generate schedule
  const schedule = generatePublishSchedule(drafts.length);
  
  // Apply schedule to drafts
  let updated = 0;
  for (let i = 0; i < drafts.length; i++) {
    const draft = drafts[i];
    const publishDate = schedule[i];
    
    // Update post
    draft.post.status = 'published';
    draft.post.publishedAt = publishDate;
    
    // Write back
    writePost(draft.path, draft.post);
    updated++;
    
    const dateStr = new Date(publishDate).toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log(`✅ [${draft.locale.toUpperCase()}] ${draft.post.slug}`);
    console.log(`   📅 ${dateStr}`);
  }
  
  console.log(`\n🎉 Scheduled ${updated} posts!`);
  
  // Summary
  const firstDate = new Date(schedule[0]);
  const lastDate = new Date(schedule[schedule.length - 1]);
  const daysDiff = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));
  
  console.log(`\n📊 Summary:`);
  console.log(`   First post: ${firstDate.toLocaleDateString('vi-VN')}`);
  console.log(`   Last post: ${lastDate.toLocaleDateString('vi-VN')}`);
  console.log(`   Duration: ${daysDiff} days (~${Math.round(daysDiff / 30)} months)`);
  console.log(`   Average: ${(drafts.length / daysDiff).toFixed(1)} posts/day`);
}

main();
