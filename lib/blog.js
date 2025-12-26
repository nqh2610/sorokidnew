/**
 * 📝 BLOG UTILITY LIBRARY
 * 
 * Quản lý bài viết blog từ JSON files
 * - Đọc, filter, sort bài viết
 * - Hỗ trợ draft/published status
 * - SEO-friendly với schema markup
 */

import fs from 'fs';
import path from 'path';

const BLOG_CONTENT_DIR = path.join(process.cwd(), 'content', 'blog', 'posts');
const CATEGORIES_FILE = path.join(process.cwd(), 'content', 'blog', 'categories.json');

/**
 * Đọc tất cả categories
 */
export function getCategories() {
  try {
    const data = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
    return JSON.parse(data).categories;
  } catch (error) {
    console.error('Error reading categories:', error);
    return [];
  }
}

/**
 * Lấy category theo slug
 */
export function getCategoryBySlug(slug) {
  const categories = getCategories();
  return categories.find(cat => cat.slug === slug) || null;
}

/**
 * Đọc một bài viết từ file JSON
 */
export function getPostBySlug(slug, includeContent = true) {
  try {
    const filePath = path.join(BLOG_CONTENT_DIR, `${slug}.json`);
    
    if (!fs.existsSync(filePath)) {
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
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

/**
 * Đọc bài viết kèm status (cho metadata check)
 * Không filter theo status, dùng cho generateMetadata
 */
export function getPostBySlugWithStatus(slug) {
  try {
    const filePath = path.join(BLOG_CONTENT_DIR, `${slug}.json`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

/**
 * Lấy tất cả bài viết (chỉ published)
 */
export function getAllPosts({ 
  includeContent = false, 
  category = null,
  limit = null,
  sortBy = 'publishedAt',
  sortOrder = 'desc'
} = {}) {
  try {
    if (!fs.existsSync(BLOG_CONTENT_DIR)) {
      return [];
    }
    
    const files = fs.readdirSync(BLOG_CONTENT_DIR);
    
    let posts = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        try {
          const data = fs.readFileSync(path.join(BLOG_CONTENT_DIR, file), 'utf-8');
          const post = JSON.parse(data);
          
          // Chỉ lấy bài published
          if (post.status !== 'published') {
            return null;
          }
          
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
    
    // Sort - sử dụng Date comparison cho publishedAt/updatedAt
    posts.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      // Convert to Date nếu là date field
      if (sortBy === 'publishedAt' || sortBy === 'updatedAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      
      if (sortOrder === 'desc') {
        return valB - valA;
      }
      return valA - valB;
    });
    
    // Limit
    if (limit && limit > 0) {
      posts = posts.slice(0, limit);
    }
    
    return posts;
  } catch (error) {
    console.error('Error getting all posts:', error);
    return [];
  }
}

/**
 * Lấy bài viết với phân trang
 * @returns {{ posts: Array, totalPosts: number, totalPages: number, currentPage: number }}
 */
export function getPaginatedPosts({
  page = 1,
  perPage = 9,
  category = null,
  sortBy = 'publishedAt',
  sortOrder = 'desc'
} = {}) {
  const allPosts = getAllPosts({ category, sortBy, sortOrder });
  
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
export function getRelatedPosts(currentSlug, category, limit = 3) {
  const posts = getAllPosts({ category });
  return posts
    .filter(post => post.slug !== currentSlug)
    .slice(0, limit);
}

/**
 * Lấy tất cả slugs (cho static generation)
 */
export function getAllPostSlugs() {
  try {
    if (!fs.existsSync(BLOG_CONTENT_DIR)) {
      return [];
    }
    
    const files = fs.readdirSync(BLOG_CONTENT_DIR);
    
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        try {
          const data = fs.readFileSync(path.join(BLOG_CONTENT_DIR, file), 'utf-8');
          const post = JSON.parse(data);
          
          // Chỉ lấy bài published
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
    console.error('Error getting slugs:', error);
    return [];
  }
}

/**
 * Tạo sitemap data cho blog
 */
export function getSitemapData() {
  const posts = getAllPosts();
  
  return posts.map(post => ({
    url: `/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: 'weekly',
    priority: 0.8
  }));
}

/**
 * Tạo JSON-LD Schema cho Article
 */
export function generateArticleSchema(post, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.image || 'https://sorokid.com/og-image.png',
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
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
export function getPostCountByCategory() {
  const posts = getAllPosts();
  const categories = getCategories();
  
  return categories.map(cat => ({
    ...cat,
    postCount: posts.filter(p => p.category === cat.slug).length
  }));
}

/**
 * Tính thời gian đọc ước tính
 */
export function calculateReadingTime(content) {
  if (!content) return 1;
  
  // Giả sử tốc độ đọc trung bình: 200 từ/phút cho tiếng Việt
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  
  return Math.max(1, minutes);
}

/**
 * Format date cho hiển thị
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
