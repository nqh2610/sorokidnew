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
    description: 'Luyện Phép Nhân • Tập Sự • 10 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=multiplication&difficulty=1',
    practiceInfo: {
      mode: 'multiplication',
      modeName: 'Phép Nhân',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 10
    },
    unlockCondition: { type: 'lesson', levelId: 11, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'multiplication', difficulty: 1, minCorrect: 10 }
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
    zoneId: 'lake-divide',
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
    zoneId: 'lake-divide',
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
    zoneId: 'lake-divide',
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
    zoneId: 'lake-divide',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Chia Cơ Bản',
    description: 'Luyện Phép Chia • Tập Sự • 10 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=division&difficulty=1',
    practiceInfo: {
      mode: 'division',
      modeName: 'Phép Chia',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      minCorrect: 10
    },
    unlockCondition: { type: 'lesson', levelId: 13, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'division', difficulty: 1, minCorrect: 10 }
  },
  
  // Stage 81-84: Học Level 14 (Chia nâng cao)
  {
    stageId: 81,
    zoneId: 'lake-divide',
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
    zoneId: 'lake-divide',
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
    zoneId: 'lake-divide',
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
    zoneId: 'lake-divide',
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
    zoneId: 'lake-divide',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Chia Nâng Cao',
    description: 'Luyện Phép Chia • Chiến Binh • 15 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=division&difficulty=2',
    practiceInfo: {
      mode: 'division',
      modeName: 'Phép Chia',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 15
    },
    unlockCondition: { type: 'lesson', levelId: 14, lessonId: 4 },
    completeCondition: { type: 'practice', mode: 'division', difficulty: 2, minCorrect: 15 }
  },
  
  // Stage 86: BOSS - Thi đấu Chia
  {
    stageId: 86,
    zoneId: 'lake-divide',
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
    description: 'Luyện Nhân Chia Mix • Chiến Binh • 20 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=mulDiv&difficulty=2',
    practiceInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 20
    },
    unlockCondition: { type: 'stage', stageId: 86 },
    completeCondition: { type: 'practice', mode: 'mulDiv', difficulty: 2, minCorrect: 20 }
  },
  
  // Stage 88: BOSS - Luyện Tứ Phép
  {
    stageId: 88,
    zoneId: 'arena-four',
    type: 'boss',
    bossType: 'practice',
    name: '👹 Boss Tứ Phép Thần',
    description: 'Luyện Tứ Phép • Dũng Sĩ • 20 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=mixed&difficulty=3',
    practiceInfo: {
      mode: 'mixed',
      modeName: 'Tứ Phép Thần',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      minCorrect: 20
    },
    unlockCondition: { type: 'stage', stageId: 87 },
    completeCondition: { type: 'practice', mode: 'mixed', difficulty: 3, minCorrect: 20 }
  },
  
  // Stage 89: BOSS - Thi đấu Tứ Phép
  {
    stageId: 89,
    zoneId: 'arena-four',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Tứ Phép',
    description: 'Thi đấu Tứ Phép • Dũng Sĩ • 15 câu • 10+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mixed&difficulty=3&questions=15',
    competeInfo: {
      mode: 'mixed',
      modeName: 'Tứ Phép Thần',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      questions: 15,
      minCorrect: 10,
      arenaId: 'mixed-3-15'
    },
    unlockCondition: { type: 'stage', stageId: 88 },
    completeCondition: { type: 'compete', arenaId: 'mixed-3-15', minCorrect: 10 }
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
    description: 'Luyện Nhân Chia Mix • Dũng Sĩ • 15 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=mulDiv&difficulty=3',
    practiceInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      minCorrect: 15
    },
    unlockCondition: { type: 'lesson', levelId: 15, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'mulDiv', difficulty: 3, minCorrect: 15 }
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
    description: 'Luyện Nhân Chia Mix • Cao Thủ • 20 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=mulDiv&difficulty=4',
    practiceInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 4,
      difficultyName: 'Cao Thủ',
      minCorrect: 20
    },
    unlockCondition: { type: 'lesson', levelId: 16, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'mulDiv', difficulty: 4, minCorrect: 20 }
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
    description: 'Luyện Nhân Chia Mix • Huyền Thoại • 25 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=mulDiv&difficulty=5',
    practiceInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 5,
      difficultyName: 'Huyền Thoại',
      minCorrect: 25
    },
    unlockCondition: { type: 'lesson', levelId: 17, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'mulDiv', difficulty: 5, minCorrect: 25 }
  },
  
  // Stage 99: BOSS - Thi đấu Tốc độ Nhân Chia
  {
    stageId: 99,
    zoneId: 'speed-muldiv',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Tốc Độ Nhân Chia',
    description: 'Thi đấu Nhân Chia Mix • Huyền Thoại • 20 câu • 15+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mulDiv&difficulty=5&questions=20',
    competeInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 5,
      difficultyName: 'Huyền Thoại',
      questions: 20,
      minCorrect: 15,
      arenaId: 'mulDiv-5-20'
    },
    unlockCondition: { type: 'stage', stageId: 98 },
    completeCondition: { type: 'compete', arenaId: 'mulDiv-5-20', minCorrect: 15 }
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
    description: 'Luyện Tứ Phép • Huyền Thoại • 30 bài đúng',
    icon: '👹',
    link: '/practice/auto?mode=mixed&difficulty=5',
    practiceInfo: {
      mode: 'mixed',
      modeName: 'Tứ Phép Thần',
      difficulty: 5,
      difficultyName: 'Huyền Thoại',
      minCorrect: 30
    },
    unlockCondition: { type: 'lesson', levelId: 17, lessonId: 4 },
    completeCondition: { type: 'practice', mode: 'mixed', difficulty: 5, minCorrect: 30 }
  },
  
  // Stage 104: BOSS - Thi đấu Tứ Phép Ultimate
  {
    stageId: 104,
    zoneId: 'mixed-peak',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Tứ Phép Ultimate',
    description: 'Thi đấu Tứ Phép • Huyền Thoại • 25 câu • 18+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mixed&difficulty=5&questions=25',
    competeInfo: {
      mode: 'mixed',
      modeName: 'Tứ Phép Thần',
      difficulty: 5,
      difficultyName: 'Huyền Thoại',
      questions: 25,
      minCorrect: 18,
      arenaId: 'mixed-5-25'
    },
    unlockCondition: { type: 'stage', stageId: 103 },
    completeCondition: { type: 'compete', arenaId: 'mixed-5-25', minCorrect: 18 }
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
    description: 'Thi đấu Tứ Phép • Cao Thủ • 25 câu • 18+ đúng',
    icon: '👑',
    link: '/compete/auto?mode=mixed&difficulty=4&questions=25',
    competeInfo: {
      mode: 'mixed',
      modeName: 'Tứ Phép Thần',
      difficulty: 4,
      difficultyName: 'Cao Thủ',
      questions: 25,
      minCorrect: 18,
      arenaId: 'mixed-4-25'
    },
    unlockCondition: { type: 'stage', stageId: 104 },
    completeCondition: { type: 'compete', arenaId: 'mixed-4-25', minCorrect: 18 }
  },
  
  // Stage 106: BOSS CUỐI 2 - Siêu Trí Tuệ Tứ Phép
  {
    stageId: 106,
    zoneId: 'supreme-castle',
    type: 'boss',
    bossType: 'practice',
    isFinalBoss: true,
    name: '👑 BOSS CUỐI - Siêu Trí Tuệ Tứ Phép',
    description: 'Luyện Siêu Trí Tuệ • Dũng Sĩ • 15 bài đúng',
    icon: '👑',
    link: '/practice/auto?mode=mentalMath&difficulty=3',
    practiceInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      minCorrect: 15
    },
    unlockCondition: { type: 'stage', stageId: 105 },
    completeCondition: { type: 'practice', mode: 'mentalMath', difficulty: 3, minCorrect: 15 }
  },
  
  // Stage 107: BOSS CUỐI 3 - Tia Chớp Tối Thượng
  {
    stageId: 107,
    zoneId: 'supreme-castle',
    type: 'boss',
    bossType: 'practice',
    isFinalBoss: true,
    name: '👑 BOSS CUỐI - Tia Chớp Tối Thượng',
    description: 'Luyện Flash Anzan • Tia Chớp • 10 bài đúng',
    icon: '👑',
    link: '/practice/auto?mode=flashAnzan&difficulty=3',
    practiceInfo: {
      mode: 'flashAnzan',
      modeName: 'Tia Chớp',
      difficulty: 3,
      difficultyName: 'Tia Chớp',
      minCorrect: 10
    },
    unlockCondition: { type: 'stage', stageId: 106 },
    completeCondition: { type: 'practice', mode: 'flashAnzan', difficulty: 3, minCorrect: 10 }
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
    name: '✖️ Hang Phép Nhân',
    subtitle: 'Sức mạnh nhân đôi, nhân ba!',
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
      complete: 'Phi thường! Con đã nắm vững phép nhân. Hồ Phép Chia đang chờ đón!'
    }
  },
  {
    zoneId: 'lake-divide',
    name: '➗ Hồ Phép Chia',
    subtitle: 'Chia đều, chia sẻ!',
    description: 'Học phép chia - phép ngược của phép nhân!',
    icon: '➗',
    color: 'from-cyan-400 to-teal-500',
    bgImage: '/images/zones/lake.jpg',
    levels: [13, 14],
    stageRange: [77, 86],
    totalBoss: 3,
    story: {
      intro: 'Hồ Phép Chia - nơi con học cách chia số thành nhiều phần!',
      complete: 'Xuất sắc! Con đã thành thạo Nhân và Chia. Đấu Trường Tứ Phép đang chờ!'
    }
  },
  {
    zoneId: 'arena-four',
    name: '⚔️ Đấu Trường Tứ Phép',
    subtitle: 'Thử thách tứ phép!',
    description: 'Luyện tập và thi đấu cả 4 phép tính!',
    icon: '⚔️',
    color: 'from-rose-400 to-pink-600',
    bgImage: '/images/zones/arena-gold.jpg',
    levels: [],
    stageRange: [87, 89],
    totalBoss: 3,
    story: {
      intro: 'Đấu Trường Tứ Phép - thử thách dành cho những nhà vô địch!',
      complete: 'Con đã chinh phục Tứ Phép! Tháp Trí Tuệ Nhân Chia đang chờ!'
    }
  },
  {
    zoneId: 'mental-muldiv',
    name: '🧠 Tháp Trí Tuệ Nhân Chia',
    subtitle: 'Nhân chia bằng tâm trí!',
    description: 'Tính nhẩm Nhân Chia không cần bàn tính!',
    icon: '🧠',
    color: 'from-purple-400 to-indigo-600',
    bgImage: '/images/zones/mental-tower-gold.jpg',
    levels: [15, 16],
    lessonIds: [[2, 3], [2, 3]], // Chỉ lesson 2, 3 của mỗi level
    stageRange: [90, 95],
    totalBoss: 2,
    story: {
      intro: 'Tháp Trí Tuệ Nhân Chia - rèn luyện Anzan Nhân Chia!',
      complete: 'Siêu phàm! Con đã tính nhẩm Nhân Chia. Đền Tốc Độ đang chờ!'
    }
  },
  {
    zoneId: 'speed-muldiv',
    name: '⚡ Đền Tốc Độ Nhân Chia',
    subtitle: 'Nhân chia siêu tốc!',
    description: 'Nhân chia với thời gian giới hạn!',
    icon: '⚡',
    color: 'from-amber-400 to-orange-600',
    bgImage: '/images/zones/speed-temple-gold.jpg',
    levels: [17],
    lessonIds: [[2, 3]], // Lesson 2, 3
    stageRange: [96, 99],
    totalBoss: 2,
    story: {
      intro: 'Đền Tốc Độ Nhân Chia - thử thách tốc độ Nhân Chia!',
      complete: 'Nhanh như chớp! Đỉnh Hỗn Hợp đang chờ con!'
    }
  },
  {
    zoneId: 'mixed-peak',
    name: '🎯 Đỉnh Hỗn Hợp',
    subtitle: 'Tứ phép hoàn hảo!',
    description: 'Hỗn hợp 4 phép tính ở mức cao nhất!',
    icon: '🎯',
    color: 'from-fuchsia-400 to-purple-600',
    bgImage: '/images/zones/mixed-peak.jpg',
    levels: [15, 16, 17],
    lessonIds: [[4], [4], [4]], // Chỉ lesson 4 của mỗi level
    stageRange: [100, 104],
    totalBoss: 2,
    story: {
      intro: 'Đỉnh Hỗn Hợp - nơi 4 phép tính hòa quyện hoàn hảo!',
      complete: 'Hoàn hảo! Con đã sẵn sàng cho Lâu Đài Tối Thượng!'
    }
  },
  {
    zoneId: 'supreme-castle',
    name: '👑 Lâu Đài Tối Thượng',
    subtitle: 'Đỉnh cao cuối cùng!',
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
