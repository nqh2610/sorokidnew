'use client';

import { memo, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// 🎉 REWARD EFFECTS - Hiệu ứng thưởng khi hoàn thành stage
// Confetti, sao bay, coins, và các hiệu ứng celebration
// ============================================================

/**
 * Confetti piece component
 */
const ConfettiPiece = memo(function ConfettiPiece({ index, totalPieces }) {
  const colors = ['#fbbf24', '#f472b6', '#4ade80', '#60a5fa', '#a78bfa', '#fb7185', '#34d399', '#fde047'];
  const shapes = ['rounded-full', 'rounded-sm', 'rounded-none']; // circle, square, rectangle
  
  const color = colors[index % colors.length];
  const shape = shapes[index % shapes.length];
  const size = 6 + Math.random() * 6;
  const startX = Math.random() * 100;
  const endX = startX + (Math.random() - 0.5) * 40;
  const rotation = Math.random() * 720;
  const duration = 2 + Math.random() * 1.5;
  const delay = Math.random() * 0.5;
  
  return (
    <motion.div
      className={`absolute ${shape} pointer-events-none`}
      style={{
        width: size,
        height: shape === 'rounded-none' ? size / 2 : size,
        backgroundColor: color,
        left: `${startX}%`,
        top: -20
      }}
      initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: [0, window?.innerHeight || 800],
        x: [0, (endX - startX) * 5],
        rotate: [0, rotation],
        opacity: [1, 1, 0]
      }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    />
  );
});

/**
 * Star burst effect
 */
const StarBurst = memo(function StarBurst({ x, y, delay = 0 }) {
  return (
    <motion.div
      className="absolute text-2xl sm:text-3xl pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1.5, 0],
        opacity: [0, 1, 0],
        y: [0, -60],
        rotate: [0, 180]
      }}
      transition={{
        duration: 1.2,
        delay,
        ease: 'easeOut'
      }}
    >
      ⭐
    </motion.div>
  );
});

/**
 * Floating coin effect
 */
const FloatingCoin = memo(function FloatingCoin({ index, startX }) {
  const delay = index * 0.1;
  
  return (
    <motion.div
      className="absolute text-xl sm:text-2xl pointer-events-none"
      style={{ left: `${startX}%`, bottom: '20%' }}
      initial={{ y: 0, opacity: 0, scale: 0 }}
      animate={{
        y: [-20, -150],
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2, 1, 0.8],
        rotate: [0, 360]
      }}
      transition={{
        duration: 1.5,
        delay,
        ease: 'easeOut'
      }}
    >
      💰
    </motion.div>
  );
});

/**
 * Sparkle explosion effect
 */
const SparkleExplosion = memo(function SparkleExplosion({ centerX, centerY }) {
  const sparkles = [...Array(12)].map((_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 80 + Math.random() * 40;
    return {
      endX: Math.cos(angle) * distance,
      endY: Math.sin(angle) * distance,
      delay: i * 0.02
    };
  });
  
  return (
    <>
      {sparkles.map((sparkle, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            left: centerX,
            top: centerY,
            backgroundColor: ['#fbbf24', '#f472b6', '#4ade80', '#60a5fa'][i % 4]
          }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: sparkle.endX,
            y: sparkle.endY,
            scale: 0,
            opacity: 0
          }}
          transition={{
            duration: 0.8,
            delay: sparkle.delay,
            ease: 'easeOut'
          }}
        />
      ))}
    </>
  );
});

/**
 * Text popup effect (e.g., "+10 ⭐", "Tuyệt vời!")
 */
const TextPopup = memo(function TextPopup({ text, emoji, x, y, delay = 0 }) {
  return (
    <motion.div
      className="absolute pointer-events-none flex items-center gap-1 font-bold text-lg sm:text-xl"
      style={{ left: x, top: y }}
      initial={{ y: 0, opacity: 0, scale: 0.5 }}
      animate={{
        y: -80,
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1, 0.8]
      }}
      transition={{
        duration: 1.5,
        delay,
        ease: 'easeOut'
      }}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-white drop-shadow-lg">{text}</span>
    </motion.div>
  );
});

/**
 * Ring burst effect
 */
