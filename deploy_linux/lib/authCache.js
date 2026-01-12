// 🔧 Cache user role trong memory với giới hạn kích thước
// File này được tách riêng để có thể import từ nhiều nơi
// 🔧 TỐI ƯU CHO SHARED HOST: Giảm memory footprint

const userRoleCache = new Map();
const ROLE_CACHE_TTL = 300000; // 🔧 5 phút - tăng lên để giảm DB queries
const MAX_CACHE_SIZE = 3000; // 🔧 Giảm xuống 3k entries để tiết kiệm RAM
let lastCleanupTime = 0;
const CLEANUP_INTERVAL = 60000; // Cleanup tối đa 1 lần/phút

// 🔧 Lazy cleanup - KHÔNG dùng setInterval để tránh spawn process
export function cleanupRoleCache() {
  const now = Date.now();
  // Chỉ cleanup 1 lần/phút và khi cache đạt 30% capacity
  if (now - lastCleanupTime < CLEANUP_INTERVAL) return;
  if (userRoleCache.size < MAX_CACHE_SIZE * 0.3) return;
  
  lastCleanupTime = now;
  let cleaned = 0;
  for (const [key, value] of userRoleCache.entries()) {
    if (now >= value.expiresAt) {
      userRoleCache.delete(key);
      cleaned++;
    }
    // 🔧 Cleanup tối đa 100 entries mỗi lần để giảm CPU
    if (cleaned >= 100) break;
  }
}

// Lấy cache
export function getCachedUser(email) {
  const cached = userRoleCache.get(email);
  if (cached && Date.now() < cached.expiresAt) {
    return cached;
  }
  return null;
}

// Set cache
export function setCachedUser(email, data) {
  userRoleCache.set(email, {
    ...data,
    expiresAt: Date.now() + ROLE_CACHE_TTL
  });
}

// 🔧 Xóa cache khi user update profile
export function invalidateUserCache(email) {
  if (email) {
    userRoleCache.delete(email);
  }
}

export { userRoleCache, ROLE_CACHE_TTL, MAX_CACHE_SIZE };
