'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, Star, ChevronDown } from 'lucide-react';
import Logo from '@/components/Logo/Logo';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import { MonsterAvatar } from '@/components/MonsterAvatar';
import { getLevelInfo, translateLevelName } from '@/lib/gamification';
import { useI18n } from '@/lib/i18n/I18nContext';
import { LocalizedLink } from '@/components/LocalizedLink';

export default function TopBar({ showStats = true, userData = null, userTier: propTier = null }) {
  const { t } = useI18n();
  const { data: session } = useSession();
  const [userStats, setUserStats] = useState(userData);
  const [userTier, setUserTier] = useState(propTier || 'free');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const dropdownRef = useRef(null);

  // Helper to parse avatar index from database
  const getAvatarIndex = () => {
    if (!userStats?.avatar) return null;
    const parsed = parseInt(userStats.avatar, 10);
    return isNaN(parsed) ? null : parsed;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showDropdown]);

  // 🚀 TỐI ƯU: Cập nhật state từ props nếu có (từ parent component)
  useEffect(() => {
    if (userData) {
      setUserStats(userData);
      if (propTier) setUserTier(propTier);
    }
  }, [userData, propTier]);

  useEffect(() => {
    if (session?.user && !userData) {
      // 🚀 TỐI ƯU: Chỉ fetch nếu không có userData từ props
      fetchUserStats();
    }
  }, [session, userData]);

  // 🔄 OPTIMISTIC UPDATE: Update local state từ event, KHÔNG fetch server
  useEffect(() => {
    const handleUserStatsUpdate = async (event) => {
      const { stars = 0, diamonds = 0, newLevel, newTier } = event.detail || {};
      
      setUserStats(prev => {
        if (!prev) return prev;
        
        const newTotalStars = (prev.totalStars || 0) + stars;
        
        // 🔧 FIX: Luôn tính lại level từ totalStars để đảm bảo đồng bộ
        const levelInfo = getLevelInfo(newTotalStars);
        
        const updatedStats = {
          ...prev,
          totalStars: newTotalStars,
          diamonds: (prev.diamonds || 0) + diamonds,
          level: newLevel || levelInfo.level, // Ưu tiên newLevel nếu có, không thì tính từ stars
          levelInfo: levelInfo
        };
        
        return updatedStats;
      });
      
      // Update tier nếu có
      if (newTier) {
        setUserTier(newTier);
      }
    };

    window.addEventListener('user-stats-updated', handleUserStatsUpdate);
    return () => {
      window.removeEventListener('user-stats-updated', handleUserStatsUpdate);
    };
  }, []);
  // 🔧 TỐI ƯU: Gộp 2 API calls thành 1 vì profile đã có tier
  const fetchUserStats = async () => {
    try {
      const profileRes = await fetch('/api/user/profile');
      
      // 🔧 DEBUG: Log response status
      if (!profileRes.ok) {
        console.warn('TopBar: Profile API returned', profileRes.status);
        return;
      }
      
      const profileData = await profileRes.json();
      
      if (profileData.user) {
        setUserStats(profileData.user);
        setUserTier(profileData.user.tier || 'free');
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
            👑 {t('topbar.vip')}
          </span>
        );
      case 'premium':
      case 'advanced':
        return (
          <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold rounded-full">
            ⭐ {t('topbar.advanced')}
          </span>
        );
      case 'basic':
        return (
          <span className="px-2 py-0.5 bg-gradient-to-r from-blue-400 to-cyan-500 text-white text-xs font-bold rounded-full">
            ✓ {t('topbar.basic')}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-bold rounded-full">
            {t('topbar.free')}
          </span>
        );
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
        title={t('topbar.logoutConfirm')}
        message={t('topbar.logoutMessage')}
        confirmText={t('topbar.logout')}
        cancelText={t('topbar.cancel')}
        type="warning"
      />

      <header className="bg-white/90 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Logo - Click để về Dashboard */}
            <LocalizedLink href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <Logo size="md" showText={false} />
              <h1 className="hidden sm:block text-xl font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
                SoroKid
              </h1>
            </LocalizedLink>

            {/* Desktop Stats bar */}
            {showStats && (
              <div className="hidden md:flex items-center gap-2 lg:gap-3">
                {/* Tier Badge Desktop */}
                <LocalizedLink 
                  href="/pricing"
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-50 to-pink-50 rounded-xl border border-violet-100 hover:shadow-md transition-all"
                >
                  {getTierBadge()}
                </LocalizedLink>

                {/* Streak */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                  <span className="text-lg">🔥</span>
                  <div className="text-right">
                    <span className="font-bold text-orange-600">{userStats?.streak || 0}</span>
                    <span className="text-xs text-orange-500 ml-1">{t('topbar.days')}</span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
                  <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  <div className="text-right">
                    <span className="font-bold text-yellow-600">{(userStats?.totalStars || 0).toLocaleString()}</span>
                    <span className="text-xs text-yellow-500 ml-1">{t('topbar.stars')}</span>
                  </div>
                </div>

                {/* Diamonds */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                  <span className="text-lg">💎</span>
                  <div className="text-right">
                    <span className="font-bold text-cyan-600">{(userStats?.diamonds || 0).toLocaleString()}</span>
                    <span className="text-xs text-cyan-500 ml-1">{t('topbar.diamonds')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile: Compact Stats Pill + Avatar + Logout */}
            {showStats && (
              <div className="flex md:hidden items-center gap-1.5 flex-1 justify-end">
                {/* Compact stats in one pill */}
                <div className="flex items-center bg-gray-50 rounded-full px-2 py-1 gap-2">
                  <span className="flex items-center gap-0.5 text-xs">
                    <span>🔥</span>
                    <span className="font-semibold text-orange-600">{userStats?.streak || 0}</span>
                  </span>
                  <span className="w-px h-3 bg-gray-300"></span>
                  <span className="flex items-center gap-0.5 text-xs">
                    <span>⭐</span>
                    <span className="font-semibold text-yellow-600">{(userStats?.totalStars || 0).toLocaleString()}</span>
                  </span>
                  <span className="w-px h-3 bg-gray-300"></span>
                  <span className="flex items-center gap-0.5 text-xs">
                    <span>💎</span>
                    <span className="font-semibold text-cyan-600">{(userStats?.diamonds || 0).toLocaleString()}</span>
                  </span>
                </div>

                {/* Avatar - direct link to profile page */}
                <LocalizedLink 
                  href="/profile"
                  className="flex-shrink-0 active:scale-95 transition-transform"
                >
                  <MonsterAvatar 
                    seed={session.user?.id || session.user?.email || 'default'}
                    avatarIndex={getAvatarIndex()}
                    size={36}
                    className="border-2 border-violet-200"
                    showBorder={false}
                  />
                </LocalizedLink>

                {/* Logout shortcut button */}
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-full transition-colors"
                  title={t('topbar.logout')}
                >
                  <LogOut size={16} className="text-red-500" />
                </button>
              </div>
            )}

            {/* Desktop: User dropdown */}
            <div className="hidden md:flex items-center gap-3">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <MonsterAvatar 
                    seed={session.user?.id || session.user?.email || 'default'}
                    avatarIndex={getAvatarIndex()}
                    size={36}
                    className="border-2 border-violet-200"
                    showBorder={false}
                  />
                  <div className="text-left">
                    <span className="text-sm font-semibold text-gray-800">
                      {userStats?.name || session.user?.name || 'User'}
                    </span>
                    <div className="text-xs text-gray-500">
                      {userStats?.levelInfo?.icon} {userStats?.levelInfo ? translateLevelName(userStats.levelInfo, t) : `${t('topbar.level')} ${userStats?.level || 1}`}
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop: Dropdown menu */}
                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <LocalizedLink
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>📊</span>
                        <span className="text-gray-700">{t('topbar.dashboard')}</span>
                      </LocalizedLink>
                      <LocalizedLink
                        href="/learn"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>📚</span>
                        <span className="text-gray-700">{t('topbar.learn')}</span>
                      </LocalizedLink>
                      <LocalizedLink
                        href="/practice"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>🎯</span>
                        <span className="text-gray-700">{t('topbar.practice')}</span>
                      </LocalizedLink>
                      <LocalizedLink
                        href="/compete"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>🏆</span>
                        <span className="text-gray-700">{t('topbar.compete')}</span>
                      </LocalizedLink>
                      <hr className="my-2" />
                      <LocalizedLink
                        href="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span>👤</span>
                        <span className="text-gray-700">{t('topbar.profile')}</span>
                      </LocalizedLink>
                      {(userTier === 'vip' || userTier === 'advanced') && (
                        <LocalizedLink
                          href="/certificate"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                          <span>🏅</span>
                          <span className="text-gray-700">{t('topbar.certificate')}</span>
                        </LocalizedLink>
                      )}
                      <hr className="my-2" />
                      {session.user?.role === 'admin' && (
                        <LocalizedLink
                          href="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                          <span>⚙️</span>
                          <span className="text-gray-700">{t('topbar.admin')}</span>
                        </LocalizedLink>
                      )}
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setShowLogoutDialog(true);
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600 w-full"
                      >
                        <LogOut size={18} />
                        <span>{t('topbar.logout')}</span>
                      </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
