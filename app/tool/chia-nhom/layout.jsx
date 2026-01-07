/**
 * 👥 Chia Nhóm - SEO Metadata (Advanced Optimized)
 *
 * Target keywords:
 * - "chia nhóm ngẫu nhiên" - 1,900 searches/month
 * - "chia nhóm online" - 1,200 searches/month
 * - "random group generator" - 880 searches/month
 * - "team generator" - 720 searches/month
 *
 * International keywords:
 * - "random group generator" - trending
 * - "team maker online" - global
 * - "random team generator" - popular
 * - "group randomizer" - educational
 */

export const metadata = {
  title: 'Chia Nhóm Ngẫu Nhiên Online - Random Group Generator | Miễn Phí',
  description: 'Chia Nhóm Ngẫu Nhiên Online - Random group generator MIỄN PHÍ cho lớp học. Chia theo số nhóm hoặc số người, tự động chọn nhóm trưởng. Team maker online công bằng, nhanh 10 giây!',
  keywords: [
    // Primary keywords
    'chia nhóm ngẫu nhiên',
    'chia nhóm ngẫu nhiên online',
    'chia nhóm online',
    'random group generator',
    'team generator',
    'group generator',
    // International keywords (trending globally)
    'random group generator online',
    'team maker online',
    'random team generator',
    'group randomizer',
    'team randomizer online',
    'random team picker',
    'group creator online',
    // User intent keywords
    'tạo nhóm học tập',
    'chia team ngẫu nhiên',
    'chia đội ngẫu nhiên',
    'nhóm học sinh',
    // Long-tail keywords
    'công cụ chia nhóm cho giáo viên',
    'chia nhóm thảo luận lớp học',
    'chia nhóm làm project',
    'random group generator tiếng việt',
    'chia nhóm công bằng online',
    'tạo nhóm ngẫu nhiên miễn phí',
    // Related searches
    'team picker online',
    'chia team làm việc nhóm',
    'hoạt động nhóm lớp học',
  ],
  openGraph: {
    title: 'Chia Nhóm Ngẫu Nhiên - Random Group Generator Miễn Phí',
    description: 'Random group generator - Chia nhóm công bằng trong 10 giây! Tự động chọn nhóm trưởng. Team maker online miễn phí!',
    url: 'https://sorokid.com/tool/chia-nhom',
    siteName: 'SoroKid Toolbox',
    images: [
      {
        url: '/blog/chia-nhom-hoc-sinh.jpg',
        width: 1200,
        height: 630,
        alt: 'Chia Nhóm Ngẫu Nhiên - Random Group Generator',
      }
    ],
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chia Nhóm - Random Group Generator Online',
    description: 'Team maker - chia nhóm công bằng, tự động chọn nhóm trưởng. Miễn phí!',
    images: ['/blog/chia-nhom-hoc-sinh.jpg'],
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/chia-nhom',
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
      'name': 'Chia Nhóm Ngẫu Nhiên - Random Group Generator',
      'alternateName': ['Random Group Generator', 'Team Maker Online', 'Group Randomizer', 'Random Team Generator'],
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'Web Browser',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'VND',
      },
      'description': 'Công cụ chia nhóm học sinh ngẫu nhiên, công bằng, tự động chọn nhóm trưởng. Random group generator phù hợp lớp đông học sinh. Team maker online miễn phí.',
      'featureList': [
        'Chia theo số nhóm hoặc số người mỗi nhóm',
        'Tự động chọn nhóm trưởng ngẫu nhiên',
        'Hiển thị kết quả rõ ràng, dễ đọc',
        'Lưu danh sách để dùng lại',
        'Chia lại nhanh chỉ 1 click',
        'Xuất danh sách nhóm',
        'Hiển thị toàn màn hình',
      ],
      'audience': {
        '@type': 'EducationalAudience',
        'educationalRole': 'teacher',
      },
      'educationalUse': [
        'Tổ chức thảo luận nhóm',
        'Chia team làm project',
        'Hoạt động học tập hợp tác',
        'Chia đội thi đua',
        'Workshop và team building',
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'ratingCount': '1650',
        'bestRating': '5',
      },
      'datePublished': '2024-02-01',
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
      'name': 'Cách chia nhóm ngẫu nhiên cho lớp học',
      'description': 'Hướng dẫn chia nhóm học sinh công bằng chỉ trong 10 giây',
      'totalTime': 'PT1M',
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Nhập danh sách tên',
          'text': 'Nhập hoặc dán danh sách tên học sinh, mỗi tên một dòng hoặc phân cách bằng dấu phẩy',
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Chọn cách chia',
          'text': 'Chọn chia theo số nhóm (VD: 5 nhóm) hoặc số người mỗi nhóm (VD: 4 người/nhóm)',
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Bật chọn nhóm trưởng',
          'text': 'Tùy chọn bật/tắt tự động chọn nhóm trưởng ngẫu nhiên cho mỗi nhóm',
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Bấm Chia Nhóm',
          'text': 'Bấm nút Chia Nhóm, kết quả hiện ra ngay với hiệu ứng đẹp mắt',
        },
        {
          '@type': 'HowToStep',
          'position': 5,
          'name': 'Xem hoặc xuất kết quả',
          'text': 'Chiếu kết quả lên máy chiếu hoặc xuất file để chia sẻ với học sinh',
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
          'name': 'Làm sao chia nhóm ngẫu nhiên?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Rất đơn giản: (1) Nhập hoặc dán danh sách tên học sinh, (2) Chọn số nhóm muốn chia hoặc số người mỗi nhóm, (3) Bấm nút Chia Nhóm. Kết quả hiện ra ngay trong 2 giây!'
          }
        },
        {
          '@type': 'Question',
          'name': 'Random Group Generator này khác gì tool khác?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Random Group Generator của SoroKid có thêm tính năng tự động chọn nhóm trưởng, giao diện tiếng Việt thân thiện, lưu danh sách để dùng lại, và hoàn toàn miễn phí không quảng cáo.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể tự động chọn nhóm trưởng không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Chỉ cần bật tính năng "Chọn nhóm trưởng", công cụ sẽ tự động chọn ngẫu nhiên 1 người làm nhóm trưởng trong mỗi nhóm. Tên nhóm trưởng được đánh dấu rõ ràng.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Chia nhóm có công bằng không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn công bằng! Thuật toán chia nhóm đảm bảo mỗi lần chia đều ngẫu nhiên 100%, không thiên vị. Phù hợp để chia nhóm thảo luận, làm project, hoặc chia đội thi đua.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể lưu danh sách để dùng lại không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Công cụ tự động lưu danh sách tên vào trình duyệt. Lần sau chỉ cần mở lại là có sẵn, không cần nhập lại. Cũng có thể xuất kết quả chia nhóm ra file.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Phù hợp lớp bao nhiêu học sinh?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Không giới hạn! Công cụ hoạt động tốt với lớp 30-50 học sinh hoặc hơn. Đặc biệt hữu ích cho giáo viên THPT khi cần chia nhóm nhanh trong tiết học.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Team Maker này có miễn phí không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn MIỄN PHÍ! Không giới hạn số lần chia, số học sinh, không cần đăng ký tài khoản.'
          }
        },
      ]
    },
    // WebPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Chia Nhóm Ngẫu Nhiên - Random Group Generator Online',
      'description': 'Random group generator online miễn phí. Team maker công bằng với tự động chọn nhóm trưởng.',
      'url': 'https://sorokid.com/tool/chia-nhom',
      'inLanguage': 'vi-VN',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'SoroKid Toolbox',
        'url': 'https://sorokid.com',
      },
      'about': {
        '@type': 'Thing',
        'name': 'Random Group Generator',
      },
      'datePublished': '2024-02-01',
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
          'name': 'Chia Nhóm Ngẫu Nhiên',
          'item': 'https://sorokid.com/tool/chia-nhom'
        }
      ]
    }
  ];
}

export default function ChiaNhomLayout({ children }) {
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
