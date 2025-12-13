/**
 * 🚀 SIMPLE IN-MEMORY CACHE FOR SHARED HOSTING
 * 
 * Giảm tải database queries cho shared hosting với RAM hạn chế.
 * Cache nhẹ, không dùng Redis để tiết kiệm tài nguyên.
 * 
 * Features:
 * - TTL (Time To Live) cho mỗi cache entry
 * - Auto cleanup expired entries
 * - Memory limit protection
 * - Per-user và global cache
 */

class SimpleCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 1000; // Max entries
    this.defaultTTL = options.defaultTTL || 60000; // 60 seconds default
    this.cleanupInterval = options.cleanupInterval || 60000; // Cleanup every 60s
    
    // Auto cleanup
    if (typeof setInterval !== 'undefined') {
      this._cleanupTimer = setInterval(() => this.cleanup(), this.cleanupInterval);
    }
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {any} Cached value or undefined
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }

  /**
   * Set cache value
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in ms (optional)
   */
  set(key, value, ttl = this.defaultTTL) {
    // Enforce size limit - remove oldest entries if needed
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    });
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Delete all entries matching a pattern
   * @param {string} pattern - Key pattern (prefix)
   */
  deletePattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  stats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }

  /**
   * Destroy cache (cleanup timer)
   */
  destroy() {
    if (this._cleanupTimer) {
      clearInterval(this._cleanupTimer);
    }
    this.clear();
  }
}

// Singleton instance
const globalForCache = globalThis;

export const cache = globalForCache.appCache ?? new SimpleCache({
  maxSize: 500,           // Max 500 entries (đủ cho shared hosting)
  defaultTTL: 30000,      // 30 seconds default
  cleanupInterval: 60000  // Cleanup every 60s
});

if (process.env.NODE_ENV !== 'production') {
  globalForCache.appCache = cache;
}

// ============ CACHE KEYS & HELPERS ============

/**
 * Cache keys pattern
 */
export const CACHE_KEYS = {
  DASHBOARD_STATS: (userId) => `dashboard:${userId}`,
  USER_PROFILE: (userId) => `user:${userId}`,
  LEADERBOARD: 'leaderboard:top50',
  PRICING_PLANS: 'pricing:plans',
  PAYMENT_SETTINGS: 'payment:settings',
  LESSONS: (levelId) => levelId ? `lessons:${levelId}` : 'lessons:all',
  LEVELS: 'levels:all',
  QUESTS: 'quests:active',
  ACHIEVEMENTS: 'achievements:all',
};

/**
 * Cache TTL (Time To Live) in milliseconds
 */
export const CACHE_TTL = {
  SHORT: 10000,      // 10 seconds - cho data thay đổi nhanh
  MEDIUM: 30000,     // 30 seconds - dashboard, user stats
  LONG: 60000,       // 1 minute - lessons, levels
  VERY_LONG: 300000, // 5 minutes - pricing, settings
  STATIC: 3600000,   // 1 hour - achievements, quests config
};

/**
 * Get or set cache with async function
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Async function to fetch data if not cached
 * @param {number} ttl - TTL in ms
 */
export async function getOrSet(key, fetchFn, ttl = CACHE_TTL.MEDIUM) {
  // Try to get from cache first
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  
  // Fetch fresh data
  const data = await fetchFn();
  
  // Cache the result
  if (data !== null && data !== undefined) {
    cache.set(key, data, ttl);
  }
  
  return data;
}

/**
 * Invalidate user-related cache
 * @param {string} userId - User ID
 */
export function invalidateUserCache(userId) {
  cache.deletePattern(`dashboard:${userId}`);
  cache.deletePattern(`user:${userId}`);
  cache.delete(CACHE_KEYS.LEADERBOARD); // User stats might affect leaderboard
}

export default cache;
