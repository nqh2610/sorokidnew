/**
 * 🏆 LEADERBOARD LAYOUT - SEO Metadata
 * 
 * Layout cho trang Leaderboard
 * 
 * 🚀 TỐI ƯU:
 * - Layout static với SEO metadata
 * - Page.jsx fetch data client-side sau auth
 * - Không query DB cho guest/bot
 */

// ============ METADATA SEO ============
export const metadata = {
  title: 'Bảng Xếp Hạng Sorokid - Top Học Viên Xuất Sắc',
  description: 'Bảng xếp hạng học viên xuất sắc nhất tại Sorokid. Thi đua học Soroban, rèn luyện tính nhẩm, giành huy chương và chứng chỉ.',
  keywords: [
    'bảng xếp hạng sorokid',
    'top học viên soroban',
    'thi đua học toán',
    'xếp hạng học sinh',
  ],
  openGraph: {
    title: 'Bảng Xếp Hạng Sorokid',
    description: 'Top học viên xuất sắc nhất - Thi đua học Soroban',
    type: 'website',
    url: 'https://sorokid.com/leaderboard',
  },
  alternates: {
    canonical: 'https://sorokid.com/leaderboard',
  },
  // Leaderboard không cần index vì cần đăng nhập
  robots: {
    index: false,
    follow: true,
  },
};

export default function LeaderboardLayout({ children }) {
  return children;
}
