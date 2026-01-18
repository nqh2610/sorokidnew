/**
 * 🎯 ROUTE-BASED TRANSLATIONS HOOK
 * 
 * Hook để load chỉ những namespace cần thiết cho mỗi route,
 * thay vì load toàn bộ dictionary
 * 
 * Ưu điểm:
 * - Giảm bundle size cho mỗi page
 * - Faster First Contentful Paint
 * - Tốt cho mobile & slow connections
 * 
 * Usage:
 * const { t, isReady, loadNamespace } = useRouteTranslations(['learn', 'common']);
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useI18n } from '../I18nContext';

// Cache cho lazy-loaded namespaces
const namespaceCache = new Map();

/**
 * Lazy load namespace từ modular files
 */
async function loadNamespaceData(locale, namespace) {
  const cacheKey = `${locale}:${namespace}`;
  
  if (namespaceCache.has(cacheKey)) {
    return namespaceCache.get(cacheKey);
  }

  try {
    // Dynamic import từ modular files
    const module = await import(`../dictionaries/${locale}/${namespace}.json`);
    const data = module.default || module;
    namespaceCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.warn(`[i18n] Failed to load namespace: ${locale}/${namespace}`, error);
    return {};
  }
}

/**
 * Hook chính
 */
export function useRouteTranslations(namespaces = ['common']) {
  const { locale, dictionary } = useI18n();
  const [extraData, setExtraData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadedNamespaces, setLoadedNamespaces] = useState(new Set(['common']));

  // Load namespaces on mount hoặc khi locale thay đổi
  useEffect(() => {
    let cancelled = false;
    
    async function loadNamespaces() {
      const namespacesToLoad = namespaces.filter(ns => !loadedNamespaces.has(ns));
      
      if (namespacesToLoad.length === 0) return;
      
      setIsLoading(true);
      
      try {
        const results = await Promise.all(
          namespacesToLoad.map(ns => loadNamespaceData(locale, ns))
        );
        
        if (cancelled) return;
        
        const newData = {};
        namespacesToLoad.forEach((ns, idx) => {
          Object.assign(newData, results[idx]);
        });
        
        setExtraData(prev => ({ ...prev, ...newData }));
        setLoadedNamespaces(prev => {
          const next = new Set(prev);
          namespacesToLoad.forEach(ns => next.add(ns));
          return next;
        });
      } catch (error) {
        console.error('[i18n] Error loading namespaces:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    
    loadNamespaces();
    
    return () => { cancelled = true; };
  }, [locale, namespaces.join(',')]);

  // Merge dictionary với extra data
  const mergedDictionary = useMemo(() => ({
    ...dictionary,
    ...extraData,
  }), [dictionary, extraData]);

  // Translation function
  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = mergedDictionary;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    if (value === undefined) {
      return key; // Return key if not found
    }
    
    // Replace params {name} -> value
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (_, paramKey) => 
        params[paramKey] !== undefined ? params[paramKey] : `{${paramKey}}`
      );
    }
    
    return value;
  }, [mergedDictionary]);

  // Manually load a namespace
  const loadNamespace = useCallback(async (namespace) => {
    if (loadedNamespaces.has(namespace)) return;
    
    setIsLoading(true);
    const data = await loadNamespaceData(locale, namespace);
    setExtraData(prev => ({ ...prev, ...data }));
    setLoadedNamespaces(prev => {
      const next = new Set(prev);
      next.add(namespace);
      return next;
    });
    setIsLoading(false);
  }, [locale, loadedNamespaces]);

  return {
    t,
    locale,
    isLoading,
    isReady: !isLoading,
    loadedNamespaces: Array.from(loadedNamespaces),
    loadNamespace,
  };
}

/**
 * Preload namespaces khi hover một link
 */
export function preloadNamespaces(locale, namespaces) {
  namespaces.forEach(ns => {
    const cacheKey = `${locale}:${ns}`;
    if (!namespaceCache.has(cacheKey)) {
      // Fire and forget - không cần await
      loadNamespaceData(locale, ns);
    }
  });
}

/**
 * Clear cache (for testing or memory management)
 */
export function clearNamespaceCache() {
  namespaceCache.clear();
}

export default useRouteTranslations;
