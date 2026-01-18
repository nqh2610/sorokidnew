/**
 * 🗺️ GAME MAP CONFIG - Đi Tìm Kho Báu Tri Thức
 * 
 * Cấu trúc: Stages học lần lượt, Boss là Luyện tập/Thi đấu
 * Hệ thống điểm: Sử dụng điểm chung của hệ thống (không có điểm riêng)
 * 
 * Database sử dụng:
 * - Progress: tiến độ học (levelId, lessonId)
 * - ExerciseResult: luyện tập (exerciseType, difficulty, isCorrect)
 * - CompeteResult: thi đấu (arenaId = "mode-difficulty-questions")
 */

// ============================================================
// 🏝️ ĐẢO CỘNG TRỪ - LỘ TRÌNH ĐẠT CHỨNG CHỈ CỘNG TRỪ
// ============================================================

export const GAME_STAGES = [
  // ============================================================
  // 🏘️ ZONE 1: LÀNG BÀN TÍNH THẦN KỲ (Level 1)
  // ============================================================
  
  // Stage 1-4: Học Level 1
  {
    stageId: 1,
    zoneId: 'village',
    type: 'lesson',
    levelId: 1,
    lessonId: 1,
    name: '🎒 Khám phá Soroban',
    description: 'Làm quen bàn tính thần kỳ',
    icon: '📚',
    link: '/learn/1/1',
    unlockCondition: null // Stage đầu tiên, luôn mở
  },
  {
    stageId: 2,
    zoneId: 'village',
    type: 'lesson',
    levelId: 1,
    lessonId: 2,
    name: '🔢 Số 1-4: Hạt Đất',
    description: 'Tạo số 1-4 bằng hạt Đất',
    icon: '📚',
    link: '/learn/1/2',
    unlockCondition: { type: 'lesson', levelId: 1, lessonId: 1 }
  },
  {
    stageId: 3,
    zoneId: 'village',
    type: 'lesson',
    levelId: 1,
    lessonId: 3,
    name: '⭐ Số 5-9: Hạt Trời',
    description: 'Dùng hạt Trời cho số 5-9',
    icon: '📚',
    link: '/learn/1/3',
    unlockCondition: { type: 'lesson', levelId: 1, lessonId: 2 }
  },
  {
    stageId: 4,
    zoneId: 'village',
    type: 'lesson',
    levelId: 1,
    lessonId: 4,
    name: '🔟 Số 10-99: Hai cột',
    description: 'Biểu diễn số 2 chữ số',
    icon: '📚',
    link: '/learn/1/4',
    unlockCondition: { type: 'lesson', levelId: 1, lessonId: 3 }
  },
  
  // Stage 5: BOSS - Luyện tập TẠO SỐ (không phải phép cộng!)
  // Zone 1 chỉ học biểu diễn số, chưa học phép tính
  {
    stageId: 5,
    zoneId: 'village',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Làng - Thử Thách Tạo Số',
    description: 'Luyện Tạo Số • Tập Sự • 8 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=create&difficulty=1',
    practiceInfo: {
      mode: 'create',           // Chế độ TẠO SỐ, không phải addition
      modeName: 'Tạo Số',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 8,
      // 🆕 Skill config - chỉ tạo số, không có phép tính
      skillLevel: 'create-number',
      digits: 1
    },
    unlockCondition: { type: 'lesson', levelId: 1, lessonId: 4 },
    completeCondition: { type: 'practice', mode: 'create', difficulty: 1, minCorrect: 8 }
  },

  // ============================================================
  // 🌲 ZONE 2: RỪNG PHÉP CỘNG (Level 2-3)
  // ============================================================
  
  // Stage 6-8: Học Level 2
  {
    stageId: 6,
    zoneId: 'forest',
    type: 'lesson',
    levelId: 2,
    lessonId: 1,
    name: '➕ Cộng đủ hạt',
    description: 'Cộng khi có đủ hạt Đất',
    icon: '📚',
    link: '/learn/2/1',
    unlockCondition: { type: 'stage', stageId: 5 }
  },
  {
    stageId: 7,
    zoneId: 'forest',
    type: 'lesson',
    levelId: 2,
    lessonId: 2,
    name: '➕ Cộng với hạt Trời',
    description: 'Cộng khi kết quả từ 5 trở lên',
    icon: '📚',
    link: '/learn/2/2',
    unlockCondition: { type: 'lesson', levelId: 2, lessonId: 1 }
  },
  {
    stageId: 8,
    zoneId: 'forest',
    type: 'lesson',
    levelId: 2,
    lessonId: 3,
    name: '🏋️ Luyện tập cộng dễ',
    description: 'Ôn tập củng cố phép cộng',
    icon: '📚',
    link: '/learn/2/3',
    unlockCondition: { type: 'lesson', levelId: 2, lessonId: 2 }
  },
  
  // Stage 9: BOSS - Luyện tập Cộng CƠ BẢN (chỉ cộng đủ hạt)
  // Ở đây học sinh mới học cộng đủ hạt + cộng với hạt Trời
  // CHƯA học Bạn Nhỏ nên chỉ sinh bài cộng cơ bản
  {
    stageId: 9,
    zoneId: 'forest',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Cộng Đơn',
    description: 'Luyện Phép Cộng cơ bản • 8 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=addition&difficulty=1&skill=basic-add',
    practiceInfo: {
      mode: 'addition',
      modeName: 'Phép Cộng',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 8,
      // 🆕 Skill config - CHỈ cộng cơ bản (đủ hạt)
      skillLevel: 'basic-add',
      digits: 1
    },
    unlockCondition: { type: 'lesson', levelId: 2, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'addition', difficulty: 1, minCorrect: 8 }
  },
  
  // Stage 10-12: Học Level 3 (Bạn Nhỏ Cộng)
  {
    stageId: 10,
    zoneId: 'forest',
    type: 'lesson',
    levelId: 3,
    lessonId: 1,
    name: '🤝 Làm quen Bạn Nhỏ',
    description: 'Học cặp số cộng lại = 5',
    icon: '📚',
    link: '/learn/3/1',
    unlockCondition: { type: 'stage', stageId: 9 }
  },
  {
    stageId: 11,
    zoneId: 'forest',
    type: 'lesson',
    levelId: 3,
    lessonId: 2,
    name: '➕ Cộng dùng Bạn Nhỏ',
    description: 'Áp dụng Bạn Nhỏ khi hết hạt Đất',
    icon: '📚',
    link: '/learn/3/2',
    unlockCondition: { type: 'lesson', levelId: 3, lessonId: 1 }
  },
  {
    stageId: 12,
    zoneId: 'forest',
    type: 'lesson',
    levelId: 3,
    lessonId: 3,
    name: '🏋️ Luyện Bạn Nhỏ Cộng',
    description: 'Thành thạo cộng với Bạn Nhỏ',
    icon: '📚',
    link: '/learn/3/3',
    unlockCondition: { type: 'lesson', levelId: 3, lessonId: 2 }
  },
  
  // Stage 13: BOSS - Thi đấu Cộng (cơ bản + Bạn Nhỏ)
  // Ở đây học sinh đã học xong Bạn Nhỏ Cộng
  {
    stageId: 13,
    zoneId: 'forest',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Rừng Xanh',
    description: 'Thi đấu Cộng (Bạn Nhỏ) • 10 câu • 7+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=addition&difficulty=1&questions=10&skill=friend5-add',
    competeInfo: {
      mode: 'addition',
      modeName: 'Phép Cộng',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      questions: 10,
      minCorrect: 7,
      arenaId: 'addition-1-10',
      // 🆕 Skill config - cộng cơ bản + Bạn Nhỏ (KHÔNG có Bạn Lớn)
      skillLevel: ['basic-add', 'friend5-add'],
      digits: 1
    },
    unlockCondition: { type: 'lesson', levelId: 3, lessonId: 3 },
    completeCondition: { type: 'compete', arenaId: 'addition-1-10', minCorrect: 7 }
  },

  // ============================================================
  // 🏔️ ZONE 3: THUNG LŨNG PHÉP TRỪ (Level 4)
  // ============================================================
  
  // Stage 14-17: Học Level 4
  {
    stageId: 14,
    zoneId: 'valley',
    type: 'lesson',
    levelId: 4,
    lessonId: 1,
    name: '➖ Trừ đơn giản',
    description: 'Trừ khi có đủ hạt để bỏ',
    icon: '📚',
    link: '/learn/4/1',
    unlockCondition: { type: 'stage', stageId: 13 }
  },
  {
    stageId: 15,
    zoneId: 'valley',
    type: 'lesson',
    levelId: 4,
    lessonId: 2,
    name: '➖ Trừ dùng Bạn Nhỏ',
    description: 'Áp dụng Bạn Nhỏ khi thiếu hạt',
    icon: '📚',
    link: '/learn/4/2',
    unlockCondition: { type: 'lesson', levelId: 4, lessonId: 1 }
  },
  {
    stageId: 16,
    zoneId: 'valley',
    type: 'lesson',
    levelId: 4,
    lessonId: 3,
    name: '🏋️ Luyện Bạn Nhỏ Trừ',
    description: 'Thành thạo trừ với Bạn Nhỏ',
    icon: '📚',
    link: '/learn/4/3',
    unlockCondition: { type: 'lesson', levelId: 4, lessonId: 2 }
  },
  
  // Stage 17: BOSS - Luyện tập Trừ (cơ bản + Bạn Nhỏ)
  // Ở đây học sinh đã học trừ cơ bản + Bạn Nhỏ Trừ
  {
    stageId: 17,
    zoneId: 'valley',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Trừ',
    description: 'Luyện Phép Trừ (Bạn Nhỏ) • 10 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=subtraction&difficulty=1&skill=friend5-sub',
    practiceInfo: {
      mode: 'subtraction',
      modeName: 'Phép Trừ',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 10,
      // 🆕 Skill config - trừ cơ bản + Bạn Nhỏ (KHÔNG có Bạn Lớn)
      skillLevel: ['basic-sub', 'friend5-sub'],
      digits: 1
    },
    unlockCondition: { type: 'lesson', levelId: 4, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'subtraction', difficulty: 1, minCorrect: 10 }
  },
  
  // Stage 18: Học bài 4.4 - MIX
  {
    stageId: 18,
    zoneId: 'valley',
    type: 'lesson',
    levelId: 4,
    lessonId: 4,
    name: '🎯 MIX Cộng Trừ Bạn Nhỏ',
    description: 'Kết hợp cộng trừ với Bạn Nhỏ',
    icon: '📚',
    link: '/learn/4/4',
    unlockCondition: { type: 'stage', stageId: 17 }
  },
  
  // Stage 19: BOSS - Thi đấu Cộng Trừ Mix
  {
    stageId: 19,
    zoneId: 'valley',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Thung Lũng',
    description: 'Thi đấu Cộng Trừ Mix • Tập Sự • 10 câu • 6+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=addSubMixed&difficulty=1&questions=10',
    competeInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      questions: 10,
      minCorrect: 6,
      arenaId: 'addSubMixed-1-10'
    },
    unlockCondition: { type: 'lesson', levelId: 4, lessonId: 4 },
    completeCondition: { type: 'compete', arenaId: 'addSubMixed-1-10', minCorrect: 6 }
  },

  // ============================================================
  // ⭐ ZONE 4: ĐỒI BẠN LỚN (Level 5-6)
  // ============================================================
  
  // Stage 20-22: Học Level 5 (Bạn Lớn Cộng)
  {
    stageId: 20,
    zoneId: 'hill',
    type: 'lesson',
    levelId: 5,
    lessonId: 1,
    name: '🤝 Làm quen Bạn Lớn',
    description: 'Học cặp số cộng lại = 10',
    icon: '📚',
    link: '/learn/5/1',
    unlockCondition: { type: 'stage', stageId: 19 }
  },
  {
    stageId: 21,
    zoneId: 'hill',
    type: 'lesson',
    levelId: 5,
    lessonId: 2,
    name: '➕ Cộng dùng Bạn Lớn',
    description: 'Cộng bằng cách sang cột chục',
    icon: '📚',
    link: '/learn/5/2',
    unlockCondition: { type: 'lesson', levelId: 5, lessonId: 1 }
  },
  {
    stageId: 22,
    zoneId: 'hill',
    type: 'lesson',
    levelId: 5,
    lessonId: 3,
    name: '🏋️ Luyện Bạn Lớn Cộng',
    description: 'Thành thạo cộng với Bạn Lớn',
    icon: '📚',
    link: '/learn/5/3',
    unlockCondition: { type: 'lesson', levelId: 5, lessonId: 2 }
  },
  
  // Stage 23: BOSS - Luyện Cộng qua 10 (Bạn Lớn = 2 chữ số)
  {
    stageId: 23,
    zoneId: 'hill',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Cộng Qua 10',
    description: 'Luyện Phép Cộng • Chiến Binh • 8 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=addition&difficulty=2',
    practiceInfo: {
      mode: 'addition',
      modeName: 'Phép Cộng',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 8
    },
    unlockCondition: { type: 'lesson', levelId: 5, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'addition', difficulty: 2, minCorrect: 8 }
  },
  
  // Stage 24-27: Học Level 6 (Bạn Lớn Trừ)
  {
    stageId: 24,
    zoneId: 'hill',
    type: 'lesson',
    levelId: 6,
    lessonId: 1,
    name: '➖ Trừ dùng Bạn Lớn',
    description: 'Trừ bằng cách mượn từ hàng chục',
    icon: '📚',
    link: '/learn/6/1',
    unlockCondition: { type: 'stage', stageId: 23 }
  },
  {
    stageId: 25,
    zoneId: 'hill',
    type: 'lesson',
    levelId: 6,
    lessonId: 2,
    name: '➖ Trừ qua chục nâng cao',
    description: 'Luyện trừ khi phải mượn từ chục',
    icon: '📚',
    link: '/learn/6/2',
    unlockCondition: { type: 'lesson', levelId: 6, lessonId: 1 }
  },
  {
    stageId: 26,
    zoneId: 'hill',
    type: 'lesson',
    levelId: 6,
    lessonId: 3,
    name: '🏋️ Luyện Bạn Lớn Trừ',
    description: 'Thành thạo trừ với Bạn Lớn',
    icon: '📚',
    link: '/learn/6/3',
    unlockCondition: { type: 'lesson', levelId: 6, lessonId: 2 }
  },
  {
    stageId: 27,
    zoneId: 'hill',
    type: 'lesson',
    levelId: 6,
    lessonId: 4,
    name: '🎯 MIX Cộng Trừ Bạn Lớn',
    description: 'Kết hợp cộng trừ với Bạn Lớn',
    icon: '📚',
    link: '/learn/6/4',
    unlockCondition: { type: 'lesson', levelId: 6, lessonId: 3 }
  },
  
  // Stage 28: BOSS - Thi đấu Cộng Trừ Mix
  {
    stageId: 28,
    zoneId: 'hill',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Đồi Xanh',
    description: 'Thi đấu Cộng Trừ Mix • Chiến Binh • 10 câu • 7+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=addSubMixed&difficulty=2&questions=10',
    competeInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      questions: 10,
      minCorrect: 7,
      arenaId: 'addSubMixed-2-10'
    },
    unlockCondition: { type: 'lesson', levelId: 6, lessonId: 4 },
    completeCondition: { type: 'compete', arenaId: 'addSubMixed-2-10', minCorrect: 7 }
  },

  // ============================================================
  // 🏛️ ZONE 5: ĐÀI KẾT HỢP (Level 7)
  // ============================================================
  
  // Stage 29-32: Học Level 7
  {
    stageId: 29,
    zoneId: 'tower',
    type: 'lesson',
    levelId: 7,
    lessonId: 1,
    name: '🎯 Cộng kết hợp',
    description: 'Kết hợp Bạn Nhỏ + Bạn Lớn khi cộng',
    icon: '📚',
    link: '/learn/7/1',
    unlockCondition: { type: 'stage', stageId: 28 }
  },
  {
    stageId: 30,
    zoneId: 'tower',
    type: 'lesson',
    levelId: 7,
    lessonId: 2,
    name: '🎯 Trừ kết hợp',
    description: 'Kết hợp mượn và Bạn Nhỏ khi trừ',
    icon: '📚',
    link: '/learn/7/2',
    unlockCondition: { type: 'lesson', levelId: 7, lessonId: 1 }
  },
  {
    stageId: 31,
    zoneId: 'tower',
    type: 'lesson',
    levelId: 7,
    lessonId: 3,
    name: '🏋️ Tổng hợp cộng trừ',
    description: 'Luyện tập kết hợp tất cả công thức',
    icon: '📚',
    link: '/learn/7/3',
    unlockCondition: { type: 'lesson', levelId: 7, lessonId: 2 }
  },
  {
    stageId: 32,
    zoneId: 'tower',
    type: 'lesson',
    levelId: 7,
    lessonId: 4,
    name: '📝 Ôn tập Cộng Trừ cơ bản',
    description: 'Tổng ôn tập Level 1-7',
    icon: '📚',
    link: '/learn/7/4',
    unlockCondition: { type: 'lesson', levelId: 7, lessonId: 3 }
  },
  
  // Stage 33: BOSS - Luyện tập Mix
  {
    stageId: 33,
    zoneId: 'tower',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Kết Hợp',
    description: 'Luyện Cộng Trừ Mix • Chiến Binh • 8 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=addSubMixed&difficulty=2',
    practiceInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 8
    },
    unlockCondition: { type: 'lesson', levelId: 7, lessonId: 4 },
    completeCondition: { type: 'practice', mode: 'addSubMixed', difficulty: 2, minCorrect: 8 }
  },
  
  // Stage 34: BOSS - Đấu Trường Cộng Trừ
  {
    stageId: 34,
    zoneId: 'tower',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Đài Kết Hợp',
    description: 'Thi đấu Cộng Trừ Mix • Chiến Binh • 15 câu • 10+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=addSubMixed&difficulty=2&questions=15',
    competeInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      questions: 15,
      minCorrect: 10,
      arenaId: 'addSubMixed-2-15'
    },
    unlockCondition: { type: 'stage', stageId: 33 },
    completeCondition: { type: 'compete', arenaId: 'addSubMixed-2-15', minCorrect: 10 }
  },

  // ============================================================
  // 🏙️ ZONE 6: THÀNH PHỐ 2-3 CHỮ SỐ (Level 8-9)
  // ============================================================
  
  // Stage 35-37: Học Level 8 (Số 2 chữ số)
  {
    stageId: 35,
    zoneId: 'city-numbers',
    type: 'lesson',
    levelId: 8,
    lessonId: 1,
    name: '📝 Cộng 2 số không nhớ',
    description: 'Cộng hai số không cần nhớ sang hàng',
    icon: '📚',
    link: '/learn/8/1',
    unlockCondition: { type: 'stage', stageId: 34 }
  },
  {
    stageId: 36,
    zoneId: 'city-numbers',
    type: 'lesson',
    levelId: 8,
    lessonId: 2,
    name: '📝 Cộng 2 số có nhớ',
    description: 'Cộng hai số có nhớ sang hàng chục',
    icon: '📚',
    link: '/learn/8/2',
    unlockCondition: { type: 'lesson', levelId: 8, lessonId: 1 }
  },
  {
    stageId: 37,
    zoneId: 'city-numbers',
    type: 'lesson',
    levelId: 8,
    lessonId: 3,
    name: '📝 Trừ 2 chữ số',
    description: 'Trừ hai số có 2 chữ số',
    icon: '📚',
    link: '/learn/8/3',
    unlockCondition: { type: 'lesson', levelId: 8, lessonId: 2 }
  },
  
  // Stage 38: BOSS - Luyện 2 chữ số
  {
    stageId: 38,
    zoneId: 'city-numbers',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss 2 Chữ Số',
    description: 'Luyện Cộng Trừ Mix • Dũng Sĩ • 8 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=addSubMixed&difficulty=3',
    practiceInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      minCorrect: 8
    },
    unlockCondition: { type: 'lesson', levelId: 8, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'addSubMixed', difficulty: 3, minCorrect: 8 }
  },
  
  // Stage 39-41: Học Level 9 (Số 3 chữ số)
  {
    stageId: 39,
    zoneId: 'city-numbers',
    type: 'lesson',
    levelId: 9,
    lessonId: 1,
    name: '💯 Số 100-999',
    description: 'Biểu diễn số 3 chữ số trên Soroban',
    icon: '📚',
    link: '/learn/9/1',
    unlockCondition: { type: 'stage', stageId: 38 }
  },
  {
    stageId: 40,
    zoneId: 'city-numbers',
    type: 'lesson',
    levelId: 9,
    lessonId: 2,
    name: '➕ Cộng 3 chữ số',
    description: 'Cộng hai số có 3 chữ số',
    icon: '📚',
    link: '/learn/9/2',
    unlockCondition: { type: 'lesson', levelId: 9, lessonId: 1 }
  },
  {
    stageId: 41,
    zoneId: 'city-numbers',
    type: 'lesson',
    levelId: 9,
    lessonId: 3,
    name: '➖ Trừ 3 chữ số',
    description: 'Trừ hai số có 3 chữ số',
    icon: '📚',
    link: '/learn/9/3',
    unlockCondition: { type: 'lesson', levelId: 9, lessonId: 2 }
  },
  
  // Stage 42: BOSS - Thi đấu 3 chữ số
  {
    stageId: 42,
    zoneId: 'city-numbers',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường 3 Chữ Số',
    description: 'Thi đấu Cộng Trừ Mix • Dũng Sĩ • 10 câu • 7+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=addSubMixed&difficulty=3&questions=10',
    competeInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      questions: 10,
      minCorrect: 7,
      arenaId: 'addSubMixed-3-10'
    },
    unlockCondition: { type: 'lesson', levelId: 9, lessonId: 3 },
    completeCondition: { type: 'compete', arenaId: 'addSubMixed-3-10', minCorrect: 7 }
  },
  
  // ============================================================
  // 🏰 ZONE 7: VƯƠNG QUỐC SỐ LỚN (Level 10 - Số 4 chữ số)
  // ============================================================
  
  // Stage 43-46: Học Level 10 (Số 4 chữ số)
  {
    stageId: 43,
    zoneId: 'kingdom',
    type: 'lesson',
    levelId: 10,
    lessonId: 1,
    name: '🔢 Số 1000-9999',
    description: 'Biểu diễn số 4 chữ số trên Soroban',
    icon: '📚',
    link: '/learn/10/1',
    unlockCondition: { type: 'stage', stageId: 42 }
  },
  {
    stageId: 44,
    zoneId: 'kingdom',
    type: 'lesson',
    levelId: 10,
    lessonId: 2,
    name: '➕ Cộng 4 chữ số',
    description: 'Cộng số có 4 chữ số',
    icon: '📚',
    link: '/learn/10/2',
    unlockCondition: { type: 'lesson', levelId: 10, lessonId: 1 }
  },
  {
    stageId: 45,
    zoneId: 'kingdom',
    type: 'lesson',
    levelId: 10,
    lessonId: 3,
    name: '➖ Trừ 4 chữ số',
    description: 'Trừ số có 4 chữ số',
    icon: '📚',
    link: '/learn/10/3',
    unlockCondition: { type: 'lesson', levelId: 10, lessonId: 2 }
  },
  {
    stageId: 46,
    zoneId: 'kingdom',
    type: 'lesson',
    levelId: 10,
    lessonId: 4,
    name: '📝 Ôn tập số lớn',
    description: 'Ôn tập cộng trừ với số 2-4 chữ số',
    icon: '📚',
    link: '/learn/10/4',
    unlockCondition: { type: 'lesson', levelId: 10, lessonId: 3 }
  },
  
  // Stage 47: BOSS - Luyện số lớn
  {
    stageId: 47,
    zoneId: 'kingdom',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Số Lớn',
    description: 'Luyện Cộng Trừ Mix • Cao Thủ • 12 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=addSubMixed&difficulty=4',
    practiceInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 4,
      difficultyName: 'Cao Thủ',
      minCorrect: 12
    },
    unlockCondition: { type: 'lesson', levelId: 10, lessonId: 4 },
    completeCondition: { type: 'practice', mode: 'addSubMixed', difficulty: 4, minCorrect: 12 }
  },
  
  // Stage 48: BOSS - Đấu Trường Số Lớn
  {
    stageId: 48,
    zoneId: 'kingdom',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Vương Quốc',
    description: 'Thi đấu Cộng Trừ Mix • Cao Thủ • 15 câu • 10+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=addSubMixed&difficulty=4&questions=15',
    competeInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 4,
      difficultyName: 'Cao Thủ',
      questions: 15,
      minCorrect: 10,
      arenaId: 'addSubMixed-4-15'
    },
    unlockCondition: { type: 'stage', stageId: 47 },
    completeCondition: { type: 'compete', arenaId: 'addSubMixed-4-15', minCorrect: 10 }
  },

  // ============================================================
  // 🧠 ZONE 8: THÁP SIÊU TRÍ TUỆ (Level 15.1, 16.1 - Tính nhẩm)
  // Sắp xếp: 1 số < 2 số, Cộng < Trừ < Mix
  // Mỗi boss luyện tập có 1 boss thi đấu tương ứng
  // ============================================================
  
  // Stage 49: Học 15.1 - Cộng trừ nhẩm cơ bản (1 chữ số)
  {
    stageId: 49,
    zoneId: 'mental-tower',
    type: 'lesson',
    levelId: 15,
    lessonId: 1,
    name: '🧠 Cộng trừ nhẩm cơ bản',
    description: 'Nền tảng Anzan - tính nhẩm Soroban 1 chữ số',
    icon: '📚',
    link: '/learn/15/1',
    unlockCondition: { type: 'stage', stageId: 48 }
  },
  
  // Stage 50-51: Siêu Trí Tuệ 1 số - Phép Cộng (Luyện + Thi đấu)
  {
    stageId: 50,
    zoneId: 'mental-tower',
    type: 'boss',
    bossType: 'practice',
    name: '🧠 Luyện STT 1 Số Cộng',
    description: 'Siêu Trí Tuệ • 1 chữ số • Phép Cộng • 6 bài đúng',
    icon: '🧠',
    link: '/practice/auto?mode=mentalMath&difficulty=1&subMode=addition',
    practiceInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      subMode: 'addition',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 6
    },
    unlockCondition: { type: 'lesson', levelId: 15, lessonId: 1 },
    completeCondition: { type: 'practice', mode: 'mentalMath', difficulty: 1, minCorrect: 6 }
  },
  {
    stageId: 51,
    zoneId: 'mental-tower',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường STT 1 Số Cộng',
    description: 'Thi đấu STT • 1 số • Cộng • 8 câu • 5+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mentalMath&difficulty=1&subMode=addition&questions=8',
    competeInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      subMode: 'addition',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      questions: 8,
      minCorrect: 5,
      arenaId: 'mentalMath-1-add-8'
    },
    unlockCondition: { type: 'stage', stageId: 50 },
    completeCondition: { type: 'compete', arenaId: 'mentalMath-1-add-8', minCorrect: 5 }
  },
  
  // Stage 52-53: Siêu Trí Tuệ 1 số - Phép Trừ (Luyện + Thi đấu)
  {
    stageId: 52,
    zoneId: 'mental-tower',
    type: 'boss',
    bossType: 'practice',
    name: '🧠 Luyện STT 1 Số Trừ',
    description: 'Siêu Trí Tuệ • 1 chữ số • Phép Trừ • 6 bài đúng',
    icon: '🧠',
    link: '/practice/auto?mode=mentalMath&difficulty=1&subMode=subtraction',
    practiceInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      subMode: 'subtraction',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 6
    },
    unlockCondition: { type: 'stage', stageId: 51 },
    completeCondition: { type: 'practice', mode: 'mentalMath', difficulty: 1, minCorrect: 6 }
  },
  {
    stageId: 53,
    zoneId: 'mental-tower',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường STT 1 Số Trừ',
    description: 'Thi đấu STT • 1 số • Trừ • 8 câu • 5+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mentalMath&difficulty=1&subMode=subtraction&questions=8',
    competeInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      subMode: 'subtraction',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      questions: 8,
      minCorrect: 5,
      arenaId: 'mentalMath-1-sub-8'
    },
    unlockCondition: { type: 'stage', stageId: 52 },
    completeCondition: { type: 'compete', arenaId: 'mentalMath-1-sub-8', minCorrect: 5 }
  },
  
  // Stage 54-55: Siêu Trí Tuệ 1 số - Mix (Luyện + Thi đấu)
  {
    stageId: 54,
    zoneId: 'mental-tower',
    type: 'boss',
    bossType: 'practice',
    name: '🧠 Luyện STT 1 Số Mix',
    description: 'Siêu Trí Tuệ • 1 chữ số • Cộng Trừ Mix • 8 bài đúng',
    icon: '🧠',
    link: '/practice/auto?mode=mentalMath&difficulty=1&subMode=addSubMixed',
    practiceInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      subMode: 'addSubMixed',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 8
    },
    unlockCondition: { type: 'stage', stageId: 53 },
    completeCondition: { type: 'practice', mode: 'mentalMath', difficulty: 1, minCorrect: 8 }
  },
  {
    stageId: 55,
    zoneId: 'mental-tower',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường STT 1 Số Mix',
    description: 'Thi đấu STT • 1 số • Mix • 10 câu • 6+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mentalMath&difficulty=1&subMode=addSubMixed&questions=10',
    competeInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      subMode: 'addSubMixed',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      questions: 10,
      minCorrect: 6,
      arenaId: 'mentalMath-1-mix-10'
    },
    unlockCondition: { type: 'stage', stageId: 54 },
    completeCondition: { type: 'compete', arenaId: 'mentalMath-1-mix-10', minCorrect: 6 }
  },
  
  // ============================================================
  // 🧠 ZONE 9: THÁP TRÍ TUỆ NÂNG CAO (Level 16.1 - Tính nhẩm 2 số)
  // Sắp xếp: Cộng < Trừ < Mix
  // ============================================================
  
  // Stage 56: Học 16.1 - Cộng trừ nhẩm nâng cao (2 chữ số)
  {
    stageId: 56,
    zoneId: 'mental-tower-advanced',
    type: 'lesson',
    levelId: 16,
    lessonId: 1,
    name: '🧠 Cộng trừ nhẩm nâng cao',
    description: 'Tính nhẩm số 2 chữ số',
    icon: '📚',
    link: '/learn/16/1',
    unlockCondition: { type: 'stage', stageId: 55 }
  },
  
  // Stage 57-58: Siêu Trí Tuệ 2 số - Phép Cộng (Luyện + Thi đấu)
  {
    stageId: 57,
    zoneId: 'mental-tower-advanced',
    type: 'boss',
    bossType: 'practice',
    name: '🧠 Luyện STT 2 Số Cộng',
    description: 'Siêu Trí Tuệ • 2 chữ số • Phép Cộng • 6 bài đúng',
    icon: '🧠',
    link: '/practice/auto?mode=mentalMath&difficulty=2&subMode=addition',
    practiceInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      subMode: 'addition',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 6
    },
    unlockCondition: { type: 'lesson', levelId: 16, lessonId: 1 },
    completeCondition: { type: 'practice', mode: 'mentalMath', difficulty: 2, minCorrect: 6 }
  },
  {
    stageId: 58,
    zoneId: 'mental-tower-advanced',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường STT 2 Số Cộng',
    description: 'Thi đấu STT • 2 số • Cộng • 8 câu • 5+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mentalMath&difficulty=2&subMode=addition&questions=8',
    competeInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      subMode: 'addition',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      questions: 8,
      minCorrect: 5,
      arenaId: 'mentalMath-2-add-8'
    },
    unlockCondition: { type: 'stage', stageId: 57 },
    completeCondition: { type: 'compete', arenaId: 'mentalMath-2-add-8', minCorrect: 5 }
  },
  
  // Stage 59-60: Siêu Trí Tuệ 2 số - Phép Trừ (Luyện + Thi đấu)
  {
    stageId: 59,
    zoneId: 'mental-tower-advanced',
    type: 'boss',
    bossType: 'practice',
    name: '🧠 Luyện STT 2 Số Trừ',
    description: 'Siêu Trí Tuệ • 2 chữ số • Phép Trừ • 6 bài đúng',
    icon: '🧠',
    link: '/practice/auto?mode=mentalMath&difficulty=2&subMode=subtraction',
    practiceInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      subMode: 'subtraction',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 6
    },
    unlockCondition: { type: 'stage', stageId: 58 },
    completeCondition: { type: 'practice', mode: 'mentalMath', difficulty: 2, minCorrect: 6 }
  },
  {
    stageId: 60,
    zoneId: 'mental-tower-advanced',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường STT 2 Số Trừ',
    description: 'Thi đấu STT • 2 số • Trừ • 8 câu • 5+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mentalMath&difficulty=2&subMode=subtraction&questions=8',
    competeInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      subMode: 'subtraction',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      questions: 8,
      minCorrect: 5,
      arenaId: 'mentalMath-2-sub-8'
    },
    unlockCondition: { type: 'stage', stageId: 59 },
    completeCondition: { type: 'compete', arenaId: 'mentalMath-2-sub-8', minCorrect: 5 }
  },
  
  // Stage 61-62: Siêu Trí Tuệ 2 số - Mix (Luyện + Thi đấu)
  {
    stageId: 61,
    zoneId: 'mental-tower-advanced',
    type: 'boss',
    bossType: 'practice',
    name: '🧠 Luyện STT 2 Số Mix',
    description: 'Siêu Trí Tuệ • 2 chữ số • Cộng Trừ Mix • 8 bài đúng',
    icon: '🧠',
    link: '/practice/auto?mode=mentalMath&difficulty=2&subMode=addSubMixed',
    practiceInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      subMode: 'addSubMixed',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 8
    },
    unlockCondition: { type: 'stage', stageId: 60 },
    completeCondition: { type: 'practice', mode: 'mentalMath', difficulty: 2, minCorrect: 8 }
  },
  {
    stageId: 62,
    zoneId: 'mental-tower-advanced',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường STT 2 Số Mix',
    description: 'Thi đấu STT • 2 số • Mix • 10 câu • 6+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mentalMath&difficulty=2&subMode=addSubMixed&questions=10',
    competeInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      subMode: 'addSubMixed',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      questions: 10,
      minCorrect: 6,
      arenaId: 'mentalMath-2-mix-10'
    },
    unlockCondition: { type: 'stage', stageId: 61 },
    completeCondition: { type: 'compete', arenaId: 'mentalMath-2-mix-10', minCorrect: 6 }
  },

  // ============================================================
  // ⚡ ZONE 9: ĐỀN TỐC ĐỘ (Level 17.1 - Tốc độ cộng trừ - Bàn phím tối đa 4 số)
  // Sắp xếp: 3 số < 4 số
  // ============================================================
  
  // Stage 63: Học 17.1 - Cộng trừ tốc độ
  {
    stageId: 63,
    zoneId: 'speed-temple',
    type: 'lesson',
    levelId: 17,
    lessonId: 1,
    name: '⚡ Cộng trừ tốc độ',
    description: 'Tính nhẩm với thời gian giới hạn',
    icon: '📚',
    link: '/learn/17/1',
    unlockCondition: { type: 'stage', stageId: 62 }
  },
  
  // Stage 64-65: Tốc Độ 3 số (Luyện + Thi đấu)
  {
    stageId: 64,
    zoneId: 'speed-temple',
    type: 'boss',
    bossType: 'practice',
    name: '⚡ Luyện Tốc Độ 3 Số',
    description: 'Luyện Cộng Trừ Mix • Dũng Sĩ • 15 bài đúng',
    icon: '⚡',
    link: '/practice/auto?mode=addSubMixed&difficulty=3',
    practiceInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      minCorrect: 15
    },
    unlockCondition: { type: 'lesson', levelId: 17, lessonId: 1 },
    completeCondition: { type: 'practice', mode: 'addSubMixed', difficulty: 3, minCorrect: 15 }
  },
  {
    stageId: 65,
    zoneId: 'speed-temple',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Tốc Độ 3 Số',
    description: 'Thi đấu Cộng Trừ Mix • Dũng Sĩ • 12 câu • 8+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=addSubMixed&difficulty=3&questions=12',
    competeInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      questions: 12,
      minCorrect: 8,
      arenaId: 'addSubMixed-3-12'
    },
    unlockCondition: { type: 'stage', stageId: 64 },
    completeCondition: { type: 'compete', arenaId: 'addSubMixed-3-12', minCorrect: 8 }
  },
  
  // Stage 66-67: Tốc Độ 4 số (Luyện + Thi đấu)
  {
    stageId: 66,
    zoneId: 'speed-temple',
    type: 'boss',
    bossType: 'practice',
    name: '⚡ Luyện Tốc Độ 4 Số',
    description: 'Luyện Cộng Trừ Mix • Cao Thủ • 20 bài đúng',
    icon: '⚡',
    link: '/practice/auto?mode=addSubMixed&difficulty=4',
    practiceInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 4,
      difficultyName: 'Cao Thủ',
      minCorrect: 20
    },
    unlockCondition: { type: 'stage', stageId: 65 },
    completeCondition: { type: 'practice', mode: 'addSubMixed', difficulty: 4, minCorrect: 20 }
  },
  {
    stageId: 67,
    zoneId: 'speed-temple',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Tốc Độ 4 Số',
    description: 'Thi đấu Cộng Trừ Mix • Cao Thủ • 15 câu • 10+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=addSubMixed&difficulty=4&questions=15',
    competeInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 4,
      difficultyName: 'Cao Thủ',
      questions: 15,
      minCorrect: 10,
      arenaId: 'addSubMixed-4-15'
    },
    unlockCondition: { type: 'stage', stageId: 66 },
    completeCondition: { type: 'compete', arenaId: 'addSubMixed-4-15', minCorrect: 10 }
  },

  // ============================================================
  // ⚡ ZONE 11: ĐỈNH ÁNH NẺN (Level 18.1-18.3 - Flash 1 số)
  // Sắp xếp: Cộng → Trừ → Mix ở mức Ánh Nến
  // ============================================================
  
  // Stage 68: Học 18.1 - Nhớ số nhanh
  {
    stageId: 68,
    zoneId: 'flash-peak-candle',
    type: 'lesson',
    levelId: 18,
    lessonId: 1,
    name: '⚡ Nhớ số nhanh',
    description: 'Nhớ số 1-2 chữ số hiện nhanh',
    icon: '📚',
    link: '/learn/18/1',
    unlockCondition: { type: 'stage', stageId: 67 }
  },
  
  // Stage 69: Học 18.2 - Cộng 2-3 số
  {
    stageId: 69,
    zoneId: 'flash-peak-candle',
    type: 'lesson',
    levelId: 18,
    lessonId: 2,
    name: '⚡ Cộng 2-3 số nhanh',
    description: 'Xem 2-3 số liên tiếp, cộng dồn',
    icon: '📚',
    link: '/learn/18/2',
    unlockCondition: { type: 'lesson', levelId: 18, lessonId: 1 }
  },
  
  // Stage 70-71: Flash 1 số Ánh Nến - Cộng (Luyện + Thi đấu)
  {
    stageId: 70,
    zoneId: 'flash-peak-candle',
    type: 'boss',
    bossType: 'practice',
    name: '⚡ Luyện Flash 1 Số Cộng',
    description: 'Flash Anzan • 1 số • Ánh Nến • Phép Cộng • 5 bài đúng',
    icon: '⚡',
    link: '/practice/auto?mode=flashAnzan&difficulty=1&subMode=addition',
    practiceInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      subMode: 'addition',
      difficulty: 1,
      difficultyName: 'Ánh Nến',
      minCorrect: 5
    },
    unlockCondition: { type: 'lesson', levelId: 18, lessonId: 2 },
    completeCondition: { type: 'practice', mode: 'flashAnzan', difficulty: 1, minCorrect: 5 }
  },
  {
    stageId: 71,
    zoneId: 'flash-peak-candle',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Flash 1 Số Cộng',
    description: 'Thi đấu Flash • 1 số • Cộng • 8 câu • 5+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=flashAnzan&difficulty=1&subMode=addition&questions=8',
    competeInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      subMode: 'addition',
      difficulty: 1,
      difficultyName: 'Ánh Nến',
      questions: 8,
      minCorrect: 5,
      arenaId: 'flash-1-add-8'
    },
    unlockCondition: { type: 'stage', stageId: 70 },
    completeCondition: { type: 'compete', arenaId: 'flash-1-add-8', minCorrect: 5 }
  },
  
  // Stage 72: Học 18.3 - Cộng trừ hỗn hợp nhanh
  {
    stageId: 72,
    zoneId: 'flash-peak-candle',
    type: 'lesson',
    levelId: 18,
    lessonId: 3,
    name: '⚡ Cộng trừ hỗn hợp nhanh',
    description: '3-4 số với phép trừ',
    icon: '📚',
    link: '/learn/18/3',
    unlockCondition: { type: 'stage', stageId: 71 }
  },
  
  // Stage 73-74: Flash 1 số Ánh Nến - Trừ (Luyện + Thi đấu)
  {
    stageId: 73,
    zoneId: 'flash-peak-candle',
    type: 'boss',
    bossType: 'practice',
    name: '⚡ Luyện Flash 1 Số Trừ',
    description: 'Flash Anzan • 1 số • Ánh Nến • Phép Trừ • 5 bài đúng',
    icon: '⚡',
    link: '/practice/auto?mode=flashAnzan&difficulty=1&subMode=subtraction',
    practiceInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      subMode: 'subtraction',
      difficulty: 1,
      difficultyName: 'Ánh Nến',
      minCorrect: 5
    },
    unlockCondition: { type: 'lesson', levelId: 18, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'flashAnzan', difficulty: 1, minCorrect: 5 }
  },
  {
    stageId: 74,
    zoneId: 'flash-peak-candle',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Flash 1 Số Trừ',
    description: 'Thi đấu Flash • 1 số • Trừ • 8 câu • 5+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=flashAnzan&difficulty=1&subMode=subtraction&questions=8',
    competeInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      subMode: 'subtraction',
      difficulty: 1,
      difficultyName: 'Ánh Nến',
      questions: 8,
      minCorrect: 5,
      arenaId: 'flash-1-sub-8'
    },
    unlockCondition: { type: 'stage', stageId: 73 },
    completeCondition: { type: 'compete', arenaId: 'flash-1-sub-8', minCorrect: 5 }
  },
  
  // Stage 75-76: Flash 1 số Ánh Nến - Mix (Luyện + Thi đấu)
  {
    stageId: 75,
    zoneId: 'flash-peak-candle',
    type: 'boss',
    bossType: 'practice',
    name: '⚡ Luyện Flash 1 Số Mix',
    description: 'Flash Anzan • 1 số • Ánh Nến • Cộng Trừ Mix • 6 bài đúng',
    icon: '⚡',
    link: '/practice/auto?mode=flashAnzan&difficulty=1&subMode=addSubMixed',
    practiceInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      subMode: 'addSubMixed',
      difficulty: 1,
      difficultyName: 'Ánh Nến',
      minCorrect: 6
    },
    unlockCondition: { type: 'stage', stageId: 74 },
    completeCondition: { type: 'practice', mode: 'flashAnzan', difficulty: 1, minCorrect: 6 }
  },
  {
    stageId: 76,
    zoneId: 'flash-peak-candle',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Flash 1 Số Mix',
    description: 'Thi đấu Flash • 1 số • Mix • 10 câu • 6+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=flashAnzan&difficulty=1&subMode=addSubMixed&questions=10',
    competeInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      subMode: 'addSubMixed',
      difficulty: 1,
      difficultyName: 'Ánh Nến',
      questions: 10,
      minCorrect: 6,
      arenaId: 'flash-1-mix-10'
    },
    unlockCondition: { type: 'stage', stageId: 75 },
    completeCondition: { type: 'compete', arenaId: 'flash-1-mix-10', minCorrect: 6 }
  },
  
  // ============================================================
  // ⚡ ZONE 12: ĐỈNH ÁNH TRĂNG (Level 18.4-18.5 - Flash 2 số)
  // Sắp xếp: Cộng → Trừ → Mix với tốc độ cao hơn
  // ============================================================
  
  // Stage 77-78: Học Flash nâng cao
  {
    stageId: 77,
    zoneId: 'flash-peak-moon',
    type: 'lesson',
    levelId: 18,
    lessonId: 4,
    name: '⚡ Flash Anzan nhanh',
    description: '4-5 số với tốc độ 0.8-1 giây',
    icon: '📚',
    link: '/learn/18/4',
    unlockCondition: { type: 'stage', stageId: 76 }
  },
  {
    stageId: 78,
    zoneId: 'flash-peak-moon',
    type: 'lesson',
    levelId: 18,
    lessonId: 5,
    name: '🔥 Flash Anzan siêu tốc',
    description: '5-7 số với tốc độ 0.5-0.7 giây',
    icon: '📚',
    link: '/learn/18/5',
    unlockCondition: { type: 'lesson', levelId: 18, lessonId: 4 }
  },
  
  // Stage 79-80: Flash 2 số Ánh Trăng - Cộng (Luyện + Thi đấu)
  {
    stageId: 79,
    zoneId: 'flash-peak-moon',
    type: 'boss',
    bossType: 'practice',
    name: '⚡ Luyện Flash 2 Số Cộng',
    description: 'Flash Anzan • 2 số • Ánh Trăng • Phép Cộng • 5 bài đúng',
    icon: '⚡',
    link: '/practice/auto?mode=flashAnzan&difficulty=2&subMode=addition',
    practiceInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      subMode: 'addition',
      difficulty: 2,
      difficultyName: 'Ánh Trăng',
      minCorrect: 5
    },
    unlockCondition: { type: 'lesson', levelId: 18, lessonId: 5 },
    completeCondition: { type: 'practice', mode: 'flashAnzan', difficulty: 2, minCorrect: 5 }
  },
  {
    stageId: 80,
    zoneId: 'flash-peak-moon',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Flash 2 Số Cộng',
    description: 'Thi đấu Flash • 2 số • Cộng • 8 câu • 5+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=flashAnzan&difficulty=2&subMode=addition&questions=8',
    competeInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      subMode: 'addition',
      difficulty: 2,
      difficultyName: 'Ánh Trăng',
      questions: 8,
      minCorrect: 5,
      arenaId: 'flash-2-add-8'
    },
    unlockCondition: { type: 'stage', stageId: 79 },
    completeCondition: { type: 'compete', arenaId: 'flash-2-add-8', minCorrect: 5 }
  },
  
  // Stage 81-82: Flash 2 số Ánh Trăng - Trừ (Luyện + Thi đấu)
  {
    stageId: 81,
    zoneId: 'flash-peak-moon',
    type: 'boss',
    bossType: 'practice',
    name: '⚡ Luyện Flash 2 Số Trừ',
    description: 'Flash Anzan • 2 số • Ánh Trăng • Phép Trừ • 5 bài đúng',
    icon: '⚡',
    link: '/practice/auto?mode=flashAnzan&difficulty=2&subMode=subtraction',
    practiceInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      subMode: 'subtraction',
      difficulty: 2,
      difficultyName: 'Ánh Trăng',
      minCorrect: 5
    },
    unlockCondition: { type: 'stage', stageId: 80 },
    completeCondition: { type: 'practice', mode: 'flashAnzan', difficulty: 2, minCorrect: 5 }
  },
  {
    stageId: 82,
    zoneId: 'flash-peak-moon',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Flash 2 Số Trừ',
    description: 'Thi đấu Flash • 2 số • Trừ • 8 câu • 5+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=flashAnzan&difficulty=2&subMode=subtraction&questions=8',
    competeInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      subMode: 'subtraction',
      difficulty: 2,
      difficultyName: 'Ánh Trăng',
      questions: 8,
      minCorrect: 5,
      arenaId: 'flash-2-sub-8'
    },
    unlockCondition: { type: 'stage', stageId: 81 },
    completeCondition: { type: 'compete', arenaId: 'flash-2-sub-8', minCorrect: 5 }
  },
  
  // Stage 83-84: Flash 2 số Ánh Trăng - Mix (Luyện + Thi đấu)
  {
    stageId: 83,
    zoneId: 'flash-peak-moon',
    type: 'boss',
    bossType: 'practice',
    name: '⚡ Luyện Flash 2 Số Mix',
    description: 'Flash Anzan • 2 số • Ánh Trăng • Cộng Trừ Mix • 6 bài đúng',
    icon: '⚡',
    link: '/practice/auto?mode=flashAnzan&difficulty=2&subMode=addSubMixed',
    practiceInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      subMode: 'addSubMixed',
      difficulty: 2,
      difficultyName: 'Ánh Trăng',
      minCorrect: 6
    },
    unlockCondition: { type: 'stage', stageId: 82 },
    completeCondition: { type: 'practice', mode: 'flashAnzan', difficulty: 2, minCorrect: 6 }
  },
  {
    stageId: 84,
    zoneId: 'flash-peak-moon',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Flash 2 Số Mix',
    description: 'Thi đấu Flash • 2 số • Mix • 10 câu • 6+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=flashAnzan&difficulty=2&subMode=addSubMixed&questions=10',
    competeInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      subMode: 'addSubMixed',
      difficulty: 2,
      difficultyName: 'Ánh Trăng',
      questions: 10,
      minCorrect: 6,
      arenaId: 'flash-2-mix-10'
    },
    unlockCondition: { type: 'stage', stageId: 83 },
    completeCondition: { type: 'compete', arenaId: 'flash-2-mix-10', minCorrect: 6 }
  },

  // ============================================================
  // 🏆 ZONE 11: LÂU ĐÀI KHO BÁU CỘNG TRỪ (Boss Cuối + Chứng Chỉ)
  // 3 Boss Cuối tổng hợp tất cả mode + Certificate
  // ============================================================
  
  // Stage 85: BOSS CUỐI 1 - Đại Chiến Cộng Trừ Mix (Bàn phím)
  {
    stageId: 85,
    zoneId: 'treasure-castle',
    type: 'boss',
    bossType: 'compete',
    isFinalBoss: true,
    name: '👑 BOSS CUỐI - Đại Chiến Cộng Trừ',
    description: 'Thi đấu Cộng Trừ Mix • Cao Thủ • 20 câu • 14+ đúng',
    icon: '👑',
    link: '/compete/auto?mode=addSubMixed&difficulty=4&questions=20',
    competeInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 4,
      difficultyName: 'Cao Thủ',
      questions: 20,
      minCorrect: 14,
      arenaId: 'final-addSubMixed-4-20'
    },
    unlockCondition: { type: 'stage', stageId: 84 },
    completeCondition: { type: 'compete', arenaId: 'final-addSubMixed-4-20', minCorrect: 14 }
  },
  
  // Stage 86: BOSS CUỐI 2 - Siêu Trí Tuệ Ultimate
  {
    stageId: 86,
    zoneId: 'treasure-castle',
    type: 'boss',
    bossType: 'compete',
    isFinalBoss: true,
    name: '👑 BOSS CUỐI - Siêu Trí Tuệ Ultimate',
    description: 'Thi đấu STT • 2 số • Mix • 15 câu • 10+ đúng',
    icon: '👑',
    link: '/compete/auto?mode=mentalMath&difficulty=2&subMode=addSubMixed&questions=15',
    competeInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      subMode: 'addSubMixed',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      questions: 15,
      minCorrect: 10,
      arenaId: 'final-mentalMath-2-mix-15'
    },
    unlockCondition: { type: 'stage', stageId: 85 },
    completeCondition: { type: 'compete', arenaId: 'final-mentalMath-2-mix-15', minCorrect: 10 }
  },
  
  // Stage 87: BOSS CUỐI 3 - Tia Chớp Ultimate
  {
    stageId: 87,
    zoneId: 'treasure-castle',
    type: 'boss',
    bossType: 'compete',
    isFinalBoss: true,
    name: '👑 BOSS CUỐI - Tia Chớp Ultimate',
    description: 'Thi đấu Flash • 2 số • Mix • 12 câu • 8+ đúng',
    icon: '👑',
    link: '/compete/auto?mode=flashAnzan&difficulty=2&subMode=addSubMixed&questions=12',
    competeInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      subMode: 'addSubMixed',
      difficulty: 2,
      difficultyName: 'Ánh Trăng',
      questions: 12,
      minCorrect: 8,
      arenaId: 'final-flash-2-mix-12'
    },
    unlockCondition: { type: 'stage', stageId: 86 },
    completeCondition: { type: 'compete', arenaId: 'final-flash-2-mix-12', minCorrect: 8 }
  },
  
  // Stage 88: KHO BÁU - Nhận Chứng Chỉ
  {
    stageId: 88,
    zoneId: 'treasure-castle',
    type: 'treasure',
    name: '🏅 KHO BÁU - CHỨNG CHỈ CỘNG TRỪ',
    description: 'Nhận Chứng Chỉ Tính Nhẩm Cộng Trừ!',
    icon: '🏅',
    link: '/certificate?type=addSub',
    certificateInfo: {
      certType: 'addSub',
      title: 'Chứng Chỉ Tính Nhẩm Cộng Trừ',
      description: 'Chứng nhận năng lực tính nhẩm cộng trừ trên bàn tính Soroban'
    },
    unlockCondition: { type: 'stage', stageId: 87 },
    completeCondition: { type: 'certificate', certType: 'addSub' }
  },
];

