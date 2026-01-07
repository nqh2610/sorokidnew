/**
 * 🔊 SOUND MANAGER - Hệ thống âm thanh cho SoroKid
 * 
 * Âm thanh feedback ngắn gọn, vui vẻ cho học sinh tiểu học
 * Sử dụng Web Audio API để tạo âm thanh synthetic (không cần file)
 * 
 * Usage:
 * import { playSound, setSoundEnabled, isSoundEnabled } from '@/lib/soundManager';
 * 
 * playSound('success');  // Đáp án đúng
 * playSound('error');    // Đáp án sai
 * playSound('click');    // Click button
 * playSound('levelUp');  // Lên level
 * playSound('combo');    // Combo streak
 * playSound('star');     // Nhận sao
 */

// Audio Context singleton
let audioContext = null;

// Settings
const STORAGE_KEY = 'sorokid_sound_enabled';
let soundEnabled = true;

/**
 * Khởi tạo AudioContext (cần user interaction trước)
 */
function getAudioContext() {
  if (!audioContext && typeof window !== 'undefined') {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Load setting từ localStorage
 */
export function loadSoundSetting() {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(STORAGE_KEY);
  soundEnabled = stored === null ? true : stored === 'true';
  return soundEnabled;
}

/**
 * Kiểm tra sound có bật không
 */
export function isSoundEnabled() {
  if (typeof window === 'undefined') return true;
  return soundEnabled;
}

/**
 * Bật/tắt sound
 */
export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, enabled.toString());
  }
  return enabled;
}

/**
 * Toggle sound on/off
 */
export function toggleSound() {
  return setSoundEnabled(!soundEnabled);
}

// ============================================
// SOUND DEFINITIONS - Synthetic sounds
// ============================================

const SOUNDS = {
  // ✅ Đáp án đúng - Rising cheerful tone
  success: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, time); // C5
    osc.frequency.setValueAtTime(659, time + 0.08); // E5
    osc.frequency.setValueAtTime(784, time + 0.16); // G5
    
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialDecayTo = 0.01;
    gain.gain.setValueAtTime(0.3, time + 0.16);
    gain.gain.exponentialDecayTo(0.01, time + 0.3);
    
    osc.start(time);
    osc.stop(time + 0.3);
  },

  // ❌ Đáp án sai - Gentle low tone (không harsh)
  error: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(150, time + 0.15);
    
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    
    osc.start(time);
    osc.stop(time + 0.15);
  },

  // 👆 Click button - Short pop
  click: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, time);
    osc.frequency.exponentialRampToValueAtTime(800, time + 0.05);
    
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    
    osc.start(time);
    osc.stop(time + 0.05);
  },

  // 🎉 Level up - Fanfare
  levelUp: (ctx, time) => {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time + i * 0.1);
      
      gain.gain.setValueAtTime(0.15, time + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.1 + 0.2);
      
      osc.start(time + i * 0.1);
      osc.stop(time + i * 0.1 + 0.2);
    });
  },

  // 🔥 Combo streak - Quick ascending
  combo: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, time);
    osc.frequency.exponentialRampToValueAtTime(800, time + 0.1);
    
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
    
    osc.start(time);
    osc.stop(time + 0.12);
  },

  // ⭐ Nhận sao - Sparkle sound
  star: (ctx, time) => {
    [0, 0.08, 0.16].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + i * 200, time + delay);
      
      gain.gain.setValueAtTime(0.1, time + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, time + delay + 0.1);
      
      osc.start(time + delay);
      osc.stop(time + delay + 0.1);
    });
  },

  // 🎯 Bắt đầu - Ready tone
  start: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, time); // A4
    
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    
    osc.start(time);
    osc.stop(time + 0.2);
  },

  // ⏰ Countdown tick
  tick: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, time);
    
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
    
    osc.start(time);
    osc.stop(time + 0.03);
  },

  // 🏆 Hoàn thành/Victory
  victory: (ctx, time) => {
    const melody = [
      { note: 523, delay: 0 },      // C5
      { note: 659, delay: 0.12 },   // E5
      { note: 784, delay: 0.24 },   // G5
      { note: 1047, delay: 0.36 },  // C6
      { note: 1047, delay: 0.48 },  // C6
    ];
    
    melody.forEach(({ note, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, time + delay);
      
      gain.gain.setValueAtTime(0.2, time + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, time + delay + 0.15);
      
      osc.start(time + delay);
      osc.stop(time + delay + 0.15);
    });
  },
};

/**
 * 🔊 PHÁT ÂM THANH
 * 
 * @param {string} soundName - Tên âm thanh: 'success', 'error', 'click', 'levelUp', 'combo', 'star', 'start', 'tick', 'victory'
 */
export function playSound(soundName) {
  if (!soundEnabled) return;
  if (typeof window === 'undefined') return;
  
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Resume context nếu suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const soundFn = SOUNDS[soundName];
    if (soundFn) {
      soundFn(ctx, ctx.currentTime);
    }
  } catch (e) {
    console.warn('Sound playback failed:', e);
  }
}

/**
 * Preload - Resume AudioContext sau user interaction
 */
export function initSoundSystem() {
  loadSoundSetting();
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}

// Default export for convenience
const soundManager = {
  playSound,
  setSoundEnabled,
  isSoundEnabled,
  toggleSound,
  initSoundSystem,
  loadSoundSetting,
};

export default soundManager;
