'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// 🏆 TREASURE CHEST REVEAL - Hiệu ứng mở rương kho báu hoành tráng
// ============================================================

// ===== SPARKLE PARTICLE =====
function Sparkle({ delay, x, y }) {
  return (
    <motion.div
      className="absolute w-2 h-2 bg-yellow-300 rounded-full"
      style={{ left: `${50 + x}%`, top: `${50 + y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1.5, 0], 
        opacity: [0, 1, 0],
        y: [0, -30],
      }}
      transition={{ delay, duration: 0.8, ease: 'easeOut' }}
    />
  );
}

// ===== CERTIFICATE CARD =====
function CertificateCard({ type, userName, onView, onClose }) {
  const isAddSub = type === 'addsub';
  
  const certConfig = {
    addsub: {
      title: '🏅 Chứng Chỉ Cộng Trừ',
      subtitle: 'Nhà Thám Hiểm Số Học',
      color: 'from-emerald-400 to-teal-600',
      borderColor: 'border-emerald-400',
      bgGlow: 'bg-emerald-400/30',
      icon: '🎖️',
      description: 'Đã chinh phục hành trình Cộng - Trừ trên Soroban'
    },
    complete: {
      title: '👑 Chứng Chỉ Toàn Diện',
      subtitle: 'Bậc Thầy Soroban',
      color: 'from-amber-400 to-orange-600',
      borderColor: 'border-amber-400',
      bgGlow: 'bg-amber-400/30',
      icon: '🏆',
      description: 'Đã chinh phục toàn bộ hành trình Soroban'
    }
  };
  
  const cert = isAddSub ? certConfig.addsub : certConfig.complete;
  
  return (
    <motion.div
      className="relative"
      initial={{ y: 100, opacity: 0, scale: 0.5, rotateX: 45 }}
      animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Glow behind card */}
      <motion.div 
        className={`absolute -inset-4 ${cert.bgGlow} rounded-3xl blur-2xl`}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <div className={`
        relative w-72 sm:w-80 bg-white rounded-2xl overflow-hidden
        shadow-2xl border-4 ${cert.borderColor}
      `}>
        {/* Header gradient */}
        <div className={`bg-gradient-to-r ${cert.color} p-5 text-center relative overflow-hidden`}>
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          />
          
          {/* Icon với animation */}
          <motion.div 
            className="text-5xl mb-2"
            animate={{ 
              scale: [1, 1.2, 1], 
              rotate: [0, -10, 10, 0],
              y: [0, -5, 0]
            }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
          >
            {cert.icon}
          </motion.div>
          <h3 className="text-xl font-black text-white drop-shadow-lg">{cert.title}</h3>
          <p className="text-white/90 text-sm font-semibold mt-1">{cert.subtitle}</p>
        </div>
        
        {/* Content */}
        <div className="p-5 text-center bg-gradient-to-b from-white to-amber-50">
          {/* Stars decoration */}
          <div className="flex justify-center gap-1 mb-3">
            {[0,1,2,3,4].map(i => (
              <motion.span 
                key={i} 
                className="text-yellow-400 text-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.3 }}
              >
                ⭐
              </motion.span>
            ))}
          </div>
          
          <div className="mb-4">
            <p className="text-gray-500 text-xs mb-1">🎉 Chúc mừng</p>
            <p className="text-2xl font-black text-gray-800">{userName || 'Nhà Thám Hiểm'}</p>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">{cert.description}</p>
          
          {/* Golden seal */}
          <motion.div 
            className="inline-block"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 200 }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shadow-lg border-4 border-yellow-200">
              <span className="text-2xl">✨</span>
            </div>
          </motion.div>
          
          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Đóng
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onView}
              className={`flex-1 py-3 rounded-xl bg-gradient-to-r ${cert.color} text-white font-bold text-sm shadow-lg`}
            >
              Xem chứng chỉ 📜
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===== MAIN TREASURE CHEST REVEAL =====
export default function TreasureChestReveal({ 
  isOpen, 
  onClose, 
  certificateType = 'addsub',
  userName = '',
  onViewCertificate
}) {
  const [stage, setStage] = useState('hidden'); // hidden -> appear -> glow -> shake -> burst -> certificate
  
  // Animation sequence - hoành tráng hơn
  useEffect(() => {
    if (!isOpen) {
      setStage('hidden');
      return;
    }
    
    const timers = [];
    
    setStage('appear');  // Rương xuất hiện
    timers.push(setTimeout(() => setStage('glow'), 500));    // Phát sáng
    timers.push(setTimeout(() => setStage('shake'), 1000));  // Rung lắc
    timers.push(setTimeout(() => setStage('burst'), 1500));  // Bùng nổ ánh sáng
    timers.push(setTimeout(() => setStage('certificate'), 2200)); // Hiện chứng chỉ
    
    return () => timers.forEach(clearTimeout);
  }, [isOpen]);
  
  const handleViewCertificate = useCallback(() => {
    onViewCertificate?.();
    onClose?.();
  }, [onViewCertificate, onClose]);
  
  // Sparkle positions
  const sparkles = [
    { x: -20, y: -20 }, { x: 20, y: -25 }, { x: -25, y: 10 },
    { x: 25, y: 5 }, { x: 0, y: -30 }, { x: -15, y: 15 },
    { x: 15, y: 20 }, { x: -10, y: -15 }
  ];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80"
          onClick={stage === 'certificate' ? onClose : undefined}
        >
          {/* Background glow */}
          {(stage === 'glow' || stage === 'shake' || stage === 'burst') && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: stage === 'burst' ? 1 : 0.6 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="w-80 h-80 bg-yellow-400/50 rounded-full blur-3xl"
                animate={stage === 'burst' ? { scale: [1, 2, 3], opacity: [1, 0.8, 0] } : { scale: [1, 1.1, 1] }}
                transition={{ duration: stage === 'burst' ? 0.7 : 1, repeat: stage === 'burst' ? 0 : Infinity }}
              />
            </motion.div>
          )}
          
          {/* Sparkles khi burst */}
          {stage === 'burst' && sparkles.map((s, i) => (
            <Sparkle key={i} delay={i * 0.05} x={s.x} y={s.y} />
          ))}
          
          {/* Main content */}
          <div 
            className="relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Treasure Chest */}
            {stage !== 'certificate' && (
              <motion.div
                className="relative"
                initial={{ scale: 0, y: 100, rotateX: -30 }}
                animate={
                  stage === 'appear' ? { scale: 1, y: 0, rotateX: 0 } :
                  stage === 'glow' ? { scale: 1.05, y: -10 } :
                  stage === 'shake' ? { scale: 1.1, y: -15, x: [0, -8, 8, -8, 8, -5, 5, 0] } :
                  stage === 'burst' ? { scale: 1.3, y: -30 } :
                  { scale: 1, y: 0 }
                }
                transition={{ 
                  duration: stage === 'shake' ? 0.5 : 0.4, 
                  ease: stage === 'shake' ? 'easeInOut' : [0.34, 1.56, 0.64, 1]
                }}
              >
                {/* Glow ring */}
                {(stage === 'glow' || stage === 'shake' || stage === 'burst') && (
                  <motion.div
                    className="absolute inset-0 -m-6 rounded-full border-4 border-yellow-400/60"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.3, 0.8] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
                
                {/* Chest emoji */}
                <div className="relative text-8xl sm:text-9xl">
                  {stage === 'open' ? '🎁' : '📦'}
                </div>
                
                {/* Loading text */}
                {stage === 'shake' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white font-bold text-sm whitespace-nowrap"
                  >
                    Đang mở...
                  </motion.p>
                )}
              </motion.div>
            )}
            
            {/* Certificate reveal */}
            {stage === 'certificate' && (
              <CertificateCard
                type={certificateType}
                userName={userName}
                onView={handleViewCertificate}
                onClose={onClose}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
