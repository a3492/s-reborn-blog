# 화면 검증 체크리스트

홈과 공통 헤더를 바꾸기 전에 이 목록을 실행한다. 절차와 되돌리기 방법은 PR #58 (`cursor/pr57-safe-density-fixes-837a`, `ad7ccca`, `79c02a3`, `f63c069`)의 체크리스트를 이 베이스에 다시 적은 것이다. 아래 “이번 관찰”은 2026-11-20, PR #54 head `775eeca` (`cursor/portal-pilot-home-list`) 위에 올린 로컬 빌드다.

비교 기준:

- 베이스: PR #54 head `775eeca`
- 이번: 홈 글 행은 제목과 분류·날짜만 보이고, 본문 글자 크기는 16px, 320px 메뉴와 820px 이하 오픈채팅은 #58과 같다
- 운영 `sreborn.net`에는 배포하지 않는다

본 경로는 `/`, `/blog/aerini/what-is-ai/`, `/tutorials/crm-scenarios/` 다. 홈 폭은 1440, 390, 320. 테마는 라이트와 다크다.

## A. 객관 확인

### A1. 테마 계약

```bash
npm run qa:site-theme
```

통과 조건: `scenarioCount` 82, `groups` 8, `errors`가 빈 배열, 감사 페이지에 `70개` 잔여 문구가 없다.

이번 관찰: `scenarioCount` 82, `groups` 8, `stale70` 없음, `errors` 빈 배열.

### A2. CRM 시나리오

```bash
npm run qa:crm
```

통과 조건: 시나리오 82, 다운로드 84, 탐색 82. PP01–PP08이 내용에서 나온다. 제목 문자열은 `CRM AI 실습 라이브러리`다.

이번 관찰: `scenarios` 82, `downloads` 84, `nav` 82, `checkedBlocks` 82, `errors` 빈 배열. 미리보기 `/tutorials/crm-scenarios/` 본문에서 서로 다른 `PP0x-yy` 식별자 82개와 제목 `CRM AI 실습 라이브러리`를 확인했다.

### A3. 프로덕션 빌드와 페이지 수

```bash
npm run build
```

`prebuild`가 A1과 A2를 다시 실행한다. 하나라도 실패하면 빌드를 통과로 보지 않는다.

통과 조건: 빌드가 끝나고 페이지 수가 이 베이스와 같다. 이번 베이스의 기대값은 1379페이지다.

이번 관찰: 1379페이지.

### A4. 홈 목록

홈 `#latest`의 글 행은 제목, 분류, 날짜, 링크만 보인다. 요약·설명·본문 조각은 홈에 그리지 않는다. 글 원문과 `/blog/` 목록의 설명은 그대로다.

연구 행은 제목과 링크만 남긴다. 같은 뜻을 반복하던 부제 세 줄은 홈에서만 숨긴다.

이번 관찰: `.portal-summary`와 `.portal-copy`는 0개. 연구 행 텍스트는 `Multi-AI Operating System`, `Human–AI Cognitive Interface`, `AI Workflow Engineering`과 링크 표시뿐이다. `Doctor AI Academy 열기` 버튼은 이 베이스에 이미 없다. 메뉴의 `Doctor AI Academy`와 소개 약력 문장은 그대로다.

### A5. 본문 글자 크기

`src/styles/global.css`의 720px·360px 구간에서 `body`는 16px이다. 홈 `body`도 16px이다.

이번 관찰: 홈 1440·390·320에서 `body` 16px. 글 본문 `/blog/aerini/what-is-ai/`는 720px과 360px에서 `body` 16px. 홈 히어로 문단과 글 제목도 360px에서 16px이다. 분류·날짜 줄은 13px이다.

### A6. 폭, 메뉴, 오픈채팅, 포커스

각 폭에서 다음을 본다.

- `documentElement.scrollWidth - innerWidth`가 2px 이하인가.
- 보이는 요소의 오른쪽 끝이 뷰포트 너비를 넘는가. `overflow-x: clip`이 있으면 스크롤 폭만으로는 잘린 버튼을 놓친다.
- 320px에서 `[data-nav-toggle]`이 화면 안에 있고, 누르면 `aria-expanded`가 `true`, 닫으면 `false`인가.
- 820px 이하에서 오픈채팅 QR이 글 아래에 있는가.
- 오픈채팅 QR과 버튼의 키보드 포커스가 `2px solid #2457eb`인가.

