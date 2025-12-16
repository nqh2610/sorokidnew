/**
 * 🚨 GRACEFUL DEGRADATION SYSTEM - SHARED HOST SURVIVAL
 * 
 * Khi hệ thống quá tải, thay vì crash hoặc trả lỗi:
 * 1. 📦 Trả về cached data (dù cũ)
 * 2. 📊 Trả về partial/simplified data
 * 3. 💬 Thông báo user-friendly
 * 4. ⏱️ Tự động recovery khi load giảm
 * 
 * NGUYÊN TẮC: User experience > Data freshness
 */

import { cache } from './cache';
import { requestLimiter } from './requestLimiter';
import { CACHE_CONFIG, API_CONFIG } from '@/config/runtime.config';

// ============ SYSTEM STATE ============
const systemState = {
  mode: 'normal', // 'normal' | 'degraded' | 'emergency'
  lastModeChange: Date.now(),
  degradedAPIs: new Set(),
  recoveryAttempts: 0,
};

// ============ THRESHOLDS ============
const THRESHOLDS = {
  // Load level để trigger degradation
  degradedMode: 70,
  emergencyMode: 90,
  
  // Thời gian tối thiểu giữa mode changes (tránh flip-flop)
  modeCooldown: 30000, // 30s
  
  // Max recovery attempts trước khi stay in degraded
  maxRecoveryAttempts: 3,
};

/**
 * 🔍 Check và update system mode dựa trên load
 */
export function updateSystemMode() {
  const loadLevel = requestLimiter.getLoadLevel();
  const now = Date.now();
  
  // Cooldown để tránh flip-flop
  if (now - systemState.lastModeChange < THRESHOLDS.modeCooldown) {
    return systemState.mode;
  }
  
  const previousMode = systemState.mode;
  
  if (loadLevel >= THRESHOLDS.emergencyMode) {
    systemState.mode = 'emergency';
  } else if (loadLevel >= THRESHOLDS.degradedMode) {
    systemState.mode = 'degraded';
  } else if (systemState.mode !== 'normal') {
    // Chỉ recovery nếu load thực sự giảm
    systemState.recoveryAttempts++;
    if (systemState.recoveryAttempts >= THRESHOLDS.maxRecoveryAttempts) {
      systemState.mode = 'normal';
      systemState.recoveryAttempts = 0;
    }
  }
  
  if (previousMode !== systemState.mode) {
    systemState.lastModeChange = now;
    console.log(`[GracefulDegradation] Mode changed: ${previousMode} -> ${systemState.mode} (load: ${loadLevel}%)`);
  }
  
  return systemState.mode;
}

/**
 * 🎯 Get current system mode
 */
export function getSystemMode() {
  return systemState.mode;
}

/**
 * 📦 STALE CACHE FALLBACK
 * Trả về cached data dù đã expired (trong emergency)
 */
export function getStaleCacheData(cacheKey, maxStaleAge = 300000) {
  const entry = cache.cache?.get(cacheKey);
  if (!entry) return null;
  
  const age = Date.now() - entry.createdAt;
  if (age > maxStaleAge) return null;
  
  return {
    data: entry.value,
    stale: Date.now() > entry.expiresAt,
    age: Math.round(age / 1000), // seconds
    message: 'Dữ liệu có thể chưa được cập nhật mới nhất'
  };
}

/**
 * 🔄 WRAPPER cho API với graceful degradation
 * 
 * Usage:
 * export const GET = withGracefulDegradation(
 *   async (request) => { ... }, // main handler
 *   {
 *     cacheKey: (req) => `key_${userId}`,
 *     fallbackData: { items: [] },
 *     degradedHandler: async (req) => simplifiedQuery(),
 *   }
 * );
 */
