/**
 * 📝 BLOG SECTION COMPONENT
 * 
 * Hiển thị bài viết blog trên trang chủ
 * Hỗ trợ i18n - tự detect locale từ URL hoặc nhận qua prop
 * 
 * @version 3.0.0 - Auto-detect locale from URL
 */

import Link from 'next/link';
import T from '@/components/T';
import BlogImage from '@/components/Blog/BlogImage';
import { getAllPosts, formatDate, calculateReadingTime } from '@/lib/blog';
import { headers } from 'next/headers';

/**
 * Detect locale from request URL
 */
function detectLocaleFromHeaders() {
  try {
    const headersList = headers();
    const referer = headersList.get('referer') || '';
    const xUrl = headersList.get('x-url') || headersList.get('x-invoke-path') || '';
    
    // Check if URL contains /en/
    if (referer.includes('/en/') || referer.includes('/en') || 
        xUrl.includes('/en/') || xUrl.includes('/en')) {
      return 'en';
    }
  } catch (e) {
    // headers() may not be available in some contexts
  }
  return 'vi';
}

/**
 * Blog Section Component - Auto-detects locale or uses prop
 * @param {Object} props
 * @param {string} props.locale - 'vi' hoặc 'en' (optional, will auto-detect if not provided)
 */
export default function BlogSection({ locale }) {
  // Use provided locale or auto-detect from URL
  const currentLocale = locale || detectLocaleFromHeaders();
  
  const posts = getAllPosts({ locale: currentLocale, sortBy: 'publishedAt', sortOrder: 'desc' }).slice(0, 4);
  
  if (posts.length === 0) return null;

  // URL prefix for localized routes
  const prefix = currentLocale === 'vi' ? '' : `/${currentLocale}`;

  return (
    <section className="py-12 sm:py-20 bg-gray-50" aria-labelledby="blog-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 id="blog-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
            <span aria-hidden="true">📚</span> <T k="home.blog.title" />
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            <T k="home.blog.description" />
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {posts.map((post) => (
            <Link 
              key={post.slug}
              href={`${prefix}/blog/${post.slug}`}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="h-40 bg-gradient-to-br from-violet-100 to-pink-100 overflow-hidden">
                <BlogImage
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-violet-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {post.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{formatDate(post.publishedAt, currentLocale)}</span>
                  <span>•</span>
                  <span>{post.readingTime || calculateReadingTime(post.content?.intro, currentLocale)} <T k="common.minutes" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link 
            href={`${prefix}/blog`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <T k="home.blog.viewAll" />
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
