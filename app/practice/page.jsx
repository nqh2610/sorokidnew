'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Trophy, Zap, Clock, SkipForward, Home, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/Toast/ToastContext';
import SorobanBoard from '@/components/Soroban/SorobanBoard';
import { calculatePracticeStars } from '@/lib/gamification';

const TOTAL_CHALLENGES = 10; // Mỗi màn có 10 thử thách

// Thông điệp động viên game hóa theo tốc độ
const speedTiers = {
  godlike: {
    threshold: 0.25, // ≤25% thời gian
    multiplier: 3,
    messages: [
      { text: 'THẦN TỐC!', emoji: '⚡' },
      { text: 'SIÊU NHANH!', emoji: '💨' },
      { text: 'KHÔNG THỂ TIN!', emoji: '🤯' },
      { text: 'ĐỈNH CỦA ĐỈNH!', emoji: '🏆' },
    ],
    color: 'from-cyan-400 to-blue-500',
    textColor: 'text-cyan-400'
  },
  fast: {
    threshold: 0.5, // ≤50% thời gian
    multiplier: 2,
    messages: [
      { text: 'NHANH NHƯ CHỚP!', emoji: '🚀' },
      { text: 'TỐC ĐỘ ÁNH SÁNG!', emoji: '✨' },
      { text: 'SIÊU TỐC!', emoji: '💫' },
      { text: 'QUÁI VẬT TỐC ĐỘ!', emoji: '🐆' },
    ],
    color: 'from-green-400 to-emerald-500',
    textColor: 'text-green-400'
  },
  good: {
    threshold: 0.75, // ≤75% thời gian
    multiplier: 1.5,
    messages: [
      { text: 'XUẤT SẮC!', emoji: '🌟' },
      { text: 'TUYỆT VỜI!', emoji: '🎉' },
      { text: 'GIỎI LẮM!', emoji: '👏' },
      { text: 'CỪ KHÔI!', emoji: '💪' },
    ],
    color: 'from-yellow-400 to-orange-500',
    textColor: 'text-yellow-400'
  },
  normal: {
    threshold: 1, // >75% thời gian
    multiplier: 1,
    messages: [
      { text: 'ĐÚNG RỒI!', emoji: '✅' },
      { text: 'CHÍNH XÁC!', emoji: '✓' },
      { text: 'TỐT LẮM!', emoji: '👍' },
      { text: 'HAY LẮM!', emoji: '😊' },
    ],
    color: 'from-gray-400 to-gray-500',
    textColor: 'text-white'
  }
};

const streakMessages = [
  { streak: 3, text: 'COMBO x3!', emoji: '🔥' },
  { streak: 5, text: 'UNSTOPPABLE!', emoji: '💥' },
  { streak: 7, text: 'DOMINATING!', emoji: '👑' },
  { streak: 10, text: 'LEGENDARY!', emoji: '🏆' },
];

const difficultyInfo = {
  1: { label: 'Tập Sự', emoji: '🐣' },
  2: { label: 'Chiến Binh', emoji: '⚔️' },
  3: { label: 'Dũng Sĩ', emoji: '🛡️' },
  4: { label: 'Cao Thủ', emoji: '🔥' },
  5: { label: 'Huyền Thoại', emoji: '👑' }
};

const modeInfo = {
  addition: { title: 'Siêu Cộng', icon: '🌟', symbol: '+', color: 'from-emerald-500 to-green-600' },
  subtraction: { title: 'Siêu Trừ', icon: '👾', symbol: '-', color: 'from-blue-500 to-cyan-600' },
  addSubMixed: { title: 'Cộng Trừ Mix', icon: '⚔️', symbol: '±', color: 'from-teal-500 to-emerald-600' },
  multiplication: { title: 'Siêu Nhân', icon: '✨', symbol: '×', color: 'from-purple-500 to-pink-600' },
  division: { title: 'Siêu Chia', icon: '🍕', symbol: '÷', color: 'from-rose-500 to-red-600' },
  mulDiv: { title: 'Nhân Chia Mix', icon: '🎩', symbol: '×÷', color: 'from-amber-500 to-orange-600' },
  mixed: { title: 'Tứ Phép Thần', icon: '👑', symbol: '∞', color: 'from-indigo-500 to-purple-600' },
  mentalMath: { title: 'Siêu Trí Tuệ', icon: '🧠', symbol: '💭', color: 'from-violet-500 to-fuchsia-600', isMental: true },
  flashAnzan: { title: 'Tia Chớp', icon: '⚡', symbol: '💫', color: 'from-yellow-500 to-orange-600', isFlash: true },
};

// Cấu hình các cấp độ Flash Anzan
const flashLevels = [
  { id: 'tiaSang', name: 'Tia Sáng', emoji: '✨', color: 'from-yellow-400 to-amber-500', numbers: [3, 4], digits: 1, speed: [2, 2.5], stars: 2 },
  { id: 'tiaChop', name: 'Tia Chớp', emoji: '⚡', color: 'from-orange-400 to-amber-500', numbers: [5, 6], digits: 1, speed: [1.5, 1.8], stars: 4 },
  { id: 'samSet', name: 'Sấm Sét', emoji: '🌩️', color: 'from-blue-400 to-cyan-500', numbers: [7, 8], digits: 2, speed: [1, 1.3], stars: 6 },
  { id: 'baoTo', name: 'Bão Tố', emoji: '🌪️', color: 'from-purple-500 to-indigo-600', numbers: [10, 12], digits: 2, speed: [0.6, 0.8], stars: 8 },
  { id: 'thanSam', name: 'Thần Sấm', emoji: '👑', color: 'from-rose-500 to-pink-600', numbers: [13, 15], digits: 3, speed: [0.6, 0.8], stars: 10 },
];

