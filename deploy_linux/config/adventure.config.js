/**
 * ⚔️ ADVENTURE MAP CONFIG - Lộ Trình Phiêu Lưu Tìm Kho Báu Tri Thức
 * 
 * Dùng dữ liệu có sẵn trong DB:
 * - Progress: tiến độ học (levelId, lessonId)
 * - ExerciseResult: luyện tập (exerciseType, difficulty, isCorrect)
 * - CompeteResult: thi đấu (arenaId, correct)
 */

// ============================================================
// 🦉 NHÂN VẬT HƯỚNG DẪN - CÚ THÔNG THÁI SORO
// ============================================================
export const GUIDE_CHARACTER = {
  id: 'soro',
  name: 'Cú Soro',
  title: 'Cú Thông Thái',
  emoji: '🦉',
  avatar: '/images/guide/owl-soro.png',
  description: 'Chú cú thông thái sẽ dẫn dắt con qua hành trình tìm Kho Báu Tri Thức!',
  
  // Lời chào theo thời điểm
  greetings: {
    morning: 'Chào buổi sáng, nhà thám hiểm nhí! Cú Soro đã sẵn sàng cùng con khám phá!',
    afternoon: 'Chào buổi chiều! Hôm nay chúng ta sẽ chinh phục thử thách nào đây?',
    evening: 'Chào buổi tối! Cùng luyện tập thêm một chút trước khi nghỉ ngơi nhé!',
    default: 'Chào nhà thám hiểm! Cú Soro rất vui được gặp con!'
  },
  
  // Lời động viên khi hoàn thành
  completeMessages: [
    'Tuyệt vời! Con đã vượt qua thử thách! 🌟',
    'Xuất sắc! Kỹ năng của con ngày càng giỏi! 💪',
    'Phi thường! Con xứng đáng là nhà thám hiểm thực thụ! 🏆',
    'Cú Soro tự hào về con lắm! Tiếp tục nào! 🦉✨'
  ],
  
  // Lời khích lệ khi gặp khó
  encourageMessages: [
    'Đừng lo, thử lại lần nữa nhé! Con làm được mà!',
    'Sai là để học hỏi! Cú Soro tin con sẽ làm được!',
    'Từ từ thôi, không vội. Mỗi bước tiến là một chiến thắng!',
    'Nhà thám hiểm giỏi không bao giờ bỏ cuộc! Cố lên nào!'
  ]
};

// ============================================================
// 🗺️ CÁC VÙNG ĐẤT - ADVENTURE ZONES
// ============================================================

/**
 * Zone Type:
 * - 'learn': Bài học (dẫn đến /learn/[levelId])
 * - 'practice': Luyện tập (dẫn đến /practice với mode cụ thể)
 * - 'compete': Thi đấu (dẫn đến /compete)
 * - 'special': Siêu Trí Tuệ / Tia Chớp
 * - 'milestone': Điểm mốc nhận thưởng/chứng chỉ
 */

