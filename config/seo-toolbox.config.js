/**
 * 🎯 SEO CONFIG - TOOLBOX GIÁO VIÊN
 * 
 * Tối ưu cho:
 * - Google & Bing Search
 * - AI Search (ChatGPT, Gemini, Copilot, Perplexity)
 * - Giáo viên các cấp (đặc biệt THPT)
 * 
 * Cập nhật: 26/12/2024
 */

// ============================================
// PHẦN 1: PHÂN TÍCH TỪ KHÓA
// ============================================

export const KEYWORD_ANALYSIS = {
  // TỪ KHÓA CHÍNH (Primary Keywords)
  primary: [
    'công cụ dạy học tích cực',
    'toolbox giáo viên',
    'trò chơi học tập trên lớp',
    'tool dạy học cho giáo viên',
    'game tương tác lớp học',
  ],

  // TỪ KHÓA PHỤ (Secondary Keywords)
  secondary: [
    'hoạt động khởi động đầu giờ',
    'trò chơi ôn bài cuối tiết',
    'gọi tên học sinh ngẫu nhiên',
    'chia nhóm lớp học nhanh',
    'quay số may mắn cho lớp',
    'đồng hồ bấm giờ lớp học',
    'công cụ máy chiếu lớp học',
    'minigame cho tiết học',
  ],

  // TỪ KHÓA THEO CẤP HỌC
  byGradeLevel: {
    mauNon: [
      'trò chơi cho trẻ mầm non',
      'hoạt động vui cho bé',
      'game đơn giản cho trẻ',
    ],
    tieuHoc: [
      'trò chơi học tập tiểu học',
      'hoạt động lớp học tiểu học',
      'game cho học sinh tiểu học',
      'công cụ dạy học tiểu học',
    ],
    thcs: [
      'trò chơi học tập THCS',
      'hoạt động tương tác THCS',
      'game kiến thức cho THCS',
      'công cụ dạy học THCS',
    ],
    thpt: [
      'hoạt động khởi động THPT',
      'trò chơi ôn tập THPT',
      'game kiến thức THPT',
      'công cụ dạy học THPT',
      'tạo tương tác lớp đông học sinh',
      'giảm căng thẳng tiết học THPT',
      'ôn tập nhanh cho THPT',
      'kiểm tra miệng vui THPT',
    ],
  },

  // LONG-TAIL KEYWORDS (Ưu tiên cao)
  longTail: [
    'cách làm lớp học vui hơn',
    'công cụ gọi học sinh ngẫu nhiên',
    'tạo quiz nhanh cho lớp học',
    'chia nhóm học sinh online',
    'tool quay số cho giáo viên',
    'đồng hồ đếm ngược cho máy chiếu',
    'trò chơi không cần chuẩn bị cho lớp',
    'hoạt động warmup đầu giờ học',
    'game học tập không cần đăng nhập',
    'công cụ miễn phí cho giáo viên',
  ],

  // TỪ KHÓA HÀNH VI TÌM KIẾM
  searchIntent: {
    informational: [
      'cách tổ chức hoạt động nhóm',
      'làm sao để lớp học vui hơn',
      'hoạt động khởi động tiết học là gì',
    ],
    transactional: [
      'tool dạy học miễn phí',
      'tải công cụ cho giáo viên',
      'sử dụng ngay không cần đăng ký',
    ],
    navigational: [
      'sorokid toolbox',
      'công cụ giáo viên sorokid',
    ],
  },
};

// ============================================
// PHẦN 2: SEO TRANG CHÍNH TOOLBOX
// ============================================

