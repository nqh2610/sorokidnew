/**
 * BLOG POST PAGE - ENGLISH
 * Uses shared BlogPostContent component
 */

import { notFound } from 'next/navigation';
import {
  getPostBySlug,
  getPostBySlugWithStatus,
  getAllPostSlugs,
  getCategoryBySlug,
  getRelatedPosts,
  getCategories,
  generateArticleSchema,
  generateFAQSchema,
} from '@/lib/blog';
import BlogPostContent from '@/components/Blog/BlogPostContent';

const LOCALE = 'en';
const BASE_URL = 'https://sorokid.com';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = getAllPostSlugs(LOCALE);
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
  const post = getPostBySlugWithStatus(params.slug, LOCALE);
  
  if (!post) {
    return { title: 'Article Not Found', robots: { index: false, follow: false } };
  }

  if (post.status === 'draft') {
    return { title: post.title + ' | SoroKid Blog', robots: { index: false, follow: false } };
  }

  return {
    title: post.title + ' | SoroKid Blog',
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: BASE_URL + '/en/blog/' + params.slug },
    robots: { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: BASE_URL + '/en/blog/' + params.slug,
      siteName: 'SoroKid',
      locale: 'en_US',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author || 'SoroKid'],
      images: post.image ? [{ url: post.image, width: 1200, height: 630, alt: post.imageAlt || post.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : ['/og-image.png'],
    },
  };
}

function generateBreadcrumbSchema(post, category) {
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL + '/en' },
    { "@type": "ListItem", position: 2, name: "Blog", item: BASE_URL + '/en/blog' },
  ];

  if (category) {
    items.push({ "@type": "ListItem", position: 3, name: category.name, item: BASE_URL + '/en/blog/category/' + category.slug });
    items.push({ "@type": "ListItem", position: 4, name: post.title });
  } else {
    items.push({ "@type": "ListItem", position: 3, name: post.title });
  }

  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
}

export default function BlogPostPage({ params }) {
  const post = getPostBySlug(params.slug, LOCALE, true);
  
  if (!post) {
    notFound();
  }

  const category = post.category ? getCategoryBySlug(post.category, LOCALE) : null;
  const relatedPosts = getRelatedPosts(post.slug, post.category, LOCALE, 3);
  const categories = relatedPosts.length > 0 ? getCategories(LOCALE) : [];
  
  const articleSchema = generateArticleSchema(post, BASE_URL + '/en/blog/' + post.slug);
  const faqSchema = generateFAQSchema(post.faq);
  const breadcrumbSchema = generateBreadcrumbSchema(post, category);

  return (
    <BlogPostContent
      post={post}
      category={category}
      relatedPosts={relatedPosts}
      categories={categories}
      locale={LOCALE}
      articleSchema={articleSchema}
      faqSchema={faqSchema}
      breadcrumbSchema={breadcrumbSchema}
    />
  );
}
