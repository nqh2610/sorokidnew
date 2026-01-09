/**
 * 🗺️ GAME MAP CONFIG - PHẦN 2: NHÂN CHIA → CHỨNG CHỈ TOÀN DIỆN
 * 
 * Yêu cầu: Phải có Chứng Chỉ Cộng Trừ trước (hoàn thành adventure-stages.config.js)
 * 
 * Database sử dụng:
 * - Progress: tiến độ học (levelId, lessonId)
 * - ExerciseResult: luyện tập (exerciseType, difficulty, isCorrect)
 * - CompeteResult: thi đấu (arenaId = "mode-difficulty-questions")
 */

// ============================================================
// ✖️➗ ĐẢO NHÂN CHIA - LỘ TRÌNH ĐẠT CHỨNG CHỈ TOÀN DIỆN
// ============================================================

// Stage bắt đầu từ 69 (tiếp nối từ file adventure-stages.config.js)
export const GAME_STAGES_MULDIV = [
  
  // ============================================================
  // ✖️ ZONE 11: HANG PHÉP NHÂN (Level 11-12)
  // ============================================================
  
  // Stage 69-71: Học Level 11 (Bảng nhân 2-7)
  {
    stageId: 69,
    zoneId: 'cave-multiply',
    type: 'lesson',
    levelId: 11,
    lessonId: 1,
    name: '✖️ Khái niệm phép nhân',
    description: 'Nguyên tắc nhân trên Soroban, bảng 2-3',
    icon: '📚',
    link: '/learn/11/1',
    unlockCondition: { type: 'certificate', certType: 'addSub' } // Yêu cầu chứng chỉ Cộng Trừ
  },
  {
    stageId: 70,
    zoneId: 'cave-multiply',
    type: 'lesson',
    levelId: 11,
    lessonId: 2,
    name: '✖️ Nhân với 2, 3, 4',
    description: 'Luyện nhân với các số nhỏ',
    icon: '📚',
    link: '/learn/11/2',
    unlockCondition: { type: 'lesson', levelId: 11, lessonId: 1 }
  },
  {
    stageId: 71,
    zoneId: 'cave-multiply',
    type: 'lesson',
    levelId: 11,
    lessonId: 3,
    name: '✖️ Nhân với 5, 6, 7',
    description: 'Nhân với các số lớn hơn',
    icon: '📚',
    link: '/learn/11/3',
    unlockCondition: { type: 'lesson', levelId: 11, lessonId: 2 }
  },
  
  // Stage 72: BOSS - Luyện Nhân cơ bản
  {
    stageId: 72,
    zoneId: 'cave-multiply',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Nhân Cơ Bản',
    description: 'Luyện Phép Nhân • Tập Sự • 8 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=multiplication&difficulty=1',
    practiceInfo: {
      mode: 'multiplication',
      modeName: 'Phép Nhân',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 8
    },
    unlockCondition: { type: 'lesson', levelId: 11, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'multiplication', difficulty: 1, minCorrect: 8 }
  },
  
  // Stage 73-75: Học Level 12 (Bảng nhân 8-9)
  {
    stageId: 73,
    zoneId: 'cave-multiply',
    type: 'lesson',
    levelId: 12,
    lessonId: 1,
    name: '✖️ Nhân với 8, 9',
    description: 'Hoàn thành bảng cửu chương',
    icon: '📚',
    link: '/learn/12/1',
    unlockCondition: { type: 'stage', stageId: 72 }
  },
  {
    stageId: 74,
    zoneId: 'cave-multiply',
    type: 'lesson',
    levelId: 12,
    lessonId: 2,
    name: '✖️ Nhân số 2 chữ số',
    description: 'Nhân số lớn với 1 chữ số',
    icon: '📚',
    link: '/learn/12/2',
    unlockCondition: { type: 'lesson', levelId: 12, lessonId: 1 }
  },
  {
    stageId: 75,
    zoneId: 'cave-multiply',
    type: 'lesson',
    levelId: 12,
    lessonId: 3,
    name: '🏋️ Luyện tập nhân',
    description: 'Tổng hợp các phép nhân',
    icon: '📚',
    link: '/learn/12/3',
    unlockCondition: { type: 'lesson', levelId: 12, lessonId: 2 }
  },
  
  // Stage 76: BOSS - Thi đấu Nhân
  {
    stageId: 76,
    zoneId: 'cave-multiply',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Hang Nhân',
    description: 'Thi đấu Phép Nhân • Chiến Binh • 10 câu • 6+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=multiplication&difficulty=2&questions=10',
    competeInfo: {
      mode: 'multiplication',
      modeName: 'Phép Nhân',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      questions: 10,
      minCorrect: 6,
      arenaId: 'multiplication-2-10'
    },
    unlockCondition: { type: 'lesson', levelId: 12, lessonId: 3 },
    completeCondition: { type: 'compete', arenaId: 'multiplication-2-10', minCorrect: 6 }
  },

  // ============================================================
  // ➗ ZONE 12: HỒ PHÉP CHIA (Level 13-14)
  // ============================================================
  
  // Stage 77-79: Học Level 13 (Chia cơ bản)
  {
    stageId: 77,
    zoneId: 'lake-divide-basic',
    type: 'lesson',
    levelId: 13,
    lessonId: 1,
    name: '➗ Khái niệm phép chia',
    description: 'Hiểu phép chia và chia hết',
    icon: '📚',
    link: '/learn/13/1',
    unlockCondition: { type: 'stage', stageId: 76 }
  },
  {
    stageId: 78,
    zoneId: 'lake-divide-basic',
    type: 'lesson',
    levelId: 13,
    lessonId: 2,
    name: '➗ Chia cho 2, 3, 4',
    description: 'Luyện chia với số nhỏ',
    icon: '📚',
    link: '/learn/13/2',
    unlockCondition: { type: 'lesson', levelId: 13, lessonId: 1 }
  },
  {
    stageId: 79,
    zoneId: 'lake-divide-basic',
    type: 'lesson',
    levelId: 13,
    lessonId: 3,
    name: '➗ Chia cho 5, 6, 7',
    description: 'Chia với số lớn hơn',
    icon: '📚',
    link: '/learn/13/3',
    unlockCondition: { type: 'lesson', levelId: 13, lessonId: 2 }
  },
  
  // Stage 80: BOSS - Luyện Chia cơ bản
  {
    stageId: 80,
    zoneId: 'lake-divide-basic',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Chia Cơ Bản',
    description: 'Luyện Phép Chia • Tập Sự • 8 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=division&difficulty=1',
    practiceInfo: {
      mode: 'division',
      modeName: 'Phép Chia',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 8
    },
    unlockCondition: { type: 'lesson', levelId: 13, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'division', difficulty: 1, minCorrect: 8 }
  },
  
  // Stage 81-84: Học Level 14 (Chia nâng cao)
  {
    stageId: 81,
    zoneId: 'lake-divide-advanced',
    type: 'lesson',
    levelId: 14,
    lessonId: 1,
    name: '➗ Chia cho 8, 9',
    description: 'Hoàn thành bảng chia',
    icon: '📚',
    link: '/learn/14/1',
    unlockCondition: { type: 'stage', stageId: 80 }
  },
  {
    stageId: 82,
    zoneId: 'lake-divide-advanced',
    type: 'lesson',
    levelId: 14,
    lessonId: 2,
    name: '➗ Chia số 2 chữ số',
    description: 'Chia số lớn với 1 chữ số',
    icon: '📚',
    link: '/learn/14/2',
    unlockCondition: { type: 'lesson', levelId: 14, lessonId: 1 }
  },
  {
    stageId: 83,
    zoneId: 'lake-divide-advanced',
    type: 'lesson',
    levelId: 14,
    lessonId: 3,
    name: '🏋️ Luyện tập chia',
    description: 'Tổng hợp các phép chia',
    icon: '📚',
    link: '/learn/14/3',
    unlockCondition: { type: 'lesson', levelId: 14, lessonId: 2 }
  },
  {
    stageId: 84,
    zoneId: 'lake-divide-advanced',
    type: 'lesson',
    levelId: 14,
    lessonId: 4,
    name: '🎯 MIX Nhân Chia',
    description: 'Kết hợp phép nhân và chia',
    icon: '📚',
    link: '/learn/14/4',
    unlockCondition: { type: 'lesson', levelId: 14, lessonId: 3 }
  },
  
  // Stage 85: BOSS - Luyện Chia nâng cao
  {
    stageId: 85,
    zoneId: 'lake-divide-advanced',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Chia Nâng Cao',
    description: 'Luyện Phép Chia • Chiến Binh • 10 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=division&difficulty=2',
    practiceInfo: {
      mode: 'division',
      modeName: 'Phép Chia',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 10
    },
    unlockCondition: { type: 'lesson', levelId: 14, lessonId: 4 },
    completeCondition: { type: 'practice', mode: 'division', difficulty: 2, minCorrect: 10 }
  },
  
  // Stage 86: BOSS - Thi đấu Chia
  {
    stageId: 86,
    zoneId: 'lake-divide-advanced',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Hồ Chia',
    description: 'Thi đấu Phép Chia • Chiến Binh • 10 câu • 6+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=division&difficulty=2&questions=10',
    competeInfo: {
      mode: 'division',
      modeName: 'Phép Chia',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      questions: 10,
      minCorrect: 6,
      arenaId: 'division-2-10'
    },
    unlockCondition: { type: 'stage', stageId: 85 },
    completeCondition: { type: 'compete', arenaId: 'division-2-10', minCorrect: 6 }
  },

  // ============================================================
  // ⚔️ ZONE 13: ĐẤU TRƯỜNG TỨ PHÉP (Mix 4 phép)
  // ============================================================
  
  // Stage 87: BOSS - Luyện Nhân Chia Mix
  {
    stageId: 87,
    zoneId: 'arena-four',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Nhân Chia Mix',
    description: 'Luyện Nhân Chia Mix • Chiến Binh • 12 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=mulDiv&difficulty=2',
    practiceInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 12
    },
    unlockCondition: { type: 'stage', stageId: 86 },
    completeCondition: { type: 'practice', mode: 'mulDiv', difficulty: 2, minCorrect: 12 }
  },
  
  // Stage 88: BOSS - Luyện Tứ Phép
  {
    stageId: 88,
    zoneId: 'arena-four',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Tứ Phép Thần',
    description: 'Luyện Tứ Phép • Chiến Binh • 12 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=mixed&difficulty=2',
    practiceInfo: {
      mode: 'mixed',
      modeName: 'Tứ Phép Thần',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 12
    },
    unlockCondition: { type: 'stage', stageId: 87 },
    completeCondition: { type: 'practice', mode: 'mixed', difficulty: 2, minCorrect: 12 }
  },
  
  // Stage 89: BOSS - Thi đấu Tứ Phép
  {
    stageId: 89,
    zoneId: 'arena-four',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Tứ Phép',
    description: 'Thi đấu Tứ Phép • Chiến Binh • 15 câu • 9+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mixed&difficulty=2&questions=15',
    competeInfo: {
      mode: 'mixed',
      modeName: 'Tứ Phép Thần',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      questions: 15,
      minCorrect: 9,
      arenaId: 'mixed-2-15'
    },
    unlockCondition: { type: 'stage', stageId: 88 },
    completeCondition: { type: 'compete', arenaId: 'mixed-2-15', minCorrect: 9 }
  },

  // ============================================================
  // 🧠 ZONE 14: THÁP TRÍ TUỆ NHÂN CHIA (Level 15.2-15.3, 16.2-16.3)
  // ============================================================
  
  // Stage 90-91: Học 15.2, 15.3 (Nhân Chia nhẩm cơ bản)
  {
    stageId: 90,
    zoneId: 'mental-muldiv',
    type: 'lesson',
    levelId: 15,
    lessonId: 2,
    name: '✖️ Nhân nhẩm cơ bản',
    description: 'Tính nhẩm bảng cửu chương 2-5',
    icon: '📚',
    link: '/learn/15/2',
    unlockCondition: { type: 'stage', stageId: 89 }
  },
  {
    stageId: 91,
    zoneId: 'mental-muldiv',
    type: 'lesson',
    levelId: 15,
    lessonId: 3,
    name: '➗ Chia nhẩm cơ bản',
    description: 'Tính nhẩm chia cho 2-5',
    icon: '📚',
    link: '/learn/15/3',
    unlockCondition: { type: 'lesson', levelId: 15, lessonId: 2 }
  },
  
  // Stage 92: BOSS - Luyện Nhân Chia nhẩm cơ bản
  {
    stageId: 92,
    zoneId: 'mental-muldiv',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Nhân Chia Nhẩm Cơ Bản',
    description: 'Luyện Nhân Chia Mix • Tập Sự • 6 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=mulDiv&difficulty=1',
    practiceInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 6
    },
    unlockCondition: { type: 'lesson', levelId: 15, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'mulDiv', difficulty: 1, minCorrect: 6 }
  },
  
  // Stage 93-94: Học 16.2, 16.3 (Nhân Chia nhẩm nâng cao)
  {
    stageId: 93,
    zoneId: 'mental-muldiv',
    type: 'lesson',
    levelId: 16,
    lessonId: 2,
    name: '✖️ Nhân nhẩm nâng cao',
    description: 'Bảng 6-9 và nhân số 2 chữ số',
    icon: '📚',
    link: '/learn/16/2',
    unlockCondition: { type: 'stage', stageId: 92 }
  },
  {
    stageId: 94,
    zoneId: 'mental-muldiv',
    type: 'lesson',
    levelId: 16,
    lessonId: 3,
    name: '➗ Chia nhẩm nâng cao',
    description: 'Chia cho 6-9 và số 2-3 chữ số',
    icon: '📚',
    link: '/learn/16/3',
    unlockCondition: { type: 'lesson', levelId: 16, lessonId: 2 }
  },
  
  // Stage 95: BOSS - Luyện Nhân Chia nhẩm nâng cao
  {
    stageId: 95,
    zoneId: 'mental-muldiv',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Nhân Chia Nhẩm Nâng Cao',
    description: 'Luyện Nhân Chia Mix • Chiến Binh • 8 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=mulDiv&difficulty=2',
    practiceInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 8
    },
    unlockCondition: { type: 'lesson', levelId: 16, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'mulDiv', difficulty: 2, minCorrect: 8 }
  },

  // ============================================================
  // ⚡ ZONE 15: ĐỀN TỐC ĐỘ NHÂN CHIA (Level 17.2, 17.3)
  // ============================================================
  
  // Stage 96-97: Học 17.2, 17.3 (Tốc độ Nhân Chia)
  {
    stageId: 96,
    zoneId: 'speed-muldiv',
    type: 'lesson',
    levelId: 17,
    lessonId: 2,
    name: '⚡ Nhân tốc độ',
    description: 'Nhân nhẩm bảng cửu chương nhanh',
    icon: '📚',
    link: '/learn/17/2',
    unlockCondition: { type: 'stage', stageId: 95 }
  },
  {
    stageId: 97,
    zoneId: 'speed-muldiv',
    type: 'lesson',
    levelId: 17,
    lessonId: 3,
    name: '⚡ Chia tốc độ',
    description: 'Chia nhẩm với thời gian giới hạn',
    icon: '📚',
    link: '/learn/17/3',
    unlockCondition: { type: 'lesson', levelId: 17, lessonId: 2 }
  },
  
  // Stage 98: BOSS - Luyện Tốc độ Nhân Chia
  {
    stageId: 98,
    zoneId: 'speed-muldiv',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Tốc Độ Nhân Chia',
    description: 'Luyện Nhân Chia Mix • Chiến Binh • 10 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=mulDiv&difficulty=2',
    practiceInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 10
    },
    unlockCondition: { type: 'lesson', levelId: 17, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'mulDiv', difficulty: 2, minCorrect: 10 }
  },
  
  // Stage 99: BOSS - Thi đấu Tốc độ Nhân Chia
  {
    stageId: 99,
    zoneId: 'speed-muldiv',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Tốc Độ Nhân Chia',
    description: 'Thi đấu Nhân Chia Mix • Chiến Binh • 20 câu • 12+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mulDiv&difficulty=2&questions=20',
    competeInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      questions: 20,
      minCorrect: 12,
      arenaId: 'mulDiv-2-20'
    },
    unlockCondition: { type: 'stage', stageId: 98 },
    completeCondition: { type: 'compete', arenaId: 'mulDiv-2-20', minCorrect: 12 }
  },

  // ============================================================
  // 🎯 ZONE 16: ĐỈNH HỖN HỢP (Level 15.4, 16.4, 17.4)
  // ============================================================
  
  // Stage 100-102: Học bài Hỗn hợp 4 phép
  {
    stageId: 100,
    zoneId: 'mixed-peak',
    type: 'lesson',
    levelId: 15,
    lessonId: 4,
    name: '🎯 Hỗn hợp 4 phép cơ bản',
    description: 'Tính nhẩm xen kẽ 4 phép',
    icon: '📚',
    link: '/learn/15/4',
    unlockCondition: { type: 'stage', stageId: 99 }
  },
  {
    stageId: 101,
    zoneId: 'mixed-peak',
    type: 'lesson',
    levelId: 16,
    lessonId: 4,
    name: '🎯 Hỗn hợp 4 phép nâng cao',
    description: 'Tính nhẩm tổng hợp số 2 chữ số',
    icon: '📚',
    link: '/learn/16/4',
    unlockCondition: { type: 'lesson', levelId: 15, lessonId: 4 }
  },
  {
    stageId: 102,
    zoneId: 'mixed-peak',
    type: 'lesson',
    levelId: 17,
    lessonId: 4,
    name: '⚡ Hỗn hợp tốc độ',
    description: 'Xen kẽ 4 phép tính với thời gian',
    icon: '📚',
    link: '/learn/17/4',
    unlockCondition: { type: 'lesson', levelId: 16, lessonId: 4 }
  },
  
  // Stage 103: BOSS - Luyện Tứ Phép Ultimate
  {
    stageId: 103,
    zoneId: 'mixed-peak',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Tứ Phép Ultimate',
    description: 'Luyện Tứ Phép • Dũng Sĩ • 12 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=mixed&difficulty=3',
    practiceInfo: {
      mode: 'mixed',
      modeName: 'Tứ Phép Thần',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      minCorrect: 12
    },
    unlockCondition: { type: 'lesson', levelId: 17, lessonId: 4 },
    completeCondition: { type: 'practice', mode: 'mixed', difficulty: 3, minCorrect: 12 }
  },
  
  // Stage 104: BOSS - Thi đấu Tứ Phép Ultimate
  {
    stageId: 104,
    zoneId: 'mixed-peak',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Tứ Phép Ultimate',
    description: 'Thi đấu Tứ Phép • Dũng Sĩ • 25 câu • 15+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mixed&difficulty=3&questions=25',
    competeInfo: {
      mode: 'mixed',
      modeName: 'Tứ Phép Thần',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      questions: 25,
      minCorrect: 15,
      arenaId: 'mixed-3-25'
    },
    unlockCondition: { type: 'stage', stageId: 103 },
    completeCondition: { type: 'compete', arenaId: 'mixed-3-25', minCorrect: 15 }
  },

  // ============================================================
  // 👑 ZONE 17: LÂU ĐÀI TỐI THƯỢNG (Boss Cuối + Chứng Chỉ Toàn Diện)
  // ============================================================
  
  // Stage 105: BOSS CUỐI 1 - Đại Chiến Tứ Phép
  {
    stageId: 105,
    zoneId: 'supreme-castle',
    type: 'boss',
    bossType: 'compete',
    isFinalBoss: true,
    name: '👑 BOSS CUỐI - Đại Chiến Tứ Phép',
    description: 'Thi đấu Tứ Phép • Dũng Sĩ • 25 câu • 15+ đúng',
    icon: '👑',
    link: '/compete/auto?mode=mixed&difficulty=3&questions=25',
    competeInfo: {
      mode: 'mixed',
      modeName: 'Tứ Phép Thần',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      questions: 25,
      minCorrect: 15,
      arenaId: 'mixed-3-25-final'
    },
    unlockCondition: { type: 'stage', stageId: 104 },
    completeCondition: { type: 'compete', arenaId: 'mixed-3-25-final', minCorrect: 15 }
  },
  
  // Stage 106: BOSS CUỐI 2 - Siêu Trí Tuệ Tứ Phép
  {
    stageId: 106,
    zoneId: 'supreme-castle',
    type: 'boss',
    bossType: 'practice',
    isFinalBoss: true,
    name: '👑 BOSS CUỐI - Siêu Trí Tuệ Tứ Phép',
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
    unlockCondition: { type: 'stage', stageId: 105 },
    completeCondition: { type: 'practice', mode: 'mentalMath', difficulty: 2, minCorrect: 8 }
  },
  
  // Stage 107: BOSS CUỐI 3 - Tia Chớp Tối Thượng
  {
    stageId: 107,
    zoneId: 'supreme-castle',
    type: 'boss',
    bossType: 'practice',
    isFinalBoss: true,
    name: '👑 BOSS CUỐI - Tia Chớp Tối Thượng',
    description: 'Luyện Flash Anzan • Ánh Trăng • 5 bài đúng',
    icon: '👑',
    link: '/practice/auto?mode=flashAnzan&difficulty=2',
    practiceInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      difficulty: 2,
      difficultyName: 'Ánh Trăng',
      minCorrect: 5
    },
    unlockCondition: { type: 'stage', stageId: 106 },
    completeCondition: { type: 'practice', mode: 'flashAnzan', difficulty: 2, minCorrect: 5 }
  },
  
  // Stage 108: KHO BÁU - Nhận Chứng Chỉ Toàn Diện
  {
    stageId: 108,
    zoneId: 'supreme-castle',
    type: 'treasure',
    name: '🏆 KHO BÁU TỐI THƯỢNG - CHỨNG CHỈ TOÀN DIỆN',
    description: 'Nhận Chứng Chỉ Soroban Toàn Diện!',
    icon: '🏆',
    link: '/certificate?type=complete',
    certificateInfo: {
      certType: 'complete',
      title: 'Chứng Chỉ Soroban Toàn Diện',
      description: 'Chứng nhận năng lực Soroban toàn diện: Cộng Trừ Nhân Chia + Siêu Trí Tuệ + Tia Chớp'
    },
    unlockCondition: { type: 'stage', stageId: 107 },
    completeCondition: { type: 'certificate', certType: 'complete' }
  },
];

