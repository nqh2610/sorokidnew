'use client';

import { usePathname } from 'next/navigation';
import { Home, BookOpen, Dumbbell, Trophy, User } from 'lucide-react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { getPathWithoutLocale } from '@/lib/i18n/config';

/**
 * 📱 BOTTOM NAVIGATION BAR (Cải tiến cho học sinh tiểu học)
 * 
 * - Touch targets tối thiểu 44px
 * - Emoji to, rõ ràng
 * - Active state nổi bật
 * - Màu sắc theo thương hiệu
 * - 🌍 Locale-aware navigation
 */

const navItems = [
  { 
    href: '/dashboard', 
    label: 'Home', 
    emoji: '🏠',
    activeColor: 'text-purple-600',
    activeBg: 'bg-purple-50'
  },
  { 
    href: '/learn', 
    label: 'Learn', 
    emoji: '📚',
    activeColor: 'text-blue-600',
    activeBg: 'bg-blue-50'
  },
  { 
    href: '/practice', 
    label: 'Practice', 
    emoji: '💪',
    activeColor: 'text-orange-600',
    activeBg: 'bg-orange-50'
  },
  { 
    href: '/compete', 
    label: 'Compete', 
    emoji: '🏆',
    activeColor: 'text-pink-600',
    activeBg: 'bg-pink-50'
  },
  { 
    href: '/profile', 
    label: 'Profile', 
    emoji: '👤',
    activeColor: 'text-green-600',
    activeBg: 'bg-green-50'
  },
];

// Các path ẩn bottom nav
const HIDDEN_PATHS = ['/login', '/register', '/admin', '/onboarding'];

export default function BottomNav() {
  const pathname = usePathname();
  
  // 🌍 Lấy path không có locale prefix để so sánh
  const cleanPathname = getPathWithoutLocale(pathname || '/');
  
  // Ẩn trên các trang không cần
  const shouldHide = HIDDEN_PATHS.some(path => cleanPathname?.startsWith(path));
  if (shouldHide) return null;

  return (
    <>
      {/* Spacer để content không bị che */}
      <div className="h-20 md:hidden" aria-hidden="true" />
      
      {/* Bottom Navigation */}
      <nav className="
        fixed bottom-0 left-0 right-0 z-50
        md:hidden
        bg-white/95 backdrop-blur-md
        border-t border-gray-100
        shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
        pb-safe
      ">
        <div className="flex items-center justify-around h-[68px] px-1">
          {navItems.map((item) => {
            // 🌍 So sánh với path không có locale
            const isActive = cleanPathname === item.href || 
              (item.href !== '/dashboard' && cleanPathname?.startsWith(item.href + '/'));
            
            return (
              <LocalizedLink
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`
                  relative flex flex-col items-center justify-center
                  min-w-[60px] min-h-[56px] 
                  rounded-2xl
                  transition-all duration-200
                  active:scale-95
                  ${isActive ? item.activeBg : 'hover:bg-gray-50 active:bg-gray-100'}
                `}
              >
                {/* Emoji lớn, rõ ràng */}
                <span className={`
                  text-[28px] leading-none
                  transition-transform duration-200
                  ${isActive ? 'scale-110 -translate-y-0.5' : ''}
                `}>
                  {item.emoji}
                </span>
                
                {/* Label */}
                <span className={`
                  text-[11px] font-semibold mt-1
                  transition-colors duration-200
                  ${isActive ? item.activeColor : 'text-gray-400'}
                `}>
                  {item.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <span className={`
                    absolute -bottom-1 left-1/2 -translate-x-1/2
                    w-1 h-1 rounded-full
                    ${item.activeColor.replace('text-', 'bg-')}
                  `} />
                )}
              </LocalizedLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
