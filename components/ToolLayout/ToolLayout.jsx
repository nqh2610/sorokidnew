'use client';

import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo/Logo';

// Context để chia sẻ hàm exitFullscreen với children
export const FullscreenContext = createContext({
  isFullscreen: false,
  exitFullscreen: () => {},
});

export const useFullscreen = () => useContext(FullscreenContext);

export default function ToolLayout({ 
  children, 
  toolName, 
  toolIcon,
  toolColor = 'from-violet-500 to-pink-500',
  showHeader = true,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
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
        <header className={`sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm
          ${isFullscreen ? 'hidden' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Back button & Logo */}
              <div className="flex items-center gap-3">
                <Link 
                  href="/tool"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-violet-600 
                    hover:bg-violet-50 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Quay lại</span>
                </Link>
                
                <div className="hidden sm:block w-px h-6 bg-gray-200" />
                
                <Link href="/" className="hidden sm:flex items-center">
                  <Logo size="sm" showText={true} />
                </Link>
              </div>

              {/* Center: Tool name */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{toolIcon}</span>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">{toolName}</h1>
              </div>

              {/* Right: Fullscreen button */}
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-violet-600 
                  hover:bg-violet-50 rounded-lg transition-all group"
                title="Toàn màn hình - Nhấn ESC để thoát"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isFullscreen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  )}
                </svg>
                <span className="hidden sm:inline text-sm">
                  {isFullscreen ? 'Thoát (ESC)' : 'Toàn màn hình'}
                </span>
              </button>
            </div>

            {/* Fullscreen hint for teachers */}
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400">
                💡 Bấm <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Toàn màn hình</kbd> để hiển thị to hơn • Nhấn <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">ESC</kbd> để thoát
              </p>
            </div>
          </div>
        </header>
      )}

      {/* Fullscreen Controls - Always visible in fullscreen mode */}
      {isFullscreen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3
          bg-gradient-to-b from-black/60 to-transparent">
          {/* Left: Tool info */}
          <div className="flex items-center gap-2 text-white">
            <span className="text-2xl">{toolIcon}</span>
            <span className="font-bold text-lg hidden sm:inline">{toolName}</span>
          </div>
          
          {/* Center: ESC hint */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 
            px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm">
            <kbd className="px-2 py-1 bg-white/20 rounded font-mono font-bold">ESC</kbd>
            <span>để thoát toàn màn hình</span>
          </div>
          
          {/* Right: Exit button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 
              text-white rounded-lg backdrop-blur-sm transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm font-medium">Thoát</span>
          </button>
        </div>
      )}

      {/* Main Content - wrapped with FullscreenContext */}
      <FullscreenContext.Provider value={{ isFullscreen, exitFullscreen }}>
        <main className={`max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 ${isFullscreen ? 'pt-16' : ''}`}>
          {children}
        </main>
      </FullscreenContext.Provider>

      {/* Footer - hidden in fullscreen */}
      {!isFullscreen && (
        <footer className="border-t border-gray-100 bg-white/50 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-sm text-gray-500">
              Công cụ dạy học miễn phí cho giáo viên tiểu học •{' '}
              <Link href="/" className="text-violet-600 hover:underline">Sorokid.com</Link>
            </p>
          </div>
        </footer>
      )}

      <style jsx global>{`
        .fullscreen-mode {
          background: linear-gradient(135deg, #f5f3ff 0%, #ffffff 50%, #fdf2f8 100%);
        }
        
        .fullscreen-mode main {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
