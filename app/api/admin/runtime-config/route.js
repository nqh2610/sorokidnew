import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllConfig, getEnvironment } from '@/config/runtime.config';
import { requestLimiter } from '@/lib/requestLimiter';
import { dbCircuitBreaker } from '@/lib/circuitBreaker';
import { cache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/runtime-config
 * Xem runtime config hiện tại (chỉ admin)
 */
export async function GET(request) {
  try {
    // Check admin auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = getAllConfig();
    
    // Thêm runtime stats
    const stats = {
      requestLimiter: requestLimiter.getStats(),
      circuitBreaker: {
        db: dbCircuitBreaker.getStats(),
      },
      cache: cache.stats(),
      memory: process.memoryUsage ? {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
      } : 'N/A',
    };

    return NextResponse.json({
      environment: getEnvironment(),
      config,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching runtime config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
