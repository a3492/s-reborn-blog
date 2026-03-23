# Admin Publish Pipeline

## 목적

관리자 화면에서 저장된 draft를 Private GitHub repo로 발행하고, 기존 GitHub Actions 동기화 체인을 통해 공개 블로그에 반영한다.

## 현재 추가된 것

- `publish_jobs` 테이블 migration
- `functions/api/admin/publish.ts` Cloudflare Pages Function 초안
- `/admin/posts/edit` 발행 요청 버튼
- `dryRun` 모드 지원

## 필요한 환경 변수

Cloudflare Pages Functions 기준:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_TOKEN`
- `GITHUB_REPO`
- `GITHUB_BRANCH`

예시:

- `GITHUB_REPO=a3492/S_Reborn_and_AI`
- `GITHUB_BRANCH=main`

## 요청 흐름

1. 관리자 UI에서 발행 요청
2. Function이 Supabase에서 post 조회
3. Markdown frontmatter + body 생성
4. GitHub Contents API로 파일 생성/갱신
5. `publish_jobs` 상태 업데이트
6. 성공 시 commit sha 기록

## 파일 경로 규칙

기본 규칙:

```text
src/content/blog/{category}/{subcategory?}/{slug}.md
```

현재 스캐폴드는 `category`, `subcategory`, `slug`를 조합해서 경로를 만든다.

## Dry Run

`/api/admin/publish`에 `dryRun: true`로 보내면 실제 GitHub 업로드 없이 아래 정보만 반환한다.

- target path
- commit message
- markdown preview

## 주의

- 현재 Function은 Cloudflare Pages Functions 환경을 전제로 한다.
- 로컬 `astro dev`만으로는 동일하게 실행되지 않을 수 있다.
- production 연결 전에는 `dryRun`으로 먼저 검증하는 것이 맞다.
