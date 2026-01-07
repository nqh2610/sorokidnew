'use client';

import dynamic from 'next/dynamic';

const OChuClient = dynamic(() => import('./OChuClient'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🔤</div>
        <p className="text-gray-500">Đang tải Trò chơi Ô chữ...</p>
      </div>
    </div>
  )
});

export default function OChuPage() {
  return <OChuClient />;
}
