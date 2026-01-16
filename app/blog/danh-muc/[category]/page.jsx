/**
 * 📝 BLOG CATEGORY PAGE - VIETNAMESE
 * 
 * Trang danh sách bài viết theo danh mục (VI)
 * Sử dụng shared component BlogCategoryContent
 * 
 * 🚀 TỐI ƯU:
 * - ISR: Revalidate mỗi 30 phút
 * - Static Generation với generateStaticParams
 */

import { notFound } from 'next/navigation';
import { getPaginatedPosts, getCategories, getCategoryBySlug } from '@/lib/blog';
import BlogCategoryContent from '@/components/Blog/BlogCategoryContent';

// ============ CONFIG ============
export const revalidate = 1800;
const POSTS_PER_PAGE = 9;
const LOCALE = 'vi';
const BASE_URL = 'https://sorokid.com';

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = getCategories(LOCALE);
  return categories.map(cat => ({ category: cat.slug }));
}

// Generate metadata for each category
export async function generateMetadata({ params, searchParams }) {
  const category = getCategoryBySlug(params.category, LOCALE);
  const page = parseInt(searchParams?.page) || 1;
  
  if (!category) {
    return {
      title: 'Không tìm thấy danh mục',
    };
  }

  const pageTitle = page > 1 ? ` - Trang ${page}` : '';
  const baseUrl = `${BASE_URL}/blog/danh-muc/${params.category}`;

  return {
    title: `${category.seoTitle || category.name}${pageTitle} | Blog Sorokid`,
    description: category.seoDescription || category.description,
    keywords: category.keywords,
    alternates: {
      canonical: page > 1 ? `${baseUrl}?page=${page}` : baseUrl,
      languages: {
        'vi': `${BASE_URL}/blog/danh-muc/${params.category}`,
        'en': `${BASE_URL}/en/blog/category/${params.category}`,
        'x-default': `${BASE_URL}/blog/danh-muc/${params.category}`,
      },
    },
    openGraph: {
      title: `${category.seoTitle || category.name}${pageTitle} | Blog Sorokid`,
      description: category.seoDescription || category.description,
      type: 'website',
      url: page > 1 ? `${baseUrl}?page=${page}` : baseUrl,
      locale: 'vi_VN',
    },
    robots: page > 1 ? { index: true, follow: true } : undefined,
  };
}

export default function CategoryPage({ params, searchParams }) {
  const category = getCategoryBySlug(params.category, LOCALE);
  
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
    sortOrder: 'desc',
    locale: LOCALE,
  });
  
  const allCategories = getCategories(LOCALE);

  return (
    <BlogCategoryContent
      locale={LOCALE}
      category={category}
      categorySlug={params.category}
      posts={posts}
      totalPosts={totalPosts}
      totalPages={totalPages}
      currentPage={currentPage}
      allCategories={allCategories}
    />
  );
}
