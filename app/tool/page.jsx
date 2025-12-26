'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo/Logo';

// Tool data configuration - Each tool has its unique color theme
const tools = [
  {
    id: 'chiec-non-ky-dieu',
    name: 'Chiếc Nón Kỳ Diệu',
    description: 'Quay số ngẫu nhiên để gọi học sinh, chọn câu hỏi, chọn lượt chơi',
    icon: '🎡',
    color: 'from-fuchsia-500 to-purple-600',
    bgColor: 'bg-gradient-to-br from-fuchsia-600 to-purple-700',
    iconBg: 'from-fuchsia-400 to-purple-500',
    textColor: 'text-white',
    descColor: 'text-fuchsia-100',
    badge: '🔥 HOT',
    theme: 'dark',
  },
  {
    id: 'dua-thu-hoat-hinh',
    name: 'Đua Vịt Sông Nước',
    description: 'Nhập tên học sinh, hàng trăm vịt cùng đua trên sông, hồi hộp!',
    icon: '🦆',
    color: 'from-cyan-400 to-blue-500',
    bgColor: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    iconBg: 'from-yellow-300 to-amber-400',
    textColor: 'text-white',
    descColor: 'text-cyan-100',
    badge: '🌊 VUI',
    theme: 'dark',
  },
  {
    id: 'flash-zan',
    name: 'Flash ZAN',
    description: 'Luyện tính nhẩm nhanh với flash số, phù hợp Soroban & Anzan',
    icon: '⚡',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-gradient-to-br from-gray-900 to-gray-800',
    iconBg: 'from-amber-400 to-orange-500',
    textColor: 'text-amber-400',
    descColor: 'text-gray-300',
    badge: '⚡ FLASH',
    theme: 'flash',
  },
  {
    id: 'dong-ho-bam-gio',
    name: 'Đồng Hồ Bấm Giờ',
    description: 'Timer đếm ngược với âm thanh, hiển thị to rõ cho lớp học',
    icon: '⏱️',
    color: 'from-sky-400 to-blue-500',
    bgColor: 'bg-gradient-to-br from-sky-500 to-blue-600',
    iconBg: 'from-white to-sky-100',
    textColor: 'text-white',
    descColor: 'text-sky-100',
    badge: null,
    theme: 'dark',
  },
  {
    id: 'chia-nhom',
    name: 'Chia Nhóm',
    description: 'Chia nhóm ngẫu nhiên theo số nhóm hoặc số người, chọn nhóm trưởng tự động',
    icon: '👥',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600',
    iconBg: 'from-violet-300 to-purple-400',
    textColor: 'text-white',
    descColor: 'text-violet-100',
    badge: '✨ MỚI',
    theme: 'dark',
  },
  {
    id: 'boc-tham',
    name: 'Bốc Thăm',
    description: 'Bốc tên, câu hỏi, quà tặng... với hiệu ứng slot machine hồi hộp',
    icon: '🎫',
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-gradient-to-br from-rose-500 to-pink-600',
    iconBg: 'from-rose-300 to-pink-400',
    textColor: 'text-white',
    descColor: 'text-rose-100',
    badge: '🎰 HỒI HỘP',
    theme: 'dark',
  },
  {
    id: 'ban-tinh-soroban',
    name: 'Bàn Tính Soroban',
    description: 'Bàn tính ảo miễn phí để học sinh luyện tập, hỗ trợ kéo thả hạt',
    icon: '🧮',
    color: 'from-amber-600 to-orange-700',
    bgColor: 'bg-gradient-to-br from-amber-700 to-orange-800',
    iconBg: 'from-amber-300 to-yellow-400',
    textColor: 'text-amber-100',
    descColor: 'text-amber-200',
    badge: '🧮 CLASSIC',
    theme: 'dark',
  },
  {
    id: 'den-may-man',
    name: 'Đèn May Mắn',
    description: 'Xanh = Thoát, Đỏ = Bị phạt! Đèn giao thông hồi hộp vui nhộn',
    icon: '🚦',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-gradient-to-br from-emerald-600 to-green-700',
    iconBg: 'from-emerald-300 to-green-400',
    textColor: 'text-white',
    descColor: 'text-emerald-100',
    badge: '🍀 MAY MẮN',
    theme: 'dark',
  },
  {
    id: 'ai-la-trieu-phu',
    name: 'Ai Là Triệu Phú',
    description: '50:50, Hỏi khán giả, Gọi điện - Bạn có dám thử?',
    icon: '💎',
    color: 'from-blue-900 to-indigo-900',
    bgColor: 'bg-gradient-to-br from-blue-950 to-indigo-950',
    iconBg: 'from-amber-400 to-yellow-500',
    textColor: 'text-amber-400',
    descColor: 'text-blue-200',
    isALTP: true,
    badge: '🏆 GAME SHOW',
    theme: 'altp',
  },
  {
    id: 'cuoc-dua-ki-thu',
    name: 'Cuộc Đua Kì Thú',
    description: 'Đua xe, đua ngựa hồi hộp - Ai về đích trước?',
    icon: '🏁',
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-gradient-to-br from-red-500 to-orange-500',
    iconBg: 'from-red-300 to-orange-300',
    textColor: 'text-white',
    descColor: 'text-red-100',
    badge: '🛠️ COMING SOON',
    comingSoon: true,
    theme: 'dark',
  },
  {
    id: 'xuc-xac',
    name: 'Xúc Xắc',
    description: 'Lắc xúc xắc ngẫu nhiên, tạo trò chơi vui nhộn!',
    icon: '🎲',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-gradient-to-br from-indigo-600 to-purple-700',
    iconBg: 'from-white to-indigo-100',
    textColor: 'text-white',
    descColor: 'text-indigo-100',
    badge: '🛠️ COMING SOON',
    comingSoon: true,
    theme: 'dark',
  },
  {
    id: 'thanh-tien-do',
    name: 'Thanh Tiến Độ',
    description: 'Hiển thị % tiến độ bài học, kéo để cập nhật trực quan',
    icon: '📊',
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-gradient-to-br from-teal-600 to-cyan-700',
    iconBg: 'from-teal-300 to-cyan-400',
    textColor: 'text-white',
    descColor: 'text-teal-100',
    badge: '🛠️ COMING SOON',
    comingSoon: true,
    theme: 'dark',
  },
];

