/**
 * 🛡️ ANTI-BOT & RATE LIMIT UTILITIES
 * 
 * Chống bot & spam mà KHÔNG tạo process dư thừa
 * - In-memory tracking (không dùng Redis)
 * - Lazy cleanup (không setInterval)
 * - Zero external dependencies
 * 
 * @version 1.0.0
 */

// ============ CONFIG ============
const ANTI_BOT_CONFIG = {
  // Số requests/phút tối đa trước khi nghi ngờ bot
  suspiciousThreshold: 100,
  
  // Số requests/phút tối đa trước khi block
  blockThreshold: 200,
  
  // Thời gian block (ms)
  blockDuration: 60 * 60 * 1000, // 1 giờ
  
  // Max entries trong Map
  maxEntries: 5000,
  
  // Cleanup threshold
  cleanupAge: 10 * 60 * 1000, // 10 phút
};

// ============ IN-MEMORY STORAGE ============
const requestTracker = new Map();
const blockedIPs = new Map();
let lastCleanupTime = 0;

// ============ UTILITIES ============

/**
 * Lấy client IP từ request
 */
export function getClientIP(request) {
  return (
    request.headers?.get?.('cf-connecting-ip') || // Cloudflare
    request.headers?.get?.('x-real-ip') || // Nginx
    request.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/**
 * Lazy cleanup - chỉ chạy khi cần
 */
function lazyCleanup() {
  const now = Date.now();
  if (now - lastCleanupTime < 60000) return; // Max 1 lần/phút
  if (requestTracker.size < ANTI_BOT_CONFIG.maxEntries * 0.3) return;
  
  lastCleanupTime = now;
  let cleaned = 0;
  
  // Cleanup requestTracker
  for (const [key, value] of requestTracker.entries()) {
    if (now - value.windowStart > ANTI_BOT_CONFIG.cleanupAge) {
      requestTracker.delete(key);
      cleaned++;
    }
    if (cleaned >= 200) break;
  }
  
  // Cleanup expired blocks
  for (const [ip, blockedUntil] of blockedIPs.entries()) {
    if (now > blockedUntil) {
      blockedIPs.delete(ip);
    }
  }
}

// ============ MAIN FUNCTIONS ============

/**
 * Kiểm tra IP có bị block không
 */
export function isIPBlocked(ip) {
  const blockedUntil = blockedIPs.get(ip);
  if (!blockedUntil) return false;
  
  if (Date.now() > blockedUntil) {
    blockedIPs.delete(ip);
    return false;
  }
  
  return true;
}

/**
 * Block một IP
 */
export function blockIP(ip, duration = ANTI_BOT_CONFIG.blockDuration) {
  blockedIPs.set(ip, Date.now() + duration);
}

/**
 * Kiểm tra và track request
 * Trả về: { allowed: boolean, suspicious: boolean, blocked: boolean }
 */
export function checkRequest(request) {
  const ip = getClientIP(request);
  const now = Date.now();
  
  // Lazy cleanup
  lazyCleanup();
  
  // Check nếu IP đã bị block
  if (isIPBlocked(ip)) {
    return { allowed: false, suspicious: false, blocked: true };
  }
  
  // Track request
  let record = requestTracker.get(ip);
  
  if (!record || now - record.windowStart > 60000) {
    // Window mới
    record = { count: 1, windowStart: now };
    requestTracker.set(ip, record);
  } else {
    record.count++;
  }
  
  // Check thresholds
  if (record.count > ANTI_BOT_CONFIG.blockThreshold) {
    blockIP(ip);
    return { allowed: false, suspicious: true, blocked: true };
  }
  
  if (record.count > ANTI_BOT_CONFIG.suspiciousThreshold) {
    return { allowed: true, suspicious: true, blocked: false };
  }
  
  return { allowed: true, suspicious: false, blocked: false };
}

/**
 * Honeypot field validator
 * Thêm field ẩn vào form, bot thường điền vào
 */
export function isHoneypotTriggered(formData) {
  // Các field honeypot phổ biến
  const honeypotFields = ['website', 'url', 'email2', 'phone2', 'address'];
  
  for (const field of honeypotFields) {
    if (formData[field] && formData[field].trim() !== '') {
      return true;
    }
  }
  
  return false;
}

/**
 * Time-based validation
 * Form submit quá nhanh = bot
 */
export function isSubmitTooFast(formLoadTime, minTime = 3000) {
  if (!formLoadTime) return false;
  
  const submitTime = Date.now();
  const duration = submitTime - formLoadTime;
  
  return duration < minTime;
}

/**
 * Simple bot detection dựa trên User-Agent
 */
export function isSuspiciousUserAgent(userAgent) {
  if (!userAgent) return true;
  
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
    'python', 'java', 'php', 'perl', 'ruby',
    'headless', 'phantom', 'selenium', 'puppeteer',
  ];
  
  const ua = userAgent.toLowerCase();
  
  // Cho phép các bot tốt
  const allowedBots = ['googlebot', 'bingbot', 'slurp', 'duckduckbot', 'facebookexternalhit'];
  for (const allowed of allowedBots) {
    if (ua.includes(allowed)) return false;
  }
  
  // Check bot patterns
  for (const pattern of botPatterns) {
    if (ua.includes(pattern)) return true;
  }
  
  return false;
}

/**
 * Comprehensive bot check
 */
export function checkForBot(request, options = {}) {
  const { checkUserAgent = true, minSubmitTime = 3000 } = options;
  
  const ip = getClientIP(request);
  const userAgent = request.headers?.get?.('user-agent') || '';
  
  // 1. Check IP block
  if (isIPBlocked(ip)) {
    return { isBot: true, reason: 'IP blocked' };
  }
  
  // 2. Check rate limit
  const rateCheck = checkRequest(request);
  if (!rateCheck.allowed) {
    return { isBot: true, reason: 'Rate limit exceeded' };
  }
  
  // 3. Check User-Agent
  if (checkUserAgent && isSuspiciousUserAgent(userAgent)) {
    return { isBot: true, reason: 'Suspicious user agent' };
  }
  
  // 4. Return suspicious but allowed
  if (rateCheck.suspicious) {
    return { isBot: false, suspicious: true, reason: 'High request rate' };
  }
  
  return { isBot: false, suspicious: false };
}

// ============ STATS ============
export function getAntiBotStats() {
  return {
    trackedIPs: requestTracker.size,
    blockedIPs: blockedIPs.size,
    lastCleanup: lastCleanupTime,
  };
}

export default {
  getClientIP,
  isIPBlocked,
  blockIP,
  checkRequest,
  isHoneypotTriggered,
  isSubmitTooFast,
  isSuspiciousUserAgent,
  checkForBot,
  getAntiBotStats,
};
