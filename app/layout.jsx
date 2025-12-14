import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '../components/SessionProvider';
import { ToastProvider } from '../components/Toast/ToastContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://sorokid.com'),
  title: {
    default: 'Sorokid - Học Soroban Online | Tính Nhẩm Nhanh Cho Trẻ Em',
    template: '%s | Sorokid'
  },
  description: 'Sorokid - Nền tảng học Soroban trực tuyến #1 Việt Nam. Học tính nhẩm nhanh qua game, bàn tính ảo, bài học khoa học. Phù hợp học sinh tiểu học 6-12 tuổi. Đăng ký miễn phí!',
  keywords: [
    'học soroban online', 'soroban', 'học tính nhẩm', 'bàn tính soroban',
    'sorokid', 'toán tư duy', 'anzan', 'tính nhẩm nhanh',
    'học soroban cho trẻ em', 'soroban tiểu học', 'abacus việt nam',
    'luyện tính nhẩm online', 'app học soroban', 'game học toán',
    'dạy con học soroban tại nhà', 'phần mềm học soroban'
  ],
  authors: [{ name: 'Sorokid Team' }],
  creator: 'Sorokid',
  publisher: 'Sorokid',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Sorokid - Học Soroban Online | Tính Nhẩm Nhanh Cho Trẻ Em',
    description: 'Nền tảng học Soroban trực tuyến #1 Việt Nam. Học tính nhẩm qua game, phù hợp học sinh tiểu học. Đăng ký miễn phí!',
    url: 'https://sorokid.com',
    siteName: 'Sorokid',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sorokid - Học Soroban Online cho trẻ em Việt Nam',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sorokid - Học Soroban Online | Tính Nhẩm Nhanh',
    description: 'Nền tảng học Soroban trực tuyến #1 Việt Nam. Học qua game, phù hợp học sinh tiểu học.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://sorokid.com',
  },
  verification: {
    google: 'google-site-verification-code',
  },
  category: 'education',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
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
