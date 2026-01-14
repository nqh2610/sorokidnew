'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocalizedUrl } from '@/components/LocalizedLink';

/**
 * 🎯 AUTO-START PRACTICE PAGE
 * 
 * Route: /practice/auto?mode=xxx&difficulty=x
 * 
 * Tự động bắt đầu game Practice với mode và difficulty đã chọn sẵn
 * Dùng cho Adventure Map - người chơi không cần chọn lại
 */
export default function AutoPracticePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const localizeUrl = useLocalizedUrl();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push(localizeUrl('/login'));
      return;
    }

    // Lấy params từ URL
    const mode = searchParams.get('mode');
    const difficulty = searchParams.get('difficulty') || '1';
    const from = searchParams.get('from') || 'adventure';
    const zoneId = searchParams.get('zoneId');
    const mapType = searchParams.get('mapType') || 'addsub';
    const stageName = searchParams.get('stageName') || 'Luyện tập';
    const stageIcon = searchParams.get('stageIcon') || '🎯';

    // Validate mode
    const validModes = [
      'addition', 'subtraction', 'addSubMixed',
      'multiplication', 'division', 'mulDiv', 'mixed',
      'mentalMath', 'flashAnzan', 'create'
    ];

    if (!mode || !validModes.includes(mode)) {
      setError('Mode không hợp lệ');
      setLoading(false);
      return;
    }

    // 🔧 FIX: Merge data từ practiceGameMode (đã được adventure page lưu trước đó)
    // practiceGameMode chứa đầy đủ zoneId, stageId, mapType
    let mergedZoneId = zoneId;
    let mergedMapType = mapType;
    let mergedStageId = null;
    let mergedStageName = stageName;
    let mergedStageIcon = stageIcon;

    try {
      const gameModeRaw = sessionStorage.getItem('practiceGameMode');
      if (gameModeRaw) {
        const gameModeData = JSON.parse(gameModeRaw);
        // Chỉ merge nếu data còn valid (trong 5 phút)
        if (Date.now() - gameModeData.timestamp < 5 * 60 * 1000) {
          mergedZoneId = gameModeData.zoneId || mergedZoneId;
          mergedMapType = gameModeData.mapType || mergedMapType;
          mergedStageId = gameModeData.stageId || mergedStageId;
          mergedStageName = gameModeData.stageName || mergedStageName;
          mergedStageIcon = gameModeData.stageIcon || mergedStageIcon;
        }
      }
    } catch (e) {
      console.error('[Practice Auto] Error reading practiceGameMode:', e);
    }

    // Lưu vào sessionStorage để Practice page đọc
    const autoStartData = {
      mode,
      difficulty: parseInt(difficulty),
      from,
      zoneId: mergedZoneId,
      mapType: mergedMapType,
      stageId: mergedStageId,
      stageName: decodeURIComponent(mergedStageName),
      stageIcon: decodeURIComponent(mergedStageIcon),
      timestamp: Date.now()
    };

    sessionStorage.setItem('practiceAutoStart', JSON.stringify(autoStartData));
    
    // Redirect đến Practice page
    router.replace(localizeUrl('/practice'));
    
  }, [status, router, localizeUrl, searchParams]);

  // Loading state
  if (loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🎮</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đang chuẩn bị...</h2>
          <p className="text-gray-600">Cú Soro đang mở bài luyện cho con!</p>
          
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
            onClick={() => router.push(localizeUrl('/adventure'))}
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
