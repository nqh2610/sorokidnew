/**
 * 🦉 CÚ SORO - NGƯỜI DẪN CHUYỆN
 * Cấu hình câu chuyện, background, vật trôi nổi cho từng zone
 * 
 * STORYLINE TỔNG THỂ:
 * Cú Soro - vị thần bàn tính cổ đại - thức giấc sau 1000 năm.
 * Kho Báu Tri Thức bị phong ấn. Chỉ những ai chinh phục tất cả thử thách 
 * mới xứng đáng mở khóa kho báu và nhận Chứng Chỉ.
 */

// ============================================================
// 🎨 ZONE BACKGROUNDS - Màu nền và gradient
// ============================================================
export const ZONE_BACKGROUNDS = {
  // ==================== ADDSUB ZONES ====================
  'village': {
    gradient: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    color: '#E8F5E9',
    overlay: 'rgba(200, 230, 201, 0.3)'
  },
  'forest': {
    gradient: 'linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%)',
    color: '#C8E6C9',
    overlay: 'rgba(165, 214, 167, 0.3)'
  },
  'valley': {
    gradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
    color: '#FFF8E1',
    overlay: 'rgba(255, 236, 179, 0.3)'
  },
  'hill': {
    gradient: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
    color: '#FFF3E0',
    overlay: 'rgba(255, 224, 178, 0.3)'
  },
  'tower': {
    gradient: 'linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 100%)',
    color: '#ECEFF1',
    overlay: 'rgba(207, 216, 220, 0.3)'
  },
  'city-numbers': {
    gradient: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    color: '#E3F2FD',
    overlay: 'rgba(187, 222, 251, 0.3)'
  },
  'kingdom': {
    gradient: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
    color: '#F3E5F5',
    overlay: 'rgba(225, 190, 231, 0.3)'
  },
  'mental-tower': {
    gradient: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)',
    color: '#E8EAF6',
    overlay: 'rgba(197, 202, 233, 0.3)'
  },
  'mental-tower-advanced': {
    gradient: 'linear-gradient(135deg, #EDE7F6 0%, #D1C4E9 100%)',
    color: '#EDE7F6',
    overlay: 'rgba(209, 196, 233, 0.3)'
  },
  'speed-temple': {
    gradient: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
    color: '#FFEBEE',
    overlay: 'rgba(255, 205, 210, 0.3)'
  },
  'flash-peak-candle': {
    gradient: 'linear-gradient(135deg, #FFFDE7 0%, #FFF9C4 100%)',
    color: '#FFFDE7',
    overlay: 'rgba(255, 249, 196, 0.3)'
  },
  'flash-peak-moon': {
    gradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
    color: '#FFF8E1',
    overlay: 'rgba(255, 236, 179, 0.3)'
  },
  'treasure-castle': {
    gradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFD54F 50%, #FF8F00 100%)',
    color: '#FFF8E1',
    overlay: 'rgba(255, 213, 79, 0.3)'
  },
  
  // ==================== MULDIV ZONES ====================
  'cave-multiply': {
    gradient: 'linear-gradient(135deg, #EFEBE9 0%, #D7CCC8 100%)',
    color: '#EFEBE9',
    overlay: 'rgba(215, 204, 200, 0.3)'
  },
  'lake-divide-basic': {
    gradient: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)',
    color: '#E0F7FA',
    overlay: 'rgba(178, 235, 242, 0.3)'
  },
  'lake-divide-advanced': {
    gradient: 'linear-gradient(135deg, #B2EBF2 0%, #80DEEA 100%)',
    color: '#B2EBF2',
    overlay: 'rgba(128, 222, 234, 0.3)'
  },
  'arena-four': {
    gradient: 'linear-gradient(135deg, #FBE9E7 0%, #FFCCBC 100%)',
    color: '#FBE9E7',
    overlay: 'rgba(255, 204, 188, 0.3)'
  },
  'mental-muldiv': {
    gradient: 'linear-gradient(135deg, #EDE7F6 0%, #D1C4E9 100%)',
    color: '#EDE7F6',
    overlay: 'rgba(209, 196, 233, 0.3)'
  },
  'speed-muldiv': {
    gradient: 'linear-gradient(135deg, #FFF3E0 0%, #FFCC80 100%)',
    color: '#FFF3E0',
    overlay: 'rgba(255, 204, 128, 0.3)'
  },
  'mixed-peak': {
    gradient: 'linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)',
    color: '#F3E5F5',
    overlay: 'rgba(206, 147, 216, 0.3)'
  },
  'supreme-castle': {
    gradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFD700 50%, #FF6F00 100%)',
    color: '#FFF8E1',
    overlay: 'rgba(255, 215, 0, 0.3)'
  }
};

