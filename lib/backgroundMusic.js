/**
 * 🎵 BACKGROUND MUSIC MANAGER
 * 
 * Hệ thống nhạc nền xuyên suốt game với nhiều theme:
 * - Adventure: Khám phá map, học bài
 * - Battle: Luyện tập, thi đấu
 * - Victory: Hoàn thành, nhận thưởng
 * - Calm: Menu, chờ đợi
 * 
 * Features:
 * - Crossfade giữa các theme mượt mà
 * - Auto-cleanup khi không dùng
 * - Memory efficient với Web Audio API
 * - Persist across page navigation
 */

// ============================================
// 🎼 MUSIC THEMES - Procedural Generation
// ============================================

const MUSIC_THEMES = {
  // 🗺️ Adventure - Khám phá, học bài
  adventure: {
    tempo: 90,
    key: 'C',
    chords: [
      [261.63, 329.63, 392.00], // C major
      [293.66, 369.99, 440.00], // D minor  
      [329.63, 415.30, 493.88], // E minor
      [349.23, 440.00, 523.25], // F major
    ],
    bassLine: [130.81, 146.83, 164.81, 174.61],
    melody: [523.25, 587.33, 659.25, 698.46, 783.99],
    style: 'gentle',
  },

  // ⚔️ Battle - Luyện tập, thi đấu
  battle: {
    tempo: 120,
    key: 'Am',
    chords: [
      [220.00, 261.63, 329.63], // A minor
      [196.00, 246.94, 293.66], // G major
      [174.61, 220.00, 261.63], // F major
      [164.81, 207.65, 246.94], // E major
    ],
    bassLine: [110.00, 98.00, 87.31, 82.41],
    melody: [440.00, 493.88, 523.25, 587.33, 659.25],
    style: 'energetic',
  },

  // 🏆 Victory - Hoàn thành, nhận thưởng
  victory: {
    tempo: 100,
    key: 'G',
    chords: [
      [392.00, 493.88, 587.33], // G major
      [329.63, 415.30, 493.88], // E minor
      [261.63, 329.63, 392.00], // C major
      [293.66, 369.99, 440.00], // D major
    ],
    bassLine: [196.00, 164.81, 130.81, 146.83],
    melody: [783.99, 880.00, 987.77, 1046.50],
    style: 'triumphant',
  },

  // 🌙 Calm - Menu, chờ đợi
  calm: {
    tempo: 60,
    key: 'F',
    chords: [
      [349.23, 440.00, 523.25], // F major 7
      [261.63, 329.63, 392.00], // C major
      [293.66, 349.23, 440.00], // D minor 7
      [220.00, 261.63, 329.63], // A minor
    ],
    bassLine: [87.31, 65.41, 73.42, 55.00],
    melody: [523.25, 587.33, 659.25, 698.46],
    style: 'ambient',
  },
};

// ============================================
// 🎹 MUSIC ENGINE
// ============================================

class BackgroundMusicManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.currentTheme = null;
    this.isPlaying = false;
    this.volume = 0.15; // Volume mặc định (tăng để nghe rõ hơn)
    
    // Active audio nodes for cleanup
    this.activeNodes = {
      oscillators: [],
      gains: [],
      filters: [],
    };
    
    // Scheduling
    this.schedulerInterval = null;
    this.nextNoteTime = 0;
    this.currentChordIndex = 0;
    this.currentBeat = 0;
    
    // Crossfade
    this.fadeGain = null;
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
      
      // Fade gain for crossfading
      this.fadeGain = this.audioContext.createGain();
      this.fadeGain.gain.value = 1;
      this.fadeGain.connect(this.masterGain);
      
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
   * 🎵 Play a music theme
   * @param {string} themeName - 'adventure', 'battle', 'victory', 'calm'
   * @param {boolean} crossfade - Fade between themes
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
      console.log('🎵 Initializing AudioContext...');
      const success = await this.init();
      if (!success) {
        console.error('🎵 Failed to init AudioContext');
        return;
      }
      console.log('🎵 AudioContext initialized successfully');
    }
    
    const resumed = await this.resume();
    console.log('🎵 AudioContext state:', this.audioContext.state, 'resumed:', resumed);
    
    // If same theme, do nothing
    if (this.currentTheme === themeName && this.isPlaying) {
      return;
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
   * Start playing a theme
   */
  startTheme(themeName) {
    const theme = MUSIC_THEMES[themeName];
    if (!theme || !this.audioContext) return;
    
    this.currentTheme = themeName;
    this.isPlaying = true;
    this.currentChordIndex = 0;
    this.currentBeat = 0;
    this.nextNoteTime = this.audioContext.currentTime;
    
    // Start scheduler
    this.startScheduler(theme);
  }

  /**
   * Music scheduler - generates notes ahead of time
   */
  startScheduler(theme) {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
    }
    
    const scheduleAheadTime = 0.1; // Schedule 100ms ahead
    const lookAhead = 25; // Check every 25ms
    
    this.schedulerInterval = setInterval(() => {
      if (!this.isPlaying || !this.audioContext) {
        clearInterval(this.schedulerInterval);
        return;
      }
      
      while (this.nextNoteTime < this.audioContext.currentTime + scheduleAheadTime) {
        this.scheduleNote(theme, this.nextNoteTime);
        this.advanceNote(theme);
      }
    }, lookAhead);
  }

  /**
   * Schedule a musical note/chord
   */
  scheduleNote(theme, time) {
    const ctx = this.audioContext;
    const beatsPerChord = 4;
    
    // Play chord on beat 0
    if (this.currentBeat === 0) {
      this.playChord(theme.chords[this.currentChordIndex], time, theme);
    }
    
    // Play bass on beats 0 and 2
    if (this.currentBeat % 2 === 0) {
      this.playBass(theme.bassLine[this.currentChordIndex], time, theme);
    }
    
    // Play melody notes randomly
    if (Math.random() > 0.6 && theme.style !== 'ambient') {
      const melodyNote = theme.melody[Math.floor(Math.random() * theme.melody.length)];
      this.playMelody(melodyNote, time, theme);
    }
  }

  /**
   * Advance to next beat
   */
  advanceNote(theme) {
    const secondsPerBeat = 60.0 / theme.tempo;
    this.nextNoteTime += secondsPerBeat / 2; // Eighth notes
    
    this.currentBeat++;
    if (this.currentBeat >= 8) { // 8 eighth notes = 1 bar
      this.currentBeat = 0;
      this.currentChordIndex = (this.currentChordIndex + 1) % theme.chords.length;
    }
  }

  /**
   * Play a chord (pad sound)
   */
  playChord(notes, time, theme) {
    const ctx = this.audioContext;
    const duration = (60 / theme.tempo) * 4; // Full bar
    
    notes.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = theme.style === 'energetic' ? 'sawtooth' : 'sine';
      osc.frequency.value = freq;
      
      filter.type = 'lowpass';
      filter.frequency.value = theme.style === 'ambient' ? 300 : 600;
      filter.Q.value = 1;
      
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(
        theme.style === 'energetic' ? 0.06 : 0.04,
        time + 0.1
      );
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.1);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.fadeGain);
      
      osc.start(time);
      osc.stop(time + duration);
      
      // Track for cleanup
      this.activeNodes.oscillators.push(osc);
      this.activeNodes.gains.push(gain);
      this.activeNodes.filters.push(filter);
      
      // Auto-cleanup after note ends
      osc.onended = () => {
        this.removeNode(osc, 'oscillators');
        this.removeNode(gain, 'gains');
        this.removeNode(filter, 'filters');
      };
    });
  }

  /**
   * Play bass note
   */
  playBass(freq, time, theme) {
    const ctx = this.audioContext;
    const duration = 60 / theme.tempo;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(
      theme.style === 'energetic' ? 0.1 : 0.06,
      time + 0.02
    );
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.9);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.fadeGain);
    
    osc.start(time);
    osc.stop(time + duration);
    
    this.activeNodes.oscillators.push(osc);
    osc.onended = () => this.removeNode(osc, 'oscillators');
  }

  /**
   * Play melody note
   */
  playMelody(freq, time, theme) {
    const ctx = this.audioContext;
    const duration = (60 / theme.tempo) * (Math.random() > 0.5 ? 0.5 : 0.25);
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = theme.style === 'triumphant' ? 'triangle' : 'sine';
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.05, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    osc.connect(gain);
    gain.connect(this.fadeGain);
    
    osc.start(time);
    osc.stop(time + duration);
    
    this.activeNodes.oscillators.push(osc);
    osc.onended = () => this.removeNode(osc, 'oscillators');
  }

  /**
   * Crossfade to new theme
   */
  async crossfadeTo(newTheme) {
    if (this.isFading) return;
    this.isFading = true;
    
    const fadeDuration = 1.5; // seconds
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Fade out current
    this.fadeGain.gain.setValueAtTime(1, now);
    this.fadeGain.gain.linearRampToValueAtTime(0, now + fadeDuration);
    
    // After fade out, switch theme
    setTimeout(() => {
      this.stopImmediate();
      this.fadeGain.gain.value = 0;
      
      // Start new theme
      this.startTheme(newTheme);
      
      // Fade in
      const fadeInTime = this.audioContext.currentTime;
      this.fadeGain.gain.setValueAtTime(0, fadeInTime);
      this.fadeGain.gain.linearRampToValueAtTime(1, fadeInTime + fadeDuration);
      
      setTimeout(() => {
        this.isFading = false;
      }, fadeDuration * 1000);
    }, fadeDuration * 1000);
  }

  /**
   * Stop music immediately
   */
  stopImmediate() {
    this.isPlaying = false;
    this.currentTheme = null;
    
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    
    // Stop all oscillators
    this.activeNodes.oscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    
    // Clear arrays
    this.activeNodes.oscillators = [];
    this.activeNodes.gains = [];
    this.activeNodes.filters = [];
  }

  /**
   * Fade out and stop
   */
  async stop(fadeDuration = 1) {
    if (!this.isPlaying || !this.audioContext) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    this.fadeGain.gain.setValueAtTime(this.fadeGain.gain.value, now);
    this.fadeGain.gain.linearRampToValueAtTime(0, now + fadeDuration);
    
    setTimeout(() => {
      this.stopImmediate();
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
    this.volume = Math.max(0, Math.min(1, vol)) * 0.25; // Max 0.25 (tăng để nghe rõ hơn)
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
    console.log('🎵 Volume set to:', this.volume);
  }

  /**
   * Get current volume
   */
  getVolume() {
    return this.volume / 0.15;
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
   * Remove node from tracking
   */
  removeNode(node, type) {
    const index = this.activeNodes[type].indexOf(node);
    if (index > -1) {
      this.activeNodes[type].splice(index, 1);
    }
  }

  /**
   * 🧹 Full cleanup - call when done with music
   */
  cleanup() {
    this.stopImmediate();
    
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    
    this.masterGain = null;
    this.fadeGain = null;
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
