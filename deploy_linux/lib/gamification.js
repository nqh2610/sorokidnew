/**
 * 🎮 Hệ thống Game hóa SoroKids
 * 
 * HỆ THỐNG LEVEL VÔ HẠN - Dựa trên tổng số SAO ⭐
 * 
 * Công thức: starsRequired(level) = 100 × level + 50 × (level - 1)
 * 
 * Các cấp bậc:
 * - Level 1-3: Nhập Môn (Hạt Giống → Mầm Non → Cây Con)
 * - Level 4-6: Luyện Hạt (Tập Gạt → Quen Hạt → Thạo Hạt)
 * - Level 7-9: Tay Nhanh (Nhanh Tay → Tia Chớp → Siêu Tốc)
 * - Level 10-14: Thợ Tính (Học Việc → Tay Nghề → Lành Nghề → Giỏi → Thợ Cả)
 * - Level 15-19: Cao Thủ (1-5 sao)
 * - Level 20-29: Siêu Tính (1-10 sao)
 * - Level 30-39: Thần Tính (1-10 sao)
 * - Level 40-49: Kỳ Tài (1-10 sao)
 * - Level 50-69: Thần Đồng (1-20 sao)
 * - Level 70-89: Thiên Tài (1-20 sao)
 * - Level 90-99: Kỳ Nhân (1-10 sao)
 * - Level 100+: Đại Tông Sư (1+ sao, vô hạn)
 */

// Cấu hình các TIER (cấp bậc) với translation keys cho từng level
// nameKeys dùng để lookup trong dictionary: t('levelNames.seed'), t('levelNames.sprout')...
export const LEVEL_TIERS = [
  // NHẬP MÔN (Level 1-3) - Tên riêng
  { minLevel: 1, maxLevel: 3, tier: 'beginner', tierKey: 'beginner', icon: '🌱', color: '#A8E6CF',
    nameKeys: ['seed', 'sprout', 'sapling'] },
  
  // LUYỆN HẠT (Level 4-6) - Tên riêng
  { minLevel: 4, maxLevel: 6, tier: 'trainee', tierKey: 'trainee', icon: '🔵', color: '#88D8B0',
    nameKeys: ['practice', 'familiar', 'skilled'] },
  
  // TAY NHANH (Level 7-9) - Tên riêng
  { minLevel: 7, maxLevel: 9, tier: 'quickHand', tierKey: 'quickHand', icon: '⚡', color: '#FFD93D',
    nameKeys: ['quickHand', 'lightning', 'superSpeed'] },
  
  // THỢ TÍNH (Level 10-14) - Tên riêng
  { minLevel: 10, maxLevel: 14, tier: 'calculator', tierKey: 'calculator', icon: '🧮', color: '#6BCB77',
    nameKeys: ['apprentice', 'journeyman', 'craftsman', 'expert', 'master'] },
  
  // CAO THỦ (Level 15-19) - X sao
  { minLevel: 15, maxLevel: 19, tier: 'expert', tierKey: 'expert', icon: '💪', color: '#FF6B6B',
    baseNameKey: 'expert' },
  
  // SIÊU TÍNH (Level 20-29) - X sao
  { minLevel: 20, maxLevel: 29, tier: 'superCalc', tierKey: 'superCalc', icon: '🚀', color: '#4ECDC4',
    baseNameKey: 'superCalc' },
  
  // THẦN TÍNH (Level 30-39) - X sao
  { minLevel: 30, maxLevel: 39, tier: 'godCalc', tierKey: 'godCalc', icon: '🔥', color: '#FF8C42',
    baseNameKey: 'godCalc' },
  
  // KỲ TÀI (Level 40-49) - X sao
  { minLevel: 40, maxLevel: 49, tier: 'prodigy', tierKey: 'prodigy', icon: '⭐', color: '#FFE66D',
    baseNameKey: 'prodigy' },
  
  // THẦN ĐỒNG (Level 50-69) - X sao
  { minLevel: 50, maxLevel: 69, tier: 'genius', tierKey: 'genius', icon: '🌟', color: '#A855F7',
    baseNameKey: 'genius' },
  
  // THIÊN TÀI (Level 70-89) - X sao
  { minLevel: 70, maxLevel: 89, tier: 'brilliant', tierKey: 'brilliant', icon: '💫', color: '#EC4899',
    baseNameKey: 'brilliant' },
  
  // KỲ NHÂN (Level 90-99) - X sao
  { minLevel: 90, maxLevel: 99, tier: 'exceptional', tierKey: 'exceptional', icon: '👑', color: '#F59E0B',
    baseNameKey: 'exceptional' },
  
  // ĐẠI TÔNG SƯ (Level 100+) - X sao, vô hạn
  { minLevel: 100, maxLevel: Infinity, tier: 'grandMaster', tierKey: 'grandMaster', icon: '🏆', color: '#EF4444',
    baseNameKey: 'grandMaster' },
];

