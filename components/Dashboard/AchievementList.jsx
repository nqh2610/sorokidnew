'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * AchievementList - Badge Collection
 * OPTIMIZED: useMemo to avoid re-calculation on each render
 */

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #c084fc, #a855f7);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #a855f7, #9333ea);
  }
`;

// Màu sắc đa dạng - định nghĩa ngoài component để không tạo lại
const COLORS = [
  { bg: 'from-rose-400 to-pink-500', light: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
  { bg: 'from-violet-400 to-purple-500', light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
  { bg: 'from-blue-400 to-indigo-500', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  { bg: 'from-cyan-400 to-teal-500', light: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
  { bg: 'from-emerald-400 to-green-500', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  { bg: 'from-amber-400 to-orange-500', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  { bg: 'from-red-400 to-rose-500', light: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  { bg: 'from-fuchsia-400 to-pink-500', light: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700' },
];

// Helper: check unlocked - inline để tránh function call overhead
const isUnlocked = (a) => a.unlocked === true || a.isUnlocked === true || !!a.unlockedAt;

export default function AchievementList({ achievements, allAchievements }) {
  const { t, translateDb } = useI18n();
  const [filter, setFilter] = useState('unlocked');
  const [showAll, setShowAll] = useState(false);

  // Helper: Dịch achievement name và description
  const getAchievementName = (achievement) => {
    const translated = translateDb('achievements', `${achievement.id}.name`, achievement.name);
    return translated;
  };
  
  const getAchievementDescription = (achievement) => {
    const fallback = achievement.description || achievement.hint || '';
    return translateDb('achievements', `${achievement.id}.description`, fallback);
  };

  // Memoize tất cả computed values
  const { allItems, unlockedItems, lockedItems, unlockedCount, lockedCount, totalCount, progressPercent } = useMemo(() => {
    const { total = 0, unlocked = 0, progress = 0, recent = [], all = [] } = achievements || {};
    const items = all.length > 0 ? all : (allAchievements || recent || []);

    // Single pass để split unlocked/locked
    const unlck = [];
    const lckd = [];
    for (const item of items) {
      if (isUnlocked(item)) unlck.push(item);
      else lckd.push(item);
    }

    const uCount = unlocked || unlck.length;
    const tCount = total || items.length;

    return {
      allItems: items,
      unlockedItems: unlck,
      lockedItems: lckd,
      unlockedCount: uCount,
      lockedCount: tCount - uCount,
      totalCount: tCount,
      progressPercent: progress || (tCount > 0 ? Math.round((uCount / tCount) * 100) : 0)
    };
  }, [achievements, allAchievements]);

  // Memoize filtered + display items
  const displayItems = useMemo(() => {
    const filtered = filter === 'unlocked' ? unlockedItems : lockedItems;
    return showAll ? filtered : filtered.slice(0, 6);
  }, [filter, unlockedItems, lockedItems, showAll]);

  const filteredCount = filter === 'unlocked' ? unlockedItems.length : lockedItems.length;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          {t('dashboard.badges.title')}
        </h3>
        <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold shadow-sm">
          {unlockedCount}/{totalCount}
        </span>
      </div>

      {/* Progress bar - multi-color gradient */}
      <div className="mb-4">
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-500">{t('dashboard.badges.progress')}</span>
          <span className="text-purple-600 font-bold">{progressPercent}%</span>
        </div>
      </div>

      {/* Filter tabs - only 2 tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setFilter('unlocked'); setShowAll(false); }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
            filter === 'unlocked'
              ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          🏅 {t('dashboard.badges.unlocked')} ({unlockedCount})
        </button>
        <button
          onClick={() => { setFilter('locked'); setShowAll(false); }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
            filter === 'locked'
              ? 'bg-gradient-to-r from-violet-400 to-purple-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          🎯 {t('dashboard.badges.goal')} ({lockedCount})
        </button>
      </div>

      {/* Achievement Grid */}
      {displayItems.length > 0 ? (
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${showAll ? 'max-h-96 overflow-y-auto overflow-x-hidden custom-scrollbar' : ''}`}
          style={showAll ? { scrollbarWidth: 'thin', scrollbarColor: '#c084fc #f3f4f6' } : {}}
        >
          {displayItems.map((achievement, idx) => (
            <AchievementCard 
              key={achievement.id || idx} 
              achievement={achievement} 
              colorIndex={idx} 
              idx={idx} 
              t={t}
              getName={() => getAchievementName(achievement)}
              getDescription={() => getAchievementDescription(achievement)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          {filter === 'unlocked' ? (
            <>
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-gray-700 font-bold">{t('dashboard.badges.noBadges')}</p>
              <p className="text-gray-400 text-sm mt-1">{t('dashboard.badges.noBadgesHint')}</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-gray-700 font-bold">{t('dashboard.badges.excellent')}</p>
              <p className="text-gray-400 text-sm mt-1">{t('dashboard.badges.allBadges')}</p>
            </>
          )}
        </div>
      )}

      {/* Show more button */}
      {filteredCount > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-purple-600 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1 border border-gray-200"
        >
          {showAll ? (
            <>{t('dashboard.badges.collapse')} <ChevronUp size={16} /></>
          ) : (
            <>{t('dashboard.badges.showMore')} ({filteredCount - 6}) <ChevronDown size={16} /></>
          )}
        </button>
      )}
      </div>
    </>
  );
}

