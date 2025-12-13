import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { getOrSet, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET /api/admin/stats - Lấy thống kê tổng quan
export async function GET(request) {
  try {
    // 🔒 Rate limiting MODERATE cho admin
    const rateLimitError = checkRateLimit(request, RATE_LIMITS.MODERATE);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError.error }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔧 TỐI ƯU: Cache admin stats 30 giây
    const stats = await getOrSet(
      'admin_stats_overview',
      async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // 🔧 TỐI ƯU: Parallel queries thay vì sequential
        const [
          totalUsers,
          tierCounts,
          orderStats,
          monthStats,
          todayStats,
          todayActive,
          totalQuests,
          totalAchievements
        ] = await Promise.all([
          // 1. Total users
          prisma.user.count(),
          
          // 2. Tier counts
          prisma.user.groupBy({
            by: ['tier'],
            _count: { id: true }
          }).catch(() => []),
          
          // 3. Order stats
          prisma.paymentOrder.groupBy({
            by: ['status'],
            _count: { id: true },
            _sum: { paidAmount: true }
          }).catch(() => []),
          
          // 4. Month revenue
          prisma.paymentOrder.aggregate({
            where: { 
              status: 'completed',
              paidAt: { gte: startOfMonth }
            },
            _sum: { paidAmount: true }
          }).catch(() => ({ _sum: { paidAmount: 0 } })),
          
          // 5. Today revenue
          prisma.paymentOrder.aggregate({
            where: { 
              status: 'completed',
              paidAt: { gte: today }
            },
            _sum: { paidAmount: true }
          }).catch(() => ({ _sum: { paidAmount: 0 } })),
          
          // 6. Today active users
          prisma.user.count({
            where: { lastLoginDate: { gte: today } }
          }).catch(() => 0),
          
          // 7. Total quests
          prisma.quest.count().catch(() => 0),
          
          // 8. Total achievements
          prisma.achievement.count().catch(() => 0)
        ]);

        // Process tier counts
        let basicUsers = 0;
        let advancedUsers = 0;
        tierCounts.forEach(t => {
          if (t.tier === 'basic') basicUsers = t._count.id;
          if (t.tier === 'advanced') advancedUsers = t._count.id;
        });
        const paidUsers = basicUsers + advancedUsers;

        // Process order stats
        let totalOrders = 0;
        let completedOrders = 0;
        let pendingOrders = 0;
        let totalRevenue = 0;
        
        orderStats.forEach(s => {
          totalOrders += s._count.id;
          if (s.status === 'completed') {
            completedOrders = s._count.id;
            totalRevenue = s._sum.paidAmount || 0;
          }
          if (s.status === 'pending') pendingOrders = s._count.id;
        });

        return {
          totalUsers,
          paidUsers,
          basicUsers,
          advancedUsers,
          totalOrders,
          completedOrders,
          pendingOrders,
          totalRevenue,
          monthRevenue: monthStats._sum?.paidAmount || 0,
          todayRevenue: todayStats._sum?.paidAmount || 0,
          todayActive,
          totalQuests,
          totalAchievements
        };
      },
      CACHE_TTL.MEDIUM // 30 seconds
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
