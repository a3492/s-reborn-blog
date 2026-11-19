# 화면 검증 체크리스트

홈과 공통 헤더를 바꾸기 전에 이 목록을 실행한다. 각 항목은 실행 방법과, 2026-11-19에 PR #57 (`50eb9b98`, 브랜치 `refactor/compact-content-hierarchy-20261119`)과 그 위에 올린 수정(`cursor/pr57-safe-density-fixes-837a`)을 로컬 빌드로 본 관찰을 함께 적는다.

스크린샷 파일은 검증 실행의 `pr57/` 폴더에 있다. 이름만 적어도 어느 화면인지 알 수 있게 했다.

비교 기준:

- 이전: `main` `9209b3c` 로컬 빌드
- 이후: PR #57 head 로컬 빌드
- 수정 후: 헤더·오픈채팅·포커스·중복 버튼을 고친 로컬 빌드
- 미리보기: `https://e841694e.s-reborn-blog.pages.dev/` (Cloudflare Pages, 커밋 `50eb9b9`)

본 경로는 `/`, `/blog/`, `/blog/aerini/what-is-ai/`, `/about/`, `/tutorials/crm-scenarios/`, `/lecture-materials/` 다. 폭은 1440, 768, 390, 320. 테마는 라이트, 다크, 시스템(`prefers-color-scheme`를 어두운 쪽으로 맞춘 뒤 `sreborn-theme=system`)이다.

## A. 객관 확인

### A1. 테마 계약

```bash
npm run qa:site-theme
```

통과 조건: `scenarioCount` 82, `groups` 8, `errors`가 빈 배열, 감사 페이지에 `70개` 잔여 문구가 없다.

이번 관찰: PR #57 head와 수정 후 빌드 모두 `scenarioCount` 82, `groups` 8, `stale70` 없음, `errors` 빈 배열.

### A2. CRM 시나리오

```bash
npm run qa:crm
```

통과 조건: 시나리오 82, 다운로드 84, 탐색 82. PP01–PP08이 내용에서 나온다. 제목 문자열은 `CRM AI 실습 라이브러리`다.

이번 관찰: 두 빌드 모두 `scenarios` 82, `downloads` 84, `nav` 82, `checkedBlocks` 82, `errors` 빈 배열. 브라우저에서 `/tutorials/crm-scenarios/` 본문을 읽어 서로 다른 `PP0x-yy` 식별자 82개와 제목 `CRM AI 실습 라이브러리`를 확인했다. 화면은 `after-crm-320-dark.png`, `after-crm-1440-light.png`.

### A3. 프로덕션 빌드와 페이지 수

```bash
npm run build
```

`prebuild`가 A1과 A2를 다시 실행한다. 하나라도 실패하면 빌드를 통과로 보지 않는다.

통과 조건: 빌드가 끝나고, `dist`의 `index.html` 경로 집합이 `main` 빌드와 같다.

이번 관찰: PR #57 head와 수정 후 모두 1379페이지. `main`도 1379페이지. `index.html` 라우트는 양쪽 1383개이고 차이는 0개다. HTML·마크다운·텍스트 파일 집합도 2043개로 같고 빠진 경로가 없다.

### A4. 내부 링크

빌드 결과의 HTML에서 `href`와 이미지·스크립트 `src`를 모은다. `http`, `mailto`, `tel`, `data`는 제외한다. 같은 사이트 경로는 `dist` 안의 파일, 디렉터리의 `index.html`, 또는 `public/_redirects`의 첫 일치 규칙으로 이어져야 한다.

