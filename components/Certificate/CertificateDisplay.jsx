'use client';

import { Award, Download, Share2, Calendar, Star, Target, Clock } from 'lucide-react';

/**
 * CertificateDisplay - Hiển thị chứng chỉ hoàn thành
 */
export default function CertificateDisplay({ certificate }) {
  if (!certificate) return null;

  const {
    uniqueCode,
    studentName,
    levelCompleted,
    lessonsCount,
    totalStars,
    averageAccuracy,
    completionDate
  } = certificate;

  const formattedDate = new Date(completionDate).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="bg-gradient-to-br from-amber-50 via-white to-purple-50 rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-200">
      {/* Header with gold gradient */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 p-6 text-center relative">
        <div className="absolute inset-0 bg-[url('/certificate-pattern.svg')] opacity-10" />
        <div className="relative z-10">
          <div className="text-5xl mb-2">🏆</div>
          <h1 className="text-2xl font-black text-amber-900">CHỨNG CHỈ</h1>
          <p className="text-amber-800 font-medium">Hoàn thành khóa học Soroban</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 text-center">
        {/* Student Name */}
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-1">Chứng nhận</p>
          <h2 className="text-3xl font-black text-gray-800 border-b-2 border-amber-300 pb-2 inline-block px-8">
            {studentName}
          </h2>
        </div>

        {/* Achievement */}
        <p className="text-gray-600 mb-6">
          Đã hoàn thành xuất sắc <span className="font-bold text-purple-600">Level {levelCompleted}</span>
          <br />
          với <span className="font-bold text-amber-600">{lessonsCount} bài học</span>
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 rounded-xl p-3">
            <Star className="w-6 h-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-black text-purple-600">{totalStars}</p>
            <p className="text-xs text-gray-500">Tổng sao</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <Target className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-black text-green-600">{averageAccuracy}%</p>
            <p className="text-xs text-gray-500">Độ chính xác</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-blue-600">{formattedDate}</p>
            <p className="text-xs text-gray-500">Ngày cấp</p>
          </div>
        </div>

        {/* Certificate Code */}
        <div className="bg-gray-100 rounded-xl p-3 mb-6">
          <p className="text-xs text-gray-500 mb-1">Mã chứng chỉ</p>
          <p className="font-mono font-bold text-gray-700">{uniqueCode}</p>
        </div>

        {/* Verification */}
        <p className="text-xs text-gray-400">
          Xác thực tại: sorokid.com/certificate/verify/{uniqueCode}
        </p>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 flex justify-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors">
          <Download size={16} />
          Tải về
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
          <Share2 size={16} />
          Chia sẻ
        </button>
      </div>
    </div>
  );
}

/**
 * CertificateCard - Card nhỏ gọn hiển thị chứng chỉ
 */
export function CertificateCard({ certificate, onClick }) {
  const { levelCompleted, completionDate, uniqueCode } = certificate;
  const formattedDate = new Date(completionDate).toLocaleDateString('vi-VN');

  return (
    <button
      onClick={onClick}
      className="bg-gradient-to-br from-amber-50 to-purple-50 rounded-2xl p-4 border-2 border-amber-200 hover:border-amber-400 transition-all hover:shadow-lg text-left w-full"
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">🏆</div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">Level {levelCompleted}</h3>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
        <Award className="text-amber-500" size={20} />
      </div>
    </button>
  );
}
