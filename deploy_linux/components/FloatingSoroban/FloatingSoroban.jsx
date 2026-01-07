'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import CompactSoroban from './CompactSoroban';

export default function FloatingSoroban() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full shadow-2xl hover:shadow-amber-500/50 hover:scale-110 transition-all flex items-center justify-center group"
          aria-label="Mở bàn tính Soroban"
          title="Mở bàn tính Soroban"
        >
          <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">🧮</span>
        </button>
      )}

      {/* Soroban Modal - Premium Design */}
      {isOpen && (
        <>

          {/* Soroban Panel - Premium Corner Design */}
          <div
            className="fixed bottom-4 right-4 z-50 rounded-2xl shadow-2xl w-[90vw] max-w-sm sm:max-w-md max-h-[75vh] flex flex-col animate-slide-in overflow-hidden border border-white/20"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.98) 100%)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Premium Header with gradient */}
            <div className="flex-shrink-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-4 py-2.5 flex items-center justify-between relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.2) 75%), linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.2) 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px'
              }}></div>

              <div className="flex items-center gap-2 relative z-10">
                <span className="text-2xl drop-shadow-md">🧮</span>
                <h3 className="text-sm sm:text-base font-black text-white drop-shadow-md tracking-wide">
                  Bàn tính Soroban
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-all hover:rotate-90 duration-300 focus:outline-none relative z-10 active:scale-90"
                aria-label="Đóng bàn tính"
              >
                <X size={18} className="text-white drop-shadow" />
              </button>
            </div>

            {/* Soroban Board - Premium & No Scroll */}
            <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0" style={{
              background: 'linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%)'
            }}>
              <CompactSoroban />
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px) translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