// ============================================================
// 🗺️ ZONES CONFIG - PHẦN NHÂN CHIA
// ============================================================

export const GAME_ZONES_MULDIV = [
  {
    zoneId: 'cave-multiply',
    order: 1,
    name: 'Chặng 1: Hang Phép Nhân',
    subtitle: 'Bảng cửu chương',
    description: 'Học bảng cửu chương và phép nhân trên Soroban!',
    icon: '✖️',
    color: 'from-orange-400 to-red-500',
    bgImage: '/images/zones/cave.jpg',
    levels: [11, 12],
    stageRange: [69, 76],
    totalBoss: 2,
    requiresCertificate: 'addSub',
    story: {
      intro: 'Hang Phép Nhân - nơi con học cách nhân số lên nhiều lần!',
      complete: 'Phi thường! Con đã nắm vững phép nhân. Hồ Chia Cơ Bản đang chờ đón!'
    }
  },
  {
    zoneId: 'lake-divide-basic',
    order: 2,
    name: 'Chặng 2: Hồ Chia Cơ Bản',
    subtitle: 'Chia cho 2-7',
    description: 'Học phép chia cơ bản - chia cho các số nhỏ!',
    icon: '➗',
    color: 'from-cyan-400 to-teal-500',
    bgImage: '/images/zones/lake.jpg',
    levels: [13],
    stageRange: [77, 80],
    totalBoss: 1,
    story: {
      intro: 'Hồ Chia Cơ Bản - nơi con học chia số thành nhiều phần!',
      complete: 'Giỏi lắm! Con đã nắm chia cơ bản. Hồ Chia Nâng Cao đang chờ!'
    }
  },
  {
    zoneId: 'lake-divide-advanced',
    order: 3,
    name: 'Chặng 3: Hồ Chia Nâng Cao',
    subtitle: 'Chia số 2 chữ số',
    description: 'Chia cho 8-9 và chia số lớn!',
    icon: '➗',
    color: 'from-teal-400 to-cyan-600',
    bgImage: '/images/zones/lake-deep.jpg',
    levels: [14],
    stageRange: [81, 86],
    totalBoss: 2,
    story: {
      intro: 'Hồ Chia Nâng Cao - thử thách chia với số lớn hơn!',
      complete: 'Xuất sắc! Con đã thành thạo Nhân và Chia. Đấu Trường Tứ Phép đang chờ!'
    }
  },
  {
    zoneId: 'arena-four',
    order: 4,
    name: 'Chặng 4: Đấu Trường Tứ Phép',
    subtitle: 'Cộng Trừ Nhân Chia',
    description: 'Luyện tập và thi đấu cả 4 phép tính!',
    icon: '⚔️',
    color: 'from-rose-400 to-pink-600',
    bgImage: '/images/zones/arena-gold.jpg',
    levels: [],
    stageRange: [87, 89],
    totalBoss: 3,
    story: {
      intro: 'Đấu Trường Tứ Phép - thử thách dành cho những nhà vô địch!',
      complete: 'Con đã chinh phục Tứ Phép! Tháp Tính Nhẩm đang chờ!'
    }
  },
  {
    zoneId: 'mental-muldiv',
    order: 5,
    name: 'Chặng 5: Tháp Tính Nhẩm',
    subtitle: 'Anzan Nhân Chia',
    description: 'Tính nhẩm Nhân Chia không cần bàn tính!',
    icon: '🧠',
    color: 'from-purple-400 to-indigo-600',
    bgImage: '/images/zones/mental-tower-gold.jpg',
    levels: [15, 16],
    lessonIds: [[2, 3], [2, 3]],
    stageRange: [90, 95],
    totalBoss: 2,
    story: {
      intro: 'Tháp Tính Nhẩm - rèn luyện Anzan Nhân Chia!',
      complete: 'Siêu phàm! Con đã tính nhẩm Nhân Chia. Đền Tốc Độ đang chờ!'
    }
  },
  {
    zoneId: 'speed-muldiv',
    order: 6,
    name: 'Chặng 6: Đền Tốc Độ',
    subtitle: 'Nhân Chia siêu tốc',
    description: 'Nhân chia với thời gian giới hạn!',
    icon: '⚡',
    color: 'from-amber-400 to-orange-600',
    bgImage: '/images/zones/speed-temple-gold.jpg',
    levels: [17],
    lessonIds: [[2, 3]],
    stageRange: [96, 99],
    totalBoss: 2,
    story: {
      intro: 'Đền Tốc Độ - thử thách tốc độ Nhân Chia!',
      complete: 'Nhanh như chớp! Đỉnh Hỗn Hợp đang chờ con!'
    }
  },
  {
    zoneId: 'mixed-peak',
    order: 7,
    name: 'Chặng 7: Đỉnh Hỗn Hợp',
    subtitle: 'Tứ phép hoàn hảo',
    description: 'Hỗn hợp 4 phép tính ở mức cao nhất!',
    icon: '🎯',
    color: 'from-fuchsia-400 to-purple-600',
    bgImage: '/images/zones/mixed-peak.jpg',
    levels: [15, 16, 17],
    lessonIds: [[4], [4], [4]],
    stageRange: [100, 104],
    totalBoss: 2,
    story: {
      intro: 'Đỉnh Hỗn Hợp - nơi 4 phép tính hòa quyện hoàn hảo!',
      complete: 'Hoàn hảo! Con đã sẵn sàng cho Lâu Đài Tối Thượng!'
    }
  },
  {
    zoneId: 'supreme-castle',
    order: 8,
    name: 'ĐÍCH ĐẾN: Lâu Đài Tối Thượng',
    subtitle: 'Chứng Chỉ Toàn Diện!',
    description: 'Vượt qua 3 Boss Cuối để nhận Chứng Chỉ Toàn Diện!',
    icon: '👑',
    color: 'from-amber-300 via-yellow-400 to-red-500',
    bgImage: '/images/zones/supreme-castle.jpg',
    levels: [],
    stageRange: [105, 108],
    totalBoss: 3,
    hasCertificate: true,
    certificateType: 'complete',
    story: {
      intro: '👑 Chào mừng đến Lâu Đài Tối Thượng - đỉnh cao của Soroban!',
      complete: '🎉👑🏆 CHÚC MỪNG! Con đã đạt được CHỨNG CHỈ SOROBAN TOÀN DIỆN! Con là MASTER! 🏆👑🎉'
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
  return GAME_STAGES_MULDIV.find(s => s.stageId === stageId);
}

/**
 * Lấy tất cả stages của một zone
 */
export function getStagesByZone(zoneId) {
  return GAME_STAGES_MULDIV.filter(s => s.zoneId === zoneId);
}

/**
 * Lấy zone theo ID
 */
export function getZoneById(zoneId) {
  return GAME_ZONES_MULDIV.find(z => z.zoneId === zoneId);
}

/**
 * Lấy index của zone (để so sánh thứ tự)
 */
export function getZoneIndex(zoneId) {
  return GAME_ZONES_MULDIV.findIndex(z => z.zoneId === zoneId);
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
    return GAME_ZONES_MULDIV[0]?.zoneId || null;
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
  
  return GAME_ZONES_MULDIV[highestZoneIndex]?.zoneId || GAME_ZONES_MULDIV[0]?.zoneId;
}

/**
 * Lấy stage tiếp theo
 */
export function getNextStage(currentStageId) {
  const currentIndex = GAME_STAGES_MULDIV.findIndex(s => s.stageId === currentStageId);
  if (currentIndex === -1 || currentIndex === GAME_STAGES_MULDIV.length - 1) return null;
  return GAME_STAGES_MULDIV[currentIndex + 1];
}

/**
 * Lấy zone tiếp theo sau zone hiện tại
 */
export function getNextZone(currentZoneId) {
  const currentIndex = GAME_ZONES_MULDIV.findIndex(z => z.zoneId === currentZoneId);
  if (currentIndex === -1 || currentIndex === GAME_ZONES_MULDIV.length - 1) return null;
  return GAME_ZONES_MULDIV[currentIndex + 1];
}

/**
 * Kiểm tra stage có phải màn cuối của zone không
 */
export function isLastStageOfZone(stageId) {
  const stage = getStageById(stageId);
  if (!stage) return false;
  
  const zone = getZoneById(stage.zoneId);
  if (!zone) return false;
  
  return zone.stageRange && stage.stageId === zone.stageRange[1];
}

/**
 * Lấy zone tiếp theo dựa vào stageId vừa hoàn thành
 */
export function getNextZoneAfterStage(stageId) {
  const stage = getStageById(stageId);
  if (!stage) return null;
  
  if (isLastStageOfZone(stageId)) {
    return getNextZone(stage.zoneId);
  }
  return null;
}

/**
 * Kiểm tra có chứng chỉ cộng trừ không (yêu cầu để mở đảo này)
 */
export function requiresAddSubCertificate() {
  return true;
}

/**
 * Đếm tổng số stages
 */
export function getTotalStages() {
  return GAME_STAGES_MULDIV.length;
}

/**
 * Đếm tổng số boss
 */
export function getTotalBosses() {
  return GAME_STAGES_MULDIV.filter(s => s.type === 'boss').length;
}

// ============================================================
// 👑 CERTIFICATE REQUIREMENTS - TỰ ĐỘNG TỪ GAME CONFIG
// Được generate từ GAME_STAGES_MULDIV và GAME_ZONES_MULDIV
// ============================================================

/**
 * Tự động tạo lessonFilter từ GAME_STAGES_MULDIV
 */
function generateLessonFilter() {
  const filter = {};
  const levels = new Set();
  
  GAME_STAGES_MULDIV.forEach(stage => {
    if (stage.type === 'lesson' && stage.levelId && stage.lessonId) {
      levels.add(stage.levelId);
      if (!filter[stage.levelId]) {
        filter[stage.levelId] = [];
      }
      if (!filter[stage.levelId].includes(stage.lessonId)) {
        filter[stage.levelId].push(stage.lessonId);
      }
    }
  });
  
  // Sort lessonIds trong mỗi level
  Object.keys(filter).forEach(levelId => {
    filter[levelId].sort((a, b) => a - b);
  });
  
  return {
    levels: Array.from(levels).sort((a, b) => a - b),
    lessonFilter: filter
  };
}

/**
 * Tự động tạo practice modes từ GAME_STAGES_MULDIV
 */
function generatePracticeModes() {
  const modes = new Set();
  let minDifficulty = 999;
  let minCorrect = 0;
  
  GAME_STAGES_MULDIV.forEach(stage => {
    if (stage.type === 'boss' && stage.bossType === 'practice' && stage.practiceInfo) {
      modes.add(stage.practiceInfo.mode);
      if (stage.practiceInfo.difficulty < minDifficulty) {
        minDifficulty = stage.practiceInfo.difficulty;
      }
      if (stage.practiceInfo.minCorrect > minCorrect) {
        minCorrect = stage.practiceInfo.minCorrect;
      }
    }
  });
  
  return {
    modes: Array.from(modes),
    minDifficulty: minDifficulty === 999 ? 1 : minDifficulty,
    minCorrect: minCorrect || 8
  };
}

/**
 * Tự động tạo compete modes từ GAME_STAGES_MULDIV
 */
function generateCompeteModes() {
  const modes = new Set();
  let minDifficulty = 999;
  let minCorrect = 0;
  
  GAME_STAGES_MULDIV.forEach(stage => {
    if (stage.type === 'boss' && stage.bossType === 'compete' && stage.competeInfo) {
      modes.add(stage.competeInfo.mode);
      if (stage.competeInfo.difficulty < minDifficulty) {
        minDifficulty = stage.competeInfo.difficulty;
      }
      if (stage.competeInfo.minCorrect > minCorrect) {
        minCorrect = stage.competeInfo.minCorrect;
      }
    }
  });
  
  return {
    modes: Array.from(modes),
    minDifficulty: minDifficulty === 999 ? 3 : minDifficulty,
    minCorrect: minCorrect || 7
  };
}

/**
 * Đếm tổng số lessons
 */
function countTotalLessons() {
  return GAME_STAGES_MULDIV.filter(s => s.type === 'lesson').length;
}

/**
 * Đếm tổng số boss trong config
 */
function countTotalBossesInConfig() {
  return GAME_STAGES_MULDIV.filter(s => s.type === 'boss').length;
}

/**
 * 👑 CHỨNG CHỈ TOÀN DIỆN - Tự động từ game config
 */
export const CERT_REQUIREMENTS_COMPLETE = (() => {
  const lessonData = generateLessonFilter();
  const practiceData = generatePracticeModes();
  const competeData = generateCompeteModes();
  const totalLessons = countTotalLessons();
  const totalBosses = countTotalBossesInConfig();
  
  return {
    certType: 'complete',
    name: 'Chứng chỉ Soroban Toàn Diện',
    description: 'Master Soroban: Cộng Trừ Nhân Chia + Siêu Trí Tuệ Tứ Phép + Tia Chớp',
    icon: '👑',
    requiredTier: 'advanced',
    prerequisite: 'addSub', // Yêu cầu có chứng chỉ Cộng Trừ trước
    // Metadata từ game config
    metadata: {
      totalStages: GAME_STAGES_MULDIV.length,
      totalZones: GAME_ZONES_MULDIV.length,
      totalLessons,
      totalBosses,
      certificateZone: GAME_ZONES_MULDIV.find(z => z.hasCertificate)?.zoneId || 'supreme-castle'
    },
    requirements: {
      // Yêu cầu có chứng chỉ Cộng Trừ
      certificate: {
        required: 'addSub',
        weight: 10,
        description: 'Tiên quyết: Đã có Chứng chỉ Cộng Trừ'
      },
      lessons: {
        ...lessonData,
        weight: 20,
        description: `Học: ${totalLessons} bài Nhân Chia + Anzan/Tốc độ từ game`
      },
      practice: {
        modes: practiceData.modes.length > 0 ? practiceData.modes : ['multiplication', 'division', 'mulDiv', 'mixed'],
        minDifficulty: Math.max(practiceData.minDifficulty, 3),
        minCorrect: 15,
        weight: 20,
        description: 'Luyện tập: Nhân, Chia, Nhân Chia Mix, Tứ Phép cấp 3+, mỗi mode 15 bài đúng'
      },
      mentalMath: {
        minCorrect: 15,
        minDifficulty: 3,
        weight: 10,
        description: 'Siêu Trí Tuệ Tứ Phép: 15 bài đúng cấp Dũng Sĩ+'
      },
      flashAnzan: {
        minLevel: 3,
        minCorrect: 10,
        weight: 10,
        description: 'Tia Chớp: cấp Tia Chớp trở lên, 10 bài đúng'
      },
      compete: {
        modes: competeData.modes.length > 0 ? competeData.modes : ['multiplication', 'division', 'mulDiv', 'mixed'],
        minDifficulty: Math.max(competeData.minDifficulty, 3),
        minCorrect: 7,
        weight: 20,
        description: 'Thi đấu: Nhân, Chia, Nhân Chia Mix, Tứ Phép cấp 3+, đạt 7+ câu đúng'
      },
      accuracy: {
        minAccuracy: 75,
        weight: 10,
        description: 'Độ chính xác tổng từ 75% trở lên'
      }
    }
  };
})();
