# S-Reborn Blog

AI 기술 블로그. Astro + Supabase + Cloudflare Pages 기반.

## 로컬 실행

**요구사항:** Node.js >= 22.12.0

```sh
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# .env 파일에 Supabase 키 입력 (아래 환경변수 섹션 참고)

# 3. 개발 서버 실행
npm run dev
# → http://localhost:4321
```

## 환경변수

`.env.example`을 복사해 `.env`를 만들고 아래 값을 입력합니다.

### 클라이언트 공개 변수 (`.env`)

| 변수 | 설명 | 필수 |
|------|------|------|
| `PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 필수 |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key | 필수 |

Supabase 키는 Supabase 대시보드 → Project Settings → API에서 확인할 수 있습니다.

### 서버 사이드 비밀 변수

아래 변수들은 **절대 `.env`나 코드에 넣지 말고** 두 곳에만 설정합니다:

- **운영 배포**: Cloudflare Pages 대시보드 → Settings → Environment variables
- **로컬 개발** (`wrangler pages dev`): `.dev.vars` 파일 (`.gitignore` 등록됨, `cp .dev.vars.example .dev.vars`는 현재 미구현 — 직접 생성)

| 변수 | 설명 | 필수 |
|------|------|------|
| `SUPABASE_URL` | Supabase 프로젝트 URL (서버용) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role 키 — 절대 공개 금지 | ✅ |
| `GITHUB_TOKEN` | GitHub Personal Access Token | ✅ |
| `GITHUB_REPO` | 대상 저장소 (`owner/repo` 형식) | ✅ |
| `GITHUB_BRANCH` | 대상 브랜치 (기본값: `main`) | — |

#### GitHub Token 발급

1. https://github.com/settings/tokens → **Fine-grained tokens** 권장
2. Repository access: 배포 대상 저장소만 선택
3. Permissions: **Contents → Read & Write**, **Metadata → Read**
4. 생성 토큰을 `GITHUB_TOKEN`에 저장

### 퍼블리시 파이프라인 동작 확인

어드민 → `/admin/pipeline` → "검증 실행" 버튼 클릭.
아래 4개 항목이 모두 `ok`이면 Publish 버튼이 정상 동작합니다:

| 항목 | 확인 내용 |
|------|---------|
| Required Env | 4개 필수 환경 변수 존재 여부 |
| Supabase Service Role | `posts` 테이블 조회 가능 여부 |
| GitHub Repo Access | 토큰으로 저장소 접근 가능 여부 |
| GitHub Branch Access | 대상 브랜치 존재 여부 |

## Supabase 테이블 초기화

`supabase/article_requests.sql` 파일을 Supabase 대시보드 SQL Editor에서 실행합니다.

이 작업을 하지 않으면 "에디터에게 요청하기" 버튼이 동작하지 않습니다.

## 주요 명령어

| Command | Action |
|---------|--------|
| `npm run dev` | 개발 서버 실행 (localhost:4321) |
| `npm run build` | 프로덕션 빌드 (`./dist/`) |
| `npm run preview` | 빌드 결과 로컬 미리보기 |

## 배포

`main` 브랜치에 push하면 Cloudflare Pages에 자동 배포됩니다.

## 주요 파일

| 파일 | 역할 |
|------|------|
| `src/layouts/Layout.astro` | 검색 로직, 요청 버튼 핸들러 |
| `src/components/Topbar.astro` | 검색 UI, 요청 버튼 HTML |
| `src/pages/blog/index.astro` | 블로그 목록, 시맨틱 검색 필터 |
| `src/pages/admin/index.astro` | 독자 요청 관리 섹션 |
| `src/consts.ts` | 사이트 상수 (CONTACT_EMAIL 등) |
| `supabase/article_requests.sql` | 요청 테이블 스키마 (최초 1회 실행 필요) |
