'use client';

/**
 * 🌍 LANGUAGE SWITCHER COMPONENT
 * 
 * Toggle ngôn ngữ nhẹ nhàng:
 * - Không reload page
 * - Không gọi API
 * - Lưu cookie
 * - Animation smooth
 * - 🚀 Preload dictionary on hover (fast switch)
 * 
 * @version 2.0.0 - Thêm LanguageSelector dropdown hỗ trợ nhiều ngôn ngữ
 */

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n/I18nContext';
import { localeConfig } from '@/lib/i18n/config';
import { preloadOnHover } from '@/lib/i18n/preloadDictionary';

/**
 * Language Switcher - Compact Toggle Button
 * Hiển thị cờ và tên ngôn ngữ hiện tại
 * Click để đổi sang ngôn ngữ khác
 * 
 * ⚠️ CHỈ HIỂN THỊ Ở TRANG CHỦ - Ẩn ở các trang khác
 */
export function LanguageSwitcher({ className = '' }) {
  const { locale, toggleLocale, isLoading } = useI18n();
  const [isHomePage, setIsHomePage] = useState(false);
  const config = localeConfig[locale];
  const otherLocale = locale === 'vi' ? 'en' : 'vi';
  const otherConfig = localeConfig[otherLocale];
  
  // Chỉ hiển thị ở trang chủ
  useEffect(() => {
    const currentPath = window.location.pathname;
    setIsHomePage(currentPath === '/' || currentPath === '/en' || currentPath === '/en/');
  }, []);
  
  // Ẩn hoàn toàn nếu không phải trang chủ
  if (!isHomePage) return null;
  
  return (
    <button
      onClick={toggleLocale}
      onMouseEnter={() => preloadOnHover(otherLocale)}
      onFocus={() => preloadOnHover(otherLocale)}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1.5
        text-sm font-medium rounded-lg
        bg-gray-100 hover:bg-gray-200
        text-gray-700 hover:text-gray-900
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-wait
        ${className}
      `}
      title={`Switch to ${otherConfig.name}`}
      aria-label={`Current language: ${config.name}. Click to switch to ${otherConfig.name}`}
    >
      <span className="text-base" aria-hidden="true">{config.flag}</span>
      <span className="hidden sm:inline">{locale.toUpperCase()}</span>
      <svg 
        className="w-3.5 h-3.5 text-gray-400" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    </button>
  );
}

/**
 * Language Switcher - Dropdown Menu
 * Hiển thị tất cả ngôn ngữ có sẵn
 * 
 * ⚠️ CHỈ HIỂN THỊ Ở TRANG CHỦ - Ẩn ở các trang khác
 */
export function LanguageDropdown({ className = '' }) {
  const { locale, setLocale, locales, isLoading } = useI18n();
  const [isHomePage, setIsHomePage] = useState(false);
  
  // Chỉ hiển thị ở trang chủ
  useEffect(() => {
    const currentPath = window.location.pathname;
    setIsHomePage(currentPath === '/' || currentPath === '/en' || currentPath === '/en/');
  }, []);
  
  // Ẩn hoàn toàn nếu không phải trang chủ
  if (!isHomePage) return null;
  
  const handleChange = (e) => {
    setLocale(e.target.value);
  };
  
  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={locale}
        onChange={handleChange}
        disabled={isLoading}
        className="
          appearance-none
          px-3 py-2 pr-8
          text-sm font-medium
          bg-white border border-gray-200 rounded-lg
          text-gray-700
          hover:border-gray-300
          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-wait
          cursor-pointer
        "
        aria-label="Select language"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeConfig[loc].flag} {localeConfig[loc].name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Language Switcher - Icon Only
 * Chỉ hiển thị icon globe
 * 
 * ⚠️ CHỈ HIỂN THỊ Ở TRANG CHỦ - Ẩn ở các trang khác
 */
export function LanguageIcon({ className = '' }) {
  const { toggleLocale, locale, isLoading } = useI18n();
  const [isHomePage, setIsHomePage] = useState(false);
  const config = localeConfig[locale];
  const otherLocale = locale === 'vi' ? 'en' : 'vi';
  
  // Chỉ hiển thị ở trang chủ
  useEffect(() => {
    const currentPath = window.location.pathname;
    setIsHomePage(currentPath === '/' || currentPath === '/en' || currentPath === '/en/');
  }, []);
  
  // Ẩn hoàn toàn nếu không phải trang chủ
  if (!isHomePage) return null;
  
  return (
    <button
      onClick={toggleLocale}
      onMouseEnter={() => preloadOnHover(otherLocale)}
      onFocus={() => preloadOnHover(otherLocale)}
      disabled={isLoading}
      className={`
        p-2 rounded-full
        text-gray-600 hover:text-gray-900
        hover:bg-gray-100
        transition-all duration-200
        disabled:opacity-50
        ${className}
      `}
      title={`Language: ${config.name}`}
      aria-label={`Language: ${config.name}. Click to switch`}
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
    </button>
  );
}

/**
 * Language Switcher - Flag Toggle (Legacy - 2 ngôn ngữ)
 * @deprecated Use LanguageSelector for multi-language support
 * 
 * ⚠️ CHỈ HIỂN THỊ Ở TRANG CHỦ - Ẩn ở các trang khác
 */
export function LanguageFlags({ className = '' }) {
  const { locale, toggleLocale, isLoading } = useI18n();
  const [isHomePage, setIsHomePage] = useState(false);
  const otherLocale = locale === 'vi' ? 'en' : 'vi';
  
  // Chỉ hiển thị ở trang chủ
  useEffect(() => {
    const currentPath = window.location.pathname;
    setIsHomePage(currentPath === '/' || currentPath === '/en' || currentPath === '/en/');
  }, []);
  
  // Ẩn hoàn toàn nếu không phải trang chủ
  if (!isHomePage) return null;
  
  return (
    <button
      onClick={toggleLocale}
      onMouseEnter={() => preloadOnHover(otherLocale)}
      onFocus={() => preloadOnHover(otherLocale)}
      disabled={isLoading}
      className={`
        relative inline-flex items-center
        w-16 h-8
        bg-gray-100 rounded-full
        transition-all duration-300
        disabled:opacity-50
        ${className}
      `}
      aria-label={`Current: ${locale === 'vi' ? 'Vietnamese' : 'English'}. Click to switch.`}
    >
      {/* Background indicator */}
      <span 
        className={`
          absolute w-7 h-7 
          bg-white rounded-full shadow-sm
          transform transition-transform duration-300
          ${locale === 'vi' ? 'translate-x-0.5' : 'translate-x-8'}
        `}
      />
      
      {/* Flags */}
      <span className="relative z-10 flex items-center justify-around w-full px-1">
        <span 
          className={`text-lg transition-opacity ${locale === 'vi' ? 'opacity-100' : 'opacity-40'}`}
          aria-hidden="true"
        >
          🇻🇳
        </span>
        <span 
          className={`text-lg transition-opacity ${locale === 'en' ? 'opacity-100' : 'opacity-40'}`}
          aria-hidden="true"
        >
          🇺🇸
        </span>
      </span>
    </button>
  );
}

/**
 * 🌍 Language Selector - Dropdown hỗ trợ nhiều ngôn ngữ
 * Hiển thị cờ + tên ngôn ngữ hiện tại, click để mở dropdown chọn ngôn ngữ khác
 * Dễ dàng mở rộng thêm ngôn ngữ mới
 * 
 * ⚠️ CHỈ HIỂN THỊ Ở TRANG CHỦ - Ẩn ở các trang khác
 */
export function LanguageSelector({ className = '' }) {
  const { locale, setLocale, locales, isLoading } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);
  const dropdownRef = useRef(null);
  
  const currentConfig = localeConfig[locale];
  
  // Chỉ hiển thị ở trang chủ
  useEffect(() => {
    const currentPath = window.location.pathname;
    setIsHomePage(currentPath === '/' || currentPath === '/en' || currentPath === '/en/');
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Ẩn hoàn toàn nếu không phải trang chủ
  if (!isHomePage) return null;
  
  const handleSelectLocale = (newLocale) => {
    if (newLocale !== locale) {
      setLocale(newLocale);
    }
    setIsOpen(false);
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Current Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`
          inline-flex items-center gap-1.5 px-2 py-1.5
          text-sm font-medium rounded-lg
          bg-gray-100 hover:bg-gray-200
          text-gray-700 hover:text-gray-900
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-wait
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Language: ${currentConfig.name}`}
      >
        <span className="text-base">{currentConfig.flag}</span>
        <span className="hidden sm:inline text-xs">{locale.toUpperCase()}</span>
        <svg 
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-1 w-40 py-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          role="listbox"
          aria-label="Select language"
        >
          {locales.map((loc) => {
            const config = localeConfig[loc];
            const isSelected = loc === locale;
            
            return (
              <button
                key={loc}
                onClick={() => handleSelectLocale(loc)}
                onMouseEnter={() => !isSelected && preloadOnHover(loc)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-sm
                  transition-colors duration-150
                  ${isSelected 
                    ? 'bg-violet-50 text-violet-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                role="option"
                aria-selected={isSelected}
              >
                <span className="text-base">{config.flag}</span>
                <span>{config.name}</span>
                {isSelected && (
                  <svg className="w-4 h-4 ml-auto text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
