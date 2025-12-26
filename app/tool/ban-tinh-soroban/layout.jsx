/**
 * 🧮 Bàn Tính Soroban - SEO Metadata
 */

export const metadata = {
  title: 'Bàn Tính Soroban Ảo - Luyện Tập Online Miễn Phí',
  description: 'Bàn tính Soroban ảo miễn phí, hỗ trợ kéo thả hạt trực quan. Phù hợp học sinh tự luyện tập tính nhẩm tại nhà hoặc giáo viên minh họa trên lớp.',
  keywords: [
    'bàn tính soroban',
    'soroban ảo',
    'soroban online',
    'bàn tính nhật bản',
    'luyện soroban',
    'abacus online',
    'virtual soroban',
    'bàn tính ảo',
  ],
  openGraph: {
    title: 'Bàn Tính Soroban Ảo - Luyện Tập Online',
    description: 'Bàn tính Soroban ảo miễn phí, kéo thả hạt trực quan.',
    url: 'https://sorokid.com/tool/ban-tinh-soroban',
    images: ['/og-soroban.png'],
    type: 'website',
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/ban-tinh-soroban',
  },
};

function generateJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Bàn Tính Soroban Ảo',
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'VND',
    },
    'description': 'Bàn tính Soroban ảo miễn phí để luyện tập tính nhẩm.',
    'featureList': [
      'Kéo thả hạt trực quan',
      'Hiển thị giá trị số thực',
      'Phù hợp học sinh mới',
      'Sử dụng trên mọi thiết bị',
      'Không cần cài đặt',
    ],
    'audience': {
      '@type': 'EducationalAudience',
      'educationalRole': ['teacher', 'student'],
    },
    'educationalUse': [
      'Minh họa trên lớp',
      'Luyện tập tại nhà',
      'Học Soroban cơ bản',
    ],
  };
}

export default function BanTinhSorobanLayout({ children }) {
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