이번 관찰:

- 1440·390·320, 라이트·다크에서 스크롤 폭 초과는 0이고, 화면 밖으로 나간 요소는 0개다.
- 320px 메뉴 버튼은 왼쪽 267px, 오른쪽 311px이다. 열고 닫기가 됐다.
- 390px과 320px, 그리고 640px과 820px 사이인 800px에서 QR은 글 아래에 있다. 1440px에서는 글 오른쪽(907px)에 QR이 있다.
- `.openchat-qr`와 `.openchat-button`에 `focus({ focusVisible: true })`를 주면 outline은 `rgb(36, 87, 235) solid 2px`이다.

### A7. 브라우저 스크립트

```bash
npm run build
npm run qa:home-browser
```

`scripts/qa-home-browser.mjs`가 `dist`를 연다. 320·360·390·768·1280·1440px에서 라이트·다크와 시스템 라이트·다크를 검증한다. 홈의 최신 글 행은 제목·분류·날짜를 확인하고, 모바일에서는 홈과 글 본문의 글자 크기 16px을 확인한다.

기존 320px 서랍은 패널 폭을 줄인 뒤에도 배경 오버레이가 브랜드 위에 남았다. 이제 서랍은 헤더 아래에서 열리고, 헤더 높이가 바뀌면 서랍 높이도 갱신된다. 브라우저 QA는 패널과 브랜드 글자의 경계를 비교하고, 글자 양쪽 끝이 오버레이에 가려지는지도 확인한다.

각 조합에서 강연 하위메뉴 4개를 클릭하고 경로 표시와 활성 메뉴를 확인한다. 경로 표시의 형제 항목 전환, 상위 강연 페이지, 홈 링크도 직접 클릭한다. 강연 허브의 내부 링크, 강연 및 CRM 다운로드 응답, CRM 시나리오와 분류, 오픈채팅 버튼과 QR의 연결 주소를 확인한다. 테마 선택은 새로고침, 페이지 이동, 다른 탭, 운영체제 설정 변경에서도 검증한다.

### A8. 분류 체계 v2

```bash
npm run qa:taxonomy
npm run build
npm run qa:home-browser
```

승인 CSV의 421편을 원본 글 ID와 대조한다. AI LAB 394편은 7개 주제에 한 번씩 들어가고, 의료 AI 강의 25편과 Hermes 글 2편은 AI ACADEMY의 강의·실습·발표·기록에 들어간다. 빌드 페이지 수 기준은 1,386이다. 기존 글 주소와 다운로드는 같은 경로에 있어야 한다.

브라우저 QA는 24개 화면 폭·테마 조합에서 AI LAB 주제 7개와 AI ACADEMY 하위 메뉴 4개를 직접 누른다. 주제별 글 수, 형식·수준 교차 필터, 「처음이라면」 입문 링크를 확인한다. 클릭 가능한 경로 표시와 BreadcrumbList가 서로 같은지, 메뉴의 활성 상태가 현재 위치와 맞는지도 확인한다. 320px에서는 필터와 경로 표시가 화면 안에 들어와야 한다.

강의 메뉴의 임시 목적지는 `/blog/?category=doctor-ai`다. 기존 글 URL에서 「홈 › AI ACADEMY › 강의 › 글」이 보이는지 확인한다. 강의 정적 목록은 T4에서 추가한다.

### A9. 테마

`[data-theme-select]`로 `light`와 `dark`를 고르고 새로고침한다. `html[data-theme]`이 선택과 같은지 본다.

이번 관찰: 세 폭에서 라이트와 다크가 선택값과 같았다. 다크 홈의 배경은 어둡고 글자는 밝다.

## B. 정성 확인

점수를 매기지 않는다.