// ============================================================
// 🗺️ ZONES CONFIG - Thông tin các vùng đất
// Import từ zone-stories.config.js để lấy background, floating objects, stories
// ============================================================

import { 
  getZoneBackground, 
  getZoneFloatingObjects, 
  getZoneStory,
  getVictoryEffect 
} from './zone-stories.config.js';

export const GAME_ZONES = [
  {
    zoneId: 'village',
    order: 1,
    name: 'Chặng 1: Làng Khởi Đầu',
    subtitle: 'Làm quen Soroban',
    description: 'Làm quen với bàn tính Soroban - công cụ tính toán thần kỳ!',
    icon: '🏘️',
    color: 'from-green-400 to-emerald-500',
    bgImage: '/images/zones/village.jpg',
    levels: [1],
    stageRange: [1, 5],
    totalBoss: 1,
    // Thêm theme và floating objects
    theme: 'ancient',
    floatingObjects: ['📜', '🪶', '✒️', '📚', '🕯️'],
    bgGradient: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    victoryEffect: 'confetti',
    story: {
      intro: 'Hú hú! Chào mừng con đến Làng Bàn Tính Thần Kỳ! Ta là Cú Soro, sẽ dẫn con đi tìm Kho Báu Tri Thức! Trước tiên, hãy học cách sử dụng bàn tính Soroban - công cụ kỳ diệu giúp con tính toán siêu nhanh! 🦉✨',
      complete: 'Hú hú! Tuyệt vời lắm! Con đã nắm vững cách sử dụng Soroban rồi! Giờ hãy tiến vào Rừng Phép Cộng - nơi những con số đang chờ được gộp lại với nhau! 🌟'
    }
  },
  {
    zoneId: 'forest',
    order: 2,
    name: 'Chặng 2: Rừng Phép Cộng',
    subtitle: 'Học cộng & Bạn Nhỏ',
    description: 'Học phép cộng và bí kíp Bạn Nhỏ (tổng 5)!',
    icon: '🌲',
    color: 'from-emerald-400 to-green-600',
    bgImage: '/images/zones/forest.jpg',
    levels: [2, 3],
    stageRange: [6, 13],
    totalBoss: 2,
    // Thêm theme và floating objects
    theme: 'nature',
    floatingObjects: ['🍃', '🍄', '✨', '🦋', '🌸'],
    bgGradient: 'linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%)',
    victoryEffect: 'fireworks',
    story: {
      intro: 'Chào mừng đến Rừng Phép Cộng! 🌲 Ở đây, những con số rất thích được gộp lại với nhau. Con sẽ học bí kíp "Bạn Nhỏ" - một phép thuật cộng kỳ diệu với tổng bằng 5! Sẵn sàng chưa?',
      complete: 'Phi thường! Con đã làm chủ Rừng Phép Cộng và học được bí kíp Bạn Nhỏ! Phía trước là Thung Lũng Phép Trừ - nơi con sẽ học cách làm số nhỏ đi. Tiến lên nào! 🏔️'
    }
  },
  {
    zoneId: 'valley',
    order: 3,
    name: 'Chặng 3: Thung Lũng Phép Trừ',
    subtitle: 'Học trừ & Bạn Nhỏ',
    description: 'Học phép trừ và Bạn Nhỏ khi trừ!',
    icon: '🏔️',
    color: 'from-blue-400 to-cyan-500',
    bgImage: '/images/zones/valley.jpg',
    levels: [4],
    stageRange: [14, 19],
    totalBoss: 2,
    // Thêm theme và floating objects
    theme: 'math',
    floatingObjects: ['1️⃣', '2️⃣', '3️⃣', '➕', '➖'],
    bgGradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
    victoryEffect: 'stars',
    story: {
      intro: 'Hú hú! Con đã đến Thung Lũng Phép Trừ! 🏔️ Ở vùng đất này, con sẽ học cách làm số nhỏ đi bằng phép trừ. Bí kíp Bạn Nhỏ cũng sẽ giúp con ở đây đấy! Cùng khám phá nhé!',
      complete: 'Xuất sắc! Con đã chinh phục Thung Lũng Phép Trừ! Phía trước là Đồi Bạn Lớn - nơi ẩn chứa bí mật quan trọng về con số 10. Hành trình ngày càng thú vị! 🌟'
    }
  },
  {
    zoneId: 'hill',
    order: 4,
    name: 'Chặng 4: Đồi Bạn Lớn',
    subtitle: 'Bí mật số 10',
    description: 'Học công thức Bạn Lớn - chìa khóa để tính toán qua 10!',
    icon: '⭐',
    color: 'from-yellow-400 to-orange-500',
    bgImage: '/images/zones/hill.jpg',
    levels: [5, 6],
    stageRange: [20, 28],
    totalBoss: 2,
    // Thêm theme và floating objects
    theme: 'battle',
    floatingObjects: ['🏳️', '🛡️', '⚔️', '🎯', '🏅'],
    bgGradient: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
    victoryEffect: 'rainbow',
    story: {
      intro: 'Chào mừng đến Đồi Bạn Lớn! ⭐ Đây là nơi ẩn chứa bí mật quan trọng nhất: Công thức Bạn Lớn - chìa khóa để tính toán qua 10! Khi nắm vững Bạn Lớn, con sẽ tính được mọi phép tính!',
      complete: 'Vĩ đại! Con đã làm chủ công thức Bạn Lớn! Đây là bước ngoặt quan trọng trong hành trình. Giờ hãy đến Đài Kết Hợp - nơi Bạn Nhỏ và Bạn Lớn sẽ hợp sức! 🏛️'
    }
  },
  {
    zoneId: 'tower',
    order: 5,
    name: 'Chặng 5: Đài Kết Hợp',
    subtitle: 'Bạn Nhỏ + Bạn Lớn',
    description: 'Kết hợp Bạn Nhỏ và Bạn Lớn để giải quyết mọi phép tính!',
    icon: '🏛️',
    color: 'from-purple-400 to-pink-500',
    bgImage: '/images/zones/tower.jpg',
    levels: [7],
    stageRange: [29, 34],
    totalBoss: 2,
    // Thêm theme và floating objects
    theme: 'mechanical',
    floatingObjects: ['⚙️', '🕰️', '🔩', '🧲', '📐'],
    bgGradient: 'linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 100%)',
    victoryEffect: 'golden',
    story: {
      intro: 'Hú hú! Con đã đến Đài Kết Hợp! 🏛️ Đây là nơi phép thuật thật sự xảy ra - Bạn Nhỏ và Bạn Lớn sẽ kết hợp sức mạnh để giải quyết mọi phép tính phức tạp! Sẵn sàng học điều kỳ diệu?',
      complete: 'Tuyệt đỉnh! Con đã thành thạo nghệ thuật kết hợp Bạn Nhỏ và Bạn Lớn! Phía trước là Thành Phố Số Lớn - nơi con sẽ chinh phục những con số hàng chục, hàng trăm! 🏙️'
    }
  },
  {
    zoneId: 'city-numbers',
    order: 6,
    name: 'Chặng 6: Thành Phố Số Lớn',
    subtitle: 'Số 2-3 chữ số',
    description: 'Chinh phục cộng trừ với số 2 và 3 chữ số!',
    icon: '🏙️',
    color: 'from-cyan-400 to-blue-500',
    bgImage: '/images/zones/city-numbers.jpg',
    levels: [8, 9],
    stageRange: [35, 42],
    totalBoss: 2,
    // Thêm theme và floating objects
    theme: 'technology',
    floatingObjects: ['🤖', '📱', '💻', '🔌', '💡'],
    bgGradient: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    victoryEffect: 'city-lights',
    story: {
      intro: 'Chào mừng đến Thành Phố Số Lớn! 🏙️ Nơi đây những con số 2 và 3 chữ số sinh sống. Con sẽ học cách cộng trừ với hàng chục và hàng trăm - kỹ năng cần thiết cho mọi nhà toán học!',
      complete: 'Xuất sắc! Con đã làm chủ Thành Phố Số Lớn! Giờ hãy tiến vào Vương Quốc Nghìn - nơi những con số hàng nghìn đang chờ đón vị anh hùng trẻ tuổi! 👑'
    }
  },
  {
    zoneId: 'kingdom',
    order: 7,
    name: 'Chặng 7: Vương Quốc Nghìn',
    subtitle: 'Số 4 chữ số',
    description: 'Chinh phục cộng trừ với số 4 chữ số - đỉnh cao số lớn!',
    icon: '🏰',
    color: 'from-indigo-400 to-purple-600',
    bgImage: '/images/zones/kingdom.jpg',
    levels: [10],
    stageRange: [43, 48],
    totalBoss: 2,
    // Thêm theme và floating objects
    theme: 'royal',
    floatingObjects: ['👑', '💎', '🏰', '⭐', '🎭'],
    bgGradient: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
    victoryEffect: 'royal',
    story: {
      intro: 'Hú hú! Con đã đến Vương Quốc Nghìn! 🏰 Đây là vương quốc của những con số hàng nghìn hùng mạnh. Chỉ những người thực sự giỏi mới có thể chinh phục nơi này. Con có dám thử thách không?',
      complete: 'Vĩ đại! Con đã trở thành bậc thầy của Vương Quốc Nghìn! Nhưng hành trình chưa kết thúc - Tháp Trí Tuệ đang chờ con học kỹ năng siêu phàm: TÍNH NHẨM! 🧠'
    }
  },
  {
    zoneId: 'mental-tower',
    order: 8,
    name: 'Chặng 8: Tháp Trí Tuệ 1 Số',
    subtitle: 'Siêu Trí Tuệ Cơ Bản',
    description: 'Rèn luyện Anzan - tính nhẩm số 1 chữ số!',
    icon: '🧠',
    color: 'from-violet-400 to-purple-500',
    bgImage: '/images/zones/mental-tower.jpg',
    levels: [15],
    lessonIds: [[1]],
    stageRange: [49, 55],
    totalBoss: 6,
    // Thêm theme và floating objects
    theme: 'brain',
    floatingObjects: ['🧠', '💡', '🔢', '💭', '✨'],
    bgGradient: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)',
    victoryEffect: 'mind-blast',
    story: {
      intro: 'Chào mừng đến Tháp Trí Tuệ! 🧠 Đây là nơi con học kỹ năng thần kỳ: TÍNH NHẨM (Anzan)! Thay vì dùng bàn tính thực, con sẽ tưởng tượng Soroban trong đầu. Hãy bắt đầu với số 1 chữ số!',
      complete: 'Siêu phàm! Con đã làm chủ tính nhẩm số 1 chữ số! Giờ hãy thử thách Tháp Trí Tuệ Nâng Cao - tính nhẩm số 2 chữ số. Con có dám không? ⚡'
    }
  },
  {
    zoneId: 'mental-tower-advanced',
    order: 9,
    name: 'Chặng 9: Tháp Trí Tuệ 2 Số',
    subtitle: 'Siêu Trí Tuệ Nâng Cao',
    description: 'Tính nhẩm với số 2 chữ số - cảnh giới cao hơn!',
    icon: '🧠',
    color: 'from-purple-500 to-indigo-600',
    bgImage: '/images/zones/mental-tower-advanced.jpg',
    levels: [16],
    lessonIds: [[1]],
    stageRange: [56, 62],
    totalBoss: 6,
    // Thêm theme và floating objects
    theme: 'transcendent',
    floatingObjects: ['🧠', '⚡', '🌊', '🔮', '💫'],
    bgGradient: 'linear-gradient(135deg, #EDE7F6 0%, #D1C4E9 100%)',
    victoryEffect: 'mind-power',
    story: {
      intro: 'Hú hú! Tháp Trí Tuệ Nâng Cao! 🧠⚡ Đây là cảnh giới cao hơn của tính nhẩm. Con sẽ tính nhẩm với số 2 chữ số - chỉ những người có trí tuệ đặc biệt mới làm được!',
      complete: 'Vượt trội! Con đã đạt cảnh giới tính nhẩm số 2 chữ số! Phía trước là Đền Tốc Độ - nơi thử thách phản xạ và tốc độ! Sẵn sàng chưa? 🏃‍♂️'
    }
  },
  {
    zoneId: 'speed-temple',
    order: 10,
    name: 'Chặng 10: Đền Tốc Độ',
    subtitle: 'Thử thách thời gian',
    description: 'Tính toán với thời gian giới hạn - thử thách phản xạ! (Tối đa 4 chữ số)',
    icon: '⚡',
    color: 'from-orange-400 to-red-500',
    bgImage: '/images/zones/speed-temple.jpg',
    levels: [17],
    lessonIds: [[1]],
    stageRange: [63, 67],
    totalBoss: 4,
    // Thêm theme và floating objects
    theme: 'speed',
    floatingObjects: ['⚡', '⏱️', '🚀', '💨', '🏃'],
    bgGradient: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
    victoryEffect: 'lightning',
    story: {
      intro: 'Đền Tốc Độ - nơi thử thách giới hạn phản xạ của con!',
      complete: 'Nhanh như chớp! Con đã sẵn sàng cho Đỉnh Ánh Nến!'
    }
  },
  {
    zoneId: 'flash-peak-candle',
    order: 11,
    name: 'Chặng 11: Đỉnh Ánh Nến',
    subtitle: 'Flash 1 Số',
    description: 'Flash Anzan cấp Ánh Nến - số 1 chữ số!',
    icon: '🕯️',
    color: 'from-yellow-300 to-orange-400',
    bgImage: '/images/zones/flash-candle.jpg',
    levels: [18],
    lessonIds: [[1, 2, 3]],
    stageRange: [68, 76],
    totalBoss: 6,
    // Thêm theme và floating objects
    theme: 'candle',
    floatingObjects: ['🕯️', '🔥', '✨', '💫', '⭐'],
    bgGradient: 'linear-gradient(135deg, #FFFDE7 0%, #FFF9C4 100%)',
    victoryEffect: 'fireworks',
    story: {
      intro: 'Đỉnh Ánh Nến - Flash Anzan với số 1 chữ số!',
      complete: 'Xuất sắc! Con đã chinh phục Flash 1 số. Đỉnh Ánh Trăng đang chờ!'
    }
  },
  {
    zoneId: 'flash-peak-moon',
    order: 12,
    name: 'Chặng 12: Đỉnh Ánh Trăng',
    subtitle: 'Flash 2 Số',
    description: 'Flash Anzan cấp Ánh Trăng - số 2 chữ số siêu tốc!',
    icon: '🌙',
    color: 'from-amber-400 to-yellow-500',
    bgImage: '/images/zones/flash-moon.jpg',
    levels: [18],
    lessonIds: [[4, 5]],
    stageRange: [77, 84],
    totalBoss: 6,
    // Thêm theme và floating objects
    theme: 'cosmic',
    floatingObjects: ['🌙', '🌟', '✨', '💫', '🔥'],
    bgGradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
    victoryEffect: 'flash-explosion',
    story: {
      intro: 'Đỉnh Ánh Trăng - Flash Anzan với số 2 chữ số siêu tốc!',
      complete: 'HUYỀN THOẠI! Con đã chinh phục Flash Anzan! Lâu Đài Kho Báu đang chờ!'
    }
  },
  {
    zoneId: 'treasure-castle',
    order: 13,
    name: 'ĐÍCH ĐẾN: Lâu Đài Kho Báu',
    subtitle: 'Nhận Chứng Chỉ!',
    description: 'Vượt qua 3 Boss Cuối để nhận Chứng Chỉ Cộng Trừ!',
    icon: '🏆',
    color: 'from-amber-300 via-yellow-400 to-orange-500',
    bgImage: '/images/zones/treasure-castle.jpg',
    levels: [],
    stageRange: [85, 88],
    totalBoss: 3,
    hasCertificate: true,
    certificateType: 'addSub',
    // Thêm theme và floating objects
    theme: 'treasure',
    floatingObjects: ['💰', '💎', '🏆', '🎖️', '🗝️'],
    bgGradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFD54F 50%, #FF8F00 100%)',
    victoryEffect: 'grand-finale',
    story: {
      intro: '🎊 Chào mừng đến Lâu Đài Kho Báu - đích đến của hành trình Cộng Trừ!',
      complete: '🎉🏆 CHÚC MỪNG! Con đã đạt được KHO BÁU và CHỨNG CHỈ TÍNH NHẨM CỘNG TRỪ! 🏆🎉'
    }
  }
];

