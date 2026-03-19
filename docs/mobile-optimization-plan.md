# S-Reborn Blog — 모바일 최적화 기획서 & 오류 보고서

> 작성일: 2026-03-19
> 작성자: Claude (인수인계용)
> 대상 URL: https://s-reborn-blog.pages.dev

---

## 1. 긴급 오류 보고서

### BUG-001 · 홈페이지 다크 테마 무력화 (심각도: Critical)

| 항목 | 내용 |
|------|------|
| 증상 | 모바일(특히 카카오톡 인앱 브라우저)에서 홈페이지 배경이 흰색/회색으로 보임 |
| 영향 범위 | 홈페이지(/) + 모든 `Layout.astro` 기반 페이지, **전 브라우저 공통** |
| 재현 조건 | 카카오톡 링크 공유 → 인앱 브라우저 열기 / 크롬 모바일 / 사파리 모두 해당 |

#### 근본 원인 (CSS 캐스케이드 충돌)

```
Layout.astro
├── import design.css          ← body { background: #0a0a0a; color: #ede8e4; }
└── <BaseHead />
    └── import global.css      ← body { background: linear-gradient(…, #fff); color: rgb(34,41,57); }
                                  ↑ 이 줄이 design.css의 다크테마를 덮어씀!
```

Astro는 컴포넌트 트리를 순회하며 CSS를 번들링한다.
`BaseHead.astro`가 `global.css`를 임포트하고 있어서, `Layout.astro`가 먼저 로드한 `design.css`의
`body` 스타일을 **전역 덮어쓰기**한다.

구체적으로 충돌하는 속성:

| 속성 | design.css | global.css (덮어씀) |
|------|-----------|---------------------|
| `background` | `#0a0a0a` (다크) | `linear-gradient(…, #fff)` (밝음) |
| `color` | `#ede8e4` (밝은 글자) | `rgb(34,41,57)` (어두운 글자) |
| `display` | `flex` (사이드바 레이아웃) | (미지정, flex 상속 유지되나 불안정) |
| `font-size` | `16px` | `16px` (동일 — 이미 수정됨) |

#### 수정 방법

**`src/components/BaseHead.astro` 2번째 줄 삭제:**
```diff
- import '../styles/global.css';
```

**`src/layouts/BlogPost.astro` frontmatter에 추가:**
```diff
+ import '../styles/global.css';
```

이렇게 하면 `global.css`는 블로그 포스트 본문에서만 적용되고,
홈페이지 레이아웃(`design.css`)을 오염시키지 않는다.

#### 카카오톡 인앱 브라우저 특이사항

카카오톡은 iOS에서 WKWebView, Android에서 Chrome 기반 WebView를 사용한다.
이 버그는 WebView 종류와 무관하게 CSS 캐스케이드 문제로 발생하므로
위 수정으로 모든 환경에서 해결된다.

---

## 2. 모바일 최적화 현황 점검표

### 2-1. 레이아웃 이슈

| # | 항목 | 현재 상태 | 목표 | 우선순위 |
|---|------|----------|------|---------|
| L1 | 사이드바 모바일 노출 | 항상 표시 (230px 고정) | 768px 이하 숨김 + 햄버거 버튼 | High |
| L2 | 탑바 사이드바 좌측 여백 | 사이드바 오른쪽에 위치 | 모바일에서 전체 너비 | High |
| L3 | Featured 그리드 | `@media 800px` 1컬럼 전환 | 완료 ✅ | — |
| L4 | 포스트 그리드 | 680px에서 2컬럼 | 480px 이하 1컬럼 추가 필요 | Medium |
| L5 | 오버스크롤 | 없음 | 모바일 bounce 방지 | Low |

### 2-2. 타이포그래피 이슈