- 홈 첫 제목은 `AI를 이해하고, 실험하고, 현실에 적용합니다.`다. 최신 글은 제목 아래 분류와 날짜만 있다.
- 연구 섹션 제목과 세 글 제목은 남아 있고, 그 아래 설명을 반복하지 않는다.
- 오픈채팅, 소개, 검색, 전체 글 링크는 남아 있다.
- 메뉴가 열린 320px에서 서랍은 브랜드 글자와 겹치지 않는다. 닫기 버튼과 메뉴 항목은 보인다. 겹치면 `npm run qa:home-browser`가 실패한다.

## C. 이 기준이 타당한가

- 시나리오 82, 다운로드 84, 탐색 82는 내용이 줄었는지 보는 기준으로 타당하다. 페이지 수 1379는 라우트가 빠졌는지 보는 보조 기준이다.
- `scrollWidth`만 보는 가로 넘침 검사는 부족하다. 요소의 경계 상자를 뷰포트와 비교해야 한다.
- PR #57의 `scripts/qa-home-browser.mjs`는 `#explore .cards > a.card` 세 장과 카드 높이 상한을 검사한다. 이 베이스의 홈에는 그 카드가 없다. 그 스크립트와 워크플로를 그대로 넣으면 품질 게이트가 틀린 이유로 실패하므로 가져오지 않았다.
- `Doctor AI Academy` 문자열 횟수는 약한 기준이다. 같은 주소의 보이는 버튼을 중복으로 뺐는지만 본다. 이번 베이스에는 그 버튼이 이미 없다.

## D. 되돌리기

이 저장소의 운영 사이트는 Cloudflare Pages다. 프로덕션 배포와 롤백은 사람이 대시보드에서 한다. 이 체크리스트를 실행하는 에이전트는 프로덕션에 배포하거나 롤백 버튼을 누르지 않는다.

### 나쁜 배포를 이전 배포로 되돌리기

1. Cloudflare 대시보드에서 계정 → Workers & Pages → `s-reborn-blog`를 연다.
2. Deployments에서 Production으로 표시된 현재 배포를 확인한다.
3. 그 이전의 성공 배포를 연다. 미리보기 주소로 홈, `/blog/`, `/tutorials/crm-scenarios/`가 기대한 내용인지 본다.
4. 그 배포의 Rollback을 실행한다. 롤백은 그 빌드를 다시 프로덕션에 올린다. 환경 변수, DNS, 도메인 설정은 이 작업에 포함하지 않는다.
5. 롤백 직후 `https://sreborn.net/`을 브라우저로 연다. 테마 저장값 `sreborn-theme`이 라이트·다크·시스템에서 유지되는지 본다.

GitHub의 `main`이 이미 나쁜 커밋을 가리키면, 롤백만으로는 다음 푸시가 다시 그 커밋을 배포한다. 아래 Git 절차로 새 커밋을 만든 뒤에 그 커밋이 배포되게 한다.

### Git에서 되돌리기

나쁜 커밋을 히스토리에서 지우지 않는다. `git reset --hard`, `git push --force`, `main` 직접 푸시를 쓰지 않는다.

```bash
git fetch origin main
git checkout -b cursor/revert-<short-sha>-003f origin/main
git revert --no-edit <나쁜 커밋 SHA>
git push -u origin HEAD
```

여러 커밋이면 오래된 것부터 `git revert`한다. 끌어오기 요청으로 `main`에 합친다. 초안 PR의 브랜치만 문제라면 그 PR을 병합하지 않으면 운영은 바뀌지 않는다.

## 이번 라운드에서 의도적으로 남긴 것

- 홈 글 행의 분류와 날짜. 뺀 것은 요약·설명·부제다.
- `/blog/` 목록의 설명 문단. 이번 범위는 홈이다.
- 검색 결과의 설명. 검색은 목록이 아니다.
- 메뉴의 `Doctor AI Academy`와 소개 약력의 이름.
- PR #57 브라우저 스크립트. 이 홈의 구조와 맞지 않는다.

### 분류 체계 v2 · T4

강의 목록의 4부 편수와 기존 글 링크 25개를 검사한다. 검색은 홈 이외 페이지에서 320·390·480px과 4개 테마 상태로 검증한다. 버튼의 44px 크기, 키보드 포커스 표시, Enter 열기, Esc 포커스 복귀, Ctrl+K를 확인한다. 분류 QA는 승인 CSV와 실제 글 폴더별 편수도 대조한다.
