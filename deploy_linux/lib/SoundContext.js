'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { getBackgroundMusic } from './backgroundMusic';
import { playSound, isSoundEnabled, setSoundEnabled, toggleSound, initSoundSystem } from './soundManager';
import ADVENTURE_SOUNDS, { SOUND_EVENTS } from './adventureSounds';

/**
 * 🎮 GLOBAL SOUND CONTEXT
 * 
 * Quản lý âm thanh xuyên suốt app:
 * - Background music persist qua các trang
 * - Sound effects cho các sự kiện
 * - Cleanup khi unmount
 * - Handle browser autoplay restrictions
 */

const SoundContext = createContext(null);

// Audio context singleton
let audioContext = null;

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

export function SoundProvider({ children }) {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolumeState] = useState(0.5);
  const [sfxVolume, setSfxVolumeState] = useState(0.8);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const musicManagerRef = useRef(null);
  const hasUserInteracted = useRef(false);

  // Initialize sound system on mount
  useEffect(() => {
    initSoundSystem();
    setSoundEnabledState(isSoundEnabled());
    
    // Load saved preferences
    try {
      const saved = localStorage.getItem('sorokid_sound_prefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        setSoundEnabledState(prefs.soundEnabled ?? true);
        setMusicEnabled(prefs.musicEnabled ?? true);
        setMusicVolumeState(prefs.musicVolume ?? 0.5);
        setSfxVolumeState(prefs.sfxVolume ?? 0.8);
      }
    } catch (e) {}
    
    setIsInitialized(true);
    
    // Cleanup on unmount
    return () => {
      if (musicManagerRef.current) {
        musicManagerRef.current.stop(0.5);
      }
    };
  }, []);

  // Save preferences when changed
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      localStorage.setItem('sorokid_sound_prefs', JSON.stringify({
        soundEnabled,
        musicEnabled,
        musicVolume,
        sfxVolume,
      }));
    } catch (e) {}
  }, [soundEnabled, musicEnabled, musicVolume, sfxVolume, isInitialized]);

  // Handle user interaction for autoplay
  const handleUserInteraction = useCallback(async () => {
    if (hasUserInteracted.current) return;
    hasUserInteracted.current = true;
    
    await ensureAudioReady();
    
    if (musicEnabled && !musicManagerRef.current) {
      musicManagerRef.current = getBackgroundMusic();
      await musicManagerRef.current?.init();
    }
  }, [musicEnabled]);

  // Setup interaction listeners
  useEffect(() => {
    const events = ['click', 'touchstart', 'keydown'];
    
    const handler = () => {
      handleUserInteraction();
      // Remove listeners after first interaction
      events.forEach(e => document.removeEventListener(e, handler));
    };
    
    events.forEach(e => document.addEventListener(e, handler, { once: true, passive: true }));
    
    return () => {
      events.forEach(e => document.removeEventListener(e, handler));
    };
  }, [handleUserInteraction]);

  /**
   * 🔊 Play sound effect
   */
  const playSFX = useCallback(async (soundName, options = {}) => {
    if (!soundEnabled) return;
    
    try {
      const ctx = await ensureAudioReady();
      if (!ctx) return;
      
      // Try adventure sounds first
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
  }, [soundEnabled]);

  /**
   * 🎵 Play background music
   */
  const playMusic = useCallback(async (theme = 'adventure') => {
    if (!musicEnabled || !soundEnabled) return;
    
    await handleUserInteraction();
    
    if (!musicManagerRef.current) {
      musicManagerRef.current = getBackgroundMusic();
      await musicManagerRef.current?.init();
    }
    
    musicManagerRef.current?.setVolume(musicVolume);
    await musicManagerRef.current?.play(theme);
    setCurrentTheme(theme);
  }, [musicEnabled, soundEnabled, musicVolume, handleUserInteraction]);

  /**
   * 🔇 Stop background music
   */
  const stopMusic = useCallback(async (fade = true) => {
    if (musicManagerRef.current) {
      if (fade) {
        await musicManagerRef.current.stop(1);
      } else {
        musicManagerRef.current.stopImmediate();
      }
      setCurrentTheme(null);
    }
  }, []);

  /**
   * 🔄 Change music theme
   */
  const changeTheme = useCallback(async (theme, crossfade = true) => {
    if (!musicEnabled || !musicManagerRef.current) return;
    
    await musicManagerRef.current.play(theme, crossfade);
    setCurrentTheme(theme);
  }, [musicEnabled]);

  /**
   * Toggle all sounds
   */
  const toggleSounds = useCallback(() => {
    const newState = !soundEnabled;
    setSoundEnabledState(newState);
    setSoundEnabled(newState);
    
    if (!newState) {
      stopMusic(false);
    }
    
    return newState;
  }, [soundEnabled, stopMusic]);

  /**
   * Toggle music only
   */
  const toggleMusicOnly = useCallback(() => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    
    if (!newState) {
      stopMusic();
    }
    
    return newState;
  }, [musicEnabled, stopMusic]);

  /**
   * Set music volume
   */
  const setMusicVolume = useCallback((vol) => {
    const clampedVol = Math.max(0, Math.min(1, vol));
    setMusicVolumeState(clampedVol);
    
    if (musicManagerRef.current) {
      musicManagerRef.current.setVolume(clampedVol);
    }
  }, []);

  /**
   * Set SFX volume
   */
  const setSfxVolume = useCallback((vol) => {
    setSfxVolumeState(Math.max(0, Math.min(1, vol)));
  }, []);

  // Context value
  const value = {
    // Sound effects
    play: playSFX,
    playSFX,
    
    // Background music
    playMusic,
    stopMusic,
    changeTheme,
    currentTheme,
    
    // Settings
    soundEnabled,
    musicEnabled,
    musicVolume,
    sfxVolume,
    
    // Controls
    toggleSounds,
    toggleMusicOnly,
    setMusicVolume,
    setSfxVolume,
    setSoundEnabled: (val) => {
      setSoundEnabledState(val);
      setSoundEnabled(val);
      if (!val) stopMusic(false);
    },
    setMusicEnabled,
    
    // Constants
    SOUND_EVENTS,
    THEMES: ['adventure', 'battle', 'victory', 'calm'],
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}

/**
 * 🎮 Hook to use sound system
 */
export function useSoundContext() {
  const context = useContext(SoundContext);
  
  // If not in provider, return mock functions
  if (!context) {
    return {
      play: () => {},
      playSFX: () => {},
      playMusic: () => {},
      stopMusic: () => {},
      changeTheme: () => {},
      currentTheme: null,
      soundEnabled: true,
      musicEnabled: true,
      musicVolume: 0.5,
      sfxVolume: 0.8,
      toggleSounds: () => true,
      toggleMusicOnly: () => true,
      setMusicVolume: () => {},
      setSfxVolume: () => {},
      setSoundEnabled: () => {},
      setMusicEnabled: () => {},
      SOUND_EVENTS: {},
      THEMES: [],
    };
  }
  
  return context;
}

export default SoundProvider;
