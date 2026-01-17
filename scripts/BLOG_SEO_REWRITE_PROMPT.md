# 🚀 PROMPT TỰ ĐỘNG REWRITE BLOG VI → EN (SEO NATIVE)

## 📌 Mục đích
Prompt này dùng để chuyển đổi blog từ tiếng Việt sang tiếng Anh chuẩn SEO, viết như người bản ngữ, tối ưu cho Google US/UK.

---

## 🔥 MASTER PROMPT (Copy & Paste)

```
You are an expert SEO content writer and native English speaker specializing in educational content for Western parents and teachers. Your task is to REWRITE (not translate) a Vietnamese blog post into high-quality, SEO-optimized English.

## CRITICAL RULES - DO NOT VIOLATE:

### ❌ NEVER CHANGE:
- slug
- image
- imageAlt path
- publishedAt
- createdAt
- categoryOrder
- order
- status
- postId
- Any URL or file path

### ✅ MUST REWRITE:
- title (SEO-optimized, include year if relevant)
- description (compelling, 150-160 chars)
- keywords (expand to 8-12 keywords including semantic variants)
- content.intro (engaging storytelling hook)
- content.sections (all text content)
- faq (questions and answers)
- cta.text
- seo.metaTitle
- seo.metaDescription
- seo.keywords

### 📐 OUTPUT STRUCTURE (Must match exactly):
```json
{
  "slug": "[KEEP ORIGINAL]",
  "title": "[REWRITE - SEO optimized, 50-60 chars]",
  "description": "[REWRITE - compelling, 150-160 chars]",
  "category": "[TRANSLATE category name]",
  "keywords": ["[8-12 SEO keywords]"],
  "status": "published",
  "publishedAt": "[KEEP ORIGINAL]",
  "createdAt": "[KEEP ORIGINAL]",
  "image": "[KEEP ORIGINAL]",
  "imageAlt": "[TRANSLATE - descriptive]",
  "readingTime": [CALCULATE based on word count],
  "categoryOrder": [KEEP ORIGINAL],
  "order": [KEEP ORIGINAL],
  "author": {
    "name": "[LOCALIZE - Western name]",
    "role": "[TRANSLATE role]"
  },
  "translations": {
    "vi": "[Vietnamese slug]"
  },
  "content": {
    "intro": "[REWRITE - engaging storytelling hook]",
    "sections": [
      // REWRITE all sections maintaining structure
    ]
  },
  "faq": [
    // REWRITE 8-10 FAQs with SEO-optimized Q&A
  ],
  "cta": {
    "text": "[REWRITE - compelling CTA copy]",
    "buttonText": "[REWRITE - action-oriented]",
    "buttonLink": "[KEEP ORIGINAL]"
  },
  "seo": {
    "metaTitle": "[REWRITE - SEO title with brand]",
    "metaDescription": "[REWRITE - compelling meta]",
    "keywords": "[comma-separated keywords]"
  },
  "schema": {
    "type": "Article",
    "datePublished": "[KEEP ORIGINAL]",
    "author": "[Western author name]"
  },
  "postId": "[KEEP ORIGINAL]"
}
```

## CONTENT GUIDELINES:

### Writing Style:
- Write as a NATIVE English speaker (not translated)
- Use conversational, relatable tone
- Include personal anecdotes and real experiences
- Address Western parents, teachers, and educators
- Reference Western education context (US/UK school systems)
- Use American English spelling and phrases

### SEO Requirements:
- Primary keyword in title, H1, first 100 words
- Secondary keywords naturally distributed
- Include semantic/LSI keywords
- Use proper heading hierarchy (H1 → H2 → H3)
- FAQ section targets featured snippets
- CTA includes relevant internal link

### Content Expansion:
- Make content 20-40% LONGER than original
- Add more detail, examples, and explanations
- Include research-backed claims where relevant
- Add practical tips and actionable advice
- Strengthen intro hook and closing CTA

### Section Types to Maintain:
- "paragraph" - body text
- "heading" - level 2 or 3
- "list" - bullet points with **bold** labels
- "callout" - style: "tip", "empathy", "reassurance", "cta-soft"

## INPUT FORMAT:
I will provide:
1. Vietnamese JSON blog post
2. (Optional) Existing English version to improve

## OUTPUT FORMAT:
- Valid JSON only
- No markdown code blocks around JSON
- No explanations before/after JSON
- Ready to save as .json file

---

NOW REWRITE THE FOLLOWING BLOG POST:
```

