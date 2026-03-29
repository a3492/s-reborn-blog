# 레이아웃 밀도 개선 기획서 — 스크롤 최소화 & 정보 가독성 향상
**작성일**: 2026-03-29
**대상**: S-Reborn 전 페이지 (블로그 홈 · 블로그 포스트 · Doctor AI 전 시리즈)
**목표**: 불필요한 스크롤을 줄이고, 화면 첫 진입 시 핵심 정보를 즉시 파악할 수 있게 한다

---

## 1. 문제 진단 요약

사용자가 "스크롤을 한참 해야 한다"고 느끼는 원인은 **세 개의 레이어**에서 동시에 발생하고 있다.

| 레이어 | 원인 | 영향 페이지 |
|--------|------|------------|
| A. 과도한 섹션 상하 패딩 | 섹션 간 여백이 필요 이상으로 큼 | 전체 |
| B. 고정 높이 블록 | min-height / max-height 강제로 뷰포트 낭비 | 홈, 모바일 |
| C. 대형 타이포그래피 | Hero h1이 최대 41px로 너무 커 공간 점유 | Featured 영역 |

---

## 2. 영역별 상세 진단

### 2-1. Doctor AI HTML 페이지 (cases / prompts / tools / fundamentals)

가장 심각한 영역. 28개 파일 모두 동일한 인라인 CSS 패턴을 공유.

```
현재
.page           { padding: 56px 20px 88px; }     → 상단 56 + 하단 88 = 144px 소비
.hero           { padding: 36px; margin-bottom: 32px; }   → 상하 72px 소비
.box            { padding: 28px; margin-bottom: 24px; }   → 상하 52px (박스당)
.takeaway       { padding: 18px 20px; margin-bottom: 32px; }
.series-nav     { margin-top: 48px; padding-top: 32px; }  → 80px 공백
.breadcrumb     { margin-bottom: 28px; }
.series-progress{ padding: 16px 20px; margin-bottom: 36px; }
```

**누적 계산**: 페이지 상단 진입 후 첫 본문까지 도달하려면
`56(page-top) + 28(breadcrumb) + 16+36(progress) + 36(hero-padding) = 172px`를 스크롤해야 함

**목표 수치**:
```
제안
.page           { padding: 32px 20px 56px; }     → 144px → 88px (-56px)
.hero           { padding: 24px; margin-bottom: 20px; }   → 72px → 44px (-28px)
.box            { padding: 20px; margin-bottom: 16px; }   → 52px → 36px (-16px)
.takeaway       { padding: 14px 18px; margin-bottom: 20px; }
.series-nav     { margin-top: 32px; padding-top: 20px; }  → 80px → 52px (-28px)
.breadcrumb     { margin-bottom: 16px; }
.series-progress{ padding: 12px 16px; margin-bottom: 20px; }
```
→ **약 100px 절감 (첫 진입 기준)**

---

### 2-2. 홈페이지 — Hero 카드 (yt-hero)

```
현재 (design.css)
.yt-hero      { padding: 1.75rem 1.75rem 1.5rem; }   → 28px(상) + 24px(하)
.yt-body-wrap { max-height: 18rem; }                 → 288px 고정 미리보기
@media ≤600px .yt-hero { min-height: 260px; }        → 모바일 강제 260px
.yt-layout    { padding: 1.25rem 0 0; }              → 상단 20px

제안
.yt-hero      { padding: 1.25rem 1.5rem 1.1rem; }    → 20px(상) + 17.6px(하) (-11px)
.yt-body-wrap { max-height: 13rem; }                 → 288px → 208px (-80px)
@media ≤600px .yt-hero { min-height: auto; }         → 강제 높이 제거
.yt-layout    { padding: 0.75rem 0 0; }              → 20px → 12px (-8px)
```

---

### 2-3. 홈페이지 — Featured 섹션

