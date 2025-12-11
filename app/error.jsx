'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">😵</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Ối! Có lỗi xảy ra
        </h1>
        <p className="text-gray-600 mb-8">
          Đừng lo, hãy thử tải lại trang hoặc quay về trang chủ nhé!
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 text-left bg-red-100 rounded-xl p-4">
            <p className="text-red-800 text-sm font-mono break-all">
              {error.message || error.toString()}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
          >
            🔄 Thử lại
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
          >
            🏠 Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
