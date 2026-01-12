'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef, Suspense } from 'react';
import { ArrowLeft, Trophy, Clock, Home, RotateCcw, Medal, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/Toast/ToastContext';
import { useUpgradeModal } from '@/components/UpgradeModal';
import Logo from '@/components/Logo/Logo';
import { MonsterAvatar } from '@/components/MonsterAvatar';
import SorobanBoard from '@/components/Soroban/SorobanBoard';
import { calculateCompeteStars } from '@/lib/gamification';
import { MilestoneCelebration } from '@/components/SoftUpgradeTrigger';
import GameModeHeader from '@/components/GameModeHeader/GameModeHeader';
import { useGameSound } from '@/lib/useGameSound';

import { getNextZoneAfterStage as getNextZoneAddSub } from '@/config/adventure-stages-addsub.config';
import { getNextZoneAfterStage as getNextZoneMulDiv } from '@/config/adventure-stages-muldiv.config';

// Helper to parse avatar index from database
const getAvatarIndex = (user) => {
  if (!user?.avatar) return null;
  const parsed = parseInt(user.avatar, 10);
  return isNaN(parsed) ? null : parsed;
};

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
  5: { label: 'Huyền Thoại', emoji: '👑' },
  6: { label: 'Siêu Huyền Thoại', emoji: '💎' }
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
    6: { title: 'SIÊU BIG BANG', icon: '🌌' },
  },
};

// Cấu hình Flash Anzan levels cho thi đấu - CHỈ CÓ TỐC ĐỘ
const flashLevelsCompete = [
  {
    id: 'anhNen',
    level: 1,
    name: 'Ánh Nến',
    subtitle: 'Lung linh dịu dàng',
    emoji: '🕯️',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'from-amber-50 to-orange-50',
    glowColor: 'shadow-amber-400/50',
    numbers: [3, 4],
    speed: [3, 3],
    stars: 2,
    tagline: 'Khởi đầu ấm áp',
    rank: '⭐',
    rankLabel: 'Tập Sự',
    bonusMultiplier: 1
  },
  {
    id: 'anhTrang',
    level: 2,
    name: 'Ánh Trăng',
    subtitle: 'Huyền ảo đêm thanh',
    emoji: '🌙',
    color: 'from-slate-300 to-blue-400',
    bgColor: 'from-slate-50 to-blue-50',
    glowColor: 'shadow-blue-300/50',
    numbers: [4, 5],
    speed: [2.5, 2.5],
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
    bgColor: 'from-yellow-50 to-amber-50',
    glowColor: 'shadow-yellow-400/50',
    numbers: [5, 6],
    speed: [2, 2],
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
    bgColor: 'from-purple-50 to-pink-50',
    glowColor: 'shadow-purple-400/50',
    numbers: [6, 7],
    speed: [1.5, 1.5],
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
    bgColor: 'from-red-50 to-yellow-50',
    glowColor: 'shadow-red-500/50',
    numbers: [7, 8],
    speed: [1, 1],
    stars: 10,
    tagline: '💥 VỤ NỔ VŨ TRỤ 💥',
    rank: '👑',
    rankLabel: 'THẦN',
    bonusMultiplier: 5
  },
  {
    id: 'sieuBigBang',
    level: 6,
    name: 'SIÊU BIG BANG',
    subtitle: 'Đỉnh cao tốc độ',
    emoji: '🌌',
    color: 'from-fuchsia-500 via-purple-600 to-indigo-700',
    bgColor: 'from-fuchsia-50 to-indigo-50',
    glowColor: 'shadow-fuchsia-500/50',
    numbers: [8, 10],
    speed: [0.7, 0.7],
    stars: 15,
    tagline: '🌌 SIÊU VŨ TRỤ 🌌',
    rank: '👑👑',
    rankLabel: 'THẦN THÁNH',
    bonusMultiplier: 8
  },
];

// Cấu hình số chữ số cho Flash Anzan
const flashDigitOptions = [
  { id: 1, name: '1 chữ số', emoji: '1️⃣', color: 'from-green-400 to-emerald-500', description: '1-9' },
  { id: 2, name: '2 chữ số', emoji: '2️⃣', color: 'from-blue-400 to-cyan-500', description: '10-99' },
  { id: 3, name: '3 chữ số', emoji: '3️⃣', color: 'from-purple-400 to-pink-500', description: '100-999' },
];

