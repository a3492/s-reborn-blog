import { readFileSync, writeFileSync } from 'fs';

const BASE = "src/content/blog/orchestration";

const RELATED = {
  "what-is-orchestration": [
    ["[AI 워크플로우 패턴 5가지](/blog/orchestration/workflow-patterns)", "오케스트레이션 설계에 쓰이는 5가지 패턴 비교"],
    ["[오케스트레이션 vs 에이전트](/blog/orchestration/orchestration-vs-agents)", "단일 에이전트와 멀티 에이전트, 무엇을 먼저 쓸까"],
    ["[LangGraph 입문](/blog/orchestration/langgraph-intro)", "오케스트레이션 구현의 대표 도구"],
    ["[의료 오케스트레이션 케이스 스터디](/blog/orchestration/medical-orchestration-case-study)", "실제 회진 준비 시스템에 적용한 사례"],
  ],
  "workflow-patterns": [
    ["[오케스트레이션이란](/blog/orchestration/what-is-orchestration)", "패턴 선택 전에 알아야 할 기초 개념"],
    ["[병렬 실행](/blog/orchestration/parallel-execution)", "팬아웃/팬인 패턴을 실제로 적용하는 방법"],
    ["[LangGraph 입문](/blog/orchestration/langgraph-intro)", "패턴을 그래프로 구현하는 도구"],
    ["[태스크 분해](/blog/orchestration/task-decomposition)", "패턴의 기반이 되는 태스크 나누는 방법"],
  ],
  "langgraph-intro": [
    ["[오케스트레이션이란](/blog/orchestration/what-is-orchestration)", "LangGraph가 해결하려는 문제의 배경"],
    ["[상태 관리](/blog/orchestration/state-management)", "LangGraph의 핵심 개념인 상태 머신 원리"],
    ["[ReAct 패턴](/blog/orchestration/react-pattern)", "LangGraph로 구현하는 생각-행동 루프"],
    ["[CrewAI 입문](/blog/orchestration/crewai-intro)", "그래프 대신 역할로 팀을 구성하는 다른 방식"],
  ],
  "crewai-intro": [
    ["[LangGraph 입문](/blog/orchestration/langgraph-intro)", "그래프 기반의 다른 오케스트레이션 방식"],
    ["[AutoGen 입문](/blog/orchestration/autogen-intro)", "역할 대신 자유 대화로 협력하는 세 번째 방식"],
    ["[오케스트레이션 vs 에이전트](/blog/orchestration/orchestration-vs-agents)", "멀티 에이전트가 필요한 시점 판단"],
    ["[의료 오케스트레이션 케이스 스터디](/blog/orchestration/medical-orchestration-case-study)", "역할 기반 팀이 실제로 작동하는 사례"],
  ],
  "autogen-intro": [
    ["[LangGraph 입문](/blog/orchestration/langgraph-intro)", "그래프로 흐름을 고정하는 방식과 비교"],
    ["[CrewAI 입문](/blog/orchestration/crewai-intro)", "역할로 팀을 구성하는 방식과 비교"],
    ["[에이전트 간 통신](/blog/orchestration/multi-agent-communication)", "대화 기반 통신의 원리와 설계"],
    ["[오케스트레이션 vs 에이전트](/blog/orchestration/orchestration-vs-agents)", "LangGraph, CrewAI, AutoGen 중 무엇을 선택할까"],
  ],
  "react-pattern": [
    ["[태스크 분해](/blog/orchestration/task-decomposition)", "루프를 돌기 전에 태스크를 나누는 방법"],
    ["[LangGraph 입문](/blog/orchestration/langgraph-intro)", "ReAct 루프를 그래프로 구현하는 방법"],
    ["[오케스트레이션 디버깅](/blog/orchestration/orchestration-debugging)", "ReAct 루프가 꼬였을 때 원인 찾는 법"],
    ["[에이전틱 RAG](/blog/orchestration/agentic-rag)", "ReAct와 반복 검색의 조합"],
  ],
  "human-in-the-loop": [
    ["[오케스트레이션 보안](/blog/orchestration/orchestration-security)", "사람 검증이 없을 때 생기는 보안 위협"],
    ["[상태 관리](/blog/orchestration/state-management)", "사람 개입을 기다리는 동안 상태를 저장하는 방법"],
    ["[오케스트레이션 테스팅](/blog/orchestration/orchestration-testing)", "사람 개입 흐름을 포함한 테스트 설계"],
    ["[의료 오케스트레이션 케이스 스터디](/blog/orchestration/medical-orchestration-case-study)", "의사 최종 승인이 포함된 실제 설계"],
  ],
  "parallel-execution": [
    ["[태스크 분해](/blog/orchestration/task-decomposition)", "병렬 실행을 위해 태스크를 나누는 방법"],
    ["[상태 관리](/blog/orchestration/state-management)", "병렬로 실행할 때 상태 충돌을 막는 설계"],
    ["[AI 워크플로우 패턴 5가지](/blog/orchestration/workflow-patterns)", "팬아웃/팬인이 포함된 패턴 전체 지도"],
    ["[비용 최적화](/blog/orchestration/orchestration-cost-optimization)", "병렬화가 비용에 미치는 영향"],
  ],
  "state-management": [
    ["[병렬 실행](/blog/orchestration/parallel-execution)", "병렬 실행 시 상태 충돌이 발생하는 이유"],
    ["[Human-in-the-Loop](/blog/orchestration/human-in-the-loop)", "사람 개입 전후를 체크포인트로 저장하는 방법"],
    ["[컨텍스트 윈도우 관리](/blog/orchestration/context-window-management)", "상태 저장과 컨텍스트 전달의 차이"],
    ["[LangGraph 입문](/blog/orchestration/langgraph-intro)", "상태 머신을 그래프로 구현하는 방법"],
  ],
  "context-window-management": [
    ["[비용 최적화](/blog/orchestration/orchestration-cost-optimization)", "컨텍스트 길이가 비용에 미치는 영향"],
    ["[에이전트 간 통신](/blog/orchestration/multi-agent-communication)", "에이전트 간 선택적 정보 전달 방식"],
    ["[에이전틱 RAG](/blog/orchestration/agentic-rag)", "컨텍스트 대신 검색으로 필요한 정보를 가져오는 방법"],
    ["[상태 관리](/blog/orchestration/state-management)", "컨텍스트 전달 대신 상태 저장소를 쓰는 방법"],
  ],
  "task-decomposition": [
    ["[ReAct 패턴](/blog/orchestration/react-pattern)", "실행 중 동적으로 태스크를 나누는 패턴"],
    ["[병렬 실행](/blog/orchestration/parallel-execution)", "분해한 태스크를 동시에 실행하는 방법"],
    ["[슈퍼바이저 패턴](/blog/orchestration/supervisor-pattern)", "분해된 태스크를 에이전트에 분배하는 구조"],
    ["[AI 워크플로우 패턴 5가지](/blog/orchestration/workflow-patterns)", "태스크 분해가 포함된 패턴 전체 지도"],
  ],
  "supervisor-pattern": [
    ["[AutoGen 입문](/blog/orchestration/autogen-intro)", "계층 구조 대신 수평 대화로 협력하는 방식"],
    ["[CrewAI 입문](/blog/orchestration/crewai-intro)", "역할 기반으로 팀을 구성하는 다른 방법"],
    ["[태스크 분해](/blog/orchestration/task-decomposition)", "슈퍼바이저가 수행하는 태스크 분배의 원리"],
    ["[오케스트레이션 vs 에이전트](/blog/orchestration/orchestration-vs-agents)", "슈퍼바이저 패턴이 필요한 시점"],
  ],
  "multi-agent-communication": [
    ["[AutoGen 입문](/blog/orchestration/autogen-intro)", "대화 기반 통신을 극단까지 밀어붙인 방식"],
    ["[오케스트레이션 보안](/blog/orchestration/orchestration-security)", "에이전트 간 통신에서 발생하는 보안 위협"],
    ["[상태 관리](/blog/orchestration/state-management)", "공유 상태(블랙보드) 방식의 상세 설계"],
    ["[컨텍스트 윈도우 관리](/blog/orchestration/context-window-management)", "통신 시 컨텍스트가 쌓이는 문제"],
  ],
  "orchestration-vs-agents": [
    ["[오케스트레이션이란](/blog/orchestration/what-is-orchestration)", "오케스트레이션의 기본 개념"],
    ["[ReAct 패턴](/blog/orchestration/react-pattern)", "단일 에이전트로 시작할 때의 기본 패턴"],
    ["[슈퍼바이저 패턴](/blog/orchestration/supervisor-pattern)", "멀티 에이전트로 확장하는 대표 구조"],
    ["[AI 워크플로우 패턴 5가지](/blog/orchestration/workflow-patterns)", "상황별 설계 선택 기준"],
  ],
  "medical-orchestration-case-study": [
    ["[오케스트레이션이란](/blog/orchestration/what-is-orchestration)", "회진 시스템 설계의 기초 개념"],
    ["[Human-in-the-Loop](/blog/orchestration/human-in-the-loop)", "의사 최종 승인 흐름 설계 원칙"],
    ["[오케스트레이션 테스팅](/blog/orchestration/orchestration-testing)", "케이스 시나리오 테스트 방법"],
    ["[오케스트레이션 보안](/blog/orchestration/orchestration-security)", "의료 데이터와 처방 시스템 보안"],
  ],
  "orchestration-debugging": [
    ["[오케스트레이션 모니터링](/blog/orchestration/orchestration-monitoring)", "디버깅 이후 상시 모니터링 체계"],
    ["[오케스트레이션 테스팅](/blog/orchestration/orchestration-testing)", "사전 테스트로 버그를 배포 전에 잡는 방법"],
    ["[상태 관리](/blog/orchestration/state-management)", "상태 추적으로 어느 단계에서 문제가 생겼는지 확인"],
    ["[ReAct 패턴](/blog/orchestration/react-pattern)", "ReAct 루프가 꼬이는 대표 버그 패턴"],
  ],
  "orchestration-monitoring": [
    ["[오케스트레이션 디버깅](/blog/orchestration/orchestration-debugging)", "모니터링에서 감지한 문제의 원인 추적"],
    ["[오케스트레이션 테스팅](/blog/orchestration/orchestration-testing)", "배포 전 테스트로 사전 예방"],
    ["[비용 최적화](/blog/orchestration/orchestration-cost-optimization)", "비용도 모니터링의 핵심 지표"],
    ["[오케스트레이션 보안](/blog/orchestration/orchestration-security)", "보안 사고를 모니터링으로 실시간 감지"],
  ],
  "orchestration-security": [
    ["[에이전트 간 통신](/blog/orchestration/multi-agent-communication)", "에이전트 간 통신에서 생기는 공격 벡터"],
    ["[오케스트레이션 모니터링](/blog/orchestration/orchestration-monitoring)", "보안 사고를 실시간으로 감지하는 방법"],
    ["[Human-in-the-Loop](/blog/orchestration/human-in-the-loop)", "사람 검증으로 AI 오작동 차단"],
    ["[오케스트레이션 vs 에이전트](/blog/orchestration/orchestration-vs-agents)", "에이전트 권한을 최소화하는 설계"],
  ],
  "orchestration-testing": [
    ["[오케스트레이션 모니터링](/blog/orchestration/orchestration-monitoring)", "테스트 이후 배포 후 품질 추적"],
    ["[오케스트레이션 디버깅](/blog/orchestration/orchestration-debugging)", "테스트에서 발견한 버그의 원인 추적"],
    ["[Human-in-the-Loop](/blog/orchestration/human-in-the-loop)", "사람 개입 흐름을 포함한 테스트 설계"],
    ["[의료 오케스트레이션 케이스 스터디](/blog/orchestration/medical-orchestration-case-study)", "실제 케이스 시나리오 테스트 예시"],
  ],
  "agentic-rag": [
    ["[컨텍스트 윈도우 관리](/blog/orchestration/context-window-management)", "RAG로 컨텍스트 부담을 줄이는 원리"],
    ["[ReAct 패턴](/blog/orchestration/react-pattern)", "반복 검색과 ReAct 루프의 조합"],
    ["[비용 최적화](/blog/orchestration/orchestration-cost-optimization)", "검색 횟수별 비용 차이와 트레이드오프"],
    ["[Human-in-the-Loop](/blog/orchestration/human-in-the-loop)", "검색 결과를 의사가 검토하는 설계"],
  ],
  "orchestration-cost-optimization": [
    ["[오케스트레이션 모니터링](/blog/orchestration/orchestration-monitoring)", "비용 추이를 실시간으로 추적하는 방법"],
    ["[컨텍스트 윈도우 관리](/blog/orchestration/context-window-management)", "컨텍스트 길이 줄여 비용 절감"],
    ["[에이전틱 RAG](/blog/orchestration/agentic-rag)", "RAG 방식별 비용과 정확도 트레이드오프"],
    ["[오케스트레이션 vs 에이전트](/blog/orchestration/orchestration-vs-agents)", "단순화로 비용 절감하는 판단 기준"],
  ],
};

