# Research Knowledge Tree

Notion `SREBORN Research Registry`가 원본입니다. 정적 동기화 → 검증 → PR → 프리뷰 승인 후에만 `main`에 들어갑니다.

## 주소

- `/research/`
- `/research/multi-ai/`
- `/research/human-ai/`
- `/research/workflow/`
- 하위 문서는 Parent 슬러그를 이어 붙입니다.

홈 CURRENT RESEARCH 카드는 위 세 허브로 연결합니다. 예전 블로그 URL 3건은 301 합니다. 블로그 파일은 삭제하지 않습니다. 후속 점검은 `docs/research-context-rot-followup.md`.

미발행 문서와 그 자식은 본문 페이지를 만들지 않고 트리에 제목만 남깁니다.

## 명령

```sh
npm run test:research
npm run qa:research
NOTION_TOKEN=… NOTION_RESEARCH_DATABASE_ID=… npm run sync:research
npm run build
```

동기화 워크플로는 GitHub Actions `Sync Research Registry`를 수동 실행합니다. 시크릿: `NOTION_TOKEN`, `NOTION_RESEARCH_DATABASE_ID`.

## 롤백

Cloudflare Pages에서 직전 프로덕션 배포를 다시 활성화하거나, 연구 PR을 revert 합니다. 블로그 `rsync --delete`는 `src/content/blog`만 지우므로 연구 파일은 건드리지 않습니다.