export default function PracticePage() {
  const { status } = useSession();
  const router = useRouter();
  const toast = useToast();

  const [mode, setMode] = useState(null);
  const [difficulty, setDifficulty] = useState(1);
  const [problem, setProblem] = useState(null);
  const [sorobanValue, setSorobanValue] = useState(0);
  const [result, setResult] = useState(null);
  const [sessionStats, setSessionStats] = useState({ stars: 0, correct: 0, total: 0, totalTime: 0 });
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0); // Combo cao nhất trong session
  const [currentChallenge, setCurrentChallenge] = useState(1);
  const [challengeResults, setChallengeResults] = useState([]); // ['correct', 'wrong', 'skipped', ...]
  const [gameComplete, setGameComplete] = useState(false);
  const timerRef = useRef(0);
  const intervalRef = useRef(null);
  const [displayTimer, setDisplayTimer] = useState(0);
  const [sorobanKey, setSorobanKey] = useState(0);
  const [celebration, setCelebration] = useState(null);
  const [celebrationData, setCelebrationData] = useState(null);
  const [mentalAnswer, setMentalAnswer] = useState(''); // Đáp án nhập cho mode Siêu Trí Tuệ
  const [mentalSubMode, setMentalSubMode] = useState(null); // Sub-mode cho Siêu Trí Tuệ
  const mentalInputRef = useRef(null);
  
  // User tier state
  const [userTier, setUserTier] = useState('free');
  
  // Flash Anzan states
  const [flashLevel, setFlashLevel] = useState(null); // Cấp độ Flash Anzan đã chọn
  const [flashPhase, setFlashPhase] = useState('idle'); // 'idle' | 'countdown' | 'showing' | 'answer' | 'result'
  const [flashNumbers, setFlashNumbers] = useState([]); // Các số sẽ hiện
  const [flashCurrentIndex, setFlashCurrentIndex] = useState(0); // Index số đang hiện
  const [flashAnswer, setFlashAnswer] = useState(''); // Đáp án người dùng nhập
  const [flashCorrectAnswer, setFlashCorrectAnswer] = useState(0); // Đáp án đúng
  const [flashCountdown, setFlashCountdown] = useState(3); // Đếm ngược
  const [flashShowingNumber, setFlashShowingNumber] = useState(null); // Số đang hiện trên màn hình
  const flashInputRef = useRef(null);
  const flashTimeoutRef = useRef(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Fetch user tier
  useEffect(() => {
    const fetchTier = async () => {
      try {
        const res = await fetch('/api/tier');
        const data = await res.json();
        if (data.tier) {
          setUserTier(data.tier);
        }
      } catch (error) {
        console.error('Error fetching tier:', error);
      }
    };
    fetchTier();
  }, []);

  // Cleanup Flash Anzan timeouts
  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (problem && result === null) {
      intervalRef.current = setInterval(() => {
        timerRef.current += 1;
        setDisplayTimer(timerRef.current);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [problem, result]);

  // Clear celebration after animation
  useEffect(() => {
    if (celebration) {
      const timer = setTimeout(() => {
        setCelebration(null);
        setCelebrationData(null);
        // Auto chuyển câu sau khi ăn mừng - CHỈ cho mode thường, KHÔNG áp dụng cho Flash Anzan
        if (celebration === 'correct' && mode !== 'flashAnzan') {
          goToNextChallenge();
        }
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [celebration, mode]);

  // Auto-focus input cho mode Siêu Trí Tuệ và bắt phím số toàn cục
  useEffect(() => {
    if (mode === 'mentalMath' && mentalSubMode && result === null) {
      // Focus ngay khi vào mode
      mentalInputRef.current?.focus();
      
      // Bắt phím số toàn cục để trẻ em không cần click vào input
      const handleGlobalKeyDown = (e) => {
        // Chỉ xử lý khi đang ở mode mental và chưa có kết quả
        if (mode !== 'mentalMath' || !mentalSubMode || result !== null) return;
        
        // Nếu là số (0-9)
        if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          setMentalAnswer(prev => prev + e.key);
          mentalInputRef.current?.focus();
        }
        // Backspace để xóa
        else if (e.key === 'Backspace') {
          e.preventDefault();
          setMentalAnswer(prev => prev.slice(0, -1));
          mentalInputRef.current?.focus();
        }
        // Enter để submit
        else if (e.key === 'Enter') {
          e.preventDefault();
          handleMentalSubmit();
        }
        // Minus cho số âm (nếu cần)
        else if (e.key === '-' && mentalAnswer === '') {
          e.preventDefault();
          setMentalAnswer('-');
          mentalInputRef.current?.focus();
        }
      };
      
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }
  }, [mode, mentalSubMode, result, mentalAnswer]);

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">⚔️</div>
          <div className="text-white font-bold">Đang tải...</div>
        </div>
      </div>
    );
  }

  const generateProblem = (modeType, diff) => {
    const randRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Độ khó theo số chữ số: 1⭐=1 chữ số, 2⭐=2 chữ số, ...
    const digitRanges = {
      1: { min: 1, max: 9 },
      2: { min: 10, max: 99 },
      3: { min: 100, max: 999 },
      4: { min: 1000, max: 9999 },
      5: { min: 10000, max: 99999 }
    };

    // Tối đa 3 số hạng
    const termCounts = { 1: 2, 2: 2, 3: 3, 4: 3, 5: 3 };
    
    const mulDivRanges = {
      1: { mulMax: 9, divMax: 9 },
      2: { mulMax: 12, divMax: 12 },
      3: { mulMax: 20, divMax: 15 },
      4: { mulMax: 30, divMax: 20 },
      5: { mulMax: 50, divMax: 30 }
    };

    const range = digitRanges[diff];
    const termCount = termCounts[diff];
    const mulDiv = mulDivRanges[diff];
    
    let answer, displayProblem, numbers = [], operations = [];

    switch (modeType) {
      case 'addition': {
        // Tối đa 3 số hạng
        const count = Math.min(3, 2 + Math.floor(Math.random() * 2));
        for (let i = 0; i < count; i++) {
          numbers.push(randRange(range.min, range.max));
        }
        answer = numbers.reduce((a, b) => a + b, 0);
        displayProblem = numbers.join(' + ');
        break;
      }
      case 'subtraction': {
        // Tối đa 3 số hạng
        const count = Math.min(3, 2 + Math.floor(Math.random() * 2));
        let total = randRange(range.max, range.max * 2);
        numbers.push(total);
        for (let i = 1; i < count; i++) {
          const maxSub = Math.floor(total * 0.4);
          const sub = randRange(range.min, Math.max(range.min, maxSub));
          numbers.push(sub);
          total -= sub;
        }
        answer = numbers.reduce((a, b, i) => i === 0 ? b : a - b, 0);
        displayProblem = numbers.join(' - ');
        break;
      }
      case 'addSubMixed': {
        // Tối đa 3 số hạng
        const count = Math.min(3, 2 + Math.floor(Math.random() * 2));
        let runningTotal = randRange(range.max, range.max * 2);
        numbers.push(runningTotal);
        for (let i = 1; i < count; i++) {
          const useAdd = Math.random() > 0.5;
          if (useAdd) {
            const num = randRange(range.min, range.max);
            numbers.push(num);
            operations.push('+');
            runningTotal += num;
          } else {
            const maxSub = Math.floor(runningTotal * 0.3);
            const num = randRange(range.min, Math.max(range.min, maxSub));
            numbers.push(num);
            operations.push('-');
            runningTotal -= num;
          }
        }
        answer = runningTotal;
        displayProblem = numbers[0] + operations.map((op, i) => ` ${op} ${numbers[i + 1]}`).join('');
        break;
      }
      case 'multiplication': {
        const num1 = randRange(2, mulDiv.mulMax);
        const num2 = randRange(2, mulDiv.mulMax);
        answer = num1 * num2;
        displayProblem = `${num1} × ${num2}`;
        break;
      }
      case 'division': {
        const divisor = randRange(2, mulDiv.divMax);
        const quotient = randRange(2, Math.min(mulDiv.divMax, Math.floor(range.max / divisor)));
        const dividend = divisor * quotient;
        answer = quotient;
        displayProblem = `${dividend} ÷ ${divisor}`;
        break;
      }
      case 'mulDiv': {
        if (Math.random() > 0.5) {
          const num1 = randRange(2, mulDiv.mulMax);
          const num2 = randRange(2, mulDiv.mulMax);
          answer = num1 * num2;
          displayProblem = `${num1} × ${num2}`;
        } else {
          const divisor = randRange(2, mulDiv.divMax);
          const quotient = randRange(2, Math.min(mulDiv.divMax, Math.floor(range.max / divisor)));
          const dividend = divisor * quotient;
          answer = quotient;
          displayProblem = `${dividend} ÷ ${divisor}`;
        }
        break;
      }
      case 'mixed': {
        const modes = ['addition', 'subtraction', 'addSubMixed', 'multiplication', 'division', 'mulDiv'];
        return generateProblem(modes[Math.floor(Math.random() * modes.length)], diff);
      }
    }

    const baseTime = diff * 10 + 10;
    const complexity = (displayProblem?.match(/[+\-×÷]/g) || []).length;
    
    return { numbers, operations, answer, displayProblem, recommendedTime: baseTime + complexity * 5 };
  };

  const startMode = (selectedMode) => {
    // Nếu là mentalMath, cần chọn sub-mode trước
    if (selectedMode === 'mentalMath') {
      setMode('mentalMath');
      setMentalSubMode(null); // Reset sub-mode để hiện màn chọn
      return;
    }
    
    // Nếu là flashAnzan, cần chọn level trước
    if (selectedMode === 'flashAnzan') {
      setMode('flashAnzan');
      setFlashLevel(null); // Reset để hiện màn chọn level
      setFlashPhase('idle');
      return;
    }
    
    setMode(selectedMode);
    setProblem(generateProblem(selectedMode, difficulty));
    setSorobanValue(0);
    setMentalAnswer('');
    setResult(null);
    timerRef.current = 0;
    setDisplayTimer(0);
    setSessionStats({ stars: 0, correct: 0, total: 0, totalTime: 0 });
    setStreak(0);
    setMaxStreak(0);
    setCurrentChallenge(1);
    setChallengeResults([]);
    setGameComplete(false);
    setSorobanKey(prev => prev + 1);
  };

  const startMentalMode = (subMode) => {
    setMentalSubMode(subMode);
    const actualMode = subMode === 'mixed' ? getRandomMentalMode() : subMode;
    setProblem(generateProblem(actualMode, difficulty));
    setSorobanValue(0);
    setMentalAnswer('');
    setResult(null);
    timerRef.current = 0;
    setDisplayTimer(0);
    setSessionStats({ stars: 0, correct: 0, total: 0, totalTime: 0 });
    setStreak(0);
    setMaxStreak(0);
    setCurrentChallenge(1);
    setChallengeResults([]);
    setGameComplete(false);
    setSorobanKey(prev => prev + 1);
    setTimeout(() => mentalInputRef.current?.focus(), 100);
  };

  const getRandomMentalMode = () => {
    const modes = ['addition', 'subtraction', 'multiplication', 'division', 'addSubMixed'];
    return modes[Math.floor(Math.random() * modes.length)];
  };

  // ================== FLASH ANZAN FUNCTIONS ==================
  
  // Tạo số ngẫu nhiên cho Flash Anzan
  const generateFlashNumbers = (level) => {
    const config = flashLevels.find(l => l.id === level);
    if (!config) return [];
    
    const count = config.numbers[0] + Math.floor(Math.random() * (config.numbers[1] - config.numbers[0] + 1));
    const numbers = [];
    
    const maxDigit = Math.pow(10, config.digits) - 1;
    const minDigit = config.digits === 1 ? 1 : Math.pow(10, config.digits - 1);
    
    for (let i = 0; i < count; i++) {
      numbers.push(Math.floor(Math.random() * (maxDigit - minDigit + 1)) + minDigit);
    }
    
    return numbers;
  };
  
  // Bắt đầu Flash Anzan với cấp độ đã chọn
  const startFlashAnzan = (levelId) => {
    const config = flashLevels.find(l => l.id === levelId);
    if (!config) return;
    
    setFlashLevel(levelId);
    setFlashPhase('countdown');
    setFlashCountdown(3);
    setFlashAnswer('');
    setFlashCurrentIndex(0);
    setFlashShowingNumber(null);
    
    const numbers = generateFlashNumbers(levelId);
    setFlashNumbers(numbers);
    const correctAnswer = numbers.reduce((a, b) => a + b, 0);
    console.log('Generated Flash:', { numbers, correctAnswer, sum: numbers.join('+') });
    setFlashCorrectAnswer(correctAnswer);
    
    // Reset session stats cho round mới
    if (currentChallenge === 1 && challengeResults.length === 0) {
      setSessionStats({ stars: 0, correct: 0, total: 0, totalTime: 0 });
      setStreak(0);
      setMaxStreak(0);
    }
    
    // Bắt đầu đếm ngược
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      setFlashCountdown(count);
      if (count === 0) {
        clearInterval(countdownInterval);
        // Bắt đầu hiện số
        setTimeout(() => {
          setFlashPhase('showing');
          showFlashNumber(0, numbers, config);
        }, 500);
      }
    }, 1000);
  };
  
  // Hiện số từng cái một
  const showFlashNumber = (index, numbers, config) => {
    if (index >= numbers.length) {
      // Đã hiện hết số, chuyển sang phase trả lời
      setFlashPhase('answer');
      setFlashShowingNumber(null);
      setTimeout(() => flashInputRef.current?.focus(), 100);
      return;
    }
    
    setFlashCurrentIndex(index);
    setFlashShowingNumber(numbers[index]);
    
    // Tính speed (giây/số)
    const speed = config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]);
    
    flashTimeoutRef.current = setTimeout(() => {
      setFlashShowingNumber(null);
      // Hiện số tiếp theo sau khoảng trống nhỏ
      flashTimeoutRef.current = setTimeout(() => {
        showFlashNumber(index + 1, numbers, config);
      }, 100);
    }, speed * 1000);
  };
  
  // Xử lý submit đáp án Flash Anzan
  const handleFlashSubmit = async () => {
    const userAnswer = parseInt(flashAnswer, 10);
    if (isNaN(userAnswer)) return;
    
    // Debug log
    console.log('Flash Submit:', { 
      userAnswer, 
      flashCorrectAnswer, 
      flashAnswerRaw: flashAnswer,
      isEqual: userAnswer === flashCorrectAnswer,
      types: { user: typeof userAnswer, correct: typeof flashCorrectAnswer }
    });
    
    const isCorrect = userAnswer === flashCorrectAnswer;
    const config = flashLevels.find(l => l.id === flashLevel);
    const starsEarned = isCorrect ? (config?.stars || 2) : 0;
    
    setFlashPhase('result');
    setResult(isCorrect);
    
    // Cập nhật stats
    const newStreak = isCorrect ? streak + 1 : 0;
    if (newStreak > maxStreak) setMaxStreak(newStreak);
    setStreak(newStreak);
    
    setChallengeResults(prev => [...prev, isCorrect ? 'correct' : 'wrong']);
    setSessionStats(prev => ({
      stars: prev.stars + starsEarned,
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      totalTime: prev.totalTime + (flashNumbers.length * 2) // Ước tính thời gian
    }));
    
    // KHÔNG dùng celebration popup chung cho Flash Anzan
    // Hiệu ứng sẽ được hiển thị trực tiếp trong result phase
    
    // Lưu kết quả
    try {
      await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseType: 'flashAnzan',
          difficulty: flashLevels.findIndex(l => l.id === flashLevel) + 1,
          problem: flashNumbers.join(' + '),
          userAnswer: userAnswer.toString(),
          correctAnswer: flashCorrectAnswer.toString(),
          isCorrect,
          timeTaken: flashNumbers.length * 2
        })
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  // Chuyển câu tiếp theo trong Flash Anzan
  const nextFlashChallenge = () => {
    if (currentChallenge >= TOTAL_CHALLENGES) {
      setGameComplete(true);
      return;
    }
    
    setCurrentChallenge(prev => prev + 1);
    setResult(null);
    setCelebration(null);
    setCelebrationData(null);
    
    // Bắt đầu round mới
    startFlashAnzan(flashLevel);
  };
  
  // Restart Flash Anzan game
  const restartFlashGame = () => {
    setCurrentChallenge(1);
    setChallengeResults([]);
    setSessionStats({ stars: 0, correct: 0, total: 0, totalTime: 0 });
    setStreak(0);
    setMaxStreak(0);
    setGameComplete(false);
    setResult(null);
    startFlashAnzan(flashLevel);
  };

  const handleSorobanChange = (value) => {
    setSorobanValue(value);
    // Auto-check khi đáp án đúng
    if (value === problem?.answer && result === null) {
      autoCheckAnswer(value);
    }
  };

  const autoCheckAnswer = async (value) => {
    const isCorrect = value === problem.answer;
    setResult(isCorrect);
    const timeTaken = timerRef.current;

    const timeRatio = timeTaken / problem?.recommendedTime;
    const newStreak = isCorrect ? streak + 1 : 0;
    
    // Xác định tier dựa trên tốc độ (cho hiển thị animation)
    let speedTier;
    if (timeRatio <= speedTiers.godlike.threshold) {
      speedTier = speedTiers.godlike;
    } else if (timeRatio <= speedTiers.fast.threshold) {
      speedTier = speedTiers.fast;
    } else if (timeRatio <= speedTiers.good.threshold) {
      speedTier = speedTiers.good;
    } else {
      speedTier = speedTiers.normal;
    }
    
    // Tính sao tạm thời cho hiển thị instant feedback
    const instantStars = isCorrect ? Math.round((1 + difficulty) * speedTier.multiplier) : 0;

    // Lưu kết quả câu này
    setChallengeResults(prev => [...prev, isCorrect ? 'correct' : 'wrong']);

    if (isCorrect) {
      // Cập nhật max streak
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
      
      // Chọn thông điệp ngẫu nhiên từ tier tương ứng
      const msgIndex = Math.floor(Math.random() * speedTier.messages.length);
      const selectedMessage = speedTier.messages[msgIndex];
      
      let celebData = { 
        text: selectedMessage.text, 
        emoji: selectedMessage.emoji, 
        starsEarned: instantStars,
        multiplier: speedTier.multiplier,
        tierColor: speedTier.color,
        tierTextColor: speedTier.textColor,
        timeRatio
      };
      
      // Kiểm tra streak bonus
      const streakBonus = streakMessages.find(s => s.streak === newStreak);
      if (streakBonus) {
        celebData = { ...celebData, streakBonus };
      }
      
      setCelebrationData(celebData);
      setCelebration('correct');
      setStreak(newStreak);
    } else {
      setStreak(0);
    }

    // Cập nhật stats: track totalTime và correct/total
    setSessionStats(prev => ({
      stars: prev.stars + instantStars, // Tạm thời cho display
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      totalTime: prev.totalTime + timeTaken
    }));

    try {
      await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseType: mode,
          difficulty,
          problem: problem.displayProblem,
          userAnswer: value.toString(),
          correctAnswer: problem.answer.toString(),
          isCorrect,
          timeTaken
        })
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const goToNextChallenge = () => {
    if (currentChallenge >= TOTAL_CHALLENGES) {
      // Hoàn thành màn chơi
      setGameComplete(true);
      return;
    }
    
    // Reset và sang câu tiếp
    setCurrentChallenge(prev => prev + 1);
    
    let actualMode;
    if (mode === 'mentalMath') {
      actualMode = mentalSubMode === 'mixed' ? getRandomMentalMode() : mentalSubMode;
    } else {
      actualMode = mode;
    }
    
    setProblem(generateProblem(actualMode, difficulty));
    setSorobanValue(0);
    setMentalAnswer('');
    setResult(null);
    timerRef.current = 0;
    setDisplayTimer(0);
    setSorobanKey(prev => prev + 1); // Reset Soroban
    
    // Focus vào input nếu là mental math
    if (mode === 'mentalMath') {
      setTimeout(() => mentalInputRef.current?.focus(), 100);
    }
  };

  const nextProblem = () => {
    goToNextChallenge();
  };

  const skipProblem = () => {
    // Hiện đáp án, cho phép xem lại, không tự chuyển bài
    setResult(false);
    setStreak(0);
    setChallengeResults(prev => [...prev, 'skipped']);
    setSessionStats(prev => ({ ...prev, total: prev.total + 1 }));
  };

  const resetSoroban = () => {
    setSorobanKey(prev => prev + 1);
    setSorobanValue(0);
  };

  const restartGame = () => {
    setCurrentChallenge(1);
    setChallengeResults([]);
    
    let actualMode;
    if (mode === 'mentalMath') {
      actualMode = mentalSubMode === 'mixed' ? getRandomMentalMode() : mentalSubMode;
    } else {
      actualMode = mode;
    }
    
    setProblem(generateProblem(actualMode, difficulty));
    setSorobanValue(0);
    setMentalAnswer('');
    setResult(null);
    timerRef.current = 0;
    setDisplayTimer(0);
    setSessionStats({ stars: 0, correct: 0, total: 0, totalTime: 0 });
    setStreak(0);
    setMaxStreak(0);
    setGameComplete(false);
    setSorobanKey(prev => prev + 1);
    
    if (mode === 'mentalMath') {
      setTimeout(() => mentalInputRef.current?.focus(), 100);
    }
  };

  // Xử lý submit đáp án cho mode Siêu Trí Tuệ
  const handleMentalSubmit = () => {
    const answer = parseInt(mentalAnswer, 10);
    if (isNaN(answer) || result !== null) return;
    autoCheckAnswer(answer);
  };

  const handleMentalKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleMentalSubmit();
    }
  };

  // Lấy thông tin mode hiện tại
  const currentModeInfo = mode ? modeInfo[mode] : null;
  const isMentalMode = mode === 'mentalMath';
  const isFlashMode = mode === 'flashAnzan';

  // Sub-mode info cho Siêu Trí Tuệ
  const mentalSubModes = [
    { id: 'addition', title: 'Cộng', icon: '➕', color: 'from-emerald-400 to-green-500' },
    { id: 'subtraction', title: 'Trừ', icon: '➖', color: 'from-blue-400 to-cyan-500' },
    { id: 'multiplication', title: 'Nhân', icon: '✖️', color: 'from-purple-400 to-pink-500' },
    { id: 'division', title: 'Chia', icon: '➗', color: 'from-rose-400 to-red-500' },
    { id: 'addSubMixed', title: 'Cộng Trừ', icon: '🔀', color: 'from-teal-400 to-emerald-500' },
    { id: 'mulDiv', title: 'Nhân Chia', icon: '🎲', color: 'from-amber-400 to-orange-500' },
    { id: 'mixed', title: 'Tất Cả', icon: '🌈', color: 'from-indigo-500 to-purple-600' },
  ];

  // Màn hình chọn sub-mode cho Siêu Trí Tuệ
  if (mode === 'mentalMath' && !mentalSubMode) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMode(null)}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur rounded-xl text-white hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={18} />
            <span className="font-medium text-sm">Quay lại</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span className="text-2xl">🧠</span> Siêu Trí Tuệ
          </h1>
          <div className="w-20"></div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col px-4 pb-4 min-h-0">
          {/* Difficulty selector */}
          <div className="flex-shrink-0 bg-white/10 backdrop-blur rounded-2xl p-3 mb-3">
            <h3 className="text-sm font-bold text-white/80 mb-2 text-center">🎯 Cấp Độ</h3>
            <div className="flex justify-center gap-2">
              {[
                { level: 1, label: 'Tập Sự', emoji: '🐣', color: 'from-green-400 to-emerald-500' },
                { level: 2, label: 'Chiến Binh', emoji: '⚔️', color: 'from-blue-400 to-cyan-500' },
                { level: 3, label: 'Dũng Sĩ', emoji: '🛡️', color: 'from-yellow-400 to-orange-500' },
                { level: 4, label: 'Cao Thủ', emoji: '🔥', color: 'from-orange-400 to-red-500' },
                { level: 5, label: 'Huyền Thoại', emoji: '👑', color: 'from-purple-400 to-pink-500' }
              ].map(item => (
                <button
                  key={item.level}
                  onClick={() => setDifficulty(item.level)}
                  className={`relative px-3 py-2 rounded-xl font-bold transition-all transform hover:scale-105 ${
                    difficulty === item.level
                      ? `bg-gradient-to-br ${item.color} text-white shadow-lg scale-110 ring-2 ring-white`
                      : 'bg-white/20 text-white/80 hover:bg-white/30'
                  }`}
                >
                  <div className="text-2xl">{item.emoji}</div>
                  <div className="text-xs font-semibold mt-1">{item.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-mode selection */}
          <div className="flex-shrink-0 mb-3">
            <h3 className="text-sm font-bold text-white/80 mb-2 text-center">🧮 Chọn Phép Tính</h3>
          </div>

          {/* Sub-mode grid */}
          <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 gap-3 auto-rows-fr">
            {mentalSubModes.map(item => (
              <button
                key={item.id}
                onClick={() => startMentalMode(item.id)}
                className={`bg-gradient-to-br ${item.color} rounded-2xl p-3 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-95 transition-all text-white flex flex-col items-center justify-center relative overflow-hidden group ${
                  item.id === 'mixed' ? 'col-span-3 sm:col-span-1 ring-2 ring-yellow-400' : ''
                }`}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all"></div>
                <div className="text-4xl sm:text-5xl mb-2 drop-shadow-lg z-10">{item.icon}</div>
                <div className="text-base sm:text-lg font-black z-10">{item.title}</div>
                {item.id === 'mixed' && (
                  <div className="text-xs opacity-80 z-10">Random!</div>
                )}
              </button>
            ))}
          </div>

          {/* Hint */}
          <div className="flex-shrink-0 mt-3 text-center">
            <p className="text-white/60 text-sm">
              💡 Tính nhẩm không cần bàn tính - Thử thách trí não của bạn!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ================== FLASH ANZAN SCREENS ==================
  
  // Màn hình chọn cấp độ Flash Anzan
  if (mode === 'flashAnzan' && !flashLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setMode(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-xl text-white hover:bg-white/20 transition-all"
            >
              <ArrowLeft size={18} />
              <span className="font-medium">Quay lại</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <span className="text-3xl">⚡</span> Flash Anzan
            </h1>
            <div className="w-24"></div>
          </div>

          {/* Mô tả */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6 text-center">
            <div className="text-5xl mb-3">🧠</div>
            <h2 className="text-xl font-bold text-white mb-2">Luyện Tập Flash Anzan</h2>
            <p className="text-white/80 text-sm">
              Nhìn số xuất hiện nhanh, ghi nhớ và tính tổng!
            </p>
            <div className="flex justify-center items-center gap-6 mt-4 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">👀</span>
                <span>Nhìn số</span>
              </div>
              <div>→</div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🧠</span>
                <span>Ghi nhớ</span>
              </div>
              <div>→</div>
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span>Tính tổng</span>
              </div>
            </div>
          </div>

          {/* Chọn cấp độ */}
          <div className="mb-4">
            <h3 className="text-white/80 font-bold text-center mb-4">🎯 Chọn cấp độ thử thách</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {flashLevels.map((level, index) => (
              <button
                key={level.id}
                onClick={() => {
                  setCurrentChallenge(1);
                  setChallengeResults([]);
                  setGameComplete(false);
                  startFlashAnzan(level.id);
                }}
                className={`bg-gradient-to-br ${level.color} rounded-2xl p-4 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all text-white flex flex-col items-center justify-center relative overflow-hidden group`}
              >
                {index === 0 && (
                  <div className="absolute top-1 right-1 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Gợi ý
                  </div>
                )}
                <div className="text-4xl mb-2">{level.emoji}</div>
                <div className="font-black text-lg">{level.name}</div>
                <div className="text-xs opacity-80 text-center mt-1">
                  {level.numbers[0]}-{level.numbers[1]} số • {level.digits} chữ số • {level.speed[0]}-{level.speed[1]}s/số
                </div>
                <div className="flex items-center gap-1 mt-2 bg-white/20 px-2 py-0.5 rounded-full">
                  <span className="text-yellow-300">⭐</span>
                  <span className="text-xs font-bold">x{level.stars}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Hint */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              💡 Mẹo: Bắt đầu với <span className="text-yellow-400 font-bold">Tia Sáng</span> để làm quen, sau đó tăng dần độ khó!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Màn hình chơi Flash Anzan
  if (mode === 'flashAnzan' && flashLevel && !gameComplete) {
    const config = flashLevels.find(l => l.id === flashLevel);
    
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-900 via-orange-900 to-red-900">
        {/* Celebration Popup */}
        {celebration === 'correct' && celebrationData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center animate-scale-up">
              <div className="text-7xl sm:text-8xl mb-3 animate-bounce drop-shadow-2xl">
                {celebrationData.emoji}
              </div>
              <div className={`text-3xl sm:text-4xl font-black mb-2 drop-shadow-lg animate-pulse ${celebrationData.tierTextColor}`}>
                {celebrationData.text}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(Math.min(5, celebrationData.starsEarned))].map((_, i) => (
                  <span key={i} className="text-3xl animate-spin-slow" style={{ animationDelay: `${i * 0.1}s` }}>
                    ⭐
                  </span>
                ))}
              </div>
              <div className={`text-xl sm:text-2xl font-bold ${celebrationData.tierTextColor}`}>
                +{celebrationData.starsEarned} sao
              </div>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className={`bg-gradient-to-r ${config?.color || 'from-yellow-500 to-orange-600'} shadow-lg flex-shrink-0`}>
          <div className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-3">
            {/* Left */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button 
                onClick={() => {
                  if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
                  setMode(null);
                  setFlashLevel(null);
                  setFlashPhase('idle');
                }} 
                className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                <span className="text-sm font-medium">Thoát</span>
              </button>
            </div>
            
            {/* Center: Info */}
            <div className="flex-1 text-center">
              <div className="text-white font-black text-lg flex items-center justify-center gap-2">
                <span>⚡</span> {config?.name} <span>{config?.emoji}</span>
              </div>
              <div className="text-white/70 text-xs">
                Cấp {flashLevels.findIndex(l => l.id === flashLevel) + 1} - {difficultyInfo[1]?.label}
              </div>
            </div>
            
            {/* Right: Progress */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-white/80 text-sm">
                Câu {currentChallenge}/{TOTAL_CHALLENGES}
              </div>
              <div className="bg-yellow-400/90 text-yellow-900 px-2 py-0.5 rounded-full font-bold text-xs shadow">
                ⭐ {sessionStats.stars}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex-shrink-0 bg-black/20 px-3 py-2">
          <div className="flex gap-1 max-w-6xl mx-auto">
            {[...Array(TOTAL_CHALLENGES)].map((_, i) => {
              const resultStatus = challengeResults[i];
              let dotClass = 'bg-white/30';
              if (i < currentChallenge - 1) {
                dotClass = resultStatus === 'correct' ? 'bg-green-400' : 'bg-red-400';
              } else if (i === currentChallenge - 1 && flashPhase !== 'idle') {
                dotClass = 'bg-white animate-pulse';
              }
              return <div key={i} className={`h-2 flex-1 rounded-full ${dotClass}`} />;
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          
          {/* Countdown phase */}
          {flashPhase === 'countdown' && (
            <div className="text-center">
              <div className="text-9xl font-black text-yellow-400 animate-pulse mb-4">
                {flashCountdown}
              </div>
              <p className="text-white text-xl font-bold">Chuẩn bị nhìn số!</p>
              <div className="flex items-center justify-center gap-4 mt-4 text-white/70">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <span>📊</span>
                  <span>{flashNumbers.length} số</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <span>⚡</span>
                  <span>{config?.speed[0]}-{config?.speed[1]}s/số</span>
                </div>
              </div>
            </div>
          )}

          {/* Showing numbers phase */}
          {flashPhase === 'showing' && (
            <div className="text-center">
              {flashShowingNumber !== null ? (
                <div className="text-8xl sm:text-9xl font-black text-white animate-pulse drop-shadow-2xl">
                  {flashShowingNumber}
                </div>
              ) : (
                <div className="text-6xl text-white/30">...</div>
              )}
              <div className="mt-4 text-white/60 text-sm">
                Số {flashCurrentIndex + 1}/{flashNumbers.length}
              </div>
            </div>
          )}

          {/* Answer phase */}
          {flashPhase === 'answer' && (
            <div className="text-center w-full max-w-md">
              <div className="text-5xl mb-4">🧠</div>
              <h2 className="text-2xl font-bold text-white mb-2">Tổng là bao nhiêu?</h2>
              <div className="flex items-center justify-center gap-4 mb-6 text-white/70 text-sm">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <span>📊</span>
                  <span>{flashNumbers.length} số đã hiện</span>
                </div>
              </div>
              
              {/* Input */}
              <input
                ref={flashInputRef}
                type="text"
                inputMode="numeric"
                value={flashAnswer}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value)) {
                    setFlashAnswer(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && flashAnswer) {
                    handleFlashSubmit();
                  }
                }}
                placeholder="?"
                autoFocus
                className="w-full text-4xl font-black text-center py-4 px-6 rounded-2xl bg-white/90 text-amber-900 outline-none focus:ring-4 focus:ring-yellow-400"
              />
              
              {/* Submit button */}
              <button
                onClick={handleFlashSubmit}
                disabled={!flashAnswer}
                className="mt-4 w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl rounded-2xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                ⚡ Trả lời
              </button>
              
              <p className="mt-3 text-white/50 text-sm">
                💡 Nhấn Enter để trả lời nhanh
              </p>
            </div>
          )}

          {/* Result phase */}
          {flashPhase === 'result' && (
            <div className="text-center w-full max-w-lg">
              {result ? (
                // ========== ĐÚNG - Màn hình chúc mừng ==========
                <div className="animate-scale-up">
                  {/* Confetti effect */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute animate-bounce"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 60}%`,
                          animationDelay: `${Math.random() * 0.5}s`,
                          animationDuration: `${0.5 + Math.random()}s`
                        }}
                      >
                        {['⭐', '✨', '🌟', '💫', '⚡'][Math.floor(Math.random() * 5)]}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-8xl mb-4 animate-bounce drop-shadow-2xl">🎉</div>
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-green-400 to-cyan-400 mb-3 animate-pulse">
                    TUYỆT VỜI!
                  </div>
                  
                  {/* Stars earned */}
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(Math.min(5, flashLevels.find(l => l.id === flashLevel)?.stars || 2))].map((_, i) => (
                      <span key={i} className="text-4xl animate-spin-slow" style={{ animationDelay: `${i * 0.1}s` }}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <div className="text-2xl font-bold text-yellow-400 mb-4">
                    +{flashLevels.find(l => l.id === flashLevel)?.stars || 2} sao
                  </div>
                  
                  {/* Correct answer display */}
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-2xl p-4 mb-4">
                    <div className="text-white/70 text-sm mb-1">Đáp án của bạn</div>
                    <div className="text-5xl font-black text-green-400">{flashAnswer}</div>
                    <div className="text-green-400 text-lg mt-1">✓ Chính xác!</div>
                  </div>
                  
                  {/* Show numbers */}
                  <div className="bg-white/5 rounded-xl p-3 mb-4">
                    <div className="text-white/60 text-sm mb-2">Các số đã hiện:</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {flashNumbers.map((num, i) => (
                        <span key={i} className="bg-yellow-500/30 text-yellow-200 px-3 py-1 rounded-lg font-bold">
                          {num}
                        </span>
                      ))}
                    </div>
                    <div className="text-white/50 text-xs mt-2">
                      {flashNumbers.join(' + ')} = {flashCorrectAnswer}
                    </div>
                  </div>
                  
                  {/* Streak bonus */}
                  {streak > 1 && (
                    <div className="text-xl text-orange-400 font-bold mb-4 animate-pulse">
                      🔥 Combo x{streak}!
                    </div>
                  )}
                  
                  <button
                    onClick={nextFlashChallenge}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-2xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-green-500/30"
                  >
                    {currentChallenge >= TOTAL_CHALLENGES ? '🏆 Xem kết quả' : '⚡ Câu tiếp theo'}
                  </button>
                </div>
              ) : (
                // ========== SAI - Màn hình hiện đáp án và replay ==========
                <div className="animate-scale-up">
                  <div className="text-7xl mb-3">😢</div>
                  <div className="text-3xl font-black text-red-400 mb-4">
                    CHƯA ĐÚNG RỒI!
                  </div>
                  
                  {/* So sánh đáp án */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-red-500/20 border-2 border-red-400/50 rounded-2xl p-4">
                      <div className="text-white/70 text-sm mb-1">Bạn trả lời</div>
                      <div className="text-4xl font-black text-red-400">{flashAnswer}</div>
                      <div className="text-red-400 text-sm mt-1">✗ Sai</div>
                    </div>
                    <div className="bg-green-500/20 border-2 border-green-400/50 rounded-2xl p-4">
                      <div className="text-white/70 text-sm mb-1">Đáp án đúng</div>
                      <div className="text-4xl font-black text-green-400">{flashCorrectAnswer}</div>
                      <div className="text-green-400 text-sm mt-1">✓ Chính xác</div>
                    </div>
                  </div>
                  
                  {/* Replay các số */}
                  <div className="bg-white/10 rounded-2xl p-4 mb-4">
                    <div className="text-white/80 font-bold mb-3 flex items-center justify-center gap-2">
                      <span>📺</span> Các số vừa hiện:
                    </div>
                    
                    {/* Hiển thị từng số với animation */}
                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      {flashNumbers.map((num, i) => (
                        <div 
                          key={i} 
                          className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl font-black text-2xl shadow-lg animate-scale-up"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                    
                    {/* Phép tính đầy đủ */}
                    <div className="bg-black/30 rounded-xl p-3 mt-3">
                      <div className="text-white/60 text-sm mb-2">Phép tính:</div>
                      <div className="text-xl text-white font-mono flex items-center justify-center flex-wrap gap-1">
                        {flashNumbers.map((num, i) => (
                          <span key={i}>
                            <span className="text-yellow-400">{num}</span>
                            {i < flashNumbers.length - 1 && <span className="text-white/60 mx-1">+</span>}
                          </span>
                        ))}
                        <span className="text-white/60 mx-2">=</span>
                        <span className="text-green-400 font-black">{flashCorrectAnswer}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lời động viên */}
                  <div className="text-white/70 text-sm mb-4">
                    💪 Đừng nản chí! Luyện tập nhiều sẽ giỏi hơn!
                  </div>
                  
                  <button
                    onClick={nextFlashChallenge}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xl rounded-2xl hover:scale-105 active:scale-95 transition-transform shadow-lg"
                  >
                    {currentChallenge >= TOTAL_CHALLENGES ? '🏆 Xem kết quả' : '💪 Thử câu tiếp'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom stats */}
        <div className="flex-shrink-0 bg-black/30 px-4 py-3">
          <div className="max-w-6xl mx-auto flex justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-black text-yellow-400">{sessionStats.stars}</div>
              <div className="text-white/60 text-xs">⭐ Sao</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-green-400">{sessionStats.correct}/{sessionStats.total}</div>
              <div className="text-white/60 text-xs">✓ Đúng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-orange-400">{streak}</div>
              <div className="text-white/60 text-xs">🔥 Combo</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Complete Screen cho Flash Anzan
  if (mode === 'flashAnzan' && gameComplete) {
    const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
    const grade = accuracy >= 90 ? 'S' : accuracy >= 70 ? 'A' : accuracy >= 50 ? 'B' : 'C';
    const gradeColors = { S: 'text-yellow-400', A: 'text-green-400', B: 'text-blue-400', C: 'text-gray-400' };
    const gradeEmojis = { S: '👑', A: '🌟', B: '⭐', C: '💪' };
    const gradeTexts = { S: 'XUẤT SẮC!', A: 'GIỎI LẮM!', B: 'KHÁ TỐT!', C: 'CỐ GẮNG THÊM!' };
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 max-w-md w-full text-center">
          <div className="text-6xl mb-3 animate-bounce">{gradeEmojis[grade]}</div>
          <h1 className="text-3xl font-black text-white mb-1">HOÀN THÀNH!</h1>
          <p className="text-white/70 mb-3">Flash Anzan - {flashLevels.find(l => l.id === flashLevel)?.name}</p>
          
          <div className={`text-5xl font-black ${gradeColors[grade]} mb-4`}>
            {gradeTexts[grade]}
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl">⭐</div>
              <div className="text-2xl font-black text-yellow-400">{sessionStats.stars}</div>
              <div className="text-xs text-white/60">Sao</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl">✓</div>
              <div className="text-2xl font-black text-green-400">{sessionStats.correct}/{TOTAL_CHALLENGES}</div>
              <div className="text-xs text-white/60">Đúng</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl">🔥</div>
              <div className="text-2xl font-black text-orange-400">{maxStreak}</div>
              <div className="text-xs text-white/60">Combo</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={restartFlashGame}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-transform"
            >
              🔄 Chơi lại
            </button>
            <button
              onClick={() => {
                setFlashLevel(null);
                setFlashPhase('idle');
                setGameComplete(false);
              }}
              className="flex-1 py-3 px-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors"
            >
              📋 Chọn cấp
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mode selection screen - Game hóa, vừa đủ màn hình
  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Header - compact */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/dashboard"
              prefetch={true}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur rounded-xl text-white hover:bg-white/20 transition-all"
            >
              <Home size={18} />
              <span className="font-medium text-sm">Trang chủ</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="text-2xl">⚔️</span> Đấu Trường Luyện Tập
            </h1>
            <div className="w-20"></div>
          </div>

          {/* Difficulty selector with descriptions */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-4">
            <h3 className="text-sm font-bold text-white/80 mb-3 text-center">🎯 Chọn Cấp Độ</h3>
            <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
              {[
                { level: 1, label: 'Tập Sự', emoji: '🐣', color: 'from-green-400 to-emerald-500', desc: 'Số 1-9, 2 số hạng' },
                { level: 2, label: 'Chiến Binh', emoji: '⚔️', color: 'from-blue-400 to-cyan-500', desc: 'Số 1-50, 3 số hạng' },
                { level: 3, label: 'Dũng Sĩ', emoji: '🛡️', color: 'from-yellow-400 to-orange-500', desc: 'Số 1-100, 4 số hạng' },
                { level: 4, label: 'Cao Thủ', emoji: '🔥', color: 'from-orange-400 to-red-500', desc: 'Số 1-500, 5 số hạng' },
                { level: 5, label: 'Huyền Thoại', emoji: '👑', color: 'from-purple-400 to-pink-500', desc: 'Số 1-999, 6 số hạng' }
              ].map(item => {
                // Kiểm tra cấp độ có bị khóa không
                const maxDifficulty = userTier === 'free' ? 2 : userTier === 'basic' ? 3 : 5;
                const isDifficultyLocked = item.level > maxDifficulty;
                
                return (
                  <button
                    key={item.level}
                    onClick={() => {
                      if (isDifficultyLocked) {
                        toast.warning(`Cấp độ ${item.level} cần nâng cấp gói để mở khóa`);
                        router.push('/pricing');
                        return;
                      }
                      setDifficulty(item.level);
                    }}
                    className={`relative px-3 py-2 rounded-xl font-bold transition-all transform hover:scale-105 min-w-[80px] ${
                      difficulty === item.level
                        ? `bg-gradient-to-br ${item.color} text-white shadow-lg scale-110 ring-2 ring-white`
                        : 'bg-white/20 text-white/80 hover:bg-white/30'
                    }`}
                  >
                    {/* Lock icon */}
                    {isDifficultyLocked && (
                      <div className="absolute -top-1 -left-1 bg-black/60 rounded-full w-5 h-5 flex items-center justify-center z-20">
                        <span className="text-white text-xs">🔒</span>
                      </div>
                    )}
                    <div className={`text-2xl ${isDifficultyLocked ? 'opacity-50' : ''}`}>{item.emoji}</div>
                    <div className={`text-xs font-semibold mt-1 ${isDifficultyLocked ? 'opacity-50' : ''}`}>
                      {isDifficultyLocked ? 'Khóa' : item.label}
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Mô tả cấp độ đang chọn */}
            <div className="mt-3 text-center">
              <p className="text-white/70 text-sm">
                {difficulty === 1 && '🐣 Tập Sự: Luyện tập với số có 1 chữ số'}
                {difficulty === 2 && '⚔️ Chiến Binh: Luyện tập với số có 2 chữ số'}
                {difficulty === 3 && '🛡️ Dũng Sĩ: Luyện tập với số có 3 chữ số'}
                {difficulty === 4 && '🔥 Cao Thủ: Luyện tập với số có 4 chữ số'}
                {difficulty === 5 && '👑 Huyền Thoại: Luyện tập với số có 5 chữ số'}
              </p>
            </div>
          </div>

          {/* Mode grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { mode: 'addition', title: 'Siêu Cộng', icon: '🌟', symbol: '+', color: 'from-emerald-400 to-green-500', desc: 'Gom sao!', tier: 'free' },
              { mode: 'subtraction', title: 'Siêu Trừ', icon: '👾', symbol: '-', color: 'from-blue-400 to-cyan-500', desc: 'Diệt quái!', tier: 'free' },
              { mode: 'addSubMixed', title: 'Cộng Trừ Mix', icon: '⚔️', symbol: '±', color: 'from-teal-400 to-emerald-500', desc: 'Hỗn chiến!', tier: 'basic' },
              { mode: 'multiplication', title: 'Siêu Nhân', icon: '✨', symbol: '×', color: 'from-purple-400 to-pink-500', desc: 'Nhân bội!', tier: 'advanced' },
              { mode: 'division', title: 'Siêu Chia', icon: '🍕', symbol: '÷', color: 'from-rose-400 to-red-500', desc: 'Chia đều!', tier: 'advanced' },
              { mode: 'mulDiv', title: 'Nhân Chia Mix', icon: '🎩', symbol: '×÷', color: 'from-amber-400 to-orange-500', desc: 'Phép thuật!', tier: 'advanced' },
              { mode: 'mixed', title: 'Tứ Phép Thần', icon: '👑', symbol: '∞', color: 'from-indigo-500 to-purple-600', desc: 'Boss cuối!', tier: 'advanced' },
              { mode: 'mentalMath', title: 'Siêu Trí Tuệ', icon: '🧠', symbol: '💭', color: 'from-violet-500 to-fuchsia-600', desc: 'Không bàn tính!', tier: 'advanced', special: true },
              { mode: 'flashAnzan', title: 'Tia Chớp', icon: '⚡', symbol: '💫', color: 'from-yellow-500 to-orange-600', desc: 'Flash Anzan!', tier: 'advanced', special: true },
            ].map(item => {
              // Kiểm tra mode có bị khóa không
              const tierLevels = { free: 0, basic: 1, advanced: 2, vip: 3 };
              const userTierLevel = tierLevels[userTier] || 0;
              const requiredTierLevel = tierLevels[item.tier] || 0;
              const isLocked = userTierLevel < requiredTierLevel;
              
              // Kiểm tra cấp độ có bị khóa không (dựa trên tier và difficulty)
              const maxDifficulty = userTier === 'free' ? 2 : userTier === 'basic' ? 3 : 5;
              const isDifficultyLocked = difficulty > maxDifficulty && !isLocked;
              
              return (
                <button
                  key={item.mode}
                  onClick={() => {
                    if (isLocked) {
                      toast.warning(`Cần nâng cấp lên gói ${item.tier === 'basic' ? 'Cơ Bản' : 'Nâng Cao'} để mở khóa`);
                      router.push('/pricing');
                      return;
                    }
                    if (isDifficultyLocked) {
                      toast.warning(`Cấp độ ${difficulty} cần nâng cấp gói để mở khóa`);
                      router.push('/pricing');
                      return;
                    }
                    startMode(item.mode);
                  }}
                  className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-95 transition-all text-white flex flex-col items-center justify-center relative overflow-hidden group min-h-[140px] ${
                    item.special ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-purple-900' : ''
                  }`}
                >
                  {/* Lock icon */}
                  {isLocked && (
                    <div className="absolute top-2 left-2 bg-black/40 rounded-full w-7 h-7 flex items-center justify-center z-20">
                      <span className="text-white text-sm">🔒</span>
                    </div>
                  )}
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all"></div>
                  
                  {/* Icon */}
                  <div className={`text-4xl sm:text-5xl mb-2 drop-shadow-lg z-10 ${isLocked ? 'opacity-60' : ''}`}>{item.icon}</div>
                  
                  {/* Symbol badge */}
                  <div className="absolute top-2 right-2 bg-white/30 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">
                    {item.symbol}
                  </div>
                
                  {/* Title */}
                  <div className={`text-base sm:text-lg font-black z-10 ${isLocked ? 'opacity-60' : ''}`}>{item.title}</div>
                
                  {/* Desc */}
                  <div className={`text-xs z-10 ${isLocked ? 'opacity-50' : 'opacity-80'}`}>
                    {isLocked ? 'Cần nâng cấp' : item.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Practice screen
  // Thời gian hợp lý: cơ bản 15s + 5s/độ khó + 3s/phép tính
  const baseTime = 15 + difficulty * 5 + ((problem?.displayProblem?.match(/[+\-×÷]/g) || []).length) * 3;
  const timePercent = Math.min(100, (displayTimer / baseTime) * 100);
  const timerColor = timePercent < 60 ? 'bg-green-500' : timePercent < 85 ? 'bg-yellow-500' : 'bg-red-500';
  
  const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
  const isAnswerCorrect = sorobanValue === problem?.answer;
  const hasInput = sorobanValue !== 0;
  const showingAnswer = result === false;

  // Game Complete Screen
  if (gameComplete) {
    // Tính sao cuối cùng dùng công thức mới
    const avgTimePerQuestion = sessionStats.totalTime / Math.max(1, sessionStats.total);
    const finalStarsData = calculatePracticeStars(
      sessionStats.correct,
      sessionStats.total,
      difficulty,
      avgTimePerQuestion,
      maxStreak
    );
    
    const grade = accuracy >= 90 ? 'S' : accuracy >= 70 ? 'A' : accuracy >= 50 ? 'B' : 'C';
    const gradeColors = { S: 'text-yellow-400', A: 'text-green-400', B: 'text-blue-400', C: 'text-gray-400' };
    const gradeEmojis = { S: '👑', A: '🌟', B: '⭐', C: '💪' };
    const gradeTexts = { 
      S: 'XUẤT SẮC!', 
      A: 'GIỎI LẮM!', 
      B: 'KHÁ TỐT!', 
      C: 'CỐ GẮNG THÊM!' 
    };
    const gradeDescriptions = {
      S: 'Bạn là siêu sao! 🌟',
      A: 'Rất tuyệt vời! 👏',
      B: 'Tiếp tục phát huy! 💪',
      C: 'Luyện tập thêm nhé! 📚'
    };
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-3 sm:p-4 overflow-y-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full text-center my-auto">
          {/* Trophy */}
          <div className="text-5xl sm:text-6xl mb-2 sm:mb-3 animate-bounce">{gradeEmojis[grade]}</div>
          
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">HOÀN THÀNH!</h1>
          <p className="text-white/70 text-sm sm:text-base mb-2 sm:mb-3">{currentModeInfo?.title} - Cấp {difficulty}</p>
          
          {/* Grade với giải thích rõ ràng */}
          <div className="mb-3 sm:mb-4">
            <div className={`text-5xl sm:text-6xl font-black ${gradeColors[grade]}`}>
              {gradeTexts[grade]}
            </div>
            <div className="text-white/60 text-sm mt-1">
              {gradeDescriptions[grade]}
            </div>
            <div className={`text-xs ${gradeColors[grade]} mt-1`}>
              Hạng {grade} • {accuracy}% chính xác
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="bg-white/10 rounded-xl p-2 sm:p-3">
              <div className="text-xl sm:text-2xl">⭐</div>
              <div className="text-xl sm:text-2xl font-black text-yellow-400">{finalStarsData.totalStars}</div>
              <div className="text-[10px] sm:text-xs text-white/60">Sao</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 sm:p-3">
              <div className="text-xl sm:text-2xl">✓</div>
              <div className="text-xl sm:text-2xl font-black text-green-400">{sessionStats.correct}/{TOTAL_CHALLENGES}</div>
              <div className="text-[10px] sm:text-xs text-white/60">Đúng</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 sm:p-3">
              <div className="text-xl sm:text-2xl">🔥</div>
              <div className="text-xl sm:text-2xl font-black text-orange-400">{maxStreak}</div>
              <div className="text-[10px] sm:text-xs text-white/60">Combo</div>
            </div>
          </div>
          
          {/* Breakdown chi tiết sao - có thể scroll nếu cần */}
          <div className="bg-white/5 rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 text-left max-h-40 sm:max-h-48 overflow-y-auto">
            <div className="text-xs text-white/60 mb-2 text-center font-semibold sticky top-0 bg-white/5 py-1">Chi tiết điểm sao</div>
            {finalStarsData.breakdown.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-white/10 last:border-0">
                <span className="text-white/80">
                  <span className="mr-1 sm:mr-2">{item.icon}</span>
                  {item.label}
                </span>
                <span className="text-yellow-400 font-bold">+{item.value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-sm sm:text-base pt-2 mt-2 border-t border-white/30">
              <span className="text-white font-bold">Tổng cộng</span>
              <span className="text-yellow-400 font-black">⭐ {finalStarsData.totalStars}</span>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={restartGame}
              className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-transform text-sm sm:text-base"
            >
              🔄 Chơi lại
            </button>
            <button
              onClick={() => setMode(null)}
              className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors text-sm sm:text-base"
            >
              📋 Chọn mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Celebration Popup - Game hóa theo tốc độ */}
      {celebration === 'correct' && celebrationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center animate-scale-up">
            {/* Main emoji */}
            <div className="text-7xl sm:text-8xl mb-3 animate-bounce drop-shadow-2xl">
              {celebrationData.emoji}
            </div>
            
            {/* Message với màu theo tier */}
            <div className={`text-3xl sm:text-4xl font-black mb-2 drop-shadow-lg animate-pulse ${celebrationData.tierTextColor}`}>
              {celebrationData.text}
            </div>
            
            {/* Speed multiplier badge */}
            {celebrationData.multiplier > 1 && (
              <div className={`inline-block bg-gradient-to-r ${celebrationData.tierColor} text-white px-4 py-1 rounded-full font-black text-lg sm:text-xl mb-2 shadow-lg`}>
                x{celebrationData.multiplier} ĐIỂM!
              </div>
            )}
            
            {/* Streak bonus */}
            {celebrationData.streakBonus && (
              <div className="text-xl sm:text-2xl text-orange-400 font-black mb-2 animate-pulse">
                {celebrationData.streakBonus.emoji} {celebrationData.streakBonus.text}
              </div>
            )}
            
            {/* Stars earned với animation */}
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(Math.min(5, Math.ceil(celebrationData.starsEarned / 2)))].map((_, i) => (
                <span key={i} className="text-3xl sm:text-4xl animate-spin-slow" style={{ animationDelay: `${i * 0.1}s` }}>
                  ⭐
                </span>
              ))}
            </div>
            <div className={`text-xl sm:text-2xl font-bold ${celebrationData.tierTextColor}`}>
              +{celebrationData.starsEarned} sao
            </div>
          </div>
        </div>
      )}

      {/* Top bar - Compact Game style */}
      <div className={`bg-gradient-to-r ${currentModeInfo?.color || 'from-violet-500 to-purple-600'} shadow-lg flex-shrink-0`}>
        <div className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-3">
          {/* Left: Navigation */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Link 
              href="/dashboard"
              prefetch={true}
              className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
              title="Về trang chủ"
            >
              <Home size={16} />
            </Link>
            <button 
              onClick={() => {
                if (isMentalMode) {
                  setMentalSubMode(null); // Về màn chọn sub-mode
                } else {
                  setMode(null); // Về màn chọn mode
                }
              }} 
              className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
              title="Chọn chế độ khác"
            >
              <ArrowLeft size={16} />
            </button>
          </div>
          
          {/* Center: Progress bar with status */}
          <div className="flex-1 flex items-center gap-2">
            {/* Progress dots - shows correct/wrong/skipped status */}
            <div className="flex gap-0.5 flex-1">
              {[...Array(TOTAL_CHALLENGES)].map((_, i) => {
                const challengeNum = i + 1;
                const resultStatus = challengeResults[i]; // 'correct', 'wrong', 'skipped', or undefined
                let dotClass = 'bg-white/30'; // chưa làm
                
                if (challengeNum < currentChallenge) {
                  // Câu đã hoàn thành
                  if (resultStatus === 'correct') {
                    dotClass = 'bg-green-400'; // đúng
                  } else if (resultStatus === 'wrong') {
                    dotClass = 'bg-red-400'; // sai
                  } else if (resultStatus === 'skipped') {
                    dotClass = 'bg-yellow-400'; // bỏ qua
                  }
                } else if (challengeNum === currentChallenge) {
                  dotClass = 'bg-white animate-pulse'; // đang làm
                }
                
                return (
                  <div
                    key={i}
                    className={`h-2.5 flex-1 rounded-full transition-all ${dotClass}`}
                    title={resultStatus === 'correct' ? 'Đúng ✓' : resultStatus === 'wrong' ? 'Sai ✗' : resultStatus === 'skipped' ? 'Bỏ qua' : ''}
                  />
                );
              })}
            </div>
            
            {/* Challenge counter */}
            <div className="bg-white/30 px-2 py-0.5 rounded-full text-white font-bold text-xs whitespace-nowrap">
              {currentChallenge}/{TOTAL_CHALLENGES}
            </div>
          </div>
          
          {/* Right: Mode, Level & Stats */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="text-xs sm:text-sm">{difficultyInfo[difficulty]?.emoji}</span>
              <span className="text-white font-bold text-[10px] sm:text-xs hidden xs:inline">{difficultyInfo[difficulty]?.label}</span>
              <span className="text-white/60 text-[10px] sm:text-xs hidden sm:inline">•</span>
              <span className="text-xs sm:text-sm">{currentModeInfo?.icon}</span>
              <span className="text-white font-bold text-[10px] sm:text-xs">
                {isMentalMode && mentalSubMode 
                  ? `${currentModeInfo?.title} (${mentalSubModes.find(m => m.id === mentalSubMode)?.title || ''})`
                  : currentModeInfo?.title
                }
              </span>
            </div>
            <div className="bg-yellow-400/90 text-yellow-900 px-1.5 sm:px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs shadow">
              +{sessionStats.stars}
            </div>
            {streak >= 2 && (
              <div className="bg-orange-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs shadow animate-pulse">
                🔥{streak}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problem display - Compact & Bold */}
      <div className="flex-shrink-0 bg-white/10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-2 sm:gap-4">
          {/* Problem */}
          <div className="text-white font-black text-xl sm:text-3xl md:text-4xl">
            {problem?.displayProblem}
          </div>
          
          {/* Equals */}
          <div className="text-white/60 text-xl sm:text-3xl md:text-4xl">=</div>
          
          {/* Answer box - khác nhau cho Soroban vs Mental */}
          {isMentalMode ? (
            // Input cho mode Siêu Trí Tuệ - luôn focus
            <input
              ref={mentalInputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={mentalAnswer}
              onChange={(e) => {
                // Chỉ cho phép số và dấu trừ ở đầu
                const val = e.target.value;
                if (/^-?\d*$/.test(val)) {
                  setMentalAnswer(val);
                }
              }}
              onKeyDown={handleMentalKeyDown}
              onBlur={() => {
                // Auto re-focus khi mất focus (trừ khi đã có kết quả)
                if (result === null) {
                  setTimeout(() => mentalInputRef.current?.focus(), 10);
                }
              }}
              disabled={result !== null}
              placeholder="?"
              autoFocus
              autoComplete="off"
              className={`font-black text-xl sm:text-3xl md:text-4xl px-3 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl w-20 sm:w-28 text-center transition-all outline-none caret-purple-500 ${
                result === true
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' 
                  : showingAnswer
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white text-purple-700 shadow-lg ring-2 sm:ring-4 ring-white/50'
              }`}
            />
          ) : (
            // Display box cho Soroban mode
            <div className={`font-black text-xl sm:text-3xl md:text-4xl px-4 sm:px-6 py-1 sm:py-2 rounded-xl sm:rounded-2xl min-w-[80px] sm:min-w-[100px] text-center transition-all ${
              result === true
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' 
                : showingAnswer
                  ? 'bg-yellow-500 text-white'
                  : hasInput 
                    ? 'bg-white text-purple-700 shadow-lg' 
                    : 'bg-white/20 text-white/50'
            }`}>
              {showingAnswer ? problem?.answer : (hasInput ? sorobanValue : '?')}
            </div>
          )}
          
          {/* Timer */}
          <div className={`${timerColor} text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 sm:gap-2 shadow-lg text-sm sm:text-base`}>
            <Clock size={14} className="sm:w-[18px] sm:h-[18px]" />
            <span>{displayTimer}s</span>
          </div>
        </div>
      </div>

      {/* Action buttons - Compact */}
      <div className="flex-shrink-0 bg-black/20">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-center gap-2 sm:gap-3">
          {showingAnswer && (
            <span className="text-green-400 font-bold text-xs sm:text-sm bg-green-400/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
              ✓ {problem?.answer}
            </span>
          )}
          
          {result === null && !isMentalMode && (
            <button
              onClick={skipProblem}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/10 text-white/80 hover:bg-white/20 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-colors"
            >
              💡 Bỏ qua
            </button>
          )}
          
          {result === null && isMentalMode && (
            <>
              <button
                onClick={handleMentalSubmit}
                disabled={!mentalAnswer}
                className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                ✓ Trả lời
              </button>
              <button
                onClick={skipProblem}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/10 text-white/80 hover:bg-white/20 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-colors"
              >
                💡 Bỏ qua
              </button>
            </>
          )}
          
          {(result !== null || showingAnswer) && (
            <button
              onClick={nextProblem}
              className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              {currentChallenge >= TOTAL_CHALLENGES ? '🏆 Kết thúc' : '⚡ Tiếp'}
            </button>
          )}
          
          {!isMentalMode && (
            <button
              onClick={resetSoroban}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/10 text-white/80 hover:bg-white/20 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-colors"
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Soroban hoặc Mental Math UI */}
      {isMentalMode ? (
        // Mental Math UI - compact và responsive, dùng vh để đảm bảo vừa màn hình
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-2 overflow-hidden">
          <div className="text-center w-full max-w-[280px]">
            {/* Icon và tiêu đề - rất compact */}
            <div className="text-3xl sm:text-5xl mb-1">🧠</div>
            <p className="text-white/80 text-[10px] sm:text-xs mb-2">
              Nhập số → <span className="bg-green-500 px-1 py-0.5 rounded font-bold">Enter</span>
            </p>
            
            {/* Numpad - responsive, chiều cao tự động co giãn */}
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5 mx-auto">
              {[1,2,3,4,5,6,7,8,9].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (result !== null) return;
                    setMentalAnswer(prev => prev + num);
                    mentalInputRef.current?.focus();
                  }}
                  disabled={result !== null}
                  className="bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-lg p-2 sm:p-3 text-white font-bold text-base sm:text-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => {
                  if (result !== null) return;
                  setMentalAnswer(prev => prev.slice(0, -1));
                  mentalInputRef.current?.focus();
                }}
                disabled={result !== null}
                className="bg-red-500/70 hover:bg-red-500 active:bg-red-600 rounded-lg p-2 sm:p-3 text-white font-bold text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-50"
              >
                ⌫
              </button>
              <button
                onClick={() => {
                  if (result !== null) return;
                  setMentalAnswer(prev => prev + '0');
                  mentalInputRef.current?.focus();
                }}
                disabled={result !== null}
                className="bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-lg p-2 sm:p-3 text-white font-bold text-base sm:text-xl transition-all active:scale-95 disabled:opacity-50"
              >
                0
              </button>
              <button
                onClick={() => {
                  if (result !== null) return;
                  handleMentalSubmit();
                }}
                disabled={result !== null || !mentalAnswer}
                className="bg-green-500 hover:bg-green-400 active:bg-green-600 rounded-lg p-2 sm:p-3 text-white font-bold text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-50"
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Soroban - fills remaining space
        <div className="flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-2xl">
            <SorobanBoard 
              mode="free" 
              compact={false}
              showHints={true}
              resetKey={sorobanKey}
              onValueChange={handleSorobanChange}
            />
          </div>
        </div>
      )}

      {/* Custom animation styles */}
      <style jsx global>{`
        @keyframes scale-up {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.5s ease-out forwards;
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .animate-spin-slow {
          animation: spin-slow 1s ease-in-out infinite;
        }
        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 0 0 4px rgba(255,255,255,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(255,255,255,0.3); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        /* Ẩn spinner cho input number */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
