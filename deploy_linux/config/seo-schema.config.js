/**
 * 🔗 JSON-LD SCHEMA GENERATOR
 * 
 * Structured Data cho Sorokid website
 * Hỗ trợ Google Search, Rich Results, AI Search
 * 
 * Schemas:
 * - Organization
 * - WebApplication
 * - FAQPage
 * - Course
 * - BreadcrumbList
 * - HowTo
 * - EducationalOrganization
 * - Product (SoftwareApplication)
 */

import { FAQ_DATA, ENTITIES, SEO_TEMPLATES } from './seo-keywords.config.js';

// ============================================================
// BASE ORGANIZATION SCHEMA
// ============================================================
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://sorokid.com/#organization',
    name: 'Sorokid',
    alternateName: ['SoroKid', 'Soro Kid'],
    url: 'https://sorokid.com',
    logo: {
      '@type': 'ImageObject',
      '@id': 'https://sorokid.com/#logo',
      url: 'https://sorokid.com/images/sorokid-logo.png',
      contentUrl: 'https://sorokid.com/images/sorokid-logo.png',
      width: 512,
      height: 512,
      caption: 'Sorokid - Ứng dụng học Soroban tốt nhất'
    },
    description: 'Sorokid - Ứng dụng học Soroban (bàn tính Nhật Bản) online cho trẻ 6-12 tuổi. Phương pháp game hóa, lộ trình khoa học, phụ huynh dễ dàng kèm con.',
    slogan: 'Học Soroban tại nhà - Phụ huynh không cần biết Soroban',
    sameAs: [
      'https://www.facebook.com/sorokid',
      'https://www.youtube.com/@sorokid',
      'https://www.tiktok.com/@sorokid',
    ],
    foundingDate: '2024',
    knowsAbout: [
      'Soroban',
      'Mental Math',
      'Japanese Abacus',
      'Early Childhood Education',
      'Math Education',
      'Brain Development',
      'EdTech',
    ],
    areaServed: {
      '@type': 'Country',
      name: 'Vietnam',
      alternateName: 'Việt Nam'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Vietnamese', 'English'],
      url: 'https://sorokid.com/contact'
    }
  };
}

// ============================================================
// WEB APPLICATION SCHEMA
// ============================================================
export function generateWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': 'https://sorokid.com/#webapp',
    name: 'Sorokid',
    alternateName: 'Ứng dụng học Soroban Sorokid',
    applicationCategory: 'EducationalApplication',
    applicationSubCategory: 'Math Learning App',
    operatingSystem: 'Web Browser, Android, iOS',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    url: 'https://sorokid.com',
    downloadUrl: 'https://sorokid.com',
    installUrl: 'https://sorokid.com',
    screenshot: [
      'https://sorokid.com/images/screenshot-homepage.png',
      'https://sorokid.com/images/screenshot-learn.png',
      'https://sorokid.com/images/screenshot-practice.png',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'VND',
      description: 'Miễn phí các bài học cơ bản, gói Premium mở khóa toàn bộ nội dung',
      availability: 'https://schema.org/InStock',
      url: 'https://sorokid.com/pricing'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1'
    },
    description: 'Ứng dụng học Soroban (bàn tính Nhật Bản) tốt nhất cho trẻ 6-12 tuổi. Học toán tư duy qua game, lộ trình khoa học, phụ huynh không cần biết Soroban vẫn kèm con được.',
    keywords: 'soroban, học soroban, app học soroban, toán tư duy, tính nhẩm, bàn tính nhật bản',
    creator: {
      '@id': 'https://sorokid.com/#organization'
    },
    publisher: {
      '@id': 'https://sorokid.com/#organization'
    },
    featureList: [
      'Hướng dẫn từng bước bằng hình ảnh',
      'Lộ trình học-luyện-thi khoa học',
      'Game hóa tạo hứng thú học tập',
      'Phụ huynh theo dõi tiến bộ của con',
      'Học mọi lúc mọi nơi',
      'Phương pháp Soroban chuẩn Nhật Bản'
    ],
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
      audienceType: 'Elementary School Students'
    },
    educationalLevel: ['Preschool', 'Primary School'],
    learningResourceType: ['Interactive App', 'Video Lesson', 'Practice Quiz', 'Game'],
    inLanguage: 'vi'
  };
}