// Tier colors cho badge (dùng tierKey mới)
export const TIER_COLORS = {
  beginner: { bg: 'from-green-500 to-emerald-600', border: 'border-green-400', text: 'text-green-600' },
  trainee: { bg: 'from-teal-500 to-teal-700', border: 'border-teal-400', text: 'text-teal-600' },
  quickHand: { bg: 'from-amber-500 to-orange-600', border: 'border-yellow-400', text: 'text-yellow-600' },
  calculator: { bg: 'from-emerald-500 to-green-700', border: 'border-emerald-400', text: 'text-emerald-600' },
  expert: { bg: 'from-red-500 to-red-700', border: 'border-red-400', text: 'text-red-600' },
  superCalc: { bg: 'from-cyan-500 to-teal-700', border: 'border-cyan-400', text: 'text-cyan-600' },
  godCalc: { bg: 'from-orange-500 to-red-600', border: 'border-orange-400', text: 'text-orange-600' },
  prodigy: { bg: 'from-amber-500 to-orange-600', border: 'border-yellow-400', text: 'text-yellow-600' },
  genius: { bg: 'from-purple-500 to-purple-700', border: 'border-purple-400', text: 'text-purple-600' },
  brilliant: { bg: 'from-pink-500 to-pink-700', border: 'border-pink-400', text: 'text-pink-600' },
  exceptional: { bg: 'from-amber-500 to-orange-600', border: 'border-amber-400', text: 'text-amber-600' },
  grandMaster: { bg: 'from-red-600 to-rose-700', border: 'border-red-500', text: 'text-red-600' },
};

/**
 * Tính số sao cần để đạt level
 * Công thức: starsRequired = 100 × level + 50 × (level - 1)
 * @param {number} level - Level cần tính
 * @returns {number} Số sao cần
 */
export function getStarsRequiredForLevel(level) {
  if (level <= 1) return 0;
  return 100 * level + 50 * (level - 1);
}

/**
 * Tính level từ tổng số sao
 * @param {number} totalStars - Tổng số sao
 * @returns {number} Level hiện tại
 */
export function calculateLevelFromStars(totalStars) {
  if (totalStars <= 0) return 1;
  
  // Giải phương trình: 100*level + 50*(level-1) = totalStars
  // => 150*level - 50 = totalStars
  // => level = (totalStars + 50) / 150
  let level = Math.floor((totalStars + 50) / 150);
  
  // Kiểm tra lại để đảm bảo chính xác
  while (getStarsRequiredForLevel(level + 1) <= totalStars) {
    level++;
  }
  while (level > 1 && getStarsRequiredForLevel(level) > totalStars) {
    level--;
  }
  
  return Math.max(1, level);
}

/**
 * Lấy thông tin tier từ level
 * @param {number} level - Level hiện tại
 * @returns {Object} Thông tin tier
 */
function getTierInfo(level) {
  for (const tier of LEVEL_TIERS) {
    if (level >= tier.minLevel && level <= tier.maxLevel) {
      return tier;
    }
  }
  // Mặc định trả về tier cao nhất (Đại Tông Sư)
  return LEVEL_TIERS[LEVEL_TIERS.length - 1];
}

/**
 * Lấy thông tin tên level (trả về keys để dịch)
 * @param {number} level - Level hiện tại
 * @returns {Object} { nameKey, starNum, icon, tier, tierKey }
 */
