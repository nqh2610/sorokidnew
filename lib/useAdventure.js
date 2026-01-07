'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ADVENTURE_ZONES, getZoneById, GUIDE_CHARACTER } from '@/config/adventure.config';

/**
 * 🎮 Hook quản lý Adventure Map
 * - Lấy tiến trình từ API (dùng data có sẵn trong DB)
 * - Quản lý state zones, navigation
 * - Xử lý điều hướng đến bài học/luyện tập
 */
export function useAdventure() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data từ API
  const [data, setData] = useState({
    user: null,
    progress: null,
    zones: {},
    guide: GUIDE_CHARACTER,
    certificates: []
  });

  // UI State
  const [selectedZone, setSelectedZone] = useState(null);
  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const [storyType, setStoryType] = useState('intro'); // intro | mission | complete

  /**
   * Fetch tiến trình từ API
   */
  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/adventure/progress');
      if (!res.ok) {
        throw new Error('Failed to fetch adventure progress');
      }
      
      const result = await res.json();
      if (result.success) {
        setData({
          user: result.user,
          progress: result.progress,
          zones: result.zones,
          guide: result.guide,
          certificates: result.certificates
        });

        // Auto-select current zone nếu chưa có selection
        if (!selectedZone && result.progress?.currentZoneId) {
          setSelectedZone(result.progress.currentZoneId);
        }
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Adventure fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedZone]);

  // Fetch on mount
  useEffect(() => {
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Lấy thông tin zone đầy đủ (config + status)
   */
  const getZoneInfo = useCallback((zoneId) => {
    const config = getZoneById(zoneId);
    const status = data.zones[zoneId];
    return config ? { ...config, ...status } : null;
  }, [data.zones]);

  /**
   * Lấy tất cả zones với thông tin đầy đủ
   */
  const getAllZones = useCallback(() => {
    return ADVENTURE_ZONES.map(zone => ({
      ...zone,
      ...data.zones[zone.id]
    }));
  }, [data.zones]);

  /**
   * Chọn zone và hiển thị story
   */
  const selectZone = useCallback((zoneId) => {
    const zoneStatus = data.zones[zoneId];
    if (!zoneStatus) return;

    setSelectedZone(zoneId);
    
    // Nếu zone locked, không làm gì
    if (zoneStatus.status === 'locked') return;

    // Hiển thị story tương ứng
    if (zoneStatus.status === 'completed') {
      setStoryType('complete');
    } else {
      setStoryType('intro');
    }
    setShowStoryDialog(true);
  }, [data.zones]);

  /**
   * Bắt đầu challenge (điều hướng đến bài học/luyện tập)
   */
  const startChallenge = useCallback((challenge) => {
    if (!challenge) return;

    switch (challenge.type) {
      case 'learn':
        // Điều hướng đến trang learn với query param để auto-select level
        router.push(`/learn?level=${challenge.levelId}`);
        break;
      case 'practice':
        router.push(`/practice?mode=${challenge.mode}&difficulty=${challenge.minDifficulty || 1}`);
        break;
      case 'compete':
        router.push(`/compete?mode=${challenge.mode}`);
        break;
      case 'special':
        if (challenge.link) {
          router.push(challenge.link);
        }
        break;
      case 'milestone':
        router.push('/certificate');
        break;
      default:
        break;
    }
  }, [router]);

  /**
   * Bắt đầu zone (vào challenge đầu tiên chưa complete)
   */
  const startZone = useCallback((zoneId) => {
    const zoneStatus = data.zones[zoneId];
    if (!zoneStatus || zoneStatus.status === 'locked') return;

    // Tìm challenge đầu tiên chưa complete
    const firstIncomplete = zoneStatus.challenges?.find(c => !c.isComplete);
    if (firstIncomplete) {
      startChallenge(firstIncomplete);
    } else {
      // Tất cả đã complete, vào challenge đầu tiên
      const firstChallenge = zoneStatus.challenges?.[0];
      if (firstChallenge) {
        startChallenge(firstChallenge);
      }
    }
  }, [data.zones, startChallenge]);

  /**
   * Đóng story dialog
   */
  const closeStoryDialog = useCallback(() => {
    setShowStoryDialog(false);
  }, []);

  /**
   * Chuyển sang mission story (sau khi đọc intro)
   */
  const showMission = useCallback(() => {
    setStoryType('mission');
  }, []);

  /**
   * Lấy zones theo chapter
   */
  const getZonesByChapter = useCallback((chapter) => {
    return ADVENTURE_ZONES
      .filter(z => z.chapter === chapter)
      .map(zone => ({
        ...zone,
        ...data.zones[zone.id]
      }));
  }, [data.zones]);

  /**
   * Kiểm tra có thể nhận chứng chỉ không
   */
  const canClaimCertificate = useCallback((certType) => {
    // addSub: hoàn thành milestone-addsub-cert
    // complete: hoàn thành milestone-complete-cert
    const milestoneMap = {
      'addSub': 'milestone-addsub-cert',
      'complete': 'milestone-complete-cert'
    };
    
    const milestoneId = milestoneMap[certType];
    if (!milestoneId) return false;

    const milestoneStatus = data.zones[milestoneId];
    return milestoneStatus?.status === 'completed' && !data.certificates.includes(certType);
  }, [data.zones, data.certificates]);

  return {
    // Loading/Error states
    loading,
    error,
    
    // Data
    user: data.user,
    progress: data.progress,
    zones: data.zones,
    guide: data.guide,
    certificates: data.certificates,
    
    // UI State
    selectedZone,
    showStoryDialog,
    storyType,
    
    // Actions
    fetchProgress,
    getZoneInfo,
    getAllZones,
    getZonesByChapter,
    selectZone,
    startZone,
    startChallenge,
    closeStoryDialog,
    showMission,
    setSelectedZone,
    canClaimCertificate
  };
}

export default useAdventure;
