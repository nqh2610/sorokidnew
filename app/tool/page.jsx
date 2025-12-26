'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo/Logo';

// Tool data configuration
const tools = [
  {
    id: 'chiec-non-ky-dieu',
    name: 'Chiếc Nón Kỳ Diệu',
    description: 'Quay số ngẫu nhiên để gọi học sinh, chọn câu hỏi, chọn lượt chơi',
    icon: '🎡',
    color: 'from-pink-400 to-purple-500',
    bgColor: 'bg-gradient-to-br from-pink-50 to-purple-50',
  },
  {
    id: 'dua-thu-hoat-hinh',
    name: 'Đua Vịt Sông Nước',
    description: 'Nhập tên học sinh, hàng trăm vịt cùng đua trên sông, hồi hộp!',
    icon: '🦆',
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
  },
  {
    id: 'flash-zan',
    name: 'Flash ZAN',
    description: 'Luyện tính nhẩm nhanh với flash số, phù hợp Soroban & Anzan',
    icon: '⚡',
    color: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
  },
  {
    id: 'dong-ho-bam-gio',
    name: 'Đồng Hồ Bấm Giờ',
    description: 'Timer đếm ngược với âm thanh, hiển thị to rõ cho lớp học',
    icon: '⏱️',
    color: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
  },
  {
    id: 'chia-nhom-boc-tham',
    name: 'Chia Nhóm & Bốc Thăm',
    description: 'Chia nhóm ngẫu nhiên, bốc thăm học sinh, chọn nhóm trưởng tự động',
    icon: '👥',
    color: 'from-violet-400 to-pink-500',
    bgColor: 'bg-gradient-to-br from-violet-50 to-pink-50',
  },
  {
    id: 'den-may-man',
    name: 'Đèn May Mắn',
    description: 'Xanh = Thoát, Đỏ = Bị phạt! Tạo hồi hộp vui nhộn cho lớp học',
    icon: '🚦',
    color: 'from-emerald-400 to-red-500',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-red-50',
  },
];

export default function ToolboxPage() {
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
              <span className="hidden sm:inline-block text-sm text-gray-500">
                Toolbox Giáo Viên
              </span>
              <Link 
                href="/"
                className="px-4 py-2 text-sm font-medium text-violet-600 hover:text-violet-700 
                  hover:bg-violet-50 rounded-full transition-all"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 sm:py-12 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 
            rounded-full text-sm font-medium mb-6 animate-bounce">
            <span>🧰</span>
            <span>Miễn phí • Không cần đăng nhập</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800 mb-4 leading-tight">
            <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              Toolbox Giáo Viên
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Bộ công cụ dạy học vui nhộn, chạy 100% trên trình duyệt.
            <br className="hidden sm:block" />
            Mở là dùng ngay! 🎉
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-500 
            rounded-full text-sm">
            <span>🚀</span>
            <span>Thêm nhiều công cụ mới đang được phát triển...</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Logo size="sm" showText={true} />
          </div>
          <p className="text-sm text-gray-500">
            Công cụ dạy học miễn phí cho giáo viên tiểu học
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © 2024 Sorokid. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Tool Card Component
function ToolCard({ tool, index }) {
  return (
    <Link
      href={`/tool/${tool.id}`}
      className={`group relative ${tool.bgColor} rounded-3xl p-6 sm:p-8 
        border-2 border-white shadow-lg hover:shadow-2xl 
        transform hover:-translate-y-2 transition-all duration-300
        overflow-hidden cursor-pointer`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
      
      {/* Icon */}
      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${tool.color} 
        flex items-center justify-center text-4xl sm:text-5xl mb-6
        shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {tool.icon}
      </div>

      {/* Content */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 group-hover:text-violet-700 transition-colors">
        {tool.name}
      </h2>
      <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">
        {tool.description}
      </p>

      {/* Button */}
      <div className={`inline-flex items-center gap-2 px-5 py-2.5 
        bg-gradient-to-r ${tool.color} text-white font-semibold rounded-full
        group-hover:shadow-lg transition-all duration-300`}>
        <span>Mở tool</span>
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </Link>
  );
}