export const ADVENTURE_ZONES = [
  // ============================================================
  // 🌱 CHƯƠNG 1: LÀNG BÀN TÍNH (Level 1) - Khởi đầu
  // ============================================================
  {
    id: 'village-start',
    chapter: 1,
    name: 'Làng Bàn Tính',
    subtitle: 'Nơi khởi đầu của mọi anh hùng',
    icon: '🏘️',
    color: 'from-green-400 to-emerald-500',
    bgImage: '/images/zones/village.jpg',
    
    story: {
      intro: 'Chào mừng đến Làng Bàn Tính! Đây là nơi con sẽ học cách sử dụng bàn tính Soroban thần kỳ.',
      mission: 'Hãy làm quen với bàn tính Soroban - công cụ tính toán cổ đại của các bậc thầy!',
      complete: 'Tuyệt vời! Con đã nắm vững cách dùng Soroban. Giờ hãy tiến vào Rừng Số Nhỏ!'
    },
    
    // Điều kiện mở khóa
    unlockRequirement: null, // Zone đầu tiên - luôn mở
    
    // Các thử thách trong zone này
    challenges: [
      {
        id: 'village-learn',
        type: 'learn',
        levelId: 1,
        name: 'Khám phá Soroban',
        description: 'Học cách tạo số 0-9 trên bàn tính',
        icon: '📚',
        link: '/learn?level=1',
        // Chi tiết các bài học trong level
        lessonDetails: [
          { lessonId: 1, title: '🎒 Khám phá Soroban', desc: 'Làm quen bàn tính thần kỳ' },
          { lessonId: 2, title: '🔢 Số 1-4: Các hạt Đất', desc: 'Tạo số 1-4 bằng hạt Đất' },
          { lessonId: 3, title: '⭐ Số 5-9: Hạt Trời tỏa sáng', desc: 'Dùng hạt Trời cho số 5-9' },
          { lessonId: 4, title: '🔟 Số 10-99: Hai cột số', desc: 'Biểu diễn số 2 chữ số' }
        ],
        // Điều kiện hoàn thành: hoàn thành tất cả lesson của level 1
        completeCondition: { type: 'level_complete', levelId: 1 }
      }
    ],
    
    // Kỹ năng đạt được sau zone
    skillsGained: ['Biết cấu tạo Soroban', 'Tạo số 0-9', 'Số 2 chữ số']
  },

  // ============================================================
  // 🌲 CHƯƠNG 2: RỪNG CỘNG ĐƠN (Level 2-3) - Phép cộng cơ bản
  // ============================================================
  {
    id: 'forest-add-basic',
    chapter: 2,
    name: 'Rừng Cộng Đơn',
    subtitle: 'Nơi phép cộng bắt đầu',
    icon: '🌲',
    color: 'from-emerald-400 to-green-600',
    bgImage: '/images/zones/forest.jpg',
    
    story: {
      intro: 'Con đã đến Rừng Cộng Đơn! Những con số ở đây muốn được gộp lại với nhau.',
      mission: 'Học cách cộng các số đơn giản và làm quen với công thức Bạn Nhỏ!',
      complete: 'Xuất sắc! Con đã thuần thục phép cộng cơ bản. Thung Lũng Trừ đang chờ đón con!'
    },
    
    unlockRequirement: { type: 'zone_complete', zoneId: 'village-start' },
    
    challenges: [
      {
        id: 'forest-add-learn-2',
        type: 'learn',
        levelId: 2,
        name: 'Cộng đủ hạt',
        description: 'Cộng khi có đủ hạt Đất',
        icon: '➕',
        link: '/learn?level=2',
        lessonDetails: [
          { lessonId: 1, title: '➕ Cộng 1-2 (đủ hạt)', desc: 'Cộng khi có đủ hạt Đất để gạt' },
          { lessonId: 2, title: '➕ Cộng với hạt Trời', desc: 'Cộng khi kết quả từ 5 trở lên' },
          { lessonId: 3, title: '➕ Luyện tập cộng dễ', desc: 'Ôn tập củng cố phép cộng đơn giản' }
        ],
        completeCondition: { type: 'level_complete', levelId: 2 }
      },
      {
        id: 'forest-add-learn-3',
        type: 'learn',
        levelId: 3,
        name: 'Bạn Nhỏ Cộng',
        description: 'Công thức Bạn Nhỏ khi cộng',
        icon: '🤝',
        link: '/learn?level=3',
        lessonDetails: [
          { lessonId: 1, title: '🤝 Làm quen Bạn nhỏ', desc: 'Học cặp số cộng lại = 5' },
          { lessonId: 2, title: '➕ Cộng dùng Bạn nhỏ', desc: 'Áp dụng Bạn nhỏ khi hết hạt Đất' },
          { lessonId: 3, title: '🏋️ Luyện tập Bạn nhỏ cộng', desc: 'Thành thạo cộng với Bạn nhỏ' }
        ],
        completeCondition: { type: 'level_complete', levelId: 3 }
      }
    ],
    
    skillsGained: ['Cộng đơn giản', 'Công thức Bạn Nhỏ (tổng 5)', 'Cộng với hạt Trời']
  },

  // ============================================================
  // 🏔️ CHƯƠNG 3: THUNG LŨNG TRỪ (Level 4) - Phép trừ cơ bản
  // ============================================================
  {
    id: 'valley-subtract',
    chapter: 3,
    name: 'Thung Lũng Trừ',
    subtitle: 'Nơi con số nhỏ đi',
    icon: '🏔️',
    color: 'from-blue-400 to-cyan-500',
    bgImage: '/images/zones/valley.jpg',
    
    story: {
      intro: 'Chào mừng đến Thung Lũng Trừ! Ở đây con sẽ học cách làm số nhỏ đi.',
      mission: 'Nắm vững phép trừ và công thức Bạn Nhỏ khi trừ!',
      complete: 'Giỏi lắm! Con đã chinh phục Thung Lũng Trừ. Tiếp tục đến Đồi Bạn Lớn nào!'
    },
    
    unlockRequirement: { type: 'zone_complete', zoneId: 'forest-add-basic' },
    
    challenges: [
      {
        id: 'valley-sub-learn-4',
        type: 'learn',
        levelId: 4,
        name: 'Trừ & Bạn Nhỏ Trừ',
        description: 'Trừ đơn giản và Bạn Nhỏ khi trừ',
        icon: '➖',
        link: '/learn?level=4',
        lessonDetails: [
          { lessonId: 1, title: '➖ Trừ đơn giản', desc: 'Trừ khi có đủ hạt để bỏ' },
          { lessonId: 2, title: '➖ Trừ dùng Bạn nhỏ', desc: 'Áp dụng Bạn nhỏ khi thiếu hạt Đất' },
          { lessonId: 3, title: '🏋️ Luyện tập Bạn nhỏ trừ', desc: 'Thành thạo trừ với Bạn nhỏ' },
          { lessonId: 4, title: '🎯 MIX Cộng Trừ Bạn nhỏ', desc: 'Kết hợp cộng trừ với Bạn nhỏ' }
        ],
        completeCondition: { type: 'level_complete', levelId: 4 }
      }
    ],
    
    skillsGained: ['Trừ đơn giản', 'Bạn Nhỏ Trừ', 'Trừ với hạt Trời']
  },

  // ============================================================
  // ⭐ CHƯƠNG 4: ĐỒI BẠN LỚN (Level 5-6) - Công thức Bạn Lớn
  // ============================================================
  {
    id: 'hill-big-friend',
    chapter: 4,
    name: 'Đồi Bạn Lớn',
    subtitle: 'Bí mật của số 10',
    icon: '⭐',
    color: 'from-yellow-400 to-orange-500',
    bgImage: '/images/zones/hill.jpg',
    
    story: {
      intro: 'Đồi Bạn Lớn - nơi cất giữ bí mật quan trọng: công thức tạo số 10!',
      mission: 'Học công thức Bạn Lớn - chìa khóa để tính toán nhanh hơn!',
      complete: 'Phi thường! Con đã nắm vững Bạn Lớn. Đài Kết Hợp đang chờ đợi!'
    },
    
    unlockRequirement: { type: 'zone_complete', zoneId: 'valley-subtract' },
    
    challenges: [
      {
        id: 'hill-big-learn-5',
        type: 'learn',
        levelId: 5,
        name: 'Bạn Lớn Cộng',
        description: 'Cộng qua 10 với Bạn Lớn',
        icon: '🔟',
        link: '/learn?level=5',
        lessonDetails: [
          { lessonId: 1, title: '🤝 Làm quen Bạn lớn', desc: 'Học cặp số cộng lại = 10' },
          { lessonId: 2, title: '➕ Cộng dùng Bạn lớn', desc: 'Cộng bằng cách sang cột chục' },
          { lessonId: 3, title: '🏋️ Luyện tập Bạn lớn cộng', desc: 'Thành thạo cộng với Bạn lớn' }
        ],
        completeCondition: { type: 'level_complete', levelId: 5 }
      },
      {
        id: 'hill-big-learn-6',
        type: 'learn',
        levelId: 6,
        name: 'Bạn Lớn Trừ',
        description: 'Trừ qua 10 với Bạn Lớn',
        icon: '🔙',
        link: '/learn?level=6',
        lessonDetails: [
          { lessonId: 1, title: '➖ Trừ dùng Bạn lớn', desc: 'Trừ bằng cách mượn từ hàng chục' },
          { lessonId: 2, title: '➖ Trừ qua chục (nâng cao)', desc: 'Luyện trừ khi phải mượn từ chục' },
          { lessonId: 3, title: '🏋️ Luyện tập Bạn lớn trừ', desc: 'Thành thạo trừ với Bạn lớn' },
          { lessonId: 4, title: '🎯 MIX Cộng Trừ Bạn lớn', desc: 'Kết hợp cộng trừ với Bạn lớn' }
        ],
        completeCondition: { type: 'level_complete', levelId: 6 }
      }
    ],
    
    skillsGained: ['Bạn Lớn (tổng 10)', 'Cộng qua 10', 'Trừ qua 10']
  },

  // ============================================================
  // 🏛️ CHƯƠNG 5: ĐÀI KẾT HỢP (Level 7) - Kết hợp Bạn Nhỏ + Bạn Lớn
  // ============================================================
  {
    id: 'tower-combine',
    chapter: 5,
    name: 'Đài Kết Hợp',
    subtitle: 'Nơi sức mạnh hội tụ',
    icon: '🏛️',
    color: 'from-purple-400 to-pink-500',
    bgImage: '/images/zones/tower.jpg',
    
    story: {
      intro: 'Đài Kết Hợp - nơi Bạn Nhỏ và Bạn Lớn hợp sức tạo nên phép thuật!',
      mission: 'Kết hợp cả hai công thức để giải quyết mọi phép tính cộng trừ!',
      complete: 'Tuyệt đỉnh! Con đã thành thạo cộng trừ cơ bản. Hãy thử thách tại Đấu Trường!'
    },
    
    unlockRequirement: { type: 'zone_complete', zoneId: 'hill-big-friend' },
    
    challenges: [
      {
        id: 'tower-combine-learn-7',
        type: 'learn',
        levelId: 7,
        name: 'Kết hợp Bạn Nhỏ + Lớn',
        description: 'Dùng cả 2 công thức',
        icon: '🔀',
        link: '/learn?level=7',
        lessonDetails: [
          { lessonId: 1, title: '🎯 Cộng kết hợp', desc: 'Kết hợp Bạn Nhỏ + Bạn Lớn khi cộng' },
          { lessonId: 2, title: '🎯 Trừ kết hợp', desc: 'Kết hợp mượn và dùng Bạn Nhỏ khi trừ' },
          { lessonId: 3, title: '🏋️ Tổng hợp cộng trừ', desc: 'Luyện tập kết hợp tất cả công thức' },
          { lessonId: 4, title: '📝 Ôn tập Cộng Trừ cơ bản', desc: 'Tổng ôn tập Level 1-7' }
        ],
        completeCondition: { type: 'level_complete', levelId: 7 }
      }
    ],
    
    skillsGained: ['Kết hợp công thức', 'Cộng trừ mọi số 1 chữ số']
  },

  // ============================================================
  // ⚔️ ĐẤU TRƯỜNG CỘNG TRỪ 1 - Thử thách luyện tập + thi đấu
  // ============================================================
  {
    id: 'arena-addsub-1',
    chapter: 5,
    name: 'Đấu Trường Cộng Trừ',
    subtitle: 'Thử thách bản lĩnh!',
    icon: '⚔️',
    color: 'from-red-400 to-rose-600',
    bgImage: '/images/zones/arena.jpg',
    
    story: {
      intro: 'Chào mừng đến Đấu Trường! Đây là nơi con chứng minh kỹ năng cộng trừ!',
      mission: 'Luyện tập và thi đấu để khẳng định sức mạnh!',
      complete: 'Con đã chiến thắng Đấu Trường! Giờ hãy tiến vào Vương Quốc Số Lớn!'
    },
    
    unlockRequirement: { type: 'zone_complete', zoneId: 'tower-combine' },
    
    challenges: [
      {
        id: 'arena-addsub-practice',
        type: 'practice',
        mode: 'addSubMixed',
        minDifficulty: 1,
        name: 'Luyện Cộng Trừ Mix',
        description: 'Luyện tập cộng trừ xen kẽ - Cấp độ 1',
        icon: '🎯',
        link: '/practice?mode=addSubMixed&difficulty=1',
        practiceInfo: {
          mode: 'addSubMixed',
          difficulty: 1,
          target: '10 câu đúng',
          skills: ['Cộng trừ số 1-2 chữ số', 'Phản xạ nhanh']
        },
        completeCondition: { 
          type: 'practice_correct', 
          mode: 'addSubMixed', 
          minDifficulty: 1, 
          minCorrect: 10 
        }
      },
      {
        id: 'arena-addsub-compete',
        type: 'compete',
        mode: 'addSubMixed',
        name: 'Thi đấu Cộng Trừ',
        description: 'Thi đấu cộng trừ hỗn hợp - 10 câu',
        icon: '🏆',
        link: '/compete?mode=addSubMixed',
        competeInfo: {
          mode: 'addSubMixed',
          questions: 10,
          target: '6+ câu đúng',
          reward: 'Huy hiệu Cộng Trừ'
        },
        completeCondition: { 
          type: 'compete_score', 
          mode: 'addSubMixed', 
          minCorrect: 6 
        }
      }
    ],
    
    skillsGained: ['Phản xạ cộng trừ', 'Thi đấu cộng trừ']
  },

  // ============================================================
  // 🏰 CHƯƠNG 6: VƯƠNG QUỐC SỐ LỚN (Level 8-10) - Số nhiều chữ số
  // ============================================================
  {
    id: 'kingdom-big-numbers',
    chapter: 6,
    name: 'Vương Quốc Số Lớn',
    subtitle: 'Thế giới của hàng trăm, hàng nghìn',
    icon: '🏰',
    color: 'from-indigo-400 to-blue-600',
    bgImage: '/images/zones/kingdom.jpg',
    
    story: {
      intro: 'Vương Quốc Số Lớn - nơi những con số khổng lồ ngự trị!',
      mission: 'Chinh phục các phép cộng trừ với số 2, 3, 4 chữ số!',
      complete: 'Vĩ đại! Con đã làm chủ cộng trừ số lớn. Con xứng đáng nhận Chứng Chỉ Cộng Trừ!'
    },
    
    unlockRequirement: { type: 'zone_complete', zoneId: 'arena-addsub-1' },
    
    challenges: [
      {
        id: 'kingdom-learn-8',
        type: 'learn',
        levelId: 8,
        name: 'Số 2 chữ số',
        description: 'Cộng trừ số 2 chữ số',
        icon: '📊',
        link: '/learn?level=8',
        lessonDetails: [
          { lessonId: 1, title: '📝 Cộng 2 số (không nhớ)', desc: 'Cộng hai số không cần nhớ sang hàng' },
          { lessonId: 2, title: '📝 Cộng 2 số (có nhớ)', desc: 'Cộng hai số có nhớ sang hàng chục' },
          { lessonId: 3, title: '📝 Trừ 2 chữ số', desc: 'Trừ hai số có 2 chữ số' }
        ],
        completeCondition: { type: 'level_complete', levelId: 8 }
      },
      {
        id: 'kingdom-learn-9',
        type: 'learn',
        levelId: 9,
        name: 'Số 3 chữ số',
        description: 'Cộng trừ số 3 chữ số',
        icon: '💯',
        link: '/learn?level=9',
        lessonDetails: [
          { lessonId: 1, title: '💯 Số 100-999', desc: 'Biểu diễn số 3 chữ số trên Soroban' },
          { lessonId: 2, title: '➕ Cộng 3 chữ số', desc: 'Cộng hai số có 3 chữ số' },
          { lessonId: 3, title: '➖ Trừ 3 chữ số', desc: 'Trừ hai số có 3 chữ số' }
        ],
        completeCondition: { type: 'level_complete', levelId: 9 }
      },
      {
        id: 'kingdom-learn-10',
        type: 'learn',
        levelId: 10,
        name: 'Số 4 chữ số',
        description: 'Cộng trừ số 4 chữ số',
        icon: '🔢',
        link: '/learn?level=10',
        lessonDetails: [
          { lessonId: 1, title: '🔢 Số 1000-9999', desc: 'Biểu diễn số 4 chữ số trên Soroban' },
          { lessonId: 2, title: '➕ Cộng 4 chữ số', desc: 'Cộng số có 4 chữ số' },
          { lessonId: 3, title: '➖ Trừ 4 chữ số', desc: 'Trừ số có 4 chữ số' },
          { lessonId: 4, title: '📝 Ôn tập số lớn', desc: 'Ôn tập cộng trừ với số 2-4 chữ số' }
        ],
        completeCondition: { type: 'level_complete', levelId: 10 }
      }
    ],
    
    skillsGained: ['Cộng trừ 2 chữ số', 'Cộng trừ 3 chữ số', 'Cộng trừ 4 chữ số']
  },

  // ============================================================
  // 🏅 ĐIỂM MỐC: CHỨNG CHỈ CỘNG TRỪ
  // ============================================================
  {
    id: 'milestone-addsub-cert',
    chapter: 6,
    name: 'Đền Chứng Chỉ Cộng Trừ',
    subtitle: '🏅 Vinh quang của bậc thầy Cộng Trừ',
    icon: '🏅',
    color: 'from-amber-400 to-yellow-500',
    bgImage: '/images/zones/temple.jpg',
    isMilestone: true,
    
    story: {
      intro: 'Chúc mừng! Con đã đến Đền Chứng Chỉ - nơi tôn vinh những bậc thầy Cộng Trừ!',
      mission: 'Hoàn thành các yêu cầu cuối cùng để nhận Chứng Chỉ Tính Nhẩm Cộng Trừ!',
      complete: '🎉 CHÚC MỪNG! Con đã đạt được CHỨNG CHỈ TÍNH NHẨM CỘNG TRỪ! 🏅'
    },
    
    unlockRequirement: { type: 'zone_complete', zoneId: 'kingdom-big-numbers' },
    
    challenges: [
      {
        id: 'cert-addsub-final',
        type: 'milestone',
        name: 'Nhận Chứng Chỉ Cộng Trừ',
        description: 'Hoàn thành lộ trình Cộng Trừ',
        icon: '📜',
        link: '/certificate',
        milestoneInfo: {
          certType: 'addSub',
          title: 'Chứng Chỉ Tính Nhẩm Cộng Trừ',
          requirements: ['Hoàn thành Level 1-10', 'Vượt qua Đấu Trường Cộng Trừ']
        },
        completeCondition: { type: 'certificate', certType: 'addSub' }
      }
    ],
    
    skillsGained: ['🏅 CHỨNG CHỈ TÍNH NHẨM CỘNG TRỪ'],
    reward: { type: 'certificate', certType: 'addSub' }
  },

  // ============================================================
  // ✖️ CHƯƠNG 7: HANG PHÉP NHÂN (Level 11-12) - Phép nhân
  // ============================================================
  {
    id: 'cave-multiply',
    chapter: 7,
    name: 'Hang Phép Nhân',
    subtitle: 'Sức mạnh nhân đôi, nhân ba!',
    icon: '✖️',
    color: 'from-orange-400 to-red-500',
    bgImage: '/images/zones/cave.jpg',
    
    story: {
      intro: 'Hang Phép Nhân - nơi con học cách nhân số lên nhiều lần!',
      mission: 'Chinh phục bảng cửu chương và phép nhân trên Soroban!',
      complete: 'Phi thường! Con đã nắm vững phép nhân. Hồ Phép Chia đang chờ đón!'
    },
    
    unlockRequirement: { type: 'zone_complete', zoneId: 'milestone-addsub-cert' },
    
    challenges: [
      {
        id: 'cave-multiply-11',
        type: 'learn',
        levelId: 11,
        name: 'Bảng nhân 2-7',
        description: 'Nhân với số nhỏ',
        icon: '✖️',
        link: '/learn?level=11',
        lessonDetails: [
          { lessonId: 1, title: '✖️ Khái niệm phép nhân', desc: 'Nguyên tắc nhân trên Soroban, bảng 2-3' },
          { lessonId: 2, title: '✖️ Nhân với số 2, 3, 4', desc: 'Luyện nhân với các số nhỏ' },
          { lessonId: 3, title: '✖️ Nhân với số 5, 6, 7', desc: 'Nhân với các số lớn hơn' }
        ],
        completeCondition: { type: 'level_complete', levelId: 11 }
      },
      {
        id: 'cave-multiply-12',
        type: 'learn',
        levelId: 12,
        name: 'Bảng nhân 8-9',
        description: 'Hoàn thành bảng cửu chương',
        icon: '💫',
        link: '/learn?level=12',
        lessonDetails: [
          { lessonId: 1, title: '✖️ Nhân với số 8, 9', desc: 'Hoàn thành bảng cửu chương' },
          { lessonId: 2, title: '✖️ Nhân số 2 chữ số', desc: 'Nhân số lớn với 1 chữ số' },
          { lessonId: 3, title: '✖️ Luyện tập nhân', desc: 'Tổng hợp các phép nhân' }
        ],
        completeCondition: { type: 'level_complete', levelId: 12 }
      }
    ],
    
    skillsGained: ['Bảng cửu chương', 'Nhân 1 chữ số', 'Nhân 2 chữ số']
  },

  // ============================================================
  // ➗ CHƯƠNG 8: HỒ PHÉP CHIA (Level 13-14) - Phép chia
  // ============================================================
  {
    id: 'lake-divide',
    chapter: 8,
    name: 'Hồ Phép Chia',
    subtitle: 'Chia đều, chia sẻ!',
    icon: '➗',
    color: 'from-cyan-400 to-teal-500',
    bgImage: '/images/zones/lake.jpg',
    
    story: {
      intro: 'Hồ Phép Chia - nơi con học cách chia số thành nhiều phần bằng nhau!',
      mission: 'Nắm vững phép chia - phép ngược của phép nhân!',
      complete: 'Xuất sắc! Con đã thành thạo cả Nhân và Chia. Đấu Trường Nhân Chia đang chờ!'
    },
    
    unlockRequirement: { type: 'zone_complete', zoneId: 'cave-multiply' },
    
    challenges: [
      {
        id: 'lake-divide-13',
        type: 'learn',
        levelId: 13,
        name: 'Chia cơ bản',
        description: 'Chia cho 2-7',
        icon: '➗',
        link: '/learn?level=13',
        lessonDetails: [
          { lessonId: 1, title: '➗ Khái niệm phép chia', desc: 'Hiểu phép chia và chia hết' },
          { lessonId: 2, title: '➗ Chia cho 2, 3, 4', desc: 'Luyện chia với số nhỏ' },
          { lessonId: 3, title: '➗ Chia cho 5, 6, 7', desc: 'Chia với số lớn hơn' }
        ],
        completeCondition: { type: 'level_complete', levelId: 13 }
      },
      {
        id: 'lake-divide-14',
        type: 'learn',
        levelId: 14,
        name: 'Chia nâng cao',
        description: 'Chia cho 8-9 và số lớn',
        icon: '📐',
        link: '/learn?level=14',
        lessonDetails: [
          { lessonId: 1, title: '➗ Chia cho 8, 9', desc: 'Hoàn thành bảng chia' },
          { lessonId: 2, title: '➗ Chia số 2 chữ số', desc: 'Chia số lớn với 1 chữ số' },
          { lessonId: 3, title: '➗ Luyện tập chia', desc: 'Tổng hợp các phép chia' },
          { lessonId: 4, title: '🎯 MIX Nhân Chia', desc: 'Kết hợp phép nhân và chia' }
        ],
        completeCondition: { type: 'level_complete', levelId: 14 }
      }
    ],
    
    skillsGained: ['Chia cho 2-9', 'Chia 2 chữ số', 'Quan hệ nhân-chia']
  },

  // ============================================================
  // ⚔️ ĐẤU TRƯỜNG NHÂN CHIA
  // ============================================================
  {
    id: 'arena-muldiv',
    chapter: 8,
    name: 'Đấu Trường Nhân Chia',
    subtitle: 'Thử thách tứ phép!',
    icon: '⚔️',
    color: 'from-rose-400 to-pink-600',
    bgImage: '/images/zones/arena-gold.jpg',
    
    story: {
      intro: 'Đấu Trường Nhân Chia - thử thách dành cho những nhà vô địch!',
      mission: 'Chứng minh con đã thành thạo cả 4 phép tính!',
      complete: 'Con đã chinh phục Tứ Phép! Giờ hãy rèn luyện Siêu Trí Tuệ!'
    },
    
    unlockRequirement: { type: 'zone_complete', zoneId: 'lake-divide' },
    
    challenges: [
      {
        id: 'arena-mul-practice',
        type: 'practice',
        mode: 'multiplication',
        minDifficulty: 1,
        name: 'Luyện Phép Nhân',
        description: 'Luyện tập nhân nhanh - Cấp độ 1',
        icon: '✖️',
        link: '/practice?mode=multiplication&difficulty=1',
        practiceInfo: {
          mode: 'multiplication',
          difficulty: 1,
          target: '10 câu đúng',
          skills: ['Bảng cửu chương', 'Nhân 1-2 chữ số']
        },
        completeCondition: { 
          type: 'practice_correct', 
          mode: 'multiplication', 
          minDifficulty: 1, 
          minCorrect: 10 
        }
      },
      {
        id: 'arena-div-practice',
        type: 'practice',
        mode: 'division',
        minDifficulty: 1,
        name: 'Luyện Phép Chia',
        description: 'Luyện tập chia nhanh - Cấp độ 1',
        icon: '➗',
        link: '/practice?mode=division&difficulty=1',
        practiceInfo: {
          mode: 'division',
          difficulty: 1,
          target: '10 câu đúng',
          skills: ['Bảng chia', 'Chia 1-2 chữ số']
        },
        completeCondition: { 
          type: 'practice_correct', 
          mode: 'division', 
          minDifficulty: 1, 
          minCorrect: 10 
        }
      },
      {
        id: 'arena-mixed-compete',
        type: 'compete',
        mode: 'mixed',
        name: 'Thi đấu Tứ Phép',
        description: 'Thi đấu cả 4 phép tính - 10 câu',
        icon: '🏆',
        link: '/compete?mode=mixed',
        competeInfo: {
          mode: 'mixed',
          questions: 10,
          target: '6+ câu đúng',
          reward: 'Huy hiệu Tứ Phép'
        },
        completeCondition: { 
          type: 'compete_score', 
          mode: 'mixed', 
          minCorrect: 6 
        }
      }
    ],
    
    skillsGained: ['Phản xạ nhân chia', 'Thi đấu tứ phép']
  },

  // ============================================================
  // 🧠 CHƯƠNG 9: THÁP SIÊU TRÍ TUỆ (Level 15-16) - Tính nhẩm
  // ============================================================
  {
    id: 'tower-mental',
    chapter: 9,
    name: 'Tháp Siêu Trí Tuệ',
    subtitle: 'Tính toán bằng tâm trí!',
    icon: '🧠',
    color: 'from-violet-400 to-purple-600',
    bgImage: '/images/zones/mental-tower.jpg',
    
    story: {
      intro: 'Tháp Siêu Trí Tuệ - nơi con học tính toán không cần bàn tính!',
      mission: 'Rèn luyện Anzan - tính nhẩm bằng Soroban trong đầu!',
      complete: 'Siêu phàm! Con đã đạt đến cảnh giới tính nhẩm. Hãy thử sức với Tia Chớp!'
    },
    
    unlockRequirement: { type: 'zone_complete', zoneId: 'arena-muldiv' },
    
    challenges: [
      {
        id: 'tower-mental-15',
        type: 'learn',
        levelId: 15,
        name: 'Anzan cơ bản',
        description: 'Tính nhẩm 4 phép tính',
        icon: '🧠',
        link: '/learn?level=15',
        lessonDetails: [
          { lessonId: 1, title: '🧠 Cộng trừ nhẩm cơ bản', desc: 'Nền tảng Anzan - tính nhẩm Soroban' },
          { lessonId: 2, title: '✖️ Nhân nhẩm cơ bản', desc: 'Tính nhẩm bảng cửu chương 2-5' },
          { lessonId: 3, title: '➗ Chia nhẩm cơ bản', desc: 'Tính nhẩm chia cho 2-5' },
          { lessonId: 4, title: '🎯 Hỗn hợp 4 phép tính', desc: 'Tính nhẩm xen kẽ 4 phép' }
        ],
        completeCondition: { type: 'level_complete', levelId: 15 }
      },
      {
        id: 'tower-mental-16',
        type: 'learn',
        levelId: 16,
        name: 'Anzan nâng cao',
        description: 'Tính nhẩm số 2 chữ số',
        icon: '💭',
        link: '/learn?level=16',
        lessonDetails: [
          { lessonId: 1, title: '🧠 Cộng trừ nhẩm nâng cao', desc: 'Tính nhẩm số 2 chữ số' },
          { lessonId: 2, title: '✖️ Nhân nhẩm nâng cao', desc: 'Bảng 6-9 và nhân số 2 chữ số' },
          { lessonId: 3, title: '➗ Chia nhẩm nâng cao', desc: 'Chia cho 6-9 và số 2-3 chữ số' },
          { lessonId: 4, title: '🎯 Hỗn hợp 4 phép tính', desc: 'Tính nhẩm tổng hợp số 2 chữ số' }
        ],
        completeCondition: { type: 'level_complete', levelId: 16 }
      },
      {
        id: 'tower-mental-practice',
        type: 'special',
        mode: 'mentalMath',
        name: 'Siêu Trí Tuệ',
        description: 'Thử thách tính nhẩm!',
        icon: '🌟',
        link: '/practice?mode=mixed&difficulty=2',
        specialInfo: {
          mode: 'mentalMath',
          target: '10 câu đúng',
          difficulty: 'Tăng dần',
          skills: ['Anzan cơ bản', 'Tính nhẩm 4 phép']
        },
        completeCondition: { 
          type: 'practice_correct', 
          mode: 'mentalMath', 
          minCorrect: 10 
        }
      }
    ],
    
    skillsGained: ['Anzan cơ bản', 'Tính nhẩm 4 phép', 'Siêu Trí Tuệ']
  },

  // ============================================================
  // ⚡ CHƯƠNG 10: ĐỈNH TIA CHỚP (Level 17-18) - Flash Anzan
  // ============================================================
  {
    id: 'peak-flash',
    chapter: 10,
    name: 'Đỉnh Tia Chớp',
    subtitle: 'Tốc độ ánh sáng!',
    icon: '⚡',
    color: 'from-yellow-300 to-amber-500',
    bgImage: '/images/zones/lightning-peak.jpg',
    
    story: {
      intro: 'Đỉnh Tia Chớp - thử thách cuối cùng dành cho bậc thầy Soroban!',
      mission: 'Chinh phục Flash Anzan - tính toán với tốc độ ánh sáng!',
      complete: 'HUYỀN THOẠI! Con đã đạt đến đỉnh cao Soroban! 🏆'
    },
    
    unlockRequirement: { type: 'zone_complete', zoneId: 'tower-mental' },
    
    challenges: [
      {
        id: 'peak-flash-17',
        type: 'learn',
        levelId: 17,
        name: 'Tốc độ',
        description: 'Tính nhanh với thời gian',
        icon: '⏱️',
        link: '/learn?level=17',
        lessonDetails: [
          { lessonId: 1, title: '⚡ Cộng trừ tốc độ', desc: 'Tính nhẩm với thời gian giới hạn' },
          { lessonId: 2, title: '⚡ Nhân tốc độ', desc: 'Nhân nhẩm bảng cửu chương nhanh' },
          { lessonId: 3, title: '⚡ Chia tốc độ', desc: 'Chia nhẩm với thời gian giới hạn' },
          { lessonId: 4, title: '⚡ Hỗn hợp tốc độ', desc: 'Xen kẽ 4 phép tính với thời gian' }
        ],
        completeCondition: { type: 'level_complete', levelId: 17 }
      },
      {
        id: 'peak-flash-18',
        type: 'learn',
        levelId: 18,
        name: 'Flash Anzan',
        description: 'Nhớ số nhanh như chớp',
        icon: '⚡',
        link: '/learn?level=18',
        lessonDetails: [
          { lessonId: 1, title: '🧠 Nhớ số nhanh', desc: 'Nhớ số 1-2 chữ số hiện nhanh' },
          { lessonId: 2, title: '🧠 Cộng 2-3 số', desc: 'Xem 2-3 số liên tiếp, cộng dồn' },
          { lessonId: 3, title: '🧠 Cộng trừ hỗn hợp', desc: '3-4 số với phép trừ' },
          { lessonId: 4, title: '🧠 Flash Anzan nhanh', desc: '4-5 số với tốc độ 0.8-1 giây' },
          { lessonId: 5, title: '🔥 Flash Anzan siêu tốc', desc: '5-7 số với tốc độ 0.5-0.7 giây' }
        ],
        completeCondition: { type: 'level_complete', levelId: 18 }
      },
      {
        id: 'peak-flash-practice',
        type: 'special',
        mode: 'flashAnzan',
        name: 'Tia Chớp',
        description: 'Thử thách Flash Anzan!',
        icon: '🌩️',
        link: '/tool/flash-zan',
        specialInfo: {
          mode: 'flashAnzan',
          target: '5 câu đúng',
          difficulty: 'Cấp 2+',
          skills: ['Flash Anzan', 'Phản xạ siêu nhanh']
        },
        completeCondition: { 
          type: 'practice_correct', 
          mode: 'flashAnzan', 
          minDifficulty: 2,
          minCorrect: 5 
        }
      }
    ],
    
    skillsGained: ['Tính tốc độ', 'Flash Anzan', 'Soroban Master']
  },

  // ============================================================
  // 🏆 ĐIỂM MỐC CUỐI: CHỨNG CHỈ TOÀN DIỆN
  // ============================================================
  {
    id: 'milestone-complete-cert',
    chapter: 10,
    name: 'Lâu Đài Kho Báu Tri Thức',
    subtitle: '🏆 Đích đến cuối cùng!',
    icon: '🏆',
    color: 'from-amber-300 via-yellow-400 to-orange-500',
    bgImage: '/images/zones/treasure-castle.jpg',
    isMilestone: true,
    
    story: {
      intro: '🎊 Chào mừng đến Lâu Đài Kho Báu Tri Thức - đích đến của hành trình vĩ đại!',
      mission: 'Con đã hoàn thành tất cả thử thách. Nhận phần thưởng xứng đáng!',
      complete: '🎉🏆 CHÚC MỪNG! Con đã đạt được KHO BÁU TRI THỨC và CHỨNG CHỈ SOROBAN TOÀN DIỆN! 🏆🎉'
    },
    
    unlockRequirement: { type: 'zone_complete', zoneId: 'peak-flash' },
    
    challenges: [
      {
        id: 'cert-complete-final',
        type: 'milestone',
        name: 'Nhận Chứng Chỉ Toàn Diện',
        description: 'Hoàn thành toàn bộ lộ trình!',
        icon: '👑',
        link: '/certificate',
        milestoneInfo: {
          certType: 'complete',
          title: 'Chứng Chỉ Soroban Toàn Diện',
          requirements: ['Hoàn thành Level 1-18', 'Vượt qua tất cả Đấu Trường', 'Chinh phục Flash Anzan']
        },
        completeCondition: { type: 'certificate', certType: 'complete' }
      }
    ],
    
    skillsGained: ['🏆 CHỨNG CHỈ SOROBAN TOÀN DIỆN', '👑 MASTER SOROBAN'],
    reward: { type: 'certificate', certType: 'complete' }
  }
];

