# 홈페이지 히어로 카드 버그 리포트

작성일: 2026-03-28
상태: 문서화 완료 / 수정 미착수

---

## 버그 목록

### BUG-01: 사이드바 카테고리 라벨("AI") 제거 안 됨

**현상**: 우측 사이드바 각 글 상단에 "AI" 카테고리 배지가 표시됨
**원인**: `index.astro` 사이드바 항목 렌더링 코드에 `.yt-item-cat` 스팬이 여전히 존재

```astro
{post.data.category && <span class="yt-item-cat">{post.data.category}</span>}
```

**수정 방향**: 해당 라인 삭제 또는 조건부 렌더링 제거

---

### BUG-02: 사이드바 날짜(Mar 12, 2026 등) 여전히 표시

**현상**: 우측 사이드바 각 글 하단에 날짜(`Mar 12, 2026`)가 보임
**원인**: `.yt-item-foot` 내 `<time>` 요소가 삭제되지 않은 상태

```astro
<div class="yt-item-foot">
  <time class="yt-item-date"><FormattedDate date={post.data.date} /></time>
  <span class="yt-item-arrow">→</span>
</div>
```

**수정 방향**: `<time class="yt-item-date">` 라인 삭제 (`.yt-item-foot`은 `→` 화살표만 남김)

---

### BUG-03: 본문 미리보기에 마크다운/HTML 주석 원문 노출

**현상**: 히어로 카드 본문 미리보기에 `<!-- 📗 LECTURE: 강의/교육 콘텐츠형 → 한줄 요약` 같은 HTML 주석이 그대로 출력됨
**원인**: `stripMarkdown()` 함수가 HTML 주석(`<!-- ... -->`)을 처리하지 않음
또한 마크다운 frontmatter YAML 이후 본문의 첫 줄이 주석으로 시작하는 글 구조 문제

**수정 방향**: `stripMarkdown()` 정규식에 HTML 주석 제거 패턴 추가

```ts
.replace(/<!--[\s\S]*?-->/g, '')   // HTML 주석 제거
.replace(/^---[\s\S]*?---\n?/m, '') // frontmatter 재노출 방어 (혹시 포함 시)
```

---

### BUG-04: "더 보기" 클릭 시 콘텐츠 미확장

**현상**: "더 보기" 버튼을 클릭해도 히어로 카드 본문이 펼쳐지지 않음
**원인 추정**:
1. Astro의 `<script>` 태그가 모듈 스코프로 실행되므로 `document.getElementById`가 동작은 하나, `.yt-body-wrap`의 `max-height`가 CSS에서 정확히 적용되지 않을 수 있음
2. CSS `.yt-body-wrap.expanded { max-height: 600px }` 규칙이 specificity 문제 또는 다른 규칙에 덮어씌워질 가능성
3. `transition: max-height 0.35s ease` 동작 확인 필요 — `max-height`에서 `none`이 아닌 명시적 px값 필요 (현재 `600px`이므로 OK)
4. 실제 클릭 이벤트가 등록되지 않을 가능성 (SSR 빌드 후 hydration timing)

**수정 방향**: JS 이벤트 등록을 `DOMContentLoaded` 이후 보장하거나, `is:inline` 지시자로 즉시 실행 보장. 또한 `console.log`로 클릭 이벤트 확인 후 CSS specificity 추적

---

### BUG-05: "더 보기" 텍스트 → 아이콘 표식으로 교체 필요

**현상**: 하단 버튼이 "더 보기" 텍스트로 표시됨
**요구사항**: 아래쪽 화살표 또는 `∨∨` (쉐브론 이중) 같은 시각적 표식으로 교체
접힌 상태: `︾` 또는 `⌄⌄` 또는 `↓` 계열 아이콘
펼친 상태: `︽` 또는 `⌃⌃` 또는 `↑` 계열 아이콘

**수정 방향**: 버튼 텍스트를 유니코드 아이콘으로 교체하거나, SVG 아이콘(chevron-down/up)을 인라인으로 삽입

---

## 수정 우선순위

| 번호 | 항목 | 난이도 | 우선순위 |
|------|------|--------|----------|
| BUG-01 | 카테고리 라벨 제거 | 쉬움 (1줄 삭제) | 높음 |
| BUG-02 | 날짜 제거 | 쉬움 (1줄 삭제) | 높음 |
| BUG-03 | HTML 주석 미리보기 노출 | 보통 (정규식 추가) | 높음 |
| BUG-04 | 더 보기 미동작 | 보통~어려움 (디버깅 필요) | 높음 |
| BUG-05 | 버튼 아이콘 교체 | 쉬움 | 보통 |

---

## 관련 파일

- `src/pages/index.astro` — BUG-01, 02, 03, 04, 05 모두
- `src/styles/design.css` — BUG-04 CSS specificity 확인
