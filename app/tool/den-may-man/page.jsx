'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout/ToolLayout';

export default function DenMayMan() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null); // 'green' | 'red' | null
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [flickerColor, setFlickerColor] = useState(null);
  
  const audioContextRef = useRef(null);
  const flickerIntervalRef = useRef(null);

  // Play sound effects
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
        case 'suspense':
          // Ticking suspense sound
          oscillator.type = 'square';
          oscillator.frequency.value = 200;
          gainNode.gain.value = 0.15;
          oscillator.start();
          setTimeout(() => oscillator.stop(), 80);
          break;
          
        case 'green':
          // Happy victory sound
          oscillator.type = 'sine';
          gainNode.gain.value = 0.3;
          oscillator.frequency.value = 523; // C5
          oscillator.start();
          setTimeout(() => {
            oscillator.frequency.value = 659; // E5
            setTimeout(() => {
              oscillator.frequency.value = 784; // G5
              setTimeout(() => {
                oscillator.frequency.value = 1047; // C6
                setTimeout(() => oscillator.stop(), 200);
              }, 150);
            }, 150);
          }, 150);
          break;
          
        case 'red':
          // Dramatic fail sound
          oscillator.type = 'sawtooth';
          gainNode.gain.value = 0.25;
          oscillator.frequency.value = 200;
          oscillator.start();
          setTimeout(() => {
            oscillator.frequency.value = 150;
            setTimeout(() => {
              oscillator.frequency.value = 100;
              setTimeout(() => oscillator.stop(), 300);
            }, 200);
          }, 200);
          break;
      }
    } catch (e) {
      console.error('Audio error:', e);
    }
  }, [soundEnabled]);

  // Start the suspense animation
  const handlePress = useCallback(() => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Flicker effect - alternating colors
    let flickerCount = 0;
    const maxFlickers = 20;
    
    flickerIntervalRef.current = setInterval(() => {
      // Alternate between green and red
      setFlickerColor(prev => prev === 'green' ? 'red' : 'green');
      
      // Play tick sound
      if (flickerCount % 2 === 0) {
        playSound('suspense');
      }
      
      flickerCount++;
      
      // Slow down towards the end
      if (flickerCount >= maxFlickers) {
        clearInterval(flickerIntervalRef.current);
        
        // Final result - random!
        const finalResult = Math.random() < 0.5 ? 'green' : 'red';
        
        // Brief pause before reveal
        setTimeout(() => {
          setFlickerColor(null);
          setResult(finalResult);
          setIsSpinning(false);
          playSound(finalResult);
        }, 300);
      }
    }, 100 + flickerCount * 10); // Gradually slow down
    
  }, [isSpinning, playSound]);

  // Reset
  const handleReset = useCallback(() => {
    if (flickerIntervalRef.current) {
      clearInterval(flickerIntervalRef.current);
    }
    setIsSpinning(false);
    setResult(null);
    setFlickerColor(null);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (flickerIntervalRef.current) {
        clearInterval(flickerIntervalRef.current);
      }
    };
  }, []);

  // Get background color
  const getBackgroundClass = () => {
    if (flickerColor === 'green') return 'bg-green-500';
    if (flickerColor === 'red') return 'bg-red-500';
    if (result === 'green') return 'bg-gradient-to-br from-green-400 via-green-500 to-emerald-600';
    if (result === 'red') return 'bg-gradient-to-br from-red-400 via-red-500 to-rose-600';
    return 'bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500';
  };

  return (
    <ToolLayout toolName="Đèn May Mắn" toolIcon="🚦">
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        {/* Main Display Area */}
        <div 
          className={`relative w-full max-w-3xl aspect-square rounded-[3rem] shadow-2xl 
            flex flex-col items-center justify-center transition-all duration-200
            ${getBackgroundClass()}
            ${isSpinning ? 'animate-pulse' : ''}
            ${result ? 'animate-result-reveal' : ''}`}
        >
          {/* Decorative lights */}
          <div className="absolute inset-4 border-8 border-white/20 rounded-[2.5rem]" />
          <div className="absolute inset-8 border-4 border-white/10 rounded-[2rem]" />
          
          {/* Glow effect */}
          {(result || flickerColor) && (
            <div className={`absolute inset-0 rounded-[3rem] blur-3xl opacity-50
              ${flickerColor === 'green' || result === 'green' ? 'bg-green-400' : ''}
              ${flickerColor === 'red' || result === 'red' ? 'bg-red-400' : ''}`} 
            />
          )}

          {/* Content */}
          <div className="relative z-10 text-center px-8">
            {/* Initial State - Press Button */}
            {!isSpinning && !result && (
              <div className="animate-bounceIn">
                <div className="text-8xl mb-8">🎰</div>
                <button
                  onClick={handlePress}
                  className="px-16 py-8 text-4xl sm:text-5xl font-black text-purple-700 
                    bg-white rounded-full shadow-2xl
                    hover:scale-105 hover:shadow-3xl active:scale-95
                    transition-all duration-200 animate-pulse"
                >
                  NHẤN!
                </button>
                <p className="text-white/80 text-xl mt-6">
                  Bấm để thử vận may! 🍀
                </p>
              </div>
            )}

            {/* Spinning/Flickering State */}
            {isSpinning && (
              <div className="text-center">
                <div className={`text-[12rem] leading-none
                  ${flickerColor === 'green' ? 'animate-bounce' : 'animate-wiggle'}`}>
                  {flickerColor === 'green' ? '🟢' : '🔴'}
                </div>
                <p className="text-white text-3xl font-bold mt-4 animate-pulse">
                  Đang quay...
                </p>
              </div>
            )}

            {/* Green Result - THOÁT */}
            {result === 'green' && (
              <div className="animate-bounceIn">
                <div className="text-[10rem] sm:text-[14rem] leading-none mb-4 animate-bounce">
                  🟢
                </div>
                <h1 className="text-5xl sm:text-7xl font-black text-white mb-4 
                  drop-shadow-lg animate-pulse">
                  THOÁT!
                </h1>
                <p className="text-2xl sm:text-3xl text-white/90 font-bold">
                  🎉 May mắn quá! An toàn rồi! 🎉
                </p>
                
                {/* Confetti effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-4 h-4 rounded-full animate-confetti"
                      style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: ['#22c55e', '#86efac', '#4ade80', '#16a34a', '#15803d'][i % 5],
                        animationDelay: `${Math.random() * 0.5}s`,
                        animationDuration: `${1.5 + Math.random()}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Red Result - BỊ PHẠT */}
            {result === 'red' && (
              <div className="animate-bounceIn">
                <div className="text-[10rem] sm:text-[14rem] leading-none mb-4 animate-wiggle">
                  🔴
                </div>
                <h1 className="text-5xl sm:text-7xl font-black text-white mb-4 
                  drop-shadow-lg animate-shake">
                  BỊ PHẠT!
                </h1>
                <p className="text-2xl sm:text-3xl text-white/90 font-bold">
                  😱 Ôi không! Phải chịu phạt rồi! 😱
                </p>
                
                {/* Dramatic effect */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-6xl animate-ping"
                      style={{
                        left: `${10 + (i % 4) * 25}%`,
                        top: `${20 + Math.floor(i / 4) * 50}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '1s'
                      }}
                    >
                      ⚡
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-6 py-3 rounded-full font-semibold transition-all
              ${soundEnabled 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {soundEnabled ? '🔊 Âm thanh BẬT' : '🔇 Âm thanh TẮT'}
          </button>

          {/* Reset Button */}
          {result && (
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-white hover:bg-gray-100 text-gray-700 
                font-semibold rounded-full shadow-lg transition-all"
            >
              🔄 Chơi lại
            </button>
          )}

          {/* Try Again - Big button after result */}
          {result && (
            <button
              onClick={handlePress}
              className="px-10 py-4 bg-gradient-to-r from-violet-500 to-pink-500 
                hover:from-violet-600 hover:to-pink-600 text-white text-xl
                font-bold rounded-full shadow-xl hover:shadow-2xl 
                hover:scale-105 transition-all"
            >
              🎰 THỬ LẠI!
            </button>
          )}
        </div>

        {/* Instructions */}
        {!isSpinning && !result && (
          <div className="mt-8 bg-white/80 backdrop-blur rounded-2xl p-6 max-w-xl text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
              <span>💡</span> Hướng dẫn
            </h3>
            <ul className="text-gray-600 space-y-1 text-left">
              <li>• 🟢 <strong>XANH</strong> = THOÁT - Học sinh được an toàn!</li>
              <li>• 🔴 <strong>ĐỎ</strong> = BỊ PHẠT - Phải trả lời câu hỏi hoặc làm thử thách!</li>
              <li>• Bấm nút "NHẤN" để bắt đầu quay số may mắn</li>
              <li>• Kết quả hoàn toàn ngẫu nhiên 50/50</li>
              <li>• Nhấn <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-700 font-mono text-sm">Toàn màn hình</kbd> để hiển thị to hơn, <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-700 font-mono text-sm">ESC</kbd> để thoát</li>
            </ul>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti 2s ease-out forwards;
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
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        
        .animate-wiggle {
          animation: wiggle 0.15s ease-in-out infinite;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </ToolLayout>
  );
}