function getLevelName(level) {
  const tierInfo = getTierInfo(level);
  
  // Nếu tier có danh sách nameKeys riêng (level 1-14)
  if (tierInfo.nameKeys) {
    const index = level - tierInfo.minLevel;
    return {
      nameKey: tierInfo.nameKeys[index] || tierInfo.nameKeys[tierInfo.nameKeys.length - 1],
      starNum: null, // Không dùng sao cho tier này
      icon: tierInfo.icon,
      tier: tierInfo.tier,
      tierKey: tierInfo.tierKey,
      color: tierInfo.color
    };
  }
  
  // Nếu tier dùng "X sao" (level 15+)
  const starNum = level - tierInfo.minLevel + 1;
  return {
    nameKey: tierInfo.baseNameKey, // Key để dịch tên tier
    starNum: starNum, // Số sao (để hiển thị "Expert 5 stars")
    icon: tierInfo.icon,
    tier: tierInfo.tier,
    tierKey: tierInfo.tierKey,
    color: tierInfo.color
  };
}

/**
 * Lấy thông tin level từ tổng số SAO ⭐
 * @param {number} totalStars - Tổng số sao
 * @returns {Object} Thông tin level
 */
export function getLevelInfo(totalStars) {
  const level = calculateLevelFromStars(totalStars || 0);
  const levelName = getLevelName(level);
  const tierInfo = getTierInfo(level);
  
  // Tính sao cần cho level hiện tại và level tiếp theo
  const currentLevelStars = getStarsRequiredForLevel(level);
  const nextLevelStars = getStarsRequiredForLevel(level + 1);
  
  // Tính progress đến level tiếp theo
  const starsInCurrentLevel = totalStars - currentLevelStars;
  const starsNeededForNext = nextLevelStars - currentLevelStars;
  const progressPercent = Math.min(100, (starsInCurrentLevel / starsNeededForNext) * 100);
  
  return {
    level,
    nameKey: levelName.nameKey, // Translation key for level name
    starNum: levelName.starNum, // Star number for "X stars" tiers, null for named tiers
    tierKey: levelName.tierKey, // Translation key for tier name
    icon: levelName.icon,
    tier: levelName.tier,
    color: levelName.color,
    totalStars: totalStars || 0,
    currentLevelStars: starsInCurrentLevel,
    starsToNextLevel: starsNeededForNext,
    starsNeededForNext: nextLevelStars - totalStars,
    progressPercent: Math.round(progressPercent * 10) / 10,
    nextLevelStars,
    isMaxLevel: false, // Không bao giờ max vì level vô hạn
    tierColor: TIER_COLORS[tierInfo.tier] || TIER_COLORS.beginner
  };
}

/**
 * 🌍 Dịch tên level từ levelInfo
 * @param {Object} levelInfo - Object từ getLevelInfo()
 * @param {Function} t - Translation function (từ useI18n hoặc dictionary)
 * @param {string} prefix - Prefix cho translation key (default: 'dashboard')
 * @returns {string} Tên level đã dịch
 * 
 * @example
 * const name = translateLevelName(levelInfo, t); // "Super Calculator 8 stars" hoặc "Seed"
 */
export function translateLevelName(levelInfo, t, prefix = 'dashboard') {
  if (!levelInfo) return '';
  
  // Nếu có starNum thì là tier dùng "X sao/stars" (level 15+)
  if (levelInfo.starNum) {
    const tierKey = `${prefix}.tiers.${levelInfo.tierKey}`;
    const tierName = t(tierKey);
    // Nếu t() trả về key thì dùng tierKey làm fallback
    const displayTier = tierName === tierKey ? levelInfo.tierKey : tierName;
    
    const starKey = `${prefix}.starSuffix`;
    const starText = t(starKey, { count: levelInfo.starNum });
    // Nếu t() trả về key thì format fallback
    const displayStars = starText === starKey ? `${levelInfo.starNum} ⭐` : starText;
    
    return `${displayTier} ${displayStars}`;
  }
  
  // Nếu không có starNum thì dùng nameKey (level 1-14)
  const nameKey = `${prefix}.levelNames.${levelInfo.nameKey}`;
  const translated = t(nameKey);
  // Nếu t() trả về key thì dùng nameKey làm fallback
  return translated === nameKey ? (levelInfo.nameKey || '') : translated;
}

