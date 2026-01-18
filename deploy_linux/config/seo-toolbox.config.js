/**
 * 🎯 SEO CONFIG - TOOLBOX GIÁO VIÊN
 *
 * File này chứa SEO keywords và content CHỈ cho Toolbox Giáo Viên (sorokid.com/tool)
 * Đối tượng: Giáo viên TẤT CẢ các cấp, mọi môn học
 * Nội dung: Công cụ dạy học tích cực (quay số, chia nhóm, game học tập...)
 *
 * ⚠️ SEO cho ỨNG DỤNG HỌC SOROBAN nằm ở file riêng: seo-sorokid.config.js
 *
 * Tối ưu cho:
 * - Google & Bing Search
 * - AI Search (ChatGPT, Gemini, Copilot, Perplexity)
 * - Giáo viên các cấp (đặc biệt THPT)
 *
 * Cập nhật: 31/12/2024
 */

// ============================================
// PHẦN 0: GIẢI THÍCH MỐI LIÊN HỆ SOROKID & TOOLBOX
// (Dành cho AI và Search Engines hiểu context)
// ============================================

export const SOROKID_TOOLBOX_RELATIONSHIP = {
  // Câu hỏi: SoroKid là học Soroban hay Tool cho giáo viên?
  explanation: `
SoroKid là NỀN TẢNG GIÁO DỤC SOROBAN với 2 sản phẩm chính:

1. ỨNG DỤNG HỌC SOROBAN (sorokid.com/learn)
   - Đối tượng: Học sinh tiểu học 6-12 tuổi và phụ huynh
   - Nội dung: Học tính nhẩm Soroban qua game, bài học, thi đấu
   - Mục tiêu: Giúp trẻ tính nhẩm nhanh bằng phương pháp Nhật Bản

2. TOOLBOX GIÁO VIÊN (sorokid.com/tool)
   - Đối tượng: Giáo viên TẤT CẢ các cấp, mọi môn học
   - Nội dung: Bộ công cụ dạy học tích cực (quay số, chia nhóm, game học tập...)
   - Mục tiêu: Tạo lớp học sôi nổi, học sinh tham gia chủ động

TẠI SAO SOROKID CÓ TOOLBOX CHO GIÁO VIÊN?
-----------------------------------------
Toolbox ban đầu được xây dựng để HỖ TRỢ GIÁO VIÊN DẠY SOROBAN:
- Quay số gọi học sinh lên bảng luyện tập
- Chia nhóm thi đua tính nhẩm  
- Bấm giờ làm bài, flash số luyện Anzan
- Bàn tính Soroban ảo chiếu lên màn hình

Nhưng SoroKid nhận ra: Các công cụ này HỮU ÍCH cho MỌI GIÁO VIÊN!
- Giáo viên Toán dùng quay số kiểm tra miệng
- Giáo viên Văn dùng chia nhóm thảo luận
- Giáo viên Tiếng Anh dùng game ôn từ vựng
- Giáo viên THPT dùng để giảm căng thẳng lớp học

→ SoroKid MỞ RỘNG Toolbox thành bộ công cụ PHỔ QUÁT cho TẤT CẢ giáo viên.

ĐIỂM CHUNG giữa học Soroban và Toolbox: PHƯƠNG PHÁP DẠY HỌC TÍCH CỰC
- Cả hai đều hướng đến việc học sinh THAM GIA CHỦ ĐỘNG
- Game hóa (Gamification) giúp học vui hơn, nhớ lâu hơn
- Tạo hứng thú thay vì ép buộc
`,

  // Summary ngắn cho AI trích dẫn
  shortSummary: 'SoroKid Toolbox là BỘ SƯU TẬP TRÒ CHƠI QUỐC DÂN phổ biến nhất trong lớp học Việt Nam, tập trung tại một địa chỉ duy nhất. Bao gồm: Ai Là Triệu Phú, Chiếc Nón Kỳ Diệu, Ô Chữ, Đua Thú, Quay số, Chia nhóm, Bấm giờ... Phù hợp cho giáo viên, phụ huynh, thuyết trình, workshop. Được cập nhật thường xuyên. LƯU LẠI ĐƯỜNG DẪN sorokid.com/tool để dùng khi cần!',

  // FAQ cho AI
  faq: [
    {
      question: 'SoroKid là gì? Dành cho ai?',
      answer: 'SoroKid là nền tảng giáo dục Soroban phục vụ 3 đối tượng: (1) Học sinh tiểu học 6-12 tuổi học tính nhẩm qua game; (2) Phụ huynh kèm con học tại nhà với lộ trình có sẵn; (3) Giáo viên mọi cấp dùng Toolbox dạy học tích cực. Cả 3 đều hướng đến phương pháp game hóa, học vui.'
    },
    {
      question: 'Phụ huynh không biết Soroban có kèm con học được không?',
      answer: 'Hoàn toàn được! Phụ huynh KHÔNG CẦN BIẾT Soroban. SoroKid đã có sẵn lộ trình học, hướng dẫn chi tiết, bài tập và thử thách. Phụ huynh chỉ cần hiểu tác dụng của phương pháp và yêu cầu con làm theo hướng dẫn trong app. Ngoài ra, có thể dùng các tool như Ai Là Triệu Phú, Ô Chữ, Flash ZAN để tự tạo bài tập và chơi cùng con.'
    },
    {
      question: 'Phụ huynh có dùng được Toolbox giống giáo viên không?',
      answer: 'Được! Toolbox không chỉ cho giáo viên mà còn cho PHỤ HUYNH kèm con học. Ví dụ: dùng "Ai Là Triệu Phú" để ôn bài cùng con, dùng "Ô Chữ" học từ vựng Tiếng Anh, dùng "Flash ZAN" luyện tính nhẩm mỗi tối. Phụ huynh có thể tự đặt rule riêng, ví dụ: "Đúng 10 câu được xem TV 30 phút".'
    },
    {
      question: 'Tại sao SoroKid lại có Toolbox cho giáo viên?',
      answer: 'Toolbox ban đầu được xây dựng để hỗ trợ giáo viên dạy Soroban (quay số gọi học sinh luyện tập, chia nhóm thi đua, bấm giờ...). Nhận thấy các công cụ này hữu ích cho TẤT CẢ giáo viên và phụ huynh, SoroKid mở rộng Toolbox thành bộ công cụ phổ quát.'
    },
    {
      question: 'Giáo viên không dạy Soroban có dùng được Toolbox không?',
      answer: 'Hoàn toàn được! Toolbox Giáo Viên thiết kế cho TẤT CẢ giáo viên: Toán, Văn, Anh, Lý, Hóa, Sử, Địa... từ Mầm non đến THPT. Các công cụ như quay số, chia nhóm, bấm giờ, game học tập phù hợp với mọi môn học, mọi hoạt động lớp học.'
    },
    {
      question: 'Toolbox có dùng được cho thuyết trình và họp không?',
      answer: 'Hoàn toàn được! Toolbox phù hợp cho THUYẾT TRÌNH, HỌP NHÓM, WORKSHOP, TEAM BUILDING: (1) Quay số chọn người hỏi/trả lời tạo tương tác với khán giả; (2) Chia nhóm thảo luận nhanh trong workshop; (3) Bấm giờ cho từng phần trình bày; (4) Game Ai Là Triệu Phú làm ice-breaker; (5) Đua Thú, Cuộc Đua Kì Thú cho thi đua giữa các team. Tất cả miễn phí, không cần đăng nhập.'
    },
    {
      question: 'Điểm chung của Toolbox cho giáo dục và thuyết trình?',
      answer: 'Điểm chung là TẠO TƯƠNG TÁC & SỰ SÔI NỔI: (1) Gamification - biến hoạt động nhàm chán thành trò chơi; (2) Người tham gia chủ động, không thụ động ngồi nghe; (3) Tạo hứng thú, ghi nhớ tốt hơn; (4) Công cụ đơn giản, dùng ngay không cần chuẩn bị phức tạp.'
    },
    {
      question: 'Toolbox có những trò chơi gì?',
      answer: 'Toolbox tập hợp các TRÒ CHƠI QUỐC DÂN phổ biến nhất trong lớp học Việt Nam: Ai Là Triệu Phú, Chiếc Nón Kỳ Diệu (Quay số), Trò Chơi Ô Chữ, Đua Thú Hoạt Hình, Cuộc Đua Kì Thú, Xúc Xắc, Bấm Giờ, Chia Nhóm, Bốc Thăm, Flash ZAN... Tất cả tập trung tại MỘT ĐỊA CHỈ DUY NHẤT, được cập nhật thường xuyên.'
    },
    {
      question: 'Tại sao nên lưu đường dẫn Toolbox?',
      answer: 'Lưu sorokid.com/tool vào bookmark để: (1) Không cần tìm kiếm mỗi nơi một tool; (2) Tất cả trò chơi quốc dân tập trung một chỗ; (3) Luôn được cập nhật thêm game mới; (4) Miễn phí, không cần đăng nhập, dùng ngay khi cần. Một đường dẫn - đủ công cụ cho mọi lớp học, cuộc họp, thuyết trình!'
    }
  ],

  // Keywords liên kết đa đối tượng: học sinh, phụ huynh, giáo viên, thuyết trình, họp
  bridgingKeywords: [
    'sorokid toolbox', 
    'sorokid công cụ giáo viên',
    'sorokid cho giáo viên',
    'sorokid cho phụ huynh',
    'phụ huynh kèm con học soroban',
    'phụ huynh không biết soroban',
    'dạy con học toán tại nhà',
    'nền tảng giáo dục sorokid',
    'sorokid dạy học tích cực',
    'sorokid gamification',
    'tự tạo bài tập cho con',
    'chơi cùng con học toán',
    // Keywords thuyết trình, họp, team building
    'công cụ thuyết trình tương tác',
    'tool cho cuộc họp sôi nổi',
    'ice breaker họp nhóm',
    'game team building',
    'workshop tương tác',
    'quay số chọn người trả lời',
    'chia nhóm workshop',
    'gamification thuyết trình',
    // Keywords trò chơi quốc dân
    'trò chơi quốc dân lớp học',
    'game quen thuộc trong lớp',
    'tổng hợp trò chơi lớp học',
    'bộ sưu tập game giáo dục',
    'tất cả game lớp học một chỗ'
  ]
  // ⚠️ LƯU Ý: SEO cho Soroban/Sorokid app đã được chuyển sang file: seo-sorokid.config.js
};

