# 블로그 자동화 파이프라인 인수인계장

**작성일:** 2026-03-16
**상태:** 파이프라인 권한 문제 해결 중

---

## 📋 프로젝트 개요

옵시디언 → GitHub → 웹사이트 자동 배포 파이프라인 구축 프로젝트

### 주요 컴포넌트
- **S_Reborn_and_AI** (Private): Obsidian Vault 저장소
- **s-reborn-blog** (Public): Astro 웹사이트 코드
- **배포:** Cloudflare Pages (`https://s-reborn-blog.pages.dev`)

---

## ✅ 완료된 작업

### 1. s-reborn-blog 워크플로우 개선
**파일:** `.github/workflows/sync-blog.yml`
```yaml
- ✅ permissions: contents: write 추가
- ✅ mkdir -p src/content/blog 추가 (디렉토리 안전성)
```

### 2. Astro 설정 수정
**파일:** `astro.config.mjs`
```javascript
site: 'https://s-reborn-blog.pages.dev'  // example.com → 실제 도메인 변경
```
→ Sitemap, Canonical URL, RSS 피드, OG 태그 정상화

### 3. 블로그 컨텐츠 디렉토리 생성
**파일:** `src/content/blog/.gitkeep`
→ git에서 빈 디렉토리 추적 가능하게 초기화

### 4. 파이프라인 테스트 시작
**파일:** `_BLOG/ai/test-pipeline.md` (S_Reborn_and_AI에서 수정)
- ✅ S_Reborn_and_AI에서 `trigger-blog-sync.yml` 워크플로우 실행됨
- ❌ s-reborn-blog의 `sync-blog.yml` 실행 실패 (권한 문제)

---

## 🚨 현재 문제

### 문제: `repository_dispatch` 트리거 실패

**상황:**
- S_Reborn_and_AI의 `trigger-blog-sync.yml` ✅ 실행됨
- s-reborn-blog의 `sync-blog.yml` ❌ 실행 안 됨 (0 workflow runs)

**원인:**
BLOG_SYNC_TOKEN이 `repository_dispatch`를 다른 레포에서 보낼 권한이 없음

| 필요 권한 | 현재 상태 |
|---------|---------|
| `repo` (Classic PAT) | ❌ 불명확 |
| `workflow` | ✅ 추가됨 (하지만 불필요) |

### trigger-blog-sync.yml 분석
**위치:** `S_Reborn_and_AI/.github/workflows/trigger-blog-sync.yml`
```yaml
on:
  push:
    paths:
      - '_BLOG/**'

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger s-reborn-blog sync
        run: |
          curl -X POST \
            -H "Authorization: token ${{ secrets.BLOG_SYNC_TOKEN }}" \
            -H "Accept: application/vnd.github.v3+json" \
            https://api.github.com/repos/a3492/s-reborn-blog/dispatches \
            -d '{"event_type":"sync-blog"}'
```

**문제:** BLOG_SYNC_TOKEN에 `repo` 스코프가 필요한데 불명확함

---

## 🔧 즉시 해결 필요 (우선순위 1)

### Step 1: 새 Personal Access Token 발급

👉 https://github.com/settings/tokens/new

**설정:**
- **Token name:** `blog-sync-token`
- **Expiration:** 90 days (또는 1 year)
- **Scopes:** 반드시 체크할 것:
  - ✅ `repo` (Full control of private repositories)
  - ✅ `workflow` (Update GitHub Actions workflows)

**주의:** Fine-grained token 사용하지 말 것! Classic PAT만 사용.

생성 후 **토큰 값 복사** (다시 볼 수 없음)

### Step 2: 두 레포 시크릿 업데이트

**레포 1: s-reborn-blog**
- URL: `https://github.com/a3492/s-reborn-blog/settings/secrets/actions`
- 시크릿: `BLOG_SYNC_TOKEN`
- 작업: **Update** → 새 토큰값 붙여넣기

**레포 2: S_Reborn_and_AI**
- URL: `https://github.com/a3492/S_Reborn_and_AI/settings/secrets/actions`
- 시크릿: `BLOG_SYNC_TOKEN`
- 작업: **Update** → 동일한 새 토큰값 붙여넣기

---

## 🧪 파이프라인 재테스트 (Step 1,2 완료 후)

### 테스트 방법

```bash
# S_Reborn_and_AI를 로컬에서 클론했다면
cd /c/dev/S_Reborn_and_AI

# test-pipeline.md 파일을 아무거나 수정 후 저장
# 예: 마지막 테스트 시간 업데이트

git add _BLOG/ai/test-pipeline.md
git commit -m "test: 파이프라인 재테스트 (BLOG_SYNC_TOKEN 권한 수정 후)"
git push origin main
```

### 검증 체크리스트

