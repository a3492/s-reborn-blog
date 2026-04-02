---
title: "오케스트레이션 비용 최적화 — AI 여러 개 쓰면 돈이 얼마나 드나"
date: 2026-04-01
category: orchestration
tags: ["cu", "비용최적화", "LLM비용", "토큰관리", "오케스트레이션"]
description: "멀티 에이전트 시스템은 강력하지만 비용이 폭발적으로 늘어날 수 있다. 품질을 유지하면서 비용을 줄이는 전략을 정리한다."
read_time: 7
difficulty: "intermediate"
draft: false
type: "guide"
series: "RoundPrep — 회진 브리핑을 만든다"
series_order: 21
thumbnail: ""
key_takeaways:
  - "멀티 에이전트 시스템은 강력하지만 비용이 폭발적으로 늘어날 수 있다. 품질을 유지하면서 비용을 줄이는 전략을 정리한다."
  - "이 글은 설계 관점 정리이며, 프로덕션 도입 전 보안·비용·감사 요구를 별도 검토한다."
  - "태그 cu: Cursor 초안 — 프레임워크·API·병원 정책은 공식 문서를 본다."
---
> RoundPrep 제21화 · 에필로그. 월간 토큰 청구서를 본 날, 팀은 한동안 말이 없었다. 오케스트레이션은 설계로 끝나지 않고 돈으로 되돌아온다.



## 한줄 요약
오케스트레이션 비용은 에이전트 수 × 호출 횟수 × 토큰 수로 결정된다 — 이 세 가지를 줄이는 전략이 핵심이다.

## 본문

### 비용이 얼마나 늘어나는가

단일 AI 호출 1회: $0.01 (GPT-4o 기준, 약 1000 토큰)

멀티 에이전트 시스템:
- 에이전트 5개
- 각 에이전트 평균 3회 호출
- 에이전트 간 대화로 컨텍스트 증가 → 평균 3000 토큰

5 × 3 × $0.03 = $0.45 per workflow

하루 1000번 실행: $450/day = $13,500/month

단순해 보이는 멀티 에이전트 시스템이 월 1천만 원 이상의 비용이 될 수 있다.

---

### 비용의 3가지 원인

1. 에이전트 수
에이전트가 많을수록 LLM 호출이 많아진다. 5개 에이전트가 4개를 대체하기 어렵다면 필요하지만, 단순히 "전문화"를 위해 에이전트를 늘리는 건 금물.

2. 컨텍스트 길이
에이전트들이 대화하면서 컨텍스트가 누적된다. 1단계에서 1000 토큰, 2단계에서 2000 토큰, 3단계에서 3000 토큰... 나중 단계일수록 더 비싸다.

3. 반복 호출
ReAct 루프, 재시도, 검증 단계 등이 모두 추가 호출이다.

---

### 비용 최적화 전략

전략 1: 모델 계층화 (Model Routing)

모든 에이전트에 GPT-4o를 쓸 필요가 없다. 태스크 복잡도에 따라 모델을 선택한다.

```python
def select_model(task_type: str) -> str:
    routing = {
        # 단순 데이터 추출 → 작은 모델
        "data_extraction": "gpt-4o-mini",

        # 구조화 출력 → 중간 모델
        "structured_output": "gpt-4o-mini",

        # 복잡한 의료 추론 → 큰 모델
        "medical_reasoning": "gpt-4o",

        # 최종 보고서 작성 → 큰 모델
        "report_generation": "gpt-4o"
    }
    return routing.get(task_type, "gpt-4o-mini")
```

비용 절감: 단순 태스크에 작은 모델 → 50~80% 절감 가능

전략 2: 컨텍스트 압축

각 에이전트에게 전달하는 컨텍스트를 필요한 정보만 담도록 줄인다.

```python
def compress_context(full_state: dict, next_agent: str) -> dict:
    """다음 에이전트에게 필요한 정보만 추출"""

    if next_agent == "pharmacist":
        return {
            "patient_id": full_state["patient_id"],
            "current_medications": full_state["current_medications"],
            "proposed_treatment": full_state["proposed_treatment"],
            # 영상 판독 결과, EMR 전체 기록 등은 제외
        }

    elif next_agent == "report_writer":
        return {
            "diagnosis": full_state["final_diagnosis"],
            "treatment_plan": full_state["treatment_plan"],
            "key_findings": full_state["key_findings"]
            # 중간 추론 과정 등은 제외
        }
```

전략 3: 캐싱

같은 입력에 대한 결과를 캐시한다. 동일한 약물 상호작용 조회를 오늘 100번 하면, 1번만 LLM을 쓰고 99번은 캐시를 반환한다.

```python
import hashlib
import json
from functools import lru_cache

def make_cache_key(tool_name: str, params: dict) -> str:
    return hashlib.md5(f"{tool_name}:{json.dumps(params, sort_keys=True)}".encode()).hexdigest()

cache = {}

async def cached_tool_call(tool_name: str, params: dict):
    key = make_cache_key(tool_name, params)

    if key in cache:
        return cache[key]

    result = await actual_tool_call(tool_name, params)
    cache[key] = result
    return result
```

의료 데이터처럼 자주 변하지 않는 정보(가이드라인, 약물 DB)는 특히 캐싱 효과가 크다.

전략 4: 일괄 처리 (Batching)

독립적인 여러 요청을 하나의 LLM 호출로 처리한다.

```python
# 나쁜 방식: 환자 10명을 개별적으로 처리
for patient_id in patient_ids:
    result = await analyze_patient(patient_id)

# 좋은 방식: 한 번의 호출로 여러 환자 처리
results = await batch_analyze(
    patients=patient_ids,
    prompt_template="다음 환자 목록에 대해 각각 분석하세요: {patients}"
)
```

전략 5: 조기 종료

확신도가 충분히 높으면 추가 검증 단계를 건너뛴다.

```python
def should_continue_analysis(state: dict) -> str:
    # 신뢰도 90% 이상이면 추가 검증 불필요
    if state["confidence"] > 0.9:
        return "generate_report"
    else:
        return "additional_verification"
```

---

### 비용 모니터링

최적화만큼 중요한 게 측정이다.

```python
class CostTracker:
    def __init__(self):
        self.total_tokens = 0
        self.total_cost = 0

    def track(self, model: str, input_tokens: int, output_tokens: int):
        pricing = {
            "gpt-4o": {"input": 0.005, "output": 0.015},      # per 1K tokens
            "gpt-4o-mini": {"input": 0.00015, "output": 0.0006}
        }
        cost = (
            input_tokens * pricing[model]["input"] +
            output_tokens * pricing[model]["output"]
        ) / 1000

        self.total_tokens += input_tokens + output_tokens
        self.total_cost += cost

    def report(self):
        print(f"총 토큰: {self.total_tokens:,}")
        print(f"총 비용: ${self.total_cost:.4f}")
```

워크플로우마다 비용을 추적하면 어떤 에이전트가 가장 비싼지, 어디서 최적화가 가능한지 보인다.


---

### 이야기 속에서 이어서

한 줄기로 처음부터 다시 읽고 싶다면 [오케스트레이션이란 무엇인가](/blog/orchestration/what-is-orchestration/)로 돌아가면 된다. 개념만 뽑아 읽어도 되지만, 같은 프로젝트 안에서 순서를 지키면 덜 헤매는 편이다.


*편집 초안(cu). 프레임워크·API·임상 규정은 발행일 이후 바뀔 수 있으니 공식 문서와 병원 정책을 기준으로 확인한다.*
