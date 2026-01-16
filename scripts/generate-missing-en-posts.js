/**
 * Script tạo bài EN còn thiếu
 * - Đọc bài VI
 * - Tạo bài EN với nội dung viết lại tự nhiên
 * - Dùng chung hình ảnh và postId = slug VI
 */

const fs = require('fs');
const path = require('path');

const viPostsDir = 'content/blog/posts';
const enPostsDir = 'content/blog/posts/en';

// Lấy danh sách postId đã có EN
const enPostIds = new Set();
fs.readdirSync(enPostsDir).filter(f => f.endsWith('.json')).forEach(f => {
  const post = JSON.parse(fs.readFileSync(path.join(enPostsDir, f), 'utf-8'));
  if (post.postId) enPostIds.add(post.postId);
});

// Category mapping VI -> EN
const categoryMap = {
  'goc-chia-se-giao-vien': 'teacher-insights',
  'phu-huynh-kem-con-hoc-toan': 'parents-helping-with-math',
  'con-gap-kho-khan-khi-hoc-toan': 'when-kids-struggle-with-math',
  'cach-giup-con-hoc-toan-nhe-nhang': 'stress-free-math-learning',
  'soroban-cho-phu-huynh': 'soroban-for-parents'
};

// Hàm tạo slug EN từ title
function createEnSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/-$/, '');
}

// Hàm viết lại title và content tự nhiên (placeholder - cần AI)
function rewriteForEnglish(viPost) {
  // Đây là template, nội dung thực tế cần được viết lại
  const templates = {
    'goc-chia-se-giao-vien': {
      titlePrefix: '',
      descPrefix: 'A teacher shares insights on '
    },
    'phu-huynh-kem-con-hoc-toan': {
      titlePrefix: '',
      descPrefix: 'Practical advice for parents on '
    },
    'con-gap-kho-khan-khi-hoc-toan': {
      titlePrefix: '',
      descPrefix: 'Understanding and helping when '
    },
    'cach-giup-con-hoc-toan-nhe-nhang': {
      titlePrefix: '',
      descPrefix: 'Gentle approaches to '
    },
    'soroban-cho-phu-huynh': {
      titlePrefix: '',
      descPrefix: 'A parent guide to '
    }
  };

  return {
    title: viPost.title, // Cần dịch/viết lại
    description: viPost.description // Cần dịch/viết lại
  };
}

// Tìm bài VI chưa có EN
const missingPosts = [];
fs.readdirSync(viPostsDir).filter(f => f.endsWith('.json')).forEach(f => {
  const viPost = JSON.parse(fs.readFileSync(path.join(viPostsDir, f), 'utf-8'));
  if (!enPostIds.has(viPost.slug)) {
    missingPosts.push(viPost);
  }
});

console.log('Missing EN posts:', missingPosts.length);
console.log('\nList of VI posts needing EN version:');
missingPosts.forEach((p, i) => {
  console.log(`${i + 1}. ${p.slug}`);
  console.log(`   Title: ${p.title}`);
  console.log(`   Category: ${p.category}`);
  console.log('');
});

// Export for use
module.exports = { missingPosts, categoryMap };
