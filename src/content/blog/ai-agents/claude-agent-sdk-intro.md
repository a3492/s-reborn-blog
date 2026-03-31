---
title: "Claude Agent SDK — Anthropic의 에이전트 프레임워크 시작하기"
date: 2026-03-31
category: ai-agents
description: "이 글을 읽어보세요."
thumbnail: ""
draft: false
---

## 한줄 요약

Claude Agent SDK는 Anthropic이 제공하는 에이전트 구축 프레임워크로, Tool Use를 중심으로 한 에이전트 루프를 간결하게 구현할 수 있으며 의료 use case에 특히 적합하다.

---

## Claude Agent SDK 개요

Anthropic의 `anthropic` Python 패키지는 단순한 API 클라이언트를 넘어 에이전트 구축에 필요한 핵심 기능을 제공한다.

```bash
pip install anthropic
```

주요 기능:
- **Tool Use** — 함수 호출 및 결과 처리
- **Streaming** — 실시간 토큰 스트리밍
- **Message API** — 멀티턴 대화 관리
- **Computer Use** (베타) — 화면 제어

---

## Tool 정의 — Python 예시

의료 에이전트에서 약물 용량 계산 도구를 정의하는 방법:

```python
import anthropic
from typing import Optional

client = anthropic.Anthropic()

# 도구 스키마 정의
dose_calculator_tool = {
    "name": "calculate_medication_dose",
    "description": """
    환자의 체중, 신기능(eGFR), 연령을 고려하여 약물의 적정 용량을 계산한다.
    신기능 저하 환자에서 용량 조정이 필요한 약물(메트포르민, 항생제 등)에 사용한다.
    """,
    "input_schema": {
        "type": "object",
        "properties": {
            "drug_name": {
                "type": "string",
                "description": "약물 성분명 (예: metformin, vancomycin)"
            },
            "indication": {
                "type": "string",
                "description": "투여 목적 (예: type2_diabetes, pneumonia)"
            },
            "weight_kg": {
                "type": "number",
                "description": "환자 체중 (kg)"
            },
            "egfr": {
                "type": "number",
                "description": "eGFR (mL/min/1.73m²). 신기능 정상이면 생략 가능"
            },
            "age": {
                "type": "integer",
                "description": "환자 나이"
            }
        },
        "required": ["drug_name", "indication", "weight_kg"]
    }
}
```

---

## 기본 에이전트 루프 구현

```python
def run_dose_agent(query: str) -> str:
    """약물 용량 계산 에이전트."""
    messages = [{"role": "user", "content": query}]
    tools = [dose_calculator_tool]

    while True:
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=2048,
            tools=tools,
            messages=messages,
            system="""당신은 약물 용량 계산 전문 에이전트입니다.
            환자 데이터를 받아 calculate_medication_dose 도구를 사용하여
            정확한 용량을 계산하고 근거를 설명합니다.
            계산 결과는 항상 '의사 확인 필요' 레이블을 붙여 반환합니다."""
        )

        # 에이전트 루프 종료 조건
        if response.stop_reason == "end_turn":
            # 텍스트 블록 추출
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "응답을 처리할 수 없습니다."

        # Tool Use 처리
        if response.stop_reason == "tool_use":
            tool_results = []

            for block in response.content:
                if block.type == "tool_use":
                    # 실제 도구 실행
                    result = execute_dose_calculation(block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": str(result)
                    })

            # 대화 이력 업데이트
            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})


def execute_dose_calculation(inputs: dict) -> dict:
    """실제 용량 계산 로직."""
    drug = inputs["drug_name"].lower()
    egfr = inputs.get("egfr", 90)

    # 메트포르민 예시
    if "metformin" in drug:
        if egfr >= 60:
            dose = "500~2000mg/day (분할 투여)"
            note = "정상 신기능 — 표준 용량"
        elif egfr >= 30:
            dose = "500mg BID (최대 1000mg/day)"
            note = "경~중등도 신기능 저하 — 용량 감소 필요"
        else:
            dose = "투여 금기"
            note = "eGFR < 30: 젖산산증 위험으로 금기"

        return {"drug": "metformin", "recommended_dose": dose, "note": note,
                "egfr_used": egfr, "requires_physician_approval": True}

    return {"error": f"{drug}에 대한 계산식이 없습니다. 약사 문의 필요"}
```

---

## Streaming 응답 처리

긴 응답을 실시간으로 보여주고 싶을 때:

```python
def stream_agent_response(query: str):
    """스트리밍으로 에이전트 응답을 처리한다."""
    with client.messages.stream(
        model="claude-opus-4-5",
        max_tokens=2048,
        messages=[{"role": "user", "content": query}],
        tools=[dose_calculator_tool]
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)

        final_message = stream.get_final_message()
        return final_message
```

---

## 오류 처리와 Retry 전략

```python
import time
from anthropic import APIStatusError, APITimeoutError

def robust_agent_call(messages: list, tools: list,
                      max_retries: int = 3) -> anthropic.types.Message:
    for attempt in range(max_retries):
        try:
            return client.messages.create(
                model="claude-opus-4-5",
                max_tokens=4096,
                tools=tools,
                messages=messages
            )
        except APITimeoutError:
            if attempt < max_retries - 1:
                wait = 2 ** attempt  # 지수 백오프: 1s, 2s, 4s
                time.sleep(wait)
            else:
                raise
        except APIStatusError as e:
            if e.status_code == 529:  # Overloaded
                time.sleep(10)
            else:
                raise
```

---

## Claude vs OpenAI Assistants API 비교

| 항목 | Claude (Anthropic) | OpenAI Assistants |
|------|-------------------|-------------------|
| Tool 정의 | JSON Schema, 명확 | JSON Schema, 유사 |
| 컨텍스트 | 200K 토큰 | 128K 토큰 |
| 스레드 관리 | 직접 구현 | 서버사이드 스레드 |
| 의료 안전 | Constitutional AI | Policy 기반 |
| 한국어 품질 | 우수 | 우수 |
| 비용 | 유사 수준 | 유사 수준 |

의료 에이전트에서는 컨텍스트 길이와 한국어 지원이 중요한 선택 기준이 된다.

---

## 핵심 정리

- Claude Agent SDK는 Tool Use를 중심으로 에이전트 루프를 간결하게 구현한다
- 도구 정의의 `description`은 LLM이 언제 어떤 도구를 쓸지 결정하는 핵심이다
- `stop_reason: "tool_use"` 신호를 감지하여 루프를 구성하는 것이 기본 패턴이다
- 스트리밍은 UX 개선에 효과적이며 `client.messages.stream()` 으로 간단히 구현된다
- 지수 백오프 retry 전략으로 일시적 API 오류에 대응해야 한다

## 관련 글

- [Tool Use와 함수 호출 — AI가 외부 세계와 연결되는 방법](/blog/ai-agents/tool-use-function-calling)
- [AI 에이전트란 — 챗봇과 무엇이 다른가](/blog/ai-agents/what-is-ai-agent)
- [RAG + 에이전트 — 의료 가이드라인 기반 AI 어시스턴트](/blog/ai-agents/rag-agent-medical)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
