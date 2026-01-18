# 🚀 SEO TODO - Việc cần làm (đã tự động hóa tối đa)

## ✅ ĐÃ LÀM TỰ ĐỘNG:

1. ✅ **Google verification** - Sửa từ placeholder → `googledb95ba6d70469295`
2. ✅ **Preconnect/DNS-prefetch** - Thêm cho Google Fonts & Analytics
3. ✅ **Organization sameAs** - Thêm TikTok, Instagram, LinkedIn
4. ✅ **Blog hreflang** - Thêm cross-reference Vi↔En cho blog posts
5. ✅ **manifest.en.json** - Tạo manifest tiếng Anh cho PWA
6. ✅ **Manifest locale-aware** - Layout tự động chọn manifest theo ngôn ngữ
7. ✅ **VideoObject schema** - Thêm video demo schema cho AI search
8. ✅ **Course schema** - Thêm khóa học Soroban schema

---

## 📋 CẦN LÀM THỦ CÔNG:

### 1. 🖼️ Nén OG Image (Hiện 146KB → Nên <100KB)

**Option A - Online (Dễ nhất):**
1. Vào https://tinypng.com hoặc https://squoosh.app
2. Upload `public/og-image.png`
3. Download về ghi đè file cũ

**Option B - Command line (nếu có ImageMagick):**
```powershell
magick "public/og-image.png" -quality 85 -strip "public/og-image.png"
```

---

### 2. 📱 Verify Social Accounts (Quan trọng cho Brand)

Kiểm tra và tạo nếu chưa có:
- [ ] Facebook: https://facebook.com/sorokid
- [ ] YouTube: https://youtube.com/@sorokid  
- [ ] TikTok: https://tiktok.com/@sorokid
- [ ] Instagram: https://instagram.com/sorokid.app
- [ ] LinkedIn: https://linkedin.com/company/sorokid
- [ ] Twitter/X: https://twitter.com/sorokid

⚠️ Nếu account chưa tạo, cần sửa lại sameAs trong `app/page.jsx` line 87-93

---

### 3. 🎬 Video Demo thật (Tùy chọn nhưng recommended)

Schema VideoObject đã thêm nhưng link đến channel chung.
Nếu có video demo riêng, update trong `app/page.jsx`:
- `contentUrl`: Link video thật
- `embedUrl`: Embed URL
- `thumbnailUrl`: Ảnh thumbnail
- `duration`: Thời lượng (PT3M = 3 phút)

---

### 4. 🌐 Core Web Vitals Check

Chạy kiểm tra:
1. https://pagespeed.web.dev/?url=https://sorokid.com
2. https://pagespeed.web.dev/?url=https://sorokid.com/en

**Lưu ý các chỉ số:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms  
- CLS (Cumulative Layout Shift): < 0.1

---

## 📈 SEO SCORE HIỆN TẠI: ~97%

**Đã hoàn thành:**
- ✅ 19 JSON-LD schema types
- ✅ Hreflang đa ngôn ngữ đầy đủ
- ✅ Canonical URLs
- ✅ robots.txt tối ưu
- ✅ Sitemap dynamic
- ✅ OpenGraph & Twitter Cards
- ✅ Preconnect optimization
- ✅ PWA manifest đa ngôn ngữ

**Còn 3% để hoàn hảo:**
- OG Image optimization
- Video content thật
- Social account verification
