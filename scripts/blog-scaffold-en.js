/**
 * 🌍 BLOG I18N SCAFFOLD SCRIPT
 * 
 * Tạo template bài viết tiếng Anh từ bài tiếng Việt
 * 
 * Usage:
 *   node scripts/blog-scaffold-en.js <vi-slug>
 *   node scripts/blog-scaffold-en.js soroban-la-gi
 * 
 * Output:
 *   - Tạo file template trong content/blog/posts/en/
 *   - Cập nhật bài VI với translations field
 * 
 * LƯU Ý: Script chỉ tạo TEMPLATE, không dịch máy móc.
 * Bạn cần viết lại nội dung cho phù hợp văn hóa.
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '../content/blog/posts');
const EN_POSTS_DIR = path.join(POSTS_DIR, 'en');

// Mapping category VI -> EN
const categoryMapping = {
  'goc-chia-se-giao-vien': 'teacher-insights',
  'phu-huynh-kem-con-hoc-toan': 'parents-helping-with-math',
  'con-gap-kho-khan-hoc-toan': 'math-struggles',
  'cach-giup-con-hoc-toan-nhe-nhang': 'stress-free-math-learning',
  'soroban-cho-phu-huynh': 'soroban-for-parents',
};

/**
 * Chuyển đổi slug tiếng Việt sang gợi ý slug tiếng Anh
 */
function suggestEnglishSlug(viSlug) {
  // Một số mapping phổ biến
  const slugMappings = {
    'soroban-la-gi': 'what-is-soroban',
    'con-so-hoc-toan': 'math-anxiety-in-kids',
    'app-hoc-toan-cho-be': 'best-math-apps-for-kids',
    'bang-cuu-chuong-hoc-thuoc-hay-hieu': 'multiplication-tables-memorize-or-understand',
    'con-tinh-nham-hay-sai-do-dau': 'why-kids-make-mental-math-mistakes',
    'day-con-toan-khong-can-giao-vien': 'teaching-kids-math-without-a-tutor',
  };
  
  if (slugMappings[viSlug]) {
    return slugMappings[viSlug];
  }
  
  // Tạo placeholder slug từ VI
  return `en-${viSlug.substring(0, 30)}`;
}

/**
 * Tạo template bài viết EN
 */
function createEnglishTemplate(viPost, enSlug) {
  return {
    slug: enSlug,
    title: `[TRANSLATE] ${viPost.title}`,
    description: `[TRANSLATE] ${viPost.description}`,
    category: categoryMapping[viPost.category] || viPost.category,
    keywords: [
      // Placeholder keywords - cần research riêng cho EN
      'soroban',
      'mental math',
      'math for kids',
    ],
    status: 'draft', // Draft cho đến khi viết xong
    publishedAt: viPost.publishedAt,
    createdAt: new Date().toISOString().split('T')[0],
    image: viPost.image, // Giữ nguyên hình ảnh
    imageAlt: `[TRANSLATE] ${viPost.imageAlt || viPost.title}`,
    readingTime: viPost.readingTime,
    categoryOrder: viPost.categoryOrder,
    order: viPost.order,
    author: {
      name: '[LOCALIZE - e.g., Sarah, Mom of 3rd grader]',
      role: '[LOCALIZE - e.g., Parent]',
    },
    translations: {
      vi: viPost.slug,
    },
    content: {
      intro: `[WRITE NEW INTRO - Don't translate, rewrite for American/English audience]\n\nOriginal Vietnamese:\n${viPost.content?.intro || ''}`,
      sections: [
        {
          type: 'paragraph',
          text: '[REWRITE CONTENT - Adapt for English-speaking audience, their culture, concerns, and context]',
        },
        {
          type: 'callout',
          style: 'tip',
          text: '[Note: Review original Vietnamese structure and recreate for English audience]',
        },
      ],
      faq: [
        {
          question: '[FAQ 1 - Research common questions in English]',
          answer: '[Answer based on English market research]',
        },
      ],
    },
    _originalVietnamese: {
      title: viPost.title,
      description: viPost.description,
      introPreview: viPost.content?.intro?.substring(0, 200) + '...',
    },
  };
}

/**
 * Main function
 */
function main() {
  const viSlug = process.argv[2];
  
  if (!viSlug) {
    console.log('❌ Usage: node scripts/blog-scaffold-en.js <vi-slug>');
    console.log('   Example: node scripts/blog-scaffold-en.js soroban-la-gi');
    process.exit(1);
  }
  
  // Đọc bài viết tiếng Việt
  const viFilePath = path.join(POSTS_DIR, `${viSlug}.json`);
  
  if (!fs.existsSync(viFilePath)) {
    console.log(`❌ Vietnamese post not found: ${viSlug}`);
    process.exit(1);
  }
  
  const viPost = JSON.parse(fs.readFileSync(viFilePath, 'utf-8'));
  
  // Kiểm tra xem đã có bản EN chưa
  if (viPost.translations?.en) {
    console.log(`⚠️ English translation already exists: ${viPost.translations.en}`);
    process.exit(0);
  }
  
  // Tạo EN slug
  const enSlug = suggestEnglishSlug(viSlug);
  const enFilePath = path.join(EN_POSTS_DIR, `${enSlug}.json`);
  
  // Tạo thư mục nếu chưa có
  if (!fs.existsSync(EN_POSTS_DIR)) {
    fs.mkdirSync(EN_POSTS_DIR, { recursive: true });
  }
  
  // Kiểm tra file EN đã tồn tại chưa
  if (fs.existsSync(enFilePath)) {
    console.log(`⚠️ English file already exists: ${enFilePath}`);
    process.exit(0);
  }
  
  // Tạo template EN
  const enTemplate = createEnglishTemplate(viPost, enSlug);
  
  // Lưu file EN
  fs.writeFileSync(enFilePath, JSON.stringify(enTemplate, null, 2), 'utf-8');
  console.log(`✅ Created English template: content/blog/posts/en/${enSlug}.json`);
  
  // Cập nhật bài VI với translations
  viPost.translations = viPost.translations || {};
  viPost.translations.en = enSlug;
  fs.writeFileSync(viFilePath, JSON.stringify(viPost, null, 2), 'utf-8');
  console.log(`✅ Updated Vietnamese post with translation link`);
  
  console.log('\n📝 NEXT STEPS:');
  console.log('1. Open the English template file');
  console.log('2. Replace [TRANSLATE] placeholders with localized content');
  console.log('3. Rewrite intro and sections for English audience');
  console.log('4. Research English keywords');
  console.log('5. Change status from "draft" to "published"');
  console.log('6. Remove _originalVietnamese field');
}

main();
