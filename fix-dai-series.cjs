/**
 * fix-dai-series.cjs
 * Doctor AI 시리즈:
 * 1. series-progress 5편 누락 추가
 * 2. ep-card 클릭 영역 전체 활성화 (tools/home.html)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DAI_DIR = path.join(__dirname, 'public', 'doctor-ai');

console.log('🔧 Doctor AI 시리즈 수정 시작...\n');

// ────────────────────────────────────────────────────────────────────────────
// 1. Prompts 시리즈 — sp-step 패턴, 5편 추가
// ────────────────────────────────────────────────────────────────────────────

const promptsFiles = [
  'prompts/01-clinical-prompts-intro.html',
  'prompts/02-medical-record-prompts.html',
  'prompts/03-patient-explanation-prompts.html',
  'prompts/04-differential-diagnosis-prompts.html',
  'prompts/05-consent-form-prompts.html',
];

promptsFiles.forEach((file, idx) => {
  const filePath = path.join(DAI_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 현재 페이지 편수 (01 = 1편, 02 = 2편, ...)
  const pageNum = idx + 1;

  // 기존 series-progress 패턴 찾기
  const oldPattern = /<div class="series-progress">[\s\S]*?<\/div>/;
  const match = content.match(oldPattern);

  if (match) {
    let newProgress = '<div class="series-progress">\n      <span class="sp-label">시리즈</span>\n';
    newProgress += '      <a href="./home.html" class="sp-step">소개</a>\n';

    // 1~5편 추가
    for (let i = 1; i <= 5; i++) {
      const href = i === pageNum ? '#' : `./0${i}-${i === 1 ? 'clinical-prompts-intro' : i === 2 ? 'medical-record-prompts' : i === 3 ? 'patient-explanation-prompts' : i === 4 ? 'differential-diagnosis-prompts' : 'consent-form-prompts'}.html`;
      const activeClass = i === pageNum ? ' class="sp-step on"' : ' class="sp-step"';
      const onAttr = i === pageNum ? ' on' : '';
      newProgress += `      <a href="${href}"${activeClass}>${i}편</a>\n`;
    }

    newProgress += '    </div>';

    content = content.replace(oldPattern, newProgress);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ ${file}`);
  }
});

// ────────────────────────────────────────────────────────────────────────────
// 2. Cases 시리즈 — sp-item 패턴, 5편 추가
// ────────────────────────────────────────────────────────────────────────────

const casesFiles = [
  'cases/01-dm-glucose-control.html',
  'cases/02-er-chest-pain.html',
  'cases/03-discharge-followup.html',
  'cases/04-polypharmacy-elderly.html',
  'cases/05-pediatric-fever-workup.html',
];

casesFiles.forEach((file, idx) => {
  const filePath = path.join(DAI_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  const pageNum = idx + 1;
  const caseTitles = [
    'dm-glucose-control',
    'er-chest-pain',
    'discharge-followup',
    'polypharmacy-elderly',
    'pediatric-fever-workup'
  ];

  // Cases는 sp-items 래퍼 안의 구조
  const oldPattern = /<div class="series-progress">[\s\S]*?<\/div>/;
  const match = content.match(oldPattern);

  if (match) {
    let newProgress = '<div class="series-progress">\n    <div class="sp-items">\n';
    newProgress += '      <a class="sp-item done" href="./home.html">소개</a>\n';

    for (let i = 1; i <= 5; i++) {
      const href = i === pageNum ? '#' : `./${String(i).padStart(2, '0')}-${caseTitles[i-1]}.html`;
      const className = i === pageNum ? 'sp-item on' : 'sp-item done';
      const liTag = i === pageNum ? '<span' : '<a href="' + href + '"';
      const closeTag = i === pageNum ? '</span>' : '</a>';

      if (i > 1) newProgress += '      <span class="sp-sep">›</span>\n';
      newProgress += `      ${i === pageNum ? '<span' : `<a href="${href}"`} class="${className}">${i}편</a>\n`;
    }

    newProgress += '    </div>\n  </div>';

    content = content.replace(oldPattern, newProgress);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ ${file}`);
  }
});

// ────────────────────────────────────────────────────────────────────────────
// 3. Tools 시리즈 — a + span.sp-sep 패턴, 5편 추가
// ────────────────────────────────────────────────────────────────────────────

const toolsFiles = [
  'tools/01-chatgpt-vs-claude.html',
  'tools/02-gemini-medical-search.html',
  'tools/03-korean-ai-tools.html',
  'tools/04-ai-security-checklist.html',
  'tools/05-medical-ai-tools-specialty.html',
];

toolsFiles.forEach((file, idx) => {
  const filePath = path.join(DAI_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  const pageNum = idx + 1;
  const toolTitles = [
    'chatgpt-vs-claude',
    'gemini-medical-search',
    'korean-ai-tools',
    'ai-security-checklist',
    'medical-ai-tools-specialty'
  ];

  // Tools는 a와 span.sp-sep 직접 사용
  const oldPattern = /<div class="series-progress">[\s\S]*?<\/div>/;
  const match = content.match(oldPattern);

  if (match) {
    let newProgress = '<div class="series-progress">\n      <a href="./home.html">소개</a>\n';

    for (let i = 1; i <= 5; i++) {
      newProgress += '      <span class="sp-sep">·</span>\n';

      if (i === pageNum) {
        newProgress += `      <span class="sp-on">${i}편</span>\n`;
      } else {
        const href = `./${String(i).padStart(2, '0')}-${toolTitles[i-1]}.html`;
        newProgress += `      <a href="${href}">${i}편</a>\n`;
      }
    }

    newProgress += '    </div>';

    content = content.replace(oldPattern, newProgress);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ ${file}`);
  }
});

// ────────────────────────────────────────────────────────────────────────────
// 4. Tools home.html — ep-card 클릭 영역 수정
// ────────────────────────────────────────────────────────────────────────────

const toolsHomePath = path.join(DAI_DIR, 'tools/home.html');
let toolsHomeContent = fs.readFileSync(toolsHomePath, 'utf8');

// <div class="ep-card"><a ...> 패턴을 <a class="ep-card"> 패턴으로 변경
const epCardPattern = /<div class="ep-card active">\s*<a href="([^"]+)">([\s\S]*?)<\/a>\s*<\/div>/g;
toolsHomeContent = toolsHomeContent.replace(epCardPattern, (match, href, content) => {
  return `<a class="ep-card active" href="${href}">${content}</a>`;
});

fs.writeFileSync(toolsHomePath, toolsHomeContent, 'utf8');
console.log(`\n  ✅ tools/home.html — ep-card 클릭 영역 확장`);

console.log('\n✅ 모든 수정 완료!\n');
console.log('변경 요약:');
console.log('  • Prompts 5개 파일: 5편 추가');
console.log('  • Cases 5개 파일: 5편 추가');
console.log('  • Tools 5개 파일: 5편 추가');
console.log('  • Tools home.html: ep-card 전체 클릭 활성화');
