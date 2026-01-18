/**
 * 🌍 I18N INDEX - EXPORT ALL
 * 
 * Export tất cả i18n utilities:
 * - Config
 * - Dictionary loader
 * - Context & hooks
 * - SEO generator
 * - Keywords
 * - Preload utilities
 * - Route-based translations
 * 
 * @version 1.1.0 - Added preload & route translations
 */

// Config
export {
  locales,
  defaultLocale,
  LOCALE_COOKIE,
  COOKIE_MAX_AGE,
  localeConfig,
  pathMappings,
  reversePathMappings,
  getLocalizedPath,
  getCanonicalPath,
  isPublicPath,
  detectLocaleFromHeader,
} from './config';

// Dictionary
export {
  getDictionary,
  getDictionarySync,
  translate,
  createTranslator,
} from './dictionary';

// Context & Hooks
export {
  I18nProvider,
  useI18n,
  useTranslation,
  useLocaleConfig,
} from './I18nContext';

// Route-based translations (lazy loading)
export {
  useRouteTranslations,
  preloadNamespaces,
  clearNamespaceCache,
} from './hooks/useRouteTranslations';

// Preload utilities
export {
  preloadDictionary,
  preloadAllDictionaries,
  isDictionaryPreloaded,
  preloadOnHover,
} from './preloadDictionary';

// SEO Generator
export {
  generatePageMetadata,
  generateHreflangLinks,
  generateJsonLd,
  generateFaqSchema,
  generateBreadcrumbSchema,
  seoGenerator,
} from './seo-generator';

// Keywords
export {
  BRAND_KEYWORDS,
  PRIMARY_KEYWORDS,
  LONGTAIL_KEYWORDS,
  TOOLBOX_KEYWORDS,
  COMPETITIVE_KEYWORDS,
  KEYWORD_MAPPING,
  REVERSE_KEYWORD_MAPPING,
  getKeywordsByLocale,
  getAllKeywords,
  translateKeyword,
} from './seo-keywords';
