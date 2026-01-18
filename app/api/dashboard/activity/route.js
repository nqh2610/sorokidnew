import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * 📊 ACTIVITY API - PHASE 2
 * 
 * Load activity data (on-demand, heaviest)
 * - Activity chart (7 days)
 * - Detailed stats
 * - Performance metrics
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
    
    // Check cache (longer TTL for activity)
    const cacheKey = `activity:${userId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Query activity data
    const [recentProgress, user, allProgress] = await Promise.all([
      // Recent activity (7 days)
      prisma.progress.findMany({
        where: {
          userId,
          updatedAt: { gte: sevenDaysAgo }
        },
        select: {
          starsEarned: true,
          completed: true,
          updatedAt: true
        },
        orderBy: { updatedAt: 'desc' }
      }),
      // User stats - 🔧 FIX: Only select fields that exist in schema
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          streak: true,
          totalStars: true,
          updatedAt: true
        }
      }),
      // All progress for overall stats
      prisma.progress.findMany({
        where: { userId },
        select: {
          starsEarned: true,
          completed: true
        }
      })
    ]);

    // Build activity chart (group by day)
    const activityChart = buildActivityChart(recentProgress, sevenDaysAgo);

    // Calculate detailed stats
    const totalCompletedLessons = allProgress.filter(p => p.completed).length;
    const totalStarsEarned = allProgress.reduce((sum, p) => sum + (p.starsEarned || 0), 0);
    
    // Average stars per completed lesson
    const avgStars = totalCompletedLessons > 0 
      ? (totalStarsEarned / totalCompletedLessons).toFixed(1)
      : 0;

    // This week stats
    const thisWeekStars = recentProgress.reduce((sum, p) => sum + (p.starsEarned || 0), 0);
    const thisWeekLessons = recentProgress.filter(p => p.completed).length;

    // Perfect lessons (3 stars)
    const perfectLessons = allProgress.filter(p => p.starsEarned === 3).length;

    const response = {
      success: true,
      activityChart,
      streakInfo: {
        current: user?.streak || 0,
        longest: user?.streak || 0, // 🔧 FIX: Use streak as longest (field doesn't exist in schema)
        lastActive: user?.updatedAt
      },
      thisWeek: {
        starsEarned: thisWeekStars,
        lessonsCompleted: thisWeekLessons,
        avgStarsPerDay: (thisWeekStars / 7).toFixed(1)
      },
      overall: {
        totalLessons: totalCompletedLessons,
        totalStars: totalStarsEarned,
        avgStarsPerLesson: avgStars,
        perfectLessons,
        perfectRate: totalCompletedLessons > 0 
          ? Math.round((perfectLessons / totalCompletedLessons) * 100) 
          : 0
      }
    };

    // Cache 2 minutes
    cache.set(cacheKey, response, 120000);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Dashboard Activity] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * Build 7-day activity chart
 */
function buildActivityChart(progress, startDate) {
  // Initialize all 7 days
  const chart = [];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    chart.push({
      day: dayNames[date.getDay()],
      date: date.toISOString().split('T')[0],
      stars: 0,
      lessons: 0
    });
  }

  // Fill in data
  progress.forEach(p => {
    const date = new Date(p.updatedAt).toISOString().split('T')[0];
    const dayData = chart.find(d => d.date === date);
    
    if (dayData) {
      dayData.stars += p.starsEarned || 0;
      if (p.completed) dayData.lessons += 1;
    }
  });

  return chart;
}
