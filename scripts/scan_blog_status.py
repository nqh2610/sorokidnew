#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Scan Blog Status - Sorokid
Quét tất cả bài blog VI và kiểm tra trạng thái EN
"""

import json
from pathlib import Path

def scan_blog_status():
    # Paths
    BASE = Path(__file__).parent.parent
    VI_POSTS = BASE / 'content' / 'blog' / 'posts'
    EN_POSTS = VI_POSTS / 'en'

    # Stats
    total_vi = 0
    has_en = 0
    missing_en = []
    need_update = []
    en_missing_fields = []

    print("📊 SOROKID BLOG STATUS REPORT")
    print("=" * 60)
    
    # Scan VI posts
    for vi_file in sorted(VI_POSTS.glob('*.json')):
        if vi_file.stem in ['categories', 'categories.en']:
            continue
        total_vi += 1
        
        with open(vi_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        en_slug = data.get('translations', {}).get('en')
        if en_slug:
            en_path = EN_POSTS / f'{en_slug}.json'
            if en_path.exists():
                has_en += 1
                # Check if EN needs update (missing fields)
                with open(en_path, 'r', encoding='utf-8') as f:
                    en_data = json.load(f)
                
                missing = []
                if 'faq' not in en_data:
                    missing.append('faq')
                if 'cta' not in en_data:
                    missing.append('cta')
                if 'seo' not in en_data:
                    missing.append('seo')
                if 'schema' not in en_data:
                    missing.append('schema')
                if 'translations' not in en_data:
                    missing.append('translations')
                
                if missing:
                    en_missing_fields.append({
                        'slug': en_slug,
                        'missing': missing
                    })
            else:
                missing_en.append({
                    'vi_slug': vi_file.stem,
                    'en_slug': en_slug,
                    'title': data.get('title', 'N/A')
                })
        else:
            missing_en.append({
                'vi_slug': vi_file.stem,
                'en_slug': None,
                'title': data.get('title', 'N/A')
            })

    # Print Results
    print(f"\n📈 SUMMARY:")
    print(f"   Total VI posts:     {total_vi}")
    print(f"   Has EN version:     {has_en}")
    print(f"   Missing EN:         {len(missing_en)}")
    print(f"   EN needs update:    {len(en_missing_fields)}")
    
    coverage = (has_en / total_vi * 100) if total_vi > 0 else 0
    print(f"   Coverage:           {coverage:.1f}%")
    
    if missing_en:
        print(f"\n❌ MISSING EN TRANSLATIONS ({len(missing_en)}):")
        for i, item in enumerate(missing_en[:15], 1):
            print(f"   {i:2}. {item['vi_slug']}")
            print(f"       → {item['title'][:50]}...")
        if len(missing_en) > 15:
            print(f"   ... and {len(missing_en) - 15} more")
    
    if en_missing_fields:
        print(f"\n⚠️  EN FILES NEED UPDATE ({len(en_missing_fields)}):")
        for i, item in enumerate(en_missing_fields[:10], 1):
            print(f"   {i:2}. {item['slug']}")
            print(f"       Missing: {', '.join(item['missing'])}")
        if len(en_missing_fields) > 10:
            print(f"   ... and {len(en_missing_fields) - 10} more")
    
    # Export to JSON for further processing
    report = {
        'total_vi': total_vi,
        'has_en': has_en,
        'missing_en': missing_en,
        'en_missing_fields': en_missing_fields,
        'coverage_percent': coverage
    }
    
    report_path = BASE / 'scripts' / 'blog_status_report.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Report saved to: {report_path}")
    print("=" * 60)
    
    return report

if __name__ == '__main__':
    scan_blog_status()
