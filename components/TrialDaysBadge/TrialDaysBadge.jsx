'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

/**
 * Component hiển thị số ngày dùng thử còn lại
 * Tự fetch data từ API, không phụ thuộc vào parent
 * 
 * Không hiện nếu:
 * - User đã mua gói (tier !== 'free')
 * - User không có trial (trialExpiresAt = null)
 */
export default function TrialDaysBadge() {
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
    'advanced': 'Nâng cao',
    'premium': 'Premium',
    'basic': 'Cơ bản',
    'free': 'Miễn phí'
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
      <a href="/pricing" className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors cursor-pointer" title="Xem các gói học">
        <span>
          ⏰ Học thử còn {hoursRemaining}h {minutesRemaining}p · Nâng cấp ngay!
        </span>
      </a>
    );
  }
  
  // Còn 1 ngày - thông báo thân thiện
  if (daysRemaining === 1) {
    return (
      <a href="/pricing" className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400 transition-colors cursor-pointer" title="Xem các gói học">
        <span>
          🌟 Ngày cuối học thử · Xem gói học
        </span>
      </a>
    );
  }
  
  // Còn 2-3 ngày - nhắc nhẹ
  if (daysRemaining <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-yellow-500">
        <span>
          🎁 Học thử còn {daysRemaining} ngày
        </span>
      </span>
    );
  }
  
  // Còn nhiều ngày - vui vẻ
  return (
    <span className="inline-flex items-center gap-1 text-xs text-purple-500">
      <span>
        🎉 Học thử còn {daysRemaining} ngày
      </span>
    </span>
  );
}