/**
 * AchievementCard - Gamified badge card with diverse colors
 * Mobile: click to open modal, Desktop: hover to show tooltip
 */
function AchievementCard({ achievement, colorIndex = 0, idx = 0, t, getName, getDescription }) {
  const [showModal, setShowModal] = useState(false);
  const color = COLORS[colorIndex % COLORS.length];
  const unlocked = isUnlocked(achievement);

  // Progress for locked
  const progressPercent = achievement.target > 0
    ? Math.round(((achievement.progress || 0) / achievement.target) * 100)
    : 0;

  // Translated name and description
  const name = getName ? getName() : achievement.name;
  const description = getDescription ? getDescription() : (achievement.description || achievement.hint || '');

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) setShowModal(false);
  };

  return (
    <>
      <div
        className={`group relative flex flex-col items-center p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
          unlocked
            ? `${color.light} ${color.border} border-2 hover:shadow-lg hover:scale-[1.03]`
            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
        }`}
        onClick={() => description && setShowModal(true)}
      >

      {/* Badge icon - hình tròn gradient */}
      <div className={`relative w-14 h-14 sm:w-16 sm:h-16 mb-2 rounded-full flex items-center justify-center shadow-lg ${
        unlocked
          ? `bg-gradient-to-br ${color.bg}`
          : 'bg-gradient-to-br from-gray-200 to-gray-300'
      }`}>
        {/* Shine effect */}
        {unlocked && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent" />
        )}
        <span className="text-2xl sm:text-3xl relative z-10">
          {unlocked ? (achievement.icon || '⭐') : '🔒'}
        </span>
      </div>

      {/* Badge name */}
      <h4 className={`font-bold text-xs sm:text-sm text-center leading-tight ${
        unlocked ? color.text : 'text-gray-400'
      }`}>
        {name}
      </h4>

      {/* Unlock date for unlocked */}
      {unlocked && achievement.unlockedAt && (
        <p className="text-[10px] text-gray-400 mt-1">
          {formatTimeAgo(new Date(achievement.unlockedAt), t)}
        </p>
      )}

      {/* Description + Progress for locked */}
      {!unlocked && (
        <>
          {description && (
            <p className="text-[10px] text-gray-400 text-center mt-1 line-clamp-2">
              {description}
            </p>
          )}
          {achievement.target > 0 && (
            <div className="w-full mt-2">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${color.bg} rounded-full transition-all`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-gray-400 text-center mt-0.5">
                {achievement.progress || 0}/{achievement.target}
              </div>
            </div>
          )}
        </>
      )}
      </div>

      {/* Modal showing detail - works well on all devices */}
      {showModal && description && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div
            className={`bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-5 py-4 bg-gradient-to-r ${unlocked ? color.bg : 'from-gray-300 to-gray-400'}`}>
              <h3 className="font-bold text-white text-lg drop-shadow-sm">{name}</h3>
              {unlocked && achievement.unlockedAt && (
                <p className="text-white/80 text-xs mt-1">
                  {t('dashboard.badges.achievedOn')} {formatTimeAgo(new Date(achievement.unlockedAt), t)}
                </p>
              )}
            </div>
            {/* Content */}
            <div className="px-5 py-4">
              <p className="text-gray-700 leading-relaxed">{description}</p>
              {!unlocked && achievement.target > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{t('dashboard.badges.progress')}</span>
                    <span className="font-bold">{achievement.progress || 0}/{achievement.target}</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${color.bg} rounded-full`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Close button */}
            <div className="px-5 pb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(false);
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-white bg-gradient-to-r ${unlocked ? color.bg : 'from-gray-400 to-gray-500'} hover:opacity-90 transition-opacity`}
              >
                {t('dashboard.badges.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper format time
function formatTimeAgo(date, t) {
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / 86400000);

  if (days === 0) return t('dashboard.badges.time.today');
  if (days === 1) return t('dashboard.badges.time.yesterday');
  if (days < 7) return `${days} ${t('dashboard.badges.time.daysAgo')}`;
  if (days < 30) return `${Math.floor(days/7)} ${t('dashboard.badges.time.weeksAgo')}`;
  return date.toLocaleDateString('vi-VN');
}
