/**
 * 🛡️ LOGIN PROTECTION - RUNTIME CONFIG DRIVEN
 * 
 * Chống brute-force attack mà KHÔNG gây overload process
 * Đọc config từ /config/runtime.config.js
 * 
 * @version 3.0 - Runtime Config Driven
 */

import { AUTH_CONFIG, SYSTEM_LIMITS } from '@/config/runtime.config';

// ============ CONFIG TỪ RUNTIME ============
const LOGIN_CONFIG = {
  MAX_FAILED_ATTEMPTS: AUTH_CONFIG.login.maxFailedAttempts,
  LOCK_DURATIONS: AUTH_CONFIG.login.lockDurations,
  RESET_WINDOW: AUTH_CONFIG.login.resetWindow,
  RATE_LIMIT_WINDOW: AUTH_CONFIG.login.rateLimit.windowMs,
  RATE_LIMIT_MAX_REQUESTS: AUTH_CONFIG.login.rateLimit.maxRequests,
  MAX_ENTRIES: AUTH_CONFIG.login.maxEntries,
  MIN_RESPONSE_DELAY: AUTH_CONFIG.login.minResponseDelay,
};

// ============ IN-MEMORY STORAGE ============
// Sử dụng Map thay vì object để performance tốt hơn

/**
 * Lưu trạng thái login theo email
 * Key: email
 * Value: { failedAttempts, lastAttempt, lockedUntil, lockCount }
 */
const loginAttempts = new Map();

/**
 * Lưu rate limit theo IP
 * Key: IP
 * Value: { count, windowStart }
 */
const ipRateLimit = new Map();

// ============ UTILITY FUNCTIONS ============

/**
 * Lấy client IP từ request
 */
export function getClientIP(request) {
  return request.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers?.get?.('x-real-ip') ||
         request.headers?.get?.('cf-connecting-ip') ||
         request.ip ||
         'unknown';
}

/**
 * Tạo key kết hợp IP + Email (chống bypass bằng đổi email)
 */
function getLoginKey(ip, email) {
  return `${ip}:${email?.toLowerCase()}`;
}

/**
 * Lazy cleanup - chỉ cleanup khi Map quá lớn
 * KHÔNG dùng setInterval để tránh spawn process
 */
function lazyCleanup(map, maxAge = LOGIN_CONFIG.RESET_WINDOW) {
  if (map.size < LOGIN_CONFIG.MAX_ENTRIES) return;
  
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, value] of map.entries()) {
    const lastActivity = value.lastAttempt || value.windowStart || 0;
    if (now - lastActivity > maxAge) {
      map.delete(key);
      cleaned++;
    }
    // Dừng sớm nếu đã cleanup đủ
    if (cleaned >= 500) break;
  }
}

// ============ MAIN FUNCTIONS ============

/**
 * Kiểm tra rate limit theo IP
 * @returns {Object} { allowed, remaining, retryAfter }
 */
export function checkIPRateLimit(ip) {
  const now = Date.now();
  const record = ipRateLimit.get(ip);
  
  // Cleanup lazy
  lazyCleanup(ipRateLimit, LOGIN_CONFIG.RATE_LIMIT_WINDOW * 2);
  
  if (!record || now - record.windowStart > LOGIN_CONFIG.RATE_LIMIT_WINDOW) {
    // Window mới
    ipRateLimit.set(ip, { count: 1, windowStart: now });
    return { 
      allowed: true, 
      remaining: LOGIN_CONFIG.RATE_LIMIT_MAX_REQUESTS - 1,
      retryAfter: 0 
    };
  }
  
  record.count++;
  
  if (record.count > LOGIN_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.windowStart + LOGIN_CONFIG.RATE_LIMIT_WINDOW - now) / 1000);
    return { 
      allowed: false, 
      remaining: 0, 
      retryAfter 
    };
  }
  
  return { 
    allowed: true, 
    remaining: LOGIN_CONFIG.RATE_LIMIT_MAX_REQUESTS - record.count,
    retryAfter: 0 
  };
}

/**
 * Kiểm tra trạng thái login của email (có bị lock không?)
 * @returns {Object} { allowed, lockedUntil, failedAttempts, message }
 */
