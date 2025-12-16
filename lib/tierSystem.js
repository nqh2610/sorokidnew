/**
 * Tier System - Hệ thống phân cấp người dùng
 * Free: Level 1-5, Cấp độ 1-2 (Cộng Trừ cơ bản)
 * Basic: Level 1-10, Cấp độ 1-3 (Cộng Trừ nâng cao, Cộng Trừ Mix)
 * Advanced: Level 1-18, Tất cả cấp độ (Nhân Chia, Tứ Phép, Tính nhẩm, Flash Anzan)
 * VIP: Advanced + Không quảng cáo + Ưu tiên hỗ trợ
 */

// Cấu hình các tier
export const TIERS = {
  free: {
    name: 'free',
    displayName: 'Miễn phí',
    price: 0,
    maxLessons: -1, // unlimited lessons in allowed levels
    maxLevels: 5,   // Level 1-5
    maxDifficulty: 2, // Cấp độ 1-2
    features: [
      'Bài học cơ bản (Level 1-5)',
      'Luyện tập Cộng Trừ (Cấp 1-2)',
      'Thi đấu Cộng Trừ (Cấp 1-2)',
      'Bảng xếp hạng',
      'Nhiệm vụ hằng ngày'
    ],
    color: 'from-gray-400 to-gray-500',
    icon: '🆓',
    badge: 'bg-gray-100 text-gray-700'
  },
  basic: {
    name: 'basic',
    displayName: 'Cơ Bản',
    price: 199000,
    maxLessons: -1,
    maxLevels: 10,  // Level 1-10
    maxDifficulty: 3, // Cấp độ 1-3
    features: [
      'Tất cả bài học Cộng Trừ (Level 1-10)',
      'Luyện tập Cộng Trừ (Cấp 1-3)',
      'Luyện tập Cộng Trừ Mix (Cấp 1-3)',
      'Thi đấu Cộng Trừ (Cấp 1-3)',
      'Chứng nhận Sorokid Cộng Trừ',
      'Bảng xếp hạng',
      'Nhiệm vụ hằng ngày'
    ],
    color: 'from-blue-400 to-blue-600',
    icon: '⭐',
    badge: 'bg-blue-100 text-blue-700'
  },
  advanced: {
    name: 'advanced',
    displayName: 'Nâng Cao',
    price: 299000,
    maxLessons: -1,
    maxLevels: 18,  // Tất cả levels
    maxDifficulty: 5, // Tất cả cấp độ
    features: [
      'Tất cả bài học (Level 1-18)',
      'Luyện tập Nhân Chia',
      'Luyện tập Tứ Phép Tính',
      'Siêu Trí Tuệ (Tính nhẩm)',
      'Tia Chớp (Flash Anzan)',
      'Tất cả cấp độ',
      'Chứng nhận Sorokid Toàn diện',
      'Bảng xếp hạng',
      'Nhiệm vụ hằng ngày'
    ],
    color: 'from-purple-500 to-pink-500',
    icon: '💎',
    badge: 'bg-purple-100 text-purple-700'
  },
  vip: {
    name: 'vip',
    displayName: 'VIP',
    price: 499000,
    maxLessons: -1,
    maxLevels: 18,
    maxDifficulty: 5,
    features: [
      'Tất cả tính năng Nâng Cao',
      'Không quảng cáo',
      'Ưu tiên hỗ trợ',
      'Badge VIP đặc biệt',
      'Truy cập sớm tính năng mới'
    ],
    color: 'from-amber-400 to-orange-500',
    icon: '👑',
    badge: 'bg-amber-100 text-amber-700'
  }
};

// Giá theo thời gian
export const PRICING = {
  basic: {
    '1_month': { duration: 30, price: 199000, originalPrice: 199000, discount: 0 },
    '3_months': { duration: 90, price: 499000, originalPrice: 597000, discount: 16 },
    '6_months': { duration: 180, price: 899000, originalPrice: 1194000, discount: 25 },
    '1_year': { duration: 365, price: 1499000, originalPrice: 2388000, discount: 37 }
  },
  advanced: {
    '1_month': { duration: 30, price: 299000, originalPrice: 299000, discount: 0 },
    '3_months': { duration: 90, price: 749000, originalPrice: 897000, discount: 16 },
    '6_months': { duration: 180, price: 1349000, originalPrice: 1794000, discount: 25 },
    '1_year': { duration: 365, price: 2249000, originalPrice: 3588000, discount: 37 }
  },
  vip: {
    '1_month': { duration: 30, price: 499000, originalPrice: 499000, discount: 0 },
    '3_months': { duration: 90, price: 1249000, originalPrice: 1497000, discount: 16 },
    '6_months': { duration: 180, price: 2249000, originalPrice: 2994000, discount: 25 },
    '1_year': { duration: 365, price: 3749000, originalPrice: 5988000, discount: 37 }
  }
};

