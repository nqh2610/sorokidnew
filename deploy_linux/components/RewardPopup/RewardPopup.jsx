'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * RewardPopup - Hiệu ứng nhận thưởng đẹp mắt
 * 
 * Props:
 * - reward: { stars: number, diamonds: number, name: string, icon: string }
 * - onClose: () => void
 * - show: boolean
 */
export default function RewardPopup({ reward, onClose, show }) {
  const [particles, setParticles] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tạo particles khi show
  useEffect(() => {
    if (show) {
      // Phase 0: Vào
      setAnimationPhase(0);
      
      // Tạo particles
      const newParticles = [];
      const particleTypes = ['⭐', '💎', '✨', '🎉', '🌟', '💫'];
      
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 1 + Math.random() * 1,
          size: 16 + Math.random() * 16
        });
      }
      setParticles(newParticles);

      // Phase 1: Hiển thị phần thưởng
      setTimeout(() => setAnimationPhase(1), 300);
      
      // Phase 2: Đếm số
      setTimeout(() => setAnimationPhase(2), 800);
    }
  }, [show]);

  const handleClose = useCallback(() => {
    setAnimationPhase(3); // Phase out
    setTimeout(onClose, 300);
  }, [onClose]);

  // Auto close sau 4 giây
  useEffect(() => {
    if (show && animationPhase === 2) {
      const timer = setTimeout(handleClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, animationPhase, handleClose]);

  if (!mounted || !show) return null;

  return createPortal(
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
        animationPhase === 3 ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      {/* Backdrop với blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute animate-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              fontSize: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          >
            {particle.type}
          </div>
        ))}
      </div>

      {/* Main popup */}
      <div 
        className={`relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-3xl p-1 shadow-2xl transform transition-all duration-500 ${
          animationPhase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-white rounded-3xl p-6 sm:p-8 min-w-[300px] sm:min-w-[380px]">
          {/* Header với confetti effect */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <span className="text-6xl sm:text-7xl animate-bounce-slow">
                {reward?.icon || '🎁'}
              </span>
              {/* Glow effect */}
              <div className="absolute inset-0 blur-xl bg-yellow-400/50 rounded-full -z-10 animate-pulse" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold mt-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              🎊 Chúc mừng! 🎊
            </h2>
            
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {reward?.name || 'Phần thưởng'}
            </p>
          </div>

          {/* Rewards */}
          <div className="flex justify-center gap-6 sm:gap-8 mb-6">
            {/* Stars */}
            {reward?.stars > 0 && (
              <div className={`text-center transform transition-all duration-500 ${
                animationPhase >= 2 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                  <span className="text-3xl sm:text-4xl">⭐</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
                  <CountUp end={reward.stars} duration={1000} />
                </div>
                <div className="text-xs text-gray-500">Sao</div>
              </div>
            )}

            {/* Diamonds */}
            {reward?.diamonds > 0 && (
              <div className={`text-center transform transition-all duration-500 delay-200 ${
                animationPhase >= 2 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-300 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                  <span className="text-3xl sm:text-4xl">💎</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  <CountUp end={reward.diamonds} duration={1000} delay={200} />
                </div>
                <div className="text-xs text-gray-500">Kim cương</div>
              </div>
            )}
          </div>

          {/* Button */}
          <button
            onClick={handleClose}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
          >
            Tuyệt vời! 🎉
          </button>
        </div>
      </div>

      {/* CSS cho animations */}
      <style jsx global>{`
        @keyframes particle {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(720deg) scale(0);
            opacity: 0;
          }
        }
        
        .animate-particle {
          animation: particle linear forwards;
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 1s ease-in-out infinite;
        }
      `}</style>
    </div>,
    document.body
  );
}

/**
 * CountUp - Hiệu ứng đếm số
 */
function CountUp({ end, duration = 1000, delay = 0 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * end));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [end, duration, delay]);

  return <span>+{count}</span>;
}

/**
 * Hook để sử dụng RewardPopup dễ dàng
 */
export function useRewardPopup() {
  const [reward, setReward] = useState(null);
  const [show, setShow] = useState(false);

  const showReward = useCallback((rewardData) => {
    setReward(rewardData);
    setShow(true);
  }, []);

  const hideReward = useCallback(() => {
    setShow(false);
    setTimeout(() => setReward(null), 300);
  }, []);

  const RewardPopupComponent = useCallback(() => (
    <RewardPopup reward={reward} show={show} onClose={hideReward} />
  ), [reward, show, hideReward]);

  return { showReward, hideReward, RewardPopupComponent };
}
