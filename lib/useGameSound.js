'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { 
  playSound, 
  isSoundEnabled, 
  setSoundEnabled, 
  toggleSound,
  initSoundSystem 
} from '@/lib/soundManager';
import ADVENTURE_SOUNDS, { SOUND_EVENTS, createAmbientMusic } from '@/lib/adventureSounds';
import { getBackgroundMusic } from '@/lib/backgroundMusic';

/**
 * 🎮 useGameSound - Game Sound Hook for Adventure
 * 
 * Hệ thống âm thanh game hóa cho "Đi Tìm Kho Báu Tri Thức"
 * 
 * Usage:
 * const { play, playMusic, stopMusic, enabled, toggle } = useGameSound();
 * play('stageComplete');     // Play stage complete fanfare
 * play('treasureFound');     // Play treasure discovery
 * playMusic('adventure');    // Start adventure theme music
 */

// Audio Context singleton
let audioContext = null;
let ambientMusic = null;
let backgroundMusic = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Failed to create AudioContext:', e);
      return null;
    }
  }
  return audioContext;
}

// Ensure AudioContext is resumed
async function ensureAudioReady() {
  const ctx = getAudioContext();
  if (!ctx) return null;
  
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      console.warn('Failed to resume AudioContext:', e);
    }
  }
  return ctx;
}