// ============================================================
// 🎭 FLOATING OBJECTS - Vật thể trôi nổi theo chủ đề
// ============================================================
export const ZONE_FLOATING_OBJECTS = {
  // ==================== ADDSUB ZONES ====================
  'village': {
    theme: 'ancient', // Chủ đề: Cổ đại
    objects: [
      { icon: '📜', name: 'Cuộn giấy cổ', size: 'medium' },
      { icon: '🪶', name: 'Lông vũ', size: 'small' },
      { icon: '✒️', name: 'Bút mực', size: 'small' },
      { icon: '📚', name: 'Sách cổ', size: 'medium' },
      { icon: '🕯️', name: 'Nến thắp sáng', size: 'small' }
    ]
  },
  'forest': {
    theme: 'nature', // Chủ đề: Thiên nhiên
    objects: [
      { icon: '🍃', name: 'Lá xanh', size: 'small' },
      { icon: '🍄', name: 'Nấm phát sáng', size: 'medium' },
      { icon: '✨', name: 'Đom đóm', size: 'small' },
      { icon: '🦋', name: 'Bướm', size: 'medium' },
      { icon: '🌸', name: 'Hoa rừng', size: 'small' }
    ]
  },
  'valley': {
    theme: 'math', // Chủ đề: Toán học
    objects: [
      { icon: '1️⃣', name: 'Số 1', size: 'medium' },
      { icon: '2️⃣', name: 'Số 2', size: 'medium' },
      { icon: '3️⃣', name: 'Số 3', size: 'medium' },
      { icon: '➕', name: 'Dấu cộng', size: 'small' },
      { icon: '➖', name: 'Dấu trừ', size: 'small' }
    ]
  },
  'hill': {
    theme: 'battle', // Chủ đề: Chiến đấu
    objects: [
      { icon: '🏳️', name: 'Cờ chiến thắng', size: 'medium' },
      { icon: '🛡️', name: 'Khiên', size: 'medium' },
      { icon: '⚔️', name: 'Kiếm', size: 'small' },
      { icon: '🎯', name: 'Mục tiêu', size: 'small' },
      { icon: '🏅', name: 'Huy chương', size: 'small' }
    ]
  },
  'tower': {
    theme: 'mechanical', // Chủ đề: Cơ học cổ
    objects: [
      { icon: '⚙️', name: 'Bánh răng', size: 'medium' },
      { icon: '🕰️', name: 'Đồng hồ cổ', size: 'medium' },
      { icon: '🔩', name: 'Đinh vít', size: 'small' },
      { icon: '🧲', name: 'Nam châm', size: 'small' },
      { icon: '📐', name: 'Thước đo', size: 'small' }
    ]
  },
  'city-numbers': {
    theme: 'technology', // Chủ đề: Công nghệ
    objects: [
      { icon: '🤖', name: 'Robot nhỏ', size: 'medium' },
      { icon: '📱', name: 'Màn hình', size: 'small' },
      { icon: '💻', name: 'Chip điện tử', size: 'small' },
      { icon: '🔌', name: 'Ổ cắm', size: 'small' },
      { icon: '💡', name: 'Đèn LED', size: 'small' }
    ]
  },
  'kingdom': {
    theme: 'royal', // Chủ đề: Hoàng gia
    objects: [
      { icon: '👑', name: 'Vương miện', size: 'medium' },
      { icon: '💎', name: 'Ngọc quý', size: 'small' },
      { icon: '🏰', name: 'Lâu đài nhỏ', size: 'medium' },
      { icon: '⭐', name: 'Sao vàng', size: 'small' },
      { icon: '🎭', name: 'Mặt nạ hoàng gia', size: 'small' }
    ]
  },
  'mental-tower': {
    theme: 'brain', // Chủ đề: Trí tuệ cơ bản
    objects: [
      { icon: '🧠', name: 'Não bộ', size: 'medium' },
      { icon: '💡', name: 'Bóng đèn ý tưởng', size: 'small' },
      { icon: '🔢', name: 'Số học', size: 'small' },
      { icon: '💭', name: 'Bong bóng suy nghĩ', size: 'medium' },
      { icon: '✨', name: 'Tia sáng', size: 'small' }
    ]
  },
  'mental-tower-advanced': {
    theme: 'transcendent', // Chủ đề: Siêu việt
    objects: [
      { icon: '🧠', name: 'Não bộ phát sáng', size: 'medium' },
      { icon: '⚡', name: 'Neuron', size: 'small' },
      { icon: '🌊', name: 'Sóng não', size: 'small' },
      { icon: '🔮', name: 'Quả cầu pha lê', size: 'medium' },
      { icon: '💫', name: 'Năng lượng', size: 'small' }
    ]
  },
  'speed-temple': {
    theme: 'speed', // Chủ đề: Tốc độ
    objects: [
      { icon: '⚡', name: 'Tia chớp', size: 'medium' },
      { icon: '⏱️', name: 'Đồng hồ bấm giờ', size: 'medium' },
      { icon: '🚀', name: 'Tên lửa nhỏ', size: 'small' },
      { icon: '💨', name: 'Gió', size: 'small' },
      { icon: '🏃', name: 'Người chạy', size: 'small' }
    ]
  },
  'flash-peak-candle': {
    theme: 'candle', // Chủ đề: Ánh nến
    objects: [
      { icon: '🕯️', name: 'Nến', size: 'medium' },
      { icon: '🔥', name: 'Ngọn lửa', size: 'small' },
      { icon: '✨', name: 'Tia sáng', size: 'small' },
      { icon: '💫', name: 'Sao nhỏ', size: 'small' },
      { icon: '⭐', name: 'Ngôi sao', size: 'small' }
    ]
  },
  'flash-peak-moon': {
    theme: 'cosmic', // Chủ đề: Vũ trụ
    objects: [
      { icon: '🌙', name: 'Trăng', size: 'medium' },
      { icon: '🌟', name: 'Sao sáng', size: 'medium' },
      { icon: '✨', name: 'Bụi vũ trụ', size: 'small' },
      { icon: '💫', name: 'Sao băng', size: 'small' },
      { icon: '🔥', name: 'Ánh sáng', size: 'small' }
    ]
  },
  'treasure-castle': {
    theme: 'treasure', // Chủ đề: Kho báu
    objects: [
      { icon: '💰', name: 'Vàng', size: 'medium' },
      { icon: '💎', name: 'Kim cương', size: 'medium' },
      { icon: '🏆', name: 'Cúp vàng', size: 'medium' },
      { icon: '🎖️', name: 'Huy hiệu', size: 'small' },
      { icon: '🗝️', name: 'Chìa khóa vàng', size: 'small' }
    ]
  },
  
  // ==================== MULDIV ZONES ====================
  'cave-multiply': {
    theme: 'crystal', // Chủ đề: Tinh thể
    objects: [
      { icon: '💠', name: 'Tinh thể', size: 'medium' },
      { icon: '🔷', name: 'Thạch nhũ', size: 'medium' },
      { icon: '🪨', name: 'Đá quý', size: 'small' },
      { icon: '✖️', name: 'Dấu nhân', size: 'small' },
      { icon: '🕯️', name: 'Đuốc hang', size: 'small' }
    ]
  },
  'lake-divide-basic': {
    theme: 'water', // Chủ đề: Nước
    objects: [
      { icon: '💧', name: 'Giọt nước', size: 'small' },
      { icon: '🐟', name: 'Cá', size: 'medium' },
      { icon: '🪷', name: 'Hoa sen', size: 'medium' },
      { icon: '➗', name: 'Dấu chia', size: 'small' },
      { icon: '🌊', name: 'Sóng nhỏ', size: 'small' }
    ]
  },
  'lake-divide-advanced': {
    theme: 'deep-water', // Chủ đề: Nước sâu
    objects: [
      { icon: '🫧', name: 'Bong bóng', size: 'small' },
      { icon: '🦑', name: 'Mực', size: 'medium' },
      { icon: '🐚', name: 'Vỏ sò', size: 'small' },
      { icon: '🪸', name: 'San hô', size: 'medium' },
      { icon: '🔱', name: 'Đinh ba', size: 'small' }
    ]
  },
  'arena-four': {
    theme: 'arena', // Chủ đề: Đấu trường
    objects: [
      { icon: '⚔️', name: 'Kiếm chéo', size: 'medium' },
      { icon: '🛡️', name: 'Khiên 4 mặt', size: 'medium' },
      { icon: '➕', name: 'Dấu cộng', size: 'small' },
      { icon: '✖️', name: 'Dấu nhân', size: 'small' },
      { icon: '🎪', name: 'Đấu trường', size: 'small' }
    ]
  },
  'mental-muldiv': {
    theme: 'formula', // Chủ đề: Công thức
    objects: [
      { icon: '🧠', name: 'Não bộ', size: 'medium' },
      { icon: '📊', name: 'Biểu đồ', size: 'small' },
      { icon: '🔢', name: 'Số học', size: 'small' },
      { icon: '∑', name: 'Sigma', size: 'medium' },
      { icon: '∞', name: 'Vô cực', size: 'small' }
    ]
  },
  'speed-muldiv': {
    theme: 'fire-speed', // Chủ đề: Tốc độ lửa
    objects: [
      { icon: '🔥', name: 'Lửa', size: 'medium' },
      { icon: '⚡', name: 'Tia chớp đỏ', size: 'medium' },
      { icon: '💥', name: 'Vụ nổ', size: 'small' },
      { icon: '⏱️', name: 'Đồng hồ', size: 'small' },
      { icon: '🎯', name: 'Mục tiêu', size: 'small' }
    ]
  },
  'mixed-peak': {
    theme: 'elements', // Chủ đề: 4 nguyên tố
    objects: [
      { icon: '🔥', name: 'Lửa', size: 'medium' },
      { icon: '💧', name: 'Nước', size: 'medium' },
      { icon: '🌍', name: 'Đất', size: 'medium' },
      { icon: '💨', name: 'Gió', size: 'medium' },
      { icon: '⭐', name: 'Năng lượng', size: 'small' }
    ]
  },
  'supreme-castle': {
    theme: 'supreme', // Chủ đề: Tối thượng
    objects: [
      { icon: '👑', name: 'Vương miện tối thượng', size: 'large' },
      { icon: '🏆', name: 'Cúp vô địch', size: 'medium' },
      { icon: '💎', name: 'Kim cương hoàng gia', size: 'medium' },
      { icon: '⚜️', name: 'Huy hiệu hoàng gia', size: 'small' },
      { icon: '🌟', name: 'Ngôi sao vàng', size: 'small' }
    ]
  }
};

