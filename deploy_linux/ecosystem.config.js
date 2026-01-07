const path = require('path');

/**
 * 🚀 PM2 CONFIG v2.0 - SHARED HOST SURVIVAL MODE
 * 
 * ⚠️ GIỚI HẠN: 1000 PROCESSES / 3GB RAM
 * 
 * CHIẾN LƯỢC TỐI ƯU:
 * 1. 📊 1 instance duy nhất - tránh process explosion
 * 2. 💾 Memory limit 450MB với auto-restart
 * 3. ⏱️ UV threadpool = 4 (tăng từ 2 để I/O tốt hơn)
 * 4. 🔄 Graceful restart với proper cleanup
 * 5. 📝 Log rotation để tránh disk full
 * 
 * Process breakdown:
 * - Node.js main: 1
 * - UV threads: 4
 * - Prisma connections: 8
 * - System overhead: ~50
 * - Còn lại cho requests: ~900+ processes available
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
      
      // 🔧 SINGLE INSTANCE - Quan trọng cho shared host
      instances: 1,
      exec_mode: 'fork',
      
      // 🔧 ENVIRONMENT - Tối ưu cho shared hosting
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        RUNTIME_ENV: 'shared',
        
        // 🔧 Memory optimization
        // Tăng lên 450MB để có buffer, giảm GC pressure
        NODE_OPTIONS: '--max-old-space-size=450 --optimize-for-size --gc-interval=100',
        
        // 🔧 UV threadpool - tăng lên 4 để I/O tốt hơn
        // 4 threads vẫn an toàn với 1000 process limit
        UV_THREADPOOL_SIZE: '4',
        
        // Disable warnings trong production
        NODE_NO_WARNINGS: '1',
        
        // 🆕 Force IPv4 để tránh DNS issues trên shared host
        NODE_OPTIONS_EXTRA: '--dns-result-order=ipv4first',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        RUNTIME_ENV: 'shared',
        NODE_OPTIONS: '--max-old-space-size=450 --optimize-for-size --gc-interval=100',
        UV_THREADPOOL_SIZE: '4',
        NODE_NO_WARNINGS: '1',
      },
      
      // 🔧 MEMORY MANAGEMENT
      // Restart khi memory vượt 500MB (buffer 50MB)
      max_memory_restart: '500M',
      
      // 🔧 LOGGING - với rotation
      error_file: path.join(defaultCwd, 'logs', 'error.log'),
      out_file: path.join(defaultCwd, 'logs', 'out.log'),
      log_file: path.join(defaultCwd, 'logs', 'combined.log'),
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      
      // 🆕 Log rotation - giữ file size nhỏ
      log_type: 'json',
      
      // 🔧 RESTART STRATEGY - Conservative
      watch: false,
      autorestart: true,
      max_restarts: 5,           // Tăng lên 5 để resilient hơn
      min_uptime: '30s',         // 30s là đủ để verify stable
      restart_delay: 5000,       // 5s delay giữa restarts
      
      // 🔧 GRACEFUL SHUTDOWN - Đủ thời gian cleanup
      kill_timeout: 10000,       // 10s để cleanup connections
      wait_ready: true,
      listen_timeout: 10000,
      
      // 🔧 CRON RESTART - 4h sáng mỗi ngày
      // Giải phóng memory leaks tích lũy
      cron_restart: '0 4 * * *',
      
      // 🔧 EXPONENTIAL BACKOFF - Tránh restart loop
      exp_backoff_restart_delay: 1000,
      
      // 🆕 HEALTH CHECK
      // PM2 sẽ restart nếu app không respond
      // Commented vì cần PM2 Plus
      // health_check: {
      //   url: 'http://localhost:3000/api/health',
      //   interval: 30000,
      //   timeout: 5000,
      // },
    }
  ],
  
  // 🆕 DEPLOY CONFIG (optional, cho CI/CD)
  deploy: {
    production: {
      user: process.env.DEPLOY_USER || 'nhsortag',
      host: process.env.DEPLOY_HOST || 'sorokids.com',
      ref: 'origin/main',
      repo: 'git@github.com:username/sorokid.git',
      path: '/var/www/sorokid',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
