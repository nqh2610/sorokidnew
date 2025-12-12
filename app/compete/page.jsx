'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Trophy, Clock, Home, RotateCcw, Medal, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/Toast/ToastContext';
import Logo from '@/components/Logo/Logo';
import SorobanBoard from '@/components/Soroban/SorobanBoard';
import { calculateCompeteStars } from '@/lib/gamification';

const TOTAL_CHALLENGES = 10;

// Số câu hỏi có sẵn
const questionCounts = [
  { value: 5, label: '5 câu', emoji: '⚡', desc: 'Khởi động', color: 'from-green-400 to-emerald-500' },
  { value: 10, label: '10 câu', emoji: '🎯', desc: 'Cơ bản', color: 'from-blue-400 to-cyan-500' },
  { value: 15, label: '15 câu', emoji: '🔥', desc: 'Luyện tập', color: 'from-yellow-400 to-orange-500' },
  { value: 20, label: '20 câu', emoji: '💪', desc: 'Nâng cao', color: 'from-orange-400 to-red-500' },
  { value: 25, label: '25 câu', emoji: '⚔️', desc: 'Thử thách', color: 'from-red-400 to-rose-500' },
  { value: 30, label: '30 câu', emoji: '🛡️', desc: 'Chiến đấu', color: 'from-pink-400 to-rose-500' },
  { value: 40, label: '40 câu', emoji: '👑', desc: 'Siêu sao', color: 'from-purple-400 to-violet-500' },
  { value: 50, label: '50 câu', emoji: '🏆', desc: 'Huyền thoại', color: 'from-violet-500 to-purple-600' },
];

