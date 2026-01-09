'use client';

import { useState } from 'react';
import { useSoundContext } from '@/lib/SoundContext';

/**
 * 🔊 SOUND SETTINGS PANEL
 * 
 * Panel điều chỉnh âm thanh game:
 * - Bật/tắt âm thanh
 * - Bật/tắt nhạc nền
 * - Chỉnh volume
 * - Chọn theme nhạc
 */

export default function SoundSettingsPanel({ compact = false, variant = 'default', className = '' }) {
  const {
    soundEnabled,
    musicEnabled,
    musicVolume,
    sfxVolume,
    currentTheme,
    toggleSounds,
    toggleMusicOnly,
    setMusicVolume,
    setSfxVolume,
    playMusic,
    stopMusic,
    changeTheme,
    play,
    THEMES,
  } = useSoundContext();

  const [isExpanded, setIsExpanded] = useState(false);

  const themeNames = {
    adventure: '🗺️ Phiêu Lưu',
    battle: '⚔️ Chiến Đấu',
    victory: '🏆 Chiến Thắng',
    calm: '🌙 Thư Giãn',
  };

  // Compact mode - chỉ hiện icon toggle
  if (compact) {
    // Variant styles cho compact mode
    const getCompactStyles = () => {
      if (variant === 'bright') {
        // Style sáng, nổi bật cho nền tối/gradient
        return soundEnabled
          ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg'
          : 'bg-gray-500 text-white hover:bg-gray-600 shadow-lg';
      }
      if (variant === 'header') {
        // Style cho header trắng - nổi bật với màu sắc rõ ràng
        return soundEnabled
          ? 'bg-green-100 text-green-600 hover:bg-green-200 border border-green-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 border border-gray-200';
      }
      // Default style
      return soundEnabled 
        ? 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30' 
        : 'bg-gray-600/20 text-gray-500 hover:bg-gray-600/30';
    };
    
    return (
      <button
        onClick={() => {
          toggleSounds();
          if (soundEnabled) {
            play('click');
          }
        }}
        className={`p-2 rounded-full transition-all ${getCompactStyles()} ${className}`}
        title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
      >
        {soundEnabled ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M15.536 8.464a5 5 0 010 7.072M17.657 6.343a8 8 0 010 11.314M6 9H3v6h3l4 4V5L6 9z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </button>
    );
  }

  // Full panel mode
  return (
    <div className={`bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700 ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 rounded-t-xl transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🔊</span>
          <span className="text-white font-medium">Cài Đặt Âm Thanh</span>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-700/50">
          {/* Master Sound Toggle */}
          <div className="pt-4 flex items-center justify-between">
            <span className="text-gray-300">Âm thanh</span>
            <button
              onClick={toggleSounds}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                soundEnabled ? 'bg-violet-500' : 'bg-gray-600'
              }`}
            >
              <span 
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  soundEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {soundEnabled && (
            <>
              {/* Music Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Nhạc nền</span>
                <button
                  onClick={() => {
                    toggleMusicOnly();
                    play('click');
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    musicEnabled ? 'bg-violet-500' : 'bg-gray-600'
                  }`}
                >
                  <span 
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      musicEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Music Volume */}
              {musicEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">🎵 Âm lượng nhạc</span>
                    <span className="text-gray-500 text-sm">{Math.round(musicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume * 100}
                    onChange={(e) => setMusicVolume(e.target.value / 100)}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-violet"
                  />
                </div>
              )}

              {/* SFX Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">🔔 Âm lượng hiệu ứng</span>
                  <span className="text-gray-500 text-sm">{Math.round(sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume * 100}
                  onChange={(e) => setSfxVolume(e.target.value / 100)}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-violet"
                />
              </div>

              {/* Music Theme Selector */}
              {musicEnabled && (
                <div className="space-y-2">
                  <span className="text-gray-400 text-sm">🎭 Theme nhạc</span>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map(theme => (
                      <button
                        key={theme}
                        onClick={() => {
                          changeTheme(theme);
                          play('click');
                        }}
                        className={`px-3 py-2 rounded-lg text-sm transition-all ${
                          currentTheme === theme
                            ? 'bg-violet-500 text-white'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        }`}
                      >
                        {themeNames[theme]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Sound Button */}
              <button
                onClick={() => play('notification')}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm transition-colors"
              >
                🔔 Kiểm tra âm thanh
              </button>
            </>
          )}
        </div>
      )}

      {/* Custom slider style */}
      <style jsx>{`
        .slider-violet::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #8B5CF6;
          border-radius: 50%;
          cursor: pointer;
        }
        .slider-violet::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #8B5CF6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}

/**
 * Floating sound toggle button (cho mobile)
 */
export function FloatingSoundToggle({ position = 'bottom-right' }) {
  const { soundEnabled, toggleSounds, play } = useSoundContext();

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <button
      onClick={() => {
        toggleSounds();
        if (!soundEnabled) play('click');
      }}
      className={`fixed ${positionClasses[position]} z-50 p-3 rounded-full 
        bg-slate-800/90 backdrop-blur-sm border border-slate-700
        shadow-lg shadow-black/20 transition-all hover:scale-105
        ${soundEnabled ? 'text-violet-400' : 'text-gray-500'}`}
    >
      {soundEnabled ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M15.536 8.464a5 5 0 010 7.072M17.657 6.343a8 8 0 010 11.314M6 9H3v6h3l4 4V5L6 9z" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      )}
    </button>
  );
}
