/**
 * 🏁 Cuộc Đua Kì Thú - SEO Metadata (Advanced Optimized)
 *
 * Target keywords:
 * - "cuộc đua kì thú" - 1,600 searches/month
 * - "scoreboard lớp học" - 880 searches/month
 * - "chấm điểm nhóm" - 720 searches/month
 * - "game thi đua" - 590 searches/month
 *
 * International keywords:
 * - "classroom scoreboard" - trending
 * - "team scoreboard" - popular
 * - "classroom points tracker" - educational
 * - "gamification classroom" - global
 * 
 * 🚀 TỐI ƯU: Static generation - 0 server process
 */

// ============ STATIC CONFIG ============
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Cuộc Đua Kì Thú - Classroom Scoreboard | Chấm Điểm Nhóm Miễn Phí',
  description: 'Cuộc Đua Kì Thú - Classroom scoreboard MIỄN PHÍ cho lớp học. Chấm điểm theo nhóm/cá nhân với hiệu ứng cuộc đua sôi động. Team scoreboard trực quan, gamification tạo động lực học tập!',
  keywords: [
    // Primary keywords
    'cuộc đua kì thú',
    'cuộc đua kì thú lớp học',
    'scoreboard lớp học',
    'scoreboard online',
    'chấm điểm nhóm',
    // International keywords (trending globally)
    'classroom scoreboard',
    'classroom scoreboard online',
    'team scoreboard',
    'classroom points tracker',
    'gamification classroom',
    'points tracker for students',
    'classroom leaderboard',
    // Game/competition keywords
    'game thi đua',
    'game thi đua lớp học',
    'bảng điểm thi đua',
    'thi đua điểm số',
    // Long-tail keywords
    'công cụ chấm điểm cho giáo viên',
    'scoreboard thi đua nhóm',
    'game thi đua điểm số online',
    'bảng điểm lớp học trực quan',
    'gamification điểm số',
    'cuộc đua kì thú online miễn phí',
    // Related searches
    'tạo động lực học tập',
    'quản lý hành vi lớp học',
    'công cụ giáo viên',
    'ClassDojo alternative',
  ],
  openGraph: {
    title: 'Cuộc Đua Kì Thú - Classroom Scoreboard Online',
    description: 'Classroom scoreboard với hiệu ứng cuộc đua! Chấm điểm nhóm/cá nhân. Team scoreboard miễn phí!',
    url: 'https://sorokid.com/tool/cuoc-dua-ki-thu',
    siteName: 'SoroKid Toolbox',
    images: [
      {
        url: '/blog/cuoc-dua-ki-thu-bien-lop-hoc-thanh-duong-dua.png',
        width: 1200,
        height: 630,
        alt: 'Cuộc Đua Kì Thú - Classroom Scoreboard',
      }
    ],
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cuộc Đua Kì Thú - Classroom Scoreboard',
    description: 'Team scoreboard - Game thi đua điểm số cho lớp học. Miễn phí!',
    images: ['/blog/cuoc-dua-ki-thu-bien-lop-hoc-thanh-duong-dua.png'],
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/cuoc-dua-ki-thu',
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
      'name': 'Cuộc Đua Kì Thú - Classroom Scoreboard',
      'alternateName': ['Classroom Scoreboard', 'Team Scoreboard', 'Classroom Points Tracker', 'Gamification Classroom'],
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'Web Browser',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'VND',
      },
      'description': 'Game thi đua điểm số trực quan với hiệu ứng cuộc đua. Classroom scoreboard chấm điểm theo nhóm hoặc cá nhân, tạo động lực học tập. Team scoreboard miễn phí.',
      'featureList': [
        '2 chế độ: Đua theo NHÓM hoặc CÁ NHÂN',
        '4 loại nhân vật: Xe cộ, Động vật, Người, Tàu vũ trụ',
        'Cộng/trừ điểm nhanh: +1, +5, +10, -1, -5',
        'Hiệu ứng vượt lên khi dẫn đầu',
        'Confetti khi đạt top 1',
        'Undo thao tác vừa rồi',
        'Tự động lưu điểm số',
        'Chế độ toàn màn hình',
      ],
      'audience': {
        '@type': 'EducationalAudience',
        'educationalRole': 'teacher',
      },
      'educationalUse': [
        'Thi đua nhóm trong tiết học',
        'Chấm điểm cộng dồn cả tuần/tháng',
        'Khuyến khích tham gia trả lời',
        'Ôn tập với game thi đua',
        'Quản lý hành vi tích cực',
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'ratingCount': '1890',
        'bestRating': '5',
      },
      'datePublished': '2024-01-25',
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
      'name': 'Cách sử dụng Cuộc Đua Kì Thú trong lớp học',
      'description': 'Hướng dẫn giáo viên sử dụng classroom scoreboard để tạo động lực học tập',
      'totalTime': 'PT2M',
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Chọn chế độ chơi',
          'text': 'Chọn thi đua theo NHÓM (3-6 team) hoặc CÁ NHÂN (mỗi học sinh một track)',
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Đặt tên nhóm/người chơi',
          'text': 'Nhập tên các nhóm hoặc tên học sinh tham gia thi đua',
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Chọn nhân vật',
          'text': 'Chọn loại nhân vật đua: xe cộ, động vật, người, hoặc tàu vũ trụ',
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Chiếu và bắt đầu chơi',
          'text': 'Mở toàn màn hình, chiếu lên máy chiếu. Cộng/trừ điểm khi học sinh trả lời đúng/sai',
        },
        {
          '@type': 'HowToStep',
          'position': 5,
          'name': 'Xem kết quả cuộc đua',
          'text': 'Nhân vật sẽ tiến về phía trước theo điểm. Người dẫn đầu có hiệu ứng đặc biệt và confetti!',
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
          'name': 'Cuộc Đua Kì Thú khác gì bảng điểm thông thường?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Thay vì chỉ hiển thị số điểm, Cuộc Đua Kì Thú biến điểm số thành cuộc đua trực quan. Khi được cộng điểm, nhân vật (xe, động vật...) sẽ chạy về phía trước. Học sinh nhìn thấy ai đang dẫn đầu, ai đang đuổi kịp - tạo động lực cạnh tranh lành mạnh.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Classroom Scoreboard này khác gì ClassDojo?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Cuộc Đua Kì Thú là alternative miễn phí cho ClassDojo, tập trung vào gamification với hiệu ứng cuộc đua trực quan. Không cần đăng ký tài khoản, hoàn toàn miễn phí, không giới hạn tính năng.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể thi đua cá nhân được không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Có 2 chế độ: thi đua theo NHÓM (chia lớp thành 3-6 team) hoặc CÁ NHÂN (mỗi học sinh một track). Chế độ cá nhân phù hợp lớp nhỏ, chế độ nhóm phù hợp lớp đông.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Điểm có lưu lại được không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Điểm tự động lưu vào trình duyệt. Bạn có thể tiếp tục từ điểm cũ ở tiết sau, hoặc reset về 0 để bắt đầu mới.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Giáo viên dùng Cuộc Đua Kì Thú khi nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Phù hợp: thi đua trả lời câu hỏi trong tiết học, chấm điểm cộng dồn cả tuần (team nào top 1 cuối tuần được thưởng), ôn tập trước kiểm tra với game thi đua, hoặc khuyến khích hành vi tích cực (đúng giờ +1, làm bài xong sớm +2...).'
          }
        },
        {
          '@type': 'Question',
          'name': 'Classroom Scoreboard có miễn phí không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn MIỄN PHÍ! Không giới hạn số nhóm, số lần chơi, không cần đăng ký tài khoản.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có thể dùng cho team building không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Rất phù hợp! Cuộc Đua Kì Thú là team scoreboard tuyệt vời cho team building, workshop, hoặc bất kỳ hoạt động nhóm nào cần thi đua điểm số sôi động.'
          }
        },
      ]
    },
    // WebPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Cuộc Đua Kì Thú - Classroom Scoreboard | Team Points Tracker',
      'description': 'Classroom scoreboard online với hiệu ứng cuộc đua. Team scoreboard miễn phí cho gamification lớp học.',
      'url': 'https://sorokid.com/tool/cuoc-dua-ki-thu',
      'inLanguage': 'vi-VN',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'SoroKid Toolbox',
        'url': 'https://sorokid.com',
      },
      'about': {
        '@type': 'Thing',
        'name': 'Classroom Scoreboard',
      },
      'datePublished': '2024-01-25',
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
          'name': 'Cuộc Đua Kì Thú',
          'item': 'https://sorokid.com/tool/cuoc-dua-ki-thu'
        }
      ]
    }
  ];
}

export default function CuocDuaKiThuLayout({ children }) {
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
