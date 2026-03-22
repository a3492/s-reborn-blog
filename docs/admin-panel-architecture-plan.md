# Admin Panel Architecture Plan

## 1. Goal

이 문서는 `s-reborn-blog`에 필요한 관리자 페이지의 설계 방향, 기능 범위, 데이터 흐름, 기술 아키텍처, 단계별 구현 계획을 정리한다.

핵심 목표는 아래 4가지다.

1. 글 수정과 발행 작업을 브라우저에서 안전하게 처리한다.
2. 현재의 Astro SSG + Cloudflare Pages 배포 구조를 유지한다.
3. 콘텐츠의 최종 소스 오브 트루스는 Git 기반으로 보존한다.
4. 향후 설정, 통계, SEO, 미디어 관리까지 확장 가능한 운영 툴을 만든다.

---

## 2. Current Constraints

현재 구조에서 고려해야 할 전제는 아래와 같다.

- 공개 블로그는 Astro SSG 기반이다.
- 배포는 Cloudflare Pages다.
- 글은 별도 Private 저장소 `S_Reborn_and_AI`에서 GitHub Actions로 자동 동기화된다.
- 공개 페이지는 `src/content/blog/`의 Markdown/MDX를 기준으로 빌드된다.
- `draft: true`는 빌드에서 자동 제외된다.
- 이미 `@supabase/supabase-js`가 설치되어 있고, 일부 조회성 기능에 Supabase가 사용되고 있다.

이 전제를 기준으로 보면, 관리자 페이지는 단순한 정적 HTML이 아니라 다음 2가지를 동시에 만족해야 한다.

- 인증된 사용자만 접근할 수 있어야 한다.
- 민감한 작업은 브라우저가 아닌 서버 측 비밀키로 실행되어야 한다.

---

## 3. Recommended Architecture

권장 아키텍처는 아래와 같다.

### 3.1 Public Site

- 역할: 공개 블로그 렌더링
- 기술: Astro SSG
- 배포: Cloudflare Pages
- 특성: 빠르고 단순하며 SEO에 최적화

### 3.2 Admin UI

- 경로: `/admin`
- 역할: 글 작성, 수정, 미리보기, 발행, 설정 관리
- 구현: Astro 페이지 + 클라이언트 사이드 앱
- 권장 UI 방식: 관리자 영역만 인터랙티브 컴포넌트 기반으로 구성

권장 이유:

- 공개 블로그 전체를 SPA로 바꿀 필요가 없다.
- 관리자 화면만 복잡한 상태 관리가 필요하다.
- 공개 사이트 성능과 운영 도구 복잡도를 분리할 수 있다.

### 3.3 Auth / Data Layer

- 인증: Supabase Auth
- 권한: Supabase `profiles`, `admin_roles` 테이블 + RLS
- 운영 데이터: Supabase Postgres
- 파일 업로드: Supabase Storage 또는 Cloudflare R2

### 3.4 Secure Server Layer

- 역할: 발행, GitHub 연동, 비밀키 사용, 감사 로그 기록
- 구현: Cloudflare Pages Functions
- 비밀값 저장: Cloudflare Pages environment secrets

### 3.5 Publish Pipeline

- 편집 중 데이터 저장 위치: Supabase
- 발행 결과 저장 위치: Private GitHub repo
- 공개 반영 방식: GitHub Actions 또는 repository_dispatch/workflow_dispatch

즉, 관리자 페이지는 DB 기반으로 편집하되, 공개 콘텐츠의 최종 산출물은 Git에 남기는 구조가 가장 안전하다.

---

## 4. Core Design Principle

이 프로젝트에서 가장 중요한 원칙은 아래 한 줄이다.

**"운영은 DB에서, 공개 배포는 Git에서."**

이 원칙을 쓰는 이유:

