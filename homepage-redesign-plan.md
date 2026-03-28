# 홈페이지 UX 리디자인 기획서

작성일: 2026-03-28
대상: `src/pages/index.astro`, `src/styles/design.css`

---

## 1. 문제 진단

### 1-1. 텍스트 과부하

| 요소 | 현황 | 문제 |
|------|------|------|
| `card-link` | "자세히 보기" 텍스트 | 카드 자체가 이미 링크 → 중복 안내 |
| `read-link` | "읽기 →" | 화살표만으로 충분 |
| home-signal 설명 | "의학과 AI 기록을 최근 순서대로 묶어 보여줍니다." | 레이블이 이미 의미를 전달함 |
| home-signal 카드 | 3개 박스로 공간 차지 | 숫자 3개를 위해 화면의 1/4 소비 |

### 1-2. 레이아웃 비효율

- 상단: featured (large) + side 2개 = 한 화면
- 하단: 통계 3카드 → sec-rule → post-grid 4열
- → 스크롤을 많이 해야 글 전체를 볼 수 있음
- 우측 사이드 2개 글만 보임 → 나머지는 grid까지 내려가야 함

---

## 2. 개선 방향

### 2-1. 텍스트 정리

- "자세히 보기" → `→` 단독
- "읽기 →" → `→` 단독
- home-signal: 카드 제거 → 1줄 compact 스탯바로 압축
  `글 10 · 카테고리 3 · Mar 16, 2026`
- sec-rule "Recent Posts" 헤더: 불필요 → 제거

### 2-2. YouTube 스타일 레이아웃

```
┌─────────────────────────────┬──────────────────┐
│   [AI] LATEST NOTE          │ ─────────────     │
│                             │ [AI] 제목         │
│   메인 카드 제목             │ Mar 13  →         │
│   (크고 선명하게)            │ ─────────────     │
│                             │ [AI] 제목         │
│   설명 텍스트               │ Mar 10  →    ↕    │
│   Mar 16  →                 │ ─────────────  scroll
│                             │ [essay] 제목      │
│   ─────────────────────     │ Feb 28  →         │
│   글 10 · 카테고리 3 · 날짜  │                   │
└─────────────────────────────┴──────────────────┘
```

- **좌측 (main, ~62%)**: 메인 featured 카드 (크고 immersive)
- **우측 (sidebar, ~300px)**: 모든 나머지 글을 세로 스크롤 리스트
  - 사이드바 max-height: `calc(100vh - 3rem)` + `overflow-y: auto`
  - position: sticky (스크롤해도 우측은 고정)
- **무작위 노출**: 사이드바 목록을 JS로 페이지 로드시 섞음 (매 방문마다 다른 순서)

### 2-3. 모바일 대응

- 860px 이하: 세로 스택 (main 위, sidebar 아래 max-height 55vh 스크롤)

---

## 3. CSS 신규 클래스

```
.yt-layout         : 2열 그리드 컨테이너
.yt-main           : 좌측 컬럼 (flex column)
.yt-hero           : 메인 피처드 카드 (featured-main 스타일 계승)
.yt-kicker         : category + label 배지 행
.yt-title          : 대형 제목
.yt-desc           : 설명
.yt-foot           : 날짜 + 화살표 행
.yt-stats          : 하단 compact 스탯바
.yt-sidebar        : 우측 스크롤 리스트 컨테이너
.yt-item           : 사이드바 개별 포스트 행
.yt-item-cat       : 카테고리 배지
.yt-item-title     : 포스트 제목 (2줄 clamp)
.yt-item-foot      : 날짜 + 화살표
```

---

## 4. JS 동작

```js
// 사이드바 목록 무작위 섞기
const sidebar = document.getElementById('yt-sidebar');
const items = [...sidebar.querySelectorAll('[data-yt-post]')];
items.sort(() => Math.random() - 0.5);
items.forEach(el => sidebar.appendChild(el));
```

---

## 5. 제거 항목

| 요소 | 처리 |
|------|------|
| `.home-signal` 3카드 섹션 | 제거 → 1줄 `.yt-stats` 대체 |
| `sec-rule` "Recent Posts" | 제거 |
| `.post-grid` 4열 그리드 | 제거 → 사이드바로 통합 |
| `.featured-wrap` / `.featured-side` | 제거 → `.yt-layout` 대체 |
| "자세히 보기" 텍스트 | `→` 로 대체 |
| "읽기 →" 텍스트 | `→` 로 대체 |

Doctor AI 섹션은 유지 (홈 하단)

---

## 6. 디자인 원칙 (향후 적용)

1. 텍스트는 최소한으로 — 아이콘/화살표로 대체 가능하면 대체
2. 통계/레이블은 숫자+단위만, 설명은 삭제
3. 우측 사이드바 패턴은 콘텐츠 목록에 기본 레이아웃
4. 랜덤 노출로 매 방문마다 다른 글이 먼저 눈에 띄게

---

*구현 커밋: `feat(home): YouTube 스타일 레이아웃 리디자인`*
