# Doctor AI 내비게이션 개선 기획서
**작성일**: 2026-03-28
**대상**: `/doctor-ai/` 미니사이트 (43개 HTML 페이지)
**목적**: 사용자가 길을 잃지 않고 원하는 콘텐츠를 빠르게 찾을 수 있는 내비게이션 시스템 구축

---

## 1. 현황 진단 — 무엇이 문제인가

### 1.1 현재 구조 (Content Inventory)

**콘텐츠 인벤토리(Content Inventory)**: 페이지를 모두 목록화하고 구조를 파악하는 첫 단계.

```
/doctor-ai/                    ← 허브(Hub)
├── index.html                 ← 포털 페이지
├── fundamentals/home.html     ← 섹션 랜딩 (11편)
├── prompts/home.html          ← 섹션 랜딩 (4편)
├── cases/home.html            ← 섹션 랜딩 (4편)
└── tools/home.html            ← 섹션 랜딩 (4편)
    └── 01~04/*.html           ← 리프 노드(Leaf Node) × 총 23편
```

**계층 깊이(Hierarchy Depth)**: 최대 3단계
- L0: 홈(s-reborn-blog.pages.dev)
- L1: Doctor AI Hub (index.html)
- L2: 시리즈 홈 (fundamentals/home.html 등)
- L3: 개별 아티클 (01-xxx.html 등)

**총 노드(Node) 수**: 43개 (중복 폴더 포함 시)

---

### 1.2 진단된 문제점

#### 문제 A — 글로벌 내비게이션(Global Navigation) 부재
- 각 페이지 상단 Nav는 오직 "Doctor AI 홈" 링크 하나
- **다른 시리즈(Prompts → Cases → Tools)로의 Cross-link 없음**
- 사용자가 Prompts 4편을 읽다가 Cases를 보고 싶어도 경로가 없음
- → **정보 냄새(Scent of Information)** 단절: 관련 콘텐츠가 있다는 신호를 받지 못함

#### 문제 B — 고립 페이지(Orphaned Page) 위험
- 검색·외부 링크로 특정 아티클에 직접 진입(Deep Link)한 사용자는
  자신이 어느 섹션에 있는지 모름 (Orientation 단절)
- 브레드크럼(Breadcrumb)이 있지만 **경로가 파일 위치에 의존**해 일관성 없음
  (`../../index.html` vs `../../../../index.html` 혼재)

#### 문제 C — 멘탈 모델(Mental Model) 불일치
- 사용자는 "Doctor AI에 어떤 시리즈가 있나?" 를 어디서든 확인하고 싶음
- 현재는 `index.html`로 돌아가야만 전체 그림을 볼 수 있음
- **사이트맵(Sitemap) 또는 메가 메뉴(Mega Menu)** 없이 허브로만 의존

#### 문제 D — 내비게이션 패턴(Navigation Pattern) 불일치
- Topnav 구조가 페이지마다 다름 (4가지 패턴 혼재)
- 일관성 없는 UX → **학습 비용(Learning Cost) 증가**

---

## 2. 목표 정의

| 지표 | 현재 | 목표 |
|------|------|------|
| 섹션 간 이동 경로 | 없음 (허브 경유만) | 어느 페이지에서든 1클릭 |
| 전체 구조 파악 | 허브만 가능 | 어느 페이지에서든 가능 |
| 현재 위치 인식 | Breadcrumb 일부 | 모든 페이지 명확 표시 |
| 내비게이션 패턴 | 4가지 혼재 | 1가지 통합 컴포넌트 |

**핵심 UX 원칙**: 사용자가 어느 페이지에 있더라도
→ 지금 어디에 있는지 (Orientation)
→ 어디로 갈 수 있는지 (Wayfinding)
→ 어떻게 돌아갈지 (Back-tracking)
이 세 가지를 즉시 알 수 있어야 한다.

---

## 3. 해결책 — 3가지 내비게이션 레이어

