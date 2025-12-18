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
import { parseMultiplicationProblem } from '@/lib/soroban-multiplication-guide';
import { parseDivisionProblem } from '@/lib/soroban-division-guide';

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

export default function LessonPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
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

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLesson();
      fetchAllLessons(); // Lấy danh sách tất cả bài học trong level
      setStartTime(Date.now()); // Bắt đầu đếm thời gian
    }
  }, [levelId, lessonId, status]);

  const fetchLesson = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons/${levelId}?lessonId=${lessonId}`);
      const data = await res.json();
      if (data.lesson) {
        setLesson(data.lesson);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    }
    setLoading(false);
  };

  const fetchAllLessons = async () => {
    try {
      const res = await fetch(`/api/lessons?levelId=${levelId}`);
      const data = await res.json();
      if (data.lessons) {
        setAllLessons(data.lessons);
      }
    } catch (error) {
      console.error('Error fetching all lessons:', error);
    }
  };

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
      
      // Cập nhật thông tin kỷ lục và EXP
      if (data.success) {
        setIsNewRecord(data.isNewRecord);
        setPreviousBestStars(data.oldStars);
        setExpEarned(data.expEarned || 0);
        setExpBreakdown(data.expBreakdown || []);
        setLevelUpInfo(data.levelUp);
        
        // � OPTIMISTIC UPDATE: Dispatch với DATA (KHÔNG fetch server)
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
      // Nếu hết bài trong level, chuyển về trang learn
      router.push('/learn');
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
            onClick={() => router.push('/learn')}
            className="mt-4 px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600"
          >
            Quay lại
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

            {/* Nút hành động */}
            <div className="space-y-2">
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
                  onClick={() => router.push('/learn')}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <Home size={16} />
                  Menu
                </button>
              </div>
            </div>
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
            onClick={() => router.push('/learn')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-3 text-sm"
          >
            <ArrowLeft size={16} />
            🏠 Về trang chủ
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
              onClick={() => router.push('/learn')}
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
  const [submitted, setSubmitted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideSteps, setGuideSteps] = useState([]);
  const [currentGuideStep, setCurrentGuideStep] = useState(0);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [sorobanKey, setSorobanKey] = useState(0);

  // Reset khi chuyển câu
  useEffect(() => {
    setCurrentValue(0);
    setSubmitted(false);
    setShowGuide(false);
    setGuideSteps([]);
    setCurrentGuideStep(0);
    setStepCompleted(false);
    setSorobanKey(prev => prev + 1);
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

  // Kiểm tra khi học sinh làm đúng bước hiện tại
  const handleValueChange = (value) => {
    setCurrentValue(value);
    
    if (showGuide && guideSteps.length > 0) {
      const currentStep = guideSteps[currentGuideStep];
      const targetValue = currentStep?.demoValue;
      
      if (value === targetValue && !stepCompleted) {
        setStepCompleted(true);
        setTimeout(() => {
          if (currentGuideStep < guideSteps.length - 1) {
            setCurrentGuideStep(prev => prev + 1);
            setStepCompleted(false);
          } else {
            setSubmitted(true);
            setTimeout(() => onAnswer(value), 500);
          }
        }, 1000);
      }
    } else {
      if (value === answer && !submitted) {
        setSubmitted(true);
        setTimeout(() => onAnswer(value), 800);
      }
    }
  };

  const isMatch = currentValue === answer;
  const currentStep = guideSteps[currentGuideStep];
  const isStepMatch = showGuide && currentStep && currentValue === currentStep.demoValue;

  return (
    <div className="flex flex-col lg:flex-row gap-3 pb-4 lg:pb-0">
      {/* Đề bài + Hướng dẫn */}
      <div className="lg:w-1/3 flex flex-col gap-2 flex-shrink-0">
        {/* Phép tính */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-3">
          <div className="text-center mb-2">
            <span className="text-3xl font-black text-purple-600">{problem}</span>
            <span className="text-3xl font-bold text-gray-400 mx-2">=</span>
            <span className="text-3xl font-black text-purple-400">?</span>
          </div>

          {/* Kết quả trên bàn tính */}
          <div className={`p-2 rounded-xl transition-all ${
            submitted || isMatch ? 'bg-green-100 border-2 border-green-400' : 'bg-white/70'
          }`}>
            <div className="text-xs text-gray-500 text-center">Bàn tính của em: <span className={`text-xl font-black ${submitted || isMatch ? 'text-green-600' : 'text-gray-600'}`}>{currentValue}</span>
              {(submitted || isMatch) && <span className="ml-2 animate-bounce inline-block">✅</span>}
            </div>
          </div>

          {submitted && (
            <div className="mt-2 py-2 rounded-lg text-center font-bold text-sm bg-green-200 text-green-800">
              🎉 Đúng rồi! {problem} = {answer}
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
              className={`mt-2 w-full py-2 rounded-lg font-bold text-sm transition-all ${
                showGuide ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {showGuide ? '✕ Tự làm' : '📖 Xem hướng dẫn'}
            </button>
          )}
        </div>

        {/* Panel Hướng Dẫn - Cố định chiều cao để không giật */}
        {showGuide && !submitted && guideSteps.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
            {/* Header + Progress */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm">📖 Bước {currentGuideStep + 1}/{guideSteps.length}</span>
              <div className="flex gap-1">
                {guideSteps.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx < currentGuideStep ? 'bg-green-400 scale-110' : idx === currentGuideStep ? 'bg-yellow-400 animate-pulse' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Hướng dẫn - Tối ưu hiển thị */}
            <div className={`rounded-lg p-2 mb-2 transition-colors ${stepCompleted ? 'bg-green-400/30' : 'bg-white/10'}`}>
              <div className="flex items-start gap-2">
                <span className="text-xl flex-shrink-0 leading-none">{currentStep?.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm leading-tight">{currentStep?.title}</div>
                  <div className="text-[11px] text-white/90 whitespace-pre-line leading-snug mt-0.5">{currentStep?.instruction}</div>
                </div>
              </div>
              {stepCompleted && (
                <div className="text-center text-yellow-300 font-bold text-xs mt-1 animate-pulse">
                  ✨ Đúng! Chuyển bước tiếp...
                </div>
              )}
            </div>

            {/* Mini Soroban + Mục tiêu - Chỉ hiện khi KHÔNG phải bước giải thích */}
            {!currentStep?.skipCheck && (
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  <MiniSorobanDemo value={currentStep?.demoValue || 0} highlightColumn={currentStep?.column} />
                </div>
                <div className="flex-1 text-center bg-white/10 rounded-lg py-2 px-1">
                  <div className="text-xs text-white/60">🎯 Mục tiêu</div>
                  <div className="text-2xl font-black text-yellow-300">{currentStep?.demoValue}</div>
                  <div className={`text-sm mt-1 font-medium ${isStepMatch ? 'text-green-300' : 'text-white/80'}`}>
                    Em: <span className="font-bold">{currentValue}</span>
                    {isStepMatch && ' ✓'}
                  </div>
                </div>
              </div>
            )}

            {/* Nếu là bước giải thích, hiển thị nút tiếp tục */}
            {currentStep?.skipCheck && (
              <div className="text-center">
                <button
                  onClick={handleNextStep}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <span>Tiếp tục</span>
                  <ArrowRight size={20} />
                </button>
              </div>
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
      <div className={`lg:w-2/3 rounded-xl p-2 flex-shrink-0 transition-all flex flex-col justify-center ${
        stepCompleted ? 'bg-gradient-to-br from-green-100 to-emerald-100' : 'bg-gradient-to-br from-amber-50 to-orange-50'
      }`}>
        <div className={`text-center text-sm font-medium mb-1 py-1 rounded-lg ${
          showGuide ? stepCompleted ? 'text-green-700 bg-green-200' : 'text-blue-700 bg-blue-100' : 'text-gray-500'
        }`}>
          {showGuide
            ? stepCompleted
              ? '🎉 Tuyệt vời!'
              : currentStep?.skipCheck
                ? '📖 Đọc hướng dẫn phía bên trái'
                : `🎯 Gạt để được số ${currentStep?.demoValue}`
            : '🧮 Gạt bàn tính để tính!'
          }
        </div>
        <SorobanBoard 
          mode="free" 
          showHints={!showGuide} 
          resetKey={`${practiceIndex}-${sorobanKey}`}
          onValueChange={handleValueChange}
          highlightColumn={showGuide ? currentStep?.column : null}
        />
      </div>
    </div>
  );
}

// Helper: Hướng dẫn đặt 1 chữ số trên cột
function getDigitInstruction(digit, columnName) {
  if (digit === 0) return null;
  if (digit <= 4) {
    return `⬆️ Cột ${columnName}: Gạt ${digit} hạt đất LÊN (+${digit})`;
  } else if (digit === 5) {
    return `⬇️ Cột ${columnName}: Gạt hạt trời XUỐNG (+5)`;
  } else {
    return `⬇️ Cột ${columnName}: Gạt hạt trời XUỐNG (+5)\n⬆️ Cột ${columnName}: Gạt ${digit - 5} hạt đất LÊN (+${digit - 5})`;
  }
}

// Helper: Hướng dẫn cộng/trừ theo phương pháp Soroban
function getSorobanOperation(currentDigit, operand, operator, columnName) {
  // currentDigit: chữ số hiện tại trên cột (0-9)
  // operand: số cần cộng/trừ (1-9)
  // operator: '+' hoặc '-'
  // columnName: tên cột (Đơn vị, Chục, Trăm...)
  
  const result = operator === '+' ? currentDigit + operand : currentDigit - operand;
  const currentHeaven = currentDigit >= 5; // Có hạt trời không
  const currentEarth = currentDigit >= 5 ? currentDigit - 5 : currentDigit; // Số hạt đất
  
  let instructions = [];
  let needCarry = false; // Cần nhớ sang cột trái
  let needBorrow = false; // Cần mượn từ cột trái
  
  if (operator === '+') {
    // === PHÉP CỘNG ===
    if (result <= 9) {
      // Không cần nhớ
      const resultHeaven = result >= 5;
      const resultEarth = result >= 5 ? result - 5 : result;
      
      if (!currentHeaven && !resultHeaven) {
        // Case: 0-4 + x = 0-4 (chỉ thêm hạt đất)
        instructions.push(`⬆️ Cột ${columnName}: Gạt ${operand} hạt đất LÊN`);
      } else if (!currentHeaven && resultHeaven) {
        // Case: 0-4 + x = 5-9 (cần hạ hạt trời)
        // Công thức: +n = +5 - (5-n)
        const complement5 = 5 - operand;
        if (complement5 > 0 && currentEarth >= complement5) {
          // Ví dụ: 3 + 4 = 7 → +5, -2 hạt đất (bỏ bớt để còn 2 hạt đất)
          instructions.push(`⬇️ Cột ${columnName}: Gạt hạt trời XUỐNG (+5)`);
          instructions.push(`⬇️ Cột ${columnName}: Gạt ${complement5} hạt đất XUỐNG (-${complement5})`);
        } else if (complement5 <= 0) {
          // Ví dụ: 0 + 5 = 5 → +5 only
          // Ví dụ: 0 + 6 = 6 → +5, +1 hạt đất
          instructions.push(`⬇️ Cột ${columnName}: Gạt hạt trời XUỐNG (+5)`);
          if (resultEarth > currentEarth) {
            instructions.push(`⬆️ Cột ${columnName}: Gạt ${resultEarth - currentEarth} hạt đất LÊN (+${resultEarth - currentEarth})`);
          }
        } else {
          // Fallback: just add earth beads
          instructions.push(`⬆️ Cột ${columnName}: Gạt ${operand} hạt đất LÊN`);
        }
      } else if (currentHeaven && resultHeaven) {
        // Case: 5-9 + x = 5-9 (chỉ thêm hạt đất)
        if (resultEarth > currentEarth) {
          instructions.push(`⬆️ Cột ${columnName}: Gạt ${resultEarth - currentEarth} hạt đất LÊN`);
        }
      }
    } else {
      // result >= 10: Cần nhớ
      needCarry = true;
      const onesDigit = result - 10;
      const resultHeaven = onesDigit >= 5;
      const resultEarth = onesDigit >= 5 ? onesDigit - 5 : onesDigit;
      
      // Hướng dẫn chi tiết từng bước cho phép nhớ
      // Công thức: +n = -complement10 (tại cột này) + 10 (sang cột trái)
      const complement10 = 10 - operand;
      
      // Bước 1: Trừ bớt complement10 tại cột hiện tại
      if (complement10 > 0) {
        // Cần trừ bớt complement10
        const afterSub = currentDigit - complement10;
        if (currentHeaven && afterSub < 5) {
          // Cần gạt hạt trời lên trước
          instructions.push(`⬆️ Cột ${columnName}: Gạt hạt trời LÊN (-5)`);
          if (complement10 - 5 < currentEarth) {
            // Còn cần gạt thêm hạt đất lên (bù lại)
            const earthToAdd = currentEarth - (complement10 - 5);
            if (earthToAdd > 0) {
              instructions.push(`⬆️ Cột ${columnName}: Gạt ${earthToAdd} hạt đất LÊN (+${earthToAdd})`);
            }
          }
        } else if (currentHeaven) {
          // Chỉ cần gạt hạt đất xuống
          instructions.push(`⬇️ Cột ${columnName}: Gạt ${complement10} hạt đất XUỐNG (-${complement10})`);
        } else {
          // Không có hạt trời, gạt hạt đất xuống
          if (currentEarth >= complement10) {
            instructions.push(`⬇️ Cột ${columnName}: Gạt ${complement10} hạt đất XUỐNG (-${complement10})`);
          } else {
            // Cần xử lý đặc biệt: complement10 > currentEarth
            // Ví dụ: 3 + 8 = 11 → complement10 = 2, currentEarth = 3
            // Gạt 2 hạt đất xuống
            instructions.push(`⬇️ Cột ${columnName}: Gạt ${complement10} hạt đất XUỐNG (-${complement10})`);
          }
        }
      } else if (complement10 === 0) {
        // Ví dụ: 5 + 10 - không cần trừ gì, chỉ cần reset cột này về 0
        if (currentHeaven) {
          instructions.push(`⬆️ Cột ${columnName}: Gạt hạt trời LÊN (-5)`);
        }
        if (currentEarth > 0) {
          instructions.push(`⬇️ Cột ${columnName}: Gạt ${currentEarth} hạt đất XUỐNG (-${currentEarth})`);
        }
      }
      
      // Bước 2: Thêm 1 vào cột bên trái
      instructions.push(`➕ Cột bên trái: Thêm 1 (+10)`);
    }
  } else {
    // === PHÉP TRỪ ===
    if (result >= 0) {
      // Không cần mượn
      const resultHeaven = result >= 5;
      const resultEarth = result >= 5 ? result - 5 : result;
      
      if (currentHeaven && resultHeaven) {
        // Case: 5-9 - x = 5-9 (chỉ gạt hạt đất xuống)
        if (currentEarth > resultEarth) {
          instructions.push(`⬇️ Cột ${columnName}: Gạt ${currentEarth - resultEarth} hạt đất XUỐNG (-${currentEarth - resultEarth})`);
        }
      } else if (currentHeaven && !resultHeaven) {
        // Case: 5-9 - x = 0-4 (cần đưa hạt trời lên)
        // Công thức: -n = -5 + (5-n)
        const complement5 = 5 - operand;
        if (complement5 >= 0) {
          instructions.push(`⬆️ Cột ${columnName}: Gạt hạt trời LÊN (-5)`);
          if (complement5 > 0) {
            instructions.push(`⬆️ Cột ${columnName}: Gạt ${complement5} hạt đất LÊN (+${complement5})`);
          }
        } else {
          // complement5 < 0, tức operand > 5
          // Ví dụ: 8 - 6 = 2 → gạt hạt trời lên (-5), gạt 1 hạt đất xuống (-1)
          instructions.push(`⬆️ Cột ${columnName}: Gạt hạt trời LÊN (-5)`);
          const extraDown = operand - 5;
          if (extraDown > 0) {
            instructions.push(`⬇️ Cột ${columnName}: Gạt ${extraDown} hạt đất XUỐNG (-${extraDown})`);
          }
        }
      } else if (!currentHeaven && !resultHeaven) {
        // Case: 0-4 - x = 0-4 (chỉ gạt hạt đất xuống)
        if (currentEarth >= operand) {
          instructions.push(`⬇️ Cột ${columnName}: Gạt ${operand} hạt đất XUỐNG (-${operand})`);
        }
      }
    } else {
      // result < 0: Cần mượn từ cột trái
      needBorrow = true;
      const actualResult = result + 10; // 0-9
      const complement10 = 10 - operand; // Số cần thêm vào cột này
      const resultHeaven = actualResult >= 5;
      const resultEarth = actualResult >= 5 ? actualResult - 5 : actualResult;
      
      // Bước 1: Mượn 1 từ cột bên trái
      instructions.push(`➖ Cột bên trái: Bớt 1 (mượn 10)`);
      
      // Bước 2: Thêm complement10 vào cột này để đạt kết quả
      // Từ currentDigit + 10 - operand = actualResult
      // Cần thao tác từ currentDigit → actualResult
      if (!currentHeaven && resultHeaven) {
        // Cần hạ hạt trời
        instructions.push(`⬇️ Cột ${columnName}: Gạt hạt trời XUỐNG (+5)`);
        if (resultEarth > currentEarth) {
          instructions.push(`⬆️ Cột ${columnName}: Gạt ${resultEarth - currentEarth} hạt đất LÊN (+${resultEarth - currentEarth})`);
        } else if (resultEarth < currentEarth) {
          instructions.push(`⬇️ Cột ${columnName}: Gạt ${currentEarth - resultEarth} hạt đất XUỐNG (-${currentEarth - resultEarth})`);
        }
      } else if (!currentHeaven && !resultHeaven) {
        // Chỉ cần thêm hạt đất
        if (resultEarth > currentEarth) {
          instructions.push(`⬆️ Cột ${columnName}: Gạt ${resultEarth - currentEarth} hạt đất LÊN (+${resultEarth - currentEarth})`);
        }
      } else if (currentHeaven && resultHeaven) {
        // Giữ hạt trời, thêm hạt đất
        if (resultEarth > currentEarth) {
          instructions.push(`⬆️ Cột ${columnName}: Gạt ${resultEarth - currentEarth} hạt đất LÊN (+${resultEarth - currentEarth})`);
        }
      } else if (currentHeaven && !resultHeaven) {
        // Gạt hạt trời lên, điều chỉnh hạt đất
        instructions.push(`⬆️ Cột ${columnName}: Gạt hạt trời LÊN (-5)`);
        if (resultEarth > 0) {
          instructions.push(`⬆️ Cột ${columnName}: Gạt ${resultEarth} hạt đất LÊN (+${resultEarth})`);
        }
      }
    }
  }
  
  return { instructions, needCarry, needBorrow, result };
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

  // Nếu không phải cộng/trừ/nhân/chia
  if (!match) {
    return [{
      emoji: '🎯',
      title: `Tính ${problem}`,
      instruction: `Gạt bàn tính để được kết quả ${answer}`,
      demoValue: answer,
      column: 8
    }];
  }

  const num1 = parseInt(match[1]);
  const operator = match[2];
  const num2 = parseInt(match[3]);
  const result = operator === '+' ? num1 + num2 : num1 - num2;

  // Phân tích chữ số
  const tens1 = Math.floor(num1 / 10);
  const ones1 = num1 % 10;
  const tensResult = Math.floor(result / 10);
  const onesResult = result % 10;

  // Helper: Lấy emoji số
  const getStepEmoji = (num) => {
    const emojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    return emojis[num] || `${num}`;
  };

  // ========== BƯỚC ĐẶT SỐ ĐẦU TIÊN ==========
  if (num1 > 0) {
    // Nếu số có 2 chữ số, tách thành 2 bước
    if (num1 >= 10 && tens1 > 0) {
      // Bước đặt hàng chục
      let tensInst = '';
      let tensValue = tens1 * 10;
      if (tens1 <= 4) {
        tensInst = `⬆️ Cột Chục: Gạt ${tens1} hạt đất LÊN (+${tens1 * 10})`;
      } else if (tens1 === 5) {
        tensInst = `⬇️ Cột Chục: Gạt hạt trời XUỐNG (+50)`;
      } else {
        tensInst = `⬇️ Cột Chục: Gạt hạt trời XUỐNG (+50)\n⬆️ Cột Chục: Gạt ${tens1 - 5} hạt đất LÊN (+${(tens1 - 5) * 10})`;
      }
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `Đặt hàng Chục: ${tens1}`,
        instruction: tensInst,
        demoValue: tensValue,
        column: 7
      });
    }

    // Bước đặt hàng đơn vị (nếu có)
    if (ones1 > 0) {
      let onesInst = '';
      if (ones1 <= 4) {
        onesInst = `⬆️ Cột Đơn vị: Gạt ${ones1} hạt đất LÊN (+${ones1})`;
      } else if (ones1 === 5) {
        onesInst = `⬇️ Cột Đơn vị: Gạt hạt trời XUỐNG (+5)`;
      } else {
        onesInst = `⬇️ Cột Đơn vị: Gạt hạt trời XUỐNG (+5)\n⬆️ Cột Đơn vị: Gạt ${ones1 - 5} hạt đất LÊN (+${ones1 - 5})`;
      }
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `Đặt số ${num1}`,
        instruction: onesInst,
        demoValue: num1,
        column: 8
      });
    } else if (num1 < 10) {
      // Số đơn lẻ, chưa có bước nào
      let onesInst = '';
      if (ones1 === 0) {
        onesInst = 'Bàn tính trống (số 0)';
      } else if (ones1 <= 4) {
        onesInst = `⬆️ Cột Đơn vị: Gạt ${ones1} hạt đất LÊN (+${ones1})`;
      } else if (ones1 === 5) {
        onesInst = `⬇️ Cột Đơn vị: Gạt hạt trời XUỐNG (+5)`;
      } else {
        onesInst = `⬇️ Cột Đơn vị: Gạt hạt trời XUỐNG (+5)\n⬆️ Cột Đơn vị: Gạt ${ones1 - 5} hạt đất LÊN (+${ones1 - 5})`;
      }
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `Đặt số ${num1}`,
        instruction: onesInst,
        demoValue: num1,
        column: 8
      });
    } else {
      // num1 >= 10 nhưng ones1 === 0, đã thêm bước chục rồi
      // Cập nhật title của bước trước
      if (steps.length > 0) {
        steps[steps.length - 1].title = `Đặt số ${num1}`;
        steps[steps.length - 1].demoValue = num1;
      }
    }
  } else {
    // num1 === 0
    steps.push({
      emoji: getStepEmoji(stepNumber++),
      title: `Đặt số 0`,
      instruction: 'Bàn tính trống (số 0)',
      demoValue: 0,
      column: 8
    });
  }

  // ========== BƯỚC THỰC HIỆN PHÉP TÍNH ==========
  // Phân tích chi tiết từng thao tác với demoValue trung gian
  
  if (operator === '+') {
    // === PHÉP CỘNG ===
    const sumOnes = ones1 + num2;
    
    if (num2 < 10 && sumOnes <= 9) {
      // Không cần nhớ - một bước đơn giản
      let addInst = '';
      const currentHeaven = ones1 >= 5;
      const resultHeaven = sumOnes >= 5;
      
      if (!currentHeaven && !resultHeaven) {
        // 0-4 + x = 0-4: chỉ thêm hạt đất
        addInst = `⬆️ Cột Đơn vị: Gạt ${num2} hạt đất LÊN (+${num2})`;
      } else if (!currentHeaven && resultHeaven) {
        // 0-4 + x = 5-9: dùng công thức bạn 5
        const complement5 = 5 - num2;
        if (complement5 > 0 && (ones1 >= complement5)) {
          addInst = `⬇️ Cột Đơn vị: Gạt hạt trời XUỐNG (+5)\n⬇️ Cột Đơn vị: Gạt ${complement5} hạt đất XUỐNG (-${complement5})`;
        } else {
          addInst = `⬇️ Cột Đơn vị: Gạt hạt trời XUỐNG (+5)`;
          const earthToAdd = sumOnes - 5 - ones1;
          if (earthToAdd > 0) {
            addInst += `\n⬆️ Cột Đơn vị: Gạt ${earthToAdd} hạt đất LÊN (+${earthToAdd})`;
          }
        }
      } else if (currentHeaven && resultHeaven) {
        // 5-9 + x = 5-9: chỉ thêm hạt đất
        const earthToAdd = sumOnes - ones1;
        if (earthToAdd > 0) {
          addInst = `⬆️ Cột Đơn vị: Gạt ${earthToAdd} hạt đất LÊN (+${earthToAdd})`;
        }
      }
      
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `Cộng ${num2}`,
        instruction: addInst + `\n\n${num1} + ${num2} = ${result}`,
        demoValue: result,
        column: 8
      });
    } else if (num2 < 10 && sumOnes >= 10) {
      // CẦN NHỚ - TÁCH THÀNH NHIỀU BƯỚC
      // NGUYÊN TẮC SOROBAN: Xử lý cột hiện tại TRƯỚC, rồi mới nhớ sang cột trái
      // Công thức "bạn 10": +n = -bù10 (ở cột này) + 1 (ở cột trái, tương đương +10)
      // Trong đó: bù10 = 10 - n
      
      // Trường hợp đặc biệt: 5 + 5 = 10
      // Công thức: +5 = -5 (gạt hạt trời lên) + 10 (gạt 1 hạt đất lên ở chục)
      if (ones1 === 5 && num2 === 5) {
        // Bước 1: Cột Đơn vị - Gạt hạt trời LÊN (-5)
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Cộng 5 (trừ bù ở Đơn vị)`,
          instruction: `⬆️ Cột Đơn vị: Gạt hạt trời LÊN (-5)`,
          demoValue: num1 - 5, // 5 - 5 = 0
          column: 8
        });
        
        // Bước 2: Cột Chục - Gạt 1 hạt đất LÊN (+10)
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Nhớ 1 sang Chục`,
          instruction: `⬆️ Cột Chục: Gạt 1 hạt đất LÊN (+10)\n\n${num1} + ${num2} = ${result}`,
          demoValue: result, // 0 + 10 = 10
          column: 7
        });
      } else if (ones1 >= 5 && num2 >= 5) {
        // Ví dụ: 6 + 7 = 13, 8 + 5 = 13
        // Có hạt trời ở đơn vị và cộng số >= 5
        const complement10 = 10 - num2;
        
        // Bước 1: Trừ bớt complement10 ở cột Đơn vị TRƯỚC
        if (complement10 > 0) {
          const afterSub = ones1 - complement10;
          let subInst = '';
          if (ones1 >= 5 && afterSub < 5) {
            // Cần gạt hạt trời lên
            subInst = `⬆️ Cột Đơn vị: Gạt hạt trời LÊN (-5)`;
            const earthToAdd = afterSub;
            if (earthToAdd > 0) {
              subInst += `\n⬆️ Cột Đơn vị: Gạt ${earthToAdd} hạt đất LÊN (+${earthToAdd})`;
            }
          } else if (ones1 >= 5) {
            // Chỉ gạt hạt đất xuống
            subInst = `⬇️ Cột Đơn vị: Gạt ${complement10} hạt đất XUỐNG (-${complement10})`;
          } else {
            subInst = `⬇️ Cột Đơn vị: Gạt ${complement10} hạt đất XUỐNG (-${complement10})`;
          }
          
          steps.push({
            emoji: getStepEmoji(stepNumber++),
            title: `Trừ bù ${complement10} ở Đơn vị`,
            instruction: subInst,
            demoValue: num1 - complement10,
            column: 8
          });
        }
        
        // Bước 2: Nhớ 1 vào cột Chục SAU
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Nhớ 1 sang Chục`,
          instruction: `⬆️ Cột Chục: Gạt 1 hạt đất LÊN (+10)\n\n${num1} + ${num2} = ${result}`,
          demoValue: result,
          column: 7
        });
      } else if (ones1 < 5) {
        // ones1 < 5 nhưng ones1 + num2 >= 10
        // Ví dụ: 3 + 8 = 11, 4 + 7 = 11
        const complement10 = 10 - num2;
        
        // Bước 1: Trừ bớt complement10 ở cột Đơn vị TRƯỚC (nếu có)
        if (complement10 > 0 && ones1 >= complement10) {
          steps.push({
            emoji: getStepEmoji(stepNumber++),
            title: `Trừ bù ${complement10} ở Đơn vị`,
            instruction: `⬇️ Cột Đơn vị: Gạt ${complement10} hạt đất XUỐNG (-${complement10})`,
            demoValue: num1 - complement10,
            column: 8
          });
        }
        
        // Bước: Thêm 1 vào cột Chục
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Nhớ 1 sang Chục`,
          instruction: `⬆️ Cột Chục: Gạt 1 hạt đất LÊN (+10)\n\n${num1} + ${num2} = ${result}`,
          demoValue: result,
          column: 7
        });
      } else {
        // TRƯỜNG HỢP CÒN LẠI: ones1 >= 5 && num2 < 5 && sumOnes >= 10
        // Ví dụ: 9 + 1 = 10, 8 + 2 = 10, 7 + 3 = 10, 7 + 4 = 11, 8 + 3 = 11, etc.
        // Công thức: +n = -(10-n) + 10
        const complement10 = 10 - num2;
        const afterSub = ones1 - complement10; // Kết quả cột đơn vị sau khi trừ bù
        
        // Bước 1: Trừ bù complement10 ở cột Đơn vị TRƯỚC
        let subInst = '';
        if (afterSub >= 5) {
          // Vẫn có hạt trời sau khi trừ → chỉ gạt hạt đất xuống
          subInst = `⬇️ Cột Đơn vị: Gạt ${complement10} hạt đất XUỐNG (-${complement10})`;
        } else if (ones1 >= 5) {
          // Mất hạt trời sau khi trừ → gạt hạt trời lên, có thể cần gạt hạt đất lên
          subInst = `⬆️ Cột Đơn vị: Gạt hạt trời LÊN (-5)`;
          if (afterSub > 0) {
            subInst += `\n⬆️ Cột Đơn vị: Gạt ${afterSub} hạt đất LÊN (+${afterSub})`;
          }
        }
        
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Trừ bù ${complement10} ở Đơn vị`,
          instruction: subInst,
          demoValue: num1 - complement10,
          column: 8
        });
        
        // Bước 2: Nhớ 1 vào cột Chục SAU
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Nhớ 1 sang Chục`,
          instruction: `⬆️ Cột Chục: Gạt 1 hạt đất LÊN (+10)\n\n${num1} + ${num2} = ${result}`,
          demoValue: result,
          column: 7
        });
      }
    } else if (num2 >= 10) {
      // Số cộng có 2 chữ số - xử lý riêng
      const tens2 = Math.floor(num2 / 10);
      const ones2 = num2 % 10;
      
      // Thêm hàng chục trước
      if (tens2 > 0) {
        let tensInst = '';
        if (tens2 <= 4) {
          tensInst = `⬆️ Cột Chục: Gạt ${tens2} hạt đất LÊN (+${tens2 * 10})`;
        } else if (tens2 === 5) {
          tensInst = `⬇️ Cột Chục: Gạt hạt trời XUỐNG (+50)`;
        } else {
          tensInst = `⬇️ Cột Chục: Gạt hạt trời XUỐNG (+50)\n⬆️ Cột Chục: Gạt ${tens2 - 5} hạt đất LÊN (+${(tens2 - 5) * 10})`;
        }
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Cộng ${tens2 * 10}`,
          instruction: tensInst,
          demoValue: num1 + tens2 * 10,
          column: 7
        });
      }
      
      // Thêm hàng đơn vị
      if (ones2 > 0) {
        const currentOnes = ones1;
        const newSum = currentOnes + ones2;
        let onesInst = '';
        
        if (newSum <= 9) {
          onesInst = `⬆️ Cột Đơn vị: Gạt ${ones2} hạt đất LÊN (+${ones2})`;
        } else {
          // Cần nhớ
          onesInst = `Cộng ${ones2} có nhớ (xem chi tiết trên)`;
        }
        
        steps.push({
          emoji: getStepEmoji(stepNumber++),
          title: `Cộng ${ones2}`,
          instruction: onesInst + `\n\n${num1} + ${num2} = ${result}`,
          demoValue: result,
          column: 8
        });
      }
    }
  } else {
    // === PHÉP TRỪ ===
    const diffOnes = ones1 - num2;
    
    if (num2 < 10 && diffOnes >= 0) {
      // Không cần mượn
      let subInst = '';
      const currentHeaven = ones1 >= 5;
      const resultHeaven = diffOnes >= 5;
      
      if (currentHeaven && resultHeaven) {
        // 5-9 - x = 5-9: chỉ gạt hạt đất xuống
        const earthToRemove = ones1 - diffOnes;
        if (earthToRemove > 0) {
          subInst = `⬇️ Cột Đơn vị: Gạt ${earthToRemove} hạt đất XUỐNG (-${earthToRemove})`;
        }
      } else if (currentHeaven && !resultHeaven) {
        // 5-9 - x = 0-4: dùng công thức bạn 5
        const complement5 = 5 - num2;
        if (complement5 >= 0) {
          subInst = `⬆️ Cột Đơn vị: Gạt hạt trời LÊN (-5)`;
          if (complement5 > 0) {
            subInst += `\n⬆️ Cột Đơn vị: Gạt ${complement5} hạt đất LÊN (+${complement5})`;
          }
        } else {
          subInst = `⬆️ Cột Đơn vị: Gạt hạt trời LÊN (-5)`;
          const extraDown = num2 - 5;
          if (extraDown > 0) {
            subInst += `\n⬇️ Cột Đơn vị: Gạt ${extraDown} hạt đất XUỐNG (-${extraDown})`;
          }
        }
      } else if (!currentHeaven && !resultHeaven) {
        // 0-4 - x = 0-4: chỉ gạt hạt đất xuống
        subInst = `⬇️ Cột Đơn vị: Gạt ${num2} hạt đất XUỐNG (-${num2})`;
      }
      
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `Trừ ${num2}`,
        instruction: subInst + `\n\n${num1} - ${num2} = ${result}`,
        demoValue: result,
        column: 8
      });
    } else if (num2 < 10 && diffOnes < 0) {
      // CẦN MƯỢN - NGUYÊN TẮC: Xử lý cột hiện tại TRƯỚC, rồi mới mượn từ cột trái
      // Công thức "bạn 10": -n = +bù10 (ở cột này) - 1 (ở cột trái, tương đương -10)
      // Trong đó: bù10 = 10 - n
      const actualResult = diffOnes + 10;
      const complement10 = 10 - num2;
      
      // Bước 1: Thêm bù10 vào cột Đơn vị TRƯỚC
      let addInst = '';
      const currentEarth = ones1 >= 5 ? ones1 - 5 : ones1;
      const currentHeaven = ones1 >= 5;
      const resultHeaven = actualResult >= 5;
      
      // Tính toán cách gạt để đạt actualResult từ ones1
      if (!currentHeaven && resultHeaven) {
        // Cần hạ hạt trời xuống
        addInst = `⬇️ Cột Đơn vị: Gạt hạt trời XUỐNG (+5)`;
        const resultEarth = actualResult - 5;
        if (resultEarth > currentEarth) {
          addInst += `\n⬆️ Cột Đơn vị: Gạt ${resultEarth - currentEarth} hạt đất LÊN (+${resultEarth - currentEarth})`;
        } else if (resultEarth < currentEarth) {
          addInst += `\n⬇️ Cột Đơn vị: Gạt ${currentEarth - resultEarth} hạt đất XUỐNG (-${currentEarth - resultEarth})`;
        }
      } else if (!currentHeaven && !resultHeaven) {
        // Chỉ cần thêm hạt đất
        const earthToAdd = actualResult - ones1;
        if (earthToAdd > 0) {
          addInst = `⬆️ Cột Đơn vị: Gạt ${earthToAdd} hạt đất LÊN (+${earthToAdd})`;
        }
      } else if (currentHeaven && resultHeaven) {
        // Giữ hạt trời, điều chỉnh hạt đất
        const resultEarth = actualResult - 5;
        if (resultEarth > currentEarth) {
          addInst = `⬆️ Cột Đơn vị: Gạt ${resultEarth - currentEarth} hạt đất LÊN (+${resultEarth - currentEarth})`;
        }
      } else if (currentHeaven && !resultHeaven) {
        // Gạt hạt trời lên, điều chỉnh hạt đất
        addInst = `⬆️ Cột Đơn vị: Gạt hạt trời LÊN (-5)`;
        if (actualResult > 0) {
          addInst += `\n⬆️ Cột Đơn vị: Gạt ${actualResult} hạt đất LÊN (+${actualResult})`;
        }
      }
      
      // Nếu không có instruction cụ thể, dùng công thức đơn giản
      if (!addInst) {
        addInst = `⬆️ Cột Đơn vị: Cộng bù ${complement10} (+${complement10})`;
      }
      
      // QUAN TRỌNG: demoValue sau bước cộng bù = giá trị bàn tính thực tế
      // = (hàng chục * 10) + actualResult (kết quả cột đơn vị sau cộng bù)
      // VÍ DỤ: 12 - 5: ones1=2, complement10=5, actualResult=7
      // Sau cộng bù: bàn tính = 10 + 7 = 17 (chưa mượn từ chục)
      const step1DemoValue = (tens1 * 10) + actualResult;
      
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `Cộng bù ${complement10} ở Đơn vị`,
        instruction: addInst,
        demoValue: step1DemoValue, // Giá trị bàn tính sau khi cộng bù (chưa mượn từ cột chục)
        column: 8
      });
      
      // Bước 2: Mượn 1 từ cột Chục SAU
      steps.push({
        emoji: getStepEmoji(stepNumber++),
        title: `Mượn 1 từ Chục`,
        instruction: `⬇️ Cột Chục: Gạt 1 hạt đất XUỐNG (-10)\n\n${num1} - ${num2} = ${result}`,
        demoValue: result,
        column: 7
      });
    }
  }

  // ========== BƯỚC HOÀN THÀNH ==========
  steps.push({
    emoji: '✅',
    title: `Hoàn thành!`,
    instruction: `Bàn tính hiện số ${result}.\nĐó là kết quả của ${problem}!`,
    demoValue: result,
    column: result >= 10 ? 7 : 8
  });

  return steps;
}

// Component: Khám phá tự do - có kiểm tra kết quả
function ExplorePractice({ instruction, target, onComplete, onAnswer, practiceIndex }) {
  const [explored, setExplored] = useState(false);
  const [currentValue, setCurrentValue] = useState(0);

  // Reset khi chuyển câu
  useEffect(() => {
    setExplored(false);
    setCurrentValue(0);
  }, [practiceIndex]);

  // Kiểm tra kết quả khi Soroban thay đổi - TỰ ĐỘNG CHUYỂN KHI ĐÚNG
  const handleSorobanChange = (value) => {
    setCurrentValue(value);
    
    // Nếu đúng và chưa explored thì tự động submit
    if (target !== undefined && value === target && !explored) {
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
    
    // Nếu đúng và chưa submit thì tự động báo đúng
    if (value === answer && !submitted && !showResult) {
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
