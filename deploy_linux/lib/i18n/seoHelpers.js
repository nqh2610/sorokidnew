/**
 * 🌍 I18N SEO HELPERS
 * 
 * Utilities cho SEO đa ngôn ngữ:
 * - generateI18nMetadata: Tạo metadata động theo locale
 * - getHreflangLinks: Tạo hreflang tags
 * - getCanonicalUrl: Xác định canonical URL
 */

import { localeConfig, defaultLocale, locales } from './config';

const BASE_URL = 'https://sorokid.com';

/**
 * 🔗 Tạo URL cho một locale cụ thể
 * VI: /path -> EN: /en/path
 */
export function getLocalizedUrl(path = '', locale = defaultLocale) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (locale === 'vi') {
    return cleanPath === '/' ? BASE_URL : `${BASE_URL}${cleanPath}`;
  }
  
  return cleanPath === '/' 
    ? `${BASE_URL}/en` 
    : `${BASE_URL}/en${cleanPath}`;
}

/**
 * 🌐 Tạo object hreflang languages cho alternates
 */
export function getHreflangLinks(path = '') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return {
    vi: cleanPath === '/' ? BASE_URL : `${BASE_URL}${cleanPath}`,
    en: cleanPath === '/' ? `${BASE_URL}/en` : `${BASE_URL}/en${cleanPath}`,
    'x-default': cleanPath === '/' ? BASE_URL : `${BASE_URL}${cleanPath}`,
  };
}

/**
 * 📌 Lấy canonical URL theo locale
 */
export function getCanonicalUrl(path = '', locale = defaultLocale) {
  return getLocalizedUrl(path, locale);
}

/**
 * 🎯 Generate metadata động cho một page
 * 
 * @param {Object} options
 * @param {string} options.path - Path của trang (không có locale prefix)
 * @param {string} options.locale - Locale hiện tại
 * @param {Object} options.titles - Object {vi: '...', en: '...'}
 * @param {Object} options.descriptions - Object {vi: '...', en: '...'}
 * @param {Object} options.keywords - Object {vi: [...], en: [...]}
 * @param {string} options.ogImage - Path đến OG image
 * 
 * @returns {Object} Metadata object cho Next.js
 */
export function generateI18nMetadata({
  path = '',
  locale = defaultLocale,
  titles = {},
  descriptions = {},
  keywords = {},
  ogImage = '/og-image.png',
  noindex = false,
}) {
  const config = localeConfig[locale] || localeConfig[defaultLocale];
  
  const title = titles[locale] || titles[defaultLocale] || titles.vi || 'Sorokid';
  const description = descriptions[locale] || descriptions[defaultLocale] || descriptions.vi || '';
  const keywordList = keywords[locale] || keywords[defaultLocale] || keywords.vi || [];
  
  const canonicalUrl = getCanonicalUrl(path, locale);
  const hreflangLinks = getHreflangLinks(path);
  
  return {
    title,
    description,
    keywords: keywordList,
    robots: noindex ? {
      index: false,
      follow: false,
    } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Sorokid',
      locale: config?.hreflang?.replace('-', '_') || 'vi_VN',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: hreflangLinks,
    },
  };
}

/**
 * 📄 Tạo metadata cho trang danh mục/blog
 */
export function generateListPageMetadata({
  path,
  locale,
  category,
  page = 1,
  titles,
  descriptions,
}) {
  const pageTitle = page > 1 
    ? `${titles[locale]} - Trang ${page}`
    : titles[locale];
    
  return generateI18nMetadata({
    path,
    locale,
    titles: { ...titles, [locale]: pageTitle },
    descriptions,
  });
}

/**
 * 📝 Tạo metadata cho trang bài viết
 */
export function generateArticleMetadata({
  path,
  locale,
  title,
  description,
  ogImage,
  publishedTime,
  modifiedTime,
  author,
  tags = [],
}) {
  const metadata = generateI18nMetadata({
    path,
    locale,
    titles: { [locale]: title },
    descriptions: { [locale]: description },
    keywords: { [locale]: tags },
    ogImage,
  });
  
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      tags,
    },
  };
}

/**
 * 🔍 Kiểm tra xem URL có phải là English version không
 */
export function isEnglishPath(path) {
  return path.startsWith('/en') || path.startsWith('en/');
}

/**
 * 🔄 Chuyển đổi path giữa các locale
 */
export function switchPathLocale(currentPath, targetLocale) {
  // Remove /en prefix if present
  const basePath = currentPath.replace(/^\/en\/?/, '/');
  
  if (targetLocale === 'vi') {
    return basePath === '/' ? '/' : basePath;
  }
  
  return basePath === '/' ? '/en' : `/en${basePath}`;
}

export default {
  getLocalizedUrl,
  getHreflangLinks,
  getCanonicalUrl,
  generateI18nMetadata,
  generateListPageMetadata,
  generateArticleMetadata,
  isEnglishPath,
  switchPathLocale,
};
