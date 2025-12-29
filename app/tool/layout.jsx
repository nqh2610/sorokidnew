/**
 * 🎯 TOOLBOX LAYOUT
 * 
 * Layout cho tất cả trang tool với SEO metadata
 * Tối ưu cho: Google, Bing, AI Search
 * 
 * ĐỐI TƯỢNG SỬ DỤNG:
 * - GIÁO VIÊN: Tạo lớp học sôi nổi, học sinh tham gia chủ động
 * - PHỤ HUYNH: Tự tạo bài tập, chơi cùng con học tại nhà
 * - THUYẾT TRÌNH/HỌP: Tạo tương tác khán giả, workshop, team building
 * 
 * MỐI LIÊN HỆ VỚI SOROKID:
 * - SoroKid là nền tảng giáo dục Soroban
 * - Toolbox ban đầu xây dựng cho giáo viên dạy Soroban
 * - Mở rộng cho giáo viên, phụ huynh, thuyết trình, họp nhóm
 */

export const metadata = {
  title: {
    default: 'Toolbox Đa Năng - Công Cụ Tương Tác Miễn Phí | SoroKid',
    template: '%s | Toolbox - SoroKid',
  },
  description: 'Toolbox by SoroKid - BỘ SƯU TẬP TRÒ CHƠI QUỐC DÂN phổ biến nhất trong lớp học Việt Nam, tập trung tại MỘT ĐỊA CHỈ. Ai Là Triệu Phú, Chiếc Nón Kỳ Diệu, Ô Chữ, Đua Thú... Miễn phí, cập nhật thường xuyên. LƯU BOOKMARK ngay!',
  keywords: [
    // Keywords Toolbox chính
    'công cụ dạy học tích cực',
    'toolbox giáo viên',
    'trò chơi học tập',
    'hoạt động lớp học',
    'quay số ngẫu nhiên',
    'chia nhóm học sinh',
    'đồng hồ bấm giờ lớp học',
    'game tương tác lớp học',
    'công cụ cho giáo viên THPT',
    'hoạt động khởi động tiết học',
    // Keywords liên kết SoroKid
    'sorokid toolbox',
    'active learning',
    'gamification giáo dục',
    'công cụ giáo viên miễn phí',
    // Keywords cho Phụ huynh
    'phụ huynh kèm con học',
    'tự tạo bài tập cho con',
    'chơi cùng con học toán',
    'dạy con học tại nhà',
    // Keywords cho Thuyết trình, Họp, Workshop
    'công cụ thuyết trình tương tác',
    'tool họp nhóm sôi nổi',
    'ice breaker cuộc họp',
    'game team building',
    'workshop tương tác',
    'quay số chọn người trả lời',
    'chia nhóm thảo luận',
    'gamification thuyết trình',
    // Keywords trò chơi quốc dân
    'trò chơi quốc dân lớp học',
    'tổng hợp game lớp học',
    'bộ sưu tập trò chơi giáo dục',
  ],
  authors: [{ name: 'Sorokid Team', url: 'https://sorokid.com' }],
  creator: 'Sorokid',
  publisher: 'Sorokid',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Toolbox Giáo Viên - Công Cụ Dạy Học Tích Cực Miễn Phí',
    description: 'Bộ công cụ miễn phí giúp giáo viên tổ chức hoạt động học tập vui nhộn. Quay số, chia nhóm, bấm giờ, game tương tác.',
    url: 'https://sorokid.com/tool',
    siteName: 'Sorokid',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/og-toolbox.png',
        width: 1200,
        height: 630,
        alt: 'Toolbox Giáo Viên - Công cụ dạy học tích cực miễn phí',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toolbox Giáo Viên - Công Cụ Dạy Học Tích Cực Miễn Phí',
    description: 'Bộ công cụ dạy học tích cực miễn phí cho giáo viên các cấp. Quay số, chia nhóm, bấm giờ, trò chơi học tập.',
    images: ['/og-toolbox.png'],
    creator: '@sorokid',
  },
  alternates: {
    canonical: 'https://sorokid.com/tool',
  },
  category: 'education',
  classification: 'Educational Tools',
};

