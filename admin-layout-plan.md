# Admin 레이아웃 개선 기획서

작성일: 2026-03-28
대상: `src/pages/admin/` 전체 페이지, `src/styles/admin.css`, `src/layouts/AdminLayout.astro`

---

## 1. 문제 진단

### 1-1. 세로로 긴 레이아웃의 원인

| 원인 | 발생 위치 | 증상 |
|------|---------|------|
| UUID 전체 표시 | Settings Recent Changes, Audit log | 40자 UUID가 줄바꿈되어 행 높이 폭발 |
| 변경 키 나열 | Settings Recent Changes | "site_meta, homepage, about_page, social_links" 전부 표시 |
| admin-panel-stack 세로 누적 | Settings, Media, Edit Post 우측 | 4~5개 카드가 세로로 쌓여 스크롤 길이 = 페이지 길이 |
| 테이블 7열 | Jobs index | 좁은 화면에서 셀 내용이 줄바꿈되어 행 높이 증가 |
| admin-list-row 2열 | Recent Changes, Recent Assets | 좌측 텍스트가 wrap되면서 높이 불균형 |

---

## 2. 페이지별 개선 계획

### 2-1. Settings / index (admin-split 레이아웃)

**현재**: 우측 패널 = Stored Keys → Resolved Preview → Social Preview → Validation → Recent Changes (5개 세로 누적)

**개선안**:
- **Recent Changes**: `admin-list` → compact 3열 mini-table
  `[변경된 키 수] [날짜] [상세/복원 버튼]`
  UUID는 8자만 표시 + `title` attribute로 전체값 hover
- **Stored Keys**: 접기/펼치기 (`<details>`) 처리로 기본 숨김
- **Validation**: badge만 표시, 설명 텍스트 토글로 숨김

---

### 2-2. Settings / detail (span-7 + admin-panel-stack)

**현재**: 우측 패널 = Diff + Snapshot Source — Diff 카드가 변경 필드 수만큼 늘어남

**개선안**:
- Diff 카드: `changed` 항목만 기본 표시, `same` 항목은 `<details>`로 접기
- Snapshot Source: 날짜 + actor 8자 + Use 버튼만 1행으로

---

### 2-3. Jobs / index (span-12 테이블 7열)

**현재**: Status | Post | Path | Repo/Branch | Commit/Error | Created/Finished | Action
**문제**: 7열이 좁은 화면에서 모두 줄바꿈

**개선안**:
- Path, Repo/Branch 열: 1024px 이하에서 `display: none` (CSS only)
- Commit/Error: 40자 이상이면 `text-overflow: ellipsis` + `title`로 전체값
- Created/Finished: `white-space: nowrap` 처리

---

### 2-4. Jobs / detail (admin-detail-grid)

**현재**: 2열 그리드 — Job Summary | Related Post | Error/Commit(wide)
**개선안**: 현 구조 유지. 단 UUID/commit SHA는 8자 표시 + copy 버튼

---

### 2-5. Media / index (admin-split)

**현재**: 우측 = Recent Assets(카드) + Upload Logs(리스트) + Rule 안내
**문제**: Recent Assets 카드 4개 세로 누적, Upload Logs도 긴 리스트

**개선안**:
- Recent Assets: 카드 → 2열 mini-grid (`grid-template-columns: repeat(2, 1fr)`)
- Upload Logs: 최대 5건, 이후 "더 보기" 링크

---

### 2-6. Posts / edit (admin-split)

**현재**: 우측 = Entry Meta + Release State + Publish History Summary + Publish Pipeline
**문제**: 4개 패널 세로 누적 + mono 텍스트(commit SHA, path) 줄바꿈

**개선안**:
- Entry Meta + Release State → 하나의 카드로 통합
- Publish History Summary: 1행 요약만 (Success: sha8자 · Failure: 에러 첫 줄)
- mono 텍스트: `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`

---

### 2-7. Pipeline / index (span-7 + span-5)

**현재**: 좌측 = 검증 결과 카드들, 우측 = Bootstrap Checklist
**상태**: 구조 자체는 양호. 검증 결과 카드가 많아질 때만 길어짐
**개선안**: 검증 카드 `ok` 상태는 기본 접힘 표시, `warn/error`만 펼쳐서 표시

---

## 3. 공통 CSS 개선 사항

```css
/* UUID / mono 텍스트 말줄임 */
.admin-cell-mono {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 날짜 줄바꿈 방지 */
.admin-cell-date {
  white-space: nowrap;
}

/* 테이블 열 숨김 (1024px 이하) */
@media (max-width: 1024px) {
  .admin-col-hide { display: none; }
}

/* Recent Changes compact row */
.admin-change-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.5rem;
  align-items: center;
  padding: 0.6rem 0;
  border-top: 1px solid var(--admin-border-2);
  font-size: 0.82rem;
}
```

---

## 4. 사이드바 토글 (햄버거 메뉴)

**구현 방식**: CSS + 최소 JS
- 1080px 이하에서 사이드바 기본 숨김
- 햄버거 버튼(≡)을 헤더 또는 고정 위치에 배치
- `body.sidebar-open` 클래스 토글
- 사이드바 외부 영역 클릭 시 닫힘
- `localStorage['admin-sidebar-open']` 으로 상태 유지

---

## 5. 구현 우선순위

| 순위 | 항목 | 효과 |
|------|------|------|
| 1 | 사이드바 햄버거 토글 | UX 핵심 |
| 2 | UUID 8자 truncate + CSS 말줄임 공통화 | 즉각적 가독성 개선 |
| 3 | Jobs 테이블 열 숨김 | 테이블 가독성 |
| 4 | Settings Recent Changes compact | 가장 긴 섹션 단축 |
| 5 | Media Recent Assets 2열 grid | 시각적 밀도 개선 |
| 6 | Edit Post 우측 패널 통합 | 편집 UX 개선 |
