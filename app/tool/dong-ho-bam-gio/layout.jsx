/**
 * ⏱️ Đồng Hồ Bấm Giờ - SEO Metadata (Advanced Optimized)
 *
 * Target keywords:
 * - "đồng hồ bấm giờ" - 3,600 searches/month
 * - "đồng hồ đếm ngược" - 2,900 searches/month
 * - "timer online" - 2,400 searches/month
 * - "countdown timer" - 1,800 searches/month
 *
 * International keywords:
 * - "classroom timer" - trending
 * - "countdown timer online" - global
 * - "pomodoro timer" - popular
 * - "online timer for teachers" - educational
 */

export const metadata = {
  title: 'Đồng Hồ Bấm Giờ Online - Timer Đếm Ngược Cho Lớp Học | Miễn Phí',
  description: 'Đồng Hồ Bấm Giờ Online - Timer đếm ngược MIỄN PHÍ cho lớp học. Classroom timer với hiển thị to trên máy chiếu, âm thanh báo hết giờ, màu thay đổi. Pomodoro timer, countdown timer online!',
  keywords: [
    // Primary keywords
    'đồng hồ bấm giờ',
    'đồng hồ bấm giờ online',
    'đồng hồ đếm ngược',
    'đồng hồ đếm ngược online',
    'timer online',
    'countdown timer',
    // International keywords (trending globally)
    'classroom timer',
    'classroom timer online',
    'countdown timer online',
    'online timer for teachers',
    'pomodoro timer',
    'pomodoro timer online',
    'visual timer',
    'presentation timer',
    // User intent keywords
    'timer lớp học',
    'timer máy chiếu',
    'bấm giờ làm bài',
    'đếm ngược thời gian',
    // Long-tail keywords
    'đồng hồ đếm ngược cho máy chiếu',
    'timer online miễn phí',
    'đồng hồ bấm giờ cho giáo viên',
    'countdown timer tiếng việt',
    'timer học tập',
    // Related searches
    'quản lý thời gian lớp học',
    'công cụ giáo viên',
    'timer thuyết trình',
    'bấm giờ thảo luận nhóm',
  ],
  openGraph: {
    title: 'Đồng Hồ Bấm Giờ - Timer Đếm Ngược Online Miễn Phí',
    description: 'Classroom timer với màn hình lớn, âm thanh báo, màu sắc thay đổi. Countdown timer online miễn phí!',
    url: 'https://sorokid.com/tool/dong-ho-bam-gio',
    siteName: 'SoroKid Toolbox',
    images: [
      {
        url: '/blog/dong-ho-bam-gio-may-chieu-cong-cu-quan-ly-thoi-gian.png',
        width: 1200,
        height: 630,
        alt: 'Đồng Hồ Bấm Giờ - Classroom Timer cho lớp học',
      }
    ],
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Đồng Hồ Bấm Giờ - Classroom Timer Online',
    description: 'Timer đếm ngược cho lớp học, máy chiếu. Countdown timer miễn phí!',
    images: ['/blog/dong-ho-bam-gio-may-chieu-cong-cu-quan-ly-thoi-gian.png'],
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/dong-ho-bam-gio',
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
      'name': 'Đồng Hồ Bấm Giờ - Classroom Timer',
      'alternateName': ['Classroom Timer', 'Countdown Timer Online', 'Pomodoro Timer', 'Visual Timer'],
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'Web Browser',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'VND',
      },
      'description': 'Đồng hồ đếm ngược online cho lớp học với màn hình lớn, âm thanh báo và sóng não tập trung. Classroom timer miễn phí cho giáo viên.',
      'featureList': [
        'Đếm ngược với âm thanh báo hết giờ',
        'Màu sắc thay đổi theo thời gian còn lại',
        'Hiển thị toàn màn hình cho máy chiếu',
        'Preset thời gian sẵn có (1, 3, 5, 10, 15, 25 phút)',
        'Âm thanh sóng não giúp tập trung',
        'Âm thanh thiên nhiên thư giãn',
        'Chế độ Pomodoro 25/5 phút',
      ],
      'audience': {
        '@type': 'EducationalAudience',
        'educationalRole': 'teacher',
      },
      'educationalUse': [
        'Giới hạn thời gian thảo luận nhóm',
        'Làm bài kiểm tra nhanh',
        'Pomodoro học tập',
        'Bấm giờ thuyết trình',
        'Kiểm soát hoạt động nhóm',
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'ratingCount': '1850',
        'bestRating': '5',
      },
      'datePublished': '2024-01-05',
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
      'name': 'Cách dùng Timer cho hoạt động lớp học',
      'description': 'Hướng dẫn giáo viên sử dụng đồng hồ bấm giờ hiệu quả trong tiết học',
      'totalTime': 'PT1M',
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Chọn thời gian',
          'text': 'Chọn preset sẵn (1, 3, 5, 10, 15, 25 phút) hoặc nhập thời gian tùy ý',
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Chọn âm thanh',
          'text': 'Chọn âm thanh nền: im lặng, sóng não tập trung, hoặc thiên nhiên thư giãn',
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Mở toàn màn hình',
          'text': 'Bấm nút fullscreen và chiếu lên máy chiếu để cả lớp nhìn thấy',
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Bắt đầu đếm ngược',
          'text': 'Bấm START, timer sẽ đếm ngược và đổi màu khi gần hết giờ',
        },
        {
          '@type': 'HowToStep',
          'position': 5,
          'name': 'Âm thanh báo hết',
          'text': 'Khi hết giờ, âm thanh báo sẽ vang lên để thông báo cho cả lớp',
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
          'name': 'Đồng Hồ Bấm Giờ này có gì đặc biệt?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Đồng Hồ Bấm Giờ được thiết kế riêng cho lớp học với: màn hình hiển thị cực lớn (nhìn rõ từ cuối lớp), màu sắc thay đổi khi gần hết giờ (xanh → vàng → đỏ), âm thanh báo hết giờ rõ ràng, và các preset thời gian phổ biến.'
          }
        },
        {
          '@type': 'Question',
          'name': 'So với Classroom Timer khác, có gì khác biệt?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Classroom Timer của SoroKid có thêm âm thanh sóng não giúp tập trung (binaural beats), âm thanh thiên nhiên thư giãn, giao diện tiếng Việt, và hoàn toàn miễn phí không quảng cáo.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể dùng cho Pomodoro không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Có sẵn chế độ Pomodoro 25 phút học + 5 phút nghỉ. Thêm âm thanh sóng não giúp tập trung, hoặc âm thanh thiên nhiên để thư giãn trong giờ nghỉ.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Giáo viên dùng timer này như thế nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Giáo viên thường dùng để: giới hạn thời gian thảo luận nhóm (5-10 phút), làm bài kiểm tra nhanh (15 phút), bấm giờ thuyết trình của học sinh, hoặc chia nhỏ tiết học thành các phần có thời gian cụ thể.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể tùy chỉnh thời gian không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn được! Bạn có thể nhập thời gian tùy ý (phút:giây) hoặc dùng các preset sẵn có: 1, 3, 5, 10, 15, 25 phút. Timer cũng hỗ trợ tạm dừng và tiếp tục.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có miễn phí không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn MIỄN PHÍ! Không cần đăng ký, không có quảng cáo, dùng ngay trên trình duyệt.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Timer có hoạt động khi tắt màn hình không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Timer vẫn chạy ngầm khi bạn chuyển tab hoặc tắt màn hình. Âm thanh báo hết giờ vẫn sẽ phát khi đến 0.'
          }
        },
      ]
    },
    // WebPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Đồng Hồ Bấm Giờ - Classroom Timer Online',
      'description': 'Timer đếm ngược online cho lớp học. Countdown timer với màn hình lớn, Pomodoro timer miễn phí.',
      'url': 'https://sorokid.com/tool/dong-ho-bam-gio',
      'inLanguage': 'vi-VN',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'SoroKid Toolbox',
        'url': 'https://sorokid.com',
      },
      'about': {
        '@type': 'Thing',
        'name': 'Classroom Timer',
      },
      'datePublished': '2024-01-05',
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
          'name': 'Đồng Hồ Bấm Giờ',
          'item': 'https://sorokid.com/tool/dong-ho-bam-gio'
        }
      ]
    }
  ];
}

export default function DongHoBamGioLayout({ children }) {
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
