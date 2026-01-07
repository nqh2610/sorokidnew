/**
 * 🎵 BACKGROUND MUSIC MANAGER v2
 * 
 * Hệ thống nhạc nền dễ nghe với melody rõ ràng
 * Sử dụng arpeggio nhẹ nhàng thay vì drone liên tục
 * 
 * Features:
 * - Giai điệu du dương, không ong ong
 * - Có khoảng nghỉ giữa các note
 * - Volume nhẹ nhàng, phù hợp game trẻ em
 */

// ============================================
// 🎼 MUSIC THEMES - Melodic Patterns
// ============================================

const MUSIC_THEMES = {
  // 🗺️ Adventure - Khám phá, học bài (nhẹ nhàng như lullaby)
  adventure: {
    tempo: 72, // BPM chậm, thư giãn
    // Melody pattern: C major pentatonic, nghe như nhạc thiếu nhi
    notes: [
      { freq: 523.25, duration: 0.3 }, // C5
      { freq: 587.33, duration: 0.3 }, // D5  
      { freq: 659.25, duration: 0.5 }, // E5 (dài hơn)
      { freq: 523.25, duration: 0.3 }, // C5
      { freq: 392.00, duration: 0.5 }, // G4
      { freq: 440.00, duration: 0.3 }, // A4
      { freq: 523.25, duration: 0.7 }, // C5 (kết)
      { freq: 0, duration: 0.8 },      // Nghỉ
    ],
    volume: 0.08,
  },

  // ⚔️ Battle - Luyện tập (vui vẻ, không căng thẳng)
  battle: {
    tempo: 100,
    notes: [
      { freq: 440.00, duration: 0.2 }, // A4
      { freq: 523.25, duration: 0.2 }, // C5
      { freq: 659.25, duration: 0.3 }, // E5
      { freq: 523.25, duration: 0.2 }, // C5
      { freq: 440.00, duration: 0.2 }, // A4
      { freq: 392.00, duration: 0.4 }, // G4
      { freq: 0, duration: 0.3 },      // Nghỉ
      { freq: 349.23, duration: 0.2 }, // F4
      { freq: 392.00, duration: 0.2 }, // G4
      { freq: 440.00, duration: 0.4 }, // A4
      { freq: 0, duration: 0.5 },      // Nghỉ
    ],
    volume: 0.07,
  },

  // 🏆 Victory - Hoàn thành
  victory: {
    tempo: 90,
    notes: [
      { freq: 523.25, duration: 0.25 }, // C5
      { freq: 659.25, duration: 0.25 }, // E5
      { freq: 783.99, duration: 0.25 }, // G5
      { freq: 1046.50, duration: 0.5 }, // C6
      { freq: 0, duration: 0.3 },       // Nghỉ
      { freq: 783.99, duration: 0.3 },  // G5
      { freq: 659.25, duration: 0.3 },  // E5
      { freq: 523.25, duration: 0.6 },  // C5
      { freq: 0, duration: 0.8 },       // Nghỉ dài
    ],
    volume: 0.08,
  },

  // 🌙 Calm - Menu, chờ đợi (rất nhẹ)
  calm: {
    tempo: 50,
    notes: [
      { freq: 349.23, duration: 0.6 }, // F4
      { freq: 0, duration: 0.4 },      // Nghỉ
      { freq: 440.00, duration: 0.6 }, // A4
      { freq: 0, duration: 0.4 },      // Nghỉ
      { freq: 523.25, duration: 0.8 }, // C5
      { freq: 0, duration: 0.6 },      // Nghỉ dài
      { freq: 392.00, duration: 0.6 }, // G4
      { freq: 0, duration: 0.8 },      // Nghỉ
    ],
    volume: 0.06,
  },
};

// ============================================
// 🎹 MUSIC ENGINE - Simple Melody Player
// ============================================

class BackgroundMusicManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.currentTheme = null;
    this.isPlaying = false;
    this.volume = 0.25; // Master volume
    
    // Melody state
    this.currentNoteIndex = 0;
    this.nextNoteTime = 0;
    this.schedulerTimer = null;
    
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
   * Start playing theme melody
   */
  startTheme(themeName) {
    const theme = MUSIC_THEMES[themeName];
    if (!theme || !this.audioContext) {
      console.error('🎵 Cannot start theme:', themeName);
      return;
    }
    
    console.log('🎵 Starting melody theme:', themeName);
    
    this.currentTheme = themeName;
    this.isPlaying = true;
    this.currentNoteIndex = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.1;
    
    // Start melody scheduler
    this.startScheduler(theme);
  }

  /**
   * Melody scheduler - plays notes in sequence
   */
  startScheduler(theme) {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
    }
    
    const scheduleAhead = 0.2; // Schedule 200ms ahead
    const interval = 50; // Check every 50ms
    
    this.schedulerTimer = setInterval(() => {
      if (!this.isPlaying || !this.audioContext) {
        this.stopScheduler();
        return;
      }
      
      // Schedule notes that are coming up
      while (this.nextNoteTime < this.audioContext.currentTime + scheduleAhead) {
        this.playNote(theme, this.nextNoteTime);
        this.advanceNote(theme);
      }
    }, interval);
  }

  /**
   * Play a single note
   */
  playNote(theme, time) {
    const note = theme.notes[this.currentNoteIndex];
    if (!note) return;
    
    // Skip if it's a rest (freq = 0)
    if (note.freq === 0) return;
    
    const ctx = this.audioContext;
    const duration = (60 / theme.tempo) * note.duration;
    
    try {
      // Create oscillator with soft sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      // Use triangle wave for softer sound
      osc.type = 'triangle';
      osc.frequency.value = note.freq;
      
      // Lowpass filter to remove harshness
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.5;
      
      // Envelope: soft attack, sustain, soft release
      const attackTime = 0.05;
      const releaseTime = duration * 0.3;
      const sustainTime = duration - attackTime - releaseTime;
      
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(theme.volume, time + attackTime);
      gain.gain.setValueAtTime(theme.volume, time + attackTime + sustainTime);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      
      // Connect: osc -> filter -> gain -> master
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(time);
      osc.stop(time + duration + 0.05);
      
      // Track for cleanup
      this.activeOscillators.push(osc);
      
      // Auto-cleanup after note ends
      osc.onended = () => {
        const idx = this.activeOscillators.indexOf(osc);
        if (idx > -1) this.activeOscillators.splice(idx, 1);
      };
      
    } catch (e) {
      console.error('🎵 Error playing note:', e);
    }
  }

  /**
   * Advance to next note in sequence
   */
  advanceNote(theme) {
    const note = theme.notes[this.currentNoteIndex];
    const noteDuration = (60 / theme.tempo) * (note?.duration || 0.3);
    
    this.nextNoteTime += noteDuration;
    this.currentNoteIndex = (this.currentNoteIndex + 1) % theme.notes.length;
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
    const fadeTime = 1;
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
