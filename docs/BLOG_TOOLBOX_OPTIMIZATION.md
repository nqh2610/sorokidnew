# 🚀 CHECKLIST TỐI ƯU BLOG, TOOLBOX & CÁC TRANG CON

## MỤC TIÊU
- ✅ Giảm number of process xuống 0 cho các trang public
- ✅ SEO tốt hơn - HTML static cho bot crawl
- ✅ Không query MySQL khi user truy cập trang static
- ✅ Giữ nguyên logic và hiển thị

---

## A. BLOG PAGES

### ✅ Blog Listing (`/blog`)
- [x] Thêm `export const revalidate = 1800` (30 phút)
- [x] Server Component - không cần 'use client'
- [x] generateMetadata với SEO động
- [ ] Verify: `curl -I https://yourdomain.com/blog`

### ✅ Blog Detail (`/blog/[slug]`)
- [x] Thêm `export const revalidate = 3600` (1 giờ)
- [x] `generateStaticParams` - pre-render tất cả posts
- [x] JSON-LD Schema Article
- [ ] Verify tất cả posts được pre-render

### ✅ Blog Category (`/blog/danh-muc/[category]`)
- [x] Thêm `export const revalidate = 1800` (30 phút)
- [x] `generateStaticParams` - pre-render tất cả categories
- [ ] Verify các category pages

### Process Count: 0 (sau build)

---

## B. TOOLBOX PAGES

### ✅ Toolbox Main (`/tool`)
- [x] Layout có SEO metadata đầy đủ
- [x] `export const dynamic = 'force-static'`
- [x] JSON-LD WebApplication + ItemList
- [x] Page.jsx dùng 'use client' cho tương tác

### ✅ Tool Con (12 tools)
Tất cả đã được update với:
- [x] `export const dynamic = 'force-static'`
- [x] `export const revalidate = false`
- [x] SEO metadata trong layout
- [x] JSON-LD Schema riêng cho mỗi tool

| Tool | Status |
|------|--------|
| Chiếc Nón Kỳ Diệu | ✅ Static |
| Ai Là Triệu Phú | ✅ Static |
| Flash ZAN | ✅ Static |
| Đồng Hồ Bấm Giờ | ✅ Static |
| Bàn Tính Soroban | ✅ Static |
| Đua Vịt Sông Nước | ✅ Static |
| Xúc Xắc 3D | ✅ Static |
| Đèn May Mắn | ✅ Static |
| Bốc Thăm | ✅ Static |
| Chia Nhóm | ✅ Static |
| Cuộc Đua Kì Thú | ✅ Static |
| Ô Chữ | ✅ Static |
| Chia Nhóm & Bốc Thăm | ✅ Static |

### Process Count: 0 (tất cả static)

---

## C. OTHER PUBLIC PAGES

### ✅ Pricing (`/pricing`)
- [x] Tạo layout với SEO metadata
- [x] `export const dynamic = 'force-static'`
- [x] JSON-LD Product + AggregateOffer
- [x] Page.jsx dùng 'use client' cho tương tác

### ✅ Leaderboard (`/leaderboard`)
- [x] Tạo layout với metadata
- [x] `robots: { index: false }` (cần auth)
- [x] Page.jsx fetch client-side sau auth

### ✅ Homepage (`/`)
- [x] `export const revalidate = 3600` (1 giờ)
- [x] `export const dynamic = 'force-static'`
- [x] JSON-LD đầy đủ

---

## D. FILES ĐÃ THAY ĐỔI

### Blog
```
app/blog/page.jsx                    - Thêm ISR config
app/blog/[slug]/page.jsx             - Thêm ISR config
app/blog/danh-muc/[category]/page.jsx - Thêm ISR config
```

