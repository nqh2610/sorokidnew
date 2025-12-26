'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// localStorage keys
const STORAGE_KEYS = {
  QUESTIONS: 'altp_questions',
  NUM_QUESTIONS: 'altp_num_questions',
  GAME_STATE: 'altp_game_state'
};

// Prize money levels - 15 câu chuẩn ALTP
const PRIZE_LEVELS = [
  '200K', '400K', '600K', '1 Triệu', '2 Triệu',
  '3 Triệu', '6 Triệu', '10 Triệu', '14 Triệu', '22 Triệu',
  '30 Triệu', '40 Triệu', '60 Triệu', '85 Triệu', '150 Triệu'
];

export default function AiLaTrieuPhu() {
  const [screen, setScreen] = useState('setup');
  const [toast, setToast] = useState(null);
  const gameContainerRef = useRef(null);
  
  // Setup state
  const [questionsText, setQuestionsText] = useState('');
  const [numQuestions, setNumQuestions] = useState(15);
  
  // Game state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  
  // Trợ giúp state
  const [used5050, setUsed5050] = useState(false);
  const [usedAudience, setUsedAudience] = useState(false);
  const [usedPhone, setUsedPhone] = useState(false);
  const [hidden5050, setHidden5050] = useState([]);
  const [audienceVotes, setAudienceVotes] = useState(null);
  const [phoneHint, setPhoneHint] = useState(null);
  
  // Sound
  const [soundEnabled, setSoundEnabled] = useState(true);

  const showToast = useCallback((message, duration = 3000) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  }, []);

  // ==================== ALTP SOUND SYSTEM ====================
  const audioCtxRef = useRef(null);
  
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Play a note with envelope
  const playNote = useCallback((ctx, freq, startTime, duration, vol = 0.15, type = 'sine') => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    // ADSR envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
    gain.gain.linearRampToValueAtTime(vol * 0.7, startTime + duration * 0.3);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }, []);

  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      const t = ctx.currentTime;
      
      switch (type) {
        case 'select':
          // ALTP selection sound - quick sparkle
          playNote(ctx, 1200, t, 0.08, 0.2);
          playNote(ctx, 1600, t + 0.04, 0.08, 0.15);
          break;
          
        case 'lock':
          // "Final Answer" dramatic ascending - D E F# G
          playNote(ctx, 294, t, 0.2, 0.25); // D4
          playNote(ctx, 330, t + 0.15, 0.2, 0.25); // E4
          playNote(ctx, 370, t + 0.3, 0.2, 0.25); // F#4
          playNote(ctx, 392, t + 0.45, 0.4, 0.3); // G4 (longer)
          // Add chord
          playNote(ctx, 294, t + 0.45, 0.4, 0.15); // D4
          playNote(ctx, 370, t + 0.45, 0.4, 0.15); // F#4
          break;
          
        case 'correct':
          // Victory fanfare! C E G C (major chord arpeggio)
          playNote(ctx, 523, t, 0.15, 0.3); // C5
          playNote(ctx, 659, t + 0.1, 0.15, 0.3); // E5
          playNote(ctx, 784, t + 0.2, 0.15, 0.3); // G5
          playNote(ctx, 1047, t + 0.3, 0.4, 0.35); // C6
          // Chord
          playNote(ctx, 523, t + 0.35, 0.5, 0.2);
          playNote(ctx, 659, t + 0.35, 0.5, 0.2);
          playNote(ctx, 784, t + 0.35, 0.5, 0.2);
          break;
          
        case 'wrong':
          // Sad descending - Bb Ab Gb F
          playNote(ctx, 233, t, 0.25, 0.25, 'triangle'); // Bb3
          playNote(ctx, 208, t + 0.2, 0.25, 0.25, 'triangle'); // Ab3
          playNote(ctx, 185, t + 0.4, 0.3, 0.25, 'triangle'); // Gb3
          playNote(ctx, 175, t + 0.65, 0.5, 0.2, 'triangle'); // F3
          break;
          
        case 'help':
          // Lifeline sound - bright ascending
          playNote(ctx, 880, t, 0.1, 0.2); // A5
          playNote(ctx, 1047, t + 0.08, 0.1, 0.2); // C6
          playNote(ctx, 1319, t + 0.16, 0.15, 0.25); // E6
          break;
          
        case 'suspense':
          // Heartbeat suspense during reveal wait
          for (let i = 0; i < 6; i++) {
            const beatTime = t + i * 0.25;
            playNote(ctx, 80 + i * 5, beatTime, 0.12, 0.3, 'sine');
            playNote(ctx, 80 + i * 5, beatTime + 0.1, 0.08, 0.2, 'sine');
          }
          break;
      }
    } catch (e) { console.log('Sound error:', e); }
  }, [soundEnabled, getAudioCtx, playNote]);

  // ==================== FULLSCREEN ====================
  const enterFullscreen = useCallback(async () => {
    try {
      const elem = gameContainerRef.current;
      if (elem && elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem?.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      }
    } catch (e) {
      console.log('Fullscreen not supported');
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (e) {}
  }, []);

  // ==================== LOCALSTORAGE ====================
  useEffect(() => {
    const savedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    const savedNum = localStorage.getItem(STORAGE_KEYS.NUM_QUESTIONS);
    const savedGameState = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    
    if (savedQuestions) setQuestionsText(savedQuestions);
    if (savedNum) setNumQuestions(parseInt(savedNum) || 15);
    
    if (savedGameState) {
      try {
        const gs = JSON.parse(savedGameState);
        if (gs.questions?.length > 0) {
          setQuestions(gs.questions);
          setCurrentIndex(gs.currentIndex || 0);
          setScore(gs.score || 0);
          setUsed5050(gs.used5050 || false);
          setUsedAudience(gs.usedAudience || false);
          setUsedPhone(gs.usedPhone || false);
          setScreen('game');
          showToast('🔄 Khôi phục game đang dở');
        }
      } catch (e) {}
    }
  }, [showToast]);

  useEffect(() => {
    if (questionsText) localStorage.setItem(STORAGE_KEYS.QUESTIONS, questionsText);
  }, [questionsText]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NUM_QUESTIONS, numQuestions.toString());
  }, [numQuestions]);

  useEffect(() => {
    if (screen === 'game' && questions.length > 0) {
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify({
        questions, currentIndex, score, used5050, usedAudience, usedPhone
      }));
    }
  }, [screen, questions, currentIndex, score, used5050, usedAudience, usedPhone]);

  useEffect(() => {
    if (screen === 'result') localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  }, [screen]);

  // ==================== PARSE QUESTIONS ====================
  const parseQuestions = useCallback((text) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed = [];
    
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 6) {
        const correctLetter = parts[5].toUpperCase();
        const answerIndex = ['A', 'B', 'C', 'D'].indexOf(correctLetter);
        if (answerIndex !== -1) {
          parsed.push({
            question: parts[0],
            answers: [parts[1], parts[2], parts[3], parts[4]],
            correct: answerIndex
          });
        }
      }
    }
    return parsed;
  }, []);

  // Sample questions
  const sampleQuestions = `Thủ đô của Việt Nam là gì?|Hà Nội|Hồ Chí Minh|Đà Nẵng|Huế|A
Núi cao nhất Việt Nam?|Bà Đen|Phan Xi Păng|Bà Nà|Ngọc Linh|B
1 + 1 = ?|1|2|3|4|B
Sông dài nhất Việt Nam?|Sông Hồng|Sông Mekong|Sông Đà|Sông Đồng Nai|B
Ai viết Truyện Kiều?|Nguyễn Du|Hồ Xuân Hương|Nguyễn Trãi|Nguyễn Bỉnh Khiêm|A
Quốc hoa Việt Nam?|Hoa mai|Hoa đào|Hoa sen|Hoa hồng|C
Việt Nam có bao nhiêu tỉnh thành?|61|63|64|65|B
Đơn vị tiền tệ Việt Nam?|Đô la|Euro|Đồng|Yên|C
Vị vua đầu tiên của nước ta?|Hùng Vương|An Dương Vương|Triệu Đà|Lý Thái Tổ|A
TP lớn nhất Việt Nam?|Hà Nội|Đà Nẵng|TP HCM|Hải Phòng|C
Biển Đông tiếng Anh gọi là?|East Sea|West Sea|South China Sea|Vietnam Sea|C
Năm Việt Nam thống nhất?|1954|1975|1945|1986|B
Ai là Chủ tịch nước đầu tiên?|Hồ Chí Minh|Võ Nguyên Giáp|Phạm Văn Đồng|Lê Duẩn|A
Động vật nào là biểu tượng Việt Nam?|Hổ|Rồng|Trâu|Voi|C
Vịnh nào là di sản UNESCO?|Vịnh Hạ Long|Vịnh Nha Trang|Vịnh Cam Ranh|Vịnh Vân Phong|A`;

  // ==================== GAME ACTIONS ====================
  const startGame = useCallback(async () => {
    const parsed = parseQuestions(questionsText);
    if (parsed.length === 0) {
      showToast('❌ Không có câu hỏi hợp lệ!');
      return;
    }
    
    const shuffled = [...parsed].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));
    
    setQuestions(selected);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsLocked(false);
    setIsRevealed(false);
    setUsed5050(false);
    setUsedAudience(false);
    setUsedPhone(false);
    setHidden5050([]);
    setAudienceVotes(null);
    setPhoneHint(null);
    setScreen('game');
    
    // Auto fullscreen
    setTimeout(() => enterFullscreen(), 100);
    playSound('select');
  }, [questionsText, numQuestions, parseQuestions, showToast, playSound, enterFullscreen]);

  const selectAnswer = useCallback((index) => {
    if (isLocked || isRevealed || hidden5050.includes(index)) return;
    playSound('select');
    setSelectedAnswer(index);
  }, [isLocked, isRevealed, hidden5050, playSound]);

  const lockAnswer = useCallback(() => {
    if (selectedAnswer === null || isLocked) return;
    
    playSound('lock');
    setIsLocked(true);
    
    // Play suspense heartbeat
    setTimeout(() => playSound('suspense'), 500);
    
    // Reveal sau 2.5s (longer for suspense)
    setTimeout(() => {
      setIsRevealed(true);
      const current = questions[currentIndex];
      if (selectedAnswer === current.correct) {
        playSound('correct');
        setScore(s => s + 1);
      } else {
        playSound('wrong');
      }
    }, 2500);
  }, [selectedAnswer, isLocked, questions, currentIndex, playSound]);

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setScreen('result');
      exitFullscreen();
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsLocked(false);
      setIsRevealed(false);
      setHidden5050([]);
      setAudienceVotes(null);
      setPhoneHint(null);
    }
  }, [currentIndex, questions.length, exitFullscreen]);

  // Trợ giúp 50:50
  const use5050 = useCallback(() => {
    if (used5050 || isLocked) return;
    const current = questions[currentIndex];
    const wrongAnswers = [0, 1, 2, 3].filter(i => i !== current.correct);
    const toHide = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);
    setHidden5050(toHide);
    setUsed5050(true);
    if (toHide.includes(selectedAnswer)) setSelectedAnswer(null);
    playSound('help');
  }, [used5050, isLocked, questions, currentIndex, selectedAnswer, playSound]);

  // Trợ giúp Khán giả
  const useAudience = useCallback(() => {
    if (usedAudience || isLocked) return;
    const current = questions[currentIndex];
    const votes = [0, 0, 0, 0];
    votes[current.correct] = 45 + Math.random() * 40;
    let remaining = 100 - votes[current.correct];
    [0, 1, 2, 3].filter(i => i !== current.correct && !hidden5050.includes(i)).forEach((i, idx, arr) => {
      const share = idx === arr.length - 1 ? remaining : Math.random() * remaining * 0.6;
      votes[i] = share;
      remaining -= share;
    });
    const total = votes.reduce((a, b) => a + b, 0);
    setAudienceVotes(votes.map(v => Math.round(v / total * 100)));
    setUsedAudience(true);
    playSound('help');
  }, [usedAudience, isLocked, questions, currentIndex, hidden5050, playSound]);

  // Trợ giúp Gọi điện
  const usePhone = useCallback(() => {
    if (usedPhone || isLocked) return;
    const current = questions[currentIndex];
    const letter = ['A', 'B', 'C', 'D'][current.correct];
    const hints = Math.random() > 0.4
      ? [`Chắc chắn là ${letter}!`, `Tôi nghĩ ${letter} đúng!`]
      : [`Có lẽ là ${letter}...`, `Hmm, ${letter}?`];
    setPhoneHint(hints[Math.floor(Math.random() * hints.length)]);
    setUsedPhone(true);
    playSound('help');
  }, [usedPhone, isLocked, questions, currentIndex, playSound]);

  const resetGame = useCallback(() => {
    exitFullscreen();
    setScreen('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsLocked(false);
    setIsRevealed(false);
    setUsed5050(false);
    setUsedAudience(false);
    setUsedPhone(false);
    setHidden5050([]);
    setAudienceVotes(null);
    setPhoneHint(null);
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  }, [exitFullscreen]);

  const validCount = parseQuestions(questionsText).length;
  const currentQuestion = questions[currentIndex];

  return (
    <div ref={gameContainerRef} className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-black/80 text-white px-4 py-2 rounded-lg">
          {toast}
        </div>
      )}

      {/* ==================== SETUP SCREEN ==================== */}
      {screen === 'setup' && (
        <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-pink-50 p-4">
          <div className="max-w-2xl mx-auto pt-4">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">💰</div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                Ai Là Triệu Phú
              </h1>
              <p className="text-gray-500 text-sm mt-1">Game show huyền thoại</p>
            </div>

            {/* Quick Start */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-4 border border-amber-200">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-bold text-amber-800">⚡ Chơi ngay</p>
                  <p className="text-sm text-amber-600">15 câu hỏi mẫu - không cần setup</p>
                </div>
                <button 
                  onClick={() => { 
                    setQuestionsText(sampleQuestions); 
                    setNumQuestions(15); // Chơi tất cả 15 câu
                    setTimeout(startGame, 50); 
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
                >
                  🎮 BẮT ĐẦU
                </button>
              </div>
            </div>

            {/* Custom Game Settings */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow border">
              <p className="text-sm font-bold text-gray-700 mb-3">⚙️ Tùy chỉnh (cho câu hỏi tự nhập)</p>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Chơi:</span>
                    <select 
                      value={numQuestions} 
                      onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                      className="px-3 py-1.5 border rounded-lg font-bold text-amber-600"
                    >
                      {[5, 10, 15, 20, 30].map(n => <option key={n} value={n}>{n} câu</option>)}
                    </select>
                    <span className="text-xs text-gray-400">(random từ {validCount} câu)</span>
                  </div>
                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-lg ${soundEnabled ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}
                    title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                  >
                    {soundEnabled ? '🔊' : '🔇'}
                  </button>
                </div>
              </div>
            </div>

            {/* Question Input */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-gray-700">📝 Câu hỏi tự nhập</label>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                    {validCount} câu
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setQuestionsText(sampleQuestions)} className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                    📋 Mẫu
                  </button>
                  <button onClick={() => { setQuestionsText(''); localStorage.removeItem(STORAGE_KEYS.QUESTIONS); }} className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200">
                    🗑️ Xóa
                  </button>
                </div>
              </div>
              
              <textarea
                value={questionsText}
                onChange={(e) => setQuestionsText(e.target.value)}
                placeholder="Câu hỏi | A | B | C | D | Đáp án đúng (A/B/C/D)"
                className="w-full h-36 p-3 border-2 rounded-xl focus:border-amber-400 resize-none font-mono text-sm"
              />
            </div>

            {/* Start Button */}
            <button
              onClick={startGame}
              disabled={validCount === 0}
              className={`w-full py-4 text-xl font-black rounded-2xl shadow-xl transition-all
                ${validCount > 0
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white hover:scale-[1.02]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              🎬 VÀO GAME ({Math.min(numQuestions, validCount)} câu)
            </button>

            {/* Back to toolbox */}
            <div className="text-center mt-4">
              <a href="/tool" className="text-gray-500 hover:text-violet-600 text-sm">
                ← Quay lại Toolbox
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ==================== GAME SCREEN - ALTP STYLE ==================== */}
      {screen === 'game' && currentQuestion && (
        <div className="altp-game min-h-screen relative overflow-hidden">
          {/* Background - Hình studio ALTP */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/tool/ailatrieuphu.jpg')" }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          {/* Main Content */}
          <div className="relative z-10 h-screen flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-3">
              <button onClick={resetGame} className="px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg text-sm font-medium transition-colors">
                ✕ Thoát
              </button>
              <button onClick={() => setSoundEnabled(!soundEnabled)} className="px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg text-sm">
                {soundEnabled ? '🔊' : '🔇'}
              </button>
            </div>

            {/* Question Box - Hexagon Style - CHỮ TO */}
            <div className="flex-shrink-0 px-4 mb-6">
              <div className="altp-question-box">
                <span className="altp-diamond text-2xl">◆</span>
                <span className="altp-question-text text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-lg">
                  {currentQuestion.question}
                </span>
                <span className="altp-diamond text-2xl">◆</span>
              </div>
            </div>

            {/* Main Game Area */}
            <div className="flex-1 flex">
              {/* Left Side - Answers */}
              <div className="flex-1 flex flex-col justify-center px-4 pb-4">
                {/* Phone Hint - CHỮ TO */}
                {phoneHint && (
                  <div className="mb-6 p-4 bg-green-900/90 border-2 border-green-400 rounded-xl text-center animate-fadeIn">
                    <p className="text-green-300 text-xl md:text-2xl font-bold">📞 "{phoneHint}"</p>
                  </div>
                )}

                {/* Audience Chart - TO HƠN */}
                {audienceVotes && (
                  <div className="mb-6 p-4 bg-blue-900/90 border-2 border-blue-400 rounded-xl animate-fadeIn">
                    <p className="text-white text-lg font-bold text-center mb-3">👥 KẾT QUẢ BÌNH CHỌN KHÁN GIẢ</p>
                    <div className="flex justify-center gap-6">
                      {['A', 'B', 'C', 'D'].map((letter, i) => (
                        <div key={letter} className={`text-center ${hidden5050.includes(i) ? 'opacity-20' : ''}`}>
                          <div className="h-20 w-12 bg-blue-950 rounded-lg relative overflow-hidden border-2 border-blue-400">
                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-orange-500 to-yellow-400 transition-all duration-700"
                              style={{ height: `${audienceVotes[i]}%` }} />
                          </div>
                          <span className="text-orange-400 font-black text-lg block mt-1">{audienceVotes[i]}%</span>
                          <span className="text-white font-bold text-lg">{letter}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Answers Grid - 2x2 - CHỮ TO */}
                <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto w-full">
                  {['A', 'B', 'C', 'D'].map((letter, index) => {
                    const isHidden = hidden5050.includes(index);
                    const isSelected = selectedAnswer === index;
                    const isCorrect = currentQuestion.correct === index;
                    const showCorrect = isRevealed && isCorrect;
                    const showWrong = isRevealed && isSelected && !isCorrect;
                    
                    let stateClass = 'altp-answer-default';
                    if (isHidden) stateClass = 'altp-answer-hidden';
                    else if (showCorrect) stateClass = 'altp-answer-correct';
                    else if (showWrong) stateClass = 'altp-answer-wrong';
                    else if (isSelected) stateClass = 'altp-answer-selected';
                    
                    return (
                      <button
                        key={letter}
                        onClick={() => selectAnswer(index)}
                        disabled={isLocked || isHidden}
                        className={`altp-answer-btn ${stateClass}`}
                      >
                        <span className="altp-answer-diamond text-xl">◆</span>
                        <span className="altp-answer-letter text-2xl md:text-3xl">{letter}</span>
                        <span className="altp-answer-text text-xl md:text-2xl font-semibold">
                          {currentQuestion.answers[index]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons - NÚT TO */}
                <div className="mt-6 flex justify-center gap-4 md:gap-6">
                  {/* Trợ giúp */}
                  <button onClick={use5050} disabled={used5050 || isLocked}
                    className={`altp-help-btn ${used5050 ? 'opacity-30' : ''}`}>
                    <span className="text-lg font-black">50:50</span>
                  </button>
                  <button onClick={useAudience} disabled={usedAudience || isLocked}
                    className={`altp-help-btn ${usedAudience ? 'opacity-30' : ''}`}>
                    <span className="text-2xl">👥</span>
                  </button>
                  <button onClick={usePhone} disabled={usedPhone || isLocked}
                    className={`altp-help-btn ${usedPhone ? 'opacity-30' : ''}`}>
                    <span className="text-2xl">📞</span>
                  </button>
                </div>

                {/* Lock / Next Button - CHỮ TO */}
                <div className="mt-6 text-center">
                  {!isLocked && selectedAnswer !== null && (
                    <button onClick={lockAnswer} className="altp-action-btn text-xl md:text-2xl px-8 py-4">
                      ✓ CHỐT ĐÁP ÁN
                    </button>
                  )}
                  
                  {isLocked && !isRevealed && (
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-yellow-400 text-2xl font-bold animate-pulse">Đang chờ kết quả...</p>
                      <div className="flex justify-center gap-3">
                        <span className="w-4 h-4 bg-orange-400 rounded-full animate-bounce"></span>
                        <span className="w-4 h-4 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-4 h-4 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                    </div>
                  )}
                  
                  {isRevealed && (
                    <div className="animate-fadeIn">
                      <p className={`text-3xl md:text-4xl font-black mb-4 drop-shadow-lg ${selectedAnswer === currentQuestion.correct ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedAnswer === currentQuestion.correct ? '🎉 CHÍNH XÁC!' : `❌ Đáp án: ${['A', 'B', 'C', 'D'][currentQuestion.correct]}`}
                      </p>
                      <button onClick={nextQuestion} className="altp-action-btn text-xl md:text-2xl px-8 py-4">
                        {currentIndex + 1 >= questions.length ? '🏁 XEM KẾT QUẢ' : '➡️ CÂU TIẾP THEO'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Prize Ladder */}
              <div className="w-48 flex-shrink-0 pr-4">
                <div className="altp-prize-ladder">
                  {[...PRIZE_LEVELS].reverse().map((prize, i) => {
                    const realIndex = PRIZE_LEVELS.length - 1 - i;
                    const isCurrent = realIndex === currentIndex;
                    const isPassed = realIndex < currentIndex;
                    const isMilestone = realIndex === 4 || realIndex === 9 || realIndex === 14;
                    
                    return (
                      <div key={i} className={`altp-prize-item ${isCurrent ? 'current' : ''} ${isPassed ? 'passed' : ''} ${isMilestone ? 'milestone' : ''}`}>
                        <span className="prize-number">{realIndex + 1}</span>
                        <span className="prize-value">{prize}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== RESULT SCREEN ==================== */}
      {screen === 'result' && (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-7xl mb-4">
              {score >= questions.length * 0.8 ? '🏆' : score >= questions.length * 0.5 ? '🌟' : '💪'}
            </div>
            <h1 className="text-4xl font-black text-yellow-400 mb-4">
              {score >= questions.length * 0.8 ? 'TRIỆU PHÚ!' : score >= questions.length * 0.5 ? 'XUẤT SẮC!' : 'CỐ GẮNG!'}
            </h1>
            <div className="text-5xl font-black text-white mb-3">
              💰 {score > 0 ? PRIZE_LEVELS[Math.min(score - 1, PRIZE_LEVELS.length - 1)] : '0đ'}
            </div>
            <p className="text-xl text-blue-200 mb-8">{score}/{questions.length} câu đúng</p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setScore(0);
                  setSelectedAnswer(null);
                  setIsLocked(false);
                  setIsRevealed(false);
                  setUsed5050(false);
                  setUsedAudience(false);
                  setUsedPhone(false);
                  setHidden5050([]);
                  setAudienceVotes(null);
                  setPhoneHint(null);
                  setQuestions(q => [...q].sort(() => Math.random() - 0.5));
                  setScreen('game');
                  enterFullscreen();
                }}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
              >
                🔄 Chơi Lại
              </button>
              <button onClick={resetGame}
                className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
              >
                📝 Setup Mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALTP Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        
        .altp-bg {
          background: linear-gradient(180deg, #0a1628 0%, #1a237e 40%, #311b92 70%, #1a1a2e 100%);
        }
        
        .altp-question-box {
          background: linear-gradient(90deg, transparent 0%, rgba(26,35,126,0.95) 5%, rgba(40,53,147,0.95) 50%, rgba(26,35,126,0.95) 95%, transparent 100%);
          border-top: 4px solid #ff9800;
          border-bottom: 4px solid #ff9800;
          padding: 1.5rem 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          clip-path: polygon(3% 0%, 97% 0%, 100% 50%, 97% 100%, 3% 100%, 0% 50%);
          box-shadow: 0 0 30px rgba(255,152,0,0.3);
        }
        .altp-diamond {
          color: #ff9800;
          flex-shrink: 0;
          text-shadow: 0 0 10px #ff9800;
        }
        .altp-question-text {
          color: white;
          text-align: center;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        
        .altp-answer-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
          position: relative;
          clip-path: polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%);
          min-height: 70px;
        }
        .altp-answer-default {
          background: linear-gradient(90deg, rgba(26,35,126,0.95) 0%, rgba(40,53,147,0.95) 50%, rgba(26,35,126,0.95) 100%);
          border: 3px solid #5c6bc0;
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        .altp-answer-default:hover:not(:disabled) {
          border-color: #ff9800;
          box-shadow: 0 0 25px rgba(255, 152, 0, 0.5);
          transform: scale(1.02);
        }
        .altp-answer-selected {
          background: linear-gradient(90deg, #e65100 0%, #ff9800 50%, #e65100 100%);
          border: 3px solid #ffcc80;
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          box-shadow: 0 0 30px rgba(255, 152, 0, 0.6);
        }
        .altp-answer-correct {
          background: linear-gradient(90deg, #1b5e20 0%, #4caf50 50%, #1b5e20 100%);
          border: 3px solid #a5d6a7;
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          animation: pulse-correct 0.5s ease-out;
          box-shadow: 0 0 30px rgba(76, 175, 80, 0.6);
        }
        .altp-answer-wrong {
          background: linear-gradient(90deg, #b71c1c 0%, #f44336 50%, #b71c1c 100%);
          border: 3px solid #ef9a9a;
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        .altp-answer-hidden {
          opacity: 0.1;
          cursor: not-allowed;
        }
        
        @keyframes pulse-correct {
          0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
          100% { box-shadow: 0 0 20px 10px rgba(76, 175, 80, 0); }
        }
        
        .altp-answer-diamond {
          color: #ff9800;
          font-size: 0.625rem;
        }
        .altp-answer-letter {
          color: #ff9800;
          font-weight: 700;
          min-width: 1.25rem;
        }
        .altp-answer-text {
          flex: 1;
          text-align: left;
          font-size: 0.9rem;
        }
        
        .altp-help-btn {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
          border: 3px solid #5c6bc0;
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .altp-help-btn:hover:not(:disabled) {
          border-color: #ff9800;
          transform: scale(1.15);
          box-shadow: 0 0 25px rgba(255,152,0,0.5);
        }
        .altp-help-btn:disabled {
          cursor: not-allowed;
        }
        
        .altp-action-btn {
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
          border: 3px solid #64b5f6;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(21,101,192,0.4);
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        .altp-action-btn:hover {
          transform: scale(1.08);
          border-color: #ff9800;
          box-shadow: 0 0 30px rgba(255,152,0,0.5);
        }
        
        .altp-prize-ladder {
          display: flex;
          flex-direction: column;
          gap: 2px;
          height: 100%;
          justify-content: center;
        }
        .altp-prize-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          clip-path: polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%);
          font-size: 0.75rem;
          color: #90caf9;
          transition: all 0.3s;
        }
        .altp-prize-item.milestone {
          background: rgba(255, 152, 0, 0.2);
          color: #ffb74d;
        }
        .altp-prize-item.current {
          background: linear-gradient(90deg, #e65100, #ff9800, #e65100);
          color: white;
          font-weight: 700;
          transform: scale(1.05);
        }
        .altp-prize-item.passed {
          opacity: 0.4;
        }
        .prize-number {
          min-width: 1.25rem;
          text-align: center;
        }
        .prize-value {
          flex: 1;
          text-align: right;
        }
      `}</style>
    </div>
  );
}
