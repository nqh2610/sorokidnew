/**
 * 🌍 GET LOCALE - Server-side helper
 * 
 * Lấy locale từ cookie cho Server Components
 * Không import heavy modules
 * 
 * @version 1.0.0
 */

import { cookies } from 'next/headers';
import { LOCALE_COOKIE, defaultLocale, locales } from './config';

/**
 * Lấy locale hiện tại từ cookie (Server Component)
 * @returns {Promise<string>} locale code ('vi' hoặc 'en')
 */
export async function getLocale() {
  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
    
    if (localeCookie && locales.includes(localeCookie)) {
      return localeCookie;
    }
  } catch (e) {
    // Ignore cookie errors
  }
  
  return defaultLocale;
}

/**
 * Lấy locale đồng bộ (cho generateMetadata)
 * @returns {string} locale code
 */
export function getLocaleSync() {
  // Trong server context, dùng async version
  // Đây là fallback
  return defaultLocale;
}