---

## 📝 Cách sử dụng

### Bước 1: Copy Master Prompt ở trên

### Bước 2: Paste vào Claude/GPT/Deepseek

### Bước 3: Thêm nội dung Vietnamese JSON

Ví dụ:
```
[PASTE MASTER PROMPT]

NOW REWRITE THE FOLLOWING BLOG POST:

{
  "slug": "con-so-hoc-toan",
  "title": "Con sợ học toán - Làm sao giúp con?",
  ...
}
```

### Bước 4: Nhận output JSON English

### Bước 5: Validate JSON
```bash
python -c "import json; json.load(open('output.json'))"
```

---

## 🔄 Xử lý hàng loạt (Batch Processing)

### Script Python để xử lý nhiều file:

```python
import os
import json
from pathlib import Path

# Đường dẫn
VI_POSTS = "content/blog/posts"
EN_POSTS = "content/blog/posts/en"

# Lấy danh sách file VI chưa có EN
vi_files = set(f.stem for f in Path(VI_POSTS).glob("*.json"))
en_files = set(f.stem for f in Path(EN_POSTS).glob("*.json"))

# Files cần xử lý
need_translation = []
for vi_file in Path(VI_POSTS).glob("*.json"):
    if vi_file.stem == "categories":
        continue
    with open(vi_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        en_slug = data.get('translations', {}).get('en')
        if en_slug:
            en_path = Path(EN_POSTS) / f"{en_slug}.json"
            if not en_path.exists():
                need_translation.append(vi_file.name)
        else:
            need_translation.append(vi_file.name)

print(f"📋 Files cần xử lý: {len(need_translation)}")
for f in need_translation[:10]:
    print(f"  - {f}")
```

---

## ✅ Checklist sau khi rewrite

- [ ] JSON valid (no syntax errors)
- [ ] slug unchanged
- [ ] image/imageAlt unchanged  
- [ ] translations field present
- [ ] faq at ROOT level (not in content)
- [ ] cta object present
- [ ] seo object present
- [ ] schema object present
- [ ] Content longer than original
- [ ] Keywords expanded (8-12)
- [ ] Native English (not word-by-word translation)
- [ ] SEO optimized title/description

---

## 🎯 Keyword Strategy cho Sorokid

### Primary Keywords:
- soroban
- japanese abacus
- mental math
- soroban for kids
- abacus learning

### Secondary Keywords:
- soroban app
- learn soroban at home
- soroban benefits
- mental arithmetic
- anzan mental calculation

### Long-tail Keywords:
- best age to start soroban
- soroban vs kumon
- how to teach soroban to kids
- soroban mental math training
- japanese abacus for beginners

### Semantic Keywords:
- brain training for kids
- math confidence
- visual learning math
- calculation speed
- number sense development

---

## 📊 Quality Metrics

Bài viết tốt cần đạt:
- ✅ Word count: 1500-3000 words
- ✅ Reading time: 8-15 minutes
- ✅ Keywords: 8-12 unique
- ✅ FAQs: 8-10 questions
- ✅ Sections: 50+ content blocks
- ✅ Headings: 8-12 H2/H3
- ✅ Lists: 3-5 bullet lists
- ✅ Callouts: 3-5 tip/empathy boxes

---

*Prompt created for Sorokid Blog SEO Optimization*
*Last updated: January 2026*
