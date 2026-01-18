/**
 * 🔍 I18N SYNC CHECK SCRIPT
 * 
 * Kiểm tra đồng bộ giữa các ngôn ngữ:
 * - So sánh keys giữa source (vi) và target (en)
 * - Báo cáo missing keys
 * - Báo cáo extra keys
 * - Hỗ trợ CI/CD integration
 * 
 * Usage: 
 *   node lib/i18n/scripts/sync-check.js
 *   node lib/i18n/scripts/sync-check.js --fix (tạo file với missing keys)
 * 
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// Config
const SOURCE_LOCALE = 'vi';  // Vietnamese là source of truth
const TARGET_LOCALES = ['en'];  // Có thể thêm: 'ja', 'ko', 'zh'

const DICTIONARIES_DIR = path.join(__dirname, '..', 'dictionaries');

/**
 * Đệ quy lấy tất cả keys từ object
 * @param {object} obj 
 * @param {string} prefix 
 * @returns {string[]}
 */
function getAllKeys(obj, prefix = '') {
  let keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Load tất cả JSON files từ một locale folder
 * @param {string} locale 
 * @returns {object}
 */
function loadLocaleData(locale) {
  const localeDir = path.join(DICTIONARIES_DIR, locale);
  
  if (!fs.existsSync(localeDir)) {
    console.error(`❌ Locale directory not found: ${localeDir}`);
    return null;
  }
  
  const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));
  const data = {};
  
  for (const file of files) {
    const namespace = file.replace('.json', '');
    const content = JSON.parse(fs.readFileSync(path.join(localeDir, file), 'utf8'));
    data[namespace] = {
      file,
      keys: getAllKeys(content),
      content
    };
  }
  
  return data;
}

/**
 * So sánh 2 locales
 * @param {string} source 
 * @param {string} target 
 * @returns {object}
 */
function compareLocales(source, target) {
  const sourceData = loadLocaleData(source);
  const targetData = loadLocaleData(target);
  
  if (!sourceData || !targetData) {
    return null;
  }
  
  const report = {
    source,
    target,
    namespaces: {},
    summary: {
      totalMissing: 0,
      totalExtra: 0,
      missingNamespaces: [],
      extraNamespaces: []
    }
  };
  
  // Check missing namespaces in target
  for (const ns of Object.keys(sourceData)) {
    if (!targetData[ns]) {
      report.summary.missingNamespaces.push(ns);
    }
  }
  
  // Check extra namespaces in target
  for (const ns of Object.keys(targetData)) {
    if (!sourceData[ns]) {
      report.summary.extraNamespaces.push(ns);
    }
  }
  
  // Compare keys in each namespace
  for (const [ns, data] of Object.entries(sourceData)) {
    if (!targetData[ns]) continue;
    
    const sourceKeys = new Set(data.keys);
    const targetKeys = new Set(targetData[ns].keys);
    
    const missing = [...sourceKeys].filter(k => !targetKeys.has(k));
    const extra = [...targetKeys].filter(k => !sourceKeys.has(k));
    
    if (missing.length > 0 || extra.length > 0) {
      report.namespaces[ns] = {
        file: data.file,
        missing,
        extra
      };
      report.summary.totalMissing += missing.length;
      report.summary.totalExtra += extra.length;
    }
  }
  
  return report;
}

/**
 * In báo cáo ra console
 * @param {object} report 
 */
