'use client';

import { useCallback, useEffect, useState } from 'react';
import { 
  playSound, 
  isSoundEnabled, 
  setSoundEnabled, 
  toggleSound,
  initSoundSystem 
} from '@/lib/soundManager';

/**
 * 🎮 useGameSound - Game Sound Hook for Adventure
 * 
 * Provides easy access to sound effects for game interactions
 * 
 * Usage:
 * const { sounds, enabled, toggle } = useGameSound();
 * sounds.zoneComplete();  // Play zone complete sound
 * sounds.click();         // Play click sound
 */
export function useGameSound() {
  const [enabled, setEnabled] = useState(true);

  // Initialize on mount
  useEffect(() => {
    initSoundSystem();
    setEnabled(isSoundEnabled());
  }, []);

  // Sound functions
  const sounds = {
    // UI Sounds
    click: useCallback(() => playSound('click'), []),
    
    // Success/Error
    success: useCallback(() => playSound('success'), []),
    error: useCallback(() => playSound('error'), []),
    
    // Game Progress
    star: useCallback(() => playSound('star'), []),
    combo: useCallback(() => playSound('combo'), []),
    levelUp: useCallback(() => playSound('levelUp'), []),
    victory: useCallback(() => playSound('victory'), []),
    
    // Game Actions
    start: useCallback(() => playSound('start'), []),
    tick: useCallback(() => playSound('tick'), []),
    
    // Adventure specific
    zoneUnlock: useCallback(() => {
      playSound('star');
      setTimeout(() => playSound('levelUp'), 300);
    }, []),
    
    zoneComplete: useCallback(() => {
      playSound('victory');
    }, []),
    
    challengeStart: useCallback(() => {
      playSound('start');
    }, []),
    
    challengeComplete: useCallback(() => {
      playSound('success');
      setTimeout(() => playSound('star'), 200);
    }, []),
    
    rewardCollect: useCallback(() => {
      playSound('star');
      setTimeout(() => playSound('combo'), 150);
      setTimeout(() => playSound('star'), 300);
    }, []),
    
    badgeUnlock: useCallback(() => {
      playSound('levelUp');
      setTimeout(() => playSound('victory'), 400);
    }, []),
  };

  // Toggle function
  const toggle = useCallback(() => {
    const newState = toggleSound();
    setEnabled(newState);
    if (newState) {
      playSound('click');
    }
    return newState;
  }, []);

  // Set enabled function
  const setEnabledState = useCallback((value) => {
    setSoundEnabled(value);
    setEnabled(value);
    if (value) {
      playSound('click');
    }
  }, []);

  return {
    sounds,
    enabled,
    toggle,
    setEnabled: setEnabledState
  };
}

export default useGameSound;
