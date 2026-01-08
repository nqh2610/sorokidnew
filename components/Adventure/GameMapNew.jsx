'use client';

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, ChevronDown } from 'lucide-react';
import Logo from '@/components/Logo/Logo';
import { MonsterAvatar } from '@/components/MonsterAvatar';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import { useGameSound } from '@/lib/useGameSound';
import { initSoundSystem } from '@/lib/soundManager';
import SoundSettingsPanel from '@/components/SoundSettings/SoundSettingsPanel';

// Import narrative config
import { STORY_OVERVIEW, GAMEPLAY_NARRATIVES } from '@/config/narrative.config';

// 🎨 Import game decorations
import MapDecorations from './MapDecorations';
import TreasureChestReveal from './TreasureChestReveal';

// ============================================================
// 🎮 GAME MAP - Đi Tìm Kho Báu Tri Thức
// Design: Duolingo + Candy Crush Saga
// ============================================================

// ===== CUSTOM HOOK: useSwipeZone - Swipe gesture để chuyển zone =====
function useSwipeZone({ zones, activeZoneId, onChangeZone }) {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);
  const minSwipeDistance = 50; // Minimum swipe distance in pixels
  
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  }, []);
  
  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches[0].clientX;
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    const currentIndex = zones.findIndex(z => z.zoneId === activeZoneId);
    
    if (Math.abs(swipeDistance) < minSwipeDistance) return;
    
    if (swipeDistance > 0 && currentIndex < zones.length - 1) {
      // Swipe left -> next zone
      onChangeZone(zones[currentIndex + 1].zoneId);
    } else if (swipeDistance < 0 && currentIndex > 0) {
      // Swipe right -> previous zone
      onChangeZone(zones[currentIndex - 1].zoneId);
    }
    
    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [zones, activeZoneId, onChangeZone]);
  
  // Mouse drag support for desktop testing
  const handleMouseDown = useCallback((e) => {
    touchStartX.current = e.clientX;
    isDragging.current = true;
  }, []);
  
  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    touchEndX.current = e.clientX;
  }, []);
  
  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    const currentIndex = zones.findIndex(z => z.zoneId === activeZoneId);
    
    if (Math.abs(swipeDistance) < minSwipeDistance) return;
    
    if (swipeDistance > 0 && currentIndex < zones.length - 1) {
      onChangeZone(zones[currentIndex + 1].zoneId);
    } else if (swipeDistance < 0 && currentIndex > 0) {
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
function PrologueModal({ isOpen, onClose, onComplete }) {
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
            {currentScene < scenes.length - 1 ? 'Tiếp tục →' : '🚀 Bắt đầu phiêu lưu!'}
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
              Bỏ qua
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===== FLOATING CÚ SORO - WITH STORYTELLING ANIMATIONS =====
function CuSoro({ message, isVisible, onToggle }) {
  // Animation states cho cú sinh động hơn
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
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
      const timer = setTimeout(() => setIsWaving(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [message, isVisible]);
  
  return (
    <motion.div
      className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 }}
    >
      {/* Speech bubble - Điều chỉnh vị trí để không bị cắt */}
      <AnimatePresence>
        {isVisible && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => onToggle()}
            className="absolute bottom-full right-0 mb-3 w-60 sm:w-72 md:w-80 lg:w-96 bg-white rounded-2xl shadow-2xl cursor-pointer hover:bg-amber-50 transition-colors overflow-hidden"
            style={{ 
              border: '3px solid #fbbf24',
              transformOrigin: 'bottom right'
            }}
          >
            {/* Progress bar - hiển thị thời gian còn lại */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-100">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                style={{ width: `${autoHideProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            
            {/* Mũi tên chỉ xuống */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r-3 border-b-3 border-amber-400 rotate-45" />
            
            <div className="p-3 sm:p-4 pt-4 sm:pt-5">
              <p className="text-gray-700 text-sm sm:text-base md:text-lg font-medium leading-relaxed font-[var(--font-quicksand)]">{message}</p>
              <div className="flex items-center justify-between mt-2 sm:mt-3">
                <span className="text-xs sm:text-sm text-gray-400 flex items-center gap-1 font-[var(--font-quicksand)]">
                  <span>👆</span> Chạm để đóng
                </span>
                <span className="text-amber-600 text-xs sm:text-sm font-semibold font-[var(--font-quicksand)]">🦉 Cú Soro</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Cú character với animations sinh động */}
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.95 }}
        animate={isWaving ? { rotate: [0, -5, 5, -5, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Glow effect */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '130%', height: '130%', left: '-15%', top: '-15%' }}
        />
        
        {/* Main body */}
        <motion.div 
          className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl border-3 border-white"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Cú emoji với hiệu ứng chớp mắt */}
          <span className="text-3xl sm:text-4xl" style={{ filter: isBlinking ? 'brightness(0.8)' : 'none' }}>
            🦉
          </span>
        </motion.div>
        
        {/* Name tag */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap">
            {message && !isVisible ? '👆 Chạm để đọc' : 'Cú Soro'}
          </span>
        </div>
        
        {/* Notification badge - khi có message nhưng đang ẩn */}
        {message && !isVisible && (
          <motion.div 
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <span className="text-white text-xs font-bold">!</span>
          </motion.div>
        )}
      </motion.button>
    </motion.div>
  );
}

// ===== STAGE NODE - OPTIMIZED =====
// 🚀 PERF: memo để tránh re-render khi parent render nhưng props không đổi
const StageNode = memo(function StageNode({ stage, status, onClick, index }) {
  const isLocked = status === 'locked';
  const isCurrent = status === 'current';
  const isCompleted = status === 'completed';
  const isBoss = stage.type === 'boss';
  const isTreasure = stage.type === 'treasure';
  
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
    if (isBoss) return {
      bg: isLocked ? 'from-rose-200 to-rose-300' : 'from-rose-400 to-red-500',
      shadow: 'shadow-rose-400/40',
      iconBg: isLocked ? 'bg-rose-300' : 'bg-rose-600',
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
  
  const style = getStyle();
  // Size is controlled by CSS responsive classes
  
  return (
    <motion.div
      className="flex flex-col items-center relative group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.03, duration: 0.2, ease: 'easeOut' }} // 🚀 Faster stagger, no spring
    >
      {/* Current indicator - bouncing arrow - 🚀 CSS animation instead */}
      {isCurrent && (
        <div className="absolute -top-8 xs:-top-10 sm:-top-12 md:-top-14 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="flex items-center justify-center gap-0.5 xs:gap-1 px-2 xs:px-2.5 sm:px-3 md:px-4 py-1 xs:py-1.5 sm:py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg border-2 border-white whitespace-nowrap">
            <span className="text-[10px] xs:text-xs sm:text-sm md:text-base">🎮</span>
            <span className="text-[9px] xs:text-[11px] sm:text-xs md:text-sm font-black text-white tracking-tight">CHƠI!</span>
          </div>
          <div className="w-0 h-0 border-l-4 xs:border-l-5 sm:border-l-6 md:border-l-8 border-r-4 xs:border-r-5 sm:border-r-6 md:border-r-8 border-t-4 xs:border-t-5 sm:border-t-6 md:border-t-8 border-transparent border-t-orange-500 mx-auto" />
        </div>
      )}
      
      {/* 🚀 Glow effect for current - SIMPLIFIED to 1 layer with CSS */}
      {style.glow && (
        <div className="absolute rounded-full bg-yellow-400/50 -inset-2 xs:-inset-3 sm:-inset-4 animate-pulse" />
      )}
      
      {/* Main button - Responsive w/h for all screen sizes */}
      <motion.button
        onClick={() => onClick(stage)}
        whileTap={{ scale: 0.95 }} // 🚀 Removed whileHover rotate animation
        className={`
          relative rounded-full bg-gradient-to-br ${style.bg}
          ${isBoss || isTreasure 
            ? 'w-11 h-11 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24' 
            : 'w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20'}
          shadow-xl ${style.shadow}
          flex items-center justify-center
          border-2 sm:border-3 md:border-4 ${isLocked ? 'border-white/50' : 'border-white'}
          cursor-pointer
          hover:scale-110 active:scale-95 transition-transform duration-150
        `}
      >
        {/* Shine effect */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/50 via-white/20 to-transparent" />
        
        {/* Icon - 🚀 Removed infinite animations, only current has subtle animation */}
        <span className={`relative ${isBoss || isTreasure ? 'text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl' : 'text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl'} ${isLocked ? 'opacity-80' : ''} ${isCurrent ? 'animate-pulse' : ''}`}>
          {isLocked 
            ? (isBoss ? '🐲' : isTreasure ? '🎁' : '❓') 
            : (isBoss ? '👹' : stage.icon)
          }
        </span>
        
        {/* Number badge - Responsive for all screens */}
        <div className={`absolute -top-0.5 xs:-top-0.5 sm:-top-1 -left-0.5 xs:-left-0.5 sm:-left-1 w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${style.iconBg} rounded-full flex items-center justify-center border sm:border-2 border-white shadow-lg`}>
          <span className="text-[7px] xs:text-[8px] sm:text-[10px] md:text-xs font-black text-white drop-shadow">{index + 1}</span>
        </div>
        
        {/* 🚀 Completed star - SIMPLIFIED: removed confetti particles */}
        {isCompleted && (
          <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center border sm:border-2 border-white shadow-lg">
            <span className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm">⭐</span>
          </div>
        )}
      </motion.button>
      
      {/* Name - Hiển thị đầy đủ, không cắt */}
      <p className={`mt-1 xs:mt-1.5 sm:mt-2 md:mt-3 text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold text-center leading-tight drop-shadow-md ${
        isLocked ? 'text-white/70' : isCurrent ? 'text-yellow-200' : 'text-white'
      }`}
      style={{ 
        maxWidth: 90,
        wordBreak: 'keep-all',
        whiteSpace: 'normal'
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
    // Vertical: 3 dots + arrow xuống
    return (
      <div className="flex flex-col items-center justify-center py-0.5 gap-[2px] xs:gap-0.5 sm:gap-1">
        {[...Array(3)].map((_, i) => (
          <motion.div 
            key={i} 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08, duration: 0.2 }}
            className={`w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 rounded-full ${dotColor}`}
          />
        ))}
        {/* Mũi tên xuống */}
        <motion.span 
          className={`text-[10px] xs:text-xs sm:text-sm font-bold ${arrowColor}`}
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
                  flex-shrink-0 px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-xl xs:rounded-2xl font-bold text-[10px] xs:text-xs sm:text-sm 
                  flex items-center gap-1 xs:gap-1.5 sm:gap-2 transition-all duration-150 whitespace-nowrap border-2
                  hover:scale-[1.02] active:scale-[0.98]
                  ${isActive 
                    ? 'bg-white text-indigo-600 shadow-xl shadow-white/40 border-yellow-400 scale-105' 
                    : 'bg-white/25 text-white hover:bg-white/35 border-white/40'
                  }
                `}
              >
                {/* Icon + Tên zone */}
                <span className="text-sm xs:text-base sm:text-lg">{zone.icon}</span>
                <span className="font-bold">{zone.name}</span>
                {/* Progress badge */}
                <div className={`
                  px-1.5 py-0.5 xs:px-2 sm:px-2.5 sm:py-1 rounded-full text-[8px] xs:text-[10px] sm:text-xs font-black
                  ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-white/30 text-white'}
                `}>
                  {progress.completed}/{progress.total}
                </div>
                {/* 🚀 SIMPLIFIED: Static star instead of animated */}
                {isComplete && (
                  <span className="text-xs xs:text-sm sm:text-base">⭐</span>
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
function StageGrid({ stages, stageStatuses, onStageClick }) {
  const rows = [];
  for (let i = 0; i < stages.length; i += 3) {
    rows.push(stages.slice(i, i + 3));
  }
  
  // Component invisible spacer - giữ chỗ để layout zigzag hoạt động đúng
  const InvisibleSpacer = ({ withDots = false }) => (
    <div className="flex flex-col items-center">
      <div className="flex items-center">
        {/* Spacer có cùng kích thước với StageNode */}
        <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 opacity-0" />
        {withDots && <div className="px-0.5 sm:px-1 w-8 xs:w-10 sm:w-12 md:w-14 opacity-0" />}
      </div>
    </div>
  );
  
  return (
    <div className="flex flex-col items-center gap-0.5 xs:gap-1 sm:gap-1.5 md:gap-2 py-2 xs:py-3 sm:py-4 md:py-6">
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
                      <StageNode stage={stage} status={status} onClick={onStageClick} index={actualIndex} />
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
function StageModal({ stage, status, onClose, onStart }) {
  if (!stage) return null;
  const isBoss = stage.type === 'boss';
  const isTreasure = stage.type === 'treasure';
  const isLocked = status === 'locked';
  
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
          <div className={`p-4 sm:p-6 bg-gradient-to-br ${
            isBoss ? 'from-rose-500 to-red-600' :
            isTreasure ? 'from-purple-500 to-violet-600' :
            status === 'completed' ? 'from-emerald-500 to-green-600' :
            'from-blue-500 to-indigo-600'
          } relative overflow-hidden`}>
            {/* 🚀 REMOVED: Sparkles in header - too many animations */}
            
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} // 🚀 Simpler: only scale, no rotate
              transition={{ duration: 1.5, repeat: Infinity }} 
              className="text-4xl sm:text-6xl text-center mb-1 sm:mb-2 relative z-10"
            >
              {stage.icon}
            </motion.div>
            <h3 className="text-lg sm:text-xl font-black text-white text-center relative z-10">{stage.name}</h3>
            {status === 'completed' && (
              <p className="text-white/80 text-center text-sm mt-1 relative z-10">
                ⭐ Đã hoàn thành ⭐
              </p>
            )}
            {isLocked && (
              <p className="text-white/90 text-center text-sm mt-1 relative z-10">
                🔒 Màn chơi chưa mở khóa
              </p>
            )}
          </div>
          
          <div className="p-4 sm:p-6">
            {isLocked ? (
              <>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                  <p className="text-amber-700 text-center font-medium text-sm sm:text-base">
                    <span className="text-lg sm:text-xl block mb-1 sm:mb-2">💡</span>
                    Hoàn thành các màn trước để mở khóa màn này nhé!
                  </p>
                </div>
                <motion.button 
                  onClick={onClose} 
                  whileTap={{ scale: 0.97 }} // 🚀 Only tap feedback, no hover
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-lg text-sm sm:text-base active:brightness-90 transition-all"
                >
                  Đã hiểu! 👍
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
                    Đóng
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
                      {status === 'completed' ? '🔄 Chơi lại' : '▶️ Bắt đầu'}
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
function GameHeader({ totalStages, completedStages, userStats, session }) {
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
            ⭐ Nâng Cao
          </span>
        );
      case 'basic':
        return (
          <span className="px-2 py-0.5 bg-gradient-to-r from-blue-400 to-cyan-500 text-white text-xs font-bold rounded-full">
            ✓ Cơ Bản
          </span>
        );
      case 'trial':
        return (
          <span className="px-2 py-0.5 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold rounded-full">
            🔥 Dùng thử {trialDays > 0 && `(${trialDays}d)`}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-bold rounded-full">
            Miễn Phí
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
        title="Đăng xuất?"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        type="warning"
      />

      <header className="bg-white/90 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Logo - Click để về Dashboard */}
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <Logo size="md" showText={false} />
              <h1 className="hidden sm:block text-xl font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
                SoroKid
              </h1>
            </Link>

            {/* Desktop Stats bar */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {/* Tier Badge Desktop */}
              <Link 
                href="/pricing"
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-50 to-pink-50 rounded-xl border border-violet-100 hover:shadow-md transition-all"
              >
                {getTierBadge()}
              </Link>

              {/* Streak */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                <span className="text-lg">🔥</span>
                <div className="text-right">
                  <span className="font-bold text-orange-600">{userStats?.streak || 0}</span>
                  <span className="text-xs text-orange-500 ml-1">ngày</span>
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
                <span className="text-lg">⭐</span>
                <div className="text-right">
                  <span className="font-bold text-yellow-600">{(userStats?.totalStars || 0).toLocaleString()}</span>
                  <span className="text-xs text-yellow-500 ml-1">sao</span>
                </div>
              </div>

              {/* Diamonds */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                <span className="text-lg">💎</span>
                <div className="text-right">
                  <span className="font-bold text-cyan-600">{(userStats?.diamonds || 0).toLocaleString()}</span>
                  <span className="text-xs text-cyan-500 ml-1">kim cương</span>
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

            {/* Mobile: Compact Stats Pill + Avatar + Logout */}
            <div className="flex md:hidden items-center gap-1.5 flex-1 justify-end">
              {/* Progress on mobile - compact */}
              <div className="flex items-center gap-1 bg-violet-100 rounded-full px-2 py-1">
                <span className="text-[10px] xs:text-xs font-bold text-violet-700">{progress}%</span>
              </div>

              {/* Compact stats in one pill */}
              <div className="flex items-center bg-gray-50 rounded-full px-2 py-1 gap-2">
                <span className="flex items-center gap-0.5 text-xs">
                  <span>🔥</span>
                  <span className="font-semibold text-orange-600">{userStats?.streak || 0}</span>
                </span>
                <span className="w-px h-3 bg-gray-300"></span>
                <span className="flex items-center gap-0.5 text-xs">
                  <span>⭐</span>
                  <span className="font-semibold text-yellow-600">{(userStats?.totalStars || 0).toLocaleString()}</span>
                </span>
                <span className="w-px h-3 bg-gray-300"></span>
                <span className="flex items-center gap-0.5 text-xs">
                  <span>💎</span>
                  <span className="font-semibold text-cyan-600">{(userStats?.diamonds || 0).toLocaleString()}</span>
                </span>
              </div>

              {/* Avatar - direct link to profile page */}
              <Link 
                href="/profile"
                className="flex-shrink-0 active:scale-95 transition-transform"
              >
                <MonsterAvatar 
                  seed={session?.user?.id || session?.user?.email || 'default'}
                  avatarIndex={getAvatarIndex()}
                  size={36}
                  className="border-2 border-violet-200"
                  showBorder={false}
                />
              </Link>

              {/* Logout shortcut button */}
              <button
                onClick={() => setShowLogoutDialog(true)}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-full transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={16} className="text-red-500" />
              </button>
            </div>

            {/* Desktop: User dropdown */}
            <div className="hidden md:flex items-center gap-3">
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
                      {userStats?.levelInfo?.icon} {userStats?.levelInfo?.name || `Cấp ${userStats?.level || 1}`}
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop: Dropdown menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span>📊</span>
                      <span className="text-gray-700">Bảng điều khiển</span>
                    </Link>
                    <Link
                      href="/learn"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span>📚</span>
                      <span className="text-gray-700">Học tập</span>
                    </Link>
                    <Link
                      href="/practice"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span>🎯</span>
                      <span className="text-gray-700">Luyện tập</span>
                    </Link>
                    <Link
                      href="/compete"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span>🏆</span>
                      <span className="text-gray-700">Thi đấu</span>
                    </Link>
                    <hr className="my-2" />
                    <Link
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span>👤</span>
                      <span className="text-gray-700">Hồ sơ</span>
                    </Link>
                    {(tier === 'vip' || tier === 'advanced' || tier === 'nangcao') && (
                      <Link
                        href="/certificate"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>🏅</span>
                        <span className="text-gray-700">Chứng chỉ</span>
                      </Link>
                    )}
                    <hr className="my-2" />
                    {session?.user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>⚙️</span>
                        <span className="text-gray-700">Quản trị</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowLogoutDialog(true);
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600 w-full"
                    >
                      <LogOut size={18} />
                      <span>Đăng xuất</span>
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

// ===== SWIPEABLE ZONE AREA - Vuốt trái/phải để chuyển zone =====
function SwipeableZoneArea({ zones, activeZoneId, activeZone, zoneProgress, activeStages, stageStatuses, onChangeZone, onStageClick }) {
  const { swipeHandlers } = useSwipeZone({ zones, activeZoneId, onChangeZone });
  const currentIndex = zones.findIndex(z => z.zoneId === activeZoneId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < zones.length - 1;
  
  if (!activeZone) return null;
  
  return (
    <div 
      className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-2 xs:px-3 sm:px-4 py-2 xs:py-3 sm:py-4 relative z-10"
      {...swipeHandlers}
      style={{ touchAction: 'pan-y' }} // Allow vertical scroll, capture horizontal swipe
    >
      {/* Swipe hint indicator - only on mobile/tablet */}
      <div className="flex items-center justify-center gap-2 xs:gap-3 mb-1.5 xs:mb-2 md:hidden">
        <motion.button
          onClick={() => hasPrev && onChangeZone(zones[currentIndex - 1].zoneId)}
          disabled={!hasPrev}
          className={`flex items-center gap-1 px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-semibold transition-all ${
            hasPrev ? 'bg-white/25 text-white active:bg-white/40 shadow-sm' : 'bg-white/10 text-white/30'
          }`}
          whileTap={hasPrev ? { scale: 0.95 } : undefined}
        >
          <span className="text-base">‹</span>
          <span className="hidden xs:inline">Trước</span>
        </motion.button>
        
        <div className="flex items-center gap-1.5 xs:gap-2">
          {zones.map((zone, idx) => (
            <button
              key={zone.zoneId}
              onClick={() => onChangeZone(zone.zoneId)}
              className={`rounded-full transition-all ${
                idx === currentIndex 
                  ? 'bg-white w-4 xs:w-5 h-2 xs:h-2.5 shadow-sm' 
                  : 'bg-white/40 w-2 xs:w-2.5 h-2 xs:h-2.5 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
        
        <motion.button
          onClick={() => hasNext && onChangeZone(zones[currentIndex + 1].zoneId)}
          disabled={!hasNext}
          className={`flex items-center gap-1 px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-semibold transition-all ${
            hasNext ? 'bg-white/25 text-white active:bg-white/40 shadow-sm' : 'bg-white/10 text-white/30'
          }`}
          whileTap={hasNext ? { scale: 0.95 } : undefined}
        >
          <span className="hidden xs:inline">Sau</span>
          <span className="text-base">›</span>
        </motion.button>
      </div>
      
      {/* Swipe instruction - show once on small screens */}
      <div className="text-center mb-1.5 xs:mb-2 md:hidden">
        <p className="text-white/60 text-[10px] xs:text-xs font-medium">
          👆 Vuốt trái/phải để chuyển vùng
        </p>
      </div>
      
      {/* Zone Card - More colorful with rainbow border and shimmer */}
      <motion.div
        key={activeZoneId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-2xl xs:rounded-3xl p-[3px] xs:p-[4px] mb-3 xs:mb-4 sm:mb-6"
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
        <div className={`rounded-[14px] xs:rounded-[18px] sm:rounded-[20px] p-2.5 xs:p-3 sm:p-4 md:p-5 lg:p-6 bg-gradient-to-br ${activeZone.color} relative overflow-hidden`}>
          {/* Shimmer overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
          
          <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 relative z-10">
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, 0] }}
              animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/30 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0 backdrop-blur-sm"
            >
              <span className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl">{activeZone.icon}</span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white drop-shadow truncate">{activeZone.name}</h2>
              <p className="text-white/80 text-[10px] xs:text-xs sm:text-sm truncate">{activeZone.subtitle}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <motion.p 
                className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white drop-shadow"
                key={zoneProgress[activeZoneId]?.completed}
                initial={{ scale: 1.5, color: '#fef08a' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.5 }}
              >
                {zoneProgress[activeZoneId]?.completed || 0}/{zoneProgress[activeZoneId]?.total || 0}
              </motion.p>
              <p className="text-white/70 text-[9px] xs:text-[10px] sm:text-xs">hoàn thành</p>
            </div>
          </div>
          <div className="mt-2 xs:mt-2.5 sm:mt-3 md:mt-4 h-1.5 xs:h-2 sm:h-2.5 md:h-3 bg-white/40 rounded-full overflow-hidden relative z-10 shadow-inner">
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
      
      <StageGrid stages={activeStages} stageStatuses={stageStatuses} onStageClick={onStageClick} />
    </div>
  );
}

// ===== MAP SELECTOR - Responsive =====
function MapSelector({ currentMap, onSelect, hasCertAddSub }) {
  return (
    <div className="flex justify-center gap-1.5 xs:gap-2 sm:gap-3 mb-2 xs:mb-3 sm:mb-4 px-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect('addsub')}
        className={`px-2 xs:px-3 sm:px-4 md:px-5 py-1.5 xs:py-2 sm:py-2.5 rounded-lg xs:rounded-xl sm:rounded-2xl font-bold text-[10px] xs:text-xs sm:text-sm flex items-center gap-1 xs:gap-1.5 sm:gap-2 transition-all ${
          currentMap === 'addsub'
            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-400/30'
            : 'bg-white/10 text-white/70 hover:bg-white/20'
        }`}
      >
        <span className="text-sm xs:text-base sm:text-lg">➕➖</span>
        <span>Cộng Trừ</span>
      </motion.button>
      
      <motion.button
        whileHover={hasCertAddSub ? { scale: 1.05 } : undefined}
        whileTap={hasCertAddSub ? { scale: 0.95 } : undefined}
        onClick={() => hasCertAddSub && onSelect('muldiv')}
        disabled={!hasCertAddSub}
        className={`px-2 xs:px-3 sm:px-4 md:px-5 py-1.5 xs:py-2 sm:py-2.5 rounded-lg xs:rounded-xl sm:rounded-2xl font-bold text-[10px] xs:text-xs sm:text-sm flex items-center gap-1 xs:gap-1.5 sm:gap-2 transition-all ${
          currentMap === 'muldiv'
            ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-400/30'
            : !hasCertAddSub
              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
        }`}
      >
        <span className="text-sm xs:text-base sm:text-lg">✖️➗</span>
        <span>Nhân Chia</span>
        {!hasCertAddSub && <span className="text-[10px] xs:text-xs sm:text-sm">🔒</span>}
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
  const { data: session } = useSession();
  const { play, playMusic, stopMusic, changeTheme } = useGameSound();

  // Khởi tạo map và zone từ returnZone nếu có
  const [currentMap, setCurrentMap] = useState(() => {
    if (returnZone?.mapType) {
      console.log('🎯 GameMapNew INIT: mapType from returnZone =', returnZone.mapType);
      return returnZone.mapType;
    }
    console.log('🎯 GameMapNew INIT: default mapType = addsub');
    return 'addsub';
  });
  const [activeZoneId, setActiveZoneIdState] = useState(() => {
    if (returnZone?.zoneId) {
      console.log('🎯 GameMapNew INIT: zoneId from returnZone =', returnZone.zoneId);
      return returnZone.zoneId;
    }
    console.log('🎯 GameMapNew INIT: zoneId = null');
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
  const [cuSoroVisible, setCuSoroVisible] = useState(true);
  
  // 🦉 State cho Prologue (màn intro)
  const [showPrologue, setShowPrologue] = useState(false);
  const [lastActiveZoneId, setLastActiveZoneId] = useState(null);
  
  // 🏆 State cho Treasure Chest Reveal
  const [showTreasureReveal, setShowTreasureReveal] = useState(false);
  const [treasureCertType, setTreasureCertType] = useState('addsub'); // 'addsub' | 'complete'

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

  useEffect(() => {
    if (zones.length === 0) return;

    // Lần mount đầu tiên
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;

      // Nếu có returnZone -> đánh dấu đã apply và giữ nguyên
      if (returnZone?.zoneId) {
        console.log('🎯 ReturnZone applied:', returnZone.zoneId, 'mapType:', returnZone.mapType);
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
      console.log('🎯 Keeping returnZone after map change:', activeZoneId);
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
  useEffect(() => {
    if (!activeZone) return;
    
    // Xác định chapter index từ zone
    const zoneIndex = zones.findIndex(z => z.zoneId === activeZoneId);
    const chapterIndex = zoneIndex + 1; // Chapter bắt đầu từ 1
    
    // Kiểm tra progress của zone
    const progress = zoneProgress[activeZoneId];
    const isZoneComplete = progress?.percent === 100;
    const isNewZone = lastActiveZoneId !== activeZoneId;
    
    let message = '';
    
    if (isNewZone) {
      // Khi chuyển sang zone mới
      if (isZoneComplete) {
        // Zone đã hoàn thành
        message = activeZone?.story?.complete || 
                  `Tuyệt vời! Con đã chinh phục ${activeZone.name}! 🌟`;
      } else if (progress?.completed === 0) {
        // Zone chưa bắt đầu - lời chào khi vào zone
        const chapterNarrative = getChapterNarrative(chapterIndex, 'entering');
        message = chapterNarrative || 
                  activeZone?.story?.intro || 
                  `Chào mừng đến ${activeZone.name}! Hãy bắt đầu khám phá nào!`;
      } else {
        // Zone đang làm dở
        message = activeZone?.story?.mission || 
                  `Tiếp tục hành trình tại ${activeZone.name} nào! Còn ${progress.total - progress.completed} thử thách đang chờ!`;
      }
      
      setLastActiveZoneId(activeZoneId);
      setCuSoroMessage(message);
      setCuSoroVisible(true);
    }
  }, [activeZoneId, activeZone, zoneProgress, lastActiveZoneId, zones]);
  
  // 🦉 Callback khi hoàn thành prologue
  const handlePrologueComplete = useCallback(() => {
    // Hiện lời dẫn đầu tiên sau khi xem xong prologue
    const welcomeMsg = getChapterNarrative(1, 'entering') || 
                       "Hú hú! Chào mừng đến Làng Bàn Tính! Đây là nơi mọi hành trình bắt đầu.";
    setCuSoroMessage(welcomeMsg);
    setCuSoroVisible(true);
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
    router.push('/certificate');
  }, [router]);
  
  // 🦉 Khi click vào stage, hiện lời dẫn phù hợp
  const handleStageClick = useCallback((stage) => {
    const status = stageStatuses[stage.stageId];
    const stageIdStr = String(stage.stageId || '');
    
    // 🏆 TREASURE STAGE: Check nếu đây là stage kho báu/chứng chỉ
    // Stage IDs: cert-addsub-final, cert-complete-final
    const isTreasureStage = stageIdStr.startsWith('cert-') || 
                           stage.type === 'treasure' || 
                           stage.type === 'certificate';
    
    if (isTreasureStage && status === 'completed') {
      // Mở hiệu ứng rương kho báu
      const isAddSubCert = stageIdStr.includes('addsub');
      setTreasureCertType(isAddSubCert ? 'addsub' : 'complete');
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
      message = "Hmm... cánh cổng này chưa chịu mở. Hãy chinh phục những thử thách trước đã!";
    } else if (status === 'completed') {
      message = "Con đã chinh phục nơi này rồi! Muốn thử lại để luyện tập thêm không?";
    } else {
      // Current stage - có thể chơi
      if (stage.type === 'lesson') {
        message = "Hãy khám phá bí mật ẩn giấu bên trong! Soro sẽ đi cùng con!";
      } else if (stage.type === 'boss') {
        message = "Thử thách lớn đang chờ! Tập trung và dùng hết sức mạnh của con nhé!";
      } else if (isTreasureStage) {
        message = "Kho báu tri thức đang chờ! Hãy chinh phục nó nhé!";
      } else {
        message = getRandomMessage(GAMEPLAY_NARRATIVES?.beforeQuestion) || 
                  "Sẵn sàng cho thử thách mới chưa? Soro tin con làm được!";
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
      onStageClick ? onStageClick(selectedStage) : router.push(selectedStage.link);
    }
    setSelectedStage(null);
  }, [selectedStage, router, onStageClick, play]);
  
  // 🚀 REMOVED: Random stars useMemo - not needed anymore (using CSS)
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-100 via-orange-100 to-yellow-100">
        {/* Cú Soro animation */}
        <motion.div 
          className="text-8xl mb-4"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🦉
        </motion.div>
        
        {/* Bản đồ nhỏ */}
        <motion.div 
          className="text-4xl mb-6"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          🗺️
        </motion.div>
        
        {/* Loading text */}
        <motion.h2 
          className="text-2xl font-bold text-amber-800 mb-2"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Đang mở cửa Kho Báu...
        </motion.h2>
        <p className="text-amber-600 text-sm">Cú Soro đang chuẩn bị hành trình cho con!</p>
        
        {/* Animated icons */}
        <div className="flex gap-4 mt-6">
          {['✨', '💎', '🏆'].map((emoji, i) => (
            <motion.span
              key={i}
              className="text-2xl"
              animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-600 relative overflow-hidden">
      {/* 🚀 OPTIMIZED: Background decorations with CSS animations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 🚀 REDUCED: Only 8 stars with CSS animation - fewer on mobile */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-200/70 animate-pulse hidden xs:block"
            style={{ 
              left: `${8 + i * 11}%`, 
              top: `${10 + (i % 4) * 22}%`, 
              fontSize: 8 + (i % 3) * 5,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + (i % 3)}s`
            }}
          >
            ✦
          </div>
        ))}
        
        {/* 🚀 SIMPLIFIED: 2 clouds with CSS animation - hidden on very small screens */}
        <div
          className="absolute text-5xl sm:text-6xl md:text-7xl opacity-20 animate-cloud-slow hidden xs:block"
          style={{ top: '8%', left: '-10%' }}
        >
          ☁️
        </div>
        <div
          className="absolute text-4xl sm:text-5xl opacity-15 animate-cloud-slow hidden sm:block"
          style={{ top: '30%', left: '-5%', animationDelay: '10s' }}
        >
          ☁️
        </div>
        
        {/* 🚀 REDUCED: Only 3 floating icons with simpler animations - responsive sizes */}
        <div className="absolute text-xl xs:text-2xl sm:text-3xl animate-float hidden xs:block" style={{ top: '15%', right: '10%' }}>💎</div>
        <div className="absolute text-2xl xs:text-3xl sm:text-4xl animate-float hidden xs:block" style={{ top: '60%', right: '5%', animationDelay: '1s' }}>🏆</div>
        <div className="absolute text-lg xs:text-xl sm:text-2xl animate-float hidden sm:block" style={{ top: '40%', left: '8%', animationDelay: '2s' }}>✨</div>
        
        {/* 🚀 REMOVED: Rising bubbles, shimmer lines - too heavy */}
      </div>
      
      <GameHeader totalStages={totalStages} completedStages={completedStagesCount} userStats={userStats} session={session} />
      
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
          {' '}<span className="hidden xs:inline">Đi Tìm</span><span className="xs:hidden">Tìm</span> Kho Báu<span className="hidden xs:inline"> Tri Thức</span>{' '}
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
      />
      
      <CuSoro message={cuSoroMessage} isVisible={cuSoroVisible} onToggle={() => setCuSoroVisible(!cuSoroVisible)} />
      
      {/* 🎨 Map Decorations - Icon trang trí nhẹ nhàng */}
      <MapDecorations />
      
      {/* 🏆 Treasure Chest Reveal - Hiệu ứng mở kho báu */}
      <TreasureChestReveal
        isOpen={showTreasureReveal}
        onClose={() => setShowTreasureReveal(false)}
        certificateType={treasureCertType}
        userName={userStats?.name || userStats?.displayName}
        onViewCertificate={handleViewCertificate}
      />
      
      {/* 🔊 Sound Settings Button */}
      <div className="fixed bottom-12 right-3 sm:right-4 z-40">
        <SoundSettingsPanel compact className="shadow-lg shadow-black/30" />
      </div>
      
      {/* 🦉 Prologue Modal - Màn hình intro cho người mới */}
      <AnimatePresence>
        {showPrologue && (
          <PrologueModal 
            isOpen={showPrologue} 
            onClose={() => setShowPrologue(false)} 
            onComplete={handlePrologueComplete}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {selectedStage && (
          <StageModal stage={selectedStage} status={stageStatuses[selectedStage.stageId]} onClose={() => setSelectedStage(null)} onStart={handleStartStage} />
        )}
      </AnimatePresence>
      
      {/* Footer */}
      <div className="fixed bottom-2 left-0 right-0 z-10 text-center pointer-events-none">
        <p className="text-white/25 text-[10px] sm:text-xs drop-shadow-sm">
          © 2025 SoroKid - Học toán tư duy cùng bàn tính Soroban
        </p>
      </div>
    </div>
  );
}
