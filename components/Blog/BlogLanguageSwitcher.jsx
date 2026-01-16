/**
 * 🌐 BLOG LANGUAGE SWITCHER
 * 
 * A compact language switcher for blog pages
 * - Shows flags for available languages
 * - Links to translated versions when available
 * - Hides/disables flag if no translation exists for post pages
 */

'use client';

import Link from 'next/link';

const FLAGS = {
  vi: { emoji: '🇻🇳', label: 'Tiếng Việt' },
  en: { emoji: '🇬🇧', label: 'English' },
};

export default function BlogLanguageSwitcher({ 
  currentLocale = 'vi',
  basePath = '/blog',
  currentSlug,
  viSlug,
  enSlug,
}) {
  // Check if we're on a post page (has currentSlug)
  const isPostPage = !!currentSlug;
  
  // For post pages: only show language if translation exists
  // For listing pages: always show both languages
  const hasViTranslation = isPostPage ? !!viSlug : true;
  const hasEnTranslation = isPostPage ? !!enSlug : true;
  
  // Determine the URLs for each language
  const getLocaleUrl = (targetLocale) => {
    if (targetLocale === currentLocale) return null;
    
    // For post pages with specific slugs
    if (isPostPage) {
      if (targetLocale === 'vi' && viSlug) {
        return `/blog/${viSlug}`;
      }
      if (targetLocale === 'en' && enSlug) {
        return `/en/blog/${enSlug}`;
      }
      // No translation available - return null (will hide/disable the flag)
      return null;
    }
    
    // For listing/category pages
    if (targetLocale === 'en') {
      return `/en${basePath}`;
    }
    return basePath;
  };

  const viUrl = getLocaleUrl('vi');
  const enUrl = getLocaleUrl('en');

  // Don't show switcher if only one language available on post page
  if (isPostPage && !hasViTranslation && currentLocale !== 'vi') return null;
  if (isPostPage && !hasEnTranslation && currentLocale !== 'en') return null;

  return (
    <div className="inline-flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 border border-gray-200 shadow-sm">
      {/* Vietnamese */}
      {currentLocale === 'vi' ? (
        <span className="w-8 h-8 flex items-center justify-center text-lg opacity-100" title={FLAGS.vi.label}>
          {FLAGS.vi.emoji}
        </span>
      ) : viUrl ? (
        <Link
          href={viUrl}
          className="w-8 h-8 flex items-center justify-center text-lg opacity-60 hover:opacity-100 transition-opacity"
          title={FLAGS.vi.label}
        >
          {FLAGS.vi.emoji}
        </Link>
      ) : hasViTranslation ? null : (
        // No VI translation - show disabled flag
        <span 
          className="w-8 h-8 flex items-center justify-center text-lg opacity-30 cursor-not-allowed" 
          title="Chưa có bản tiếng Việt"
        >
          {FLAGS.vi.emoji}
        </span>
      )}
      
      {/* Divider */}
      <span className="w-px h-5 bg-gray-200" />
      
      {/* English */}
      {currentLocale === 'en' ? (
        <span className="w-8 h-8 flex items-center justify-center text-lg opacity-100" title={FLAGS.en.label}>
          {FLAGS.en.emoji}
        </span>
      ) : enUrl ? (
        <Link
          href={enUrl}
          className="w-8 h-8 flex items-center justify-center text-lg opacity-60 hover:opacity-100 transition-opacity"
          title={FLAGS.en.label}
        >
          {FLAGS.en.emoji}
        </Link>
      ) : (
        // No EN translation - show disabled flag
        <span 
          className="w-8 h-8 flex items-center justify-center text-lg opacity-30 cursor-not-allowed" 
          title="No English version available"
        >
          {FLAGS.en.emoji}
        </span>
      )}
    </div>
  );
}
