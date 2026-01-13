/**
 * 🎯 PRACTICE LAYOUT
 * 
 * ⚠️ LƯU Ý: Trang này CẦN LOGIN
 * - KHÔNG index trên Google
 * - KHÔNG đưa vào sitemap
 */

export const metadata = {
  title: 'Luyện Tập Soroban | Sorokid',
  description: 'Luyện tập Soroban hàng ngày.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function PracticeLayout({ children }) {
  return children;
}
