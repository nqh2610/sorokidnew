'use client';

import { getLevelInfo, TIER_COLORS } from '@/lib/gamification';

/**
 * Component hiển thị Level Badge
 * @param {number} totalStars - Tổng số sao (thay thế totalEXP)
 */
export default function LevelBadge({ totalStars, totalEXP, size = 'md', showProgress = true }) {
  // Hỗ trợ cả totalStars mới và totalEXP cũ (backward compatible)
  const stars = totalStars ?? totalEXP ?? 0;
  const levelInfo = getLevelInfo(stars);
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };
  
  const iconSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className="flex flex-col items-center">
      {/* Level Badge */}
      <div className={`
        relative inline-flex flex-col items-center justify-center
        px-4 py-2 rounded-2xl
        bg-gradient-to-br ${levelInfo.tierColor?.bg || 'from-green-400 to-emerald-500'}
        shadow-lg
      `}>
        <span className={iconSizes[size]}>{levelInfo.icon}</span>
        <span className={`font-bold text-white ${sizeClasses[size]}`}>
          {levelInfo.name}
        </span>
        <span className="text-xs text-white/80">Level {levelInfo.level}</span>
      </div>
      
      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full mt-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${levelInfo.tierColor?.bg || 'from-green-400 to-emerald-500'} transition-all duration-500`}
              style={{ width: `${levelInfo.progressPercent || 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{(levelInfo.currentLevelStars || 0).toLocaleString()} ⭐</span>
            <span>Cần {(levelInfo.starsNeededForNext || 0).toLocaleString()} ⭐</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Component hiển thị Level nhỏ gọn (inline)
 */
export function LevelBadgeInline({ totalStars, totalEXP }) {
  const stars = totalStars ?? totalEXP ?? 0;
  const levelInfo = getLevelInfo(stars);
  
  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
      bg-gradient-to-r ${levelInfo.tierColor?.bg || 'from-green-400 to-emerald-500'} text-white
    `}>
      <span>{levelInfo.icon}</span>
      <span>{levelInfo.name}</span>
    </span>
  );
}

/**
 * Component hiển thị SAO ⭐ earned sau bài học / luyện tập / thi đấu
 */
export function StarsEarnedCard({ starsBreakdown, totalStars, levelUp }) {
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-yellow-200">
      <h3 className="text-lg font-bold text-center text-yellow-700 mb-3">
        ⭐ Sao kiếm được
      </h3>
      
      {/* Breakdown */}
      <div className="space-y-2 mb-3">
        {starsBreakdown?.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2">
              <span>{item.icon}</span>
              <span className="text-gray-700">{item.label}</span>
            </span>
            <span className="font-bold text-yellow-600">+{item.value} ⭐</span>
          </div>
        ))}
      </div>
      
      {/* Total */}
      <div className="border-t border-yellow-300 pt-2 flex justify-between items-center">
        <span className="font-bold text-gray-800">Tổng cộng:</span>
        <span className="text-xl font-bold text-orange-600">
          +{totalStars} ⭐
        </span>
      </div>
      
      {/* Level Up Animation */}
      {levelUp && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-center animate-pulse">
          <div className="text-2xl mb-1">🎊 LÊN CẤP! 🎊</div>
          <div className="flex items-center justify-center gap-2">
            <span>{levelUp.oldLevel?.icon} {levelUp.oldLevel?.name}</span>
            <span>→</span>
            <span className="font-bold">{levelUp.newLevel?.icon} {levelUp.newLevel?.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DEPRECATED: Use StarsEarnedCard instead
 * Component hiển thị EXP earned (backward compatible)
 */
export function EXPEarnedCard({ expBreakdown, totalEXP, levelUp }) {
  return (
    <StarsEarnedCard 
      starsBreakdown={expBreakdown} 
      totalStars={totalEXP} 
      levelUp={levelUp} 
    />
  );
}
