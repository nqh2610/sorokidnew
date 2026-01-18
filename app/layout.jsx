import { Inter, Quicksand } from 'next/font/google';
import './globals.css';
import SessionProvider from '../components/SessionProvider';
import { ToastProvider } from '../components/Toast/ToastContext';
import { AchievementProvider } from '../components/AchievementPopup';
import GoogleAnalytics from '../components/Analytics/GoogleAnalytics';
import { SoundProvider } from '../lib/SoundContext';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import { cookies, headers } from 'next/headers';
import { I18nProvider } from '@/lib/i18n/I18nContext';
import { getDictionarySync } from '@/lib/i18n/dictionary';
import { LOCALE_COOKIE, defaultLocale, localeConfig } from '@/lib/i18n/config';

// Dynamic import để tránh lỗi SSR với Capacitor plugins
const CapacitorDeepLinkHandler = dynamic(
  () => import('../components/CapacitorDeepLinkHandler'),
  { ssr: false }
);

const inter = Inter({ subsets: ['latin'] });

// Font Quicksand cho lời nói thân thiện (Cú Soro)
const quicksand = Quicksand({ 
  subsets: ['latin', 'vietnamese'],
  variable: '--font-quicksand',
  weight: ['400', '500', '600', '700']
});

/**
 * 🎯 DYNAMIC METADATA - ĐA NGÔN NGỮ
 * Tự động thay đổi title/description theo ngôn ngữ người dùng
 */
export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE)?.value || defaultLocale;
  const config = localeConfig[locale];
  
  // Title và description theo ngôn ngữ
  const titles = {
    vi: 'Sorokid - Ứng dụng Học Soroban & Toán Tư Duy cho Học Sinh Tiểu Học',
    en: 'Sorokid - Best Soroban & Mental Math Learning App for Kids',
  };
  
  const descriptions = {
    vi: 'Cho con học Soroban tại nhà - phụ huynh không cần biết Soroban vẫn kèm con được. Hướng dẫn từng bước bằng hình ảnh, con tự học tự tiến bộ. Phụ huynh theo dõi được 3 chỉ số: chăm chỉ, tốc độ, chính xác. Game hóa - con TỰ GIÁC muốn học mỗi ngày.',
    en: 'Let your child learn Soroban at home - parents don\'t need to know Soroban. Step-by-step visual guide, self-paced learning. Track 3 metrics: diligence, speed, accuracy. Gamified - kids WANT to learn every day.',
  };
  
  const ogTitles = {
    vi: 'Sorokid - Cho Con Học Soroban Tại Nhà | Phụ Huynh Không Cần Biết Soroban',
    en: 'Sorokid - Learn Soroban at Home | No Prior Knowledge Required',
  };

  return {
    metadataBase: new URL('https://sorokid.com'),
    title: {
      default: titles[locale] || titles.vi,
      template: '%s | Sorokid'
    },
    description: descriptions[locale] || descriptions.vi,
    keywords: getKeywordsByLocale(locale),
    authors: [{ name: 'Sorokid Team', url: 'https://sorokid.com' }],
    creator: 'Sorokid',
    publisher: 'Sorokid',
    applicationName: 'Sorokid',
    referrer: 'origin-when-cross-origin',
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: ogTitles[locale] || ogTitles.vi,
      description: descriptions[locale] || descriptions.vi,
      url: 'https://sorokid.com',
      siteName: 'Sorokid',
      locale: config?.hreflang?.replace('-', '_') || 'vi_VN',
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: titles[locale] || titles.vi,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitles[locale] || ogTitles.vi,
      description: descriptions[locale] || descriptions.vi,
      images: ['/og-image.png'],
      creator: '@sorokid',
    },
    alternates: {
      // 🌍 SEO: Canonical theo ngôn ngữ hiện tại
      // Tiếng Việt: https://sorokid.com
      // Tiếng Anh: https://sorokid.com/en
      canonical: locale === 'en' ? 'https://sorokid.com/en' : 'https://sorokid.com',
      // Hreflang cho Google hiểu đa ngôn ngữ
      languages: {
        'vi': 'https://sorokid.com',
        'en': 'https://sorokid.com/en',
        'x-default': 'https://sorokid.com', // Tiếng Việt là default
      },
    },
    verification: {
      google: 'googledb95ba6d70469295',
    },
    category: 'education',
    classification: 'Educational Application',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icons/icon-192x192.png', type: 'image/png', sizes: '192x192' },
        { url: '/icons/icon-512x512.png', type: 'image/png', sizes: '512x512' },
      ],
      apple: [
        { url: '/icons/icon-180x180.png', type: 'image/png', sizes: '180x180' },
      ],
      shortcut: '/favicon.ico',
    },
    // 🌍 PWA Manifest theo ngôn ngữ
    manifest: locale === 'en' ? '/manifest.en.json' : '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Sorokid',
    },
    formatDetection: {
      telephone: false,
    },
    other: {
      'apple-mobile-web-app-title': 'Sorokid',
      'application-name': 'Sorokid',
      'msapplication-TileColor': '#8B5CF6',
      'theme-color': '#8B5CF6',
    },
  };
}

