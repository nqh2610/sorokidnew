'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  NARRATOR,
  MAP_NARRATIVES,
  LESSON_NARRATIVES,
  PRACTICE_NARRATIVES,
  MENTAL_NARRATIVES,
  FLASH_NARRATIVES,
  COMPETE_NARRATIVES,
  ACHIEVEMENT_NARRATIVES,
  getRandomLine,
  getLevelNarrative,
  getPracticeModeNarrative,
  getFeedbackNarrative,
  getCompletionNarrative
} from '@/config/narrative.config';

/**
 * 🎭 useNarrative - Hook quản lý toàn bộ narrative trong app
 * 
 * Cung cấp:
 * - Lời dẫn theo context (map, lesson, practice, etc.)
 * - Feedback theo kết quả
 * - Cấu trúc 3 lớp (hook, action, feedback)
 */
export function useNarrative() {
  const [currentNarrative, setCurrentNarrative] = useState(null);
  const [narrativeQueue, setNarrativeQueue] = useState([]);

  // ============================================================
  // 🗺️ MAP NARRATIVES
  // ============================================================
  
  const getMapNarrative = useCallback((type = 'entrance', isFirstTime = false) => {
    let lines = [];
    
    switch (type) {
      case 'entrance':
        const entrance = MAP_NARRATIVES.entrance;
        lines = entrance.map(item => 
          item.layer === 'hook' ? item.lines : item.lines
        ).flat();
        break;
      case 'unlock':
        lines = MAP_NARRATIVES.zoneUnlock;
        break;
      case 'locked':
        lines = MAP_NARRATIVES.zoneLocked;
        break;
      case 'complete':
        lines = MAP_NARRATIVES.zoneComplete;
        break;
      default:
        lines = MAP_NARRATIVES.entrance[0].lines;
    }
    
    return {
      narrator: NARRATOR,
      lines,
      single: getRandomLine(lines)
    };
  }, []);

  // ============================================================
  // 📚 LESSON NARRATIVES
  // ============================================================
  
  const getLessonNarrative = useCallback((levelId, lessonId = null, type = 'intro') => {
    const levelKey = `level_${levelId}`;
    const levelData = LESSON_NARRATIVES[levelKey];
    
    if (!levelData) {
      // Fallback generic
      return {
        narrator: NARRATOR,
        hook: ["Bí mật mới đang chờ con khám phá..."],
        action: ["Hãy để những con số dẫn đường..."],
        feedback: {
          success: ["Tuyệt vời! Con đã tiến bộ rồi!"],
          encourage: ["Cố lên! Ta tin con làm được!"]
        }
      };
    }

    // Lấy intro của level
    const intro = levelData.intro || {};
    
    // Nếu có lessonId cụ thể, lấy thêm lesson narrative
    let lessonSpecific = null;
    if (lessonId && levelData.lessons?.[lessonId]) {
      lessonSpecific = levelData.lessons[lessonId];
    }

    return {
      narrator: NARRATOR,
      // Layer 1: Hook
      hook: lessonSpecific?.hook 
        ? [lessonSpecific.hook]
        : intro.hook || [],
      // Layer 2: Action
      action: lessonSpecific?.action
        ? [lessonSpecific.action]
        : intro.action || [],
      // Layer 3: Feedback
      feedback: lessonSpecific?.feedback
        ? { success: [lessonSpecific.feedback], encourage: intro.feedback }
        : intro.feedback || { success: [], encourage: [] },
      // Get random single lines
      hookLine: getRandomLine(intro.hook),
      actionLine: getRandomLine(intro.action)
    };
  }, []);

  // ============================================================
  // 💪 PRACTICE NARRATIVES
  // ============================================================
  
  const getPracticeNarrative = useCallback((mode, difficulty = 1) => {
    const modeData = PRACTICE_NARRATIVES.modeSelection.modes[mode];
    const diffData = PRACTICE_NARRATIVES.difficulty[difficulty];
    
    return {
      narrator: NARRATOR,
      // Mode selection hook
      modeHook: modeData?.hook || PRACTICE_NARRATIVES.modeSelection.hook[0],
      modeName: modeData?.name || mode,
      modeAction: modeData?.action || "",
      // Difficulty info
      difficultyName: diffData?.name || "Thử thách",
      difficultyDesc: diffData?.desc || "",
      // Start messages
      startLines: PRACTICE_NARRATIVES.start,
      startLine: getRandomLine(PRACTICE_NARRATIVES.start),
      // Correct/Wrong feedback
      getCorrectFeedback: (speed = 'normal', streak = 0) => {
        return getFeedbackNarrative(true, speed, streak);
      },
      getWrongFeedback: () => {
        return getRandomLine(PRACTICE_NARRATIVES.wrong);
      },
      // Completion feedback
      getCompletionFeedback: (score, total) => {
        return getCompletionNarrative(score, total, 'practice');
      }
    };
  }, []);

  // ============================================================
  // 🧠 MENTAL NARRATIVES
  // ============================================================
  
  const getMentalNarrative = useCallback((subMode = null) => {
    const intro = MENTAL_NARRATIVES.intro;
    const subModeData = subMode ? MENTAL_NARRATIVES.modeSelect.modes[subMode] : null;
    
    return {
      narrator: NARRATOR,
      hook: intro.hook,
      hookLine: getRandomLine(intro.hook),
      action: intro.action,
      actionLine: getRandomLine(intro.action),
      // Sub mode
      subModeHook: MENTAL_NARRATIVES.modeSelect.hook,
      subModeDesc: subModeData || "",
      // During game
      duringLines: MENTAL_NARRATIVES.during,
      // Feedback
      getCorrectFeedback: () => getRandomLine(MENTAL_NARRATIVES.correct),
      getWrongFeedback: () => getRandomLine(MENTAL_NARRATIVES.wrong)
    };
  }, []);

  // ============================================================
  // ⚡ FLASH NARRATIVES
  // ============================================================
  
  const getFlashNarrative = useCallback((speedLevel = 1) => {
    const intro = FLASH_NARRATIVES.intro;
    const speedData = FLASH_NARRATIVES.speedLevels[speedLevel];
    
    return {
      narrator: NARRATOR,
      hook: intro.hook,
      hookLine: getRandomLine(intro.hook),
      action: intro.action,
      actionLine: getRandomLine(intro.action),
      // Speed level info
      speedName: speedData?.name || "Tia Sáng",
      speedHook: speedData?.hook || "",
      speedDesc: speedData?.desc || "",
      // Countdown
      countdown: FLASH_NARRATIVES.countdown,
      // Feedback
      getCorrectFeedback: () => getRandomLine(FLASH_NARRATIVES.correct),
      getWrongFeedback: () => getRandomLine(FLASH_NARRATIVES.wrong),
      getCompletionFeedback: (score, total) => {
        const pct = (score / total) * 100;
        if (pct >= 90) return FLASH_NARRATIVES.complete.excellent;
        if (pct >= 70) return FLASH_NARRATIVES.complete.good;
        return FLASH_NARRATIVES.complete.needsWork;
      }
    };
  }, []);

  // ============================================================
  // 🏆 COMPETE NARRATIVES
  // ============================================================
  
  const getCompeteNarrative = useCallback((mode, questionCount = 10) => {
    const intro = COMPETE_NARRATIVES.intro;
    const modeData = COMPETE_NARRATIVES.modeSelect.modes[mode];
    const qcData = COMPETE_NARRATIVES.questionCount.options[questionCount];
    
    return {
      narrator: NARRATOR,
      hook: intro.hook,
      hookLine: getRandomLine(intro.hook),
      action: intro.action,
      actionLine: getRandomLine(intro.action),
      // Mode
      modeHook: COMPETE_NARRATIVES.modeSelect.hook,
      modeDesc: modeData || "",
      // Question count
      questionHook: COMPETE_NARRATIVES.questionCount.hook,
      questionDesc: qcData || "",
      // Start
      startLines: COMPETE_NARRATIVES.start,
      startLine: getRandomLine(COMPETE_NARRATIVES.start),
      // Feedback during match
      getCorrectFeedback: () => getRandomLine(COMPETE_NARRATIVES.correct),
      getWrongFeedback: () => getRandomLine(COMPETE_NARRATIVES.wrong),
      // Completion based on rank
      getCompletionFeedback: (rank, totalPlayers) => {
        if (rank === 1) return getRandomLine(COMPETE_NARRATIVES.complete.top1);
        if (rank <= 3) return getRandomLine(COMPETE_NARRATIVES.complete.top3);
        return getRandomLine(COMPETE_NARRATIVES.complete.good);
      },
      // Leaderboard
      leaderboard: COMPETE_NARRATIVES.leaderboard
    };
  }, []);

  // ============================================================
  // 🎖️ ACHIEVEMENT NARRATIVES
  // ============================================================
  
  const getAchievementNarrative = useCallback((type, key) => {
    if (type === 'certificate') {
      const certData = ACHIEVEMENT_NARRATIVES.certificate[key];
      return {
        narrator: NARRATOR,
        unlockLines: certData?.unlock || ["Chúc mừng! Con đã đạt được thành tựu mới!"]
      };
    }
    
    if (type === 'milestone') {
      return {
        narrator: NARRATOR,
        message: ACHIEVEMENT_NARRATIVES.milestones[key] || "Một cột mốc mới!"
      };
    }
    
    return null;
  }, []);

  // ============================================================
  // 🎯 UNIVERSAL HELPERS
  // ============================================================
  
  /**
   * Lấy greeting theo thời gian trong ngày
   */
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return "Chào buổi sáng, nhà thám hiểm nhí! Hôm nay chúng ta sẽ khám phá những gì đây?";
    }
    if (hour >= 12 && hour < 18) {
      return "Chào buổi chiều! Sức mạnh của con đã phục hồi chưa? Hãy tiếp tục hành trình nào!";
    }
    if (hour >= 18 && hour < 22) {
      return "Chào buổi tối! Trước khi nghỉ ngơi, hãy luyện tập thêm một chút nhé!";
    }
    return "Hmm... Đêm khuya rồi, nhưng ta vẫn ở đây nếu con cần!";
  }, []);

  /**
   * Lấy lời động viên ngẫu nhiên
   */
  const getEncouragement = useCallback(() => {
    const messages = [
      "Ta tin con làm được! Hãy thử lại nào!",
      "Mỗi lần vấp ngã là một bài học quý giá...",
      "Những bậc thầy cũng từng sai rất nhiều lần...",
      "Đừng bỏ cuộc! Kho báu đang chờ con ở phía trước!",
      "Con đang làm tốt lắm rồi! Cố lên một chút nữa!",
      "Hít thở sâu... tập trung... và thử lại!",
      "Ta sẽ luôn ở đây đồng hành cùng con!"
    ];
    return getRandomLine(messages);
  }, []);

  /**
   * Lấy lời khen ngẫu nhiên
   */
  const getPraise = useCallback(() => {
    const messages = [
      "TUYỆT VỜI! Con làm tốt lắm!",
      "XUẤT SẮC! Sức mạnh của con đang tăng lên!",
      "PHI THƯỜNG! Ta rất tự hào về con!",
      "ĐỈNH CAO! Không ai làm tốt hơn con được!",
      "CỰC KỲ! Con đang trở thành bậc thầy!",
      "SIÊU VIỆT! Tài năng của con thật đáng kinh ngạc!",
      "HUYỀN THOẠI! Đây mới là sức mạnh thực sự!"
    ];
    return getRandomLine(messages);
  }, []);

  return {
    // Narrator info
    narrator: NARRATOR,
    
    // Context-specific narratives
    getMapNarrative,
    getLessonNarrative,
    getPracticeNarrative,
    getMentalNarrative,
    getFlashNarrative,
    getCompeteNarrative,
    getAchievementNarrative,
    
    // Universal helpers
    getGreeting,
    getEncouragement,
    getPraise,
    getRandomLine,
    
    // Current state
    currentNarrative,
    setCurrentNarrative
  };
}

export default useNarrative;
