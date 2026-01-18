/**
 * 🎯 SEO METADATA GENERATOR - ĐA NGÔN NGỮ
 * 
 * Tạo metadata SEO theo ngôn ngữ:
 * - Title, description, keywords riêng biệt
 * - OpenGraph theo ngôn ngữ
 * - Structured data (JSON-LD) theo ngôn ngữ
 * - Hreflang tags
 * - Canonical URLs
 * 
 * NGUYÊN TẮC:
 * - Static generation - không runtime
 * - Không duplicate content
 * - Semantic SEO
 * 
 * @version 1.0.0
 */

import { locales, defaultLocale, localeConfig } from './config';
import { getDictionarySync } from './dictionary';
import { getAllKeywords, KEYWORD_MAPPING } from './seo-keywords';

const BASE_URL = 'https://sorokid.com';

/**
 * Tạo metadata cho một trang theo ngôn ngữ
 * Sử dụng trong generateMetadata của Next.js
 * 
 * @param {string} page - Tên trang (home, pricing, blog, tool)
 * @param {string} locale - Ngôn ngữ
 * @param {object} overrides - Override metadata
 * @returns {object} - Next.js metadata object
 */
export function generatePageMetadata(page, locale = defaultLocale, overrides = {}) {
  const dict = getDictionarySync(locale);
  const seo = dict.seo?.[page] || {};
  const config = localeConfig[locale];
  
  // Base metadata
  const metadata = {
    metadataBase: new URL(BASE_URL),
    
    // Title
    title: overrides.title || seo.title || dict.common?.brand,
    
    // Description
    description: overrides.description || seo.description,
    
    // Keywords
    keywords: overrides.keywords || seo.keywords || [],
    
    // Language
    alternates: {
      canonical: overrides.canonical || `${BASE_URL}/${page === 'home' ? '' : page}`,
      languages: generateHreflangLinks(page),
    },
    
    // OpenGraph
    openGraph: {
      title: overrides.ogTitle || seo.title,
      description: overrides.ogDescription || seo.description,
      url: `${BASE_URL}/${locale === defaultLocale ? '' : locale + '/'}${page === 'home' ? '' : page}`,
      siteName: 'Sorokid',
      locale: config.hreflang.replace('-', '_'),
      type: 'website',
      images: [
        {
          url: overrides.ogImage || '/og-image.png',
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: overrides.twitterTitle || seo.title,
      description: overrides.twitterDescription || seo.description,
      images: [overrides.twitterImage || '/og-image.png'],
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Other
    authors: [{ name: 'Sorokid Team', url: BASE_URL }],
    creator: 'Sorokid',
    publisher: 'Sorokid',
  };
  
  return metadata;
}

/**
 * Tạo hreflang links cho một trang
 * 
 * @param {string} page - Tên trang
 * @returns {object} - Hreflang mapping
 */
export function generateHreflangLinks(page) {
  const path = page === 'home' ? '' : page;
  const links = {};
  
  for (const locale of locales) {
    const config = localeConfig[locale];
    links[config.hreflang] = `${BASE_URL}/${locale === defaultLocale ? '' : locale + '/'}${path}`;
  }
  
  // x-default points to Vietnamese (default)
  links['x-default'] = `${BASE_URL}/${path}`;
  
  return links;
}

/**
 * Tạo JSON-LD structured data theo ngôn ngữ
 * 
 * @param {string} type - Loại schema (WebSite, Organization, WebPage, etc.)
 * @param {string} locale - Ngôn ngữ
 * @param {object} data - Dữ liệu bổ sung
 * @returns {object} - JSON-LD object
 */
export function generateJsonLd(type, locale = defaultLocale, data = {}) {
  const dict = getDictionarySync(locale);
  const config = localeConfig[locale];
  
  const schemas = {
    // WebSite schema
    WebSite: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: locale === 'vi' 
        ? 'Sorokid - Ứng dụng Học Soroban Tốt Nhất' 
        : 'Sorokid - Best Soroban Learning App',
      description: dict.seo?.home?.description,
      inLanguage: config.htmlLang,
      publisher: { '@id': `${BASE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      ...data,
    },
    
    // Organization schema
    Organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Sorokid',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
        width: 512,
        height: 512,
      },
      description: locale === 'vi'
        ? 'Sorokid là ứng dụng học Soroban tốt nhất Việt Nam cho học sinh tiểu học 6-12 tuổi'
        : 'Sorokid is the best Soroban learning app for elementary students aged 6-12',
      foundingDate: '2024',
      areaServed: {
        '@type': 'Country',
        name: locale === 'vi' ? 'Vietnam' : 'Vietnam',
      },
      sameAs: [
        'https://facebook.com/sorokid',
        'https://youtube.com/@sorokid',
      ],
      ...data,
    },
    
    // WebApplication schema (cho App)
    WebApplication: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': `${BASE_URL}/#app`,
      name: locale === 'vi' ? 'Sorokid - Học Soroban Online' : 'Sorokid - Learn Soroban Online',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web Browser',
      url: `${BASE_URL}/learn`,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'VND',
        description: locale === 'vi' ? 'Dùng thử miễn phí' : 'Free trial available',
      },
      author: { '@id': `${BASE_URL}/#organization` },
      ...data,
    },
    
    // FAQPage schema
    FAQPage: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: (data.questions || []).map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer,
        },
      })),
    },
    
    // BreadcrumbList schema
    BreadcrumbList: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: (data.items || []).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    },
  };
  
  return schemas[type] || schemas.WebSite;
}

