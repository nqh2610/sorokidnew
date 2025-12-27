'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout, { useFullscreen } from '@/components/ToolLayout/ToolLayout';

export default function DenMayMan() {
  return (
    <ToolLayout toolName="Đèn May Mắn" toolIcon="🚦">
      <DenMayManContent />
    </ToolLayout>
  );
}

function DenMayManContent() {
  const { exitFullscreen } = useFullscreen();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeLight, setActiveLight] = useState(null);
  const [countdown, setCountdown] = useState(null);
  
  const [lightMode, setLightMode] = useState(2);
  const [greenChance, setGreenChance] = useState(50); // 2-đèn: 50/50 cân bằng
  const [yellowChance, setYellowChance] = useState(33); // 3-đèn: 34/33/33 cân bằng
  const [showProbability, setShowProbability] = useState(true); // Ẩn/hiện tỷ lệ
  
  const audioContextRef = useRef(null);
  const flickerIntervalRef = useRef(null);
  const countdownRef = useRef(null);

  const redChance = lightMode === 2 ? 100 - greenChance : 100 - greenChance - yellowChance;

  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      
      switch (type) {
        case 'countdown':
          const beep = ctx.createOscillator();
          const beepGain = ctx.createGain();
          beep.connect(beepGain);
          beepGain.connect(ctx.destination);
          beep.type = 'sine';
          beep.frequency.value = 880;
          beepGain.gain.setValueAtTime(0.3, ctx.currentTime);
          beepGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          beep.start();
          beep.stop(ctx.currentTime + 0.2);
          break;
        case 'tick':
          const tick = ctx.createOscillator();
          const tickGain = ctx.createGain();
          tick.connect(tickGain);
          tickGain.connect(ctx.destination);
          tick.type = 'square';
          tick.frequency.value = 400 + Math.random() * 300;
          tickGain.gain.setValueAtTime(0.12, ctx.currentTime);
          tickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
          tick.start();
          tick.stop(ctx.currentTime + 0.05);
          break;
        case 'green':
          [523, 659, 784, 1047].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2);
            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 0.25);
          });
          break;
        case 'yellow':
          [440, 466, 440, 466].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.15);
            osc.start(ctx.currentTime + i * 0.15);
            osc.stop(ctx.currentTime + i * 0.15 + 0.2);
          });
          break;
        case 'red':
          [200, 150, 100].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.2);
            osc.start(ctx.currentTime + i * 0.15);
            osc.stop(ctx.currentTime + i * 0.15 + 0.25);
          });
          break;
      }
    } catch (e) {
      console.error('Audio error:', e);
    }
  }, [soundEnabled]);

  const startSpin = useCallback(() => {
    setIsSpinning(true);
    setResult(null);
    
    let flickerCount = 0;
    const maxFlickers = 20;
    const lights = lightMode === 2 ? ['red', 'green'] : ['red', 'yellow', 'green'];
    
    const doFlicker = () => {
      setActiveLight(lights[flickerCount % lights.length]);
      if (flickerCount % 2 === 0) playSound('tick');
      flickerCount++;
      
      if (flickerCount >= maxFlickers) {
        const random = Math.random() * 100;
        let finalResult;
        
        if (lightMode === 2) {
          finalResult = random < greenChance ? 'green' : 'red';
        } else {
          if (random < greenChance) finalResult = 'green';
          else if (random < greenChance + yellowChance) finalResult = 'yellow';
          else finalResult = 'red';
        }
        
        setActiveLight(null);
        setTimeout(() => {
          setActiveLight(finalResult);
          setResult(finalResult);
          setIsSpinning(false);
          playSound(finalResult);
        }, 300);
      } else {
        // Speed slows down as we get closer to the end
        const delay = 80 + flickerCount * 15;
        flickerIntervalRef.current = setTimeout(doFlicker, delay);
      }
    };
    
    doFlicker();
  }, [lightMode, greenChance, yellowChance, playSound]);

  const handlePress = useCallback(() => {
    if (isSpinning || countdown !== null) return;
    setCountdown(3);
    playSound('countdown');
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          startSpin();
          return null;
        }
        playSound('countdown');
        return prev - 1;
      });
    }, 700);
  }, [isSpinning, countdown, playSound, startSpin]);

  const handleReset = useCallback(() => {
    if (flickerIntervalRef.current) clearTimeout(flickerIntervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    exitFullscreen();
    setIsSpinning(false);
    setResult(null);
    setActiveLight(null);
    setCountdown(null);
  }, [exitFullscreen]);

  useEffect(() => {
    return () => {
      if (flickerIntervalRef.current) clearTimeout(flickerIntervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const getResultText = () => {
    switch (result) {
      case 'green': return { title: '🎉 AN TOÀN! 🎉', sub: 'May mắn rồi! Thoát phạt!' };
      case 'yellow': return { title: '⚡ THỬ THÁCH! ⚡', sub: 'Trả lời câu hỏi để thoát!' };
      case 'red': return { title: '💥 BỊ PHẠT! 💥', sub: 'Ôi không! Phải chịu phạt rồi!' };
      default: return null;
    }
  };

  const getBgClass = () => {
    return 'from-indigo-600 via-purple-700 to-violet-800';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
      {/* Left Panel - Compact settings */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-2 order-2 lg:order-1">
        {/* Mode Selection - Compact */}
        <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-2">🚦 Chế độ đèn</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setLightMode(2)}
              disabled={isSpinning}
              className={`flex-1 p-2 rounded-lg text-center transition-all
                ${lightMode === 2 ? 'bg-violet-100 border-2 border-violet-400' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'}`}
            >
              <div className="flex gap-1 justify-center mb-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </div>
              <div className="text-xs font-semibold">2 Đèn</div>
            </button>
            <button
              onClick={() => setLightMode(3)}
              disabled={isSpinning}
              className={`flex-1 p-2 rounded-lg text-center transition-all
                ${lightMode === 3 ? 'bg-violet-100 border-2 border-violet-400' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'}`}
            >
              <div className="flex gap-1 justify-center mb-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </div>
              <div className="text-xs font-semibold">3 Đèn</div>
            </button>
          </div>
        </div>

        {/* Probability Settings - Collapsible */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowProbability(!showProbability)}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
              ⚖️ Tỷ lệ
              {!showProbability && (
                <span className="text-xs font-normal text-gray-400">(Đang ẩn)</span>
              )}
            </span>
            <span className={`text-gray-400 transition-transform ${showProbability ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {showProbability && (
            <div className="px-3 pb-3 space-y-3 border-t border-gray-100 pt-2">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>Xanh
                </span>
                <span className="text-xs font-bold text-green-600">{greenChance}%</span>
              </div>
              <input
                type="range" min="10" max={lightMode === 2 ? 90 : 80} step="10"
                value={greenChance}
                onChange={(e) => setGreenChance(parseInt(e.target.value))}
                disabled={isSpinning}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {lightMode === 3 && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>Vàng
                  </span>
                  <span className="text-xs font-bold text-yellow-600">{yellowChance}%</span>
                </div>
                <input
                  type="range" min="10" max={90 - greenChance} step="10"
                  value={yellowChance}
                  onChange={(e) => setYellowChance(parseInt(e.target.value))}
                  disabled={isSpinning}
                  className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            <div className="flex justify-between text-xs pt-1 border-t border-gray-100">
              <span className="font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>Đỏ
              </span>
              <span className="font-bold text-red-600">{redChance}%</span>
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {lightMode === 2 ? (
                <>
                  <button onClick={() => setGreenChance(30)} disabled={isSpinning}
                    className={`px-2 py-1 rounded text-[10px] font-medium ${greenChance === 30 ? 'bg-violet-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    Khó
                  </button>
                  <button onClick={() => setGreenChance(50)} disabled={isSpinning}
                    className={`px-2 py-1 rounded text-[10px] font-medium ${greenChance === 50 ? 'bg-violet-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    50/50
                  </button>
                  <button onClick={() => setGreenChance(70)} disabled={isSpinning}
                    className={`px-2 py-1 rounded text-[10px] font-medium ${greenChance === 70 ? 'bg-violet-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    Dễ
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setGreenChance(34); setYellowChance(33); }} disabled={isSpinning}
                    className={`px-2 py-1 rounded text-[10px] font-medium ${greenChance === 34 && yellowChance === 33 ? 'bg-violet-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Cân bằng</button>
                  <button onClick={() => { setGreenChance(50); setYellowChance(30); }} disabled={isSpinning}
                    className={`px-2 py-1 rounded text-[10px] font-medium ${greenChance === 50 && yellowChance === 30 ? 'bg-violet-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Dễ hơn</button>
                  <button onClick={() => { setGreenChance(20); setYellowChance(30); }} disabled={isSpinning}
                    className={`px-2 py-1 rounded text-[10px] font-medium ${greenChance === 20 && yellowChance === 30 ? 'bg-violet-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Khó hơn</button>
                </>
              )}
            </div>
            </div>
          )}
        </div>

        {/* Sound Toggle + Instructions - Combined */}
        <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 text-violet-500 rounded" />
            <span className="text-sm font-medium text-gray-700">{soundEnabled ? '🔊 Bật' : '🔇 Tắt'}</span>
          </label>
          <div className="text-[10px] text-gray-500 flex flex-wrap gap-x-3">
            <span>🟢 An toàn</span>
            {lightMode === 3 && <span>🟡 Thử thách</span>}
            <span>🔴 Phạt</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Compact lights */}
      <div className="flex-1 min-w-0 order-1 lg:order-2">
        <div className={`relative bg-gradient-to-br ${getBgClass()} rounded-2xl shadow-xl p-3 sm:p-4 min-h-[240px] flex flex-col items-center justify-center transition-all duration-500`}>
          
          {/* Countdown */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 rounded-2xl">
              <div className="text-[7rem] sm:text-[9rem] font-black text-white animate-pulse">{countdown}</div>
            </div>
          )}

          {/* Lights - 2 mode */}
          {lightMode === 2 ? (
            <div className="flex gap-8 sm:gap-16 items-center">
              <div className="text-center">
                <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full transition-all duration-300 mb-1
                  ${activeLight === 'red' || result === 'red' 
                    ? 'bg-red-500 shadow-[0_0_60px_25px_rgba(239,68,68,0.8)]' 
                    : 'bg-red-800/60 border-4 border-red-600/50'}`}>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'red' && <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl animate-bounce">😱</div>}
                </div>
                <span className="text-sm font-bold text-red-400">Đỏ</span>
              </div>
              <div className="text-center">
                <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full transition-all duration-300 mb-1
                  ${activeLight === 'green' || result === 'green' 
                    ? 'bg-green-500 shadow-[0_0_60px_25px_rgba(34,197,94,0.8)]' 
                    : 'bg-green-800/60 border-4 border-green-600/50'}`}>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'green' && <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl animate-bounce">🎉</div>}
                </div>
                <span className="text-sm font-bold text-green-400">Xanh</span>
              </div>
            </div>
          ) : (
            /* 3 mode - horizontal */
            <div className="flex gap-4 sm:gap-8 items-center">
              <div className="text-center">
                <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 mb-1
                  ${activeLight === 'red' || result === 'red' 
                    ? 'bg-red-500 shadow-[0_0_50px_20px_rgba(239,68,68,0.8)]' 
                    : 'bg-red-800/60 border-4 border-red-600/50'}`}>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'red' && <div className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl animate-bounce">😱</div>}
                </div>
                <span className="text-xs font-bold text-red-400">Đỏ</span>
              </div>
              <div className="text-center">
                <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 mb-1
                  ${activeLight === 'yellow' || result === 'yellow' 
                    ? 'bg-yellow-400 shadow-[0_0_50px_20px_rgba(250,204,21,0.8)]' 
                    : 'bg-yellow-700/60 border-4 border-yellow-500/50'}`}>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'yellow' && <div className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl animate-bounce">🤔</div>}
                </div>
                <span className="text-xs font-bold text-yellow-400">Vàng</span>
              </div>
              <div className="text-center">
                <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 mb-1
                  ${activeLight === 'green' || result === 'green' 
                    ? 'bg-green-500 shadow-[0_0_50px_20px_rgba(34,197,94,0.8)]' 
                    : 'bg-green-800/60 border-4 border-green-600/50'}`}>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'green' && <div className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl animate-bounce">🎉</div>}
                </div>
                <span className="text-xs font-bold text-green-400">Xanh</span>
              </div>
            </div>
          )}

          {/* Result Text - Compact */}
          {result && getResultText() && (
            <div className="mt-2 text-center">
              <h1 className={`text-2xl sm:text-4xl font-black text-white drop-shadow-lg ${result === 'red' ? 'animate-shake' : ''}`}>
                {getResultText().title}
              </h1>
              <p className="text-sm sm:text-base text-white/90">{getResultText().sub}</p>
            </div>
          )}

          {/* Confetti */}
          {result === 'green' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {[...Array(25)].map((_, i) => (
                <div key={i} className="absolute w-2 h-2 rounded-full animate-confetti"
                  style={{ left: `${Math.random() * 100}%`, backgroundColor: ['#22c55e', '#86efac', '#4ade80', '#fbbf24', '#a855f7'][i % 5], animationDelay: `${Math.random() * 0.5}s` }} />
              ))}
            </div>
          )}

          {/* Main Button - Compact */}
          {!isSpinning && !result && countdown === null && (
            <button onClick={handlePress}
              className="mt-3 px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-2xl font-black text-white bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all animate-pulse">
              🎰 BẤM!
            </button>
          )}

          {/* Action Button */}
          {result && (
            <button onClick={handleReset} className="mt-2 px-5 py-1.5 bg-white/90 hover:bg-white text-gray-700 text-sm font-bold rounded-full shadow-lg hover:scale-105 transition-all">
              🔄 Chơi lại
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti 2.5s ease-out forwards; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
