// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * 🎭 PLAYWRIGHT CONFIG FOR SOROKID AUTO TESTING
 * 
 * Cấu hình E2E testing cho toàn bộ website
 * Test trên Chromium (có thể mở rộng Firefox, Safari)
 */

module.exports = defineConfig({
  // Thư mục chứa test files
  testDir: './tests/e2e',
  
  // Timeout cho mỗi test
  timeout: 30 * 1000,
  
  // Timeout cho expect assertions
  expect: {
    timeout: 5000
  },
  
  // Chạy tests song song
  fullyParallel: true,
  
  // Không retry trên CI để thấy lỗi thật
  retries: process.env.CI ? 2 : 0,
  
  // Số workers song song
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter - output kết quả test
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  // Cấu hình chung cho tất cả tests
  use: {
    // Base URL - sẽ được override bởi env
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    
    // Chụp screenshot khi test fail
    screenshot: 'only-on-failure',
    
    // Quay video khi test fail
    video: 'retain-on-failure',
    
    // Trace để debug
    trace: 'retain-on-failure',
    
    // Viewport mặc định
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors cho localhost
    ignoreHTTPSErrors: true,
  },

  // Cấu hình projects cho các loại test khác nhau
  projects: [
    // Setup project - chạy trước để login và lưu state
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
    },
    
    // Test Guest (không cần login)
    {
      name: 'guest',
      use: { 
        ...devices['Desktop Chrome'],
      },
      testMatch: /guest.*\.spec\.js/,
    },
    
    // Test User đã login
    {
      name: 'user',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'test-results/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /user.*\.spec\.js/,
    },
    
    // Test Admin
    {
      name: 'admin',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'test-results/.auth/admin.json',
      },
      dependencies: ['setup'],
      testMatch: /admin.*\.spec\.js/,
    },
    
    // Test Mobile
    {
      name: 'mobile',
      use: { 
        ...devices['iPhone 13'],
      },
      testMatch: /mobile.*\.spec\.js/,
    },
    
    // Test tất cả routes
    {
      name: 'routes',
      use: { 
        ...devices['Desktop Chrome'],
      },
      testMatch: /routes.*\.spec\.js/,
    },
  ],

  // Web server - tự động start dev server nếu cần
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  
  // Output folder cho screenshots, videos, traces
  outputDir: 'test-results/artifacts',
});
