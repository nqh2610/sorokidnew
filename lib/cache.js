/**
 * 🚀 SIMPLE IN-MEMORY CACHE - RUNTIME CONFIG DRIVEN
 * 
 * Đọc config từ /config/runtime.config.js
 * Chuyển môi trường chỉ cần đổi RUNTIME_ENV
 */

import { CACHE_CONFIG } from '@/config/runtime.config';

class SimpleCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || CACHE_CONFIG.maxSize;
    this.defaultTTL = options.defaultTTL || CACHE_CONFIG.defaultTTL;
    this.lastCleanup = 0;
    this.cleanupThreshold = options.cleanupInterval || CACHE_CONFIG.cleanupInterval;
    
    // 🔧 FIX: KHÔNG dùng setInterval - sử dụng lazy cleanup thay thế
  }
  
  /**
   * 🔧 Lazy cleanup - chỉ cleanup khi cần (thay vì setInterval)
   */
  _lazyCleanup() {
    const now = Date.now();
    if (now - this.lastCleanup < this.cleanupThreshold && this.cache.size < this.maxSize * 0.8) {
      return;
    }
    
    this.lastCleanup = now;
    let cleaned = 0;
    const maxCleanPerCycle = 100;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
      if (cleaned >= maxCleanPerCycle) break;
    }
  }

  /**
   * Get cached value
   */
  get(key) {
    this._lazyCleanup();
    
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }

  /**
   * Set cache value
   */
  set(key, value, ttl = this.defaultTTL) {
    this._lazyCleanup();
    
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
      maxSize: this.maxSize,
      lastCleanup: this.lastCleanup
    };
  }

  /**
   * Destroy cache
   * 🔧 FIX: Không cần clearInterval nữa vì không dùng setInterval
   */
  destroy() {
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
 * Cache TTL (Time To Live) in milliseconds - từ runtime config
 */
export const CACHE_TTL = {
  SHORT: CACHE_CONFIG.ttl.short,
  MEDIUM: CACHE_CONFIG.ttl.medium,
  LONG: CACHE_CONFIG.ttl.long,
  VERY_LONG: CACHE_CONFIG.ttl.extended,
  STATIC: CACHE_CONFIG.ttl.extended * 2,
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
  cache.delete(`quests:${userId}`); // Quests cache
  cache.delete(`cert_progress_${userId}`); // Certificate progress cache
  cache.delete(CACHE_KEYS.LEADERBOARD); // User stats might affect leaderboard
}

/**
 * 🆕 Invalidate ALL cache for a user after important events (payment, tier change)
 * Gọi sau khi payment thành công để đảm bảo user thấy data mới ngay
 * @param {string} userId - User ID
 */
export function invalidateUserCacheCompletely(userId) {
  // Clear tất cả cache liên quan đến user
  cache.deletePattern(`dashboard:${userId}`);
  cache.deletePattern(`user:${userId}`);
  cache.deletePattern(`tier:${userId}`);
  cache.deletePattern(`progress:${userId}`);
  cache.delete(`quests:${userId}`); // Quests cache
  cache.delete(`achievements:${userId}`); // Achievements cache
  cache.delete(`cert_progress_${userId}`);
  cache.delete(CACHE_KEYS.LEADERBOARD);
  
  // Log để debug
  console.log(`[Cache] Completely invalidated cache for user ${userId}`);
}

export default cache;