export function useGameSound() {
  const [enabled, setEnabled] = useState(true);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [currentMusicTheme, setCurrentMusicTheme] = useState(null);
  const initialized = useRef(false);
  const cleanupRef = useRef([]);

  // Initialize on mount
  useEffect(() => {
    initSoundSystem();
    setEnabled(isSoundEnabled());
    
    // Get background music instance
    backgroundMusic = getBackgroundMusic();
    
    // Cleanup on unmount
    return () => {
      // Stop any playing music
      if (backgroundMusic) {
        backgroundMusic.stop(0.3);
      }
      if (ambientMusic) {
        ambientMusic.stopMusic();
      }
      // Run cleanup functions
      cleanupRef.current.forEach(fn => fn());
      cleanupRef.current = [];
    };
  }, []);

  /**
   * 🔊 Play adventure sound effect
   * @param {string} soundName - Sound key from ADVENTURE_SOUNDS or legacy soundManager
   */
  const play = useCallback((soundName) => {
    if (!isSoundEnabled()) return;
    if (typeof window === 'undefined') return;

    // Use async to properly handle AudioContext resume
    (async () => {
      try {
        const ctx = await ensureAudioReady();
        if (!ctx) return;

        // Try Adventure sounds first
        const adventureSound = ADVENTURE_SOUNDS[soundName];
        if (adventureSound) {
          adventureSound(ctx, ctx.currentTime);
          return;
        }

        // Fallback to legacy soundManager
        playSound(soundName);
      } catch (e) {
        console.warn('Sound play failed:', e);
      }
    })();
  }, []);

  /**
   * 🎵 Start background music with theme
   * @param {string} theme - 'adventure', 'battle', 'victory', 'calm'
   */
  const playMusic = useCallback(async (theme = 'adventure') => {
    if (!isSoundEnabled()) return;
    if (musicPlaying && currentMusicTheme === theme) return;

    try {
      // Use new background music system
      if (backgroundMusic) {
        await backgroundMusic.play(theme, true);
        setMusicPlaying(true);
        setCurrentMusicTheme(theme);
        return;
      }
      
      // Fallback to ambient music
      const ctx = getAudioContext();
      if (!ctx) return;
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!ambientMusic) {
        ambientMusic = createAmbientMusic(ctx);
      }
      
      ambientMusic.startMusic();
      setMusicPlaying(true);
    } catch (e) {
      console.warn('Music start failed:', e);
    }
  }, [musicPlaying, currentMusicTheme]);

  /**
   * 🔇 Stop background music
   * @param {boolean} fade - Whether to fade out
   */
  const stopMusic = useCallback(async (fade = true) => {
    if (backgroundMusic) {
      if (fade) {
        await backgroundMusic.stop(1);
      } else {
        backgroundMusic.stopImmediate();
      }
      setMusicPlaying(false);
      setCurrentMusicTheme(null);
      return;
    }
    
    if (ambientMusic) {
      ambientMusic.stopMusic();
      setMusicPlaying(false);
    }
  }, []);

  /**
   * 🔄 Change music theme with crossfade
   */
  const changeTheme = useCallback(async (theme, crossfade = true) => {
    if (!isSoundEnabled() || !backgroundMusic) return;
    
    await backgroundMusic.play(theme, crossfade);
    setCurrentMusicTheme(theme);
    setMusicPlaying(true);
  }, []);

  /**
   * 🔊 Set music volume (0-1)
   */
  const setMusicVolume = useCallback((vol) => {
    if (backgroundMusic) {
      backgroundMusic.setVolume(vol);
    } else if (ambientMusic) {
      ambientMusic.setVolume(vol * 0.1); // Max 0.1 to keep it subtle
    }
  }, []);

  // Legacy sound functions for backward compatibility
  const sounds = {
    // UI Sounds
    click: useCallback(() => play('click'), [play]),
    
    // Success/Error  
    success: useCallback(() => play('correct'), [play]),
    error: useCallback(() => play('wrong'), [play]),
    
    // Game Progress
    star: useCallback(() => play('star'), [play]),
    combo: useCallback(() => play('combo'), [play]),
    levelUp: useCallback(() => play('levelUp'), [play]),
    victory: useCallback(() => play('stageComplete'), [play]),
    
    // Game Actions
    start: useCallback(() => play('gameStart'), [play]),
    tick: useCallback(() => play('timerWarning'), [play]),
    
    // Adventure specific - enhanced
    stageSelect: useCallback(() => play('stageSelect'), [play]),
    stageUnlock: useCallback(() => play('stageUnlock'), [play]),
    stageComplete: useCallback(() => play('stageComplete'), [play]),
    bossDefeat: useCallback(() => play('bossDefeat'), [play]),
    zoneComplete: useCallback(() => play('zoneComplete'), [play]),
    certificateEarned: useCallback(() => play('certificateEarned'), [play]),
    treasureFound: useCallback(() => play('treasureFound'), [play]),
    mapOpen: useCallback(() => play('mapOpen'), [play]),
    notification: useCallback(() => play('notification'), [play]),
    
    // Compound sounds (legacy compatibility)
    zoneUnlock: useCallback(() => {
      play('stageUnlock');
    }, [play]),
    
    challengeStart: useCallback(() => {
      play('gameStart');
    }, [play]),
    
    challengeComplete: useCallback(() => {
      play('stageComplete');
    }, [play]),
    
    rewardCollect: useCallback(() => {
      play('star');
      setTimeout(() => play('notification'), 150);
    }, [play]),
    
    badgeUnlock: useCallback(() => {
      play('levelUp');
    }, [play]),
  };

  // Toggle function
  const toggle = useCallback(() => {
    const newState = toggleSound();
    setEnabled(newState);
    if (newState) {
      play('click');
    } else {
      // Stop music when disabling sound
      stopMusic();
    }
    return newState;
  }, [play, stopMusic]);

  // Set enabled function
  const setEnabledState = useCallback((value) => {
    setSoundEnabled(value);
    setEnabled(value);
    if (value) {
      play('click');
    } else {
      stopMusic();
    }
  }, [play, stopMusic]);

  return {
    // New API
    play,
    playMusic,
    stopMusic,
    changeTheme,
    setMusicVolume,
    musicPlaying,
    currentMusicTheme,
    
    // Legacy API (backward compatible)
    sounds,
    enabled,
    toggle,
    setEnabled: setEnabledState,
    
    // Sound event constants
    SOUND_EVENTS,
    
    // Music themes
    MUSIC_THEMES: ['adventure', 'battle', 'victory', 'calm'],
  };
}

export default useGameSound;
