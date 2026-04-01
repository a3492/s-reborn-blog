---
title: "오케스트레이션 디버깅 — AI 여러 개가 엉킬 때 어떻게 찾는가"
date: 2026-04-01
category: orchestration
tags: ["디버깅", "트레이싱", "오케스트레이션", "LangSmith"]
description: "단일 AI 디버깅도 어렵지만 멀티 에이전트는 차원이 다르다. 어디서 잘못됐는지 찾고 고치는 실전 방법을 다룬다."
read_time: 7
difficulty: "intermediate"
draft: false
thumbnail: ""
---

## 한줄 요약
오케스트레이션 디버깅의 핵심은 "어떤 에이전트가, 어떤 입력을 받아서, 어떤 출력을 냈는가"를 전부 기록하고 추적하는 것이다.

## 본문

### 왜 오케스트레이션 디버깅이 어려운가

단일 AI가 틀린 답을 냈다면: 입력 프롬프트와 출력을 보면 된다.

멀티 에이전트 시스템이 틀린 답을 냈다면:
- 어떤 에이전트가 처음 잘못됐는가?
- 그 오류가 어떤 경로로 전파됐는가?
- 중간에 잡을 수 있었는데 못 잡은 게 있는가?
- 오류가 에이전트 자체의 문제인가, 입력 데이터의 문제인가, 오케스트레이션 로직의 문제인가?

추적 없이 이걸 찾는 건 범인 없는 범죄 현장에서 수사하는 것과 같다.

---

### 트레이싱의 중요성

모든 에이전트 호출을 로그로 남겨야 한다.

```python
import time
from dataclasses import dataclass, field

@dataclass
class AgentTrace:
    agent_name: str
    input: dict
    output: dict
    start_time: float
    end_time: float
    tokens_used: int
    error: str | None = None

    @property
    def duration_ms(self):
        return (self.end_time - self.start_time) * 1000

class TraceCollector:
    def __init__(self):
        self.traces: list[AgentTrace] = []

    def record(self, trace: AgentTrace):
        self.traces.append(trace)

    def print_timeline(self):
        for t in self.traces:
            status = "✅" if t.error is None else "❌"
            print(f"{status} [{t.agent_name}] {t.duration_ms:.0f}ms | {t.tokens_used} tokens")
            if t.error:
                print(f"   Error: {t.error}")

collector = TraceCollector()

def traced_agent_call(agent_fn, agent_name: str, input_data: dict) -> dict:
    start = time.time()
    error = None
    output = {}

    try:
        output = agent_fn(input_data)
    except Exception as e:
        error = str(e)
        raise
    finally:
        collector.record(AgentTrace(
            agent_name=agent_name,
            input=input_data,
            output=output,
            start_time=start,
            end_time=time.time(),
            tokens_used=count_tokens(str(input_data) + str(output)),
            error=error
        ))

    return output
```

---

### LangSmith로 시각적 디버깅

LangChain 생태계의 관찰 도구. 워크플로우 실행을 시각적으로 추적한다.

```python
from langsmith import Client
import os

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-api-key"
os.environ["LANGCHAIN_PROJECT"] = "medical-orchestration"

# 이제 모든 LangChain/LangGraph 호출이 자동으로 LangSmith에 기록됨
result = app.invoke(initial_state)
```

LangSmith 대시보드에서:
- 각 노드의 입력/출력 확인
- 실행 시간과 토큰 사용량 시각화
- 실패한 단계 즉시 식별
- 실행 간 비교 (버전 A vs B)

---

### 자주 나타나는 버그 패턴

**패턴 1: 프롬프트 변수 누락**

```python
# 버그: 프롬프트에 {patient_id}가 있는데 state에 없음
def diagnose(state: dict) -> dict:
    response = llm.invoke(
        f"환자 {state['patient_id']}의 증상을 분석하세요"
        # state에 'patient_id'가 없으면 KeyError
    )
```

추적 로그를 보면 이 노드에서 KeyError가 났음을 즉시 알 수 있다.

**패턴 2: 출력 파싱 실패 무음 처리**

```python
# 버그: 파싱 실패를 조용히 무시함
def parse_diagnosis(response: str) -> dict:
    try:
        return json.loads(response)
    except:
        return {}  # 빈 딕셔너리 반환 → 다음 단계가 이상하게 동작
```

빈 딕셔너리가 다음 에이전트로 전달되어 엉뚱한 결과를 낸다. 오류를 명시적으로 올려야 한다.

**패턴 3: 상태 오염 (State Mutation)**

```python
# 버그: state를 직접 수정
def agent_a(state: dict) -> dict:
    state["result"] = "A의 결과"  # 원본 수정!
    return state

# 좋은 방식
def agent_a(state: dict) -> dict:
    return {**state, "result_a": "A의 결과"}  # 새 딕셔너리 반환
```

**패턴 4: 무한 루프**

평가-최적화 루프에서 평가자가 너무 엄격하거나 기준이 충돌할 때 발생.

```python
# 루프 카운터 추가
def should_retry(state: dict) -> str:
    if state["retry_count"] >= 3:  # 최대 3번
        return "force_complete"

    if state["quality_score"] >= 0.8:
        return "complete"

    return "retry"
```

---

### 오케스트레이션 테스트 전략

**단위 테스트**: 각 에이전트를 독립적으로 테스트

```python
def test_pharmacist_agent():
    test_input = {
        "proposed_med": "metformin",
        "patient_egfr": 28
    }
    result = pharmacist_agent(test_input)
    assert "contraindicated" in result["recommendation"]
    assert result["alternative"] is not None
```

**통합 테스트**: 전체 워크플로우를 대표 케이스로 테스트

```python
TEST_CASES = [
    {"name": "단순 당뇨 케이스", "expected": "정상 처방"},
    {"name": "신부전 + 당뇨", "expected": "메트포르민 금기"},
    {"name": "응급 케이스", "expected": "에스컬레이션"},
]
```

**회귀 테스트**: 이전에 고쳤던 버그가 다시 나타나지 않도록 케이스 보관

디버깅 환경이 잘 갖춰지면 오케스트레이션 개발 속도가 10배 이상 빨라진다.
