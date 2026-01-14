'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { Sparkles, Gift, Star, Trophy, Rocket, Crown, X, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * 🎯 SOFT UPGRADE TRIGGERS
 * 
 * Các hiệu ứng tâm lý tinh tế để khuyến khích nâng cấp:
 * 1. Milestone Celebration - Khi đạt thành tích, gợi ý nhẹ nhàng
 * 2. Progress Peek - Cho thấy "còn X bài nữa hết free tier"
 * 3. Social Comparison - "Bạn đang ở top X%"
 * 4. Achievement Unlock Hint - Gợi ý thành tích premium
 * 5. Soft Nudge - Banner nhỏ không intrusive
 */

// ==========================================
// 1. MILESTONE CELEBRATION
// Hiển thị khi user hoàn thành bài học hoặc đạt streak
// ==========================================
export function MilestoneCelebration({ 
  isVisible,
  show: showProp, // Alternative prop name
  milestone, // { type: 'lesson' | 'streak' | 'level', value: number, title: string }
  milestoneType, // Alternative: 'session' | 'battle' | 'lesson'
  message, // Alternative: custom message
  starsEarned, // Alternative: stars earned
  userTier,
  onClose 
}) {
  const { t } = useI18n();
  const [showInternal, setShowInternal] = useState(false);
  
  // Support both isVisible and show prop names
  const isActive = isVisible || showProp;
  
  useEffect(() => {
    if (isActive) {
      // Delay hiển thị để không chen ngang celebration chính
      const timer = setTimeout(() => setShowInternal(true), 500);
      return () => clearTimeout(timer);
    }
    setShowInternal(false);
  }, [isActive]);

  // Auto close sau 8 giây
  useEffect(() => {
    if (showInternal) {
      const timer = setTimeout(() => {
        setShowInternal(false);
        onClose?.();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showInternal, onClose]);

  if (!showInternal || userTier === 'advanced' || userTier === 'vip') return null;

  const typeMessages = {
    session: t('softUpgrade.practiceGreat'),
    battle: t('softUpgrade.battleExcellent'),
    lesson: t('softUpgrade.lessonComplete'),
    streak: t('softUpgrade.streakImpressive'),
    level: t('softUpgrade.levelUp')
  };

  const displayMessage = message || typeMessages[milestoneType] || milestone?.title || t('softUpgrade.doingGreat');

  const upgradeHints = {
    free: t('softUpgrade.unlockMoreLevels'),
    basic: t('softUpgrade.upgradeFor18Levels')
  };

  const handleClose = () => {
    setShowInternal(false);
    onClose?.();
  };

  return (
    <>
      {/* Backdrop - click để đóng */}
      <div 
        className="fixed inset-0 z-40 bg-black/10"
        onClick={handleClose}
      />
      
      {/* Toast content */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-500">
        <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 p-4 relative">
          {/* Nút X - dễ bấm trên mobile */}
          <button 
            onClick={handleClose}
            className="absolute top-2 right-2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors active:scale-95"
            aria-label={t('common.close')}
          >
            <X size={18} />
          </button>
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white flex-shrink-0">
            <Trophy size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-800 font-medium mb-1">
              {displayMessage}
            </p>
            {starsEarned > 0 && (
              <p className="text-xs text-yellow-600 font-bold mb-2">
                +{starsEarned} ⭐ {t('softUpgrade.stars')}
              </p>
            )}
            <LocalizedLink 
              href="/pricing"
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium group"
            >
              <Sparkles size={12} className="group-hover:animate-pulse" />
              <span>{upgradeHints[userTier] || t('softUpgrade.exploreMore')}</span>
              <ChevronRight size={12} />
            </LocalizedLink>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// ==========================================
// 2. PROGRESS PEEK
// Hiển thị "Còn X bài nữa hết free tier" - subtle reminder
// ==========================================
export function ProgressPeek({ 
  currentProgress, // { completed: number, freeLimit: number }
  currentLevel, // Alternative: current level number
  maxFreeLevel, // Alternative: max free level
  userTier,
  onUpgradeClick 
}) {
  const { t } = useI18n();
  // Support both ways of passing progress
  let remaining;
  if (currentProgress) {
    remaining = currentProgress.freeLimit - currentProgress.completed;
  } else if (currentLevel && maxFreeLevel) {
    remaining = maxFreeLevel - currentLevel;
  } else {
    return null;
  }

  if (userTier !== 'free' && userTier !== undefined) return null;
  if (remaining <= 0 || remaining > 3) return null; // Chỉ show khi còn ≤3 bài/level

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-30 animate-in slide-in-from-bottom-3 duration-300">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-amber-100 rounded-lg flex-shrink-0">
            <Gift size={16} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-amber-800">
              {t('softUpgrade.freeRemaining', { count: remaining, type: currentLevel ? t('softUpgrade.level') : t('softUpgrade.lesson') })}
            </p>
            {onUpgradeClick ? (
              <button 
                onClick={onUpgradeClick}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1 mt-0.5"
              >
                {t('softUpgrade.unlockAll')} <ChevronRight size={10} />
              </button>
            ) : (
              <LocalizedLink 
                href="/pricing" 
                className="text-xs text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1 mt-0.5"
              >
                {t('softUpgrade.viewMoreContent')} <ChevronRight size={10} />
              </LocalizedLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. ACHIEVEMENT UNLOCK HINT
// Khi user xem thành tích bị khóa
// ==========================================
export function AchievementUnlockHint({ 
  achievementName,
  isVisible,
  onClose 
}) {
  const { t } = useI18n();
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl p-6 max-w-sm shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
            <span className="text-3xl opacity-50">🔒</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">{achievementName}</h3>
          <p className="text-sm text-gray-500 mb-4">
            {t('softUpgrade.achievementForUpgraded')}
          </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 text-gray-500 hover:text-gray-700 font-medium rounded-xl transition-colors"
            >
              {t('upgrade.maybeLater')}
            </button>
            <LocalizedLink 
              href="/pricing"
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg transition-all text-center"
            >
              {t('softUpgrade.learnMore')}
            </LocalizedLink>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. SOFT NUDGE BANNER
// Banner nhỏ không intrusive, xuất hiện sau khi chơi
// ==========================================
export function SoftNudgeBanner({ 
  userTier,
  trigger, // 'after_practice' | 'after_lesson' | 'after_compete'
  stats, // { correct: number, total: number, streak: number }
  show: showProp, // Alternative: direct show control
  message, // Alternative: custom message
  subMessage, // Alternative: custom sub message
  onClose // Alternative: close handler
}) {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(false);
  const [showInternal, setShowInternal] = useState(false);

  useEffect(() => {
    // Direct show control
    if (showProp !== undefined) {
      setShowInternal(showProp);
      return;
    }
    
    // Auto-trigger logic
    if (userTier === 'advanced' || userTier === 'vip') return;
    if (!stats || stats.correct / stats.total < 0.7) return;
    
    const timer = setTimeout(() => setShowInternal(true), 3000);
    return () => clearTimeout(timer);
  }, [userTier, stats, showProp]);

  // Auto dismiss sau 10 giây
  useEffect(() => {
    if (showInternal && !dismissed) {
      const timer = setTimeout(() => {
        setDismissed(true);
        onClose?.();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showInternal, dismissed, onClose]);

  if (!showInternal || dismissed) return null;

  const messages = {
    after_practice: {
      title: t('softUpgrade.progressingFast'),
      subtitle: userTier === 'free' 
        ? t('softUpgrade.challengeYourself') 
        : t('softUpgrade.exploreFlashAnzan')
    },
    after_lesson: {
      title: t('softUpgrade.lessonCompleteAwesome'),
      subtitle: t('softUpgrade.moreLessonsAwaiting')
    },
    after_compete: {
      title: stats?.isTop3 ? t('softUpgrade.excellentTop3') : t('softUpgrade.wellDone'),
      subtitle: t('softUpgrade.trySpecialModes')
    }
  };

  const msg = messages[trigger] || messages.after_practice;
  const displayTitle = message || msg.title;
  const displaySubtitle = subMessage || msg.subtitle;

  const handleClose = () => {
    setDismissed(true);
    onClose?.();
  };

  return (
    <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-40 animate-in slide-in-from-top-3 duration-300">
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-4 border border-purple-100 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex-shrink-0">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm">{displayTitle}</p>
            <p className="text-xs text-gray-500 mt-0.5">{displaySubtitle}</p>
            <LocalizedLink
              href="/pricing"
              className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-lg hover:shadow-md transition-all"
            >
              {t('softUpgrade.explore')} <ChevronRight size={12} />
            </LocalizedLink>
          </div>
          <button 
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. LOCKED CONTENT PREVIEW
// Cho xem preview nội dung bị khóa với hiệu ứng blur
// ==========================================
export function LockedContentPreview({ 
  title,
  description,
  previewContent, // React node
  requiredTier // 'basic' | 'advanced'
}) {
  const { t } = useI18n();
  const tierNames = {
    basic: t('softUpgrade.basicPackage'),
    advanced: t('softUpgrade.advancedPackage')
  };

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred preview */}
      <div className="blur-sm opacity-60 pointer-events-none">
        {previewContent}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
          <Crown size={24} className="text-white" />
        </div>
        <h4 className="font-bold text-gray-800 text-center mb-1">{title}</h4>
        <p className="text-sm text-gray-500 text-center mb-3">{description}</p>
        <LocalizedLink
          href="/pricing"
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all inline-flex items-center gap-1.5"
        >
          {t('softUpgrade.unlockWith', { tier: tierNames[requiredTier] })}
          <ChevronRight size={14} />
        </LocalizedLink>
      </div>
    </div>
  );
}

// ==========================================
// 6. SUBTLE FLOATING HINT
// Hint nhỏ xuất hiện góc màn hình sau một thời gian
// ==========================================
export function SubtleFloatingHint({ 
  userTier,
  sessionDuration, // seconds
  lessonsCompleted 
}) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (userTier === 'advanced' || userTier === 'vip') return;
    if (dismissed) return;
    
    // Chỉ hiện sau 5 phút chơi hoặc hoàn thành 3 bài
    const shouldShow = sessionDuration > 300 || lessonsCompleted >= 3;
    
    if (shouldShow) {
      const timer = setTimeout(() => setShow(true), 2000);
      
      // Tự động ẩn sau 8 giây
      const hideTimer = setTimeout(() => setShow(false), 10000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [userTier, sessionDuration, lessonsCompleted, dismissed]);

  if (!show) return null;

  return (
    <LocalizedLink
      href="/pricing"
      className="fixed bottom-20 right-4 z-30 animate-in slide-in-from-right duration-500"
      onClick={() => setDismissed(true)}
    >
      <div className="bg-white rounded-full shadow-lg border border-purple-100 px-4 py-2 flex items-center gap-2 hover:shadow-xl transition-shadow">
        <span className="text-xl">💎</span>
        <span className="text-sm text-gray-700 font-medium">{t('softUpgrade.unlockAll')}</span>
        <ChevronRight size={14} className="text-purple-500" />
      </div>
    </LocalizedLink>
  );
}

// ==========================================
// 7. SMART UPGRADE HOOK
// Hook để quyết định thời điểm hiển thị trigger
// ==========================================
export function useSmartUpgradeTrigger(userTier) {
  const [triggerType, setTriggerType] = useState(null);
  const [triggerData, setTriggerData] = useState(null);

  const checkTrigger = useCallback((event, data) => {
    if (userTier === 'advanced' || userTier === 'vip') return;

    // Logic quyết định trigger
    switch (event) {
      case 'lesson_complete':
        // Trigger sau mỗi 5 bài học
        if (data.totalCompleted % 5 === 0) {
          setTriggerType('milestone');
          setTriggerData({ type: 'lesson', value: data.totalCompleted });
        }
        break;
        
      case 'practice_complete':
        // Trigger khi đạt kết quả tốt
        if (data.accuracy >= 0.8) {
          setTriggerType('soft_nudge');
          setTriggerData({ trigger: 'after_practice', stats: data });
        }
        break;
        
      case 'streak_milestone':
        // Trigger khi đạt streak
        if ([3, 7, 14, 30].includes(data.streak)) {
          setTriggerType('milestone');
          setTriggerData({ type: 'streak', value: data.streak });
        }
        break;
        
      case 'approach_limit':
        // Trigger khi gần hết free tier
        if (data.remaining <= 3) {
          setTriggerType('progress_peek');
          setTriggerData({ completed: data.completed, freeLimit: data.limit });
        }
        break;
    }
  }, [userTier]);

  const clearTrigger = useCallback(() => {
    setTriggerType(null);
    setTriggerData(null);
  }, []);

  return { triggerType, triggerData, checkTrigger, clearTrigger };
}
