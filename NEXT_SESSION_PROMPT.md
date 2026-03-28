# 다음 세션 시작 프롬프트

아래 텍스트를 복사해서 새 Claude 창 첫 메시지로 붙여넣으세요.

---

## 붙여넣기용 프롬프트

```
저는 S-Reborn 의료 AI 교육 블로그를 개발 중입니다.
이전 세션에서 이어서 작업합니다.

**저장소**: https://github.com/a3492/s-reborn-blog
**로컬 경로**: C:/dev/s-reborn-world/blog
**인수인계 문서**: SESSION_HANDOVER_2026-03-28.md (저장소 루트에 있음)
**마지막 커밋**: 02f4dbf — fix(home): 히어로 랜덤화 + 버그 5종 수정

먼저 SESSION_HANDOVER_2026-03-28.md 파일을 읽어서 현재 상태를 파악해줘.
그 다음 내가 지시하는 작업을 이어서 진행해줘.

기술 스택: Astro 4, TypeScript, CSS (no Tailwind), GitHub Actions CI/CD

주요 컨벤션:
- 한국어 레이아웃에 max-width: ch 단위 금지
- em dash 제목은 splitTitle()로 분리 후 <br> 처리
- admin-grid 자식은 반드시 span-N 클래스 필요
- 그리드 버튼을 div로 감싸지 말 것 (세로 배열 버그)
- 히어로 카드는 <div> + 개별 <a> 구조 (<a> 안에 <button> 금지)
```

---

## 이어서 할 작업 선택지

세션 시작 후 아래 중 원하는 것을 지시하면 됩니다:

### A. 토글 동작 확인 및 디버그
```
홈페이지 히어로 카드의 ︾︾ 토글 버튼이 실제로 작동하는지 확인하고,
문제가 있으면 수정해줘.
```

### B. difficulty frontmatter 도입 (Phase 2 시작)
```
모든 블로그 포스트에 difficulty: beginner|intermediate|advanced
frontmatter를 추가하고, 홈페이지 사이드바에 난이도 배지를 표시해줘.
난이도 기준: AI 기초 개념 = beginner, 비교/적용 = intermediate, 심화 = advanced
```

### C. 블로그 포스트 페이지 개선
```
개별 블로그 포스트 페이지(/blog/[slug])의 레이아웃을 개선해줘.
현재 문제: 본문 폭이 너무 넓거나, 가독성이 떨어지는 부분 개선.
목표: 읽기 진행바, TOC(목차), 관련 글 추천 섹션 추가.
```

### D. Admin 기능 개선
```
Admin 미디어 페이지의 실제 파일 업로드 기능을 연동하고,
Pipeline 페이지에 자동 새로고침(30초) 기능을 추가해줘.
```
