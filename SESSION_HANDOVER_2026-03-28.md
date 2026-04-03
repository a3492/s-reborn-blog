# S-Reborn AI Blog — 세션 인수인계 문서

작성일: 2026-03-28
저장소: https://github.com/a3492/s-reborn-blog
마지막 커밋: `02f4dbf` fix(home): 히어로 랜덤화 + 버그 5종 수정

---

## 1. 프로젝트 기본 구조

```
/c/dev/s-reborn-world/
  blog/                   ← Astro 블로그 메인 (이 저장소)
  docs-site/              ← 문서 사이트 (별도)

blog/
  src/
    pages/
      index.astro         ← 홈페이지 (가장 많이 수정됨)
      blog/[...slug].astro
      admin/
        posts/edit.astro
        settings/index.astro
        settings/detail.astro
        jobs/index.astro
        media/index.astro
        pipeline/index.astro
    styles/
      design.css          ← 전체 스타일 (1980+ 줄, 대형 파일)
    components/
      admin/AdminSidebar.astro
    layouts/Layout.astro
    content/blog/         ← 마크다운 포스트들
    lib/site-settings.ts
```

---

## 2. 이번 세션에서 완료한 작업

### 2-1. Admin 레이아웃 개선 (모두 완료·커밋됨)

| 파일 | 수정 내용 |
|------|-----------|
| `AdminSidebar.astro` | 햄버거 토글 버튼 + 백드롭 오버레이 |
| `admin/jobs/index.astro` | UUID 8자 truncation, Path/Repo 컬럼 숨김(`admin-col-hide`), 날짜 포맷 |
| `admin/settings/index.astro` | Stored Keys `<details>` 접기, Validation 배지 요약, Recent Changes → `admin-change-row` 4열 그리드 |
| `admin/settings/detail.astro` | 우측 패널 `span-5` 누락 수정(글씨 세로 배열 버그), 히스토리 compact 형식 |
| `admin/media/index.astro` | Recent Assets 2열 미니그리드, Upload Logs 5개 제한 + 더 보기 |
| `admin/posts/edit.astro` | Entry Meta + Release State 병합, Publish History compact |
| `admin/pipeline/index.astro` | OK 상태 카드 `<details>` 기본 접기 |

**핵심 버그 수정:**
- **Settings Detail 글씨 세로 배열**: `admin-grid` 자식에 `span-5` 누락 → 1열(50px) 배정
- **Settings Recent Changes 버튼 세로 배열**: 3열 그리드에 버튼을 div로 감싸 flex-wrap → 4열로 확장, 버튼 direct child

### 2-2. 홈페이지 리디자인 (완료·커밋됨)

**YouTube 스타일 2열 레이아웃** — `src/pages/index.astro`

- 좌측: `.yt-hero` 대형 카드 (랜덤 글)
- 우측: `.yt-sidebar` 스크롤 가능 목록 (셔플 랜덤)
- 통계바: `글 N · 카테고리 N · 날짜` 1줄

**히어로 카드 구성 (현재 상태):**
```html
<div class="yt-hero" id="yt-hero">
  <h1 class="yt-title" id="yt-hero-title">제목</h1>
  <div class="yt-body-wrap" id="yt-body-wrap">
    <p class="yt-body-preview" id="yt-hero-body">본문 300자 미리보기</p>
  </div>
  <button class="yt-body-toggle" id="yt-body-toggle">︾︾</button>
  <div class="yt-foot">
    <a class="yt-arrow-link" id="yt-hero-link" href="...">→</a>
  </div>
</div>
```

**랜덤화 구현 방식:**
- `postsData` 전체 포스트를 `<script type="application/json" id="yt-posts-data">` 에 embed
- `<script is:inline>` IIFE가 로드 즉시:
  1. JSON 파싱
  2. 랜덤 인덱스로 히어로 선정
  3. 히어로 DOM 업데이트 (title, body, link)
  4. 나머지 셔플 후 사이드바 렌더링 (JS innerHTML)
  5. 펼치기/접기 토글 이벤트 등록

**제거된 항목:**
- 히어로: 날짜(`<time>`), 카테고리 태그(`.yt-tag`), "Latest Note" 레이블
- 사이드바: 카테고리 라벨, 날짜 (JS 렌더링이므로 애초에 없음)

**CSS 핵심 클래스 (design.css 하단, 약 1724줄~):**
```
.yt-layout         2열 grid (2fr 1fr), 860px 이하 1열
.yt-main           좌측 컨테이너
.yt-hero           대형 카드 (radial-gradient 배경)
.yt-body-wrap      본문 미리보기 wrap (max-height: 4.8rem 기본)
.yt-body-wrap.expanded  펼친 상태 (max-height: 9999px)
.yt-body-toggle    펼치기/접기 버튼
.yt-arrow-link     → 링크
.yt-stats          통계바
.yt-sidebar        우측 sticky 스크롤 사이드바
.yt-item           사이드바 항목
.yt-item-title     항목 제목
.yt-item-foot      항목 하단 (→만 표시)
.yt-item-arrow     → 화살표
```

