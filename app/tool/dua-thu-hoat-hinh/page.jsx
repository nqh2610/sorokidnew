'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import ToolLayout from '@/components/ToolLayout/ToolLayout';

// Các loài vật có thể đua - emoji hướng đầu về đích (phải)
// flipX: true = cần lật ngang để quay đầu sang phải
const ANIMAL_TYPES = {
  duck: {
    emoji: '🦆',
    name: 'Vịt',
    sound: 'Quạc quạc!',
    goSound: 'QUÁC!', // Tiếng kêu khi xuất phát
    action: 'bơi',
    habitat: 'sông',
    plural: 'vịt',
    flipX: true,
    moveVerb: 'bơi',
    speedBase: 1.0,
  },
  turtle: {
    emoji: '🐢',
    name: 'Rùa', 
    sound: 'Chậm mà chắc!',
    goSound: 'ỤP!',
    action: 'bò',
    habitat: 'sông',
    plural: 'rùa',
    flipX: true,
    moveVerb: 'bò',
    speedBase: 1.0,
  },
  crab: {
    emoji: '🦀',
    name: 'Cua',
    sound: 'Kẹp kẹp!',
    goSound: 'KẸP!',
    action: 'bò ngang',
    habitat: 'biển',
    plural: 'cua',
    flipX: false,
    moveVerb: 'bò',
    speedBase: 1.0,
  },
  fish: {
    emoji: '🐟',
    name: 'Cá',
    sound: 'Blub blub!',
    goSound: 'BÕM!',
    action: 'bơi',
    habitat: 'sông',
    plural: 'cá',
    flipX: true,
    moveVerb: 'bơi',
    speedBase: 1.0,
  },
  snail: {
    emoji: '🐌',
    name: 'Ốc sên',
    sound: 'Từ từ thôi...',
    goSound: 'RÙ!',
    action: 'trườn',
    habitat: 'đường',
    plural: 'ốc',
    flipX: true,
    moveVerb: 'trườn',
    speedBase: 1.0,
  },
};

// Hàm tạo bình luận động theo loài vật
const getCommentaries = (animalType) => {
  const animal = ANIMAL_TYPES[animalType];
  const name = animal.name.toLowerCase();
  const plural = animal.plural;
  const action = animal.moveVerb;
  
  return {
    start: [
      `🎙️ Và cuộc đua bắt đầu! Các chú ${plural} lao như tên bắn!`,
      `🎙️ ${animal.sound} Xuất phát rồi bà con ơi!`,
      `🎙️ Đi nào các chiến binh ${plural}!`,
      `🎙️ 3... 2... 1... GO! ${animal.name} nào cũng hăng máu!`,
      `🎙️ Nước sông dậy sóng! Cuộc đua bắt đầu!`,
      `🎙️ Cả đàn ${plural} xung trận! Ai sẽ về nhất?`,
      `🎙️ Sẵn sàng chưa? Không cần biết! CHẠY!`,
      `🎙️ ${animal.name} ơi là ${name}! Phi thôi nào!`,
    ],
    leading: [
      `🔥 {name} đang dẫn đầu! ${action.charAt(0).toUpperCase() + action.slice(1)} đẹp lắm!`,
      '👑 {name} phong độ tuyệt vời!',
      `🚀 {name} như có gắn động cơ vậy!`,
      `⚡ {name} đang bay trên mặt nước!`,
      `💪 {name} ${action} như máy!`,
      `🌟 {name} tỏa sáng rực rỡ ở vị trí số 1!`,
      `😎 {name} cool ngầu dẫn đầu đoàn ${plural}!`,
      `🏃 {name} phi nhanh quá! Không ai đuổi kịp!`,
      `🦸 {name} đang cho cả đàn hít khói!`,
      `💨 {name} ${action} nhanh như gió!`,
    ],
    overtake: [
      '😱 {name} vượt lên! Đảo chiều kịch tính!',
      '🔄 {name} lật kèo rồi bà con!',
      '💨 {name} tăng tốc vượt mặt đối thủ!',
      '🎯 {name} quyết tâm giành ngôi đầu!',
      '⚡ {name} bật turbo! Vượt mặt ngon lành!',
      '🚀 {name} phóng như rocket! Ai mà đuổi kịp!',
      '😤 {name} không chịu thua! Vượt lên ngoạn mục!',
      '🌪️ {name} như cơn lốc! Cuốn bay đối thủ!',
      '🔥 {name} bứt tốc! Đối thủ chỉ biết ngậm ngùi!',
      '⚔️ {name} ra đòn quyết định!',
    ],
    tired: [
      '😓 {name} có vẻ đuối sức rồi...',
      '💦 {name} đang thở hổn hển!',
      '🥵 {name} cần nghỉ ngơi!',
      '😴 {name} buồn ngủ quá! Hôm qua thức khuya à?',
      '🥱 {name} ngáp dài... Ủa đua hay ngủ vậy?',
      '😩 {name} kiệt sức! Cần nghỉ ngơi!',
      '💤 {name} mơ màng... Tỉnh dậy đi nào!',
      `🐌 {name} chậm lại rồi... Đuối quá!`,
      '😵 {name} xỉu rồi xỉu rồi...',
      '🫠 {name} tan chảy vì mệt...',
    ],
    collision: [
      '💥 Ôi! {name} đụng chướng ngại vật!',
      '😵 {name} gặp tai nạn rồi!',
      '🤕 {name} bị văng ra ngoài!',
      '💫 {name} thấy sao bay quanh đầu!',
      '🤯 {name} đâm sầm! Đau quá trời!',
      `😵‍💫 {name} chóng mặt! ${action.charAt(0).toUpperCase() + action.slice(1)} đường nào vậy?`,
      '🪨 {name} ơi đá kia mà! Muộn rồi...',
      '😅 {name} nghĩ đá là đồ ăn à?',
      '🫨 {name} rung rinh cả người!',
      '😬 {name} ăn đá ngon lành!',
    ],
    close: [
      '😰 Căng thẳng! Chỉ cách nhau gang tấc!',
      '🔥 Cuộc đua sát nút! Ai sẽ thắng?',
      '⚔️ Cuộc chiến nảy lửa ở top đầu!',
      '😱 Sát sàn sạt! Tim tôi muốn rớt!',
      '🥶 Lạnh gáy! Không biết ai thắng!',
      '🎢 Như tàu lượn siêu tốc! Hồi hộp quá!',
      '💓 Đua nhau từng milimet! Kịch tính!',
      '🤯 Không thể tin được! Quá sát!',
      '😤 Ai cũng quyết tâm! Căng như dây đàn!',
      '🫣 Không dám nhìn! Quá gay cấn!',
    ],
    halfway: [
      `🏁 Đã qua nửa đường! ${animal.name} nào sẽ bứt phá?`,
      '⏰ Nửa chặng đua! Cuộc chiến bắt đầu nóng lên!',
      `🎯 50%! Các ${plural} bắt đầu thể hiện bản lĩnh!`,
      '🔥 Qua nửa đường! Giờ mới là lúc quyết định!',
    ],
    final: [
      `🏆 {name} VÔ ĐỊCH! ${animal.name} xuất sắc nhất hôm nay!`,
      `🎉 CHÚC MỪNG {name}! Một ${name.toLowerCase()} phi thường!`,
      `👑 {name} đăng quang ngôi vương ${plural}!`,
      `🥇 {name} chiến thắng! Không ai địch nổi!`,
      `🌟 {name} - Nhà vô địch không thể ngăn cản!`,
      `🎊 {name} về đích! Một chiến thắng tuyệt vời!`,
    ],
    boost: [
      `🚀 {name} bật turbo! ${action.charAt(0).toUpperCase() + action.slice(1)} như bay!`,
      '⚡ {name} tăng tốc kinh hoàng!',
      '💨 {name} bỗng dưng nhanh gấp đôi!',
    ],
    slowdown: [
      `🌊 {name} gặp khó khăn! Chậm lại rồi!`,
      `😓 {name} đang ${action} chậm hẳn!`,
      '🐌 {name} mất đà! Đối thủ đuổi kịp kìa!',
    ],
    comeback: [
      '🔥 {name} hồi sinh! Từ phía sau vọt lên!',
      '💪 {name} không bỏ cuộc! Đang đuổi theo!',
      '😤 {name} quyết tâm comeback! Đáng gờm!',
    ],
    lucky: [
      '🍀 {name} may mắn né được chướng ngại!',
      '✨ {name} thoát nạn trong gang tấc!',
      '😅 {name} suýt đụng! May quá!',
    ],
  };
};

// 50 màu sắc đa dạng cho vịt
const DUCK_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', 
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#fb7185', '#fda4af', '#fbbf24', '#a3e635',
  '#4ade80', '#2dd4bf', '#22d3ee', '#38bdf8', '#818cf8',
  '#c084fc', '#e879f9', '#f472b6', '#fb923c', '#facc15',
  '#a78bfa', '#c4b5fd', '#7dd3fc', '#67e8f9', '#5eead4',
  '#6ee7b7', '#86efac', '#bef264', '#fde047', '#fcd34d',
  '#fdba74', '#fca5a5', '#f9a8d4', '#f0abfc', '#d8b4fe',
  '#a5b4fc', '#93c5fd', '#7dd3fc', '#a7f3d0', '#d9f99d',
];

