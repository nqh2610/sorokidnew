'use client';

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, ChevronDown } from 'lucide-react';
import Logo from '@/components/Logo/Logo';
import { MonsterAvatar } from '@/components/MonsterAvatar';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import { useGameSound } from '@/lib/useGameSound';
import { initSoundSystem } from '@/lib/soundManager';
import SoundSettingsPanel from '@/components/SoundSettings/SoundSettingsPanel';
import { LocalizedLink, useLocalizedUrl } from '@/components/LocalizedLink';
import { useI18n } from '@/lib/i18n/I18nContext';

// Import narrative config
import { STORY_OVERVIEW, GAMEPLAY_NARRATIVES } from '@/config/narrative.config';

// 🎨 Import game decorations & effects
import MapDecorations from './MapDecorations';
import TreasureChestReveal from './TreasureChestReveal';
import ZoneBackground from './ZoneBackground';
import RewardEffects, { StageCompleteEffect, ZoneCompleteCelebration, ZoneIntroDialog, ZoneLockedDialog } from './RewardEffects';

// ============================================================
// 🎮 GAME MAP - Đi Tìm Kho Báu Tri Thức
// Design: Duolingo + Candy Crush Saga
// ============================================================

// ===== CUSTOM HOOK: useSwipeZone - Swipe gesture để chuyển zone =====
function useSwipeZone({ zones, activeZoneId, onChangeZone }) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const isDragging = useRef(false);
  
  // Responsive thresholds - smaller screens need smaller swipe distance
  const getMinSwipeDistance = () => {
    if (typeof window === 'undefined') return 30;
    const width = window.innerWidth;
    if (width < 400) return 25;  // Very small phones - rất nhạy
    if (width < 640) return 30;  // Small phones
    if (width < 768) return 35;  // Large phones
    return 50;                    // Tablets and desktop
  };
  
  const maxClickDistance = 8; // If movement < 8px, it's definitely a click
  
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);
  
  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const dx = touchStartX.current - touchEndX.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(touchStartY.current - touchEndY.current);
    const minSwipeDistance = getMinSwipeDistance();
    
    // If barely moved, it's a click - let child elements handle it
    if (absDx < maxClickDistance && absDy < maxClickDistance) {
      touchStartX.current = 0;
      touchEndX.current = 0;
      return;
    }
    
    // If vertical movement is more than horizontal, it's a scroll - don't swipe
    if (absDy > absDx) {
      touchStartX.current = 0;
      touchEndX.current = 0;
      return;
    }
    
    // Check minimum swipe distance for horizontal
    if (absDx < minSwipeDistance) {
      touchStartX.current = 0;
      touchEndX.current = 0;
      return;
    }
    
    const currentIndex = zones.findIndex(z => z.zoneId === activeZoneId);
    
    if (dx > 0 && currentIndex < zones.length - 1) {
      // Swipe left -> next zone
      onChangeZone(zones[currentIndex + 1].zoneId);
    } else if (dx < 0 && currentIndex > 0) {
      // Swipe right -> previous zone
      onChangeZone(zones[currentIndex - 1].zoneId);
    }
    
    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [zones, activeZoneId, onChangeZone]);
  
  // Mouse drag support for desktop testing
  const handleMouseDown = useCallback((e) => {
    // Ignore if clicking on a button or interactive element
    if (e.target.closest('button, a, [role="button"]')) {
      return;
    }
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    touchEndX.current = e.clientX;
    touchEndY.current = e.clientY;
    isDragging.current = true;
  }, []);
  
  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    touchEndX.current = e.clientX;
    touchEndY.current = e.clientY;
  }, []);
  
  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const dx = touchStartX.current - touchEndX.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(touchStartY.current - touchEndY.current);
    const minSwipeDistance = getMinSwipeDistance();
    
    // If barely moved, it's a click
    if (absDx < maxClickDistance && absDy < maxClickDistance) {
      touchStartX.current = 0;
      touchEndX.current = 0;
      return;
    }
    
    // If vertical movement is more than horizontal, don't swipe
    if (absDy > absDx) {
      touchStartX.current = 0;
      touchEndX.current = 0;
      return;
    }
    
    if (absDx < minSwipeDistance) {
      touchStartX.current = 0;
      touchEndX.current = 0;
      return;
    }
    
    const currentIndex = zones.findIndex(z => z.zoneId === activeZoneId);
    
    if (dx > 0 && currentIndex < zones.length - 1) {
      onChangeZone(zones[currentIndex + 1].zoneId);
    } else if (dx < 0 && currentIndex > 0) {
      onChangeZone(zones[currentIndex - 1].zoneId);
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [zones, activeZoneId, onChangeZone]);
  
  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
  }, []);
  
  return {
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
    }
  };
}

// ===== HELPER: Lấy random message từ mảng =====
const getRandomMessage = (messages) => {
  if (!messages || messages.length === 0) return '';
  return messages[Math.floor(Math.random() * messages.length)];
};

// ===== HELPER: Lấy lời dẫn theo chapter =====
const getChapterNarrative = (chapterIndex, type = 'entering') => {
  const transitions = STORY_OVERVIEW?.chapterTransitions;
  if (transitions && transitions[chapterIndex]) {
    return transitions[chapterIndex][type] || '';
  }
  return '';
};

