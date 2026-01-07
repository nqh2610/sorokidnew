'use client';

import { useState, useCallback, useMemo } from 'react';
import ToolLayout from '@/components/ToolLayout/ToolLayout';

// Màu sắc cho các nhóm
const GROUP_COLORS = [
  { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700', header: 'bg-red-500' },
  { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', header: 'bg-blue-500' },
  { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700', header: 'bg-green-500' },
  { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', header: 'bg-yellow-500' },
  { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700', header: 'bg-purple-500' },
  { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-700', header: 'bg-pink-500' },
  { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-700', header: 'bg-indigo-500' },
  { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-700', header: 'bg-cyan-500' },
  { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', header: 'bg-orange-500' },
  { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-700', header: 'bg-teal-500' },
];

export default function ChiaNhomBocTham() {
  // Input
  const [inputText, setInputText] = useState('');
  const [names, setNames] = useState([]);
  
  // Mode: 'pick' for picking 1 person, 'group' for grouping
  const [mode, setMode] = useState('group');
  const [groupCount, setGroupCount] = useState(2);
  const [autoLeader, setAutoLeader] = useState(true);
  
  // Results
  const [pickedPerson, setPickedPerson] = useState(null);
  const [groups, setGroups] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Compute names count using useMemo (no re-render issues)
  const nameCount = useMemo(() => {
    return inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0).length;
  }, [inputText]);

  // Parse names from input (for actions only)
  const parseNames = useCallback(() => {
    const parsed = inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    setNames(parsed);
    return parsed;
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

  // Pick one person randomly
  const pickOnePerson = useCallback(() => {
    const nameList = parseNames();
    if (nameList.length === 0) return;

    setIsAnimating(true);
    setShowResults(false);
    setPickedPerson(null);

    // Animation: cycle through names quickly
    let count = 0;
    const totalAnimations = 20;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * nameList.length);
      setPickedPerson(nameList[randomIndex]);
      count++;

      if (count >= totalAnimations) {
        clearInterval(interval);
        // Final pick
        const finalIndex = Math.floor(Math.random() * nameList.length);
        setPickedPerson(nameList[finalIndex]);
        setIsAnimating(false);
        setShowResults(true);
      }
    }, 100);
  }, [parseNames]);

  // Divide into groups
  const divideIntoGroups = useCallback(() => {
    const nameList = parseNames();
    if (nameList.length === 0) return;

    setIsAnimating(true);
    setShowResults(false);
    setGroups([]);

    // Simulate animation delay
    setTimeout(() => {
      const shuffled = shuffleArray(nameList);
      const result = [];

      // Distribute evenly
      const baseSize = Math.floor(shuffled.length / groupCount);
      const remainder = shuffled.length % groupCount;

      let currentIndex = 0;
      for (let i = 0; i < groupCount; i++) {
        // Groups at the beginning get one extra member if there's remainder
        const size = baseSize + (i < remainder ? 1 : 0);
        const members = shuffled.slice(currentIndex, currentIndex + size);
        
        // If autoLeader, first member is leader
        const leader = autoLeader && members.length > 0 ? members[0] : null;
        
        result.push({
          id: i + 1,
          members,
          leader,
          color: GROUP_COLORS[i % GROUP_COLORS.length]
        });
        
        currentIndex += size;
      }

      setGroups(result);
      setIsAnimating(false);
      setShowResults(true);
    }, 500);
  }, [parseNames, groupCount, autoLeader, shuffleArray]);

  // Reset
  const handleReset = useCallback(() => {
    setPickedPerson(null);
    setGroups([]);
    setShowResults(false);
    setIsAnimating(false);
  }, []);

  // Clear all
  const handleClearAll = useCallback(() => {
    setInputText('');
    setNames([]);
    handleReset();
  }, [handleReset]);

  // Execute based on mode
  const handleExecute = useCallback(() => {
    if (mode === 'pick') {
      pickOnePerson();
    } else {
      divideIntoGroups();
    }
  }, [mode, pickOnePerson, divideIntoGroups]);

  return (
    <ToolLayout toolName="Chia Nhóm & Bốc Thăm" toolIcon="👥">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Panel: Input & Settings */}
        <div className="w-full lg:w-96 flex-shrink-0 space-y-4">
          {/* Input */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📝</span>
              Danh sách học sinh
            </h2>
            
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setShowResults(false);
              }}
              placeholder="Nhập mỗi dòng một tên học sinh:&#10;Ví dụ:&#10;Minh&#10;Lan&#10;Hùng&#10;Mai&#10;Tuấn"
              className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl text-lg
                focus:border-violet-400 focus:ring-2 focus:ring-violet-100 
                transition-all resize-none"
              disabled={isAnimating}
            />

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {nameCount > 0 ? `${nameCount} học sinh` : 'Chưa có tên nào'}
              </span>
              <button
                onClick={handleClearAll}
                className="text-red-500 hover:text-red-600 hover:underline"
                disabled={isAnimating}
              >
                Xóa tất cả
              </button>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              Chế độ
            </h3>
            
            <div className="space-y-3">
              <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 
                transition-all ${mode === 'pick' 
                  ? 'border-violet-400 bg-violet-50' 
                  : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'pick'}
                  onChange={() => { setMode('pick'); setShowResults(false); }}
                  className="w-5 h-5 text-violet-500"
                  disabled={isAnimating}
                />
                <div>
                  <span className="text-lg font-medium">🎲 Bốc thăm 1 người</span>
                  <p className="text-sm text-gray-500">Chọn ngẫu nhiên 1 học sinh</p>
                </div>
              </label>
              
              <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 
                transition-all ${mode === 'group' 
                  ? 'border-violet-400 bg-violet-50' 
                  : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'group'}
                  onChange={() => { setMode('group'); setShowResults(false); }}
                  className="w-5 h-5 text-violet-500"
                  disabled={isAnimating}
                />
                <div>
                  <span className="text-lg font-medium">👥 Chia nhóm</span>
                  <p className="text-sm text-gray-500">Chia thành nhiều nhóm ngẫu nhiên</p>
                </div>
              </label>
            </div>
          </div>

          {/* Group Settings - Only show when mode is 'group' */}
          {mode === 'group' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                Cài đặt chia nhóm
              </h3>
              
              {/* Group count */}
              <div className="mb-4">
                <label className="text-gray-700 mb-2 block">
                  Số nhóm: <span className="font-bold text-violet-600">{groupCount}</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={groupCount}
                  onChange={(e) => setGroupCount(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer
                    accent-violet-500"
                  disabled={isAnimating}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>2</span>
                  <span>10</span>
                </div>
              </div>

              {/* Auto leader */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoLeader}
                  onChange={(e) => setAutoLeader(e.target.checked)}
                  className="w-5 h-5 text-violet-500 rounded focus:ring-violet-400"
                  disabled={isAnimating}
                />
                <span className="text-gray-700">
                  👑 Tự động chọn nhóm trưởng
                </span>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 
                font-semibold rounded-xl transition-all disabled:opacity-50"
              disabled={isAnimating || (!pickedPerson && groups.length === 0)}
            >
              🔄 Làm lại
            </button>
            <button
              onClick={handleExecute}
              disabled={isAnimating || nameCount === 0}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-500 to-pink-500 
                hover:from-violet-600 hover:to-pink-600 text-white font-semibold 
                rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnimating 
                ? '⏳ Đang xử lý...' 
                : mode === 'pick' 
                  ? '🎲 BỐC THĂM!' 
                  : '👥 CHIA NHÓM!'
              }
            </button>
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="flex-1">
          {/* No results yet */}
          {!showResults && !isAnimating && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100 h-full 
              flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-8xl mb-6">
                {mode === 'pick' ? '🎲' : '👥'}
              </div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                {mode === 'pick' 
                  ? 'Sẵn sàng bốc thăm!' 
                  : 'Sẵn sàng chia nhóm!'
                }
              </h3>
              <p className="text-gray-400">
                Nhập danh sách và bấm nút để bắt đầu
              </p>
            </div>
          )}

          {/* Animating */}
          {isAnimating && mode === 'pick' && (
            <div className="bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl shadow-2xl p-12 
              text-center min-h-[400px] flex flex-col items-center justify-center">
              <div className="text-6xl mb-6 animate-bounce">🎲</div>
              <div className="text-5xl sm:text-7xl font-black text-white animate-pulse">
                {pickedPerson}
              </div>
            </div>
          )}

          {isAnimating && mode === 'group' && (
            <div className="bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl shadow-2xl p-12 
              text-center min-h-[400px] flex flex-col items-center justify-center">
              <div className="text-6xl mb-6 animate-spin">🔀</div>
              <div className="text-3xl font-bold text-white">
                Đang chia nhóm...
              </div>
            </div>
          )}

          {/* Pick Result */}
          {showResults && mode === 'pick' && pickedPerson && (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-bounceIn">
              {/* Celebration header */}
              <div className="bg-gradient-to-r from-violet-500 to-pink-500 p-8 text-center relative">
                {/* Confetti */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 rounded-full animate-confetti"
                      style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFEAA7', '#DDA0DD'][i % 5],
                        animationDelay: `${Math.random() * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
                
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-white/80">Người được chọn là:</h2>
              </div>
              
              {/* Result */}
              <div className="p-12 text-center">
                <div className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text 
                  bg-gradient-to-r from-violet-600 to-pink-600 mb-8">
                  {pickedPerson}
                </div>
                
                <button
                  onClick={pickOnePerson}
                  className="px-8 py-4 bg-gradient-to-r from-violet-500 to-pink-500 
                    text-white font-bold rounded-full text-xl hover:shadow-lg transition-all"
                >
                  🎲 Bốc lại
                </button>
              </div>
            </div>
          )}

          {/* Group Results */}
          {showResults && mode === 'group' && groups.length > 0 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  🎉 Kết quả chia {groups.length} nhóm
                </h2>
                <p className="text-gray-500">
                  Tổng cộng {names.length} học sinh
                </p>
              </div>

              <div className={`grid gap-4 ${
                groups.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
                groups.length <= 4 ? 'grid-cols-2' :
                'grid-cols-2 lg:grid-cols-3'
              }`}>
                {groups.map((group, index) => (
                  <div 
                    key={group.id}
                    className={`${group.color.bg} ${group.color.border} border-2 rounded-2xl 
                      overflow-hidden shadow-lg`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Group header */}
                    <div className={`${group.color.header} text-white p-4 flex items-center justify-between`}>
                      <h3 className="text-xl font-bold">
                        Nhóm {group.id}
                      </h3>
                      <span className="text-white/80">
                        {group.members.length} người
                      </span>
                    </div>
                    
                    {/* Members */}
                    <div className="p-4 space-y-2">
                      {group.members.map((member, memberIndex) => (
                        <div 
                          key={memberIndex}
                          className={`flex items-center gap-3 p-3 rounded-xl
                            ${member === group.leader 
                              ? 'bg-white shadow-md border-2 border-yellow-400' 
                              : 'bg-white/50'
                            }`}
                        >
                          {member === group.leader && (
                            <span className="text-2xl">👑</span>
                          )}
                          <span className={`text-lg font-medium ${group.color.text}
                            ${member === group.leader ? 'font-bold' : ''}`}>
                            {member}
                          </span>
                          {member === group.leader && (
                            <span className="text-xs bg-yellow-400 text-yellow-800 px-2 py-1 
                              rounded-full font-semibold ml-auto">
                              Nhóm trưởng
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Re-shuffle button */}
              <div className="text-center pt-4">
                <button
                  onClick={divideIntoGroups}
                  className="px-8 py-4 bg-gradient-to-r from-violet-500 to-pink-500 
                    text-white font-bold rounded-full text-xl hover:shadow-lg transition-all"
                >
                  🔀 Chia lại ngẫu nhiên
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(500%) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti 2s ease-out forwards;
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </ToolLayout>
  );
}
