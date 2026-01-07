/**
 * 🎫 Bốc Thăm - SEO Metadata (Advanced Optimized)
 *
 * Target keywords:
 * - "bốc thăm ngẫu nhiên" - 2,400 searches/month
 * - "random picker" - 1,600 searches/month
 * - "rút thăm online" - 1,100 searches/month
 * - "name picker" - 880 searches/month
 *
 * International keywords:
 * - "random name picker" - trending
 * - "name picker wheel" - popular
 * - "random student picker" - educational
 * - "lucky draw online" - global
 */

export const metadata = {
  title: 'Bốc Thăm Ngẫu Nhiên Online - Random Name Picker | Rút Thăm Miễn Phí',
  description: 'Bốc Thăm Ngẫu Nhiên Online - Random name picker MIỄN PHÍ với hiệu ứng slot machine hồi hộp. Random student picker cho lớp học, lucky draw online. Không cần đăng nhập!',
  keywords: [
    // Primary keywords
    'bốc thăm ngẫu nhiên',
    'bốc thăm ngẫu nhiên online',
    'bốc thăm online',
    'random picker',
    'random picker online',
    'rút thăm online',
    // International keywords (trending globally)
    'random name picker',
    'random name picker online',
    'name picker wheel',
    'random student picker',
    'lucky draw online',
    'name picker online free',
    'random name selector',
    'student picker online',
    // User intent keywords
    'chọn tên ngẫu nhiên',
    'name picker',
    'slot machine picker',
    // Long-tail keywords
    'bốc thăm học sinh trả lời',
    'random picker miễn phí',
    'công cụ bốc thăm cho giáo viên',
    'rút thăm trúng thưởng online',
    'bốc thăm kiểm tra miệng',
    'random selector tiếng việt',
    // Related searches
    'công cụ lớp học',
    'quay số may mắn',
    'chọn ngẫu nhiên online',
    'lucky picker',
  ],
  openGraph: {
    title: 'Bốc Thăm Ngẫu Nhiên - Random Name Picker Online Miễn Phí',
    description: 'Random name picker với hiệu ứng slot machine! Random student picker cho lớp học. Miễn phí!',
    url: 'https://sorokid.com/tool/boc-tham',
    siteName: 'SoroKid Toolbox',
    images: [
      {
        url: '/blog/boc-tham-kiem-tra-mieng-cong-bang-cho-tat-ca.png',
        width: 1200,
        height: 630,
        alt: 'Bốc Thăm Ngẫu Nhiên - Random Name Picker',
      }
    ],
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bốc Thăm - Random Name Picker Online',
    description: 'Random name picker với hiệu ứng slot machine. Miễn phí!',
    images: ['/blog/boc-tham-kiem-tra-mieng-cong-bang-cho-tat-ca.png'],
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/boc-tham',
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
      'name': 'Bốc Thăm Ngẫu Nhiên - Random Name Picker',
      'alternateName': ['Random Name Picker', 'Random Student Picker', 'Lucky Draw Online', 'Slot Machine Picker'],
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'Web Browser',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'VND',
      },
      'description': 'Công cụ bốc thăm ngẫu nhiên với hiệu ứng slot machine hồi hộp. Random name picker cho lớp học, random student picker miễn phí.',
      'featureList': [
        'Hiệu ứng slot machine hồi hộp',
        'Âm thanh như máy đánh bạc',
        'Nhập danh sách tùy ý',
        'Bốc nhiều lần liên tiếp',
        'Loại bỏ tên đã bốc',
        'Hiển thị kết quả đẹp mắt',
        'Chế độ toàn màn hình',
      ],
      'audience': {
        '@type': 'EducationalAudience',
        'educationalRole': 'teacher',
      },
      'educationalUse': [
        'Bốc tên học sinh trả lời câu hỏi',
        'Kiểm tra miệng ngẫu nhiên',
        'Chọn câu hỏi ngẫu nhiên',
        'Rút thăm quà tặng, phần thưởng',
        'Chọn chủ đề thuyết trình',
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.8',
        'ratingCount': '1420',
        'bestRating': '5',
      },
      'datePublished': '2024-01-20',
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
      'name': 'Cách bốc thăm ngẫu nhiên học sinh',
      'description': 'Hướng dẫn sử dụng random name picker để chọn học sinh ngẫu nhiên',
      'totalTime': 'PT1M',
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Nhập danh sách tên',
          'text': 'Nhập danh sách tên học sinh hoặc các lựa chọn, mỗi tên một dòng',
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Tùy chọn loại bỏ',
          'text': 'Bật/tắt tùy chọn loại bỏ tên đã bốc để tránh trùng lặp',
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Bấm nút Bốc',
          'text': 'Bấm nút Bốc Thăm, hiệu ứng slot machine sẽ chạy hồi hộp',
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Xem kết quả',
          'text': 'Tên được chọn sẽ hiển thị to trên màn hình với hiệu ứng đẹp mắt',
        },
        {
          '@type': 'HowToStep',
          'position': 5,
          'name': 'Tiếp tục bốc',
          'text': 'Bấm tiếp để bốc thêm người khác nếu cần',
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
          'name': 'Bốc Thăm Ngẫu Nhiên hoạt động như thế nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Bạn nhập danh sách tên hoặc các lựa chọn, bấm nút Bốc, công cụ sẽ hiển thị hiệu ứng slot machine quay nhanh, rồi dừng lại ở một kết quả ngẫu nhiên. Rất hồi hộp và công bằng!'
          }
        },
        {
          '@type': 'Question',
          'name': 'Random Name Picker này khác gì tool khác?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Random Name Picker của SoroKid có hiệu ứng slot machine hấp dẫn như game show, giao diện tiếng Việt thân thiện, tùy chọn loại bỏ tên đã bốc, và hoàn toàn miễn phí không quảng cáo.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể bốc nhiều lần không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Bạn có thể bốc liên tục nhiều lần. Có tùy chọn loại bỏ tên đã bốc để không bị trùng lặp, hoặc giữ nguyên danh sách để có thể bốc trùng.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Giáo viên dùng Bốc Thăm để làm gì?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Giáo viên thường dùng để: bốc tên học sinh kiểm tra miệng (random student picker), chọn câu hỏi ngẫu nhiên từ ngân hàng đề, rút thăm quà tặng cuối tuần, hoặc chọn thứ tự thuyết trình cho học sinh.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Khác gì với Chiếc Nón Kỳ Diệu?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Chiếc Nón Kỳ Diệu là vòng quay (wheel), còn Bốc Thăm là hiệu ứng slot machine (các tên chạy dọc). Cả hai đều chọn ngẫu nhiên nhưng trải nghiệm khác nhau. Bốc Thăm nhanh hơn, Chiếc Nón có không khí game show hơn.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Random Name Picker có miễn phí không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn MIỄN PHÍ! Không giới hạn số lần bốc, không cần đăng ký, không có quảng cáo làm phiền.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể dùng làm Lucky Draw không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Bốc Thăm rất phù hợp làm Lucky Draw online cho các sự kiện, bốc thăm trúng thưởng, rút thăm may mắn với hiệu ứng slot machine hồi hộp.'
          }
        },
      ]
    },
    // WebPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Bốc Thăm Ngẫu Nhiên - Random Name Picker Online',
      'description': 'Random name picker online miễn phí. Random student picker với hiệu ứng slot machine cho lớp học.',
      'url': 'https://sorokid.com/tool/boc-tham',
      'inLanguage': 'vi-VN',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'SoroKid Toolbox',
        'url': 'https://sorokid.com',
      },
      'about': {
        '@type': 'Thing',
        'name': 'Random Name Picker',
      },
      'datePublished': '2024-01-20',
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
          'name': 'Bốc Thăm Ngẫu Nhiên',
          'item': 'https://sorokid.com/tool/boc-tham'
        }
      ]
    }
  ];
}

export default function BocThamLayout({ children }) {
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
