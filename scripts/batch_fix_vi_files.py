#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Batch Fix VI Blog Files - Sorokid
Tự động thêm các fields thiếu cho VI blog posts
"""

import json
from pathlib import Path
from datetime import datetime

def generate_default_faq_vi(vi_data):
    """Tạo FAQ mặc định tiếng Việt dựa trên nội dung"""
    title = vi_data.get('title', 'chủ đề này')
    
    return [
        {
            "question": "Bài viết này dành cho ai?",
            "answer": "Bài viết dành cho phụ huynh có con trong độ tuổi tiểu học (5-12 tuổi), giáo viên và những người quan tâm đến việc phát triển tư duy toán học cho trẻ."
        },
        {
            "question": "Cần bao lâu để thấy kết quả?",
            "answer": "Kết quả phụ thuộc vào từng trẻ, nhưng đa số phụ huynh nhận thấy sự tiến bộ sau 2-4 tuần luyện tập đều đặn."
        },
        {
            "question": "Có cần mua dụng cụ đặc biệt không?",
            "answer": "Hầu hết các hoạt động có thể thực hiện với đồ dùng hàng ngày. Với Soroban, app Sorokid có bàn tính ảo để con thực hành."
        },
        {
            "question": "Phương pháp này có phù hợp với chương trình học ở trường không?",
            "answer": "Có! Các phương pháp trong bài viết được thiết kế để bổ trợ, không thay thế những gì con học ở trường."
        },
        {
            "question": "Bố mẹ không giỏi toán có áp dụng được không?",
            "answer": "Hoàn toàn được. Bài viết hướng dẫn cách đồng hành cùng con mà không cần kiến thức toán cao cấp. App Sorokid cũng có hướng dẫn từng bước."
        }
    ]


def generate_default_cta_vi(vi_data):
    """Tạo CTA mặc định tiếng Việt"""
    return {
        "text": "Sorokid giúp bé học toán tại nhà với lộ trình bài bản, bàn tính ảo, và game vui nhộn. Bố mẹ không cần biết Soroban vẫn đồng hành được cùng con.",
        "buttonText": "Cho con thử học miễn phí",
        "buttonLink": "/register"
    }


def generate_default_seo_vi(vi_data):
    """Tạo SEO object mặc định tiếng Việt"""
    title = vi_data.get('title', '')
    description = vi_data.get('description', '')
    keywords = vi_data.get('keywords', [])
    
    return {
        "title": title,
        "description": description[:160] if description else title,
        "keywords": ", ".join(keywords) if isinstance(keywords, list) else keywords
    }


def generate_default_schema_vi(vi_data):
    """Tạo Schema object mặc định"""
    author = vi_data.get('author', {})
    published = vi_data.get('publishedAt', vi_data.get('createdAt', datetime.now().strftime('%Y-%m-%d')))
    
    # Extract date only
    if isinstance(published, str) and 'T' in published:
        published = published.split('T')[0]
    
    return {
        "type": "Article",
        "datePublished": published,
        "author": author.get('name', 'Sorokid Team')
    }


def fix_vi_file(file_path, dry_run=False):
    """Fix một VI file - thêm các fields thiếu"""
    changes = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        return False, [f"Error reading file: {e}"]
    
    modified = False
    
    # 1. Add faq if missing (at root level)
    if 'faq' not in data:
        data['faq'] = generate_default_faq_vi(data)
        changes.append(f"Added faq with {len(data['faq'])} questions")
        modified = True
    
    # 2. Add cta if missing
    if 'cta' not in data:
        data['cta'] = generate_default_cta_vi(data)
        changes.append("Added cta object")
        modified = True
    
    # 3. Add seo if missing
    if 'seo' not in data:
        data['seo'] = generate_default_seo_vi(data)
        changes.append("Added seo object")
        modified = True
    
    # 4. Add schema if missing
    if 'schema' not in data:
        data['schema'] = generate_default_schema_vi(data)
        changes.append("Added schema object")
        modified = True
    
    # 5. Fix missing basic fields
    if 'createdAt' not in data:
        published = data.get('publishedAt', '')
        if published and 'T' in published:
            data['createdAt'] = published.split('T')[0]
        else:
            data['createdAt'] = datetime.now().strftime('%Y-%m-%d')
        changes.append(f"Added createdAt = {data['createdAt']}")
        modified = True
    
    if 'imageAlt' not in data and 'image' in data:
        title = data.get('title', 'Hình ảnh bài viết')
        data['imageAlt'] = title
        changes.append("Added imageAlt")
        modified = True
    
    if 'image' not in data:
        data['image'] = "/blog/default-blog-image.jpg"
        changes.append("Added default image")
        modified = True
    
    if 'readingTime' not in data:
        # Estimate from content
        content = data.get('content', {})
        word_count = len(str(content).split())
        data['readingTime'] = max(5, min(20, word_count // 150))
        changes.append(f"Added readingTime = {data['readingTime']}")
        modified = True
    
    # 6. Ensure keywords is array
    if 'keywords' in data:
        keywords = data['keywords']
        if isinstance(keywords, str):
            data['keywords'] = [k.strip() for k in keywords.split(',')]
            changes.append("Converted keywords to array")
            modified = True
    
    # 7. Add translations if has EN version
    if 'translations' not in data:
        # Check if EN version exists
        EN_POSTS = file_path.parent / 'en'
        vi_slug = file_path.stem
        
        # Look for EN file that references this VI
        for en_file in EN_POSTS.glob('*.json'):
            try:
                with open(en_file, 'r', encoding='utf-8') as f:
                    en_data = json.load(f)
                if en_data.get('postId') == vi_slug or en_data.get('translations', {}).get('vi') == vi_slug:
                    data['translations'] = {"en": en_file.stem}
                    changes.append(f"Added translations.en = {en_file.stem}")
                    modified = True
                    break
            except:
                pass
    
    # Save if modified
    if modified and not dry_run:
        # Reorder keys for consistency
        ordered_keys = [
            'slug', 'title', 'description', 'category', 'keywords',
            'status', 'publishedAt', 'createdAt', 'image', 'imageAlt',
            'readingTime', 'categoryOrder', 'order', 'author', 'translations',
            'content', 'faq', 'cta', 'seo', 'schema'
        ]
        
        ordered_data = {}
        for key in ordered_keys:
            if key in data:
                ordered_data[key] = data[key]
        
        # Add any remaining keys
        for key in data:
            if key not in ordered_data:
                ordered_data[key] = data[key]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(ordered_data, f, ensure_ascii=False, indent=2)
    
    return modified, changes


def batch_fix_vi_files(dry_run=False):
    """Fix tất cả VI files"""
    BASE = Path(__file__).parent.parent
    VI_POSTS = BASE / 'content' / 'blog' / 'posts'
    
    print("BATCH FIX VI BLOG FILES")
    print("=" * 60)
    
    if dry_run:
        print("DRY RUN MODE - No files will be modified\n")
    
    stats = {
        'total': 0,
        'fixed': 0,
        'skipped': 0,
        'errors': 0
    }
    
    for file_path in sorted(VI_POSTS.glob('*.json')):
        if file_path.stem in ['categories', 'categories.en']:
            continue
        
        stats['total'] += 1
        
        modified, changes = fix_vi_file(file_path, dry_run)
        
        if changes and changes[0].startswith('Error'):
            stats['errors'] += 1
            print(f"[ERROR] {file_path.stem}")
            print(f"   {changes[0]}")
        elif modified:
            stats['fixed'] += 1
            print(f"[FIXED] {file_path.stem}")
            for change in changes[:3]:
                print(f"   + {change}")
            if len(changes) > 3:
                print(f"   + ... and {len(changes) - 3} more changes")
        else:
            stats['skipped'] += 1
    
    print("\n" + "=" * 60)
    print("SUMMARY:")
    print(f"   Total files:  {stats['total']}")
    print(f"   Fixed:        {stats['fixed']}")
    print(f"   Skipped:      {stats['skipped']} (already valid)")
    print(f"   Errors:       {stats['errors']}")
    
    if dry_run:
        print("\nRun without --dry-run to apply changes")
    
    return stats


if __name__ == '__main__':
    import sys
    
    dry_run = '--dry-run' in sys.argv
    batch_fix_vi_files(dry_run=dry_run)
