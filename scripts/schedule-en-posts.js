/**
 * 📅 SCHEDULE EN POSTS - Keep some public, schedule rest for future
 * 
 * - Keep ~15 high-quality EN posts public (publishedAt in past)
 * - Schedule remaining EN posts: 4-5 posts/day (~1 month total)
 * - This is safe for SEO - quality content at reasonable pace
 * 
 * Usage: node scripts/schedule-en-posts.js
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR_EN = path.join(__dirname, '..', 'content', 'blog', 'posts', 'en');

// Posts to keep public NOW (high-quality, proper English slugs)
const KEEP_PUBLIC = [
  // Soroban basics
  'what-is-soroban.json',
  'best-age-to-start-soroban.json',
  'how-soroban-builds-mental-math.json',
  'is-soroban-good-for-brain.json',
  'soroban-learning-roadmap-for-kids.json',
  
  // Parent concerns
  'my-child-is-afraid-of-math.json',
  'my-child-says-they-hate-math.json',
  'child-counts-on-fingers-is-it-bad.json',
  'learning-math-without-tears.json',
  'building-math-habits-for-kids.json',
  
  // Comparisons & decisions
  'kumon-vs-soroban-which-to-choose.json',
  'soroban-center-or-online-app.json',
  
  // Practical guides  
  'how-to-read-numbers-on-soroban.json',
  'simple-addition-on-soroban.json',
  'common-mistakes-learning-soroban.json',
];

// Start scheduling from tomorrow
const START_DATE = new Date('2026-01-18');
const POSTS_PER_DAY = 5; // 4-5 posts/day is safe for quality blogs

function readPost(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return null;
  }
}

function writePost(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function getRandomTime() {
  const hour = 8 + Math.floor(Math.random() * 14);
  const minute = Math.floor(Math.random() * 60);
  return { hour, minute };
}

function main() {
  console.log('📅 Scheduling EN blog posts...\n');

  const files = fs.readdirSync(POSTS_DIR_EN)
    .filter(f => f.endsWith('.json'));

  const toSchedule = [];
  let keptPublic = 0;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR_EN, file);
    const post = readPost(filePath);
    if (!post) continue;

    if (KEEP_PUBLIC.includes(file)) {
      // Keep with past date (already public)
      console.log(`✅ KEEP PUBLIC: ${file}`);
      keptPublic++;
    } else {
      toSchedule.push({ filePath, post, file });
    }
  }

  console.log(`\n📊 Keeping ${keptPublic} posts public`);
  console.log(`📅 Scheduling ${toSchedule.length} posts for future\n`);

  // Shuffle for variety
  toSchedule.sort(() => Math.random() - 0.5);

  // Schedule: 4-5 posts per day (~1 month total)
  let currentDate = new Date(START_DATE);
  let postsToday = 0;

  for (const item of toSchedule) {
    if (postsToday >= POSTS_PER_DAY) {
      currentDate.setDate(currentDate.getDate() + 1);
      postsToday = 0;
    }

    const { hour, minute } = getRandomTime();
    const publishDate = new Date(currentDate);
    publishDate.setHours(hour, minute, Math.floor(Math.random() * 60), 0);

    item.post.publishedAt = publishDate.toISOString();
    item.post.status = 'published';
    
    if (item.post.schema) {
      item.post.schema.datePublished = publishDate.toISOString().split('T')[0];
    }

    writePost(item.filePath, item.post);
    postsToday++;
  }

  // Summary
  const lastDate = new Date(toSchedule[toSchedule.length - 1].post.publishedAt);
  const days = Math.ceil((lastDate - START_DATE) / (1000 * 60 * 60 * 24));

  console.log(`📊 Summary:`);
  console.log(`   Public now: ${keptPublic} posts`);
  console.log(`   Scheduled: ${toSchedule.length} posts`);
  console.log(`   First scheduled: ${START_DATE.toLocaleDateString()}`);
  console.log(`   Last scheduled: ${lastDate.toLocaleDateString()}`);
  console.log(`   Duration: ${days} days (~${Math.round(days / 30)} months)`);
  console.log(`\n✅ Done!`);
}

main();
