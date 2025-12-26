'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout/ToolLayout';

// Các màu cho wheel segments - rực rỡ hơn
const SEGMENT_COLORS = [
  '#FF3366', '#00D4AA', '#FFD93D', '#6C5CE7', 
  '#A29BFE', '#FD79A8', '#00B894', '#E17055',
  '#0984E3', '#00CEC9', '#FF7675', '#74B9FF',
  '#55EFC4', '#FFEAA7', '#DFE6E9', '#81ECEC'
];

export default function ChiecNonKyDieu() {
  // States
  const [inputText, setInputText] = useState('');
  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [removeAfterSpin, setRemoveAfterSpin] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Mode: 'text' hoặc 'number'
  const [mode, setMode] = useState('text');
  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(10);
  
  const wheelRef = useRef(null);
  const spinTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const musicIntervalRef = useRef(null);

  // Tick sound ref for wheel clicking
  const tickTimeoutRef = useRef(null);
  const tickCountRef = useRef(0);
  const soundEnabledRef = useRef(soundEnabled);

  // Keep ref in sync with state for immediate toggle
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    // Stop sound immediately when disabled
    if (!soundEnabled) {
      stopMusic();
    }
  }, [soundEnabled]);

  // Play fun carnival wheel sound - cheerful and exciting!
  const playSuspenseSound = useCallback((audioCtx, progress, volume = 0.5) => {
    try {
      if (!soundEnabledRef.current) return;
      const now = audioCtx.currentTime;
      
      // Fun "tick" sound - like wheel clicking on pegs
      const tickOsc = audioCtx.createOscillator();
      const tickGain = audioCtx.createGain();
      tickOsc.type = 'triangle'; // Softer, more musical
      // Rising pitch as wheel slows - builds excitement!
      const basePitch = 400 + progress * 600; // 400Hz -> 1000Hz
      tickOsc.frequency.setValueAtTime(basePitch, now);
      tickOsc.frequency.exponentialRampToValueAtTime(basePitch * 0.7, now + 0.08);
      tickOsc.connect(tickGain);
      tickGain.connect(audioCtx.destination);
      
      // Quick punchy envelope
      tickGain.gain.setValueAtTime(volume * 0.5, now);
      tickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      tickOsc.start(now);
      tickOsc.stop(now + 0.12);
      
      // Add cheerful "bling" overtone
      const blingOsc = audioCtx.createOscillator();
      const blingGain = audioCtx.createGain();
      blingOsc.type = 'sine';
      blingOsc.frequency.value = basePitch * 2; // Octave higher - cheerful!
      blingOsc.connect(blingGain);
      blingGain.connect(audioCtx.destination);
      blingGain.gain.setValueAtTime(volume * 0.2, now);
      blingGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      blingOsc.start(now);
      blingOsc.stop(now + 0.08);
      
      // Near the end - add anticipation "shimmer"
      if (progress > 0.7) {
        const shimmerOsc = audioCtx.createOscillator();
        const shimmerGain = audioCtx.createGain();
        shimmerOsc.type = 'sine';
        shimmerOsc.frequency.value = 1500 + Math.random() * 500;
        shimmerOsc.connect(shimmerGain);
        shimmerGain.connect(audioCtx.destination);
        shimmerGain.gain.setValueAtTime(volume * 0.15, now);
        shimmerGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        shimmerOsc.start(now);
        shimmerOsc.stop(now + 0.2);
      }
    } catch (e) {}
  }, []);

  // Start spinning music - Fun carnival style!
  const startSpinMusic = useCallback((spinDuration = 8000) => {
    if (!soundEnabledRef.current) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Cheerful opening fanfare - "Let's go!"
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6 - happy major chord arpeggio
      notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(audioContext.destination);
        const startTime = audioContext.currentTime + i * 0.08;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
      
      // Wheel spin pattern - slower, more dramatic
      const totalBeats = 60; // More beats for longer spin
      let beatIndex = 0;
      tickCountRef.current = 0;
      
      const scheduleBeat = () => {
        if (!audioContextRef.current || beatIndex >= totalBeats || !soundEnabledRef.current) {
          return;
        }
        
        const progress = beatIndex / totalBeats;
        
        // Slower start, very dramatic ending
        const baseInterval = 80; // Slower ticking
        const maxInterval = 1500; // Very slow dramatic ending
        
        const easedProgress = 1 - Math.pow(1 - progress, 5); // More dramatic curve
        const interval = baseInterval + (maxInterval - baseInterval) * easedProgress;
        
        // Volume builds then sustains
        const volume = progress < 0.5 ? 0.4 + progress * 0.4 : 0.6;
        
        playSuspenseSound(audioContextRef.current, progress, Math.max(0.3, volume));
        tickCountRef.current++;
        beatIndex++;
        
        tickTimeoutRef.current = setTimeout(scheduleBeat, interval);
      };
      
      // Start ticking after fanfare
      setTimeout(scheduleBeat, 400);
      
    } catch (e) {}
  }, [playSuspenseSound]);

  // Stop music
  const stopMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
    if (tickTimeoutRef.current) {
      clearTimeout(tickTimeoutRef.current);
      tickTimeoutRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close?.();
      audioContextRef.current = null;
    }
  }, []);

  // Play win sound - Chiếc Nón Kỳ Diệu style fanfare
  const playWinSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playNote = (freq, time, dur, vol = 0.2, type = 'sine') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
        osc.start(time);
        osc.stop(time + dur);
      };
      
      const now = ctx.currentTime;
      
      // Exciting "Ta-Da!" fanfare like TV show
      // First part - ascending excitement
      playNote(523, now, 0.1, 0.25, 'square');          // C5
      playNote(659, now + 0.1, 0.1, 0.25, 'square');    // E5
      playNote(784, now + 0.2, 0.1, 0.25, 'square');    // G5
      playNote(1047, now + 0.3, 0.5, 0.3, 'sawtooth'); // C6 - hold
      
      // Sparkle sounds
      playNote(2093, now + 0.4, 0.1, 0.1);  // High sparkle
      playNote(2637, now + 0.5, 0.1, 0.1);  // Higher sparkle
      playNote(3136, now + 0.6, 0.15, 0.08); // Highest sparkle
      
      // Final triumphant chord
      playNote(523, now + 0.7, 0.6, 0.2);   // C5
      playNote(659, now + 0.7, 0.6, 0.15);  // E5  
      playNote(784, now + 0.7, 0.6, 0.15);  // G5
      playNote(1047, now + 0.7, 0.6, 0.2);  // C6
      
    } catch (e) {}
  }, [soundEnabled]);

  // Parse input text to items
  const parseInput = useCallback(() => {
    const lines = inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length > 0) {
      setItems(lines);
      setOriginalItems(lines);
      setResult(null);
      setShowResult(false);
    }
  }, [inputText]);

  // Auto-parse when input changes
  useEffect(() => {
    parseInput();
  }, [inputText, parseInput]);

  // Generate number range items
  const generateNumberItems = useCallback(() => {
    const min = Math.min(minNumber, maxNumber);
    const max = Math.max(minNumber, maxNumber);
    const count = Math.min(max - min + 1, 50); // Max 50 items
    const numbers = [];
    for (let i = min; i <= min + count - 1; i++) {
      numbers.push(i.toString());
    }
    setItems(numbers);
    setOriginalItems(numbers);
    setResult(null);
    setShowResult(false);
  }, [minNumber, maxNumber]);

  // Auto generate when mode is number and values change
  useEffect(() => {
    if (mode === 'number') {
      generateNumberItems();
    }
  }, [mode, minNumber, maxNumber, generateNumberItems]);

  // Spin the wheel with physics-based deceleration
  const spinWheel = useCallback(() => {
    if (items.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);
    setResult(null);
    
    // Spin duration - 12 seconds for maximum suspense!
    const spinDuration = 12000;
    startSpinMusic(spinDuration);

    // Copy items hiện tại để tính toán (vì items có thể thay đổi)
    const currentItems = [...items];
    const segmentAngle = 360 / currentItems.length;
    
    // Random chọn một mục sẽ trúng
    const winningIndex = Math.floor(Math.random() * currentItems.length);
    
    // Tính góc để mũi tên (ở vị trí 12h = -90 độ) chỉ vào giữa segment
    // Segment i bắt đầu ở góc: i * segmentAngle - 90
    // Giữa segment: i * segmentAngle - 90 + segmentAngle/2
    // Wheel cần quay sao cho giữa segment đó nằm ở vị trí -90 (top)
    // => cần quay: -(i * segmentAngle + segmentAngle/2)
    const targetAngleInSegment = winningIndex * segmentAngle + segmentAngle / 2;
    
    // Thêm hiệu ứng "suýt vượt qua" - offset nhỏ trong segment
    const suspenseType = Math.random();
    let offsetInSegment = 0;
    
    if (suspenseType < 0.4) {
      // 40%: Dừng gần cuối ô (như sắp vượt qua sang ô kế) - hồi hộp nhất!
      offsetInSegment = segmentAngle * (0.35 + Math.random() * 0.1); // Gần cạnh
    } else if (suspenseType < 0.7) {
      // 30%: Dừng gần đầu ô (như vừa mới vượt qua ranh giới)
      offsetInSegment = segmentAngle * (-0.35 + Math.random() * 0.1); // Gần cạnh kia
    } else {
      // 30%: Dừng random bình thường trong vùng an toàn
      offsetInSegment = segmentAngle * (-0.2 + Math.random() * 0.4);
    }
    
    // Random số vòng quay (12-18 vòng)
    const spins = 12 + Math.random() * 6;
    
    // Góc cần quay = vòng quay + góc để đúng segment
    // Wheel quay theo chiều kim đồng hồ (rotation tăng)
    // Mũi tên ở top (-90 độ)
    const targetRotation = spins * 360 + targetAngleInSegment + offsetInSegment;
    const totalRotation = rotation + targetRotation;

    setRotation(totalRotation);

    // Tính toán item được chọn sau khi quay xong
    spinTimeoutRef.current = setTimeout(() => {
      stopMusic();
      playWinSound();
      
      const winner = currentItems[winningIndex];
      setResult(winner);
      setShowResult(true);
      setIsSpinning(false);
      
      // Tự động loại khỏi danh sách nếu option được chọn
      if (removeAfterSpin) {
        setItems(prev => prev.filter(item => item !== winner));
      }
    }, spinDuration);

  }, [items, isSpinning, rotation, startSpinMusic, stopMusic, playWinSound, removeAfterSpin]);

  // Handle after result shown
  const handleKeepResult = useCallback(() => {
    // Nếu đã tự động loại rồi nhưng muốn giữ lại, thêm lại vào
    if (removeAfterSpin && result) {
      setItems(prev => [...prev, result]);
    }
    setShowResult(false);
    setResult(null);
    // Reset rotation về 0 để vòng quay mới hiển thị đúng
    setRotation(0);
  }, [removeAfterSpin, result]);

  const handleConfirmRemove = useCallback(() => {
    // Đã loại rồi, chỉ cần đóng modal
    setShowResult(false);
    setResult(null);
    // Reset rotation về 0 để vòng quay mới hiển thị đúng
    setRotation(0);
  }, []);

  // Reset everything
  const handleReset = useCallback(() => {
    setItems(originalItems);
    setResult(null);
    setShowResult(false);
    setRotation(0);
    stopMusic();
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
    }
    setIsSpinning(false);
  }, [originalItems, stopMusic]);

  // Clear all
  const handleClearAll = useCallback(() => {
    setInputText('');
    setItems([]);
    setOriginalItems([]);
    setResult(null);
    setShowResult(false);
    setRotation(0);
    setIsSpinning(false);
    stopMusic();
  }, [stopMusic]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
      stopMusic();
    };
  }, [stopMusic]);

  return (
    <ToolLayout toolName="Chiếc Nón Kỳ Diệu" toolIcon="🎡">
      {/* Main container - Mobile: column, Desktop: row */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[calc(100vh-140px)] lg:h-[calc(100vh-140px)] lg:max-h-[700px]">
        {/* Left Panel: Mobile full width, Desktop fixed width */}
        <div className="w-full lg:w-52 flex-shrink-0 space-y-2 overflow-y-auto order-2 lg:order-1">
          {/* Mode Selector - Compact */}
          <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100">
            <div className="flex gap-1">
              <button
                onClick={() => setMode('text')}
                disabled={isSpinning}
                className={`flex-1 py-2 px-2 min-h-[44px] rounded-lg font-semibold text-xs transition-all
                  ${mode === 'text' 
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Nhập danh sách tên"
              >
                📝 Tên
              </button>
              <button
                onClick={() => setMode('number')}
                disabled={isSpinning}
                className={`flex-1 py-2 px-2 min-h-[44px] rounded-lg font-semibold text-xs transition-all
                  ${mode === 'number' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Quay số ngẫu nhiên"
              >
                🔢 Số
              </button>
            </div>
          </div>

          {/* Text Input Mode - Compact */}
          {mode === 'text' && (
            <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Mỗi dòng một tên...&#10;Ví dụ:&#10;Minh&#10;Lan&#10;Hùng"
                className="w-full h-32 p-2 border-2 border-gray-200 rounded-lg text-sm
                  focus:border-violet-400 focus:ring-2 focus:ring-violet-100 
                  transition-all resize-none"
                disabled={isSpinning}
              />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">
                  {items.length > 0 ? `${items.length} mục` : ''}
                </span>
                <button
                  onClick={handleClearAll}
                  className="text-red-500 hover:text-red-600 text-xs"
                  disabled={isSpinning}
                >
                  Xóa
                </button>
              </div>
            </div>
          )}

          {/* Number Input Mode - Compact */}
          {mode === 'number' && (
            <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100">
              <div className="flex gap-2 items-center mb-2">
                <div className="flex-1">
                  <label className="text-gray-500 text-xs">Từ</label>
                  <input
                    type="number"
                    value={minNumber}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setMinNumber(isNaN(val) ? 1 : Math.max(1, val));
                    }}
                    min="1"
                    className="w-full p-1.5 border-2 border-gray-200 rounded-lg text-center text-base font-bold
                      focus:border-orange-400"
                    disabled={isSpinning}
                  />
                </div>
                <span className="text-gray-400 mt-4">~</span>
                <div className="flex-1">
                  <label className="text-gray-500 text-xs">Đến</label>
                  <input
                    type="number"
                    value={maxNumber}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setMaxNumber(isNaN(val) ? 10 : Math.max(1, val));
                    }}
                    min="1"
                    className="w-full p-1.5 border-2 border-gray-200 rounded-lg text-center text-base font-bold
                      focus:border-orange-400"
                    disabled={isSpinning}
                  />
                </div>
              </div>
              <div className="text-center text-xs text-gray-500">
                ({Math.min(Math.abs(maxNumber - minNumber) + 1, 50)} số)
              </div>
            </div>
          )}

          {/* Options - Compact */}
          <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100">
            <div className="text-xs text-gray-500 mb-1.5">Sau khi quay:</div>
            <div className="flex gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer" title="Loại khỏi danh sách sau khi quay">
                <input
                  type="radio"
                  name="afterSpin"
                  checked={removeAfterSpin}
                  onChange={() => setRemoveAfterSpin(true)}
                  className="w-3.5 h-3.5 text-violet-500"
                />
                <span className="text-gray-600">❌ Loại bỏ</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer" title="Giữ lại trong danh sách">
                <input
                  type="radio"
                  name="afterSpin"
                  checked={!removeAfterSpin}
                  onChange={() => setRemoveAfterSpin(false)}
                  className="w-3.5 h-3.5 text-violet-500"
                />
                <span className="text-gray-600">✅ Giữ lại</span>
              </label>
            </div>
          </div>

          {/* SPIN BUTTON - Hidden on mobile (shown below wheel), visible on desktop */}
          <button
            onClick={spinWheel}
            disabled={isSpinning || items.length === 0}
            className={`hidden lg:block w-full py-3 min-h-[48px] text-base font-black text-white rounded-xl
              shadow-lg transform transition-all duration-200 relative overflow-hidden
              ${isSpinning 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-500 via-pink-500 to-yellow-500 hover:from-red-600 hover:via-pink-600 hover:to-yellow-600 hover:scale-[1.02] active:scale-95'
              }`}
            style={{
              boxShadow: isSpinning ? 'none' : '0 6px 25px rgba(255, 105, 180, 0.5)'
            }}
          >
            {!isSpinning && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                -skew-x-12 animate-shimmer" />
            )}
            {isSpinning ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang quay...
              </span>
            ) : (
              <span className="relative z-10 flex items-center justify-center gap-1">
                🎯 QUAY!
              </span>
            )}
          </button>

          {/* Info and Reset */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Còn: <b className="text-violet-600">{items.length}</b></span>
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSpinning || originalItems.length === 0}
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Right Panel: Wheel - Mobile first, vừa với viewport */}
        <div className="flex-1 flex flex-col items-center justify-center relative order-1 lg:order-2 min-h-[300px] sm:min-h-[400px]">
          {/* Sound toggle - larger and more visible */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`absolute top-2 right-2 lg:top-4 lg:right-4 p-2 lg:p-3 rounded-full shadow-lg transition-all z-10 text-xl lg:text-2xl
              ${soundEnabled 
                ? 'bg-green-100 hover:bg-green-200 border-2 border-green-400' 
                : 'bg-red-100 hover:bg-red-200 border-2 border-red-400'}`}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {items.length === 0 ? (
            <div className="text-center py-10 lg:py-20">
              <div className="text-6xl lg:text-8xl mb-4 lg:mb-6 animate-bounce">🎡</div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-400 mb-2">
                {mode === 'text' ? 'Nhập danh sách để bắt đầu' : 'Thiết lập khoảng số'}
              </h3>
              <p className="text-gray-400 text-sm lg:text-base">
                {mode === 'text' ? 'Mỗi dòng là một mục trong vòng quay' : 'Nhập số từ và đến để quay'}
              </p>
            </div>
          ) : (
            <>
              {/* Wheel Container - Mobile: vừa màn hình, Desktop: vừa viewport */}
              <div className="relative" style={{
                width: 'min(520px, 80vw, calc(100vh - 350px))',
                height: 'min(520px, 80vw, calc(100vh - 350px))'
              }}>
                {/* Outer glow ring */}
                <div className={`absolute inset-[-10px] rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-yellow-500 
                  ${isSpinning ? 'animate-spin-slow opacity-60' : 'opacity-30'}`} 
                  style={{ filter: 'blur(15px)' }}
                />
                
                {/* Decorative outer ring */}
                <div className="absolute inset-[-6px] rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 p-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />
                </div>
                
                {/* Light bulbs around wheel */}
                <div className="absolute inset-[-4px] rounded-full">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-3 h-3 rounded-full ${isSpinning ? 'animate-pulse' : ''}`}
                      style={{
                        backgroundColor: i % 2 === 0 ? '#FFD700' : '#FF69B4',
                        boxShadow: `0 0 10px ${i % 2 === 0 ? '#FFD700' : '#FF69B4'}`,
                        left: `${50 + 48 * Math.cos((i * 18 - 90) * Math.PI / 180)}%`,
                        top: `${50 + 48 * Math.sin((i * 18 - 90) * Math.PI / 180)}%`,
                        transform: 'translate(-50%, -50%)',
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>

                {/* Arrow Pointer - Single clear pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
                  <div className="relative flex flex-col items-center">
                    {/* Animated glow effect */}
                    <div className="absolute top-2 w-8 h-8 bg-red-500 rounded-full animate-ping opacity-40" />
                    {/* Main arrow - red outer */}
                    <div className="w-0 h-0 border-l-[18px] border-l-transparent 
                      border-r-[18px] border-r-transparent border-t-[36px] border-t-red-600
                      filter drop-shadow-lg relative z-10" />
                    {/* Yellow inner highlight */}
                    <div className="absolute top-[3px] w-0 h-0 
                      border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent 
                      border-t-[24px] border-t-yellow-400 z-10" />
                  </div>
                </div>

                {/* Wheel - Chiếm full container */}
                <div 
                  ref={wheelRef}
                  className="absolute inset-[15px] rounded-full shadow-2xl overflow-hidden"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    // Physics-based easing: 12 seconds spin - hồi hộp!
                    transition: isSpinning 
                      ? 'transform 12s cubic-bezier(0, 0.7, 0.1, 1)' 
                      : 'none',
                    boxShadow: isSpinning 
                      ? '0 0 80px rgba(255, 105, 180, 0.7), 0 0 120px rgba(138, 43, 226, 0.4), inset 0 0 40px rgba(255,255,255,0.4)' 
                      : '0 25px 60px rgba(0,0,0,0.4), inset 0 0 30px rgba(255,255,255,0.3)'
                  }}
                >
                  {/* Segments */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {items.map((item, index) => {
                      const angle = 360 / items.length;
                      const startAngle = index * angle - 90;
                      const endAngle = startAngle + angle;
                      
                      const startRad = (startAngle * Math.PI) / 180;
                      const endRad = (endAngle * Math.PI) / 180;
                      
                      const x1 = 50 + 50 * Math.cos(startRad);
                      const y1 = 50 + 50 * Math.sin(startRad);
                      const x2 = 50 + 50 * Math.cos(endRad);
                      const y2 = 50 + 50 * Math.sin(endRad);
                      
                      const largeArcFlag = angle > 180 ? 1 : 0;
                      
                      const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                      
                      // Text position
                      const midAngle = ((startAngle + endAngle) / 2) * Math.PI / 180;
                      const textX = 50 + 32 * Math.cos(midAngle);
                      const textY = 50 + 32 * Math.sin(midAngle);
                      const textRotate = (startAngle + endAngle) / 2 + 90;

                      return (
                        <g key={index}>
                          <path
                            d={pathData}
                            fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                            stroke="white"
                            strokeWidth="0.5"
                          />
                          <text
                            x={textX}
                            y={textY}
                            fill="white"
                            fontSize={items.length > 10 ? "3" : items.length > 6 ? "4" : "5"}
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            transform={`rotate(${textRotate}, ${textX}, ${textY})`}
                            style={{ 
                              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                              fontFamily: 'sans-serif'
                            }}
                          >
                            {item.length > 8 ? item.substring(0, 8) + '...' : item}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Center Circle - More decorative */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 
                      rounded-full shadow-lg flex items-center justify-center border-4 border-white"
                      style={{ boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), inset 0 0 15px rgba(255,255,255,0.5)' }}>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center">
                        <span className="text-2xl sm:text-3xl">{isSpinning ? '🎰' : '🎯'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sparkle effects when spinning */}
                {isSpinning && (
                  <>
                    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                      {[...Array(12)].map((_, i) => (
                        <div 
                          key={i}
                          className="absolute text-2xl animate-ping"
                          style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                            animationDelay: `${i * 0.15}s`,
                            animationDuration: '0.8s'
                          }}
                        >
                          ✨
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Mobile QUAY Button - Only visible on mobile, below wheel */}
              <button
                onClick={spinWheel}
                disabled={isSpinning || items.length === 0}
                className={`lg:hidden mt-4 w-full max-w-xs py-4 min-h-[56px] text-xl font-black text-white rounded-2xl
                  shadow-lg transform transition-all duration-200 relative overflow-hidden
                  ${isSpinning 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-500 via-pink-500 to-yellow-500 hover:from-red-600 hover:via-pink-600 hover:to-yellow-600 active:scale-95'
                  }`}
                style={{
                  boxShadow: isSpinning ? 'none' : '0 6px 25px rgba(255, 105, 180, 0.5)'
                }}
              >
                {isSpinning ? '🎰 Đang quay...' : '🎯 QUAY!'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {showResult && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 max-w-md w-full text-center
            animate-bounceIn relative">
            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                />
              ))}
            </div>

            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-gray-500 mb-2">
              Chúc mừng! Kết quả là:
            </h2>
            
            <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text 
              bg-gradient-to-r from-violet-600 to-pink-600 mb-6 break-words px-4">
              {result}
            </div>

            {removeAfterSpin && (
              <p className="text-gray-400 text-sm mb-4">
                (Đã được loại khỏi danh sách)
              </p>
            )}

            <div className="flex flex-row gap-3 justify-center">
              {removeAfterSpin ? (
                <>
                  <button
                    onClick={handleConfirmRemove}
                    className="px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 
                      text-white font-semibold rounded-full hover:shadow-lg transition-all text-sm whitespace-nowrap"
                  >
                    👍 OK, quay tiếp
                  </button>
                  <button
                    onClick={handleKeepResult}
                    className="px-4 py-2.5 bg-gray-100 text-gray-600 font-semibold 
                      rounded-full hover:bg-gray-200 transition-all text-sm whitespace-nowrap"
                  >
                    ↩️ Cho quay lại
                  </button>
                </>
              ) : (
                <button
                  onClick={handleKeepResult}
                  className="px-8 py-4 bg-gradient-to-r from-violet-500 to-pink-500 
                    text-white font-bold rounded-full hover:shadow-lg transition-all text-lg"
                >
                  👍 OK, quay tiếp
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        @keyframes firework {
          0% { transform: scale(0); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        .animate-firework {
          animation: firework 1s ease-out forwards;
        }
      `}</style>
    </ToolLayout>
  );
}
