import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { GAME_STAGES, GAME_ZONES } from '@/config/adventure-stages-addsub.config';
import { GAME_STAGES_MULDIV, GAME_ZONES_MULDIV } from '@/config/adventure-stages-muldiv.config';

export const dynamic = 'force-dynamic';

// 🔧 FIX: Cache game progress 45s
const GAME_PROGRESS_CACHE_TTL = 45000;

/**
 * GET /api/adventure/game-progress
 * Lấy tiến trình game theo cấu trúc stages mới
 * Mỗi stage = 1 bài học / 1 bài luyện / 1 trận đấu cụ thể
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 🚀 PERF: Chỉ log trong development
    const isDev = process.env.NODE_ENV === 'development';
    // 🚀 PERF: Chỉ trả về debug info khi có query param hoặc dev mode
    const { searchParams } = new URL(request.url);
    const showDebug = isDev || searchParams.get('debug') === 'true';
    const forceRefresh = searchParams.get('refresh') === '1';

    if (isDev) console.log('🎮 Adventure API called for user:', userId);
    
    // 🔧 FIX: Check cache first
    const cacheKey = `game-progress:${userId}`;
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    // 🔧 FIX: Chia queries thành 2 batches để không chiếm hết pool (limit 5)
    let user, lessonProgress, exerciseResults, competeResults, certificates;
    try {
      // Batch 1: User + Lesson progress (2 queries)
      [user, lessonProgress] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, tier: true, level: true, totalStars: true, avatar: true, diamonds: true, streak: true, trialExpiresAt: true }
        }),
        prisma.progress.findMany({
          where: { userId },
          select: { levelId: true, lessonId: true, completed: true, starsEarned: true, completedAt: true }
        })
      ]);
      
      // Batch 2: Exercise + Compete + Certificates (3 queries)
      [exerciseResults, competeResults, certificates] = await Promise.all([
        prisma.exerciseResult.findMany({
          where: { userId },
          select: { id: true, exerciseType: true, difficulty: true, isCorrect: true, createdAt: true },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.competeResult.findMany({
          where: { userId },
          select: { id: true, arenaId: true, correct: true, stars: true, createdAt: true },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.certificate.findMany({
          where: { userId },
          select: { certType: true, issuedAt: true }
        })
      ]);
      
      if (isDev) console.log('📊 DB Data loaded:', { lessons: lessonProgress.length, exercises: exerciseResults.length, compete: competeResults.length });
    } catch (dbError) {
      console.error('❌ DB Error:', dbError);
      return NextResponse.json({ error: 'Database error', message: dbError.message }, { status: 500 });
    }

    // 🚀 PERF: Pre-index tất cả data bằng Map để O(1) lookup thay vì O(n) filter/find
    const completedStages = [];
    const stageStars = {};

    // Map 1: Lessons - key: "levelId-lessonId"
    const lessonMap = new Map();
    lessonProgress.forEach(p => {
      if (p.completed !== false) {
        lessonMap.set(`${p.levelId}-${p.lessonId}`, p.starsEarned || 3);
      }
    });

    // Map 2: Exercises - key: "mode-difficulty", value: { total, correct }
    const exerciseMap = new Map();
    exerciseResults.forEach(e => {
      const key = `${e.exerciseType}-${e.difficulty}`;
      if (!exerciseMap.has(key)) {
        exerciseMap.set(key, { total: 0, correct: 0 });
      }
      const stats = exerciseMap.get(key);
      stats.total++;
      if (e.isCorrect) stats.correct++;
    });

    // Map 3: Compete results - key: arenaId
    const competeMap = new Map();
    competeResults.forEach(c => {
      // Lưu theo arenaId, chỉ giữ kết quả tốt nhất
      if (!competeMap.has(c.arenaId) || c.correct > competeMap.get(c.arenaId).correct) {
        competeMap.set(c.arenaId, c);
      }
    });

    // Set 4: Certificates - chỉ cần check tồn tại
    const certSet = new Set(certificates.map(c => c.certType));

    // 🚀 PERF: Helper function dùng chung cho cả GAME_STAGES và MULDIV_STAGES
    const checkStageCompletion = (stage) => {
      let isCompleted = false;
      let stars = 0;

      if (stage.type === 'lesson') {
        // O(1) lookup thay vì tạo key mỗi lần
        const key = `${stage.levelId}-${stage.lessonId}`;
        if (lessonMap.has(key)) {
          isCompleted = true;
          stars = lessonMap.get(key);
        }
      }
      else if (stage.type === 'boss' && stage.bossType === 'practice') {
        const condition = stage.completeCondition || stage.practiceInfo;
        if (condition) {
          // O(1) lookup thay vì filter() O(n)
          const key = `${condition.mode}-${condition.difficulty}`;
          const stats = exerciseMap.get(key);
          if (stats) {
            const minCorrect = condition.minCorrect || 10;
            if (stats.correct >= minCorrect) {
              isCompleted = true;
              stars = stats.correct >= minCorrect + 5 ? 3 : (stats.correct >= minCorrect + 2 ? 2 : 1);
            }
          }
        }
      }
      else if (stage.type === 'boss' && stage.bossType === 'compete') {
        const condition = stage.competeInfo || stage.completeCondition;
        if (condition) {
          // O(1) lookup thay vì find() O(n)
          const arenaKey = condition.arenaId || `${condition.mode}-${condition.difficulty}-${condition.questions}`;
          const result = competeMap.get(arenaKey);

          if (result) {
            const total = condition.questions || parseInt(result.arenaId.split('-').pop()) || 10;
            const minCorrect = condition.minCorrect || Math.ceil((condition.minPercent || 60) * total / 100);

            if (result.correct >= minCorrect) {
              isCompleted = true;
              const correctRatio = result.correct / total;
              stars = result.stars || (correctRatio >= 0.9 ? 3 : correctRatio >= 0.7 ? 2 : 1);
            }
          }
        }
      }
      else if (stage.type === 'treasure' || stage.type === 'milestone') {
        // O(1) lookup thay vì some() O(n)
        const certType = stage.link?.split('type=')[1] || stage.certType;
        if (certSet.has(certType)) {
          isCompleted = true;
          stars = 3;
        }
      }

      return { isCompleted, stars };
    };

    // 🚀 PERF: Xử lý cả 2 GAME_STAGES với cùng 1 function (DRY code)
    GAME_STAGES.forEach(stage => {
      const { isCompleted, stars } = checkStageCompletion(stage);
      if (isCompleted) {
        completedStages.push(stage.stageId);
        stageStars[stage.stageId] = stars;
      }
    });

    // =============== XỬ LÝ MULDIV STAGES ===============
    // 🚀 PERF: Dùng lại checkStageCompletion function (DRY - không duplicate code)
    GAME_STAGES_MULDIV.forEach(stage => {
      const { isCompleted, stars } = checkStageCompletion(stage);
      if (isCompleted) {
        completedStages.push(stage.stageId);
        stageStars[stage.stageId] = stars;
      }
    });

    // Tính tổng XP và coins từ các stage đã hoàn thành
    let totalXP = 0;
    let totalCoins = 0;
    
    // Gộp cả 2 danh sách stages
    const allStages = [...GAME_STAGES, ...GAME_STAGES_MULDIV];
    
    completedStages.forEach(stageId => {
      const stage = allStages.find(s => s.stageId === stageId);
      if (stage?.reward) {
        totalXP += stage.reward.xp || 0;
        totalCoins += stage.reward.coins || 0;
      }
    });

    // Tính số zone đã hoàn thành (cả 2 maps)
    const completedZones = [];
    const allZones = [...GAME_ZONES, ...GAME_ZONES_MULDIV];
    
    allZones.forEach(zone => {
      const zoneStages = allStages.filter(s => s.zoneId === zone.id || s.zoneId === zone.zoneId);
      const zoneCompleted = zoneStages.length > 0 && zoneStages.every(s => completedStages.includes(s.stageId));
      if (zoneCompleted) {
        completedZones.push(zone.id || zone.zoneId);
      }
    });

    // 🚀 PERF: Response object - chỉ include debug khi cần
    const response = {
      success: true,
      user: {
        name: user?.name,
        tier: user?.tier,
        level: user?.level,
        avatar: user?.avatar,
        totalStars: user?.totalStars || 0,
        diamonds: user?.diamonds || 0,
        streak: user?.streak || 0,
        trialExpiresAt: user?.trialExpiresAt
      },
      completedStages,
      stageStars,
      completedZones,
      certificates: certificates.map(c => c.certType),
      totalXP: totalXP + (user?.totalStars || 0),
      totalCoins,
      stats: {
        totalStages: allStages.length,
        completed: completedStages.length,
        percentage: Math.round((completedStages.length / allStages.length) * 100)
      }
    };

    // 🚀 PERF: Chỉ thêm debug info trong development hoặc khi có ?debug=true
    if (showDebug) {
      response.debug = {
        lessonCount: lessonProgress.length,
        exerciseCount: exerciseResults.length,
        competeCount: competeResults.length,
        lessonsInDB: lessonProgress.slice(0, 20).map(p => `${p.levelId}-${p.lessonId} (completed=${p.completed})`),
        competeArenas: competeResults.slice(0, 10).map(c => `${c.arenaId} (${c.correct}đúng)`),
        exerciseTypes: [...new Set(exerciseResults.map(e => `${e.exerciseType}-${e.difficulty}`))].slice(0, 10),
        configExpects: GAME_STAGES.slice(0, 8).map(s => ({
          stageId: s.stageId,
          type: s.type,
          key: s.type === 'lesson' ? `${s.levelId}-${s.lessonId}` : (s.practiceInfo ? `${s.practiceInfo.mode}-${s.practiceInfo.difficulty}` : null)
        })),
        stage1Check: {
          configLevelId: GAME_STAGES[0].levelId,
          configLessonId: GAME_STAGES[0].lessonId,
          expectedKey: `${GAME_STAGES[0].levelId}-${GAME_STAGES[0].lessonId}`,
          foundInDB: lessonMap.has(`${GAME_STAGES[0].levelId}-${GAME_STAGES[0].lessonId}`)
        }
      };
    }
    
    // 🔧 FIX: Cache response
    cache.set(cacheKey, response, GAME_PROGRESS_CACHE_TTL);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching game progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/adventure/game-progress
 * Cập nhật tiến trình khi hoàn thành stage
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stageId, stars, score } = await request.json();
    const userId = session.user.id;
    
    // Tìm stage config
    const stage = GAME_STAGES.find(s => s.stageId === stageId);
    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    // Tính phần thưởng dựa trên số sao
    const xpMultiplier = stars >= 3 ? 1 : (stars >= 2 ? 0.8 : 0.6);
    const earnedXP = Math.round((stage.reward?.xp || 0) * xpMultiplier);
    const earnedCoins = Math.round((stage.reward?.coins || 0) * xpMultiplier);

    // Cập nhật points cho user
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: earnedXP },
        totalStars: { increment: stars }
      }
    });

    return NextResponse.json({
      success: true,
      stageId,
      stars,
      earnedXP,
      earnedCoins,
      badge: stars >= 3 ? stage.reward?.badge : null
    });

  } catch (error) {
    console.error('Error updating game progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress', message: error.message },
      { status: 500 }
    );
  }
}
