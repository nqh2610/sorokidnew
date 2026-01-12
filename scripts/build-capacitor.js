/**
 * 📱 BUILD SCRIPT CHO CAPACITOR
 * 
 * Script này:
 * 1. Backup next.config.js gốc
 * 2. Thay bằng config cho Capacitor (static export)
 * 3. Build
 * 4. Restore next.config.js gốc
 * 
 * Chạy: node scripts/build-capacitor.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const NEXT_CONFIG = path.join(ROOT, 'next.config.js');
const NEXT_CONFIG_BACKUP = path.join(ROOT, 'next.config.js.backup');

// Capacitor-specific config (inline để đơn giản)
const CAPACITOR_CONFIG = `/**
 * 📱 NEXT.JS CONFIG CHO CAPACITOR (AUTO-GENERATED)
 * DO NOT EDIT - File này được tạo bởi scripts/build-capacitor.js
 */
const nextConfig = {
  images: {
    domains: ['localhost', 'api.dicebear.com', 'robohash.org'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24,
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [16, 32, 48, 64, 96],
    // QUAN TRỌNG: Tắt optimization cho static export
    unoptimized: true,
  },
  
  swcMinify: true,
  
  compiler: {
    removeConsole: true,
  },
  
  reactStrictMode: false,
  
  // QUAN TRỌNG: Export static cho Capacitor
  output: 'export',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },

  compress: true,
  poweredByHeader: false,
  
  // Trailing slashes cho static paths
  trailingSlash: true,
};

module.exports = nextConfig;
`;

async function main() {
  console.log('📱 SOROKID CAPACITOR BUILD');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Backup current config
    console.log('\n📦 Step 1: Backup next.config.js...');
    if (fs.existsSync(NEXT_CONFIG)) {
      fs.copyFileSync(NEXT_CONFIG, NEXT_CONFIG_BACKUP);
      console.log('✅ Backed up to next.config.js.backup');
    }
    
    // Step 2: Write Capacitor config
    console.log('\n⚙️  Step 2: Apply Capacitor config...');
    fs.writeFileSync(NEXT_CONFIG, CAPACITOR_CONFIG);
    console.log('✅ Capacitor config applied');
    
    // Step 3: Run Prisma generate
    console.log('\n🗄️  Step 3: Generate Prisma client...');
    execSync('npx prisma generate', { cwd: ROOT, stdio: 'inherit' });
    
    // Step 4: Build Next.js
    console.log('\n🔨 Step 4: Building Next.js (static export)...');
    execSync('npx next build', { cwd: ROOT, stdio: 'inherit' });
    console.log('✅ Build complete! Output in /out folder');
    
    // Step 5: Restore original config
    console.log('\n🔄 Step 5: Restore original config...');
    if (fs.existsSync(NEXT_CONFIG_BACKUP)) {
      fs.copyFileSync(NEXT_CONFIG_BACKUP, NEXT_CONFIG);
      fs.unlinkSync(NEXT_CONFIG_BACKUP);
      console.log('✅ Original config restored');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 BUILD THÀNH CÔNG!');
    console.log('\nBước tiếp theo:');
    console.log('  1. npx cap sync');
    console.log('  2. npx cap open android   (hoặc ios)');
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    
    // Restore config on error
    if (fs.existsSync(NEXT_CONFIG_BACKUP)) {
      console.log('\n🔄 Restoring original config...');
      fs.copyFileSync(NEXT_CONFIG_BACKUP, NEXT_CONFIG);
      fs.unlinkSync(NEXT_CONFIG_BACKUP);
    }
    
    process.exit(1);
  }
}

main();