export function withGracefulDegradation(handler, options = {}) {
  const {
    cacheKey,           // Function to get cache key from request
    fallbackData,       // Static fallback data
    degradedHandler,    // Simplified handler for degraded mode
    maxStaleAge = 300000, // 5 minutes stale OK
  } = options;

  return async function gracefulHandler(request, context) {
    updateSystemMode();
    const mode = systemState.mode;

    // 🟢 NORMAL MODE: chạy bình thường
    if (mode === 'normal') {
      return handler(request, context);
    }

    // 🟡 DEGRADED MODE: thử cached/simplified trước
    if (mode === 'degraded') {
      // Thử cache trước
      if (cacheKey) {
        const key = typeof cacheKey === 'function' ? cacheKey(request) : cacheKey;
        const staleData = getStaleCacheData(key, maxStaleAge);
        if (staleData) {
          return createGracefulResponse(staleData.data, {
            _degraded: true,
            _stale: staleData.stale,
            _cacheAge: staleData.age,
            _message: staleData.message
          });
        }
      }

      // Thử degraded handler
      if (degradedHandler) {
        try {
          const result = await degradedHandler(request, context);
          return createGracefulResponse(result, {
            _degraded: true,
            _simplified: true
          });
        } catch (e) {
          console.warn('[GracefulDegradation] Degraded handler failed:', e.message);
        }
      }

      // Fallback cuối cùng: thử handler chính
      try {
        return handler(request, context);
      } catch (e) {
        if (fallbackData) {
          return createGracefulResponse(fallbackData, {
            _degraded: true,
            _fallback: true,
            _message: 'Hệ thống đang bận, hiển thị dữ liệu tạm thời'
          });
        }
        throw e;
      }
    }

    // 🔴 EMERGENCY MODE: ưu tiên cache/fallback, không query DB
    if (mode === 'emergency') {
      // Cache first
      if (cacheKey) {
        const key = typeof cacheKey === 'function' ? cacheKey(request) : cacheKey;
        const staleData = getStaleCacheData(key, maxStaleAge * 2); // Cho phép stale lâu hơn
        if (staleData) {
          return createGracefulResponse(staleData.data, {
            _emergency: true,
            _stale: true,
            _cacheAge: staleData.age,
            _message: 'Hệ thống đang quá tải. Dữ liệu có thể không mới nhất.'
          });
        }
      }

      // Fallback data
      if (fallbackData) {
        return createGracefulResponse(fallbackData, {
          _emergency: true,
          _fallback: true,
          _message: 'Hệ thống đang quá tải. Vui lòng thử lại sau.'
        });
      }

      // Không có gì -> reject với thông báo thân thiện
      return createOverloadResponse();
    }

    return handler(request, context);
  };
}

/**
 * 🆕 Create graceful response with metadata
 */
function createGracefulResponse(data, meta = {}) {
  const { NextResponse } = require('next/server');
  
  return NextResponse.json({
    success: true,
    ...data,
    ...meta
  });
}

/**
 * 🆕 Create overload response
 */
function createOverloadResponse() {
  const { NextResponse } = require('next/server');
  
  return NextResponse.json({
    success: false,
    error: 'SYSTEM_OVERLOAD',
    message: 'Hệ thống đang có quá nhiều người truy cập. Vui lòng đợi 30 giây và thử lại.',
    retryAfter: 30
  }, { 
    status: 503,
    headers: {
      'Retry-After': '30'
    }
  });
}

/**
 * 📊 Simplified data generators cho common APIs
 */
export const simplifiedResponses = {
  // Dashboard - trả về minimal data
  dashboard: (user) => ({
    success: true,
    user: {
      id: user?.id,
      name: user?.name || 'User',
      totalStars: user?.totalStars || 0,
      level: user?.level || 1,
      diamonds: user?.diamonds || 0,
      streak: user?.streak || 0,
    },
    progress: { totalLessons: 0, completedLessons: 0, overallProgress: 0 },
    exercise: { total: 0, correct: 0, accuracy: 0 },
    compete: { totalArenas: 0, totalMatches: 0 },
    quests: { daily: [], weekly: [] },
    achievements: { total: 0, unlocked: 0 },
    _simplified: true,
    _message: 'Đang tải dữ liệu chi tiết...'
  }),

  // Leaderboard - trả về cached hoặc empty
  leaderboard: () => ({
    leaderboard: [],
    _message: 'Bảng xếp hạng đang được cập nhật'
  }),

  // Lessons - trả về structure cơ bản
  lessons: () => ({
    levels: [],
    lessons: [],
    _message: 'Đang tải bài học...'
  }),
};

/**
 * 📈 Get degradation stats
 */
export function getDegradationStats() {
  return {
    mode: systemState.mode,
    lastModeChange: systemState.lastModeChange,
    timeSinceChange: Date.now() - systemState.lastModeChange,
    recoveryAttempts: systemState.recoveryAttempts,
    loadLevel: requestLimiter.getLoadLevel(),
    degradedAPIs: Array.from(systemState.degradedAPIs),
  };
}

export default {
  updateSystemMode,
  getSystemMode,
  getStaleCacheData,
  withGracefulDegradation,
  simplifiedResponses,
  getDegradationStats,
};
