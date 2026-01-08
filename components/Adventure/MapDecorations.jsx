'use client';

import { memo } from 'react';

// ============================================================
// 🎨 MAP DECORATIONS - Trang trí nhẹ nhàng cho map
// Chỉ dùng CSS animations, không dùng JS để tối ưu performance
// ============================================================

// Floating icon với CSS animation thuần
const FloatingIcon = memo(function FloatingIcon({ emoji, position, size = 'text-2xl', delay = 0 }) {
  return (
    <div 
      className={`fixed ${size} opacity-30 pointer-events-none select-none z-10`}
      style={{ 
        ...position,
        animation: `float-gentle 4s ease-in-out ${delay}s infinite`
      }}
    >
      {emoji}
    </div>
  );
});

export default function MapDecorations() {
  return (
    <>
      {/* Corner decorations - Nhẹ nhàng, opacity thấp */}
      
      {/* Top left - La bàn */}
      <FloatingIcon emoji="🧭" position={{ top: '15%', left: '3%' }} delay={0} />
      
      {/* Top right - Bản đồ */}
      <FloatingIcon emoji="🗺️" position={{ top: '18%', right: '4%' }} delay={0.5} />
      
      {/* Bottom left - Thước */}
      <FloatingIcon emoji="📐" position={{ bottom: '25%', left: '2%' }} size="text-xl" delay={1} />
      
      {/* Bottom right - Kho báu */}
      <FloatingIcon emoji="💎" position={{ bottom: '30%', right: '3%' }} size="text-xl" delay={1.5} />
      
      {/* Math formula icons - Công thức toán học khoa học */}
      <FloatingIcon emoji="∑" position={{ top: '32%', left: '4%' }} size="text-2xl" delay={0.3} />
      <FloatingIcon emoji="√" position={{ top: '48%', right: '4%' }} size="text-2xl" delay={0.8} />
      <FloatingIcon emoji="π" position={{ bottom: '45%', left: '3%' }} size="text-2xl" delay={1.3} />
      <FloatingIcon emoji="∞" position={{ bottom: '52%', right: '3%' }} size="text-2xl" delay={1.8} />
      <FloatingIcon emoji="Δ" position={{ top: '65%', left: '5%' }} size="text-xl" delay={2.3} />
      <FloatingIcon emoji="🧮" position={{ top: '25%', right: '6%' }} size="text-xl" delay={2.8} />
      
      {/* More math symbols */}
      <FloatingIcon emoji="≈" position={{ top: '75%', right: '4%' }} size="text-xl" delay={0.5} />
      <FloatingIcon emoji="±" position={{ bottom: '38%', left: '5%' }} size="text-xl" delay={1.1} />
      
      {/* Sparkle accents */}
      <FloatingIcon emoji="✨" position={{ top: '40%', left: '6%' }} size="text-sm" delay={2} />
      <FloatingIcon emoji="⭐" position={{ top: '58%', right: '5%' }} size="text-sm" delay={2.5} />
      
      {/* CSS for float animation */}
      <style jsx global>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
      `}</style>
    </>
  );
}

export const DECORATIONS_CONFIG = { enabled: true };