/**
 * Tính SAO ⭐ từ bài học
 * Công thức: Base + Accuracy + Speed + Diligence + Streak
 * @param {number} starsEarned - Số sao đạt được trong bài (0-3)
 * @param {number} accuracy - Độ chính xác (0-100)
 * @param {number} timeSpent - Thời gian làm bài (giây)
 * @param {number} standardTime - Thời gian chuẩn (giây)
 * @param {number} streak - Số ngày học liên tục
 * @param {number} attemptCount - Số lần làm bài này (cho bonus chăm chỉ)
 * @returns {Object} Chi tiết SAO kiếm được
 */
export function calculateLessonStars(starsEarned, accuracy, timeSpent, standardTime, streak, attemptCount = 1) {
  // 🎯 BASE: Hoàn thành bài = 20 sao
  const baseStars = 20;
  
  // 🎯 ACCURACY BONUS: Độ chính xác
  let accuracyBonus = 0;
  if (accuracy >= 100) accuracyBonus = 25;      // Perfect!
  else if (accuracy >= 90) accuracyBonus = 15;
  else if (accuracy >= 70) accuracyBonus = 10;
  else if (accuracy >= 50) accuracyBonus = 5;
  
  // ⚡ SPEED BONUS: Tốc độ (so với thời gian chuẩn)
  let speedBonus = 0;
  const timeRatio = standardTime > 0 ? timeSpent / standardTime : 1;
  if (timeRatio < 0.5) speedBonus = 25;         // Siêu nhanh! < 50%
  else if (timeRatio < 0.7) speedBonus = 15;    // Nhanh < 70%
  else if (timeRatio < 1.0) speedBonus = 10;    // Tốt < 100%
  else if (timeRatio < 1.5) speedBonus = 5;     // Ổn < 150%
  
  // 💪 DILIGENCE BONUS: Chăm chỉ (làm lại)
  let diligenceBonus = 0;
  if (attemptCount >= 3) diligenceBonus = 10;   // Làm lại 3+ lần
  else if (attemptCount >= 2) diligenceBonus = 5; // Làm lại 2 lần
  
  // 🔥 STREAK BONUS: Học liên tục
  let streakBonus = 0;
  if (streak >= 30) streakBonus = 25;           // 30 ngày
  else if (streak >= 14) streakBonus = 15;      // 14 ngày
  else if (streak >= 7) streakBonus = 10;       // 7 ngày
  else if (streak >= 3) streakBonus = 5;        // 3 ngày
  
  // ⭐ STAR BONUS: Số sao đạt được trong bài (0-3)
  const starBonus = starsEarned * 5; // Mỗi sao +5
  
  const totalStars = baseStars + accuracyBonus + speedBonus + diligenceBonus + streakBonus + starBonus;
  
  return {
    baseStars,
    accuracyBonus,
    speedBonus,
    diligenceBonus,
    streakBonus,
    starBonus,
    totalStars,
    breakdown: [
      { label: 'Hoàn thành', value: baseStars, icon: '✅' },
      ...(starBonus > 0 ? [{ label: `${starsEarned} sao bài học`, value: starBonus, icon: '⭐' }] : []),
      ...(accuracyBonus > 0 ? [{ label: `Chính xác ${Math.round(accuracy)}%`, value: accuracyBonus, icon: '🎯' }] : []),
      ...(speedBonus > 0 ? [{ label: timeRatio < 0.5 ? 'Siêu nhanh!' : 'Nhanh', value: speedBonus, icon: '⚡' }] : []),
      ...(diligenceBonus > 0 ? [{ label: `Chăm chỉ (lần ${attemptCount})`, value: diligenceBonus, icon: '💪' }] : []),
      ...(streakBonus > 0 ? [{ label: `Chăm chỉ ${streak} ngày`, value: streakBonus, icon: '🔥' }] : []),
    ]
  };
}

/**
 * Tính SAO ⭐ từ luyện tập
 * Công thức: (CorrectAnswers × Difficulty × SpeedMultiplier) + Combo + Completion
 * @param {number} correctAnswers - Số câu đúng
 * @param {number} totalQuestions - Tổng số câu
 * @param {number} difficulty - Độ khó (1-5)
 * @param {number} avgTimePerQuestion - Thời gian trung bình/câu (giây)
 * @param {number} maxCombo - Combo cao nhất (đúng liên tiếp)
 * @returns {Object} Chi tiết SAO kiếm được
 */
