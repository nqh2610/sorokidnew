/**
 * 📱 NEXT.JS CONFIG CHO CAPACITOR (MOBILE APP BUILD)
 * 
 * Sử dụng: BUILD_MODE=capacitor npm run build:static
 * 
 * Config này export static HTML/CSS/JS để Capacitor wrap thành native app
 */

const baseConfig = require('./next.config.js');

const capacitorConfig = {
  ...baseConfig,
  
  // Output static files cho Capacitor
  output: 'export',
  
  // Không dùng Image Optimization khi export (không có server)
  images: {
    ...baseConfig.images,
    unoptimized: true,
  },
  
  // Trailing slashes cho static export
  trailingSlash: true,
  
  // Base path (để trống cho Capacitor)
  basePath: '',
  
  // Asset prefix
  assetPrefix: '',
};

module.exports = capacitorConfig;
