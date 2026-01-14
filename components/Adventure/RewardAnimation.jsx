'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * 🎉 RewardAnimation - Game Reward Effects
 * - Confetti burst
 * - Star collection
 * - Level up celebration
 * - Badge unlock
 * - XP counter
 */

// ============== CONFETTI PARTICLE ==============
const ConfettiParticle = ({ index }) => {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  const shapes = ['square', 'circle', 'triangle'];
  
  const color = colors[index % colors.length];
  const shape = shapes[index % shapes.length];
  const size = Math.random() * 10 + 6;
  const startX = 50 + (Math.random() - 0.5) * 40;
  const rotation = Math.random() * 720 - 360;
  
  return (
    <motion.div
      initial={{
        x: `${startX}vw`,
        y: '50vh',
        opacity: 1,
        rotate: 0,
        scale: 0
      }}
      animate={{
        x: `${startX + (Math.random() - 0.5) * 60}vw`,
        y: `${Math.random() * 100}vh`,
        opacity: [1, 1, 0],
        rotate: rotation,
        scale: [0, 1.5, 1, 0]
      }}
      transition={{
        duration: Math.random() * 2 + 2,
        ease: 'easeOut'
      }}
      style={{
        position: 'fixed',
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '2px',
        clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
        zIndex: 100
      }}
    />
  );
};

// ============== STAR BURST ==============
const StarBurst = ({ onComplete }) => {
  const stars = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30) * (Math.PI / 180),
    delay: i * 0.05
  }));

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      {/* Central star */}
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ 
          scale: [0, 1.5, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 0.6 }}
        className="text-8xl"
      >
        ⭐
      </motion.div>

      {/* Radiating stars */}
      {stars.map(star => (
        <motion.div
          key={star.id}
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 0,
            opacity: 1 
          }}
          animate={{ 
            x: Math.cos(star.angle) * 200,
            y: Math.sin(star.angle) * 200,
            scale: [0, 1, 0.5],
            opacity: [1, 1, 0]
          }}
          transition={{ 
            duration: 1,
            delay: star.delay,
            ease: 'easeOut'
          }}
          className="absolute text-3xl"
        >
          ✨
        </motion.div>
      ))}

      {/* Ring effect */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute w-32 h-32 border-4 border-yellow-400 rounded-full"
      />
    </motion.div>
  );
};

// ============== XP COUNTER ==============
const XPCounter = ({ amount, onComplete }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const increment = amount / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= amount) {
        setCount(amount);
        clearInterval(timer);
        setTimeout(onComplete, 500);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [amount, onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, y: -50, opacity: 0 }}
      className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-2xl shadow-2xl">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.3, repeat: Infinity }}
          className="text-center"
        >
          <span className="text-white/80 text-sm font-medium">XP Nhận được</span>
          <div className="text-white text-4xl font-black">
            +{count}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============== LEVEL UP ==============
