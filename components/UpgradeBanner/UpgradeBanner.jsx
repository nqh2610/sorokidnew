'use client';

import { useState } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { Crown, Star, Zap, ArrowRight, X } from 'lucide-react';
import { getTierInfo, formatPrice, PRICING } from '@/lib/tierSystem';
import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * UpgradeBanner - Banner nhắc nhở nâng cấp
 * Hiển thị khi user free đạt đến giới hạn
 */
export default function UpgradeBanner({ 
  currentTier = 'free',
  lessonLimit,
  onClose,
  compact = false 
}) {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useI18n();

  if (dismissed || currentTier !== 'free') return null;

  const handleDismiss = () => {
    setDismissed(true);
    onClose?.();
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-3 text-white relative overflow-hidden">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full"
        >
          <X size={14} />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-2xl">👑</div>
          <div className="flex-1">
            <p className="font-bold text-sm">{t('common.premium')}</p>
            <p className="text-xs text-white/80">{t('upgrade.unlockAll')}</p>
          </div>
          <LocalizedLink
            href="/pricing"
            className="px-3 py-1.5 bg-white text-purple-600 rounded-lg font-bold text-xs hover:bg-purple-50 transition-colors"
          >
            {t('upgrade.viewNow')}
          </LocalizedLink>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-2 hover:bg-white/20 rounded-full transition-colors"
      >
        <X size={18} />
      </button>

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className="text-5xl">🚀</div>
          <div className="flex-1">
            <h3 className="text-xl font-black mb-2">
              {t('upgrade.unlockAllFull')}
            </h3>
            <p className="text-white/90 text-sm mb-4">
              {lessonLimit 
                ? `${t('upgrade.completedFree', { count: lessonLimit })} `
                : ''}
              {t('upgrade.upgradeDesc')}
            </p>

            {/* Features preview */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                <Star size={12} /> {t('upgrade.allLessons')}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                <Crown size={12} /> {t('upgrade.certificates')}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                <Zap size={12} /> {t('upgrade.unlimited')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <LocalizedLink
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-all hover:scale-105 shadow-lg"
              >
                {t('upgrade.upgradeNow')}
                <ArrowRight size={16} />
              </LocalizedLink>
              <span className="text-white/70 text-sm">
                {t('upgrade.startingAt')} {formatPrice(PRICING.premium['1_month'].price)}{t('upgrade.perMonth')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
