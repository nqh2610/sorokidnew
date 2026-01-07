'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Star, Crown, Map, Flag, Sparkles, Award, Zap } from 'lucide-react';
import { useGameSound } from '@/lib/useGameSound';

/**
 * 🏆 AchievementPopup - Hiển thị thành tựu đạt được
 * 
 * Types:
 * - stage: Hoàn thành 1 màn/stage
 * - zone: Hoàn thành 1 zone
 * - certificate-addSub: Đạt chứng chỉ Cộng Trừ
 * - certificate-complete: Đạt chứng chỉ Toàn Diện
 * - boss: Đánh bại boss
 * 
 * Props:
 * - type: string
 * - data: { name, icon, zone, stage, ... }
 * - onClose: () => void
 * - show: boolean
 */
export default function AchievementPopup({ type, data, onClose, show }) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState(0);
  const [particles, setParticles] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const { play } = useGameSound();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 🔊 Play sound when achievement popup shows
  useEffect(() => {
    if (show) {
      // Chọn sound phù hợp với loại achievement
      if (type?.includes('certificate')) {
        play('certificateEarned');
      } else if (type === 'boss') {
        play('bossDefeat');
      } else if (type === 'zone') {
        play('zoneComplete');
      } else {
        play('stageComplete');
      }
    }
  }, [show, type, play]);

  const createParticles = useCallback(() => {
    const config = ACHIEVEMENT_CONFIG[type] || ACHIEVEMENT_CONFIG.stage;
    const particleCount = config.particleCount || 30;
    
    // Tạo particles
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: `p-${i}`,
        emoji: config.particles[Math.floor(Math.random() * config.particles.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 1.5 + Math.random() * 1,
        size: 16 + Math.random() * 20
      });
    }
    setParticles(newParticles);

    // Tạo confetti
    const newConfetti = [];
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71'];
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        id: `c-${i}`,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 1,
        duration: 2 + Math.random() * 2,
        size: 8 + Math.random() * 8
      });
    }
    setConfetti(newConfetti);
  }, [type]);

  // Animation phases khi show
  useEffect(() => {
    if (show) {
      setPhase(0);
      createParticles();
      
      // Phase 1: Icon xuất hiện
      setTimeout(() => setPhase(1), 100);
      // Phase 2: Text xuất hiện
      setTimeout(() => setPhase(2), 500);
      // Phase 3: Rewards xuất hiện
      setTimeout(() => setPhase(3), 900);
      // Phase 4: Button xuất hiện
      setTimeout(() => setPhase(4), 1300);
    }
  }, [show, type, createParticles]);

  const handleClose = useCallback(() => {
    setPhase(5); // Phase out
    setTimeout(() => {
      onClose?.();
    }, 400);
  }, [onClose]);

  // Auto close sau 6 giây cho stage, 10 giây cho certificate
  useEffect(() => {
    if (show && phase === 4) {
      const delay = type.includes('certificate') ? 10000 : 6000;
      const timer = setTimeout(handleClose, delay);
      return () => clearTimeout(timer);
    }
  }, [show, phase, type, handleClose]);

  if (!mounted || !show) return null;

  const config = ACHIEVEMENT_CONFIG[type] || ACHIEVEMENT_CONFIG.stage;
  const Icon = config.icon;

  return createPortal(
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-400 ${
        phase === 5 ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map(c => (
          <div
            key={c.id}
            className="absolute w-2 h-3 animate-confetti-fall"
            style={{
              left: `${c.x}%`,
              backgroundColor: c.color,
              width: `${c.size}px`,
              height: `${c.size * 1.5}px`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              borderRadius: '2px'
            }}
          />
        ))}
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute animate-achievement-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* Main Popup */}
      <div className={`relative max-w-md w-full mx-4 transform transition-all duration-500 ${
        phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
      }`}>
        {/* Glow effect */}
        <div className={`absolute -inset-4 ${config.glowColor} rounded-3xl blur-2xl opacity-50 animate-pulse`} />
        
        {/* Card */}
        <div className={`relative bg-gradient-to-br ${config.bgGradient} rounded-3xl p-1 shadow-2xl overflow-hidden`}>
          {/* Inner card */}
          <div className="bg-white/95 backdrop-blur rounded-[22px] p-6 text-center">
            
            {/* Top decoration */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            
            {/* Achievement Type Label */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4 ${config.labelBg} ${config.labelText}`}>
              {config.label}
            </div>

            {/* Icon với hiệu ứng */}
            <div className={`relative mx-auto w-28 h-28 mb-4 transition-all duration-700 ${
              phase >= 1 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            }`}>
              {/* Rotating rings */}
              <div className={`absolute inset-0 rounded-full border-4 ${config.ringColor} animate-spin-slow opacity-30`} />
              <div className={`absolute inset-2 rounded-full border-4 ${config.ringColor} animate-spin-slow-reverse opacity-40`} />
              
              {/* Icon container */}
              <div className={`absolute inset-4 rounded-full ${config.iconBg} flex items-center justify-center shadow-lg`}>
                {data?.icon ? (
                  <span className="text-5xl">{data.icon}</span>
                ) : (
                  <Icon className={`w-12 h-12 ${config.iconColor}`} />
                )}
              </div>
              
              {/* Sparkle effects */}
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-1 w-6 h-6 text-yellow-400 animate-pulse delay-200" />
            </div>

            {/* Title */}
            <div className={`transition-all duration-500 ${
              phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <h2 className={`text-2xl font-black mb-2 ${config.titleColor}`}>
                {config.title}
              </h2>
              <p className="text-lg font-bold text-gray-800 mb-1">
                {data?.name || 'Thành tựu mới'}
              </p>
              {data?.description && (
                <p className="text-sm text-gray-500">{data.description}</p>
              )}
            </div>

            {/* Rewards / Stats */}
            <div className={`mt-4 transition-all duration-500 ${
              phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {config.showRewards && data?.rewards && (
                <div className="flex justify-center gap-4 mb-3">
                  {data.rewards.stars && (
                    <div className="flex items-center gap-1 bg-amber-100 px-3 py-1.5 rounded-full">
                      <span className="text-xl">⭐</span>
                      <span className="font-bold text-amber-600">+{data.rewards.stars}</span>
                    </div>
                  )}
                  {data.rewards.diamonds && (
                    <div className="flex items-center gap-1 bg-purple-100 px-3 py-1.5 rounded-full">
                      <span className="text-xl">💎</span>
                      <span className="font-bold text-purple-600">+{data.rewards.diamonds}</span>
                    </div>
                  )}
                  {data.rewards.xp && (
                    <div className="flex items-center gap-1 bg-blue-100 px-3 py-1.5 rounded-full">
                      <span className="text-xl">✨</span>
                      <span className="font-bold text-blue-600">+{data.rewards.xp} XP</span>
                    </div>
                  )}
                </div>
              )}

              {/* Message đặc biệt */}
              {config.specialMessage && (
                <p className={`text-sm font-medium ${config.messageColor} animate-pulse`}>
                  {config.specialMessage}
                </p>
              )}
            </div>

            {/* Action Button */}
            <div className={`mt-6 transition-all duration-500 ${
              phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <button
                onClick={handleClose}
                className={`w-full py-3 px-6 rounded-xl font-bold text-white ${config.buttonBg} hover:scale-105 active:scale-95 transition-transform shadow-lg`}
              >
                {config.buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ============================================================
// 🎨 ACHIEVEMENT CONFIGURATIONS
// ============================================================

const ACHIEVEMENT_CONFIG = {
  // Hoàn thành 1 stage/màn
  stage: {
    icon: Flag,
    label: '🎯 HOÀN THÀNH MÀN',
    title: 'Xuất Sắc!',
    bgGradient: 'from-green-400 via-emerald-500 to-teal-500',
    glowColor: 'bg-green-400',
    labelBg: 'bg-green-100',
    labelText: 'text-green-700',
    ringColor: 'border-green-300',
    iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
    iconColor: 'text-white',
    titleColor: 'text-green-600',
    messageColor: 'text-green-600',
    buttonBg: 'bg-gradient-to-r from-green-500 to-emerald-600',
    buttonText: 'Tiếp tục phiêu lưu! 🚀',
    showRewards: true,
    particles: ['⭐', '✨', '🌟', '💫', '🎯'],
    particleCount: 25
  },

  // Đánh bại Boss
  boss: {
    icon: Trophy,
    label: '👹 ĐÁNH BẠI BOSS',
    title: 'Chiến Thắng!',
    bgGradient: 'from-red-500 via-orange-500 to-yellow-500',
    glowColor: 'bg-orange-400',
    labelBg: 'bg-orange-100',
    labelText: 'text-orange-700',
    ringColor: 'border-orange-300',
    iconBg: 'bg-gradient-to-br from-red-500 to-orange-500',
    iconColor: 'text-white',
    titleColor: 'text-orange-600',
    messageColor: 'text-orange-600',
    buttonBg: 'bg-gradient-to-r from-orange-500 to-red-600',
    buttonText: 'Quá Đỉnh! Tiếp tục! 💪',
    showRewards: true,
    particles: ['🔥', '⚔️', '🏆', '💥', '⭐', '👑'],
    particleCount: 35,
    specialMessage: '🔥 Boss đã gục ngã trước sức mạnh của bạn!'
  },

  // Hoàn thành 1 zone
  zone: {
    icon: Map,
    label: '🗺️ HOÀN THÀNH VÙNG ĐẤT',
    title: 'Chinh Phục!',
    bgGradient: 'from-purple-500 via-pink-500 to-rose-500',
    glowColor: 'bg-purple-400',
    labelBg: 'bg-purple-100',
    labelText: 'text-purple-700',
    ringColor: 'border-purple-300',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
    iconColor: 'text-white',
    titleColor: 'text-purple-600',
    messageColor: 'text-purple-600',
    buttonBg: 'bg-gradient-to-r from-purple-500 to-pink-600',
    buttonText: 'Khám phá vùng đất mới! 🌟',
    showRewards: true,
    particles: ['🎊', '🎉', '🌟', '⭐', '✨', '💜', '🗺️'],
    particleCount: 40,
    specialMessage: '🎊 Một vùng đất mới đang chờ bạn khám phá!'
  },

  // Chứng chỉ Cộng Trừ
  'certificate-addSub': {
    icon: Award,
    label: '🎖️ CHỨNG CHỈ ĐẠT ĐƯỢC',
    title: 'Tuyệt Vời!',
    bgGradient: 'from-amber-400 via-yellow-500 to-orange-500',
    glowColor: 'bg-amber-400',
    labelBg: 'bg-amber-100',
    labelText: 'text-amber-700',
    ringColor: 'border-amber-300',
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    iconColor: 'text-white',
    titleColor: 'text-amber-600',
    messageColor: 'text-amber-700',
    buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-600',
    buttonText: 'Xem chứng chỉ! 📜',
    showRewards: true,
    particles: ['🏆', '🎖️', '📜', '⭐', '🌟', '✨', '🎉', '🎊', '💫', '👑'],
    particleCount: 60,
    specialMessage: '🏆 Chúc mừng! Bạn đã trở thành Cao Thủ Cộng Trừ Soroban!'
  },

  // Chứng chỉ Toàn Diện
  'certificate-complete': {
    icon: Crown,
    label: '👑 CHỨNG CHỈ TỐI THƯỢNG',
    title: 'HUYỀN THOẠI!',
    bgGradient: 'from-yellow-400 via-amber-500 to-red-500',
    glowColor: 'bg-yellow-400',
    labelBg: 'bg-gradient-to-r from-yellow-100 to-amber-100',
    labelText: 'text-amber-800',
    ringColor: 'border-yellow-400',
    iconBg: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-red-500',
    iconColor: 'text-white',
    titleColor: 'bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent',
    messageColor: 'text-amber-700',
    buttonBg: 'bg-gradient-to-r from-yellow-500 via-amber-500 to-red-600',
    buttonText: '👑 Xem chứng chỉ Huyền Thoại!',
    showRewards: true,
    particles: ['👑', '🏆', '🎖️', '💎', '⭐', '🌟', '✨', '🎉', '🎊', '💫', '🔥', '💛'],
    particleCount: 80,
    specialMessage: '👑 HUYỀN THOẠI! Bạn đã chinh phục toàn bộ Soroban!'
  }
};

// Export config để có thể sử dụng ở nơi khác
export { ACHIEVEMENT_CONFIG };
