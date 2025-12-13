import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/**
 * 🔧 TỐI ƯU PRISMA CHO SHARED HOSTING (3GB RAM)
 * 
 * Connection Pool Settings:
 * - connection_limit: Giới hạn số connections đồng thời (shared hosting thường giới hạn 10-25)
 * - pool_timeout: Thời gian chờ lấy connection từ pool
 * - connect_timeout: Thời gian chờ kết nối DB
 * 
 * Với 3GB RAM shared hosting, khuyến nghị:
 * - connection_limit=5-10 (để dành room cho các process khác)
 * - Reuse connections thay vì tạo mới
 */

// Tạo database URL với connection pool settings
function getDatabaseUrl() {
  const baseUrl = process.env.DATABASE_URL || '';
  if (!baseUrl) return baseUrl;
  
  // Parse và thêm connection pool params nếu chưa có
  const url = new URL(baseUrl);
  
  // Tăng connection pool cho nhiều người dùng đồng thời (10-15 là hợp lý cho shared hosting)
  if (!url.searchParams.has('connection_limit')) {
    url.searchParams.set('connection_limit', '10');
  }
  // Pool timeout: 15 giây (tăng để tránh timeout khi đông người dùng)
  if (!url.searchParams.has('pool_timeout')) {
    url.searchParams.set('pool_timeout', '15');
  }
  // Connect timeout: 10 giây (tăng để ổn định hơn)
  if (!url.searchParams.has('connect_timeout')) {
    url.searchParams.set('connect_timeout', '10');
  }
  
  return url.toString();
}

// Tạo Prisma Client với cấu hình tối ưu
function createPrismaClient() {
  return new PrismaClient({
    // Chỉ log errors trong production
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
    
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

// Graceful shutdown - đóng connection khi app tắt
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
