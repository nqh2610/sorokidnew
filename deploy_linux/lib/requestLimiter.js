/**
 * 🔒 REQUEST LIMITER v2.0 - SHARED HOST SURVIVAL MODE
 * 
 * CHIẾN LƯỢC:
 * 1. 🎯 Priority Queue - API quan trọng được ưu tiên
 * 2. 🚨 Graceful Degradation - không reject ngay, trả về thông báo thân thiện
 * 3. 📊 Heavy API Throttle - giới hạn riêng cho APIs nặng (dashboard, admin)
 * 4. 💡 User-friendly errors - thông báo dễ hiểu thay vì lỗi kỹ thuật
 * 
 * Đọc config từ /config/runtime.config.js
 */

import { API_CONFIG } from '@/config/runtime.config';

class RequestLimiter {
  constructor(options = {}) {
    // Số requests đang xử lý đồng thời
    this.activeRequests = 0;
    this.activeHeavyRequests = 0; // 🆕 Track heavy APIs riêng
    
    // Giới hạn từ runtime config
    this.maxConcurrentRequests = options.maxConcurrentRequests || API_CONFIG.requests.maxConcurrent;
    this.maxHeavyConcurrent = options.maxHeavyConcurrent || API_CONFIG.requests.maxHeavyConcurrent || 5;
    
    // Queue cho requests đang chờ - Priority based
    this.priorityQueue = []; // 🆕 High priority
    this.normalQueue = [];   // Normal requests
    this.maxQueueSize = options.maxQueueSize || API_CONFIG.requests.maxQueueSize;
    
    // Timeout cho queue từ config
    this.queueTimeout = options.queueTimeout || API_CONFIG.requests.queueTimeout;
    
    // Priority và Heavy API patterns từ config
    this.priorityAPIs = API_CONFIG.requests.priorityAPIs || [];
    this.heavyAPIs = API_CONFIG.requests.heavyAPIs || [];
    
    // Stats
    this.stats = {
      totalRequests: 0,
      rejectedRequests: 0,
      queuedRequests: 0,
      peakConcurrent: 0,
      heavyRejected: 0, // 🆕
      priorityProcessed: 0 // 🆕
    };
  }

  /**
   * 🆕 Check nếu là API được ưu tiên
   */
  isPriorityAPI(path) {
    return this.priorityAPIs.some(p => path?.startsWith(p));
  }

  /**
   * 🆕 Check nếu là API nặng
   */
  isHeavyAPI(path) {
    return this.heavyAPIs.some(p => path?.startsWith(p));
  }

  /**
   * Acquire slot để xử lý request
   * @param {string} path - API path để xác định priority
   * @returns {Promise<{allowed: boolean, reason?: string}>}
   */
  async acquire(path = '') {
    this.stats.totalRequests++;
    
    const isPriority = this.isPriorityAPI(path);
    const isHeavy = this.isHeavyAPI(path);

    // 🆕 Heavy API check riêng
    if (isHeavy) {
      if (this.activeHeavyRequests >= this.maxHeavyConcurrent) {
        this.stats.heavyRejected++;
        return {
          allowed: false,
          reason: 'HEAVY_API_BUSY',
          message: 'Hệ thống đang bận, vui lòng đợi vài giây và thử lại',
          retryAfter: 5
        };
      }
    }

    // Còn slot trống -> xử lý ngay
    if (this.activeRequests < this.maxConcurrentRequests) {
      this.activeRequests++;
      if (isHeavy) this.activeHeavyRequests++;
      if (isPriority) this.stats.priorityProcessed++;
      this.stats.peakConcurrent = Math.max(this.stats.peakConcurrent, this.activeRequests);
      return { allowed: true };
    }

    // 🆕 Priority API được vào queue ưu tiên
    const queue = isPriority ? this.priorityQueue : this.normalQueue;
    const totalQueued = this.priorityQueue.length + this.normalQueue.length;

    // Queue đầy -> reject với thông báo thân thiện
    if (totalQueued >= this.maxQueueSize) {
      this.stats.rejectedRequests++;
      return {
        allowed: false,
        reason: 'SERVER_BUSY',
        message: 'Hệ thống đang có nhiều người truy cập. Vui lòng thử lại sau ít giây.',
        retryAfter: 10
      };
    }

    // Thêm vào queue và chờ
    this.stats.queuedRequests++;
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        // Timeout -> remove from queue và reject gracefully
        this._removeFromQueue(queue, resolve);
        this.stats.rejectedRequests++;
        resolve({
          allowed: false,
          reason: 'QUEUE_TIMEOUT',
          message: 'Yêu cầu đã chờ quá lâu. Vui lòng thử lại.',
          retryAfter: 3
        });
      }, this.queueTimeout);

      queue.push({
        resolve,
        timeout,
        addedAt: Date.now(),
        isPriority,
        isHeavy,
        path
      });
    });
  }

  /**
   * 🆕 Remove item from queue safely
   */
  _removeFromQueue(queue, resolve) {
    const index = queue.findIndex(item => item.resolve === resolve);
    if (index !== -1) {
      queue.splice(index, 1);
    }
  }

  /**
   * Release slot sau khi xử lý xong
   * @param {boolean} isHeavy - Có phải heavy API không
   */
  release(isHeavy = false) {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (isHeavy) {
      this.activeHeavyRequests = Math.max(0, this.activeHeavyRequests - 1);
    }

    // 🆕 Xử lý priority queue trước
    if (this.priorityQueue.length > 0) {
      const next = this.priorityQueue.shift();
      this._processQueueItem(next);
      return;
    }

    // Rồi đến normal queue
    if (this.normalQueue.length > 0) {
      const next = this.normalQueue.shift();
      this._processQueueItem(next);
    }
  }

  /**
   * 🆕 Process queue item
   */
  _processQueueItem(item) {
    clearTimeout(item.timeout);
    this.activeRequests++;
    if (item.isHeavy) this.activeHeavyRequests++;
    if (item.isPriority) this.stats.priorityProcessed++;
    this.stats.peakConcurrent = Math.max(this.stats.peakConcurrent, this.activeRequests);
    item.resolve({ allowed: true });
  }

  /**
   * Get current stats
   */
  getStats() {
    return {
      ...this.stats,
      activeRequests: this.activeRequests,
      activeHeavyRequests: this.activeHeavyRequests,
      queueLength: this.priorityQueue.length + this.normalQueue.length,
      priorityQueueLength: this.priorityQueue.length,
      availableSlots: this.maxConcurrentRequests - this.activeRequests,
      availableHeavySlots: this.maxHeavyConcurrent - this.activeHeavyRequests
    };
  }

  /**
   * Check nếu server đang quá tải
   */
  isOverloaded() {
    const totalQueued = this.priorityQueue.length + this.normalQueue.length;
    return this.activeRequests >= this.maxConcurrentRequests && 
           totalQueued >= this.maxQueueSize * 0.8;
  }

  /**
   * 🆕 Get load level (0-100)
   */
  getLoadLevel() {
    const requestLoad = (this.activeRequests / this.maxConcurrentRequests) * 100;
    const queueLoad = ((this.priorityQueue.length + this.normalQueue.length) / this.maxQueueSize) * 100;
    return Math.round(Math.max(requestLoad, queueLoad));
  }
}

