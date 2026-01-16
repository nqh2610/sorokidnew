/**
 * 🌍 I18N CONFIG - SOROKID
 * 
 * Cấu hình đa ngôn ngữ tối ưu:
 * - Không tăng process
 * - Không tăng DB call
 * - Không tăng bundle (lazy load)
 * - SEO riêng biệt cho từng ngôn ngữ
 * 
 * @version 1.0.0
 */

import { TOOL_SLUG_VI_TO_EN, TOOL_SLUG_EN_TO_VI } from './toolSlugs';

// Các ngôn ngữ được hỗ trợ
export const locales = ['vi', 'en'];

// Ngôn ngữ mặc định
export const defaultLocale = 'vi';

// Cookie name để lưu preference
export const LOCALE_COOKIE = 'sorokid_locale';

// Cookie max age (1 năm)
export const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

// Config cho từng ngôn ngữ
export const localeConfig = {
  vi: {
    name: 'Tiếng Việt',
    flag: '🇻🇳',
    hreflang: 'vi-VN',
    htmlLang: 'vi',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: { decimal: ',', thousand: '.' },
  },
  en: {
    name: 'English',
    flag: '🇺🇸',
    hreflang: 'en-US',
    htmlLang: 'en',
    direction: 'ltr',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: { decimal: '.', thousand: ',' },
  },
};

// Mapping đường dẫn: từ slug VI sang EN và ngược lại
// Chỉ dùng cho các trang public có SEO
export const pathMappings = {
  // Homepage - giữ nguyên
  '/': '/',
  
  // Pricing
  '/pricing': '/pricing',
  
  // Blog
  '/blog': '/blog',
  
  // Tool pages - Mapping URL tiếng Việt sang tiếng Anh
  '/tool': '/tool',
  '/tool/chiec-non-ky-dieu': '/tool/spin-wheel',
  '/tool/dua-thu-hoat-hinh': '/tool/animal-race',
  '/tool/flash-zan': '/tool/flash-anzan',
  '/tool/dong-ho-bam-gio': '/tool/timer',
  '/tool/chia-nhom': '/tool/group-maker',
  '/tool/boc-tham': '/tool/random-picker',
  '/tool/ban-tinh-soroban': '/tool/virtual-soroban',
  '/tool/den-may-man': '/tool/lucky-light',
  '/tool/ai-la-trieu-phu': '/tool/millionaire-quiz',
  '/tool/cuoc-dua-ki-thu': '/tool/race-game',
  '/tool/xuc-xac': '/tool/dice-roller',
  '/tool/o-chu': '/tool/crossword',
  '/tool/chia-nhom-boc-tham': '/tool/group-picker',
};

// Tạo reverse mapping (EN -> VI)
export const reversePathMappings = Object.fromEntries(
  Object.entries(pathMappings).map(([vi, en]) => [en, vi])
);

// Helper: Lấy đường dẫn theo ngôn ngữ
export function getLocalizedPath(path, locale) {
  if (locale === 'vi') {
    return reversePathMappings[path] || path;
  }
  return pathMappings[path] || path;
}

// Helper: Lấy đường dẫn canonical (luôn là tiếng Việt)
export function getCanonicalPath(path) {
  return reversePathMappings[path] || path;
}

/**
 * 🌍 Helper: Lấy URL đầy đủ theo ngôn ngữ
 * - Tiếng Việt (default): /blog → /blog
 * - Tiếng Anh: /blog → /en/blog
 * - Tool slugs tự động chuyển đổi: /tool/dua-thu-hoat-hinh → /en/tool/animal-race
 * 
 * @param {string} path - Path hiện tại (không có /en prefix)
 * @param {string} targetLocale - Ngôn ngữ muốn chuyển đến
 * @returns {string} - URL đầy đủ cho ngôn ngữ đó
 */
export function getLocalizedUrl(path, targetLocale) {
  // Đảm bảo path bắt đầu bằng /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Bỏ /en prefix nếu có
  let pathWithoutLocale = cleanPath.startsWith('/en/') 
    ? cleanPath.slice(3) 
    : cleanPath === '/en' 
      ? '/' 
      : cleanPath;
  
  // Check và chuyển đổi tool slugs
  const toolMatch = pathWithoutLocale.match(/^\/tool\/([^\/]+)(.*)?$/);
  if (toolMatch) {
    const currentSlug = toolMatch[1];
    const restPath = toolMatch[2] || '';
    
    if (targetLocale === 'en' && TOOL_SLUG_VI_TO_EN[currentSlug]) {
      // Chuyển từ VI slug sang EN slug
      pathWithoutLocale = `/tool/${TOOL_SLUG_VI_TO_EN[currentSlug]}${restPath}`;
    } else if (targetLocale === 'vi' && TOOL_SLUG_EN_TO_VI[currentSlug]) {
      // Chuyển từ EN slug sang VI slug  
      pathWithoutLocale = `/tool/${TOOL_SLUG_EN_TO_VI[currentSlug]}${restPath}`;
    }
  }
  
  // Tiếng Việt (default) - giữ nguyên path
  if (targetLocale === 'vi' || targetLocale === defaultLocale) {
    return pathWithoutLocale;
  }
  
  // Tiếng Anh - thêm /en prefix
  if (targetLocale === 'en') {
    return pathWithoutLocale === '/' ? '/en' : `/en${pathWithoutLocale}`;
  }
  
  // Các ngôn ngữ khác trong tương lai - thêm prefix
  return `/${targetLocale}${pathWithoutLocale}`;
}

/**
 * 🌍 Helper: Lấy path thuần từ URL (bỏ locale prefix)
 * /en/blog → /blog
 * /blog → /blog
 */
export function getPathWithoutLocale(url) {
  if (url.startsWith('/en/')) {
    return url.slice(3) || '/';
  }
  if (url === '/en') {
    return '/';
  }
  return url;
}

/**
 * 🌍 Helper: Detect locale từ URL
 */
export function getLocaleFromUrl(url) {
  if (url.startsWith('/en/') || url === '/en') {
    return 'en';
  }
  return 'vi';
}

// Helper: Kiểm tra xem path có phải là public page (cần SEO)
export function isPublicPath(path) {
  const publicPatterns = [
    /^\/$/,           // Homepage
    /^\/blog/,        // Blog
    /^\/tool/,        // Tools
    /^\/pricing/,     // Pricing
  ];
  return publicPatterns.some(pattern => pattern.test(path));
}

// Helper: Detect locale từ Accept-Language header
export function detectLocaleFromHeader(acceptLanguage) {
  if (!acceptLanguage) return defaultLocale;
  
  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(),
        q: qValue ? parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.q - a.q);
  
  // Tìm ngôn ngữ phù hợp
  for (const lang of languages) {
    if (locales.includes(lang.code)) {
      return lang.code;
    }
  }
  
  return defaultLocale;
}
