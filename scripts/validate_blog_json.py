#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Validate Blog JSON - Sorokid
Kiểm tra tính hợp lệ của file JSON blog
"""

import json
import sys
from pathlib import Path

# Required fields for Vietnamese posts
VI_REQUIRED_FIELDS = [
    'slug', 'title', 'description', 'category', 'keywords',
    'status', 'publishedAt', 'createdAt', 'image', 'imageAlt',
    'readingTime', 'author', 'content', 'faq', 'cta', 'seo'
]

# Required fields for English posts
EN_REQUIRED_FIELDS = [
    'slug', 'title', 'description', 'category', 'keywords',
    'status', 'publishedAt', 'createdAt', 'image', 'imageAlt',
    'readingTime', 'author', 'translations', 'content', 'faq', 
    'cta', 'seo', 'schema', 'postId'
]

# Content structure requirements
CONTENT_REQUIRED = ['intro', 'sections']

# CTA structure requirements
CTA_REQUIRED = ['text', 'buttonText', 'buttonLink']

# SEO structure requirements (accept both formats)
SEO_REQUIRED = ['title', 'description', 'keywords']

# Schema structure requirements
SCHEMA_REQUIRED = ['type', 'datePublished', 'author']


def validate_json_syntax(file_path):
    """Check if file is valid JSON"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return True, data, None
    except json.JSONDecodeError as e:
        return False, None, f"JSON syntax error: {e}"
    except Exception as e:
        return False, None, f"File error: {e}"


def validate_required_fields(data, required_fields, context=""):
    """Check if all required fields exist"""
    errors = []
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {context}{field}")
    return errors


def validate_content_structure(data):
    """Validate content object structure"""
    errors = []
    
    if 'content' not in data:
        return ["Missing 'content' object"]
    
    content = data['content']
    
    # Check required content fields
    for field in CONTENT_REQUIRED:
        if field not in content:
            errors.append(f"Missing content.{field}")
    
    # Validate sections array
    if 'sections' in content:
        if not isinstance(content['sections'], list):
            errors.append("content.sections must be an array")
        else:
            for i, section in enumerate(content['sections']):
                if 'type' not in section:
                    errors.append(f"Section {i} missing 'type' field")
                    
    return errors


def validate_faq_structure(data):
    """Validate FAQ array structure"""
    errors = []
    
    if 'faq' not in data:
        return ["Missing 'faq' array at root level"]
    
    faq = data['faq']
    
    if not isinstance(faq, list):
        return ["'faq' must be an array"]
    
    for i, item in enumerate(faq):
        if 'question' not in item:
            errors.append(f"FAQ {i} missing 'question'")
        if 'answer' not in item:
            errors.append(f"FAQ {i} missing 'answer'")
    
    return errors


def validate_cta_structure(data):
    """Validate CTA object structure"""
    errors = []
    
    if 'cta' not in data:
        return ["Missing 'cta' object"]
    
    cta = data['cta']
    
    for field in CTA_REQUIRED:
        if field not in cta:
            errors.append(f"Missing cta.{field}")
    
    return errors


def validate_seo_structure(data):
    """Validate SEO object structure"""
    errors = []
    
    if 'seo' not in data:
        return ["Missing 'seo' object"]
    
    seo = data['seo']
    
    # Check for either old format (title/description) or new format (metaTitle/metaDescription)
    has_old_format = 'title' in seo or 'description' in seo
    has_new_format = 'metaTitle' in seo or 'metaDescription' in seo
    
    if not has_old_format and not has_new_format:
        errors.append("SEO must have title/metaTitle and description/metaDescription")
    
    if 'keywords' not in seo:
        errors.append("Missing seo.keywords")
    
    return errors


