/**
 * 🔧 TEST UTILITIES
 * 
 * Các helper functions dùng chung cho tất cả tests
 */

/**
 * 📋 DANH SÁCH TẤT CẢ ROUTES CẦN TEST
 */
const ALL_ROUTES = {
  // Public routes (không cần auth)
  public: [
    { path: '/', name: 'Home Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/register', name: 'Register Page' },
    { path: '/pricing', name: 'Pricing Page' },
  ],
  
  // Protected routes (cần login)
  protected: [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/learn', name: 'Learn Page' },
    { path: '/practice', name: 'Practice Page' },
    { path: '/compete', name: 'Compete Page' },
    { path: '/leaderboard', name: 'Leaderboard' },
    { path: '/profile', name: 'Profile Page' },
    { path: '/edit-profile', name: 'Edit Profile' },
    { path: '/certificate', name: 'Certificate Page' },
  ],
  
  // Admin routes
  admin: [
    { path: '/admin', name: 'Admin Dashboard' },
    { path: '/admin/users', name: 'Admin Users' },
    { path: '/admin/lessons', name: 'Admin Lessons' },
    { path: '/admin/quests', name: 'Admin Quests' },
    { path: '/admin/achievements', name: 'Admin Achievements' },
    { path: '/admin/transactions', name: 'Admin Transactions' },
    { path: '/admin/pricing', name: 'Admin Pricing' },
    { path: '/admin/payment-settings', name: 'Admin Payment Settings' },
  ],
};

/**
 * 📋 DANH SÁCH TẤT CẢ API ENDPOINTS
 */
const ALL_API_ENDPOINTS = {
  // Auth APIs
  auth: [
    { path: '/api/auth/providers', method: 'GET', auth: false },
    { path: '/api/auth/session', method: 'GET', auth: false },
    { path: '/api/auth/csrf', method: 'GET', auth: false },
  ],
  
  // User APIs
  user: [
    { path: '/api/user/profile', method: 'GET', auth: true },
    { path: '/api/user/profile', method: 'PUT', auth: true, body: {} },
    { path: '/api/user/tier', method: 'GET', auth: true },
    { path: '/api/user/change-password', method: 'POST', auth: true, body: { currentPassword: '', newPassword: '' } },
    { path: '/api/users/register', method: 'POST', auth: false, body: { email: '', username: '', password: '', name: '' } },
    { path: '/api/users/profile', method: 'GET', auth: true },
  ],
  
  // Learning APIs
  learning: [
    { path: '/api/levels', method: 'GET', auth: true },
    { path: '/api/lessons/1', method: 'GET', auth: true },
    { path: '/api/exercises', method: 'GET', auth: true },
    { path: '/api/exercises', method: 'POST', auth: true, body: {} },
    { path: '/api/progress', method: 'GET', auth: true },
    { path: '/api/progress', method: 'POST', auth: true, body: {} },
  ],
  
  // Gamification APIs
  gamification: [
    { path: '/api/achievements', method: 'GET', auth: true },
    { path: '/api/quests', method: 'GET', auth: true },
    { path: '/api/rewards/claim', method: 'POST', auth: true, body: {} },
    { path: '/api/shop', method: 'GET', auth: true },
    { path: '/api/tier', method: 'GET', auth: true },
    { path: '/api/leaderboard', method: 'GET', auth: true },
  ],
  
  // Competition APIs
  compete: [
    { path: '/api/compete', method: 'GET', auth: true },
    { path: '/api/compete', method: 'POST', auth: true, body: {} },
  ],
  
  // Certificate APIs
  certificate: [
    { path: '/api/certificate', method: 'GET', auth: true },
    { path: '/api/certificate', method: 'POST', auth: true, body: {} },
  ],
  
  // Payment APIs
  payment: [
    { path: '/api/pricing', method: 'GET', auth: false },
    { path: '/api/payment', method: 'GET', auth: true },
    { path: '/api/payment', method: 'POST', auth: true, body: {} },
  ],
  
  // Dashboard APIs
  dashboard: [
    { path: '/api/dashboard', method: 'GET', auth: true },
    { path: '/api/health', method: 'GET', auth: false },
  ],
  
  // Admin APIs
  admin: [
    { path: '/api/admin/stats', method: 'GET', auth: true, admin: true },
    { path: '/api/admin/users', method: 'GET', auth: true, admin: true },
    { path: '/api/admin/lessons', method: 'GET', auth: true, admin: true },
    { path: '/api/admin/quests', method: 'GET', auth: true, admin: true },
    { path: '/api/admin/achievements', method: 'GET', auth: true, admin: true },
    { path: '/api/admin/transactions', method: 'GET', auth: true, admin: true },
    { path: '/api/admin/pricing', method: 'GET', auth: true, admin: true },
    { path: '/api/admin/payment-settings', method: 'GET', auth: true, admin: true },
    { path: '/api/admin/levels', method: 'GET', auth: true, admin: true },
  ],
};

