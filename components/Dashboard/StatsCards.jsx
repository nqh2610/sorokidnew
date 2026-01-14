'use client';

import { BookOpen, Target, CheckCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * StatsCards - 3 stat cards: Study, Practice, Compete
 */
export default function StatsCards({ progress, exercise, compete, compact = false }) {
  const { t } = useI18n();
  
  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {/* Study Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3 text-white">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} />
            <span className="text-xs font-medium opacity-90">{t('dashboard.stats.study')}</span>
          </div>
          <div className="text-2xl font-bold">{progress?.completedLessons || 0}</div>
          <div className="text-xs opacity-80">{t('dashboard.stats.lessonsLearned')}</div>
          <div className="text-xs opacity-70 mt-1">{t('dashboard.stats.accuracy')} {progress?.avgAccuracy || 0}%</div>
        </div>

        {/* Practice Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} />
            <span className="text-xs font-medium opacity-90">{t('dashboard.stats.practice')}</span>
          </div>
          <div className="text-2xl font-bold">{exercise?.total || 0}</div>
          <div className="text-xs opacity-80">{t('dashboard.stats.questionsAnswered')}</div>
          <div className="text-xs opacity-70 mt-1">{t('dashboard.stats.accuracy')} {exercise?.accuracy || 0}% • {exercise?.avgTime || 0}s</div>
        </div>

        {/* Compete Card */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-3 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🏆</span>
            <span className="text-xs font-medium opacity-90">{t('dashboard.stats.compete')}</span>
          </div>
          <div className="text-2xl font-bold">{compete?.totalArenas || 0}</div>
          <div className="text-xs opacity-80">{t('dashboard.stats.matchesPlayed')}</div>
          <div className="text-xs opacity-70 mt-1">{t('dashboard.stats.top3Finishes')}: {compete?.top3Count || 0} {t('dashboard.stats.times')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      {/* Study Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-bold">
              {progress?.completedLessons || 0}
            </div>
            <div className="text-sm opacity-90">{t('dashboard.stats.lessonsLearned')}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="opacity-80">{t('dashboard.stats.completionProgress')}</span>
            <span className="font-bold">{progress?.overallProgress || 0}%</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress?.overallProgress || 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs opacity-80 mt-2">
            <span>{t('dashboard.stats.avgAccuracy')}</span>
            <span className="font-medium">{progress?.avgAccuracy || 0}%</span>
          </div>
        </div>
      </div>

      {/* Practice Card */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Target size={24} />
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-bold">
              {exercise?.total || 0}
            </div>
            <div className="text-sm opacity-90">{t('dashboard.stats.questionsAnswered')}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="opacity-80">{t('dashboard.stats.correctRate')}</span>
            <span className="font-bold">{exercise?.accuracy || 0}%</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${exercise?.accuracy || 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs opacity-80 mt-2">
            <span>{t('dashboard.stats.avgTimePerQuestion')}</span>
            <span className="font-medium">{exercise?.avgTime || 0} {t('dashboard.stats.seconds')}</span>
          </div>
          <div className="flex justify-between text-xs opacity-80">
            <span>{t('dashboard.stats.todayCompleted')}</span>
            <span className="font-medium">
              {exercise?.today?.correct || 0}/{exercise?.today?.total || 0} {t('dashboard.stats.questionsCorrect')}
            </span>
          </div>
        </div>
      </div>

      {/* Compete Card */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <span className="text-2xl">🏆</span>
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-bold">
              {compete?.totalArenas || 0}
            </div>
            <div className="text-sm opacity-90">{t('dashboard.stats.matchesPlayed')}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-xl font-bold">{compete?.top3Count || 0}</div>
            <div className="text-xs opacity-80">{t('dashboard.stats.top3Finishes')}</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-xl font-bold">{compete?.bestCorrect || 0}</div>
            <div className="text-xs opacity-80">{t('dashboard.stats.bestCorrect')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
