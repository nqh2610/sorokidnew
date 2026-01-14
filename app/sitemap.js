/**
 * 🗺️ DYNAMIC SITEMAP - ĐA NGÔN NGỮ (URL-BASED)
 * 
 * Sitemap tự động cập nhật khi:
 * - Thêm bài blog mới
 * - Thêm danh mục mới
 * - Thêm tool mới
 * 
 * URL: https://sorokid.com/sitemap.xml
 * 
 * Tối ưu cho: Google, Bing, AI Search
 * 
 * 🌍 URL-BASED i18n (SEO-friendly):
 * - Tiếng Việt: /blog (canonical, đã được Google index)
 * - Tiếng Anh: /en/blog (URL riêng cho SEO)
 * - Hreflang đầy đủ cho Google
 * - Mỗi ngôn ngữ có entry riêng trong sitemap
 */

import { getAllPosts, getCategories } from '@/lib/blog';

const BASE_URL = 'https://sorokid.com';
const LOCALES = ['vi', 'en'];

// Tool pages configuration
const TOOL_PAGES = [
  { path: '/tool', priority: 0.9, changefreq: 'weekly' },
  { path: '/tool/chiec-non-ky-dieu', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/dua-thu-hoat-hinh', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/flash-zan', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/dong-ho-bam-gio', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/chia-nhom', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/boc-tham', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/ban-tinh-soroban', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/den-may-man', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/ai-la-trieu-phu', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/cuoc-dua-ki-thu', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/xuc-xac', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/o-chu', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/chia-nhom-boc-tham', priority: 0.8, changefreq: 'monthly' },
];

/**
 * 🌍 Tạo alternates (hreflang) cho URL-based i18n
 * Mỗi trang có cả tiếng Việt và tiếng Anh
 */
function createAlternates(path) {
  const viUrl = path === '' ? BASE_URL : `${BASE_URL}${path}`;
  const enUrl = path === '' ? `${BASE_URL}/en` : `${BASE_URL}/en${path}`;
  
  return {
    languages: {
      'vi': viUrl,
      'en': enUrl,
      'x-default': viUrl, // Tiếng Việt là default
    },
  };
}

/**
 * 🌍 Tạo URL với locale prefix
 */
function getLocalizedUrl(path, locale) {
  if (locale === 'vi') {
    return path === '' ? BASE_URL : `${BASE_URL}${path}`;
  }
  return path === '' ? `${BASE_URL}/en` : `${BASE_URL}/en${path}`;
}

export default async function sitemap() {
  const now = new Date();
  
  // 1. Static pages - các trang cố định (CẢ 2 NGÔN NGỮ)
  const staticPages = [];
  
  // Homepage - cả 2 ngôn ngữ
  LOCALES.forEach(locale => {
    staticPages.push({
      url: getLocalizedUrl('', locale),
      lastModified: now,
      changeFrequency: 'daily',
      priority: locale === 'vi' ? 1.0 : 0.9, // VI là canonical, priority cao hơn
      alternates: createAlternates(''),
    });
  });
  
  // Blog index - cả 2 ngôn ngữ
  LOCALES.forEach(locale => {
    staticPages.push({
      url: getLocalizedUrl('/blog', locale),
      lastModified: now,
      changeFrequency: 'daily',
      priority: locale === 'vi' ? 0.9 : 0.8,
      alternates: createAlternates('/blog'),
    });
  });
  
  // Pricing - cả 2 ngôn ngữ
  LOCALES.forEach(locale => {
    staticPages.push({
      url: getLocalizedUrl('/pricing', locale),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: locale === 'vi' ? 0.8 : 0.7,
      alternates: createAlternates('/pricing'),
    });
  });

  // 2. Tool pages - cả 2 ngôn ngữ
  const toolPages = [];
  TOOL_PAGES.forEach(tool => {
    LOCALES.forEach(locale => {
      toolPages.push({
        url: getLocalizedUrl(tool.path, locale),
        lastModified: now,
        changeFrequency: tool.changefreq,
        priority: locale === 'vi' ? tool.priority : tool.priority - 0.1,
        alternates: createAlternates(tool.path),
      });
    });
  });

  // 3. Blog category pages - các trang danh mục (chỉ tiếng Việt, vì slug tiếng Việt)
  const categories = getCategories();
  const categoryPages = categories.map((category) => ({
    url: `${BASE_URL}/blog/danh-muc/${category.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // 4. Blog posts - tất cả bài viết đã publish (chỉ tiếng Việt, vì slug tiếng Việt)
  const posts = getAllPosts({ sortBy: 'publishedAt', sortOrder: 'desc' });
  const blogPages = posts
    .filter(post => post.status === 'published')
    .map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  // Gộp tất cả
  return [...staticPages, ...toolPages, ...categoryPages, ...blogPages];
}
