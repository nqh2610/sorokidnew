import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { ADVENTURE_ZONES, GUIDE_CHARACTER, getGreeting, getGuideMessage } from '@/config/adventure.config';

export const dynamic = 'force-dynamic';

/**
 * GET /api/adventure/progress
 * Tính toán tiến trình phiêu lưu từ dữ liệu có sẵn trong DB
 * Không cần thêm table mới!
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Lấy tất cả dữ liệu cần thiết từ DB có sẵn
    const [user, progress, exerciseResults, competeResults, certificates] = await Promise.all([
      // Thông tin user
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, tier: true, level: true, totalStars: true, avatar: true }
      }),
      // Tiến độ học (Progress table)
      prisma.progress.findMany({
        where: { userId, completed: true },
        select: { levelId: true, lessonId: true, starsEarned: true, completedAt: true }
      }),
      // Kết quả luyện tập (ExerciseResult table)
      prisma.exerciseResult.findMany({
        where: { userId },
        select: { exerciseType: true, difficulty: true, isCorrect: true, createdAt: true }
      }),
      // Kết quả thi đấu (CompeteResult table)
      prisma.competeResult.findMany({
        where: { userId },
        select: { arenaId: true, correct: true, stars: true, createdAt: true }
      }),
      // Chứng chỉ đã nhận
      prisma.certificate.findMany({
        where: { userId },
        select: { certType: true, issuedAt: true }
      })
    ]);

    // Tính toán trạng thái từng zone
    const zoneStatuses = calculateZoneStatuses(
      progress,
      exerciseResults,
      competeResults,
      certificates
    );

    // Tìm zone hiện tại (zone đầu tiên chưa hoàn thành mà đã mở)
    const currentZone = findCurrentZone(zoneStatuses);
    
    // Tính tổng tiến trình
    const completedZones = Object.values(zoneStatuses).filter(z => z.status === 'completed').length;
    const totalZones = ADVENTURE_ZONES.length;
    const overallProgress = Math.round((completedZones / totalZones) * 100);

    // Tính số chapter đã hoàn thành
    const completedChapters = new Set(
      ADVENTURE_ZONES
        .filter(z => zoneStatuses[z.id]?.status === 'completed')
        .map(z => z.chapter)
    ).size;

    // Lấy thông điệp từ guide
    const guideGreeting = getGreeting();
    const guideMessage = currentZone 
      ? ADVENTURE_ZONES.find(z => z.id === currentZone)?.story.intro 
      : getGuideMessage('complete');

    return NextResponse.json({
      success: true,
      user: {
        name: user?.name,
        tier: user?.tier,
        level: user?.level,
        totalStars: user?.totalStars,
        avatar: user?.avatar
      },
      progress: {
        overall: overallProgress,
        completedZones,
        totalZones,
        completedChapters,
        totalChapters: Math.max(...ADVENTURE_ZONES.map(z => z.chapter)),
        currentZoneId: currentZone
      },
      zones: zoneStatuses,
      guide: {
        ...GUIDE_CHARACTER,
        greeting: guideGreeting,
        currentMessage: guideMessage
      },
      certificates: certificates.map(c => c.certType)
    });

  } catch (error) {
    console.error('Error fetching adventure progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Tính toán trạng thái của từng zone
 */
function calculateZoneStatuses(progress, exerciseResults, competeResults, certificates) {
  const statuses = {};
  
  // Tạo lookup maps để query nhanh
  const completedLevels = new Set(progress.map(p => p.levelId));
  
  // Group exercise results by mode
  const exerciseByMode = {};
  exerciseResults.forEach(e => {
    if (!exerciseByMode[e.exerciseType]) {
      exerciseByMode[e.exerciseType] = { total: 0, correct: 0, byDifficulty: {} };
    }
    exerciseByMode[e.exerciseType].total++;
    if (e.isCorrect) exerciseByMode[e.exerciseType].correct++;
    
    // Track by difficulty
    const diff = e.difficulty || 1;
    if (!exerciseByMode[e.exerciseType].byDifficulty[diff]) {
      exerciseByMode[e.exerciseType].byDifficulty[diff] = { total: 0, correct: 0 };
    }
    exerciseByMode[e.exerciseType].byDifficulty[diff].total++;
    if (e.isCorrect) exerciseByMode[e.exerciseType].byDifficulty[diff].correct++;
  });

  // Group compete results by mode
  const competeByMode = {};
  competeResults.forEach(c => {
    const [mode, difficulty] = c.arenaId.split('-');
    if (!competeByMode[mode]) {
      competeByMode[mode] = { bestCorrect: 0, attempts: 0 };
    }
    competeByMode[mode].attempts++;
    if (c.correct > competeByMode[mode].bestCorrect) {
      competeByMode[mode].bestCorrect = c.correct;
    }
  });

  // Certificates lookup
  const earnedCerts = new Set(certificates.map(c => c.certType));

  // Process từng zone
  ADVENTURE_ZONES.forEach((zone, index) => {
    // Kiểm tra điều kiện mở khóa
    const isUnlocked = checkUnlockCondition(zone, statuses);
    
    // Kiểm tra từng challenge trong zone
    const challengeStatuses = zone.challenges.map(challenge => {
      const isComplete = checkChallengeComplete(
        challenge,
        completedLevels,
        exerciseByMode,
        competeByMode,
        earnedCerts
      );
      return {
        ...challenge,
        isComplete,
        progress: calculateChallengeProgress(
          challenge,
          completedLevels,
          exerciseByMode,
          competeByMode,
          earnedCerts
        )
      };
    });

    // Zone hoàn thành khi tất cả challenges đều complete
    const allChallengesComplete = challengeStatuses.every(c => c.isComplete);
    const completedChallenges = challengeStatuses.filter(c => c.isComplete).length;
    
    let status = 'locked';
    if (isUnlocked) {
      status = allChallengesComplete ? 'completed' : 'available';
    }

    statuses[zone.id] = {
      id: zone.id,
      status,
      isUnlocked,
      challenges: challengeStatuses,
      completedChallenges,
      totalChallenges: zone.challenges.length,
      progress: Math.round((completedChallenges / zone.challenges.length) * 100)
    };
  });

  return statuses;
}