// Singleton instance
const globalForLimiter = globalThis;

// 🔧 Config cho shared hosting survival
export const requestLimiter = globalForLimiter.requestLimiter ?? new RequestLimiter({
  maxConcurrentRequests: 30,   // 🔧 Giảm xuống 30 cho ổn định
  maxHeavyConcurrent: 5,       // 🆕 Heavy APIs chỉ 5 cùng lúc
  maxQueueSize: 150,           // 🔧 Tăng queue để absorb burst
  queueTimeout: 20000          // 🔧 20s timeout
});

if (process.env.NODE_ENV !== 'production') {
  globalForLimiter.requestLimiter = requestLimiter;
}

// ============ HELPER FUNCTIONS ============

/**
 * Wrapper để giới hạn concurrent API requests
 * 🆕 Hỗ trợ path để xác định priority
 * 
 * Usage: 
 * const result = await withRequestLimit(async () => {
 *   // your API logic
 * }, '/api/lessons');
 */
export async function withRequestLimit(fn, path = '') {
  const result = await requestLimiter.acquire(path);
  const isHeavy = requestLimiter.isHeavyAPI(path);
  
  if (!result.allowed) {
    // 🆕 Return user-friendly error instead of throwing
    const error = new Error(result.message || 'Server đang bận');
    error.code = result.reason;
    error.retryAfter = result.retryAfter;
    error.userFriendly = true;
    throw error;
  }
  
  try {
    return await fn();
  } finally {
    requestLimiter.release(isHeavy);
  }
}

/**
 * Check server capacity trước khi xử lý
 */
export function checkServerCapacity() {
  const stats = requestLimiter.getStats();
  const loadLevel = requestLimiter.getLoadLevel();
  
  return {
    available: stats.availableSlots > 0 || stats.queueLength < 150,
    loadLevel,
    status: loadLevel < 50 ? 'healthy' : loadLevel < 80 ? 'busy' : 'critical',
    stats,
    message: loadLevel < 50 
      ? 'OK' 
      : loadLevel < 80
        ? `Đang bận (${stats.queueLength} đang chờ)`
        : 'Hệ thống đang quá tải'
  };
}

/**
 * 🆕 Get user-friendly error response for API
 */
export function getOverloadResponse() {
  const stats = requestLimiter.getStats();
  return {
    error: 'SERVER_BUSY',
    message: 'Hệ thống đang có nhiều người truy cập. Vui lòng đợi vài giây và thử lại.',
    retryAfter: 5,
    loadLevel: requestLimiter.getLoadLevel(),
    queuePosition: stats.queueLength
  };
}

export default requestLimiter;