// Vật cản trên sông - gây tai nạn thực sự
const OBSTACLES = [
  { id: 'rock1', emoji: '🪨', x: 25, y: 20, size: 'large' },
  { id: 'rock2', emoji: '🪨', x: 45, y: 70, size: 'medium' },
  { id: 'rock3', emoji: '🪨', x: 65, y: 35, size: 'large' },
  { id: 'log1', emoji: '🪵', x: 35, y: 50, size: 'medium' },
  { id: 'log2', emoji: '🪵', x: 55, y: 15, size: 'large' },
  { id: 'log3', emoji: '🪵', x: 75, y: 60, size: 'medium' },
  { id: 'plant1', emoji: '🌿', x: 20, y: 80, size: 'small' },
  { id: 'plant2', emoji: '🌾', x: 40, y: 25, size: 'small' },
  { id: 'plant3', emoji: '🌿', x: 60, y: 85, size: 'small' },
  { id: 'whirl1', emoji: '🌀', x: 50, y: 45, size: 'medium' },
  { id: 'fish1', emoji: '🐟', x: 30, y: 65, size: 'small' },
  { id: 'crab1', emoji: '🦀', x: 70, y: 40, size: 'small' },
];

// Helper: Extract short name (tên) from full Vietnamese name
const getShortName = (fullName) => {
  const parts = fullName.trim().split(/\s+/);
  // Vietnamese: last word is the "tên" (first name)
  return parts[parts.length - 1];
};

