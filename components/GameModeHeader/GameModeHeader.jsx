'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocalizedUrl } from '@/components/LocalizedLink';

/**
 * 🎮 GAME MODE HEADER
 *
 * Header đơn giản cho chế độ game (từ Adventure Map)
 * Chỉ hiển thị: Nút quay lại + Tên màn + Stats cơ bản
 *
 * Props:
 * - stageName: Tên màn chơi hiện tại
 * - stageIcon: Icon của màn (emoji)
 * - zoneId: ID của zone để quay về đúng vị trí
 * - mapType: 'addsub' hoặc 'muldiv'
 * - userStats: { totalStars, diamonds }
 */
export default function GameModeHeader({
  stageName = 'Màn chơi',
  stageIcon = '🎮',
  zoneId,
  mapType = 'addsub',
  userStats = {}
}) {
  const router = useRouter();
  const localizeUrl = useLocalizedUrl();

  const handleBackToGame = () => {
    // Lưu zone info vào sessionStorage để Adventure page đọc
    if (zoneId) {
      sessionStorage.setItem('adventureReturnZone', JSON.stringify({
        zoneId,
        mapType,
        timestamp: Date.now()
      }));
    }

    // Clear game mode data
    sessionStorage.removeItem('practiceAutoStart');
    sessionStorage.removeItem('competeAutoStart');
    sessionStorage.removeItem('learnAutoStart');

    router.push(localizeUrl('/adventure'));
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Back button */}
          <motion.button
            onClick={handleBackToGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            <ArrowLeft size={18} className="text-white" />
            <span className="text-white font-medium text-sm sm:text-base">
              <span className="hidden sm:inline">Quay lại </span>Game
            </span>
          </motion.button>

          {/* Center: Stage name */}
          <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
            <motion.span
              className="text-xl sm:text-2xl"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {stageIcon}
            </motion.span>
            <h1 className="text-white font-bold text-sm sm:text-base md:text-lg truncate">
              {stageName}
            </h1>
          </div>

          {/* Right: Minimal stats */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Stars */}
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-400/90 rounded-full">
              <span className="text-xs sm:text-sm">⭐</span>
              <span className="text-[10px] sm:text-xs font-bold text-white">
                {(userStats?.totalStars || 0).toLocaleString()}
              </span>
            </div>

            {/* Diamonds */}
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-sky-400/90 rounded-full">
              <span className="text-xs sm:text-sm">💎</span>
              <span className="text-[10px] sm:text-xs font-bold text-white">
                {userStats?.diamonds || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Hook để kiểm tra và lấy game mode info từ sessionStorage
 */
export function useGameMode() {
  if (typeof window === 'undefined') {
    return { isGameMode: false, gameData: null };
  }

  // Check practice auto start
  const practiceData = sessionStorage.getItem('practiceAutoStart');
  if (practiceData) {
    try {
      const parsed = JSON.parse(practiceData);
      // Check if data is recent (within 30 minutes)
      if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
        return {
          isGameMode: parsed.from === 'adventure',
          gameData: parsed,
          type: 'practice'
        };
      }
    } catch (e) {}
  }

  // Check compete auto start
  const competeData = sessionStorage.getItem('competeAutoStart');
  if (competeData) {
    try {
      const parsed = JSON.parse(competeData);
      if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
        return {
          isGameMode: parsed.from === 'adventure',
          gameData: parsed,
          type: 'compete'
        };
      }
    } catch (e) {}
  }

  // Check learn auto start
  const learnData = sessionStorage.getItem('learnAutoStart');
  if (learnData) {
    try {
      const parsed = JSON.parse(learnData);
      if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
        return {
          isGameMode: parsed.from === 'adventure',
          gameData: parsed,
          type: 'learn'
        };
      }
    } catch (e) {}
  }

  return { isGameMode: false, gameData: null };
}

/**
 * Clear game mode khi hoàn thành
 */
export function clearGameMode() {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem('practiceAutoStart');
  sessionStorage.removeItem('competeAutoStart');
  sessionStorage.removeItem('learnAutoStart');
}
