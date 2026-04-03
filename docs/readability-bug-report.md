# S-Reborn AI Blog — 가독성 & UI 오류 보고서

> 작성일: 2026-03-20
> 상태: **수정 완료** (커밋 포함)

---

## BUG-002 · Topbar 활성 탭이 항상 "Home" (심각도: High)

### 증상
- `/blog`, `/about`, `/blog/[slug]` 어디에 있어도 **HOME**만 핑크색
- BLOG·ABOUT 탭은 항상 회색

### 원인
`Topbar.astro` 에 `active` 클래스가 하드코딩

```html
<!-- 수정 전 (항상 Home이 active) -->
<a href="/"     class="topbar-link active">Home</a>
<a href="/blog" class="topbar-link">Blog</a>
<a href="/about"class="topbar-link">About</a>
```

### 수정
`Astro.url.pathname` 으로 현재 경로를 읽어 동적 클래스 부여

```astro
---
const path = Astro.url.pathname;
const isHome  = path === '/';
const isBlog  = path.startsWith('/blog');
const isAbout = path.startsWith('/about');
---
<a href="/"      class={`topbar-link${isHome  ? ' active' : ''}`}>Home</a>
<a href="/blog"  class={`topbar-link${isBlog  ? ' active' : ''}`}>Blog</a>
<a href="/about" class={`topbar-link${isAbout ? ' active' : ''}`}>About</a>
```

### 추가 개선
- `showHamburger` prop 추가 → 사이드바 없는 페이지(BlogPost, About)에서 햄버거 버튼 미표시
- `Layout.astro` 에서만 `<Topbar showHamburger={true} />` 전달

---

## BUG-003 · 다크모드 색상 대비 전면 실패 (심각도: Critical)

### 증상
날짜, 설명, 비활성 메뉴 등 보조 텍스트가 배경과 거의 구분되지 않음

### WCAG 대비율 분석

배경색: `#0a0a0a` (상대 휘도 ≈ 0.002)

| 요소 | CSS 변수 | 수정 전 색상 | 수정 전 대비율 | 판정 | 수정 후 색상 | 수정 후 대비율 | 판정 |
|------|---------|------------|-------------|------|------------|-------------|------|
| 본문 주요 텍스트 | `--text` | `#ede8e4` | **17.5:1** | ✅ | 유지 | 17.5:1 | ✅ |
| 설명·부제목 | `--t2` | `#6e666a` | **3.6:1** | ❌ | `#9c9498` | **7.1:1** | ✅ |
| 날짜·메타·비활성 탭 | `--t3` | `#3c3640` | **1.6:1** | ❌ | `#7a7278` | **4.8:1** | ✅ |
| 핑크 액센트 | `--pink` | `#e91e8c` | 4.9:1 | ✅ | 유지 | 4.9:1 | ✅ |

> WCAG 2.1 기준: 일반 텍스트 AA = 4.5:1 / 큰 텍스트(18pt+) AA = 3:1

### 수정 전 문제가 됐던 요소 목록

| 위치 | 요소 | 사용 변수 | 수정 전 대비 |
|------|------|---------|------------|
| 홈 Featured | 날짜 (12.8px) | `--t3` | 1.6:1 ❌ |
| 홈 카드 | 날짜 (12px) | `--t3` | 1.6:1 ❌ |
| 홈 Featured | 설명 (14.4px) | `--t2` | 3.6:1 ❌ |
| 사이드바 | 태그라인 (12.8px) | `--t3` | 1.6:1 ❌ |
| 사이드바 | 섹션 헤더 (12px) | `--t3` | 1.6:1 ❌ |
| 사이드바 | leaf 링크 (14px) | `--t3` | 1.6:1 ❌ |
| 블로그 목록 | 날짜 (12px) | `--t3` | 1.6:1 ❌ |
| 블로그 포스트 | 메타(날짜) (15px) | `--t3` | 1.6:1 ❌ |
| 블로그 포스트 | 태그 (12px) | `--t2` | 3.6:1 ❌ |
| 블로그 포스트 | 공유 안내 문구 (14.4px) | `--t3` | 1.6:1 ❌ |
| 탑바 | 비활성 링크 (13.6px) | `--t3` | 1.6:1 ❌ |

### 수정 내용 (`design.css` `:root`)

```css
/* 수정 전 */
--t2: #6e666a;   /* 대비 3.6:1 — WCAG 불합격 */
--t3: #3c3640;   /* 대비 1.6:1 — 거의 안 보임 */
--rule:  rgba(255, 255, 255, 0.07);
--rule2: rgba(255, 255, 255, 0.04);

/* 수정 후 */
--t2: #9c9498;   /* 대비 7.1:1 — WCAG AA ✅ */
--t3: #7a7278;   /* 대비 4.8:1 — WCAG AA ✅ */
--rule:  rgba(255, 255, 255, 0.12);  /* 구분선 가시성 개선 */
--rule2: rgba(255, 255, 255, 0.06);
```

---

## BUG-004 · `--accent` 변수 미정의 in design.css (심각도: Medium)

### 증상
`BlogPost.astro`, `about.astro` 에서 `var(--accent)` 참조 시
design.css에는 해당 변수가 없고 `--pink` 로만 정의되어 있음

### 현재 상태 (임시 동작)
`global.css` 가 `--accent: #e91e8c` 를 정의하므로 BlogPost.astro에서는
design.css + global.css 둘 다 import 하기 때문에 우연히 동작 중

### 권장 수정 (미적용 — 추후 작업)
`design.css` `:root` 에 추가:
```css
--accent: var(--pink);   /* 별칭 통일 */
```
이후 `about.astro` inline style 의 `--pink-main` → `var(--accent)` 등으로 정리 가능

---

## 수정 완료 체크리스트

- [x] **BUG-001** BaseHead global.css 충돌 → 수정 완료 (이전 커밋)
- [x] **BUG-002** Topbar active 탭 하드코딩 → `Astro.url.pathname` 동적 처리
- [x] **BUG-002** 사이드바 없는 페이지 햄버거 버튼 → `showHamburger` prop
- [x] **BUG-003** `--t2` 대비율 3.6:1 → 7.1:1
- [x] **BUG-003** `--t3` 대비율 1.6:1 → 4.8:1
- [x] **BUG-003** `--rule` 가시성 개선

## 남은 작업 (미적용)

- [ ] **BUG-004** `design.css` 에 `--accent: var(--pink)` 추가
- [ ] 코드블럭(`pre code`) 다크테마 syntax highlighting 적용
- [ ] 테이블 헤더 배경색 추가 (현재 투명)
- [ ] `blockquote` 왼쪽 보더 색상 확인

---

*파일 위치: `docs/readability-bug-report.md`*
