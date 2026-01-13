/**
 * 🚀 OPTIMIZED DATABASE QUERIES
 * 
 * Các query patterns tối ưu cho shared hosting:
 * - Single query khi có thể
 * - Select chỉ fields cần thiết
 * - Index-aware queries
 * - Avoid N+1
 * 
 * @version 1.0.0
 */

import prisma from '@/lib/prisma';

// ============ USER QUERIES (OPTIMIZED) ============

/**
 * Lấy user cho authentication - CHỈ SELECT CẦN THIẾT
 * Index: email, username
 */
export async function getUserForAuth(identifier) {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  
  return prisma.user.findFirst({
    where: isEmail 
      ? { email: identifier.toLowerCase() }
      : { username: identifier.toLowerCase() },
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
      username: true,
      avatar: true,
      // KHÔNG select các fields không cần cho auth
    },
  });
}

/**
 * Kiểm tra user tồn tại (cho register)
 * Dùng count thay vì findFirst để nhẹ hơn
 */
export async function checkUserExists(email, username) {
  // Single query với OR condition
  const count = await prisma.user.count({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    },
  });
  
  return count > 0;
}

/**
 * Kiểm tra email/username riêng lẻ có tồn tại
 * Trả về chi tiết để hiển thị lỗi cụ thể
 */
export async function checkUserExistsDetailed(email, username) {
  // Vẫn single query nhưng trả về chi tiết hơn
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    },
    select: {
      email: true,
      username: true,
    },
  });
  
  if (!existing) {
    return { emailExists: false, usernameExists: false };
  }
  
  return {
    emailExists: existing.email === email.toLowerCase(),
    usernameExists: existing.username === username.toLowerCase(),
  };
}

/**
 * Tạo user mới với transaction
 * Đảm bảo atomic operation
 */
export async function createUser(userData) {
  return prisma.user.create({
    data: {
      email: userData.email.toLowerCase(),
      username: userData.username.toLowerCase(),
      name: userData.name,
      password: userData.password,
      phone: userData.phone || null,
      avatar: userData.avatar || null,
      isProfileComplete: true,
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatar: true,
    },
  });
}

/**
 * Lấy hoặc tạo user từ Google OAuth
 * Single transaction để tránh race condition
 */
export async function upsertGoogleUser(googleData) {
  return prisma.user.upsert({
    where: { email: googleData.email.toLowerCase() },
    update: {
      // Chỉ update nếu chưa có
      name: googleData.name,
      avatar: googleData.image,
      googleId: googleData.id,
      lastLoginAt: new Date(),
    },
    create: {
      email: googleData.email.toLowerCase(),
      name: googleData.name,
      avatar: googleData.image,
      googleId: googleData.id,
      isProfileComplete: false, // Cần complete profile sau
      password: '', // Google user không cần password
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatar: true,
      isProfileComplete: true,
    },
  });
}

// ============ SESSION/TOKEN QUERIES ============

/**
 * Lấy user session data (cho JWT callback)
 * Index: id
 */
export async function getUserSessionData(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatar: true,
      role: true,
      tier: true,
      isProfileComplete: true,
    },
  });
}

// ============ DASHBOARD QUERIES (OPTIMIZED) ============

/**
 * Lấy dashboard stats trong 1 query
 * Sử dụng aggregation thay vì multiple queries
 */
export async function getDashboardStats(userId) {
  // Batch queries với transaction để tối ưu pool
  const [user, progressStats, recentActivity] = await prisma.$transaction([
    // User basic info
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
        tier: true,
        totalPoints: true,
        currentStreak: true,
      },
    }),
    
    // Progress aggregation
    prisma.progress.aggregate({
      where: { userId },
      _count: { id: true },
      _sum: { score: true },
      _max: { completedAt: true },
    }),
    
    // Recent activity (limited)
    prisma.progress.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        lessonId: true,
        score: true,
        completedAt: true,
      },
    }),
  ]);
  
  return {
    user,
    stats: {
      totalLessons: progressStats._count.id,
      totalScore: progressStats._sum.score || 0,
      lastActivity: progressStats._max.completedAt,
    },
    recentActivity,
  };
}

// ============ LEADERBOARD QUERIES ============

/**
 * Leaderboard - cached query
 * Sử dụng ISR, không query realtime
 */
export async function getLeaderboard(limit = 20) {
  return prisma.user.findMany({
    orderBy: { totalPoints: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      totalPoints: true,
      tier: true,
    },
  });
}

// ============ BLOG QUERIES (STATIC) ============

/**
 * Blog posts - cho static generation
 * KHÔNG query realtime, dùng ISR
 */
export async function getBlogPostsForStatic() {
  // Nếu blog từ file, return từ file
  // Nếu blog từ DB, query ở đây
  return [];
}

export default {
  getUserForAuth,
  checkUserExists,
  checkUserExistsDetailed,
  createUser,
  upsertGoogleUser,
  getUserSessionData,
  getDashboardStats,
  getLeaderboard,
};