// JSON-LD Structured Data cho Tool pages
export function generateToolboxJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // WebApplication Schema
      {
        '@type': 'WebApplication',
        '@id': 'https://sorokid.com/tool#webapp',
        'name': 'Toolbox Giáo Viên - SoroKid',
        'alternateName': ['SoroKid Toolbox', 'Công cụ dạy học tích cực', 'Teacher Tools SoroKid'],
        'url': 'https://sorokid.com/tool',
        'applicationCategory': 'EducationalApplication',
        'applicationSubCategory': 'Teaching Tools',
        'operatingSystem': 'Web Browser',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'VND',
          'availability': 'https://schema.org/InStock',
        },
        'audience': {
          '@type': 'EducationalAudience',
          'educationalRole': 'teacher',
          'audienceType': 'Giáo viên Việt Nam các cấp: Mầm non, Tiểu học, THCS, THPT',
        },
        'description': 'Toolbox Giáo Viên là bộ công cụ dạy học tích cực miễn phí, được phát triển bởi SoroKid - nền tảng giáo dục Soroban. Ban đầu xây dựng để hỗ trợ giáo viên dạy Soroban tạo lớp học sôi nổi (quay số gọi học sinh, chia nhóm thi đua, bấm giờ...). Nhận thấy các công cụ này hữu ích cho TẤT CẢ giáo viên, SoroKid mở rộng Toolbox thành bộ công cụ phổ quát cho giáo viên mọi môn, mọi cấp - từ Mầm non đến THPT.',
        'featureList': [
          'Chiếc Nón Kỳ Diệu - Quay số gọi học sinh ngẫu nhiên',
          'Chia Nhóm - Chia nhóm học tập nhanh, công bằng',
          'Đồng Hồ Bấm Giờ - Timer cho hoạt động lớp học',
          'Bốc Thăm - Random picker với hiệu ứng slot machine',
          'Đua Thú Hoạt Hình - Game đua thi đua nhóm',
          'Cuộc Đua Kì Thú - Bảng xếp hạng thi đua điểm số',
          'Ai Là Triệu Phú - Game show kiểm tra kiến thức',
          'Xúc Xắc 3D - Gieo xúc xắc cho hoạt động ngẫu nhiên',
          'Flash ZAN - Luyện tính nhẩm nhanh Soroban',
          'Bàn Tính Soroban Ảo - Luyện tập Soroban online',
          'Đèn May Mắn - Trò chơi may mắn tạo tiếng cười',
          'Trò Chơi Ô Chữ - Crossword ôn tập từ vựng',
        ],
        'screenshot': 'https://sorokid.com/og-toolbox.png',
        'isPartOf': {
          '@type': 'WebSite',
          'name': 'SoroKid',
          'url': 'https://sorokid.com'
        },
        'creator': {
          '@type': 'Organization',
          'name': 'SoroKid',
          'url': 'https://sorokid.com'
        },
        'teaches': [
          'Active Learning - Dạy học tích cực',
          'Gamification - Game hóa trong giáo dục',
          'Student Engagement - Thu hút học sinh tham gia'
        ],
        'softwareHelp': {
          '@type': 'CreativeWork',
          'name': 'Hướng dẫn sử dụng Toolbox Giáo Viên',
          'url': 'https://sorokid.com/blog/huong-dan-toolbox',
        },
      },
      // ItemList Schema cho các tool
      {
        '@type': 'ItemList',
        '@id': 'https://sorokid.com/tool#tools',
        'name': 'Danh sách công cụ dạy học',
        'description': 'Các công cụ dạy học tích cực miễn phí cho giáo viên',
        'numberOfItems': 8,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Chiếc Nón Kỳ Diệu',
            'description': 'Quay số ngẫu nhiên để gọi học sinh',
            'url': 'https://sorokid.com/tool/chiec-non-ky-dieu',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Đua Vịt Sông Nước',
            'description': 'Trò chơi đua vịt hồi hộp cho lớp học',
            'url': 'https://sorokid.com/tool/dua-thu-hoat-hinh',
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': 'Flash ZAN',
            'description': 'Luyện tính nhẩm nhanh với flash số',
            'url': 'https://sorokid.com/tool/flash-zan',
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': 'Đồng Hồ Bấm Giờ',
            'description': 'Timer đếm ngược cho lớp học',
            'url': 'https://sorokid.com/tool/dong-ho-bam-gio',
          },
          {
            '@type': 'ListItem',
            'position': 5,
            'name': 'Chia Nhóm',
            'description': 'Chia nhóm học sinh ngẫu nhiên',
            'url': 'https://sorokid.com/tool/chia-nhom',
          },
          {
            '@type': 'ListItem',
            'position': 6,
            'name': 'Bốc Thăm',
            'description': 'Bốc thăm ngẫu nhiên với hiệu ứng slot',
            'url': 'https://sorokid.com/tool/boc-tham',
          },
          {
            '@type': 'ListItem',
            'position': 7,
            'name': 'Bàn Tính Soroban',
            'description': 'Bàn tính ảo để luyện tập',
            'url': 'https://sorokid.com/tool/ban-tinh-soroban',
          },
          {
            '@type': 'ListItem',
            'position': 8,
            'name': 'Đèn May Mắn',
            'description': 'Trò chơi đèn giao thông may mắn',
            'url': 'https://sorokid.com/tool/den-may-man',
          },
        ],
      },
      // FAQPage Schema - Mở rộng để AI Search có thể gợi ý
      {
        '@type': 'FAQPage',
        '@id': 'https://sorokid.com/tool#faq',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Toolbox giáo viên miễn phí có những công cụ gì?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Toolbox Giáo Viên của Sorokid có 8 công cụ miễn phí: Chiếc Nón Kỳ Diệu (quay số), Đua Thú (game đua), Flash ZAN (tính nhẩm), Đồng Hồ Bấm Giờ (timer), Chia Nhóm (tạo nhóm), Bốc Thăm (random picker), Bàn Tính Soroban (bàn tính ảo), và Đèn May Mắn (trò chơi xanh đỏ). Tất cả đều miễn phí và không cần đăng ký.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Công cụ nào phù hợp để quản lý lớp THPT?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Với lớp THPT, các công cụ phù hợp nhất là: Đồng Hồ Bấm Giờ để kiểm soát thời gian thuyết trình, Chia Nhóm để tạo nhóm thảo luận nhanh, Chiếc Nón Kỳ Diệu để gọi học sinh ngẫu nhiên tránh thiên vị, và Bốc Thăm để random thứ tự trình bày. Các công cụ này giúp tăng tương tác và giữ sự công bằng trong lớp học.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Có cần cài đặt phần mềm để sử dụng không?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Không cần cài đặt! Toolbox Giáo Viên chạy hoàn toàn trên trình duyệt web. Bạn chỉ cần truy cập sorokid.com/tool là có thể sử dụng ngay. Hoạt động tốt trên máy tính, laptop, tablet và điện thoại. Khuyến nghị sử dụng Chrome, Firefox hoặc Edge để có trải nghiệm tốt nhất.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Làm sao để tạo trò chơi học tập cho học sinh?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Bạn có thể tạo trò chơi học tập bằng cách: 1) Sử dụng Đua Thú Hoạt Hình để tạo cuộc đua giữa các nhóm, 2) Dùng Đèn May Mắn cho trò chơi phản xạ, 3) Kết hợp Chiếc Nón Kỳ Diệu với câu hỏi để tạo game hỏi đáp, 4) Sử dụng Flash ZAN để tổ chức thi tính nhẩm. Mỗi công cụ có hướng dẫn chi tiết trên trang.',
            },
          },
          // MỚI: FAQ về phương pháp dạy học
          {
            '@type': 'Question',
            'name': 'Phương pháp dạy học tích cực là gì và áp dụng thế nào?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Phương pháp dạy học tích cực (Active Learning) là cách dạy học sinh tham gia chủ động vào bài học. Toolbox Giáo Viên hỗ trợ bằng các công cụ tương tác: quay số gọi học sinh bất kỳ, chia nhóm thảo luận, game học tập. Học sinh không còn ngồi nghe thụ động mà được tham gia, tương tác, học qua trải nghiệm.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Làm sao để xây dựng lớp học tích cực?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Lớp học tích cực cần: 1) Mọi học sinh đều có cơ hội tham gia - dùng Chiếc Nón Kỳ Diệu quay số ngẫu nhiên, 2) Hoạt động nhóm hiệu quả - dùng Chia Nhóm và Bấm Giờ, 3) Yếu tố vui nhộn - dùng game Đua Vịt, Đèn May Mắn, 4) Phản hồi nhanh - dùng Bốc Thăm cho kiểm tra. Tất cả miễn phí tại sorokid.com/tool.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Gamification trong giáo dục áp dụng như thế nào?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Gamification là đưa yếu tố game vào giảng dạy. Toolbox Giáo Viên cung cấp: Đua Vịt Sông Nước (cuộc đua hồi hộp giữa các nhóm), Đèn May Mắn (trò chơi may rủi thưởng/phạt vui), Chiếc Nón Kỳ Diệu (vòng quay may mắn). Học sinh hứng thú hơn khi học qua game.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Hoạt động khởi động đầu giờ học nên làm gì?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Hoạt động khởi động (warm-up) 3-5 phút đầu giờ rất quan trọng. Gợi ý: 1) Quay Chiếc Nón Kỳ Diệu hỏi nhanh bài cũ, 2) Chơi Flash ZAN tính nhẩm 2 phút, 3) Đèn May Mắn tạo tiếng cười, 4) Đua Vịt nhanh 3 học sinh. Công cụ miễn phí tại sorokid.com/tool.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Game dạy học không cần chuẩn bị trước?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Toolbox Giáo Viên có game dùng ngay không cần chuẩn bị: Đua Vịt (chỉ cần nhập tên), Đèn May Mắn (bấm là chơi), Flash ZAN (chọn cấp độ và bắt đầu). Không cần tạo slide, không cần tài khoản. Mở sorokid.com/tool là dùng được ngay trên máy chiếu.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Công cụ EdTech miễn phí cho giáo viên Việt Nam?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Toolbox Giáo Viên tại sorokid.com/tool là bộ công cụ EdTech miễn phí, thiết kế riêng cho giáo viên Việt Nam. Giao diện tiếng Việt, không cần đăng nhập, tối ưu cho máy chiếu lớp học. Bao gồm 8 công cụ: quay số, chia nhóm, bấm giờ, game học tập, bàn tính Soroban.',
            },
          },
        ],
      },
      // Organization Schema
      {
        '@type': 'Organization',
        '@id': 'https://sorokid.com#organization',
        'name': 'Sorokid',
        'url': 'https://sorokid.com',
        'logo': 'https://sorokid.com/logo.png',
        'description': 'Nền tảng học tập và công cụ dạy học cho giáo viên Việt Nam',
        'sameAs': [
          'https://facebook.com/sorokid',
          'https://youtube.com/sorokid',
        ],
      },
    ],
  };
}

export default function ToolLayout({ children }) {
  const jsonLd = generateToolboxJsonLd();
  
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
