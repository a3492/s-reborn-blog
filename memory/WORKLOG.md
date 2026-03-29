# 작업 로그 — S-Reborn Blog

---

## 2026-03-29

### 완료 작업

| 시간 | 작업 | 커밋 | 상태 |
|------|------|------|------|
| 오전 | BUG-01~03: SITEMAP 5편 누락 수정 (dai-nav.js) | 4925bff | ✅ |
| 오전 | BUG-04~06: series-progress 5편 링크 추가 (15개 파일) | 4925bff | ✅ |
| 오전 | BUG-07~11: Tools home.html ep-card 클릭 영역 확장 | 4925bff | ✅ |
| 오전 | BUG-27: 사이트맵 드로어 트리/아코디언 구조 리디자인 | 4925bff | ✅ |

### 버그 보고서
- [Doctor AI 시리즈·진행바·사이트맵 27건](bugreport_dai_series_clickarea_2026-03-29.md)

### 기술 상세
- **dai-nav.js 완전 재작성**:
  - SITEMAP 배열: Prompts·Cases·Tools 모든 시리즈에 5편 항목 추가
  - 드로어 HTML 생성: 트리 구조로 변경 (`.dai-tree-toggle`, `.dai-tree-links`)
  - 토글 이벤트: 섹션별 클릭 시 펼침/접힘 처리
  - 현재 섹션 자동 펼침 (빠른 네비게이션)

- **dai-nav.css 업데이트**:
  - 새로운 트리 스타일: `.dai-tree-toggle`, `.dai-tree-icon`, `.dai-tree-count`, `.dai-tree-chevron`
  - 섹션별 컬러 유지: `[data-section="..."] .dai-tree-label { color: ... }`
  - 기본 접힘 → 펼침: `.dai-tree-links.dai-tree-open { display: block; }`

- **15개 Series 파일 배치 수정** (fix-dai-series.cjs):
  - Prompts (5개): `<a class="sp-step">5편</a>` 패턴
  - Cases (5개): `<a class="sp-item done">5편</a>` 패턴
  - Tools (5개): `<a href="./05...">5편</a><span class="sp-sep">·</span>` 패턴

- **Tools home.html 클릭 영역 개선**:
  - 구조 전환: `<div class="ep-card"><a>` → `<a class="ep-card">`
  - 효과: 전체 카드 영역이 클릭 가능하도록 개선

### 커밋 내용
- **4925bff**: "fix: Doctor AI 시리즈 5편 추가 및 네비게이션 개선"
  - 16개 파일 변경, 161줄 추가, 95줄 삭제
  - 모든 변경사항이 정상 작동함을 확인

### 미완료·보류
- 나머지 시리즈 홈(Cases, Prompts)의 ep-card 구조 확인 필요 (이미 올바른 구조임)
- series-nav 클릭 영역 (BUG-12~26) 검토 필요

---

## 2026-03-28

### 완료 작업

| 시간 | 작업 | 커밋 | 상태 |
|------|------|------|------|
| 오전 | BUG-01~09: 홈페이지·블로그 전체 버그 9개 수정 | 7f02dff | ✅ |
| 오후 | 검색 수정 (Fuse.js /node_modules/ → CDN) | 6a499ff | ✅ |
| 오후 | Doctor AI Prompts·Cases·Tools 02-04편 신규 아티클 9개 | 6a499ff | ✅ |
| 오후 | Fundamentals home.html 6편→10편 업데이트 | 6a499ff | ✅ |
| 오후 | Doctor AI 글로벌 내비게이션 + 햄버거 드로어 구현 | b9333a1 | ✅ |
| 오후 | [NAV-01] S-Reborn 링크 버그 수정 | - | ✅ |

### 버그 보고서
- [홈·블로그 버그 9건](bugreport_homepage_blog_2026-03-28.md)
- [Doctor AI Nav 버그 1건](bugreport_dai_nav_2026-03-28.md)

### 기획서
- [Doctor AI 내비게이션 개선 기획서](plan_doctor_ai_navigation_2026-03-28.md)

### 미완료·보류
- Doctor AI sitemap.html 독립 페이지 (기획서에 Phase 3로 기록)
- 브레드크럼 절대 경로 통일 (부분 적용됨)

---
