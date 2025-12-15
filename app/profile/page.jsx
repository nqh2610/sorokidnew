'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LogOut, 
  ChevronRight, 
  User, 
  Crown, 
  Award, 
  Settings,
  Shield,
  Edit3,
  Star,
  Camera
} from 'lucide-react';
import TopBar from '@/components/TopBar/TopBar';
import BottomNav from '@/components/Navigation/BottomNav';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import { MonsterAvatar } from '@/components/MonsterAvatar';
import AvatarSelector from '@/components/AvatarSelector/AvatarSelector';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userStats, setUserStats] = useState(null);
  const [userTier, setUserTier] = useState('free');
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const [profileRes, tierRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/tier')
      ]);
      
      const profileData = await profileRes.json();
      const tierData = await tierRes.json();
      
      if (profileData.user) {
        setUserStats(profileData.user);
      }
      if (tierData.tier) {
        setUserTier(tierData.tier);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarSelect = async (avatarIndex) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarIndex !== null ? String(avatarIndex) : null })
      });

      if (response.ok) {
        setUserStats(prev => ({ ...prev, avatar: avatarIndex !== null ? String(avatarIndex) : null }));
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  // Parse avatar from database (stored as string) to number
  const getCurrentAvatarIndex = () => {
    if (!userStats?.avatar) return null;
    const parsed = parseInt(userStats.avatar, 10);
    return isNaN(parsed) ? null : parsed;
  };

  const getTierInfo = () => {
    switch (userTier) {
      case 'vip':
        return {
          name: 'VIP',
          icon: '👑',
          color: 'from-amber-400 to-orange-500',
          bgColor: 'bg-gradient-to-r from-amber-50 to-orange-50',
          borderColor: 'border-amber-200'
        };
      case 'premium':
      case 'advanced':
        return {
          name: 'Nâng Cao',
          icon: '⭐',
          color: 'from-violet-500 to-fuchsia-500',
          bgColor: 'bg-gradient-to-r from-violet-50 to-fuchsia-50',
          borderColor: 'border-violet-200'
        };
      case 'basic':
        return {
          name: 'Cơ Bản',
          icon: '✓',
          color: 'from-blue-400 to-cyan-500',
          bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          name: 'Miễn Phí',
          icon: '🆓',
          color: 'from-gray-400 to-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const tierInfo = getTierInfo();

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-violet-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <>
      <TopBar showStats={false} />
      
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

      {/* Avatar Selector Modal */}
      <AvatarSelector
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        currentAvatar={getCurrentAvatarIndex()}
        seed={session.user?.id || session.user?.email || 'default'}
        onSelect={handleAvatarSelect}
      />

      <main className="min-h-screen bg-gradient-to-b from-blue-50 via-violet-50 to-pink-50 pb-24">
        <div className="max-w-2xl mx-auto px-4 py-6">
          
          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              {/* Monster Avatar - Clickable to change */}
              <button 
                onClick={() => setShowAvatarSelector(true)}
                className="relative group"
                title="Đổi avatar"
              >
                <MonsterAvatar 
                  seed={session.user?.id || session.user?.email || 'default'}
                  avatarIndex={getCurrentAvatarIndex()}
                  size={80}
                  className="border-4 border-violet-200 group-hover:border-violet-400 transition-colors"
                  showBorder={false}
                />
                {/* Camera icon overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-full transition-all flex items-center justify-center">
                  <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Level badge */}
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <span>{userStats?.levelInfo?.icon || '🌱'}</span>
                  <span>Lv.{userStats?.level || 1}</span>
                </div>
              </button>
              
              {/* User info */}
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-800">
                  {userStats?.name || session.user?.name || 'User'}
                </h1>
                {userStats?.username && (
                  <p className="text-gray-500 text-sm">@{userStats.username}</p>
                )}
                <div className={`inline-flex items-center gap-1 mt-2 px-3 py-1 ${tierInfo.bgColor} ${tierInfo.borderColor} border rounded-full`}>
                  <span>{tierInfo.icon}</span>
                  <span className={`text-sm font-semibold bg-gradient-to-r ${tierInfo.color} bg-clip-text text-transparent`}>
                    {tierInfo.name}
                  </span>
                </div>
              </div>

              {/* Edit button */}
              <Link 
                href="/edit-profile"
                className="flex items-center gap-2 px-3 py-2 bg-violet-100 hover:bg-violet-200 rounded-xl transition-colors"
              >
                <Edit3 size={18} className="text-violet-600" />
                <span className="text-sm font-medium text-violet-600 hidden sm:inline">Sửa</span>
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-orange-500">
                  <span>🔥</span>
                  <span className="text-xl font-bold">{userStats?.streak || 0}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Chuỗi ngày</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-500">
                  <Star size={18} className="fill-yellow-500" />
                  <span className="text-xl font-bold">{(userStats?.totalStars || 0).toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Tổng sao</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-cyan-500">
                  <span>💎</span>
                  <span className="text-xl font-bold">{(userStats?.diamonds || 0).toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Kim cương</p>
              </div>
            </div>
          </div>

          {/* Menu Sections */}
          <div className="space-y-4">
            
            {/* Learning Section */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <h2 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50">
                HỌC TẬP
              </h2>
              <div className="divide-y divide-gray-100">
                <Link href="/dashboard" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                  <span className="flex-1 font-medium text-gray-700">Bảng điều khiển</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </Link>
                <Link href="/learn" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📚</span>
                  </div>
                  <span className="flex-1 font-medium text-gray-700">Học bài</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </Link>
                <Link href="/practice" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                  <span className="flex-1 font-medium text-gray-700">Luyện tập</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </Link>
                <Link href="/compete" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🏆</span>
                  </div>
                  <span className="flex-1 font-medium text-gray-700">Thi đấu</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </Link>
                <Link href="/leaderboard" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🏅</span>
                  </div>
                  <span className="flex-1 font-medium text-gray-700">Bảng xếp hạng</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </Link>
              </div>
            </div>

            {/* Account Section */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <h2 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50">
                TÀI KHOẢN
              </h2>
              <div className="divide-y divide-gray-100">
                <Link href="/pricing" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Crown size={20} className="text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-700">Nâng cấp tài khoản</span>
                    {userTier === 'free' && (
                      <p className="text-xs text-violet-600">Mở khóa tất cả tính năng!</p>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </Link>

                {(userTier === 'vip' || userTier === 'advanced') && (
                  <Link href="/certificate" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Award size={20} className="text-amber-600" />
                    </div>
                    <span className="flex-1 font-medium text-gray-700">Chứng chỉ</span>
                    <ChevronRight size={20} className="text-gray-400" />
                  </Link>
                )}

                <Link href="/edit-profile" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <User size={20} className="text-cyan-600" />
                  </div>
                  <span className="flex-1 font-medium text-gray-700">Chỉnh sửa hồ sơ</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </Link>
              </div>
            </div>

            {/* Admin Section - Only for admins */}
            {session.user?.role === 'admin' && (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <h2 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50">
                  QUẢN TRỊ
                </h2>
                <div className="divide-y divide-gray-100">
                  <Link href="/admin" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Shield size={20} className="text-red-600" />
                    </div>
                    <span className="flex-1 font-medium text-gray-700">Trang quản trị</span>
                    <ChevronRight size={20} className="text-gray-400" />
                  </Link>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="w-full bg-white rounded-2xl shadow-md overflow-hidden"
            >
              <div className="flex items-center gap-4 px-4 py-4 hover:bg-red-50 active:bg-red-100 transition-colors">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <LogOut size={20} className="text-red-600" />
                </div>
                <span className="flex-1 font-medium text-red-600 text-left">Đăng xuất</span>
              </div>
            </button>

            {/* App version */}
            <p className="text-center text-xs text-gray-400 py-4">
              SoroKid v1.0.0
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
