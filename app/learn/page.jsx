'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { PlayCircle, Lock, CheckCircle, Star, Clock, ChevronRight, BookOpen, Crown, Sparkles, ChevronLeft } from 'lucide-react';
import TopBar from '@/components/TopBar/TopBar';
import StarBadge from '@/components/Rewards/StarBadge';
import { useUpgradeModal } from '@/components/UpgradeModal';
import { useSwipeNavigation } from '@/lib/useSwipeNavigation';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useLocalizedUrl } from '@/components/LocalizedLink';
import { translateRecords, translateRecord } from '@/lib/i18n/dbTranslate';

// Fallback colors cho levels (nếu database không có)
const LEVEL_COLORS = {
  1: 'from-green-400 to-emerald-500',
  2: 'from-blue-400 to-blue-500',
  3: 'from-cyan-400 to-cyan-500',
  4: 'from-teal-400 to-teal-500',
  5: 'from-purple-400 to-purple-500',
  6: 'from-pink-400 to-pink-500',
  7: 'from-rose-400 to-rose-500',
  8: 'from-orange-400 to-orange-500',
  9: 'from-amber-400 to-amber-500',
  10: 'from-yellow-400 to-yellow-500',
  11: 'from-red-400 to-red-500',
  12: 'from-red-500 to-rose-600',
  13: 'from-indigo-400 to-indigo-500',
  14: 'from-indigo-500 to-blue-600',
  15: 'from-violet-400 to-violet-500',
  16: 'from-violet-500 to-purple-600',
  17: 'from-fuchsia-400 to-fuchsia-500',
  18: 'from-amber-500 to-orange-500',
};

// Tier info config (text loaded via i18n)
const TIER_CONFIG = {
  free: { color: 'from-gray-400 to-gray-500', icon: '🆓', maxLevel: 5 },
  basic: { color: 'from-blue-400 to-blue-600', icon: '⭐', maxLevel: 10 },
  advanced: { color: 'from-purple-500 to-pink-500', icon: '💎', maxLevel: 18 },
  vip: { color: 'from-amber-400 to-orange-500', icon: '👑', maxLevel: 18 }
};

// Helper to get tier info with i18n
const getTierInfo = (t) => ({
  free: { name: t('learn.tiers.free'), ...TIER_CONFIG.free },
  basic: { name: t('learn.tiers.basic'), ...TIER_CONFIG.basic },
  advanced: { name: t('learn.tiers.advanced'), ...TIER_CONFIG.advanced },
  vip: { name: t('learn.tiers.vip'), ...TIER_CONFIG.vip }
});