// ============================================================
// 🔧 HELPER FUNCTIONS
// ============================================================

/**
 * Lấy stage theo ID
 */
export function getStageById(stageId) {
  return GAME_STAGES.find(s => s.stageId === stageId);
}

/**
 * Lấy tất cả stages của một zone
 */
export function getStagesByZone(zoneId) {
  return GAME_STAGES.filter(s => s.zoneId === zoneId);
}

/**
 * Lấy zone theo ID
 */
export function getZoneById(zoneId) {
  return GAME_ZONES.find(z => z.zoneId === zoneId);
}

/**
 * Lấy index của zone (để so sánh thứ tự)
 */
export function getZoneIndex(zoneId) {
  return GAME_ZONES.findIndex(z => z.zoneId === zoneId);
}

/**
 * Lấy zone chứa stage theo stageId
 */
export function getZoneForStage(stageId) {
  const stage = getStageById(stageId);
  if (!stage) return null;
  return getZoneById(stage.zoneId);
}

/**
 * So sánh 2 zone, trả về zone có index cao hơn
 */
export function getHigherZone(zoneId1, zoneId2) {
  const idx1 = getZoneIndex(zoneId1);
  const idx2 = getZoneIndex(zoneId2);
  if (idx1 === -1) return zoneId2;
  if (idx2 === -1) return zoneId1;
  return idx1 >= idx2 ? zoneId1 : zoneId2;
}

