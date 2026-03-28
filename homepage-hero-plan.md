# 홈페이지 히어로 카드 리디자인 기획서

작성일: 2026-03-28
최종 수정: 2026-03-28
대상: `src/pages/index.astro`, `src/styles/design.css`

---

## 1. 변경 목표

| 항목 | 이전 | 이후 |
|------|------|------|
| 작성 날짜 | `.yt-foot` 안에 `<time>` 표시 | **제거** |
| 카테고리 태그 | `.yt-kicker` 안에 `.yt-tag` (AI 등) | **제거** |
| 히어로 글 선정 | 항상 최신 글 고정 (`Latest Note`) | **매 방문마다 랜덤** |
| 본문 미리보기 | description(설명)만 표시 | **실제 본문 일부** (마크다운 제거 후 300자) |
| 펼치기/접기 | 없음 | 아이콘 버튼 (`︾` / `︽`), CSS transition |
| 카드 이동 | 카드 전체가 `<a>` 링크 | `<div>` 카드 + 하단 `→` 링크 |

---

## 2. 히어로 글 랜덤 선정 (핵심 변경)

### 현재 방식
```ts
const featuredPost = configuredFeatured || allPosts[0]; // 항상 최신 글
```
`.yt-kicker`에 "Latest Note" 레이블 표시 → 이제 의미 없음.

### 변경 방식

히어로 글도 사이드바와 동일하게 **클라이언트 사이드 JS로 랜덤 배치**한다.
SSR 빌드 시점에 고정하는 방식(`Math.random()` in frontmatter)은 배포 후 재빌드 전까지 바뀌지 않으므로 부적합.

**구현 전략**:
- 서버에서는 모든 글을 `data-*` 속성으로 히어로 영역에 숨겨 전달
- 페이지 로드 시 JS가 랜덤으로 하나를 골라 히어로 UI를 채움
- 나머지는 사이드바로 이동

또는 더 단순한 방법:
- 서버에서 `allPosts`를 **시드 없이 전달**하되, 히어로는 빈 상태로 두고
- JS가 사이드바에서 랜덤으로 하나를 뽑아 히어로 자리로 옮김

→ **추천: SSR에서 첫 글을 기본값으로 렌더링하되, JS로 다른 글로 교체** (SEO 기본값 유지 + UX 랜덤성 확보)

`.yt-kicker` 레이블: "Latest Note" → **제거** (랜덤이므로 의미 없음)

---

## 3. 향후 로드맵 — 난이도 기반 맞춤형 추천

### 단계별 계획

**Phase 1 (현재)**: 완전 랜덤
- 모든 글을 동등하게 섞어 히어로 + 사이드바 배치
- 매 방문마다 다른 글이 히어로로 노출

**Phase 2**: 난이도 태그 도입
- 각 포스트 frontmatter에 `difficulty: beginner | intermediate | advanced` 추가
- 사이드바에서 난이도 배지 표시 (선택적)

**Phase 3**: 독자 난이도 테스트
- 홈페이지 진입 시 짧은 퀴즈(3~5문항)로 독자 수준 파악
- `localStorage`에 레벨 저장 (`reader_level: beginner | intermediate | advanced`)
- 히어로 + 상위 노출 글을 독자 레벨에 맞춰 가중치 랜덤 선정

**Phase 4**: YouTube식 개인화
- 클릭 히스토리(`localStorage`)를 분석해 관심 카테고리 파악
- 이미 읽은 글은 우선순위 낮춤
- 읽지 않은 글 + 관심 카테고리 글에 가중치 부여
- 완전한 맞춤형 피드 구현

---

## 4. HTML 구조 (목표 상태)

```html
<div class="yt-hero">
  <!-- yt-kicker: "Latest Note" 레이블 제거, 필요 시 완전 삭제 -->
  <h1 class="yt-title">...</h1>
  <div class="yt-body-wrap" id="yt-body-wrap">
    <p class="yt-body-preview">실제 본문 300자 미리보기...</p>
  </div>
  <button class="yt-body-toggle" id="yt-body-toggle" aria-label="본문 펼치기">︾︾</button>
  <div class="yt-foot">
    <a class="yt-arrow-link" href="/blog/...">→</a>
  </div>
</div>
```

**이유**: `<a>` 안에 `<button>`은 HTML 명세상 유효하지 않음 → 카드를 `<div>`로 변경.

---

## 5. 마크다운 제거 로직 (수정 필요)

현재 `stripMarkdown()`이 HTML 주석을 처리하지 않아 `<!-- ... -->` 원문이 노출됨 (BUG-03).

```ts
const stripMarkdown = (md: string) =>
  md
    .replace(/<!--[\s\S]*?-->/g, '')    // HTML 주석 제거 ← 추가 필요
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/`+[^`]*`+/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
```

---

## 6. CSS 신규 / 변경 클래스

```
.yt-body-wrap          : 본문 미리보기 컨테이너 (max-height 제한 + fade)
.yt-body-wrap.expanded : 펼친 상태 (max-height 해제)
.yt-body-preview       : 본문 텍스트 스타일
.yt-body-toggle        : 펼치기/접기 아이콘 버튼 (︾︾ / ︽︽)
.yt-arrow-link         : 하단 우측 이동 화살표
```

---

## 7. JS 동작

```js
// 펼치기/접기
const toggle = document.getElementById('yt-body-toggle');
const wrap = document.getElementById('yt-body-wrap');
if (toggle && wrap) {
  toggle.addEventListener('click', () => {
    const expanded = wrap.classList.toggle('expanded');
    toggle.textContent = expanded ? '︽︽' : '︾︾';
  });
}

// 히어로 랜덤 교체 (Phase 1)
// 사이드바 아이템 중 하나를 히어로로, 히어로는 사이드바로
// 구현 방식: JS에서 data-* 속성을 읽어 DOM 조작 또는 전체 데이터 JSON embed
```

---

## 8. 알려진 버그 (homepage-hero-bugs.md 참조)

| ID | 항목 | 상태 |
|----|------|------|
| BUG-01 | 사이드바 카테고리 라벨 미제거 | 미수정 |
| BUG-02 | 사이드바 날짜 미제거 | 미수정 |
| BUG-03 | 본문 HTML 주석 노출 | 미수정 |
| BUG-04 | 더 보기 클릭 시 미확장 | 미수정 |
| BUG-05 | 버튼 텍스트 → 아이콘 교체 | 미수정 |

---

## 9. 디자인 원칙

1. **히어로 카드에 메타 정보(날짜, 카테고리) 없음** — 제목과 본문으로 충분
2. **히어로 글은 랜덤** — "최신 = 가장 중요"가 아님, 모든 글에 동등한 노출 기회
3. **카드 전체 링크 → 부분 링크** — 상호작용(버튼)이 필요할 때 카드 구조 재설계
4. **본문 미리보기는 실제 content에서** — description 반복 금지
5. **펼치기/접기는 JS 클래스 토글 + CSS transition** — `<details>` 보다 애니메이션 자유도 높음
6. **랜덤 → 개인화** — Phase 1 완전 랜덤에서 시작해 난이도 테스트 → 클릭 히스토리 순으로 점진적 고도화