- 실시간 편집 UX는 DB가 훨씬 좋다.
- 공개 콘텐츠의 이력 추적과 복구는 Git이 훨씬 좋다.
- Git 기반 콘텐츠 구조를 유지하면 현재 Astro 콘텐츠 컬렉션 흐름을 거의 그대로 활용할 수 있다.
- 향후 장애가 나도 DB와 Git 중 한쪽에서 복원 전략을 잡기 쉽다.

---

## 5. Content Lifecycle

권장 글 상태 모델:

- `draft`: 작성 중
- `review`: 발행 전 검토
- `scheduled`: 예약 발행
- `published`: 발행 완료
- `archived`: 비노출 보관

콘텐츠 흐름:

1. 관리자가 `/admin/posts/new`에서 글 작성
2. 본문/메타데이터는 Supabase에 저장
3. 미리보기는 관리자 전용 preview route에서 렌더링
4. 발행 버튼 클릭 시 Pages Function 호출
5. Function이 Markdown/MDX 파일을 생성하거나 업데이트
6. Private repo에 커밋 또는 PR 생성
7. 기존 GitHub Actions 동기화 파이프라인 실행
8. Astro 빌드 후 Cloudflare Pages 반영

---

## 6. Admin Information Architecture

관리자 페이지는 아래 메뉴 구조를 권장한다.

### 6.1 Dashboard

- 최근 발행 글
- 임시저장 글
- 예약 발행 글
- 최근 실패한 배포/동기화 작업
- 기본 KPI
  - 총 글 수
  - 최근 30일 발행 수
  - 조회수 상위 글
  - 검색 유입 키워드

### 6.2 Posts

- 글 목록
- 상태 필터
- 카테고리 필터
- 태그 검색
- 새 글 작성
- 대량 상태 변경

### 6.3 Editor

- 제목
- 설명
- slug
- 카테고리 / 서브카테고리
- 태그
- 썸네일
- 공개일
- `draft` / `scheduled` / `published`
- 본문 Markdown/MDX 편집
- 실시간 미리보기
- SEO 미리보기

### 6.4 Media

- 썸네일 업로드
- 본문 이미지 업로드
- 사용 중/미사용 파일 구분
- alt 텍스트 관리

### 6.5 Settings

- 사이트 기본 메타
- 소개/About 정보
- 홈 featured 고정 규칙
- 소셜 링크
- 검색 설정
- 댓글 설정

### 6.6 Jobs / Logs

- 발행 기록
- 실패 기록
- GitHub sync 상태
- 누가 어떤 글을 수정했는지 감사 로그

---

## 7. Data Model Proposal

최소한 아래 테이블 구성이 필요하다.

### 7.1 `admin_profiles`

- `id`
- `email`
- `display_name`
- `role`
- `created_at`
- `last_login_at`

### 7.2 `posts`

- `id`
- `title`
- `description`
- `slug`
- `category`
- `subcategory`
- `tags`
- `thumbnail_url`
- `body_markdown`
- `status`
- `published_at`
- `scheduled_at`
- `seo_title`
- `seo_description`
- `canonical_url`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

### 7.3 `post_revisions`

- `id`
- `post_id`
- `body_markdown`
- `meta_snapshot`
- `created_by`
- `created_at`

### 7.4 `media_assets`

- `id`
- `file_name`
- `url`
- `mime_type`
- `size`
- `alt_text`
- `uploaded_by`
- `created_at`

### 7.5 `publish_jobs`

- `id`
- `post_id`
- `job_type`
- `status`
- `target_repo`
- `commit_sha`
- `error_message`
- `requested_by`
- `created_at`
- `completed_at`

### 7.6 `site_settings`

- `id`
- `key`
- `value_json`
- `updated_by`
- `updated_at`

### 7.7 `audit_logs`

- `id`
- `actor_id`
- `action`
- `resource_type`
- `resource_id`
- `before_json`
- `after_json`
- `created_at`

---

## 8. Recommended Auth and Authorization

### 8.1 Authentication

- Supabase Magic Link 또는 Google OAuth
- 운영 초기에는 1인 관리자 구조로 시작 가능
- 추후 다중 편집자를 대비해 role 기반으로 설계