// Thông điệp động viên game hóa theo tốc độ
const speedTiers = {
  godlike: {
    threshold: 0.25,
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
    threshold: 0.5,
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
    threshold: 0.75,
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
    threshold: 1,
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
  addition: { title: 'Siêu Cộng', subtitle: 'Gom sao!', icon: '⭐', symbol: '+', color: 'from-yellow-400 to-amber-500' },
  subtraction: { title: 'Siêu Trừ', subtitle: 'Diệt quái!', icon: '👾', symbol: '-', color: 'from-cyan-400 to-blue-500' },
  addSubMixed: { title: 'Cộng Trừ Mix', subtitle: 'Hỗn chiến!', icon: '⚔️', symbol: '±', color: 'from-teal-400 to-emerald-500' },
  multiplication: { title: 'Siêu Nhân', subtitle: 'Nhân bội!', icon: '✨', symbol: '×', color: 'from-purple-400 to-pink-500' },
  division: { title: 'Siêu Chia', subtitle: 'Chia đều!', icon: '🍕', symbol: '÷', color: 'from-rose-400 to-red-500' },
  mulDiv: { title: 'Nhân Chia Mix', subtitle: 'Phép thuật!', icon: '🎩', symbol: '×÷', color: 'from-fuchsia-400 to-purple-500' },
  mixed: { title: 'Tứ Phép Thần', subtitle: 'Boss cuối!', icon: '👑', symbol: '∞', color: 'from-indigo-400 to-purple-500' },
  mentalMath: { title: 'Siêu Trí Tuệ', subtitle: 'Không bàn tính!', icon: '🧠', symbol: '💭', color: 'from-violet-400 to-fuchsia-500', isMental: true },
  flashAnzan: { title: 'Tia Chớp', subtitle: 'Tốc độ ánh sáng!', icon: '⚡', symbol: '💫', color: 'from-yellow-400 to-orange-500', isFlash: true },
};

// Danh sách tên đấu trường theo mode và cấp độ
const arenaNames = {
  addition: {
    1: { title: 'Vườn Sao', icon: '🌱' },
    2: { title: 'Rừng Sao', icon: '🌲' },
    3: { title: 'Núi Sao', icon: '⛰️' },
    4: { title: 'Đỉnh Sao', icon: '🏔️' },
    5: { title: 'Thiên Đường Sao', icon: '🌟' },
  },
  subtraction: {
    1: { title: 'Robot Nhí', icon: '🤖' },
    2: { title: 'Robot Chiến', icon: '👾' },
    3: { title: 'Siêu Robot', icon: '🦾' },
    4: { title: 'Mega Robot', icon: '🔧' },
    5: { title: 'Ultra Robot', icon: '⚡' },
  },
  addSubMixed: {
    1: { title: 'Cầu Vồng Nhí', icon: '🌈' },
    2: { title: 'Cầu Vồng Đôi', icon: '🎨' },
    3: { title: 'Bão Cầu Vồng', icon: '🌪️' },
    4: { title: 'Vũ Trụ Màu', icon: '🎆' },
    5: { title: 'Thiên Hà Màu', icon: '🌌' },
  },
  multiplication: {
    1: { title: 'Phép Màu Nhí', icon: '🪄' },
    2: { title: 'Pháp Sư Học Việc', icon: '🧙' },
    3: { title: 'Pháp Sư', icon: '🔮' },
    4: { title: 'Đại Pháp Sư', icon: '⭐' },
    5: { title: 'Phù Thủy Tối Thượng', icon: '👑' },
  },
  division: {
    1: { title: 'Pizza Nhỏ', icon: '🍕' },
    2: { title: 'Đầu Bếp Tập Sự', icon: '👨‍🍳' },
    3: { title: 'Đầu Bếp', icon: '🍳' },
    4: { title: 'Master Chef', icon: '🥘' },
    5: { title: 'Iron Chef', icon: '🏆' },
  },
  mulDiv: {
    1: { title: 'Ninja Nhí', icon: '🥷' },
    2: { title: 'Ninja Xanh', icon: '💚' },
    3: { title: 'Ninja Đỏ', icon: '❤️' },
    4: { title: 'Ninja Vàng', icon: '💛' },
    5: { title: 'Ninja Bóng Tối', icon: '🌑' },
  },
  mixed: {
    1: { title: 'Tân Binh', icon: '🎖️' },
    2: { title: 'Chiến Binh', icon: '⚔️' },
    3: { title: 'Dũng Sĩ', icon: '🛡️' },
    4: { title: 'Anh Hùng', icon: '🦸' },
    5: { title: 'Huyền Thoại', icon: '👑' },
  },
  mentalMath: {
    1: { title: 'Thiên Tài Nhí', icon: '🧒' },
    2: { title: 'Thần Đồng', icon: '🎒' },
    3: { title: 'Siêu Trí Tuệ', icon: '🧠' },
    4: { title: 'Einstein Nhí', icon: '👨‍🔬' },
    5: { title: 'Thiên Tài Vũ Trụ', icon: '🚀' },
  },
  flashAnzan: {
    1: { title: 'Ánh Nến', icon: '🕯️' },
    2: { title: 'Ánh Trăng', icon: '🌙' },
    3: { title: 'Tia Chớp', icon: '⚡' },
    4: { title: 'Sao Băng', icon: '☄️' },
    5: { title: 'BIG BANG', icon: '💥' },
  },
};

// Cấu hình Flash Anzan levels cho thi đấu - giống practice
const flashLevelsCompete = [
  { 
    id: 'anhNen', 
    level: 1,
    name: 'Ánh Nến', 
    subtitle: 'Lung linh dịu dàng',
    emoji: '🕯️', 
    color: 'from-amber-400 to-orange-500', 
    glowColor: 'shadow-amber-400/50',
    numbers: [3, 4], 
    digits: 1, 
    speed: 2, 
    stars: 2, 
    tagline: 'Khởi đầu ấm áp',
    rank: '⭐',
    rankLabel: 'Tập Sự',
    bonusMultiplier: 1,
    additionOnly: true
  },
  { 
    id: 'anhTrang', 
    level: 2,
    name: 'Ánh Trăng', 
    subtitle: 'Huyền ảo đêm thanh',
    emoji: '🌙', 
    color: 'from-slate-300 to-blue-400', 
    glowColor: 'shadow-blue-300/50',
    numbers: [5, 6], 
    digits: 1, 
    speed: 1.5, 
    stars: 4, 
    tagline: 'Bước tiếp vững chắc',
    rank: '⭐⭐',
    rankLabel: 'Chiến Binh',
    bonusMultiplier: 1.5
  },
  { 
    id: 'tiaChop', 
    level: 3,
    name: 'Tia Chớp', 
    subtitle: 'Lóe sáng chớp nhoáng',
    emoji: '⚡', 
    color: 'from-yellow-400 to-amber-500', 
    glowColor: 'shadow-yellow-400/50',
    numbers: [5, 6], 
    digits: 2, 
    speed: 2, 
    stars: 6, 
    tagline: 'Nhanh như chớp!',
    rank: '⭐⭐⭐',
    rankLabel: 'Dũng Sĩ',
    bonusMultiplier: 2
  },
  { 
    id: 'saoBang', 
    level: 4,
    name: 'Sao Băng', 
    subtitle: 'Vụt sáng khoảnh khắc',
    emoji: '☄️', 
    color: 'from-purple-500 to-pink-600', 
    glowColor: 'shadow-purple-400/50',
    numbers: [8, 9], 
    digits: 2, 
    speed: 1.5, 
    stars: 8, 
    tagline: '🔥 SIÊU TỐC 🔥',
    rank: '⭐⭐⭐⭐',
    rankLabel: 'Huyền Thoại',
    bonusMultiplier: 3
  },
  { 
    id: 'bigBang', 
    level: 5,
    name: 'BIG BANG', 
    subtitle: 'Vụ nổ khai sinh vũ trụ',
    emoji: '💥', 
    color: 'from-red-500 via-orange-500 to-yellow-400', 
    glowColor: 'shadow-red-500/50',
    numbers: [5, 6], 
    digits: 3, 
    speed: 2, 
    stars: 10, 
    tagline: '💥 VỤ NỔ VŨ TRỤ 💥',
    rank: '👑',
    rankLabel: 'THẦN',
    bonusMultiplier: 5
  },
];

// Tạo arena từ mode, difficulty và số câu
const createArena = (mode, difficulty, questionCount = 10) => {
  const name = arenaNames[mode]?.[difficulty] || { title: `${modeInfo[mode]?.title} Lv${difficulty}`, icon: '🎯' };
  return {
    id: `${mode}-${difficulty}-${questionCount}`,
    mode,
    difficulty,
    questionCount,
    title: name.title,
    icon: name.icon,
    color: modeInfo[mode]?.color || 'from-gray-500 to-gray-600'
  };
};

export default function CompetePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();

  // States cho chọn đấu trường
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(null);
  const [selectedArena, setSelectedArena] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(10);
  
  // States cho game
  const [gameStarted, setGameStarted] = useState(false);
  const [problem, setProblem] = useState(null);
  const [sorobanValue, setSorobanValue] = useState(0);
  const [result, setResult] = useState(null);
  const [sessionStats, setSessionStats] = useState({ stars: 0, correct: 0, total: 0, totalTime: 0 });
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0); // Combo cao nhất
  const [currentChallenge, setCurrentChallenge] = useState(1);
  const [challengeResults, setChallengeResults] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const timerRef = useRef(0);
  const totalTimeRef = useRef(0);
  const intervalRef = useRef(null);
  const [displayTimer, setDisplayTimer] = useState(0);
  const [sorobanKey, setSorobanKey] = useState(0);
  const [celebration, setCelebration] = useState(null);
  const [celebrationData, setCelebrationData] = useState(null);
  const [mentalAnswer, setMentalAnswer] = useState('');
  const mentalInputRef = useRef(null);
  
  // User tier state
  const [userTier, setUserTier] = useState('free');

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

  useEffect(() => {
    if (problem && result === null && gameStarted) {
      intervalRef.current = setInterval(() => {
        timerRef.current += 1;
        setDisplayTimer(timerRef.current);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [problem, result, gameStarted]);

  useEffect(() => {
    if (celebration) {
      const timer = setTimeout(() => {
        setCelebration(null);
        setCelebrationData(null);
        if (celebration === 'correct') {
          goToNextChallenge();
        }
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [celebration]);

  // Auto-focus cho mental math
  useEffect(() => {
    if (selectedArena?.mode === 'mentalMath' && gameStarted && result === null) {
      mentalInputRef.current?.focus();
      
      const handleGlobalKeyDown = (e) => {
        if (!gameStarted || result !== null) return;
        
        if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          setMentalAnswer(prev => prev + e.key);
          mentalInputRef.current?.focus();
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          setMentalAnswer(prev => prev.slice(0, -1));
          mentalInputRef.current?.focus();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleMentalSubmit();
        } else if (e.key === '-' && mentalAnswer === '') {
          e.preventDefault();
          setMentalAnswer('-');
          mentalInputRef.current?.focus();
        }
      };
      
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }
  }, [selectedArena, gameStarted, result, mentalAnswer]);

  // Fetch leaderboard khi chọn đấu trường
  useEffect(() => {
    if (selectedArena && !gameStarted) {
      fetchLeaderboard(selectedArena.id);
    }
  }, [selectedArena, gameStarted]);

  const fetchLeaderboard = async (arenaId) => {
    setLoadingLeaderboard(true);
    try {
      const response = await fetch(`/api/compete/leaderboard?arenaId=${arenaId}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        setCurrentUserRank(data.currentUserRank);
        setCurrentUserData(data.currentUserData);
        setTotalPlayers(data.totalPlayers || 0);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
    setLoadingLeaderboard(false);
  };

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🏆</div>
          <div className="text-white font-bold">Đang tải...</div>
        </div>
      </div>
    );
  }

  const generateProblem = (modeType, diff) => {
    const randRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const digitRanges = {
      1: { min: 1, max: 9 },
      2: { min: 10, max: 99 },
      3: { min: 100, max: 999 },
      4: { min: 1000, max: 9999 },
      5: { min: 10000, max: 99999 }
    };

    const mulDivRanges = {
      1: { mulMax: 9, divMax: 9 },
      2: { mulMax: 12, divMax: 12 },
      3: { mulMax: 20, divMax: 15 },
      4: { mulMax: 30, divMax: 20 },
      5: { mulMax: 50, divMax: 30 }
    };

    const range = digitRanges[diff];
    const mulDiv = mulDivRanges[diff];
    
    let answer, displayProblem, numbers = [], operations = [];

    switch (modeType) {
      case 'addition': {
        const count = Math.min(3, 2 + Math.floor(Math.random() * 2));
        for (let i = 0; i < count; i++) {
          numbers.push(randRange(range.min, range.max));
        }
        answer = numbers.reduce((a, b) => a + b, 0);
        displayProblem = numbers.join(' + ');
        break;
      }
      case 'subtraction': {
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

  const getRandomMentalMode = () => {
    const modes = ['addition', 'subtraction', 'multiplication', 'division', 'addSubMixed'];
    return modes[Math.floor(Math.random() * modes.length)];
  };

  const startGame = () => {
    const actualMode = selectedArena.mode === 'mentalMath' ? getRandomMentalMode() : selectedArena.mode;
    setProblem(generateProblem(actualMode, selectedArena.difficulty));
    setSorobanValue(0);
    setMentalAnswer('');
    setResult(null);
    timerRef.current = 0;
    totalTimeRef.current = 0;
    setDisplayTimer(0);
    setSessionStats({ stars: 0, correct: 0, total: 0, totalTime: 0 });
    setStreak(0);
    setMaxStreak(0);
    setCurrentChallenge(1);
    setChallengeResults([]);
    setGameComplete(false);
    setGameStarted(true);
    setSorobanKey(prev => prev + 1);
    
    if (selectedArena.mode === 'mentalMath') {
      setTimeout(() => mentalInputRef.current?.focus(), 100);
    }
  };

  const handleSorobanChange = (value) => {
    setSorobanValue(value);
    if (value === problem?.answer && result === null) {
      autoCheckAnswer(value);
    }
  };

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

  const autoCheckAnswer = async (value) => {
    const isCorrect = value === problem.answer;
    setResult(isCorrect);
    const timeTaken = timerRef.current;

    const timeRatio = timeTaken / problem?.recommendedTime;
    const newStreak = isCorrect ? streak + 1 : 0;
    
    // Cộng thời gian vào tổng
    totalTimeRef.current += timeTaken;
    
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
    const instantStars = isCorrect ? Math.round((1 + selectedArena.difficulty) * speedTier.multiplier) : 0;

    setChallengeResults(prev => [...prev, isCorrect ? 'correct' : 'wrong']);

    if (isCorrect) {
      // Cập nhật max streak
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
      
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

    setSessionStats(prev => ({
      stars: prev.stars + instantStars,
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      totalTime: totalTimeRef.current
    }));
  };

  const goToNextChallenge = () => {
    if (currentChallenge >= totalChallenges) {
      setGameComplete(true);
      // Gửi kết quả lên server
      submitResult();
      return;
    }
    
    setCurrentChallenge(prev => prev + 1);
    const actualMode = selectedArena.mode === 'mentalMath' ? getRandomMentalMode() : selectedArena.mode;
    setProblem(generateProblem(actualMode, selectedArena.difficulty));
    setSorobanValue(0);
    setMentalAnswer('');
    setResult(null);
    timerRef.current = 0;
    setDisplayTimer(0);
    setSorobanKey(prev => prev + 1);
    
    if (selectedArena.mode === 'mentalMath') {
      setTimeout(() => mentalInputRef.current?.focus(), 100);
    }
  };

  const submitResult = async () => {
    try {
      await fetch('/api/compete/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arenaId: selectedArena.id,
          correct: sessionStats.correct + (result === true ? 1 : 0),
          totalTime: totalTimeRef.current,
          stars: sessionStats.stars
        })
      });
    } catch (error) {
      console.error('Error submitting result:', error);
    }
  };

  const nextProblem = () => {
    goToNextChallenge();
  };

  const skipProblem = () => {
    setResult(false);
    setStreak(0);
    totalTimeRef.current += timerRef.current;
    setChallengeResults(prev => [...prev, 'skipped']);
    setSessionStats(prev => ({ ...prev, total: prev.total + 1, totalTime: totalTimeRef.current }));
  };

  const resetSoroban = () => {
    setSorobanKey(prev => prev + 1);
    setSorobanValue(0);
  };

  const playAgain = () => {
    startGame();
  };

  const backToArenas = () => {
    setGameStarted(false);
    setGameComplete(false);
    setSelectedArena(null);
    setSelectedMode(null);
    setSelectedDifficulty(null);
    setSelectedQuestionCount(null);
  };

  const backToArenaDetail = () => {
    setGameStarted(false);
    setGameComplete(false);
    fetchLeaderboard(selectedArena.id);
  };

  const backToModeSelect = () => {
    setSelectedMode(null);
    setSelectedDifficulty(null);
    setSelectedQuestionCount(null);
    setSelectedArena(null);
  };

  const backToDifficultySelect = () => {
    setSelectedDifficulty(null);
    setSelectedQuestionCount(null);
    setSelectedArena(null);
  };

  const backToQuestionCountSelect = () => {
    setSelectedQuestionCount(null);
    setSelectedArena(null);
  };

  const selectModeAndContinue = (mode) => {
    setSelectedMode(mode);
  };

  const selectDifficultyAndContinue = (diff) => {
    setSelectedDifficulty(diff);
  };

  const selectQuestionCountAndContinue = (count) => {
    setSelectedQuestionCount(count);
    setTotalChallenges(count);
    const arena = createArena(selectedMode, selectedDifficulty, count);
    setSelectedArena(arena);
  };

  const isMentalMode = selectedArena?.mode === 'mentalMath';
  const isFlashMode = selectedArena?.mode === 'flashAnzan';
  const currentModeInfo = selectedArena ? modeInfo[selectedArena.mode] : null;

  // Màn hình chọn MODE - EPIC GAMING STYLE
  if (!selectedMode) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-x-hidden relative">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating bubbles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={`bubble-${i}`}
              className="absolute rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `clamp(20px, ${3 + Math.random() * 5}vh, 80px)`,
                height: `clamp(20px, ${3 + Math.random() * 5}vh, 80px)`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
          {/* Floating emojis */}
          {[...Array(10)].map((_, i) => (
            <div
              key={`emoji-${i}`}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: 'clamp(12px, 2.5vh, 32px)',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                opacity: 0.4
              }}
            >
              {['🏆', '⭐', '💫', '🔥', '⚡', '💎', '🎮', '👑'][Math.floor(Math.random() * 8)]}
            </div>
          ))}
          {/* Glowing orbs */}
          <div className="absolute top-1/4 left-1/4 w-[30vh] h-[30vh] bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[25vh] h-[25vh] bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-[20vh] h-[20vh] bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header - Back trái, Logo phải */}
          <div 
            className="flex-shrink-0"
            style={{ padding: 'clamp(8px, 1.5vh, 16px) clamp(12px, 2.5vw, 28px)' }}
          >
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                prefetch={true}
                className="flex items-center bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 transition-all border border-white/20 shadow-lg shadow-purple-500/20"
                style={{ 
                  padding: 'clamp(6px, 1vh, 12px)',
                  borderRadius: 'clamp(10px, 1.5vh, 20px)'
                }}
              >
                <ArrowLeft style={{ width: 'clamp(16px, 2.5vh, 24px)', height: 'clamp(16px, 2.5vh, 24px)' }} />
              </Link>
              <div 
                className="font-black text-white flex items-center bg-gradient-to-r from-amber-500/30 to-orange-500/30 backdrop-blur-md border border-white/20 shadow-lg shadow-orange-500/20"
                style={{ 
                  fontSize: 'clamp(13px, 2.8vh, 26px)', 
                  gap: 'clamp(6px, 1vw, 14px)',
                  padding: 'clamp(6px, 1vh, 12px) clamp(12px, 2vw, 24px)',
                  borderRadius: 'clamp(16px, 2.5vh, 32px)'
                }}
              >
                <span className="animate-bounce" style={{ fontSize: 'clamp(16px, 3.5vh, 34px)' }}>🏆</span> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 whitespace-nowrap">
                  Thi Đấu
                </span>
              </div>
              <Link
                href="/dashboard"
                prefetch={true}
                className="flex items-center bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 transition-all border border-white/20 shadow-lg shadow-purple-500/20"
                style={{ 
                  padding: 'clamp(4px, 0.8vh, 10px)',
                  borderRadius: 'clamp(12px, 2vh, 24px)'
                }}
              >
                <Logo size="xs" showText={false} />
              </Link>
            </div>
          </div>

          {/* Chọn mode */}
          <div style={{ padding: '0 clamp(12px, 2.5vw, 28px)' }}>
            <div className="text-center mb-4">
              <h2 className="text-white text-lg sm:text-xl font-bold mb-1">🎯 Chọn Chế Độ Thi Đấu</h2>
              <p className="text-white/60 text-sm">Chọn phép tính bạn muốn thử sức!</p>
            </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3" style={{ paddingBottom: 'clamp(20px, 5vh, 60px)' }}>
              {Object.entries(modeInfo).map(([modeKey, info]) => {
                // Định nghĩa tier yêu cầu cho từng mode
                const modeTiers = {
                  addition: 'free',
                  subtraction: 'free',
                  addSubMixed: 'basic',
                  multiplication: 'advanced',
                  division: 'advanced',
                  mulDiv: 'advanced',
                  mixed: 'advanced',
                  mentalMath: 'advanced',
                  flashAnzan: 'basic'
                };
                
                const recommendLevel = {
                  addition: 'Gom sao!',
                  subtraction: 'Diệt quái!',
                  addSubMixed: 'Hỗn chiến!',
                  multiplication: 'Nhân bội!',
                  division: 'Chia đều!',
                  mulDiv: 'Phép thuật!',
                  mixed: 'Boss cuối!',
                  mentalMath: 'Không bàn tính!',
                  flashAnzan: 'Tốc độ ánh sáng!'
                };
                
                // Kiểm tra mode có bị khóa không
                const tierLevels = { free: 0, basic: 1, advanced: 2, vip: 3 };
                const userTierLevel = tierLevels[userTier] || 0;
                const requiredTierLevel = tierLevels[modeTiers[modeKey]] || 0;
                const isLocked = userTierLevel < requiredTierLevel;
                
                return (
                  <button
                    key={modeKey}
                    onClick={() => {
                      if (isLocked) {
                        toast.warning(`Cần nâng cấp lên gói ${modeTiers[modeKey] === 'basic' ? 'Cơ Bản' : 'Nâng Cao'} để mở khóa`);
                        router.push('/pricing');
                        return;
                      }
                      selectModeAndContinue(modeKey);
                    }}
                    className={`bg-gradient-to-br ${info.color} rounded-2xl p-4 sm:p-5 shadow-xl hover:shadow-2xl transform hover:scale-[1.03] active:scale-95 transition-all text-white text-center relative overflow-hidden group`}
                  >
                    {/* Lock icon */}
                    {isLocked && (
                      <div className="absolute top-2 left-2 bg-black/40 rounded-full w-7 h-7 flex items-center justify-center z-20">
                        <span className="text-white text-sm">🔒</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all"></div>
                    <div className={`text-4xl sm:text-5xl mb-2 z-10 relative drop-shadow-md ${isLocked ? 'opacity-60' : ''}`}>{info.icon}</div>
                    <div className={`text-sm sm:text-base font-black z-10 relative drop-shadow-sm ${isLocked ? 'opacity-60' : ''}`}>{info.title}</div>
                    <div className={`text-xs z-10 relative mt-0.5 ${isLocked ? 'opacity-50' : 'text-white/95'}`}>{info.subtitle}</div>
                    <div className={`text-[10px] mt-2 z-10 relative bg-black/30 rounded-full px-2 py-0.5 ${isLocked ? 'opacity-50' : 'text-white/90'}`}>
                      {isLocked ? 'Cần nâng cấp' : recommendLevel[modeKey]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Màn hình chọn CẤP ĐỘ FLASH ANZAN - Giống practice
  if (selectedMode === 'flashAnzan' && !selectedDifficulty) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-y-auto overflow-x-hidden relative">
        {/* Animated starfield background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Stars */}
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${1 + Math.random() * 3}px`,
                height: `${1 + Math.random() * 3}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                opacity: 0.3 + Math.random() * 0.7
              }}
            />
          ))}
          {/* Floating light orbs */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`orb-${i}`}
              className="absolute animate-bounce opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `clamp(16px, ${2 + Math.random() * 2}vh, 36px)`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 3}s`
              }}
            >
              {['🌟', '✨', '💫', '⚡', '🔥', '💥'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
          {/* Epic glowing orbs */}
          <div className="absolute top-1/4 left-1/4 w-[30vh] h-[30vh] bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[25vh] h-[25vh] bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-[20vh] h-[20vh] bg-red-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header - Back trái, Logo phải */}
          <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg shadow-purple-500/30">
            <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between">
              <button
                onClick={backToModeSelect}
                className="flex items-center bg-black/30 rounded-lg text-white hover:bg-black/50 hover:scale-105 transition-all backdrop-blur"
                style={{ padding: 'clamp(6px, 1vh, 12px)' }}
              >
                <ArrowLeft style={{ width: 'clamp(16px, 2.5vh, 24px)', height: 'clamp(16px, 2.5vh, 24px)' }} />
              </button>
              <div className="text-center">
                <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span className="text-2xl animate-pulse">⚡</span> 
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-cyan-200 whitespace-nowrap">
                    TỐC ĐỘ ÁNH SÁNG
                  </span>
                  <span className="text-2xl animate-pulse">💫</span>
                </h1>
                <p className="text-white/80 text-[10px]">Chọn cấp độ thi đấu!</p>
              </div>
              <Link
                href="/dashboard"
                prefetch={true}
                className="flex items-center bg-black/30 rounded-lg text-white hover:bg-black/50 hover:scale-105 transition-all backdrop-blur"
                style={{ padding: 'clamp(4px, 0.8vh, 10px)' }}
              >
                <Logo size="xs" showText={false} />
              </Link>
            </div>
          </div>

          {/* Steps indicator */}
          <div style={{ padding: 'clamp(12px, 2vh, 20px) clamp(12px, 2.5vw, 28px)' }}>
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-400">
                <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Chế độ</span>
              </div>
              <div className="w-8 h-0.5 bg-white/30"></div>
              <div className="flex items-center gap-1 text-white">
                <span className="w-5 h-5 rounded-full bg-white text-purple-900 flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Cấp độ</span>
              </div>
              <div className="w-8 h-0.5 bg-white/30"></div>
              <div className="flex items-center gap-1 text-white/50">
                <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Số câu</span>
              </div>
            </div>
          </div>

          {/* Flash Anzan Level Cards - Gaming Style */}
          <div style={{ padding: '0 clamp(12px, 2.5vw, 28px)', paddingBottom: 'clamp(20px, 5vh, 60px)' }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {flashLevelsCompete.map((level, index) => {
                const maxLevel = userTier === 'free' ? 1 : userTier === 'basic' ? 3 : 5;
                const isLocked = level.level > maxLevel;
                
                return (
                  <button
                    key={level.id}
                    onClick={() => {
                      if (isLocked) {
                        toast.warning(`Cấp ${level.name} cần nâng cấp gói để mở khóa`);
                        router.push('/pricing');
                        return;
                      }
                      selectDifficultyAndContinue(level.level);
                    }}
                    className={`relative bg-gradient-to-br ${level.color} rounded-2xl overflow-hidden group hover:scale-[1.03] active:scale-95 transition-all duration-300 ${level.level === 5 ? 'col-span-2 sm:col-span-1' : ''}`}
                    style={{
                      padding: 'clamp(12px, 2vh, 24px)',
                      boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`,
                    }}
                  >
                    {/* Animated shine effect */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                        animation: 'shine 1.5s infinite'
                      }}
                    ></div>
                    
                    {/* Lock overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center">
                        <div className="text-4xl">🔒</div>
                      </div>
                    )}
                    
                    {/* Rank badge */}
                    {!isLocked && (
                      <div 
                        className="absolute top-2 right-2 bg-black/30 backdrop-blur rounded-full px-2 py-1 text-white/90 font-bold z-10"
                        style={{ fontSize: 'clamp(8px, 1.2vh, 12px)' }}
                      >
                        {level.rank}
                      </div>
                    )}
                    
                    {/* Main emoji */}
                    <div 
                      className={`text-center mb-2 drop-shadow-2xl group-hover:scale-110 transition-transform ${isLocked ? 'opacity-50' : ''}`}
                      style={{ fontSize: 'clamp(40px, 8vh, 80px)' }}
                    >
                      {level.emoji}
                    </div>
                    
                    {/* Level name */}
                    <div 
                      className={`text-white font-black text-center mb-1 drop-shadow-lg ${isLocked ? 'opacity-50' : ''}`}
                      style={{ fontSize: 'clamp(14px, 2.5vh, 24px)' }}
                    >
                      {level.name}
                    </div>
                    
                    {/* Rank label */}
                    <div 
                      className={`text-white/80 text-center mb-2 ${isLocked ? 'opacity-50' : ''}`}
                      style={{ fontSize: 'clamp(10px, 1.5vh, 14px)' }}
                    >
                      {level.rankLabel}
                    </div>
                    
                    {/* Stats */}
                    <div className={`space-y-1 ${isLocked ? 'opacity-50' : ''}`}>
                      <div 
                        className="flex items-center justify-center gap-1 text-white/90 bg-black/20 rounded-full px-2 py-0.5"
                        style={{ fontSize: 'clamp(9px, 1.3vh, 13px)' }}
                      >
                        <span>⚡</span>
                        <span className="font-bold">{level.speed}s</span>
                      </div>
                      <div 
                        className="flex items-center justify-center gap-1 text-white/90 bg-black/20 rounded-full px-2 py-0.5"
                        style={{ fontSize: 'clamp(9px, 1.3vh, 13px)' }}
                      >
                        <span>🔢</span>
                        <span>{level.digits} chữ số</span>
                      </div>
                      <div 
                        className="flex items-center justify-center gap-1 text-white/90 bg-black/20 rounded-full px-2 py-0.5"
                        style={{ fontSize: 'clamp(9px, 1.3vh, 13px)' }}
                      >
                        <span>📊</span>
                        <span>{level.numbers[0]}-{level.numbers[1]} số</span>
                      </div>
                    </div>
                    
                    {/* Bonus multiplier */}
                    {!isLocked && (
                      <div 
                        className="mt-2 bg-yellow-400/30 text-yellow-100 font-bold rounded-full text-center"
                        style={{ 
                          fontSize: 'clamp(9px, 1.2vh, 12px)',
                          padding: 'clamp(2px, 0.4vh, 6px) clamp(6px, 1vh, 12px)'
                        }}
                      >
                        ⭐ x{level.bonusMultiplier * 2} điểm
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* CSS for shine animation */}
        <style jsx>{`
          @keyframes shine {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(200%) rotate(45deg); }
          }
        `}</style>
      </div>
    );
  }

  // Màn hình chọn CẤP ĐỘ - GAMING STYLE (cho các mode khác)
  if (selectedMode && !selectedDifficulty) {
    const modeData = modeInfo[selectedMode];
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-x-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `clamp(15px, ${2 + Math.random() * 4}vh, 60px)`,
                height: `clamp(15px, ${2 + Math.random() * 4}vh, 60px)`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 3}s`
              }}
            />
          ))}
          <div className="absolute top-1/3 left-1/4 w-[25vh] h-[25vh] bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-[20vh] h-[20vh] bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header - Back trái, Logo phải */}
          <div 
            className="flex-shrink-0"
            style={{ padding: 'clamp(8px, 1.5vh, 16px) clamp(12px, 2.5vw, 28px)' }}
          >
            <div className="flex items-center justify-between">
              <button
                onClick={backToModeSelect}
                className="flex items-center bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 transition-all border border-white/20 shadow-lg"
                style={{ 
                  padding: 'clamp(6px, 1vh, 12px)',
                  borderRadius: 'clamp(10px, 1.5vh, 20px)'
                }}
              >
                <ArrowLeft style={{ width: 'clamp(16px, 2.5vh, 24px)', height: 'clamp(16px, 2.5vh, 24px)' }} />
              </button>
              <div 
                className="font-black text-white flex items-center bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-md border border-white/20 shadow-lg"
                style={{ 
                  fontSize: 'clamp(12px, 2.5vh, 24px)', 
                  gap: 'clamp(4px, 0.8vw, 12px)',
                  padding: 'clamp(4px, 0.8vh, 10px) clamp(10px, 1.5vw, 20px)',
                  borderRadius: 'clamp(14px, 2vh, 28px)'
                }}
              >
                <span style={{ fontSize: 'clamp(14px, 3vh, 30px)' }}>{modeData.icon}</span> 
                <span className="whitespace-nowrap">{modeData.title}</span>
              </div>
              <Link
                href="/dashboard"
                prefetch={true}
                className="flex items-center bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 transition-all border border-white/20 shadow-lg"
                style={{ 
                  padding: 'clamp(4px, 0.8vh, 10px)',
                  borderRadius: 'clamp(12px, 2vh, 24px)'
                }}
              >
                <Logo size="xs" showText={false} />
              </Link>
            </div>
          </div>

          {/* Bước hiện tại */}
          <div style={{ padding: '0 clamp(12px, 2.5vw, 28px)', marginBottom: 'clamp(12px, 2vh, 24px)' }}>
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-400">
                <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Chế độ</span>
              </div>
              <div className="w-8 h-0.5 bg-white/30"></div>
              <div className="flex items-center gap-1 text-white">
                <span className="w-5 h-5 rounded-full bg-white text-purple-900 flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Cấp độ</span>
              </div>
              <div className="w-8 h-0.5 bg-white/30"></div>
              <div className="flex items-center gap-1 text-white/50">
                <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Số câu</span>
              </div>
            </div>
          </div>

          {/* Chọn cấp độ */}
          <div style={{ padding: '0 clamp(12px, 2.5vw, 28px)' }}>
            <div className="text-center mb-4">
              <h2 className="text-white text-lg sm:text-xl font-bold mb-1">⚔️ Chọn Cấp Độ</h2>
              <p className="text-white/60 text-sm">Cấp độ càng cao, số càng lớn!</p>
            </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" style={{ paddingBottom: 'clamp(20px, 5vh, 60px)' }}>
            {[1, 2, 3, 4, 5].map((diff) => {
              const diffData = difficultyInfo[diff];
              const arenaName = arenaNames[selectedMode]?.[diff] || { title: diffData.label, icon: '🎯' };
              const diffColors = {
                1: 'from-green-400 to-emerald-500',
                2: 'from-blue-400 to-cyan-500',
                3: 'from-yellow-400 to-orange-500',
                4: 'from-red-400 to-rose-500',
                5: 'from-purple-500 to-pink-600'
              };
              const diffGlows = {
                1: 'shadow-green-500/50',
                2: 'shadow-blue-500/50',
                3: 'shadow-yellow-500/50',
                4: 'shadow-red-500/50',
                5: 'shadow-purple-500/50'
              };
              const diffDesc = {
                1: 'Số 1 chữ số',
                2: 'Số 2 chữ số',
                3: 'Số 3 chữ số',
                4: 'Số 4 chữ số',
                5: 'Số 5 chữ số'
              };
              const diffExample = {
                1: 'VD: 5 + 3',
                2: 'VD: 25 + 47',
                3: 'VD: 234 + 567',
                4: 'VD: 1234 + 5678',
                5: 'VD: 12345 + 67890'
              };
              const diffRecommend = {
                1: '🐣 Số nhỏ',
                2: '⚔️ Vừa sức',
                3: '🛡️ Thử thách',
                4: '🔥 Cao cấp',
                5: '👑 Đỉnh cao'
              };
              
              // Kiểm tra cấp độ có bị khóa không
              const maxDifficulty = userTier === 'free' ? 2 : userTier === 'basic' ? 3 : 5;
              const isDifficultyLocked = diff > maxDifficulty;
              
              return (
                <button
                  key={diff}
                  onClick={() => {
                    if (isDifficultyLocked) {
                      toast.warning(`Cấp độ ${diff} cần nâng cấp gói để mở khóa`);
                      router.push('/pricing');
                      return;
                    }
                    selectDifficultyAndContinue(diff);
                  }}
                  className={`bg-gradient-to-br ${diffColors[diff]} rounded-2xl shadow-xl ${diffGlows[diff]} hover:shadow-2xl transform hover:scale-[1.05] active:scale-95 transition-all text-white text-center relative overflow-hidden group ${diff === 5 ? 'animate-pulse' : ''}`}
                  style={{
                    padding: 'clamp(12px, 2vh, 24px)',
                    boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                >
                  {/* Animated shine effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                      animation: 'shine 1.5s infinite'
                    }}
                  ></div>
                  
                  {/* Lock icon */}
                  {isDifficultyLocked && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center">
                      <div className="text-3xl">🔒</div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all"></div>
                  {diff === 1 && !isDifficultyLocked && (
                    <div className="absolute -top-1 -right-1 bg-green-400 text-green-900 text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg rounded-tr-xl z-20 animate-bounce">
                      GỢI Ý
                    </div>
                  )}
                  <div 
                    className={`z-10 relative drop-shadow-2xl group-hover:scale-110 transition-transform ${isDifficultyLocked ? 'opacity-60' : ''}`}
                    style={{ fontSize: 'clamp(36px, 7vh, 64px)', marginBottom: 'clamp(4px, 1vh, 12px)' }}
                  >
                    {arenaName.icon}
                  </div>
                  <div className={`text-sm sm:text-base font-black z-10 relative drop-shadow-sm ${isDifficultyLocked ? 'opacity-60' : ''}`}>{arenaName.title}</div>
                  <div className={`text-[10px] sm:text-xs z-10 relative flex items-center justify-center gap-1 mt-1 ${isDifficultyLocked ? 'opacity-50' : 'text-white/95'}`}>
                    <span>{diffData.emoji}</span>
                    <span>{diffData.label}</span>
                  </div>
                  <div className={`text-[10px] mt-1 z-10 relative ${isDifficultyLocked ? 'opacity-50' : 'text-white/85'}`}>
                    {isDifficultyLocked ? 'Cần nâng cấp' : diffDesc[diff]}
                  </div>
                  <div className={`text-[9px] mt-0.5 z-10 relative ${isDifficultyLocked ? 'opacity-40' : 'text-white/75'}`}>
                    {!isDifficultyLocked && diffExample[diff]}
                  </div>
                  <div className={`text-[10px] mt-1 z-10 relative bg-black/30 rounded-full px-2 py-0.5 ${isDifficultyLocked ? 'opacity-50' : 'text-white/90'}`}>
                    {diffRecommend[diff]} • ⭐x{diff * 2}
                  </div>
                </button>
              );
            })}
            </div>
          </div>
        </div>
        
        {/* CSS for shine animation */}
        <style jsx>{`
          @keyframes shine {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(200%) rotate(45deg); }
          }
        `}</style>
      </div>
    );
  }

  // Màn hình chọn SỐ CÂU HỎI - GAMING STYLE
  if (selectedMode && selectedDifficulty && !selectedQuestionCount) {
    const modeData = modeInfo[selectedMode];
    const diffData = difficultyInfo[selectedDifficulty];
    const arenaName = arenaNames[selectedMode]?.[selectedDifficulty] || { title: diffData.label, icon: '🎯' };
    
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-x-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `clamp(15px, ${2 + Math.random() * 4}vh, 60px)`,
                height: `clamp(15px, ${2 + Math.random() * 4}vh, 60px)`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 3}s`
              }}
            />
          ))}
          <div className="absolute top-1/3 left-1/4 w-[25vh] h-[25vh] bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-[20vh] h-[20vh] bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header - Back trái, Logo phải */}
          <div 
            className="flex-shrink-0"
            style={{ padding: 'clamp(8px, 1.5vh, 16px) clamp(12px, 2.5vw, 28px)' }}
          >
            <div className="flex items-center justify-between">
              <button
                onClick={backToDifficultySelect}
                className="flex items-center bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 transition-all border border-white/20 shadow-lg"
                style={{ 
                  padding: 'clamp(6px, 1vh, 12px)',
                  borderRadius: 'clamp(10px, 1.5vh, 20px)'
                }}
              >
                <ArrowLeft style={{ width: 'clamp(16px, 2.5vh, 24px)', height: 'clamp(16px, 2.5vh, 24px)' }} />
              </button>
              <div 
                className="font-black text-white flex items-center bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-md border border-white/20 shadow-lg"
                style={{ 
                  fontSize: 'clamp(12px, 2.5vh, 24px)', 
                  gap: 'clamp(4px, 0.8vw, 12px)',
                  padding: 'clamp(4px, 0.8vh, 10px) clamp(10px, 1.5vw, 20px)',
                  borderRadius: 'clamp(14px, 2vh, 28px)'
                }}
              >
                <span style={{ fontSize: 'clamp(14px, 3vh, 30px)' }}>{arenaName.icon}</span> 
                <span className="whitespace-nowrap">{arenaName.title}</span>
              </div>
              <Link
                href="/dashboard"
                prefetch={true}
                className="flex items-center bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 transition-all border border-white/20 shadow-lg"
                style={{ 
                  padding: 'clamp(4px, 0.8vh, 10px)',
                  borderRadius: 'clamp(12px, 2vh, 24px)'
                }}
              >
                <Logo size="xs" showText={false} />
              </Link>
            </div>
          </div>

          {/* Bước hiện tại */}
          <div style={{ padding: '0 clamp(12px, 2.5vw, 28px)', marginBottom: 'clamp(12px, 2vh, 24px)' }}>
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-400">
                <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Chế độ</span>
              </div>
              <div className="w-8 h-0.5 bg-green-500"></div>
              <div className="flex items-center gap-1 text-green-400">
                <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Cấp độ</span>
              </div>
              <div className="w-8 h-0.5 bg-white/30"></div>
              <div className="flex items-center gap-1 text-white">
                <span className="w-5 h-5 rounded-full bg-white text-purple-900 flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Số câu</span>
              </div>
            </div>
          </div>

          {/* Thông tin đã chọn */}
          <div className="px-4 mb-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-white">
                <span>{modeData.icon}</span>
                <span className="font-medium">{modeData.title}</span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-1 text-white">
                <span>{diffData.emoji}</span>
                <span className="font-medium">{diffData.label}</span>
              </div>
            </div>
          </div>

          {/* Chọn số câu */}
          <div className="px-4">
            <div className="text-center mb-4">
              <h2 className="text-white text-lg sm:text-xl font-bold mb-1">📝 Chọn Số Câu Hỏi</h2>
              <p className="text-white/60 text-sm">Càng nhiều câu, càng thử thách!</p>
            </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ paddingBottom: 'clamp(20px, 5vh, 60px)' }}>
            {questionCounts.map((q, index) => {
              const isRecommended = q.value === 10;
              return (
                <button
                  key={q.value}
                  onClick={() => selectQuestionCountAndContinue(q.value)}
                  className={`bg-gradient-to-br ${q.color} rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.05] active:scale-95 transition-all text-white text-center relative overflow-hidden group ${index === questionCounts.length - 1 ? 'animate-pulse' : ''}`}
                  style={{
                    padding: 'clamp(12px, 2vh, 24px)',
                    boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                >
                  {/* Animated shine effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                      animation: 'shine 1.5s infinite'
                    }}
                  ></div>
                  
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all"></div>
                  
                  {isRecommended && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg rounded-tr-xl z-20 animate-bounce">
                      GỢI Ý
                    </div>
                  )}
                  
                  <div 
                    className="z-10 relative drop-shadow-2xl group-hover:scale-110 transition-transform"
                    style={{ fontSize: 'clamp(28px, 5vh, 48px)', marginBottom: 'clamp(4px, 1vh, 12px)' }}
                  >
                    {q.emoji}
                  </div>
                  <div 
                    className="font-black z-10 relative drop-shadow-sm"
                    style={{ fontSize: 'clamp(14px, 2.2vh, 20px)' }}
                  >
                    {q.label}
                  </div>
                  <div 
                    className="z-10 relative mt-1 text-white/90"
                    style={{ fontSize: 'clamp(10px, 1.5vh, 14px)' }}
                  >
                    {q.desc}
                  </div>
                  <div 
                    className="mt-2 z-10 relative bg-yellow-400/30 text-yellow-100 font-bold rounded-full"
                    style={{ 
                      fontSize: 'clamp(9px, 1.2vh, 12px)',
                      padding: 'clamp(2px, 0.4vh, 6px) clamp(6px, 1vh, 12px)'
                    }}
                  >
                    ⭐ {q.value * selectedDifficulty * 2} max
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mẹo bổ sung */}
            <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-lg">🎯</span>
                  <div className="text-white/70">
                    <strong className="text-white">Lần đầu thi đấu?</strong> Chọn 5-10 câu để làm quen!
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg">🔥</span>
                  <div className="text-white/70">
                    <strong className="text-white">Muốn leo rank?</strong> Chọn 20-30 câu để luyện tập đều đặn!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CSS for shine animation */}
        <style jsx>{`
          @keyframes shine {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(200%) rotate(45deg); }
          }
        `}</style>
      </div>
    );
  }

  // Màn hình chi tiết đấu trường với bảng xếp hạng
  if (selectedArena && !gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-6xl mx-auto">
          {/* Header - Back trái, Logo phải */}
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={backToQuestionCountSelect}
              className="flex items-center bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 transition-all border border-white/20 shadow-lg"
              style={{ 
                padding: 'clamp(6px, 1vh, 12px)',
                borderRadius: 'clamp(10px, 1.5vh, 20px)'
              }}
            >
              <ArrowLeft style={{ width: 'clamp(16px, 2.5vh, 24px)', height: 'clamp(16px, 2.5vh, 24px)' }} />
            </button>
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span className="text-xl">{selectedArena.icon}</span> {selectedArena.title}
            </h1>
            <Link
              href="/dashboard"
              prefetch={true}
              className="flex items-center bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 transition-all border border-white/20 shadow-lg"
              style={{ 
                padding: 'clamp(4px, 0.8vh, 10px)',
                borderRadius: 'clamp(12px, 2vh, 24px)'
              }}
            >
              <Logo size="xs" showText={false} />
            </Link>
          </div>

          <div className="px-4 pb-8">
            {/* Arena Info */}
            <div className={`bg-gradient-to-br ${selectedArena.color} rounded-2xl p-6 mb-4 text-white text-center`}>
              <div className="text-5xl mb-2">{selectedArena.icon}</div>
              <h2 className="text-2xl font-black mb-1">{selectedArena.title}</h2>
              <div className="flex items-center justify-center gap-2 text-sm opacity-90 flex-wrap">
                <span>{modeInfo[selectedArena.mode]?.icon} {modeInfo[selectedArena.mode]?.title}</span>
                <span>•</span>
                <span>{difficultyInfo[selectedArena.difficulty]?.emoji} {difficultyInfo[selectedArena.difficulty]?.label}</span>
                <span>•</span>
                <span>📝 {totalChallenges} câu</span>
              </div>
              <p className="text-xs mt-2 opacity-80">Xếp hạng theo độ chính xác & tốc độ</p>
              
              <button
                onClick={startGame}
                className="mt-4 px-8 py-3 bg-white text-purple-700 font-black rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform text-lg"
              >
                ⚔️ VÀO THI ĐẤU
              </button>
            </div>

          {/* Bảng xếp hạng */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
            <h3 className="text-white font-bold flex items-center gap-2 mb-3">
              <Trophy size={20} className="text-yellow-400" />
              Bảng Xếp Hạng
              {totalPlayers > 0 && (
                <span className="text-white/50 text-xs font-normal">({totalPlayers} người chơi)</span>
              )}
            </h3>
            
            {loadingLeaderboard ? (
              <div className="text-center py-8 text-white/60">Đang tải...</div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <div className="text-4xl mb-2">🏅</div>
                <p>Chưa có ai thi đấu</p>
                <p className="text-sm">Hãy là người đầu tiên!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* TOP 3 - Hiển thị nổi bật */}
                {leaderboard.length >= 1 && (
                  <div className="flex items-end justify-center gap-2 sm:gap-4 py-4 bg-gradient-to-b from-yellow-500/10 to-transparent rounded-xl">
                    {/* Hạng 2 */}
                    {leaderboard[1] && (
                      <div className="flex flex-col items-center">
                        <div className="text-3xl sm:text-4xl mb-1">🥈</div>
                        <div className="bg-gray-500/20 rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-white font-bold text-xs mb-1">2</div>
                        <div className={`bg-gray-400/30 rounded-xl p-2 sm:p-3 text-center min-w-[80px] sm:min-w-[100px] max-w-[100px] sm:max-w-[120px] ${leaderboard[1].isCurrentUser ? 'ring-2 ring-cyan-400' : ''}`}>
                          <div className="text-white font-bold text-xs sm:text-sm break-words leading-tight min-h-[32px] flex items-center justify-center" title={leaderboard[1].userName}>{leaderboard[1].userName}</div>
                          <div className="text-white/70 text-[10px] sm:text-xs">✓ {Math.min(leaderboard[1].correct, totalChallenges)} đúng</div>
                          <div className="text-gray-300 text-[10px]">⏱ {leaderboard[1].totalTime}s</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Hạng 1 - Cao nhất */}
                    <div className="flex flex-col items-center -mt-4">
                      <div className="text-4xl sm:text-5xl mb-1 animate-bounce">🥇</div>
                      <div className="bg-yellow-500/30 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-white font-bold text-sm mb-1">1</div>
                      <div className={`bg-yellow-500/30 rounded-xl p-3 sm:p-4 text-center min-w-[96px] sm:min-w-[112px] max-w-[110px] sm:max-w-[130px] border-2 border-yellow-400/50 ${leaderboard[0].isCurrentUser ? 'ring-2 ring-cyan-400' : ''}`}>
                        <div className="text-white font-black text-sm sm:text-base break-words leading-tight min-h-[40px] flex items-center justify-center" title={leaderboard[0].userName}>{leaderboard[0].userName}</div>
                        <div className="text-yellow-200 text-xs sm:text-sm font-bold">✓ {Math.min(leaderboard[0].correct, totalChallenges)} đúng</div>
                        <div className="text-yellow-300 text-[10px] sm:text-xs">⏱ {leaderboard[0].totalTime}s</div>
                        <div className="text-yellow-400 font-bold text-xs mt-1">⭐ {leaderboard[0].stars}</div>
                      </div>
                    </div>
                    
                    {/* Hạng 3 */}
                    {leaderboard[2] && (
                      <div className="flex flex-col items-center">
                        <div className="text-3xl sm:text-4xl mb-1">🥉</div>
                        <div className="bg-orange-500/20 rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-white font-bold text-xs mb-1">3</div>
                        <div className={`bg-orange-500/30 rounded-xl p-2 sm:p-3 text-center min-w-[80px] sm:min-w-[100px] max-w-[100px] sm:max-w-[120px] ${leaderboard[2].isCurrentUser ? 'ring-2 ring-cyan-400' : ''}`}>
                          <div className="text-white font-bold text-xs sm:text-sm break-words leading-tight min-h-[32px] flex items-center justify-center" title={leaderboard[2].userName}>{leaderboard[2].userName}</div>
                          <div className="text-white/70 text-[10px] sm:text-xs">✓ {Math.min(leaderboard[2].correct, totalChallenges)} đúng</div>
                          <div className="text-orange-300 text-[10px]">⏱ {leaderboard[2].totalTime}s</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Top 4-20 */}
                {leaderboard.length > 3 && (
                  <div className="space-y-1.5 mt-2">
                    <div className="text-white/50 text-xs font-medium px-2">Xếp hạng tiếp theo</div>
                    {leaderboard.slice(3, 20).map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl transition-all ${
                          entry.isCurrentUser 
                            ? 'bg-cyan-500/30 ring-1 ring-cyan-400' 
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="w-7 sm:w-8 text-center font-bold text-sm text-white/70">
                          #{index + 4}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold text-xs sm:text-sm truncate ${entry.isCurrentUser ? 'text-cyan-300' : 'text-white'}`}>
                            {entry.userName} {entry.isCurrentUser && '(Bạn)'}
                          </div>
                          <div className="text-white/50 text-[10px] sm:text-xs">
                            ✓ {Math.min(entry.correct, totalChallenges)} đúng • ⏱ {entry.totalTime}s
                          </div>
                        </div>
                        <div className="text-yellow-400 font-bold text-xs sm:text-sm">
                          ⭐ {entry.stars}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Thứ hạng của user nếu không trong Top 20 */}
                {currentUserRank && currentUserRank > 20 && currentUserData && (
                  <div className="mt-4 pt-3 border-t border-white/20">
                    <div className="text-white/50 text-xs font-medium mb-2">📍 Thứ hạng của bạn</div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/20 ring-1 ring-cyan-400">
                      <div className="w-10 text-center">
                        <div className="font-black text-lg text-cyan-300">#{currentUserRank}</div>
                        <div className="text-[10px] text-white/50">/{totalPlayers}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-cyan-300 font-bold text-sm">{currentUserData.userName} (Bạn)</div>
                        <div className="text-white/60 text-xs">
                          ✓ {Math.min(currentUserData.correct, totalChallenges)} đúng • ⏱ {currentUserData.totalTime}s
                        </div>
                      </div>
                      <div className="text-yellow-400 font-bold text-sm">
                        ⭐ {currentUserData.stars}
                      </div>
                    </div>
                    <p className="text-white/40 text-xs text-center mt-2">
                      💪 Cố gắng lên! Còn {currentUserRank - 20} bậc nữa để vào Top 20!
                    </p>
                  </div>
                )}

                {/* Nếu chưa thi đấu */}
                {!currentUserRank && (
                  <div className="mt-3 p-3 bg-white/5 rounded-xl text-center">
                    <p className="text-white/60 text-xs">🎯 Bạn chưa thi đấu ở đấu trường này</p>
                    <p className="text-white/40 text-[10px]">Hãy thi đấu để lên bảng xếp hạng!</p>
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Complete Screen
  if (gameComplete) {
    const finalCorrect = sessionStats.correct;
    const accuracy = Math.round((finalCorrect / totalChallenges) * 100);
    const avgTimePerQuestion = sessionStats.totalTime / Math.max(1, totalChallenges);
    
    // Tính sao cuối cùng dùng công thức mới
    const finalStarsData = calculateCompeteStars(
      selectedArena.difficulty,
      finalCorrect,
      totalChallenges,
      avgTimePerQuestion,
      0, // rank - chưa có trong context này
      false // isImprovement
    );
    
    // Lời khen động viên theo chủ đề thi đấu
    const encouragements = {
      excellent: { 
        emoji: '🏆', 
        title: 'VÔ ĐỊCH!', 
        message: 'Bạn chiến thắng tuyệt đối!',
        color: 'text-yellow-400',
        bgGlow: 'shadow-yellow-500/50'
      },
      great: { 
        emoji: '🥇', 
        title: 'CHIẾN BINH XUẤT SẮC!', 
        message: 'Bạn chiến đấu rất giỏi!',
        color: 'text-green-400',
        bgGlow: 'shadow-green-500/50'
      },
      good: { 
        emoji: '⚔️', 
        title: 'CHIẾN BINH DŨNG CẢM!', 
        message: 'Luyện thêm sẽ mạnh hơn!',
        color: 'text-blue-400',
        bgGlow: 'shadow-blue-500/50'
      },
      improving: { 
        emoji: '🛡️', 
        title: 'ĐANG RÈN LUYỆN!', 
        message: 'Tiếp tục rèn luyện nhé!',
        color: 'text-orange-400',
        bgGlow: 'shadow-orange-500/50'
      },
      beginner: { 
        emoji: '🌟', 
        title: 'CHIẾN BINH TẬP SỰ!', 
        message: 'Mỗi trận đấu giúp bạn mạnh lên!',
        color: 'text-purple-400',
        bgGlow: 'shadow-purple-500/50'
      },
      keepTrying: { 
        emoji: '💪', 
        title: 'TIẾP TỤC CHIẾN ĐẤU!', 
        message: 'Đừng bỏ cuộc, chiến đấu tiếp nào!',
        color: 'text-pink-400',
        bgGlow: 'shadow-pink-500/50'
      }
    };
    
    const getEncouragement = () => {
      if (accuracy >= 90) return encouragements.excellent;
      if (accuracy >= 70) return encouragements.great;
      if (accuracy >= 50) return encouragements.good;
      if (accuracy >= 30) return encouragements.improving;
      if (accuracy >= 10) return encouragements.beginner;
      return encouragements.keepTrying;
    };
    
    const encouragement = getEncouragement();
    
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 max-w-md w-full text-center">
          <div className="text-6xl sm:text-7xl mb-3 animate-bounce">{encouragement.emoji}</div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">KẾT THÚC!</h1>
          <p className="text-white/70 mb-2 text-sm">{selectedArena.title}</p>
          
          <div className={`text-2xl sm:text-3xl font-black ${encouragement.color} mb-1`}>
            {encouragement.title}
          </div>
          <p className="text-white/80 text-sm mb-3 italic">"{encouragement.message}"</p>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-xl sm:text-2xl">⭐</div>
              <div className="text-xl sm:text-2xl font-black text-yellow-400">{finalStarsData.totalStars}</div>
              <div className="text-[10px] sm:text-xs text-white/60">Sao</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-xl sm:text-2xl">✓</div>
              <div className="text-xl sm:text-2xl font-black text-green-400">{finalCorrect}/{totalChallenges}</div>
              <div className="text-[10px] sm:text-xs text-white/60">Đúng</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-xl sm:text-2xl">🔥</div>
              <div className="text-xl sm:text-2xl font-black text-orange-400">{maxStreak}</div>
              <div className="text-[10px] sm:text-xs text-white/60">Combo</div>
            </div>
          </div>
          
          {/* Breakdown chi tiết sao */}
          <div className="bg-white/5 rounded-xl p-3 mb-3 text-left">
            <div className="text-[10px] text-white/60 mb-1 text-center font-semibold">Chi tiết điểm sao</div>
            {finalStarsData.breakdown.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-white/10 last:border-0">
                <span className="text-white/80">
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </span>
                <span className="text-yellow-400 font-bold">+{item.value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-sm pt-1 mt-1 border-t border-white/30">
              <span className="text-white font-bold">Tổng cộng</span>
              <span className="text-yellow-400 font-black">⭐ {finalStarsData.totalStars}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={playAgain}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-transform text-sm"
            >
              🔄 Thi lại
            </button>
            <button
              onClick={backToArenaDetail}
              className="flex-1 py-3 px-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors text-sm"
            >
              🏆 Xem BXH
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  const baseTime = 15 + selectedArena.difficulty * 5 + ((problem?.displayProblem?.match(/[+\-×÷]/g) || []).length) * 3;
  const timePercent = Math.min(100, (displayTimer / baseTime) * 100);
  const timerColor = timePercent < 60 ? 'bg-green-500' : timePercent < 85 ? 'bg-yellow-500' : 'bg-red-500';
  const hasInput = sorobanValue !== 0;
  const showingAnswer = result === false;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
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
            {celebrationData.multiplier > 1 && (
              <div className={`inline-block bg-gradient-to-r ${celebrationData.tierColor} text-white px-4 py-1 rounded-full font-black text-lg sm:text-xl mb-2 shadow-lg`}>
                x{celebrationData.multiplier} ĐIỂM!
              </div>
            )}
            {celebrationData.streakBonus && (
              <div className="text-xl sm:text-2xl text-orange-400 font-black mb-2 animate-pulse">
                {celebrationData.streakBonus.emoji} {celebrationData.streakBonus.text}
              </div>
            )}
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

      {/* Top bar */}
      <div className={`bg-gradient-to-r ${selectedArena.color} shadow-lg flex-shrink-0`}>
        <div className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-3">
          {/* Left: Back */}
          <button 
            onClick={backToArenaDetail}
            className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="flex-1 flex items-center gap-2">
            <div className="flex gap-0.5 flex-1">
              {[...Array(totalChallenges)].map((_, i) => {
                const challengeNum = i + 1;
                const resultStatus = challengeResults[i];
                let dotClass = 'bg-white/30';
                
                if (challengeNum < currentChallenge) {
                  if (resultStatus === 'correct') dotClass = 'bg-green-400';
                  else if (resultStatus === 'wrong') dotClass = 'bg-red-400';
                  else if (resultStatus === 'skipped') dotClass = 'bg-yellow-400';
                } else if (challengeNum === currentChallenge) {
                  dotClass = 'bg-white animate-pulse';
                }
                
                return <div key={i} className={`h-2.5 flex-1 rounded-full transition-all ${dotClass}`} />;
              })}
            </div>
            <div className="bg-white/30 px-2 py-0.5 rounded-full text-white font-bold text-xs whitespace-nowrap">
              {currentChallenge}/{totalChallenges}
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="text-xs sm:text-sm">{selectedArena.icon}</span>
              <span className="text-white font-bold text-[10px] sm:text-xs">{selectedArena.title}</span>
            </div>
            <div className="bg-yellow-400/90 text-yellow-900 px-1.5 sm:px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs shadow">
              +{sessionStats.stars}
            </div>
            {streak >= 2 && (
              <div className="bg-orange-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs shadow animate-pulse">
                🔥{streak}
              </div>
            )}
            {/* Right: Logo */}
            <Link 
              href="/dashboard"
              prefetch={true}
              className="p-1 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
              title="Về trang chủ"
            >
              <Logo size="xs" showText={false} />
            </Link>
          </div>
        </div>
      </div>

      {/* Problem display */}
      <div className="flex-shrink-0 bg-white/10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-2 sm:gap-4">
          <div className="text-white font-black text-xl sm:text-3xl md:text-4xl">
            {problem?.displayProblem}
          </div>
          <div className="text-white/60 text-xl sm:text-3xl md:text-4xl">=</div>
          
          {isMentalMode ? (
            <input
              ref={mentalInputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={mentalAnswer}
              onChange={(e) => {
                const val = e.target.value;
                if (/^-?\d*$/.test(val)) setMentalAnswer(val);
              }}
              onKeyDown={handleMentalKeyDown}
              onBlur={() => {
                if (result === null) setTimeout(() => mentalInputRef.current?.focus(), 10);
              }}
              disabled={result !== null}
              placeholder="?"
              autoFocus
              autoComplete="off"
              className={`font-black text-xl sm:text-3xl md:text-4xl px-3 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl w-20 sm:w-28 text-center transition-all outline-none ${
                result === true ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' 
                : showingAnswer ? 'bg-yellow-500 text-white'
                : 'bg-white text-purple-700 shadow-lg ring-2 sm:ring-4 ring-white/50'
              }`}
            />
          ) : (
            <div className={`font-black text-xl sm:text-3xl md:text-4xl px-4 sm:px-6 py-1 sm:py-2 rounded-xl sm:rounded-2xl min-w-[80px] sm:min-w-[100px] text-center transition-all ${
              result === true ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' 
              : showingAnswer ? 'bg-yellow-500 text-white'
              : hasInput ? 'bg-white text-purple-700 shadow-lg' 
              : 'bg-white/20 text-white/50'
            }`}>
              {showingAnswer ? problem?.answer : (hasInput ? sorobanValue : '?')}
            </div>
          )}
          
          <div className={`${timerColor} text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 sm:gap-2 shadow-lg text-sm sm:text-base`}>
            <Clock size={14} className="sm:w-[18px] sm:h-[18px]" />
            <span>{displayTimer}s</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 bg-black/20">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-center gap-2 sm:gap-3">
          {showingAnswer && (
            <span className="text-green-400 font-bold text-xs sm:text-sm bg-green-400/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
              ✓ {problem?.answer}
            </span>
          )}
          
          {result === null && !isMentalMode && (
            <button onClick={skipProblem} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/10 text-white/80 hover:bg-white/20 font-medium text-xs sm:text-sm">
              💡 Bỏ qua
            </button>
          )}
          
          {result === null && isMentalMode && (
            <>
              <button
                onClick={handleMentalSubmit}
                disabled={!mentalAnswer}
                className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 text-xs sm:text-sm"
              >
                ✓ Trả lời
              </button>
              <button onClick={skipProblem} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/10 text-white/80 hover:bg-white/20 font-medium text-xs sm:text-sm">
                💡 Bỏ qua
              </button>
            </>
          )}
          
          {(result !== null || showingAnswer) && (
            <button
              onClick={nextProblem}
              className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm"
            >
              {currentChallenge >= totalChallenges ? '🏆 Kết thúc' : '⚡ Tiếp'}
            </button>
          )}
          
          {!isMentalMode && (
            <button onClick={resetSoroban} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/10 text-white/80 hover:bg-white/20 font-medium text-xs sm:text-sm">
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Soroban hoặc Mental Math UI */}
      {isMentalMode ? (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-2 overflow-hidden">
          <div className="text-center w-full max-w-[280px]">
            <div className="text-3xl sm:text-5xl mb-1">🧠</div>
            <p className="text-white/80 text-[10px] sm:text-xs mb-2">
              Nhập số → <span className="bg-green-500 px-1 py-0.5 rounded font-bold">Enter</span>
            </p>
            
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

      <style jsx global>{`
        @keyframes scale-up {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up { animation: scale-up 0.5s ease-out forwards; }
        @keyframes spin-slow {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .animate-spin-slow { animation: spin-slow 1s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
