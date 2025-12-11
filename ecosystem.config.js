const path = require('path');

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
      instances: isWindows ? 1 : 'max', // Windows không hỗ trợ cluster mode tốt
      exec_mode: isWindows ? 'fork' : 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Auto restart nếu memory vượt quá 1GB
      max_memory_restart: '1G',
      // Logs - use cross-platform paths
      error_file: path.join(defaultCwd, 'logs', 'error.log'),
      out_file: path.join(defaultCwd, 'logs', 'out.log'),
      log_file: path.join(defaultCwd, 'logs', 'combined.log'),
      time: true,
      // Auto restart
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 1000
    }
  ]
};
