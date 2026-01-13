# 🎯 SEO KEYWORDS IMPLEMENTATION GUIDE - SOROKID

## Mục lục
1. [Tổng quan hệ sinh thái từ khóa](#1-tổng-quan-hệ-sinh-thái-từ-khóa)
2. [Phân loại theo Search Intent](#2-phân-loại-theo-search-intent)
3. [Mapping từ khóa vào Pages](#3-mapping-từ-khóa-vào-pages)
4. [Triển khai chi tiết](#4-triển-khai-chi-tiết)
5. [JSON-LD Schema](#5-json-ld-schema)
6. [FAQ Schema](#6-faq-schema)
7. [Checklist triển khai](#7-checklist-triển-khai)

---

## 1. Tổng quan hệ sinh thái từ khóa

### 📊 Số liệu tổng hợp

| Nhóm từ khóa | Số lượng | Mục đích |
|--------------|----------|----------|
| Head Keywords (Brand, App, Method) | ~25 | Ranking chính |
| Semantic Keywords | ~50 | Bao phủ ngữ nghĩa |
| Long-tail Keywords | ~30 | Traffic chất lượng |
| Question Keywords | ~30 | Featured Snippets |
| Comparison Keywords | ~10 | Commercial Intent |
| Need-based Keywords | ~20 | Pain point targeting |
| International Keywords | ~15 | Global reach |

**Tổng: ~180+ từ khóa** được phân loại trong `config/seo-keywords.config.js`

---

## 2. Phân loại theo Search Intent

### 🔍 Informational (Tìm hiểu thông tin)
- "Soroban là gì"
- "Lợi ích học soroban"
- "Trẻ mấy tuổi học soroban"
- **Chiến lược**: Blog, FAQ, nội dung giáo dục

### 🎯 Navigational (Tìm thương hiệu)
- "Sorokid"
- "Sorokid app"
- "Sorokid login"
- **Chiến lược**: Homepage, branded pages

### 📊 Commercial (So sánh, đánh giá)
- "App học soroban nào tốt"
- "So sánh soroban vs kumon"
- "Review sorokid"
- **Chiến lược**: Landing pages, testimonials

### 💰 Transactional (Mua/đăng ký)
- "Đăng ký học soroban"
- "Tải app soroban"
- "Học thử miễn phí"
- **Chiến lược**: Pricing, CTA buttons

---

## 3. Mapping từ khóa vào Pages

### 🏠 Homepage (sorokid.com)

| Vị trí | Từ khóa |
|--------|---------|
| **Title** | Sorokid - Ứng Dụng Học Soroban Tốt Nhất \| Học Toán Tư Duy Cho Bé |
| **Meta Description** | Sorokid - Ứng dụng học Soroban tốt nhất cho trẻ 6-12 tuổi. Phương pháp Nhật Bản chuẩn, lộ trình khoa học, game hóa học tập... |
| **H1** | Học Soroban Online - Phương pháp Nhật Bản cho trẻ tiểu học |
| **H2** | Tại sao nên học Soroban? / Lộ trình học rõ ràng / Phụ huynh dễ dàng kèm con |
| **Keywords in content** | soroban, toán tư duy, tính nhẩm, bàn tính nhật bản |

### 📚 Learn Page (sorokid.com/learn)

| Vị trí | Từ khóa |
|--------|---------|
| **Title** | Học Soroban Online - Lộ Trình Chuẩn Nhật Bản \| Sorokid |
| **Meta Description** | Bài học Soroban từ cơ bản đến nâng cao với hướng dẫn từng bước... |
| **H1** | Bài học Soroban từ cơ bản đến nâng cao |
| **Keywords** | học soroban online, lộ trình học soroban, video học soroban |

### 🎯 Practice Page (sorokid.com/practice)

| Vị trí | Từ khóa |
|--------|---------|
| **Title** | Luyện Tập Soroban - Bài Tập Tính Nhẩm Mỗi Ngày \| Sorokid |
| **Meta Description** | Luyện tập Soroban hàng ngày với bài tập đa dạng... |
| **H1** | Luyện tập Soroban - Rèn phản xạ tính nhẩm |
| **Keywords** | luyện soroban, bài tập soroban, flash anzan |

### 💰 Pricing Page (sorokid.com/pricing)

| Vị trí | Từ khóa |
|--------|---------|
| **Title** | Bảng Giá Sorokid - Gói Học Soroban Online Cho Bé |
| **Meta Description** | Các gói học Soroban online tại Sorokid... |
| **H1** | Bảng giá Sorokid |
| **Keywords** | giá khóa học soroban, học soroban giá rẻ, học thử miễn phí |

### 📝 Blog (sorokid.com/blog)

| Vị trí | Từ khóa |
|--------|---------|
| **Title** | Blog Sorokid - Kiến Thức Soroban & Mẹo Học Toán Cho Con |
| **Keywords** | kiến thức soroban, mẹo học toán, phụ huynh đồng hành |
| **Target**: Informational keywords, FAQ, How-to |

---

## 4. Triển khai chi tiết

### A. Title Tag (60-70 ký tự)

```
Pattern: [Primary Keyword] - [Secondary Keyword] | [Brand]
```

**Ví dụ**:
- Homepage: `Sorokid - Ứng Dụng Học Soroban Tốt Nhất | Học Toán Tư Duy Cho Bé`
- Learn: `Học Soroban Online - Lộ Trình Chuẩn Nhật Bản | Sorokid`
- Pricing: `Bảng Giá Sorokid - Gói Học Soroban Online Cho Bé | Học Thử Miễn Phí`

### B. Meta Description (150-160 ký tự)

**Yêu cầu**:
- Chứa keyword chính
- Có CTA (call-to-action)
- Tạo urgency/benefit

**Ví dụ Homepage**:
```
Sorokid - Ứng dụng học Soroban tốt nhất cho trẻ 6-12 tuổi. Phương pháp Nhật Bản chuẩn, 
lộ trình khoa học, game hóa học tập. Phụ huynh không cần biết Soroban. Học thử miễn phí!
```

### C. H1-H6 Hierarchy

```
H1: [Primary Keyword - chỉ 1 H1 trên trang]
  H2: [Secondary Keywords - features, benefits]
    H3: [Supporting content]
  H2: [Another section with keyword]
    H3: [Details]
```

### D. Alt Text cho Images

```
Pattern: [Mô tả + Keyword tự nhiên]
```

**Ví dụ**:
- ❌ "soroban app học soroban ứng dụng soroban" (spam)
- ✅ "Giao diện bài học Soroban trong app Sorokid cho trẻ tiểu học"

---

## 5. JSON-LD Schema

### Đã triển khai trong `config/seo-schema.config.js`:

| Schema Type | Trang | Mục đích |
|-------------|-------|----------|
| Organization | All | Brand identity |
| WebApplication | Homepage | App Store rich results |
| FAQPage | Homepage, Pricing | FAQ rich snippets |
| Course | Learn | Course rich results |
| HowTo | Homepage | How-to snippets |
| Product | Pricing | Product rich results |
| BreadcrumbList | All | Navigation |

### Cách sử dụng:

```jsx
import { generateHomepageSchema } from '@/config/seo-schema.config';

// Trong component
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(generateHomepageSchema())
  }}
/>
```

---

## 6. FAQ Schema

### FAQ cho Homepage (trong `config/seo-keywords.config.js`):

| Câu hỏi | Target Keyword |
|---------|----------------|
| Soroban là gì? | soroban là gì |
| Trẻ mấy tuổi có thể học Soroban? | trẻ mấy tuổi học soroban |
| Học Soroban có lợi ích gì? | lợi ích học soroban |
| Sorokid khác gì với các app khác? | app soroban tốt nhất |
| Phụ huynh không biết Soroban có dạy con được không? | phụ huynh không biết soroban |
| Học Soroban online có hiệu quả không? | học soroban online hiệu quả |

### FAQ cho Pricing:

| Câu hỏi | Target Keyword |
|---------|----------------|
| Sorokid có miễn phí không? | sorokid miễn phí |
| Làm sao để học thử Sorokid? | học thử sorokid |

---

## 7. Checklist triển khai

### ✅ Đã hoàn thành:

- [x] Tạo file `config/seo-keywords.config.js` - Hệ sinh thái 180+ từ khóa
- [x] Tạo file `config/seo-schema.config.js` - JSON-LD generators
- [x] Phân loại keywords theo Search Intent
- [x] Mapping keywords vào pages
- [x] FAQ data cho Homepage và Pricing

### 📋 Cần triển khai:

- [ ] Cập nhật metadata trong `app/layout.jsx` với title mới
- [ ] Thêm JSON-LD vào Homepage
- [ ] Thêm JSON-LD vào Learn page
- [ ] Thêm JSON-LD vào Pricing page
- [ ] Cập nhật alt text cho images
- [ ] Thêm internal links giữa các pages
- [ ] Tối ưu h1-h6 hierarchy trên mỗi page

### 🎯 Priority Actions:

1. **Cao**: Thêm FAQ Schema vào Homepage (Featured Snippets)
2. **Cao**: Cập nhật meta description với keywords mới
3. **Trung bình**: Thêm HowTo Schema
4. **Trung bình**: Cập nhật Course Schema cho Learn page
5. **Thấp**: International keywords cho English content

---

## 📁 File Structure

```
config/
├── seo-keywords.config.js    # 🆕 Hệ sinh thái từ khóa
├── seo-schema.config.js      # 🆕 JSON-LD generators
├── seo-sorokid.config.js     # Existing SEO config
└── seo-toolbox.config.js     # Toolbox SEO config

docs/
├── SEO_KEYWORDS_GUIDE.md     # 🆕 Tài liệu này
├── PERFORMANCE_CHECKLIST.md  # Performance checklist
└── BLOG_TOOLBOX_OPTIMIZATION.md
```

---

## 📈 Kỳ vọng kết quả

| Metric | Hiện tại | Mục tiêu (3 tháng) |
|--------|----------|-------------------|
| Indexed Keywords | ~50 | ~150+ |
| Featured Snippets | 0 | 5-10 |
| Rich Results | 1-2 | 10+ |
| Organic Traffic | Baseline | +50% |
| Core Web Vitals | Good | Good |

---

## ⚠️ Lưu ý quan trọng

1. **KHÔNG SPAM**: Keywords phải xuất hiện tự nhiên
2. **UX FIRST**: SEO không được làm xấu trải nghiệm người dùng
3. **MONITOR**: Theo dõi Search Console hàng tuần
4. **ITERATE**: Điều chỉnh dựa trên data thực tế
5. **PATIENCE**: SEO cần 3-6 tháng để có kết quả

---

*Tài liệu này được tạo để hướng dẫn triển khai SEO toàn diện cho Sorokid website.*
*Cập nhật: 2024*
