---
title: "응답 스키마 설계 — AI 출력을 예측 가능한 형태로 만드는 법"
date: 2026-04-02
category: harness-engineering
tags: ["응답스키마", "구조화출력", "하네스", "OutputParsing", "#cl2604021700"]
description: "AI가 자유롭게 말하도록 놔두면 시스템 통합이 불가능하다. 응답 스키마를 설계하면 AI 출력이 예측 가능한 구조가 된다."
read_time: 7
difficulty: "intermediate"
draft: false
cl: "2604021700"
thumbnail: ""
---

## 한줄 요약
AI에게 자유롭게 답하게 하는 것은 사람에게 좋다. 시스템에게는 나쁘다. 응답 스키마는 AI 출력을 시스템이 읽을 수 있는 형태로 만든다.

## 본문

### 자연어 출력의 문제

2023년 UCSF 의료 AI 팀의 사례 연구가 있다.

GPT-4를 이용해 환자 요약을 자동 생성하는 시스템을 구축했다. AI가 생성한 요약을 EMR에 자동으로 기록하는 것이 목표였다. 문제는 AI 출력이 매번 다른 형식으로 나왔다는 것이다.

```
응답 예시 1:
"환자는 62세 남성으로, 고혈압 병력이 있으며 현재 혈압은 145/90mmHg입니다..."

응답 예시 2:
"주요 소견: 62세 / 남 / 고혈압 기왕력
현재 혈압: 145/90
..."

응답 예시 3:
"1. 환자 정보: 62세 남성
2. 현재 상태: 혈압 145/90mmHg, 고혈압 병력..."
```

세 응답 모두 정보는 같다. 하지만 이 텍스트를 파싱해서 EMR 필드에 자동으로 넣으려면 코드가 세 가지 형식을 모두 처리해야 한다. 새로운 형식이 나오면 코드를 또 수정해야 한다.

---

### 응답 스키마의 개념

응답 스키마는 AI 출력의 구조를 미리 정의한다.

자유 응답 대신:
```
"환자 김민준 씨는 62세 남성으로 고혈압 병력이 있으며..."
```

구조화 응답:
```json
{
  "patient_age": 62,
  "gender": "male",
  "chief_complaint": "혈압 조절 불량",
  "vital_signs": {
    "bp": "145/90",
    "hr": 78
  },
  "past_history": ["고혈압"],
  "risk_flags": ["혈압 목표치 미달"]
}
```

시스템은 이 JSON을 파싱해서 각 필드를 EMR 폼에 자동으로 채운다. AI 출력 형식이 바뀔 걱정이 없다.

---

### 구조화 출력 구현 방법

**방법 1 — 프롬프트로 형식 지정**

프롬프트에 출력 형식을 직접 명시한다.

```
다음 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:

{
  "diagnosis": "...",
  "confidence": "high/medium/low",
  "recommended_action": "...",
  "requires_escalation": true/false
}
```

장점: 별도 도구 불필요. 단점: LLM이 형식을 어길 수 있음.

**방법 2 — Function Calling / Tool Use**

OpenAI, Anthropic API 모두 구조화 출력을 위한 공식 기능을 제공한다. 스키마를 JSON Schema로 정의하면, 모델이 그 스키마에 맞는 출력을 보장한다.

```json
{
  "type": "object",
  "properties": {
    "diagnosis": { "type": "string" },
    "confidence": {
      "type": "string",
      "enum": ["high", "medium", "low"]
    },
    "requires_escalation": { "type": "boolean" }
  },
  "required": ["diagnosis", "confidence", "requires_escalation"]
}
```

모델이 이 스키마를 벗어나는 출력을 하면 API가 거부한다. 가장 안전한 방법이다.

**방법 3 — 후처리 파싱**

AI가 마크다운이나 XML 형식으로 응답하면, 코드로 파싱해서 구조화한다.

```
AI 응답:
<diagnosis>폐렴 의심</diagnosis>
<confidence>high</confidence>
<action>흉부 X-ray 의뢰</action>
```

파싱 코드가 필요하지만, 형식이 명확하면 안정적으로 작동한다.

---

### 의료 AI에서 스키마 설계 시 고려사항

**필수 필드 vs 선택 필드 구분**

모든 응답에 반드시 있어야 하는 필드와 상황에 따라 있는 필드를 구분한다.

```json
필수:
- diagnosis (진단)
- confidence (확신도)
- requires_escalation (에스컬레이션 필요 여부)

선택:
- drug_interactions (약물 상호작용, 해당 케이스만)
- lab_recommendations (추가 검사 권고, 필요 시)
```

**확신도(confidence) 필드**

AI가 확신하지 못하는 경우에도 답을 낸다. 스키마에 확신도 필드를 넣으면, 낮은 확신도 응답은 자동으로 의사에게 검토 요청을 보내는 로직을 만들 수 있다.

**에스컬레이션 플래그**

```json
{
  "requires_escalation": true,
  "escalation_reason": "패혈증 의심 소견",
  "urgency": "immediate"
}
```

`requires_escalation: true`이면 자동으로 담당 의사에게 알림을 보내는 파이프라인에 연결한다. 자연어 응답에서는 이 로직을 구현하기 훨씬 어렵다.

---

### 스키마 버전 관리

응답 스키마도 프롬프트처럼 버전을 관리해야 한다.

스키마가 바뀌면 하위 시스템이 모두 영향을 받는다. EMR 연동 코드, 알림 시스템, 대시보드가 모두 특정 필드를 기대하고 있다.

실용적인 규칙:
- 필드 추가: 하위 호환 가능 (기존 시스템은 새 필드를 무시하면 됨)
- 필드 이름 변경: 하위 비호환 — 모든 연동 시스템 동시 업데이트 필요
- 필드 삭제: 가장 위험 — 기존 시스템이 해당 필드를 참조하고 있을 수 있음

스키마를 바꿀 때는 코드 배포만큼 신중하게 다뤄야 한다.

---

## 더 알고 싶다면

🔗 관련 글
- [출력 파싱 패턴](/blog/harness-engineering/output-parsing-patterns) — 다양한 AI 출력 형식을 파싱하는 방법
- [에러 핸들링](/blog/harness-engineering/error-handling-ai) — 스키마 파싱 실패 시 대응 전략
- [프롬프트 버전 관리](/blog/harness-engineering/prompt-versioning) — 스키마 정의가 포함된 프롬프트 관리법
- [Human-in-the-Loop](/blog/orchestration/human-in-the-loop) — 낮은 확신도 응답을 사람에게 라우팅하는 설계

[← 하네스 엔지니어링 시리즈 전체 보기](/blog/category/harness-engineering)
