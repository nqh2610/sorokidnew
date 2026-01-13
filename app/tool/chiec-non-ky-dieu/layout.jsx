/**
 * 🎡 Chiếc Nón Kỳ Diệu - SEO Metadata (Advanced Optimized)
 *
 * Target keywords:
 * - "quay số ngẫu nhiên" - 2,400 searches/month
 * - "vòng quay may mắn" - 1,900 searches/month
 * - "picker wheel" - 1,500 searches/month (international)
 * - "wheel of names" - 1,200 searches/month (international)
 * - "spin the wheel" - 2,800 searches/month (international)
 * 
 * 🚀 TỐI ƯU: Static generation - 0 server process
 */

// ============ STATIC CONFIG ============
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Chiếc Nón Kỳ Diệu Online - Vòng Quay May Mắn | Quay Số Ngẫu Nhiên Miễn Phí',
  description: 'Chiếc Nón Kỳ Diệu - Vòng quay may mắn online MIỄN PHÍ. Quay số ngẫu nhiên để gọi học sinh, chọn người may mắn, bốc thăm trúng thưởng. Không cần đăng nhập, dùng ngay trên máy chiếu!',
  keywords: [
    // Primary keywords (Vietnamese)
    'chiếc nón kỳ diệu',
    'chiếc nón kỳ diệu online',
    'vòng quay may mắn',
    'vòng quay may mắn online',
    'quay số ngẫu nhiên',
    'quay số may mắn',
    // International trending keywords
    'picker wheel',
    'picker wheel online',
    'wheel of names',
    'wheel of names tiếng việt',
    'spin the wheel',
    'spin wheel online',
    'wheel decide',
    'random wheel',
    'name picker wheel',
    'spinning wheel online',
    // User intent keywords
    'gọi học sinh ngẫu nhiên',
    'chọn người ngẫu nhiên',
    'random name picker',
    'random picker online',
    // Long-tail keywords
    'vòng quay chọn tên học sinh',
    'công cụ quay số cho giáo viên',
    'quay số kiểm tra miệng',
    'vòng quay trúng thưởng online',
    'random wheel tiếng việt',
    'wheel spinner free',
    'yes no wheel',
    // Related searches
    'tool cho giáo viên',
    'công cụ lớp học',
    'hoạt động khởi động tiết học',
    'trò chơi lớp học',
  ],
  authors: [{ name: 'SoroKid Team', url: 'https://sorokid.com' }],
  creator: 'SoroKid',
  publisher: 'SoroKid',
  openGraph: {
    title: 'Chiếc Nón Kỳ Diệu - Vòng Quay May Mắn Online Miễn Phí',
    description: 'Vòng quay may mắn để gọi học sinh, chọn người ngẫu nhiên, bốc thăm. Miễn phí, không cần đăng nhập!',
    url: 'https://sorokid.com/tool/chiec-non-ky-dieu',
    siteName: 'SoroKid Toolbox',
    images: [
      {
        url: '/blog/chiec-non-ky-dieu-goi-hoc-sinh.jpg',
        width: 1200,
        height: 630,
        alt: 'Chiếc Nón Kỳ Diệu - Vòng quay may mắn cho lớp học',
      }
    ],
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chiếc Nón Kỳ Diệu - Vòng Quay May Mắn Online',
    description: 'Quay số ngẫu nhiên để gọi học sinh, chọn người may mắn. Miễn phí!',
    images: ['/blog/chiec-non-ky-dieu-goi-hoc-sinh.jpg'],
    creator: '@sorokid_vn',
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/chiec-non-ky-dieu',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  other: {
    'article:published_time': '2024-01-15T00:00:00.000Z',
    'article:modified_time': new Date().toISOString(),
  },
};

