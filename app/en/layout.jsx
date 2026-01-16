/**
 * 🌍 ENGLISH ROUTES LAYOUT
 * 
 * Layout cho tất cả routes tiếng Anh (/en/*)
 * - Tự động wrap BlogLayoutWrapper cho /en/blog/*
 * - Passthrough cho các routes khác
 */

'use client';

import { usePathname } from 'next/navigation';
import BlogLayoutWrapper from '@/components/Blog/BlogLayoutWrapper';

export default function EnglishLayout({ children }) {
  const pathname = usePathname();
  
  // Nếu là blog route, wrap với BlogLayoutWrapper
  if (pathname?.startsWith('/en/blog')) {
    return <BlogLayoutWrapper>{children}</BlogLayoutWrapper>;
  }
  
  return children;
}
