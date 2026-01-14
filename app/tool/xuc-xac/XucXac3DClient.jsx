'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from '../../../components/ToolLayout/ToolLayout';
import LocalizedLink from '@/components/LocalizedLink/LocalizedLink';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useGameSettings } from '@/lib/useGameSettings';
import { GAME_IDS } from '@/lib/gameStorage';

// Default settings cho xúc xắc
const DEFAULT_SETTINGS = {
  dc: 2,      // diceCount
  col: '#ffffff', // diceColor  
  snd: 1,     // soundEnabled (1/0)
};

// Cấu hình chấm bi cho mỗi mặt xúc xắc (1-6)
const DOT_PATTERNS = {
  1: [{ x: 50, y: 50 }],
  2: [{ x: 25, y: 25 }, { x: 75, y: 75 }],
  3: [{ x: 25, y: 25 }, { x: 50, y: 50 }, { x: 75, y: 75 }],
  4: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
  5: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 50, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
  6: [{ x: 25, y: 20 }, { x: 75, y: 20 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 25, y: 80 }, { x: 75, y: 80 }],
};

// Component: Mặt xúc xắc với chấm bi
const DiceFace = ({ value, color = 'white', dotColor = 'black' }) => (
  <div 
    className="absolute w-full h-full rounded-xl flex items-center justify-center"
    style={{
      backgroundColor: color,
      boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.3), inset 0 -2px 10px rgba(0,0,0,0.2)',
      border: '2px solid rgba(0,0,0,0.1)',
    }}
  >
    {DOT_PATTERNS[value]?.map((dot, i) => (
      <div
        key={i}
        className="absolute rounded-full"
        style={{
          width: '18%',
          height: '18%',
          left: `${dot.x}%`,
          top: `${dot.y}%`,
          transform: 'translate(-50%, -50%)',
          backgroundColor: dotColor,
          boxShadow: `inset 0 2px 4px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.3)`,
        }}
      />
    ))}
  </div>
);

// Component: Xúc xắc 3D - Responsive size
const Dice3D = ({ value, isRolling, delay = 0, diceColor = '#ffffff', dotColor = '#1a1a1a', size = 180 }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  
  // Tính góc quay để hiển thị mặt tương ứng
  const getFaceRotation = (face) => {
    const rotations = {
      1: { x: 0, y: 0, z: 0 },
      2: { x: 0, y: -90, z: 0 },
      3: { x: -90, y: 0, z: 0 },
      4: { x: 90, y: 0, z: 0 },
      5: { x: 0, y: 90, z: 0 },
      6: { x: 180, y: 0, z: 0 },
    };
    return rotations[face] || rotations[1];
  };

  useEffect(() => {
    if (isRolling) {
      // Animation quay liên tục khi đang roll
      let frame = 0;
      const totalFrames = 20;
      const interval = setInterval(() => {
        frame++;
        // Quay ngẫu nhiên
        setRotation({
          x: Math.random() * 1080 - 540,
          y: Math.random() * 1080 - 540,
          z: Math.random() * 360 - 180,
        });
        
        if (frame >= totalFrames) {
          clearInterval(interval);
        }
      }, 60);
      
      return () => clearInterval(interval);
    } else if (value) {
      // Dừng ở mặt kết quả với vài vòng quay
      const finalRotation = getFaceRotation(value);
      setTimeout(() => {
        setRotation({
          x: finalRotation.x + 1080,
          y: finalRotation.y + 1080,
          z: finalRotation.z,
        });
      }, delay);
    }
  }, [isRolling, value, delay]);

  // Kích thước xúc xắc responsive
  const halfSize = size / 2;

  return (
    <div 
      className="relative"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        perspective: '800px',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Container 3D */}
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
          transition: isRolling ? 'transform 0.06s ease-out' : 'transform 0.8s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
        }}
      >
        {/* 6 mặt của xúc xắc */}
        {/* Mặt 1 - Trước */}
        <div 
          className="absolute w-full h-full"
          style={{ transform: `translateZ(${halfSize}px)` }}
        >
          <DiceFace value={1} color={diceColor} dotColor={dotColor} />
        </div>
        
        {/* Mặt 6 - Sau */}
        <div 
          className="absolute w-full h-full"
          style={{ transform: `rotateY(180deg) translateZ(${halfSize}px)` }}
        >
          <DiceFace value={6} color={diceColor} dotColor={dotColor} />
        </div>
        
        {/* Mặt 2 - Phải */}
        <div 
          className="absolute w-full h-full"
          style={{ transform: `rotateY(90deg) translateZ(${halfSize}px)` }}
        >
          <DiceFace value={2} color={diceColor} dotColor={dotColor} />
        </div>
        
        {/* Mặt 5 - Trái */}
        <div 
          className="absolute w-full h-full"
          style={{ transform: `rotateY(-90deg) translateZ(${halfSize}px)` }}
        >
          <DiceFace value={5} color={diceColor} dotColor={dotColor} />
        </div>
        
        {/* Mặt 3 - Trên */}
        <div 
          className="absolute w-full h-full"
          style={{ transform: `rotateX(90deg) translateZ(${halfSize}px)` }}
        >
          <DiceFace value={3} color={diceColor} dotColor={dotColor} />
        </div>
        
        {/* Mặt 4 - Dưới */}
        <div 
          className="absolute w-full h-full"
          style={{ transform: `rotateX(-90deg) translateZ(${halfSize}px)` }}
        >
          <DiceFace value={4} color={diceColor} dotColor={dotColor} />
        </div>
      </div>
      
      {/* Shadow */}
      <div 
        className="absolute w-full h-10 rounded-full bg-black/40 blur-lg"
        style={{
          bottom: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: isRolling ? 0.3 : 0.6,
        }}
      />
    </div>
  );
};

