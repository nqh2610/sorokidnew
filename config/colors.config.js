/**
 * 🎨 UNIFIED COLOR SCHEME
 * 
 * Hệ thống màu sắc thống nhất cho SoroKid
 * Dựa trên Tier System: Bronze → Silver → Gold → Diamond
 * 
 * Usage:
 * import { COLORS, getTierColors, getLevelColor } from '@/config/colors.config';
 * 
 * const colors = getTierColors('gold');
 * // { primary, secondary, accent, gradient, text, bg }
 */

// ============================================
// 🏆 TIER COLORS - Màu theo cấp bậc
// ============================================
export const TIER_COLORS = {
  // 🥉 Bronze - Người mới (Level 1-4)
  bronze: {
    name: 'Bronze',
    emoji: '🥉',
    primary: '#CD7F32',
    secondary: '#B87333',
    accent: '#A0522D',
    light: '#E6C9A8',
    gradient: 'from-amber-600 to-orange-700',
    gradientLight: 'from-amber-100 to-orange-100',
    text: 'text-amber-700',
    textLight: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    ring: 'ring-amber-400',
    shadow: 'shadow-amber-200',
  },
  
  // 🥈 Silver - Trung cấp (Level 5-8)
  silver: {
    name: 'Silver',
    emoji: '🥈',
    primary: '#C0C0C0',
    secondary: '#A8A8A8',
    accent: '#808080',
    light: '#E8E8E8',
    gradient: 'from-gray-400 to-slate-500',
    gradientLight: 'from-gray-100 to-slate-100',
    text: 'text-slate-600',
    textLight: 'text-slate-400',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    ring: 'ring-slate-400',
    shadow: 'shadow-slate-200',
  },
  
  // 🥇 Gold - Cao cấp (Level 9-12)
  gold: {
    name: 'Gold',
    emoji: '🥇',
    primary: '#FFD700',
    secondary: '#FFC107',
    accent: '#FF9800',
    light: '#FFF8DC',
    gradient: 'from-yellow-400 to-amber-500',
    gradientLight: 'from-yellow-50 to-amber-50',
    text: 'text-yellow-700',
    textLight: 'text-yellow-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    ring: 'ring-yellow-400',
    shadow: 'shadow-yellow-200',
  },
  
  // 💎 Diamond - Bậc thầy (Level 13-18)
  diamond: {
    name: 'Diamond',
    emoji: '💎',
    primary: '#B9F2FF',
    secondary: '#89CFF0',
    accent: '#5DADE2',
    light: '#E0F7FF',
    gradient: 'from-cyan-400 to-blue-500',
    gradientLight: 'from-cyan-50 to-blue-50',
    text: 'text-cyan-700',
    textLight: 'text-cyan-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    ring: 'ring-cyan-400',
    shadow: 'shadow-cyan-200',
  },
};

// ============================================
// 🎮 GAME MODE COLORS - Màu theo chế độ
// ============================================
export const MODE_COLORS = {
  // Phép tính cơ bản
  addition: {
    name: 'Phép Cộng',
    emoji: '➕',
    gradient: 'from-emerald-500 to-green-600',
    gradientLight: 'from-emerald-50 to-green-50',
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  subtraction: {
    name: 'Phép Trừ',
    emoji: '➖',
    gradient: 'from-blue-500 to-cyan-600',
    gradientLight: 'from-blue-50 to-cyan-50',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  multiplication: {
    name: 'Phép Nhân',
    emoji: '✖️',
    gradient: 'from-purple-500 to-pink-600',
    gradientLight: 'from-purple-50 to-pink-50',
    text: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  division: {
    name: 'Phép Chia',
    emoji: '➗',
    gradient: 'from-rose-500 to-red-600',
    gradientLight: 'from-rose-50 to-red-50',
    text: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  
  // Chế độ đặc biệt
  mental: {
    name: 'Mental Math',
    emoji: '🧠',
    gradient: 'from-violet-500 to-fuchsia-600',
    gradientLight: 'from-violet-50 to-fuchsia-50',
    text: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
  },
  flash: {
    name: 'Flash Anzan',
    emoji: '⚡',
    gradient: 'from-yellow-500 to-orange-600',
    gradientLight: 'from-yellow-50 to-orange-50',
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  compete: {
    name: 'Thi Đấu',
    emoji: '🏆',
    gradient: 'from-pink-500 to-rose-600',
    gradientLight: 'from-pink-50 to-rose-50',
    text: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
  },
};

// ============================================
// 📊 FEEDBACK COLORS - Màu phản hồi
// ============================================
export const FEEDBACK_COLORS = {
  correct: {
    gradient: 'from-green-400 to-emerald-500',
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    flash: 'bg-green-500/20',
  },
  wrong: {
    gradient: 'from-red-400 to-rose-500',
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    flash: 'bg-red-500/20',
  },
  warning: {
    gradient: 'from-yellow-400 to-orange-500',
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
    flash: 'bg-yellow-500/20',
  },
  info: {
    gradient: 'from-blue-400 to-cyan-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    flash: 'bg-blue-500/20',
  },
};

// ============================================
// 🌈 BRAND COLORS - Màu thương hiệu
// ============================================
export const BRAND_COLORS = {
  primary: {
    gradient: 'from-purple-500 to-pink-500',
    text: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  secondary: {
    gradient: 'from-blue-500 to-violet-500',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  accent: {
    gradient: 'from-pink-500 to-rose-500',
    text: 'text-pink-600',
    bg: 'bg-pink-50',
  },
};

// ============================================
// 🛠️ HELPER FUNCTIONS
// ============================================

/**
 * Lấy tier từ level
 */
export function getTierFromLevel(level) {
  if (level <= 4) return 'bronze';
  if (level <= 8) return 'silver';
  if (level <= 12) return 'gold';
  return 'diamond';
}

/**
 * Lấy màu của tier
 */
export function getTierColors(tier) {
  return TIER_COLORS[tier] || TIER_COLORS.bronze;
}

/**
 * Lấy màu từ level
 */
export function getLevelColors(level) {
  const tier = getTierFromLevel(level);
  return getTierColors(tier);
}

/**
 * Lấy màu mode
 */
export function getModeColors(mode) {
  return MODE_COLORS[mode] || MODE_COLORS.addition;
}

/**
 * Tạo gradient class string
 */
export function gradientClass(colors, direction = 'r') {
  return `bg-gradient-to-${direction} ${colors.gradient}`;
}

// Default export
const colorsConfig = {
  TIER_COLORS,
  MODE_COLORS,
  FEEDBACK_COLORS,
  BRAND_COLORS,
  getTierFromLevel,
  getTierColors,
  getLevelColors,
  getModeColors,
  gradientClass,
};

export default colorsConfig;
