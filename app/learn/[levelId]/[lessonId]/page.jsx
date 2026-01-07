'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Star, Clock, RotateCcw, Home, BookOpen, Target, Lightbulb, Menu, X, List, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import SorobanBoard from '@/components/Soroban/SorobanBoard';
import StarBadge, { StarReward } from '@/components/Rewards/StarBadge';
import CelebrationEffect, { CorrectAnswerEffect, WrongAnswerEffect } from '@/components/Rewards/CelebrationEffect';
import { StarsEarnedCard } from '@/components/LevelBadge/LevelBadge';
import { useToast } from '@/components/Toast/ToastContext';
import { useUpgradeModal } from '@/components/UpgradeModal';
import { parseMultiplicationProblem } from '@/lib/soroban-multiplication-guide';
import { parseDivisionProblem } from '@/lib/soroban-division-guide';
import { parseAdditionSubtractionProblem } from '@/lib/soroban-addition-subtraction-guide';
import { getNextZoneAfterStage as getNextZoneAddSub } from '@/config/adventure-stages-addsub.config';
import { getNextZoneAfterStage as getNextZoneMulDiv } from '@/config/adventure-stages-muldiv.config';

// ===== COMPONENT HIỂN THỊ LÝ THUYẾT CẢI TIẾN =====
function TheoryContent({ theory }) {
  const [expandedSections, setExpandedSections] = useState({});

  // Parse inline styles như **bold**
  const parseInlineStyles = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(<span key={key++}>{remaining.substring(0, boldMatch.index)}</span>);
        }
        parts.push(<strong key={key++} className="text-blue-700 font-semibold">{boldMatch[1]}</strong>);
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      } else {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
    }

    return parts.length > 0 ? parts : text;
  };

  // Parse theory array thành sections có cấu trúc
  const sections = useMemo(() => {
    if (!theory || theory.length === 0) return [];

    const result = [];
    let currentSection = null;

    // Main heading emojis - chỉ những emoji này mới tạo section mới
    const mainHeadingEmojis = /^[🧠✨📚💡🎯🔥⭐🏆📖🧮🖼️📐🎮💪🌟⚡📝🏅]/u;
    // Sub-heading markers - không tạo section mới, chỉ là content đặc biệt
    const subHeadingMarkers = /^[🔹◆◇▸▹→•·-]/u;

    theory.forEach((line, index) => {
      // Bỏ qua dòng trống
      if (!line || line.trim() === '') return;

      const trimmedLine = line.trim();
      const headingMatch = trimmedLine.match(/^(.+?)\*\*(.+?)\*\*(.*)$/);
      
      // Kiểm tra xem có phải MAIN heading không (emoji chính + bold text)
      const isMainHeading = headingMatch && 
        trimmedLine.match(mainHeadingEmojis) && 
        !trimmedLine.match(subHeadingMarkers);

      if (isMainHeading) {
        // Tạo section mới cho main heading
        if (currentSection) {
          result.push(currentSection);
        }
        const emoji = headingMatch[1].trim();
        const title = headingMatch[2].trim();
        const extra = headingMatch[3].trim();
        
        currentSection = {
          id: index,
          emoji: emoji,
          title: title,
          extra: extra,
          items: []
        };
      } else if (currentSection) {
        // Xử lý các dòng content
        const isSubHeading = headingMatch && trimmedLine.match(subHeadingMarkers);
        const isIndented = line.startsWith('   ') || line.startsWith('\t');
        
        currentSection.items.push({
          type: isSubHeading ? 'subheading' : (isIndented ? 'indented' : 'normal'),
          content: trimmedLine,
          parsed: parseInlineStyles(trimmedLine)
        });
      } else {
        // Chưa có section, tạo section mặc định
        currentSection = {
          id: 0,
          emoji: '📖',
          title: 'Nội dung bài học',
          extra: '',
          items: [{
            type: 'normal',
            content: trimmedLine,
            parsed: parseInlineStyles(trimmedLine)
          }]
        };
      }
    });

    // Push section cuối cùng
    if (currentSection) {
      result.push(currentSection);
    }

    return result;
  }, [theory]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Mặc định mở tất cả sections
  useEffect(() => {
    if (sections.length > 0 && Object.keys(expandedSections).length === 0) {
      const allExpanded = {};
      sections.forEach(s => { allExpanded[s.id] = true; });
      setExpandedSections(allExpanded);
    }
  }, [sections]);

  if (sections.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        Không có nội dung lý thuyết
      </div>
    );
  }

  return (
    <div className="p-3">
      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <BookOpen size={16} className="text-blue-500" />
        📚 Kiến thức cần nhớ
      </h3>

      <div className="space-y-3">
        {sections.map((section) => {
          const isExpanded = expandedSections[section.id] !== false;
          const hasItems = section.items && section.items.length > 0;

          return (
            <div 
              key={section.id}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl overflow-hidden border border-blue-100 shadow-sm"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-blue-100/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-left">
                  <span className="text-lg">{section.emoji || '📌'}</span>
                  <span className="font-bold text-blue-800 text-sm">
                    {section.title}
                  </span>
                  {section.extra && (
                    <span className="text-gray-600 text-xs">{section.extra}</span>
                  )}
                </div>
                {hasItems && (
                  <span className="text-blue-400">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                )}
              </button>

              {/* Section Content */}
              {isExpanded && hasItems && (
                <div className="px-3 pb-3 pt-0">
                  <div className="bg-white rounded-lg p-3 space-y-2">
                    {section.items.map((item, itemIdx) => {
                      // Sub-heading style
                      if (item.type === 'subheading') {
                        return (
                          <div key={itemIdx} className="pt-2 first:pt-0">
                            <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-sm border-b border-indigo-100 pb-1">
                              {item.parsed}
                            </div>
                          </div>
                        );
                      }
                      
                      // Indented content (số liệu, ví dụ)
                      if (item.type === 'indented') {
                        return (
                          <div 
                            key={itemIdx}
                            className="ml-4 text-gray-600 text-sm font-mono bg-gray-50 rounded px-2 py-1"
                          >
                            {item.parsed}
                          </div>
                        );
                      }
                      
                      // Normal content
                      return (
                        <div 
                          key={itemIdx}
                          className="text-gray-700 text-sm leading-relaxed"
                        >
                          {item.parsed}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips box */}
      <div className="mt-3 p-2.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
        <div className="flex items-start gap-2">
          <Lightbulb size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            <strong>Mẹo:</strong> Đọc kỹ lý thuyết rồi thử trên bàn Soroban bên phải nhé!
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper: Kiểm tra tier có đủ quyền truy cập level không
function getRequiredTierForLevel(levelId) {
  if (levelId <= 5) return 'free';
  if (levelId <= 10) return 'basic';
  return 'advanced';
}

function canAccessLevel(userTier, levelId) {
  const requiredTier = getRequiredTierForLevel(levelId);
  const tierOrder = { free: 0, basic: 1, advanced: 2, vip: 3 };
  return (tierOrder[userTier] || 0) >= (tierOrder[requiredTier] || 0);
}

function getTierDisplayName(tier) {
  const names = { free: 'Miễn Phí', basic: 'Cơ Bản', advanced: 'Nâng Cao', vip: 'VIP' };
  return names[tier] || tier;
}

export default function LessonPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const { showUpgradeModal, UpgradeModalComponent } = useUpgradeModal();
  const levelId = parseInt(params.levelId);
  const lessonId = parseInt(params.lessonId);

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceResults, setPracticeResults] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [allLessons, setAllLessons] = useState([]); // Danh sách tất cả bài học trong level
  const [showLessonMenu, setShowLessonMenu] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [showWrongEffect, setShowWrongEffect] = useState(false);
  const [celebrationType, setCelebrationType] = useState('medium');
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [previousBestStars, setPreviousBestStars] = useState(0);
  const [progressLoaded, setProgressLoaded] = useState(false);
  // EXP & Level states
  const [expEarned, setExpEarned] = useState(0);
  const [expBreakdown, setExpBreakdown] = useState([]);
  const [levelUpInfo, setLevelUpInfo] = useState(null);
  const [startTime, setStartTime] = useState(null);
  
  // 🔒 Tier check state
  const [userTier, setUserTier] = useState('free');
  const [tierChecked, setTierChecked] = useState(false);

  // 🎮 GAME MODE: Theo dõi nếu đang chơi từ Adventure Map
  const [gameMode, setGameMode] = useState(null);

  // 🎮 GAME MODE: Helper function để quay về Adventure với đúng zone
  // Nếu vượt qua màn cuối của zone -> tự động chuyển sang zone mới
  const handleBackToGame = (passed = false) => {
    if (gameMode?.zoneId) {
      let targetZoneId = gameMode.zoneId;
      
      // Nếu đã pass và đây là màn cuối zone -> chuyển sang zone tiếp theo
      if (passed && gameMode.stageId) {
        const getNextZone = gameMode.mapType === 'muldiv' ? getNextZoneMulDiv : getNextZoneAddSub;
        const nextZone = getNextZone(gameMode.stageId);
        if (nextZone) {
          targetZoneId = nextZone.zoneId;
          console.log('🎯 Auto-navigating to next zone:', targetZoneId);
        }
      }
      
      sessionStorage.setItem('adventureReturnZone', JSON.stringify({
        zoneId: targetZoneId,
        mapType: gameMode.mapType || 'addsub',
        timestamp: Date.now()
      }));
    }
    // Clear game mode data
    sessionStorage.removeItem('learnGameMode');
    router.push('/adventure');
  };

  // 🎮 GAME MODE: Helper để xử lý back button
  const handleBack = () => {
    if (gameMode?.from === 'adventure') {
      handleBackToGame(false);
    } else {
      router.push('/learn');
    }
  };

  // Filter bỏ các câu hỏi explore có target=0 (vì soroban bắt đầu từ 0, sẽ auto-pass)
  const filteredPractices = useMemo(() => {
    const rawPractices = lesson?.content?.practice || [];
    return rawPractices.filter(p => !(p.type === 'explore' && p.target === 0));
  }, [lesson]);

  // Key để lưu trạng thái trong localStorage
  const getProgressKey = () => `lesson_progress_${levelId}_${lessonId}`;

  // Lưu trạng thái vào localStorage
  const saveProgress = (index, results) => {
    if (typeof window !== 'undefined') {
      const progressData = {
        practiceIndex: index,
        practiceResults: results,
        currentStep: 1, // Đã vào phần luyện tập
        timestamp: Date.now()
      };
      localStorage.setItem(getProgressKey(), JSON.stringify(progressData));
    }
  };

  // Xóa trạng thái khi hoàn thành hoặc reset
  const clearProgress = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(getProgressKey());
    }
  };

  // Khôi phục trạng thái từ localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && lesson && !progressLoaded) {
      const saved = localStorage.getItem(getProgressKey());
      if (saved) {
        try {
          const data = JSON.parse(saved);
          
          // Chỉ khôi phục nếu còn câu chưa làm
          if (data.practiceIndex < filteredPractices.length) {
            setPracticeIndex(data.practiceIndex);
            setPracticeResults(data.practiceResults || []);
            setCurrentStep(data.currentStep || 1);
          }
        } catch (e) {
          console.error('Error loading progress:', e);
        }
      }
      setProgressLoaded(true);
    }
  }, [lesson, progressLoaded, levelId, lessonId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // 🔒 TIER CHECK: Fetch tier và kiểm tra quyền truy cập
  useEffect(() => {
    if (status !== 'authenticated') return;
    
    const checkTierAccess = async () => {
      try {
        const res = await fetch('/api/tier');
        const data = await res.json();
        const tier = data.tier || 'free';
        setUserTier(tier);
        
        // Kiểm tra quyền truy cập level này
        if (!canAccessLevel(tier, levelId)) {
          const requiredTier = getRequiredTierForLevel(levelId);
          showUpgradeModal({
            feature: `Level ${levelId} yêu cầu gói ${getTierDisplayName(requiredTier)} trở lên`
          });
          // Chuyển về trang learn sau khi hiện modal
          router.push('/learn');
          return;
        }
        
        setTierChecked(true);
      } catch (error) {
        console.error('Error checking tier:', error);
        setTierChecked(true); // Cho qua nếu lỗi
      }
    };
    
    checkTierAccess();
  }, [status, levelId, router, showUpgradeModal]);

  // 🎮 GAME MODE: Đọc game mode info từ sessionStorage (từ Adventure Map)
  useEffect(() => {
    if (status !== 'authenticated') return;

    const gameModeRaw = sessionStorage.getItem('learnGameMode');
    if (gameModeRaw) {
      try {
        const gameModeData = JSON.parse(gameModeRaw);
        // Check if data is recent (within 30 minutes)
        if (Date.now() - gameModeData.timestamp < 30 * 60 * 1000) {
          setGameMode(gameModeData);
          console.log('[Learn] Game mode active:', gameModeData);
        }
      } catch (e) {
        console.error('[Learn] Error parsing game mode:', e);
      }
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      // 🚀 TỐI ƯU: Gộp 2 API calls thành 1
      // Trước: fetchLesson() + fetchAllLessons() = 2 requests
      // Sau: fetchLessonWithAllLessons() = 1 request
      fetchLessonWithAllLessons();
      setStartTime(Date.now()); // Bắt đầu đếm thời gian
    }
  }, [levelId, lessonId, status]);

  // 🚀 TỐI ƯU: Gộp fetch lesson + allLessons thành 1 API call
  const fetchLessonWithAllLessons = async () => {
    setLoading(true);
    try {
      // 1 request thay vì 2 request
      const res = await fetch(`/api/lessons/${levelId}?lessonId=${lessonId}&includeAllLessons=true`);
      const data = await res.json();
      if (data.lesson) {
        setLesson(data.lesson);
      }
      // allLessons đi kèm trong response
      if (data.allLessons) {
        setAllLessons(data.allLessons);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    }
    setLoading(false);
  };

  // 🗑️ DEPRECATED: Không còn cần gọi riêng fetchAllLessons
  // const fetchAllLessons = async () => {...}

  const handlePracticeAnswer = (userAnswer, correctAnswer) => {
    const correct = userAnswer === correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    
    const newResults = [...practiceResults, { correct, userAnswer, correctAnswer }];
    setPracticeResults(newResults);
    
    // Hiển thị hiệu ứng phản hồi
    if (correct) {
      setShowCorrectEffect(true);
    } else {
      setShowWrongEffect(true);
    }
  };

  const nextPractice = () => {
    setShowResult(false);
    setIsCorrect(false); // Reset isCorrect để câu tiếp theo không bị hiện đúng ngay
    setShowCorrectEffect(false); // Reset hiệu ứng
    setShowWrongEffect(false);
    if (practiceIndex < filteredPractices.length - 1) {
      const newIndex = practiceIndex + 1;
      setPracticeIndex(newIndex);
      // Lưu tiến độ vào localStorage
      saveProgress(newIndex, practiceResults);
    } else {
      // Hoàn thành bài học - xóa trạng thái đã lưu
      clearProgress();
      completeLesson();
    }
  };

  const completeLesson = async () => {
    const totalCount = filteredPractices.length;
    // Giới hạn correctCount không vượt quá totalCount
    const rawCorrectCount = practiceResults.filter(r => r.correct).length + (isCorrect ? 1 : 0);
    const correctCount = Math.min(rawCorrectCount, totalCount);
    const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 100;
    const stars = Math.ceil((accuracy / 100) * (lesson?.stars || 3));
    
    // Tính thời gian làm bài (giây)
    const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    
    setEarnedStars(stars);
    setCompleted(true);

    // Xác định loại celebration dựa trên thành tích
    const maxStars = lesson?.stars || 3;
    if (stars === maxStars && correctCount === totalCount) {
      setCelebrationType('perfect');
    } else if (stars >= maxStars * 0.8) {
      setCelebrationType('large');
    } else if (stars >= maxStars * 0.5) {
      setCelebrationType('medium');
    } else {
      setCelebrationType('small');
    }
    setShowCelebration(true);

    // Lưu progress
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelId,
          lessonId,
          completed: true,
          starsEarned: stars,
          timeSpent,
          accuracy
        })
      });
      const data = await res.json();
      
      // 🚀 TỐI ƯU: Invalidate adventure cache khi hoàn thành lesson
      // Để Adventure map refresh dữ liệu mới
      sessionStorage.removeItem('adventureProgress');
      
      // Cập nhật thông tin kỷ lục và EXP
      if (data.success) {
        setIsNewRecord(data.isNewRecord);
        setPreviousBestStars(data.oldStars);
        setExpEarned(data.expEarned || 0);
        setExpBreakdown(data.expBreakdown || []);
        setLevelUpInfo(data.levelUp);
        
        // 🚀 OPTIMISTIC UPDATE: Dispatch với DATA (KHÔNG fetch server)
        // Chỉ tính stars mới = expEarned (nếu là kỷ lục mới hoặc lần đầu)
        const starsGained = data.expEarned || 0;
        if (starsGained > 0) {
          window.dispatchEvent(new CustomEvent('user-stats-updated', {
            detail: {
              stars: starsGained,
              diamonds: 0,
              newLevel: data.levelUp?.newLevel
            }
          }));
        }
        
        // Hiển thị toast thông báo lên level
        if (data.levelUp) {
          toast.levelUp(data.levelUp.oldLevel, data.levelUp.newLevel);
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const goToNextLesson = () => {
    // Kiểm tra bài tiếp theo có tồn tại không
    const nextLesson = allLessons.find(l => l.lessonId === lessonId + 1);
    if (nextLesson) {
      router.push(`/learn/${levelId}/${lessonId + 1}`);
    } else {
      // Nếu hết bài trong level
      // Game mode: quay về adventure map
      if (gameMode?.from === 'adventure') {
        handleBackToGame(true); // passed = true khi hoàn thành bài
      } else {
        router.push('/learn');
      }
    }
  };

  const goToPrevLesson = () => {
    if (lessonId > 1) {
      router.push(`/learn/${levelId}/${lessonId - 1}`);
    }
  };

  const resetLesson = () => {
    // Xóa trạng thái đã lưu trong localStorage
    clearProgress();
    // Reset về bước đầu tiên (lý thuyết)
    setCurrentStep(0);
    // Reset bài luyện tập về câu đầu tiên
    setPracticeIndex(0);
    // Xóa kết quả các bài đã làm
    setPracticeResults([]);
    // Reset trạng thái hiển thị kết quả
    setShowResult(false);
    setIsCorrect(false);
    // Reset trạng thái hoàn thành và số sao
    setCompleted(false);
    setEarnedStars(0);
    // Reset hiệu ứng celebration
    setShowCelebration(false);
    setShowCorrectEffect(false);
    setShowWrongEffect(false);
    setCelebrationType('medium');
    // Reset thông tin kỷ lục
    setIsNewRecord(false);
    setPreviousBestStars(0);
    // Reset EXP info
    setExpEarned(0);
    setExpBreakdown([]);
    setLevelUpInfo(null);
    setStartTime(Date.now());
  };

  // Tìm bài học tiếp theo để hiển thị preview
  const nextLessonInfo = allLessons.find(l => l.lessonId === lessonId + 1);
  const prevLessonInfo = lessonId > 1 ? allLessons.find(l => l.lessonId === lessonId - 1) : null;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="text-5xl animate-spin mb-4">🧮</div>
          <p className="text-gray-600">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy bài học</h2>
          <button
            onClick={handleBack}
            className="mt-4 px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600"
          >
            {gameMode?.from === 'adventure' ? '🎮 Quay lại Game' : 'Quay lại'}
          </button>
        </div>
      </div>
    );
  }

  const content = lesson.content || {};
  const theory = Array.isArray(content.theory) ? content.theory : [];
  // Dùng filteredPractices đã được filter ở trên
  const practices = filteredPractices;
  const currentPractice = practices[practiceIndex];

  // Màn hình hoàn thành - THIẾT KẾ TẬP TRUNG VÀO ĐIỂM THƯỞNG
  if (completed) {
    const totalCount = practices.length;
    // Giới hạn correctCount không vượt quá totalCount (tránh > 100%)
    const rawCorrectCount = practiceResults.filter(r => r.correct).length + (isCorrect ? 1 : 0);
    const correctCount = Math.min(rawCorrectCount, totalCount);
    const isPerfect = correctCount === totalCount;
    const maxStars = lesson?.stars || 3;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;
    
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 overflow-hidden">
        {/* Hiệu ứng ăn mừng */}
        <CelebrationEffect 
          type={celebrationType} 
          trigger={showCelebration}
          duration={4000}
        />
        
        {/* Card chính - Tập trung */}
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
          
          {/* Header gradient với icon */}
          <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 pt-4 pb-10 text-center relative">
            <div className={`text-4xl ${isPerfect ? 'animate-bounce' : 'animate-pulse'}`}>
              {isPerfect ? '🏆' : earnedStars >= maxStars * 0.7 ? '🎉' : '⭐'}
            </div>
            <h1 className="text-2xl font-black text-white mt-2 drop-shadow-lg">
              {isPerfect ? 'HOÀN HẢO!' : earnedStars >= maxStars * 0.7 ? 'XUẤT SẮC!' : 'HOÀN THÀNH!'}
            </h1>
            
            {/* Decorative circles */}
            <div className="absolute top-2 left-4 w-8 h-8 bg-white/20 rounded-full"></div>
            <div className="absolute top-8 right-6 w-4 h-4 bg-white/30 rounded-full"></div>
            <div className="absolute bottom-4 left-8 w-3 h-3 bg-white/25 rounded-full"></div>
          </div>

          {/* ĐIỂM THƯỞNG - NHẤN MẠNH NHẤT */}
          <div className="relative -mt-8 mx-6">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl p-5 border-4 border-amber-300 shadow-lg">
              <div className="flex items-center justify-center gap-4">
                <div className="text-5xl animate-pulse">⭐</div>
                <div className="text-center">
                  <div className="text-5xl font-black text-amber-500 leading-none">+{earnedStars}</div>
                  <div className="text-amber-600 font-bold text-sm">điểm sao</div>
                </div>
                <div className="text-5xl animate-pulse">⭐</div>
              </div>
              
              {/* Badge kỷ lục */}
              {isNewRecord && (
                <div className="mt-3 text-center">
                  <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                    🏆 KỶ LỤC MỚI!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Nội dung phụ */}
          <div className="p-5 space-y-4">
            
            {/* Thống kê gọn - 2 cột để tránh bị che */}
            <div className="flex items-center justify-around py-3 bg-gray-50 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-black text-green-500">{correctCount}/{totalCount}</div>
                <div className="text-xs text-gray-500">Đúng / Câu hỏi</div>
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-black text-purple-500">{accuracy}%</div>
                <div className="text-xs text-gray-500">Chính xác</div>
              </div>
            </div>

            {/* Stars Earned Card */}
            {expEarned > 0 && (
              <StarsEarnedCard 
                starsBreakdown={expBreakdown}
                totalStars={expEarned}
                levelUp={levelUpInfo}
              />
            )}

            {/* Bài tiếp theo - Nổi bật */}
            {nextLessonInfo && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🚀</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-purple-500 font-medium">Tiếp theo</div>
                    <div className="font-bold text-purple-700 text-sm truncate">{nextLessonInfo.title}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Thông báo điều kiện qua màn - chỉ hiện khi từ Adventure */}
            {gameMode?.from === 'adventure' && (
              <div className={`p-3 rounded-xl text-center text-sm font-medium ${accuracy >= 70 ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-orange-100 text-orange-700 border border-orange-300'}`}>
                {accuracy >= 70 ? (
                  <span>✅ Đã qua màn! Cần ≥70% để mở khóa màn tiếp theo</span>
                ) : (
                  <span>⚠️ Chưa đạt! Cần ≥70% chính xác để qua màn (hiện tại: {accuracy}%)</span>
                )}
              </div>
            )}

            {/* Nút hành động */}
            <div className="space-y-2">
              {/* Từ Adventure: chỉ có nút Về Map */}
              {gameMode?.from === 'adventure' ? (
                <button
                  onClick={() => handleBackToGame(accuracy >= 70)}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  🎮 Về Map Phiêu Lưu
                </button>
              ) : (
                /* Từ Menu: có đầy đủ các nút */
                <>
                  {nextLessonInfo && (
                    <button
                      onClick={goToNextLesson}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                      Tiếp tục học
                      <ArrowRight size={20} />
                    </button>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={resetLesson}
                      className="flex-1 py-3 bg-amber-100 text-amber-700 rounded-xl font-bold hover:bg-amber-200 transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={16} />
                      Làm lại
                    </button>
                    <button
                      onClick={handleBack}
                      className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Home size={16} />
                      Menu
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Footer */}
            <p className="text-gray-400 text-[10px] text-center pt-2">
              © 2025 SoroKid - Học toán tư duy cùng bàn tính Soroban
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Nếu đang ở bước luyện tập nhưng không còn câu hỏi, tự động hoàn thành
  if (currentStep === 1 && !currentPractice && practices.length > 0 && !completed) {
    // Gọi completeLesson một lần
    if (!showCelebration) {
      completeLesson();
    }
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tính kết quả...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 overflow-hidden">
      {/* 🔒 Upgrade Modal */}
      <UpgradeModalComponent />
      
      {/* Hiệu ứng trả lời đúng */}
      <CorrectAnswerEffect 
        show={showCorrectEffect} 
        onComplete={() => setShowCorrectEffect(false)} 
      />
      
      {/* Hiệu ứng trả lời sai */}
      <WrongAnswerEffect 
        show={showWrongEffect} 
        onComplete={() => setShowWrongEffect(false)} 
      />
      
      {/* === SIDEBAR - Progress & Navigation === */}
      <div className="w-64 bg-white shadow-xl flex flex-col z-30 hidden lg:flex overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 text-white flex-shrink-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-3 text-sm"
          >
            <ArrowLeft size={16} />
            {gameMode?.from === 'adventure' ? '🎮 Quay lại Game' : '🏠 Về trang chủ'}
          </button>
          <h2 className="font-bold text-lg flex items-center gap-2">
            🎮 Màn {levelId}
          </h2>
          <p className="text-white/80 text-sm">{allLessons.length} bài học</p>
        </div>

        {/* Progress Overview */}
        <div className="p-3 border-b bg-gradient-to-r from-yellow-50 to-orange-50 flex-shrink-0">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 text-xs">🎯 Luyện tập</span>
            <span className="font-bold text-orange-600 text-xs">Bài {practiceIndex + 1}/{practices.length || 1}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
              style={{ width: `${practices.length ? ((practiceIndex + (showResult ? 1 : 0)) / practices.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">💪 Cố lên!</p>
        </div>

        {/* Lesson List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-2">
            {allLessons.map((l, index) => (
              <button
                key={l.lessonId}
                onClick={() => router.push(`/learn/${levelId}/${l.lessonId}`)}
                className={`w-full p-2 rounded-xl text-left flex items-center gap-2 mb-1 transition-all ${
                  l.lessonId === lessonId 
                    ? 'bg-purple-100 border-2 border-purple-400' 
                    : l.completed 
                      ? 'bg-green-50 hover:bg-green-100' 
                      : 'hover:bg-gray-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  l.lessonId === lessonId 
                    ? 'bg-purple-500 text-white' 
                    : l.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {l.completed ? <CheckCircle size={14} /> : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm truncate ${l.lessonId === lessonId ? 'text-purple-700' : 'text-gray-800'}`}>
                    {l.title}
                  </div>
                  <div className="flex items-center gap-1 text-xs mt-0.5">
                    {l.completed ? (
                      <StarBadge 
                        stars={l.starsEarned || 0} 
                        size="xs" 
                        variant="earned"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">☆ {l.stars || 3} sao</span>
                    )}
                    {l.lessonId === lessonId && <span className="text-purple-500 ml-1 animate-pulse">🎮</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
          <button
            onClick={resetLesson}
            className="w-full py-2 px-3 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 rounded-lg text-white font-medium flex items-center justify-center gap-2 text-sm shadow-md"
          >
            <RotateCcw size={14} />
            Chơi lại
          </button>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-md z-40 flex-shrink-0">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="text-center flex-1 mx-3">
              <div className="text-xs text-gray-500">📚 Bài học {lessonId}/{allLessons.length}</div>
              <div className="font-bold text-gray-800 text-sm truncate">{lesson.title}</div>
            </div>
            
            <button
              onClick={() => setShowLessonMenu(!showLessonMenu)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <List size={20} />
            </button>
          </div>
          
          {/* Mobile Progress */}
          <div className="h-1 bg-gray-100">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{ width: `${practices.length ? ((practiceIndex + (showResult ? 1 : 0)) / practices.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Content Area - TỐI ƯU KHÔNG GIAN */}
        <div className="flex-1 flex flex-col p-2 lg:p-3 overflow-hidden">
          
          {/* Compact Header - gom title + tabs vào 1 dòng */}
          <div className="flex items-center gap-2 mb-2 flex-shrink-0">
            {/* Title nhỏ gọn */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600">
              <span>📚</span>
              <span className="font-medium truncate max-w-[200px]">{lesson.title}</span>
              <StarBadge 
                stars={lesson.stars || 3} 
                size="sm" 
                variant="header"
              />
            </div>
            
            {/* Step Tabs - compact */}
            <div className="flex gap-1 flex-1 lg:flex-none lg:ml-auto">
              <button
                onClick={() => setCurrentStep(0)}
                className={`flex-1 lg:flex-none py-1.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1 ${
                  currentStep === 0 
                    ? 'bg-blue-500 text-white shadow' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>📖</span>
                <span className="hidden sm:inline">Học bí kíp</span>
                {currentStep > 0 && <span>✅</span>}
              </button>
              <button
                onClick={() => theory.length > 0 && setCurrentStep(1)}
                disabled={theory.length === 0}
                className={`flex-1 lg:flex-none py-1.5 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1 ${
                  currentStep === 1 
                    ? 'bg-green-500 text-white shadow' 
                    : theory.length > 0 
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>🎮</span>
                <span className="hidden sm:inline">Luyện tập</span>
                <span className="text-xs">({practices.length})</span>
              </button>
            </div>
          </div>

          {/* Main Content Area - FULL HEIGHT */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {/* Phần lý thuyết - CẢI TIẾN UI */}
        {currentStep === 0 && theory && theory.length > 0 && (
          <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto lg:overflow-hidden lg:flex-row relative pb-16 lg:pb-0">
            {/* Left: Theory content - CẢI TIẾN HIỂN THỊ */}
            <div className="lg:w-2/5 bg-white rounded-xl shadow flex-shrink-0 lg:overflow-auto">
              <TheoryContent theory={theory} />
            </div>

            {/* Right: Soroban - CHIẾM NHIỀU KHÔNG GIAN HƠN */}
            <div className="lg:w-3/5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-2 flex flex-col min-h-[280px] lg:min-h-[300px] flex-shrink-0">
              <div className="text-center text-xs text-gray-500 mb-1">🧠 Thử gạt các hạt!</div>
              <div className="flex-1 flex items-center justify-center">
                <SorobanBoard mode="free" showHints={true} />
              </div>
            </div>

            {/* Button chuyển sang luyện tập - LUÔN HIỂN THỊ Ở DƯỚI CÙNG TRÊN MOBILE */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-t shadow-lg z-40">
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                🎮 Luyện tập ngay!
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Button cho desktop - nằm trong theory panel */}
            <div className="hidden lg:block absolute bottom-0 left-0 w-2/5 p-3 border-t bg-gradient-to-r from-green-50 to-emerald-50">
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                🎮 Luyện tập ngay!
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Phần luyện tập - TỐI ƯU KHÔNG GIAN */}
        {(currentStep === 1 || !theory || theory.length === 0) && practices.length > 0 && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Mini progress bar - siêu gọn */}
            <div className="flex items-center gap-2 mb-2 px-1 flex-shrink-0">
              <span className="text-xs text-gray-500">🎮 Bài {practiceIndex + 1}/{practices.length}</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${((practiceIndex + (showResult ? 1 : 0)) / practices.length) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Practice content - FULL HEIGHT */}
            <div className="flex-1 overflow-y-auto pb-2">
              {/* Debug: Hiển thị type nếu không match */}
              {currentPractice && !['create', 'calc', 'explore', 'memory', 'mental', 'chain', 'speed', 'flashcard', 'friend5', 'friend10', 'multiply', 'divide'].includes(currentPractice.type) && (
                <div className="bg-yellow-100 p-4 rounded-xl text-center">
                  <p className="text-yellow-700">⚠️ Unknown practice type: {currentPractice.type}</p>
                </div>
              )}
              
              {/* Hiển thị câu hỏi theo loại */}
              {currentPractice?.type === 'create' && (
                <CreateNumberPractice
                  key={`create-${practiceIndex}`}
                  target={currentPractice.target}
                  onCorrect={() => handlePracticeAnswer(currentPractice.target, currentPractice.target)}
                  showResult={showResult}
                  isCorrect={isCorrect}
                  practiceIndex={practiceIndex}
                />
              )}

              {currentPractice?.type === 'calc' && (
                <CalcPractice
                  key={`calc-${practiceIndex}`}
                  problem={currentPractice.problem}
                  answer={currentPractice.answer}
                  hint={currentPractice.hint}
                  onAnswer={(ans) => handlePracticeAnswer(ans, currentPractice.answer)}
                  showResult={showResult}
                  isCorrect={isCorrect}
                  practiceIndex={practiceIndex}
                />
              )}

              {currentPractice?.type === 'explore' && (
                <ExplorePractice
                  key={`explore-${practiceIndex}`}
                  instruction={currentPractice.instruction}
                  target={currentPractice.target}
                  onAnswer={(ans, target) => handlePracticeAnswer(ans, target)}
                  onComplete={() => handlePracticeAnswer(true, true)}
                  practiceIndex={practiceIndex}
                />
              )}

              {currentPractice?.type === 'memory' && (
                <MemoryPractice
                  key={`memory-${practiceIndex}`}
                  pairs={currentPractice.pairs}
                  onComplete={() => handlePracticeAnswer(true, true)}
                  showResult={showResult}
                />
              )}

              {currentPractice?.type === 'mental' && (
                <MentalPractice
                  key={`mental-${practiceIndex}`}
                  problem={currentPractice.problem}
                  answer={currentPractice.answer}
                  timeLimit={currentPractice.timeLimit}
                  onAnswer={(ans) => handlePracticeAnswer(ans, currentPractice.answer)}
                  showResult={showResult}
                  isCorrect={isCorrect}
                  practiceIndex={practiceIndex}
                />
              )}

              {currentPractice?.type === 'chain' && (
                <ChainPractice
                  key={`chain-${practiceIndex}`}
                  problems={currentPractice.problems}
                  answer={currentPractice.answer}
                  onAnswer={(ans) => handlePracticeAnswer(ans, currentPractice.answer)}
                  showResult={showResult}
                  isCorrect={isCorrect}
                  practiceIndex={practiceIndex}
                />
              )}

              {currentPractice?.type === 'speed' && (
                <SpeedPractice
                  key={`speed-${practiceIndex}`}
                  problem={currentPractice.problem}
                  answer={currentPractice.answer}
                  timeLimit={currentPractice.timeLimit}
                  onAnswer={(ans) => handlePracticeAnswer(ans, currentPractice.answer)}
                  showResult={showResult}
                  isCorrect={isCorrect}
                  practiceIndex={practiceIndex}
                />
              )}

              {/* Flash Card / Flash Anzan */}
              {currentPractice?.type === 'flashcard' && (
                <FlashcardPractice
                  key={`flashcard-${practiceIndex}`}
                  numbers={currentPractice.numbers}
                  displayTime={currentPractice.displayTime}
                  answer={currentPractice.answer}
                  onAnswer={(ans) => handlePracticeAnswer(ans, currentPractice.answer)}
                  showResult={showResult}
                  isCorrect={isCorrect}
                  practiceIndex={practiceIndex}
                />
              )}

              {/* Bạn nhỏ (cộng = 5) */}
              {currentPractice?.type === 'friend5' && (
                <FriendPractice
                  key={`friend5-${practiceIndex}`}
                  question={currentPractice.question}
                  answer={currentPractice.answer}
                  friendOf={5}
                  onAnswer={(ans) => handlePracticeAnswer(ans, currentPractice.answer)}
                  showResult={showResult}
                  isCorrect={isCorrect}
                  practiceIndex={practiceIndex}
                />
              )}

              {/* Bạn lớn (cộng = 10) */}
              {currentPractice?.type === 'friend10' && (
                <FriendPractice
                  key={`friend10-${practiceIndex}`}
                  question={currentPractice.question}
                  answer={currentPractice.answer}
                  friendOf={10}
                  onAnswer={(ans) => handlePracticeAnswer(ans, currentPractice.answer)}
                  showResult={showResult}
                  isCorrect={isCorrect}
                  practiceIndex={practiceIndex}
                />
              )}

              {/* Phép nhân */}
              {currentPractice?.type === 'multiply' && (
                <CalcPractice
                  key={`multiply-${practiceIndex}`}
                  problem={currentPractice.problem}
                  answer={currentPractice.answer}
                  hint={null}
                  onAnswer={(ans) => handlePracticeAnswer(ans, currentPractice.answer)}
                  showResult={showResult}
                  isCorrect={isCorrect}
                  practiceIndex={practiceIndex}
                />
              )}

              {/* Phép chia */}
              {currentPractice?.type === 'divide' && (
                <CalcPractice
                  key={`divide-${practiceIndex}`}
                  problem={currentPractice.problem}
                  answer={currentPractice.answer}
                  hint={null}
                  onAnswer={(ans) => handlePracticeAnswer(ans, currentPractice.answer)}
                  showResult={showResult}
                  isCorrect={isCorrect}
                  practiceIndex={practiceIndex}
                />
              )}
            </div>

            {/* Nút tiếp tục - LUÔN HIỂN THỊ Ở DƯỚI CÙNG */}
            {showResult && (
              <div className="flex-shrink-0 pt-2 border-t bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50">
                <button
                  onClick={nextPractice}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all ${
                    isCorrect 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                  }`}
                >
                  {practiceIndex < practices.length - 1 ? (
                    <>🚀 Câu tiếp theo <ArrowRight size={20} /></>
                  ) : (
                    <>🎉 Hoàn thành nhiệm vụ <CheckCircle size={20} /></>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Không có practice */}
        {practices.length === 0 && currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center flex-1 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-bold mb-2 text-purple-700">Xong phần lý thuyết!</h2>
            <p className="text-gray-600 mb-6">Em đã đọc hiểu bài học rồi! Giỏi lắm! 🌟</p>
            <button
              onClick={completeLesson}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              ✅ Hoàn thành bài học
            </button>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showLessonMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowLessonMenu(false)}>
          <div 
            className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Level {levelId}</h3>
                <button onClick={() => setShowLessonMenu(false)}>
                  <X size={20} />
                </button>
              </div>
              <p className="text-white/80 text-sm mt-1">{allLessons.length} bài học</p>
            </div>
            <div className="p-2">
              {allLessons.map((l, index) => (
                <button
                  key={l.lessonId}
                  onClick={() => {
                    router.push(`/learn/${levelId}/${l.lessonId}`);
                    setShowLessonMenu(false);
                  }}
                  className={`w-full p-3 rounded-xl text-left flex items-center gap-3 mb-1 transition-all ${
                    l.lessonId === lessonId 
                      ? 'bg-purple-100 border-2 border-purple-400' 
                      : l.completed 
                        ? 'bg-green-50' 
                        : 'hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    l.lessonId === lessonId 
                      ? 'bg-purple-500 text-white' 
                      : l.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {l.completed ? <CheckCircle size={16} /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm truncate ${l.lessonId === lessonId ? 'text-purple-700' : 'text-gray-800'}`}>
                      {l.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {l.lessonId === lessonId ? '← Đang học' : l.completed ? '✓ Hoàn thành' : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component: Tạo số trên bàn tính - SOROBAN LỚN
function CreateNumberPractice({ target, onCorrect, showResult, isCorrect, practiceIndex }) {
  const [currentValue, setCurrentValue] = useState(0);

  // Reset khi chuyển câu
  useEffect(() => {
    setCurrentValue(0);
  }, [practiceIndex]);

  const handleValueChange = (value) => {
    setCurrentValue(value);
  };

  const isMatch = currentValue === target;

  return (
    <div className="flex flex-col lg:flex-row gap-3 pb-4 lg:pb-0">
      {/* Đề bài - Compact trên mobile */}
      <div className="lg:w-1/3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 text-center flex-shrink-0">
        <div className="text-sm text-gray-600 mb-1">🎯 Tạo số này!</div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl font-black text-purple-600">{target}</span>
          {showResult && (
            <span className={`text-3xl ${isCorrect ? 'animate-bounce' : ''}`}>
              {isCorrect ? '🎉' : '😅'}
            </span>
          )}
        </div>
        
        {/* Hiển thị giá trị hiện tại khi chưa đúng */}
        {!showResult && (
          <div className={`mt-2 p-2 rounded-lg transition-all ${isMatch ? 'bg-green-100 border-2 border-green-400' : 'bg-white/50'}`}>
            <div className="text-xs text-gray-500">Bàn tính của em: <span className={`text-xl font-bold ${isMatch ? 'text-green-600' : 'text-gray-600'}`}>{currentValue}</span>
              {isMatch && <span className="ml-2 text-green-500 animate-bounce inline-block">✓</span>}
            </div>
            {!isMatch && currentValue > 0 && (
              <div className="text-xs text-orange-500 mt-1">
                {currentValue > target ? '📉 Lớn quá!' : '📈 Nhỏ quá!'}
              </div>
            )}
          </div>
        )}

        {showResult && (
          <div className={`mt-2 py-1.5 px-3 rounded-lg text-sm font-bold ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'}`}>
            {isCorrect ? '✅ Đúng rồi!' : `💪 Đáp án: ${target}`}
          </div>
        )}
      </div>
      
      {/* Soroban Board */}
      <div className="lg:w-2/3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-2 flex-shrink-0 flex items-center justify-center">
        <SorobanBoard 
          mode="practice" 
          targetNumber={target}
          onCorrect={onCorrect}
          onValueChange={handleValueChange}
          showHints={false}
          resetKey={practiceIndex}
        />
      </div>
    </div>
  );
}

// ===== MINI SOROBAN DEMO - Bàn tính thu nhỏ để hướng dẫn =====
function MiniSorobanDemo({ value = 0, highlightColumn = null, showArrow = false, arrowDirection = 'up' }) {
  // Chuyển số thành trạng thái hạt
  const getBeadState = (digit) => {
    const heaven = digit >= 5;
    const earth = digit >= 5 ? digit - 5 : digit;
    return { heaven, earth };
  };

  // Tự động tính số cột cần thiết dựa trên value
  const numDigits = Math.max(value.toString().length, 3); // Tối thiểu 3 cột
  const digits = value.toString().padStart(numDigits, '0').split('').map(Number);

  // Mapping label và index cho từng cột (từ trái sang phải)
  const allLabels = ['Tr.Tr', 'Ch.Tr', 'Triệu', 'Tr.N', 'Ch.N', 'Nghìn', 'Trăm', 'Chục', 'Đ.vị'];
  const startIndex = 9 - numDigits; // Index bắt đầu trong mảng 9 cột

  const columns = digits.map((digit, i) => ({
    label: allLabels[startIndex + i],
    digit: digit,
    index: startIndex + i
  }));

  // Điều chỉnh width và kích thước hạt theo số cột
  const columnWidth = numDigits <= 3 ? 36 : numDigits <= 5 ? 32 : 28;
  const beadSize = numDigits <= 3 ? 24 : numDigits <= 5 ? 22 : 20; // pixels

  return (
    <div className="bg-gradient-to-b from-amber-800 to-amber-900 rounded-xl p-2 shadow-xl relative">
      {/* Frame decoration */}
      <div className="absolute inset-0 border-2 border-amber-950/50 rounded-xl pointer-events-none z-20" />

      {/* THANH NGANG LIỀN MẠCH - đặt ở vị trí cố định */}
      <div className="absolute left-2 right-2 top-[52px] h-1.5 bg-gradient-to-b from-amber-900 via-amber-600 to-amber-900 rounded-sm shadow-md z-10">
        <div className="absolute inset-x-0 top-0 h-px bg-amber-400/40" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-black/30" />
      </div>

      <div className="flex justify-center gap-1 relative">
        {columns.map((col, colIdx) => {
          const state = getBeadState(col.digit);
          const isHighlighted = highlightColumn === col.index;

          return (
            <div
              key={colIdx}
              className={`flex flex-col items-center relative transition-all ${
                isHighlighted ? 'bg-yellow-400/30 ring-2 ring-yellow-400 rounded-lg' : ''
              }`}
              style={{ width: `${columnWidth}px` }}
            >
              {/* Rod - thanh dọc */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1 bottom-8 w-0.5 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-400 rounded-full z-0" />

              {/* Heaven bead - Hạt trời: container h-12, hạt di chuyển trong đó */}
              <div className="h-12 flex flex-col justify-start pt-1 relative z-20">
                <div
                  className={`rounded-full transition-all duration-200 relative ${
                    state.heaven
                      ? 'translate-y-4'
                      : 'translate-y-0'
                  }`}
                  style={{ width: `${beadSize}px`, height: `${beadSize}px` }}
                >
                  <div className={`absolute inset-0 rounded-full shadow-lg ${
                    state.heaven
                      ? 'bg-gradient-to-br from-red-400 to-red-600 ring-2 ring-white/60'
                      : 'bg-gradient-to-br from-red-300 to-red-500'
                  }`}>
                    <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-amber-800/70" />
                  </div>
                </div>
              </div>

              {/* Spacer cho thanh ngang */}
              <div className="h-1.5" />

              {/* Earth beads - 4 Hạt đất */}
              <div className="flex flex-col gap-0.5 relative z-20">
                {[0, 1, 2, 3].map((i) => {
                  const isUp = i < state.earth;
                  return (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-200 relative ${
                        isUp
                          ? (i === 0 ? '-translate-y-0.5' : '-translate-y-1')
                          : 'translate-y-0.5'
                      }`}
                      style={{ width: `${beadSize}px`, height: `${beadSize}px` }}
                    >
                      <div className={`absolute inset-0 rounded-full shadow-lg ${
                        isUp
                          ? 'bg-gradient-to-br from-yellow-300 to-amber-500 ring-2 ring-white/60'
                          : 'bg-gradient-to-br from-amber-500 to-amber-700'
                      }`}>
                        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-amber-800/60" />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Label cột */}
              <div className={`text-[8px] mt-1 font-medium ${isHighlighted ? 'text-yellow-300' : 'text-amber-300/80'}`}>
                {col.label}
              </div>
              <div className={`text-sm font-bold ${isHighlighted ? 'text-yellow-300' : 'text-white'}`}>
                {col.digit}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Component: Tính toán - HỌC SINH LÀM TỪNG BƯỚC THEO HƯỚNG DẪN
function CalcPractice({ problem, answer, hint, onAnswer, showResult, isCorrect, practiceIndex }) {
  const [currentValue, setCurrentValue] = useState(0);
  const [quotientValue, setQuotientValue] = useState(0); // Giá trị bàn thương
  const [submitted, setSubmitted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideSteps, setGuideSteps] = useState([]);
  const [currentGuideStep, setCurrentGuideStep] = useState(0);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [sorobanKey, setSorobanKey] = useState(0);
  const [quotientSorobanKey, setQuotientSorobanKey] = useState(0);
  const [hasMainInteracted, setHasMainInteracted] = useState(false); // Track main soroban interaction
  const [hasQuotientInteracted, setHasQuotientInteracted] = useState(false); // Track quotient soroban interaction

  // Kiểm tra có phải phép chia không - để hiển thị bàn thương
  const isDivision = problem?.includes('÷');

  // Tính số dư cho phép chia
  const expectedRemainder = useMemo(() => {
    if (!isDivision || !problem) return 0;
    const parts = problem.split('÷').map(p => parseInt(p.trim()));
    if (parts.length !== 2) return 0;
    const [dividend, divisor] = parts;
    return dividend - (answer * divisor);
  }, [isDivision, problem, answer]);

  // Reset khi chuyển câu
  useEffect(() => {
    setCurrentValue(0);
    setQuotientValue(0);
    setSubmitted(false);
    setShowGuide(false);
    setGuideSteps([]);
    setCurrentGuideStep(0);
    setStepCompleted(false);
    setSorobanKey(prev => prev + 1);
    setQuotientSorobanKey(prev => prev + 1);
    setHasMainInteracted(false);
    setHasQuotientInteracted(false);
  }, [practiceIndex]);

  // Phân tích bài toán thành các bước
  useEffect(() => {
    if (problem) {
      const steps = parseSimpleProblem(problem, answer);
      setGuideSteps(steps);
    }
  }, [problem, answer]);

  // Hàm để chuyển bước tiếp theo (cho bước giải thích)
  const handleNextStep = () => {
    if (currentGuideStep < guideSteps.length - 1) {
      setCurrentGuideStep(prev => prev + 1);
    }
  };

  // Kiểm tra khi học sinh thay đổi bàn chính
  const handleMainValueChange = (value) => {
    setCurrentValue(value);
    // Chỉ check khi user đã tương tác (value !== 0)
    if (value !== 0) {
      setHasMainInteracted(true);
      checkStepCompletion(value, quotientValue, true, hasQuotientInteracted);
    }
  };

  // Kiểm tra khi học sinh thay đổi bàn thương
  const handleQuotientValueChange = (value) => {
    setQuotientValue(value);
    // Chỉ check khi user đã tương tác (value !== 0)
    if (value !== 0) {
      setHasQuotientInteracted(true);
      checkStepCompletion(currentValue, value, hasMainInteracted, true);
    }
  };

  // Logic kiểm tra chung cho cả 2 bàn
  const checkStepCompletion = (mainVal, quotientVal, mainInteracted = hasMainInteracted, quotientInteracted = hasQuotientInteracted) => {
    // Không check nếu đã submit
    if (submitted) return;
    if (showGuide && guideSteps.length > 0) {
      const currentStep = guideSteps[currentGuideStep];

      // Bước có skipCheck (giải thích/ước lượng) không tự động chuyển - chờ user bấm nút
      if (currentStep?.skipCheck) {
        return;
      }

      const activeBoard = currentStep?.activeBoard; // 'quotient' hoặc 'main'

      let isCorrect = false;
      if (activeBoard === 'quotient') {
        isCorrect = quotientVal === currentStep?.quotientTarget;
      } else if (activeBoard === 'main') {
        isCorrect = mainVal === currentStep?.mainTarget;
      } else {
        // Không có activeBoard (phép cũ, chỉ dùng demoValue)
        isCorrect = mainVal === currentStep?.demoValue;
      }

      if (isCorrect && !stepCompleted) {
        setStepCompleted(true);
        setTimeout(() => {
          if (currentGuideStep < guideSteps.length - 1) {
            // Chưa phải bước cuối → chuyển bước tiếp
            setCurrentGuideStep(prev => prev + 1);
            setStepCompleted(false);
          } else {
            // Bước cuối - tìm ra thương số → xong bài, submit luôn
            setSubmitted(true);
            const finalAnswer = isDivision ? quotientVal : mainVal;
            onAnswer(finalAnswer);
          }
        }, 1000);
      }
    } else {
      // Không có guide - kiểm tra kết quả trực tiếp
      if (isDivision) {
        // Phép chia: kiểm tra bàn THƯƠNG có đúng đáp án không
        // Chỉ check khi user đã tương tác với bàn thương
        if (quotientInteracted && quotientVal === answer && !submitted) {
          setSubmitted(true);
          setTimeout(() => onAnswer(quotientVal), 800);
        }
      } else {
        // Phép khác: kiểm tra bàn chính
        // Chỉ check khi user đã tương tác với bàn chính
        if (mainInteracted && mainVal === answer && !submitted) {
          setSubmitted(true);
          setTimeout(() => onAnswer(mainVal), 800);
        }
      }
    }
  };

  // Kiểm tra kết quả đúng - phép chia kiểm tra bàn thương VÀ số dư, phép khác kiểm tra bàn chính
  const isMatch = isDivision
    ? (quotientValue === answer && currentValue === expectedRemainder)
    : currentValue === answer;
  const currentStep = guideSteps[currentGuideStep];

  // Kiểm tra match dựa trên activeBoard
  const isStepMatch = showGuide && currentStep && (() => {
    const activeBoard = currentStep.activeBoard;
    if (activeBoard === 'quotient') {
      return quotientValue === currentStep.quotientTarget;
    } else if (activeBoard === 'main') {
      return currentValue === currentStep.mainTarget;
    } else {
      return currentValue === currentStep.demoValue;
    }
  })();

  return (
    <div className="flex flex-col lg:flex-row gap-2 pb-2 lg:pb-0 max-w-full overflow-hidden">
      {/* Đề bài + Hướng dẫn */}
      <div className="lg:w-[280px] xl:w-[320px] flex flex-col gap-1.5 flex-shrink-0">
        {/* Phép tính */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-2">
          <div className="text-center">
            <span className="text-2xl font-black text-purple-600">{problem}</span>
            <span className="text-2xl font-bold text-gray-400 mx-1">=</span>
            <span className="text-2xl font-black text-purple-400">?</span>
          </div>

          {/* Kết quả trên bàn tính */}
          <div className={`p-1.5 rounded-lg mt-1 transition-all ${
            submitted || isMatch ? 'bg-green-100 border border-green-400' : 'bg-white/70'
          }`}>
            {isDivision ? (
              // Phép chia: hiển thị Thương và Dư
              <div className="text-xs text-center">
                <div className={`flex items-center justify-center gap-2 flex-wrap ${isMatch ? 'text-green-600' : 'text-purple-600'}`}>
                  <div className="flex items-center gap-1">
                    <span className="text-purple-500 font-medium">📊 Thương:</span>
                    <span className={`text-lg font-black ${quotientValue === answer && quotientValue > 0 ? 'text-green-600' : 'text-purple-600'}`}>
                      {quotientValue}
                    </span>
                    {quotientValue === answer && quotientValue > 0 && <span className="text-green-500">✓</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-orange-500 font-medium">🧮 Dư:</span>
                    <span className={`text-lg font-black ${isMatch ? 'text-green-600' : 'text-orange-600'}`}>
                      {currentValue}
                    </span>
                    {/* Chỉ hiện tick dư khi thương đã đúng VÀ dư đúng */}
                    {quotientValue === answer && quotientValue > 0 && currentValue === expectedRemainder && <span className="text-green-500">✓</span>}
                  </div>
                  {isMatch && <span className="animate-bounce inline-block">✅</span>}
                </div>
              </div>
            ) : (
              // Phép khác: chỉ hiện bàn chính
              <div className="text-xs text-gray-500 text-center">
                Bàn tính của em: <span className={`text-lg font-black ${submitted || isMatch ? 'text-green-600' : 'text-gray-600'}`}>{currentValue}</span>
                {(submitted || isMatch) && <span className="ml-1 animate-bounce inline-block">✅</span>}
              </div>
            )}
          </div>

          {submitted && (
            <div className="mt-1 py-1 rounded-lg text-center font-bold text-xs bg-green-200 text-green-800">
              🎉 Đúng! {problem} = {answer}{isDivision && expectedRemainder > 0 ? ` dư ${expectedRemainder}` : ''}
            </div>
          )}

          {/* Nút xem hướng dẫn */}
          {!submitted && !showResult && (
            <button
              onClick={() => {
                setShowGuide(!showGuide);
                setCurrentGuideStep(0);
                setStepCompleted(false);
                if (!showGuide) setSorobanKey(prev => prev + 1);
              }}
              className={`mt-1 w-full py-1.5 rounded-lg font-bold text-xs transition-all ${
                showGuide ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {showGuide ? '✕ Tự làm' : '📖 Xem hướng dẫn'}
            </button>
          )}
        </div>

        {/* Panel Hướng Dẫn - COMPACT */}
        {showGuide && !submitted && guideSteps.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-1.5 text-white shadow-lg">
            {/* Header gộp với Title */}
            <div className={`flex items-center gap-1.5 rounded p-1 mb-1 ${stepCompleted ? 'bg-green-400/30' : 'bg-white/10'}`}>
              <span className="text-base flex-shrink-0">{currentStep?.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] truncate">{currentStep?.title}</span>
                  <span className="text-[9px] text-white/60 flex-shrink-0 ml-1">{currentGuideStep + 1}/{guideSteps.length}</span>
                </div>
              </div>
              {stepCompleted && <span className="text-green-300 text-sm">✓</span>}
            </div>

            {/* Instruction - text dễ đọc hơn */}
            <div className="text-[10px] text-white/95 whitespace-pre-line leading-snug max-h-[4.5rem] overflow-y-auto bg-white/5 rounded px-1.5 py-1 mb-1">
              {currentStep?.instruction}
            </div>

            {/* Mục tiêu bước này - Mini Soroban */}
            {!currentStep?.skipCheck && (
              <div className="flex gap-1.5">
                {/* Mini Soroban chính */}
                <div className={`flex-1 p-1 rounded ${
                  currentStep?.activeBoard === 'main' || !currentStep?.activeBoard
                    ? 'bg-yellow-400/20 ring-1 ring-yellow-400'
                    : 'bg-white/10'
                }`}>
                  <div className="text-[9px] text-white/70 text-center mb-0.5">
                    {isDivision ? '🧮 Số bị chia' : '🧮 Kết quả'}
                  </div>
                  <div className="flex justify-center transform scale-[0.8] origin-top">
                    <MiniSorobanDemo
                      value={currentStep?.mainTarget ?? currentStep?.demoValue}
                      highlightColumn={currentStep?.column}
                    />
                  </div>
                  <div className="text-center mt-0.5">
                    <span className="text-[9px] text-yellow-300">Mục tiêu: {currentStep?.mainTarget ?? currentStep?.demoValue}</span>
                    <span className={`ml-1 text-[9px] px-1 rounded ${
                      (currentStep?.activeBoard === 'main' || !currentStep?.activeBoard) && currentValue === (currentStep?.mainTarget ?? currentStep?.demoValue)
                        ? 'bg-green-500 text-white'
                        : 'bg-white/20 text-white/70'
                    }`}>
                      Em: {currentValue} {(currentStep?.activeBoard === 'main' || !currentStep?.activeBoard) && currentValue === (currentStep?.mainTarget ?? currentStep?.demoValue) && '✓'}
                    </span>
                  </div>
                </div>

                {/* 📊 Thương số - Mini */}
                {currentStep?.quotientSoFar !== undefined && (
                  <div className={`flex-1 p-1 rounded ${
                    currentStep?.activeBoard === 'quotient'
                      ? 'bg-purple-400/20 ring-1 ring-purple-400'
                      : 'bg-purple-500/10'
                  }`}>
                    <div className="text-[9px] text-purple-200/70 text-center mb-0.5">📊 Thương số</div>
                    <div className="flex justify-center transform scale-[0.8] origin-top">
                      <MiniSorobanDemo
                        value={currentStep?.quotientTarget ?? currentStep?.quotientSoFar}
                        highlightColumn={currentStep?.quotientColumn}
                      />
                    </div>
                    <div className="text-center mt-0.5">
                      <span className="text-[9px] text-purple-200">Mục tiêu: {currentStep?.quotientTarget ?? currentStep?.quotientSoFar}</span>
                      <span className={`ml-1 text-[9px] px-1 rounded ${
                        currentStep?.activeBoard === 'quotient' && quotientValue === currentStep.quotientTarget
                          ? 'bg-green-500 text-white'
                          : 'bg-white/20 text-white/70'
                      }`}>
                        Em: {quotientValue} {currentStep?.activeBoard === 'quotient' && quotientValue === currentStep.quotientTarget && '✓'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nút tiếp tục cho bước giải thích */}
            {currentStep?.skipCheck && (
              <button
                onClick={handleNextStep}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded text-sm transition-all flex items-center justify-center gap-1"
              >
                Tiếp tục <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}

        {/* Gợi ý */}
        {hint && !showGuide && !submitted && (
          <div className="text-center">
            <span className="text-xs text-amber-700 bg-amber-100 px-3 py-1 rounded-full">💡 {hint}</span>
          </div>
        )}
      </div>

      {/* Bàn tính */}
      <div className={`flex-1 min-w-0 rounded-xl p-1.5 transition-all overflow-hidden ${
        stepCompleted ? 'bg-gradient-to-br from-green-100 to-emerald-100' : 'bg-gradient-to-br from-amber-50 to-orange-50'
      }`}>
        {/* Hướng dẫn trên cùng */}
        <div className={`text-center text-xs sm:text-sm font-medium py-0.5 mb-1 rounded-lg ${
          showGuide ? stepCompleted ? 'text-green-700 bg-green-200' : 'text-blue-700 bg-blue-100' : 'text-gray-500'
        }`}>
          {showGuide
            ? stepCompleted
              ? '🎉 Tuyệt vời!'
              : currentStep?.skipCheck
                ? '📖 Đọc hướng dẫn phía bên trái'
                : currentStep?.activeBoard === 'quotient'
                  ? `📊 Gạt THƯƠNG SỐ để được số ${currentStep?.quotientTarget}`
                  : currentStep?.activeBoard === 'main'
                    ? `🧮 Gạt SỐ BỊ CHIA để trừ → còn ${currentStep?.mainTarget}`
                    : `🎯 Gạt để được số ${currentStep?.demoValue}`
            : '🧮 Gạt bàn tính để tính!'
          }
        </div>

        {/* 2 bàn tính cạnh nhau - kích thước đầy đủ */}
        <div className={`flex ${isDivision ? 'gap-3' : ''} justify-center items-start`}>
          {/* Bàn CHÍNH */}
          <div className="text-center">
            <div className={`text-xs font-bold py-0.5 px-3 rounded inline-block mb-1 ${
              isDivision
                ? (currentStep?.activeBoard === 'main' ? 'text-blue-700 bg-blue-100 animate-pulse' : 'text-gray-500 bg-gray-100')
                : 'text-gray-600 bg-gray-100'
            }`}>
              {isDivision ? '🧮 Số bị chia' : '🧮 Bàn tính'} {isDivision && currentStep?.activeBoard === 'main' && '← GẠT'}
            </div>
            <SorobanBoard
              mode="free"
              showHints={!showGuide}
              resetKey={`${practiceIndex}-${sorobanKey}`}
              onValueChange={handleMainValueChange}
              highlightColumn={showGuide && currentStep?.activeBoard === 'main' ? currentStep?.column : null}
            />
          </div>

          {/* Bàn THƯƠNG */}
          {isDivision && (
            <div className={`text-center rounded-xl p-2 ${
              isMatch ? 'bg-green-100 ring-2 ring-green-400' : 'bg-purple-100 ring-2 ring-purple-400'
            }`}>
              <div className={`text-xs font-bold py-0.5 px-3 rounded inline-block mb-1 ${
                isMatch
                  ? 'text-green-700 bg-green-200'
                  : currentStep?.activeBoard === 'quotient'
                    ? 'text-purple-700 bg-purple-200 animate-pulse'
                    : 'text-purple-600 bg-purple-200'
              }`}>
                📊 Thương số {currentStep?.activeBoard === 'quotient' && '← GẠT'}
              </div>
              <SorobanBoard
                mode="free"
                showHints={false}
                resetKey={`${practiceIndex}-${quotientSorobanKey}`}
                onValueChange={handleQuotientValueChange}
                highlightColumn={showGuide && currentStep?.activeBoard === 'quotient' ? currentStep?.column : null}
                columns={Math.max(3, (currentStep?.quotientTarget || answer || 0).toString().length)}
                responsive={false}
              />
              <div className={`text-base font-bold mt-1 py-1 px-4 rounded inline-block ${
                isMatch ? 'bg-green-300 text-green-800' : 'bg-purple-200 text-purple-700'
              }`}>
                = {quotientValue} {isMatch && '✓'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hàm phân tích phép tính thành các bước CHI TIẾT với hướng dẫn theo phương pháp Soroban
// Mỗi bước có demoValue riêng để mini soroban hiển thị đúng trạng thái
function parseSimpleProblem(problem, answer) {
  const steps = [];
  let stepNumber = 1;

  // Kiểm tra phép cộng/trừ
  const match = problem.replace(/\s/g, '').match(/^(\d+)([\+\-])(\d+)$/);

  // Kiểm tra phép nhân
  const multiplyMatch = problem.replace(/\s/g, '').match(/^(\d+)[×\*](\d+)$/);
  if (multiplyMatch) {
    return parseMultiplicationProblem(problem, answer);
  }

  // Kiểm tra phép chia
  const divideMatch = problem.replace(/\s/g, '').match(/^(\d+)[÷\/](\d+)$/);
  if (divideMatch) {
    return parseDivisionProblem(problem, answer);
  }

  // Kiểm tra phép cộng/trừ - sử dụng hàm mới với quy tắc Soroban chuẩn
  if (match) {
    return parseAdditionSubtractionProblem(problem, answer);
  }

  // Nếu không phải cộng/trừ/nhân/chia
  return [{
    emoji: '🎯',
    title: `Tính ${problem}`,
    instruction: `Gạt bàn tính để được kết quả ${answer}`,
    demoValue: answer,
    column: 8
  }];
}

// Component: Khám phá tự do - có kiểm tra kết quả
function ExplorePractice({ instruction, target, onComplete, onAnswer, practiceIndex }) {
  const [explored, setExplored] = useState(false);
  const [currentValue, setCurrentValue] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false); // Track if user has interacted

  // Reset khi chuyển câu
  useEffect(() => {
    setExplored(false);
    setCurrentValue(0);
    setHasInteracted(false); // Reset interaction flag
  }, [practiceIndex]);

  // Kiểm tra kết quả khi Soroban thay đổi - TỰ ĐỘNG CHUYỂN KHI ĐÚNG
  const handleSorobanChange = (value) => {
    setCurrentValue(value);
    
    // Nếu value khác 0, user đã tương tác
    const userHasInteracted = value !== 0;
    if (userHasInteracted && !hasInteracted) {
      setHasInteracted(true);
    }
    
    // Chỉ auto-submit nếu:
    // 1. Có target và target khác 0 (tránh auto-pass khi soroban reset về 0)
    // 2. Giá trị khớp target
    // 3. Chưa explored
    // 4. User đã tương tác (value !== 0 nghĩa là đã thao tác)
    if (target !== undefined && target !== 0 && value === target && !explored && userHasInteracted) {
      setExplored(true);
      // Delay một chút để bé thấy hiệu ứng đúng
      setTimeout(() => {
        if (onAnswer) {
          onAnswer(value, target);
        }
      }, 800);
    }
  };

  const hasTarget = target !== undefined;
  const isMatch = hasTarget && currentValue === target;

  return (
    <div className="flex flex-col lg:flex-row gap-3 pb-4 lg:pb-0">
      {/* Instruction */}
      <div className="lg:w-1/3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-100 flex-shrink-0">
        <p className="text-gray-700 text-sm mb-2">🔍 {instruction}</p>
        
        {/* Hiển thị target nếu có */}
        {hasTarget && (
          <div className="p-2 bg-white rounded-lg border-2 border-dashed border-blue-300 inline-block">
            <div className="text-xs text-gray-500">Mục tiêu:</div>
            <div className="text-3xl font-bold text-blue-600">{target}</div>
          </div>
        )}

        {/* Hiển thị giá trị hiện tại */}
        {hasTarget && (
          <div className={`mt-2 p-2 rounded-lg transition-all ${
            explored 
              ? 'bg-green-100 border-2 border-green-400' 
              : isMatch 
                ? 'bg-green-50 border-2 border-green-300' 
                : 'bg-gray-50'
          }`}>
            <div className="text-xs text-gray-500">Bàn tính của em: <span className={`text-xl font-bold ${isMatch || explored ? 'text-green-600' : 'text-gray-600'}`}>{currentValue}</span>
              {(isMatch || explored) && <span className="ml-2 text-green-500 animate-bounce inline-block">✓</span>}
            </div>
            {explored && (
              <div className="mt-1 text-green-600 font-bold text-sm animate-pulse">
                🌟 Giỏi lắm!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Soroban Board */}
      <div className="lg:w-2/3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-2 flex-shrink-0 flex items-center justify-center">
        <SorobanBoard 
          mode="free"
          showHints={true} 
          resetKey={practiceIndex}
          onValueChange={handleSorobanChange}
        />
      </div>
    </div>
  );
}

// Component: Ghi nhớ cặp số - OPTIMIZED VERSION
function MemoryPractice({ pairs, onComplete, showResult }) {
  return (
    <div className="flex flex-col items-center py-4">
      <div className="text-2xl mb-2">🧠</div>
      <div className="text-gray-600 mb-4 text-center font-medium">Hãy nhớ các "Đôi bạn thân" của số 10 nhé!</div>
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {pairs.map(([a, b], index) => (
          <div key={index} className="bg-gradient-to-r from-purple-100 to-pink-100 px-5 py-3 rounded-xl shadow-sm hover:scale-105 transition-transform cursor-pointer">
            <span className="text-2xl font-bold text-purple-600">{a}</span>
            <span className="text-lg text-pink-400 mx-2">❤️</span>
            <span className="text-2xl font-bold text-pink-600">{b}</span>
          </div>
        ))}
      </div>

      {!showResult ? (
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
        >
          🎯 Em đã nhớ rồi!
        </button>
      ) : (
        <div className="py-2 px-6 bg-green-100 rounded-xl text-green-700 font-bold text-lg">
          🌟 Trí nhớ siêu đẳng!
        </div>
      )}
    </div>
  );
}

// Component: Tính nhẩm nhanh - COMPACT VERSION
function MentalPractice({ problem, answer, timeLimit = 15, onAnswer, showResult, isCorrect, practiceIndex }) {
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit || 15);

  // Reset timer khi chuyển câu hỏi mới
  useEffect(() => {
    setTimeLeft(timeLimit || 15);
    setUserInput('');
  }, [practiceIndex, timeLimit]);

  // Timer đếm ngược
  useEffect(() => {
    if (showResult || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          onAnswer(-1); // Hết giờ
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showResult, onAnswer, practiceIndex]);

  const handleSubmit = () => {
    if (userInput) {
      onAnswer(parseInt(userInput));
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Problem + Input - Compact */}
      <div className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">⚡ Tính nhẩm nhanh nào!</span>
          <div className={`px-2 py-0.5 rounded-full font-bold text-xs ${
            timeLeft <= 3 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600'
          }`}>
            ⏱️ {timeLeft}s
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-2xl sm:text-3xl font-bold text-purple-600">{problem}</span>
          <span className="text-2xl sm:text-3xl font-bold text-gray-400">=</span>
          
          {!showResult ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && userInput && handleSubmit()}
                className="w-16 text-center text-xl font-bold border-2 border-purple-300 rounded-lg py-1 focus:border-purple-500 focus:outline-none"
                placeholder="?"
                autoFocus
              />
              <button
                onClick={handleSubmit}
                disabled={!userInput}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold disabled:opacity-50"
              >
                ✓
              </button>
            </div>
          ) : (
            <span className={`text-2xl sm:text-3xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {answer} {isCorrect ? '✅' : '❌'}
            </span>
          )}
        </div>
      </div>

      {showResult && (
        <div className={`mt-2 py-1.5 px-4 rounded-xl font-bold text-sm ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
          {isCorrect ? '⚡ Siêu nhanh! Đúng rồi!' : `💪 Cố lên! Đáp án là ${answer}`}
        </div>
      )}
    </div>
  );
}

// Component: Chuỗi phép tính - SOROBAN LỚN
function ChainPractice({ problems, answer, onAnswer, showResult, isCorrect, practiceIndex }) {
  const [userInput, setUserInput] = useState('');

  // Reset input khi chuyển câu
  useEffect(() => {
    setUserInput('');
  }, [practiceIndex]);

  const handleSubmit = () => {
    onAnswer(parseInt(userInput));
  };

  const displayChain = problems.join(' ');

  return (
    <div className="flex flex-col lg:flex-row gap-3 pb-4 lg:pb-0">
      {/* Đề bài + Input */}
      <div className="lg:w-1/3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-3 flex-shrink-0">
        <div className="text-center text-sm text-gray-600 mb-2">🔗 Tính chuỗi!</div>
        <div className="flex items-center justify-center gap-1 flex-wrap mb-2">
          {problems.map((p, i) => (
            <span key={i} className={`text-lg font-bold ${i === 0 ? 'text-purple-600' : 'text-pink-500'}`}>
              {p}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <span className="text-xl font-bold text-gray-400">=</span>
          {!showResult ? (
            <>
              <input
                type="number"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && userInput && handleSubmit()}
                className="w-16 text-center text-xl font-bold border-2 border-purple-400 rounded-lg py-1.5 focus:border-purple-600 focus:outline-none"
                placeholder="?"
                autoFocus
              />
              <button
                onClick={handleSubmit}
                disabled={!userInput}
                className="px-3 py-1.5 bg-purple-500 text-white rounded-lg font-bold disabled:opacity-50"
              >
                ✓
              </button>
            </>
          ) : (
            <span className={`text-xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {answer} {isCorrect ? '✅' : '❌'}
            </span>
          )}
        </div>

        {showResult && (
          <div className={`mt-2 py-1.5 rounded-lg text-center font-bold text-sm ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'}`}>
            {isCorrect ? '🌟 Xuất sắc!' : `💪 ${displayChain} = ${answer}`}
          </div>
        )}
      </div>

      {/* Soroban Board */}
      <div className="lg:w-2/3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-2 flex-shrink-0 flex items-center justify-center">
        <SorobanBoard mode="free" showHints={false} resetKey={practiceIndex} />
      </div>
    </div>
  );
}

// Component: Thi đấu tốc độ - Giải 1 phép tính với giới hạn thời gian
function SpeedPractice({ problem, answer, timeLimit, onAnswer, showResult, isCorrect, practiceIndex }) {
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit || 10);
  const [submitted, setSubmitted] = useState(false);

  // Reset khi chuyển câu
  useEffect(() => {
    setUserInput('');
    setTimeLeft(timeLimit || 10);
    setSubmitted(false);
  }, [practiceIndex, timeLimit]);

  // Timer countdown
  useEffect(() => {
    if (showResult || submitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Hết giờ - auto submit sai
          if (!submitted && onAnswer) {
            setSubmitted(true);
            onAnswer(-999); // Giá trị sai
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showResult, submitted, timeLeft, onAnswer]);

  const handleSubmit = () => {
    if (!userInput || submitted) return;
    setSubmitted(true);
    if (onAnswer) {
      onAnswer(parseInt(userInput));
    }
  };

  return (
    <div className="flex flex-col items-center py-4">
      {/* Timer */}
      <div className={`mb-4 px-4 py-2 rounded-full font-bold text-lg ${
        timeLeft <= 3 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600'
      }`}>
        ⏱️ {timeLeft}s
      </div>

      {!showResult && !submitted ? (
        <>
          <div className="text-center mb-6">
            <div className="text-sm text-gray-400 mb-2">⚡ Tính nhanh nào!</div>
            <div className="text-4xl sm:text-5xl font-black text-purple-600">{problem} = ?</div>
          </div>

          <div className="flex gap-2 justify-center w-full px-4">
            <input
              type="number"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && userInput && handleSubmit()}
              className="w-24 text-center text-2xl font-bold border-2 border-purple-200 rounded-xl py-3 focus:border-purple-500 focus:outline-none bg-white"
              placeholder="?"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!userInput}
              className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-xl disabled:opacity-50 hover:scale-105 transition-transform shadow-lg"
            >
              ✓
            </button>
          </div>
        </>
      ) : (
        <div className={`w-full max-w-sm p-6 rounded-2xl text-center ${
          isCorrect ? 'bg-green-100' : 'bg-orange-100'
        }`}>
          <div className="text-4xl mb-2">{isCorrect ? '🎉' : '💪'}</div>
          <div className="text-2xl font-bold mb-2">
            {problem} = <span className={isCorrect ? 'text-green-600' : 'text-orange-600'}>{answer}</span>
          </div>
          <div className="text-sm">
            {isCorrect ? '⭐ Tuyệt vời! Nhanh quá!' : `Đáp án đúng là ${answer}`}
          </div>
        </div>
      )}
    </div>
  );
}

// Component: Bạn nhỏ (=5) / Bạn lớn (=10) - DÙNG BÀN TÍNH ẢO, TỰ ĐỘNG KIỂM TRA
function FriendPractice({ question, answer, friendOf, onAnswer, showResult, isCorrect, practiceIndex }) {
  const [currentValue, setCurrentValue] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Reset khi chuyển câu
  useEffect(() => {
    setCurrentValue(0);
    setSubmitted(false);
  }, [practiceIndex]);

  // Tự động kiểm tra khi gạt đúng
  const handleValueChange = (value) => {
    setCurrentValue(value);
    
    // Chỉ check khi user đã tương tác (value !== 0) để tránh auto-pass khi reset
    // Nếu đúng và chưa submit thì tự động báo đúng
    if (value !== 0 && value === answer && !submitted && !showResult) {
      setSubmitted(true);
      setTimeout(() => {
        onAnswer(value);
      }, 800);
    }
  };

  const friendColor = friendOf === 5 ? 'from-cyan-500 to-blue-500' : 'from-purple-500 to-pink-500';
  const bgColor = friendOf === 5 ? 'from-cyan-100 to-blue-100' : 'from-purple-100 to-pink-100';
  const isMatch = currentValue === answer;

  return (
    <div className="flex flex-col lg:flex-row gap-3 pb-4 lg:pb-0">
      {/* Question */}
      <div className={`lg:w-1/3 bg-gradient-to-r ${bgColor} rounded-xl p-3 flex-shrink-0`}>
        <div className="text-center mb-2">
          <span className="text-3xl">{friendOf === 5 ? '🖐️' : '🔟'}</span>
          <div className="text-sm font-bold text-gray-700">{friendOf === 5 ? 'Bạn nhỏ' : 'Bạn lớn'}</div>
        </div>
        
        {/* Câu hỏi */}
        <div className="text-center mb-3">
          <div className="text-lg text-gray-600 mb-1">{question}</div>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-4xl font-black bg-gradient-to-r ${friendColor} text-transparent bg-clip-text`}>?</span>
          </div>
        </div>

        {/* Hiển thị giá trị bàn tính */}
        <div className={`p-3 rounded-xl transition-all ${
          submitted || showResult
            ? 'bg-green-100 border-2 border-green-400'
            : isMatch 
                ? 'bg-green-50 border-2 border-green-300' 
                : 'bg-white/70'
          }`}>
          <div className="text-xs text-gray-500 mb-1 text-center">Gạt bàn tính:</div>
          <div className={`text-3xl font-black text-center transition-colors ${
            submitted || showResult || isMatch ? 'text-green-600' : 'text-gray-600'
          }`}>
            {currentValue}
            {(submitted || isMatch) && !showResult && (
              <span className="ml-2 text-green-500 animate-bounce inline-block">✓</span>
            )}
          </div>
        </div>

        {/* Kết quả */}
        {(submitted || showResult) && (
          <div className={`mt-3 py-2 rounded-lg text-center font-bold text-sm ${
            isCorrect ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'
          }`}>
            {isCorrect 
              ? `🎉 Đúng rồi! ${friendOf - answer} + ${answer} = ${friendOf}` 
              : `💪 Đáp án: ${answer}`
            }
          </div>
        )}

        {/* Visual hints */}
        <div className="mt-3 p-2 bg-white/50 rounded-lg">
          <div className="text-xs text-gray-500 text-center mb-1">💡 {friendOf === 5 ? 'Bạn nhỏ: cộng = 5' : 'Bạn lớn: cộng = 10'}</div>
          <div className="flex flex-wrap justify-center gap-1 text-xs">
            {friendOf === 5 ? (
              <>
                <span className="bg-cyan-100 text-cyan-700 rounded px-2 py-0.5 font-medium">1 ❤️ 4</span>
                <span className="bg-cyan-100 text-cyan-700 rounded px-2 py-0.5 font-medium">2 ❤️ 3</span>
              </>
            ) : (
              <>
                <span className="bg-purple-100 text-purple-700 rounded px-1.5 py-0.5 font-medium">1❤️9</span>
                <span className="bg-purple-100 text-purple-700 rounded px-1.5 py-0.5 font-medium">2❤️8</span>
                <span className="bg-purple-100 text-purple-700 rounded px-1.5 py-0.5 font-medium">3❤️7</span>
                <span className="bg-purple-100 text-purple-700 rounded px-1.5 py-0.5 font-medium">4❤️6</span>
                <span className="bg-purple-100 text-purple-700 rounded px-1.5 py-0.5 font-medium">5❤️5</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Soroban Board */}
      <div className="lg:w-2/3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-2 flex-shrink-0 flex items-center justify-center">
        <SorobanBoard 
          mode="free" 
          showHints={true} 
          resetKey={practiceIndex}
          onValueChange={handleValueChange}
        />
      </div>
    </div>
  );
}

// Component: Flash Card / Flash Anzan - Hiển thị số nhanh, tính tổng
function FlashcardPractice({ numbers, displayTime, answer, onAnswer, showResult, isCorrect, practiceIndex }) {
  const [phase, setPhase] = useState('ready'); // ready | showing | answer
  const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Thời gian hiển thị mỗi số (ms)
  const numberDisplayTime = displayTime || 1000;
  
  // Reset khi chuyển câu
  useEffect(() => {
    setPhase('ready');
    setCurrentNumberIndex(0);
    setUserInput('');
    setSubmitted(false);
  }, [practiceIndex]);

  // Bắt đầu hiển thị số
  const startFlash = () => {
    setPhase('showing');
    setCurrentNumberIndex(0);
  };

  // Hiển thị từng số
  useEffect(() => {
    if (phase !== 'showing') return;
    
    if (currentNumberIndex < numbers.length) {
      const timer = setTimeout(() => {
        setCurrentNumberIndex(prev => prev + 1);
      }, numberDisplayTime);
      return () => clearTimeout(timer);
    } else {
      // Đã hiển thị hết số, chuyển sang phase nhập đáp án
      setTimeout(() => {
        setPhase('answer');
      }, 300);
    }
  }, [phase, currentNumberIndex, numbers.length, numberDisplayTime]);

  const handleSubmit = () => {
    if (!userInput || submitted) return;
    setSubmitted(true);
    onAnswer(parseInt(userInput));
  };

  // Format số để hiển thị (thêm dấu + hoặc -)
  const formatNumber = (num, index) => {
    if (index === 0) return num.toString();
    return num >= 0 ? `+${num}` : num.toString();
  };

  return (
    <div className="flex flex-col items-center py-4">
      {/* Phase: Ready - Chuẩn bị */}
      {phase === 'ready' && !showResult && (
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="text-xl font-bold text-purple-600 mb-2">Flash Anzan</h3>
          <p className="text-gray-500 mb-4 text-sm">
            {numbers.length} số sẽ xuất hiện nhanh<br/>
            Hãy tính tổng của chúng!
          </p>
          <div className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-400">
            <span>⏱️ {(numberDisplayTime / 1000).toFixed(1)} giây / số</span>
          </div>
          <button
            onClick={startFlash}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-transform animate-pulse"
          >
            🚀 Bắt đầu!
          </button>
        </div>
      )}

      {/* Phase: Showing - Hiển thị số */}
      {phase === 'showing' && currentNumberIndex < numbers.length && (
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-4">
            Số {currentNumberIndex + 1} / {numbers.length}
          </div>
          <div className="w-48 h-48 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl shadow-xl">
            <span className={`text-6xl font-black ${numbers[currentNumberIndex] >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
              {formatNumber(numbers[currentNumberIndex], currentNumberIndex)}
            </span>
          </div>
          <div className="mt-4 flex justify-center gap-1">
            {numbers.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-3 h-3 rounded-full transition-all ${
                  idx < currentNumberIndex ? 'bg-green-400' : 
                  idx === currentNumberIndex ? 'bg-purple-500 scale-125' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Transition: Đã hiển thị hết số */}
      {phase === 'showing' && currentNumberIndex >= numbers.length && (
        <div className="text-center">
          <div className="text-5xl animate-bounce">🤔</div>
          <p className="text-gray-500 mt-2">Đang xử lý...</p>
        </div>
      )}

      {/* Phase: Answer - Nhập đáp án */}
      {phase === 'answer' && !showResult && !submitted && (
        <div className="text-center w-full px-4">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-600 mb-4">Tổng của {numbers.length} số là bao nhiêu?</p>
          
          <div className="flex gap-2 justify-center">
            <input
              type="number"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && userInput && handleSubmit()}
              className="w-24 text-center text-2xl font-bold border-2 border-purple-200 rounded-xl py-3 focus:border-purple-500 focus:outline-none bg-white"
              placeholder="?"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!userInput}
              className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-xl disabled:opacity-50 hover:scale-105 transition-transform shadow-lg"
            >
              ✓
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {(showResult || submitted) && (
        <div className={`w-full max-w-sm mx-auto p-4 rounded-2xl text-center shadow-lg ${
          isCorrect ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300' : 'bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-orange-300'
        }`}>
          <div className="text-5xl mb-3 animate-bounce">{isCorrect ? '🎉' : '💪'}</div>
          
          {/* Hiển thị phép tính */}
          <div className="text-base text-gray-700 mb-2 flex flex-wrap items-center justify-center gap-1">
            {numbers.map((n, i) => (
              <span key={i} className="inline-flex items-center">
                {i > 0 && <span className="mx-0.5 text-gray-500">{n >= 0 ? '+' : ''}</span>}
                <span className={`font-bold ${n >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{n}</span>
              </span>
            ))}
            <span className="mx-1 text-gray-500">=</span>
            <span className={`text-xl font-black ${isCorrect ? 'text-green-600' : 'text-orange-600'}`}>{answer}</span>
          </div>
          
          <div className={`text-sm font-bold py-2 px-3 rounded-lg ${
            isCorrect ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'
          }`}>
            {isCorrect 
              ? '⭐ Tuyệt vời! Trí nhớ siêu phàm!' 
              : `Đáp án đúng là ${answer}`
            }
          </div>
        </div>
      )}
    </div>
  );
}