// ============================================================
// 🦉 CÚ SORO STORIES - Câu chuyện xuyên suốt
// ============================================================
export const SORO_STORIES = {
  // ==================== PROLOGUE ====================
  prologue: {
    title: '🦉 Truyền Thuyết Cú Soro',
    content: `
      Ngày xửa ngày xưa, có một vị thần Cú tên là Soro - người canh giữ Kho Báu Tri Thức.
      
      Cách đây 1000 năm, Kho Báu bị phong ấn bởi những con quái vật số học hung dữ.
      Cú Soro rơi vào giấc ngủ dài chờ đợi người xứng đáng...
      
      Hôm nay, cậu bé/cô bé đã đánh thức Cú Soro dậy!
      
      "Chào con! Ta là Cú Soro. Con có muốn cùng ta chinh phục các vùng đất 
      và tìm lại Kho Báu Tri Thức không?"
    `,
    soroImage: '/images/soro/soro-awaken.png'
  },
  
  // ==================== ADDSUB CHAPTER ====================
  chapter1: {
    title: '📖 Chương 1: Hành Trình Cộng Trừ',
    description: 'Từ Làng Khởi Đầu đến Lâu Đài Kho Báu',
    zones: {
      'village': {
        intro: {
          soroSays: [
            "Chào mừng con đến Làng Bàn Tính!",
            "Đây là nơi mọi hành trình bắt đầu.",
            "Con sẽ học cách sử dụng Soroban - bàn tính thần kỳ của người xưa.",
            "Hãy cẩn thận với Boss Làng - hắn thích thử thách người mới đấy!"
          ],
          mood: 'friendly'
        },
        victory: {
          soroSays: [
            "Tuyệt vời! Con đã vượt qua thử thách đầu tiên!",
            "Giờ con đã biết cách dùng Soroban rồi.",
            "Rừng Phép Cộng đang chờ đón con phía trước!"
          ],
          mood: 'proud',
          celebration: 'confetti',
          sound: 'victory-1'
        }
      },
      'forest': {
        intro: {
          soroSays: [
            "Đây là Rừng Phép Cộng - nơi những con số muốn được gộp lại!",
            "Con sẽ học về 'Bạn Nhỏ' - những cặp số cộng lại bằng 5.",
            "Đừng lo, ta sẽ hướng dẫn con từng bước.",
            "Cẩn thận nhé, Boss Rừng khá mạnh đấy!"
          ],
          mood: 'encouraging'
        },
        victory: {
          soroSays: [
            "Xuất sắc! Con đã thuần thục phép cộng và Bạn Nhỏ!",
            "Kỹ năng của con đang tiến bộ nhanh chóng.",
            "Thung Lũng Phép Trừ đang chờ - con đã sẵn sàng chưa?"
          ],
          mood: 'excited',
          celebration: 'fireworks',
          sound: 'victory-2'
        }
      },
      'valley': {
        intro: {
          soroSays: [
            "Chào mừng đến Thung Lũng Phép Trừ!",
            "Ở đây con sẽ học cách làm số nhỏ đi.",
            "Bạn Nhỏ cũng giúp ích nhiều khi trừ đấy!",
            "Hãy cẩn thận với những hố sâu số học nhé!"
          ],
          mood: 'cautious'
        },
        victory: {
          soroSays: [
            "Giỏi lắm! Con đã chinh phục Thung Lũng!",
            "Phép trừ giờ không còn khó với con nữa.",
            "Đồi Bạn Lớn - nơi ẩn giấu bí mật số 10 đang chờ!"
          ],
          mood: 'proud',
          celebration: 'stars',
          sound: 'victory-3'
        }
      },
      'hill': {
        intro: {
          soroSays: [
            "Đồi Bạn Lớn - nơi cất giữ bí mật của số 10!",
            "Bạn Lớn là những cặp số cộng lại bằng 10.",
            "Đây là chìa khóa để tính toán qua hàng chục!",
            "Thử thách khó hơn rồi, nhưng ta tin con làm được!"
          ],
          mood: 'mysterious'
        },
        victory: {
          soroSays: [
            "Phi thường! Con đã nắm vững bí mật Bạn Lớn!",
            "Giờ con có thể tính toán qua 10 dễ dàng.",
            "Đài Kết Hợp - nơi hợp nhất sức mạnh đang chờ!"
          ],
          mood: 'amazed',
          celebration: 'rainbow',
          sound: 'victory-4'
        }
      },
      'tower': {
        intro: {
          soroSays: [
            "Đài Kết Hợp - nơi Bạn Nhỏ và Bạn Lớn hợp sức!",
            "Con sẽ học cách kết hợp cả hai để giải mọi bài toán.",
            "Đây là kỹ năng quan trọng của bậc thầy Soroban!",
            "Boss Đài rất mạnh, hãy chuẩn bị tinh thần nhé!"
          ],
          mood: 'serious'
        },
        victory: {
          soroSays: [
            "Tuyệt đỉnh! Con đã thành thạo nghệ thuật kết hợp!",
            "Không còn phép tính nào khó với con nữa.",
            "Thành Phố Số Lớn - vùng đất của hàng trăm đang chờ!"
          ],
          mood: 'impressed',
          celebration: 'golden',
          sound: 'victory-5'
        }
      },
      'city-numbers': {
        intro: {
          soroSays: [
            "Chào mừng đến Thành Phố Số Lớn!",
            "Ở đây con sẽ chinh phục số 2 và 3 chữ số.",
            "Robot số học sẽ giúp con luyện tập.",
            "Thành phố rộng lớn, hãy kiên nhẫn nhé!"
          ],
          mood: 'welcoming'
        },
        victory: {
          soroSays: [
            "Xuất sắc! Con đã làm chủ số hàng trăm!",
            "Từ 1 đến 999 - không số nào làm khó con.",
            "Vương Quốc Nghìn đang chờ - vùng đất hùng vĩ nhất!"
          ],
          mood: 'excited',
          celebration: 'city-lights',
          sound: 'victory-6'
        }
      },
      'kingdom': {
        intro: {
          soroSays: [
            "Vương Quốc Nghìn - nơi những con số khổng lồ ngự trị!",
            "Con sẽ chinh phục số 4 chữ số - từ 1000 đến 9999.",
            "Đây là đỉnh cao của phép tính thông thường!",
            "Vua Số Lớn sẽ thử thách con - hãy sẵn sàng!"
          ],
          mood: 'regal'
        },
        victory: {
          soroSays: [
            "VĨ ĐẠI! Con đã làm chủ số hàng nghìn!",
            "Con giờ là Hoàng Tử/Công Chúa của Vương Quốc Số.",
            "Nhưng hành trình chưa kết thúc - Tháp Tính Nhẩm đang chờ!"
          ],
          mood: 'majestic',
          celebration: 'royal',
          sound: 'victory-7'
        }
      },
      'mental-tower': {
        intro: {
          soroSays: [
            "🧠 Chào mừng đến Tháp Trí Tuệ - nơi kỳ diệu nhất!",
            "Con sẽ học Anzan - tính toán bằng bàn tính trong TÂM TRÍ.",
            "Nhắm mắt lại... tưởng tượng bàn tính hiện ra...",
            "Bắt đầu với số 1 chữ số - nền tảng của Siêu Trí Tuệ!"
          ],
          mood: 'mystical'
        },
        victory: {
          soroSays: [
            "✨ TUYỆT VỜI! Con đã mở khóa Siêu Trí Tuệ cơ bản!",
            "Bàn tính bắt đầu hiện hình trong tâm trí con rồi đấy.",
            "Tháp Trí Tuệ Tầng 2 - thử thách số 2 chữ số đang chờ!"
          ],
          mood: 'transcendent',
          celebration: 'mind-blast',
          sound: 'victory-8'
        }
      },
      'mental-tower-advanced': {
        intro: {
          soroSays: [
            "🧠⚡ Tháp Trí Tuệ Tầng 2 - Thử thách nâng cao!",
            "Con đã nhẩm được số 1 chữ số... giờ thử số 2 chữ số!",
            "Bàn tính trong đầu con phải LỚN HƠN, RÕ HƠN.",
            "Đây là cảnh giới của những bậc thầy Soroban thực sự!"
          ],
          mood: 'transcendent'
        },
        victory: {
          soroSays: [
            "🌟 SIÊU PHÀM! Con đã đạt đỉnh cao Siêu Trí Tuệ!",
            "Số 2 chữ số giờ nhẩm dễ như số 1 chữ số.",
            "Đền Tốc Độ đang chờ - xem con NHANH đến đâu!"
          ],
          mood: 'amazed',
          celebration: 'brain-wave',
          sound: 'victory-8b'
        }
      },
      'speed-temple': {
        intro: {
          soroSays: [
            "⚡ Đền Tốc Độ - nơi thử thách giới hạn phản xạ!",
            "Con phải tính NHANH NHƯ CHỚP để vượt qua.",
            "Đồng hồ đang đếm ngược - mỗi giây đều quý giá!",
            "Thần Tốc Độ sẽ xem con có đủ nhanh không!"
          ],
          mood: 'intense'
        },
        victory: {
          soroSays: [
            "⚡ NHANH NHƯ CHỚP! Con đã chinh phục Tốc Độ!",
            "Phản xạ của con giờ nhanh như tia sét.",
            "Đỉnh Ánh Nến - Flash Anzan 1 số đang chờ thử thách!"
          ],
          mood: 'electrified',
          celebration: 'lightning',
          sound: 'victory-9'
        }
      },
      'flash-peak-candle': {
        intro: {
          soroSays: [
            "🕯️ Đỉnh Ánh Nến - nơi Flash Anzan bắt đầu!",
            "Số sẽ CHỚP lên rồi BIẾN MẤT trong nháy mắt.",
            "Không nhìn thấy số... chỉ có thể GHI NHỚ!",
            "Ánh nến dịu dàng sẽ soi sáng số 1 chữ số cho con."
          ],
          mood: 'mystical'
        },
        victory: {
          soroSays: [
            "🕯️✨ XUẤT SẮC! Con đã mở mắt thần Flash Anzan!",
            "Số 1 chữ số chớp nhanh... con vẫn tính được!",
            "Đỉnh Ánh Trăng - Flash 2 số khó hơn đang chờ thử thách!"
          ],
          mood: 'legendary',
          celebration: 'candle-glow',
          sound: 'victory-10a'
        }
      },
      'flash-peak-moon': {
        intro: {
          soroSays: [
            "🌙 Đỉnh Ánh Trăng - đỉnh cao nhất của Flash Anzan!",
            "Ánh nến đã soi sáng con... giờ ánh trăng sẽ thử thách!",
            "Số 2 chữ số CHỚP NHANH HƠN, NHIỀU HƠN!",
            "Đây là kỹ năng cao nhất - chỉ bậc thầy mới làm được!"
          ],
          mood: 'ultimate'
        },
        victory: {
          soroSays: [
            "🌙⚡ HUYỀN THOẠI! Con là BẬC THẦY FLASH ANZAN!",
            "Số chớp nhanh... con vẫn nhìn thấy, vẫn tính được!",
            "🏆 LÂU ĐÀI KHO BÁU - ĐÍCH ĐẾN CUỐI CÙNG ĐÃ MỞ!"
          ],
          mood: 'legendary',
          celebration: 'flash-explosion',
          sound: 'victory-10'
        }
      },
      'treasure-castle': {
        intro: {
          soroSays: [
            "🏆🏰 CHÀO MỪNG ĐẾN LÂU ĐÀI KHO BÁU!",
            "Con đã vượt qua 12 vùng đất... đây là ĐÍCH ĐẾN CUỐI CÙNG!",
            "3 Đại Boss đang canh giữ CHỨNG CHỈ VÀNG.",
            "Dùng tất cả kỹ năng con có - chiến thắng sẽ thuộc về con!"
          ],
          mood: 'epic'
        },
        victory: {
          soroSays: [
            "🎉🏆 CHÚC MỪNG! CON ĐÃ TÌM ĐƯỢC KHO BÁU! 🏆🎉",
            "Con xứng đáng nhận CHỨNG CHỈ CỘNG TRỪ SOROBAN!",
            "Nhưng hành trình chưa kết thúc...",
            "ĐẢO NHÂN CHIA đang chờ đón bậc thầy mới!"
          ],
          mood: 'triumphant',
          celebration: 'grand-finale',
          sound: 'certificate-earned'
        }
      }
    }
  },
  
  // ==================== MULDIV CHAPTER ====================
  chapter2: {
    title: '📖 Chương 2: Hành Trình Nhân Chia',
    description: 'Từ Hang Phép Nhân đến Lâu Đài Tối Thượng',
    prerequisite: 'addSub',
    zones: {
      'cave-multiply': {
        intro: {
          soroSays: [
            "Chào mừng con trở lại - giờ là BẬC THẦY CỘNG TRỪ!",
            "Hang Phép Nhân - nơi con học nhân số lên nhiều lần.",
            "Bảng cửu chương sẽ là vũ khí mới của con!",
            "Quái vật hang động rất mạnh, nhưng con đã sẵn sàng!"
          ],
          mood: 'welcoming-master'
        },
        victory: {
          soroSays: [
            "Phi thường! Con đã nắm vững phép nhân!",
            "Bảng cửu chương giờ nằm trong lòng bàn tay.",
            "Hồ Chia - nơi học chia số đang chờ đón!"
          ],
          mood: 'proud',
          celebration: 'crystal-burst',
          sound: 'victory-muldiv-1'
        }
      },
      'lake-divide-basic': {
        intro: {
          soroSays: [
            "Hồ Chia Cơ Bản - nơi học chia số thành nhiều phần!",
            "Phép chia là ngược lại của phép nhân.",
            "Hãy nhớ bảng cửu chương - nó sẽ giúp con chia!",
            "Thủy quái hồ sẽ thử thách con đấy!"
          ],
          mood: 'calm'
        },
        victory: {
          soroSays: [
            "Giỏi lắm! Con đã nắm chia cơ bản!",
            "Chia cho 2-7 giờ dễ như ăn kẹo.",
            "Hồ Chia Nâng Cao - thử thách khó hơn đang chờ!"
          ],
          mood: 'encouraging',
          celebration: 'water-splash',
          sound: 'victory-muldiv-2'
        }
      },
      'lake-divide-advanced': {
        intro: {
          soroSays: [
            "Hồ Chia Nâng Cao - vùng nước sâu hơn!",
            "Con sẽ học chia cho 8, 9 và chia số lớn.",
            "Kỹ thuật phức tạp hơn, nhưng con làm được!",
            "Cá mập số học đang chờ thử thách con!"
          ],
          mood: 'challenging'
        },
        victory: {
          soroSays: [
            "Xuất sắc! Con đã thành thạo Nhân và Chia!",
            "Giờ con có thể tính toán mọi thứ.",
            "Đấu Trường Tứ Phép - thử thách tổng hợp đang chờ!"
          ],
          mood: 'impressed',
          celebration: 'deep-water',
          sound: 'victory-muldiv-3'
        }
      },
      'arena-four': {
        intro: {
          soroSays: [
            "ĐĂNG TRƯỜNG TỨ PHÉP - nơi 4 phép tính hội tụ!",
            "Cộng, Trừ, Nhân, Chia - tất cả sẽ được thử thách.",
            "Đây là nơi dành cho những chiến binh thực sự!",
            "Hãy cho thấy con xứng đáng với danh hiệu Bậc Thầy!"
          ],
          mood: 'battle'
        },
        victory: {
          soroSays: [
            "Con đã chinh phục Tứ Phép!",
            "4 phép tính giờ là 4 vũ khí trong tay con.",
            "Tháp Tính Nhẩm Nhân Chia - cảnh giới mới đang chờ!"
          ],
          mood: 'victorious',
          celebration: 'arena-champion',
          sound: 'victory-muldiv-4'
        }
      },
      'mental-muldiv': {
        intro: {
          soroSays: [
            "Tháp Tính Nhẩm - rèn luyện Anzan Nhân Chia!",
            "Con sẽ nhân chia bằng bàn tính trong đầu.",
            "Đây là kỹ năng siêu việt của bậc thầy!",
            "Hãy tập trung - tâm trí là vũ khí mạnh nhất!"
          ],
          mood: 'mystical'
        },
        victory: {
          soroSays: [
            "SIÊU PHÀM! Con đã đạt Siêu Trí Tuệ Nhân Chia!",
            "Tâm trí con giờ có thể nhân chia trong tích tắc.",
            "Đền Tốc Độ Nhân Chia - thử thách tốc độ đang chờ!"
          ],
          mood: 'transcendent',
          celebration: 'mind-power',
          sound: 'victory-muldiv-5'
        }
      },
      'speed-muldiv': {
        intro: {
          soroSays: [
            "Đền Tốc Độ - nhân chia siêu tốc!",
            "Thời gian giới hạn - con phải nhanh như lửa!",
            "Mỗi giây đều quý giá - đừng lãng phí!",
            "Thần Lửa Tốc Độ đang chờ thử thách con!"
          ],
          mood: 'intense'
        },
        victory: {
          soroSays: [
            "NHANH NHƯ LỬA! Con đã chinh phục Tốc Độ Nhân Chia!",
            "Không ai có thể theo kịp tốc độ của con.",
            "Đỉnh Hỗn Hợp - thử thách tổng hợp cuối cùng đang chờ!"
          ],
          mood: 'blazing',
          celebration: 'fire-burst',
          sound: 'victory-muldiv-6'
        }
      },
      'mixed-peak': {
        intro: {
          soroSays: [
            "Đỉnh Hỗn Hợp - nơi 4 nguyên tố hòa quyện!",
            "Cộng Trừ Nhân Chia - tất cả ở mức cao nhất!",
            "Đây là thử thách cuối trước Lâu Đài Tối Thượng.",
            "Hãy cho thấy con là MASTER thực sự!"
          ],
          mood: 'ultimate'
        },
        victory: {
          soroSays: [
            "HOÀN HẢO! Con đã làm chủ cả 4 phép tính!",
            "4 nguyên tố số học giờ phục tùng con.",
            "LÂU ĐÀI TỐI THƯỢNG - ĐÍCH ĐẾN CUỐI CÙNG ĐÃ MỞ!"
          ],
          mood: 'elemental-master',
          celebration: 'elements-unite',
          sound: 'victory-muldiv-7'
        }
      },
      'supreme-castle': {
        intro: {
          soroSays: [
            "👑 CHÀO MỪNG ĐẾN LÂU ĐÀI TỐI THƯỢNG!",
            "Đây là đỉnh cao nhất của hành trình Soroban.",
            "3 Boss Đại Ma Vương đang canh giữ Chứng Chỉ Tối Thượng.",
            "Hãy dùng tất cả sức mạnh con có!"
          ],
          mood: 'supreme'
        },
        victory: {
          soroSays: [
            "🎉👑🏆 CHÚC MỪNG MASTER SOROBAN! 🏆👑🎉",
            "Con đã đạt được CHỨNG CHỈ SOROBAN TOÀN DIỆN!",
            "Con là HUYỀN THOẠI - người chinh phục cả Kho Báu Tri Thức!",
            "Cú Soro tự hào về con - hành trình đã hoàn thành!"
          ],
          mood: 'supreme-triumphant',
          celebration: 'supreme-finale',
          sound: 'supreme-certificate'
        }
      }
    }
  },
  
  // ==================== EPILOGUE ====================
  epilogue: {
    title: '🦉 Lời Kết Của Cú Soro',
    content: `
      "Con đã hoàn thành hành trình tìm Kho Báu Tri Thức!
      
      Từ một người mới bắt đầu ở Làng Bàn Tính,
      con đã trở thành MASTER SOROBAN thực thụ.
      
      Nhưng hãy nhớ - tri thức là vô tận.
      Hãy tiếp tục luyện tập mỗi ngày.
      
      Ta - Cú Soro - sẽ luôn ở đây chờ đợi con.
      
      Hẹn gặp lại trong những thử thách mới! 🦉"
    `,
    soroImage: '/images/soro/soro-proud.png'
  }
};

