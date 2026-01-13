# 🚀 CHECKLIST TỐI ƯU HIỆU NĂNG - SHARED HOSTING

## MỤC TIÊU
- [ ] Giảm number of process xuống mức thấp nhất
- [ ] SEO tốt hơn hoặc ít nhất không giảm
- [ ] MySQL không bị overload
- [ ] Server nhẹ hơn rõ rệt

---

## A. STATIC GENERATION & ISR

### Trang chủ
- [x] Thêm `export const revalidate = 3600` (1 giờ)
- [x] Thêm `export const dynamic = 'force-static'`
- [ ] Verify build output là static (kiểm tra .next/server/app/page.html)
- [ ] Test với `curl -I https://yourdomain.com` - check header `X-NextJS-Prerender`

### Các trang public khác
- [ ] `/pricing` - thêm ISR config
- [ ] `/blog` - thêm ISR config  
- [ ] `/blog/[slug]` - thêm generateStaticParams
- [ ] `/tool` - static hoàn toàn
- [ ] `/leaderboard` - ISR với revalidate = 300 (5 phút)

### Kiểm tra
```bash
# Sau khi build, kiểm tra output
cat .next/routes-manifest.json | grep -A 5 "staticRoutes"
```

---

## B. MYSQL OPTIMIZATION

### Connection Pool
- [x] Singleton Prisma client
- [x] Connection limit = 5 (shared) / 20 (VPS)
- [x] Pool timeout = 20s
- [x] Query middleware log slow queries

### Query Optimization
- [x] Register: Gộp 3 queries → 1 query
- [x] Login: Chỉ select fields cần thiết
- [x] Auth cache: 5 phút TTL
- [ ] Thêm index cho fields hay query:
  ```sql
  CREATE INDEX idx_user_email ON User(email);
  CREATE INDEX idx_user_username ON User(username);
  CREATE INDEX idx_user_phone ON User(phone);
  ```

### Kiểm tra
```bash
# Monitor connections
SHOW STATUS LIKE 'Threads_connected';
SHOW PROCESSLIST;
```

---

## C. AUTHENTICATION

### Login
- [x] Rate limit: 10 requests/phút/IP
- [x] Progressive lockout: 30s → 1m → 5m → 15m → 1h
- [x] Password hash với cost 10 (cân bằng)
- [x] In-memory tracking (không Redis)
- [x] Lazy cleanup (không setInterval)

### Google Login
- [x] Không tạo user ngay, chờ complete-profile
- [x] Cache user role 5 phút
- [x] Single query với upsert
- [ ] Verify callback chỉ xử lý 1 lần

### Register
- [x] Client-side validation trước
- [x] Single query check email + username + phone
- [x] Rate limit STRICT
- [ ] Thêm honeypot field vào form

---

## D. ANTI-BOT & RATE LIMIT

### Middleware
- [x] Skip API routes trong middleware
- [x] Skip static files
- [x] Matcher tối ưu (chỉ page routes)

### Anti-bot
- [x] File `lib/antiBot.js` đã tạo
- [ ] Integrate vào register API
- [ ] Integrate vào contact API (nếu có)
- [ ] Thêm honeypot field vào forms

### Kiểm tra
```javascript
// Test rate limit
for (let i = 0; i < 20; i++) {
  fetch('/api/users/register', { method: 'POST' });
}
```

---

## E. SEO CHECKLIST

### Technical SEO
- [x] Sitemap dynamic (`/sitemap.xml`)
- [x] Robots.txt (`/robots.txt`)
- [x] Structured data JSON-LD
- [x] Open Graph tags
- [x] Canonical URLs

### Performance (Core Web Vitals)
- [x] Image optimization (AVIF + WebP)
- [x] Font optimization
- [x] Cache headers cho static assets
- [ ] Test với PageSpeed Insights
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

### Kiểm tra
```bash
# Test SEO
curl https://yourdomain.com | grep -E "<title>|<meta"

# Test sitemap
curl https://yourdomain.com/sitemap.xml

# Test robots
curl https://yourdomain.com/robots.txt
```

---

## F. DEPLOYMENT

### Build
```bash
# Clean build
rm -rf .next
npm run build

# Check output
ls -la .next/server/app/
```

### Verify Static Pages
```bash
# Các file này phải tồn tại:
.next/server/app/page.html          # Trang chủ
.next/server/app/pricing/page.html  # Pricing
.next/server/app/blog/page.html     # Blog listing
```

### Environment Variables
```env
# Production settings
NODE_ENV=production
RUNTIME_ENV=shared
DATABASE_URL="mysql://user:pass@host/db?connection_limit=5"
```

### PM2 (nếu dùng)
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'sorokid',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 1,  // Shared host: chỉ 1 instance
    exec_mode: 'fork',
    max_memory_restart: '500M',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

---

## G. MONITORING

### Check Process Count
```bash
# Linux
ps aux | grep node | wc -l

# Check memory
free -m
```

### Check MySQL Connections
```sql
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';
```

### Application Health
```bash
curl https://yourdomain.com/api/health
```

---

## H. SAI LẦM PHỔ BIẾN (TRÁNH!)

### ❌ Tăng process
- [ ] KHÔNG dùng `setInterval` trong server code
- [ ] KHÔNG spawn child process
- [ ] KHÔNG dùng WebSocket (dùng polling thay thế)
- [ ] KHÔNG import heavy modules trong middleware

### ❌ Tăng MySQL connections
- [ ] KHÔNG tạo PrismaClient mới mỗi request
- [ ] KHÔNG query trong loop (N+1 problem)
- [ ] KHÔNG để connection hang (timeout đúng)

### ❌ Giảm SEO
- [ ] KHÔNG chặn bot trong robots.txt
- [ ] KHÔNG dùng `noindex` cho trang public
- [ ] KHÔNG để page render chậm (>3s TTFB)

---

## I. KẾT QUẢ MONG ĐỢI

Sau khi áp dụng đầy đủ:

| Metric | Trước | Sau |
|--------|-------|-----|
| Trang chủ process | 1/request | 0 |
| MySQL connections/request | 3-5 | 0-1 |
| TTFB trang chủ | 500ms+ | <100ms |
| Login DB queries | 2-3 | 1 |
| Register DB queries | 4 | 2 |
| Memory usage | High | Giảm 30-50% |

---

## J. TIMELINE GỢI Ý

### Ngày 1
- [x] Phân tích cấu trúc hiện tại
- [x] Thêm ISR config cho trang chủ
- [x] Tối ưu register query

### Ngày 2
- [ ] Thêm ISR cho các trang còn lại
- [ ] Test build output
- [ ] Thêm database indexes

### Ngày 3
- [ ] Test performance
- [ ] Test SEO với Google Search Console
- [ ] Deploy production

### Sau deploy
- [ ] Monitor process count
- [ ] Monitor MySQL connections
- [ ] Check Core Web Vitals

---

## FILES ĐÃ TẠO/SỬA

### Tạo mới
- `lib/staticCache.js` - Utilities cho ISR
- `lib/optimizedQueries.js` - Query patterns tối ưu
- `lib/antiBot.js` - Chống bot & rate limit

### Sửa đổi
- `app/page.jsx` - Thêm ISR config
- `app/api/users/register/route.js` - Gộp queries

---

*Cập nhật lần cuối: {{DATE}}*
