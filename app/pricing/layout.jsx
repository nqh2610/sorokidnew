/**
 * 💰 PRICING LAYOUT - SEO Metadata
 * 
 * Layout cho trang Pricing với SEO tối ưu
 * 
 * 🚀 TỐI ƯU SHARED HOSTING:
 * - Static metadata cho SEO
 * - Client component trong page.jsx handle tương tác
 * - 0 DB queries cho SEO crawl
 */

// ============ STATIC CONFIG ============
export const dynamic = 'force-static';
export const revalidate = false;

// ============ METADATA SEO ============
export const metadata = {
  title: 'Bảng Giá Sorokid - Gói Học Soroban Online | Học Tính Nhẩm Cho Trẻ',
  description: 'Bảng giá các gói học Soroban online tại Sorokid. Gói Miễn Phí, Cơ Bản, Nâng Cao với lộ trình học khoa học. Học tính nhẩm nhanh cho trẻ tiểu học 6-12 tuổi.',
  keywords: [
    // Primary keywords
    'bảng giá sorokid',
    'học soroban online',
    'gói học soroban',
    'học tính nhẩm online',
    // Long-tail keywords
    'học soroban cho trẻ em',
    'khóa học soroban online',
    'học toán tư duy cho trẻ',
    'phương pháp soroban nhật bản',
    // Intent keywords
    'giá học soroban',
    'chi phí học soroban',
    'so sánh gói soroban',
  ],
  openGraph: {
    title: 'Bảng Giá Sorokid - Gói Học Soroban Online',
    description: 'Các gói học Soroban cho trẻ tiểu học. Lộ trình khoa học, game hóa học tập, phụ huynh theo dõi tiến bộ.',
    type: 'website',
    url: 'https://sorokid.com/pricing',
    siteName: 'Sorokid',
    locale: 'vi_VN',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bảng Giá Sorokid - Gói Học Soroban Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bảng Giá Sorokid - Gói Học Soroban Online',
    description: 'Các gói học Soroban cho trẻ tiểu học với giá hợp lý.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://sorokid.com/pricing',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ============ JSON-LD STRUCTURED DATA ============
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Sorokid - Gói Học Soroban Online',
  description: 'Ứng dụng học Soroban cho trẻ tiểu học với phương pháp Nhật Bản, game hóa học tập',
  brand: {
    '@type': 'Brand',
    name: 'Sorokid',
  },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'VND',
    lowPrice: '0',
    highPrice: '599000',
    offerCount: '3',
    offers: [
      {
        '@type': 'Offer',
        name: 'Gói Miễn Phí',
        price: '0',
        priceCurrency: 'VND',
        description: 'Trải nghiệm cơ bản với bài học Level 1-5',
      },
      {
        '@type': 'Offer',
        name: 'Gói Cơ Bản',
        price: '199000',
        priceCurrency: 'VND',
        description: 'Bài học Cộng Trừ đầy đủ Level 1-10',
      },
      {
        '@type': 'Offer',
        name: 'Gói Nâng Cao',
        price: '599000',
        priceCurrency: 'VND',
        description: 'Toàn bộ bài học Cộng Trừ Nhân Chia',
      },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '3156',
  },
};

export default function PricingLayout({ children }) {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
