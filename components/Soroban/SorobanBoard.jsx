'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, Lightbulb, RotateCcw } from 'lucide-react';

// Cấu hình số cột - 9 cột cho số lên đến hàng trăm triệu
const NUM_COLUMNS = 9;
const COLUMN_LABELS = ['Tr.Tr', 'Ch.Tr', 'Triệu', 'Tr.N', 'Ch.N', 'Nghìn', 'Trăm', 'Chục', 'Đ.vị'];

export default function SorobanBoard({ 
  targetNumber, 
  mode = 'free', 
  onCorrect, 
  onValueChange, 
  showHints = true, 
  compact = false, 
  resetKey,
  highlightColumn = null, // Cột đang được highlight trong tutorial mode
  tutorialMode = false,   // Có đang ở tutorial mode không
  tutorialBeads = null    // Trạng thái hạt từ tutorial (nếu có)
}) {
  // State cho hạt: mỗi cột có [heavenBead, earth1, earth2, earth3, earth4]
  // true = hạt đã được đẩy về thanh ngang (đang đếm)
  // false = hạt ở vị trí nghỉ (không đếm)
  // Heaven: true = đẩy xuống (đếm 5), false = ở trên (không đếm)
  // Earth: true = đẩy lên (đếm 1), false = ở dưới (không đếm)
  const [beads, setBeads] = useState(
    Array(NUM_COLUMNS).fill(null).map(() => [false, false, false, false, false])
  );
  const [currentNumber, setCurrentNumber] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [hint, setHint] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  // Reset bàn tính khi chuyển bài (targetNumber hoặc resetKey thay đổi)
  useEffect(() => {
    setBeads(Array(NUM_COLUMNS).fill(null).map(() => [false, false, false, false, false]));
    setCurrentNumber(0);
    setHint('');
    setIsCorrect(false);
  }, [targetNumber, resetKey]);

  const tutorials = [
    {
      title: 'Chào mừng đến với Soroban!',
      description: 'Bàn tính Soroban có 9 cột, mỗi cột đại diện cho một hàng số từ đơn vị đến trăm triệu.',
      highlight: null
    },
    {
      title: 'Hạt trên (Heaven Bead)',
      description: 'Hạt màu đỏ ở trên có giá trị là 5. Click vào để đẩy xuống.',
      highlight: 'heaven'
    },
    {
      title: 'Hạt dưới (Earth Beads)',
      description: 'Mỗi hạt màu vàng ở dưới có giá trị là 1. Click vào để đẩy lên.',
      highlight: 'earth'
    },
    {
      title: 'Thử tạo số!',
      description: 'Hãy thử tạo số 3 bằng cách đẩy 3 hạt dưới lên ở cột đơn vị (cột phải cùng).',
      highlight: null
    }
  ];

  useEffect(() => {
    const total = calculateTotalValue();
    setCurrentNumber(total);

    // Gọi callback khi giá trị thay đổi
    if (onValueChange) {
      onValueChange(total);
    }

    if (mode === 'practice' && targetNumber !== undefined) {
      if (total === targetNumber) {
        setIsCorrect(true);
        if (onCorrect) {
          setTimeout(() => onCorrect(), 500);
        }
      } else {
        setIsCorrect(false);
      }
    }
  }, [beads, mode, targetNumber, onCorrect, onValueChange]);

  // Cập nhật beads từ tutorialBeads khi ở tutorial mode
  useEffect(() => {
    if (tutorialMode && tutorialBeads) {
      setBeads(tutorialBeads);
    }
  }, [tutorialMode, tutorialBeads]);

  const calculateValue = (col) => {
    // Heaven bead: nếu true (đẩy xuống) = 5
    const heaven = beads[col][0] ? 5 : 0;
    // Earth beads: đếm số hạt true (đã đẩy lên)
    const earth = beads[col].slice(1).filter(b => b).length;
    return heaven + earth;
  };

  const calculateTotalValue = () => {
    let total = 0;
    for (let i = 0; i < NUM_COLUMNS; i++) {
      total += calculateValue(i) * Math.pow(10, NUM_COLUMNS - 1 - i);
    }
    return total;
  };

  const toggleBead = (col, row) => {
    const newBeads = beads.map(c => [...c]);
    
    if (row === 0) {
      // Heaven bead - toggle đơn giản
      newBeads[col][0] = !newBeads[col][0];
    } else {
      // Earth beads - logic Soroban thực tế
      // Hạt được đánh số 1-4 từ trên xuống (gần thanh ngang đến xa)
      const isUp = beads[col][row]; // Hạt này đang ở trên (đã đẩy lên)?
      
      if (isUp) {
        // Đang ở trên → đẩy xuống: hạt này và tất cả hạt DƯỚI nó cũng phải xuống
        for (let i = row; i <= 4; i++) {
          newBeads[col][i] = false;
        }
      } else {
        // Đang ở dưới → đẩy lên: hạt này và tất cả hạt TRÊN nó cũng phải lên
        for (let i = 1; i <= row; i++) {
          newBeads[col][i] = true;
        }
      }
    }
    setBeads(newBeads);
  };

  const reset = () => {
    setBeads(Array(NUM_COLUMNS).fill(null).map(() => [false, false, false, false, false]));
    setCurrentNumber(0);
    setHint('');
    setIsCorrect(false);
  };

  const showHintForTarget = () => {
    if (targetNumber === undefined) {
      setHint('Hãy thử tạo các số khác nhau bằng cách click vào các hạt!');
      return;
    }

    const digits = targetNumber.toString().padStart(NUM_COLUMNS, '0').split('').map(Number);
    const colIndex = NUM_COLUMNS - 1; // Start with units column
    const digit = digits[colIndex];

    if (digit === 0) {
      setHint('Đảm bảo tất cả hạt ở vị trí ban đầu cho số 0');
    } else if (digit <= 4) {
      setHint(`Đẩy ${digit} hạt dưới lên ở cột đơn vị`);
    } else if (digit === 5) {
      setHint('Đẩy hạt trên xuống ở cột đơn vị');
    } else {
      setHint(`Đẩy hạt trên xuống và ${digit - 5} hạt dưới lên ở cột đơn vị`);
    }
  };

  const nextTutorialStep = () => {
    if (tutorialStep < tutorials.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
      setTutorialStep(0);
    }
  };

  const prevTutorialStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(prev => prev - 1);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-50 rounded-3xl flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl p-8 max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {tutorials[tutorialStep].title}
              </h3>
              <p className="text-gray-600">{tutorials[tutorialStep].description}</p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={prevTutorialStep}
                disabled={tutorialStep === 0}
                className="px-6 py-3 bg-gray-200 rounded-full font-bold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quay lại
              </button>

              <div className="flex gap-2">
                {tutorials.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === tutorialStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTutorialStep}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-bold hover:shadow-lg transition-all"
              >
                {tutorialStep === tutorials.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Soroban Board - All in one container */}
        <div className={`relative bg-gradient-to-b from-amber-800 to-amber-900 shadow-xl ${compact ? 'rounded-xl p-2' : 'rounded-2xl p-3 sm:p-4'}`}>
          {/* Frame decoration */}
          <div className={`absolute inset-0 border-4 border-amber-950/50 pointer-events-none z-20 ${compact ? 'rounded-xl' : 'rounded-2xl'}`}></div>
          
          {/* Header inside board */}
          <div className={`relative z-10 flex items-center justify-between gap-2 ${compact ? 'mb-2' : 'mb-3'} bg-amber-900/50 rounded-lg px-2 py-1`}>
            <div className="flex items-center gap-2">
              <div className={`bg-white/95 rounded-lg shadow ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}>
                <div className={`font-black ${
                  isCorrect ? 'text-green-600' : 'text-amber-700'
                } ${compact ? 'text-lg' : 'text-xl sm:text-2xl'}`}>
                  {currentNumber.toLocaleString('vi-VN')}
                </div>
              </div>
              {isCorrect && <span className="text-lg">✅</span>}
            </div>

            <div className="flex gap-1">
              {showHints && !compact && (
                <>
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 active:scale-95 transition-colors"
                    title="Hướng dẫn"
                  >
                    <HelpCircle size={14} />
                  </button>
                  <button
                    onClick={showHintForTarget}
                    className="p-1 bg-amber-500 text-white rounded hover:bg-amber-600 active:scale-95 transition-colors"
                    title="Gợi ý"
                  >
                    <Lightbulb size={14} />
                  </button>
                </>
              )}
              <button
                onClick={reset}
                className={`bg-purple-500 text-white rounded hover:bg-purple-600 active:scale-95 transition-colors ${compact ? 'p-1' : 'p-1'}`}
                title="Reset"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Target number display (practice mode) */}
          {mode === 'practice' && targetNumber !== undefined && (
            <div className="bg-blue-100/90 rounded-lg px-2 py-1 mb-2 text-center">
              <span className="text-xs text-blue-600 mr-1">🎯</span>
              <span className="text-sm font-bold text-blue-700">{targetNumber}</span>
            </div>
          )}

          {/* Hint display */}
          {hint && !compact && (
            <div className="bg-yellow-100/90 rounded-lg px-2 py-1 mb-2 flex items-center gap-1">
              <Lightbulb className="text-yellow-600 flex-shrink-0" size={12} />
              <p className="text-xs text-gray-700">{hint}</p>
            </div>
          )}

          {/* Main beads container */}
          <div className="relative">
            {/* Heaven beads section */}
            <div className="flex justify-between gap-0.5 sm:gap-1">
              {beads.map((col, colIndex) => {
                const isHighlighted = tutorialMode && highlightColumn === colIndex;
                return (
                  <div key={colIndex} className={`relative flex flex-col items-center flex-1 rounded-lg transition-all duration-300 ${
                    isHighlighted ? 'bg-yellow-400/30 ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/50' : ''
                  }`}>
                    {/* Rod */}
                    <div className={`absolute left-1/2 -translate-x-1/2 top-0 rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-500 ${
                      compact ? 'w-0.5 bottom-[-6px]' : 'w-1 bottom-[-8px] sm:bottom-[-10px]'
                    }`}></div>
                    
                    {/* Heaven bead */}
                    <div className={`relative flex flex-col justify-start pt-0.5 ${compact ? 'h-12' : 'h-16 sm:h-20'}`}>
                      <button
                        onClick={() => toggleBead(colIndex, 0)}
                        disabled={tutorialMode}
                        className={`relative z-10 rounded-full cursor-pointer transition-all duration-200 active:scale-95 ${
                          compact ? 'w-6 h-6' : 'w-8 h-8 sm:w-10 sm:h-10'
                        } ${col[0] ? (compact ? 'translate-y-5' : 'translate-y-7 sm:translate-y-9') : 'translate-y-0'} ${
                          tutorialMode ? 'cursor-not-allowed' : ''
                        } ${isHighlighted ? 'animate-pulse' : ''}`}
                        aria-label={`Hạt 5 cột ${colIndex + 1}`}
                      >
                        <div className={`absolute inset-0 rounded-full shadow-lg transition-colors duration-100 ${
                          col[0] 
                            ? 'bg-gradient-to-br from-red-400 to-red-600 ring-2 ring-white/60' 
                            : 'bg-gradient-to-br from-red-300 to-red-500'
                        } ${isHighlighted && col[0] ? 'ring-4 ring-yellow-300' : ''}`}>
                          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent"></div>
                          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-800/70 ${compact ? 'w-1 h-1' : 'w-1.5 h-1.5 sm:w-2 sm:h-2'}`}></div>
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Horizontal divider bar */}
            <div className={`relative bg-gradient-to-b from-amber-900 via-amber-600 to-amber-900 shadow-md z-30 rounded-sm ${compact ? 'h-1' : 'h-1.5 sm:h-2'}`}>
              <div className="absolute inset-x-0 top-0 h-px bg-amber-400/40"></div>
              <div className="absolute inset-x-0 bottom-0 h-px bg-black/30"></div>
            </div>
            
            {/* Earth beads section */}
            <div className="flex justify-between gap-0.5 sm:gap-1">
              {beads.map((col, colIndex) => {
                const isHighlighted = tutorialMode && highlightColumn === colIndex;
                return (
                  <div key={colIndex} className={`relative flex flex-col items-center flex-1 rounded-lg transition-all duration-300 ${
                    isHighlighted ? 'bg-yellow-400/30 ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/50' : ''
                  }`}>
                    {/* Rod */}
                    <div className={`absolute left-1/2 -translate-x-1/2 bottom-0 rounded-full bg-gradient-to-b from-amber-500 via-amber-500 to-amber-400 ${
                      compact ? 'w-0.5 top-[-6px]' : 'w-1 top-[-8px] sm:top-[-10px]'
                    }`}></div>
                    
                    {/* 4 Earth beads */}
                    <div className={`flex flex-col ${compact ? 'gap-0.5 pt-2' : 'gap-0.5 sm:gap-1 pt-3 sm:pt-4'}`}>
                      {[1, 2, 3, 4].map((beadIdx) => {
                        const isUp = col[beadIdx];
                        return (
                          <button
                            key={beadIdx}
                            onClick={() => toggleBead(colIndex, beadIdx)}
                            disabled={tutorialMode}
                            className={`relative z-10 rounded-full cursor-pointer transition-all duration-200 active:scale-95 ${
                              compact ? 'w-6 h-6' : 'w-8 h-8 sm:w-10 sm:h-10'
                            } ${isUp ? (compact ? '-translate-y-2' : '-translate-y-3 sm:-translate-y-4') : (compact ? 'translate-y-0.5' : 'translate-y-1 sm:translate-y-1.5')} ${
                              tutorialMode ? 'cursor-not-allowed' : ''
                            } ${isHighlighted ? 'animate-pulse' : ''}`}
                            aria-label={`Hạt ${beadIdx} cột ${colIndex + 1}`}
                          >
                            <div className={`absolute inset-0 rounded-full shadow-lg transition-colors duration-100 ${
                              isUp 
                                ? 'bg-gradient-to-br from-yellow-300 to-amber-500 ring-2 ring-white/60' 
                                : 'bg-gradient-to-br from-amber-500 to-amber-700'
                            } ${isHighlighted && isUp ? 'ring-4 ring-yellow-300' : ''}`}>
                              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent"></div>
                              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-800/60 ${compact ? 'w-1 h-1' : 'w-1.5 h-1.5 sm:w-2 sm:h-2'}`}></div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column values */}
          <div className={`flex justify-between border-t border-amber-700/30 ${compact ? 'mt-2 pt-1' : 'mt-3 sm:mt-4 pt-2'}`}>
            {COLUMN_LABELS.map((label, index) => (
              <div key={index} className="flex-1 text-center">
                {!compact && <div className="text-[6px] sm:text-[8px] text-amber-300/80 font-medium leading-tight truncate">{label}</div>}
                <div className={`text-white font-bold ${compact ? 'text-xs' : 'text-sm sm:text-base'}`}>{calculateValue(index)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes celebrate {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.2) rotate(5deg);
          }
          75% {
            transform: scale(1.2) rotate(-5deg);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-celebrate {
          animation: celebrate 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
