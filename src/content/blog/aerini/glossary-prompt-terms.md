---
title: "프롬프트 용어 사전 — 제로샷부터 CoT까지"
date: 2026-04-01
category: aerini
difficulty: beginner
tags: [glossary, 프롬프트, 프롬프트엔지니어링, 용어사전, beginner-friendly]
reading-time: 5
description: "Zero-shot, CoT 등 프롬프트 핵심 용어를 실전 예시와 함께 정리"
draft: false
---

AI에게 "잘 물어보는 것"을 프롬프트 엔지니어링이라고 합니다. 처방전을 잘 써야 좋은 약이 나오듯, 프롬프트를 잘 써야 좋은 답이 나옵니다. 핵심 용어부터 익혀봅시다.

## 프롬프트 핵심 용어 정리

| 용어 | 설명 | 의료 예시 |
|------|------|----------|
| Zero-shot | 예시 없이 바로 질문하는 방식 | "이 증상의 감별 진단을 알려줘" |
| Few-shot | 예시 2~3개를 먼저 보여주고 질문 | "이런 형식으로 SOAP 노트를 써줘: [예시]" |
| Chain-of-Thought (CoT) | "단계별로 생각해줘"라고 요청해 추론 유도 | "왜 이 진단이 맞는지 단계별로 설명해줘" |
| System Prompt | AI의 역할과 행동 방식을 정의하는 지시문 | "당신은 내과 전공의를 돕는 AI입니다" |
| User Prompt | 사용자가 실제로 입력하는 질문 | "오늘 입원한 환자 요약해줘" |
| Temperature | 답변의 창의성 조절 (0~1) | 0: 항상 동일한 진단, 1: 다양한 가능성 탐색 |
| Top-p | 확률 상위 p%의 단어만 선택하는 방식 | Temperature와 함께 답변 다양성 조절 |
| Context | AI가 현재 대화에서 기억하는 전체 내용 | 이전 대화, 환자 정보, 지시사항 모두 포함 |

## 실전 프롬프트 예시

Zero-shot 방식:
```
이 환자의 감별 진단 3가지를 알려주세요.
[증상: 38.5도 발열, 기침, 흉통]
```

Few-shot 방식:
```
아래 형식으로 SOAP 노트를 작성해주세요.

예시)
S: 3일간 기침, 발열
O: T 38.2, 폐 수포음
A: 폐렴 의심
P: 항생제 처방

실제 케이스)
S: 2일간 두통, 목 경직
```

Chain-of-Thought 방식:
```
이 환자에게 어떤 항생제가 적합한지 단계별로 생각해주세요.
1단계: 감염 부위 파악
2단계: 예상 균주 확인
3단계: 항생제 선택
```

## 어떤 방식을 언제 써야 할까

✅ 간단한 질문 → Zero-shot으로 충분합니다.

✅ 형식이 중요한 문서 작성 → Few-shot으로 예시를 먼저 보여주세요.

✅ 복잡한 임상 추론 → CoT로 단계별 사고를 유도하세요.

❌ Temperature를 1로 설정하면 의료 정보가 부정확해질 수 있습니다. 임상 용도는 0.2~0.4를 권장합니다.

---

## 더 알고 싶다면

- [AI 필수 용어 10개 — 이것만 알면 대화가 된다](/blog/aerini/glossary-ai-basics)
- [LLM 용어 사전 — GPT, Claude, Gemini를 이해하는 단어들](/blog/aerini/glossary-llm-terms)
- [AI를 어떻게 가르치나요? — 학습 용어 사전](/blog/aerini/glossary-training-terms)
