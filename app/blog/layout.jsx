/**
 * 📝 BLOG LAYOUT
 * 
 * Layout riêng cho phần blog
 * - Header giống hệt trang chủ (cùng padding, cùng vị trí)
 * - Thêm thanh categories navigation
 * - Footer giữ nguyên từ trang chính
 */

import Link from 'next/link';
import Logo from '@/components/Logo/Logo';
import { getCategories } from '@/lib/blog';

export default function BlogLayout({ children }) {
  const categories = getCategories();
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Blog Header - Giống hệt trang chủ */}
      <header role="banner">
        {/* Top Navigation - Copy chính xác từ trang chủ */}
        <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50" aria-label="Blog navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" aria-label="Về trang chủ Sorokid">
                <Logo size="md" />
              </Link>
              <span className="text-violet-300 text-lg">|</span>
              <Link href="/blog" className="text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                Blog
              </Link>
            </div>
            
            {/* Auth Buttons - Giống hệt trang chủ */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link 
                href="/login" 
                className="px-4 sm:px-5 py-2 text-sm sm:text-base text-violet-600 font-semibold hover:bg-violet-50 rounded-full transition-all"
                aria-label="Đăng nhập vào tài khoản"
              >
                Đăng nhập
              </Link>
              <Link 
                href="/register" 
                className="px-4 sm:px-5 py-2 text-sm sm:text-base bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white font-semibold rounded-full hover:scale-105 transition-all shadow-lg"
                aria-label="Đăng ký tài khoản miễn phí"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </nav>
        
        {/* Categories Navigation */}
        <div className="border-t border-violet-100 bg-violet-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <nav className="flex items-center gap-1 py-2.5 sm:py-3 overflow-x-auto scrollbar-hide" aria-label="Danh mục blog">
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