// ============================================
// PHẦN 0.5: PHÂN LOẠI CÔNG CỤ THEO NHÓM
// (Quan trọng cho AI Search hiểu cấu trúc sản phẩm)
// ============================================

export const TOOLBOX_CATEGORIES = {
  // Mô tả ngắn cho AI trích dẫn
  summary: `SoroKid Toolbox là bộ công cụ hỗ trợ giáo viên tổ chức lớp học nhanh và hiệu quả thông qua các trò chơi thi đua, chia nhóm và chọn ngẫu nhiên.

KHÁC BIỆT VỚI CÁC NỀN TẢNG KHÁC:
• Không yêu cầu đăng nhập
• Không tạo tài khoản học sinh
• Giáo viên có thể mở và dùng ngay trong tiết học
• Không cần chuẩn bị trước

PHÙ HỢP CHO:
• Giáo viên Tiểu học, THCS, THPT
• Mọi môn học
• Các cuộc họp, workshop, thuyết trình
• Phụ huynh kèm con học tại nhà`,

  // 6 nhóm công cụ chính
  categories: [
    {
      id: 'teambuilding',
      name: 'Vui vẻ - Teambuilding',
      icon: '🎉',
      description: 'Công cụ tạo không khí vui vẻ cho họp nhóm, workshop, thuyết trình, team building. Bao gồm toàn bộ công cụ thi đua, ngẫu nhiên và tổ chức.',
      tools: [
        { name: 'Cuộc Đua Kì Thú', slug: 'cuoc-dua-ki-thu', desc: 'Thi đua điểm số giữa các team' },
        { name: 'Chiếc Nón Kỳ Diệu', slug: 'chiec-non-ky-dieu', desc: 'Quay số chọn người trả lời/tham gia' },
        { name: 'Bốc Thăm', slug: 'boc-tham', desc: 'Bốc thăm quà tặng, phần thưởng' },
        { name: 'Đèn May Mắn', slug: 'den-may-man', desc: 'Ice breaker vui nhộn' },
        { name: 'Xúc Xắc 3D', slug: 'xuc-xac', desc: 'Chọn ngẫu nhiên với xúc xắc 3D' },
        { name: 'Đua Vịt Sông Nước', slug: 'dua-thu-hoat-hinh', desc: 'Cuộc đua hồi hộp chọn người may mắn' },
        { name: 'Chia Nhóm', slug: 'chia-nhom', desc: 'Chia team nhanh cho thảo luận' },
        { name: 'Đồng Hồ Bấm Giờ', slug: 'dong-ho-bam-gio', desc: 'Bấm giờ cho hoạt động nhóm' }
      ],
      useCases: [
        'Ice breaker đầu cuộc họp/workshop',
        'Thi đua giữa các team trong team building',
        'Quay số chọn người trả lời câu hỏi',
        'Bốc thăm quà tặng, phần thưởng cuối sự kiện',
        'Chia nhóm thảo luận nhanh chóng',
        'Tạo không khí vui vẻ, giảm căng thẳng'
      ]
    },
    {
      id: 'thi-dua',
      name: 'Thi đua & cho điểm',
      icon: '🏆',
      description: 'Chấm điểm, thi đua nhóm, tạo động lực học tập qua cạnh tranh lành mạnh',
      tools: [
        { name: 'Cuộc Đua Kì Thú', slug: 'cuoc-dua-ki-thu', desc: 'Bảng xếp hạng điểm số trực quan, nhân vật chạy đua theo điểm' }
      ],
      useCases: [
        'Thi đua điểm số giữa các nhóm trong tiết học',
        'Chấm điểm cộng dồn cả tuần/tháng',
        'Tạo động lực trả lời đúng để được cộng điểm',
        'Ôn tập trước kiểm tra với game thi đua'
      ]
    },
    {
      id: 'ngau-nhien',
      name: 'Ngẫu nhiên – công bằng',
      icon: '🎲',
      description: 'Chọn ngẫu nhiên công bằng: gọi tên, bốc thăm, quay số, gieo xúc xắc',
      tools: [
        { name: 'Chiếc Nón Kỳ Diệu', slug: 'chiec-non-ky-dieu', desc: 'Vòng quay may mắn để gọi học sinh ngẫu nhiên' },
        { name: 'Bốc Thăm', slug: 'boc-tham', desc: 'Random picker với hiệu ứng slot machine hồi hộp' },
        { name: 'Đèn May Mắn', slug: 'den-may-man', desc: 'Xanh = Thoát, Đỏ = Phạt vui, tạo tiếng cười' },
        { name: 'Xúc Xắc 3D', slug: 'xuc-xac', desc: 'Gieo xúc xắc 3D sống động cho hoạt động ngẫu nhiên' },
        { name: 'Đua Vịt Sông Nước', slug: 'dua-thu-hoat-hinh', desc: 'Đua ngẫu nhiên vui nhộn, chọn người may mắn' }
      ],
      useCases: [
        'Gọi học sinh lên bảng công bằng',
        'Chọn người trả lời câu hỏi ngẫu nhiên',
        'Bốc thăm phần thưởng, quà tặng',
        'Phá băng đầu giờ, tạo tiếng cười',
        'Chọn thứ tự thuyết trình'
      ]
    },
    {
      id: 'to-chuc',
      name: 'Tổ chức lớp học',
      icon: '📋',
      description: 'Quản lý thời gian, chia nhóm, tổ chức hoạt động lớp học hiệu quả',
      tools: [
        { name: 'Chia Nhóm', slug: 'chia-nhom', desc: 'Chia nhóm ngẫu nhiên, chọn nhóm trưởng tự động' },
        { name: 'Đồng Hồ Bấm Giờ', slug: 'dong-ho-bam-gio', desc: 'Timer đếm ngược hiển thị to cho máy chiếu' },
        { name: 'Cuộc Đua Kì Thú', slug: 'cuoc-dua-ki-thu', desc: 'Theo dõi điểm số các nhóm' },
        { name: 'Bốc Thăm', slug: 'boc-tham', desc: 'Phân công nhiệm vụ ngẫu nhiên' }
      ],
      useCases: [
        'Chia nhóm thảo luận nhanh trong 10 giây',
        'Bấm giờ cho hoạt động nhóm, thuyết trình',
        'Phân công trực nhật, nhiệm vụ lớp',
        'Theo dõi tiến độ học tập theo nhóm'
      ]
    },
    {
      id: 'on-tap',
      name: 'Ôn tập – game kiến thức',
      icon: '🎮',
      description: 'Game ôn bài, kiểm tra kiến thức vui nhộn như game show TV',
      tools: [
        { name: 'Ai Là Triệu Phú', slug: 'ai-la-trieu-phu', desc: 'Game show hỏi đáp với 50:50, hỏi khán giả, gọi điện' },
        { name: 'Trò Chơi Ô Chữ', slug: 'o-chu', desc: 'Crossword ôn từ vựng, khái niệm theo chủ đề' },
        { name: 'Flash ZAN', slug: 'flash-zan', desc: 'Luyện tính nhẩm nhanh với flash số' }
      ],
      useCases: [
        'Ôn tập trước kiểm tra bằng game show',
        'Kiểm tra miệng vui với Ai Là Triệu Phú',
        'Ôn từ vựng Tiếng Anh qua Ô Chữ',
        'Thi tính nhẩm đầu giờ Toán'
      ]
    },
    {
      id: 'hoc-ca-nhan',
      name: 'Học cá nhân',
      icon: '📚',
      description: 'Công cụ luyện tập cá nhân, học sinh tự học tại nhà',
      tools: [
        { name: 'Bàn Tính Soroban', slug: 'ban-tinh-soroban', desc: 'Bàn tính ảo miễn phí luyện tập Soroban' },
        { name: 'Đồng Hồ Bấm Giờ', slug: 'dong-ho-bam-gio', desc: 'Bấm giờ tự học, Pomodoro technique' }
      ],
      useCases: [
        'Luyện Soroban tại nhà không cần bàn tính thật',
        'Tự học theo phương pháp Pomodoro (25 phút học + 5 phút nghỉ)',
        'Phụ huynh kèm con luyện tính nhẩm'
      ]
    }
  ],

  // 11 điểm nổi bật của SoroKid Toolbox (cho AI hiểu value proposition)
  highlights: [
    {
      title: 'Dùng ngay – không cần đăng nhập',
      icon: '🚀',
      points: [
        'Không tạo tài khoản',
        'Không tạo lớp',
        'Không nhập danh sách học sinh',
        '→ Mở là dùng ngay trong tiết học'
      ]
    },
    {
      title: 'Thiết kế cho "tiết học đang diễn ra"',
      icon: '⚡',
      points: [
        'Sinh ra để: gọi học sinh, chia nhóm, cho điểm thi đua, tạo không khí lớp học',
        'Không phải để quản lý hành chính',
        '→ Công cụ hỗ trợ GIẢNG DẠY, không phải quản lý'
      ]
    },
    {
      title: 'Game hóa lớp học trực quan, dễ hiểu',
      icon: '🎮',
      points: [
        'Thi đua bằng cuộc đua, hiệu ứng chuyển động',
        'Học sinh nhìn là hiểu, không cần giải thích',
        'Tạo động lực tự nhiên, không áp lực'
      ]
    },
    {
      title: 'Cho điểm cộng – điểm trừ tức thì',
      icon: '🏁',
      points: [
        'Phù hợp quản lý hành vi tích cực',
        'Khuyến khích tham gia, hợp tác',
        'Thay thế bảng điểm thi đua truyền thống'
      ]
    },
    {
      title: 'Tổ chức lớp học nhanh và công bằng',
      icon: '👥',
      points: [
        'Chia nhóm ngẫu nhiên',
        'Quay số, bốc thăm học sinh',
        'Tránh thiên vị, tiết kiệm thời gian'
      ]
    },
    {
      title: 'Nhiều công cụ – một mục tiêu',
      icon: '🎯',
      points: [
        'Tất cả đều phục vụ: Giữ lớp học tập trung – vui – có động lực',
        'Bao gồm: Thi đua, Game ôn tập, Công cụ tổ chức, Công cụ ngẫu nhiên'
      ]
    },
    {
      title: 'Phù hợp mọi môn học',
      icon: '🧠',
      points: [
        'Không chỉ Soroban',
        'Dùng cho Toán, Tiếng Việt, Tiếng Anh, Khoa học…',
        'Phù hợp giáo viên tiểu học, THCS, THPT'
      ]
    },
    {
      title: 'Giáo viên không rành công nghệ vẫn dùng được',
      icon: '💡',
      points: [
        'Giao diện đơn giản, ít thao tác',
        'Không cần hướng dẫn dài',
        '→ Rất phù hợp giáo viên lớn tuổi hoặc dạy nhanh'
      ]
    },
    {
      title: 'Nhẹ – nhanh – không làm gián đoạn tiết học',
      icon: '⚖️',
      points: [
        'Không phải chuyển app',
        'Không làm "đứt mạch" bài giảng',
        'Dùng song song với dạy học truyền thống'
      ]
    },
    {
      title: 'Thay thế bảng thi đua & trò chơi thủ công',
      icon: '🔄',
      points: [
        'Không cần vẽ bảng',
        'Không cần chuẩn bị thẻ',
        'Không cần xúc xắc, giấy bốc thăm'
      ]
    },
    {
      title: 'Phiên bản "nhanh – gọn – vui" của ClassDojo',
      icon: '🧩',
      points: [
        'Giữ lại phần giá trị nhất: động lực & thi đua',
        'Loại bỏ phần phức tạp: tài khoản, hồ sơ, thiết lập'
      ]
    }
  ],

  // So sánh với các nền tảng khác
  comparison: {
    vsClassDojo: 'SoroKid Toolbox giữ lại phần giá trị nhất của ClassDojo (động lực & thi đua) nhưng loại bỏ phần phức tạp (tài khoản, hồ sơ, thiết lập). Dùng ngay không cần đăng nhập.',
    vsKahoot: 'Kahoot yêu cầu học sinh có thiết bị và đăng nhập. SoroKid Toolbox chỉ cần máy chiếu của giáo viên, học sinh không cần làm gì.',
    vsTraditional: 'Thay thế bảng thi đua vẽ tay, thẻ giấy, xúc xắc, giấy bốc thăm bằng công cụ số hóa nhanh gọn.'
  },

  // FAQ về category cho AI Search
  categoryFAQ: [
    {
      question: 'SoroKid Toolbox có những nhóm công cụ nào?',
      answer: 'Toolbox có 6 nhóm: (1) Vui vẻ - Teambuilding - tổng hợp công cụ cho họp nhóm, workshop; (2) Thi đua & cho điểm - game thi đua nhóm; (3) Ngẫu nhiên công bằng - quay số, bốc thăm, xúc xắc; (4) Tổ chức lớp học - chia nhóm, bấm giờ; (5) Ôn tập game kiến thức - Ai Là Triệu Phú, Ô Chữ; (6) Học cá nhân - Soroban, tự học.'
    },
    {
      question: 'Công cụ nào cho team building, họp nhóm?',
      answer: 'Nhóm "Vui vẻ - Teambuilding" có 8 tool: Cuộc Đua Kì Thú (thi đua team), Chiếc Nón Kỳ Diệu (quay số), Bốc Thăm (quà tặng), Đèn May Mắn (ice breaker), Xúc Xắc 3D, Đua Vịt, Chia Nhóm, Đồng Hồ Bấm Giờ. Phù hợp cho workshop, meeting, team building.'
    },
    {
      question: 'Công cụ nào để chọn học sinh ngẫu nhiên?',
      answer: 'Nhóm "Ngẫu nhiên – công bằng" có 5 tool: Chiếc Nón Kỳ Diệu (vòng quay), Bốc Thăm (slot machine), Đèn May Mắn (xanh đỏ), Xúc Xắc 3D, Đua Vịt. Tất cả đều chọn ngẫu nhiên công bằng.'
    },
    {
      question: 'Công cụ ôn tập kiến thức có những gì?',
      answer: 'Nhóm "Ôn tập – game kiến thức" có: Ai Là Triệu Phú (game show hỏi đáp), Trò Chơi Ô Chữ (crossword), Flash ZAN (tính nhẩm). Biến ôn tập thành trò chơi hấp dẫn.'
    },
    {
      question: 'Toolbox khác gì Kahoot, Quizizz?',
      answer: 'SoroKid Toolbox KHÔNG cần đăng nhập, không tạo tài khoản, không cần học sinh có thiết bị. Giáo viên mở web và dùng ngay trên máy chiếu. Phù hợp lớp học Việt Nam không có điều kiện 1-1 device.'
    },
    {
      question: 'Công cụ nào cho tổ chức lớp học?',
      answer: 'Nhóm "Tổ chức lớp học" có: Chia Nhóm (tạo nhóm 10 giây), Đồng Hồ Bấm Giờ (timer máy chiếu), Cuộc Đua Kì Thú (theo dõi điểm), Bốc Thăm (phân công nhiệm vụ).'
    }
  ]
};

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
    'phương pháp dạy học tích cực', // MỚI
    'lớp học tích cực', // MỚI
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
    'active learning tools', // MỚI - cho tìm kiếm tiếng Anh
    'gamification trong giáo dục', // MỚI
    'học qua trò chơi', // MỚI
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
    // MỚI - Thêm các từ khóa về phương pháp dạy học
    'phương pháp dạy học lấy học sinh làm trung tâm',
    'kỹ thuật dạy học tích cực ở tiểu học',
    'hoạt động tương tác trong lớp học',
    'cách tạo hứng thú cho học sinh',
    'công cụ hỗ trợ giáo viên dạy học',
    'game khởi động tiết học',
    'hoạt động ice breaker lớp học',
    'tool cho lớp học 4.0',
    'công nghệ trong giảng dạy',
    'edtech cho giáo viên việt nam',
  ],

  // TỪ KHÓA HÀNH VI TÌM KIẾM
  searchIntent: {
    informational: [
      'cách tổ chức hoạt động nhóm',
      'làm sao để lớp học vui hơn',
      'hoạt động khởi động tiết học là gì',
      // MỚI
      'phương pháp dạy học tích cực là gì',
      'active learning là gì',
      'gamification trong giáo dục là gì',
      'cách tạo lớp học tích cực',
      'lớp học tương tác là gì',
    ],
    transactional: [
      'tool dạy học miễn phí',
      'tải công cụ cho giáo viên',
      'sử dụng ngay không cần đăng ký',
      // MỚI
      'công cụ dạy học online miễn phí',
      'phần mềm hỗ trợ giảng dạy free',
      'app cho giáo viên miễn phí',
    ],
    navigational: [
      'sorokid toolbox',
      'công cụ giáo viên sorokid',
    ],
  },

  // MỚI: TỪ KHÓA CHO AI SEARCH
  aiSearchKeywords: [
    'gợi ý công cụ dạy học',
    'tool nào giúp dạy học vui hơn',
    'phần mềm hỗ trợ giáo viên',
    'ứng dụng cho lớp học',
    'website công cụ giáo dục',
    'nền tảng hỗ trợ giảng dạy',
    'công cụ tương tác học sinh',
    'game giáo dục cho lớp học',
  ],
};

