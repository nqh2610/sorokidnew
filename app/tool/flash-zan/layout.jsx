/**
 * ⚡ Flash ZAN - SEO Metadata
 */

export const metadata = {
  title: 'Flash ZAN - Luyện Tính Nhẩm Nhanh | Soroban Anzan',
  description: 'Công cụ luyện tính nhẩm nhanh với flash số. Phù hợp luyện Soroban, Anzan, phản xạ tính toán. Điều chỉnh tốc độ theo trình độ. Miễn phí cho giáo viên và học sinh.',
  keywords: [
    'flash anzan',
    'luyện tính nhẩm',
    'soroban online',
    'flash số',
    'tính nhẩm nhanh',
    'anzan training',
    'mental math',
    'luyện soroban',
  ],
  openGraph: {
    title: 'Flash ZAN - Luyện Tính Nhẩm Nhanh',
    description: 'Công cụ luyện tính nhẩm với flash số. Phù hợp Soroban, Anzan.',
    url: 'https://sorokid.com/tool/flash-zan',
    images: ['/og-flash-zan.png'],
    type: 'website',
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/flash-zan',
  },
};

function generateJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Flash ZAN',
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'VND',
    },
    'description': 'Công cụ luyện tính nhẩm nhanh với flash số, phù hợp Soroban và Anzan.',
    'featureList': [
      'Điều chỉnh tốc độ hiển thị',
      'Tùy chọn số chữ số',
      'Phép cộng và cộng trừ',
      'Chế độ toàn màn hình',
      'Hiển thị kết quả cuối',
    ],
    'audience': {
      '@type': 'EducationalAudience',
      'educationalRole': ['teacher', 'student'],
    },
    'educationalUse': [
      'Luyện Soroban',
      'Rèn phản xạ tính toán',
      'Thi đua tính nhẩm',
      'Khởi động tiết Toán',
    ],
  };
}

export default function FlashZanLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd()) }}
      />
      {children}
    </>
  );
}
