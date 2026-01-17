#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Final Fix - Add missing author/image fields to all blog posts
"""

import json
from pathlib import Path

DEFAULT_AUTHOR = {
    "name": "Minh Anh",
    "bio": "Mẹ của 2 bé, đang đồng hành cùng con học toán tư duy"
}

DEFAULT_AUTHOR_EN = {
    "name": "Minh Anh",
    "bio": "Mom of two, helping my kids build strong math foundations"
}


def fix_file(file_path, is_english=False):
    """Fix missing author field only - DO NOT touch image/imageAlt"""
    changes = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        return False, [f"Error reading: {e}"]
    
    modified = False
    
    # Fix missing author ONLY
    if 'author' not in data:
        data['author'] = DEFAULT_AUTHOR_EN if is_english else DEFAULT_AUTHOR
        changes.append("Added author")
        modified = True
    
    # DO NOT modify image or imageAlt - keep existing values
    
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    return modified, changes


def main():
    BASE = Path(__file__).parent.parent
    VI_POSTS = BASE / 'content' / 'blog' / 'posts'
    EN_POSTS = VI_POSTS / 'en'
    
    print("FINAL FIX - Author/Image Fields")
    print("=" * 60)
    
    stats = {'vi_fixed': 0, 'en_fixed': 0}
    
    # Fix VI files
    print("\n📚 Vietnamese Posts:")
    for file_path in sorted(VI_POSTS.glob('*.json')):
        if file_path.stem in ['categories', 'categories.en']:
            continue
        modified, changes = fix_file(file_path, is_english=False)
        if modified:
            stats['vi_fixed'] += 1
            print(f"  [FIXED] {file_path.stem}: {', '.join(changes)}")
    
    # Fix EN files
    print("\n📚 English Posts:")
    for file_path in sorted(EN_POSTS.glob('*.json')):
        modified, changes = fix_file(file_path, is_english=True)
        if modified:
            stats['en_fixed'] += 1
            print(f"  [FIXED] {file_path.stem}: {', '.join(changes)}")
    
    print("\n" + "=" * 60)
    print(f"SUMMARY: Fixed {stats['vi_fixed']} VI files, {stats['en_fixed']} EN files")


if __name__ == '__main__':
    main()
