/**
 * 🔧 DICTIONARY LOADER - MODULAR LAZY LOAD
 * 
 * Tải dictionary theo ngôn ngữ VÀ route:
 * - Modular: tách thành nhiều file nhỏ theo namespace
 * - Lazy load: chỉ load namespaces cần thiết cho route
 * - Smart cache: cache theo locale + namespaces
 * - Backward compatible: hỗ trợ full load cho code cũ
 * 
 * @version 2.0.1 - Fixed dynamic import issue
 */

import { defaultLocale } from './config';

// Cache theo locale (full dictionary)
const fullDictionaryCache = new Map();

/**
 * Tải TOÀN BỘ dictionary 
 * Sử dụng file gốc để đảm bảo tương thích
 * 
 * @param {string} locale - 'vi' hoặc 'en'
 * @returns {Promise<object>} - Full dictionary object
 */
export async function getDictionary(locale = defaultLocale) {
  // Check cache
  if (fullDictionaryCache.has(locale)) {
    return fullDictionaryCache.get(locale);
  }
  
  let dictionary;
  
  try {
    // Load từ file gốc (đảm bảo tương thích)
    switch (locale) {
      case 'en':
        dictionary = (await import('./dictionaries/en.json')).default;
        break;
      case 'vi':
      default:
        dictionary = (await import('./dictionaries/vi.json')).default;
        break;
    }
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error);
    // Fallback to Vietnamese
    dictionary = (await import('./dictionaries/vi.json')).default;
  }
  
  // Cache
  fullDictionaryCache.set(locale, dictionary);
  
  return dictionary;
}

/**
 * Alias cho getDictionary - backward compatible
 */
export async function getDictionaryForRoute(locale = defaultLocale, pathname = '/') {
  // Hiện tại load full dictionary, sau này có thể tối ưu theo route
  return getDictionary(locale);
}

/**
 * Lấy dictionary đồng bộ (cho Server Components)
 * Load TOÀN BỘ dictionary - dùng cho SSR/SSG
 * 
 * @param {string} locale - 'vi' hoặc 'en'
 * @returns {object} - Full dictionary object
 */
export function getDictionarySync(locale = defaultLocale) {
  // Check cache
  if (fullDictionaryCache.has(locale)) {
    return fullDictionaryCache.get(locale);
  }
  
  let dictionary;
  
  try {
    // Load từ file gốc
    switch (locale) {
      case 'en':
        dictionary = require('./dictionaries/en.json');
        break;
      case 'vi':
      default:
        dictionary = require('./dictionaries/vi.json');
        break;
    }
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error);
    dictionary = require('./dictionaries/vi.json');
  }
  
  // Cache
  fullDictionaryCache.set(locale, dictionary);
  
  return dictionary;
}

/**
 * Helper: Lấy nested value từ dictionary
 * Ví dụ: t('home.hero.title') -> dictionary.home.hero.title
 * 
 * @param {object} dictionary - Dictionary object
 * @param {string} key - Dot-notation key
 * @param {object} params - Parameters để replace {placeholder}
 * @returns {string} - Translated string
 */
export function translate(dictionary, key, params = {}) {
  // Split key by dot
  const keys = key.split('.');
  let value = dictionary;
  
  // Traverse dictionary
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Key not found, return key itself
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  // If not string, return as is
  if (typeof value !== 'string') {
    return value;
  }
  
  // Replace placeholders {param}
  let result = value;
  for (const [param, replacement] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), replacement);
  }
  
  return result;
}

/**
 * Tạo t function cho một locale cụ thể
 * 
 * @param {string} locale - 'vi' hoặc 'en'
 * @returns {Function} - t(key, params) function
 */
export function createTranslator(locale) {
  const dictionary = getDictionarySync(locale);
  
  return function t(key, params = {}) {
    return translate(dictionary, key, params);
  };
}
