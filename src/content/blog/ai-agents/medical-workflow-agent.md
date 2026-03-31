---
title: "의료 워크플로우 에이전트 설계 — 외래 보조 AI 만들기"
date: 2026-03-31
category: ai-agents
thumbnail: ""
draft: false
---

## 한줄 요약

외래 보조 에이전트는 환자 정보를 입력받아 감별진단→가이드라인 검색→처방 초안→약물 상호작용 확인→SOAP 노트 작성까지 5단계를 자동 수행하되, 최종 결정은 항상 의사에게 남긴다.

---

## 외래 현장의 문제

외래 진료에서 의사 1인이 처리해야 하는 작업:

1. 환자 주소(chief complaint) 청취
2. 감별진단 목록 작성
3. 관련 가이드라인 참조
4. 처방 결정 및 상호작용 확인
5. SOAP 노트 작성 및 EMR 입력

이 중 시간을 가장 많이 빼앗는 것은 3번과 5번이다. 에이전트가 이 두 단계를 보조한다.

---

## 외래 보조 에이전트 아키텍처

```
[입력]
환자 주소·병력·활력징후·기존 복용약

     ↓
[Step 1] 감별진단 생성
     ↓
[Step 2] 관련 가이드라인 검색
     ↓
[Step 3] 처방 초안 작성
     ↓
[Step 4] 약물 상호작용 확인
     ↓
[Step 5] SOAP 노트 초안 작성

[출력]
의사 검토용 초안 패키지 (최종 결정은 의사)
```

---

## 각 스텝의 Tool 정의

```python
OUTPATIENT_TOOLS = [
    {
        "name": "generate_ddx",
        "description": "주증상과 병력을 바탕으로 우선순위가 있는 감별진단 목록을 생성한다.",
        "input_schema": {
            "type": "object",
            "properties": {
                "chief_complaint": {"type": "string"},
                "history": {"type": "string"},
                "vitals": {"type": "object"},
                "age": {"type": "integer"},
                "sex": {"type": "string", "enum": ["M", "F"]}
            },
            "required": ["chief_complaint", "age", "sex"]
        }
    },
    {
        "name": "search_clinical_guideline",
        "description": "진단명 또는 임상 상황에 맞는 최신 가이드라인을 검색한다.",
        "input_schema": {
            "type": "object",
            "properties": {
                "diagnosis": {"type": "string"},
                "clinical_question": {"type": "string"}
            },
            "required": ["diagnosis"]
        }
    },
    {
        "name": "draft_prescription",
        "description": "가이드라인과 환자 데이터를 기반으로 처방 초안을 생성한다. "
                       "결과는 항상 'draft' 상태이며 의사 승인 없이 실행되지 않는다.",
        "input_schema": {
            "type": "object",
            "properties": {
                "diagnosis": {"type": "string"},
                "medications": {"type": "array", "items": {"type": "string"}},
                "patient_weight": {"type": "number"},
                "egfr": {"type": "number"}
            },
            "required": ["diagnosis", "medications"]
        }
    },
    {
        "name": "check_interactions",
        "description": "처방 초안의 모든 약물 조합에 대해 상호작용을 일괄 확인한다.",
        "input_schema": {
            "type": "object",
            "properties": {
                "drug_list": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "현재 복용 중인 약물 + 신규 처방 약물 전체"
                }
            },
            "required": ["drug_list"]
        }
    },
    {
        "name": "write_soap_note",
        "description": "수집된 정보를 바탕으로 SOAP 형식의 진료 노트 초안을 작성한다.",
        "input_schema": {
            "type": "object",
            "properties": {
                "subjective": {"type": "string"},
                "objective": {"type": "object"},
                "assessment": {"type": "array", "items": {"type": "string"}},
                "plan": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["subjective", "assessment", "plan"]
        }
    }
]
```

---

## Python Pseudo-code — 전체 실행 흐름

```python
import anthropic

client = anthropic.Anthropic()

def run_outpatient_agent(patient_data: dict) -> dict:
    """
    외래 보조 에이전트 실행.
    Returns: 의사 검토용 초안 패키지
    """
    system_prompt = """당신은 외래 진료를 보조하는 의료 AI 에이전트입니다.
    주어진 환자 정보를 분석하여 진단, 처방 초안, SOAP 노트를 작성합니다.

    중요 원칙:
    - 모든 결과물은 '초안'이며 의사의 최종 승인이 필요합니다
    - 불확실한 경우 명확히 표시하고 전문가 판단을 요청합니다
    - 처방은 절대 직접 실행하지 않습니다
    """

    user_message = f"""
    다음 환자의 외래 진료를 보조해 주세요:

    주증상: {patient_data['chief_complaint']}
    나이/성별: {patient_data['age']}세 {patient_data['sex']}
    병력: {patient_data.get('history', '없음')}
    현재 복용약: {patient_data.get('current_meds', [])}
    활력징후: {patient_data.get('vitals', {})}

    감별진단 → 가이드라인 검색 → 처방 초안 →
    상호작용 확인 → SOAP 노트 순서로 진행해 주세요.
    """

    messages = [{"role": "user", "content": user_message}]
    agent_log = []

    while True:
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=8192,
            system=system_prompt,
            tools=OUTPATIENT_TOOLS,
            messages=messages
        )

        if response.stop_reason == "end_turn":
            return {
                "summary": response.content[0].text,
                "agent_steps": agent_log,
                "status": "awaiting_physician_review"
            }

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                agent_log.append({
                    "step": block.name,
                    "inputs": block.input
                })
                result = dispatch_tool(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(result)
                })

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})
```

---

## 안전장치

에이전트가 제안하더라도 다음 행동은 반드시 의사가 직접 수행해야 한다.

- **처방 확정** — 초안 검토 후 의사가 EMR에서 별도 서명
- **검사 오더** — 에이전트는 "이 검사가 필요합니다"까지만 제안
- **중증 감별진단** — 확신도 70% 미만 시 에스컬레이션 플래그 삽입

---

## 핵심 정리

- 외래 보조 에이전트의 5단계: 감별진단 → 가이드라인 → 처방 초안 → 상호작용 → SOAP
- 각 단계를 별개의 Tool로 구분하면 에러 추적과 감사 로그가 쉬워진다
- 처방 관련 Tool은 항상 "draft" 상태를 반환하며 의사 승인 없이 실행 불가
- 에이전트 로그를 남겨두면 의사가 AI 판단 근거를 추적할 수 있다
- 불확실성이 높을 때 에스컬레이션하는 로직이 안전 설계의 핵심이다

## 관련 글

- [AI 에이전트란 — 챗봇과 무엇이 다른가](/blog/ai-agents/what-is-ai-agent)
- [의료 에이전트 안전 설계 — AI가 실수해도 괜찮은 시스템](/blog/ai-agents/agent-safety-medical)
- [멀티에이전트 시스템 — 여러 AI가 협력하는 의료 팀](/blog/ai-agents/multi-agent-system)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
