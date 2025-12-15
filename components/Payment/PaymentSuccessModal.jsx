'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Sparkles, PartyPopper, Crown, Star, Gift, ArrowRight, X } from 'lucide-react';

/**
 * PaymentSuccessModal - Modal thông báo thanh toán thành công với UX đẹp
 * Giúp người dùng yên tâm rằng giao dịch đã hoàn thành và gói đã được kích hoạt
 */
export default function PaymentSuccessModal({ 
  isOpen, 
  onClose, 
  tierName,
  tierDisplayName,
  onGoToDashboard 
}) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Animation sequence
      setStep(0);
      setShowConfetti(true);
      
      const timer1 = setTimeout(() => setStep(1), 300);
      const timer2 = setTimeout(() => setStep(2), 800);
      const timer3 = setTimeout(() => setStep(3), 1300);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getTierIcon = () => {
    switch (tierName) {
      case 'advanced': return <Crown className="w-12 h-12 text-amber-400" />;
      case 'basic': return <Star className="w-12 h-12 text-blue-400" />;
      default: return <Gift className="w-12 h-12 text-purple-400" />;
    }
  };

  const getTierColor = () => {
    switch (tierName) {
      case 'advanced': return 'from-amber-400 via-orange-500 to-rose-500';
      case 'basic': return 'from-blue-500 to-indigo-600';
      default: return 'from-purple-500 to-indigo-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div 
                className={`w-3 h-3 ${
                  ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 5]
                } ${i % 3 === 0 ? 'rounded-full' : 'rotate-45'}`}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Modal Content */}
      <div className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-500 ${
        step >= 0 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>

        {/* Header with gradient */}
        <div className={`relative bg-gradient-to-r ${getTierColor()} p-8 pb-16 text-center`}>
          {/* Animated circles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 rounded-full animate-ping" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full animate-pulse" />
          </div>
          
          {/* Success Icon */}
          <div className={`relative transform transition-all duration-500 delay-300 ${
            step >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-xl mb-4">
              <div className="relative">
                <CheckCircle className="w-14 h-14 text-emerald-500" />
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Success Text */}
          <div className={`transform transition-all duration-500 delay-500 ${
            step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <PartyPopper className="w-6 h-6" />
              Thanh toán thành công!
              <PartyPopper className="w-6 h-6 scale-x-[-1]" />
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="relative -mt-8 bg-white rounded-t-3xl px-6 py-8">
          {/* Package Info Card */}
          <div className={`transform transition-all duration-500 delay-700 ${
            step >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-6 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getTierColor()} flex items-center justify-center shadow-lg`}>
                  {getTierIcon()}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 mb-1">Gói đã kích hoạt</p>
                  <h3 className="text-xl font-bold text-slate-800">{tierDisplayName || 'Gói Premium'}</h3>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 rounded-full">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-emerald-700">Đã kích hoạt</span>
                </div>
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span>Giao dịch đã được xác nhận thành công</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span>Tất cả tính năng đã được mở khóa</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span>Sử dụng trọn đời, không giới hạn thời gian</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={onGoToDashboard || onClose}
              className={`w-full py-4 bg-gradient-to-r ${getTierColor()} text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all hover:-translate-y-0.5 group`}
            >
              <span>Bắt đầu học ngay</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Footer note */}
            <p className="text-center text-sm text-slate-400 mt-4">
              Cảm ơn bạn đã tin tưởng SoroKid! 💜
            </p>
          </div>
        </div>
      </div>

      {/* CSS for confetti animation */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
