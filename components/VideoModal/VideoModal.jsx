'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🎬 VIDEO MODAL - Popup xem video chuyên nghiệp
 * 
 * Không chiếm diện tích trang - chỉ hiện khi click
 * Responsive trên mọi thiết bị
 * Hỗ trợ HD quality và ẩn theo locale
 */
export default function VideoModal({ 
  videoId,
  title = "Video",
  buttonText = "Xem video",
  buttonIcon = true,
  buttonClassName = "",
  compact = false,
  locale = null,        // Locale hiện tại
  showOnlyLocale = null // Chỉ hiện ở locale này (null = hiện tất cả)
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Ẩn nếu không đúng locale
  if (showOnlyLocale && locale && locale !== showOnlyLocale) {
    return null;
  }

  // Close on ESC key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <>
      {/* Trigger Button - Nhỏ gọn, chuyên nghiệp */}
      {compact ? (
        // Compact: Chỉ icon + text nhỏ
        <button
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 text-violet-600 hover:text-violet-700 font-medium text-sm transition-colors ${buttonClassName}`}
        >
          {buttonIcon && <Play className="w-4 h-4 fill-current" />}
          <span>{buttonText}</span>
        </button>
      ) : (
        // Full: Button đẹp với thumbnail preview
        <button
          onClick={() => setIsOpen(true)}
          className={`group relative inline-flex items-center gap-3 bg-white hover:bg-violet-50 border-2 border-violet-200 hover:border-violet-400 rounded-full pl-1.5 pr-5 py-1.5 transition-all shadow-sm hover:shadow-md ${buttonClassName}`}
        >
          {/* Mini Thumbnail */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-violet-100 flex-shrink-0">
            <img 
              src={thumbnailUrl} 
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-violet-600/60 flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
          <span className="font-semibold text-gray-700 group-hover:text-violet-700 text-sm">
            {buttonText}
          </span>
        </button>
      )}

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="text-sm">Đóng</span>
                <X className="w-6 h-6" />
              </button>

              {/* Video Title */}
              <h3 className="text-white font-bold text-lg mb-3 text-center">
                {title}
              </h3>

              {/* Video Container - HD Quality */}
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&vq=hd1080&hd=1&modestbranding=1`}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
