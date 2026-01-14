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
 * Provider component
 */
export function I18nProvider({ children, initialLocale = defaultLocale, dictionary = {} }) {
  const [locale, setLocaleState] = useState(initialLocale);
  const [dict, setDict] = useState(dictionary);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedLocale, setLoadedLocale] = useState(initialLocale); // Track locale hiện có dictionary
  
  const router = useRouter();
  const pathname = usePathname();
  
  // Load dictionary khi locale thay đổi
  useEffect(() => {
    async function loadDictionary() {
      // Chỉ load khi locale khác với locale đã load
      if (locale === loadedLocale) {
        return; // Đã có dictionary cho locale này
      }
      
      setIsLoading(true);
      try {
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
  
  // Context value - memoized
  const contextValue = useMemo(() => ({
    locale,
    locales,
    setLocale,
    toggleLocale,
    t,
    isLoading,
    config: localeConfig[locale],
  }), [locale, setLocale, toggleLocale, t, isLoading]);
  
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
