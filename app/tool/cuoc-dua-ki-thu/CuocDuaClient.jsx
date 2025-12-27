'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout/ToolLayout';

// ==================== CONSTANTS ====================
const STORAGE_KEYS = {
  MODE: 'race_mode',
  RACERS: 'race_racers',
  CHAR_TYPE: 'race_char_type',
  HISTORY: 'race_history',
  GROUPS: 'race_groups',
  NUM_GROUPS: 'race_num_groups',
};

// Mở rộng icons cho 50+ học sinh
const EXTENDED_ICONS = ['🌟', '⭐', '💫', '✨', '🔥', '💎', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤', '🎸', '🎺', '🎻', '🥁', '🎮', '🎲', '🎰', '🎳', '⚽', '🏀', '🏈', '🎾', '⚾', '🥎', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🥋', '⛳', '🏹', '🎣', '🛷', '🎿', '⛸️', '🏂'];

// Màu mở rộng cho 50+ học sinh  
const EXTENDED_COLORS = [
  'from-red-500 to-rose-600', 'from-blue-500 to-indigo-600', 'from-green-500 to-emerald-600',
  'from-yellow-500 to-amber-600', 'from-purple-500 to-violet-600', 'from-pink-500 to-rose-600',
  'from-cyan-500 to-teal-600', 'from-orange-500 to-red-600', 'from-indigo-500 to-purple-600',
  'from-emerald-500 to-green-600', 'from-amber-500 to-yellow-600', 'from-fuchsia-500 to-pink-600',
  'from-lime-500 to-green-600', 'from-sky-500 to-blue-600', 'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600', 'from-teal-500 to-cyan-600', 'from-slate-500 to-gray-600',
  'from-red-600 to-orange-600', 'from-blue-600 to-cyan-600', 'from-green-600 to-lime-600',
  'from-yellow-600 to-orange-600', 'from-purple-600 to-pink-600', 'from-pink-600 to-red-600',
  'from-cyan-600 to-blue-600', 'from-orange-600 to-yellow-600', 'from-indigo-600 to-violet-600',
  'from-emerald-600 to-teal-600', 'from-amber-600 to-orange-600', 'from-fuchsia-600 to-purple-600',
];

// Nhân vật theo loại
const CHARACTER_TYPES = {
  cars: {
    name: '🚗 Xe cộ',
    icons: ['🚗', '🚙', '🚕', '🚌', '🏎️', '🚓', '🚑', '🚒', '🛻', '🚐', '🏍️', '🚲'],
    colors: [
      'from-red-500 to-rose-600',
      'from-blue-500 to-indigo-600',
      'from-green-500 to-emerald-600',
      'from-yellow-500 to-amber-600',
      'from-purple-500 to-violet-600',
      'from-pink-500 to-rose-600',
      'from-cyan-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-indigo-500 to-purple-600',
      'from-emerald-500 to-green-600',
      'from-amber-500 to-yellow-600',
      'from-fuchsia-500 to-pink-600',
    ],
  },
  animals: {
    name: '🐎 Động vật',
    icons: ['🐎', '🦁', '🐅', '🦊', '🐰', '🐻', '🐼', '🦄', '🐲', '🦅', '🐬', '🦋'],
    colors: [
      'from-amber-600 to-yellow-600',
      'from-orange-500 to-amber-600',
      'from-yellow-500 to-orange-600',
      'from-orange-400 to-red-500',
      'from-gray-400 to-slate-500',
      'from-amber-700 to-yellow-700',
      'from-gray-800 to-gray-900',
      'from-pink-400 to-purple-500',
      'from-red-600 to-orange-600',
      'from-amber-500 to-orange-500',
      'from-blue-400 to-cyan-500',
      'from-purple-400 to-pink-500',
    ],
  },
  people: {
    name: '🧑 Người',
    icons: ['🏃', '🚴', '🏄', '⛷️', '🤸', '🧗', '🏋️', '🤾', '🏊', '🚣', '🧘', '🤺'],
    colors: [
      'from-blue-500 to-indigo-600',
      'from-green-500 to-teal-600',
      'from-cyan-500 to-blue-600',
      'from-sky-500 to-indigo-600',
      'from-pink-500 to-rose-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-violet-600',
      'from-yellow-500 to-orange-600',
      'from-teal-500 to-cyan-600',
      'from-indigo-500 to-blue-600',
      'from-violet-500 to-purple-600',
      'from-rose-500 to-pink-600',
    ],
  },
  rockets: {
    name: '🚀 Tàu vũ trụ',
    icons: ['🚀', '🛸', '🛩️', '✈️', '🚁', '🛰️', '🎈', '🪂', '🛫', '🛬', '⛵', '🚢'],
    colors: [
      'from-red-500 to-orange-600',
      'from-green-400 to-emerald-600',
      'from-blue-500 to-sky-600',
      'from-slate-500 to-gray-600',
      'from-yellow-500 to-amber-600',
      'from-purple-500 to-indigo-600',
      'from-pink-400 to-red-500',
      'from-orange-400 to-yellow-500',
      'from-cyan-500 to-blue-600',
      'from-teal-500 to-green-600',
      'from-indigo-500 to-violet-600',
      'from-rose-500 to-red-600',
    ],
  },
};