// ============================================================
// 🎊 VICTORY EFFECTS - Hiệu ứng chiến thắng
// ============================================================
export const VICTORY_EFFECTS = {
  'confetti': {
    type: 'particles',
    particles: ['🎊', '🎉', '✨', '⭐'],
    duration: 3000,
    intensity: 'medium'
  },
  'fireworks': {
    type: 'fireworks',
    colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'],
    duration: 4000,
    intensity: 'high'
  },
  'stars': {
    type: 'particles',
    particles: ['⭐', '🌟', '✨', '💫'],
    duration: 3000,
    intensity: 'medium'
  },
  'rainbow': {
    type: 'rainbow',
    duration: 3500,
    intensity: 'high'
  },
  'golden': {
    type: 'particles',
    particles: ['🏆', '👑', '💰', '✨'],
    duration: 4000,
    intensity: 'high'
  },
  'city-lights': {
    type: 'lights',
    colors: ['#00D9FF', '#FF00D9', '#D9FF00'],
    duration: 3000,
    intensity: 'medium'
  },
  'royal': {
    type: 'royal',
    particles: ['👑', '💎', '⚜️', '🏰'],
    duration: 4000,
    intensity: 'high'
  },
  'mind-blast': {
    type: 'energy',
    color: '#9B59B6',
    duration: 3500,
    intensity: 'high'
  },
  'lightning': {
    type: 'lightning',
    color: '#F1C40F',
    duration: 3000,
    intensity: 'high'
  },
  'flash-explosion': {
    type: 'flash',
    colors: ['#FFFFFF', '#FFD700', '#FF6B6B'],
    duration: 4000,
    intensity: 'extreme'
  },
  'grand-finale': {
    type: 'finale',
    effects: ['fireworks', 'confetti', 'golden'],
    duration: 6000,
    intensity: 'extreme'
  },
  'crystal-burst': {
    type: 'particles',
    particles: ['💎', '💠', '🔷', '✨'],
    duration: 3000,
    intensity: 'medium'
  },
  'water-splash': {
    type: 'particles',
    particles: ['💧', '🌊', '💦', '🐟'],
    duration: 3000,
    intensity: 'medium'
  },
  'deep-water': {
    type: 'bubbles',
    color: '#00BCD4',
    duration: 3500,
    intensity: 'medium'
  },
  'arena-champion': {
    type: 'particles',
    particles: ['⚔️', '🛡️', '🏆', '🎖️'],
    duration: 4000,
    intensity: 'high'
  },
  'mind-power': {
    type: 'energy',
    color: '#673AB7',
    duration: 3500,
    intensity: 'high'
  },
  'fire-burst': {
    type: 'particles',
    particles: ['🔥', '💥', '⚡', '✨'],
    duration: 3500,
    intensity: 'high'
  },
  'elements-unite': {
    type: 'elements',
    particles: ['🔥', '💧', '🌍', '💨'],
    duration: 4000,
    intensity: 'extreme'
  },
  'supreme-finale': {
    type: 'supreme',
    effects: ['fireworks', 'golden', 'royal', 'elements-unite'],
    duration: 8000,
    intensity: 'supreme'
  }
};

