# 🌍 HƯỚNG DẪN TRIỂN KHAI I18N + SEO ĐA NGÔN NGỮ - SOROKID

## Tổng Quan Kiến Trúc

```
lib/i18n/
├── config.js           # Cấu hình ngôn ngữ, path mapping
├── dictionary.js       # Lazy load dictionaries
├── dictionaries/
│   ├── vi.json        # Dictionary tiếng Việt
│   └── en.json        # Dictionary tiếng Anh
├── I18nContext.jsx    # React Context cho client
├── seo-keywords.js    # Mapping keyword VI ↔ EN
├── seo-generator.js   # Tạo metadata, JSON-LD, hreflang
└── index.js           # Export tất cả

components/
└── LanguageSwitcher/
    ├── LanguageSwitcher.jsx  # Component đổi ngôn ngữ
    └── index.js
```

---

## A. KIẾN TRÚC I18N TỐI ƯU

### 1. Nguyên tắc cốt lõi

✅ **Không URL prefix** cho ngôn ngữ mặc định (Vietnamese)
- `/` = Tiếng Việt (mặc định)
- `/en/` = Tiếng Anh

✅ **Không nhân đôi page/component**
- Cùng component, khác dictionary
- Dictionary lazy load theo ngôn ngữ

✅ **Detect tự động**
- Cookie > Accept-Language > Default
- Không gọi API, không DB

✅ **Switch không reload**
- Client-side switch với React Context
- Chỉ load dictionary mới

### 2. Flow hoạt động

```
User Request
     ↓
Middleware (detect locale)
     ↓
Set x-locale header + cookie
     ↓
Server Component (read header/cookie)
     ↓
Load dictionary (lazy)
     ↓
Render với translations
```

---

## B. CÁCH TÍCH HỢP VÀO LAYOUT

### 1. Root Layout (app/layout.jsx)

```jsx
import { cookies, headers } from 'next/headers';
import { I18nProvider, getDictionarySync, defaultLocale, LOCALE_COOKIE } from '@/lib/i18n';

export default async function RootLayout({ children }) {
  // Đọc locale từ cookie hoặc header
  const cookieStore = cookies();
  const headersList = headers();
  
  const locale = cookieStore.get(LOCALE_COOKIE)?.value 
    || headersList.get('x-locale') 
    || defaultLocale;
  
  // Load dictionary
  const dictionary = getDictionarySync(locale);
  
  return (
    <html lang={locale}>
      <body>
        <I18nProvider initialLocale={locale} dictionary={dictionary}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

### 2. Client Component sử dụng translations

```jsx
'use client';

import { useTranslation } from '@/lib/i18n';

export function MyComponent() {
  const { t, locale } = useTranslation();
  
  return (
    <div>
      <h1>{t('home.hero.title')}</h1>
      <p>{t('home.hero.description')}</p>
      <button>{t('common.startLearning')}</button>
    </div>
  );
}
```

### 3. Server Component sử dụng translations

```jsx
import { cookies } from 'next/headers';
import { getDictionarySync, LOCALE_COOKIE, defaultLocale } from '@/lib/i18n';

export default function ServerComponent() {
  const locale = cookies().get(LOCALE_COOKIE)?.value || defaultLocale;
  const dict = getDictionarySync(locale);
  
  return (
    <div>
      <h1>{dict.home.hero.title}</h1>
      <p>{dict.home.hero.description}</p>
    </div>
  );
}
```

### 4. Thêm Language Switcher vào Navigation

```jsx
import { LanguageSwitcher, LanguageFlags } from '@/components/LanguageSwitcher';

export function Navigation() {
  return (
    <nav>
      {/* ... other nav items */}
      <LanguageSwitcher />
      {/* hoặc */}
      <LanguageFlags />
    </nav>
  );
}
```

---

## C. SEO ĐA NGÔN NGỮ

### 1. generateMetadata trong page

```jsx
import { cookies } from 'next/headers';
import { generatePageMetadata, LOCALE_COOKIE, defaultLocale } from '@/lib/i18n';

export async function generateMetadata() {
  const locale = cookies().get(LOCALE_COOKIE)?.value || defaultLocale;
  return generatePageMetadata('home', locale);
}
```

### 2. JSON-LD Structured Data

```jsx
import { generateJsonLd, generateFaqSchema } from '@/lib/i18n';

export default function HomePage() {
  const locale = 'vi'; // hoặc lấy từ cookie
  
  const websiteSchema = generateJsonLd('WebSite', locale);
  const orgSchema = generateJsonLd('Organization', locale);
  const faqSchema = generateFaqSchema('home', locale);
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Page content */}
    </>
  );
}
```

### 3. Hreflang trong Head

```jsx
// Tự động được handle bởi generatePageMetadata
// Qua alternates.languages
```

---

## D. MAPPING KEYWORD VI ↔ EN

### Bảng Keyword Chính

| Tiếng Việt | Tiếng Anh |
|------------|-----------|
| ứng dụng học soroban | soroban learning app |
| app học soroban cho bé | soroban app for kids |
| toán tư duy | mental math |
| toán tư duy cho trẻ | mental math for kids |
| tính nhẩm nhanh | fast mental calculation |
| học soroban online | learn soroban online |
| học soroban tại nhà | learn soroban at home |
| phát triển tư duy | cognitive development |
| bàn tính soroban | japanese abacus |
| toolbox giáo viên | teacher toolbox |
| trò chơi lớp học | classroom games |
| chiếc nón kỳ diệu | spin wheel |
| ai là triệu phú | millionaire quiz |
| ô chữ | crossword |

### Sử dụng trong code

```jsx
import { translateKeyword, KEYWORD_MAPPING } from '@/lib/i18n';

