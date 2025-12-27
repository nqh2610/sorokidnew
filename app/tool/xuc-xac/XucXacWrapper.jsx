'use client';

import dynamic from 'next/dynamic';

const XucXac3DClient = dynamic(() => import('./XucXac3DClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Đang tải...</div>
    </div>
  ),
});

export default function XucXacWrapper() {
  return <XucXac3DClient />;
}