export default function DuaThuHoatHinh() {
  // Input state
  const [inputText, setInputText] = useState('');
  const [racers, setRacers] = useState([]);
  
  // Race state
  const [positions, setPositions] = useState({});
  const [verticalPos, setVerticalPos] = useState({});
  const [racerEffects, setRacerEffects] = useState({}); // Hiệu ứng hiện tại của mỗi vịt
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState(null);
  const [topRacers, setTopRacers] = useState([]);
  const [events, setEvents] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [raceTime, setRaceTime] = useState(0);
  const [raceSpeed, setRaceSpeed] = useState('normal'); // 'slow', 'normal', 'fast'
  const [animalType, setAnimalType] = useState('duck'); // 'duck', 'turtle', 'crab', 'fish', 'snail'
  const [commentary, setCommentary] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastLeader, setLastLeader] = useState(null);
  const [duplicateNames, setDuplicateNames] = useState([]); // Tên trùng
  
  const animationRef = useRef(null);
  const containerRef = useRef(null);
  const commentaryTimeoutRef = useRef(null);
  const raceStartTimeRef = useRef(null);
  const racerStatesRef = useRef({});
  const bgMusicRef = useRef(null);
  const bgMusicIntervalRef = useRef(null);

  // Parse input to racers - support up to 200 racers
  const parseInput = useCallback(() => {
    const names = inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 200); // Max 200 racers
    
    // Detect duplicate names (case-insensitive)
    const nameCounts = {};
    const originalNames = {}; // Store original casing
    names.forEach(name => {
      const lowerName = name.toLowerCase();
      nameCounts[lowerName] = (nameCounts[lowerName] || 0) + 1;
      if (!originalNames[lowerName]) {
        originalNames[lowerName] = name; // Keep first occurrence's casing
      }
    });
    const duplicates = Object.entries(nameCounts)
      .filter(([_, count]) => count > 1)
      .map(([lowerName, count]) => ({ name: originalNames[lowerName], count }));
    setDuplicateNames(duplicates);
    
    const newRacers = names.map((name, index) => ({
      id: `racer-${index}`,
      name: name, // Full name for results
      shortName: getShortName(name), // Short name for racing display
      color: DUCK_COLORS[index % DUCK_COLORS.length],
      index: index,
    }));
    
    setRacers(newRacers);
    
    // Initialize positions - better distribution for many racers
    const initialPos = {};
    const initialVertical = {};
    const initialEffects = {};
    const totalRacers = newRacers.length;
    
    newRacers.forEach((r, i) => {
      initialPos[r.id] = 0;
      // Smart vertical distribution - USE FULL RIVER WIDTH (5%-95%)
      if (totalRacers <= 10) {
        // Few racers - spread out evenly across full width
        initialVertical[r.id] = 5 + (i * 90 / Math.max(totalRacers - 1, 1));
      } else if (totalRacers <= 50) {
        // Medium - use rows across full width
        const row = i % 8;
        const jitter = Math.random() * 3 - 1.5;
        initialVertical[r.id] = 5 + row * 11.5 + jitter;
      } else {
        // Many racers (50-200) - dense packing across full width
        const row = i % 12;
        const jitter = Math.random() * 2 - 1;
        initialVertical[r.id] = 5 + row * 7.5 + jitter;
      }
      initialEffects[r.id] = null;
    });
    setPositions(initialPos);
    setVerticalPos(initialVertical);
    setRacerEffects(initialEffects);
    setWinner(null);
    setTopRacers([]);
    setEvents([]);
    setRaceTime(0);
  }, [inputText]);

  // Auto parse when input changes
  useEffect(() => {
    parseInput();
  }, [inputText, parseInput]);

  // Play sound
  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch (type) {
        case 'countdown':
          oscillator.frequency.value = 440;
          gainNode.gain.value = 0.2;
          oscillator.start();
          setTimeout(() => oscillator.stop(), 150);
          break;
        case 'start':
          oscillator.frequency.value = 880;
          gainNode.gain.value = 0.3;
          oscillator.start();
          setTimeout(() => oscillator.stop(), 300);
          break;
        case 'event':
          oscillator.frequency.value = 600;
          gainNode.gain.value = 0.15;
          oscillator.start();
          setTimeout(() => oscillator.stop(), 100);
          break;
        case 'win':
          gainNode.gain.value = 0.3;
          oscillator.frequency.value = 523;
          oscillator.start();
          setTimeout(() => {
            oscillator.frequency.value = 659;
            setTimeout(() => {
              oscillator.frequency.value = 784;
              setTimeout(() => {
                oscillator.frequency.value = 1047;
                setTimeout(() => oscillator.stop(), 200);
              }, 150);
            }, 150);
          }, 150);
          break;
      }
    } catch (e) {
      // Audio not supported
    }
  }, [soundEnabled]);

  // Start background race music - exciting continuous racing tune
  const startBgMusic = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      bgMusicRef.current = audioContext;
      
      // Create master gain for overall volume control
      const masterGain = audioContext.createGain();
      masterGain.gain.value = 0.12;
      masterGain.connect(audioContext.destination);
      
      // Exciting upbeat racing melody - faster tempo!
      const melodyPattern = [
        // Phrase 1 - Energetic start
        { note: 392, dur: 0.12 }, // G4
        { note: 440, dur: 0.12 }, // A4
        { note: 523, dur: 0.12 }, // C5
        { note: 587, dur: 0.12 }, // D5
        { note: 659, dur: 0.24 }, // E5
        { note: 587, dur: 0.12 }, // D5
        { note: 523, dur: 0.12 }, // C5
        { note: 440, dur: 0.24 }, // A4
        // Phrase 2 - Building excitement
        { note: 523, dur: 0.12 }, // C5
        { note: 659, dur: 0.12 }, // E5
        { note: 784, dur: 0.24 }, // G5
        { note: 880, dur: 0.12 }, // A5
        { note: 784, dur: 0.12 }, // G5
        { note: 659, dur: 0.12 }, // E5
        { note: 523, dur: 0.24 }, // C5
        // Phrase 3 - Climax
        { note: 659, dur: 0.12 }, // E5
        { note: 784, dur: 0.12 }, // G5
        { note: 880, dur: 0.12 }, // A5
        { note: 988, dur: 0.24 }, // B5
        { note: 880, dur: 0.12 }, // A5
        { note: 784, dur: 0.12 }, // G5
        { note: 659, dur: 0.24 }, // E5
        // Phrase 4 - Resolution
        { note: 784, dur: 0.12 }, // G5
        { note: 659, dur: 0.12 }, // E5
        { note: 523, dur: 0.12 }, // C5
        { note: 440, dur: 0.12 }, // A4
        { note: 392, dur: 0.24 }, // G4
        { note: 440, dur: 0.12 }, // A4
        { note: 523, dur: 0.24 }, // C5
      ];
      
      // Driving bass line - steady rhythm
      const bassPattern = [
        { note: 131, dur: 0.24 }, // C3
        { note: 131, dur: 0.12 }, // C3
        { note: 165, dur: 0.12 }, // E3
        { note: 196, dur: 0.24 }, // G3
        { note: 196, dur: 0.12 }, // G3
        { note: 165, dur: 0.12 }, // E3
        { note: 175, dur: 0.24 }, // F3
        { note: 175, dur: 0.12 }, // F3
        { note: 196, dur: 0.12 }, // G3
        { note: 220, dur: 0.24 }, // A3
        { note: 196, dur: 0.12 }, // G3
        { note: 165, dur: 0.12 }, // E3
      ];
      
      let melodyIndex = 0;
      let bassIndex = 0;
      let nextMelodyTime = audioContext.currentTime + 0.1;
      let nextBassTime = audioContext.currentTime + 0.1;
      
      // Smooth note player with proper envelope (no clicks!)
      const playNote = (freq, startTime, duration, gainValue, waveType = 'sine') => {
        if (!bgMusicRef.current) return;
        
        const osc = audioContext.createOscillator();
        const noteGain = audioContext.createGain();
        
        osc.type = waveType;
        osc.frequency.value = freq;
        osc.connect(noteGain);
        noteGain.connect(masterGain);
        
        // Super smooth ADSR envelope - no harsh starts or stops
        const attackTime = 0.03;
        const decayTime = 0.05;
        const sustainLevel = gainValue * 0.8;
        const releaseTime = 0.08;
        
        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(gainValue, startTime + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, startTime + attackTime + decayTime);
        noteGain.gain.setValueAtTime(sustainLevel, startTime + duration - releaseTime);
        noteGain.gain.linearRampToValueAtTime(0, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration + 0.01);
      };
      
      const scheduleMusic = () => {
        if (!bgMusicRef.current) return;
        const currentTime = bgMusicRef.current.currentTime;
        
        // Schedule melody notes ahead (look-ahead buffering)
        while (nextMelodyTime < currentTime + 0.3) {
          const { note, dur } = melodyPattern[melodyIndex % melodyPattern.length];
          playNote(note, nextMelodyTime, dur, 0.5, 'sine');
          // Add slight octave harmony every other note for richness
          if (melodyIndex % 2 === 0) {
            playNote(note * 0.5, nextMelodyTime, dur, 0.2, 'triangle');
          }
          nextMelodyTime += dur;
          melodyIndex++;
        }
        
        // Schedule bass notes
        while (nextBassTime < currentTime + 0.3) {
          const { note, dur } = bassPattern[bassIndex % bassPattern.length];
          playNote(note, nextBassTime, dur, 0.4, 'triangle');
          nextBassTime += dur;
          bassIndex++;
        }
      };
      
      // Schedule music with frequent updates for smooth playback
      bgMusicIntervalRef.current = setInterval(scheduleMusic, 50);
      scheduleMusic();
      
    } catch (e) {
      // Audio not supported
    }
  }, [soundEnabled]);

  // Stop background music
  const stopBgMusic = useCallback(() => {
    if (bgMusicIntervalRef.current) {
      clearInterval(bgMusicIntervalRef.current);
      bgMusicIntervalRef.current = null;
    }
    if (bgMusicRef.current) {
      bgMusicRef.current.close?.();
      bgMusicRef.current = null;
    }
  }, []);

  // Show commentary - dynamic based on animal type
  const showCommentary = useCallback((type, name = '') => {
    const commentaries = getCommentaries(animalType);
    const messages = commentaries[type];
    if (!messages) return;
    // Use shortName if available
    const displayName = name.includes(' ') ? getShortName(name) : name;
    const msg = messages[Math.floor(Math.random() * messages.length)].replace('{name}', displayName);
    setCommentary(msg);
    
    if (commentaryTimeoutRef.current) {
      clearTimeout(commentaryTimeoutRef.current);
    }
    // Longer display time (4.5s) so users can read
    commentaryTimeoutRef.current = setTimeout(() => setCommentary(''), 4500);
  }, [animalType]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Start race with countdown
  const startRace = useCallback(() => {
    if (isRacing || racers.length < 2) return;
    
    // Speed multiplier based on raceSpeed setting (5 levels)
    const speedMultipliers = {
      'very-slow': 0.7,
      'slow': 1.2,
      'normal': 2.0,
      'fast': 3.5,
      'very-fast': 5.5
    };
    const speedMultiplier = speedMultipliers[raceSpeed] || 1;
    
    // Animal speed modifier
    const animalSpeedBase = ANIMAL_TYPES[animalType].speedBase || 1;
    const finalSpeedMultiplier = speedMultiplier * animalSpeedBase;
    
    const totalRacers = racers.length;
    
    // Reset states
    const initialPos = {};
    const initialVertical = {};
    const initialEffects = {};
    racers.forEach((r, i) => {
      initialPos[r.id] = 0;
      // Smart vertical distribution - USE FULL RIVER WIDTH (5%-95%)
      if (totalRacers <= 10) {
        // Spread evenly from 5% to 95%
        initialVertical[r.id] = 5 + (i * 90 / Math.max(totalRacers - 1, 1));
      } else if (totalRacers <= 30) {
        // Use full height with proper spacing
        const row = i % totalRacers;
        initialVertical[r.id] = 5 + (row * 90 / Math.max(totalRacers - 1, 1));
      } else if (totalRacers <= 50) {
        // Stack in columns if needed
        const row = i % 20;
        const col = Math.floor(i / 20);
        const jitter = col * 2;
        initialVertical[r.id] = 5 + row * 4.5 + jitter;
      } else {
        // Many racers - tight packing
        const row = i % 25;
        const col = Math.floor(i / 25);
        const jitter = col * 1.5;
        initialVertical[r.id] = 5 + row * 3.6 + jitter;
      }
      initialEffects[r.id] = null;
      racerStatesRef.current[r.id] = {
        baseSpeed: (0.12 + Math.random() * 0.04) * finalSpeedMultiplier,
        currentSpeed: 0.12 * finalSpeedMultiplier,
        targetSpeed: 0.12 * finalSpeedMultiplier,
        stamina: 100,
        fatigue: 0,
        wobble: Math.random() * Math.PI * 2,
        isStunned: false,
        stunnedUntil: 0,
        lastObstacleHit: 0,
        speedVariation: Math.random() * 0.02 - 0.01,
        variationPhase: Math.random() * Math.PI * 2,
      };
    });
    setPositions(initialPos);
    setVerticalPos(initialVertical);
    setRacerEffects(initialEffects);
    setWinner(null);
    setTopRacers([]);
    setEvents([]);
    setRaceTime(0);
    raceStartTimeRef.current = null;
    
    // Countdown
    setCountdown(3);
    playSound('countdown');
    
    setTimeout(() => {
      setCountdown(2);
      playSound('countdown');
    }, 1000);
    
    setTimeout(() => {
      setCountdown(1);
      playSound('countdown');
    }, 2000);
    
    setTimeout(() => {
      setCountdown(ANIMAL_TYPES[animalType].goSound);
      playSound('start');
    }, 3000);
    
    setTimeout(() => {
      setCountdown(null);
      setIsRacing(true);
      raceStartTimeRef.current = Date.now();
      setLastLeader(null);
      showCommentary('start');
      startBgMusic(); // Start background music
      runRace();
    }, 3500);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [racers, isRacing, playSound, raceSpeed, showCommentary]);

  // Check collision with obstacles
  const checkObstacleCollision = useCallback((x, y) => {
    for (const obs of OBSTACLES) {
      const hitRange = obs.size === 'large' ? 8 : obs.size === 'medium' ? 6 : 4;
      if (Math.abs(x - obs.x) < hitRange && Math.abs(y - obs.y) < hitRange) {
        return obs;
      }
    }
    return null;
  }, []);

  // Main race logic - realistic with fatigue and obstacles
  const runRace = useCallback(() => {
    let raceFinished = false;
    let frameCount = 0;
    
    const animate = () => {
      if (raceFinished) return;
      frameCount++;
      const now = Date.now();
      
      // Update race time
      if (raceStartTimeRef.current) {
        setRaceTime(Math.floor((now - raceStartTimeRef.current) / 1000));
      }
      
      setPositions(prevPos => {
        const newPositions = { ...prevPos };
        const newEffects = {};
        
        // Sort to find rankings
        const sorted = Object.entries(newPositions)
          .sort(([,a], [,b]) => b - a);
        const topIds = sorted.slice(0, 5).map(([id]) => id);
        const maxPos = sorted[0]?.[1] || 0;
        const leaderId = sorted[0]?.[0];
        const leaderRacer = racers.find(r => r.id === leaderId);
        
        // Update top racers every 10 frames
        if (frameCount % 10 === 0) {
          setTopRacers(topIds.map(id => racers.find(r => r.id === id)).filter(Boolean));
        }
        
        // Commentary for leader change
        if (frameCount % 30 === 0 && leaderRacer) {
          setLastLeader(prev => {
            if (prev && prev !== leaderId && maxPos > 15) {
              showCommentary('overtake', leaderRacer.name);
            } else if (!prev || (frameCount % 150 === 0 && maxPos > 10 && maxPos < 90)) {
              showCommentary('leading', leaderRacer.name);
            }
            return leaderId;
          });
        }
        
        // Commentary for halfway
        if (frameCount === 1 || (maxPos >= 48 && maxPos <= 52 && frameCount % 60 === 0)) {
          if (maxPos >= 48 && maxPos <= 52) showCommentary('halfway');
        }
        
        // Commentary for close race
        if (frameCount % 100 === 0 && sorted.length >= 2) {
          const gap = sorted[0][1] - sorted[1][1];
          if (gap < 5 && maxPos > 30) {
            showCommentary('close');
          }
        }
        
        racers.forEach((racer, idx) => {
          if (raceFinished) return;
          
          const state = racerStatesRef.current[racer.id];
          const currentPos = newPositions[racer.id];
          const currentV = verticalPos[racer.id] || 50;
          
          // Check if stunned
          if (state.isStunned && now < state.stunnedUntil) {
            newEffects[racer.id] = { type: 'stunned', emoji: '💫' };
            return;
          } else if (state.isStunned) {
            state.isStunned = false;
          }
          
          // Find current rank
          const rank = sorted.findIndex(([id]) => id === racer.id) + 1;
          const isLeader = rank === 1;
          const isTop3 = rank <= 3;
          const isTop5 = rank <= 5;
          const isTop10 = rank <= 10;
          
          // === FATIGUE SYSTEM - smoother ===
          if (isLeader && currentPos > 20) {
            state.fatigue += 0.015;
            state.stamina = Math.max(0, state.stamina - 0.025);
          } else if (isTop3 && currentPos > 30) {
            state.fatigue += 0.008;
            state.stamina = Math.max(20, state.stamina - 0.008);
          } else {
            state.fatigue = Math.max(0, state.fatigue - 0.004);
            state.stamina = Math.min(100, state.stamina + 0.015);
          }
          
          // === CALCULATE TARGET SPEED (smoother) ===
          let targetSpeed = state.baseSpeed;
          
          // Fatigue reduces speed more gradually
          const fatigueMultiplier = 1 - (state.fatigue * 0.2);
          targetSpeed *= Math.max(0.65, fatigueMultiplier);
          
          // Stamina affects speed
          const staminaMultiplier = 0.85 + (state.stamina / 100) * 0.15;
          targetSpeed *= staminaMultiplier;
          
          // Smoother sine wave variation
          state.variationPhase += 0.02;
          const smoothVariation = 1 + Math.sin(state.variationPhase) * 0.02 + state.speedVariation * 0.5;
          targetSpeed *= smoothVariation;
          
          // Gentler catch-up
          if (currentPos < maxPos - 30) {
            targetSpeed *= 1.02;
          }
          
          // LERP with much smoother factor for fluid motion
          state.targetSpeed = targetSpeed;
          state.currentSpeed = state.currentSpeed + (targetSpeed - state.currentSpeed) * 0.15;
          
          // Ensure minimum speed to prevent stuttering
          const speed = Math.max(state.currentSpeed, 0.05);
          
          // === OBSTACLE COLLISION ===
          const obstacle = checkObstacleCollision(currentPos, currentV);
          if (obstacle && now - state.lastObstacleHit > 3000) {
            state.lastObstacleHit = now;
            state.isStunned = true;
            state.stunnedUntil = now + (obstacle.size === 'large' ? 1200 : obstacle.size === 'medium' ? 800 : 400);
            state.fatigue += obstacle.size === 'large' ? 12 : obstacle.size === 'medium' ? 8 : 4;
            
            newEffects[racer.id] = { 
              type: 'collision', 
              emoji: obstacle.emoji,
              text: obstacle.emoji === '🪨' ? 'Đụng đá!' : obstacle.emoji === '🪵' ? 'Vướng gỗ!' : 'Vướng!'
            };
            
            if (isTop3) {
              showCommentary('collision', racer.name);
              const funnyComments = obstacle.emoji === '🪨' 
                ? [
                    'Cục đá từ đâu ra vậy?! 💫',
                    'Ui! Đầu tôi ơi! Đá cứng quá!',
                    'Ai để đá giữa sông vậy nè?!',
                    'Không thấy đá à? Đúng là cận!',
                    'Bể đầu chưa? Đá to ghê!',
                    'Một cú húc đầy đau đớn! 🤕',
                  ]
                : obstacle.emoji === '🪵' 
                ? [
                    'Khúc gỗ! Ai xả rác vậy?!',
                    'Gỗ nổi mà không thấy sao?',
                    'Vướng gỗ rồi! Chân ơi chân!',
                    'Mắc gỗ như cá mắc lưới!',
                    'Khúc gỗ xuất hiện bất ngờ!',
                    'Gỗ này ai thả vậy cà?!',
                  ]
                : [
                    'Ôi! Đụng cái gì vậy?!',
                    'Va phải rồi! Xui ghê!',
                    'Chướng ngại vật bất ngờ!',
                  ];
              setEvents(prev => [
                ...prev.slice(-4),
                { 
                  id: now, 
                  racerName: racer.shortName, 
                  color: racer.color, 
                  emoji: obstacle.emoji,
                  text: obstacle.emoji === '🪨' ? 'ĐỤNG ĐÁ!' : obstacle.emoji === '🪵' ? 'VƯỚNG GỖ!' : 'VA CHẠM!',
                  comment: funnyComments[Math.floor(Math.random() * funnyComments.length)],
                  effect: 'slow'
                }
              ]);
              playSound('event');
            }
            return;
          }
          
          // === RANDOM FATIGUE SPIKE (less frequent) ===
          if (isLeader && currentPos > 45 && Math.random() < 0.0015) {
            state.fatigue += 15;
            const animal = ANIMAL_TYPES[animalType];
            newEffects[racer.id] = { type: 'tired', emoji: '😓', text: 'Mệt quá!' };
            showCommentary('tired', racer.name);
            const tiredComments = [
              `${animal.moveVerb.charAt(0).toUpperCase() + animal.moveVerb.slice(1)} nhanh quá nên hết hơi rồi! 😮‍💨`,
              'Dẫn đầu cũng mệt lắm nha!',
              'Chân mỏi quá! Cần nghỉ xíu!',
              'Hết pin rồi! Cần sạc gấp! 🔋',
              `${animal.name} đuối sức rồi!`,
              `Đuối sức! ${animal.moveVerb.charAt(0).toUpperCase() + animal.moveVerb.slice(1)} đầu tiên áp lực ghê!`,
              'Hụt hơi rồi! Ai có oxy không?',
              'Mệt muốn xỉu! Sức cùng lực kiệt!',
            ];
            setEvents(prev => [
              ...prev.slice(-4),
              { id: now, racerName: racer.shortName, color: racer.color, emoji: '😓', text: 'MỆT QUÁ!', comment: tiredComments[Math.floor(Math.random() * tiredComments.length)], effect: 'slow' }
            ]);
          }
          
          // === RANDOM BOOST - Sudden burst of energy! ===
          if (currentPos > 20 && currentPos < 80 && Math.random() < 0.001 && state.fatigue < 20) {
            state.fatigue = Math.max(0, state.fatigue - 10);
            state.stamina = Math.min(100, state.stamina + 20);
            state.baseSpeed *= 1.08; // Temporary speed boost
            const animal = ANIMAL_TYPES[animalType];
            newEffects[racer.id] = { type: 'boost', emoji: '🚀', text: 'TURBO!' };
            const boostComments = [
              `WOOHOO! ${animal.moveVerb.charAt(0).toUpperCase() + animal.moveVerb.slice(1)} nhanh như tên lửa! 🚀`,
              'Bỗng dưng có sức mạnh bí ẩn!',
              'Chân như có động cơ phản lực!',
              'Tăng tốc cực mạnh! Bùm bùm!',
              'Năng lượng tràn đầy! Vút lên nào!',
              'Như được gió đẩy từ phía sau!',
              `${animal.name} đang bay! Không ai cản nổi!`,
              'Full năng lượng! Let\'s gooo!',
            ];
            if (isTop10) {
              showCommentary('boost', racer.name);
              setEvents(prev => [
                ...prev.slice(-4),
                { id: now, racerName: racer.shortName, color: racer.color, emoji: '🚀', text: 'TĂNG TỐC!', comment: boostComments[Math.floor(Math.random() * boostComments.length)], effect: 'fast' }
              ]);
              playSound('event');
            }
          }
          
          // === SUDDEN SLOWDOWN - Something happened! ===
          if (isTop5 && currentPos > 30 && currentPos < 85 && Math.random() < 0.0008) {
            state.fatigue += 10;
            state.baseSpeed *= 0.95;
            const animal = ANIMAL_TYPES[animalType];
            newEffects[racer.id] = { type: 'slow', emoji: '🌊', text: 'Gặp khó!' };
            const slowComments = [
              'Ối! Sóng to bất ngờ đánh ngược! 🌊',
              `Nước xoáy! ${animal.moveVerb.charAt(0).toUpperCase() + animal.moveVerb.slice(1)} ngược dòng khó quá!`,
              'Sóng dữ! Bị đẩy lùi một chút!',
              'Gặp dòng nước ngược! Chậm lại rồi!',
              `${animal.name} gặp trở ngại! Chậm lại!`,
              'Dòng chảy xiết quá! Khó tiến lên!',
            ];
            showCommentary('slowdown', racer.name);
            setEvents(prev => [
              ...prev.slice(-4),
              { id: now, racerName: racer.shortName, color: racer.color, emoji: '🌊', text: 'GẶP KHÓ!', comment: slowComments[Math.floor(Math.random() * slowComments.length)], effect: 'slow' }
            ]);
          }
          
          // === COMEBACK - Recovering from behind! ===
          if (rank > 5 && rank <= 15 && currentPos > 40 && Math.random() < 0.0006) {
            state.fatigue = Math.max(0, state.fatigue - 15);
            state.stamina = Math.min(100, state.stamina + 30);
            state.baseSpeed *= 1.1;
            const animal = ANIMAL_TYPES[animalType];
            newEffects[racer.id] = { type: 'comeback', emoji: '🔥', text: 'Hồi sinh!' };
            const comebackComments = [
              'KHÔNG BỎ CUỘC! Từ phía sau vượt lên! 🔥',
              `${animal.name} bỗng lấy lại phong độ!`,
              'Hồi sinh mạnh mẽ! Đuổi theo kìa!',
              'Từ chỗ gần cuối đang vọt lên top!',
              'Comeback cực mạnh từ đằng sau!',
              'Tưởng thua rồi mà bùng nổ trở lại!',
            ];
            showCommentary('comeback', racer.name);
            setEvents(prev => [
              ...prev.slice(-4),
              { id: now, racerName: racer.shortName, color: racer.color, emoji: '🔥', text: 'HỒI SINH!', comment: comebackComments[Math.floor(Math.random() * comebackComments.length)], effect: 'fast' }
            ]);
            playSound('event');
          }
          
          // === LUCKY DODGE - Almost hit but dodged! ===
          if (currentPos > 15 && Math.random() < 0.0004) {
            newEffects[racer.id] = { type: 'lucky', emoji: '🍀', text: 'May quá!' };
            const luckyComments = [
              'HÚ HỒN! Suýt đụng mà né kịp! 🍀',
              'May quá! Chướng ngại vật sát bên!',
              'Né đẹp! Thoát nạn trong gang tấc!',
              'Thần may mắn phù hộ! Thoát hiểm!',
              'Suýt va chạm! Phản xạ nhanh ghê!',
              'Lucky! Né được đá/gỗ trong tích tắc!',
            ];
            if (isTop10) {
              showCommentary('lucky', racer.name);
              setEvents(prev => [
                ...prev.slice(-4),
                { id: now, racerName: racer.shortName, color: racer.color, emoji: '🍀', text: 'NÉ ĐƯỢC!', comment: luckyComments[Math.floor(Math.random() * luckyComments.length)], effect: 'neutral' }
              ]);
            }
          }
          
          // === FISH ENCOUNTER - Funny interaction with fish! ===
          if (currentPos > 25 && currentPos < 75 && Math.random() < 0.0003) {
            const isFriendly = Math.random() > 0.5;
            if (isFriendly) {
              state.fatigue = Math.max(0, state.fatigue - 5);
              newEffects[racer.id] = { type: 'fish', emoji: '🐟', text: 'Gặp cá!' };
              const fishFriendlyComments = [
                'Ô! Gặp đàn cá dẫn đường! Cảm ơn nhé! 🐟',
                'Cá nhỏ bơi cùng! Vui quá!',
                'Được cá hộ tống! Sang thật!',
              ];
              if (isTop10) {
                setEvents(prev => [
                  ...prev.slice(-4),
                  { id: now, racerName: racer.shortName, color: racer.color, emoji: '🐟', text: 'CÁ DẪN ĐƯỜNG!', comment: fishFriendlyComments[Math.floor(Math.random() * fishFriendlyComments.length)], effect: 'neutral' }
                ]);
              }
            } else {
              state.fatigue += 3;
              newEffects[racer.id] = { type: 'fish', emoji: '🐠', text: 'Cá quậy!' };
              const fishNaughtyComments = [
                'Ối! Cá cắn chân! Đau xíu! 🐠',
                'Cá nghịch ngợm quấn chân!',
                'Bị đàn cá làm rối!',
              ];
              if (isTop10) {
                setEvents(prev => [
                  ...prev.slice(-4),
                  { id: now, racerName: racer.shortName, color: racer.color, emoji: '🐠', text: 'CÁ QUẬY!', comment: fishNaughtyComments[Math.floor(Math.random() * fishNaughtyComments.length)], effect: 'slow' }
                ]);
              }
            }
          }
          
          // === CRAMP (rarer) ===
          if (isTop3 && currentPos > 55 && currentPos < 85 && Math.random() < 0.0008) {
            state.isStunned = true;
            state.stunnedUntil = now + 1500;
            state.fatigue += 25;
            const animal = ANIMAL_TYPES[animalType];
            newEffects[racer.id] = { type: 'cramp', emoji: '😵', text: 'Chuột rút!' };
            const crampComments = [
              'ÁI! Chuột rút chân! Đau quá! 😵',
              `${animal.moveVerb.charAt(0).toUpperCase() + animal.moveVerb.slice(1)} căng quá nên chuột rút rồi!`,
              `Chân co giật! Không ${animal.moveVerb} nổi!`,
              'Chuột rút! Phải dừng lại xoa bóp!',
              `${animal.name} quá sức! Chuột rút!`,
              'Ối ối! Cơ bắp co rút! Đau quá!',
            ];
            setEvents(prev => [
              ...prev.slice(-4),
              { id: now, racerName: racer.shortName, color: racer.color, emoji: '😵', text: 'CHUỘT RÚT!', comment: crampComments[Math.floor(Math.random() * crampComments.length)], effect: 'slow' }
            ]);
            playSound('event');
            return;
          }
          
          // Update position
          newPositions[racer.id] = Math.min(100, currentPos + speed);
          
          // Show fatigue effect
          if (state.fatigue > 30 && !newEffects[racer.id]) {
            newEffects[racer.id] = { type: 'fatigued', emoji: '💦' };
          }
          
          // Check winner
          if (newPositions[racer.id] >= 100 && !raceFinished) {
            raceFinished = true;
            setWinner(racer);
            setIsRacing(false);
            stopBgMusic(); // Stop background music
            showCommentary('final', racer.name);
            playSound('win');
          }
        });
        
        // Update effects
        setRacerEffects(prev => ({ ...prev, ...newEffects }));
        
        return newPositions;
      });
      
      // Update vertical wobble for swimming effect - smoother
      if (frameCount % 3 === 0) {
        setVerticalPos(prev => {
          const newV = { ...prev };
          racers.forEach(r => {
            const state = racerStatesRef.current[r.id];
            if (state && !state.isStunned) {
              state.wobble += 0.08;
              newV[r.id] = prev[r.id] + Math.sin(state.wobble) * 0.25;
            }
          });
          return newV;
        });
      }
      
      if (!raceFinished) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [racers, verticalPos, checkObstacleCollision, playSound, showCommentary]);

  // Reset race
  const resetRace = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    stopBgMusic(); // Stop background music
    
    setIsRacing(false);
    setWinner(null);
    setTopRacers([]);
    setEvents([]);
    setCountdown(null);
    setRaceTime(0);
    setCommentary('');
    setLastLeader(null);
    
    const resetPos = {};
    const resetVertical = {};
    const resetEffects = {};
    const totalRacers = racers.length;
    
    racers.forEach((r, i) => {
      resetPos[r.id] = 0;
      // Smart vertical distribution - USE FULL RIVER WIDTH (5%-95%)
      if (totalRacers <= 10) {
        resetVertical[r.id] = 5 + (i * 90 / Math.max(totalRacers - 1, 1));
      } else if (totalRacers <= 30) {
        const row = i % totalRacers;
        resetVertical[r.id] = 5 + (row * 90 / Math.max(totalRacers - 1, 1));
      } else if (totalRacers <= 50) {
        const row = i % 20;
        const col = Math.floor(i / 20);
        const jitter = col * 2;
        resetVertical[r.id] = 5 + row * 4.5 + jitter;
      } else {
        const row = i % 25;
        const col = Math.floor(i / 25);
        const jitter = col * 1.5;
        resetVertical[r.id] = 5 + row * 3.6 + jitter;
      }
      resetEffects[r.id] = null;
    });
    setPositions(resetPos);
    setVerticalPos(resetVertical);
    setRacerEffects(resetEffects);
  }, [racers]);

  // Screen state: 'setup' or 'racing'
  const [screen, setScreen] = useState('setup');
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Start race and switch to racing screen
  const handleStartRace = useCallback(() => {
    if (racers.length < 2) return;
    setScreen('racing');
    // Auto fullscreen when entering race
    setTimeout(() => {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      startRace();
    }, 300);
  }, [racers.length, startRace]);

  // Back to setup
  const backToSetup = useCallback(() => {
    resetRace();
    setScreen('setup');
    // Exit fullscreen when going back
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [resetRace]);

  // ============ SETUP SCREEN ============
  if (screen === 'setup') {
    // Ensure not in fullscreen when on setup screen
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    const currentAnimal = ANIMAL_TYPES[animalType];
    return (
      <ToolLayout toolName="Đua Thú Hoạt Hình" toolIcon="🏁" hideFullscreenButton>
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-8xl mb-4 animate-bounce" style={{ 
                transform: currentAnimal.flipX ? 'scaleX(-1)' : 'none' 
              }}>
                {currentAnimal.emoji}
              </div>
              <h1 className="text-4xl font-black text-gray-800 mb-2">ĐUA THÚ HOẠT HÌNH</h1>
              <p className="text-gray-500 text-lg">Nhập tên các {currentAnimal.plural} đua và bắt đầu cuộc đua hồi hộp!</p>
            </div>

            {/* Input Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📝</span>
                  <div>
                    <h2 className="font-bold text-gray-800 text-xl">Danh sách tham gia</h2>
                    <p className="text-gray-500 text-sm">Mỗi dòng 1 tên, tối đa 200 {currentAnimal.plural}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold
                  ${racers.length >= 200 ? 'bg-red-100 text-red-600' : 
                    racers.length >= 100 ? 'bg-orange-100 text-orange-600' : 
                    racers.length >= 50 ? 'bg-yellow-100 text-yellow-600' : 
                    'bg-green-100 text-green-600'}`}>
                  {racers.length}/200
                </div>
              </div>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Minh&#10;Lan&#10;Hùng&#10;Mai&#10;Tùng&#10;..."
                className="w-full h-48 p-4 border-2 border-gray-200 rounded-2xl text-lg
                  focus:border-blue-400 focus:ring-4 focus:ring-blue-100 
                  transition-all resize-none font-mono bg-gray-50"
                autoFocus
              />
              
              {/* Duplicate Names Warning */}
              {duplicateNames.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-1">
                    <span>⚠️</span>
                    <span>Có tên bị trùng!</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {duplicateNames.map((dup, idx) => (
                      <span key={idx} className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                        "{dup.name}" × {dup.count}
                      </span>
                    ))}
                  </div>
                  <p className="text-amber-600 text-xs mt-2">
                    💡 Vẫn có thể đua nhưng khó phân biệt. Nên đổi tên để dễ theo dõi!
                  </p>
                </div>
              )}

              {/* Racer Count Warning for Many Racers */}
              {racers.length >= 100 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700 font-medium text-sm">
                    <span>{ANIMAL_TYPES[animalType].emoji}</span>
                    <span>
                      {racers.length >= 150 ? `Siêu đông! ${ANIMAL_TYPES[animalType].name} sẽ hiển thị rất nhỏ.` :
                       racers.length >= 100 ? `Rất đông! ${ANIMAL_TYPES[animalType].name} sẽ hiển thị nhỏ.` : ''}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Racer Preview */}
              <div className="mt-4 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {racers.slice(0, 40).map((racer, idx) => (
                  <span 
                    key={racer.id}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white
                      ${duplicateNames.some(d => d.name === racer.name) ? 'ring-2 ring-amber-400' : ''}`}
                    style={{ backgroundColor: racer.color }}
                  >
                    <span style={{ transform: ANIMAL_TYPES[animalType].flipX ? 'scaleX(-1)' : 'none', display: 'inline-block' }}>
                      {ANIMAL_TYPES[animalType].emoji}
                    </span>
                    {racer.name}
                  </span>
                ))}
                {racers.length > 40 && (
                  <span className="text-gray-500 text-sm">+{racers.length - 40} {ANIMAL_TYPES[animalType].plural} nữa...</span>
                )}
              </div>

              {/* Speed Selector - 5 levels */}
              <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">⏱️</span>
                  <span className="font-bold text-gray-700">Tốc độ cuộc đua:</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 'very-slow', label: '🐌', name: 'Rất chậm', desc: 'Chầm rãi, tập dượt' },
                    { value: 'slow', label: '🐢', name: 'Chậm', desc: 'Kéo dài, hồi hộp' },
                    { value: 'normal', label: '🦆', name: 'Vừa', desc: 'Cân bằng' },
                    { value: 'fast', label: '🚀', name: 'Nhanh', desc: 'Gay cấn' },
                    { value: 'very-fast', label: '⚡', name: 'Turbo', desc: 'Siêu tốc!' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setRaceSpeed(option.value)}
                      className={`py-2 px-2 min-h-[60px] rounded-xl font-medium transition-all text-center
                        ${raceSpeed === option.value 
                          ? 'bg-blue-500 text-white shadow-lg scale-105' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                    >
                      <div className="text-2xl">{option.label}</div>
                      <div className="text-xs font-bold">{option.name}</div>
                      <div className="text-[10px] opacity-75 hidden sm:block">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Animal Type Selector */}
              <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">🐾</span>
                  <span className="font-bold text-gray-700">Chọn loài vật đua:</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(ANIMAL_TYPES).map(([key, animal]) => (
                    <button
                      key={key}
                      onClick={() => setAnimalType(key)}
                      className={`py-3 px-2 rounded-xl font-medium transition-all text-center
                        ${animalType === key 
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg scale-105 ring-2 ring-amber-300' 
                          : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-200'}`}
                    >
                      <div className="text-3xl mb-1">{animal.emoji}</div>
                      <div className="text-xs font-bold">{animal.name}</div>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-center text-amber-700 text-sm">
                  {ANIMAL_TYPES[animalType].sound} - {ANIMAL_TYPES[animalType].name} sẽ {ANIMAL_TYPES[animalType].action} trên {ANIMAL_TYPES[animalType].habitat}!
                </p>
              </div>

              {/* Controls */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`px-4 py-2 min-h-[44px] rounded-xl text-sm font-medium transition-all
                      ${soundEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {soundEnabled ? '🔊 Âm thanh BẬT' : '🔇 Âm thanh TẮT'}
                  </button>
                  
                  <span className={`text-lg font-bold ${racers.length >= 2 ? 'text-green-600' : 'text-orange-500'}`}>
                    {ANIMAL_TYPES[animalType].emoji} {racers.length} {ANIMAL_TYPES[animalType].plural}
                  </span>
                </div>

                <button
                  onClick={handleStartRace}
                  disabled={racers.length < 2}
                  className={`px-8 py-4 min-h-[56px] font-black rounded-2xl text-xl transition-all
                    ${racers.length < 2
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl hover:scale-105 active:scale-95'
                    }`}
                >
                  🚀 BẮT ĐẦU ĐUA!
                </button>
              </div>

              {racers.length < 2 && (
                <p className="mt-4 text-center text-orange-500 font-medium">
                  ⚠️ Cần ít nhất 2 {ANIMAL_TYPES[animalType].plural} để bắt đầu cuộc đua
                </p>
              )}
            </div>

            {/* Tips */}
            <div className="mt-6 bg-blue-50 rounded-2xl p-4 text-center">
              <p className="text-blue-700 text-sm">
                💡 <strong>Mẹo:</strong> {ANIMAL_TYPES[animalType].name} có thể đụng vật cản (🪨 đá, 🪵 gỗ), bị mệt khi dẫn đầu, hoặc bị chuột rút! Có bình luận viên đưa tin trực tiếp!
              </p>
            </div>
          </div>
        </div>
      </ToolLayout>
    );
  }

  // ============ RACING SCREEN - FULLSCREEN ============
  // State to track orientation
  const [isPortrait, setIsPortrait] = useState(false);

  // Check orientation on mount and resize
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    // Try to lock to landscape on mobile
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {
        // Orientation lock not supported or denied
      });
    }
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      // Unlock orientation when leaving
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black">
      {/* Portrait Mode Warning Overlay */}
      {isPortrait && (
        <div className="absolute inset-0 z-[100] bg-gradient-to-br from-blue-600 to-purple-700 
          flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="text-8xl mb-6 animate-bounce">📱</div>
          <div className="text-6xl mb-4 animate-spin-slow">🔄</div>
          <h2 className="text-2xl font-black mb-3">Xoay ngang màn hình!</h2>
          <p className="text-lg opacity-90 mb-4">
            Để xem cuộc đua tốt nhất, vui lòng xoay điện thoại ngang
          </p>
          <div className="flex items-center gap-2 text-yellow-300">
            <span className="text-2xl">👉</span>
            <span className="font-bold">Landscape Mode</span>
            <span className="text-2xl">👈</span>
          </div>
          <button
            onClick={backToSetup}
            className="mt-8 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full 
              font-bold transition-all"
          >
            ← Quay lại cài đặt
          </button>
        </div>
      )}

      {/* FULLSCREEN RIVER RACE */}
      <div className="relative w-full h-full overflow-hidden">
        
        {/* River background - realistic water gradient */}
        <div className="absolute inset-0" style={{
          background: `
            linear-gradient(180deg, 
              #87CEEB 0%, 
              #5DADE2 5%,
              #3498DB 15%, 
              #2E86AB 30%, 
              #1A5276 50%, 
              #2E86AB 70%, 
              #3498DB 85%,
              #5DADE2 95%,
              #87CEEB 100%
            )`
        }} />
        
        {/* Water surface shine */}
        <div className="absolute inset-0 opacity-30" style={{
          background: `
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 100px,
              rgba(255,255,255,0.1) 100px,
              rgba(255,255,255,0.2) 150px,
              rgba(255,255,255,0.1) 200px,
              transparent 200px
            )`
        }} />
        
        {/* Soft organic waves - layer 1 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute w-[200%] h-full" style={{ animation: 'wave-drift 15s ease-in-out infinite' }}>
            <defs>
              <pattern id="wave1" x="0" y="0" width="200" height="20" patternUnits="userSpaceOnUse">
                <path d="M0,10 Q25,5 50,10 T100,10 T150,10 T200,10" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none"/>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#wave1)" />
          </svg>
        </div>
        
        {/* Soft organic waves - layer 2 (offset) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute w-[200%] h-full" style={{ animation: 'wave-drift-reverse 20s ease-in-out infinite', opacity: 0.7 }}>
            <defs>
              <pattern id="wave2" x="0" y="0" width="150" height="25" patternUnits="userSpaceOnUse">
                <path d="M0,12 Q20,6 40,12 T80,12 T120,12 T150,12" stroke="rgba(173,216,230,0.15)" strokeWidth="1.5" fill="none"/>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#wave2)" />
          </svg>
        </div>
        
        {/* Subtle shimmer effect */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          background: 'radial-gradient(ellipse 100px 30px at 30% 40%, rgba(255,255,255,0.8) 0%, transparent 70%)',
          animation: 'shimmer-move 8s ease-in-out infinite',
        }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          background: 'radial-gradient(ellipse 80px 25px at 70% 60%, rgba(255,255,255,0.8) 0%, transparent 70%)',
          animation: 'shimmer-move 10s ease-in-out infinite reverse',
        }} />
        
        {/* Water ripples/bubbles - fewer and subtler */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={`ripple-${i}`}
              className="absolute rounded-full border border-white/10"
              style={{
                width: `${30 + Math.random() * 30}px`,
                height: `${15 + Math.random() * 15}px`,
                left: `${10 + i * 15}%`,
                top: `${20 + Math.random() * 60}%`,
                animation: `float-ripple ${5 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
        </div>
        
        {/* Sunlight reflection on water */}
        <div className="absolute top-12 left-0 right-0 h-8 opacity-20" style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)'
        }} />
        
        {/* River banks - Top with grass and sand */}
        <div className="absolute top-0 left-0 right-0 h-14 z-10" style={{
          background: 'linear-gradient(180deg, #2D5016 0%, #3D6B22 30%, #4A7C2A 50%, #8B7355 70%, #C4A77D 85%, #5DADE2 100%)'
        }}>
          {/* Grass layer */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-around items-end">
            {[...Array(40)].map((_, i) => (
              <span key={i} className="text-base" style={{ 
                opacity: 0.7 + Math.random() * 0.3,
                transform: `translateY(${Math.random() * 4}px) rotate(${-5 + Math.random() * 10}deg)`
              }}>
                {['🌿', '🌱', '🍃', '🌾'][i % 4]}
              </span>
            ))}
          </div>
          {/* Sand/mud edge */}
          <div className="absolute bottom-0 left-0 right-0 h-3" style={{
            background: 'linear-gradient(180deg, #C4A77D 0%, #A08060 50%, transparent 100%)'
          }} />
        </div>
        
        {/* River banks - Bottom with grass and sand */}
        <div className="absolute bottom-0 left-0 right-0 h-14 z-10" style={{
          background: 'linear-gradient(0deg, #2D5016 0%, #3D6B22 30%, #4A7C2A 50%, #8B7355 70%, #C4A77D 85%, #5DADE2 100%)'
        }}>
          {/* Grass layer */}
          <div className="absolute top-4 left-0 right-0 flex justify-around items-start">
            {[...Array(40)].map((_, i) => (
              <span key={i} className="text-base" style={{ 
                opacity: 0.7 + Math.random() * 0.3,
                transform: `translateY(${-Math.random() * 4}px) rotate(${-5 + Math.random() * 10}deg) scaleY(-1)`
              }}>
                {['🌿', '🌱', '🍃', '🌾'][i % 4]}
              </span>
            ))}
          </div>
          {/* Sand/mud edge */}
          <div className="absolute top-0 left-0 right-0 h-3" style={{
            background: 'linear-gradient(0deg, #C4A77D 0%, #A08060 50%, transparent 100%)'
          }} />
        </div>
        
        {/* Start area */}
        <div className="absolute left-0 top-12 bottom-12 w-20 bg-gradient-to-r from-green-200/40 to-transparent z-5" />
        <div className="absolute left-16 top-12 bottom-12 w-1 bg-white/60 z-15" />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
          <div className="text-white font-black text-sm transform -rotate-90 whitespace-nowrap">
            XUẤT PHÁT
          </div>
        </div>
        
        {/* Finish line */}
        <div className="absolute right-0 top-12 bottom-12 w-20 bg-gradient-to-l from-yellow-200/40 to-transparent z-5" />
        <div className="absolute right-16 top-12 bottom-12 w-3 z-15 overflow-hidden">
          <div className="w-full h-full" style={{
            background: 'repeating-linear-gradient(0deg, white 0px, white 15px, #222 15px, #222 30px)'
          }} />
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl z-20 animate-pulse">🏆</div>

        {/* OBSTACLES */}
        {OBSTACLES.map(obs => (
          <div
            key={obs.id}
            className="absolute z-15"
            style={{
              left: `${obs.x}%`,
              top: `${obs.y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: obs.size === 'large' ? '3rem' : obs.size === 'medium' ? '2.5rem' : '2rem',
              filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))',
            }}
          >
            {obs.emoji}
          </div>
        ))}

        {/* Back button */}
        <button
          onClick={backToSetup}
          className="absolute top-4 left-4 z-30 px-4 py-2 bg-black/50 hover:bg-black/70 
            text-white rounded-full font-bold text-sm transition-all flex items-center gap-2"
        >
          ← Quay lại
        </button>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-4 left-32 z-30 px-3 py-2 bg-black/50 hover:bg-black/70 
            text-white rounded-full font-bold text-sm transition-all"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 left-48 z-30 px-3 py-2 bg-black/50 hover:bg-black/70 
            text-white rounded-full font-bold text-sm transition-all"
          title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
        >
          {isFullscreen ? '⛶' : '⛶'}
        </button>

        {/* Commentary Box */}
        {commentary && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 animate-slideDown">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 
              text-white px-6 py-3 rounded-2xl font-bold text-lg shadow-2xl
              border-2 border-white/50 max-w-xl text-center">
              {commentary}
            </div>
          </div>
        )}

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60">
            <div className={`text-[15rem] font-black drop-shadow-2xl
              ${countdown === 'GO!' ? 'text-yellow-300 animate-bounce' : 'text-white animate-pulse'}`}>
              {countdown}
            </div>
          </div>
        )}

        {/* Race info - Top center */}
        {(isRacing || winner) && !countdown && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-25
            bg-black/70 text-white px-8 py-3 rounded-full font-bold text-2xl">
            ⏱️ {raceTime}s | {ANIMAL_TYPES[animalType].emoji} {racers.length} {ANIMAL_TYPES[animalType].plural}
          </div>
        )}

        {/* TOP 5 Leaderboard - positioned below top bar */}
        {isRacing && topRacers.length > 0 && !countdown && (
          <div className="absolute top-16 right-4 z-25 bg-white/95 rounded-2xl p-3 shadow-2xl min-w-32">
            <div className="text-sm font-black text-gray-700 mb-2 border-b pb-1">🏆 TOP 5</div>
            {topRacers.slice(0, 5).map((racer, idx) => (
              <div key={racer.id} className="flex items-center gap-2 text-sm py-0.5">
                <span className="font-black w-5 text-base" style={{ 
                  color: idx === 0 ? '#fbbf24' : idx === 1 ? '#9ca3af' : idx === 2 ? '#f97316' : '#6b7280' 
                }}>
                  {idx + 1}
                </span>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: racer.color }} />
                <span className="font-semibold">{racer.shortName}</span>
              </div>
            ))}
          </div>
        )}

        {/* Events Log - Left side panel with bigger, clearer display */}
        {events.length > 0 && (
          <div className="absolute top-16 left-4 z-25 w-56">
            <div className="bg-gradient-to-br from-red-600/95 to-orange-600/95 rounded-xl p-3 shadow-2xl border-2 border-yellow-400/50">
              <div className="text-sm font-black text-yellow-300 mb-2 flex items-center gap-2">
                <span className="text-lg animate-bounce">📢</span> ĐANG XẢY RA!
              </div>
              <div className="space-y-2">
                {events.slice(-3).map(event => (
                  <div 
                    key={event.id}
                    className="bg-black/40 rounded-lg p-2 border-l-4"
                    style={{ borderColor: event.color }}
                  >
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-2xl">{event.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{event.racerName}</div>
                        <div className="text-yellow-300 text-xs">{event.text}</div>
                        {event.comment && (
                          <div className="text-white/80 text-[10px] italic mt-0.5">"{event.comment}"</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ALL DUCKS */}
        <div className="absolute inset-0" style={{ top: '48px', bottom: '48px', left: '80px', right: '80px' }}>
          {racers.map((racer) => {
            const position = positions[racer.id] || 0;
            const vPos = verticalPos[racer.id] || 50;
            const effect = racerEffects[racer.id];
            const isWinnerRacer = winner?.id === racer.id;
            const isTop5 = topRacers.slice(0, 5).some(r => r.id === racer.id);
            const isTop10 = topRacers.slice(0, 10).some(r => r.id === racer.id);
            const state = racerStatesRef.current[racer.id];
            const isStunned = state?.isStunned;
            
            // Duck size - MINIMUM 1.8rem so always visible even from distance
            const totalCount = racers.length;
            let duckSize, bandWidth, bandHeight, showEffect, showTrail, showName;
            
            if (totalCount > 150) {
              // 150-200: Still clearly visible
              duckSize = '1.8rem';
              bandWidth = '6px';
              bandHeight = '3px';
              showEffect = isTop5;
              showTrail = false;
              showName = isTop10; // Only show names for top 10
            } else if (totalCount > 100) {
              // 100-150: Good size
              duckSize = '2rem';
              bandWidth = '7px';
              bandHeight = '3px';
              showEffect = isTop10;
              showTrail = false;
              showName = isTop10;
            } else if (totalCount > 50) {
              // 50-100: Medium-large
              duckSize = '2.2rem';
              bandWidth = '8px';
              bandHeight = '4px';
              showEffect = isTop10;
              showTrail = isTop5;
              showName = true;
            } else if (totalCount > 20) {
              // 20-50: Large
              duckSize = '2.5rem';
              bandWidth = '10px';
              bandHeight = '5px';
              showEffect = true;
              showTrail = isTop10;
              showName = true;
            } else {
              // 1-20: Extra large
              duckSize = '3rem';
              bandWidth = '14px';
              bandHeight = '6px';
              showEffect = true;
              showTrail = true;
              showName = true;
            }
            
            // Show name tag based on count - only for some ducks when many
            const nameSize = totalCount > 100 ? 'text-[8px]' : totalCount > 50 ? 'text-[9px]' : totalCount > 20 ? 'text-[10px]' : 'text-xs';
            const namePadding = totalCount > 100 ? 'px-1 py-0' : totalCount > 50 ? 'px-1.5 py-0.5' : 'px-2 py-0.5';
            const nameTop = totalCount > 100 ? '-top-5' : totalCount > 50 ? '-top-6' : '-top-7';
            // Use shortName for cleaner display during race
            const displayName = racer.shortName;
            
            return (
              <div
                key={racer.id}
                className="absolute"
                style={{
                  left: `${Math.min(position, 98)}%`,
                  top: `${vPos}%`,
                  transform: 'translate(-50%, -50%)',
                  transition: isRacing && !winner && !isStunned ? 'none' : 'all 0.3s ease',
                  zIndex: isWinnerRacer ? 100 : isTop5 ? 50 : 10 + Math.floor(position),
                }}
              >
                <div className={`relative 
                  ${isRacing && !winner && !isStunned ? 'animate-duck-swim' : ''} 
                  ${isWinnerRacer ? 'animate-bounce scale-150' : ''}
                  ${isStunned ? 'animate-stunned' : ''}`}
                >
                  {/* Effect indicator - only show for top racers when many */}
                  {effect && showEffect && (
                    <div className={`absolute left-1/2 -translate-x-1/2 animate-bounce whitespace-nowrap
                      ${totalCount > 100 ? '-top-4 text-sm' : '-top-6 text-xl'}`}>
                      {effect.emoji}
                    </div>
                  )}
                  
                  {/* Animal - facing right toward finish line */}
                  <div 
                    className="filter drop-shadow-lg"
                    style={{ 
                      fontSize: duckSize,
                      opacity: isStunned ? 0.6 : 1,
                      transform: ANIMAL_TYPES[animalType].flipX ? 'scaleX(-1)' : 'none',
                    }}
                  >
                    {ANIMAL_TYPES[animalType].emoji}
                  </div>
                  
                  {/* Color band */}
                  <div 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full shadow"
                    style={{ 
                      backgroundColor: racer.color,
                      width: bandWidth,
                      height: bandHeight,
                    }}
                  />
                  
                  {/* Name tag - conditional based on showName */}
                  {showName && (
                    <div 
                      className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-bold rounded shadow-lg
                        ${nameTop} ${nameSize} ${namePadding}`}
                      style={{ 
                        backgroundColor: racer.color,
                        color: 'white',
                      }}
                    >
                      {displayName}
                    </div>
                  )}
                  
                  {/* Swimming trail - conditional */}
                  {isRacing && !winner && !isStunned && position > 5 && showTrail && (
                    <div className={`absolute left-full top-1/2 -translate-y-1/2 ml-1 opacity-40 animate-trail
                      ${totalCount > 50 ? 'text-xs' : 'text-base'}`}>
                      ~
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Winner celebration */}
        {winner && (
          <div className="absolute inset-0 z-35 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute text-3xl animate-float-up"
                style={{
                  left: `${5 + Math.random() * 90}%`,
                  bottom: '-50px',
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                {['🎉', '🎊', '⭐', '✨', '🌟', '🎆'][i % 6]}
              </div>
            ))}
          </div>
        )}

        {/* Winner Modal - Full overlay with highest z-index */}
        {winner && (
          <div 
            className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-lg"
            style={{ zIndex: 9999 }}
          >
            {/* Fireworks explosions */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div
                  key={`firework-${i}`}
                  className="absolute animate-firework"
                  style={{
                    left: `${10 + (i % 4) * 25}%`,
                    top: `${15 + Math.floor(i / 4) * 30}%`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                >
                  {[...Array(12)].map((_, j) => (
                    <div
                      key={j}
                      className="absolute w-2 h-2 rounded-full animate-firework-particle"
                      style={{
                        backgroundColor: ['#ff0000', '#ffd700', '#00ff00', '#00bfff', '#ff00ff', '#ff8c00'][j % 6],
                        transform: `rotate(${j * 30}deg) translateY(-30px)`,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Flower/Confetti rain */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(40)].map((_, i) => (
                <div
                  key={`flower-${i}`}
                  className="absolute text-2xl animate-flower-fall"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-50px',
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                >
                  {['🌸', '🌺', '🌼', '🌻', '💐', '🎀', '🎊', '🎉', '✨', '⭐'][i % 10]}
                </div>
              ))}
            </div>

            {/* Sparkle bursts */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={`sparkle-${i}`}
                  className="absolute text-4xl animate-sparkle-burst"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                >
                  ✨
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center animate-bounceIn relative overflow-hidden">
              
              {/* Confetti inside card */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 animate-confetti-pop"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      backgroundColor: DUCK_COLORS[i % DUCK_COLORS.length],
                      borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '0' : '50% 0',
                      animationDelay: `${Math.random() * 0.5}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                <div className="text-6xl mb-1 animate-bounce" style={{ 
                  transform: ANIMAL_TYPES[animalType].flipX ? 'scaleX(-1)' : 'none' 
                }}>
                  {ANIMAL_TYPES[animalType].emoji}
                </div>
                <div className="text-4xl mb-2 animate-pulse">🏆</div>
                
                <h2 className="text-3xl font-black text-gray-800 mb-2 animate-pulse">🎉 VÔ ĐỊCH! 🎉</h2>
                
                <div className="inline-block px-5 py-2 rounded-full text-xl font-bold text-white mb-3 animate-bounce"
                  style={{ backgroundColor: winner.color, boxShadow: `0 0 20px ${winner.color}` }}>
                  {winner.name}
                </div>
                
                {/* TOP 5 Final Results with FULL names */}
                {topRacers.length > 1 && (
                  <div className="bg-gray-100 rounded-xl p-2 mb-3 text-left max-h-32 overflow-y-auto">
                    <div className="text-xs font-bold text-gray-600 mb-1 text-center">🏅 Bảng xếp hạng</div>
                    {topRacers.slice(0, 5).map((racer, idx) => (
                      <div key={racer.id} className="flex items-center gap-1.5 py-0.5 text-xs">
                        <span className="font-black w-5" style={{ 
                          color: idx === 0 ? '#fbbf24' : idx === 1 ? '#9ca3af' : idx === 2 ? '#f97316' : '#6b7280' 
                        }}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: racer.color }} />
                        <span className="font-medium text-gray-700 truncate text-xs">{racer.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-gray-500 mb-3 text-sm">
                  ⏱️ {raceTime}s | {ANIMAL_TYPES[animalType].emoji} {racers.length} {ANIMAL_TYPES[animalType].plural}
                </div>

                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={backToSetup}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full text-sm transition-all">
                    ← Setup
                  </button>
                  <button 
                    onClick={() => { resetRace(); setTimeout(() => startRace(), 100); }}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full text-sm hover:shadow-xl transition-all">
                    🚀 Đua lại!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes duck-swim {
          0%, 100% { transform: rotate(-2deg) translateY(0); }
          50% { transform: rotate(2deg) translateY(-4px); }
        }
        .animate-duck-swim { animation: duck-swim 0.35s ease-in-out infinite; }
        
        @keyframes wave-drift {
          0% { transform: translateX(0); }
          50% { transform: translateX(-100px); }
          100% { transform: translateX(0); }
        }
        
        @keyframes wave-drift-reverse {
          0% { transform: translateX(-50px); }
          50% { transform: translateX(50px); }
          100% { transform: translateX(-50px); }
        }
        
        @keyframes shimmer-move {
          0%, 100% { transform: translateX(0) translateY(0); opacity: 0.03; }
          50% { transform: translateX(100px) translateY(10px); opacity: 0.06; }
        }
        
        @keyframes water-flow {
          0% { background-position-x: 0; }
          100% { background-position-x: 300px; }
        }
        .animate-water-flow { animation: water-flow 10s linear infinite; }
        
        @keyframes trail {
          0% { opacity: 0.4; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(12px); }
        }
        .animate-trail { animation: trail 0.25s ease-out infinite; }
        
        @keyframes stunned {
          0%, 100% { transform: rotate(-12deg); }
          50% { transform: rotate(12deg); }
        }
        .animate-stunned { animation: stunned 0.15s ease-in-out infinite; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        
        @keyframes float-up {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-500px) rotate(360deg); opacity: 0; }
        }
        .animate-float-up { animation: float-up 3s ease-out forwards; }
        
        @keyframes float-ripple {
          0%, 100% { transform: translateX(0) scale(1); opacity: 0.15; }
          50% { transform: translateX(15px) scale(1.1); opacity: 0.25; }
        }
        
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti 2s ease-out forwards; }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounceIn { animation: bounceIn 0.5s ease-out; }
        
        @keyframes slideDown {
          0% { transform: translateX(-50%) translateY(-30px); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        .animate-slideDown { animation: slideDown 0.4s ease-out; }
        
        @keyframes firework {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-firework { animation: firework 1.5s ease-out infinite; }
        
        @keyframes firework-particle {
          0% { transform: rotate(var(--rotation, 0deg)) translateY(0) scale(1); opacity: 1; }
          100% { transform: rotate(var(--rotation, 0deg)) translateY(-80px) scale(0); opacity: 0; }
        }
        .animate-firework-particle { animation: firework-particle 1.5s ease-out infinite; }
        
        @keyframes flower-fall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          50% { transform: translateY(50vh) rotate(180deg) scale(1.2); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg) scale(0.8); opacity: 0; }
        }
        .animate-flower-fall { animation: flower-fall 4s ease-in-out infinite; }
        
        @keyframes sparkle-burst {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        .animate-sparkle-burst { animation: sparkle-burst 1.5s ease-out infinite; }
        
        @keyframes confetti-pop {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
          100% { transform: scale(0) rotate(360deg) translateY(50px); opacity: 0; }
        }
        .animate-confetti-pop { animation: confetti-pop 1.5s ease-out infinite; }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>
    </div>
  );
}