// ==================== MAIN COMPONENT ====================
export default function CuocDuaClient() {
  // State
  const [screen, setScreen] = useState('setup'); // 'setup' | 'race'
  const [mode, setMode] = useState('individual'); // 'team' | 'individual'
  const [namesText, setNamesText] = useState('');
  const [charType, setCharType] = useState('cars');
  const [racers, setRacers] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [history, setHistory] = useState([]);
  const [selectedRacer, setSelectedRacer] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Sort & Search state
  const [sortBy, setSortBy] = useState('id'); // 'score' | 'id' - Mặc định giữ thứ tự nhập
  const [searchText, setSearchText] = useState('');
  const [compactMode, setCompactMode] = useState(false);
  
  // NEW: Nhóm state
  const [groups, setGroups] = useState([]); // { id, name, color, memberIds: [] }
  const [numGroups, setNumGroups] = useState(4);
  const [showControls, setShowControls] = useState(true); // Ẩn/hiện thanh điều khiển
  const [viewMode, setViewMode] = useState('individual'); // 'individual' | 'group' - view khi đang đua
  
  // NEW: Control state  
  const [isLocked, setIsLocked] = useState(false); // Khóa điểm tạm thời
  const [showSummary, setShowSummary] = useState(false); // Màn tổng kết
  const [suggestedRacer, setSuggestedRacer] = useState(null); // Gợi ý học sinh tiếp theo
  const [isSpinning, setIsSpinning] = useState(false); // Animation quay ngẫu nhiên
  
  // NEW: Custom Dialog state
  const [dialogConfig, setDialogConfig] = useState(null); // { title, message, onConfirm, onCancel, type }

  const audioContextRef = useRef(null);
  const racerRefs = useRef({}); // Refs for each racer card
  const raceAreaRef = useRef(null); // Ref for race area container
  
  // Custom confirm dialog
  const showDialog = (title, message, onConfirm, type = 'confirm') => {
    setDialogConfig({ title, message, onConfirm, type });
  };
  
  const closeDialog = () => setDialogConfig(null);

  // ==================== LOAD/SAVE ====================
  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEYS.MODE);
    const savedRacers = localStorage.getItem(STORAGE_KEYS.RACERS);
    const savedCharType = localStorage.getItem(STORAGE_KEYS.CHAR_TYPE);
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);

    if (savedMode) setMode(savedMode);
    if (savedCharType) setCharType(savedCharType);
    if (savedRacers) {
      try {
        const parsed = JSON.parse(savedRacers);
        if (parsed.length > 0) {
          setRacers(parsed);
          setScreen('race');
        }
      } catch (e) {}
    }
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (racers.length > 0) {
      localStorage.setItem(STORAGE_KEYS.RACERS, JSON.stringify(racers));
    }
  }, [racers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAR_TYPE, charType);
  }, [charType]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  // ==================== AUDIO ====================
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      if (type === 'add') {
        // Âm tăng tốc động cơ - engine rev
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        
        osc.start(now);
        osc.stop(now + 0.25);
        
        // Thêm turbo whoosh
        const noise = ctx.createOscillator();
        const noiseGain = ctx.createGain();
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.type = 'triangle';
        noise.frequency.setValueAtTime(800, now);
        noise.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
        noiseGain.gain.setValueAtTime(0.1, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        noise.start(now);
        noise.stop(now + 0.15);
      } else if (type === 'subtract') {
        // Âm phanh xe - brake screech
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'overtake') {
        // Âm VƯỢT LÊN - Epic fanfare với crowd cheer feel
        // Bass impact
        const bass = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bass.connect(bassGain);
        bassGain.connect(ctx.destination);
        bass.type = 'sine';
        bass.frequency.setValueAtTime(80, now);
        bass.frequency.exponentialRampToValueAtTime(40, now + 0.2);
        bassGain.gain.setValueAtTime(0.4, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        bass.start(now);
        bass.stop(now + 0.25);
        
        // Victory fanfare arpeggio
        const notes = [523, 659, 784, 1047, 784, 1047, 1319];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'square';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.15, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.3);
          
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.3);
        });
        
        // Shimmer effect (crowd feeling)
        for (let i = 0; i < 3; i++) {
          const shimmer = ctx.createOscillator();
          const shimmerGain = ctx.createGain();
          shimmer.connect(shimmerGain);
          shimmerGain.connect(ctx.destination);
          shimmer.type = 'sine';
          shimmer.frequency.value = 2000 + i * 500;
          shimmerGain.gain.setValueAtTime(0.05, now + 0.3);
          shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          shimmer.start(now + 0.3);
          shimmer.stop(now + 0.6);
        }
      } else if (type === 'rankUp') {
        // Âm leo rank - tăng thứ hạng
        const frequencies = [400, 500, 600, 800];
        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.12, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.15);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.15);
        });
      } else if (type === 'rankDown') {
        // Âm tụt rank
        const frequencies = [600, 500, 400, 300];
        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.1, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.15);
        });
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      console.log('Audio error:', e);
    }
  }, [soundEnabled, getAudioContext]);

  // ==================== GAME LOGIC ====================
  const startRace = () => {
    let names = namesText
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    // Nếu không có tên, tạo mặc định theo numGroups
    if (names.length === 0) {
      names = Array.from({length: numGroups}, (_, i) => `Nhóm ${i + 1}`);
    }

    if (names.length < 2) {
      showDialog('⚠️ Chưa đủ người', 'Cần ít nhất 2 người/nhóm để bắt đầu cuộc đua!', null, 'alert');
      return;
    }

    if (names.length > 100) {
      showDialog('⚠️ Quá nhiều', 'Tối đa 100 người chơi!', null, 'alert');
      return;
    }

    const charData = CHARACTER_TYPES[charType];
    // Kết hợp icons gốc + mở rộng cho 50+ người
    const allIcons = [...charData.icons, ...EXTENDED_ICONS];
    const allColors = [...charData.colors, ...EXTENDED_COLORS];
    
    const newRacers = names.map((name, i) => ({
      id: i,
      name,
      score: 0,
      icon: allIcons[i % allIcons.length],
      color: allColors[i % allColors.length],
    }));

    setRacers(newRacers);
    setHistory([]);
    setSelectedRacer(null);
    setSuggestedRacer(null);
    setShowSummary(false);
    setViewMode('individual');
    setGroups([]);
    setScreen('race');
  };

  // Tự động chia nhóm
  const autoCreateGroups = (racerList) => {
    const groupCount = Math.min(numGroups, racerList.length);
    const groupColors = EXTENDED_COLORS.slice(0, groupCount);
    const groupIcons = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⚪', '🟤', '💜', '💚', '💙', '🧡', '💛', '🤍', '🖤', '❤️', '💗', '💖', '🩵', '🩷'];
    
    const newGroups = Array.from({ length: groupCount }, (_, i) => ({
      id: i,
      name: `Nhóm ${i + 1}`,
      color: groupColors[i],
      icon: groupIcons[i],
      memberIds: [],
    }));
    
    // Chia đều học sinh vào nhóm
    racerList.forEach((racer, i) => {
      const groupIndex = i % groupCount;
      newGroups[groupIndex].memberIds.push(racer.id);
    });
    
    setGroups(newGroups);
  };

  // Chuyển mode (cá nhân <-> nhóm) mà KHÔNG mất data
  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    
    if (newMode === 'team' && racers.length > 0) {
      autoCreateGroups(racers);
      setViewMode('group');
    } else {
      setViewMode('individual');
    }
  };

  // Tính điểm nhóm
  const getGroupScore = (group) => {
    return group.memberIds.reduce((sum, memberId) => {
      const racer = racers.find(r => r.id === memberId);
      return sum + (racer?.score || 0);
    }, 0);
  };

  // Scroll to a specific racer
  const scrollToRacer = useCallback((racerId) => {
    const racerEl = racerRefs.current[racerId];
    if (racerEl && raceAreaRef.current) {
      racerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Gợi ý học sinh tiếp theo (random chưa được gọi gần đây)
  const suggestNextRacer = () => {
    if (isSpinning || racers.length < 2) return;
    
    setIsSpinning(true);
    setSuggestedRacer(null);
    setSearchText(''); // Clear search when spinning
    
    // Determine final winner first
    const recentIds = history.slice(-5).map(h => h.racerId);
    const available = racers.filter(r => !recentIds.includes(r.id));
    const pool = available.length > 0 ? available : racers;
    const finalWinner = pool[Math.floor(Math.random() * pool.length)];
    
    // Spinning animation - cycle through racers (faster & more exciting)
    let spinCount = 0;
    const totalSpins = 8 + Math.floor(Math.random() * 8); // 8-15 spins - faster!
    let currentIndex = Math.floor(Math.random() * racers.length); // Start random
    
    const spin = () => {
      // Highlight current racer
      const currentRacer = racers[currentIndex];
      setSuggestedRacer(currentRacer.id);
      playSound('click');
      
      // Scroll to current racer during spin (only every few spins for performance)
      if (spinCount % 2 === 0) {
        scrollToRacer(currentRacer.id);
      }
      
      spinCount++;
      currentIndex = (currentIndex + 1) % racers.length;
      
      if (spinCount < totalSpins) {
        // Fast start, quick slowdown - exciting but quick!
        const baseDelay = 50;
        const slowdownFactor = Math.pow(spinCount / totalSpins, 1.5); // Less steep curve
        const delay = baseDelay + (slowdownFactor * 250); // 50ms -> 300ms
        setTimeout(spin, delay);
      } else {
        // Final selection!
        setSuggestedRacer(finalWinner.id);
        setSelectedRacer(finalWinner.id);
        playSound('overtake');
        setIsSpinning(false);
        
        // Scroll to winner
        setTimeout(() => scrollToRacer(finalWinner.id), 100);
        
        // Auto clear after 8s
        setTimeout(() => {
          if (suggestedRacer === finalWinner.id) {
            setSuggestedRacer(null);
          }
        }, 8000);
      }
    };
    
    spin();
  };

  const addScore = (racerId, points) => {
    if (isLocked) {
      playSound('click');
      return; // Đang khóa điểm
    }
    
    const racer = racers.find(r => r.id === racerId);
    if (!racer) return;

    const oldRank = getRank(racerId);
    
    setRacers(prev => prev.map(r => 
      r.id === racerId 
        ? { ...r, score: Math.max(0, r.score + points) }
        : r
    ));

    // Save to history
    setHistory(prev => [...prev, {
      racerId,
      racerName: racer.name,
      points,
      timestamp: Date.now(),
    }].slice(-100)); // Tăng history lên 100

    setLastAction({ racerId, points, timestamp: Date.now() });
    setSuggestedRacer(null);

    // Check overtake & rank changes
    setTimeout(() => {
      const newRank = getRank(racerId);
      if (points > 0) {
        playSound('add');
        // Vượt lên TOP 1 - Epic celebration
        if (newRank === 1 && oldRank > 1) {
          playSound('overtake');
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2500);
        } 
        // Vượt lên TOP 3
        else if (newRank <= 3 && newRank < oldRank) {
          playSound('rankUp');
        }
      } else {
        playSound('subtract');
        // Tụt hạng khỏi TOP 3
        if (oldRank <= 3 && newRank > oldRank) {
          playSound('rankDown');
        }
      }
    }, 50);
  };

  const getRank = (racerId) => {
    const sorted = [...racers].sort((a, b) => b.score - a.score);
    return sorted.findIndex(r => r.id === racerId) + 1;
  };

  const undo = () => {
    if (history.length === 0) return;
    
    const last = history[history.length - 1];
    setRacers(prev => prev.map(r =>
      r.id === last.racerId
        ? { ...r, score: Math.max(0, r.score - last.points) }
        : r
    ));
    setHistory(prev => prev.slice(0, -1));
    playSound('click');
  };

  const resetRace = () => {
    showDialog(
      '🔄 Reset điểm?',
      'Tất cả điểm sẽ về 0. Danh sách người chơi vẫn được giữ nguyên.',
      () => {
        setRacers(prev => prev.map(r => ({ ...r, score: 0 })));
        setHistory([]);
        setLastAction(null);
        setSuggestedRacer(null);
        setShowSummary(false);
        closeDialog();
      }
    );
  };

  const backToSetup = () => {
    const doBack = () => {
      setScreen('setup');
      setNamesText(racers.map(r => r.name).join('\n'));
      closeDialog();
    };
    
    if (racers.some(r => r.score > 0)) {
      showDialog(
        '⚙️ Quay lại cài đặt?',
        'Dữ liệu điểm số vẫn được lưu. Bạn có thể tiếp tục sau.',
        doBack
      );
    } else {
      doBack();
    }
  };

  const newRace = () => {
    showDialog(
      '🆕 Tạo cuộc đua mới?',
      'Tất cả dữ liệu hiện tại sẽ bị xóa và không thể khôi phục.',
      () => {
        setRacers([]);
        setGroups([]);
        setHistory([]);
        setNamesText('');
        setSelectedRacer(null);
        setSuggestedRacer(null);
        setShowSummary(false);
        localStorage.removeItem(STORAGE_KEYS.RACERS);
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
        localStorage.removeItem(STORAGE_KEYS.GROUPS);
        setScreen('setup');
        closeDialog();
      }
    );
  };

  // Kết thúc & hiển thị tổng kết
  const finishRace = () => {
    setShowSummary(true);
    playSound('overtake');
  };

  // Get sorted racers by score
  const sortedRacers = sortBy === 'score' 
    ? [...racers].sort((a, b) => b.score - a.score)
    : [...racers]; // Giữ nguyên thứ tự ID (thứ tự nhập)
  
  // Filter by search
  const filteredRacers = searchText.trim() 
    ? sortedRacers.filter(r => r.name.toLowerCase().includes(searchText.toLowerCase()))
    : sortedRacers;
    
  const maxScore = Math.max(...racers.map(r => r.score), 10);
  
  // Compact mode tự động khi > 12 người
  const effectiveCompact = compactMode || racers.length > 12;
  
  // Top 3 học sinh
  const top3 = [...racers].sort((a, b) => b.score - a.score).slice(0, 3);
  
  // Sorted groups by score
  const sortedGroups = [...groups].sort((a, b) => getGroupScore(b) - getGroupScore(a));
  const maxGroupScore = Math.max(...groups.map(g => getGroupScore(g)), 10);

  // ==================== RENDER ====================
  return (
    <ToolLayout>
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      
      {/* ==================== CUSTOM DIALOG ==================== */}
      {dialogConfig && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-bounce-in">
            <div className="text-center">
              <div className="text-4xl mb-3">{dialogConfig.type === 'alert' ? '💡' : '🤔'}</div>
              <h3 className="text-xl font-black text-gray-800 mb-2">{dialogConfig.title}</h3>
              <p className="text-gray-600 mb-6">{dialogConfig.message}</p>
              
              <div className="flex gap-3">
                {dialogConfig.type === 'confirm' && (
                  <button
                    onClick={closeDialog}
                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                  >
                    Hủy
                  </button>
                )}
                <button
                  onClick={() => {
                    if (dialogConfig.onConfirm) {
                      dialogConfig.onConfirm();
                    } else {
                      closeDialog();
                    }
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                    dialogConfig.type === 'alert' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-400 hover:to-indigo-400'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-400 hover:to-red-400'
                  }`}
                >
                  {dialogConfig.type === 'alert' ? 'Đã hiểu' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#ff0', '#f0f', '#0ff', '#f00', '#0f0', '#00f'][Math.floor(Math.random() * 6)],
                width: '10px',
                height: '10px',
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}

      {/* ==================== SETUP SCREEN ==================== */}
      {screen === 'setup' && (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4 sm:p-6">
          <div className="max-w-xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4 shadow-lg">
                <span className="text-4xl">🏁</span>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Cuộc Đua Kì Thú
                </h1>
              </div>
              <p className="text-gray-500">
                Chấm điểm thi đua • Ai dẫn đầu?
              </p>
            </div>

            {/* Quick Start - Chỉ nhập số */}
            <div className="bg-white rounded-2xl p-4 mb-4 border border-orange-200 shadow-sm">
              <p className="text-gray-700 font-bold mb-3">⚡ Bắt đầu nhanh:</p>
              <div className="flex gap-3 items-center">
                <span className="text-gray-500">Số người/nhóm:</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setNumGroups(Math.max(2, numGroups - 1))}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xl"
                  >-</button>
                  <span className="w-12 text-center text-2xl font-black text-orange-500">{numGroups}</span>
                  <button 
                    onClick={() => setNumGroups(Math.min(50, numGroups + 1))}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xl"
                  >+</button>
                </div>
                <button
                  onClick={() => {
                    // Tạo tên mặc định
                    const defaultNames = Array.from({length: numGroups}, (_, i) => `Nhóm ${i + 1}`);
                    setNamesText(defaultNames.join('\n'));
                  }}
                  className="ml-auto px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg font-medium text-sm"
                >
                  Tạo tên mặc định
                </button>
              </div>
            </div>

            {/* Names Input - Optional */}
            <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200 shadow-sm">
              <p className="text-gray-700 font-bold mb-3">
                📝 Danh sách tên <span className="text-gray-400 font-normal text-sm">(hoặc để trống dùng mặc định)</span>
              </p>
              <textarea
                value={namesText}
                onChange={(e) => setNamesText(e.target.value)}
                placeholder={"Nhóm 1\nNhóm 2\nNhóm 3\n...\n\nHoặc tên học sinh:\nNguyễn Văn A\nTrần Thị B"}
                className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl
                  text-gray-700 placeholder-gray-400 resize-none
                  focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <p className="text-gray-400 text-xs mt-2">
                💡 Mỗi dòng 1 tên • Copy-paste từ Excel • Để trống = dùng "Nhóm 1, 2, 3..."
              </p>
            </div>

            {/* Character Selection - Compact */}
            <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200 shadow-sm">
              <p className="text-gray-700 font-bold mb-3">🎨 Chọn biểu tượng:</p>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(CHARACTER_TYPES).map(([key, type]) => (
                  <button
                    key={key}
                    onClick={() => setCharType(key)}
                    className={`py-3 rounded-xl font-medium transition-all flex flex-col items-center gap-1
                      ${charType === key
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <span className="text-2xl">{type.icons[0]}</span>
                    <span className="text-xs">{type.name.split(' ')[1] || type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startRace}
              className="w-full py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 
                text-white text-xl font-black rounded-2xl 
                shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all
                flex items-center justify-center gap-3"
            >
              <span className="text-3xl">🏎️</span>
              BẮT ĐẦU CUỘC ĐUA!
            </button>
          </div>
        </div>
      )}

      {/* ==================== RACE SCREEN ==================== */}
      {screen === 'race' && (
        <div className="h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 overflow-hidden">
          
          {/* ===== TOP BAR - Friendly Theme ===== */}
          <div className="flex items-center justify-between px-3 py-2 bg-white/80 backdrop-blur border-b-2 border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2">
              <button onClick={backToSetup} className="h-9 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all">
                <span>⚙️</span><span className="hidden sm:inline">Cài đặt</span>
              </button>
              <button onClick={resetRace} className="h-9 px-3 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all">
                <span>🔄</span><span className="hidden sm:inline">Reset</span>
              </button>
              <button onClick={finishRace} className="h-9 px-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-lg transition-all">
                <span>🏁</span><span>Kết thúc</span>
              </button>
            </div>
            
            {/* Race Title */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span className="text-gray-800 font-black text-lg tracking-wide hidden md:block">CUỘC ĐUA KÌ THÚ</span>
            </div>
            
            {/* Search Input */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="🔍 Tìm..."
                  className="h-9 w-32 sm:w-40 px-3 rounded-lg border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm transition-all"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={() => setSortBy(sortBy === 'score' ? 'id' : 'score')}
                className={`h-9 px-3 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                  sortBy === 'score' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{sortBy === 'score' ? '🏆' : '📋'}</span>
                <span className="hidden sm:inline">{sortBy === 'score' ? 'Xếp hạng' : 'Thứ tự'}</span>
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`h-9 px-3 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                  soundEnabled 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <span>{soundEnabled ? '🔊' : '🔇'}</span>
                <span className="hidden sm:inline">{soundEnabled ? 'Âm thanh' : 'Tắt tiếng'}</span>
              </button>
            </div>
          </div>

          {/* ===== RACE AREA - Racing Track ===== */}
          <div ref={raceAreaRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4" style={{ paddingBottom: showControls ? '85px' : '50px' }}>
            <div className="max-w-5xl mx-auto">
              
              {/* Racing Lanes - Each racer is a lane */}
              <div className="space-y-3">
                {filteredRacers.map((racer) => {
                  const scoreRank = [...racers].sort((a, b) => b.score - a.score).findIndex(r => r.id === racer.id) + 1;
                  const progress = maxScore > 0 ? Math.min((racer.score / maxScore) * 100, 100) : 0;
                  const isLeader = scoreRank === 1 && racer.score > 0;
                  const isSecond = scoreRank === 2 && racer.score > 0;
                  const isThird = scoreRank === 3 && racer.score > 0;
                  const isTop3 = scoreRank <= 3 && racer.score > 0;
                  const isSelected = selectedRacer === racer.id;
                  const isSuggested = suggestedRacer === racer.id;
                  const justScored = lastAction?.racerId === racer.id && Date.now() - lastAction.timestamp < 1500;
                  
                  // Card size based on count
                  const isLargeCard = racers.length <= 6;
                  const isMediumCard = racers.length <= 12;

                  return (
                    <div
                      key={racer.id}
                      ref={el => racerRefs.current[racer.id] = el}
                      onClick={() => !isLocked && setSelectedRacer(isSelected ? null : racer.id)}
                      className={`relative rounded-2xl cursor-pointer transition-all duration-150
                        ${isSelected ? 'ring-4 ring-blue-400 shadow-xl shadow-blue-300/50 scale-[1.02] z-10' : ''}
                        ${isSuggested && !isSelected ? 'ring-[6px] ring-yellow-400 shadow-2xl shadow-yellow-400/70 scale-[1.05] z-20' : ''}
                        ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'}
                        ${justScored ? 'animate-score-flash' : ''}`}
                    >
                      {/* Spinning Highlight Glow Effect */}
                      {isSuggested && !isSelected && (
                        <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-3xl opacity-60 animate-pulse blur-sm z-[-1]" />
                      )}
                      
                      {/* Racing Lane Background */}
                      <div className={`relative transition-all rounded-2xl border-2
                        ${isLargeCard ? 'h-24' : isMediumCard ? 'h-20' : 'h-16'}
                        ${isSuggested && !isSelected
                          ? 'bg-gradient-to-r from-yellow-200 via-orange-100 to-yellow-200 border-yellow-500 border-4'
                          : isLeader 
                            ? 'bg-gradient-to-r from-amber-100 to-yellow-50 border-amber-400' 
                            : isSecond 
                              ? 'bg-gradient-to-r from-slate-100 to-gray-50 border-slate-300' 
                              : isThird 
                                ? 'bg-gradient-to-r from-orange-100 to-amber-50 border-orange-300' 
                                : isSelected 
                                  ? 'bg-gradient-to-r from-blue-100 to-cyan-50 border-blue-300' 
                                  : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                        
                        {/* Racing Track - THE MAIN VISUAL */}
                        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gray-200 rounded-b-xl">
                          {/* Track markings */}
                          <div className="absolute inset-0 flex items-center overflow-hidden">
                            {[...Array(20)].map((_, i) => (
                              <div key={i} className="flex-1 border-r border-dashed border-gray-300 h-full" />
                            ))}
                          </div>
                          {/* Progress - The racer position */}
                          <div
                            className={`absolute left-0 top-0 h-full transition-all duration-700 ease-out rounded-r-lg ${
                              isLeader ? 'bg-gradient-to-r from-amber-400 to-yellow-400' :
                              isSecond ? 'bg-gradient-to-r from-slate-400 to-gray-400' :
                              isThird ? 'bg-gradient-to-r from-orange-400 to-amber-400' :
                              `bg-gradient-to-r ${racer.color}`
                            }`}
                            style={{ width: `${Math.max(progress, 3)}%` }}
                          >
                            {/* Racer icon at the front - BIG & PROMINENT above track */}
                            <div className={`absolute -right-5 transition-all duration-300 ${justScored ? 'scale-150 animate-bounce' : 'hover:scale-110'}`}
                                 style={{ top: isLargeCard ? '-42px' : isMediumCard ? '-36px' : '-30px' }}>
                              <span className={`${isLargeCard ? 'text-5xl' : isMediumCard ? 'text-4xl' : 'text-3xl'} drop-shadow-xl filter`}
                                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                                {racer.icon}
                              </span>
                            </div>
                          </div>
                          {/* Finish line */}
                          <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-black via-white to-black" />
                        </div>
                        
                        {/* Position & Info */}
                        <div className="absolute inset-0 flex items-center px-4 pb-3">
                          {/* Position Badge */}
                          <div className={`flex-shrink-0 mr-4 font-black text-center
                            ${isLargeCard ? 'text-3xl w-12' : isMediumCard ? 'text-2xl w-10' : 'text-xl w-8'}
                            ${isLeader ? 'text-amber-600' : 
                              isSecond ? 'text-slate-500' :
                              isThird ? 'text-orange-600' :
                              'text-gray-400'}`}>
                            {isLeader ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `${scoreRank}`}
                          </div>
                          
                          {/* Name */}
                          <span className={`font-bold flex-1 truncate
                            ${isLargeCard ? 'text-xl' : isMediumCard ? 'text-lg' : 'text-base'}
                            ${isLeader ? 'text-amber-800' : 
                              isSecond ? 'text-slate-700' :
                              isThird ? 'text-orange-800' :
                              'text-gray-700'}`}>
                            {racer.name}
                          </span>
                          
                          {/* Crown for leader */}
                          {isLeader && <span className={`${isLargeCard ? 'text-3xl' : 'text-2xl'} animate-bounce mr-2`}>👑</span>}
                          
                          {/* Score - BIG & PROMINENT */}
                          <div className={`text-right ${justScored ? 'scale-125 transition-transform' : ''}`}>
                            <span className={`font-black tabular-nums
                              ${isLargeCard ? 'text-4xl' : isMediumCard ? 'text-3xl' : 'text-2xl'}
                              ${isLeader ? 'text-amber-600' : 
                                isSecond ? 'text-slate-600' :
                                isThird ? 'text-orange-600' :
                                'text-blue-600'}`}>
                              {racer.score}
                            </span>
                            <span className="text-xs text-gray-400 ml-1">điểm</span>
                          </div>
                          
                          {/* Selected Indicator */}
                          {isSelected && <span className={`ml-3 text-blue-500 ${isLargeCard ? 'text-2xl' : 'text-xl'}`}>✓</span>}
                        </div>
                        
                        {/* Score Change Popup */}
                        {justScored && lastAction.points !== 0 && (
                          <div className={`absolute top-2 right-20 font-black animate-score-popup
                            ${isLargeCard ? 'text-2xl' : 'text-xl'}
                            ${lastAction.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {lastAction.points > 0 ? '+' : ''}{lastAction.points}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* No results */}
              {filteredRacers.length === 0 && searchText && (
                <div className="text-center py-8 text-gray-400">
                  Không tìm thấy "{searchText}"
                </div>
              )}
            </div>
          </div>

          {/* ===== BOTTOM PANEL - Friendly Control ===== */}
          <div className={`fixed left-0 right-0 z-30 transition-all duration-300 ${showControls ? 'bottom-0' : '-bottom-16'}`}>
            {/* Toggle Button */}
            <button
              onClick={() => setShowControls(!showControls)}
              className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-white px-5 py-2 rounded-t-xl border-2 border-b-0 border-emerald-300 shadow-lg text-emerald-600 hover:bg-emerald-50 transition-colors font-bold text-sm"
            >
              {showControls ? '▼ Ẩn bảng điều khiển' : '▲ Hiện bảng điều khiển'}
            </button>
            
            <div className="bg-white/95 backdrop-blur border-t-2 border-emerald-300 shadow-2xl">
              <div className="px-3 py-3">
                <div className="max-w-4xl mx-auto flex items-center gap-2">
                  {/* Selected Info */}
                  {selectedRacer !== null && racers[selectedRacer] ? (
                    <div className="flex items-center gap-2 bg-blue-100 rounded-xl px-3 py-1.5 mr-2 border border-blue-300">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${racers[selectedRacer].color} flex items-center justify-center text-lg`}>
                        {racers[selectedRacer].icon}
                      </div>
                      <span className="text-gray-800 font-bold text-sm max-w-[100px] truncate">{racers[selectedRacer].name}</span>
                      <button onClick={() => setSelectedRacer(null)} className="text-gray-400 hover:text-gray-600 text-base ml-1">✕</button>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm px-3 py-2 bg-gray-100 rounded-xl">👆 Chọn người chơi</div>
                  )}
                  
                  {/* Plus Score Buttons */}
                  {[1, 2, 3, 5].map(pts => (
                    <button
                      key={`plus-${pts}`}
                      onClick={() => selectedRacer !== null && addScore(selectedRacer, pts)}
                      disabled={selectedRacer === null || isLocked}
                      className={`flex-1 h-11 rounded-xl font-black text-base transition-all
                        ${selectedRacer !== null && !isLocked
                          ? 'bg-gradient-to-b from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-white shadow-md active:scale-95' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      +{pts}
                    </button>
                  ))}
                  
                  {/* Minus Score Buttons */}
                  {[1, 2, 3, 5].map(pts => (
                    <button
                      key={`minus-${pts}`}
                      onClick={() => selectedRacer !== null && addScore(selectedRacer, -pts)}
                      disabled={selectedRacer === null || isLocked}
                      className={`flex-1 h-11 rounded-xl font-black text-base transition-all
                        ${selectedRacer !== null && !isLocked
                          ? 'bg-gradient-to-b from-red-400 to-red-500 hover:from-red-300 hover:to-red-400 text-white shadow-md active:scale-95' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      -{pts}
                    </button>
                  ))}
                  
                  {/* Divider */}
                  <div className="w-px h-9 bg-gray-300 mx-1" />
                
                  {/* Random Pick with spinning animation */}
                  <button
                    onClick={suggestNextRacer}
                    disabled={isSpinning}
                    className={`h-11 px-4 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all
                      ${isSpinning 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white animate-pulse cursor-wait' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 active:scale-95'}`}
                  >
                    <span className={isSpinning ? 'animate-spin' : ''}>🎲</span>
                    <span className="hidden sm:inline">{isSpinning ? 'Đang gọi...' : 'Gọi ngẫu nhiên'}</span>
                  </button>
                  
                  {/* Lock */}
                  <button
                    onClick={() => setIsLocked(!isLocked)}
                    className={`h-11 px-3 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 flex-shrink-0
                      ${isLocked 
                        ? 'bg-red-100 text-red-600 border-2 border-red-300' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <span className="text-lg">{isLocked ? '🔒' : '🔓'}</span>
                    <span className="hidden sm:inline">{isLocked ? 'Đang khóa' : 'Khóa'}</span>
                  </button>
                  
                  {/* Undo */}
                  <button
                    onClick={undo}
                    disabled={history.length === 0}
                    className={`h-11 px-3 rounded-xl text-sm font-medium flex items-center gap-1.5 flex-shrink-0 transition-all
                      ${history.length > 0 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                  >
                    <span className="text-lg">↩️</span>
                    <span className="hidden sm:inline">Hoàn tác</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti-fall"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    fontSize: `${Math.random() * 20 + 15}px`,
                  }}
                >
                  {['🎉', '🎊', '⭐', '✨', '🏆', '🥇'][Math.floor(Math.random() * 6)]}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== SUMMARY MODAL ==================== */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full max-h-[85vh] overflow-auto shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">🏆</div>
              <h2 className="text-xl font-black text-gray-800">KẾT QUẢ CUỘC ĐUA</h2>
            </div>
            
            {/* Top 3 */}
            <div className="space-y-2 mb-4">
              {top3.map((racer, i) => (
                <div key={racer.id} className={`flex items-center gap-3 p-3 rounded-xl ${
                  i === 0 ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-400' : 
                  i === 1 ? 'bg-gray-100' : 
                  'bg-orange-50'}`}>
                  <div className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${racer.color} flex items-center justify-center text-xl`}>
                    {racer.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-bold text-sm">{racer.name}</p>
                    <p className="text-amber-600 font-black text-lg">{racer.score} điểm</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* All Rankings */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 max-h-32 overflow-auto">
              <p className="text-gray-500 text-xs mb-2">Bảng xếp hạng:</p>
              <div className="space-y-1">
                {[...racers].sort((a, b) => b.score - a.score).map((r, i) => (
                  <div key={r.id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 w-5">#{i + 1}</span>
                    <span className="text-gray-700 flex-1 truncate">{r.name}</span>
                    <span className="text-purple-600 font-bold">{r.score}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowSummary(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm"
              >
                Tiếp tục
              </button>
              <button
                onClick={() => { setShowSummary(false); resetRace(); }}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl text-sm"
              >
                Ván mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation: confetti-fall 2.5s ease-out forwards;
        }
        @keyframes score-flash {
          0%, 100% { background: inherit; }
          30% { background: rgba(16, 185, 129, 0.2); transform: scale(1.02); }
        }
        .animate-score-flash {
          animation: score-flash 0.6s ease-out;
        }
        @keyframes score-popup {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-20px) scale(1.3); opacity: 0; }
        }
        .animate-score-popup {
          animation: score-popup 0.8s ease-out forwards;
        }
        @keyframes racer-boost {
          0% { transform: scale(1); }
          30% { transform: scale(1.3) rotate(-5deg); }
          60% { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .animate-racer-boost {
          animation: racer-boost 0.5s ease-out;
        }
      `}</style>
      </div>
    </ToolLayout>
  );
}
