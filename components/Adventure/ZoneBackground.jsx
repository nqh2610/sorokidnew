'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// 🎨 ZONE BACKGROUND - Background art theo theme cho từng vùng
// SVG based, optimized với CSS animations
// ============================================================

/**
 * Cấu hình theme cho từng zone
 */
const ZONE_THEMES = {
  // Làng Khởi Đầu - Màu xanh lá tươi, cây cối, mái nhà
  village: {
    gradient: 'from-green-500 via-emerald-500 to-green-600',
    elements: ['🏠', '🌳', '🌻', '🏡', '🌸', '🦋'],
    cloudColor: 'bg-white/40',
    groundColor: 'from-green-600 to-green-700',
    accentColor: 'text-emerald-200',
    particleColor: '#86efac' // green-300
  },
  
  // Rừng Phép Cộng - Xanh đậm, cây lớn, ánh sáng xuyên qua
  forest: {
    gradient: 'from-emerald-500 via-green-600 to-emerald-700',
    elements: ['🌲', '🍃', '🌿', '🦊', '🐿️', '🍄'],
    cloudColor: 'bg-emerald-200/30',
    groundColor: 'from-emerald-700 to-emerald-800',
    accentColor: 'text-green-200',
    particleColor: '#a7f3d0' // emerald-200
  },
  
  // Thung Lũng Phép Trừ - Xanh dương nhạt, núi, sương mù
  valley: {
    gradient: 'from-blue-500 via-cyan-600 to-blue-600',
    elements: ['🏔️', '⛰️', '🌊', '🦅', '☁️', '❄️'],
    cloudColor: 'bg-white/50',
    groundColor: 'from-blue-600 to-blue-700',
    accentColor: 'text-cyan-200',
    particleColor: '#a5f3fc' // cyan-200
  },
  
  // Đồi Bạn Lớn - Vàng cam, đồng cỏ, cầu vồng
  hill: {
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    elements: ['🌈', '🌾', '🌻', '🐝', '🦋', '☀️'],
    cloudColor: 'bg-white/50',
    groundColor: 'from-yellow-600 to-orange-600',
    accentColor: 'text-yellow-200',
    particleColor: '#fde047' // yellow-300
  },
  
  // Đài Kết Hợp - Tím hồng, đền đài, bí ẩn
  tower: {
    gradient: 'from-purple-500 via-pink-500 to-violet-600',
    elements: ['🏛️', '✨', '💫', '🔮', '🌙', '⭐'],
    cloudColor: 'bg-purple-200/40',
    groundColor: 'from-purple-700 to-violet-800',
    accentColor: 'text-pink-200',
    particleColor: '#f0abfc' // fuchsia-300
  },
  
  // Thành Phố Số Lớn - Xanh cyan, hiện đại
  'city-numbers': {
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    elements: ['🏙️', '🌃', '🔢', '💯', '🏢', '✨'],
    cloudColor: 'bg-blue-200/40',
    groundColor: 'from-blue-700 to-indigo-700',
    accentColor: 'text-cyan-200',
    particleColor: '#7dd3fc' // sky-300
  },
  
  // Vương Quốc Nghìn - Tím hoàng gia
  kingdom: {
    gradient: 'from-indigo-500 via-purple-600 to-violet-700',
    elements: ['🏰', '👑', '🗝️', '🦁', '🎺', '⚜️'],
    cloudColor: 'bg-violet-200/40',
    groundColor: 'from-indigo-800 to-purple-900',
    accentColor: 'text-violet-200',
    particleColor: '#c4b5fd' // violet-300
  },
  
  // Tháp Tính Nhẩm - Tím sâu, trí tuệ
  'mental-tower': {
    gradient: 'from-violet-500 via-purple-600 to-fuchsia-600',
    elements: ['🧠', '💭', '🔮', '✨', '🌌', '💫'],
    cloudColor: 'bg-fuchsia-200/30',
    groundColor: 'from-purple-800 to-fuchsia-900',
    accentColor: 'text-fuchsia-200',
    particleColor: '#e879f9' // fuchsia-400
  },
  
  // Đền Tốc Độ - Cam đỏ, năng lượng
  'speed-temple': {
    gradient: 'from-orange-500 via-red-500 to-rose-600',
    elements: ['⚡', '🔥', '💥', '🌟', '⏱️', '🚀'],
    cloudColor: 'bg-orange-200/40',
    groundColor: 'from-red-700 to-rose-800',
    accentColor: 'text-orange-200',
    particleColor: '#fb923c' // orange-400
  },
  
  // Đỉnh Tia Chớp - Vàng sáng, điện
  'flash-peak': {
    gradient: 'from-amber-500 via-amber-600 to-orange-600',
    elements: ['⚡', '✨', '💫', '🌟', '⭐', '🔆'],
    cloudColor: 'bg-yellow-100/50',
    groundColor: 'from-amber-600 to-orange-700',
    accentColor: 'text-yellow-100',
    particleColor: '#fcd34d' // amber-300
  },
  
  // Lâu Đài Kho Báu - Vàng hoàng kim
  'treasure-castle': {
    gradient: 'from-amber-500 via-yellow-600 to-orange-600',
    elements: ['🏆', '💎', '👑', '🎁', '🌟', '💰'],
    cloudColor: 'bg-yellow-100/60',
    groundColor: 'from-amber-700 to-orange-800',
    accentColor: 'text-amber-100',
    particleColor: '#fde047' // yellow-300
  },
  
  // === MULDIV ZONES ===
  'multiply-cave': {
    gradient: 'from-rose-500 via-red-500 to-orange-500',
    elements: ['🌋', '✖️', '🔥', '💎', '⛏️', '🦎'],
    cloudColor: 'bg-rose-200/40',
    groundColor: 'from-rose-700 to-red-800',
    accentColor: 'text-rose-200',
    particleColor: '#fda4af'
  },
  'divide-lake': {
    gradient: 'from-teal-500 via-cyan-600 to-blue-600',
    elements: ['🏝️', '➗', '🐬', '🌊', '🐠', '🏖️'],
    cloudColor: 'bg-teal-200/40',
    groundColor: 'from-teal-600 to-cyan-700',
    accentColor: 'text-teal-200',
    particleColor: '#5eead4'
  },
  'divide-advanced': {
    gradient: 'from-sky-500 via-blue-600 to-indigo-600',
    elements: ['🌀', '➗', '🐳', '💧', '🧊', '❄️'],
    cloudColor: 'bg-sky-200/40',
    groundColor: 'from-blue-700 to-indigo-800',
    accentColor: 'text-sky-200',
    particleColor: '#7dd3fc'
  },
  'arena-4ops': {
    gradient: 'from-red-600 via-orange-600 to-amber-600',
    elements: ['🏟️', '⚔️', '🛡️', '🎯', '🏅', '🔥'],
    cloudColor: 'bg-red-200/40',
    groundColor: 'from-red-800 to-orange-800',
    accentColor: 'text-red-200',
    particleColor: '#f87171'
  },
  'mental-4ops': {
    gradient: 'from-fuchsia-500 via-purple-600 to-violet-700',
    elements: ['🧠', '💜', '🔮', '✨', '🌌', '💎'],
    cloudColor: 'bg-fuchsia-200/30',
    groundColor: 'from-purple-800 to-violet-900',
    accentColor: 'text-purple-200',
    particleColor: '#d946ef'
  },
  'speed-4ops': {
    gradient: 'from-orange-600 via-red-600 to-pink-600',
    elements: ['⚡', '🔥', '💥', '⏱️', '🚀', '💫'],
    cloudColor: 'bg-orange-200/40',
    groundColor: 'from-red-700 to-pink-800',
    accentColor: 'text-orange-200',
    particleColor: '#fb7185'
  },
  'mixed-peak': {
    gradient: 'from-violet-500 via-purple-600 to-pink-600',
    elements: ['🌈', '🎆', '✨', '💫', '🌟', '🎇'],
    cloudColor: 'bg-violet-200/40',
    groundColor: 'from-purple-800 to-pink-800',
    accentColor: 'text-violet-200',
    particleColor: '#c084fc'
  },
  'supreme-castle': {
    gradient: 'from-amber-400 via-yellow-500 to-orange-600',
    elements: ['👑', '🏆', '💎', '🎊', '🌟', '🎖️'],
    cloudColor: 'bg-yellow-100/60',
    groundColor: 'from-amber-700 to-orange-800',
    accentColor: 'text-amber-100',
    particleColor: '#facc15'
  }
};

