/**
 * 🧪 JEST CONFIG FOR SOROKID API TESTING
 * 
 * Cấu hình Jest cho API testing và unit testing
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/api/**/*.test.js',
    '**/tests/unit/**/*.test.js',
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'app/api/**/*.js',
    'lib/**/*.js',
    '!**/node_modules/**',
  ],
  
  // Coverage output
  coverageDirectory: 'test-results/coverage',
  
  // Timeout cho async tests
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Force exit sau khi tests hoàn thành
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Max workers
  maxWorkers: 1, // Sequential để tránh conflict DB
  
  // Reporters
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-results/jest-report',
      filename: 'report.html',
      openReport: false,
    }]
  ],
  
  // Global variables
  globals: {
    TEST_BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  },
};
