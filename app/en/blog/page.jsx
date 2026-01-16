/**
 * 📝 ENGLISH BLOG LISTING PAGE
 * 
 * Giao diện giống hệt trang VI, chỉ đổi nội dung sang tiếng Anh
 * - Mobile-first, responsive
 * - Displays latest posts
 * - Category filtering
 * - Pagination (SEO friendly)
 * - SEO optimized for EN audience
 * 
 * 🚀 OPTIMIZED:
 * - ISR: Revalidate every 30 minutes
 * - Static HTML for crawlers
 */

import LocalizedLink from '@/components/LocalizedLink/LocalizedLink';
import { getPaginatedPosts, getAllPosts, getCategories, formatDate, calculateReadingTime } from '@/lib/blog';
import Pagination from '@/components/Blog/Pagination';
import BlogImage from '@/components/Blog/BlogImage';

// ============ ISR CONFIG ============
export const revalidate = 1800;

const POSTS_PER_PAGE = 9;
const LOCALE = 'en';

export async function generateMetadata({ searchParams }) {
  const page = parseInt(searchParams?.page) || 1;
  const pageTitle = page > 1 ? ` - Page ${page}` : '';
  
  return {
    title: `SoroKid Blog | Math Learning Tips for Parents${pageTitle}`,
    description: 'Helpful articles for parents on supporting their children with math learning. Practical tips, not theory.',
    keywords: ['math learning blog', 'teaching kids math', 'soroban', 'stress-free math', 'helping kids with math', 'math anxiety'],
    openGraph: {
      title: `SoroKid Blog | Math Learning Tips for Parents${pageTitle}`,
      description: 'Helpful articles for parents on supporting their children with math learning.',
      type: 'website',
      url: page > 1 ? `https://sorokid.com/en/blog?page=${page}` : 'https://sorokid.com/en/blog',
      locale: 'en_US',
    },
    alternates: {
      canonical: page > 1 ? `https://sorokid.com/en/blog?page=${page}` : 'https://sorokid.com/en/blog',
      languages: {
        'vi': 'https://sorokid.com/blog',
        'en': 'https://sorokid.com/en/blog',
        'x-default': 'https://sorokid.com/blog',
      },
    },
    robots: page > 1 ? { index: true, follow: true } : undefined,
  };
}

// Icon components
const CategoryIcon = ({ icon, className }) => {
  const icons = {
    heart: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    lightbulb: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    star: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    book: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  };
  return icons[icon] || icons.heart;
};

