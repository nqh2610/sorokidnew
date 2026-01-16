/**
 * 📝 BLOG UTILITY LIBRARY - I18N ENABLED
 * 
 * Quản lý bài viết blog từ JSON files
 * - Đọc, filter, sort bài viết
 * - Hỗ trợ draft/published status
 * - SEO-friendly với schema markup
 * - 🌍 Hỗ trợ đa ngôn ngữ (vi/en)
 * 
 * CẤU TRÚC:
 * - content/blog/posts/vi/*.json (tiếng Việt - default)
 * - content/blog/posts/en/*.json (tiếng Anh)
 * - content/blog/categories.json (VI)
 * - content/blog/categories.en.json (EN)
 */

import fs from 'fs';
import path from 'path';

const BLOG_BASE_DIR = path.join(process.cwd(), 'content', 'blog');
const POSTS_BASE_DIR = path.join(BLOG_BASE_DIR, 'posts');
const DEFAULT_LOCALE = 'vi';
const SUPPORTED_LOCALES = ['vi', 'en'];

// Legacy paths for backward compatibility
const BLOG_CONTENT_DIR = path.join(process.cwd(), 'content', 'blog', 'posts');
const CATEGORIES_FILE = path.join(process.cwd(), 'content', 'blog', 'categories.json');

/**
 * 🌍 Lấy đường dẫn posts folder theo locale
 */
function getPostsDir(locale = DEFAULT_LOCALE) {
  const localeDir = path.join(POSTS_BASE_DIR, locale);
  if (fs.existsSync(localeDir)) {
    return localeDir;
  }
  // Fallback cho VI: thư mục gốc (backward compatible)
  if (locale === 'vi') {
    return POSTS_BASE_DIR;
  }
  return localeDir;
}

/**
 * 🌍 Lấy đường dẫn categories file theo locale
 */
function getCategoriesFilePath(locale = DEFAULT_LOCALE) {
  if (locale === 'vi') {
    return path.join(BLOG_BASE_DIR, 'categories.json');
  }
  return path.join(BLOG_BASE_DIR, `categories.${locale}.json`);
}

/**
 * Đọc tất cả categories theo locale
 * @param {string} locale - 'vi' hoặc 'en'
 */
export function getCategories(locale = DEFAULT_LOCALE) {
  try {
    const filePath = getCategoriesFilePath(locale);
    
    // Fallback về VI nếu không có file locale
    if (!fs.existsSync(filePath) && locale !== 'vi') {
      return getCategories('vi');
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data).categories;
  } catch (error) {
    console.error(`Error reading categories (${locale}):`, error);
    return [];
  }
}

/**
 * Lấy category theo slug
 * @param {string} slug - Category slug
 * @param {string} locale - 'vi' hoặc 'en'
 */
export function getCategoryBySlug(slug, locale = DEFAULT_LOCALE) {
  const categories = getCategories(locale);
  return categories.find(cat => cat.slug === slug) || null;
}

/**
 * Đọc một bài viết từ file JSON
 * @param {string} slug - Post slug
 * @param {string} locale - 'vi' hoặc 'en'
 * @param {boolean} includeContent - Include full content
 */
