/**
 * 📝 BLOG UTILITY LIBRARY - I18N VERSION
 * 
 * Quản lý bài viết blog đa ngôn ngữ từ JSON files
 * - Đọc, filter, sort bài viết theo locale
 * - Hỗ trợ draft/published status
 * - SEO-friendly với hreflang
 * - Static Generation optimized
 * 
 * 🌍 CẤU TRÚC:
 * - content/blog/posts/vi/*.json  (tiếng Việt - default)
 * - content/blog/posts/en/*.json  (tiếng Anh)
 * - content/blog/categories.json  (VI)
 * - content/blog/categories.en.json (EN)
 * 
 * @version 2.0.0 - i18n support
 */

import fs from 'fs';
import path from 'path';
import { defaultLocale, locales } from './i18n/config';

const BLOG_BASE_DIR = path.join(process.cwd(), 'content', 'blog');
const POSTS_BASE_DIR = path.join(BLOG_BASE_DIR, 'posts');

/**
 * 🌍 Lấy đường dẫn categories file theo locale
 */
function getCategoriesFilePath(locale = defaultLocale) {
  if (locale === 'vi') {
    return path.join(BLOG_BASE_DIR, 'categories.json');
  }
  return path.join(BLOG_BASE_DIR, `categories.${locale}.json`);
}

/**
 * 🌍 Lấy đường dẫn posts folder theo locale
 */
function getPostsDir(locale = defaultLocale) {
  // Nếu chưa có subfolder locale, fallback về thư mục gốc (backward compatible)
  const localeDir = path.join(POSTS_BASE_DIR, locale);
  if (fs.existsSync(localeDir)) {
    return localeDir;
  }
  // Fallback: nếu chưa migrate sang folder structure mới
  return POSTS_BASE_DIR;
}

/**
 * Đọc tất cả categories theo locale
 */
export function getCategories(locale = defaultLocale) {
  try {
    const filePath = getCategoriesFilePath(locale);
    
    // Fallback về VI nếu không có file locale
    if (!fs.existsSync(filePath) && locale !== 'vi') {
      return getCategories('vi');
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data).categories;
  } catch (error) {
    console.error(`Error reading categories for ${locale}:`, error);
    return [];
  }
}

/**
 * Lấy category theo slug
 */
export function getCategoryBySlug(slug, locale = defaultLocale) {
  const categories = getCategories(locale);
  return categories.find(cat => cat.slug === slug) || null;
}

/**
 * Đọc một bài viết từ file JSON
 */
