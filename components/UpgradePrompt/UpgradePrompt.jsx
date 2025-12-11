'use client';

import { useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { Lock, Crown, Star, ArrowRight, X } from 'lucide-react';
import { getTierInfo, formatPrice, PRICING } from '@/lib/tierSystem';

// Context để quản lý upgrade prompt toàn cục
const UpgradePromptContext = createContext(null);

export function UpgradePromptProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [promptData, setPromptData] = useState(null);

  const showUpgradePrompt = (data = {}) => {
    setPromptData(data);
    setIsOpen(true);
  };

  const hideUpgradePrompt = () => {
    setIsOpen(false);
    setPromptData(null);
  };

  return (
    <UpgradePromptContext.Provider value={{ showUpgradePrompt, hideUpgradePrompt }}>
      {children}
      <UpgradePrompt 
        isOpen={isOpen} 
        onClose={hideUpgradePrompt}
        {...promptData}
      />
    </UpgradePromptContext.Provider>
  );
}

export function useUpgradePrompt() {
  const context = useContext(UpgradePromptContext);
  if (!context) {
    throw new Error('useUpgradePrompt must be used within UpgradePromptProvider');
  }
  return context;
}

/**
 * UpgradePrompt - Modal nhắc nhở nâng cấp
 */
export default function UpgradePrompt({ 
  isOpen, 
  onClose, 
  title = 'Nâng cấp để tiếp tục',
  message = 'Bài học này yêu cầu gói Premium để truy cập.',
  feature = 'lesson'
}) {
  if (!isOpen) return null;

  const premiumInfo = getTierInfo('premium');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="text-5xl mb-3">🔒</div>
          <h2 className="text-xl font-black">{title}</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-center mb-6">{message}</p>

          {/* Premium Features */}
          <div className="bg-purple-50 rounded-2xl p-4 mb-6">
            <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
              <Crown className="text-purple-500" size={18} />
              Premium bao gồm:
            </h3>
            <ul className="space-y-2">
              {premiumInfo.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <Star size={14} className="text-purple-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Price */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">Chỉ từ</p>
            <p className="text-2xl font-black text-purple-600">
              {formatPrice(PRICING.premium['1_month'].price)}
              <span className="text-sm font-normal text-gray-500">/tháng</span>
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/pricing"
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <Crown size={18} />
              Nâng cấp ngay
              <ArrowRight size={18} />
            </Link>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

/**
 * LockBadge - Badge hiển thị nội dung bị khóa
 */
export function LockBadge({ size = 'md' }) {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  return (
    <div className={`${sizes[size]} bg-gray-200 rounded-full flex items-center justify-center`}>
      <Lock size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} className="text-gray-500" />
    </div>
  );
}

/**
 * TierRequiredBadge - Badge hiển thị tier yêu cầu
 */
export function TierRequiredBadge({ requiredTier = 'premium' }) {
  const tierInfo = getTierInfo(requiredTier);
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${tierInfo.badge}`}>
      <span>{tierInfo.icon}</span>
      {tierInfo.displayName}
    </span>
  );
}
