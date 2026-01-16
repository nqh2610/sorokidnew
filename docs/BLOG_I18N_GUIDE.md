# 📝 BLOG I18N - HƯỚNG DẪN QUẢN LÝ NỘI DUNG ĐA NGÔN NGỮ

## 🎯 Nguyên Tắc Cốt Lõi

### 1. **KHÔNG DỊCH MÁY MÓC**
- Mỗi ngôn ngữ là nội dung **VIẾT MỚI**, không phải Google Translate
- Bài EN phải đánh đúng tâm lý phụ huynh/giáo viên Mỹ/Anh
- Context, ví dụ, văn hóa phải phù hợp từng thị trường

### 2. **CẤU TRÚC JSON GIỮ NGUYÊN**
- Tất cả các field giữ nguyên tên
- Chỉ thay đổi NỘI DUNG trong các field
- Thêm `translations` để link giữa các bản

### 3. **HÌNH ẢNH DÙNG CHUNG**
- `image` field giữ nguyên URL
- Không duplicate hình ảnh
- `imageAlt` cần localize

---

## 📁 Cấu Trúc Thư Mục

```
content/blog/
├── categories.json          # Categories tiếng Việt
├── categories.en.json       # Categories tiếng Anh
├── posts/
│   ├── *.json              # Bài VI (backward compatible)
│   ├── vi/                 # [Future] Bài VI trong subfolder
│   │   └── *.json
│   └── en/                 # Bài EN
│       └── *.json
```

---

## 🔗 URL Structure (SEO-Friendly)

| Language | URL Pattern | Example |
|----------|-------------|---------|
| Vietnamese | `/blog/{vi-slug}` | `/blog/soroban-la-gi` |
| English | `/en/blog/{en-slug}` | `/en/blog/what-is-soroban` |

**Lưu ý:** Slug tiếng Anh phải:
- Đúng SEO cho English market
- Chứa target keywords
- Ngắn gọn, dễ đọc

---

## 📝 Cấu Trúc File JSON

### Bài Viết Tiếng Việt (Gốc)
```json
{
  "slug": "soroban-la-gi",
  "title": "Soroban là gì?...",
  "translations": {
    "en": "what-is-soroban"   // 👈 Link đến bản EN
  },
  // ... other fields
}
```

### Bài Viết Tiếng Anh
```json
{
  "slug": "what-is-soroban",
  "title": "What is Soroban?...",
  "translations": {
    "vi": "soroban-la-gi"     // 👈 Link về bản VI
  },
  "image": "/blog/be-hoc-soroban.jpg",  // 👈 GIỮA NGUYÊN
  "imageAlt": "Child learning with Soroban abacus",  // 👈 Localize
  // ... other fields
}
```

---

## 🛠️ Quy Trình Tạo Bài EN Mới

### Bước 1: Scaffold Template
```bash
npm run blog:scaffold-en soroban-la-gi
```

Output:
- Tạo `content/blog/posts/en/what-is-soroban.json` (draft)
- Cập nhật bài VI với `translations.en`

### Bước 2: Viết Nội Dung
1. Mở file EN vừa tạo
2. **KHÔNG DỊCH** - Viết lại cho đối tượng EN:
   - Intro: Hook phù hợp văn hóa Mỹ/Anh
   - Examples: Bối cảnh American schools
   - Pain points: Homework stress, standardized tests
   - Author: "Sarah, Mom of 3rd grader" (không phải "Chị Hương")

### Bước 3: SEO Research
1. Research keywords English cho topic này
2. Cập nhật `keywords` array
3. Viết `title` và `description` chuẩn SEO

### Bước 4: Publish
```json
{
  "status": "published"  // Đổi từ "draft"
}
```

### Bước 5: Kiểm Tra
```bash
npm run blog:sync
```

---

## ✍️ Hướng Dẫn Viết Nội Dung EN

### ❌ KHÔNG NÊN (Dịch máy móc)
```
"Mình nghĩ đây là món ăn Nhật"
→ "I thought this was Japanese food"  ❌
```

### ✅ NÊN (Viết lại)
```
"The first time I heard 'Soroban,' I thought it was a 
sushi roll. Seriously."  ✅
```

### Điểm Khác Biệt Cần Chú Ý

| Aspect | Vietnamese | English |
|--------|------------|---------|
| Author | "Chị Hương, Mẹ bé lớp 3" | "Sarah, Mom of a 3rd grader" |
| Currency | "60k" | "$15" |
| School | "lớp 1, lớp 3" | "1st grade, 3rd grade" |
| Pain point | "Kem con học" | "Helping with homework" |
| Reference | "Chương trình VN" | "Common Core standards" |
| Time | "15 phút" | "15 minutes" |
| Culture | Đậu ĐH, thi vào lớp 6 | SAT, standardized tests |

---

## 📊 Kiểm Tra Sync

```bash
# Xem overview
npm run blog:sync

# Output example:
📊 BLOG TRANSLATION SYNC CHECK
📝 Vietnamese: 130 published
   English: 5 (3 published)

🔴 Vietnamese posts WITHOUT English: 125
🟢 Vietnamese posts WITH English: 5
   - soroban-la-gi → what-is-soroban ✅

📈 Translation Coverage: 3.8%
```

---

## 🚀 Mở Rộng Thêm Ngôn Ngữ

### Thêm Japanese (ja)
1. Tạo `content/blog/categories.ja.json`
2. Tạo folder `content/blog/posts/ja/`
3. Cập nhật `lib/i18n/config.js`: 
   ```js
   export const locales = ['vi', 'en', 'ja'];
   ```
4. Sử dụng tương tự EN

### Thêm Korean (ko)
- Tương tự Japanese

---

## ⚡ Tối Ưu Performance

### Static Generation
- Tất cả bài blog được Static Generated tại build time
- ISR: Revalidate mỗi 3600s
- **0 runtime queries** cho blog pages

### Hreflang SEO
```html
<link rel="alternate" hreflang="vi" href="https://sorokid.com/blog/soroban-la-gi" />
<link rel="alternate" hreflang="en" href="https://sorokid.com/en/blog/what-is-soroban" />
<link rel="alternate" hreflang="x-default" href="https://sorokid.com/blog/soroban-la-gi" />
```

### Sitemap
- Tự động generate cho cả 2 ngôn ngữ
- Mỗi entry có `alternates` đầy đủ

---

## 📋 Checklist Khi Viết Bài EN

- [ ] Slug chuẩn SEO (có target keyword)
- [ ] Title ≤ 60 ký tự, có keyword
- [ ] Description 150-160 ký tự
- [ ] Author name phù hợp văn hóa
- [ ] Keywords từ English research
- [ ] Intro hook cho EN audience
- [ ] Examples phù hợp bối cảnh Mỹ
- [ ] CTA soft cuối bài
- [ ] FAQ với common EN questions
- [ ] `translations` link đúng
- [ ] `image` giữ nguyên URL
- [ ] `imageAlt` đã localize
- [ ] Status = "published"
