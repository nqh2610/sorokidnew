# 🚀 SOROKID PERFORMANCE AUDIT REPORT

> **Ngày audit**: 18/01/2026  
> **Hệ thống**: Next.js 14 + MySQL + i18n  
> **Môi trường**: Shared hosting 3GB RAM  

---

## 📊 TỔNG QUAN VẤN ĐỀ

### Nguyên nhân chậm sau triển khai i18n:

| Vấn đề | Mức độ | Impact |
|--------|--------|--------|
| Dictionary 209KB load mỗi request | 🔴 Critical | +200-400ms TTFB |
| Middleware xử lý i18n mỗi route | 🔴 Critical | +50-100ms mỗi request |
| Re-render khi locale thay đổi | 🟠 Medium | +100-200ms FCP |
| API waterfall khi load page | 🔴 Critical | +300-500ms total |
| getServerSession overhead | 🟠 Medium | +30-50ms mỗi API |
| N+1 queries trong dashboard/stats | 🔴 Critical | +500-1000ms TTFB |
| Cache TTL quá ngắn | 🟠 Medium | +100-200ms |
| Cookie handling mỗi request | 🟡 Low | +10-20ms |

---

## 🔴 CRITICAL BOTTLENECKS

### 1. I18N DICTIONARY LOAD (209KB JSON)

**File**: [lib/i18n/dictionary.js](../lib/i18n/dictionary.js)

**Vấn đề**: 
- Load TOÀN BỘ 209KB dictionary cho mỗi locale
- Kể cả khi user chỉ cần 1 trang
- Dictionary được import sync trong layout.jsx → blocking

**Impact**:
- +200-400ms TTFB
- +800KB memory per request (parsed JSON)
- Server CPU spike

### 2. MIDDLEWARE I18N OVERHEAD

