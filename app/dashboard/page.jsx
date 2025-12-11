'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogOut, Star, Zap, Trophy, ChevronRight, Play, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import LevelBadge from '@/components/LevelBadge/LevelBadge';
import Logo from '@/components/Logo/Logo';
import ActivityChart from '@/components/Dashboard/ActivityChart';
import StatsCards from '@/components/Dashboard/StatsCards';
import QuestList from '@/components/Dashboard/QuestList';
import AchievementList from '@/components/Dashboard/AchievementList';
import ProgressByLevel from '@/components/Dashboard/ProgressByLevel';
import RewardPopup, { useRewardPopup } from '@/components/RewardPopup/RewardPopup';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  
  // Hook hiệu ứng nhận thưởng
  const { showReward, RewardPopupComponent } = useRewardPopup();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (questId) => {
    try {
      const response = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'quest', id: questId })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Hiển thị popup nhận thưởng với hiệu ứng đẹp
        showReward({
          stars: data.reward.stars,
          diamonds: data.reward.diamonds,
          name: data.reward.name,
          icon: data.reward.icon
        });
        // Refresh data
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🧮</div>
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  const { user, nextLesson, progress, exercise, compete, quests, achievements, leaderboard, activityChart } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={() => signOut({ callbackUrl: '/' })}
        title="Đăng xuất?"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        type="warning"
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo & User */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Logo size="md" showText={false} />
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Sorokid
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Xin chào, {user?.name}!</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-3">
              {/* Stars */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <div className="text-right">
                  <span className="font-bold text-yellow-700">{(user?.totalStars || 0).toLocaleString()}</span>
                  <span className="text-xs text-yellow-600 ml-1">sao</span>
                </div>
              </div>

              {/* Diamonds */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl">
                <span className="text-base">💎</span>
                <div className="text-right">
                  <span className="font-bold text-cyan-700">{(user?.diamonds || 0).toLocaleString()}</span>
                  <span className="text-xs text-cyan-600 ml-1">kim cương</span>
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-100 to-orange-100 rounded-xl" title="Số ngày liên tiếp có hoạt động">
                <span className="text-base">🔥</span>
                <div className="text-right">
                  <span className="font-bold text-red-700">{user?.streak || 0}</span>
                  <span className="text-xs text-red-600 ml-1">ngày liên tiếp</span>
                </div>
              </div>

              {/* Leaderboard Rank */}
              {leaderboard?.rank && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                  <Trophy size={16} className="text-blue-500" />
                  <div className="text-right">
                    <span className="font-bold text-blue-700">#{leaderboard.rank}</span>
                    <span className="text-xs text-blue-600 ml-1">hạng</span>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-400 shadow-lg shadow-red-200"
              aria-label="Đăng xuất"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Mobile Stats Row */}
        <div className="md:hidden grid grid-cols-4 gap-2">
          <div className="bg-white rounded-xl p-3 shadow-md text-center">
            <div className="text-lg mb-1">⭐</div>
            <div className="font-bold text-sm text-yellow-700">{(user?.totalStars || 0).toLocaleString()}</div>
            <div className="text-xs text-gray-500">sao</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md text-center">
            <div className="text-lg mb-1">💎</div>
            <div className="font-bold text-sm text-cyan-700">{(user?.diamonds || 0).toLocaleString()}</div>
            <div className="text-xs text-gray-500">kim cương</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md text-center" title="Số ngày liên tiếp có hoạt động">
            <div className="text-lg mb-1">🔥</div>
            <div className="font-bold text-sm text-red-700">{user?.streak || 0}</div>
            <div className="text-xs text-gray-500">liên tiếp</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md text-center">
            <div className="text-lg mb-1">🏆</div>
            <div className="font-bold text-sm text-blue-700">#{leaderboard?.rank || '-'}</div>
            <div className="text-xs text-gray-500">hạng</div>
          </div>
        </div>

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
              <div className="text-sm text-gray-500 mb-1">Cấp độ hiện tại</div>
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {user?.levelInfo?.name}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Tiến độ lên level</span>
                  <span>{user?.levelInfo?.progressPercent || 0}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                    style={{ width: `${user?.levelInfo?.progressPercent || 0}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Còn {(user?.levelInfo?.starsNeededForNext || 0).toLocaleString()} ⭐ để lên level tiếp theo
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Link
            href="/learn"
            prefetch={true}
            className="group bg-white rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <div className="text-4xl sm:text-5xl mb-2 group-hover:scale-110 transition-transform">📚</div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-800">Học tập</h3>
            {progress?.completedLessons > 0 && (
              <p className="text-xs text-gray-500 mt-1">{progress.completedLessons} bài</p>
            )}
          </Link>

          <Link
            href="/practice"
            prefetch={true}
            className="group bg-white rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <div className="text-4xl sm:text-5xl mb-2 group-hover:scale-110 transition-transform">💪</div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-800">Luyện tập</h3>
            {exercise?.today?.total > 0 && (
              <p className="text-xs text-gray-500 mt-1">{exercise.today.total} hôm nay</p>
            )}
          </Link>

          <Link
            href="/compete"
            prefetch={true}
            className="group bg-white rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <div className="text-4xl sm:text-5xl mb-2 group-hover:scale-110 transition-transform">🏆</div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-800">Thi Đấu</h3>
            {compete?.top3Count > 0 && (
              <p className="text-xs text-gray-500 mt-1">Top 3: {compete.top3Count}x</p>
            )}
          </Link>
        </div>

        {/* Nhiệm vụ hôm nay */}
        <QuestList quests={quests} onClaimReward={handleClaimReward} />

        {/* Thành tích */}
        <AchievementList achievements={achievements} allAchievements={achievements?.all} />

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
              {/* Activity Chart */}
              <div>
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>📈</span> Hoạt động 7 ngày qua
                </h4>
                <ActivityChart data={activityChart || []} compact={true} />
              </div>

              {/* Stats Cards */}
              <div>
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>🎯</span> Tổng quan
                </h4>
                <StatsCards progress={progress} exercise={exercise} compete={compete} compact={true} />
              </div>

              {/* Progress by Level - Hiển thị tên bài học */}
              <div>
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>📚</span> Tiến độ học tập
                </h4>
                <ProgressByLevel progress={progress} compact={true} showLessonNames={true} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reward Popup với hiệu ứng */}
      <RewardPopupComponent />

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm">
        <p>© 2025 Sorokid - Học Soroban thật vui 🧮</p>
      </footer>
    </div>
  );
}
