# 홈페이지 히어로 카드 리디자인 기획서

작성일: 2026-03-28
대상: `src/pages/index.astro`, `src/styles/design.css`

---

## 1. 변경 목표

| 항목 | 이전 | 이후 |
|------|------|------|
| 작성 날짜 | `.yt-foot` 안에 `<time>` 표시 | **제거** |
| 카테고리 태그 | `.yt-kicker` 안에 `.yt-tag` (AI 등) | **제거** |
| 본문 미리보기 | description(설명)만 표시 | **실제 본문 일부** (마크다운 제거 후 300자) |
| 펼치기/접기 | 없음 | "더 보기 / 접기" 버튼, CSS transition |
| 카드 이동 | 카드 전체가 `<a>` 링크 | `<div>` 카드 + 하단 `→` 링크 |

---

## 2. 구조 변경

### 이전 구조
```html
<a class="yt-hero" href="/blog/...">
  <div class="yt-kicker">
    <span class="yt-tag">AI</span>        ← 삭제
    <span class="yt-label">Latest Note</span>
  </div>
  <h1 class="yt-title">...</h1>
  <p class="yt-desc">설명글</p>
  <div class="yt-foot">
    <time class="yt-date">날짜</time>     ← 삭제
    <span class="yt-arrow">→</span>
  </div>
</a>
```

### 이후 구조
```html
<div class="yt-hero">
  <div class="yt-kicker">
    <span class="yt-label">Latest Note</span>  <!-- 카테고리 제거 -->
  </div>
  <h1 class="yt-title">...</h1>
  <div class="yt-body-wrap" id="yt-body-wrap">
    <p class="yt-body-preview">실제 본문 300자 미리보기...</p>
  </div>
  <button class="yt-body-toggle" id="yt-body-toggle">더 보기</button>
  <div class="yt-foot">
    <a class="yt-arrow-link" href="/blog/...">→</a>  <!-- 날짜 제거, 링크만 -->
  </div>
</div>
```

**이유**: `<a>` 안에 `<button>`은 HTML 명세상 유효하지 않음 → 카드를 `<div>`로 변경 후 `→` 화살표를 별도 `<a>`로 처리.

---

## 3. 마크다운 제거 로직

```ts
const stripMarkdown = (md: string) =>
  md
    .replace(/^#{1,6}\s+/gm, '')       // 제목 (#, ##, ...)
    .replace(/\*\*(.+?)\*\*/g, '$1')   // 굵게
    .replace(/\*(.+?)\*/g, '$1')       // 기울임
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // 링크
    .replace(/`+[^`]*`+/g, '')         // 코드
    .replace(/^\s*[-*+]\s+/gm, '')     // 리스트
    .replace(/\n+/g, ' ')              // 줄바꿈 → 공백
    .trim();

const bodyPreview = stripMarkdown(featuredPost.body ?? '').slice(0, 320);
```

---

## 4. CSS 신규 / 변경 클래스

```
.yt-body-wrap          : 본문 미리보기 컨테이너 (max-height 제한 + fade)
.yt-body-wrap.expanded : 펼친 상태 (max-height 해제)
.yt-body-preview       : 본문 텍스트 스타일
.yt-body-toggle        : "더 보기 / 접기" 버튼
.yt-arrow-link         : 하단 우측 이동 화살표 (이전 .yt-arrow 대체)
```

`.yt-hero`에서:
- `text-decoration: none` 제거 (div이므로 불필요)
- 클릭 hover transform은 유지 (div에도 동작)

---

## 5. JS 동작

```js
const toggle = document.getElementById('yt-body-toggle');
const wrap = document.getElementById('yt-body-wrap');
if (toggle && wrap) {
  toggle.addEventListener('click', () => {
    const expanded = wrap.classList.toggle('expanded');
    toggle.textContent = expanded ? '접기' : '더 보기';
  });
}
```

---

## 6. 디자인 원칙 (이 작업에서 확인된 규칙)

1. **히어로 카드에 메타 정보(날짜, 카테고리) 없음** — 제목과 본문으로 충분
2. **카드 전체 링크 → 부분 링크** — 상호작용(버튼)이 필요할 때 카드 구조 재설계
3. **본문 미리보기는 실제 content에서** — description 반복 금지
4. **펼치기/접기는 JS 클래스 토글 + CSS transition** — `<details>` 보다 애니메이션 자유도 높음
