/**
 * inject-dai-nav.cjs
 * Doctor AI 미니사이트 28개 HTML 파일에 글로벌 내비게이션 CSS/JS 두 줄 삽입
 */
const fs   = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'public', 'doctor-ai');
const CSS_TAG  = '  <link rel="stylesheet" href="/doctor-ai/assets/dai-nav.css" />';
const JS_TAG   = '  <script src="/doctor-ai/assets/dai-nav.js" defer></script>';
const MARKER   = 'dai-nav.css'; // 이미 적용됐는지 확인용

// doctor-ai/doctor-ai 중복 폴더 제외하고 모든 .html 수집
function collectHtml(dir, results) {
  results = results || [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // 중복 폴더 스킵
      if (entry.name === 'doctor-ai') continue;
      collectHtml(full, results);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const files = collectHtml(BASE);
let applied = 0;
let skipped = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');

  // 이미 삽입된 파일 스킵
  if (src.includes(MARKER)) {
    skipped++;
    continue;
  }

  // </head> 직전에 CSS + JS 삽입
  if (!src.includes('</head>')) {
    console.warn('  [WARN] </head> 없음, 스킵:', path.relative(BASE, file));
    skipped++;
    continue;
  }

  src = src.replace('</head>', CSS_TAG + '\n' + JS_TAG + '\n</head>');
  fs.writeFileSync(file, src, 'utf8');
  applied++;
  console.log('  [OK]', path.relative(BASE, file));
}

console.log('\n완료: 적용', applied + '개 / 스킵', skipped + '개 / 전체', files.length + '개');
