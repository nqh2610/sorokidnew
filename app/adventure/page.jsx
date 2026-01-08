'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GameMapNew from '@/components/Adventure/GameMapNew';
import { useUpgradeModal } from '@/components/UpgradeModal';

// Import config files
import { 
  GAME_STAGES as ADDSUB_STAGES, 
  GAME_ZONES as ADDSUB_ZONES 
} from '@/config/adventure-stages-addsub.config';
import { 
  GAME_STAGES_MULDIV as MULDIV_STAGES, 
  GAME_ZONES_MULDIV as MULDIV_ZONES 
} from '@/config/adventure-stages-muldiv.config';

// Helper: Kiểm tra tier
function getRequiredTierForLevel(levelId) {
  if (levelId <= 5) return 'free';
  if (levelId <= 10) return 'basic';
  return 'advanced';
}

function getRequiredTierForMode(mode) {
  const modeTiers = {
    addition: 'free',
    subtraction: 'free',
    addSubMixed: 'basic',
    multiplication: 'advanced',
    division: 'advanced',
    mulDiv: 'advanced',
    mixed: 'advanced',
    mentalMath: 'advanced',
    flashAnzan: 'advanced'
  };
  return modeTiers[mode] || 'free';
}

function getRequiredTierForDifficulty(difficulty) {
  if (difficulty <= 2) return 'free';
  if (difficulty <= 3) return 'basic';
  return 'advanced';
}

function canAccessTier(userTier, requiredTier) {
  const tierOrder = { free: 0, basic: 1, advanced: 2, vip: 3 };
  return (tierOrder[userTier] || 0) >= (tierOrder[requiredTier] || 0);
}

function getTierDisplayName(tier) {
  const names = { free: 'Miễn Phí', basic: 'Cơ Bản', advanced: 'Nâng Cao', vip: 'VIP' };
  return names[tier] || tier;
}

/**
 * 🏴‍☠️ ĐI TÌM KHO BÁU TRI THỨC - ADVENTURE PAGE
 * Game map hoàn toàn mới với 2 đảo: Cộng Trừ & Nhân Chia
 */
