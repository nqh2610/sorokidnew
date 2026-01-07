/**
 * 🎮 ADVENTURE SOUND MANAGER
 * 
 * Hệ thống âm thanh game hóa cho "Đi Tìm Kho Báu Tri Thức"
 * Tạo cảm giác phiêu lưu – khám phá – hồi hộp – chiến thắng
 * 
 * THIẾT KẾ ÂM THANH (Story-driven):
 * ─────────────────────────────────
 * 1. KHÁM PHÁ: Âm thanh nhẹ nhàng, tò mò khi di chuyển trên map
 * 2. THỬ THÁCH: Âm thanh hồi hộp khi vào bài học/boss
 * 3. CHIẾN THẮNG: Fanfare khi hoàn thành, tìm kho báu
 * 4. TIẾN BỘ: Âm thanh reward khi đạt milestone
 * 
 * NGUYÊN TẮC:
 * - Không gây mệt tai khi nghe lâu
 * - Khích lệ việc học, không gây áp lực
 * - Âm thanh sai nhẹ nhàng, không tiêu cực
 * 
 * Usage:
 * import { useGameSound } from '@/lib/useGameSound';
 * const { play, playMusic, stopMusic } = useGameSound();
 * play('stageComplete');
 */

// ============================================
// 🎵 ADVENTURE SOUND EFFECTS - Web Audio API
// ============================================