export function getPostBySlug(slug, locale = DEFAULT_LOCALE, includeContent = true) {
  try {
    const postsDir = getPostsDir(locale);
    const filePath = path.join(postsDir, `${slug}.json`);
    
    if (!fs.existsSync(filePath)) {
      // Fallback: thử tìm trong thư mục gốc (backward compatible cho VI)
      if (locale === 'vi') {
        const fallbackPath = path.join(BLOG_CONTENT_DIR, `${slug}.json`);
        if (fs.existsSync(fallbackPath)) {
          const data = fs.readFileSync(fallbackPath, 'utf-8');
          const post = JSON.parse(data);
          if (post.status === 'draft') return null;
          if (!includeContent) {
            const { content, ...postWithoutContent } = post;
            return { ...postWithoutContent, _locale: locale };
          }
          return { ...post, _locale: locale };
        }
      }
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    const post = JSON.parse(data);
    
    // Không trả về draft posts cho public
    if (post.status === 'draft') {
      return null;
    }
    
    // Thêm locale info
    post._locale = locale;
    
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
 * Không filter theo status, dùng cho generateMetadata
 * @param {string} slug - Post slug
 * @param {string} locale - 'vi' hoặc 'en'
 */
export function getPostBySlugWithStatus(slug, locale = DEFAULT_LOCALE) {
  try {
    const postsDir = getPostsDir(locale);
    const filePath = path.join(postsDir, `${slug}.json`);
    
    if (!fs.existsSync(filePath)) {
      // Fallback cho VI
      if (locale === 'vi') {
        const fallbackPath = path.join(BLOG_CONTENT_DIR, `${slug}.json`);
        if (fs.existsSync(fallbackPath)) {
          const data = fs.readFileSync(fallbackPath, 'utf-8');
          return { ...JSON.parse(data), _locale: locale };
        }
      }
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    return { ...JSON.parse(data), _locale: locale };
  } catch (error) {
    console.error(`Error reading post ${slug} (${locale}):`, error);
    return null;
  }
}

/**
 * Lấy tất cả bài viết (chỉ published)
 * @param {Object} options - Options
 * @param {string} options.locale - 'vi' hoặc 'en'
 * @param {boolean} options.includeContent - Include content
 * @param {string} options.category - Filter by category
 * @param {number} options.limit - Limit results
 * @param {string} options.sortBy - Sort field
 * @param {string} options.sortOrder - 'asc' hoặc 'desc'
 */
export function getAllPosts({ 
  locale = DEFAULT_LOCALE,
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
          
          // Thêm locale info
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
    console.error(`Error getting all posts (${locale}):`, error);
    return [];
  }
}

/**
 * Lấy bài viết với phân trang
 * @param {Object} options - Options
 * @param {string} options.locale - 'vi' hoặc 'en'
 * @returns {{ posts: Array, totalPosts: number, totalPages: number, currentPage: number }}
 */
export function getPaginatedPosts({
  locale = DEFAULT_LOCALE,
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
 * @param {string} currentSlug - Current post slug
 * @param {string} category - Category slug
 * @param {string} locale - 'vi' hoặc 'en'
 * @param {number} limit - Max posts to return
 */
export function getRelatedPosts(currentSlug, category, locale = DEFAULT_LOCALE, limit = 3) {
  const posts = getAllPosts({ locale, category });
  return posts
    .filter(post => post.slug !== currentSlug)
    .slice(0, limit);
}

/**
 * 🌍 Lấy bài viết theo postId ở locale khác
 * Dùng để tìm bài tương ứng khi chuyển ngôn ngữ
 * @param {string} postId - Post ID (= slug VI gốc)
 * @param {string} targetLocale - Locale muốn tìm ('vi' hoặc 'en')
 */
export function getPostByPostId(postId, targetLocale = DEFAULT_LOCALE) {
  try {
    // Nếu target là VI, postId chính là slug
    if (targetLocale === 'vi') {
      return getPostBySlug(postId, 'vi', false);
    }
    
    // Tìm trong EN posts theo postId
    const postsDir = getPostsDir(targetLocale);
    if (!fs.existsSync(postsDir)) return null;
    
    const files = fs.readdirSync(postsDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const data = fs.readFileSync(path.join(postsDir, file), 'utf-8');
        const post = JSON.parse(data);
        if (post.postId === postId && post.status === 'published') {
          post._locale = targetLocale;
          const { content, ...postWithoutContent } = post;
          return postWithoutContent;
        }
      } catch (e) {
        continue;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error finding post by postId ${postId} (${targetLocale}):`, error);
    return null;
  }
}

/**
 * 🌍 Lấy tất cả bài tương ứng theo postId
 * Trả về object { vi: post, en: post, ... }
 * @param {string} postId - Post ID (= slug VI gốc)
 */
export function getPostTranslations(postId) {
  const translations = {};
  
  for (const locale of SUPPORTED_LOCALES) {
    const post = getPostByPostId(postId, locale);
    if (post) {
      translations[locale] = post;
    }
  }
  
  return translations;
}

/**
 * Lấy tất cả slugs theo locale (cho static generation)
 * @param {string} locale - 'vi' hoặc 'en'
 */
export function getAllPostSlugs(locale = DEFAULT_LOCALE) {
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
    console.error(`Error getting slugs (${locale}):`, error);
    return [];
  }
}

/**
 * 🌍 Lấy slugs cho tất cả locales (static generation)
 */
export function getAllPostSlugsAllLocales() {
  const result = [];
  
  for (const locale of SUPPORTED_LOCALES) {
    const slugs = getAllPostSlugs(locale);
    slugs.forEach(slug => {
      result.push({ slug, locale });
    });
  }
  
  return result;
}

/**
 * 🔗 Lấy bài viết tương đương ở ngôn ngữ khác
 * Cập nhật: Dùng postId thay vì translations field
 */
export function getTranslatedPost(slug, fromLocale, toLocale) {
  const post = getPostBySlug(slug, fromLocale, false);
  if (!post) return null;
  
  // Cách 1: Dùng postId (ưu tiên)
  // - Nếu đang ở EN và muốn sang VI: postId = slug VI
  // - Nếu đang ở VI và muốn sang EN: tìm bài EN có postId = slug VI hiện tại
  if (fromLocale === 'en' && toLocale === 'vi' && post.postId) {
    return getPostBySlug(post.postId, 'vi', false);
  }
  
  if (fromLocale === 'vi' && toLocale === 'en') {
    // slug VI = postId của bài EN
    const viSlug = slug;
    const enPost = getPostByPostId(viSlug, 'en');
    return enPost;
  }
  
  // Cách 2: Fallback về translations field cũ (nếu có)
  if (post?.translations?.[toLocale]) {
    const translatedSlug = post.translations[toLocale];
    return getPostBySlug(translatedSlug, toLocale, false);
  }
  
  return null;
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
  
  for (const locale of SUPPORTED_LOCALES) {
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
 * @param {Object} post - Post object
 * @param {string} url - Full URL
 * @param {string} locale - 'vi' hoặc 'en'
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
 * @param {string} locale - 'vi' hoặc 'en'
 */
export function getPostCountByCategory(locale = DEFAULT_LOCALE) {
  const posts = getAllPosts({ locale });
  const categories = getCategories(locale);
  
  return categories.map(cat => ({
    ...cat,
    postCount: posts.filter(p => p.category === cat.slug).length
  }));
}

/**
 * Tính thời gian đọc ước tính
 * @param {string} content - Content text
 * @param {string} locale - 'vi' hoặc 'en'
 */
export function calculateReadingTime(content, locale = 'vi') {
  if (!content) return 1;
  
  // Tốc độ đọc theo ngôn ngữ
  const readingSpeed = {
    vi: 200,  // Tiếng Việt
    en: 250,  // Tiếng Anh
  };
  
  const wordCount = content.split(/\s+/).length;
  const speed = readingSpeed[locale] || 200;
  const minutes = Math.ceil(wordCount / speed);
  
  return Math.max(1, minutes);
}

/**
 * Format date cho hiển thị theo locale
 * @param {string} dateString - ISO date string
 * @param {string} locale - 'vi' hoặc 'en'
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

// Export constants for external use
export { DEFAULT_LOCALE, SUPPORTED_LOCALES };