export const TOOLBOX_SEO = {
  // URL
  url: 'https://sorokid.com/tool',
  
  // TITLE (50-60 ký tự)
  title: 'Toolbox Giáo Viên - Công Cụ Dạy Học Tích Cực Miễn Phí',
  
  // META DESCRIPTION (150-160 ký tự)
  metaDescription: 'Bộ công cụ dạy học tích cực miễn phí cho giáo viên các cấp. Quay số, chia nhóm, bấm giờ, trò chơi học tập. Không cần đăng nhập, sử dụng ngay trên máy chiếu lớp học.',
  
  // H1
  h1: 'Toolbox Giáo Viên - Công Cụ Dạy Học Tích Cực',
  
  // MÔ TẢ 100-150 TỪ (cho Google, Bing, AI trích dẫn)
  description: `Toolbox Giáo Viên là bộ công cụ dạy học tích cực miễn phí, được thiết kế dành riêng cho giáo viên Việt Nam từ Mầm non đến THPT.

Giáo viên có thể sử dụng các tool này để:
• Khởi động đầu giờ - tạo hứng thú trước khi vào bài mới
• Gọi học sinh ngẫu nhiên - công bằng, không thiên vị
• Chia nhóm nhanh - tiết kiệm thời gian tổ chức
• Ôn bài cuối tiết - củng cố kiến thức qua trò chơi
• Tạo tương tác - học sinh tham gia chủ động

Tất cả tool đều miễn phí, không cần đăng nhập, hoạt động tốt trên máy chiếu và màn hình lớp học. Đặc biệt phù hợp cho giáo viên THPT cần các hoạt động giảm căng thẳng, tăng sự tập trung trong các tiết ôn tập và kiểm tra.`,

  // OPEN GRAPH
  openGraph: {
    title: 'Toolbox Giáo Viên - Công Cụ Dạy Học Tích Cực Miễn Phí',
    description: 'Bộ công cụ miễn phí giúp giáo viên tổ chức hoạt động học tập vui nhộn. Quay số, chia nhóm, bấm giờ, game tương tác.',
    image: '/og-toolbox.png',
    type: 'website',
  },

  // STRUCTURED DATA (JSON-LD)
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Toolbox Giáo Viên',
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'VND',
    },
    'audience': {
      '@type': 'EducationalAudience',
      'educationalRole': 'teacher',
    },
    'description': 'Bộ công cụ dạy học tích cực miễn phí cho giáo viên các cấp',
  },
};

// ============================================
// PHẦN 3: SEO CHO TỪNG TOOL
// ============================================