/**
 * Tìm zone cao nhất từ danh sách completed stages
 */
export function getHighestZoneFromStages(completedStageIds) {
  if (!completedStageIds || completedStageIds.length === 0) {
    return GAME_ZONES[0]?.zoneId || null;
  }
  
  let highestZoneIndex = 0;
  completedStageIds.forEach(stageId => {
    const stage = getStageById(stageId);
    if (stage) {
      const zoneIndex = getZoneIndex(stage.zoneId);
      if (zoneIndex > highestZoneIndex) {
        highestZoneIndex = zoneIndex;
      }
    }
  });
  
  return GAME_ZONES[highestZoneIndex]?.zoneId || GAME_ZONES[0]?.zoneId;
}

/**
 * Lấy stage tiếp theo
 */
export function getNextStage(currentStageId) {
  const currentIndex = GAME_STAGES.findIndex(s => s.stageId === currentStageId);
  if (currentIndex === -1 || currentIndex === GAME_STAGES.length - 1) return null;
  return GAME_STAGES[currentIndex + 1];
}

/**
 * Lấy zone tiếp theo sau zone hiện tại
 */
export function getNextZone(currentZoneId) {
  const currentIndex = GAME_ZONES.findIndex(z => z.zoneId === currentZoneId);
  if (currentIndex === -1 || currentIndex === GAME_ZONES.length - 1) return null;
  return GAME_ZONES[currentIndex + 1];
}

