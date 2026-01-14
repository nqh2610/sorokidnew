'use client';

/**
 * 🌍 LOCALIZED LINK COMPONENT
 * 
 * Wrapper cho Next.js Link tự động thêm locale prefix:
 * - Tiếng Việt (default): /dashboard → /dashboard
 * - Tiếng Anh: /dashboard → /en/dashboard
 * 
 * Sử dụng:
 * import { LocalizedLink } from '@/components/LocalizedLink';
 * <LocalizedLink href="/dashboard">Dashboard</LocalizedLink>
 * 
 * @version 1.0.0
 */

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/I18nContext';
import { getLocalizedUrl } from '@/lib/i18n/config';

/**
 * LocalizedLink - Link với locale prefix tự động
 */
export function LocalizedLink({ href, children, ...props }) {
  const { locale } = useI18n();
  
  // Nếu href là external link, không xử lý
  if (typeof href === 'string' && (href.startsWith('http') || href.startsWith('//'))) {
    return <Link href={href} {...props}>{children}</Link>;
  }
  
  // Nếu href đã có locale prefix, không xử lý
  if (typeof href === 'string' && (href.startsWith('/en/') || href === '/en')) {
    return <Link href={href} {...props}>{children}</Link>;
  }
  
  // Tạo URL với locale prefix
  const localizedHref = typeof href === 'string' 
    ? getLocalizedUrl(href, locale)
    : href;
  
  return <Link href={localizedHref} {...props}>{children}</Link>;
}

/**
 * Hook để lấy localized URL
 * Dùng cho trường hợp cần URL string (như router.push)
 */
export function useLocalizedUrl() {
  const { locale } = useI18n();
  
  return (path) => {
    if (typeof path === 'string' && (path.startsWith('http') || path.startsWith('//'))) {
      return path;
    }
    if (typeof path === 'string' && (path.startsWith('/en/') || path === '/en')) {
      return path;
    }
    return getLocalizedUrl(path, locale);
  };
}

export default LocalizedLink;
