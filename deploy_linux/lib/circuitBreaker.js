/**
 * 🚨 CIRCUIT BREAKER - RUNTIME CONFIG DRIVEN
 * 
 * Tự động "ngắt mạch" khi phát hiện hệ thống quá tải.
 * Cho phép hệ thống hồi phục thay vì crash hoàn toàn.
 * 
 * Đọc config từ /config/runtime.config.js
 */

import { API_CONFIG, LOGGING_CONFIG } from '@/config/runtime.config';

class CircuitBreaker {
  constructor(options = {}) {
    // Thresholds từ runtime config
    this.errorThreshold = options.errorThreshold || API_CONFIG.circuitBreaker.errorThreshold;
    this.successThreshold = options.successThreshold || API_CONFIG.circuitBreaker.successThreshold;
    this.timeout = options.timeout || API_CONFIG.circuitBreaker.timeout;
    
    // State
    this.state = 'CLOSED';
    this.errorCount = 0;
    this.successCount = 0;
    this.lastError = null;
    this.openedAt = null;
    
    // Stats
    this.stats = {
      totalRequests: 0,
      rejectedRequests: 0,
      stateChanges: []
    };
  }

  /**
   * Check if request should be allowed
   * @returns {{ allowed: boolean, reason?: string }}
   */
  canRequest() {
    this.stats.totalRequests++;
    
    switch (this.state) {
      case 'CLOSED':
        return { allowed: true };
      
      case 'OPEN':
        // Check if timeout passed
        if (Date.now() - this.openedAt > this.timeout) {
          this._transitionTo('HALF_OPEN');
          return { allowed: true }; // Cho phép 1 request thử
        }
        this.stats.rejectedRequests++;
        return { 
          allowed: false, 
          reason: 'Circuit breaker OPEN. Hệ thống đang hồi phục.',
          retryAfter: Math.ceil((this.timeout - (Date.now() - this.openedAt)) / 1000)
        };
      
      case 'HALF_OPEN':
        // Chỉ cho phép 1 request tại một thời điểm trong HALF_OPEN
        return { allowed: true };
      
      default:
        return { allowed: true };
    }
  }

  /**
   * Record successful request
   */
  recordSuccess() {
    this.errorCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this._transitionTo('CLOSED');
      }
    }
  }

  /**
   * Record failed request
   */
  recordError(error) {
    this.lastError = error;
    this.successCount = 0;
    this.errorCount++;
    
    if (this.state === 'CLOSED' && this.errorCount >= this.errorThreshold) {
      this._transitionTo('OPEN');
    } else if (this.state === 'HALF_OPEN') {
      this._transitionTo('OPEN');
    }
  }

  /**
   * Transition to new state
   */
  _transitionTo(newState) {
    const oldState = this.state;
    this.state = newState;
    
    this.stats.stateChanges.push({
      from: oldState,
      to: newState,
      at: new Date().toISOString()
    });
    
    // Keep only last 10 state changes
    if (this.stats.stateChanges.length > 10) {
      this.stats.stateChanges.shift();
    }
    
    if (newState === 'OPEN') {
      this.openedAt = Date.now();
      this.successCount = 0;
      console.warn(`[CircuitBreaker] OPENED due to ${this.errorCount} errors`);
    } else if (newState === 'CLOSED') {
      this.errorCount = 0;
      this.openedAt = null;
      console.log('[CircuitBreaker] CLOSED - System recovered');
    } else if (newState === 'HALF_OPEN') {
      console.log('[CircuitBreaker] HALF_OPEN - Testing recovery');
    }
  }

  /**
   * Get current stats
   */
  getStats() {
    return {
      state: this.state,
      errorCount: this.errorCount,
      successCount: this.successCount,
      lastError: this.lastError?.message,
      openedAt: this.openedAt,
      ...this.stats
    };
  }

  /**
   * Force close (for admin recovery)
   */
  forceClose() {
    this._transitionTo('CLOSED');
  }
}

// Singleton instances for different services
const globalForCircuitBreaker = globalThis;

// Database circuit breaker - config từ runtime
export const dbCircuitBreaker = globalForCircuitBreaker.dbCircuitBreaker ?? new CircuitBreaker();

// External API circuit breaker
export const apiCircuitBreaker = globalForCircuitBreaker.apiCircuitBreaker ?? new CircuitBreaker();

if (process.env.NODE_ENV !== 'production') {
  globalForCircuitBreaker.dbCircuitBreaker = dbCircuitBreaker;
  globalForCircuitBreaker.apiCircuitBreaker = apiCircuitBreaker;
}

/**
 * Wrapper cho database operations với circuit breaker
 */
export async function withDbCircuitBreaker(operation) {
  const check = dbCircuitBreaker.canRequest();
  
  if (!check.allowed) {
    throw new Error(`DB_CIRCUIT_OPEN: ${check.reason}`);
  }
  
  try {
    const result = await operation();
    dbCircuitBreaker.recordSuccess();
    return result;
  } catch (error) {
    dbCircuitBreaker.recordError(error);
    throw error;
  }
}

const circuitBreakerExports = {
  dbCircuitBreaker,
  apiCircuitBreaker,
  withDbCircuitBreaker
};

export default circuitBreakerExports;
