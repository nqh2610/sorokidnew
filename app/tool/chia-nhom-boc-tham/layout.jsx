/**
 * 🎲 Chia Nhóm & Bốc Thăm - SEO Metadata
 * 
 * 🚀 TỐI ƯU: Static generation - 0 server process
 */

// ============ STATIC CONFIG ============
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Group Maker & Name Picker - 2-in-1 Tool for Teachers | SoroKid',
  description: 'Random group generator combined with student picker. Auto-select team leaders, beautiful animations. Free, no login required.',
  keywords: [
    'random group generator',
    'student picker', 
    'group maker tool',
    'random team generator',
    'teacher tools',
    'classroom group maker',
    'random student picker'
  ],
  openGraph: {
    title: 'Group Maker & Name Picker - 2-in-1 Tool',
    description: 'Random group generator + Student picker in one tool. Convenient for teachers!',
    type: 'website',
    images: ['/blog/chia-nhom-hoc-sinh.jpg'],
  },
  alternates: {
    canonical: 'https://sorokid.com/tool/chia-nhom-boc-tham',
  },
};

export default function ChiaNhomBocThamLayout({ children }) {
  return children;
}
