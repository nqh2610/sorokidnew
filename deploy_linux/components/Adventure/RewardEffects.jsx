'use client';

import { memo, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n/I18nContext';

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

/**
 * 🏆 ZONE COMPLETE CELEBRATION - Hiệu ứng chiến thắng khi hoàn thành 1 zone
 * Bao gồm: confetti lớn, lời khen từ Cú Soro, hiệu ứng hoành tráng
 */
export function ZoneCompleteCelebration({ 
  show, 
  zoneName = '', 
  zoneIcon = '🏆',
  message = '',
  onComplete 
}) {
  const [phase, setPhase] = useState('initial'); // initial, celebration, message, done
  
  useEffect(() => {
    if (show) {
      setPhase('celebration');
      // Phase 1: Celebration effects (1.5s)
      const timer1 = setTimeout(() => setPhase('message'), 1500);
      // Phase 2: Show message (auto close after 4s hoặc user click)
      const timer2 = setTimeout(() => {
        setPhase('done');
        onComplete?.();
      }, 6000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setPhase('initial');
    }
  }, [show, onComplete]);
  
  const handleClose = () => {
    setPhase('done');
    onComplete?.();
  };
  
  if (!show || phase === 'initial' || phase === 'done') return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          className="absolute inset-0 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />
        
        {/* Confetti rain - nhiều hơn bình thường */}
        {phase === 'celebration' && [...Array(60)].map((_, i) => (
          <ConfettiPiece key={i} index={i} totalPieces={60} />
        ))}
        
        {/* Multiple ring bursts */}
        {phase === 'celebration' && (
          <>
            <RingBurst />
            <RingBurst delay={0.15} />
            <RingBurst delay={0.3} />
          </>
        )}
        
        {/* Star bursts khắp nơi */}
        {phase === 'celebration' && (
          <>
            <StarBurst x="15%" y="20%" delay={0} />
            <StarBurst x="85%" y="25%" delay={0.1} />
            <StarBurst x="25%" y="60%" delay={0.2} />
            <StarBurst x="75%" y="55%" delay={0.3} />
            <StarBurst x="50%" y="30%" delay={0.4} />
            <StarBurst x="40%" y="70%" delay={0.5} />
            <StarBurst x="60%" y="75%" delay={0.6} />
          </>
        )}
        
        {/* Fireworks */}
        {phase === 'celebration' && (
          <>
            <Firework x="20%" y="30%" delay={0.2} />
            <Firework x="80%" y="35%" delay={0.4} />
            <Firework x="50%" y="25%" delay={0.6} />
          </>
        )}
        
        {/* Victory banner với Cú Soro */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-auto"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: phase === 'celebration' ? 0.3 : 0, duration: 0.5, type: 'spring' }}
        >
          <div 
            className="bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 rounded-3xl p-6 sm:p-8 max-w-md mx-4 shadow-2xl border-4 border-amber-400 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sparkle decorations */}
            <div className="absolute top-2 left-2 text-2xl animate-pulse">✨</div>
            <div className="absolute top-2 right-2 text-2xl animate-pulse delay-100">✨</div>
            <div className="absolute bottom-2 left-2 text-2xl animate-pulse delay-200">✨</div>
            <div className="absolute bottom-2 right-2 text-2xl animate-pulse delay-300">✨</div>
            
            {/* Trophy icon */}
            <motion.div 
              className="text-6xl sm:text-7xl text-center mb-4"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🏆
            </motion.div>
            
            {/* Victory text */}
            <motion.h2 
              className="text-2xl sm:text-3xl font-black text-center text-amber-800 mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              CHIẾN THẮNG!
            </motion.h2>
            
            {/* Zone completed */}
            <div className="text-center mb-4">
              <span className="text-3xl mr-2">{zoneIcon}</span>
              <span className="text-lg sm:text-xl font-bold text-amber-700">{zoneName}</span>
            </div>
            
            {/* Cú Soro message */}
            <div className="bg-white/80 rounded-2xl p-4 mb-4 relative">
              {/* Cú Soro avatar */}
              <div className="absolute -top-4 -left-2">
                <motion.span 
                  className="text-4xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🦉
                </motion.span>
              </div>
              <div className="pl-8 text-amber-900 leading-relaxed">
                <span className="font-bold text-amber-600">Cú Soro: </span>
                {message || `Tuyệt vời! Con đã chinh phục ${zoneName}! Hãy tiếp tục cuộc phiêu lưu nhé!`}
              </div>
            </div>
            
            {/* Continue button */}
            <motion.button
              onClick={handleClose}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Tiếp tục phiêu lưu! 🚀
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/**
 * 🎆 Firework effect component
 */
const Firework = memo(function Firework({ x, y, delay = 0 }) {
  const colors = ['#fbbf24', '#f472b6', '#4ade80', '#60a5fa', '#a78bfa'];
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1, delay }}
    >
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ 
            backgroundColor: colors[i % colors.length],
            transformOrigin: 'center'
          }}
          initial={{ x: 0, y: 0, scale: 0 }}
          animate={{
            x: Math.cos(i * Math.PI / 4) * 60,
            y: Math.sin(i * Math.PI / 4) * 60,
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 0.8, delay: delay + 0.1 }}
        />
      ))}
    </motion.div>
  );
});

/**
 * 📖 ZONE INTRO DIALOG - Dialog giới thiệu khi vào zone mới
 * Tạo không khí tò mò, kể chuyện
 */
