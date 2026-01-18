'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import ToolLayout, { useFullscreen } from '@/components/ToolLayout/ToolLayout';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useGameSettings } from '@/lib/useGameSettings';
import { GAME_IDS } from '@/lib/gameStorage';

// Màu sắc cho các nhóm
const GROUP_COLORS = [
  { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700', header: 'bg-red-500', accent: '#ef4444' },
  { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', header: 'bg-blue-500', accent: '#3b82f6' },
  { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700', header: 'bg-green-500', accent: '#22c55e' },
  { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', header: 'bg-yellow-500', accent: '#eab308' },
  { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700', header: 'bg-purple-500', accent: '#a855f7' },
  { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-700', header: 'bg-pink-500', accent: '#ec4899' },
  { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-700', header: 'bg-indigo-500', accent: '#6366f1' },
  { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-700', header: 'bg-cyan-500', accent: '#06b6d4' },
  { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', header: 'bg-orange-500', accent: '#f97316' },
  { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-700', header: 'bg-teal-500', accent: '#14b8a6' },
];

// Default settings
const DEFAULT_SETTINGS = {
  txt: '',        // inputText
  dm: 'byGroup',  // divideMode
  gc: 2,          // groupCount
  ppg: 3,         // personsPerGroup
  al: 1,          // autoLeader
};

export default function ChiaNhom() {
  const { t } = useI18n();
  return (
    <ToolLayout toolName={t('toolbox.tools.groupMaker.name')} toolIcon="👥">
      <ChiaNhomContent />
    </ToolLayout>
  );
}

function ChiaNhomContent() {
  const { t } = useI18n();
  const { exitFullscreen } = useFullscreen();
  
  // Load settings
  const { settings, updateSettings } = useGameSettings(GAME_IDS.CHIA_NHOM, DEFAULT_SETTINGS);
  
  // Input
  const [inputText, setInputText] = useState(settings.txt);
  
  // Mode: 'byGroup' = chia theo số nhóm, 'byPerson' = chia theo số người/nhóm
  const [divideMode, setDivideMode] = useState(settings.dm);
  const [groupCount, setGroupCount] = useState(settings.gc);
  const [personsPerGroup, setPersonsPerGroup] = useState(settings.ppg);
  const [autoLeader, setAutoLeader] = useState(settings.al === 1);
  
  // Results
  const [groups, setGroups] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Sync settings khi thay đổi
  useEffect(() => {
    updateSettings({
      txt: inputText,
      dm: divideMode,
      gc: groupCount,
      ppg: personsPerGroup,
      al: autoLeader ? 1 : 0,
    });
  }, [inputText, divideMode, groupCount, personsPerGroup, autoLeader, updateSettings]);

  // Compute names count
  const nameCount = useMemo(() => {
    return inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0).length;
  }, [inputText]);

  // Parse names from input
  const parseNames = useCallback(() => {
    return inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }, [inputText]);

  // Shuffle array (Fisher-Yates)
  const shuffleArray = useCallback((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Calculate actual group count based on mode
  const getActualGroupCount = useCallback(() => {
    if (divideMode === 'byGroup') {
      return groupCount;
    } else {
      // Chia theo số người/nhóm
      return Math.ceil(nameCount / personsPerGroup);
    }
  }, [divideMode, groupCount, personsPerGroup, nameCount]);

  // Divide into groups
  const divideIntoGroups = useCallback(() => {
    const nameList = parseNames();
    if (nameList.length === 0) return;

    setIsAnimating(true);
    setShowResults(false);
    setGroups([]);

    // Animation delay with shuffle effect
    setTimeout(() => {
      const shuffled = shuffleArray(nameList);
      const result = [];
      const actualGroupCount = getActualGroupCount();

      if (divideMode === 'byGroup') {
        // Chia theo số nhóm
        const baseSize = Math.floor(shuffled.length / actualGroupCount);
        const remainder = shuffled.length % actualGroupCount;

        let currentIndex = 0;
        for (let i = 0; i < actualGroupCount; i++) {
          const size = baseSize + (i < remainder ? 1 : 0);
          const members = shuffled.slice(currentIndex, currentIndex + size);
          
          const leader = autoLeader && members.length > 0 ? members[0] : null;
          
          result.push({
            id: i + 1,
            members,
            leader,
            color: GROUP_COLORS[i % GROUP_COLORS.length]
          });
          
          currentIndex += size;
        }
      } else {
        // Chia theo số người/nhóm
        let currentIndex = 0;
        let groupId = 1;
        
        while (currentIndex < shuffled.length) {
          const members = shuffled.slice(currentIndex, currentIndex + personsPerGroup);
          const leader = autoLeader && members.length > 0 ? members[0] : null;
          
          result.push({
            id: groupId,
            members,
            leader,
            color: GROUP_COLORS[(groupId - 1) % GROUP_COLORS.length]
          });
          
          currentIndex += personsPerGroup;
          groupId++;
        }
      }

      setGroups(result);
      setIsAnimating(false);
      setShowResults(true);
    }, 800);
  }, [parseNames, shuffleArray, getActualGroupCount, divideMode, personsPerGroup, autoLeader]);

  // Reset
  const handleReset = useCallback(() => {
    exitFullscreen();
    setGroups([]);
    setShowResults(false);
    setIsAnimating(false);
  }, [exitFullscreen]);

  // Clear all
  const handleClearAll = useCallback(() => {
    setInputText('');
    handleReset();
  }, [handleReset]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Left Panel: Input & Settings - Order 2 on mobile */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-3 lg:space-y-4 order-2 lg:order-1">
        {/* Input */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>📝</span>
            {t('toolbox.groupMaker.studentList')}
          </h2>
          
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setShowResults(false);
            }}
            placeholder={t('toolbox.groupMaker.placeholder')}
            className="w-full h-40 p-3 border-2 border-gray-200 rounded-xl text-base
              focus:border-violet-400 focus:ring-2 focus:ring-violet-100 
              transition-all resize-none"
            disabled={isAnimating}
          />

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className={`font-medium ${nameCount > 0 ? 'text-violet-600' : 'text-gray-400'}`}>
              {nameCount > 0 ? t('toolbox.groupMaker.studentCount', { count: nameCount }) : t('toolbox.groupMaker.noNames')}
            </span>
            <button
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-600 hover:underline text-sm"
              disabled={isAnimating}
            >
              {t('toolbox.groupMaker.clearAll')}
            </button>
          </div>
        </div>

        {/* Divide Mode Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
            {t('toolbox.groupMaker.divideMethod')}
          </h3>
          
          <div className="space-y-2">
            <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 
              transition-all ${divideMode === 'byGroup' 
                ? 'border-violet-400 bg-violet-50' 
                : 'border-gray-200 hover:border-gray-300'}`}>
              <input
                type="radio"
                name="divideMode"
                checked={divideMode === 'byGroup'}
                onChange={() => setDivideMode('byGroup')}
                className="w-4 h-4 text-violet-500"
                disabled={isAnimating}
              />
              <div>
                <span className="font-medium">{t('toolbox.groupMaker.byGroup')}</span>
                <p className="text-xs text-gray-500">{t('toolbox.groupMaker.byGroupDesc')}</p>
              </div>
            </label>
            
            <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 
              transition-all ${divideMode === 'byPerson' 
                ? 'border-violet-400 bg-violet-50' 
                : 'border-gray-200 hover:border-gray-300'}`}>
              <input
                type="radio"
                name="divideMode"
                checked={divideMode === 'byPerson'}
                onChange={() => setDivideMode('byPerson')}
                className="w-4 h-4 text-violet-500"
                disabled={isAnimating}
              />
              <div>
                <span className="font-medium">{t('toolbox.groupMaker.byPerson')}</span>
                <p className="text-xs text-gray-500">{t('toolbox.groupMaker.byPersonDesc')}</p>
              </div>
            </label>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
            {t('toolbox.groupMaker.settings')}
          </h3>
          
          {/* Group count / Persons per group */}
          {divideMode === 'byGroup' ? (
            <div className="mb-4">
              <label className="text-gray-700 mb-2 block text-sm">
                {t('toolbox.groupMaker.groupCount')} <span className="font-bold text-violet-600 text-lg">{groupCount}</span>
              </label>
              <input
                type="range"
                min="2"
                max="10"
                value={groupCount}
                onChange={(e) => setGroupCount(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer
                  accent-violet-500 tool-slider"
                disabled={isAnimating}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>2</span>
                <span>10</span>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <label className="text-gray-700 mb-2 block text-sm">
                {t('toolbox.groupMaker.personsPerGroup')} <span className="font-bold text-violet-600 text-lg">{personsPerGroup}</span>
              </label>
              <input
                type="range"
                min="2"
                max="8"
                value={personsPerGroup}
                onChange={(e) => setPersonsPerGroup(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer
                  accent-violet-500 tool-slider"
                disabled={isAnimating}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>2</span>
                <span>8</span>
              </div>
              {nameCount > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  → {t('toolbox.groupMaker.willHaveGroups', { count: Math.ceil(nameCount / personsPerGroup) })}
                </p>
              )}
            </div>
          )}

          {/* Auto leader */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoLeader}
              onChange={(e) => setAutoLeader(e.target.checked)}
              className="w-4 h-4 text-violet-500 rounded focus:ring-violet-400"
              disabled={isAnimating}
            />
            <span className="text-gray-700 text-sm">
              👑 {t('toolbox.groupMaker.autoLeader')}
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-gray-700 
              font-semibold rounded-xl transition-all disabled:opacity-50"
            disabled={isAnimating || groups.length === 0}
          >
            🔄 {t('toolbox.groupMaker.reset')}
          </button>
          <button
            onClick={divideIntoGroups}
            disabled={isAnimating || nameCount < 2}
            className="flex-1 py-3 px-4 min-h-[44px] bg-gradient-to-r from-violet-500 to-pink-500 
              hover:from-violet-600 hover:to-pink-600 text-white font-bold 
              rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg hover:shadow-xl"
          >
            {isAnimating ? `⏳ ${t('toolbox.groupMaker.dividing')}` : `👥 ${t('toolbox.groupMaker.divideButton')}`}
          </button>
        </div>
      </div>

      {/* Right Panel: Results - Order 1 on mobile */}
      <div className="flex-1 min-w-0 order-1 lg:order-2">
        {/* No results yet */}
        {!showResults && !isAnimating && (
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-12 text-center border border-gray-100 h-full 
            flex flex-col items-center justify-center min-h-[250px] lg:min-h-[400px]">
            <div className="text-5xl lg:text-8xl mb-4 lg:mb-6 animate-bounce">👥</div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-400 mb-2">
              {t('toolbox.groupMaker.readyTitle')}
            </h3>
            <p className="text-gray-400 text-sm lg:text-base">
              {t('toolbox.groupMaker.readyDesc')}
            </p>
          </div>
        )}

        {/* Animating */}
        {isAnimating && (
          <div className="bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl shadow-2xl p-6 lg:p-12 
            text-center min-h-[250px] lg:min-h-[400px] flex flex-col items-center justify-center">
            <div className="text-4xl lg:text-6xl mb-4 lg:mb-6 animate-spin">🔀</div>
            <div className="text-xl lg:text-3xl font-bold text-white mb-4">
              {t('toolbox.groupMaker.shuffling')}
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div 
                  key={i}
                  className="w-4 h-4 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Group Results */}
        {showResults && groups.length > 0 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <span>🎉</span>
                {t('toolbox.groupMaker.resultTitle', { count: groups.length })}
              </h2>
              <p className="text-gray-500 mt-1">
                {t('toolbox.groupMaker.totalStudents', { count: groups.reduce((sum, g) => sum + g.members.length, 0) })}
              </p>
            </div>

            {/* Groups Grid */}
            <div className={`grid gap-4 ${
              groups.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
              groups.length <= 4 ? 'grid-cols-2' :
              groups.length <= 6 ? 'grid-cols-2 lg:grid-cols-3' :
              'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              {groups.map((group, index) => (
                <div 
                  key={group.id}
                  className={`${group.color.bg} ${group.color.border} border-2 rounded-2xl 
                    overflow-hidden shadow-lg transform hover:scale-[1.02] transition-all`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Group header */}
                  <div className={`${group.color.header} text-white p-4 flex items-center justify-between`}>
                    <h3 className="text-xl font-bold">
                      {t('toolbox.groupMaker.groupNumber', { number: group.id })}
                    </h3>
                    <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                      {t('toolbox.groupMaker.personCount', { count: group.members.length })}
                    </span>
                  </div>
                  
                  {/* Members */}
                  <div className="p-4 space-y-2">
                    {group.members.map((member, memberIndex) => (
                      <div 
                        key={memberIndex}
                        className={`p-3 rounded-xl transition-all
                          ${member === group.leader 
                            ? 'bg-white shadow-md border-2 border-yellow-400' 
                            : 'bg-white/70 hover:bg-white'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          {member === group.leader && (
                            <span className="text-lg">👑</span>
                          )}
                          <span className={`text-base font-medium ${group.color.text}
                            ${member === group.leader ? 'font-bold' : ''}`}>
                            {member}
                          </span>
                        </div>
                        {member === group.leader && (
                          <div className="mt-1.5 ml-6">
                            <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r 
                              from-yellow-400 to-amber-400 text-amber-900 px-2.5 py-1 
                              rounded-full font-bold shadow-sm">
                              ⭐ {t('toolbox.groupMaker.teamLeader')}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Re-shuffle button */}
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={divideIntoGroups}
                className="px-8 py-4 bg-gradient-to-r from-violet-500 to-pink-500 
                  text-white font-bold rounded-full text-lg hover:shadow-xl transition-all
                  hover:from-violet-600 hover:to-pink-600"
              >
                🔀 {t('toolbox.groupMaker.reshuffleButton')}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
