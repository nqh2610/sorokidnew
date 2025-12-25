const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '..', 'content', 'blog', 'posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));

const results = {
  total: files.length,
  titleTooLong: [],
  descTooShort: [],
  descTooLong: [],
  missingImage: [],
  missingImageAlt: [],
  draft: [],
  published: [],
  keywordIssues: [],
  missingFields: []
};

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(postsDir, file), 'utf8'));
  const slug = file.replace('.json', '');
  
  // Title > 60 chars
  if (data.title && data.title.length > 60) {
    results.titleTooLong.push({ slug, len: data.title.length, title: data.title.substring(0, 80) });
  }
  
  // Description issues
  if (!data.description || data.description.length < 100) {
    results.descTooShort.push({ slug, len: data.description?.length || 0 });
  }
  if (data.description && data.description.length > 160) {
    results.descTooLong.push({ slug, len: data.description.length });
  }
  
  // Missing image
  if (!data.image) {
    results.missingImage.push(slug);
  }
  
  // Missing imageAlt
  if (!data.imageAlt) {
    results.missingImageAlt.push(slug);
  }
  
  // Status
  if (data.status === 'draft') {
    results.draft.push(slug);
  } else if (data.status === 'published') {
    results.published.push(slug);
  }
  
  // Keywords < 3
  if (!data.keywords || data.keywords.length < 3) {
    results.keywordIssues.push({ slug, count: data.keywords?.length || 0 });
  }
  
  // Missing required fields
  const missing = [];
  if (!data.title) missing.push('title');
  if (!data.description) missing.push('description');
  if (!data.publishedAt) missing.push('publishedAt');
  if (missing.length > 0) {
    results.missingFields.push({ slug, missing });
  }
});

console.log('\n========== SEO AUDIT REPORT ==========\n');
console.log(`📊 TỔNG QUAN:`);
console.log(`   Tổng số bài viết: ${results.total}`);
console.log(`   Published: ${results.published.length}`);
console.log(`   Draft: ${results.draft.length}`);

console.log(`\n⚠️  CÁC VẤN ĐỀ SEO:`);
console.log(`   Title > 60 ký tự: ${results.titleTooLong.length} bài`);
console.log(`   Description < 100 ký tự: ${results.descTooShort.length} bài`);
console.log(`   Description > 160 ký tự: ${results.descTooLong.length} bài`);
console.log(`   Thiếu image: ${results.missingImage.length} bài`);
console.log(`   Thiếu imageAlt: ${results.missingImageAlt.length} bài`);
console.log(`   Keywords < 3: ${results.keywordIssues.length} bài`);
console.log(`   Thiếu trường bắt buộc: ${results.missingFields.length} bài`);

if (results.titleTooLong.length > 0) {
  console.log(`\n📝 CHI TIẾT - Title quá dài (>60 ký tự):`);
  results.titleTooLong.slice(0, 10).forEach(item => {
    console.log(`   - ${item.slug}: ${item.len} ký tự`);
    console.log(`     "${item.title}..."`);
  });
  if (results.titleTooLong.length > 10) {
    console.log(`   ... và ${results.titleTooLong.length - 10} bài khác`);
  }
}

if (results.descTooShort.length > 0) {
  console.log(`\n📝 CHI TIẾT - Description quá ngắn (<100 ký tự):`);
  results.descTooShort.slice(0, 10).forEach(item => {
    console.log(`   - ${item.slug}: ${item.len} ký tự`);
  });
  if (results.descTooShort.length > 10) {
    console.log(`   ... và ${results.descTooShort.length - 10} bài khác`);
  }
}

if (results.descTooLong.length > 0) {
  console.log(`\n📝 CHI TIẾT - Description quá dài (>160 ký tự):`);
  results.descTooLong.slice(0, 10).forEach(item => {
    console.log(`   - ${item.slug}: ${item.len} ký tự`);
  });
  if (results.descTooLong.length > 10) {
    console.log(`   ... và ${results.descTooLong.length - 10} bài khác`);
  }
}

if (results.missingImage.length > 0) {
  console.log(`\n🖼️  CHI TIẾT - Thiếu image:`);
  results.missingImage.forEach(slug => console.log(`   - ${slug}`));
}

if (results.missingImageAlt.length > 0) {
  console.log(`\n🖼️  CHI TIẾT - Thiếu imageAlt:`);
  results.missingImageAlt.slice(0, 10).forEach(slug => console.log(`   - ${slug}`));
  if (results.missingImageAlt.length > 10) {
    console.log(`   ... và ${results.missingImageAlt.length - 10} bài khác`);
  }
}

if (results.keywordIssues.length > 0) {
  console.log(`\n🔑 CHI TIẾT - Keywords ít (<3):`);
  results.keywordIssues.slice(0, 10).forEach(item => {
    console.log(`   - ${item.slug}: ${item.count} keywords`);
  });
  if (results.keywordIssues.length > 10) {
    console.log(`   ... và ${results.keywordIssues.length - 10} bài khác`);
  }
}

if (results.missingFields.length > 0) {
  console.log(`\n❌ CHI TIẾT - Thiếu trường bắt buộc:`);
  results.missingFields.forEach(item => {
    console.log(`   - ${item.slug}: thiếu ${item.missing.join(', ')}`);
  });
}

// Overall score
const issues = results.titleTooLong.length + results.descTooShort.length + 
               results.descTooLong.length + results.missingImage.length + 
               results.missingImageAlt.length + results.keywordIssues.length;
const maxIssues = results.total * 6;
const score = Math.round((1 - issues / maxIssues) * 100);

console.log(`\n✅ ĐIỂM SEO TỔNG THỂ: ${score}/100`);
console.log('\n========================================\n');
