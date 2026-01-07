'use client';

import { Gift, CheckCircle, Clock } from 'lucide-react';

/**
 * QuestList - Danh sách nhiệm vụ đang hoạt động
 */
export default function QuestList({ quests, onClaimReward, compact = false }) {
  if (!quests?.active || quests.active.length === 0) {
    return (
      <div className={`bg-white rounded-2xl sm:rounded-3xl ${compact ? 'p-4' : 'p-6'} shadow-xl h-full`}>
        <h3 className={`${compact ? 'text-base' : 'text-lg sm:text-xl'} font-bold text-gray-800 mb-4 flex items-center gap-2`}>
          <span className={compact ? 'text-xl' : 'text-2xl'}>🎯</span>
          Nhiệm vụ hôm nay
        </h3>
        <div className={`text-center ${compact ? 'py-4' : 'py-8'} text-gray-500`}>
          <div className={compact ? 'text-3xl mb-2' : 'text-4xl mb-3'}>🎉</div>
          <p className={compact ? 'text-sm' : ''}>Bạn đã hoàn thành tất cả nhiệm vụ!</p>
        </div>
      </div>
    );
  }

  // Compact mode: Chỉ hiện max 3 nhiệm vụ, giao diện nhỏ gọn hơn
  const displayQuests = compact ? quests.active.slice(0, 3) : quests.active;

  return (
    <div className={`bg-white rounded-2xl sm:rounded-3xl ${compact ? 'p-4' : 'p-6'} shadow-xl h-full`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`${compact ? 'text-base' : 'text-lg sm:text-xl'} font-bold text-gray-800 flex items-center gap-2`}>
          <span className={compact ? 'text-xl' : 'text-2xl'}>🎯</span>
          Nhiệm vụ
        </h3>
        {quests.completedCount > 0 && (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium animate-pulse">
            {quests.completedCount} chờ nhận
          </span>
        )}
      </div>

      <div className={`space-y-${compact ? '2' : '3'}`}>
        {displayQuests.map((quest) => {
          const progressPercent = quest.target > 0 
            ? Math.min(Math.round((quest.progress / quest.target) * 100), 100)
            : 0;
          
          return (
            <div 
              key={quest.id}
              className={`${compact ? 'p-3' : 'p-4'} rounded-xl border-2 transition-all ${
                quest.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-100 hover:border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold text-gray-800 truncate ${compact ? 'text-sm' : ''}`}>{quest.title}</h4>
                    {quest.completed && (
                      <CheckCircle size={compact ? 14 : 18} className="text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  {!compact && (
                    <p className="text-sm text-gray-500 mt-1 truncate">{quest.description}</p>
                  )}
                </div>
                
                {/* Phần thưởng */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {quest.stars > 0 && (
                    <span className={`px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-lg ${compact ? 'text-xs' : 'text-sm'} font-medium`}>
                      ⭐{quest.stars}
                    </span>
                  )}
                  {quest.diamonds > 0 && (
                    <span className={`px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg ${compact ? 'text-xs' : 'text-sm'} font-medium`}>
                      💎{quest.diamonds}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2">
                <div className={`flex justify-between text-xs mb-1 ${compact ? 'text-gray-500' : 'text-gray-600'}`}>
                  <span>{quest.progress}/{quest.target}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className={`${compact ? 'h-1.5' : 'h-2'} bg-gray-200 rounded-full overflow-hidden`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      quest.completed 
                        ? 'bg-gradient-to-r from-green-400 to-green-500' 
                        : 'bg-gradient-to-r from-purple-400 to-purple-600'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Nút nhận thưởng */}
              {quest.completed && !quest.claimed && (
                <button
                  onClick={() => onClaimReward?.(quest.id)}
                  className={`mt-2 w-full ${compact ? 'py-1.5 text-xs' : 'py-2 text-sm'} bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl font-bold hover:from-green-500 hover:to-green-600 transition-all flex items-center justify-center gap-1`}
                >
                  <Gift size={compact ? 12 : 16} />
                  Nhận thưởng
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Xem thêm nếu compact và còn nhiệm vụ */}
      {compact && quests.totalActive > 3 && (
        <p className="text-center text-sm text-purple-600 mt-3 font-medium">
          +{quests.totalActive - 3} nhiệm vụ khác
        </p>
      )}
    </div>
  );
}
