/**
 * 🔧 DICTIONARY LOADER - LAZY LOAD
 * 
 * Tải dictionary theo ngôn ngữ:
 * - Lazy load: chỉ load khi cần
 * - Tree-shake: không load toàn bộ
 * - Cache: không load lại
 * 
 * @version 1.0.0
 */

import { defaultLocale } from './config';

// Cache để không load lại dictionary
const dictionaryCache = new Map();

/**
 * Tải dictionary theo ngôn ngữ
 * Lazy load với dynamic import
 * 
 * @param {string} locale - 'vi' hoặc 'en'
 * @returns {Promise<object>} - Dictionary object
 */
export async function getDictionary(locale = defaultLocale) {
  // Check cache
  if (dictionaryCache.has(locale)) {
    return dictionaryCache.get(locale);
  }
  
  // Lazy load dictionary
  let dictionary;
  
  try {
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
  
  // Cache dictionary
  dictionaryCache.set(locale, dictionary);
  
  return dictionary;
}

/**
 * Lấy dictionary đồng bộ (cho Server Components)
 * Sử dụng require thay vì import
 * 
 * @param {string} locale - 'vi' hoặc 'en'
 * @returns {object} - Dictionary object
 */
export function getDictionarySync(locale = defaultLocale) {
  // Check cache
  if (dictionaryCache.has(locale)) {
    return dictionaryCache.get(locale);
  }
  
  let dictionary;
  
  try {
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
  
  // Cache dictionary
  dictionaryCache.set(locale, dictionary);
  
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