// Cấu hình phép toán cho Flash Anzan (chỉ có Cộng và Cộng Trừ Mix)
const flashOperationOptions = [
  { id: 'addition', name: 'Phép Cộng', emoji: '➕', symbol: '+', color: 'from-green-400 to-emerald-500', description: 'Chỉ có phép cộng' },
  { id: 'mixed', name: 'Cộng Trừ Mix', emoji: '➕➖', symbol: '±', color: 'from-orange-400 to-red-500', description: 'Xen kẽ cộng và trừ' },
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

// Helper: Kiểm tra tier có đủ quyền truy cập mode không
function getRequiredTierForMode(mode) {
  const modeTiers = {
    addition: 'free',
    subtraction: 'free',
    addSubMixed: 'basic',
    multiplication: 'advanced',
    division: 'advanced',
    mulDiv: 'advanced',
    mixed: 'advanced',
    mentalMath: 'advanced',
    flashAnzan: 'advanced'
  };
  return modeTiers[mode] || 'free';
}

function getRequiredTierForDifficulty(difficulty) {
  if (difficulty <= 2) return 'free';
  if (difficulty <= 3) return 'basic';
  return 'advanced';
}

function canAccessMode(userTier, mode) {
  const requiredTier = getRequiredTierForMode(mode);
  const tierOrder = { free: 0, basic: 1, advanced: 2, vip: 3 };
  return (tierOrder[userTier] || 0) >= (tierOrder[requiredTier] || 0);
}

function canAccessDifficulty(userTier, difficulty) {
  const requiredTier = getRequiredTierForDifficulty(difficulty);
  const tierOrder = { free: 0, basic: 1, advanced: 2, vip: 3 };
  return (tierOrder[userTier] || 0) >= (tierOrder[requiredTier] || 0);
}

function getTierDisplayName(tier) {
  const names = { free: 'Miễn Phí', basic: 'Cơ Bản', advanced: 'Nâng Cao', vip: 'VIP' };
  return names[tier] || tier;
}

// Inner component that uses useSearchParams
function CompetePageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { showUpgradeModal, UpgradeModalComponent } = useUpgradeModal();
  const { play, playMusic, stopMusic } = useGameSound();

  // 🎵 Background music disabled - chỉ giữ sound effects
  // useEffect(() => {
  //   let musicStarted = false;
  //   const startMusic = () => {
  //     if (musicStarted) return;
  //     musicStarted = true;
  //     setTimeout(() => playMusic('battle'), 100);
  //   };
  //   document.addEventListener('click', startMusic);
  //   document.addEventListener('touchstart', startMusic);
  //   document.addEventListener('keydown', startMusic);
  //   return () => {
  //     document.removeEventListener('click', startMusic);
  //     document.removeEventListener('touchstart', startMusic);
  //     document.removeEventListener('keydown', startMusic);
  //     stopMusic(true);
  //   };
  // }, []);

  // Get mode from URL query params
  const modeFromUrl = searchParams.get('mode');

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
  const [isCheckingAutoStart, setIsCheckingAutoStart] = useState(true); // 🔧 FIX: Tránh nháy màn chọn mode
  
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
  
  // Mental Math sub-mode state
  const [mentalSubMode, setMentalSubMode] = useState(null);
  
  // 🔧 FIX: Ngăn auto-check ngay sau khi chuyển câu (tránh false positive khi làm nhanh)
  const problemChangeTimeRef = useRef(0);
  const AUTO_CHECK_DELAY = 300; // ms - delay tối thiểu sau khi chuyển câu mới được auto-check
  
  // User tier state
  const [userTier, setUserTier] = useState('free');
  
  // Soft upgrade triggers state
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [milestoneData, setMilestoneData] = useState(null);
  
  // Flash Anzan states
  const [flashPhase, setFlashPhase] = useState('idle'); // 'idle' | 'countdown' | 'showing' | 'answer' | 'result'
  const [flashNumbers, setFlashNumbers] = useState([]);
  const [flashOperations, setFlashOperations] = useState([]); // Các phép tính (+/-) cho từng số
  const [flashCurrentIndex, setFlashCurrentIndex] = useState(0);
  const [flashAnswer, setFlashAnswer] = useState('');
  const [flashCorrectAnswer, setFlashCorrectAnswer] = useState(0);
  const [flashCountdown, setFlashCountdown] = useState(3);
  const [flashShowingNumber, setFlashShowingNumber] = useState(null);
  const [flashShowingOperation, setFlashShowingOperation] = useState(null); // Phép tính đang hiện (+/-)
  const [flashAnswerTimer, setFlashAnswerTimer] = useState(0);
  const [flashResultMessage, setFlashResultMessage] = useState(null);
  const flashInputRef = useRef(null);
  const flashTimeoutRef = useRef(null);
  const flashAnswerTimerRef = useRef(null);

  // Flash Anzan Mode Selection states
  const [flashSelectedDigits, setFlashSelectedDigits] = useState(null); // 1, 2, hoặc 3 chữ số
  const [flashSelectedOperation, setFlashSelectedOperation] = useState(null); // 'addition', 'subtraction', hoặc 'mixed'
  const [flashModeStep, setFlashModeStep] = useState('digits'); // 'digits' | 'operation' | 'speed'

  // 🎮 GAME MODE: Theo dõi nếu đang chơi từ Adventure Map
  const [gameMode, setGameMode] = useState(null);

  // 🎮 GAME MODE: Helper function để quay về Adventure với đúng zone
  // Nếu vượt qua màn cuối của zone -> tự động chuyển sang zone mới
  const handleBackToGame = (passed = false) => {
    if (gameMode?.zoneId) {
      let targetZoneId = gameMode.zoneId;
      
      // Nếu đã pass và đây là màn cuối zone -> chuyển sang zone tiếp theo
      if (passed && gameMode.stageId) {
        const getNextZone = gameMode.mapType === 'muldiv' ? getNextZoneMulDiv : getNextZoneAddSub;
        const nextZone = getNextZone(gameMode.stageId);
        if (nextZone) {
          targetZoneId = nextZone.zoneId;
        }
      }
      
      const returnData = {
        zoneId: targetZoneId,
        mapType: gameMode.mapType || 'addsub',
        timestamp: Date.now()
      };
      sessionStorage.setItem('adventureReturnZone', JSON.stringify(returnData));
    } else {
      console.warn('⚠️ [Compete] gameMode.zoneId is missing:', gameMode);
    }
    // Clear game mode data
    sessionStorage.removeItem('competeGameMode');
    sessionStorage.removeItem('competeAutoStart');
    router.push('/adventure');
  };

  // 🎮 GAME MODE: Helper để xử lý back button
  const handleBack = () => {
    if (gameMode?.from === 'adventure') {
      handleBackToGame(false);
    } else {
      setSelectedMode(null);
    }
  };

  // 🎯 BROWSER BACK: Lưu zone info khi unmount để xử lý browser back button
  useEffect(() => {
    // Lưu function để dùng trong cleanup
    const saveReturnZone = () => {
      const gameModeRaw = sessionStorage.getItem('competeGameMode');
      if (gameModeRaw) {
        try {
          const gm = JSON.parse(gameModeRaw);
          if (gm.from === 'adventure' && gm.zoneId) {
            sessionStorage.setItem('adventureReturnZone', JSON.stringify({
              zoneId: gm.zoneId,
              mapType: gm.mapType || 'addsub',
              timestamp: Date.now()
            }));
          }
        } catch (e) {}
      }
    };

    // Handle browser back button (popstate)
    const handlePopState = () => {
      saveReturnZone();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Cleanup: lưu zone khi unmount (browser back hoặc navigation)
      saveReturnZone();
    };
  }, []);

  // Danh sách lời khen và động viên cho Flash Anzan
  const praiseMessages = [
    { emoji: '🎉', title: 'XUẤT SẮC!', msg: 'Bạn giỏi quá! Đáp án hoàn toàn chính xác!' },
    { emoji: '🌟', title: 'TUYỆT VỜI!', msg: 'Trí nhớ của bạn thật phi thường!' },
    { emoji: '🏆', title: 'SIÊU ĐỈNH!', msg: 'Bạn tính nhẩm nhanh như máy tính!' },
    { emoji: '👏', title: 'GIỎI LẮM!', msg: 'Bạn làm đúng rồi! Tiếp tục phát huy nhé!' },
    { emoji: '🚀', title: 'THẦN TỐC!', msg: 'Tốc độ tính toán của bạn thật ấn tượng!' },
  ];
  const encourageMessages = [
    { emoji: '💪', title: 'CỐ LÊN NÀO!', msg: 'Đừng lo, sai là cách học tốt nhất!' },
    { emoji: '🌈', title: 'ĐỪNG BỎ CUỘC!', msg: 'Mỗi lần thử là một bước tiến bộ!' },
    { emoji: '⭐', title: 'GẦN ĐÚNG RỒI!', msg: 'Bạn cần luyện tập thêm một chút!' },
    { emoji: '🎯', title: 'THỬ LẠI NHÉ!', msg: 'Tập trung hơn, bạn sẽ làm được!' },
  ];

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // 🎮 GAME MODE: Đọc game mode info từ sessionStorage (từ Adventure Map)
  // ⚠️ QUAN TRỌNG: useEffect này phải chạy TRƯỚC useEffect xử lý URL params
  // để ưu tiên auto-start từ Adventure Map
  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }
    if (selectedArena) {
      // Đã có arena rồi (game đang chơi), không auto-start nữa
      setIsCheckingAutoStart(false);
      return;
    }

    // 🔧 FIX: Check competeGameMode TRƯỚC, không check selectedMode ở đây
    // Vì useEffect URL params có thể đã set selectedMode trước
    // Check competeGameMode (set từ Adventure handleStageClick)
    const gameModeRaw = sessionStorage.getItem('competeGameMode');
    if (gameModeRaw) {
      try {
        const gameModeData = JSON.parse(gameModeRaw);
        // Check if data is recent (within 30 minutes)
        if (Date.now() - gameModeData.timestamp < 30 * 60 * 1000) {
          setGameMode(gameModeData);
          
          // 🚀 AUTO-START: Từ Adventure → tự động bắt đầu với 10 câu mặc định
          // ⚠️ Tier check đã được thực hiện trên map (adventure/page.jsx) trước khi navigate đến đây
          if (gameModeData.from === 'adventure' && gameModeData.mode) {
            const mode = gameModeData.mode;
            const difficulty = gameModeData.difficulty || 1;
            const questions = gameModeData.questions || 10;
            
            // Tạo arena và bắt đầu ngay - SET TẤT CẢ STATES để bypass toàn bộ màn chọn
            const autoArena = createArena(mode, difficulty, questions);
            setSelectedMode(mode); // 🔧 Bypass màn chọn mode
            setSelectedDifficulty(difficulty); // 🔧 Bypass màn chọn difficulty
            setSelectedQuestionCount(questions); // 🔧 Bypass màn chọn số câu
            setSelectedArena(autoArena);
            setTotalChallenges(questions);
            
            // 🧠 MENTAL MATH: Set mentalSubMode để bypass màn chọn sub-mode
            if (mode === 'mentalMath') {
              setMentalSubMode('addSubMixed'); // Mặc định dùng Cộng Trừ Mix
            }
            
            // ⚡ FLASH ANZAN: Set các states để bypass màn chọn digits/operation/speed
            if (mode === 'flashAnzan') {
              setFlashSelectedDigits(1); // Mặc định 1 chữ số
              setFlashSelectedOperation('addition'); // Mặc định phép cộng
              setFlashModeStep('speed'); // Đã chọn xong digits và operation
            }
            
            // KHÔNG set isCheckingAutoStart = false ở đây - giữ loading cho đến khi setTimeout xong
            
            // Delay nhỏ rồi start game
            setTimeout(() => {
              // 🔧 FIX: Đánh dấu thời điểm bắt đầu game
              problemChangeTimeRef.current = Date.now();
              
              // Start game trực tiếp
              const actualMode = mode === 'mentalMath' ? getRandomMentalMode() : mode;
              setProblem(generateProblem(actualMode, difficulty));
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
              setIsCheckingAutoStart(false); // 🔧 Set sau khi game đã start
              setSorobanKey(prev => prev + 1);
              
              if (mode === 'mentalMath') {
                setTimeout(() => mentalInputRef.current?.focus(), 100);
              }
              
              // Nếu là Flash Anzan, bắt đầu flow khác - TRUYỀN difficulty trực tiếp
              if (mode === 'flashAnzan') {
                startFlashChallenge(difficulty);
              }
            }, 100);
            
            return; // Đã xử lý xong
          }
        }
      } catch (e) {
        console.error('[Compete] Error parsing game mode:', e);
      }
    }

    // Fallback: Check competeAutoStart (set từ /compete/auto page)
    const autoStartRaw = sessionStorage.getItem('competeAutoStart');
    if (autoStartRaw && !gameModeRaw) {
      try {
        const autoStartData = JSON.parse(autoStartRaw);
        if (Date.now() - autoStartData.timestamp < 30 * 60 * 1000) {
          setGameMode(autoStartData);
          
          // 🚀 AUTO-START: Từ /compete/auto → cũng tự động bắt đầu
          if (autoStartData.from === 'adventure' && autoStartData.mode) {
            const mode = autoStartData.mode;
            const difficulty = autoStartData.difficulty || 1;
            const questions = autoStartData.questions || 10;
            
            const autoArena = createArena(mode, difficulty, questions);
            setSelectedMode(mode); // 🔧 Bypass màn chọn mode
            setSelectedDifficulty(difficulty); // 🔧 Bypass màn chọn difficulty
            setSelectedQuestionCount(questions); // 🔧 Bypass màn chọn số câu
            setSelectedArena(autoArena);
            setTotalChallenges(questions);
            
            // 🧠 MENTAL MATH: Set mentalSubMode để bypass màn chọn sub-mode
            if (mode === 'mentalMath') {
              setMentalSubMode('addSubMixed'); // Mặc định dùng Cộng Trừ Mix
            }
            
            // ⚡ FLASH ANZAN: Set các states để bypass màn chọn digits/operation/speed
            if (mode === 'flashAnzan') {
              setFlashSelectedDigits(1); // Mặc định 1 chữ số
              setFlashSelectedOperation('addition'); // Mặc định phép cộng
              setFlashModeStep('speed'); // Đã chọn xong digits và operation
            }
            
            // KHÔNG set isCheckingAutoStart = false ở đây - giữ loading cho đến khi setTimeout xong
            
            setTimeout(() => {
              // 🔧 FIX: Đánh dấu thời điểm bắt đầu game
              problemChangeTimeRef.current = Date.now();
              
              const actualMode = mode === 'mentalMath' ? getRandomMentalMode() : mode;
              setProblem(generateProblem(actualMode, difficulty));
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
              setIsCheckingAutoStart(false); // 🔧 Set sau khi game đã start
              setSorobanKey(prev => prev + 1);
              
              if (mode === 'mentalMath') {
                setTimeout(() => mentalInputRef.current?.focus(), 100);
              }
              
              // Nếu là Flash Anzan, bắt đầu flow khác - TRUYỀN difficulty trực tiếp
              if (mode === 'flashAnzan') {
                startFlashChallenge(difficulty);
              }
            }, 100);
            
            return; // Đã xử lý xong
          }
        }
      } catch (e) {
        console.error('[Compete] Error parsing auto-start:', e);
      }
    }
    
    // Không có auto-start data từ sessionStorage, hiện màn chọn mode
    setIsCheckingAutoStart(false);
  }, [status, selectedArena]);

  // 🔗 AUTO-START FROM URL: Xử lý query params (fallback khi không có sessionStorage)
  // Chỉ set mode để user chọn tiếp các bước khác
  useEffect(() => {
    if (status !== 'authenticated') return;
    if (selectedMode) return; // Đã chọn mode rồi (từ sessionStorage hoặc user click)
    if (isCheckingAutoStart) return; // Đang check sessionStorage, chưa set mode

    if (modeFromUrl && modeInfo[modeFromUrl]) {
      // Chỉ set mode, user sẽ chọn tiếp difficulty và số câu
      setSelectedMode(modeFromUrl);
    }
  }, [status, modeFromUrl, selectedMode, isCheckingAutoStart]);

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

  // Timer đồng hồ bấm giờ cho Flash Anzan answer phase (copy từ practice)
  useEffect(() => {
    if (flashPhase === 'answer') {
      setFlashAnswerTimer(0);
      flashAnswerTimerRef.current = setInterval(() => {
        setFlashAnswerTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (flashAnswerTimerRef.current) {
        clearInterval(flashAnswerTimerRef.current);
      }
    }
    return () => {
      if (flashAnswerTimerRef.current) {
        clearInterval(flashAnswerTimerRef.current);
      }
    };
  }, [flashPhase]);

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

  // Cleanup Flash timeouts
  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (flashAnswerTimerRef.current) clearInterval(flashAnswerTimerRef.current);
    };
  }, []);

  // Handle Enter key for Flash Anzan
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedArena?.mode !== 'flashAnzan') return;
      
      if (e.key === 'Enter') {
        if (flashPhase === 'answer' && flashAnswer) {
          handleFlashSubmit();
        } else if (flashPhase === 'result') {
          nextFlashChallenge();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArena, flashPhase, flashAnswer]);

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
    const modes = ['addition', 'subtraction', 'multiplication', 'division', 'addSubMixed', 'mulDiv'];
    return modes[Math.floor(Math.random() * modes.length)];
  };

  const getMentalMode = () => {
    // Nếu đã chọn sub-mode cụ thể
    if (mentalSubMode && mentalSubMode !== 'mixed') {
      return mentalSubMode;
    }
    // Nếu chọn "Tất Cả" hoặc chưa chọn, random
    return getRandomMentalMode();
  };

  const startGame = () => {
    // �️ NULL CHECK: Kiểm tra selectedArena có tồn tại không
    if (!selectedArena) {
      console.error('startGame: selectedArena is null');
      return;
    }
    
    // �🔒 TIER CHECK: Kiểm tra quyền truy cập mode
    if (!canAccessMode(userTier, selectedArena.mode)) {
      const requiredTier = getRequiredTierForMode(selectedArena.mode);
      showUpgradeModal({
        feature: `Chế độ ${modeInfo[selectedArena.mode]?.title || selectedArena.mode} yêu cầu gói ${getTierDisplayName(requiredTier)} trở lên`
      });
      return;
    }
    
    // 🔒 TIER CHECK: Kiểm tra quyền truy cập difficulty
    if (!canAccessDifficulty(userTier, selectedArena.difficulty)) {
      const requiredTier = getRequiredTierForDifficulty(selectedArena.difficulty);
      showUpgradeModal({
        feature: `Cấp độ ${selectedArena.difficulty} yêu cầu gói ${getTierDisplayName(requiredTier)} trở lên`
      });
      return;
    }
    
    // 🔧 FIX: Đánh dấu thời điểm bắt đầu game
    problemChangeTimeRef.current = Date.now();
    
    const actualMode = selectedArena.mode === 'mentalMath' ? getMentalMode() : selectedArena.mode;
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
    
    // Nếu là Flash Anzan, bắt đầu flow khác
    if (selectedArena.mode === 'flashAnzan') {
      startFlashChallenge();
    }
  };

  // ========== FLASH ANZAN FUNCTIONS ==========
  // Chỉ hỗ trợ 'addition' và 'mixed' - kết quả LUÔN DƯƠNG cho học sinh tiểu học
  const startFlashChallenge = (overrideDifficulty = null) => {
    // Lấy difficulty từ tham số hoặc từ selectedArena
    const difficulty = overrideDifficulty ?? selectedArena?.difficulty ?? 1;
    
    // Lấy config từ flashLevelsCompete dựa trên difficulty
    const config = flashLevelsCompete.find(l => l.level === difficulty) || flashLevelsCompete[0];

    // Sử dụng số chữ số và phép toán đã chọn
    const digits = flashSelectedDigits || 1;
    const operationMode = flashSelectedOperation || 'addition';

    // Tạo dãy số ngẫu nhiên với phép tính cộng/trừ
    const count = Math.floor(Math.random() * (config.numbers[1] - config.numbers[0] + 1)) + config.numbers[0];
    const maxDigitValue = Math.pow(10, digits) - 1;
    const minDigitValue = digits === 1 ? 1 : Math.pow(10, digits - 1);

    const nums = [];
    const ops = [];
    let runningTotal = 0;

    for (let i = 0; i < count; i++) {
      let num = Math.floor(Math.random() * (maxDigitValue - minDigitValue + 1)) + minDigitValue;

      if (operationMode === 'addition') {
        // Chỉ có phép cộng
        ops.push('+');
        nums.push(num);
        runningTotal += num;
      } else {
        // Mixed: Cộng trừ xen kẽ - ĐẢM BẢO KẾT QUẢ LUÔN DƯƠNG
        if (i === 0) {
          // Số đầu tiên luôn là cộng
          ops.push('+');
          nums.push(num);
          runningTotal += num;
        } else {
          // Chỉ cho phép trừ nếu kết quả sau khi trừ vẫn > 0
          // Giới hạn số trừ tối đa = 70% tổng hiện tại để đảm bảo dư nhiều
          const maxSubtractAllowed = Math.floor(runningTotal * 0.7);
          const canSubtract = maxSubtractAllowed >= minDigitValue;
          const shouldSubtract = canSubtract && Math.random() < 0.4; // 40% trừ, 60% cộng

          if (shouldSubtract) {
            // Tạo số trừ trong phạm vi an toàn
            const safeMax = Math.min(maxDigitValue, maxSubtractAllowed);
            num = Math.floor(Math.random() * (safeMax - minDigitValue + 1)) + minDigitValue;
            ops.push('-');
            nums.push(num);
            runningTotal -= num;
          } else {
            ops.push('+');
            nums.push(num);
            runningTotal += num;
          }
        }
      }
    }

    setFlashNumbers(nums);
    setFlashOperations(ops);
    setFlashCorrectAnswer(runningTotal);
    setFlashCurrentIndex(0);
    setFlashShowingNumber(null);
    setFlashShowingOperation(null);
    setFlashAnswer('');
    setFlashAnswerTimer(0);
    setFlashResultMessage(null);
    setFlashCountdown(3);
    setFlashPhase('countdown');
    
    // Bắt đầu countdown
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      countdown--;
      setFlashCountdown(countdown);
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        // Bắt đầu hiện số
        setTimeout(() => {
          showFlashNumbers(nums, ops, config);
        }, 500);
      }
    }, 1000);
  };

  const showFlashNumbers = (nums, ops, config) => {
    setFlashPhase('showing');
    
    // Hiện số từng cái một - TỐC ĐỘ CỐ ĐỊNH - FIX FLICKERING (copy từ practice)
    const showFlashNumber = (index) => {
      if (index >= nums.length) {
        // Đã hiện hết số, chuyển sang phase trả lời
        setFlashPhase('answer');
        setFlashShowingNumber(null);
        setFlashShowingOperation(null);
        setTimeout(() => flashInputRef.current?.focus(), 100);
        return;
      }
      
      setFlashCurrentIndex(index);
      setFlashShowingNumber(nums[index]);
      setFlashShowingOperation(ops[index]);
      
      // Tốc độ CỐ ĐỊNH - dùng giá trị trung bình của range
      const speed = (config.speed[0] + config.speed[1]) / 2;
      
      // Chuyển trực tiếp sang số tiếp theo không cần set null để tránh nhấp nháy
      flashTimeoutRef.current = setTimeout(() => {
        showFlashNumber(index + 1);
      }, speed * 1000);
    };
    
    showFlashNumber(0);
  };

  const handleFlashSubmit = () => {
    if (!flashAnswer || flashPhase !== 'answer') return;
    
    // Dừng timer
    if (flashAnswerTimerRef.current) {
      clearInterval(flashAnswerTimerRef.current);
    }
    
    const userAnswer = parseInt(flashAnswer, 10);
    const isCorrect = userAnswer === flashCorrectAnswer;
    
    // Cập nhật kết quả
    setResult(isCorrect);
    totalTimeRef.current += flashAnswerTimer;
    
    if (isCorrect) {
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        // 🔊 Play combo sound when streak reaches milestones
        if ([3, 5, 7, 10].includes(newStreak)) {
          play('combo');
        }
        return newStreak;
      });
      setChallengeResults(prev => [...prev, 'correct']);
      
      // 🔊 Play correct sound
      play('correctFast');
      
      // Tính sao
      const config = flashLevelsCompete.find(l => l.level === selectedArena?.difficulty) || flashLevelsCompete[0];
      const baseStars = config.stars || 2;
      const bonusMultiplier = config.bonusMultiplier || 1;
      const earnedStars = Math.round(baseStars * bonusMultiplier);
      
      setSessionStats(prev => ({
        ...prev,
        stars: prev.stars + earnedStars,
        correct: prev.correct + 1,
        total: prev.total + 1,
        totalTime: totalTimeRef.current
      }));
      
      // Lời khen ngẫu nhiên
      const randomIndex = Math.floor(Math.random() * praiseMessages.length);
      setFlashResultMessage(praiseMessages[randomIndex]);
    } else {
      setStreak(0);
      setChallengeResults(prev => [...prev, 'wrong']);
      
      // 🔊 Play wrong sound
      play('wrong');
      
      setSessionStats(prev => ({
        ...prev,
        total: prev.total + 1,
        totalTime: totalTimeRef.current
      }));
      
      // Lời động viên
      const randomIndex = Math.floor(Math.random() * encourageMessages.length);
      setFlashResultMessage(encourageMessages[randomIndex]);
    }
    
    setFlashPhase('result');
  };

  const nextFlashChallenge = () => {
    if (currentChallenge >= totalChallenges) {
      setGameComplete(true);
      
      // 🔊 Play victory sound cho Flash Anzan
      const accuracy = sessionStats.correct / sessionStats.total;
      if (accuracy >= 0.8) {
        play('levelCompletePerfect');
      } else {
        play('levelComplete');
      }
      
      submitResult();
      return;
    }
    
    setCurrentChallenge(prev => prev + 1);
    setResult(null);
    startFlashChallenge();
  };

  const handleSorobanChange = (value) => {
    setSorobanValue(value);
    // 🔧 FIX: Thêm delay check để tránh false positive khi chuyển câu nhanh
    const timeSinceProblemChange = Date.now() - problemChangeTimeRef.current;
    if (value === problem?.answer && result === null && timeSinceProblemChange >= AUTO_CHECK_DELAY) {
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
    const instantStars = isCorrect ? Math.round((1 + (selectedArena?.difficulty || 1)) * speedTier.multiplier) : 0;

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
        // 🔊 Play combo sound when streak milestone reached
        play('combo');
      }
      
      // 🔊 Play sound theo tốc độ làm bài
      if (speedTier === speedTiers.godlike || speedTier === speedTiers.fast) {
        play('correctFast'); // "Tuyệt vời!" sparkle
      } else if (speedTier === speedTiers.good) {
        play('correctGood'); // "Giỏi lắm!" cheerful
      } else {
        play('correctSlow'); // "Được rồi" gentle
      }
      
      setCelebrationData(celebData);
      setCelebration('correct');
      setStreak(newStreak);
    } else {
      // 🔊 Play wrong sound
      play('wrong');
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
      
      // 🔊 Play victory sound - xuất sắc nếu đúng >= 80%
      const accuracy = sessionStats.correct / sessionStats.total;
      if (accuracy >= 0.8) {
        play('levelCompletePerfect'); // 🏅 Grand victory fanfare
      } else {
        play('levelComplete'); // 🎉 Normal victory
      }
      
      // Trigger milestone celebration cho free users với hiệu suất tốt (>70%)
      if (userTier === 'free' && sessionStats.correct >= Math.floor(totalChallenges * 0.7)) {
        setTimeout(() => {
          setMilestoneData({
            type: 'battle',
            message: 'Trận đấu tuyệt vời! 🏆',
            starsEarned: sessionStats.correct * 3
          });
          setShowMilestoneCelebration(true);
        }, 2500);
      }
      
      // Gửi kết quả lên server
      submitResult();
      return;
    }
    
    // 🔧 FIX: Đánh dấu thời điểm chuyển câu
    problemChangeTimeRef.current = Date.now();
    
    setCurrentChallenge(prev => prev + 1);
    const actualMode = selectedArena?.mode === 'mentalMath' ? getMentalMode() : selectedArena?.mode;
    setProblem(generateProblem(actualMode, selectedArena?.difficulty || 1));
    setSorobanValue(0);
    setMentalAnswer('');
    setResult(null);
    timerRef.current = 0;
    setDisplayTimer(0);
    setSorobanKey(prev => prev + 1);
    
    if (selectedArena?.mode === 'mentalMath') {
      setTimeout(() => mentalInputRef.current?.focus(), 100);
    }
  };

  const submitResult = async () => {
    try {
      const starsToSubmit = sessionStats.stars;
      const res = await fetch('/api/compete/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arenaId: selectedArena.id,
          correct: sessionStats.correct + (result === true ? 1 : 0),
          totalTime: totalTimeRef.current,
          stars: starsToSubmit
        })
      });
      
      // 🚀 OPTIMISTIC UPDATE: Cập nhật stars ngay (KHÔNG fetch server)
      if (res.ok && starsToSubmit > 0) {
        window.dispatchEvent(new CustomEvent('user-stats-updated', {
          detail: {
            stars: starsToSubmit,
            diamonds: 0
          }
        }));
      }
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
    setMentalSubMode(null);
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
    // 🔒 TIER CHECK: Kiểm tra quyền truy cập mode
    if (!canAccessMode(userTier, mode)) {
      const requiredTier = getRequiredTierForMode(mode);
      showUpgradeModal({
        feature: `Chế độ ${modeInfo[mode]?.title || mode} yêu cầu gói ${getTierDisplayName(requiredTier)} trở lên`
      });
      return;
    }
    setSelectedMode(mode);
  };

  const selectDifficultyAndContinue = (diff) => {
    // 🔒 TIER CHECK: Kiểm tra quyền truy cập difficulty
    if (!canAccessDifficulty(userTier, diff)) {
      const requiredTier = getRequiredTierForDifficulty(diff);
      showUpgradeModal({
        feature: `Cấp độ ${diff} yêu cầu gói ${getTierDisplayName(requiredTier)} trở lên`
      });
      return;
    }
    setSelectedDifficulty(diff);
  };

  const selectQuestionCountAndContinue = (count) => {
    setSelectedQuestionCount(count);
    setTotalChallenges(count);
    const arena = createArena(selectedMode, selectedDifficulty, count);
    setSelectedArena(arena);
  };

  // Sub-mode info cho Siêu Trí Tuệ - copy từ practice
  const mentalSubModes = [
    { id: 'addition', title: 'Cộng', icon: '➕', color: 'from-emerald-400 to-green-500' },
    { id: 'subtraction', title: 'Trừ', icon: '➖', color: 'from-blue-400 to-cyan-500' },
    { id: 'multiplication', title: 'Nhân', icon: '✖️', color: 'from-purple-400 to-pink-500' },
    { id: 'division', title: 'Chia', icon: '➗', color: 'from-rose-400 to-red-500' },
    { id: 'addSubMixed', title: 'Cộng Trừ', icon: '🔀', color: 'from-teal-400 to-emerald-500' },
    { id: 'mulDiv', title: 'Nhân Chia', icon: '🎲', color: 'from-amber-400 to-orange-500' },
    { id: 'mixed', title: 'Tất Cả', icon: '🌈', color: 'from-indigo-500 to-purple-600' },
  ];

  const selectSubModeAndContinue = (subMode) => {
    setMentalSubMode(subMode);
  };

  const backToSubModeSelect = () => {
    setMentalSubMode(null);
    setSelectedDifficulty(null);
    setSelectedQuestionCount(null);
    setSelectedArena(null);
  };

  const isMentalMode = selectedArena?.mode === 'mentalMath';
  const isFlashMode = selectedArena?.mode === 'flashAnzan';
  const currentModeInfo = selectedArena ? modeInfo[selectedArena.mode] : null;

  // Màn hình chọn MODE - EPIC GAMING STYLE
  // 🔧 FIX: Hiện loading nếu đang check auto-start để tránh nháy màn chọn mode
  if (!selectedMode) {
    // Nếu đang check auto-start từ Adventure, hiện loading thay vì màn chọn mode
    if (isCheckingAutoStart) {
      return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
          <div className="text-center">
            <div className="text-6xl animate-bounce mb-4">🏆</div>
            <div className="text-white font-bold">Đang chuẩn bị đấu trường...</div>
          </div>
        </div>
      );
    }
    
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
              {gameMode?.from === 'adventure' ? (
                <button
                  onClick={handleBack}
                  className="flex items-center bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 transition-all border border-white/20 shadow-lg shadow-purple-500/20"
                  style={{
                    padding: 'clamp(6px, 1vh, 12px)',
                    borderRadius: 'clamp(10px, 1.5vh, 20px)'
                  }}
                >
                  <ArrowLeft style={{ width: 'clamp(16px, 2.5vh, 24px)', height: 'clamp(16px, 2.5vh, 24px)' }} />
                </button>
              ) : (
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
              )}
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
                  flashAnzan: 'advanced'  // Tia Chớp chỉ mở cho gói Nâng cao
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
                        showUpgradeModal({
                          requiredTier: 'advanced',
                          feature: info.title,
                          currentTier: userTier
                        });
                        return;
                      }
                      selectModeAndContinue(modeKey);
                    }}
                    className={`bg-gradient-to-br ${info.color} rounded-2xl p-4 sm:p-5 shadow-xl hover:shadow-2xl transform hover:scale-[1.03] active:scale-95 transition-all text-white text-center relative overflow-hidden group`}
                  >
                    {/* Lock icon */}
                    {isLocked && (
                      <div className="absolute top-2 left-2 bg-black/50 rounded-full w-6 h-6 flex items-center justify-center z-20">
                        <span className="text-white text-xs">🔒</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all"></div>
                    <div className="text-4xl sm:text-5xl mb-2 z-10 relative drop-shadow-md">{info.icon}</div>
                    <div className="text-sm sm:text-base font-black z-10 relative drop-shadow-sm">{info.title}</div>
                    <div className="text-xs z-10 relative mt-0.5 text-white/95">{info.subtitle}</div>
                    <div className="text-[10px] mt-2 z-10 relative bg-black/30 rounded-full px-2 py-0.5 text-white/90">
                      {recommendLevel[modeKey]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Modal nâng cấp tinh tế */}
        <UpgradeModalComponent />
      </div>
    );
  }

  // ========== MÀN HÌNH CHỌN SUB-MODE CHO SIÊU TRÍ TUỆ - COPY TỪ PRACTICE ==========
  if (selectedMode === 'mentalMath' && !mentalSubMode) {
    return (
      <div className="w-[100vw] min-h-[100dvh] bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 flex flex-col overflow-x-hidden relative">
        {/* Animated brain waves background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating neurons */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`neuron-${i}`}
              className="absolute rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `clamp(10px, ${2 + Math.random() * 3}vh, 40px)`,
                height: `clamp(10px, ${2 + Math.random() * 3}vh, 40px)`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
          {/* Brain emojis floating */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`brain-${i}`}
              className="absolute animate-bounce opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: 'clamp(16px, 3vh, 40px)',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 3}s`
              }}
            >
              {['🧠', '💭', '✨', '💡', '⚡'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
          {/* Glowing orbs */}
          <div className="absolute top-1/3 left-1/4 w-[25vh] h-[25vh] bg-fuchsia-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-[20vh] h-[20vh] bg-violet-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>

        {/* Header - Back trái, Logo phải */}
        <div 
          className="relative z-10 flex-shrink-0"
          style={{ padding: 'clamp(6px, 1.2vh, 14px) clamp(10px, 2vw, 24px)' }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 transition-all border border-white/20 shadow-lg"
              style={{
                padding: 'clamp(6px, 1vh, 12px)',
                borderRadius: 'clamp(10px, 1.5vh, 20px)'
              }}
            >
              <ArrowLeft style={{ width: 'clamp(16px, 2.5vh, 24px)', height: 'clamp(16px, 2.5vh, 24px)' }} />
            </button>
            <div
              className="font-black text-white flex items-center bg-gradient-to-r from-fuchsia-500/30 to-violet-500/30 backdrop-blur-md border border-white/20 shadow-lg"
              style={{
                fontSize: 'clamp(13px, 2.8vh, 26px)',
                gap: 'clamp(6px, 1vw, 14px)',
                padding: 'clamp(6px, 1vh, 12px) clamp(12px, 2vw, 24px)',
                borderRadius: 'clamp(16px, 2.5vh, 32px)'
              }}
            >
              <span className="animate-pulse" style={{ fontSize: 'clamp(16px, 3.5vh, 34px)' }}>🧠</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-200 via-fuchsia-200 to-violet-200 whitespace-nowrap">
                Siêu Trí Tuệ
              </span>
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

        {/* Main content */}
        <div 
          className="relative z-10 flex-1 flex flex-col overflow-y-auto" 
          style={{ padding: 'clamp(6px, 1.2vh, 18px) clamp(10px, 2.5vw, 24px)' }}
        >
          <div className="max-w-7xl mx-auto w-full flex flex-col">
            
            {/* Section title */}
            <div 
              className="text-center flex-shrink-0"
              style={{ marginBottom: 'clamp(12px, 2vh, 24px)' }}
            >
              <h3 
                className="font-black text-white/90 flex items-center justify-center"
                style={{ fontSize: 'clamp(14px, 2.5vh, 24px)', gap: 'clamp(6px, 1vh, 12px)' }}
              >
                <span>🧮</span> Chọn Phép Tính <span>🎯</span>
              </h3>
              <p className="text-white/60 text-sm mt-1">Thi đấu với chế độ bạn muốn!</p>
            </div>

            {/* Sub-mode grid - Responsive cards */}
            <div 
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              style={{ 
                gap: 'clamp(8px, 1.5vmin, 18px)',
                paddingBottom: 'clamp(20px, 5vh, 60px)'
              }}
            >
              {mentalSubModes.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => selectSubModeAndContinue(item.id)}
                  className={`bg-gradient-to-br ${item.color} text-white flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.05] active:scale-95 transition-all duration-300 ${
                    item.id === 'mixed' ? 'col-span-2 sm:col-span-1 animate-pulse ring-2 ring-yellow-400/50' : ''
                  }`}
                  style={{
                    borderRadius: 'clamp(16px, 3vh, 40px)',
                    padding: 'clamp(12px, 2vh, 24px)',
                    boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`,
                    animationDuration: item.id === 'mixed' ? '2s' : undefined
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
                  
                  {/* Inner glow */}
                  <div className="absolute inset-2 bg-white/10 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Icon with effects */}
                  <div 
                    className="drop-shadow-2xl z-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300"
                    style={{ fontSize: 'clamp(40px, 10vh, 90px)', marginBottom: 'clamp(6px, 1.2vh, 14px)' }}
                  >
                    {item.icon}
                  </div>
                  
                  {/* Title */}
                  <div 
                    className="font-black z-10 text-center leading-tight drop-shadow-lg"
                    style={{ fontSize: 'clamp(14px, 2.8vh, 26px)' }}
                  >
                    {item.title}
                  </div>
                  
                  {/* Special badge for mixed */}
                  {item.id === 'mixed' && (
                    <div 
                      className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 font-black rounded-full animate-bounce"
                      style={{ 
                        fontSize: 'clamp(8px, 1.3vh, 13px)',
                        padding: 'clamp(3px, 0.6vh, 10px) clamp(8px, 1.2vh, 14px)'
                      }}
                    >
                      RANDOM!
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Hint */}
            <div 
              className="flex-shrink-0 text-center"
              style={{ marginTop: 'clamp(8px, 1.5vh, 20px)' }}
            >
              <p 
                className="text-white/60 font-medium"
                style={{ fontSize: 'clamp(10px, 1.6vh, 16px)' }}
              >
                💡 Tính nhẩm không cần bàn tính - Thử thách trí não của bạn!
              </p>
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
        
        <UpgradeModalComponent />
      </div>
    );
  }

  // Màn hình chọn mode Flash Anzan - STEPS: digits -> operation -> speed
  if (selectedMode === 'flashAnzan' && !selectedDifficulty) {
    // Xác định tiêu đề và mô tả theo bước
    const stepTitles = {
      digits: { title: 'CHỌN SỐ CHỮ SỐ', subtitle: 'Chọn độ khó của các số', icon: '🔢' },
      operation: { title: 'CHỌN PHÉP TOÁN', subtitle: 'Chọn loại phép tính', icon: '➕' },
      speed: { title: 'CHỌN TỐC ĐỘ THI ĐẤU', subtitle: 'Mỗi biến thể là một đấu trường riêng!', icon: '⚡' }
    };
    const currentStep = stepTitles[flashModeStep] || stepTitles.digits;

    // Xử lý nút Back
    const handleFlashBack = () => {
      if (flashModeStep === 'digits') {
        backToModeSelect();
        setFlashModeStep('digits');
        setFlashSelectedDigits(null);
        setFlashSelectedOperation(null);
      } else if (flashModeStep === 'operation') {
        setFlashModeStep('digits');
        setFlashSelectedDigits(null);
      } else if (flashModeStep === 'speed') {
        setFlashModeStep('operation');
        setFlashSelectedOperation(null);
      }
    };

    return (
      <div className="min-h-[100dvh] lg:h-[100dvh] bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-y-auto lg:overflow-hidden relative flex flex-col">
        {/* Animated starfield background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Stars */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                opacity: 0.3 + Math.random() * 0.5
              }}
            />
          ))}
          {/* Floating light orbs */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`orb-${i}`}
              className="absolute animate-bounce text-2xl opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 3}s`
              }}
            >
              {['🌟', '✨', '💫', '⚡', '🔥'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>

        {/* Header - Back trái, Logo phải */}
        <div className="relative z-10 flex-shrink-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg shadow-purple-500/30">
          <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between">
            <button
              onClick={handleFlashBack}
              className="flex items-center bg-black/30 rounded-lg text-white hover:bg-black/50 hover:scale-105 transition-all backdrop-blur"
              style={{ padding: 'clamp(6px, 1vh, 12px)' }}
            >
              <ArrowLeft style={{ width: 'clamp(16px, 2.5vh, 24px)', height: 'clamp(16px, 2.5vh, 24px)' }} />
            </button>
            <div className="text-center">
              <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 leading-relaxed">
                <span className="text-2xl animate-pulse">⚡</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-cyan-200 whitespace-nowrap">
                  ĐẤU TRƯỜNG TIA CHỚP
                </span>
                <span className="text-2xl animate-pulse">💫</span>
              </h1>
              <p className="text-white/80 text-[10px]">Mỗi biến thể là một bảng xếp hạng riêng!</p>
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

        {/* Progress Steps Indicator */}
        <div className="relative z-10 flex justify-center py-3">
          <div className="flex items-center gap-2 bg-black/30 rounded-full px-4 py-2 border border-white/10">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${flashModeStep === 'digits' ? 'bg-yellow-500 text-black' : flashSelectedDigits ? 'bg-green-500 text-white' : 'bg-white/20 text-white/60'}`}>
              <span>🔢</span> <span className="hidden sm:inline">{flashSelectedDigits ? `${flashSelectedDigits} chữ số` : 'Chữ số'}</span>
            </div>
            <div className="text-white/40">→</div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${flashModeStep === 'operation' ? 'bg-yellow-500 text-black' : flashSelectedOperation ? 'bg-green-500 text-white' : 'bg-white/20 text-white/60'}`}>
              <span>➕</span> <span className="hidden sm:inline">{flashSelectedOperation ? flashOperationOptions.find(o => o.id === flashSelectedOperation)?.name : 'Phép toán'}</span>
            </div>
            <div className="text-white/40">→</div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${flashModeStep === 'speed' ? 'bg-yellow-500 text-black' : 'bg-white/20 text-white/60'}`}>
              <span>⚡</span> <span className="hidden sm:inline">Tốc độ</span>
            </div>
          </div>
        </div>

        {/* Main content - FLEX GROW to fill space */}
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-3 py-3 w-full">

          {/* Hero + Steps Row - EPIC */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 mb-3">
            {/* Mini Hero with glow */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                  <span className="text-3xl animate-pulse">{currentStep.icon}</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-cyan-400 leading-relaxed pt-1">
                  CUỘC ĐUA ÁNH SÁNG
                </h2>
                <p className="text-white/60 text-xs">🕯️ → 🌙 → ⚡ → ☄️ → 💥 → 🌌</p>
              </div>
            </div>
          </div>

          {/* Step Title */}
          <div className="text-center mb-3">
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center justify-center gap-2 leading-relaxed pt-1">
              <span className="animate-bounce">{currentStep.icon}</span>
              {currentStep.title}
              <span className="animate-bounce">{currentStep.icon}</span>
            </h3>
            <p className="text-white/60 text-xs">{currentStep.subtitle}</p>
          </div>

          {/* STEP 1: Chọn số chữ số */}
          {flashModeStep === 'digits' && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-xl mx-auto">
                {flashDigitOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setFlashSelectedDigits(option.id);
                      setFlashModeStep('operation');
                    }}
                    className={`relative group bg-gradient-to-br ${option.color} rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 text-white flex flex-col items-center border-2 border-white/30`}
                  >
                    <div className="text-5xl sm:text-6xl mb-3">{option.emoji}</div>
                    <div className="font-black text-lg sm:text-xl">{option.name}</div>
                    <div className="text-white/70 text-sm">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Chọn phép toán */}
          {flashModeStep === 'operation' && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="grid grid-cols-2 gap-6 sm:gap-8 max-w-lg mx-auto">
                {flashOperationOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setFlashSelectedOperation(option.id);
                      setFlashModeStep('speed');
                    }}
                    className={`relative group bg-gradient-to-br ${option.color} rounded-2xl p-8 sm:p-10 shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 text-white flex flex-col items-center border-2 border-white/30`}
                  >
                    <div className="text-6xl sm:text-7xl mb-4">{option.emoji}</div>
                    <div className="font-black text-xl sm:text-2xl">{option.name}</div>
                    <div className="text-white/70 text-sm text-center mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Chọn tốc độ - Level Cards - EPIC GAMING GRID */}
          {flashModeStep === 'speed' && (
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-2 content-start">
            {flashLevelsCompete.map((level, index) => {
              const maxLevel = userTier === 'free' ? 1 : userTier === 'basic' ? 3 : 6;
              const isLocked = level.level > maxLevel;
              const isLastLevel = index === flashLevelsCompete.length - 1;
              
              return (
                <button
                  key={level.id}
                  onClick={() => {
                    if (isLocked) {
                      showUpgradeModal({
                        requiredTier: 'advanced',
                        feature: `Cấp ${level.name}`,
                        currentTier: userTier
                      });
                      return;
                    }
                    selectDifficultyAndContinue(level.level);
                  }}
                  disabled={isLocked}
                  className={`relative group bg-gradient-to-br ${level.color} rounded-2xl p-3 lg:p-4 shadow-lg hover:shadow-2xl ${level.glowColor || ''} transform hover:scale-105 active:scale-95 transition-all duration-300 text-white flex flex-col items-center border-2 border-white/30 overflow-hidden ${isLocked ? 'opacity-50 cursor-not-allowed' : ''} ${isLastLevel ? 'animate-pulse ring-2 ring-yellow-400/50' : ''}`}
                >
                  {/* Animated particles for higher levels */}
                  {index >= 3 && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full animate-ping opacity-30"
                          style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                            animationDelay: `${i * 0.3}s`,
                            animationDuration: '1.5s'
                          }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-40 blur-2xl transition-opacity duration-300 pointer-events-none`}></div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
                  
                  {/* Lock icon */}
                  {isLocked && (
                    <div className="absolute top-2 left-2 bg-black/50 rounded-full w-6 h-6 flex items-center justify-center z-20">
                      <span className="text-white text-xs">🔒</span>
                    </div>
                  )}
                  
                  {/* Boss badge for last level */}
                  {isLastLevel && !isLocked && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white text-[9px] px-3 py-0.5 rounded-full font-black shadow-lg animate-bounce">
                        🔥 BOSS 🔥
                      </div>
                    </div>
                  )}
                  
                  {/* Rank stars */}
                  <div className={`relative z-10 text-sm lg:text-base ${isLastLevel ? 'animate-pulse' : ''}`}>
                    {level.rank}
                  </div>
                  
                  {/* Rank label */}
                  <div className={`relative z-10 px-2 py-0.5 rounded-full bg-black/30 text-white text-[8px] lg:text-[9px] font-bold mb-1`}>
                    {level.rankLabel}
                  </div>
                  
                  {/* Emoji with glow */}
                  <div className={`relative z-10 text-4xl lg:text-5xl my-1 group-hover:scale-125 transition-all duration-300 drop-shadow-lg ${isLastLevel ? 'animate-bounce' : 'group-hover:animate-bounce'}`}>
                    {level.emoji}
                    {index >= 3 && (
                      <div className="absolute inset-0 blur-md opacity-50">{level.emoji}</div>
                    )}
                  </div>
                  
                  {/* Name */}
                  <div className={`relative z-10 font-black text-lg lg:text-xl drop-shadow-lg leading-tight ${isLastLevel ? 'text-yellow-200' : ''}`}>
                    {level.name}
                  </div>
                  
                  {/* Subtitle */}
                  <div className="relative z-10 text-white/70 text-[9px] lg:text-[10px] font-medium">
                    {level.subtitle}
                  </div>
                  
                  {/* Stats - COMPACT with icons */}
                  <div className="relative z-10 w-full mt-2 space-y-0.5 text-[9px] lg:text-[10px]">
                    <div className="flex items-center justify-between bg-black/30 rounded px-2 py-0.5">
                      <span>📊 Số lượng</span>
                      <span className="font-black">{level.numbers[0]}-{level.numbers[1]}</span>
                    </div>
                    <div className="flex items-center justify-between bg-black/30 rounded px-2 py-0.5">
                      <span>⚡ Tốc độ</span>
                      <span className="font-black text-yellow-200">{level.speed[0]}s/số</span>
                    </div>
                  </div>
                  
                  {/* Stars reward - GAMING STYLE */}
                  <div className={`relative z-10 mt-2 flex items-center gap-1 bg-gradient-to-r from-yellow-500/40 to-orange-500/40 border border-yellow-400/60 px-3 py-1 rounded-full ${index >= 3 ? 'animate-pulse' : ''}`}>
                    <span className="text-yellow-300 text-sm">⭐</span>
                    <span className="font-black text-yellow-200 text-sm">+{level.stars}</span>
                  </div>
                  
                  {/* Bonus multiplier badge */}
                  {level.bonusMultiplier > 1 && !isLocked && (
                    <div className={`relative z-10 mt-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-[9px] text-white font-black shadow ${index >= 3 ? 'animate-pulse' : ''}`}>
                      🔥 x{level.bonusMultiplier} BONUS
                    </div>
                  )}
                  
                  {/* Tagline for harder levels */}
                  {index >= 3 && !isLocked && (
                    <div className="relative z-10 mt-1 text-[8px] text-yellow-200/80 font-bold">
                      {level.tagline}
                    </div>
                  )}
                </button>
              );
            })}
            </div>
          )}

          {/* Bottom info bar - EPIC TIPS */}
          <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 rounded-xl p-2 sm:p-3 max-w-4xl mx-auto flex-shrink-0 mt-auto">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 bg-blue-500/20 px-3 py-1 rounded-full">
                <span className="text-lg">👀</span>
                <span className="text-blue-200 font-bold">Tập trung cao độ</span>
              </div>
              <div className="flex items-center gap-1.5 bg-purple-500/20 px-3 py-1 rounded-full">
                <span className="text-lg">🧮</span>
                <span className="text-purple-200 font-bold">Cộng dồn từng số</span>
              </div>
              <div className="flex items-center gap-1.5 bg-orange-500/20 px-3 py-1 rounded-full">
                <span className="text-lg">🔥</span>
                <span className="text-orange-200 font-bold">Combo = x2 Bonus!</span>
              </div>
            </div>
          </div>

          {/* Epic call to action */}
          <div className="text-center py-2 flex-shrink-0">
            <p className="text-white/50 text-xs animate-pulse">
              🌌 Bạn có thể chạm tới SIÊU BIG BANG không? 🌌
            </p>
          </div>
        </div>

        <UpgradeModalComponent />
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
                onClick={selectedMode === 'mentalMath' ? backToSubModeSelect : backToModeSelect}
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
                <span className="whitespace-nowrap">
                  {modeData.title}
                  {selectedMode === 'mentalMath' && mentalSubMode && (
                    <span className="text-white/80 ml-1">
                      - {mentalSubModes.find(m => m.id === mentalSubMode)?.title || 'Tất Cả'}
                    </span>
                  )}
                </span>
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
              {selectedMode === 'mentalMath' && (
                <>
                  <div className="flex items-center gap-1 text-green-400">
                    <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>Phép tính</span>
                  </div>
                  <div className="w-8 h-0.5 bg-white/30"></div>
                </>
              )}
              <div className="flex items-center gap-1 text-white">
                <span className="w-5 h-5 rounded-full bg-white text-purple-900 flex items-center justify-center text-[10px] font-bold">{selectedMode === 'mentalMath' ? '3' : '2'}</span>
                <span>Cấp độ</span>
              </div>
              <div className="w-8 h-0.5 bg-white/30"></div>
              <div className="flex items-center gap-1 text-white/50">
                <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold">{selectedMode === 'mentalMath' ? '4' : '3'}</span>
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
                      showUpgradeModal({
                        requiredTier: 'advanced',
                        feature: `Cấp độ ${diffLevels[diff]}`,
                        currentTier: userTier
                      });
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
                  
                  {/* Lock icon - nhỏ gọn */}
                  {isDifficultyLocked && (
                    <div className="absolute top-2 left-2 bg-black/50 rounded-full w-6 h-6 flex items-center justify-center z-20">
                      <span className="text-white text-xs">🔒</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all"></div>
                  {diff === 1 && (
                    <div className="absolute -top-1 -right-1 bg-green-400 text-green-900 text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg rounded-tr-xl z-20 animate-bounce">
                      GỢI Ý
                    </div>
                  )}
                  <div 
                    className="z-10 relative drop-shadow-2xl group-hover:scale-110 transition-transform"
                    style={{ fontSize: 'clamp(36px, 7vh, 64px)', marginBottom: 'clamp(4px, 1vh, 12px)' }}
                  >
                    {arenaName.icon}
                  </div>
                  <div className="text-sm sm:text-base font-black z-10 relative drop-shadow-sm">{arenaName.title}</div>
                  <div className="text-[10px] sm:text-xs z-10 relative flex items-center justify-center gap-1 mt-1 text-white/95">
                    <span>{diffData.emoji}</span>
                    <span>{diffData.label}</span>
                  </div>
                  <div className="text-[10px] mt-1 z-10 relative text-white/85">
                    {diffDesc[diff]}
                  </div>
                  <div className="text-[9px] mt-0.5 z-10 relative text-white/75">
                    {diffExample[diff]}
                  </div>
                  <div className="text-[10px] mt-1 z-10 relative bg-black/30 rounded-full px-2 py-0.5 text-white/90">
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
        
        {/* Modal nâng cấp tinh tế */}
        <UpgradeModalComponent />
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
              {selectedMode === 'mentalMath' && (
                <>
                  <div className="flex items-center gap-1 text-green-400">
                    <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>Phép tính</span>
                  </div>
                  <div className="w-8 h-0.5 bg-green-500"></div>
                </>
              )}
              <div className="flex items-center gap-1 text-green-400">
                <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Cấp độ</span>
              </div>
              <div className="w-8 h-0.5 bg-white/30"></div>
              <div className="flex items-center gap-1 text-white">
                <span className="w-5 h-5 rounded-full bg-white text-purple-900 flex items-center justify-center text-[10px] font-bold">{selectedMode === 'mentalMath' ? '4' : '3'}</span>
                <span>Số câu</span>
              </div>
            </div>
          </div>

          {/* Thông tin đã chọn */}
          <div className="px-4 mb-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 flex items-center justify-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-1 text-white">
                <span>{modeData.icon}</span>
                <span className="font-medium">{modeData.title}</span>
              </div>
              {selectedMode === 'mentalMath' && mentalSubMode && (
                <>
                  <span className="text-white/30">•</span>
                  <div className="flex items-center gap-1 text-white">
                    <span>{mentalSubModes.find(m => m.id === mentalSubMode)?.icon}</span>
                    <span className="font-medium">{mentalSubModes.find(m => m.id === mentalSubMode)?.title}</span>
                  </div>
                </>
              )}
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
        <div className="max-w-7xl mx-auto">
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
                          <div className="flex justify-center mb-1">
                            <MonsterAvatar seed={leaderboard[1].userId} avatarIndex={getAvatarIndex(leaderboard[1])} size={36} showBorder={false} />
                          </div>
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
                        <div className="flex justify-center mb-1">
                          <MonsterAvatar seed={leaderboard[0].userId} avatarIndex={getAvatarIndex(leaderboard[0])} size={44} showBorder={false} className="border-2 border-yellow-400" />
                        </div>
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
                          <div className="flex justify-center mb-1">
                            <MonsterAvatar seed={leaderboard[2].userId} avatarIndex={getAvatarIndex(leaderboard[2])} size={36} showBorder={false} />
                          </div>
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
                        <MonsterAvatar seed={entry.userId} avatarIndex={getAvatarIndex(entry)} size={28} showBorder={false} />
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
                      <MonsterAvatar seed={currentUserData.userId} avatarIndex={getAvatarIndex(currentUserData)} size={36} showBorder={false} />
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
          
          {/* Thông báo điều kiện qua màn - chỉ hiện khi từ Adventure */}
          {gameMode?.from === 'adventure' && (
            <div className={`p-3 rounded-xl text-center text-sm font-medium mb-3 ${accuracy >= 70 ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'}`}>
              {accuracy >= 70 ? (
                <span>✅ Đã qua màn! Cần ≥70% để mở khóa màn tiếp theo</span>
              ) : (
                <span>⚠️ Chưa đạt! Cần ≥70% chính xác để qua màn (hiện tại: {accuracy}%)</span>
              )}
            </div>
          )}
          
          {/* Buttons - khác nhau tùy từ Adventure hay Menu */}
          {gameMode?.from === 'adventure' ? (
            /* Từ Adventure: chỉ có nút Về Map */
            <button
              onClick={() => handleBackToGame(accuracy >= 70)}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:scale-105 transition-transform text-sm"
            >
              🎮 Về Map Phiêu Lưu
            </button>
          ) : (
            /* Từ Menu: có đầy đủ các nút */
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
          )}
        </div>
      </div>
    );
  }

  // ========== FLASH ANZAN GAME SCREEN - COPY TỪ PRACTICE ==========
  if (gameStarted && isFlashMode) {
    const config = flashLevelsCompete.find(l => l.level === selectedArena.difficulty) || flashLevelsCompete[0];
    const avgSpeed = ((config?.speed[0] + config?.speed[1]) / 2).toFixed(1);
    
    return (
      <div className="min-h-screen min-h-[100dvh] h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Top bar - ULTRA COMPACT */}
        <div className="relative z-10 flex-shrink-0">
          <div className={`bg-gradient-to-r ${config?.color || 'from-yellow-500 to-orange-600'}`}>
            <div className="max-w-7xl mx-auto px-2 py-1 flex items-center justify-between">
              {/* Left: Back */}
              <button
                onClick={() => {
                  if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
                  if (flashAnswerTimerRef.current) clearInterval(flashAnswerTimerRef.current);
                  // 🎮 GAME MODE: Nếu từ adventure, quay về adventure
                  if (gameMode?.from === 'adventure') {
                    handleBackToGame();
                  } else {
                    backToArenaDetail();
                  }
                }}
                className="p-1.5 bg-black/20 rounded-lg text-white hover:bg-black/30 transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              
              {/* Center: Level name */}
              <div className="text-white font-bold text-sm flex items-center gap-1">
                <span>⚡</span>
                <span className="truncate max-w-[120px] sm:max-w-none">{config?.name}</span>
                <span>{config?.emoji}</span>
              </div>
              
              {/* Right: Stats + Logo */}
              <div className="flex items-center gap-2">
                <div className="bg-black/20 px-2 py-0.5 rounded text-yellow-300 font-bold text-sm flex items-center gap-0.5">
                  ⭐ {sessionStats.stars}
                </div>
                <div className="bg-black/20 px-2 py-0.5 rounded text-white font-bold text-sm">
                  {currentChallenge}/{totalChallenges}
                </div>
                <Link 
                  href="/dashboard"
                  prefetch={true}
                  className="p-1 bg-black/20 rounded-lg text-white hover:bg-black/30 transition-colors"
                  title="Về trang chủ"
                >
                  <Logo size="xs" showText={false} />
                </Link>
              </div>
            </div>
          </div>

          {/* Progress bar - ULTRA COMPACT */}
          <div className="bg-black/40 px-2 py-1">
            <div className="flex gap-0.5 max-w-7xl mx-auto items-center">
              {[...Array(totalChallenges)].map((_, i) => {
                const resultStatus = challengeResults[i];
                let barClass = 'bg-white/20';
                if (i < currentChallenge - 1) {
                  barClass = resultStatus === 'correct' ? 'bg-green-500' : 'bg-red-500';
                } else if (i === currentChallenge - 1 && flashPhase !== 'idle') {
                  barClass = 'bg-yellow-400 animate-pulse';
                }
                return <div key={i} className={`h-1.5 flex-1 rounded-full ${barClass} transition-all`} />;
              })}
              {/* Combo inline */}
              {streak >= 2 && (
                <div className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  streak >= 5 ? 'bg-purple-500 text-white' :
                  streak >= 3 ? 'bg-orange-500 text-white' :
                  'bg-yellow-500 text-white'
                }`}>
                  🔥x{streak}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content - FULLY RESPONSIVE */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-visible">
          
          {/* Countdown phase - RESPONSIVE */}
          {flashPhase === 'countdown' && (
            <div className="text-center flex flex-col items-center justify-center">
              {/* Animated ring - Smaller on mobile */}
              <div className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 mx-auto mb-3 sm:mb-5">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 blur-xl opacity-50 animate-pulse"></div>
                
                <svg className="w-full h-full transform -rotate-90 relative z-10">
                  <circle
                    cx="50%" cy="50%" r="45%"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50%" cy="50%" r="45%"
                    fill="none"
                    stroke="url(#countdownGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={283}
                    strokeDashoffset={283 - (283 * (3 - flashCountdown) / 3)}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="countdownGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl sm:text-7xl md:text-8xl font-black text-white animate-pulse drop-shadow-lg">{flashCountdown}</span>
                </div>
              </div>
              
              <p className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-5 animate-pulse leading-relaxed">🎯 TẬP TRUNG!</p>
              
              {/* Info badges - COMPACT */}
              <div className="flex justify-center gap-2 sm:gap-4">
                <div className="bg-white/10 backdrop-blur border border-white/20 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2">
                  <span className="text-lg sm:text-2xl">📊</span>
                  <div>
                    <div className="text-white/60 text-[10px] sm:text-xs">Số lượng</div>
                    <div className="font-black text-white text-sm sm:text-lg">{flashNumbers.length} số</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur border border-white/20 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2">
                  <span className="text-lg sm:text-2xl">⚡</span>
                  <div>
                    <div className="text-white/60 text-[10px] sm:text-xs">Tốc độ</div>
                    <div className="font-black text-white text-sm sm:text-lg">{avgSpeed}s/số</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Showing numbers phase - RESPONSIVE */}
          {flashPhase === 'showing' && (
            <div className="text-center w-full max-w-md px-2">
              {/* Progress indicator - COMPACT */}
              <div className="mb-3 sm:mb-5">
                <div className="flex justify-center gap-1 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
                  {flashNumbers.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-200 ${
                        i < flashCurrentIndex ? 'bg-green-400 shadow-sm sm:shadow-lg shadow-green-400/50' : 
                        i === flashCurrentIndex ? 'bg-yellow-400 scale-125 sm:scale-150 animate-ping' : 
                        'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-white/80 font-bold text-xs sm:text-sm">
                  Số {flashCurrentIndex + 1} / {flashNumbers.length}
                </div>
              </div>
              
              {/* Epic number display - RESPONSIVE */}
              <div className="relative">
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-50 animate-pulse ${
                  flashShowingOperation === '-' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                }`}></div>
                
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl sm:shadow-2xl border border-white/10">
                  {flashShowingNumber !== null ? (
                    <div 
                      key={flashCurrentIndex}
                      className={`text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black text-transparent bg-clip-text animate-zoom-in drop-shadow-2xl ${
                        flashShowingOperation === '-'
                          ? 'bg-gradient-to-br from-blue-300 via-cyan-400 to-teal-500'
                          : 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500'
                      }`}
                    >
                      <span className={`${flashShowingOperation === '-' ? 'text-blue-400' : 'text-green-400'}`}>
                        {flashShowingOperation}
                      </span>
                      {flashShowingNumber}
                    </div>
                  ) : (
                    <div className="text-6xl sm:text-8xl md:text-9xl font-black text-white/20">•</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Answer phase - FULL HEIGHT RESPONSIVE & EXCITING */}
          {flashPhase === 'answer' && (
            <div className="text-center w-full max-w-lg px-3 sm:px-4 flex flex-col justify-center h-full">
              {/* Timer - Urgency feeling: Xanh (nhanh) -> Vàng (vừa) -> Đỏ (chậm) */}
              <div className="mb-2 sm:mb-3">
                <div className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-2xl shadow-2xl border-2 ${
                  flashAnswerTimer >= 15 
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 border-red-400 animate-pulse' 
                    : flashAnswerTimer >= 8 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-yellow-400' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400'
                } transition-all duration-300`}>
                  <span className={`text-2xl ${flashAnswerTimer >= 15 ? 'animate-bounce' : ''}`}>⏱️</span>
                  <span className="text-3xl sm:text-4xl font-black text-white tabular-nums">{flashAnswerTimer}s</span>
                  {flashAnswerTimer >= 15 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping"></span>
                  )}
                </div>
              </div>
              
              {/* Question prompt - Exciting */}
              <div className="mb-2">
                <div className="text-3xl sm:text-4xl mb-1 animate-bounce">🧠</div>
                <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 animate-pulse leading-relaxed pt-1">KẾT QUẢ LÀ BAO NHIÊU?</h2>
                <p className="text-white/70 text-xs">Nhập kết quả phép tính của bạn</p>
              </div>
              
              {/* Info badges - Compact inline */}
              <div className="flex justify-center gap-2 mb-2">
                <div className="bg-white/15 backdrop-blur border border-white/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <span>📊</span>
                  <span className="font-bold text-white text-sm">{flashNumbers.length} số</span>
                </div>
                <div className="bg-white/15 backdrop-blur border border-white/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <span>⚡</span>
                  <span className="font-bold text-white text-sm">{avgSpeed}s/số</span>
                </div>
              </div>
              
              {/* Input - Epic Gaming style */}
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-3 border-yellow-400/70 overflow-hidden shadow-2xl shadow-yellow-500/30">
                  <input
                    ref={flashInputRef}
                    type="text"
                    inputMode="none"
                    readOnly
                    value={flashAnswer}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        setFlashAnswer(e.target.value);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Xử lý nhập số từ bàn phím (desktop)
                      if (/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                        setFlashAnswer(prev => prev + e.key);
                      } else if (e.key === 'Backspace') {
                        e.preventDefault();
                        setFlashAnswer(prev => prev.slice(0, -1));
                      } else if (e.key === 'Enter' && flashAnswer) {
                        handleFlashSubmit();
                      }
                    }}
                    placeholder="?"
                    autoFocus
                    className="w-full text-5xl sm:text-6xl font-black text-center py-4 sm:py-5 bg-transparent text-yellow-400 placeholder-white/20 outline-none caret-yellow-400 sm:[&]:read-write"
                  />
                </div>
              </div>

              {/* Numpad for Mobile - Hidden on Desktop (sm:hidden) */}
              <div className="grid grid-cols-3 gap-1.5 mb-2 sm:hidden">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => setFlashAnswer(prev => prev + String(num))}
                    className="bg-gradient-to-br from-slate-700 to-slate-800 text-white text-2xl font-bold py-3 rounded-xl border border-white/20 active:scale-95 active:brightness-125 transition-all shadow-lg"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setFlashAnswer(prev => prev.slice(0, -1))}
                  className="bg-gradient-to-br from-red-600 to-red-700 text-white text-xl font-bold py-3 rounded-xl border border-red-400/30 active:scale-95 transition-all shadow-lg"
                >
                  ⌫
                </button>
                <button
                  onClick={() => setFlashAnswer(prev => prev + '0')}
                  className="bg-gradient-to-br from-slate-700 to-slate-800 text-white text-2xl font-bold py-3 rounded-xl border border-white/20 active:scale-95 active:brightness-125 transition-all shadow-lg"
                >
                  0
                </button>
                <button
                  onClick={handleFlashSubmit}
                  disabled={!flashAnswer}
                  className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-lg font-bold py-3 rounded-xl border border-green-400/30 active:scale-95 transition-all shadow-lg disabled:opacity-40"
                >
                  Enter
                </button>
              </div>
              
              {/* Submit button - Epic - Hidden on Mobile */}
              <button
                onClick={handleFlashSubmit}
                disabled={!flashAnswer}
                className="hidden sm:flex w-full py-3 sm:py-4 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white font-black text-lg sm:text-xl rounded-2xl hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl shadow-orange-500/50 items-center justify-center gap-2 border-2 border-yellow-300/30"
              >
                <span className="text-2xl">⚡</span> XÁC NHẬN
              </button>
              
              <p className="mt-1.5 text-white/50 text-[10px] sm:text-xs hidden sm:flex items-center justify-center gap-1">
                Nhấn <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-white font-bold">Enter</kbd> để gửi đáp án
              </p>
            </div>
          )}

          {/* Result phase - FULLY RESPONSIVE - NO SCROLL */}
          {flashPhase === 'result' && (
            <div className="text-center w-full max-w-lg px-2 sm:px-4 relative z-20">
              {/* Confetti effect khi đúng - giảm số lượng trên mobile */}
              {result && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute animate-confetti text-xl sm:text-2xl"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        animationDuration: `${1.5 + Math.random()}s`
                      }}
                    >
                      {['⭐', '🌟', '✨', '💫', '🎉', '🎊'][Math.floor(Math.random() * 6)]}
                    </div>
                  ))}
                </div>
              )}

              {result ? (
                // ========== ĐÚNG - EPIC VICTORY WITH EFFECTS ==========
                <div className="animate-celebrate relative z-30">
                  {/* Glow effect behind - pointer-events-none để không block button */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-3xl blur-2xl animate-pulse pointer-events-none -z-10"></div>
                  
                  {/* Header: Emoji + Title + Combo */}
                  <div className="relative flex items-center justify-center gap-3 mb-3 z-10">
                    <div className="text-5xl sm:text-6xl animate-bounce drop-shadow-lg">{flashResultMessage?.emoji || '🎉'}</div>
                    <div className="text-left">
                      <h2 className={`text-2xl sm:text-3xl font-black leading-relaxed pt-1 ${streak >= 5 ? 'animate-rainbow bg-clip-text text-transparent' : 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400'}`}>
                        {flashResultMessage?.title || 'XUẤT SẮC!'}
                      </h2>
                      <p className="text-white/80 text-xs sm:text-sm leading-normal">{flashResultMessage?.msg || 'Bạn giỏi quá!'}</p>
                    </div>
                    {streak >= 3 && (
                      <div className={`bg-gradient-to-r ${streak >= 5 ? 'from-red-500 to-orange-500 animate-pulse' : 'from-orange-500 to-yellow-500'} text-white px-3 py-1.5 rounded-xl font-black text-sm shadow-lg`}>
                        🔥 x{streak}
                      </div>
                    )}
                  </div>
                  
                  {/* Answer + Stars - Big & Beautiful */}
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 border-2 border-green-300/50 rounded-2xl p-4 mb-3 shadow-xl shadow-green-500/40">
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <div className="text-green-100 text-xs font-bold mb-1">✅ CHÍNH XÁC</div>
                        <div className="text-4xl sm:text-5xl font-black text-white drop-shadow-lg">{flashAnswer}</div>
                      </div>
                      <div className="h-14 w-px bg-white/30"></div>
                      <div className="text-center">
                        <div className="text-green-100 text-xs font-bold mb-1">THƯỞNG</div>
                        <div className="flex items-center gap-1">
                          <span className="text-white font-black text-2xl sm:text-3xl">+{config?.stars || 2}</span>
                          <span className="text-3xl sm:text-4xl animate-spin-slow">⭐</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Phép tính + Thời gian */}
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-2 mb-3 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-0.5 flex-1">
                      {flashNumbers.map((num, i) => (
                        <span key={i} className="flex items-center">
                          {i > 0 && (
                            <span className={`mx-0.5 text-xs font-bold ${flashOperations[i] === '-' ? 'text-blue-400' : 'text-green-400'}`}>
                              {flashOperations[i]}
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-xs sm:text-sm font-bold ${
                            flashOperations[i] === '-' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                          }`}>{num}</span>
                        </span>
                      ))}
                      <span className="text-white/50 mx-1">=</span>
                      <span className="text-green-400 font-black text-sm sm:text-base">{flashCorrectAnswer}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                      flashAnswerTimer <= 5 ? 'bg-green-500/30 text-green-300' :
                      flashAnswerTimer <= 10 ? 'bg-yellow-500/30 text-yellow-300' :
                      'bg-red-500/30 text-red-300'
                    }`}>
                      ⏱️ {flashAnswerTimer}s
                      {flashAnswerTimer <= 5 && <span>⚡</span>}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => nextFlashChallenge()}
                    className="relative z-20 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-lg rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-green-500/50 border border-green-300/30 cursor-pointer"
                  >
                    {currentChallenge >= totalChallenges ? '🏆 XEM KẾT QUẢ' : '⚡ CÂU TIẾP THEO'}
                  </button>
                  <p className="text-white/50 text-[10px] mt-1.5">Nhấn <kbd className="bg-white/20 px-1.5 py-0.5 rounded font-bold">Enter</kbd> để tiếp tục</p>
                </div>
              ) : (
                // ========== SAI - SUPER COMPACT ENCOURAGE ==========
                <div className="animate-shake relative z-30">
                  {/* Header: Emoji + Title */}
                  <div className="flex items-center justify-center gap-2 mb-2 z-10">
                    <div className="text-4xl sm:text-5xl animate-wiggle">{flashResultMessage?.emoji || '💪'}</div>
                    <div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 leading-relaxed pt-1">
                        {flashResultMessage?.title || 'CỐ LÊN NÀO!'}
                      </h2>
                      <p className="text-white/70 text-[10px] sm:text-xs leading-normal">{flashResultMessage?.msg || 'Tập trung hơn, bạn sẽ làm được!'}</p>
                    </div>
                  </div>
                  
                  {/* Progress badge */}
                  <div className="bg-amber-500/20 border border-orange-400/30 rounded-lg px-3 py-1 mb-2 inline-block">
                    <span className="text-orange-300 font-medium text-xs">💡 Đúng {sessionStats.correct}/{currentChallenge} câu - Cố lên nhé!</span>
                  </div>
                  
                  {/* Answer comparison */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-red-500/30 border border-red-400/50 rounded-xl p-2">
                      <div className="text-red-300 text-[10px] font-semibold">❌ CÂU TRẢ LỜI</div>
                      <div className="text-2xl sm:text-3xl font-black text-red-400">{flashAnswer}</div>
                    </div>
                    <div className="bg-green-500/30 border border-green-400/50 rounded-xl p-2">
                      <div className="text-green-300 text-[10px] font-semibold">✅ ĐÁP ÁN ĐÚNG</div>
                      <div className="text-2xl sm:text-3xl font-black text-green-400">{flashCorrectAnswer}</div>
                    </div>
                  </div>
                  
                  {/* Calculation + Time */}
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-2 mb-2 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-0.5 flex-1">
                      {flashNumbers.map((num, i) => (
                        <span key={i} className="flex items-center">
                          {i > 0 && (
                            <span className={`mx-0.5 text-xs font-bold ${flashOperations[i] === '-' ? 'text-blue-400' : 'text-green-400'}`}>
                              {flashOperations[i]}
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-xs sm:text-sm font-bold ${
                            flashOperations[i] === '-' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                          }`}>{num}</span>
                        </span>
                      ))}
                      <span className="text-white/50 mx-1">=</span>
                      <span className="text-green-400 font-black text-sm sm:text-base">{flashCorrectAnswer}</span>
                    </div>
                    <div className="text-white/50 text-xs">⏱️ {flashAnswerTimer}s</div>
                  </div>
                  
                  <button
                    onClick={() => nextFlashChallenge()}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-base sm:text-lg rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-blue-500/50 border border-blue-300/30"
                  >
                    {currentChallenge >= totalChallenges ? '🏆 XEM KẾT QUẢ' : '💪 CÂU TIẾP THEO'}
                  </button>
                  <p className="text-white/40 text-[10px] mt-1">Nhấn <kbd className="bg-white/20 px-1.5 py-0.5 rounded font-bold">Enter</kbd> để tiếp tục</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom stats - ULTRA COMPACT HUD */}
        <div className="relative z-10 flex-shrink-0 bg-black/50 backdrop-blur border-t border-white/10 px-3 py-1.5">
          <div className="flex justify-center items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
              ⭐ <span>{sessionStats.stars}</span>
            </div>
            <div className="flex items-center gap-1 text-green-400 font-bold text-sm">
              ✅ <span>{sessionStats.correct}/{sessionStats.total}</span>
            </div>
            <div className="flex items-center gap-1 text-orange-400 font-bold text-sm">
              🔥 <span>{streak}</span>
            </div>
          </div>
        </div>

        {/* Custom animation styles */}
        <style jsx global>{`
          @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          .animate-confetti { animation: confetti 2s ease-out forwards; }
          
          @keyframes zoom-in {
            0% { transform: scale(0.5); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-zoom-in { animation: zoom-in 0.3s ease-out forwards; }
          
          @keyframes celebrate {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-celebrate { animation: celebrate 0.5s ease-out forwards; }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-shake { animation: shake 0.5s ease-out; }
          
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            75% { transform: rotate(10deg); }
          }
          .animate-wiggle { animation: wiggle 0.5s ease-in-out infinite; }
          
          @keyframes spin-slow {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.2); }
            100% { transform: rotate(360deg) scale(1); }
          }
          .animate-spin-slow { animation: spin-slow 1s ease-in-out infinite; }
          
          @keyframes rainbow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-rainbow {
            background: linear-gradient(90deg, #ff0000, #ff7700, #ffdd00, #00ff00, #0000ff, #8b00ff, #ff0000);
            background-size: 400% 400%;
            animation: rainbow 2s ease infinite;
            -webkit-background-clip: text;
            background-clip: text;
          }
        `}</style>
        
        <UpgradeModalComponent />
      </div>
    );
  }

  // ========== NORMAL GAME SCREEN ==========
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
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-center gap-3">
          {/* Left: Back */}
          <button
            onClick={() => {
              // 🎮 GAME MODE: Nếu từ adventure, quay về adventure
              if (gameMode?.from === 'adventure') {
                handleBackToGame();
              } else {
                backToArenaDetail();
              }
            }}
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
                
                if (challengeNum < currentChallenge) {                  if (resultStatus === 'correct') dotClass = 'bg-green-400';
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
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-2 sm:gap-4">
          <div className="text-white font-black text-xl sm:text-3xl md:text-4xl">
            {problem?.displayProblem}
          </div>
          <div className="text-white/60 text-xl sm:text-3xl md:text-4xl">=</div>
          
          {isMentalMode ? (
            <input
              ref={mentalInputRef}
              type="text"
              inputMode="none"
              readOnly
              value={mentalAnswer}
              onKeyDown={handleMentalKeyDown}
              disabled={result !== null}
              placeholder="?"
              autoComplete="off"
              style={{ width: `${Math.max(3, mentalAnswer.length + 2)}ch` }}
              className={`font-black text-xl sm:text-3xl md:text-4xl px-2 sm:px-3 py-1 sm:py-2 rounded-xl sm:rounded-2xl text-center transition-all outline-none caret-transparent ${
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
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-center gap-2 sm:gap-3">
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
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="text-center w-full max-w-[340px] sm:max-w-[280px]">
            <div className="text-4xl sm:text-5xl mb-1 sm:mb-2">🧠</div>
            <p className="text-white/80 text-xs sm:text-xs mb-3 sm:mb-2">
              Nhập số → <span className="bg-green-500 px-1.5 py-0.5 rounded font-bold">Enter</span>
            </p>
            
            {/* Numpad - LỚN HƠN trên mobile */}
            <div className="grid grid-cols-3 gap-2 sm:gap-1.5 mx-auto">
              {[1,2,3,4,5,6,7,8,9].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (result !== null) return;
                    setMentalAnswer(prev => prev + num);
                  }}
                  disabled={result !== null}
                  className="bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-xl sm:rounded-lg p-4 sm:p-3 text-white font-bold text-2xl sm:text-xl transition-all active:scale-95 disabled:opacity-50 shadow-lg"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => {
                  if (result !== null) return;
                  setMentalAnswer(prev => prev.slice(0, -1));
                }}
                disabled={result !== null}
                className="bg-red-500/70 hover:bg-red-500 active:bg-red-600 rounded-xl sm:rounded-lg p-4 sm:p-3 text-white font-bold text-lg sm:text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg"
              >
                ⌫
              </button>
              <button
                onClick={() => {
                  if (result !== null) return;
                  setMentalAnswer(prev => prev + '0');
                }}
                disabled={result !== null}
                className="bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-xl sm:rounded-lg p-4 sm:p-3 text-white font-bold text-2xl sm:text-xl transition-all active:scale-95 disabled:opacity-50 shadow-lg"
              >
                0
              </button>
              <button
                onClick={() => {
                  if (result !== null) return;
                  handleMentalSubmit();
                }}
                disabled={result !== null || !mentalAnswer}
                className="bg-green-500 hover:bg-green-400 active:bg-green-600 rounded-xl sm:rounded-lg p-4 sm:p-3 text-white font-bold text-base sm:text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg"
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
      
      {/* Modal nâng cấp tinh tế */}
      <UpgradeModalComponent />
      
      {/* Soft upgrade trigger - chỉ hiện sau trận đấu tốt */}
      {userTier === 'free' && showMilestoneCelebration && (
        <MilestoneCelebration 
          show={showMilestoneCelebration}
          onClose={() => setShowMilestoneCelebration(false)}
          milestoneType={milestoneData?.type || 'battle'}
          message={milestoneData?.message}
          starsEarned={milestoneData?.starsEarned || 0}
        />
      )}
      
      {/* Footer - chỉ hiện ở màn chọn mode và kết quả */}
      {(!gameStarted || gameComplete) && (
        <div className="fixed bottom-2 left-0 right-0 z-10 text-center pointer-events-none">
          <p className="text-white/30 text-[10px] sm:text-xs">
            © {new Date().getFullYear()} SoroKid - Học toán tư duy cùng bàn tính Soroban
          </p>
        </div>
      )}
    </div>
  );
}

// Export with Suspense wrapper for useSearchParams
export default function CompetePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    }>
      <CompetePageContent />
    </Suspense>
  );
}