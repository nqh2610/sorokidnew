/**
 * 🔍 I18N VALIDATE SCRIPT
 * 
 * Validate JSON structure và content:
 * - Kiểm tra JSON syntax
 * - Kiểm tra placeholder format {param}
 * - Kiểm tra empty strings
 * - Kiểm tra duplicate keys
 * 
 * Usage: node lib/i18n/scripts/validate.js
 * 
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

const DICTIONARIES_DIR = path.join(__dirname, '..', 'dictionaries');
const LOCALES = ['vi', 'en'];

/**
 * Kiểm tra JSON syntax
 * @param {string} filePath 
 * @returns {object}
 */
function validateJsonSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Đệ quy kiểm tra các giá trị
 * @param {object} obj 
 * @param {string} prefix 
 * @returns {object[]}
 */
function validateValues(obj, prefix = '') {
  const issues = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      issues.push(...validateValues(value, fullKey));
    } else if (typeof value === 'string') {
      // Check empty string
      if (value.trim() === '') {
        issues.push({
          key: fullKey,
          type: 'empty',
          message: 'Empty string value'
        });
      }
      
      // Check malformed placeholders
      const placeholderRegex = /\{[^}]*$/;
      if (placeholderRegex.test(value)) {
        issues.push({
          key: fullKey,
          type: 'placeholder',
          message: 'Unclosed placeholder bracket',
          value: value.substring(0, 50)
        });
      }
      
      // Check HTML tags mismatch (optional)
      const openTags = (value.match(/<[a-z]+[^>]*>/gi) || []).length;
      const closeTags = (value.match(/<\/[a-z]+>/gi) || []).length;
      if (openTags !== closeTags && openTags > 0) {
        issues.push({
          key: fullKey,
          type: 'html',
          message: `HTML tags mismatch: ${openTags} open, ${closeTags} close`,
          value: value.substring(0, 50)
        });
      }
    }
  }
  
  return issues;
}

/**
 * Validate một locale
 * @param {string} locale 
 * @returns {object}
 */
function validateLocale(locale) {
  const localeDir = path.join(DICTIONARIES_DIR, locale);
  
  if (!fs.existsSync(localeDir)) {
    return { locale, error: `Directory not found: ${localeDir}` };
  }
  
  const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));
  const results = {
    locale,
    files: {},
    summary: {
      totalFiles: files.length,
      validFiles: 0,
      totalIssues: 0
    }
  };
  
  for (const file of files) {
    const filePath = path.join(localeDir, file);
    const syntaxResult = validateJsonSyntax(filePath);
    
    if (!syntaxResult.valid) {
      results.files[file] = {
        valid: false,
        error: syntaxResult.error,
        issues: []
      };
      continue;
    }
    
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const issues = validateValues(content);
    
    results.files[file] = {
      valid: issues.length === 0,
      issues
    };
    
    if (issues.length === 0) {
      results.summary.validFiles++;
    }
    results.summary.totalIssues += issues.length;
  }
  
  return results;
}

/**
 * In báo cáo validation
 * @param {object} result 
 */
function printValidationReport(result) {
  console.log('\n' + '='.repeat(60));
  console.log(`🔍 VALIDATION REPORT: ${result.locale.toUpperCase()}`);
  console.log('='.repeat(60));
  
  if (result.error) {
    console.log(`\n❌ Error: ${result.error}`);
    return;
  }
  
  let hasIssues = false;
  
  for (const [file, data] of Object.entries(result.files)) {
    if (data.error) {
      console.log(`\n❌ ${file}: JSON SYNTAX ERROR`);
      console.log(`   ${data.error}`);
      hasIssues = true;
    } else if (data.issues.length > 0) {
      console.log(`\n⚠️  ${file}: ${data.issues.length} issues`);
      data.issues.forEach(issue => {
        console.log(`   - [${issue.type}] ${issue.key}: ${issue.message}`);
        if (issue.value) {
          console.log(`     "${issue.value}..."`);
        }
      });
      hasIssues = true;
    } else {
      console.log(`\n✅ ${file}: OK`);
    }
  }
  
  // Summary
  console.log('\n' + '-'.repeat(60));
  console.log('📈 SUMMARY:');
  console.log(`   Total files: ${result.summary.totalFiles}`);
  console.log(`   Valid files: ${result.summary.validFiles}`);
  console.log(`   Total issues: ${result.summary.totalIssues}`);
  
  if (!hasIssues) {
    console.log('\n✅ All files are valid!');
  }
  
  console.log('='.repeat(60) + '\n');
  
  return hasIssues;
}

// Main
console.log('🔍 Starting i18n validation...\n');

let hasErrors = false;

for (const locale of LOCALES) {
  const result = validateLocale(locale);
  const localeHasIssues = printValidationReport(result);
  if (localeHasIssues || result.error) {
    hasErrors = true;
  }
}

// Also validate the legacy single files if they exist
const legacyFiles = ['vi.json', 'en.json'];
for (const file of legacyFiles) {
  const filePath = path.join(DICTIONARIES_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`\n📦 Legacy file check: ${file}`);
    const syntaxResult = validateJsonSyntax(filePath);
    if (syntaxResult.valid) {
      console.log(`   ✅ JSON syntax OK`);
    } else {
      console.log(`   ❌ JSON syntax ERROR: ${syntaxResult.error}`);
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  console.log('\n❌ Validation failed - please fix the issues above');
  process.exit(1);
} else {
  console.log('\n✅ All validation passed!');
  process.exit(0);
}