export const ADVENTURE_SOUNDS = {
  // ========== MAP NAVIGATION ==========
  
  // 🗺️ Mở map / vào map - Gentle chime (nhẹ nhàng)
  mapOpen: (ctx, time) => {
    const notes = [392, 523, 659]; // G4, C5, E5 - Gentle chord
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle'; // Softer than sine
      osc.frequency.value = freq;
      filter.type = 'lowpass';
      filter.frequency.value = 600; // Reduce harshness
      
      gain.gain.setValueAtTime(0, time + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.06, time + i * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
      osc.start(time + i * 0.08);
      osc.stop(time + 0.5);
    });
  },

  // 📍 Chọn stage - Soft click (nhẹ nhàng, không chói)
  stageSelect: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, time); // A4 - not too high
    osc.frequency.exponentialRampToValueAtTime(523, time + 0.08); // To C5
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.start(time);
    osc.stop(time + 0.12);
  },

  // 🔓 Mở khóa stage mới - Gentle unlock chime
  stageUnlock: (ctx, time) => {
    const melody = [392, 494, 587, 784]; // G4-B4-D5-G5 - Softer, lower
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      
      gain.gain.setValueAtTime(0, time + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.08, time + i * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, time + i * 0.1 + 0.25);
      osc.start(time + i * 0.1);
      osc.stop(time + i * 0.1 + 0.25);
    });
  },

  // ========== GAMEPLAY ==========

  // ✅ Trả lời đúng - Gentle happy sound
  correct: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(392, time);      // G4
    osc.frequency.setValueAtTime(494, time + 0.08); // B4
    osc.frequency.setValueAtTime(587, time + 0.16); // D5
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.12, time + 0.02);
    gain.gain.setValueAtTime(0.12, time + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    osc.start(time);
    osc.stop(time + 0.3);
  },

  // ❌ Trả lời sai - Very gentle (không tiêu cực)
  wrong: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(294, time); // D4
    osc.frequency.exponentialRampToValueAtTime(220, time + 0.15); // A3
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.start(time);
    osc.stop(time + 0.15);
  },

  // 🔥 Combo streak - Gentle sparkle
  combo: (ctx, time) => {
    [0, 0.05, 0.1].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.value = 600 + i * 100; // Lower frequencies
      filter.type = 'lowpass';
      filter.frequency.value = 900;
      
      gain.gain.setValueAtTime(0, time + delay);
      gain.gain.linearRampToValueAtTime(0.06, time + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + delay + 0.1);
      osc.start(time + delay);
      osc.stop(time + delay + 0.1);
    });
  },

  // ⏰ Timer warning - Gentle tick (không gây stress)
  timerWarning: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle'; // Not square - softer
    osc.frequency.value = 330; // E4 - lower
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.05, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    osc.start(time);
    osc.stop(time + 0.08);
  },

  // ========== ACHIEVEMENTS ==========

  // 🎯 Hoàn thành stage - Gentle victory chime
  stageComplete: (ctx, time) => {
    const melody = [392, 440, 494, 587, 784]; // G4-A4-B4-D5-G5 - Lower, gentler
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      filter.type = 'lowpass';
      filter.frequency.value = 900;
      
      gain.gain.setValueAtTime(0, time + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.1, time + i * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, time + i * 0.12 + 0.3);
      osc.start(time + i * 0.12);
      osc.stop(time + i * 0.12 + 0.3);
    });
  },

  // 👹 Đánh bại Boss - Gentle victory
  bossDefeat: (ctx, time) => {
    // Gentle arpeggiated chords
    const chords = [
      { notes: [262, 330, 392], delay: 0, duration: 0.35 },     // C4 chord
      { notes: [294, 370, 440], delay: 0.4, duration: 0.35 },   // D4 chord
      { notes: [330, 415, 494, 659], delay: 0.8, duration: 0.5 } // E4 chord + high
    ];
    
    chords.forEach(({ notes, delay, duration }) => {
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        
        const noteDelay = delay + i * 0.03;
        gain.gain.setValueAtTime(0, time + noteDelay);
        gain.gain.linearRampToValueAtTime(0.08, time + noteDelay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, time + noteDelay + duration);
        osc.start(time + noteDelay);
        osc.stop(time + noteDelay + duration);
      });
    });
  },

  // 🗺️ Hoàn thành Zone - Zone conquered
  zoneComplete: (ctx, time) => {
    const fanfare = [
      { freq: 523, delay: 0 },     // C5
      { freq: 659, delay: 0.1 },   // E5
      { freq: 784, delay: 0.2 },   // G5
      { freq: 1047, delay: 0.35 }, // C6
      { freq: 1175, delay: 0.45 }, // D6
      { freq: 1319, delay: 0.55 }, // E6
      { freq: 1568, delay: 0.7 },  // G6
    ];
    
    fanfare.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + delay);
      gain.gain.setValueAtTime(0.15, time + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, time + delay + 0.2);
      osc.start(time + delay);
      osc.stop(time + delay + 0.2);
    });
  },

  // 🏆 Đạt chứng chỉ - Grand achievement
  certificateEarned: (ctx, time) => {
    // Majestic chord progression
    const progression = [
      { notes: [261, 329, 392], delay: 0, type: 'sine' },         // C major
      { notes: [293, 370, 440], delay: 0.4, type: 'triangle' },   // D minor
      { notes: [349, 440, 523], delay: 0.8, type: 'sine' },       // F major
      { notes: [392, 494, 587, 784, 1047], delay: 1.2, type: 'triangle' } // G major (full)
    ];

    progression.forEach(({ notes, delay, type }) => {
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time + delay);
        gain.gain.setValueAtTime(0.1, time + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, time + delay + 0.5);
        osc.start(time + delay);
        osc.stop(time + delay + 0.5);
      });
    });
  },

  // 💎 Tìm thấy kho báu - Treasure discovered!
  treasureFound: (ctx, time) => {
    // Magical ascending arpeggio
    const sparkles = [523, 659, 784, 1047, 1319, 1568, 2093];
    sparkles.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + i * 0.08);
      gain.gain.setValueAtTime(0.12 - i * 0.01, time + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.08 + 0.3);
      osc.start(time + i * 0.08);
      osc.stop(time + i * 0.08 + 0.3);
    });
  },

  // ========== UI SOUNDS ==========

  // 👆 Button click
  click: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, time);
    osc.frequency.exponentialRampToValueAtTime(800, time + 0.04);
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
    osc.start(time);
    osc.stop(time + 0.04);
  },

  // ⭐ Nhận sao
  star: (ctx, time) => {
    [0, 0.06, 0.12].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + i * 200, time + delay);
      gain.gain.setValueAtTime(0.08, time + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, time + delay + 0.08);
      osc.start(time + delay);
      osc.stop(time + delay + 0.08);
    });
  },

  // 📈 Level up
  levelUp: (ctx, time) => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time + i * 0.1);
      gain.gain.setValueAtTime(0.12, time + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.1 + 0.18);
      osc.start(time + i * 0.1);
      osc.stop(time + i * 0.1 + 0.18);
    });
  },

  // 🎮 Game start
  gameStart: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, time);
    osc.frequency.setValueAtTime(554, time + 0.12);
    osc.frequency.setValueAtTime(659, time + 0.24);
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.36);
    osc.start(time);
    osc.stop(time + 0.36);
  },

  // 🔔 Notification / popup
  notification: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, time);
    osc.frequency.setValueAtTime(1047, time + 0.08);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    osc.start(time);
    osc.stop(time + 0.15);
  },

  // 🚪 Zone enter - Mystical portal
  zoneEnter: (ctx, time) => {
    const notes = [261, 329, 392, 523]; // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      filter.type = 'lowpass';
      filter.frequency.value = 800 + i * 200;
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0, time + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.1, time + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.1 + 0.3);
      
      osc.start(time + i * 0.1);
      osc.stop(time + i * 0.1 + 0.3);
    });
  },

  // ❓ Question appear - Soft attention
  questionAppear: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, time);
    osc.frequency.setValueAtTime(880, time + 0.05);
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    osc.start(time);
    osc.stop(time + 0.1);
  },

  // 📤 Popup open - Soft whoosh up
  popupOpen: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, time);
    osc.frequency.exponentialRampToValueAtTime(600, time + 0.1);
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    osc.start(time);
    osc.stop(time + 0.1);
  },

  // 📥 Popup close - Soft whoosh down
  popupClose: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, time);
    osc.frequency.exponentialRampToValueAtTime(300, time + 0.08);
    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
    osc.start(time);
    osc.stop(time + 0.08);
  },

  // 🔥 Streak milestone - Exciting build
  streakMilestone: (ctx, time) => {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time + i * 0.06);
      gain.gain.setValueAtTime(0.12, time + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.06 + 0.15);
      osc.start(time + i * 0.06);
      osc.stop(time + i * 0.06 + 0.15);
    });
  },

  // 💎 Diamond earned - Sparkly chime
  diamondEarned: (ctx, time) => {
    const sparkles = [1047, 1319, 1568, 2093];
    sparkles.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + i * 0.05);
      gain.gain.setValueAtTime(0.1 - i * 0.02, time + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.05 + 0.2);
      osc.start(time + i * 0.05);
      osc.stop(time + i * 0.05 + 0.2);
    });
  },

  // 🎁 Reward claimed - Satisfying collect
  rewardClaimed: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, time);
    osc.frequency.setValueAtTime(784, time + 0.08);
    osc.frequency.setValueAtTime(1047, time + 0.16);
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
    osc.start(time);
    osc.stop(time + 0.25);
  },

  // ⏱️ Countdown tick
  countdown: (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, time);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    osc.start(time);
    osc.stop(time + 0.05);
  },

  // ⏰ Time up - Dramatic end
  timeUp: (ctx, time) => {
    const notes = [440, 349, 294];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time + i * 0.15);
      gain.gain.setValueAtTime(0.1, time + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.15 + 0.12);
      osc.start(time + i * 0.15);
      osc.stop(time + i * 0.15 + 0.12);
    });
  },
};