function buildSection(slug) {
  const links = RELATED[slug];
  const linkLines = links.map(([link, desc]) => `- ${link} — ${desc}`).join('\n');
  return `---

## 더 알고 싶다면

🔗 관련 글
${linkLines}

[← 오케스트레이션 시리즈 전체 보기](/blog/category/orchestration)
`;
}

function stripOldLinks(content) {
  // Remove: --- followed by > blockquotes at end
  content = content.replace(/\n---\n\n> [\s\S]*$/, '');
  // Remove: --- followed by ### 다음 회의 at end
  content = content.replace(/\n---\n\n### 다음 회의[\s\S]*$/, '');
  // Remove: ### 더 읽기 section at end
  content = content.replace(/\n\n### 더 읽기\n\n>[\s\S]*$/, '');
  // Remove: existing 더 알고 싶다면 section if any
  content = content.replace(/\n---\n\n## 더 알고 싶다면[\s\S]*$/, '');
  return content.trimEnd();
}

for (const [slug, links] of Object.entries(RELATED)) {
  const filepath = `${BASE}/${slug}.md`;
  let content = readFileSync(filepath, 'utf-8');
  const stripped = stripOldLinks(content);
  const newContent = stripped + '\n\n' + buildSection(slug) + '\n';
  writeFileSync(filepath, newContent, 'utf-8');
  console.log(`OK ${slug}.md`);
}

console.log('\nALL DONE');
