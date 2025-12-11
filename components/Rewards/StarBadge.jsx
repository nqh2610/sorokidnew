'use client';

import { useState, useEffect } from 'react';

// Component hiển thị số sao như điểm thưởng (có thể lên đến hàng trăm, hàng nghìn)
export default function StarBadge({ 
  stars = 0, 
  size = 'md', 
  showAnimation = false,
  variant = 'default', // default, earned, header, compact
  showPlus = false // hiển thị dấu + phía trước
}) {
  const [displayStars, setDisplayStars] = useState(showAnimation ? 0 : stars);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showAnimation && stars > 0) {
      setIsAnimating(true);
      let current = 0;
      const increment = Math.max(1, Math.ceil(stars / 20));
      const interval = setInterval(() => {
        current += increment;
        if (current >= stars) {
          setDisplayStars(stars);
          clearInterval(interval);
          setTimeout(() => setIsAnimating(false), 500);
        } else {
          setDisplayStars(current);
        }
      }, 50);
      return () => clearInterval(interval);
    } else {
      setDisplayStars(stars);
    }
  }, [stars, showAnimation]);

  // Kích thước
  const sizes = {
    xs: { icon: 12, text: 'text-xs', padding: 'px-1.5 py-0.5', gap: 'gap-0.5' },
    sm: { icon: 14, text: 'text-sm', padding: 'px-2 py-1', gap: 'gap-1' },
    md: { icon: 18, text: 'text-base', padding: 'px-3 py-1.5', gap: 'gap-1.5' },
    lg: { icon: 24, text: 'text-xl', padding: 'px-4 py-2', gap: 'gap-2' },
    xl: { icon: 32, text: 'text-3xl', padding: 'px-5 py-3', gap: 'gap-2' },
  };

  const sizeConfig = sizes[size] || sizes.md;

  // Variants styling
  const variantStyles = {
    default: {
      bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
      border: 'border border-amber-200',
      text: 'text-amber-700',
      shadow: ''
    },
    earned: {
      bg: 'bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100',
      border: 'border-2 border-amber-300',
      text: 'text-amber-800 font-bold',
      shadow: 'shadow-md shadow-amber-200/50'
    },
    header: {
      bg: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400',
      border: 'border-2 border-amber-500',
      text: 'text-white font-bold drop-shadow-sm',
      shadow: 'shadow-lg shadow-amber-400/30'
    },
    compact: {
      bg: 'bg-amber-100',
      border: 'border border-amber-300',
      text: 'text-amber-700 font-medium',
      shadow: ''
    }
  };

  const variantConfig = variantStyles[variant] || variantStyles.default;

  // Format số lớn
  const formatNumber = (num) => {
    if (num >= 10000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    if (num >= 1000) {
      return num.toLocaleString('vi-VN');
    }
    return num.toString();
  };

  return (
    <div 
      className={`
        inline-flex items-center ${sizeConfig.gap} ${sizeConfig.padding} 
        rounded-full ${variantConfig.bg} ${variantConfig.border} ${variantConfig.shadow}
        ${isAnimating ? 'animate-pulse scale-110' : ''}
        transition-all duration-300 hover:scale-105
      `}
    >
      {/* Icon ngôi sao */}
      <div className="relative flex-shrink-0">
        <svg
          width={sizeConfig.icon}
          height={sizeConfig.icon}
          viewBox="0 0 24 24"
          className={`${isAnimating ? 'animate-spin-slow' : ''}`}
          style={{
            filter: variant === 'header' 
              ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' 
              : 'drop-shadow(0 1px 2px rgba(251, 191, 36, 0.5))'
          }}
        >
          <defs>
            <linearGradient id={`starGrad-${variant}-${stars}`} x1="0%" y1="0%" x2="100%" y2="100%">
              {variant === 'header' ? (
                <>
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#fef3c7" />
                  <stop offset="100%" stopColor="#fde68a" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </>
              )}
            </linearGradient>
          </defs>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={`url(#starGrad-${variant}-${stars})`}
            stroke={variant === 'header' ? '#fbbf24' : '#d97706'}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Highlight */}
          <ellipse cx="9" cy="7" rx="1.5" ry="1" fill="white" opacity="0.7" />
        </svg>
        
        {/* Sparkle effect khi animating */}
        {isAnimating && (
          <div className="absolute -inset-1">
            <div className="absolute top-0 right-0 w-1 h-1 bg-yellow-300 rounded-full animate-ping" />
            <div className="absolute bottom-0 left-0 w-1 h-1 bg-amber-300 rounded-full animate-ping delay-75" />
          </div>
        )}
      </div>

      {/* Số sao */}
      <span className={`${sizeConfig.text} ${variantConfig.text} tabular-nums`}>
        {showPlus && displayStars > 0 && '+'}
        {formatNumber(displayStars)}
      </span>

      {/* CSS for slow spin */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Component hiển thị sao lớn khi hoàn thành bài học (dạng số, không phải 5 sao)
export function StarReward({ 
  earnedStars, 
  animate = true 
}) {
  const [displayStars, setDisplayStars] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (animate) {
      // Animate số đếm lên
      let current = 0;
      const increment = Math.max(1, Math.ceil(earnedStars / 30));
      const interval = setInterval(() => {
        current += increment;
        if (current >= earnedStars) {
          setDisplayStars(earnedStars);
          clearInterval(interval);
          setShowCelebration(true);
        } else {
          setDisplayStars(current);
        }
      }, 30);
      return () => clearInterval(interval);
    } else {
      setDisplayStars(earnedStars);
    }
  }, [earnedStars, animate]);

  // Xác định mức thưởng dựa trên số sao
  const getRewardLevel = (stars) => {
    if (stars >= 10) return { emoji: '🏆', text: 'Siêu xuất sắc!', color: 'from-yellow-400 to-amber-500' };
    if (stars >= 7) return { emoji: '🌟', text: 'Tuyệt vời!', color: 'from-amber-400 to-orange-500' };
    if (stars >= 4) return { emoji: '⭐', text: 'Giỏi lắm!', color: 'from-orange-400 to-red-400' };
    return { emoji: '👏', text: 'Cố gắng tốt!', color: 'from-blue-400 to-purple-400' };
  };

  const reward = getRewardLevel(earnedStars);

  return (
    <div className="flex flex-col items-center py-4">
      {/* Main star display */}
      <div className={`relative ${showCelebration ? 'animate-bounce' : ''}`}>
        {/* Glow background */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r ${reward.color} blur-2xl opacity-30 scale-150 rounded-full`}
        />
        
        {/* Star icon lớn */}
        <div className="relative">
          <svg
            width={80}
            height={80}
            viewBox="0 0 24 24"
            className="drop-shadow-2xl"
          >
            <defs>
              <linearGradient id="bigStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="30%" stopColor="#fde047" />
                <stop offset="70%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <filter id="starGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="url(#bigStarGrad)"
              stroke="#b45309"
              strokeWidth="0.5"
              filter="url(#starGlow)"
            />
            <ellipse cx="9" cy="7" rx="2" ry="1.2" fill="white" opacity="0.6" />
          </svg>
          
          {/* Sparkles xung quanh */}
          {showCelebration && (
            <>
              <span className="absolute -top-2 -right-2 text-2xl animate-ping">✨</span>
              <span className="absolute -bottom-2 -left-2 text-xl animate-ping delay-100">💫</span>
              <span className="absolute top-1/2 -right-4 text-lg animate-ping delay-200">⭐</span>
            </>
          )}
        </div>
      </div>

      {/* Số sao với animation */}
      <div className="mt-4 text-center">
        <div className={`text-5xl font-black bg-gradient-to-r ${reward.color} bg-clip-text text-transparent tabular-nums`}>
          +{displayStars}
        </div>
        <div className="text-lg text-amber-600 font-medium mt-1">
          sao
        </div>
      </div>

      {/* Reward level text */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-3xl">{reward.emoji}</span>
        <span className={`text-lg font-bold bg-gradient-to-r ${reward.color} bg-clip-text text-transparent`}>
          {reward.text}
        </span>
      </div>
    </div>
  );
}

// Component hiển thị tổng sao (dùng cho header/dashboard)  
export function TotalStars({ stars, size = 'md' }) {
  return (
    <StarBadge 
      stars={stars} 
      size={size} 
      variant="header"
      showAnimation={false}
    />
  );
}
