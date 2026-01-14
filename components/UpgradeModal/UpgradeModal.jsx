'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, Rocket } from 'lucide-react';
import { useLocalizedUrl } from '@/components/LocalizedLink';
import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * Modal nâng cấp - Compact & Effective Design
 */
export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  feature,
}) {
  const router = useRouter();
  const localizeUrl = useLocalizedUrl();
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const displayFeature = feature || t('upgrade.fullExperience');

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Compact Design */}
      <div 
        className={`relative bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl max-w-xs w-full overflow-hidden transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
        >
          <X size={16} className="text-white" />
        </button>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-pink-400/20 rounded-full blur-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative p-6 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-2xl mb-4">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          
          {/* Headline */}
          <h3 className="text-white text-xl font-bold mb-2">
            {t('upgrade.unlockEverything')}
          </h3>
          
          {/* Feature được yêu cầu */}
          <p className="text-white/70 text-sm mb-5 line-clamp-2">
            {displayFeature}
          </p>

          {/* 4 Benefits - Compact */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-5 text-left">
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xl">🧒</span>
                <div>
                  <div className="text-white font-semibold text-sm">{t('upgrade.mathProdigy')}</div>
                  <div className="text-white/60 text-xs">{t('upgrade.levels18')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">🧠</span>
                <div>
                  <div className="text-white font-semibold text-sm">{t('competeScreen.mentalMathTitle')}</div>
                  <div className="text-white/60 text-xs">{t('upgrade.mentalMath')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">⚡</span>
                <div>
                  <div className="text-white font-semibold text-sm">Flash Anzan</div>
                  <div className="text-white/60 text-xs">{t('competeScreen.mentalMathHint')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">📜</span>
                <div>
                  <div className="text-white font-semibold text-sm">{t('upgrade.certificates2')}</div>
                  <div className="text-white/60 text-xs">{t('certificate.subtitle')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <p className="text-white/50 text-xs mb-4">
            {t('upgrade.studentCount')}
          </p>

          {/* CTA Button */}
          <button
            onClick={() => {
              onClose();
              router.push(localizeUrl('/pricing'));
            }}
            className="w-full py-3.5 bg-white text-purple-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 hover:shadow-lg active:scale-[0.98] transition-all group"
          >
            <span>{t('upgrade.viewOffers')}</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          {/* Skip - mờ hơn */}
          <button
            onClick={onClose}
            className="w-full py-2 text-white/40 text-xs mt-3 hover:text-white/60 transition-colors"
          >
            {t('upgrade.maybeLater')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook để dễ sử dụng
export function useUpgradeModal() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    feature: ''
  });

  const showUpgradeModal = ({ feature }) => {
    setModalState({
      isOpen: true,
      feature
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const UpgradeModalComponent = () => (
    <UpgradeModal
      isOpen={modalState.isOpen}
      onClose={closeModal}
      feature={modalState.feature}
    />
  );

  return { showUpgradeModal, closeModal, UpgradeModalComponent };
}
