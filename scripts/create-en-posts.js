/**
 * Script tạo bài EN từ bài VI
 * - Viết lại nội dung tự nhiên theo văn hóa tiếng Anh
 * - Dùng chung hình ảnh
 * - postId = slug VI
 */

const fs = require('fs');
const path = require('path');

const viPostsDir = 'content/blog/posts';
const enPostsDir = 'content/blog/posts/en';

// Category mapping VI -> EN
const categoryMap = {
  'goc-chia-se-giao-vien': 'teacher-insights',
  'phu-huynh-kem-con-hoc-toan': 'parents-helping-with-math',
  'con-gap-kho-khan-hoc-toan': 'when-kids-struggle-with-math',
  'con-gap-kho-khan-khi-hoc-toan': 'when-kids-struggle-with-math',
  'cach-giup-con-hoc-toan-nhe-nhang': 'stress-free-math-learning',
  'soroban-cho-phu-huynh': 'soroban-for-parents'
};

// Author mapping
const authorMap = {
  'Chị Mai': { name: 'Sarah Chen', role: 'Mom of two elementary schoolers' },
  'Thầy Minh': { name: 'Michael Tran', role: 'Elementary Math Teacher' },
  'Cô Hương': { name: 'Emily Nguyen', role: 'Education Consultant' },
  'Mẹ 2 bé tiểu học': { name: 'Sarah Chen', role: 'Mom of two elementary schoolers' },
  'Phụ huynh': { name: 'Parent Contributor', role: 'SoroKid Community' }
};

// Tạo slug EN từ title
function createEnSlug(title) {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/-$/, '');
}

// Content rewriting rules (simplified - real implementation would use AI)
const contentRewrites = {
  'app-hoc-toan-cho-be': {
    title: "Choosing the Best Math App for Your Child: What I Learned After Testing Dozens",
    description: "With hundreds of math apps available, how do you choose the right one? I share my 5 evaluation criteria after 2 months of testing with my kids.",
    intro: "It was 8 PM, I'd just finished the dishes and found my older kid on his phone while my younger one cried over math homework. My husband was traveling. One kid needs mental math practice, the other just started addition. Tutoring? No budget, no time, no way to drive them there. I slumped into a chair, exhausted.",
    sections: [
      { type: "paragraph", text: "Then I thought: 'What about learning apps? Kids love phones anyway.' But Google Play showed hundreds of math apps, all claiming to make kids 'math geniuses.' How to choose?" },
      { type: "paragraph", text: "I spent 2 months testing nearly a dozen apps with both kids. Some they played for 2 days then abandoned. Some were great but only in English. Some had so many ads my kids kept accidentally clicking out. Finally, after all that trial and error, I found what works for both." }
    ]
  },
  'con-so-hoc-toan': {
    title: "My Child's Math Anxiety: A Parent's Journey from Tears to Progress",
    description: "When my daughter started crying every time she saw math homework, I knew something had to change. Here's what I discovered about math anxiety and how we turned it around.",
    intro: "Every evening was the same battle. The moment I mentioned 'math homework,' my daughter's face would crumple. Not just reluctance – real tears, real fear. I watched my bright, curious 7-year-old transform into a trembling mess over simple addition problems.",
    sections: []
  },
  'day-con-tinh-nham-nhanh': {
    title: "Teaching Mental Math: How My Child Went from Finger-Counting to Quick Calculations",
    description: "My third-grader was still counting on fingers while classmates did mental math instantly. Here's the step-by-step approach that finally helped.",
    intro: "I'll never forget the parent-teacher conference where Mrs. Johnson gently mentioned that my son was 'still developing his mental math skills.' Translation: while other kids instantly knew 7+8, mine was still counting fingers under the desk.",
    sections: []
  },
  'hoc-toan-tu-duy-online-cho-be': {
    title: "Is Online Math Learning Actually Effective for Kids? My 6-Month Experiment",
    description: "I was skeptical about online math programs for young children. After 6 months of testing different approaches, here's what I discovered.",
    intro: "When schools went virtual, I panicked. How could my 6-year-old learn math through a screen? Wasn't hands-on learning essential at this age? I decided to run my own experiment.",
    sections: []
  }
};

// Lấy danh sách postId đã có EN
const enPostIds = new Set();
fs.readdirSync(enPostsDir).filter(f => f.endsWith('.json')).forEach(f => {
  const post = JSON.parse(fs.readFileSync(path.join(enPostsDir, f), 'utf-8'));
  if (post.postId) enPostIds.add(post.postId);
});

// Tìm bài VI chưa có EN
const missingPosts = [];
fs.readdirSync(viPostsDir).filter(f => f.endsWith('.json')).forEach(f => {
  const viPost = JSON.parse(fs.readFileSync(path.join(viPostsDir, f), 'utf-8'));
  if (!enPostIds.has(viPost.slug)) {
    missingPosts.push({ file: f, post: viPost });
  }
});

console.log(`Found ${missingPosts.length} VI posts without EN version`);

// Tạo bài EN
let created = 0;
missingPosts.forEach(({ file, post: viPost }) => {
  const rewrite = contentRewrites[viPost.slug];
  
  // Tạo nội dung EN
  const enPost = {
    postId: viPost.slug,
    slug: rewrite ? createEnSlug(rewrite.title) : createEnSlug(viPost.title),
    title: rewrite?.title || `[EN] ${viPost.title}`,
    description: rewrite?.description || `[Needs translation] ${viPost.description}`,
    category: categoryMap[viPost.category] || 'parents-helping-with-math',
    keywords: viPost.keywords?.map(k => k) || [],
    status: viPost.status,
    publishedAt: viPost.publishedAt,
    createdAt: viPost.createdAt,
    image: viPost.image,
    imageAlt: viPost.imageAlt,
    readingTime: viPost.readingTime,
    author: authorMap[viPost.author?.name] || { name: 'SoroKid Team', role: 'Education Content' },
    content: rewrite ? {
      intro: rewrite.intro,
      sections: rewrite.sections.length > 0 ? rewrite.sections : viPost.content?.sections?.slice(0, 5) || []
    } : {
      intro: `[Needs natural English rewrite] ${viPost.content?.intro || ''}`,
      sections: viPost.content?.sections?.slice(0, 5) || []
    }
  };

  // Lưu file
  const enFileName = `${enPost.slug}.json`;
  const enFilePath = path.join(enPostsDir, enFileName);
  
  // Kiểm tra file đã tồn tại chưa
  if (!fs.existsSync(enFilePath)) {
    fs.writeFileSync(enFilePath, JSON.stringify(enPost, null, 2), 'utf-8');
    created++;
    console.log(`Created: ${enFileName}`);
  }
});

console.log(`\nTotal created: ${created} EN posts`);
console.log(`Note: Posts marked [EN] or [Needs translation] need manual review and natural English rewriting.`);
