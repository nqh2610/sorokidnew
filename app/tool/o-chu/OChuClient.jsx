'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout/ToolLayout';
import { LogoIcon } from '@/components/Logo/Logo';

// Màu sắc vui nhộn cho các hàng
const ROW_COLORS = [
  { bg: 'bg-rose-500', light: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-300' },
  { bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-300' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-300' },
  { bg: 'bg-cyan-500', light: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-300' },
  { bg: 'bg-violet-500', light: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-300' },
  { bg: 'bg-pink-500', light: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-300' },
  { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-300' },
  { bg: 'bg-teal-500', light: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-300' },
  { bg: 'bg-indigo-500', light: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-300' },
  { bg: 'bg-lime-600', light: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-300' },
];

export default function OChuGame() {
  // === STATES ===
  const [phase, setPhase] = useState('setup'); // 'setup' | 'play'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cellSize, setCellSize] = useState(48); // Dynamic cell size
  const gameContainerRef = useRef(null);
  
  // Setup inputs
  const [topic, setTopic] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [questionsInput, setQuestionsInput] = useState('');
  const [setupError, setSetupError] = useState('');
  
  // Game states
  const [questions, setQuestions] = useState([]);
  const [grid, setGrid] = useState([]);
  const [keywordCol, setKeywordCol] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [revealedRows, setRevealedRows] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Đoán từ khóa
  const [keywordGuess, setKeywordGuess] = useState('');
  const [guessResult, setGuessResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [revealingRow, setRevealingRow] = useState(-1);
  
  // Input đáp án cho từng hàng
  const [rowAnswerInput, setRowAnswerInput] = useState('');
  const [rowAnswerResult, setRowAnswerResult] = useState(null); // 'correct' | 'wrong' | null
  const rowAnswerInputRef = useRef(null);
  
  // Long press for mobile
  const longPressTimerRef = useRef(null);
  const [longPressRow, setLongPressRow] = useState(-1);

  // AI Prompt modal
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  // Result popup for projector visibility
  const [resultPopup, setResultPopup] = useState(null); // { type: 'correct'|'wrong', message: string, answer?: string }

  const audioContextRef = useRef(null);
  const keywordInputRef = useRef(null);

  // === FULLSCREEN FUNCTIONS ===
  const enterFullscreen = useCallback(async () => {
    try {
      const elem = gameContainerRef.current;
      if (!elem) return;
      
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
    } catch (e) {
      // Fullscreen not supported
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch (e) {}
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // === CALCULATE CELL SIZE based on viewport and grid ===
  const calculateCellSize = useCallback(() => {
    if (phase !== 'play' || !grid.length) return;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Find max row length
    const maxRowLength = Math.max(...grid.map(row => row.length));
    const numRows = grid.length;
    
    // For 2-column layout on large screens, grid takes ~60% of width
    const isLargeScreen = viewportWidth >= 1024;
    const rightPanelWidth = isLargeScreen ? 320 : 0; // Right panel width on lg+
    const horizontalPadding = 48; // padding
    const verticalPadding = isFullscreen ? 80 : 140; // top bar only, rest is flexible
    
    // Available width for grid
    const availableWidth = viewportWidth - rightPanelWidth - horizontalPadding;
    const availableHeight = viewportHeight - verticalPadding;
    
    // Calculate max cell size that fits both dimensions
    // +1 for the number button column
    const cellGap = 4;
    const maxCellWidth = (availableWidth - (maxRowLength + 1) * cellGap) / (maxRowLength + 1);
    const maxCellHeight = (availableHeight - numRows * cellGap) / numRows;
    
    // Use the smaller one to ensure it fits, with min/max bounds
    const calculatedSize = Math.min(maxCellWidth, maxCellHeight);
    const finalSize = Math.max(28, Math.min(70, Math.floor(calculatedSize)));
    
    setCellSize(finalSize);
  }, [phase, grid, isFullscreen]);

  // Recalculate on resize or fullscreen change
  useEffect(() => {
    calculateCellSize();
    
    const handleResize = () => calculateCellSize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateCellSize]);

  // === AUDIO ===
  // Cleanup AudioContext when unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close?.();
        audioContextRef.current = null;
      }
    };
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      if (type === 'correct') {
        // 🎮 MARIO COIN + POWER-UP COMBO! (LOUD & PROUD!)
        // Coin "ding" - iconic two-tone - LOUDER
        const coinFreqs = [988, 1319]; // B5, E6
        coinFreqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          const t = now + i * 0.08;
          gain.gain.setValueAtTime(0.35, t); // Louder!
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
          osc.start(t);
          osc.stop(t + 0.3);
        });
        // Power-up sweep - STRONGER
        const sweep = ctx.createOscillator();
        const sweepGain = ctx.createGain();
        sweep.type = 'square';
        sweep.frequency.setValueAtTime(200, now + 0.15);
        sweep.frequency.exponentialRampToValueAtTime(1500, now + 0.5);
        sweep.connect(sweepGain);
        sweepGain.connect(ctx.destination);
        sweepGain.gain.setValueAtTime(0.25, now + 0.15); // Louder!
        sweepGain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        sweep.start(now + 0.15);
        sweep.stop(now + 0.6);
        // Triumphant chord burst
        [523, 659, 784, 1047].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(0.15, now + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
          osc.start(now + 0.4);
          osc.stop(now + 0.75);
        });
        // Sparkle chimes cascade - MORE sparkles!
        [2093, 2349, 2637, 3136, 3520].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          const t = now + 0.5 + i * 0.06;
          gain.gain.setValueAtTime(0.18, t); // Louder sparkles!
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
          osc.start(t);
          osc.stop(t + 0.25);
        });

      } else if (type === 'wrong') {
        // 🎮 BUZZER + WOBBLE - Clear but not harsh!
        // Buzzer sound - distinctive
        const buzzer = ctx.createOscillator();
        const buzzerGain = ctx.createGain();
        buzzer.type = 'sawtooth';
        buzzer.frequency.setValueAtTime(150, now);
        buzzer.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        buzzer.connect(buzzerGain);
        buzzerGain.connect(ctx.destination);
        buzzerGain.gain.setValueAtTime(0.4, now); // LOUD buzzer!
        buzzerGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        buzzer.start(now);
        buzzer.stop(now + 0.3);
        // Second buzzer tone
        const buzzer2 = ctx.createOscillator();
        const buzzer2Gain = ctx.createGain();
        buzzer2.type = 'square';
        buzzer2.frequency.value = 100;
        buzzer2.connect(buzzer2Gain);
        buzzer2Gain.connect(ctx.destination);
        buzzer2Gain.gain.setValueAtTime(0.25, now);
        buzzer2Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        buzzer2.start(now);
        buzzer2.stop(now + 0.25);
        // Wobbly spring sound - funnier
        const wobble = ctx.createOscillator();
        const wobbleGain = ctx.createGain();
        wobble.type = 'sine';
        wobble.frequency.setValueAtTime(400, now + 0.15);
        wobble.frequency.setValueAtTime(300, now + 0.2);
        wobble.frequency.setValueAtTime(350, now + 0.25);
        wobble.frequency.setValueAtTime(250, now + 0.3);
        wobble.frequency.setValueAtTime(200, now + 0.35);
        wobble.connect(wobbleGain);
        wobbleGain.connect(ctx.destination);
        wobbleGain.gain.setValueAtTime(0.25, now + 0.15); // Louder wobble
        wobbleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        wobble.start(now + 0.15);
        wobble.stop(now + 0.5);

      } else if (type === 'reveal') {
        // 🎮 LEVEL UP / UNLOCK TREASURE!
        // Rising anticipation
        for (let i = 0; i < 6; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.value = 150 + i * 80;
          osc.connect(gain);
          gain.connect(ctx.destination);
          const t = now + i * 0.05;
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
          osc.start(t);
          osc.stop(t + 0.08);
        }
        // Big reveal chord - triumphant!
        const chordFreqs = [523, 659, 784, 1047]; // C major
        chordFreqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          const t = now + 0.3;
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
          osc.start(t);
          osc.stop(t + 0.5);
        });
        // Magic sparkle cascade
        [1760, 2093, 2349, 2637, 3136].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          const t = now + 0.5 + i * 0.08;
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
          osc.start(t);
          osc.stop(t + 0.25);
        });

      } else if (type === 'victory') {
        // 🎮 EPIC 8-BIT VICTORY FANFARE!
        // Drum intro
        for (let i = 0; i < 8; i++) {
          const drum = ctx.createOscillator();
          const drumGain = ctx.createGain();
          drum.type = 'triangle';
          drum.frequency.setValueAtTime(100 + i * 20, now + i * 0.04);
          drum.frequency.exponentialRampToValueAtTime(60, now + i * 0.04 + 0.05);
          drum.connect(drumGain);
          drumGain.connect(ctx.destination);
          drumGain.gain.setValueAtTime(0.15, now + i * 0.04);
          drumGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.04 + 0.06);
          drum.start(now + i * 0.04);
          drum.stop(now + i * 0.04 + 0.08);
        }
        // Main melody - classic victory tune (like Zelda item get)
        const melody = [
          { freq: 784, time: 0.35, dur: 0.1 },   // G5
          { freq: 784, time: 0.48, dur: 0.1 },   // G5
          { freq: 784, time: 0.61, dur: 0.1 },   // G5
          { freq: 622, time: 0.74, dur: 0.15 },  // Eb5
          { freq: 698, time: 0.92, dur: 0.1 },   // F5
          { freq: 784, time: 1.05, dur: 0.15 },  // G5
          { freq: 698, time: 1.23, dur: 0.1 },   // F5
          { freq: 784, time: 1.38, dur: 0.4 },   // G5 (hold)
        ];
        melody.forEach(({ freq, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(0.18, now + time);
          gain.gain.exponentialRampToValueAtTime(0.01, now + time + dur);
          osc.start(now + time);
          osc.stop(now + time + dur + 0.05);
        });
        // Harmony layer
        const harmony = [
          { freq: 523, time: 0.35, dur: 0.3 },   // C5
          { freq: 466, time: 0.74, dur: 0.25 },  // Bb4
          { freq: 523, time: 1.05, dur: 0.3 },   // C5
          { freq: 523, time: 1.38, dur: 0.4 },   // C5
        ];
        harmony.forEach(({ freq, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(0.1, now + time);
          gain.gain.exponentialRampToValueAtTime(0.01, now + time + dur);
          osc.start(now + time);
          osc.stop(now + time + dur + 0.05);
        });
        // Bass hits
        [130, 155, 130, 165].forEach((freq, i) => {
          const bass = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bass.type = 'triangle';
          bass.frequency.value = freq;
          bass.connect(bassGain);
          bassGain.connect(ctx.destination);
          const t = now + 0.35 + i * 0.35;
          bassGain.gain.setValueAtTime(0.2, t);
          bassGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
          bass.start(t);
          bass.stop(t + 0.3);
        });
        // Final sparkle explosion
        [2093, 2349, 2637, 3136, 3520].forEach((freq, i) => {
          const spark = ctx.createOscillator();
          const sparkGain = ctx.createGain();
          spark.type = 'sine';
          spark.frequency.value = freq;
          spark.connect(sparkGain);
          sparkGain.connect(ctx.destination);
          const t = now + 1.7 + i * 0.05;
          sparkGain.gain.setValueAtTime(0.08, t);
          sparkGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
          spark.start(t);
          spark.stop(t + 0.35);
        });

      } else if (type === 'click') {
        // 🎮 RETRO BUTTON PRESS
        // Quick blip
        const blip = ctx.createOscillator();
        const blipGain = ctx.createGain();
        blip.type = 'square';
        blip.frequency.setValueAtTime(800, now);
        blip.frequency.exponentialRampToValueAtTime(600, now + 0.03);
        blip.connect(blipGain);
        blipGain.connect(ctx.destination);
        blipGain.gain.setValueAtTime(0.08, now);
        blipGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        blip.start(now);
        blip.stop(now + 0.06);
        // Subtle confirm tone
        const confirm = ctx.createOscillator();
        const confirmGain = ctx.createGain();
        confirm.type = 'sine';
        confirm.frequency.value = 1200;
        confirm.connect(confirmGain);
        confirmGain.connect(ctx.destination);
        confirmGain.gain.setValueAtTime(0.05, now + 0.02);
        confirmGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        confirm.start(now + 0.02);
        confirm.stop(now + 0.1);
      }
    } catch (e) {}
  }, [soundEnabled, getAudioContext]);

  // === PARSE & GENERATE GRID ===
  
  // Smart fix common input errors
  const smartFixLine = useCallback((line) => {
    let fixed = line.trim();
    if (!fixed) return '';
    
    // Replace tab with |
    fixed = fixed.replace(/\t+/g, '|');
    
    // Replace ; with | 
    fixed = fixed.replace(/\s*;\s*/g, '|');
    
    // Smart: Add | after ? if missing (question followed by answer)
    // "Câu hỏi? đáp án" → "Câu hỏi?|đáp án"
    if (!fixed.includes('?|') && !fixed.includes('?:') && fixed.includes('?')) {
      fixed = fixed.replace(/\?\s+(?![|:])/g, '?|');
    }
    
    // Replace multiple spaces (3+) with | (likely intended delimiter)
    fixed = fixed.replace(/\s{3,}/g, '|');
    
    // Fix double delimiters
    fixed = fixed.replace(/[|:][|:]+/g, '|');
    
    // Remove leading/trailing delimiters
    fixed = fixed.replace(/^[|:]+|[|:]+$/g, '');
    
    // Normalize spaces around delimiters
    fixed = fixed.replace(/\s*[|:]\s*/g, '|');
    
    return fixed;
  }, []);
  
  // Parse questions input with smart detection
  const parseQuestions = useCallback((text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const result = { parsed: [], errors: [] };
    
    for (let i = 0; i < lines.length; i++) {
      const originalLine = lines[i];
      const fixedLine = smartFixLine(originalLine);
      
      if (!fixedLine) continue;
      
      // Try to split by | or :
      let question = '', answer = '';
      const separators = ['|', ':'];
      
      for (const sep of separators) {
        if (fixedLine.includes(sep)) {
          const parts = fixedLine.split(sep);
          question = parts[0].trim();
          answer = parts.slice(1).join(sep).trim().toUpperCase()
            .replace(/[^A-Z0-9 ]/g, '')
            .replace(/\s+/g, '');
          break;
        }
      }
      
      // If no separator found, try to extract answer from end
      // Pattern: "Câu hỏi ĐÁPÁN" - last word might be answer
      if (!question && !answer && fixedLine.length > 0) {
        const words = fixedLine.split(/\s+/);
        if (words.length >= 2) {
          const lastWord = words[words.length - 1].toUpperCase().replace(/[^A-Z0-9]/g, '');
          // If last word looks like an answer (all caps, no special chars)
          if (lastWord.length >= 1 && lastWord.length <= 20) {
            question = words.slice(0, -1).join(' ');
            answer = lastWord;
            result.parsed.push({ 
              question, 
              answer, 
              lineNum: i + 1,
              autoFixed: true 
            });
            continue;
          }
        }
        result.errors.push({ 
          line: i + 1, 
          text: originalLine.substring(0, 40), 
          reason: 'Không tìm thấy dấu phân cách (| hoặc :)' 
        });
        continue;
      }
      
      if (question && answer && answer.length >= 1) {
        result.parsed.push({ 
          question, 
          answer, 
          lineNum: i + 1,
          autoFixed: fixedLine !== originalLine.trim()
        });
      } else if (question && !answer) {
        result.errors.push({ 
          line: i + 1, 
          text: originalLine.substring(0, 40), 
          reason: 'Thiếu đáp án sau dấu phân cách' 
        });
      } else if (!question && answer) {
        result.errors.push({ 
          line: i + 1, 
          text: originalLine.substring(0, 40), 
          reason: 'Thiếu câu hỏi trước dấu phân cách' 
        });
      }
    }
    
    return result;
  }, [smartFixLine]);
  
  // Wrapper for backward compatibility - returns just the parsed array
  const getValidQuestions = useCallback((text) => {
    return parseQuestions(text).parsed;
  }, [parseQuestions]);

  // Generate grid với từ khóa hàng dọc cho trước
  const generateGridWithKeyword = useCallback((keywordStr, questionsData) => {
    const kw = keywordStr.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (kw.length !== questionsData.length) {
      return { error: `Từ khóa có ${kw.length} chữ nhưng có ${questionsData.length} câu hỏi. Số chữ trong từ khóa phải bằng số câu hỏi!` };
    }
    
    // Kiểm tra mỗi đáp án có chứa chữ tương ứng trong keyword không
    const errors = [];
    const keyPositions = [];
    
    questionsData.forEach((q, i) => {
      const targetChar = kw[i];
      const pos = q.answer.indexOf(targetChar);
      if (pos === -1) {
        errors.push(`Câu ${i + 1}: Đáp án "${q.answer}" không chứa chữ "${targetChar}"`);
      } else {
        keyPositions.push(pos);
      }
    });
    
    if (errors.length > 0) {
      return { error: errors.join('\n') };
    }
    
    // Tìm cột keyword tối ưu
    const maxKeyPos = Math.max(...keyPositions);
    const kwCol = maxKeyPos;
    const maxLen = Math.max(...questionsData.map(q => q.answer.length));
    const totalCols = Math.max(maxLen + 2, kwCol + Math.max(...questionsData.map((q, i) => q.answer.length - keyPositions[i])) + 1);
    
    const gridData = [];
    
    questionsData.forEach((q, rowIndex) => {
      const answer = q.answer;
      const keyPosInAnswer = keyPositions[rowIndex];
      const offset = kwCol - keyPosInAnswer;
      
      const row = [];
      for (let col = 0; col < totalCols; col++) {
        const answerIndex = col - offset;
        if (answerIndex >= 0 && answerIndex < answer.length) {
          row.push({
            char: answer[answerIndex],
            isKeyword: col === kwCol,
            revealed: false,
            empty: false
          });
        } else {
          row.push({ char: '', isKeyword: false, revealed: false, empty: true });
        }
      }
      gridData.push(row);
    });
    
    return { grid: gridData, keyword: kw, keywordCol: kwCol };
  }, []);

  // Close question when clicking outside
  const handleCloseQuestion = useCallback(() => {
    if (currentQuestion >= 0) {
      setCurrentQuestion(-1);
      setRowAnswerInput('');
      setRowAnswerResult(null);
    }
  }, [currentQuestion]);

  // === GAME ACTIONS ===
  const handleStartGame = useCallback(() => {
    setSetupError('');

    // Validate keyword question (topic)
    if (!topic.trim()) {
      setSetupError('⚠️ Vui lòng nhập câu hỏi về từ khóa!');
      return;
    }

    // Validate keyword
    const kw = keywordInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!kw) {
      setSetupError('⚠️ Vui lòng nhập từ khóa hàng dọc!');
      return;
    }
    
    // Parse questions
    const { parsed, errors } = parseQuestions(questionsInput);
    if (parsed.length < 2) {
      if (errors.length > 0) {
        setSetupError(`⚠️ Lỗi dòng ${errors[0].line}: ${errors[0].reason}`);
      } else {
        setSetupError('⚠️ Cần ít nhất 2 câu hỏi!');
      }
      return;
    }
    
    // Generate grid
    const result = generateGridWithKeyword(kw, parsed);
    if (result.error) {
      setSetupError('⚠️ ' + result.error);
      return;
    }
    
    setQuestions(parsed);
    setGrid(result.grid);
    setKeyword(result.keyword);
    setKeywordCol(result.keywordCol);
    setCurrentQuestion(-1);
    setRevealedRows([]);
    setGameComplete(false);
    setKeywordGuess('');
    setGuessResult(null);
    setShowConfetti(false);
    setPhase('play');
    
    // Auto enter fullscreen after a short delay
    setTimeout(() => {
      enterFullscreen();
    }, 100);
  }, [topic, keywordInput, questionsInput, parseQuestions, generateGridWithKeyword, enterFullscreen]);

  const handleOpenQuestion = useCallback((index) => {
    // Khi đã đoán đúng từ khóa, vẫn cho phép mở câu hỏi
    // Toggle: nếu đang mở thì đóng, đang đóng thì mở
    if (currentQuestion === index) {
      setCurrentQuestion(-1);
      setRowAnswerInput('');
      setRowAnswerResult(null);
    } else {
      setCurrentQuestion(index);
      setRowAnswerInput('');
      setRowAnswerResult(null);
      playSound('click');
      // Focus vào input sau khi mở
      setTimeout(() => rowAnswerInputRef.current?.focus(), 100);
    }
  }, [currentQuestion, playSound]);

  // Reveal một hàng khi nhập đúng đáp án
  const revealRow = useCallback((rowIndex) => {
    if (rowIndex < 0 || revealedRows.includes(rowIndex)) return;
    
    // Hiệu ứng revealing
    setRevealingRow(rowIndex);
    playSound('reveal');
    
    // Reveal từng ô với delay
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[rowIndex] = newGrid[rowIndex].map(cell => ({
        ...cell, revealed: !cell.empty
      }));
      return newGrid;
    });
    
    // Hiệu ứng kéo dài để thấy rõ animation
    setTimeout(() => {
      setRevealingRow(-1);
      setRevealedRows(prev => [...prev, rowIndex]);
      setCurrentQuestion(-1);
      setRowAnswerInput('');
      setRowAnswerResult(null);
      playSound('correct');
    }, 800);
  }, [revealedRows, playSound]);

  // Helper: Show result popup (user closes manually)
  const showResultPopup = useCallback((type, message, answer = null) => {
    setResultPopup({ type, message, answer });
    // No auto-dismiss - user clicks X or outside to close
  }, []);

  // Xử lý khi giáo viên nhập đáp án cho hàng
  const handleRowAnswerSubmit = useCallback(() => {
    if (currentQuestion < 0) return;

    const correctAnswer = questions[currentQuestion]?.answer;
    const userAnswer = rowAnswerInput.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (userAnswer === correctAnswer) {
      setRowAnswerResult('correct');
      showResultPopup('correct', 'ĐÚNG RỒI!', correctAnswer);
      revealRow(currentQuestion);
    } else {
      setRowAnswerResult('wrong');
      showResultPopup('wrong', 'CHƯA ĐÚNG!', 'Thử lại nhé!');
      playSound('wrong');
      setTimeout(() => setRowAnswerResult(null), 1500);
    }
  }, [currentQuestion, questions, rowAnswerInput, revealRow, playSound, showResultPopup]);

  // Click trực tiếp để mở (không cần nhập đáp án)
  const handleDirectReveal = useCallback((rowIndex) => {
    if (revealedRows.includes(rowIndex)) {
      // Đã mở rồi -> đóng lại (chỉ khi chưa kết thúc game)
      if (!gameComplete) {
        setGrid(prev => {
          const newGrid = [...prev];
          newGrid[rowIndex] = newGrid[rowIndex].map(cell => ({
            ...cell, revealed: false
          }));
          return newGrid;
        });
        setRevealedRows(prev => prev.filter(r => r !== rowIndex));
        playSound('click');
      }
    } else {
      // Chưa mở -> mở
      revealRow(rowIndex);
    }
  }, [revealedRows, revealRow, playSound, gameComplete]);

  // Long press handlers for mobile
  const handleTouchStart = useCallback((rowIndex) => {
    setLongPressRow(rowIndex);
    longPressTimerRef.current = setTimeout(() => {
      handleDirectReveal(rowIndex);
      setLongPressRow(-1);
    }, 600); // 600ms long press
  }, [handleDirectReveal]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setLongPressRow(-1);
  }, []);

  // Đoán từ khóa - kiểm tra
  const handleGuessKeyword = useCallback(() => {
    const guess = keywordGuess.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!guess) return;

    if (guess === keyword) {
      setGuessResult('correct');
      setShowConfetti(true);
      playSound('victory');
      setGameComplete(true);
      showResultPopup('correct', '🎉 CHÍNH XÁC!', keyword);
      // KHÔNG mở tự động các câu - giáo viên sẽ mở từng câu cho học sinh xem
    } else {
      setGuessResult('wrong');
      showResultPopup('wrong', 'CHƯA ĐÚNG!', 'Thử lại nhé!');
      playSound('wrong');
      setTimeout(() => setGuessResult(null), 2000);
    }
  }, [keywordGuess, keyword, playSound, showResultPopup]);

  // Mở từ khóa (chỉ hiện từ khóa, không mở các câu)
  const handleRevealKeyword = useCallback(() => {
    setShowConfetti(true);
    playSound('victory');
    setGameComplete(true);
    setGuessResult('correct');
    // KHÔNG mở các câu - giáo viên tự mở
  }, [playSound]);

  // Mở toàn bộ (từ khóa + tất cả các câu)
  const handleRevealAll = useCallback(() => {
    setShowConfetti(true);
    playSound('victory');
    setGameComplete(true);
    setGuessResult('correct');
    // Mở tất cả các câu
    setGrid(prev => prev.map(row => row.map(cell => ({ ...cell, revealed: !cell.empty }))));
    setRevealedRows(questions.map((_, i) => i));
  }, [questions, playSound]);

  const handleShowAll = useCallback(() => {
    setGrid(prev => prev.map(row => row.map(cell => ({ ...cell, revealed: !cell.empty }))));
    setRevealedRows(questions.map((_, i) => i));
    setGameComplete(true);
  }, [questions]);

  const handleReset = useCallback(() => setPhase('setup'), []);

  const handleReplay = useCallback(() => {
    const result = generateGridWithKeyword(keyword, questions);
    if (!result.error) {
      setGrid(result.grid);
    }
    setCurrentQuestion(-1);
    setRevealedRows([]);
    setGameComplete(false);
    setKeywordGuess('');
    setGuessResult(null);
    setShowConfetti(false);
  }, [questions, keyword, generateGridWithKeyword]);

  const loadSampleData = useCallback(() => {
    setTopic('Thành phố nào là thủ đô của Việt Nam?');
    setKeywordInput('HANOI');
    setQuestionsInput(`Loài hoa nở vào mùa thu ở Hà Nội | HOASUA
Tên gọi cũ của Việt Nam | ANNAM
Con sông lớn chảy qua thủ đô | SONGHONG
Vịnh nổi tiếng UNESCO ở Quảng Ninh | HALONG
Cầu lịch sử bắc qua sông Hồng | LONGBIEN`);
  }, []);

  // === RENDER ===
  return (
    <ToolLayout toolName="Trò chơi Ô chữ" toolIcon="🔤">
      {phase === 'setup' ? (
        // === SETUP PHASE ===
        <div className="max-w-3xl mx-auto p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
            <div className="text-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                🎯 Tạo Trò chơi Ô chữ
              </h2>
              <p className="text-gray-500 text-sm">
                Nhập từ khóa hàng dọc và các câu gợi ý
              </p>
            </div>

            {/* Error message */}
            {setupError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 text-red-700 text-sm">
                {setupError}
              </div>
            )}

            {/* Topic / Keyword Question - Required */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                🎯 Chủ đề / Câu hỏi chủ đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Địa lý Việt Nam hoặc Thành phố nào là thủ đô?"
                className="w-full p-2.5 border-2 border-gray-200 rounded-xl text-sm
                  focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Chủ đề hoặc câu hỏi gợi ý để học sinh đoán từ khóa
              </p>
            </div>

            {/* Keyword - Required */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                ⭐ Từ khóa hàng dọc <span className="text-red-500">*</span>
                <span className="text-xs text-amber-600 ml-2">(chỉ hỗ trợ KHÔNG DẤU)</span>
              </label>
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value.toUpperCase())}
                placeholder="Ví dụ: HANOI, VIETNAM, TOAN HOC..."
                className="w-full p-2.5 border-2 border-gray-200 rounded-xl text-sm font-bold uppercase
                  focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 tracking-wider"
              />
              {keywordInput && (
                <div className="mt-1 flex flex-wrap gap-1 items-center">
                  <span className="text-xs text-gray-500">Cần {keywordInput.length} câu hỏi chứa:</span>
                  {keywordInput.split('').map((char, i) => (
                    <span key={i} className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded font-bold">
                      Câu {i+1}: [{char}]
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Questions - Required */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                📝 Danh sách câu hỏi gợi ý <span className="text-red-500">*</span>
                <span className="text-xs text-amber-600 ml-2">(đáp án viết KHÔNG DẤU)</span>
              </label>
              <textarea
                value={questionsInput}
                onChange={(e) => setQuestionsInput(e.target.value)}
                placeholder={`Mỗi dòng 1 câu theo format: Câu hỏi | ĐÁP ÁN

═══ VÍ DỤ: Từ khóa "HANOI" (5 chữ) ═══

Loài hoa nở mùa thu ở Hà Nội | HOASUA
Tên gọi cũ của Việt Nam | ANNAM
Con sông lớn chảy qua thủ đô | SONGHONG
Vịnh nổi tiếng UNESCO | HALONG
Cầu lịch sử bắc qua sông Hồng | LONGBIEN

💡 Hỗ trợ: dấu | hoặc : hoặc Tab hoặc 3+ khoảng trắng
✨ Tự động sửa: "Câu hỏi? đáp án" → "Câu hỏi?|đáp án"`}
                className="w-full h-48 p-3 border-2 border-gray-200 rounded-xl text-sm
                  focus:border-teal-400 focus:ring-2 focus:ring-teal-100 resize-none font-mono"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button onClick={loadSampleData}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">
                📋 Xem mẫu
              </button>
              <button onClick={() => setShowAIPrompt(true)}
                className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium">
                🤖 Tạo bằng AI
              </button>
              <button onClick={() => { setTopic(''); setKeywordInput(''); setQuestionsInput(''); setSetupError(''); }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">
                🗑️ Xóa hết
              </button>
              <div className="flex-1" />
              <button
                onClick={handleStartGame}
                disabled={!topic.trim() || !keywordInput.trim() || !questionsInput.trim()}
                className={`px-6 py-2.5 rounded-xl font-bold text-white transition-all
                  ${topic.trim() && keywordInput.trim() && questionsInput.trim()
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:shadow-lg'
                    : 'bg-gray-300 cursor-not-allowed'}`}>
                🎮 Bắt đầu chơi
              </button>
            </div>

            {/* Live Validation & Preview */}
            {(keywordInput.trim() || questionsInput.trim()) && (
              <div className="mt-4 space-y-3">
                {/* Validation Status */}
                {(() => {
                  const kw = keywordInput.toUpperCase();
                  const parseResult = parseQuestions(questionsInput);
                  const parsed = parseResult.parsed;
                  const parseErrors = parseResult.errors;
                  const kwLen = kw.length;
                  const qLen = parsed.length;
                  
                  // Check errors
                  const errors = [];
                  const warnings = [];
                  
                  // Add parse errors
                  parseErrors.forEach(err => {
                    errors.push(`❌ Dòng ${err.line}: ${err.reason}`);
                  });
                  
                  if (kwLen === 0 && qLen > 0) {
                    warnings.push('⚠️ Chưa nhập từ khóa hàng dọc');
                  }
                  if (kwLen > 0 && qLen === 0) {
                    warnings.push('⚠️ Chưa nhập câu hỏi gợi ý');
                  }
                  if (kwLen > 0 && qLen > 0 && kwLen !== qLen) {
                    errors.push(`❌ Từ khóa "${kw}" có ${kwLen} chữ nhưng bạn nhập ${qLen} câu hỏi`);
                  }
                  
                  // Check each question
                  const questionStatus = parsed.map((q, i) => {
                    const neededChar = kw[i]?.toUpperCase();
                    if (!neededChar) return { status: 'extra', message: `Câu ${i+1}: Thừa (từ khóa chỉ có ${kwLen} chữ)` };
                    
                    const hasChar = q.answer.includes(neededChar);
                    if (!hasChar) {
                      return { 
                        status: 'error', 
                        message: `Câu ${i+1}: "${q.answer}" không có chữ "${neededChar}"`,
                        needed: neededChar,
                        answer: q.answer
                      };
                    }
                    return { 
                      status: 'ok', 
                      message: `Câu ${i+1}: ✓`,
                      needed: neededChar,
                      answer: q.answer,
                      position: q.answer.indexOf(neededChar)
                    };
                  });
                  
                  const hasErrors = errors.length > 0 || questionStatus.some(s => s.status === 'error' || s.status === 'extra');
                  const allOk = kwLen > 0 && qLen > 0 && kwLen === qLen && questionStatus.every(s => s.status === 'ok');
                  
                  return (
                    <>
                      {/* Summary Banner */}
                      <div className={`p-3 rounded-xl border-2 ${
                        allOk ? 'bg-green-50 border-green-300' : 
                        hasErrors ? 'bg-red-50 border-red-300' : 
                        'bg-yellow-50 border-yellow-300'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{allOk ? '✅' : hasErrors ? '❌' : '⚠️'}</span>
                          <span className={`font-bold ${allOk ? 'text-green-700' : hasErrors ? 'text-red-700' : 'text-yellow-700'}`}>
                            {allOk ? 'Sẵn sàng chơi!' : hasErrors ? 'Cần sửa lỗi' : 'Đang thiếu thông tin'}
                          </span>
                        </div>
                        
                        {/* Errors */}
                        {errors.map((e, i) => (
                          <p key={i} className="text-red-600 text-sm">{e}</p>
                        ))}
                        {warnings.map((w, i) => (
                          <p key={i} className="text-yellow-600 text-sm">{w}</p>
                        ))}
                        
                        {/* Missing questions hint */}
                        {kwLen > qLen && qLen > 0 && (
                          <p className="text-red-600 text-sm">
                            ❌ Thiếu {kwLen - qLen} câu hỏi (cần thêm câu chứa: {kw.slice(qLen).split('').map((c, i) => `[${c}]`).join(', ')})
                          </p>
                        )}
                      </div>
                      
                      {/* Detailed question validation */}
                      {parsed.length > 0 && kw.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="font-semibold text-gray-700 text-sm mb-2">
                            📋 Kiểm tra từng câu:
                          </p>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {questionStatus.map((status, i) => {
                              const q = parsed[i];
                              const color = ROW_COLORS[i % ROW_COLORS.length];
                              
                              if (status.status === 'extra') {
                                return (
                                  <div key={i} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                                    <span className="text-orange-500 font-bold w-6">{i+1}.</span>
                                    <span className="text-orange-600 text-sm flex-1">{q?.question}</span>
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Thừa câu</span>
                                  </div>
                                );
                              }
                              
                              if (status.status === 'error') {
                                return (
                                  <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
                                    <span className={`${color.text} font-bold w-6`}>{i+1}.</span>
                                    <div className="flex-1">
                                      <p className="text-gray-700 text-sm">{q.question}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono font-bold text-red-600">{q.answer}</span>
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                          ✗ Thiếu chữ [{status.needed}]
                                        </span>
                                      </div>
                                      <p className="text-xs text-red-500 mt-1">
                                        💡 Gợi ý: Đổi đáp án khác có chứa [{status.needed}] hoặc sửa từ khóa
                                      </p>
                                    </div>
                                  </div>
                                );
                              }
                              
                              // OK status
                              return (
                                <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                                  <span className={`${color.text} font-bold w-6`}>{i+1}.</span>
                                  <span className="text-gray-600 text-sm flex-1 truncate">{q.question}</span>
                                  <span className="font-mono font-bold text-green-600">
                                    {q.answer.split('').map((char, ci) => (
                                      <span key={ci} className={ci === status.position ? 'bg-yellow-300 px-0.5 rounded' : ''}>
                                        {char}
                                      </span>
                                    ))}
                                  </span>
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                    ✓ {status.needed}
                                  </span>
                                </div>
                              );
                            })}
                            
                            {/* Missing questions */}
                            {kwLen > qLen && [...Array(kwLen - qLen)].map((_, i) => {
                              const idx = qLen + i;
                              const neededChar = kw[idx];
                              const color = ROW_COLORS[idx % ROW_COLORS.length];
                              return (
                                <div key={`missing-${i}`} className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg border border-dashed border-gray-300">
                                  <span className={`${color.text} font-bold w-6`}>{idx+1}.</span>
                                  <span className="text-gray-400 text-sm flex-1 italic">Chưa nhập câu hỏi...</span>
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                    Cần chữ [{neededChar}]
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* AI Prompt Modal */}
          {showAIPrompt && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAIPrompt(false)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4">
                  <h3 className="text-white font-bold text-lg">🤖 Prompt tạo câu hỏi Ô Chữ bằng AI</h3>
                  <p className="text-white/80 text-sm">Copy prompt này và dán vào ChatGPT, Gemini, Claude...</p>
                </div>
                <div className="p-5 overflow-y-auto max-h-[60vh]">
                  <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm whitespace-pre-wrap text-gray-700 border">
{`Hãy tạo trò chơi ô chữ cho chủ đề: [THAY CHỦ ĐỀ VÀO ĐÂY]

YÊU CẦU:
1. Tạo 1 TỪ KHÓA (5-8 chữ cái, KHÔNG DẤU, viết HOA)
2. Tạo số câu hỏi gợi ý BẰNG ĐÚNG số chữ trong từ khóa
3. ⚠️ QUAN TRỌNG: Đáp án câu 1 PHẢI chứa chữ thứ 1 của từ khóa, đáp án câu 2 PHẢI chứa chữ thứ 2... theo đúng thứ tự
4. Tất cả đáp án viết KHÔNG DẤU, CHỮ HOA, KHÔNG KHOẢNG TRẮNG
5. Mỗi câu hỏi PHẢI có dấu ? ở cuối
6. Câu hỏi ngắn gọn, súc tích: TỐI ĐA 25 từ
7. Đáp án ngắn gọn: 5-12 ký tự (1-2 từ viết liền, không dấu)
8. Đáp án đúng PHẢI chính xác 100%, không gây tranh cãi

FORMAT OUTPUT:
Câu hỏi chủ đề: [Câu hỏi để đoán từ khóa?]
Từ khóa: [TỪ KHÓA]

Danh sách câu hỏi (mỗi dòng 1 câu):
Câu hỏi 1? | ĐÁP ÁN 1
Câu hỏi 2? | ĐÁP ÁN 2
...

VÍ DỤ với từ khóa "HANOI" (5 chữ H-A-N-O-I):
Loài hoa nào nở vào mùa thu ở Hà Nội? | HOASUA (có chữ H)
Tên gọi cũ của Việt Nam là gì? | ANNAM (có chữ A)
Con sông lớn nào chảy qua thủ đô? | SONGHONG (có chữ N)
Vịnh nổi tiếng UNESCO ở Quảng Ninh? | HALONG (có chữ O)
Cây cầu lịch sử bắc qua sông Hồng? | LONGBIEN (có chữ I)

⚠️ KIỂM TRA BẮT BUỘC (trước khi output):
Với mỗi câu, hãy xác nhận đáp án có chứa chữ cái tương ứng:
- Câu 1: Đáp án có chữ [chữ 1 của từ khóa]? ✓
- Câu 2: Đáp án có chữ [chữ 2 của từ khóa]? ✓
- ... (kiểm tra tất cả)

LƯU Ý QUAN TRỌNG:
- Mỗi câu hỏi PHẢI kết thúc bằng dấu ?
- Đáp án đúng phải CHÍNH XÁC, có thể kiểm chứng
- Đáp án KHÔNG DẤU, VIẾT LIỀN, NGẮN GỌN`}
                  </div>
                </div>
                <div className="px-5 pb-5 flex gap-3">
                  <button
                    onClick={() => {
                      const prompt = `Hãy tạo trò chơi ô chữ cho chủ đề: [THAY CHỦ ĐỀ VÀO ĐÂY]\n\nYÊU CẦU:\n1. Tạo 1 TỪ KHÓA (5-8 chữ cái, KHÔNG DẤU, viết HOA)\n2. Tạo số câu hỏi gợi ý BẰNG ĐÚNG số chữ trong từ khóa\n3. ⚠️ QUAN TRỌNG: Đáp án câu 1 PHẢI chứa chữ thứ 1 của từ khóa, đáp án câu 2 PHẢI chứa chữ thứ 2... theo đúng thứ tự\n4. Tất cả đáp án viết KHÔNG DẤU, CHỮ HOA, KHÔNG KHOẢNG TRẮNG\n5. Mỗi câu hỏi PHẢI có dấu ? ở cuối\n6. Câu hỏi ngắn gọn, súc tích: TỐI ĐA 25 từ\n7. Đáp án ngắn gọn: 5-12 ký tự (1-2 từ viết liền, không dấu)\n8. Đáp án đúng PHẢI chính xác 100%, không gây tranh cãi\n\nFORMAT OUTPUT:\nCâu hỏi chủ đề: [Câu hỏi để đoán từ khóa?]\nTừ khóa: [TỪ KHÓA]\n\nDanh sách câu hỏi (mỗi dòng 1 câu):\nCâu hỏi 1? | ĐÁP ÁN 1\nCâu hỏi 2? | ĐÁP ÁN 2\n...\n\nVÍ DỤ với từ khóa "HANOI" (5 chữ H-A-N-O-I):\nLoài hoa nào nở vào mùa thu ở Hà Nội? | HOASUA (có chữ H)\nTên gọi cũ của Việt Nam là gì? | ANNAM (có chữ A)\nCon sông lớn nào chảy qua thủ đô? | SONGHONG (có chữ N)\nVịnh nổi tiếng UNESCO ở Quảng Ninh? | HALONG (có chữ O)\nCây cầu lịch sử bắc qua sông Hồng? | LONGBIEN (có chữ I)\n\n⚠️ KIỂM TRA BẮT BUỘC (trước khi output):\nVới mỗi câu, hãy xác nhận đáp án có chứa chữ cái tương ứng:\n- Câu 1: Đáp án có chữ [chữ 1 của từ khóa]? ✓\n- Câu 2: Đáp án có chữ [chữ 2 của từ khóa]? ✓\n- ... (kiểm tra tất cả)\n\nLƯU Ý QUAN TRỌNG:\n- Mỗi câu hỏi PHẢI kết thúc bằng dấu ?\n- Đáp án đúng phải CHÍNH XÁC, có thể kiểm chứng\n- Đáp án KHÔNG DẤU, VIẾT LIỀN, NGẮN GỌN`;
                      navigator.clipboard.writeText(prompt);
                      setShowAIPrompt(false);
                      setSetupError('');
                      alert('✅ Đã copy prompt! Hãy dán vào ChatGPT/Gemini/Claude');
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90">
                    📋 Copy Prompt
                  </button>
                  <button onClick={() => setShowAIPrompt(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300">
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // === PLAY PHASE - FULLSCREEN & RESPONSIVE ===
        <div
          ref={gameContainerRef}
          className={`bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900
            relative overflow-hidden
            ${isFullscreen ? 'fixed inset-0 z-[9999] flex flex-col' : 'rounded-2xl'}`}
          style={{ padding: isFullscreen ? '16px' : '12px' }}>
          
          {/* Confetti Animation */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50">
              {[...Array(50)].map((_, i) => (
                <div key={i} className="absolute text-2xl animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}>
                  {['🎉', '🎊', '✨', '💫', '⭐', '🌟'][i % 6]}
                </div>
              ))}
            </div>
          )}

          {/* RESULT POPUP - Large, visible from far (projector) */}
          {resultPopup && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 animate-popIn cursor-pointer"
              onClick={() => setResultPopup(null)}>
              <div
                className={`relative px-10 py-8 sm:px-20 sm:py-12 rounded-3xl shadow-2xl transform
                  ${resultPopup.type === 'correct'
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 ring-8 ring-green-300/50'
                    : 'bg-gradient-to-br from-red-500 to-rose-600 ring-8 ring-red-300/50'}`}
                onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button
                  onClick={() => setResultPopup(null)}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12
                    bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center
                    text-white text-2xl sm:text-3xl font-bold transition-all hover:scale-110">
                  ✕
                </button>
                <p className={`text-white font-black text-center drop-shadow-lg
                  text-5xl sm:text-7xl lg:text-8xl xl:text-9xl`}>
                  {resultPopup.type === 'correct' ? '✅' : '❌'} {resultPopup.message}
                </p>
                {resultPopup.answer && (
                  <p className={`text-center mt-4 font-black drop-shadow-lg tracking-wider
                    ${resultPopup.type === 'correct'
                      ? 'text-yellow-300 text-3xl sm:text-5xl lg:text-6xl xl:text-7xl'
                      : 'text-white/80 text-xl sm:text-2xl lg:text-3xl'}`}>
                    {resultPopup.answer}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TOP BAR - Compact */}
          <div className="flex items-center justify-between mb-2 relative z-10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => { exitFullscreen(); handleReset(); }}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium">
                ← Về
              </button>
              <button onClick={handleReplay}
                className="p-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-lg" title="Chơi lại">
                🔄
              </button>
              {/* Progress indicator */}
              <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg">
                <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${(revealedRows.length / questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-white/80 text-xs font-bold">{revealedRows.length}/{questions.length}</span>
              </div>
            </div>

            {/* Brand Logo - Center */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none select-none" aria-hidden="true">
              <LogoIcon size={22} />
              <span className="text-sm font-bold tracking-tight text-white/70">SoroKid</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-lg ${soundEnabled ? 'bg-green-500 text-white' : 'bg-white/20 text-white/50'}`}
                title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}>
                {soundEnabled ? '🔊' : '🔇'}
              </button>
              <button onClick={handleRevealKeyword} disabled={gameComplete}
                className="px-2 py-1.5 bg-pink-500 hover:bg-pink-400 text-white rounded-lg disabled:opacity-50 text-xs font-bold"
                title="Chỉ hiện từ khóa">
                🏁 Từ khóa
              </button>
              <button onClick={handleRevealAll} disabled={gameComplete && revealedRows.length === questions.length}
                className="px-2 py-1.5 bg-purple-500 hover:bg-purple-400 text-white rounded-lg disabled:opacity-50 text-xs font-bold"
                title="Mở tất cả câu hỏi + từ khóa">
                📜 Toàn bộ
              </button>
              <button onClick={toggleFullscreen}
                className="p-1.5 bg-blue-500 hover:bg-blue-400 text-white rounded-lg"
                title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}>
                {isFullscreen ? '✖' : '⛶'}
              </button>
            </div>
          </div>

          {/* KEYWORD QUESTION - Compact but readable */}
          {topic && (
            <div className="mb-2 flex-shrink-0 relative z-10">
              <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 rounded-lg px-3 py-1.5 sm:py-2 shadow-lg">
                <p className={`text-white font-black text-center leading-tight drop-shadow-lg
                  ${topic.length > 80
                    ? 'text-sm sm:text-base lg:text-lg'
                    : topic.length > 50
                      ? 'text-base sm:text-lg lg:text-xl'
                      : 'text-lg sm:text-xl lg:text-2xl xl:text-3xl'}`}
                  style={{
                    wordBreak: 'break-word',
                    maxHeight: isFullscreen ? '12vh' : '60px',
                    overflowY: 'auto'
                  }}>
                  {topic.includes('?') ? '' : '🎯 '}{topic}
                </p>
              </div>
            </div>
          )}

          {/* MAIN AREA - Vertical layout: Grid → Keyword → Question */}
          <div className={`flex flex-col gap-2 relative z-10 ${isFullscreen ? 'flex-1 min-h-0 overflow-hidden' : ''}`}>

            {/* GRID + KEYWORD in one container */}
            <div className={`flex flex-col ${isFullscreen ? 'flex-1 min-h-0 overflow-hidden' : ''}`}>

              {/* Grid Container - Click outside to close question */}
              <div
                onClick={handleCloseQuestion}
                className={`flex items-start justify-center bg-white/5 backdrop-blur rounded-xl p-2 overflow-auto
                ${isFullscreen ? 'flex-1' : ''}`}>
                <div className="inline-block">
                  {grid.map((row, rowIndex) => {
                    const isRevealing = revealingRow === rowIndex;
                    const color = ROW_COLORS[rowIndex % ROW_COLORS.length];
                    const isCurrent = currentQuestion === rowIndex;
                    const isRevealed = revealedRows.includes(rowIndex);
                    
                    return (
                    <div key={rowIndex} 
                      className={`flex items-center transition-all duration-300
                        ${isRevealing ? 'scale-105' : ''} ${isCurrent ? 'scale-[1.02]' : ''}`}
                      style={{ gap: `${Math.max(2, cellSize * 0.06)}px`, marginBottom: `${Math.max(2, cellSize * 0.06)}px` }}>
                      
                      {/* Row Number Button - Click mở câu hỏi, Double-click/Long-press mở đáp án */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenQuestion(rowIndex); }}
                        onDoubleClick={(e) => { e.stopPropagation(); handleDirectReveal(rowIndex); }}
                        onTouchStart={() => handleTouchStart(rowIndex)}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                        style={{ width: cellSize, height: cellSize, fontSize: `${cellSize * 0.4}px` }}
                        className={`flex items-center justify-center flex-shrink-0
                          rounded-lg text-white font-black transition-all shadow-lg
                          ${color.bg}
                          ${isCurrent ? 'ring-2 ring-yellow-300 scale-110 animate-pulse' : ''}
                          ${longPressRow === rowIndex ? 'scale-95 opacity-70' : ''}
                          ${isRevealed ? 'ring-2 ring-green-400 bg-green-500' : 'hover:scale-105 cursor-pointer'}
                          ${gameComplete && !isRevealed ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
                        title={isRevealed ? 'Đã mở' : (gameComplete ? 'Click để mở đáp án' : 'Click: mở câu hỏi | Giữ lâu: mở đáp án')}>
                        {isRevealed ? '✓' : rowIndex + 1}
                      </button>
                      
                      {/* Cells */}
                      {row.map((cell, colIndex) => {
                        if (cell.empty) return (
                          <div key={colIndex} style={{ width: cellSize, height: cellSize }} />
                        );
                        
                        const isKw = colIndex === keywordCol;
                        const cellRevealed = cell.revealed;
                        
                        return (
                          <div key={colIndex}
                            style={{ 
                              width: cellSize, 
                              height: cellSize, 
                              fontSize: `${cellSize * 0.45}px`,
                              transitionDelay: isRevealing ? `${colIndex * 60}ms` : '0ms'
                            }}
                            className={`flex items-center justify-center flex-shrink-0
                              font-black rounded-md transition-all duration-300 shadow-sm
                              ${cellRevealed 
                                ? isKw 
                                  ? 'bg-gradient-to-br from-yellow-300 to-amber-400 text-amber-900 scale-105' 
                                  : 'bg-white text-gray-800'
                                : isKw 
                                  ? 'bg-yellow-500/40 border border-yellow-300' 
                                  : 'bg-slate-700/80 border border-slate-600'}`}>
                            {cellRevealed ? cell.char : ''}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                </div>
              </div>
              
              {/* Question Display - Compact but readable */}
              {currentQuestion >= 0 && !revealedRows.includes(currentQuestion) && (
                <div className={`mt-2 bg-gradient-to-r ${
                  ROW_COLORS[currentQuestion % ROW_COLORS.length].bg.replace('bg-', 'from-')} to-purple-600
                  rounded-xl p-2 sm:p-3 shadow-xl animate-slideUp flex-shrink-0`}>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-white/30 text-white font-black
                      flex items-center justify-center text-lg sm:text-xl lg:text-2xl flex-shrink-0 shadow">
                      {currentQuestion + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      {/* Auto-scale font based on question length */}
                      <p className={`font-bold text-white leading-snug mb-2
                        ${questions[currentQuestion]?.question?.length > 100
                          ? 'text-sm sm:text-base lg:text-lg'
                          : questions[currentQuestion]?.question?.length > 60
                            ? 'text-base sm:text-lg lg:text-xl'
                            : 'text-lg sm:text-xl lg:text-2xl xl:text-3xl'}`}
                        style={{
                          wordBreak: 'break-word',
                          maxHeight: isFullscreen ? '15vh' : '80px',
                          overflowY: 'auto'
                        }}>
                        {questions[currentQuestion]?.question}
                      </p>
                      
                      {/* Input đáp án - Compact */}
                      {!gameComplete ? (
                        <div className="flex gap-1.5 items-center flex-wrap sm:flex-nowrap">
                          <input
                            ref={rowAnswerInputRef}
                            type="text"
                            value={rowAnswerInput}
                            onChange={(e) => setRowAnswerInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleRowAnswerSubmit()}
                            placeholder="Nhập đáp án..."
                            className={`flex-1 px-2 py-1.5 rounded-lg font-bold text-center uppercase
                              text-gray-800 text-base border-2 transition-all min-w-0
                              ${rowAnswerResult === 'wrong'
                                ? 'bg-red-100 border-red-400 animate-shake'
                                : 'bg-white border-white/50 focus:border-white'}`}
                          />
                          <button onClick={handleRowAnswerSubmit}
                            className="px-2.5 py-1.5 bg-white text-purple-600 font-bold rounded-lg text-sm
                              hover:scale-105 active:scale-95 transition-all shadow whitespace-nowrap">
                            ✓
                          </button>
                          <button onClick={() => handleDirectReveal(currentQuestion)}
                            className="px-2.5 py-1.5 bg-green-400 hover:bg-green-300 text-white font-bold rounded-lg text-xs
                              hover:scale-105 active:scale-95 transition-all shadow whitespace-nowrap"
                            title="Mở đáp án">
                            Mở
                          </button>
                        </div>
                      ) : (
                        /* Khi đã đoán đúng - Compact */
                        <div className="flex gap-1.5 items-center">
                          <div className="flex-1 px-2 py-1.5 bg-white/20 rounded-lg text-white/90 text-center text-sm font-medium">
                            {questions[currentQuestion]?.answer}
                          </div>
                          <button onClick={() => handleDirectReveal(currentQuestion)}
                            className="px-3 py-1.5 bg-green-400 hover:bg-green-300 text-white font-bold rounded-lg text-sm
                              hover:scale-105 active:scale-95 transition-all shadow whitespace-nowrap animate-pulse">
                            Mở
                          </button>
                        </div>
                      )}

                      {rowAnswerResult === 'wrong' && (
                        <p className="text-white/80 text-xs mt-1">❌ Sai! Thử lại...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* KEYWORD BAR - Horizontal, below grid */}
              <div className={`mt-2 rounded-lg p-2 transition-all shadow-lg flex flex-wrap items-center justify-center gap-2
                ${guessResult === 'correct' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                  guessResult === 'wrong' ? 'bg-gradient-to-r from-red-600 to-rose-600' :
                  'bg-gradient-to-r from-amber-600 to-orange-600'}`}>

                {/* Keyword boxes - Large for projector */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-white font-bold text-sm sm:text-base mr-1">⭐</span>
                  {keyword.split('').map((char, i) => {
                    const isCharRevealed = revealedRows.includes(i) || gameComplete;
                    const kwLen = keyword.length;
                    // Larger boxes for better visibility
                    const boxSize = kwLen > 10 ? 32 : kwLen > 8 ? 38 : kwLen > 6 ? 44 : 50;
                    const fontSize = kwLen > 10 ? 'text-base' : kwLen > 8 ? 'text-lg' : 'text-xl sm:text-2xl';
                    return (
                      <div key={i}
                        style={{ width: boxSize, height: boxSize }}
                        className={`flex items-center justify-center flex-shrink-0
                          font-black ${fontSize} rounded-lg border-3 transition-all shadow-md
                          ${isCharRevealed ? 'bg-white text-orange-700 border-white scale-105' : 'bg-black/30 text-white border-white/60'}
                          ${gameComplete && !revealedRows.includes(i) ? 'animate-pulse' : ''}`}>
                        {isCharRevealed ? char : '?'}
                      </div>
                    );
                  })}
                </div>

                {/* Input or Result */}
                {!gameComplete ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={keywordInputRef}
                      type="text"
                      value={keywordGuess}
                      onChange={(e) => setKeywordGuess(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleGuessKeyword()}
                      placeholder="Đoán từ khóa..."
                      className="w-24 sm:w-32 px-2 py-1 rounded font-bold text-center uppercase
                        bg-white text-gray-800 text-sm border-2 border-white focus:border-yellow-300 focus:outline-none"
                      maxLength={keyword.length + 2}
                    />
                    <button onClick={handleGuessKeyword} disabled={!keywordGuess.trim()}
                      className="px-2 py-1 bg-white text-orange-700 font-black rounded text-sm
                        disabled:opacity-50 hover:scale-105 active:scale-95 transition-all">
                      🎯
                    </button>
                    {guessResult === 'wrong' && (
                      <span className="text-white text-xs">❌</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">🎉 Đúng!</span>
                    {revealedRows.length < questions.length && (
                      <button onClick={handleRevealAll}
                        className="px-2 py-1 bg-black/20 text-white font-bold rounded text-xs hover:bg-black/30 border border-white/30">
                        Mở hết
                      </button>
                    )}
                    <button onClick={handleReplay}
                      className="px-2 py-1 bg-white text-orange-700 font-bold rounded text-xs hover:scale-105">
                      🔄
                    </button>
                  </div>
                )}
              </div>

              {/* Success message when keyword guessed but questions remain */}
              {gameComplete && revealedRows.length < questions.length && currentQuestion < 0 && (
                <div className="mt-1 text-center text-green-300 text-xs font-medium">
                  Click số để mở đáp án ({questions.length - revealedRows.length} còn lại)
                </div>
              )}
            </div>
          </div>
          
          {/* CSS Animations */}
          <style jsx>{`
            @keyframes slideUp {
              from { transform: translateY(10px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .animate-slideUp { animation: slideUp 0.2s ease-out; }
            @keyframes confetti {
              0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            .animate-confetti { animation: confetti 4s linear forwards; }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
            }
            .animate-shake { animation: shake 0.3s ease-in-out; }
            @keyframes popIn {
              0% { transform: scale(0.5); opacity: 0; }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-popIn { animation: popIn 0.3s ease-out; }
          `}</style>
        </div>
      )}
    </ToolLayout>
  );
}
