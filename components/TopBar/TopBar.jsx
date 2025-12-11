'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, Star, ChevronDown } from 'lucide-react';
import Logo from '@/components/Logo/Logo';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';

export default function TopBar({ showStats = true }) {
  const { data: session } = useSession();
  const [userStats, setUserStats] = useState(null);
  const [userTier, setUserTier] = useState('free');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchUserStats();
    }
  }, [session]);

  const fetchUserStats = async () => {
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
      console.error('Error fetching user stats:', error);
    }
  };

  const getTierBadge = () => {
    switch (userTier) {
      case 'vip':
        return (
          <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full">
            👑 VIP
          </span>
        );
      case 'premium':
      case 'advanced':
        return (
          <span className="px-2 py-0.5 bg-gradient-to-r from-blue-400 to-purple-500 text-white text-xs font-bold rounded-full">
            ⭐ Premium
          </span>
        );
      case 'basic':
        return (
          <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-teal-500 text-white text-xs font-bold rounded-full">
            ✓ Basic
          </span>
        );
      default:
        return null;
    }
  };

  if (!session) return null;

  return (
    <>
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

      <header className="bg-white/90 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - Click để về Dashboard */}
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Logo size="md" showText={false} />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
                  SoroKid
                </h1>
                <p className="text-xs text-gray-500">Học Soroban vui vẻ</p>
              </div>
            </Link>

            {/* Stats bar - chỉ hiện khi showStats = true */}
            {showStats && (
              <div className="hidden md:flex items-center gap-3">
                {/* Streak */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                  <span className="text-lg">🔥</span>
                  <div className="text-right">
                    <span className="font-bold text-orange-600">{userStats?.streak || 0}</span>
                    <span className="text-xs text-orange-500 ml-1">ngày</span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
                  <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  <div className="text-right">
                    <span className="font-bold text-yellow-600">{(userStats?.totalStars || 0).toLocaleString()}</span>
                    <span className="text-xs text-yellow-500 ml-1">sao</span>
                  </div>
                </div>

                {/* Diamonds */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                  <span className="text-lg">💎</span>
                  <div className="text-right">
                    <span className="font-bold text-cyan-600">{(userStats?.diamonds || 0).toLocaleString()}</span>
                    <span className="text-xs text-cyan-500 ml-1">kim cương</span>
                  </div>
                </div>

                {/* Upgrade button for free users */}
                {userTier === 'free' && (
                  <Link
                    href="/pricing"
                    className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <span>⚡</span>
                    <span>Nâng cấp</span>
                  </Link>
                )}
              </div>
            )}

            {/* Mobile Stats */}
            {showStats && (
              <div className="flex md:hidden items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-lg">
                  <span className="text-sm">🔥</span>
                  <span className="font-semibold text-orange-600 text-sm">{userStats?.streak || 0}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg">
                  <span className="text-sm">⭐</span>
                  <span className="font-semibold text-yellow-600 text-sm">{userStats?.totalStars || 0}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
                  <span className="text-sm">💎</span>
                  <span className="font-semibold text-blue-600 text-sm">{userStats?.diamonds || 0}</span>
                </div>
              </div>
            )}

            {/* User dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt="Avatar" 
                      className="w-9 h-9 rounded-full object-cover border-2 border-violet-200"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-400 via-violet-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-violet-200">
                      {(userStats?.name || session.user?.name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-gray-800">
                        {userStats?.name || session.user?.name || 'User'}
                      </span>
                      {getTierBadge()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Cấp {userStats?.level || 1}
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {/* Dropdown menu */}
                {showDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>📊</span>
                        <span className="text-gray-700">Bảng điều khiển</span>
                      </Link>
                      <Link
                        href="/learn"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>📚</span>
                        <span className="text-gray-700">Học tập</span>
                      </Link>
                      <Link
                        href="/practice"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>🎯</span>
                        <span className="text-gray-700">Luyện tập</span>
                      </Link>
                      <Link
                        href="/compete"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>🏆</span>
                        <span className="text-gray-700">Thi đấu</span>
                      </Link>
                      <hr className="my-2" />
                      <Link
                        href="/complete-profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>👤</span>
                        <span className="text-gray-700">Hồ sơ</span>
                      </Link>
                      {(userTier === 'vip' || userTier === 'advanced') && (
                        <Link
                          href="/certificate"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                          <span>🏅</span>
                          <span className="text-gray-700">Chứng chỉ</span>
                        </Link>
                      )}
                      <Link
                        href="/pricing"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>💎</span>
                        <span className="text-gray-700">Nâng cấp</span>
                      </Link>
                      <hr className="my-2" />
                      {session.user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                          <span>⚙️</span>
                          <span className="text-gray-700">Quản trị</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setShowLogoutDialog(true);
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600 w-full"
                      >
                        <LogOut size={18} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
