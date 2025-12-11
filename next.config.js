const nextConfig = {
  images: {
    domains: ['localhost', 'api.dicebear.com'],
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
}
module.exports = nextConfig