### Toolbox
```
app/tool/layout.jsx                  - Thêm static config
app/tool/ai-la-trieu-phu/layout.jsx  - Thêm static config
app/tool/flash-zan/layout.jsx        - Thêm static config
app/tool/dong-ho-bam-gio/layout.jsx  - Thêm static config
app/tool/ban-tinh-soroban/layout.jsx - Thêm static config
app/tool/dua-thu-hoat-hinh/layout.jsx - Thêm static config
app/tool/xuc-xac/layout.jsx          - Thêm static config
app/tool/den-may-man/layout.jsx      - Thêm static config
app/tool/boc-tham/layout.jsx         - Thêm static config
app/tool/chia-nhom/layout.jsx        - Thêm static config
app/tool/cuoc-dua-ki-thu/layout.jsx  - Thêm static config
app/tool/o-chu/layout.jsx            - Thêm static config
app/tool/chia-nhom-boc-tham/layout.jsx - Thêm static config
app/tool/chiec-non-ky-dieu/layout.jsx - Thêm static config
```

### Other
```
app/pricing/layout.jsx               - TẠO MỚI với SEO
app/leaderboard/layout.jsx           - TẠO MỚI với SEO
```

---

## E. SEO CHECKLIST

### Technical SEO
- [x] Sitemap động (`/sitemap.xml`)
- [x] Robots.txt (`/robots.txt`)
- [x] JSON-LD Structured Data cho mỗi trang
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Canonical URLs
- [x] Meta keywords

### Schema Types Đã Implement
- [x] WebSite
- [x] Organization
- [x] WebApplication (mỗi tool)
- [x] Article (blog posts)
- [x] FAQPage (nếu có FAQ)
- [x] Product (pricing)
- [x] BreadcrumbList
- [x] ItemList (toolbox)
- [x] HowTo (các tool)

### Core Web Vitals
- [x] Static HTML cho LCP nhanh
- [x] Không blocking JS cho FID
- [x] Layout stable cho CLS
- [ ] Test với PageSpeed Insights

---

## F. VERIFICATION

### Build & Check
```bash
# Clean build
rm -rf .next
npm run build

# Check static routes
cat .next/routes-manifest.json | grep -E "blog|tool|pricing"

# Check generated HTML files
ls -la .next/server/app/blog/
ls -la .next/server/app/tool/
```

### Test SEO
```bash
# Check metadata
curl -s https://yourdomain.com/blog | grep -E "<title>|<meta"

# Check JSON-LD
curl -s https://yourdomain.com/tool | grep "application/ld+json"

# Check robots
curl https://yourdomain.com/robots.txt

# Check sitemap
curl https://yourdomain.com/sitemap.xml
```

### Test Static Generation
```bash
# Request trang và check headers
curl -I https://yourdomain.com/blog
# Expect: X-NextJS-Prerender: 1

curl -I https://yourdomain.com/tool/chiec-non-ky-dieu
# Expect: Static response
```

---

## G. KẾT QUẢ MONG ĐỢI

| Trang | Trước | Sau |
|-------|-------|-----|
| `/blog` | Server render | **Static + ISR 30m** |
| `/blog/[slug]` | Server render | **Static + ISR 1h** |
| `/blog/danh-muc/[cat]` | Server render | **Static + ISR 30m** |
| `/tool` | Client only | **Layout static + Client** |
| `/tool/*` | Client only | **Layout static + Client** |
| `/pricing` | Client only | **Layout static + Client** |
| `/leaderboard` | Client + API | Client + API (no index) |

### Process Count Summary
| Route | DB Queries | Process |
|-------|------------|---------|
| Blog pages | 0 (at runtime) | 0 |
| Tool pages | 0 | 0 |
| Pricing | 0 | 0 |
| Leaderboard | API call after auth | 1 |

---

## H. MONITORING

### Check sau deploy
```bash
# Check process count
ps aux | grep node | wc -l

# Check memory
free -m

# Check response time
curl -w "%{time_total}\n" -o /dev/null -s https://yourdomain.com/blog
```

### Google Search Console
- [ ] Submit sitemap mới
- [ ] Check Coverage report
- [ ] Check Core Web Vitals
- [ ] Check Mobile Usability

---

## I. TROUBLESHOOTING

### Nếu trang không static
1. Check có `'use client'` ở page level không
2. Check có dùng `cookies()`, `headers()` không
3. Check có fetch với `cache: 'no-store'` không

### Nếu SEO không index
1. Check `robots` trong metadata
2. Check robots.txt
3. Check sitemap có trang đó không

### Nếu ISR không hoạt động
1. Check `revalidate` value
2. Check có `dynamic = 'force-dynamic'` không
3. Check build output

---

*Cập nhật: Tháng 1/2026*
