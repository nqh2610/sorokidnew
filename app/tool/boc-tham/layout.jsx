/**
 * 🎫 Bốc Thăm - SEO Metadata
 */

export const metadata = {
  title: 'Bốc Thăm Ngẫu Nhiên - Random Picker Cho Lớp Học',
  description: 'Công cụ bốc thăm ngẫu nhiên với hiệu ứng slot machine hồi hộp. Bốc tên học sinh, câu hỏi, quà tặng, chủ đề thuyết trình. Miễn phí cho giáo viên.',
  keywords: [
    'bốc thăm ngẫu nhiên',
    'random picker',
    'chọn tên ngẫu nhiên',
    'slot machine',
    'rút thăm',
    'name picker',
    'random selector',
    'lucky draw',
  ],
  openGraph: {
    title: 'Bốc Thăm Ngẫu Nhiên - Random Picker',
    description: 'Bốc thăm với hiệu ứng slot machine hồi hộp. Bốc tên, câu hỏi, quà tặng.',
    url: 'https://sorokid.com/tool/boc-tham',
    images: ['/og-boc-tham.png'],
    type: 'website',
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/boc-tham',
  },
};

function generateJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Bốc Thăm Ngẫu Nhiên',
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'VND',
    },
    'description': 'Công cụ bốc thăm ngẫu nhiên với hiệu ứng slot machine hồi hộp.',
    'featureList': [
      'Hiệu ứng slot machine',
      'Âm thanh hồi hộp',
      'Nhập danh sách tùy ý',
      'Bốc nhiều lần',
      'Hiển thị kết quả đẹp mắt',
    ],
    'audience': {
      '@type': 'EducationalAudience',
      'educationalRole': 'teacher',
    },
    'educationalUse': [
      'Bốc tên học sinh trả lời',
      'Chọn câu hỏi ngẫu nhiên',
      'Bốc quà, phần thưởng',
      'Chọn chủ đề thuyết trình',
    ],
  };
}

export default function BocThamLayout({ children }) {
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
