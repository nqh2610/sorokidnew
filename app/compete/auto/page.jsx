'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * 🏆 AUTO-START COMPETE PAGE
 * 
 * Route: /compete/auto?mode=xxx&questions=x
 * 
 * Tự động bắt đầu thi đấu với mode và số câu đã chọn sẵn
 * Dùng cho Adventure Map - người chơi không cần chọn lại
 */
export default function AutoCompetePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Lấy params từ URL
    const mode = searchParams.get('mode');
    const difficulty = searchParams.get('difficulty') || '1';
    const questions = searchParams.get('questions') || '10';
    const from = searchParams.get('from') || 'adventure';
    const zoneId = searchParams.get('zoneId');
    const mapType = searchParams.get('mapType') || 'addsub';
    const stageName = searchParams.get('stageName') || 'Thi đấu';
    const stageIcon = searchParams.get('stageIcon') || '🏆';

    // Validate mode
    const validModes = [
      'addition', 'subtraction', 'addSubMixed',
      'multiplication', 'division', 'mulDiv', 'mixed',
      'mentalMath', 'flashAnzan'
    ];

    if (!mode || !validModes.includes(mode)) {
      setError('Mode không hợp lệ');
      setLoading(false);
      return;
    }

    // Lưu vào sessionStorage để Compete page đọc
    const autoStartData = {
      mode,
      difficulty: parseInt(difficulty),
      questions: parseInt(questions),
      from,
      zoneId,
      mapType,
      stageName: decodeURIComponent(stageName),
      stageIcon: decodeURIComponent(stageIcon),
      timestamp: Date.now()
    };

    sessionStorage.setItem('competeAutoStart', JSON.stringify(autoStartData));
    
    // Redirect đến Compete page
    router.replace('/compete');
    
  }, [status, router, searchParams]);

  // Loading state
  if (loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🏆</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đang chuẩn bị...</h2>
          <p className="text-gray-600">Cú Soro đang mở đấu trường cho con!</p>
          
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/adventure')}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Quay lại Map
          </button>
        </div>
      </div>
    );
  }

  return null;
}
