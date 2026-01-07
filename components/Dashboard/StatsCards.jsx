'use client';

import { BookOpen, Target, CheckCircle } from 'lucide-react';

/**
 * StatsCards - 3 card thống kê: Học tập, Luyện tập, Thi đấu
 */
export default function StatsCards({ progress, exercise, compete, compact = false }) {
  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {/* Card Học tập */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3 text-white">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} />
            <span className="text-xs font-medium opacity-90">Học tập</span>
          </div>
          <div className="text-2xl font-bold">{progress?.completedLessons || 0}</div>
          <div className="text-xs opacity-80">bài đã học</div>
          <div className="text-xs opacity-70 mt-1">Đúng {progress?.avgAccuracy || 0}%</div>
        </div>

        {/* Card Luyện tập */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} />
            <span className="text-xs font-medium opacity-90">Luyện tập</span>
          </div>
          <div className="text-2xl font-bold">{exercise?.total || 0}</div>
          <div className="text-xs opacity-80">câu đã làm</div>
          <div className="text-xs opacity-70 mt-1">Đúng {exercise?.accuracy || 0}% • {exercise?.avgTime || 0}s/câu</div>
        </div>

        {/* Card Thi đấu */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-3 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🏆</span>
            <span className="text-xs font-medium opacity-90">Thi đấu</span>
          </div>
          <div className="text-2xl font-bold">{compete?.totalArenas || 0}</div>
          <div className="text-xs opacity-80">trận đã đấu</div>
          <div className="text-xs opacity-70 mt-1">Vào Top 3: {compete?.top3Count || 0} lần</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      {/* Card Học tập */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-bold">
              {progress?.completedLessons || 0}
            </div>
            <div className="text-sm opacity-90">bài đã học</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="opacity-80">Tiến độ hoàn thành</span>
            <span className="font-bold">{progress?.overallProgress || 0}%</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress?.overallProgress || 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs opacity-80 mt-2">
            <span>Tỷ lệ làm đúng trung bình</span>
            <span className="font-medium">{progress?.avgAccuracy || 0}%</span>
          </div>
        </div>
      </div>

      {/* Card Luyện tập */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Target size={24} />
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-bold">
              {exercise?.total || 0}
            </div>
            <div className="text-sm opacity-90">câu đã làm</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="opacity-80">Tỷ lệ làm đúng</span>
            <span className="font-bold">{exercise?.accuracy || 0}%</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${exercise?.accuracy || 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs opacity-80 mt-2">
            <span>Thời gian trung bình mỗi câu</span>
            <span className="font-medium">{exercise?.avgTime || 0} giây</span>
          </div>
          <div className="flex justify-between text-xs opacity-80">
            <span>Hôm nay đã làm</span>
            <span className="font-medium">
              {exercise?.today?.correct || 0}/{exercise?.today?.total || 0} câu đúng
            </span>
          </div>
        </div>
      </div>

      {/* Card Thi đấu */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <span className="text-2xl">🏆</span>
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-bold">
              {compete?.totalArenas || 0}
            </div>
            <div className="text-sm opacity-90">trận đã đấu</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-xl font-bold">{compete?.top3Count || 0}</div>
            <div className="text-xs opacity-80">Lần vào Top 3</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-xl font-bold">{compete?.bestCorrect || 0}</div>
            <div className="text-xs opacity-80">Câu đúng cao nhất</div>
          </div>
        </div>
      </div>
    </div>
  );
}
