---
title: "LangGraph 입문 — 그래프로 AI 흐름을 그리다"
date: 2026-04-01
category: orchestration
tags: ["LangGraph", "그래프", "상태머신", "오케스트레이션"]
description: "LangGraph는 AI 워크플로우를 노드와 엣지로 표현하는 프레임워크다. 왜 그래프가 AI 오케스트레이션에 적합한지, 어떻게 설계하는지 정리한다."
read_time: 8
difficulty: "intermediate"
draft: false
thumbnail: ""
---

## 한줄 요약
LangGraph는 AI 에이전트의 흐름을 방향 그래프(노드 + 엣지)로 표현해서, 복잡한 분기와 루프를 명확하게 설계할 수 있게 한다.

## 본문

### 왜 그래프인가

AI 에이전트의 행동은 선형이 아니다. 조건에 따라 분기하고, 실패하면 다시 시도하고, 특정 조건이 될 때까지 반복한다.

이걸 일반 코드로 표현하면:

```python
# 단순해 보이지만 실제로는 엉키기 쉬움
result = step1()
if result.needs_more_info:
    result = ask_clarification()
    result = step1_again(result)
elif result.failed:
    result = fallback_step()

result2 = step2(result)
while not result2.is_complete:
    result2 = step2_retry(result2)
    if retry_count > 3:
        break
```

복잡해질수록 if-else가 엉키고, 어디서 실패했는지 추적하기 어렵다.

LangGraph는 이걸 그래프로 표현한다:

```
[시작] → [단계1] → {완료?}
                    ├─ YES → [단계2] → [끝]
                    ├─ 정보필요 → [명확화요청] → [단계1]
                    └─ 실패 → [폴백] → [단계2]
```

흐름이 시각적으로 명확하고, 각 노드가 독립적으로 테스트 가능하다.

---

### LangGraph의 핵심 개념

**노드 (Node)**
그래프의 각 단계다. 보통 하나의 AI 호출 또는 도구 실행이다.

```python
from langgraph.graph import StateGraph
from typing import TypedDict

class MedicalState(TypedDict):
    patient_id: str
    symptoms: list[str]
    lab_results: dict
    diagnosis: str
    treatment_plan: str

def collect_patient_data(state: MedicalState) -> MedicalState:
    """노드 1: 환자 데이터 수집"""
    lab_results = emr_api.get_labs(state["patient_id"])
    return {**state, "lab_results": lab_results}

def generate_diagnosis(state: MedicalState) -> MedicalState:
    """노드 2: AI 감별진단"""
    diagnosis = llm.invoke(
        f"증상: {state['symptoms']}\n검사: {state['lab_results']}\n감별진단:"
    )
    return {**state, "diagnosis": diagnosis}
```

**엣지 (Edge)**
노드 간 연결이다. 단순 연결(항상 이동)과 조건부 연결(상태에 따라 분기)이 있다.

```python
def route_after_diagnosis(state: MedicalState) -> str:
    """조건부 엣지: 진단 결과에 따라 다음 노드 결정"""
    if "응급" in state["diagnosis"]:
        return "emergency_protocol"
    elif state["diagnosis"] == "불확실":
        return "request_more_tests"
    else:
        return "create_treatment_plan"
```

**상태 (State)**
그래프 전체를 흐르는 데이터 구조다. 각 노드는 상태를 받고, 수정된 상태를 반환한다.

---

### 실제 의료 워크플로우 구현

```python
from langgraph.graph import StateGraph, END

# 그래프 생성
workflow = StateGraph(MedicalState)

# 노드 추가
workflow.add_node("collect_data", collect_patient_data)
workflow.add_node("diagnose", generate_diagnosis)
workflow.add_node("emergency", handle_emergency)
workflow.add_node("more_tests", request_additional_tests)
workflow.add_node("treatment", create_treatment_plan)

# 엣지 추가
workflow.set_entry_point("collect_data")
workflow.add_edge("collect_data", "diagnose")
workflow.add_conditional_edges(
    "diagnose",
    route_after_diagnosis,
    {
        "emergency_protocol": "emergency",
        "request_more_tests": "more_tests",
        "create_treatment_plan": "treatment"
    }
)
workflow.add_edge("more_tests", "diagnose")  # 루프: 추가 검사 후 재진단
workflow.add_edge("emergency", END)
workflow.add_edge("treatment", END)

# 컴파일
app = workflow.compile()

# 실행
result = app.invoke({
    "patient_id": "P12345",
    "symptoms": ["흉통", "호흡곤란"],
    "lab_results": {},
    "diagnosis": "",
    "treatment_plan": ""
})
```

---

### LangGraph의 킬러 기능: 체크포인트

긴 작업 중에 중단됐다가 재개할 수 있다. 실패한 노드부터 다시 시작한다.

```python
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()
app = workflow.compile(checkpointer=checkpointer)

# 스레드 ID로 실행 상태 유지
config = {"configurable": {"thread_id": "patient_P12345_session_1"}}

# 처음 실행
result = app.invoke(initial_state, config=config)

# 3단계에서 실패했다면, 나중에 3단계부터 재개
result = app.invoke(None, config=config)  # 이전 상태에서 계속
```

의료 AI처럼 긴 작업에서 특히 중요하다. 도중에 추가 정보가 필요하거나 의사의 확인이 필요할 때 멈췄다가 재개할 수 있다.

---

### LangGraph가 잘 맞는 경우

- 흐름에 분기와 루프가 많은 경우
- 중간에 사람의 확인(Human-in-the-loop)이 필요한 경우
- 긴 작업을 재개 가능하게 만들어야 하는 경우
- 각 단계를 독립적으로 테스트하고 싶은 경우

**잘 안 맞는 경우**
- 간단한 선형 파이프라인 (오버엔지니어링)
- 에이전트 간 자유로운 대화가 필요한 경우 (CrewAI가 낫다)