### Layer 1: 글로벌 내비게이션 바 (Global Navbar) — 상단 고정
### Layer 2: 햄버거 메뉴 + 사이트맵 드로어 (Drawer Navigation)
### Layer 3: 브레드크럼 + 시리즈 진행 표시줄 (Contextual Navigation)

---

## 3.1 Layer 1 — 글로벌 내비게이션 바

**패턴**: 수평 탑바(Horizontal Top Bar) + Sticky Positioning

```
[ S-Reborn ]  Fundamentals  Prompts  Cases  Tools  [ ≡ 전체보기 ]
```

### 설계 원칙

**플랫 아키텍처(Flat Architecture)**: 모든 시리즈를 1단계에서 접근 가능하게.
현재의 허브-앤드-스포크(Hub-and-Spoke) 강제 경유 구조를 탈피.

**레이블링 시스템(Labeling System)**: 각 섹션명을 일관된 단어로 고정
- Fundamentals (입문), Prompts (프롬프트), Cases (케이스), Tools (툴)
- 한/영 병기로 사용자 인식 높임

### HTML 구조 (모든 Doctor AI 페이지 공통)

```html
<nav class="dai-global-nav" role="navigation" aria-label="Doctor AI 전체 메뉴">
  <div class="dai-nav-inner">
    <!-- 브랜드 -->
    <a class="dai-nav-brand" href="/doctor-ai/">
      <span class="dai-nav-badge">Doctor AI</span>
    </a>

    <!-- 섹션 링크 (데스크톱) -->
    <ul class="dai-nav-links" role="list">
      <li><a href="../fundamentals/home.html" data-section="fundamentals">Fundamentals</a></li>
      <li><a href="../prompts/home.html"       data-section="prompts">Prompts</a></li>
      <li><a href="../cases/home.html"         data-section="cases">Cases</a></li>
      <li><a href="../tools/home.html"         data-section="tools">Tools</a></li>
    </ul>

    <!-- 햄버거 트리거 -->
    <button class="dai-hamburger" aria-label="전체 메뉴 열기" aria-expanded="false" aria-controls="dai-drawer">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
```

**현재 활성 섹션 표시**: `data-section` 속성과 CSS `[data-active]` 로
현재 페이지의 소속 섹션에 Active State(활성 상태) 강조.

---

## 3.2 Layer 2 — 햄버거 드로어 (Sitemap Drawer)

**패턴**: 오프캔버스 드로어(Off-Canvas Drawer) + 오버레이(Overlay)
**트리거**: 우측 상단 햄버거 아이콘 (≡)
**위치**: 우측 슬라이드인(Slide-in from right) 또는 풀스크린

### 왜 사이트맵 드로어인가

**프로그레시브 디스클로저(Progressive Disclosure)**:
기본 화면은 깔끔하게 유지하되, 원하는 사용자만 전체 구조를 볼 수 있게.
항상 노출되는 메뉴는 시각적 노이즈(Visual Noise)가 되므로 트리거로 숨김.

**파인더빌리티(Findability)**:
"특정 콘텐츠를 얼마나 빠르게 찾을 수 있는가"를 높이는 핵심 장치.
드로어 내에 전체 아티클 목록을 노출함으로써 목적지가 명확한 사용자의 탐색 효율 극대화.

### 드로어 내부 구조 (Sitemap)

```
╔══════════════════════════════╗
║  ✕     Doctor AI 전체 보기   ║
╠══════════════════════════════╣
║                              ║
║  📖 Fundamentals             ║
║  ├─ 시리즈 소개              ║
║  ├─ 1편 · 의사가 AI를 ...    ║
║  ├─ 2편 · AI가 잘하는 일...  ║
║  ├─ ...                      ║
║  └─ 10편 · AI 시대 의사의 역할║
║                              ║
║  🖊️ Prompts                  ║
║  ├─ 1편 · 상황별 기본 프롬프트║
║  ├─ 2편 · 진료기록 자동 정리  ║
║  ├─ 3편 · 환자 설명문 초안   ║
║  └─ 4편 · 감별진단 목록 생성  ║
║                              ║
║  🔬 Cases                    ║
║  └─ 1~4편 ...                ║
║                              ║
║  🛠️ Tools                    ║
║  └─ 1~4편 ...                ║
║                              ║
╚══════════════════════════════╝
```

