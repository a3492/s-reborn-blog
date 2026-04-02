---
title: "오케스트레이션 테스트 전략 — AI 워크플로우를 어떻게 검증하는가"
date: 2026-04-01
category: orchestration
tags: ["cu", "테스트", "품질보증", "오케스트레이션", "Eval"]
description: "멀티 에이전트 시스템 테스트는 일반 소프트웨어 테스트와 다르다. 비결정론적 AI를 어떻게 테스트하고 품질을 보장하는지 다룬다."
read_time: 7
difficulty: "intermediate"
draft: false
type: "guide"
series: "RoundPrep — 회진 브리핑을 만든다"
series_order: 17
thumbnail: ""
key_takeaways:
  - "멀티 에이전트 시스템 테스트는 일반 소프트웨어 테스트와 다르다. 비결정론적 AI를 어떻게 테스트하고 품질을 보장하는지 다룬다."
  - "이 글은 설계 관점 정리이며, 프로덕션 도입 전 보안·비용·감사 요구를 별도 검토한다."
  - "태그 cu: Cursor 초안 — 프레임워크·API·병원 정책은 공식 문서를 본다."
---
> RoundPrep 제17화. 스테이징에서만 터지는 엣지 케이스가 열다섯 개. “돌아가긴 하는데”에서 검증으로 넘어간다.



## 한줄 요약
AI 워크플로우 테스트는 "항상 같은 답이 나오는가"가 아니라 "항상 좋은 답이 나오는가"를 확인하는 것이다.

## 본문

### AI 테스트가 일반 테스트와 다른 이유

일반 소프트웨어:
```python
assert add(2, 3) == 5  # 항상 정확히 5
```

AI 워크플로우:
```python
result = diagnose(patient_symptoms)
assert result == ???  # 뭐가 나올지 모른다
```

AI는 같은 입력에 매번 다른 답을 낼 수 있다. "정확히 이 답"을 기대하는 테스트는 쓸 수 없다. 대신 "이 기준을 만족하는가"를 테스트한다.

---

### 테스트의 4단계

단계 1: 컴포넌트 테스트

각 노드/에이전트를 독립적으로 테스트한다.

```python
import pytest

@pytest.mark.asyncio
async def test_pharmacist_agent_flags_contraindication():
    """신기능 저하 환자에게 메트포르민 제안 시 금기 표시 확인"""

    input_state = {
        "patient": {"egfr": 25, "age": 70},
        "proposed_meds": ["metformin 1000mg"]
    }

    result = await pharmacist_agent(input_state)

    # 정확한 단어 대신 의미를 검증
    assert result["has_contraindication"] == True
    assert "metformin" in result["contraindicated_meds"]
    assert result["alternative"] is not None  # 대안이 있어야 함
```

단계 2: 통합 테스트

여러 에이전트가 협력하는 서브 워크플로우를 테스트한다.

```python
@pytest.mark.asyncio
async def test_diagnosis_to_treatment_flow():
    """진단 → 치료 계획 흐름 통합 테스트"""

    result = await run_workflow(
        nodes=["collect_data", "diagnose", "plan_treatment"],
        initial_state=SAMPLE_DIABETIC_PATIENT
    )

    # 구조 검증
    assert "diagnosis" in result
    assert "treatment_plan" in result
    assert len(result["treatment_plan"]["medications"]) > 0

    # 안전성 검증
    for med in result["treatment_plan"]["medications"]:
        assert med["dose"] in SAFE_DOSE_RANGES[med["name"]]
```

단계 3: E2E 테스트

전체 워크플로우를 대표 시나리오로 테스트한다.

