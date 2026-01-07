'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NARRATOR, getRandomLine } from '@/config/narrative.config';

/**
 * 🎭 NARRATOR BOX - Component hiển thị lời dẫn chuyện
 * 
 * Hiển thị Cú Soro nói chuyện với hiệu ứng typing
 * Có thể phát audio (nếu có)
 */
export function NarratorBox({
  lines = [],
  autoPlay = true,
  showCharacter = true,
  size = 'medium', // small, medium, large
  position = 'bottom', // top, bottom, center, floating
  onComplete,
  onSkip,
  className = ''
}) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const typingRef = useRef(null);
  const audioRef = useRef(null);

  // Lấy line hiện tại
  const currentLine = Array.isArray(lines) 
    ? lines[currentLineIndex] 
    : lines;

  // Typing effect
  useEffect(() => {
    if (!currentLine || !autoPlay) return;

    setIsTyping(true);
    setDisplayedText('');
    let index = 0;

    typingRef.current = setInterval(() => {
      if (index < currentLine.length) {
        setDisplayedText(prev => prev + currentLine[index]);
        index++;
      } else {
        clearInterval(typingRef.current);
        setIsTyping(false);
      }
    }, 30); // Tốc độ typing

    return () => {
      if (typingRef.current) {
        clearInterval(typingRef.current);
      }
    };
  }, [currentLine, autoPlay, currentLineIndex]);

  // Handle next line
  const handleNext = useCallback(() => {
    if (isTyping) {
      // Skip typing, show full text
      clearInterval(typingRef.current);
      setDisplayedText(currentLine);
      setIsTyping(false);
      return;
    }

    if (Array.isArray(lines) && currentLineIndex < lines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
      onComplete?.();
    }
  }, [isTyping, currentLine, lines, currentLineIndex, onComplete]);

  // Handle skip all
  const handleSkip = useCallback(() => {
    clearInterval(typingRef.current);
    setIsComplete(true);
    onSkip?.();
    onComplete?.();
  }, [onSkip, onComplete]);

  // Size classes
  const sizeClasses = {
    small: 'p-3 text-sm',
    medium: 'p-4 text-base',
    large: 'p-5 text-lg'
  };

  // Position classes
  const positionClasses = {
    top: 'top-4 left-4 right-4',
    bottom: 'bottom-4 left-4 right-4',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg',
    floating: 'bottom-20 left-4 right-4'
  };

  if (!lines || lines.length === 0) return null;

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`
            fixed z-50 
            ${positionClasses[position]}
            ${className}
          `}
        >
          <div className={`
            bg-gradient-to-br from-amber-50 to-orange-50
            border-2 border-amber-300
            rounded-2xl shadow-xl
            ${sizeClasses[size]}
          `}>
            {/* Character avatar & name */}
            {showCharacter && (
              <div className="flex items-center gap-2 mb-2">
                <motion.span 
                  className="text-3xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {NARRATOR.emoji}
                </motion.span>
                <span className="font-bold text-amber-800">
                  {NARRATOR.name}
                </span>
              </div>
            )}

            {/* Speech text */}
            <div className="text-amber-900 leading-relaxed min-h-[3rem]">
              {displayedText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="ml-1"
                >
                  |
                </motion.span>
              )}
            </div>

            {/* Progress dots */}
            {Array.isArray(lines) && lines.length > 1 && (
              <div className="flex justify-center gap-1 mt-3">
                {lines.map((_, i) => (
                  <div
                    key={i}
                    className={`
                      w-2 h-2 rounded-full transition-colors
                      ${i <= currentLineIndex ? 'bg-amber-500' : 'bg-amber-200'}
                    `}
                  />
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-between items-center mt-3">
              <button
                onClick={handleSkip}
                className="text-amber-600 text-sm hover:text-amber-800 transition-colors"
              >
                Bỏ qua
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
              >
                {isTyping ? 'Hiện hết' : 
                  (Array.isArray(lines) && currentLineIndex < lines.length - 1) 
                    ? 'Tiếp →' 
                    : 'Bắt đầu! ✨'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * 🦉 GUIDE BUBBLE - Bong bóng nói nhỏ gọn
 * Dùng cho feedback nhanh trong game
 */
export function GuideBubble({
  message,
  type = 'normal', // normal, success, warning, error
  duration = 3000,
  position = 'top-right',
  onDismiss
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const typeClasses = {
    normal: 'bg-amber-50 border-amber-300 text-amber-900',
    success: 'bg-green-50 border-green-300 text-green-900',
    warning: 'bg-orange-50 border-orange-300 text-orange-900',
    error: 'bg-red-50 border-red-300 text-red-900'
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  if (!message || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        className={`
          fixed z-50 ${positionClasses[position]}
          ${typeClasses[type]}
          border-2 rounded-xl p-3 shadow-lg
          max-w-xs
        `}
      >
        <div className="flex items-start gap-2">
          <span className="text-xl flex-shrink-0">{NARRATOR.emoji}</span>
          <p className="text-sm leading-snug">{message}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * 🎬 STORY INTRO - Màn hình giới thiệu câu chuyện
 * Dùng khi vào zone mới hoặc bắt đầu game
 */
export function StoryIntro({
  title,
  subtitle,
  hookLines = [],
  actionLines = [],
  backgroundImage,
  onStart,
  onSkip
}) {
  const [phase, setPhase] = useState('hook'); // hook, action, ready
  const [currentLines, setCurrentLines] = useState(hookLines);

  const handleNarratorComplete = useCallback(() => {
    if (phase === 'hook' && actionLines.length > 0) {
      setPhase('action');
      setCurrentLines(actionLines);
    } else {
      setPhase('ready');
    }
  }, [phase, actionLines]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      {/* Background */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl p-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-white/80">{subtitle}</p>
          )}
        </motion.div>

        {/* Narrator */}
        {phase !== 'ready' ? (
          <NarratorBox
            lines={currentLines}
            position="center"
            size="large"
            onComplete={handleNarratorComplete}
            onSkip={() => setPhase('ready')}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="
                px-8 py-4 
                bg-gradient-to-r from-amber-500 to-orange-500
                text-white text-xl font-bold
                rounded-2xl shadow-xl
                hover:shadow-2xl transition-shadow
              "
            >
              🚀 Bắt đầu phiêu lưu!
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/**
 * 🎯 QUICK FEEDBACK - Phản hồi nhanh trong game
 * Hiện và biến mất nhanh
 */
export function QuickFeedback({
  message,
  emoji = '🦉',
  type = 'success', // success, error, combo
  onComplete
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const typeStyles = {
    success: 'from-green-500 to-emerald-600',
    error: 'from-red-500 to-rose-600',
    combo: 'from-yellow-500 to-orange-500'
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -20 }}
      className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50"
    >
      <div className={`
        bg-gradient-to-br ${typeStyles[type]}
        text-white px-6 py-3 rounded-2xl shadow-2xl
        flex items-center gap-3
      `}>
        <motion.span
          animate={{ rotate: [0, -15, 15, 0] }}
          transition={{ duration: 0.5 }}
          className="text-3xl"
        >
          {emoji}
        </motion.span>
        <span className="font-bold text-lg">{message}</span>
      </div>
    </motion.div>
  );
}

/**
 * 🔊 Hook để quản lý narrative audio
 */
export function useNarrativeAudio() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const play = useCallback((text) => {
    if (isMuted || !text) return;
    
    // Sử dụng Web Speech API
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9; // Hơi chậm
      utterance.pitch = 1.1; // Hơi cao (giọng thân thiện)
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    }
  }, [isMuted]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    if (!isMuted) {
      stop();
    }
  }, [isMuted, stop]);

  return { play, stop, isPlaying, isMuted, toggleMute };
}

// Export all components
const NarrativeComponents = {
  NarratorBox,
  GuideBubble,
  StoryIntro,
  QuickFeedback,
  useNarrativeAudio
};

export default NarrativeComponents;