// Default theme
const DEFAULT_THEME = {
  gradient: 'from-blue-400 via-blue-500 to-indigo-600',
  elements: ['⭐', '✨', '🌟', '💫', '🎯', '🎮'],
  cloudColor: 'bg-white/40',
  groundColor: 'from-blue-700 to-indigo-800',
  accentColor: 'text-blue-200',
  particleColor: '#93c5fd'
};

/**
 * Floating decoration element
 */
const FloatingElement = memo(function FloatingElement({ emoji, position, delay = 0, size = 'text-2xl' }) {
  return (
    <div 
      className={`absolute ${size} opacity-40 pointer-events-none select-none`}
      style={{ 
        ...position,
        animation: `floatElement ${4 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`
      }}
    >
      {emoji}
    </div>
  );
});

/**
 * Animated cloud
 */
const Cloud = memo(function Cloud({ className, delay = 0 }) {
  return (
    <div 
      className={`absolute rounded-full blur-xl pointer-events-none ${className}`}
      style={{
        animation: `cloudDrift ${30 + delay * 5}s linear infinite`,
        animationDelay: `${delay * 3}s`
      }}
    />
  );
});

/**
 * Sparkle particle
 */
const Sparkle = memo(function Sparkle({ color, delay, position }) {
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
      style={{
        backgroundColor: color,
        ...position
      }}
      animate={{
        scale: [0, 1, 0],
        opacity: [0, 0.8, 0]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay: delay,
        ease: 'easeInOut'
      }}
    />
  );
});