```python
E2E_SCENARIOS = [
    {
        "name": "단순 2형 당뇨 신규 진단",
        "input": SIMPLE_T2DM_PATIENT,
        "expected_outcome": {
            "has_diagnosis": True,
            "has_treatment_plan": True,
            "no_contraindications": True,
            "has_followup": True
        }
    },
    {
        "name": "CKD Stage 4 + 당뇨 복합",
        "input": CKD_T2DM_PATIENT,
        "expected_outcome": {
            "metformin_contraindicated": True,
            "alternative_provided": True,
            "nephrologist_consultation_recommended": True
        }
    },
    {
        "name": "응급 고혈당 케이스",
        "input": HYPERGLYCEMIC_EMERGENCY,
        "expected_outcome": {
            "escalation_triggered": True,
            "response_time_under_seconds": 5
        }
    }
]

@pytest.mark.parametrize("scenario", E2E_SCENARIOS)
async def test_e2e(scenario):
    result = await full_workflow.invoke(scenario["input"])
    for check, expected in scenario["expected_outcome"].items():
        assert evaluate_outcome(result, check) == expected
```

단계 4: 품질 평가 (LLM-as-Judge)

정확한 정답이 없는 출력의 품질을 AI가 평가한다.

```python
async def evaluate_treatment_plan_quality(
    patient_context: dict,
    treatment_plan: str
) -> dict:
    """AI 판별 모델이 치료 계획 품질 평가"""

    evaluation_prompt = f"""
    다음 치료 계획을 의료 전문가 관점에서 평가하세요.

    환자 정보: {patient_context}
    치료 계획: {treatment_plan}

    평가 기준 (각 1-5점):
    1. 의학적 정확성
    2. 안전성 (금기 확인 여부)
    3. 완결성 (필요한 모든 요소 포함)
    4. 실행 가능성
    5. 근거 제시

    JSON으로 응답: {{"scores": [...], "concerns": [...], "overall": 1-5}}
    """

    result = await judge_model.invoke(evaluation_prompt)
    return json.loads(result)
```

---

### 비결정론적 테스트 대응

같은 테스트를 여러 번 실행해서 통계를 낸다.

```python
@pytest.mark.asyncio
async def test_diagnosis_consistency():
    """같은 케이스를 10번 실행해서 일관성 확인"""

    RUNS = 10
    results = []

    for _ in range(RUNS):
        result = await diagnose(STANDARD_AMI_CASE)
        results.append("심근경색" in result["top_diagnoses"])

    consistency_rate = sum(results) / RUNS
    assert consistency_rate >= 0.8  # 최소 80%는 심근경색을 탑5에 포함
```

---

### 회귀 테스트 관리

```
버그 발견: "CKD 환자에게 메트포르민 금기 표시 안 됨"
    ↓
수정
    ↓
이 케이스를 회귀 테스트 셋에 추가
    ↓
이후 모든 배포 전에 자동 실행
    ↓
같은 버그 재발 즉시 감지
```

버그를 수정할 때마다 테스트를 추가하면, 시간이 지날수록 테스트 커버리지가 자동으로 높아진다.

---

### CI/CD에 테스트 통합

```yaml
# GitHub Actions 예시
name: Orchestration Tests

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    steps:
      - name: 컴포넌트 테스트
        run: pytest tests/components/ -v

      - name: 통합 테스트
        run: pytest tests/integration/ -v

      - name: E2E 핵심 시나리오
        run: pytest tests/e2e/critical/ -v
        # 모든 E2E는 너무 느리므로 핵심만

      - name: 배포 승인
        if: all tests pass
```

프롬프트 하나 바꿔도 테스트를 돌린다. AI는 작은 변화에도 예상치 못한 동작 변화가 생기기 때문이다.


---

### 이야기 속에서 이어서

다음 화: [오케스트레이션 디버깅 — AI 여러 개가 엉켰을 때 범인을 찾는 법](/blog/orchestration/orchestration-debugging/) — 같은 팀이 막혔던 지점에서 이어진다.


*편집 초안(cu). 프레임워크·API·임상 규정은 발행일 이후 바뀔 수 있으니 공식 문서와 병원 정책을 기준으로 확인한다.*
