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
  const [greenChance, setGreenChance] = useState(50);
  const [yellowChance, setYellowChance] = useState(20);
  
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
    
    flickerIntervalRef.current = setInterval(() => {
      setActiveLight(lights[flickerCount % lights.length]);
      if (flickerCount % 2 === 0) playSound('tick');
      flickerCount++;
      
      if (flickerCount >= maxFlickers) {
        clearInterval(flickerIntervalRef.current);
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
      }
    }, 100 + flickerCount * 6);
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
    if (flickerIntervalRef.current) clearInterval(flickerIntervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    exitFullscreen();
    setIsSpinning(false);
    setResult(null);
    setActiveLight(null);
    setCountdown(null);
  }, [exitFullscreen]);

  useEffect(() => {
    return () => {
      if (flickerIntervalRef.current) clearInterval(flickerIntervalRef.current);
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
    if (result === 'green') return 'from-emerald-400 via-green-500 to-teal-500';
    if (result === 'yellow') return 'from-yellow-400 via-amber-500 to-orange-500';
    if (result === 'red') return 'from-red-400 via-rose-500 to-pink-500';
    return 'from-slate-100 to-slate-200';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[70vh]">
      {/* Left Panel */}
      <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
        {/* Mode Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-4">🚦 Chế độ đèn</h3>
          <div className="space-y-2">
            <button
              onClick={() => setLightMode(2)}
              disabled={isSpinning}
              className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3
                ${lightMode === 2 ? 'bg-violet-100 border-2 border-violet-400' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'}`}
            >
              <div className="flex gap-1">
                <span className="w-4 h-4 rounded-full bg-red-500"></span>
                <span className="w-4 h-4 rounded-full bg-green-500"></span>
              </div>
              <div>
                <div className="font-semibold">2 Đèn</div>
                <div className="text-xs text-gray-500">Xanh / Đỏ</div>
              </div>
            </button>
            <button
              onClick={() => setLightMode(3)}
              disabled={isSpinning}
              className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3
                ${lightMode === 3 ? 'bg-violet-100 border-2 border-violet-400' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'}`}
            >
              <div className="flex gap-1">
                <span className="w-4 h-4 rounded-full bg-red-500"></span>
                <span className="w-4 h-4 rounded-full bg-yellow-400"></span>
                <span className="w-4 h-4 rounded-full bg-green-500"></span>
              </div>
              <div>
                <div className="font-semibold">3 Đèn</div>
                <div className="text-xs text-gray-500">Xanh / Vàng / Đỏ</div>
              </div>
            </button>
          </div>
        </div>

        {/* Probability Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-4">⚖️ Tỷ lệ</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>Xanh (An toàn)
                </span>
                <span className="text-sm font-bold text-green-600">{greenChance}%</span>
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
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>Vàng (Thử thách)
                  </span>
                  <span className="text-sm font-bold text-yellow-600">{yellowChance}%</span>
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

            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>Đỏ (Bị phạt)
                </span>
                <span className="text-sm font-bold text-red-600">{redChance}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Mẫu nhanh:</p>
            <div className="flex flex-wrap gap-2">
              {lightMode === 2 ? (
                <>
                  <button onClick={() => setGreenChance(30)} disabled={isSpinning}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${greenChance === 30 ? 'bg-violet-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    Khó (30/70)
                  </button>
                  <button onClick={() => setGreenChance(50)} disabled={isSpinning}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${greenChance === 50 ? 'bg-violet-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    Công bằng
                  </button>
                  <button onClick={() => setGreenChance(70)} disabled={isSpinning}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${greenChance === 70 ? 'bg-violet-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    Dễ (70/30)
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setGreenChance(30); setYellowChance(30); }} disabled={isSpinning}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200">30/30/40</button>
                  <button onClick={() => { setGreenChance(40); setYellowChance(30); }} disabled={isSpinning}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200">40/30/30</button>
                  <button onClick={() => { setGreenChance(50); setYellowChance(30); }} disabled={isSpinning}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200">50/30/20</button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sound Toggle */}
        <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-5 h-5 text-violet-500 rounded" />
            <span className="font-medium text-gray-700">{soundEnabled ? '🔊 Âm thanh bật' : '🔇 Âm thanh tắt'}</span>
          </label>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-violet-50 to-pink-50 rounded-xl p-4 text-sm border border-violet-100">
          <p className="font-semibold text-violet-700 mb-2">💡 Ý nghĩa đèn:</p>
          <ul className="space-y-1.5 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span><strong>Xanh</strong> - An toàn!
            </li>
            {lightMode === 3 && (
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span><strong>Vàng</strong> - Trả lời câu hỏi!
              </li>
            )}
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span><strong>Đỏ</strong> - Bị phạt!
            </li>
          </ul>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 min-w-0">
        <div className={`relative bg-gradient-to-br ${getBgClass()} rounded-3xl shadow-xl p-8 min-h-[500px] flex flex-col items-center justify-center transition-all duration-500`}>
          
          {/* Countdown */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 rounded-3xl">
              <div className="text-[12rem] font-black text-white animate-pulse">{countdown}</div>
            </div>
          )}

          {/* Lights */}
          {lightMode === 2 ? (
            <div className="flex gap-8 sm:gap-16 items-center">
              <div className="text-center">
                <div className={`relative w-36 h-36 sm:w-48 sm:h-48 rounded-full transition-all duration-300 mb-4
                  ${activeLight === 'red' || result === 'red' ? 'bg-red-500 shadow-[0_0_100px_40px_rgba(239,68,68,0.7)]' : 'bg-red-900/40 border-4 border-red-900/30'}`}>
                  <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'red' && <div className="absolute inset-0 flex items-center justify-center text-7xl animate-bounce">😱</div>}
                </div>
                <span className={`text-lg font-bold ${result === 'red' ? 'text-white' : 'text-gray-600'}`}>ĐỎ - Phạt</span>
              </div>
              <div className="text-center">
                <div className={`relative w-36 h-36 sm:w-48 sm:h-48 rounded-full transition-all duration-300 mb-4
                  ${activeLight === 'green' || result === 'green' ? 'bg-green-500 shadow-[0_0_100px_40px_rgba(34,197,94,0.7)]' : 'bg-green-900/40 border-4 border-green-900/30'}`}>
                  <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'green' && <div className="absolute inset-0 flex items-center justify-center text-7xl animate-bounce">🎉</div>}
                </div>
                <span className={`text-lg font-bold ${result === 'green' ? 'text-white' : 'text-gray-600'}`}>XANH - An toàn</span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-gray-700">
              <div className="flex flex-col gap-5 items-center">
                <div className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full transition-all duration-300
                  ${activeLight === 'red' || result === 'red' ? 'bg-red-500 shadow-[0_0_60px_20px_rgba(239,68,68,0.7)]' : 'bg-red-900/40'}`}>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'red' && <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce">😱</div>}
                </div>
                <div className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full transition-all duration-300
                  ${activeLight === 'yellow' || result === 'yellow' ? 'bg-yellow-400 shadow-[0_0_60px_20px_rgba(250,204,21,0.7)]' : 'bg-yellow-900/40'}`}>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'yellow' && <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce">🤔</div>}
                </div>
                <div className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full transition-all duration-300
                  ${activeLight === 'green' || result === 'green' ? 'bg-green-500 shadow-[0_0_60px_20px_rgba(34,197,94,0.7)]' : 'bg-green-900/40'}`}>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'green' && <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce">🎉</div>}
                </div>
              </div>
            </div>
          )}

          {/* Result Text */}
          {result && getResultText() && (
            <div className="mt-8 text-center">
              <h1 className={`text-4xl sm:text-6xl font-black text-white drop-shadow-lg mb-2 ${result === 'red' ? 'animate-shake' : ''}`}>
                {getResultText().title}
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 font-semibold">{getResultText().sub}</p>
            </div>
          )}

          {/* Confetti */}
          {result === 'green' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(40)].map((_, i) => (
                <div key={i} className="absolute w-3 h-3 rounded-full animate-confetti"
                  style={{ left: `${Math.random() * 100}%`, backgroundColor: ['#22c55e', '#86efac', '#4ade80', '#fbbf24', '#a855f7'][i % 5], animationDelay: `${Math.random() * 0.5}s` }} />
              ))}
            </div>
          )}

          {/* Main Button */}
          {!isSpinning && !result && countdown === null && (
            <button onClick={handlePress}
              className="mt-8 px-16 sm:px-24 py-6 sm:py-8 text-3xl sm:text-5xl font-black text-white bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all animate-pulse">
              🎰 BẤM!
            </button>
          )}

          {/* Action Buttons */}
          {result && (
            <div className="mt-8 flex gap-4">
              <button onClick={handleReset} className="px-6 py-3 bg-white/90 hover:bg-white text-gray-700 font-bold rounded-full shadow-lg">🔄 Reset</button>
              <button onClick={handlePress} className="px-8 py-3 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-all">🎰 Quay lại!</button>
            </div>
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
