#!/usr/bin/env python3
import os
import re
from pathlib import Path

blog_dir = Path("src/content/blog")
fixed_count = 0
failed_count = 0

for md_file in sorted(blog_dir.rglob("*.md")):
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'description: "이 글을 읽어보세요."' not in content:
            continue
        
        # Extract summary from "## 한줄 요약" section
        match = re.search(r'^## 한줄 요약\s*\n\n(.+?)(?:\n\n|$)', content, re.MULTILINE)
        
        if not match:
            failed_count += 1
            print(f"⚠ No summary found: {md_file.relative_to(blog_dir)}")
            continue
        
        summary = match.group(1).strip()
        # Escape quotes for YAML
        summary_escaped = summary.replace('"', '\\"')
        
        # Replace placeholder with actual summary
        new_content = content.replace(
            'description: "이 글을 읽어보세요."',
            f'description: "{summary_escaped}"'
        )
        
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✓ {md_file.relative_to(blog_dir)}")
        fixed_count += 1
        
    except Exception as e:
        print(f"✗ Error in {md_file}: {e}")
        failed_count += 1

print(f"\n총 {fixed_count}개 파일 수정됨, {failed_count}개 실패")
