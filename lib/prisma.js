import { PrismaClient } from '@prisma/client';
import { DATABASE_CONFIG, LOGGING_CONFIG } from '@/config/runtime.config';

const globalForPrisma = globalThis;

/**
 * 🔧 TỐI ƯU PRISMA - RUNTIME CONFIG DRIVEN
 * 
 * Đọc config từ /config/runtime.config.js
 * Chuyển môi trường chỉ cần đổi RUNTIME_ENV
 */

// Tạo database URL với connection pool settings từ config
function getDatabaseUrl() {
  const baseUrl = process.env.DATABASE_URL || '';
  if (!baseUrl) return baseUrl;
  
  // Parse và thêm connection pool params từ runtime config
  const url = new URL(baseUrl);
  
  // Connection limit từ config
  if (!url.searchParams.has('connection_limit')) {
    url.searchParams.set('connection_limit', String(DATABASE_CONFIG.connectionLimit));
  }
  // Pool timeout từ config
  if (!url.searchParams.has('pool_timeout')) {
    url.searchParams.set('pool_timeout', String(DATABASE_CONFIG.poolTimeout));
  }
  // Connect timeout từ config
  if (!url.searchParams.has('connect_timeout')) {
    url.searchParams.set('connect_timeout', String(DATABASE_CONFIG.connectTimeout));
  }
  // Socket timeout từ config
  if (!url.searchParams.has('socket_timeout')) {
    url.searchParams.set('socket_timeout', String(DATABASE_CONFIG.socketTimeout));
  }
  
  return url.toString();
}

// Tạo Prisma Client với cấu hình từ runtime config
function createPrismaClient() {
  return new PrismaClient({
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
}

// Singleton pattern - đảm bảo chỉ có 1 PrismaClient instance
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Lưu vào global để tái sử dụng (tránh memory leak trong development)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 🔧 FIX: Graceful shutdown với timeout
if (typeof process !== 'undefined') {
  const gracefulShutdown = async () => {
    try {
      await Promise.race([
        prisma.$disconnect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Disconnect timeout')), 5000))
      ]);
    } catch (e) {
      console.error('Prisma disconnect error:', e.message);
    }
  };
  
  process.on('beforeExit', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

export default prisma;
