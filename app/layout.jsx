import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '../components/SessionProvider';
import { ToastProvider } from '../components/Toast/ToastContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://sorokid.com'),
  title: {
    default: 'Sorokid - Ứng dụng học Soroban Online | Tính Nhẩm Nhanh Cho Học Sinh Tiểu Học',
    template: '%s | Sorokid - App học Soroban'
  },
  description: 'Sorokid - Ứng dụng học Soroban trực tuyến #1 Việt Nam. Học tính nhẩm nhanh qua game, bàn tính ảo tương tác. Phù hợp học sinh tiểu học 6-12 tuổi. Phụ huynh đồng hành cùng con tại nhà. Đăng ký miễn phí!',
  keywords: [
    'ứng dụng học soroban', 'app học soroban', 'học soroban online',
    'soroban cho học sinh tiểu học', 'học tính nhẩm online',
    'bàn tính soroban ảo', 'sorokid', 'app học toán cho bé',
    'toán tư duy cho trẻ em', 'anzan tính nhẩm',
    'phần mềm học soroban', 'game học toán tiểu học',
    'phụ huynh kèm con học toán', 'tự học soroban tại nhà',
    'ứng dụng toán cho học sinh tiểu học', 'app tính nhẩm nhanh'
  ],
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
    title: 'Sorokid - Ứng dụng học Soroban Online | Tính Nhẩm Cho Học Sinh Tiểu Học',
    description: 'Ứng dụng học Soroban trực tuyến #1 Việt Nam. Học tính nhẩm qua game, phụ huynh đồng hành cùng con tại nhà. Đăng ký miễn phí!',
    url: 'https://sorokid.com',
    siteName: 'Sorokid',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sorokid - Ứng dụng học Soroban Online cho học sinh tiểu học Việt Nam',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sorokid - App học Soroban Online | Tính Nhẩm Nhanh',
    description: 'Ứng dụng học Soroban #1 Việt Nam. Học qua game, phù hợp học sinh tiểu học 6-12 tuổi.',
    images: ['/og-image.png'],
    creator: '@sorokid',
  },
  alternates: {
    canonical: 'https://sorokid.com',
    languages: {
      'vi-VN': 'https://sorokid.com',
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  category: 'education',
  classification: 'Educational Application',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
  },
  other: {
    'apple-mobile-web-app-title': 'Sorokid',
    'application-name': 'Sorokid',
    'msapplication-TileColor': '#8B5CF6',
    'theme-color': '#8B5CF6',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <SessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
