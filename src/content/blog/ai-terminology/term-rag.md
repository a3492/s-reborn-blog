---
title: "RAG — Retrieval-Augmented Generation이라는 이름에 담긴 아이디어"
date: 2026-03-31
category: ai-terminology
tags:
  - "cu2604021805"
  - "AI용어"
  - "용어사전"
  - "term-rag"

description: "RAG는 LLM이 \"모르는 것\"을 검색으로 보완하는 구조다 — 세 단어(검색·증강·생성)에 이 아이디어가 정확히 담겨 있다."
thumbnail: ""
draft: false
---


## 한줄 요약

RAG는 LLM이 "모르는 것"을 검색으로 보완하는 구조다 — 세 단어(검색·증강·생성)에 이 아이디어가 정확히 담겨 있다.

---

## 논문의 출발: Lewis et al., 2020

RAG라는 용어는 2020년 Facebook AI Research(현 Meta AI)의 Patrick Lewis와 동료들이 발표한 논문에서 공식화되었다.

> "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
> *NeurIPS 2020, Lewis et al.*

"지식 집약적(Knowledge-Intensive) NLP 작업"이라는 부제가 핵심이다. 단순한 대화가 아니라, 구체적인 사실 지식이 필요한 작업 — 의학 질문 답변, 법률 문서 해석, 최신 뉴스 요약 등 — 에서 순수 LLM의 한계를 해결하는 것이 목적이었다.

논문의 기본 구조는 간단하다.
1. 질문이 들어오면 먼저 관련 문서를 검색한다.
2. 검색된 문서를 LLM에 함께 전달한다.
3. LLM은 검색된 문서를 참고해 답변을 생성한다.

## 왜 이 이름인가: 세 단어 해부

Retrieval(검색)

"retrieve"는 "찾아서 가져오다"라는 뜻이다. 정보 검색(Information Retrieval, IR)은 수십 년 역사를 가진 분야로, 구글 검색이 대표적 응용이다. RAG에서 Retrieval은 벡터 데이터베이스나 키워드 검색을 통해 관련 문서를 찾아오는 단계를 가리킨다.

Augmented(증강)

이 단어가 RAG의 핵심 철학을 담고 있다. "augment"는 "추가하여 강화하다"는 뜻으로, 군사 용어 "force augmentation"(전력 증강)과 같은 개념이다. 대체(replace)가 아니라 보강(augment)이다.

LLM의 생성 능력을 없애는 것이 아니라, 외부 지식으로 강화한다는 뜻이다. 모델 자체를 바꾸지 않아도 되니 비용이 낮다.

Generation(생성)

최종 답변은 검색된 문서를 단순히 복사하는 것이 아니라, LLM이 생성(generate)한다. 검색된 여러 문서를 요약하고 통합하며, 질문에 맞는 자연스러운 언어로 표현하는 것은 여전히 LLM의 몫이다.

## "검색증강생성"이라는 한국어 번역의 한계

RAG의 한국어 공식 번역은 검색증강생성이다. 하지만 이 번역은 어색하다.

- "검색증강생성"이라고 말하면 대부분 무슨 뜻인지 직관적으로 와닿지 않는다.
- 정확한 의미를 전달하려면 "검색으로 강화된 생성" 또는 "검색 기반 강화 생성"이 더 낫다.
- 실제로 IT 업계에서는 한국어 번역보다 "RAG"라는 약어를 그대로 쓴다.

이것은 기술 번역의 고질적 문제다. 순서대로 번역하면 "검색-증강-생성"이 되지만, 한국어 문법상 수식어가 앞에 와야 하기 때문에 의미 전달이 뒤틀린다.

## RAG가 해결하는 문제

### 문제 1: 지식 컷오프(Knowledge Cutoff)

LLM은 훈련 데이터의 시점 이후 정보를 모른다. GPT-4의 훈련 데이터 마감일 이후에 발표된 신약, 최신 가이드라인, 어제의 뉴스를 알 수 없다.

RAG는 최신 문서를 검색해서 LLM에 전달함으로써 이 문제를 우회한다. 모델을 다시 훈련할 필요 없이 지식을 업데이트할 수 있다.

### 문제 2: 환각(Hallucination) 억제

모르는 것을 지어내는 LLM의 특성은 의료 분야에서 특히 위험하다. RAG는 실제 문서를 근거로 답변을 생성하도록 강제함으로써 환각을 줄인다.

답변의 출처를 문서와 함께 표시할 수 있어, 검증도 쉬워진다.

## 의료에서의 RAG: 근거 기반 생성

의료 관점에서 RAG를 재해석하면 "Evidence-Augmented Generation"(근거 증강 생성)이라고 볼 수 있다.

임상 질문에 답할 때:
1. 질문 수신: "2형 당뇨 환자에게 GLP-1 수용체 작용제와 SGLT-2 억제제 중 어느 것을 우선 고려하나요?"
2. 검색: 최신 ADA 가이드라인, 관련 메타분석, 심혈관 아웃컴 연구 문서 검색
3. 생성: 검색된 근거를 토대로 답변 생성, 출처 명시

이것은 근거 중심 의학(Evidence-Based Medicine, EBM)의 프로세스와 구조적으로 동일하다. 의사가 임상 질문 → 근거 검색 → 임상 적용하는 것처럼, RAG도 질문 → 문서 검색 → 답변 생성의 흐름을 따른다.

## RAG 이후의 발전

2020년 원형 RAG 이후, 여러 변형이 제안되었다.

Self-RAG (2023): 모델 스스로 언제 검색이 필요한지 판단하고, 검색 결과의 품질도 자가 평가한다.

Corrective RAG (C-RAG, 2024): 검색된 문서의 관련성을 평가하고, 품질이 낮으면 웹 검색으로 보완한다.

Graph RAG (Microsoft, 2024): 단순 문서가 아닌 지식 그래프(Knowledge Graph)를 검색 소스로 사용해 복잡한 관계 추론을 지원한다. 의료 온톨로지(예: SNOMED CT, UMLS)와 결합 가능성이 높다.

---

## 핵심 정리

- RAG는 2020년 Facebook AI Research 논문에서 공식화된 "검색 + 생성" 하이브리드 구조다
- "Augmented(증강)"는 대체가 아닌 보강이라는 핵심 철학을 담고 있다
- LLM의 두 가지 핵심 한계인 지식 컷오프와 환각을 검색으로 보완한다
- 의료에서는 "근거 증강 생성(Evidence-Augmented Generation)"으로 재해석할 수 있다
- Self-RAG, Corrective RAG, Graph RAG 등으로 계속 발전 중이다

## 관련 글

- [LLM — Large Language Model에서 '대형'과 '언어'가 의미하는 것](/blog/ai-terminology/term-llm)
- [환각 vs 작화증 — AI 오류를 의학 용어로 정확하게 부르는 법](/blog/ai-terminology/term-hallucination-vs-confabulation)
- [의료 에이전트 평가 — 안전성 측정이 정확도보다 중요한 이유](/blog/ai-agents/agent-evaluation-medical)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
