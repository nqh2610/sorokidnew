'use client';

import { useState, useEffect } from 'react';
import { Download, Share, Smartphone } from 'lucide-react';

/**
 * 📱 PWA INSTALL BANNER
 * Banner hiển thị trên tất cả thiết bị
 * - Chỉ ẩn khi app đang chạy (standalone mode)
 * - Nếu user gỡ app rồi cài lại, banner sẽ hiện lại bình thường
 */
export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isReady, setIsReady] = useState(false); // Chờ check xong mới render

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Kiểm tra đang chạy trong app (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
      setIsReady(true);
      return;
    }

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);
    setIsReady(true); // Đã check xong, sẵn sàng render

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowThankYou(true);
      // Tự động ẩn sau 3 giây
      setTimeout(() => {
        setShowThankYou(false);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowTip(!showTip);
      return;
    }
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowThankYou(true);
        setTimeout(() => {
          setShowThankYou(false);
        }, 3000);
      }
      setDeferredPrompt(null);
    } else {
      setShowTip(!showTip);
    }
  };

  // Chưa check xong -> không render gì (tránh giật)
  if (!isReady) {
    return null;
  }

  // Đang chạy trong app (standalone) -> ẩn banner
  if (isInstalled) {
    // Chỉ hiện cảm ơn khi vừa cài xong
    if (showThankYou) {
      return (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Đã cài Sorokid App!</p>
              <p className="text-white/80 text-xs">Cảm ơn bạn 💜</p>
            </div>
          </div>
        </div>
      );
    }
    // Đang trong app -> ẩn banner
    return null;
  }

  return (
    <div className="lg:hidden">
      {/* Banner chính - chỉ hiện trên mobile và tablet */}
      <div className="bg-gradient-to-r from-violet-500 to-pink-500 rounded-2xl p-4 shadow-lg">
        
        {/* === MOBILE: Layout dọc === */}
        <div className="sm:hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow">
              <span className="text-xl">🦉</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Tải App Sorokid</h3>
              <p className="text-white/80 text-xs">Học Soroban mọi lúc</p>
            </div>
          </div>
          <button
            onClick={handleInstall}
            className="w-full py-2.5 bg-white text-violet-600 rounded-xl font-bold text-sm shadow flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Download size={16} />
            Cài đặt App
          </button>
        </div>

        {/* === DESKTOP: Layout ngang === */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow">
            <span className="text-2xl">🦉</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold">Tải App Sorokid</h3>
            <p className="text-white/80 text-sm">Học Soroban mọi lúc mọi nơi</p>
          </div>
          <button
            onClick={handleInstall}
            className="px-6 py-2.5 bg-white text-violet-600 rounded-xl font-bold text-sm shadow hover:shadow-lg hover:bg-violet-50 active:scale-95 transition-all flex items-center gap-2"
          >
            <Download size={16} />
            Cài đặt
          </button>
        </div>
      </div>

      {/* Hướng dẫn cài đặt */}
      {showTip && (
        <div className="mt-3 bg-white rounded-xl p-4 shadow-lg border border-violet-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 font-bold text-sm mb-2">
                {isIOS ? 'Cài trên iPhone/iPad:' : 'Cài trên Android:'}
              </p>
              <div className="space-y-1.5 text-xs text-gray-600">
                {isIOS ? (
                  <>
                    <p>1. Nhấn nút <strong className="text-blue-600">Chia sẻ</strong> <Share size={12} className="inline text-blue-600" /></p>
                    <p>2. Chọn <strong>"Thêm vào MH chính"</strong></p>
                  </>
                ) : (
                  <>
                    <p>1. Nhấn <strong>⋮</strong> góc phải trên</p>
                    <p>2. Chọn <strong>"Cài đặt ứng dụng"</strong></p>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowTip(false)}
            className="mt-3 w-full py-2 text-xs text-gray-500 hover:bg-gray-50 rounded-lg"
          >
            Đã hiểu ✓
          </button>
        </div>
      )}
    </div>
  );
}
