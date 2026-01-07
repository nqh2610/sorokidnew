import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * 🔒 MIDDLEWARE TỐI ƯU CHO SHARED HOSTING
 * 
 * Giới hạn 1000 processes:
 * - Không import heavy modules trong middleware
 * - Rate limiting nhẹ bằng headers
 * - Sớm reject requests không hợp lệ
 */

// Các route cần authentication
const protectedRoutes = [
  '/dashboard',
  '/learn',
  '/practice',
  '/compete',
  '/leaderboard',
  '/admin',
  '/certificate',
  '/profile',
  '/edit-profile'
];

// Các route chỉ dành cho guest
const guestRoutes = [
  '/login',
  '/register'
];

// Các route admin
const adminRoutes = [
  '/admin'
];

// 🔧 KHÔNG BLOCK USER - Chỉ tracking để monitor
// Block user = UX tệ, thay vào đó dùng caching + optimize queries
// const requestCounts = new Map(); // Tắt rate limit

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 🔧 FIX: Skip API routes hoàn toàn trong middleware để giảm overhead
  // API routes tự handle authentication riêng
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 🔧 FIX: Skip static và health check routes
  if (pathname === '/api/health' || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Lấy token từ session
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Kiểm tra protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isGuestRoute = guestRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // Nếu là protected route mà chưa đăng nhập -> redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Nếu đã đăng nhập mà vào guest route -> redirect to dashboard
  if (isGuestRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Nếu là admin route mà không phải admin -> redirect to dashboard
  if (isAdminRoute && token && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Kiểm tra complete-profile
  if (token && !pathname.startsWith('/complete-profile') && !pathname.startsWith('/api')) {
    // Kiểm tra xem user đã hoàn thành profile chưa
    if (!token.profileCompleted && !token.name) {
      // Cho phép một số route không cần complete profile
      const allowedWithoutProfile = ['/', '/logout', '/pricing'];
      if (!allowedWithoutProfile.includes(pathname)) {
        // return NextResponse.redirect(new URL('/complete-profile', request.url));
      }
    }
  }

  // Thêm user info vào headers để các route có thể sử dụng
  const response = NextResponse.next();
  
  if (token) {
    response.headers.set('x-user-id', token.id || token.sub || '');
    response.headers.set('x-user-role', token.role || 'user');
  }

  return response;
}

// Cấu hình matcher để middleware chỉ chạy trên các route cần thiết
export const config = {
  matcher: [
    /*
     * 🔧 TỐI ƯU SHARED HOST: Chỉ match page routes, KHÔNG match:
     * - api (API routes - self-handled)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/data (ISR data files)
     * - favicon.ico (favicon file)
     * - public folder files (images, fonts, assets)
     * - health check
     * - manifest, robots, sitemap
     */
    '/((?!api|_next/static|_next/image|_next/data|favicon.ico|manifest\\.json|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|mp3|mp4|pdf)$).*)',
  ],
};
