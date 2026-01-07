'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';

/**
 * 🦉 FLOATING GUIDE - Cú Soro Mini
 * 
 * Floating button hiển thị trên mọi màn hình game
 * Click để xem gợi ý/narrative từ Cú Soro
 * 
 * Usage:
 * <FloatingGuide message="Làm tốt lắm!" />
 * <FloatingGuide messages={['Tip 1', 'Tip 2']} />
 */

// Các vị trí có thể đặt
const POSITIONS = {
  'bottom-right': 'bottom-24 right-4 md:bottom-4',
  'bottom-left': 'bottom-24 left-4 md:bottom-4',
  'top-right': 'top-20 right-4',
  'top-left': 'top-20 left-4',
};

export default function FloatingGuide({
  message = null,
  messages = [],
  position = 'bottom-right',
  autoShow = false,
  autoHideDelay = 5000,
  onDismiss,
}) {
  const [isExpanded, setIsExpanded] = useState(autoShow);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Get current message
  const allMessages = message ? [message] : messages;
  const currentMessage = allMessages[currentMessageIndex];
  
  // Auto show on new message
  useEffect(() => {
    if (autoShow && currentMessage && !hasInteracted) {
      setIsExpanded(true);
      
      if (autoHideDelay > 0) {
        const timer = setTimeout(() => {
          setIsExpanded(false);
        }, autoHideDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [autoShow, currentMessage, autoHideDelay, hasInteracted]);

  // Cycle through messages
  const nextMessage = () => {
    if (allMessages.length > 1) {
      setCurrentMessageIndex((prev) => (prev + 1) % allMessages.length);
    }
  };

  const handleToggle = () => {
    setHasInteracted(true);
    setIsExpanded(!isExpanded);
    
    if (isExpanded && onDismiss) {
      onDismiss();
    }
  };

  const handleClose = () => {
    setHasInteracted(true);
    setIsExpanded(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const posClass = POSITIONS[position] || POSITIONS['bottom-right'];

  return (
    <div className={`fixed z-50 ${posClass}`}>
      <AnimatePresence mode="wait">
        {isExpanded && currentMessage ? (
          // 💬 Expanded bubble
          <motion.div
            key="bubble"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative"
          >
            {/* Message bubble */}
            <div className="
              max-w-[280px] sm:max-w-xs
              p-4 pr-10
              bg-gradient-to-br from-purple-50 to-pink-50
              border-2 border-purple-200
              rounded-2xl rounded-br-sm
              shadow-lg
            ">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="
                  absolute top-2 right-2
                  w-6 h-6
                  flex items-center justify-center
                  text-gray-400 hover:text-gray-600
                  hover:bg-gray-100 rounded-full
                  transition-colors
                "
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Guide avatar + message */}
              <div className="flex items-start gap-3">
                {/* Cú Soro avatar */}
                <div className="
                  flex-shrink-0
                  w-10 h-10
                  flex items-center justify-center
                  bg-gradient-to-br from-purple-400 to-pink-400
                  rounded-full
                  shadow-md
                ">
                  <span className="text-xl">🦉</span>
                </div>
                
                {/* Message */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-purple-700 mb-1">
                    Cú Soro
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {currentMessage}
                  </p>
                  
                  {/* Navigation dots if multiple messages */}
                  {allMessages.length > 1 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      {allMessages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentMessageIndex(i)}
                          className={`
                            w-2 h-2 rounded-full transition-colors
                            ${i === currentMessageIndex 
                              ? 'bg-purple-500' 
                              : 'bg-purple-200 hover:bg-purple-300'
                            }
                          `}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Collapsed button underneath */}
            <motion.button
              onClick={handleToggle}
              className="
                absolute -bottom-14 right-0
                w-12 h-12
                flex items-center justify-center
                bg-gradient-to-br from-purple-500 to-pink-500
                rounded-full
                shadow-lg
                active:scale-95
                transition-transform
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl">🦉</span>
            </motion.button>
          </motion.div>
        ) : (
          // 🦉 Collapsed button only
          <motion.button
            key="button"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={handleToggle}
            className="
              relative
              w-14 h-14
              flex items-center justify-center
              bg-gradient-to-br from-purple-500 to-pink-500
              rounded-full
              shadow-lg hover:shadow-xl
              active:scale-95
              transition-all duration-200
            "
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl">🦉</span>
            
            {/* Notification badge if has message */}
            {currentMessage && !hasInteracted && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="
                  absolute -top-1 -right-1
                  w-5 h-5
                  flex items-center justify-center
                  bg-red-500 text-white
                  text-xs font-bold
                  rounded-full
                  shadow
                "
              >
                !
              </motion.span>
            )}
            
            {/* Pulse ring */}
            {currentMessage && !hasInteracted && (
              <motion.span
                className="
                  absolute inset-0
                  rounded-full
                  border-2 border-purple-400
                "
                animate={{
                  scale: [1, 1.3],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 🎮 GAME GUIDE - Preset cho màn hình game
 */
export function GameGuide({ hint, onHintViewed }) {
  return (
    <FloatingGuide
      message={hint}
      position="bottom-right"
      autoShow={false}
      onDismiss={onHintViewed}
    />
  );
}

/**
 * 📚 LESSON GUIDE - Preset cho màn hình lesson
 */
export function LessonGuide({ tips }) {
  return (
    <FloatingGuide
      messages={tips}
      position="bottom-right"
      autoShow={true}
      autoHideDelay={8000}
    />
  );
}
