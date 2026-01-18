'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// 🎨 MAP DECORATIONS - Trang trí tinh gọn cho map
// Giảm số lượng để không chồng chéo với ZoneBackground
// ============================================================

// Sparkle icon - nhấp nháy
const SparkleIcon = memo(function SparkleIcon({ emoji, position, delay = 0 }) {
  return (
    <motion.div 
      className="fixed text-base sm:text-lg opacity-50 pointer-events-none select-none z-10"
      style={position}
      animate={{ 
        scale: [0.8, 1.1, 0.8],
        opacity: [0.3, 0.6, 0.3]
      }}
      transition={{ 
        duration: 2.5, 
        delay, 
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {emoji}
    </motion.div>
  );
});

export default function MapDecorations() {
  // Chỉ giữ lại các sparkle nhỏ ở góc - không chồng chéo với ZoneBackground
  const sparkles = useMemo(() => [
    // Góc trên trái
    { emoji: '✨', position: { top: '8%', left: '12%' }, delay: 0 },
    // Góc trên phải  
    { emoji: '⭐', position: { top: '10%', right: '15%' }, delay: 0.7 },
    // Góc dưới trái
    { emoji: '🌟', position: { bottom: '20%', left: '10%' }, delay: 1.4 },
    // Góc dưới phải
    { emoji: '✨', position: { bottom: '25%', right: '12%' }, delay: 2.1 },
  ], []);

  return (
    <>
      {/* Chỉ các sparkle nhỏ - không có floating icons lớn */}
      {sparkles.map((item, i) => (
        <SparkleIcon key={`sparkle-${i}`} {...item} />
      ))}
    </>
  );
}

export const DECORATIONS_CONFIG = { enabled: true };
