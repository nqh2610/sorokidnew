'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
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
      const response = await fetch('/api/dashboard/quests');
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
        
        // 🚀 OPTIMISTIC UPDATE: Cập nhật quests state ngay lập tức
        setQuests(prev => {
          if (!prev || !prev.active) return prev;
          
          // Đánh dấu quest đã claimed
          const updatedActive = prev.active.map(q => 
            q.id === questId ? { ...q, claimed: true } : q
          );
          
          // Lọc bỏ quest đã claimed khỏi danh sách active
          const stillActive = updatedActive.filter(q => !q.claimed);
          
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

        {/* Level Card - ĐƯA LÊN ĐẦU */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <LevelBadge totalStars={user?.totalStars || 0} size="xl" showProgress={true} />
            <div className="flex-1 text-center sm:text-left">
              <div className="text-sm text-gray-600 mb-1">Cấp độ hiện tại</div>
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {user?.levelInfo?.name}
              </div>
              <TrialDaysBadge />
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Tiến độ lên level</span>
                  <span>{user?.levelInfo?.progressPercent || 0}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                    style={{ width: `${user?.levelInfo?.progressPercent || 0}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Còn {(user?.levelInfo?.starsNeededForNext || 0).toLocaleString()} ⭐ để lên level tiếp theo
                </div>
              </div>
            </div>
          </div>
        </div>

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
