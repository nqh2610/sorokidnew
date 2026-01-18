/**
 * 🗺️ DYNAMIC SITEMAP với XSL Stylesheet - Hiển thị đẹp trên trình duyệt
 * 
 * URL: https://sorokid.com/sitemap.xml
 * 
 * Features:
 * - Hiển thị đẹp với bảng, màu sắc, thống kê
 * - Hỗ trợ đa ngôn ngữ (VI/EN)
 * - SEO-friendly với hreflang
 * - Tự động cập nhật khi thêm blog/tool mới
 */

import { getAllPosts, getCategories } from '@/lib/blog';

const BASE_URL = 'https://sorokid.com';
const LOCALES = ['vi', 'en'];

// Tool pages configuration
const TOOL_PAGES = [
  { path: '/tool', priority: 0.9, changefreq: 'weekly' },
  { path: '/tool/chiec-non-ky-dieu', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/dua-thu-hoat-hinh', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/flash-zan', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/dong-ho-bam-gio', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/chia-nhom', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/boc-tham', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/ban-tinh-soroban', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/den-may-man', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/ai-la-trieu-phu', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/cuoc-dua-ki-thu', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/xuc-xac', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/o-chu', priority: 0.8, changefreq: 'monthly' },
  { path: '/tool/chia-nhom-boc-tham', priority: 0.8, changefreq: 'monthly' },
];

/**
 * Tạo URL với locale prefix
 */
function getLocalizedUrl(path, locale) {
  if (locale === 'vi') {
    return path === '' ? BASE_URL : `${BASE_URL}${path}`;
  }
  return path === '' ? `${BASE_URL}/en` : `${BASE_URL}/en${path}`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Tạo XML cho một URL entry
 */
function createUrlEntry(url, lastmod, changefreq, priority, alternates = null) {
  let entry = `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;
  
  if (alternates) {
    Object.entries(alternates).forEach(([lang, href]) => {
      entry += `
    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(href)}"/>`;
    });
  }
  
  entry += `
  </url>`;
  
  return entry;
}

export async function GET() {
  const now = new Date().toISOString();
  const urls = [];

  // 1. Static pages - Homepage (cả 2 ngôn ngữ)
  LOCALES.forEach(locale => {
    const url = getLocalizedUrl('', locale);
    const priority = locale === 'vi' ? '1.0' : '0.9';
    urls.push(createUrlEntry(url, now, 'daily', priority, {
      'vi': BASE_URL,
      'en': `${BASE_URL}/en`,
      'x-default': BASE_URL,
    }));
  });

  // Blog index
  LOCALES.forEach(locale => {
    const url = getLocalizedUrl('/blog', locale);
    const priority = locale === 'vi' ? '0.9' : '0.8';
    urls.push(createUrlEntry(url, now, 'daily', priority, {
      'vi': `${BASE_URL}/blog`,
      'en': `${BASE_URL}/en/blog`,
      'x-default': `${BASE_URL}/blog`,
    }));
  });

  // Pricing
  LOCALES.forEach(locale => {
    const url = getLocalizedUrl('/pricing', locale);
    const priority = locale === 'vi' ? '0.8' : '0.7';
    urls.push(createUrlEntry(url, now, 'weekly', priority, {
      'vi': `${BASE_URL}/pricing`,
      'en': `${BASE_URL}/en/pricing`,
      'x-default': `${BASE_URL}/pricing`,
    }));
  });

  // 2. Tool pages
  TOOL_PAGES.forEach(tool => {
    LOCALES.forEach(locale => {
      const url = getLocalizedUrl(tool.path, locale);
      const priority = locale === 'vi' ? tool.priority : (tool.priority - 0.1).toFixed(1);
      urls.push(createUrlEntry(url, now, tool.changefreq, priority, {
        'vi': `${BASE_URL}${tool.path}`,
        'en': `${BASE_URL}/en${tool.path}`,
        'x-default': `${BASE_URL}${tool.path}`,
      }));
    });
  });

  // 3. Blog categories
  try {
    const viCategories = getCategories('vi');
    viCategories.forEach(category => {
      urls.push(createUrlEntry(
        `${BASE_URL}/blog/danh-muc/${category.slug}`,
        now,
        'daily',
        '0.8'
      ));
    });

    const enCategories = getCategories('en');
    enCategories.forEach(category => {
      urls.push(createUrlEntry(
        `${BASE_URL}/en/blog/category/${category.slug}`,
        now,
        'daily',
        '0.7',
        {
          'vi': `${BASE_URL}/blog/danh-muc/${category.slug}`,
          'en': `${BASE_URL}/en/blog/category/${category.slug}`,
          'x-default': `${BASE_URL}/blog/danh-muc/${category.slug}`,
        }
      ));
    });
  } catch (e) {
    console.error('Error getting categories:', e);
  }

  // 4. Blog posts
  try {
    const viPosts = getAllPosts({ locale: 'vi', sortBy: 'publishedAt', sortOrder: 'desc' });
    viPosts
      .filter(post => post.status === 'published')
      .forEach(post => {
        const lastmod = new Date(post.updatedAt || post.publishedAt).toISOString();
        const alternates = post.translations?.en ? {
          'vi': `${BASE_URL}/blog/${post.slug}`,
          'en': `${BASE_URL}/en/blog/${post.translations.en}`,
          'x-default': `${BASE_URL}/blog/${post.slug}`,
        } : null;
        urls.push(createUrlEntry(
          `${BASE_URL}/blog/${post.slug}`,
          lastmod,
          'weekly',
          '0.7',
          alternates
        ));
      });

    const enPosts = getAllPosts({ locale: 'en', sortBy: 'publishedAt', sortOrder: 'desc' });
    enPosts
      .filter(post => post.status === 'published')
      .forEach(post => {
        const lastmod = new Date(post.updatedAt || post.publishedAt).toISOString();
        const alternates = post.translations?.vi ? {
          'vi': `${BASE_URL}/blog/${post.translations.vi}`,
          'en': `${BASE_URL}/en/blog/${post.slug}`,
          'x-default': `${BASE_URL}/blog/${post.translations.vi}`,
        } : null;
        urls.push(createUrlEntry(
          `${BASE_URL}/en/blog/${post.slug}`,
          lastmod,
          'weekly',
          '0.6',
          alternates
        ));
      });
  } catch (e) {
    console.error('Error getting blog posts:', e);
  }

  // Generate XML with stylesheet reference
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
