---
title: "Foundation Model(파운데이션 모델)이 뭐예요?"
date: 2026-03-31
category: aerini
difficulty: beginner
tags: [foundation-model, llm, fine-tuning, gpt, claude, ai-basics]
reading-time: 5
description: GPT-4, Claude처럼 대규모로 사전학습된 AI 기반 모델
draft: false
---

## 한줄 요약

Foundation Model은 방대한 데이터로 미리 학습된 거대 AI 모델이에요. GPT-4, Claude가 대표적이며, 다양한 작업에 재활용할 수 있어요.

---

## 왜 알아야 할까?

- 💡 ChatGPT, Claude, Gemini가 왜 그렇게 다양한 질문에 답할 수 있는지 이해해요
- 💡 의료 전용 AI와 일반 AI의 차이를 설명할 수 있어요
- 💡 Fine-tuning, RAG 같은 개념의 기반이 돼요
- 💡 의료 AI 개발 비용과 기간에 대해 현실적 감각을 가질 수 있어요

## 이게 뭐예요?

**Foundation Model(파운데이션 모델)**은 인터넷 텍스트, 책, 코드 등 엄청난 양의 데이터로 사전 학습된 대규모 AI 모델이에요. "기반(Foundation)" 이라고 부르는 이유는, 이 모델 위에 다양한 특화 AI를 쉽게 만들 수 있기 때문이에요.

GPT-4, Claude, Gemini, LLaMA가 대표적인 Foundation Model이에요. 수조 단어를 학습해서 언어를 폭넓게 이해하고, 다양한 작업을 수행할 수 있어요.

🏥 **비유 1: 의대 졸업 = Foundation Model**

의대를 졸업한 의사는 기초의학, 임상의학 전반을 배웠어요. 이 기본기가 Foundation Model이에요. 이후 내과 전공의 수련은 **Fine-tuning(미세조정)**이에요. 기본기(Foundation) 위에 전문 능력을 쌓는 거예요.

🏥 **비유 2: 기본기 갖춘 의사가 여러 과를 돌 수 있는 것처럼**

의대 졸업생은 내과 환자도 보고, 외과 수술도 참여하고, 소아과 회진도 돌 수 있어요. 특화되진 않았지만 넓은 기본기 덕분이에요. Foundation Model도 번역, 요약, 코딩, Q&A, 글쓰기 등 다양한 작업을 처음부터 다시 학습하지 않아도 수행해요.

**한줄 정리:** Foundation Model = 모든 것의 기반이 되는 거대한 기초 AI. 전공 전 의대 교육처럼 폭넓은 능력을 가져요.

## 예시를 들어볼게

**예시 1 — 일반 Foundation Model 활용**

> GPT-4(Foundation Model)에게 의학 논문 요약, 환자 편지 작성, 코드 생성, 외국어 번역을 모두 시킬 수 있어요.

하나의 모델이 전혀 다른 작업들을 처리해요. 이것이 Foundation Model의 특징이에요.

**예시 2 — Fine-tuning 예시**

> Foundation Model(GPT-4) + 의료 기록 수백만 건으로 추가 학습 = 의료 특화 모델
> 이제 이 모델은 의료 맥락을 훨씬 잘 이해해요.

기반을 바꾸지 않고, 특화 학습만 추가하는 거예요.

**예시 3 — 의료 전용 Foundation Model**

> **Med-PaLM 2** (구글): 의료 시험에서 전문의 수준 성적
> **BioMedLM** (스탠포드): 생명의학 논문 특화 모델
> **ClinicalBERT**: 임상 노트 분석 특화 모델
> **HuatuoGPT**: 중국어 의료 상담 특화 모델

일반 Foundation Model을 의료 데이터로 Fine-tuning하거나, 처음부터 의료 데이터로 학습한 모델들이에요.

## 의료에서는 이렇게 써요

**활용 1: 일반 Foundation Model 활용**

❌ 의료 전용 AI 없음 → 일반 AI는 못 씀: 이런 생각은 틀렸어요

✅ GPT-4, Claude 같은 일반 Foundation Model도 프롬프트만 잘 짜면 의료 보조 작업에 충분히 유용해요

진료기록 요약, 환자 설명 자료 초안, 의학 논문 번역에 지금 당장 쓸 수 있어요.

**활용 2: 의료 특화 Fine-tuning 모델 선택**

❌ 아무 AI나 선택: "AI면 다 똑같지"

✅ 목적에 맞는 모델 선택: 영상 판독 보조엔 Computer Vision 특화, 임상 노트 분석엔 ClinicalBERT 계열

어떤 Foundation Model 기반인지, 어떤 데이터로 Fine-tuning 됐는지 확인해야 해요.

**활용 3: 비용 대비 효과 판단**

❌ 모든 의료 AI를 처음부터 개발: 수십억 원, 수년의 시간 필요

✅ Foundation Model 위에 Fine-tuning: 훨씬 적은 비용과 시간으로 특화 AI 개발 가능

Foundation Model 덕분에 소규모 병원도 특화 AI를 만들 수 있는 시대가 됐어요.

## 주의할 점 ⚠️

⚠️ **Foundation Model도 의료 정보를 틀릴 수 있어요**

일반 데이터로 학습됐기 때문에 최신 가이드라인이나 드문 질환에서 오류가 생길 수 있어요. 의료 목적 사용 시 반드시 검증이 필요해요.

⚠️ **의료 특화 모델이라고 항상 더 좋은 건 아니에요**

특정 의료 작업엔 특화 모델이 낫지만, 일반 이해력은 오히려 Foundation Model이 나을 수 있어요. 작업에 맞는 모델을 선택해야 해요.

⚠️ **Foundation Model은 계속 업데이트돼요**

GPT-3, 4, 4o처럼 버전이 계속 올라가요. 현재 성능 평가가 6개월 뒤엔 달라질 수 있어요. AI 분야는 빠르게 변하므로 최신 정보를 주기적으로 확인해야 해요.

## 더 알고 싶다면

- [생성형 AI가 뭐예요?](/blog/aerini/what-is-generative-ai)
- [NLP(자연어처리)가 뭐예요?](/blog/aerini/what-is-nlp)
- [AI 편향(Bias)이 뭐예요?](/blog/aerini/what-is-ai-bias)

[🩺 모든 애린이 글 보기](/blog/category/aerini)
