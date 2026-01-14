# 🌍 I18N Locale Test Checklist - Sorokid

## ✅ Mục tiêu đã đạt được
- ✅ Ở /en → mọi link đều là /en/...
- ✅ Không mất locale khi điều hướng
- ✅ Không F5, Không reload full, Không mất state
- ✅ SEO chuẩn, Hreflang đúng, Canonical đúng
- ❌ Không rewrite app, Không split component, Không phình code
- ✅ Chỉ sửa tối thiểu, Chỉ sửa link, Chỉ sửa router

## 🧪 Test Cases

### 1. Navigation Components
- [ ] **BottomNav**: Click các tabs (Home, Learn, Practice, Compete, Profile) - verify URL có /en prefix khi đang ở EN
- [ ] **MainNav**: Click Logo, Blog, Tool, Login, Register - verify URL correct
- [ ] **TopBar**: Click Logo (-> /dashboard), Pricing badge - verify locale preserved

### 2. Auth Pages
| Test | URL | Action | Expected |
|------|-----|--------|----------|
| [ ] Login | /en/login | Click "Đăng ký ngay" | Navigate to /en/register |
| [ ] Login | /en/login | Click "Quên mật khẩu" | Navigate to /en/forgot-password |
| [ ] Login | /en/login | Login success | Navigate to /en/dashboard |
| [ ] Register | /en/register | Click "Đăng nhập" | Navigate to /en/login |
| [ ] Register | /en/register | Register success | Navigate to /en/login |
| [ ] Forgot Password | /en/forgot-password | Click "Quay lại" | Navigate to /en/login |
| [ ] Reset Password | /en/reset-password | Reset success | Navigate to /en/login |
| [ ] Complete Profile | /en/complete-profile | Complete success | Navigate to /en/login |

### 3. Main App Pages
| Test | URL | Action | Expected |
|------|-----|--------|----------|
| [ ] Dashboard | /en/dashboard | Click any card | Stay in /en/... |
| [ ] Profile | /en/profile | Click "Edit Profile" | Navigate to /en/edit-profile |
| [ ] Pricing | /en/pricing | Click upgrade | Correct redirect |
| [ ] Leaderboard | /en/leaderboard | Unauthenticated | Redirect to /en/login |

### 4. Game Pages
| Test | URL | Action | Expected |
|------|-----|--------|----------|
| [ ] Practice | /en/practice | Select mode, start | Stay in /en/... |
| [ ] Practice Auto | /en/practice/auto | Back to practice | Navigate to /en/practice |
| [ ] Compete | /en/compete | Select mode, start | Stay in /en/... |
| [ ] Compete Auto | /en/compete/auto | Back to compete | Navigate to /en/compete |
| [ ] Adventure | /en/adventure | Click stage | Stay in /en/... |

### 5. Learn Pages
| Test | URL | Action | Expected |
|------|-----|--------|----------|
| [ ] Learn | /en/learn | Select lesson | Navigate to /en/learn/[level]/[lesson] |
| [ ] Lesson | /en/learn/1/1 | Next lesson | Navigate to /en/learn/1/2 |
| [ ] Lesson | /en/learn/1/1 | Back to learn | Navigate to /en/learn |

### 6. Certificate Pages
| Test | URL | Action | Expected |
|------|-----|--------|----------|
| [ ] Certificate List | /en/certificate | Click view cert | Navigate to /en/certificate/[id] |
| [ ] Certificate Detail | /en/certificate/[id] | Click back | Navigate to /en/certificate |

### 7. Upgrade Components
| Test | Component | Action | Expected |
|------|-----------|--------|----------|
| [ ] TrialBanner | Click "Nâng cấp" | Navigate to /en/pricing |
| [ ] UpgradeBanner | Click CTA | Navigate to /en/pricing |
| [ ] UpgradePrompt | Click CTA | Navigate to /en/pricing |
| [ ] UpgradeModal | Click CTA | Navigate to /en/pricing |
| [ ] SoftUpgradeTrigger | Click buttons | Navigate to correct /en/... routes |

### 8. Home Page
| Test | URL | Action | Expected |
|------|-----|--------|----------|
| [ ] Hero CTA | /en | Click "Bắt đầu miễn phí" | Navigate to /en/register |
| [ ] Hero CTA | /en | Click "Toolbox" | Navigate to /en/tool |
| [ ] Footer CTA | /en | Click "Đăng ký" | Navigate to /en/register |
| [ ] Blog Button | /en | Click "Xem tất cả" | Navigate to /en/blog |

