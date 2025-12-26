/**
 * 🎯 TOOLBOX LAYOUT
 * 
 * Layout cho tất cả trang tool với SEO metadata
 * Tối ưu cho: Google, Bing, AI Search
 */

export const metadata = {
  title: {
    default: 'Toolbox Giáo Viên - Công Cụ Dạy Học Tích Cực Miễn Phí',
    template: '%s | Toolbox Giáo Viên - Sorokid',
  },
  description: 'Bộ công cụ dạy học tích cực miễn phí cho giáo viên các cấp. Quay số, chia nhóm, bấm giờ, trò chơi học tập. Không cần đăng nhập, sử dụng ngay trên máy chiếu lớp học.',
  keywords: [
    'công cụ dạy học tích cực',
    'toolbox giáo viên',
    'trò chơi học tập',
    'hoạt động lớp học',
    'quay số ngẫu nhiên',
    'chia nhóm học sinh',
    'đồng hồ bấm giờ lớp học',
    'game tương tác lớp học',
    'công cụ cho giáo viên THPT',
    'hoạt động khởi động tiết học',
  ],
  authors: [{ name: 'Sorokid Team', url: 'https://sorokid.com' }],
  creator: 'Sorokid',
  publisher: 'Sorokid',
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
  openGraph: {
    title: 'Toolbox Giáo Viên - Công Cụ Dạy Học Tích Cực Miễn Phí',
    description: 'Bộ công cụ miễn phí giúp giáo viên tổ chức hoạt động học tập vui nhộn. Quay số, chia nhóm, bấm giờ, game tương tác.',
    url: 'https://sorokid.com/tool',
    siteName: 'Sorokid',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/og-toolbox.png',
        width: 1200,
        height: 630,
        alt: 'Toolbox Giáo Viên - Công cụ dạy học tích cực miễn phí',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toolbox Giáo Viên - Công Cụ Dạy Học Tích Cực Miễn Phí',
    description: 'Bộ công cụ dạy học tích cực miễn phí cho giáo viên các cấp. Quay số, chia nhóm, bấm giờ, trò chơi học tập.',
    images: ['/og-toolbox.png'],
    creator: '@sorokid',
  },
  alternates: {
    canonical: 'https://sorokid.com/tool',
  },
  category: 'education',
  classification: 'Educational Tools',
};