export default function LearnPage() {
  const { t, locale, dictionary, translateLevelName } = useI18n();
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const levelFromUrl = searchParams.get('level');
  const localizeUrl = useLocalizedUrl();
  
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levels, setLevels] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [userTier, setUserTier] = useState('free');
  const [maxLevel, setMaxLevel] = useState(5);
  
  // Refs cho auto-scroll tabs
  const tabsContainerRef = useRef(null);
  const tabRefs = useRef({});
  
  // Hook modal nâng cấp tinh tế
  const { showUpgradeModal, UpgradeModalComponent } = useUpgradeModal();

  // Navigation functions
  const goToPrevLevel = useCallback(() => {
    const currentIndex = levels.findIndex(l => l.id === selectedLevel);
    if (currentIndex > 0) {
      const prevLevel = levels[currentIndex - 1];
      if (prevLevel.isLocked) {
        showUpgradeModal({
          requiredTier: 'advanced',
          feature: `Level ${prevLevel.id}: ${translateLevelName(prevLevel.id, prevLevel.name)}`,
          currentTier: userTier
        });
      } else {
        setSelectedLevel(prevLevel.id);
      }
    }
  }, [levels, selectedLevel, userTier, showUpgradeModal, translateLevelName]);

  const goToNextLevel = useCallback(() => {
    const currentIndex = levels.findIndex(l => l.id === selectedLevel);
    if (currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1];
      if (nextLevel.isLocked) {
        showUpgradeModal({
          requiredTier: 'advanced',
          feature: `Level ${nextLevel.id}: ${translateLevelName(nextLevel.id, nextLevel.name)}`,
          currentTier: userTier
        });
      } else {
        setSelectedLevel(nextLevel.id);
      }
    }
  }, [levels, selectedLevel, userTier, showUpgradeModal, translateLevelName]);

  // Swipe hook - hỗ trợ cả touch và mouse
  const { swipeHandlers } = useSwipeNavigation(goToNextLevel, goToPrevLevel);

  // Auto-scroll tab vào view khi selectedLevel thay đổi
  useEffect(() => {
    if (selectedLevel && tabRefs.current[selectedLevel] && tabsContainerRef.current) {
      const tab = tabRefs.current[selectedLevel];
      const container = tabsContainerRef.current;
      
      // Tính toán vị trí để scroll tab vào giữa màn hình
      const tabRect = tab.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const scrollLeft = tab.offsetLeft - (containerRect.width / 2) + (tabRect.width / 2);
      
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      });
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(localizeUrl('/login'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]); // 🔧 FIX: Chỉ depend on status

  // Fetch levels từ database (re-fetch when locale changes to re-translate)
  useEffect(() => {
    if (status === 'authenticated') {
      fetchLevels();
    }
  }, [status, locale]);

  // Auto-select level từ URL query param
  useEffect(() => {
    if (levelFromUrl && levels.length > 0) {
      const levelId = parseInt(levelFromUrl, 10);
      const levelExists = levels.find(l => l.id === levelId);
      if (levelExists) {
        setSelectedLevel(levelId);
      }
    }
  }, [levelFromUrl, levels]);

  // Fetch lessons khi chọn level (re-fetch when locale changes)
  useEffect(() => {
    if (selectedLevel && status === 'authenticated') {
      fetchLessons(selectedLevel);
    }
  }, [selectedLevel, status, locale]);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/levels');
      const data = await res.json();
      if (data.levels) {
        // Translate levels based on current locale
        const translatedLevels = translateRecords(data.levels, dictionary, locale, 'levels', ['name', 'description']);
        setLevels(translatedLevels);
        setUserTier(data.userTier || 'free');
        setMaxLevel(data.maxLevel || 5);
        // Auto-select level từ URL hoặc level đầu tiên nếu chưa chọn
        if (!selectedLevel && translatedLevels.length > 0) {
          if (levelFromUrl) {
            const levelId = parseInt(levelFromUrl, 10);
            const levelExists = translatedLevels.find(l => l.id === levelId);
            if (levelExists) {
              setSelectedLevel(levelId);
            } else {
              setSelectedLevel(translatedLevels[0].id);
            }
          } else {
            setSelectedLevel(translatedLevels[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
    setLoading(false);
  };

  const fetchLessons = async (levelId) => {
    setLoadingLessons(true);
    try {
      const res = await fetch(`/api/lessons?levelId=${levelId}`);
      const data = await res.json();
      // Translate lessons - use composite key "levelId-lessonId"
      const translatedLessons = (data.lessons || []).map(lesson => {
        const key = `${lesson.levelId}-${lesson.lessonId}`;
        const translations = dictionary?.db?.lessons?.[key];
        if (locale !== 'vi' && translations) {
          return {
            ...lesson,
            title: translations.title || lesson.title,
            description: translations.description || lesson.description
          };
        }
        return lesson;
      });
      setLessons(translatedLessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
    setLoadingLessons(false);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="text-5xl animate-spin mb-4">🧮</div>
          <p className="text-gray-600">{t('learn.loading')}</p>
        </div>
      </div>
    );
  }

  const currentLevel = levels.find(l => l.id === selectedLevel);
  const currentLevelColor = currentLevel?.color || LEVEL_COLORS[selectedLevel] || 'from-purple-400 to-pink-500';
  const completedLessons = lessons.filter(l => l.completed).length;
  const maxStars = lessons.reduce((sum, l) => sum + (l.stars || 3), 0);
  const rawTotalStars = lessons.reduce((sum, l) => sum + (l.starsEarned || 0), 0);
  const totalStars = Math.min(rawTotalStars, maxStars);
  const TIER_INFO = getTierInfo(t);
  const tierInfo = TIER_INFO[userTier] || TIER_INFO.free;

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50"
      {...swipeHandlers}
    >
      {/* Unified TopBar */}
      <TopBar showStats={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Title */}
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">🎮 {t('learn.journeyTitle')}</h1>
            <p className="text-gray-600">{levels.length} {t('learn.levels')} • {t('learn.journeyDesc')}</p>
          </div>
        </div>

        {/* Level Selector - Horizontal Scroll */}
        <div className="mb-6 overflow-x-auto pb-2" ref={tabsContainerRef}>
          <div className="flex gap-2 min-w-max">
            {levels.map((level) => {
              const levelColor = level.color || LEVEL_COLORS[level.id] || 'from-gray-400 to-gray-500';
              const isLocked = level.isLocked;
              
              return (
                <button
                  key={level.id}
                  ref={(el) => { tabRefs.current[level.id] = el; }}
                  onClick={() => {
                    if (isLocked) {
                      showUpgradeModal({
                        requiredTier: 'advanced',
                        feature: `Level ${level.id}: ${translateLevelName(level.id, level.name)}`,
                        currentTier: userTier
                      });
                    } else {
                      setSelectedLevel(level.id);
                    }
                  }}
                  className={`relative flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                    isLocked
                      ? 'bg-white text-gray-400 shadow cursor-pointer hover:bg-gray-50'
                      : selectedLevel === level.id
                        ? `bg-gradient-to-r ${levelColor} text-white shadow-lg scale-105`
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                  }`}
                >
                  {isLocked && (
                    <div className="absolute -top-1 -right-1 bg-gray-500 rounded-full p-1 shadow z-10">
                      <Lock size={10} className="text-white" />
                    </div>
                  )}
                  <span className="text-xl">{level.icon}</span>
                  <span className="text-sm">{level.id}. {translateLevelName(level.id, level.name)}</span>
                  {/* Progress indicator */}
                  {!isLocked && level.progress > 0 && level.progress < 100 && (
                    <span className="text-xs bg-white/30 px-1.5 rounded-full">{level.progress}%</span>
                  )}
                  {!isLocked && level.progress === 100 && (
                    <CheckCircle size={14} className="text-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Level Info */}
        {currentLevel && (
          <div 
            className={`bg-gradient-to-r ${currentLevelColor} rounded-2xl p-4 sm:p-6 shadow-xl mb-6 text-white`}
          >
            {/* Swipe hint - mobile only */}
            <div className="lg:hidden text-center text-[10px] text-white/70 mb-1">
              {t('learn.swipeHintMobile')}
            </div>

            {/* Header: Icon + Title */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl sm:text-4xl">{currentLevel.icon}</span>
              <h2 className="text-lg sm:text-2xl font-bold flex-1">{t('learn.levelHeader', { level: selectedLevel, name: translateLevelName(selectedLevel, currentLevel.name) })}</h2>
            </div>
            
            {/* Stats Row - centered, không bị che */}
            <div className="flex items-center justify-center gap-6 mb-3">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">{completedLessons}/{lessons.length}</div>
                <div className="text-[10px] sm:text-xs text-white/80">{t('learn.missions')}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-bold">
                  <Star size={18} className="sm:w-5 sm:h-5" fill="white" />
                  {totalStars}/{maxStars}
                </div>
                <div className="text-[10px] sm:text-xs text-white/80">{t('learn.stars')}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-white/30 rounded-full h-2 sm:h-3">
              <div 
                className="bg-white rounded-full h-2 sm:h-3 transition-all duration-500 relative overflow-hidden"
                style={{ width: `${lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-white/80 mt-1.5 text-center">
              {completedLessons === lessons.length && lessons.length > 0 
                ? t('learn.levelComplete')
                : t('learn.missionsRemaining', { count: lessons.length - completedLessons })}
            </p>
            
            {/* Navigation: Arrows + Dots - mobile only */}
            <div className="lg:hidden flex items-center justify-center gap-2 mt-3">
              {/* Prev button */}
              <button 
                onClick={goToPrevLevel}
                disabled={levels.findIndex(l => l.id === selectedLevel) === 0}
                className={`p-2 rounded-full bg-white/20 transition-all ${
                  levels.findIndex(l => l.id === selectedLevel) === 0 ? 'opacity-30' : 'hover:bg-white/30 active:scale-90'
                }`}
              >
                <ChevronLeft size={18} className="text-white" />
              </button>
              
              {/* Dots - chỉ hiện 5 dots xung quanh current */}
              <div className="flex items-center gap-1.5">
                {(() => {
                  const currentIdx = levels.findIndex(l => l.id === selectedLevel);
                  const totalLevels = levels.length;
                  
                  // Hiện tối đa 5 dots
                  let startIdx = Math.max(0, currentIdx - 2);
                  let endIdx = Math.min(totalLevels - 1, startIdx + 4);
                  startIdx = Math.max(0, endIdx - 4);
                  
                  const dots = [];
                  
                  if (startIdx > 0) {
                    dots.push(<span key="start" className="text-white/50 text-xs">...</span>);
                  }
                  
                  for (let i = startIdx; i <= endIdx; i++) {
                    const level = levels[i];
                    dots.push(
                      <button
                        key={level.id}
                        onClick={() => {
                          if (level.isLocked) {
                            showUpgradeModal({
                              requiredTier: 'advanced',
                              feature: `Level ${level.id}: ${translateLevelName(level.id, level.name)}`,
                              currentTier: userTier
                            });
                          } else {
                            setSelectedLevel(level.id);
                          }
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          level.id === selectedLevel 
                            ? 'bg-white scale-125' 
                            : level.isLocked 
                              ? 'bg-white/30' 
                              : 'bg-white/60'
                        }`}
                      />
                    );
                  }
                  
                  if (endIdx < totalLevels - 1) {
                    dots.push(<span key="end" className="text-white/50 text-xs">...</span>);
                  }
                  
                  return dots;
                })()}
              </div>
              
              {/* Next button */}
              <button 
                onClick={goToNextLevel}
                disabled={levels.findIndex(l => l.id === selectedLevel) === levels.length - 1}
                className={`p-2 rounded-full bg-white/20 transition-all ${
                  levels.findIndex(l => l.id === selectedLevel) === levels.length - 1 ? 'opacity-30' : 'hover:bg-white/30 active:scale-90'
                }`}
              >
                <ChevronRight size={18} className="text-white" />
              </button>
            </div>
            
            {/* Level number indicator - mobile */}
            <div className="lg:hidden text-center text-xs text-white/70 mt-1">
              {levels.findIndex(l => l.id === selectedLevel) + 1} / {levels.length}
            </div>
          </div>
        )}

        {/* Lessons List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <BookOpen size={20} />
              {t('learn.missionList')}
            </h3>
          </div>
          
          {loadingLessons ? (
            <div className="p-8 text-center">
              <div className="text-4xl animate-spin inline-block">🧮</div>
              <p className="text-gray-500 mt-2">{t('learn.loadingMissions')}</p>
            </div>
          ) : currentLevel?.isLocked ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4 animate-bounce">✨</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('learn.discoverMore')}</h3>
              <p className="text-gray-500 mb-4">
                {t('learn.levelHasLessons')}
              </p>
              <button 
                onClick={() => showUpgradeModal({
                  requiredTier: 'advanced',
                  feature: `Level ${selectedLevel}: ${translateLevelName(selectedLevel, currentLevel.name)}`,
                  currentTier: userTier
                })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
              >
                <Sparkles size={20} />
                {t('learn.learnMore')}
              </button>
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🚧</div>
              {t('learn.missionsPreparing')}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lessons.map((lesson, index) => {
                const isLocked = index > 0 && !lessons[index - 1]?.completed && !lesson.completed;
                const isCompleted = lesson.completed;
                
                return (
                  <div
                    key={lesson.id}
                    className={`p-4 flex items-center gap-4 transition-all ${
                      isLocked 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-50 cursor-pointer hover:scale-[1.01]'
                    }`}
                    onClick={() => !isLocked && router.push(localizeUrl(`/learn/${lesson.levelId}/${lesson.lessonId}`))}
                  >
                    {/* Lesson Number */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      isCompleted 
                        ? 'bg-green-100 text-green-600' 
                        : isLocked 
                          ? 'bg-gray-100 text-gray-400'
                          : `bg-gradient-to-r ${currentLevelColor} text-white`
                    }`}>
                      {isCompleted ? <CheckCircle size={24} /> : isLocked ? <Lock size={20} /> : lesson.lessonId}
                    </div>
                    
                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
                        {isLocked ? '🔒 ' : '🎯 '}{lesson.title}
                      </h4>
                      <p className={`text-sm truncate ${isLocked ? 'text-gray-300' : 'text-gray-500'}`}>
                        {lesson.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock size={12} />
                          {lesson.duration || 15} {t('learn.minutes')}
                        </span>
                        {isCompleted ? (
                          <StarBadge 
                            stars={lesson.starsEarned || 0} 
                            size="xs" 
                            variant="earned"
                          />
                        ) : (
                          <span className="text-gray-400">{t('learn.starsAvailable', { count: lesson.stars || 3 })}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="flex items-center gap-1 text-green-500 font-bold text-sm">
                          <CheckCircle size={16} />
                          {t('learn.done')}
                        </div>
                      ) : isLocked ? (
                        <Lock size={20} className="text-gray-300" />
                      ) : (
                        <button className={`px-4 py-2 bg-gradient-to-r ${currentLevelColor} text-white rounded-lg font-bold text-sm flex items-center gap-1 hover:shadow-lg hover:scale-105 transition-all`}>
                          <PlayCircle size={16} />
                          {t('learn.play')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal nâng cấp tinh tế */}
      <UpgradeModalComponent />
    </div>
  );
}
