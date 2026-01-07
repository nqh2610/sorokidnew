/**
 * 🔧 JEST SETUP FILE
 * 
 * Cấu hình môi trường test trước khi chạy
 */

// Load environment variables
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for slow tests
jest.setTimeout(30000);

// Mock console.error để bắt errors
const originalError = console.error;
console.error = (...args) => {
  // Log errors but don't fail test
  originalError.apply(console, args);
};

// Global test utilities
global.testUtils = {
  // Generate random test data
  randomEmail: () => `test_${Date.now()}@test.sorokid.com`,
  randomUsername: () => `testuser_${Date.now()}`,
  
  // Wait helper
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // API call helper
  apiCall: async (url, options = {}) => {
    const fetch = require('cross-fetch');
    const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  },
};

// Cleanup after all tests
afterAll(async () => {
  // Close any open connections
  await new Promise(resolve => setTimeout(resolve, 500));
});
