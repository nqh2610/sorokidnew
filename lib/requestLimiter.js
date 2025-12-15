/**
 * 🔒 REQUEST LIMITER - RUNTIME CONFIG DRIVEN
 * 
 * Đọc config từ /config/runtime.config.js
 * Chuyển môi trường chỉ cần đổi RUNTIME_ENV
 */

import { API_CONFIG } from '@/config/runtime.config';

class RequestLimiter {
  constructor(options = {}) {
    // Số requests đang xử lý đồng thời
    this.activeRequests = 0;
    
    // Giới hạn từ runtime config
    this.maxConcurrentRequests = options.maxConcurrentRequests || API_CONFIG.requests.maxConcurrent;
    
    // Queue cho requests đang chờ
    this.waitingQueue = [];
    this.maxQueueSize = options.maxQueueSize || API_CONFIG.requests.maxQueueSize;
    
    // Timeout cho queue từ config
    this.queueTimeout = options.queueTimeout || API_CONFIG.requests.queueTimeout;
    
    // Stats
    this.stats = {
      totalRequests: 0,
      rejectedRequests: 0,
      queuedRequests: 0,
      peakConcurrent: 0
    };
  }

  /**
   * Acquire slot để xử lý request
   * @returns {Promise<boolean>} true nếu có slot, false nếu bị reject
   */
  async acquire() {
    this.stats.totalRequests++;

    // Còn slot trống -> xử lý ngay
    if (this.activeRequests < this.maxConcurrentRequests) {
      this.activeRequests++;
      this.stats.peakConcurrent = Math.max(this.stats.peakConcurrent, this.activeRequests);
      return true;
    }

    // Queue đầy -> reject
    if (this.waitingQueue.length >= this.maxQueueSize) {
      this.stats.rejectedRequests++;
      return false;
    }

    // Thêm vào queue và chờ
    this.stats.queuedRequests++;
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        // Timeout -> remove from queue và reject
        const index = this.waitingQueue.findIndex(item => item.resolve === resolve);
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
        }
        this.stats.rejectedRequests++;
        resolve(false);
      }, this.queueTimeout);

      this.waitingQueue.push({
        resolve,
        timeout,
        addedAt: Date.now()
      });
    });
  }

  /**
   * Release slot sau khi xử lý xong
   */
  release() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);

    // Xử lý request đang chờ trong queue
    if (this.waitingQueue.length > 0) {
      const next = this.waitingQueue.shift();
      clearTimeout(next.timeout);
      this.activeRequests++;
      this.stats.peakConcurrent = Math.max(this.stats.peakConcurrent, this.activeRequests);
      next.resolve(true);
    }
  }

  /**
   * Get current stats
   */
  getStats() {
    return {
      ...this.stats,
      activeRequests: this.activeRequests,
      queueLength: this.waitingQueue.length,
      availableSlots: this.maxConcurrentRequests - this.activeRequests
    };
  }

  /**
   * Check nếu server đang quá tải
   */
  isOverloaded() {
    return this.activeRequests >= this.maxConcurrentRequests && 
           this.waitingQueue.length >= this.maxQueueSize * 0.8;
  }
}

// Singleton instance
const globalForLimiter = globalThis;

// 🔧 FIX: Giảm maxConcurrentRequests để phù hợp shared hosting
// 1000 processes / ~10 processes per request = ~100 concurrent max
// Để an toàn, giới hạn 50 concurrent requests
export const requestLimiter = globalForLimiter.requestLimiter ?? new RequestLimiter({
  maxConcurrentRequests: 50,   // 🔧 Giảm từ 100 xuống 50
  maxQueueSize: 100,           // 🔧 Giảm từ 200 xuống 100
  queueTimeout: 15000          // 🔧 Giảm từ 30s xuống 15s (fail fast)
});

if (process.env.NODE_ENV !== 'production') {
  globalForLimiter.requestLimiter = requestLimiter;
}

// ============ HELPER FUNCTIONS ============

/**
 * Wrapper để giới hạn concurrent API requests
 * Usage: 
 * const result = await withRequestLimit(async () => {
 *   // your API logic
 * });
 */
export async function withRequestLimit(fn) {
  const acquired = await requestLimiter.acquire();
  
  if (!acquired) {
    throw new Error('SERVER_BUSY');
  }
  
  try {
    return await fn();
  } finally {
    requestLimiter.release();
  }
}

/**
 * Check server capacity trước khi xử lý
 */
export function checkServerCapacity() {
  const stats = requestLimiter.getStats();
  
  return {
    available: stats.availableSlots > 0 || stats.queueLength < 200,
    stats,
    message: stats.availableSlots > 0 
      ? 'OK' 
      : `Queued (${stats.queueLength} waiting)`
  };
}

export default requestLimiter;