export default function ToolboxPage() {
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'coming'
  
  const activeTools = tools.filter(t => !t.comingSoon);
  const comingSoonTools = tools.filter(t => t.comingSoon);
  
  const filteredTools = filter === 'all' ? tools 
    : filter === 'active' ? activeTools 
    : comingSoonTools;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Logo size="md" showText={true} />
            </Link>
            <div className="flex items-center gap-3">
              <Link 
                href="/login"
                className="px-4 py-2 text-sm font-medium text-violet-600 hover:text-violet-700 
                  hover:bg-violet-50 rounded-full transition-all"
              >
                Đăng nhập
              </Link>
              <Link 
                href="/register"
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-violet-500 to-pink-500
                  text-white rounded-full hover:shadow-lg transition-all"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 sm:py-10 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 
            rounded-full text-sm font-medium mb-4">
            <span>🧰</span>
            <span>Miễn phí • Không cần đăng nhập</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800 mb-3 leading-tight">
            <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              Toolbox Giáo Viên
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Các công cụ hữu ích để dạy học tích cực, lớp học thêm phần vui nhộn! 🎉
          </p>

          {/* Filter Tabs */}
          <div className="inline-flex items-center gap-2 p-1.5 bg-gray-100 rounded-full">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                ${filter === 'all' 
                  ? 'bg-white text-violet-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'}`}
            >
              Tất cả ({tools.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                ${filter === 'active' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'}`}
            >
              ✅ Sẵn sàng ({activeTools.length})
            </button>
            <button
              onClick={() => setFilter('coming')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                ${filter === 'coming' 
                  ? 'bg-white text-amber-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'}`}
            >
              🚀 Sắp ra ({comingSoonTools.length})
            </button>
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

        {/* Coming Soon Section */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-6 
            bg-gradient-to-r from-gray-50 to-violet-50 border border-violet-100
            rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">🚀</span>
              <div className="text-left">
                <p className="font-semibold text-gray-700">Thêm công cụ mới sắp ra mắt!</p>
                <p className="text-sm text-gray-500">Bảng điểm, Phát thưởng, Minigame...</p>
              </div>
            </div>
            <Link 
              href="/"
              className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 
                font-medium rounded-full text-sm transition-all"
            >
              Theo dõi cập nhật →
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
              © 2025 SoroKid - Học toán tính nhanh vui như chơi game 🎮
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
