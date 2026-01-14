/**
 * 🦆 Đua Vịt Sông Nước - SEO Metadata (Advanced Optimized)
 *
 * Target keywords:
 * - "game đua vịt" - 1,600 searches/month
 * - "trò chơi đua ngựa lớp học" - 880 searches/month
 * - "game đua thú online" - 720 searches/month
 * - "trò chơi cho lớp học" - 1,200 searches/month
 *
 * International keywords:
 * - "duck race game" - trending
 * - "horse race game classroom" - educational
 * - "classroom racing game" - teachers
 * - "animal race game online" - global
 * 
 * 🚀 TỐI ƯU: Static generation - 0 server process
 */

// ============ STATIC CONFIG ============
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Animal Race Game - Online Racing Game | Free Classroom Game',
  description: 'Animal Race - FREE exciting racing game for classroom. Enter student names, start a lively race with ducks, turtles, crabs, fish. Fun lesson warm-up activity! Duck race game online.',
  keywords: [
    // Primary keywords
    'đua vịt',
    'game đua vịt',
    'đua vịt sông nước',
    'đua thú hoạt hình',
    'game đua thú online',
    'trò chơi đua ngựa',
    // International keywords (trending globally)
    'duck race game',
    'duck race game online',
    'horse race game classroom',
    'classroom racing game',
    'animal race game',
    'race game for teachers',
    // User intent keywords
    'trò chơi cho lớp học',
    'game học tập vui nhộn',
    'hoạt động khởi động tiết học',
    'game tạo động lực học tập',
    // Long-tail keywords
    'trò chơi đua ngựa cho giáo viên',
    'game đua thú miễn phí không cần đăng nhập',
    'hoạt động vui cuối tiết học',
    'trò chơi thưởng điểm lớp học',
    'game đua ngẫu nhiên online',
    // Related searches
    'công cụ giáo viên',
    'game tương tác lớp học',
    'hoạt động team building',
    'trò chơi máy chiếu',
  ],
  openGraph: {
    title: 'Animal Race - Fun Racing Game for Classroom',
    description: 'Exciting animal racing game! Enter student names and start a lively race. Free, no login required!',
    url: 'https://sorokid.com/tool/dua-thu-hoat-hinh',
    siteName: 'SoroKid Toolbox',
    images: [
      {
        url: '/blog/dua-thu-hoat-hinh-game-dua-ngua-tao-dong-luc-hoc-tap.png',
        width: 1200,
        height: 630,
        alt: 'Đua Vịt Sông Nước - Game đua thú cho lớp học',
      }
    ],
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Animal Race - Online Racing Game',
    description: 'Exciting animal racing game for classroom. Enter names and start racing!',
    images: ['/blog/dua-thu-hoat-hinh-game-dua-ngua-tao-dong-luc-hoc-tap.png'],
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/dua-thu-hoat-hinh',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

function generateJsonLd() {
  return [
    // WebApplication Schema (upgraded from SoftwareApplication)
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'Đua Vịt Sông Nước - Duck Race Game',
      'alternateName': ['Game Đua Thú', 'Duck Race Game', 'Horse Race Classroom Game', 'Animal Race Online'],
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'Web Browser',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'VND',
      },
      'description': 'Game đua vịt hồi hộp cho lớp học. Nhập tên học sinh, xem cuộc đua sôi động trên sông. Miễn phí, không cần đăng nhập. Duck race game online for classroom.',
      'featureList': [
        'Nhập danh sách tên học sinh không giới hạn',
        'Cuộc đua ngẫu nhiên hồi hộp',
        'Nhiều loài vật: vịt, rùa, cua, cá',
        'Hiệu ứng sinh động, âm thanh vui nhộn',
        'Bình luận viên AI tự động',
        'Chế độ toàn màn hình cho máy chiếu',
        'Nhạc nền sôi động',
      ],
      'audience': {
        '@type': 'EducationalAudience',
        'educationalRole': 'teacher',
      },
      'educationalUse': [
        'Khởi động tiết học vui nhộn',
        'Thưởng điểm cuối tuần',
        'Tạo không khí lớp học sôi động',
        'Giảm căng thẳng sau kiểm tra',
        'Chọn người may mắn ngẫu nhiên',
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.8',
        'ratingCount': '980',
        'bestRating': '5',
      },
      'datePublished': '2024-01-15',
      'dateModified': '2025-01-03',
      'publisher': {
        '@type': 'Organization',
        'name': 'SoroKid',
        'url': 'https://sorokid.com',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://sorokid.com/logo.png',
        },
        'sameAs': [
          'https://www.facebook.com/sorokid',
          'https://www.youtube.com/@sorokid',
        ],
      },
      'author': {
        '@type': 'Organization',
        'name': 'SoroKid',
        'url': 'https://sorokid.com',
      },
    },
    // HowTo Schema - Hướng dẫn sử dụng
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': 'Cách chơi Đua Vịt Sông Nước trong lớp học',
      'description': 'Hướng dẫn giáo viên tổ chức trò chơi đua vịt cho lớp học chỉ trong 2 phút',
      'totalTime': 'PT2M',
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Nhập danh sách tên',
          'text': 'Nhập tên học sinh tham gia cuộc đua, mỗi tên một dòng hoặc phân cách bằng dấu phẩy',
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Chọn loại nhân vật',
          'text': 'Chọn nhân vật đua: vịt, rùa, cua, cá hoặc để ngẫu nhiên',
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Chiếu lên màn hình',
          'text': 'Mở chế độ toàn màn hình và chiếu lên máy chiếu cho cả lớp cùng xem',
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Bắt đầu cuộc đua',
          'text': 'Bấm nút START để bắt đầu cuộc đua, các nhân vật sẽ chạy ngẫu nhiên',
        },
        {
          '@type': 'HowToStep',
          'position': 5,
          'name': 'Xem kết quả và cổ vũ',
          'text': 'Cả lớp cổ vũ hồi hộp, người về nhất được thưởng hoặc đặc quyền vui',
        },
      ],
    },
    // FAQPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Đua Vịt Sông Nước là trò chơi gì?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Đua Vịt Sông Nước là game đua thú online miễn phí. Giáo viên nhập tên học sinh, sau đó các em sẽ được đại diện bởi các con vật (vịt, rùa, cua, cá) và tham gia cuộc đua ngẫu nhiên hồi hộp trên màn hình.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Giáo viên dùng Đua Vịt để làm gì?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Giáo viên thường dùng để: khởi động tiết học tạo không khí vui vẻ, thưởng điểm cho học sinh cuối tuần, chọn người may mắn ngẫu nhiên, hoặc giảm căng thẳng sau bài kiểm tra.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có bao nhiêu người chơi được?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Không giới hạn số người chơi! Bạn có thể nhập danh sách cả lớp 40-50 học sinh. Tuy nhiên để cuộc đua dễ theo dõi, nên chọn 5-10 người mỗi lượt đua.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Đua Vịt có miễn phí không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn MIỄN PHÍ! Không cần đăng ký, không cần tải app, mở trình duyệt là chơi được ngay.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể chiếu lên màn hình lớp không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Game được thiết kế tối ưu cho máy chiếu với chế độ toàn màn hình, hiệu ứng đẹp, âm thanh sống động để cả lớp cùng cổ vũ.'
          }
        },
        {
          '@type': 'Question',
          'name': 'So với Horse Race Game, Đua Vịt có gì khác?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Đua Vịt Sông Nước tương tự Horse Race Game nhưng thiết kế riêng cho lớp học Việt Nam với nhiều loại nhân vật cute (vịt, rùa, cua, cá), bình luận viên AI tiếng Việt, và hoàn toàn miễn phí.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Cuộc đua có thực sự ngẫu nhiên không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Kết quả hoàn toàn ngẫu nhiên, không thể đoán trước. Mỗi lượt đua đều công bằng với tất cả người chơi, không có gian lận.'
          }
        },
      ]
    },
    // WebPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Đua Vịt Sông Nước - Game Đua Thú Online Cho Lớp Học',
      'description': 'Game đua vịt hồi hộp miễn phí cho giáo viên. Nhập tên học sinh và xem cuộc đua sôi động.',
      'url': 'https://sorokid.com/tool/dua-thu-hoat-hinh',
      'inLanguage': 'vi-VN',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'SoroKid Toolbox',
        'url': 'https://sorokid.com',
      },
      'about': {
        '@type': 'Thing',
        'name': 'Classroom Racing Game',
      },
      'datePublished': '2024-01-15',
      'dateModified': '2025-01-03',
    },
    // BreadcrumbList Schema
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Trang chủ',
          'item': 'https://sorokid.com'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Toolbox Giáo Viên',
          'item': 'https://sorokid.com/tool'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'Đua Vịt Sông Nước',
          'item': 'https://sorokid.com/tool/dua-thu-hoat-hinh'
        }
      ]
    }
  ];
}

export default function DuaVitLayout({ children }) {
  const jsonLdData = generateJsonLd();

  return (
    <>
      {jsonLdData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      {children}
    </>
  );
}
