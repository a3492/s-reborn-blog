---
title: "Human-in-the-Loop — AI가 혼자 결정하지 않는 설계"
date: 2026-04-01
category: orchestration
tags: ["Human-in-the-loop", "사람확인", "의료AI", "안전설계"]
description: "AI가 자율적으로 모든 결정을 내리게 하면 안 되는 순간이 있다. 언제 사람의 개입을 요청하고 어떻게 설계하는지 다룬다."
read_time: 7
difficulty: "intermediate"
draft: false
thumbnail: ""
---

## 한줄 요약
Human-in-the-Loop은 AI가 멈추고 사람의 판단을 기다리는 지점을 시스템에 의도적으로 설계하는 패턴이다.

## 본문

### 왜 사람이 루프 안에 있어야 하는가

AI 자율화의 환상이 있다. "AI가 처음부터 끝까지 다 하면 좋지 않을까?" 특히 반복적이고 시간이 걸리는 의료 문서 작업에서 이 유혹이 크다.

하지만 다음 상황을 생각해보자:
- AI가 잘못된 약물 용량을 결정하고 처방전을 자동 출력한다
- AI가 틀린 진단을 바탕으로 수술 일정을 잡는다
- AI가 잘못 해석한 영상 결과로 치료 방향을 바꾼다

자율화의 가치는 실수의 비용이 얼마나 큰지에 반비례한다. 의료에서 실수 비용은 매우 크다. 따라서 완전한 자율화보다 적절한 지점에서 사람이 개입하는 설계가 더 안전하고, 역설적으로 더 많이 채택된다.

---

### Human-in-the-Loop의 3가지 패턴

**1. 승인 게이트 (Approval Gate)**

중요한 행동 전에 AI가 멈추고 사람의 승인을 기다린다.

```python
def request_physician_approval(state: State) -> State:
    """AI가 생성한 치료 계획을 의사에게 제시하고 승인 요청"""

    # 의사에게 알림 발송
    notification_service.send({
        "to": state["requesting_physician"],
        "message": "AI 치료 계획 검토 요청",
        "plan": state["treatment_plan"],
        "patient": state["patient_id"],
        "review_url": f"/review/{state['workflow_id']}"
    })

    # 상태를 'pending_approval'로 변경하고 워크플로우 일시 정지
    return {**state, "status": "pending_approval"}
```

의사가 승인하면 워크플로우가 재개된다. 거부하면 AI가 수정안을 만든다.

**2. 수정 루프 (Correction Loop)**

AI가 결과를 제시하면, 사람이 수정하고, AI가 수정 내용을 반영해서 다시 생성한다.

```
AI → 초안 작성
  → 의사에게 제시
  → 의사: "3번 진단은 가능성 낮음, 제거해줘"
  → AI: 수정된 계획 재생성
  → 의사: 승인
  → 최종 확정
```

**3. 예외 에스컬레이션 (Exception Escalation)**

AI가 처리할 수 없거나 확신이 없는 케이스를 사람에게 넘긴다.

```python
def check_if_escalation_needed(state: State) -> str:
    """다음 노드를 결정: 자동 처리 vs 사람에게 넘김"""

    # AI 신뢰도가 낮은 경우
    if state["confidence_score"] < 0.7:
        return "escalate_to_human"

    # 희귀 질환 가능성이 있는 경우
    if "희귀" in state["diagnosis_flags"]:
        return "escalate_to_specialist"

    # 고위험 치료 옵션인 경우
    if state["treatment_risk_level"] == "high":
        return "escalate_to_human"

    return "auto_proceed"
```

---

### LangGraph에서 Human-in-the-Loop 구현

LangGraph는 `interrupt_before` 기능으로 특정 노드 전에 자동으로 워크플로우를 일시 정지할 수 있다.

```python
# 컴파일 시 어느 노드에서 멈출지 지정
app = workflow.compile(
    checkpointer=checkpointer,
    interrupt_before=["execute_treatment_plan"]  # 이 노드 전에 멈춤
)

# 실행: 'execute_treatment_plan' 직전에 자동 정지
result = app.invoke(initial_state, config=config)
# → 여기서 상태가 저장되고 워크플로우 일시 정지

# 사람이 검토 후 재개 (상태 수정 가능)
app.update_state(config, {"physician_approved": True, "notes": "계획 승인"})
result = app.invoke(None, config=config)  # 정지된 지점부터 재개
```

---

### 승인 대기 중 상태 관리

의사가 승인하기까지 수 시간 또는 며칠이 걸릴 수 있다. 이 동안:

- 워크플로우 상태는 DB에 저장되어야 한다
- 승인 기한이 지나면 자동 알림이 가야 한다
- 다른 의사가 대신 검토할 수 있어야 한다
- 승인/거부 내역이 감사 로그에 남아야 한다

```python
class ApprovalQueue:
    def submit(self, workflow_id: str, plan: dict, deadline: datetime):
        db.save({
            "workflow_id": workflow_id,
            "plan": plan,
            "submitted_at": datetime.now(),
            "deadline": deadline,
            "status": "pending"
        })
        self.schedule_reminder(workflow_id, deadline - timedelta(hours=2))

    def approve(self, workflow_id: str, physician_id: str, notes: str):
        db.update(workflow_id, {
            "status": "approved",
            "approved_by": physician_id,
            "approved_at": datetime.now(),
            "notes": notes
        })
        workflow_runner.resume(workflow_id)
```

---

### Human-in-the-Loop 설계 원칙

**명확한 개입 지점**: 어디서 사람이 개입하는지를 시스템 문서에 명시한다. "AI가 알아서 결정하다가 필요하면 물어봄"은 나쁜 설계다.

**충분한 정보 제공**: 의사에게 "승인하시겠습니까?"만 보여주면 안 된다. 근거, 대안, 위험도를 함께 제시한다.

**기본값은 사람 확인**: 불확실할 때 자동으로 진행하는 게 아니라 사람에게 물어보는 방향으로 설계한다.

**감사 추적**: 누가 언제 무엇을 승인했는지 반드시 기록한다. 나중에 "왜 이 치료를 했는가"를 추적할 수 있어야 한다.

AI가 완전히 자율화될 수 있는 세상이 오더라도, 의료처럼 책임이 명확해야 하는 도메인에서는 Human-in-the-Loop이 기술이 아닌 제도적 요구사항이 될 것이다.
