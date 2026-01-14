'use client';

/**
 * 🌍 I18N TEXT - Client Component for Dynamic Text
 * 
 * Component này cho phép render text khác nhau theo ngôn ngữ
 * trong các page static. Sử dụng cho các text quan trọng cần đa ngôn ngữ.
 * 
 * Usage:
 * <I18nText vi="Xin chào" en="Hello" />
 * <I18nText dictKey="home.hero.title" fallback="Xin chào" />
 */

import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * I18nText - Render text theo ngôn ngữ hiện tại
 * @param {string} vi - Text tiếng Việt
 * @param {string} en - Text tiếng Anh  
 * @param {string} dictKey - Key trong dictionary (thay thế vi/en)
 * @param {string} fallback - Text fallback nếu không tìm thấy
 * @param {string} className - CSS class
 * @param {string} as - HTML tag (span, p, h1, etc.)
 */
export function I18nText({ 
  vi, 
  en, 
  dictKey, 
  fallback = '',
  className = '',
  as: Component = 'span'
}) {
  const { locale, t } = useI18n();
  
  let text = fallback;
  
  if (dictKey) {
    // Sử dụng dictionary key
    const translated = t(dictKey);
    if (translated && translated !== dictKey) {
      text = translated;
    }
  } else {
    // Sử dụng vi/en trực tiếp
    text = locale === 'en' ? (en || vi || fallback) : (vi || fallback);
  }
  
  if (!className) {
    return text;
  }
  
  return <Component className={className}>{text}</Component>;
}

/**
 * useText - Hook để lấy text theo ngôn ngữ
 * @param {string} vi - Text tiếng Việt
 * @param {string} en - Text tiếng Anh
 * @returns {string}
 */
export function useText(vi, en) {
  const { locale } = useI18n();
  return locale === 'en' ? (en || vi) : vi;
}

export default I18nText;
