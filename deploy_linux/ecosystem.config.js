const path = require('path');

/**
 * 🚀 PM2 CONFIG TỐI ƯU CHO SHARED HOSTING
 * 
 * ⚠️ GIỚI HẠN: 1000 PROCESSES / 3GB RAM
 * 
 * Phân tích process usage:
 * - Node.js app: 1 main process
 * - libuv threads: 2 threads (UV_THREADPOOL_SIZE=2)
 * - Prisma: 5 DB connections (từ runtime config)
 * - System: ~200 processes đã dùng
 * - Còn lại: ~790 processes cho app
 * 
 * Với 1 PM2 instance + giới hạn concurrent requests:
 * -> An toàn xử lý ~50 concurrent users (shared host limit)
 */

// Cross-platform: Detect OS and set appropriate paths
const isWindows = process.platform === 'win32';
const defaultCwd = isWindows 
  ? process.cwd() 
  : process.env.APP_PATH || '/var/www/sorokid';

module.exports = {
  apps: [
    {
      name: 'sorokid',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: defaultCwd,
      
      // 🔧 TỐI ƯU CHO SHARED HOSTING - 1000 PROCESSES LIMIT
      instances: 1,           // CHỈ 1 INSTANCE - quan trọng!
      exec_mode: 'fork',      // Fork mode, không cluster
      
      // Environment - GIỚI HẠN RESOURCES
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        RUNTIME_ENV: 'shared', // Kích hoạt shared host config
        // Giới hạn Node.js memory và threads
        NODE_OPTIONS: '--max-old-space-size=384 --optimize-for-size',
        // 🔧 QUAN TRỌNG: Giới hạn UV threadpool
        UV_THREADPOOL_SIZE: '2',
        // Disable source maps trong production
        NODE_NO_WARNINGS: '1'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        RUNTIME_ENV: 'shared',
        NODE_OPTIONS: '--max-old-space-size=384 --optimize-for-size',
        UV_THREADPOOL_SIZE: '2',
        NODE_NO_WARNINGS: '1'
      },
      
      // 🔧 MEMORY MANAGEMENT - Giảm xuống 400M để tránh process spike
      max_memory_restart: '400M',
      
      // Logs - Giới hạn size
      error_file: path.join(defaultCwd, 'logs', 'error.log'),
      out_file: path.join(defaultCwd, 'logs', 'out.log'),
      log_file: path.join(defaultCwd, 'logs', 'combined.log'),
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      
      // 🔧 RESTART STRATEGY - Tránh restart loops
      watch: false,
      autorestart: true,
      max_restarts: 3,        // Giảm từ 5 xuống 3
      min_uptime: '60s',      // Tăng lên 60s để ổn định
      restart_delay: 10000,   // Tăng delay lên 10s
      
      // 🔧 Graceful shutdown - QUAN TRỌNG để release processes
      kill_timeout: 15000,    // 15s để cleanup DB connections
      wait_ready: true,
      listen_timeout: 15000,
      
      // 🔧 CRON RESTART - Restart hàng ngày lúc 4h sáng
      // Giúp giải phóng memory leaks và orphan processes
      cron_restart: '0 4 * * *',
      
      // Exp backoff restart - tránh restart quá nhanh
      exp_backoff_restart_delay: 2000
    }
  ]
};
