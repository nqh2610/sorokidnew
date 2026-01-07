import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import cache, { CACHE_TTL } from '@/lib/cache';
import { getEffectiveTierSync, getTrialSettings } from '@/lib/tierSystem';

export const dynamic = 'force-dynamic';

/**
 * Cấu hình yêu cầu cho từng loại chứng chỉ
 * 
 * 🗺️ Đồng bộ với Game Map:
 * - adventure-stages-addsub.config.js: Chứng chỉ Cộng Trừ (68 stages)
 * - adventure-stages-muldiv.config.js: Chứng chỉ Toàn Diện (40 stages)
 */
const CERT_REQUIREMENTS = {
  // ============================================================
  // 🎖️ CHỨNG CHỈ CỘNG TRỪ (Basic+)
  // Lộ trình: 10 Zone, 68 stages, 25 boss
  // ============================================================
  addSub: {
    name: 'Chứng chỉ Cộng Trừ Soroban',
    description: 'Chứng nhận năng lực Cộng Trừ hoàn chỉnh: Bàn tính + Siêu Trí Tuệ + Tốc Độ + Tia Chớp',
    icon: '🎖️',
    requiredTier: 'basic',
    requirements: {
      // Zone 1-5: Level 1-10 Cộng Trừ cơ bản
      // Zone 7: Level 15.1, 16.1 Anzan Cộng Trừ
      // Zone 8: Level 17.1 Tốc độ Cộng Trừ
      // Zone 9: Level 18.1-18.5 Flash Anzan
      lessons: {
        levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 18], // Level 1-10 + 15-18 (bài Cộng Trừ)
        // Note: Level 15-18 chỉ yêu cầu lesson 1 (Cộng Trừ), check bằng lessonId
        lessonFilter: {
          15: [1], // Level 15 chỉ lesson 1
          16: [1], // Level 16 chỉ lesson 1
          17: [1], // Level 17 chỉ lesson 1
          18: [1, 2, 3, 4, 5] // Level 18 tất cả lessons (Flash chỉ có Cộng Trừ)
        },
        weight: 30,
        description: 'Học: Level 1-10 + Anzan 15.1, 16.1 + Tốc độ 17.1 + Flash 18'
      },
      practice: {
        modes: ['addition', 'subtraction', 'addSubMixed'],
        minDifficulty: 2,
        minCorrect: 15, // Tăng để phù hợp game map
        weight: 25,
        description: 'Luyện tập: Cộng, Trừ, Cộng Trừ Mix cấp 2+, mỗi mode 15 bài đúng'
      },
      // Yêu cầu mới: Siêu Trí Tuệ Cộng Trừ (Zone 7)
      mentalMath: {
        minCorrect: 10,
        weight: 10,
        description: 'Siêu Trí Tuệ: 10 bài đúng (Cộng Trừ nhẩm)'
      },
      // Yêu cầu mới: Flash Anzan (Zone 9)
      flashAnzan: {
        minLevel: 1, // Ánh Nến
        minCorrect: 5,
        weight: 10,
        description: 'Tia Chớp: cấp Ánh Nến trở lên, 5 bài đúng'
      },
      compete: {
        modes: ['addition', 'subtraction', 'addSubMixed'],
        minDifficulty: 2,
        minCorrect: 6,
        weight: 15,
        description: 'Thi đấu: Cộng, Trừ, Cộng Trừ Mix đạt 6+ câu đúng'
      },
      accuracy: {
        minAccuracy: 70,
        weight: 10,
        description: 'Độ chính xác tổng từ 70% trở lên'
      }
    }
  },
  
  // ============================================================
  // 👑 CHỨNG CHỈ SOROBAN TOÀN DIỆN (Advanced+)
  // Yêu cầu: Có Chứng chỉ Cộng Trừ trước
  // Lộ trình: 7 Zone mới, 40 stages, 18 boss
  // ============================================================
  complete: {
    name: 'Chứng chỉ Soroban Toàn Diện',
    description: 'Master Soroban: Cộng Trừ Nhân Chia + Siêu Trí Tuệ Tứ Phép + Tia Chớp',
    icon: '👑',
    requiredTier: 'advanced',
    prerequisite: 'addSub', // Yêu cầu có chứng chỉ Cộng Trừ trước
    requirements: {
      // Yêu cầu có chứng chỉ Cộng Trừ
      certificate: {
        required: 'addSub',
        weight: 10,
        description: 'Tiên quyết: Đã có Chứng chỉ Cộng Trừ'
      },
      // Zone 11-12: Level 11-14 Nhân Chia
      // Zone 14: Level 15.2-3, 16.2-3 Anzan Nhân Chia
      // Zone 15: Level 17.2-3 Tốc độ Nhân Chia
      // Zone 16: Level 15.4, 16.4, 17.4 Hỗn hợp
      lessons: {
        levels: [11, 12, 13, 14, 15, 16, 17], // Level 11-14 + lessons còn lại của 15-17
        lessonFilter: {
          11: [1, 2, 3], // Bảng nhân 2-7
          12: [1, 2, 3], // Bảng nhân 8-9
          13: [1, 2, 3], // Chia cơ bản
          14: [1, 2, 3, 4], // Chia nâng cao + MIX
          15: [2, 3, 4], // Nhân nhẩm, Chia nhẩm, Hỗn hợp
          16: [2, 3, 4], // Nhân nhẩm NC, Chia nhẩm NC, Hỗn hợp NC
          17: [2, 3, 4]  // Nhân tốc độ, Chia tốc độ, Hỗn hợp tốc độ
        },
        weight: 20,
        description: 'Học: Level 11-14 + Anzan/Tốc độ Nhân Chia (15-17)'
      },
      practice: {
        modes: ['multiplication', 'division', 'mulDiv', 'mixed'],
        minDifficulty: 3, // Dũng Sĩ trở lên
        minCorrect: 15,
        weight: 20,
        description: 'Luyện tập: Nhân, Chia, Nhân Chia Mix, Tứ Phép cấp 3+, mỗi mode 15 bài đúng'
      },
      // Siêu Trí Tuệ Tứ Phép
      mentalMath: {
        minCorrect: 15,
        minDifficulty: 3, // Dũng Sĩ
        weight: 10,
        description: 'Siêu Trí Tuệ Tứ Phép: 15 bài đúng cấp Dũng Sĩ+'
      },
      // Tia Chớp nâng cao
      flashAnzan: {
        minLevel: 3, // Tia Chớp
        minCorrect: 10,
        weight: 10,
        description: 'Tia Chớp: cấp Tia Chớp trở lên, 10 bài đúng'
      },
      compete: {
        modes: ['multiplication', 'division', 'mulDiv', 'mixed'],
        minDifficulty: 3, // Dũng Sĩ
        minCorrect: 7,
        weight: 20,
        description: 'Thi đấu: Nhân, Chia, Nhân Chia Mix, Tứ Phép cấp 3+, đạt 7+ câu đúng'
      },
      accuracy: {
        minAccuracy: 75,
        weight: 10,
        description: 'Độ chính xác tổng từ 75% trở lên'
      }
    }
  }
};

