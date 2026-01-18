/**
 * 🚀 NEXT.JS CONFIG TỐI ƯU CHO SHARED HOSTING
 * 
 * Với 3GB RAM và disk hạn chế, cần:
 * - Giảm bundle size
 * - Tối ưu caching
 * - Giảm memory footprint
 */
const nextConfig = {
  images: {
    domains: ['localhost', 'api.dicebear.com', 'robohash.org'],
    // 🚀 PERF: Bật AVIF format - giảm 30-40% so với WebP
    formats: ['image/avif', 'image/webp'],
    // Tối ưu images
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    deviceSizes: [640, 750, 828, 1080], // Giảm sizes để tiết kiệm disk
    imageSizes: [16, 32, 48, 64, 96], // Smaller image sizes
  },
  
  // Giảm bundle size
  swcMinify: true,
  
  // Tối ưu cho production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Cải thiện navigation
  reactStrictMode: false,
  
  // Output standalone để deploy dễ dàng hơn
  output: 'standalone',
  
  // Tắt check ESLint khi build (để tránh lỗi trên Linux)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Tắt TypeScript errors khi build
  typescript: {
    ignoreBuildErrors: true,
  },

  // 🔧 TỐI ƯU PERFORMANCE
  // Compression
  compress: true,
  
  // Giảm powered by header (security + nhỏ hơn)
  poweredByHeader: false,
  
  // 🔧 FIX: onDemandEntries để giảm lỗi chunk mismatch trong dev
  onDemandEntries: {
    // Giữ pages trong memory lâu hơn (ms)
    maxInactiveAge: 60 * 1000,
    // Số pages giữ trong memory
    pagesBufferLength: 5,
  },
  
  // 🌍 I18N REWRITES - DISABLED
  // Đã chuyển sang sử dụng middleware để xử lý i18n
  // Routes /en/* có file riêng trong /app/en/ nên KHÔNG cần rewrite
  // async rewrites() {
  //   return {
  //     beforeFiles: [
  //       { source: '/en', destination: '/' },
  //       { source: '/en/:path*', destination: '/:path*' },
  //     ],
  //   };
  // },

  // Caching headers cho static assets
  async headers() {
    return [
      {
        // Static assets - cache lâu
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // JS/CSS bundles - cache với revalidation (ngắn hơn trong dev)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'production' 
              ? 'public, max-age=31536000, immutable'
              : 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // API responses - no cache hoặc short cache
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      {
        // Security headers
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Experimental optimizations
  experimental: {
    // 🔧 TỐI ƯU BUNDLE SIZE: Optimize các package imports lớn
    optimizePackageImports: [
      'lucide-react',      // Icon library - tree shake unused icons
      'react-dom',         // React DOM utilities
      'framer-motion',     // Animation library - tree shake unused
      'date-fns',          // Date utilities - tree shake unused functions
      '@prisma/client',    // Prisma client
    ],
    
    // 🔧 Server Actions optimization
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // 🔧 WEBPACK CONFIG - Sử dụng Next.js defaults
  // ⚠️ Custom splitChunks có thể gây 404 errors và chunk mismatch
  // Chỉ giữ lại minimal config nếu cần
  webpack: (config, { isServer }) => {
    // Giữ nguyên defaults của Next.js
    // Next.js đã tối ưu splitChunks rất tốt rồi
    return config;
  },
}
module.exports = nextConfig
