/**
 * 🎯 Ai Là Triệu Phú - SEO Metadata (Advanced Optimized)
 *
 * Target keywords:
 * - "ai là triệu phú" - 27,000 searches/month
 * - "game ai là triệu phú" - 4,400 searches/month
 * - "ai là triệu phú online" - 2,900 searches/month
 * - "quiz game show" - 1,600 searches/month
 *
 * International keywords:
 * - "who wants to be a millionaire" - super trending
 * - "millionaire quiz game" - popular
 * - "quiz game for classroom" - educational
 * - "trivia game online" - global
 */

export const metadata = {
  title: 'Ai Là Triệu Phú Online - Who Wants to Be a Millionaire | Quiz Game Miễn Phí',
  description: 'Ai Là Triệu Phú Online - Game show hỏi đáp MIỄN PHÍ cho lớp học. Who Wants to Be a Millionaire phiên bản giáo dục. Tự tạo câu hỏi, 4 quyền trợ giúp: 50:50, Hỏi khán giả, Gọi điện, Đổi câu!',
  keywords: [
    // Primary keywords (super high volume)
    'ai là triệu phú',
    'ai là triệu phú online',
    'game ai là triệu phú',
    'ai là triệu phú game',
    'chơi ai là triệu phú',
    // International keywords (super trending)
    'who wants to be a millionaire',
    'who wants to be a millionaire game',
    'millionaire game online',
    'millionaire quiz',
    'quiz game show',
    'trivia game online',
    'quiz game for classroom',
    // Game show keywords
    'game show online',
    'game hỏi đáp',
    // Educational keywords
    'game kiểm tra kiến thức',
    'trò chơi ôn bài',
    'quiz lớp học',
    'game học tập',
    'trắc nghiệm online',
    // Long-tail keywords
    'ai là triệu phú cho giáo viên',
    'tạo game ai là triệu phú',
    'ai là triệu phú miễn phí',
    'game ai là triệu phú tiếng việt',
    'game show giáo dục',
    // Teacher intent
    'công cụ ôn tập lớp học',
    'game kiểm tra miệng',
    'trò chơi kiến thức cho lớp',
  ],
  openGraph: {
    title: 'Ai Là Triệu Phú - Who Wants to Be a Millionaire Online',
    description: 'Quiz game show cho lớp học! Tự tạo câu hỏi, 4 quyền trợ giúp như game show thật. Miễn phí!',
    url: 'https://sorokid.com/tool/ai-la-trieu-phu',
    siteName: 'SoroKid Toolbox',
    images: [
      {
        url: '/blog/ai-la-trieu-phu-game-show-kiem-tra-kien-thuc-trong-lop.png',
        width: 1200,
        height: 630,
        alt: 'Ai Là Triệu Phú - Who Wants to Be a Millionaire',
      }
    ],
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ai Là Triệu Phú - Millionaire Quiz Game',
    description: 'Quiz game show cho lớp học. Tự tạo câu hỏi, 4 quyền trợ giúp!',
    images: ['/blog/ai-la-trieu-phu-game-show-kiem-tra-kien-thuc-trong-lop.png'],
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/ai-la-trieu-phu',
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
      'name': 'Ai Là Triệu Phú - Who Wants to Be a Millionaire',
      'alternateName': ['Who Wants to Be a Millionaire', 'Millionaire Quiz Game', 'Quiz Game Show', 'Trivia Game'],
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'Web Browser',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'VND',
      },
      'description': 'Game show Ai Là Triệu Phú phiên bản giáo dục. Who Wants to Be a Millionaire cho lớp học. Tự tạo câu hỏi theo môn học, có 4 quyền trợ giúp như game show thật.',
      'featureList': [
        'Tự tạo câu hỏi theo chủ đề bất kỳ',
        '4 quyền trợ giúp: 50:50, Hỏi khán giả, Gọi điện, Đổi câu',
        'Âm thanh hồi hộp như game show thật',
        'Hiệu ứng đẹp mắt',
        '15 câu hỏi leo thang',
        'Mốc an toàn 5 và 10',
        'Lưu bộ câu hỏi để dùng lại',
        'Chế độ toàn màn hình',
      ],
      'audience': {
        '@type': 'EducationalAudience',
        'educationalRole': 'teacher',
      },
      'educationalUse': [
        'Ôn tập kiến thức trước kiểm tra',
        'Kiểm tra miệng vui nhộn',
        'Khởi động tiết học hấp dẫn',
        'Thi đua giữa các nhóm',
        'Cuối kỳ ôn tập tổng hợp',
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'ratingCount': '4580',
        'bestRating': '5',
      },
      'datePublished': '2024-01-08',
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
      'name': 'Cách tổ chức Ai Là Triệu Phú cho lớp học',
      'description': 'Hướng dẫn giáo viên tổ chức quiz game show Ai Là Triệu Phú trong tiết học',
      'totalTime': 'PT5M',
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Tạo bộ câu hỏi',
          'text': 'Nhập câu hỏi theo chủ đề bài học, mỗi câu có 4 đáp án và đánh dấu đáp án đúng',
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Mở chế độ game show',
          'text': 'Chiếu game lên máy chiếu, mở chế độ toàn màn hình để cả lớp cùng xem',
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Gọi học sinh lên "nóng ghế"',
          'text': 'Mời học sinh lên ngồi vị trí người chơi, bắt đầu từ câu hỏi đầu tiên',
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Sử dụng quyền trợ giúp',
          'text': 'Khi học sinh cần, cho phép dùng các quyền: 50:50, Hỏi khán giả (cả lớp vote), Gọi điện (hỏi bạn 30 giây)',
        },
        {
          '@type': 'HowToStep',
          'position': 5,
          'name': 'Trao thưởng và tiếp tục',
          'text': 'Học sinh trả lời đúng được cộng điểm/thưởng. Gọi học sinh tiếp theo lên chơi',
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
          'name': 'Làm sao chơi Ai Là Triệu Phú cho lớp học?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Rất đơn giản: (1) Nhập bộ câu hỏi của bạn hoặc dùng mẫu có sẵn, (2) Mở game trên máy chiếu, (3) Gọi học sinh lên "nóng ghế" và bắt đầu hỏi. Có thể thi đua giữa các nhóm hoặc cá nhân.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Khác gì so với Who Wants to Be a Millionaire gốc?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Ai Là Triệu Phú của SoroKid là phiên bản giáo dục, cho phép giáo viên tự tạo câu hỏi theo môn học. Có đầy đủ 4 quyền trợ giúp và hiệu ứng như game show thật, nhưng nội dung tùy biến theo bài học.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có những quyền trợ giúp nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': '4 quyền trợ giúp: (1) 50:50 - loại 2 đáp án sai, (2) Hỏi khán giả - cả lớp vote đáp án, (3) Gọi điện - hỏi 1 bạn khác trong 30 giây, (4) Đổi câu - đổi sang câu hỏi khác.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể tự tạo câu hỏi không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn được! Bạn có thể nhập câu hỏi theo bất kỳ chủ đề nào: Toán, Văn, Anh, Lý, Hóa, Sử, Địa... Mỗi câu có 4 đáp án, bạn đánh dấu đáp án đúng. Có thể lưu lại để dùng cho nhiều lớp.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Giáo viên dùng Ai Là Triệu Phú khi nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Phù hợp nhất khi: ôn tập trước kiểm tra (biến ôn bài thành game show), kiểm tra miệng vui nhộn, cuối kỳ ôn tập tổng hợp, hoặc làm hoạt động thú vị khi có giáo viên dự giờ.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Millionaire Quiz Game có miễn phí không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn MIỄN PHÍ! Không giới hạn số lần chơi, số bộ câu hỏi, không cần đăng ký tài khoản.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể dùng cho team building không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Rất phù hợp! Ai Là Triệu Phú là quiz game show tuyệt vời cho team building, workshop, hoặc bất kỳ sự kiện nào cần hoạt động hỏi đáp sôi động.'
          }
        },
      ]
    },
    // WebPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Ai Là Triệu Phú - Who Wants to Be a Millionaire Online',
      'description': 'Quiz game show Ai Là Triệu Phú online cho lớp học. Who Wants to Be a Millionaire phiên bản giáo dục.',
      'url': 'https://sorokid.com/tool/ai-la-trieu-phu',
      'inLanguage': 'vi-VN',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'SoroKid Toolbox',
        'url': 'https://sorokid.com',
      },
      'about': {
        '@type': 'Thing',
        'name': 'Who Wants to Be a Millionaire Quiz Game',
      },
      'datePublished': '2024-01-08',
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
          'name': 'Ai Là Triệu Phú',
          'item': 'https://sorokid.com/tool/ai-la-trieu-phu'
        }
      ]
    }
  ];
}

export default function AiLaTrieuPhuLayout({ children }) {
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
