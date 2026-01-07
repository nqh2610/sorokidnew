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

/**
 * 🎮 useGameSound - Game Sound Hook for Adventure
 * 
 * Hệ thống âm thanh game hóa cho "Đi Tìm Kho Báu Tri Thức"
 * 
 * Usage:
 * const { play, playMusic, stopMusic, enabled, toggle } = useGameSound();
 * play('stageComplete');     // Play stage complete fanfare
 * play('treasureFound');     // Play treasure discovery
 * playMusic();               // Start ambient music
 */

// Audio Context singleton
let audioContext = null;
let ambientMusic = null;

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
  const initialized = useRef(false);

  // Initialize on mount
  useEffect(() => {
    initSoundSystem();
    setEnabled(isSoundEnabled());
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
   * 🎵 Start ambient background music
   */
  const playMusic = useCallback(() => {
    if (!isSoundEnabled()) return;
    if (musicPlaying) return;

    try {
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
  }, [musicPlaying]);

  /**
   * 🔇 Stop ambient music
   */
  const stopMusic = useCallback(() => {
    if (ambientMusic) {
      ambientMusic.stopMusic();
      setMusicPlaying(false);
    }
  }, []);

  /**
   * 🔊 Set music volume (0-1)
   */
  const setMusicVolume = useCallback((vol) => {
    if (ambientMusic) {
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
    setMusicVolume,
    musicPlaying,
    
    // Legacy API (backward compatible)
    sounds,
    enabled,
    toggle,
    setEnabled: setEnabledState,
    
    // Sound event constants
    SOUND_EVENTS,
  };
}

export default useGameSound;