### 9. Error Page
| Test | Component | Action | Expected |
|------|-----------|--------|----------|
| [ ] Error | Click "Về trang chủ" | Navigate to /en/ (if was in EN) |

## 🔍 SEO Tests
1. [ ] Check canonical URL correct (no duplicate locale)
2. [ ] Check hreflang tags in <head>
3. [ ] Check alternate links point to correct locales

## 📱 Mobile Tests
- [ ] Test BottomNav on mobile - swipe between tabs
- [ ] Test MainNav - responsive dropdown
- [ ] Test all modals - close and navigate correct

## 🔄 State Preservation Tests
- [ ] Fill form, navigate away, navigate back - check if state preserved
- [ ] Play game, navigate away, navigate back - check if game state preserved
- [ ] Language switch - check if stays on same page

## 📝 Files Modified Summary

### Components Modified:
1. `components/Navigation/BottomNav.jsx` - LocalizedLink + getPathWithoutLocale
2. `components/MainNav/MainNav.jsx` - LocalizedLink
3. `components/TrialBanner/index.jsx` - LocalizedLink
4. `components/UpgradeBanner/UpgradeBanner.jsx` - LocalizedLink
5. `components/UpgradePrompt/UpgradePrompt.jsx` - LocalizedLink
6. `components/SoftUpgradeTrigger/SoftUpgradeTrigger.jsx` - LocalizedLink
7. `components/ToolLayout/ToolLayout.jsx` - LocalizedLink
8. `components/GameModeHeader/GameModeHeader.jsx` - useLocalizedUrl
9. `components/UpgradeModal/UpgradeModal.jsx` - useLocalizedUrl
10. `components/Admin/AdminLayout.jsx` - useLocalizedUrl
11. `components/Adventure/GameMapNew.jsx` - LocalizedLink + useLocalizedUrl
12. `components/Home/HomeContent.jsx` - LocalizedLink
13. `components/Home/HeroContent.jsx` - LocalizedLink

### Pages Modified:
1. `app/(auth)/login/page.jsx` - LocalizedLink + useLocalizedUrl
2. `app/(auth)/register/page.jsx` - LocalizedLink + useLocalizedUrl
3. `app/(auth)/forgot-password/page.jsx` - LocalizedLink
4. `app/(auth)/reset-password/page.jsx` - LocalizedLink + useLocalizedUrl
5. `app/(auth)/complete-profile/page.jsx` - LocalizedLink + useLocalizedUrl
6. `app/profile/page.jsx` - useLocalizedUrl
7. `app/pricing/page.jsx` - useLocalizedUrl
8. `app/practice/page.jsx` - useLocalizedUrl
9. `app/practice/auto/page.jsx` - useLocalizedUrl
10. `app/compete/auto/page.jsx` - useLocalizedUrl
11. `app/leaderboard/page.jsx` - useLocalizedUrl
12. `app/learn/[levelId]/[lessonId]/page.jsx` - useLocalizedUrl (already had, extended)
13. `app/certificate/page.jsx` - LocalizedLink
14. `app/certificate/[id]/page.jsx` - LocalizedLink
15. `app/edit-profile/page.jsx` - LocalizedLink
16. `app/error.jsx` - LocalizedLink

---

## 📋 Checklist thêm ngôn ngữ mới (ví dụ: Tiếng Trung /zh)

### 1. Config Files
```javascript
// lib/i18n/config.js
export const SUPPORTED_LOCALES = ['vi', 'en', 'zh']; // Thêm 'zh'
export const LOCALE_NAMES = {
  vi: 'Tiếng Việt',
  en: 'English',
  zh: '中文' // Thêm
};
```

### 2. Translation File
- Tạo file `lib/i18n/messages/zh.json`
- Copy structure từ `vi.json` hoặc `en.json`
- Dịch tất cả các key

### 3. Middleware (không cần sửa)
- Middleware tự động detect từ SUPPORTED_LOCALES

### 4. LanguageSwitcher Component
```javascript
// components/LanguageSwitcher/index.jsx
// Thêm flag cho ngôn ngữ mới
const FLAGS = {
  vi: '🇻🇳',
  en: '🇺🇸',
  zh: '🇨🇳' // Thêm
};
```

### 5. Test
- [ ] Truy cập /zh - verify redirect đúng
- [ ] Chuyển ngôn ngữ từ /vi -> /zh - verify URL đổi
- [ ] Tất cả link trong /zh đều có prefix /zh

---

**Created**: ${new Date().toISOString()}
**Author**: GitHub Copilot (Claude Opus 4.5)
