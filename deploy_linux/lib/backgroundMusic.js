/**
 * 🎵 BACKGROUND MUSIC MANAGER v3
 * 
 * Ambient music system - không lặp lại giai điệu đơn điệu
 * Sử dụng random ambient notes với nhiều variation
 * 
 * Features:
 * - Ambient style: notes ngẫu nhiên, thưa thớt
 * - Không có melody cố định lặp lại
 * - Chords nhẹ nhàng thay vì single notes
 * - Khoảng nghỉ dài, tự nhiên
 */

// ============================================
// 🎼 MUSIC THEMES - Ambient Style
// ============================================

// Scale notes for different moods
const SCALES = {
  // C major pentatonic - vui vẻ, sáng sủa
  bright: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25],
  // A minor pentatonic - nhẹ nhàng, thư giãn  
  calm: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
  // F major - ấm áp
  warm: [174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 392.00, 440.00],
};

const MUSIC_THEMES = {
  // 🗺️ Adventure - Ambient exploration
  adventure: {
    scale: 'bright',
    notesPerMinute: 8, // Rất ít notes, ambient style
    chordChance: 0.3, // 30% chance chơi chord thay vì single note
    restChance: 0.4, // 40% chance nghỉ
    volume: 0.05,
    noteLength: { min: 0.8, max: 2.0 }, // Notes dài, mượt mà
  },

  // ⚔️ Battle - Slightly more active but still ambient
  battle: {
    scale: 'warm',
    notesPerMinute: 12,
    chordChance: 0.25,
    restChance: 0.35,
    volume: 0.05,
    noteLength: { min: 0.5, max: 1.5 },
  },

  // 🏆 Victory - Bright ambient
  victory: {
    scale: 'bright',
    notesPerMinute: 10,
    chordChance: 0.4,
    restChance: 0.3,
    volume: 0.06,
    noteLength: { min: 0.6, max: 1.8 },
  },

  // 🌙 Calm - Very sparse ambient
  calm: {
    scale: 'calm',
    notesPerMinute: 5, // Rất ít
    chordChance: 0.2,
    restChance: 0.5, // 50% nghỉ
    volume: 0.04,
    noteLength: { min: 1.0, max: 3.0 }, // Notes rất dài
  },
};

// ============================================
// 🎹 MUSIC ENGINE - Ambient Generator
// ============================================

class BackgroundMusicManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.currentTheme = null;
    this.isPlaying = false;
    this.volume = 0.25; // Master volume
    
    // Ambient state
    this.schedulerTimer = null;
    this.lastNoteTime = 0;
    this.lastNoteIndex = -1; // Tránh lặp note liền kề
    
    // Active oscillators for cleanup
    this.activeOscillators = [];
    
    // Crossfade
    this.isFading = false;
  }

  /**
   * Initialize Audio Context (must be called from user interaction)
   */
  async init() {
    if (this.audioContext) return true;
    
    if (typeof window === 'undefined') return false;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Master gain for overall volume
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.audioContext.destination);
      
      return true;
    } catch (e) {
      console.warn('BackgroundMusic: Failed to init AudioContext', e);
      return false;
    }
  }

  /**
   * Resume AudioContext if suspended (browser autoplay policy)
   */
  async resume() {
    if (!this.audioContext) return false;
    
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        return true;
      } catch (e) {
        console.warn('BackgroundMusic: Failed to resume', e);
        return false;
      }
    }
    return true;
  }

  /**
   * Start playing a theme
   */
  async play(themeName = 'adventure', crossfade = true) {
    console.log('🎵 BackgroundMusic.play called:', themeName);
    
    const theme = MUSIC_THEMES[themeName];
    if (!theme) {
      console.warn('BackgroundMusic: Unknown theme', themeName);
      return;
    }
    
    // Initialize if needed
    if (!this.audioContext) {
      const success = await this.init();
      if (!success) return;
    }
    
    await this.resume();
    
    if (this.currentTheme === themeName && this.isPlaying) {
      return; // Already playing this theme
    }
    
    // Crossfade or hard switch
    if (this.isPlaying && crossfade) {
      await this.crossfadeTo(themeName);
    } else {
      this.stopImmediate();
      this.startTheme(themeName);
    }
  }

  /**
   * Start ambient music generator
   */
  startTheme(themeName) {
    const theme = MUSIC_THEMES[themeName];
    if (!theme || !this.audioContext) {
      console.error('🎵 Cannot start theme:', themeName);
      return;
    }
    
    console.log('🎵 Starting ambient theme:', themeName);
    
    this.currentTheme = themeName;
    this.isPlaying = true;
    this.lastNoteTime = this.audioContext.currentTime;
    this.lastNoteIndex = -1;
    
    // Start ambient scheduler
    this.startAmbientScheduler(theme);
  }

  /**
   * Ambient scheduler - generates random notes at irregular intervals
   */
  startAmbientScheduler(theme) {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
    }
    
    const scale = SCALES[theme.scale] || SCALES.bright;
    const msPerNote = (60 * 1000) / theme.notesPerMinute;
    
    // Check every 500ms for natural randomness
    this.schedulerTimer = setInterval(() => {
      if (!this.isPlaying || !this.audioContext) {
        this.stopScheduler();
        return;
      }
      
      const now = this.audioContext.currentTime;
      const timeSinceLastNote = (now - this.lastNoteTime) * 1000;
      
      // Random timing: vary by ±50%
      const targetDelay = msPerNote * (0.5 + Math.random());
      
      if (timeSinceLastNote >= targetDelay) {
        // Decide: play note or rest?
        if (Math.random() > theme.restChance) {
          this.playAmbientSound(theme, scale, now);
        }
        this.lastNoteTime = now;
      }
    }, 500);
  }

  /**
   * Play ambient sound (single note or chord)
   */
  playAmbientSound(theme, scale, time) {
    const ctx = this.audioContext;
    
    // Pick random note (avoid repeating last)
    let noteIndex;
    do {
      noteIndex = Math.floor(Math.random() * scale.length);
    } while (noteIndex === this.lastNoteIndex && scale.length > 1);
    this.lastNoteIndex = noteIndex;
    
    const baseFreq = scale[noteIndex];
    
    // Random duration
    const duration = theme.noteLength.min + 
      Math.random() * (theme.noteLength.max - theme.noteLength.min);
    
    // Play chord or single note?
    if (Math.random() < theme.chordChance) {
      // Play soft chord (root + fifth or root + third)
      this.playNote(baseFreq, duration, theme.volume * 0.7, time);
      
      // Add harmony note (quieter)
      const harmonyType = Math.random() > 0.5 ? 1.5 : 1.25; // Fifth or major third
      this.playNote(baseFreq * harmonyType, duration, theme.volume * 0.4, time + 0.05);
    } else {
      // Single note
      this.playNote(baseFreq, duration, theme.volume, time);
    }
  }

  /**
   * Play a single ambient note with soft envelope
   */
  playNote(freq, duration, volume, time) {
    const ctx = this.audioContext;
    
    try {
      // Create oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      // Soft triangle or sine wave
      osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      
      // Add slight random detuning for organic feel
      osc.detune.value = (Math.random() - 0.5) * 10;
      
      // Lowpass filter for warmth
      filter.type = 'lowpass';
      filter.frequency.value = 600 + Math.random() * 200;
      filter.Q.value = 0.3;
      
      // Very soft envelope: slow attack, long sustain, slow release
      const attackTime = 0.15 + Math.random() * 0.1;
      const releaseTime = duration * 0.4;
      const sustainTime = duration - attackTime - releaseTime;
      
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(volume, time + attackTime);
      gain.gain.setValueAtTime(volume * 0.8, time + attackTime + sustainTime);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      
      // Connect
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(time);
      osc.stop(time + duration + 0.1);
      
      // Track for cleanup
      this.activeOscillators.push(osc);
      osc.onended = () => {
        const idx = this.activeOscillators.indexOf(osc);
        if (idx > -1) this.activeOscillators.splice(idx, 1);
      };
      
    } catch (e) {
      console.error('🎵 Error playing note:', e);
    }
  }

  /**
   * Stop scheduler
   */
  stopScheduler() {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  /**
   * Crossfade to new theme
   */
  async crossfadeTo(newTheme) {
    if (this.isFading) return;
    this.isFading = true;
    
    // Fade out current
    const fadeTime = 1.5;
    if (this.masterGain && this.audioContext) {
      const now = this.audioContext.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.001, now + fadeTime);
    }
    
    // After fade, switch theme
    setTimeout(() => {
      this.stopImmediate();
      this.masterGain.gain.value = this.volume;
      this.startTheme(newTheme);
      this.isFading = false;
    }, fadeTime * 1000);
  }

  /**
   * Stop music immediately
   */
  stopImmediate() {
    this.isPlaying = false;
    this.currentTheme = null;
    this.stopScheduler();
    
    // Stop all active oscillators
    this.activeOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.activeOscillators = [];
  }

  /**
   * Fade out and stop
   */
  async stop(fadeDuration = 1) {
    if (!this.isPlaying || !this.audioContext) return;
    
    // Fade out
    if (this.masterGain) {
      const now = this.audioContext.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.001, now + fadeDuration);
    }
    
    setTimeout(() => {
      this.stopImmediate();
      if (this.masterGain) {
        this.masterGain.gain.value = this.volume;
      }
    }, fadeDuration * 1000);
  }

  /**
   * Pause music
   */
  pause() {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol)) * 0.3; // Max 0.3
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  /**
   * Get current volume
   */
  getVolume() {
    return this.volume / 0.3;
  }

  /**
   * Check if playing
   */
  get playing() {
    return this.isPlaying;
  }

  /**
   * Get current theme
   */
  get theme() {
    return this.currentTheme;
  }

  /**
   * Full cleanup
   */
  cleanup() {
    this.stopImmediate();
    
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    
    this.masterGain = null;
  }
}

// ============================================
// 🌍 SINGLETON INSTANCE
// ============================================

let musicManager = null;

export function getBackgroundMusic() {
  if (typeof window === 'undefined') return null;
  
  if (!musicManager) {
    musicManager = new BackgroundMusicManager();
  }
  return musicManager;
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (musicManager) {
      musicManager.cleanup();
    }
  });
  
  // Handle visibility change - pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (!musicManager) return;
    
    if (document.hidden) {
      musicManager.pause();
    } else if (musicManager.isPlaying) {
      musicManager.resume();
    }
  });
}

export default getBackgroundMusic;