// ============================================================
// FAQ PAGE SCHEMA
// ============================================================
export function generateFAQSchema(page = 'homepage') {
  const faqs = FAQ_DATA[page] || FAQ_DATA.homepage;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `https://sorokid.com/${page === 'homepage' ? '' : page}#faq`,
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

// ============================================================
// COURSE SCHEMA (Cho trang Learn)
// ============================================================
export function generateCourseSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': 'https://sorokid.com/learn#course',
    name: 'Khóa học Soroban Online cho trẻ tiểu học',
    alternateName: 'Học Soroban tại nhà với Sorokid',
    description: 'Khóa học Soroban (bàn tính Nhật Bản) online từ cơ bản đến nâng cao. Dành cho trẻ 6-12 tuổi. Phụ huynh không cần biết Soroban vẫn kèm con được.',
    provider: {
      '@id': 'https://sorokid.com/#organization'
    },
    url: 'https://sorokid.com/learn',
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
      audienceType: 'Children 6-12 years old'
    },
    educationalLevel: ['Primary School', 'Elementary School'],
    educationalCredentialAwarded: 'Chứng chỉ hoàn thành khóa học Soroban',
    numberOfCredits: 50,
    timeRequired: 'P3M',
    teaches: [
      'Sử dụng bàn tính Soroban',
      'Tính nhẩm nhanh và chính xác',
      'Tư duy logic và phản xạ',
      'Quy tắc bạn 5, bạn 10',
      'Anzan (tính nhẩm hình ảnh)'
    ],
    learningResourceType: ['Interactive Module', 'Video', 'Quiz', 'Practice Exercise'],
    hasCourseInstance: [
      {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: 'PT20M per day',
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        instructor: {
          '@type': 'Organization',
          '@id': 'https://sorokid.com/#organization'
        }
      }
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
      validFrom: '2024-01-01',
      url: 'https://sorokid.com/pricing',
      description: 'Học thử miễn phí, gói Premium mở khóa toàn bộ nội dung'
    },
    inLanguage: 'vi'
  };
}

// ============================================================
// BREADCRUMB SCHEMA
// ============================================================
export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

// ============================================================
// HOW-TO SCHEMA (Cho hướng dẫn học)
// ============================================================
export function generateHowToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': 'https://sorokid.com/#howto',
    name: 'Cách học Soroban tại nhà với Sorokid',
    description: 'Hướng dẫn từng bước để phụ huynh kèm con học Soroban tại nhà, không cần biết Soroban trước đó.',
    totalTime: 'P3M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'VND',
      value: '0'
    },
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Điện thoại, máy tính bảng hoặc máy tính'
      },
      {
        '@type': 'HowToTool',
        name: 'Kết nối Internet'
      },
      {
        '@type': 'HowToTool',
        name: 'Tài khoản Sorokid'
      }
    ],
    step: [
      {
        '@type': 'HowToStep',
        name: 'Đăng ký tài khoản',
        text: 'Truy cập sorokid.com và đăng ký tài khoản miễn phí cho con.',
        url: 'https://sorokid.com/register'
      },
      {
        '@type': 'HowToStep',
        name: 'Làm bài đánh giá',
        text: 'Cho con làm bài đánh giá để xác định trình độ phù hợp.',
        url: 'https://sorokid.com/learn'
      },
      {
        '@type': 'HowToStep',
        name: 'Bắt đầu học theo lộ trình',
        text: 'Con học theo lộ trình được cá nhân hóa, 15-20 phút mỗi ngày.',
        url: 'https://sorokid.com/learn'
      },
      {
        '@type': 'HowToStep',
        name: 'Luyện tập hàng ngày',
        text: 'Cho con luyện tập với các bài tập đa dạng để rèn phản xạ.',
        url: 'https://sorokid.com/practice'
      },
      {
        '@type': 'HowToStep',
        name: 'Theo dõi tiến bộ',
        text: 'Phụ huynh kiểm tra Dashboard để theo dõi 3 chỉ số: chăm chỉ, tốc độ, chính xác.',
        url: 'https://sorokid.com/dashboard'
      }
    ]
  };
}

