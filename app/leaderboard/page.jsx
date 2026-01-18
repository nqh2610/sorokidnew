'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar/TopBar';
import { LevelBadgeInline } from '@/components/LevelBadge/LevelBadge';
import { MonsterAvatar } from '@/components/MonsterAvatar';
import { useLocalizedUrl } from '@/components/LocalizedLink';
import { useI18n } from '@/lib/i18n/I18nContext';

export default function LeaderboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const localizeUrl = useLocalizedUrl();
  const { t } = useI18n();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to parse avatar index from database
  const getAvatarIndex = (user) => {
    if (!user?.avatar) return null;
    const parsed = parseInt(user.avatar, 10);
    return isNaN(parsed) ? null : parsed;
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(localizeUrl('/login'));
    } else if (status === 'authenticated') {
      fetchLeaderboard();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]); // 🔧 FIX: Chỉ depend on status để tránh re-fetch

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50">
        <div className="text-5xl sm:text-6xl animate-spin">🧮</div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50">
        <TopBar showStats={true} />
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-xl">
            <div className="text-6xl sm:text-7xl mb-4">🏆</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{t('leaderboardPage.noData')}</h2>
            <p className="text-sm sm:text-base text-gray-600">{t('leaderboardPage.startPractice')}</p>
          </div>
        </div>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3, 10);

  // Podium heights cho desktop
  const podiumHeights = {
    0: 'h-28 md:h-36',  // 1st place
    1: 'h-20 md:h-28',  // 2nd place
    2: 'h-14 md:h-20'   // 3rd place
  };

  // Podium order: [2nd, 1st, 3rd] cho desktop
  const podiumOrder = [1, 0, 2];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50">
      <TopBar showStats={true} />
      
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="text-center mb-5 sm:mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
            🏆 {t('leaderboardPage.title')} 🏆
          </h2>
          <p className="text-sm sm:text-base text-gray-600">{t('leaderboardPage.subtitle')}</p>
        </div>

        {/* Top 3 - Mobile: Vertical cards, Desktop: Podium */}
        <div className="mb-5 sm:mb-6 md:mb-8">
          
          {/* Mobile Layout: Vertical cards */}
          <div className="md:hidden space-y-3">
            {top3.map((player, index) => {
              const medals = ['🥇', '🥈', '🥉'];
              const bgColors = [
                'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400',
                'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400',
                'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-400'
              ];
              const textColors = ['text-yellow-700', 'text-gray-700', 'text-orange-700'];
              
              return (
                <div key={player.id} 
                  className={`${bgColors[index]} border-2 rounded-2xl p-3 flex items-center gap-3 shadow-lg`}>
                  {/* Rank */}
                  <div className="text-3xl flex-shrink-0">{medals[index]}</div>
                  
                  {/* Avatar */}
                  <MonsterAvatar 
                    seed={player.id || player.email}
                    avatarIndex={getAvatarIndex(player)}
                    size={48}
                    showBorder={false}
                  />
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 truncate">{player.name}</div>
                    <LevelBadgeInline totalStars={player.totalStars || 0} />
                  </div>
                  
                  {/* Stars */}
                  <div className={`text-lg font-bold ${textColors[index]} flex-shrink-0`}>
                    ⭐ {(player.totalStars || 0).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Layout: Podium */}
          <div className="hidden md:flex items-end justify-center gap-3 lg:gap-4">
            {podiumOrder.map((playerIndex) => {
              const player = top3[playerIndex];
              if (!player) return null;
              
              const isFirst = playerIndex === 0;
              const isSecond = playerIndex === 1;
              
              const podiumStyles = {
                0: {
                  card: 'bg-gradient-to-br from-yellow-200 to-yellow-400',
                  podium: 'bg-gradient-to-b from-yellow-400 to-yellow-600',
                  medal: '🏆',
                  medalSize: 'text-5xl lg:text-6xl',
                  textColor: 'text-yellow-800',
                  avatarSize: 60,
                  crown: true
                },
                1: {
                  card: 'bg-gradient-to-br from-gray-200 to-gray-400',
                  podium: 'bg-gradient-to-b from-gray-300 to-gray-400',
                  medal: '🥈',
                  medalSize: 'text-4xl lg:text-5xl',
                  textColor: 'text-gray-700',
                  avatarSize: 52,
                  crown: false
                },
                2: {
                  card: 'bg-gradient-to-br from-orange-200 to-orange-400',
                  podium: 'bg-gradient-to-b from-orange-300 to-orange-500',
                  medal: '🥉',
                  medalSize: 'text-4xl lg:text-5xl',
                  textColor: 'text-orange-700',
                  avatarSize: 52,
                  crown: false
                }
              };
              
              const style = podiumStyles[playerIndex];
              
              return (
                <div key={player.id} className={`flex-1 max-w-[200px] ${isFirst ? 'order-2' : isSecond ? 'order-1' : 'order-3'}`}>
                  <div className={`${style.card} rounded-2xl p-4 lg:p-5 text-center shadow-xl relative`}>
                    {/* Crown for 1st */}
                    {style.crown && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce text-2xl lg:text-3xl">
                        👑
                      </div>
                    )}
                    
                    {/* Medal */}
                    <div className={`${style.medalSize} mb-2`}>{style.medal}</div>
                    
                    {/* Avatar */}
                    <div className="flex justify-center mb-2">
                      <MonsterAvatar 
                        seed={player.id || player.email}
                        avatarIndex={getAvatarIndex(player)}
                        size={style.avatarSize}
                        showBorder={false}
                      />
                    </div>
                    
                    {/* Name */}
                    <div className="font-bold text-gray-800 truncate text-base lg:text-lg" title={player.name}>
                      {player.name}
                    </div>
                    
                    {/* Level Badge */}
                    <div className="my-1.5">
                      <LevelBadgeInline totalStars={player.totalStars || 0} />
                    </div>
                    
                    {/* Stars */}
                    <div className={`text-lg lg:text-xl font-bold ${style.textColor}`}>
                      ⭐ {(player.totalStars || 0).toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Podium */}
                  <div className={`${podiumHeights[playerIndex]} ${style.podium} rounded-t-2xl mt-2`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 4-10 */}
        {rest.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 sm:p-4 text-white">
              <h3 className="text-lg sm:text-xl font-bold">Top 4-10</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {rest.map((player, i) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Rank number */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full 
                    flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                    {i + 4}
                  </div>
                  
                  {/* Avatar */}
                  <MonsterAvatar 
                    seed={player.id || player.email}
                    avatarIndex={getAvatarIndex(player)}
                    size={40}
                    showBorder={false}
                  />
                  
                  {/* Name & Level */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base text-gray-800 truncate" title={player.name}>
                      {player.name}
                    </div>
                    <LevelBadgeInline totalStars={player.totalStars || 0} />
                  </div>
                  
                  {/* Stars */}
                  <div className="text-base sm:text-lg font-bold text-purple-600 flex-shrink-0">
                    ⭐ {(player.totalStars || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
