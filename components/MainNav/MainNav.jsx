'use client';

import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo/Logo';
import { LanguageSelector } from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n/I18nContext';
import { LocalizedLink } from '@/components/LocalizedLink';
import { getPathWithoutLocale } from '@/lib/i18n/config';

/**
 * MainNav - Thanh điều hướng chính (tối ưu cho mobile)
 * Logo | Blog | Toolbox | Language | Đăng nhập/Đăng ký
 */
export default function MainNav({ showAuth = true }) {
  const pathname = usePathname();
  
  // useI18n() giờ đã safe, trả về fallback nếu chưa có Provider
  const { t } = useI18n();

  const navItems = [
    { href: '/blog', label: t('common.blog') || 'Blog', icon: '📚' },
    { href: '/tool', label: t('common.tool') || 'Toolbox', icon: '🧰' },
  ];

  const isActive = (href) => {
    const pathWithoutLocale = getPathWithoutLocale(pathname);
    return pathWithoutLocale.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">
          {/* Logo - về trang chủ */}
          <LocalizedLink href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            {/* Mobile: size sm, Desktop: size md */}
            <div className="sm:hidden">
              <Logo size="sm" showText={true} />
            </div>
            <div className="hidden sm:block">
              <Logo size="md" showText={true} />
            </div>
          </LocalizedLink>

          {/* Navigation + Auth - bên phải */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Nav Links - chỉ icon trên mobile */}
            {navItems.map((item) => (
              <LocalizedLink
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
              </LocalizedLink>
            ))}

            {/* Language Switcher */}
            <LanguageSelector className="mx-0.5" />

            {/* Auth Buttons */}
            {showAuth && (
              <>
                <span className="w-px h-4 bg-gray-200 mx-0.5 hidden sm:block" />
                <LocalizedLink
                  href="/login"
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-full transition-all whitespace-nowrap"
                >
                  {t('common.login') || 'Đăng nhập'}
                </LocalizedLink>
                <LocalizedLink
                  href="/register"
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-sm font-medium bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all whitespace-nowrap"
                >
                  {t('common.register') || 'Đăng ký'}
                </LocalizedLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