// Dịch keyword
const enKeyword = translateKeyword('ứng dụng học soroban', 'en');
// → 'soroban learning app'

// Dịch ngược
const viKeyword = translateKeyword('mental math', 'vi');
// → 'toán tư duy'
```

---

## E. CHECKLIST TRIỂN KHAI

### Phase 1: Setup (Đã hoàn thành ✅)
- [x] Tạo cấu trúc thư mục i18n
- [x] Tạo config.js với locales
- [x] Tạo dictionaries (vi.json, en.json)
- [x] Tạo dictionary loader (lazy load)
- [x] Tạo I18nContext
- [x] Tạo LanguageSwitcher component
- [x] Cập nhật middleware detect locale
- [x] Tạo seo-keywords.js mapping
- [x] Tạo seo-generator.js
- [x] Cập nhật sitemap đa ngôn ngữ

### Phase 2: Integration (Cần làm)
- [ ] Thêm I18nProvider vào root layout
- [ ] Thêm LanguageSwitcher vào MainNav
- [ ] Cập nhật metadata các trang chính
- [ ] Thêm JSON-LD schemas
- [ ] Test với Google Search Console
- [ ] Test với Bing Webmaster

### Phase 3: Content (Dài hạn)
- [ ] Dịch thêm content cho dictionary
- [ ] Tạo blog version tiếng Anh (nếu cần)
- [ ] Mở rộng FAQ schema
- [ ] Theo dõi ranking SEO

---

## F. NHỮNG SAI LẦM PHẢI TRÁNH

### ❌ KHÔNG LÀM

1. **Nhân đôi page cho mỗi ngôn ngữ**
   - Sai: `/vi/home.jsx`, `/en/home.jsx`
   - Đúng: Dùng dictionary

2. **Lưu text trong database**
   - Sai: Query DB để lấy translations
   - Đúng: JSON dictionary, static import

3. **Dùng chung metadata cho 2 ngôn ngữ**
   - Sai: Cùng title/description
   - Đúng: SEO riêng biệt theo locale

4. **Load cả 2 ngôn ngữ cùng lúc**
   - Sai: import cả vi.json và en.json
   - Đúng: Lazy load theo locale

5. **Redirect khi detect ngôn ngữ**
   - Sai: Redirect /en → /vi nếu user VN
   - Đúng: Chỉ set cookie, không redirect

6. **Server-side render mỗi request**
   - Sai: Dynamic rendering cho text
   - Đúng: Static generation + ISR

7. **Dịch máy word-by-word**
   - Sai: "ứng dụng học soroban" → "application learn soroban"
   - Đúng: "soroban learning app" (theo search intent)

### ✅ NÊN LÀM

1. **Semantic SEO** - Tối ưu cho intent, không spam keyword
2. **Hreflang đầy đủ** - Cả 2 chiều vi→en, en→vi
3. **Canonical URL** - Tránh duplicate content
4. **Static generation** - Giảm server load
5. **Lazy load dictionary** - Tree-shake, giảm bundle
6. **Cookie-based preference** - Nhớ lựa chọn user

---

## G. TEST & VALIDATE

### 1. Test Middleware

```bash
# Test với Accept-Language: en
curl -H "Accept-Language: en-US,en;q=0.9" http://localhost:3000

# Check cookie được set
```

### 2. Test SEO

- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema Validator: https://validator.schema.org
- Hreflang Checker: https://technicalseo.com/tools/hreflang-tags-generator/

### 3. Test Performance

```bash
# Build và check bundle size
npm run build

# Kiểm tra không có 2 dictionary trong bundle
```

---

## H. KẾT QUẢ MONG ĐỢI

Sau khi triển khai đầy đủ:

✅ User Việt Nam → Thấy tiếng Việt (auto-detect từ browser)
✅ User nước ngoài → Thấy tiếng Anh
✅ User có thể switch ngôn ngữ (không reload)
✅ Google hiểu rõ 2 phiên bản qua hreflang
✅ Mỗi ngôn ngữ có SEO riêng (title, meta, schema)
✅ Không duplicate content
✅ Không phình bundle (lazy load)
✅ Không tăng process (static generation)
✅ Không tăng DB call (dictionary từ JSON)
✅ Không tăng server load (ISR + cache)

---

## I. RESOURCES

- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Google hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Schema.org](https://schema.org)
- [Google Search Console](https://search.google.com/search-console)
