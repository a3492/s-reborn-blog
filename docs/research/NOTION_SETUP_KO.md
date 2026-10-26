# SREBORN Research Registry 설정 (원장님용)

이 문서는 **원장님이 직접** Notion DB와 GitHub 시크릿을 만드는 화면별 안내입니다. 에이전트가 DB를 만들지 않습니다. 값은 이 파일에 적지 마세요.

완료 후 GitHub Actions에서 `Sync Research Registry`를 **한 번** 실행하면, 사이트가 아니라 **검토용 PR**이 열립니다. 그 PR을 승인하기 전에는 `main`과 sreborn.net에 반영되지 않습니다.

## API와 MCP

| 경로 | 쓰는 때 | 쓰는 것 |
| --- | --- | --- |
| 빌드·동기화 | GitHub Actions, 로컬 `npm run sync:research` | Notion 공식 REST API, `@notionhq/client` |
| MCP | Cursor에서 문서를 찾아보거나 초안을 잡을 때 **선택** | Notion MCP. 배포·동기화 경로가 **아닙니다** |

유료 AI API는 쓰지 않습니다.

## 1) Integration 만들기

1. 브라우저에서 [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) 를 엽니다.
2. **New integration** 을 누릅니다.
3. 이름: `SREBORN Research Sync`
4. Associated workspace: 원장님 워크스페이스
5. Type: **Internal**
6. 저장합니다.

## 2) 토큰 발급

1. 방금 만든 Integration 화면에서 **Secrets** 또는 **Internal Integration Secret** 을 찾습니다.
2. **Show** 후 복사합니다. 이 값이 `NOTION_TOKEN` 입니다.
3. 채팅·커밋·이슈에 붙여 넣지 않습니다.

권한(Capabilities)은 **Read content** 만 있으면 동기화에 충분합니다. 쓰기가 필요하면 나중에 켭니다.

## 3) 데이터베이스 만들기

1. Notion에서 빈 페이지를 만듭니다. 제목: `SREBORN Research Registry`
2. `/database` 입력 후 **Table - Full page** 를 고릅니다. 페이지 안의 인라인 DB가 아니라 **전체 페이지 DB**여야 ID를 찾기 쉽습니다.
3. 표의 기본 이름 열 제목을 **Title** 로 바꿉니다. (열 이름 클릭 → Rename)
4. 아래 속성(열)을 **이름·유형 그대로** 추가합니다.

### 속성 스키마

| 속성 이름 | Notion 유형 | 내용 |
| --- | --- | --- |
| Title | Title | 문서 제목. 기본 열. |
| Document ID | Text | 영문 고정 ID. 예: `maos-root`. 한번 정하면 바꾸지 않습니다. |
| Parent | Relation | 이 DB 자신. 상위 문서 1개. 루트는 비움. |
| Related | Relation | 이 DB 자신. 같은 계층이 아닌 관련 문서. Parent와 섞지 않습니다. |
| Status | Select | `Draft` / `Review` / `Published` 세 값만. |
| Slug | Text | URL 조각. 소문자·숫자·하이픈. 루트는 아래 Root 표와 같아야 합니다. |
| Order | Number | 같은 부모 아래 정렬. 작은 수가 위. |
| Root | Checkbox | 최상위 허브만 체크. Parent가 있으면 체크하지 않습니다. |
| Research Area | Select | `Multi-AI Operating System` / `Human–AI Cognitive Interface` / `AI Workflow Engineering` |
| Version | Text | 예: `0.1` |
| Published At | Date | Published일 때만. |

Relation을 만들 때 **This database** 를 고르고, Parent와 Related는 **서로 다른 속성**으로 둡니다. Notion이 자동으로 만드는 반대 방향 열 이름은 그대로 두어도 됩니다.

### 루트 3개 (첫 행)

| Title | Document ID | Root | Slug | Research Area | Status | Order |
| --- | --- | --- | --- | --- | --- | --- |
| Multi-AI Operating System | `maos-root` | 체크 | `multi-ai` | Multi-AI Operating System | Published | 1 |
| Human–AI Cognitive Interface | `haci-root` | 체크 | `human-ai` | Human–AI Cognitive Interface | Published | 2 |
| AI Workflow Engineering | `awe-root` | 체크 | `workflow` | AI Workflow Engineering | Published | 3 |

세 루트는 Related로 서로 연결해도 됩니다. 하위 문서는 Parent만 채우고 Root는 끕니다.

**Published만 사이트에 나옵니다.** Draft·Review와 그 아래 문서는 제목도 숨깁니다.

## 4) DB를 Integration에 연결

1. DB 페이지 오른쪽 위 **···** → **Connections** (또는 **Add connections**).
2. `SREBORN Research Sync` 를 찾아 **Connect** 합니다.
3. 연결되지 않으면 동기화가 `404` 또는 `object not found` 로 실패합니다. 토큰이 맞아도 이 단계가 빠지면 실패합니다.

## 5) DB ID 찾기

주소창 예:

`https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=yyyy`

`notion.so/` 다음 32자리(하이픈 없이)가 데이터베이스 ID 입니다. 하이픈을 넣은 UUID 형태(`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)도 됩니다. 이 값이 `NOTION_RESEARCH_DATABASE_ID` 입니다.

페이지 ID와 혼동하지 마세요. **테이블 전체 화면**을 연 뒤 주소를 복사합니다.

## 6) GitHub Actions 시크릿 등록

1. GitHub 저장소 `a3492/s-reborn-blog` → **Settings** → **Secrets and variables** → **Actions**.
2. **New repository secret** 두 개:

| Name | Value |
| --- | --- |
| `NOTION_TOKEN` | 2단계에서 복사한 Integration Secret |
| `NOTION_RESEARCH_DATABASE_ID` | 5단계 DB ID |

3. 시크릿 화면 밖(채팅, PR, 커밋)에 값을 붙이지 않습니다.
4. Cloudflare Pages 환경 변수나 `PUBLIC_*` 에는 넣지 않습니다. 브라우저 번들에 들어가면 안 됩니다.

## 7) 로컬 `.env.local` (선택)

개발 기기에서만 동기화할 때:

1. `.env.example` 을 복사해 `.env.local` 을 만듭니다. `.env.local` 은 gitignore 되어 있습니다.
2. 아래 두 줄만 채웁니다. 다른 `PUBLIC_*` 값과 섞여도 되지만 Notion 토큰은 `PUBLIC_` 으로 시작하지 않습니다.

```
NOTION_TOKEN=
NOTION_RESEARCH_DATABASE_ID=
```

3. `npm run sync:research` → `npm run qa:research`

값이 비어 있으면 명령이 실패하고, 실패한 이유에 토큰 값은 출력되지 않습니다.

## 8) 첫 동기화 (원장님)

토큰이 아직 없으면 저장소의 샘플 허브 3개와 테스트 fixture(공개 1 + 비공개 1)로 빌드·숨김을 이미 확인한 상태입니다. 실제 Notion 반영은 시크릿 등록 후 한 번이면 됩니다.

1. GitHub → **Actions** → **Sync Research Registry** → **Run workflow**.
2. 워크플로가 Notion을 읽고, 검증하고, 변경이 있으면 **새 PR**을 엽니다. `main`에 직접 푸시하지 않습니다.
3. 프리뷰를 본 뒤 원장님이 그 PR을 승인합니다. 승인 전 프로덕션 배포 금지.

실패하면 마지막 정상 배포가 유지됩니다. 로그에 토큰이 보이면 시크릿을 재발급하세요.
