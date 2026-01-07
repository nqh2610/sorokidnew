'use client';

import { useEffect, useState, useCallback } from 'react';

// Hiệu ứng ăn mừng với confetti và pháo hoa
export default function CelebrationEffect({ 
  type = 'medium', // 'small' | 'medium' | 'large' | 'perfect'
  trigger = false,
  duration = 3000,
  onComplete
}) {
  const [particles, setParticles] = useState([]);
  const [fireworks, setFireworks] = useState([]);
  const [active, setActive] = useState(false);

  // Màu sắc cho confetti
  const colors = [
    '#fbbf24', '#f59e0b', '#ef4444', '#ec4899', 
    '#8b5cf6', '#3b82f6', '#10b981', '#06b6d4'
  ];

  // Emoji cho các mức thành tích
  const celebrationEmojis = {
    small: ['👏', '✨', '💫'],
    medium: ['🎉', '⭐', '🌟', '✨'],
    large: ['🏆', '🎊', '🌟', '⭐', '💫', '✨'],
    perfect: ['🏆', '👑', '🎊', '🎉', '🌟', '⭐', '💫', '✨', '🔥']
  };

  const createParticles = useCallback(() => {
    const particleCount = {
      small: 20,
      medium: 40,
      large: 60,
      perfect: 100
    }[type];

    const emojis = celebrationEmojis[type];
    const newParticles = [];

    for (let i = 0; i < particleCount; i++) {
      const isEmoji = Math.random() > 0.7;
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: isEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : null,
        speed: Math.random() * 3 + 2,
        wobble: Math.random() * 10 - 5,
        delay: Math.random() * 1000
      });
    }

    setParticles(newParticles);
  }, [type]);

  const createFireworks = useCallback(() => {
    if (type === 'small') return;

    const fireworkCount = {
      medium: 2,
      large: 4,
      perfect: 6
    }[type] || 0;

    const newFireworks = [];
    for (let i = 0; i < fireworkCount; i++) {
      newFireworks.push({
        id: i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: i * 400
      });
    }
    setFireworks(newFireworks);
  }, [type]);

  useEffect(() => {
    if (trigger && !active) {
      setActive(true);
      createParticles();
      createFireworks();

      const timer = setTimeout(() => {
        setActive(false);
        setParticles([]);
        setFireworks([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, active, createParticles, createFireworks, duration, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Confetti particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.x}%`,
            animationDuration: `${particle.speed}s`,
            animationDelay: `${particle.delay}ms`,
            '--wobble': `${particle.wobble}px`,
            '--rotation': `${particle.rotation}deg`
          }}
        >
          {particle.emoji ? (
            <span 
              className="text-2xl"
              style={{ transform: `scale(${particle.scale})` }}
            >
              {particle.emoji}
            </span>
          ) : (
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: particle.color,
                transform: `scale(${particle.scale}) rotate(${particle.rotation}deg)`
              }}
            />
          )}
        </div>
      ))}

      {/* Fireworks */}
      {fireworks.map((firework) => (
        <div
          key={firework.id}
          className="absolute"
          style={{
            left: `${firework.x}%`,
            top: `${firework.y}%`,
            animationDelay: `${firework.delay}ms`
          }}
        >
          <div className="relative animate-firework-burst">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-firework-particle"
                style={{
                  backgroundColor: firework.color,
                  '--angle': `${i * 30}deg`,
                  animationDelay: `${firework.delay}ms`
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Center burst for perfect */}
      {type === 'perfect' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-perfect-burst">
            <div className="text-8xl animate-bounce">🏆</div>
          </div>
          <div className="absolute inset-0 animate-flash bg-yellow-400/20 rounded-full scale-0" />
        </div>
      )}

      {/* Sound indicator (visual only) */}
      {type !== 'small' && (
        <div className="absolute top-4 right-4 animate-pulse">
          <span className="text-3xl">🎵</span>
        </div>
      )}

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10vh) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) translateX(var(--wobble)) rotate(var(--rotation));
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }

        @keyframes firework-burst {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-firework-burst {
          animation: firework-burst 0.3s ease-out forwards;
        }

        @keyframes firework-particle {
          0% {
            transform: rotate(var(--angle)) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--angle)) translateY(80px) scale(0);
            opacity: 0;
          }
        }
        .animate-firework-particle {
          animation: firework-particle 1s ease-out forwards;
        }

        @keyframes perfect-burst {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-perfect-burst {
          animation: perfect-burst 0.8s ease-out forwards;
        }

        @keyframes flash {
          0% { transform: scale(0); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
        .animate-flash {
          animation: flash 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Component hiệu ứng khi trả lời đúng 1 câu
export function CorrectAnswerEffect({ show, onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
      {/* Green flash */}
      <div className="absolute inset-0 bg-green-400/20 animate-flash-quick" />
      
      {/* Checkmark burst */}
      <div className="animate-correct-pop">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50">
          <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* Sparkles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-sparkle-out"
          style={{
            '--angle': `${i * 45}deg`,
            animationDelay: `${i * 50}ms`
          }}
        >
          <span className="text-2xl">✨</span>
        </div>
      ))}

      <style jsx>{`
        @keyframes flash-quick {
          0% { opacity: 0; }
          30% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-flash-quick {
          animation: flash-quick 0.5s ease-out forwards;
        }

        @keyframes correct-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-correct-pop {
          animation: correct-pop 0.4s ease-out forwards;
        }

        @keyframes sparkle-out {
          0% { 
            transform: rotate(var(--angle)) translateY(0) scale(0);
            opacity: 1;
          }
          100% { 
            transform: rotate(var(--angle)) translateY(80px) scale(1);
            opacity: 0;
          }
        }
        .animate-sparkle-out {
          animation: sparkle-out 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Component hiệu ứng khi trả lời sai
export function WrongAnswerEffect({ show, onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
      {/* Red flash */}
      <div className="absolute inset-0 bg-red-400/10 animate-shake-bg" />
      
      {/* Encouragement */}
      <div className="animate-wrong-pop text-center">
        <div className="text-6xl mb-2">💪</div>
        <div className="text-xl font-bold text-orange-600 bg-white/90 px-4 py-2 rounded-full shadow-lg">
          Cố lên nào!
        </div>
      </div>

      <style jsx>{`
        @keyframes shake-bg {
          0%, 100% { transform: translateX(0); opacity: 0; }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); opacity: 0.3; }
          20%, 40%, 60%, 80% { transform: translateX(2px); opacity: 0.3; }
        }
        .animate-shake-bg {
          animation: shake-bg 0.5s ease-out forwards;
        }

        @keyframes wrong-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-wrong-pop {
          animation: wrong-pop 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