### 8.2 Authorization

- RLS 기본 차단
- `admin_profiles.role in ('owner', 'editor')`만 글 수정 허용
- 발행/삭제/설정 변경은 `owner` 우선

### 8.3 Security Rules

- GitHub token은 절대 브라우저로 보내지 않는다.
- 발행 API는 Pages Function에서만 처리한다.
- 민감한 작업은 전부 서버 로그와 감사 로그를 남긴다.
- 이미지 업로드도 signed upload 또는 서버 중계 방식으로 제한한다.

---

## 9. Publishing Strategy

가장 중요한 설계 포인트다.

### 9.1 Why not publish directly from the browser?

브라우저에서 직접 GitHub API를 호출하면 아래 문제가 생긴다.

- 토큰 노출 위험
- 권한 통제 어려움
- 실수 시 복구 어려움
- 감사 로그 일관성 부족

### 9.2 Recommended Publish Flow

1. 관리자 UI가 Pages Function에 발행 요청
2. Function이 DB에서 최신 글 조회
3. Markdown frontmatter + body 조합
4. 규칙에 맞는 경로 생성
5. Private repo에 커밋 또는 PR 생성
6. 결과를 `publish_jobs`에 기록

### 9.3 Publish Modes

권장 모드 2개:

- `quick publish`
  - 바로 private repo에 커밋
  - 1인 운영 시 빠름

- `review publish`
  - private repo에 PR 생성
  - 검토 후 머지
  - 다인 편집 체계에서 안전

초기에는 `quick publish`로 시작하고, 이후 `review publish`를 추가하는 방식이 현실적이다.

---

## 10. Editor UX Recommendation

### 10.1 Editing Model

초기에는 Markdown-first 에디터가 가장 적합하다.

권장 구성:

- 왼쪽: Markdown/MDX 에디터
- 오른쪽: 실시간 preview
- 상단: 제목, 설명, slug, 카테고리, 태그
- 우측 패널: SEO, 발행 설정, 썸네일, 상태

### 10.2 Why Markdown-first?

- 현재 Astro content collection과 맞다.
- Git export가 간단하다.
- 추후 AI 글 보정, 요약, 메타 생성에도 유리하다.
- WYSIWYG보다 디버깅이 쉽다.

### 10.3 Nice-to-have

- autosave
- word count / reading time
- slug 자동 생성
- frontmatter form ↔ markdown export
- broken image / missing description validation

---

## 11. Admin UI Design Direction

관리자 페이지 디자인은 공개 블로그와 같은 브랜드를 쓰되, 운영 도구답게 더 밀도 있고 명확해야 한다.

### 11.1 Tone

- 공개 블로그보다 장식성은 줄이고 구조성을 높인다.
- `--pink: #B8956A` 축은 유지한다.
- 배경은 `--bg`, `--bg2` 기반으로 차분하게 쓴다.
- 상태색만 별도로 둔다.

### 11.2 Layout

- 좌측 고정 사이드바
- 상단 액션 바
- 본문은 `list`, `editor`, `settings`에 따라 다른 폭 허용
- 에디터는 2단 레이아웃

### 11.3 Component Set

- data table
- status badge
- split editor pane
- sticky action footer
- destructive confirm modal
- activity timeline

### 11.4 Status Colors

- draft: muted gray
- review: amber
- scheduled: blue
- published: green
- failed: red

---

## 12. Suggested Route Structure

```text
src/pages/admin/index.astro
src/pages/admin/posts/index.astro
src/pages/admin/posts/new.astro
src/pages/admin/posts/[id].astro
src/pages/admin/media/index.astro
src/pages/admin/settings/index.astro
src/pages/admin/jobs/index.astro
src/pages/api/admin/preview.ts
functions/api/admin/publish.ts
functions/api/admin/upload.ts
functions/api/admin/jobs.ts
```

권장 사항:

