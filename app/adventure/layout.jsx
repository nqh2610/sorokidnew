import { Suspense } from 'react';

export const metadata = {
  title: 'Đi Tìm Kho Báu Tri Thức - SoroKids Game',
  description: 'Cùng Cú Soro khám phá vùng đất bí ẩn và tìm Kho Báu Tri Thức! Game học Soroban hấp dẫn dành cho trẻ em.',
  openGraph: {
    title: 'Đi Tìm Kho Báu Tri Thức - SoroKids Game',
    description: 'Cùng Cú Soro khám phá vùng đất bí ẩn và tìm Kho Báu Tri Thức!',
    type: 'website',
  },
};

export default function AdventureLayout({ children }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100">
      <div className="text-center">
        <div className="text-8xl mb-4 animate-bounce">🦉</div>
        <div className="text-5xl mb-4 animate-float-slow">🗺️</div>
        <h2 className="text-2xl font-black text-amber-800 mb-2">
          Đang mở cửa Kho Báu...
        </h2>
        <p className="text-amber-600">
          Cú Soro đang chuẩn bị hành trình cho con!
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <span className="text-2xl animate-bounce delay-100">✨</span>
          <span className="text-2xl animate-bounce delay-200">💎</span>
          <span className="text-2xl animate-bounce delay-300">🏆</span>
        </div>
      </div>
    </div>
  );
}
