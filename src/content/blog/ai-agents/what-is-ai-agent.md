---
title: "AI 에이전트란 — 챗봇과 무엇이 다른가"
date: 2026-03-31
category: ai-agents
tags:
  - "cu2604021805"
  - "에이전트"
  - "의료AI"
  - "LLM"
  - "what-is-ai-agent"

description: "챗봇은 질문에 한 번 답하고 끝나지만, 에이전트는 목표를 받아 스스로 계획을 세우고, 도구를 사용하며, 결과를 피드백 삼아 반복 실행한다."
thumbnail: ""
draft: false
---


## 한줄 요약

챗봇은 질문에 한 번 답하고 끝나지만, 에이전트는 목표를 받아 스스로 계획을 세우고, 도구를 사용하며, 결과를 피드백 삼아 반복 실행한다.

---

## 챗봇과 에이전트의 차이

"당뇨 환자에게 메트포르민을 처방해도 되나요?" — 챗봇은 이 질문에 한 번 답하고 멈춘다. 에이전트는 다르다.

챗봇 흐름:
```
사용자 입력 → LLM 추론 → 텍스트 출력 (종료)
```

에이전트 흐름:
```
목표 입력 → 계획 수립 → 도구 실행 → 결과 관찰 → 재계획 → ... → 최종 출력
```

에이전트는 루프를 돈다. 중간 결과를 보고 다음 행동을 결정하는 피드백 구조가 핵심이다.

---

## ReAct 패턴 — Reason + Act

ReAct는 에이전트의 가장 대표적인 실행 패턴이다. 생각(Thought)과 행동(Action)을 번갈아 수행한다.

```
Thought: 이 환자의 당뇨 관리 계획을 수립해야 한다.
         먼저 최신 가이드라인을 검색해야겠다.
Action:  search_guideline("2형 당뇨 치료 가이드라인 2024")
Observation: [ADA 2024 가이드라인 요약 반환됨]

Thought: 환자가 복용 중인 약과 상호작용을 확인해야 한다.
Action:  check_drug_interaction("metformin", "lisinopril")
Observation: [상호작용 없음 — 병용 가능]

Thought: 충분한 정보가 모였다. 계획을 작성할 수 있다.
Action:  draft_care_plan(patient_data, guidelines, interaction_results)
Observation: [SOAP 형식 케어플랜 초안 생성됨]
```

각 단계가 독립적이며, Observation이 다음 Thought의 입력이 된다.

---

## Tool Use — AI가 외부 세계에 손을 뻗는 방법

에이전트가 챗봇과 결정적으로 다른 이유는 도구(Tool) 사용 능력이다.

```python
tools = [
    {
        "name": "search_guideline",
        "description": "의료 가이드라인 데이터베이스에서 관련 지침을 검색한다",
        "parameters": {
            "query": {"type": "string", "description": "검색 키워드"}
        }
    },
    {
        "name": "check_drug_interaction",
        "description": "두 약물 간의 상호작용을 확인한다",
        "parameters": {
            "drug_a": {"type": "string"},
            "drug_b": {"type": "string"}
        }
    },
    {
        "name": "calculate_dose",
        "description": "체중·신기능에 따른 적정 용량을 계산한다",
        "parameters": {
            "drug": {"type": "string"},
            "weight_kg": {"type": "number"},
            "creatinine": {"type": "number"}
        }
    }
]
```

LLM은 이 도구 목록을 보고 "지금 어떤 도구를 써야 하는가"를 스스로 판단한다.

---

## 의료 에이전트 예시

입력: "65세 남성, 2형 당뇨 10년차, eGFR 45, 현재 아스피린 복용 중. 당뇨 관리 계획 수립"

에이전트의 실행 흐름:

```python
# Step 1: 가이드라인 검색
guideline = search_guideline("eGFR 45 당뇨 메트포르민 안전성")
# → "eGFR 30~45: 용량 조절 후 사용 가능"

# Step 2: 약물 상호작용 확인
interaction = check_drug_interaction("metformin", "aspirin")
# → "임상적으로 유의한 상호작용 없음"

# Step 3: 용량 계산
dose = calculate_dose("metformin", weight_kg=72, creatinine=1.4)
# → "500mg BID 권장 (신기능 고려)"

# Step 4: 케어플랜 초안 작성
plan = draft_care_plan(
    patient="65M, T2DM 10yr, eGFR 45",
    drug="metformin 500mg BID",
    monitoring=["eGFR 3개월마다 재확인", "HbA1c 목표 <7.5%"]
)
```

챗봇이었다면 "메트포르민은 신기능 저하 시 주의가 필요합니다"라는 일반적 답변에 그쳤을 것이다.

---

## 에이전트의 4가지 구성요소

| 요소 | 역할 | 예시 |
|------|------|------|
| LLM | 추론 엔진, 계획 수립 | Claude, GPT-4o |
| Tools | 외부 세계와 상호작용 | API, DB, 계산기 |
| Memory | 컨텍스트 유지 | 이전 대화, 벡터 DB |
| Planning | 목표를 단계로 분해 | ReAct, CoT |

이 네 가지가 유기적으로 연결될 때 비로소 "에이전트"라고 부를 수 있다.

---

## 핵심 정리

- 챗봇은 질문→답변 1회 구조, 에이전트는 목표→계획→실행→피드백 루프 구조다
- ReAct 패턴은 Thought→Action→Observation을 반복하며 목표에 수렴한다
- Tool Use가 에이전트를 챗봇과 구분 짓는 결정적 차이다
- 의료 에이전트는 LLM + 의료 DB + 계산 도구 + 계획 엔진의 조합이다
- 에이전트는 제안 도구이며, 최종 결정은 반드시 의사가 내려야 한다

## 관련 글

- [Tool Use와 함수 호출 — AI가 외부 세계와 연결되는 방법](/blog/ai-agents/tool-use-function-calling)
- [에이전트 계획 패턴 — ReAct, CoT, Tree-of-Thought](/blog/ai-agents/agent-planning-patterns)
- [의료 워크플로우 에이전트 설계 — 외래 보조 AI 만들기](/blog/ai-agents/medical-workflow-agent)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
