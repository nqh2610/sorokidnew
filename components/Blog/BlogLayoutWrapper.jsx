/**
 * 📝 BLOG LAYOUT WRAPPER - I18N ENABLED
 * 
 * Component dùng chung cho tất cả blog layouts (vi, en, ...)
 * - Header giống hệt trang chủ
 * - Thanh categories navigation
 * - Footer
 * - 🌍 Tự động detect locale từ I18nContext
 */

'use client';

import { useRef, useState, useEffect } from 'react';
import LocalizedLink from '@/components/LocalizedLink/LocalizedLink';
import Logo from '@/components/Logo/Logo';
import MainNav from '@/components/MainNav/MainNav';
import categoriesDataVI from '@/content/blog/categories.json';
import categoriesDataEN from '@/content/blog/categories.en.json';
import { useI18n } from '@/lib/i18n/I18nContext';

// Scroll Arrow Button Component
function ScrollArrow({ direction, onClick, visible, t }) {
  if (!visible) return null;
  
  return (
    <button
      onClick={onClick}
      className={`absolute ${direction === 'left' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center bg-white/95 backdrop-blur shadow-md rounded-full border border-violet-200 text-violet-600 hover:bg-violet-50 transition-all sm:hidden`}
      aria-label={direction === 'left' ? t('blog.scrollLeft') : t('blog.scrollRight')}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {direction === 'left' ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}

export default function BlogLayoutWrapper({ children }) {
  const { t, locale } = useI18n();
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Load categories theo locale
  const categories = locale === 'en' ? categoriesDataEN.categories : categoriesDataVI.categories;
  
  // Category path prefix theo locale
  const categoryPathPrefix = locale === 'en' ? '/en/blog/category' : '/blog/danh-muc';
  const blogPath = locale === 'en' ? '/en/blog' : '/blog';

  // Check scroll position
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    
    const scrollAmount = direction === 'left' ? -150 : 150;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Main Navigation */}
      <MainNav />

      {/* Categories Navigation */}
      <div className="border-b border-violet-100 bg-violet-50/80">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 relative">
            {/* Scroll Arrows */}
            <ScrollArrow direction="left" onClick={() => scroll('left')} visible={showLeftArrow} t={t} />
            <ScrollArrow direction="right" onClick={() => scroll('right')} visible={showRightArrow} t={t} />
            
            {/* Gradient fades */}
            {showLeftArrow && <div className="absolute left-7 top-0 bottom-0 w-4 bg-gradient-to-r from-violet-50 to-transparent pointer-events-none z-10 sm:hidden" />}
            {showRightArrow && <div className="absolute right-7 top-0 bottom-0 w-4 bg-gradient-to-l from-violet-50 to-transparent pointer-events-none z-10 sm:hidden" />}
            
            <nav 
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex items-center gap-1 py-2.5 sm:py-3 overflow-x-auto scrollbar-hide px-1 sm:px-0" 
              aria-label={t('blog.categories')}
            >
              <LocalizedLink 
                href={blogPath}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-violet-700 hover:text-violet-800 hover:bg-violet-100 rounded-full transition-all whitespace-nowrap"
              >
                {t('blog.all')}
              </LocalizedLink>
              {categories.map((cat) => (
                <LocalizedLink 
                  key={cat.slug}
                  href={`${categoryPathPrefix}/${cat.slug}`}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-violet-600 hover:text-violet-800 hover:bg-violet-100 rounded-full transition-all whitespace-nowrap"
                >
                  {cat.name}
                </LocalizedLink>
              ))}
            </nav>
          </div>
        </div>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <span className="text-gray-400" aria-hidden="true">|</span>
              <span className="text-gray-400">{t('footer.tagline')}</span>
            </div>
            <nav aria-label="Footer navigation">
              <ul className="flex flex-wrap justify-center gap-6 text-gray-400">
                <li><LocalizedLink href={blogPath} className="hover:text-white transition-colors">{t('common.blog')}</LocalizedLink></li>
                <li><LocalizedLink href="/tool" className="hover:text-white transition-colors flex items-center gap-1">🧰 {t('common.tool')}</LocalizedLink></li>
              </ul>
            </nav>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} SoroKid - {t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