def validate_blog_json(file_path, is_english=False):
    """Main validation function"""
    results = {
        'file': str(file_path),
        'valid': True,
        'errors': [],
        'warnings': []
    }
    
    # 1. Check JSON syntax
    is_valid, data, error = validate_json_syntax(file_path)
    if not is_valid:
        results['valid'] = False
        results['errors'].append(error)
        return results
    
    # 2. Check required fields
    required = EN_REQUIRED_FIELDS if is_english else VI_REQUIRED_FIELDS
    errors = validate_required_fields(data, required)
    results['errors'].extend(errors)
    
    # 3. Validate content structure
    errors = validate_content_structure(data)
    results['errors'].extend(errors)
    
    # 4. Validate FAQ structure
    errors = validate_faq_structure(data)
    results['errors'].extend(errors)
    
    # 5. Validate CTA structure
    errors = validate_cta_structure(data)
    results['errors'].extend(errors)
    
    # 6. Validate SEO structure
    errors = validate_seo_structure(data)
    results['errors'].extend(errors)
    
    # 7. Check schema for English
    if is_english:
        if 'schema' not in data:
            results['errors'].append("Missing 'schema' object")
        else:
            for field in SCHEMA_REQUIRED:
                if field not in data['schema']:
                    results['errors'].append(f"Missing schema.{field}")
    
    # 8. Quality warnings
    if 'keywords' in data:
        if len(data['keywords']) < 5:
            results['warnings'].append(f"Only {len(data['keywords'])} keywords (recommend 8-12)")
    
    if 'faq' in data and isinstance(data['faq'], list):
        if len(data['faq']) < 5:
            results['warnings'].append(f"Only {len(data['faq'])} FAQs (recommend 8-10)")
    
    if 'content' in data and 'sections' in data['content']:
        sections = data['content']['sections']
        if len(sections) < 30:
            results['warnings'].append(f"Only {len(sections)} sections (recommend 50+)")
    
    # Set final validity
    results['valid'] = len(results['errors']) == 0
    
    return results


def validate_all_blogs():
    """Validate all blog files in the project"""
    BASE = Path(__file__).parent.parent
    VI_POSTS = BASE / 'content' / 'blog' / 'posts'
    EN_POSTS = VI_POSTS / 'en'
    
    all_results = {
        'vi': {'valid': 0, 'invalid': 0, 'files': []},
        'en': {'valid': 0, 'invalid': 0, 'files': []}
    }
    
    print("🔍 VALIDATING BLOG JSON FILES")
    print("=" * 60)
    
    # Validate Vietnamese posts
    print("\n📚 Vietnamese Posts:")
    for file_path in sorted(VI_POSTS.glob('*.json')):
        if file_path.stem in ['categories', 'categories.en']:
            continue
        
        result = validate_blog_json(file_path, is_english=False)
        
        if result['valid']:
            all_results['vi']['valid'] += 1
            status = "✅"
        else:
            all_results['vi']['invalid'] += 1
            status = "❌"
            all_results['vi']['files'].append(result)
        
        if not result['valid'] or result['warnings']:
            print(f"  {status} {file_path.stem}")
            for err in result['errors'][:3]:
                print(f"      ❌ {err}")
            for warn in result['warnings'][:2]:
                print(f"      ⚠️  {warn}")
    
    # Validate English posts
    print("\n📚 English Posts:")
    for file_path in sorted(EN_POSTS.glob('*.json')):
        result = validate_blog_json(file_path, is_english=True)
        
        if result['valid']:
            all_results['en']['valid'] += 1
            status = "✅"
        else:
            all_results['en']['invalid'] += 1
            status = "❌"
            all_results['en']['files'].append(result)
        
        print(f"  {status} {file_path.stem}")
        for err in result['errors'][:3]:
            print(f"      ❌ {err}")
        for warn in result['warnings'][:2]:
            print(f"      ⚠️  {warn}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 VALIDATION SUMMARY:")
    print(f"   Vietnamese: {all_results['vi']['valid']} valid, {all_results['vi']['invalid']} invalid")
    print(f"   English:    {all_results['en']['valid']} valid, {all_results['en']['invalid']} invalid")
    
    return all_results


def validate_single_file(file_path):
    """Validate a single file (for command line use)"""
    path = Path(file_path)
    is_english = 'en' in str(path.parent)
    
    result = validate_blog_json(path, is_english=is_english)
    
    print(f"\n🔍 Validating: {path.name}")
    print("=" * 50)
    
    if result['valid']:
        print("✅ JSON is VALID!")
    else:
        print("❌ JSON is INVALID!")
        print("\nErrors:")
        for err in result['errors']:
            print(f"  • {err}")
    
    if result['warnings']:
        print("\nWarnings:")
        for warn in result['warnings']:
            print(f"  ⚠️  {warn}")
    
    return result['valid']


if __name__ == '__main__':
    if len(sys.argv) > 1:
        # Validate single file
        success = validate_single_file(sys.argv[1])
        sys.exit(0 if success else 1)
    else:
        # Validate all files
        validate_all_blogs()