- 공개 페이지와 관리자 페이지 스타일 파일을 분리한다.
- 예: `src/styles/admin.css`
- 관리자 공통 레이아웃도 분리한다.
- 예: `src/layouts/AdminLayout.astro`

---

## 13. Suggested Project Modules

```text
src/components/admin/
src/layouts/AdminLayout.astro
src/lib/admin/auth.ts
src/lib/admin/posts.ts
src/lib/admin/publish.ts
src/lib/admin/settings.ts
src/lib/github.ts
src/lib/markdown.ts
src/lib/validators.ts
src/styles/admin.css
```

기능 분리 원칙:

- UI 레이어는 폼과 상태 제어만 담당
- 비즈니스 로직은 `src/lib/admin/*`로 분리
- GitHub/Storage/Supabase 연동은 얇은 adapter 계층으로 분리

---

## 14. Phased Delivery Plan

### Phase 1. Foundation

- 관리자 인증
- 관리자 레이아웃
- 글 목록 페이지
- 새 글 작성 폼
- 임시 저장

완료 기준:

- 로그인한 관리자만 `/admin` 접근 가능
- 새 글 작성 후 draft 저장 가능

### Phase 2. Editor + Preview

- Markdown 에디터
- 실시간 preview
- slug/category/tag 관리
- 썸네일 지정

완료 기준:

- 현재 블로그 글 구조를 관리자 UI에서 재현 가능

### Phase 3. Publish Pipeline

- Pages Function 발행 API
- private repo 커밋
- publish job 기록
- 실패 복구 흐름

완료 기준:

- 관리자 화면에서 발행 후 실제 배포까지 연결

### Phase 4. Settings + Media

- About/홈/SEO 설정
- 미디어 업로드
- 자산 관리

완료 기준:

- 반복 수정이 필요한 텍스트/이미지를 관리자에서 제어 가능

### Phase 5. Operational Hardening

- revision history
- audit log
- scheduled publish
- multi-admin role
- observability

---

## 15. Risks and Mitigations

### Risk 1. Git source and DB source diverge

대응:

- 발행 성공 시점의 Git SHA를 `publish_jobs`에 기록
- 글 상세 화면에 "DB 버전 / Git 발행 버전" 표시
- 재동기화 버튼 제공

### Risk 2. Markdown export rule inconsistency

대응:

- export formatter를 단일 함수로 고정
- slug/path/frontmatter 규칙을 중앙화

### Risk 3. Admin feature grows too large

대응:

- 초기에는 posts 중심으로만 구현
- settings/media는 2차 단계로 분리

### Risk 4. Static site assumptions break

대응:

- 공개 블로그는 계속 정적 렌더링 유지
- 동적 기능은 admin/functions 경로로만 한정

---

## 16. Deferred UI Reminders

아래 4개는 별도 후속 작업으로 계속 추적한다.

1. Topbar 검색 UX 개선
2. About 페이지 색상 시스템 통합
3. BlogPost 보호 스크립트 제거 + 공유 영역 정리
4. 인라인 스타일을 `design.css` / `global.css`로 재정리

관리자 페이지 구현 전에 전부 끝낼 필요는 없지만, `About` 통합과 스타일 정리는 관리자 UI 토큰 설계 전에 처리하는 편이 좋다.

---

## 17. Final Recommendation

현 프로젝트에 가장 맞는 해법은 아래 조합이다.

- 공개 블로그: Astro SSG 유지
- 관리자 인증/저장: Supabase
- 발행/비밀 작업: Cloudflare Pages Functions
- 최종 공개 콘텐츠 저장소: Private GitHub repo

이 구조는 현재 운영 방식과 가장 충돌이 적고, 나중에 기능이 커져도 폐기 비용이 낮다.

구현 시작 우선순위는 아래 순서를 권장한다.

1. `/admin` 인증 + 레이아웃
2. 글 목록 + draft 저장
3. Markdown 에디터 + preview
4. GitHub publish pipeline
5. settings / media / logs
