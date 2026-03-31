---
title: "Attention Is All You Need — Transformer가 세상을 바꾼 8페이지 논문"
date: 2026-03-31
category: ai-history
description: "2017년 Google Brain 팀이 발표한 단 8페이지 논문이 번역 품질을 새로 쓰고, 이후 ChatGPT·GPT-4·Claude·Gemini 모든 대형 언어 모델의 토대가 됐다."
thumbnail: ""
draft: false
---

## 한줄 요약

2017년 Google Brain 팀이 발표한 단 8페이지 논문이 번역 품질을 새로 쓰고, 이후 ChatGPT·GPT-4·Claude·Gemini 모든 대형 언어 모델의 토대가 됐다.

---

## RNN의 한계

2017년 이전 자연어 처리의 주류는 RNN(Recurrent Neural Network)과 그 변형인 LSTM(Long Short-Term Memory)이었다. 구조적으로 문장을 왼쪽에서 오른쪽으로 순차적으로 처리했다.

문제는 두 가지였다:

**첫째, 순차 처리의 속도 한계**: "나는 어제 학교에서 친구를 만났다"를 처리하려면 '나' → '는' → '어제' → ... 순서대로 각 단어를 처리해야 했다. 병렬화가 불가능했다.

**둘째, 장거리 의존성**: "어제 서울 학교에서 만난 그 친구가 ...중략... 결국 나를 기억하지 못했다"처럼 긴 문장에서 초반의 "친구"와 후반의 "기억"을 연결하기 어려웠다. 긴 문장일수록 성능이 떨어졌다.

---

## Attention 메커니즘: 직관적 이해

Attention은 2015년 바흐다나우(Bahdanau) 등이 먼저 제안했다. 그러나 RNN의 보조 수단으로만 사용됐다.

Attention의 직관을 의료적 비유로 설명하면 이렇다:

경험 많은 방사선과 의사가 흉부 X-ray를 볼 때, 사진 전체를 균일하게 보지 않는다. 폐문부, 심장 경계, 횡격막 각도 — 특정 부위에 집중한다. 그리고 각 부위가 다른 부위와 어떻게 연관되는지를 동시에 판단한다. 이것이 Attention이다.

Attention은 각 단어(또는 토큰)가 다른 모든 단어와 얼마나 관련이 있는지를 동시에 계산한다. "번역"의 경우: 한국어 "사과"를 영어로 옮길 때, 앞뒤 맥락 전체를 한꺼번에 참고한다.

---

## 2017년 6월: 논문의 탄생

논문 제목은 도발적이었다: **"Attention Is All You Need"**

저자는 8명: Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan Gomez, Łukasz Kaiser, Illia Polosukhin.

이들은 RNN을 완전히 버리고 Attention만으로 모델을 구성하는 **Transformer** 아키텍처를 제안했다.

핵심 혁신, **Self-Attention**:
- 각 단어가 문장 내 모든 다른 단어에 대한 "관련성 점수"를 계산한다.
- 이 계산은 병렬로 이뤄진다.
- 결과: 훨씬 빠른 훈련, 훨씬 긴 맥락 처리 가능.

WMT 2014 영-독 번역 벤치마크에서 이전 최고 모델을 2 BLEU 포인트 이상 앞서는 결과를 냈다. 훈련 비용은 오히려 낮았다.

---

## "Transformer"라는 이름의 유래

이름에 대한 공식 기록은 없다. 저자 중 한 명인 Ashish Vaswani는 인터뷰에서 이렇게 말했다:

> "우리는 모델에 멋진 이름이 필요했다. Transformer는 '변환하는 것'이라는 의미에서 자연스럽게 나왔다."

일부는 전기 변압기(electrical transformer)에서 왔다고도 하고, 당시 인기를 끌던 음악 생성 모델(Music Transformer)에서 영감을 받았다는 설도 있다.

---

## 6명이 떠난 이야기

논문 발표 후 구글 내부에서 Transformer의 가능성을 먼저 파악한 것은 외부였다. 8명의 저자 중 6명이 2018–2019년 사이 구글을 떠났다. 그들 중 여럿이 AI 스타트업을 창업했다.

가장 주목받은 케이스: Noam Shazeer는 구글을 나와 Character.AI를 공동 창업했다. Aidan Gomez는 Cohere를 창업했다.

구글은 Transformer를 만들었지만, 그것을 상용화한 것은 OpenAI(GPT 시리즈), Anthropic(Claude), Cohere, Meta(LLaMA) 등이었다. 역사의 아이러니다.

---

## Transformer 이후의 세계

Transformer는 언어 모델에 그치지 않았다:
- **Vision Transformer (ViT, 2020)**: 이미지 인식에 Transformer 적용
- **AlphaFold 2 (2021)**: 단백질 구조 예측에 Transformer 적용
- **Whisper (2022)**: 음성 인식에 Transformer 적용
- **ChatGPT, GPT-4, Claude, Gemini**: 모두 Transformer 기반

2017년 논문의 인용 수는 2026년 현재 15만 건을 넘는다. 현대 AI의 거의 모든 것이 이 8페이지에서 시작됐다.

---

## 핵심 정리

- RNN의 순차 처리 한계와 장거리 의존성 문제를 Transformer의 Self-Attention이 해결했다.
- 2017년 구글 브레인 팀의 "Attention Is All You Need" 논문이 현대 대형 언어 모델의 토대를 만들었다.
- 8명의 저자 중 6명이 이후 구글을 떠나 스타트업을 창업했고, 구글의 경쟁자가 됐다.
- Transformer는 언어를 넘어 이미지, 음성, 단백질 구조 예측 등 AI 전 분야로 확산됐다.

## 관련 글

- [GPT-1에서 GPT-4까지 — OpenAI는 어떻게 세계를 바꿨나](/blog/ai-history/gpt-history)
- [RLHF — AI를 '착하게' 만든 기술의 탄생 배경](/blog/ai-history/rlhf-instruct-tuning)
- [스케일링 법칙 — 모델을 크게 만들수록 왜 똑똑해지는가](/blog/ai-history/llm-scaling-law)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
