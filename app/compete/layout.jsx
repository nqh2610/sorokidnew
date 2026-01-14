/**
 * 🏆 COMPETE LAYOUT
 * 
 * ⚠️ NOTE: This page REQUIRES LOGIN
 * - NOT indexed on Google
 * - NOT included in sitemap
 */

export const metadata = {
  title: 'Soroban Competition | Sorokid',
  description: 'Compete and rank in Soroban.',
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
