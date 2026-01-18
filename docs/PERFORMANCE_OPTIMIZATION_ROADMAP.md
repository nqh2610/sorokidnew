# 🚀 SOROKID PERFORMANCE OPTIMIZATION - LỘ TRÌNH TRIỂN KHAI

> **Mục tiêu**: Giảm TTFB 50-70%, không downtime, không phá SEO

---

## 📅 PHASE 1: QUICK WINS (Deploy ngay, 0 risk)

### 1.1 Tăng Cache TTL
**File**: `config/runtime.config.js`

```javascript
// THAY ĐỔI (copy từ runtimeOptimized.config.js):
ttl: {
  levels: 1800000,        // 30 phút (cũ: 5 phút)
  lessons: 1800000,       // 30 phút (cũ: 3 phút)
  dashboard: 120000,      // 2 phút (cũ: 90s)
  ...
}
```

**Cách apply**:
```bash
# Copy config mới
cp config/runtimeOptimized.config.js config/runtime.config.js

# Restart PM2
pm2 restart sorokid
```

**Rollback**:
```bash
git checkout config/runtime.config.js
pm2 restart sorokid
```

---

### 1.2 Bỏ console.log trong Middleware
**File**: `middleware.js`

**Xóa dòng 245-246**:
```javascript
// XÓA:
console.log('[MW DEBUG] pathname:', pathname, 'routeHasOwnEnFile:', routeHasOwnEnFile);
console.log('[MW DEBUG] REWRITING to:', pathWithoutEn);
console.log('[MW DEBUG] SKIPPING rewrite - route has own EN file');
```

**Cách apply**:
```bash
# Edit file và remove console.log
# Hoặc replace bằng middlewareOptimized.js sau khi test

pm2 restart sorokid
```

---

### 1.3 Thêm Cache Headers cho API
**File**: `next.config.js`

Trong `headers()` function, thêm:
```javascript
{
  // Dashboard API - short cache
  source: '/api/dashboard/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'private, max-age=60, stale-while-revalidate=120',
    },
  ],
},
{
  // Static data APIs - longer cache
  source: '/api/(levels|lessons|achievements)',
  headers: [
    {
      key: 'Cache-Control',
      value: 'private, max-age=300, stale-while-revalidate=600',
    },
  ],
},
```

---

## 📅 PHASE 2: MEDIUM REFACTOR (Test kỹ trước khi deploy)

### 2.1 Unified Dashboard API
**File mới**: `app/api/dashboard/unified/route.js` ✅ (đã tạo)

**Cách test**:
```bash
# 1. Deploy file mới (không ảnh hưởng gì, chưa sử dụng)
# 2. Test manual
curl http://localhost:3000/api/dashboard/unified?include=essential,quests
# 3. So sánh với old APIs
```

**Cách integrate**:
```javascript
// Trong app/dashboard/page.jsx, thay đổi fetch:

// OLD:
const [essential, quests] = await Promise.all([
  fetch('/api/dashboard/essential'),
  fetch('/api/dashboard/quests')
]);

// NEW:
const data = await fetch('/api/dashboard/unified?include=essential,quests');
```

**Rollback**: Chỉ cần revert code trong page.jsx

---

### 2.2 Optimized Middleware
**File mới**: `middlewareOptimized.js` ✅ (đã tạo)

**Cách test**:
```bash
# 1. Rename files
mv middleware.js middleware.backup.js
mv middlewareOptimized.js middleware.js

# 2. Test all routes:
- Homepage: /
- English: /en
- Blog: /blog, /en/blog
- Tool: /tool/..., /en/tool/...
- Protected: /dashboard, /learn
- Auth: /login, /register

# 3. Test i18n switching
# 4. Test login/logout flow
```

**Rollback**:
```bash
mv middleware.js middlewareOptimized.js
mv middleware.backup.js middleware.js
pm2 restart sorokid
```

---

