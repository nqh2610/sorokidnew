#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Batch Fix EN Blog Files - Sorokid
Tự động thêm các fields thiếu cho EN blog posts
"""

import json
from pathlib import Path
from datetime import datetime

def get_vi_slug_from_en(en_data, en_file_path):
    """Tìm VI slug tương ứng từ EN file"""
    # Nếu có postId, đó chính là VI slug
    if 'postId' in en_data:
        return en_data['postId']
    
    # Tìm trong VI posts xem file nào link đến EN này
    VI_POSTS = en_file_path.parent.parent
    en_slug = en_data.get('slug', en_file_path.stem)
    
    for vi_file in VI_POSTS.glob('*.json'):
        if vi_file.stem in ['categories', 'categories.en']:
            continue
        try:
            with open(vi_file, 'r', encoding='utf-8') as f:
                vi_data = json.load(f)
            if vi_data.get('translations', {}).get('en') == en_slug:
                return vi_file.stem
        except:
            pass
    
    return en_slug  # Fallback to EN slug


def generate_default_faq(en_data):
    """Tạo FAQ mặc định dựa trên nội dung"""
    title = en_data.get('title', 'this topic')
    
    return [
        {
            "question": f"What will I learn from this article?",
            "answer": f"This article covers {en_data.get('description', 'practical tips and insights for parents and educators')}."
        },
        {
            "question": "Is this advice suitable for all ages?",
            "answer": "The strategies discussed are primarily designed for children ages 5-12, but many principles can be adapted for different age groups."
        },
        {
            "question": "How long does it take to see results?",
            "answer": "Results vary by child, but most parents notice improvements within 2-4 weeks of consistent practice."
        },
        {
            "question": "Do I need special materials or equipment?",
            "answer": "Most activities can be done with everyday items. For Soroban-specific learning, the Sorokid app provides a virtual abacus."
        },
        {
            "question": "Can I use these methods alongside school curriculum?",
            "answer": "Absolutely! These approaches are designed to complement, not replace, what children learn at school."
        }
    ]


def generate_default_cta(en_data):
    """Tạo CTA mặc định"""
    return {
        "text": "Ready to help your child build math confidence? Sorokid offers interactive lessons, games, and progress tracking designed for busy families.",
        "buttonText": "Start Free Trial",
        "buttonLink": "/register"
    }


def generate_default_seo(en_data):
    """Tạo SEO object mặc định"""
    title = en_data.get('title', '')
    description = en_data.get('description', '')
    keywords = en_data.get('keywords', [])
    
    return {
        "metaTitle": f"{title} | Sorokid",
        "metaDescription": description[:160] if description else title,
        "keywords": ", ".join(keywords) if isinstance(keywords, list) else keywords
    }


def generate_default_schema(en_data):
    """Tạo Schema object mặc định"""
    author = en_data.get('author', {})
    published = en_data.get('publishedAt', en_data.get('createdAt', datetime.now().strftime('%Y-%m-%d')))
    
    # Extract date only
    if isinstance(published, str) and 'T' in published:
        published = published.split('T')[0]
    
    return {
        "type": "Article",
        "datePublished": published,
        "author": author.get('name', 'Sorokid Team')
    }


def fix_en_file(file_path, dry_run=False):
    """Fix một EN file - thêm các fields thiếu"""
    changes = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        return False, [f"Error reading file: {e}"]
    
    modified = False
    
    # 1. Add translations if missing
    if 'translations' not in data:
        vi_slug = get_vi_slug_from_en(data, file_path)
        data['translations'] = {"vi": vi_slug}
        changes.append(f"Added translations.vi = {vi_slug}")
        modified = True
    
    # 2. Add postId if missing
    if 'postId' not in data:
        vi_slug = data.get('translations', {}).get('vi', file_path.stem)
        data['postId'] = vi_slug
        changes.append(f"Added postId = {vi_slug}")
        modified = True
    
    # 3. Add faq if missing (at root level)
    if 'faq' not in data:
        data['faq'] = generate_default_faq(data)
        changes.append(f"Added faq with {len(data['faq'])} questions")
        modified = True
    
    # 4. Add cta if missing
    if 'cta' not in data:
        data['cta'] = generate_default_cta(data)
        changes.append("Added cta object")
        modified = True
    
    # 5. Add seo if missing
    if 'seo' not in data:
        data['seo'] = generate_default_seo(data)
        changes.append("Added seo object")
        modified = True
    
    # 6. Add schema if missing
    if 'schema' not in data:
        data['schema'] = generate_default_schema(data)
        changes.append("Added schema object")
        modified = True
    
    # 7. Fix missing basic fields
    if 'createdAt' not in data:
        published = data.get('publishedAt', '')
        if published and 'T' in published:
            data['createdAt'] = published.split('T')[0]
        else:
            data['createdAt'] = datetime.now().strftime('%Y-%m-%d')
        changes.append(f"Added createdAt = {data['createdAt']}")
        modified = True
    
    if 'imageAlt' not in data and 'image' in data:
        title = data.get('title', 'Blog post image')
        data['imageAlt'] = f"{title} - Sorokid"
        changes.append("Added imageAlt")
        modified = True
    
    if 'readingTime' not in data:
        # Estimate from content
        content = data.get('content', {})
        word_count = len(str(content).split())
        data['readingTime'] = max(5, min(20, word_count // 200))
        changes.append(f"Added readingTime = {data['readingTime']}")
        modified = True
    
    # 8. Ensure keywords is array with enough items
    if 'keywords' in data:
        keywords = data['keywords']
        if isinstance(keywords, str):
            data['keywords'] = [k.strip() for k in keywords.split(',')]
            changes.append("Converted keywords to array")
            modified = True
    
    # Save if modified
    if modified and not dry_run:
        # Reorder keys for consistency
        ordered_keys = [
            'slug', 'title', 'description', 'category', 'keywords',
            'status', 'publishedAt', 'createdAt', 'image', 'imageAlt',
            'readingTime', 'categoryOrder', 'order', 'author', 'translations',
            'content', 'faq', 'cta', 'seo', 'schema', 'postId'
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


def batch_fix_en_files(dry_run=False):
    """Fix tất cả EN files"""
    BASE = Path(__file__).parent.parent
    EN_POSTS = BASE / 'content' / 'blog' / 'posts' / 'en'
    
    print("🔧 BATCH FIX EN BLOG FILES")
    print("=" * 60)
    
    if dry_run:
        print("⚠️  DRY RUN MODE - No files will be modified\n")
    
    stats = {
        'total': 0,
        'fixed': 0,
        'skipped': 0,
        'errors': 0
    }
    
    for file_path in sorted(EN_POSTS.glob('*.json')):
        stats['total'] += 1
        
        modified, changes = fix_en_file(file_path, dry_run)
        
        if changes and changes[0].startswith('Error'):
            stats['errors'] += 1
            print(f"❌ {file_path.stem}")
            print(f"   {changes[0]}")
        elif modified:
            stats['fixed'] += 1
            print(f"✅ {file_path.stem}")
            for change in changes[:3]:
                print(f"   • {change}")
            if len(changes) > 3:
                print(f"   • ... and {len(changes) - 3} more changes")
        else:
            stats['skipped'] += 1
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY:")
    print(f"   Total files:  {stats['total']}")
    print(f"   Fixed:        {stats['fixed']}")
    print(f"   Skipped:      {stats['skipped']} (already valid)")
    print(f"   Errors:       {stats['errors']}")
    
    if dry_run:
        print("\n💡 Run without --dry-run to apply changes")
    
    return stats


if __name__ == '__main__':
    import sys
    
    dry_run = '--dry-run' in sys.argv
    batch_fix_en_files(dry_run=dry_run)
