'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout/ToolLayout';
import { LogoIcon } from '@/components/Logo/Logo';
import { useGameSettings } from '@/lib/useGameSettings';
import { GAME_IDS } from '@/lib/gameStorage';
import { useI18n } from '@/lib/i18n/I18nContext';

// Default settings - rút gọn key để tiết kiệm storage
const DEFAULT_SETTINGS = {
  op: 'add',    // operationType: 'add' | 'addSubtract'
  d: 1,         // digitCount: 1 | 2
  f: 5,         // flashCount: 5-30
  spd: 1.5,     // speed: 0.1-5 seconds
};

export default function FlashZan() {
  const { t } = useI18n();
  
  // Settings với auto-save - chỉ lưu khi user thoát hoặc bấm "Bắt đầu"
  const { settings, updateSettings, saveNow } = useGameSettings(
    GAME_IDS.FLASH_ZAN, 
    DEFAULT_SETTINGS
  );

  // Destructure settings để dùng trong component
  const operationType = settings.op;
  const digitCount = settings.d;
  const flashCount = settings.f;
  const speed = settings.spd;

  // Setters - update local state, auto-save khi unmount
  const setOperationType = (val) => updateSettings({ op: val });
  const setDigitCount = (val) => updateSettings({ d: val });
  const setFlashCount = (val) => updateSettings({ f: val });
  const setSpeed = (val) => updateSettings({ spd: val });
  
  // Runtime state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [numbers, setNumbers] = useState([]);
  const [displayValue, setDisplayValue] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const flashDisplayRef = useRef(null);

  // Enter fullscreen for flash display
  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && flashDisplayRef.current) {
        await flashDisplayRef.current.requestFullscreen();
      }
    } catch (err) {
      // Fullscreen not supported
    }
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      // Exit fullscreen error
    }
  }, []);

  // Generate random number based on digit count
  const generateNumber = useCallback((min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, []);

  // Generate flash sequence ensuring result is always positive
  const generateSequence = useCallback(() => {
    const sequence = [];
    let currentSum = 0;
    
    const maxNum = digitCount === 1 ? 9 : 99;
    const minNum = digitCount === 1 ? 1 : 10;

    for (let i = 0; i < flashCount; i++) {
      let num;
      let operation = '+';

      if (i === 0) {
        // First number is always positive
        num = generateNumber(minNum, maxNum);
      } else if (operationType === 'add') {
        // Only addition
        num = generateNumber(minNum, maxNum);
      } else {
        // Addition and subtraction
        // 50% chance for subtraction if possible
        if (Math.random() < 0.5 && currentSum > minNum) {
          operation = '-';
          // Ensure we don't go negative
          const maxSubtract = Math.min(maxNum, currentSum - 1);
          if (maxSubtract >= minNum) {
            num = generateNumber(minNum, maxSubtract);
          } else {
            // Fall back to addition if we can't subtract
            operation = '+';
            num = generateNumber(minNum, maxNum);
          }
        } else {
          num = generateNumber(minNum, maxNum);
        }
      }

      const signedNum = operation === '-' ? -num : num;
      currentSum += signedNum;
      
      sequence.push({
        value: num,
        operation,
        display: operation === '-' ? `-${num}` : `+${num}`
      });
    }

    // First item doesn't need + sign
    if (sequence.length > 0) {
      sequence[0].display = String(sequence[0].value);
    }

    return sequence;
  }, [flashCount, digitCount, operationType, generateNumber]);

  // Start flash - LƯU SETTINGS NGAY KHI BẮT ĐẦU
  const startFlash = useCallback(async () => {
    // Lưu settings ngay khi user bấm bắt đầu
    saveNow();
    
    const sequence = generateSequence();
    setNumbers(sequence);
    setCurrentIndex(0);
    setIsRunning(true);
    setIsFinished(false);
    setIsPaused(false);
    setShowAnswer(false);
    
    // Show first number immediately
    setDisplayValue(sequence[0]);
    
    // Enter fullscreen after a short delay to let React render
    setTimeout(() => {
      enterFullscreen();
    }, 100);
  }, [generateSequence, enterFullscreen]);

  // Flash animation loop
  useEffect(() => {
    if (!isRunning || isPaused || isFinished) return;

    if (currentIndex >= numbers.length) {
      setIsFinished(true);
      setIsRunning(false);
      setDisplayValue(null);
      return;
    }

    setDisplayValue(numbers[currentIndex]);

    intervalRef.current = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, speed * 1000);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, currentIndex, numbers, speed, isFinished]);

  // Pause/Resume
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Stop
  const stopFlash = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    exitFullscreen();
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
    setCurrentIndex(0);
    setDisplayValue(null);
  }, [exitFullscreen]);

  // Calculate answer
  const calculateAnswer = useCallback(() => {
    return numbers.reduce((sum, item) => {
      return sum + (item.operation === '-' ? -item.value : item.value);
    }, 0);
  }, [numbers]);

  // Keyboard handler - ESC to exit, Space/Enter to pause/resume
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ESC to exit
      if (e.key === 'Escape' && (isRunning || isFinished)) {
        stopFlash();
        return;
      }
      // Space or Enter to pause/resume (only when running, not finished)
      if ((e.key === ' ' || e.key === 'Enter') && isRunning && !isFinished) {
        e.preventDefault(); // Prevent page scroll on space
        togglePause();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, isFinished, stopFlash, togglePause]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  return (
    <ToolLayout toolName={t('toolbox.tools.flashAnzan.name')} toolIcon="⚡" hideFullscreenButton>
      <div ref={containerRef} className="space-y-6">
        {/* Settings Panel - Compact Design */}
        {!isRunning && !isFinished && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 max-w-3xl mx-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>⚙️</span>
              {t('toolbox.flashZan.settings')}
            </h2>

            {/* Row 1: Phép tính + Số chữ số */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Operation Type */}
              <div className="bg-gray-50 rounded-xl p-3">
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  {t('toolbox.flashZan.operation')}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOperationType('add')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all
                      ${operationType === 'add' 
                        ? 'bg-violet-500 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-violet-50 border border-gray-200'}`}
                  >
                    ➕ {t('toolbox.flashZan.add')}
                  </button>
                  <button
                    onClick={() => setOperationType('addSubtract')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all
                      ${operationType === 'addSubtract' 
                        ? 'bg-violet-500 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-violet-50 border border-gray-200'}`}
                  >
                    ➕➖ {t('toolbox.flashZan.addSubtract')}
                  </button>
                </div>
              </div>

              {/* Digit Count */}
              <div className="bg-gray-50 rounded-xl p-3">
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  {t('toolbox.flashZan.digits')}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDigitCount(1)}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all
                      ${digitCount === 1 
                        ? 'bg-violet-500 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-violet-50 border border-gray-200'}`}
                  >
                    {t('toolbox.flashZan.oneDigit')}
                  </button>
                  <button
                    onClick={() => setDigitCount(2)}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all
                      ${digitCount === 2 
                        ? 'bg-violet-500 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-violet-50 border border-gray-200'}`}
                  >
                    {t('toolbox.flashZan.twoDigit')}
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Sliders */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* Flash Count */}
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {t('toolbox.flashZan.count')}
                  </h3>
                  <span className="text-lg font-bold text-violet-600">{flashCount}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={flashCount}
                  onChange={(e) => setFlashCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                    accent-violet-500"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>3</span>
                  <span>30</span>
                </div>
              </div>

              {/* Speed */}
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {t('toolbox.flashZan.speed')}
                  </h3>
                  <span className="text-lg font-bold text-violet-600">{speed}s</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                    accent-violet-500"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>{t('toolbox.flashZan.fast')}</span>
                  <span>{t('toolbox.flashZan.slow')}</span>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={startFlash}
                className="px-10 py-4 text-xl font-black text-white rounded-full
                  bg-gradient-to-r from-yellow-400 to-orange-500 
                  hover:from-yellow-500 hover:to-orange-600 
                  hover:scale-105 hover:shadow-xl 
                  active:scale-95 transition-all duration-200"
              >
                ⚡ {t('toolbox.flashZan.start')}
              </button>
              <p className="text-sm text-gray-400 mt-2">
                {t('toolbox.flashZan.fullscreenHint')} • {t('toolbox.flashZan.escHint')} <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">ESC</kbd>
              </p>
            </div>
          </div>
        )}

        {/* Flash Display */}
        {(isRunning || isFinished) && (
          <div 
            ref={flashDisplayRef}
            onClick={() => {
              // Click vào màn hình để tạm dừng/tiếp tục (chỉ khi đang chạy)
              if (isRunning && !isFinished) {
                togglePause();
              }
            }}
            className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-900 via-violet-900 to-pink-900
              flex flex-col items-center justify-center cursor-pointer select-none">
            
            {/* Top bar - Responsive & Clean */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3
              bg-gradient-to-b from-black/70 to-transparent" onClick={(e) => e.stopPropagation()}>
              
              {/* Left: Logo + Title */}
              <div className="text-white/90 text-sm sm:text-base flex items-center gap-1.5">
                <span className="text-base sm:text-lg">⚡</span>
                <span className="font-semibold hidden xs:inline">Flash ZAN</span>
              </div>
              
              {/* Center: Progress counter */}
              <div className="absolute left-1/2 -translate-x-1/2 text-white font-bold text-sm sm:text-base">
                {currentIndex} / {numbers.length}
              </div>
              
              {/* Right: Exit button */}
              <button
                onClick={stopFlash}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm
                  rounded-lg transition-all flex items-center gap-1"
              >
                <span>✕</span>
                <span className="hidden sm:inline">{t('toolbox.flashZan.exit')}</span>
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="absolute top-11 sm:top-14 left-3 right-3 sm:left-4 sm:right-4">
              <div className="h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
                  style={{ width: `${(currentIndex / numbers.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Main display */}
            {isRunning && displayValue && (
              <div className="text-center animate-flash">
                <div className={`font-black leading-none
                  ${displayValue.operation === '-' 
                    ? 'text-orange-300' // Màu cam nhẹ cho trừ - không căng thẳng
                    : 'text-cyan-300'   // Màu xanh cyan cho cộng - tươi sáng
                  }`}
                  style={{
                    fontSize: digitCount === 1 ? 'min(40vw, 50vh, 320px)' : 'min(35vw, 45vh, 280px)',
                    textShadow: displayValue.operation === '-'
                      ? '0 0 60px rgba(251,191,36,0.5), 0 0 120px rgba(251,146,60,0.3)'
                      : '0 0 60px rgba(103,232,249,0.5), 0 0 120px rgba(34,211,238,0.3)'
                  }}
                >
                  {displayValue.display}
                </div>
              </div>
            )}

            {/* Finished state */}
            {isFinished && !showAnswer && (
              <div className="text-center animate-bounceIn">
                <div className="text-8xl mb-6">✅</div>
                <h2 className="text-4xl sm:text-6xl font-black text-white mb-4">
                  {t('toolbox.flashZan.complete')}
                </h2>
                <p className="text-2xl text-white/70 mb-8">
                  {t('toolbox.flashZan.flashedNumbers', { count: numbers.length })}
                </p>
                
                {/* Show answer option */}
                <div className="space-y-4">
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="px-10 py-5 bg-gradient-to-r from-green-400 to-emerald-500 
                      hover:from-green-500 hover:to-emerald-600 text-white 
                      font-black rounded-full text-2xl transition-all hover:scale-105
                      shadow-lg shadow-green-500/30"
                  >
                    👁️ {t('toolbox.flashZan.showAnswer')}
                  </button>
                  
                  <div className="flex gap-4 justify-center mt-6">
                    <button
                      onClick={startFlash}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 
                        text-white font-bold rounded-full text-xl hover:shadow-lg transition-all"
                    >
                      🔄 {t('toolbox.flashZan.retry')}
                    </button>
                    <button
                      onClick={stopFlash}
                      className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white 
                        font-bold rounded-full text-xl transition-all"
                    >
                      ⚙️ {t('toolbox.flashZan.toSettings')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Answer Display - Responsive & Centered Layout */}
            {isFinished && showAnswer && (
              <div className="flex flex-col items-center justify-center h-full w-full px-4 animate-bounceIn">
                {/* Main content wrapper - căn giữa tuyệt đối */}
                <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl">
                  {/* Answer number - Lớn nhất, nổi bật nhất */}
                  <div 
                    className="font-black text-transparent bg-clip-text 
                      bg-gradient-to-r from-yellow-300 via-green-300 to-cyan-300
                      leading-none"
                    style={{
                      fontSize: 'clamp(80px, 25vw, 300px)',
                    }}
                  >
                    {calculateAnswer()}
                  </div>
                  
                  {/* Summary - phía dưới số */}
                  <div className="mt-2 sm:mt-4 text-sm sm:text-lg md:text-xl text-white/70">
                    {t('toolbox.flashZan.total', { count: numbers.length })}: {numbers.map(n => n.display).join(' ')}
                  </div>
                </div>
                
                {/* Buttons - cố định ở bottom */}
                <div className="w-full pb-6 sm:pb-8">
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                    <button
                      onClick={() => setShowAnswer(false)}
                      className="px-4 py-2.5 sm:px-5 sm:py-3 bg-white/20 hover:bg-white/30 text-white 
                        font-semibold rounded-full text-sm sm:text-base transition-all"
                    >
                      ← {t('toolbox.flashZan.hide')}
                    </button>
                    <button
                      onClick={startFlash}
                      className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-yellow-400 to-orange-500 
                        text-white font-bold rounded-full text-sm sm:text-lg hover:shadow-lg transition-all"
                    >
                      🔄 {t('toolbox.flashZan.retry')}
                    </button>
                    <button
                      onClick={stopFlash}
                      className="px-4 py-2.5 sm:px-5 sm:py-3 bg-white/20 hover:bg-white/30 text-white 
                        font-semibold rounded-full text-sm sm:text-base transition-all"
                    >
                      ⚙️ {t('toolbox.flashZan.settings')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Hint/Pause indicator - Cùng vị trí, toggle theo trạng thái */}
            {isRunning && !isPaused && (
              <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2
                px-3 py-1.5 sm:px-4 sm:py-2 bg-white/15 backdrop-blur-sm rounded-full
                text-white/70 text-xs sm:text-sm animate-pulse text-center">
                <span className="sm:hidden">👆 {t('toolbox.flashZan.tapToPause')}</span>
                <span className="hidden sm:inline">{t('toolbox.flashZan.spaceOrClickPause')}</span>
              </div>
            )}

            {isPaused && (
              <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2
                px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-500/95 backdrop-blur-sm rounded-xl
                flex items-center gap-2 shadow-xl">
                <span className="text-base sm:text-lg">⏸️</span>
                <div className="text-left">
                  <div className="text-white font-bold text-xs sm:text-sm">{t('toolbox.flashZan.paused')}</div>
                  <div className="text-white/80 text-[10px] sm:text-xs">
                    <span className="sm:hidden">{t('toolbox.flashZan.tapToContinue')}</span>
                    <span className="hidden sm:inline">{t('toolbox.flashZan.spaceOrClickContinue')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Logo SoroKid - Góc dưới trái, không che nội dung */}
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 pointer-events-none select-none">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-sm">
                <LogoIcon size={18} />
                <span className="text-xs font-bold text-white/80">SoroKid</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes flash {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          20% {
            opacity: 1;
            transform: scale(1);
          }
          80% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.1);
          }
        }
        
        .animate-flash {
          animation: flash ${speed}s ease-in-out;
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }
      `}</style>
    </ToolLayout>
  );
}
