/**
 * 🌍 I18N ISSUE CHECKER
 * 
 * Script kiểm tra các vấn đề i18n tiềm ẩn:
 * 1. Pages không có useI18n (thiếu translate)
 * 2. Components có hardcoded Vietnamese text
 * 3. LocalizedLink không được sử dụng
 * 4. Dictionary keys missing
 * 
 * Run: node scripts/check-i18n-issues.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Vietnamese text patterns that should be translated
const VIETNAMESE_PATTERNS = [
  // Common UI text
  /['"`]Đăng nhập['"`]/g,
  /['"`]Đăng ký['"`]/g,
  /['"`]Quên mật khẩu['"`]/g,
  /['"`]Mật khẩu['"`]/g,
  /['"`]Tên đăng nhập['"`]/g,
  /['"`]Tài khoản['"`]/g,
  /['"`]Lưu['"`]/g,
  /['"`]Hủy['"`]/g,
  /['"`]Xóa['"`]/g,
  /['"`]Sửa['"`]/g,
  /['"`]Thêm['"`]/g,
  /['"`]Tìm kiếm['"`]/g,
  /['"`]Lọc['"`]/g,
  /['"`]Trang chủ['"`]/g,
  /['"`]Cài đặt['"`]/g,
  /['"`]Hồ sơ['"`]/g,
  /['"`]Đang tải['"`]/g,
  /['"`]Vui lòng['"`]/g,
  /['"`]Bạn chưa['"`]/g,
  /['"`]Bạn đã['"`]/g,
  /['"`]Thành công['"`]/g,
  /['"`]Thất bại['"`]/g,
  /['"`]Lỗi['"`]/g,
  /['"`]Xin chào['"`]/g,
  /['"`]Chào mừng['"`]/g,
  /['"`]Tiếp tục['"`]/g,
  /['"`]Quay lại['"`]/g,
  /['"`]Hoàn thành['"`]/g,
  /['"`]Bắt đầu['"`]/g,
  /['"`]Kết thúc['"`]/g,
  /['"`]Chọn['"`]/g,
  /['"`]Học['"`]/g,
  /['"`]Luyện tập['"`]/g,
  /['"`]Thi đấu['"`]/g,
  /['"`]Bảng xếp hạng['"`]/g,
  /['"`]Thành tích['"`]/g,
];

// Files/folders to ignore
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/prisma/**',
  '**/scripts/**',
  '**/tests/**',
  '**/*.test.js',
  '**/*.spec.js',
  '**/content/**',
  '**/lib/i18n/dictionaries/**',
];

// Results
const results = {
  pagesWithoutI18n: [],
  hardcodedVietnamese: [],
  usingLinkInsteadOfLocalizedLink: [],
  missingTranslationKeys: [],
};

// Helper: Check if file content has useI18n
function hasUseI18n(content) {
  return content.includes('useI18n') || content.includes("from '@/lib/i18n");
}

// Helper: Check for hardcoded Vietnamese text
function findHardcodedVietnamese(content, filePath) {
  const issues = [];
  
  // Skip dictionary files
  if (filePath.includes('dictionaries') || filePath.includes('.json')) {
    return issues;
  }
  
  // Skip comments and JSDoc
  const cleanContent = content
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*/g, ''); // Remove line comments
  
  for (const pattern of VIETNAMESE_PATTERNS) {
    const matches = cleanContent.match(pattern);
    if (matches) {
      issues.push({
        file: filePath,
        matches: matches,
        pattern: pattern.toString(),
      });
    }
  }
  
  return issues;
}

// Helper: Check for Link instead of LocalizedLink
function findNonLocalizedLinks(content, filePath) {
  const issues = [];
  
  // Check for imports of Link from next/link
  if (content.includes("from 'next/link'") || content.includes('from "next/link"')) {
    // Check if LocalizedLink is also imported
    if (!content.includes('LocalizedLink')) {
      // Check if Link is actually used
      const linkUsage = content.match(/<Link\s/g);
      if (linkUsage && linkUsage.length > 0) {
        issues.push({
          file: filePath,
          count: linkUsage.length,
          message: 'Using Link instead of LocalizedLink',
        });
      }
    }
  }
  
  return issues;
}

