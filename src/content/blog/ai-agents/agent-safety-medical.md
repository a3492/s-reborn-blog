---
title: "의료 에이전트 안전 설계 — AI가 실수해도 괜찮은 시스템"
date: 2026-03-31
category: ai-agents
thumbnail: ""
draft: false
---

## 한줄 요약

의료 에이전트 안전은 "AI가 틀리지 않게" 만드는 것이 아니라, AI가 틀렸을 때 피해를 막는 구조를 설계하는 것이다. Human-in-the-loop, Guardrails, Audit log가 그 세 축이다.

---

## 안전 설계의 전제

AI는 반드시 실수한다. 중요한 것은 실수의 빈도가 아니라 **실수했을 때 피해의 크기**다.

의료 AI 사고 시나리오:
1. 에이전트가 약물 알레르기 이력을 놓치고 처방 초안 작성
2. 에이전트가 신기능 저하 환자에게 표준 용량을 권고
3. 에이전트가 드문 진단을 놓치고 흔한 진단만 제시
4. 에이전트가 도구 실패로 잘못된 정보를 사실처럼 반환

이 네 가지 시나리오 모두에서 "의사가 최종 확인한다"는 구조가 피해를 막는다.

---

## 안전 레이어 1 — Human-in-the-Loop

모든 의료 행위 이전에 의사 승인 단계를 강제한다.

```python
from enum import Enum

class ActionStatus(Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"

class MedicalAction:
    def __init__(self, action_type: str, content: dict):
        self.action_type = action_type
        self.content = content
        self.status = ActionStatus.DRAFT
        self.approver = None
        self.approval_timestamp = None

    def request_approval(self, physician_id: str):
        """의사에게 승인 요청을 보낸다."""
        self.status = ActionStatus.PENDING_APPROVAL
        notify_physician(physician_id, self)

    def execute(self):
        """승인된 경우만 실행 허용."""
        if self.status != ActionStatus.APPROVED:
            raise PermissionError(
                f"의사 승인 없이 실행 불가. 현재 상태: {self.status.value}"
            )
        return perform_action(self)


# 에이전트가 처방 초안을 작성한 후
prescription_draft = MedicalAction(
    action_type="prescription",
    content={"drug": "metformin", "dose": "500mg BID", "patient_id": "P001"}
)

# 의사 승인 요청 — 의사가 EMR에서 확인하고 버튼을 눌러야 execute() 가능
prescription_draft.request_approval(physician_id="DR001")
```

---

## 안전 레이어 2 — Guardrails (행동 제한)

에이전트가 특정 행동을 아예 할 수 없도록 사전 차단한다.

```python
FORBIDDEN_ACTIONS = [
    "direct_prescription_execution",  # 처방 직접 실행
    "modify_patient_record",           # 환자 기록 직접 수정
    "delete_clinical_data",            # 임상 데이터 삭제
    "contact_patient_directly",        # 환자 직접 연락
]

RESTRICTED_DRUG_CLASSES = [
    "controlled_substance",   # 마약류
    "high_alert_medication",  # 고위험 약물
    "black_box_warning",      # 블랙박스 경고 약물
]

def guardrail_check(action: str, drug_class: str = None) -> bool:
    """에이전트 행동이 허용 범위 내인지 확인한다."""
    if action in FORBIDDEN_ACTIONS:
        log_security_event(f"BLOCKED: 금지 행동 시도 — {action}")
        return False

    if drug_class and drug_class in RESTRICTED_DRUG_CLASSES:
        log_security_event(f"BLOCKED: 제한 약물 클래스 — {drug_class}")
        # 제한 약물은 반드시 전문의 직접 처방
        return False

    return True
```

---

## 안전 레이어 3 — Confidence Threshold (확신도 기반 에스컬레이션)

에이전트가 자신의 불확실성을 인식하고 사람에게 넘길 수 있어야 한다.

```python
def assess_and_escalate(diagnosis_result: dict) -> dict:
    confidence = diagnosis_result["confidence"]

    if confidence >= 0.85:
        # 높은 확신도 — 일반 검토 요청
        return {
            **diagnosis_result,
            "action": "routine_review",
            "message": "AI 초안입니다. 검토 후 확정해 주세요."
        }

    elif confidence >= 0.60:
        # 중간 확신도 — 명시적 주의 표시
        return {
            **diagnosis_result,
            "action": "careful_review",
            "message": f"AI 확신도 {confidence:.0%}. 추가 정보가 있으면 재검토 권장."
        }

    else:
        # 낮은 확신도 — 에스컬레이션
        return {
            **diagnosis_result,
            "action": "escalate",
            "message": f"AI 확신도 {confidence:.0%}로 낮습니다. 전문의 직접 판단이 필요합니다.",
            "escalated": True,
            "reason": diagnosis_result.get("uncertainty_factors", [])
        }
```

---

## 안전 레이어 4 — Audit Log (감사 로그)

에이전트의 모든 행동을 기록하여 사후 추적이 가능하게 한다.

```python
import json
from datetime import datetime

class AuditLogger:
    def __init__(self, log_store):
        self.store = log_store

    def log(self, event_type: str, agent_id: str,
            action: str, inputs: dict, outputs: dict,
            patient_id: str = None):

        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,  # "tool_call", "decision", "escalation"
            "agent_id": agent_id,
            "patient_id": hash_patient_id(patient_id) if patient_id else None,
            "action": action,
            "inputs": inputs,
            "outputs": outputs,
            "model_version": get_model_version()
        }

        self.store.write(json.dumps(entry))
```

---

## 안전 레이어 5 — Graceful Degradation (도구 실패 대응)

도구가 실패했을 때 에이전트가 잘못된 정보를 사실처럼 반환하지 않도록 한다.

```python
def safe_tool_call(tool_name: str, inputs: dict,
                   fallback_message: str) -> dict:
    try:
        result = execute_tool(tool_name, inputs)
        return {"status": "success", "data": result}

    except TimeoutError:
        return {
            "status": "degraded",
            "message": f"{tool_name} 응답 시간 초과.",
            "fallback": fallback_message,
            "action_required": "의사가 직접 확인 필요"
        }

    except Exception as e:
        audit_logger.log("tool_failure", tool_name, str(e))
        return {
            "status": "error",
            "message": "도구 실행 실패. AI가 이 항목을 확인할 수 없습니다.",
            "fallback": fallback_message
        }
```

---

## 핵심 정리

- 안전 설계는 "AI가 틀리지 않게"가 아니라 "AI가 틀렸을 때 피해를 막는" 구조다
- Human-in-the-loop: 모든 의료 행위 이전에 의사 승인을 강제한다
- Guardrails: 금지 행동과 고위험 약물에 대한 사전 차단 레이어를 설계한다
- Confidence threshold: 확신도가 낮을 때 자동으로 에스컬레이션한다
- Audit log와 Graceful degradation은 사후 추적과 도구 실패 대응의 핵심이다

## 관련 글

- [의료 워크플로우 에이전트 설계 — 외래 보조 AI 만들기](/blog/ai-agents/medical-workflow-agent)
- [Tool Use와 함수 호출 — AI가 외부 세계와 연결되는 방법](/blog/ai-agents/tool-use-function-calling)
- [의료 에이전트 평가 — 정확도보다 중요한 안전성 측정법](/blog/ai-agents/agent-evaluation-medical)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
