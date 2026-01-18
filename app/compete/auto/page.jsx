'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocalizedUrl } from '@/components/LocalizedLink';
import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * 🏆 AUTO-START COMPETE PAGE
 * 
 * Route: /compete/auto?mode=xxx&questions=x
 * 
 * Auto-start competition with pre-selected mode and questions
 * Used for Adventure Map - player doesn't need to select again
 */
export default function AutoCompetePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const localizeUrl = useLocalizedUrl();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push(localizeUrl('/login'));
      return;
    }

    // Get params from URL
    const mode = searchParams.get('mode');
    const difficulty = searchParams.get('difficulty') || '1';
    const questions = searchParams.get('questions') || '10';
    const from = searchParams.get('from') || 'adventure';
    const zoneId = searchParams.get('zoneId');
    const mapType = searchParams.get('mapType') || 'addsub';
    const stageName = searchParams.get('stageName') || t('common.compete');
    const stageIcon = searchParams.get('stageIcon') || '🏆';

    // Validate mode
    const validModes = [
      'addition', 'subtraction', 'addSubMixed',
      'multiplication', 'division', 'mulDiv', 'mixed',
      'mentalMath', 'flashAnzan'
    ];

    if (!mode || !validModes.includes(mode)) {
      setError(t('competeScreen.invalidMode'));
      setLoading(false);
      return;
    }

    // 🔧 FIX: Merge data from competeGameMode (already saved by adventure page)
    // competeGameMode contains full zoneId, stageId, mapType
    let mergedZoneId = zoneId;
    let mergedMapType = mapType;
    let mergedStageId = null;
    let mergedStageName = stageName;
    let mergedStageIcon = stageIcon;

    try {
      const gameModeRaw = sessionStorage.getItem('competeGameMode');
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
      console.error('[Compete Auto] Error reading competeGameMode:', e);
    }

    // Lưu vào sessionStorage để Compete page đọc
    const autoStartData = {
      mode,
      difficulty: parseInt(difficulty),
      questions: parseInt(questions),
      from,
      zoneId: mergedZoneId,
      mapType: mergedMapType,
      stageId: mergedStageId,
      stageName: decodeURIComponent(mergedStageName),
      stageIcon: decodeURIComponent(mergedStageIcon),
      timestamp: Date.now()
    };

    sessionStorage.setItem('competeAutoStart', JSON.stringify(autoStartData));
    
    // Redirect to Compete page
    router.replace(localizeUrl('/compete'));
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, searchParams]); // 🔧 FIX: Loại bỏ router, localizeUrl, t

  // Loading state
  if (loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🏆</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('competeScreen.preparingArena')}</h2>
          <p className="text-gray-600">{t('competeScreen.soroOpeningArena')}</p>
          
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('competeScreen.errorOccurred')}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push(localizeUrl('/adventure'))}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            {t('competeScreen.backToMap')}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