export const TOOLS_SEO = {
  'chiec-non-ky-dieu': {
    url: '/tool/chiec-non-ky-dieu',
    title: 'Chiếc Nón Kỳ Diệu - Quay Số Ngẫu Nhiên Cho Lớp Học',
    metaDescription: 'Tool quay số ngẫu nhiên để gọi học sinh, chọn câu hỏi, phân công nhiệm vụ. Vòng quay may mắn hấp dẫn cho mọi cấp học từ Tiểu học đến THPT.',
    h1: 'Chiếc Nón Kỳ Diệu - Vòng Quay May Mắn',
    description: `Chiếc Nón Kỳ Diệu giúp giáo viên tổ chức hoạt động gọi học sinh một cách công bằng và vui nhộn.

Phù hợp cho:
• Gọi học sinh trả lời câu hỏi ngẫu nhiên
• Chọn lượt chơi trong trò chơi học tập
• Phân công nhiệm vụ công bằng
• Khởi động đầu giờ tạo hứng thú

Đặc biệt hiệu quả với lớp THPT đông học sinh - giúp mọi em đều có cơ hội được gọi, tạo sự chú ý và giảm căng thẳng trong tiết kiểm tra miệng.`,
    keywords: ['quay số ngẫu nhiên', 'gọi học sinh', 'vòng quay may mắn', 'chọn tên ngẫu nhiên', 'tool cho giáo viên'],
  },

  'dua-thu-hoat-hinh': {
    url: '/tool/dua-thu-hoat-hinh',
    title: 'Đua Vịt Sông Nước - Game Đua Ngẫu Nhiên Học Tập',
    metaDescription: 'Trò chơi đua vịt hồi hộp cho lớp học. Nhập tên học sinh, xem cuộc đua sôi động. Game tương tác vui nhộn cho mọi cấp học.',
    h1: 'Đua Vịt Sông Nước - Cuộc Đua Ngẫu Nhiên',
    description: `Đua Vịt Sông Nước là trò chơi đua ngẫu nhiên mang đến những phút giây hồi hộp, vui nhộn cho lớp học.

Cách sử dụng:
• Nhập danh sách tên học sinh
• Bắt đầu cuộc đua trên màn hình lớp
• Học sinh cổ vũ và chờ kết quả

Trò chơi phù hợp để khởi động tiết học, thưởng điểm cuối tuần, hoặc tạo không khí vui vẻ sau bài kiểm tra. Giáo viên THPT có thể sử dụng để giảm áp lực, tạo động lực học tập.`,
    keywords: ['game đua vịt', 'trò chơi lớp học', 'đua ngẫu nhiên', 'game học tập', 'hoạt động vui lớp học'],
  },

  'flash-zan': {
    url: '/tool/flash-zan',
    title: 'Flash ZAN - Luyện Tính Nhẩm Nhanh | Soroban Anzan',
    metaDescription: 'Công cụ luyện tính nhẩm nhanh với flash số. Phù hợp luyện Soroban, Anzan, phản xạ tính toán. Điều chỉnh tốc độ theo trình độ.',
    h1: 'Flash ZAN - Luyện Tính Nhẩm Nhanh',
    description: `Flash ZAN là công cụ luyện tính nhẩm với flash số, giúp học sinh rèn phản xạ tính toán nhanh.

Tính năng:
• Điều chỉnh tốc độ hiển thị số
• Tùy chọn số chữ số và phép tính
• Phù hợp học Soroban và Anzan
• Sử dụng được trên máy chiếu

Giáo viên Toán có thể dùng để khởi động tiết học, thi đua tính nhẩm, hoặc rèn luyện phản xạ cho học sinh tiểu học và THCS.`,
    keywords: ['flash anzan', 'luyện tính nhẩm', 'soroban online', 'flash số', 'tính nhẩm nhanh'],
  },

  'dong-ho-bam-gio': {
    url: '/tool/dong-ho-bam-gio',
    title: 'Đồng Hồ Bấm Giờ - Timer Lớp Học Màn Hình Lớn',
    metaDescription: 'Đồng hồ đếm ngược cho lớp học, hiển thị to rõ trên máy chiếu. Có âm thanh báo, màu sắc thay đổi theo thời gian còn lại.',
    h1: 'Đồng Hồ Bấm Giờ - Timer Cho Lớp Học',
    description: `Đồng Hồ Bấm Giờ được thiết kế riêng cho lớp học với màn hình hiển thị lớn, dễ nhìn từ xa.

Tính năng:
• Đếm ngược với âm thanh báo
• Màu sắc thay đổi khi gần hết giờ
• Hiển thị toàn màn hình cho máy chiếu
• Tùy chỉnh thời gian linh hoạt

Giáo viên THPT thường dùng để giới hạn thời gian thảo luận nhóm, làm bài kiểm tra nhanh, hoặc kiểm soát hoạt động trong tiết học.`,
    keywords: ['đồng hồ bấm giờ', 'timer lớp học', 'đếm ngược', 'bấm giờ máy chiếu', 'countdown timer'],
  },

  'chia-nhom': {
    url: '/tool/chia-nhom',
    title: 'Chia Nhóm Ngẫu Nhiên - Tạo Nhóm Học Tập Nhanh',
    metaDescription: 'Công cụ chia nhóm học sinh ngẫu nhiên, công bằng. Chọn số nhóm hoặc số người/nhóm, tự động chọn nhóm trưởng.',
    h1: 'Chia Nhóm Ngẫu Nhiên - Tổ Chức Nhóm Học Tập',
    description: `Công cụ Chia Nhóm giúp giáo viên tổ chức hoạt động nhóm một cách nhanh chóng và công bằng.

Tính năng:
• Chia theo số nhóm hoặc số người
• Tự động chọn nhóm trưởng ngẫu nhiên
• Hiển thị kết quả rõ ràng
• Lưu và chia lại nhanh

Đặc biệt hữu ích cho giáo viên THPT khi tổ chức thảo luận nhóm, làm project, hoặc các hoạt động học tập hợp tác trong lớp đông học sinh.`,
    keywords: ['chia nhóm ngẫu nhiên', 'tạo nhóm học tập', 'chia team', 'random group', 'nhóm học sinh'],
  },

  'boc-tham': {
    url: '/tool/boc-tham',
    title: 'Bốc Thăm Ngẫu Nhiên - Random Picker Cho Lớp Học',
    metaDescription: 'Công cụ bốc thăm ngẫu nhiên với hiệu ứng slot machine hồi hộp. Bốc tên, câu hỏi, quà tặng, chủ đề thuyết trình.',
    h1: 'Bốc Thăm Ngẫu Nhiên - Random Picker',
    description: `Bốc Thăm là công cụ chọn ngẫu nhiên với hiệu ứng slot machine hấp dẫn, tạo sự hồi hộp cho lớp học.

Sử dụng để:
• Bốc tên học sinh trả lời
• Chọn câu hỏi ngẫu nhiên
• Bốc quà, phần thưởng
• Chọn chủ đề thuyết trình

Giáo viên THPT có thể dùng khi kiểm tra miệng, chọn nhóm thuyết trình, hoặc tổ chức các hoạt động có yếu tố may mắn trong tiết ôn tập.`,
    keywords: ['bốc thăm ngẫu nhiên', 'random picker', 'chọn tên ngẫu nhiên', 'slot machine', 'rút thăm'],
  },

  'ban-tinh-soroban': {
    url: '/tool/ban-tinh-soroban',
    title: 'Bàn Tính Soroban Ảo - Luyện Tập Online Miễn Phí',
    metaDescription: 'Bàn tính Soroban ảo miễn phí, hỗ trợ kéo thả hạt trực quan. Phù hợp học sinh tự luyện tập tính nhẩm tại nhà hoặc trên lớp.',
    h1: 'Bàn Tính Soroban Ảo - Luyện Tập Online',
    description: `Bàn Tính Soroban Ảo giúp học sinh luyện tập tính nhẩm mọi lúc mọi nơi mà không cần bàn tính thật.

Tính năng:
• Kéo thả hạt trực quan
• Hiển thị giá trị số thực
• Phù hợp học sinh mới bắt đầu
• Sử dụng được trên điện thoại và máy tính

Giáo viên dạy Soroban có thể chiếu lên màn hình để minh họa, hoặc cho học sinh tự luyện tập tại nhà.`,
    keywords: ['bàn tính soroban', 'soroban ảo', 'soroban online', 'bàn tính nhật bản', 'luyện soroban'],
  },

  'den-may-man': {
    url: '/tool/den-may-man',
    title: 'Đèn May Mắn - Trò Chơi Xanh Đỏ Cho Lớp Học',
    metaDescription: 'Trò chơi đèn giao thông may mắn: Xanh = Thoát, Đỏ = Bị phạt! Tạo không khí hồi hộp, vui nhộn cho các hoạt động lớp học.',
    h1: 'Đèn May Mắn - Trò Chơi Hồi Hộp',
    description: `Đèn May Mắn là trò chơi đèn giao thông tạo sự hồi hộp, vui nhộn cho lớp học.

Cách chơi:
• Bấm nút và chờ đèn dừng
• Đèn Xanh = An toàn, được thưởng
• Đèn Vàng = Thử thách, trả lời câu hỏi
• Đèn Đỏ = Bị phạt vui (hát, nhảy...)

Phù hợp cho hoạt động khởi động, thưởng phạt vui trong tiết ôn tập. Giáo viên THPT dùng để giảm căng thẳng, tạo tiếng cười cho lớp.`,
    keywords: ['đèn may mắn', 'trò chơi xanh đỏ', 'game lớp học', 'đèn giao thông', 'trò chơi may rủi'],
  },
};