### 인터랙션 명세

| 액션 | 동작 |
|------|------|
| 햄버거 클릭 | 드로어 오픈 + 오버레이 표시 + `aria-expanded="true"` |
| 오버레이 클릭 | 드로어 클로즈 |
| ESC 키 | 드로어 클로즈 + 포커스 복귀 (Keyboard Trap 방지) |
| 아티클 링크 클릭 | 해당 페이지 이동 + 드로어 클로즈 |
| 현재 페이지 링크 | 강조 표시 (Active State) |

### 접근성(Accessibility) 고려

- `role="dialog"` + `aria-modal="true"` (스크린리더 지원)
- `aria-label="사이트맵 드로어"` (목적 명시)
- 포커스 트랩(Focus Trap): 드로어 열림 시 Tab이 드로어 내부만 순환
- 현재 페이지에는 `aria-current="page"` 속성 부여

---

## 3.3 Layer 3 — 컨텍스트 내비게이션 표준화

**브레드크럼(Breadcrumb) 표준화**:
현재 경로 기반 상대 링크(`../../index.html`)를 **절대 경로**로 통일.

```
홈 › Doctor AI › Cases › 1편
 ↓        ↓         ↓      ↓
/    /doctor-ai/  .../home  현재
```

`schema.org/BreadcrumbList` 마크업 추가 → SEO 향상.

**시리즈 진행 표시줄(Series Progress Indicator)**:
이미 개별 아티클에 있는 `series-progress` 컴포넌트를 표준화.
현재 위치(Orientation Cue)를 시각화.

---

## 4. 구현 계획

### Phase 1: 컴포넌트 제작 (1일)

**`dai-nav.js`** — 드로어 toggle, overlay, 키보드, active state 처리
**`dai-nav.css`** — 글로벌 Nav + 햄버거 + 드로어 스타일
**`dai-nav-inject.js`** — 모든 페이지에 동일한 Nav HTML 주입 (중복 제거)

### Phase 2: 모든 페이지 적용 (1일)

기존 4가지 Topnav 패턴을 하나의 표준 패턴으로 교체.
각 페이지에 `data-current-section` 속성 추가 (active state용).

### Phase 3: 브레드크럼 경로 수정 (0.5일)

절대 경로로 통일. `schema.org` 마크업 추가.

---

## 5. CSS 설계

```css
/* ── 글로벌 내비게이션 ─────────────────── */
.dai-global-nav {
  position: sticky;
  top: 0;
  z-index: 200;
  background: rgba(251, 247, 241, 0.94);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
  height: 54px;
}

/* ── 햄버거 아이콘 ─────────────────────── */
.dai-hamburger {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
}
.dai-hamburger span {
  display: block;
  height: 2px;
  background: var(--ink);
  border-radius: 2px;
  transition: transform 0.22s ease, opacity 0.22s ease;
}
/* 열림 상태: X 변환 */
.dai-hamburger[aria-expanded="true"] span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.dai-hamburger[aria-expanded="true"] span:nth-child(2) {
  opacity: 0;
}
.dai-hamburger[aria-expanded="true"] span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* ── 드로어 ────────────────────────────── */
.dai-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  max-width: 90vw;
  height: 100vh;
  background: var(--card);
  border-left: 1px solid var(--line);
  box-shadow: -8px 0 32px rgba(29, 35, 40, 0.12);
  transform: translateX(100%);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  z-index: 300;
}
.dai-drawer.open {
  transform: translateX(0);
}

/* ── 오버레이 ───────────────────────────── */
.dai-overlay {
  position: fixed;
  inset: 0;
  background: rgba(29, 35, 40, 0.4);
  backdrop-filter: blur(2px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ease;
  z-index: 250;
}
.dai-overlay.visible {
  opacity: 1;
  pointer-events: auto;
}

/* ── 섹션별 컬러 코딩 ──────────────────── */
.dai-drawer-section[data-section="fundamentals"] .dai-drawer-section-head {
  color: #155d4b; /* 초록 */
}
.dai-drawer-section[data-section="prompts"] .dai-drawer-section-head {
  color: #1e4080; /* 파랑 */
}
.dai-drawer-section[data-section="cases"] .dai-drawer-section-head {
  color: #4c2a8a; /* 보라 */
}
.dai-drawer-section[data-section="tools"] .dai-drawer-section-head {
  color: #7c2d12; /* 주황 */
}
```

