---
title: "CrewAI — 역할을 주면 AI가 팀처럼 일한다"
date: 2026-04-01
category: orchestration
tags: ["CrewAI", "멀티에이전트", "역할기반", "AI팀"]
description: "CrewAI는 AI에게 역할·목표·배경을 부여해서 팀처럼 협업시키는 프레임워크다. 의료 팀 시뮬레이션처럼 다양한 전문성이 필요한 작업에 강하다."
read_time: 7
difficulty: "intermediate"
draft: false
thumbnail: ""
---

## 한줄 요약
CrewAI는 AI에게 "당신은 X 전문가입니다. 목표는 Y입니다"라고 역할을 주면, 여러 AI가 팀처럼 협력해서 결과를 만든다.

## 본문

### 역할 기반 오케스트레이션이란

사람도 팀으로 일할 때 역할을 나눈다. 의료팀이라면:
- 주치의: 전체 치료 방향 결정
- 약사: 약물 검토 및 상호작용 확인
- 간호사: 환자 상태 모니터링
- 행정: 보험 청구 및 문서화

각자 전문성이 다르고, 각자의 관점에서 기여한다. CrewAI는 이 구조를 AI에 그대로 옮긴다.

---

### CrewAI의 4가지 핵심 요소

**1. Agent (에이전트)**
역할, 목표, 배경 이야기를 가진 AI 행위자다.

```python
from crewai import Agent

attending_physician = Agent(
    role="주치의 AI",
    goal="환자의 전반적인 치료 방향을 결정하고 팀을 조율한다",
    backstory="""
    당신은 10년 경력의 내과 전문의입니다.
    복잡한 다약제 환자 관리에 전문성이 있습니다.
    항상 근거 중심 의학(EBM)을 따릅니다.
    """,
    tools=[emr_tool, guideline_search_tool],
    verbose=True
)

pharmacist = Agent(
    role="임상약사 AI",
    goal="약물 안전성과 상호작용을 검토한다",
    backstory="""
    당신은 병원 임상약사입니다.
    약물 상호작용, 신기능/간기능에 따른 용량 조절이 전문입니다.
    """,
    tools=[drug_interaction_tool, dosing_calculator_tool]
)
```

**2. Task (태스크)**
각 에이전트에게 배정되는 구체적인 작업이다.

```python
from crewai import Task

diagnosis_task = Task(
    description="""
    환자 ID {patient_id}의 최근 3개월 기록을 검토하여
    현재 상태에 대한 감별진단 목록을 작성하세요.
    우선순위 순으로 정렬하고 각각의 근거를 제시하세요.
    """,
    expected_output="JSON 형식의 감별진단 목록 (최소 3개, 최대 5개)",
    agent=attending_physician
)

medication_review_task = Task(
    description="""
    주치의가 제시한 치료 계획을 검토하세요.
    기존 복용 약물과의 상호작용을 확인하고
    신기능/간기능을 고려한 용량 적정성을 평가하세요.
    """,
    expected_output="약물 안전성 검토 보고서",
    agent=pharmacist,
    context=[diagnosis_task]  # 이전 태스크 결과를 컨텍스트로 받음
)
```

**3. Crew (팀)**
에이전트와 태스크를 묶어서 하나의 팀으로 만든다.

```python
from crewai import Crew, Process

medical_crew = Crew(
    agents=[attending_physician, pharmacist],
    tasks=[diagnosis_task, medication_review_task],
    process=Process.sequential,  # 순차 실행
    verbose=True
)

result = medical_crew.kickoff(inputs={"patient_id": "P12345"})
```

**4. Process (프로세스)**
태스크 실행 방식이다.

- `Process.sequential`: 태스크를 순서대로 실행
- `Process.hierarchical`: 매니저 에이전트가 다른 에이전트들을 지휘

---

### 의료 팀 시뮬레이션 전체 예시

```python
# 에이전트 4명
team = [
    attending_physician,  # 주치의
    pharmacist,           # 약사
    radiologist,          # 영상의학과 (X-ray 분석)
    case_manager          # 케이스 매니저 (퇴원 계획)
]

# 태스크 흐름
tasks = [
    Task("환자 초기 평가", agent=attending_physician),
    Task("영상 판독", agent=radiologist),
    Task("약물 검토", agent=pharmacist, context=[tasks[0]]),
    Task("최종 치료 계획 수립", agent=attending_physician,
         context=[tasks[0], tasks[1], tasks[2]]),
    Task("퇴원 계획 작성", agent=case_manager,
         context=[tasks[3]])
]
```

---

### LangGraph vs CrewAI

| | LangGraph | CrewAI |
|--|----------|--------|
| 핵심 추상화 | 그래프(노드+엣지) | 역할(Agent+Task) |
| 제어 방식 | 명시적 흐름 설계 | 역할·목표로 암묵적 조율 |
| 유연성 | 높음 (세밀한 제어) | 중간 (역할에 의존) |
| 학습 곡선 | 가파름 | 완만함 |
| 디버깅 | 쉬움 (흐름 명확) | 어려움 (에이전트 간 대화 추적) |
| 적합 사례 | 복잡한 분기·루프 | 팀 협업, 역할 기반 작업 |

의료 팀 협업처럼 "각 역할의 전문성이 중요한" 시나리오에선 CrewAI가 더 직관적이다. 복잡한 조건 분기와 상태 관리가 중요하면 LangGraph를 선택한다.

---

### 주의할 점

CrewAI의 에이전트는 서로 대화하면서 맥락을 공유한다. 이 대화 자체가 LLM 호출이다. 에이전트가 많을수록 비용이 급격히 증가한다.

실제 프로덕션에서는:
- 에이전트 수를 최소화한다 (3~5개)
- 각 에이전트의 역할을 명확하게 분리한다
- 불필요한 대화 루프를 줄인다
- 비용 모니터링을 반드시 설정한다
