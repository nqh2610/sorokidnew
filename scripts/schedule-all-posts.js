/**
 * Script để lên lịch publish blog posts với tốc độ 5 bài/ngày
 * - Xen kẽ bài VI và EN (3 VI + 2 EN mỗi ngày)
 * - Tránh spam: 5 bài/ngày là mức an toàn với Google
 */

const fs = require('fs');
const path = require('path');

const VI_BLOG_DIR = path.join(__dirname, '../content/blog/posts');
const EN_BLOG_DIR = path.join(__dirname, '../content/blog/posts/en');
const POSTS_PER_DAY = 5;

function generateScheduleDate(dayOffset) {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + dayOffset);
  // Random hour between 8-20 for natural publishing
  futureDate.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);
  return futureDate.toISOString();
}

async function main() {
  const now = new Date();
  
  // Get VI posts with future publishedAt (these need rescheduling)
  const viFiles = fs.readdirSync(VI_BLOG_DIR)
    .filter(f => f.endsWith('.json') && !f.endsWith('.en.json'));
  
  const viScheduled = [];
  for (const file of viFiles) {
    const filePath = path.join(VI_BLOG_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const pubDate = new Date(content.publishedAt);
    // Include posts with future publishedAt date
    if (pubDate > now) {
      viScheduled.push({ file, filePath, content, lang: 'VI' });
    }
  }
  
  // Get EN scheduled posts
  const enFiles = fs.readdirSync(EN_BLOG_DIR).filter(f => f.endsWith('.json'));
  
  const enScheduled = [];
  for (const file of enFiles) {
    const filePath = path.join(EN_BLOG_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (content.status === 'scheduled') {
      enScheduled.push({ file, filePath, content, lang: 'EN' });
    }
  }
  
  console.log('='.repeat(60));
  console.log('BLOG SCHEDULING - 5 POSTS/DAY');
  console.log('='.repeat(60));
  console.log(`\nVI Scheduled: ${viScheduled.length}`);
  console.log(`EN Scheduled: ${enScheduled.length}`);
  console.log(`Total: ${viScheduled.length + enScheduled.length}`);
  
  const totalPosts = viScheduled.length + enScheduled.length;
  const totalDays = Math.ceil(totalPosts / POSTS_PER_DAY);
  
  console.log(`\nAt ${POSTS_PER_DAY} posts/day = ${totalDays} days (~${Math.ceil(totalDays/30)} months)`);
  
  // Check for --fix flag
  const args = process.argv.slice(2);
  if (!args.includes('--fix')) {
    console.log('\n⚡ Run with --fix to update schedule');
    return;
  }
  
  // Merge and interleave posts (alternate VI/EN)
  const allPosts = [];
  let viIdx = 0, enIdx = 0;
  
  while (viIdx < viScheduled.length || enIdx < enScheduled.length) {
    // Add 3 VI posts
    for (let i = 0; i < 3 && viIdx < viScheduled.length; i++) {
      allPosts.push(viScheduled[viIdx++]);
    }
    // Add 2 EN posts
    for (let i = 0; i < 2 && enIdx < enScheduled.length; i++) {
      allPosts.push(enScheduled[enIdx++]);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('UPDATING SCHEDULE');
  console.log('='.repeat(60));
  
  let currentDay = 1;
  let postsToday = 0;
  
  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i];
    
    if (postsToday >= POSTS_PER_DAY) {
      currentDay++;
      postsToday = 0;
    }
    
    post.content.publishedAt = generateScheduleDate(currentDay);
    fs.writeFileSync(post.filePath, JSON.stringify(post.content, null, 2), 'utf-8');
    
    postsToday++;
    
    if (i < 15 || i >= allPosts.length - 5) {
      const date = post.content.publishedAt.split('T')[0];
      console.log(`  Day ${currentDay} [${post.lang}]: ${post.file.substring(0, 45)}... -> ${date}`);
    } else if (i === 15) {
      console.log(`  ... (${allPosts.length - 20} more posts) ...`);
    }
  }
  
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + currentDay);
  
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Scheduled ${allPosts.length} posts`);
  console.log(`📅 ${POSTS_PER_DAY} posts/day`);
  console.log(`⏱️  Duration: ${currentDay} days`);
  console.log(`🏁 End date: ${endDate.toISOString().split('T')[0]}`);
}

main().catch(console.error);
