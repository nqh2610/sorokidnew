'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// 🎨 MAP DECORATIONS - Trang trí sinh động cho map
// Kết hợp CSS animations và Framer Motion
// ============================================================

// Floating icon với motion animation
const FloatingIcon = memo(function FloatingIcon({ emoji, position, size = 'text-2xl', delay = 0 }) {
  return (
    <motion.div 
      className={`fixed ${size} opacity-50 pointer-events-none select-none z-10`}
      style={position}
      animate={{ 
        y: [0, -12, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ 
        duration: 4, 
        delay, 
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {emoji}
    </motion.div>
  );
});

// Sparkle icon - nhấp nháy
const SparkleIcon = memo(function SparkleIcon({ emoji, position, delay = 0 }) {
  return (
    <motion.div 
      className="fixed text-lg sm:text-xl opacity-60 pointer-events-none select-none z-10"
      style={position}
      animate={{ 
        scale: [0.8, 1.2, 0.8],
        opacity: [0.3, 0.7, 0.3]
      }}
      transition={{ 
        duration: 2, 
        delay, 
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {emoji}
    </motion.div>
  );
});

// Bouncing icon - nhảy lên xuống
const BouncingIcon = memo(function BouncingIcon({ emoji, position, delay = 0 }) {
  return (
    <motion.div 
      className="fixed text-xl sm:text-2xl opacity-45 pointer-events-none select-none z-10"
      style={position}
      animate={{ 
        y: [0, -15, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{ 
        duration: 1.5, 
        delay, 
        repeat: Infinity,
        ease: 'easeOut'
      }}
    >
      {emoji}
    </motion.div>
  );
});

export default function MapDecorations() {
  // Memoize positions để không re-render
  const decorations = useMemo(() => ({
    floating: [
      // Left side
      { emoji: '🧭', position: { top: '15%', left: '3%' }, delay: 0 },
      { emoji: '📐', position: { bottom: '30%', left: '2%' }, size: 'text-xl', delay: 1 },
      { emoji: '🧮', position: { top: '45%', left: '4%' }, size: 'text-xl', delay: 2 },
      // Right side
      { emoji: '🗺️', position: { top: '18%', right: '4%' }, delay: 0.5 },
      { emoji: '💎', position: { bottom: '35%', right: '3%' }, size: 'text-xl', delay: 1.5 },
      { emoji: '🏆', position: { top: '50%', right: '5%' }, size: 'text-xl', delay: 2.5 },
    ],
    sparkles: [
      { emoji: '✨', position: { top: '25%', left: '6%' }, delay: 0 },
      { emoji: '⭐', position: { top: '35%', right: '6%' }, delay: 0.5 },
      { emoji: '✨', position: { bottom: '45%', left: '5%' }, delay: 1 },
      { emoji: '🌟', position: { bottom: '40%', right: '4%' }, delay: 1.5 },
      { emoji: '💫', position: { top: '60%', left: '3%' }, delay: 2 },
      { emoji: '✨', position: { top: '55%', right: '5%' }, delay: 2.5 },
    ],
    bouncing: [
      { emoji: '📚', position: { top: '70%', left: '4%' }, delay: 0 },
      { emoji: '🎯', position: { top: '65%', right: '4%' }, delay: 0.3 },
    ],
    // Math symbols - subtle
    mathSymbols: [
      { emoji: '∑', position: { top: '28%', left: '4%' }, delay: 0.3 },
      { emoji: '√', position: { top: '42%', right: '4%' }, delay: 0.8 },
      { emoji: 'π', position: { bottom: '50%', left: '3%' }, delay: 1.3 },
      { emoji: '∞', position: { bottom: '48%', right: '3%' }, delay: 1.8 },
    ]
  }), []);

  return (
    <>
      {/* Floating decorations */}
      {decorations.floating.map((item, i) => (
        <FloatingIcon key={`float-${i}`} {...item} />
      ))}
      
      {/* Sparkle effects */}
      {decorations.sparkles.map((item, i) => (
        <SparkleIcon key={`sparkle-${i}`} {...item} />
      ))}
      
      {/* Bouncing icons */}
      {decorations.bouncing.map((item, i) => (
        <BouncingIcon key={`bounce-${i}`} {...item} />
      ))}
      
      {/* Math symbols - more subtle */}
      {decorations.mathSymbols.map((item, i) => (
        <motion.div 
          key={`math-${i}`}
          className="fixed text-2xl sm:text-3xl opacity-25 pointer-events-none select-none z-10 font-serif"
          style={item.position}
          animate={{ 
            y: [0, -8, 0],
            opacity: [0.2, 0.35, 0.2]
          }}
          transition={{ 
            duration: 5, 
            delay: item.delay, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
      
      {/* Corner glow effects */}
      <div className="fixed top-0 left-0 w-32 h-32 bg-gradient-radial from-yellow-400/10 to-transparent pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-32 h-32 bg-gradient-radial from-pink-400/10 to-transparent pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-32 h-32 bg-gradient-radial from-green-400/10 to-transparent pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-32 h-32 bg-gradient-radial from-blue-400/10 to-transparent pointer-events-none z-0" />
    </>
  );
}

export const DECORATIONS_CONFIG = { enabled: true };
