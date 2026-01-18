'use client';

import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * Loading skeleton cho các tool pages
 * Hiển thị trong khi tool đang được load (dynamic import)
 * 
 * @param {string} toolKey - Key để tra cứu name từ dictionary (e.g., 'luckyLight', 'spinWheel')
 * @param {string} toolName - Fallback name nếu không dùng toolKey
 * @param {string} toolIcon - Icon emoji
 * @param {string} message - Fallback message nếu không dùng toolKey
 */
export default function ToolLoadingSkeleton({ 
  toolKey,
  toolName, 
  toolIcon = '⏳',
  message
}) {
  const { t } = useI18n();
  
  // Nếu có toolKey, tra cứu từ toolbox.tools dictionary
  const displayName = toolKey 
    ? t(`toolbox.tools.${toolKey}.name`) 
    : (toolName || t('toolLayout.loading'));
  const displayMessage = message || t('toolLayout.preparing');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-pink-50">
      {/* Skeleton Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Back button skeleton */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>

            {/* Center: Tool name */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl lg:text-3xl">{toolIcon}</span>
              <div className="flex flex-col items-start">
                <span className="text-[9px] sm:text-[10px] lg:text-xs text-violet-500 font-medium">
                  {t('toolLayout.teacherToolbox')}
                </span>
                <span className="text-sm sm:text-lg lg:text-xl font-bold text-gray-800">
                  {displayName}
                </span>
              </div>
            </div>

            {/* Right: Fullscreen button skeleton */}
            <div className="w-11 sm:w-20 h-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Content - Loading Animation */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {/* Animated Icon */}
          <div className="text-6xl sm:text-7xl lg:text-8xl mb-6 animate-bounce">
            {toolIcon}
          </div>

          {/* Loading spinner */}
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-violet-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" />
          </div>

          {/* Loading text */}
          <p className="text-lg sm:text-xl text-gray-600 font-medium mb-2">
            {displayMessage}
          </p>
          <p className="text-sm text-gray-400">
            {t('toolLayout.pleaseWait')}
          </p>

          {/* Skeleton content boxes */}
          <div className="mt-8 w-full max-w-2xl space-y-4">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
            <div className="flex gap-4">
              <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer skeleton */}
      <footer className="border-t border-gray-100 bg-white/50 py-4 sm:py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 flex items-center justify-center">
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
      </footer>
    </div>
  );
}
