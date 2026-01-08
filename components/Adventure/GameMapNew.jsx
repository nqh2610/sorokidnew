'use client';

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo/Logo';
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
            className="absolute bottom-full right-0 mb-3 w-52 sm:w-60 md:w-72 p-3 sm:p-4 bg-white rounded-2xl shadow-2xl cursor-pointer hover:bg-amber-50 transition-colors"
            style={{ 
              border: '3px solid #fbbf24',
              transformOrigin: 'bottom right'
            }}
          >
            {/* Mũi tên chỉ xuống */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r-3 border-b-3 border-amber-400 rotate-45" />
            
            <p className="text-gray-700 text-xs sm:text-sm font-medium leading-relaxed">{message}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-400">Chạm để đóng</span>
              <span className="text-amber-600 text-[10px] font-semibold">🦉 Cú Soro</span>
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
            Cú Soro
          </span>
        </div>
        
        {/* Notification badge */}
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
        <div className="absolute -top-10 sm:-top-14 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg border-2 border-white">
            <span className="text-[10px] sm:text-sm font-black text-white">🎮 CHƠI!</span>
          </div>
          <div className="w-0 h-0 border-l-4 sm:border-l-8 border-r-4 sm:border-r-8 border-t-4 sm:border-t-8 border-transparent border-t-orange-500 mx-auto" />
        </div>
      )}
      
      {/* 🚀 Glow effect for current - SIMPLIFIED to 1 layer with CSS */}
      {style.glow && (
        <div className="absolute rounded-full bg-yellow-400/50 -inset-3 sm:-inset-4 animate-pulse" />
      )}
      
      {/* Main button - Responsive w/h */}
      <motion.button
        onClick={() => onClick(stage)}
        whileTap={{ scale: 0.95 }} // 🚀 Removed whileHover rotate animation
        className={`
          relative rounded-full bg-gradient-to-br ${style.bg}
          ${isBoss || isTreasure ? 'w-14 h-14 sm:w-[72px] sm:h-[72px] md:w-20 md:h-20' : 'w-12 h-12 sm:w-[64px] sm:h-[64px] md:w-[72px] md:h-[72px]'}
          shadow-xl ${style.shadow}
          flex items-center justify-center
          border-2 sm:border-4 ${isLocked ? 'border-white/50' : 'border-white'}
          cursor-pointer
          hover:scale-110 active:scale-95 transition-transform duration-150
        `}
      >
        {/* Shine effect */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/50 via-white/20 to-transparent" />
        
        {/* Icon - 🚀 Removed infinite animations, only current has subtle animation */}
        <span className={`relative ${isBoss || isTreasure ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-3xl'} ${isLocked ? 'opacity-80' : ''} ${isCurrent ? 'animate-pulse' : ''}`}>
          {isLocked 
            ? (isBoss ? '🐲' : isTreasure ? '🎁' : '❓') 
            : (isBoss ? '👹' : stage.icon)
          }
        </span>
        
        {/* Number badge - Responsive */}
        <div className={`absolute -top-0.5 sm:-top-1 -left-0.5 sm:-left-1 w-5 h-5 sm:w-7 sm:h-7 ${style.iconBg} rounded-full flex items-center justify-center border sm:border-2 border-white shadow-lg`}>
          <span className="text-[9px] sm:text-xs font-black text-white drop-shadow">{index + 1}</span>
        </div>
        
        {/* 🚀 Completed star - SIMPLIFIED: removed confetti particles */}
        {isCompleted && (
          <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center border sm:border-2 border-white shadow-lg">
            <span className="text-[10px] sm:text-sm">⭐</span>
          </div>
        )}
      </motion.button>
      
      {/* Name - Hiển thị đầy đủ, không cắt */}
      <p className={`mt-1.5 sm:mt-2 md:mt-3 text-[9px] sm:text-[11px] md:text-xs font-bold text-center leading-tight drop-shadow-md ${
        isLocked ? 'text-white/70' : isCurrent ? 'text-yellow-200' : 'text-white'
      }`}
      style={{ 
        maxWidth: 110,
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
      <div className="flex flex-col items-center justify-center py-0.5 gap-0.5 sm:gap-1">
        {[...Array(3)].map((_, i) => (
          <motion.div 
            key={i} 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08, duration: 0.2 }}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${dotColor}`}
          />
        ))}
        {/* Mũi tên xuống */}
        <motion.span 
          className={`text-xs sm:text-sm font-bold ${arrowColor}`}
          animate={{ y: [0, 2, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ↓
        </motion.span>
      </div>
    );
  }
  
  // Horizontal: mũi tên theo hướng hiển thị trên màn hình
  // Hàng bình thường (1,2,3): sang phải ›
  // Hàng reversed (6,5,4 trên màn hình): sang trái ‹ (vì đường đi thực là 4→5→6)
  return (
    <div className="flex items-center justify-center px-0.5 sm:px-1 gap-0.5 sm:gap-1">
      {[...Array(3)].map((_, i) => (
        <motion.div 
          key={i} 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.08, duration: 0.2 }}
          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${dotColor}`}
        />
      ))}
      {/* Mũi tên theo hướng hiển thị */}
      <motion.span 
        className={`text-xs sm:text-sm font-bold ${arrowColor}`}
        animate={{ x: isReversed ? [0, -2, 0] : [0, 2, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {isReversed ? '‹' : '›'}
      </motion.span>
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
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <span className="text-indigo-600 font-bold">‹</span>
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
        className="overflow-x-auto pb-3 px-6 scrollbar-hide scroll-smooth cursor-grab select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-2 sm:gap-3 min-w-max">
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
                  flex-shrink-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm 
                  flex items-center gap-2 transition-all duration-150 whitespace-nowrap border-2
                  hover:scale-[1.02] active:scale-[0.98]
                  ${isActive 
                    ? 'bg-white text-indigo-600 shadow-xl shadow-white/40 border-yellow-400 scale-105' 
                    : 'bg-white/25 text-white hover:bg-white/35 border-white/40'
                  }
                `}
              >
                {/* Icon + Tên zone */}
                <span className="text-base sm:text-lg">{zone.icon}</span>
                <span className="font-bold">{zone.name}</span>
                {/* Progress badge */}
                <div className={`
                  px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black
                  ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-white/30 text-white'}
                `}>
                  {progress.completed}/{progress.total}
                </div>
                {/* 🚀 SIMPLIFIED: Static star instead of animated */}
                {isComplete && (
                  <span className="text-sm sm:text-base">⭐</span>
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
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <span className="text-indigo-600 font-bold">›</span>
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
  
  return (
    <div className="flex flex-col items-center gap-1 py-4 sm:py-6">
      {rows.map((row, rowIdx) => {
        const isReversed = rowIdx % 2 === 1;
        const displayRow = isReversed ? [...row].reverse() : row;
        const isLastRow = rowIdx === rows.length - 1;
        // Stage cuối hàng (trước khi reverse) để check completed cho vertical dots
        const lastStageInRow = row[row.length - 1];
        const lastStageCompleted = stageStatuses[lastStageInRow?.stageId] === 'completed';
        
        return (
          <div key={rowIdx} className="flex flex-col items-center">
            {/* Row của stages */}
            <div className="flex items-start justify-center">
              {displayRow.map((stage, colIdx) => {
                const actualIndex = rowIdx * 3 + (isReversed ? row.length - 1 - colIdx : colIdx);
                const status = stageStatuses[stage.stageId] || 'locked';
                const isLastInRow = colIdx === displayRow.length - 1;
                const currentCompleted = status === 'completed';
                
                return (
                  <div key={stage.stageId} className="flex items-center">
                    <StageNode stage={stage} status={status} onClick={onStageClick} index={actualIndex} />
                    {!isLastInRow && <PathDots direction="horizontal" isCompleted={currentCompleted} isReversed={isReversed} />}
                  </div>
                );
              })}
            </div>
            
            {/* Vertical dots - căn theo vị trí stage cuối hàng */}
            {!isLastRow && (
              <div className={`flex w-full ${isReversed ? 'justify-start' : 'justify-end'}`} style={{ paddingLeft: isReversed ? '10%' : 0, paddingRight: isReversed ? 0 : '10%' }}>
                <PathDots direction="vertical" isCompleted={lastStageCompleted} />
              </div>
            )}
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

// ===== HEADER - Hiển thị Tier, Streak, Stars, Diamonds =====
function GameHeader({ totalStages, completedStages, userStats }) {
  const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

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

  // Tier badge config - phải khớp với tier values trong database
  const tierConfig = {
    free: { label: 'Miễn phí', icon: '🌟', bg: 'from-gray-400 to-gray-500' },
    trial: { label: `Dùng thử`, icon: '🔥', bg: 'from-orange-400 to-red-500', showDays: true },
    basic: { label: 'Cơ Bản', icon: '✓', bg: 'from-blue-400 to-cyan-500' },
    advanced: { label: 'Nâng Cao', icon: '⭐', bg: 'from-violet-500 to-fuchsia-500' },
    vip: { label: 'VIP', icon: '👑', bg: 'from-amber-400 to-orange-500' },
    // Legacy keys for backward compatibility
    nangcao: { label: 'Nâng Cao', icon: '⭐', bg: 'from-violet-500 to-fuchsia-500' },
    premium: { label: 'VIP', icon: '👑', bg: 'from-amber-400 to-orange-500' }
  };

  const currentTier = tierConfig[tier] || tierConfig.free;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-lg border-b border-violet-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between">
        {/* Left: Logo link to dashboard - icon on mobile, with text on larger screens */}
        <Link href="/dashboard" className="flex-shrink-0">
          {/* Mobile: chỉ icon */}
          <div className="sm:hidden">
            <Logo size="sm" showText={false} />
          </div>
          {/* Desktop: có chữ với gradient gốc */}
          <div className="hidden sm:block">
            <Logo size="sm" showText={true} />
          </div>
        </Link>
        
        {/* Center: Stats */}
        <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center">
          {/* Tier Badge */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gradient-to-r ${currentTier.bg} shadow-md`}
          >
            <span className="text-xs sm:text-sm">{currentTier.icon}</span>
            <span className="text-[9px] sm:text-xs font-bold text-white hidden xs:inline">{currentTier.label}</span>
            {currentTier.showDays && trialDays > 0 && (
              <span className="text-[9px] sm:text-xs font-bold text-white">{trialDays}d</span>
            )}
          </motion.div>
          
          {/* Streak */}
          {userStats?.streak > 0 && (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-orange-500/90 shadow-md"
            >
              <motion.span 
                className="text-xs sm:text-sm"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                🔥
              </motion.span>
              <span className="text-[10px] sm:text-xs font-bold text-white">{userStats.streak}</span>
            </motion.div>
          )}
          
          {/* Stars */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-amber-400 shadow-md"
          >
            <span className="text-xs sm:text-sm">⭐</span>
            <span className="text-[10px] sm:text-xs font-bold text-white">
              {(userStats?.totalStars || 0).toLocaleString()}
            </span>
          </motion.div>
          
          {/* Diamonds - dùng icon rõ ràng hơn */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-sky-400 shadow-md"
          >
            <motion.span 
              className="text-xs sm:text-sm"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              💠
            </motion.span>
            <span className="text-[10px] sm:text-xs font-bold text-white">{userStats?.diamonds || 0}</span>
          </motion.div>
        </div>
        
        {/* Right: Progress */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 bg-violet-100 rounded-full px-2 py-1">
            <div className="w-12 sm:w-20 md:w-32 lg:w-40 h-1.5 md:h-2 bg-violet-200 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
            </div>
            <span className="text-violet-700 text-[10px] md:text-xs font-medium">{progress}%</span>
          </div>
          {/* Mobile: just show completed count */}
          <div className="sm:hidden flex items-center gap-0.5 bg-violet-100 rounded-full px-1.5 py-0.5">
            <span className="text-[10px] font-bold text-violet-700">{completedStages}/{totalStages}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ===== MAP SELECTOR - Responsive =====
function MapSelector({ currentMap, onSelect, hasCertAddSub }) {
  return (
    <div className="flex justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect('addsub')}
        className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all ${
          currentMap === 'addsub'
            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-400/30'
            : 'bg-white/10 text-white/70 hover:bg-white/20'
        }`}
      >
        <span className="text-base sm:text-lg">➕➖</span>
        <span>Cộng Trừ</span>
      </motion.button>
      
      <motion.button
        whileHover={hasCertAddSub ? { scale: 1.05 } : undefined}
        whileTap={hasCertAddSub ? { scale: 0.95 } : undefined}
        onClick={() => hasCertAddSub && onSelect('muldiv')}
        disabled={!hasCertAddSub}
        className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all ${
          currentMap === 'muldiv'
            ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-400/30'
            : !hasCertAddSub
              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
        }`}
      >
        <span className="text-base sm:text-lg">✖️➗</span>
        <span>Nhân Chia</span>
        {!hasCertAddSub && <span className="text-xs sm:text-sm">🔒</span>}
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
    <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-600 relative overflow-hidden">
      {/* 🚀 OPTIMIZED: Background decorations with CSS animations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 🚀 REDUCED: Only 10 stars with CSS animation instead of 30 with Framer */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-200/70 animate-pulse"
            style={{ 
              left: `${8 + i * 9}%`, 
              top: `${10 + (i % 4) * 22}%`, 
              fontSize: 10 + (i % 3) * 6,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + (i % 3)}s`
            }}
          >
            ✦
          </div>
        ))}
        
        {/* 🚀 SIMPLIFIED: 2 clouds with CSS animation */}
        <div
          className="absolute text-7xl opacity-20 animate-cloud-slow"
          style={{ top: '8%', left: '-10%' }}
        >
          ☁️
        </div>
        <div
          className="absolute text-5xl opacity-15 animate-cloud-slow"
          style={{ top: '30%', left: '-5%', animationDelay: '10s' }}
        >
          ☁️
        </div>
        
        {/* 🚀 REDUCED: Only 3 floating icons with simpler animations */}
        <div className="absolute text-3xl animate-float" style={{ top: '15%', right: '10%' }}>💎</div>
        <div className="absolute text-4xl animate-float" style={{ top: '60%', right: '5%', animationDelay: '1s' }}>🏆</div>
        <div className="absolute text-2xl animate-float" style={{ top: '40%', left: '8%', animationDelay: '2s' }}>✨</div>
        
        {/* 🚀 REMOVED: Rising bubbles, shimmer lines - too heavy */}
      </div>
      
      <GameHeader totalStages={totalStages} completedStages={completedStagesCount} userStats={userStats} />
      
      {/* Title with animation - Responsive */}
      <div className="text-center py-3 sm:py-5 relative z-10 px-4">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="text-lg sm:text-2xl md:text-3xl font-black text-white drop-shadow-lg relative inline-block"
        >
          {/* Sparkle decorations - hidden on mobile */}
          <motion.span
            className="hidden sm:inline-block absolute -left-8 sm:-left-12 top-0 text-lg sm:text-xl"
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ✨
          </motion.span>
          <motion.span
            className="hidden sm:inline-block absolute -right-8 sm:-right-12 top-0 text-lg sm:text-xl"
            animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          >
            ✨
          </motion.span>
          
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block"
          >
            🗺️
          </motion.span>
          {' '}<span className="hidden sm:inline">Đi Tìm</span><span className="sm:hidden">Tìm</span> Kho Báu Tri Thức{' '}
          <motion.span
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-block"
          >
            💎
          </motion.span>
        </motion.h1>
        <motion.p 
          className="text-white/70 text-xs sm:text-sm mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Khám phá thế giới Soroban kỳ diệu!
        </motion.p>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <MapSelector currentMap={currentMap} onSelect={setCurrentMap} hasCertAddSub={hasCertAddSub} />
        <ZoneTabs zones={zones} activeZoneId={activeZoneId} onSelect={setActiveZoneId} zoneProgress={zoneProgress} />
      </div>
      
      {activeZone && (
        <div className="max-w-2xl lg:max-w-3xl mx-auto px-4 py-4 relative z-10">
          {/* Zone Card - More colorful with rainbow border and shimmer */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative rounded-3xl p-[4px] mb-6"
          >
            {/* Animated rainbow border */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
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
            <div className={`rounded-[20px] p-3 sm:p-5 md:p-6 bg-gradient-to-br ${activeZone.color} relative overflow-hidden`}>
              {/* Shimmer overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
              
              <div className="flex items-center gap-2 sm:gap-4 relative z-10">
                <motion.div 
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-10 h-10 sm:w-14 sm:h-14 bg-white/30 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0 backdrop-blur-sm"
                >
                  <span className="text-xl sm:text-3xl md:text-4xl">{activeZone.icon}</span>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-xl md:text-2xl font-black text-white drop-shadow truncate">{activeZone.name}</h2>
                  <p className="text-white/80 text-xs sm:text-sm truncate">{activeZone.subtitle}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <motion.p 
                    className="text-lg sm:text-2xl md:text-3xl font-black text-white drop-shadow"
                    key={zoneProgress[activeZoneId]?.completed}
                    initial={{ scale: 1.5, color: '#fef08a' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    transition={{ duration: 0.5 }}
                  >
                    {zoneProgress[activeZoneId]?.completed || 0}/{zoneProgress[activeZoneId]?.total || 0}
                  </motion.p>
                  <p className="text-white/70 text-[10px] sm:text-xs">hoàn thành</p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 h-2 sm:h-3 bg-white/40 rounded-full overflow-hidden relative z-10 shadow-inner">
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
          
          <StageGrid stages={activeStages} stageStatuses={stageStatuses} onStageClick={handleStageClick} />
        </div>
      )}
      
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
