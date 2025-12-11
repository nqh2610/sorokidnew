import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Tối ưu connection pool cho Vercel serverless
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  // Tối ưu cho serverless
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Trong development, lưu client để tránh tạo nhiều connections
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
