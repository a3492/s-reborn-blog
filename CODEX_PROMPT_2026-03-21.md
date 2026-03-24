# Codex에게 전달할 프롬프트

아래 텍스트를 Codex 첫 메시지로 그대로 복사해서 붙여넣으세요.

---

## ✂️ 복사-붙여넣기용 프롬프트

```
안녕하세요 Codex! 저는 S-Reborn이고, 개인 블로그(https://s-reborn-blog.pages.dev)를 Astro로 개발 중입니다.
Claude Code가 작업하다가 당신에게 넘겨줬습니다.

## 프로젝트 위치
C:/dev/s-reborn-blog/

## 기술 스택
- Astro 6.x (SSG, npm run dev → localhost:4321)
- 순수 CSS (프레임워크 없음)
- TypeScript
- Cloudflare Pages 배포

## 핵심 파일
- src/styles/design.css        ← 메인 CSS (700줄, 대부분 작업이 여기)
- src/styles/global.css        ← 블로그 본문 CSS
- src/components/Topbar.astro  ← 상단 네비게이션 + 검색
- src/layouts/Layout.astro     ← 기본 레이아웃 (검색 JS 포함)
- src/layouts/BlogPost.astro   ← 블로그 글 페이지
- src/pages/index.astro        ← 홈페이지

## 색상 시스템 (design.css :root)
--pink: #B8956A     (포인트 컬러, 골드-브라운)
--bg: #FAF8F5       (메인 배경, 따뜻한 아이보리)
--bg2: #F0EDE8      (보조 배경)
--bg3: #E8E4DE      (호버 배경)
--text: #1C1917     (메인 텍스트)
--t2: #4B4540       (보조 텍스트)
--t3: #6B7280       (흐린 텍스트)

## 폰트
--display: 'Paperlogy', 'Pretendard'  (제목)
--body: 'Pretendard', sans-serif       (본문)

## 현재 상황
s-reborn-design-system을 참고해서 localhost:4321 UI를 개선하는 중입니다.
최근에 완료된 작업:
- 탭 active 상태 스타일 수정
- 다크모드 가독성 전면 수정
- 헤더/CSS 충돌 전면 수정
- 모바일 다크테마 복구
- 폰트 크기 base 16px 통일

## 알아야 할 구조
1. GitHub 저장소: github.com/a3492/s-reborn-blog (Public)
2. 글은 별도 Private 저장소(S_Reborn_and_AI)에서 GitHub Actions로 자동 동기화됨
3. src/content/blog/ 폴더에 .md 파일들이 있음 (카테고리별 폴더 구조)
4. draft: true 인 글은 빌드에서 자동 제외

## 주의사항
- CSS 변수 --accent (global.css)와 --pink (design.css)는 같은 값 #B8956A
- 다크모드는 아직 design.css에 @media prefers-color-scheme: dark 미구현
- Topbar.astro의 검색 버튼 JS는 Layout.astro에 있음 (Fuse.js 동적 로드)

## 지금 요청하는 작업
[여기에 구체적으로 하고 싶은 작업을 적어주세요]
예시:
- "design.css에 다크모드 지원 추가해줘"
- "블로그 목록 페이지(pages/blog/index.astro) 카드 레이아웃으로 바꿔줘"
- "Topbar에 카테고리 드롭다운 메뉴 추가해줘"
```

---

## 💡 사용 팁

### Codex에게 작업 지시할 때 좋은 패턴:
```
[위 기본 프롬프트] +

지금 하고 싶은 작업:
1. src/styles/design.css의 다크모드를 추가하고 싶어.
   - 다크모드 배경: #1C1917
   - 다크모드 텍스트: #FAF8F5
   - @media (prefers-color-scheme: dark) 블록 추가

2. 완료 후 npm run build 에러 없는지 확인해줘.
```

### 파일 직접 참조 시:
Codex에게 "C:/dev/s-reborn-blog/src/styles/design.css 읽어봐" 라고 하면
파일 내용을 기반으로 더 정확하게 작업 가능.

---

## 📄 상세 인수인계 문서
더 자세한 내용은 같은 폴더의 `CODEX_HANDOVER_2026-03-21.md` 참조.
