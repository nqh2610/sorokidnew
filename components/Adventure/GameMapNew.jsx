'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo/Logo';
import { useGameSound } from '@/lib/useGameSound';
import { initSoundSystem } from '@/lib/soundManager';
import SoundSettingsPanel from '@/components/SoundSettings/SoundSettingsPanel';

// Import narrative config
import { STORY_OVERVIEW, GAMEPLAY_NARRATIVES } from '@/config/narrative.config';

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

// ===== PROLOGUE MODAL - Màn hình intro cho người mới =====
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="w-full max-w-md bg-gradient-to-b from-indigo-900 to-purple-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400/50"
      >
        {/* Scene illustration area */}
        <div className="relative h-48 bg-gradient-to-b from-indigo-800/50 to-transparent flex items-center justify-center">
          {/* Floating stars */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-300"
              style={{ 
                left: `${10 + Math.random() * 80}%`, 
                top: `${10 + Math.random() * 70}%`,
                fontSize: 10 + Math.random() * 14
              }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: i * 0.3 }}
            >
              ✦
            </motion.div>
          ))}
          
          {/* Main icon based on scene */}
          <motion.div
            key={currentScene}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-center text-lg leading-relaxed font-medium"
          >
            {scene.narrative}
          </motion.p>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {scenes.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentScene ? 'bg-amber-400 w-6' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          
          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="w-full mt-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl shadow-lg"
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

// ===== FLOATING CÚ SORO - Nhân vật dẫn chuyện với nhiều animation =====
function CuSoro({ message, isVisible, onToggle }) {
  return (
    <motion.div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
      initial={{ scale: 0, y: 100 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
    >
      {/* Sparkles floating around Cú Soro */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-300"
            style={{ 
              left: `${10 + Math.random() * 80}%`, 
              top: `${Math.random() * 90}%`,
              fontSize: 8 + Math.random() * 10
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
              y: [0, -15, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: i * 0.4
            }}
          >
            ✦
          </motion.div>
        ))}
      </div>
      
      {/* Speech bubble - Hiển thị bên TRÁI Cú Soro để không che nội dung */}
      <AnimatePresence>
        {isVisible && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            onClick={() => onToggle()} // Click để đóng
            className="absolute bottom-2 sm:bottom-4 right-full mr-2 sm:mr-3 w-48 sm:w-56 md:w-64 p-2.5 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ 
              border: '2px solid #fbbf24',
              transformOrigin: 'right center'
            }}
          >
            {/* Shimmer effect on bubble */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/50 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
            {/* Mũi tên chỉ sang phải (về phía Cú) */}
            <div className="absolute top-1/2 -right-2 sm:-right-2.5 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 bg-white border-r-2 border-t-2 border-amber-400 rotate-45" />
            <p className="text-gray-700 text-xs sm:text-sm font-medium leading-relaxed relative z-10">{message}</p>
            <div className="flex items-center justify-between mt-1.5 sm:mt-2 relative z-10">
              <span className="text-[9px] sm:text-[10px] text-gray-400">Chạm để đóng</span>
              <span className="text-amber-500 text-[9px] sm:text-[10px]">🦉 Cú Soro</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Cú character - Responsive với rainbow glow */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ y: { duration: 2, repeat: Infinity } }}
        className="relative"
      >
        {/* Rainbow glow effect - nhỏ hơn trên mobile */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #f472b6, #fb923c, #facc15, #4ade80, #22d3ee, #a78bfa, #f472b6)',
            filter: 'blur(12px)',
            width: '120%',
            height: '120%',
            left: '-10%',
            top: '-10%'
          }}
          animate={{ 
            opacity: [0.4, 0.7, 0.4], 
            scale: [0.9, 1.1, 0.9],
            rotate: [0, 360]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner glow effect */}
        <motion.div 
          className="absolute inset-0 bg-amber-400 rounded-full blur-lg sm:blur-xl"
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Main body - Responsive */}
        <motion.div 
          className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl border-2 sm:border-4 border-white"
          animate={{ boxShadow: ['0 0 15px rgba(251, 191, 36, 0.5)', '0 0 30px rgba(251, 191, 36, 0.8)', '0 0 15px rgba(251, 191, 36, 0.5)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span 
            className="text-2xl sm:text-4xl md:text-5xl"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🦉
          </motion.span>
        </motion.div>
        
        {/* Name tag */}
        <motion.div 
          className="absolute -bottom-5 sm:-bottom-7 left-0 right-0 flex justify-center"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] sm:text-[9px] md:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
            Cú Soro
          </span>
        </motion.div>
        
        {/* Notification badge với pulse ring */}
        {message && !isVisible && (
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg"
          >
            <span className="text-white text-xs font-bold">!</span>
            {/* Pulse ring animation */}
            <motion.div
              className="absolute inset-0 bg-red-400 rounded-full"
              animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        )}
      </motion.button>
    </motion.div>
  );
}

// ===== STAGE NODE =====
function StageNode({ stage, status, onClick, index }) {
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
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 200 }}
    >
      {/* Current indicator - bouncing arrow */}
      {isCurrent && (
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute -top-10 sm:-top-14 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg border-2 border-white">
            <span className="text-[10px] sm:text-sm font-black text-white">🎮 CHƠI!</span>
          </div>
          <div className="w-0 h-0 border-l-4 sm:border-l-8 border-r-4 sm:border-r-8 border-t-4 sm:border-t-8 border-transparent border-t-orange-500 mx-auto" />
        </motion.div>
      )}
      
      {/* Glow effect for current */}
      {style.glow && (
        <>
          <motion.div
            className="absolute rounded-full bg-yellow-400 -inset-3 sm:-inset-4"
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.div
            className="absolute rounded-full bg-orange-300 -inset-2 sm:-inset-3"
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
          />
        </>
      )}
      
      {/* Main button - Responsive w/h */}
      <motion.button
        onClick={() => onClick(stage)}
        whileHover={{ scale: 1.1, rotate: [-2, 2, 0] }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative rounded-full bg-gradient-to-br ${style.bg}
          ${isBoss || isTreasure ? 'w-14 h-14 sm:w-[72px] sm:h-[72px] md:w-20 md:h-20' : 'w-12 h-12 sm:w-[64px] sm:h-[64px] md:w-[72px] md:h-[72px]'}
          shadow-xl ${style.shadow}
          flex items-center justify-center
          border-2 sm:border-4 ${isLocked ? 'border-white/50' : 'border-white'}
          cursor-pointer
          transition-transform
        `}
      >
        {/* Shine effect */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/50 via-white/20 to-transparent" />
        
        {/* Icon - Locked hiện ?, Boss hiện 🐲 */}
        <motion.span 
          className={`relative ${isBoss || isTreasure ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-3xl'} ${isLocked ? 'opacity-80' : ''}`}
          animate={isCurrent ? { rotate: [0, -10, 10, 0] } : isLocked ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: isCurrent ? 0.5 : 2, repeat: Infinity, repeatDelay: isCurrent ? 1 : 0 }}
        >
          {isLocked 
            ? (isBoss ? '🐲' : isTreasure ? '🎁' : '❓') 
            : (isBoss ? '👹' : stage.icon)
          }
        </motion.span>
        
        {/* Number badge - Responsive */}
        <div className={`absolute -top-0.5 sm:-top-1 -left-0.5 sm:-left-1 w-5 h-5 sm:w-7 sm:h-7 ${style.iconBg} rounded-full flex items-center justify-center border sm:border-2 border-white shadow-lg`}>
          <span className="text-[9px] sm:text-xs font-black text-white drop-shadow">{index + 1}</span>
        </div>
        
        {/* Completed star with animation and confetti effect */}
        {isCompleted && (
          <>
            {/* Mini confetti particles */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ['#fbbf24', '#f472b6', '#4ade80', '#60a5fa'][i],
                  left: '50%',
                  top: '50%'
                }}
                animate={{
                  x: [0, (i % 2 === 0 ? 1 : -1) * (15 + i * 8)],
                  y: [0, -20 - i * 5, 10],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  repeatDelay: 3
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center border sm:border-2 border-white shadow-lg"
              >
                <span className="text-[10px] sm:text-sm">⭐</span>
              </motion.div>
            </motion.div>
          </>
        )}
      </motion.button>
      
      {/* Name - Responsive */}
      <p className={`mt-1.5 sm:mt-2 md:mt-3 text-[8px] sm:text-[10px] md:text-xs font-bold text-center leading-tight drop-shadow-md ${
        isLocked ? 'text-white/70' : isCurrent ? 'text-yellow-200' : 'text-white'
      }`}
      style={{ maxWidth: 80, minHeight: '2em', wordBreak: 'keep-all' }}
      >
        {stage.name}
      </p>
    </motion.div>
  );
}

