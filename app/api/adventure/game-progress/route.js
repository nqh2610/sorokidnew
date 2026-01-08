import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { GAME_STAGES, GAME_ZONES } from '@/config/adventure-stages-addsub.config';
import { GAME_STAGES_MULDIV, GAME_ZONES_MULDIV } from '@/config/adventure-stages-muldiv.config';

export const dynamic = 'force-dynamic';

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

    if (isDev) console.log('🎮 Adventure API called for user:', userId);

    // Lấy dữ liệu từ DB
    let user, lessonProgress, exerciseResults, competeResults, certificates;
    try {
      [user, lessonProgress, exerciseResults, competeResults, certificates] = await Promise.all([
      // Thông tin user
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, tier: true, level: true, totalStars: true, avatar: true, diamonds: true, streak: true, trialExpiresAt: true }
      }),
      
      // Tiến độ học từng lesson - lấy tất cả, check completed trong code
      prisma.progress.findMany({
        where: { userId },
        select: { levelId: true, lessonId: true, completed: true, starsEarned: true, completedAt: true }
      }),
      
      // Kết quả luyện tập
      prisma.exerciseResult.findMany({
        where: { userId },
        select: { id: true, exerciseType: true, difficulty: true, isCorrect: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
      }),
      
      // Kết quả thi đấu
      prisma.competeResult.findMany({
        where: { userId },
        select: { id: true, arenaId: true, correct: true, stars: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
      }),
      
      // Chứng chỉ
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

    // Map completed lessons to stage IDs
    const completedStages = [];
    const stageStars = {};
    
    // Tạo map để tra cứu nhanh - chỉ lấy những bài đã completed
    const lessonMap = new Map();
    lessonProgress.forEach(p => {
      // Coi như completed nếu có record (vì user đã học qua)
      // Hoặc check field completed nếu có
      if (p.completed !== false) {
        lessonMap.set(`${p.levelId}-${p.lessonId}`, p.starsEarned || 3);
      }
    });
    
    // Kiểm tra từng stage
    GAME_STAGES.forEach(stage => {
      let isCompleted = false;
      let stars = 0;
      
      if (stage.type === 'lesson') {
        // Stage học: kiểm tra Progress table
        const key = `${stage.levelId}-${stage.lessonId}`;
        if (lessonMap.has(key)) {
          isCompleted = true;
          stars = lessonMap.get(key);
        }
      } 
      else if (stage.type === 'boss' && stage.bossType === 'practice') {
        // Boss Luyện tập: kiểm tra ExerciseResult
        const condition = stage.completeCondition || stage.practiceInfo;
        if (condition) {
          const relevantExercises = exerciseResults.filter(e => 
            e.exerciseType === condition.mode && 
            e.difficulty === condition.difficulty
          );
          
          // Đếm số câu đúng
          const correctCount = relevantExercises.filter(e => e.isCorrect).length;
          const minCorrect = condition.minCorrect || 10;
          
          if (correctCount >= minCorrect) {
            isCompleted = true;
            stars = correctCount >= minCorrect + 5 ? 3 : (correctCount >= minCorrect + 2 ? 2 : 1);
          }
        }
      }
      else if (stage.type === 'boss' && stage.bossType === 'compete') {
        // Boss Thi đấu: kiểm tra CompeteResult
        // Config dùng competeInfo, fallback sang completeCondition
        const condition = stage.competeInfo || stage.completeCondition;
        if (condition) {
          // Tìm kết quả thi đấu phù hợp
          const relevantCompete = competeResults.find(c => {
            // Match arenaId format: "mode-difficulty-questions" hoặc tên arena
            if (c.arenaId === condition.arenaId) return true;
            if (c.arenaId === `${condition.mode}-${condition.difficulty}-${condition.questions}`) return true;
            return false;
          });

          if (relevantCompete) {
            // Lấy minCorrect từ config (ưu tiên) hoặc tính từ minPercent
            const total = condition.questions || parseInt(relevantCompete.arenaId.split('-').pop()) || 10;
            const minCorrect = condition.minCorrect || Math.ceil((condition.minPercent || 60) * total / 100);

            if (relevantCompete.correct >= minCorrect) {
              isCompleted = true;
              // Tính stars dựa trên số câu đúng
              const correctRatio = relevantCompete.correct / total;
              stars = relevantCompete.stars || (correctRatio >= 0.9 ? 3 : correctRatio >= 0.7 ? 2 : 1);
            }
          }
        }
      }
      else if (stage.type === 'treasure' || stage.type === 'milestone') {
        // Stage chứng chỉ: kiểm tra Certificate
        const certType = stage.link?.split('type=')[1] || stage.certType;
        const hasCert = certificates.some(c => c.certType === certType);
        if (hasCert) {
          isCompleted = true;
          stars = 3;
        }
      }
      
      if (isCompleted) {
        completedStages.push(stage.stageId);
        stageStars[stage.stageId] = stars;
      }
    });
    
    // =============== XỬ LÝ MULDIV STAGES ===============
    // Tạo helper function để check stage
    const checkStageCompletion = (stage) => {
      let isCompleted = false;
      let stars = 0;
      
      if (stage.type === 'lesson') {
        const key = `${stage.levelId}-${stage.lessonId}`;
        if (lessonMap.has(key)) {
          isCompleted = true;
          stars = lessonMap.get(key);
        }
      } 
      else if (stage.type === 'boss' && stage.bossType === 'practice') {
        const condition = stage.completeCondition || stage.practiceInfo;
        if (condition) {
          const relevantExercises = exerciseResults.filter(e => 
            e.exerciseType === condition.mode && 
            e.difficulty === condition.difficulty
          );
          const correctCount = relevantExercises.filter(e => e.isCorrect).length;
          const minCorrect = condition.minCorrect || 10;
          
          if (correctCount >= minCorrect) {
            isCompleted = true;
            stars = correctCount >= minCorrect + 5 ? 3 : (correctCount >= minCorrect + 2 ? 2 : 1);
          }
        }
      }
      else if (stage.type === 'boss' && stage.bossType === 'compete') {
        // Config dùng competeInfo, fallback sang completeCondition
        const condition = stage.competeInfo || stage.completeCondition;
        if (condition) {
          const relevantCompete = competeResults.find(c => {
            if (c.arenaId === condition.arenaId) return true;
            if (c.arenaId === `${condition.mode}-${condition.difficulty}-${condition.questions}`) return true;
            return false;
          });

          if (relevantCompete) {
            // Lấy minCorrect từ config (ưu tiên) hoặc tính từ minPercent
            const total = condition.questions || parseInt(relevantCompete.arenaId.split('-').pop()) || 10;
            const minCorrect = condition.minCorrect || Math.ceil((condition.minPercent || 60) * total / 100);

            if (relevantCompete.correct >= minCorrect) {
              isCompleted = true;
              // Tính stars dựa trên số câu đúng
              const correctRatio = relevantCompete.correct / total;
              stars = relevantCompete.stars || (correctRatio >= 0.9 ? 3 : correctRatio >= 0.7 ? 2 : 1);
            }
          }
        }
      }
      else if (stage.type === 'treasure' || stage.type === 'milestone') {
        const certType = stage.link?.split('type=')[1] || stage.certType;
        const hasCert = certificates.some(c => c.certType === certType);
        if (hasCert) {
          isCompleted = true;
          stars = 3;
        }
      }

      return { isCompleted, stars };
    };
    
    // Kiểm tra MulDiv stages
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