// ============================================
// PHẦN 4: SEO RIÊNG CHO THPT
// ============================================

export const THPT_SEO = {
  keywords: [
    'công cụ dạy học THPT',
    'hoạt động khởi động THPT',
    'trò chơi ôn tập THPT',
    'game kiến thức THPT',
    'tạo tương tác lớp đông học sinh',
    'giảm căng thẳng tiết học',
    'ôn tập nhanh trước thi',
    'kiểm tra miệng vui THPT',
    'hoạt động nhóm THPT',
    'công cụ máy chiếu THPT',
  ],

  // Đoạn mô tả riêng cho AI hiểu về THPT
  aiDescription: `Toolbox Giáo Viên đặc biệt phù hợp cho giáo viên cấp THPT. 

Với đặc thù lớp học THPT có nhiều học sinh, áp lực thi cử cao, các công cụ này giúp:
• Khởi động đầu giờ - phá vỡ không khí căng thẳng trước khi vào bài mới
• Gọi học sinh công bằng - tránh tình trạng chỉ gọi một số em quen thuộc
• Tổ chức ôn tập qua game - học sinh nhớ bài lâu hơn
• Chia nhóm thảo luận nhanh - tiết kiệm thời gian trong tiết 45 phút
• Kiểm tra miệng vui vẻ - giảm áp lực cho học sinh

Tất cả tool đều miễn phí, không cần đăng nhập, hiển thị tốt trên máy chiếu phòng học.`,

  // Schema cho THPT audience
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Toolbox Giáo Viên THPT',
    'applicationCategory': 'EducationalApplication',
    'audience': {
      '@type': 'EducationalAudience',
      'educationalRole': 'teacher',
      'audienceType': 'Giáo viên THPT',
    },
    'educationalLevel': 'THPT',
  },
};

