'use client';

import { motion } from 'framer-motion';
import { playSound } from '@/lib/soundManager';

/**
 * 🎮 MODE CARD COMPONENT
 * 
 * Card chọn mode với giao diện đơn giản, trực quan cho học sinh tiểu học
 * - Emoji lớn, nổi bật
 * - Ít text, nhiều hình ảnh
 * - Touch-friendly (44px+ touch targets)
 * - Animations mượt
 * 
 * Usage:
 * <ModeCard
 *   emoji="🌟"
 *   title="Siêu Cộng"
 *   gradient="from-green-400 to-emerald-500"
 *   onClick={() => selectMode('addition')}
 * />
 */

export default function ModeCard({
  emoji,
  title,
  subtitle,
  gradient = 'from-purple-500 to-pink-500',
  locked = false,
  special = false,
  selected = false,
  onClick,
  className = '',
}) {
  const handleClick = () => {
    if (!locked) {
      playSound('click');
    }
    if (onClick) onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={locked ? {} : { scale: 1.05, y: -4 }}
      whileTap={locked ? {} : { scale: 0.95 }}
      className={`
        relative overflow-hidden
        flex flex-col items-center justify-center
        min-h-[100px] sm:min-h-[120px]
        p-4 sm:p-5
        rounded-3xl
        bg-gradient-to-br ${gradient}
        shadow-lg hover:shadow-xl
        transition-shadow duration-300
        ${locked ? 'opacity-60 grayscale' : ''}
        ${special ? 'ring-2 ring-yellow-400/70 ring-offset-2 ring-offset-transparent' : ''}
        ${selected ? 'ring-4 ring-white' : ''}
        ${className}
      `}
    >
      {/* Shine effect on hover */}
      <div className="
        absolute inset-0 
        bg-gradient-to-tr from-white/0 via-white/20 to-white/0
        translate-x-[-100%]
        group-hover:translate-x-[100%]
        transition-transform duration-700
      " />
      
      {/* Lock overlay */}
      {locked && (
        <div className="
          absolute inset-0 
          bg-black/40 backdrop-blur-sm
          flex items-center justify-center
          rounded-3xl
          z-10
        ">
          <span className="text-3xl">🔒</span>
        </div>
      )}
      
      {/* Special badge */}
      {special && !locked && (
        <div className="
          absolute -top-1 -right-1
          bg-yellow-400 text-yellow-900
          text-[10px] font-bold
          px-2 py-0.5
          rounded-full
          shadow-md
          z-10
        ">
          HOT
        </div>
      )}
      
      {/* Main emoji - BIG and centered */}
      <span className="
        text-5xl sm:text-6xl
        drop-shadow-lg
        mb-2
      ">
        {emoji}
      </span>
      
      {/* Title - Short and bold */}
      <span className="
        text-white font-bold
        text-sm sm:text-base
        text-center
        drop-shadow-md
        line-clamp-1
      ">
        {title}
      </span>
      
      {/* Subtitle - Optional, very small */}
      {subtitle && (
        <span className="
          text-white/70 
          text-[10px] sm:text-xs
          text-center
          line-clamp-1
        ">
          {subtitle}
        </span>
      )}
    </motion.button>
  );
}

/**
 * 🎯 DIFFICULTY BADGE
 * Badge chọn độ khó dạng pill
 */
export function DifficultyBadge({
  level,
  emoji,
  label,
  selected = false,
  locked = false,
  onClick,
}) {
  const handleClick = () => {
    if (!locked) {
      playSound('click');
    }
    if (onClick) onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={locked ? {} : { scale: 1.1 }}
      whileTap={locked ? {} : { scale: 0.95 }}
      className={`
        relative
        flex items-center gap-2
        px-4 py-3
        rounded-full
        font-bold
        transition-all duration-200
        min-h-[48px]
        ${selected 
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg ring-2 ring-white/50' 
          : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
        }
        ${locked ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {locked && (
        <span className="absolute -top-1 -right-1 text-sm">🔒</span>
      )}
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm hidden sm:inline">{label}</span>
    </motion.button>
  );
}

/**
 * 📱 MODE GRID
 * Grid layout responsive cho các ModeCard
 */
export function ModeGrid({ children, className = '' }) {
  return (
    <div className={`
      grid 
      grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
      gap-3 sm:gap-4
      ${className}
    `}>
      {children}
    </div>
  );
}

/**
 * 🏷️ DIFFICULTY SELECTOR
 * Row of difficulty badges
 */
export function DifficultySelector({ children, className = '' }) {
  return (
    <div className={`
      flex flex-wrap justify-center
      gap-2 sm:gap-3
      p-3 sm:p-4
      bg-white/5 backdrop-blur-md
      rounded-3xl
      border border-white/10
      ${className}
    `}>
      {children}
    </div>
  );
}

/**
 * 🎨 PRESET MODE CARDS
 * Các mode đã định nghĩa sẵn
 */
export const PRACTICE_MODES = [
  { 
    id: 'addition', 
    emoji: '➕', 
    title: 'Addition', 
    gradient: 'from-green-400 to-emerald-500',
    tier: 'free',
  },
  { 
    id: 'subtraction', 
    emoji: '➖', 
    title: 'Subtraction', 
    gradient: 'from-blue-400 to-cyan-500',
    tier: 'free',
  },
  { 
    id: 'addSubMixed', 
    emoji: '🔄', 
    title: 'Add & Sub Mix', 
    gradient: 'from-teal-400 to-emerald-500',
    tier: 'basic',
  },
  { 
    id: 'multiplication', 
    emoji: '✖️', 
    title: 'Multiplication', 
    gradient: 'from-purple-400 to-pink-500',
    tier: 'advanced',
  },
  { 
    id: 'division', 
    emoji: '➗', 
    title: 'Division', 
    gradient: 'from-rose-400 to-red-500',
    tier: 'advanced',
  },
  { 
    id: 'mulDiv', 
    emoji: '🎲', 
    title: 'Mul & Div Mix', 
    gradient: 'from-amber-400 to-orange-500',
    tier: 'advanced',
  },
  { 
    id: 'mixed', 
    emoji: '👑', 
    title: 'All Operations', 
    gradient: 'from-indigo-500 to-purple-600',
    tier: 'advanced',
  },
  { 
    id: 'mentalMath', 
    emoji: '🧠', 
    title: 'Mental Math', 
    gradient: 'from-violet-500 to-fuchsia-600',
    tier: 'advanced',
    special: true,
  },
  { 
    id: 'flashAnzan', 
    emoji: '⚡', 
    title: 'Flash Anzan', 
    gradient: 'from-yellow-400 to-orange-500',
    tier: 'advanced',
    special: true,
  },
];

export const DIFFICULTY_LEVELS = [
  { level: 1, emoji: '🐣', label: 'Beginner' },
  { level: 2, emoji: '⚔️', label: 'Warrior' },
  { level: 3, emoji: '🛡️', label: 'Hero' },
  { level: 4, emoji: '🔥', label: 'Master' },
  { level: 5, emoji: '👑', label: 'Legend' },
];
