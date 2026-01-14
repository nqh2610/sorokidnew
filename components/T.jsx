'use client';

/**
 * 🌍 <T> - TRANSLATE COMPONENT
 * 
 * Component duy nhất để đa ngôn ngữ toàn bộ app.
 * Khi thêm ngôn ngữ mới, chỉ cần thêm vào dictionary JSON.
 * 
 * Usage:
 *   <T k="home.hero.title" />
 *   <T k="home.hero.title" as="h1" className="text-2xl" />
 *   <T k="common.login" /> 
 * 
 * Với HTML:
 *   <T k="home.description" html />
 */

import { useI18n } from '@/lib/i18n/I18nContext';

export default function T({ 
  k,           // dictionary key: "home.hero.title"
  as: Tag,     // optional: render as specific tag (h1, p, span, etc.)
  className,   // optional: CSS classes
  html,        // optional: render as HTML (dangerouslySetInnerHTML)
  fallback,    // optional: fallback text if key not found
  ...props     // other props passed to the tag
}) {
  const { t } = useI18n();
  
  const text = t(k) || fallback || k;
  
  // Nếu không có Tag và className, return text thuần
  if (!Tag && !className && !html) {
    return text;
  }
  
  // Default tag là span
  const Element = Tag || 'span';
  
  // Render HTML
  if (html) {
    return (
      <Element 
        className={className} 
        dangerouslySetInnerHTML={{ __html: text }}
        {...props}
      />
    );
  }
  
  // Render text
  return (
    <Element className={className} {...props}>
      {text}
    </Element>
  );
}

// Export thêm hook để dùng trong JS logic
export function useT() {
  const { t, locale } = useI18n();
  return { t, locale };
}
