'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout/ToolLayout';
import SorobanBoard from '@/components/Soroban/SorobanBoard';

export default function BanTinhSoroban() {
  const [mode, setMode] = useState('free'); // 'free' | 'practice'
  const [targetNumber, setTargetNumber] = useState(null);
  const [currentValue, setCurrentValue] = useState(0);
  const [showHints, setShowHints] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [practiceInput, setPracticeInput] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Handle value change from SorobanBoard
  const handleValueChange = useCallback((value) => {
    setCurrentValue(value);
  }, []);

  // Handle correct answer in practice mode
  const handleCorrect = useCallback(() => {
    setScore(prev => ({
      correct: prev.correct + 1,
      total: prev.total + 1
    }));
    
    // Generate new random number after a short delay
    setTimeout(() => {
      generateRandomNumber();
    }, 1500);
  }, []);

  // Generate random number for practice
  const generateRandomNumber = useCallback(() => {
    const max = 999999999; // Max 9 digits
    const num = Math.floor(Math.random() * max);
    setTargetNumber(num);
    setResetKey(prev => prev + 1);
  }, []);

  // Start practice with input number
  const startPractice = useCallback(() => {
    const num = parseInt(practiceInput);
    if (!isNaN(num) && num >= 0 && num <= 999999999) {
      setTargetNumber(num);
      setMode('practice');
      setResetKey(prev => prev + 1);
      setScore({ correct: 0, total: 0 });
    }
  }, [practiceInput]);

  // Start practice with random number
  const startRandomPractice = useCallback(() => {
    setMode('practice');
    generateRandomNumber();
    setScore({ correct: 0, total: 0 });
  }, [generateRandomNumber]);

  // Reset to free mode
  const handleReset = useCallback(() => {
    setMode('free');
    setTargetNumber(null);
    setResetKey(prev => prev + 1);
    setPracticeInput('');
    setScore({ correct: 0, total: 0 });
  }, []);

  // Clear board
  const clearBoard = useCallback(() => {
    setResetKey(prev => prev + 1);
  }, []);

  return (
    <ToolLayout toolName="Bàn Tính Soroban" toolIcon="🧮">
      <div className="max-w-6xl mx-auto">
        {/* Header Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Mode & Info */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Mode tabs */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => { setMode('free'); setTargetNumber(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${mode === 'free' 
                      ? 'bg-white text-violet-600 shadow' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                >
                  🎮 Tự do
                </button>
                <button
                  onClick={startRandomPractice}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${mode === 'practice' 
                      ? 'bg-white text-violet-600 shadow' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                >
                  📝 Luyện tập
                </button>
              </div>

              {/* Current value display */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-violet-100 to-pink-100 
                px-4 py-2 rounded-xl">
                <span className="text-sm text-gray-600">Giá trị:</span>
                <span className="text-xl font-bold text-violet-600">
                  {currentValue.toLocaleString('vi-VN')}
                </span>
              </div>

              {/* Score in practice mode */}
              {mode === 'practice' && (
                <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-xl">
                  <span className="text-sm text-green-700">Điểm:</span>
                  <span className="text-xl font-bold text-green-600">
                    {score.correct}/{score.total}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Hints toggle */}
              <label className="flex items-center gap-2 cursor-pointer bg-gray-100 px-3 py-2 rounded-lg">
                <input
                  type="checkbox"
                  checked={showHints}
                  onChange={(e) => setShowHints(e.target.checked)}
                  className="w-4 h-4 text-violet-500 rounded"
                />
                <span className="text-sm text-gray-600">💡 Gợi ý</span>
              </label>

              {/* Clear button */}
              <button
                onClick={clearBoard}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 
                  font-medium rounded-lg text-sm transition-all"
              >
                🔄 Xóa bàn tính
              </button>

              {/* Reset button */}
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 
                  font-medium rounded-lg text-sm transition-all"
              >
                ↩️ Về tự do
              </button>
            </div>
          </div>

          {/* Practice mode controls */}
          {mode === 'practice' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-4">
                {/* Target number display */}
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm text-gray-500 mb-1">Biểu diễn số này trên bàn tính:</p>
                  <div className="text-4xl font-black text-transparent bg-clip-text 
                    bg-gradient-to-r from-violet-600 to-pink-600">
                    {targetNumber !== null ? targetNumber.toLocaleString('vi-VN') : '---'}
                  </div>
                </div>

                {/* Or enter custom number */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={practiceInput}
                    onChange={(e) => setPracticeInput(e.target.value)}
                    placeholder="Nhập số..."
                    className="w-32 px-3 py-2 border-2 border-gray-200 rounded-lg text-center
                      focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                  <button
                    onClick={startPractice}
                    className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white 
                      font-medium rounded-lg text-sm transition-all"
                  >
                    Luyện số này
                  </button>
                  <button
                    onClick={generateRandomNumber}
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white 
                      font-medium rounded-lg text-sm transition-all"
                  >
                    🎲 Số ngẫu nhiên
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Soroban Board */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <SorobanBoard
            mode={mode}
            targetNumber={targetNumber}
            onCorrect={handleCorrect}
            onValueChange={handleValueChange}
            showHints={showHints}
            resetKey={resetKey}
            columns={9}
            responsive={true}
          />
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📖</span>
            Hướng dẫn sử dụng Soroban
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-2">
              <p className="flex items-start gap-2">
                <span className="text-red-400 text-lg">●</span>
                <span><strong>Hạt trên (đỏ)</strong> = 5 đơn vị. Click/kéo xuống để đếm.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-yellow-400 text-lg">●</span>
                <span><strong>Hạt dưới (vàng)</strong> = 1 đơn vị mỗi hạt. Click/kéo lên để đếm.</span>
              </p>
              <p className="flex items-start gap-2">
                <span>🔢</span>
                <span>Mỗi cột từ phải sang trái: Đơn vị, Chục, Trăm, Nghìn...</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-start gap-2">
                <span>🎮</span>
                <span><strong>Mode Tự do:</strong> Tự do di chuyển hạt, học cách biểu diễn số.</span>
              </p>
              <p className="flex items-start gap-2">
                <span>📝</span>
                <span><strong>Mode Luyện tập:</strong> Biểu diễn số được yêu cầu trên bàn tính.</span>
              </p>
              <p className="flex items-start gap-2">
                <span>💡</span>
                <span>Bật gợi ý để xem giá trị từng cột khi học.</span>
              </p>
            </div>
          </div>

          {/* Examples */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="font-medium text-gray-700 mb-2">Ví dụ biểu diễn số:</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="font-bold text-violet-600">3</span> = 3 hạt vàng ↑
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="font-bold text-violet-600">7</span> = 1 hạt đỏ ↓ + 2 hạt vàng ↑
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="font-bold text-violet-600">15</span> = Cột chục: 1↑, Cột đơn vị: đỏ↓
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