const RingBurst = memo(function RingBurst({ delay = 0 }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-yellow-400 pointer-events-none"
      initial={{ width: 0, height: 0, opacity: 1 }}
      animate={{
        width: [0, 300],
        height: [0, 300],
        opacity: [1, 0]
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: 'easeOut'
      }}
    />
  );
});

/**
 * 🎉 MAIN REWARD EFFECTS COMPONENT
 * 
 * Usage:
 * <RewardEffects 
 *   show={showReward} 
 *   type="complete" // 'complete' | 'star' | 'coin' | 'levelUp'
 *   onComplete={() => setShowReward(false)}
 * />
 */
function RewardEffects({ show, type = 'complete', onComplete, starsEarned = 0, message = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto hide after animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);
  
  if (!isVisible) return null;
  
  // Số lượng confetti dựa vào loại reward
  const confettiCount = type === 'levelUp' ? 50 : type === 'complete' ? 30 : 15;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* Confetti rain */}
          {[...Array(confettiCount)].map((_, i) => (
            <ConfettiPiece key={i} index={i} totalPieces={confettiCount} />
          ))}
          
          {/* Ring burst */}
          <RingBurst />
          {type === 'levelUp' && <RingBurst delay={0.2} />}
          
          {/* Star bursts */}
          <StarBurst x="20%" y="30%" delay={0.1} />
          <StarBurst x="80%" y="25%" delay={0.2} />
          <StarBurst x="50%" y="40%" delay={0.3} />
          {type === 'levelUp' && (
            <>
              <StarBurst x="30%" y="50%" delay={0.4} />
              <StarBurst x="70%" y="45%" delay={0.5} />
            </>
          )}
          
          {/* Sparkle explosion in center */}
          <SparkleExplosion centerX="50%" centerY="40%" />
          
          {/* Floating coins for coin/complete type */}
          {(type === 'complete' || type === 'coin') && (
            <>
              <FloatingCoin index={0} startX={35} />
              <FloatingCoin index={1} startX={50} />
              <FloatingCoin index={2} startX={65} />
            </>
          )}
          
          {/* Text popups */}
          {starsEarned > 0 && (
            <TextPopup 
              text={`+${starsEarned}`} 
              emoji="⭐" 
              x="50%" 
              y="35%" 
              delay={0.3} 
            />
          )}
          
          {message && (
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 1], 
                opacity: [0, 1, 1, 0] 
              }}
              transition={{ duration: 2, ease: 'easeOut' }}
            >
              <div className="text-4xl sm:text-5xl mb-2">
                {type === 'levelUp' ? '🎉' : type === 'complete' ? '🌟' : '⭐'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-white drop-shadow-lg">
                {message}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * 🌟 STAGE COMPLETE EFFECT - Hiệu ứng khi hoàn thành 1 stage
 * Nhẹ hơn RewardEffects, dùng cho mỗi stage
 */
export function StageCompleteEffect({ show, onComplete }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Mini confetti */}
      {[...Array(15)].map((_, i) => (
        <ConfettiPiece key={i} index={i} totalPieces={15} />
      ))}
      
      {/* Single ring */}
      <RingBurst />
      
      {/* Stars */}
      <StarBurst x="40%" y="35%" delay={0} />
      <StarBurst x="60%" y="35%" delay={0.15} />
    </div>
  );
}

/**
 * ⭐ STAR COLLECT EFFECT - Hiệu ứng khi thu thập sao
 */
export function StarCollectEffect({ show, count = 1, onComplete }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {[...Array(Math.min(count, 5))].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl"
          style={{ 
            left: `${40 + i * 5}%`, 
            top: '50%' 
          }}
          initial={{ y: 0, scale: 0, opacity: 0 }}
          animate={{
            y: -100,
            scale: [0, 1.5, 1],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1,
            delay: i * 0.1,
            ease: 'easeOut'
          }}
        >
          ⭐
        </motion.div>
      ))}
      
      <TextPopup 
        text={`+${count}`} 
        emoji="⭐" 
        x="50%" 
        y="45%" 
        delay={0.2} 
      />
    </div>
  );
}

export default memo(RewardEffects);
