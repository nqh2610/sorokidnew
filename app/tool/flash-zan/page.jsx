'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout/ToolLayout';

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
  const [showAnswer, setShowAnswer] = useState(false); // Thêm state hiển thị đáp án
  
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

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

  // Enter fullscreen
  const enterFullscreen = useCallback(async () => {
    try {
      if (containerRef.current && !document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // Start flash
  const startFlash = useCallback(async () => {
    const sequence = generateSequence();
    setNumbers(sequence);
    setCurrentIndex(0);
    setIsRunning(true);
    setIsFinished(false);
    setIsPaused(false);
    setShowAnswer(false); // Reset show answer
    
    // Enter fullscreen
    await enterFullscreen();
    
    // Show first number immediately
    setDisplayValue(sequence[0]);
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
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
    setCurrentIndex(0);
    setDisplayValue(null);
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

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
    <ToolLayout toolName="Flash ZAN" toolIcon="⚡">
      <div ref={containerRef} className="space-y-6">
        {/* Settings Panel - Hidden during flash */}
        {!isRunning && !isFinished && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>⚙️</span>
              Cài đặt bài tập
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Operation Type */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  Loại phép tính
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl 
                    hover:bg-violet-50 transition-colors">
                    <input
                      type="radio"
                      name="operation"
                      checked={operationType === 'add'}
                      onChange={() => setOperationType('add')}
                      className="w-5 h-5 text-violet-500"
                    />
                    <span className="text-lg">➕ Cộng</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl 
                    hover:bg-violet-50 transition-colors">
                    <input
                      type="radio"
                      name="operation"
                      checked={operationType === 'addSubtract'}
                      onChange={() => setOperationType('addSubtract')}
                      className="w-5 h-5 text-violet-500"
                    />
                    <span className="text-lg">➕➖ Cộng và Trừ</span>
                  </label>
                </div>
              </div>

              {/* Digit Count */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  Số chữ số
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl 
                    hover:bg-violet-50 transition-colors">
                    <input
                      type="radio"
                      name="digits"
                      checked={digitCount === 1}
                      onChange={() => setDigitCount(1)}
                      className="w-5 h-5 text-violet-500"
                    />
                    <span className="text-lg">1 chữ số (1-9)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl 
                    hover:bg-violet-50 transition-colors">
                    <input
                      type="radio"
                      name="digits"
                      checked={digitCount === 2}
                      onChange={() => setDigitCount(2)}
                      className="w-5 h-5 text-violet-500"
                    />
                    <span className="text-lg">2 chữ số (10-99)</span>
                  </label>
                </div>
              </div>

              {/* Flash Count */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  Số lượng số: <span className="text-violet-600 font-bold">{flashCount}</span>
                </h3>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={flashCount}
                  onChange={(e) => setFlashCount(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer
                    accent-violet-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>3</span>
                  <span>30</span>
                </div>
              </div>

              {/* Speed */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  Tốc độ: <span className="text-violet-600 font-bold">{speed}s</span>
                </h3>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer
                    accent-violet-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0.1s (Siêu nhanh)</span>
                  <span>5s (Chậm)</span>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="mt-8 text-center">
              <button
                onClick={startFlash}
                className="px-12 py-5 text-2xl font-black text-white rounded-full
                  bg-gradient-to-r from-yellow-400 to-orange-500 
                  hover:from-yellow-500 hover:to-orange-600 
                  hover:scale-105 hover:shadow-xl 
                  active:scale-95 transition-all duration-200"
              >
                ⚡ BẮT ĐẦU FLASH!
              </button>
              <p className="text-sm text-gray-500 mt-3">
                Sẽ tự động vào chế độ toàn màn hình
              </p>
            </div>
          </div>
        )}

        {/* Flash Display */}
        {(isRunning || isFinished) && (
          <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-violet-900 to-pink-900
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
                  ${digitCount === 1 ? 'text-[20rem]' : 'text-[15rem]'}
                  ${displayValue.operation === '-' 
                    ? 'text-orange-300' // Màu cam nhẹ cho trừ - không căng thẳng
                    : 'text-cyan-300'   // Màu xanh cyan cho cộng - tươi sáng
                  }`}
                  style={{
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
          </div>
        )}

        {/* Preview/Info Section */}
        {!isRunning && !isFinished && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💡</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Hướng dẫn sử dụng
                </h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Flash sẽ hiển thị từng số một trên màn hình toàn màn hình</li>
                  <li>• Nhấn <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-700 font-mono text-sm">ESC</kbd> để thoát bất cứ lúc nào</li>
                  <li>• Học sinh tính nhẩm tổng các số</li>
                  <li>• Kết quả phép tính luôn là số dương</li>
                  <li>• Phù hợp luyện tập Soroban và Anzan</li>
                  <li>• Bấm "Xem đáp án" sau khi hoàn thành để kiểm tra</li>
                </ul>
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