export function ZoneIntroDialog({ 
  show, 
  zoneName = '', 
  zoneIcon = '🏝️',
  zoneSubtitle = '',
  introMessage = '',
  onComplete 
}) {
  const { t } = useI18n();
  const [isTyping, setIsTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    if (!show || !introMessage) return;
    
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    
    const typingInterval = setInterval(() => {
      if (index < introMessage.length) {
        setDisplayedText(introMessage.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 25); // Tốc độ typing
    
    return () => clearInterval(typingInterval);
  }, [show, introMessage]);
  
  const handleSkip = () => {
    setDisplayedText(introMessage);
    setIsTyping(false);
  };
  
  if (!show) return null;
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop với hiệu ứng mờ */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-800/90 backdrop-blur-sm" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['✨', '🌟', '💫', '⭐'].map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl opacity-60"
              style={{ left: `${20 + i * 20}%`, top: `${30 + i * 10}%` }}
              animate={{ 
                y: [0, -20, 0],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
        
        {/* Dialog box */}
        <motion.div 
          className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-amber-500/50"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          {/* Zone header */}
          <div className="text-center mb-6">
            <motion.div 
              className="text-5xl sm:text-6xl mb-3"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {zoneIcon}
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              {zoneName}
            </h2>
            {zoneSubtitle && (
              <p className="text-amber-300/80 text-sm mt-1">{zoneSubtitle}</p>
            )}
          </div>
          
          {/* Cú Soro narrator box */}
          <div className="bg-amber-900/30 rounded-2xl p-4 mb-6 relative border border-amber-500/30">
            {/* Cú Soro */}
            <div className="flex items-start gap-3">
              <motion.div 
                className="text-4xl flex-shrink-0"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🦉
              </motion.div>
              <div className="flex-1">
                <div className="text-amber-400 font-bold text-sm mb-1">{t('adventureScreen.cuSoro')}</div>
                <div className="text-amber-100 leading-relaxed min-h-[60px]">
                  {displayedText}
                  {isTyping && (
                    <motion.span
                      className="ml-1 inline-block w-2 h-4 bg-amber-400"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            {isTyping && (
              <button
                onClick={handleSkip}
                className="flex-1 py-3 bg-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-600 transition-colors"
              >
                {t('adventureScreen.zoneIntro.showAll')}
              </button>
            )}
            <motion.button
              onClick={onComplete}
              className={`${isTyping ? 'flex-1' : 'w-full'} py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isTyping ? t('adventureScreen.zoneIntro.start') : t('adventureScreen.zoneIntro.exploreNow')}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * 🔒 ZONE LOCKED DIALOG - Dialog khi zone trước chưa hoàn thành
 * Giải thích thân thiện với trẻ, khuyến khích quay lại hoàn thành zone trước
 */
export function ZoneLockedDialog({ 
  show, 
  currentZone = null,  // Zone người dùng đang muốn vào
  prevZone = null,     // Zone trước đó chưa hoàn thành
  prevProgress = null, // Progress của zone trước { completed, total, percent }
  onGoBack,           // Callback để quay về zone trước
  onClose             // Callback để đóng dialog
}) {
  const { t } = useI18n();
  
  // Tạo message động và hấp dẫn
  const getMessage = () => {
    const remaining = (prevProgress?.total || 0) - (prevProgress?.completed || 0);
    const percent = prevProgress?.percent || 0;
    const prevZoneName = prevZone?.name || t('adventureScreen.zoneLocked.prevZone');
    const currentZoneName = currentZone?.name || t('adventureScreen.zoneLocked.newZone');
    
    if (percent >= 80) {
      return t('adventureScreen.zoneLocked.msg80', { remaining, prevZone: prevZoneName, currentZone: currentZoneName });
    } else if (percent >= 50) {
      return t('adventureScreen.zoneLocked.msg50', { remaining, prevZone: prevZoneName, currentZone: currentZoneName });
    } else if (percent > 0) {
      return t('adventureScreen.zoneLocked.msgStarted', { remaining, prevZone: prevZoneName, currentZone: currentZoneName });
    } else {
      return t('adventureScreen.zoneLocked.msgNotStarted', { prevZone: prevZoneName, currentZone: currentZoneName });
    }
  };
  
  const message = getMessage();
  
  if (!show) return null;
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-slate-900/85 to-slate-800/95 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Dialog box */}
        <motion.div 
          className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-amber-500/40"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="text-center mb-4">
            <div className="inline-block text-5xl sm:text-6xl">
              🛑
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-center text-amber-400 mb-2">
            {t('adventureScreen.zoneLocked.title')}
          </h2>
          
          {/* Zone info */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">{currentZone?.icon || '🏝️'}</span>
            <span className="text-amber-300 font-medium">{currentZone?.name || t('adventureScreen.zoneLocked.newZone')}</span>
          </div>
          
          {/* Cú Soro message - Hiển thị ngay, không typing */}
          <div className="bg-amber-900/30 rounded-2xl p-4 mb-5 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="text-3xl sm:text-4xl flex-shrink-0">
                🦉
              </div>
              <div className="flex-1">
                <div className="text-amber-400 font-bold text-sm mb-1">{t('adventureScreen.cuSoro')}</div>
                <div className="text-amber-100/90 leading-relaxed text-sm sm:text-base">
                  {message}
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress indicator for prev zone */}
          {prevZone && prevProgress && (
            <div className="bg-slate-700/50 rounded-xl p-3 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{prevZone.icon || '🏝️'}</span>
                <span className="text-slate-300 text-sm font-medium">{prevZone.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    style={{ width: `${prevProgress.percent}%` }}
                  />
                </div>
                <span className="text-amber-400 font-bold text-sm min-w-[50px]">
                  {prevProgress.completed}/{prevProgress.total}
                </span>
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-600 transition-colors"
            >
              {t('adventureScreen.zoneLocked.later')}
            </button>
            <button
              onClick={onGoBack}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95"
            >
              {t('adventureScreen.zoneLocked.goBack')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(RewardEffects);
