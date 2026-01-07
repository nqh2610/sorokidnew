'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import AchievementPopup from '@/components/AchievementPopup';

/**
 * 🏆 Achievement Context
 * Quản lý hiển thị Achievement Popup trong toàn ứng dụng
 */

const AchievementContext = createContext(null);

export function AchievementProvider({ children }) {
  const [queue, setQueue] = useState([]); // Queue các achievement chờ hiển thị
  const [current, setCurrent] = useState(null); // Achievement đang hiển thị

  /**
   * Thêm achievement vào queue
   * @param {string} type - Loại achievement: stage, boss, zone, certificate-addSub, certificate-complete
   * @param {Object} data - Dữ liệu: { name, icon, description, rewards: { stars, diamonds, xp } }
   */
  const showAchievement = useCallback((type, data) => {
    const achievement = { id: Date.now(), type, data };
    
    setQueue(prev => {
      // Nếu chưa có gì đang hiển thị, hiển thị ngay
      if (!current && prev.length === 0) {
        setCurrent(achievement);
        return [];
      }
      // Nếu đang có, thêm vào queue
      return [...prev, achievement];
    });
  }, [current]);

  /**
   * Đóng achievement hiện tại và hiển thị cái tiếp theo
   */
  const closeAchievement = useCallback(() => {
    setCurrent(null);
    
    // Hiển thị achievement tiếp theo trong queue sau 500ms
    setTimeout(() => {
      setQueue(prev => {
        if (prev.length > 0) {
          const [next, ...rest] = prev;
          setCurrent(next);
          return rest;
        }
        return prev;
      });
    }, 500);
  }, []);

  /**
   * Shortcut functions cho từng loại
   */
  const showStageComplete = useCallback((name, rewards) => {
    showAchievement('stage', { name, rewards });
  }, [showAchievement]);

  const showBossDefeated = useCallback((name, icon, rewards) => {
    showAchievement('boss', { name, icon, rewards });
  }, [showAchievement]);

  const showZoneComplete = useCallback((name, icon, description) => {
    showAchievement('zone', { name, icon, description });
  }, [showAchievement]);

  const showCertificateEarned = useCallback((certType, name) => {
    const type = certType === 'addSub' ? 'certificate-addSub' : 'certificate-complete';
    const icon = certType === 'addSub' ? '🎖️' : '👑';
    const description = certType === 'addSub' 
      ? 'Chứng chỉ Cộng Trừ Soroban'
      : 'Chứng chỉ Soroban Toàn Diện';
    showAchievement(type, { name, icon, description });
  }, [showAchievement]);

  const value = {
    showAchievement,
    showStageComplete,
    showBossDefeated,
    showZoneComplete,
    showCertificateEarned,
    hasAchievement: !!current || queue.length > 0
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
      
      {/* Render popup */}
      {current && (
        <AchievementPopup
          type={current.type}
          data={current.data}
          show={true}
          onClose={closeAchievement}
        />
      )}
    </AchievementContext.Provider>
  );
}

/**
 * Hook sử dụng Achievement
 */
export function useAchievement() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievement must be used within AchievementProvider');
  }
  return context;
}

export default AchievementContext;
