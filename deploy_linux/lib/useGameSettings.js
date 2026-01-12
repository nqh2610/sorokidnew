'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  loadGameSettings, 
  saveGameSettings, 
  resetGameSettings,
  debouncedSave,
  cancelDebouncedSave 
} from './gameStorage';

/**
 * useGameSettings - React hook để quản lý game settings với localStorage
 * 
 * Features:
 * - Auto-load settings khi mount
 * - Auto-save khi unmount hoặc visibility change
 * - Không ghi liên tục - chỉ ghi khi cần
 * - Merge với defaults để đảm bảo backward compatible
 * 
 * @param {string} gameId - ID của game (vd: 'flash-zan')
 * @param {object} defaultSettings - Giá trị mặc định
 * @returns {object} - { settings, updateSettings, saveNow, reset, isDirty }
 * 
 * EXAMPLE:
 * ```jsx
 * const { settings, updateSettings, saveNow, reset } = useGameSettings('flash-zan', {
 *   op: 'add',      // operationType
 *   d: 1,           // digitCount
 *   f: 5,           // flashCount
 *   spd: 1.5,       // speed
 *   snd: 1          // soundEnabled (1/0)
 * });
 * 
 * // Đọc settings
 * const digitCount = settings.d;
 * 
 * // Update (sẽ auto-save khi unmount)
 * updateSettings({ d: 2 });
 * 
 * // Hoặc save ngay lập tức (khi user bấm "Bắt đầu")
 * saveNow();
 * 
 * // Reset về defaults
 * reset();
 * ```
 */
export function useGameSettings(gameId, defaultSettings = {}) {
  const [settings, setSettings] = useState(() => {
    // Lazy init - load từ storage
    if (typeof window !== 'undefined') {
      return loadGameSettings(gameId, defaultSettings);
    }
    return { ...defaultSettings };
  });
  
  const [isDirty, setIsDirty] = useState(false);
  const settingsRef = useRef(settings);
  const gameIdRef = useRef(gameId);
  
  // Keep refs updated
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  
  useEffect(() => {
    gameIdRef.current = gameId;
  }, [gameId]);

  // Load settings on mount (client-side only)
  useEffect(() => {
    const loaded = loadGameSettings(gameId, defaultSettings);
    setSettings(loaded);
  }, [gameId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save on unmount or visibility change
  useEffect(() => {
    const handleSave = () => {
      if (isDirty) {
        saveGameSettings(gameIdRef.current, settingsRef.current);
        setIsDirty(false);
      }
    };

    // Save when page becomes hidden (user switches tab or closes)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleSave();
      }
    };

    // Save before unload
    const handleBeforeUnload = () => {
      handleSave();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save on unmount
      handleSave();
      cancelDebouncedSave();
    };
  }, [isDirty]);

  /**
   * Update settings
   * @param {object} partial - Partial settings to merge
   * @param {object} options - { immediate: true } để save ngay
   */
  const updateSettings = useCallback((partial, options = {}) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      
      if (options.immediate) {
        // Save immediately
        saveGameSettings(gameIdRef.current, next);
        setIsDirty(false);
      } else {
        setIsDirty(true);
      }
      
      return next;
    });
  }, []);

  /**
   * Save settings immediately
   */
  const saveNow = useCallback(() => {
    saveGameSettings(gameIdRef.current, settingsRef.current);
    setIsDirty(false);
  }, []);

  /**
   * Reset settings to defaults
   */
  const reset = useCallback(() => {
    resetGameSettings(gameIdRef.current);
    setSettings({ ...defaultSettings });
    setIsDirty(false);
  }, [defaultSettings]);

  return {
    settings,
    updateSettings,
    saveNow,
    reset,
    isDirty,
  };
}

/**
 * useGameSettingsSimple - Hook đơn giản hơn, không auto-save
 * Dùng khi muốn control việc save thủ công hoàn toàn
 * 
 * @param {string} gameId 
 * @param {object} defaultSettings 
 * @returns {[object, function, function, function]}
 */
export function useGameSettingsSimple(gameId, defaultSettings = {}) {
  const [settings, setSettings] = useState(defaultSettings);
  
  // Load on mount
  useEffect(() => {
    const loaded = loadGameSettings(gameId, defaultSettings);
    setSettings(loaded);
  }, [gameId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const save = useCallback(() => {
    saveGameSettings(gameId, settings);
  }, [gameId, settings]);
  
  const reset = useCallback(() => {
    resetGameSettings(gameId);
    setSettings({ ...defaultSettings });
  }, [gameId, defaultSettings]);
  
  return [settings, setSettings, save, reset];
}

export default useGameSettings;
