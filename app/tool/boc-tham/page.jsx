'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ToolLayout, { useFullscreen } from '@/components/ToolLayout/ToolLayout';

export default function BocTham() {
  return (
    <ToolLayout toolName="Bốc Thăm Ngẫu Nhiên" toolIcon="�">
      <BocThamContent />
    </ToolLayout>
  );
}

function BocThamContent() {
  const { exitFullscreen } = useFullscreen();
  
  // Input
  const [inputText, setInputText] = useState('');
  
  // Results
  const [pickedPerson, setPickedPerson] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [animatingNames, setAnimatingNames] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Audio context
  const audioContextRef = useRef(null);

  // Compute names count
  const nameCount = useMemo(() => {
    return inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0).length;
  }, [inputText]);

  // Parse names from input
  const parseNames = useCallback(() => {
    return inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }, [inputText]);

  // Play sound effect
  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      switch (type) {
        case 'tick':
          oscillator.type = 'sine';
          oscillator.frequency.value = 800 + Math.random() * 400;
          gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.05);
          break;
          
        case 'drumroll':
          oscillator.type = 'triangle';
          oscillator.frequency.value = 150;
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.1);
          break;
          
        case 'winner':
          // Fanfare sound
          const notes = [523, 659, 784, 1047];
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
            osc.start(ctx.currentTime + i * 0.15);
            osc.stop(ctx.currentTime + i * 0.15 + 0.35);
          });
          break;
      }
    } catch (e) {
      console.error('Audio error:', e);
    }
  }, [soundEnabled]);

  // Pick one person with slot machine effect
  const pickOnePerson = useCallback(() => {
    const nameList = parseNames();
    if (nameList.length === 0) return;

    setIsAnimating(true);
    setShowResult(false);
    setPickedPerson(null);

    // Slot machine animation
    let count = 0;
    const totalSpins = 25 + Math.floor(Math.random() * 10);
    let spinSpeed = 50;
    
    const spin = () => {
      if (count >= totalSpins) {
        // Final pick
        const finalIndex = Math.floor(Math.random() * nameList.length);
        setPickedPerson(nameList[finalIndex]);
        setAnimatingNames([]);
        setIsAnimating(false);
        setShowResult(true);
        playSound('winner');
        return;
      }
      
      // Show 3 names at once (slot effect)
      const indices = [
        Math.floor(Math.random() * nameList.length),
        Math.floor(Math.random() * nameList.length),
        Math.floor(Math.random() * nameList.length)
      ];
      setAnimatingNames(indices.map(i => nameList[i]));
      
      if (count % 2 === 0) {
        playSound('tick');
      }
      
      count++;
      // Slow down towards the end
      if (count > totalSpins - 10) {
        spinSpeed += 30;
      }
      if (count > totalSpins - 5) {
        spinSpeed += 50;
        playSound('drumroll');
      }
      
      setTimeout(spin, spinSpeed);
    };
    
    spin();
  }, [parseNames, playSound]);

  // Reset
  const handleReset = useCallback(() => {
    exitFullscreen();
    setPickedPerson(null);
    setShowResult(false);
    setIsAnimating(false);
    setAnimatingNames([]);
  }, [exitFullscreen]);

  // Clear all
  const handleClearAll = useCallback(() => {
    setInputText('');
    handleReset();
  }, [handleReset]);

  // Cleanup audio context
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
      {/* Left Panel: Input - Order 2 on mobile */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-3 sm:space-y-4 order-2 lg:order-1">
        {/* Input */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 border border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
            <span>📝</span>
            Danh sách bốc thăm
          </h2>
          
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setShowResult(false);
            }}
            placeholder="Nhập mỗi dòng một mục&#10;&#10;Ví dụ:&#10;Minh&#10;Lan&#10;Hùng&#10;Mai&#10;Tuấn"
            className="w-full h-48 p-3 border-2 border-gray-200 rounded-xl text-base
              focus:border-violet-400 focus:ring-2 focus:ring-violet-100 
              transition-all resize-none"
            disabled={isAnimating}
          />

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className={`font-medium ${nameCount > 0 ? 'text-violet-600' : 'text-gray-400'}`}>
              {nameCount > 0 ? `${nameCount} mục` : 'Chưa có mục nào'}
            </span>
            <button
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-600 hover:underline text-sm"
              disabled={isAnimating}
            >
              Xóa tất cả
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
            Cài đặt
          </h3>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-5 h-5 text-violet-500 rounded focus:ring-violet-400"
            />
            <span className="text-gray-700 text-sm">
              🔊 Âm thanh
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-gray-700 
              font-semibold rounded-xl transition-all disabled:opacity-50"
            disabled={isAnimating || !pickedPerson}
          >
            🔄 Làm lại
          </button>
          <button
            onClick={pickOnePerson}
            disabled={isAnimating || nameCount < 1}
            className="flex-1 py-3 px-4 min-h-[44px] bg-gradient-to-r from-violet-500 to-pink-500 
              hover:from-violet-600 hover:to-pink-600 text-white font-bold 
              rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg hover:shadow-xl"
          >
            {isAnimating ? '🎰 Đang quay...' : '� BỐC THĂM!'}
          </button>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-violet-50 to-pink-50 rounded-xl p-4 text-sm border border-violet-100">
          <p className="font-semibold text-violet-700 mb-2">💡 Gợi ý sử dụng:</p>
          <ul className="space-y-1 text-gray-600">
            <li>👤 <strong>Bốc tên</strong> - Gọi học sinh trả lời</li>
            <li>❓ <strong>Bốc câu hỏi</strong> - Random bài tập</li>
            <li>🎁 <strong>Bốc quà</strong> - Phát thưởng ngẫu nhiên</li>
            <li>🎯 <strong>Bốc chủ đề</strong> - Chọn nội dung học</li>
          </ul>
        </div>
      </div>

      {/* Right Panel: Results - Order 1 on mobile (show result first) */}
      <div className="flex-1 min-w-0 order-1 lg:order-2">
        {/* No results yet */}
        {!showResult && !isAnimating && (
          <div className="bg-gradient-to-br from-violet-100 to-pink-100 rounded-2xl lg:rounded-3xl shadow-lg p-6 lg:p-12 
            text-center h-full flex flex-col items-center justify-center min-h-[280px] lg:min-h-[450px]">
            <div className="text-5xl lg:text-8xl mb-4 lg:mb-6 flex items-center gap-2 lg:gap-4">
              <span className="animate-bounce" style={{ animationDelay: '0s' }}>🎫</span>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎁</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>❓</span>
            </div>
            <h3 className="text-xl lg:text-3xl font-bold text-gray-700 mb-2 lg:mb-3">
              Sẵn sàng bốc thăm!
            </h3>
            <p className="text-gray-500 text-sm lg:text-lg mb-2 lg:mb-4">
              Bốc tên • Bốc câu hỏi • Bốc quà • Bốc chủ đề
            </p>
            <p className="text-violet-500 text-xs lg:text-sm">
              Nhập danh sách bên trái và bấm nút để bắt đầu
            </p>
          </div>
        )}

        {/* Animating - Slot Machine Effect */}
        {isAnimating && (
          <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl lg:rounded-3xl 
            shadow-2xl p-4 lg:p-8 text-center min-h-[280px] lg:min-h-[450px] flex flex-col items-center justify-center
            relative overflow-hidden">
            {/* Decorative lights */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 bg-yellow-300 rounded-full animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
            
            {/* Slot machine display */}
            <div className="relative z-10 bg-black/30 backdrop-blur rounded-xl lg:rounded-2xl p-4 lg:p-8 border-4 border-yellow-400">
              <div className="text-4xl lg:text-6xl mb-4 lg:mb-6">🎰</div>
              
              {/* Slot reels */}
              <div className="bg-white rounded-lg lg:rounded-xl p-3 lg:p-4 mb-4 min-w-[200px] lg:min-w-[300px]">
                <div className="space-y-2">
                  {animatingNames.map((name, i) => (
                    <div
                      key={i}
                      className={`text-lg lg:text-2xl font-bold py-2 px-3 lg:px-4 rounded-lg transition-all
                        ${i === 1 ? 'bg-yellow-300 text-yellow-800 scale-110' : 'bg-gray-100 text-gray-500 opacity-50'}`}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-white text-lg lg:text-xl font-bold animate-pulse">
                Đang quay số...
              </p>
            </div>
          </div>
        )}

        {/* Winner Result */}
        {showResult && pickedPerson && (
          <div className="animate-bounceIn">
            <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-2xl lg:rounded-3xl 
              shadow-2xl overflow-hidden min-h-[280px] lg:min-h-[450px] relative">
              {/* Confetti */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(40)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 animate-confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFEAA7', '#DDA0DD', '#98D8C8'][i % 6],
                      animationDelay: `${Math.random() * 0.5}s`,
                      animationDuration: `${2 + Math.random()}s`,
                      transform: `rotate(${Math.random() * 360}deg)`
                    }}
                  />
                ))}
              </div>
              
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 lg:p-6 text-center relative">
                <div className="absolute inset-0 flex items-center justify-around">
                  <span className="text-2xl lg:text-4xl animate-bounce">🎉</span>
                  <span className="text-2xl lg:text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎊</span>
                  <span className="text-2xl lg:text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>✨</span>
                  <span className="text-2xl lg:text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎉</span>
                </div>
                <h2 className="text-xl lg:text-3xl font-black text-white relative z-10 drop-shadow-lg">
                  🎫 KẾT QUẢ BỐC THĂM 🎫
                </h2>
              </div>
              
              {/* Winner Name */}
              <div className="p-6 lg:p-12 text-center flex flex-col items-center justify-center min-h-[180px] lg:min-h-[300px]">
                <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl p-4 lg:p-8 transform hover:scale-105 transition-all">
                  <div className="text-4xl lg:text-6xl mb-2 lg:mb-4">🎯</div>
                  <div className="text-3xl sm:text-5xl lg:text-7xl font-black text-transparent bg-clip-text 
                    bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 mb-2 lg:mb-4
                    animate-pulse">
                    {pickedPerson}
                  </div>
                  <div className="text-lg lg:text-2xl">🎉 Chúc mừng! 🎉</div>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-3 lg:gap-4 mt-4 lg:mt-8">
                  <button
                    onClick={handleReset}
                    className="px-4 lg:px-6 py-2 lg:py-3 min-h-[44px] bg-white/90 hover:bg-white text-gray-700 
                      font-bold rounded-full text-sm lg:text-lg shadow-lg transition-all"
                  >
                    🔄 Làm mới
                  </button>
                  <button
                    onClick={pickOnePerson}
                    className="px-6 lg:px-8 py-2 lg:py-3 min-h-[44px] bg-gradient-to-r from-violet-500 to-pink-500 
                      text-white font-bold rounded-full text-sm lg:text-lg shadow-lg
                      hover:from-violet-600 hover:to-pink-600 transition-all
                      hover:shadow-xl"
                  >
                    🎲 Bốc lại!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(500px) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
