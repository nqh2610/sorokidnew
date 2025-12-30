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
        // Cheerful success sound - ascending arpeggio
        [523, 659, 784, 1047].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          const t = now + i * 0.08;
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
          osc.start(t);
          osc.stop(t + 0.2);
        });
        // Add sparkle
        [1500, 2000].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          const t = now + 0.3 + i * 0.05;
          gain.gain.setValueAtTime(0.15, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
          osc.start(t);
          osc.stop(t + 0.15);
        });
      } else if (type === 'wrong') {
        // Friendly "oops" sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'reveal') {
        // Exciting drumroll + reveal
        // Drumroll
        for (let i = 0; i < 8; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = 200 + i * 50;
          osc.connect(gain);
          gain.connect(ctx.destination);
          const t = now + i * 0.04;
          gain.gain.setValueAtTime(0.15, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
          osc.start(t);
          osc.stop(t + 0.06);
        }
        // Reveal chord
        [400, 500, 600, 800].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          const t = now + 0.35;
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
          osc.start(t);
          osc.stop(t + 0.35);
        });
        // Sparkles
        [1200, 1500, 1800].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          const t = now + 0.5 + i * 0.08;
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
          osc.start(t);
          osc.stop(t + 0.12);
        });
      } else if (type === 'victory') {
        // EPIC VICTORY FANFARE! 🎉
        // Intro drumroll
        for (let i = 0; i < 12; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = 150 + i * 30;
          osc.connect(gain);
          gain.connect(ctx.destination);
          const t = now + i * 0.03;
          gain.gain.setValueAtTime(0.1 + i * 0.015, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
          osc.start(t);
          osc.stop(t + 0.05);
        }
        // Main fanfare melody
        const fanfare = [523, 523, 659, 784, 784, 659, 784, 1047];
        fanfare.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i < 6 ? 'triangle' : 'sawtooth';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          const t = now + 0.4 + i * 0.12;
          const dur = i === fanfare.length - 1 ? 0.6 : 0.12;
          gain.gain.setValueAtTime(0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + dur);
          osc.start(t);
          osc.stop(t + dur + 0.05);
        });
        // Bass accompaniment
        [261, 329, 392].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          const t = now + 0.4 + i * 0.3;
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
          osc.start(t);
          osc.stop(t + 0.4);
        });
        // Grand finale shimmer
        [1500, 2000, 2500, 3000].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          const t = now + 1.3 + i * 0.08;
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
          osc.start(t);
          osc.stop(t + 0.3);
        });
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 800;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.06);
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
  }, [keywordInput, questionsInput, parseQuestions, generateGridWithKeyword, enterFullscreen]);

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

  // Xử lý khi giáo viên nhập đáp án cho hàng
  const handleRowAnswerSubmit = useCallback(() => {
    if (currentQuestion < 0) return;
    
    const correctAnswer = questions[currentQuestion]?.answer;
    const userAnswer = rowAnswerInput.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (userAnswer === correctAnswer) {
      setRowAnswerResult('correct');
      revealRow(currentQuestion);
    } else {
      setRowAnswerResult('wrong');
      playSound('wrong');
      setTimeout(() => setRowAnswerResult(null), 1500);
    }
  }, [currentQuestion, questions, rowAnswerInput, revealRow, playSound]);

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
      // KHÔNG mở tự động các câu - giáo viên sẽ mở từng câu cho học sinh xem
    } else {
      setGuessResult('wrong');
      playSound('wrong');
      setTimeout(() => setGuessResult(null), 2000);
    }
  }, [keywordGuess, keyword, playSound]);

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
        </div>
      ) : (
        // === PLAY PHASE - FULLSCREEN & RESPONSIVE ===
        <div 
          ref={gameContainerRef}
          className={`bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 
            relative overflow-hidden flex flex-col
            ${isFullscreen ? 'fixed inset-0 z-[9999]' : 'min-h-[calc(100vh-120px)] rounded-2xl'}`}
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

          {/* KEYWORD QUESTION - Large & Centered for Projector */}
          {topic && (
            <div className="mb-2 flex-shrink-0 relative z-10">
              <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 rounded-xl px-4 py-3 shadow-xl">
                <p className="text-white font-black text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight drop-shadow-lg">
                  {topic.includes('?') ? '' : '🎯 '}{topic}
                </p>
              </div>
            </div>
          )}

          {/* MAIN AREA */}
          <div className="flex-1 flex flex-col lg:flex-row gap-2 relative z-10 min-h-0 overflow-hidden">

            {/* LEFT: Grid + Question Overlay */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

              {/* Grid Container */}
              <div className="flex-1 flex items-center justify-center bg-white/5 backdrop-blur rounded-xl p-2 min-h-0 overflow-auto relative">
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
                        onClick={() => handleOpenQuestion(rowIndex)}
                        onDoubleClick={() => handleDirectReveal(rowIndex)}
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
              
              {/* Question Display - Below Grid, Large & Readable */}
              {currentQuestion >= 0 && !revealedRows.includes(currentQuestion) && (
                <div className={`mt-2 bg-gradient-to-r ${
                  ROW_COLORS[currentQuestion % ROW_COLORS.length].bg.replace('bg-', 'from-')} to-purple-600
                  rounded-xl p-3 shadow-xl animate-slideUp flex-shrink-0`}>
                  
                  <div className="flex items-start gap-3">
                    <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/30 text-white font-black 
                      flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 shadow-lg">
                      {currentQuestion + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-snug mb-2">
                        {questions[currentQuestion]?.question}
                      </p>
                      
                      {/* Input đáp án - chỉ hiện khi chưa đoán đúng từ khóa */}
                      {!gameComplete ? (
                        <div className="flex gap-2 items-center">
                          <input
                            ref={rowAnswerInputRef}
                            type="text"
                            value={rowAnswerInput}
                            onChange={(e) => setRowAnswerInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleRowAnswerSubmit()}
                            placeholder="Nhập đáp án..."
                            className={`flex-1 px-3 py-2 rounded-xl font-bold text-center uppercase 
                              text-gray-800 text-lg border-3 transition-all min-w-0
                              ${rowAnswerResult === 'wrong' 
                                ? 'bg-red-100 border-red-400 animate-shake' 
                                : 'bg-white border-white/50 focus:border-white'}`}
                          />
                          <button onClick={handleRowAnswerSubmit}
                            className="px-3 py-2 bg-white text-purple-600 font-black rounded-xl text-sm
                              hover:scale-105 active:scale-95 transition-all shadow-lg whitespace-nowrap">
                            Kiểm tra
                          </button>
                          <button onClick={() => handleDirectReveal(currentQuestion)}
                            className="px-3 py-2 bg-green-400 hover:bg-green-300 text-white font-bold rounded-xl text-xs
                              hover:scale-105 active:scale-95 transition-all shadow-lg whitespace-nowrap"
                            title="Mở trực tiếp (bỏ qua nhập đáp án)">
                            Mở đáp án
                          </button>
                        </div>
                      ) : (
                        /* Khi đã đoán đúng từ khóa - chỉ hiện nút mở đáp án */
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 px-3 py-2 bg-white/20 rounded-xl text-white/80 text-center text-sm">
                            Đáp án: <strong>{questions[currentQuestion]?.answer}</strong>
                          </div>
                          <button onClick={() => handleDirectReveal(currentQuestion)}
                            className="px-4 py-2 bg-green-400 hover:bg-green-300 text-white font-bold rounded-xl
                              hover:scale-105 active:scale-95 transition-all shadow-lg whitespace-nowrap animate-pulse">
                            ✨ Mở đáp án
                          </button>
                        </div>
                      )}
                      
                      {rowAnswerResult === 'wrong' && (
                        <p className="text-white/90 text-sm mt-1 animate-pulse font-medium">❌ Chưa đúng! Thử lại...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Instruction when no question selected */}
              {currentQuestion < 0 && !gameComplete && (
                <div className="mt-2 text-center text-white/70 py-2 bg-white/10 rounded-xl">
                  <div className="hidden sm:flex items-center justify-center gap-4 text-sm">
                    <span>👆 <strong>Click số</strong> = Mở câu hỏi</span>
                    <span>👆👆 <strong>Double-click</strong> = Mở đáp án ngay</span>
                  </div>
                  <div className="sm:hidden flex items-center justify-center gap-3 text-sm">
                    <span>👆 <strong>Chạm</strong> = Mở câu hỏi</span>
                    <span>👆⏳ <strong>Giữ lâu</strong> = Mở đáp án</span>
                  </div>
                </div>
              )}
              
              {/* Instruction khi đã đoán đúng từ khóa */}
              {currentQuestion < 0 && gameComplete && revealedRows.length < questions.length && (
                <div className="mt-2 text-center py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl animate-pulse">
                  <p className="text-white font-bold text-lg">🎉 Đã đoán đúng từ khóa!</p>
                  <p className="text-white/80 text-sm">Click vào số để mở từng đáp án cho học sinh xem</p>
                </div>
              )}
            </div>

            {/* RIGHT: Keyword Panel Only */}
            <div className="lg:w-72 xl:w-80 flex flex-col flex-shrink-0">
              
              {/* Keyword Guess Section */}
              <div className={`rounded-xl p-3 transition-all shadow-xl flex flex-col h-full
                ${guessResult === 'correct' ? 'bg-green-500' : 
                  guessResult === 'wrong' ? 'bg-red-500' : 
                  'bg-gradient-to-br from-yellow-500 to-amber-500'}`}>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-white text-base">⭐ TỪ KHÓA</span>
                  <span className="bg-white/30 text-white px-2 py-0.5 rounded-full font-bold text-xs">
                    {revealedRows.length}/{questions.length} gợi ý
                  </span>
                </div>

                {/* Keyword Question - Prominent Display */}
                {topic && (
                  <div className="bg-white/20 rounded-lg p-2 mb-3 border border-white/30">
                    <p className="text-white font-bold text-sm text-center leading-snug">
                      {topic.includes('?') ? '' : '🎯 '}{topic}
                    </p>
                  </div>
                )}

                {/* Keyword Display */}
                <div className="flex justify-center gap-1 mb-3 flex-wrap flex-1 items-center">
                  {keyword.split('').map((char, i) => {
                    const isCharRevealed = revealedRows.includes(i) || gameComplete;
                    return (
                      <div key={i} 
                        style={{ width: Math.min(cellSize * 0.9, 40), height: Math.min(cellSize, 44) }}
                        className={`flex items-center justify-center
                          font-black text-lg rounded-lg border-2 transition-all
                          ${isCharRevealed 
                            ? 'bg-white text-amber-600 border-white scale-105' 
                            : 'bg-white/20 text-white/40 border-white/40'}
                          ${gameComplete && !revealedRows.includes(i) ? 'animate-pulse' : ''}`}>
                        {isCharRevealed ? char : '?'}
                      </div>
                    );
                  })}
                </div>
                
                {!gameComplete ? (
                  <div className="flex gap-2">
                    <input
                      ref={keywordInputRef}
                      type="text"
                      value={keywordGuess}
                      onChange={(e) => setKeywordGuess(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleGuessKeyword()}
                      placeholder="Nhập từ khóa..."
                      className="flex-1 px-2 py-2 rounded-lg font-bold text-center uppercase 
                        bg-white text-gray-800 text-base border-2 border-white/50
                        focus:border-white focus:outline-none min-w-0"
                      maxLength={keyword.length + 2}
                    />
                    <button onClick={handleGuessKeyword} disabled={!keywordGuess.trim()}
                      className="px-3 py-2 bg-white text-amber-600 font-black rounded-lg text-sm
                        disabled:opacity-50 hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
                      🎯 Đoán
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <div className="text-4xl mb-2">🎉🏆🎉</div>
                    <p className="text-xl font-black text-white mb-1">ĐÚNG RỒI!</p>
                    <p className="text-white text-lg font-bold mb-2">Từ khóa: {keyword}</p>
                    
                    {revealedRows.length < questions.length ? (
                      <p className="text-white/80 text-xs mb-2">
                        📌 Còn {questions.length - revealedRows.length} câu chưa mở
                      </p>
                    ) : (
                      <p className="text-white/80 text-xs mb-2">✅ Đã mở hết tất cả!</p>
                    )}
                    
                    <div className="flex gap-2 justify-center flex-wrap">
                      {revealedRows.length < questions.length && (
                        <button onClick={handleRevealAll}
                          className="px-3 py-1.5 bg-white/30 text-white font-bold rounded-lg text-xs
                            hover:bg-white/40 transition-all">
                          Mở tất cả
                        </button>
                      )}
                      <button onClick={handleReplay}
                        className="px-3 py-1.5 bg-white text-amber-600 font-bold rounded-lg text-xs
                          hover:scale-105 active:scale-95 transition-all">
                        🔄 Chơi lại
                      </button>
                      <button onClick={() => { exitFullscreen(); handleReset(); }}
                        className="px-3 py-1.5 bg-white/20 text-white font-bold rounded-lg text-xs
                          hover:bg-white/30 transition-all">
                        ➕ Mới
                      </button>
                    </div>
                  </div>
                )}
                
                {guessResult === 'wrong' && (
                  <p className="text-white text-center mt-2 font-bold animate-pulse text-sm">
                    ❌ Chưa đúng! Thử lại nào!
                  </p>
                )}
              </div>
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
          `}</style>
        </div>
      )}
    </ToolLayout>
  );
}
