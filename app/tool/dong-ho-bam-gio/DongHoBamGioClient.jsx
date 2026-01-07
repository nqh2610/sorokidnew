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

  // Web Audio API fallback - defined before startBgSound
  const playWebAudioSound = useCallback((bgSound) => {
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

      switch (bgSound) {
        // === BINAURAL BEATS - Sóng não ===
        case 'alpha': {
          // Alpha (10Hz) - Thư giãn tỉnh táo + pink noise nền
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const binauralGain = ctx.createGain();
          
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 210; // 10Hz difference
          osc1.connect(binauralGain);
          osc2.connect(binauralGain);
          binauralGain.connect(ctx.destination);
          binauralGain.gain.value = 0.1;
          
          // Thêm pink noise nền nhẹ
          const noise = playNoise('lowpass', 300, 0.06);
          
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); noise.stop(); } };
          break;
        }

        case 'beta_low': {
          // Beta thấp (14Hz) - Tập trung học bài + pink noise
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const binauralGain = ctx.createGain();
          
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 214; // 14Hz difference
          osc1.connect(binauralGain);
          osc2.connect(binauralGain);
          binauralGain.connect(ctx.destination);
          binauralGain.gain.value = 0.1;
          
          const noise = playNoise('lowpass', 350, 0.05);
          
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); noise.stop(); } };
          break;
        }

        case 'beta_high': {
          // Beta cao (20Hz) - Tập trung cao độ + pink noise
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const binauralGain = ctx.createGain();
          
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 220; // 20Hz difference
          osc1.connect(binauralGain);
          osc2.connect(binauralGain);
          binauralGain.connect(ctx.destination);
          binauralGain.gain.value = 0.1;
          
          const noise = playNoise('lowpass', 400, 0.05);
          
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); noise.stop(); } };
          break;
        }

        case 'gamma': {
          // Gamma (40Hz) - Siêu tập trung + pink noise
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const binauralGain = ctx.createGain();
          
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 240; // 40Hz difference
          osc1.connect(binauralGain);
          osc2.connect(binauralGain);
          binauralGain.connect(ctx.destination);
          binauralGain.gain.value = 0.08;
          
          const noise = playNoise('lowpass', 400, 0.08);
          
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); noise.stop(); } };
          break;
        }

        case 'theta': {
          // Theta (6Hz) - Sáng tạo + pink noise nền
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const binauralGain = ctx.createGain();
          
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 206; // 6Hz difference
          osc1.connect(binauralGain);
          osc2.connect(binauralGain);
          binauralGain.connect(ctx.destination);
          binauralGain.gain.value = 0.1;
          
          const noise = playNoise('lowpass', 250, 0.08);
          
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); noise.stop(); } };
          break;
        }

        case 'focus': {
          // Focus (12Hz) - Tập trung + pink noise
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const binauralGain = ctx.createGain();
          
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 212; // 12Hz difference
          osc1.connect(binauralGain);
          osc2.connect(binauralGain);
          binauralGain.connect(ctx.destination);
          binauralGain.gain.value = 0.1;
          
          const noise = playNoise('lowpass', 350, 0.06);
          
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); noise.stop(); } };
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
          // Lửa trại - tiếng lửa cháy ấm áp với tiếng tí tách
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(3, 'pink');
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 600;
          filter.Q.value = 0.5;
          
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 4;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 150;
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          const gain = ctx.createGain();
          gain.gain.value = 0.22;
          
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          lfo.start();
          
          // Tiếng tí tách của lửa
          const playCrackle = () => {
            if (!bgSoundRef.current) return;
            const osc = ctx.createOscillator();
            const crackleGain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 800 + Math.random() * 600;
            osc.connect(crackleGain);
            crackleGain.connect(ctx.destination);
            crackleGain.gain.setValueAtTime(0.1, ctx.currentTime);
            crackleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
            osc.start();
            osc.stop(ctx.currentTime + 0.06);
          };
          const crackleInterval = setInterval(() => {
            if (Math.random() > 0.5) playCrackle();
          }, 200 + Math.random() * 300);
          
          bgSoundRef.current = { stop: () => { noise.stop(); lfo.stop(); clearInterval(crackleInterval); } };
          break;
        }

        case 'cafe': {
          // Quán cafe - tiếng ồn ào vừa phải, ấm áp
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(3, 'pink');
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 600;
          filter.Q.value = 0.5;
          
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.15;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 100;
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          const gain = ctx.createGain();
          gain.gain.value = 0.2;
          
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          lfo.start();
          
          // Thêm tiếng ly tách occasional
          const playCup = () => {
            if (!bgSoundRef.current) return;
            const osc = ctx.createOscillator();
            const cupGain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 1200 + Math.random() * 400;
            osc.connect(cupGain);
            cupGain.connect(ctx.destination);
            cupGain.gain.setValueAtTime(0.08, ctx.currentTime);
            cupGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          };
          const cupInterval = setInterval(() => {
            if (Math.random() > 0.7) playCup();
          }, 3000 + Math.random() * 4000);
          
          bgSoundRef.current = { stop: () => { noise.stop(); lfo.stop(); clearInterval(cupInterval); } };
          break;
        }

        case 'library': {
          // Thư viện - yên tĩnh với tiếng đồng hồ tích tắc nhẹ
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(3, 'pink');
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 150;
          filter.Q.value = 0.3;
          
          const gain = ctx.createGain();
          gain.gain.value = 0.08;
          
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          
          // Tiếng đồng hồ tích tắc nhẹ
          const playTick = () => {
            if (!bgSoundRef.current) return;
            const osc = ctx.createOscillator();
            const tickGain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 600;
            osc.connect(tickGain);
            tickGain.connect(ctx.destination);
            tickGain.gain.setValueAtTime(0.06, ctx.currentTime);
            tickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
            osc.start();
            osc.stop(ctx.currentTime + 0.04);
          };
          const tickInterval = setInterval(playTick, 1000);
          
          bgSoundRef.current = { stop: () => { noise.stop(); clearInterval(tickInterval); } };
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
          // Tick nhẹ nhàng - dùng sine wave
          const playTick = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine'; // Sine mềm hơn square
            osc.frequency.value = 800;
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
            osc.start();
            osc.stop(ctx.currentTime + 0.06);
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
          // Gấp gáp - nhịp nhanh nhưng không chói tai
          const playUrgent = () => {
            if (!isPlaying) return;
            // Heartbeat nhanh
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.value = 120;
            filter.type = 'lowpass';
            filter.frequency.value = 300;
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
            
            // Tick nhẹ
            const tick = ctx.createOscillator();
            const tickGain = ctx.createGain();
            tick.type = 'sine'; // Sine thay vì square
            tick.frequency.value = 600;
            tick.connect(tickGain);
            tickGain.connect(ctx.destination);
            tickGain.gain.setValueAtTime(0.1, ctx.currentTime);
            tickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
            tick.start();
            tick.stop(ctx.currentTime + 0.04);
          };
          playUrgent();
          intervalId = setInterval(playUrgent, 450); // Chậm hơn một chút
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'game': {
          // Game show - melody vui nhộn nhưng không chói tai
          let noteIndex = 0;
          const notes = [523, 587, 659, 784, 659, 587, 523, 440]; // Melody pattern
          
          const playNote = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            osc.type = 'triangle'; // Triangle mềm hơn square
            osc.frequency.value = notes[noteIndex % notes.length];
            
            filter.type = 'lowpass';
            filter.frequency.value = 2000;
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
            noteIndex++;
          };
          playNote();
          intervalId = setInterval(playNote, 300); // Chậm hơn một chút
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'meditation': {
          // Thiền - pad dịu nhẹ với modulation chậm (không gây nhức đầu)
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(4, 'pink');
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 200;
          
          // Modulation rất chậm
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.03; // Cực chậm
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 50;
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          const gain = ctx.createGain();
          gain.gain.value = 0.12;
          
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          lfo.start();
          
          bgSoundRef.current = { stop: () => { noise.stop(); lfo.stop(); } };
          break;
        }

        case 'singing_bowl': {
          // Chuông bát - âm thanh dài, thư giãn, không lặp lại quá nhanh
          const playBowl = () => {
            if (!isPlaying) return;
            const fundamental = 280; // Cố định tần số để ổn định hơn
            const harmonics = [1, 2, 3]; // Ít harmonics hơn
            
            harmonics.forEach((ratio, i) => {
              const osc = ctx.createOscillator();
              const oscGain = ctx.createGain();
              const filter = ctx.createBiquadFilter();
              osc.type = 'sine';
              osc.frequency.value = fundamental * ratio;
              filter.type = 'lowpass';
              filter.frequency.value = 1000;
              
              osc.connect(filter);
              filter.connect(oscGain);
              oscGain.connect(ctx.destination);
              
              const vol = 0.1 / (i + 1);
              oscGain.gain.setValueAtTime(vol, ctx.currentTime);
              oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 12);
              osc.start();
              osc.stop(ctx.currentTime + 12.5);
            });
          };
          playBowl();
          intervalId = setInterval(playBowl, 15000); // 15 giây mới đánh lại
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
          // Lo-fi study - pink noise với kick đều dịu dàng
          const noise = playNoise('lowpass', 280, 0.12);
          
          // Kick nhẹ nhàng
          const playKick = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const kickGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
            filter.type = 'lowpass';
            filter.frequency.value = 200;
            osc.connect(filter);
            filter.connect(kickGain);
            kickGain.connect(ctx.destination);
            kickGain.gain.setValueAtTime(0.15, ctx.currentTime);
            kickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
          };
          
          playKick();
          intervalId = setInterval(playKick, 1200); // Chậm hơn
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); noise.stop(); } };
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
          // Delta (2Hz) - Thư giãn sâu + pink noise
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const binauralGain = ctx.createGain();
          
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 202; // 2Hz difference
          osc1.connect(binauralGain);
          osc2.connect(binauralGain);
          binauralGain.connect(ctx.destination);
          binauralGain.gain.value = 0.1;
          
          const noise = playNoise('lowpass', 200, 0.1);
          
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); noise.stop(); } };
          break;
        }

        case 'focus_mix': {
          // Alpha + Beta mix với pink noise
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const binauralGain = ctx.createGain();
          
          // Focus mix (12Hz - giữa alpha và beta)
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.value = 200;
          osc2.frequency.value = 212; // 12Hz difference
          
          osc1.connect(binauralGain);
          osc2.connect(binauralGain);
          binauralGain.connect(ctx.destination);
          binauralGain.gain.value = 0.08;
          
          // Pink noise nền
          const noise = playNoise('lowpass', 350, 0.08);
          
          osc1.start();
          osc2.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); osc2.stop(); noise.stop(); } };
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
          // Mưa với sấm - dùng noise thay vì sawtooth
          const rain = playNoise('lowpass', 500, 0.25);
          
          const playThunder = () => {
            if (!isPlaying) return;
            // Tiếng sấm = pink noise với lowpass
            const thunder = ctx.createBufferSource();
            thunder.buffer = createNoiseBuffer(3, 'pink');
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 150;
            const thunderGain = ctx.createGain();
            
            thunder.connect(filter);
            filter.connect(thunderGain);
            thunderGain.connect(ctx.destination);
            thunderGain.gain.setValueAtTime(0.5, ctx.currentTime);
            thunderGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.5);
            thunder.start();
            thunder.stop(ctx.currentTime + 3);
          };
          intervalId = setInterval(playThunder, 10000 + Math.random() * 8000);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); rain.stop(); } };
          break;
        }

        case 'stream': {
          // Suối chảy - tiếng nước róc rách rõ ràng
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(3, 'pink');
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 1000;
          filter.Q.value = 0.4;
          
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.8;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 300;
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          const gain = ctx.createGain();
          gain.gain.value = 0.2;
          
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          lfo.start();
          
          // Thêm tiếng bong bóng nước
          const playBubble = () => {
            if (!bgSoundRef.current) return;
            const osc = ctx.createOscillator();
            const bubbleGain = ctx.createGain();
            osc.type = 'sine';
            const startFreq = 400 + Math.random() * 300;
            osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(startFreq * 2, ctx.currentTime + 0.1);
            osc.connect(bubbleGain);
            bubbleGain.connect(ctx.destination);
            bubbleGain.gain.setValueAtTime(0.08, ctx.currentTime);
            bubbleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
          };
          const bubbleInterval = setInterval(() => {
            if (Math.random() > 0.6) playBubble();
          }, 500 + Math.random() * 800);
          
          bgSoundRef.current = { stop: () => { noise.stop(); lfo.stop(); clearInterval(bubbleInterval); } };
          break;
        }

        case 'night': {
          // Đêm hè - tiếng dế kêu rõ ràng + ambient
          const bgNoise = ctx.createBufferSource();
          bgNoise.buffer = createNoiseBuffer(3, 'pink');
          bgNoise.loop = true;
          const bgFilter = ctx.createBiquadFilter();
          bgFilter.type = 'lowpass';
          bgFilter.frequency.value = 200;
          const bgGain = ctx.createGain();
          bgGain.gain.value = 0.1;
          bgNoise.connect(bgFilter);
          bgFilter.connect(bgGain);
          bgGain.connect(ctx.destination);
          bgNoise.start();
          
          // Tiếng dế kêu rõ ràng
          const playChirp = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = 4000 + Math.random() * 500;
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
          };
          
          // Chirp pattern: 3-4 tiếng liên tiếp
          const playChirpPattern = () => {
            if (!isPlaying) return;
            const count = 3 + Math.floor(Math.random() * 2);
            for (let i = 0; i < count; i++) {
              setTimeout(() => { if (isPlaying) playChirp(); }, i * 80);
            }
          };
          
          playChirpPattern();
          intervalId = setInterval(playChirpPattern, 1500 + Math.random() * 1500);
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); bgNoise.stop(); } };
          break;
        }

        case 'wind': {
          // Gió thổi - có modulation để tự nhiên hơn
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(3, 'pink');
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 300;
          
          // Modulation tạo hiệu ứng gió thổi từng cơn
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.2;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 100;
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          const gain = ctx.createGain();
          gain.gain.value = 0.25;
          
          // Volume modulation
          const volLfo = ctx.createOscillator();
          volLfo.frequency.value = 0.08;
          const volLfoGain = ctx.createGain();
          volLfoGain.gain.value = 0.1;
          volLfo.connect(volLfoGain);
          volLfoGain.connect(gain.gain);
          
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          lfo.start();
          volLfo.start();
          
          bgSoundRef.current = { stop: () => { noise.stop(); lfo.stop(); volLfo.stop(); } };
          break;
        }

        case 'office': {
          // Văn phòng - tiếng máy lạnh + keyboard nhẹ
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(3, 'pink');
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 250;
          filter.Q.value = 0.3;
          
          const gain = ctx.createGain();
          gain.gain.value = 0.18;
          
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          
          // Thêm tiếng gõ phím nhẹ nhàng
          const playKey = () => {
            if (!bgSoundRef.current) return;
            const osc = ctx.createOscillator();
            const keyGain = ctx.createGain();
            const keyFilter = ctx.createBiquadFilter();
            osc.type = 'sine';
            osc.frequency.value = 300 + Math.random() * 200;
            keyFilter.type = 'lowpass';
            keyFilter.frequency.value = 800;
            osc.connect(keyFilter);
            keyFilter.connect(keyGain);
            keyGain.connect(ctx.destination);
            keyGain.gain.setValueAtTime(0.08, ctx.currentTime);
            keyGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
            osc.start();
            osc.stop(ctx.currentTime + 0.04);
          };
          const keyInterval = setInterval(() => {
            if (Math.random() > 0.3) playKey();
          }, 150 + Math.random() * 200);
          
          bgSoundRef.current = { stop: () => { noise.stop(); clearInterval(keyInterval); } };
          break;
        }

        case 'classroom': {
          // Lớp học - tiếng quạt trần/máy lạnh nhẹ nhàng
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(3, 'pink');
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 300;
          filter.Q.value = 0.5;
          
          const gain = ctx.createGain();
          gain.gain.value = 0.15; // Nghe rõ hơn
          
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          
          bgSoundRef.current = { stop: () => noise.stop() };
          break;
        }

        case 'space': {
          // Không gian - ambient pad dịu nhẹ
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(4, 'pink');
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 150;
          
          // Slow modulation
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.02;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 30;
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
          // Hồi hộp - drone nhẹ với modulation
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer(4, 'pink');
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 200;
          
          // Slow pulsing
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.5;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 50;
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          const gain = ctx.createGain();
          gain.gain.value = 0.18;
          
          // Volume pulse
          const volLfo = ctx.createOscillator();
          volLfo.frequency.value = 1;
          const volLfoGain = ctx.createGain();
          volLfoGain.gain.value = 0.05;
          volLfo.connect(volLfoGain);
          volLfoGain.connect(gain.gain);
          
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          lfo.start();
          volLfo.start();
          
          bgSoundRef.current = { stop: () => { noise.stop(); lfo.stop(); volLfo.stop(); } };
          break;
        }

        case 'drum': {
          // Simple drum beat - dịu hơn
          let beat = 0;
          const playDrum = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const drumGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            filter.type = 'lowpass';
            
            if (beat % 4 === 0) {
              // Kick
              osc.type = 'sine';
              osc.frequency.setValueAtTime(150, ctx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
              filter.frequency.value = 300;
              drumGain.gain.setValueAtTime(0.45, ctx.currentTime);
            } else if (beat % 4 === 2) {
              // Snare
              osc.type = 'triangle';
              osc.frequency.value = 200;
              filter.frequency.value = 500;
              drumGain.gain.setValueAtTime(0.25, ctx.currentTime);
            } else {
              // Hi-hat - dùng sine với filter thay vì square
              osc.type = 'sine';
              osc.frequency.value = 800;
              filter.frequency.value = 2000;
              drumGain.gain.setValueAtTime(0.08, ctx.currentTime);
            }
            
            osc.connect(filter);
            filter.connect(drumGain);
            drumGain.connect(ctx.destination);
            drumGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
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
          // Chuông gió - nhẹ nhàng
          const playChime = () => {
            if (!isPlaying) return;
            const notes = [523, 659, 784, 880]; // Chỉ giữ 4 note
            const freq = notes[Math.floor(Math.random() * notes.length)];
            const osc = ctx.createOscillator();
            const chimeGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            filter.type = 'lowpass';
            filter.frequency.value = 2000;
            
            osc.connect(filter);
            filter.connect(chimeGain);
            chimeGain.connect(ctx.destination);
            chimeGain.gain.setValueAtTime(0.12, ctx.currentTime);
            chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
            osc.start();
            osc.stop(ctx.currentTime + 3.5);
          };
          playChime();
          intervalId = setInterval(playChime, 3000 + Math.random() * 4000); // Chậm hơn
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'temple': {
          // Chuông chùa - đánh thưa hơn
          const playBell = () => {
            if (!isPlaying) return;
            const osc = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const bellGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            osc.type = 'sine';
            osc2.type = 'sine';
            osc.frequency.value = 180;
            osc2.frequency.value = 360;
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            
            osc.connect(filter);
            osc2.connect(filter);
            filter.connect(bellGain);
            bellGain.connect(ctx.destination);
            bellGain.gain.setValueAtTime(0.15, ctx.currentTime);
            bellGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 8);
            osc.start();
            osc2.start();
            osc.stop(ctx.currentTime + 8.5);
            osc2.stop(ctx.currentTime + 8.5);
          };
          playBell();
          intervalId = setInterval(playBell, 20000); // 20 giây mới đánh lại
          bgSoundRef.current = { stop: () => { isPlaying = false; clearInterval(intervalId); } };
          break;
        }

        case 'breathing': {
          // Hướng dẫn thở 4-7-8 - dùng white noise filtered thay vì tone
          let breathPhase = 0; // 0 = hít vào, 1 = giữ, 2 = thở ra
          
          const createBreathSound = (duration, isInhale) => {
            const noise = ctx.createBufferSource();
            noise.buffer = createNoiseBuffer(duration, 'pink');
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = isInhale ? 300 : 200;
            const breathGain = ctx.createGain();
            
            noise.connect(filter);
            filter.connect(breathGain);
            breathGain.connect(ctx.destination);
            
            if (isInhale) {
              // Hít vào - tăng dần
              breathGain.gain.setValueAtTime(0.01, ctx.currentTime);
              breathGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + duration);
            } else {
              // Thở ra - giảm dần
              breathGain.gain.setValueAtTime(0.15, ctx.currentTime);
              breathGain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + duration);
            }
            
            noise.start();
            noise.stop(ctx.currentTime + duration);
          };
          
          const breathCycle = () => {
            if (!isPlaying) return;
            if (breathPhase === 0) {
              createBreathSound(4, true); // Hít vào 4s
              setTimeout(() => { breathPhase = 1; if (isPlaying) breathCycle(); }, 4000);
            } else if (breathPhase === 1) {
              // Giữ hơi 7s - im lặng
              setTimeout(() => { breathPhase = 2; if (isPlaying) breathCycle(); }, 7000);
            } else {
              createBreathSound(8, false); // Thở ra 8s
              setTimeout(() => { breathPhase = 0; if (isPlaying) breathCycle(); }, 8000);
            }
          };
          
          breathCycle();
          bgSoundRef.current = { stop: () => { isPlaying = false; } };
          break;
        }

        case 'drone_om': {
          // Om drone - nhẹ nhàng với modulation
          const osc1 = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();
          
          osc1.type = 'sine';
          osc1.frequency.value = 136.1; // Om frequency
          
          filter.type = 'lowpass';
          filter.frequency.value = 300;
          
          // Volume modulation nhẹ để không gây mỏi
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.05;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 0.03;
          lfo.connect(lfoGain);
          lfoGain.connect(gain.gain);
          
          osc1.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.08; // Giảm volume
          
          osc1.start();
          lfo.start();
          bgSoundRef.current = { stop: () => { osc1.stop(); lfo.stop(); } };
          break;
        }
      }
    } catch (e) {
      console.error('Background sound error:', e);
    }
  }, []);

  // Play background sound - 100% Web Audio API (không cần file âm thanh)
  const startBgSound = useCallback((mode) => {
    stopBgSound();
    
    const currentMode = SOUND_MODES.find(m => m.id === mode);
    if (!currentMode || !currentMode.bgSound) return;

    // Tạo âm thanh realtime bằng Web Audio API
    playWebAudioSound(currentMode.bgSound);
  }, [stopBgSound, playWebAudioSound]);

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
          <div className="p-6 sm:p-10 text-center overflow-hidden">
            {/* Timer numbers - Clean & Bold */}
            <div 
              className={`font-mono font-black tabular-nums tracking-tight whitespace-nowrap
                ${isFinished ? 'text-red-500' : 
                  remainingTime <= 10 && isRunning ? 'text-red-500' : 
                  remainingTime <= 30 && isRunning ? 'text-orange-500' : 
                  'text-gray-800'
                }
                ${remainingTime <= 5 && isRunning && !isPaused ? 'animate-pulse' : ''}`}
              style={{ 
                fontSize: (isRunning || isFinished ? remainingTime >= 3600 : getTotalSeconds() >= 3600)
                  ? 'clamp(3rem, 14vw, 10rem)' 
                  : 'clamp(4rem, 18vw, 12rem)',
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
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>⚙️</span>
              Cài đặt thời gian
            </h2>

            {/* Custom time input - Compact */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
              <div className="text-center">
                <label className="block text-xs text-gray-500 mb-1">Giờ</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                  className="w-16 sm:w-20 h-12 sm:h-14 text-center text-2xl font-bold border-2 border-gray-200 
                    rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <span className="text-3xl font-bold text-gray-300 mt-5">:</span>
              <div className="text-center">
                <label className="block text-xs text-gray-500 mb-1">Phút</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-16 sm:w-20 h-12 sm:h-14 text-center text-2xl font-bold border-2 border-gray-200 
                    rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <span className="text-3xl font-bold text-gray-300 mt-5">:</span>
              <div className="text-center">
                <label className="block text-xs text-gray-500 mb-1">Giây</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-16 sm:w-20 h-12 sm:h-14 text-center text-2xl font-bold border-2 border-gray-200 
                    rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>

            {/* Presets - Compact */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide text-center">
                Chọn nhanh
              </h3>
              <div className="flex flex-wrap justify-center gap-1.5">
                {PRESETS.map(preset => (
                  <button
                    key={preset.seconds}
                    onClick={() => applyPreset(preset.seconds)}
                    className={`px-3 py-1.5 rounded-full font-semibold transition-all text-sm
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

            {/* Sound Mode - Tab-based UI - Compact */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide text-center">
                🔊 Chế độ âm thanh
              </h3>
              
              {/* Hiển thị âm thanh đang chọn */}
              {soundMode !== 'none' && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
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
              
              {/* Tabs - Compact */}
              <div className="flex flex-wrap gap-0.5 mb-3 p-1 bg-gray-100 rounded-lg">
                {[
                  { id: 'basic', label: '🔔 Cơ bản' },
                  { id: 'brainwave', label: '🧠 Sóng não' },
                  { id: 'nature', label: '🌿 Thiên nhiên' },
                  { id: 'ambient', label: '🏠 Không gian' },
                  { id: 'rhythm', label: '🥁 Nhịp' },
                  { id: 'meditation', label: '🧘 Thiền' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSoundTab(tab.id)}
                    className={`px-2 py-1.5 rounded-md text-sm font-medium transition-all
                      ${soundTab === tab.id
                        ? 'bg-white shadow-md text-gray-800'
                        : 'text-gray-600 hover:bg-white/50'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content - Compact */}
              <div className="min-h-[100px]">
                {/* Basic */}
                {soundTab === 'basic' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {SOUND_MODES.filter(m => m.category === 'basic').map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setSoundMode(mode.id)}
                        className={`p-2 rounded-lg font-medium transition-all text-left
                          ${soundMode === mode.id
                            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg ring-2 ring-gray-300'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        <div className="text-sm font-bold">{mode.label}</div>
                        <div className={`text-xs ${soundMode === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {mode.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Brainwave */}
                {soundTab === 'brainwave' && (
                  <div>
                    <div className="text-xs text-purple-600 mb-1.5">💡 Dùng tai nghe 🎧 để hiệu quả nhất</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {SOUND_MODES.filter(m => m.category === 'brainwave').map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => setSoundMode(mode.id)}
                          className={`p-2 rounded-lg font-medium transition-all text-left
                            ${soundMode === mode.id
                              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg ring-2 ring-purple-300'
                              : 'bg-purple-50 text-gray-700 hover:bg-purple-100 border border-purple-200'
                            }`}
                        >
                          <div className="text-sm font-bold">{mode.label}</div>
                          <div className={`text-xs ${soundMode === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                            {mode.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nature */}
                {soundTab === 'nature' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {SOUND_MODES.filter(m => m.category === 'nature').map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setSoundMode(mode.id)}
                        className={`p-2 rounded-lg font-medium transition-all text-left
                          ${soundMode === mode.id
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg ring-2 ring-green-300'
                            : 'bg-green-50 text-gray-700 hover:bg-green-100 border border-green-200'
                          }`}
                      >
                        <div className="text-sm font-bold">{mode.label}</div>
                        <div className={`text-xs ${soundMode === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {mode.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Ambient */}
                {soundTab === 'ambient' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {SOUND_MODES.filter(m => m.category === 'ambient').map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setSoundMode(mode.id)}
                        className={`p-2 rounded-lg font-medium transition-all text-left
                          ${soundMode === mode.id
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg ring-2 ring-amber-300'
                            : 'bg-amber-50 text-gray-700 hover:bg-amber-100 border border-amber-200'
                          }`}
                      >
                        <div className="text-sm font-bold">{mode.label}</div>
                        <div className={`text-xs ${soundMode === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {mode.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Rhythm */}
                {soundTab === 'rhythm' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {SOUND_MODES.filter(m => m.category === 'rhythm').map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setSoundMode(mode.id)}
                        className={`p-2 rounded-lg font-medium transition-all text-left
                          ${soundMode === mode.id
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg ring-2 ring-orange-300'
                            : 'bg-orange-50 text-gray-700 hover:bg-orange-100 border border-orange-200'
                          }`}
                      >
                        <div className="text-sm font-bold">{mode.label}</div>
                        <div className={`text-xs ${soundMode === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {mode.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Meditation */}
                {soundTab === 'meditation' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {SOUND_MODES.filter(m => m.category === 'meditation').map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setSoundMode(mode.id)}
                        className={`p-2 rounded-lg font-medium transition-all text-left
                          ${soundMode === mode.id
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg ring-2 ring-indigo-300'
                            : 'bg-indigo-50 text-gray-700 hover:bg-indigo-100 border border-indigo-200'
                          }`}
                      >
                        <div className="text-sm font-bold">{mode.label}</div>
                        <div className={`text-xs ${soundMode === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {mode.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Start Button - Compact */}
            <div className="text-center">
              <button
                onClick={startTimer}
                disabled={getTotalSeconds() <= 0}
                className="px-12 py-4 text-2xl font-black text-white rounded-full
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
