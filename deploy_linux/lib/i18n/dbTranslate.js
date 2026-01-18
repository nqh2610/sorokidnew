/**
 * 🌍 DATABASE TRANSLATION HELPER
 * 
 * Translate database records using dictionary (zero DB overhead)
 * 
 * Ưu điểm:
 * - Zero database change
 * - Zero query overhead  
 * - Cache-friendly (dictionary bundled)
 * - Easy to maintain (edit JSON file)
 * - Easy to extend (add new locale = add JSON file)
 * 
 * @version 1.0.0
 */

/**
 * Get translation from dictionary for a database record
 * 
 * @param {Object} dict - Full dictionary object
 * @param {string} table - Table name (e.g., 'lessons', 'levels', 'quests')
 * @param {string|number} id - Record ID
 * @param {string} field - Field name to translate
 * @returns {string|null} Translated value or null if not found
 */
export function getDbTranslation(dict, table, id, field) {
  return dict?.db?.[table]?.[id]?.[field] || null;
}

/**
 * 🌍 Translate a single database record
 * 
 * @param {Object} record - Database record
 * @param {Object} dict - Dictionary object (from useI18n or import)
 * @param {string} locale - Current locale ('vi' | 'en')
 * @param {string} table - Table name for lookup
 * @param {string[]} fields - Fields to translate (default: ['title', 'description', 'name'])
 * @param {string} idField - Field to use as ID (default: 'id')
 * @returns {Object} Record with translated fields (fallback to original if no translation)
 * 
 * @example
 * const lesson = await prisma.lesson.findUnique({ where: { id: 'abc' } });
 * const translated = translateRecord(lesson, dict, 'en', 'lessons');
 * // lesson.title = "Introduction to Soroban" (if translation exists)
 */
export function translateRecord(record, dict, locale, table, fields = ['title', 'description', 'name'], idField = 'id') {
  // Null check
  if (!record) return record;
  
  // Vietnamese = original data, no translation needed
  if (locale === 'vi') return record;
  
  // No dictionary = fallback to original
  if (!dict?.db?.[table]) return record;
  
  // Get record ID
  const id = record[idField];
  if (!id) return record;
  
  // Get translations for this record
  const translations = dict.db[table][id];
  if (!translations) return record;
  
  // Merge translations (only override if translation exists)
  const translated = { ...record };
  for (const field of fields) {
    if (translations[field]) {
      translated[field] = translations[field];
    }
    // If no translation for this field, keep original (smart fallback)
  }
  
  return translated;
}

/**
 * 🌍 Translate array of database records
 * 
 * @param {Object[]} records - Array of database records
 * @param {Object} dict - Dictionary object
 * @param {string} locale - Current locale
 * @param {string} table - Table name for lookup
 * @param {string[]} fields - Fields to translate
 * @param {string} idField - Field to use as ID
 * @returns {Object[]} Array of translated records
 * 
 * @example
 * const lessons = await prisma.lesson.findMany();
 * const translated = translateRecords(lessons, dict, 'en', 'lessons');
 */
export function translateRecords(records, dict, locale, table, fields = ['title', 'description', 'name'], idField = 'id') {
  if (!records?.length) return records;
  if (locale === 'vi') return records; // Short-circuit for Vietnamese
  
  return records.map(record => 
    translateRecord(record, dict, locale, table, fields, idField)
  );
}

/**
 * 🌍 Translate with levelId as lookup key (for lessons)
 * Some tables use composite keys like levelId + lessonId
 * 
 * @param {Object} record - Lesson record
 * @param {Object} dict - Dictionary object
 * @param {string} locale - Current locale
 * @returns {Object} Translated lesson
 * 
 * @example
 * // Dictionary structure:
 * // db.lessons["1-1"] = { title: "...", description: "..." }
 * // where "1-1" = levelId-lessonId
 */
export function translateLesson(record, dict, locale) {
  if (!record || locale === 'vi') return record;
  
  // Composite key: levelId-lessonId
  const key = `${record.levelId}-${record.lessonId}`;
  const translations = dict?.db?.lessons?.[key];
  
  if (!translations) return record;
  
  return {
    ...record,
    title: translations.title || record.title,
    description: translations.description || record.description,
    content: translations.content || record.content,
  };
}

/**
 * 🌍 Translate array of lessons
 */
export function translateLessons(records, dict, locale) {
  if (!records?.length || locale === 'vi') return records;
  return records.map(record => translateLesson(record, dict, locale));
}

/**
 * 🌍 HOC/Wrapper for Server Components
 * Pre-translate data before passing to client
 * 
 * @param {Function} fetcher - Async function that returns data
 * @param {Object} options - Translation options
 * @returns {Function} Wrapped fetcher that returns translated data
 * 
 * @example
 * const getTranslatedLessons = withTranslation(
 *   () => getCachedLessons(levelId),
 *   { table: 'lessons', locale: 'en' }
 * );
 */
export function withTranslation(fetcher, { dict, locale, table, fields, idField }) {
  return async (...args) => {
    const data = await fetcher(...args);
    
    if (Array.isArray(data)) {
      return translateRecords(data, dict, locale, table, fields, idField);
    }
    
    return translateRecord(data, dict, locale, table, fields, idField);
  };
}

/**
 * 🎯 Quick translate helper for common tables
 * Use in Server Components with imported dictionary
 */
export const dbTranslate = {
  levels: (records, dict, locale) => 
    translateRecords(records, dict, locale, 'levels', ['name', 'description']),
  
  lessons: (records, dict, locale) => 
    translateLessons(records, dict, locale),
  
  quests: (records, dict, locale) => 
    translateRecords(records, dict, locale, 'quests', ['title', 'description']),
  
  achievements: (records, dict, locale) => 
    translateRecords(records, dict, locale, 'achievements', ['name', 'description']),
  
  shopItems: (records, dict, locale) => 
    translateRecords(records, dict, locale, 'shopItems', ['name', 'description']),
};

export default dbTranslate;
