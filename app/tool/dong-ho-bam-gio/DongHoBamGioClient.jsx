'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout, { useFullscreen } from '@/components/ToolLayout/ToolLayout';

// Preset thời gian
const PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '1 phút', seconds: 60 },
  { label: '2 phút', seconds: 120 },
  { label: '3 phút', seconds: 180 },
  { label: '5 phút', seconds: 300 },
  { label: '10 phút', seconds: 600 },
  { label: '15 phút', seconds: 900 },
  { label: '30 phút', seconds: 1800 },
  { label: '1 giờ', seconds: 3600 },
  { label: '2 giờ', seconds: 7200 },
];

// Chế độ âm thanh - Nhiều lựa chọn cho lớp học
const SOUND_MODES = [
  // === Cơ bản ===
  { id: 'none', label: '🔇 Tắt', description: 'Không âm thanh', bgSound: null, category: 'basic' },
  { id: 'bell', label: '🔔 Chuông', description: 'Chỉ báo khi hết giờ', bgSound: null, category: 'basic' },
  { id: 'tick', label: '⏱️ Tick nhanh', description: 'Tik tik mỗi giây', bgSound: 'tick', category: 'basic' },
  { id: 'clock', label: '🕐 Đồng hồ cổ', description: 'Tick-tock chậm rãi', bgSound: 'clock', category: 'basic' },
  { id: 'digital', label: '📟 Digital beep', description: 'Tiếng beep điện tử', bgSound: 'digital', category: 'basic' },
  { id: 'metronome', label: '🎼 Metronome', description: 'Nhịp đều 60 BPM', bgSound: 'metronome', category: 'basic' },
  
  // === Sóng não - Tập trung học tập (Binaural Beats) ===
  { id: 'alpha', label: '🧠 Alpha (10Hz)', description: 'Thư giãn tỉnh táo', bgSound: 'alpha', category: 'brainwave' },
  { id: 'beta_low', label: '🎯 Beta thấp (14Hz)', description: 'Tập trung học bài', bgSound: 'beta_low', category: 'brainwave' },
  { id: 'beta_high', label: '⚡ Beta cao (20Hz)', description: 'Tập trung cao độ', bgSound: 'beta_high', category: 'brainwave' },
  { id: 'gamma', label: '🚀 Gamma (40Hz)', description: 'Siêu tập trung, ghi nhớ', bgSound: 'gamma', category: 'brainwave' },
  { id: 'theta', label: '💭 Theta (6Hz)', description: 'Sáng tạo, học sâu', bgSound: 'theta', category: 'brainwave' },
  { id: 'delta', label: '😴 Delta (2Hz)', description: 'Thư giãn sâu', bgSound: 'delta', category: 'brainwave' },
  { id: 'focus_mix', label: '🎧 Focus Mix', description: 'Alpha + Beta kết hợp', bgSound: 'focus_mix', category: 'brainwave' },
  { id: 'study_boost', label: '📚 Study Boost', description: 'Beta 18Hz + pink noise', bgSound: 'study_boost', category: 'brainwave' },
  
  // === Thiên nhiên ===
  { id: 'rain', label: '🌧️ Mưa nhẹ', description: 'Mưa rơi thư giãn', bgSound: 'rain', category: 'nature' },
  { id: 'rain_heavy', label: '⛈️ Mưa to', description: 'Mưa rào mạnh mẽ', bgSound: 'rain_heavy', category: 'nature' },
  { id: 'thunder', label: '🌩️ Sấm sét', description: 'Mưa + sấm xa xa', bgSound: 'thunder', category: 'nature' },
  { id: 'ocean', label: '🌊 Sóng biển', description: 'Sóng vỗ êm dịu', bgSound: 'ocean', category: 'nature' },
  { id: 'stream', label: '💧 Suối chảy', description: 'Nước róc rách', bgSound: 'stream', category: 'nature' },
  { id: 'forest', label: '🌲 Rừng xanh', description: 'Chim hót, gió lá', bgSound: 'forest', category: 'nature' },
  { id: 'night', label: '🌙 Đêm hè', description: 'Dế kêu, đom đóm', bgSound: 'night', category: 'nature' },
  { id: 'fire', label: '🔥 Lửa trại', description: 'Tiếng lửa cháy', bgSound: 'fire', category: 'nature' },
  { id: 'wind', label: '💨 Gió nhẹ', description: 'Gió thổi vi vu', bgSound: 'wind', category: 'nature' },
  
  // === Không gian ===
  { id: 'cafe', label: '☕ Quán cafe', description: 'Tiếng ồn nhẹ, sáng tạo', bgSound: 'cafe', category: 'ambient' },
  { id: 'library', label: '📚 Thư viện', description: 'Yên tĩnh, tập trung', bgSound: 'library', category: 'ambient' },
  { id: 'office', label: '🏢 Văn phòng', description: 'Bàn phím, máy in', bgSound: 'office', category: 'ambient' },
  { id: 'classroom', label: '🏫 Lớp học', description: 'Viết bảng, giấy', bgSound: 'classroom', category: 'ambient' },
  { id: 'space', label: '🚀 Không gian', description: 'Drone ambient', bgSound: 'space', category: 'ambient' },
  { id: 'underwater', label: '🐠 Dưới nước', description: 'Bong bóng, sóng', bgSound: 'underwater', category: 'ambient' },
  
  // === Nhịp điệu ===
  { id: 'heartbeat', label: '💓 Tim đập', description: 'Nhịp thư giãn 70 BPM', bgSound: 'heartbeat', category: 'rhythm' },
  { id: 'heartbeat_fast', label: '💗 Tim nhanh', description: 'Nhịp 120 BPM, hồi hộp', bgSound: 'heartbeat_fast', category: 'rhythm' },
  { id: 'urgent', label: '⚡ Gấp gáp', description: 'Áp lực deadline', bgSound: 'urgent', category: 'rhythm' },
  { id: 'countdown', label: '⏰ Đếm ngược', description: 'Beep tăng dần', bgSound: 'countdown', category: 'rhythm' },
  { id: 'game', label: '🎮 Game show', description: 'Vui nhộn, thi đua', bgSound: 'game', category: 'rhythm' },
  { id: 'suspense', label: '🎬 Hồi hộp', description: 'Phim gay cấn', bgSound: 'suspense', category: 'rhythm' },
  { id: 'drum', label: '🥁 Trống', description: 'Nhịp drum đều', bgSound: 'drum', category: 'rhythm' },
  
  // === Thiền định ===
  { id: 'meditation', label: '🧘 Thiền Om', description: 'Tần số Om 136Hz', bgSound: 'meditation', category: 'meditation' },
  { id: 'singing_bowl', label: '🔔 Chuông bát', description: 'Singing bowl', bgSound: 'singing_bowl', category: 'meditation' },
  { id: 'chimes', label: '🎐 Chuông gió', description: 'Wind chimes nhẹ', bgSound: 'chimes', category: 'meditation' },
  { id: 'temple', label: '⛩️ Chùa', description: 'Chuông chùa', bgSound: 'temple', category: 'meditation' },
  { id: 'breathing', label: '🌬️ Thở', description: 'Hướng dẫn thở 4-7-8', bgSound: 'breathing', category: 'meditation' },
  { id: 'drone_om', label: '🕉️ Om Drone', description: 'Om liên tục', bgSound: 'drone_om', category: 'meditation' },
];