// ============================================================
// 📊 HELPER FUNCTIONS
// ============================================================

/**
 * Lấy zone theo ID
 */
export function getZoneById(zoneId) {
  return ADVENTURE_ZONES.find(z => z.id === zoneId);
}

/**
 * Lấy zones theo chapter
 */
export function getZonesByChapter(chapter) {
  return ADVENTURE_ZONES.filter(z => z.chapter === chapter);
}

/**
 * Lấy tổng số chapters
 */
export function getTotalChapters() {
  return Math.max(...ADVENTURE_ZONES.map(z => z.chapter));
}

/**
 * Lấy zones là milestone
 */
export function getMilestoneZones() {
  return ADVENTURE_ZONES.filter(z => z.isMilestone);
}

/**
 * Tính % hoàn thành tổng
 */
export function calculateOverallProgress(completedZoneIds) {
  const totalZones = ADVENTURE_ZONES.length;
  const completed = completedZoneIds.length;
  return Math.round((completed / totalZones) * 100);
}

/**
 * Lấy zone tiếp theo cần làm
 */
export function getNextZone(completedZoneIds) {
  return ADVENTURE_ZONES.find(z => !completedZoneIds.includes(z.id));
}

/**
 * Lấy message từ Guide Character
 */
export function getGuideMessage(type, customIndex = null) {
  const messages = GUIDE_CHARACTER[`${type}Messages`];
  if (!messages) return GUIDE_CHARACTER.greetings.default;
  
  const index = customIndex !== null ? customIndex : Math.floor(Math.random() * messages.length);
  return messages[index % messages.length];
}

/**
 * Lấy lời chào theo thời gian
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return GUIDE_CHARACTER.greetings.morning;
  if (hour >= 12 && hour < 18) return GUIDE_CHARACTER.greetings.afternoon;
  if (hour >= 18 && hour < 22) return GUIDE_CHARACTER.greetings.evening;
  return GUIDE_CHARACTER.greetings.default;
}

// ============================================================
// 🎯 EXPORT MẶC ĐỊNH
// ============================================================
const adventureConfig = {
  GUIDE_CHARACTER,
  ADVENTURE_ZONES,
  getZoneById,
  getZonesByChapter,
  getTotalChapters,
  getMilestoneZones,
  calculateOverallProgress,
  getNextZone,
  getGuideMessage,
  getGreeting
};

export default adventureConfig;
