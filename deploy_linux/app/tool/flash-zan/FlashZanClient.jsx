'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout/ToolLayout';
import { LogoIcon } from '@/components/Logo/Logo';

export default function FlashZan() {
  // Settings
  const [operationType, setOperationType] = useState('add'); // 'add' | 'addSubtract'
  const [digitCount, setDigitCount] = useState(1); // 1 | 2
  const [flashCount, setFlashCount] = useState(5); // 5-30
  const [speed, setSpeed] = useState(1.5); // 0.1-5 seconds, default vừa phải
  
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
      console.log('Fullscreen not supported');
    }
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.log('Exit fullscreen error');
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

  // Start flash
  const startFlash = useCallback(async () => {
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

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && (isRunning || isFinished)) {
        stopFlash();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isRunning, isFinished, stopFlash]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  return (
    <ToolLayout toolName="Flash ZAN" toolIcon="⚡" hideFullscreenButton>
      <div ref={containerRef} className="space-y-6">
        {/* Settings Panel - Compact Design */}
        {!isRunning && !isFinished && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 max-w-3xl mx-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>⚙️</span>
              Cài đặt bài tập
            </h2>

            {/* Row 1: Phép tính + Số chữ số */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Operation Type */}
              <div className="bg-gray-50 rounded-xl p-3">
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Phép tính
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOperationType('add')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all
                      ${operationType === 'add' 
                        ? 'bg-violet-500 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-violet-50 border border-gray-200'}`}
                  >
                    ➕ Cộng
                  </button>
                  <button
                    onClick={() => setOperationType('addSubtract')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all
                      ${operationType === 'addSubtract' 
                        ? 'bg-violet-500 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-violet-50 border border-gray-200'}`}
                  >
                    ➕➖ Cộng Trừ
                  </button>
                </div>
              </div>

              {/* Digit Count */}
              <div className="bg-gray-50 rounded-xl p-3">
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Số chữ số
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDigitCount(1)}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all
                      ${digitCount === 1 
                        ? 'bg-violet-500 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-violet-50 border border-gray-200'}`}
                  >
                    1 số (1-9)
                  </button>
                  <button
                    onClick={() => setDigitCount(2)}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all
                      ${digitCount === 2 
                        ? 'bg-violet-500 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-violet-50 border border-gray-200'}`}
                  >
                    2 số (10-99)
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
                    Số lượng
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
                    Tốc độ
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
                  <span>0.1s (Nhanh)</span>
                  <span>5s (Chậm)</span>
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
                ⚡ BẮT ĐẦU FLASH!
              </button>
              <p className="text-sm text-gray-400 mt-2">
                Tự động vào toàn màn hình • Nhấn <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">ESC</kbd> để thoát
              </p>
            </div>
          </div>
        )}

        {/* Flash Display */}
        {(isRunning || isFinished) && (
          <div 
            ref={flashDisplayRef}
            className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-violet-900 to-pink-900
              flex flex-col items-center justify-center">
            
            {/* Top bar with ESC hint */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3
              bg-gradient-to-b from-black/60 to-transparent">
              <div className="text-white/80 text-sm">
                ⚡ Flash ZAN
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm 
                rounded-full text-white/80 text-sm">
                <kbd className="px-2 py-0.5 bg-white/20 rounded font-mono font-bold text-xs">ESC</kbd>
                <span>để thoát</span>
              </div>
              <button
                onClick={stopFlash}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm
                  rounded-lg transition-all"
              >
                ✕ Thoát
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="absolute top-14 left-4 right-4">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
                  style={{ width: `${(currentIndex / numbers.length) * 100}%` }}
                />
              </div>
              <div className="text-white/60 text-sm mt-2 text-center">
                {currentIndex} / {numbers.length}
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
                  HOÀN THÀNH!
                </h2>
                <p className="text-2xl text-white/70 mb-8">
                  Đã flash {numbers.length} số
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
                    👁️ XEM ĐÁP ÁN
                  </button>
                  
                  <div className="flex gap-4 justify-center mt-6">
                    <button
                      onClick={startFlash}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 
                        text-white font-bold rounded-full text-xl hover:shadow-lg transition-all"
                    >
                      🔄 Làm lại
                    </button>
                    <button
                      onClick={stopFlash}
                      className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white 
                        font-bold rounded-full text-xl transition-all"
                    >
                      ⚙️ Về cài đặt
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Answer Display - SUPER BIG for projector */}
            {isFinished && showAnswer && (
              <div className="text-center animate-bounceIn">
                <div className="text-4xl sm:text-5xl text-white/70 mb-4 font-bold">
                  🎯 ĐÁP ÁN
                </div>
                <div 
                  className="font-black text-transparent bg-clip-text 
                    bg-gradient-to-r from-yellow-300 via-green-300 to-cyan-300
                    animate-pulse"
                  style={{
                    fontSize: 'min(35vw, 35vh, 400px)',
                    lineHeight: 1,
                    textShadow: '0 0 80px rgba(255,255,255,0.5), 0 0 160px rgba(74,222,128,0.4)'
                  }}
                >
                  {calculateAnswer()}
                </div>
                
                {/* Summary */}
                <div className="mt-8 text-xl text-white/60">
                  Tổng {numbers.length} số: {numbers.map(n => n.display).join(' ')}
                </div>
                
                <div className="flex gap-4 justify-center mt-8">
                  <button
                    onClick={() => setShowAnswer(false)}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white 
                      font-semibold rounded-full text-lg transition-all"
                  >
                    ← Ẩn đáp án
                  </button>
                  <button
                    onClick={startFlash}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 
                      text-white font-bold rounded-full text-xl hover:shadow-lg transition-all"
                  >
                    🔄 Làm lại
                  </button>
                  <button
                    onClick={stopFlash}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white 
                      font-semibold rounded-full text-lg transition-all"
                  >
                    ⚙️ Cài đặt
                  </button>
                </div>
              </div>
            )}

            {/* Controls during flash */}
            {isRunning && (
              <div className="absolute bottom-8 flex gap-4">
                <button
                  onClick={togglePause}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white 
                    font-semibold rounded-full transition-all"
                >
                  {isPaused ? '▶️ Tiếp tục' : '⏸️ Tạm dừng'}
                </button>
                <button
                  onClick={stopFlash}
                  className="px-6 py-3 bg-red-500/80 hover:bg-red-500 text-white 
                    font-semibold rounded-full transition-all"
                >
                  ⏹️ Dừng
                </button>
              </div>
            )}

            {/* Pause overlay */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">⏸️</div>
                  <h3 className="text-4xl font-bold text-white">TẠM DỪNG</h3>
                </div>
              </div>
            )}

            {/* LOGO SOROKID - Góc dưới trái */}
            <div className="absolute bottom-3 left-3 z-[5] pointer-events-none select-none" aria-hidden="true">
              <div className="flex items-center gap-1.5 opacity-60">
                <LogoIcon size={22} />
                <span className="text-xs font-bold tracking-tight text-white/80">SoroKid</span>
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