/**
 * Kiểm tra stage có phải màn cuối của zone không
 */
export function isLastStageOfZone(stageId) {
  const stage = getStageById(stageId);
  if (!stage) return false;
  
  const zone = getZoneById(stage.zoneId);
  if (!zone) return false;
  
  // stageRange là [start, end], kiểm tra xem stageId có phải end không
  return zone.stageRange && stage.stageId === zone.stageRange[1];
}

/**
 * Lấy zone tiếp theo dựa vào stageId vừa hoàn thành
 * Nếu là màn cuối zone, trả về zone tiếp theo
 */
export function getNextZoneAfterStage(stageId) {
  const stage = getStageById(stageId);
  if (!stage) return null;
  
  if (isLastStageOfZone(stageId)) {
    return getNextZone(stage.zoneId);
  }
  return null; // Chưa phải màn cuối, giữ nguyên zone
}

/**
 * Kiểm tra stage có phải boss không
 */
export function isBossStage(stageId) {
  const stage = getStageById(stageId);
  return stage?.type === 'boss';
}

/**
 * Đếm số boss trong zone
 */
export function countBossesInZone(zoneId) {
  return GAME_STAGES.filter(s => s.zoneId === zoneId && s.type === 'boss').length;
}

/**
 * Tính % hoàn thành zone
 */