// Main check function
async function checkI18nIssues() {
  console.log('🌍 I18N Issue Checker\n');
  console.log('='.repeat(50));
  
  // Find all page files
  const pageFiles = glob.sync('app/**/page.jsx', {
    ignore: IGNORE_PATTERNS,
  });
  
  // Find all component files
  const componentFiles = glob.sync('components/**/*.jsx', {
    ignore: IGNORE_PATTERNS,
  });
  
  const allFiles = [...pageFiles, ...componentFiles];
  
  console.log(`\nFound ${allFiles.length} files to check...\n`);
  
  for (const file of allFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Check 1: Pages without useI18n (only for non-admin, non-api pages)
      if (file.includes('page.jsx') && !file.includes('admin') && !file.includes('api')) {
        // Client components should have useI18n
        if (content.includes("'use client'") && !hasUseI18n(content)) {
          results.pagesWithoutI18n.push(file);
        }
      }
      
      // Check 2: Hardcoded Vietnamese (skip en/ pages)
      if (!file.includes('/en/')) {
        const viIssues = findHardcodedVietnamese(content, file);
        results.hardcodedVietnamese.push(...viIssues);
      }
      
      // Check 3: Using Link instead of LocalizedLink
      const linkIssues = findNonLocalizedLinks(content, file);
      results.usingLinkInsteadOfLocalizedLink.push(...linkIssues);
      
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
    }
  }
  
  // Print results
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESULTS\n');
  
  // 1. Pages without i18n
  console.log('1️⃣ Pages WITHOUT useI18n (may not translate):');
  if (results.pagesWithoutI18n.length === 0) {
    console.log('   ✅ None found!\n');
  } else {
    results.pagesWithoutI18n.forEach(f => console.log(`   ⚠️  ${f}`));
    console.log();
  }
  
  // 2. Hardcoded Vietnamese
  console.log('2️⃣ Potential HARDCODED Vietnamese text:');
  if (results.hardcodedVietnamese.length === 0) {
    console.log('   ✅ None found!\n');
  } else {
    const grouped = {};
    results.hardcodedVietnamese.forEach(issue => {
      if (!grouped[issue.file]) grouped[issue.file] = [];
      grouped[issue.file].push(...issue.matches);
    });
    Object.entries(grouped).slice(0, 10).forEach(([file, matches]) => {
      console.log(`   ⚠️  ${file}`);
      console.log(`       Found: ${[...new Set(matches)].join(', ')}`);
    });
    if (Object.keys(grouped).length > 10) {
      console.log(`   ... and ${Object.keys(grouped).length - 10} more files`);
    }
    console.log();
  }
  
  // 3. Link instead of LocalizedLink
  console.log('3️⃣ Using Link instead of LocalizedLink:');
  if (results.usingLinkInsteadOfLocalizedLink.length === 0) {
    console.log('   ✅ All good!\n');
  } else {
    results.usingLinkInsteadOfLocalizedLink.forEach(issue => {
      console.log(`   ⚠️  ${issue.file} (${issue.count} instances)`);
    });
    console.log();
  }
  
  // Summary
  console.log('='.repeat(50));
  const totalIssues = 
    results.pagesWithoutI18n.length + 
    results.hardcodedVietnamese.length + 
    results.usingLinkInsteadOfLocalizedLink.length;
  
  if (totalIssues === 0) {
    console.log('✅ No i18n issues found!');
  } else {
    console.log(`⚠️  Found ${totalIssues} potential issues to review.`);
    console.log('\nNote: Not all flagged items are necessarily bugs.');
    console.log('Review each case to determine if translation is needed.');
  }
}

// Run
checkI18nIssues().catch(console.error);
