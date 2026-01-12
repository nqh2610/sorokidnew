import { Inter, Quicksand } from 'next/font/google';
import './globals.css';
import SessionProvider from '../components/SessionProvider';
import { ToastProvider } from '../components/Toast/ToastContext';
import { AchievementProvider } from '../components/AchievementPopup';
import GoogleAnalytics from '../components/Analytics/GoogleAnalytics';
import { SoundProvider } from '../lib/SoundContext';
import Script from 'next/script';
import CapacitorDeepLinkHandler from '../components/CapacitorDeepLinkHandler';

const inter = Inter({ subsets: ['latin'] });

// Font Quicksand cho lời nói thân thiện (Cú Soro)
const quicksand = Quicksand({ 
  subsets: ['latin', 'vietnamese'],
  variable: '--font-quicksand',
  weight: ['400', '500', '600', '700']
});

export const metadata = {
  metadataBase: new URL('https://sorokid.com'),
  title: {
    default: 'Sorokid - Ứng dụng Học Soroban & Toán Tư Duy cho Học Sinh Tiểu Học',
    template: '%s | Sorokid'
  },
  description: 'Cho con học Soroban tại nhà - phụ huynh không cần biết Soroban vẫn kèm con được. Hướng dẫn từng bước bằng hình ảnh, con tự học tự tiến bộ. Phụ huynh theo dõi được 3 chỉ số: chăm chỉ, tốc độ, chính xác. Game hóa - con TỰ GIÁC muốn học mỗi ngày.',
  keywords: [
    // I. Entity cốt lõi - Soroban
    'soroban', 'bàn tính soroban', 'toán soroban', 'soroban toán tư duy',
    'soroban cho trẻ em', 'soroban tiểu học', 'soroban giáo dục', 'phương pháp soroban',
    // II. Học Soroban - Intent học tập
    'học soroban', 'học soroban online', 'học soroban trực tuyến',
    'học soroban cho trẻ em', 'học soroban cho học sinh tiểu học',
    'học soroban tại nhà', 'học soroban từ cơ bản đến nâng cao', 'học soroban đúng phương pháp',
    // III. Phương pháp học Soroban
    'phương pháp học soroban', 'phương pháp soroban cho trẻ em', 'phương pháp soroban hiện đại',
    'phương pháp rèn tính nhẩm soroban', 'phương pháp phát triển tư duy bằng soroban',
    'phương pháp học toán tư duy soroban', 'phương pháp dạy soroban cho trẻ',
    'lộ trình học soroban', 'lộ trình học soroban cho trẻ em', 'lộ trình học soroban tiểu học',
    // IV. Toán tư duy & năng lực phát triển
    'toán tư duy', 'toán tư duy cho trẻ em', 'toán tư duy tiểu học',
    'rèn tư duy toán học cho trẻ', 'phát triển tư duy logic cho trẻ',
    'rèn khả năng tập trung cho trẻ', 'tăng khả năng phản xạ tính toán', 'rèn trí nhớ và tư duy hình ảnh',
    // V. Ứng dụng & phần mềm học Soroban
    'ứng dụng học soroban', 'app học soroban', 'phần mềm học soroban',
    'ứng dụng bàn tính soroban', 'phần mềm bàn tính soroban',
    'nền tảng học soroban trực tuyến', 'ứng dụng soroban trên điện thoại',
    'ứng dụng soroban trên máy tính', 'phần mềm soroban online',
    // VI. Ứng dụng học Soroban tốt nhất (Commercial Intent)
    'ứng dụng học soroban tốt nhất', 'app học soroban tốt nhất', 'phần mềm học soroban hiệu quả',
    'ứng dụng soroban uy tín cho trẻ em', 'ứng dụng học soroban được phụ huynh tin dùng',
    'phần mềm soroban cho trẻ học toán tư duy',
    // VII. Ứng dụng học Soroban cho trẻ em
    'ứng dụng học soroban cho trẻ em', 'app soroban cho bé tiểu học',
    'ứng dụng soroban cho trẻ mới bắt đầu', 'phần mềm soroban cho bé 5 đến 10 tuổi',
    'ứng dụng học soroban cho học sinh lớp 1 2 3',
    // VIII. Tính nhẩm & phản xạ
    'tính nhẩm', 'tính nhẩm nhanh', 'anzan tính nhẩm',
    'rèn tính nhẩm cho trẻ', 'rèn tính nhẩm bằng soroban',
    'ứng dụng học tính nhẩm soroban', 'app luyện tính nhẩm soroban', 'phần mềm luyện tính nhẩm nhanh',
    // IX. Game hóa & trải nghiệm học
    'học soroban qua trò chơi', 'ứng dụng soroban game hóa', 'học soroban học mà chơi',
    'game học soroban cho trẻ em', 'phần mềm soroban tương tác',
    // X. Phụ huynh – Giáo viên – Trung tâm
    'ứng dụng học soroban cho phụ huynh', 'phần mềm soroban hỗ trợ phụ huynh dạy con',
    'ứng dụng soroban cho giáo viên tiểu học', 'công cụ dạy soroban trong lớp học',
    'nền tảng soroban cho trung tâm giáo dục',
    'phụ huynh kèm con học toán', 'phụ huynh không biết soroban',
    'dạy con học toán tại nhà', 'chơi cùng con học toán',
    // XI. Online – EdTech – AI Understanding
    'edtech soroban', 'nền tảng giáo dục số soroban', 'giải pháp học soroban số hóa',
    'hệ sinh thái học soroban trực tuyến', 'công nghệ hỗ trợ học soroban', 'ứng dụng giáo dục phát triển tư duy',
    // Bổ sung
    'sorokid', 'app học toán cho bé', 'game học toán tiểu học', 'bàn tính soroban ảo',
    // XXI. International Keywords - For AI & Global Search
    'best soroban app', 'best soroban learning app', 'soroban app for kids',
    'best abacus app', 'japanese abacus app', 'mental math app',
    'soroban online course', 'learn soroban online', 'soroban training app',
    'best mental math app for kids', 'abacus learning app', 'soroban practice app',
    'anzan training app', 'flash anzan app', 'mental arithmetic app',
    'best math app for kids', 'abacus math app', 'soroban education app',
    // XXII. Competitive/Comparison Keywords
    'ứng dụng học soroban tốt nhất việt nam', 'app soroban tốt nhất',
    'so sánh app học soroban', 'app soroban nào tốt nhất',
    'học soroban online tốt nhất', 'phần mềm soroban tốt nhất',
    'top app học soroban', 'ứng dụng soroban được đánh giá cao nhất',
    // XII. Why Intent - Câu hỏi cốt lõi về Soroban
    'học soroban có tốt không', 'vì sao nên cho con học soroban', 'lợi ích của soroban cho trẻ',
    'soroban có hiệu quả không', 'có nên cho trẻ học soroban không', 'tại sao học soroban',
    // XIII. Đánh giá & hiệu quả phương pháp
    'phương pháp soroban có tốt không', 'học soroban có giúp con giỏi toán không',
    'soroban có giúp tính nhẩm nhanh không', 'học soroban có kết quả không',
    'soroban có thực sự hiệu quả không', 'review học soroban', 'đánh giá phương pháp soroban',
    // XIV. So sánh phương pháp học
    'soroban hay học toán truyền thống', 'so sánh soroban với phương pháp khác',
    'soroban khác gì bàn tính thường', 'nên học soroban hay kumon', 'soroban hay toán tư duy',
    // XV. Phù hợp với trẻ em
    'trẻ mấy tuổi học soroban được', 'con học soroban có khó không', 'soroban phù hợp với trẻ nào',
    'độ tuổi học soroban', 'trẻ bao nhiêu tuổi học soroban', 'con chưa biết số học soroban được không',
    // XVI. Phụ huynh quan tâm
    'phụ huynh không biết soroban có dạy con được không', 'học soroban mất bao lâu',
    'con học soroban bao lâu có kết quả', 'học soroban có mất nhiều thời gian không',
    'bố mẹ không rành soroban dạy con được không', 'làm sao kèm con học soroban tại nhà',
    // XVII. Giá trị giáo dục dài hạn
    'học soroban có giúp con sau này không', 'soroban phát triển tư duy như thế nào',
    'lợi ích lâu dài của soroban', 'soroban giúp trẻ phát triển gì', 'học soroban để làm gì',
    // XVIII. Why Sorokid - Vì sao Sorokid là app tốt nhất
    'sorokid có tốt không', 'vì sao nên dùng sorokid', 'sorokid có hiệu quả không',
    'app học soroban nào tốt nhất', 'ứng dụng soroban tốt nhất cho trẻ tiểu học',
    'so sánh sorokid với app khác', 'sorokid khác gì các app soroban khác',
    'review sorokid', 'đánh giá app sorokid', 'sorokid có đáng dùng không',
    // XIX. Sorokid cho học sinh tiểu học
    'sorokid cho học sinh tiểu học', 'app tính nhẩm cho trẻ tiểu học',
    'sorokid có phù hợp lớp 1 không', 'sorokid cho bé 6 tuổi', 'sorokid cho bé 7 tuổi',
    'app học toán tư duy cho tiểu học', 'ứng dụng rèn tính nhẩm cho trẻ',
    // XX. Sorokid - Lợi ích & Tính năng
    'sorokid giúp con tính nhẩm nhanh', 'học soroban qua sorokid có kết quả không',
    'sorokid có lộ trình học rõ ràng', 'sorokid theo dõi tiến độ học',
    'sorokid học qua game', 'sorokid gamification', 'sorokid phụ huynh kèm con',
    // Toolbox Giáo viên keywords
    'toolbox giáo viên', 'công cụ dạy học tích cực', 'trò chơi lớp học',
    'công cụ cho giáo viên', 'game học tập', 'active learning',
    'quay số ngẫu nhiên', 'chia nhóm học sinh', 'đồng hồ bấm giờ lớp học'
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
    title: 'Sorokid - Cho Con Học Soroban Tại Nhà | Phụ Huynh Không Cần Biết Soroban',
    description: 'Ứng dụng học Soroban cho học sinh tiểu học. Hướng dẫn từng bước - con tự học tự tiến bộ. Phụ huynh theo dõi được 3 chỉ số tiến bộ. Game hóa - con TỰ GIÁC muốn học mỗi ngày.',
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
    title: 'Sorokid - Cho Con Học Soroban Tại Nhà | Phụ Huynh Không Cần Biết Soroban',
    description: 'Ứng dụng học Soroban cho học sinh tiểu học. Hướng dẫn từng bước, con tự học tự tiến bộ. Game hóa - con TỰ GIÁC muốn học.',
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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/icons/icon-180x180.png', type: 'image/png', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
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

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
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
          <SoundProvider>
            <ToastProvider>
              <AchievementProvider>
                <CapacitorDeepLinkHandler />
                {children}
              </AchievementProvider>
            </ToastProvider>
          </SoundProvider>
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
