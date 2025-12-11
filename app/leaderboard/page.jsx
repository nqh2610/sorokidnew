'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { LevelBadgeInline } from '@/components/LevelBadge/LevelBadge';

export default function LeaderboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchLeaderboard();
    }
  }, [status, router]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="text-5xl sm:text-6xl animate-spin">🧮</div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base font-bold">Quay lại</span>
          </button>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-xl">
            <div className="text-6xl sm:text-7xl mb-4">🏆</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Chưa có dữ liệu</h2>
            <p className="text-sm sm:text-base text-gray-600">Hãy bắt đầu luyện tập để xuất hiện trên bảng xếp hạng!</p>
          </div>
        </div>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3, 10);

  const podiumHeights = {
    0: 'h-32 sm:h-40',  // 1st place
    1: 'h-24 sm:h-32',  // 2nd place
    2: 'h-16 sm:h-24'   // 3rd place
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base font-bold">Quay lại</span>
        </button>

        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-orange-600">
            🏆 Bảng Xếp Hạng 🏆
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Top học viên xuất sắc nhất</p>
        </div>

        {/* Top 3 Podium */}
        <div className="mb-6 sm:mb-8 flex items-end justify-center gap-2 sm:gap-4">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="flex-1 max-w-xs">
              <div className="bg-gradient-to-br from-gray-200 to-gray-400 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-xl">
                <div className="text-4xl sm:text-6xl mb-2 sm:mb-3">🥈</div>
                <div className="text-lg sm:text-xl font-bold text-gray-800 truncate" title={top3[1].name}>
                  {top3[1].name}
                </div>
                <div className="my-2">
                  <LevelBadgeInline totalStars={top3[1].totalStars || 0} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-700">⭐ {(top3[1].totalStars || 0).toLocaleString()}</div>
              </div>
              <div className={`${podiumHeights[1]} bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-2xl sm:rounded-t-3xl mt-2`} />
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div className="flex-1 max-w-xs">
              <div className="bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-2xl relative">
                <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 animate-bounce text-3xl sm:text-4xl">
                  👑
                </div>
                <div className="text-5xl sm:text-7xl mb-2 sm:mb-3">🏆</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-800 truncate" title={top3[0].name}>
                  {top3[0].name}
                </div>
                <div className="my-2">
                  <LevelBadgeInline totalStars={top3[0].totalStars || 0} />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-yellow-800">⭐ {(top3[0].totalStars || 0).toLocaleString()}</div>
              </div>
              <div className={`${podiumHeights[0]} bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-t-2xl sm:rounded-t-3xl mt-2`} />
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="flex-1 max-w-xs">
              <div className="bg-gradient-to-br from-orange-200 to-orange-400 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-xl">
                <div className="text-4xl sm:text-6xl mb-2 sm:mb-3">🥉</div>
                <div className="text-lg sm:text-xl font-bold text-gray-800 truncate" title={top3[2].name}>
                  {top3[2].name}
                </div>
                <div className="my-2">
                  <LevelBadgeInline totalStars={top3[2].totalStars || 0} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-orange-700">⭐ {(top3[2].totalStars || 0).toLocaleString()}</div>
              </div>
              <div className={`${podiumHeights[2]} bg-gradient-to-b from-orange-300 to-orange-500 rounded-t-2xl sm:rounded-t-3xl mt-2`} />
            </div>
          )}
        </div>

        {/* Top 4-10 */}
        {rest.length > 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 sm:p-6 text-white">
              <h3 className="text-xl sm:text-2xl font-bold">Top 10</h3>
            </div>
            <div className="divide-y">
              {rest.map((player, i) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                      {i + 4}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-base sm:text-lg text-gray-800 truncate" title={player.name}>
                        {player.name}
                      </div>
                      <LevelBadgeInline totalStars={player.totalStars || 0} />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-purple-600 flex-shrink-0">
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
