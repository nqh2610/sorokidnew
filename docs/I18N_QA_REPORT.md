# 🔍 QA REPORT - HỆ THỐNG ĐA NGÔN NGỮ (i18n)

**Ngày kiểm tra:** Auto-generated
**Phiên bản:** 1.0.0
**Tác giả:** QA Bot

---

## 📋 TỔNG QUAN HỆ THỐNG

### Kiến trúc i18n
- **Phương thức:** Cookie-based (KHÔNG phải URL prefix)
- **Locales hỗ trợ:** `vi` (Vietnamese - default), `en` (English)
- **Cookie name:** `sorokid_locale`
- **Cookie max-age:** 365 ngày

### Files chính
| File | Chức năng |
|------|-----------|
| `lib/i18n/config.js` | Cấu hình locale, path mapping |
| `lib/i18n/dictionary.js` | Lazy load dictionaries |
| `lib/i18n/dictionaries/vi.json` | Từ điển tiếng Việt |
| `lib/i18n/dictionaries/en.json` | Từ điển tiếng Anh |
| `lib/i18n/I18nContext.jsx` | React Context, hooks |
| `lib/i18n/get-locale.js` | Server-side helper |
| `lib/i18n/seo-generator.js` | SEO metadata generator |
| `lib/i18n/seo-keywords.js` | Keyword mapping VI↔EN |
| `middleware.js` | Language detection middleware |
| `app/sitemap.js` | Dynamic multilingual sitemap |
| `components/LanguageSwitcher/` | UI components |

---

## ✅ ĐÃ SỬA (FIXED)

### 🔴 Critical Bugs

| ID | Bug | Giải pháp | File |
|----|-----|-----------|------|
| C1 | Sitemap tạo URLs `/en/*` không tồn tại | Xóa fake URLs, dùng hreflang đúng cách | `app/sitemap.js` |
| C2 | Metadata static, không đổi theo language | Chuyển sang `generateMetadata()` async | `app/layout.jsx` |
| C4 | `useI18n()` crash khi không có Provider | Thêm safe fallback object | `lib/i18n/I18nContext.jsx` |

### 🟡 Medium Bugs

| ID | Bug | Giải pháp | File |
|----|-----|-----------|------|
| M4 | Infinite re-render trong useEffect | Xóa `dict` khỏi dependency array | `lib/i18n/I18nContext.jsx` |

---

## 🧪 KIỂM TRA THỦ CÔNG (Manual Testing Checklist)

### 1. Language Detection

- [ ] **First visit (no cookie):** Browser Accept-Language = vi → UI tiếng Việt
- [ ] **First visit (no cookie):** Browser Accept-Language = en → UI tiếng Anh
- [ ] **Return visit:** Cookie đã set → giữ nguyên ngôn ngữ đã chọn
- [ ] **Cookie không hợp lệ:** Fallback về `vi`

### 2. Language Switching

- [ ] Click LanguageFlags toggle → đổi ngôn ngữ KHÔNG reload
- [ ] UI update ngay lập tức (text đổi theo)
- [ ] Cookie được set đúng giá trị
- [ ] Console không có lỗi/warning

### 3. SEO & Metadata

- [ ] **View source trang chủ (vi):** `<html lang="vi">`
- [ ] **View source trang chủ (en):** `<html lang="en">` 
- [ ] Meta title đổi theo ngôn ngữ
- [ ] Meta description đổi theo ngôn ngữ
- [ ] OpenGraph tags đúng ngôn ngữ
- [ ] hreflang tags có đầy đủ (vi-VN, en-US, x-default)

### 4. Pages Testing

| Page | Vietnamese | English |
|------|------------|---------|
| `/` (Home) | ✅ Test | ✅ Test |
| `/blog` | ✅ Test | ✅ Test |
| `/tool` | ✅ Test | ✅ Test |
| `/tool/spin-wheel` | ✅ Test | ✅ Test |
| `/pricing` | ✅ Test | ✅ Test |
| `/login` | ✅ Test | ✅ Test |
| `/register` | ✅ Test | ✅ Test |
| `/learn` | ✅ Test | ✅ Test |
| `/dashboard` | ✅ Test | ✅ Test |

### 5. Components Testing

- [ ] `MainNav` hiển thị LanguageFlags toggle
- [ ] `LanguageSwitcher` toggle hoạt động
- [ ] `LanguageDropdown` select hoạt động
- [ ] `LanguageIcon` button hoạt động
- [ ] `LanguageFlags` flag toggle hoạt động

### 6. Edge Cases

- [ ] Refresh page → giữ nguyên ngôn ngữ
- [ ] Navigate giữa các page → giữ nguyên ngôn ngữ
- [ ] Clear cookies → auto-detect từ browser
- [ ] Incognito mode → auto-detect từ browser
- [ ] Mobile browser → responsive UI

---

## ⚠️ KNOWN LIMITATIONS

### 1. Hydration Mismatch Potential
- **Issue:** Server render với locale từ cookie, nhưng client có thể khác nếu cookie thay đổi
- **Mitigation:** I18nContext sync `initialLocale` khi mount
- **Risk:** Low - chỉ xảy ra nếu user đổi cookie thủ công

### 2. Hardcoded Vietnamese Text
- **Issue:** Một số page components có text hardcoded tiếng Việt
- **Recommendation:** Dần chuyển sang dùng `t()` function
- **Priority:** Low - không ảnh hưởng chức năng

### 3. Dynamic Content
- **Issue:** Blog posts, tool descriptions từ database chưa đa ngôn ngữ
- **Recommendation:** Phase 2 - thêm trường `content_en` trong DB
- **Priority:** Medium

---

## 🚀 USAGE GUIDE

### Trong Client Components
```jsx
'use client';
import { useI18n } from '@/lib/i18n/I18nContext';

export function MyComponent() {
  const { t, locale, toggleLocale } = useI18n();
  
  return (
    <div>
      <p>{t('home.hero.title')}</p>
      <button onClick={toggleLocale}>
        {locale === 'vi' ? '🇻🇳' : '🇺🇸'}
      </button>
    </div>
  );
}
```

### Trong Server Components
```jsx
import { getLocale } from '@/lib/i18n/get-locale';
import { getDictionarySync } from '@/lib/i18n/dictionary';

export default async function ServerPage() {
  const locale = await getLocale();
  const dict = getDictionarySync(locale);
  
  return <h1>{dict.home?.hero?.title}</h1>;
}
```

### Thêm Translation Key Mới
1. Edit `lib/i18n/dictionaries/vi.json`
2. Edit `lib/i18n/dictionaries/en.json`
3. Sử dụng `t('path.to.key')` trong component

---

## 📊 TEST RESULTS SUMMARY

| Category | Passed | Failed | Skipped |
|----------|--------|--------|---------|
| Critical Bugs | 3/3 | 0 | 0 |
| Medium Bugs | 1/1 | 0 | 0 |
| Manual Tests | TBD | TBD | TBD |

**Overall Status:** ✅ **READY FOR TESTING**

---

## 📝 CHANGELOG

### v1.0.0 (Initial)
- Implemented cookie-based i18n system
- Created Vietnamese & English dictionaries
- Added language switcher components
- Fixed infinite re-render bug
- Fixed sitemap fake URLs
- Converted static metadata to dynamic generateMetadata()
- Added safe fallback for useI18n() hook
