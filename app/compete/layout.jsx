/**
 * 🏆 COMPETE LAYOUT
 * 
 * ⚠️ LƯU Ý: Trang này CẦN LOGIN
 * - KHÔNG index trên Google
 * - KHÔNG đưa vào sitemap
 */

export const metadata = {
  title: 'Thi Đấu Soroban | Sorokid',
  description: 'Thi đấu và xếp hạng Soroban.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function CompeteLayout({ children }) {
  return children;
}
