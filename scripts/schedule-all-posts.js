/**
 * 📅 SCHEDULE ALL POSTS (VI + EN)
 * 
 * - Keep only posts currently in production sitemap as public
 * - Schedule remaining VI + EN posts: 5 posts/day total
 * 
 * Usage: node scripts/schedule-all-posts.js
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR_VI = path.join(__dirname, '..', 'content', 'blog', 'posts');
const POSTS_DIR_EN = path.join(__dirname, '..', 'content', 'blog', 'posts', 'en');

// VI posts currently in production sitemap (KEEP PUBLIC)
const VI_KEEP_PUBLIC = [
  'app-hoc-toan-cho-be.json',
  'con-so-hoc-toan.json',
  'soroban-la-gi.json',
  'con-hoc-soroban-nhung-o-truong-day-cach-khac.json',
  'ba-khong-biet-soroban-van-kem-con-duoc.json',
  'sai-lam-pho-bien-khi-hoc-soroban.json',
  'lam-sao-biet-con-hoc-soroban-dung-huong.json',
  'day-con-tinh-nham-nhanh.json',
  'hoc-toan-tu-duy-online-cho-be.json',
  'hoc-soroban-online-co-phu-hop-cho-phu-huynh-ban-ron.json',
  'chon-lop-soroban-hay-hoc-online.json',
  'hoc-soroban-mat-bao-lau-de-tinh-nham-duoc.json',
  'soroban-giup-tre-tinh-nham-tot-hon-nhu-the-nao.json',
  'soroban-co-that-su-tot-nhu-loi-don.json',
  'may-tuoi-cho-con-hoc-soroban-la-phu-hop.json',
  'lo-trinh-hoc-soroban-cho-tre.json',
  '5-hoat-dong-khoi-dong-dau-gio-khong-can-chuan-bi.json',
  'tinh-nham-soroban-anzan.json',
  'phep-chia-tren-soroban.json',
  'phep-nhan-tren-soroban.json',
  'con-hoc-toan-online-co-tot-khong.json',
  'con-khoc-moi-khi-lam-bai-toan.json',
  'khong-co-thoi-gian-kem-con-hoc.json',
  'lop-dong-45-hoc-sinh-cach-tao-tuong-tac.json',
  'game-trong-lop-hoc-tu-hoai-nghi-den-khong-the-thieu.json',
  'cho-con-hoc-them-hay-tu-hoc-o-nha.json',
  'tinh-nham-co-can-thiet-khong.json',
  'soroban-co-giup-con-lam-toan-truong-tot-hon.json',
  'bo-me-can-hoc-soroban-de-day-con-khong.json',
  'cach-day-con-hoc-toan-ma-khong-can-giao-vien.json',
  'con-khong-thich-hoc-chi-thich-choi.json',
  'hoc-soroban-co-can-biet-tieng-nhat-khong.json',
  'con-hoc-toan-tot-o-truong-nhung-ve-nha-khong-lam-duoc.json',
  'con-hay-lam-sai-phep-tru-co-nho.json',
  'ban-tin-bang-soroban-ao-hay-ban-that.json',
  'con-so-toan-vi-me-tung-la-con.json',
  'con-tinh-nham-hay-sai-do-dau.json',
  'hoc-toan-moi-ngay-15-phut-co-hieu-qua.json',
  'lam-sao-de-con-tu-giac-hoc-toan.json',
  'bo-ban-khong-biet-day-con-hoc-toan.json',
  'hoc-soroban-co-can-mua-ban-tinh-khong.json',
  'tiet-day-thay-doi-khi-day-hoc-tich-cuc.json',
  'day-con-toan-qua-tro-choi-hang-ngay.json',
  'con-tinh-cong-tru-cham-qua.json',
  'kem-con-hoc-toan-ma-hai-me-con-cai-nhau.json',
  'cuoc-dua-ki-thu-bien-lop-hoc-thanh-duong-dua.json',
  'dong-ho-bam-gio-may-chieu-cong-cu-quan-ly-thoi-gian.json',
  'xuc-xac-3d-cong-cu-random-vui-nhon-trong-lop-hoc.json',
  'flash-zan-5-phut-dau-gio-luyen-tinh-nham-nhanh.json',
  'chia-nhom-30-giay-giai-phap-tiet-hoc-45-phut.json',
  'phep-tru-co-muon-soroban.json',
  'phep-tru-don-gian-tren-soroban.json',
  'phep-cong-co-nho-thuc-hanh-soroban.json',
  'con-lop-1-khong-nhan-mat-so.json',
  'con-hay-quen-bang-cuu-chuong.json',
  'con-khong-nghe-loi-khi-bo-me-day-toan.json',
  'quy-tac-ban-cua-10-soroban.json',
  'khi-nao-phu-huynh-nen-dung-cong-cu-ho-tro.json',
  'con-biet-tinh-nhung-doc-de-khong-hieu.json',
  'con-noi-con-ghet-toan-minh-da-phan-ung-sai.json',
  'dong-hanh-cung-con-hoc-toan-la-gi.json',
  'tro-choi-o-chu-cong-cu-tao-crossword-cho-lop-hoc.json',
  'den-may-man-cuoi-tiet-game-thuong-phat-hoc-sinh-thich.json',
  'boc-tham-kiem-tra-mieng-cong-bang-cho-tat-ca.json',
  'dua-thu-hoat-hinh-game-dua-ngua-tao-dong-luc-hoc-tap.json',
  'ai-la-trieu-phu-game-show-kiem-tra-kien-thuc-trong-lop.json',
  'quy-tac-ban-cua-5-soroban.json',
  'phep-cong-don-gian-tren-soroban.json',
  'bieu-dien-so-hang-chuc-tram-soroban.json',
  'cach-bieu-dien-so-tren-soroban.json',
  'ba-viec-phu-huynh-chi-nen-lam-khi-con-hoc.json',
  'con-lam-toan-cham-hon-ban.json',
  'phu-huynh-co-nen-truc-tiep-day-con-hoc-toan-khong.json',
  'chiec-non-ky-dieu-goi-hoc-sinh-cong-bang.json',
  'cach-cam-va-tu-the-hoc-soroban.json',
  '10-phut-moi-ngay-phu-huynh-nen-lam-gi-khi-con-hoc-toan.json',
  'con-hoc-toan-cham-co-that-la-do-con.json',
  'vi-sao-cang-kem-con-hoc-toan-ca-nha-cang-met.json',
  'cau-tao-ban-tinh-soroban.json',
  'hoc-toan-nhu-choi-game-co-thuc-su-hieu-qua.json',
  'con-so-kiem-tra-toan.json',
  'sai-lam-pho-bien-khi-kem-con-hoc-toan.json',
  'soroban-la-gi-vi-sao-phu-hop-voi-tre-tieu-hoc.json',
  'lam-sao-de-con-hoc-toan-khong-ap-luc.json',
  'con-so-hoc-toan-phu-huynh-dang-lam-sai-o-dau.json',
  'phu-huynh-khong-gioi-toan-co-kem-con-hoc-duoc-khong.json',
];

// EN posts to keep public (high-quality, proper English slugs)
const EN_KEEP_PUBLIC = [
  'what-is-soroban.json',
  'best-age-to-start-soroban.json',
  'how-soroban-builds-mental-math.json',
  'is-soroban-good-for-brain.json',
  'soroban-learning-roadmap-for-kids.json',
  'my-child-is-afraid-of-math.json',
  'my-child-says-they-hate-math.json',
  'child-counts-on-fingers-is-it-bad.json',
  'learning-math-without-tears.json',
  'building-math-habits-for-kids.json',
  'kumon-vs-soroban-which-to-choose.json',
  'soroban-center-or-online-app.json',
  'how-to-read-numbers-on-soroban.json',
  'simple-addition-on-soroban.json',
  'common-mistakes-learning-soroban.json',
];

// Schedule settings
const START_DATE = new Date('2026-01-18');
const POSTS_PER_DAY = 5;

function readPost(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
    return null;
  }
}

function writePost(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function getRandomTime() {
  const hour = 6 + Math.floor(Math.random() * 16); // 6am - 10pm
  const minute = Math.floor(Math.random() * 60);
  return { hour, minute };
}

function main() {
  console.log('📅 Scheduling ALL blog posts (VI + EN)...\n');

  // ====== VI POSTS ======
  const viFiles = fs.readdirSync(POSTS_DIR_VI)
    .filter(f => f.endsWith('.json'));

  const viToSchedule = [];
  let viKept = 0;

  for (const file of viFiles) {
    const filePath = path.join(POSTS_DIR_VI, file);
    const post = readPost(filePath);
    if (!post) continue;

    if (VI_KEEP_PUBLIC.includes(file)) {
      // Already in sitemap - keep public with past date
      if (!post.publishedAt || new Date(post.publishedAt) > new Date()) {
        post.publishedAt = '2025-06-15T08:00:00.000Z'; // Past date
        post.status = 'published';
        writePost(filePath, post);
      }
      viKept++;
    } else {
      viToSchedule.push({ filePath, post, file, locale: 'vi' });
    }
  }

  console.log(`🇻🇳 VI: Keeping ${viKept} public, scheduling ${viToSchedule.length}`);

  // ====== EN POSTS ======
  const enFiles = fs.readdirSync(POSTS_DIR_EN)
    .filter(f => f.endsWith('.json'));

  const enToSchedule = [];
  let enKept = 0;

  for (const file of enFiles) {
    const filePath = path.join(POSTS_DIR_EN, file);
    const post = readPost(filePath);
    if (!post) continue;

    if (EN_KEEP_PUBLIC.includes(file)) {
      // Keep public with past date
      if (!post.publishedAt || new Date(post.publishedAt) > new Date()) {
        post.publishedAt = '2025-06-15T08:00:00.000Z'; // Past date
        post.status = 'published';
        writePost(filePath, post);
      }
      enKept++;
    } else {
      enToSchedule.push({ filePath, post, file, locale: 'en' });
    }
  }

  console.log(`🇺🇸 EN: Keeping ${enKept} public, scheduling ${enToSchedule.length}`);

  // ====== MERGE & SCHEDULE ======
  const allToSchedule = [...viToSchedule, ...enToSchedule];
  
  // Shuffle for variety
  allToSchedule.sort(() => Math.random() - 0.5);

  console.log(`\n📅 Total to schedule: ${allToSchedule.length} posts`);

  let currentDate = new Date(START_DATE);
  let postsToday = 0;

  for (const item of allToSchedule) {
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
  const lastDate = new Date(allToSchedule[allToSchedule.length - 1].post.publishedAt);
  const days = Math.ceil((lastDate - START_DATE) / (1000 * 60 * 60 * 24));

  console.log(`\n📊 Summary:`);
  console.log(`   🇻🇳 VI: ${viKept} public now, ${viToSchedule.length} scheduled`);
  console.log(`   🇺🇸 EN: ${enKept} public now, ${enToSchedule.length} scheduled`);
  console.log(`   📅 Schedule: ${START_DATE.toLocaleDateString()} → ${lastDate.toLocaleDateString()}`);
  console.log(`   ⏱️  Duration: ${days} days (~${Math.round(days / 7)} weeks)`);
  console.log(`   📈 Rate: ${POSTS_PER_DAY} posts/day`);
  console.log(`\n✅ Done!`);
}

main();
