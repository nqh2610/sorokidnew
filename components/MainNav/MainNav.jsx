'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo/Logo';

/**
 * MainNav - Thanh điều hướng chính (tối ưu cho mobile)
 * Logo | Blog | Toolbox | Đăng nhập/Đăng ký
 */
export default function MainNav({ showAuth = true }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/blog', label: 'Blog', icon: '📚' },
    { href: '/tool', label: 'Toolbox', icon: '🧰' },
  ];

  const isActive = (href) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">
          {/* Logo - về trang chủ */}
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            {/* Mobile: size sm, Desktop: size md */}
            <div className="sm:hidden">
              <Logo size="sm" showText={true} />
            </div>
            <div className="hidden sm:block">
              <Logo size="md" showText={true} />
            </div>
          </Link>

          {/* Navigation + Auth - bên phải */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Nav Links - chỉ icon trên mobile */}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all
                  ${isActive(item.href)
                    ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'
                  }`}
                title={item.label}
              >
                <span className="text-sm sm:text-base">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}

            {/* Auth Buttons */}
            {showAuth && (
              <>
                <span className="w-px h-4 bg-gray-200 mx-0.5 hidden sm:block" />
                <Link
                  href="/login"
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-full transition-all whitespace-nowrap"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-sm font-medium bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all whitespace-nowrap"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