| # | 항목 | 현재 상태 | 목표 | 우선순위 |
|---|------|----------|------|---------|
| T1 | body 기본 크기 | 16px (수정됨) | 480px 이하 15px | Medium |
| T2 | Featured 제목 | clamp(1.4rem, 2vw, 1.75rem) | 480px 이하 1.3rem | Medium |
| T3 | 카드 제목 | 0.95rem | 적정 (유지) ✅ | — |
| T4 | 사이드바 글자 | 0.875rem | 모바일 미표시이므로 무관 | — |

### 2-3. 인터랙션 이슈

| # | 항목 | 현재 상태 | 목표 | 우선순위 |
|---|------|----------|------|---------|
| I1 | 햄버거 메뉴 | 없음 | 모바일 전용 상단 토글 버튼 | High |
| I2 | 사이드바 오버레이 닫기 | 없음 | 사이드바 외부 탭으로 닫기 | Medium |
| I3 | 터치 타겟 크기 | tree-row padding 작음 | 최소 44×44px | Medium |
| I4 | 탑바 링크 간격 | `gap: 1.5rem` | 모바일 `gap: 1rem` | Low |

---

## 3. 수정 구현 계획

### Phase 1 — CSS 충돌 수정 (즉시 / 30분)

```
파일 수정:
  src/components/BaseHead.astro   → global.css import 제거
  src/layouts/BlogPost.astro      → global.css import 추가
```

### Phase 2 — 모바일 레이아웃 (1–2시간)

#### 추가할 CSS (design.css 하단 추가)

```css
/* ═══ MOBILE (≤768px) ═══ */
@media (max-width: 768px) {
  body {
    flex-direction: column;
  }

  /* 사이드바: 기본 숨김 → 오버레이 방식 */
  .sidebar {
    position: fixed;
    left: -100%;
    top: 0;
    height: 100%;
    width: min(280px, 85vw);
    transition: left 0.25s ease;
    z-index: 200;
    box-shadow: 4px 0 24px rgba(0,0,0,0.5);
  }

  .sidebar.is-open {
    left: 0;
  }

  /* 오버레이 dim */
  .sb-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 150;
  }

  .sb-overlay.is-open {
    display: block;
  }

  /* 탑바: 전체너비, 햄버거 추가 */
  .topbar {
    padding: 0 1rem;
    justify-content: space-between;
    width: 100%;
  }

  .hamburger {
    display: flex;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    padding: 6px;
    border: none;
    background: none;
  }

  .hamburger span {
    width: 18px;
    height: 2px;
    background: var(--t2);
    border-radius: 1px;
    transition: background 0.1s;
  }

  .hamburger:hover span {
    background: var(--text);
  }

  /* Featured 패딩 축소 */
  .featured-wrap {
    padding: 1.25rem 1rem 0;
  }

  .featured-main {
    padding-right: 0;
    padding-bottom: 1.25rem;
    border-right: none;
    border-bottom: 1px solid var(--rule);
  }

  .f-title {
    font-size: 1.3rem;
  }

  .f-excerpt {
    font-size: 0.9rem;
  }
}

/* ≤480px — 소형 폰 */
@media (max-width: 480px) {
  .post-grid {
    grid-template-columns: 1fr;
  }

  .sec-rule {
    padding: 0.5rem 1rem;
  }

  .grid-wrap {
    padding: 0 0 2rem;
  }

  footer {
    flex-direction: column;
    gap: 0.4rem;
    text-align: center;
    padding: 0.75rem 1rem;
  }

  .topbar {
    padding: 0 0.75rem;
  }
}
```

#### 추가할 HTML (Topbar.astro 수정)

```html
<!-- 햄버거 버튼 (모바일에서만 보임) -->
<button class="hamburger" id="sb-toggle" aria-label="메뉴 열기">
  <span></span><span></span><span></span>
</button>
```

#### Layout.astro script 추가

```js
// 모바일 사이드바 토글
const sbToggle = document.getElementById('sb-toggle');
const sidebar = document.querySelector('.sidebar');
const overlay = document.getElementById('sb-overlay');

sbToggle?.addEventListener('click', () => {
  sidebar?.classList.toggle('is-open');
  overlay?.classList.toggle('is-open');
});

overlay?.addEventListener('click', () => {
  sidebar?.classList.remove('is-open');
  overlay?.classList.remove('is-open');
});
```

