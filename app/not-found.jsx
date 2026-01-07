'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-6xl font-bold text-purple-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Không tìm thấy trang
        </h2>
        <p className="text-gray-600 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển đi nơi khác.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
          >
            🏠 Về trang chủ
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
          >
            📊 Bảng điều khiển
          </Link>
        </div>

        {/* Fun suggestions */}
        <div className="mt-12">
          <p className="text-gray-500 mb-4">Hay thử các trang này nhé:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/learn" className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
              📚 Học tập
            </Link>
            <Link href="/practice" className="px-4 py-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors">
              🎯 Luyện tập
            </Link>
            <Link href="/compete" className="px-4 py-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors">
              🏆 Thi đấu
            </Link>
            <Link href="/leaderboard" className="px-4 py-2 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200 transition-colors">
              🥇 Bảng xếp hạng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