// ============================================================
// ENTITY SCHEMA (Semantic SEO)
// ============================================================
export function generateEntitySchema(entityKey) {
  const entity = ENTITIES[entityKey];
  if (!entity) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `https://sorokid.com/#${entityKey}`,
    name: entity.name,
    alternateName: entity.alternateName,
    description: entity.description,
    sameAs: entity.sameAs || [],
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Soroban Education Terminology'
    }
  };
}

// ============================================================
// COMBINED SCHEMA FOR HOMEPAGE
// ============================================================
export function generateHomepageSchema() {
  return [
    generateOrganizationSchema(),
    generateWebApplicationSchema(),
    generateFAQSchema('homepage'),
    generateHowToSchema(),
    generateEntitySchema('soroban'),
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://sorokid.com/#webpage',
      url: 'https://sorokid.com',
      name: 'Sorokid - Ứng Dụng Học Soroban Tốt Nhất | Học Toán Tư Duy Cho Bé',
      description: SEO_TEMPLATES.descriptions.homepage,
      isPartOf: {
        '@id': 'https://sorokid.com/#website'
      },
      about: {
        '@id': 'https://sorokid.com/#soroban'
      },
      breadcrumb: {
        '@id': 'https://sorokid.com/#breadcrumb'
      },
      mainEntity: {
        '@id': 'https://sorokid.com/#webapp'
      },
      potentialAction: [
        {
          '@type': 'SearchAction',
          target: 'https://sorokid.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      ],
      inLanguage: 'vi'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://sorokid.com/#website',
      url: 'https://sorokid.com',
      name: 'Sorokid',
      description: 'Ứng dụng học Soroban tốt nhất cho trẻ tiểu học Việt Nam',
      publisher: {
        '@id': 'https://sorokid.com/#organization'
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://sorokid.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      },
      inLanguage: 'vi'
    },
    generateBreadcrumbSchema([
      { name: 'Trang chủ', url: 'https://sorokid.com' }
    ])
  ];
}

// ============================================================
// COMBINED SCHEMA FOR LEARN PAGE
// ============================================================
export function generateLearnPageSchema() {
  return [
    generateCourseSchema(),
    generateBreadcrumbSchema([
      { name: 'Trang chủ', url: 'https://sorokid.com' },
      { name: 'Học', url: 'https://sorokid.com/learn' }
    ])
  ];
}

// ============================================================
// COMBINED SCHEMA FOR PRICING PAGE
// ============================================================
export function generatePricingPageSchema() {
  return [
    generateFAQSchema('pricing'),
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': 'https://sorokid.com/pricing#product',
      name: 'Sorokid Premium',
      description: 'Gói học Soroban trọn đời với đầy đủ bài học, thi đấu và chứng chỉ',
      brand: {
        '@id': 'https://sorokid.com/#organization'
      },
      category: 'Educational Software',
      offers: [
        {
          '@type': 'Offer',
          name: 'Gói Miễn Phí',
          price: '0',
          priceCurrency: 'VND',
          availability: 'https://schema.org/InStock',
          description: 'Bài học cơ bản Level 1-5',
          url: 'https://sorokid.com/pricing'
        },
        {
          '@type': 'Offer',
          name: 'Gói Premium',
          price: '499000',
          priceCurrency: 'VND',
          availability: 'https://schema.org/InStock',
          description: 'Trọn đời, toàn bộ bài học, thi đấu, chứng chỉ',
          url: 'https://sorokid.com/pricing'
        }
      ]
    },
    generateBreadcrumbSchema([
      { name: 'Trang chủ', url: 'https://sorokid.com' },
      { name: 'Bảng giá', url: 'https://sorokid.com/pricing' }
    ])
  ];
}

export default {
  generateOrganizationSchema,
  generateWebApplicationSchema,
  generateFAQSchema,
  generateCourseSchema,
  generateBreadcrumbSchema,
  generateHowToSchema,
  generateEntitySchema,
  generateHomepageSchema,
  generateLearnPageSchema,
  generatePricingPageSchema,
};
