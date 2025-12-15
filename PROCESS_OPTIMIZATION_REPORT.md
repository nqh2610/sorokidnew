# 📊 AUDIT REPORT: TỐI ƯU NUMBER OF PROCESSES CHO SHARED HOST

**Ngày audit:** 15/12/2025  
**Môi trường:** Shared Hosting (cPanel/CloudLinux)  
**Giới hạn:** 1000 processes  

---

## 📌 PHẦN 1: TỔNG KẾT NGUYÊN NHÂN

### 🔴 Các nguyên nhân chính gây tăng Number of Processes:

| # | Nguyên nhân | Mức độ | File liên quan |
|---|-------------|--------|----------------|
| 1 | Middleware chạy trên static files | MEDIUM | `middleware.js` |
| 2 | Prefetch=true gây request không cần thiết | MEDIUM | `components/Navigation/BottomNav.jsx` |
| 3 | Polling interval quá ngắn (5s) | HIGH | `app/pricing/page.jsx` |
| 4 | UV_THREADPOOL_SIZE mặc định (4) | MEDIUM | `ecosystem.config.js` |
| 5 | Memory limit quá cao (500M) | LOW | `ecosystem.config.js` |

### ✅ Những gì đã tốt (KHÔNG CẦN SỬA):

| # | Mục | Đánh giá |
|---|-----|----------|
| 1 | Prisma singleton pattern | ✅ Đã implement đúng |
| 2 | DB connection pool | ✅ Giới hạn 5 connections |
| 3 | bcrypt cost | ✅ Salt rounds = 10 (phù hợp shared host) |
| 4 | Lazy cleanup thay vì setInterval | ✅ Đã implement |
| 5 | Rate limiting in-memory | ✅ Không block, chỉ tracking |
| 6 | Request limiter với queue | ✅ Max 50 concurrent |
| 7 | Circuit breaker | ✅ Tự động ngắt khi quá tải |
| 8 | PM2 fork mode (không cluster) | ✅ Chỉ 1 instance |
| 9 | JWT callback cache user role | ✅ Cache 5 phút |
| 10 | Dashboard API caching | ✅ Cache 30s |

---

## 📌 PHẦN 2: CHI TIẾT CÁC VẤN ĐỀ VÀ FIX

### 1️⃣ Middleware chạy trên static files

**File:** [middleware.js](middleware.js)

**Vấn đề:** Matcher pattern không loại trừ đủ các file types, dẫn đến middleware chạy không cần thiết.

**Fix đã áp dụng:**
```javascript
// TRƯỚC
'/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)'

// SAU
'/((?!api|_next/static|_next/image|_next/data|favicon.ico|manifest\\.json|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|mp3|mp4|pdf)$).*)'
```

**Lợi ích:** Giảm ~30-50% số lần middleware được invoke.

---

### 2️⃣ Prefetch trong BottomNav

**File:** [components/Navigation/BottomNav.jsx](components/Navigation/BottomNav.jsx)

**Vấn đề:** `prefetch={true}` trên navigation links gây Next.js fetch data trước cho tất cả routes.

**Fix đã áp dụng:**
```jsx
// TRƯỚC
prefetch={true}

// SAU  
prefetch={false}
```

**Lợi ích:** Giảm requests tự động, chỉ load khi user navigate.

---

### 3️⃣ Payment Polling Interval

**File:** [app/pricing/page.jsx](app/pricing/page.jsx)

**Vấn đề:** 
- Polling check payment mỗi 5 giây
- Không có giới hạn số lần poll
- Có thể chạy vô hạn 30 phút

**Fix đã áp dụng:**
```javascript
// TRƯỚC
}, 5000); // Check mỗi 5 giây

// SAU
let pollCount = 0;
const MAX_POLLS = 90; // Giới hạn 90 lần (15 phút)

if (pollCount > MAX_POLLS) {
  clearInterval(pollInterval);
  return;
}

}, 10000); // Check mỗi 10 giây
```

**Lợi ích:** 
- Giảm 50% số requests polling
- Có giới hạn tối đa, không chạy vô hạn

---

### 4️⃣ PM2 Ecosystem Config

**File:** [ecosystem.config.js](ecosystem.config.js)

**Các tối ưu đã áp dụng:**

| Setting | Trước | Sau | Lý do |
|---------|-------|-----|-------|
| `NODE_OPTIONS` | `--max-old-space-size=512` | `--max-old-space-size=384 --optimize-for-size` | Giảm memory footprint |
| `max_memory_restart` | 500M | 400M | Force restart sớm hơn khi memory cao |
| `max_restarts` | 5 | 3 | Tránh restart loop |
| `min_uptime` | 30s | 60s | Đảm bảo app ổn định trước |
| `restart_delay` | 5000 | 10000 | Cho thời gian cleanup |
| `kill_timeout` | 10000 | 15000 | Đủ thời gian close DB connections |
| `RUNTIME_ENV` | không set | `shared` | Kích hoạt shared host config |