/**
 * Tạo FAQ schema theo ngôn ngữ
 * 
 * @param {string} page - Tên trang
 * @param {string} locale - Ngôn ngữ
 * @returns {object} - FAQ JSON-LD
 */
export function generateFaqSchema(page, locale = defaultLocale) {
  const faqData = {
    home: {
      vi: [
        {
          question: 'SoroKid là gì?',
          answer: 'SoroKid là ứng dụng học Soroban (bàn tính Nhật Bản) online, giúp trẻ tiểu học 6-12 tuổi học tính nhẩm nhanh qua game và bài học tương tác.',
        },
        {
          question: 'Phụ huynh không biết Soroban có kèm con học được không?',
          answer: 'Hoàn toàn được! SoroKid đã có sẵn lộ trình học, hướng dẫn chi tiết từng bước. Phụ huynh chỉ cần động viên và theo dõi tiến độ.',
        },
        {
          question: 'Trẻ mấy tuổi học Soroban được?',
          answer: 'Độ tuổi vàng là 6-8 tuổi. Trẻ 5-6 tuổi có thể làm quen, trẻ 8-10 tuổi vẫn học tốt.',
        },
        {
          question: 'Học Soroban bao lâu thì thấy kết quả?',
          answer: 'Sau 2-4 tuần học đều đặn (15-20 phút/ngày), thường thấy con tính nhẩm nhanh hơn với các phép tính đơn giản.',
        },
      ],
      en: [
        {
          question: 'What is SoroKid?',
          answer: 'SoroKid is an online Soroban (Japanese abacus) learning app that helps elementary students aged 6-12 develop fast mental math skills through games and interactive lessons.',
        },
        {
          question: 'Can parents teach Soroban without knowing it?',
          answer: 'Absolutely! SoroKid provides a complete learning path with step-by-step guidance. Parents just need to encourage and track progress.',
        },
        {
          question: 'What is the best age to learn Soroban?',
          answer: 'The golden age is 6-8 years old. Children aged 5-6 can start getting familiar, and 8-10 year olds can still learn effectively.',
        },
        {
          question: 'How long until we see results?',
          answer: 'After 2-4 weeks of consistent practice (15-20 minutes/day), children typically show improvement in simple mental calculations.',
        },
      ],
    },
    tool: {
      vi: [
        {
          question: 'Toolbox Giáo Viên là gì?',
          answer: 'Toolbox là bộ sưu tập các trò chơi quốc dân phổ biến nhất trong lớp học Việt Nam: Ai Là Triệu Phú, Chiếc Nón Kỳ Diệu, Ô Chữ, Đua Thú... Miễn phí 100%!',
        },
        {
          question: 'Có cần đăng nhập không?',
          answer: 'Không cần! Tất cả công cụ đều miễn phí và không yêu cầu đăng nhập. Mở và dùng ngay.',
        },
        {
          question: 'Có dùng được trên điện thoại không?',
          answer: 'Có! Toolbox hoạt động tốt trên mọi thiết bị: máy tính, tablet, điện thoại.',
        },
      ],
      en: [
        {
          question: 'What is Teacher Toolbox?',
          answer: 'Toolbox is a collection of popular classroom games: Quiz Show, Spin Wheel, Crossword, Animal Race... 100% free!',
        },
        {
          question: 'Do I need to sign up?',
          answer: 'No! All tools are free and require no login. Just open and use.',
        },
        {
          question: 'Does it work on mobile?',
          answer: 'Yes! Toolbox works great on all devices: computers, tablets, and phones.',
        },
      ],
    },
  };
  
  const questions = faqData[page]?.[locale] || faqData[page]?.vi || [];
  
  return generateJsonLd('FAQPage', locale, { questions });
}

/**
 * Tạo breadcrumb schema theo ngôn ngữ
 * 
 * @param {array} items - Mảng breadcrumb items [{name, url}]
 * @param {string} locale - Ngôn ngữ
 * @returns {object} - Breadcrumb JSON-LD
 */
export function generateBreadcrumbSchema(items, locale = defaultLocale) {
  const dict = getDictionarySync(locale);
  
  // Thêm home item ở đầu nếu chưa có
  const breadcrumbItems = [
    { name: dict.common?.home || 'Home', url: BASE_URL },
    ...items,
  ];
  
  return generateJsonLd('BreadcrumbList', locale, { items: breadcrumbItems });
}

/**
 * Export tất cả trong một object
 */
export const seoGenerator = {
  generatePageMetadata,
  generateHreflangLinks,
  generateJsonLd,
  generateFaqSchema,
  generateBreadcrumbSchema,
};

export default seoGenerator;