const LevelUp = ({ newLevel, onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
    >
      {/* Background burst */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.5, 1] }}
        transition={{ duration: 0.5 }}
        className="absolute w-96 h-96 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full blur-3xl opacity-50"
      />

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 10 }}
        className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 rounded-3xl shadow-2xl"
      >
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-12 py-10 rounded-3xl">
          {/* Trophy icon */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl text-center mb-4"
          >
            🏆
          </motion.div>

          {/* Level Up text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h2 className="text-yellow-400 text-3xl font-black tracking-wider mb-2">
              LEVEL UP!
            </h2>
            <div className="flex items-center justify-center gap-3">
              <span className="text-gray-400 text-xl">Level</span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.5 }}
                className="text-white text-5xl font-black"
              >
                {newLevel}
              </motion.span>
            </div>
          </motion.div>

          {/* Continue button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="mt-6 w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-xl shadow-lg"
          >
            Tuyệt vời! 🎉
          </motion.button>
        </div>
      </motion.div>

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: '50%',
            y: '50%',
            scale: 0
          }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            repeat: Infinity,
            repeatDelay: 1
          }}
          className="absolute text-2xl"
        >
          {['⭐', '✨', '🌟', '💫'][i % 4]}
        </motion.div>
      ))}
    </motion.div>
  );
};

// ============== BADGE UNLOCK ==============
const BadgeUnlock = ({ badge, onComplete, t }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm mx-4"
      >
        {/* Badge icon with glow */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative w-32 h-32 mx-auto mb-4"
        >
          {/* Glow effect */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-yellow-400 rounded-full blur-xl"
          />
          
          <div className="relative w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-5xl shadow-xl">
            {badge?.icon || '🏅'}
          </div>
        </motion.div>

        {/* Badge name */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-gray-500 text-sm font-medium mb-1">{t('reward.badgeUnlocked')}</p>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {badge?.name || t('reward.newBadge')}
          </h3>
          <p className="text-gray-600 text-sm">
            {badge?.description || t('reward.congratulations')}
          </p>
        </motion.div>

        {/* Continue button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
          className="mt-6 w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl shadow-lg"
        >
          {t('reward.claimReward')} 🎁
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// ============== ZONE COMPLETE ==============
const ZoneComplete = ({ zone, stars = 3, onComplete, t }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 12 }}
        className={`bg-gradient-to-br ${zone?.color || 'from-blue-500 to-purple-600'} p-1 rounded-3xl shadow-2xl max-w-md mx-4`}
      >
        <div className="bg-white rounded-3xl p-6 md:p-8">
          {/* Zone icon */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl text-center mb-4"
          >
            {zone?.icon || '🏰'}
          </motion.div>

          {/* Complete banner */}
          <div className="text-center mb-4">
            <motion.h2
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500"
            >
              🎉 {t('reward.completed')} 🎉
            </motion.h2>
            <p className="text-gray-600 font-medium mt-1">{zone?.name}</p>
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-2 my-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: i <= stars ? 1 : 0.6, 
                  rotate: 0,
                  opacity: i <= stars ? 1 : 0.3
                }}
                transition={{ delay: 0.3 + i * 0.2, type: 'spring' }}
                className="text-5xl"
              >
                ⭐
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          {zone?.stats && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{zone.stats.time || '00:00'}</div>
                <div className="text-xs text-gray-500">{t('reward.time')}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{zone.stats.accuracy || '100'}%</div>
                <div className="text-xs text-gray-500">{t('reward.accuracy')}</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">+{zone.stats.xp || 100}</div>
                <div className="text-xs text-gray-500">XP</div>
              </div>
            </div>
          )}

          {/* Continue button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className={`w-full py-4 bg-gradient-to-r ${zone?.color || 'from-blue-500 to-purple-600'} text-white font-bold rounded-xl shadow-lg text-lg`}
          >
            {t('reward.continueJourney')} 🚀
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============== MAIN COMPONENT ==============
export default function RewardAnimation({
  type = 'confetti', // confetti, stars, xp, levelup, badge, zone-complete
  isVisible = false,
  data = {},
  onComplete
}) {
  const { t } = useI18n();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible && (type === 'confetti' || type === 'stars')) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, type, onComplete]);

  return (
    <AnimatePresence>
      {/* Confetti Effect */}
      {showConfetti && type === 'confetti' && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} />
          ))}
        </div>
      )}

      {/* Star Burst Effect */}
      {showConfetti && type === 'stars' && (
        <StarBurst onComplete={() => {}} />
      )}

      {/* XP Counter */}
      {isVisible && type === 'xp' && (
        <XPCounter amount={data.amount || 100} onComplete={onComplete} />
      )}

      {/* Level Up Celebration */}
      {isVisible && type === 'levelup' && (
        <LevelUp newLevel={data.level || 1} onComplete={onComplete} />
      )}

      {/* Badge Unlock */}
      {isVisible && type === 'badge' && (
        <BadgeUnlock badge={data.badge} onComplete={onComplete} t={t} />
      )}

      {/* Zone Complete */}
      {isVisible && type === 'zone-complete' && (
        <ZoneComplete zone={data.zone} stars={data.stars} onComplete={onComplete} t={t} />
      )}
    </AnimatePresence>
  );
}

// ============== EXPORT INDIVIDUAL COMPONENTS ==============
export { ConfettiParticle, StarBurst, XPCounter, LevelUp, BadgeUnlock, ZoneComplete };
