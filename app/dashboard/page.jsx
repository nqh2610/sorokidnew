'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { Star, Zap, Trophy, ChevronRight, Play, Clock, ChevronDown, ChevronUp, Sparkles, Gift, Award, Loader2 } from 'lucide-react';
import LevelBadge from '@/components/LevelBadge/LevelBadge';
import TopBar from '@/components/TopBar/TopBar';
import ActivityChart from '@/components/Dashboard/ActivityChart';
import StatsCards from '@/components/Dashboard/StatsCards';
import QuestList from '@/components/Dashboard/QuestList';
import AchievementList from '@/components/Dashboard/AchievementList';
import ProgressByLevel from '@/components/Dashboard/ProgressByLevel';
import CertificateProgress from '@/components/Dashboard/CertificateProgress';
import RewardPopup, { useRewardPopup } from '@/components/RewardPopup/RewardPopup';
import TrialDaysBadge from '@/components/TrialDaysBadge/TrialDaysBadge';

/**
 * 🚀 PROGRESSIVE LOADING DASHBOARD
 * 
 * Phase 1: Load essential data (user, nextLesson, quickStats) - 3 queries, <200ms
 * Phase 2: Lazy load quests, achievements, certificates - on-demand
 * Phase 3: Load activity/stats khi user mở thống kê chi tiết
 * 
 * FALLBACK: Nếu API mới lỗi, fallback về API cũ
 */

