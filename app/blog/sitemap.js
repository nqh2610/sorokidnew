/**
 * 🗺️ BLOG SITEMAP
 * 
 * Tự động tạo sitemap cho blog
 * - Chỉ bao gồm bài viết published
 * - lastmod = publishedAt
 */

import { getAllPosts, getCategories } from '@/lib/blog';

export default function sitemap() {
  const baseUrl = 'https://sorokid.com';
  
  // Get all published posts
  const posts = getAllPosts();
  const categories = getCategories();
  
  // Blog posts sitemap entries
  const postEntries = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
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

  // Blog index page
  const blogIndexEntry = {
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  };

  return [
    blogIndexEntry,
    ...categoryEntries,
    ...postEntries,
  ];
}
