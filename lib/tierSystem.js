/**
 * Tier System - Hệ thống phân cấp người dùng
 * Free: Giới hạn 5 bài học đầu tiên
 * Premium: Truy cập tất cả bài học
 * VIP: Premium + Không quảng cáo + Ưu tiên hỗ trợ
 */

// Cấu hình các tier
export const TIERS = {
  free: {
    name: 'free',
    displayName: 'Miễn phí',
    price: 0,
    maxLessons: 5,
    maxLevels: 2,
    features: [
      '5 bài học miễn phí',
      'Luyện tập cơ bản',
      'Bảng xếp hạng',
      'Nhiệm vụ hằng ngày'
    ],
    color: 'from-gray-400 to-gray-500',
    icon: '🆓',
    badge: 'bg-gray-100 text-gray-700'
  },
  premium: {
    name: 'premium',
    displayName: 'Premium',
    price: 99000,
    maxLessons: -1, // unlimited
    maxLevels: -1,
    features: [
      'Tất cả bài học',
      'Luyện tập nâng cao',
      'Bảng xếp hạng',
      'Nhiệm vụ hằng ngày',
      'Chứng chỉ hoàn thành',
      'Không giới hạn level'
    ],
    color: 'from-purple-500 to-pink-500',
    icon: '⭐',
    badge: 'bg-purple-100 text-purple-700'
  },
  vip: {
    name: 'vip',
    displayName: 'VIP',
    price: 199000,
    maxLessons: -1,
    maxLevels: -1,
    features: [
      'Tất cả tính năng Premium',
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
  premium: {
    '1_month': { duration: 30, price: 99000, originalPrice: 99000, discount: 0 },
    '3_months': { duration: 90, price: 249000, originalPrice: 297000, discount: 16 },
    '6_months': { duration: 180, price: 449000, originalPrice: 594000, discount: 24 },
    '1_year': { duration: 365, price: 799000, originalPrice: 1188000, discount: 33 }
  },
  vip: {
    '1_month': { duration: 30, price: 199000, originalPrice: 199000, discount: 0 },
    '3_months': { duration: 90, price: 499000, originalPrice: 597000, discount: 16 },
    '6_months': { duration: 180, price: 899000, originalPrice: 1194000, discount: 25 },
    '1_year': { duration: 365, price: 1499000, originalPrice: 2388000, discount: 37 }
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
  const order = { free: 0, premium: 1, vip: 2 };
  return (order[tier1] || 0) - (order[tier2] || 0);
}

/**
 * Kiểm tra có nên hiển thị upgrade banner không
 */
export function shouldShowUpgradeBanner(userTier, lessonOrder) {
  if (userTier !== 'free') return false;
  // Hiển thị khi user đạt đến giới hạn
  return lessonOrder >= TIERS.free.maxLessons;
}

export default {
  TIERS,
  PRICING,
  getTierInfo,
  canAccessLesson,
  canAccessLevel,
  isTierExpired,
  getCurrentTier,
  formatPrice,
  getDaysRemaining,
  compareTiers,
  shouldShowUpgradeBanner
};
