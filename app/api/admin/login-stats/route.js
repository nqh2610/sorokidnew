import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLoginProtectionStats } from '@/lib/loginProtection';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/login-stats
 * Lấy thống kê login protection (chỉ admin)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = getLoginProtectionStats();
    
    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        serverTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting login stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