// ===== PATH DOTS - Đường nối các màn =====
function PathDots({ direction, isCompleted }) {
  const count = direction === 'horizontal' ? 3 : 2;
  return (
    <div className={`flex ${direction === 'vertical' ? 'flex-col h-8 sm:h-12' : 'w-8 sm:w-14 md:w-20'} items-center justify-center gap-0.5 sm:gap-1`}>
      {[...Array(count)].map((_, i) => (
        <motion.div 
          key={i} 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            backgroundColor: isCompleted ? '#34d399' : 'rgba(255,255,255,0.6)'
          }}
          transition={{ delay: i * 0.15, duration: 0.3 }}
          className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${isCompleted ? 'bg-emerald-400 shadow-emerald-400/50 shadow-md' : 'bg-white/60'}`}
        />
      ))}
      {/* Mũi tên chỉ hướng */}
      {direction === 'horizontal' && (
        <motion.span 
          className={`text-xs ${isCompleted ? 'text-emerald-400' : 'text-white/50'}`}
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ›
        </motion.span>
      )}
    </div>
  );
}

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
      {/* Left scroll arrow */}
      <AnimatePresence>
        {showLeftArrow && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
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
              <motion.button
                key={zone.zoneId}
                onClick={() => handleZoneClick(zone.zoneId)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex-shrink-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm 
                  flex items-center gap-2 transition-all whitespace-nowrap border-2
                  ${isActive 
                    ? 'bg-white text-indigo-600 shadow-xl shadow-white/40 border-yellow-400 scale-105' 
                    : 'bg-white/25 text-white hover:bg-white/35 border-white/40'
                  }
                `}
              >
                {/* Tên zone - không có icon để tránh trùng với Zone Card */}
                <span className="font-bold">{zone.name}</span>
                {/* Progress badge */}
                <div className={`
                  px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black
                  ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-white/30 text-white'}
                `}>
                  {progress.completed}/{progress.total}
                </div>
                {isComplete && (
                  <motion.span 
                    className="text-sm sm:text-base"
                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ⭐
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* Right scroll arrow */}
      <AnimatePresence>
        {showRightArrow && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
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
    <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 py-4 sm:py-6">
      {rows.map((row, rowIdx) => {
        const isReversed = rowIdx % 2 === 1;
        const displayRow = isReversed ? [...row].reverse() : row;
        
        return (
          <div key={rowIdx}>
            <div className="flex items-start justify-center gap-1 sm:gap-2 md:gap-4">
              {displayRow.map((stage, colIdx) => {
                const actualIndex = rowIdx * 3 + (isReversed ? row.length - 1 - colIdx : colIdx);
                const status = stageStatuses[stage.stageId] || 'locked';
                const isLastInRow = colIdx === displayRow.length - 1;
                const prevCompleted = actualIndex > 0 && stageStatuses[stages[actualIndex - 1]?.stageId] === 'completed';
                
                return (
                  <div key={stage.stageId} className="flex items-center">
                    <StageNode stage={stage} status={status} onClick={onStageClick} index={actualIndex} />
                    {!isLastInRow && <PathDots direction="horizontal" isCompleted={prevCompleted} />}
                  </div>
                );
              })}
            </div>
            
            {rowIdx < rows.length - 1 && (
              <div className={`flex ${isReversed ? 'justify-start ml-6 sm:ml-10 md:ml-12' : 'justify-end mr-6 sm:mr-10 md:mr-12'} my-1 sm:my-2`}>
                <PathDots direction="vertical" isCompleted={stageStatuses[row[row.length - 1]?.stageId] === 'completed'} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===== STAGE MODAL - Responsive =====
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
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
    >
      {/* Background confetti for completed stages - less on mobile */}
      {status === 'completed' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full"
              style={{
                background: ['#fbbf24', '#f472b6', '#4ade80', '#60a5fa', '#a78bfa'][i % 5],
                left: `${Math.random() * 100}%`,
                top: '-10px'
              }}
              animate={{
                y: [0, window?.innerHeight || 800],
                x: [0, (Math.random() - 0.5) * 200],
                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeIn'
              }}
            />
          ))}
        </div>
      )}
      
      <motion.div
        initial={{ scale: 0.5, y: 100, rotateY: -30 }}
        animate={{ scale: 1, y: 0, rotateY: 0 }}
        exit={{ scale: 0.5, y: 100, rotateY: 30 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[320px] sm:max-w-sm bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Rainbow border animation */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: 'linear-gradient(90deg, #f472b6, #fb923c, #facc15, #4ade80, #22d3ee, #a78bfa, #f472b6)',
            backgroundSize: '200% 100%',
            padding: '3px'
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner content */}
        <div className="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden m-[3px]">
          <div className={`p-4 sm:p-6 bg-gradient-to-br ${
            isBoss ? 'from-rose-500 to-red-600' :
            isTreasure ? 'from-purple-500 to-violet-600' :
            status === 'completed' ? 'from-emerald-500 to-green-600' :
            'from-blue-500 to-indigo-600'
          } relative overflow-hidden`}>
            {/* Sparkles in header - hidden on mobile */}
            <div className="hidden sm:block">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-200"
                  style={{
                    left: `${15 + i * 18}%`,
                    top: `${20 + (i % 2) * 40}%`,
                    fontSize: 10 + Math.random() * 8
                  }}
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.8, 1.2, 0.8],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                >
                  ✦
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }} 
              transition={{ duration: 2, repeat: Infinity }} 
              className="text-4xl sm:text-6xl text-center mb-1 sm:mb-2 relative z-10"
            >
              {stage.icon}
            </motion.div>
            <h3 className="text-lg sm:text-xl font-black text-white text-center relative z-10">{stage.name}</h3>
            {status === 'completed' && (
              <motion.p 
                className="text-white/80 text-center text-sm mt-1 relative z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⭐ Đã hoàn thành ⭐
              </motion.p>
            )}
            {isLocked && (
              <motion.p 
                className="text-white/90 text-center text-sm mt-1 relative z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🔒 Màn chơi chưa mở khóa
              </motion.p>
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-lg text-sm sm:text-base"
                >
                  Đã hiểu! 👍
                </motion.button>
              </>
            ) : (
              <>
                <p className="text-gray-600 text-center mb-4 sm:mb-6 text-sm sm:text-base">{stage.description}</p>
                <div className="flex gap-2 sm:gap-2 sm:gap-3">
                  <motion.button 
                    onClick={onClose} 
                    whileHover={{ scale: 1.02, backgroundColor: '#e5e7eb' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 sm:py-3 rounded-xl bg-gray-100 text-gray-600 font-bold transition-colors text-sm sm:text-base"
                  >
                    Đóng
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStart}
                    className={`flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-white shadow-lg relative overflow-hidden text-sm sm:text-base ${
                      status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    }`}
                  >
                    {/* Button shimmer */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    />
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
  const [cuSoroVisible, setCuSoroVisible] = useState(true);
  const [initialZoneSet, setInitialZoneSet] = useState(!!returnZone?.zoneId);
  
  // 🦉 State cho Prologue (màn intro)
  const [showPrologue, setShowPrologue] = useState(false);
  const [lastActiveZoneId, setLastActiveZoneId] = useState(null);

  const stages = currentMap === 'addsub' ? addSubStages : mulDivStages;
  const zones = currentMap === 'addsub' ? addSubZones : mulDivZones;
  
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

  // Reset activeZoneId khi chuyển map (chỉ nếu không phải lần đầu với returnZone)
  useEffect(() => {
    if (zones.length > 0 && !initialZoneSet) {
      // Tìm zone có current stage hoặc lấy zone đầu tiên
      const currentStage = stages.find(s => stageStatuses[s.stageId] === 'current');
      if (currentStage) {
        setActiveZoneId(currentStage.zoneId);
      } else {
        setActiveZoneId(zones[0].zoneId);
      }
    }
    // Sau lần đầu, cho phép reset bình thường
    if (initialZoneSet) {
      setInitialZoneSet(false);
    }
  }, [currentMap]); // Chỉ chạy khi currentMap thay đổi
  
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
  
  const activeZone = zones.find(z => z.zoneId === activeZoneId);
  const activeStages = stages.filter(s => s.zoneId === activeZoneId);
  
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
  
  const totalStages = stages.length;
  const completedStages = stages.filter(s => stageStatuses[s.stageId] === 'completed').length;
  
  // 🦉 Khi click vào stage, hiện lời dẫn phù hợp
  const handleStageClick = useCallback((stage) => {
    const status = stageStatuses[stage.stageId];
    
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
  }, [stageStatuses, play, onTierCheck]);
  
  const handleStartStage = useCallback(() => {
    if (selectedStage?.link) {
      // 🔊 Play game start sound
      play('gameStart');
      // Tier đã được check trước khi mở modal rồi, chỉ cần navigate
      onStageClick ? onStageClick(selectedStage) : router.push(selectedStage.link);
    }
    setSelectedStage(null);
  }, [selectedStage, router, onStageClick, play]);
  
  // Generate random stars for background - phải ở trước điều kiện return
  const stars = useMemo(() => 
    [...Array(30)].map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 8 + Math.random() * 12,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2
    })), []
  );
  
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
      {/* Floating stars background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-200"
            style={{ left: star.left, top: star.top, fontSize: star.size }}
            animate={{ 
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.4, 1],
            }}
            transition={{ 
              duration: star.duration, 
              repeat: Infinity,
              delay: star.delay
            }}
          >
            ✦
          </motion.div>
        ))}
        
        {/* Floating clouds */}
        <motion.div
          className="absolute text-7xl opacity-30"
          style={{ top: '8%', left: '-10%' }}
          animate={{ x: ['0%', '120%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          ☁️
        </motion.div>
        <motion.div
          className="absolute text-5xl opacity-25"
          style={{ top: '25%', left: '-5%' }}
          animate={{ x: ['0%', '130%'] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear', delay: 8 }}
        >
          ☁️
        </motion.div>
        <motion.div
          className="absolute text-6xl opacity-20"
          style={{ top: '50%', left: '-8%' }}
          animate={{ x: ['0%', '125%'] }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear', delay: 15 }}
        >
          ☁️
        </motion.div>
        
        {/* Floating sparkle icons - NEW! */}
        <motion.div
          className="absolute text-3xl"
          style={{ top: '15%', right: '10%' }}
          animate={{ 
            y: [0, -20, 0], 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          💎
        </motion.div>
        <motion.div
          className="absolute text-2xl"
          style={{ top: '35%', left: '8%' }}
          animate={{ 
            y: [0, -15, 0],
            x: [0, 10, 0],
            rotate: [0, -15, 15, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        >
          🌟
        </motion.div>
        <motion.div
          className="absolute text-4xl"
          style={{ top: '60%', right: '5%' }}
          animate={{ 
            y: [0, -25, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          🏆
        </motion.div>
        <motion.div
          className="absolute text-2xl"
          style={{ top: '75%', left: '12%' }}
          animate={{ 
            rotate: [0, 360],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        >
          ✨
        </motion.div>
        <motion.div
          className="absolute text-3xl"
          style={{ top: '45%', right: '15%' }}
          animate={{ 
            y: [0, -30, 0],
            x: [0, -10, 0]
          }}
          transition={{ duration: 4.5, repeat: Infinity, delay: 1.5 }}
        >
          ⭐
        </motion.div>
        
        {/* Rising bubbles effect */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute w-4 h-4 bg-white/20 rounded-full"
            style={{ 
              left: `${10 + i * 12}%`,
              bottom: '-20px'
            }}
            animate={{ 
              y: [0, -800],
              opacity: [0.6, 0],
              scale: [1, 0.5]
            }}
            transition={{ 
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'easeOut'
            }}
          />
        ))}
        
        {/* Shimmer lines */}
        <motion.div
          className="absolute top-20 left-0 w-1/2 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
        />
        <motion.div
          className="absolute top-40 right-0 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-yellow-200/40 to-transparent"
          animate={{ x: ['100%', '-200%'] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 7, delay: 2 }}
        />
      </div>
      
      <GameHeader totalStages={totalStages} completedStages={completedStages} userStats={userStats} />
      
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
