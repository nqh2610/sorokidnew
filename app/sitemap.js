/**
 * 🗺️ DYNAMIC SITEMAP
 * 
 * Sitemap tự động cập nhật khi:
 * - Thêm bài blog mới
 * - Thêm danh mục mới
 * 
 * URL: https://sorokid.com/sitemap.xml
 */

import { getAllPosts, getCategories } from '@/lib/blog';

const BASE_URL = 'https://sorokid.com';

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
    {
      url: `${BASE_URL}/learn`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
  ];

  // 2. Blog category pages - các trang danh mục
  const categories = getCategories();
  const categoryPages = categories.map((category) => ({
    url: `${BASE_URL}/blog/danh-muc/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // 3. Blog posts - tất cả bài viết đã publish
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
  return [...staticPages, ...categoryPages, ...blogPages];
}
