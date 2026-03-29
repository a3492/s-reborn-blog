# 버그 보고서 — Doctor AI 시리즈 진행바 · 클릭 영역 · 사이트맵
**작성일**: 2026-03-29
**발견**: 사용자 스크린샷 + 코드 감사

---

## 버그 목록

### 🔴 CRITICAL

#### BUG-01 ~ BUG-03: dai-nav.js SITEMAP 5편 누락 (3건)

| 번호 | 파일 | 시리즈 | 누락 항목 |
|------|------|--------|---------|
| BUG-01 | `public/doctor-ai/assets/dai-nav.js` | Cases | `05-pediatric-fever-workup.html` |
| BUG-02 | `public/doctor-ai/assets/dai-nav.js` | Tools | `05-medical-ai-tools-specialty.html` |
| BUG-03 | `public/doctor-ai/assets/dai-nav.js` | Prompts | `05-consent-form-prompts.html` |

**현상**: 햄버거 드로어 사이트맵에 각 시리즈의 5편이 표시되지 않음
**원인**: 10일 스프린트에서 5편 HTML 파일은 생성됐으나 dai-nav.js SITEMAP 배열에 추가 누락
**수정**: SITEMAP 배열에 5편 항목 추가

---

#### BUG-04 ~ BUG-06: 시리즈 진행 표시바 5편 누락 (3개 시리즈 × 5파일)

**현상**: Tools · Cases · Prompts 시리즈의 각 아티클 상단 진행바에 5편 링크 없음
(스크린샷: Tools 4편 페이지에서 진행바가 소개·1편·2편·3편·4편만 표시)

**시리즈별 진행바 CSS 구조가 3가지로 불일치**:
| 시리즈 | 구조 | 현재 편수 |
|--------|------|---------|
| Tools | `<a href>·<span class="sp-sep">·` 패턴 | 소개+4편 |
| Cases | `<div class="sp-items"> → <span class="sp-item on">` 패턴 | 소개+4편 |
| Prompts | `<a class="sp-step">` 패턴 | 소개+4편 |

**수정**: 각 시리즈 아티클 파일 5개씩(01~05) × 3시리즈 = 15파일 진행바에 5편 추가

---

### 🟠 HIGH

#### BUG-07 ~ BUG-11: ep-card 전체 클릭 불가 — Tools home.html

**파일**: `public/doctor-ai/tools/home.html`
**현상**: 카드 테두리 안쪽 텍스트만 클릭되고 카드 빈 영역 클릭 시 이동 안 됨
**원인**:
```html
<!-- 현재 (잘못된 구조) -->
<div class="ep-card active">
  <a href="./01-chatgpt-vs-claude.html">
    <div class="ep-num">1편</div>
    ...
  </a>
</div>

<!-- 올바른 구조 (cases/prompts home.html 패턴) -->
<a class="ep-card active" href="./01-chatgpt-vs-claude.html">
  <div class="ep-num">1편</div>
  ...
</a>
```
**수정**: div 컨테이너를 `<a>` 태그로 교체 (5개 카드)

---

#### BUG-12 ~ BUG-26: 전체 Doctor AI 아티클 페이지 시리즈 내비 클릭 영역

**파일**: `cases/`, `prompts/`, `tools/` 각 아티클 하단 `.series-nav`
**현상**: prev/next 버튼 텍스트만 클릭 가능, 버튼 주변 패딩 영역 클릭 불가
**원인**: `<a>` 안에 콘텐츠 구조는 맞으나 CSS에서 `display: block` 미지정
**수정**: CSS `.series-nav a` 에 `display: flex` 확인 및 `width: 100%` 적용

---

### 🟡 NOTICE

#### BUG-27: 사이트맵 드로어 — 전체 목록 노출로 스크롤 과다

**파일**: `public/doctor-ai/assets/dai-nav.js` (드로어 HTML 생성 로직)
**현상**: 드로어 열면 40+편 전체 링크 나열 → 원하는 시리즈 찾기 어려움
**요청**: 트리 구조 (시리즈 제목 클릭 → 편 목록 펼침/접힘)로 변경

---

## 수정 계획

| 항목 | 방법 | 파일 |
|------|------|------|
| BUG-01~03 | dai-nav.js SITEMAP 5편 추가 | `assets/dai-nav.js` |
| BUG-04~06 | Node.js 스크립트로 진행바 5편 삽입 | 15개 HTML |
| BUG-07~11 | tools/home.html ep-card 구조 수정 | `tools/home.html` |
| BUG-27 | dai-nav.js 드로어 아코디언 트리 구조 재설계 | `assets/dai-nav.js` + `assets/dai-nav.css` |

---

*이 보고서는 수정 완료 후 WORKLOG.md에 요약 기록됨*
