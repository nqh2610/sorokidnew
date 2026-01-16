import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * 🔒 MIDDLEWARE TỐI ƯU CHO SHARED HOSTING
 * 
 * Giới hạn 1000 processes:
 * - Không import heavy modules trong middleware
 * - Rate limiting nhẹ bằng headers
 * - Sớm reject requests không hợp lệ
 * 
 * 🌍 I18N - COOKIE-BASED (giữ URL tiếng Việt đã index):
 * - URL gốc: tiếng Việt (đã được Google index) - KHÔNG ĐỔI
 * - /en/...: rewrite về URL gốc + set cookie EN
 * - Cookie: ghi nhớ preference cho UX
 * - Không tạo URL mới, chỉ đổi ngôn ngữ qua cookie
 */

// I18n config (inline để không import)
const I18N_LOCALES = ['vi', 'en'];
const I18N_DEFAULT = 'vi';
const I18N_COOKIE = 'sorokid_locale';

// 🌍 Tool slug mapping: English slug → Vietnamese slug (folder name)
// English URLs use SEO-friendly slugs, Vietnamese URLs stay as-is (already indexed)
const TOOL_SLUG_EN_TO_VI = {
  'who-wants-to-be-millionaire': 'ai-la-trieu-phu',
  'soroban-abacus': 'ban-tinh-soroban',
  'random-picker': 'boc-tham',
  'group-divider': 'chia-nhom',
  'group-random-picker': 'chia-nhom-boc-tham',
  'magic-hat': 'chiec-non-ky-dieu',
  'adventure-race': 'cuoc-dua-ki-thu',
  'lucky-light': 'den-may-man',
  'stopwatch': 'dong-ho-bam-gio',
  'animal-race': 'dua-thu-hoat-hinh',
  'flash-anzan': 'flash-zan',
  'crossword': 'o-chu',
  'dice-roller': 'xuc-xac',
};

// Reverse mapping: Vietnamese slug → English slug
const TOOL_SLUG_VI_TO_EN = Object.fromEntries(
  Object.entries(TOOL_SLUG_EN_TO_VI).map(([en, vi]) => [vi, en])
);

// Routes không cần locale prefix (static files, api, etc.)
const I18N_IGNORE_PATHS = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/icon.svg',
];

/**
 * 🌍 Kiểm tra xem path có /en/ prefix không
 * URL gốc = tiếng Việt (đã index), /en/ = tiếng Anh
 */
function getLocaleFromPath(pathname) {
  // Chỉ check /en/ prefix, URL gốc = tiếng Việt
  if (pathname.startsWith('/en/') || pathname === '/en') {
    return 'en';
  }
  return 'vi'; // URL gốc = tiếng Việt
}

/**
 * 🌍 Bỏ /en/ prefix khỏi pathname để check protected routes
 * Và translate English tool slugs về Vietnamese slugs
 */
function removeLocalePrefix(pathname) {
  let path = pathname;
  
  if (path.startsWith('/en/')) {
    path = path.slice(3) || '/';
  } else if (path === '/en') {
    return '/';
  }
  
  // Translate English tool slug to Vietnamese slug
  // /tool/animal-race → /tool/dua-thu-hoat-hinh
  const toolMatch = path.match(/^\/tool\/([^\/]+)(\/.*)?$/);
  if (toolMatch) {
    const [, slug, rest = ''] = toolMatch;
    const viSlug = TOOL_SLUG_EN_TO_VI[slug];
    if (viSlug) {
      return `/tool/${viSlug}${rest}`;
    }
  }
  
  return path;
}

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

/**
 * 🌍 Detect ngôn ngữ từ Accept-Language header
 */
