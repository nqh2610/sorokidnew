'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nContext';
import LocalizedLink from '@/components/LocalizedLink/LocalizedLink';

/**
 * Component hiển thị số ngày dùng thử còn lại
 * Tự fetch data từ API, không phụ thuộc vào parent
 * 
 * Không hiện nếu:
 * - User đã mua gói (tier !== 'free')
 * - User không có trial (trialExpiresAt = null)
 */
export default function TrialDaysBadge() {
  const { t } = useI18n();
  const [trialInfo, setTrialInfo] = useState(null);
  const [userTier, setUserTier] = useState(null);

  useEffect(() => {
    const fetchTrialInfo = async () => {
      try {
        const res = await fetch('/api/test-trial');
        if (res.ok) {
          const data = await res.json();
          if (data.trialInfo) {
            setTrialInfo(data.trialInfo);
          }
          if (data.user) {
            setUserTier(data.user.tier);
          }
        }
      } catch (error) {
        // Silently fail - không hiện badge nếu lỗi
      }
    };

    fetchTrialInfo();
  }, []);

  // Không hiện gì nếu:
  // 1. Không có trial info
  // 2. User đã mua gói (tier không phải 'free')
  // 3. User chưa từng được cấp trial (hadTrial = false)
  if (!trialInfo || (userTier && userTier !== 'free') || !trialInfo.hadTrial) {
    return null;
  }

  // Map tier name sang tiếng Việt
  const tierNames = {
    'advanced': t('tierBadge.advanced'),
    'premium': t('tierBadge.premium'),
    'basic': t('tierBadge.basic'),
    'free': t('tierBadge.free')
  };

  const tierName = tierNames[trialInfo.trialTier] || trialInfo.trialTier;

  // Không hiện gì nếu trial đã hết - để UpgradeBanner lo
  if (!trialInfo.isActive) {
    return null;
  }

  // Trial còn hiệu lực
  const { daysRemaining, hoursRemaining, minutesRemaining } = trialInfo;
  
  // Còn 0 ngày - hiển thị giờ:phút + mời nâng cấp tinh tế
  if (daysRemaining === 0) {
    return (
      <LocalizedLink href="/pricing" className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors cursor-pointer" title={t('tierBadge.viewPlans')}>
        <span>
          ⏰ {t('trialBadge.trialRemaining', { hours: hoursRemaining, minutes: minutesRemaining })} · {t('trialBadge.upgradeNow')}
        </span>
      </LocalizedLink>
    );
  }
  
  // Còn 1 ngày - thông báo thân thiện
  if (daysRemaining === 1) {
    return (
      <LocalizedLink href="/pricing" className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400 transition-colors cursor-pointer" title={t('tierBadge.viewPlans')}>
        <span>
          🌟 {t('trialBadge.lastDay')} · {t('trialBadge.viewPlans')}
        </span>
      </LocalizedLink>
    );
  }
  
  // Còn 2-3 ngày - nhắc nhẹ
  if (daysRemaining <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-yellow-500">
        <span>
          🎁 {t('trialBadge.trialDays', { days: daysRemaining })}
        </span>
      </span>
    );
  }
  
  // Còn nhiều ngày - vui vẻ
  return (
    <span className="inline-flex items-center gap-1 text-xs text-purple-500">
      <span>
        🎉 {t('trialBadge.trialDays', { days: daysRemaining })}
      </span>
    </span>
  );
}