---

## 6. JavaScript 설계 (`dai-nav.js`)

```javascript
(function () {
  // ── 드로어 상태 관리 ──────────────────────────
  const hamburger = document.querySelector('.dai-hamburger');
  const drawer    = document.getElementById('dai-drawer');
  const overlay   = document.getElementById('dai-overlay');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('visible');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // 스크롤 잠금 (Scroll Lock)
    // 포커스 트랩 시작
    drawer.querySelector('button, a').focus();
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('visible');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus(); // 포커스 복귀 (Focus Restoration)
  }

  hamburger.addEventListener('click', () =>
    drawer.classList.contains('open') ? closeDrawer() : openDrawer()
  );
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // ── Active State 자동 감지 ──────────────────────
  // 현재 URL에서 소속 섹션 추출 → Nav 링크 강조
  const path = window.location.pathname;
  const section = ['fundamentals', 'prompts', 'cases', 'tools']
    .find(s => path.includes('/' + s + '/'));

  if (section) {
    const activeLink = document.querySelector(
      `.dai-nav-links a[data-section="${section}"]`
    );
    if (activeLink) activeLink.setAttribute('aria-current', 'section');

    // 드로어 내 현재 페이지 강조
    document.querySelectorAll(`[data-section="${section}"] a`).forEach(a => {
      if (a.href && window.location.href.endsWith(a.getAttribute('href'))) {
        a.setAttribute('aria-current', 'page');
        a.classList.add('current');
      }
    });
  }
})();
```

---

## 7. 구현 방식 — 단일 JS 인젝션

**문제**: 43개 HTML 파일을 모두 수정하는 건 비효율적.

**해결**: 각 페이지 `<head>`에 단 두 줄만 추가.

```html
<link rel="stylesheet" href="/doctor-ai/assets/dai-nav.css" />
<script src="/doctor-ai/assets/dai-nav.js" defer></script>
```

`dai-nav.js` 로드 시 Nav HTML을 **동적으로 삽입(Inject)**:
```javascript
// dai-nav.js 상단
const navHTML = `
  <nav class="dai-global-nav" ...>
    ...
  </nav>
  <div class="dai-overlay" id="dai-overlay"></div>
  <aside class="dai-drawer" id="dai-drawer" role="dialog" aria-modal="true" ...>
    ...전체 사이트맵...
  </aside>
`;
document.body.insertAdjacentHTML('afterbegin', navHTML);
```

→ **단일 진실 공급원(Single Source of Truth)**: Nav를 한 곳에서만 관리.
→ 새 아티클 추가 시 `dai-nav.js`만 수정하면 43개 페이지에 즉시 반영.

---

## 8. 사이트맵 페이지 (선택 사항)

별도의 `/doctor-ai/sitemap.html` 페이지를 만들어
Google SEO 크롤러와 사용자 양쪽에 전체 구조를 제공.

**링크**: 드로어 하단 "전체 목차 보기 →" 버튼으로 진입.

---

## 9. 우선순위 및 작업 분류

