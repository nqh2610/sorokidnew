'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, HelpCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

export default function CompactSoroban() {
  const [beads, setBeads] = useState([
    [false, true, true, true, true],
    [false, true, true, true, true],
    [false, true, true, true, true],
    [false, true, true, true, true],
    [false, true, true, true, true]
  ]);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [hint, setHint] = useState('');

  useEffect(() => {
    const total = calculateTotalValue();
    setCurrentNumber(total);
  }, [beads]);

  const calculateValue = (col) => {
    const heaven = beads[col][0] ? 5 : 0;
    const earth = beads[col].slice(1).filter(b => !b).length;
    return heaven + earth;
  };

  const calculateTotalValue = () => {
    let total = 0;
    for (let i = 0; i < 5; i++) {
      total += calculateValue(i) * Math.pow(10, 4 - i);
    }
    return total;
  };

  const toggleBead = (col, row) => {
    const newBeads = [...beads];
    if (row === 0) {
      newBeads[col][0] = !newBeads[col][0];
    } else {
      const currentState = newBeads[col][row];
      if (currentState) {
        for (let i = 1; i <= row; i++) {
          newBeads[col][i] = false;
        }
      } else {
        for (let i = 4; i >= row; i--) {
          newBeads[col][i] = true;
        }
      }
    }
    setBeads(newBeads);
  };

  const reset = () => {
    setBeads([
      [false, true, true, true, true],
      [false, true, true, true, true],
      [false, true, true, true, true],
      [false, true, true, true, true],
      [false, true, true, true, true]
    ]);
    setCurrentNumber(0);
    setHint('');
  };

  const showHintForUser = () => {
    setHint('Hạt đỏ = 5, Hạt vàng = 1. Click để di chuyển các hạt!');
    setTimeout(() => setHint(''), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Premium Header with Glass Effect */}
      <div className="flex-shrink-0 flex items-center justify-between gap-2 mb-3">
        <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl px-4 py-2.5 shadow-lg flex-1 min-w-0 overflow-hidden group">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>

          <div className="relative z-10">
            <div className="text-[10px] font-semibold text-white/90 mb-0.5 tracking-wide uppercase">Kết quả</div>
            <div className="text-3xl font-black text-white truncate drop-shadow-lg tracking-tight">
              {currentNumber.toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={showHintForUser}
            className="group relative p-2 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-amber-500/50"
            title="Gợi ý"
            aria-label="Gợi ý"
          >
            <Lightbulb size={16} className="relative z-10" />
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
          <button
            onClick={reset}
            className="group relative p-2 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-purple-500/50"
            title="Reset"
            aria-label="Reset"
          >
            <RotateCcw size={16} className="relative z-10 group-hover:rotate-180 transition-transform duration-500" />
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>

      {/* Animated Hint */}
      {hint && (
        <div className="flex-shrink-0 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-2.5 mb-3 text-xs text-gray-800 flex items-start gap-2 shadow-md animate-slide-down">
          <Lightbulb className="text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" size={16} />
          <span className="font-medium">{hint}</span>
        </div>
      )}

      {/* Premium Soroban Board */}
      <div className="flex-1 relative rounded-xl overflow-hidden shadow-2xl">
        {/* Background with texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>

        <div className="relative h-full flex flex-col justify-center p-4">
          {/* Heaven beads with glow effect */}
          <div className="flex justify-center gap-5 mb-3 pb-3 border-b-[3px] border-amber-950/80 relative">
            {/* Decorative bar */}
            <div className="absolute left-0 right-0 top-full h-1 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent"></div>

            {beads.map((col, colIndex) => (
              <button
                key={colIndex}
                onClick={() => toggleBead(colIndex, 0)}
                className={`relative w-9 h-9 rounded-full transition-all duration-300 transform active:scale-90 hover:scale-110 ${
                  col[0]
                    ? 'bg-gradient-to-br from-red-500 to-red-700 translate-y-2 shadow-lg shadow-red-900/60'
                    : 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-800/40'
                }`}
                aria-label={`Heaven bead column ${colIndex + 1}`}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/40"></div>
                <div className={`absolute inset-0 rounded-full ${col[0] ? 'animate-pulse-glow' : ''}`}></div>
              </button>
            ))}
          </div>

          {/* Earth beads with enhanced effects */}
          <div className="flex justify-center gap-5 pt-3">
            {beads.map((col, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-2">
                {col.slice(1).map((bead, beadIndex) => (
                  <button
                    key={beadIndex}
                    onClick={() => toggleBead(colIndex, beadIndex + 1)}
                    className={`relative w-9 h-9 rounded-full transition-all duration-300 transform active:scale-90 hover:scale-110 ${
                      bead
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-700/40'
                        : 'bg-gradient-to-br from-yellow-400 to-amber-500 -translate-y-2 shadow-lg shadow-amber-800/60'
                    }`}
                    aria-label={`Earth bead ${beadIndex + 1} column ${colIndex + 1}`}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/40"></div>
                    <div className={`absolute inset-0 rounded-full ${!bead ? 'animate-pulse-glow' : ''}`}></div>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Modern Column labels */}
          <div className="flex justify-center gap-5 mt-3">
            {['Vạn', 'Nghìn', 'Trăm', 'Chục', 'ĐV'].map((label, index) => (
              <div key={index} className="w-9 text-center">
                <div className="px-1.5 py-0.5 bg-amber-950/50 rounded-md backdrop-blur-sm mb-1">
                  <div className="text-[9px] text-amber-200 font-bold leading-tight">{label}</div>
                </div>
                <div className="text-base font-black text-white drop-shadow-lg">{calculateValue(index)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Collapsible Instructions */}
      <div className="flex-shrink-0 mt-3">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-indigo-600 py-2 px-3 rounded-lg hover:bg-indigo-50 transition-all group"
        >
          <HelpCircle size={14} className="group-hover:rotate-12 transition-transform" />
          <span>Hướng dẫn sử dụng</span>
          {showInstructions ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
        </button>

        {showInstructions && (
          <div className="grid grid-cols-3 gap-2 mt-2 animate-slide-down">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-2 text-center border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xl mb-1">👆</div>
              <p className="font-bold text-gray-800 text-[10px] leading-tight">Click hạt để di chuyển</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-2 text-center border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xl mb-1">🔴</div>
              <p className="font-bold text-gray-800 text-[10px] leading-tight">Hạt đỏ = 5 đơn vị</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-2 text-center border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xl mb-1">🟡</div>
              <p className="font-bold text-gray-800 text-[10px] leading-tight">Hạt vàng = 1 đơn vị</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 16px rgba(255, 255, 255, 0.6);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
