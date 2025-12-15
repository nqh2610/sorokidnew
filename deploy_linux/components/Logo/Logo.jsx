'use client';

import { useId } from 'react';
import Image from 'next/image';

/**
 * Logo Sorokid - Brand Logo Component
 * Màu chủ đạo: Blue → Violet → Pink
 */

export default function Logo({ size = 'md', showText = true, className = '' }) {
  const gradientId = useId();
  const sizes = {
    xs: { icon: 24, text: 'text-sm' },
    sm: { icon: 32, text: 'text-base' },
    md: { icon: 40, text: 'text-xl' },
    lg: { icon: 56, text: 'text-2xl' },
    xl: { icon: 72, text: 'text-3xl' },
    '2xl': { icon: 96, text: 'text-4xl' },
  };

  const { icon: iconSize, text: textSize } = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <div 
        className="relative flex-shrink-0 rounded-xl overflow-hidden"
        style={{ width: iconSize, height: iconSize }}
      >
        {/* SVG Logo - Blue → Violet → Pink gradient */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={`logoGradient-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F7FFF" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          
          {/* Background với bo góc */}
          <rect x="0" y="0" width="100" height="100" rx="22" fill={`url(#logoGradient-${gradientId})`} />
          
          {/* 1 hạt trời phía trên - màu hồng nhạt */}
          <circle cx="50" cy="30" r="8" fill="#F9A8D4" />
          
          {/* Thanh ngang ở giữa */}
          <rect x="22" y="46" width="56" height="6" rx="3" fill="white" fillOpacity="0.95" />
          
          {/* 3 hạt đất phía dưới - màu vàng cam */}
          <circle cx="30" cy="66" r="8" fill="#FBBF24" />
          <circle cx="50" cy="66" r="8" fill="#FBBF24" />
          <circle cx="70" cy="66" r="8" fill="#FBBF24" />
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent ${textSize}`}>
          SoroKid
        </span>
      )}
    </div>
  );
}

// Simple Logo chỉ có icon
export function LogoIcon({ size = 40, className = '' }) {
  const gradientId = useId();
  return (
    <div 
      className={`relative flex-shrink-0 rounded-xl overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`logoGradientIcon-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F7FFF" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        
        {/* Background với bo góc */}
        <rect x="0" y="0" width="100" height="100" rx="22" fill={`url(#logoGradientIcon-${gradientId})`} />
        
        {/* 1 hạt trời phía trên - màu hồng nhạt */}
        <circle cx="50" cy="30" r="8" fill="#F9A8D4" />
        
        {/* Thanh ngang ở giữa */}
        <rect x="22" y="46" width="56" height="6" rx="3" fill="white" fillOpacity="0.95" />
        
        {/* 3 hạt đất phía dưới - màu vàng cam */}
        <circle cx="30" cy="66" r="8" fill="#FBBF24" />
        <circle cx="50" cy="66" r="8" fill="#FBBF24" />
        <circle cx="70" cy="66" r="8" fill="#FBBF24" />
      </svg>
    </div>
  );
}

// Logo với tagline
export function LogoWithTagline({ size = 'lg', tagline = 'Học Soroban thật vui!' }) {
  return (
    <div className="text-center">
      <Logo size={size} className="justify-center" />
      <p className="mt-2 text-sm text-gray-500 font-medium">{tagline}</p>
    </div>
  );
}

// Large Logo cho trang chủ
export function LogoLarge({ className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <LogoIcon size={120} />
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
        SoroKid
      </h1>
      <p className="text-gray-500 text-sm">Học toán Soroban thú vị</p>
    </div>
  );
}
