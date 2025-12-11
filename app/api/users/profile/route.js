import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { getLevelInfo } from '@/lib/gamification';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email }, 
    select: { 
      id: true, 
      email: true, 
      username: true, 
      name: true, 
      avatar: true, 
      level: true, 
      totalStars: true, 
      diamonds: true, 
      streak: true, 
      createdAt: true 
    } 
  });
  
  // Thêm thông tin level chi tiết (dựa trên totalStars)
  const levelInfo = getLevelInfo(user?.totalStars || 0);
  
  return NextResponse.json({ 
    user: {
      ...user,
      levelInfo
    }
  });
}