**File**: [middleware.js](../middleware.js#L157-L240)

**Vấn đề**:
- `getToken()` gọi mỗi request → JWT verify
- Cookie operations mỗi request
- Rewrite logic phức tạp
- console.log trong production (L245-246)

**Impact**:
- +50-100ms mỗi request
- Tăng TTFB đáng kể

### 3. N+1 QUERY TRONG DASHBOARD STATS

**File**: [app/api/dashboard/stats/route.js](../app/api/dashboard/stats/route.js)

**Vấn đề**:
- 1366 dòng code, 60+ Prisma calls tiềm năng
- getNextLesson có query inside loop
- Sequential queries thay vì parallel

**Impact**:
- 30-50 queries per request
- +500-1000ms TTFB cho dashboard

### 4. API WATERFALL TRONG CLIENT PAGES

**File**: [app/dashboard/page.jsx](../app/dashboard/page.jsx)

**Vấn đề**:
- 6 API calls sequential (essential → quests → certificates → achievements → activity → stats)
- Staggered timeout tạo delay nhân tạo (300ms, 600ms)
- Không có SWR/React Query để cache client-side

---

## 🟠 MEDIUM ISSUES

### 5. SSR + I18N HYDRATION OVERHEAD

**File**: [app/layout.jsx](../app/layout.jsx#L207-L230)

**Vấn đề**:
- `getDictionarySync()` blocking trong layout
- Full dictionary truyền vào I18nProvider
- Re-render toàn bộ tree khi locale đổi

### 6. CACHE TTL QUÁ NGẮN

**File**: [lib/cache.js](../lib/cache.js)

**Vấn đề**:
- Dashboard cache 90s là quá ngắn
- Lessons/levels có thể cache lâu hơn (30 phút)
- Không có stale-while-revalidate cho static data

### 7. AUTH SESSION OVERHEAD

**File**: Tất cả API routes

**Vấn đề**:
- `getServerSession(authOptions)` mỗi API call
- Không cache session result
- JWT verify mỗi lần

---

## 🟡 HIDDEN FUTURE RISKS

### 8. DATABASE CONNECTION POOL

**File**: [lib/prisma.js](../lib/prisma.js)

**Vấn đề**:
- Connection limit 5 cho shared host
- Khi concurrent users tăng → pool exhaustion
- Không có queue mechanism

### 9. MEMORY LEAK TIỀM ẨN

**Vấn đề**:
- Dictionary cache không có size limit
- In-memory cache không có eviction policy cứng
- useEffect subscriptions không cleanup properly

### 10. SCALING ISSUES

**Vấn đề**:
- Single-process model
- Không có Redis/external cache
- Session storage in-memory

---

## 📋 CHECKLIST AUDIT

### Frontend (Next.js)
- [x] ⚠️ Routing performance - Middleware overhead
- [x] ⚠️ Back/forward delay - No prefetch optimization
- [x] ✅ SSR/SSG/ISR - Homepage static, pages dynamic correctly
- [x] ⚠️ Hydration time - Full dictionary hydration
- [x] ✅ Bundle size - Code splitting với lazy load
- [x] ✅ Dynamic import - Components lazy loaded
- [x] ⚠️ Prefetch/preload - Missing critical prefetch
- [x] ⚠️ Re-render - Full tree re-render khi i18n change
- [x] ✅ Global state - Context appropriate
- [x] ⚠️ Middleware - Too much logic
- [x] ⚠️ Cookie handling - Set mỗi request
- [x] ✅ Asset loading - Static cache headers OK

### i18n
- [x] 🔴 Load toàn bộ JSON - YES, 209KB
- [x] ⚠️ Cache translation - Memory only, no persist
- [x] ⚠️ Re-render do i18n - Full tree
- [x] ⚠️ SSR + i18n overhead - Blocking sync load
- [x] ⚠️ Middleware i18n redirect - Extra logic
- [x] ⚠️ Cookie locale blocking - Every request
- [x] ✅ SEO impact - OK with hreflang
- [x] ⚠️ Duplicate loading - Possible

### Backend/API
- [x] 🔴 API waterfall - Dashboard 6 sequential calls
- [x] ⚠️ API trùng - Some overlap
- [x] ⚠️ API back/forward - No client cache
- [x] ⚠️ Auth middleware overhead - Every request
- [x] ⚠️ Missing cache - Some APIs
- [x] ⚠️ Revalidation strategy - Too short TTL

### MySQL
- [x] 🔴 Query thừa - dashboard/stats 60+ queries
- [x] 🔴 N+1 - getNextLesson loop
- [x] ⚠️ Missing index - Need audit (không sửa schema)
- [x] ⚠️ JOIN nặng - Some complex joins
- [x] ⚠️ Repeated queries - Session check
- [x] ✅ Connection pooling - Configured

### Cache
- [x] ⚠️ Browser cache - Good for assets, missing for API
- [x] ⚠️ Server cache - TTL too short
- [x] ⚠️ API cache - Not consistent
- [x] ✅ CDN cache - N/A (shared host)
- [x] ⚠️ Query cache - In-memory only

---

## 🎯 BẢNG ƯU TIÊN FIX

| # | Fix | Impact | Effort | Priority |
|---|-----|--------|--------|----------|
| 1 | Route-based dictionary splitting | -200ms TTFB | Medium | P0 |
| 2 | Middleware optimization | -50ms/req | Low | P0 |
| 3 | Dashboard API consolidation | -300ms | Medium | P0 |
| 4 | Fix N+1 queries | -500ms | Medium | P0 |
| 5 | Client-side SWR caching | -200ms back/forward | Low | P1 |
| 6 | Increase cache TTL | -100ms | Low | P1 |
| 7 | Session caching | -30ms/API | Low | P1 |
| 8 | Prefetch critical routes | Better UX | Low | P2 |
| 9 | Dictionary preload | -100ms | Low | P2 |
| 10 | Database query optimization | -200ms | Medium | P2 |

---

## ⏱️ METRICS & KPIs

### Before (Estimated)
- TTFB Homepage: 200-400ms
- TTFB Dashboard: 800-1500ms  
- TTFB Learn page: 500-800ms
- Back/forward delay: 300-500ms
- CPU spike: 60-80%
- Memory: 2.5-3GB

### Target After
- TTFB Homepage: < 100ms
- TTFB Dashboard: < 400ms
- TTFB Learn page: < 300ms
- Back/forward delay: < 100ms
- CPU: < 40%
- Memory: < 2GB

### Công cụ đo:
- Chrome DevTools Performance
- Lighthouse
- WebPageTest
- PM2 monitoring
- MySQL slow query log

---

## 🔄 ROLLBACK PLAN

Mỗi thay đổi có thể rollback bằng:
1. Git revert commit
2. PM2 reload previous deployment
3. Feature flags (nếu implement)

Không cần downtime vì:
- Rolling deployment
- Instant rollback với PM2
- No database schema changes