function detectLocaleFromHeader(acceptLanguage) {
  if (!acceptLanguage) return I18N_DEFAULT;
  
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(),
        q: qValue ? parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.q - a.q);
  
  for (const lang of languages) {
    if (I18N_LOCALES.includes(lang.code)) {
      return lang.code;
    }
  }
  
  return I18N_DEFAULT;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 🔧 FIX: Skip các paths không cần xử lý
  if (I18N_IGNORE_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 🔧 FIX: Skip static files
  if (pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|mp3|mp4|pdf)$/)) {
    return NextResponse.next();
  }

  // 🌍 I18N: Detect locale
  // Ưu tiên: 1. URL prefix (/en/) → 2. Cookie đã lưu → 3. Browser language → 4. Default (vi)
  const urlLocale = getLocaleFromPath(pathname);
  const savedLocale = request.cookies.get(I18N_COOKIE)?.value;
  const browserLocale = detectLocaleFromHeader(request.headers.get('accept-language'));
  
  // Xác định locale cuối cùng
  let locale;
  let shouldRedirect = false;
  let redirectToVi = false;  // Flag để redirect về URL tiếng Việt
  
  if (savedLocale && I18N_LOCALES.includes(savedLocale)) {
    // 🔥 User đã có preference (đã chọn ngôn ngữ trước đó)
    locale = savedLocale;
    
    if (savedLocale === 'en' && urlLocale === 'vi') {
      // Cookie = EN nhưng URL là VI → redirect sang /en/
      shouldRedirect = true;
    } else if (savedLocale === 'vi' && urlLocale === 'en') {
      // Cookie = VI nhưng URL là /en/ → redirect về URL gốc (bỏ /en/)
      redirectToVi = true;
    }
  } else if (urlLocale === 'en') {
    // User đang ở URL /en/... mà chưa có cookie → dùng EN, lưu cookie
    locale = 'en';
  } else {
    // Lần đầu tiên, URL là VI → detect từ browser
    locale = browserLocale;
    // Nếu browser là EN nhưng URL là VI → redirect sang /en/
    if (locale === 'en') {
      shouldRedirect = true;
    }
  }
  
  // 🔥 Redirect về URL tiếng Việt (bỏ /en/) khi user đã chọn VI
  if (redirectToVi) {
    const pathWithoutEn = removeLocalePrefix(pathname);
    const newUrl = new URL(pathWithoutEn, request.url);
    newUrl.search = request.nextUrl.search;
    const redirectResponse = NextResponse.redirect(newUrl);
    // Giữ nguyên cookie VI
    redirectResponse.cookies.set(I18N_COOKIE, 'vi', {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'lax',
    });
    return redirectResponse;
  }
  
  // 🔥 Redirect user đến /en/ nếu cần
  if (shouldRedirect && locale === 'en') {
    const newUrl = new URL(`/en${pathname === '/' ? '' : pathname}`, request.url);
    newUrl.search = request.nextUrl.search; // Giữ query params
    const redirectResponse = NextResponse.redirect(newUrl);
    // Lưu locale vào cookie
    redirectResponse.cookies.set(I18N_COOKIE, locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 năm
      sameSite: 'lax',
    });
    return redirectResponse;
  }
  
  // 🔥 Nếu là /en/... → rewrite về URL gốc + set cookie EN
  // Ví dụ: /en/blog → rewrite to /blog, set cookie = 'en'
  let rewriteUrl = null;
  if (urlLocale === 'en') {
    const pathWithoutEn = removeLocalePrefix(pathname);
    rewriteUrl = new URL(pathWithoutEn, request.url);
  }

  // Pathname không có locale prefix (để check protected routes)
  const pathnameWithoutLocale = removeLocalePrefix(pathname);

  // Lấy token từ session
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Kiểm tra protected routes (dùng pathnameWithoutLocale)
  const isProtectedRoute = protectedRoutes.some(route => pathnameWithoutLocale.startsWith(route));
  const isGuestRoute = guestRoutes.some(route => pathnameWithoutLocale.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathnameWithoutLocale.startsWith(route));

  // Nếu là protected route mà chưa đăng nhập -> redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathnameWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  // Kiểm tra complete-profile cho Google users TRƯỚC KHI check guest routes
  // Để user chưa hoàn tất profile có thể vào login/register đổi tài khoản
  if (token && !pathnameWithoutLocale.startsWith('/complete-profile') && !pathnameWithoutLocale.startsWith('/api')) {
    // 🔧 Skip profile check nếu vừa hoàn tất đăng ký (có cookie từ API)
    // Cookie được set bởi API complete-profile
    const profileJustCompleted = request.cookies.get('profile_just_completed')?.value === '1';
    
    // Kiểm tra xem user đã hoàn thành profile chưa
    // isNewGoogleUser = true: Google user mới chưa có trong DB
    // isProfileComplete = false: User có trong DB nhưng chưa hoàn tất profile
    if (!profileJustCompleted && (token.isNewGoogleUser === true || token.isProfileComplete === false)) {
      // Cho phép một số route không cần complete profile
      const allowedWithoutProfile = ['/', '/logout', '/pricing', '/login', '/register'];
      
      // Nếu vào protected route mà chưa hoàn tất profile -> redirect
      if (isProtectedRoute && !allowedWithoutProfile.includes(pathnameWithoutLocale)) {
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
    // Giữ locale khi redirect
    const dashboardUrl = locale === 'en' ? '/en/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Nếu là admin route mà không phải admin -> redirect to dashboard
  if (isAdminRoute && token && token.role !== 'admin') {
    const dashboardUrl = locale === 'en' ? '/en/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // 🔥 Rewrite /en/... về URL gốc (page vẫn giữ nguyên, chỉ đổi cookie)
  // Hoặc NextResponse.next() nếu không cần rewrite
  const response = rewriteUrl 
    ? NextResponse.rewrite(rewriteUrl)
    : NextResponse.next();
  
  // Set locale vào header để Server Components có thể đọc
  response.headers.set('x-locale', locale);
  
  // Cập nhật cookie với locale từ URL (để sync khi user đổi ngôn ngữ qua URL)
  response.cookies.set(I18N_COOKIE, locale, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60, // 1 năm
    sameSite: 'lax',
  });
  
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