export default function DongHoBamGio() {
  // Time settings
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);
  
  // Runtime state
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  // Settings
  const [soundMode, setSoundMode] = useState('none');
  const [soundTab, setSoundTab] = useState('basic'); // Tab âm thanh đang chọn
  
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const bgSoundRef = useRef(null); // Nhạc nền
  const bgNoiseRef = useRef(null); // Noise generator

  // Stop background sound
  const stopBgSound = useCallback(() => {
    if (bgSoundRef.current) {
      bgSoundRef.current.stop();
      bgSoundRef.current = null;
    }
    if (bgNoiseRef.current) {
      bgNoiseRef.current.stop();
      bgNoiseRef.current = null;
    }
  }, []);

  // Play background sound based on mode
  const startBgSound = useCallback((mode) => {
    stopBgSound();
    
    const currentMode = SOUND_MODES.find(m => m.id === mode);
    if (!currentMode || !currentMode.bgSound) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      let isPlaying = true;
      let intervalId = null;

      // Helper: Create noise buffer
      const createNoiseBuffer = (duration, type = 'white') => {
        const bufferSize = duration * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        if (type === 'white') {
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
        } else if (type === 'pink') {
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
          }
        }
        return buffer;
      };

      // Helper: Play looped noise
      const playNoise = (filterType, filterFreq, volume, filterQ = 1) => {
        const noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(3, 'pink');
        noise.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = filterFreq;
        filter.Q.value = filterQ;
        
        const gain = ctx.createGain();
        gain.gain.value = volume;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
        
        return noise;
      };

      switch (currentMode.bgSound) {
        // === BINAURAL BEATS - Sóng não ===
        case 'alpha': {
          // Alpha (8-12Hz) - Thư giãn tỉnh táo, học nhẹ nhàng
          // Base 200Hz, diff 10Hz = Alpha waves
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 210; // 10Hz difference
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.15;
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); } };
          break;
        }

        case 'beta_low': {
          // Beta thấp (12-15Hz) - Tập trung học bài, tư duy logic
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 214; // 14Hz difference
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.15;
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); } };
          break;
        }

        case 'beta_high': {
          // Beta cao (18-25Hz) - Tập trung cao độ, giải quyết vấn đề
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 220; // 20Hz difference
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.12;
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); } };
          break;
        }

        case 'gamma': {
          // Gamma (30-50Hz) - Siêu tập trung, ghi nhớ, xử lý thông tin nhanh
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 240; // 40Hz difference
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.1;
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); } };
          break;
        }

        case 'theta': {
          // Theta (4-8Hz) - Sáng tạo, học sâu, ghi nhớ dài hạn
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 206; // 6Hz difference
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.18;
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); } };
          break;
        }

        case 'focus': {
          // Backward compatible - same as beta_low
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 214;
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.15;
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); } };
          break;
        }

        // === THIÊN NHIÊN ===
        case 'rain': {
          // Tiếng mưa - lowpass filtered noise
          const noise = playNoise('lowpass', 500, 0.25);
          bgSoundRef.current = { stop: () => noise.stop() };
          break;
        }

        case 'ocean': {
          // Sóng biển - modulated noise
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(4, 'pink');
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 300;
          
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.1; // Slow wave
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 150;
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          const gain = ctx.createGain();
          gain.gain.value = 0.3;
          
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          lfo.start();
          
          bgSoundRef.current = { stop: () => { noise.stop(); lfo.stop(); } };
          break;
        }

        case 'forest': {
          // Rừng - tiếng chim + gió lá (filtered noise + occasional chirps)
          const wind = playNoise('bandpass', 300, 0.08, 0.3);
          
          // Random bird chirps
          const playChirp = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const baseFreq = 2000 + Math.random() * 1500;
            osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, ctx.currentTime + 0.05);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          };
          intervalId = setInterval(playChirp, 2000 + Math.random() * 3000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); wind.stop(); } };
          break;
        }

        case 'fire': {
          // Lửa trại - crackling fire sound
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(2, 'white');
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 1000;
          filter.Q.value = 2;
          
          // Modulate for crackling effect
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 8;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 0.1;
          lfo.connect(lfoGain);
          
          const gain = ctx.createGain();
          gain.gain.value = 0.15;
          lfoGain.connect(gain.gain);
          
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          lfo.start();
          
          bgSoundRef.current = { stop: () => { noise.stop(); lfo.stop(); } };
          break;
        }

        case 'cafe': {
          // Tiếng quán cafe - pink noise + occasional sounds
          const noise = playNoise('bandpass', 800, 0.12, 0.5);
          bgSoundRef.current = { stop: () => noise.stop() };
          break;
        }

        case 'library': {
          // Thư viện - very quiet ambience
          const noise = playNoise('lowpass', 200, 0.03);
          // Occasional page turn
          const playPage = () => {
            if (!isPlaying) return;
            const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < buffer.length; i++) {
              data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (buffer.length * 0.3)) * 0.1;
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 2000;
            source.connect(filter);
            filter.connect(ctx.destination);
            source.start();
          };
          intervalId = setInterval(playPage, 8000 + Math.random() * 7000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); noise.stop(); } };
          break;
        }

        case 'clock': {
          // Đồng hồ cổ - tick tock chậm
          const playTick = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 800;
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
            osc.start();
            osc.stop(ctx.currentTime + 0.06);
          };
          playTick();
          intervalId = setInterval(playTick, 1000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'tick': {
          // Tick nhanh hơn
          const playTick = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = 1000;
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
            osc.start();
            osc.stop(ctx.currentTime + 0.04);
          };
          playTick();
          intervalId = setInterval(playTick, 1000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'heartbeat': {
          // Tim đập đều - thư giãn (dùng tần số cao hơn để nghe được trên mọi thiết bị)
          const playBeat = () => {
            if (!isPlaying) return;
            // First beat - "lub"
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.value = 120; // Tăng từ 60 lên 120Hz
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            gain1.gain.setValueAtTime(0.5, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
            osc1.start();
            osc1.stop(ctx.currentTime + 0.25);
            
            // Second beat - "dub" (softer)
            setTimeout(() => {
              if (!isPlaying) return;
              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.type = 'sine';
              osc2.frequency.value = 100; // Tăng từ 50 lên 100Hz
              osc2.connect(gain2);
              gain2.connect(ctx.destination);
              gain2.gain.setValueAtTime(0.35, ctx.currentTime);
              gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
              osc2.start();
              osc2.stop(ctx.currentTime + 0.2);
            }, 180);
          };
          playBeat();
          intervalId = setInterval(playBeat, 857); // ~70 BPM - relaxed
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'urgent': {
          // Gấp gáp - tim đập nhanh + ticking
          const playUrgent = () => {
            if (!isPlaying) return;
            // Fast heartbeat - tần số cao hơn để nghe rõ
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 140; // Tăng từ 80 lên 140Hz
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
            
            // Tick sound
            const tick = ctx.createOscillator();
            const tickGain = ctx.createGain();
            tick.type = 'square';
            tick.frequency.value = 1200;
            tick.connect(tickGain);
            tickGain.connect(ctx.destination);
            tickGain.gain.setValueAtTime(0.2, ctx.currentTime);
            tickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
            tick.start();
            tick.stop(ctx.currentTime + 0.03);
          };
          playUrgent();
          intervalId = setInterval(playUrgent, 400); // Very fast - 150 BPM
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'game': {
          // Game show - upbeat melody loop
          let noteIndex = 0;
          const notes = [523, 587, 659, 698, 784, 698, 659, 587]; // C major scale up and down
          
          const playNote = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = notes[noteIndex % notes.length];
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.18);
            noteIndex++;
          };
          playNote();
          intervalId = setInterval(playNote, 250); // Fast tempo
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'meditation': {
          // Thiền - drone + singing bowl effect
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const osc3 = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc3.type = 'sine';
          osc1.frequency.value = 136.1; // Om frequency
          osc2.frequency.value = 272.2; // Octave
          osc3.frequency.value = 408.3; // Fifth
          
          osc1.connect(gain);
          osc2.connect(gain);
          osc3.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.12;
          
          osc1.start();
          osc2.start();
          osc3.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); osc3.stop(); } };
          break;
        }

        case 'singing_bowl': {
          // Chuông bát - harmonic tones với slow decay
          const playBowl = () => {
            if (!isPlaying) return;
            const fundamental = 256 + Math.random() * 100; // Random base frequency
            const harmonics = [1, 2, 3, 4.2, 5.4]; // Singing bowl harmonics
            
            harmonics.forEach((ratio, i) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.value = fundamental * ratio;
              osc.connect(gain);
              gain.connect(ctx.destination);
              
              const vol = 0.15 / (i + 1); // Higher harmonics quieter
              gain.gain.setValueAtTime(vol, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 8);
              osc.start();
              osc.stop(ctx.currentTime + 8.5);
            });
          };
          playBowl();
          intervalId = setInterval(playBowl, 10000); // Every 10 seconds
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'binaural_focus': {
          // Binaural beats - focus (14Hz Beta)
          const oscL = ctx.createOscillator();
          const oscR = ctx.createOscillator();
          const gainL = ctx.createGain();
          const gainR = ctx.createGain();
          const merger = ctx.createChannelMerger(2);
          
          oscL.type = 'sine';
          oscR.type = 'sine';
          oscL.frequency.value = 200;
          oscR.frequency.value = 214; // 14Hz difference = Beta waves
          
          oscL.connect(gainL);
          oscR.connect(gainR);
          gainL.connect(merger, 0, 0);
          gainR.connect(merger, 0, 1);
          merger.connect(ctx.destination);
          
          gainL.gain.value = 0.15;
          gainR.gain.value = 0.15;
          
          oscL.start();
          oscR.start();
          bgSoundRef.current = { stop: () => { oscL.stop(); oscR.stop(); } };
          break;
        }

        case 'study_lofi': {
          // Lo-fi study beats - simple chord progression
          let chordIndex = 0;
          const chords = [
            [261.6, 329.6, 392], // C major
            [293.7, 349.2, 440], // D minor
            [329.6, 392, 493.9], // E minor
            [349.2, 440, 523.3]  // F major
          ];
          
          const playChord = () => {
            if (!isPlaying) return;
            const chord = chords[chordIndex % chords.length];
            chord.forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              const filter = ctx.createBiquadFilter();
              
              osc.type = 'triangle';
              osc.frequency.value = freq;
              filter.type = 'lowpass';
              filter.frequency.value = 800;
              
              osc.connect(filter);
              filter.connect(gain);
              gain.connect(ctx.destination);
              gain.gain.setValueAtTime(0.08, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.8);
              osc.start();
              osc.stop(ctx.currentTime + 2);
            });
            chordIndex++;
          };
          playChord();
          intervalId = setInterval(playChord, 2000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        // === ÂM THANH MỚI ===
        
        case 'digital': {
          // Digital beep - electronic tick
          const playBeep = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 880;
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
            osc.start();
            osc.stop(ctx.currentTime + 0.06);
          };
          playBeep();
          intervalId = setInterval(playBeep, 1000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'metronome': {
          // Metronome - classic click
          const playClick = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = 1200;
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
            osc.start();
            osc.stop(ctx.currentTime + 0.03);
          };
          playClick();
          intervalId = setInterval(playClick, 1000); // 60 BPM
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'delta': {
          // Delta (1-4Hz) - Deep relaxation
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 202; // 2Hz difference
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.18;
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); } };
          break;
        }

        case 'focus_mix': {
          // Alpha + Beta mix with pink noise
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const osc3 = ctx.createOscillator();
          const osc4 = ctx.createOscillator();
          const gain = ctx.createGain();
          
          // Alpha component (10Hz)
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 210;
          
          // Beta component (14Hz)
          osc3.type = 'sine';
          osc4.type = 'sine';
          osc3.frequency.value = 300;
          osc4.frequency.value = 314;
          
          osc1.connect(gain);
          osc2.connect(gain);
          osc3.connect(gain);
          osc4.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.08;
          
          osc1.start();
          osc2.start();
          osc3.start();
          osc4.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); osc3.stop(); osc4.stop(); } };
          break;
        }

        case 'study_boost': {
          // Beta 18Hz + pink noise background
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const binauralGain = ctx.createGain();
          
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 218; // 18Hz difference
          
          osc1.connect(binauralGain);
          osc2.connect(binauralGain);
          binauralGain.connect(ctx.destination);
          binauralGain.gain.value = 0.12;
          
          // Add pink noise
          const noise = playNoise('lowpass', 400, 0.08);
          
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); noise.stop(); } };
          break;
        }

        case 'rain_heavy': {
          // Heavy rain
          const noise = playNoise('lowpass', 800, 0.4);
          bgSoundRef.current = { stop: () => noise.stop() };
          break;
        }

        case 'thunder': {
          // Rain with occasional thunder
          const rain = playNoise('lowpass', 500, 0.25);
          
          const playThunder = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = 40 + Math.random() * 30;
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
            osc.start();
            osc.stop(ctx.currentTime + 2.5);
          };
          intervalId = setInterval(playThunder, 8000 + Math.random() * 10000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); rain.stop(); } };
          break;
        }

        case 'stream': {
          // Stream/creek sound
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(2, 'white');
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 2000;
          filter.Q.value = 0.5;
          
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 2;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 500;
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          const gain = ctx.createGain();
          gain.gain.value = 0.15;
          
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          lfo.start();
          
          bgSoundRef.current = { stop: () => { noise.stop(); lfo.stop(); } };
          break;
        }

        case 'night': {
          // Night sounds - crickets
          const playChirp = () => {
            if (!isPlaying) return;
            for (let i = 0; i < 3; i++) {
              setTimeout(() => {
                if (!isPlaying) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = 4000 + Math.random() * 1000;
                osc.connect(gain);
                gain.connect(ctx.destination);
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
                osc.start();
                osc.stop(ctx.currentTime + 0.06);
              }, i * 80);
            }
          };
          playChirp();
          intervalId = setInterval(playChirp, 1500 + Math.random() * 1000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'wind': {
          // Gentle wind
          const noise = playNoise('lowpass', 200, 0.2);
          bgSoundRef.current = { stop: () => noise.stop() };
          break;
        }

        case 'office': {
          // Office ambience - typing + hum
          const hum = playNoise('lowpass', 100, 0.05);
          
          const playType = () => {
            if (!isPlaying) return;
            for (let i = 0; i < 3 + Math.floor(Math.random() * 5); i++) {
              setTimeout(() => {
                if (!isPlaying) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.value = 200 + Math.random() * 100;
                osc.connect(gain);
                gain.connect(ctx.destination);
                gain.gain.setValueAtTime(0.03, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
                osc.start();
                osc.stop(ctx.currentTime + 0.03);
              }, i * (50 + Math.random() * 50));
            }
          };
          intervalId = setInterval(playType, 500 + Math.random() * 1500);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); hum.stop(); } };
          break;
        }

        case 'classroom': {
          // Classroom - pencil scratching
          const ambient = playNoise('lowpass', 150, 0.02);
          
          const playWrite = () => {
            if (!isPlaying) return;
            const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < buffer.length; i++) {
              data[i] = (Math.random() * 2 - 1) * 0.1 * Math.sin(i * 0.01);
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 1500;
            source.connect(filter);
            filter.connect(ctx.destination);
            source.start();
          };
          intervalId = setInterval(playWrite, 2000 + Math.random() * 3000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); ambient.stop(); } };
          break;
        }

        case 'space': {
          // Space drone ambient - tần số tăng để nghe được trên mọi thiết bị
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 120; // Tăng từ 60 lên 120Hz
          osc2.frequency.value = 180; // Tăng từ 90 lên 180Hz
          filter.type = 'lowpass';
          filter.frequency.value = 400;
          
          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.15;
          
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); } };
          break;
        }

        case 'underwater': {
          // Underwater bubbles
          const playBubble = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            osc.type = 'sine';
            const startFreq = 100 + Math.random() * 200;
            osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(startFreq * 3, ctx.currentTime + 0.3);
            
            filter.type = 'lowpass';
            filter.frequency.value = 500;
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
          };
          const lowNoise = playNoise('lowpass', 150, 0.1);
          intervalId = setInterval(playBubble, 500 + Math.random() * 1000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); lowNoise.stop(); } };
          break;
        }

        case 'heartbeat_fast': {
          // Fast heartbeat - 120 BPM (tần số cao hơn để nghe rõ)
          const playBeat = () => {
            if (!isPlaying) return;
            // Beat 1 - "lub"
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.value = 140; // Tăng từ 70 lên 140Hz
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            gain1.gain.setValueAtTime(0.55, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
            osc1.start();
            osc1.stop(ctx.currentTime + 0.15);
            
            // Beat 2 - "dub"
            setTimeout(() => {
              if (!isPlaying) return;
              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.type = 'sine';
              osc2.frequency.value = 110; // Tăng từ 55 lên 110Hz
              osc2.connect(gain2);
              gain2.connect(ctx.destination);
              gain2.gain.setValueAtTime(0.4, ctx.currentTime);
              gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
              osc2.start();
              osc2.stop(ctx.currentTime + 0.12);
            }, 100);
          };
          playBeat();
          intervalId = setInterval(playBeat, 500); // 120 BPM
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'countdown': {
          // Countdown beeps - increasing pitch
          let count = 0;
          const playBeep = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 400 + (count % 10) * 50; // Increasing pitch
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.18);
            count++;
          };
          playBeep();
          intervalId = setInterval(playBeep, 1000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'suspense': {
          // Suspenseful drone - tần số tăng để nghe rõ hơn
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          const gain = ctx.createGain();
          
          osc1.type = 'sawtooth';
          osc2.type = 'sawtooth';
          osc1.frequency.value = 160; // Tăng từ 80 lên 160Hz
          osc2.frequency.value = 164; // Tăng từ 82 lên 164Hz
          
          lfo.frequency.value = 0.5;
          lfoGain.gain.value = 30;
          lfo.connect(lfoGain);
          lfoGain.connect(osc1.frequency);
          
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.1; // Tăng volume một chút
          
          osc1.start();
          osc2.start();
          lfo.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); lfo.stop(); } };
          break;
        }

        case 'drum': {
          // Simple drum beat
          let beat = 0;
          const playDrum = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            if (beat % 4 === 0) {
              // Kick
              osc.type = 'sine';
              osc.frequency.setValueAtTime(150, ctx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
              gain.gain.setValueAtTime(0.5, ctx.currentTime);
            } else if (beat % 4 === 2) {
              // Snare
              osc.type = 'triangle';
              osc.frequency.value = 200;
              gain.gain.setValueAtTime(0.3, ctx.currentTime);
            } else {
              // Hi-hat
              osc.type = 'square';
              osc.frequency.value = 800;
              gain.gain.setValueAtTime(0.1, ctx.currentTime);
            }
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
            beat++;
          };
          playDrum();
          intervalId = setInterval(playDrum, 250); // 120 BPM
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'chimes': {
          // Wind chimes
          const playChime = () => {
            if (!isPlaying) return;
            const notes = [523, 587, 659, 784, 880, 988];
            const freq = notes[Math.floor(Math.random() * notes.length)];
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
            osc.start();
            osc.stop(ctx.currentTime + 2.5);
          };
          playChime();
          intervalId = setInterval(playChime, 2000 + Math.random() * 3000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'temple': {
          // Temple bell
          const playBell = () => {
            if (!isPlaying) return;
            const harmonics = [1, 2.4, 3.8, 5.2];
            harmonics.forEach((h, i) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.value = 180 * h;
              osc.connect(gain);
              gain.connect(ctx.destination);
              gain.gain.setValueAtTime(0.2 / (i + 1), ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6);
              osc.start();
              osc.stop(ctx.currentTime + 6.5);
            });
          };
          playBell();
          intervalId = setInterval(playBell, 15000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'breathing': {
          // 4-7-8 breathing guide
          let phase = 0;
          const playBreath = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            
            if (phase === 0) {
              // Inhale (4 sec) - rising tone
              osc.frequency.setValueAtTime(200, ctx.currentTime);
              osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 4);
              gain.gain.setValueAtTime(0.1, ctx.currentTime);
              gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 4);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 4);
            } else if (phase === 1) {
              // Hold (7 sec) - steady tone
              osc.frequency.value = 400;
              gain.gain.value = 0.05;
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 7);
            } else {
              // Exhale (8 sec) - falling tone
              osc.frequency.setValueAtTime(400, ctx.currentTime);
              osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 8);
              gain.gain.setValueAtTime(0.2, ctx.currentTime);
              gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 8);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 8);
            }
            phase = (phase + 1) % 3;
          };
          playBreath();
          // 4 + 7 + 8 = 19 seconds cycle
          intervalId = setInterval(() => {
            if (phase === 0) setTimeout(playBreath, 0);
            else if (phase === 1) setTimeout(playBreath, 4000);
            else setTimeout(playBreath, 11000);
          }, 19000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'drone_om': {
          // Continuous Om drone
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const osc3 = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc3.type = 'sine';
          osc1.frequency.value = 136.1;
          osc2.frequency.value = 272.2;
          osc3.frequency.value = 544.4;
          
          osc1.connect(gain);
          osc2.connect(gain);
          osc3.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.15;
          
          osc1.start();
          osc2.start();
          osc3.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); osc3.stop(); } };
          break;
        }
      }
    } catch (e) {
      console.error('Background sound error:', e);
    }
  }, [stopBgSound]);

  // Calculate total seconds
  const getTotalSeconds = useCallback(() => {
    return hours * 3600 + minutes * 60 + seconds;
  }, [hours, minutes, seconds]);

  // Format time display
  const formatTime = useCallback((totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  // Play sound
  const playSound = useCallback((type) => {
    const currentMode = SOUND_MODES.find(m => m.id === soundMode);
    if (!currentMode) return;

    if (type === 'tick' && !currentMode.tickSound) return;
    if (type === 'end' && !currentMode.endSound) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      switch (type) {
        case 'tick':
          oscillator.frequency.value = 800;
          gainNode.gain.value = 0.1;
          oscillator.start();
          setTimeout(() => oscillator.stop(), 50);
          break;
        case 'end':
          // Play a fun jingle
          gainNode.gain.value = 0.3;
          oscillator.frequency.value = 523; // C5
          oscillator.start();
          
          setTimeout(() => {
            oscillator.frequency.value = 659; // E5
            setTimeout(() => {
              oscillator.frequency.value = 784; // G5
              setTimeout(() => {
                oscillator.frequency.value = 1047; // C6
                setTimeout(() => oscillator.stop(), 300);
              }, 200);
            }, 200);
          }, 200);
          break;
        case 'warning':
          oscillator.frequency.value = 440;
          gainNode.gain.value = 0.2;
          oscillator.start();
          setTimeout(() => oscillator.stop(), 100);
          break;
      }
    } catch (e) {
      // Audio not supported
    }
  }, [soundMode]);

  // Apply preset
  const applyPreset = useCallback((totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    setHours(h);
    setMinutes(m);
    setSeconds(s);
  }, []);

  // Start timer
  const startTimer = useCallback(() => {
    const total = getTotalSeconds();
    if (total <= 0) return;
    
    setRemainingTime(total);
    setIsRunning(true);
    setIsPaused(false);
    setIsFinished(false);
    
    // Bắt đầu nhạc nền nếu có
    startBgSound(soundMode);
  }, [getTotalSeconds, soundMode, startBgSound]);

  // Pause/Resume
  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      const newPaused = !prev;
      // Tạm dừng/tiếp tục nhạc nền
      if (newPaused) {
        stopBgSound();
      } else {
        startBgSound(soundMode);
      }
      return newPaused;
    });
  }, [soundMode, startBgSound, stopBgSound]);

  // Reset
  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    stopBgSound(); // Dừng nhạc nền
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
    setRemainingTime(getTotalSeconds());
  }, [getTotalSeconds, stopBgSound]);

  // Timer countdown logic
  useEffect(() => {
    if (!isRunning || isPaused) return;

    intervalRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          stopBgSound(); // Dừng nhạc nền khi hết giờ
          setIsRunning(false);
          setIsFinished(true);
          playSound('end');
          return 0;
        }
        
        // Warning sound in last 10 seconds
        if (prev <= 11 && prev > 1) {
          playSound('warning');
        }
        
        // Tick sound
        if (prev > 10) {
          playSound('tick');
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, playSound, stopBgSound]);

  // Cleanup - QUAN TRỌNG: Dừng tất cả âm thanh khi unmount/chuyển trang
  useEffect(() => {
    return () => {
      // Dừng timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Dừng nhạc nền
      if (bgSoundRef.current) {
        try { bgSoundRef.current.stop(); } catch(e) {}
        bgSoundRef.current = null;
      }
      if (bgNoiseRef.current) {
        try { bgNoiseRef.current.stop(); } catch(e) {}
        bgNoiseRef.current = null;
      }
      // Đóng AudioContext
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch(e) {}
        audioContextRef.current = null;
      }
    };
  }, []);

  // Get progress percentage
  const getProgress = useCallback(() => {
    const total = getTotalSeconds();
    if (total === 0) return 0;
    return ((total - remainingTime) / total) * 100;
  }, [getTotalSeconds, remainingTime]);

  // Get color based on remaining time
  const getTimeColor = useCallback(() => {
    if (isFinished) return 'text-red-500';
    if (remainingTime <= 10) return 'text-red-500 animate-pulse';
    if (remainingTime <= 30) return 'text-orange-500';
    return 'text-gray-800';
  }, [remainingTime, isFinished]);

  return (
    <ToolLayout toolName="Đồng Hồ Bấm Giờ" toolIcon="⏱️">
      <TimerContent 
        isRunning={isRunning}
        isFinished={isFinished}
        isPaused={isPaused}
        remainingTime={remainingTime}
        soundMode={soundMode}
        soundTab={soundTab}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
        setHours={setHours}
        setMinutes={setMinutes}
        setSeconds={setSeconds}
        setSoundMode={setSoundMode}
        setSoundTab={setSoundTab}
        togglePause={togglePause}
        resetTimer={resetTimer}
        startTimer={startTimer}
        getProgress={getProgress}
        getTotalSeconds={getTotalSeconds}
        formatTime={formatTime}
        applyPreset={applyPreset}
      />
    </ToolLayout>
  );
}