export function calculatePracticeStars(correctAnswers, totalQuestions, difficulty, avgTimePerQuestion, maxCombo = 0) {
  // � Nếu không đúng câu nào -> 0 sao (tránh lạm dụng skip)
  if (correctAnswers === 0) {
    return {
      baseStars: 0,
      speedStars: 0,
      speedMultiplier: 1.0,
      comboBonus: 0,
      completionBonus: 0,
      accuracyBonus: 0,
      totalStars: 0,
      accuracy: 0,
      breakdown: [
        { label: 'Chưa trả lời đúng câu nào', value: 0, icon: '📚' },
      ]
    };
  }

  // 📊 BASE: Mỗi câu đúng × độ khó
  const starsPerCorrect = 1 + difficulty; // Độ khó 1 = 2 sao/câu, độ khó 5 = 6 sao/câu
  let baseStars = correctAnswers * starsPerCorrect;
  
  // ⚡ SPEED MULTIPLIER: Tốc độ
  let speedMultiplier = 1.0;
  if (avgTimePerQuestion < 3) speedMultiplier = 2.0;       // Flash! < 3s
  else if (avgTimePerQuestion < 5) speedMultiplier = 1.5;  // Nhanh < 5s
  else if (avgTimePerQuestion < 8) speedMultiplier = 1.2;  // Tốt < 8s
  // > 8s = ×1.0 (bình thường)
  
  const speedStars = Math.round(baseStars * (speedMultiplier - 1)); // Bonus từ tốc độ
  
  // 🔥 COMBO BONUS: Đúng liên tiếp
  let comboBonus = 0;
  if (maxCombo >= 20) comboBonus = 100;        // Perfect streak!
  else if (maxCombo >= 15) comboBonus = 50;
  else if (maxCombo >= 10) comboBonus = 25;
  else if (maxCombo >= 5) comboBonus = 10;
  
  // 💪 COMPLETION BONUS: Hoàn thành session (chỉ khi có ít nhất 1 câu đúng)
  const completionBonus = totalQuestions >= 10 ? 15 : (totalQuestions >= 5 ? 10 : 5);
  
  // 🎯 ACCURACY BONUS
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  let accuracyBonus = 0;
  if (accuracy >= 100) accuracyBonus = 30;     // Perfect!
  else if (accuracy >= 90) accuracyBonus = 20;
  else if (accuracy >= 80) accuracyBonus = 10;
  
  const totalStars = baseStars + speedStars + comboBonus + completionBonus + accuracyBonus;
  
  return {
    baseStars,
    speedStars,
    speedMultiplier,
    comboBonus,
    completionBonus,
    accuracyBonus,
    totalStars,
    accuracy: Math.round(accuracy),
    breakdown: [
      { label: `${correctAnswers} câu đúng ×${starsPerCorrect}`, value: baseStars, icon: '✅' },
      ...(speedStars > 0 ? [{ label: `Tốc độ ×${speedMultiplier}`, value: speedStars, icon: '⚡' }] : []),
      ...(accuracyBonus > 0 ? [{ label: `Chính xác ${Math.round(accuracy)}%`, value: accuracyBonus, icon: '🎯' }] : []),
      ...(comboBonus > 0 ? [{ label: `Combo ${maxCombo}!`, value: comboBonus, icon: '🔥' }] : []),
      { label: 'Hoàn thành', value: completionBonus, icon: '💪' },
    ]
  };
}

/**
 * Tính SAO ⭐ từ thi đấu
 * Công thức: Base × ArenaDifficulty + Accuracy + Speed + Rank
 * @param {number} arenaDifficulty - Độ khó arena (1-4)
 * @param {number} correctAnswers - Số câu đúng
 * @param {number} totalQuestions - Tổng số câu
 * @param {number} avgTimePerQuestion - Thời gian trung bình/câu (giây)
 * @param {number} rank - Thứ hạng (1 = top 1, 0 = chưa xếp hạng)
 * @param {boolean} isImprovement - Có cải thiện kỷ lục không
 * @returns {Object} Chi tiết SAO kiếm được
 */
