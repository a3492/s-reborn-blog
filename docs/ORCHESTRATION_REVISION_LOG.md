# 오케스트레이션 시리즈 개정·실행 로그

날짜는 **작업이 실제로 이루어진 날** 기준. 기획서는 [ORCHESTRATION_NARRATIVE_UPGRADE_PLAN.md](./ORCHESTRATION_NARRATIVE_UPGRADE_PLAN.md).

---

## 2026-04-02 (3차 — 에이전틱 RAG 본문·cu 갱신·배포)

- `agentic-rag.md` **전면 보강:** 야간 복도 장면, 본문 절마다 RoundPrep 대입, 반례·실무 체크리스트, `read_time` 18.
- 오케스트레이션 전편 `cu` 타임스탬프 **`cu2604021138`** 로 통일(배포 배치).
- `s-reborn-blog` `main`에 orchestration·docs·scripts 경로 커밋 후 push(다른 로컬 변경분은 스테이징 제외).

---

## 2026-04-02 (2차 — 본문 개편)

### 실행

- `ORCHESTRATION_ROUNDPREP_BIBLE.md` 추가 (인물·가정·타임라인 1p).
- **전면 리라이트:** `what-is-orchestration.md`, `orchestration-vs-agents.md` (장면·테제·스테이크·전환점·페이오프·훅, RoundPrep 밀착).
- **케이스 스터디 보강:** `medical-orchestration-case-study.md` (야간 화이트보드 장면, 테제·스테이크, **승인·책임 시간축 표**, 전환점, 다음 회의 한 줄).
- **나머지 18편:** `scripts/inject-orchestration-narrative.mjs`로 `### 테제` / `### 스테이크` / `### 전환점 — RoundPrep 메모` / `### 다음 회의 한 줄` / `### 다음 화` 삽입, `description`·`read_time` 조정. 기존 `### 이야기 속에서 이어서` 중복 블록은 제거.
- 편집 추적 `cu2604021115`로 통일(해당 배치). → 이후 3차에서 `cu2604021138`로 재통일.

### 스크립트

- `blog/scripts/inject-orchestration-narrative.mjs` — 동일 구조로 타 시리즈에 재사용 시 `P` 맵만 교체.

### 남은 과제

- [ ] `key_takeaways` 첫 불릿을 기획서대로 “행동 한 줄”로 **편마다** 수동 다듬기 (자동 치환은 YAML 오인식 위험).
- [ ] 본문 절마다 “RoundPrep에 대입하면” 한두 문장 **추가 밀도** (현재는 테제·전환점 중심).

---

## 2026-04-02 (1차)

### 기록한 문서

| 문서 | 내용 |
|------|------|
| `ORCHESTRATION_NARRATIVE_UPGRADE_PLAN.md` | 서사·테제·스테이크·분량·유형별 뼈대·로드맵 P0~P3 |
| `ORCHESTRATION_REVISION_LOG.md` (본 파일) | 로그 시작 |

### 문제 진단 요약 (기획 반영)

- RoundPrep과 본문이 **접착되지 않음** → 편당 **장면→테제→페이오프·훅** 구조로 통일 제안.
- 메시지가 **판단 한 문장으로 고정되지 않음** → 테제·`key_takeaways` 정책 수정안 반영.
- 분량·장면 부족 → **목표 3,500~5,500자/편** 및 유형별 최소 서사 분량 제시.

### 시리즈 순서 (현재 `series_order` 기준 참고용)

| order | slug (파일명 기준) | P 단계 (기획서) |
|------:|---------------------|-----------------|
| 1 | what-is-orchestration | P0 |
| 2 | orchestration-vs-agents | P0 |
| 3 | task-decomposition | P1 |
| 4 | workflow-patterns | P1 |
| 5 | parallel-execution | P1 |
| 6 | state-management | P1 |
| 7 | react-pattern | P1 |
| 8 | supervisor-pattern | P1 |
| 9 | multi-agent-communication | P2 |
| 10 | human-in-the-loop | P2 |
| 11 | agentic-rag | P2 |
| 12 | context-window-management | P2 |
| 13 | langgraph-intro | P2 |
| 14 | autogen-intro | P2 |
| 15 | crewai-intro | P2 |
| 16 | medical-orchestration-case-study | P0 |
| 17 | orchestration-testing | P3 |
| 18 | orchestration-debugging | P3 |
| 19 | orchestration-monitoring | P3 |
| 20 | orchestration-security | P3 |
| 21 | orchestration-cost-optimization | P3 |

### 1차 시점 미실행 → 2차에서 처리됨

- [x] `ORCHESTRATION_ROUNDPREP_BIBLE.md` 작성
- [x] P0 글 3편 본문 개편(허브 2·케이스 1)
- [x] 나머지 편 테제·페이오프·훅 삽입(스크립트 + 수동 정리)
- [x] `read_time` 일부 상향(삽입 분량 반영)

### 비고

- `cu` + `YYMMDDHHmm` 편집 추적은 [A_GRADE_POST_CHECKLIST.md](./A_GRADE_POST_CHECKLIST.md) §5 및 `scripts/apply-cu-timestamp.mjs` 참고.

---

<!-- 새 항목은 위에 날짜 섹션을 추가 (최신이 위). -->