// ===== PROLOGUE MODAL - OPTIMIZED =====
function PrologueModal({ isOpen, onClose, onComplete, t }) {
  const [currentScene, setCurrentScene] = useState(0);
  const scenes = STORY_OVERVIEW?.prologue?.scenes || [];
  
  if (!isOpen || scenes.length === 0) return null;
  
  const handleNext = () => {
    if (currentScene < scenes.length - 1) {
      setCurrentScene(prev => prev + 1);
    } else {
      // Đánh dấu đã xem prologue
      localStorage.setItem('sorokid_prologue_seen', 'true');
      onComplete?.();
      onClose();
    }
  };
  
  const scene = scenes[currentScene];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }} // 🚀 Faster
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }} // 🚀 Snappy easing
        className="w-full max-w-md bg-gradient-to-b from-indigo-900 to-purple-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400/50"
      >
        {/* Scene illustration area */}
        <div className="relative h-48 bg-gradient-to-b from-indigo-800/50 to-transparent flex items-center justify-center">
          {/* 🚀 REDUCED: Only 4 stars with CSS animation instead of 8 with Framer */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute text-yellow-300 animate-pulse"
              style={{ 
                left: `${15 + i * 22}%`, 
                top: `${20 + (i % 2) * 40}%`,
                fontSize: 12 + i * 4,
                animationDelay: `${i * 0.3}s`
              }}
            >
              ✦
            </div>
          ))}
          
          {/* Main icon based on scene - 🚀 Simpler animation */}
          <motion.div
            key={currentScene}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="text-7xl"
          >
            {currentScene === 0 && '💎'}
            {currentScene === 1 && '🧮'}
            {currentScene === 2 && '🦉'}
            {currentScene === 3 && '🏆'}
          </motion.div>
        </div>
        
        {/* Narrative text */}
        <div className="p-6">
          <motion.p
            key={currentScene}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }} // 🚀 Faster
            className="text-white text-center text-lg leading-relaxed font-medium"
          >
            {scene.narrative}
          </motion.p>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {scenes.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-200 ${
                  idx === currentScene ? 'bg-amber-400 w-6' : 'bg-white/30 w-2'
                }`}
              />
            ))}
          </div>
          
          {/* Button - 🚀 Only tap animation */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            className="w-full mt-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl shadow-lg active:brightness-90 transition-all"
          >
            {currentScene < scenes.length - 1 ? `${t('adventureScreen.continueBtn')} →` : `🚀 ${t('adventureScreen.startAdventure')}!`}
          </motion.button>
          
          {/* Skip button */}
          {currentScene < scenes.length - 1 && (
            <button
              onClick={() => {
                localStorage.setItem('sorokid_prologue_seen', 'true');
                onComplete?.();
                onClose();
              }}
              className="w-full mt-2 py-2 text-white/50 text-sm hover:text-white/80 transition-colors"
            >
              {t('adventureScreen.skip')}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===== FLOATING CÚ SORO - WITH STORYTELLING ANIMATIONS =====
function CuSoro({ message, isVisible, onToggle, t }) {
  // Animation states cho cú sinh động hơn
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // Trạng thái thu nhỏ
  const [autoHideProgress, setAutoHideProgress] = useState(100); // Progress bar 100% -> 0%
  const autoHideTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  
  // Tính thời gian hiển thị dựa trên độ dài message
  // ~150ms per character, minimum 6s, maximum 15s
  const calculateDisplayTime = (msg) => {
    if (!msg) return 6000;
    const charCount = msg.length;
    // ~40 words per minute reading speed for Vietnamese (slower, more comfortable)
    // Add base time + time per character
    const baseTime = 4000; // 4 giây cơ bản
    const timePerChar = 120; // 120ms mỗi ký tự (tăng từ 80ms)
    const calculatedTime = baseTime + (charCount * timePerChar);
    return Math.min(Math.max(calculatedTime, 6000), 15000); // Min 6s, Max 15s
  };
  
  // Auto-hide sau khi đủ thời gian đọc
  useEffect(() => {
    // Clear previous timers
    if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    if (message && isVisible) {
      const displayTime = calculateDisplayTime(message);
      const intervalStep = 100; // Update progress mỗi 100ms
      const decrementPerStep = (100 * intervalStep) / displayTime;
      
      // Reset progress
      setAutoHideProgress(100);
      
      // Progress bar animation
      progressIntervalRef.current = setInterval(() => {
        setAutoHideProgress(prev => {
          const next = prev - decrementPerStep;
          return next > 0 ? next : 0;
        });
      }, intervalStep);
      
      // Auto hide sau khi hết thời gian
      autoHideTimerRef.current = setTimeout(() => {
        onToggle(); // Thu lại
        clearInterval(progressIntervalRef.current);
      }, displayTime);
    } else {
      setAutoHideProgress(100);
    }
    
    return () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [message, isVisible]);
  
  // Cú chớp mắt ngẫu nhiên
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);
  
  // Cú vẫy tay khi có message mới
  useEffect(() => {
    if (message && isVisible) {
      setIsWaving(true);
      setIsMinimized(false); // Tự động mở rộng khi có message mới
      const timer = setTimeout(() => setIsWaving(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [message, isVisible]);

  // Toggle minimize state
  const handleMinimize = (e) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };
  
  // Khi minimize thì hiện icon nhỏ ở góc
  if (isMinimized) {
    return (
      <motion.button
        className="fixed bottom-3 right-3 z-50 w-10 h-10 bg-gradient-to-br from-amber-300 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
        onClick={handleMinimize}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
      >
        <span className="text-lg">🦉</span>
        {/* Badge khi có message chưa đọc */}
        {message && (
          <motion.div 
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <span className="text-white text-[8px] font-bold">!</span>
          </motion.div>
        )}
      </motion.button>
    );
  }
  
  return (
    <motion.div
      className="fixed bottom-4 right-3 xs:bottom-6 xs:right-4 sm:bottom-8 sm:right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 }}
    >
      {/* Speech bubble - Bong bóng thoại đơn giản, sạch sẽ */}
      <AnimatePresence>
        {isVisible && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={() => onToggle()}
            className="absolute bottom-16 xs:bottom-20 sm:bottom-24 right-0 w-52 xs:w-60 sm:w-72 cursor-pointer"
          >
            {/* Main bubble */}
            <div 
              className="relative bg-gradient-to-br from-white to-amber-50 rounded-2xl xs:rounded-3xl p-2.5 xs:p-3 sm:p-4 hover:from-amber-50 hover:to-orange-50 transition-all"
              style={{
                boxShadow: '0 4px 20px rgba(251, 191, 36, 0.25), 0 2px 8px rgba(0,0,0,0.1)',
                border: '2px solid #fcd34d'
              }}
            >
              {/* Progress bar */}
              <div className="absolute top-1.5 xs:top-2 left-2.5 right-2.5 xs:left-3 xs:right-3 sm:left-4 sm:right-4 h-1 xs:h-1.5 bg-amber-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                  style={{ width: `${autoHideProgress}%` }}
                />
              </div>
              
              {/* Message */}
              <p className="text-gray-700 text-xs xs:text-sm sm:text-base font-medium leading-relaxed mt-1.5 xs:mt-2">
                {message}
              </p>
              
              {/* Footer */}
              <div className="flex items-center justify-between mt-1.5 xs:mt-2 sm:mt-3 text-[10px] xs:text-xs text-gray-400">
                <span>👆 {t('adventureScreen.tapToClose')}</span>
                <span className="text-amber-600 font-bold">🦉 {t('adventureScreen.cuSoro')}</span>
              </div>
            </div>
            
            {/* Tail - Đuôi bong bóng kiểu comic với 3 hình tròn - dịch sang trái để không bị Cú che */}
            <div className="absolute -bottom-2 right-12 xs:right-14 sm:right-16 flex items-end gap-1">
              <motion.div 
                className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-white to-amber-50 rounded-full"
                style={{ 
                  boxShadow: '0 2px 6px rgba(251, 191, 36, 0.3)',
                  border: '2px solid #fcd34d'
                }}
                animate={{ y: [0, -1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div 
                className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-white to-amber-50 rounded-full -mb-1"
                style={{ 
                  boxShadow: '0 2px 4px rgba(251, 191, 36, 0.3)',
                  border: '2px solid #fcd34d'
                }}
                animate={{ y: [0, -1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
              />
              <motion.div 
                className="w-1.5 h-1.5 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-gradient-to-br from-white to-amber-50 rounded-full -mb-2"
                style={{ 
                  boxShadow: '0 1px 3px rgba(251, 191, 36, 0.3)',
                  border: '1.5px solid #fcd34d'
                }}
                animate={{ y: [0, -1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Cú character với animations sinh động */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        animate={isWaving ? { rotate: [0, -5, 5, -5, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Nút minimize - ẩn cú để xem nội dung */}
        <motion.button
          onClick={handleMinimize}
          className="absolute -top-1 -left-1 w-5 h-5 xs:w-6 xs:h-6 bg-gray-700/80 hover:bg-gray-600 rounded-full flex items-center justify-center z-10 shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={t('adventureScreen.minimizeSoro')}
        >
          <span className="text-white text-[10px] xs:text-xs">✕</span>
        </motion.button>
        
        {/* Glow effect */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '130%', height: '130%', left: '-15%', top: '-15%' }}
        />
        
        {/* Main body - nhỏ hơn trên mobile */}
        <motion.button
          onClick={onToggle}
          className="relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl border-3 border-white"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Cú emoji với hiệu ứng chớp mắt */}
          <span className="text-2xl xs:text-3xl sm:text-4xl" style={{ filter: isBlinking ? 'brightness(0.8)' : 'none' }}>
            🦉
          </span>
        </motion.button>
        
        {/* Name tag */}
        <div className="absolute -bottom-5 xs:-bottom-6 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] xs:text-[9px] sm:text-[10px] font-bold px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full shadow-lg whitespace-nowrap">
            {message && !isVisible ? `👆 ${t('adventureScreen.readMessage')}` : t('adventureScreen.cuSoro')}
          </span>
        </div>
        
        {/* Notification badge - khi có message nhưng đang ẩn */}
        {message && !isVisible && (
          <motion.div 
            className="absolute -top-1 -right-1 w-5 h-5 xs:w-6 xs:h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <span className="text-white text-[10px] xs:text-xs font-bold">!</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ===== STAGE NODE - OPTIMIZED =====
// 🚀 PERF: memo để tránh re-render khi parent render nhưng props không đổi
const StageNode = memo(function StageNode({ stage, status, onClick, index, t }) {
  const isLocked = status === 'locked';
  const isCurrent = status === 'current';
  const isCompleted = status === 'completed';
  const isBoss = stage.type === 'boss';
  const isTreasure = stage.type === 'treasure';
  // 🆕 Phân biệt boss practice và boss compete (đấu trường)
  const isCompeteBoss = isBoss && stage.bossType === 'compete';
  const isPracticeBoss = isBoss && stage.bossType === 'practice';
  
  // Màu sắc tươi sáng - ngay cả locked cũng có màu pastel
  const getStyle = () => {
    if (isCurrent) return {
      bg: 'from-yellow-300 to-orange-400',
      shadow: 'shadow-yellow-400/60',
      iconBg: 'bg-orange-500',
      glow: true
    };
    if (isCompleted) return {
      bg: 'from-emerald-300 to-green-500',
      shadow: 'shadow-emerald-400/60',
      iconBg: 'bg-emerald-600',
      glow: false
    };
    // 🆕 Đấu trường (compete) - màu tím khi thắng, xám khi chưa thắng
    if (isCompeteBoss) return {
      bg: isLocked ? 'from-gray-400 to-gray-500' : 'from-purple-500 to-indigo-600',
      shadow: isLocked ? 'shadow-gray-400/40' : 'shadow-purple-400/40',
      iconBg: isLocked ? 'bg-gray-500' : 'bg-purple-700',
      glow: false
    };
    // 🆕 Boss luyện tập (practice) - màu đỏ/cam khi thắng, xám khi chưa thắng
    if (isPracticeBoss) return {
      bg: isLocked ? 'from-gray-400 to-gray-500' : 'from-orange-500 to-red-600',
      shadow: isLocked ? 'shadow-gray-400/40' : 'shadow-orange-400/40',
      iconBg: isLocked ? 'bg-gray-500' : 'bg-red-600',
      glow: false
    };
    if (isBoss) return {
      bg: isLocked ? 'from-gray-400 to-gray-500' : 'from-rose-400 to-red-500',
      shadow: isLocked ? 'shadow-gray-400/40' : 'shadow-rose-400/40',
      iconBg: isLocked ? 'bg-gray-500' : 'bg-rose-600',
      glow: false
    };
    if (isTreasure) return {
      bg: isLocked ? 'from-amber-200 to-amber-300' : 'from-amber-400 to-yellow-500',
      shadow: 'shadow-amber-400/40',
      iconBg: isLocked ? 'bg-amber-300' : 'bg-amber-600',
      glow: false
    };
    // Locked stages - màu rõ ràng hơn
    if (isLocked) return {
      bg: 'from-slate-400 to-slate-500',
      shadow: 'shadow-slate-400/40',
      iconBg: 'bg-slate-500',
      glow: false
    };
    return {
      bg: 'from-blue-400 to-indigo-500',
      shadow: 'shadow-blue-400/50',
      iconBg: 'bg-blue-600',
      glow: false
    };
  };
  
  // 🆕 Icon cho từng loại boss
  const getBossIcon = () => {
    if (isCompeteBoss) {
      // Đấu trường: Rồng
      return isLocked ? '🐲' : '🐉';
    }
    if (isPracticeBoss) {
      // Boss luyện tập: Ninja / Quái vật
      return isLocked ? '🥷' : '👹';
    }
    // Fallback cho boss không xác định
    return isLocked ? '🐲' : '👹';
  };
  
  const style = getStyle();
  // Size is controlled by CSS responsive classes
  
  return (
    <motion.div
      className="flex flex-col items-center relative group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.03, duration: 0.2, ease: 'easeOut' }} // 🚀 Faster stagger, no spring
    >
      {/* Current indicator - bouncing arrow - 🚀 CSS animation instead - LARGER for mobile */}
      {isCurrent && (
        <div className="absolute -top-10 xs:-top-12 sm:-top-14 md:-top-16 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="flex items-center justify-center gap-1 px-3 xs:px-3.5 sm:px-4 md:px-5 py-1.5 xs:py-2 sm:py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg border-2 border-white whitespace-nowrap">
            <span className="text-sm xs:text-base sm:text-lg md:text-xl">🎮</span>
            <span className="text-xs xs:text-sm sm:text-base md:text-lg font-black text-white tracking-tight">{t('adventureScreen.play')}</span>
          </div>
          <div className="w-0 h-0 border-l-6 xs:border-l-7 sm:border-l-8 md:border-l-10 border-r-6 xs:border-r-7 sm:border-r-8 md:border-r-10 border-t-6 xs:border-t-7 sm:border-t-8 md:border-t-10 border-transparent border-t-orange-500 mx-auto" />
        </div>
      )}
      
      {/* 🚀 Glow effect for current - SIMPLIFIED to 1 layer with CSS - LARGER for mobile */}
      {style.glow && (
        <div className="absolute rounded-full bg-yellow-400/50 -inset-3 xs:-inset-4 sm:-inset-5 animate-pulse" />
      )}
      
      {/* Main button - Responsive w/h for all screen sizes - LARGER for mobile */}
      <motion.button
        onClick={() => onClick(stage)}
        whileTap={{ scale: 0.95 }} // 🚀 Removed whileHover rotate animation
        className={`
          relative rounded-full bg-gradient-to-br ${style.bg}
          ${isBoss || isTreasure 
            ? 'w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24' 
            : 'w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20'}
          shadow-xl ${style.shadow}
          flex items-center justify-center
          border-2 sm:border-3 md:border-4 ${isLocked ? 'border-white/50' : 'border-white'}
          cursor-pointer
          hover:scale-110 active:scale-95 transition-transform duration-150
        `}
      >
        {/* Shine effect */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/50 via-white/20 to-transparent" />
        
        {/* Icon - 🚀 Removed infinite animations, only current has subtle animation - LARGER for mobile */}
        <span className={`relative ${isBoss || isTreasure ? 'text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl' : 'text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl'} ${isLocked ? 'opacity-80' : ''} ${isCurrent ? 'animate-pulse' : ''}`}>
          {isLocked 
            ? (isBoss ? getBossIcon() : isTreasure ? '🎁' : '❓') 
            : (isBoss ? getBossIcon() : stage.icon)
          }
        </span>
        
        {/* Number badge - Responsive for all screens - LARGER for mobile */}
        <div className={`absolute -top-0.5 xs:-top-1 sm:-top-1 -left-0.5 xs:-left-1 sm:-left-1 w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${style.iconBg} rounded-full flex items-center justify-center border-2 border-white shadow-lg`}>
          <span className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-black text-white drop-shadow">{index + 1}</span>
        </div>
        
        {/* 🚀 Completed star - SIMPLIFIED: removed confetti particles - LARGER for mobile */}
        {isCompleted && (
          <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            <span className="text-[10px] xs:text-xs sm:text-sm md:text-base">⭐</span>
          </div>
        )}
      </motion.button>
      
      {/* Name - Hiển thị đầy đủ, không cắt - LARGER for mobile */}
      <p className={`mt-1.5 xs:mt-2 sm:mt-2.5 md:mt-3 text-[10px] xs:text-xs sm:text-sm md:text-base font-bold text-center leading-tight drop-shadow-md ${
        isLocked ? 'text-white/70' : isCurrent ? 'text-yellow-200' : 'text-white'
      }`}
      style={{ 
        maxWidth: 120, // Tăng từ 110 lên 120 để tên stage dài không bị cắt
        wordBreak: 'break-word', // Cho phép xuống dòng khi cần
        whiteSpace: 'normal',
        hyphens: 'auto'
      }}
      >
        {stage.name}
      </p>
    </motion.div>
  );
});

// ===== PATH DOTS - Đường nối các màn =====
// 🚀 PERF: memo để tránh re-render không cần thiết
const PathDots = memo(function PathDots({ direction, isCompleted, isReversed = false }) {
  const dotColor = isCompleted ? 'bg-emerald-400 shadow-emerald-400/50 shadow-md' : 'bg-white/50';
  const arrowColor = isCompleted ? 'text-emerald-400' : 'text-white/50';
  
  if (direction === 'vertical') {
    // Vertical: 3 dots + arrow xuống - LARGER for mobile
    return (
      <div className="flex flex-col items-center justify-center py-0.5 gap-0.5 xs:gap-1 sm:gap-1.5">
        {[...Array(3)].map((_, i) => (
          <motion.div 
            key={i} 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08, duration: 0.2 }}
            className={`w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 rounded-full ${dotColor}`}
          />
        ))}
        {/* Mũi tên xuống */}
        <motion.span 
          className={`text-sm xs:text-base sm:text-lg font-bold ${arrowColor}`}
          animate={{ y: [0, 2, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ↓
        </motion.span>
      </div>
    );
  }
  
  // Horizontal: mũi tên theo hướng hiển thị trên màn hình
  // Hàng bình thường (1,2,3): sang phải › (mũi tên ở cuối)
  // Hàng reversed (6,5,4 trên màn hình): sang trái ‹ (mũi tên ở đầu, vì đường đi thực là 4→5→6)
  return (
    <div className="flex items-center justify-center px-[2px] xs:px-0.5 sm:px-1 gap-[2px] xs:gap-0.5 sm:gap-1">
      {/* Mũi tên ở đầu khi reversed (chỉ về trái) */}
      {isReversed && (
        <motion.span 
          className={`text-[10px] xs:text-xs sm:text-sm font-bold ${arrowColor}`}
          animate={{ x: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ‹
        </motion.span>
      )}
      {[...Array(3)].map((_, i) => (
        <motion.div 
          key={i} 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.08, duration: 0.2 }}
          className={`w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 rounded-full ${dotColor}`}
        />
      ))}
      {/* Mũi tên ở cuối khi không reversed (chỉ về phải) */}
      {!isReversed && (
        <motion.span 
          className={`text-[10px] xs:text-xs sm:text-sm font-bold ${arrowColor}`}
          animate={{ x: [0, 2, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ›
        </motion.span>
      )}
    </div>
  );
});

// ===== ZONE TABS - Với scroll indicator, auto-scroll và drag to scroll =====
function ZoneTabs({ zones, activeZoneId, onSelect, zoneProgress }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  // Drag to scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const hasDraggedRef = useRef(false); // Track if actually dragged (moved more than 5px)
  
  // Check scroll position
  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);
  
  // Auto-scroll to active tab on mount
  useEffect(() => {
    checkScroll();
    const activeIndex = zones.findIndex(z => z.zoneId === activeZoneId);
    if (activeIndex > 0 && scrollRef.current) {
      const buttons = scrollRef.current.querySelectorAll('button');
      if (buttons[activeIndex]) {
        buttons[activeIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeZoneId, zones, checkScroll]);
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
    }
  };
  
  // Drag handlers for mouse
  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = 'grabbing';
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
  };
  
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollRef.current) {
        scrollRef.current.style.cursor = 'grab';
      }
    }
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    // Mark as dragged if moved more than 5px
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  
  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  const handleTouchMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  
  // Handle zone click - only if not dragged
  const handleZoneClick = (zoneId) => {
    if (!hasDraggedRef.current) {
      onSelect(zoneId);
    }
  };
  
  return (
    <div className="relative px-2 sm:px-4">
      {/* Left scroll arrow - 🚀 SIMPLIFIED: CSS transition only */}
      <AnimatePresence>
        {showLeftArrow && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <span className="text-indigo-600 font-bold text-sm xs:text-base">‹</span>
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Scrollable tabs - with drag to scroll */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className="overflow-x-auto pb-2 xs:pb-3 px-4 xs:px-6 scrollbar-hide scroll-smooth cursor-grab select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-1.5 xs:gap-2 sm:gap-3 min-w-max">
          {zones.map((zone, idx) => {
            const isActive = zone.zoneId === activeZoneId;
            const progress = zoneProgress[zone.zoneId] || { completed: 0, total: 0, percent: 0 };
            const isComplete = progress.percent === 100;
            
            return (
              // 🚀 SIMPLIFIED: Only tap animation, CSS hover
              <motion.button
                key={zone.zoneId}
                onClick={() => handleZoneClick(zone.zoneId)}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex-shrink-0 px-3 xs:px-4 sm:px-5 py-2.5 xs:py-3 sm:py-3.5 rounded-xl xs:rounded-2xl font-bold text-xs xs:text-sm sm:text-base 
                  flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 transition-all duration-150 whitespace-nowrap border-2
                  hover:scale-[1.02] active:scale-[0.98]
                  ${isActive 
                    ? 'bg-white text-indigo-600 shadow-xl shadow-white/40 border-yellow-400 scale-105' 
                    : 'bg-white/25 text-white hover:bg-white/35 border-white/40'
                  }
                `}
              >
                {/* Icon + Tên zone */}
                <span className="text-base xs:text-lg sm:text-xl">{zone.icon}</span>
                <span className="font-bold">{zone.name}</span>
                {/* Progress badge */}
                <div className={`
                  px-2 py-0.5 xs:px-2.5 xs:py-1 sm:px-3 sm:py-1 rounded-full text-[10px] xs:text-xs sm:text-sm font-black
                  ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-white/30 text-white'}
                `}>
                  {progress.completed}/{progress.total}
                </div>
                {/* 🚀 SIMPLIFIED: Static star instead of animated */}
                {isComplete && (
                  <span className="text-sm xs:text-base sm:text-lg">⭐</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* Right scroll arrow - 🚀 SIMPLIFIED: CSS transition only */}
      <AnimatePresence>
        {showRightArrow && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <span className="text-indigo-600 font-bold text-sm xs:text-base">›</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== STAGE GRID - Responsive =====
function StageGrid({ stages, stageStatuses, onStageClick, t }) {
  const rows = [];
  for (let i = 0; i < stages.length; i += 3) {
    rows.push(stages.slice(i, i + 3));
  }
  
  // Component invisible spacer - giữ chỗ để layout zigzag hoạt động đúng - LARGER for mobile
  const InvisibleSpacer = ({ withDots = false }) => (
    <div className="flex flex-col items-center">
      <div className="flex items-center">
        {/* Spacer có cùng kích thước với StageNode - UPDATED to match new sizes */}
        <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 opacity-0" />
        {withDots && <div className="px-1 sm:px-1.5 w-10 xs:w-12 sm:w-14 md:w-16 opacity-0" />}
      </div>
    </div>
  );
  
  return (
    // pb-24 xs:pb-28 để tạo khoảng trống cho Cú Soro ở góc dưới phải không che stages
    <div className="flex flex-col items-center gap-0.5 xs:gap-1 sm:gap-1.5 md:gap-2 py-2 xs:py-3 sm:py-4 md:py-6 pb-24 xs:pb-28 sm:pb-20">
      {rows.map((row, rowIdx) => {
        const isReversed = rowIdx % 2 === 1;
        const isLastRow = rowIdx === rows.length - 1;
        const isFirstRow = rowIdx === 0;
        
        // Stage cuối hàng (trước khi reverse) để check completed cho vertical dots
        const lastStageInRow = row[row.length - 1];
        const lastStageCompleted = stageStatuses[lastStageInRow?.stageId] === 'completed';
        
        // Tính số spacers cần thêm để giữ vị trí zigzag
        const spacersNeeded = 3 - row.length;
        
        // Tạo display row với spacers
        // - Hàng không reversed: thêm spacers ở cuối (stages ở trái)
        // - Hàng reversed: thêm spacers ở đầu (trong displayRow, sau khi reverse)
        //   Vì reversed nên spacers ở đầu displayRow = ở cuối của row gốc về mặt hiển thị
        //   Để stage đầu logic (4,5...) ở bên phải, cần thêm spacers vào đầu displayRow
        const displayRow = isReversed ? [...row].reverse() : row;
        
        // Tính vị trí stage cuối logic (để đặt vertical dots)
        // Khi không reversed: stage cuối ở vị trí row.length - 1
        // Khi reversed: stage cuối ở vị trí 0 của displayRow (sau spacers nếu có)
        const lastStageDisplayIndex = isReversed ? spacersNeeded : row.length - 1;
        
        // Tính vị trí stage đầu logic của hàng TIẾP THEO (để biết vertical dots chỉ đi đâu)
        // Hàng tiếp theo: nếu hàng này không reversed → hàng sau reversed → stage đầu ở bên phải
        //                 nếu hàng này reversed → hàng sau không reversed → stage đầu ở bên trái
        // Vertical dots cần được đặt ở vị trí tương ứng
        
        return (
          <div key={rowIdx} className="flex flex-col items-center">
            {/* Row của stages */}
            <div className="flex items-start justify-center">
              {/* Thêm spacers ở đầu cho hàng reversed (để stage đầu logic ở bên phải) */}
              {isReversed && spacersNeeded > 0 && [...Array(spacersNeeded)].map((_, i) => (
                <InvisibleSpacer key={`spacer-start-${i}`} withDots={i < spacersNeeded - 1} />
              ))}
              
              {displayRow.map((stage, colIdx) => {
                // Tính index thực trong display (bao gồm spacers)
                const displayIdx = isReversed ? spacersNeeded + colIdx : colIdx;
                const actualIndex = rowIdx * 3 + (isReversed ? row.length - 1 - colIdx : colIdx);
                const status = stageStatuses[stage.stageId] || 'locked';
                const isLastInDisplayRow = colIdx === displayRow.length - 1;
                const currentCompleted = status === 'completed';
                
                // Stage cuối logic: ở vị trí lastStageDisplayIndex
                const isLastLogicalStage = displayIdx === lastStageDisplayIndex;
                
                // Kiểm tra có cần hiện dots ngang không
                // - Không hiện nếu là stage cuối trong displayRow VÀ không có spacers sau
                const hasMoreAfter = !isLastInDisplayRow || (!isReversed && spacersNeeded > 0);
                const showHorizontalDots = !isLastInDisplayRow;
                
                return (
                  <div key={stage.stageId} className="flex flex-col items-center">
                    <div className="flex items-center">
                      <StageNode stage={stage} status={status} onClick={onStageClick} index={actualIndex} t={t} />
                      {showHorizontalDots && <PathDots direction="horizontal" isCompleted={currentCompleted} isReversed={isReversed} />}
                    </div>
                    {/* Vertical dots - đặt ngay dưới stage cuối logic của hàng */}
                    {!isLastRow && isLastLogicalStage && (
                      <PathDots direction="vertical" isCompleted={lastStageCompleted} />
                    )}
                  </div>
                );
              })}
              
              {/* Thêm spacers ở cuối cho hàng không reversed */}
              {!isReversed && spacersNeeded > 0 && [...Array(spacersNeeded)].map((_, i) => (
                <InvisibleSpacer key={`spacer-end-${i}`} withDots={false} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===== STAGE MODAL - Responsive & OPTIMIZED =====
function StageModal({ stage, status, onClose, onStart, t }) {
  if (!stage) return null;
  const isBoss = stage.type === 'boss';
  const isTreasure = stage.type === 'treasure';
  const isLocked = status === 'locked';
  // 🆕 Phân biệt boss types
  const isCompeteBoss = isBoss && stage.bossType === 'compete';
  const isPracticeBoss = isBoss && stage.bossType === 'practice';
  
  // 🆕 Icon cho modal
  const getModalIcon = () => {
    if (isCompeteBoss) return isLocked ? '🐲' : '🐉';  // Rồng
    if (isPracticeBoss) return isLocked ? '🥷' : '👹';  // Ninja/Quái vật
    return stage.icon;
  };
  
  // 🆕 Màu gradient cho modal header
  const getHeaderGradient = () => {
    if (isCompeteBoss) return 'from-purple-500 to-indigo-600';
    if (isPracticeBoss) return 'from-orange-500 to-red-600';
    if (isBoss) return 'from-rose-500 to-red-600';
    if (isTreasure) return 'from-purple-500 to-violet-600';
    if (status === 'completed') return 'from-emerald-500 to-green-600';
    return 'from-blue-500 to-indigo-600';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }} // 🚀 Faster fade
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
    >
      {/* Background confetti - REDUCED to 6 particles, simpler animation */}
      {status === 'completed' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: ['#fbbf24', '#f472b6', '#4ade80', '#60a5fa', '#a78bfa'][i % 5],
                left: `${15 + i * 14}%`,
                top: '-10px'
              }}
              animate={{ y: [0, 600], opacity: [1, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'linear' // 🚀 Linear = less CPU
              }}
            />
          ))}
        </div>
      )}
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }} // 🚀 Snappy overshoot easing
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[320px] sm:max-w-sm bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative border-3 border-yellow-400"
      >
        {/* 🚀 REMOVED: Rainbow border animation - replaced with static border */}
        
        {/* Inner content */}
        <div className="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className={`p-4 sm:p-6 bg-gradient-to-br ${getHeaderGradient()} relative overflow-hidden`}>
            {/* 🚀 REMOVED: Sparkles in header - too many animations */}
            
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} // 🚀 Simpler: only scale, no rotate
              transition={{ duration: 1.5, repeat: Infinity }} 
              className="text-4xl sm:text-6xl text-center mb-1 sm:mb-2 relative z-10"
            >
              {getModalIcon()}
            </motion.div>
            <h3 className="text-lg sm:text-xl font-black text-white text-center relative z-10">{stage.name}</h3>
            {status === 'completed' && (
              <p className="text-white/80 text-center text-sm mt-1 relative z-10">
                ⭐ {t('adventureScreen.stageCompleted')} ⭐
              </p>
            )}
            {isLocked && (
              <p className="text-white/90 text-center text-sm mt-1 relative z-10">
                🔒 {t('adventureScreen.stageLocked')}
              </p>
            )}
          </div>
          
          <div className="p-4 sm:p-6">
            {isLocked ? (
              <>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                  <p className="text-amber-700 text-center font-medium text-sm sm:text-base">
                    <span className="text-lg sm:text-xl block mb-1 sm:mb-2">💡</span>
                    {t('adventureScreen.completeToUnlock')}
                  </p>
                </div>
                <motion.button 
                  onClick={onClose} 
                  whileTap={{ scale: 0.97 }} // 🚀 Only tap feedback, no hover
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-lg text-sm sm:text-base active:brightness-90 transition-all"
                >
                  {t('adventureScreen.understood')} 👍
                </motion.button>
              </>
            ) : (
              <>
                <p className="text-gray-600 text-center mb-4 sm:mb-6 text-sm sm:text-base">{stage.description}</p>
                <div className="flex gap-2 sm:gap-3">
                  <motion.button 
                    onClick={onClose} 
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-2.5 sm:py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm sm:text-base active:bg-gray-200 transition-colors"
                  >
                    {t('adventureScreen.tapToClose')}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onStart}
                    className={`flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-white shadow-lg relative overflow-hidden text-sm sm:text-base active:brightness-90 transition-all ${
                      status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    }`}
                  >
                    {/* 🚀 REMOVED: Shimmer effect - too heavy */}
                    <span className="relative z-10">
                      {status === 'completed' ? `🔄 ${t('adventureScreen.playAgain')}` : `▶️ ${t('adventureScreen.play')}`}
                    </span>
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===== HEADER - Giống hệt TopBar Dashboard =====
function GameHeader({ totalStages, completedStages, userStats, session, t }) {
  const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showDropdown]);

  // Tính số ngày dùng thử còn lại
  const getTrialDaysLeft = () => {
    if (!userStats?.trialExpiresAt) return 0;
    const now = new Date();
    const trialEnd = new Date(userStats.trialExpiresAt);
    const diffTime = trialEnd - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const trialDays = getTrialDaysLeft();
  const tier = userStats?.tier || 'free';

  // Helper to parse avatar index from database
  const getAvatarIndex = () => {
    if (!userStats?.avatar) return null;
    const parsed = parseInt(userStats.avatar, 10);
    return isNaN(parsed) ? null : parsed;
  };

  // Tier badge component giống TopBar
  const getTierBadge = () => {
    switch (tier) {
      case 'vip':
        return (
          <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full">
            👑 VIP
          </span>
        );
      case 'premium':
      case 'advanced':
      case 'nangcao':
        return (
          <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold rounded-full">
            ⭐ {t('adventureScreen.advanced')}
          </span>
        );
      case 'basic':
        return (
          <span className="px-2 py-0.5 bg-gradient-to-r from-blue-400 to-cyan-500 text-white text-xs font-bold rounded-full">
            ✓ {t('adventureScreen.basic')}
          </span>
        );
      case 'trial':
        return (
          <span className="px-2 py-0.5 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold rounded-full">
            🔥 {t('adventureScreen.trial')} {trialDays > 0 && `(${trialDays}${t('adventureScreen.days')})`}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-bold rounded-full">
            {t('adventureScreen.free')}
          </span>
        );
    }
  };

  return (
    <>
      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={() => signOut({ callbackUrl: '/' })}
        title={`${t('adventureScreen.logout')}?`}
        message={t('adventureScreen.logoutMessage')}
        confirmText={t('adventureScreen.logout')}
        cancelText={t('adventureScreen.cancel')}
        type="warning"
      />

      <header className="bg-white/90 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Logo - Click để về Dashboard */}
            <LocalizedLink href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <Logo size="md" showText={false} />
              <h1 className="hidden sm:block text-xl font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
                SoroKid
              </h1>
            </LocalizedLink>

            {/* Desktop Stats bar */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {/* Tier Badge Desktop */}
              <LocalizedLink 
                href="/pricing"
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-50 to-pink-50 rounded-xl border border-violet-100 hover:shadow-md transition-all"
              >
                {getTierBadge()}
              </LocalizedLink>

              {/* Streak */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                <span className="text-lg">🔥</span>
                <div className="text-right">
                  <span className="font-bold text-orange-600">{userStats?.streak || 0}</span>
                  <span className="text-xs text-orange-500 ml-1">{t('adventureScreen.days')}</span>
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
                <span className="text-lg">⭐</span>
                <div className="text-right">
                  <span className="font-bold text-yellow-600">{(userStats?.totalStars || 0).toLocaleString()}</span>
                  <span className="text-xs text-yellow-500 ml-1">{t('adventureScreen.stars')}</span>
                </div>
              </div>

              {/* Diamonds */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                <span className="text-lg">💎</span>
                <div className="text-right">
                  <span className="font-bold text-cyan-600">{(userStats?.diamonds || 0).toLocaleString()}</span>
                  <span className="text-xs text-cyan-500 ml-1">{t('adventureScreen.diamonds')}</span>
                </div>
              </div>

              {/* Progress - Desktop */}
              <div className="hidden lg:flex items-center gap-1.5 bg-violet-100 rounded-full px-3 py-1.5">
                <div className="w-20 xl:w-32 h-2 bg-violet-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progress}%` }} 
                  />
                </div>
                <span className="text-violet-700 text-xs font-medium">{progress}%</span>
              </div>
            </div>

            {/* Mobile: Compact Stats Pill + Sound + Avatar + Logout */}
            <div className="flex md:hidden items-center gap-1 xs:gap-1.5 flex-1 justify-end overflow-hidden">
              {/* Progress on mobile - compact */}
              <div className="flex items-center bg-violet-100 rounded-full px-1.5 xs:px-2 py-0.5 xs:py-1">
                <span className="text-[9px] xs:text-[10px] font-bold text-violet-700">{progress}%</span>
              </div>

              {/* Compact stats in one pill - ẩn trên màn hình rất nhỏ */}
              <div className="hidden xs:flex items-center bg-gray-50 rounded-full px-1.5 py-0.5 gap-1.5">
                <span className="flex items-center gap-0.5 text-[10px] xs:text-xs">
                  <span>🔥</span>
                  <span className="font-semibold text-orange-600">{userStats?.streak || 0}</span>
                </span>
                <span className="w-px h-2.5 bg-gray-300"></span>
                <span className="flex items-center gap-0.5 text-[10px] xs:text-xs">
                  <span>⭐</span>
                  <span className="font-semibold text-yellow-600">{(userStats?.totalStars || 0).toLocaleString()}</span>
                </span>
                <span className="w-px h-2.5 bg-gray-300"></span>
                <span className="flex items-center gap-0.5 text-[10px] xs:text-xs">
                  <span>💎</span>
                  <span className="font-semibold text-cyan-600">{(userStats?.diamonds || 0).toLocaleString()}</span>
                </span>
              </div>

              {/* 🔊 Sound Toggle - Mobile */}
              <SoundSettingsPanel compact variant="header" />

              {/* Avatar - direct link to profile page */}
              <LocalizedLink 
                href="/profile"
                className="flex-shrink-0 active:scale-95 transition-transform"
              >
                <MonsterAvatar 
                  seed={session?.user?.id || session?.user?.email || 'default'}
                  avatarIndex={getAvatarIndex()}
                  size={32}
                  className="border-2 border-violet-200"
                  showBorder={false}
                />
              </LocalizedLink>

              {/* Logout shortcut button - nhỏ hơn */}
              <button
                onClick={() => setShowLogoutDialog(true)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-full transition-colors"
                title={t('adventureScreen.logout')}
              >
                <LogOut size={14} className="text-red-500" />
              </button>
            </div>

            {/* Desktop: Sound Toggle + User dropdown */}
            <div className="hidden md:flex items-center gap-3">
              {/* 🔊 Sound Toggle - Desktop */}
              <SoundSettingsPanel compact variant="header" />
              
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <MonsterAvatar 
                    seed={session?.user?.id || session?.user?.email || 'default'}
                    avatarIndex={getAvatarIndex()}
                    size={36}
                    className="border-2 border-violet-200"
                    showBorder={false}
                  />
                  <div className="text-left">
                    <span className="text-sm font-semibold text-gray-800">
                      {userStats?.name || session?.user?.name || 'User'}
                    </span>
                    <div className="text-xs text-gray-500">
                      {userStats?.levelInfo?.icon} {userStats?.levelInfo?.name || `${t('adventureScreen.level')} ${userStats?.level || 1}`}
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop: Dropdown menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <LocalizedLink
                      href="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span>📊</span>
                      <span className="text-gray-700">{t('adventureScreen.dashboard')}</span>
                    </LocalizedLink>
                    <LocalizedLink
                      href="/learn"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span>📚</span>
                      <span className="text-gray-700">{t('adventureScreen.learn')}</span>
                    </LocalizedLink>
                    <LocalizedLink
                      href="/practice"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span>🎯</span>
                      <span className="text-gray-700">{t('adventureScreen.practice')}</span>
                    </LocalizedLink>
                    <LocalizedLink
                      href="/compete"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span>🏆</span>
                      <span className="text-gray-700">{t('adventureScreen.compete')}</span>
                    </LocalizedLink>
                    <hr className="my-2" />
                    <LocalizedLink
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span>👤</span>
                      <span className="text-gray-700">{t('adventureScreen.profile')}</span>
                    </LocalizedLink>
                    {(tier === 'vip' || tier === 'advanced' || tier === 'nangcao') && (
                      <LocalizedLink
                        href="/certificate"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>🏅</span>
                        <span className="text-gray-700">{t('adventureScreen.certificate')}</span>
                      </LocalizedLink>
                    )}
                    <hr className="my-2" />
                    {session?.user?.role === 'admin' && (
                      <LocalizedLink
                        href="/admin"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>⚙️</span>
                        <span className="text-gray-700">{t('adventureScreen.admin')}</span>
                      </LocalizedLink>
                    )}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowLogoutDialog(true);
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600 w-full"
                    >
                      <LogOut size={18} />
                      <span>{t('adventureScreen.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

// ===== ZONE AREA - Chỉ hiển thị UI, swipe đã xử lý ở main component =====
function SwipeableZoneArea({ zones, activeZoneId, activeZone, zoneProgress, activeStages, stageStatuses, onChangeZone, onStageClick, t }) {
  const currentIndex = zones.findIndex(z => z.zoneId === activeZoneId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < zones.length - 1;
  
  if (!activeZone) return null;
  
  return (
    <div className="w-full relative z-10">
    {/* Inner container giới hạn width cho nội dung */}
    <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-2 xs:px-3 sm:px-4 py-2 xs:py-3 sm:py-4">
      {/* Swipe hint indicator - only on mobile/tablet - LARGER for mobile */}
      <div className="flex items-center justify-center gap-2.5 xs:gap-3 mb-2 xs:mb-2.5 md:hidden">
        <motion.button
          onClick={() => hasPrev && onChangeZone(zones[currentIndex - 1].zoneId)}
          disabled={!hasPrev}
          className={`flex items-center gap-1.5 px-3 xs:px-4 py-1.5 xs:py-2 rounded-full text-sm xs:text-base font-semibold transition-all ${
            hasPrev ? 'bg-white/25 text-white active:bg-white/40 shadow-sm' : 'bg-white/10 text-white/30'
          }`}
          whileTap={hasPrev ? { scale: 0.95 } : undefined}
        >
          <span className="text-lg xs:text-xl">‹</span>
          <span className="hidden xs:inline">{t('adventureScreen.prev')}</span>
        </motion.button>
        
        <div className="flex items-center gap-2 xs:gap-2.5">
          {zones.map((zone, idx) => (
            <button
              key={zone.zoneId}
              onClick={() => onChangeZone(zone.zoneId)}
              className={`rounded-full transition-all ${
                idx === currentIndex 
                  ? 'bg-white w-5 xs:w-6 h-2.5 xs:h-3 shadow-sm' 
                  : 'bg-white/40 w-2.5 xs:w-3 h-2.5 xs:h-3 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
        
        <motion.button
          onClick={() => hasNext && onChangeZone(zones[currentIndex + 1].zoneId)}
          disabled={!hasNext}
          className={`flex items-center gap-1.5 px-3 xs:px-4 py-1.5 xs:py-2 rounded-full text-sm xs:text-base font-semibold transition-all ${
            hasNext ? 'bg-white/25 text-white active:bg-white/40 shadow-sm' : 'bg-white/10 text-white/30'
          }`}
          whileTap={hasNext ? { scale: 0.95 } : undefined}
        >
          <span className="hidden xs:inline">{t('adventureScreen.next')}</span>
          <span className="text-lg xs:text-xl">›</span>
        </motion.button>
      </div>
      
      {/* Swipe instruction - show once on small screens */}
      <div className="text-center mb-2 xs:mb-2.5 md:hidden">
        <p className="text-white/60 text-xs xs:text-sm font-medium">
          👆 {t('adventureScreen.swipeToChangeZone')}
        </p>
      </div>
      
      {/* Zone Card - More colorful with rainbow border and shimmer */}
      <motion.div
        key={activeZoneId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-2xl xs:rounded-3xl p-[3px] xs:p-1 mb-4 xs:mb-5 sm:mb-6"
      >
        {/* Animated rainbow border */}
        <motion.div
          className="absolute inset-0 rounded-2xl xs:rounded-3xl"
          style={{
            background: 'linear-gradient(90deg, #f472b6, #fb923c, #facc15, #4ade80, #22d3ee, #a78bfa, #f472b6)',
            backgroundSize: '200% 100%'
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner content */}
        <div className={`rounded-[14px] xs:rounded-[18px] sm:rounded-[20px] p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7 bg-gradient-to-br ${activeZone.color} relative overflow-hidden`}>
          {/* Shimmer overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
          
          <div className="flex items-center gap-2.5 xs:gap-3 sm:gap-4 md:gap-5 relative z-10">
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, 0] }}
              animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/30 rounded-xl xs:rounded-2xl sm:rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0 backdrop-blur-sm"
            >
              <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl">{activeZone.icon}</span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white drop-shadow truncate">{activeZone.name}</h2>
              <p className="text-white/80 text-xs xs:text-sm sm:text-base truncate">{activeZone.subtitle}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <motion.p 
                className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white drop-shadow"
                key={zoneProgress[activeZoneId]?.completed}
                initial={{ scale: 1.5, color: '#fef08a' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.5 }}
              >
                {zoneProgress[activeZoneId]?.completed || 0}/{zoneProgress[activeZoneId]?.total || 0}
              </motion.p>
              <p className="text-white/70 text-[10px] xs:text-xs sm:text-sm">{t('adventureScreen.completed')}</p>
            </div>
          </div>
          <div className="mt-2.5 xs:mt-3 sm:mt-4 md:mt-5 h-2 xs:h-2.5 sm:h-3 md:h-4 bg-white/40 rounded-full overflow-hidden relative z-10 shadow-inner">
            <motion.div
              className="h-full bg-white rounded-full shadow-md relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${zoneProgress[activeZoneId]?.percent || 0}%` }}
              transition={{ duration: 0.5 }}
            >
              {/* Progress bar shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/60 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      <StageGrid stages={activeStages} stageStatuses={stageStatuses} onStageClick={onStageClick} t={t} />
    </div>
    {/* Close outer swipe wrapper */}
    </div>
  );
}

// ===== MAP SELECTOR - Responsive =====
function MapSelector({ currentMap, onSelect, hasCertAddSub }) {
  return (
    <div className="flex justify-center gap-2 xs:gap-3 sm:gap-4 mb-2.5 xs:mb-3 sm:mb-4 px-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect('addsub')}
        className={`px-3 xs:px-4 sm:px-5 md:px-6 py-2 xs:py-2.5 sm:py-3 rounded-xl xs:rounded-2xl sm:rounded-2xl font-bold text-xs xs:text-sm sm:text-base flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 transition-all ${
          currentMap === 'addsub'
            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-400/30'
            : 'bg-white/10 text-white/70 hover:bg-white/20'
        }`}
      >
        <span className="text-base xs:text-lg sm:text-xl">➕➖</span>
        <span>Cộng Trừ</span>
      </motion.button>
      
      <motion.button
        whileHover={hasCertAddSub ? { scale: 1.05 } : undefined}
        whileTap={hasCertAddSub ? { scale: 0.95 } : undefined}
        onClick={() => hasCertAddSub && onSelect('muldiv')}
        disabled={!hasCertAddSub}
        className={`px-3 xs:px-4 sm:px-5 md:px-6 py-2 xs:py-2.5 sm:py-3 rounded-xl xs:rounded-2xl sm:rounded-2xl font-bold text-xs xs:text-sm sm:text-base flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 transition-all ${
          currentMap === 'muldiv'
            ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-400/30'
            : !hasCertAddSub
              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
        }`}
      >
        <span className="text-base xs:text-lg sm:text-xl">✖️➗</span>
        <span>Nhân Chia</span>
        {!hasCertAddSub && <span className="text-xs xs:text-sm sm:text-base">🔒</span>}
      </motion.button>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function GameMapNew({
  addSubStages = [],
  addSubZones = [],
  mulDivStages = [],
  mulDivZones = [],
  stageStatuses = {},
  hasCertAddSub = false,
  hasCertComplete = false,
  onStageClick,
  onTierCheck, // 🔒 Callback để check tier trước khi mở modal - return true nếu OK, false nếu cần upgrade
  isLoading = false,
  userStats = null,
  returnZone = null
}) {
  const router = useRouter();
  const localizeUrl = useLocalizedUrl();
  const { data: session } = useSession();
  const { play, playMusic, stopMusic, changeTheme } = useGameSound();
  const { t } = useI18n();

  // Khởi tạo map và zone từ returnZone nếu có
  const [currentMap, setCurrentMap] = useState(() => {
    if (returnZone?.mapType) {
      return returnZone.mapType;
    }
    return 'addsub';
  });
  const [activeZoneId, setActiveZoneIdState] = useState(() => {
    if (returnZone?.zoneId) {
      return returnZone.zoneId;
    }
    return null;
  });
  
  // 🔊 Wrapper để play sound khi zone thay đổi
  const setActiveZoneId = useCallback((zoneId) => {
    setActiveZoneIdState(prev => {
      if (prev !== zoneId && prev !== null) {
        play('stageSelect'); // Play click sound when changing zones
      }
      return zoneId;
    });
  }, [play]);
  
  const [selectedStage, setSelectedStage] = useState(null);
  const [cuSoroMessage, setCuSoroMessage] = useState('');
  const [cuSoroVisible, setCuSoroVisible] = useState(false); // Mặc định ẩn, chỉ hiện khi có message mới
  
  // 🦉 State cho Prologue (màn intro)
  const [showPrologue, setShowPrologue] = useState(false);
  
  // 🏆 State cho Treasure Chest Reveal
  const [showTreasureReveal, setShowTreasureReveal] = useState(false);
  const [treasureCertType, setTreasureCertType] = useState('addsub'); // 'addsub' | 'complete'
  
  // 🎉 State cho Reward Effects
  const [showRewardEffect, setShowRewardEffect] = useState(false);
  const [rewardType, setRewardType] = useState('complete'); // 'complete' | 'star' | 'coin' | 'levelUp'
  const [rewardStars, setRewardStars] = useState(0);
  const [rewardMessage, setRewardMessage] = useState('');
  
  // 🏆 State cho Zone Complete Celebration
  const [showZoneCelebration, setShowZoneCelebration] = useState(false);
  const [celebrationZone, setCelebrationZone] = useState(null);
  
  // 📖 State cho Zone Intro Dialog  
  const [showZoneIntro, setShowZoneIntro] = useState(false);
  const [introZone, setIntroZone] = useState(null);
  
  // 🔒 State cho Zone Locked Dialog (khi zone trước chưa hoàn thành)
  const [showZoneLocked, setShowZoneLocked] = useState(false);
  const [lockedZoneInfo, setLockedZoneInfo] = useState(null); // { currentZone, prevZone, prevProgress }

  // 🚀 PERF: useMemo để tránh re-create arrays mỗi render
  const stages = useMemo(() =>
    currentMap === 'addsub' ? addSubStages : mulDivStages,
    [currentMap, addSubStages, mulDivStages]
  );
  const zones = useMemo(() =>
    currentMap === 'addsub' ? addSubZones : mulDivZones,
    [currentMap, addSubZones, mulDivZones]
  );
  
  // 🔊 Initialize sound system (background music disabled)
  useEffect(() => {
    initSoundSystem();
    // Background music disabled - chỉ giữ sound effects
  }, []);

  // 🦉 Kiểm tra xem người dùng đã xem prologue chưa
  useEffect(() => {
    const prologueSeen = localStorage.getItem('sorokid_prologue_seen');
    if (!prologueSeen && !isLoading) {
      // Delay một chút để UX mượt hơn
      const timer = setTimeout(() => {
        setShowPrologue(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // 🎯 Reset activeZoneId khi chuyển map
  // QUAN TRỌNG: Nếu có returnZone và đây là lần mount đầu tiên, giữ nguyên zone đã set
  // 🚀 PERF: useRef thay vì useState vì flags này không cần trigger re-render
  const hasInitializedRef = useRef(false);
  const returnZoneAppliedRef = useRef(false);
  
  // 👆 SWIPE TOÀN MÀN HÌNH - Gọi hook ở main component để swipe anywhere
  const { swipeHandlers } = useSwipeZone({ zones, activeZoneId, onChangeZone: setActiveZoneId });

  useEffect(() => {
    if (zones.length === 0) return;

    // Lần mount đầu tiên
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;

      // Nếu có returnZone -> đánh dấu đã apply và giữ nguyên
      if (returnZone?.zoneId) {
        returnZoneAppliedRef.current = true;
        // activeZoneId đã được set từ useState initial value
        return;
      }

      // Không có returnZone -> tìm zone có current stage
      if (!activeZoneId) {
        const currentStage = stages.find(s => stageStatuses[s.stageId] === 'current');
        if (currentStage) {
          setActiveZoneId(currentStage.zoneId);
        } else {
          setActiveZoneId(zones[0].zoneId);
        }
      }
      return;
    }

    // Nếu returnZone vừa được apply và currentMap khớp với returnZone.mapType -> giữ nguyên zone
    if (returnZoneAppliedRef.current && returnZone?.mapType === currentMap) {
      returnZoneAppliedRef.current = false; // Reset flag sau khi đã apply
      return;
    }

    // Các lần sau (khi chuyển map thủ công): reset về zone hiện tại hoặc zone đầu
    const currentStage = stages.find(s => stageStatuses[s.stageId] === 'current');
    if (currentStage) {
      setActiveZoneId(currentStage.zoneId);
    } else {
      setActiveZoneId(zones[0].zoneId);
    }
  }, [currentMap, zones.length]); // Chỉ chạy khi currentMap hoặc zones thay đổi
  
  const zoneProgress = useMemo(() => {
    const progress = {};
    zones.forEach(zone => {
      const zoneStages = stages.filter(s => s.zoneId === zone.zoneId);
      const completed = zoneStages.filter(s => stageStatuses[s.stageId] === 'completed').length;
      progress[zone.zoneId] = {
        completed,
        total: zoneStages.length,
        percent: zoneStages.length > 0 ? Math.round((completed / zoneStages.length) * 100) : 0
      };
    });
    return progress;
  }, [zones, stages, stageStatuses]);
  
  // Effect này chỉ chạy khi stageStatuses thay đổi (không phải khi chuyển map)
  useEffect(() => {
    if (zones.length > 0 && activeZoneId) {
      // Kiểm tra xem activeZoneId có thuộc zones hiện tại không
      const isValidZone = zones.some(z => z.zoneId === activeZoneId);
      if (!isValidZone) {
        // Nếu không hợp lệ, reset về zone đầu tiên
        setActiveZoneId(zones[0].zoneId);
      }
    }
  }, [zones, activeZoneId]);
  
  // 🚀 PERF: useMemo cho activeZone và activeStages
  const activeZone = useMemo(() =>
    zones.find(z => z.zoneId === activeZoneId),
    [zones, activeZoneId]
  );
  const activeStages = useMemo(() =>
    stages.filter(s => s.zoneId === activeZoneId),
    [stages, activeZoneId]
  );
  
  // 🦉 Logic hiển thị lời dẫn Cú Soro theo ngữ cảnh
  // Chỉ TỰ ĐỘNG hiện 1 lần duy nhất cho mỗi zone - lưu vào localStorage
  // User có thể click Cú để xem/ẩn lời thoại bất cứ lúc nào
  
  // Tạo message cho zone hiện tại (chạy mỗi khi zone thay đổi)
  useEffect(() => {
    if (!activeZone) return;
    
    // Xác định chapter index từ zone
    const zoneIndex = zones.findIndex(z => z.zoneId === activeZoneId);
    const chapterIndex = zoneIndex + 1;
    
    // Kiểm tra progress của zone
    const progress = zoneProgress[activeZoneId];
    const isZoneComplete = progress?.percent === 100;
    
    let message = '';
    
    // Tạo message cho zone
    if (isZoneComplete) {
      message = activeZone?.story?.complete || 
                t('adventureScreen.zoneCompleteMsg', { zoneName: activeZone.name });
    } else if (progress?.completed === 0) {
      const chapterNarrative = getChapterNarrative(chapterIndex, 'entering');
      message = chapterNarrative || 
                activeZone?.story?.intro || 
                t('adventureScreen.welcomeToZone', { zoneName: activeZone.name });
    } else {
      message = activeZone?.story?.mission || 
                t('adventureScreen.continueJourney', { zoneName: activeZone.name, remaining: progress.total - progress.completed });
    }
    
    // Luôn cập nhật message để user click Cú có thể xem
    setCuSoroMessage(message);
  }, [activeZoneId, activeZone, zoneProgress, zones]);
  
  // Effect riêng để xử lý tự động hiện - CHỈ chạy khi chuyển zone
  const prevZoneKeyRef = useRef(null);
  const isFirstMountRef = useRef(true); // Track lần mount đầu tiên
  
  useEffect(() => {
    if (!activeZone) return;
    
    const zoneMessageKey = `${currentMap}_${activeZoneId}`;
    const progress = zoneProgress[activeZoneId];
    
    // 🏆 CHECK: Zone hoàn thành 100% và chưa từng xem celebration
    if (progress?.percent === 100) {
      // Đọc localStorage xem đã xem celebration zone này chưa
      let viewedCelebrations = new Set();
      try {
        const saved = localStorage.getItem('sorokid_viewed_zone_celebrations');
        if (saved) viewedCelebrations = new Set(JSON.parse(saved));
      } catch {}
      
      // Nếu CHƯA từng xem celebration → hiện!
      if (!viewedCelebrations.has(zoneMessageKey)) {
        setCelebrationZone(activeZone);
        setShowZoneCelebration(true);
        // Đánh dấu đã xem
        viewedCelebrations.add(zoneMessageKey);
        try {
          localStorage.setItem('sorokid_viewed_zone_celebrations', JSON.stringify([...viewedCelebrations]));
        } catch {}
        return;
      }
    }
    
    // Chỉ xử lý khi THỰC SỰ chuyển sang zone KHÁC
    if (prevZoneKeyRef.current === zoneMessageKey) return;
    
    // 🚫 KHÔNG hiện locked dialog khi lần đầu mount (vừa quay về từ màn chơi)
    const wasFirstMount = isFirstMountRef.current;
    isFirstMountRef.current = false;
    prevZoneKeyRef.current = zoneMessageKey;
    
    // 🔒 CHECK: Tìm zone đầu tiên chưa hoàn thành (zone đang chơi)
    const currentZoneIndex = zones.findIndex(z => z.zoneId === activeZoneId);
    
    // Tìm zone đầu tiên chưa hoàn thành 100%
    let playingZone = null;
    let playingZoneProgress = null;
    for (let i = 0; i < zones.length; i++) {
      const zp = zoneProgress[zones[i].zoneId];
      if (!zp || zp.percent < 100) {
        playingZone = zones[i];
        playingZoneProgress = zp || { completed: 0, total: 0, percent: 0 };
        break;
      }
    }
    
    // Nếu zone hiện tại không phải zone đang chơi (có zone trước chưa hoàn thành)
    const playingZoneIndex = playingZone ? zones.findIndex(z => z.zoneId === playingZone.zoneId) : 0;
    if (playingZone && currentZoneIndex > playingZoneIndex) {
      // 🚫 KHÔNG hiện locked dialog khi vừa quay về từ màn chơi (first mount)
      if (wasFirstMount) {
        return; // Skip - user vừa quay về, không spam popup
      }
      setLockedZoneInfo({
        currentZone: activeZone,
        prevZone: playingZone, // Zone đang chơi (chưa hoàn thành)
        prevProgress: playingZoneProgress
      });
      setShowZoneLocked(true);
      return; // Không hiện intro dialog
    }
    
    // Đọc localStorage xem đã xem intro zone này chưa
    let viewedIntros = new Set();
    try {
      const saved = localStorage.getItem('sorokid_viewed_zone_intros');
      if (saved) viewedIntros = new Set(JSON.parse(saved));
    } catch {}
    
    // 📖 Nếu CHƯA từng xem intro zone này VÀ chưa hoàn thành zone → hiện ZoneIntroDialog
    // 🚫 KHÔNG hiện khi vừa quay về từ màn chơi (first mount)
    if (!wasFirstMount && !viewedIntros.has(zoneMessageKey) && progress?.percent < 100) {
      setIntroZone(activeZone);
      setShowZoneIntro(true);
      // Đánh dấu đã xem
      viewedIntros.add(zoneMessageKey);
      try {
        localStorage.setItem('sorokid_viewed_zone_intros', JSON.stringify([...viewedIntros]));
      } catch {}
    }
  }, [activeZoneId, currentMap, activeZone, zoneProgress, zones]); // Thêm zones để check prev zone
  
  // 🦉 Callback khi hoàn thành prologue
  const handlePrologueComplete = useCallback(() => {
    // Hiện lời dẫn đầu tiên sau khi xem xong prologue
    const welcomeMsg = getChapterNarrative(1, 'entering') || 
                       t('adventureScreen.firstWelcome');
    setCuSoroMessage(welcomeMsg);
    setCuSoroVisible(true);
  }, [t]);
  
  // 🎉 Function để trigger reward effect - có thể gọi từ bên ngoài
  const triggerReward = useCallback(({ type = 'complete', stars = 0, message = '' }) => {
    setRewardType(type);
    setRewardStars(stars);
    setRewardMessage(message);
    setShowRewardEffect(true);
  }, []);
  
  // 🚀 PERF: useMemo cho computed stats - tránh tính lại mỗi render
  const { totalStages, completedStagesCount, mapProgress } = useMemo(() => {
    const total = stages.length;
    const completed = stages.filter(s => stageStatuses[s.stageId] === 'completed').length;
    return {
      totalStages: total,
      completedStagesCount: completed,
      mapProgress: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [stages, stageStatuses]);
  
  // 🏆 Handle mở treasure chest
  const handleTreasureClick = useCallback(() => {
    // Xác định loại chứng chỉ
    if (currentMap === 'addsub' && hasCertAddSub) {
      setTreasureCertType('addsub');
      setShowTreasureReveal(true);
      play('levelComplete');
    } else if (hasCertComplete) {
      setTreasureCertType('complete');
      setShowTreasureReveal(true);
      play('levelCompletePerfect');
    }
  }, [currentMap, hasCertAddSub, hasCertComplete, play]);
  
  // 🏆 Handle xem chi tiết chứng chỉ - navigate đến trang certificate
  const handleViewCertificate = useCallback(() => {
    // Navigate đến trang certificate list để xem/download
    router.push(localizeUrl('/certificate'));
  }, [router, localizeUrl]);
  
  // 🦉 Khi click vào stage, hiện lời dẫn phù hợp
  const handleStageClick = useCallback((stage) => {
    const status = stageStatuses[stage.stageId];
    
    // 🏆 TREASURE STAGE: Check nếu đây là stage kho báu/chứng chỉ
    const isTreasureStage = stage.type === 'treasure' || stage.type === 'certificate';
    
    if (isTreasureStage && status === 'completed') {
      // Mở hiệu ứng rương kho báu - dùng certificateInfo từ stage config
      const certType = stage.certificateInfo?.certType || (currentMap === 'addsub' ? 'addsub' : 'complete');
      setTreasureCertType(certType);
      setShowTreasureReveal(true);
      play('levelComplete');
      return;
    }
    
    // 🔒 TIER CHECK: Kiểm tra quyền truy cập trước khi mở modal
    // Chỉ check nếu stage không bị locked (locked thì không cần check tier)
    if (status !== 'locked' && onTierCheck) {
      const canAccess = onTierCheck(stage);
      if (!canAccess) {
        // Không đủ quyền - onTierCheck đã hiện upgrade popup rồi
        play('stageSelect'); // Vẫn play sound
        return;
      }
    }
    
    // Lấy lời dẫn theo loại stage và trạng thái
    let message = '';
    if (status === 'locked') {
      message = t('adventureScreen.stageLockedMsg');
    } else if (status === 'completed') {
      message = t('adventureScreen.stageCompletedMsg');
    } else {
      // Current stage - có thể chơi
      if (stage.type === 'lesson') {
        message = t('adventureScreen.lessonMsg');
      } else if (stage.type === 'boss') {
        message = t('adventureScreen.bossMsg');
      } else if (isTreasureStage) {
        message = t('adventureScreen.treasureMsg');
      } else {
        message = getRandomMessage(GAMEPLAY_NARRATIVES?.beforeQuestion) || 
                  t('adventureScreen.readyMsg');
      }
    }
    
    setCuSoroMessage(message);
    setCuSoroVisible(true);
    setSelectedStage(stage);
    
    // 🔊 Play sound when selecting stage
    play('stageSelect');
  }, [stageStatuses, play, onTierCheck, currentMap]);
  
  const handleStartStage = useCallback(() => {
    if (selectedStage?.link) {
      // 🔊 Play game start sound
      play('gameStart');
      // Tier đã được check trước khi mở modal rồi, chỉ cần navigate
      onStageClick ? onStageClick(selectedStage) : router.push(localizeUrl(selectedStage.link));
    }
    setSelectedStage(null);
  }, [selectedStage, router, onStageClick, play, localizeUrl]);
  
  // 🚀 REMOVED: Random stars useMemo - not needed anymore (using CSS)
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-100 via-orange-100 to-yellow-100">
        {/* Simple loading - hiện nhanh */}
        <div className="text-6xl mb-4 animate-bounce">🦉</div>
        <div className="text-xl font-bold text-amber-800">Đang tải...</div>
      </div>
    );
  }
  
  return (
    <div 
      className="min-h-screen min-h-[100dvh] relative overflow-hidden"
      {...swipeHandlers}
      style={{ touchAction: 'pan-y' }} // Allow vertical scroll, capture horizontal swipe
    >
      {/* 🎨 Zone Background - Thay đổi theo zone - bao gồm gradient, clouds, decorations */}
      <ZoneBackground key={activeZoneId} zoneId={activeZoneId} progress={zoneProgress[activeZoneId]?.percent || 0} />
      
      <GameHeader totalStages={totalStages} completedStages={completedStagesCount} userStats={userStats} session={session} t={t} />
      
      {/* Title with animation - Responsive for all screens */}
      <div className="text-center py-1.5 xs:py-2 sm:py-3 md:py-5 relative z-10 px-2 xs:px-4">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="text-sm xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-white drop-shadow-lg relative inline-block"
        >
          {/* Sparkle decorations - hidden on mobile */}
          <motion.span
            className="hidden md:inline-block absolute -left-8 md:-left-10 lg:-left-12 top-0 text-base md:text-lg lg:text-xl"
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ✨
          </motion.span>
          <motion.span
            className="hidden md:inline-block absolute -right-8 md:-right-10 lg:-right-12 top-0 text-base md:text-lg lg:text-xl"
            animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          >
            ✨
          </motion.span>
          
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block text-sm xs:text-base sm:text-lg md:text-xl"
          >
            🗺️
          </motion.span>
          {' '}{t('adventureScreen.treasureQuest')}{' '}
          <motion.span
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-block text-sm xs:text-base sm:text-lg md:text-xl"
          >
            💎
          </motion.span>
        </motion.h1>
        <motion.p 
          className="text-white/70 text-[10px] xs:text-xs sm:text-sm mt-0.5 xs:mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="hidden xs:inline">Khám phá thế giới Soroban kỳ diệu!</span>
          <span className="xs:hidden">Khám phá Soroban!</span>
        </motion.p>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <MapSelector currentMap={currentMap} onSelect={setCurrentMap} hasCertAddSub={hasCertAddSub} />
        <ZoneTabs zones={zones} activeZoneId={activeZoneId} onSelect={setActiveZoneId} zoneProgress={zoneProgress} />
      </div>
      
      {/* 👆 SWIPE ZONE AREA - Swipe left/right để chuyển zone */}
      <SwipeableZoneArea
        zones={zones}
        activeZoneId={activeZoneId}
        activeZone={activeZone}
        zoneProgress={zoneProgress}
        activeStages={activeStages}
        stageStatuses={stageStatuses}
        onChangeZone={setActiveZoneId}
        onStageClick={handleStageClick}
        t={t}
      />
      
      {/* 🦉 Cú Soro - Ẩn khi có modal mở để không bị che */}
      {!selectedStage && !showPrologue && !showZoneIntro && !showZoneLocked && (
        <CuSoro message={cuSoroMessage} isVisible={cuSoroVisible} onToggle={() => setCuSoroVisible(!cuSoroVisible)} t={t} />
      )}
      
      {/* 🎨 Map Decorations - Icon trang trí nhẹ nhàng */}
      <MapDecorations />
      
      {/* 🎉 Reward Effects - Hiệu ứng thưởng khi hoàn thành */}
      <RewardEffects 
        show={showRewardEffect} 
        type={rewardType}
        starsEarned={rewardStars}
        message={rewardMessage}
        onComplete={() => setShowRewardEffect(false)} 
      />
      
      {/* 🏆 Zone Complete Celebration - Hiệu ứng chiến thắng khi hoàn thành zone */}
      <ZoneCompleteCelebration
        show={showZoneCelebration}
        zoneName={celebrationZone?.name || ''}
        zoneIcon={celebrationZone?.icon || '🏆'}
        message={celebrationZone?.story?.complete || t('adventureScreen.zoneCompleteMsg', { zoneName: celebrationZone?.name })}
        onComplete={() => {
          setShowZoneCelebration(false);
          setCelebrationZone(null);
        }}
      />
      
      {/* 📖 Zone Intro Dialog - Dialog giới thiệu khi vào zone mới */}
      <ZoneIntroDialog
        show={showZoneIntro}
        zoneName={introZone?.name || ''}
        zoneIcon={introZone?.icon || '🏝️'}
        zoneSubtitle={introZone?.subtitle || ''}
        introMessage={introZone?.story?.intro || t('adventureScreen.newJourneyAwaits', { zoneName: introZone?.name })}
        onComplete={() => {
          setShowZoneIntro(false);
          setIntroZone(null);
        }}
      />
      
      {/* 🔒 Zone Locked Dialog - Khi zone trước chưa hoàn thành */}
      <ZoneLockedDialog
        show={showZoneLocked}
        currentZone={lockedZoneInfo?.currentZone}
        prevZone={lockedZoneInfo?.prevZone}
        prevProgress={lockedZoneInfo?.prevProgress}
        onGoBack={() => {
          // Chuyển về zone trước đó
          if (lockedZoneInfo?.prevZone?.zoneId) {
            setActiveZoneId(lockedZoneInfo.prevZone.zoneId);
          }
          setShowZoneLocked(false);
          setLockedZoneInfo(null);
        }}
        onClose={() => {
          setShowZoneLocked(false);
          setLockedZoneInfo(null);
        }}
      />
      
      {/* 🏆 Treasure Chest Reveal - Hiệu ứng mở kho báu */}
      <TreasureChestReveal
        isOpen={showTreasureReveal}
        onClose={() => setShowTreasureReveal(false)}
        certificateType={treasureCertType}
        userName={userStats?.name || userStats?.displayName}
        onViewCertificate={handleViewCertificate}
      />
      
      {/* 🦉 Prologue Modal - Màn hình intro cho người mới */}
      <AnimatePresence>
        {showPrologue && (
          <PrologueModal 
            isOpen={showPrologue} 
            onClose={() => setShowPrologue(false)} 
            onComplete={handlePrologueComplete}
            t={t}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {selectedStage && (
          <StageModal stage={selectedStage} status={stageStatuses[selectedStage.stageId]} onClose={() => setSelectedStage(null)} onStart={handleStartStage} t={t} />
        )}
      </AnimatePresence>
      
      {/* Footer */}
      <div className="fixed bottom-2 left-0 right-0 z-10 text-center pointer-events-none">
        <p className="text-white/25 text-[10px] sm:text-xs drop-shadow-sm">
          © {new Date().getFullYear()} SoroKid - {t('adventureScreen.footerText')}
        </p>
      </div>
    </div>
  );
}
