'use client';

import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import Logo from '@/components/Logo/Logo';
import BrandWatermark from '@/components/BrandWatermark/BrandWatermark';
import { useI18n } from '@/lib/i18n/I18nContext';

// Context để chia sẻ hàm exitFullscreen với children
export const FullscreenContext = createContext({
  isFullscreen: false,
  exitFullscreen: () => {},
});

export const useFullscreen = () => useContext(FullscreenContext);

// Helper to check if we're in browser
const isBrowser = typeof window !== 'undefined';

export default function ToolLayout({ 
  children, 
  toolName, 
  toolIcon,
  toolColor = 'from-violet-500 to-pink-500',
  showHeader = true,
  hideFullscreenButton = false, // Ẩn nút fullscreen cho các tool tự fullscreen
  // Brand watermark options
  showBrandLogo = true, // Hiện logo góc (mặc định bật)
  showBrandWatermark = false, // Hiện watermark giữa (mặc định tắt)
  brandPosition = 'bottom-right', // Vị trí logo góc
  brandWatermarkOpacity = 0.05, // Độ mờ watermark
}) {
  const { t } = useI18n();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    if (!isBrowser) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Exit fullscreen error:', err);
    }
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!isBrowser) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    if (!isBrowser) return;
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // ESC key handler
  useEffect(() => {
    if (!isBrowser) return;
    
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen bg-gradient-to-b from-violet-50 via-white to-pink-50
        ${isFullscreen ? 'fullscreen-mode' : ''}`}
    >
      {/* Header */}
      {showHeader && (
        <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm
          ${isFullscreen ? 'hidden' : ''}`}>
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
            <div className="flex items-center justify-between gap-2">
              {/* Left: Back button & Logo */}
              <div className="flex items-center gap-2 sm:gap-3">
                <LocalizedLink 
                  href="/tool"
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-violet-600 
                    hover:bg-violet-50 rounded-lg transition-all min-h-[44px]"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline text-sm lg:text-base">{t('toolLayout.back')}</span>
                </LocalizedLink>
                
                <div className="hidden md:block w-px h-6 bg-gray-200" />
                
                <LocalizedLink href="/" className="hidden md:flex items-center">
                  <Logo size="sm" showText={true} />
                </LocalizedLink>
              </div>

              {/* Center: Tool name with link to toolbox */}
              <LocalizedLink href="/tool" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity min-w-0">
                <span className="text-xl sm:text-2xl lg:text-3xl flex-shrink-0">{toolIcon}</span>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-[9px] sm:text-[10px] lg:text-xs text-violet-500 font-medium -mb-0.5 hidden sm:block">{t('toolLayout.teacherToolbox')}</span>
                  <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-800 truncate">{toolName}</h1>
                </div>
              </LocalizedLink>

              {/* Right: Fullscreen button */}
              {!hideFullscreenButton && (
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-violet-600 
                    hover:bg-violet-50 rounded-lg transition-all min-h-[44px] min-w-[44px] justify-center"
                  title={t('toolLayout.fullscreenTitle')}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isFullscreen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    )}
                  </svg>
                  <span className="hidden lg:inline text-sm">
                    {isFullscreen ? t('toolLayout.exitEsc') : t('toolLayout.fullscreen')}
                  </span>
                </button>
              )}
              {hideFullscreenButton && <div className="w-11 sm:w-20" />}
            </div>

            {/* Fullscreen hint for teachers - hide on mobile */}
            <div className="mt-1.5 sm:mt-2 text-center hidden sm:block">
              <p className="text-[10px] sm:text-xs text-gray-400">
                💡 {t('toolLayout.fullscreenHintPrefix')} <kbd className="px-1 sm:px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono text-[10px] sm:text-xs">{t('toolLayout.fullscreen')}</kbd> {t('toolLayout.fullscreenHintSuffix')}
              </p>
            </div>
          </div>
        </header>
      )}

      {/* Fullscreen Controls - Always visible in fullscreen mode */}
      {isFullscreen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3
          bg-gradient-to-b from-black/70 to-transparent">
          {/* Left: Tool info */}
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl sm:text-2xl lg:text-3xl">{toolIcon}</span>
            <span className="font-bold text-sm sm:text-lg lg:text-xl hidden sm:inline">{toolName}</span>
          </div>
          
          {/* Center: ESC hint */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 
            px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-xs sm:text-sm">
            <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/20 rounded font-mono font-bold">ESC</kbd>
            <span>{t('toolLayout.toExit')}</span>
          </div>
          
          {/* Right: Exit button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 
              text-white rounded-lg backdrop-blur-sm transition-all min-h-[44px] min-w-[44px] justify-center"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">{t('toolLayout.exit')}</span>
          </button>
        </div>
      )}

      {/* Main Content - wrapped with FullscreenContext */}
      <FullscreenContext.Provider value={{ isFullscreen, exitFullscreen }}>
        <main className={`
          ${isFullscreen 
            ? 'w-full h-screen pt-14 sm:pt-16 pb-4 px-2 sm:px-4 flex items-center justify-center' 
            : 'max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8'
          }`}
        >
          <div className={isFullscreen ? 'w-full max-w-6xl' : ''}>
            {children}
          </div>
        </main>
      </FullscreenContext.Provider>

      {/* Footer - hidden in fullscreen and on small mobile */}
      {!isFullscreen && (
        <footer className="border-t border-gray-100 bg-white/50 py-4 sm:py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <LocalizedLink href="/" className="flex items-center">
              <Logo size="sm" showText={true} />
            </LocalizedLink>
            <div className="hidden sm:block w-px h-5 bg-gray-300" />
            <p className="text-xs sm:text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} SoroKid - {t('footer.copyright')}
            </p>
          </div>
        </footer>
      )}

      {/* Brand Watermark - Logo thương hiệu */}
      <BrandWatermark 
        showCornerLogo={showBrandLogo}
        showCenterWatermark={showBrandWatermark}
        cornerPosition={brandPosition}
        centerOpacity={brandWatermarkOpacity}
        isFullscreen={isFullscreen}
      />

      <style jsx global>{`
        .fullscreen-mode {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
        }
        
        .fullscreen-mode main {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          justify-content: center;
          align-items: center;
          padding-top: 4rem;
        }
        
        /* Don't scale if tool has its own fullscreen overlay */
        .fullscreen-mode main > div:not(:has(.fixed)) {
          transform-origin: center center;
        }
        
        @media (min-width: 1024px) {
          .fullscreen-mode main > div:not(:has(.fixed)) {
            transform: scale(1.15);
          }
        }
        
        @media (min-width: 1280px) {
          .fullscreen-mode main > div:not(:has(.fixed)) {
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
