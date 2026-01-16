/**
 * 📊 BLOG TRANSLATION SYNC CHECK
 * 
 * Kiểm tra trạng thái bản dịch của tất cả bài viết
 * 
 * Usage:
 *   node scripts/blog-sync-check.js
 * 
 * Output:
 *   - Danh sách bài VI chưa có bản EN
 *   - Danh sách bài EN chưa link về VI
 *   - Tổng quan coverage
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '../content/blog/posts');
const EN_POSTS_DIR = path.join(POSTS_DIR, 'en');
const VI_POSTS_DIR = POSTS_DIR; // VI posts ở root

function getAllPosts(dir, isSubfolder = false) {
  if (!fs.existsSync(dir)) return [];
  
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.json'))
    .filter(file => !isSubfolder || !['vi', 'en', 'ja', 'ko'].includes(file.replace('.json', ''))) // Exclude locale folders
    .map(file => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
        return data;
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);
}

function main() {
  console.log('📊 BLOG TRANSLATION SYNC CHECK\n');
  console.log('='.repeat(60));
  
  // Lấy tất cả bài viết
  const viPosts = getAllPosts(VI_POSTS_DIR).filter(p => p.status === 'published');
  const enPosts = getAllPosts(EN_POSTS_DIR);
  
  console.log(`\n📝 Tổng số bài viết:`);
  console.log(`   Vietnamese: ${viPosts.length} published`);
  console.log(`   English: ${enPosts.length} (${enPosts.filter(p => p.status === 'published').length} published)`);
  
  // Bài VI chưa có EN
  const viWithoutEn = viPosts.filter(p => !p.translations?.en);
  
  console.log(`\n🔴 Vietnamese posts WITHOUT English translation: ${viWithoutEn.length}`);
  if (viWithoutEn.length > 0 && viWithoutEn.length <= 20) {
    viWithoutEn.forEach(p => {
      console.log(`   - ${p.slug}`);
    });
  } else if (viWithoutEn.length > 20) {
    viWithoutEn.slice(0, 10).forEach(p => {
      console.log(`   - ${p.slug}`);
    });
    console.log(`   ... and ${viWithoutEn.length - 10} more`);
  }
  
  // Bài VI có EN
  const viWithEn = viPosts.filter(p => p.translations?.en);
  console.log(`\n🟢 Vietnamese posts WITH English translation: ${viWithEn.length}`);
  viWithEn.forEach(p => {
    const enSlug = p.translations.en;
    const enExists = enPosts.find(ep => ep.slug === enSlug);
    const status = enExists 
      ? (enExists.status === 'published' ? '✅' : '📝 draft')
      : '❌ file not found';
    console.log(`   - ${p.slug} → ${enSlug} ${status}`);
  });
  
  // Bài EN không link về VI
  const enWithoutVi = enPosts.filter(p => !p.translations?.vi);
  if (enWithoutVi.length > 0) {
    console.log(`\n⚠️ English posts NOT linked to Vietnamese: ${enWithoutVi.length}`);
    enWithoutVi.forEach(p => {
      console.log(`   - ${p.slug}`);
    });
  }
  
  // Coverage
  const coverage = ((viWithEn.length / viPosts.length) * 100).toFixed(1);
  console.log(`\n📈 Translation Coverage: ${coverage}%`);
  console.log(`   ${viWithEn.length}/${viPosts.length} Vietnamese posts have English version`);
  
  // Recommendations
  console.log(`\n💡 RECOMMENDATIONS:`);
  if (viWithoutEn.length > 0) {
    console.log(`   1. Create English versions for high-traffic posts first`);
    console.log(`   2. Use: node scripts/blog-scaffold-en.js <slug>`);
  }
  
  // By category stats
  console.log(`\n📁 By Category:`);
  const categoryStats = {};
  viPosts.forEach(p => {
    if (!categoryStats[p.category]) {
      categoryStats[p.category] = { total: 0, translated: 0 };
    }
    categoryStats[p.category].total++;
    if (p.translations?.en) {
      categoryStats[p.category].translated++;
    }
  });
  
  Object.entries(categoryStats)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([cat, stats]) => {
      const pct = ((stats.translated / stats.total) * 100).toFixed(0);
      console.log(`   ${cat}: ${stats.translated}/${stats.total} (${pct}%)`);
    });
}

main();
