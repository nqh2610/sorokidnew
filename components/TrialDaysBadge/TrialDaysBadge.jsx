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

  // Trial đã hết hạn
  if (!trialInfo.isActive && trialInfo.daysRemaining <= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-orange-600">
        <AlertCircle size={12} />
        <span>Dùng thử đã hết</span>
      </span>
    );
  }

  // Trial còn hiệu lực
  if (trialInfo.isActive) {
    // Nếu còn ít ngày (<=2) thì highlight màu cam
    const isUrgent = trialInfo.daysRemaining <= 2;
    
    return (
      <span className={`inline-flex items-center gap-1 text-xs ${isUrgent ? 'text-orange-500' : 'text-purple-500'}`}>
        <Clock size={12} />
        <span>
          Dùng thử {tierName}: {trialInfo.daysRemaining} ngày
        </span>
      </span>
    );
  }

  return null;
}
