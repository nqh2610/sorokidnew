# 📁 NAMESPACE SCHEMA - I18N MODULAR ARCHITECTURE

## 🎯 Mục tiêu
- Tách dictionary lớn thành modules nhỏ
- Lazy load theo route (giảm bundle size)
- Dễ maintain, dễ sync giữa các ngôn ngữ
- Type-safe với TypeScript

---

## 📂 Cấu trúc thư mục

```
lib/i18n/dictionaries/
├── vi/                          # Vietnamese (SOURCE OF TRUTH)
│   ├── common.json              # UI chung, nav, buttons
│   ├── home.json                # Trang chủ
│   ├── auth.json                # Login, register, errors
│   ├── dashboard.json           # Dashboard user
│   ├── learn.json               # Trang học (UI)
│   ├── lesson-content.json      # Nội dung bài học (theory/practice) - CORE
│   ├── practice.json            # Trang luyện tập
│   ├── compete.json             # Trang thi đấu
│   ├── adventure.json           # Game phiêu lưu - CORE
│   ├── certificate.json         # Chứng chỉ - CORE
│   ├── pricing.json             # Bảng giá, payment
│   ├── tools.json               # Toolbox (dice, groupPicker, etc)
│   ├── profile.json             # Profile, leaderboard
│   ├── admin.json               # Admin panel
│   ├── components.json          # Shared components (topbar, footer, etc)
│   └── seo.json                 # SEO metadata
│
├── en/                          # English (same structure)
│   └── ...
│
└── _schema.js                   # Namespace mapping & route config
```

---

## 🗂️ Phân bổ namespaces từ vi.json hiện tại

### 1. `common.json` (~100 keys)
- `common.*` (lines 2-42)
- `avatar.*` (lines 43-49)
- `errors.*` (lines 984-997)
- `errorBoundary.*` (lines 2587-2594)
- `toast.*` (lines 2595-2600)

### 2. `home.json` (~200 keys)
- `home.*` (lines 77-229)

### 3. `auth.json` (~150 keys)
- `auth.*` (lines 2177-2323)
- `trial.*` (lines 2534-2548)
- `upgrade.*` (lines 2549-2586)

### 4. `dashboard.json` (~300 keys)
- `dashboard.*` (lines 998-1288)

### 5. `learn.json` (~200 keys)
- `learn.*` (lines 1289-1459)

### 6. `lesson-content.json` (~500 keys) ⭐ CORE
- `db.lessonContent.*` (lines 2830-2991)
- `db.lessons.*` (từ en.json)

### 7. `practice.json` (~200 keys)
- `practiceScreen.*` (lines 1460-1659)

### 8. `compete.json` (~250 keys)
- `competeScreen.*` (lines 1660-1898)

### 9. `adventure.json` (~300 keys) ⭐ CORE
- `adventureScreen.*` (lines 1899-2014)
- `adventure.*` (lines 2015-2020)
- `adventureGame.*` (lines 2745-2759)
- `adventureCert.*` (lines 2724-2736)
- `narrative.*` (lines 2737-2744)

### 10. `certificate.json` (~120 keys) ⭐ CORE
- `certificate.*` (lines 2028-2145)
- `tier.*` (lines 2021-2027)
- `tierBadge.*` (lines 2707-2715)

### 11. `pricing.json` (~200 keys)
- `pricing.*` (lines 913-966)
- `pricingPage.*` (lines 2324-2443)
- `payment.*` (lines 2601-2627)
- `softUpgrade.*` (lines 2760-2791)

### 12. `tools.json` (~300 keys)
- `tool.*` (lines 230-296)
- `toolbox.*` (lines 297-912)
- `toolLayout.*` (lines 2691-2706)
- `groupPicker.*` (lines 2992-3024)
- `soundSettings.*` (lines 3025-3042)
- `dice.*` (lines 3043-3055)

### 13. `profile.json` (~100 keys)
- `profilePage.*` (lines 2451-2472)
- `leaderboardPage.*` (lines 2473-2479)
- `editProfile.*` (lines 2480-2533)

### 14. `admin.json` (~50 keys)
- `admin.*` (lines 2792-2806)

### 15. `components.json` (~150 keys)
- `topbar.*` (lines 2146-2167)
- `footer.*` (lines 967-983)
- `quest.*` (lines 2168-2176)
- `sorobanWidget.*` (lines 2628-2650)
- `sound.*` (lines 2651-2665)
- `rewards.*` (lines 2666-2674)
- `reward.*` (lines 2675-2685)
- `achievementPopup.*` (lines 2686-2690)
- `trialBadge.*` (lines 2716-2723)
- `pwa.*` (lines 2807-2829)
- `blog.*` (lines 2444-2450)

### 16. `seo.json` (~50 keys)
- `seo.*` (lines 50-76)

---

## 🛣️ Route → Namespace Mapping

```javascript
const ROUTE_NAMESPACES = {
  // Public pages
  '/': ['common', 'home', 'seo'],
  '/pricing': ['common', 'pricing', 'seo'],
  '/blog': ['common', 'components', 'seo'],
  '/tool': ['common', 'tools', 'seo'],
  
  // Auth pages
  '/login': ['common', 'auth'],
  '/register': ['common', 'auth'],
  
  // Protected pages (cần login)
  '/dashboard': ['common', 'dashboard', 'components'],
  '/learn': ['common', 'learn', 'lesson-content', 'components'],
  '/practice': ['common', 'practice', 'components'],
  '/compete': ['common', 'compete', 'components'],
  '/adventure': ['common', 'adventure', 'components'],
  '/certificate': ['common', 'certificate', 'components'],
  '/profile': ['common', 'profile', 'components'],
  '/leaderboard': ['common', 'profile', 'components'],
  
  // Admin
  '/admin': ['common', 'admin', 'components'],
};
```

---

## 📊 Ước tính Bundle Size

| Route | Hiện tại | Sau tách | Giảm |
|-------|----------|----------|------|
| `/` (Home) | ~500KB | ~80KB | 84% |
| `/learn/1/1` | ~500KB | ~150KB | 70% |
| `/tool/xuc-xac` | ~500KB | ~100KB | 80% |
| `/adventure` | ~500KB | ~120KB | 76% |

---

## ✅ Backward Compatible

Giữ nguyên:
- `t('common.login')` → vẫn hoạt động
- `t('learn.theory.title')` → vẫn hoạt động
- `translateDb('lessonContent', '1-1', fallback)` → vẫn hoạt động

Loader sẽ merge các namespace thành 1 object trước khi trả về Context.
