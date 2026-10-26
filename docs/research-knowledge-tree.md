# Research Knowledge Tree

원본은 Notion `SREBORN Research Registry`입니다. 설정은 원장님이 [NOTION_SETUP_KO.md](research/NOTION_SETUP_KO.md) 대로 합니다.

흐름: Notion → `@notionhq/client` 동기화 → 트리 검증 → **PR** → 프리뷰 승인 후에만 `main`.

Published 문서만 사이트와 git에 나갑니다. Draft·Review와 그 하위는 제목·본문 모두 숨깁니다.

홈 CURRENT RESEARCH 카드는 `/research/multi-ai/`, `/research/human-ai/`, `/research/workflow/` 허브로 연결합니다. 예전 블로그 글 3편 파일은 삭제하지 않습니다.

```sh
npm run test:research
npm run qa:research
npm run build
```
