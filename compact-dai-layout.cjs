/**
 * compact-dai-layout.cjs
 * Doctor AI HTML 페이지들의 과도한 상하 패딩/마진을 일괄 축소
 * plan_layout_density_2026-03-29.md Phase 2 구현
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const DAI_DIR = path.join(__dirname, 'public', 'doctor-ai');

// ── 치환 규칙 목록 ────────────────────────────────────────────────────────────
// 각 규칙은 { from: RegExp, to: string, label: string } 형태
// 순서 중요: 더 긴(구체적) 패턴을 앞에 배치
const RULES = [
  // .page 상하 패딩: 56px/88px → 32px/56px
  {
    label: '.page padding 56/88 → 32/56',
    from: /padding:\s*56px\s+20px\s+88px/g,
    to:   'padding: 32px 20px 56px',
  },
  // .hero padding: 36px → 24px  (독립 36px만)
  {
    label: '.hero padding 36px → 24px',
    from: /(\s)(padding:\s*36px;)/g,
    to:   '$1padding: 24px;',
  },
  // .box padding: 28px → 20px
  {
    label: '.box padding 28px → 20px',
    from: /(\s)(padding:\s*28px;)/g,
    to:   '$1padding: 20px;',
  },
  // .takeaway padding: 18px 20px → 14px 18px
  {
    label: '.takeaway padding 18px 20px → 14px 18px',
    from: /padding:\s*18px\s+20px/g,
    to:   'padding: 14px 18px',
  },
  // series-progress margin-bottom: 36px → 20px
  {
    label: 'series-progress margin-bottom 36px → 20px',
    from: /(\.series-progress\s*\{[^}]*?)margin-bottom:\s*36px/gs,
    to:   '$1margin-bottom: 20px',
  },
  // hero margin-bottom: 32px → 20px  (hero 블록 한정)
  {
    label: '.hero margin-bottom 32px → 20px',
    from: /(\.hero\s*\{[^}]*?)margin-bottom:\s*32px/gs,
    to:   '$1margin-bottom: 20px',
  },
  // .box margin-bottom: 24px → 16px  (box 블록 한정)
  {
    label: '.box margin-bottom 24px → 16px',
    from: /(\.box\s*\{[^}]*?)margin-bottom:\s*24px/gs,
    to:   '$1margin-bottom: 16px',
  },
  // .takeaway margin-bottom: 32px → 20px  (takeaway 블록 한정)
  {
    label: '.takeaway margin-bottom 32px → 20px',
    from: /(\.takeaway\s*\{[^}]*?)margin-bottom:\s*32px/gs,
    to:   '$1margin-bottom: 20px',
  },
  // .series-nav margin-top: 48px → 32px
  {
    label: '.series-nav margin-top 48px → 32px',
    from: /(\.series-nav\s*\{[^}]*?)margin-top:\s*48px/gs,
    to:   '$1margin-top: 32px',
  },
  // .series-nav padding-top: 32px → 20px
  {
    label: '.series-nav padding-top 32px → 20px',
    from: /(\.series-nav\s*\{[^}]*?)padding-top:\s*32px/gs,
    to:   '$1padding-top: 20px',
  },
  // .breadcrumb margin-bottom: 28px → 16px
  {
    label: '.breadcrumb margin-bottom 28px → 16px',
    from: /(\.breadcrumb\s*\{[^}]*?)margin-bottom:\s*28px/gs,
    to:   '$1margin-bottom: 16px',
  },
  // series-progress padding: 16px 20px → 12px 16px
  {
    label: 'series-progress padding 16px 20px → 12px 16px',
    from: /(\.series-progress\s*\{[^}]*?)padding:\s*16px\s+20px/gs,
    to:   '$1padding: 12px 16px',
  },
  // 모바일 .hero padding: 24px → 18px
  {
    label: '.hero @mobile padding 24px → 18px',
    from: /(max-width:\s*600px[^}]*\}[^{]*\.hero\s*\{[^}]*?)padding:\s*24px/gs,
    to:   '$1padding: 18px',
  },
  // 모바일 .box padding: 20px → 14px (mobile breakpoint 안)
  {
    label: '.box @mobile padding 20px → 14px',
    from: /(max-width:\s*600px[^}]*\}[^{]*\.box\s*\{[^}]*?)padding:\s*20px/gs,
    to:   '$1padding: 14px',
  },
];

// ── 파일 수집 ─────────────────────────────────────────────────────────────────
function collectHtmlFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
const files = collectHtmlFiles(DAI_DIR);
let totalModified = 0;
let totalReplacements = 0;

for (const filePath of files) {
  const original = fs.readFileSync(filePath, 'utf8');

  // <style> 블록만 추출해서 치환 (본문 콘텐츠 오염 방지)
  let modified = original.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (match, open, cssContent, close) => {
      let css = cssContent;
      for (const rule of RULES) {
        css = css.replace(rule.from, rule.to);
      }
      return open + css + close;
    }
  );

  if (modified !== original) {
    fs.writeFileSync(filePath, modified, 'utf8');
    const rel = path.relative(__dirname, filePath);
    console.log(`  ✅ ${rel}`);
    totalModified++;

    // 변경 수 계산
    const origLines = original.split('\n').length;
    const newLines  = modified.split('\n').length;
    totalReplacements += Math.abs(origLines - newLines) + 1;
  } else {
    const rel = path.relative(__dirname, filePath);
    console.log(`  — ${rel} (변경 없음)`);
  }
}

console.log(`\n완료: ${files.length}개 파일 검사, ${totalModified}개 수정`);
