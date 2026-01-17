/**
 * 🗺️ BLOG SITEMAP
 * 
 * Tự động tạo sitemap cho blog
 * - Chỉ bao gồm bài viết published VÀ đã đến ngày publish
 * - Bài có publishedAt trong tương lai sẽ KHÔNG xuất hiện
 * - lastmod = publishedAt
 */

import { getAllPosts, getCategories } from '@/lib/blog';

export default function sitemap() {
  const baseUrl = 'https://sorokid.com';
  
  // Get all published posts (VI) - only posts with publishedAt <= today
  const viPosts = getAllPosts({ locale: 'vi' });
  const enPosts = getAllPosts({ locale: 'en' });
  const categories = getCategories();
  
  // VI Blog posts sitemap entries
  const viPostEntries = viPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // EN Blog posts sitemap entries
  const enPostEntries = enPosts.map(post => ({
    url: `${baseUrl}/en/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Category pages sitemap entries
  const categoryEntries = categories.map(category => ({
    url: `${baseUrl}/blog/danh-muc/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Blog index pages
  const blogIndexEntries = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }
  ];

  return [
    ...blogIndexEntries,
    ...categoryEntries,
    ...viPostEntries,
    ...enPostEntries,
  ];
}
