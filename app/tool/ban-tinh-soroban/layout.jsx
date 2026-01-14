/**
 * 🧮 Bàn Tính Soroban - SEO Metadata (Advanced Optimized)
 *
 * Target keywords:
 * - "bàn tính soroban" - 2,900 searches/month
 * - "soroban online" - 1,600 searches/month
 * - "bàn tính nhật bản" - 1,300 searches/month
 * - "abacus online" - 880 searches/month
 *
 * International keywords:
 * - "virtual soroban" - trending
 * - "online abacus" - popular
 * - "japanese abacus online" - educational
 * - "abacus simulator" - global
 * 
 * 🚀 TỐI ƯU: Static generation - 0 server process
 */

// ============ STATIC CONFIG ============
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Soroban Abacus Online - Free Virtual Abacus | Practice Soroban',
  description: 'Soroban Abacus Online - FREE Japanese virtual abacus. Drag and drop beads intuitively, see number values. Japanese abacus online for students to practice at home, teachers to demonstrate in class!',
  keywords: [
    // Primary keywords
    'bàn tính soroban',
    'bàn tính soroban online',
    'soroban online',
    'soroban ảo',
    'bàn tính ảo',
    'bàn tính nhật bản',
    // International keywords (trending globally)
    'virtual soroban',
    'virtual abacus',
    'online abacus',
    'abacus online free',
    'japanese abacus online',
    'abacus simulator',
    'soroban simulator',
    'digital abacus',
    // User intent keywords
    'abacus online',
    'luyện soroban',
    'học soroban online',
    // Long-tail keywords
    'bàn tính soroban miễn phí',
    'luyện soroban tại nhà',
    'bàn tính soroban cho bé',
    'học tính nhẩm soroban online',
    'soroban abacus online free',
    'bàn tính nhật bản online',
    // Related searches
    'toán tư duy',
    'tính nhẩm nhanh',
    'học toán cho bé',
    'mental math',
    'bàn tính gảy',
  ],
  openGraph: {
    title: 'Soroban Abacus Online - Free Virtual Abacus',
    description: 'Virtual soroban - Japanese abacus with intuitive bead drag-and-drop. Free Japanese abacus online!',
    url: 'https://sorokid.com/tool/ban-tinh-soroban',
    siteName: 'SoroKid Toolbox',
    images: [
      {
        url: '/blog/cach-cam-ban-tinh-soroban-dung.jpg',
        width: 1200,
        height: 630,
        alt: 'Bàn Tính Soroban Online - Virtual Abacus',
      }
    ],
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soroban Abacus - Virtual Abacus Online',
    description: 'Virtual soroban - Japanese abacus with bead drag-and-drop. Free!',
    images: ['/blog/cach-cam-ban-tinh-soroban-dung.jpg'],
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/ban-tinh-soroban',
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
      'name': 'Bàn Tính Soroban Online - Virtual Abacus',
      'alternateName': ['Virtual Soroban', 'Virtual Abacus', 'Japanese Abacus Online', 'Online Abacus Free'],
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'Web Browser',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'VND',
      },
      'description': 'Bàn tính Soroban ảo miễn phí để luyện tập tính nhẩm. Virtual abacus với kéo thả hạt trực quan, hiển thị giá trị số. Japanese abacus online.',
      'featureList': [
        'Kéo thả hạt trực quan như bàn thật',
        'Hiển thị giá trị số thực tế',
        'Phù hợp học sinh mới bắt đầu',
        'Sử dụng trên mọi thiết bị',
        'Không cần cài đặt ứng dụng',
        'Reset về 0 nhanh chóng',
        'Chế độ toàn màn hình',
      ],
      'audience': {
        '@type': 'EducationalAudience',
        'educationalRole': ['teacher', 'student', 'parent'],
      },
      'educationalUse': [
        'Giáo viên minh họa trên lớp',
        'Học sinh luyện tập tại nhà',
        'Phụ huynh kèm con học Soroban',
        'Học Soroban cơ bản',
        'Bước đầu làm quen bàn tính',
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'ratingCount': '3250',
        'bestRating': '5',
      },
      'datePublished': '2024-01-01',
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
      'name': 'Cách sử dụng bàn tính Soroban online',
      'description': 'Hướng dẫn cơ bản sử dụng bàn tính Soroban ảo cho người mới bắt đầu',
      'totalTime': 'PT3M',
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Hiểu cấu trúc bàn tính',
          'text': 'Soroban có 1 hạt trên (giá trị 5) và 4 hạt dưới (mỗi hạt giá trị 1). Cột phải nhất là hàng đơn vị.',
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Kéo hạt để thay đổi giá trị',
          'text': 'Kéo hạt lên/xuống để thay đổi giá trị. Hạt chạm vào thanh giữa được tính.',
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Xem giá trị hiển thị',
          'text': 'Giá trị số được hiển thị phía trên để kiểm tra kết quả.',
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Thực hành các phép tính',
          'text': 'Luyện tập cộng, trừ bằng cách gảy hạt theo kỹ thuật Soroban.',
        },
        {
          '@type': 'HowToStep',
          'position': 5,
          'name': 'Reset để làm bài mới',
          'text': 'Bấm nút Reset để đưa tất cả hạt về 0 và bắt đầu bài mới.',
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
          'name': 'Bàn Tính Soroban là gì?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Soroban (そろばん) là bàn tính gảy của Nhật Bản, được sử dụng để dạy tính nhẩm nhanh cho trẻ em. Khác với bàn tính Trung Quốc, Soroban có 1 hạt trên (giá trị 5) và 4 hạt dưới (mỗi hạt giá trị 1).'
          }
        },
        {
          '@type': 'Question',
          'name': 'Virtual Soroban có giống bàn tính thật không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Virtual Soroban mô phỏng chính xác cấu trúc và cách hoạt động của bàn tính Soroban thật. Kéo thả hạt trực quan, có hiển thị giá trị để kiểm tra. Tuy nhiên, nên kết hợp cả bàn thật và bàn ảo để học hiệu quả nhất.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể luyện Soroban online không cần bàn thật?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Bàn Tính Soroban Online (virtual abacus) cho phép bạn kéo thả hạt như bàn thật. Tiện lợi khi đi đường hoặc không có bàn thật bên cạnh. Tuy nhiên, để học hiệu quả nhất, nên kết hợp cả bàn thật và bàn ảo.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Bàn tính ảo này phù hợp với ai?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Phù hợp với: học sinh đang học Soroban muốn luyện thêm tại nhà, giáo viên cần minh họa trên máy chiếu, phụ huynh muốn kèm con học, hoặc người mới muốn làm quen với Soroban trước khi mua bàn thật.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Làm sao sử dụng bàn tính Soroban?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Kéo hạt lên/xuống để thay đổi giá trị. Hạt trên (hạt trời) có giá trị 5, mỗi hạt dưới (hạt đất) có giá trị 1. Cột phải nhất là hàng đơn vị, tiếp theo là hàng chục, trăm, nghìn...'
          }
        },
        {
          '@type': 'Question',
          'name': 'Japanese Abacus Online có miễn phí không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn MIỄN PHÍ! Không giới hạn thời gian sử dụng, không cần đăng ký tài khoản, mở trình duyệt là dùng được ngay.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Học Soroban online có hiệu quả không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Rất hiệu quả khi kết hợp đúng cách! Virtual Soroban giúp luyện tập mọi lúc mọi nơi. Kết hợp với Flash ZAN của SoroKid để luyện Flash Anzan. Tuy nhiên, nên học với giáo viên có kinh nghiệm để nắm đúng kỹ thuật.'
          }
        },
      ]
    },
    // WebPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Bàn Tính Soroban Online - Virtual Abacus | Japanese Abacus',
      'description': 'Virtual soroban - bàn tính ảo Nhật Bản online miễn phí. Japanese abacus online với kéo thả hạt trực quan.',
      'url': 'https://sorokid.com/tool/ban-tinh-soroban',
      'inLanguage': 'vi-VN',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'SoroKid Toolbox',
        'url': 'https://sorokid.com',
      },
      'about': {
        '@type': 'Thing',
        'name': 'Virtual Soroban Abacus',
      },
      'datePublished': '2024-01-01',
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
          'name': 'Bàn Tính Soroban',
          'item': 'https://sorokid.com/tool/ban-tinh-soroban'
        }
      ]
    }
  ];
}

export default function BanTinhSorobanLayout({ children }) {
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