export default function XucXac3DClient() {
  const { t } = useI18n();
  // Load saved settings
  const { settings, updateSettings } = useGameSettings(GAME_IDS.XUC_XAC, DEFAULT_SETTINGS);
  
  const [diceCount, setDiceCount] = useState(settings.dc);
  const [results, setResults] = useState([null, null]);
  const [isRolling, setIsRolling] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(settings.snd === 1);
  const [diceColor, setDiceColor] = useState(settings.col);
  
  const audioContextRef = useRef(null);

  // Sync settings khi thay đổi
  useEffect(() => {
    updateSettings({
      dc: diceCount,
      col: diceColor,
      snd: soundEnabled ? 1 : 0,
    });
  }, [diceCount, diceColor, soundEnabled, updateSettings]);

  // Màu xúc xắc options
  const DICE_COLORS = [
    { name: 'Trắng', color: '#ffffff', dotColor: '#1a1a1a' },
    { name: 'Đỏ', color: '#ef4444', dotColor: '#ffffff' },
    { name: 'Xanh dương', color: '#3b82f6', dotColor: '#ffffff' },
    { name: 'Xanh lá', color: '#22c55e', dotColor: '#ffffff' },
    { name: 'Vàng', color: '#fbbf24', dotColor: '#1a1a1a' },
  ];

  // Tạo âm thanh xúc xắc lăn
  const playDiceSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      
      // Âm thanh lăn
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(150 + Math.random() * 100, ctx.currentTime);
          
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
          gainNode.gain.exponentialDecayTo && gainNode.gain.exponentialDecayTo(0.01, ctx.currentTime + 0.1);
          
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.05);
        }, i * 100);
      }
      
      // Âm thanh dừng
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialDecayTo && gainNode.gain.exponentialDecayTo(0.01, ctx.currentTime + 0.3);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
      }, 900);
    } catch (e) {
      // Audio not supported
    }
  }, [soundEnabled]);

  // Thảy xúc xắc
  const rollDice = useCallback(() => {
    if (isRolling) return;
    
    setIsRolling(true);
    playDiceSound();
    
    // Random kết quả
    const newResults = [];
    for (let i = 0; i < diceCount; i++) {
      newResults.push(Math.floor(Math.random() * 6) + 1);
    }
    
    // Delay hiển thị kết quả
    setTimeout(() => {
      setResults(newResults);
      setIsRolling(false);
    }, 1200);
  }, [isRolling, diceCount, playDiceSound]);

  // Tính tổng
  const total = results.filter(r => r !== null).reduce((sum, val) => sum + val, 0);

  const currentColorSet = DICE_COLORS.find(c => c.color === diceColor) || DICE_COLORS[0];

  return (
    <ToolLayout toolName={t('toolbox.tools.dice.name')} toolIcon="🎲">
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col">
        {/* Compact Header - Responsive */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 sm:px-3 py-2 bg-black/30">
          <LocalizedLink 
            href="/tool" 
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-xs sm:text-sm"
          >
            ← <span className="hidden xs:inline">Toolbox</span>
          </LocalizedLink>
          
          {/* Inline Settings - Responsive */}
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
            {/* Dice Count Toggle */}
            <div className="flex bg-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setDiceCount(1)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all ${
                  diceCount === 1 
                    ? 'bg-amber-500 text-white' 
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                🎲×1
              </button>
              <button
                onClick={() => setDiceCount(2)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all ${
                  diceCount === 2 
                    ? 'bg-amber-500 text-white' 
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                🎲×2
              </button>
            </div>
            
            {/* Color Picker - Responsive */}
            <div className="flex gap-0.5 sm:gap-1">
              {DICE_COLORS.slice(0, 5).map((c) => (
                <button
                  key={c.color}
                  onClick={() => setDiceColor(c.color)}
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg border-2 transition-all ${
                    diceColor === c.color 
                      ? 'border-amber-400 scale-110' 
                      : 'border-white/20 hover:border-white/50'
                  }`}
                  style={{ backgroundColor: c.color }}
                />
              ))}
            </div>
            
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 sm:p-2 rounded-lg transition-all ${soundEnabled ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 text-white/40'}`}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>

        {/* Main Area - Responsive */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
          {/* Dice Container - Responsive sizes */}
          <div className={`flex items-center justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-20 mb-4 sm:mb-6 ${isRolling ? 'dice-rolling' : ''}`}>
            {Array.from({ length: diceCount }).map((_, i) => (
              <div key={i} className="relative">
                {/* Responsive dice size: 100px mobile, 140px tablet, 180px desktop */}
                <div className="block sm:hidden">
                  <Dice3D 
                    value={results[i]}
                    isRolling={isRolling}
                    delay={i * 100}
                    diceColor={currentColorSet.color}
                    dotColor={currentColorSet.dotColor}
                    size={100}
                  />
                </div>
                <div className="hidden sm:block md:hidden">
                  <Dice3D 
                    value={results[i]}
                    isRolling={isRolling}
                    delay={i * 100}
                    diceColor={currentColorSet.color}
                    dotColor={currentColorSet.dotColor}
                    size={140}
                  />
                </div>
                <div className="hidden md:block">
                  <Dice3D 
                    value={results[i]}
                    isRolling={isRolling}
                    delay={i * 100}
                    diceColor={currentColorSet.color}
                    dotColor={currentColorSet.dotColor}
                    size={180}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Result Display - Responsive */}
          {results.some(r => r !== null) && !isRolling && (
            <div className="mb-4 sm:mb-6 animate-fade-in">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-8 py-3 sm:py-4 border border-white/20">
                <div className="flex items-center justify-center gap-2 sm:gap-4 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white">
                  {results.filter(r => r !== null).map((r, i) => (
                    <span key={i} className="flex items-center gap-1 sm:gap-3">
                      {i > 0 && <span className="text-white/40 text-2xl sm:text-4xl">+</span>}
                      <span className="text-amber-400 drop-shadow-lg">{r}</span>
                    </span>
                  ))}
                  {diceCount === 2 && results[0] !== null && results[1] !== null && (
                    <>
                      <span className="text-white/40 text-2xl sm:text-4xl">=</span>
                      <span className="text-emerald-400 drop-shadow-lg">{total}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Roll Button - Responsive */}
          <button
            onClick={rollDice}
            disabled={isRolling}
            className={`px-6 sm:px-10 py-3 sm:py-5 text-lg sm:text-xl md:text-2xl font-black rounded-xl sm:rounded-2xl shadow-2xl
              transition-all duration-300 flex items-center gap-2 sm:gap-3
              ${isRolling 
                ? 'bg-gray-600 cursor-not-allowed scale-95' 
                : 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:scale-105 active:scale-95'}`}
          >
            <span className={`text-2xl sm:text-3xl ${isRolling ? 'animate-bounce' : ''}`}>
              {diceCount === 1 ? '🎲' : '🎲🎲'}
            </span>
            <span className="text-white">
              {isRolling ? 'ĐANG THẢY...' : 'THẢY'}
            </span>
          </button>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
          @keyframes dice-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .dice-rolling {
            animation: dice-bounce 0.2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </ToolLayout>
  );
}
