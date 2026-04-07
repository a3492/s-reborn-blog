/**
 * src/config/site-brand.json → public/doctor-ai-academy/assets/dai-nav.js 임베드 값 갱신,
 * public 이하 html·루트 index.html 브랜드 문자열 일괄 치환.
 * npm run sync:site-brand 또는 prebuild에서 실행.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brandPath = join(root, 'src/config/site-brand.json');
const brand = JSON.parse(readFileSync(brandPath, 'utf8'));
const B = brand.blogDisplayName;

const MARK_START = '/*__SITE_BRAND__*/';
const MARK_END = '/*__END_SITE_BRAND__*/';

const daiNavPath = join(root, 'public/doctor-ai-academy/assets/dai-nav.js');
if (existsSync(daiNavPath)) {
  let daiNav = readFileSync(daiNavPath, 'utf8');
  const embedBlock = `${MARK_START}
  var __SITE_BRAND = ${JSON.stringify(brand)};
  ${MARK_END}`;
  const i0 = daiNav.indexOf(MARK_START);
  const i1 = daiNav.indexOf(MARK_END);
  if (i0 === -1 || i1 === -1) {
    console.warn('dai-nav.js: site-brand markers missing, skipping embed');
  } else {
    daiNav = daiNav.slice(0, i0) + embedBlock + daiNav.slice(i1 + MARK_END.length);
    writeFileSync(daiNavPath, daiNav, 'utf8');
  }
} else {
  console.log('dai-nav.js not found, skipping embed');
}

/** 긴 문자열을 먼저 치환 (부분 일치 방지). 대상은 blogDisplayName(B)과 동기화 */
const HTML_REPLACEMENTS = [
  ['S-Reborn AI Blog AI Blog', B],
  ['S-Reborn AI Blog', B],
  ['Doctor AI Academy — S-Reborn</title>', `Doctor AI Academy — ${B}</title>`],
  ['| S-Reborn Medical AI</title>', `| ${B}</title>`],
  ['S-Reborn Medical AI | 의료진을 위한 AI 가이드', `${B} | 의료진을 위한 AI 가이드`],
  ['🏥 S-Reborn Medical AI', `🏥 ${brand.legacyStaticSiteLogoLine}`],
  ['<a href="/s-reborn-blog/">S-Reborn Medical AI</a>', `<a href="/s-reborn-blog/">${brand.legacyStaticSiteLogoLine}</a>`],
  ['© 2026 S-Reborn · Medical AI Content Platform', brand.legacyStaticCopyrightLine],
  ['S-Reborn · Medical AI Content Platform', `${B} · Medical AI Content Platform`],
  [' — S-Reborn</title>', ` — ${B}</title>`],
  ['| S-Reborn"', `| ${B}"`],
  ['| S-Reborn,', `| ${B},`],
  ['S-Reborn 의사가 배우는', `${B} 의사가 배우는`],
  ['S-Reborn 로고', `${B} 로고`],
  ['© 2026 S-Reborn · Doctor AI Academy', `© 2026 ${B} · Doctor AI Academy`],
  ['© 2026 S-Reborn ·', `© 2026 ${B} ·`],
  ['© 2026 S-Reborn</', `© 2026 ${B}</`],
  ['← S-Reborn 홈으로', `← ${B} 홈으로`],
  ['alt="S-Reborn"', `alt="${B}"`],
  ['>S-Reborn</a>', `>${B}</a>`],
  ['<title>Doctor AI | S-Reborn Medical AI</title>', `<title>Doctor AI Academy | ${B}</title>`],
  ['🏥 Doctor AI</h1>', '🏥 Doctor AI Academy</h1>'],
];

function walkHtml(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, acc);
    else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const files = walkHtml(join(root, 'public'));
const rootIndex = join(root, 'index.html');
try {
  if (statSync(rootIndex).isFile()) files.push(rootIndex);
} catch {
  /* no root index */
}

let touched = 0;
for (const file of files) {
  let s = readFileSync(file, 'utf8');
  const orig = s;
  for (const [a, b] of HTML_REPLACEMENTS) {
    if (a !== b) s = s.split(a).join(b);
  }
  if (s !== orig) {
    writeFileSync(file, s, 'utf8');
    touched += 1;
    console.log('sync:', relative(root, file));
  }
}

console.log('site-brand: html files updated:', touched);
