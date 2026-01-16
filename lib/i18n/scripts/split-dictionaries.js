/**
 * 🔧 SPLIT DICTIONARY SCRIPT
 * 
 * Script này tách vi.json và en.json thành các module nhỏ
 * theo namespace schema đã định nghĩa.
 * 
 * Usage: node lib/i18n/scripts/split-dictionaries.js
 * 
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// Namespace mapping: định nghĩa key nào thuộc namespace nào
const NAMESPACE_MAP = {
  // common.json - UI chung
  'common': {
    file: 'common.json',
    keys: ['common', 'avatar', 'errors', 'errorBoundary', 'toast']
  },
  
  // home.json - Trang chủ
  'home': {
    file: 'home.json',
    keys: ['home']
  },
  
  // seo.json - SEO metadata
  'seo': {
    file: 'seo.json',
    keys: ['seo']
  },
  
  // auth.json - Authentication
  'auth': {
    file: 'auth.json',
    keys: ['auth', 'trial', 'upgrade']
  },
  
  // dashboard.json - User dashboard
  'dashboard': {
    file: 'dashboard.json',
    keys: ['dashboard']
  },
  
  // learn.json - Learning UI
  'learn': {
    file: 'learn.json',
    keys: ['learn']
  },
  
  // lesson-content.json - Lesson theory/practice content (CORE)
  'lesson-content': {
    file: 'lesson-content.json',
    keys: ['db']  // Contains lessonContent, lessons
  },
  
  // practice.json - Practice screen
  'practice': {
    file: 'practice.json',
    keys: ['practiceScreen']
  },
  
  // compete.json - Competition
  'compete': {
    file: 'compete.json',
    keys: ['competeScreen']
  },
  
  // adventure.json - Adventure game (CORE)
  'adventure': {
    file: 'adventure.json',
    keys: ['adventureScreen', 'adventure', 'adventureGame', 'adventureCert', 'narrative']
  },
  
  // certificate.json - Certificates (CORE)
  'certificate': {
    file: 'certificate.json',
    keys: ['certificate', 'tier', 'tierBadge']
  },
  
  // pricing.json - Pricing & Payment
  'pricing': {
    file: 'pricing.json',
    keys: ['pricing', 'pricingPage', 'payment', 'softUpgrade']
  },
  
  // tools.json - Toolbox
  'tools': {
    file: 'tools.json',
    keys: ['tool', 'toolbox', 'toolLayout', 'groupPicker', 'soundSettings', 'dice']
  },
  
  // profile.json - User profile
  'profile': {
    file: 'profile.json',
    keys: ['profilePage', 'leaderboardPage', 'editProfile']
  },
  
  // admin.json - Admin panel
  'admin': {
    file: 'admin.json',
    keys: ['admin']
  },
  
  // components.json - Shared components
  'components': {
    file: 'components.json',
    keys: ['topbar', 'footer', 'quest', 'sorobanWidget', 'sound', 'rewards', 'reward', 'achievementPopup', 'trialBadge', 'pwa', 'blog']
  }
};

/**
 * Tách dictionary thành các module
 * @param {string} locale - 'vi' hoặc 'en'
 */
function splitDictionary(locale) {
  const inputPath = path.join(__dirname, '..', 'dictionaries', `${locale}.json`);
  const outputDir = path.join(__dirname, '..', 'dictionaries', locale);
  
  // Đọc file gốc
  console.log(`\n📂 Reading ${locale}.json...`);
  const fullDict = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  // Tạo thư mục output nếu chưa có
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}`);
  }
  
  // Track các key đã xử lý để detect key thừa
  const processedKeys = new Set();
  
  // Tách từng namespace
  for (const [namespace, config] of Object.entries(NAMESPACE_MAP)) {
    const moduleData = {};
    
    for (const key of config.keys) {
      if (fullDict[key]) {
        moduleData[key] = fullDict[key];
        processedKeys.add(key);
      } else {
        console.warn(`⚠️  Key "${key}" not found in ${locale}.json`);
      }
    }
    
    // Chỉ tạo file nếu có data
    if (Object.keys(moduleData).length > 0) {
      const outputPath = path.join(outputDir, config.file);
      fs.writeFileSync(outputPath, JSON.stringify(moduleData, null, 2), 'utf8');
      console.log(`✅ Created ${locale}/${config.file} (${Object.keys(moduleData).length} keys)`);
    }
  }
  
  // Kiểm tra key chưa được xử lý
  const allKeys = Object.keys(fullDict);
  const unprocessedKeys = allKeys.filter(k => !processedKeys.has(k));
  
  if (unprocessedKeys.length > 0) {
    console.warn(`\n⚠️  Unprocessed keys in ${locale}.json:`);
    unprocessedKeys.forEach(k => console.warn(`   - ${k}`));
    
    // Tạo file _unprocessed.json cho các key chưa xử lý
    const unprocessedData = {};
    unprocessedKeys.forEach(k => {
      unprocessedData[k] = fullDict[k];
    });
    
    const unprocessedPath = path.join(outputDir, '_unprocessed.json');
    fs.writeFileSync(unprocessedPath, JSON.stringify(unprocessedData, null, 2), 'utf8');
    console.log(`📝 Created ${locale}/_unprocessed.json for review`);
  }
  
  console.log(`\n✅ ${locale}.json split into ${Object.keys(NAMESPACE_MAP).length} modules`);
}

/**
 * Tạo index.js aggregator cho một locale
 * @param {string} locale - 'vi' hoặc 'en'
 */
function createIndexFile(locale) {
  const outputDir = path.join(__dirname, '..', 'dictionaries', locale);
  
  const imports = Object.values(NAMESPACE_MAP)
    .map(config => {
      const name = config.file.replace('.json', '').replace(/-/g, '_');
      return `import ${name} from './${config.file}';`;
    })
    .join('\n');
  
  const spreads = Object.values(NAMESPACE_MAP)
    .map(config => {
      const name = config.file.replace('.json', '').replace(/-/g, '_');
      return `  ...${name},`;
    })
    .join('\n');
  
  const content = `/**
 * 🌍 ${locale.toUpperCase()} Dictionary Aggregator
 * 
 * Tổng hợp tất cả namespace thành 1 object
 * Dùng cho backward compatibility với code hiện tại
 * 
 * @auto-generated by split-dictionaries.js
 */

${imports}

const dictionary = {
${spreads}
};

export default dictionary;
`;
  
  fs.writeFileSync(path.join(outputDir, 'index.js'), content, 'utf8');
  console.log(`✅ Created ${locale}/index.js`);
}

// Main
console.log('🚀 Starting dictionary split...\n');
console.log('=' .repeat(50));

// Split both locales
splitDictionary('vi');
splitDictionary('en');

// Create index files
console.log('\n📦 Creating aggregator files...');
createIndexFile('vi');
createIndexFile('en');

console.log('\n' + '='.repeat(50));
console.log('✅ Dictionary split complete!');
console.log('\n📝 Next steps:');
console.log('   1. Review _unprocessed.json files (if any)');
console.log('   2. Update lib/i18n/dictionary.js to use new structure');
console.log('   3. Test all routes');
