'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo/Logo';

// Tool data configuration - Brand colors: Blue → Violet → Pink
const tools = [
  {
    id: 'chiec-non-ky-dieu',
    name: 'Chiếc Nón Kỳ Diệu',
    description: 'Quay số ngẫu nhiên để gọi học sinh, chọn câu hỏi, chọn lượt chơi',
    icon: '🎡',
    color: 'from-violet-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-violet-50 to-pink-50',
    badge: '🔥 HOT',
  },
  {
    id: 'dua-thu-hoat-hinh',
    name: 'Đua Vịt Sông Nước',
    description: 'Nhập tên học sinh, hàng trăm vịt cùng đua trên sông, hồi hộp!',
    icon: '🦆',
    color: 'from-blue-500 to-violet-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-violet-50',
    badge: null,
  },
  {
    id: 'flash-zan',
    name: 'Flash ZAN',
    description: 'Luyện tính nhẩm nhanh với flash số, phù hợp Soroban & Anzan',
    icon: '⚡',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
    badge: '⚡ FLASH',
  },
  {
    id: 'dong-ho-bam-gio',
    name: 'Đồng Hồ Bấm Giờ',
    description: 'Timer đếm ngược với âm thanh, hiển thị to rõ cho lớp học',
    icon: '⏱️',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    badge: null,
  },
  {
    id: 'chia-nhom',
    name: 'Chia Nhóm',
    description: 'Chia nhóm ngẫu nhiên theo số nhóm hoặc số người, chọn nhóm trưởng tự động',
    icon: '👥',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-gradient-to-br from-violet-50 to-purple-50',
    badge: '✨ MỚI',
  },
  {
    id: 'boc-tham',
    name: 'Bốc Thăm',
    description: 'Bốc tên, câu hỏi, quà tặng... với hiệu ứng slot machine hồi hộp',
    icon: '🎫',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50',
    badge: '✨ MỚI',
  },
  {
    id: 'ban-tinh-soroban',
    name: 'Bàn Tính Soroban',
    description: 'Bàn tính ảo miễn phí để học sinh luyện tập, hỗ trợ kéo thả hạt',
    icon: '🧮',
    color: 'from-teal-500 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-teal-50 to-emerald-50',
    badge: '✨ MỚI',
  },
  {
    id: 'den-may-man',
    name: 'Đèn May Mắn',
    description: 'Xanh = Thoát, Đỏ = Bị phạt! Đèn giao thông hồi hộp vui nhộn',
    icon: '🚦',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50',
    badge: '🆙 CẢI TIẾN',
  },
  {
    id: 'ai-la-trieu-phu',
    name: 'Ai Là Triệu Phú',
    description: 'Game show họi đáp kiến thức, tạo hồi hộp cho lớp học!',
    icon: '💰',
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    badge: '🛠️ COMING SOON',
    comingSoon: true,
  },
  {
    id: 'cuoc-dua-ki-thu',
    name: 'Cuộc Đua Kì Thú',
    description: 'Đua xe, đua ngựa hồi hộp - Ai về đích trước?',
    icon: '🏁',
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-gradient-to-br from-red-50 to-orange-50',
    badge: '🛠️ COMING SOON',
    comingSoon: true,
  },
  {
    id: 'xuc-xac',
    name: 'Xúc Xắc',
    description: 'Lắc xúc xắc ngẫu nhiên, tạo trò chơi vui nhộn!',
    icon: '🎲',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    badge: '🛠️ COMING SOON',
    comingSoon: true,
  },
  {
    id: 'thanh-tien-do',
    name: 'Thanh Tiến Độ',
    description: 'Hiển thị % tiến độ bài học, kéo để cập nhật trực quan',
    icon: '📊',
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-gradient-to-br from-cyan-50 to-blue-50',
    badge: '🛠️ COMING SOON',
    comingSoon: true,
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

  return (
    <CardWrapper
      {...cardProps}
      className={`group relative ${tool.bgColor} rounded-3xl p-6 sm:p-8 
        border-2 border-white shadow-lg hover:shadow-2xl 
        transform hover:-translate-y-2 transition-all duration-300
        overflow-hidden
        ${tool.comingSoon ? 'cursor-default' : 'cursor-pointer'}`}
    >
      {/* Badge */}
      {tool.badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-md
            ${tool.badge.includes('HOT') ? 'bg-red-500 text-white animate-pulse' : ''}
            ${tool.badge.includes('MỚI') ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' : ''}
            ${tool.badge.includes('FLASH') ? 'bg-amber-400 text-amber-900' : ''}
            ${tool.badge.includes('CẢI TIẾN') ? 'bg-emerald-500 text-white' : ''}
            ${tool.badge.includes('COMING SOON') ? 'bg-gray-500 text-white' : ''}
          `}>
            {tool.badge}
          </span>
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
      
      {/* Icon with idle animation */}
      <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${tool.color} 
        flex items-center justify-center text-4xl sm:text-5xl mb-6
        shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <span className="group-hover:animate-bounce">{tool.icon}</span>
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tool.color} 
          opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300`} />
      </div>

      {/* Content */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 group-hover:text-violet-700 transition-colors">
        {tool.name}
      </h2>
      <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed line-clamp-2">
        {tool.description}
      </p>

      {/* Button */}
      <div className={`inline-flex items-center gap-2 px-5 py-2.5 
        bg-gradient-to-r ${tool.color} text-white font-semibold rounded-full
        ${tool.comingSoon ? '' : 'group-hover:shadow-lg group-hover:scale-105'} transition-all duration-300`}>
        <span>{tool.comingSoon ? 'Sắp ra mắt' : 'Mở tool'}</span>
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