/**
 * Keywords theo ngôn ngữ - tối ưu SEO riêng biệt
 */
function getKeywordsByLocale(locale) {
  if (locale === 'en') {
    return [
      // Core Soroban keywords
      'soroban', 'soroban app', 'soroban learning app', 'best soroban app',
      'learn soroban online', 'soroban for kids', 'soroban training',
      // Mental math
      'mental math', 'mental math app', 'mental arithmetic', 'anzan',
      'flash anzan', 'mental calculation', 'mental math for kids',
      // Abacus
      'abacus', 'japanese abacus', 'abacus app', 'abacus learning',
      'abacus math', 'abacus for kids', 'virtual abacus',
      // Education
      'math app for kids', 'elementary math', 'math learning app',
      'educational app', 'kids education', 'homeschool math',
      // Benefits
      'brain training', 'cognitive development', 'concentration training',
      'memory improvement', 'problem solving skills',
    ];
  }
  
  // Vietnamese keywords (default)
  return [
    // I. Entity cốt lõi - Soroban
    'soroban', 'bàn tính soroban', 'toán soroban', 'soroban toán tư duy',
    'soroban cho trẻ em', 'soroban tiểu học', 'soroban giáo dục', 'phương pháp soroban',
    // II. Học Soroban
    'học soroban', 'học soroban online', 'học soroban trực tuyến',
    'học soroban cho trẻ em', 'học soroban cho học sinh tiểu học',
    'học soroban tại nhà', 'học soroban từ cơ bản đến nâng cao',
    // III. Phương pháp
    'phương pháp học soroban', 'phương pháp soroban cho trẻ em',
    'lộ trình học soroban', 'lộ trình học soroban cho trẻ em',
    // IV. Toán tư duy
    'toán tư duy', 'toán tư duy cho trẻ em', 'toán tư duy tiểu học',
    'rèn tư duy toán học cho trẻ', 'phát triển tư duy logic cho trẻ',
    // V. Ứng dụng
    'ứng dụng học soroban', 'app học soroban', 'phần mềm học soroban',
    'ứng dụng học soroban tốt nhất', 'app học soroban tốt nhất',
    // VI. Tính nhẩm
    'tính nhẩm', 'tính nhẩm nhanh', 'anzan tính nhẩm',
    'rèn tính nhẩm cho trẻ', 'rèn tính nhẩm bằng soroban',
    // VII. Brand
    'sorokid', 'app học toán cho bé', 'game học toán tiểu học',
    // VIII. Toolbox
    'toolbox giáo viên', 'công cụ dạy học tích cực', 'trò chơi lớp học',
  ];
}

// Helper: Lấy dictionary an toàn - SYNC VERSION ĐỂ TRÁNH RACE CONDITION
// 🔧 FIX: Dùng sync loading để đảm bảo dictionary luôn sẵn sàng trước khi render
function getSafeDictionary(locale) {
  try {
    // Dùng sync version - an toàn hơn cho SSR
    return getDictionarySync(locale);
  } catch (e) {
    console.error('[i18n] Failed to load dictionary:', e);
    return {};
  }
}

export default async function RootLayout({ children }) {
  // 🌍 Đọc locale từ header (set bởi middleware) hoặc cookie
  const headersList = await headers();
  const cookieStore = await cookies();
  
  // Ưu tiên header x-locale (chính xác hơn trong cùng request)
  const localeFromHeader = headersList.get('x-locale');
  const localeFromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = localeFromHeader || localeFromCookie || defaultLocale;
  
  // 🔧 FIX: Dùng sync loading - tránh race condition gây trang trắng
  const dictionary = getSafeDictionary(locale);
  
  return (
    <html lang={locale}>
      <head>
        {/* 🚀 Performance: Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sorokid" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
      </head>
      <body className={`${inter.className} ${quicksand.variable}`}>
        <GoogleAnalytics />
        <SessionProvider>
          <I18nProvider initialLocale={locale} dictionary={dictionary}>
            <SoundProvider>
              <ToastProvider>
                <AchievementProvider>
                  <CapacitorDeepLinkHandler />
                  {children}
                </AchievementProvider>
              </ToastProvider>
            </SoundProvider>
          </I18nProvider>
        </SessionProvider>
        
        {/* Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('✅ ServiceWorker registered:', registration.scope);
                  })
                  .catch(function(err) {
                    console.log('❌ ServiceWorker registration failed:', err);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