// Article Card Component - Giống hệt VI
function ArticleCard({ post, category, featured = false }) {
  return (
    <article className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group ${featured ? 'lg:flex' : 'flex flex-col h-full'}`}>
      <LocalizedLink href={`/en/blog/${post.slug}`} className={`block ${featured ? 'lg:flex lg:w-full' : 'flex flex-col h-full'}`}>
        {/* Thumbnail */}
        <div className={`relative bg-gradient-to-br from-violet-100 to-pink-100 ${featured ? 'lg:w-2/5 h-48 sm:h-56 lg:h-auto min-h-[200px]' : 'h-40 sm:h-48'}`}>
          <div className="w-full h-full relative">
            <BlogImage
              src={post.image}
              alt={post.imageAlt || post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-pink-500/10" />
          </div>
          {/* Category Badge on image */}
          {category && (
            <div className="absolute top-3 left-3">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/95 backdrop-blur-sm shadow-sm"
                style={{ color: category.color }}
              >
                <CategoryIcon icon={category.icon} className="w-3.5 h-3.5" />
                {category.name}
              </span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className={`p-5 flex flex-col ${featured ? 'lg:w-3/5 lg:p-8 lg:justify-center' : 'flex-grow'}`}>
          <h2 className={`font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-violet-600 transition-colors ${featured ? 'text-xl lg:text-2xl' : 'text-lg'}`}>
            {post.title}
          </h2>
          <p className={`text-gray-600 mb-4 line-clamp-3 leading-relaxed ${featured ? 'text-base lg:text-lg' : 'text-sm flex-grow'}`}>
            {post.description}
          </p>
          
          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto">
            <time dateTime={post.publishedAt} className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(post.publishedAt, LOCALE)}
            </time>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.readingTime || calculateReadingTime(post.content?.intro)} min read
            </span>
          </div>
        </div>
      </LocalizedLink>
    </article>
  );
}

// Category Card Component
function CategoryCard({ category }) {
  return (
    <LocalizedLink 
      href={`/en/blog/category/${category.slug}`}
      className="flex flex-col p-4 bg-white rounded-xl border border-gray-100 hover:border-violet-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
        style={{ backgroundColor: `${category.color}15` }}
      >
        <CategoryIcon icon={category.icon} className="w-6 h-6" style={{ color: category.color }} />
      </div>
      <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1.5 group-hover:text-violet-600 transition-colors">
        {category.name}
      </h3>
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
        {category.description || 'View articles'}
      </p>
    </LocalizedLink>
  );
}

export default function EnglishBlogPage({ searchParams }) {
  const page = parseInt(searchParams?.page) || 1;
  const categories = getCategories(LOCALE);
  
  // Get paginated posts
  const { posts, totalPosts, totalPages, currentPage } = getPaginatedPosts({
    locale: LOCALE,
    page,
    perPage: POSTS_PER_PAGE,
    sortBy: 'publishedAt',
    sortOrder: 'desc'
  });
  
  // Get all posts for featured post selection
  const allPosts = getAllPosts({ locale: LOCALE, sortBy: 'publishedAt', sortOrder: 'desc' });

  // Featured post only on page 1
  const showFeatured = currentPage === 1;
  const featuredPost = showFeatured ? posts[0] : null;
  const displayPosts = showFeatured ? posts.slice(1) : posts;
  const featuredCategory = featuredPost ? categories.find(c => c.slug === featuredPost?.category) : null;

  return (
    <>
      {/* Hero Header - Giống hệt VI */}
      <header className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-14 text-center">
          <h1 className="text-xl sm:text-4xl font-bold mb-2 sm:mb-4">
            Tips for Parents
          </h1>
          <p className="text-white/90 text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Real experiences helping parents support their children with math learning – gentle, effective, stress-free.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-12">
        {/* Featured Post - only on page 1 */}
        {featuredPost && (
          <section className="mb-6 sm:mb-10">
            <ArticleCard 
              post={featuredPost} 
              category={featuredCategory}
              featured={true}
            />
          </section>
        )}

        {/* Categories Row - only on page 1 */}
        {currentPage === 1 && (
          <section className="mb-5 sm:mb-10">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Browse by Topic
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map(category => (
                <CategoryCard 
                  key={category.slug} 
                  category={category} 
                />
              ))}
            </div>
          </section>
        )}

        {/* All Posts Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              {currentPage === 1 ? 'All Articles' : `Page ${currentPage}`}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayPosts.map(post => {
              const category = categories.find(c => c.slug === post.category);
              return (
                <ArticleCard 
                  key={post.slug} 
                  post={post} 
                  category={category}
                />
              );
            })}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No articles yet.</p>
            </div>
          )}

          {/* Pagination */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/en/blog"
            locale="en"
          />
        </section>

        {/* Newsletter/CTA Section - only on page 1 */}
        {currentPage === 1 && (
          <section className="mt-16 sm:mt-20 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 rounded-3xl p-8 sm:p-12 text-center text-white overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          </div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎯</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Want your child to learn math more effectively?
            </h2>
            <p className="text-white/90 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
              Sorokid helps children learn math through games – parents don&apos;t have to tutor, but kids still progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LocalizedLink 
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-violet-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-xl"
              >
                Try Free for Your Child
              </LocalizedLink>
              <LocalizedLink 
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur text-white font-medium rounded-xl hover:bg-white/30 transition-colors border border-white/30"
              >
                Learn More About Sorokid
              </LocalizedLink>
            </div>
          </div>
        </section>
        )}
      </main>
    </>
  );
}