export function checkLoginStatus(ip, email) {
  const key = getLoginKey(ip, email);
  const now = Date.now();
  const record = loginAttempts.get(key);
  
  // Cleanup lazy
  lazyCleanup(loginAttempts);
  
  if (!record) {
    return { 
      allowed: true, 
      failedAttempts: 0, 
      message: null 
    };
  }
  
  // Check nếu đang bị lock
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    
    return {
      allowed: false,
      failedAttempts: record.failedAttempts,
      lockedUntil: record.lockedUntil,
      retryAfter: remainingSeconds,
      message: remainingSeconds > 60 
        ? `Tài khoản tạm khóa. Vui lòng thử lại sau ${remainingMinutes} phút`
        : `Tài khoản tạm khóa. Vui lòng thử lại sau ${remainingSeconds} giây`
    };
  }
  
  // Reset nếu đã lâu không có hoạt động
  if (now - record.lastAttempt > LOGIN_CONFIG.RESET_WINDOW) {
    loginAttempts.delete(key);
    return { 
      allowed: true, 
      failedAttempts: 0, 
      message: null 
    };
  }
  
  return { 
    allowed: true, 
    failedAttempts: record.failedAttempts,
    message: null 
  };
}

/**
 * Ghi nhận login thất bại
 * @returns {Object} { locked, lockDuration, failedAttempts, message }
 */
export function recordFailedLogin(ip, email) {
  const key = getLoginKey(ip, email);
  const now = Date.now();
  let record = loginAttempts.get(key);
  
  if (!record) {
    record = { 
      failedAttempts: 0, 
      lastAttempt: now, 
      lockedUntil: null,
      lockCount: 0 
    };
  }
  
  record.failedAttempts++;
  record.lastAttempt = now;
  
  // Kiểm tra có cần lock không
  if (record.failedAttempts >= LOGIN_CONFIG.MAX_FAILED_ATTEMPTS) {
    record.lockCount++;
    
    // Lấy thời gian lock (tăng dần theo số lần bị lock)
    const lockIndex = Math.min(record.lockCount - 1, LOGIN_CONFIG.LOCK_DURATIONS.length - 1);
    const lockDuration = LOGIN_CONFIG.LOCK_DURATIONS[lockIndex];
    
    record.lockedUntil = now + lockDuration;
    record.failedAttempts = 0; // Reset counter sau khi lock
    
    loginAttempts.set(key, record);
    
    const lockMinutes = Math.ceil(lockDuration / 60000);
    return {
      locked: true,
      lockDuration,
      lockMinutes,
      lockCount: record.lockCount,
      message: `Quá nhiều lần đăng nhập sai. Tài khoản bị khóa ${lockMinutes} phút`
    };
  }
  
  loginAttempts.set(key, record);
  
  const remaining = LOGIN_CONFIG.MAX_FAILED_ATTEMPTS - record.failedAttempts;
  return {
    locked: false,
    failedAttempts: record.failedAttempts,
    remainingAttempts: remaining,
    message: `Sai mật khẩu. Còn ${remaining} lần thử`
  };
}

/**
 * Ghi nhận login thành công - Reset counter
 */
export function recordSuccessfulLogin(ip, email) {
  const key = getLoginKey(ip, email);
  loginAttempts.delete(key);
}

/**
 * Tạo delay response để làm chậm brute-force
 * Delay tăng dần theo số lần sai
 */
export function getResponseDelay(failedAttempts) {
  // Base delay + thêm delay theo số lần sai
  const delay = LOGIN_CONFIG.MIN_RESPONSE_DELAY + (failedAttempts * 200);
  // Max 3 giây
  return Math.min(delay, 3000);
}

/**
 * Sleep function (không block event loop)
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============ ALL-IN-ONE CHECK ============

/**
 * Kiểm tra toàn bộ login protection trước khi xử lý login
 * @returns {Object} { allowed, error, statusCode }
 */
export function checkLoginProtection(request, email) {
  const ip = getClientIP(request);
  
  // 1. Check IP rate limit
  const rateLimit = checkIPRateLimit(ip);
  if (!rateLimit.allowed) {
    return {
      allowed: false,
      error: `Quá nhiều request. Vui lòng thử lại sau ${rateLimit.retryAfter} giây`,
      statusCode: 429,
      retryAfter: rateLimit.retryAfter
    };
  }
  
  // 2. Check login status (lock)
  const loginStatus = checkLoginStatus(ip, email);
  if (!loginStatus.allowed) {
    return {
      allowed: false,
      error: loginStatus.message,
      statusCode: 423, // Locked
      retryAfter: loginStatus.retryAfter
    };
  }
  
  return {
    allowed: true,
    failedAttempts: loginStatus.failedAttempts,
    ip
  };
}

// ============ EXPORT STATS (cho monitoring) ============
export function getLoginProtectionStats() {
  return {
    loginAttempts: loginAttempts.size,
    ipRateLimits: ipRateLimit.size,
    config: LOGIN_CONFIG
  };
}

// Default export
const loginProtection = {
  checkIPRateLimit,
  checkLoginStatus,
  recordFailedLogin,
  recordSuccessfulLogin,
  checkLoginProtection,
  getResponseDelay,
  sleep,
  getClientIP,
  getLoginProtectionStats
};

export default loginProtection;
