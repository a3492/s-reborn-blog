# Codex 인수인계 문서
**작성일:** 2026-03-21
**작성자:** Claude Code (claude-sonnet-4-6)
**인수받는 AI:** Codex

---

## 1. 이 프로젝트가 뭔지

개인 블로그. Obsidian(로컬 노트앱)에서 쓴 글을 → GitHub Actions로 자동 동기화 → Cloudflare Pages로 배포.

**접속 URL:** https://s-reborn-blog.pages.dev
**로컬 개발:** `npm run dev` → http://localhost:4321
**GitHub 레포:** https://github.com/a3492/s-reborn-blog

---

## 2. 기술 스택

```
Astro 6.0.4          - 정적 사이트 프레임워크 (React 없음, 순수 Astro)
TypeScript           - 타입 안전성
MDX                  - Markdown + JSX 지원
Cloudflare Pages     - 호스팅 (main 브랜치 push시 자동 배포)
Supabase             - DB 클라이언트 (설정만 됨, 아직 실제 사용 안함)
Fuse.js              - 클라이언트사이드 검색
sharp                - 이미지 최적화
Giscus               - GitHub Discussions 기반 댓글
```

**Tailwind 없음. CSS는 전부 커스텀.**

---

## 3. 로컬에서 시작하는 법

```bash
cd /c/dev/s-reborn-blog
npm run dev        # localhost:4321
npm run build      # 빌드 테스트
npm run preview    # 빌드 결과물 미리보기
```

**Node 버전 요구:** ≥22.12.0

---

## 4. GitHub 구조 (중요 - Codex가 모를 수 있음)

### 4-1. 레포지토리가 2개

| 레포 | URL | 용도 |
|------|-----|------|
| `a3492/s-reborn-blog` | public | 블로그 코드 (이 폴더) |
| `a3492/S_Reborn_and_AI` | private | Obsidian 볼트 (글 원본) |

### 4-2. 자동 배포 파이프라인

```
Obsidian에서 글 수정 → git push (S_Reborn_and_AI)
  └→ trigger-blog-sync.yml 실행
      └→ s-reborn-blog에 repository_dispatch 이벤트 전송
          └→ sync-blog.yml 실행 (rsync로 글 복사)
              └→ main 브랜치에 자동 commit+push
                  └→ Cloudflare Pages 자동 빌드/배포
```

### 4-3. GitHub Actions 시크릿

**`a3492/S_Reborn_and_AI` 레포 → Settings → Secrets:**
- `BLOG_SYNC_TOKEN`: Classic PAT (repo + workflow 스코프)

**`a3492/s-reborn-blog` 레포 → Settings → Secrets:**
- `BLOG_SYNC_TOKEN`: 동일한 Classic PAT

> **주의:** Fine-grained token 아님, Classic PAT 써야 함. repository_dispatch 권한은 `repo` 스코프 필요.

### 4-4. GitHub 계정 정보

- **GitHub 계정:** a3492
- **Cloudflare 이메일:** A01034920591@gmail.com

---

## 5. 프로젝트 파일 구조

```
s-reborn-blog/
├── src/
│   ├── components/
│   │   ├── Topbar.astro          ← 상단 네비게이션 + 검색바
│   │   ├── BaseHead.astro        ← SEO, OG 태그, CSS import
│   │   ├── Footer.astro          ← 푸터
│   │   ├── FormattedDate.astro   ← 날짜 포맷
│   │   ├── GiscusComments.astro  ← 댓글 (GitHub Discussions)
│   │   └── PostStats.astro       ← 조회수/좋아요 (Supabase, 미완성)
│   ├── layouts/
│   │   ├── Layout.astro          ← 전체 레이아웃 + 검색 JS 로직
│   │   └── BlogPost.astro        ← 블로그 글 레이아웃
│   ├── pages/
│   │   ├── index.astro           ← 홈 (featured + grid)
│   │   ├── blog/index.astro      ← 블로그 목록
│   │   ├── blog/[...slug].astro  ← 개별 글 라우팅
│   │   ├── about.astro           ← 소개/CV 페이지
│   │   └── rss.xml.js            ← RSS 피드
│   ├── styles/
│   │   ├── global.css            ← 기본 타이포그래피, 리셋 (Bear Blog 포크)
│   │   └── design.css            ← 모든 레이아웃/컴포넌트 스타일 (핵심)
│   ├── content/
│   │   └── blog/                 ← 자동 동기화되는 블로그 글 (.md/.mdx)
│   ├── lib/
│   │   └── supabase.ts           ← Supabase 클라이언트
│   └── consts.ts                 ← 카테고리 정의, 사이트 제목
├── .github/workflows/
│   └── sync-blog.yml             ← 블로그 글 자동 동기화 워크플로우
├── astro.config.mjs              ← Astro 설정
├── src/content.config.ts         ← 블로그 frontmatter 스키마
└── public/
    ├── fonts/                    ← Atkinson, Pretendard 폰트
    └── profile.jpg
```

