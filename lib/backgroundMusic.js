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
    this.volume = 0.3; // Volume mặc định
    
    // Simplified: just use 2 oscillators for drone
    this.droneOscillators = [];
    this.droneGains = [];
    
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
   * Start playing a theme - Simplified drone approach
   */
  startTheme(themeName) {
    const theme = MUSIC_THEMES[themeName];
    if (!theme || !this.audioContext) {
      console.error('🎵 Cannot start theme:', themeName, 'theme:', !!theme, 'ctx:', !!this.audioContext);
      return;
    }
    
    console.log('🎵 Starting theme:', themeName);
    
    this.currentTheme = themeName;
    this.isPlaying = true;
    
    // Simple drone approach - just 2-3 oscillators for ambient pad
    this.startDrone(theme);
  }

  /**
   * Start simple drone sound
   */
  startDrone(theme) {
    const ctx = this.audioContext;
    
    // Stop any existing drone
    this.stopDrone();
    
    // Use first chord as drone
    const droneNotes = theme.chords[0];
    const bassNote = theme.bassLine[0];
    
    // Create bass drone
    try {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      const bassFilter = ctx.createBiquadFilter();
      
      bassOsc.type = 'sine';
      bassOsc.frequency.value = bassNote;
      bassFilter.type = 'lowpass';
      bassFilter.frequency.value = 150;
      bassGain.gain.value = 0.15;
      
      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.masterGain);
      bassOsc.start();
      
      this.droneOscillators.push(bassOsc);
      this.droneGains.push(bassGain);
      
      // Create pad drone (just 2 notes for harmony)
      droneNotes.slice(0, 2).forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gain.gain.value = 0.08;
        
        // Add slight LFO for movement
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.2 + i * 0.1; // Slow wobble
        lfoGain.gain.value = 3; // Subtle pitch variation
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        
        this.droneOscillators.push(osc, lfo);
        this.droneGains.push(gain);
      });
      
      console.log('🎵 Drone started with', this.droneOscillators.length, 'oscillators');
    } catch (e) {
      console.error('🎵 Error starting drone:', e);
    }
  }

  /**
   * Stop drone sounds
   */
  stopDrone() {
    this.droneOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.droneOscillators = [];
    this.droneGains = [];
  }

  /**
   * Crossfade to new theme
   */
  async crossfadeTo(newTheme) {
    if (this.isFading) return;
    this.isFading = true;
    
    // Fade out current drone
    this.droneGains.forEach(gain => {
      const now = this.audioContext.currentTime;
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 1);
    });
    
    // After fade out, switch theme
    setTimeout(() => {
      this.stopDrone();
      this.startTheme(newTheme);
      this.isFading = false;
    }, 1000);
  }

  /**
   * Stop music immediately
   */
  stopImmediate() {
    this.isPlaying = false;
    this.currentTheme = null;
    this.stopDrone();
  }

  /**
   * Fade out and stop
   */
  async stop(fadeDuration = 1) {
    if (!this.isPlaying || !this.audioContext) return;
    
    // Fade out drone
    this.droneGains.forEach(gain => {
      const now = this.audioContext.currentTime;
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0.001, now + fadeDuration);
    });
    
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
    this.volume = Math.max(0, Math.min(1, vol)) * 0.5; // Max 0.5
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
    console.log('🎵 Volume set to:', this.volume);
  }

  /**
   * Get current volume
   */
  getVolume() {
    return this.volume / 0.5;
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
   * 🧹 Full cleanup - call when done with music
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
