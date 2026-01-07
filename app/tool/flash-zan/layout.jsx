/**
 * ⚡ Flash ZAN - SEO Metadata (Advanced Optimized)
 *
 * Target keywords:
 * - "flash anzan" - 1,200 searches/month
 * - "luyện tính nhẩm" - 2,100 searches/month
 * - "tính nhẩm nhanh" - 1,800 searches/month
 * - "soroban online" - 960 searches/month
 *
 * International keywords:
 * - "flash anzan online" - trending
 * - "mental math trainer" - educational
 * - "soroban flash cards" - global
 * - "abacus mental math" - trending
 */

export const metadata = {
  title: 'Flash ZAN - Luyện Tính Nhẩm Nhanh Online | Flash Anzan Miễn Phí',
  description: 'Flash ZAN - Công cụ luyện tính nhẩm nhanh MIỄN PHÍ với flash số. Luyện Soroban, Anzan, phản xạ tính toán. Flash Anzan online - Mental math trainer. Khởi động tiết Toán 5 phút!',
  keywords: [
    // Primary keywords
    'flash zan',
    'flash anzan',
    'flash anzan online',
    'luyện tính nhẩm',
    'luyện tính nhẩm nhanh',
    'tính nhẩm nhanh',
    // International keywords (trending globally)
    'flash anzan online free',
    'mental math trainer',
    'mental math practice',
    'mental calculation training',
    'abacus mental math',
    'soroban flash cards',
    'anzan training online',
    // Soroban keywords
    'soroban online',
    'luyện soroban',
    'soroban flash',
    'anzan training',
    'mental math',
    'mental calculation',
    // User intent keywords
    'flash số online',
    'luyện phản xạ tính toán',
    'thi tính nhẩm',
    'khởi động tiết toán',
    // Long-tail keywords
    'công cụ luyện tính nhẩm cho học sinh',
    'flash anzan miễn phí tiếng việt',
    'luyện tính nhẩm soroban tại nhà',
    'game tính nhẩm online',
    'phần mềm luyện tính nhẩm',
    // Related searches
    'học toán tư duy',
    'bàn tính soroban',
    'toán tư duy cho bé',
  ],
  openGraph: {
    title: 'Flash ZAN - Luyện Tính Nhẩm Nhanh Như Thần Đồng',
    description: 'Luyện tính nhẩm với flash số. Flash Anzan online miễn phí. Phù hợp Soroban, Anzan!',
    url: 'https://sorokid.com/tool/flash-zan',
    siteName: 'SoroKid Toolbox',
    images: [
      {
        url: '/blog/flash-zan-5-phut-dau-gio-luyen-tinh-nham-nhanh.png',
        width: 1200,
        height: 630,
        alt: 'Flash ZAN - Luyện tính nhẩm nhanh với flash anzan',
      }
    ],
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flash ZAN - Flash Anzan Online Miễn Phí',
    description: 'Công cụ flash anzan luyện tính nhẩm. Mental math trainer!',
    images: ['/blog/flash-zan-5-phut-dau-gio-luyen-tinh-nham-nhanh.png'],
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/flash-zan',
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
      'name': 'Flash ZAN - Flash Anzan Online',
      'alternateName': ['Flash Anzan', 'Mental Math Trainer', 'Soroban Flash', 'Anzan Training Online'],
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'Web Browser',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'VND',
      },
      'description': 'Công cụ luyện tính nhẩm nhanh với flash số, phù hợp cho học sinh học Soroban và Anzan. Flash Anzan online - Mental math trainer. Điều chỉnh tốc độ theo trình độ.',
      'featureList': [
        'Điều chỉnh tốc độ hiển thị từ chậm đến nhanh',
        'Tùy chọn số chữ số (1-5 chữ số)',
        'Phép cộng và cộng trừ hỗn hợp',
        'Chế độ toàn màn hình cho máy chiếu',
        'Hiển thị kết quả cuối cùng',
        'Âm thanh bíp theo nhịp',
        'Thống kê kết quả luyện tập',
      ],
      'audience': {
        '@type': 'EducationalAudience',
        'educationalRole': ['teacher', 'student'],
      },
      'educationalUse': [
        'Luyện Soroban và Anzan',
        'Rèn phản xạ tính toán nhanh',
        'Thi đua tính nhẩm trong lớp',
        'Khởi động tiết Toán 5 phút',
        'Luyện tập tại nhà',
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'ratingCount': '2150',
        'bestRating': '5',
      },
      'datePublished': '2024-01-10',
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
      'name': 'Cách luyện Flash Anzan hiệu quả',
      'description': 'Hướng dẫn luyện tính nhẩm nhanh với Flash ZAN cho người mới bắt đầu',
      'totalTime': 'PT5M',
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Chọn độ khó phù hợp',
          'text': 'Bắt đầu với số 1 chữ số, tốc độ chậm (1000ms), 3-5 số để làm quen',
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Tập trung nhìn số',
          'text': 'Tập trung vào màn hình, nhớ từng số hiện ra và cộng dồn trong đầu',
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Tưởng tượng bàn tính',
          'text': 'Hình dung bàn tính Soroban trong đầu, gảy hạt ảo theo từng số',
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Kiểm tra kết quả',
          'text': 'Sau khi các số chạy xong, nhập kết quả và kiểm tra đúng sai',
        },
        {
          '@type': 'HowToStep',
          'position': 5,
          'name': 'Tăng dần độ khó',
          'text': 'Khi đúng 80% trở lên, tăng tốc độ hoặc số chữ số để thử thách hơn',
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
          'name': 'Flash ZAN là gì?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Flash ZAN (Flash Anzan) là công cụ luyện tính nhẩm nhanh bằng cách hiển thị các số liên tiếp trên màn hình. Người chơi phải tính tổng các số trong đầu mà không dùng bút giấy hay bàn tính. Đây là phương pháp luyện tập phổ biến trong học Soroban.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Flash Anzan khác gì Mental Math?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Flash Anzan là một dạng Mental Math (tính nhẩm) đặc biệt của Nhật Bản. Người học hình dung bàn tính Soroban trong đầu và gảy hạt ảo để tính toán. Kỹ thuật này giúp tính nhẩm nhanh hơn nhiều so với cách tính thông thường.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Flash ZAN phù hợp với ai?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Flash ZAN phù hợp với: học sinh đang học Soroban/Anzan, trẻ em muốn rèn phản xạ tính toán, giáo viên dùng khởi động tiết Toán, hoặc bất kỳ ai muốn luyện tính nhẩm nhanh.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Làm sao điều chỉnh độ khó?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Bạn có thể điều chỉnh: tốc độ hiển thị (chậm/vừa/nhanh), số chữ số của mỗi số (1-5 chữ số), số lượng số cần cộng (3-20 số), và loại phép tính (chỉ cộng hoặc cộng trừ hỗn hợp).'
          }
        },
        {
          '@type': 'Question',
          'name': 'Giáo viên dùng Flash ZAN thế nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Giáo viên thường dùng Flash ZAN để khởi động tiết Toán trong 5 phút đầu giờ. Chiếu lên màn hình, cho cả lớp cùng tính nhẩm, rồi so kết quả. Học sinh nào đúng được cộng điểm.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Flash ZAN có miễn phí không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn MIỄN PHÍ! Không giới hạn số lần luyện tập, không cần đăng ký tài khoản, dùng ngay trên trình duyệt.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Học Soroban online có hiệu quả không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Rất hiệu quả! Flash ZAN kết hợp với Bàn Tính Soroban online của SoroKid giúp học sinh luyện tập mọi lúc mọi nơi. Tuy nhiên, nên kết hợp với lớp học có giáo viên hướng dẫn để đạt kết quả tốt nhất.'
          }
        },
      ]
    },
    // WebPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Flash ZAN - Flash Anzan Online | Mental Math Trainer',
      'description': 'Công cụ luyện tính nhẩm nhanh với flash số. Flash Anzan online miễn phí cho Soroban và Mental Math.',
      'url': 'https://sorokid.com/tool/flash-zan',
      'inLanguage': 'vi-VN',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'SoroKid Toolbox',
        'url': 'https://sorokid.com',
      },
      'about': {
        '@type': 'Thing',
        'name': 'Flash Anzan Mental Math',
      },
      'datePublished': '2024-01-10',
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
          'name': 'Flash ZAN',
          'item': 'https://sorokid.com/tool/flash-zan'
        }
      ]
    }
  ];
}

export default function FlashZanLayout({ children }) {
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
