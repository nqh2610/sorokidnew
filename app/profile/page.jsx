'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import { MonsterAvatar } from '@/components/MonsterAvatar';
import AvatarSelector from '@/components/AvatarSelector/AvatarSelector';
import { LocalizedLink, useLocalizedUrl } from '@/components/LocalizedLink';
import { useI18n } from '@/lib/i18n/I18nContext';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const localizeUrl = useLocalizedUrl();
  const { t } = useI18n();
  const [userStats, setUserStats] = useState(null);
  const [userTier, setUserTier] = useState('free');
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(localizeUrl('/login'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]); // 🔧 FIX: Chỉ depend on status để tránh re-run

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
          name: t('tier.vip'),
          icon: '👑',
          color: 'from-amber-400 to-orange-500',
          bgColor: 'bg-gradient-to-r from-amber-50 to-orange-50',
          borderColor: 'border-amber-200'
        };
      case 'premium':
      case 'advanced':
        return {
          name: t('tier.advanced'),
          icon: '⭐',
          color: 'from-violet-500 to-fuchsia-500',
          bgColor: 'bg-gradient-to-r from-violet-50 to-fuchsia-50',
          borderColor: 'border-violet-200'
        };
      case 'basic':
        return {
          name: t('tier.basic'),
          icon: '✓',
          color: 'from-blue-400 to-cyan-500',
          bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          name: t('tier.free'),
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
          <p className="text-gray-600">{t('common.loading')}</p>
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
        title={t('profilePage.logoutTitle')}
        message={t('profilePage.logoutMessage')}
        confirmText={t('common.logout')}
        cancelText={t('common.cancel')}
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

      <main className="bg-gradient-to-b from-blue-50 via-violet-50 to-pink-50 pb-4">
        <div className="max-w-2xl mx-auto px-4 py-4">
          
          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              {/* Monster Avatar - Clickable to change */}
              <button 
                onClick={() => setShowAvatarSelector(true)}
                className="relative group"
                title={t('avatar.selectAvatar')}
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
              <LocalizedLink 
                href="/edit-profile"
                className="flex items-center gap-2 px-3 py-2 bg-violet-100 hover:bg-violet-200 rounded-xl transition-colors"
              >
                <Edit3 size={18} className="text-violet-600" />
                <span className="text-sm font-medium text-violet-600 hidden sm:inline">{t('profilePage.edit')}</span>
              </LocalizedLink>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-orange-500">
                  <span>🔥</span>
                  <span className="text-xl font-bold">{userStats?.streak || 0}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('profilePage.streak')}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-500">
                  <Star size={18} className="fill-yellow-500" />
                  <span className="text-xl font-bold">{(userStats?.totalStars || 0).toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('profilePage.totalStars')}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-cyan-500">
                  <span>💎</span>
                  <span className="text-xl font-bold">{(userStats?.diamonds || 0).toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('profilePage.diamonds')}</p>
              </div>
            </div>
          </div>

          {/* Menu Sections */}
          <div className="space-y-4">
            
            {/* Learning Section */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <h2 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50">
                {t('profilePage.sections.learning')}
              </h2>
              <div className="divide-y divide-gray-100">
                <LocalizedLink href="/dashboard" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                  <span className="flex-1 font-medium text-gray-700">{t('common.dashboard')}</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </LocalizedLink>
                <LocalizedLink href="/learn" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📚</span>
                  </div>
                  <span className="flex-1 font-medium text-gray-700">{t('profilePage.menu.learn')}</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </LocalizedLink>
                <LocalizedLink href="/practice" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                  <span className="flex-1 font-medium text-gray-700">{t('common.practice')}</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </LocalizedLink>
                <LocalizedLink href="/compete" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🏆</span>
                  </div>
                  <span className="flex-1 font-medium text-gray-700">{t('common.compete')}</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </LocalizedLink>
                <LocalizedLink href="/leaderboard" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🏅</span>
                  </div>
                  <span className="flex-1 font-medium text-gray-700">{t('common.leaderboard')}</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </LocalizedLink>
              </div>
            </div>

            {/* Account Section */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <h2 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50">
                {t('profilePage.sections.account')}
              </h2>
              <div className="divide-y divide-gray-100">
                <LocalizedLink href="/pricing" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Crown size={20} className="text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-700">{t('profilePage.menu.upgrade')}</span>
                    {userTier === 'free' && (
                      <p className="text-xs text-violet-600">{t('profilePage.unlockFeatures')}</p>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </LocalizedLink>

                {(userTier === 'vip' || userTier === 'advanced') && (
                  <LocalizedLink href="/certificate" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Award size={20} className="text-amber-600" />
                    </div>
                    <span className="flex-1 font-medium text-gray-700">{t('profilePage.menu.certificate')}</span>
                    <ChevronRight size={20} className="text-gray-400" />
                  </LocalizedLink>
                )}

                <LocalizedLink href="/edit-profile" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <User size={20} className="text-cyan-600" />
                  </div>
                  <span className="flex-1 font-medium text-gray-700">{t('profilePage.menu.editProfile')}</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </LocalizedLink>
              </div>
            </div>

            {/* Admin Section - Only for admins */}
            {session.user?.role === 'admin' && (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <h2 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50">
                  {t('profilePage.sections.admin')}
                </h2>
                <div className="divide-y divide-gray-100">
                  <LocalizedLink href="/admin" className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Shield size={20} className="text-red-600" />
                    </div>
                    <span className="flex-1 font-medium text-gray-700">{t('profilePage.menu.admin')}</span>
                    <ChevronRight size={20} className="text-gray-400" />
                  </LocalizedLink>
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
                <span className="flex-1 font-medium text-red-600 text-left">{t('common.logout')}</span>
              </div>
            </button>

            {/* App version */}
            <p className="text-center text-xs text-gray-400 py-4">
              SoroKid v1.0.0
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
