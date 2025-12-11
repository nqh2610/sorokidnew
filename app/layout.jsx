import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '../components/SessionProvider';
import { ToastProvider } from '../components/Toast/ToastContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sorokid - Học Soroban Online',
  description: 'Nền tảng học Soroban trực tuyến #1 Việt Nam - Tính nhẩm nhanh hơn máy tính trong 6 tháng!',
  keywords: 'soroban, sorokid, học toán, tính nhẩm, bàn tính, anzan, toán tư duy',
  openGraph: {
    title: 'Sorokid - Học Soroban Online',
    description: 'Nền tảng học Soroban trực tuyến #1 Việt Nam',
    type: 'website',
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
