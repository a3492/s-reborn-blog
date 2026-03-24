# Codex 인수인계 문서
**작성일:** 2026-03-21
**작성자:** Claude Sonnet (claude-code)
**목적:** localhost:4321 블로그 UI 수정 작업을 Codex가 이어받기 위한 인수인계

---

## 🗺️ 프로젝트 전체 구조 (한눈에)

```
[Obsidian Vault]  →  [GitHub Private Repo]  →  [GitHub Actions]  →  [s-reborn-blog]  →  [Cloudflare Pages]
 글 작성 저장       S_Reborn_and_AI(private)    sync-blog.yml       코드 + 컨텐츠         s-reborn-blog.pages.dev
```

### 관련 저장소
| 저장소 | 용도 | 공개 여부 |
|--------|------|-----------|
| `a3492/s-reborn-blog` | Astro 웹사이트 코드 (현재 작업 대상) | Public |
| `a3492/S_Reborn_and_AI` | Obsidian 글 저장소 | Private |

### 로컬 경로
```
C:/dev/s-reborn-blog/       ← 현재 작업 폴더 (이게 GitHub에 올라가는 코드)
C:/dev/S_Reborn_and_AI/     ← 옵시디언 볼트 (글 내용)
```

---

## 🏗️ 기술 스택

| 항목 | 내용 |
|------|------|
| **프레임워크** | Astro 6.x (SSG) |
| **언어** | TypeScript + Astro 컴포넌트 |
| **CSS** | 커스텀 CSS (프레임워크 없음) |
| **컨텐츠** | Markdown / MDX |
| **폰트** | Paperlogy (제목), Pretendard (본문) |
| **검색** | Fuse.js (클라이언트 사이드) |
| **댓글** | Giscus (GitHub Discussions 기반) |
| **통계** | Supabase (조회수/좋아요 - 코드만 존재, DB 미설정) |
| **배포** | Cloudflare Pages (자동 배포) |
| **로컬 실행** | `npm run dev` → localhost:4321 |

---

## 📁 핵심 파일 구조

```
C:/dev/s-reborn-blog/
├── astro.config.mjs              # 사이트 설정 (site URL 등)
├── package.json                  # 의존성
├── tsconfig.json
├── .github/
│   └── workflows/
│       └── sync-blog.yml         # Obsidian → 블로그 자동 동기화 워크플로우
├── public/                       # 정적 파일 (폰트, 이미지)
└── src/
    ├── consts.ts                 # SITE_TITLE, CATEGORIES 정의
    ├── content.config.ts         # 블로그 스키마 정의
    ├── content/
    │   └── blog/                 # 블로그 글 (MD/MDX) - GitHub Actions가 채움
    │       ├── ai/
    │       ├── 의학/
    │       ├── 학습/
    │       ├── 개발/
    │       └── 에세이/
    ├── styles/
    │   ├── design.css            # ⭐ 메인 디자인 시스템 CSS (700줄, 여기서 주로 작업)
    │   └── global.css            # 보조 CSS (블로그 글 본문 스타일)
    ├── components/
    │   ├── BaseHead.astro        # SEO 메타태그
    │   ├── Topbar.astro          # 상단 네비게이션 바 + 검색창
    │   ├── Footer.astro          # 푸터
    │   ├── FormattedDate.astro   # 날짜 포맷터
    │   ├── GiscusComments.astro  # 댓글 컴포넌트
    │   ├── PostStats.astro       # 조회수/좋아요 (Supabase - 미완성)
    │   ├── Header.astro          # (레거시, 현재 미사용)
    │   ├── HeaderLink.astro      # (레거시, 현재 미사용)
    │   └── Sidebar.astro         # (레거시, 현재 미사용)
    ├── layouts/
    │   ├── Layout.astro          # 기본 레이아웃 (Topbar + 검색 JS + Footer)
    │   └── BlogPost.astro        # 블로그 글 레이아웃 (소셜공유 + 댓글)
    └── pages/
        ├── index.astro           # 홈페이지 (Featured + 그리드)
        ├── about.astro           # 소개 페이지
        ├── rss.xml.js            # RSS 피드
        └── blog/
            ├── index.astro       # 블로그 목록 페이지
            └── [...slug].astro   # 개별 블로그 글 페이지
```

---

## 🎨 현재 디자인 시스템 (design.css 기준)

### 색상 변수
```css
:root {
  --pink: #B8956A;              /* 포인트 컬러 (따뜻한 골드-브라운) */
  --pink-lo: rgba(184,149,106,0.12); /* 포인트 연한 배경 */
  --bg: #FAF8F5;                /* 메인 배경 (따뜻한 아이보리) */
  --bg2: #F0EDE8;               /* 보조 배경 */
  --bg3: #E8E4DE;               /* 호버 배경 */
  --rule: rgba(28,25,23,0.12);  /* 구분선 */
  --rule2: rgba(28,25,23,0.08); /* 연한 구분선 */
  --text: #1C1917;              /* 메인 텍스트 */
  --t2: #4B4540;                /* 보조 텍스트 */
  --t3: #6B7280;                /* 흐린 텍스트 */
}
```

### 폰트 변수
```css
--display: 'Paperlogy', 'Pretendard', sans-serif;  /* 제목용 */
--body: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;  /* 본문용 */
```

### 레이아웃
- **Topbar**: 높이 56px, sticky, 검색창(Fuse.js) + 네비게이션
- **site-main**: max-width 1200px, 좌우 padding 2rem
- **홈페이지**: Featured 대형카드(좌) + 2개 사이드포스트(우) + 4열 그리드
- **반응형**: 768px 이하 태블릿, 480px 이하 모바일