/**
 * Kiểm tra điều kiện mở khóa zone
 */
function checkUnlockCondition(zone, statuses) {
  if (!zone.unlockRequirement) return true; // Zone đầu tiên

  const { type, zoneId } = zone.unlockRequirement;
  
  if (type === 'zone_complete') {
    return statuses[zoneId]?.status === 'completed';
  }
  
  return false;
}

/**
 * Kiểm tra challenge đã hoàn thành chưa
 */
function checkChallengeComplete(challenge, completedLevels, exerciseByMode, competeByMode, earnedCerts) {
  const condition = challenge.completeCondition;
  if (!condition) return false;

  switch (condition.type) {
    case 'level_complete':
      return completedLevels.has(condition.levelId);

    case 'practice_correct': {
      const modeData = exerciseByMode[condition.mode];
      if (!modeData) return false;
      
      // Nếu có yêu cầu minDifficulty
      if (condition.minDifficulty) {
        let correctCount = 0;
        Object.entries(modeData.byDifficulty).forEach(([diff, data]) => {
          if (parseInt(diff) >= condition.minDifficulty) {
            correctCount += data.correct;
          }
        });
        return correctCount >= condition.minCorrect;
      }
      
      return modeData.correct >= condition.minCorrect;
    }

    case 'compete_score': {
      const modeData = competeByMode[condition.mode];
      if (!modeData) return false;
      return modeData.bestCorrect >= condition.minCorrect;
    }

    case 'certificate':
      return earnedCerts.has(condition.certType);

    default:
      return false;
  }
}

/**
 * Tính % tiến độ của challenge
 */
function calculateChallengeProgress(challenge, completedLevels, exerciseByMode, competeByMode, earnedCerts) {
  const condition = challenge.completeCondition;
  if (!condition) return 0;

  switch (condition.type) {
    case 'level_complete':
      return completedLevels.has(condition.levelId) ? 100 : 0;

    case 'practice_correct': {
      const modeData = exerciseByMode[condition.mode];
      if (!modeData) return 0;
      
      let correctCount = 0;
      if (condition.minDifficulty) {
        Object.entries(modeData.byDifficulty).forEach(([diff, data]) => {
          if (parseInt(diff) >= condition.minDifficulty) {
            correctCount += data.correct;
          }
        });
      } else {
        correctCount = modeData.correct;
      }
      
      return Math.min(100, Math.round((correctCount / condition.minCorrect) * 100));
    }

    case 'compete_score': {
      const modeData = competeByMode[condition.mode];
      if (!modeData) return 0;
      return Math.min(100, Math.round((modeData.bestCorrect / condition.minCorrect) * 100));
    }

    case 'certificate':
      return earnedCerts.has(condition.certType) ? 100 : 0;

    default:
      return 0;
  }
}

/**
 * Tìm zone hiện tại (zone đầu tiên available chưa complete)
 */
function findCurrentZone(zoneStatuses) {
  for (const zone of ADVENTURE_ZONES) {
    const status = zoneStatuses[zone.id];
    if (status && status.status === 'available') {
      return zone.id;
    }
  }
  // Nếu tất cả đã complete hoặc locked, trả về zone cuối cùng completed
  const completedZones = ADVENTURE_ZONES.filter(z => zoneStatuses[z.id]?.status === 'completed');
  return completedZones.length > 0 ? completedZones[completedZones.length - 1].id : ADVENTURE_ZONES[0].id;
}