---

## 3. 디자인 원칙 (축적된 피드백)

1. **`max-width: ch` 한국어 금지** — `12ch` ≈ 영문 12자 = 한국어 6자. 한국어 레이아웃에 ch단위 max-width 사용 절대 금지
2. **em dash 앞 줄바꿈** — 제목 `A — B` 형식은 ` — ` 기준으로 분리해 `<br>` 처리
3. **admin-grid 자식은 반드시 span-N** — span 없으면 1열(~50px) 배정으로 텍스트 세로 배열 버그
4. **그리드 버튼 wrapping div 금지** — `auto` 열에 div로 묶으면 flex-wrap으로 버튼 세로 배열됨. 각 버튼을 grid direct child로
5. **정보 밀도 우선** — 날짜/카테고리 라벨 등 메타 정보 과다 노출 지양, 제목과 콘텐츠 집중
6. **히어로 카드에 `<a>` 금지** — 내부에 button 필요하면 `<div>` 카드 + 개별 `<a>` 링크 구조

---

## 4. 향후 남은 작업 (Roadmap)

### Phase 2 — 홈페이지 개인화 기반 구축

| 작업 | 설명 | 난이도 |
|------|------|--------|
| `difficulty` frontmatter 추가 | 각 포스트에 `difficulty: beginner\|intermediate\|advanced` | 쉬움 |
| 사이드바 난이도 배지 | 선택적 표시 (필터 UI 선행 필요) | 보통 |
| 난이도 퀴즈 페이지 | 홈 진입 시 3~5문항으로 독자 레벨 파악 | 어려움 |
| `localStorage` reader_level | 레벨 저장 후 가중치 랜덤 선정 | 보통 |
| 읽은 글 추적 | 클릭 히스토리 → 이미 읽은 글 우선순위 낮춤 | 보통 |

### Phase 3 — Blog 포스트 페이지 개선

| 작업 | 설명 |
|------|------|
| 포스트 내 난이도 표시 | 상단 배지 |
| 관련 글 추천 | 같은 카테고리 + 비슷한 난이도 |
| 읽기 진행바 | 상단 scroll progress bar |
| TOC (목차) | 우측 sticky |

### Phase 4 — Admin 기능 추가

| 작업 | 설명 |
|------|------|
| Media 실제 업로드 연동 | 현재 UI만 존재 |
| Pipeline 실시간 새로고침 | 현재 수동 새로고침 |
| Settings 히스토리 복원 | diff 기반 롤백 기능 |

---

## 5. 주요 파일 빠른 참조

| 파일 | 줄 수 | 용도 |
|------|-------|------|
| `src/pages/index.astro` | ~155줄 | 홈페이지 전체 |
| `src/styles/design.css` | ~1980줄 | 전체 스타일 (YT 클래스 1724줄~) |
| `src/pages/admin/settings/index.astro` | 대형 | 설정 페이지 |
| `src/pages/admin/settings/detail.astro` | 대형 | 설정 상세 |
| `src/pages/admin/posts/edit.astro` | 대형 | 포스트 편집 |
| `src/components/admin/AdminSidebar.astro` | 중형 | 햄버거 사이드바 |

---

## 6. 알려진 미검증 항목

- **`︾︾` 토글 실제 동작 확인 필요** — is:inline IIFE 방식으로 수정했으나 실제 클릭 테스트 미완
- **모바일 반응형 히어로** — 860px 이하 1열 전환은 CSS 있으나 body preview 높이 적절성 미확인
- **postsData JSON XSS** — `escapeHtml()` 함수 IIFE 내 정의, href/title 이스케이프 처리함

---

## 7. 관련 기획 문서 (저장소 내)

| 파일 | 내용 |
|------|------|
| `homepage-redesign-plan.md` | YouTube 레이아웃 전체 기획 |
| `homepage-hero-plan.md` | 히어로 카드 + 랜덤화 + Phase 로드맵 |
| `homepage-hero-bugs.md` | BUG-01~05 리포트 (모두 수정 완료) |
| `admin-layout-plan.md` | Admin 개선 계획 |

---

## 8. 메모리 파일 위치 (로컬, 세션 간 유지)

```
C:/Users/김도위/.claude/projects/C--dev/memory/
  MEMORY.md                         ← 인덱스
  WORKLOG.md                        ← 작업 로그
  project_s_reborn_world.md         ← 프로젝트 구조
  feedback_blog_design.md           ← 디자인 피드백
  feedback_homepage_title_design.md ← 제목 디자인 규칙
  bugreport_settings_detail_layout_2026-03-28.md
  bugreport_change_row_buttons_2026-03-28.md
  reflection_2026-03-27.md
```
