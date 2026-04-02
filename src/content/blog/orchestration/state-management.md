---
title: "상태 관리 — 오케스트레이션의 기억 장치"
date: 2026-04-01
category: orchestration
tags: ["cu2604021138", "상태관리", "State", "오케스트레이션", "체크포인트"]
description: "RoundPrep 제6화. 멈췄다가 이어할 수 없으면 병원 아침에는 쓸 수 없다."
read_time: 13
difficulty: "intermediate"
draft: false
type: "guide"
series: "RoundPrep — 회진 브리핑을 만든다"
series_order: 6
thumbnail: ""
key_takeaways:
  - "여러 단계를 거치는 AI 워크플로우에서 상태를 잘못 관리하면 데이터가 사라지거나 충돌이 생긴다. 상태 설계 원칙과 패턴을 정리한다."
  - "이 글은 설계 관점 정리이며, 프로덕션 도입 전 보안·비용·감사 요구를 별도 검토한다."
  - "태그 cu2604021138: Cursor 초안 — 프레임워크·API·병원 정책은 공식 문서를 본다."
---
> RoundPrep 제6화. 스테이징에서 어제 실행한 run과 오늘 실행한 run이 엇갈리며, 같은 환자 번호에 다른 요약이 붙었다. 상태를 안 박아 두면 소품 위치가 매번 바뀌는 연극과 같다.



## 한줄 요약
상태는 오케스트레이션 워크플로우가 여러 단계를 거치는 동안 유지되는 공유 기억이다 — 잘 설계된 상태가 안정적인 시스템을 만든다.

### 테제

**상태 없는 오케스트레이션은 재시도할 때마다 처음부터 다시 도는 연극이다.**

### 스테이크

야간 요약이 중간에 끊기면, 교수님 화면에는 **반쪽 요약**이 뜬다. 신뢰가 한 번에 깨진다.

### 전환점 — RoundPrep 메모

체크포인트 없이 LLM만 다시 돌리자 **이전 단계에서 이미 읽은 Lab**을 또 읽어 API 비용만 두 배가 됐다.


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

입력 상태 (Input State)
워크플로우 시작 시 주어지는 초기 데이터.

```python
initial_state = {
    "patient_id": "P12345",
    "request": "치료 계획 수립",
    "requesting_physician": "Dr. Kim"
}
```

작업 상태 (Working State)
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

메타 상태 (Meta State)
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

1. 불변 입력, 축적 작업 상태

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

2. 타입 명확화

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

3. 체크포인트 전략

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


---

### 다음 회의 한 줄

**혜준:** “중간 산출물은 **스키마**로 저장. 재시도는 실패한 노드부터.”

### 다음 화

상태가 쌓이면 모델은 **다음에 무엇을 할지**를 말로 끌고 가야 한다 — [ReAct 패턴](/blog/orchestration/react-pattern/)


*편집 초안(cu2604021138). 프레임워크·API·임상 규정은 발행일 이후 바뀔 수 있으니 공식 문서와 병원 정책을 기준으로 확인한다.*