export function getPostBySlug(slug, locale = defaultLocale, includeContent = true) {
  try {
    const postsDir = getPostsDir(locale);
    const filePath = path.join(postsDir, `${slug}.json`);
    
    if (!fs.existsSync(filePath)) {
      // Fallback: thử tìm trong thư mục gốc (backward compatible)
      const fallbackPath = path.join(POSTS_BASE_DIR, `${slug}.json`);
      if (locale === 'vi' && fs.existsSync(fallbackPath)) {
        const data = fs.readFileSync(fallbackPath, 'utf-8');
        const post = JSON.parse(data);
        if (post.status === 'draft') return null;
        if (!includeContent) {
          const { content, ...postWithoutContent } = post;
          return postWithoutContent;
        }
        return post;
      }
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    const post = JSON.parse(data);
    
    // Không trả về draft posts cho public
    if (post.status === 'draft') {
      return null;
    }
    
    if (!includeContent) {
      const { content, ...postWithoutContent } = post;
      return postWithoutContent;
    }
    
    return post;
  } catch (error) {
    console.error(`Error reading post ${slug} (${locale}):`, error);
    return null;
  }
}

/**
 * Đọc bài viết kèm status (cho metadata check)
 */
export function getPostBySlugWithStatus(slug, locale = defaultLocale) {
  try {
    const postsDir = getPostsDir(locale);
    const filePath = path.join(postsDir, `${slug}.json`);
    
    // Fallback logic
    if (!fs.existsSync(filePath)) {
      const fallbackPath = path.join(POSTS_BASE_DIR, `${slug}.json`);
      if (locale === 'vi' && fs.existsSync(fallbackPath)) {
        const data = fs.readFileSync(fallbackPath, 'utf-8');
        return JSON.parse(data);
      }
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading post ${slug} (${locale}):`, error);
    return null;
  }
}

/**
 * 🌍 Lấy tất cả bài viết theo locale
 */
export function getAllPosts({ 
  locale = defaultLocale,
  includeContent = false, 
  category = null,
  limit = null,
  sortBy = 'publishedAt',
  sortOrder = 'desc'
} = {}) {
  try {
    const postsDir = getPostsDir(locale);
    
    if (!fs.existsSync(postsDir)) {
      return [];
    }
    
    const files = fs.readdirSync(postsDir);
    
    let posts = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        try {
          const data = fs.readFileSync(path.join(postsDir, file), 'utf-8');
          const post = JSON.parse(data);
          
          // Chỉ lấy bài published
          if (post.status !== 'published') {
            return null;
          }
          
          // Thêm locale info vào post
          post._locale = locale;
          
          if (!includeContent) {
            const { content, ...postWithoutContent } = post;
            return postWithoutContent;
          }
          
          return post;
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
    
    // Filter theo category nếu có
    if (category) {
      posts = posts.filter(post => post.category === category);
    }
    
    // Sort
    posts.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      if (sortBy === 'publishedAt' || sortBy === 'updatedAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
    
    // Limit
    if (limit && limit > 0) {
      posts = posts.slice(0, limit);
    }
    
    return posts;
  } catch (error) {
    console.error(`Error getting all posts (${locale}):`, error);
    return [];
  }
}

/**
 * Lấy bài viết với phân trang
 */
export function getPaginatedPosts({
  locale = defaultLocale,
  page = 1,
  perPage = 9,
  category = null,
  sortBy = 'publishedAt',
  sortOrder = 'desc'
} = {}) {
  const allPosts = getAllPosts({ locale, category, sortBy, sortOrder });
  
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  
  const startIndex = (currentPage - 1) * perPage;
  const posts = allPosts.slice(startIndex, startIndex + perPage);
  
  return {
    posts,
    totalPosts,
    totalPages,
    currentPage
  };
}

/**
 * Lấy bài viết liên quan
 */
export function getRelatedPosts(currentSlug, category, locale = defaultLocale, limit = 3) {
  const posts = getAllPosts({ locale, category });
  return posts
    .filter(post => post.slug !== currentSlug)
    .slice(0, limit);
}

/**
 * 🌍 Lấy tất cả slugs theo locale (cho static generation)
 */
export function getAllPostSlugs(locale = defaultLocale) {
  try {
    const postsDir = getPostsDir(locale);
    
    if (!fs.existsSync(postsDir)) {
      return [];
    }
    
    const files = fs.readdirSync(postsDir);
    
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        try {
          const data = fs.readFileSync(path.join(postsDir, file), 'utf-8');
          const post = JSON.parse(data);
          
          if (post.status !== 'published') {
            return null;
          }
          
          return post.slug;
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  } catch (error) {
    console.error(`Error getting slugs (${locale}):`, error);
    return [];
  }
}

/**
 * 🌍 Lấy slugs cho tất cả locales (static generation)
 */
export function getAllPostSlugsAllLocales() {
  const result = [];
  
  for (const locale of locales) {
    const slugs = getAllPostSlugs(locale);
    slugs.forEach(slug => {
      result.push({ slug, locale });
    });
  }
  
  return result;
}

/**
 * 🔗 Lấy bài viết tương đương ở ngôn ngữ khác
 * Dựa vào field "translations" trong JSON
 */
export function getTranslatedPost(slug, fromLocale, toLocale) {
  const post = getPostBySlug(slug, fromLocale, false);
  
  if (!post?.translations?.[toLocale]) {
    return null;
  }
  
  const translatedSlug = post.translations[toLocale];
  return getPostBySlug(translatedSlug, toLocale, false);
}

/**
 * 🌍 Tạo hreflang links cho bài viết
 */
export function getPostHreflangLinks(slug, currentLocale) {
  const post = getPostBySlug(slug, currentLocale, false);
  if (!post) return {};
  
  const links = {};
  const baseUrl = 'https://sorokid.com';
  
  // Current locale
  if (currentLocale === 'vi') {
    links['vi'] = `${baseUrl}/blog/${slug}`;
    links['x-default'] = `${baseUrl}/blog/${slug}`;
  } else {
    links[currentLocale] = `${baseUrl}/${currentLocale}/blog/${slug}`;
  }
  
  // Other locales from translations field
  if (post.translations) {
    Object.entries(post.translations).forEach(([locale, translatedSlug]) => {
      if (locale === 'vi') {
        links['vi'] = `${baseUrl}/blog/${translatedSlug}`;
        links['x-default'] = `${baseUrl}/blog/${translatedSlug}`;
      } else {
        links[locale] = `${baseUrl}/${locale}/blog/${translatedSlug}`;
      }
    });
  }
  
  return links;
}

/**
 * Tạo sitemap data cho blog (tất cả locales)
 */
export function getSitemapData() {
  const result = [];
  
  for (const locale of locales) {
    const posts = getAllPosts({ locale });
    
    posts.forEach(post => {
      const url = locale === 'vi' 
        ? `/blog/${post.slug}`
        : `/${locale}/blog/${post.slug}`;
        
      result.push({
        url,
        lastModified: post.updatedAt || post.publishedAt,
        changeFrequency: 'weekly',
        priority: locale === 'vi' ? 0.8 : 0.7,
        alternates: getPostHreflangLinks(post.slug, locale),
      });
    });
  }
  
  return result;
}

/**
 * Tạo JSON-LD Schema cho Article
 */
export function generateArticleSchema(post, url, locale = 'vi') {
  const localeMap = {
    vi: 'vi-VN',
    en: 'en-US',
  };
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.image ? `https://sorokid.com${post.image}` : 'https://sorokid.com/og-image.png',
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    inLanguage: localeMap[locale] || 'vi-VN',
    author: {
      '@type': 'Organization',
      name: 'Sorokid',
      url: 'https://sorokid.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sorokid',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sorokid.com/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    keywords: post.keywords?.join(', ') || ''
  };
}

/**
 * Tạo JSON-LD Schema cho FAQ
 */
export function generateFAQSchema(faqs) {
  if (!faqs || faqs.length === 0) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Đếm số bài theo category
 */
export function getPostCountByCategory(locale = defaultLocale) {
  const posts = getAllPosts({ locale });
  const categories = getCategories(locale);
  
  return categories.map(cat => ({
    ...cat,
    postCount: posts.filter(p => p.category === cat.slug).length
  }));
}

/**
 * Tính thời gian đọc ước tính
 */
export function calculateReadingTime(content, locale = 'vi') {
  if (!content) return 1;
  
  // Tốc độ đọc theo ngôn ngữ (từ/phút)
  const readingSpeed = {
    vi: 200,  // Tiếng Việt
    en: 250,  // Tiếng Anh (nhanh hơn vì ít âm tiết)
  };
  
  const wordCount = content.split(/\s+/).length;
  const speed = readingSpeed[locale] || 200;
  const minutes = Math.ceil(wordCount / speed);
  
  return Math.max(1, minutes);
}

/**
 * Format date cho hiển thị theo locale
 */
export function formatDate(dateString, locale = 'vi') {
  const date = new Date(dateString);
  const localeMap = {
    vi: 'vi-VN',
    en: 'en-US',
  };
  
  return date.toLocaleDateString(localeMap[locale] || 'vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default {
  getCategories,
  getCategoryBySlug,
  getPostBySlug,
  getPostBySlugWithStatus,
  getAllPosts,
  getPaginatedPosts,
  getRelatedPosts,
  getAllPostSlugs,
  getAllPostSlugsAllLocales,
  getTranslatedPost,
  getPostHreflangLinks,
  getSitemapData,
  generateArticleSchema,
  generateFAQSchema,
  getPostCountByCategory,
  calculateReadingTime,
  formatDate,
};