// Tách component nội dung để sử dụng hook useFullscreen
function TimerContent({
  isRunning, isFinished, isPaused, remainingTime, soundMode, soundTab,
  hours, minutes, seconds, setHours, setMinutes, setSeconds,
  setSoundMode, setSoundTab, togglePause, resetTimer, startTimer,
  getProgress, getTotalSeconds, formatTime, applyPreset
}) {
  const { exitFullscreen } = useFullscreen();

  // Reset timer và thoát fullscreen
  const handleReset = useCallback(() => {
    exitFullscreen(); // Thoát fullscreen khi về cài đặt
    resetTimer();
  }, [exitFullscreen, resetTimer]);

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Main Timer Display */}
        <div className={`relative rounded-3xl shadow-2xl overflow-hidden bg-white
          ${isFinished ? 'animate-shake' : ''}`}
        >
          {/* Simple progress bar at top */}
          {isRunning && (
            <div className="absolute top-0 left-0 right-0 h-2 bg-gray-100">
              <div 
                className="h-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${100 - getProgress()}%`,
                  background: remainingTime <= 10 
                    ? '#ef4444' 
                    : remainingTime <= 30 
                      ? '#f97316' 
                      : 'linear-gradient(90deg, #8B5CF6, #EC4899)'
                }}
              />
            </div>
          )}

          {/* Time Display */}
          <div className="p-10 sm:p-16 text-center">
            {/* Timer numbers - Clean & Bold */}
            <div 
              className={`font-mono font-black tabular-nums tracking-tight
                ${isFinished ? 'text-red-500' : 
                  remainingTime <= 10 && isRunning ? 'text-red-500' : 
                  remainingTime <= 30 && isRunning ? 'text-orange-500' : 
                  'text-gray-800'
                }
                ${remainingTime <= 5 && isRunning && !isPaused ? 'animate-pulse' : ''}`}
              style={{ 
                fontSize: 'clamp(5rem, 22vw, 14rem)',
                lineHeight: 1,
                textShadow: remainingTime <= 10 && isRunning 
                  ? '0 0 40px rgba(239, 68, 68, 0.3)' 
                  : '0 4px 30px rgba(0,0,0,0.08)'
              }}
            >
              {formatTime(isRunning || isFinished ? remainingTime : getTotalSeconds())}
            </div>

            {/* Sound mode indicator - subtle */}
            {isRunning && soundMode !== 'none' && (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                <span>🔊</span>
                <span>{SOUND_MODES.find(m => m.id === soundMode)?.label}</span>
              </div>
            )}
          </div>

          {/* Finished celebration */}
          {isFinished && (
            <div className="absolute inset-0 flex items-center justify-center z-20 animate-fadeIn"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)'
              }}>
              <div className="text-center text-white p-8">
                <div className="text-8xl mb-4 animate-bounce">⏰</div>
                <h2 className="text-4xl sm:text-6xl font-black mb-2">HẾT GIỜ!</h2>
                <p className="text-xl opacity-80 mb-6">Thời gian đã kết thúc</p>
                <button
                  onClick={handleReset}
                  className="px-8 py-4 bg-white text-red-500 font-bold rounded-full 
                    text-xl hover:scale-105 hover:shadow-xl transition-all duration-300"
                >
                  🔄 Đặt lại
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings Panel - Hidden when running */}
        {!isRunning && !isFinished && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>⚙️</span>
              Cài đặt thời gian
            </h2>

            {/* Custom time input */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-center">
                <label className="block text-sm text-gray-500 mb-2">Giờ</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                  className="w-24 h-16 text-center text-3xl font-bold border-2 border-gray-200 
                    rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <span className="text-4xl font-bold text-gray-300 mt-6">:</span>
              <div className="text-center">
                <label className="block text-sm text-gray-500 mb-2">Phút</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-24 h-16 text-center text-3xl font-bold border-2 border-gray-200 
                    rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <span className="text-4xl font-bold text-gray-300 mt-6">:</span>
              <div className="text-center">
                <label className="block text-sm text-gray-500 mb-2">Giây</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-24 h-16 text-center text-3xl font-bold border-2 border-gray-200 
                    rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide text-center">
                Chọn nhanh
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {PRESETS.map(preset => (
                  <button
                    key={preset.seconds}
                    onClick={() => applyPreset(preset.seconds)}
                    className={`px-4 py-2 rounded-full font-semibold transition-all text-sm
                      ${getTotalSeconds() === preset.seconds
                        ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Mode - Tab-based UI */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide text-center">
                🔊 Chế độ âm thanh
              </h3>
              
              {/* Hiển thị âm thanh đang chọn */}
              {soundMode !== 'none' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">Đang chọn:</span>
                    <span className="text-blue-800">{SOUND_MODES.find(m => m.id === soundMode)?.label}</span>
                  </div>
                  <button
                    onClick={() => setSoundMode('none')}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    ✕ Tắt
                  </button>
                </div>
              )}
              
              {/* Tabs */}
              <div className="flex flex-wrap gap-1 mb-4 p-1 bg-gray-100 rounded-xl">
                {[
                  { id: 'basic', label: '🔔 Cơ bản', color: 'gray' },
                  { id: 'brainwave', label: '🧠 Sóng não', color: 'purple' },
                  { id: 'nature', label: '🌿 Thiên nhiên', color: 'green' },
                  { id: 'ambient', label: '🏠 Không gian', color: 'amber' },
                  { id: 'rhythm', label: '🥁 Nhịp', color: 'orange' },
                  { id: 'meditation', label: '🧘 Thiền', color: 'indigo' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSoundTab(tab.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${soundTab === tab.id
                        ? 'bg-white shadow-md text-gray-800'
                        : 'text-gray-600 hover:bg-white/50'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[120px]">
                {/* Basic */}
                {soundTab === 'basic' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SOUND_MODES.filter(m => m.category === 'basic').map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setSoundMode(mode.id)}
                        className={`p-3 rounded-xl font-medium transition-all text-left
                          ${soundMode === mode.id
                            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg ring-2 ring-gray-300'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        <div className="text-sm font-bold">{mode.label}</div>
                        <div className={`text-xs mt-1 ${soundMode === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {mode.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Brainwave */}
                {soundTab === 'brainwave' && (
                  <div>
                    <div className="text-xs text-purple-600 mb-2 flex items-center gap-1">
                      <span className="font-bold">💡 Mẹo:</span> Dùng tai nghe 🎧 để có hiệu quả tốt nhất
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SOUND_MODES.filter(m => m.category === 'brainwave').map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => setSoundMode(mode.id)}
                          className={`p-3 rounded-xl font-medium transition-all text-left
                            ${soundMode === mode.id
                              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg ring-2 ring-purple-300'
                              : 'bg-purple-50 text-gray-700 hover:bg-purple-100 border border-purple-200'
                            }`}
                        >
                          <div className="text-sm font-bold">{mode.label}</div>
                          <div className={`text-xs mt-1 ${soundMode === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                            {mode.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nature */}
                {soundTab === 'nature' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SOUND_MODES.filter(m => m.category === 'nature').map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setSoundMode(mode.id)}
                        className={`p-3 rounded-xl font-medium transition-all text-left
                          ${soundMode === mode.id
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg ring-2 ring-green-300'
                            : 'bg-green-50 text-gray-700 hover:bg-green-100 border border-green-200'
                          }`}
                      >
                        <div className="text-sm font-bold">{mode.label}</div>
                        <div className={`text-xs mt-1 ${soundMode === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {mode.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Ambient */}
                {soundTab === 'ambient' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SOUND_MODES.filter(m => m.category === 'ambient').map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setSoundMode(mode.id)}
                        className={`p-3 rounded-xl font-medium transition-all text-left
                          ${soundMode === mode.id
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg ring-2 ring-amber-300'
                            : 'bg-amber-50 text-gray-700 hover:bg-amber-100 border border-amber-200'
                          }`}
                      >
                        <div className="text-sm font-bold">{mode.label}</div>
                        <div className={`text-xs mt-1 ${soundMode === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {mode.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Rhythm */}
                {soundTab === 'rhythm' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SOUND_MODES.filter(m => m.category === 'rhythm').map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setSoundMode(mode.id)}
                        className={`p-3 rounded-xl font-medium transition-all text-left
                          ${soundMode === mode.id
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg ring-2 ring-orange-300'
                            : 'bg-orange-50 text-gray-700 hover:bg-orange-100 border border-orange-200'
                          }`}
                      >
                        <div className="text-sm font-bold">{mode.label}</div>
                        <div className={`text-xs mt-1 ${soundMode === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {mode.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Meditation */}
                {soundTab === 'meditation' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SOUND_MODES.filter(m => m.category === 'meditation').map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setSoundMode(mode.id)}
                        className={`p-3 rounded-xl font-medium transition-all text-left
                          ${soundMode === mode.id
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg ring-2 ring-indigo-300'
                            : 'bg-indigo-50 text-gray-700 hover:bg-indigo-100 border border-indigo-200'
                          }`}
                      >
                        <div className="text-sm font-bold">{mode.label}</div>
                        <div className={`text-xs mt-1 ${soundMode === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {mode.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={startTimer}
                disabled={getTotalSeconds() <= 0}
                className="px-16 py-6 text-3xl font-black text-white rounded-full
                  bg-gradient-to-r from-blue-500 to-indigo-500 
                  hover:from-blue-600 hover:to-indigo-600 
                  hover:scale-105 hover:shadow-xl 
                  active:scale-95 transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ▶️ BẮT ĐẦU
              </button>
            </div>
          </div>
        )}

        {/* Controls when running */}
        {isRunning && !isFinished && (
          <div className="flex justify-center gap-4">
            <button
              onClick={togglePause}
              className={`px-8 py-4 font-bold rounded-full text-xl transition-all
                ${isPaused
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                } hover:shadow-lg`}
            >
              {isPaused ? '▶️ Tiếp tục' : '⏸️ Tạm dừng'}
            </button>
            <button
              onClick={handleReset}
              className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 
                font-bold rounded-full text-xl transition-all"
            >
              🔄 Đặt lại
            </button>
          </div>
        )}

        {/* Tips - Đơn giản */}
        {!isRunning && !isFinished && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><b>📚 Học bài:</b> Sóng não Beta (14-20Hz) + tai nghe</p>
                <p><b>✍️ Kiểm tra:</b> Gấp gáp, Game show</p>
                <p><b>😌 Thư giãn:</b> Thiên nhiên, Thiền định</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.5; }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
        }
      `}</style>
    </>
  );
}
