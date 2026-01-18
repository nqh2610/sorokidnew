'use client';

/**
 * 🌍 I18N CONTEXT - CLIENT SIDE
 * 
 * Context provider cho đa ngôn ngữ:
 * - Detect từ cookie (không gọi API)
 * - Switch không reload page (client navigation)
 * - Đổi URL khi switch ngôn ngữ (SEO)
 * - Lưu preference vào cookie
 * 
 * @version 2.0.0 - Thêm URL-based switching cho SEO
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales, defaultLocale, LOCALE_COOKIE, COOKIE_MAX_AGE, localeConfig, getLocalizedUrl, getPathWithoutLocale } from './config';

// Context
const I18nContext = createContext(null);

/**
 * 🍪 Helper: Đọc cookie trên client
 */
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

/**
 * Provider component
 */
export function I18nProvider({ children, initialLocale = defaultLocale, dictionary = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // 🔥 Detect locale từ URL pathname
  const getLocaleFromPath = useCallback((path) => {
    if (path?.startsWith('/en/') || path === '/en') {
      return 'en';
    }
    return null; // Không xác định được từ URL
  }, []);
  
  // 🔥 Detect locale từ nhiều nguồn
  // Ưu tiên: 1. URL có /en/ → en | 2. Cookie → en/vi | 3. initialLocale → vi
  // ⚠️ Cookie quan trọng vì middleware rewrite /en/xxx → /xxx + set cookie
  const detectInitialLocale = useCallback(() => {
    // 1. URL có /en/ prefix rõ ràng → EN
    const urlLocale = getLocaleFromPath(pathname);
    if (urlLocale) return urlLocale;
    
    // 2. Cookie (middleware set khi rewrite /en/xxx → /xxx)
    const cookieLocale = getCookie(LOCALE_COOKIE);
    if (cookieLocale && locales.includes(cookieLocale)) {
      return cookieLocale;
    }
    
    // 3. initialLocale từ server
    return initialLocale;
  }, [pathname, getLocaleFromPath, initialLocale]);
  
  const [locale, setLocaleState] = useState(detectInitialLocale);
  const [dict, setDict] = useState(dictionary);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedLocale, setLoadedLocale] = useState(initialLocale);
  
  // 🔥 SYNC: Khi pathname/cookie thay đổi → cập nhật locale state
  useEffect(() => {
    // Detect locale theo thứ tự ưu tiên
    const urlLocale = getLocaleFromPath(pathname);
    const cookieLocale = getCookie(LOCALE_COOKIE);
    
    // Ưu tiên: URL > Cookie > default
    let detectedLocale;
    if (urlLocale) {
      // URL có /en/ → EN (user đang ở trang EN với file riêng)
      detectedLocale = urlLocale;
    } else if (cookieLocale && locales.includes(cookieLocale)) {
      // Cookie có giá trị hợp lệ (middleware đã set khi rewrite)
      detectedLocale = cookieLocale;
    } else {
      // Mặc định
      detectedLocale = defaultLocale;
    }
    
    if (detectedLocale !== locale) {
      // Update state
      setLocaleState(detectedLocale);
      
      // Update HTML lang
      document.documentElement.lang = localeConfig[detectedLocale]?.htmlLang || detectedLocale;
    }
  }, [pathname, locale, getLocaleFromPath]);
  
  // Load dictionary khi locale thay đổi
  useEffect(() => {
    async function loadDictionary() {
      // Chỉ load khi locale khác với locale đã load
      if (locale === loadedLocale) {
        return; // Đã có dictionary cho locale này
      }
      
      setIsLoading(true);
      try {
        // Load dictionary từ file gốc
        const newDict = await import(`./dictionaries/${locale}.json`);
        setDict(newDict.default);
        setLoadedLocale(locale); // Cập nhật locale đã load
      } catch (error) {
        console.error('Failed to load dictionary:', error);
      }
      setIsLoading(false);
    }
    
    loadDictionary();
  }, [locale, loadedLocale]);
  
  /**
   * 🌍 Switch locale - ĐỔI URL + COOKIE (SEO + UX)
   * - Đổi URL: /blog → /en/blog hoặc ngược lại
   * - Lưu cookie: ghi nhớ preference
   * - Không reload: dùng router.push (client navigation)
   */
  const setLocale = useCallback((newLocale, options = {}) => {
    if (!locales.includes(newLocale)) {
      console.warn(`Invalid locale: ${newLocale}`);
      return;
    }
    
    // Nếu locale không đổi, không làm gì
    if (newLocale === locale) return;
    
    // Lưu vào cookie (ghi nhớ preference)
    document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
    
    // Update state để trigger dictionary load
    setLocaleState(newLocale);
    
    // Update HTML lang attribute
    document.documentElement.lang = localeConfig[newLocale].htmlLang;
    
    // 🔥 QUAN TRỌNG: Đổi URL (client navigation, không reload)
    // Lấy path thuần (không có /en prefix)
    const cleanPath = getPathWithoutLocale(pathname);
    // Tạo URL mới theo locale mới
    const newUrl = getLocalizedUrl(cleanPath, newLocale);
    
    // Navigate (shallow = false để middleware chạy và set cookie)
    if (options.skipNavigation !== true) {
      router.push(newUrl, { scroll: false });
    }
  }, [locale, pathname, router]);
  
  // 🔥 FIX: Update document title & meta khi locale/dict thay đổi
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Update HTML lang
    document.documentElement.lang = localeConfig[locale]?.htmlLang || locale;
    
    // Update document title từ dict
    const seoTitle = dict?.seo?.home?.title;
    if (seoTitle) {
      document.title = seoTitle;
    }
    
    // Update meta description
    const seoDesc = dict?.seo?.home?.description;
    if (seoDesc) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', seoDesc);
      }
    }
    
    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    
    if (ogTitle && seoTitle) ogTitle.setAttribute('content', seoTitle);
    if (ogDesc && seoDesc) ogDesc.setAttribute('content', seoDesc);
    if (ogLocale) ogLocale.setAttribute('content', localeConfig[locale]?.hreflang?.replace('-', '_') || 'vi_VN');
    
  }, [locale, dict]);
  
  // Toggle locale (VI <-> EN)
  const toggleLocale = useCallback(() => {
    const newLocale = locale === 'vi' ? 'en' : 'vi';
    setLocale(newLocale);
  }, [locale, setLocale]);
  
  // Translate function
  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = dict;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Key not found
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      return value;
    }
    
    // Replace placeholders
    let result = value;
    for (const [param, replacement] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), replacement);
    }
    
    return result;
  }, [dict]);

  /**
   * 🌍 Translate DB content (lessons, theory, practice instructions)
   * Lookup từ dictionary với key format: {type}.{id}
   * @param {string} type - 'lessonContent' | etc
   * @param {string} key - ID dạng "1-1" hoặc text gốc (cho theory/practice)
   * @param {string} fallback - Giá trị mặc định nếu không tìm thấy
   * @returns {string|object} - Bản dịch hoặc fallback
   */
  const translateDb = useCallback((type, key, fallback = '') => {
    // Nếu là tiếng Việt, trả về content gốc (DB đã lưu tiếng Việt)
    if (locale === 'vi') return fallback || key;
    
    // Lookup trong dictionary (trong db namespace vì lessonContent nằm trong db)
    const translations = dict?.db?.[type];
    if (!translations) return fallback || key;
    
    // Nếu key là object path (e.g. "1-1.title")
    if (key.includes('.')) {
      const [id, field] = key.split('.');
      return translations[id]?.[field] || fallback || key;
    }
    
    // Nếu key là ID đơn giản, trả về object hoặc string
    const result = translations[key];
    if (result !== undefined) return result;
    
    return fallback || key;
  }, [locale, dict]);

  /**
   * 🌍 Translate lesson level name (18 levels)
   * @param {number|string} levelId - Level ID (1-18)
   * @param {string} fallback - Vietnamese name from database
   * @returns {string} - Translated level name
   */
  const translateLevelName = useCallback((levelId, fallback = '') => {
    const translated = dict?.dashboard?.lessonLevelNames?.[String(levelId)];
    return translated || fallback || `Level ${levelId}`;
  }, [dict]);

  /**
   * 🌍 Translate practice question từ Vietnamese sang locale hiện tại
   * Sử dụng regex patterns để match và replace
   * @param {string} question - Câu hỏi tiếng Việt từ DB
   * @returns {string} - Câu hỏi đã dịch
   */
  const translatePracticeQuestion = useCallback((question) => {
    if (locale === 'vi' || !question) return question;
    
    const patterns = dict?.db?.practiceQuestions?.patterns;
    if (!patterns) return question;
    
    // Thử match từng pattern
    for (const [viPattern, enTemplate] of Object.entries(patterns)) {
      try {
        const regex = new RegExp(viPattern, 'i');
        if (regex.test(question)) {
          return question.replace(regex, enTemplate);
        }
      } catch (e) {
        // Bỏ qua pattern lỗi
      }
    }
    
    return question;
  }, [locale, dict]);

  /**
   * 🌍 Translate Soroban guide text (step titles, instructions)
   * Pattern-based translation từ tiếng Việt sang locale hiện tại
   * @param {string} text - Text tiếng Việt từ guide
   * @returns {string} - Text đã dịch
   */
  const translateGuideText = useCallback((text) => {
    if (locale === 'vi' || !text) return text;
    
    const guide = dict?.db?.sorobanGuide;
    if (!guide) return text;
    
    let result = text;
    
    // Translate column names
    const columnLabels = guide.columnLabels || {};
    for (const [vi, en] of Object.entries(columnLabels)) {
      result = result.replace(new RegExp(`Cột ${vi}`, 'g'), `${en} col`);
      result = result.replace(new RegExp(vi, 'g'), en);
    }
    
    // Translate common patterns
    result = result
      // ======== ADDITION/SUBTRACTION PATTERNS ========
      // Actions
      .replace(/Đặt số (\d+)/g, 'Set number $1')
      .replace(/Đặt hàng Chục: (\d+)/g, 'Set Tens: $1')
      .replace(/Đặt hàng Đơn vị: (\d+)/g, 'Set Units: $1')
      .replace(/Gạt (\d+) hạt đất LÊN/g, 'Slide $1 Earth bead(s) UP')
      .replace(/Gạt (\d+) hạt đất XUỐNG/g, 'Slide $1 Earth bead(s) DOWN')
      .replace(/Gạt hạt trời XUỐNG/g, 'Slide Heaven bead DOWN')
      .replace(/Gạt hạt trời LÊN/g, 'Slide Heaven bead UP')
      .replace(/giữ nguyên \(đã là 0\)/g, 'unchanged (already 0)')
      .replace(/giữ nguyên/g, 'unchanged')
      // Rules
      .replace(/Quy tắc BẠN NHỎ/g, 'Small Friend rule')
      .replace(/Quy tắc BẠN LỚN/g, 'Big Friend rule')
      .replace(/Quy tắc:/g, 'Rule:')
      .replace(/bạn nhỏ của (\d+) là (\d+)/gi, 'Small Friend of $1 is $2')
      .replace(/bạn lớn của (\d+) là (\d+)/gi, 'Big Friend of $1 is $2')
      .replace(/Bạn lớn/g, 'Big Friend')
      .replace(/Bạn nhỏ/g, 'Small Friend')
      // Carry/Borrow
      .replace(/Nhớ (\d+) sang/g, 'Carry $1 to')
      .replace(/Mượn (\d+) từ/g, 'Borrow $1 from')
      .replace(/\+1 vào hàng cao hơn/g, '+1 carry')
      .replace(/\+10/g, '+10')
      .replace(/-10/g, '-10')
      // Column names (addition/subtraction)
      .replace(/hàng chục/gi, 'tens')
      .replace(/hàng đơn vị/gi, 'units')
      .replace(/hàng trăm/gi, 'hundreds')
      .replace(/hàng nghìn/gi, 'thousands')
      // Steps
      .replace(/Bước (\d+)/g, 'Step $1')
      .replace(/Kết quả/g, 'Result')
      .replace(/số (\d+)/g, 'number $1')
      
      // ======== MULTIPLICATION PATTERNS ========
      .replace(/Phương pháp nhân/g, 'Multiplication method')
      .replace(/Dùng bảng cửu chương:/g, 'Using multiplication table:')
      .replace(/Dùng bảng cửu chương và cộng dồn từng bước\./g, 'Use multiplication table and accumulate step by step.')
      .replace(/Bây giờ đặt kết quả (\d+) lên Soroban/g, 'Now set result $1 on Soroban')
      .replace(/Tách số nhân (\d+):/g, 'Split multiplier $1:')
      .replace(/Tách:/g, 'Split:')
      .replace(/Làm từng bước:/g, 'Step by step:')
      .replace(/Tính:/g, 'Calculate:')
      .replace(/Đặt kết quả: (\d+)/g, 'Set result: $1')
      .replace(/Đặt (\d+) vào hàng Chục \(= (\d+)\)/g, 'Set $1 in Tens (= $2)')
      .replace(/Đặt (\d+) vào hàng/g, 'Set $1 in')
      .replace(/Đặt (\d+) vào/g, 'Set $1 in')
      .replace(/Cộng (\d+) vào hàng/g, 'Add $1 to')
      .replace(/Cộng (\d+) vào/g, 'Add $1 to')
      .replace(/Đầu tiên cộng (\d+) vào hàng Chục:/g, 'First add $1 to Tens:')
      .replace(/Cộng hàng Đơn vị: (\d+)/g, 'Add to Units: $1')
      .replace(/Nhân từng chữ số từ trái sang phải:/g, 'Multiply each digit from left to right:')
      .replace(/Rồi cộng dồn vào Soroban/g, 'Then accumulate on Soroban')
      .replace(/Gạt bàn tính để được kết quả (\d+)/g, 'Set Soroban to get result $1')
      .replace(/Đây là phép nhân nâng cao\./g, 'This is an advanced multiplication.')
      .replace(/Hãy tính:/g, 'Calculate:')
      .replace(/Kết quả đúng:/g, 'Correct answer:')
      .replace(/Tổng =/g, 'Total =')
      .replace(/Phần (\d+):/g, 'Part $1:')
      .replace(/Tiếp:/g, 'Next:')
      .replace(/→ Trăm/g, '→ Hund')
      .replace(/→ Chục/g, '→ Tens')
      .replace(/→ Đơn vị/g, '→ Units')
      
      // ======== DIVISION PATTERNS ========
      .replace(/Phương pháp: Chia từng chữ số từ TRÁI sang PHẢI/g, 'Method: Divide each digit from LEFT to RIGHT')
      .replace(/Lấy từng chữ số chia cho (\d+)/g, 'Take each digit and divide by $1')
      .replace(/Ghi thương, trừ ngay/g, 'Write quotient, subtract immediately')
      .replace(/Dư thì ghép với số tiếp theo/g, 'Carry remainder to next digit')
      .replace(/🧮 SỐ BỊ CHIA:/g, '🧮 DIVIDEND:')
      .replace(/📊 THƯƠNG SỐ:/g, '📊 QUOTIENT:')
      .replace(/Gạt số (\d+) vào hàng/g, 'Set $1 in')
      .replace(/không đủ chia cho (\d+)/g, 'not enough to divide by $1')
      .replace(/→ Ghép với chữ số tiếp theo/g, '→ Combine with next digit')
      .replace(/Ghi thương (\d+)/g, 'Write quotient $1')
      .replace(/\(dư (\d+)\)/g, '(remainder $1)')
      .replace(/→ Còn dư (\d+), ghép tiếp/g, '→ Remainder $1, continue')
      .replace(/Trừ (\d+)/g, 'Subtract $1')
      .replace(/✅ Đáp số: Thương (\d+), Dư (\d+)/g, '✅ Answer: Quotient $1, Remainder $2')
      .replace(/✅ Đáp số: (\d+)/g, '✅ Answer: $1')
      
      // Division multi-digit (trial quotient method)
      .replace(/Phương pháp THỬ THƯƠNG:/g, 'TRIAL QUOTIENT method:')
      .replace(/Lấy chữ số đầu của số chia \((\d+)\)/g, 'Take first digit of divisor ($1)')
      .replace(/Chia thử để ước lượng thương/g, 'Trial divide to estimate quotient')
      .replace(/Nhân ngược kiểm tra, điều chỉnh nếu cần/g, 'Multiply back to verify, adjust if needed')
      .replace(/Ước lượng:/g, 'Estimate:')
      .replace(/Cách làm: Lấy (\d+) ÷ (\d+) = (\d+)/g, 'Method: Take $1 ÷ $2 = $3')
      .replace(/Thử (\d+):/g, 'Try $1:')
      .replace(/quá lớn!/g, 'too large!')
      .replace(/còn chia được!/g, 'can still divide!')
      .replace(/Giảm xuống (\d+):/g, 'Decrease to $1:')
      .replace(/Tăng lên (\d+):/g, 'Increase to $1:')
      .replace(/vừa khớp!/g, 'exact match!')
      .replace(/Thương là (\d+)/g, 'Quotient is $1')
      
      // ======== COMMON COLUMN NAMES (for multiplication/division) ========
      .replace(/Vạn/g, 'TenTh')
      .replace(/Ngàn/g, 'Thou')
      .replace(/Trăm triệu/g, 'HundMil')
      .replace(/Chục triệu/g, 'TenMil')
      .replace(/Triệu/g, 'Mil')
      .replace(/Trăm nghìn/g, 'HundTh')
      .replace(/Chục nghìn/g, 'TenTh')
      .replace(/Nghìn/g, 'Thou')
      .replace(/Trăm/g, 'Hund')
      .replace(/Chục/g, 'Tens')
      .replace(/ĐV/g, 'Units')
      .replace(/Đơn vị/g, 'Units')
      .replace(/đơn vị/g, 'units')
      .replace(/chục/g, 'tens')
      .replace(/trăm/g, 'hundreds')
      
      // ======== OTHER COMMON PATTERNS ========
      .replace(/Lỗi/g, 'Error')
      .replace(/Không phân tích được bài toán/g, 'Could not parse the problem');
    
    return result;
  }, [locale, dict]);
  
  // Context value - memoized
  const contextValue = useMemo(() => ({
    locale,
    locales,
    setLocale,
    toggleLocale,
    t,
    translateDb,
    translateLevelName,
    translatePracticeQuestion,
    translateGuideText,
    dictionary: dict,
    isLoading,
    config: localeConfig[locale],
  }), [locale, setLocale, toggleLocale, t, translateDb, translateLevelName, translatePracticeQuestion, translateGuideText, dict, isLoading]);
  
  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook để sử dụng i18n
 * Trả về null-safe object nếu chưa có Provider
 */
export function useI18n() {
  const context = useContext(I18nContext);
  
  // Safe fallback khi chưa có Provider
  if (!context) {
    return {
      locale: 'vi',
      locales: ['vi', 'en'],
      setLocale: () => console.warn('I18nProvider not found'),
      toggleLocale: () => console.warn('I18nProvider not found'),
      t: (key) => key,
      translateDb: (type, key, fallback) => fallback || key,
      translateLevelName: (levelId, fallback) => fallback || `Level ${levelId}`,
      translatePracticeQuestion: (q) => q,
      translateGuideText: (text) => text,
      dictionary: {},
      isLoading: false,
      config: { name: 'Tiếng Việt', flag: '🇻🇳', htmlLang: 'vi' },
    };
  }
  
  return context;
}

/**
 * Hook chỉ lấy translate function
 */
export function useTranslation() {
  const { t, locale, isLoading } = useI18n();
  return { t, locale, isLoading };
}

/**
 * Hook để lấy config của locale hiện tại
 */
export function useLocaleConfig() {
  const { locale, config } = useI18n();
  return { locale, ...config };
}

export default I18nContext;
