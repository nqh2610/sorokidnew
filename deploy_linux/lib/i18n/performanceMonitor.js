/**
 * 📊 I18N PERFORMANCE MONITOR
 * 
 * Theo dõi và log hiệu suất của hệ thống i18n:
 * - Dictionary load time
 * - Translation lookup time
 * - Cache hit/miss ratio
 * 
 * Chỉ active trong development mode
 */

const isDev = process.env.NODE_ENV === 'development';

// Metrics storage
const metrics = {
  dictionaryLoads: [],
  translationLookups: [],
  cacheHits: 0,
  cacheMisses: 0,
  namespaceLoads: new Map(),
};

/**
 * 🕐 Đo thời gian load dictionary
 */
export function trackDictionaryLoad(locale, durationMs, fromCache = false) {
  if (!isDev) return;
  
  metrics.dictionaryLoads.push({
    locale,
    duration: durationMs,
    fromCache,
    timestamp: Date.now(),
  });
  
  if (fromCache) {
    metrics.cacheHits++;
  } else {
    metrics.cacheMisses++;
  }
  
  console.log(
    `%c[i18n] 📚 Dictionary loaded: ${locale}`,
    'color: #10B981',
    `| ${durationMs.toFixed(2)}ms`,
    fromCache ? '(cached)' : '(fresh)'
  );
}

/**
 * 🔍 Đo thời gian namespace load
 */
export function trackNamespaceLoad(locale, namespace, durationMs) {
  if (!isDev) return;
  
  const key = `${locale}:${namespace}`;
  const existing = metrics.namespaceLoads.get(key) || [];
  existing.push({ duration: durationMs, timestamp: Date.now() });
  metrics.namespaceLoads.set(key, existing);
  
  console.log(
    `%c[i18n] 📦 Namespace loaded: ${locale}/${namespace}`,
    'color: #3B82F6',
    `| ${durationMs.toFixed(2)}ms`
  );
}

/**
 * 🔄 Track translation lookup (sample rate to avoid performance impact)
 */
const SAMPLE_RATE = 0.01; // 1% of lookups
let lookupCount = 0;

export function trackTranslationLookup(key, found, durationMs) {
  if (!isDev) return;
  
  lookupCount++;
  
  // Only track 1% of lookups to minimize overhead
  if (Math.random() > SAMPLE_RATE) return;
  
  metrics.translationLookups.push({
    key,
    found,
    duration: durationMs,
    timestamp: Date.now(),
  });
}

/**
 * 📈 Lấy summary metrics
 */
export function getMetricsSummary() {
  if (!isDev) return null;
  
  const dictionaryStats = {
    totalLoads: metrics.dictionaryLoads.length,
    avgLoadTime: metrics.dictionaryLoads.length > 0
      ? metrics.dictionaryLoads.reduce((sum, m) => sum + m.duration, 0) / metrics.dictionaryLoads.length
      : 0,
    cacheHitRate: metrics.cacheHits + metrics.cacheMisses > 0
      ? (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) * 100).toFixed(1)
      : 0,
  };
  
  const lookupStats = {
    sampledLookups: metrics.translationLookups.length,
    estimatedTotal: lookupCount,
    avgLookupTime: metrics.translationLookups.length > 0
      ? metrics.translationLookups.reduce((sum, m) => sum + m.duration, 0) / metrics.translationLookups.length
      : 0,
    missingKeys: metrics.translationLookups.filter(m => !m.found).map(m => m.key),
  };
  
  const namespaceStats = {};
  metrics.namespaceLoads.forEach((loads, key) => {
    namespaceStats[key] = {
      loadCount: loads.length,
      avgLoadTime: loads.reduce((sum, l) => sum + l.duration, 0) / loads.length,
    };
  });
  
  return {
    dictionary: dictionaryStats,
    lookups: lookupStats,
    namespaces: namespaceStats,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 📊 In metrics summary ra console
 */
export function logMetricsSummary() {
  if (!isDev) return;
  
  const summary = getMetricsSummary();
  if (!summary) return;
  
  console.group('%c[i18n] 📊 Performance Summary', 'color: #8B5CF6; font-weight: bold');
  
  console.log('📚 Dictionary Loads:');
  console.table({
    'Total Loads': summary.dictionary.totalLoads,
    'Avg Load Time': `${summary.dictionary.avgLoadTime.toFixed(2)}ms`,
    'Cache Hit Rate': `${summary.dictionary.cacheHitRate}%`,
  });
  
  console.log('🔍 Translation Lookups:');
  console.table({
    'Sampled Lookups': summary.lookups.sampledLookups,
    'Estimated Total': summary.lookups.estimatedTotal,
    'Avg Lookup Time': `${(summary.lookups.avgLookupTime * 1000).toFixed(3)}µs`,
  });
  
  if (summary.lookups.missingKeys.length > 0) {
    console.warn('⚠️ Missing Keys:', summary.lookups.missingKeys);
  }
  
  if (Object.keys(summary.namespaces).length > 0) {
    console.log('📦 Namespace Loads:');
    console.table(summary.namespaces);
  }
  
  console.groupEnd();
}

/**
 * 🔄 Reset metrics
 */
export function resetMetrics() {
  metrics.dictionaryLoads = [];
  metrics.translationLookups = [];
  metrics.cacheHits = 0;
  metrics.cacheMisses = 0;
  metrics.namespaceLoads.clear();
  lookupCount = 0;
}

/**
 * 🎯 Wrapper để measure function execution time
 */
export function measureTime(fn, label = 'Operation') {
  return async (...args) => {
    const start = performance.now();
    try {
      return await fn(...args);
    } finally {
      const duration = performance.now() - start;
      if (isDev) {
        console.log(`%c[i18n] ⏱️ ${label}`, 'color: #F59E0B', `| ${duration.toFixed(2)}ms`);
      }
    }
  };
}

// Auto log summary every 60 seconds in dev
if (typeof window !== 'undefined' && isDev) {
  setInterval(() => {
    if (metrics.dictionaryLoads.length > 0 || lookupCount > 1000) {
      logMetricsSummary();
    }
  }, 60000);
}

export default {
  trackDictionaryLoad,
  trackNamespaceLoad,
  trackTranslationLookup,
  getMetricsSummary,
  logMetricsSummary,
  resetMetrics,
  measureTime,
};
