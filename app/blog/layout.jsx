/**
 * 📝 BLOG LAYOUT
 * 
 * Layout riêng cho phần blog
 * - Header giống hệt trang chủ (cùng padding, cùng vị trí)
 * - Thêm thanh categories navigation
 * - Footer giữ nguyên từ trang chính
 */

'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo/Logo';

// Categories data - phải khớp với content/blog/categories.json
const categories = [
  { slug: 'phu-huynh-kem-con-hoc-toan', name: 'Phụ huynh kèm con học toán' },
  { slug: 'con-gap-kho-khan-hoc-toan', name: 'Con gặp khó khăn' },
  { slug: 'cach-giup-con-hoc-toan-nhe-nhang', name: 'Học toán nhẹ nhàng' },
  { slug: 'soroban-cho-phu-huynh', name: 'Soroban' },
];

// Scroll Arrow Button Component
function ScrollArrow({ direction, onClick, visible }) {
  if (!visible) return null;
  
  return (
    <button
      onClick={onClick}
      className={`absolute ${direction === 'left' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center bg-white/95 backdrop-blur shadow-md rounded-full border border-violet-200 text-violet-600 hover:bg-violet-50 transition-all sm:hidden`}
      aria-label={direction === 'left' ? 'Cuộn sang trái' : 'Cuộn sang phải'}
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

export default function BlogLayout({ children }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

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
      {/* Blog Header - Giống hệt trang chủ */}
      <header role="banner">
        {/* Top Navigation - Copy chính xác từ trang chủ */}
        <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50" aria-label="Blog navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/" aria-label="Về trang chủ Sorokid">
                <Logo size="md" />
              </Link>
              <span className="text-violet-300 text-lg hidden xs:inline">|</span>
              <Link href="/blog" className="text-xs sm:text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                Blog
              </Link>
            </div>
            
            {/* Auth Buttons - Icon trên mobile nhỏ, text trên mobile lớn */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Mobile nhỏ: chỉ icon */}
              <Link 
                href="/login" 
                className="flex xs:hidden w-8 h-8 items-center justify-center text-violet-600 hover:bg-violet-50 rounded-full transition-all"
                aria-label="Đăng nhập"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </Link>
              <Link 
                href="/register" 
                className="flex xs:hidden w-8 h-8 items-center justify-center bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white rounded-full shadow-md"
                aria-label="Đăng ký"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </Link>
              
              {/* Mobile lớn + Desktop: text */}
              <Link 
                href="/login" 
                className="hidden xs:flex px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-base text-violet-600 font-medium sm:font-semibold hover:bg-violet-50 rounded-full transition-all"
                aria-label="Đăng nhập vào tài khoản"
              >
                Đăng nhập
              </Link>
              <Link 
                href="/register" 
                className="hidden xs:flex px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-base bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white font-medium sm:font-semibold rounded-full hover:scale-105 transition-all shadow-md sm:shadow-lg"
                aria-label="Đăng ký tài khoản miễn phí"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </nav>
        
        {/* Categories Navigation với scroll arrows */}
        <div className="border-t border-violet-100 bg-violet-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 relative">
            {/* Scroll Arrows */}
            <ScrollArrow direction="left" onClick={() => scroll('left')} visible={showLeftArrow} />
            <ScrollArrow direction="right" onClick={() => scroll('right')} visible={showRightArrow} />
            
            {/* Gradient fades */}
            {showLeftArrow && <div className="absolute left-7 top-0 bottom-0 w-4 bg-gradient-to-r from-violet-50 to-transparent pointer-events-none z-10 sm:hidden" />}
            {showRightArrow && <div className="absolute right-7 top-0 bottom-0 w-4 bg-gradient-to-l from-violet-50 to-transparent pointer-events-none z-10 sm:hidden" />}
            
            <nav 
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex items-center gap-1 py-2.5 sm:py-3 overflow-x-auto scrollbar-hide px-1 sm:px-0" 
              aria-label="Danh mục blog"
            >
              <Link 
                href="/blog"
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-violet-700 hover:text-violet-800 hover:bg-violet-100 rounded-full transition-all whitespace-nowrap"
              >
                Tất cả
              </Link>
              {categories.map((cat) => (
                <Link 
                  key={cat.slug}
                  href={`/blog/danh-muc/${cat.slug}`}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-violet-600 hover:text-violet-800 hover:bg-violet-100 rounded-full transition-all whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

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
              <span className="text-gray-400">Học toán tính nhanh vui như chơi game</span>
            </div>
            <nav aria-label="Footer navigation">
              <ul className="flex flex-wrap justify-center gap-6 text-gray-400">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/learn" className="hover:text-white transition-colors">Bài học</Link></li>
                <li><Link href="/practice" className="hover:text-white transition-colors">Luyện tập</Link></li>
                <li><Link href="/compete" className="hover:text-white transition-colors">Thi đấu</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white transition-colors">Xếp hạng</Link></li>
              </ul>
            </nav>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>© 2025 SoroKid - Học toán tư duy cùng bàn tính Soroban</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
