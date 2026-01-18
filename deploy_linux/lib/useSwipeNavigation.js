'use client';

import { useCallback, useRef } from 'react';

/**
 * Custom hook để thêm swipe navigation (hỗ trợ cả touch và mouse)
 * @param {Function} onSwipeLeft - Callback khi vuốt trái (next)
 * @param {Function} onSwipeRight - Callback khi vuốt phải (prev)
 * @param {number} minSwipeDistance - Khoảng cách tối thiểu để tính là swipe (default: 50px)
 * @returns {Object} - swipeHandlers để bind vào element
 */
export function useSwipeNavigation(onSwipeLeft, onSwipeRight, minSwipeDistance = 50) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const isDragging = useRef(false);
  
  const maxClickDistance = 8; // Nếu di chuyển < 8px thì coi là click

  // ===== TOUCH EVENTS (mobile) =====
  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const dx = touchStartX.current - touchEndX.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(touchStartY.current - touchEndY.current);
    
    // Responsive threshold
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const threshold = width < 400 ? 25 : width < 640 ? 30 : width < 768 ? 35 : minSwipeDistance;
    
    // Nếu di chuyển ít, coi là click
    if (absDx < maxClickDistance && absDy < maxClickDistance) {
      return;
    }
    
    // Nếu di chuyển dọc nhiều hơn ngang, là scroll
    if (absDy > absDx) {
      return;
    }
    
    // Check minimum swipe distance
    if (absDx < threshold) {
      return;
    }
    
    if (dx > 0) {
      onSwipeLeft?.();
    } else {
      onSwipeRight?.();
    }
  }, [onSwipeLeft, onSwipeRight, minSwipeDistance]);

  // ===== MOUSE EVENTS (desktop) =====
  const onMouseDown = useCallback((e) => {
    // Bỏ qua nếu click vào button hoặc interactive element
    if (e.target.closest('button, a, [role="button"], input, select, textarea')) {
      return;
    }
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    touchEndX.current = e.clientX;
    touchEndY.current = e.clientY;
    isDragging.current = true;
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    touchEndX.current = e.clientX;
    touchEndY.current = e.clientY;
  }, []);

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const dx = touchStartX.current - touchEndX.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(touchStartY.current - touchEndY.current);
    
    // Responsive threshold
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const threshold = width < 400 ? 25 : width < 640 ? 30 : width < 768 ? 35 : minSwipeDistance;
    
    // Nếu di chuyển ít, coi là click
    if (absDx < maxClickDistance && absDy < maxClickDistance) {
      return;
    }
    
    // Nếu di chuyển dọc nhiều hơn ngang, là scroll
    if (absDy > absDx) {
      return;
    }
    
    // Check minimum swipe distance
    if (absDx < threshold) {
      return;
    }
    
    if (dx > 0) {
      onSwipeLeft?.();
    } else {
      onSwipeRight?.();
    }
  }, [onSwipeLeft, onSwipeRight, minSwipeDistance]);

  const onMouseLeave = useCallback(() => {
    isDragging.current = false;
  }, []);

  return {
    swipeHandlers: {
      // Touch events
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      // Mouse events
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
    }
  };
}

export default useSwipeNavigation;
