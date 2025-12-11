import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLevelInfo } from '@/lib/gamification';

export const dynamic = 'force-dynamic';

export async function GET() {
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
  const leaderboard = topUsers.map(user => ({
    ...user,
    levelInfo: getLevelInfo(user.totalStars || 0)
  }));
  
  return NextResponse.json({ leaderboard });
}
