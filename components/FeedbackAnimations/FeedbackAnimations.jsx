'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🎉 FEEDBACK ANIMATIONS
 * 
 * Các animation feedback ngay lập tức cho học sinh tiểu học
 * - Confetti: Đáp án đúng
 * - Shake: Đáp án sai
 * - Stars: Combo streak
 * - Particles: Score bonus
 */

// ============================================
// 🎊 CONFETTI - Đáp án đúng
// ============================================
export function Confetti({ 
  trigger = false, 
  particleCount = 30,
  duration = 2000,
  colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'],
}) {
  const [particles, setParticles] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      // Generate particles
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.3,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
      }));
      
      setParticles(newParticles);
      setShow(true);
      
      // Auto hide
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, particleCount, colors, duration]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{ 
            left: `${p.x}%`,
            top: -20,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
          }}
          initial={{ y: -20, opacity: 1 }}
          animate={{ 
            y: window.innerHeight + 50,
            x: (Math.random() - 0.5) * 200,
            rotate: p.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{ 
            duration: 1.5 + Math.random() * 0.5,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// 💫 STARS BURST - Combo/Achievement
// ============================================
export function StarsBurst({
  trigger = false,
  starCount = 8,
  duration = 1500,
  centerX = 50,
  centerY = 50,
}) {
  const [show, setShow] = useState(false);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    if (trigger) {
      const newStars = Array.from({ length: starCount }, (_, i) => ({
        id: i,
        angle: (360 / starCount) * i,
        size: 16 + Math.random() * 8,
      }));
      setStars(newStars);
      setShow(true);
      
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, starCount, duration]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ 
        perspective: 1000,
      }}
    >
      {stars.map((star) => {
        const rad = (star.angle * Math.PI) / 180;
        const distance = 150;
        const endX = Math.cos(rad) * distance;
        const endY = Math.sin(rad) * distance;
        
        return (
          <motion.div
            key={star.id}
            className="absolute"
            style={{ 
              left: `${centerX}%`,
              top: `${centerY}%`,
              fontSize: star.size,
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 0,
              opacity: 1,
            }}
            animate={{ 
              x: endX,
              y: endY,
              scale: [0, 1.5, 0],
              opacity: [1, 1, 0],
            }}
            transition={{ 
              duration: 0.8,
              ease: 'easeOut',
            }}
          >
            ⭐
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================
// 📍 FLOATING TEXT - Score bonus
// ============================================
export function FloatingText({
  text,
  trigger = false,
  color = 'text-green-500',
  x = 50,
  y = 50,
  duration = 1500,
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`
            fixed z-[9999] pointer-events-none
            text-2xl font-bold ${color}
            drop-shadow-lg
          `}
          style={{ left: `${x}%`, top: `${y}%` }}
          initial={{ y: 0, opacity: 1, scale: 0.5 }}
          animate={{ y: -80, opacity: 0, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 1000, ease: 'easeOut' }}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// 🎯 SHAKE WRAPPER - Đáp án sai
// ============================================
export function ShakeWrapper({ 
  children, 
  trigger = false,
  intensity = 10,
  duration = 0.5,
}) {
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  return (
    <motion.div
      animate={shake ? {
        x: [0, -intensity, intensity, -intensity, intensity, 0],
      } : {}}
      transition={{ duration, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ✅ CORRECT PULSE - Hiệu ứng đúng
// ============================================
export function CorrectPulse({ trigger = false }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 600);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9998] pointer-events-none bg-green-500/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </AnimatePresence>
  );
}

// ============================================
// ❌ WRONG FLASH - Hiệu ứng sai
// ============================================
export function WrongFlash({ trigger = false }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 400);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9998] pointer-events-none bg-red-500/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </AnimatePresence>
  );
}

// ============================================
// 🎮 FEEDBACK CONTROLLER - Combined hook
// ============================================
export function useFeedbackAnimations() {
  const [feedbackState, setFeedbackState] = useState({
    confetti: false,
    stars: false,
    shake: false,
    correctPulse: false,
    wrongFlash: false,
    floatingText: null,
  });

  const showCorrect = useCallback(() => {
    setFeedbackState(prev => ({
      ...prev,
      confetti: true,
      correctPulse: true,
    }));
    // Reset
    setTimeout(() => {
      setFeedbackState(prev => ({
        ...prev,
        confetti: false,
        correctPulse: false,
      }));
    }, 100);
  }, []);

  const showWrong = useCallback(() => {
    setFeedbackState(prev => ({
      ...prev,
      shake: true,
      wrongFlash: true,
    }));
    // Reset
    setTimeout(() => {
      setFeedbackState(prev => ({
        ...prev,
        shake: false,
        wrongFlash: false,
      }));
    }, 100);
  }, []);

  const showCombo = useCallback((count) => {
    setFeedbackState(prev => ({
      ...prev,
      stars: true,
      floatingText: `🔥 ${count} Combo!`,
    }));
    // Reset
    setTimeout(() => {
      setFeedbackState(prev => ({
        ...prev,
        stars: false,
        floatingText: null,
      }));
    }, 100);
  }, []);

  const showBonus = useCallback((text) => {
    setFeedbackState(prev => ({
      ...prev,
      floatingText: text,
    }));
    // Reset
    setTimeout(() => {
      setFeedbackState(prev => ({
        ...prev,
        floatingText: null,
      }));
    }, 100);
  }, []);

  return {
    feedbackState,
    showCorrect,
    showWrong,
    showCombo,
    showBonus,
  };
}

// ============================================
// 📦 FEEDBACK CONTAINER - Render all effects
// ============================================
export function FeedbackContainer({ feedbackState }) {
  return (
    <>
      <Confetti trigger={feedbackState.confetti} />
      <StarsBurst trigger={feedbackState.stars} />
      <CorrectPulse trigger={feedbackState.correctPulse} />
      <WrongFlash trigger={feedbackState.wrongFlash} />
      {feedbackState.floatingText && (
        <FloatingText 
          text={feedbackState.floatingText}
          trigger={true}
        />
      )}
    </>
  );
}
