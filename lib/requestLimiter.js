/**
 * 🔒 PROCESS & CONNECTION LIMITER CHO SHARED HOSTING
 * 
 * Giới hạn 1000 processes trên shared hosting
 * Cần kiểm soát:
 * - Concurrent requests đang xử lý
 * - Database connections
 * - Memory usage
 * 
 * Giải pháp: Queue-based request handling
 */

class RequestLimiter {
  constructor(options = {}) {
    // Số requests đang xử lý đồng thời
    this.activeRequests = 0;
    
    // Giới hạn concurrent requests (mỗi request = ~2-5 processes với Node.js + DB)
    // 1000 processes / 5 = ~200 concurrent requests tối đa
    // Để an toàn, giới hạn 100 concurrent requests
    this.maxConcurrentRequests = options.maxConcurrentRequests || 100;
    
    // Queue cho requests đang chờ
    this.waitingQueue = [];
    this.maxQueueSize = options.maxQueueSize || 200;
    
    // Timeout cho queue (30 giây)
    this.queueTimeout = options.queueTimeout || 30000;
    
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

export const requestLimiter = globalForLimiter.requestLimiter ?? new RequestLimiter({
  maxConcurrentRequests: 100,  // 100 concurrent requests
  maxQueueSize: 200,           // Queue 200 thêm
  queueTimeout: 30000          // 30s timeout
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
