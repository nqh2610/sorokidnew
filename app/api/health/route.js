import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cache } from '@/lib/cache';
import { rateLimiter } from '@/lib/rateLimit';
import { requestLimiter } from '@/lib/requestLimiter';

/**
 * 🔍 SERVER HEALTH & CAPACITY MONITOR
 * 
 * API để kiểm tra:
 * - Server capacity hiện tại
 * - Cache stats
 * - Rate limiter stats
 * - Memory usage
 * 
 * Chỉ admin mới xem được chi tiết
 */

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'admin';

    // Basic health check cho tất cả
    const basicHealth = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    // Chi tiết chỉ cho admin
    if (!isAdmin) {
      return NextResponse.json(basicHealth);
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    const memoryMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };

    // Stats từ các modules
    const cacheStats = cache.stats();
    const rateLimiterStats = rateLimiter.stats();
    const requestLimiterStats = requestLimiter.getStats();

    // 🔧 FIX: Sử dụng config thực tế (50 concurrent)
    const maxConcurrent = 50;
    const capacityPercent = Math.round(
      (requestLimiterStats.activeRequests / maxConcurrent) * 100
    );

    return NextResponse.json({
      ...basicHealth,
      
      // Capacity
      capacity: {
        percent: capacityPercent,
        activeRequests: requestLimiterStats.activeRequests,
        maxConcurrent: maxConcurrent,
        queueLength: requestLimiterStats.queueLength,
        peakConcurrent: requestLimiterStats.peakConcurrent,
        status: capacityPercent < 70 ? 'healthy' : capacityPercent < 90 ? 'busy' : 'critical'
      },
      
      // Memory
      memory: {
        ...memoryMB,
        limit: 512, // MB
        percentUsed: Math.round((memoryMB.heapUsed / 512) * 100)
      },
      
      // Cache
      cache: cacheStats,
      
      // Rate Limiter
      rateLimiter: rateLimiterStats,
      
      // Request Limiter
      requestLimiter: {
        totalRequests: requestLimiterStats.totalRequests,
        rejectedRequests: requestLimiterStats.rejectedRequests,
        queuedRequests: requestLimiterStats.queuedRequests,
        rejectRate: requestLimiterStats.totalRequests > 0 
          ? Math.round((requestLimiterStats.rejectedRequests / requestLimiterStats.totalRequests) * 100)
          : 0
      },
      
      // Environment
      env: {
        nodeVersion: process.version,
        platform: process.platform,
        uvThreadPoolSize: process.env.UV_THREADPOOL_SIZE || '4'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}
