---
title: "OpenAI, Anthropic, Google — 회사마다 용어가 다르다"
date: 2026-04-01
category: aerini
difficulty: beginner
tags: [glossary, OpenAI, Anthropic, Google, Meta, AI회사, beginner-friendly]
reading-time: 5
description: "GPT·Claude·Gemini·Llama 각 회사의 모델 특징과 의료 활용 현황 비교 정리"
draft: false
---

AI 뉴스에서 GPT, Claude, Gemini, Llama가 쏟아집니다. 다 비슷해 보이지만 회사마다 철학도, 강점도, 의료 활용 방향도 다릅니다. 주요 병원에서 어떤 AI를 쓰는지 알려면 각 회사를 이해해야 합니다.

## 주요 AI 회사 & 모델 비교표

| 회사 | 대표 모델 | 특징 | 의료 활용 현황 |
|------|----------|------|--------------|
| OpenAI | GPT-4o, o1 | 범용 성능 최강, 멀티모달 | Epic EMR 통합, Nuance DAX 음성 기록 |
| Anthropic | Claude 3.5 / 3.7 | 안전성·정확성 강조, 긴 컨텍스트 | 의료 문서 분석, 임상 지원 도구 |
| Google | Gemini 1.5 Pro | 멀티모달 강점, 의료 특화 버전 존재 | Med-PaLM 2, 영상 진단 연구 |
| Meta | Llama 3 | 오픈소스, 자체 배포 가능 | 병원 내부 서버에 직접 설치 가능 |

## 모델별 특징 상세 비교

| 구분 | GPT-4o | Claude 3.7 | Gemini 1.5 Pro | Llama 3 |
|------|--------|-----------|----------------|---------|
| 컨텍스트 윈도우 | 128K | 200K | 1M | 128K |
| 오픈소스 여부 | ❌ | ❌ | ❌ | ✅ |
| 의료 특화 버전 | 일부 | 없음 | Med-PaLM | 커스텀 가능 |
| 한국어 성능 | 우수 | 우수 | 우수 | 보통 |
| 데이터 보안 | API 계약 필요 | API 계약 필요 | API 계약 필요 | 자체 서버 가능 |

## "어떤 AI를 써야 하나?" — 상황별 추천

| 상황 | 추천 모델 | 이유 |
|------|---------|------|
| 외래 진료 기록 요약 | GPT-4o | 한국어 성능 우수, API 안정적 |
| 긴 의무기록 전체 분석 | Claude 3.7 | 컨텍스트 윈도우 200K |
| 의료 영상 분석 연구 | Gemini | 멀티모달 특화, 의료 데이터 학습 |
| 병원 내부 배포 필요 | Llama 3 | 오픈소스, 외부 서버 불필요 |

✅ 개인 외래 메모는 GPT-4o나 Claude로 충분합니다.

❌ 환자 데이터를 상업용 API에 그냥 올리면 안 됩니다. 개인정보 처리 방침을 확인하세요.

⚠️ 의료 특화 학습을 받은 모델이라도 할루시네이션은 발생합니다. 검증은 필수입니다.

---

## 더 알고 싶다면

- [LLM 용어 사전 — GPT, Claude, Gemini를 이해하는 단어들](/blog/aerini/glossary-llm-terms)
- [GPT의 G, P, T는 무슨 뜻인가요?](/blog/aerini/history-gpt-meaning)
- [AI 필수 용어 10개 — 이것만 알면 대화가 된다](/blog/aerini/glossary-ai-basics)
