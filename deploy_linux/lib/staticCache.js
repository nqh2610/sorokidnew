/**
 * 🚀 STATIC CACHE UTILITIES
 * 
 * Hỗ trợ Static Generation và ISR
 * Giảm process xuống 0 cho các trang public
 * 
 * @version 1.0.0
 */

// ============ REVALIDATE TIMES ============
export const REVALIDATE = {
  // Trang chủ - build lại mỗi 1 giờ
  HOME: 3600,
  
  // Blog - build lại mỗi 30 phút
  BLOG: 1800,
  
  // Pricing - build lại mỗi ngày
  PRICING: 86400,
  
  // Tool pages - build lại mỗi tuần
  TOOLS: 604800,
  
  // Sitemap - build lại mỗi giờ
  SITEMAP: 3600,
  
  // Leaderboard - build lại mỗi 5 phút
  LEADERBOARD: 300,
};

// ============ FETCH CACHE CONFIG ============
/**
 * Fetch với cache tối ưu cho Static Generation
 * Sử dụng trong getStaticProps hoặc Server Components
 */
export const fetchStatic = {
  // Cache vĩnh viễn (cho static data)
  permanent: {
    cache: 'force-cache',
  },
  
  // Cache với revalidate (ISR)
  revalidate: (seconds) => ({
    next: { revalidate: seconds },
  }),
  
  // No cache (chỉ dùng cho auth)
  noStore: {
    cache: 'no-store',
  },
};

// ============ METADATA HELPERS ============
/**
 * Generate metadata chuẩn SEO cho trang
 */
export function generatePageMetadata({
  title,
  description,
  path = '',
  image = '/og-image.png',
  type = 'website',
  noIndex = false,
}) {
  const baseUrl = 'https://sorokid.com';
  const url = `${baseUrl}${path}`;
  
  return {
    title,
    description,
    
    // Robots
    robots: noIndex ? {
      index: false,
      follow: false,
    } : {
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
    
    // Open Graph
    openGraph: {
      title,
      description,
      url,
      siteName: 'Sorokid',
      type,
      locale: 'vi_VN',
      images: [
        {
          url: `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}${image}`],
    },
    
    // Alternates
    alternates: {
      canonical: url,
    },
  };
}

// ============ CACHE HEADERS ============
/**
 * Generate cache headers cho Response
 */
export function getCacheHeaders(type = 'static') {
  const headers = {
    // Static content - cache 1 năm
    static: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
    
    // ISR content - cache với stale-while-revalidate
    isr: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=3600',
    },
    
    // Dynamic content - không cache
    dynamic: {
      'Cache-Control': 'no-store, must-revalidate',
    },
    
    // API response - cache ngắn
    api: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  };
  
  return headers[type] || headers.dynamic;
}

// ============ STATIC PATHS HELPERS ============
/**
 * Pre-render paths cho generateStaticParams
 */
export function getStaticPathsConfig(paths, fallback = 'blocking') {
  return {
    paths: paths.map(path => ({ params: path })),
    fallback,
  };
}

export default {
  REVALIDATE,
  fetchStatic,
  generatePageMetadata,
  getCacheHeaders,
  getStaticPathsConfig,
};
