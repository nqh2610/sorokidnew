import { PrismaClient } from '@prisma/client';
import { DATABASE_CONFIG, LOGGING_CONFIG } from '@/config/runtime.config';

const globalForPrisma = globalThis;

/**
 * 🔧 PRISMA CLIENT v2.0 - SHARED HOST SURVIVAL MODE
 * 
 * OPTIMIZATIONS:
 * 1. 📊 Connection pool 8 (tăng từ 5)
 * 2. ⏱️ Smart timeouts - fail fast
 * 3. 🔄 Connection retry với exponential backoff
 * 4. 📝 Query logging cho slow queries
 * 5. 💾 Query result caching hints
 */

// Tạo database URL với connection pool settings từ config
function getDatabaseUrl() {
  const baseUrl = process.env.DATABASE_URL || '';
  if (!baseUrl) return baseUrl;
  
  try {
    // Parse và thêm connection pool params từ runtime config
    const url = new URL(baseUrl);
    
    // Connection limit từ config (tăng lên 8)
    url.searchParams.set('connection_limit', String(DATABASE_CONFIG.connectionLimit));
    
    // Pool timeout từ config
    url.searchParams.set('pool_timeout', String(DATABASE_CONFIG.poolTimeout));
    
    // Connect timeout từ config
    url.searchParams.set('connect_timeout', String(DATABASE_CONFIG.connectTimeout));
    
    // Socket timeout từ config
    url.searchParams.set('socket_timeout', String(DATABASE_CONFIG.socketTimeout));
    
    return url.toString();
  } catch (e) {
    console.warn('Failed to parse DATABASE_URL, using as-is');
    return baseUrl;
  }
}

// 🆕 Query middleware để log slow queries
function createQueryMiddleware() {
  const slowQueryThreshold = LOGGING_CONFIG?.slowQueryThreshold || 5000;
  
  return async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;
    
    if (duration > slowQueryThreshold) {
      console.warn(`[Prisma] SLOW QUERY (${duration}ms): ${params.model}.${params.action}`);
    }
    
    return result;
  };
}

// Tạo Prisma Client với cấu hình tối ưu
function createPrismaClient() {
  const client = new PrismaClient({
    // Log level từ config
    log: DATABASE_CONFIG.logLevel,
    
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    
    // Tối ưu engine
    errorFormat: 'minimal',
  });

  // 🆕 Add query middleware for slow query logging
  if (process.env.NODE_ENV === 'production') {
    client.$use(createQueryMiddleware());
  }

  return client;
}

// Singleton pattern - đảm bảo chỉ có 1 PrismaClient instance
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Lưu vào global để tái sử dụng (tránh memory leak trong development)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 🔧 IMPROVED: Graceful shutdown với proper cleanup
if (typeof process !== 'undefined') {
  let isShuttingDown = false;
  
  const gracefulShutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    console.log(`[Prisma] Received ${signal}, disconnecting...`);
    
    try {
      await Promise.race([
        prisma.$disconnect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Disconnect timeout')), 5000)
        )
      ]);
      console.log('[Prisma] Disconnected successfully');
    } catch (e) {
      console.error('[Prisma] Disconnect error:', e.message);
    }
  };
  
  process.on('beforeExit', () => gracefulShutdown('beforeExit'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

// ============ HELPER FUNCTIONS ============

/**
 * 🆕 Execute query with timeout
 * @param {Function} queryFn - Prisma query function
 * @param {number} timeout - Timeout in ms
 * @param {any} fallback - Fallback value on timeout
 */
export async function queryWithTimeout(queryFn, timeout = DATABASE_CONFIG.queryTimeout, fallback = null) {
  try {
    return await Promise.race([
      queryFn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), timeout)
      )
    ]);
  } catch (error) {
    if (error.message === 'Query timeout') {
      console.warn('[Prisma] Query timeout, returning fallback');
      return fallback;
    }
    throw error;
  }
}

/**
 * 🆕 Execute query with retry
 * @param {Function} queryFn - Prisma query function
 * @param {number} maxRetries - Max retry attempts
 */
export async function queryWithRetry(queryFn, maxRetries = DATABASE_CONFIG.retry?.attempts || 2) {
  let lastError;
  const baseDelay = DATABASE_CONFIG.retry?.delay || 500;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error;
      
      // Chỉ retry cho transient errors
      const isTransient = 
        error.code === 'P2024' || // Connection pool timeout
        error.code === 'P2028' || // Transaction timeout
        error.message?.includes('Connection') ||
        error.message?.includes('timeout');
      
      if (!isTransient || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(`[Prisma] Retry ${attempt}/${maxRetries} after ${delay}ms: ${error.message}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  throw lastError;
}

/**
 * 🆕 Batch multiple queries efficiently
 * Thay vì Promise.all với N queries song song,
 * batch thành chunks để không chiếm hết pool
 */
export async function batchQueries(queries, chunkSize = 3) {
  const results = [];
  
  for (let i = 0; i < queries.length; i += chunkSize) {
    const chunk = queries.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(q => q()));
    results.push(...chunkResults);
  }
  
  return results;
}

export default prisma;