```
현재
.featured-wrap  { padding: 1.25rem 0 0; }       → 20px 상단
.featured-main  { padding: 1.5rem; }             → 24px 전체
.f-title        { font-size: clamp(1.8rem, 3vw, 2.6rem); }  → 최대 41.6px
.f-excerpt      { line-height: 1.55; }
.sec-rule       { padding: 0.8rem 0 0.65rem; }   → 12.8px(상)+10.4px(하)

제안
.featured-wrap  { padding: 0.75rem 0 0; }        → 12px 상단 (-8px)
.featured-main  { padding: 1.1rem; }             → 17.6px (-6.4px)
.f-title        { font-size: clamp(1.5rem, 2.5vw, 2.1rem); }  → 최대 33.6px (-8px)
.sec-rule       { padding: 0.55rem 0 0.5rem; }   → (-7px)
```

---

### 2-4. 홈페이지 — 사이드바 (yt-sidebar)

```
현재
@media ≤860px .yt-sidebar { max-height: 55vh; }  → 화면 높이 55% = 약 462px 점유

제안
@media ≤860px .yt-sidebar { max-height: 42vh; }  → (-13vh, 약 109px 절감)
```

---

### 2-5. 블로그 포스트 페이지

```
현재 (global.css)
main                 { padding: 2em 1em; }            → 32px 상하
.blog-post-title     { padding: 1em 0; }              → 16px 상하 (총 제목 영역 32px)
.blog-post-title h1  { margin: 0 0 0.5em; }
h1~h6 (global)       { margin: 2em 0 0.9em; }         → 상단 마진 2em(32px) 너무 큼
hr                   { margin: 2em 0; }               → 32px 상하

제안
main                 { padding: 1.25em 1em; }         → 32px → 20px (-12px)
.blog-post-title     { padding: 0.6em 0; }            → 16px → 9.6px (-6.4px)
h1~h6 (global)       { margin: 1.4em 0 0.6em; }      → 2em → 1.4em (전체 글 높이 영향 큼)
hr                   { margin: 1.4em 0; }             → 2em → 1.4em
.blog-post-share-section { margin-top: 1.5rem; padding-top: 1rem; }  → 2.5/1.5rem 감소
```

---

### 2-6. Doctor AI 내비게이션 바 (dai-nav.css)

```
현재
.dai-global-nav { height: 54px; }    → 54px 고정

→ 54px 유지 (접근성 최소 요건 충족, 유지)
```
→ **내비게이션 높이는 변경하지 않음**

---

## 3. 우선순위 매트릭스

| 우선도 | 영역 | 절감 예상 | 작업 범위 | 난이도 |
|--------|------|-----------|---------|--------|
| ★★★ | Doctor AI 28개 HTML 페이지 `.page` + `.hero` + `.box` 패딩 | ~100px/페이지 | 28파일 인라인 CSS | 중 (스크립트 활용) |
| ★★★ | 홈 `yt-body-wrap max-height` 축소 | 80px | design.css 1줄 | 낮음 |
| ★★★ | 홈 `yt-hero` 모바일 min-height 제거 | 260px(모바일) | design.css 1줄 | 낮음 |
| ★★ | Featured `.f-title` 폰트 크기 축소 | 8px/라인 × 라인수 | design.css 1줄 | 낮음 |
| ★★ | Featured 섹션 패딩 전반 축소 | ~30px | design.css 5줄 | 낮음 |
| ★★ | 블로그 포스트 `h1~h6 margin` 축소 | 글 전체 밀도↑ | global.css 1줄 | 낮음 |
| ★ | 블로그 포스트 `main padding` 축소 | ~20px | global.css 1줄 | 낮음 |
| ★ | 사이드바 `max-height` 축소 | 109px | design.css 1줄 | 낮음 |

---

## 4. 구현 계획

### Phase 1 — CSS 파일 수정 (design.css + global.css)
대상: 블로그 홈 + 블로그 포스트
파일: `src/styles/design.css`, `src/styles/global.css`
작업: 위 제안 수치로 값 교체

