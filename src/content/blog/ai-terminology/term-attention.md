---
title: "Attention 메커니즘 — '주의'라는 인지과학 개념을 AI에 가져온 이유"
date: 2026-03-31
category: ai-terminology
tags:
  - "cu2604021805"
  - "AI용어"
  - "용어사전"
  - "term-attention"

description: "AI의 \"attention\"은 인지과학의 선택적 주의(selective attention) 개념을 수학적으로 구현한 것이며, 이 이름 선택은 기술의 본질을 정확히 포착한다."
thumbnail: ""
draft: false
---


## 한줄 요약

AI의 "attention"은 인지과학의 선택적 주의(selective attention) 개념을 수학적으로 구현한 것이며, 이 이름 선택은 기술의 본질을 정확히 포착한다.

## 인지과학의 attention — 1890년 윌리엄 제임스

"attention"을 과학적으로 정의하려는 시도는 오래됐다. 미국의 철학자이자 심리학자 윌리엄 제임스(William James)는 1890년 저서 "The Principles of Psychology"에서 이렇게 썼다.

> "Everyone knows what attention is. It is the taking possession of the mind, in clear and vivid form, of one out of what seem several simultaneously possible objects or trains of thought."

"모두가 주의가 무엇인지 안다. 동시에 존재하는 여러 가능한 대상 중 하나를 마음이 선명하고 생생하게 포착하는 것이다."

이것이 선택적 주의(selective attention)의 고전적 정의다. 우리 뇌는 모든 감각 정보를 동등하게 처리하지 않는다. 중요한 것을 골라 더 많은 인지 자원을 배분한다.

## 신경과학의 attention

1980~90년대 신경과학은 주의가 뇌에서 어떻게 구현되는지를 밝혀냈다. 주의를 기울이는 자극은 뇌의 시각 피질에서 더 강한 신호를 만들어낸다. 뇌는 문자 그대로 "가중치를 달리 부여"한다.

이 신경과학적 메커니즘은 AI attention과 구조적으로 닮았다. 다른 정보에 다른 가중치를 부여한다.

## Bahdanau et al.(2014) — NLP에 attention 도입

AI에서 "attention"이라는 단어가 기술적 메커니즘으로 쓰이기 시작한 것은 2014년이다. 디미트리 바흐다나우(Dzmitry Bahdanau), 조경현, 요슈아 벤지오의 논문 "Neural Machine Translation by Jointly Learning to Align and Translate"이 그 시작이다.

당시 기계 번역은 RNN(순환 신경망)으로 했는데, 입력 문장 전체를 하나의 고정된 벡터로 압축해야 했다. 긴 문장에서 정보가 손실됐다. 바흐다나우 등은 번역할 때 원문의 어느 부분을 봐야 하는지를 동적으로 계산하는 방법을 제안했다 — 이것이 attention이다.

## 왜 이 이름인가

바흐다나우 팀이 이 메커니즘에 "attention"이라는 이름을 선택한 것은 정확한 은유였다.

인지과학의 selective attention이 하는 일: 입력 정보 중 지금 과제에 중요한 부분에 더 많은 처리 자원을 배분.

AI attention이 하는 일: 출력 토큰을 생성할 때 입력 시퀀스의 각 위치에 서로 다른 가중치를 부여.

구조가 같다. "어디를 봐야 하는가"를 결정하는 메커니즘. 이름의 선택은 의도적이었고, 연구자들 사이에서 즉시 공감을 얻었다.

## Self-attention — 스스로에게 주의를 기울인다

2017년 Transformer 논문의 핵심 기여는 "self-attention"이다. 번역에서처럼 입력과 출력 사이의 attention이 아니라, 입력 시퀀스 내의 각 원소가 같은 시퀀스의 다른 원소들에 attention을 기울이는 것이다.

"나는 어제 그 책을 읽었는데 그것이 참 좋았다"에서 "그것"이 "책"을 가리킨다는 것을 파악하려면 — "그것"이 "책"에 attention을 기울여야 한다. Self-attention은 이런 문장 내부의 관계를 포착한다.

## 의사의 "임상 주의"와의 비유

의료계에서 attention은 중요한 개념이다. 의사는 수많은 증상과 검사 결과 중 지금 이 환자에게 중요한 정보에 선택적으로 집중한다 — "임상 주의(clinical attention)"이다.

AI attention 메커니즘은 이와 구조적으로 같다. 수백 페이지의 의무 기록 중 지금 질문에 관련된 부분에 더 높은 가중치를 부여한다. 의사들에게 attention 메커니즘을 설명할 때 이 비유는 효과적이다.

## 핵심 정리

- 인지과학의 selective attention(1890년 윌리엄 제임스)에서 개념 차용
- 2014년 Bahdanau et al. 논문에서 AI 기계 번역에 처음 적용
- "어디를 봐야 하는가" — 입력의 각 위치에 다른 가중치 부여
- 2017년 Transformer의 self-attention으로 확장 — 시퀀스 내부 관계 포착
- 의료 임상 주의와 구조적으로 같은 메커니즘

## 관련 글

- [Transformer — 논문 저자들이 이 이름을 고른 진짜 이유](/blog/ai-terminology/term-transformer)
- [임베딩 — '삽입'이라는 수학 개념이 AI의 핵심어가 된 이유](/blog/ai-terminology/term-embedding)
- [LLM — Large Language Model에서 '대형'과 '언어'가 의미하는 것](/blog/ai-terminology/term-llm)
