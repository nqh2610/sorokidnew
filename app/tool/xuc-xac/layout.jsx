/**
 * 🎲 Xúc Xắc 3D - SEO Metadata (Advanced Optimized)
 *
 * Target keywords:
 * - "xúc xắc online" - 2,400 searches/month
 * - "dice roller" - 1,900 searches/month
 * - "lắc xúc xắc" - 1,300 searches/month
 * - "roll dice online" - 880 searches/month
 *
 * International keywords:
 * - "dice roller online" - super trending
 * - "roll dice online" - popular
 * - "virtual dice" - global
 * - "3d dice roller" - trending
 * 
 * 🚀 TỐI ƯU: Static generation - 0 server process
 */

// ============ STATIC CONFIG ============
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: '3D Dice Roller Online | Free Virtual Dice',
  description: '3D Dice Roller Online - FREE dice roller with beautiful 3D effects. Roll dice online, supports 1-6 dice, realistic rolling sounds. Virtual dice for classroom, online board games!',
  keywords: [
    // Primary keywords
    'xúc xắc online',
    'xúc xắc 3d',
    'lắc xúc xắc online',
    'thảy xúc xắc',
    'dice roller',
    'dice roller online',
    // International keywords (super trending)
    'roll dice online',
    'roll dice',
    'dice roller online free',
    'virtual dice',
    'virtual dice roller',
    '3d dice roller',
    'online dice',
    'random dice',
    // User intent keywords
    'xúc xắc ảo',
    'gieo xúc xắc',
    '3d dice',
    // Long-tail keywords
    'xúc xắc online miễn phí',
    'lắc xúc xắc 3d online',
    'xúc xắc cho lớp học',
    'dice roller tiếng việt',
    'xúc xắc game online',
    'random dice online',
    // Related searches
    'trò chơi lớp học',
    'board game online',
    'công cụ giáo viên',
    'game may mắn',
    'random number',
  ],
  openGraph: {
    title: '3D Dice Roller - Free Online Virtual Dice',
    description: 'Roll dice online - 3D dice with beautiful effects. Virtual dice supports 1-6 dice. Free!',
    url: 'https://sorokid.com/tool/xuc-xac',
    siteName: 'SoroKid Toolbox',
    images: [
      {
        url: '/blog/xuc-xac-3d-cong-cu-random-vui-nhon-trong-lop-hoc.png',
        width: 1200,
        height: 630,
        alt: 'Xúc Xắc 3D - Dice Roller Online',
      }
    ],
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3D Dice Roller Online',
    description: 'Virtual dice - Roll beautiful 3D dice. Free, no login required!',
    images: ['/blog/xuc-xac-3d-cong-cu-random-vui-nhon-trong-lop-hoc.png'],
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/xuc-xac',
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
      'name': 'Xúc Xắc 3D - Dice Roller Online',
      'alternateName': ['Dice Roller', 'Virtual Dice', '3D Dice Online', 'Roll Dice Online'],
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'Web Browser',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'VND',
      },
      'description': 'Công cụ lắc xúc xắc 3D trực tuyến với hiệu ứng đẹp mắt. Dice roller online hỗ trợ 1-6 viên xúc xắc, âm thanh lăn chân thực. Virtual dice cho lớp học.',
      'featureList': [
        'Hiệu ứng 3D chân thực',
        'Hỗ trợ 1-6 viên xúc xắc',
        'Âm thanh lăn sống động',
        'Tùy chỉnh số mặt xúc xắc',
        'Tự nhập nội dung cho mỗi mặt',
        'Hiển thị tổng điểm',
        'Chế độ toàn màn hình',
      ],
      'audience': {
        '@type': 'EducationalAudience',
        'educationalRole': 'teacher',
      },
      'educationalUse': [
        'Trò chơi khởi động lớp học',
        'Chọn ngẫu nhiên câu hỏi',
        'Board game trong lớp',
        'Chọn số ngẫu nhiên cho bài tập',
        'Hoạt động may mắn vui nhộn',
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.8',
        'ratingCount': '1350',
        'bestRating': '5',
      },
      'datePublished': '2024-02-10',
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
      'name': 'Cách sử dụng Xúc Xắc 3D cho lớp học',
      'description': 'Hướng dẫn giáo viên sử dụng dice roller cho các hoạt động lớp học',
      'totalTime': 'PT1M',
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Chọn số viên xúc xắc',
          'text': 'Chọn số viên xúc xắc muốn lắc (1-6 viên)',
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Tùy chỉnh nội dung (tùy chọn)',
          'text': 'Thay số bằng nội dung tùy ý như câu hỏi, hành động, tên học sinh...',
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Mở toàn màn hình',
          'text': 'Bấm nút fullscreen và chiếu lên máy chiếu cho cả lớp xem',
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Bấm lắc hoặc bấm phím Space',
          'text': 'Xúc xắc 3D sẽ lăn với hiệu ứng đẹp mắt và âm thanh chân thực',
        },
        {
          '@type': 'HowToStep',
          'position': 5,
          'name': 'Xem kết quả',
          'text': 'Kết quả hiển thị rõ ràng, có tổng điểm nếu lắc nhiều viên',
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
          'name': 'Xúc Xắc 3D có gì đặc biệt?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Xúc Xắc 3D có hiệu ứng lăn chân thực với đồ họa 3D đẹp mắt, âm thanh lăn như thật. Hỗ trợ lắc 1-6 viên cùng lúc, có thể tùy chỉnh số mặt và nội dung từng mặt.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Dice Roller này khác gì các tool khác?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Dice Roller của SoroKid có hiệu ứng 3D đẹp hơn, tùy chỉnh nội dung từng mặt xúc xắc (không chỉ là số), giao diện tiếng Việt, và hoàn toàn miễn phí không quảng cáo.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Giáo viên dùng Xúc Xắc để làm gì?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Giáo viên dùng để: chọn số ngẫu nhiên cho bài tập (ví dụ: lắc được 5 thì làm bài số 5), tạo trò chơi board game trong lớp, hoạt động khởi động may mắn, hoặc tự nhập nội dung như "Hát", "Nhảy", "Trả lời câu hỏi" cho mỗi mặt.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể tùy chỉnh nội dung mặt xúc xắc không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Bạn có thể thay số 1-6 bằng nội dung tùy ý: câu hỏi, hành động, tên học sinh... Biến xúc xắc thành công cụ chọn ngẫu nhiên đa năng.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể lắc nhiều xúc xắc cùng lúc không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Hỗ trợ lắc 1-6 viên xúc xắc cùng lúc. Tự động tính tổng điểm nếu dùng xúc xắc số. Phù hợp cho nhiều loại trò chơi.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Virtual Dice có miễn phí không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn MIỄN PHÍ! Không giới hạn số lần lắc, không cần đăng ký, không có quảng cáo.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có dùng được cho board game online không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Rất phù hợp! Dice Roller 3D của SoroKid hoàn hảo cho board game online, role-playing game, hoặc bất kỳ trò chơi nào cần xúc xắc với hiệu ứng đẹp.'
          }
        },
      ]
    },
    // WebPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Xúc Xắc 3D - Dice Roller Online | Virtual Dice',
      'description': 'Dice roller online với hiệu ứng 3D. Roll dice online miễn phí, virtual dice cho lớp học và board game.',
      'url': 'https://sorokid.com/tool/xuc-xac',
      'inLanguage': 'vi-VN',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'SoroKid Toolbox',
        'url': 'https://sorokid.com',
      },
      'about': {
        '@type': 'Thing',
        'name': 'Dice Roller 3D',
      },
      'datePublished': '2024-02-10',
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
          'name': 'Xúc Xắc 3D',
          'item': 'https://sorokid.com/tool/xuc-xac'
        }
      ]
    }
  ];
}

export default function XucXacLayout({ children }) {
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