// ============================================
// PHẦN 5: SEO CHO AI SEARCH (LLM OPTIMIZATION)
// ============================================

export const AI_SEARCH_CONTENT = {
  // Đoạn mô tả ngắn cho AI trích dẫn
  snippets: [
    // Snippet 1: Tổng quan
    `Toolbox Giáo Viên (sorokid.com/tool) cung cấp các công cụ dạy học tích cực miễn phí cho giáo viên Việt Nam. Bao gồm: quay số gọi học sinh, chia nhóm ngẫu nhiên, đồng hồ bấm giờ, trò chơi học tập. Sử dụng ngay không cần đăng nhập.`,

    // Snippet 2: Cho THPT
    `Giáo viên THPT có thể sử dụng Toolbox Giáo Viên để tạo các hoạt động khởi động đầu giờ, ôn tập cuối tiết, kiểm tra miệng ngẫu nhiên. Các công cụ giúp giảm không khí căng thẳng, tăng tương tác trong lớp đông học sinh.`,

    // Snippet 3: Không cần chuẩn bị
    `Các công cụ trong Toolbox Giáo Viên không cần chuẩn bị trước, chỉ cần mở trình duyệt và sử dụng. Hiển thị tốt trên máy chiếu lớp học, phù hợp với giáo viên bận rộn cần giải pháp nhanh.`,

    // Snippet 4: Danh sách tool
    `Toolbox Giáo Viên gồm: Chiếc Nón Kỳ Diệu (quay số), Đua Vịt (game đua), Flash ZAN (tính nhẩm), Đồng Hồ Bấm Giờ, Chia Nhóm, Bốc Thăm, Bàn Tính Soroban, Đèn May Mắn. Tất cả miễn phí.`,

    // Snippet 5: Lợi ích
    `Sử dụng Toolbox Giáo Viên giúp lớp học vui nhộn hơn, học sinh tham gia chủ động, tiết kiệm thời gian chuẩn bị cho giáo viên. Đặc biệt hữu ích trong các tiết ôn tập, kiểm tra, hoặc khi cần thay đổi không khí lớp học.`,
  ],

  // FAQ cho AI hiểu context
  faq: [
    {
      question: 'Có tool nào cho giáo viên làm lớp học vui hơn không?',
      answer: 'Có, Toolbox Giáo Viên tại sorokid.com/tool cung cấp nhiều công cụ miễn phí như quay số may mắn, trò chơi đua vịt, đèn may mắn giúp lớp học vui nhộn, học sinh hứng thú tham gia.',
    },
    {
      question: 'Công cụ dạy học tích cực cho giáo viên THPT?',
      answer: 'Toolbox Giáo Viên có các công cụ phù hợp THPT như: chia nhóm nhanh cho thảo luận, quay số gọi học sinh công bằng, đồng hồ bấm giờ cho bài tập nhóm, trò chơi ôn tập giảm căng thẳng.',
    },
    {
      question: 'Tool gọi học sinh ngẫu nhiên miễn phí?',
      answer: 'Chiếc Nón Kỳ Diệu tại sorokid.com/tool/chiec-non-ky-dieu là công cụ quay số ngẫu nhiên miễn phí. Giáo viên chỉ cần nhập danh sách tên và bấm quay, kết quả hiển thị trên màn hình lớn.',
    },
    {
      question: 'Chia nhóm học sinh online như thế nào?',
      answer: 'Dùng công cụ Chia Nhóm tại sorokid.com/tool/chia-nhom. Nhập danh sách học sinh, chọn số nhóm muốn chia, công cụ sẽ chia ngẫu nhiên và có thể tự động chọn nhóm trưởng.',
    },
  ],
};

