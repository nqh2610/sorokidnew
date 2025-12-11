'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function TopBar() {
  const { data: session } = useSession();
  const [userStats, setUserStats] = useState(null);
  const [userTier, setUserTier] = useState('free');
  const [showDropdown, setShowDropdown] = useState(false);

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
        return (
          <span className="px-2 py-0.5 bg-gradient-to-r from-blue-400 to-purple-500 text-white text-xs font-bold rounded-full">
            ⭐ Premium
          </span>
        );
      default:
        return null;
    }
  };

  if (!session) return null;

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🧮</span>
            <span className="font-bold text-purple-600 hidden sm:inline">Sorokids</span>
          </Link>

          {/* Stats bar */}
          <div className="flex items-center gap-4">
            {/* Streak */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 rounded-full">
              <span className="text-lg">🔥</span>
              <span className="font-semibold text-orange-600">
                {userStats?.streak || 0}
              </span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 rounded-full">
              <span className="text-lg">⭐</span>
              <span className="font-semibold text-yellow-600">
                {userStats?.totalStars || 0}
              </span>
            </div>

            {/* Diamonds */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-full">
              <span className="text-lg">💎</span>
              <span className="font-semibold text-blue-600">
                {userStats?.diamonds || 0}
              </span>
            </div>

            {/* Upgrade button for free users */}
            {userTier === 'free' && (
              <Link
                href="/pricing"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-full hover:shadow-md transition-shadow"
              >
                <span>⚡</span>
                <span>Nâng cấp</span>
              </Link>
            )}

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {session.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {(userStats?.name || session.user?.name || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-800">
                      {userStats?.name || session.user?.name || 'User'}
                    </span>
                    {getTierBadge()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Cấp {userStats?.level || 1}
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border py-2 z-20">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <span>📊</span>
                      <span className="text-gray-700">Bảng điều khiển</span>
                    </Link>
                    <Link
                      href="/auth/complete-profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <span>👤</span>
                      <span className="text-gray-700">Hồ sơ</span>
                    </Link>
                    {userTier === 'vip' && (
                      <Link
                        href="/certificate"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <span>🏆</span>
                        <span className="text-gray-700">Chứng chỉ</span>
                      </Link>
                    )}
                    <Link
                      href="/pricing"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <span>💎</span>
                      <span className="text-gray-700">Nâng cấp</span>
                    </Link>
                    <hr className="my-2" />
                    {session.user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <span>⚙️</span>
                        <span className="text-gray-700">Admin</span>
                      </Link>
                    )}
                    <Link
                      href="/api/auth/signout"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <span>🚪</span>
                      <span>Đăng xuất</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
