'use client';

import { useState } from 'react';
import { Lock, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * AchievementList - Danh sách thành tích
 */
export default function AchievementList({ achievements, allAchievements }) {
  const [showAll, setShowAll] = useState(false);
  const { total = 0, unlocked = 0, progress = 0, recent = [] } = achievements || {};
  
  // Danh sách tất cả thành tích (từ props hoặc từ recent)
  const allItems = allAchievements || recent;
  // Hiển thị 5 item khi thu gọn, tất cả khi mở rộng
  const displayItems = showAll ? allItems : recent.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🏅</span>
          Thành tích
        </h3>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
          {unlocked}/{total}
        </span>
      </div>

      {/* Progress bar tổng */}
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-sm text-gray-500 mt-1">{progress}% hoàn thành</div>
      </div>

      {displayItems.length > 0 ? (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600 mb-2">
            {showAll ? `Tất cả thành tích (${unlocked}):` : 'Mở khóa gần đây:'}
          </div>
          <div className={showAll ? "space-y-2 max-h-80 overflow-y-auto" : "space-y-2"}>
            {displayItems.map((achievement) => (
              <div 
                key={achievement.id}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200"
              >
                <div className="text-2xl flex-shrink-0">
                  {achievement.icon || '🏆'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm truncate">{achievement.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{achievement.description}</p>
                </div>
                {!showAll && achievement.unlockedAt && (
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {formatTimeAgo(new Date(achievement.unlockedAt))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Lock size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Chưa có thành tích nào</p>
          <p className="text-xs text-gray-400 mt-1">Hoàn thành bài học để mở khóa!</p>
        </div>
      )}

      {/* Nút xem tất cả / thu gọn */}
      {unlocked > 5 && (
        <button 
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2 text-purple-600 text-sm font-medium hover:bg-purple-50 rounded-xl transition-colors flex items-center justify-center gap-1"
        >
          {showAll ? (
            <>Thu gọn <ChevronUp size={16} /></>
          ) : (
            <>Xem tất cả ({unlocked}) <ChevronDown size={16} /></>
          )}
        </button>
      )}
    </div>
  );
}

// Helper function để format thời gian
function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}
