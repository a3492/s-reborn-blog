# 버그 보고서 — Doctor AI 글로벌 내비게이션 (2026-03-28)

## 발견 경위
사용자 직접 보고. 배포 직후 발견.

---

## 버그 목록

### [NAV-01] S-Reborn 클릭 시 홈(/)이 아닌 /doctor-ai/ 로 이동
- **심각도**: 🔴 심각 (브랜드 홈 링크 오작동)
- **위치**: `public/doctor-ai/assets/dai-nav.js` — 글로벌 Nav 브랜드 영역
- **증상**: 상단 Nav "Doctor AI / S-Reborn" 에서 S-Reborn 클릭 시 홈페이지가 아닌 Doctor AI 허브(/doctor-ai/)로 이동
- **원인**: 브랜드 영역 전체를 단일 `<a href="/doctor-ai/">` 태그로 감쌈
  ```html
  <!-- 버그 코드 -->
  <a class="dai-nav-brand" href="/doctor-ai/">
    <span class="dai-nav-badge">Doctor AI</span>
    <span class="dai-nav-sep">/</span>
    <span class="dai-nav-site">S-Reborn</span>  ← 이 텍스트도 /doctor-ai/ 로 이동
  </a>
  ```
- **수정**: 두 개의 독립적인 `<a>` 태그로 분리
  ```html
  <!-- 수정 코드 -->
  <div class="dai-nav-brand">
    <a class="dai-nav-badge" href="/doctor-ai/">Doctor AI</a>
    <span class="dai-nav-sep">/</span>
    <a class="dai-nav-site" href="/">S-Reborn</a>
  </div>
  ```
- **영향 파일**: `public/doctor-ai/assets/dai-nav.js`, `public/doctor-ai/assets/dai-nav.css`
- **상태**: ✅ 수정완료

---

## 재발 방지 원칙

1. **복합 텍스트 링크**: 하나의 `<a>` 안에 서로 다른 목적지를 가진 텍스트를 묶지 않는다
2. **Nav 구현 후 체크리스트**: 모든 클릭 가능 요소의 href를 실제로 클릭해서 목적지 확인
3. **브랜드 영역**: 서비스명(Doctor AI) → 서비스 허브, 브랜드명(S-Reborn) → 사이트 루트(/) — 목적지가 다르므로 항상 별도 링크

---

## 체크리스트 (Nav 구현 후 매번 확인)

- [ ] "Doctor AI" 클릭 → /doctor-ai/ 이동
- [ ] "S-Reborn" 클릭 → / (블로그 홈) 이동
- [ ] "Fundamentals" 클릭 → /doctor-ai/fundamentals/home.html
- [ ] "Prompts" 클릭 → /doctor-ai/prompts/home.html
- [ ] "Cases" 클릭 → /doctor-ai/cases/home.html
- [ ] "Tools" 클릭 → /doctor-ai/tools/home.html
- [ ] 햄버거 클릭 → 드로어 열림
- [ ] "Doctor AI 허브로 이동" 클릭 → /doctor-ai/
- [ ] 드로어 내 아티클 링크 → 해당 페이지
- [ ] ESC → 드로어 닫힘
- [ ] 오버레이 클릭 → 드로어 닫힘