이번 관찰 (PR #57 head `dist`): HTML 1391개, 파일로 해소된 내부 참조 68362, 리다이렉트로 이어지는 참조 264, 어디에도 없는 고유 링크 55. 55개는 모두 옛 정적 페이지의 `/s-reborn-blog/` 접두사다.

예:

- `search.html` → `/s-reborn-blog/`
- `search.html` → `/s-reborn-blog/category/doctor-ai.html`
- `category/ai-tools.html` → `/s-reborn-blog/category/ai-news.html`
- `category/faq.html`, `category/tips.html`, `category/regulations.html`, `category/ai-news.html`, `category/doctor-ai.html`도 같은 패턴

접두사를 지우면 대상 파일은 `dist`에 있다. `_redirects`에는 이 접두사 규칙이 없다. 이 링크는 #57이 새로 만든 것이 아니고, 이번 수정에서도 주소를 지우거나 바꾸지 않았다.

### A5. 로드 오류

Playwright로 위 여섯 경로를 열고 HTTP 상태와 `pageerror`를 기록한다. 미리보기는 브라우저로 연다.

이번 관찰: 로컬 여섯 경로에서 400 이상 응답과 `pageerror`가 없었다. 미리보기 `https://e841694e.s-reborn-blog.pages.dev/`는 HTTP 200, 제목 `S—REBORN | Kim Dowi's AI Lab`, 자바스크립트 페이지 오류 없음. 화면은 `preview-home-1440-light.png`. 브랜치 주소 `https://refactor-compact-content-hie.s-reborn-blog.pages.dev/`도 HTTP 200이다.

### A6. 클릭과 메뉴

- 홈 `#explore`의 저널 카드는 `/blog/`로 이동한다.
- `/blog/`의 첫 글 카드는 그 글의 주소로 이동한다.
- `/about/`의 `브랜드 홈으로`는 `/`로 돌아간다.
- `/lecture-materials/` 본문에 보이는 김도위 강연 링크는 `/lecture-materials/kim-dowi/`로 이동한다.
- 폭 1200 이하에서 `[data-nav-toggle]`을 누르면 `aria-expanded`가 `true`, `[data-nav-close]`를 누르면 `false`가 된다.
- 1440에서는 상단 메뉴가 보이고 햄버거 버튼은 숨는다.

이번 관찰: 저널 카드, 글 카드, 소개의 홈 링크, 본문에 보이는 김도위 강연 링크가 기대 주소로 이동했다. 390과 320에서 메뉴는 열리고 닫혔다 (`after-home-390-light-menu-open.png`, `fix-home-320-light-menu-open.png`). 1440에서 상단 메뉴가 보였다.

헤더 안의 강연 하위 메뉴는 닫혀 있을 때 화면에 없다. 그 숨은 링크를 그대로 클릭하면 타임아웃이 난다. 본문 카드를 클릭하면 이동한다. 체크할 때는 보이는 링크를 누른다.

### A7. 폭과 넘침

각 폭에서 다음을 본다.

- `documentElement.scrollWidth - innerWidth`가 2px 이하인가.
- 보이는 요소의 오른쪽 끝이 뷰포트 너비를 넘는가. `overflow-x: clip`이 있으면 스크롤 폭만으로는 잘린 버튼을 놓친다.
- 제목과 버튼 글자가 상자 밖으로 나가거나 한 글자만 남고 잘리는가.

이번 관찰: 여섯 페이지, 네 폭, 세 테마에서 문서 스크롤 폭 초과는 0이었다. PR #57 head의 320px 홈에서 메뉴 버튼의 오른쪽 끝이 354px이라 320px 화면 밖에 있었다. 수정 후 같은 버튼은 왼쪽 267px, 오른쪽 311px로 화면 안에 있다. 화면은 `fix-home-320-light.png`. 390px에서는 수정 전에도 버튼이 화면 안에 있었다.

오픈채팅은 수정 전 390px에서 본문 칸이 QR 230px 옆에 붙어 글 줄이 매우 좁아졌다. 수정 후 820px 이하에서는 QR이 글 아래에 있다. 1440px에서는 글과 QR이 나란하다 (QR 상단 2482px, 글 상단 2454px).

### A8. 테마

`[data-theme-select]`로 `light`, `dark`, `system`을 고르고 새로고침한다. `html[data-theme-preference]`가 선택과 같고, `system`일 때는 `prefers-color-scheme`에 따라 `data-theme`이 정해지는지 본다. 다른 경로로 이동한 뒤 `localStorage['sreborn-theme']`이 유지되는지 본다.

이번 관찰: 세 값 모두 새로고침 후 유지됐다. 시스템을 어두운 환경에서 열면 `data-theme`은 `dark`다 (`after-home-1440-system.png`, `after-home-390-dark.png`). 다크를 고른 뒤 `/about/`으로 이동해도 preference와 저장값이 `dark`였다. 다크 홈의 카드 배경은 어두운 회색이고 글자는 밝은색이다.

### A9. 키보드 포커스

Tab으로 첫 링크에 들어가고, 홈 카드에 포커스를 준다. 포커스 윤곽이 배경과 구분되면 통과다.

이번 관찰: 수정 전 첫 Tab은 브랜드 링크이고 브라우저 기본 윤곽(`auto 1px`)이었다 (`after-home-1440-light-focus.png`). 수정 후 탐색 카드 포커스는 `2px solid rgb(36, 87, 235)`이다 (`fix-home-1440-light-card-focus.png`).

## B. 정성 확인

점수를 매기지 않는다. 화면에서 본 것만 적는다.

### B1. 이 화면이 무슨 곳인지 바로 알 수 있는가

홈 첫 제목은 `AI를 이해하고, 실험하고, 현실에 적용합니다.`다. 그 아래 세 칸이 연구, 콘텐츠, 아카데미로 갈라진다. 제목만 읽어도 연구·기록·교육 공간이라는 점은 드러난다. 제목 위의 영문 `KIM DOWI'S AI LAB & JOURNAL`은 같은 뜻을 한 번 더 말한다. 화면: `after-home-1440-light.png`, `before-home-1440-light.png`.

글 목록은 `전체 글`과 개수가 먼저 보인다 (`after-blog-390-light.png`). 소개는 이름과 직함이 초상 옆에 있다 (`after-about-1440-light.png`). CRM은 제목이 `CRM AI 실습 라이브러리`다.

### B2. 제목과 설명이 여러 곳에 반복되는가

#57은 히어로의 `RESEARCH · IDEAS · PRACTICE · EDUCATION`과 탐색·글 섹션의 소개 문단을 뺐다. 이전 화면에는 그 문단이 있다 (`before-home-1440-light.png`). 카드 라벨의 `01 —` 번호도 빠졌다. 1440px 카드 높이는 260px에서 158px로 줄었다. 768px에서는 215px에서 137px이다.

아직 같은 목적지가 여러 번 나온다.

- 탐색 카드 `AI 아카데미`와 섹션 제목 `Doctor AI Academy`와 메뉴 `AI 연구·글` 안의 `Doctor AI Academy`가 같은 외부 주소다.
- 약력 항목에 `Doctor AI Academy`라는 이름이 한 번 더 있다. 이 문장은 링크가 아니다.
- 섹션에 있던 `Doctor AI Academy 열기` 버튼은 수정 커밋에서 뺐다. 같은 주소는 카드와 메뉴에 남아 있다.
- 히어로의 `AI 미니 아카데미 · 실습 시연`(`/academy/mini-lab/`)과 섹션의 `오늘의 미니 아카데미`(`/academy/agent-orchestration-20261108/`)는 주소가 다르다. 문구만 비슷하다.
- 글 목록은 여전히 테두리와 배경이 있는 카드다 (`after-blog-390-light.png`). #57은 이 목록을 바꾸지 않았다.

### B3. 다음에 누를 곳이 바로 보이는가

히어로에 `공간 둘러보기`, `김도위 소개`, `AI 미니 아카데미 · 실습 시연`이 있다. 탐색 카드는 연구 앵커, `/blog/`, 외부 아카데미로 이어지고, 저널 카드 클릭은 `/blog/`에 도착했다. 320px에서 메뉴 버튼이 화면 안에 있고, 열면 `홈`, `클리닉`, `AI 연구·글`, `강연·자료`, `소개`와 `닫기`가 보인다 (`fix-home-320-light-menu-open.png`).

메뉴가 열린 320px 화면에서는 서랍이 브랜드 글자의 오른쪽을 가린다. 닫기 버튼과 메뉴 항목은 보인다.

### B4. 한 화면에 정보가 과한가

카드가 낮아진 뒤에도 카드 설명은 바로 아래 연구·글·아카데미 섹션과 같은 역할을 한다. 섹션 번호 `01 / EXPLORE` 같은 영문 소제목은 남아 있다. 오픈채팅은 휴대폰 폭에서 글 다음에 QR이 오므로, 이전처럼 글자가 한 줄에 몇 글자만 들어가는 배치는 아니다.

글 목록은 카드마다 분류, 제목, 요약, 날짜가 있다. 요약이 제목과 거의 같은 글도 있다. 목록을 줄 목록으로 바꿀지는 #54가 이미 다루고 있으므로 여기서 목록 마크업을 다시 쓰지 않았다.

### B5. 글이 읽히고 이해가 되는가

320px 라이트와 390px 다크에서 홈 제목이 줄 단위로 끊기고 화면 밖으로 나가지 않았다 (`after-home-320-light.png`, `after-home-390-dark.png`). CRM 320px 다크에서 제목, 설명, 합성 자료 주의 상자의 대비가 유지된다 (`after-crm-320-dark.png`). 강연 목록과 글 본문도 같은 폭·테마 조합에서 가로 스크롤이 없었다 (`after-lecture-1440-light.png`, `after-post-1440-light.png`).

## C. 이 기준이 타당한가

- 시나리오 82, 다운로드 84, 탐색 82는 내용이 줄었는지 보는 기준으로 타당하다. 페이지 수 1379만으로는 글 하나가 비었는지 알 수 없고, 라우트 집합이 `main`과 같은지가 삭제 여부를 보여 준다.
- 카드 높이 상한(기존 브라우저 스크립트의 220px·230px)은 타당하지 않다. 이전 카드 215px도, 이후 카드 158px도 통과한다. 낮아졌는지는 이전과 이후의 높이를 나란히 재야 한다.
- `scrollWidth`만 보는 가로 넘침 검사는 부족하다. 홈은 `overflow-x: clip`이라 320px에서 메뉴 버튼이 화면 밖에 있어도 스크롤 폭이 늘지 않았다. 요소의 경계 상자를 뷰포트와 비교해야 한다.
- `Doctor AI Academy` 등장 횟수는 약한 기준이다. 제목이 두 줄로 나뉘면 문자열 검색에서 빠지고, 메뉴의 숨은 항목은 본문과 같이 센다. 같은 주소가 보이는 위치에 몇 번 있는지 보는 편이 맞다.
- 여섯 페이지 × 네 폭 × 세 테마의 전체 스크린샷은 대비와 넘침을 확인할 때 유용하다. 매번 전부 요구하면 비용이 크고, 홈과 긴 페이지 하나, 1440과 320, 라이트와 다크, 시스템 한 번으로도 이번과 같은 결함은 잡힌다. 나머지는 샘플로 충분하다.
- 정성 항목에 숫자를 붙이면 기준이 정밀해 보이지 않는다. 반복인지, 다음 행동이 보이는지는 화면을 가리켜 말하는 편이 맞다.

## D. 되돌리기

이 저장소의 운영 사이트는 Cloudflare Pages다. 프로덕션 배포와 롤백은 사람이 대시보드에서 한다. 이 체크리스트를 실행하는 에이전트는 프로덕션에 배포하거나 롤백 버튼을 누르지 않는다.

### 나쁜 배포를 이전 배포로 되돌리기

1. Cloudflare 대시보드에서 계정 → Workers & Pages → `s-reborn-blog`를 연다.
2. Deployments에서 Production으로 표시된 현재 배포를 확인한다.
3. 그 이전의 성공 배포를 연다. 미리보기 주소로 홈, `/blog/`, `/tutorials/crm-scenarios/`가 기대한 내용인지 본다.
4. 그 배포의 Rollback을 실행한다. 롤백은 그 빌드를 다시 프로덕션에 올린다. 환경 변수, DNS, 도메인 설정은 이 작업에 포함하지 않는다.
5. 롤백 직후 `https://sreborn.net/`과 미리보기와 다른 프로덕션 URL을 브라우저로 연다. 테마 저장값 `sreborn-theme`이 라이트·다크·시스템에서 유지되는지 본다.

GitHub의 `main`이 이미 나쁜 커밋을 가리키면, 롤백만으로는 다음 푸시가 다시 그 커밋을 배포한다. 아래 Git 절차로 새 커밋을 만든 뒤에 그 커밋이 배포되게 한다.

### Git에서 되돌리기

나쁜 커밋을 히스토리에서 지우지 않는다. `git reset --hard`, `git push --force`, `main` 직접 푸시를 쓰지 않는다.

```bash
git fetch origin main
git checkout -b cursor/revert-<short-sha>-837a origin/main
git revert --no-edit <나쁜 커밋 SHA>
git push -u origin HEAD
```

여러 커밋이면 오래된 것부터 `git revert`하거나, 범위를 되돌리는 커밋을 하나 만든다. 끌어오기 요청으로 `main`에 합친다. 초안 PR의 브랜치만 문제라면 그 PR을 병합하지 않으면 운영은 바뀌지 않는다.

### 재현·원인·수정·재검증 기록

```
날짜:
환경: 로컬 빌드 / 미리보기 URL / 프로덕션 URL
커밋:
재현:
  경로, 폭, 테마, 한 일
  기대한 화면:
  실제 화면:
  스크린샷:
원인:
  파일과 선택자, 또는 데이터
수정:
  커밋 SHA
  지운 주소나 시나리오가 없는지
재검증:
  실행한 명령과 결과 요약
  같은 경로·폭·테마에서 다시 본 화면
  옆에 있는 페이지(홈, 글 목록, CRM)가 그대로인지
남긴 위험:
```

이번 320px 메뉴 버튼에 이 틀을 적용하면 다음과 같다.

- 재현: PR #57 head, 홈, 320px, 라이트. 메뉴 버튼 오른쪽 끝 354px.
- 원인: 480px 이하 헤더에서 브랜드, 테마 선택, 언어, 햄버거의 합이 320px을 넘고, `overflow-x: clip`이 스크롤을 만들지 않음.
- 수정: `ad7ccca`. 480px 이하에서 여백과 테마 선택 폭을 줄이고, 브랜드가 먼저 줄도록 바꿈.
- 재검증: 수정 빌드에서 버튼 오른쪽 끝 311px, 열고 닫기 성공, `fix-home-320-light.png`.

## 이번 라운드에서 의도적으로 남긴 것

- 글 목록의 카드 레이아웃. #54가 줄 목록으로 바꾸는 작업을 이미 가지고 있다. 같은 파일을 여기서 다시 쓰면 두 초안이 더 겹친다.
- 탐색 카드 세 개. #57의 범위는 카드를 낮추는 것이다. 카드를 없애는 선택은 #54에 있다.
- 메뉴의 `Doctor AI Academy` 항목과 약력 문장의 이름. 메뉴 항목을 옮기면 정보 구조가 바뀐다.
- `/s-reborn-blog/` 접두 링크. 리다이렉트를 추가하면 주소 동작이 바뀌므로 별도 합의가 필요하다.
- 히어로와 아카데미 섹션에 남은 서로 다른 미니 아카데미 두 주소.
