---
title: "멀티에이전트 시스템 — 여러 AI가 협력하는 의료 팀"
date: 2026-03-31
category: ai-agents
description: "이 글을 읽어보세요."
thumbnail: ""
draft: false
---

## 한줄 요약

단일 에이전트가 모든 것을 처리하는 데는 한계가 있다. 멀티에이전트 시스템은 Orchestrator가 작업을 분배하고 전문 에이전트들이 병렬로 처리하는 구조로, 의료처럼 다학제 협업이 필요한 영역에 적합하다.

---

## 단일 에이전트의 한계

하나의 에이전트에 모든 것을 맡기면:

- **컨텍스트 초과** — 진단 + 약물 + 문서 작업을 동시에 처리하면 토큰 한계에 금방 도달한다
- **전문성 희석** — "모든 것을 아는 에이전트"는 각 분야에서 깊이가 부족해진다
- **단일 실패점** — 에이전트 하나가 오류를 내면 전체 워크플로우가 멈춘다
- **병렬 처리 불가** — 순차 실행으로 인한 속도 저하

---

## Orchestrator + Specialist 패턴

```
[Orchestrator Agent]
사용자 요청을 받아 작업을 분배하고 최종 결과를 취합

        ↓             ↓             ↓
[진단 에이전트]  [약물 에이전트]  [문서 에이전트]
감별진단 생성    상호작용 확인    SOAP 노트 작성
가이드라인 검색  용량 계산       퇴원 요약 작성
```

Orchestrator는 지시만 내리고, 각 Specialist는 자기 도메인만 처리한다.

---

## Python 구현 — CrewAI 스타일

```python
from crewai import Agent, Task, Crew, Process

# Specialist 에이전트 정의
diagnostic_agent = Agent(
    role="임상 진단 전문가",
    goal="환자 증상과 병력을 분석하여 감별진단 목록을 작성한다",
    backstory="내과 전문의 수준의 진단 능력을 갖춘 AI 에이전트",
    tools=[search_guideline_tool, generate_ddx_tool],
    verbose=True
)

pharmacology_agent = Agent(
    role="임상 약학 전문가",
    goal="약물 상호작용 확인 및 용량 조정 권고를 제공한다",
    backstory="약물 데이터베이스와 신기능/간기능 기반 용량 조정 전문 에이전트",
    tools=[check_interaction_tool, calculate_dose_tool],
    verbose=True
)

documentation_agent = Agent(
    role="의무기록 전문가",
    goal="진료 정보를 SOAP 형식으로 구조화하여 문서를 작성한다",
    backstory="EMR 기록 작성 및 의학 문서화 전문 에이전트",
    tools=[write_soap_tool, format_discharge_summary_tool],
    verbose=True
)

# Task 정의
diagnose_task = Task(
    description="환자 {patient_info}를 분석하여 감별진단 3가지를 제시하라",
    expected_output="우선순위가 매겨진 감별진단 목록과 근거",
    agent=diagnostic_agent
)

medication_task = Task(
    description="진단 결과를 바탕으로 처방 초안과 상호작용 확인 결과를 제공하라",
    expected_output="처방 초안 + 상호작용 경고 목록",
    agent=pharmacology_agent,
    context=[diagnose_task]  # 진단 결과를 입력으로 받음
)

document_task = Task(
    description="진단과 처방 정보로 SOAP 노트를 작성하라",
    expected_output="완성된 SOAP 노트 초안",
    agent=documentation_agent,
    context=[diagnose_task, medication_task]
)

# Crew 실행
medical_crew = Crew(
    agents=[diagnostic_agent, pharmacology_agent, documentation_agent],
    tasks=[diagnose_task, medication_task, document_task],
    process=Process.sequential  # 또는 Process.hierarchical
)

result = medical_crew.kickoff(inputs={"patient_info": patient_data})
```

---

## 주요 멀티에이전트 프레임워크 비교

| 프레임워크 | 특징 | 의료 적합성 |
|------------|------|-------------|
| **CrewAI** | 역할 기반, 직관적 API | 높음 — 다학제팀 모델링에 적합 |
| **AutoGen** | Microsoft, 에이전트 대화 자동화 | 중간 — 연구용으로 활발 |
| **LangGraph** | 그래프 기반 상태 머신 | 높음 — 복잡한 분기 로직 구현 가능 |
| **Claude Agent SDK** | Anthropic 공식, Tool Use 중심 | 높음 — Claude 사용 시 최적 |

---

## 에이전트 간 통신 프로토콜

에이전트들은 구조화된 형식으로 메시지를 주고받아야 한다.

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class AgentMessage:
    sender: str          # "diagnostic_agent"
    receiver: str        # "pharmacology_agent"
    task_id: str         # 추적용 ID
    content: dict        # 실제 데이터
    confidence: float    # 0.0 ~ 1.0
    requires_review: bool = False  # 사람 검토 필요 여부

# 진단 에이전트 → 약물 에이전트
msg = AgentMessage(
    sender="diagnostic_agent",
    receiver="pharmacology_agent",
    task_id="visit_20260331_001",
    content={
        "primary_diagnosis": "Type 2 Diabetes Mellitus",
        "icd10": "E11.9",
        "suggested_medications": ["metformin", "empagliflozin"]
    },
    confidence=0.85
)

# 확신도 낮으면 사람 검토 요청
if msg.confidence < 0.7:
    msg.requires_review = True
    escalate_to_physician(msg)
```

---

## 의료 멀티에이전트의 주의사항 — 책임 소재

멀티에이전트에서 가장 중요한 윤리적 문제는 **책임 소재**다.

- 진단 에이전트가 틀린 진단을 내리고, 약물 에이전트가 그것을 기반으로 처방 초안을 작성했다면 책임은 누구에게 있는가?
- 법적 답은 명확하다: **처방에 서명한 의사**가 책임을 진다
- 따라서 에이전트의 모든 출력에는 "AI 초안 — 의사 검토 필요" 레이블이 붙어야 한다
- 각 에이전트의 행동은 감사 로그에 기록되어야 한다

---

## 핵심 정리

- 단일 에이전트의 컨텍스트 한계, 전문성 희석 문제를 멀티에이전트로 해결한다
- Orchestrator는 지시·조율만, Specialist는 자기 도메인에만 집중하는 구조가 효율적이다
- CrewAI, LangGraph는 의료 워크플로우 모델링에 적합한 프레임워크다
- 에이전트 간 메시지에는 확신도(confidence)와 검토 필요 플래그를 포함해야 한다
- 멀티에이전트 환경에서도 최종 의료 책임은 의사에게 있다

## 관련 글

- [의료 워크플로우 에이전트 설계 — 외래 보조 AI 만들기](/blog/ai-agents/medical-workflow-agent)
- [에이전트 계획 패턴 — ReAct, CoT, Tree-of-Thought](/blog/ai-agents/agent-planning-patterns)
- [의료 에이전트 안전 설계 — AI가 실수해도 괜찮은 시스템](/blog/ai-agents/agent-safety-medical)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
