const path = require('path');

/**
 * 🚀 PM2 CONFIG TỐI ƯU CHO SHARED HOSTING
 * 
 * ⚠️ GIỚI HẠN: 1000 PROCESSES / 3GB RAM
 * 
 * Phân tích:
 * - Node.js app: 1 main process + libuv threads (~4-8 processes)
 * - Prisma: Connection pool (~5 processes cho DB connections)
 * - System: ~200 processes đã dùng
 * - Còn lại: ~780 processes cho app
 * 
 * Với 1 PM2 instance, mỗi request tạo ~2-3 async operations
 * -> An toàn xử lý ~200-300 concurrent users
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
        // Giới hạn Node.js memory và threads
        NODE_OPTIONS: '--max-old-space-size=512',
        // Giới hạn UV threadpool (default=4, giảm xuống 2)
        UV_THREADPOOL_SIZE: '2'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NODE_OPTIONS: '--max-old-space-size=512',
        UV_THREADPOOL_SIZE: '2'
      },
      
      // 🔧 MEMORY MANAGEMENT
      max_memory_restart: '500M',
      
      // Logs
      error_file: path.join(defaultCwd, 'logs', 'error.log'),
      out_file: path.join(defaultCwd, 'logs', 'out.log'),
      log_file: path.join(defaultCwd, 'logs', 'combined.log'),
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      
      // 🔧 RESTART STRATEGY - Tránh restart loops tạo nhiều processes
      watch: false,
      autorestart: true,
      max_restarts: 5,        // Giảm từ 10 xuống 5
      min_uptime: '30s',      // Tăng từ 10s lên 30s
      restart_delay: 5000,    // Tăng delay lên 5s
      
      // Graceful shutdown - QUAN TRỌNG để release processes
      kill_timeout: 10000,    // 10s để cleanup
      wait_ready: true,
      listen_timeout: 10000,
      
      // 🔧 CRON RESTART - Restart hàng ngày lúc 4h sáng
      // Giúp giải phóng memory leaks và orphan processes
      cron_restart: '0 4 * * *',
      
      // Exp backoff restart - tránh restart quá nhanh
      exp_backoff_restart_delay: 1000
    }
  ]
};
      // Restart hàng ngày lúc 4h sáng để giải phóng memory
      // cron_restart: '0 4 * * *',
    }
  ]
};
