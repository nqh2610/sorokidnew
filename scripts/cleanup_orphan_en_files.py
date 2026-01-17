#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Cleanup orphan EN files - Remove EN posts without matching VI posts
"""

import json
import os
from pathlib import Path

def get_vi_slugs():
    """Get all VI post slugs"""
    BASE = Path(__file__).parent.parent
    VI_POSTS = BASE / 'content' / 'blog' / 'posts'
    
    vi_slugs = set()
    for file_path in VI_POSTS.glob('*.json'):
        if file_path.stem in ['categories', 'categories.en']:
            continue
        vi_slugs.add(file_path.stem)
    
    return vi_slugs

def get_en_files_mapping():
    """Get EN files and their postId (VI slug reference)"""
    BASE = Path(__file__).parent.parent
    EN_POSTS = BASE / 'content' / 'blog' / 'posts' / 'en'
    
    en_files = {}
    for file_path in EN_POSTS.glob('*.json'):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            post_id = data.get('postId') or data.get('translations', {}).get('vi')
            en_files[file_path] = post_id
        except:
            en_files[file_path] = None
    
    return en_files

def find_orphan_en_files():
    """Find EN files that don't have corresponding VI files"""
    vi_slugs = get_vi_slugs()
    en_files = get_en_files_mapping()
    
    orphans = []
    matched = []
    
    for file_path, post_id in en_files.items():
        if post_id and post_id in vi_slugs:
            matched.append((file_path, post_id))
        else:
            orphans.append((file_path, post_id))
    
    return orphans, matched, vi_slugs

def main(dry_run=True, delete=False):
    print("CLEANUP ORPHAN EN FILES")
    print("=" * 60)
    
    orphans, matched, vi_slugs = find_orphan_en_files()
    
    print(f"\n📊 SUMMARY:")
    print(f"   Total VI posts: {len(vi_slugs)}")
    print(f"   Total EN posts: {len(orphans) + len(matched)}")
    print(f"   Matched (1-1):  {len(matched)}")
    print(f"   Orphans (no VI): {len(orphans)}")
    
    if orphans:
        print(f"\n🗑️  ORPHAN EN FILES (no matching VI):")
        for file_path, post_id in sorted(orphans, key=lambda x: x[0].stem):
            print(f"   - {file_path.stem}")
            if post_id:
                print(f"     (references non-existent VI: {post_id})")
        
        if delete and not dry_run:
            print(f"\n⚠️  DELETING {len(orphans)} orphan files...")
            for file_path, _ in orphans:
                os.remove(file_path)
                print(f"   ❌ Deleted: {file_path.stem}")
            print(f"\n✅ Deleted {len(orphans)} orphan EN files")
        elif dry_run:
            print(f"\n[DRY RUN] Would delete {len(orphans)} files")
            print("Run with --delete to actually remove files")
    else:
        print("\n✅ No orphan EN files found - all EN posts have matching VI posts")
    
    return orphans, matched

if __name__ == '__main__':
    import sys
    dry_run = '--delete' not in sys.argv
    delete = '--delete' in sys.argv
    main(dry_run=dry_run, delete=delete)