// Skeleton components for loading states
const SectionSkeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-white rounded-2xl p-5 shadow-lg ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
    <div className="h-3 bg-gray-100 rounded w-2/3 mb-2"></div>
    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
  </div>
);

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // === PROGRESSIVE STATE ===
  // Phase 1: Essential (critical path)
  const [essential, setEssential] = useState(null);
  const [essentialLoading, setEssentialLoading] = useState(true);
  
  // Phase 2: Secondary data (lazy loaded)
  const [quests, setQuests] = useState(null);
  const [questsLoading, setQuestsLoading] = useState(false);
  const [achievements, setAchievements] = useState(null);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [certificates, setCertificates] = useState(null);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  
  // Phase 3: Activity (load on expand)
  const [activity, setActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  
  // Fallback: Old API data
  const [fallbackData, setFallbackData] = useState(null);
  const [useFallback, setUseFallback] = useState(false);
  
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  
  // Hook hiệu ứng nhận thưởng
  const { showReward, RewardPopupComponent } = useRewardPopup();

  // === PHASE 1: ESSENTIAL DATA (Critical Path) ===
  const fetchEssential = useCallback(async () => {
    try {
      setEssentialLoading(true);
      const response = await fetch('/api/dashboard/essential');
      const data = await response.json();
      
      if (data.success) {
        setEssential(data);
        // Trigger secondary loads sau khi essential done
        fetchSecondaryData();
      } else {
        throw new Error('Essential API failed');
      }
    } catch (error) {
      console.error('[Dashboard] Essential failed, using fallback:', error);
      // Fallback to old API
      fetchFallbackData();
    } finally {
      setEssentialLoading(false);
    }
  }, []);

  // === PHASE 2: SECONDARY DATA (Parallel, after essential) ===
  const fetchSecondaryData = useCallback(() => {
    // Load quests
    fetchQuests();
    // Load certificates (thường hay xem)
    fetchCertificates();
    // Achievements load sau 300ms để ưu tiên trên
    setTimeout(() => fetchAchievements(), 300);
  }, []);

  const fetchQuests = async () => {
    if (quests || questsLoading) return;
    try {
      setQuestsLoading(true);
      const response = await fetch('/api/dashboard/quests', {
        cache: 'no-store'
      });
      const data = await response.json();
      if (data.success) {
        setQuests(data);
      }
    } catch (error) {
      console.error('[Dashboard] Quests fetch error:', error);
    } finally {
      setQuestsLoading(false);
    }
  };

  const fetchCertificates = async () => {
    if (certificates || certificatesLoading) return;
    try {
      setCertificatesLoading(true);
      const response = await fetch('/api/dashboard/certificates');
      const data = await response.json();
      if (data.success) {
        setCertificates(data);
      }
    } catch (error) {
      console.error('[Dashboard] Certificates fetch error:', error);
    } finally {
      setCertificatesLoading(false);
    }
  };

  const fetchAchievements = async () => {
    if (achievements || achievementsLoading) return;
    try {
      setAchievementsLoading(true);
      const response = await fetch('/api/dashboard/achievements');
      const data = await response.json();
      if (data.success) {
        setAchievements(data);
      }
    } catch (error) {
      console.error('[Dashboard] Achievements fetch error:', error);
    } finally {
      setAchievementsLoading(false);
    }
  };

  // === PHASE 3: ACTIVITY (Load on expand) ===
  const fetchActivity = async () => {
    if (activity || activityLoading) return;
    try {
      setActivityLoading(true);
      const response = await fetch('/api/dashboard/activity');
      const data = await response.json();
      if (data.success) {
        setActivity(data);
      }
    } catch (error) {
      console.error('[Dashboard] Activity fetch error:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  // === FALLBACK: OLD API ===
  const fetchFallbackData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      if (data.success) {
        setFallbackData(data);
        setUseFallback(true);

        // 🔥 TỐI ƯU: Copy fallback data vào state chính
        // Để chỉ cần update 1 nơi khi claim reward
        if (data.quests) setQuests(data.quests);
        if (data.achievements) setAchievements(data.achievements);
        if (data.certificates) setCertificates({ earned: data.certificates?.earned, inProgress: data.certificates?.inProgress });
      }
    } catch (error) {
      console.error('[Dashboard] Fallback also failed:', error);
    }
  };

  // === EFFECTS ===
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchEssential();
    }
  }, [status, router, fetchEssential]);

  // Load activity when expanding stats - chỉ chạy 1 lần khi mở
  useEffect(() => {
    if (showDetailedStats && !activity && !activityLoading) {
      fetchActivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDetailedStats]); // Chỉ depend on showDetailedStats để tránh loop

  // === DATA HELPERS ===
  // Merge essential data với các phần đã load
  const user = useFallback ? fallbackData?.user : essential?.user;
  const nextLesson = useFallback ? fallbackData?.nextLesson : essential?.nextLesson;
  const quickStats = essential?.quickStats;
  
  // Secondary data - use fallback if progressive not loaded
  // QuestList cần quests.active và quests.completedCount
  const questsData = quests || (useFallback ? fallbackData?.quests : null);
  const certificatesData = certificates || (useFallback ? { earned: fallbackData?.certificates?.earned, inProgress: fallbackData?.certificates?.inProgress } : null);
  const achievementsData = achievements || (useFallback ? fallbackData?.achievements : null);
  
  // Activity - only from activity API or fallback
  const activityChart = activity?.activityChart || fallbackData?.activityChart;
  const progress = useFallback ? fallbackData?.progress : null;
  const exercise = useFallback ? fallbackData?.exercise : null;
  const compete = useFallback ? fallbackData?.compete : null;

  // Refresh all data
  const refreshData = useCallback(() => {
    setEssential(null);
    setQuests(null);
    setAchievements(null);
    setCertificates(null);
    setActivity(null);
    fetchEssential();
  }, [fetchEssential]);

  const handleClaimReward = async (questId) => {
    try {
      const response = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'quest', id: questId })
      });
      
      if (response.ok) {
        const data = await response.json();
        const rewardStars = data.reward?.stars || 0;
        const rewardDiamonds = data.reward?.diamonds || 0;
        
        // 🚀 OPTIMISTIC UPDATE: Cập nhật UI ngay lập tức
        if (essential?.user) {
          const newTotalStars = (essential.user.totalStars || 0) + rewardStars;
          const newDiamonds = (essential.user.diamonds || 0) + rewardDiamonds;
          
          // Import getLevelInfo để tính level mới
          const { getLevelInfo } = await import('@/lib/gamification');
          const newLevelInfo = getLevelInfo(newTotalStars);
          
          setEssential(prev => ({
            ...prev,
            user: {
              ...prev.user,
              totalStars: newTotalStars,
              diamonds: newDiamonds,
              levelInfo: newLevelInfo
            }
          }));
          
          // 🔄 Dispatch event với DATA để TopBar update (KHÔNG fetch server)
          window.dispatchEvent(new CustomEvent('user-stats-updated', {
            detail: {
              stars: rewardStars,
              diamonds: rewardDiamonds,
              newLevel: newLevelInfo?.level
            }
          }));
        }
        
        // Hiển thị popup nhận thưởng với hiệu ứng đẹp
        showReward({
          stars: rewardStars,
          diamonds: rewardDiamonds,
          name: data.reward.name,
          icon: data.reward.icon
        });
        
        // 🚀 OPTIMISTIC UPDATE: Cập nhật quests UI ngay lập tức
        // 🔥 Chỉ cần update quests state (fallback data đã được copy vào state)
        setQuests(prev => {
          if (!prev?.active) return prev;

          // Lọc bỏ quest vừa claim khỏi danh sách active
          const stillActive = prev.active.filter(q => q.id !== questId);

          // Cập nhật completedCount
          const newCompletedCount = stillActive.filter(q => q.completed && !q.claimed).length;

          return {
            ...prev,
            active: stillActive,
            completedCount: newCompletedCount
          };
        });
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  // === LOADING STATES ===
  // Track nếu đã từng fetch thất bại
  const [hasFetchFailed, setHasFetchFailed] = useState(false);
  
  const isInitialLoading = status === 'loading' || essentialLoading;
  
  // Hiện loading khi:
  // 1. Session đang loading HOẶC
  // 2. Essential đang loading HOẶC
  // 3. Đã authenticated nhưng chưa có user data (đang chờ fetch)
  if (!user && (isInitialLoading || status === 'authenticated')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🧮</div>
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Chỉ hiện error khi:
  // 1. Không có user data VÀ
  // 2. Không phải authenticated (đã logout hoặc lỗi session) VÀ  
  // 3. Không đang loading
  if (!user && status !== 'authenticated' && status !== 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-600 font-medium mb-4">Không thể tải dữ liệu</p>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50">
      {/* Unified TopBar */}
      <TopBar showStats={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* 🎯 TIẾP TỤC HỌC - CTA CHÍNH */}
        {nextLesson && !nextLesson.isCompleted && (
          <button
            onClick={() => router.push(`/learn/${nextLesson.levelId}/${nextLesson.lessonId}`)}
            className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🎯</span>
                  <span className="text-white/90 text-sm font-medium">
                    {nextLesson.isInProgress ? 'Tiếp tục học' : 'Bài học tiếp theo'}
                  </span>
                  {nextLesson.isInProgress && (
                    <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                      Đang học
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {nextLesson.title}
                </h3>
                <p className="text-white/80 text-sm flex items-center gap-3">
                  <span>📚 {nextLesson.levelName}</span>
                  {nextLesson.estimatedTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      ~{nextLesson.estimatedTime} phút
                    </span>
                  )}
                </p>
                {nextLesson.currentProgress && (
                  <div className="mt-3">
                    <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full"
                        style={{ width: `${Math.min((nextLesson.currentProgress.starsEarned / 3) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-white/70 mt-1">
                      Đã đạt {nextLesson.currentProgress.starsEarned}/3 ⭐
                    </div>
                  </div>
                )}
              </div>
              <div className="ml-4 p-4 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors">
                <Play size={32} className="text-white fill-white" />
              </div>
            </div>
          </button>
        )}

        {/* Đã hoàn thành tất cả */}
        {nextLesson?.isCompleted && (
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl sm:rounded-3xl p-6 text-center text-white shadow-xl">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="text-2xl font-bold mb-2">Xuất sắc!</h3>
            <p className="text-white/90">Bạn đã hoàn thành tất cả bài học. Hãy luyện tập thêm nhé!</p>
          </div>
        )}

        {/* Level Card - ĐƯA LÊN ĐẦU - Click để xem chi tiết */}
        <LevelCardWithModal user={user} />

        {/* Banner gợi ý tinh tế - chỉ hiển cho user free/basic */}
        {user?.tier !== 'advanced' && user?.tier !== 'vip' && (
          <Link 
            href="/pricing"
            className="block bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-4 shadow-sm border border-purple-100 hover:shadow-md hover:border-purple-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                <Gift size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-800">Khám phá nhiều hơn</span>
                  <Sparkles size={14} className="text-purple-500" />
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {user?.tier === 'free' 
                    ? 'Mở khóa 18 level và các chế độ chơi đặc biệt' 
                    : 'Nâng cấp để trải nghiệm trọn vẹn'}
                </p>
              </div>
              <ChevronRight size={18} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        )}

        {/* Quick Actions - 3 CHỨC NĂNG CHÍNH */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* HỌC TẬP */}
          <Link
            href="/learn"
            prefetch={true}
            className="group relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all text-center focus:outline-none focus:ring-4 focus:ring-blue-300 overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
            
            <div className="relative">
              <div className="text-4xl sm:text-5xl mb-2 group-hover:scale-125 group-hover:rotate-6 transition-transform drop-shadow-lg">📚</div>
              <h3 className="text-sm sm:text-lg font-bold text-white drop-shadow">Học tập</h3>
              {progress?.completedLessons > 0 ? (
                <p className="text-xs text-white/80 mt-1 font-medium">{progress.completedLessons} bài</p>
              ) : (
                <p className="text-xs text-white/80 mt-1 font-medium animate-pulse">Bắt đầu ngay!</p>
              )}
            </div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
          </Link>

          {/* LUYỆN TẬP */}
          <Link
            href="/practice"
            prefetch={true}
            className="group relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all text-center focus:outline-none focus:ring-4 focus:ring-orange-300 overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
            
            <div className="relative">
              <div className="text-4xl sm:text-5xl mb-2 group-hover:scale-125 group-hover:-rotate-6 transition-transform drop-shadow-lg">💪</div>
              <h3 className="text-sm sm:text-lg font-bold text-white drop-shadow">Luyện tập</h3>
              {exercise?.today?.total > 0 ? (
                <p className="text-xs text-white/80 mt-1 font-medium">{exercise.today.total} hôm nay</p>
              ) : (
                <p className="text-xs text-white/80 mt-1 font-medium animate-pulse">Rèn luyện nào!</p>
              )}
            </div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
          </Link>

          {/* THI ĐẤU */}
          <Link
            href="/compete"
            prefetch={true}
            className="group relative bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all text-center focus:outline-none focus:ring-4 focus:ring-purple-300 overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
            
            <div className="relative">
              <div className="text-4xl sm:text-5xl mb-2 group-hover:scale-125 group-hover:rotate-12 transition-transform drop-shadow-lg animate-bounce">🏆</div>
              <h3 className="text-sm sm:text-lg font-bold text-white drop-shadow">Thi Đấu</h3>
              {compete?.top3Count > 0 ? (
                <p className="text-xs text-white/80 mt-1 font-medium">Top 3: {compete.top3Count}x</p>
              ) : (
                <p className="text-xs text-white/80 mt-1 font-medium animate-pulse">Thử tài nào!</p>
              )}
            </div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
          </Link>
        </div>

        {/* 🗺️ ĐI TÌM KHO BÁU TRI THỨC - GAME CHÍNH */}
        <Link
          href="/adventure"
          className="group relative block overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300"
        >
          {/* Animated Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 animate-gradient-shift" />
          
          {/* Particle effects */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating sparkles */}
            <div className="absolute top-3 left-4 text-2xl animate-float-slow">✨</div>
            <div className="absolute top-6 right-20 text-xl animate-float-medium">⭐</div>
            <div className="absolute bottom-8 left-16 text-lg animate-float-fast">💫</div>
            <div className="absolute top-1/2 left-8 text-xl animate-pulse">🌟</div>
            <div className="absolute bottom-4 right-32 text-lg animate-float-slow delay-500">💎</div>
            
            {/* Treasure map icon with glow */}
            <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 text-7xl sm:text-8xl blur-md opacity-50 group-hover:opacity-80 transition-opacity">
                  🗺️
                </div>
                {/* Main icon */}
                <div className="relative text-6xl sm:text-7xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 drop-shadow-2xl animate-bounce-slow">
                  🗺️
                </div>
              </div>
            </div>
            
            {/* Treasure chest floating */}
            <div className="absolute left-1/2 bottom-2 text-3xl animate-float-medium group-hover:scale-110 transition-transform">
              🏆
            </div>
            
            {/* Pattern overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgo8L3N2Zz4=')] opacity-40" />
            
            {/* Gradient overlay for text */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative p-5 sm:p-6">
            {/* Header badges */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl sm:text-3xl animate-wiggle">🦉</span>
              <span className="px-2.5 py-1 bg-gradient-to-r from-yellow-300 to-amber-400 text-amber-900 rounded-full text-xs font-black uppercase tracking-wide shadow-lg animate-pulse">
                🎮 Game
              </span>
              <span className="px-2 py-0.5 bg-green-400 text-green-900 rounded-full text-[10px] font-bold">
                HOT
              </span>
            </div>
            
            {/* Game title */}
            <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg mb-2 leading-tight">
              Đi Tìm Kho Báu
              <span className="block text-yellow-200 text-xl sm:text-2xl">Tri Thức</span>
            </h3>
            
            <p className="text-white/90 text-sm sm:text-base max-w-[200px] mb-4">
              Cùng <span className="font-bold text-yellow-200">Cú Soro</span> khám phá vùng đất bí ẩn!
            </p>
            
            {/* Game stats */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/25 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium border border-white/30">
                <span>🏘️</span>
                <span>10 Vùng đất</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/25 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium border border-white/30">
                <span>🎁</span>
                <span>Kho báu</span>
              </div>
            </div>

            {/* Play button */}
            <div className="absolute right-3 sm:right-4 bottom-3 sm:bottom-4">
              <div className="px-4 py-2 bg-white rounded-full text-orange-600 font-bold text-sm shadow-lg group-hover:bg-yellow-300 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                <span>Chơi ngay</span>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </div>
            </div>
          </div>

          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-yellow-300/50 group-hover:border-yellow-300 transition-colors" />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000" />
        </Link>

        {/* Nhiệm vụ hôm nay */}
        {questsLoading ? (
          <SectionSkeleton />
        ) : questsData ? (
          <QuestList quests={questsData} onClaimReward={handleClaimReward} />
        ) : null}

        {/* Tiến độ chứng chỉ */}
        {certificatesLoading ? (
          <SectionSkeleton />
        ) : certificatesData ? (
          <CertificateProgress certificates={certificatesData} />
        ) : null}

        {/* Thành tích */}
        {achievementsLoading ? (
          <SectionSkeleton />
        ) : achievementsData ? (
          <AchievementList achievements={achievementsData} allAchievements={achievementsData?.all || achievementsData?.unlocked} />
        ) : null}

        {/* Thống kê chi tiết - CUỐI CÙNG */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <button
            onClick={() => setShowDetailedStats(!showDetailedStats)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-bold text-gray-800">Thống kê chi tiết</h3>
                <p className="text-sm text-gray-500">Xem biểu đồ hoạt động và tiến độ học tập</p>
              </div>
            </div>
            {showDetailedStats ? (
              <ChevronUp size={24} className="text-gray-400" />
            ) : (
              <ChevronDown size={24} className="text-gray-400" />
            )}
          </button>
          
          {showDetailedStats && (
            <div className="px-4 sm:px-5 pb-5 space-y-6 border-t border-gray-100 pt-4">
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  <span className="ml-2 text-gray-500">Đang tải thống kê...</span>
                </div>
              ) : (
                <>
                  {/* Activity Chart */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <span>📈</span> Hoạt động 7 ngày qua
                    </h4>
                    <ActivityChart data={activityChart || activity?.activityChart || []} compact={true} />
                  </div>

                  {/* Stats Cards */}
                  {(activity?.thisWeek || progress) && (
                    <div>
                      <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span>🎯</span> Tổng quan
                      </h4>
                      <StatsCards 
                        progress={progress || { completedLessons: activity?.overall?.totalLessons }} 
                        exercise={exercise || { today: { total: 0 } }} 
                        compete={compete || {}} 
                        compact={true} 
                      />
                    </div>
                  )}

                  {/* Progress by Level - Hiển thị tên bài học */}
                  {progress && (
                    <div>
                      <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span>📚</span> Tiến độ học tập
                      </h4>
                      <ProgressByLevel progress={progress} compact={true} showLessonNames={true} />
                    </div>
                  )}

                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Reward Popup với hiệu ứng */}
      <RewardPopupComponent />

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm">
        <p>© 2025 SoroKid - Học toán tư duy cùng bàn tính Soroban</p>
      </footer>
    </div>
  );
}

// TIER_LIST - định nghĩa ngoài component để không tạo lại mỗi render
const TIER_LIST = [
  { name: 'Nhập Môn', levels: '1-3', icon: '🌱', color: 'from-green-400 to-emerald-500' },
  { name: 'Luyện Hạt', levels: '4-6', icon: '🔵', color: 'from-teal-400 to-teal-600' },
  { name: 'Tay Nhanh', levels: '7-9', icon: '⚡', color: 'from-amber-400 to-orange-500' },
  { name: 'Thợ Tính', levels: '10-14', icon: '🧮', color: 'from-emerald-400 to-green-600' },
  { name: 'Cao Thủ', levels: '15-19', icon: '💪', color: 'from-red-400 to-red-600' },
  { name: 'Siêu Tính', levels: '20-29', icon: '🚀', color: 'from-cyan-400 to-teal-600' },
  { name: 'Thần Tính', levels: '30-39', icon: '🔥', color: 'from-orange-400 to-red-500' },
  { name: 'Kỳ Tài', levels: '40-49', icon: '⭐', color: 'from-amber-400 to-orange-500' },
  { name: 'Thần Đồng', levels: '50-69', icon: '🌟', color: 'from-purple-400 to-purple-600' },
  { name: 'Thiên Tài', levels: '70-89', icon: '💫', color: 'from-pink-400 to-pink-600' },
  { name: 'Kỳ Nhân', levels: '90-99', icon: '👑', color: 'from-amber-400 to-orange-500' },
  { name: 'Đại Tông Sư', levels: '100+', icon: '🏆', color: 'from-red-500 to-rose-600' },
];

// Custom scrollbar styles cho modal
const levelModalScrollStyles = `
  .level-modal-scroll::-webkit-scrollbar { width: 6px; }
  .level-modal-scroll::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 10px; }
  .level-modal-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #a855f7, #ec4899); border-radius: 10px; }
  .level-modal-scroll::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #9333ea, #db2777); }
`;

/**
 * LevelCardWithModal - Card hiển thị level với popup chi tiết
 */
function LevelCardWithModal({ user }) {
  const [showModal, setShowModal] = useState(false);
  const levelInfo = user?.levelInfo;
  const currentLevel = levelInfo?.level || 1;

  // Memoize currentTierIndex - chỉ tính lại khi currentLevel thay đổi
  const currentTierIndex = useMemo(() => {
    return TIER_LIST.findIndex((t) => {
      const minLevel = parseInt(t.levels.split('-')[0]);
      const maxLevel = t.levels.includes('+') ? Infinity : parseInt(t.levels.split('-')[1]);
      return currentLevel >= minLevel && currentLevel <= maxLevel;
    });
  }, [currentLevel]);

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl cursor-pointer hover:shadow-2xl transition-all hover:scale-[1.01] group"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <LevelBadge totalStars={user?.totalStars || 0} size="xl" showProgress={false} />
          <div className="flex-1 text-center sm:text-left">
            <div className="text-sm text-gray-500 mb-1">Cấp độ hiện tại</div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {levelInfo?.name}
            </div>
            <TrialDaysBadge />
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Tiến độ lên level</span>
                <span>{levelInfo?.progressPercent || 0}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                  style={{ width: `${levelInfo?.progressPercent || 0}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                <span>Còn {(levelInfo?.starsNeededForNext || 0).toLocaleString()} ⭐ để lên level tiếp theo</span>
                <span className="text-purple-500 group-hover:text-purple-600 font-medium">Xem chi tiết →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chi tiết level */}
      {showModal && (
        <>
        <style>{levelModalScrollStyles}</style>
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] sm:max-h-[85vh] overflow-hidden">
            {/* Header với nút X đóng nhanh */}
            <div className={`px-5 py-4 bg-gradient-to-r ${levelInfo?.tierColor?.bg || 'from-purple-500 to-pink-500'} relative`}>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white text-xl font-bold transition-colors"
                aria-label="Đóng"
              >
                ×
              </button>
              <div className="flex items-center gap-3 pr-8">
                <span className="text-4xl drop-shadow-lg">{levelInfo?.icon}</span>
                <div>
                  <div className="text-white/80 text-sm">Level {currentLevel}</div>
                  <h3 className="font-bold text-white text-xl">{levelInfo?.name}</h3>
                </div>
              </div>
            </div>

            {/* Content */}
            <div
              className="px-5 py-4 overflow-y-auto max-h-[50vh] sm:max-h-[60vh] level-modal-scroll"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #f3f4f6' }}
            >
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-3 text-center border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">{(user?.totalStars || 0).toLocaleString()}</div>
                  <div className="text-xs text-yellow-700">Tổng sao ⭐</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 text-center border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{levelInfo?.progressPercent || 0}%</div>
                  <div className="text-xs text-purple-700">Tiến độ level</div>
                </div>
              </div>

              {/* Progress to next level */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Sao hiện tại trong level</span>
                  <span className="font-bold text-gray-800">{levelInfo?.currentLevelStars || 0} ⭐</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full bg-gradient-to-r ${levelInfo?.tierColor?.bg || 'from-purple-500 to-pink-500'} rounded-full`}
                    style={{ width: `${levelInfo?.progressPercent || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0 ⭐</span>
                  <span>{levelInfo?.starsForNextLevel || 0} ⭐</span>
                </div>
                <div className="text-center text-sm text-gray-600 mt-2">
                  Còn <span className="font-bold text-purple-600">{(levelInfo?.starsNeededForNext || 0).toLocaleString()} ⭐</span> để lên Level {currentLevel + 1}
                </div>
              </div>

              {/* Tier list */}
              <div className="mb-2">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>🏅</span> Các cấp bậc
                </h4>
                <div className="space-y-2">
                  {TIER_LIST.map((tier, idx) => {
                    const isCurrentTier = idx === currentTierIndex;
                    const isPastTier = idx < currentTierIndex;
                    return (
                      <div
                        key={tier.name}
                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                          isCurrentTier
                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-sm'
                            : isPastTier
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200 opacity-60'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${tier.color} shadow`}>
                          <span className="text-xl">{tier.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-sm ${isCurrentTier ? 'text-purple-700' : isPastTier ? 'text-green-700' : 'text-gray-500'}`}>
                            {tier.name}
                          </div>
                          <div className="text-xs text-gray-500">Level {tier.levels}</div>
                        </div>
                        {isCurrentTier && (
                          <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">Hiện tại</span>
                        )}
                        {isPastTier && (
                          <span className="text-green-500 text-lg">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Close button */}
            <div className="px-5 pb-4 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
        </>
      )}
    </>
  );
}