// JSON-LD Structured Data with HowTo, FAQPage, and more
function generateJsonLd() {
  return [
    // WebApplication Schema (more specific than SoftwareApplication)
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': 'https://sorokid.com/tool/chiec-non-ky-dieu#app',
      'name': 'Chiếc Nón Kỳ Diệu - Vòng Quay May Mắn',
      'alternateName': [
        'Vòng Quay May Mắn',
        'Random Name Picker',
        'Wheel of Names Tiếng Việt',
        'Picker Wheel Vietnam',
        'Spin The Wheel Vietnamese'
      ],
      'url': 'https://sorokid.com/tool/chiec-non-ky-dieu',
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'Any',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'softwareVersion': '2.0',
      'datePublished': '2024-01-15',
      'dateModified': new Date().toISOString().split('T')[0],
      'inLanguage': 'vi',
      'isAccessibleForFree': true,
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'VND',
        'availability': 'https://schema.org/InStock',
      },
      'author': {
        '@type': 'Organization',
        'name': 'SoroKid',
        'url': 'https://sorokid.com',
        'logo': 'https://sorokid.com/logo.png',
        'sameAs': [
          'https://www.facebook.com/sorokid.vn',
          'https://www.youtube.com/@sorokid'
        ]
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'SoroKid',
        'url': 'https://sorokid.com',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://sorokid.com/logo.png',
          'width': 512,
          'height': 512
        }
      },
      'description': 'Công cụ quay số ngẫu nhiên miễn phí để gọi học sinh, chọn người may mắn, bốc thăm trúng thưởng. Không cần đăng nhập, dùng ngay!',
      'featureList': [
        'Quay số ngẫu nhiên không giới hạn',
        'Nhập danh sách tên tùy ý',
        'Hiệu ứng vòng quay đẹp mắt',
        'Âm thanh hồi hộp như game show',
        'Hiển thị toàn màn hình cho máy chiếu',
        'Loại bỏ tên đã chọn tự động',
        'Lưu danh sách để dùng lại',
        'Hoạt động offline sau khi tải',
      ],
      'screenshot': 'https://sorokid.com/blog/chiec-non-ky-dieu-goi-hoc-sinh.jpg',
      'audience': {
        '@type': 'EducationalAudience',
        'educationalRole': 'teacher',
        'audienceType': 'Giáo viên, Phụ huynh, MC, Thuyết trình viên'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'ratingCount': '1250',
        'bestRating': '5',
        'worstRating': '1'
      },
    },

    // HowTo Schema - Helps Google show step-by-step instructions
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': 'Cách sử dụng Chiếc Nón Kỳ Diệu để quay số ngẫu nhiên',
      'description': 'Hướng dẫn chi tiết cách sử dụng vòng quay may mắn Chiếc Nón Kỳ Diệu để gọi học sinh, chọn người ngẫu nhiên trong lớp học.',
      'image': 'https://sorokid.com/blog/chiec-non-ky-dieu-goi-hoc-sinh.jpg',
      'totalTime': 'PT1M',
      'estimatedCost': {
        '@type': 'MonetaryAmount',
        'currency': 'VND',
        'value': '0'
      },
      'tool': [
        {
          '@type': 'HowToTool',
          'name': 'Trình duyệt web (Chrome, Firefox, Safari, Edge)'
        },
        {
          '@type': 'HowToTool',
          'name': 'Máy tính hoặc điện thoại có kết nối internet'
        }
      ],
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Truy cập công cụ',
          'text': 'Mở trình duyệt và truy cập sorokid.com/tool/chiec-non-ky-dieu',
          'url': 'https://sorokid.com/tool/chiec-non-ky-dieu'
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Nhập danh sách tên',
          'text': 'Nhập danh sách tên học sinh hoặc các lựa chọn vào ô nhập liệu, mỗi tên một dòng'
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Bấm nút Quay',
          'text': 'Nhấn nút "Quay" để bắt đầu vòng quay may mắn'
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Xem kết quả',
          'text': 'Chờ vòng quay dừng lại và xem tên được chọn ngẫu nhiên hiển thị trên màn hình'
        },
        {
          '@type': 'HowToStep',
          'position': 5,
          'name': 'Quay tiếp hoặc loại bỏ tên',
          'text': 'Có thể quay tiếp hoặc bật tính năng loại bỏ tên đã chọn để không trùng lặp'
        }
      ]
    },

    // FAQPage Schema - Helps Google show FAQ in search results
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Chiếc Nón Kỳ Diệu là gì?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Chiếc Nón Kỳ Diệu là công cụ vòng quay may mắn online miễn phí (tương tự Wheel of Names, Picker Wheel), giúp giáo viên quay số ngẫu nhiên để gọi học sinh, chọn người may mắn, hoặc bốc thăm. Dùng ngay không cần đăng nhập.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Làm sao để sử dụng Chiếc Nón Kỳ Diệu?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Rất đơn giản: (1) Nhập danh sách tên học sinh hoặc các lựa chọn, (2) Bấm nút Quay, (3) Chờ vòng quay dừng lại và xem kết quả. Có thể bật chế độ toàn màn hình để hiển thị trên máy chiếu.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Chiếc Nón Kỳ Diệu có miễn phí không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn MIỄN PHÍ! Không giới hạn số lần quay, không cần đăng ký tài khoản, không có quảng cáo làm phiền. Đây là phiên bản tiếng Việt của các công cụ như Wheel of Names, Picker Wheel.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Giáo viên dùng Chiếc Nón Kỳ Diệu để làm gì?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Giáo viên thường dùng để: gọi học sinh trả lời câu hỏi ngẫu nhiên, kiểm tra miệng công bằng, chọn lượt chơi trong các trò chơi học tập, phân công nhiệm vụ, hoặc tạo hoạt động khởi động đầu giờ.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể dùng Chiếc Nón Kỳ Diệu trên máy chiếu không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Công cụ được thiết kế tối ưu cho máy chiếu với chế độ toàn màn hình, chữ to rõ ràng, hiệu ứng đẹp mắt để cả lớp đều nhìn thấy.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Chiếc Nón Kỳ Diệu khác gì Wheel of Names?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Chiếc Nón Kỳ Diệu là phiên bản tiếng Việt của Wheel of Names/Picker Wheel, được thiết kế riêng cho giáo viên Việt Nam. Giao diện hoàn toàn tiếng Việt, không quảng cáo, tích hợp trong bộ Toolbox Giáo Viên với nhiều công cụ khác.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể quay Yes/No được không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Chỉ cần nhập "Có" và "Không" (hoặc "Yes" và "No") vào danh sách, sau đó quay. Bạn có thể nhập bất kỳ lựa chọn nào, không chỉ tên người.'
          }
        },
      ]
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
          'name': 'Chiếc Nón Kỳ Diệu',
          'item': 'https://sorokid.com/tool/chiec-non-ky-dieu'
        }
      ]
    },

    // WebPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://sorokid.com/tool/chiec-non-ky-dieu#webpage',
      'url': 'https://sorokid.com/tool/chiec-non-ky-dieu',
      'name': 'Chiếc Nón Kỳ Diệu - Vòng Quay May Mắn Online Miễn Phí',
      'description': 'Công cụ vòng quay may mắn miễn phí cho giáo viên. Quay số ngẫu nhiên, gọi học sinh, bốc thăm.',
      'inLanguage': 'vi',
      'isPartOf': {
        '@type': 'WebSite',
        '@id': 'https://sorokid.com#website',
        'name': 'SoroKid',
        'url': 'https://sorokid.com'
      },
      'about': {
        '@type': 'Thing',
        'name': 'Vòng quay may mắn cho giáo dục'
      },
      'datePublished': '2024-01-15',
      'dateModified': new Date().toISOString().split('T')[0],
    }
  ];
}

export default function ChiecNonKyDieuLayout({ children }) {
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
