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

import { cookies } from 'next/headers';

export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'vi';
  
  const titles = {
    vi: 'Học Soroban | Sorokid',
    en: 'Learn Soroban | Sorokid'
  };
  
  const descriptions = {
    vi: 'Bài học Soroban từ cơ bản đến nâng cao.',
    en: 'Soroban lessons from beginner to advanced.'
  };

  return {
    title: titles[locale] || titles.vi,
    description: descriptions[locale] || descriptions.vi,
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
}

export default function LearnLayout({ children }) {
  return children;
}
