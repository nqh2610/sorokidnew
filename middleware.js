import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Các route cần authentication
const protectedRoutes = [
  '/dashboard',
  '/learn',
  '/practice',
  '/compete',
  '/leaderboard',
  '/admin',
  '/certificate'
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

export async function middleware(request) {
  const { pathname } = request.nextUrl;

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
     * Match all request paths except for the ones starting with:
     * - api (API routes) - handled separately
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