// ============================================
// 🎵 AMBIENT MUSIC - Gentle background loops
// ============================================

/**
 * Tạo ambient music nhẹ nhàng bằng Web Audio API
 * Không dùng file, tạo procedural
 */
export function createAmbientMusic(ctx) {
  const musicGain = ctx.createGain();
  musicGain.gain.value = 0.03; // Rất nhẹ
  musicGain.connect(ctx.destination);

  let isPlaying = false;
  let oscillators = [];

  const startMusic = () => {
    if (isPlaying) return;
    isPlaying = true;

    // Gentle pad chord (C major 7)
    const padNotes = [130.81, 164.81, 196, 246.94]; // C3, E3, G3, B3
    
    padNotes.forEach(freq => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;
      
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      
      oscGain.gain.value = 0.25;
      
      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(musicGain);
      
      osc.start();
      oscillators.push(osc);
    });
  };

  const stopMusic = () => {
    isPlaying = false;
    oscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    oscillators = [];
  };

  const setVolume = (vol) => {
    musicGain.gain.value = Math.max(0, Math.min(0.1, vol));
  };

  return { startMusic, stopMusic, setVolume, musicGain };
}

// ============================================
// 📋 SOUND EVENT MAPPING
// ============================================

export const SOUND_EVENTS = {
  // Map navigation
  MAP_OPEN: 'mapOpen',
  STAGE_SELECT: 'stageSelect', 
  STAGE_UNLOCK: 'stageUnlock',
  ZONE_ENTER: 'zoneEnter',
  
  // Gameplay
  ANSWER_CORRECT: 'correct',
  ANSWER_WRONG: 'wrong',
  COMBO: 'combo',
  TIMER_WARNING: 'timerWarning',
  QUESTION_APPEAR: 'questionAppear',
  
  // Achievements
  STAGE_COMPLETE: 'stageComplete',
  BOSS_DEFEAT: 'bossDefeat',
  ZONE_COMPLETE: 'zoneComplete',
  CERTIFICATE_EARNED: 'certificateEarned',
  TREASURE_FOUND: 'treasureFound',
  
  // UI
  CLICK: 'click',
  STAR: 'star',
  LEVEL_UP: 'levelUp',
  GAME_START: 'gameStart',
  NOTIFICATION: 'notification',
  POPUP_OPEN: 'popupOpen',
  POPUP_CLOSE: 'popupClose',
  
  // Special events
  STREAK_MILESTONE: 'streakMilestone',
  DIAMOND_EARNED: 'diamondEarned',
  REWARD_CLAIMED: 'rewardClaimed',
  COUNTDOWN: 'countdown',
  TIME_UP: 'timeUp',
};

export default ADVENTURE_SOUNDS;
