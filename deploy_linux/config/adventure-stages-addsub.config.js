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
  
  // Stage 5: BOSS - Luyện tập Cộng
  {
    stageId: 5,
    zoneId: 'village',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Làng - Thử Thách Cộng',
    description: 'Luyện Phép Cộng • Tập Sự • 8 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=addition&difficulty=1',
    practiceInfo: {
      mode: 'addition',
      modeName: 'Phép Cộng',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 8
    },
    unlockCondition: { type: 'lesson', levelId: 1, lessonId: 4 },
    completeCondition: { type: 'practice', mode: 'addition', difficulty: 1, minCorrect: 8 }
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
  
  // Stage 9: BOSS - Luyện tập Cộng (1 chữ số)
  {
    stageId: 9,
    zoneId: 'forest',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Cộng Đơn',
    description: 'Luyện Phép Cộng • Tập Sự • 12 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=addition&difficulty=1',
    practiceInfo: {
      mode: 'addition',
      modeName: 'Phép Cộng',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 12
    },
    unlockCondition: { type: 'lesson', levelId: 2, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'addition', difficulty: 1, minCorrect: 12 }
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
  
  // Stage 13: BOSS - Thi đấu Cộng (1 chữ số)
  {
    stageId: 13,
    zoneId: 'forest',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Rừng Xanh',
    description: 'Thi đấu Cộng • Tập Sự • 10 câu • 7+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=addition&difficulty=1&questions=10',
    competeInfo: {
      mode: 'addition',
      modeName: 'Phép Cộng',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      questions: 10,
      minCorrect: 7,
      arenaId: 'addition-1-10'
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
  
  // Stage 17: BOSS - Luyện tập Trừ
  {
    stageId: 17,
    zoneId: 'valley',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Trừ',
    description: 'Luyện Phép Trừ • Tập Sự • 10 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=subtraction&difficulty=1',
    practiceInfo: {
      mode: 'subtraction',
      modeName: 'Phép Trừ',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 10
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
    description: 'Luyện Phép Cộng • Chiến Binh • 12 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=addition&difficulty=2',
    practiceInfo: {
      mode: 'addition',
      modeName: 'Phép Cộng',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 12
    },
    unlockCondition: { type: 'lesson', levelId: 5, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'addition', difficulty: 2, minCorrect: 12 }
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
    description: 'Luyện Cộng Trừ Mix • Chiến Binh • 12 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=addSubMixed&difficulty=2',
    practiceInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 12
    },
    unlockCondition: { type: 'lesson', levelId: 7, lessonId: 4 },
    completeCondition: { type: 'practice', mode: 'addSubMixed', difficulty: 2, minCorrect: 12 }
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
    description: 'Luyện Cộng Trừ Mix • Dũng Sĩ • 12 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=addSubMixed&difficulty=3',
    practiceInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      minCorrect: 12
    },
    unlockCondition: { type: 'lesson', levelId: 8, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'addSubMixed', difficulty: 3, minCorrect: 12 }
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
  // ============================================================
  
  // Stage 49: Học 15.1 - Cộng trừ nhẩm cơ bản
  {
    stageId: 49,
    zoneId: 'mental-tower',
    type: 'lesson',
    levelId: 15,
    lessonId: 1,
    name: '🧠 Cộng trừ nhẩm cơ bản',
    description: 'Nền tảng Anzan - tính nhẩm Soroban',
    icon: '📚',
    link: '/learn/15/1',
    unlockCondition: { type: 'stage', stageId: 48 }
  },
  
  // Stage 50: BOSS - Luyện Siêu Trí Tuệ cơ bản
  {
    stageId: 50,
    zoneId: 'mental-tower',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Anzan Cơ Bản',
    description: 'Luyện Siêu Trí Tuệ • Tập Sự • 6 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=mentalMath&difficulty=1',
    practiceInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 6
    },
    unlockCondition: { type: 'lesson', levelId: 15, lessonId: 1 },
    completeCondition: { type: 'practice', mode: 'mentalMath', difficulty: 1, minCorrect: 6 }
  },
  
  // Stage 51: Học 16.1 - Cộng trừ nhẩm nâng cao
  {
    stageId: 51,
    zoneId: 'mental-tower',
    type: 'lesson',
    levelId: 16,
    lessonId: 1,
    name: '🧠 Cộng trừ nhẩm nâng cao',
    description: 'Tính nhẩm số 2 chữ số',
    icon: '📚',
    link: '/learn/16/1',
    unlockCondition: { type: 'stage', stageId: 50 }
  },
  
  // Stage 52: BOSS - Luyện Siêu Trí Tuệ nâng cao
  {
    stageId: 52,
    zoneId: 'mental-tower',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Anzan Nâng Cao',
    description: 'Luyện Siêu Trí Tuệ • Chiến Binh • 8 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=mentalMath&difficulty=2',
    practiceInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 8
    },
    unlockCondition: { type: 'lesson', levelId: 16, lessonId: 1 },
    completeCondition: { type: 'practice', mode: 'mentalMath', difficulty: 2, minCorrect: 8 }
  },
  
  // Stage 53: BOSS - Đấu Trường Siêu Trí Tuệ
  {
    stageId: 53,
    zoneId: 'mental-tower',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Siêu Trí Tuệ',
    description: 'Thi đấu Siêu Trí Tuệ • Chiến Binh • 10 câu • 5+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mentalMath&difficulty=2&questions=10',
    competeInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      questions: 10,
      minCorrect: 5,
      arenaId: 'mentalMath-2-10'
    },
    unlockCondition: { type: 'stage', stageId: 52 },
    completeCondition: { type: 'compete', arenaId: 'mentalMath-2-10', minCorrect: 5 }
  },

  // ============================================================
  // ⚡ ZONE 9: ĐỀN TỐC ĐỘ (Level 17.1 - Tốc độ cộng trừ)
  // ============================================================
  
  // Stage 54: Học 17.1 - Cộng trừ tốc độ
  {
    stageId: 54,
    zoneId: 'speed-temple',
    type: 'lesson',
    levelId: 17,
    lessonId: 1,
    name: '⚡ Cộng trừ tốc độ',
    description: 'Tính nhẩm với thời gian giới hạn',
    icon: '📚',
    link: '/learn/17/1',
    unlockCondition: { type: 'stage', stageId: 53 }
  },
  
  // Stage 55: BOSS - Luyện Tốc Độ
  {
    stageId: 55,
    zoneId: 'speed-temple',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Tốc Độ',
    description: 'Luyện Cộng Trừ Mix • Huyền Thoại • 25 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=addSubMixed&difficulty=5',
    practiceInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 5,
      difficultyName: 'Huyền Thoại',
      minCorrect: 25
    },
    unlockCondition: { type: 'lesson', levelId: 17, lessonId: 1 },
    completeCondition: { type: 'practice', mode: 'addSubMixed', difficulty: 5, minCorrect: 25 }
  },
  
  // Stage 56: BOSS - Đấu Trường Tốc Độ
  {
    stageId: 56,
    zoneId: 'speed-temple',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Tốc Độ',
    description: 'Thi đấu Cộng Trừ Mix • Huyền Thoại • 20 câu • 15+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=addSubMixed&difficulty=5&questions=20',
    competeInfo: {
      mode: 'addSubMixed',
      modeName: 'Cộng Trừ Mix',
      difficulty: 5,
      difficultyName: 'Huyền Thoại',
      questions: 20,
      minCorrect: 15,
      arenaId: 'addSubMixed-5-20'
    },
    unlockCondition: { type: 'stage', stageId: 55 },
    completeCondition: { type: 'compete', arenaId: 'addSubMixed-5-20', minCorrect: 15 }
  },

  // ============================================================
  // ⚡ ZONE 10: ĐỈNH TIA CHỚP (Level 18.1-18.5 - Flash Anzan)
  // ============================================================
  
  // Stage 57-59: Học Flash cơ bản
  {
    stageId: 57,
    zoneId: 'flash-peak',
    type: 'lesson',
    levelId: 18,
    lessonId: 1,
    name: '🧠 Nhớ số nhanh',
    description: 'Nhớ số 1-2 chữ số hiện nhanh',
    icon: '📚',
    link: '/learn/18/1',
    unlockCondition: { type: 'stage', stageId: 56 }
  },
  {
    stageId: 58,
    zoneId: 'flash-peak',
    type: 'lesson',
    levelId: 18,
    lessonId: 2,
    name: '🧠 Cộng 2-3 số',
    description: 'Xem 2-3 số liên tiếp, cộng dồn',
    icon: '📚',
    link: '/learn/18/2',
    unlockCondition: { type: 'lesson', levelId: 18, lessonId: 1 }
  },
  {
    stageId: 59,
    zoneId: 'flash-peak',
    type: 'lesson',
    levelId: 18,
    lessonId: 3,
    name: '🧠 Cộng trừ hỗn hợp',
    description: '3-4 số với phép trừ',
    icon: '📚',
    link: '/learn/18/3',
    unlockCondition: { type: 'lesson', levelId: 18, lessonId: 2 }
  },
  
  // Stage 60: BOSS - Luyện Flash cơ bản
  {
    stageId: 60,
    zoneId: 'flash-peak',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Tia Chớp Cơ Bản',
    description: 'Luyện Flash Anzan • Ánh Nến • 5 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=flashAnzan&difficulty=1',
    practiceInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      difficulty: 1,
      difficultyName: 'Ánh Nến',
      minCorrect: 5
    },
    unlockCondition: { type: 'lesson', levelId: 18, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'flashAnzan', difficulty: 1, minCorrect: 5 }
  },
  
  // Stage 61-62: Học Flash nâng cao
  {
    stageId: 61,
    zoneId: 'flash-peak',
    type: 'lesson',
    levelId: 18,
    lessonId: 4,
    name: '🧠 Flash Anzan nhanh',
    description: '4-5 số với tốc độ 0.8-1 giây',
    icon: '📚',
    link: '/learn/18/4',
    unlockCondition: { type: 'stage', stageId: 60 }
  },
  {
    stageId: 62,
    zoneId: 'flash-peak',
    type: 'lesson',
    levelId: 18,
    lessonId: 5,
    name: '🔥 Flash Anzan siêu tốc',
    description: '5-7 số với tốc độ 0.5-0.7 giây',
    icon: '📚',
    link: '/learn/18/5',
    unlockCondition: { type: 'lesson', levelId: 18, lessonId: 4 }
  },
  
  // Stage 63: BOSS - Luyện Flash nâng cao
  {
    stageId: 63,
    zoneId: 'flash-peak',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Tia Chớp Nâng Cao',
    description: 'Luyện Flash Anzan • Ánh Trăng • 5 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=flashAnzan&difficulty=2',
    practiceInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      difficulty: 2,
      difficultyName: 'Ánh Trăng',
      minCorrect: 5
    },
    unlockCondition: { type: 'lesson', levelId: 18, lessonId: 5 },
    completeCondition: { type: 'practice', mode: 'flashAnzan', difficulty: 2, minCorrect: 5 }
  },
  
  // Stage 64: BOSS - Đấu Trường Tia Chớp
  {
    stageId: 64,
    zoneId: 'flash-peak',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Tia Chớp',
    description: 'Thi đấu Flash Anzan • Ánh Trăng • 10 câu • 5+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=flashAnzan&difficulty=2&questions=10',
    competeInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      difficulty: 2,
      difficultyName: 'Ánh Trăng',
      questions: 10,
      minCorrect: 5,
      arenaId: 'flashAnzan-2-10'
    },
    unlockCondition: { type: 'stage', stageId: 63 },
    completeCondition: { type: 'compete', arenaId: 'flashAnzan-2-10', minCorrect: 5 }
  },

  // ============================================================
  // 🏆 ZONE 11: LÂU ĐÀI KHO BÁU CỘNG TRỪ (Boss Cuối + Chứng Chỉ)
  // ============================================================
  
  // Stage 65: BOSS CUỐI 1 - Đại Chiến Cộng Trừ
  {
    stageId: 65,
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
      arenaId: 'addSubMixed-4-20'
    },
    unlockCondition: { type: 'stage', stageId: 64 },
    completeCondition: { type: 'compete', arenaId: 'addSubMixed-4-20', minCorrect: 14 }
  },
  
  // Stage 66: BOSS CUỐI 2 - Siêu Trí Tuệ Ultimate
  {
    stageId: 66,
    zoneId: 'treasure-castle',
    type: 'boss',
    bossType: 'practice',
    isFinalBoss: true,
    name: '👑 BOSS CUỐI - Siêu Trí Tuệ Ultimate',
    description: 'Luyện Siêu Trí Tuệ • Chiến Binh • 8 bài đúng',
    icon: '👑',
    link: '/practice/auto?mode=mentalMath&difficulty=2',
    practiceInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 8
    },
    unlockCondition: { type: 'stage', stageId: 65 },
    completeCondition: { type: 'practice', mode: 'mentalMath', difficulty: 2, minCorrect: 8 }
  },
  
  // Stage 67: BOSS CUỐI 3 - Tia Chớp Ultimate
  {
    stageId: 67,
    zoneId: 'treasure-castle',
    type: 'boss',
    bossType: 'practice',
    isFinalBoss: true,
    name: '👑 BOSS CUỐI - Tia Chớp Ultimate',
    description: 'Luyện Flash Anzan • Ánh Nến • 5 bài đúng',
    icon: '👑',
    link: '/practice/auto?mode=flashAnzan&difficulty=1',
    practiceInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      difficulty: 1,
      difficultyName: 'Ánh Nến',
      minCorrect: 5
    },
    unlockCondition: { type: 'stage', stageId: 66 },
    completeCondition: { type: 'practice', mode: 'flashAnzan', difficulty: 1, minCorrect: 5 }
  },
  
  // Stage 68: KHO BÁU - Nhận Chứng Chỉ
  {
    stageId: 68,
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
    unlockCondition: { type: 'stage', stageId: 67 },
    completeCondition: { type: 'certificate', certType: 'addSub' }
  },
];

