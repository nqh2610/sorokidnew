'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef, Suspense } from 'react';
import { ArrowLeft, Trophy, Zap, Clock, SkipForward, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/Toast/ToastContext';
import { useUpgradeModal } from '@/components/UpgradeModal';
import Logo from '@/components/Logo/Logo';
import SorobanBoard from '@/components/Soroban/SorobanBoard';
import { calculatePracticeStars } from '@/lib/gamification';
import { MilestoneCelebration } from '@/components/SoftUpgradeTrigger';
import GameModeHeader from '@/components/GameModeHeader/GameModeHeader';
import { useGameSound } from '@/lib/useGameSound';
import { getNextZoneAfterStage as getNextZoneAddSub } from '@/config/adventure-stages-addsub.config';
import { getNextZoneAfterStage as getNextZoneMulDiv } from '@/config/adventure-stages-muldiv.config';

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
  5: { label: 'Huyền Thoại', emoji: '👑' },
  6: { label: 'Siêu Huyền Thoại', emoji: '💎' }
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

// Cấu hình các cấp độ Flash Anzan - LIGHT SPEED THEME (Tốc độ ánh sáng)
// CHỈ CÓ TỐC ĐỘ - Số chữ số và phép toán được chọn riêng
const flashLevels = [
  {
    id: 'anhNen',
    name: 'Ánh Nến',
    subtitle: 'Lung linh dịu dàng',
    emoji: '🕯️',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'from-amber-50 to-orange-50',
    glowColor: 'shadow-amber-400/50',
    numbers: [3, 4],
    speed: [3, 3],
    stars: 2,
    difficultyLevel: 1,
    tagline: 'Khởi đầu ấm áp',
    rank: '⭐',
    rankLabel: 'Tập Sự',
    rankColor: 'from-amber-500 to-orange-600',
    bonusMultiplier: 1
  },
  {
    id: 'anhTrang',
    name: 'Ánh Trăng',
    subtitle: 'Huyền ảo đêm thanh',
    emoji: '🌙',
    color: 'from-slate-300 to-blue-400',
    bgColor: 'from-slate-50 to-blue-50',
    glowColor: 'shadow-blue-300/50',
    numbers: [4, 5],
    speed: [2.5, 2.5],
    stars: 4,
    difficultyLevel: 2,
    tagline: 'Bước tiếp vững chắc',
    rank: '⭐⭐',
    rankLabel: 'Chiến Binh',
    rankColor: 'from-slate-400 to-blue-500',
    bonusMultiplier: 1.5
  },
  {
    id: 'tiaChop',
    name: 'Tia Chớp',
    subtitle: 'Lóe sáng chớp nhoáng',
    emoji: '⚡',
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'from-yellow-50 to-amber-50',
    glowColor: 'shadow-yellow-400/50',
    numbers: [5, 6],
    speed: [2, 2],
    stars: 6,
    difficultyLevel: 3,
    tagline: 'Nhanh như chớp!',
    rank: '⭐⭐⭐',
    rankLabel: 'Dũng Sĩ',
    rankColor: 'from-yellow-500 to-amber-600',
    bonusMultiplier: 2
  },
  {
    id: 'saoBang',
    name: 'Sao Băng',
    subtitle: 'Vụt sáng khoảnh khắc',
    emoji: '☄️',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'from-purple-50 to-pink-50',
    glowColor: 'shadow-purple-400/50',
    numbers: [6, 7],
    speed: [1.5, 1.5],
    stars: 8,
    difficultyLevel: 4,
    tagline: '🔥 SIÊU TỐC 🔥',
    rank: '⭐⭐⭐⭐',
    rankLabel: 'Huyền Thoại',
    rankColor: 'from-purple-500 to-pink-600',
    bonusMultiplier: 3
  },
  {
    id: 'bigBang',
    name: 'BIG BANG',
    subtitle: 'Vụ nổ khai sinh vũ trụ',
    emoji: '💥',
    color: 'from-red-500 via-orange-500 to-yellow-400',
    bgColor: 'from-red-50 to-yellow-50',
    glowColor: 'shadow-red-500/50',
    numbers: [7, 8],
    speed: [1, 1],
    stars: 10,
    difficultyLevel: 5,
    tagline: '💥 VỤ NỔ VŨ TRỤ 💥',
    rank: '👑',
    rankLabel: 'THẦN',
    rankColor: 'from-red-500 via-orange-500 to-yellow-400',
    bonusMultiplier: 5
  },
  {
    id: 'sieuBigBang',
    name: 'SIÊU BIG BANG',
    subtitle: 'Đỉnh cao tốc độ',
    emoji: '🌌',
    color: 'from-fuchsia-500 via-purple-600 to-indigo-700',
    bgColor: 'from-fuchsia-50 to-indigo-50',
    glowColor: 'shadow-fuchsia-500/50',
    numbers: [8, 10],
    speed: [0.7, 0.7],
    stars: 15,
    difficultyLevel: 6,
    tagline: '🌌 SIÊU VŨ TRỤ 🌌',
    rank: '👑👑',
    rankLabel: 'THẦN THÁNH',
    rankColor: 'from-fuchsia-500 via-purple-600 to-indigo-700',
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

// Helper hiển thị sao độ khó
const renderDifficultyStars = (level) => {
  const filled = level;
  const empty = 5 - level;
  return (
    <div className="flex gap-0.5">
      {[...Array(filled)].map((_, i) => (
        <span key={`f${i}`} className="text-yellow-400">★</span>
      ))}
      {[...Array(empty)].map((_, i) => (
        <span key={`e${i}`} className="text-white/30">☆</span>
      ))}
    </div>
  );
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
function PracticePageContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { showUpgradeModal, UpgradeModalComponent } = useUpgradeModal();
  const { play, playMusic, stopMusic } = useGameSound();

  // 🎵 Start battle music when entering practice
  useEffect(() => {
    let musicStarted = false;
    
    // Start battle music on first interaction
    const startMusic = () => {
      if (musicStarted) return;
      musicStarted = true;
      setTimeout(() => playMusic('battle'), 100);
    };
    
    document.addEventListener('click', startMusic);
    document.addEventListener('touchstart', startMusic);
    document.addEventListener('keydown', startMusic);
    
    // Cleanup: stop music when leaving
    return () => {
      document.removeEventListener('click', startMusic);
      document.removeEventListener('touchstart', startMusic);
      document.removeEventListener('keydown', startMusic);
      stopMusic(true);
    };
  }, []); // Empty deps - only run once

  // Get mode and difficulty from URL query params
  const modeFromUrl = searchParams.get('mode');
  const difficultyFromUrl = searchParams.get('difficulty');

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
  
  // Soft upgrade triggers state
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [milestoneData, setMilestoneData] = useState(null);
  
  // 🚀 TỐI ƯU: Batch exercise results - chỉ gửi 1 lần cuối màn thay vì mỗi câu
  // Trước: 10-50 POST requests/màn | Sau: 1 POST request/màn
  const pendingResultsRef = useRef([]); // Lưu kết quả chờ gửi batch
  
  // Flash Anzan states
  const [flashLevel, setFlashLevel] = useState(null); // Cấp độ Flash Anzan đã chọn
  const [flashPhase, setFlashPhase] = useState('idle'); // 'idle' | 'countdown' | 'showing' | 'answer' | 'result'
  const [flashNumbers, setFlashNumbers] = useState([]); // Các số sẽ hiện
  const [flashOperations, setFlashOperations] = useState([]); // Các phép tính (+/-) cho từng số
  const [flashCurrentIndex, setFlashCurrentIndex] = useState(0); // Index số đang hiện
  const [flashAnswer, setFlashAnswer] = useState(''); // Đáp án người dùng nhập
  const [flashCorrectAnswer, setFlashCorrectAnswer] = useState(0); // Đáp án đúng
  const [flashCountdown, setFlashCountdown] = useState(3); // Đếm ngược
  const [flashShowingNumber, setFlashShowingNumber] = useState(null); // Số đang hiện trên màn hình
  const [flashShowingOperation, setFlashShowingOperation] = useState(null); // Phép tính đang hiện (+/-)
  const [flashAnswerTimer, setFlashAnswerTimer] = useState(0); // Đồng hồ bấm giờ khi nhập đáp án
  const [flashResultMessage, setFlashResultMessage] = useState(null); // Lưu lời khen/động viên
  const flashInputRef = useRef(null);
  const flashTimeoutRef = useRef(null);
  const flashAnswerTimerRef = useRef(null);

  // Flash Anzan Mode Selection states
  const [flashSelectedDigits, setFlashSelectedDigits] = useState(null); // 1, 2, hoặc 3 chữ số
  const [flashSelectedOperation, setFlashSelectedOperation] = useState(null); // 'addition', 'subtraction', hoặc 'mixed'
  const [flashModeStep, setFlashModeStep] = useState('digits'); // 'digits' | 'operation' | 'speed'
  
  // Danh sách lời khen và động viên
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

  // 🎯 AUTO-START: State để theo dõi việc tự động bắt đầu
  const [autoStartPending, setAutoStartPending] = useState(null);

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
          console.log('🎯 Auto-navigating to next zone:', targetZoneId);
        }
      }
      
      sessionStorage.setItem('adventureReturnZone', JSON.stringify({
        zoneId: targetZoneId,
        mapType: gameMode.mapType || 'addsub',
        timestamp: Date.now()
      }));
    }
    // Clear game mode data
    sessionStorage.removeItem('practiceGameMode');
    sessionStorage.removeItem('practiceAutoStart');
    router.push('/adventure');
  };

  // 🎮 GAME MODE: Helper để xử lý back button
  const handleBack = () => {
    if (gameMode?.from === 'adventure') {
      handleBackToGame(false);
    } else {
      setMode(null);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // 🔗 AUTO-START FROM URL: Xử lý query params từ Adventure links
  useEffect(() => {
    if (status !== 'authenticated') return;
    if (mode) return; // Đã chọn mode rồi
    
    if (modeFromUrl && modeInfo[modeFromUrl]) {
      console.log('[Practice] Auto-start from URL:', { mode: modeFromUrl, difficulty: difficultyFromUrl });
      
      // Set difficulty từ URL
      if (difficultyFromUrl) {
        const diff = parseInt(difficultyFromUrl, 10);
        if (diff >= 1 && diff <= 6) {
          setDifficulty(diff);
        }
      }
      
      // Set autoStartPending để trigger chọn mode
      setAutoStartPending({
        mode: modeFromUrl,
        difficulty: difficultyFromUrl ? parseInt(difficultyFromUrl, 10) : 1,
        fromUrl: true
      });
    }
  }, [status, modeFromUrl, difficultyFromUrl, mode]);

  // 🎯 AUTO-START: Kiểm tra sessionStorage từ Adventure Map
  useEffect(() => {
    if (status !== 'authenticated') return;
    if (mode) return; // Đã có mode rồi, không auto-start nữa

    // Kiểm tra game mode từ Adventure page (ưu tiên này trước)
    const gameModeRaw = sessionStorage.getItem('practiceGameMode');
    if (gameModeRaw) {
      try {
        const gameModeData = JSON.parse(gameModeRaw);
        // Chỉ valid trong 30 phút
        if (Date.now() - gameModeData.timestamp < 30 * 60 * 1000) {
          setGameMode(gameModeData);
          console.log('[Practice] Game mode active:', gameModeData);
          
          // 🚀 AUTO-START: Từ Adventure → tự động bắt đầu ngay
          if (gameModeData.from === 'adventure' && gameModeData.mode) {
            const autoMode = gameModeData.mode;
            const autoDiff = gameModeData.difficulty || 1;
            
            console.log('[Practice] Auto-starting from Adventure:', { mode: autoMode, difficulty: autoDiff });
            
            // Set difficulty
            setDifficulty(autoDiff);
            
            // Trigger auto-start
            setAutoStartPending({
              mode: autoMode,
              difficulty: autoDiff,
              from: 'adventure'
            });
            
            return; // Không cần check practiceAutoStart nữa
          }
        }
      } catch (e) {
        console.error('[Practice] Game mode parse error:', e);
      }
    }

    // Fallback: Check practiceAutoStart (từ /practice/auto page)
    const autoStartRaw = sessionStorage.getItem('practiceAutoStart');
    if (!autoStartRaw) return;

    try {
      const autoStart = JSON.parse(autoStartRaw);

      // Kiểm tra timestamp (chỉ valid trong 30s)
      if (Date.now() - autoStart.timestamp > 30000) {
        sessionStorage.removeItem('practiceAutoStart');
        return;
      }

      // Clear sessionStorage ngay để tránh loop
      sessionStorage.removeItem('practiceAutoStart');

      console.log('[Practice] Auto-start from practiceAutoStart:', autoStart);

      // Nếu từ adventure, cập nhật game mode với data đầy đủ hơn
      if (autoStart.from === 'adventure') {
        setGameMode(prev => ({
          ...prev,
          ...autoStart,
          from: 'adventure'
        }));
      }

      // Lưu để xử lý sau khi có generateProblem
      setAutoStartPending(autoStart);
      setDifficulty(autoStart.difficulty || 1);

    } catch (error) {
      console.error('[Practice] Auto-start error:', error);
      sessionStorage.removeItem('practiceAutoStart');
    }
  }, [status, mode]);

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
      if (flashAnswerTimerRef.current) {
        clearInterval(flashAnswerTimerRef.current);
      }
    };
  }, []);

  // Timer đồng hồ bấm giờ cho Flash Anzan answer phase
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

  // Bắt phím Enter cho Flash Anzan result phase - DELAY để tránh trigger ngay sau submit
  useEffect(() => {
    if (mode === 'flashAnzan' && flashPhase === 'result') {
      let isActive = true;
      let handler = null;
      
      // Delay 500ms trước khi cho phép Enter để chuyển câu
      // Tránh Enter từ answer phase trigger ngay
      const delayTimer = setTimeout(() => {
        if (!isActive) return;
        
        handler = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            nextFlashChallenge();
          }
        };
        window.addEventListener('keydown', handler);
      }, 500);
      
      return () => {
        isActive = false;
        clearTimeout(delayTimer);
        if (handler) {
          window.removeEventListener('keydown', handler);
        }
      };
    }
  }, [mode, flashPhase]);

  // Bắt phím Enter và số cho Flash Anzan answer phase
  useEffect(() => {
    if (mode === 'flashAnzan' && flashPhase === 'answer') {
      const handleAnswerKeyDown = (e) => {
        // Enter để submit
        if (e.key === 'Enter' && flashAnswer) {
          e.preventDefault();
          handleFlashSubmit();
        }
        // Số 0-9
        else if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          setFlashAnswer(prev => prev + e.key);
          flashInputRef.current?.focus();
        }
        // Backspace để xóa
        else if (e.key === 'Backspace') {
          e.preventDefault();
          setFlashAnswer(prev => prev.slice(0, -1));
        }
        // Dấu trừ cho số âm
        else if (e.key === '-' && flashAnswer === '') {
          e.preventDefault();
          setFlashAnswer('-');
        }
      };
      window.addEventListener('keydown', handleAnswerKeyDown);
      return () => window.removeEventListener('keydown', handleAnswerKeyDown);
    }
  }, [mode, flashPhase, flashAnswer]);

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
    // 🔒 TIER CHECK: Kiểm tra quyền truy cập mode
    if (!canAccessMode(userTier, selectedMode)) {
      const requiredTier = getRequiredTierForMode(selectedMode);
      showUpgradeModal({
        feature: `Chế độ ${modeInfo[selectedMode]?.title || selectedMode} yêu cầu gói ${getTierDisplayName(requiredTier)} trở lên`
      });
      return;
    }
    
    // 🔒 TIER CHECK: Kiểm tra quyền truy cập difficulty
    if (!canAccessDifficulty(userTier, difficulty)) {
      const requiredTier = getRequiredTierForDifficulty(difficulty);
      showUpgradeModal({
        feature: `Cấp độ ${difficulty} yêu cầu gói ${getTierDisplayName(requiredTier)} trở lên`
      });
      return;
    }
    
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

  // 🎯 AUTO-START: Xử lý khi có autoStartPending từ Adventure Map
  useEffect(() => {
    if (!autoStartPending) return;
    
    const { mode: autoMode, difficulty: autoDiff } = autoStartPending;
    setAutoStartPending(null); // Clear ngay để tránh chạy lại
    
    console.log('[Practice] Starting auto mode:', autoMode, 'difficulty:', autoDiff);
    
    // 🔒 TIER CHECK: Kiểm tra quyền truy cập mode
    if (!canAccessMode(userTier, autoMode)) {
      const requiredTier = getRequiredTierForMode(autoMode);
      showUpgradeModal({
        feature: `Chế độ ${modeInfo[autoMode]?.title || autoMode} yêu cầu gói ${getTierDisplayName(requiredTier)} trở lên`
      });
      router.push('/adventure');
      return;
    }
    
    // 🔒 TIER CHECK: Kiểm tra quyền truy cập difficulty
    if (!canAccessDifficulty(userTier, autoDiff)) {
      const requiredTier = getRequiredTierForDifficulty(autoDiff);
      showUpgradeModal({
        feature: `Cấp độ ${autoDiff} yêu cầu gói ${getTierDisplayName(requiredTier)} trở lên`
      });
      router.push('/adventure');
      return;
    }
    
    // Đặc biệt xử lý các mode cần chọn thêm
    if (autoMode === 'mentalMath') {
      setMode('mentalMath');
      // Mặc định dùng addSubMixed cho mental math từ adventure
      startMentalMode('addSubMixed');
      return;
    }
    
    if (autoMode === 'flashAnzan') {
      setMode('flashAnzan');
      setFlashLevel(null); // Vẫn cần chọn level cho flash
      setFlashPhase('idle');
      return;
    }
    
    // Mode thường - bắt đầu ngay
    setMode(autoMode);
    setProblem(generateProblem(autoMode, autoDiff));
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
    
  }, [autoStartPending, difficulty]);

  // ================== FLASH ANZAN FUNCTIONS ==================

  // Tạo số ngẫu nhiên cho Flash Anzan với chữ số và phép toán được chọn
  // Chỉ hỗ trợ 'addition' và 'mixed' - kết quả LUÔN DƯƠNG cho học sinh tiểu học
  const generateFlashNumbers = (level, selectedDigits, selectedOperation) => {
    const config = flashLevels.find(l => l.id === level);
    if (!config) return { numbers: [], operations: [] };

    // Sử dụng số chữ số đã chọn thay vì từ config
    const digits = selectedDigits || 1;
    const operationMode = selectedOperation || 'addition';

    const count = config.numbers[0] + Math.floor(Math.random() * (config.numbers[1] - config.numbers[0] + 1));
    const numbers = [];
    const operations = [];

    const maxDigit = Math.pow(10, digits) - 1;
    const minDigit = digits === 1 ? 1 : Math.pow(10, digits - 1);

    let runningTotal = 0;

    for (let i = 0; i < count; i++) {
      let num = Math.floor(Math.random() * (maxDigit - minDigit + 1)) + minDigit;

      if (operationMode === 'addition') {
        // Chỉ có phép cộng
        operations.push('+');
        numbers.push(num);
        runningTotal += num;
      } else {
        // Mixed: Cộng trừ xen kẽ - ĐẢM BẢO KẾT QUẢ LUÔN DƯƠNG
        if (i === 0) {
          // Số đầu tiên luôn là cộng
          operations.push('+');
          numbers.push(num);
          runningTotal += num;
        } else {
          // Chỉ cho phép trừ nếu kết quả sau khi trừ vẫn > 0
          // Giới hạn số trừ tối đa = 70% tổng hiện tại để đảm bảo dư nhiều
          const maxSubtractAllowed = Math.floor(runningTotal * 0.7);
          const canSubtract = maxSubtractAllowed >= minDigit;
          const shouldSubtract = canSubtract && Math.random() < 0.4; // 40% trừ, 60% cộng

          if (shouldSubtract) {
            // Tạo số trừ trong phạm vi an toàn
            const safeMax = Math.min(maxDigit, maxSubtractAllowed);
            num = Math.floor(Math.random() * (safeMax - minDigit + 1)) + minDigit;
            operations.push('-');
            numbers.push(num);
            runningTotal -= num;
          } else {
            operations.push('+');
            numbers.push(num);
            runningTotal += num;
          }
        }
      }
    }

    return { numbers, operations };
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
    setFlashShowingOperation(null);

    // Sử dụng số chữ số và phép toán đã chọn
    const { numbers, operations } = generateFlashNumbers(levelId, flashSelectedDigits, flashSelectedOperation);
    setFlashNumbers(numbers);
    setFlashOperations(operations);

    // Tính tổng dựa trên phép tính
    let correctAnswer = 0;
    for (let i = 0; i < numbers.length; i++) {
      if (operations[i] === '+') {
        correctAnswer += numbers[i];
      } else {
        correctAnswer -= numbers[i];
      }
    }

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
          showFlashNumber(0, numbers, operations, config);
        }, 500);
      }
    }, 1000);
  };
  
  // Hiện số từng cái một - TỐC ĐỘ CỐ ĐỊNH - FIX FLICKERING
  const showFlashNumber = (index, numbers, operations, config) => {
    if (index >= numbers.length) {
      // Đã hiện hết số, chuyển sang phase trả lời
      setFlashPhase('answer');
      setFlashShowingNumber(null);
      setFlashShowingOperation(null);
      setTimeout(() => flashInputRef.current?.focus(), 100);
      return;
    }
    
    setFlashCurrentIndex(index);
    setFlashShowingNumber(numbers[index]);
    setFlashShowingOperation(operations[index]);
    
    // Tốc độ CỐ ĐỊNH - dùng giá trị trung bình của range
    const speed = (config.speed[0] + config.speed[1]) / 2;
    
    // Chuyển trực tiếp sang số tiếp theo không cần set null để tránh nhấp nháy
    flashTimeoutRef.current = setTimeout(() => {
      showFlashNumber(index + 1, numbers, operations, config);
    }, speed * 1000);
  };
  
  // Xử lý submit đáp án Flash Anzan
  const handleFlashSubmit = async () => {
    const userAnswer = parseInt(flashAnswer, 10);
    if (isNaN(userAnswer)) return;
    
    const isCorrect = userAnswer === flashCorrectAnswer;
    const config = flashLevels.find(l => l.id === flashLevel);
    const starsEarned = isCorrect ? (config?.stars || 2) : 0;
    
    // Lưu lời khen/động viên ngẫu nhiên VÀO STATE để không thay đổi khi re-render
    if (isCorrect) {
      const randomIndex = Math.floor(Math.random() * praiseMessages.length);
      setFlashResultMessage(praiseMessages[randomIndex]);
    } else {
      const randomIndex = Math.floor(Math.random() * encourageMessages.length);
      setFlashResultMessage(encourageMessages[randomIndex]);
    }
    
    setFlashPhase('result');
    setResult(isCorrect);
    
    // Cập nhật stats
    const newStreak = isCorrect ? streak + 1 : 0;
    if (newStreak > maxStreak) setMaxStreak(newStreak);
    setStreak(newStreak);
    
    // 🔊 Play combo sound when streak reaches milestones (3, 5, 7, 10)
    if ([3, 5, 7, 10].includes(newStreak)) {
      play('combo');
    }
    
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
        // 🔊 Play combo sound when streak milestone reached
        play('combo');
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

    // 🚀 TỐI ƯU: Lưu vào pending thay vì POST ngay
    // Trước: 10-50 POST requests/màn | Sau: 1 POST request/màn (gửi cuối game)
    pendingResultsRef.current.push({
      exerciseType: mode,
      difficulty,
      problem: problem.displayProblem,
      userAnswer: value.toString(),
      correctAnswer: problem.answer.toString(),
      isCorrect,
      timeTaken
    });

    // 🚀 OPTIMISTIC UPDATE: Cập nhật stars ngay (KHÔNG fetch server)
    if (isCorrect && instantStars > 0) {
      window.dispatchEvent(new CustomEvent('user-stats-updated', {
        detail: {
          stars: instantStars,
          diamonds: 0
        }
      }));
    }
  };

  // 🚀 TỐI ƯU: Gửi batch results khi game kết thúc
  // Trước: 10-50 POST requests/màn | Sau: 1 POST request/màn
  const submitBatchResults = async () => {
    const results = pendingResultsRef.current;
    if (results.length === 0) return;
    
    try {
      await fetch('/api/exercises/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results })
      });
      // Clear pending sau khi gửi thành công
      pendingResultsRef.current = [];
    } catch (error) {
      console.error('Batch submit error:', error);
      // Fallback: gửi từng cái nếu batch fail
      for (const result of results) {
        try {
          await fetch('/api/exercises', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
          });
        } catch (e) {
          console.error('Single submit error:', e);
        }
      }
      pendingResultsRef.current = [];
    }
  };

  const goToNextChallenge = () => {
    if (currentChallenge >= TOTAL_CHALLENGES) {
      // Hoàn thành màn chơi
      setGameComplete(true);
      
      // 🚀 TỐI ƯU: Gửi batch results khi game kết thúc
      submitBatchResults();
      
      // 🚀 TỐI ƯU: Invalidate adventure cache khi hoàn thành practice
      sessionStorage.removeItem('adventureProgress');
      
      // Trigger milestone celebration cho free users với hiệu suất tốt
      if (userTier === 'free' && sessionStats.correct >= 7) {
        setTimeout(() => {
          setMilestoneData({
            type: 'session',
            message: 'Bạn làm rất tốt! 🎉',
            starsEarned: sessionStats.correct * 2
          });
          setShowMilestoneCelebration(true);
        }, 2000);
      }
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
            
            {/* Difficulty selector - Pill shaped */}
            <div 
              className="bg-white/5 backdrop-blur-md border border-white/10 flex-shrink-0 shadow-xl"
              style={{ 
                padding: 'clamp(8px, 1.5vh, 20px)', 
                marginBottom: 'clamp(8px, 1.5vh, 20px)',
                borderRadius: 'clamp(16px, 3vh, 40px)'
              }}
            >
              <div className="flex justify-center flex-wrap" style={{ gap: 'clamp(6px, 1vh, 14px)' }}>
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
                    className={`relative font-bold transition-all transform hover:scale-110 active:scale-95 flex items-center ${
                      difficulty === item.level
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg ring-2 ring-white/50`
                        : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                    }`}
                    style={{
                      padding: 'clamp(6px, 1vh, 14px) clamp(12px, 2vw, 24px)',
                      borderRadius: 'clamp(20px, 4vh, 50px)',
                      gap: 'clamp(4px, 0.8vh, 10px)'
                    }}
                  >
                    <span style={{ fontSize: 'clamp(18px, 3.5vh, 38px)' }}>{item.emoji}</span>
                    <span 
                      className="font-bold hidden sm:inline"
                      style={{ fontSize: 'clamp(10px, 1.5vh, 16px)' }}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section title */}
            <div 
              className="text-center flex-shrink-0"
              style={{ marginBottom: 'clamp(8px, 1.5vh, 20px)' }}
            >
              <h3 
                className="font-black text-white/90 flex items-center justify-center"
                style={{ fontSize: 'clamp(12px, 2vh, 20px)', gap: 'clamp(6px, 1vh, 12px)' }}
              >
                <span>🧮</span> Chọn Phép Tính <span>🎯</span>
              </h3>
            </div>

            {/* Sub-mode grid - Responsive cards */}
            <div 
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              style={{ 
                gap: 'clamp(6px, 1.2vmin, 16px)',
                paddingBottom: 'clamp(20px, 5vh, 60px)'
              }}
            >
              {mentalSubModes.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => startMentalMode(item.id)}
                  className={`bg-gradient-to-br ${item.color} text-white flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.05] active:scale-95 transition-all duration-300 ${
                    item.id === 'mixed' ? 'col-span-2 sm:col-span-1 animate-pulse ring-2 ring-yellow-400/50' : ''
                  }`}
                  style={{
                    borderRadius: 'clamp(16px, 3vh, 40px)',
                    padding: 'clamp(8px, 1.5vh, 20px)',
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
                    style={{ fontSize: 'clamp(36px, 9vh, 80px)', marginBottom: 'clamp(4px, 1vh, 12px)' }}
                  >
                    {item.icon}
                  </div>
                  
                  {/* Title */}
                  <div 
                    className="font-black z-10 text-center leading-tight drop-shadow-lg"
                    style={{ fontSize: 'clamp(12px, 2.5vh, 24px)' }}
                  >
                    {item.title}
                  </div>
                  
                  {/* Special badge for mixed */}
                  {item.id === 'mixed' && (
                    <div 
                      className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 font-black rounded-full animate-bounce"
                      style={{ 
                        fontSize: 'clamp(7px, 1.2vh, 12px)',
                        padding: 'clamp(2px, 0.5vh, 8px) clamp(6px, 1vh, 12px)'
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
      </div>
    );
  }

  // ================== FLASH ANZAN SCREENS ==================

  // Màn hình chọn mode Flash Anzan - STEPS: digits -> operation -> speed
  if (mode === 'flashAnzan' && !flashLevel) {
    // Xác định tiêu đề và mô tả theo bước
    const stepTitles = {
      digits: { title: 'CHỌN SỐ CHỮ SỐ', subtitle: 'Chọn độ khó của các số', icon: '🔢' },
      operation: { title: 'CHỌN PHÉP TOÁN', subtitle: 'Chọn loại phép tính', icon: '➕' },
      speed: { title: 'CHỌN TỐC ĐỘ', subtitle: 'Càng nhanh → Càng khó → Càng nhiều thưởng!', icon: '⚡' }
    };
    const currentStep = stepTitles[flashModeStep] || stepTitles.digits;

    // Xử lý nút Back
    const handleBack = () => {
      if (flashModeStep === 'digits') {
        setMode(null);
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
              onClick={handleBack}
              className="flex items-center bg-black/30 rounded-lg text-white hover:bg-black/50 hover:scale-105 transition-all backdrop-blur"
              style={{ padding: 'clamp(6px, 1vh, 12px)' }}
            >
              <ArrowLeft style={{ width: 'clamp(16px, 2.5vh, 24px)', height: 'clamp(16px, 2.5vh, 24px)' }} />
            </button>
            <div className="text-center">
              <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 leading-relaxed">
                <span className="text-2xl animate-pulse">⚡</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-cyan-200 whitespace-nowrap">
                  TỐC ĐỘ ÁNH SÁNG
                </span>
                <span className="text-2xl animate-pulse">💫</span>
              </h1>
              <p className="text-white/80 text-[10px]">Từ Ánh Nến đến Siêu Big Bang!</p>
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
            {flashLevels.map((level, index) => {
              const isLocked = false; // Logic khóa nếu cần
              const isLastLevel = index === flashLevels.length - 1;
              
              return (
                <button
                  key={level.id}
                  onClick={() => {
                    if (isLocked) return;
                    setCurrentChallenge(1);
                    setChallengeResults([]);
                    setGameComplete(false);
                    startFlashAnzan(level.id);
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
                  
                  {/* Boss badge for last level */}
                  {isLastLevel && (
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
                  {level.bonusMultiplier > 1 && (
                    <div className={`relative z-10 mt-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-[9px] text-white font-black shadow ${index >= 3 ? 'animate-pulse' : ''}`}>
                      🔥 x{level.bonusMultiplier} BONUS
                    </div>
                  )}
                  
                  {/* Tagline for harder levels */}
                  {index >= 3 && (
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
      </div>
    );
  }

  // Màn hình chơi Flash Anzan - FULLY RESPONSIVE
  if (mode === 'flashAnzan' && flashLevel && !gameComplete) {
    const config = flashLevels.find(l => l.id === flashLevel);
    const levelIndex = flashLevels.findIndex(l => l.id === flashLevel);
    const levelLabels = ['Tập Sự', 'Chiến Binh', 'Dũng Sĩ', 'Huyền Thoại', 'THẦN'];
    const avgSpeed = ((config?.speed[0] + config?.speed[1]) / 2).toFixed(1);
    
    // Lời khen ngẫu nhiên khi đúng
    // Praise/Encourage messages đã được lưu vào state flashResultMessage trong handleFlashSubmit
    
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
                  setFlashLevel(null);
                  setFlashPhase('idle');
                  handleBack();
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
                  {currentChallenge}/{TOTAL_CHALLENGES}
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
              {[...Array(TOTAL_CHALLENGES)].map((_, i) => {
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
                      className={`font-black text-transparent bg-clip-text animate-zoom-in drop-shadow-2xl ${
                        // Điều chỉnh font size theo độ dài của số (bao gồm cả dấu trừ nếu có)
                        (() => {
                          const displayText = `${flashShowingOperation}${flashShowingNumber}`;
                          const length = displayText.length;
                          if (length <= 2) return 'text-6xl sm:text-8xl md:text-9xl lg:text-[10rem]';
                          if (length === 3) return 'text-5xl sm:text-7xl md:text-8xl lg:text-[8rem]';
                          if (length === 4) return 'text-4xl sm:text-6xl md:text-7xl lg:text-[6rem]';
                          return 'text-3xl sm:text-5xl md:text-6xl lg:text-[5rem]';
                        })()
                      } ${
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
                    readOnly
                    className="w-full text-5xl sm:text-6xl font-black text-center py-4 sm:py-5 bg-transparent text-yellow-400 placeholder-white/20 outline-none caret-yellow-400 sm:caret-yellow-400"
                  />
                </div>
              </div>
              
              {/* 🔧 Numpad for Mobile - Hidden on Desktop (sm:hidden) */}
              <div className="grid grid-cols-3 gap-1.5 mb-2 sm:hidden">
                {[1,2,3,4,5,6,7,8,9].map((num) => (
                  <button
                    key={num}
                    onClick={() => setFlashAnswer(prev => prev + num)}
                    className="bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-xl p-3 text-white font-bold text-xl transition-all active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setFlashAnswer(prev => prev.slice(0, -1))}
                  className="bg-red-500/70 hover:bg-red-500 active:bg-red-600 rounded-xl p-3 text-white font-bold text-base transition-all active:scale-95"
                >
                  ⌫
                </button>
                <button
                  onClick={() => setFlashAnswer(prev => prev + '0')}
                  className="bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-xl p-3 text-white font-bold text-xl transition-all active:scale-95"
                >
                  0
                </button>
                <button
                  onClick={() => {
                    if (flashAnswer) handleFlashSubmit();
                  }}
                  disabled={!flashAnswer}
                  className="bg-green-500 hover:bg-green-600 active:bg-green-700 rounded-xl p-3 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  Enter
                </button>
              </div>
              
              {/* Submit button - Epic - Hidden on Mobile when numpad shown */}
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
                    {currentChallenge >= TOTAL_CHALLENGES ? '🏆 XEM KẾT QUẢ' : '⚡ CÂU TIẾP THEO'}
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
                    {currentChallenge >= TOTAL_CHALLENGES ? '🏆 XEM KẾT QUẢ' : '💪 CÂU TIẾP THEO'}
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
      </div>
    );
  }

  // Game Complete Screen cho Flash Anzan - ULTRA EPIC VICTORY SCREEN
  if (mode === 'flashAnzan' && gameComplete) {
    const config = flashLevels.find(l => l.id === flashLevel);
    const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
    const avgTime = sessionStats.total > 0 ? Math.round(sessionStats.totalTime / sessionStats.total) : 0;
    
    // Grading system - More detailed
    const getGrade = (acc) => {
      if (acc >= 100) return { grade: 'S+', color: 'from-rose-400 via-pink-500 to-purple-500', emoji: '💎', text: 'HUYỀN THOẠI!', msg: 'Hoàn hảo 100%! Bạn là thiên tài!', stars: 5 };
      if (acc >= 90) return { grade: 'S', color: 'from-yellow-400 to-amber-500', emoji: '👑', text: 'XUẤT SẮC!', msg: 'Bạn thật tuyệt vời! Gần như hoàn hảo!', stars: 4 };
      if (acc >= 80) return { grade: 'A', color: 'from-green-400 to-emerald-500', emoji: '🌟', text: 'GIỎI LẮM!', msg: 'Bạn làm rất tốt! Cố thêm chút nữa!', stars: 3 };
      if (acc >= 70) return { grade: 'B+', color: 'from-cyan-400 to-blue-500', emoji: '✨', text: 'KHÁ GIỎI!', msg: 'Tiến bộ rõ rệt! Tiếp tục luyện tập!', stars: 3 };
      if (acc >= 60) return { grade: 'B', color: 'from-blue-400 to-indigo-500', emoji: '⭐', text: 'KHÁ TỐT!', msg: 'Bạn đang tiến bộ! Cố gắng thêm nhé!', stars: 2 };
      if (acc >= 50) return { grade: 'C', color: 'from-purple-400 to-violet-500', emoji: '💪', text: 'CỐ GẮNG!', msg: 'Đừng nản lòng! Mỗi lần thử là một bước tiến!', stars: 2 };
      return { grade: 'D', color: 'from-gray-400 to-gray-500', emoji: '🎯', text: 'LUYỆN TẬP!', msg: 'Thử lại nhé! Mỗi lần sai là một bài học!', stars: 1 };
    };
    
    const gradeInfo = getGrade(accuracy);
    
    // Performance badges
    const badges = [];
    if (accuracy === 100) badges.push({ icon: '💯', label: 'PERFECT', color: 'from-pink-500 to-rose-500' });
    if (maxStreak >= 10) badges.push({ icon: '🔥', label: 'ON FIRE', color: 'from-orange-500 to-red-500' });
    else if (maxStreak >= 5) badges.push({ icon: '🔥', label: 'HOT STREAK', color: 'from-yellow-500 to-orange-500' });
    if (accuracy >= 90 && avgTime <= 5) badges.push({ icon: '⚡', label: 'SPEED DEMON', color: 'from-cyan-400 to-blue-500' });
    if (sessionStats.stars >= 30) badges.push({ icon: '⭐', label: 'STAR COLLECTOR', color: 'from-yellow-400 to-amber-500' });
    
    return (
      <div className="min-h-[100dvh] h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-[2vmin] relative overflow-auto">
        {/* Epic Victory particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                fontSize: 'clamp(12px, 2vmin, 24px)',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['⭐', '🌟', '✨'][Math.floor(Math.random() * 3)]}
            </div>
          ))}
        </div>
        
        {/* Glow effects */}
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[30vmin] h-[30vmin] bg-gradient-to-r ${gradeInfo.color} rounded-full blur-3xl opacity-20`}></div>

        {/* Main content wrapper - scales with viewport */}
        <div className="relative z-10 w-full max-w-[min(95vw,500px)] min-w-[280px]">
          
          {/* Level completed badge */}
          <div className="text-center mb-[1vmin]">
            <div 
              className={`inline-block px-[2vmin] py-[0.5vmin] rounded-full bg-gradient-to-r ${config?.color || 'from-yellow-500 to-orange-500'} text-white font-bold shadow-lg`}
              style={{ fontSize: 'clamp(10px, 1.5vmin, 14px)' }}
            >
              {config?.emoji} {config?.name}
            </div>
          </div>

          {/* Giant Grade badge */}
          <div className="text-center mb-[1.5vmin]">
            <div className="inline-block relative">
              {/* Main emoji */}
              <div 
                className="relative filter drop-shadow-xl"
                style={{ fontSize: 'clamp(48px, 12vmin, 120px)' }}
              >
                {gradeInfo.emoji}
              </div>
              
              {/* Grade letter */}
              <div 
                className={`absolute -bottom-[1vmin] left-1/2 transform -translate-x-1/2 font-black bg-gradient-to-r ${gradeInfo.color} bg-clip-text text-transparent`}
                style={{ fontSize: 'clamp(32px, 8vmin, 80px)' }}
              >
                {gradeInfo.grade}
              </div>
            </div>
          </div>

          {/* Main card */}
          <div 
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2vmin] text-center shadow-2xl"
            style={{ padding: 'clamp(12px, 3vmin, 28px)' }}
          >
            {/* Title */}
            <h1 
              className="font-black text-white leading-relaxed"
              style={{ fontSize: 'clamp(18px, 4vmin, 36px)', marginBottom: '0.5vmin' }}
            >
              🏆 HOÀN THÀNH!
            </h1>
            
            {/* Grade text */}
            <div 
              className={`font-black bg-gradient-to-r ${gradeInfo.color} bg-clip-text text-transparent leading-relaxed`}
              style={{ fontSize: 'clamp(16px, 3.5vmin, 32px)' }}
            >
              {gradeInfo.text}
            </div>
            <p 
              className="text-white/70"
              style={{ fontSize: 'clamp(10px, 1.8vmin, 16px)', marginBottom: 'clamp(8px, 2vmin, 20px)' }}
            >
              {gradeInfo.msg}
            </p>
            
            {/* Performance badges */}
            {badges.length > 0 && (
              <div className="flex justify-center flex-wrap mb-[2vmin]" style={{ gap: 'clamp(4px, 1vmin, 10px)' }}>
                {badges.map((badge, i) => (
                  <div 
                    key={i} 
                    className={`bg-gradient-to-r ${badge.color} rounded-full text-white font-bold flex items-center shadow`}
                    style={{ 
                      fontSize: 'clamp(8px, 1.3vmin, 12px)',
                      padding: 'clamp(2px, 0.5vmin, 6px) clamp(6px, 1.5vmin, 14px)'
                    }}
                  >
                    <span>{badge.icon}</span> {badge.label}
                  </div>
                ))}
              </div>
            )}
            
            {/* Stats grid */}
            <div className="grid grid-cols-4 mb-[2vmin]" style={{ gap: 'clamp(4px, 1vmin, 12px)' }}>
              {[
                { icon: '⭐', value: sessionStats.stars, label: 'Sao', color: 'yellow' },
                { icon: '✅', value: sessionStats.correct, label: 'Đúng', color: 'green' },
                { icon: '❌', value: sessionStats.total - sessionStats.correct, label: 'Sai', color: 'red' },
                { icon: '🔥', value: maxStreak, label: 'Combo', color: 'orange' }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className={`bg-${stat.color}-500/20 border border-${stat.color}-400/30 rounded-[1vmin]`}
                  style={{ padding: 'clamp(6px, 1.5vmin, 16px)' }}
                >
                  <div style={{ fontSize: 'clamp(14px, 2.5vmin, 28px)' }}>{stat.icon}</div>
                  <div 
                    className={`font-black text-${stat.color}-400`}
                    style={{ fontSize: 'clamp(14px, 2.5vmin, 28px)' }}
                  >
                    {stat.value}
                  </div>
                  <div 
                    className="text-white/50"
                    style={{ fontSize: 'clamp(7px, 1.2vmin, 12px)' }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Accuracy meter */}
            <div style={{ marginBottom: 'clamp(8px, 2vmin, 20px)' }}>
              <div className="flex justify-between text-white/60" style={{ fontSize: 'clamp(9px, 1.5vmin, 14px)', marginBottom: 'clamp(2px, 0.5vmin, 6px)' }}>
                <span>🎯 Độ chính xác</span>
                <span className={`font-black bg-gradient-to-r ${gradeInfo.color} bg-clip-text text-transparent`} style={{ fontSize: 'clamp(12px, 2vmin, 20px)' }}>
                  {accuracy}%
                </span>
              </div>
              <div 
                className="bg-white/10 rounded-full overflow-hidden relative"
                style={{ height: 'clamp(8px, 1.5vmin, 16px)' }}
              >
                <div 
                  className={`h-full bg-gradient-to-r ${gradeInfo.color} transition-all duration-1000`}
                  style={{ width: `${accuracy}%` }}
                />
                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/20"></div>
              </div>
            </div>
            
            {/* Challenge results */}
            <div style={{ marginBottom: 'clamp(8px, 2vmin, 20px)' }}>
              <div className="text-white/60" style={{ fontSize: 'clamp(8px, 1.3vmin, 12px)', marginBottom: 'clamp(4px, 0.8vmin, 10px)' }}>
                📊 Kết quả từng câu:
              </div>
              <div className="flex justify-center flex-wrap" style={{ gap: 'clamp(2px, 0.5vmin, 6px)' }}>
                {challengeResults.map((result, i) => (
                  <div 
                    key={i} 
                    className={`rounded flex items-center justify-center font-bold ${
                      result === 'correct' 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' 
                        : 'bg-gradient-to-br from-red-400 to-red-500 text-white'
                    }`}
                    style={{ 
                      width: 'clamp(20px, 4vmin, 36px)', 
                      height: 'clamp(20px, 4vmin, 36px)',
                      fontSize: 'clamp(10px, 1.8vmin, 16px)'
                    }}
                  >
                    {result === 'correct' ? '✓' : '✗'}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Rating stars */}
            <div style={{ marginBottom: 'clamp(8px, 2vmin, 20px)' }}>
              <div className="flex justify-center" style={{ gap: 'clamp(2px, 0.5vmin, 8px)' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    className={star <= gradeInfo.stars ? 'text-yellow-400' : 'text-white/20'}
                    style={{ fontSize: 'clamp(16px, 3vmin, 32px)' }}
                  >
                    {star <= gradeInfo.stars ? '⭐' : '☆'}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Thông báo điều kiện qua màn - chỉ hiện khi từ Adventure */}
            {gameMode?.from === 'adventure' && (
              <div 
                className={`rounded-[1vmin] text-center font-medium ${accuracy >= 70 ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'}`}
                style={{ padding: 'clamp(6px, 1vmin, 12px)', marginBottom: 'clamp(8px, 1.5vmin, 16px)', fontSize: 'clamp(10px, 1.5vmin, 14px)' }}
              >
                {accuracy >= 70 ? (
                  <span>✅ Đã qua màn! Cần ≥70% để mở khóa màn tiếp theo</span>
                ) : (
                  <span>⚠️ Chưa đạt! Cần ≥70% để qua màn (hiện tại: {accuracy}%)</span>
                )}
              </div>
            )}
            
            {/* Action buttons - khác nhau tùy từ Adventure hay Menu */}
            {gameMode?.from === 'adventure' ? (
              /* Từ Adventure: chỉ có nút Về Map */
              <button
                onClick={() => handleBackToGame(accuracy >= 70)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-[1.5vmin] hover:brightness-110 active:scale-95 transition-all shadow-lg"
                style={{ 
                  padding: 'clamp(10px, 2.5vmin, 20px)',
                  fontSize: 'clamp(12px, 2vmin, 18px)'
                }}
              >
                🎮 Về Map Phiêu Lưu
              </button>
            ) : (
              /* Từ Menu: có đầy đủ các nút */
              <>
                <div className="flex" style={{ gap: 'clamp(6px, 1.5vmin, 16px)' }}>
                  <button
                    onClick={restartFlashGame}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-[1.5vmin] hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center"
                    style={{ 
                      padding: 'clamp(8px, 2vmin, 16px) clamp(12px, 2vmin, 20px)',
                      fontSize: 'clamp(12px, 2vmin, 18px)',
                      gap: 'clamp(4px, 1vmin, 10px)'
                    }}
                  >
                    <RotateCcw style={{ width: 'clamp(14px, 2.5vmin, 22px)', height: 'clamp(14px, 2.5vmin, 22px)' }} /> Chơi lại
                  </button>
                  <button
                    onClick={() => {
                      setFlashLevel(null);
                      setFlashPhase('idle');
                      setGameComplete(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-[1.5vmin] hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center"
                    style={{ 
                      padding: 'clamp(8px, 2vmin, 16px) clamp(12px, 2vmin, 20px)',
                      fontSize: 'clamp(12px, 2vmin, 18px)',
                      gap: 'clamp(4px, 1vmin, 10px)'
                    }}
                  >
                    📋 Đổi cấp
                  </button>
                </div>
                
                {/* Next level suggestion */}
                {accuracy >= 70 && flashLevel !== 'bigBang' && (
                  <div 
                    className="bg-purple-500/20 border border-purple-400/30 rounded-[1vmin]"
                    style={{ marginTop: 'clamp(8px, 1.5vmin, 16px)', padding: 'clamp(6px, 1vmin, 12px)' }}
                  >
                    <p className="text-purple-300 font-medium text-center" style={{ fontSize: 'clamp(9px, 1.5vmin, 14px)' }}>
                      🚀 Sẵn sàng thử thách cao hơn? 🚀
                    </p>
                  </div>
                )}
                
                {/* Home button */}
                <div className="text-center" style={{ marginTop: 'clamp(8px, 2vmin, 20px)' }}>
                  <button
                    onClick={handleBack}
                    className="bg-white/10 border border-white/20 text-white font-medium rounded-[1vmin] hover:bg-white/20 transition-all"
                    style={{
                      padding: 'clamp(6px, 1.2vmin, 12px) clamp(12px, 2.5vmin, 28px)',
                      fontSize: 'clamp(11px, 1.8vmin, 16px)'
                    }}
                  >
                    🏠 Về trang luyện tập
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Padding bottom for safe area */}
        <div style={{ paddingBottom: 'clamp(8px, 2vmin, 20px)' }}></div>
      </div>
    );
  }

  // Mode selection screen - EPIC GAMING with dynamic shapes and animations
  if (!mode) {
    const difficultyLevels = [
      { level: 1, label: 'Tập Sự', emoji: '🐣', color: 'from-green-400 to-emerald-500', desc: 'Số 1 chữ số' },
      { level: 2, label: 'Chiến Binh', emoji: '⚔️', color: 'from-blue-400 to-cyan-500', desc: 'Số 2 chữ số' },
      { level: 3, label: 'Dũng Sĩ', emoji: '🛡️', color: 'from-yellow-400 to-orange-500', desc: 'Số 3 chữ số' },
      { level: 4, label: 'Cao Thủ', emoji: '🔥', color: 'from-orange-400 to-red-500', desc: 'Số 4 chữ số' },
      { level: 5, label: 'Huyền Thoại', emoji: '👑', color: 'from-purple-400 to-pink-500', desc: 'Số 5 chữ số' }
    ];
    
    const gameModes = [
      { mode: 'addition', title: 'Siêu Cộng', icon: '🌟', symbol: '+', color: 'from-emerald-400 via-green-500 to-teal-500', desc: 'Gom sao!', tier: 'free' },
      { mode: 'subtraction', title: 'Siêu Trừ', icon: '👾', symbol: '-', color: 'from-blue-400 via-cyan-500 to-sky-500', desc: 'Diệt quái!', tier: 'free' },
      { mode: 'addSubMixed', title: 'Cộng Trừ Mix', icon: '⚔️', symbol: '±', color: 'from-teal-400 via-emerald-500 to-green-500', desc: 'Hỗn chiến!', tier: 'basic' },
      { mode: 'multiplication', title: 'Siêu Nhân', icon: '✨', symbol: '×', color: 'from-purple-400 via-pink-500 to-rose-500', desc: 'Nhân bội!', tier: 'advanced' },
      { mode: 'division', title: 'Siêu Chia', icon: '🍕', symbol: '÷', color: 'from-rose-400 via-red-500 to-orange-500', desc: 'Chia đều!', tier: 'advanced' },
      { mode: 'mulDiv', title: 'Nhân Chia Mix', icon: '🎩', symbol: '×÷', color: 'from-amber-400 via-orange-500 to-yellow-500', desc: 'Phép thuật!', tier: 'advanced' },
      { mode: 'mixed', title: 'Tứ Phép Thần', icon: '👑', symbol: '∞', color: 'from-indigo-500 via-purple-600 to-violet-600', desc: 'Boss cuối!', tier: 'advanced' },
      { mode: 'mentalMath', title: 'Siêu Trí Tuệ', icon: '🧠', symbol: '💭', color: 'from-violet-500 via-fuchsia-600 to-pink-600', desc: 'Không bàn tính!', tier: 'advanced', special: true },
      { mode: 'flashAnzan', title: 'Tia Chớp', icon: '⚡', symbol: '💫', color: 'from-yellow-400 via-orange-500 to-red-500', desc: 'Flash Anzan!', tier: 'advanced', special: true },
    ];

    return (
      <div className="w-[100vw] min-h-[100dvh] bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex flex-col overflow-x-hidden relative">
        {/* Animated floating shapes background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating bubbles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={`bubble-${i}`}
              className="absolute rounded-full bg-gradient-to-br from-white/10 to-white/5 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `clamp(20px, ${3 + Math.random() * 5}vh, 80px)`,
                height: `clamp(20px, ${3 + Math.random() * 5}vh, 80px)`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            />
          ))}
          {/* Floating emojis */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`emoji-${i}`}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: 'clamp(12px, 2.5vh, 32px)',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                opacity: 0.4,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            >
              {['⭐', '✨', '💫', '🌟', '⚡', '🔥', '💎', '🎮'][Math.floor(Math.random() * 8)]}
            </div>
          ))}
          {/* Glowing orbs */}
          <div className="absolute top-1/4 left-1/4 w-[30vh] h-[30vh] bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[25vh] h-[25vh] bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-[20vh] h-[20vh] bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Header - Back trái, Logo phải */}
        <div
          className="relative z-10 flex-shrink-0"
          style={{ padding: 'clamp(6px, 1.2vh, 14px) clamp(10px, 2vw, 24px)' }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
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
              className="font-black text-white flex items-center bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-md border border-white/20 shadow-lg shadow-pink-500/20"
              style={{
                fontSize: 'clamp(13px, 2.8vh, 26px)',
                gap: 'clamp(6px, 1vw, 14px)',
                padding: 'clamp(6px, 1vh, 12px) clamp(12px, 2vw, 24px)',
                borderRadius: 'clamp(16px, 2.5vh, 32px)'
              }}
            >
              <span className="animate-bounce" style={{ fontSize: 'clamp(16px, 3.5vh, 34px)' }}>🎮</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 whitespace-nowrap">
                Luyện Tập
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

        {/* Main content */}
        <div 
          className="relative z-10 flex-1 flex flex-col overflow-y-auto" 
          style={{ padding: 'clamp(6px, 1.2vh, 18px) clamp(10px, 2.5vw, 24px)' }}
        >
          <div className="max-w-7xl mx-auto w-full flex flex-col">
            
            {/* Difficulty selector - Pill shaped buttons */}
            <div 
              className="bg-white/5 backdrop-blur-md border border-white/10 flex-shrink-0 shadow-xl"
              style={{ 
                padding: 'clamp(8px, 1.5vh, 20px)', 
                marginBottom: 'clamp(8px, 1.5vh, 20px)',
                borderRadius: 'clamp(16px, 3vh, 40px)'
              }}
            >
              <div className="flex justify-center flex-wrap" style={{ gap: 'clamp(6px, 1vh, 14px)' }}>
                {difficultyLevels.map(item => {
                  const maxDifficulty = userTier === 'free' ? 2 : userTier === 'basic' ? 3 : 5;
                  const isDifficultyLocked = item.level > maxDifficulty;
                  const isSelected = difficulty === item.level;
                  
                  return (
                    <button
                      key={item.level}
                      onClick={() => {
                        if (isDifficultyLocked) {
                          showUpgradeModal({
                            requiredTier: 'advanced',
                            feature: `Cấp độ ${item.label}`,
                            currentTier: userTier
                          });
                          return;
                        }
                        setDifficulty(item.level);
                      }}
                      className={`relative font-bold transition-all transform hover:scale-110 active:scale-95 flex items-center ${
                        isSelected
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.color.split('-')[1]}-500/50 ring-2 ring-white/50`
                          : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                      }`}
                      style={{
                        padding: 'clamp(6px, 1vh, 14px) clamp(12px, 2vw, 24px)',
                        borderRadius: 'clamp(20px, 4vh, 50px)',
                        gap: 'clamp(4px, 0.8vh, 10px)'
                      }}
                    >
                      {isDifficultyLocked && (
                        <div 
                          className="absolute bg-black/70 rounded-full flex items-center justify-center z-20 border border-white/30"
                          style={{ 
                            top: '-5px', right: '-5px',
                            width: 'clamp(16px, 2.5vh, 24px)', 
                            height: 'clamp(16px, 2.5vh, 24px)',
                            fontSize: 'clamp(8px, 1.2vh, 12px)'
                          }}
                        >
                          🔒
                        </div>
                      )}
                      <span 
                        className={isDifficultyLocked ? 'opacity-50' : ''}
                        style={{ fontSize: 'clamp(18px, 3.5vh, 38px)' }}
                      >
                        {item.emoji}
                      </span>
                      <span 
                        className={`font-bold hidden sm:inline ${isDifficultyLocked ? 'opacity-50' : ''}`}
                        style={{ fontSize: 'clamp(10px, 1.5vh, 16px)' }}
                      >
                        {isDifficultyLocked ? '???' : item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode grid - Responsive cards */}
            <div 
              className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5"
              style={{ 
                gap: 'clamp(6px, 1.2vmin, 16px)',
                paddingBottom: 'clamp(20px, 5vh, 60px)'
              }}
            >
              {gameModes.map((item, index) => {
                const tierLevels = { free: 0, basic: 1, advanced: 2, vip: 3 };
                const userTierLevel = tierLevels[userTier] || 0;
                const requiredTierLevel = tierLevels[item.tier] || 0;
                const isLocked = userTierLevel < requiredTierLevel;
                const maxDifficulty = userTier === 'free' ? 2 : userTier === 'basic' ? 3 : 5;
                const isDifficultyLocked = difficulty > maxDifficulty && !isLocked;
                
                return (
                  <button
                    key={item.mode}
                    onClick={() => {
                      if (isLocked) {
                        showUpgradeModal({
                          requiredTier: 'advanced',
                          feature: item.title,
                          currentTier: userTier
                        });
                        return;
                      }
                      if (isDifficultyLocked) {
                        showUpgradeModal({
                          requiredTier: 'advanced',
                          feature: `Cấp độ ${difficulty}`,
                          currentTier: userTier
                        });
                        return;
                      }
                      startMode(item.mode);
                    }}
                    className={`bg-gradient-to-br ${item.color} text-white flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.05] active:scale-95 transition-all duration-300 ${
                      item.special ? 'ring-2 ring-yellow-400/70 special-glow' : ''
                    }`}
                    style={{
                      borderRadius: 'clamp(16px, 3vh, 40px)',
                      padding: 'clamp(8px, 1.5vh, 20px)',
                      boxShadow: item.special 
                        ? `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 20px rgba(255,200,50,0.4)` 
                        : `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`
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
                    
                    {/* Lock icon */}
                    {isLocked && (
                      <div 
                        className="absolute bg-black/60 backdrop-blur rounded-full flex items-center justify-center z-20 border-2 border-white/30"
                        style={{ 
                          top: 'clamp(6px, 1vh, 14px)', 
                          left: 'clamp(6px, 1vh, 14px)',
                          width: 'clamp(20px, 3.5vh, 36px)', 
                          height: 'clamp(20px, 3.5vh, 36px)',
                          fontSize: 'clamp(10px, 1.8vh, 18px)'
                        }}
                      >
                        🔒
                      </div>
                    )}
                    
                    {/* Symbol badge - floating */}
                    <div 
                      className="absolute bg-white/20 backdrop-blur rounded-full flex items-center justify-center font-black border border-white/30 group-hover:scale-110 transition-transform"
                      style={{ 
                        top: 'clamp(6px, 1vh, 14px)', 
                        right: 'clamp(6px, 1vh, 14px)',
                        width: 'clamp(24px, 4vh, 44px)', 
                        height: 'clamp(24px, 4vh, 44px)',
                        fontSize: 'clamp(10px, 1.8vh, 18px)'
                      }}
                    >
                      {item.symbol}
                    </div>
                    
                    {/* Icon with bounce */}
                    <div 
                      className="drop-shadow-2xl z-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300"
                      style={{ fontSize: 'clamp(32px, 8vh, 72px)', marginBottom: 'clamp(4px, 1vh, 12px)' }}
                    >
                      {item.icon}
                    </div>
                    
                    {/* Title with gradient text */}
                    <div 
                      className="font-black z-10 text-center leading-tight drop-shadow-lg"
                      style={{ fontSize: 'clamp(11px, 2.2vh, 22px)' }}
                    >
                      {item.title}
                    </div>
                    
                    {/* Desc */}
                    <div 
                      className="z-10 text-center font-medium opacity-90"
                      style={{ fontSize: 'clamp(8px, 1.5vh, 14px)', marginTop: 'clamp(2px, 0.5vh, 6px)' }}
                    >
                      {item.desc}
                    </div>
                    
                    {/* Special badge */}
                    {item.special && !isLocked && (
                      <div 
                        className="absolute bottom-1 right-1 bg-yellow-400 text-yellow-900 font-black rounded-full animate-bounce"
                        style={{ 
                          fontSize: 'clamp(6px, 1vh, 10px)',
                          padding: 'clamp(2px, 0.4vh, 6px) clamp(4px, 0.8vh, 10px)'
                        }}
                      >
                        HOT
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* CSS for shine animation and special glow */}
        <style jsx>{`
          @keyframes shine {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(200%) rotate(45deg); }
          }
          @keyframes special-pulse {
            0%, 100% { 
              box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 20px rgba(255,200,50,0.4);
              filter: brightness(1);
            }
            50% { 
              box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 35px rgba(255,200,50,0.6);
              filter: brightness(1.15);
            }
          }
          :global(.special-glow) {
            animation: special-pulse 2s ease-in-out infinite;
          }
        `}</style>
        
        {/* Modal nâng cấp tinh tế */}
        <UpgradeModalComponent />
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
          
          {/* Buttons */}
          <div className="space-y-2">
            {/* Từ Adventure: chỉ có nút Về Map */}
            {gameMode?.from === 'adventure' ? (
              <button
                onClick={() => handleBackToGame(accuracy >= 70)}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:scale-105 transition-transform text-sm sm:text-base"
              >
                🎮 Về Map Phiêu Lưu
              </button>
            ) : (
              /* Từ Menu: có đầy đủ các nút */
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={restartGame}
                  className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-transform text-sm sm:text-base"
                >
                  🔄 Chơi lại
                </button>
                <button
                  onClick={handleBack}
                  className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors text-sm sm:text-base"
                >
                  📋 Chọn mode
                </button>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <p className="text-white/40 text-[10px] sm:text-xs text-center mt-4">
            © 2025 SoroKid - Học toán tư duy cùng bàn tính Soroban
          </p>
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
          {/* Left: Back */}
          <button
            onClick={() => {
              // 🎮 GAME MODE: Nếu từ adventure, quay về adventure
              if (gameMode?.from === 'adventure') {
                handleBackToGame();
              } else if (isMentalMode) {
                setMentalSubMode(null); // Về màn chọn sub-mode
              } else {
                setMode(null); // Về màn chọn mode
              }
            }}
            className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors flex-shrink-0"
            title={gameMode?.from === 'adventure' ? 'Quay lại Game' : 'Quay lại'}
          >
            <ArrowLeft size={16} />
          </button>
          
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
            // Input cho mode Siêu Trí Tuệ - ẩn bàn phím mặc định, dùng bàn phím ảo
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
        // Mental Math UI - numpad lớn hơn trên mobile
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="text-center w-full max-w-[340px] sm:max-w-[280px]">
            {/* Icon và tiêu đề - rất compact */}
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
      
      {/* Modal nâng cấp tinh tế */}
      <UpgradeModalComponent />
      
      {/* Soft upgrade trigger - chỉ hiện sau hoàn thành tốt */}
      {userTier === 'free' && showMilestoneCelebration && (
        <MilestoneCelebration 
          show={showMilestoneCelebration}
          onClose={() => setShowMilestoneCelebration(false)}
          milestoneType={milestoneData?.type || 'session'}
          message={milestoneData?.message}
          starsEarned={milestoneData?.starsEarned || 0}
        />
      )}
      
      {/* Footer - chỉ hiện ở màn chọn mode và kết quả */}
      {(!mode || gameComplete) && (
        <div className="fixed bottom-2 left-0 right-0 z-10 text-center pointer-events-none">
          <p className="text-white/30 text-[10px] sm:text-xs">
            © 2025 SoroKid - Học toán tư duy cùng bàn tính Soroban
          </p>
        </div>
      )}
    </div>
  );
}

// Export with Suspense wrapper for useSearchParams
export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    }>
      <PracticePageContent />
    </Suspense>
  );
}