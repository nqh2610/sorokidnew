/**
 * 🚀 SERVER-SIDE CACHING UTILITIES
 * 
 * Dùng Next.js unstable_cache cho Server Components
 * Giúp giảm database queries và cải thiện TTFB
 * 
 * Lợi ích:
 * - Cache được persist qua requests
 * - Tự động revalidate theo thời gian
 * - Giảm 50-70% database queries
 */
import { unstable_cache } from 'next/cache';
import prisma from './prisma';

// ============ CACHE TAGS ============
export const CACHE_TAGS = {
  LEVELS: 'levels',
  LESSONS: 'lessons',
  PRICING: 'pricing',
  LEADERBOARD: 'leaderboard',
  ACHIEVEMENTS: 'achievements',
  QUESTS: 'quests',
};

// ============ CACHED DATA FETCHERS ============

/**
 * Get all active levels - cached 5 minutes
 * Data tĩnh, ít thay đổi
 */
export const getCachedLevels = unstable_cache(
  async () => {
    return prisma.level.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        order: true,
      },
      orderBy: { order: 'asc' },
    });
  },
  ['all-levels'],
  { 
    revalidate: 300, // 5 minutes
    tags: [CACHE_TAGS.LEVELS] 
  }
);

/**
 * Get lesson counts by level - cached 5 minutes
 */
export const getCachedLessonCounts = unstable_cache(
  async () => {
    const counts = await prisma.lesson.groupBy({
      by: ['levelId'],
      _count: { id: true },
    });
    return new Map(counts.map(c => [c.levelId, c._count.id]));
  },
  ['lesson-counts'],
  { 
    revalidate: 300,
    tags: [CACHE_TAGS.LESSONS] 
  }
);

/**
 * Get lessons by level - cached 2 minutes
 */
export const getCachedLessons = unstable_cache(
  async (levelId) => {
    const where = levelId ? { levelId: parseInt(levelId) } : {};
    return prisma.lesson.findMany({
      where,
      select: {
        id: true,
        levelId: true,
        lessonId: true,
        title: true,
        description: true,
        content: true,
        difficulty: true,
        duration: true,
        stars: true,
        order: true,
      },
      orderBy: [{ levelId: 'asc' }, { order: 'asc' }],
    });
  },
  ['lessons'],
  { 
    revalidate: 120,
    tags: [CACHE_TAGS.LESSONS] 
  }
);

/**
 * Get pricing plans - cached 10 minutes
 * Ít thay đổi, cache lâu hơn
 */
export const getCachedPricingPlans = unstable_cache(
  async () => {
    try {
      const settings = await prisma.systemSettings.findUnique({
        where: { key: 'pricing_plans' },
      });
      if (settings?.value) {
        const plans = JSON.parse(settings.value);
        return Array.isArray(plans) ? plans : [];
      }
    } catch (e) {
      console.error('Error loading pricing plans:', e);
    }
    return [];
  },
  ['pricing-plans'],
  { 
    revalidate: 600, // 10 minutes
    tags: [CACHE_TAGS.PRICING] 
  }
);

/**
 * Get leaderboard - cached 1 minute
 * Cần update thường xuyên hơn
 */
export const getCachedLeaderboard = unstable_cache(
  async (limit = 50) => {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        level: true,
        totalStars: true,
        streak: true,
      },
      orderBy: [{ totalStars: 'desc' }, { streak: 'desc' }],
      take: limit,
    });
  },
  ['leaderboard'],
  { 
    revalidate: 60,
    tags: [CACHE_TAGS.LEADERBOARD] 
  }
);

/**
 * Get all achievements - cached 1 hour
 * Rất ít thay đổi
 */
export const getCachedAchievements = unstable_cache(
  async () => {
    return prisma.achievement.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        category: true,
        requirement: true,
        stars: true,
        diamonds: true,
      },
      orderBy: { category: 'asc' },
    });
  },
  ['achievements'],
  { 
    revalidate: 3600, // 1 hour
    tags: [CACHE_TAGS.ACHIEVEMENTS] 
  }
);

/**
 * Get active quests - cached 5 minutes
 */
export const getCachedActiveQuests = unstable_cache(
  async () => {
    return prisma.quest.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        category: true,
        requirement: true,
        stars: true,
        diamonds: true,
        expiresAt: true,
      },
      orderBy: { category: 'asc' },
    });
  },
  ['active-quests'],
  { 
    revalidate: 300,
    tags: [CACHE_TAGS.QUESTS] 
  }
);

// ============ CACHE INVALIDATION HELPERS ============

/**
 * Invalidate specific cache tags
 * Dùng khi admin update data
 */
export async function invalidateCacheTags(tags) {
  const { revalidateTag } = await import('next/cache');
  for (const tag of tags) {
    revalidateTag(tag);
  }
}