---

## 6. 디자인 시스템 (CSS 변수)

**파일:** `src/styles/design.css`

```css
:root {
  --pink: #B8956A;              /* 메인 액센트 색 (웜 브라운) */
  --pink-lo: rgba(184,149,106,0.12);  /* 액센트 배경용 */
  --bg:  #FAF8F5;               /* 기본 배경 */
  --bg2: #F0EDE8;               /* 약간 어두운 배경 */
  --bg3: #E8E4DE;               /* 호버 배경 */
  --rule:  rgba(28,25,23,0.12); /* 구분선 */
  --rule2: rgba(28,25,23,0.08); /* 연한 구분선 */
  --text: #1C1917;              /* 기본 텍스트 */
  --t2:   #4B4540;              /* 보조 텍스트 */
  --t3:   #6B7280;              /* 약한 텍스트 */
  --sw:   230px;                /* 사이드바 너비 (현재 미사용) */
  --display: 'Paperlogy', 'Pretendard', sans-serif;  /* 제목 폰트 */
  --body:    'Pretendard', 'Apple SD Gothic Neo', sans-serif;  /* 본문 폰트 */
}
```

**다크모드:** global.css에서 `@media (prefers-color-scheme: dark)` 처리.

**반응형 브레이크포인트:**
- `≤1000px`: 그리드 4→3열
- `≤800px`: featured-wrap 1열
- `≤768px`: 태블릿
- `≤680px`: 그리드 2열
- `≤480px`: 모바일 (1열)

---

## 7. 블로그 글 frontmatter 스키마

글은 `src/content/blog/카테고리/파일명.md` 형식.

```yaml
---
title: 글 제목
description: 요약 (검색·OG에 사용)
date: 2026-03-21
category: ai          # consts.ts CATEGORIES의 id 값
subcategory: 자유문자열  # 선택사항
tags: [tag1, tag2]    # 선택사항
thumbnail: ./image.jpg # 선택사항
draft: false          # true면 빌드에서 제외
---
```

**카테고리 목록** (`src/consts.ts`):
| id | label | icon |
|----|-------|------|
| `ai` | AI | 🤖 |
| `medicine` | 의학 | 🏥 |
| `학습` | 학습 | 📚 |
| `dev` | 개발 | 💻 |
| `연결·패턴` | 연결·패턴 | ✍️ |

---

## 8. 홈 페이지 레이아웃 구조

```
Topbar (고정, 56px)
│
├── featured-wrap
│   ├── featured-main (가장 최신 글 1개, 왼쪽 큰 섹션)
│   └── featured-side (2~3번째 최신 글, 오른쪽 좁은 섹션)
│
├── sec-rule ("최근 글" 라벨 + "전체 보기 →")
│
└── grid-wrap
    └── post-grid (4열 그리드, 4번째 이후 글들)

Footer
```

---

## 9. 검색 기능

**방식:** Fuse.js 클라이언트 사이드 검색
**위치:** `src/layouts/Layout.astro` - 하단 `<script>` 블록

검색창 (`#search-input`)에 입력 → Fuse.js로 전체 글 검색 → `#search-dropdown` 표시.
결과 없으면 "AI로 이 주제의 글 생성하기" 버튼 표시 (`#ai-generate-btn`, 현재 동작 없음).

---

## 10. 현재 상태 (2026-03-21 기준)

