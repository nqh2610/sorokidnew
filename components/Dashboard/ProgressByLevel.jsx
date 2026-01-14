'use client';

import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * ProgressByLevel - Learning progress by each lesson (Level = Lesson)
 * 
 * Structure:
 * - Level (1-18) = Lesson
 * - Lesson within Level = Section/Part of that lesson
 */
export default function ProgressByLevel({ progress, compact = false, showLessonNames = false }) {
  const { t } = useI18n();
  const lessons = progress?.lessons || [];
  const byLevel = progress?.byLevel || {};
  const levels = Object.keys(byLevel).sort((a, b) => parseInt(a) - parseInt(b));

  // Calculate completed lessons (levels)
  const completedLevels = levels.filter(levelId => byLevel[levelId].progress === 100).length;
  const totalLevels = levels.length;

  const levelColors = [
    'from-green-400 to-emerald-500',
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-orange-400 to-red-500'
  ];

  // Display by lesson with completion %
  if (showLessonNames && levels.length > 0) {
    const overallProgress = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

    return (
      <div className="space-y-4">
        {/* Overall progress bar - 18 lessons */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t('dashboard.progressByLevel.totalProgress')}</span>
            <span className="text-sm font-bold text-purple-600">{completedLevels}/{totalLevels} {t('dashboard.progressByLevel.lessonsCount')}</span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700 relative"
              style={{ width: `${overallProgress}%` }}
            >
              {overallProgress > 10 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white font-bold">
                  {overallProgress}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lesson list with completion % for each */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {levels.map((levelId, index) => {
            const levelData = byLevel[levelId];
            // Limit progress to max 100%
            const safeProgress = Math.min(levelData.progress || 0, 100);
            const isComplete = safeProgress === 100;
            const colorClass = levelColors[index % levelColors.length];
            
            return (
              <div 
                key={levelId}
                className={`relative rounded-xl overflow-hidden ${
                  isComplete 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 border border-gray-100'
                }`}
              >
                {/* Progress bar background */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-r ${
                    isComplete 
                      ? 'from-green-100 to-green-50' 
                      : 'from-gray-100 to-gray-50'
                  }`}
                  style={{ 
                    width: `${safeProgress}%`,
                    transition: 'width 0.5s ease-out'
                  }}
                />
                
                {/* Content */}
                <div className="relative flex items-center gap-3 p-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    isComplete 
                      ? 'bg-green-500 text-white' 
                      : safeProgress > 0
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isComplete ? '✓' : `${safeProgress}%`}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${
                      isComplete ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      {levelData.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {levelData.completed}/{levelData.total} {t('dashboard.progressByLevel.parts')} • ⭐ {levelData.maxStars || 18} {t('dashboard.progressByLevel.stars')}
                    </div>
                  </div>
                  
                  {isComplete && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-bold text-yellow-600">{levelData.totalStars}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback: Display by level (old style)
  if (levels.length === 0) {
    return compact ? null : (
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-xl">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📈</span>
          {t('dashboard.progressByLevel.title')}
        </h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-3">📚</div>
          <p>{t('dashboard.progressByLevel.noProgress')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('dashboard.progressByLevel.startLearning')}</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {levels.map((levelId, index) => {
          const levelData = byLevel[levelId];
          const safeProgress = Math.min(levelData.progress || 0, 100);
          const colorClass = levelColors[index % levelColors.length];
          
          return (
            <div key={levelId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-700">{levelData.name}</span>
                </span>
                <span className="text-gray-500">{safeProgress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500`}
                  style={{ width: `${safeProgress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">📈</span>
          {t('dashboard.progressByLevel.title')}
        </h3>
        <div className="text-sm text-gray-500">
          {completedLevels}/{totalLevels} {t('dashboard.progressByLevel.lessonsCount')}
        </div>
      </div>

      <div className="space-y-4">
        {levels.map((levelId, index) => {
          const levelData = byLevel[levelId];
          const safeProgress = Math.min(levelData.progress || 0, 100);
          const colorClass = levelColors[index % levelColors.length];
          
          return (
            <div key={levelId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700 text-sm sm:text-base">
                    {t('dashboard.progressByLevel.lesson')} {levelId}: {levelData.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">
                    {levelData.completed}/{levelData.total} {t('dashboard.progressByLevel.parts')}
                  </span>
                  <span className={`font-bold ${
                    safeProgress === 100 ? 'text-green-500' : 'text-gray-700'
                  }`}>
                    {safeProgress}%
                  </span>
                </div>
              </div>
              
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-700 relative`}
                  style={{ width: `${safeProgress}%` }}
                >
                  {safeProgress === 100 && (
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs">
                      ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Stats summary */}
              <div className="flex gap-4 text-xs text-gray-400">
                <span>⭐ {levelData.totalStars}/{levelData.maxStars || 18} {t('dashboard.progressByLevel.stars')}</span>
                <span>🎯 {levelData.avgAccuracy}% {t('dashboard.progressByLevel.accurate')}</span>
                {levelData.totalTime > 0 && (
                  <span>⏱️ {Math.round(levelData.totalTime / 60)} {t('dashboard.progressByLevel.minutes')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