// ============================================================
// 🗺️ ZONES CONFIG - Thông tin các vùng đất
// ============================================================

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
    story: {
      intro: 'Chào mừng đến Làng Bàn Tính! Đây là nơi con bắt đầu hành trình tìm Kho Báu Tri Thức!',
      complete: 'Tuyệt vời! Con đã nắm vững cách dùng Soroban. Rừng Phép Cộng đang chờ đón!'
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
    story: {
      intro: 'Con đã đến Rừng Phép Cộng! Những con số ở đây muốn được gộp lại với nhau.',
      complete: 'Xuất sắc! Con đã thuần thục phép cộng. Thung Lũng Phép Trừ đang chờ!'
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
    story: {
      intro: 'Chào mừng đến Thung Lũng Phép Trừ! Ở đây con sẽ học cách làm số nhỏ đi.',
      complete: 'Giỏi lắm! Con đã chinh phục Thung Lũng. Đồi Bạn Lớn đang chờ đợi!'
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
    story: {
      intro: 'Đồi Bạn Lớn - nơi cất giữ bí mật quan trọng: công thức tạo số 10!',
      complete: 'Phi thường! Con đã nắm vững Bạn Lớn. Đài Kết Hợp đang chờ đợi!'
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
    story: {
      intro: 'Đài Kết Hợp - nơi Bạn Nhỏ và Bạn Lớn hợp sức tạo nên phép thuật!',
      complete: 'Tuyệt đỉnh! Con đã thành thạo kết hợp. Thành Phố Số đang chờ!'
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
    story: {
      intro: 'Thành Phố 2-3 Chữ Số - nơi con học cách tính với hàng chục và hàng trăm!',
      complete: 'Xuất sắc! Con đã thành thạo số 2-3 chữ số. Vương Quốc Số Lớn đang chờ!'
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
    story: {
      intro: 'Vương Quốc Số Lớn - nơi những con số hàng nghìn ngự trị!',
      complete: 'Vĩ đại! Con đã làm chủ số lớn. Tháp Siêu Trí Tuệ đang chờ con!'
    }
  },
  {
    zoneId: 'mental-tower',
    order: 8,
    name: 'Chặng 8: Tháp Tính Nhẩm',
    subtitle: 'Anzan cơ bản',
    description: 'Rèn luyện Anzan - tính nhẩm bằng Soroban trong đầu!',
    icon: '🧠',
    color: 'from-violet-400 to-purple-600',
    bgImage: '/images/zones/mental-tower.jpg',
    levels: [15, 16],
    lessonIds: [[1], [1]], // Chỉ lesson 1 của mỗi level
    stageRange: [49, 53],
    totalBoss: 3,
    story: {
      intro: 'Tháp Siêu Trí Tuệ - nơi con học tính toán không cần bàn tính!',
      complete: 'Siêu phàm! Con đã đạt đến cảnh giới tính nhẩm. Đền Tốc Độ đang chờ!'
    }
  },
  {
    zoneId: 'speed-temple',
    order: 9,
    name: 'Chặng 9: Đền Tốc Độ',
    subtitle: 'Thử thách thời gian',
    description: 'Tính toán với thời gian giới hạn - thử thách phản xạ!',
    icon: '⚡',
    color: 'from-orange-400 to-red-500',
    bgImage: '/images/zones/speed-temple.jpg',
    levels: [17],
    lessonIds: [[1]], // Chỉ lesson 1
    stageRange: [54, 56],
    totalBoss: 2,
    story: {
      intro: 'Đền Tốc Độ - nơi thử thách giới hạn phản xạ của con!',
      complete: 'Nhanh như chớp! Con đã sẵn sàng cho Đỉnh Tia Chớp!'
    }
  },
  {
    zoneId: 'flash-peak',
    order: 10,
    name: 'Chặng 10: Đỉnh Tia Chớp',
    subtitle: 'Flash Anzan',
    description: 'Flash Anzan - đỉnh cao của tính nhẩm Soroban!',
    icon: '⚡',
    color: 'from-yellow-300 to-amber-500',
    bgImage: '/images/zones/lightning-peak.jpg',
    levels: [18],
    lessonIds: [[1, 2, 3, 4, 5]], // Tất cả lessons
    stageRange: [57, 64],
    totalBoss: 3,
    story: {
      intro: 'Đỉnh Tia Chớp - thử thách cuối cùng dành cho bậc thầy Soroban!',
      complete: 'HUYỀN THOẠI! Con đã chinh phục Flash Anzan! Lâu Đài Kho Báu đang chờ!'
    }
  },
  {
    zoneId: 'treasure-castle',
    order: 11,
    name: 'ĐÍCH ĐẾN: Lâu Đài Kho Báu',
    subtitle: 'Nhận Chứng Chỉ!',
    description: 'Vượt qua 3 Boss Cuối để nhận Chứng Chỉ Cộng Trừ!',
    icon: '🏆',
    color: 'from-amber-300 via-yellow-400 to-orange-500',
    bgImage: '/images/zones/treasure-castle.jpg',
    levels: [],
    stageRange: [65, 68],
    totalBoss: 3,
    hasCertificate: true,
    certificateType: 'addSub',
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
