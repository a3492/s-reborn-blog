---
title: "RAG는 왜 '걸레'라는 뜻인가요? — 이름의 유래"
date: 2026-04-01
category: aerini
difficulty: beginner
tags: [역사, RAG, 검색증강생성, Meta, beginner-friendly]
reading-time: 5
description: "우연히 걸레(rag)와 같은 이름이 된 RAG의 유래와 의료 AI에서의 활용"
draft: false
---

RAG를 처음 들은 의사들이 종종 묻습니다. "RAG가 영어로 걸레 아닌가요?" 맞습니다. 하지만 이건 완전히 우연의 일치입니다. AI 역사에서 가장 재미있는 이름 사고 중 하나입니다.

## RAG의 정체

RAG = Retrieval-Augmented Generation

| 글자 | 영어 | 의미 |
|------|------|------|
| R | Retrieval | 검색 — 외부 문서 DB에서 관련 정보를 찾음 |
| A | Augmented | 증강 — 찾은 정보를 AI 답변에 더함 |
| G | Generation | 생성 — 최종 답변을 만들어냄 |

영어 rag(넝마, 걸레)와는 전혀 관련 없는 약어입니다. 그냥 첫 글자를 따다 보니 우연히 같아졌습니다.

## RAG 탄생 타임라인

| 연도 | 사건 |
|------|------|
| 2020년 | Meta(Facebook) AI 연구팀 Patrick Lewis 등이 논문 발표 |
| 2020년 | "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" |
| 2022년 | ChatGPT 이후 RAG가 의료 AI 핵심 기술로 주목 |
| 2023년~ | 병원 EMR, 가이드라인 기반 RAG 시스템 상용화 |

## "도서관에서 책 찾아 읽고 답하는 AI" 비유

일반 LLM은 학습 당시 외운 것만 답합니다. 2022년에 학습을 마쳤다면, 2024년 새 가이드라인은 모릅니다. 마치 국가고시를 준비하던 의대생이 2022년 교과서만 보고 2024년 임상을 하는 것과 같습니다.

RAG를 쓰면 달라집니다. AI가 질문을 받으면 먼저 도서관(Vector DB)에 가서 관련 책을 찾습니다. 그 책을 읽고 나서 답을 만듭니다.

## 의료에서 RAG가 중요한 이유

| 일반 LLM | RAG 기반 LLM |
|---------|------------|
| 학습 당시 데이터만 사용 | 실시간 최신 정보 검색 가능 |
| 최신 가이드라인 모를 수 있음 | 최신 가이드라인 검색 후 답변 |
| 출처 불분명 | 어떤 문서에서 찾았는지 명시 가능 |
| 할루시네이션 위험 높음 | 실제 문서 기반이라 위험 낮음 |

✅ 병원에서 RAG를 쓰면 "이 답변은 2025 KDCA 가이드라인 3페이지에서 참조"처럼 출처가 명시됩니다.

❌ RAG도 잘못된 DB를 연결하면 잘못된 정보를 찾아옵니다. DB 품질이 중요합니다.

⚠️ RAG = 걸레가 아닙니다. 하지만 잘못 쓰면 걸레가 됩니다.

---

## 더 알고 싶다면

- [AI 필수 용어 10개 — 이것만 알면 대화가 된다](/blog/aerini/glossary-ai-basics)
- [AI가 "환각"을 본다 — 이 표현은 어디서 왔나](/blog/aerini/history-word-hallucination)
- [LLM 용어 사전 — GPT, Claude, Gemini를 이해하는 단어들](/blog/aerini/glossary-llm-terms)