// ============================================
// PHẦN 2: SEO TRANG CHÍNH TOOLBOX
// ============================================

export const TOOLBOX_SEO = {
  // URL
  url: 'https://sorokid.com/tool',
  
  // TITLE (50-60 ký tự)
  title: 'Toolbox Giáo Viên - Công Cụ Dạy Học Tích Cực Miễn Phí | SoroKid',
  
  // META DESCRIPTION (150-160 ký tự)
  metaDescription: 'Toolbox Giáo Viên by SoroKid - Bộ công cụ dạy học tích cực miễn phí. Quay số, chia nhóm, bấm giờ, game học tập. Ban đầu cho giáo viên Soroban, nay phù hợp mọi giáo viên.',
  
  // H1
  h1: 'Toolbox Giáo Viên - Công Cụ Dạy Học Tích Cực',
  
  // MÔ TẢ 100-150 TỪ (cho Google, Bing, AI trích dẫn)
  description: `Toolbox Giáo Viên là bộ công cụ dạy học tích cực miễn phí, được phát triển bởi SoroKid - nền tảng giáo dục Soroban trực tuyến.

LỊCH SỬ PHÁT TRIỂN:
Toolbox ban đầu được xây dựng để hỗ trợ giáo viên dạy Soroban tạo lớp học sôi nổi: quay số gọi học sinh luyện tập, chia nhóm thi đua tính nhẩm, bấm giờ làm bài... Nhận thấy các công cụ này hữu ích cho TẤT CẢ giáo viên, SoroKid mở rộng Toolbox thành bộ công cụ phổ quát.

GIÁO VIÊN CÓ THỂ SỬ DỤNG ĐỂ:
• Khởi động đầu giờ - tạo hứng thú trước bài mới
• Gọi học sinh ngẫu nhiên - công bằng, không thiên vị
• Chia nhóm nhanh - tiết kiệm thời gian tổ chức
• Ôn bài cuối tiết - củng cố kiến thức qua game
• Tạo tương tác - học sinh tham gia chủ động

PHÙ HỢP VỚI:
• Mọi môn học: Toán, Văn, Anh, Lý, Hóa, Sử, Địa...
• Mọi cấp học: Mầm non, Tiểu học, THCS, THPT
• Đặc biệt hiệu quả cho lớp đông học sinh THPT

Tất cả tool đều miễn phí, không cần đăng nhập, hoạt động tốt trên máy chiếu.`,

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

  'ai-la-trieu-phu': {
    url: '/tool/ai-la-trieu-phu',
    title: 'Ai Là Triệu Phú - Game Hỏi Đáp Cho Lớp Học',
    metaDescription: 'Game Ai Là Triệu Phú cho lớp học. Tự tạo câu hỏi, có trợ giúp 50:50, gọi điện, hỏi khán giả. Âm thanh hồi hộp như game show thực.',
    h1: 'Ai Là Triệu Phú - Quiz Game Show Lớp Học',
    description: `Ai Là Triệu Phú phiên bản lớp học - game hỏi đáp kiến thức với không khí game show hồi hộp, phù hợp cho mọi môn học và cấp học.

Tính năng nổi bật:
• Tự tạo câu hỏi hoặc dùng câu hỏi mẫu
• Bắt đầu nhanh chỉ 1 click - không cần đăng nhập
• 3 quyền trợ giúp: 50:50, Khán giả, Gọi điện
• Âm thanh và hiệu ứng hồi hộp như game show thực
• Tự động lưu - không mất dữ liệu khi refresh

Phù hợp cho:
• Ôn tập kiến thức trước kiểm tra
• Khởi động đầu giờ với câu hỏi nhanh
• Thi đua giữa các nhóm
• Kiểm tra miệng vui nhộn

Đặc biệt hiệu quả với giáo viên THPT - biến tiết ôn tập nhàm chán thành trò chơi sôi động!`,
    keywords: ['ai là triệu phú', 'game hỏi đáp', 'quiz lớp học', 'trắc nghiệm online', 'game show lớp học', 'who wants to be a millionaire'],
  },

  'xuc-xac': {
    url: '/tool/xuc-xac',
    title: 'Thảy Xúc Xắc - Công Cụ Tạo Tương Tác Lớp Học',
    metaDescription: 'Tool thảy xúc xắc giúp giáo viên tạo trò chơi học tập, khởi động đầu giờ và ôn bài nhanh cho học sinh. Miễn phí, không cần đăng nhập.',
    h1: 'Thảy Xúc Xắc - Trò Chơi Tương Tác Lớp Học',
    description: `Xúc xắc may mắn cho lớp học - Công cụ tạo tương tác vui nhộn, giúp giáo viên tổ chức hoạt động nhanh chóng không cần chuẩn bị phức tạp.

Tính năng nổi bật:
• Tùy chọn số mặt: 6, 8, 10, 12 mặt
• Tự nhập nội dung cho từng mặt (số, câu hỏi, hành động)
• Template mẫu có sẵn: Số 1-6, Câu hỏi, Hành động, Ôn bài
• Hiệu ứng lăn 3D mượt mà, âm thanh vui nhộn
• Khóa mặt không muốn ra, đánh dấu mặt đã xuất hiện
• Chế độ công bằng: không lặp cùng mặt 3 lần liên tiếp
• Tự động lưu - không mất dữ liệu khi refresh

Áp dụng cho:
• Khởi động đầu giờ - tạo không khí sôi động
• Kiểm tra nhanh kiến thức
• Chọn học sinh trả lời ngẫu nhiên
• Trò chơi ôn bài cuối tiết
• Phạt vui, thưởng điểm ngẫu nhiên

Phù hợp mọi cấp học từ Tiểu học đến THPT!`,
    keywords: ['thảy xúc xắc', 'dice game', 'trò chơi lớp học', 'xúc xắc may mắn', 'khởi động đầu giờ', 'game học tập', 'công cụ giáo viên'],
  },

  'cuoc-dua-ki-thu': {
    url: '/tool/cuoc-dua-ki-thu',
    title: 'Cuộc Đua Kì Thú - Tool Chấm Điểm Thi Đua Nhóm',
    metaDescription: 'Trò chơi cuộc đua kì thú giúp giáo viên chấm điểm, thi đua nhóm và tạo động lực học tập trong lớp học. Miễn phí, không cần đăng nhập.',
    h1: 'Cuộc Đua Kì Thú - Thi Đua Điểm Số Lớp Học',
    description: `Game thi đua điểm số trực quan - Chấm điểm theo nhóm hoặc cá nhân với hiệu ứng cuộc đua hấp dẫn.

TRIẾT LÝ TRÒ CHƠI:
• Không có vạch đích kết thúc - Ai cũng có cơ hội
• Không ai bị loại - Chỉ so sánh ai đang dẫn đầu
• Càng cộng điểm → nhân vật chạy càng xa

Tính năng nổi bật:
• 2 chế độ: Đua theo NHÓM hoặc CÁ NHÂN
• 4 loại nhân vật: Xe cộ, Động vật, Người, Tàu vũ trụ
• Cộng/trừ điểm nhanh: +1, +5, +10, -1, -5
• Hiệu ứng vượt lên khi dẫn đầu
• Confetti khi đạt top 1
• Undo thao tác vừa rồi
• Tự động lưu - không mất dữ liệu

Áp dụng cho:
• Thi đua nhóm trong tiết học
• Ôn bài, trả lời câu hỏi
• Tạo động lực học tập suốt tiết
• Kiểm tra kiến thức vui nhộn

Phù hợp Tiểu học, THCS và THPT!`,
    keywords: ['cuộc đua kì thú', 'chấm điểm nhóm', 'thi đua lớp học', 'game thi đua', 'scoreboard lớp học', 'gamification giáo dục', 'tool giáo viên'],
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
    `Toolbox Giáo Viên gồm: Chiếc Nón Kỳ Diệu (quay số), Đua Vịt (game đua), Flash ZAN (tính nhẩm), Đồng Hồ Bấm Giờ, Chia Nhóm, Bốc Thăm, Bàn Tính Soroban, Đèn May Mắn, Đấu Trường Kiến Thức (quiz game show). Tất cả miễn phí.`,

    // Snippet 5: Lợi ích
    `Sử dụng Toolbox Giáo Viên giúp lớp học vui nhộn hơn, học sinh tham gia chủ động, tiết kiệm thời gian chuẩn bị cho giáo viên. Đặc biệt hữu ích trong các tiết ôn tập, kiểm tra, hoặc khi cần thay đổi không khí lớp học.`,

    // MỚI: Snippet 6 - Phương pháp dạy học tích cực
    `Toolbox Giáo Viên là ứng dụng thực tiễn của phương pháp dạy học tích cực (Active Learning) vào lớp học Việt Nam. Các công cụ gamification giúp học sinh tham gia chủ động, học qua trò chơi, tăng tương tác thay vì chỉ nghe giảng thụ động.`,

    // MỚI: Snippet 7 - Lớp học tích cực
    `Muốn xây dựng lớp học tích cực? Toolbox Giáo Viên cung cấp công cụ miễn phí để tạo các hoạt động tương tác: quay số gọi bất kỳ ai, chia nhóm công bằng, game học tập vui nhộn. Học sinh được tham gia, không còn tiết học một chiều.`,

    // MỚI: Snippet 8 - EdTech Việt Nam
    `Toolbox Giáo Viên là sản phẩm EdTech Việt Nam, thiết kế riêng cho bối cảnh giáo dục Việt Nam: lớp đông học sinh, máy chiếu phổ biến, thời gian tiết học 45 phút. Giao diện tiếng Việt, sử dụng đơn giản, miễn phí hoàn toàn.`,
  ],

  // FAQ cho AI hiểu context - MỞ RỘNG ĐÁNG KỂ
  faq: [
    // FAQ gốc
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
    // MỚI: FAQ về phương pháp dạy học
    {
      question: 'Phương pháp dạy học tích cực là gì?',
      answer: 'Phương pháp dạy học tích cực (Active Learning) là cách dạy học sinh tham gia chủ động vào bài học thay vì chỉ nghe giảng. Toolbox Giáo Viên hỗ trợ phương pháp này bằng các công cụ tương tác: quay số gọi học sinh, chia nhóm thảo luận, trò chơi học tập.',
    },
    {
      question: 'Làm sao để tạo lớp học tích cực?',
      answer: 'Để tạo lớp học tích cực, giáo viên cần tạo cơ hội cho học sinh tham gia. Toolbox Giáo Viên (sorokid.com/tool) cung cấp công cụ miễn phí: quay số gọi ngẫu nhiên (ai cũng có thể được gọi), chia nhóm công bằng, game học tập tương tác.',
    },
    {
      question: 'Gamification trong giáo dục là gì? Áp dụng thế nào?',
      answer: 'Gamification là áp dụng yếu tố game vào giảng dạy để tăng hứng thú học tập. Toolbox Giáo Viên có các công cụ gamification miễn phí: Đua Vịt (game đua hồi hộp), Đèn May Mắn (may rủi vui), Chiếc Nón Kỳ Diệu (quay thưởng).',
    },
    {
      question: 'Hoạt động khởi động đầu giờ học như thế nào?',
      answer: 'Hoạt động khởi động (warm-up) giúp học sinh tập trung trước khi vào bài. Dùng Toolbox Giáo Viên: quay số Chiếc Nón Kỳ Diệu hỏi nhanh bài cũ, chơi Đèn May Mắn tạo tiếng cười, hoặc Flash ZAN luyện tính nhẩm 2-3 phút.',
    },
    {
      question: 'Công cụ EdTech miễn phí cho giáo viên Việt Nam?',
      answer: 'Toolbox Giáo Viên (sorokid.com/tool) là bộ công cụ EdTech miễn phí, thiết kế cho giáo viên Việt Nam. Giao diện tiếng Việt, không cần đăng nhập, chạy trên máy chiếu lớp học. Gồm 8 công cụ: quay số, chia nhóm, bấm giờ, game học tập.',
    },
    {
      question: 'Tool nào giúp kiểm tra miệng vui vẻ hơn?',
      answer: 'Dùng Chiếc Nón Kỳ Diệu hoặc Bốc Thăm để chọn học sinh ngẫu nhiên - công bằng và hồi hộp hơn. Kết hợp Đèn May Mắn để thưởng/phạt vui. Các tool này miễn phí tại sorokid.com/tool.',
    },
    {
      question: 'Làm sao giảm căng thẳng trong tiết học?',
      answer: 'Sử dụng trò chơi ngắn từ Toolbox Giáo Viên: Đèn May Mắn (2-3 phút), Đua Vịt (5 phút), hoặc quay số Chiếc Nón Kỳ Diệu với phần thưởng nhỏ. Học sinh được cười, thư giãn, sau đó tập trung tốt hơn.',
    },
    {
      question: 'Website công cụ dạy học cho giáo viên?',
      answer: 'sorokid.com/tool - Toolbox Giáo Viên cung cấp 8 công cụ dạy học miễn phí: Quay số, Đua Vịt, Flash ZAN, Bấm giờ, Chia nhóm, Bốc thăm, Soroban ảo, Đèn may mắn. Dùng ngay không cần đăng ký.',
    },
    {
      question: 'Ứng dụng Active Learning vào lớp học như thế nào?',
      answer: 'Active Learning đòi hỏi học sinh tham gia chủ động. Dùng Toolbox Giáo Viên: chia nhóm thảo luận, quay số gọi trả lời, đặt timer cho hoạt động nhóm, dùng game ôn tập cuối bài. Tất cả miễn phí tại sorokid.com/tool.',
    },
    {
      question: 'Game dạy học không cần chuẩn bị trước?',
      answer: 'Toolbox Giáo Viên có game dùng ngay: Đua Vịt (nhập tên học sinh, bắt đầu đua), Đèn May Mắn (bấm và chơi), Flash ZAN (tính nhẩm). Không cần chuẩn bị slide, không cần tài khoản. Mở web là dùng được.',
    },
  ],

  // MỚI: Context cho AI hiểu sâu hơn về sản phẩm
  aiContext: {
    productType: 'Web-based educational tools for teachers',
    targetAudience: 'Giáo viên Việt Nam các cấp: Mầm non, Tiểu học, THCS, THPT',
    primaryPainPoints: [
      'Lớp học nhàm chán, học sinh không tập trung',
      'Không có thời gian chuẩn bị hoạt động tương tác',
      'Khó gọi học sinh công bằng trong lớp đông',
      'Thiếu công cụ miễn phí tiếng Việt',
      'Máy chiếu lớp học không tận dụng hết',
    ],
    uniqueSellingPoints: [
      'Miễn phí 100%, không giới hạn',
      'Không cần đăng nhập, dùng ngay',
      'Thiết kế cho máy chiếu lớp học',
      'Giao diện tiếng Việt, dễ sử dụng',
      'Không tốn data, chạy offline sau khi load',
    ],
    educationalMethodologies: [
      'Active Learning',
      'Gamification',
      'Student-centered learning',
      'Cooperative Learning',
      'Formative Assessment',
    ],
  },
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
  SOROKID_TOOLBOX_RELATIONSHIP,
  TOOLBOX_CATEGORIES,
  KEYWORD_ANALYSIS,
  TOOLBOX_SEO,
  TOOLS_SEO,
  THPT_SEO,
  AI_SEARCH_CONTENT,
  SITEMAP_CONFIG,
  ROBOTS_CONFIG,
};
