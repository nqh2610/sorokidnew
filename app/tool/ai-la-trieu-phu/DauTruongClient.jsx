'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout/ToolLayout';
import LocalizedLink from '@/components/LocalizedLink/LocalizedLink';
import { LogoIcon } from '@/components/Logo/Logo';
import { loadGameSettings, saveGameSettings, GAME_IDS } from '@/lib/gameStorage';
import { useI18n } from '@/lib/i18n/I18nContext';

// Game modes
const GAME_MODES = {
  GAMESHOW: 'gameshow', // 15 câu chuẩn ALTP với thang tiền thưởng
  QUICK: 'quick'        // Chơi hết câu hỏi, không giới hạn số lượng
};

// Default settings cho localStorage
const DEFAULT_SETTINGS = {
  q: '',        // questionsText
  n: 15,        // numQuestions  
  m: 'gameshow' // gameMode
};

export default function AiLaTrieuPhu() {
  const { t } = useI18n();
  
  // Prize money levels from i18n - 15 câu chuẩn ALTP
  const PRIZE_LEVELS = t('toolbox.millionaire.prizeLevels') || [
    '200K', '400K', '600K', '1M', '2M',
    '3M', '6M', '10M', '14M', '22M',
    '30M', '40M', '60M', '85M', '150M'
  ];
  
  const [screen, setScreen] = useState('setup');
  const [toast, setToast] = useState(null);
  const gameContainerRef = useRef(null);
  
  // Setup state
  const [questionsText, setQuestionsText] = useState('');
  const [numQuestions, setNumQuestions] = useState(15);
  const [gameMode, setGameMode] = useState(GAME_MODES.GAMESHOW); // 'gameshow' or 'quick'

  // Game state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  
  // Trợ giúp state
  const [used5050, setUsed5050] = useState(false);
  const [usedAudience, setUsedAudience] = useState(false);
  const [usedPhone, setUsedPhone] = useState(false);
  const [hidden5050, setHidden5050] = useState([]);
  const [audienceVotes, setAudienceVotes] = useState(null);
  const [phoneHint, setPhoneHint] = useState(null);
  
  // Sound
  const [soundEnabled, setSoundEnabled] = useState(true);

  // AI Prompt modal
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  const showToast = useCallback((message, duration = 3000) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  }, []);

  // ==================== ALTP SOUND SYSTEM ====================
  const audioCtxRef = useRef(null);
  const bgMusicRef = useRef(null);
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const bgMusicStartedRef = useRef(false);
  
  // Initialize MP3 sounds
  useEffect(() => {
    if (typeof window !== 'undefined') {
      bgMusicRef.current = new Audio('/tool/ailatrieuphu/ai-la-trieu-phu.mp3');
      bgMusicRef.current.loop = false; // Chỉ chạy 1 lần
      bgMusicRef.current.volume = 0.3;
      
      correctSoundRef.current = new Audio('/tool/ailatrieuphu/dung.mp3');
      correctSoundRef.current.volume = 0.7;
      
      wrongSoundRef.current = new Audio('/tool/ailatrieuphu/sai.mp3');
      wrongSoundRef.current.volume = 0.7;
    }
  }, []);
  
  // Cleanup AudioContext and sounds when unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close?.();
        audioCtxRef.current = null;
      }
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
        bgMusicRef.current = null;
      }
      bgMusicStartedRef.current = false;
    };
  }, []);
  
  // Start background music when entering game (only once)
  useEffect(() => {
    if (!bgMusicRef.current) return;
    
    if (soundEnabled && screen === 'game' && !bgMusicStartedRef.current) {
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current.play().catch(() => {});
      bgMusicStartedRef.current = true;
    } else if (screen !== 'game') {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
      bgMusicStartedRef.current = false;
    }
  }, [soundEnabled, screen]);
  
  // Toggle sound - pause/resume bg music
  useEffect(() => {
    if (!bgMusicRef.current || screen !== 'game') return;
    
    if (!soundEnabled) {
      bgMusicRef.current.pause();
    } else if (bgMusicStartedRef.current && bgMusicRef.current.paused) {
      bgMusicRef.current.play().catch(() => {});
    }
  }, [soundEnabled, screen]);
  
  // Play MP3 sound effect (stops other sounds first)
  const playMp3Sound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      // Stop any playing effect sounds first
      if (correctSoundRef.current) {
        correctSoundRef.current.pause();
        correctSoundRef.current.currentTime = 0;
      }
      if (wrongSoundRef.current) {
        wrongSoundRef.current.pause();
        wrongSoundRef.current.currentTime = 0;
      }
      
      if (type === 'correct' && correctSoundRef.current) {
        // Lower bg music volume
        if (bgMusicRef.current) bgMusicRef.current.volume = 0.1;
        correctSoundRef.current.play().catch(() => {});
        // Restore bg music volume after sound ends
        correctSoundRef.current.onended = () => {
          if (bgMusicRef.current) bgMusicRef.current.volume = 0.3;
        };
      } else if (type === 'wrong' && wrongSoundRef.current) {
        // Pause bg music completely
        if (bgMusicRef.current) bgMusicRef.current.pause();
        wrongSoundRef.current.play().catch(() => {});
      }
    } catch (e) { /* MP3 sound error */ }
  }, [soundEnabled]);
  
  // Restart background music from beginning
  const restartBgMusic = useCallback(() => {
    if (!bgMusicRef.current || !soundEnabled) return;
    bgMusicRef.current.currentTime = 0;
    bgMusicRef.current.volume = 0.3;
    bgMusicRef.current.play().catch(() => {});
  }, [soundEnabled]);
  
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Play a note with envelope
  const playNote = useCallback((ctx, freq, startTime, duration, vol = 0.15, type = 'sine') => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    // ADSR envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
    gain.gain.linearRampToValueAtTime(vol * 0.7, startTime + duration * 0.3);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }, []);

  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      const t = ctx.currentTime;
      
      switch (type) {
        case 'select':
          // ALTP selection - deep electronic blip (như tiếng chọn đáp án trong show)
          playNote(ctx, 220, t, 0.08, 0.3, 'sine'); // Bass note
          playNote(ctx, 440, t, 0.06, 0.2, 'triangle'); // Harmonic
          playNote(ctx, 330, t + 0.03, 0.1, 0.25, 'sine'); // Follow-up
          break;
          
        case 'lock':
          // "Đó là câu trả lời cuối cùng!" - dramatic tension build
          // Deep bass pulse building up
          playNote(ctx, 110, t, 0.3, 0.35, 'sine'); // Low bass
          playNote(ctx, 165, t + 0.1, 0.3, 0.3, 'sine'); // Fifth
          playNote(ctx, 220, t + 0.25, 0.35, 0.35, 'sine'); // Octave
          // Tension chord
          playNote(ctx, 147, t + 0.5, 0.6, 0.25, 'triangle'); // D3
          playNote(ctx, 185, t + 0.5, 0.6, 0.25, 'triangle'); // F#3
          playNote(ctx, 220, t + 0.5, 0.6, 0.25, 'triangle'); // A3
          // Final lock sound
          playNote(ctx, 330, t + 0.9, 0.2, 0.4, 'sine'); // E4 confirmation
          break;
          
        case 'help':
          // Lifeline activation - hopeful ascending arpeggio
          playNote(ctx, 262, t, 0.12, 0.25, 'sine'); // C4
          playNote(ctx, 330, t + 0.1, 0.12, 0.25, 'sine'); // E4
          playNote(ctx, 392, t + 0.2, 0.12, 0.25, 'sine'); // G4
          playNote(ctx, 523, t + 0.3, 0.25, 0.3, 'sine'); // C5
          // Sparkle overlay
          playNote(ctx, 1047, t + 0.35, 0.15, 0.15, 'sine'); // C6 sparkle
          break;
          
        case 'suspense':
          // Heartbeat suspense - như nhịp tim hồi hộp chờ đáp án
          for (let i = 0; i < 8; i++) {
            const beatTime = t + i * 0.3;
            const intensity = 0.2 + (i * 0.03); // Tăng dần intensity
            const freq = 60 + (i * 3); // Tăng dần pitch
            // Heartbeat: thump-thump
            playNote(ctx, freq, beatTime, 0.1, intensity, 'sine');
            playNote(ctx, freq * 1.5, beatTime + 0.12, 0.08, intensity * 0.7, 'sine');
          }
          // Final dramatic bass hit
          playNote(ctx, 55, t + 2.4, 0.3, 0.4, 'sine');
          break;
      }
    } catch (e) { /* Sound error */ }
  }, [soundEnabled, getAudioCtx, playNote]);

  // ==================== FULLSCREEN ====================
  const enterFullscreen = useCallback(async () => {
    try {
      const elem = gameContainerRef.current;
      if (elem && elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem?.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      }
    } catch (e) {
      // Fullscreen not supported
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (e) {}
  }, []);

  // ==================== LOCALSTORAGE - TỐI ƯU ====================
  // Load settings khi mount (chỉ 1 lần)
  useEffect(() => {
    const saved = loadGameSettings(GAME_IDS.AI_LA_TRIEU_PHU, DEFAULT_SETTINGS);
    if (saved.q) setQuestionsText(saved.q);
    if (saved.n) setNumQuestions(saved.n);
    if (saved.m) setGameMode(saved.m);
    
    // Check game state đang dở (lưu riêng vì là session state)
    try {
      const sessionKey = 'sorokid:altp:session';
      const sessionData = localStorage.getItem(sessionKey);
      if (sessionData) {
        const gs = JSON.parse(sessionData);
        if (gs.questions?.length > 0) {
          setQuestions(gs.questions);
          setCurrentIndex(gs.currentIndex || 0);
          setScore(gs.score || 0);
          setUsed5050(gs.used5050 || false);
          setUsedAudience(gs.usedAudience || false);
          setUsedPhone(gs.usedPhone || false);
          setGameMode(gs.gameMode || GAME_MODES.GAMESHOW);
          setScreen('game');
          showToast(t('toolbox.millionaire.toast.restoreGame'));
        }
      }
    } catch (e) {}
  }, [showToast]);

  // Lưu settings chỉ khi user bấm "Bắt đầu" game
  const saveSettingsNow = useCallback(() => {
    saveGameSettings(GAME_IDS.AI_LA_TRIEU_PHU, {
      q: questionsText,
      n: numQuestions,
      m: gameMode
    });
  }, [questionsText, numQuestions, gameMode]);

  // Lưu session state khi đang chơi (để có thể tiếp tục)
  useEffect(() => {
    const sessionKey = 'sorokid:altp:session';
    if (screen === 'game' && questions.length > 0) {
      localStorage.setItem(sessionKey, JSON.stringify({
        questions, currentIndex, score, used5050, usedAudience, usedPhone, gameMode
      }));
    } else if (screen === 'result' || screen === 'setup') {
      localStorage.removeItem(sessionKey);
    }
  }, [screen, questions, currentIndex, score, used5050, usedAudience, usedPhone, gameMode]);

  // ==================== SMART PARSE QUESTIONS ====================
  // Detect delimiter in text (|, ;, tab, or multiple spaces)
  const detectDelimiter = useCallback((text) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) return '|';
    
    const sampleLine = lines[0];
    
    // Count occurrences of potential delimiters
    const pipeCount = (sampleLine.match(/\|/g) || []).length;
    const semicolonCount = (sampleLine.match(/;/g) || []).length;
    const tabCount = (sampleLine.match(/\t/g) || []).length;
    
    // Need at least 5 delimiters for valid format (Q|A|B|C|D|Answer)
    if (pipeCount >= 5) return '|';
    if (semicolonCount >= 5) return ';';
    if (tabCount >= 5) return '\t';
    
    // Fallback to pipe
    return '|';
  }, []);

  // Try to fix common input errors
  const smartFixLine = useCallback((line) => {
    let fixed = line.trim();
    
    // Replace common wrong delimiters
    // Replace tab with |
    fixed = fixed.replace(/\t+/g, '|');
    // Replace ; with | (if not inside text)
    fixed = fixed.replace(/\s*;\s*/g, '|');
    // Replace multiple spaces (3+) with | (likely intended as delimiter)
    fixed = fixed.replace(/\s{3,}/g, '|');
    
    // Smart: Add | after ? if missing (question mark followed by space and text)
    // Pattern: "câu hỏi? đáp án" → "câu hỏi?|đáp án"
    // But NOT if already has | after ?
    if (!fixed.includes('?|') && fixed.includes('?')) {
      fixed = fixed.replace(/\?\s+(?!\|)/g, '?|');
    }
    
    // Fix double pipes
    fixed = fixed.replace(/\|\|+/g, '|');
    
    // Remove leading/trailing pipes
    fixed = fixed.replace(/^\|+|\|+$/g, '');
    
    // Normalize spaces around pipes
    fixed = fixed.replace(/\s*\|\s*/g, '|');
    
    return fixed;
  }, []);

  // Parse with smart detection
  const parseQuestions = useCallback((text) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed = [];
    const errors = [];
    
    for (let i = 0; i < lines.length; i++) {
      const originalLine = lines[i];
      const fixedLine = smartFixLine(originalLine);
      const parts = fixedLine.split('|').map(p => p.trim()).filter(p => p);
      
      if (parts.length >= 6) {
        // Standard format: Question|A|B|C|D|Answer
        const correctLetter = parts[5].toUpperCase();
        const answerIndex = ['A', 'B', 'C', 'D'].indexOf(correctLetter);
        if (answerIndex !== -1) {
          parsed.push({
            question: parts[0],
            answers: [parts[1], parts[2], parts[3], parts[4]],
            correct: answerIndex,
            lineNum: i + 1
          });
        } else {
          errors.push({ line: i + 1, text: originalLine.substring(0, 50), reason: t('toolbox.millionaire.invalidAnswer', { answer: parts[5] }) });
        }
      } else if (parts.length === 5) {
        // Missing answer letter - try to detect from content
        // Check if last part looks like an answer (A/B/C/D or 1/2/3/4)
        const lastPart = parts[4].toUpperCase();
        if (['A', 'B', 'C', 'D', '1', '2', '3', '4'].includes(lastPart)) {
          const answerIndex = ['A', 'B', 'C', 'D', '1', '2', '3', '4'].indexOf(lastPart) % 4;
          parsed.push({
            question: parts[0],
            answers: [parts[1], parts[2], parts[3], lastPart],
            correct: answerIndex,
            lineNum: i + 1,
            autoFixed: true
          });
        } else {
          errors.push({ line: i + 1, text: originalLine.substring(0, 50), reason: t('toolbox.millionaire.missingAnswer') });
        }
      } else if (parts.length > 0 && parts.length < 5) {
        errors.push({ line: i + 1, text: originalLine.substring(0, 50), reason: t('toolbox.millionaire.notEnoughParts', { count: parts.length }) });
      }
    }
    
    return { parsed, errors };
  }, [smartFixLine]);

  // Wrapper for backward compatibility
  const getValidQuestions = useCallback((text) => {
    return parseQuestions(text).parsed;
  }, [parseQuestions]);

  // Sample questions - from i18n
  const sampleQuestions = t('toolbox.millionaire.sampleQuestions');

  // ==================== GAME ACTIONS ====================
  const startGame = useCallback(async (mode = null) => {
    const { parsed, errors } = parseQuestions(questionsText);
    if (parsed.length === 0) {
      if (errors.length > 0) {
        showToast(t('toolbox.millionaire.toast.errorAtLine', { line: errors[0].line, reason: errors[0].reason }));
      } else {
        showToast(t('toolbox.millionaire.toast.noValidQuestions'));
      }
      return;
    }

    // LƯU SETTINGS KHI BẮT ĐẦU GAME
    saveSettingsNow();

    // Xác định mode: nếu truyền vào thì dùng, không thì tự động
    const selectedMode = mode || (parsed.length === 15 ? GAME_MODES.GAMESHOW : GAME_MODES.QUICK);
    setGameMode(selectedMode);

    const shuffled = [...parsed].sort(() => Math.random() - 0.5);

    // Game Show mode: tối đa 15 câu, Quick mode: tất cả câu hỏi
    const selected = selectedMode === GAME_MODES.GAMESHOW
      ? shuffled.slice(0, Math.min(15, shuffled.length))
      : shuffled;

    setQuestions(selected);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsLocked(false);
    setIsRevealed(false);
    setUsed5050(false);
    setUsedAudience(false);
    setUsedPhone(false);
    setHidden5050([]);
    setAudienceVotes(null);
    setPhoneHint(null);
    setScreen('game');

    // Auto fullscreen
    setTimeout(() => enterFullscreen(), 100);
    playSound('select');
  }, [questionsText, parseQuestions, showToast, playSound, enterFullscreen]);

  const selectAnswer = useCallback((index) => {
    if (isLocked || isRevealed || hidden5050.includes(index)) return;
    playSound('select');
    setSelectedAnswer(index);
  }, [isLocked, isRevealed, hidden5050, playSound]);

  const lockAnswer = useCallback(() => {
    if (selectedAnswer === null || isLocked) return;
    
    playSound('lock');
    setIsLocked(true);
    
    // Play suspense heartbeat
    setTimeout(() => playSound('suspense'), 500);
    
    // Reveal sau 2.5s (longer for suspense)
    setTimeout(() => {
      setIsRevealed(true);
      const current = questions[currentIndex];
      if (selectedAnswer === current.correct) {
        playMp3Sound('correct');
        setScore(s => s + 1);
      } else {
        playMp3Sound('wrong');
      }
    }, 2500);
  }, [selectedAnswer, isLocked, questions, currentIndex, playSound, playMp3Sound]);

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setScreen('result');
      // Chỉ thoát fullscreen nếu KHÔNG đạt TRIỆU PHÚ (không trả lời đúng hết)
      const current = questions[currentIndex];
      const isLastCorrect = selectedAnswer === current.correct;
      const finalScore = score + (isLastCorrect ? 1 : 0);
      if (finalScore < questions.length) {
        exitFullscreen();
      }
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsLocked(false);
      setIsRevealed(false);
      setHidden5050([]);
      setAudienceVotes(null);
      setPhoneHint(null);
      // Restart background music for next question
      restartBgMusic();
    }
  }, [currentIndex, questions, score, selectedAnswer, exitFullscreen, restartBgMusic]);

  // Trợ giúp 50:50 - Luôn loại 2 đáp án sai, giữ đáp án đúng + 1 sai
  const use5050 = useCallback(() => {
    if (used5050 || isLocked) return;
    const current = questions[currentIndex];
    const wrongAnswers = [0, 1, 2, 3].filter(i => i !== current.correct);

    // Luôn loại 2 đáp án sai ngẫu nhiên (giữ lại đáp án đúng + 1 đáp án sai)
    const toHide = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);

    setHidden5050(toHide);
    setUsed5050(true);
    if (toHide.includes(selectedAnswer)) setSelectedAnswer(null);
    playSound('help');
  }, [used5050, isLocked, questions, currentIndex, selectedAnswer, playSound]);

  // Trợ giúp Khán giả - 70% xác suất khán giả chọn đúng
  const useAudience = useCallback(() => {
    if (usedAudience || isLocked) return;
    const current = questions[currentIndex];
    const votes = [0, 0, 0, 0];
    
    // 70% khán giả bình chọn đúng, 30% bị đánh lừa
    const isCorrect = Math.random() < 0.7;
    const highestVoteIdx = isCorrect ? current.correct : 
      [0, 1, 2, 3].filter(i => i !== current.correct && !hidden5050.includes(i))[Math.floor(Math.random() * 3)];
    
    votes[highestVoteIdx] = 35 + Math.random() * 30; // 35-65%
    let remaining = 100 - votes[highestVoteIdx];
    [0, 1, 2, 3].filter(i => i !== highestVoteIdx && !hidden5050.includes(i)).forEach((i, idx, arr) => {
      const share = idx === arr.length - 1 ? remaining : Math.random() * remaining * 0.6;
      votes[i] = share;
      remaining -= share;
    });
    const total = votes.reduce((a, b) => a + b, 0);
    setAudienceVotes(votes.map(v => Math.round(v / total * 100)));
    setUsedAudience(true);
    playSound('help');
  }, [usedAudience, isLocked, questions, currentIndex, hidden5050, playSound]);

  // Trợ giúp Gọi điện - 70% xác suất gợi ý đúng
  const usePhone = useCallback(() => {
    if (usedPhone || isLocked) return;
    const current = questions[currentIndex];
    
    // 70% gợi ý đúng, 30% gợi ý sai
    const isCorrect = Math.random() < 0.7;
    const hintIdx = isCorrect ? current.correct : 
      [0, 1, 2, 3].filter(i => i !== current.correct && !hidden5050.includes(i))[Math.floor(Math.random() * 3)];
    const letter = ['A', 'B', 'C', 'D'][hintIdx];
    
    const confidentHints = [
      t('toolbox.millionaire.phoneHints.confident1', { letter }),
      t('toolbox.millionaire.phoneHints.confident2', { letter }),
      t('toolbox.millionaire.phoneHints.confident3', { letter })
    ];
    const unsureHints = [
      t('toolbox.millionaire.phoneHints.unsure1', { letter }),
      t('toolbox.millionaire.phoneHints.unsure2', { letter }),
      t('toolbox.millionaire.phoneHints.unsure3', { letter })
    ];
    const hints = Math.random() > 0.4 ? confidentHints : unsureHints;
    
    setPhoneHint(hints[Math.floor(Math.random() * hints.length)]);
    setUsedPhone(true);
    playSound('help');
  }, [usedPhone, isLocked, questions, currentIndex, hidden5050, playSound]);

  const resetGame = useCallback(() => {
    exitFullscreen();
    setScreen('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsLocked(false);
    setIsRevealed(false);
    setUsed5050(false);
    setUsedAudience(false);
    setUsedPhone(false);
    setHidden5050([]);
    setAudienceVotes(null);
    setPhoneHint(null);
    // Xóa session state cũ
    try { localStorage.removeItem('sorokid:altp:session'); } catch (e) {}
  }, [exitFullscreen]);

  // Parse results with error info
  const parseResult = parseQuestions(questionsText);
  const validCount = parseResult.parsed.length;
  const errorCount = parseResult.errors.length;
  const currentQuestion = questions[currentIndex];

  return (
    <ToolLayout>
      <div ref={gameContainerRef} className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-black/80 text-white px-4 py-2 rounded-lg">
          {toast}
        </div>
      )}

      {/* ==================== SETUP SCREEN ==================== */}
      {screen === 'setup' && (
        <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-pink-50 p-3">
          <div className="max-w-2xl mx-auto">
            {/* Compact Header */}
            <div className="text-center mb-3 flex items-center justify-center gap-2">
              <span className="text-3xl">💰</span>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  {t('toolbox.millionaire.title')}
                </h1>
              </div>
            </div>

            {/* Quick Start - Compact */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 mb-3 border border-amber-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-amber-800">⚡ {t('toolbox.millionaire.quickStart')}</p>
                  <p className="text-xs text-amber-600">{t('toolbox.millionaire.quickStartDesc')}</p>
                </div>
                <button
                  onClick={() => {
                    setQuestionsText(sampleQuestions);
                    setTimeout(() => startGame(GAME_MODES.GAMESHOW), 50);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg shadow hover:scale-105 transition-all whitespace-nowrap"
                >
                  🎮 {t('toolbox.millionaire.start')}
                </button>
              </div>
            </div>

            {/* Question Input - Compact */}
            <div className="bg-white rounded-xl shadow p-3 mb-3 border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-700">📝 {t('toolbox.millionaire.questions')}</span>
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                    {validCount}✓
                  </span>
                  {errorCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                      {errorCount}✗
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setQuestionsText(sampleQuestions)} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                    📋 {t('toolbox.millionaire.sample')}
                  </button>
                  <button onClick={() => setShowAIPrompt(true)} className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90">
                    🤖 {t('toolbox.millionaire.ai')}
                  </button>
                  <button onClick={() => setQuestionsText('')} className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200">
                    🗑️
                  </button>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-1 rounded ${soundEnabled ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}
                    title={soundEnabled ? t('toolbox.millionaire.soundOff') : t('toolbox.millionaire.soundOn')}
                  >
                    {soundEnabled ? '🔊' : '🔇'}
                  </button>
                </div>
              </div>
              
              {/* Textarea with line numbers */}
              <div className={`relative flex border-2 rounded-lg overflow-hidden focus-within:border-amber-400 ${errorCount > 0 ? 'border-red-300' : ''}`}>
                {/* Line numbers - scrollbar hidden but scrollable */}
                <div
                  className="line-numbers bg-gray-100 text-gray-400 text-right py-3 px-2 font-mono text-sm select-none border-r overflow-y-auto"
                  style={{
                    minWidth: '2.5rem',
                    height: '256px',
                    lineHeight: '1.5rem',
                    scrollbarWidth: 'none', /* Firefox */
                    msOverflowStyle: 'none', /* IE/Edge */
                  }}
                >
                  {(questionsText || ' ').split('\n').map((_, i) => (
                    <div
                      key={i}
                      className={`h-6 ${parseResult.errors.some(e => e.line === i + 1) ? 'text-red-500 font-bold' : ''}`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <textarea
                  value={questionsText}
                  onChange={(e) => setQuestionsText(e.target.value)}
                  placeholder={t('toolbox.millionaire.inputPlaceholder')}
                  className="flex-1 h-64 py-3 px-3 resize-none font-mono text-sm focus:outline-none"
                  style={{ lineHeight: '1.5rem' }}
                  onScroll={(e) => {
                    // Sync scroll with line numbers
                    const lineNumbers = e.target.previousSibling;
                    if (lineNumbers) lineNumbers.scrollTop = e.target.scrollTop;
                  }}
                />
              </div>
              
              {/* Error details - Compact */}
              {errorCount > 0 && (
                <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200 text-xs">
                  <p className="font-bold text-red-700 mb-1">⚠️ {t('toolbox.millionaire.errors')}</p>
                  {parseResult.errors.slice(0, 3).map((err, i) => (
                    <div key={i} className="text-red-600">{t('toolbox.millionaire.errorLine', { line: err.line, reason: err.reason })}</div>
                  ))}
                  {parseResult.errors.length > 3 && (
                    <div className="text-red-400">{t('toolbox.millionaire.moreErrors', { count: parseResult.errors.length - 3 })}</div>
                  )}
                </div>
              )}
            </div>

            {/* Mode Selection & Start Buttons */}
            <div className="space-y-2">
              {/* Game Show Mode - Chỉ hiện khi >= 15 câu */}
              {validCount >= 15 && (
                <button
                  onClick={() => startGame(GAME_MODES.GAMESHOW)}
                  className="w-full py-3 text-lg font-black rounded-xl shadow-lg transition-all
                    bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>🎬</span>
                    <span>{t('toolbox.millionaire.gameShowMode')}</span>
                    <span className="text-sm opacity-80">{t('toolbox.millionaire.questionCount', { count: 15 })}</span>
                  </div>
                  <p className="text-xs font-normal opacity-80 mt-0.5">{t('toolbox.millionaire.gameShowDesc')}</p>
                </button>
              )}

              {/* Chơi tất cả - Luôn hiện */}
              <button
                onClick={() => startGame(GAME_MODES.QUICK)}
                disabled={validCount === 0}
                className={`w-full py-3 text-base font-bold rounded-xl shadow transition-all
                  ${validCount > 0
                    ? validCount >= 15
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:scale-[1.02]'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white hover:scale-[1.02]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>📋</span>
                  <span>{t('toolbox.millionaire.playAll')}</span>
                  <span className="text-sm opacity-80">({t('toolbox.millionaire.questionCount', { count: validCount })})</span>
                </div>
                <p className="text-xs font-normal opacity-80 mt-0.5">
                  {validCount < 15
                    ? t('toolbox.millionaire.needMoreQuestions')
                    : t('toolbox.millionaire.playAllDesc')}
                </p>
              </button>
            </div>

            {/* Back link */}
            <div className="text-center mt-2">
              <LocalizedLink href="/tool" className="text-gray-400 hover:text-violet-600 text-sm">
                {t('toolbox.millionaire.backToToolbox')}
              </LocalizedLink>
            </div>
          </div>

          {/* AI Prompt Modal */}
          {showAIPrompt && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAIPrompt(false)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
                  <h3 className="text-white font-bold text-lg">{t('toolbox.millionaire.aiPrompt.title')}</h3>
                  <p className="text-white/80 text-sm">{t('toolbox.millionaire.aiPrompt.subtitle')}</p>
                </div>
                <div className="p-5 overflow-y-auto max-h-[60vh]">
                  <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm whitespace-pre-wrap text-gray-700 border">
                    {t('toolbox.millionaire.aiPrompt.promptContent')}
                  </div>
                </div>
                <div className="px-5 pb-5 flex gap-3">
                  <button
                    onClick={() => {
                      const prompt = t('toolbox.millionaire.aiPrompt.promptContent');
                      navigator.clipboard.writeText(prompt);
                      setShowAIPrompt(false);
                      alert(t('toolbox.millionaire.aiPrompt.copied'));
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90">
                    {t('toolbox.millionaire.aiPrompt.copyPrompt')}
                  </button>
                  <button onClick={() => setShowAIPrompt(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300">
                    {t('toolbox.millionaire.aiPrompt.close')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== GAME SCREEN - ALTP STYLE ==================== */}
      {screen === 'game' && currentQuestion && (
        <div className="altp-game min-h-screen relative overflow-hidden">
          {/* Background - Hình studio ALTP */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/tool/ailatrieuphu/ailatrieuphu.jpg')" }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          {/* LOGO SOROKID - Góc dưới trái, nhỏ gọn nhưng rõ ràng */}
          <div className="absolute bottom-3 left-3 z-[5] pointer-events-none select-none" aria-hidden="true">
            <div className="flex items-center gap-1.5 opacity-60">
              <LogoIcon size={22} />
              <span className="text-xs font-bold tracking-tight text-white/80">SoroKid</span>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="relative z-10 min-h-screen min-h-[100dvh] flex flex-col">
            {/* Top Bar - Responsive */}
            <div className="flex items-center justify-between p-2 sm:p-3">
              <button onClick={resetGame} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors">
                ✕ <span className="hidden sm:inline">{t('toolbox.millionaire.exit')}</span>
              </button>
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Mode indicator */}
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  gameMode === GAME_MODES.GAMESHOW
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                    : 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                }`}>
                  {gameMode === GAME_MODES.GAMESHOW ? '🎬' : '📋'}
                </span>
                <span className="px-2 sm:px-3 py-1 bg-amber-500/80 text-white rounded-lg text-xs sm:text-sm font-bold">
                  {t('toolbox.millionaire.questionNum', { current: currentIndex + 1, total: questions.length })}
                </span>
                {/* Score indicator for Quick mode */}
                {gameMode === GAME_MODES.QUICK && (
                  <span className="px-2 sm:px-3 py-1 bg-green-500/80 text-white rounded-lg text-xs sm:text-sm font-bold">
                    {t('toolbox.millionaire.correct')} {score}
                  </span>
                )}
                <button onClick={() => setSoundEnabled(!soundEnabled)} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg text-xs sm:text-sm">
                  {soundEnabled ? '🔊' : '🔇'}
                </button>
              </div>
            </div>

            {/* Question Box - Responsive - Larger for projector */}
            <div className="flex-shrink-0 px-2 sm:px-4 lg:px-8 mb-2 sm:mb-4 lg:mb-6">
              <div className="altp-question-box py-2 sm:py-3 lg:py-5">
                <span className="altp-diamond text-sm sm:text-2xl lg:text-3xl">◆</span>
                <span className="altp-question-text text-sm sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl font-bold drop-shadow-lg leading-tight">
                  {currentQuestion.question}
                </span>
                <span className="altp-diamond text-sm sm:text-2xl lg:text-3xl">◆</span>
              </div>
            </div>

            {/* Main Game Area - Responsive layout */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 pb-safe">
              {/* Left Side - Answers */}
              <div className="flex-1 flex flex-col justify-start lg:justify-center px-2 sm:px-4 pb-4 sm:pb-4 overflow-y-auto">
                {/* Phone Hint - Compact */}
                {phoneHint && (
                  <div className="mb-2 sm:mb-4 p-2 sm:p-3 bg-green-900/90 border-2 border-green-400 rounded-xl text-center animate-fadeIn">
                    <p className="text-green-300 text-sm sm:text-lg md:text-xl font-bold">📞 &ldquo;{phoneHint}&rdquo;</p>
                  </div>
                )}

                {/* Audience Chart - Compact */}
                {audienceVotes && (
                  <div className="mb-2 sm:mb-4 p-2 sm:p-3 bg-blue-900/90 border-2 border-blue-400 rounded-xl animate-fadeIn">
                    <p className="text-white text-xs sm:text-sm font-bold text-center mb-1 sm:mb-2">👥 {t('toolbox.millionaire.audienceResult')}</p>
                    <div className="flex justify-center gap-2 sm:gap-4">
                      {['A', 'B', 'C', 'D'].map((letter, i) => (
                        <div key={letter} className={`text-center ${hidden5050.includes(i) ? 'opacity-20' : ''}`}>
                          <div className="h-10 sm:h-16 w-6 sm:w-10 bg-blue-950 rounded-md relative overflow-hidden border border-blue-400">
                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-orange-500 to-yellow-400 transition-all duration-700"
                              style={{ height: `${audienceVotes[i]}%` }} />
                          </div>
                          <span className="text-orange-400 font-black text-xs sm:text-sm block">{audienceVotes[i]}%</span>
                          <span className="text-white font-bold text-xs sm:text-sm">{letter}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Answers Grid - Always 2 columns - Larger for projector */}
                <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-3 lg:gap-4 max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full">
                  {['A', 'B', 'C', 'D'].map((letter, index) => {
                    const isHidden = hidden5050.includes(index);
                    const isSelected = selectedAnswer === index;
                    const isCorrect = currentQuestion.correct === index;
                    const showCorrect = isRevealed && isCorrect;
                    const showWrong = isRevealed && isSelected && !isCorrect;

                    let stateClass = 'altp-answer-default';
                    if (isHidden) stateClass = 'altp-answer-hidden';
                    else if (showCorrect) stateClass = 'altp-answer-correct';
                    else if (showWrong) stateClass = 'altp-answer-wrong';
                    else if (isSelected) stateClass = 'altp-answer-selected';

                    return (
                      <button
                        key={letter}
                        onClick={() => selectAnswer(index)}
                        disabled={isLocked || isHidden}
                        className={`altp-answer-btn ${stateClass} py-2 sm:py-3 lg:py-5`}
                      >
                        <span className="altp-answer-diamond text-[10px] sm:text-base lg:text-xl">◆</span>
                        <span className="altp-answer-letter text-sm sm:text-xl md:text-2xl lg:text-4xl">{letter}</span>
                        <span className="altp-answer-text text-[11px] sm:text-base md:text-xl lg:text-3xl xl:text-4xl font-semibold line-clamp-2">
                          {currentQuestion.answers[index]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons - Larger for projector */}
                {gameMode === GAME_MODES.GAMESHOW && (
                  <div className="mt-2 sm:mt-3 lg:mt-6 flex justify-center gap-1.5 sm:gap-3 lg:gap-5">
                    {/* Trợ giúp */}
                    <button onClick={use5050} disabled={used5050 || isLocked}
                      className={`altp-help-btn w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 ${used5050 ? 'opacity-30' : ''}`}>
                      <span className="text-[9px] sm:text-sm lg:text-lg font-black">50:50</span>
                    </button>
                    <button onClick={useAudience} disabled={usedAudience || isLocked}
                      className={`altp-help-btn w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 ${usedAudience ? 'opacity-30' : ''}`}>
                      <span className="text-sm sm:text-xl lg:text-3xl">👥</span>
                    </button>
                    <button onClick={usePhone} disabled={usedPhone || isLocked}
                      className={`altp-help-btn w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 ${usedPhone ? 'opacity-30' : ''}`}>
                      <span className="text-sm sm:text-xl lg:text-3xl">📞</span>
                    </button>
                  </div>
                )}

                {/* Lock / Next Button - Larger for projector */}
                <div className="mt-2 sm:mt-3 lg:mt-6 text-center pb-2">
                  {!isLocked && selectedAnswer !== null && (
                    <button onClick={lockAnswer} className="altp-action-btn text-xs sm:text-base md:text-lg lg:text-2xl px-3 sm:px-6 lg:px-10 py-1.5 sm:py-3 lg:py-4">
                      {t('toolbox.millionaire.lockAnswer')}
                    </button>
                  )}

                  {isLocked && !isRevealed && (
                    <div className="flex flex-col items-center gap-1 lg:gap-3">
                      <p className="text-yellow-400 text-xs sm:text-lg lg:text-2xl font-bold animate-pulse">{t('toolbox.millionaire.waitingResult')}</p>
                      <div className="flex justify-center gap-1 lg:gap-2">
                        <span className="w-1.5 h-1.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-orange-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-1.5 h-1.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                    </div>
                  )}

                  {isRevealed && (
                    <div className="animate-fadeIn">
                      <p className={`text-base sm:text-2xl md:text-3xl lg:text-5xl font-black mb-1.5 lg:mb-4 drop-shadow-lg ${selectedAnswer === currentQuestion.correct ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedAnswer === currentQuestion.correct ? t('toolbox.millionaire.correctAnswer') : t('toolbox.millionaire.wrongAnswer', { answer: ['A', 'B', 'C', 'D'][currentQuestion.correct] })}
                      </p>
                      <button onClick={nextQuestion} className="altp-action-btn text-xs sm:text-base md:text-lg lg:text-2xl px-3 sm:px-6 lg:px-10 py-1.5 sm:py-3 lg:py-4">
                        {currentIndex + 1 >= questions.length ? t('toolbox.millionaire.result') : t('toolbox.millionaire.next')}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Prize Ladder - Only in Game Show mode, Hidden on mobile */}
              {gameMode === GAME_MODES.GAMESHOW && (
                <div className="hidden lg:block w-48 flex-shrink-0 pr-4">
                  <div className="altp-prize-ladder">
                    {[...PRIZE_LEVELS].reverse().map((prize, i) => {
                      const realIndex = PRIZE_LEVELS.length - 1 - i;
                      const isCurrent = realIndex === currentIndex;
                      const isPassed = realIndex < currentIndex;
                      const isMilestone = realIndex === 4 || realIndex === 9 || realIndex === 14;

                      return (
                        <div key={i} className={`altp-prize-item ${isCurrent ? 'current' : ''} ${isPassed ? 'passed' : ''} ${isMilestone ? 'milestone' : ''}`}>
                          <span className="prize-number">{realIndex + 1}</span>
                          <span className="prize-value">{prize}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== RESULT SCREEN ==================== */}
      {screen === 'result' && (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative">
          {/* LOGO SOROKID - Góc dưới trái */}
          <div className="absolute bottom-3 left-3 z-[5] pointer-events-none select-none" aria-hidden="true">
            <div className="flex items-center gap-1.5 opacity-60">
              <LogoIcon size={22} />
              <span className="text-xs font-bold tracking-tight text-white/80">SoroKid</span>
            </div>
          </div>
          <div className="text-center">
            {/* Mode badge */}
            <div className="mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                gameMode === GAME_MODES.GAMESHOW
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {gameMode === GAME_MODES.GAMESHOW ? t('toolbox.millionaire.resultScreen.gameShow') : t('toolbox.millionaire.resultScreen.playAllMode')}
              </span>
            </div>

            <div className="text-7xl mb-4">
              {score >= questions.length * 0.8 ? '🏆' : score >= questions.length * 0.5 ? '🌟' : '💪'}
            </div>
            <h1 className="text-4xl font-black text-yellow-400 mb-4">
              {score >= questions.length * 0.8 ? t('toolbox.millionaire.resultScreen.champion') : score >= questions.length * 0.5 ? t('toolbox.millionaire.resultScreen.excellent') : t('toolbox.millionaire.resultScreen.tryHarder')}
            </h1>

            {/* Game Show mode: show prize money */}
            {gameMode === GAME_MODES.GAMESHOW && (
              <div className="text-5xl font-black text-white mb-3">
                💰 {score > 0 ? PRIZE_LEVELS[Math.min(score - 1, PRIZE_LEVELS.length - 1)] : t('toolbox.millionaire.zeroPrize')}
              </div>
            )}

            {/* Quick mode: show percentage */}
            {gameMode === GAME_MODES.QUICK && (
              <div className="text-5xl font-black text-white mb-3">
                {Math.round((score / questions.length) * 100)}%
              </div>
            )}

            <p className="text-xl text-blue-200 mb-8">{t('toolbox.millionaire.resultScreen.correctCount', { score, total: questions.length })}</p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setScore(0);
                  setSelectedAnswer(null);
                  setIsLocked(false);
                  setIsRevealed(false);
                  setUsed5050(false);
                  setUsedAudience(false);
                  setUsedPhone(false);
                  setHidden5050([]);
                  setAudienceVotes(null);
                  setPhoneHint(null);
                  setQuestions(q => [...q].sort(() => Math.random() - 0.5));
                  setScreen('game');
                  enterFullscreen();
                }}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
              >
                {t('toolbox.millionaire.resultScreen.playAgain')}
              </button>
              <button onClick={resetGame}
                className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
              >
                {t('toolbox.millionaire.resultScreen.newSetup')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALTP Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }

        /* Hide scrollbar for line numbers */
        .line-numbers::-webkit-scrollbar { display: none; }

        .altp-bg {
          background: linear-gradient(180deg, #0a1628 0%, #1a237e 40%, #311b92 70%, #1a1a2e 100%);
        }
        
        .altp-diamond {
          color: #ff9800;
          flex-shrink: 0;
          text-shadow: 0 0 10px #ff9800;
        }
        .altp-question-text {
          color: white;
          text-align: center;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        
        .altp-answer-default {
          background: linear-gradient(90deg, rgba(26,35,126,0.95) 0%, rgba(40,53,147,0.95) 50%, rgba(26,35,126,0.95) 100%);
          border: 3px solid #5c6bc0;
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        .altp-answer-default:hover:not(:disabled) {
          border-color: #ff9800;
          box-shadow: 0 0 25px rgba(255, 152, 0, 0.5);
          transform: scale(1.02);
        }
        .altp-answer-selected {
          background: linear-gradient(90deg, #e65100 0%, #ff9800 50%, #e65100 100%);
          border: 3px solid #ffcc80;
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          box-shadow: 0 0 30px rgba(255, 152, 0, 0.6);
        }
        .altp-answer-correct {
          background: linear-gradient(90deg, #1b5e20 0%, #4caf50 50%, #1b5e20 100%);
          border: 3px solid #a5d6a7;
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          animation: pulse-correct 0.5s ease-out;
          box-shadow: 0 0 30px rgba(76, 175, 80, 0.6);
        }
        .altp-answer-wrong {
          background: linear-gradient(90deg, #b71c1c 0%, #f44336 50%, #b71c1c 100%);
          border: 3px solid #ef9a9a;
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        .altp-answer-hidden {
          opacity: 0.1;
          cursor: not-allowed;
        }
        
        @keyframes pulse-correct {
          0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
          100% { box-shadow: 0 0 20px 10px rgba(76, 175, 80, 0); }
        }
        
        .altp-answer-diamond {
          color: #ff9800;
          font-size: 0.625rem;
        }
        .altp-answer-letter {
          color: #ff9800;
          font-weight: 700;
          min-width: 1.25rem;
        }
        .altp-answer-text {
          flex: 1;
          text-align: left;
          font-size: 0.75rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.3;
        }
        @media (min-width: 640px) {
          .altp-answer-text {
            font-size: 1rem;
          }
        }
        @media (min-width: 768px) {
          .altp-answer-text {
            font-size: 1.125rem;
          }
        }
        @media (min-width: 1024px) {
          .altp-answer-text {
            font-size: 1.5rem;
          }
        }
        @media (min-width: 1280px) {
          .altp-answer-text {
            font-size: 1.75rem;
          }
        }

        .altp-action-btn {
          padding: 0.5rem 1.5rem;
          background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
          border: 2px solid #64b5f6;
          border-radius: 10px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(21,101,192,0.4);
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        @media (min-width: 640px) {
          .altp-action-btn {
            padding: 1rem 2.5rem;
            border: 3px solid #64b5f6;
            border-radius: 12px;
          }
        }
        .altp-action-btn:hover {
          transform: scale(1.08);
          border-color: #ff9800;
          box-shadow: 0 0 30px rgba(255,152,0,0.5);
        }
        
        .altp-answer-btn {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          padding: 0.4rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
          position: relative;
          clip-path: polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%);
          min-height: 36px;
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .altp-answer-btn {
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            min-height: 56px;
            border-radius: 6px;
          }
        }
        @media (min-width: 768px) {
          .altp-answer-btn {
            gap: 0.75rem;
            padding: 1rem 1.5rem;
            min-height: 64px;
          }
        }
        @media (min-width: 1024px) {
          .altp-answer-btn {
            gap: 1rem;
            padding: 1.25rem 2rem;
            min-height: 80px;
            border-radius: 8px;
          }
        }
        @media (min-width: 1280px) {
          .altp-answer-btn {
            gap: 1.25rem;
            padding: 1.5rem 2.5rem;
            min-height: 100px;
          }
        }
        
        .altp-help-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
          border: 2px solid #5c6bc0;
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        @media (min-width: 640px) {
          .altp-help-btn {
            width: 56px;
            height: 56px;
          }
        }
        .altp-help-btn:hover:not(:disabled) {
          border-color: #ff9800;
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(255,152,0,0.5);
        }
        .altp-help-btn:disabled {
          cursor: not-allowed;
        }
        
        .altp-question-box {
          background: linear-gradient(90deg, transparent 0%, rgba(26,35,126,0.95) 5%, rgba(40,53,147,0.95) 50%, rgba(26,35,126,0.95) 95%, transparent 100%);
          border-top: 2px solid #ff9800;
          border-bottom: 2px solid #ff9800;
          padding: 0.5rem 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          clip-path: polygon(3% 0%, 97% 0%, 100% 50%, 97% 100%, 3% 100%, 0% 50%);
          box-shadow: 0 0 30px rgba(255,152,0,0.3);
        }
        @media (min-width: 640px) {
          .altp-question-box {
            border-top: 4px solid #ff9800;
            border-bottom: 4px solid #ff9800;
            padding: 1.5rem 3rem;
            gap: 1.5rem;
          }
        }
        @media (min-width: 1024px) {
          .altp-question-box {
            border-top: 5px solid #ff9800;
            border-bottom: 5px solid #ff9800;
            padding: 2rem 4rem;
            gap: 2rem;
          }
        }
        @media (min-width: 1280px) {
          .altp-question-box {
            padding: 2.5rem 5rem;
            gap: 2.5rem;
          }
        }

        .altp-prize-ladder {
          display: flex;
          flex-direction: column;
          gap: 2px;
          height: 100%;
          justify-content: center;
        }
        .altp-prize-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          clip-path: polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%);
          font-size: 0.75rem;
          color: #90caf9;
          transition: all 0.3s;
        }
        .altp-prize-item.milestone {
          background: rgba(255, 152, 0, 0.2);
          color: #ffb74d;
        }
        .altp-prize-item.current {
          background: linear-gradient(90deg, #e65100, #ff9800, #e65100);
          color: white;
          font-weight: 700;
          transform: scale(1.05);
        }
        .altp-prize-item.passed {
          opacity: 0.4;
        }
        .prize-number {
          min-width: 1.25rem;
          text-align: center;
        }
        .prize-value {
          flex: 1;
          text-align: right;
        }
      `}</style>
      </div>
    </ToolLayout>
  );
}
