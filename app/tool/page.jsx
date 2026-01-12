'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import MainNav from '@/components/MainNav/MainNav';
import Logo from '@/components/Logo/Logo';

// Action Buttons Component - Compact inline version
function ActionButtons() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const shortcut = isMac ? '⌘+D' : 'Ctrl+D';

  const handleSaveBookmark = useCallback(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setToastMessage('✅ Đã cài trên thiết bị!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }
    setToastMessage(`⭐ Nhấn ${shortcut} để lưu ngay!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, [shortcut]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    const title = 'Toolbox Giáo Viên - SoroKid';
    const text = 'Bộ sưu tập trò chơi quốc dân cho lớp học - Miễn phí!';

    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
      return;
    }

    navigator.clipboard.writeText(url).then(() => {
      setToastMessage('✅ Đã copy link!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  }, []);

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <button
        onClick={handleSaveBookmark}
        className="inline-flex items-center gap-1.5 px-3 py-1.5
          text-amber-600 text-sm font-medium rounded-lg
          hover:bg-amber-50 transition-all"
        title={`Lưu Bookmark (${shortcut})`}
      >
        <span>⭐</span>
        <span className="hidden sm:inline">Lưu</span>
      </button>

      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-3 py-1.5
          text-gray-500 text-sm font-medium rounded-lg
          hover:bg-gray-100 transition-all"
        title="Chia sẻ"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="hidden sm:inline">Chia sẻ</span>
      </button>

      {showToast && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50
          px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-xl
          whitespace-nowrap animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

// Category configuration
const categories = [
  { id: 'all', name: 'Tất cả', icon: '🧰', description: 'Tất cả công cụ' },
  { id: 'teambuilding', name: 'Vui vẻ - Teambuilding', icon: '🎉', description: 'Họp nhóm, workshop, tạo không khí' },
  { id: 'thi-dua', name: 'Thi đua & cho điểm', icon: '🏆', description: 'Chấm điểm, thi đua nhóm' },
  { id: 'ngau-nhien', name: 'Ngẫu nhiên – công bằng', icon: '🎲', description: 'Chọn ngẫu nhiên, công bằng' },
  { id: 'to-chuc', name: 'Tổ chức lớp học', icon: '📋', description: 'Quản lý, tổ chức lớp' },
  { id: 'on-tap', name: 'Ôn tập – game kiến thức', icon: '🎮', description: 'Game ôn bài, kiểm tra' },
  { id: 'hoc-ca-nhan', name: 'Học cá nhân', icon: '📚', description: 'Luyện tập cá nhân' },
];

// Tool data configuration - Each tool has its unique color theme
const tools = [
  {
    id: 'cuoc-dua-ki-thu',
    name: 'Cuộc Đua Kì Thú',
    description: 'Bảng thi đua trực quan, tạo động lực cho cả lớp',
    icon: '🏁',
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600',
    iconBg: 'from-yellow-300 to-orange-400',
    textColor: 'text-white',
    descColor: 'text-orange-100',
    badge: '🏆 THI ĐUA',
    theme: 'dark',
    categories: ['thi-dua', 'to-chuc', 'teambuilding'],
  },
  {
    id: 'chiec-non-ky-dieu',
    name: 'Chiếc Nón Kỳ Diệu',
    description: 'Gọi tên học sinh ngẫu nhiên, công bằng',
    icon: '🎡',
    color: 'from-fuchsia-500 to-purple-600',
    bgColor: 'bg-gradient-to-br from-fuchsia-600 to-purple-700',
    iconBg: 'from-fuchsia-400 to-purple-500',
    textColor: 'text-white',
    descColor: 'text-fuchsia-100',
    badge: '🔥 HOT',
    theme: 'dark',
    categories: ['ngau-nhien', 'teambuilding'],
  },
  {
    id: 'boc-tham',
    name: 'Bốc Thăm',
    description: 'Rút thăm tên, câu hỏi, phần thưởng',
    icon: '🎫',
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-gradient-to-br from-rose-500 to-pink-600',
    iconBg: 'from-rose-300 to-pink-400',
    textColor: 'text-white',
    descColor: 'text-rose-100',
    badge: '🎰 HỒI HỘP',
    theme: 'dark',
    categories: ['ngau-nhien', 'to-chuc', 'teambuilding'],
  },
  {
    id: 'den-may-man',
    name: 'Đèn May Mắn',
    description: 'Chọn ngẫu nhiên bằng đèn xanh-đỏ',
    icon: '🚦',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-gradient-to-br from-emerald-600 to-green-700',
    iconBg: 'from-emerald-300 to-green-400',
    textColor: 'text-white',
    descColor: 'text-emerald-100',
    badge: '🍀 MAY MẮN',
    theme: 'dark',
    categories: ['ngau-nhien', 'teambuilding'],
  },
  {
    id: 'xuc-xac',
    name: 'Xúc Xắc 3D',
    description: 'Xúc xắc 3D cho máy chiếu, dễ nhìn',
    icon: '🎲',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600',
    iconBg: 'from-purple-300 to-pink-400',
    textColor: 'text-white',
    descColor: 'text-purple-100',
    badge: '✨ 3D',
    theme: 'dark',
    categories: ['ngau-nhien', 'teambuilding'],
  },
  {
    id: 'dua-thu-hoat-hinh',
    name: 'Đua Vịt Sông Nước',
    description: 'Cuộc đua hoạt hình vui nhộn cho lớp',
    icon: '🦆',
    color: 'from-cyan-400 to-blue-500',
    bgColor: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    iconBg: 'from-yellow-300 to-amber-400',
    textColor: 'text-white',
    descColor: 'text-cyan-100',
    badge: '🌊 VUI',
    theme: 'dark',
    categories: ['ngau-nhien', 'teambuilding'],
  },
  {
    id: 'chia-nhom',
    name: 'Chia Nhóm',
    description: 'Chia nhóm ngẫu nhiên, tự chọn nhóm trưởng',
    icon: '👥',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600',
    iconBg: 'from-violet-300 to-purple-400',
    textColor: 'text-white',
    descColor: 'text-violet-100',
    badge: '✨ MỚI',
    theme: 'dark',
    categories: ['to-chuc', 'teambuilding'],
  },
  {
    id: 'dong-ho-bam-gio',
    name: 'Đồng Hồ Bấm Giờ',
    description: 'Đếm ngược to rõ, âm thanh báo hết giờ',
    icon: '⏱️',
    color: 'from-sky-400 to-blue-500',
    bgColor: 'bg-gradient-to-br from-sky-500 to-blue-600',
    iconBg: 'from-white to-sky-100',
    textColor: 'text-white',
    descColor: 'text-sky-100',
    badge: null,
    theme: 'dark',
    categories: ['to-chuc', 'hoc-ca-nhan', 'teambuilding'],
  },
  {
    id: 'ai-la-trieu-phu',
    name: 'Ai Là Triệu Phú',
    description: 'Game show ôn bài với 50:50, trợ giúp',
    icon: '💎',
    color: 'from-blue-900 to-indigo-900',
    bgColor: 'bg-gradient-to-br from-blue-950 to-indigo-950',
    iconBg: 'from-amber-400 to-yellow-500',
    textColor: 'text-amber-400',
    descColor: 'text-blue-200',
    isALTP: true,
    badge: '🏆 GAME SHOW',
    theme: 'altp',
    category: 'on-tap',
  },
  {
    id: 'o-chu',
    name: 'Trò Chơi Ô Chữ',
    description: 'Tạo ô chữ theo chủ đề bài học',
    icon: '🔤',
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-gradient-to-br from-teal-600 to-cyan-700',
    iconBg: 'from-teal-300 to-cyan-400',
    textColor: 'text-white',
    descColor: 'text-teal-100',
    badge: '✨ MỚI',
    theme: 'dark',
    category: 'on-tap',
  },
  {
    id: 'flash-zan',
    name: 'Flash ZAN',
    description: 'Luyện tính nhẩm Soroban & Anzan',
    icon: '⚡',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-gradient-to-br from-gray-900 to-gray-800',
    iconBg: 'from-amber-400 to-orange-500',
    textColor: 'text-amber-400',
    descColor: 'text-gray-300',
    badge: '⚡ FLASH',
    theme: 'flash',
    category: 'on-tap',
  },
  {
    id: 'ban-tinh-soroban',
    name: 'Bàn Tính Soroban',
    description: 'Bàn tính ảo cho học sinh luyện tập',
    icon: '🧮',
    color: 'from-amber-600 to-orange-700',
    bgColor: 'bg-gradient-to-br from-amber-700 to-orange-800',
    iconBg: 'from-amber-300 to-yellow-400',
    textColor: 'text-amber-100',
    descColor: 'text-amber-200',
    badge: '🧮 CLASSIC',
    theme: 'dark',
    category: 'hoc-ca-nhan',
  },
];

// Helper to check if tool belongs to category (supports both single and multiple categories)
const toolBelongsToCategory = (tool, categoryId) => {
  if (tool.categories) {
    return tool.categories.includes(categoryId);
  }
  return tool.category === categoryId;
};

export default function ToolboxPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter tools by selected category
  const filteredTools = selectedCategory === 'all'
    ? tools
    : tools.filter(t => toolBelongsToCategory(t, selectedCategory));

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-pink-50">
      {/* Header với điều hướng */}
      <MainNav />

      {/* Hero Section - Responsive */}
      <section className="pt-4 sm:pt-5 pb-3 sm:pb-4 text-center px-4">
        <div className="max-w-5xl mx-auto">
          {/* Title Row */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black">
              <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                Toolbox Giáo Viên
              </span>
            </h1>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
              Miễn phí
            </span>
          </div>

          {/* Subtitle + Actions - Stack on mobile */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-gray-500 text-sm mb-3">
            <span className="text-xs sm:text-sm">Trò chơi & công cụ phổ biến nhất cho lớp học</span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <ActionButtons />
          </div>

          {/* Category Tabs - Wrap on mobile, horizontal on desktop */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all
                  ${selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>

        {/* SoroKid Introduction */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 
            bg-gradient-to-r from-violet-50 via-white to-pink-50 
            border border-violet-100/50 rounded-full shadow-sm">
            <p className="text-gray-600">
              <span className="font-semibold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">SoroKid</span>
              {' '}- Công cụ dạy Soroban cá nhân hoá cho từng học sinh
            </p>
            <Link 
              href="/"
              className="px-4 py-1.5 bg-gradient-to-r from-violet-500 to-pink-500 
                hover:from-violet-600 hover:to-pink-600
                text-white text-sm font-medium rounded-full transition-all"
            >
              Khám phá →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <Logo size="sm" showText={true} />
            <span className="hidden sm:inline text-gray-300">|</span>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} SoroKid - Học toán tư duy cùng bàn tính Soroban
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Tool Card Component
function ToolCard({ tool, index }) {
  const CardWrapper = tool.comingSoon ? 'div' : Link;
  const cardProps = tool.comingSoon 
    ? {} 
    : { href: `/tool/${tool.id}` };

  const isDark = tool.theme === 'dark' || tool.theme === 'altp' || tool.theme === 'flash';
  const isALTP = tool.isALTP;
  const isFlash = tool.theme === 'flash';

  return (
    <CardWrapper
      {...cardProps}
      className={`group relative ${tool.bgColor} rounded-3xl p-6 sm:p-8 
        border-2 ${isALTP ? 'border-amber-500/30' : isFlash ? 'border-amber-500/20' : 'border-white/20'} 
        shadow-lg hover:shadow-2xl 
        transform hover:-translate-y-2 transition-all duration-300
        overflow-hidden
        ${tool.comingSoon ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
    >
      {/* Badge */}
      {tool.badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-md
            ${tool.badge.includes('HOT') ? 'bg-red-500 text-white animate-pulse' : ''}
            ${tool.badge.includes('MỚI') ? 'bg-white/90 text-violet-600' : ''}
            ${tool.badge.includes('FLASH') ? 'bg-amber-400 text-gray-900 animate-pulse' : ''}
            ${tool.badge.includes('VUI') ? 'bg-white/90 text-cyan-600' : ''}
            ${tool.badge.includes('HỒI HỘP') ? 'bg-white/90 text-rose-600' : ''}
            ${tool.badge.includes('CLASSIC') ? 'bg-amber-200 text-amber-800' : ''}
            ${tool.badge.includes('MAY MẮN') ? 'bg-white/90 text-emerald-600' : ''}
            ${tool.badge.includes('COMING SOON') ? 'bg-white/30 text-white' : ''}
            ${tool.badge.includes('GAME SHOW') ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-blue-900 font-black' : ''}
          `}>
            {tool.badge}
          </span>
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
      
      {/* ALTP special glow */}
      {isALTP && (
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-transparent pointer-events-none" />
      )}
      
      {/* Flash special effect */}
      {isFlash && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none" />
      )}
      
      {/* Icon with idle animation */}
      <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl 
        bg-gradient-to-br ${tool.iconBg || tool.color}
        ${isALTP ? 'ring-4 ring-amber-400/30' : isFlash ? 'ring-4 ring-amber-400/20' : ''}
        flex items-center justify-center text-4xl sm:text-5xl mb-6
        shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <span className="group-hover:animate-bounce">{tool.icon}</span>
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tool.iconBg || tool.color}
          opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300`} />
      </div>

      {/* Content */}
      <h2 className={`text-xl sm:text-2xl font-bold mb-2 transition-colors
        ${tool.textColor || 'text-white'} group-hover:brightness-110`}>
        {tool.name}
      </h2>
      <p className={`text-sm sm:text-base mb-6 leading-relaxed line-clamp-2
        ${tool.descColor || 'text-white/80'}`}>
        {tool.description}
      </p>

      {/* Button */}
      <div className={`inline-flex items-center gap-2 px-5 py-2.5 
        ${isALTP 
          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-blue-900' 
          : isFlash
          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900'
          : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'} 
        font-semibold rounded-full
        ${tool.comingSoon ? '' : 'group-hover:shadow-lg group-hover:scale-105'} transition-all duration-300`}>
        <span>{tool.comingSoon ? 'Sắp ra mắt' : isALTP ? 'Chơi ngay!' : 'Mở tool'}</span>
        {!tool.comingSoon && (
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        )}
      </div>
    </CardWrapper>
  );
}