// ============================================================
// 🔧 HELPER FUNCTIONS
// ============================================================

/**
 * Lấy background cho zone
 */
export function getZoneBackground(zoneId) {
  return ZONE_BACKGROUNDS[zoneId] || ZONE_BACKGROUNDS['village'];
}

/**
 * Lấy floating objects cho zone
 */
export function getZoneFloatingObjects(zoneId) {
  return ZONE_FLOATING_OBJECTS[zoneId] || ZONE_FLOATING_OBJECTS['village'];
}

/**
 * Lấy story cho zone (intro hoặc victory)
 */
export function getZoneStory(zoneId, type = 'intro') {
  // Tìm trong chapter 1 (AddSub)
  const chapter1Story = SORO_STORIES.chapter1.zones[zoneId];
  if (chapter1Story) {
    return chapter1Story[type] || null;
  }
  
  // Tìm trong chapter 2 (MulDiv)
  const chapter2Story = SORO_STORIES.chapter2.zones[zoneId];
  if (chapter2Story) {
    return chapter2Story[type] || null;
  }
  
  return null;
}

/**
 * Lấy victory effect theo tên
 */
export function getVictoryEffect(effectName) {
  return VICTORY_EFFECTS[effectName] || VICTORY_EFFECTS['confetti'];
}

/**
 * Lấy toàn bộ config cho zone
 */
export function getFullZoneConfig(zoneId) {
  return {
    background: getZoneBackground(zoneId),
    floatingObjects: getZoneFloatingObjects(zoneId),
    introStory: getZoneStory(zoneId, 'intro'),
    victoryStory: getZoneStory(zoneId, 'victory')
  };
}