### Phase 3 — 검증 (30분)

| 디바이스 | 목표 해상도 | 확인 항목 |
|---------|-----------|---------|
| 갤럭시 S시리즈 | 360×800 | 사이드바 숨김, 1컬럼 그리드 |
| 아이폰 SE | 375×667 | 햄버거 열기/닫기, 타이포 크기 |
| 아이폰 14 Pro | 393×852 | 피처드 레이아웃, 폰트 |
| 아이패드 | 768×1024 | 사이드바 숨김/노출 경계 |
| 갤럭시 탭 | 800×1280 | 탑바 2컬럼 그리드 |

---

## 4. 디바이스별 타겟 브레이크포인트 정의

```
≥ 1200px  : 데스크탑 — 사이드바(230px) + 4컬럼 그리드
768~1199px : 작은 데스크탑/큰 태블릿 — 사이드바 유지 + 3컬럼
≤ 768px   : 태블릿/모바일 — 사이드바 오버레이, 2컬럼
≤ 680px   : 폰 — 2컬럼 그리드
≤ 480px   : 소형 폰 — 1컬럼 그리드
≤ 360px   : 초소형 — 패딩 최소화
```

---

## 5. 현재 파일별 CSS 역할 정리

| 파일 | 역할 | 적용 페이지 |
|------|------|------------|
| `src/styles/design.css` | 사이드바 레이아웃, 홈페이지 컴포넌트, 다크테마 | Layout 기반 전 페이지 |
| `src/styles/global.css` | 블로그 본문 타이포그래피, 마크다운 스타일 | BlogPost.astro 전용 |

> **핵심 원칙**: 두 CSS 파일은 **절대 동일 페이지에 동시 로드하지 않는다.**
> `global.css`가 `body` 배경/색상을 재정의하기 때문.

---

## 6. 수행해야 할 작업 체크리스트

### 즉시 수정 (Phase 1)
- [ ] `BaseHead.astro`에서 `global.css` import 제거
- [ ] `BlogPost.astro` frontmatter에 `global.css` import 추가
- [ ] 빌드 확인 (`npm run build`)
- [ ] 홈페이지 다크테마 정상 확인

### 단기 (Phase 2)
- [ ] `design.css`에 모바일 미디어쿼리 추가 (위 코드 참조)
- [ ] `Topbar.astro`에 햄버거 버튼 추가
- [ ] `Layout.astro`에 오버레이 div + toggle 스크립트 추가
- [ ] `.hamburger` 클래스를 데스크탑에서 `display: none` 처리

### 검증 및 배포
- [ ] localhost:4321 모바일 에뮬레이터 확인
- [ ] Chrome DevTools Device Mode (360px / 390px / 768px)
- [ ] 실제 폰으로 카카오톡 링크 공유 후 인앱 브라우저 확인
- [ ] `git push` → Cloudflare Pages 빌드 성공 확인

---

## 7. 참고: 카카오톡 인앱 브라우저 제약사항

| 항목 | iOS (WKWebView) | Android (Chrome WebView) |
|------|----------------|-------------------------|
| CSS 지원 | iOS 15+ 수준 | Chrome 85+ 수준 |
| CSS 변수 (`--var`) | 지원 | 지원 |
| `backdrop-filter` | 지원 (iOS 9+) | 부분 지원 |
| `position: sticky` | 지원 | 지원 |
| 알려진 문제 | `100vh` 가상키보드로 오버플로우 | 없음 |

**현재 이슈는 WebView 특이사항이 아닌 CSS 충돌**이므로,
Phase 1 수정만으로 카카오톡 포함 전 환경 정상화 가능.

---

*이 문서는 `docs/mobile-optimization-plan.md`에 저장되어 있습니다.*