### 완료된 것

| 기능 | 파일 | 상태 |
|------|------|------|
| 홈 레이아웃 (featured + grid) | `index.astro`, `design.css` | ✅ |
| 탑바 + 검색 | `Topbar.astro`, `Layout.astro` | ✅ |
| 블로그 목록/상세 | `blog/index.astro`, `[...slug].astro` | ✅ |
| 다크모드 | `global.css` | ✅ |
| 모바일 반응형 | `design.css` | ✅ |
| Giscus 댓글 | `GiscusComments.astro` | ✅ |
| SEO (Sitemap, RSS, OG) | `astro.config.mjs`, `BaseHead.astro` | ✅ |
| 블로그 자동 동기화 파이프라인 | `.github/workflows/sync-blog.yml` | ✅ |
| 소셜 공유 (Twitter, LinkedIn) | `BlogPost.astro` | ✅ |

### 미완성 / TODO

| 기능 | 상태 | 비고 |
|------|------|------|
| Supabase 조회수/좋아요 | 코드만 있음 | `PostStats.astro` - DB 테이블 없음 |
| Kakao 공유 | 코드만 있음 | SDK 로드 코드 미추가 |
| AI 글 생성 버튼 | UI만 있음 | `#ai-generate-btn` 클릭 이벤트 없음 |
| 커스텀 도메인 | 미정 | Cloudflare Pages에서 연결 필요 |
| About 페이지 | 기본 구조만 | 내용 보강 필요 |

---

## 11. Supabase 설정 (미완성 작업)

**설정 파일:** `src/lib/supabase.ts`
**컴포넌트:** `src/components/PostStats.astro`

Supabase에 다음 테이블/RPC 생성 필요:
```sql
-- 조회수
create table post_views (slug text primary key, count int default 0);
create function increment_view(p_slug text) ...

-- 좋아요
create table post_likes (slug text primary key, count int default 0);
create function increment_like(p_slug text) ...
create function decrement_like(p_slug text) ...
```

환경변수 필요:
```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 12. 배포 방법

**자동:** main 브랜치에 push하면 Cloudflare Pages가 자동 빌드/배포.

**수동으로 배포 트리거:**
```bash
git add -p              # 변경 내용 스테이징
git commit -m "fix: ..."
git push origin main    # push하면 자동 배포 시작
```

**배포 상태 확인:** https://dash.cloudflare.com/ → Pages → s-reborn-blog

---

## 13. 트러블슈팅

### 빌드 에러
```bash
npm run build  # 로컬에서 먼저 테스트
```

### 검색이 안 되면
`Layout.astro` 하단 script 블록에서 Fuse.js 초기화 확인.

### 블로그 글이 안 나오면
- `draft: false` 확인
- `date` 필드 형식 확인 (ISO 8601: `2026-03-21`)
- `src/content/blog/` 경로 확인

### Cloudflare 배포 실패
- Node 버전 22 이상 필요 (Cloudflare Pages 설정에서 확인)
- `npm run build` 로컬 성공 확인

---

## 14. 핵심 파일 요약 (수정 빈도 높은 것)

| 파일 | 언제 수정 |
|------|---------|
| `src/styles/design.css` | UI/레이아웃/색상 변경 |
| `src/styles/global.css` | 기본 타이포그래피, 다크모드 |
| `src/components/Topbar.astro` | 상단 바 변경 |
| `src/layouts/Layout.astro` | 전체 구조, 검색 JS |
| `src/layouts/BlogPost.astro` | 글 페이지 레이아웃 |
| `src/pages/index.astro` | 홈 페이지 내용 |
| `src/consts.ts` | 카테고리 추가/변경 |
| `src/content.config.ts` | frontmatter 스키마 변경 |

---

## 15. git worktrees (참고)

`.claude/worktrees/` 폴더 안에 Claude Code가 만든 git worktrees가 있음.
이것은 Claude Code의 병렬 작업용 임시 공간. 건드리지 말 것.

현재 작업 중인 브랜치: `claude/frosty-pasteur`
메인 브랜치: `main`

---

*이 문서는 Claude Code가 코드베이스를 직접 분석해서 작성했습니다.*
