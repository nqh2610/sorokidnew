/**
 * 🔤 Trò Chơi Ô Chữ - SEO Metadata (Advanced Optimized)
 *
 * Target keywords:
 * - "trò chơi ô chữ" - 4,400 searches/month
 * - "ô chữ online" - 2,900 searches/month
 * - "crossword game" - 1,600 searches/month
 * - "tạo ô chữ" - 1,200 searches/month
 *
 * International keywords:
 * - "crossword maker" - super trending
 * - "crossword generator" - popular
 * - "crossword puzzle maker" - educational
 * - "create crossword online" - global
 * 
 * 🚀 TỐI ƯU: Static generation - 0 server process
 */

// ============ STATIC CONFIG ============
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Trò Chơi Ô Chữ Online - Crossword Maker | Tạo Crossword Miễn Phí',
  description: 'Trò Chơi Ô Chữ Online - Crossword maker MIỄN PHÍ cho lớp học. Crossword generator tự động sinh lưới từ câu hỏi, hiệu ứng lật ô hấp dẫn. Create crossword online trong 2 phút!',
  keywords: [
    // Primary keywords (high volume)
    'trò chơi ô chữ',
    'trò chơi ô chữ online',
    'ô chữ online',
    'ô chữ',
    'crossword',
    'crossword online',
    // International keywords (super trending)
    'crossword maker',
    'crossword maker online',
    'crossword generator',
    'crossword puzzle maker',
    'create crossword online',
    'crossword puzzle generator',
    'make crossword puzzle',
    // Creation keywords
    'tạo ô chữ',
    'tạo ô chữ online',
    'ô chữ tự tạo',
    // Educational keywords
    'ô chữ lớp học',
    'game học từ vựng',
    'trò chơi ôn bài',
    'crossword tiếng việt',
    'crossword giáo dục',
    // Long-tail keywords
    'trò chơi ô chữ cho giáo viên',
    'tạo ô chữ miễn phí',
    'ô chữ ôn từ vựng tiếng anh',
    'crossword game lớp học',
    'ô chữ kiến thức môn học',
    // Related searches
    'game ôn bài',
    'công cụ giáo viên',
    'trò chơi học tập',
  ],
  openGraph: {
    title: 'Trò Chơi Ô Chữ - Crossword Maker Online Miễn Phí',
    description: 'Crossword generator - Tự tạo ô chữ trong 2 phút! Tự động sinh lưới, hiệu ứng lật ô hấp dẫn. Miễn phí!',
    url: 'https://sorokid.com/tool/o-chu',
    siteName: 'SoroKid Toolbox',
    images: [
      {
        url: '/blog/tro-choi-o-chu-cong-cu-tao-crossword-cho-lop-hoc.png',
        width: 1200,
        height: 630,
        alt: 'Trò Chơi Ô Chữ - Crossword Maker',
      }
    ],
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trò Chơi Ô Chữ - Crossword Maker Online',
    description: 'Crossword generator - Tạo ô chữ cho lớp học trong 2 phút. Miễn phí!',
    images: ['/blog/tro-choi-o-chu-cong-cu-tao-crossword-cho-lop-hoc.png'],
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/o-chu',
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
      'name': 'Trò Chơi Ô Chữ - Crossword Maker',
      'alternateName': ['Crossword Maker', 'Crossword Generator', 'Crossword Puzzle Maker', 'Create Crossword Online'],
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'Web Browser',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'VND',
      },
      'description': 'Công cụ tạo trò chơi ô chữ cho lớp học. Crossword generator tự động sinh lưới từ câu hỏi, hiệu ứng lật ô hấp dẫn, tối ưu cho máy chiếu. Crossword maker miễn phí.',
      'featureList': [
        'Tự động sinh lưới ô chữ từ câu hỏi',
        'Hiệu ứng lật ô hấp dẫn',
        'Tối ưu hiển thị trên máy chiếu',
        'Tự nhập câu hỏi theo chủ đề',
        'Từ khóa chính hiển thị cuối',
        'Lưu bộ ô chữ để dùng lại',
        'Chế độ toàn màn hình',
      ],
      'audience': {
        '@type': 'EducationalAudience',
        'educationalRole': 'teacher',
      },
      'educationalUse': [
        'Ôn từ vựng Tiếng Anh',
        'Ôn kiến thức bất kỳ môn học',
        'Hoạt động cuối bài học',
        'Ôn tập trước kiểm tra',
        'Thi đua giữa các nhóm',
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.8',
        'ratingCount': '1560',
        'bestRating': '5',
      },
      'datePublished': '2024-02-05',
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
      'name': 'Cách tạo ô chữ cho lớp học',
      'description': 'Hướng dẫn sử dụng crossword maker để tạo ô chữ trong 2 phút',
      'totalTime': 'PT2M',
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Nhập câu hỏi và đáp án',
          'text': 'Nhập danh sách câu hỏi và đáp án (ví dụ: "Thủ đô Việt Nam?" - "HANOI")',
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Đặt từ khóa chính (tùy chọn)',
          'text': 'Nhập từ khóa chính sẽ chạy dọc/ngang, hiện ra khi giải xong tất cả câu',
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Bấm Tạo Ô Chữ',
          'text': 'Công cụ sẽ tự động xếp các từ thành lưới crossword đẹp mắt',
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Chiếu và chơi',
          'text': 'Mở toàn màn hình, chiếu lên máy chiếu. Học sinh trả lời từng câu, ô lật mở dần',
        },
        {
          '@type': 'HowToStep',
          'position': 5,
          'name': 'Khám phá từ khóa',
          'text': 'Khi tất cả ô được mở, từ khóa chính hiện ra như trò chơi ô chữ trên TV!',
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
          'name': 'Làm sao tạo ô chữ cho lớp học?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Rất đơn giản: (1) Nhập danh sách câu hỏi và đáp án (ví dụ: "Thủ đô Việt Nam?" - "HANOI"), (2) Bấm Tạo Ô Chữ, công cụ sẽ tự động xếp các từ thành lưới crossword, (3) Mở trên máy chiếu và bắt đầu chơi!'
          }
        },
        {
          '@type': 'Question',
          'name': 'Crossword Maker này khác gì tool khác?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Crossword Maker của SoroKid tự động sinh lưới đẹp từ câu hỏi (không cần tự xếp), có hiệu ứng lật ô hấp dẫn như game show, giao diện tiếng Việt, và hoàn toàn miễn phí không quảng cáo.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể dùng cho môn nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Bất kỳ môn nào! Tiếng Anh (ôn từ vựng), Tiếng Việt (thành ngữ, tục ngữ), Toán (thuật ngữ), Lý/Hóa (khái niệm), Sử/Địa (tên địa danh, nhân vật)... Chỉ cần câu hỏi và đáp án ngắn gọn.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Ô chữ có từ khóa chính không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Giống như ô chữ trên TV, bạn có thể đặt một từ khóa chính (keyword) chạy dọc hoặc ngang. Khi học sinh giải xong các câu hỏi, từ khóa sẽ hiện ra.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể lưu ô chữ để dùng lại không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Công cụ tự động lưu vào trình duyệt. Bạn cũng có thể lưu thành file để chia sẻ với giáo viên khác hoặc dùng cho nhiều lớp.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Crossword Generator có miễn phí không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn MIỄN PHÍ! Không giới hạn số ô chữ tạo, không cần đăng ký, không có quảng cáo.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể tạo crossword tiếng Việt không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Crossword Maker hỗ trợ đầy đủ tiếng Việt có dấu. Hoàn hảo cho các bài ô chữ về thành ngữ, tục ngữ, từ vựng tiếng Việt.'
          }
        },
      ]
    },
    // WebPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Trò Chơi Ô Chữ - Crossword Maker | Crossword Generator Online',
      'description': 'Crossword maker online miễn phí. Crossword generator tự động tạo lưới ô chữ cho lớp học.',
      'url': 'https://sorokid.com/tool/o-chu',
      'inLanguage': 'vi-VN',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'SoroKid Toolbox',
        'url': 'https://sorokid.com',
      },
      'about': {
        '@type': 'Thing',
        'name': 'Crossword Puzzle Maker',
      },
      'datePublished': '2024-02-05',
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
          'name': 'Trò Chơi Ô Chữ',
          'item': 'https://sorokid.com/tool/o-chu'
        }
      ]
    }
  ];
}

export default function OChuLayout({ children }) {
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