변경 항목:
1. `.yt-layout padding` 1.25rem → 0.75rem
2. `.yt-hero padding` 1.75/1.5rem → 1.25/1.1rem
3. `.yt-hero @media≤600px min-height` 260px → auto
4. `.yt-body-wrap max-height` 18rem → 13rem
5. `.yt-sidebar @media≤860px max-height` 55vh → 42vh
6. `.featured-wrap padding` 1.25rem → 0.75rem
7. `.featured-main padding` 1.5rem → 1.1rem
8. `.f-title font-size clamp` (1.8rem, 3vw, 2.6rem) → (1.5rem, 2.5vw, 2.1rem)
9. `.sec-rule padding` 0.8/0.65rem → 0.55/0.5rem
10. `global.css main padding` 2em → 1.25em
11. `global.css h1~h6 margin` 2em 0 0.9em → 1.4em 0 0.6em
12. `global.css hr margin` 2em → 1.4em
13. `.blog-post-title padding` 1em → 0.6em
14. `.blog-post-share-section margin-top` 2.5rem → 1.5rem

---

### Phase 2 — Doctor AI 28개 HTML 수정
대상: `public/doctor-ai/` 아래 전체 html
방식: Node.js 스크립트로 각 파일의 인라인 `<style>` 내 수치 일괄 치환
(inject-dai-nav.cjs 방식과 동일한 접근)

치환 패턴:
```
padding: 56px 20px 88px  →  padding: 32px 20px 56px
padding: 36px            →  padding: 24px
margin-bottom: 36px (series-progress) → margin-bottom: 20px
margin-bottom: 32px (hero)  → margin-bottom: 20px
margin-bottom: 24px (box)   → margin-bottom: 16px
margin-bottom: 32px (takeaway) → margin-bottom: 20px
padding: 28px (box)      →  padding: 20px
padding: 18px 20px (takeaway) → padding: 14px 18px
margin-top: 48px (series-nav) → margin-top: 32px
padding-top: 32px (series-nav) → padding-top: 20px
margin-bottom: 28px (breadcrumb) → margin-bottom: 16px
padding: 16px 20px (series-progress) → padding: 12px 16px
```

주의: 동일한 수치가 다른 맥락에서도 나올 수 있으므로
→ 치환은 `.class-name {` 블록 단위로 맥락 확인 후 처리

---

### Phase 3 — 검증 (배포 후)
- 홈페이지 첫 화면 — 히어로 + Featured 카드가 뷰포트 안에 들어오는지 확인
- 블로그 포스트 — 제목 + 첫 H2까지 스크롤 없이 보이는지 확인
- Doctor AI 페이지 — 브레드크럼 + 시리즈 진행 + 히어로 첫 단락이 1 스크롤 이내 확인
- 모바일(375px) — yt-hero 영역이 뷰포트 60% 이하로 유지되는지 확인

---

## 5. 디자인 원칙 (이번 수정의 가이드)

> **"여백은 콘텐츠를 위해 존재한다. 콘텐츠 없는 여백은 낭비다."**

- 섹션 간 구분은 `border` 또는 `background 차이`로 충분히 표현한다 — 큰 마진 불필요
- 모바일에서 min-height 고정 금지 — 콘텐츠 양이 곧 높이가 되어야 한다
- 제목(h1) 폰트 크기는 정보 위계를 나타내되, 텍스트 블록 높이가 뷰포트의 25%를 넘으면 안 된다
- 히어로 섹션의 역할은 "콘텐츠의 맥락 제공"이지 "인상적인 공간 연출"이 아니다

---

## 6. 기대 효과

| 지표 | 현재 | 수정 후 (예상) |
|------|------|--------------|
| Doctor AI 1페이지 — 진입 후 첫 본문까지 스크롤 | ~172px | ~72px (-58%) |
| 홈 — yt-hero + featured 섹션 총 높이 | ~580px+ | ~460px (-21%) |
| 블로그 포스트 — 첫 H2까지 스크롤 거리 | ~240px | ~180px (-25%) |
| 모바일 yt-hero 최소 점유 | 260px 강제 | auto (내용 기준) |
| 사이드바 태블릿 최대 점유 | 55vh(~462px) | 42vh(~352px) |

---

## 7. 관련 파일 목록

| 파일 | 타입 | 수정 방법 |
|------|------|----------|
| `src/styles/design.css` | Astro 전역 | 직접 Edit |
| `src/styles/global.css` | Astro 전역 | 직접 Edit |
| `public/doctor-ai/**/*.html` | 28개 정적 HTML | Node.js 스크립트 |

---

*© S-Reborn 내부 기획서 | 2026-03-29*