export default function AdventurePageV3() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showUpgradeModal, UpgradeModalComponent } = useUpgradeModal();
  
  const [loading, setLoading] = useState(true);
  const [stageStatuses, setStageStatuses] = useState({});
  const [hasCertAddSub, setHasCertAddSub] = useState(false);
  const [hasCertComplete, setHasCertComplete] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [returnZone, setReturnZone] = useState(null);
  const [returnZoneLoaded, setReturnZoneLoaded] = useState(false); // 🎯 Track khi đã đọc xong
  const [highestZone, setHighestZone] = useState(null); // Zone cao nhất đã hoàn thành

  // 🚀 PERF: AbortController để cancel request khi unmount
  const abortControllerRef = useRef(null);

  // 🎯 FIX: Đọc returnZone trong useEffect (sau khi mount) để tránh SSR issues
  useEffect(() => {
    try {
      const returnData = sessionStorage.getItem('adventureReturnZone');
      if (returnData) {
        const parsed = JSON.parse(returnData);
        // Chỉ sử dụng nếu data còn mới (trong 5 phút)
        if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          console.log('🎯 ReturnZone loaded from sessionStorage:', parsed.zoneId, parsed.mapType);
          setReturnZone(parsed);
        }
        // Xóa sau khi đọc
        sessionStorage.removeItem('adventureReturnZone');
      }
    } catch (e) {
      console.error('Error reading returnZone:', e);
    }
    // Đánh dấu đã đọc xong (dù có data hay không)
    setReturnZoneLoaded(true);
    
    // Clear game mode data khi vào Adventure
    sessionStorage.removeItem('learnGameMode');
    sessionStorage.removeItem('practiceGameMode');
    sessionStorage.removeItem('competeGameMode');
  }, []);

  // 🚀 TỐI ƯU: Dùng cached progress nếu còn valid (trong 2 phút)
  // Giảm API calls khi user quay lại Adventure map
  useEffect(() => {
    // Chờ session load xong
    if (status === 'loading') return;

    // Nếu chưa đăng nhập, không cần fetch
    if (!session?.user) {
      setLoading(false);
      return;
    }

    const cached = sessionStorage.getItem('adventureProgress');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Cache còn valid trong 2 phút
        if (Date.now() - timestamp < 2 * 60 * 1000) {
          console.log('🚀 Using cached adventure progress');
          applyProgressData(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        sessionStorage.removeItem('adventureProgress');
      }
    }
    fetchProgress();

    // 🚀 PERF: Cleanup - cancel pending request khi unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [session, status]);
  
  // 🚀 TỐI ƯU: Tách riêng logic apply data để tái sử dụng
  const applyProgressData = (data) => {
    const statuses = {};
    const completedStages = data.completedStages || [];
    
    // Process AddSub stages và tìm current stage
    let addSubCurrentStage = null;
    ADDSUB_STAGES.forEach((stage, index) => {
      if (completedStages.includes(stage.stageId)) {
        statuses[stage.stageId] = 'completed';
      } else if (index === 0 || completedStages.includes(ADDSUB_STAGES[index - 1]?.stageId)) {
        statuses[stage.stageId] = 'current';
        if (!addSubCurrentStage) addSubCurrentStage = stage;
      } else {
        statuses[stage.stageId] = 'locked';
      }
    });
    
    // Process MulDiv stages và tìm current stage
    let mulDivCurrentStage = null;
    if (data.certificates?.includes('addSub')) {
      MULDIV_STAGES.forEach((stage, index) => {
        if (completedStages.includes(stage.stageId)) {
          statuses[stage.stageId] = 'completed';
        } else if (index === 0 || completedStages.includes(MULDIV_STAGES[index - 1]?.stageId)) {
          statuses[stage.stageId] = 'current';
          if (!mulDivCurrentStage) mulDivCurrentStage = stage;
        } else {
          statuses[stage.stageId] = 'locked';
        }
      });
    } else {
      MULDIV_STAGES.forEach(stage => {
        statuses[stage.stageId] = 'locked';
      });
    }
    
    setStageStatuses(statuses);
    setHasCertAddSub(data.certificates?.includes('addSub') || false);
    setHasCertComplete(data.certificates?.includes('complete') || false);
    
    // 🎯 Tìm zone đang chơi (zone chứa current stage)
    // Ưu tiên MulDiv nếu đã có cert AddSub và đang chơi MulDiv
    // Nếu không thì hiện AddSub
    if (mulDivCurrentStage) {
      // Người chơi đã có cert và đang ở đảo MulDiv
      setHighestZone({ mapType: 'muldiv', zoneId: mulDivCurrentStage.zoneId });
    } else if (addSubCurrentStage) {
      // Người chơi đang ở đảo AddSub
      setHighestZone({ mapType: 'addsub', zoneId: addSubCurrentStage.zoneId });
    } else if (ADDSUB_ZONES.length > 0) {
      // Fallback: zone đầu tiên
      setHighestZone({ mapType: 'addsub', zoneId: ADDSUB_ZONES[0].zoneId });
    }
    
    // Lưu vào localStorage để debug
    try {
      localStorage.setItem('sorokid_current_zone', JSON.stringify({
        addsub: addSubCurrentStage?.zoneId || null,
        muldiv: mulDivCurrentStage?.zoneId || null,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Could not save current zone to localStorage');
    }
    
    if (data.user) {
      setUserStats({
        tier: data.user.tier || 'free',
        totalStars: data.user.totalStars || 0,
        diamonds: data.user.diamonds || 0,
        streak: data.user.streak || 0,
        trialExpiresAt: data.user.trialExpiresAt
      });
    }
  };
  
  const fetchProgress = async () => {
    // 🚀 PERF: Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Timeout 5s - nếu API chậm quá thì show map với default state
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ API timeout, using default state');
      abortControllerRef.current?.abort();
      const defaultStatuses = {};
      ADDSUB_STAGES.forEach((stage, index) => {
        defaultStatuses[stage.stageId] = index === 0 ? 'current' : 'locked';
      });
      MULDIV_STAGES.forEach(stage => {
        defaultStatuses[stage.stageId] = 'locked';
      });
      setStageStatuses(defaultStatuses);
      setLoading(false);
    }, 5000);

    try {
      const res = await fetch('/api/adventure/game-progress', {
        signal: abortControllerRef.current.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();

        // DEBUG LOG - xem trong browser console
        console.log('🎮 Adventure API Response:', data);
        console.log('📊 Completed stages:', data.completedStages);
        console.log('🔍 Debug info:', data.debug);

        // 🚀 TỐI ƯU: Cache progress vào sessionStorage
        sessionStorage.setItem('adventureProgress', JSON.stringify({
          data,
          timestamp: Date.now()
        }));

        // Apply data using shared function
        applyProgressData(data);
      } else {
        // API fail - set default: màn đầu tiên mở
        const defaultStatuses = {};
        ADDSUB_STAGES.forEach((stage, index) => {
          defaultStatuses[stage.stageId] = index === 0 ? 'current' : 'locked';
        });
        MULDIV_STAGES.forEach(stage => {
          defaultStatuses[stage.stageId] = 'locked';
        });
        setStageStatuses(defaultStatuses);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      // 🚀 PERF: Ignore abort errors (expected behavior)
      if (error.name === 'AbortError') {
        console.log('🚀 Fetch aborted (component unmounted or new request)');
        return;
      }
      console.error('Error fetching progress:', error);
      // Error - set default: màn đầu tiên mở
      const defaultStatuses = {};
      ADDSUB_STAGES.forEach((stage, index) => {
        defaultStatuses[stage.stageId] = index === 0 ? 'current' : 'locked';
      });
      MULDIV_STAGES.forEach(stage => {
        defaultStatuses[stage.stageId] = 'locked';
      });
      setStageStatuses(defaultStatuses);
    } finally {
      setLoading(false);
    }
  };
  
  // 🔒 TIER CHECK: Kiểm tra quyền truy cập stage TRƯỚC khi mở modal
  // Return true nếu có quyền, false nếu không (đã hiện popup upgrade)
  const handleTierCheck = useCallback((stage) => {
    const userTier = userStats?.tier || 'free';
    
    if (stage.type === 'lesson' && stage.levelId) {
      // Kiểm tra level cho bài học
      const requiredTier = getRequiredTierForLevel(stage.levelId);
      if (!canAccessTier(userTier, requiredTier)) {
        showUpgradeModal({ 
          feature: `Level ${stage.levelId} yêu cầu gói ${getTierDisplayName(requiredTier)} trở lên` 
        });
        return false;
      }
    } else if (stage.type === 'boss') {
      // Kiểm tra mode cho boss
      const mode = stage.practiceInfo?.mode || stage.competeInfo?.mode;
      const difficulty = stage.practiceInfo?.difficulty || stage.competeInfo?.difficulty || 1;
      
      if (mode) {
        const requiredTierForMode = getRequiredTierForMode(mode);
        if (!canAccessTier(userTier, requiredTierForMode)) {
          showUpgradeModal({ 
            feature: `Chế độ ${mode} yêu cầu gói ${getTierDisplayName(requiredTierForMode)} trở lên` 
          });
          return false;
        }
      }
      
      // Kiểm tra difficulty
      const requiredTierForDiff = getRequiredTierForDifficulty(difficulty);
      if (!canAccessTier(userTier, requiredTierForDiff)) {
        showUpgradeModal({ 
          feature: `Cấp độ ${difficulty} yêu cầu gói ${getTierDisplayName(requiredTierForDiff)} trở lên` 
        });
        return false;
      }
    }
    
    return true; // Có quyền truy cập
  }, [userStats, showUpgradeModal]);
  
  // Handle stage click - Lưu game mode info và navigate (không cần check tier nữa - đã check trước khi mở modal)
  const handleStageClick = useCallback((stage) => {
    if (!stage.link) return;
    
    // Xác định map type dựa trên stageId
    const isMulDiv = typeof stage.stageId === 'string' && stage.stageId.startsWith('md-');
    const mapType = isMulDiv ? 'muldiv' : 'addsub';

    // Lưu game mode info vào sessionStorage
    const gameModeData = {
      from: 'adventure',
      zoneId: stage.zoneId,
      mapType,
      stageName: stage.name,
      stageIcon: stage.icon,
      stageId: stage.stageId,
      stageType: stage.type,
      // 🔧 FIX: Thêm mode và difficulty cho practice/compete auto-start
      mode: stage.practiceInfo?.mode || stage.competeInfo?.mode || null,
      difficulty: stage.practiceInfo?.difficulty || stage.competeInfo?.difficulty || 1,
      questions: stage.competeInfo?.questions || 10,
      timestamp: Date.now()
    };

    // Lưu vào sessionStorage dựa vào loại stage
    if (stage.type === 'lesson') {
      sessionStorage.setItem('learnGameMode', JSON.stringify(gameModeData));
      router.push(stage.link);
    } else if (stage.type === 'boss' && stage.bossType === 'practice') {
      // 🚀 Practice: Lưu data và đi thẳng đến /practice
      sessionStorage.setItem('practiceGameMode', JSON.stringify(gameModeData));
      router.push('/practice');
    } else if (stage.type === 'boss' && stage.bossType === 'compete') {
      // 🚀 Compete: Lưu data và đi thẳng đến /compete
      sessionStorage.setItem('competeGameMode', JSON.stringify(gameModeData));
      router.push('/compete');
    } else {
      router.push(stage.link);
    }
  }, [router]);
  
  // Auth check
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-6xl animate-bounce">⏳</div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  // 🎯 Chờ returnZone được load xong trước khi render GameMapNew
  // Tránh render với returnZone=null rồi mới update
  if (!returnZoneLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-6xl animate-bounce">🗺️</div>
      </div>
    );
  }

  // 🎯 Xác định zone khởi đầu: ưu tiên returnZone (từ chơi trở về), sau đó highestZone
  const initialZone = returnZone || highestZone;
  console.log('🎯 Adventure render with initialZone:', initialZone);

  return (
    <>
      {/* 🔒 Upgrade Modal */}
      <UpgradeModalComponent />
      
      <GameMapNew
        addSubStages={ADDSUB_STAGES}
        addSubZones={ADDSUB_ZONES}
        mulDivStages={MULDIV_STAGES}
        mulDivZones={MULDIV_ZONES}
        stageStatuses={stageStatuses}
        hasCertAddSub={hasCertAddSub}
        hasCertComplete={hasCertComplete}
        onStageClick={handleStageClick}
        onTierCheck={handleTierCheck}
        isLoading={loading}
        userStats={userStats}
        returnZone={initialZone}
      />
    </>
  );
}