/**
 * Lấy thông tin tier của user
 */
export function getTierInfo(tierName = 'free') {
  return TIERS[tierName] || TIERS.free;
}

/**
 * Kiểm tra user có quyền truy cập lesson không
 */
export function canAccessLesson(userTier, lessonOrder) {
  const tier = getTierInfo(userTier);
  if (tier.maxLessons === -1) return true;
  return lessonOrder <= tier.maxLessons;
}

/**
 * Kiểm tra user có quyền truy cập level không
 */
export function canAccessLevel(userTier, levelId) {
  const tier = getTierInfo(userTier);
  if (tier.maxLevels === -1) return true;
  return levelId <= tier.maxLevels;
}

/**
 * Kiểm tra user có quyền truy cập difficulty không
 */
export function canAccessDifficulty(userTier, difficulty) {
  const tier = getTierInfo(userTier);
  if (tier.maxDifficulty === -1) return true;
  return difficulty <= tier.maxDifficulty;
}

/**
 * Lấy max difficulty cho tier
 */
export function getMaxDifficulty(userTier) {
  const tier = getTierInfo(userTier);
  return tier.maxDifficulty || 2;
}

/**
 * Lấy max level cho tier
 */
export function getMaxLevel(userTier) {
  const tier = getTierInfo(userTier);
  return tier.maxLevels || 5;
}

/**
 * Kiểm tra tier có hết hạn không
 */
export function isTierExpired(expiresAt) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

/**
 * Lấy tier hiện tại của user (đã check expiry)
 */
export function getCurrentTier(userTier, expiresAt) {
  if (userTier === 'free') return 'free';
  if (isTierExpired(expiresAt)) return 'free';
  return userTier;
}

/**
 * Format giá tiền VND
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

/**
 * Tính số ngày còn lại
 */
export function getDaysRemaining(expiresAt) {
  if (!expiresAt) return 0;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * So sánh tier (để biết tier nào cao hơn)
 */
export function compareTiers(tier1, tier2) {
  const order = { free: 0, basic: 1, advanced: 2, vip: 3 };
  return (order[tier1] || 0) - (order[tier2] || 0);
}

/**
 * Kiểm tra có nên hiển thị upgrade banner không
 */
export function shouldShowUpgradeBanner(userTier, levelId) {
  if (userTier === 'advanced' || userTier === 'vip') return false;
  // Hiển thị khi user cố truy cập level bị khóa
  const maxLevel = getMaxLevel(userTier);
  return levelId > maxLevel;
}

/**
 * Lấy required tier cho level
 */
export function getRequiredTierForLevel(levelId) {
  if (levelId <= 5) return 'free';
  if (levelId <= 10) return 'basic';
  return 'advanced';
}

/**
 * Lấy required tier cho mode
 */
export function getRequiredTierForMode(mode) {
  const modeTiers = {
    addition: 'free',
    subtraction: 'free',
    addSubMixed: 'basic',
    multiplication: 'advanced',
    division: 'advanced',
    mulDiv: 'advanced',
    mixed: 'advanced',
    mentalMath: 'advanced',
    flashAnzan: 'advanced'  // Tia Chớp chỉ mở cho gói Nâng cao
  };
  return modeTiers[mode] || 'free';
}

export default {
  TIERS,
  PRICING,
  getTierInfo,
  canAccessLesson,
  canAccessLevel,
  canAccessDifficulty,
  getMaxDifficulty,
  getMaxLevel,
  isTierExpired,
  getCurrentTier,
  formatPrice,
  getDaysRemaining,
  compareTiers,
  shouldShowUpgradeBanner,
  getRequiredTierForLevel,
  getRequiredTierForMode
};
