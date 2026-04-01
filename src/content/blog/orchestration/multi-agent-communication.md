---
title: "에이전트 간 통신 — AI들이 서로 이야기하는 방법"
date: 2026-04-01
category: orchestration
tags: ["에이전트통신", "메시지패싱", "공유메모리", "오케스트레이션"]
description: "멀티 에이전트 시스템에서 에이전트들은 어떻게 정보를 주고받는가. 메시지 패싱, 공유 메모리, 블랙보드 패턴을 비교한다."
read_time: 7
difficulty: "intermediate"
draft: false
thumbnail: ""
---

## 한줄 요약
에이전트 간 통신 방식이 시스템의 결합도와 유연성을 결정한다 — 너무 강하게 연결하면 유연성을 잃고, 너무 느슨하면 협력이 안 된다.

## 본문

### 에이전트 통신의 3가지 방식

**방식 1: 직접 메시지 패싱 (Direct Message Passing)**

에이전트 A가 에이전트 B에게 직접 메시지를 보낸다.

```python
class Agent:
    def send_message(self, to: str, message: dict):
        message_bus.send(to=to, from_=self.name, content=message)

    def receive_message(self) -> dict:
        return message_bus.receive(for_=self.name)

# 내과 전문가가 약사에게 메시지
internist.send_message(
    to="pharmacist",
    message={
        "type": "review_request",
        "proposed_meds": ["metformin 1000mg", "lisinopril 10mg"],
        "patient_context": {"egfr": 42, "bp": "145/90"}
    }
)

# 약사가 메시지 수신 후 처리
msg = pharmacist.receive_message()
review = pharmacist.review_medications(msg["proposed_meds"], msg["patient_context"])
internist.send_message(to="internist", message={"type": "review_result", "result": review})
```

**장점**: 명확하고 추적하기 쉬움
**단점**: 에이전트들이 서로를 알아야 함 (강한 결합)

---

**방식 2: 공유 상태 (Shared State)**

모든 에이전트가 공통 상태 객체를 읽고 쓴다. LangGraph의 기본 방식.

```python
# 모든 에이전트가 같은 state 딕셔너리를 공유
state = {
    "patient_data": {...},
    "diagnosis": None,       # internist가 채움
    "med_review": None,      # pharmacist가 채움
    "imaging_report": None,  # radiologist가 채움
    "final_plan": None       # 오케스트레이터가 채움
}

def internist_agent(state: dict) -> dict:
    diagnosis = analyze(state["patient_data"])
    return {**state, "diagnosis": diagnosis}  # 자기 필드만 수정

def pharmacist_agent(state: dict) -> dict:
    review = review_meds(state["patient_data"], state["diagnosis"])
    return {**state, "med_review": review}  # diagnosis를 읽고 med_review를 씀
```

**장점**: 단순하고 전체 상태가 명확
**단점**: 에이전트 수가 많아지면 상태가 복잡해짐

---

**방식 3: 블랙보드 패턴 (Blackboard)**

공유 게시판에 정보를 올리면 관심 있는 에이전트가 읽어간다. 에이전트들이 서로를 직접 모른다.

```python
class Blackboard:
    def __init__(self):
        self.entries = {}

    def post(self, key: str, value: any, posted_by: str):
        self.entries[key] = {
            "value": value,
            "posted_by": posted_by,
            "timestamp": datetime.now()
        }
        # 이 키에 관심 있는 에이전트들에게 알림
        self.notify_subscribers(key)

    def read(self, key: str) -> any:
        return self.entries.get(key, {}).get("value")

blackboard = Blackboard()

# 영상 에이전트가 판독 결과 게시
blackboard.post("imaging_report", {"finding": "폐렴 의심"}, "radiologist")

# 내과 에이전트가 자신이 관심 있는 항목을 읽음
imaging_data = blackboard.read("imaging_report")
```

**장점**: 에이전트들이 서로 독립적 (느슨한 결합)
**단점**: 누가 언제 무엇을 읽었는지 추적 어려움

---

### 통신 방식 선택 기준

| 상황 | 추천 방식 |
|------|----------|
| 에이전트 수 적음 (2~3개), 순차 실행 | 공유 상태 |
| 에이전트가 동적으로 추가/제거됨 | 블랙보드 |
| 특정 에이전트끼리만 대화 | 직접 메시지 |
| LangGraph 사용 중 | 공유 상태 (기본 방식) |

---

### 에이전트 간 신뢰

흥미로운 문제가 있다. 에이전트 A가 에이전트 B의 결과를 믿어야 하는가?

**무조건 신뢰 방식**
```python
# B의 결과를 바로 사용
diagnosis = agent_b_output["diagnosis"]
```

단순하지만, B가 틀렸을 때 A가 그걸 모르고 계속 진행한다.

**검증 방식**
```python
# B의 결과를 C(검증 에이전트)가 검토
def validator_agent(state: dict) -> dict:
    b_output = state["agent_b_output"]

    # 형식 검증
    if not validate_schema(b_output):
        return {**state, "b_output_valid": False, "b_error": "형식 오류"}

    # 의미 검증 (다른 AI가 검토)
    review = llm.invoke(f"다음 진단이 임상적으로 타당한지 검토하세요: {b_output}")
    return {**state, "b_output_valid": True, "b_review": review}
```

의료 AI에서는 에이전트 출력을 무조건 신뢰하지 않는 게 안전하다. 중요한 출력은 항상 검증 단계를 거친다.

---

### 에이전트 통신 시 보안

멀티 에이전트 시스템은 새로운 보안 위협을 만든다.

**에이전트 사칭**: 악의적인 입력이 에이전트인 척 메시지를 보낼 수 있다.

```python
# 메시지에 서명 추가
import hmac

def signed_message(content: dict, secret: str) -> dict:
    sig = hmac.new(secret.encode(), json.dumps(content).encode()).hexdigest()
    return {"content": content, "signature": sig}

def verify_message(message: dict, secret: str) -> bool:
    expected = hmac.new(secret.encode(), json.dumps(message["content"]).encode()).hexdigest()
    return hmac.compare_digest(message["signature"], expected)
```

**간접 인젝션**: 에이전트 A가 외부 데이터를 읽어서 B에게 전달할 때, 그 데이터 안에 악의적인 지시가 있을 수 있다.

에이전트 간 통신에서도 신뢰는 주어지는 게 아니라 설계되는 것이다.
