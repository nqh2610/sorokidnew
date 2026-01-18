import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * 🎯 QUESTS API - PHASE 2
 * 
 * Load quests data riêng biệt (on-demand)
 * - Daily quests
 * - Weekly quests
 * - Progress tracking
 */

export async function GET(request) {
  try {
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.NORMAL);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Check cache
    const cacheKey = `quests:${userId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Query quests and user quests
    // Model đúng là "quest" không phải "dailyQuest"
    const [allQuests, userQuests] = await Promise.all([
      prisma.quest.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userQuest.findMany({
        where: { userId }
      })
    ]);

    // Map user progress
    const userQuestMap = new Map();
    userQuests.forEach(uq => {
      userQuestMap.set(uq.questId, uq);
    });

    // Format quests - ĐÚNG FORMAT cho QuestList component
    const formattedQuests = allQuests.map(quest => {
      const userQuest = userQuestMap.get(quest.id);
      const isCompleted = userQuest?.completed || false;
      // Schema dùng claimedAt (DateTime?), không phải claimed (Boolean)
      const isClaimed = userQuest?.claimedAt != null;
      
      return {
        id: quest.id,
        title: quest.title,
        description: quest.description,
        type: quest.type,
        category: quest.category,
        requirement: quest.requirement,
        // Schema có stars và diamonds trực tiếp
        stars: quest.stars,
        diamonds: quest.diamonds,
        progress: userQuest?.progress || 0,
        completed: isCompleted,
        claimed: isClaimed,
        canClaim: isCompleted && !isClaimed
      };
    });

    // Separate daily/weekly
    const dailyQuestsFormatted = formattedQuests.filter(q => q.type === 'daily');
    const weeklyQuestsFormatted = formattedQuests.filter(q => q.type === 'weekly');

    // Active quests = chưa claimed (cho QuestList component)
    const activeQuests = formattedQuests.filter(q => !q.claimed);

    // Stats
    const readyToClaim = formattedQuests.filter(q => q.canClaim).length;
    const totalCompleted = formattedQuests.filter(q => q.completed).length;

    const response = {
      success: true,
      // Format cho QuestList component
      active: activeQuests,
      completedCount: readyToClaim,
      // Cũng giữ daily/weekly cho backward compatible
      daily: dailyQuestsFormatted,
      weekly: weeklyQuestsFormatted,
      stats: {
        readyToClaim,
        totalCompleted,
        totalQuests: formattedQuests.length
      }
    };

    // Cache 45s (quests update less frequently)
    cache.set(cacheKey, response, 45000);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Dashboard Quests] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
