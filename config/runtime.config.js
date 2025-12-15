/**
 * 🎯 RUNTIME CONFIGURATION CENTER
 * 
 * MỌI THÔNG SỐ ẢNH HƯỞNG ĐẾN HIỆU SUẤT ĐỀU TẬP TRUNG TẠI ĐÂY
 * 
 * Chuyển môi trường chỉ bằng: RUNTIME_ENV=shared | vps
 * Logic không đổi, chỉ thay đổi hành vi qua config
 * 
 * @author Principal Software Architect
 * @version 1.0.0
 */

// ============ ENVIRONMENT DETECTION ============
const RUNTIME_ENV = process.env.RUNTIME_ENV || 'shared';
const IS_SHARED = RUNTIME_ENV === 'shared';
const IS_VPS = RUNTIME_ENV === 'vps';
const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * 🔧 DATABASE CONFIGURATION
 * Shared host: Pool nhỏ, timeout ngắn, fail-fast
 * VPS: Pool lớn hơn, timeout linh hoạt hơn
 */
export const DATABASE_CONFIG = {
  // Connection pool size
  connectionLimit: IS_SHARED ? 5 : 20,
  
  // Pool timeout (ms) - thời gian chờ lấy connection từ pool
  poolTimeout: IS_SHARED ? 10 : 30,
  
  // Connect timeout (ms) - thời gian chờ kết nối DB
  connectTimeout: IS_SHARED ? 5 : 15,
  
  // Socket timeout (ms) - timeout cho query
  socketTimeout: IS_SHARED ? 30 : 60,
  
  // Query timeout (ms) - soft limit cho queries
  queryTimeout: IS_SHARED ? 25000 : 60000,
  
  // Log level
  logLevel: IS_DEV ? ['error', 'warn'] : ['error'],
};

/**
 * 🔐 AUTHENTICATION CONFIGURATION
 * Bảo vệ login, session, JWT
 */
export const AUTH_CONFIG = {
  // === LOGIN PROTECTION ===
  login: {
    // Số lần login sai tối đa trước khi lock
    maxFailedAttempts: IS_SHARED ? 5 : 10,
    
    // Thời gian lock tạm (ms) - progressive lockout
    lockDurations: IS_SHARED 
      ? [30000, 60000, 300000, 900000, 3600000]  // 30s, 1m, 5m, 15m, 1h
      : [60000, 300000, 900000, 3600000, 86400000], // 1m, 5m, 15m, 1h, 24h
    
    // Thời gian reset counter nếu không có hoạt động
    resetWindow: 30 * 60 * 1000, // 30 phút
    
    // Rate limit cho login attempts
    rateLimit: {
      windowMs: 60000, // 1 phút
      maxRequests: IS_SHARED ? 10 : 30,
    },
    
    // Delay tối thiểu response (chống timing attack)
    minResponseDelay: IS_SHARED ? 500 : 200,
    
    // Max entries trong Map (memory protection)
    maxEntries: IS_SHARED ? 3000 : 10000,
  },
  
  // === SESSION ===
  session: {
    // JWT secret
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
    
    // Session timeout
    maxAge: 24 * 60 * 60, // 24 hours
    
    // Update age (refresh token after)
    updateAge: 60 * 60, // 1 hour
  },
};

/**
 * 🌐 API CONFIGURATION
 * Rate limiting, timeouts, concurrent requests
 */
export const API_CONFIG = {
  // === REQUEST LIMITING ===
  requests: {
    // Concurrent requests tối đa (mỗi request ≈ 2-5 processes)
    maxConcurrent: IS_SHARED ? 50 : 200,
    
    // Queue size cho requests chờ
    maxQueueSize: IS_SHARED ? 100 : 500,
    
    // Queue timeout (ms)
    queueTimeout: IS_SHARED ? 15000 : 30000,
  },
  
  // === RATE LIMITING (tracking, soft-limit) ===
  rateLimit: {
    // Strict (login, claim rewards)
    strict: { 
      windowMs: 60000, 
      maxRequests: IS_SHARED ? 30 : 60 
    },
    // Moderate (write operations)
    moderate: { 
      windowMs: 60000, 
      maxRequests: IS_SHARED ? 100 : 200 
    },
    // Normal (read operations)
    normal: { 
      windowMs: 60000, 
      maxRequests: IS_SHARED ? 200 : 500 
    },
    // Relaxed (public data)
    relaxed: { 
      windowMs: 60000, 
      maxRequests: IS_SHARED ? 500 : 1000 
    },
    
    // Max entries trong Map
    maxEntries: IS_SHARED ? 1000 : 5000,
    
    // Cleanup interval
    cleanupAge: 300000, // 5 phút
  },
  
  // === TIMEOUTS ===
  timeouts: {
    // Default API timeout
    default: IS_SHARED ? 25000 : 60000,
    
    // Heavy operations (dashboard stats)
    heavy: IS_SHARED ? 20000 : 45000,
    
    // Normal operations (CRUD)
    normal: IS_SHARED ? 15000 : 30000,
    
    // Light operations (simple reads)
    light: IS_SHARED ? 10000 : 20000,
    
    // Background operations
    background: IS_SHARED ? 2000 : 5000,
  },
  
  // === CIRCUIT BREAKER ===
  circuitBreaker: {
    // Số errors liên tiếp để OPEN
    errorThreshold: IS_SHARED ? 5 : 10,
    
    // Số success để CLOSE lại
    successThreshold: IS_SHARED ? 2 : 3,
    
    // Thời gian OPEN trước khi thử HALF_OPEN
    timeout: IS_SHARED ? 60000 : 30000,
  },
};

