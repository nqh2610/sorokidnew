/**
 * 🚀 DICTIONARY PRELOADER
 * 
 * Preload dictionary cho navigation nhanh hơn:
 * - Prefetch dictionary khi hover link
 * - Cache trong memory
 * - Giảm loading time khi switch locale
 * 
 * @version 1.0.0
 */

// Cache đã preload
const preloadedCache = new Set();
const dictionaryPromises = new Map();

/**
 * Preload dictionary cho một locale
 * Gọi khi user hover vào language switcher
 * 
 * @param {string} locale - 'vi' hoặc 'en'
 */
export function preloadDictionary(locale) {
  // Đã preload rồi thì skip
  if (preloadedCache.has(locale)) {
    return Promise.resolve();
  }
  
  // Đang preload thì return promise hiện tại
  if (dictionaryPromises.has(locale)) {
    return dictionaryPromises.get(locale);
  }
  
  // Bắt đầu preload
  const promise = import(`./dictionaries/${locale}.json`)
    .then((module) => {
      preloadedCache.add(locale);
      return module.default;
    })
    .catch((error) => {
      console.warn(`Failed to preload dictionary for ${locale}:`, error);
      dictionaryPromises.delete(locale);
    });
  
  dictionaryPromises.set(locale, promise);
  return promise;
}

/**
 * Preload cả 2 dictionaries (dùng cho initial load nếu cần)
 */
export function preloadAllDictionaries() {
  return Promise.all([
    preloadDictionary('vi'),
    preloadDictionary('en'),
  ]);
}

/**
 * Kiểm tra dictionary đã được preload chưa
 * @param {string} locale 
 */
export function isDictionaryPreloaded(locale) {
  return preloadedCache.has(locale);
}

/**
 * Hook để preload dictionary khi hover
 * Sử dụng: onMouseEnter={() => preloadOnHover('en')}
 */
export function preloadOnHover(locale) {
  // Chỉ preload nếu chưa có
  if (!preloadedCache.has(locale)) {
    preloadDictionary(locale);
  }
}
