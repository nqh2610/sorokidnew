'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout, { useFullscreen } from '@/components/ToolLayout/ToolLayout';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useGameSettings } from '@/lib/useGameSettings';
import { GAME_IDS } from '@/lib/gameStorage';

// Default settings
const DEFAULT_SETTINGS = {
  lm: 2,        // lightMode
  gc: 50,       // greenChance
  yc: 33,       // yellowChance
  sp: 0,        // showProbability
  snd: 1,       // soundEnabled
};

export default function DenMayMan() {
  const { t } = useI18n();
  return (
    <ToolLayout toolName={t('toolbox.tools.luckyLight.name')} toolIcon="🚦">
      <DenMayManContent />
    </ToolLayout>
  );
}

function DenMayManContent() {
  const { exitFullscreen } = useFullscreen();
  const { t } = useI18n();
  
  // Load settings
  const { settings, updateSettings } = useGameSettings(GAME_IDS.DEN_MAY_MAN, DEFAULT_SETTINGS);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(settings.snd === 1);
  const [activeLight, setActiveLight] = useState(null);
  const [countdown, setCountdown] = useState(null);
  
  const [lightMode, setLightMode] = useState(settings.lm);
  const [greenChance, setGreenChance] = useState(settings.gc);
  const [yellowChance, setYellowChance] = useState(settings.yc);
  const [showProbability, setShowProbability] = useState(settings.sp === 1);
  
  const audioContextRef = useRef(null);
  const flickerIntervalRef = useRef(null);
  const countdownRef = useRef(null);

  // Sync settings
  useEffect(() => {
    updateSettings({
      lm: lightMode,
      gc: greenChance,
      yc: yellowChance,
      sp: showProbability ? 1 : 0,
      snd: soundEnabled ? 1 : 0,
    });
  }, [lightMode, greenChance, yellowChance, showProbability, soundEnabled, updateSettings]);

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
      case 'green': return { title: '🎉 ' + t('toolbox.luckyLight.safe') + ' 🎉', sub: t('toolbox.luckyLight.safeDesc') };
      case 'yellow': return { title: '⚡ ' + t('toolbox.luckyLight.challenge') + ' ⚡', sub: t('toolbox.luckyLight.challengeDesc') };
      case 'red': return { title: '💥 ' + t('toolbox.luckyLight.punished') + ' 💥', sub: t('toolbox.luckyLight.punishedDesc') };
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
          <h3 className="text-sm font-bold text-gray-800 mb-2">🚦 {t('toolbox.luckyLight.lightMode')}</h3>
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
              <div className="text-xs font-semibold">{t('toolbox.luckyLight.twoLights')}</div>
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
              <div className="text-xs font-semibold">{t('toolbox.luckyLight.threeLights')}</div>
            </button>
          </div>
        </div>

        {/* Sound Toggle + Instructions - Combined */}
        <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 text-violet-500 rounded" />
            <span className="text-sm font-medium text-gray-700">{soundEnabled ? '🔊' : '🔇'} {t('toolbox.luckyLight.sound')}</span>
          </label>
          <div className="text-[10px] text-gray-500 flex flex-wrap gap-x-3">
            <span>🟢 {t('toolbox.luckyLight.safeLabel')}</span>
            {lightMode === 3 && <span>🟡 {t('toolbox.luckyLight.challengeLabel')}</span>}
            <span>🔴 {t('toolbox.luckyLight.punishLabel')}</span>
          </div>
        </div>
      </div>

      {/* Right Panel - BIG lights for classroom visibility */}
      <div className="flex-1 min-w-0 order-1 lg:order-2">
        <div className={`relative bg-gradient-to-br ${getBgClass()} rounded-2xl shadow-xl p-4 sm:p-8 min-h-[400px] sm:min-h-[500px] flex flex-col items-center justify-center transition-all duration-500`}>
          
          {/* Countdown */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 rounded-2xl">
              <div className="text-[10rem] sm:text-[14rem] font-black text-white animate-pulse">{countdown}</div>
            </div>
          )}

          {/* Lights - 2 mode - EXTRA LARGE */}
          {lightMode === 2 ? (
            <div className="flex gap-12 sm:gap-24 lg:gap-32 items-center">
              <div className="text-center">
                <div className={`relative w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full transition-all duration-300 mb-2
                  ${activeLight === 'red' || result === 'red' 
                    ? 'bg-red-500 shadow-[0_0_100px_50px_rgba(239,68,68,0.8)]' 
                    : 'bg-red-800/60 border-8 border-red-600/50'}`}>
                  <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'red' && <div className="absolute inset-0 flex items-center justify-center text-6xl sm:text-7xl lg:text-8xl animate-bounce">😱</div>}
                </div>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-red-400">{t('toolbox.luckyLight.red')}</span>
              </div>
              <div className="text-center">
                <div className={`relative w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full transition-all duration-300 mb-2
                  ${activeLight === 'green' || result === 'green' 
                    ? 'bg-green-500 shadow-[0_0_100px_50px_rgba(34,197,94,0.8)]' 
                    : 'bg-green-800/60 border-8 border-green-600/50'}`}>
                  <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'green' && <div className="absolute inset-0 flex items-center justify-center text-6xl sm:text-7xl lg:text-8xl animate-bounce">🎉</div>}
                </div>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">{t('toolbox.luckyLight.green')}</span>
              </div>
            </div>
          ) : (
            /* 3 mode - horizontal - LARGE */
            <div className="flex gap-6 sm:gap-12 lg:gap-16 items-center">
              <div className="text-center">
                <div className={`relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-full transition-all duration-300 mb-2
                  ${activeLight === 'red' || result === 'red' 
                    ? 'bg-red-500 shadow-[0_0_80px_40px_rgba(239,68,68,0.8)]' 
                    : 'bg-red-800/60 border-6 border-red-600/50'}`}>
                  <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'red' && <div className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl lg:text-7xl animate-bounce">😱</div>}
                </div>
                <span className="text-base sm:text-lg lg:text-xl font-bold text-red-400">{t('toolbox.luckyLight.red')}</span>
              </div>
              <div className="text-center">
                <div className={`relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-full transition-all duration-300 mb-2
                  ${activeLight === 'yellow' || result === 'yellow' 
                    ? 'bg-yellow-400 shadow-[0_0_80px_40px_rgba(250,204,21,0.8)]' 
                    : 'bg-yellow-700/60 border-6 border-yellow-500/50'}`}>
                  <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'yellow' && <div className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl lg:text-7xl animate-bounce">🤔</div>}
                </div>
                <span className="text-base sm:text-lg lg:text-xl font-bold text-yellow-400">{t('toolbox.luckyLight.yellow')}</span>
              </div>
              <div className="text-center">
                <div className={`relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-full transition-all duration-300 mb-2
                  ${activeLight === 'green' || result === 'green' 
                    ? 'bg-green-500 shadow-[0_0_80px_40px_rgba(34,197,94,0.8)]' 
                    : 'bg-green-800/60 border-6 border-green-600/50'}`}>
                  <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  {result === 'green' && <div className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl lg:text-7xl animate-bounce">🎉</div>}
                </div>
                <span className="text-base sm:text-lg lg:text-xl font-bold text-green-400">{t('toolbox.luckyLight.green')}</span>
              </div>
            </div>
          )}

          {/* Result Text - LARGE */}
          {result && getResultText() && (
            <div className="mt-4 text-center">
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black text-white drop-shadow-lg ${result === 'red' ? 'animate-shake' : ''}`}>
                {getResultText().title}
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mt-1">{getResultText().sub}</p>
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
              🎰 {t('toolbox.luckyLight.press')}
            </button>
          )}

          {/* Action Button */}
          {result && (
            <button onClick={handleReset} className="mt-2 px-5 py-1.5 bg-white/90 hover:bg-white text-gray-700 text-sm font-bold rounded-full shadow-lg hover:scale-105 transition-all">
              🔄 {t('toolbox.luckyLight.playAgain')}
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
