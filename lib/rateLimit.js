/**
 * 🛡️ RATE LIMITER FOR SHARED HOSTING
 * 
 * Bảo vệ API khỏi DDoS và lạm dụng với RAM hạn chế.
 * Sử dụng sliding window algorithm đơn giản.
 * 
 * Features:
 * - Per-IP rate limiting
 * - Per-user rate limiting  
 * - Different limits cho different endpoints
 * - Memory efficient với auto cleanup
 */

class RateLimiter {
  constructor() {
    this.requests = new Map(); // IP/User -> { count, windowStart }
    this.blocked = new Map();  // IP/User -> blockedUntil timestamp
    
    // Cleanup cũ mỗi 60 giây
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 60000);
    }
  }

  /**
   * Check if request is allowed
   * @param {string} identifier - IP or userId
   * @param {object} options - Rate limit options
   * @returns {object} { allowed: boolean, remaining: number, resetIn: number }
   */
  check(identifier, options = {}) {
    const {
      windowMs = 60000,      // 1 minute window
      maxRequests = 60,      // 60 requests per window
      blockDurationMs = 300000 // Block for 5 minutes if exceeded
    } = options;

    const now = Date.now();

    // Check if currently blocked
    const blockedUntil = this.blocked.get(identifier);
    if (blockedUntil && now < blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.ceil((blockedUntil - now) / 1000),
        blocked: true
      };
    } else if (blockedUntil) {
      this.blocked.delete(identifier);
    }

    // Get or create request record
    let record = this.requests.get(identifier);
    
    if (!record || now - record.windowStart > windowMs) {
      // New window
      record = { count: 1, windowStart: now };
      this.requests.set(identifier, record);
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetIn: Math.ceil(windowMs / 1000),
        blocked: false
      };
    }

    // Same window
    record.count++;

    if (record.count > maxRequests) {
      // Block the identifier
      this.blocked.set(identifier, now + blockDurationMs);
      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.ceil(blockDurationMs / 1000),
        blocked: true
      };
    }

    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetIn: Math.ceil((record.windowStart + windowMs - now) / 1000),
      blocked: false
    };
  }

  /**
   * Cleanup old entries
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes

    for (const [key, record] of this.requests.entries()) {
      if (now - record.windowStart > maxAge) {
        this.requests.delete(key);
      }
    }

    for (const [key, blockedUntil] of this.blocked.entries()) {
      if (now > blockedUntil) {
        this.blocked.delete(key);
      }
    }
  }

  /**
   * Manually block an identifier
   * @param {string} identifier - IP or userId
   * @param {number} durationMs - Block duration
   */
  block(identifier, durationMs = 300000) {
    this.blocked.set(identifier, Date.now() + durationMs);
  }

  /**
   * Unblock an identifier
   * @param {string} identifier - IP or userId
   */
  unblock(identifier) {
    this.blocked.delete(identifier);
    this.requests.delete(identifier);
  }

  /**
   * Get stats
   */
  stats() {
    return {
      activeRequests: this.requests.size,
      blockedIPs: this.blocked.size
    };
  }
}

// Singleton instance
const globalForRateLimiter = globalThis;

export const rateLimiter = globalForRateLimiter.rateLimiter ?? new RateLimiter();

if (process.env.NODE_ENV !== 'production') {
  globalForRateLimiter.rateLimiter = rateLimiter;
}

// ============ RATE LIMIT CONFIGS ============

/**
 * Preset configurations cho different endpoint types
 */
export const RATE_LIMITS = {
  // Strict: Login, Register, Payment
  STRICT: {
    windowMs: 60000,       // 1 minute
    maxRequests: 10,       // 10 requests
    blockDurationMs: 600000 // Block 10 minutes
  },
  
  // Moderate: API calls that write data
  MODERATE: {
    windowMs: 60000,       // 1 minute
    maxRequests: 30,       // 30 requests
    blockDurationMs: 300000 // Block 5 minutes
  },
  
  // Normal: Regular API calls
  NORMAL: {
    windowMs: 60000,       // 1 minute
    maxRequests: 60,       // 60 requests
    blockDurationMs: 120000 // Block 2 minutes
  },
  
  // Relaxed: Static data, reads
  RELAXED: {
    windowMs: 60000,       // 1 minute
    maxRequests: 120,      // 120 requests
    blockDurationMs: 60000 // Block 1 minute
  }
};

/**
 * Extract client IP from request
 * @param {Request} request - Next.js request
 * @returns {string} Client IP
 */
export function getClientIP(request) {
  // Try different headers (reverse proxy, cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP;
  }
  
  // Fallback
  return 'unknown';
}

/**
 * Rate limit middleware helper
 * @param {Request} request - Next.js request
 * @param {object} config - Rate limit config
 * @returns {Response|null} Error response if blocked, null if allowed
 */
export function checkRateLimit(request, config = RATE_LIMITS.NORMAL) {
  const ip = getClientIP(request);
  const result = rateLimiter.check(ip, config);
  
  if (!result.allowed) {
    return {
      error: 'Too many requests. Please try again later.',
      retryAfter: result.resetIn,
      blocked: result.blocked
    };
  }
  
  return null; // Allowed
}

export default rateLimiter;
