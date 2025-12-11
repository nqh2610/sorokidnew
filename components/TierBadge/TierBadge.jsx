'use client';

import { getTierInfo } from '@/lib/tierSystem';
import { Crown, Star, Sparkles } from 'lucide-react';

/**
 * TierBadge - Badge hiển thị tier của user
 */
export default function TierBadge({ 
  tier = 'free', 
  size = 'md',
  showLabel = true,
  className = ''
}) {
  const tierInfo = getTierInfo(tier);
  
  const sizes = {
    sm: {
      badge: 'px-2 py-0.5 text-xs gap-1',
      icon: 12
    },
    md: {
      badge: 'px-3 py-1 text-sm gap-1.5',
      icon: 14
    },
    lg: {
      badge: 'px-4 py-1.5 text-base gap-2',
      icon: 18
    }
  };

  const sizeConfig = sizes[size] || sizes.md;

  const icons = {
    free: null,
    premium: <Star size={sizeConfig.icon} />,
    vip: <Crown size={sizeConfig.icon} />
  };

  if (tier === 'free' && !showLabel) return null;

  return (
    <span 
      className={`
        inline-flex items-center font-bold rounded-full
        ${tierInfo.badge}
        ${sizeConfig.badge}
        ${className}
      `}
    >
      {icons[tier]}
      {showLabel && tierInfo.displayName}
    </span>
  );
}

/**
 * TierBadgeInline - Badge inline nhỏ gọn
 */
export function TierBadgeInline({ tier = 'free' }) {
  const tierInfo = getTierInfo(tier);
  
  if (tier === 'free') return null;

  return (
    <span className="text-sm" title={tierInfo.displayName}>
      {tierInfo.icon}
    </span>
  );
}

/**
 * TierBadgeAnimated - Badge với hiệu ứng animation
 */
export function TierBadgeAnimated({ tier = 'free', size = 'md' }) {
  const tierInfo = getTierInfo(tier);
  
  if (tier === 'free') return null;

  return (
    <span 
      className={`
        relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-sm
        bg-gradient-to-r ${tierInfo.color} text-white shadow-lg
      `}
    >
      {/* Glow effect */}
      <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
      
      {/* Sparkles */}
      {tier === 'vip' && (
        <Sparkles size={14} className="animate-spin-slow" />
      )}
      
      {tier === 'premium' && (
        <Star size={14} className="animate-pulse" />
      )}
      
      <span className="relative z-10">{tierInfo.displayName}</span>
      
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </span>
  );
}