/**
 * Main Zone Background Component
 */
function ZoneBackground({ zoneId, progress = 0 }) {
  const theme = ZONE_THEMES[zoneId] || DEFAULT_THEME;
  
  // Memoize element positions - GIẢM SỐ LƯỢNG, chỉ 4 elements
  const elements = useMemo(() => {
    const positions = [
      { top: '15%', left: '8%' },
      { top: '25%', right: '10%' },
      { bottom: '40%', left: '6%' },
      { bottom: '30%', right: '8%' }
    ];
    
    // Chỉ lấy 4 elements đầu tiên, không chồng chéo
    return theme.elements.slice(0, 4).map((emoji, i) => ({
      emoji,
      position: positions[i],
      delay: i * 0.8,
      size: 'text-3xl sm:text-4xl'
    }));
  }, [theme.elements]);
  
  // Giảm sparkles xuống 4
  const sparkles = useMemo(() => {
    return [
      { position: { left: '5%', top: '35%' }, delay: 0 },
      { position: { right: '5%', top: '45%' }, delay: 0.5 },
      { position: { left: '7%', bottom: '55%' }, delay: 1 },
      { position: { right: '7%', bottom: '45%' }, delay: 1.5 }
    ];
  }, []);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
      
      {/* Subtle overlay pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Chỉ 1 cloud đại diện */}
      <Cloud className={`${theme.cloudColor} w-48 h-24 top-16 -left-16`} delay={0} />
      
      {/* Floating decorative elements - đã giảm xuống 4 */}
      {elements.map((el, i) => (
        <FloatingElement key={i} {...el} />
      ))}
      
      {/* Sparkle particles - đã giảm xuống 4 */}
      {sparkles.map((sparkle, i) => (
        <Sparkle key={i} color={theme.particleColor} {...sparkle} />
      ))}
      
      {/* XÓA: Ground gradient - gây khó chịu ở footer */}
      
      {/* Progress glow effect - chỉ khi progress > 70% */}
      {progress > 70 && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${theme.particleColor}15 0%, transparent 40%)`,
            opacity: (progress - 70) / 60
          }}
        />
      )}
      
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes floatElement {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          25% { 
            transform: translateY(-10px) rotate(3deg); 
          }
          75% { 
            transform: translateY(-5px) rotate(-2deg); 
          }
        }
        
        @keyframes cloudDrift {
          0% { 
            transform: translateX(-100%); 
          }
          100% { 
            transform: translateX(100vw); 
          }
        }
      `}</style>
    </div>
  );
}

export default memo(ZoneBackground);
