/**
 * 📝 BLOG LAYOUT (VI)
 * 
 * Sử dụng BlogLayoutWrapper component dùng chung
 * Tự động detect locale từ I18nContext
 */

import BlogLayoutWrapper from '@/components/Blog/BlogLayoutWrapper';

export default function BlogLayout({ children }) {
  return <BlogLayoutWrapper>{children}</BlogLayoutWrapper>;
}
