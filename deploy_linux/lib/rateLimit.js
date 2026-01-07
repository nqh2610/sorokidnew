/**
 * 🛡️ RATE LIMITER - RUNTIME CONFIG DRIVEN
 * 
 * KHÔNG BLOCK USER - Chỉ tracking và warning
 * Đọc config từ /config/runtime.config.js
 */

import { API_CONFIG } from '@/config/runtime.config';

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.maxEntries = API_CONFIG.rateLimit.maxEntries;
    this.cleanupAge = API_CONFIG.rateLimit.cleanupAge;
  }

  /**
   * Check request - LUÔN CHO PHÉP, chỉ log warning nếu quá nhiều
   */
  check(identifier, options = {}) {
    const { windowMs = 60000, maxRequests = 100 } = options;
    const now = Date.now();

    let record = this.requests.get(identifier);
    
    if (!record || now - record.windowStart > windowMs) {
      record = { count: 1, windowStart: now };
      this.requests.set(identifier, record);
    } else {
      record.count++;
    }

    // Chỉ log warning, KHÔNG BLOCK
    if (record.count > maxRequests && record.count % 50 === 0) {
      console.warn(`[RateLimit] High traffic from ${identifier}: ${record.count} requests`);
    }

    // Cleanup nếu map quá lớn
    if (this.requests.size > this.maxEntries) {
      this.cleanup();
    }

    // LUÔN CHO PHÉP
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - record.count),
      resetIn: Math.ceil((record.windowStart + windowMs - now) / 1000),
      blocked: false
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now - record.windowStart > this.cleanupAge) {
        this.requests.delete(key);
      }
    }
  }

  stats() {
    return { activeRequests: this.requests.size, blockedIPs: 0 };
  }
}

// Singleton
const globalForRateLimiter = globalThis;
export const rateLimiter = globalForRateLimiter.rateLimiter ?? new RateLimiter();
if (process.env.NODE_ENV !== 'production') {
  globalForRateLimiter.rateLimiter = rateLimiter;
}

// ============ RATE LIMIT CONFIGS từ runtime config ============
export const RATE_LIMITS = {
  STRICT: API_CONFIG.rateLimit.strict,
  MODERATE: API_CONFIG.rateLimit.moderate,
  NORMAL: API_CONFIG.rateLimit.normal,
  RELAXED: API_CONFIG.rateLimit.relaxed,
};

export function getClientIP(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         request.headers.get('cf-connecting-ip') ||
         'unknown';
}

/**
 * Check rate limit - KHÔNG BAO GIỜ BLOCK, chỉ tracking
 */
export function checkRateLimit(request, config = RATE_LIMITS.NORMAL) {
  const ip = getClientIP(request);
  rateLimiter.check(ip, config);
  return null; // LUÔN CHO PHÉP
}

export default rateLimiter;
