---
title: "ReAct 패턴 — AI가 생각하고 행동하는 방식"
date: 2026-04-01
category: orchestration
tags: ["ReAct", "추론", "행동", "에이전트패턴"]
description: "ReAct는 AI가 생각(Reasoning)과 행동(Acting)을 번갈아 하면서 목표를 달성하는 패턴이다. 현대 AI 에이전트의 가장 기본적인 작동 원리다."
read_time: 7
difficulty: "beginner"
draft: false
thumbnail: ""
---

## 한줄 요약
ReAct는 AI가 "왜 이걸 해야 하는지 생각 → 실제로 행동 → 결과 관찰 → 다시 생각"을 반복하는 패턴이다.

## 본문

### ReAct의 탄생

2022년 Princeton과 Google Research가 공동으로 발표한 논문 **"ReAct: Synergizing Reasoning and Acting in Language Models"**에서 시작됐다.

기존 접근법 두 가지의 한계:
- **순수 추론 (Chain-of-Thought)**: 생각은 잘 하는데 실제 세계와 단절됨
- **순수 행동**: 툴을 쓰는데 왜 쓰는지 이유 없이 닥치는 대로 시도

ReAct는 이 둘을 결합했다: 생각(Reasoning)이 행동(Acting)을 안내하고, 행동 결과가 다음 생각을 업데이트한다.

---

### ReAct의 작동 방식

```
질문: "이 환자에게 메트포르민 처방 가능한가?"

[생각] 메트포르민 처방 전 신기능을 확인해야 한다.
[행동] get_lab_result(patient_id="P123", test="creatinine")
[관찰] creatinine = 2.3 mg/dL

[생각] creatinine 2.3은 높다. eGFR을 계산해야 한다.
[행동] calculate_egfr(creatinine=2.3, age=65, sex="male")
[관찰] eGFR = 28 mL/min/1.73m²

[생각] eGFR 28은 Stage 4 CKD다.
       eGFR < 30에서 메트포르민은 금기다.
[행동] search_guideline("metformin contraindication CKD")
[관찰] "eGFR < 30 mL/min/1.73m²에서 메트포르민 사용 금기"

[생각] 메트포르민은 이 환자에게 금기다.
       대안을 제시해야 한다.
[행동] search_guideline("T2DM alternative eGFR<30")
[관찰] "SGLT2i는 eGFR < 20에서만 금기. GLP-1 RA는 신기능 관계없이 사용 가능"

[최종 답변] 이 환자에게 메트포르민은 eGFR 28로 금기입니다.
            대안으로 GLP-1 RA(예: 세마글루타이드) 또는
            SGLT2i(eGFR ≥ 20 확인 후)를 고려할 수 있습니다.
```

각 단계에서 AI가 "왜 이 행동을 하는지"를 명시적으로 생각한다. 생각이 없이 툴만 호출하는 것보다 훨씬 정확하다.

---

### ReAct 구현

```python
from langchain.agents import create_react_agent
from langchain import hub

# ReAct 프롬프트 템플릿 (생각/행동/관찰 구조 정의)
prompt = hub.pull("hwchase17/react")

# 사용 가능한 툴 정의
tools = [
    get_lab_result_tool,
    calculate_egfr_tool,
    search_guideline_tool,
    drug_interaction_tool
]

# ReAct 에이전트 생성
agent = create_react_agent(llm, tools, prompt)

# 실행
response = agent.invoke({
    "input": "환자 P123에게 메트포르민 처방 가능한지 확인해줘"
})
```

---

### ReAct의 핵심 프롬프트 구조

```
당신은 임상의사결정 AI입니다.
질문에 답하기 위해 다음 툴을 사용할 수 있습니다:
{tools}

형식을 정확히 따르세요:

생각: [현재 상황을 이해하고 다음 행동을 결정하는 추론]
행동: [툴 이름]
행동 입력: [툴에 전달할 입력]
관찰: [툴의 반환 결과 - 시스템이 자동으로 채움]

... (이 과정을 반복)

생각: 이제 최종 답변을 낼 수 있다
최종 답변: [사용자에게 전달할 답변]
```

---

### ReAct의 문제점과 해결책

**루프에 빠지는 경우**

AI가 같은 툴을 계속 반복 호출하며 나오지 못하는 경우가 있다.

```python
agent = create_react_agent(
    llm, tools, prompt,
    max_iterations=10,  # 최대 10번 반복
    early_stopping_method="force"  # 한계 도달 시 강제 종료
)
```

**틀린 추론**

생각 단계에서 잘못된 전제로 시작하면 모든 이후 행동이 엉뚱한 방향으로 간다.

해결: 생각 단계의 품질을 높이기 위해 더 좋은 모델 사용. 또는 결과 검증 단계 추가.

**비싼 루프**

각 반복이 LLM 호출이다. 10번 반복하면 10번 과금된다.

해결: 캐싱 (같은 툴 호출 결과 재사용), 조기 종료 조건 설정.

---

### ReAct vs 단순 툴 호출

**단순 툴 호출**: "이 환자의 creatinine 수치 알려줘" → 툴 호출 → 결과 반환. 생각 없음.

**ReAct**: "이 환자에게 메트포르민 써도 되나?" → 왜 creatinine을 봐야 하는지 이해 → 자동으로 관련 검사 조회 → 결과 해석 → 다음 행동 결정. 생각 있음.

복잡한 임상 판단처럼 "어떤 정보가 필요한지 모르는 상태에서 시작해야 하는" 케이스에서 ReAct가 힘을 발휘한다.
