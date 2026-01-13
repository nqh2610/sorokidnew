/**
 * 🗺️ DYNAMIC SITEMAP
 * 
 * Sitemap tự động cập nhật khi:
 * - Thêm bài blog mới
 * - Thêm danh mục mới
 * - Thêm tool mới
 * 
 * URL: https://sorokid.com/sitemap.xml
 * 
 * Tối ưu cho: Google, Bing, AI Search
 */

import { getAllPosts, getCategories } from '@/lib/blog';

const BASE_URL = 'https://sorokid.com';

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

export default async function sitemap() {
  // 1. Static pages - các trang cố định (KHÔNG có login, register, admin, dashboard)
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // /learn, /practice, /adventure, /leaderboard - KHÔNG đưa vào sitemap vì cần login
  ];

  // 2. Tool pages - các trang công cụ giáo viên
  const toolPages = TOOL_PAGES.map(tool => ({
    url: `${BASE_URL}${tool.path}`,
    lastModified: new Date(),
    changeFrequency: tool.changefreq,
    priority: tool.priority,
  }));

  // 3. Blog category pages - các trang danh mục
  const categories = getCategories();
  const categoryPages = categories.map((category) => ({
    url: `${BASE_URL}/blog/danh-muc/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // 4. Blog posts - tất cả bài viết đã publish
  const posts = getAllPosts({ sortBy: 'publishedAt', sortOrder: 'desc' });
  const blogPages = posts
    .filter(post => post.status === 'published') // Chỉ lấy bài đã publish
    .map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  // Gộp tất cả
  return [...staticPages, ...toolPages, ...categoryPages, ...blogPages];
}
