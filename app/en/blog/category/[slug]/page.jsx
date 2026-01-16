/**
 * 📝 BLOG CATEGORY PAGE - ENGLISH
 * 
 * Lists all posts in a specific category (EN)
 * Uses shared component BlogCategoryContent
 * 
 * 🚀 OPTIMIZED:
 * - ISR: Revalidate every 30 minutes
 * - Static Generation with generateStaticParams
 */

import { notFound } from 'next/navigation';
import { getPaginatedPosts, getCategories, getCategoryBySlug } from '@/lib/blog';
import BlogCategoryContent from '@/components/Blog/BlogCategoryContent';

// ============ CONFIG ============
export const revalidate = 1800;
const POSTS_PER_PAGE = 9;
const LOCALE = 'en';
const BASE_URL = 'https://sorokid.com';

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = getCategories(LOCALE);
  return categories.map(cat => ({ slug: cat.slug }));
}

// Generate metadata for each category
export async function generateMetadata({ params, searchParams }) {
  const category = getCategoryBySlug(params.slug, LOCALE);
  const page = parseInt(searchParams?.page) || 1;
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  const pageTitle = page > 1 ? ` - Page ${page}` : '';
  const baseUrl = `${BASE_URL}/en/blog/category/${params.slug}`;

  return {
    title: `${category.seoTitle || category.name}${pageTitle} | SoroKid Blog`,
    description: category.seoDescription || category.description || `Browse all ${category.name} articles on SoroKid Blog`,
    keywords: category.keywords,
    alternates: {
      canonical: page > 1 ? `${baseUrl}?page=${page}` : baseUrl,
      languages: {
        'vi': `${BASE_URL}/blog/danh-muc/${params.slug}`,
        'en': `${BASE_URL}/en/blog/category/${params.slug}`,
        'x-default': `${BASE_URL}/blog/danh-muc/${params.slug}`,
      },
    },
    openGraph: {
      title: `${category.seoTitle || category.name}${pageTitle} | SoroKid Blog`,
      description: category.seoDescription || category.description,
      type: 'website',
      url: page > 1 ? `${baseUrl}?page=${page}` : baseUrl,
      locale: 'en_US',
    },
    robots: page > 1 ? { index: true, follow: true } : undefined,
  };
}

export default function EnglishCategoryPage({ params, searchParams }) {
  const category = getCategoryBySlug(params.slug, LOCALE);
  
  if (!category) {
    notFound();
  }

  const page = parseInt(searchParams?.page) || 1;
  
  // Get paginated posts for this category
  const { posts, totalPosts, totalPages, currentPage } = getPaginatedPosts({
    page,
    perPage: POSTS_PER_PAGE,
    category: params.slug,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
    locale: LOCALE,
  });
  
  const allCategories = getCategories(LOCALE);

  return (
    <BlogCategoryContent
      locale={LOCALE}
      category={category}
      categorySlug={params.slug}
      posts={posts}
      totalPosts={totalPosts}
      totalPages={totalPages}
      currentPage={currentPage}
      allCategories={allCategories}
    />
  );
}
