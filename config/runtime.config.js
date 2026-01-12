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
 * Shared host: Pool vừa đủ, timeout ngắn, fail-fast
 * VPS: Pool lớn hơn, timeout linh hoạt hơn
 * 
 * 🎯 SHARED HOST OPTIMIZATION v2.0:
 * - 5 connections đủ cho ~30 concurrent users với caching tốt
 * - Sequential queries trong dashboard để không chiếm hết pool
 * - Tăng timeout để tránh connection churn
 */
export const DATABASE_CONFIG = {
  // Connection pool size - giảm xuống 5 để tiết kiệm processes
  connectionLimit: IS_SHARED ? 5 : 20,
  
  // Pool timeout (s) - thời gian chờ lấy connection từ pool
  poolTimeout: IS_SHARED ? 20 : 30,
  
  // Connect timeout (s) - thời gian chờ kết nối DB
  connectTimeout: IS_SHARED ? 15 : 15,
  
  // Socket timeout (s) - timeout cho query
  socketTimeout: IS_SHARED ? 45 : 60,
  
  // Query timeout (ms) - soft limit cho queries
  queryTimeout: IS_SHARED ? 25000 : 60000,
  
  // Log level
  logLevel: IS_DEV ? ['error', 'warn'] : ['error'],
  
  // 🆕 Retry config cho transient failures
  retry: {
    attempts: IS_SHARED ? 1 : 3, // Giảm retry để không tạo thêm connections
    delay: IS_SHARED ? 1000 : 1000,
  },
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
 * 
 * 🎯 SHARED HOST v2.0: Cân bằng giữa protection và UX
 */
export const API_CONFIG = {
  // === REQUEST LIMITING ===
  requests: {
    // Concurrent requests tối đa - tăng lên 25 để giảm reject
    maxConcurrent: IS_SHARED ? 25 : 200,
    
    // Queue size cho requests chờ
    maxQueueSize: IS_SHARED ? 80 : 500,
    
    // Queue timeout (ms) - giảm xuống 8s để user không chờ lâu
    queueTimeout: IS_SHARED ? 8000 : 30000,
    
    // 🆕 Priority queue cho essential APIs
    priorityAPIs: [
      '/api/auth',
      '/api/lessons',
      '/api/progress',
      '/api/exercises',
    ],
    
    // 🆕 Heavy APIs cần throttle riêng
    heavyAPIs: [
      '/api/dashboard/stats',
      '/api/leaderboard',
      '/api/admin',
    ],
    // Max concurrent cho heavy APIs - tăng lên 5
    maxHeavyConcurrent: IS_SHARED ? 5 : 20,
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
  
  // === TIMEOUTS - Giảm để fail fast, không giữ connection lâu ===
  timeouts: {
    // Default API timeout
    default: IS_SHARED ? 15000 : 30000,
    
    // Heavy operations (dashboard stats)
    heavy: IS_SHARED ? 12000 : 25000,
    
    // Normal operations (CRUD)
    normal: IS_SHARED ? 10000 : 20000,
    
    // Light operations (simple reads)
    light: IS_SHARED ? 6000 : 15000,
    
    // Background operations
    background: IS_SHARED ? 2000 : 5000,
  },
  
  // === CIRCUIT BREAKER ===
  circuitBreaker: {
    // Số errors liên tiếp để OPEN - tăng lên để tránh false positive
    errorThreshold: IS_SHARED ? 10 : 15,
    
    // Số success để CLOSE lại
    successThreshold: IS_SHARED ? 2 : 3,
    
    // Thời gian OPEN trước khi thử HALF_OPEN - giảm để hồi phục nhanh
    timeout: IS_SHARED ? 30000 : 20000,
  },
  
  // === POLLING CONFIG (Frontend) ===
  polling: {
    // Payment status polling interval (ms)
    paymentInterval: IS_SHARED ? 10000 : 5000,
    
    // Max polling attempts trước khi dừng
    maxPolls: IS_SHARED ? 90 : 180, // 15 phút với 10s / 15 phút với 5s
    
    // Auto-stop polling timeout (ms)
    autoStopTimeout: IS_SHARED ? 15 * 60 * 1000 : 30 * 60 * 1000,
  },
};

/**
 * 💾 CACHE CONFIGURATION
 * In-memory cache settings
 * 
 * 🎯 SHARED HOST OPTIMIZATION v2.0:
 * - Tăng TTL mạnh để giảm DB queries
 * - Stale-while-revalidate pattern: serve cũ trong khi fetch mới
 * - Giảm concurrent queries
 */
export const CACHE_CONFIG = {
  // Max entries trong cache - giảm để tiết kiệm RAM
  maxSize: IS_SHARED ? 400 : 2000,
  
  // Default TTL (ms) - tăng lên 90s cho shared
  defaultTTL: IS_SHARED ? 90000 : 60000,
  
  // Cleanup threshold (ms) - lazy cleanup ít hơn
  cleanupInterval: IS_SHARED ? 120000 : 120000,
  
  // TTL presets - CÂN BẰNG giữa performance và data freshness
  ttl: {
    // Very short (realtime data) - 15s
    short: IS_SHARED ? 15000 : 10000,
    
    // Medium (user data, progress) - 45s
    medium: IS_SHARED ? 45000 : 30000,
    
    // Long (static data, leaderboard) - 2 phút
    long: IS_SHARED ? 120000 : 90000,
    
    // Extended (rarely changing) - 5 phút
    extended: IS_SHARED ? 300000 : 300000,
    
    // Dashboard specific - 45s để data tương đối fresh
    dashboard: IS_SHARED ? 45000 : 30000,
    
    // Lessons/Levels (static) - 5 phút vì ít thay đổi
    lessons: IS_SHARED ? 300000 : 180000,
    
    // Trial settings - 10 phút vì admin ít đổi
    trialSettings: IS_SHARED ? 600000 : 300000,
  },
  
  // 🆕 Stale-while-revalidate: serve stale data trong khi fetch mới
  staleWhileRevalidate: {
    enabled: IS_SHARED, // Chỉ bật cho shared host
    maxStaleAge: IS_SHARED ? 180000 : 0, // 3 phút stale max
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
    // Enable link prefetch trên navigation
    enabled: IS_VPS,
    
    // Prefetch on hover only (for shared)
    onHoverOnly: IS_SHARED,
  },
  
  // Navigation settings
  navigation: {
    // Prefetch links trong BottomNav
    prefetchLinks: IS_VPS, // false cho shared host
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