export function calculateZoneProgress(zoneId, completedStageIds) {
  const zoneStages = getStagesByZone(zoneId);
  const completed = zoneStages.filter(s => completedStageIds.includes(s.stageId)).length;
  return Math.round((completed / zoneStages.length) * 100);
}

// ============================================================
// 🎖️ CERTIFICATE REQUIREMENTS - TỰ ĐỘNG TỪ GAME CONFIG
// Được generate từ GAME_STAGES và GAME_ZONES
// ============================================================

/**
 * 🚀 TỐI ƯU: Single-pass scan qua GAME_STAGES
 * Thay vì 5 lần duyệt riêng biệt, chỉ duyệt 1 lần và extract tất cả data
 * Performance: O(n) thay vì O(5n)
 */
function generateCertDataFromStages() {
  // Kết quả cho lessons
  const lessonFilter = {};
  const lessonLevels = new Set();
  let totalLessons = 0;
  let totalBosses = 0;
  
  // Kết quả cho practice
  const practiceModes = new Set();
  let practiceMinDifficulty = 999;
  let practiceMinCorrect = 0;
  
  // Kết quả cho compete
  const competeModes = new Set();
  let competeMinDifficulty = 999;
  let competeMinCorrect = 0;
  
  // 🔥 Single pass - duyệt 1 lần duy nhất
  for (const stage of GAME_STAGES) {
    if (stage.type === 'lesson') {
      totalLessons++;
      if (stage.levelId && stage.lessonId) {
        lessonLevels.add(stage.levelId);
        if (!lessonFilter[stage.levelId]) {
          lessonFilter[stage.levelId] = [];
        }
        if (!lessonFilter[stage.levelId].includes(stage.lessonId)) {
          lessonFilter[stage.levelId].push(stage.lessonId);
        }
      }
    } else if (stage.type === 'boss') {
      totalBosses++;
      
      // Practice boss
      if (stage.bossType === 'practice' && stage.practiceInfo) {
        practiceModes.add(stage.practiceInfo.mode);
        if (stage.practiceInfo.difficulty < practiceMinDifficulty) {
          practiceMinDifficulty = stage.practiceInfo.difficulty;
        }
        if (stage.practiceInfo.minCorrect > practiceMinCorrect) {
          practiceMinCorrect = stage.practiceInfo.minCorrect;
        }
      }
      
      // Compete boss
      if (stage.bossType === 'compete' && stage.competeInfo) {
        competeModes.add(stage.competeInfo.mode);
        if (stage.competeInfo.difficulty < competeMinDifficulty) {
          competeMinDifficulty = stage.competeInfo.difficulty;
        }
        if (stage.competeInfo.minCorrect > competeMinCorrect) {
          competeMinCorrect = stage.competeInfo.minCorrect;
        }
      }
    }
  }
  
  // Sort lessonIds
  for (const levelId of Object.keys(lessonFilter)) {
    lessonFilter[levelId].sort((a, b) => a - b);
  }
  
  return {
    lessons: {
      levels: Array.from(lessonLevels).sort((a, b) => a - b),
      lessonFilter
    },
    practice: {
      modes: Array.from(practiceModes),
      minDifficulty: practiceMinDifficulty === 999 ? 1 : practiceMinDifficulty,
      minCorrect: practiceMinCorrect || 8
    },
    compete: {
      modes: Array.from(competeModes),
      minDifficulty: competeMinDifficulty === 999 ? 2 : competeMinDifficulty,
      minCorrect: competeMinCorrect || 6
    },
    totalLessons,
    totalBosses
  };
}