- [ ] S_Reborn_and_AI Actions 확인: `https://github.com/a3492/S_Reborn_and_AI/actions`
  - `Trigger Blog Sync` 워크플로우 ✅ 초록색 실행

- [ ] s-reborn-blog Actions 확인: `https://github.com/a3492/s-reborn-blog/actions`
  - `Sync Blog Posts` 워크플로우 ✅ 초록색 실행
  - 로그에서 "rsync -av --delete" 성공 메시지 확인

- [ ] 웹사이트 확인: `https://s-reborn-blog.pages.dev/blog/ai/test-pipeline`
  - 블로그 글이 보이면 ✅ 성공!

---

## 📦 구현 완료 항목

| 기능 | 파일 | 상태 |
|------|------|------|
| 파이프라인 구조 | `.github/workflows/sync-blog.yml` | ✅ |
| Giscus 댓글 | `src/components/GiscusComments.astro` | ✅ |
| 조회수/좋아요 (Supabase) | `src/components/PostStats.astro` | ✅ 코드만 |
| 소셜 공유 (Twitter, LinkedIn, Kakao) | `src/layouts/BlogPost.astro` | ✅ |
| 우클릭 방지 | `src/layouts/BlogPost.astro` | ✅ |
| SEO (Sitemap, RSS, OG) | `astro.config.mjs`, `BaseHead.astro` | ✅ |
| Content Schema | `src/content.config.ts` | ✅ |

---

## ⏳ 다음 단계 (파이프라인 이후)

파이프라인이 정상 작동하면 순서대로:

1. **Supabase 테이블 생성**
   - `post_views` 테이블 + `increment_view()` RPC
   - `post_likes` 테이블 + `increment_like()`, `decrement_like()` RPC

2. **Kakao Share SDK 설치**
   - `src/layouts/BlogPost.astro` 헤드에 SDK 로드

3. **Cloudflare Custom Domain 연결**
   - 도메인 결정 필요 (아직 미정)
   - CNAME 설정 후 `astro.config.mjs` site URL 변경

---

## 📁 핵심 경로

```
/c/dev/s-reborn-blog/              # 메인 작업 폴더
├── .github/workflows/
│   └── sync-blog.yml              # 수정됨 (permissions 추가)
├── astro.config.mjs               # 수정됨 (site URL)
├── src/
│   ├── content.config.ts          # Blog content schema
│   ├── consts.ts                  # SITE_TITLE, CATEGORIES
│   ├── components/
│   │   ├── GiscusComments.astro
│   │   ├── PostStats.astro
│   │   └── BaseHead.astro
│   ├── layouts/
│   │   └── BlogPost.astro         # 소셜 공유, 우클릭 방지
│   └── content/
│       └── blog/                  # 동기화되는 블로그 글들
└── HANDOVER.md                    # 이 파일
```

---

## 🔐 시크릿 관리

**다음 두 레포의 BLOG_SYNC_TOKEN 필수:**
- `a3492/S_Reborn_and_AI` → secrets/BLOG_SYNC_TOKEN
- `a3492/s-reborn-blog` → secrets/BLOG_SYNC_TOKEN

**토큰 스코프 (최소 권한):**
```
✅ repo
✅ workflow
```

---

## 💡 주의사항

1. **Fine-grained PAT 사용금지**: Classic PAT만 사용
2. **토큰 노출금지**: .env, commit에 절대 포함 금지
3. **Obsidian Git 설정**: obsidian-git이 자동 push 활성화되어야 파이프라인 작동
4. **Draft 글 제외**: `src/content.config.ts`에서 `draft: false` 글만 배포

---

## 🆘 트러블슈팅

### 문제: s-reborn-blog Actions가 안 실행됨

**원인:** BLOG_SYNC_TOKEN 권한 부족

**해결:**
```
1. 새 Classic PAT 발급 (repo + workflow 스코프)
2. 두 레포 시크릿 업데이트
3. S_Reborn_and_AI 파일 수정 후 push
```

### 문제: Cloudflare Pages 배포 실패

**확인할 것:**
- Build logs: `https://dash.cloudflare.com/` → Pages → s-reborn-blog
- `npm run build` 로컬 테스트
- Node 버전 호환성

---

## 📞 참고 정보

- **GitHub 계정:** a3492
- **Cloudflare 이메일:** A01034920591@gmail.com
- **작업 스택:** Astro, Markdown, GitHub Actions, Cloudflare Pages
- **마지막 커밋:** `410ef30` (fix: 사이트 URL 및 sync 워크플로우 보완)

---

**다음 세션에서 시작할 때:**
1. BLOG_SYNC_TOKEN 새로 발급 및 업데이트
2. 파이프라인 재테스트
3. 성공 시 Supabase 설정 진행
