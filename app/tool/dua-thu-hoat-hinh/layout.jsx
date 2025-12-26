/**
 * 🦆 Đua Vịt Sông Nước - SEO Metadata
 */

export const metadata = {
  title: 'Đua Vịt Sông Nước - Game Đua Ngẫu Nhiên Cho Lớp Học',
  description: 'Trò chơi đua vịt hồi hộp cho lớp học. Nhập tên học sinh, xem cuộc đua sôi động trên sông. Game tương tác vui nhộn, phù hợp mọi cấp học. Miễn phí, không cần đăng nhập.',
  keywords: [
    'game đua vịt',
    'trò chơi lớp học',
    'đua ngẫu nhiên',
    'game học tập',
    'hoạt động vui lớp học',
    'trò chơi cho giáo viên',
    'game tương tác',
    'hoạt động khởi động',
  ],
  openGraph: {
    title: 'Đua Vịt Sông Nước - Game Đua Ngẫu Nhiên',
    description: 'Trò chơi đua vịt hồi hộp, vui nhộn cho lớp học. Nhập tên và bắt đầu cuộc đua!',
    url: 'https://sorokid.com/tool/dua-thu-hoat-hinh',
    images: ['/og-dua-vit.png'],
    type: 'website',
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/dua-thu-hoat-hinh',
  },
};

function generateJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Đua Vịt Sông Nước',
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'VND',
    },
    'description': 'Trò chơi đua vịt hồi hộp cho lớp học. Nhập tên học sinh, xem cuộc đua sôi động.',
    'featureList': [
      'Nhập danh sách tên học sinh',
      'Cuộc đua ngẫu nhiên hồi hộp',
      'Nhiều loài vật: vịt, rùa, cua, cá',
      'Hiệu ứng sinh động',
      'Chế độ toàn màn hình',
      'Bình luận vui nhộn',
    ],
    'audience': {
      '@type': 'EducationalAudience',
      'educationalRole': 'teacher',
    },
    'educationalUse': [
      'Khởi động tiết học',
      'Thưởng điểm cuối tuần',
      'Tạo không khí vui vẻ',
      'Giảm căng thẳng sau kiểm tra',
    ],
  };
}

export default function DuaVitLayout({ children }) {
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
