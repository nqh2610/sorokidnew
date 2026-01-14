'use client';

import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * ActivityChart - 7-day activity chart
 * Shows stars earned each day of the week
 */
export default function ActivityChart({ data = [], compact = false }) {
  const { t } = useI18n();
  
  // Find max value for scaling
  const maxStars = Math.max(...data.map(d => d.stars), 1);
  
  // Total stars in 7 days
  const totalStars = data.reduce((sum, d) => sum + d.stars, 0);

  // Map short day names to full names using i18n
  const getDayFullName = (shortDay) => {
    const dayMap = {
      'CN': t('dashboard.activity.days.sun'),
      'T2': t('dashboard.activity.days.mon'),
      'T3': t('dashboard.activity.days.tue'), 
      'T4': t('dashboard.activity.days.wed'),
      'T5': t('dashboard.activity.days.thu'),
      'T6': t('dashboard.activity.days.fri'),
      'T7': t('dashboard.activity.days.sat')
    };
    return dayMap[shortDay] || shortDay;
  };

  if (compact) {
    return (
      <div className="flex items-end justify-between gap-2 h-24">
        {data.map((item, index) => {
          const height = maxStars > 0 ? (item.stars / maxStars) * 100 : 0;
          const isToday = item.isToday;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1" title={`${getDayFullName(item.day)}: ${item.stars} ${t('dashboard.activity.stars')}`}>
              <span className={`text-[10px] font-bold ${isToday ? 'text-purple-600' : 'text-gray-400'}`}>
                {item.stars > 0 ? `⭐${item.stars}` : ''}
              </span>
              <div className="w-full h-16 flex items-end justify-center">
                <div 
                  className={`w-full max-w-[24px] rounded-t transition-all duration-500 ${
                    isToday 
                      ? 'bg-gradient-to-t from-purple-600 to-purple-400' 
                      : item.stars > 0 
                        ? 'bg-gradient-to-t from-blue-400 to-blue-300'
                        : 'bg-gray-200'
                  }`}
                  style={{ 
                    height: `${Math.max(height, item.stars > 0 ? 15 : 8)}%`,
                    minHeight: '4px'
                  }}
                />
              </div>
              <span className={`text-xs ${isToday ? 'text-purple-600 font-bold' : 'text-gray-400'}`}>
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          {t('dashboard.activity.title')}
        </h3>
        <div className="text-right">
          <div className="text-sm text-gray-500">{t('dashboard.activity.total')}</div>
          <div className="text-lg font-bold text-yellow-500">⭐ {totalStars.toLocaleString()}</div>
        </div>
      </div>
      
      {/* Explanation */}
      <div 
        className="bg-blue-50 rounded-xl p-3 mb-4 text-sm text-blue-700"
        dangerouslySetInnerHTML={{ __html: `💡 ${t('dashboard.activity.explanation')}` }}
      />
      
      <div className="flex items-end justify-between gap-2 h-40 sm:h-48">
        {data.map((item, index) => {
          const height = maxStars > 0 ? (item.stars / maxStars) * 100 : 0;
          const isToday = item.isToday;
          
          return (
            <div 
              key={index} 
              className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
              title={`${getDayFullName(item.day)}: ${item.stars} ${t('dashboard.activity.stars')}`}
            >
              {/* Star count with ⭐ icon */}
              <div className="text-center">
                <span className={`text-xs sm:text-sm font-bold ${isToday ? 'text-purple-600' : 'text-gray-500'}`}>
                  {item.stars > 0 ? `⭐${item.stars.toLocaleString()}` : '-'}
                </span>
              </div>
              
              {/* Bar */}
              <div className="w-full h-28 sm:h-36 flex items-end justify-center">
                <div 
                  className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 group-hover:scale-105 ${
                    isToday 
                      ? 'bg-gradient-to-t from-purple-600 to-purple-400 shadow-lg shadow-purple-200' 
                      : item.stars > 0 
                        ? 'bg-gradient-to-t from-blue-500 to-blue-300'
                        : 'bg-gray-200'
                  }`}
                  style={{ 
                    height: `${Math.max(height, item.stars > 0 ? 10 : 5)}%`,
                    minHeight: '8px'
                  }}
                />
              </div>
              
              {/* Day label */}
              <div className="text-center">
                <span className={`text-xs sm:text-sm font-medium block ${
                  isToday ? 'text-purple-600 font-bold' : 'text-gray-500'
                }`}>
                  {item.day}
                </span>
                {isToday && (
                  <span className="text-[10px] text-purple-500 font-medium">{t('dashboard.activity.today')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-purple-600 to-purple-400"></div>
          <span className="text-gray-600">{t('dashboard.activity.today')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-blue-500 to-blue-300"></div>
          <span className="text-gray-600">{t('dashboard.activity.otherDays')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-200"></div>
          <span className="text-gray-600">{t('dashboard.activity.noActivity')}</span>
        </div>
      </div>
    </div>
  );
}
