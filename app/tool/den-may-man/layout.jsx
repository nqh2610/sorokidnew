/**
 * 🚦 Đèn May Mắn - SEO Metadata (Advanced Optimized)
 *
 * Target keywords:
 * - "đèn may mắn" - 1,200 searches/month
 * - "trò chơi đèn xanh đèn đỏ" - 880 searches/month
 * - "game may rủi" - 720 searches/month
 * - "ice breaker game" - 590 searches/month
 *
 * International keywords:
 * - "traffic light game" - trending
 * - "red light green light game" - popular
 * - "ice breaker games for classroom" - educational
 * - "lucky game online" - global
 * 
 * 🚀 TỐI ƯU: Static generation - 0 server process
 */

// ============ STATIC CONFIG ============
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Đèn May Mắn Online - Traffic Light Game | Ice Breaker Lớp Học Miễn Phí',
  description: 'Đèn May Mắn - Trò chơi đèn xanh đỏ MIỄN PHÍ cho lớp học. Traffic light game - Xanh = An toàn, Vàng = Thử thách, Đỏ = Bị phạt vui! Ice breaker game cho classroom!',
  keywords: [
    // Primary keywords
    'đèn may mắn',
    'đèn may mắn online',
    'trò chơi đèn xanh đèn đỏ',
    'trò chơi xanh đỏ',
    'game đèn giao thông',
    // International keywords (trending globally)
    'traffic light game',
    'traffic light game online',
    'red light green light game',
    'ice breaker game',
    'ice breaker games for classroom',
    'lucky game online',
    'classroom ice breaker',
    // User intent keywords
    'trò chơi may rủi',
    'game may mắn online',
    'ice breaker lớp học',
    'trò chơi phá băng',
    // Long-tail keywords
    'trò chơi đèn may mắn cho lớp học',
    'game thưởng phạt vui nhộn',
    'trò chơi khởi động tiết học',
    'game tạo tiếng cười lớp học',
    'lucky light game',
    // Related searches
    'hoạt động đầu giờ',
    'trò chơi giảm căng thẳng',
    'game vui lớp học',
    'công cụ giáo viên',
  ],
  openGraph: {
    title: 'Đèn May Mắn - Traffic Light Game Cho Lớp Học',
    description: 'Traffic light game - Xanh = Thoát, Đỏ = Phạt vui! Ice breaker game tạo tiếng cười. Miễn phí!',
    url: 'https://sorokid.com/tool/den-may-man',
    siteName: 'SoroKid Toolbox',
    images: [
      {
        url: '/blog/den-may-man-cuoi-tiet-game-thuong-phat-hoc-sinh-thich.png',
        width: 1200,
        height: 630,
        alt: 'Đèn May Mắn - Traffic Light Game cho lớp học',
      }
    ],
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Đèn May Mắn - Traffic Light Game Online',
    description: 'Ice breaker game - đèn may mắn: Xanh thoát, Đỏ phạt vui! Miễn phí!',
    images: ['/blog/den-may-man-cuoi-tiet-game-thuong-phat-hoc-sinh-thich.png'],
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/den-may-man',
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
    // WebApplication Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'Đèn May Mắn - Traffic Light Game',
      'alternateName': ['Traffic Light Game', 'Red Light Green Light', 'Ice Breaker Game', 'Lucky Light'],
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'Web Browser',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'VND',
      },
      'description': 'Trò chơi đèn giao thông may mắn tạo không khí hồi hộp, vui nhộn cho lớp học. Traffic light game - Xanh = An toàn, Vàng = Thử thách, Đỏ = Phạt vui. Ice breaker cho classroom.',
      'featureList': [
        'Đèn xanh, vàng, đỏ ngẫu nhiên',
        'Tùy chỉnh tỉ lệ xác suất mỗi đèn',
        'Hiệu ứng đèn đẹp mắt',
        'Âm thanh hồi hộp như game show',
        'Chế độ 2 đèn (xanh/đỏ) hoặc 3 đèn',
        'Chế độ toàn màn hình',
      ],
      'audience': {
        '@type': 'EducationalAudience',
        'educationalRole': 'teacher',
      },
      'educationalUse': [
        'Ice breaker đầu tiết học',
        'Thưởng phạt vui trong ôn tập',
        'Giảm căng thẳng sau kiểm tra',
        'Tạo tiếng cười cho lớp học',
        'Hoạt động cuối tiết',
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.8',
        'ratingCount': '1180',
        'bestRating': '5',
      },
      'datePublished': '2024-02-15',
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
    // HowTo Schema
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': 'Cách chơi Đèn May Mắn trong lớp học',
      'description': 'Hướng dẫn sử dụng traffic light game làm ice breaker cho lớp học',
      'totalTime': 'PT2M',
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Thiết lập xác suất',
          'text': 'Tùy chọn tỉ lệ xác suất xanh/vàng/đỏ theo ý muốn (VD: 40/30/30)',
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Gọi học sinh lên',
          'text': 'Gọi học sinh lên bảng hoặc cho học sinh bấm nút trên máy chiếu',
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Bấm nút chơi',
          'text': 'Học sinh bấm nút, đèn sẽ chạy qua các màu và dừng ngẫu nhiên',
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Thực hiện theo màu đèn',
          'text': 'Xanh = An toàn, Vàng = Thử thách (trả lời câu hỏi), Đỏ = Phạt vui (hát, nhảy...)',
        },
        {
          '@type': 'HowToStep',
          'position': 5,
          'name': 'Tiếp tục với học sinh khác',
          'text': 'Gọi học sinh tiếp theo lên chơi để tạo không khí sôi động',
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
          'name': 'Đèn May Mắn chơi như thế nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Rất đơn giản: học sinh bấm nút, đèn sẽ chạy qua các màu và dừng ngẫu nhiên. Xanh = An toàn (được thưởng), Vàng = Thử thách (trả lời câu hỏi), Đỏ = Phạt vui (hát, nhảy, hoặc nhiệm vụ vui).'
          }
        },
        {
          '@type': 'Question',
          'name': 'Traffic Light Game khác gì Red Light Green Light?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Traffic Light Game của SoroKid là phiên bản đèn may mắn cho lớp học, khác với Red Light Green Light (trò chơi trong Squid Game). Đây là game thưởng/phạt vui nhộn dùng làm ice breaker cho classroom.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Giáo viên dùng Đèn May Mắn khi nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Phù hợp nhất: ice breaker đầu tiết, thưởng phạt trong tiết ôn tập, giảm căng thẳng sau kiểm tra, hoặc làm trò chơi cuối tiết. Tạo không khí vui vẻ, học sinh mong đợi được chơi.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể tùy chỉnh xác suất không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Bạn có thể điều chỉnh tỉ lệ ra mỗi màu. Ví dụ: muốn ít phạt thì giảm tỉ lệ đỏ, tăng tỉ lệ xanh. Hoặc đặt 50-50 cho kịch tính hơn.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Phạt vui là phạt gì?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Phạt vui là những nhiệm vụ nhẹ nhàng, tạo tiếng cười: hát một đoạn bài hát, nhảy điệu đơn giản, làm mặt hài hước, hoặc trả lời câu hỏi. Giáo viên tự quyết định hình phạt phù hợp với lớp.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Ice Breaker Game này có miễn phí không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn MIỄN PHÍ! Không cần đăng ký, không có quảng cáo, dùng ngay trên trình duyệt.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể dùng cho team building không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Rất phù hợp! Đèn May Mắn là ice breaker game tuyệt vời cho team building, workshop, hoặc bất kỳ hoạt động nhóm nào cần tạo không khí vui vẻ, phá băng.'
          }
        },
      ]
    },
    // WebPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Đèn May Mắn - Traffic Light Game | Ice Breaker for Classroom',
      'description': 'Traffic light game online - Ice breaker game cho lớp học. Đèn xanh đỏ may mắn tạo không khí vui vẻ.',
      'url': 'https://sorokid.com/tool/den-may-man',
      'inLanguage': 'vi-VN',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'SoroKid Toolbox',
        'url': 'https://sorokid.com',
      },
      'about': {
        '@type': 'Thing',
        'name': 'Traffic Light Game',
      },
      'datePublished': '2024-02-15',
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
          'name': 'Đèn May Mắn',
          'item': 'https://sorokid.com/tool/den-may-man'
        }
      ]
    }
  ];
}

export default function DenMayManLayout({ children }) {
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
