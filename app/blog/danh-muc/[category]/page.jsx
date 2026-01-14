/**
 * 📝 BLOG CATEGORY PAGE
 * 
 * Trang danh sách bài viết theo danh mục
 * - Mobile-first, 1 cột
 * - Filter theo category
 * - Phân trang (SEO friendly)
 * 
 * 🚀 TỐI ƯU SHARED HOSTING:
 * - Static Generation với generateStaticParams
 * - ISR: Revalidate mỗi 30 phút
 * - 0 process runtime
 */

import LocalizedLink from '@/components/LocalizedLink/LocalizedLink';
import { notFound } from 'next/navigation';
import { getPaginatedPosts, getCategories, getCategoryBySlug, formatDate, calculateReadingTime } from '@/lib/blog';
import Pagination from '@/components/Blog/Pagination';
import BlogImage from '@/components/Blog/BlogImage';

// ============ ISR CONFIG ============
// Revalidate mỗi 30 phút (1800 giây)
export const revalidate = 1800;

const POSTS_PER_PAGE = 9;

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map(cat => ({ category: cat.slug }));
}

// Generate metadata for each category
export async function generateMetadata({ params, searchParams }) {
  const category = getCategoryBySlug(params.category);
  const page = parseInt(searchParams?.page) || 1;
  
  if (!category) {
    return {
      title: 'Không tìm thấy danh mục',
    };
  }

  const pageTitle = page > 1 ? ` - Trang ${page}` : '';
  const baseUrl = `https://sorokid.com/blog/danh-muc/${params.category}`;

  return {
    title: `${category.seoTitle || category.name}${pageTitle} | Blog Sorokid`,
    description: category.seoDescription || category.description,
    keywords: category.keywords,
    alternates: {
      canonical: page > 1 ? `${baseUrl}?page=${page}` : baseUrl,
    },
    openGraph: {
      title: `${category.seoTitle || category.name}${pageTitle} | Blog Sorokid`,
      description: category.seoDescription || category.description,
      type: 'website',
      url: page > 1 ? `${baseUrl}?page=${page}` : baseUrl,
    },
    robots: page > 1 ? { index: true, follow: true } : undefined,
  };
}

// Icon components
const CategoryIcon = ({ icon, className, style }) => {
  const icons = {
    heart: (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    lightbulb: (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    star: (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    book: (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  };
  return icons[icon] || icons.heart;
};

// Article Card Component - Grid style
function ArticleCard({ post }) {
  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        {/* Thumbnail */}
        <div className="h-40 sm:h-48 bg-gradient-to-br from-violet-100 to-pink-100 relative overflow-hidden">
          <BlogImage
            src={post.image}
            alt={post.imageAlt || post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-pink-500/10" />
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 leading-tight group-hover:text-violet-600 transition-colors">
            {post.title}
          </h2>
          <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 leading-relaxed flex-grow">
            {post.description}
          </p>
          
          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto">
            <time dateTime={post.publishedAt} className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(post.publishedAt)}
            </time>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.readingTime || calculateReadingTime(post.content?.intro)} phút đọc
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

// Other Categories Component
function OtherCategories({ categories, currentSlug }) {
  const otherCategories = categories.filter(c => c.slug !== currentSlug);
  
  if (otherCategories.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
        Danh mục khác
      </h2>
      <div className="flex flex-wrap gap-2">
        {otherCategories.map(cat => (
          <Link
            key={cat.slug}
            href={`/blog/danh-muc/${cat.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <CategoryIcon icon={cat.icon} className="w-4 h-4" style={{ color: cat.color }} />
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function CategoryPage({ params, searchParams }) {
  const category = getCategoryBySlug(params.category);
  
  if (!category) {
    notFound();
  }

  const page = parseInt(searchParams?.page) || 1;
  
  // Get paginated posts for this category
  const { posts, totalPosts, totalPages, currentPage } = getPaginatedPosts({
    page,
    perPage: POSTS_PER_PAGE,
    category: params.category,
    sortBy: 'publishedAt',
    sortOrder: 'desc'
  });
  
  const allCategories = getCategories();

  return (
    <>
      {/* Header with Category Color */}
      <header style={{ background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)` }} className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            <LocalizedLink href="/" className="hover:text-violet-600 transition-colors">Trang chủ</LocalizedLink>
            <span className="text-gray-300">/</span>
            <LocalizedLink href="/blog" className="hover:text-violet-600 transition-colors">Blog</LocalizedLink>
            <span className="text-gray-300">/</span>
            <span style={{ color: category.color }}>{category.name}</span>
          </nav>

          {/* Category Header */}
          <div className="flex items-start gap-3 sm:gap-5">
            <div 
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <CategoryIcon icon={category.icon} className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: category.color }} />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                {category.name}
              </h1>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-lg line-clamp-2 sm:line-clamp-none">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-12">
        {/* Posts */}
        <section>
          {currentPage > 1 && (
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-gray-500">
                Trang {currentPage}
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {posts.map(post => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500 mb-4">Chưa có bài viết nào trong danh mục này.</p>
              <Link 
                href="/blog"
                className="text-violet-600 hover:text-violet-700 font-medium"
              >
                Xem tất cả bài viết
              </Link>
            </div>
          )}

          {/* Pagination */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/blog/danh-muc/${params.category}`}
          />
        </section>

        {/* Other Categories - only on page 1 */}
        {currentPage === 1 && (
          <OtherCategories categories={allCategories} currentSlug={params.category} />
        )}

        {/* CTA Section - only on page 1 */}
        {currentPage === 1 && (
          <section className="mt-16 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 rounded-3xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Muốn con học toán hiệu quả hơn?
            </h2>
            <p className="text-white/90 mb-8 max-w-lg mx-auto text-lg">
              Sorokid giúp con tự học toán qua trò chơi – phụ huynh đỡ phải kèm mà con vẫn tiến bộ.
            </p>
            <Link 
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-violet-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-xl"
            >
              Cho con thử miễn phí
            </Link>
          </section>
        )}

        {/* Back to Blog */}
        <div className="mt-8">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại Blog
          </Link>
        </div>
      </main>
    </>
  );
}
