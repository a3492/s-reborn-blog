---
title: "Tool Use와 함수 호출 — AI가 외부 세계와 연결되는 방법"
date: 2026-03-31
category: ai-agents
tags:
  - "cu2604021805"
  - "에이전트"
  - "의료AI"
  - "LLM"
  - "tool-use-function-calling"

description: "Function Calling은 LLM이 \"이 함수를 호출해야겠다\"고 스스로 판단하고 JSON 형식의 호출 신호를 출력하는 기술로, 에이전트가 실제 세계와 상호작용하는 핵심 메커니즘이다."
thumbnail: ""
draft: false
---


## 한줄 요약

Function Calling은 LLM이 "이 함수를 호출해야겠다"고 스스로 판단하고 JSON 형식의 호출 신호를 출력하는 기술로, 에이전트가 실제 세계와 상호작용하는 핵심 메커니즘이다.

---

## Function Calling이란

2023년 6월 OpenAI가 GPT-4에 도입하면서 널리 알려진 개념이다. LLM은 텍스트를 생성하는 대신, 미리 정의된 함수 목록 중 어떤 것을 호출할지를 JSON으로 출력한다.

기존 LLM 출력:
```
"메트포르민과 와파린의 상호작용은 혈당 저하 효과 증가입니다."
```

Function Calling 출력:
```json
{
  "name": "check_drug_interaction",
  "arguments": {
    "drug_a": "metformin",
    "drug_b": "warfarin"
  }
}
```

LLM이 직접 답하지 않고, 답을 얻기 위한 함수 호출을 지시한다.

---

## JSON Schema로 Tool 정의하기

Claude Tool Use API에서 도구는 JSON Schema로 정의한다.

```python
import anthropic

client = anthropic.Anthropic()

tools = [
    {
        "name": "search_drug_interaction",
        "description": "두 약물 간의 임상적 상호작용을 확인한다. "
                       "결과는 상호작용 심각도(major/moderate/minor)와 "
                       "권장 조치를 포함한다.",
        "input_schema": {
            "type": "object",
            "properties": {
                "drug_a": {
                    "type": "string",
                    "description": "첫 번째 약물명 (성분명 또는 상품명)"
                },
                "drug_b": {
                    "type": "string",
                    "description": "두 번째 약물명 (성분명 또는 상품명)"
                }
            },
            "required": ["drug_a", "drug_b"]
        }
    },
    {
        "name": "lookup_guideline",
        "description": "ADA, ACC/AHA, KDA 등의 최신 의료 가이드라인을 검색한다.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "society": {
                    "type": "string",
                    "enum": ["ADA", "ACC", "KDA", "KDIGO"],
                    "description": "검색할 학회 가이드라인"
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "calculate_dose",
        "description": "환자 체중, 신기능, 연령을 고려한 적정 약물 용량을 계산한다.",
        "input_schema": {
            "type": "object",
            "properties": {
                "drug": {"type": "string"},
                "weight_kg": {"type": "number"},
                "egfr": {"type": "number", "description": "eGFR (mL/min/1.73m²)"},
                "age": {"type": "integer"}
            },
            "required": ["drug", "weight_kg", "egfr"]
        }
    }
]
```

---

## Claude Tool Use API 실전 예시

```python
def run_medical_agent(patient_query: str):
    messages = [{"role": "user", "content": patient_query}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=4096,
            tools=tools,
            messages=messages
        )

        # 도구 호출이 없으면 최종 답변
        if response.stop_reason == "end_turn":
            return response.content[0].text

        # 도구 호출 처리
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = execute_tool(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(result)
                })

        # 결과를 메시지에 추가하고 루프 계속
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})


def execute_tool(name: str, inputs: dict) -> dict:
    """실제 도구 실행 함수 — 각 도구를 라우팅한다."""
    if name == "search_drug_interaction":
        return db.query_interaction(inputs["drug_a"], inputs["drug_b"])
    elif name == "lookup_guideline":
        return guideline_search(inputs["query"], inputs.get("society"))
    elif name == "calculate_dose":
        return dose_calculator(**inputs)
    else:
        return {"error": f"Unknown tool: {name}"}
```

---

## 안전한 Tool 설계 원칙

의료 환경에서 도구를 설계할 때 반드시 지켜야 할 원칙이 있다.

Read-only vs Write 구분:

```python
# 안전 (읽기 전용)
"lookup_guideline"       # DB 조회만
"search_drug_interaction" # 조회만
"calculate_dose"          # 계산만

# 주의 필요 (쓰기)
"create_prescription"     # EMR에 처방 기록
"send_order"              # 원무팀에 지시 전송
"update_patient_record"   # 환자 기록 수정
```

쓰기 도구에는 반드시 human-in-the-loop 승인 단계를 추가해야 한다.

```python
def create_prescription(drug: str, dose: str, patient_id: str) -> dict:
    # 직접 실행 금지 — 항상 초안으로 반환
    draft = {
        "status": "draft",
        "requires_physician_approval": True,
        "drug": drug,
        "dose": dose,
        "patient_id": patient_id
    }
    return draft  # 의사가 검토 후 별도 확정 버튼으로 실행
```

---

## 핵심 정리

- Function Calling은 LLM이 텍스트 대신 구조화된 함수 호출 신호를 출력하는 기법이다
- JSON Schema로 도구를 정의하면 LLM이 파라미터를 정확하게 채워 호출한다
- Claude Tool Use API는 `stop_reason: "tool_use"` 신호로 도구 호출 요청을 전달한다
- 의료 도구는 read-only를 기본으로 하고, 쓰기 작업에는 의사 승인 단계가 필수다
- 도구 설명(description)의 품질이 LLM의 올바른 도구 선택을 결정한다

## 관련 글

- [AI 에이전트란 — 챗봇과 무엇이 다른가](/blog/ai-agents/what-is-ai-agent)
- [Claude Agent SDK — Anthropic의 에이전트 프레임워크 시작하기](/blog/ai-agents/claude-agent-sdk-intro)
- [의료 에이전트 안전 설계 — AI가 실수해도 괜찮은 시스템](/blog/ai-agents/agent-safety-medical)