function printReport(report) {
  console.log('\n' + '='.repeat(60));
  console.log(`📊 I18N SYNC REPORT: ${report.source.toUpperCase()} → ${report.target.toUpperCase()}`);
  console.log('='.repeat(60));
  
  // Missing namespaces
  if (report.summary.missingNamespaces.length > 0) {
    console.log('\n❌ MISSING NAMESPACES (not translated):');
    report.summary.missingNamespaces.forEach(ns => {
      console.log(`   - ${ns}.json`);
    });
  }
  
  // Extra namespaces
  if (report.summary.extraNamespaces.length > 0) {
    console.log('\n⚠️  EXTRA NAMESPACES (may be outdated):');
    report.summary.extraNamespaces.forEach(ns => {
      console.log(`   - ${ns}.json`);
    });
  }
  
  // Keys report per namespace
  const namespaceCount = Object.keys(report.namespaces).length;
  if (namespaceCount > 0) {
    console.log(`\n📝 KEY DIFFERENCES (${namespaceCount} namespaces):`);
    
    for (const [ns, data] of Object.entries(report.namespaces)) {
      console.log(`\n   📁 ${data.file}:`);
      
      if (data.missing.length > 0) {
        console.log(`      ❌ Missing ${data.missing.length} keys:`);
        data.missing.slice(0, 5).forEach(k => {
          console.log(`         - ${k}`);
        });
        if (data.missing.length > 5) {
          console.log(`         ... and ${data.missing.length - 5} more`);
        }
      }
      
      if (data.extra.length > 0) {
        console.log(`      ⚠️  Extra ${data.extra.length} keys:`);
        data.extra.slice(0, 3).forEach(k => {
          console.log(`         - ${k}`);
        });
        if (data.extra.length > 3) {
          console.log(`         ... and ${data.extra.length - 3} more`);
        }
      }
    }
  }
  
  // Summary
  console.log('\n' + '-'.repeat(60));
  console.log('📈 SUMMARY:');
  console.log(`   Total missing keys: ${report.summary.totalMissing}`);
  console.log(`   Total extra keys: ${report.summary.totalExtra}`);
  console.log(`   Missing namespaces: ${report.summary.missingNamespaces.length}`);
  
  if (report.summary.totalMissing === 0 && report.summary.missingNamespaces.length === 0) {
    console.log('\n✅ All translations are in sync!');
  } else {
    console.log('\n⚠️  Some translations need attention!');
  }
  
  console.log('='.repeat(60) + '\n');
}

/**
 * Tạo file với missing keys (--fix mode)
 * @param {object} report 
 */
function generateMissingKeysFile(report) {
  const sourceData = loadLocaleData(report.source);
  const outputDir = path.join(DICTIONARIES_DIR, report.target);
  
  for (const [ns, data] of Object.entries(report.namespaces)) {
    if (data.missing.length === 0) continue;
    
    const missingData = {};
    const sourceContent = sourceData[ns].content;
    
    // Extract missing keys from source
    for (const key of data.missing) {
      const keys = key.split('.');
      let sourceValue = sourceContent;
      let targetObj = missingData;
      
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        sourceValue = sourceValue[k];
        
        if (i === keys.length - 1) {
          targetObj[k] = `[TODO] ${sourceValue}`;
        } else {
          targetObj[k] = targetObj[k] || {};
          targetObj = targetObj[k];
        }
      }
    }
    
    // Write to _missing_{ns}.json
    const outputPath = path.join(outputDir, `_missing_${ns}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(missingData, null, 2), 'utf8');
    console.log(`📝 Created ${report.target}/_missing_${ns}.json`);
  }
}

// Main
const args = process.argv.slice(2);
const fixMode = args.includes('--fix');

console.log('🔍 Starting i18n sync check...');
console.log(`   Source locale: ${SOURCE_LOCALE}`);
console.log(`   Target locales: ${TARGET_LOCALES.join(', ')}`);

let hasErrors = false;

for (const target of TARGET_LOCALES) {
  const report = compareLocales(SOURCE_LOCALE, target);
  
  if (report) {
    printReport(report);
    
    if (fixMode && report.summary.totalMissing > 0) {
      console.log('🔧 Fix mode: generating missing keys files...');
      generateMissingKeysFile(report);
    }
    
    if (report.summary.totalMissing > 0 || report.summary.missingNamespaces.length > 0) {
      hasErrors = true;
    }
  }
}

// Exit with error code for CI/CD
if (hasErrors) {
  console.log('❌ Sync check failed - some translations are missing');
  process.exit(1);
} else {
  console.log('✅ Sync check passed!');
  process.exit(0);
}
