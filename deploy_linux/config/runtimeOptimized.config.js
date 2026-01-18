/**
 * 🚀 OPTIMIZED CACHE CONFIGURATION
 * 
 * Tăng TTL cho static data để giảm database queries
 * 
 * PRODUCTION SAFE:
 * - Chỉ thay đổi TTL values
 * - Không thay đổi cache mechanism
 * - Có thể rollback bằng config
 * 
 * @version 2.0.0
 */

// ============ ENVIRONMENT ============
const RUNTIME_ENV = process.env.RUNTIME_ENV || 'shared';
const IS_SHARED = RUNTIME_ENV === 'shared';

/**
 * 🎯 OPTIMIZED CACHE TTLs
 * 
 * Nguyên tắc:
 * - Static data (levels, lessons structure): cache lâu (10-30 phút)
 * - User data (progress, stats): cache ngắn (1-2 phút)
 * - Real-time data (leaderboard): cache rất ngắn (30s-1 phút)
 */
export const CACHE_CONFIG = {
  // Max entries trong cache
  maxSize: IS_SHARED ? 500 : 2000,
  
  // Cleanup interval
  cleanupInterval: 60000,
  
  // ============ TTL BY DATA TYPE ============
  ttl: {
    // 🔵 STATIC DATA - Cache lâu, ít thay đổi
    levels: 1800000,        // 30 phút - Structure không đổi
    lessons: 1800000,       // 30 phút - Content không đổi thường xuyên
    achievements: 3600000,  // 1 giờ - Definitions không đổi
    quests: 600000,         // 10 phút - Quest types ít đổi
    pricing: 1800000,       // 30 phút - Pricing ít đổi
    
    // 🟡 USER DATA - Cache ngắn, thay đổi khi user action
    dashboard: 120000,      // 2 phút - User stats
    userProfile: 120000,    // 2 phút - Profile info
    progress: 60000,        // 1 phút - Learning progress
    certificates: 300000,   // 5 phút - Certificates ít đổi
    
    // 🔴 REAL-TIME DATA - Cache rất ngắn
    leaderboard: 60000,     // 1 phút - Rankings
    activity: 60000,        // 1 phút - Recent activity
    
    // 🟢 SYSTEM DATA - Cache lâu
    settings: 3600000,      // 1 giờ - System settings
    trialSettings: 600000,  // 10 phút - Trial config
    
    // General TTLs
    short: 30000,           // 30s
    medium: 120000,         // 2 phút
    long: 600000,           // 10 phút
    extended: 1800000,      // 30 phút
  },
  
  // ============ STALE-WHILE-REVALIDATE ============
  staleWhileRevalidate: {
    enabled: true,
    maxStaleAge: 300000,    // 5 phút max stale
  },
};

/**
 * 🎯 OPTIMIZED DATABASE CONFIG
 */
export const DATABASE_CONFIG = {
  connectionLimit: IS_SHARED ? 5 : 20,
  poolTimeout: IS_SHARED ? 20 : 30,
  connectTimeout: IS_SHARED ? 15 : 15,
  socketTimeout: IS_SHARED ? 45 : 60,
  queryTimeout: IS_SHARED ? 25000 : 60000,
  logLevel: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  retry: {
    attempts: IS_SHARED ? 1 : 3,
    delay: 1000,
  },
};

/**
 * 🎯 API RATE LIMITS
 */
export const API_CONFIG = {
  rateLimit: {
    maxEntries: IS_SHARED ? 3000 : 10000,
    cleanupAge: 300000,
    strict: { windowMs: 60000, maxRequests: IS_SHARED ? 10 : 30 },
    moderate: { windowMs: 60000, maxRequests: IS_SHARED ? 30 : 60 },
    normal: { windowMs: 60000, maxRequests: IS_SHARED ? 60 : 120 },
    relaxed: { windowMs: 60000, maxRequests: IS_SHARED ? 100 : 200 },
  },
};

/**
 * 🎯 LOGGING CONFIG
 */
export const LOGGING_CONFIG = {
  slowQueryThreshold: IS_SHARED ? 3000 : 5000,
  enableDebug: process.env.NODE_ENV === 'development',
};

export default {
  CACHE_CONFIG,
  DATABASE_CONFIG,
  API_CONFIG,
  LOGGING_CONFIG,
};
