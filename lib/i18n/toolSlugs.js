/**
 * 🌍 Tool URL Slug Mapping for i18n
 * 
 * Vietnamese slugs are the actual folder names (already indexed by Google)
 * English slugs are SEO-friendly alternatives for /en/ URLs
 */

// English slug → Vietnamese slug (folder name)
export const TOOL_SLUG_EN_TO_VI = {
  'who-wants-to-be-millionaire': 'ai-la-trieu-phu',
  'soroban-abacus': 'ban-tinh-soroban',
  'random-picker': 'boc-tham',
  'group-divider': 'chia-nhom',
  'group-random-picker': 'chia-nhom-boc-tham',
  'magic-hat': 'chiec-non-ky-dieu',
  'adventure-race': 'cuoc-dua-ki-thu',
  'lucky-light': 'den-may-man',
  'stopwatch': 'dong-ho-bam-gio',
  'animal-race': 'dua-thu-hoat-hinh',
  'flash-anzan': 'flash-zan',
  'crossword': 'o-chu',
  'dice-roller': 'xuc-xac',
};

// Vietnamese slug → English slug
export const TOOL_SLUG_VI_TO_EN = Object.fromEntries(
  Object.entries(TOOL_SLUG_EN_TO_VI).map(([en, vi]) => [vi, en])
);

/**
 * Get tool URL based on locale
 * @param {string} viSlug - Vietnamese slug (folder name)
 * @param {string} locale - Current locale ('vi' or 'en')
 * @returns {string} - Full tool URL path
 */
export function getToolUrl(viSlug, locale = 'vi') {
  if (locale === 'en') {
    const enSlug = TOOL_SLUG_VI_TO_EN[viSlug] || viSlug;
    return `/en/tool/${enSlug}`;
  }
  return `/tool/${viSlug}`;
}

/**
 * Get all tool slugs for a given locale
 * @param {string} locale - Current locale
 * @returns {Object} - Map of viSlug → localizedSlug
 */
export function getLocalizedToolSlugs(locale = 'vi') {
  if (locale === 'en') {
    return TOOL_SLUG_VI_TO_EN;
  }
  // Vietnamese: slug = folder name
  return Object.fromEntries(
    Object.keys(TOOL_SLUG_VI_TO_EN).map(viSlug => [viSlug, viSlug])
  );
}