---

## 📌 PHẦN 3: CHECKLIST SAU KHI FIX

### ✅ Checklist kiểm tra:

```bash
# 1. Kiểm tra số processes hiện tại
ps aux | grep -c "^$(whoami)"

# 2. Kiểm tra Node.js processes
pgrep -u $(whoami) -c "node"

# 3. Kiểm tra PM2 status
pm2 status

# 4. Kiểm tra memory usage
pm2 monit

# 5. Test login
curl -X POST https://yourdomain.com/api/auth/signin

# 6. Test dashboard API
curl https://yourdomain.com/api/dashboard/stats

# 7. Kiểm tra error logs
tail -f logs/error.log
```

### ✅ Các bước deploy an toàn (KHÔNG DOWNTIME):

```bash
# 1. Backup code hiện tại
cp -r /path/to/app /path/to/app_backup_$(date +%Y%m%d)

# 2. Pull code mới
cd /path/to/app
git pull origin main

# 3. Rebuild (không restart)
npm run build

# 4. Graceful reload (không downtime)
pm2 reload sorokid

# 5. Verify
pm2 status
curl https://yourdomain.com/api/health
```

---

## 📌 PHẦN 4: MONITORING SAU FIX

### Script theo dõi processes:

Đã tạo file `scripts/monitor-processes.sh`. Sử dụng:

```bash
# Chạy thủ công
chmod +x scripts/monitor-processes.sh
./scripts/monitor-processes.sh

# Hoặc thêm vào crontab chạy mỗi 5 phút
*/5 * * * * /path/to/sorokid/scripts/monitor-processes.sh >> /path/to/logs/process-monitor.log 2>&1
```

### Theo dõi qua PM2:

```bash
# Xem realtime
pm2 monit

# Xem logs
pm2 logs sorokid --lines 100

# Xem chi tiết
pm2 show sorokid
```

---

## 📌 PHẦN 5: PHÂN BIỆT FIX CHO SHARED HOST vs VPS

| Mục | Shared Host (Hiện tại) | VPS (Sau này) |
|-----|------------------------|---------------|
| **RUNTIME_ENV** | `shared` | `vps` |
| **DB connections** | 5 | 20 |
| **Concurrent requests** | 50 | 200 |
| **Cache size** | 500 entries | 2000 entries |
| **PM2 instances** | 1 | 2-4 (tùy CPU) |
| **PM2 exec_mode** | `fork` | `cluster` |
| **NODE_OPTIONS** | `--max-old-space-size=384` | `--max-old-space-size=2048` |
| **UV_THREADPOOL_SIZE** | 2 | 4 |
| **SSR revalidate** | disabled | 60s |
| **Prefetch** | disabled | enabled |

### Khi chuyển sang VPS:

```bash
# 1. Đổi environment variable
export RUNTIME_ENV=vps

# 2. Cập nhật ecosystem.config.js
# instances: 2-4
# exec_mode: 'cluster'
# NODE_OPTIONS: '--max-old-space-size=2048'

# 3. Bật prefetch trong BottomNav.jsx
# prefetch={true}

# 4. Restart với config mới
pm2 delete sorokid
pm2 start ecosystem.config.js --env production
```

---

## 📌 PHẦN 6: KẾT LUẬN

### ✅ Các file đã được fix:

1. [middleware.js](middleware.js) - Mở rộng matcher loại trừ static files
2. [components/Navigation/BottomNav.jsx](components/Navigation/BottomNav.jsx) - Tắt prefetch
3. [app/pricing/page.jsx](app/pricing/page.jsx) - Tối ưu polling intervals + Xóa fake notification
4. [ecosystem.config.js](ecosystem.config.js) - Tối ưu PM2 config
5. [config/runtime.config.js](config/runtime.config.js) - Thêm polling config tập trung

### ✅ File mới tạo:

1. `scripts/monitor-processes.sh` - Script monitoring

### 📈 Kết quả dự kiến:

| Metric | Trước | Sau (dự kiến) |
|--------|-------|---------------|
| Middleware calls | 100% | ~60% |
| Prefetch requests | Nhiều | 0 |
| Polling requests/phút | 12 | 6 |
| Fake notifications | Có (gây re-render) | Đã xóa |
| Memory restart threshold | 500M | 400M |
| UV threadpool | 4 | 2 |

### ⚠️ Lưu ý quan trọng:

1. **KHÔNG restart server ngay** - Deploy bằng `pm2 reload` để graceful
2. **Monitor 24h sau deploy** - Dùng script monitoring
3. **Backup trước khi deploy** - Phòng trường hợp rollback
4. **Chạy vào giờ thấp điểm** - Thường 2-4h sáng

---

**Báo cáo tạo bởi:** Senior DevOps + Next.js Engineer  
**Ngày:** 15/12/2025
