'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { Star, Zap, Trophy, ChevronRight, Play, Clock, ChevronDown, ChevronUp, Sparkles, Gift, Award, Loader2 } from 'lucide-react';
import LevelBadge from '@/components/LevelBadge/LevelBadge';
import TopBar from '@/components/TopBar/TopBar';
import StatsCards from '@/components/Dashboard/StatsCards';
import QuestList from '@/components/Dashboard/QuestList';
import RewardPopup, { useRewardPopup } from '@/components/RewardPopup/RewardPopup';
import TrialDaysBadge from '@/components/TrialDaysBadge/TrialDaysBadge';
import PWAInstallBanner from '@/components/PWAInstaller/PWAInstaller';

// 🚀 PERF: Lazy load secondary components (giảm ~40KB initial bundle)
const ActivityChart = lazy(() => import('@/components/Dashboard/ActivityChart'));
const AchievementList = lazy(() => import('@/components/Dashboard/AchievementList'));
const ProgressByLevel = lazy(() => import('@/components/Dashboard/ProgressByLevel'));
const CertificateProgress = lazy(() => import('@/components/Dashboard/CertificateProgress'));

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
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  // 🔧 Xóa cookie profile_just_completed và refresh session sau khi vào dashboard
  useEffect(() => {
    // Xóa cookie bằng cách set maxAge = 0
    if (document.cookie.includes('profile_just_completed')) {
      document.cookie = 'profile_just_completed=; path=/; max-age=0';
      
      // Refresh session để cập nhật JWT token với isProfileComplete = true
      update();
    }
  }, [update]);
  
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

  // 🚀 PERF: AbortController để cancel requests khi unmount
  const activityAbortRef = useRef(null);

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

  // === PHASE 2: SECONDARY DATA (Staggered để giảm spike) ===
  // 🔧 TỐI ƯU: Staggered loading - không gây spike lên server
  const fetchSecondaryData = useCallback(() => {
    // Load quests ngay (nhẹ nhất)
    fetchQuests();
    // Load certificates sau 300ms 
    setTimeout(() => fetchCertificates(), 300);
    // Achievements load sau 600ms
    setTimeout(() => fetchAchievements(), 600);
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

    // 🚀 PERF: Cancel previous request if any
    if (activityAbortRef.current) {
      activityAbortRef.current.abort();
    }
    activityAbortRef.current = new AbortController();

    try {
      setActivityLoading(true);
      const response = await fetch('/api/dashboard/activity', {
        signal: activityAbortRef.current.signal
      });
      const data = await response.json();
      if (data.success) {
        setActivity(data);
      }
    } catch (error) {
      // 🚀 PERF: Ignore abort errors
      if (error.name === 'AbortError') return;
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

    // 🚀 PERF: Cleanup - cancel pending requests khi unmount
    return () => {
      if (activityAbortRef.current) {
        activityAbortRef.current.abort();
      }
    };
  }, [status, router, fetchEssential]);

  // Load activity when expanding stats - chỉ chạy 1 lần khi mở
  useEffect(() => {
    if (showDetailedStats && !activity && !activityLoading) {
      fetchActivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDetailedStats]); // Chỉ depend on showDetailedStats để tránh loop

  // === DATA HELPERS - 🚀 PERF: useMemo để tránh recalculate mỗi render ===
  const user = useMemo(() =>
    useFallback ? fallbackData?.user : essential?.user,
    [useFallback, fallbackData?.user, essential?.user]
  );

  const nextLesson = useMemo(() =>
    useFallback ? fallbackData?.nextLesson : essential?.nextLesson,
    [useFallback, fallbackData?.nextLesson, essential?.nextLesson]
  );

  const quickStats = essential?.quickStats;

  // Secondary data - use fallback if progressive not loaded
  const questsData = useMemo(() =>
    quests || (useFallback ? fallbackData?.quests : null),
    [quests, useFallback, fallbackData?.quests]
  );

  const certificatesData = useMemo(() =>
    certificates || (useFallback ? { earned: fallbackData?.certificates?.earned, inProgress: fallbackData?.certificates?.inProgress } : null),
    [certificates, useFallback, fallbackData?.certificates?.earned, fallbackData?.certificates?.inProgress]
  );

  const achievementsData = useMemo(() =>
    achievements || (useFallback ? fallbackData?.achievements : null),
    [achievements, useFallback, fallbackData?.achievements]
  );

  // Activity - only from activity API or fallback
  const activityChart = useMemo(() =>
    activity?.activityChart || fallbackData?.activityChart,
    [activity?.activityChart, fallbackData?.activityChart]
  );

  const progress = useMemo(() =>
    useFallback ? fallbackData?.progress : null,
    [useFallback, fallbackData?.progress]
  );

  const exercise = useMemo(() =>
    useFallback ? fallbackData?.exercise : null,
    [useFallback, fallbackData?.exercise]
  );

  const compete = useMemo(() =>
    useFallback ? fallbackData?.compete : null,
    [useFallback, fallbackData?.compete]
  );

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

        {/* 📱 Banner cài app - chỉ hiện trên điện thoại */}
        <PWAInstallBanner />

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
          className="group relative block overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(251,191,36,0.5)] transform hover:-translate-y-3 hover:scale-[1.02] transition-all duration-500"
        >
          {/* Multi-layer Animated Background */}
          <div className="absolute inset-0">
            {/* Base gradient - animated */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 animate-gradient-shift" />
            {/* Secondary overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/30 via-transparent to-purple-500/20" />
            {/* Radial glow in center */}
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-40 sm:w-64 h-40 sm:h-64 bg-yellow-300/40 rounded-full blur-3xl animate-pulse" />
          </div>
          
          {/* 🌟 PARTICLE MAGIC EFFECTS */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating gems & sparkles - smaller on mobile */}
            <div className="absolute top-2 left-3 text-lg sm:text-2xl animate-float-slow">💎</div>
            <div className="absolute top-4 left-1/4 text-base sm:text-xl animate-bounce-slow delay-100">✨</div>
            <div className="absolute top-8 right-1/4 text-sm sm:text-lg animate-float-medium hidden sm:block">🌟</div>
            <div className="absolute top-3 right-1/3 text-lg sm:text-2xl animate-wiggle hidden sm:block">⭐</div>
            <div className="absolute bottom-16 sm:bottom-12 left-8 text-base sm:text-xl animate-float-fast">💫</div>
            <div className="absolute bottom-24 sm:bottom-20 left-1/4 text-sm sm:text-lg animate-pulse delay-300 hidden sm:block">✨</div>
            <div className="absolute top-1/3 left-6 text-lg sm:text-2xl animate-bounce-slow delay-500 hidden sm:block">🪙</div>
            
            {/* Animated coins trail - hidden on small screens */}
            <div className="absolute bottom-6 right-1/2 text-base sm:text-xl animate-float-slow delay-200 hidden sm:block">🪙</div>
            <div className="absolute bottom-10 right-1/3 text-sm sm:text-lg animate-float-medium delay-400 hidden sm:block">🪙</div>
            
            {/* Treasure chest HERO - positioned right side, responsive size */}
            <div className="absolute right-1 sm:right-6 top-1/3 sm:top-1/2 -translate-y-1/2 z-10">
              <div className="relative">
                {/* Glow rings */}
                <div className="absolute inset-0 -m-4 sm:-m-5 bg-yellow-300/40 rounded-full blur-xl animate-ping opacity-75" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-0 -m-2 sm:-m-3 bg-amber-400/50 rounded-full blur-lg animate-pulse" />
                
                {/* Antique treasure chest composition */}
                <div className="relative group-hover:scale-110 transition-all duration-700 drop-shadow-2xl">
                  {/* Main antique amphora/treasure vessel */}
                  <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl animate-bounce-slow filter drop-shadow-lg">
                    🏺
                  </div>
                  {/* Ancient key - treasure chest feel */}
                  <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl md:text-4xl animate-wiggle">
                    🗝️
                  </div>
                  {/* Floating gems and gold */}
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl md:text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>
                    💎
                  </div>
                  <div className="absolute top-0 -left-2 sm:-left-3 text-xl sm:text-2xl md:text-3xl animate-pulse" style={{ animationDelay: '0.3s' }}>
                    🪙
                  </div>
                  <div className="absolute top-0 -right-2 sm:-right-3 text-xl sm:text-2xl md:text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>
                    💰
                  </div>
                  {/* Sparkles for magic feel */}
                  <div className="absolute top-1/2 -left-4 sm:-left-5 text-base sm:text-xl animate-float-slow">
                    ✨
                  </div>
                  <div className="absolute top-1/4 -right-4 sm:-right-5 text-base sm:text-xl animate-float-medium">
                    ⭐
                  </div>
                </div>
                
                {/* Opening lid effect on hover - hidden on small mobile */}
                <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 text-2xl sm:text-4xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-4 transition-all duration-500 hidden sm:block">
                  💰
                </div>
              </div>
            </div>
            
            {/* Decorative map elements - hidden on very small screens */}
            <div className="absolute bottom-14 sm:bottom-3 left-1/2 -translate-x-1/2 text-xl sm:text-3xl animate-float-medium group-hover:scale-125 transition-transform hidden sm:block">
              🗺️
            </div>
            
            {/* Compass - smaller on mobile */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-lg sm:text-2xl animate-spin-slow opacity-70 hidden sm:block">
              🧭
            </div>
            
            {/* Pattern overlay - treasure map style */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            
            {/* Left side gradient for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
          </div>

          {/* 📝 CONTENT */}
          <div className="relative p-4 sm:p-6 md:p-7 flex flex-col min-h-[200px] sm:min-h-[200px]">
            {/* Header section */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-3">
              {/* Mascot with animation */}
              <div className="relative">
                <div className="text-2xl sm:text-3xl md:text-4xl animate-wiggle filter drop-shadow-lg">🦉</div>
                <div className="absolute -top-1 -right-1 text-xs sm:text-sm animate-bounce">💬</div>
              </div>
              
              {/* Badges */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 text-amber-900 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wide shadow-lg animate-pulse border border-yellow-200">
                  🎮 Phiêu Lưu
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-[9px] sm:text-[10px] font-bold shadow-md animate-bounce-slow">
                  🔥 HOT
                </span>
                <span className="hidden sm:inline-flex px-2 py-1 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-full text-[10px] font-bold shadow-md">
                  ⭐ NEW
                </span>
              </div>
            </div>
            
            {/* Game title - more impactful */}
            <div className="mb-1.5 sm:mb-4">
              <h3 className="text-lg sm:text-3xl md:text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] leading-tight tracking-tight">
                <span className="inline-block animate-pulse">🏝️</span> Đi Tìm{' '}
                <span className="relative inline-block">
                  <span className="text-yellow-200 drop-shadow-[0_0_20px_rgba(253,224,71,0.5)]">Kho Báu</span>
                  <span className="absolute -inset-1 bg-yellow-400/20 blur-md rounded-lg -z-10" />
                </span>
              </h3>
              <p className="text-xs sm:text-lg md:text-xl font-bold text-amber-100 mt-0.5 sm:mt-1 tracking-wide">
                🌟 Tri Thức Soroban
              </p>
            </div>
            
            {/* Description with character - responsive width */}
            <p className="text-white/95 text-[11px] sm:text-sm md:text-base max-w-[160px] sm:max-w-[220px] mb-2 sm:mb-4 leading-snug sm:leading-relaxed">
              Cùng <span className="font-bold text-yellow-200 bg-yellow-400/20 px-0.5 rounded">Cú Soro</span> khám phá 
              <span className="font-semibold text-amber-100"> 2 hòn đảo</span> bí ẩn và chinh phục các thử thách!
            </p>
            
            {/* Game features - responsive layout */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2 sm:mb-0">
              <div className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-2 bg-white/20 backdrop-blur-sm rounded-md sm:rounded-xl text-white text-[9px] sm:text-xs md:text-sm font-semibold border border-white/30 shadow-inner">
                <span className="text-xs sm:text-base">🏝️</span>
                <span>2 Đảo</span>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-2 bg-white/20 backdrop-blur-sm rounded-md sm:rounded-xl text-white text-[9px] sm:text-xs md:text-sm font-semibold border border-white/30 shadow-inner">
                <span className="text-xs sm:text-base">🗺️</span>
                <span>19 Vùng đất</span>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-2 bg-white/20 backdrop-blur-sm rounded-md sm:rounded-xl text-white text-[9px] sm:text-xs md:text-sm font-semibold border border-white/30 shadow-inner">
                <span className="text-xs sm:text-base">👹</span>
                <span>30+ Boss</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-yellow-400/30 to-amber-400/30 backdrop-blur-sm rounded-xl text-yellow-100 text-xs md:text-sm font-semibold border border-yellow-300/40 shadow-inner">
                <span className="text-base">🏆</span>
                <span>Kho báu</span>
              </div>
            </div>

            {/* CTA Play button - mobile: in-flow, desktop: absolute positioned */}
            <div className="mt-auto pt-1.5 sm:pt-0 sm:absolute sm:right-5 sm:bottom-5">
              <div className="relative inline-block">
                {/* Glow effect behind button */}
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                
                {/* Button */}
                <div className="relative px-3 sm:px-5 py-1.5 sm:py-2.5 bg-gradient-to-r from-white to-yellow-50 rounded-full text-orange-600 font-bold text-xs sm:text-base shadow-xl group-hover:from-yellow-300 group-hover:to-amber-400 group-hover:text-amber-900 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300 flex items-center gap-1 sm:gap-2 border-2 border-yellow-200/50">
                  <Play size={14} className="fill-current sm:w-[18px] sm:h-[18px]" />
                  <span>Chơi ngay!</span>
                  <ChevronRight className="group-hover:translate-x-1.5 transition-transform w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Animated border with gradient */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-yellow-300/40 group-hover:border-yellow-300 transition-all duration-500" />
          <div className="absolute inset-[3px] rounded-2xl sm:rounded-3xl border border-white/10" />
          
          {/* Shimmer sweep effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out" />
          
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-yellow-300/30 to-transparent rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-rose-500/30 to-transparent rounded-tl-full" />
        </Link>

        {/* Nhiệm vụ hôm nay */}
        {questsLoading ? (
          <SectionSkeleton />
        ) : questsData ? (
          <QuestList quests={questsData} onClaimReward={handleClaimReward} />
        ) : null}

        {/* Tiến độ chứng chỉ - 🚀 PERF: Lazy loaded */}
        {certificatesLoading ? (
          <SectionSkeleton />
        ) : certificatesData ? (
          <Suspense fallback={<SectionSkeleton />}>
            <CertificateProgress certificates={certificatesData} />
          </Suspense>
        ) : null}

        {/* Thành tích - 🚀 PERF: Lazy loaded */}
        {achievementsLoading ? (
          <SectionSkeleton />
        ) : achievementsData ? (
          <Suspense fallback={<SectionSkeleton />}>
            <AchievementList achievements={achievementsData} allAchievements={achievementsData?.all || achievementsData?.unlocked} />
          </Suspense>
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
                  {/* Activity Chart - 🚀 PERF: Lazy loaded */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <span>📈</span> Hoạt động 7 ngày qua
                    </h4>
                    <Suspense fallback={<div className="h-32 bg-gray-100 rounded-lg animate-pulse" />}>
                      <ActivityChart data={activityChart || activity?.activityChart || []} compact={true} />
                    </Suspense>
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

                  {/* Progress by Level - Hiển thị tên bài học - 🚀 PERF: Lazy loaded */}
                  {progress && (
                    <div>
                      <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span>📚</span> Tiến độ học tập
                      </h4>
                      <Suspense fallback={<div className="h-24 bg-gray-100 rounded-lg animate-pulse" />}>
                        <ProgressByLevel progress={progress} compact={true} showLessonNames={true} />
                      </Suspense>
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
        <p>© {new Date().getFullYear()} SoroKid - Học toán tư duy cùng bàn tính Soroban</p>
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
