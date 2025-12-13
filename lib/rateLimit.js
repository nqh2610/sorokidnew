/**
 * 🛡️ RATE LIMITER - SOFT MODE
 * 
 * KHÔNG BLOCK USER - Chỉ tracking và warning
 * Block = UX tệ, user nghĩ web lỗi
 * 
 * Thay vào đó dùng:
 * 1. Server-side caching (đã có)
 * 2. Query optimization 
 * 3. Client-side caching
 * 4. Lazy loading
 */

class RateLimiter {
  constructor() {
    // Giữ để tracking nhưng không block
    this.requests = new Map();
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
    if (this.requests.size > 1000) {
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
      if (now - record.windowStart > 300000) {
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

// ============ RATE LIMIT CONFIGS (chỉ để tracking) ============
export const RATE_LIMITS = {
  STRICT: { windowMs: 60000, maxRequests: 30 },
  MODERATE: { windowMs: 60000, maxRequests: 100 },
  NORMAL: { windowMs: 60000, maxRequests: 200 },
  RELAXED: { windowMs: 60000, maxRequests: 500 }
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
