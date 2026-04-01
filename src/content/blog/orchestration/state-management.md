---
title: "상태 관리 — 오케스트레이션의 기억 장치"
date: 2026-04-01
category: orchestration
tags: ["상태관리", "State", "오케스트레이션", "체크포인트"]
description: "여러 단계를 거치는 AI 워크플로우에서 상태를 잘못 관리하면 데이터가 사라지거나 충돌이 생긴다. 상태 설계 원칙과 패턴을 정리한다."
read_time: 7
difficulty: "intermediate"
draft: false
thumbnail: ""
---

## 한줄 요약
상태는 오케스트레이션 워크플로우가 여러 단계를 거치는 동안 유지되는 공유 기억이다 — 잘 설계된 상태가 안정적인 시스템을 만든다.

## 본문

### 상태가 없으면 어떻게 되는가

10단계 워크플로우가 있다. 각 단계가 독립적으로 실행되고, 앞 단계의 결과를 다음 단계가 받아야 한다.

상태 관리가 없으면:
- 각 단계가 이전 단계의 결과를 어디서 가져오는지 모른다
- 5단계에서 실패하면 1단계부터 다시 시작해야 한다
- 병렬 실행 중 두 에이전트가 같은 데이터를 동시에 수정하면 충돌이 생긴다
- 워크플로우가 완료된 후 어떤 결정이 왜 이루어졌는지 추적할 수 없다

---

### 상태의 3가지 종류

**입력 상태 (Input State)**
워크플로우 시작 시 주어지는 초기 데이터.

```python
initial_state = {
    "patient_id": "P12345",
    "request": "치료 계획 수립",
    "requesting_physician": "Dr. Kim"
}
```

**작업 상태 (Working State)**
워크플로우 진행 중 각 노드가 추가하거나 수정하는 데이터.

```python
working_state = {
    # 수집 단계가 추가
    "emr_data": {...},
    "lab_results": {...},

    # 분석 단계가 추가
    "diagnoses": [...],
    "risk_scores": {...},

    # 계획 단계가 추가
    "treatment_options": [...],
    "recommended_plan": "..."
}
```

**메타 상태 (Meta State)**
워크플로우 자체의 실행 정보.

```python
meta_state = {
    "current_step": "generate_diagnosis",
    "completed_steps": ["collect_emr", "collect_labs"],
    "failed_steps": [],
    "start_time": "2026-04-01T09:00:00",
    "retry_counts": {"collect_labs": 1}
}
```

---

### 상태 스키마 설계 원칙

**1. 불변 입력, 축적 작업 상태**

입력은 변경하지 않는다. 각 단계는 기존 상태를 덮어쓰지 않고 새 필드를 추가한다.

```python
# 나쁜 방식: 원본 데이터를 덮어씀
def process_labs(state):
    state["data"] = transform(state["data"])  # 원본 소실
    return state

# 좋은 방식: 새 필드 추가
def process_labs(state):
    return {
        **state,
        "processed_labs": transform(state["raw_labs"])  # 원본 유지
    }
```

**2. 타입 명확화**

Python TypedDict나 Pydantic으로 상태 스키마를 정의한다. 어떤 필드가 언제 생기는지 명확하게.

```python
from typing import TypedDict, Optional
from datetime import datetime

class ClinicalWorkflowState(TypedDict):
    # 입력 (항상 있음)
    patient_id: str
    physician_id: str

    # 수집 단계 결과 (수집 후 생김)
    emr_summary: Optional[str]
    lab_results: Optional[dict]
    current_medications: Optional[list]

    # 분석 단계 결과
    differential_diagnosis: Optional[list]
    risk_assessment: Optional[dict]

    # 계획 단계 결과
    treatment_plan: Optional[str]
    follow_up_schedule: Optional[str]

    # 메타데이터
    created_at: datetime
    last_updated: datetime
    status: str  # "in_progress" | "completed" | "failed"
```

**3. 체크포인트 전략**

모든 상태 변화를 체크포인트로 저장하면 비용이 크다. 중요한 지점만 저장한다.

```python
CHECKPOINT_AT = [
    "after_data_collection",    # 수집 완료 후
    "after_diagnosis",          # 진단 완료 후
    "after_human_review",       # 의사 검토 후
    "workflow_completed"        # 최종 완료
]
```

---

### 병렬 실행과 상태 충돌

여러 에이전트가 동시에 같은 상태를 수정하면 문제가 생긴다.

```
에이전트 A: state["analysis"] = "결과 A"
에이전트 B: state["analysis"] = "결과 B"  ← 충돌!
```

해결책 1: 필드 분리

```python
# 각 에이전트가 자기 필드만 수정
{
    "lab_analysis": ...,      # 검사 에이전트만 수정
    "imaging_analysis": ...,  # 영상 에이전트만 수정
    "medication_review": ..., # 약사 에이전트만 수정
}
```

해결책 2: 리듀서 패턴 (LangGraph)

```python
from typing import Annotated
import operator

class State(TypedDict):
    # 여러 에이전트가 추가하는 리스트: 자동으로 합쳐짐
    findings: Annotated[list, operator.add]
```

---

### 장기 실행 워크플로우의 상태

의료 워크플로우는 수 분에서 수 시간이 걸릴 수 있다. 심지어 의사의 확인을 기다리는 동안 며칠이 될 수도 있다.

이 경우 상태를 영속적 저장소에 보관해야 한다.

```python
from langgraph.checkpoint.postgres import PostgresSaver

# PostgreSQL에 상태 저장
saver = PostgresSaver(connection_string="postgresql://...")
app = workflow.compile(checkpointer=saver)

# 워크플로우 시작
thread_id = f"patient_{patient_id}_{datetime.now().isoformat()}"
app.invoke(initial_state, config={"configurable": {"thread_id": thread_id}})

# 다음 날 의사가 승인 후 재개
app.invoke({"approved": True}, config={"configurable": {"thread_id": thread_id}})
```

상태가 DB에 저장되어 있어서 서버가 재시작되거나 몇 시간이 지나도 정확히 멈춘 지점부터 재개한다.