export function calculateCompeteStars(arenaDifficulty, correctAnswers, totalQuestions, avgTimePerQuestion, rank = 0, isImprovement = false) {
  // 🚫 Nếu không đúng câu nào -> 0 sao (tránh lạm dụng skip)
  if (correctAnswers === 0) {
    return {
      baseStars: 0,
      correctBonus: 0,
      accuracyBonus: 0,
      speedBonus: 0,
      rankBonus: 0,
      improvementBonus: 0,
      totalStars: 0,
      accuracy: 0,
      breakdown: [
        { label: 'Chưa trả lời đúng câu nào', value: 0, icon: '📚' },
      ]
    };
  }

  // 🎮 BASE: Tham gia arena × độ khó
  const baseMultiplier = [1, 1.5, 2, 3][Math.min(arenaDifficulty - 1, 3)]; // ★=1, ★★=1.5, ★★★=2, ★★★★=3
  const baseStars = Math.round(10 * baseMultiplier);
  
  // 🎯 ACCURACY BONUS
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  let accuracyBonus = 0;
  if (accuracy >= 100) accuracyBonus = 50;     // Perfect!
  else if (accuracy >= 90) accuracyBonus = 35;
  else if (accuracy >= 70) accuracyBonus = 20;
  else if (accuracy >= 50) accuracyBonus = 10;
  
  // ⚡ SPEED BONUS
  let speedBonus = 0;
  if (avgTimePerQuestion < 3) speedBonus = 50;        // Flash!
  else if (avgTimePerQuestion < 5) speedBonus = 30;
  else if (avgTimePerQuestion < 8) speedBonus = 10;
  
  // 🏆 RANK BONUS
  let rankBonus = 0;
  if (rank === 1) rankBonus = 100;             // Top 1
  else if (rank <= 3) rankBonus = 60;          // Top 2-3
  else if (rank <= 10) rankBonus = 30;         // Top 4-10
  else if (rank <= 50) rankBonus = 15;         // Top 11-50
  else if (rank > 0) rankBonus = 5;            // Có xếp hạng
  
  // 📈 IMPROVEMENT BONUS: Cải thiện kỷ lục
  const improvementBonus = isImprovement ? 20 : 0;
  
  // ✅ CORRECT BONUS: Mỗi câu đúng
  const correctBonus = correctAnswers * Math.round(2 * baseMultiplier);
  
  const totalStars = baseStars + correctBonus + accuracyBonus + speedBonus + rankBonus + improvementBonus;
  
  return {
    baseStars,
    correctBonus,
    accuracyBonus,
    speedBonus,
    rankBonus,
    improvementBonus,
    totalStars,
    accuracy: Math.round(accuracy),
    breakdown: [
      { label: `Arena ${['★', '★★', '★★★', '★★★★'][Math.min(arenaDifficulty - 1, 3)]}`, value: baseStars, icon: '🎮' },
      { label: `${correctAnswers} câu đúng`, value: correctBonus, icon: '✅' },
      ...(accuracyBonus > 0 ? [{ label: `Chính xác ${Math.round(accuracy)}%`, value: accuracyBonus, icon: '🎯' }] : []),
      ...(speedBonus > 0 ? [{ label: 'Tốc độ cao', value: speedBonus, icon: '⚡' }] : []),
      ...(rankBonus > 0 ? [{ label: `Top ${rank}`, value: rankBonus, icon: '🏆' }] : []),
      ...(improvementBonus > 0 ? [{ label: 'Phá kỷ lục!', value: improvementBonus, icon: '📈' }] : []),
    ]
  };
}

/**
 * Kiểm tra có lên level không
 * @param {number} oldStars - Tổng sao cũ
 * @param {number} newStars - Tổng sao mới
 * @returns {Object|null} Thông tin level up hoặc null
 */
export function checkLevelUp(oldStars, newStars) {
  const oldLevel = getLevelInfo(oldStars);
  const newLevel = getLevelInfo(newStars);
  
  if (newLevel.level > oldLevel.level) {
    return {
      oldLevel: oldLevel,
      newLevel: newLevel,
      levelsGained: newLevel.level - oldLevel.level
    };
  }
  
  return null;
}