/**
 * 🔒 SECURITY TEST PAYLOADS
 */
const SECURITY_PAYLOADS = {
  xss: [
    '<script>alert("xss")</script>',
    '"><img src=x onerror=alert(1)>',
    "javascript:alert('XSS')",
    '<svg onload=alert(1)>',
    '{{constructor.constructor("alert(1)")()}}',
  ],
  
  sqlInjection: [
    "' OR '1'='1",
    "'; DROP TABLE users;--",
    "1' AND '1'='1",
    "admin'--",
    "1; DELETE FROM users",
  ],
  
  pathTraversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '....//....//....//etc/passwd',
  ],
};

/**
 * 🎯 TEST DATA GENERATORS
 */
const TestData = {
  // Generate valid user data
  validUser: () => ({
    email: `test_${Date.now()}@test.sorokid.com`,
    username: `user_${Date.now()}`,
    password: 'Test123456',
    name: 'Test User',
  }),
  
  // Generate invalid email formats
  invalidEmails: [
    'notanemail',
    'missing@domain',
    '@nodomain.com',
    'spaces in@email.com',
    '',
  ],
  
  // Generate invalid passwords
  invalidPasswords: [
    '123',      // Too short
    '',         // Empty
  ],
  
  // Generate invalid usernames
  invalidUsernames: [
    'ab',                       // Too short
    'has space',                // Has space
    'special@char',             // Special char
    '',                         // Empty
  ],
};

/**
 * 🕐 PERFORMANCE THRESHOLDS
 */
const PERFORMANCE_THRESHOLDS = {
  pageLoad: 3000,           // 3 seconds max for page load
  apiResponse: 2000,        // 2 seconds max for API
  apiResponseFast: 500,     // 500ms for fast APIs
  firstContentfulPaint: 1800, // 1.8s FCP
  largestContentfulPaint: 2500, // 2.5s LCP
};

/**
 * 📊 TEST RESULT STRUCTURE
 */
class TestResult {
  constructor() {
    this.passed = [];
    this.failed = [];
    this.skipped = [];
    this.errors = [];
    this.startTime = Date.now();
  }
  
  addPass(testName, details = {}) {
    this.passed.push({ testName, details, timestamp: Date.now() });
  }
  
  addFail(testName, error, details = {}) {
    this.failed.push({ testName, error, details, timestamp: Date.now() });
  }
  
  addSkip(testName, reason) {
    this.skipped.push({ testName, reason, timestamp: Date.now() });
  }
  
  addError(testName, error) {
    this.errors.push({ testName, error: error.message, stack: error.stack, timestamp: Date.now() });
  }
  
  getSummary() {
    const duration = Date.now() - this.startTime;
    return {
      total: this.passed.length + this.failed.length + this.skipped.length,
      passed: this.passed.length,
      failed: this.failed.length,
      skipped: this.skipped.length,
      errors: this.errors.length,
      duration,
      passRate: ((this.passed.length / (this.passed.length + this.failed.length)) * 100).toFixed(2) + '%',
    };
  }
  
  toJSON() {
    return {
      summary: this.getSummary(),
      passed: this.passed,
      failed: this.failed,
      skipped: this.skipped,
      errors: this.errors,
    };
  }
}

module.exports = {
  ALL_ROUTES,
  ALL_API_ENDPOINTS,
  SECURITY_PAYLOADS,
  TestData,
  PERFORMANCE_THRESHOLDS,
  TestResult,
};
