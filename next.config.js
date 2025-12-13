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
    domains: ['localhost', 'api.dicebear.com'],
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
        // JS/CSS bundles - cache với revalidation
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
      'lucide-react',    // Icon library - tree shake unused icons
      'react-dom',       // React DOM utilities
    ],
    
    // 🔧 Server Actions optimization
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // 🔧 WEBPACK OPTIMIZATIONS
  webpack: (config, { isServer }) => {
    // Chỉ apply cho client bundle
    if (!isServer) {
      // Tối ưu chunk splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000, // ~240KB per chunk (tối ưu cho HTTP/2)
        cacheGroups: {
          // Vendor chunk cho các libraries ổn định
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Common chunk cho code dùng chung
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
}
module.exports = nextConfig
