'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { 
  isSoundEnabled, 
  setSoundEnabled, 
  loadSoundSetting,
  playSound,
  initSoundSystem 
} from '@/lib/soundManager';

/**
 * 🔊 SOUND TOGGLE BUTTON
 * 
 * Nút bật/tắt âm thanh, hiển thị trên các màn hình game
 * 
 * Usage:
 * <SoundToggle />
 * <SoundToggle size="lg" position="top-right" />
 */

const POSITIONS = {
  'top-left': 'top-3 left-3',
  'top-right': 'top-3 right-3',
  'bottom-left': 'bottom-20 left-3 md:bottom-3', // Tránh bottom nav
  'bottom-right': 'bottom-20 right-3 md:bottom-3',
  'inline': '', // Không fixed, dùng trong layout
};

const SIZES = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

export default function SoundToggle({ 
  position = 'inline',
  size = 'md',
  className = '',
  showLabel = false,
}) {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Load setting on mount
  useEffect(() => {
    setMounted(true);
    const storedValue = loadSoundSetting();
    setEnabled(storedValue);
  }, []);

  const handleToggle = () => {
    // Init sound system on first interaction
    initSoundSystem();
    
    const newValue = !enabled;
    setEnabled(newValue);
    setSoundEnabled(newValue);
    
    // Play click sound if turning ON
    if (newValue) {
      playSound('click');
    }
  };

  // Avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  const posClass = POSITIONS[position] || '';
  const sizeClass = SIZES[size] || SIZES.md;
  const isFixed = position !== 'inline';

  return (
    <button
      onClick={handleToggle}
      className={`
        ${isFixed ? 'fixed z-50' : ''}
        ${posClass}
        ${sizeClass}
        flex items-center justify-center gap-2
        rounded-full
        transition-all duration-200
        active:scale-95
        ${enabled 
          ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' 
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        }
        shadow-md hover:shadow-lg
        ${className}
      `}
      title={enabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
      aria-label={enabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
    >
      {enabled ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
      
      {showLabel && (
        <span className="text-sm font-medium">
          {enabled ? 'Bật' : 'Tắt'}
        </span>
      )}
    </button>
  );
}

/**
 * 🎮 GAME SOUND TOGGLE
 * Preset cho màn hình game - Fixed position
 */
export function GameSoundToggle() {
  return (
    <SoundToggle 
      position="top-right"
      size="sm"
    />
  );
}

/**
 * ⚙️ SETTINGS SOUND TOGGLE
 * Preset cho trang settings - Inline với label
 */
export function SettingsSoundToggle() {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔊</span>
        <div>
          <p className="font-medium text-gray-800">Âm thanh</p>
          <p className="text-sm text-gray-500">Bật/tắt hiệu ứng âm thanh</p>
        </div>
      </div>
      <SoundToggle position="inline" size="lg" />
    </div>
  );
}