/**
 * GET /api/certificate/progress - Lấy tiến độ chứng chỉ của user
 */
export async function GET(request) {
  try {
    // 🔧 Rate limiting cho endpoint tính toán nặng
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.NORMAL);
    if (rateLimitError) return rateLimitError;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 🔧 Cache kết quả tính toán (60s - cho phép update nhanh)
    const cacheKey = `cert_progress_${userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    // Lấy user tier, streak và trialExpiresAt
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true, name: true, streak: true, trialExpiresAt: true }
    });

    // 🔧 Tính effective tier (có tính trial)
    const trialSettings = await getTrialSettings();
    const userTier = getEffectiveTierSync(user, trialSettings.trialTier);
    const userStreak = user?.streak || 0;

    // Lấy tất cả dữ liệu cần thiết
    const [progress, exerciseResults, competeResults, existingCertificates] = await Promise.all([
      // Tiến độ học
      prisma.progress.findMany({
        where: { userId, completed: true }
      }),
      // Kết quả luyện tập
      prisma.exerciseResult.findMany({
        where: { userId }
      }),
      // Kết quả thi đấu
      prisma.competeResult.findMany({
        where: { userId }
      }),
      // Chứng chỉ đã có
      prisma.certificate.findMany({
        where: { userId }
      })
    ]);

    // Tính tiến độ cho từng loại chứng chỉ
    const certificateProgress = {};

    for (const [certType, config] of Object.entries(CERT_REQUIREMENTS)) {
      const hasCertificate = existingCertificates.some(c => c.certType === certType);
      
      // Kiểm tra tier
      const tierOrder = { free: 0, basic: 1, advanced: 2, vip: 3 };
      const hasRequiredTier = tierOrder[userTier] >= tierOrder[config.requiredTier];

      // Kiểm tra prerequisite certificate
      const hasPrerequisite = config.prerequisite 
        ? existingCertificates.some(c => c.certType === config.prerequisite)
        : true;

      const progressDetail = calculateProgress(
        config,
        progress,
        exerciseResults,
        competeResults,
        userStreak,
        existingCertificates // Truyền thêm danh sách chứng chỉ đã có
      );

      certificateProgress[certType] = {
        ...config,
        certType,
        hasCertificate,
        hasRequiredTier,
        hasPrerequisite,
        prerequisite: config.prerequisite || null,
        requiredTier: config.requiredTier,
        ...progressDetail
      };
    }

    const result = {
      success: true,
      userTier,
      userName: user?.name,
      certificates: existingCertificates,
      progress: certificateProgress
    };

    // 🔧 Cache kết quả 60s
    cache.set(cacheKey, result, CACHE_TTL.SHORT * 2);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error calculating certificate progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Tính toán tiến độ chi tiết
 * @param {Object} config - Config yêu cầu chứng chỉ
 * @param {Array} progressData - Dữ liệu Progress từ DB
 * @param {Array} exerciseData - Dữ liệu ExerciseResult từ DB
 * @param {Array} competeData - Dữ liệu CompeteResult từ DB
 * @param {number} userStreak - Streak hiện tại
 * @param {Array} existingCerts - Các chứng chỉ đã có
 */
function calculateProgress(config, progressData, exerciseData, competeData, userStreak = 0, existingCerts = []) {
  const req = config.requirements;
  const details = {};
  let totalPercent = 0;
  const todoList = [];

  // 0. Kiểm tra yêu cầu chứng chỉ tiên quyết
  if (req.certificate) {
    const hasPrerequisite = existingCerts.some(c => c.certType === req.certificate.required);
    details.certificate = {
      required: req.certificate.required,
      hasPrerequisite,
      percent: hasPrerequisite ? req.certificate.weight : 0,
      maxPercent: req.certificate.weight,
      description: req.certificate.description,
      isComplete: hasPrerequisite
    };
    totalPercent += details.certificate.percent;

    if (!hasPrerequisite) {
      const certNames = { addSub: 'Chứng chỉ Cộng Trừ', complete: 'Chứng chỉ Toàn Diện' };
      todoList.push({
        type: 'certificate',
        icon: '🎖️',
        text: `Hoàn thành ${certNames[req.certificate.required]} trước`,
        priority: 1
      });
    }
  }

  // 1. Tính tiến độ Lessons (có hỗ trợ lessonFilter)
  if (req.lessons) {
    let completed = 0;
    let total = 0;
    const missingLessons = [];

    // Nếu có lessonFilter, kiểm tra theo từng lesson cụ thể
    if (req.lessons.lessonFilter) {
      for (const levelId of req.lessons.levels) {
        const requiredLessons = req.lessons.lessonFilter[levelId];
        if (requiredLessons) {
          // Level có filter lessons cụ thể
          for (const lessonId of requiredLessons) {
            total++;
            const hasLesson = progressData.some(
              p => p.levelId === levelId && p.lessonId === lessonId && p.completed
            );
            if (hasLesson) {
              completed++;
            } else {
              missingLessons.push(`${levelId}.${lessonId}`);
            }
          }
        } else {
          // Level không có filter, kiểm tra completed level
          total++;
          const hasLevel = progressData.some(p => p.levelId === levelId && p.completed);
          if (hasLevel) {
            completed++;
          } else {
            missingLessons.push(`Level ${levelId}`);
          }
        }
      }
    } else {
      // Không có lessonFilter, kiểm tra theo level như cũ
      const completedLevels = new Set(progressData.filter(p => p.completed).map(p => p.levelId));
      const requiredLevels = req.lessons.levels;
      completed = requiredLevels.filter(l => completedLevels.has(l)).length;
      total = requiredLevels.length;
      missingLessons.push(...requiredLevels.filter(l => !completedLevels.has(l)).map(l => `Level ${l}`));
    }

    const percent = total > 0 ? (completed / total) * req.lessons.weight : 0;
    
    details.lessons = {
      completed,
      total,
      percent: Math.round(percent * 10) / 10,
      maxPercent: req.lessons.weight,
      description: req.lessons.description,
      isComplete: completed >= total
    };
    totalPercent += percent;

    if (completed < total) {
      todoList.push({
        type: 'lessons',
        icon: '📚',
        text: `Hoàn thành ${total - completed} bài còn lại (${missingLessons.slice(0, 3).join(', ')}${missingLessons.length > 3 ? '...' : ''})`
      });
    }
  }

  // 2. Tính tiến độ Practice
  if (req.practice) {
    const modeStats = {};
    req.practice.modes.forEach(mode => {
      const modeExercises = exerciseData.filter(
        e => e.exerciseType === mode && e.difficulty >= req.practice.minDifficulty && e.isCorrect
      );
      modeStats[mode] = {
        correct: modeExercises.length,
        isComplete: modeExercises.length >= req.practice.minCorrect
      };
    });

    const completedModes = Object.values(modeStats).filter(s => s.isComplete).length;
    const totalModes = req.practice.modes.length;
    const percent = (completedModes / totalModes) * req.practice.weight;

    details.practice = {
      modes: modeStats,
      completed: completedModes,
      total: totalModes,
      minCorrect: req.practice.minCorrect,
      minDifficulty: req.practice.minDifficulty,
      percent: Math.round(percent * 10) / 10,
      maxPercent: req.practice.weight,
      description: req.practice.description,
      isComplete: completedModes >= totalModes
    };
    totalPercent += percent;

    if (completedModes < totalModes) {
      const incompleteModes = req.practice.modes.filter(m => !modeStats[m].isComplete);
      const modeNames = {
        addition: 'Cộng', subtraction: 'Trừ', addSubMixed: 'Cộng Trừ Mix',
        multiplication: 'Nhân', division: 'Chia', mulDiv: 'Nhân Chia Mix', mixed: 'Tứ Phép'
      };
      todoList.push({
        type: 'practice',
        icon: '🎯',
        text: `Luyện tập ${incompleteModes.map(m => modeNames[m]).join(', ')} (cấp ${req.practice.minDifficulty}+, ${req.practice.minCorrect} bài đúng)`
      });
    }
  }

  // 3. Tính tiến độ Mental Math
  if (req.mentalMath) {
    const mentalExercises = exerciseData.filter(
      e => e.exerciseType === 'mentalMath' && e.isCorrect
    );
    const correct = mentalExercises.length;
    const isComplete = correct >= req.mentalMath.minCorrect;
    const percent = isComplete ? req.mentalMath.weight : (correct / req.mentalMath.minCorrect) * req.mentalMath.weight;

    details.mentalMath = {
      correct,
      required: req.mentalMath.minCorrect,
      percent: Math.round(percent * 10) / 10,
      maxPercent: req.mentalMath.weight,
      description: req.mentalMath.description,
      isComplete
    };
    totalPercent += percent;

    if (!isComplete) {
      todoList.push({
        type: 'mentalMath',
        icon: '🧠',
        text: `Siêu Trí Tuệ: Làm đúng thêm ${req.mentalMath.minCorrect - correct} bài`
      });
    }
  }

  // 4. Tính tiến độ Flash Anzan
  if (req.flashAnzan) {
    const flashExercises = exerciseData.filter(e => {
      if (e.exerciseType !== 'flashAnzan') return false;
      // Parse level từ problem hoặc difficulty
      const level = e.difficulty || 1;
      return level >= req.flashAnzan.minLevel && e.isCorrect;
    });
    const correct = flashExercises.length;
    const isComplete = correct >= req.flashAnzan.minCorrect;
    const percent = isComplete ? req.flashAnzan.weight : (correct / req.flashAnzan.minCorrect) * req.flashAnzan.weight;

    const levelNames = { 1: 'Ánh Nến', 2: 'Ánh Trăng', 3: 'Tia Chớp', 4: 'Sao Băng', 5: 'Big Bang' };

    details.flashAnzan = {
      correct,
      required: req.flashAnzan.minCorrect,
      minLevel: req.flashAnzan.minLevel,
      minLevelName: levelNames[req.flashAnzan.minLevel],
      percent: Math.round(percent * 10) / 10,
      maxPercent: req.flashAnzan.weight,
      description: req.flashAnzan.description,
      isComplete
    };
    totalPercent += percent;

    if (!isComplete) {
      todoList.push({
        type: 'flashAnzan',
        icon: '⚡',
        text: `Flash Anzan: Làm đúng thêm ${req.flashAnzan.minCorrect - correct} bài (level ${levelNames[req.flashAnzan.minLevel]}+)`
      });
    }
  }

  // 5. Tính tiến độ Compete
  if (req.compete) {
    const modeStats = {};
    req.compete.modes.forEach(mode => {
      // arenaId format: "mode-difficulty-questionCount"
      const modeCompetes = competeData.filter(c => {
        const [arenaMode, arenaDiff] = c.arenaId.split('-');
        return arenaMode === mode && 
               parseInt(arenaDiff) >= req.compete.minDifficulty &&
               c.correct >= req.compete.minCorrect;
      });
      modeStats[mode] = {
        bestCorrect: modeCompetes.length > 0 ? Math.max(...modeCompetes.map(c => c.correct)) : 0,
        attempts: modeCompetes.length,
        isComplete: modeCompetes.length > 0
      };
    });

    const completedModes = Object.values(modeStats).filter(s => s.isComplete).length;
    const totalModes = req.compete.modes.length;
    const percent = (completedModes / totalModes) * req.compete.weight;

    details.compete = {
      modes: modeStats,
      completed: completedModes,
      total: totalModes,
      minCorrect: req.compete.minCorrect,
      minDifficulty: req.compete.minDifficulty,
      percent: Math.round(percent * 10) / 10,
      maxPercent: req.compete.weight,
      description: req.compete.description,
      isComplete: completedModes >= totalModes
    };
    totalPercent += percent;

    if (completedModes < totalModes) {
      const incompleteModes = req.compete.modes.filter(m => !modeStats[m].isComplete);
      const modeNames = {
        addition: 'Cộng', subtraction: 'Trừ', addSubMixed: 'Cộng Trừ Mix',
        multiplication: 'Nhân', division: 'Chia'
      };
      todoList.push({
        type: 'compete',
        icon: '🏆',
        text: `Thi đấu ${incompleteModes.map(m => modeNames[m]).join(', ')} (đạt ${req.compete.minCorrect}+ câu đúng)`
      });
    }
  }

  // 6. Tính Accuracy
  if (req.accuracy) {
    const totalExercises = exerciseData.length;
    const correctExercises = exerciseData.filter(e => e.isCorrect).length;
    const accuracy = totalExercises > 0 ? Math.round((correctExercises / totalExercises) * 100) : 0;
    const isComplete = accuracy >= req.accuracy.minAccuracy;
    const percent = isComplete ? req.accuracy.weight : 0;

    details.accuracy = {
      current: accuracy,
      required: req.accuracy.minAccuracy,
      percent: Math.round(percent * 10) / 10,
      maxPercent: req.accuracy.weight,
      description: req.accuracy.description,
      isComplete
    };
    totalPercent += percent;

    if (!isComplete) {
      todoList.push({
        type: 'accuracy',
        icon: '🎯',
        text: `Nâng độ chính xác lên ${req.accuracy.minAccuracy}% (hiện tại: ${accuracy}%)`
      });
    }
  }

  // 7. Tính Streak (nếu có yêu cầu)
  if (req.streak) {
    const currentStreak = userStreak || 0;
    const isComplete = currentStreak >= req.streak.minDays;
    const percent = isComplete ? req.streak.weight : (currentStreak / req.streak.minDays) * req.streak.weight;

    details.streak = {
      current: currentStreak,
      required: req.streak.minDays,
      percent: Math.round(percent * 10) / 10,
      maxPercent: req.streak.weight,
      description: req.streak.description,
      isComplete
    };
    totalPercent += percent;

    if (!isComplete) {
      todoList.push({
        type: 'streak',
        icon: '🔥',
        text: `Duy trì streak ${req.streak.minDays} ngày (hiện tại: ${currentStreak} ngày)`
      });
    }
  }

  // Tổng kết
  const isEligible = Object.values(details).every(d => d.isComplete);

  return {
    details,
    totalPercent: Math.round(totalPercent),
    todoList,
    isEligible
  };
}

/**
 * POST /api/certificate/progress - Yêu cầu cấp chứng chỉ
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { certType } = await request.json();
    const userId = session.user.id;

    if (!CERT_REQUIREMENTS[certType]) {
      return NextResponse.json({ error: 'Invalid certificate type' }, { status: 400 });
    }

    // Kiểm tra đã có chứng chỉ chưa
    const existingCert = await prisma.certificate.findFirst({
      where: { userId, certType }
    });

    if (existingCert) {
      return NextResponse.json({ 
        error: 'Bạn đã có chứng chỉ này',
        certificate: existingCert 
      }, { status: 400 });
    }

    // Tính lại tiến độ để xác nhận đủ điều kiện
    const [progress, exerciseResults, competeResults, user] = await Promise.all([
      prisma.progress.findMany({ where: { userId, completed: true } }),
      prisma.exerciseResult.findMany({ where: { userId } }),
      prisma.competeResult.findMany({ where: { userId } }),
      prisma.user.findUnique({ 
        where: { id: userId }, 
        select: { name: true, tier: true, streak: true, trialExpiresAt: true } 
      })
    ]);

    const config = CERT_REQUIREMENTS[certType];
    const { isEligible, totalPercent } = calculateProgress(config, progress, exerciseResults, competeResults, user?.streak || 0);

    if (!isEligible) {
      return NextResponse.json({ 
        error: 'Chưa đủ điều kiện nhận chứng chỉ',
        progress: totalPercent 
      }, { status: 400 });
    }

    // 🔧 Kiểm tra tier (có tính trial)
    const tierOrder = { free: 0, basic: 1, advanced: 2, vip: 3 };
    const trialSettingsForClaim = await getTrialSettings();
    const effectiveTierForClaim = getEffectiveTierSync(user, trialSettingsForClaim.trialTier);
    if (tierOrder[effectiveTierForClaim] < tierOrder[config.requiredTier]) {
      return NextResponse.json({ 
        error: `Cần nâng cấp lên gói ${config.requiredTier} để nhận chứng chỉ này`,
        requiredTier: config.requiredTier
      }, { status: 403 });
    }

    // Tạo mã chứng chỉ
    const code = `SK-${certType.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Xác định danh hiệu
    const honorTitle = totalPercent === 100 
      ? (certType === 'complete' ? 'Soroban Master' : 'Thành thạo Cộng Trừ')
      : (certType === 'complete' ? 'Soroban Pro' : 'Cộng Trừ Pro');

    // Tạo chứng chỉ
    const certificate = await prisma.certificate.create({
      data: {
        userId,
        certType,
        recipientName: user.name || 'Học viên Sorokid',
        honorTitle,
        isExcellent: totalPercent >= 95,
        code
      }
    });

    return NextResponse.json({
      success: true,
      certificate,
      message: 'Chúc mừng! Bạn đã nhận được chứng chỉ!'
    });

  } catch (error) {
    console.error('Error creating certificate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
