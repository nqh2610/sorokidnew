// 🔧 Cache user role trong memory với giới hạn kích thước
// File này được tách riêng để có thể import từ nhiều nơi
// 🔧 TỐI ƯU CHO SHARED HOST: Giảm memory footprint

const userRoleCache = new Map();
const ROLE_CACHE_TTL = 180000; // 🔧 Giảm xuống 3 phút (từ 5 phút) để data fresher
const MAX_CACHE_SIZE = 5000; // 🔧 Giảm xuống 5k entries để tiết kiệm RAM

// 🔧 Lazy cleanup - KHÔNG dùng setInterval để tránh spawn process
export function cleanupRoleCache() {
  // Chỉ cleanup khi cache đạt 40% capacity (thay vì 50%)
  if (userRoleCache.size < MAX_CACHE_SIZE * 0.4) return;
  
  const now = Date.now();
  let cleaned = 0;
  for (const [key, value] of userRoleCache.entries()) {
    if (now >= value.expiresAt) {
      userRoleCache.delete(key);
      cleaned++;
    }
    // 🔧 Cleanup nhiều hơn mỗi lần (từ 500 → 200) để giảm memory nhanh hơn
    if (cleaned >= 200) break;
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
