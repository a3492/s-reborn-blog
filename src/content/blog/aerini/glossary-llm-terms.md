---
title: "LLM 용어 사전 — GPT, Claude, Gemini를 이해하는 단어들"
date: 2026-04-01
category: aerini
difficulty: beginner
tags: [glossary, LLM, GPT, Claude, 용어사전, beginner-friendly]
reading-time: 5
description: "GPT·Claude·Gemini 뉴스를 읽을 때 꼭 필요한 LLM 핵심 용어 정리"
draft: false
---

GPT, Claude, Gemini 기사를 읽다 보면 낯선 용어가 쏟아집니다. 마치 처음 의대에 들어가서 해부학 용어를 접하는 느낌이죠. 핵심 8개만 잡아두면 AI 뉴스가 달리 보입니다.

## LLM 핵심 용어 8개

| 용어 | 설명 | 비고 |
|------|------|------|
| **Parameter (파라미터)** | 모델이 학습으로 얻은 수십억 개의 숫자값 | GPT-4는 약 1조 개 추정 |
| **Training data (학습 데이터)** | 모델이 학습한 텍스트 원본 | 인터넷 텍스트, 책, 논문 등 |
| **Inference (추론)** | 학습된 모델이 실제 질문에 답하는 과정 | 병원에서 AI가 작동하는 순간 |
| **RLHF** | 인간 피드백으로 모델을 강화학습하는 방식 | 좋은 답변에 점수를 줘서 모델 개선 |
| **Alignment** | AI가 인간의 의도에 맞게 행동하도록 하는 기술 | 위험한 의료 정보를 거부하게 만드는 것 |
| **Hallucination** | 없는 사실을 있다고 생성하는 현상 | 실제 없는 논문 DOI를 자신감 있게 제시 |
| **Context window** | 한 번에 처리할 수 있는 최대 텍스트 양 | 긴 EMR 기록 전체를 넣을 수 있는지 결정 |
| **Tokenizer** | 텍스트를 토큰으로 쪼개는 도구 | 한국어는 영어보다 토큰 소모가 많음 |

## "파라미터가 많다 = 더 똑똑하다?" — 비교

| 구분 | 소형 모델 (7B) | 대형 모델 (700B) |
|------|--------------|----------------|
| 속도 | 빠름 | 느림 |
| 비용 | 저렴 | 비쌈 |
| 정확도 | 단순 작업에 충분 | 복잡한 추론에 유리 |
| 의료 적용 | 간단한 문서 정리 | 복잡한 감별 진단 |

✅ 단순 요약 작업은 소형 모델로 충분합니다.

❌ 파라미터 수만 보고 모델을 선택하면 안 됩니다. 의료 특화 학습 여부가 더 중요합니다.

⚠️ Hallucination은 파라미터가 많아도 완전히 없어지지 않습니다. 검증은 필수입니다.

## 한 줄 정리

LLM은 방대한 텍스트(Training data)로 수십억 개의 숫자(Parameter)를 학습합니다. 질문이 들어오면 토크나이저가 텍스트를 쪼개고(Tokenizer), 컨텍스트 윈도우 안에서 답변을 생성(Inference)합니다. RLHF와 Alignment 덕분에 위험한 답변은 걸러집니다.

---

## 더 알고 싶다면

- [AI 필수 용어 10개 — 이것만 알면 대화가 된다](/blog/aerini/glossary-ai-basics)
- [OpenAI, Anthropic, Google — 회사마다 용어가 다르다](/blog/aerini/glossary-ai-companies)
- [GPT의 G, P, T는 무슨 뜻인가요?](/blog/aerini/history-gpt-meaning)
