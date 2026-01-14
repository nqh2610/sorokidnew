'use client';

import dynamic from 'next/dynamic';

const DauTruongClient = dynamic(
  () => import('./DauTruongClient'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Đang tải Đấu Trường Kiến Thức...</p>
        </div>
      </div>
    )
  }
);

export default function DauTruongWrapper() {
  return <DauTruongClient />;
}
