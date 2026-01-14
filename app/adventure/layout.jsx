import { Suspense } from 'react';
import { getLocale } from '@/lib/i18n/get-locale';
import { getDictionary } from '@/lib/i18n/dictionary';

/**
 * 🎮 ADVENTURE LAYOUT
 * 
 * ⚠️ LƯU Ý: Trang này CẦN LOGIN
 * - KHÔNG index trên Google
 * - KHÔNG đưa vào sitemap
 */

export const metadata = {
  title: 'Đi Tìm Kho Báu Tri Thức | Sorokid',
  description: 'Game học Soroban hấp dẫn dành cho trẻ em.',
  // KHÔNG INDEX - trang cần login
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AdventureLayout({ children }) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  
  return (
    <Suspense fallback={<LoadingFallback dict={dict} />}>
      {children}
    </Suspense>
  );
}

function LoadingFallback({ dict }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100">
      <div className="text-center">
        <div className="text-8xl mb-4 animate-bounce">🦉</div>
        <div className="text-5xl mb-4 animate-float-slow">🗺️</div>
        <h2 className="text-2xl font-black text-amber-800 mb-2">
          {dict?.adventureGame?.loadingTreasure || 'Đang mở cửa Kho Báu...'}
        </h2>
        <p className="text-amber-600">
          {dict?.adventureGame?.loadingPreparing || 'Cú Soro đang chuẩn bị hành trình cho con!'}
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
