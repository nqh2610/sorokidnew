/**
 * 📚 LEARN PAGE LAYOUT
 * 
 * Layout cho trang học Soroban
 * 
 * ⚠️ LƯU Ý: Trang này CẦN LOGIN
 * - KHÔNG index trên Google
 * - KHÔNG đưa vào sitemap
 * - SEO tập trung vào Homepage và Blog
 */

export const metadata = {
  title: 'Học Soroban | Sorokid',
  description: 'Bài học Soroban từ cơ bản đến nâng cao.',
  // KHÔNG INDEX - trang cần login
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function LearnLayout({ children }) {
  return children;
}
