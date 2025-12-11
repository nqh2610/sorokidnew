import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/stats - Lấy thống kê tổng quan
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tổng số người dùng
    const totalUsers = await prisma.user.count();

    // Người dùng theo tier (từ trường tier trong users table)
    let basicUsers = 0;
    let advancedUsers = 0;
    let paidUsers = 0;
    
    try {
      const tierCounts = await prisma.user.groupBy({
        by: ['tier'],
        _count: { id: true }
      });
      
      tierCounts.forEach(t => {
        if (t.tier === 'basic') basicUsers = t._count.id;
        if (t.tier === 'advanced') advancedUsers = t._count.id;
      });
      paidUsers = basicUsers + advancedUsers;
    } catch (e) {
      console.log('Error counting tiers:', e.message);
    }

    // Giao dịch và doanh thu
    let totalOrders = 0;
    let completedOrders = 0;
    let pendingOrders = 0;
    let totalRevenue = 0;
    let monthRevenue = 0;
    let todayRevenue = 0;
    
    try {
      // Tổng đơn
      const orderStats = await prisma.paymentOrder.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { paidAmount: true }
      });
      
      orderStats.forEach(s => {
        totalOrders += s._count.id;
        if (s.status === 'completed') {
          completedOrders = s._count.id;
          totalRevenue = s._sum.paidAmount || 0;
        }
        if (s.status === 'pending') pendingOrders = s._count.id;
      });

      // Doanh thu tháng này
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const monthStats = await prisma.paymentOrder.aggregate({
        where: { 
          status: 'completed',
          paidAt: { gte: startOfMonth }
        },
        _sum: { paidAmount: true }
      });
      monthRevenue = monthStats._sum?.paidAmount || 0;

      // Doanh thu hôm nay
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayStats = await prisma.paymentOrder.aggregate({
        where: { 
          status: 'completed',
          paidAt: { gte: today }
        },
        _sum: { paidAmount: true }
      });
      todayRevenue = todayStats._sum?.paidAmount || 0;
    } catch (e) {
      console.log('PaymentOrder error:', e.message);
    }

    // Hoạt động hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let todayActive = 0;
    try {
      todayActive = await prisma.user.count({
        where: {
          lastLoginDate: { gte: today }
        }
      });
    } catch (e) {}

    // Nhiệm vụ và thành tích
    let totalQuests = 0;
    let totalAchievements = 0;
    try {
      totalQuests = await prisma.quest.count();
      totalAchievements = await prisma.achievement.count();
    } catch (e) {}

    return NextResponse.json({
      totalUsers,
      paidUsers,
      basicUsers,
      advancedUsers,
      totalOrders,
      completedOrders,
      pendingOrders,
      totalRevenue,
      monthRevenue,
      todayRevenue,
      todayActive,
      totalQuests,
      totalAchievements
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
