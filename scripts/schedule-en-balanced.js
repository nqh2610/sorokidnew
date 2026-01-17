/**
 * 📅 SCHEDULE EN POSTS V2 - Balanced across categories
 * 
 * - Keep 3 posts from EACH category public now (15 total)
 * - Schedule remaining posts: 5 posts/day
 * - Fix category mismatches
 * 
 * Usage: node scripts/schedule-en-balanced.js
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR_EN = path.join(__dirname, '..', 'content', 'blog', 'posts', 'en');

// Official categories from categories.en.json
const OFFICIAL_CATEGORIES = [
  'teacher-insights',
  'parents-helping-with-math', 
  'math-struggles',
  'stress-free-math-learning',
  'soroban-for-parents'
];

// Map old/wrong category slugs to correct ones
const CATEGORY_FIX = {
  'parent-concern': 'parents-helping-with-math',
  'when-kids-struggle-with-math': 'math-struggles',
  'goc-chia-se-giao-vien': 'teacher-insights',
  'phu-huynh-kem-con-hoc-toan': 'parents-helping-with-math',
  'con-gap-kho-khan-hoc-toan': 'math-struggles',
  'cach-giup-con-hoc-toan-nhe-nhang': 'stress-free-math-learning',
  'soroban-cho-phu-huynh': 'soroban-for-parents',
};

const START_DATE = new Date('2026-01-18');
const POSTS_PER_DAY = 5;
const POSTS_PUBLIC_PER_CATEGORY = 3;

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
  const hour = 6 + Math.floor(Math.random() * 16);
  const minute = Math.floor(Math.random() * 60);
  return { hour, minute };
}

function fixCategory(category) {
  return CATEGORY_FIX[category] || category;
}

function main() {
  console.log('📅 Scheduling EN posts (balanced across categories)...\n');

  const files = fs.readdirSync(POSTS_DIR_EN).filter(f => f.endsWith('.json'));

  // Group posts by category
  const postsByCategory = {};
  OFFICIAL_CATEGORIES.forEach(cat => postsByCategory[cat] = []);

  let categoryFixes = 0;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR_EN, file);
    const post = readPost(filePath);
    if (!post) continue;

    // Fix category if needed
    const originalCat = post.category;
    const fixedCat = fixCategory(originalCat);
    
    if (fixedCat !== originalCat) {
      post.category = fixedCat;
      writePost(filePath, post);
      categoryFixes++;
    }

    if (OFFICIAL_CATEGORIES.includes(fixedCat)) {
      postsByCategory[fixedCat].push({ filePath, post, file });
    } else {
      console.log(`⚠️  Unknown category: ${fixedCat} in ${file}`);
      // Default to soroban-for-parents
      post.category = 'soroban-for-parents';
      writePost(filePath, post);
      postsByCategory['soroban-for-parents'].push({ filePath, post, file });
    }
  }

  console.log(`🔧 Fixed ${categoryFixes} category mismatches\n`);

  // Select posts to keep public (POSTS_PUBLIC_PER_CATEGORY per category)
  const keepPublic = [];
  const toSchedule = [];

  for (const cat of OFFICIAL_CATEGORIES) {
    const posts = postsByCategory[cat];
    // Sort by title quality (prefer shorter, cleaner titles)
    posts.sort((a, b) => {
      const aClean = !a.file.includes('%') && !a.file.match(/[^\x00-\x7F]/);
      const bClean = !b.file.includes('%') && !b.file.match(/[^\x00-\x7F]/);
      if (aClean && !bClean) return -1;
      if (!aClean && bClean) return 1;
      return a.post.title.length - b.post.title.length;
    });

    const publicPosts = posts.slice(0, POSTS_PUBLIC_PER_CATEGORY);
    const scheduledPosts = posts.slice(POSTS_PUBLIC_PER_CATEGORY);

    keepPublic.push(...publicPosts);
    toSchedule.push(...scheduledPosts);

    console.log(`📂 ${cat}: ${publicPosts.length} public, ${scheduledPosts.length} scheduled`);
  }

  // Set public posts to past date
  const PAST_DATE = '2025-06-15T08:00:00.000Z';
  for (const item of keepPublic) {
    item.post.publishedAt = PAST_DATE;
    item.post.status = 'published';
    if (item.post.schema) {
      item.post.schema.datePublished = '2025-06-15';
    }
    writePost(item.filePath, item.post);
  }

  console.log(`\n✅ ${keepPublic.length} posts public now`);

  // Shuffle and schedule remaining
  toSchedule.sort(() => Math.random() - 0.5);

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

  const lastDate = new Date(toSchedule[toSchedule.length - 1].post.publishedAt);
  const days = Math.ceil((lastDate - START_DATE) / (1000 * 60 * 60 * 24));

  console.log(`📅 ${toSchedule.length} posts scheduled: ${START_DATE.toLocaleDateString()} → ${lastDate.toLocaleDateString()} (${days} days)`);

  // Summary by category for public posts
  console.log(`\n📊 Public posts by category:`);
  for (const cat of OFFICIAL_CATEGORIES) {
    const publicInCat = keepPublic.filter(p => p.post.category === cat);
    console.log(`   ${cat}: ${publicInCat.length} posts`);
    publicInCat.forEach(p => console.log(`     - ${p.file}`));
  }
}

main();