### 디자인 시스템 참고 출처
현재 작업은 **s-reborn-design-system** 참고하여 진행 중.
⚠️ 디자인 시스템 파일이 로컬에 별도로 없을 수 있음 (외부 Figma/Canva 등일 가능성).

---

## 📊 최근 커밋 히스토리 (현재 상태 파악용)

```
fbd9fe4  fix: 탭 active 상태 + 다크모드 가독성 전면 수정       ← 최신
f642bf0  fix: 전 페이지 다크테마 통일 & 헤더/CSS 충돌 전면 수정
fd6f5ab  fix+feat: 모바일 다크테마 복구 & 반응형 레이아웃
52f00c8  fix: 폰트 크기 정규화 — 전 사이트 base 16px 통일
cec610d  홈페이지 디자인 리디자인: 사이드바 레이아웃으로 전면 교체
```

---

## 🔄 GitHub Actions 파이프라인 (글 자동 배포)

### 흐름
1. Obsidian에서 글 저장 → obsidian-git이 자동 push → `a3492/S_Reborn_and_AI`
2. `S_Reborn_and_AI`의 `trigger-blog-sync.yml` 실행 → `repository_dispatch` 이벤트 전송
3. `s-reborn-blog`의 `sync-blog.yml` 실행 → 글 복사 + 커밋
4. Cloudflare Pages 자동 감지 → 빌드 + 배포

### 현재 파이프라인 상태
- ⚠️ `BLOG_SYNC_TOKEN` 시크릿 두 레포에 설정 필요 (Classic PAT, `repo` + `workflow` 스코프)
- 두 레포의 시크릿 업데이트 여부 미확인 상태
- 해결 방법: `https://github.com/settings/tokens/new` 에서 새 Classic PAT 발급 후 두 레포 시크릿 업데이트

---

## ✅ 구현 완료 기능

| 기능 | 파일 | 상태 |
|------|------|------|
| Topbar + 검색 (Fuse.js) | Topbar.astro + Layout.astro | ✅ |
| 홈페이지 Featured + Grid | pages/index.astro | ✅ |
| 블로그 목록 | pages/blog/index.astro | ✅ |
| 개별 포스트 | layouts/BlogPost.astro | ✅ |
| 소셜 공유 (Twitter, LinkedIn, 카카오) | BlogPost.astro | ✅ (카카오 SDK 미설치) |
| 링크 복사 | BlogPost.astro | ✅ |
| Giscus 댓글 | GiscusComments.astro | ✅ |
| RSS 피드 | pages/rss.xml.js | ✅ |
| Sitemap | astro.config.mjs | ✅ |
| SEO (OG, Twitter Card) | BaseHead.astro | ✅ |
| 반응형 (모바일) | design.css | ✅ |
| 조회수/좋아요 | PostStats.astro | ⚠️ 코드만 (Supabase DB 미설정) |
| Kakao Share SDK | BlogPost.astro | ❌ fallback 처리만 |
| Custom Domain | astro.config.mjs | ❌ 미정 |
| 다크모드 | design.css | ⚠️ 부분 작업 중 |

---

## 🚧 현재 진행 중인 작업 (이 인수인계의 핵심)

**localhost:4321을 s-reborn-design-system에 맞게 수정 중**

작업 범위 추정 (최근 커밋 기반):
- 탭/Active 상태 스타일 조정
- 다크모드 가독성 개선
- 헤더 CSS 충돌 수정
- 모바일 반응형 레이아웃
- 폰트 크기 정규화 (base 16px 통일)

**수정해야 할 주요 파일:**
- `src/styles/design.css` ← 대부분의 UI 작업
- `src/styles/global.css` ← 블로그 본문 스타일
- `src/components/Topbar.astro` ← 네비게이션
- `src/layouts/BlogPost.astro` ← 포스트 레이아웃
- `src/pages/index.astro` ← 홈페이지

---

## 🔧 로컬 개발 환경

```bash
# 위치
cd C:/dev/s-reborn-blog

# 개발 서버 실행
npm run dev
# → http://localhost:4321

# 빌드 테스트
npm run build

# 필요 Node 버전
node >= 22.12.0
```

---

## 📌 중요 주의사항

1. **CSS 구조**: `design.css`가 메인 스타일시트. `global.css`는 블로그 본문(prose)용. 충돌 주의.
2. **CSS 변수**: `--accent`는 `global.css`에, `--pink`는 `design.css`에 정의됨. 값은 같음(`#B8956A`).
3. **Topbar 검색**: JavaScript는 `Layout.astro`의 `<script>` 블록에 있음 (Fuse.js 동적 로드).
4. **다크모드**: `design.css`에 `@media (prefers-color-scheme: dark)` 미구현. 별도 추가 필요.
5. **글 경로**: `src/content/blog/{카테고리}/{파일명}.md` → URL: `/blog/{카테고리}/{파일명}/`
6. **Draft 제외**: `draft: true` 설정된 글은 빌드에서 자동 제외.
7. **Sidebar.astro**: 레거시 파일, 현재 미사용. 제거해도 무방.

---

## 🔐 시크릿/환경 변수

| 항목 | 위치 | 용도 |
|------|------|------|
| `BLOG_SYNC_TOKEN` | GitHub Secrets (두 레포 모두) | 크로스-레포 Actions 트리거 |
| Supabase URL/Key | 미설정 (코드에 하드코딩 예정) | 조회수/좋아요 (미완성) |
| Giscus 설정 | GiscusComments.astro 내 | 댓글 시스템 |

---

## 📞 계정 정보

- **GitHub 계정:** a3492
- **배포 URL:** https://s-reborn-blog.pages.dev
- **Cloudflare 이메일:** A01034920591@gmail.com
- **로컬 작업 경로:** C:/dev/s-reborn-blog/
