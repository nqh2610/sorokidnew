'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Dumbbell, Trophy, BarChart3 } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Trang chủ', icon: Home, emoji: '🏠' },
  { href: '/learn', label: 'Học tập', icon: BookOpen, emoji: '📚' },
  { href: '/practice', label: 'Luyện tập', icon: Dumbbell, emoji: '💪' },
  { href: '/compete', label: 'Thi đấu', icon: Trophy, emoji: '🏆' },
  { href: '/leaderboard', label: 'Xếp hạng', icon: BarChart3, emoji: '📊' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className={`text-[10px] font-medium ${isActive ? 'text-purple-600' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