### 2.3 Client-Side Cache Hook
**File mới**: `lib/hooks/useCachedFetch.js` ✅ (đã tạo)

**Cách integrate** (từng page một):
```javascript
// Trong component:
import { useCachedFetch } from '@/lib/hooks/useCachedFetch';

// OLD:
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/dashboard/essential')
    .then(res => res.json())
    .then(setData);
}, []);

// NEW:
const { data, isLoading, error, refresh } = useCachedFetch('/api/dashboard/essential');
```

**Rollback**: Revert code changes trong component

---

## 📅 PHASE 3: LONG-TERM (Optional, cần plan kỹ)

### 3.1 Route-based Dictionary Splitting
**File mới**: `lib/i18n/dictionaryOptimized.js` ✅ (đã tạo)

**Yêu cầu**:
1. Tách file dictionary lớn thành files nhỏ theo namespace
2. Update layout.jsx để sử dụng getDictionaryForRoute
3. Test toàn bộ pages

**Ước tính**: -200ms TTFB, effort cao

---

### 3.2 Precomputed Leaderboard
**Concept**:
- Thay vì query tất cả users mỗi request
- Dùng background job tính rank mỗi 5 phút
- Store trong cache/Redis

**Yêu cầu**:
- Setup background job (PM2 cron hoặc external)
- Thêm bảng cache hoặc Redis

---

### 3.3 Database Indexes
**Đề xuất** (KHÔNG TỰ SỬA, cần DBA review):
```sql
-- Nếu chưa có
CREATE INDEX idx_progress_user_completed ON Progress(userId, completed);
CREATE INDEX idx_user_quest_user_status ON UserQuest(userId, completed, claimed);
CREATE INDEX idx_exercise_result_user ON ExerciseResult(userId, createdAt);
```

---

## ✅ CHECKLIST DEPLOY

### Trước khi deploy:
- [ ] Backup database
- [ ] Backup current code (git tag)
- [ ] Test trên staging/local
- [ ] Notify team

### Deploy steps:
```bash
# 1. Pull code mới
git pull origin main

# 2. Build
npm run build

# 3. Graceful restart (0 downtime)
pm2 reload sorokid

# 4. Monitor logs
pm2 logs sorokid --lines 100

# 5. Check metrics
# - TTFB qua Chrome DevTools
# - Error rate trong logs
# - CPU/RAM qua PM2 monit
```

### Sau deploy:
- [ ] Test manual các routes chính
- [ ] Check error logs
- [ ] Monitor 30 phút
- [ ] Rollback nếu có vấn đề

---

## 📊 MONITORING

### Metrics cần theo dõi:

| Metric | Tool | Target |
|--------|------|--------|
| TTFB | Chrome DevTools | < 400ms |
| LCP | Lighthouse | < 2.5s |
| FCP | Lighthouse | < 1.8s |
| Error rate | PM2 logs | < 0.1% |
| CPU | PM2 monit | < 50% |
| Memory | PM2 monit | < 2GB |
| MySQL queries/s | Slow query log | < 100 |

### Commands:
```bash
# PM2 monitoring
pm2 monit

# Logs real-time
pm2 logs sorokid

# MySQL slow queries
tail -f /var/log/mysql/slow.log
```

---

## 🔙 ROLLBACK PROCEDURES

### Quick rollback (< 1 phút):
```bash
pm2 reload sorokid --update-env
```

### Code rollback (< 5 phút):
```bash
git revert HEAD
npm run build
pm2 reload sorokid
```

### Full rollback (< 15 phút):
```bash
git checkout v1.x.x  # Previous stable tag
npm install
npm run build
pm2 reload sorokid
```

---

## 📝 NOTES

1. **Không sửa database schema** - Tất cả optimization ở application layer
2. **Không đổi URLs** - SEO không bị ảnh hưởng
3. **Backward compatible** - Old APIs vẫn hoạt động
4. **Incremental deploy** - Từng bước, dễ rollback
5. **Zero downtime** - PM2 reload graceful