/**
 * 💾 CACHE CONFIGURATION
 * In-memory cache settings
 */
export const CACHE_CONFIG = {
  // Max entries trong cache
  maxSize: IS_SHARED ? 500 : 2000,
  
  // Default TTL (ms)
  defaultTTL: IS_SHARED ? 30000 : 60000,
  
  // Cleanup threshold (ms) - lazy cleanup
  cleanupInterval: IS_SHARED ? 60000 : 120000,
  
  // TTL presets
  ttl: {
    // Very short (realtime data)
    short: IS_SHARED ? 10000 : 15000,
    
    // Medium (user data, progress)
    medium: IS_SHARED ? 30000 : 60000,
    
    // Long (static data, leaderboard)
    long: IS_SHARED ? 60000 : 180000,
    
    // Extended (rarely changing)
    extended: IS_SHARED ? 300000 : 600000,
  },
};

/**
 * 🖥️ RENDERING CONFIGURATION
 * SSR, prefetch settings
 */
export const RENDERING_CONFIG = {
  // SSR settings
  ssr: {
    // Enable full SSR
    enabled: IS_VPS,
    
    // Revalidate interval
    revalidate: IS_SHARED ? false : 60,
  },
  
  // Prefetch settings
  prefetch: {
    // Enable link prefetch
    enabled: IS_VPS,
    
    // Prefetch on hover only (for shared)
    onHoverOnly: IS_SHARED,
  },
  
  // Image optimization
  images: {
    // Use blur placeholder
    blur: IS_VPS,
    
    // Quality
    quality: IS_SHARED ? 75 : 85,
  },
};

/**
 * 📝 LOGGING CONFIGURATION
 */
export const LOGGING_CONFIG = {
  // Log level
  level: IS_DEV ? 'debug' : (IS_SHARED ? 'error' : 'warn'),
  
  // Enable console logs
  console: IS_DEV || IS_VPS,
  
  // Log request details
  requests: IS_VPS,
  
  // Log slow queries (ms)
  slowQueryThreshold: IS_SHARED ? 5000 : 10000,
};

/**
 * 🔧 SYSTEM LIMITS
 * Process & memory protection
 */
export const SYSTEM_LIMITS = {
  // Max processes estimate (for calculations)
  maxProcesses: IS_SHARED ? 1000 : 5000,
  
  // Memory threshold for warnings (MB)
  memoryWarningThreshold: IS_SHARED ? 512 : 2048,
  
  // Max Map entries (global limit)
  maxMapEntries: IS_SHARED ? 5000 : 20000,
  
  // Max pending promises
  maxPendingPromises: IS_SHARED ? 50 : 200,
};

// ============ HELPER FUNCTIONS ============

/**
 * Get config value với override từ env
 */
export function getConfigValue(path, defaultValue) {
  const envKey = `CONFIG_${path.toUpperCase().replace(/\./g, '_')}`;
  return process.env[envKey] || defaultValue;
}

/**
 * Check if running on shared hosting
 */
export function isSharedHost() {
  return IS_SHARED;
}

/**
 * Check if running on VPS
 */
export function isVPS() {
  return IS_VPS;
}

/**
 * Get current environment name
 */
export function getEnvironment() {
  return RUNTIME_ENV;
}

/**
 * Get all config for debugging
 */
export function getAllConfig() {
  return {
    environment: RUNTIME_ENV,
    isShared: IS_SHARED,
    isVPS: IS_VPS,
    isDev: IS_DEV,
    database: DATABASE_CONFIG,
    auth: AUTH_CONFIG,
    api: API_CONFIG,
    cache: CACHE_CONFIG,
    rendering: RENDERING_CONFIG,
    logging: LOGGING_CONFIG,
    system: SYSTEM_LIMITS,
  };
}

// ============ DEFAULT EXPORT ============
const runtimeConfig = {
  // Environment
  env: RUNTIME_ENV,
  isShared: IS_SHARED,
  isVPS: IS_VPS,
  isDev: IS_DEV,
  
  // Configs
  database: DATABASE_CONFIG,
  auth: AUTH_CONFIG,
  api: API_CONFIG,
  cache: CACHE_CONFIG,
  rendering: RENDERING_CONFIG,
  logging: LOGGING_CONFIG,
  system: SYSTEM_LIMITS,
  
  // Helpers
  getConfigValue,
  isSharedHost,
  isVPS: () => IS_VPS,
  getEnvironment,
  getAllConfig,
};

export default runtimeConfig;

// ============ SUMMARY ============
/**
 * 📊 CONFIGURATION SUMMARY
 * 
 * SHARED HOST (RUNTIME_ENV=shared):
 * - DB: 5 connections, 10s pool timeout
 * - API: 50 concurrent, 15s queue timeout
 * - Cache: 500 entries, 30s TTL
 * - SSR: Disabled
 * - Logging: Errors only
 * 
 * VPS (RUNTIME_ENV=vps):
 * - DB: 20 connections, 30s pool timeout
 * - API: 200 concurrent, 30s queue timeout
 * - Cache: 2000 entries, 60s TTL
 * - SSR: Enabled
 * - Logging: Warnings + Errors
 * 
 * Chuyển đổi: Chỉ cần đổi RUNTIME_ENV
 * Không cần sửa code!
 */