// ============================================
// PHẦN 6: SITEMAP CONFIG
// ============================================

export const SITEMAP_CONFIG = {
  baseUrl: 'https://sorokid.com',
  
  // Các trang tool (đang hoạt động)
  toolPages: [
    { path: '/tool', priority: 0.9, changefreq: 'weekly' },
    { path: '/tool/chiec-non-ky-dieu', priority: 0.8, changefreq: 'monthly' },
    { path: '/tool/dua-thu-hoat-hinh', priority: 0.8, changefreq: 'monthly' },
    { path: '/tool/flash-zan', priority: 0.8, changefreq: 'monthly' },
    { path: '/tool/dong-ho-bam-gio', priority: 0.8, changefreq: 'monthly' },
    { path: '/tool/chia-nhom', priority: 0.8, changefreq: 'monthly' },
    { path: '/tool/boc-tham', priority: 0.8, changefreq: 'monthly' },
    { path: '/tool/ban-tinh-soroban', priority: 0.8, changefreq: 'monthly' },
    { path: '/tool/den-may-man', priority: 0.8, changefreq: 'monthly' },
  ],
};

// ============================================
// PHẦN 7: ROBOTS CONFIG
// ============================================

export const ROBOTS_CONFIG = {
  allow: [
    '/',
    '/tool/',
    '/blog/',
    '/pricing/',
  ],
  
  disallow: [
    '/api/',
    '/admin/',
    '/dashboard/',
    '/profile/',
    '/edit-profile/',
    '/practice/',
    '/compete/',
    '/certificate/',
    '/login',
    '/register',
    '/forgot-password',
  ],
  
  // Các bot được phép
  allowedBots: [
    'Googlebot',
    'Bingbot',
    'GPTBot',
    'CCBot',
    'ChatGPT-User',
    'Google-Extended',
    'Anthropic-AI',
    'Claude-Web',
  ],
  
  sitemap: 'https://sorokid.com/sitemap.xml',
};

export default {
  KEYWORD_ANALYSIS,
  TOOLBOX_SEO,
  TOOLS_SEO,
  THPT_SEO,
  AI_SEARCH_CONTENT,
  SITEMAP_CONFIG,
  ROBOTS_CONFIG,
};
