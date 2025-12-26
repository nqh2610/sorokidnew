/**
 * 🚦 Đèn May Mắn - SEO Metadata
 */

export const metadata = {
  title: 'Đèn May Mắn - Trò Chơi Xanh Đỏ Cho Lớp Học',
  description: 'Trò chơi đèn giao thông may mắn: Xanh = Thoát, Đỏ = Bị phạt! Tạo không khí hồi hộp, vui nhộn cho các hoạt động lớp học. Miễn phí.',
  keywords: [
    'đèn may mắn',
    'trò chơi xanh đỏ',
    'game lớp học',
    'đèn giao thông',
    'trò chơi may rủi',
    'traffic light game',
    'lucky light',
    'classroom game',
  ],
  openGraph: {
    title: 'Đèn May Mắn - Trò Chơi Hồi Hộp',
    description: 'Trò chơi đèn giao thông: Xanh = Thoát, Đỏ = Bị phạt! Vui nhộn cho lớp học.',
    url: 'https://sorokid.com/tool/den-may-man',
    images: ['/og-den-may-man.png'],
    type: 'website',
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/den-may-man',
  },
};

function generateJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Đèn May Mắn',
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'VND',
    },
    'description': 'Trò chơi đèn giao thông may mắn tạo không khí hồi hộp, vui nhộn cho lớp học.',
    'featureList': [
      'Đèn xanh, vàng, đỏ ngẫu nhiên',
      'Tùy chỉnh tỉ lệ xác suất',
      'Hiệu ứng đẹp mắt',
      'Âm thanh hồi hộp',
      'Chế độ 2 hoặc 3 đèn',
    ],
    'audience': {
      '@type': 'EducationalAudience',
      'educationalRole': 'teacher',
    },
    'educationalUse': [
      'Hoạt động khởi động',
      'Thưởng phạt vui trong ôn tập',
      'Giảm căng thẳng lớp học',
      'Tạo tiếng cười',
    ],
  };
}

export default function DenMayManLayout({ children }) {
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
