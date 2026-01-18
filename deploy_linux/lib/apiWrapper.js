/**
 * 🛡️ API WRAPPER - RUNTIME CONFIG DRIVEN
 * 
 * Wrapper cho API routes để:
 * 1. Limit concurrent requests (không crash khi spike)
 * 2. Timeout protection (không treo process)
 * 3. Graceful error handling
 * 4. Circuit breaker integration
 * 
 * Đọc config từ /config/runtime.config.js
 */

import { NextResponse } from 'next/server';
import { requestLimiter } from './requestLimiter';
import { dbCircuitBreaker } from './circuitBreaker';
import { API_CONFIG } from '@/config/runtime.config';

/**
 * Default timeout từ runtime config
 */
const DEFAULT_TIMEOUT = API_CONFIG.timeouts.default;

/**
 * Wrap API handler với protection
 * 
 * Usage:
 * export const GET = withApiProtection(async (request) => {
 *   // your logic
 *   return NextResponse.json({ data });
 * });
 */
export function withApiProtection(handler, options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT,
    requireAuth = false,
    skipLimiter = false,
    useCircuitBreaker = true,
  } = options;

  return async (request, context) => {
    let acquired = false;
    
    try {
      // 0. Check circuit breaker first
      if (useCircuitBreaker) {
        const cbCheck = dbCircuitBreaker.canRequest();
        if (!cbCheck.allowed) {
          return NextResponse.json(
            { 
              error: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
              code: 'CIRCUIT_OPEN',
              retryAfter: cbCheck.retryAfter || 30
            },
            { 
              status: 503,
              headers: {
                'Retry-After': String(cbCheck.retryAfter || 30),
                'Cache-Control': 'no-store'
              }
            }
          );
        }
      }

      // 1. Check capacity - KHÔNG REJECT ngay, cho phép overflow nhẹ
      if (!skipLimiter) {
        const acquireResult = await requestLimiter.acquire();
        acquired = acquireResult?.allowed !== false;
        
        // Chỉ log warning khi busy, không reject
        if (acquireResult?.reason === 'SERVER_BUSY') {
          console.warn('[API] Server busy, but allowing request');
          acquired = true;
        }
      }

      // 2. Execute with timeout
      const result = await Promise.race([
        handler(request, context),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), timeout)
        )
      ]);

      // Record success for circuit breaker
      if (useCircuitBreaker) {
        dbCircuitBreaker.recordSuccess();
      }

      return result;

    } catch (error) {
      // 3. Graceful error handling
      console.error('API Error:', error.message);
      
      // Record error for circuit breaker
      if (useCircuitBreaker) {
        dbCircuitBreaker.recordError(error);
      }
      
      if (error.message === 'TIMEOUT') {
        return NextResponse.json(
          { error: 'Request timeout. Vui lòng thử lại.', code: 'TIMEOUT' },
          { status: 504 }
        );
      }

      // Generic error - không expose details
      return NextResponse.json(
        { error: 'Có lỗi xảy ra. Vui lòng thử lại.', code: 'ERROR' },
        { status: 500 }
      );

    } finally {
      // 4. Always release slot
      if (acquired && !skipLimiter) {
        requestLimiter.release();
      }
    }
  };
}

/**
 * Lightweight wrapper chỉ có timeout (cho APIs nhẹ)
 */
export function withTimeout(handler, timeoutMs = DEFAULT_TIMEOUT) {
  return async (request, context) => {
    try {
      return await Promise.race([
        handler(request, context),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
        )
      ]);
    } catch (error) {
      if (error.message === 'TIMEOUT') {
        return NextResponse.json(
          { error: 'Request timeout', code: 'TIMEOUT' },
          { status: 504 }
        );
      }
      throw error;
    }
  };
}

/**
 * Check if server is healthy enough for heavy operations
 */
export function canHandleHeavyRequest() {
  const stats = requestLimiter.getStats();
  // Chỉ cho phép heavy request nếu < 70% capacity
  return stats.activeRequests < 35; // 70% of 50
}

const apiWrapperExports = {
  withApiProtection,
  withTimeout,
  canHandleHeavyRequest
};

export default apiWrapperExports;
