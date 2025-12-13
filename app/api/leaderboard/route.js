import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLevelInfo } from '@/lib/gamification';
import { cache, CACHE_KEYS, CACHE_TTL, getOrSet } from '@/lib/cache';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * 🚀 LEADERBOARD API - TỐI ƯU VỚI CACHING
 * 
 * Leaderboard ít thay đổi, cache 1 phút là hợp lý
 */
export async function GET(request) {
  // Rate limiting
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.RELAXED);
  if (rateLimitError) {
    return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
  }

  // 🔧 CACHE: Leaderboard không cần realtime, cache 1 phút
  const leaderboard = await getOrSet(
    CACHE_KEYS.LEADERBOARD,
    async () => {
      const topUsers = await prisma.user.findMany({ 
        select: { 
          id: true, 
          username: true, 
          name: true, 
          avatar: true, 
          level: true, 
          totalStars: true, 
          streak: true 
        }, 
        orderBy: [{ totalStars: 'desc' }, { streak: 'desc' }], 
        take: 50 
      });
      
      // Thêm thông tin level chi tiết (dựa trên totalStars)
      return topUsers.map(user => ({
        ...user,
        levelInfo: getLevelInfo(user.totalStars || 0)
      }));
    },
    CACHE_TTL.LONG // 1 minute cache
  );
  
  return NextResponse.json({ leaderboard });
}
