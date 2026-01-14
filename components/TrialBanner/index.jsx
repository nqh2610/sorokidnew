'use client';

import { useState } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { TIERS } from '@/lib/tierSystem';
import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * TrialBanner - Hiển thị banner thông báo trial
 * @param {Object} trialInfo - { isActive, daysRemaining, trialTier, expiresAt, hadTrial }
 * 
 * Logic:
 * - hadTrial = true, isActive = true: Đang trong trial → hiện banner trial
 * - hadTrial = true, isActive = false: Đã hết trial → hiện banner hết hạn
 * - hadTrial = false: Chưa từng có trial → không hiện gì
 */
export default function TrialBanner({ trialInfo }) {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useI18n();
  
  // Không có trial info hoặc chưa từng có trial → không hiện gì
  if (!trialInfo || !trialInfo.hadTrial) {
    return null;
  }

  // Đã dismiss banner hết hạn
  if (dismissed && !trialInfo.isActive) {
    return null;
  }

  // Đã hết trial → hiện banner hết hạn
  if (!trialInfo.isActive) {
    const tierInfo = TIERS[trialInfo.trialTier] || TIERS.advanced;
    return (
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">😢</span>
            <div>
              <p className="font-semibold">{t('trial.ended')}</p>
              <p className="text-sm text-white/80">
                {t('trial.endedDesc', { tier: tierInfo.displayName })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <LocalizedLink
              href="/pricing"
              className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
            >
              {t('trial.upgradeNow')}
            </LocalizedLink>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-2 text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Đang trong trial → hiện banner trial đang hoạt động
  const { daysRemaining, trialTier } = trialInfo;
  const tierInfo = TIERS[trialTier] || TIERS.advanced;

  // Màu sắc theo số ngày còn lại
  const getBannerStyle = () => {
    if (daysRemaining <= 2) {
      return 'from-red-500 to-orange-500'; // Sắp hết - cảnh báo
    } else if (daysRemaining <= 5) {
      return 'from-amber-500 to-yellow-500'; // Còn ít - nhắc nhở
    }
    return 'from-purple-500 to-pink-500'; // Còn nhiều - vui vẻ
  };

  const getIcon = () => {
    if (daysRemaining <= 2) return '⏰';
    if (daysRemaining <= 5) return '⚡';
    return '🎁';
  };

  return (
    <div className={`bg-gradient-to-r ${getBannerStyle()} rounded-xl p-4 text-white shadow-lg`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getIcon()}</span>
          <div>
            <p className="font-semibold">
              {t('trial.inProgress')} {tierInfo.icon} {tierInfo.displayName}
            </p>
            <p className="text-sm text-white/90">
              {daysRemaining <= 2 
                ? t('trial.warningLastDays', { days: daysRemaining })
                : t('trial.daysRemaining', { days: daysRemaining })
              }
            </p>
          </div>
        </div>

        {/* Right: CTA Button */}
        <LocalizedLink
          href="/pricing"
          className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors shadow-md whitespace-nowrap"
        >
          {daysRemaining <= 2 ? t('trial.upgradeNow') : t('trial.viewPlans')}
        </LocalizedLink>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-white/80 mb-1">
          <span>{t('trial.period')}</span>
          <span>{t('trial.daysLeft', { days: daysRemaining })}</span>
        </div>
        <div className="h-2 bg-white/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (daysRemaining / 7) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * TrialBannerCompact - Phiên bản nhỏ gọn cho Navigation/Sidebar
 */
export function TrialBannerCompact({ trialInfo }) {
  const { t } = useI18n();
  
  if (!trialInfo || !trialInfo.isActive) {
    return null;
  }

  const { daysRemaining, trialTier } = trialInfo;
  const tierInfo = TIERS[trialTier] || TIERS.advanced;

  return (
    <LocalizedLink
      href="/pricing"
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        daysRemaining <= 2
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : daysRemaining <= 5
          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
      }`}
    >
      <span>{tierInfo.icon}</span>
      <span>{t('trial.badge', { days: daysRemaining })}</span>
    </LocalizedLink>
  );
}

/**
 * TrialExpiredBanner - Hiển thị khi trial đã hết hạn
 */
export function TrialExpiredBanner({ onDismiss }) {
  const { t } = useI18n();
  
  return (
    <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-4 text-white shadow-lg">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">😢</span>
          <div>
            <p className="font-semibold">{t('trial.ended')}</p>
            <p className="text-sm text-white/80">
              {t('upgrade.fullExperience')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <LocalizedLink
            href="/pricing"
            className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
          >
            {t('trial.upgradeNow')}
          </LocalizedLink>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-3 py-2 text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
