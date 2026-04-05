---
title: "출력 파싱 — AI 응답을 코드가 읽을 수 있게 만드는 기술"
date: 2026-04-01
category: harness-engineering
tags: ["출력파싱", "JSON", "구조화출력", "하네스"]
description: "AI가 아무리 잘 대답해도 코드가 읽지 못하면 쓸 수가 없다. AI 출력을 안정적으로 파싱하는 패턴을 정리한다."
read_time: 7
difficulty: "intermediate"
draft: false
thumbnail: ""
---

## 한줄 요약
AI 출력은 기본적으로 자유 형식 텍스트다 — 이걸 코드가 쓸 수 있는 구조로 바꾸는 것이 출력 파싱이고, 이게 생각보다 훨씬 어렵다.

## 본문

### 문제의 시작

의료 AI 시스템이 감별진단을 내려준다고 하자. 코드는 이 결과를 받아서 EMR에 저장하고 싶다.

AI 응답이 이렇게 오면 어떻게 할 것인가:

```
"흉통 환자에서 고려할 감별진단은 다음과 같습니다.
첫째로 급성 심근경색(AMI)을 배제해야 합니다. 특히...
또한 대동맥 박리도 생각해볼 수 있으며...
폐색전증의 가능성도 있습니다. Wells score를 고려하세요.
기흉의 경우 호흡음 청진이 중요하며..."
```

자연스러운 텍스트다. 사람은 읽을 수 있다. 코드는? 여기서 진단명을 추출해서 배열로 만드는 것은 매우 어렵다.

---

### 해결책 1: JSON 모드 강제

현대 LLM API는 대부분 "JSON 모드"를 지원한다. AI가 반드시 유효한 JSON을 출력하도록 강제하는 기능이다.

시스템 프롬프트에 이렇게 넣는다:

```
항상 다음 JSON 형식으로만 응답하라:
{
  "diagnoses": [
    {
      "name": "질환명",
      "priority": 1,
      "icd10": "코드",
      "reasoning": "근거",
      "urgency": "emergent|urgent|routine"
    }
  ],
  "recommended_workup": ["검사1", "검사2"],
  "confidence": "high|medium|low"
}
```

그러면 AI가 이런 식으로 응답한다:

```json
{
  "diagnoses": [
    {
      "name": "급성 심근경색",
      "priority": 1,
      "icd10": "I21.9",
      "reasoning": "흉통, 발한, ECG 변화",
      "urgency": "emergent"
    },
    {
      "name": "대동맥 박리",
      "priority": 2,
      "icd10": "I71.0",
      "reasoning": "찢어지는 흉통, 혈압 차이",
      "urgency": "emergent"
    }
  ],
  "recommended_workup": ["ECG", "Troponin", "Chest CT"],
  "confidence": "high"
}
```

코드가 바로 파싱해서 쓸 수 있다.

---

### 해결책 2: Structured Outputs

2024년 OpenAI가 "Structured Outputs"를 도입했다. JSON 모드보다 강력하다 — JSON 스키마를 미리 정의하면 AI가 반드시 그 스키마를 따르는 출력만 생성한다.

```python
from pydantic import BaseModel
from typing import Literal

class Diagnosis(BaseModel):
    name: str
    priority: int
    icd10: str
    urgency: Literal["emergent", "urgent", "routine"]

class DiagnosisResponse(BaseModel):
    diagnoses: list[Diagnosis]
    confidence: Literal["high", "medium", "low"]

# API 호출 시 스키마 지정
response = client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[...],
    response_format=DiagnosisResponse,
)
```

타입 안전성이 보장된다. 필드가 빠지거나 타입이 맞지 않으면 API 레벨에서 오류가 난다.

---

### 파싱이 실패하는 상황들

JSON이 잘렸다: 출력 토큰 제한에 걸리면 JSON이 중간에 끊긴다. `{ "diagnoses": [{"name": "급...` 이런 식으로.

대응: max_tokens를 충분히 잡고, 응답 끝이 `}`로 끝나는지 확인.

마크다운이 섞였다: AI가 JSON 주변에 \`\`\`json을 붙이는 경우. 정규식으로 추출해야 한다.

```python
import re, json

def extract_json(text: str) -> dict:
    # 마크다운 코드블록 제거
    match = re.search(r'```(?:json)?\s([\s\S]?)```', text)
    if match:
        text = match.group(1)
    return json.loads(text.strip())
```

키 이름이 달라졌다: "diagnoses" 대신 "diagnosis", "Diagnoses", "진단" 등으로 오는 경우. 파싱 실패.

대응: 스키마를 시스템 프롬프트에 두 번 강조하거나, Structured Outputs 사용.

숫자가 문자열로 왔다: `"priority": "1"` (문자열) vs `"priority": 1` (숫자). 타입 체크 필수.

---

### 파싱 실패 시 복구 전략

```python
def parse_with_fallback(response: str) -> dict | None:
    # 1차 시도: 직접 JSON 파싱
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        pass

    # 2차 시도: 마크다운 제거 후 파싱
    try:
        cleaned = extract_json(response)
        return cleaned
    except Exception:
        pass

    # 3차 시도: AI에게 "JSON만 다시 줘" 재요청
    try:
        retry_response = ask_ai_to_reformat(response)
        return json.loads(retry_response)
    except Exception:
        pass

    # 실패 처리: 로그 남기고 사람에게 알림
    log_parse_failure(response)
    return None
```

---

### 출력 파싱의 미래

Anthropic, OpenAI, Google 모두 Structured Outputs를 강화하는 방향으로 가고 있다. 점점 더 파싱 실패 확률이 줄어들고 있다.

하지만 완전히 없어지지는 않을 것이다. 복잡한 출력, 긴 문서, 예상치 못한 케이스는 항상 생긴다.

출력 파싱 하네스는 AI 시스템이 프로덕션에서 안정적으로 동작하는지를 결정하는 핵심 레이어다.
