/**
 * 🗺️ GAME MAP CONFIG - PHẦN 2: NHÂN CHIA → CHỨNG CHỈ TOÀN DIỆN
 * 
 * Yêu cầu: Phải có Chứng Chỉ Cộng Trừ trước (hoàn thành adventure-stages-addsub.config.js)
 * 
 * Database sử dụng:
 * - Progress: tiến độ học (levelId, lessonId)
 * - ExerciseResult: luyện tập (exerciseType, difficulty, isCorrect)
 * - CompeteResult: thi đấu (arenaId = "mode-difficulty-questions")
 * 
 * Stage bắt đầu từ 89 (tiếp nối từ file adventure-stages-addsub.config.js kết thúc ở 88)
 */

// ============================================================
// ✖️➗ ĐẢO NHÂN CHIA - LỘ TRÌNH ĐẠT CHỨNG CHỈ TOÀN DIỆN
// ============================================================

export const GAME_STAGES_MULDIV = [
  
  // ============================================================
  // ✖️ ZONE 1: HANG PHÉP NHÂN (Level 11-12)
  // Sắp xếp: Nhân cơ bản → Nhân nâng cao, mỗi practice có compete
  // ============================================================
  
  // Stage 89-91: Học Level 11 (Bảng nhân 2-7)
  {
    stageId: 89,
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
    stageId: 90,
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
    stageId: 91,
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
  
  // Stage 92-93: Nhân cơ bản (Luyện + Thi đấu)
  {
    stageId: 92,
    zoneId: 'cave-multiply',
    type: 'boss',
    bossType: 'practice',
    name: '✖️ Luyện Nhân Cơ Bản',
    description: 'Luyện Phép Nhân • Tập Sự • 8 bài đúng',
    icon: '✖️',
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
  {
    stageId: 93,
    zoneId: 'cave-multiply',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Nhân Cơ Bản',
    description: 'Thi đấu Phép Nhân • Tập Sự • 8 câu • 5+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=multiplication&difficulty=1&questions=8',
    competeInfo: {
      mode: 'multiplication',
      modeName: 'Phép Nhân',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      questions: 8,
      minCorrect: 5,
      arenaId: 'multiplication-1-8'
    },
    unlockCondition: { type: 'stage', stageId: 92 },
    completeCondition: { type: 'compete', arenaId: 'multiplication-1-8', minCorrect: 5 }
  },
  
  // Stage 94-96: Học Level 12 (Bảng nhân 8-9)
  {
    stageId: 94,
    zoneId: 'cave-multiply',
    type: 'lesson',
    levelId: 12,
    lessonId: 1,
    name: '✖️ Nhân với 8, 9',
    description: 'Hoàn thành bảng cửu chương',
    icon: '📚',
    link: '/learn/12/1',
    unlockCondition: { type: 'stage', stageId: 93 }
  },
  {
    stageId: 95,
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
    stageId: 96,
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
  
  // Stage 97-98: Nhân nâng cao (Luyện + Thi đấu)
  {
    stageId: 97,
    zoneId: 'cave-multiply',
    type: 'boss',
    bossType: 'practice',
    name: '✖️ Luyện Nhân Nâng Cao',
    description: 'Luyện Phép Nhân • Chiến Binh • 10 bài đúng',
    icon: '✖️',
    link: '/practice/auto?mode=multiplication&difficulty=2',
    practiceInfo: {
      mode: 'multiplication',
      modeName: 'Phép Nhân',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 10
    },
    unlockCondition: { type: 'lesson', levelId: 12, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'multiplication', difficulty: 2, minCorrect: 10 }
  },
  {
    stageId: 98,
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
    unlockCondition: { type: 'stage', stageId: 97 },
    completeCondition: { type: 'compete', arenaId: 'multiplication-2-10', minCorrect: 6 }
  },

  // ============================================================
  // ➗ ZONE 2: HỒ PHÉP CHIA (Level 13-14)
  // Sắp xếp: Chia cơ bản → Chia nâng cao, mỗi practice có compete
  // ============================================================
  
  // Stage 99-101: Học Level 13 (Chia cơ bản)
  {
    stageId: 99,
    zoneId: 'lake-divide-basic',
    type: 'lesson',
    levelId: 13,
    lessonId: 1,
    name: '➗ Khái niệm phép chia',
    description: 'Hiểu phép chia và chia hết',
    icon: '📚',
    link: '/learn/13/1',
    unlockCondition: { type: 'stage', stageId: 98 }
  },
  {
    stageId: 100,
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
    stageId: 101,
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
  
  // Stage 102-103: Chia cơ bản (Luyện + Thi đấu)
  {
    stageId: 102,
    zoneId: 'lake-divide-basic',
    type: 'boss',
    bossType: 'practice',
    name: '➗ Luyện Chia Cơ Bản',
    description: 'Luyện Phép Chia • Tập Sự • 8 bài đúng',
    icon: '➗',
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
  {
    stageId: 103,
    zoneId: 'lake-divide-basic',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Chia Cơ Bản',
    description: 'Thi đấu Phép Chia • Tập Sự • 8 câu • 5+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=division&difficulty=1&questions=8',
    competeInfo: {
      mode: 'division',
      modeName: 'Phép Chia',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      questions: 8,
      minCorrect: 5,
      arenaId: 'division-1-8'
    },
    unlockCondition: { type: 'stage', stageId: 102 },
    completeCondition: { type: 'compete', arenaId: 'division-1-8', minCorrect: 5 }
  },
  
  // ============================================================
  // ➗ ZONE 3: HỒ CHIA NÂNG CAO (Level 14)
  // ============================================================
  
  // Stage 104-107: Học Level 14 (Chia nâng cao)
  {
    stageId: 104,
    zoneId: 'lake-divide-advanced',
    type: 'lesson',
    levelId: 14,
    lessonId: 1,
    name: '➗ Chia cho 8, 9',
    description: 'Hoàn thành bảng chia',
    icon: '📚',
    link: '/learn/14/1',
    unlockCondition: { type: 'stage', stageId: 103 }
  },
  {
    stageId: 105,
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
    stageId: 106,
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
    stageId: 107,
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
  
  // Stage 108-109: Chia nâng cao (Luyện + Thi đấu)
  {
    stageId: 108,
    zoneId: 'lake-divide-advanced',
    type: 'boss',
    bossType: 'practice',
    name: '➗ Luyện Chia Nâng Cao',
    description: 'Luyện Phép Chia • Chiến Binh • 10 bài đúng',
    icon: '➗',
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
  {
    stageId: 109,
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
    unlockCondition: { type: 'stage', stageId: 108 },
    completeCondition: { type: 'compete', arenaId: 'division-2-10', minCorrect: 6 }
  },

  // ============================================================
  // ⚔️ ZONE 4: ĐẤU TRƯỜNG TỨ PHÉP (Mix 4 phép)
  // Sắp xếp: Nhân Chia Mix → Tứ Phép, mỗi practice có compete
  // ============================================================
  
  // Stage 110-111: Nhân Chia Mix (Luyện + Thi đấu)
  {
    stageId: 110,
    zoneId: 'arena-four',
    type: 'boss',
    bossType: 'practice',
    name: '⚔️ Luyện Nhân Chia Mix',
    description: 'Luyện Nhân Chia Mix • Chiến Binh • 12 bài đúng',
    icon: '⚔️',
    link: '/practice/auto?mode=mulDiv&difficulty=2',
    practiceInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 12
    },
    unlockCondition: { type: 'stage', stageId: 109 },
    completeCondition: { type: 'practice', mode: 'mulDiv', difficulty: 2, minCorrect: 12 }
  },
  {
    stageId: 111,
    zoneId: 'arena-four',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Nhân Chia Mix',
    description: 'Thi đấu Nhân Chia Mix • Chiến Binh • 10 câu • 6+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mulDiv&difficulty=2&questions=10',
    competeInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      questions: 10,
      minCorrect: 6,
      arenaId: 'mulDiv-2-10'
    },
    unlockCondition: { type: 'stage', stageId: 110 },
    completeCondition: { type: 'compete', arenaId: 'mulDiv-2-10', minCorrect: 6 }
  },
  
  // Stage 112-113: Tứ Phép (Luyện + Thi đấu)
  {
    stageId: 112,
    zoneId: 'arena-four',
    type: 'boss',
    bossType: 'practice',
    name: '⚔️ Luyện Tứ Phép Thần',
    description: 'Luyện Tứ Phép • Chiến Binh • 12 bài đúng',
    icon: '⚔️',
    link: '/practice/auto?mode=mixed&difficulty=2',
    practiceInfo: {
      mode: 'mixed',
      modeName: 'Tứ Phép Thần',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      minCorrect: 12
    },
    unlockCondition: { type: 'stage', stageId: 111 },
    completeCondition: { type: 'practice', mode: 'mixed', difficulty: 2, minCorrect: 12 }
  },
  {
    stageId: 113,
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
    unlockCondition: { type: 'stage', stageId: 112 },
    completeCondition: { type: 'compete', arenaId: 'mixed-2-15', minCorrect: 9 }
  },

  // ============================================================
  // 🧠 ZONE 5: THÁP TRÍ TUỆ NHÂN CHIA (Level 15.2-15.3, 16.2-16.3)
  // Siêu Trí Tuệ Nhân Chia, mỗi practice có compete
  // ============================================================
  
  // Stage 114-115: Học 15.2, 15.3 (Nhân Chia nhẩm cơ bản)
  {
    stageId: 114,
    zoneId: 'mental-muldiv',
    type: 'lesson',
    levelId: 15,
    lessonId: 2,
    name: '✖️ Nhân nhẩm cơ bản',
    description: 'Tính nhẩm bảng cửu chương 2-5',
    icon: '📚',
    link: '/learn/15/2',
    unlockCondition: { type: 'stage', stageId: 113 }
  },
  {
    stageId: 115,
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
  
  // Stage 116-117: Nhân Chia nhẩm cơ bản (Luyện + Thi đấu)
  {
    stageId: 116,
    zoneId: 'mental-muldiv',
    type: 'boss',
    bossType: 'practice',
    name: '🧠 Luyện STT Nhân Chia Cơ Bản',
    description: 'Luyện Nhân Chia Mix • Tập Sự • 6 bài đúng',
    icon: '🧠',
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
  {
    stageId: 117,
    zoneId: 'mental-muldiv',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu STT Nhân Chia Cơ Bản',
    description: 'Thi đấu Nhân Chia • Tập Sự • 8 câu • 5+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mulDiv&difficulty=1&questions=8',
    competeInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 1,
      difficultyName: 'Tập Sự',
      questions: 8,
      minCorrect: 5,
      arenaId: 'mulDiv-1-8'
    },
    unlockCondition: { type: 'stage', stageId: 116 },
    completeCondition: { type: 'compete', arenaId: 'mulDiv-1-8', minCorrect: 5 }
  },
  
  // Stage 118-119: Học 16.2, 16.3 (Nhân Chia nhẩm nâng cao)
  {
    stageId: 118,
    zoneId: 'mental-muldiv',
    type: 'lesson',
    levelId: 16,
    lessonId: 2,
    name: '✖️ Nhân nhẩm nâng cao',
    description: 'Bảng 6-9 và nhân số 2 chữ số',
    icon: '📚',
    link: '/learn/16/2',
    unlockCondition: { type: 'stage', stageId: 117 }
  },
  {
    stageId: 119,
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
  
  // Stage 120-121: Nhân Chia nhẩm nâng cao (Luyện + Thi đấu)
  {
    stageId: 120,
    zoneId: 'mental-muldiv',
    type: 'boss',
    bossType: 'practice',
    name: '🧠 Luyện STT Nhân Chia Nâng Cao',
    description: 'Luyện Nhân Chia Mix • Chiến Binh • 8 bài đúng',
    icon: '🧠',
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
  {
    stageId: 121,
    zoneId: 'mental-muldiv',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu STT Nhân Chia Nâng Cao',
    description: 'Thi đấu Nhân Chia • Chiến Binh • 10 câu • 6+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mulDiv&difficulty=2&questions=10',
    competeInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      questions: 10,
      minCorrect: 6,
      arenaId: 'mulDiv-2-10-mental'
    },
    unlockCondition: { type: 'stage', stageId: 120 },
    completeCondition: { type: 'compete', arenaId: 'mulDiv-2-10-mental', minCorrect: 6 }
  },

  // ============================================================
  // ⚡ ZONE 6: ĐỀN TỐC ĐỘ NHÂN CHIA (Level 17.2, 17.3)
  // Tốc độ tối đa 3-4 số, mỗi practice có compete
  // ============================================================
  
  // Stage 122-123: Học 17.2, 17.3 (Tốc độ Nhân Chia)
  {
    stageId: 122,
    zoneId: 'speed-muldiv',
    type: 'lesson',
    levelId: 17,
    lessonId: 2,
    name: '⚡ Nhân tốc độ',
    description: 'Nhân nhẩm bảng cửu chương nhanh',
    icon: '📚',
    link: '/learn/17/2',
    unlockCondition: { type: 'stage', stageId: 121 }
  },
  {
    stageId: 123,
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
  
  // Stage 124-125: Tốc độ Nhân Chia 3 số (Luyện + Thi đấu)
  {
    stageId: 124,
    zoneId: 'speed-muldiv',
    type: 'boss',
    bossType: 'practice',
    name: '⚡ Luyện Tốc Độ Nhân Chia 3 Số',
    description: 'Luyện Nhân Chia Mix • Dũng Sĩ • 10 bài đúng',
    icon: '⚡',
    link: '/practice/auto?mode=mulDiv&difficulty=3',
    practiceInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      minCorrect: 10
    },
    unlockCondition: { type: 'lesson', levelId: 17, lessonId: 3 },
    completeCondition: { type: 'practice', mode: 'mulDiv', difficulty: 3, minCorrect: 10 }
  },
  {
    stageId: 125,
    zoneId: 'speed-muldiv',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Tốc Độ Nhân Chia 3 Số',
    description: 'Thi đấu Nhân Chia Mix • Dũng Sĩ • 15 câu • 10+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mulDiv&difficulty=3&questions=15',
    competeInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      questions: 15,
      minCorrect: 10,
      arenaId: 'mulDiv-3-15'
    },
    unlockCondition: { type: 'stage', stageId: 124 },
    completeCondition: { type: 'compete', arenaId: 'mulDiv-3-15', minCorrect: 10 }
  },
  
  // Stage 126-127: Tốc độ Nhân Chia 4 số (Luyện + Thi đấu)
  {
    stageId: 126,
    zoneId: 'speed-muldiv',
    type: 'boss',
    bossType: 'practice',
    name: '⚡ Luyện Tốc Độ Nhân Chia 4 Số',
    description: 'Luyện Nhân Chia Mix • Cao Thủ • 12 bài đúng',
    icon: '⚡',
    link: '/practice/auto?mode=mulDiv&difficulty=4',
    practiceInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 4,
      difficultyName: 'Cao Thủ',
      minCorrect: 12
    },
    unlockCondition: { type: 'stage', stageId: 125 },
    completeCondition: { type: 'practice', mode: 'mulDiv', difficulty: 4, minCorrect: 12 }
  },
  {
    stageId: 127,
    zoneId: 'speed-muldiv',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Tốc Độ Nhân Chia',
    description: 'Thi đấu Nhân Chia Mix • Cao Thủ • 20 câu • 12+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mulDiv&difficulty=4&questions=20',
    competeInfo: {
      mode: 'mulDiv',
      modeName: 'Nhân Chia Mix',
      difficulty: 4,
      difficultyName: 'Cao Thủ',
      questions: 20,
      minCorrect: 12,
      arenaId: 'mulDiv-4-20'
    },
    unlockCondition: { type: 'stage', stageId: 126 },
    completeCondition: { type: 'compete', arenaId: 'mulDiv-4-20', minCorrect: 12 }
  },

  // ============================================================
  // 🎯 ZONE 7: ĐỈNH HỖN HỢP (Level 15.4, 16.4, 17.4)
  // Tứ Phép tổng hợp, mỗi practice có compete
  // ============================================================
  
  // Stage 128-130: Học bài Hỗn hợp 4 phép
  {
    stageId: 128,
    zoneId: 'mixed-peak',
    type: 'lesson',
    levelId: 15,
    lessonId: 4,
    name: '🎯 Hỗn hợp 4 phép cơ bản',
    description: 'Tính nhẩm xen kẽ 4 phép',
    icon: '📚',
    link: '/learn/15/4',
    unlockCondition: { type: 'stage', stageId: 127 }
  },
  {
    stageId: 129,
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
    stageId: 130,
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
  
  // Stage 131-132: Tứ Phép 3 số (Luyện + Thi đấu)
  {
    stageId: 131,
    zoneId: 'mixed-peak',
    type: 'boss',
    bossType: 'practice',
    name: '🎯 Luyện Tứ Phép 3 Số',
    description: 'Luyện Tứ Phép • Dũng Sĩ • 12 bài đúng',
    icon: '🎯',
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
  {
    stageId: 132,
    zoneId: 'mixed-peak',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Tứ Phép 3 Số',
    description: 'Thi đấu Tứ Phép • Dũng Sĩ • 20 câu • 12+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mixed&difficulty=3&questions=20',
    competeInfo: {
      mode: 'mixed',
      modeName: 'Tứ Phép Thần',
      difficulty: 3,
      difficultyName: 'Dũng Sĩ',
      questions: 20,
      minCorrect: 12,
      arenaId: 'mixed-3-20'
    },
    unlockCondition: { type: 'stage', stageId: 131 },
    completeCondition: { type: 'compete', arenaId: 'mixed-3-20', minCorrect: 12 }
  },
  
  // Stage 133-134: Tứ Phép 4 số (Luyện + Thi đấu)
  {
    stageId: 133,
    zoneId: 'mixed-peak',
    type: 'boss',
    bossType: 'practice',
    name: '🎯 Luyện Tứ Phép 4 Số',
    description: 'Luyện Tứ Phép • Cao Thủ • 15 bài đúng',
    icon: '🎯',
    link: '/practice/auto?mode=mixed&difficulty=4',
    practiceInfo: {
      mode: 'mixed',
      modeName: 'Tứ Phép Thần',
      difficulty: 4,
      difficultyName: 'Cao Thủ',
      minCorrect: 15
    },
    unlockCondition: { type: 'stage', stageId: 132 },
    completeCondition: { type: 'practice', mode: 'mixed', difficulty: 4, minCorrect: 15 }
  },
  {
    stageId: 134,
    zoneId: 'mixed-peak',
    type: 'boss',
    bossType: 'compete',
    name: '🏆 Đấu Trường Tứ Phép Ultimate',
    description: 'Thi đấu Tứ Phép • Cao Thủ • 25 câu • 15+ đúng',
    icon: '🏆',
    link: '/compete/auto?mode=mixed&difficulty=4&questions=25',
    competeInfo: {
      mode: 'mixed',
      modeName: 'Tứ Phép Thần',
      difficulty: 4,
      difficultyName: 'Cao Thủ',
      questions: 25,
      minCorrect: 15,
      arenaId: 'mixed-4-25'
    },
    unlockCondition: { type: 'stage', stageId: 133 },
    completeCondition: { type: 'compete', arenaId: 'mixed-4-25', minCorrect: 15 }
  },

  // ============================================================
  // 👑 ZONE 8: LÂU ĐÀI TỐI THƯỢNG (Boss Cuối + Chứng Chỉ Toàn Diện)
  // 3 Boss Cuối compete + Certificate
  // ============================================================
  
  // Stage 135: BOSS CUỐI 1 - Đại Chiến Tứ Phép
  {
    stageId: 135,
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
      arenaId: 'final-mixed-4-25'
    },
    unlockCondition: { type: 'stage', stageId: 134 },
    completeCondition: { type: 'compete', arenaId: 'final-mixed-4-25', minCorrect: 18 }
  },
  
  // Stage 136: BOSS CUỐI 2 - Siêu Trí Tuệ Tứ Phép
  {
    stageId: 136,
    zoneId: 'supreme-castle',
    type: 'boss',
    bossType: 'compete',
    isFinalBoss: true,
    name: '👑 BOSS CUỐI - STT Tứ Phép',
    description: 'Thi đấu STT • Chiến Binh • Mix • 15 câu • 10+ đúng',
    icon: '👑',
    link: '/compete/auto?mode=mentalMath&difficulty=2&subMode=mixed&questions=15',
    competeInfo: {
      mode: 'mentalMath',
      modeName: 'Siêu Trí Tuệ',
      subMode: 'mixed',
      difficulty: 2,
      difficultyName: 'Chiến Binh',
      questions: 15,
      minCorrect: 10,
      arenaId: 'final-mentalMath-2-mixed-15'
    },
    unlockCondition: { type: 'stage', stageId: 135 },
    completeCondition: { type: 'compete', arenaId: 'final-mentalMath-2-mixed-15', minCorrect: 10 }
  },
  
  // Stage 137: BOSS CUỐI 3 - Tia Chớp Tối Thượng
  {
    stageId: 137,
    zoneId: 'supreme-castle',
    type: 'boss',
    bossType: 'compete',
    isFinalBoss: true,
    name: '👑 BOSS CUỐI - Tia Chớp Tối Thượng',
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
      arenaId: 'final-flash-2-mix-12-supreme'
    },
    unlockCondition: { type: 'stage', stageId: 136 },
    completeCondition: { type: 'compete', arenaId: 'final-flash-2-mix-12-supreme', minCorrect: 8 }
  },
  
  // Stage 138: KHO BÁU - Nhận Chứng Chỉ Toàn Diện
  {
    stageId: 138,
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
    unlockCondition: { type: 'stage', stageId: 137 },
    completeCondition: { type: 'certificate', certType: 'complete' }
  },
];

// ============================================================
// 🗺️ ZONES CONFIG - PHẦN NHÂN CHIA
// Import từ zone-stories.config.js để lấy background, floating objects, stories
// ============================================================

import { 
  getZoneBackground, 
  getZoneFloatingObjects, 
  getZoneStory,
  getVictoryEffect 
} from './zone-stories.config.js';

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
    stageRange: [89, 98],
    totalBoss: 4,
    requiresCertificate: 'addSub',
    // Thêm theme và floating objects
    theme: 'crystal',
    floatingObjects: ['💠', '🔷', '🪨', '✖️', '🕯️'],
    bgGradient: 'linear-gradient(135deg, #EFEBE9 0%, #D7CCC8 100%)',
    victoryEffect: 'crystal-burst',
    story: {
      intro: 'Hang Phép Nhân - nơi con học cách nhân số lên nhiều lần!',
      complete: 'Phi thường! Con đã nắm vững phép nhân. Hồ Chia đang chờ đón!'
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
    stageRange: [99, 103],
    totalBoss: 2,
    // Thêm theme và floating objects
    theme: 'water',
    floatingObjects: ['💧', '🐟', '🪷', '➗', '🌊'],
    bgGradient: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)',
    victoryEffect: 'water-splash',
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
    stageRange: [104, 109],
    totalBoss: 2,
    // Thêm theme và floating objects
    theme: 'deep-water',
    floatingObjects: ['🫧', '🦑', '🐚', '🪸', '🔱'],
    bgGradient: 'linear-gradient(135deg, #B2EBF2 0%, #80DEEA 100%)',
    victoryEffect: 'deep-water',
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
    stageRange: [110, 113],
    totalBoss: 4,
    // Thêm theme và floating objects
    theme: 'arena',
    floatingObjects: ['⚔️', '🛡️', '➕', '✖️', '🎪'],
    bgGradient: 'linear-gradient(135deg, #FBE9E7 0%, #FFCCBC 100%)',
    victoryEffect: 'arena-champion',
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
    stageRange: [114, 121],
    totalBoss: 4,
    // Thêm theme và floating objects
    theme: 'formula',
    floatingObjects: ['🧠', '📊', '🔢', '∑', '∞'],
    bgGradient: 'linear-gradient(135deg, #EDE7F6 0%, #D1C4E9 100%)',
    victoryEffect: 'mind-power',
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
    description: 'Nhân chia với thời gian giới hạn! (Tối đa 4 chữ số)',
    icon: '⚡',
    color: 'from-amber-400 to-orange-600',
    bgImage: '/images/zones/speed-temple-gold.jpg',
    levels: [17],
    lessonIds: [[2, 3]],
    stageRange: [122, 127],
    totalBoss: 4,
    // Thêm theme và floating objects
    theme: 'fire-speed',
    floatingObjects: ['🔥', '⚡', '💥', '⏱️', '🎯'],
    bgGradient: 'linear-gradient(135deg, #FFF3E0 0%, #FFCC80 100%)',
    victoryEffect: 'fire-burst',
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
    description: 'Hỗn hợp 4 phép tính ở mức cao nhất! (Tối đa 4 chữ số)',
    icon: '🎯',
    color: 'from-fuchsia-400 to-purple-600',
    bgImage: '/images/zones/mixed-peak.jpg',
    levels: [15, 16, 17],
    lessonIds: [[4], [4], [4]],
    stageRange: [128, 134],
    totalBoss: 4,
    // Thêm theme và floating objects
    theme: 'elements',
    floatingObjects: ['🔥', '💧', '🌍', '💨', '⭐'],
    bgGradient: 'linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)',
    victoryEffect: 'elements-unite',
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
    stageRange: [135, 138],
    totalBoss: 3,
    hasCertificate: true,
    certificateType: 'complete',
    // Thêm theme và floating objects
    theme: 'supreme',
    floatingObjects: ['👑', '🏆', '💎', '⚜️', '🌟'],
    bgGradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFD700 50%, #FF6F00 100%)',
    victoryEffect: 'supreme-finale',
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
 * 🚀 TỐI ƯU: Single-pass scan qua GAME_STAGES_MULDIV
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
  for (const stage of GAME_STAGES_MULDIV) {
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
      minDifficulty: competeMinDifficulty === 999 ? 3 : competeMinDifficulty,
      minCorrect: competeMinCorrect || 7
    },
    totalLessons,
    totalBosses
  };
}

/**
 * 👑 CHỨNG CHỈ TOÀN DIỆN - Tự động từ game config
 */
export const CERT_REQUIREMENTS_COMPLETE = (() => {
  // 🚀 Single-pass: 1 lần duyệt thay vì 5 lần
  const certData = generateCertDataFromStages();
  const { lessons: lessonData, practice: practiceData, compete: competeData, totalLessons, totalBosses } = certData;
  
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