// JSON-LD Structured Data cho Tool pages
export function generateToolboxJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // WebApplication Schema
      {
        '@type': 'WebApplication',
        '@id': 'https://sorokid.com/tool#webapp',
        'name': 'Toolbox Giáo Viên',
        'url': 'https://sorokid.com/tool',
        'applicationCategory': 'EducationalApplication',
        'operatingSystem': 'Web Browser',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'VND',
          'availability': 'https://schema.org/InStock',
        },
        'audience': {
          '@type': 'EducationalAudience',
          'educationalRole': 'teacher',
          'audienceType': 'Giáo viên các cấp',
        },
        'description': 'Bộ công cụ miễn phí giúp giáo viên tổ chức hoạt động học tập vui nhộn. Quay số, chia nhóm, bấm giờ, game tương tác.',
        'featureList': [
          'Quay số ngẫu nhiên gọi học sinh',
          'Chia nhóm học tập nhanh',
          'Đồng hồ bấm giờ cho lớp học',
          'Trò chơi học tập tương tác',
          'Bốc thăm ngẫu nhiên',
          'Đèn may mắn vui nhộn',
        ],
        'screenshot': 'https://sorokid.com/og-toolbox.png',
        'softwareHelp': {
          '@type': 'CreativeWork',
          'name': 'Hướng dẫn sử dụng Toolbox Giáo Viên',
          'url': 'https://sorokid.com/blog/huong-dan-toolbox',
        },
      },
      // ItemList Schema cho các tool
      {
        '@type': 'ItemList',
        '@id': 'https://sorokid.com/tool#tools',
        'name': 'Danh sách công cụ dạy học',
        'description': 'Các công cụ dạy học tích cực miễn phí cho giáo viên',
        'numberOfItems': 8,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Chiếc Nón Kỳ Diệu',
            'description': 'Quay số ngẫu nhiên để gọi học sinh',
            'url': 'https://sorokid.com/tool/chiec-non-ky-dieu',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Đua Vịt Sông Nước',
            'description': 'Trò chơi đua vịt hồi hộp cho lớp học',
            'url': 'https://sorokid.com/tool/dua-thu-hoat-hinh',
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': 'Flash ZAN',
            'description': 'Luyện tính nhẩm nhanh với flash số',
            'url': 'https://sorokid.com/tool/flash-zan',
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': 'Đồng Hồ Bấm Giờ',
            'description': 'Timer đếm ngược cho lớp học',
            'url': 'https://sorokid.com/tool/dong-ho-bam-gio',
          },
          {
            '@type': 'ListItem',
            'position': 5,
            'name': 'Chia Nhóm',
            'description': 'Chia nhóm học sinh ngẫu nhiên',
            'url': 'https://sorokid.com/tool/chia-nhom',
          },
          {
            '@type': 'ListItem',
            'position': 6,
            'name': 'Bốc Thăm',
            'description': 'Bốc thăm ngẫu nhiên với hiệu ứng slot',
            'url': 'https://sorokid.com/tool/boc-tham',
          },
          {
            '@type': 'ListItem',
            'position': 7,
            'name': 'Bàn Tính Soroban',
            'description': 'Bàn tính ảo để luyện tập',
            'url': 'https://sorokid.com/tool/ban-tinh-soroban',
          },
          {
            '@type': 'ListItem',
            'position': 8,
            'name': 'Đèn May Mắn',
            'description': 'Trò chơi đèn giao thông may mắn',
            'url': 'https://sorokid.com/tool/den-may-man',
          },
        ],
      },
      // FAQPage Schema
      {
        '@type': 'FAQPage',
        '@id': 'https://sorokid.com/tool#faq',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Toolbox giáo viên miễn phí có những công cụ gì?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Toolbox Giáo Viên của Sorokid có 8 công cụ miễn phí: Chiếc Nón Kỳ Diệu (quay số), Đua Thú (game đua), Flash ZAN (tính nhẩm), Đồng Hồ Bấm Giờ (timer), Chia Nhóm (tạo nhóm), Bốc Thăm (random picker), Bàn Tính Soroban (bàn tính ảo), và Đèn May Mắn (trò chơi xanh đỏ). Tất cả đều miễn phí và không cần đăng ký.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Công cụ nào phù hợp để quản lý lớp THPT?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Với lớp THPT, các công cụ phù hợp nhất là: Đồng Hồ Bấm Giờ để kiểm soát thời gian thuyết trình, Chia Nhóm để tạo nhóm thảo luận nhanh, Chiếc Nón Kỳ Diệu để gọi học sinh ngẫu nhiên tránh thiên vị, và Bốc Thăm để random thứ tự trình bày. Các công cụ này giúp tăng tương tác và giữ sự công bằng trong lớp học.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Có cần cài đặt phần mềm để sử dụng không?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Không cần cài đặt! Toolbox Giáo Viên chạy hoàn toàn trên trình duyệt web. Bạn chỉ cần truy cập sorokid.com/tool là có thể sử dụng ngay. Hoạt động tốt trên máy tính, laptop, tablet và điện thoại. Khuyến nghị sử dụng Chrome, Firefox hoặc Edge để có trải nghiệm tốt nhất.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Làm sao để tạo trò chơi học tập cho học sinh?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Bạn có thể tạo trò chơi học tập bằng cách: 1) Sử dụng Đua Thú Hoạt Hình để tạo cuộc đua giữa các nhóm, 2) Dùng Đèn May Mắn cho trò chơi phản xạ, 3) Kết hợp Chiếc Nón Kỳ Diệu với câu hỏi để tạo game hỏi đáp, 4) Sử dụng Flash ZAN để tổ chức thi tính nhẩm. Mỗi công cụ có hướng dẫn chi tiết trên trang.',
            },
          },
        ],
      },
      // Organization Schema
      {
        '@type': 'Organization',
        '@id': 'https://sorokid.com#organization',
        'name': 'Sorokid',
        'url': 'https://sorokid.com',
        'logo': 'https://sorokid.com/logo.png',
        'description': 'Nền tảng học tập và công cụ dạy học cho giáo viên Việt Nam',
        'sameAs': [
          'https://facebook.com/sorokid',
          'https://youtube.com/sorokid',
        ],
      },
    ],
  };
}

export default function ToolLayout({ children }) {
  const jsonLd = generateToolboxJsonLd();
  
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
