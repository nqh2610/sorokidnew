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

  // Kiểm tra complete-profile cho Google users TRƯỚC KHI check guest routes
  // Để user chưa hoàn tất profile có thể vào login/register đổi tài khoản
  if (token && !pathname.startsWith('/complete-profile') && !pathname.startsWith('/api')) {
    // 🔧 Skip profile check nếu vừa hoàn tất đăng ký (có query param)
    // Query param sẽ được xóa sau khi dashboard load
    const justCompleted = request.nextUrl.searchParams.get('justCompleted') === '1';
    
    // Kiểm tra xem user đã hoàn thành profile chưa
    // isNewGoogleUser = true: Google user mới chưa có trong DB
    // isProfileComplete = false: User có trong DB nhưng chưa hoàn tất profile
    if (!justCompleted && (token.isNewGoogleUser === true || token.isProfileComplete === false)) {
      // Cho phép một số route không cần complete profile
      const allowedWithoutProfile = ['/', '/logout', '/pricing', '/login', '/register'];
      
      // Nếu vào protected route mà chưa hoàn tất profile -> redirect
      if (isProtectedRoute && !allowedWithoutProfile.includes(pathname)) {
        return NextResponse.redirect(new URL('/complete-profile', request.url));
      }
      
      // Cho phép vào login/register để đổi tài khoản (không redirect về dashboard)
      if (isGuestRoute) {
        return NextResponse.next();
      }
    }
  }

  // Nếu đã đăng nhập VÀ đã hoàn tất profile mà vào guest route -> redirect to dashboard
  if (isGuestRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Nếu là admin route mà không phải admin -> redirect to dashboard
  if (isAdminRoute && token && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