/**
 * 🎖️ CHỨNG CHỈ CỘNG TRỪ - Tự động từ game config
 */
export const CERT_REQUIREMENTS_ADDSUB = (() => {
  // 🚀 Single-pass: 1 lần duyệt thay vì 5 lần
  const certData = generateCertDataFromStages();
  const { lessons: lessonData, practice: practiceData, compete: competeData, totalLessons, totalBosses } = certData;
  
  return {
    certType: 'addSub',
    name: 'Chứng chỉ Cộng Trừ Soroban',
    description: 'Chứng nhận năng lực Cộng Trừ hoàn chỉnh: Bàn tính + Siêu Trí Tuệ + Tốc Độ + Tia Chớp',
    icon: '🎖️',
    requiredTier: 'basic',
    // Metadata từ game config
    metadata: {
      totalStages: GAME_STAGES.length,
      totalZones: GAME_ZONES.length,
      totalLessons,
      totalBosses,
      certificateZone: GAME_ZONES.find(z => z.hasCertificate)?.zoneId || 'treasure-castle'
    },
    requirements: {
      lessons: {
        ...lessonData,
        weight: 30,
        description: `Học: ${totalLessons} bài học từ các Level trong game`
      },
      practice: {
        modes: practiceData.modes.length > 0 ? practiceData.modes : ['addition', 'subtraction', 'addSubMixed'],
        minDifficulty: Math.max(practiceData.minDifficulty, 2),
        minCorrect: 15,
        weight: 25,
        description: 'Luyện tập: Cộng, Trừ, Cộng Trừ Mix cấp 2+, mỗi mode 15 bài đúng'
      },
      mentalMath: {
        minCorrect: 10,
        weight: 10,
        description: 'Siêu Trí Tuệ: 10 bài đúng (Cộng Trừ nhẩm)'
      },
      flashAnzan: {
        minLevel: 1,
        minCorrect: 5,
        weight: 10,
        description: 'Tia Chớp: cấp Ánh Nến trở lên, 5 bài đúng'
      },
      compete: {
        modes: competeData.modes.length > 0 ? competeData.modes : ['addition', 'subtraction', 'addSubMixed'],
        minDifficulty: Math.max(competeData.minDifficulty, 2),
        minCorrect: 6,
        weight: 15,
        description: 'Thi đấu: Cộng, Trừ, Cộng Trừ Mix đạt 6+ câu đúng'
      },
      accuracy: {
        minAccuracy: 70,
        weight: 10,
        description: 'Độ chính xác tổng từ 70% trở lên'
      }
    }
  };
})();