| 우선순위 | 작업 | 예상 소요 |
|---------|------|----------|
| 🔴 즉시 | `dai-nav.css` + `dai-nav.js` + `dai-drawer` 제작 | 2~3시간 |
| 🔴 즉시 | 43개 페이지에 `<link>` + `<script>` 2줄 삽입 | 자동화 스크립트 |
| 🟡 이번 주 | 브레드크럼 절대 경로 통일 | 1시간 |
| 🟢 다음 | `/doctor-ai/sitemap.html` 독립 페이지 제작 | 2시간 |
| 🟢 나중 | 검색 기능 Doctor AI 내부 범위 필터 추가 | 별도 기획 |

---

## 10. 전문 용어 색인 (Glossary)

| 용어 (한국어) | 원어 | 정의 |
|--------------|------|------|
| 정보 구조 | Information Architecture (IA) | 콘텐츠를 어떻게 조직·분류·레이블링할지 설계하는 학문 |
| 길찾기 | Wayfinding | 사용자가 현재 위치를 파악하고 목적지로 이동하는 과정 |
| 글로벌 내비게이션 | Global Navigation | 사이트 어느 페이지에서든 동일하게 제공되는 최상위 메뉴 |
| 로컬 내비게이션 | Local Navigation | 현재 섹션/페이지 범위 내의 세부 메뉴 (시리즈 진행 표시 등) |
| 허브앤스포크 | Hub-and-Spoke | 중앙 허브를 통해서만 다른 섹션으로 이동 가능한 구조 |
| 오프캔버스 드로어 | Off-Canvas Drawer | 평소엔 숨겨져 있다가 트리거로 슬라이드 인 되는 패널 |
| 프로그레시브 디스클로저 | Progressive Disclosure | 모든 정보를 한 번에 보여주지 않고 필요할 때 단계적으로 표시 |
| 파인더빌리티 | Findability | 사용자가 원하는 콘텐츠를 얼마나 쉽게 찾을 수 있는가 |
| 정보 냄새 | Scent of Information | 링크·레이블이 목적지 콘텐츠에 대한 단서를 얼마나 잘 제공하는가 |
| 고립 페이지 | Orphaned Page | 다른 페이지에서 링크가 없어 탐색으로 도달할 수 없는 페이지 |
| 단일 진실 공급원 | Single Source of Truth | Nav 등 공통 요소를 한 곳에서만 관리해 일관성 보장 |
| 활성 상태 | Active State | 현재 선택된 메뉴 항목을 시각적으로 강조한 상태 |
| 포커스 트랩 | Focus Trap | 모달/드로어 열림 시 키보드 Tab이 그 영역 내에서만 순환하도록 제한 |
| 현재 위치 단서 | Orientation Cue | 브레드크럼, Active State 등 "지금 어디에 있는가"를 알려주는 시각 요소 |
| 멘탈 모델 | Mental Model | 사용자가 사이트 구조에 대해 갖고 있는 내면의 기대·이미지 |
| 플랫 아키텍처 | Flat Architecture | 계층이 얕아 클릭 수를 최소화한 구조 (↔ 딥 아키텍처) |
| 크로스 링크 | Cross-link | 다른 섹션의 관련 콘텐츠로 직접 연결하는 링크 |
| 딥 링크 | Deep Link | URL을 통해 상위 페이지를 거치지 않고 특정 페이지로 바로 진입 |
| 콘텐츠 인벤토리 | Content Inventory | 사이트의 모든 페이지를 목록화하고 속성을 기록한 스프레드시트 |
| 레이블링 시스템 | Labeling System | 메뉴명·제목·태그 등 텍스트 레이블의 일관성 기준 |
| 백트래킹 | Back-tracking | 사용자가 이전 페이지로 되돌아가는 행동 패턴 |
| 학습 비용 | Learning Cost | 새로운 UI 패턴을 사용자가 익히는 데 드는 인지적 노력 |

---

*이 기획서는 Doctor AI 미니사이트 네비게이션 전면 개선의 근거 문서입니다.*
*구현 시 `blog/public/doctor-ai/assets/` 폴더에 `dai-nav.css`, `dai-nav.js` 파일을 신규 생성합니다.*
