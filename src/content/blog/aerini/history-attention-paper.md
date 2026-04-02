---
title: '"Attention is All You Need" — 8페이지짜리 논문이 세상을 바꿨다'
date: 2026-04-01
category: aerini
difficulty: beginner
tags: [역사, Transformer, Attention, 딥러닝역사, beginner-friendly]
reading-time: 5
description: "2017년 구글 논문 하나로 GPT·Claude·Gemini가 탄생한 Transformer 이야기"
draft: false
---

2017년 구글 연구팀 8명이 쓴 논문 한 편이 있습니다. 분량은 12페이지. 인용 횟수는 10만 회 이상. 이 논문이 없었다면 ChatGPT도, Claude도, Gemini도 없었습니다. 의학으로 치면 DNA 이중나선 발견에 맞먹는 사건입니다.

## 논문 탄생 타임라인

| 연도 | 사건 |
|------|------|
| 2014 | Seq2Seq 모델 등장 — 번역 AI의 첫 성과 |
| 2015 | Attention 메커니즘 아이디어 등장 |
| 2017 | "Attention is All You Need" 발표 — Transformer 탄생 |
| 2018 | BERT (Google), GPT-1 (OpenAI) 등장 |
| 2019 | GPT-2 (OpenAI), XLNet 등장 |
| 2020 | GPT-3 — 1,750억 파라미터 |
| 2022 | ChatGPT — 전 세계 대중화 |
| 2023 | GPT-4, Claude 2, Gemini 경쟁 시작 |

## Transformer의 핵심 아이디어 — "Attention"

이전 AI는 문장을 순서대로 처리했습니다. "나는 어제 병원에 갔다"를 읽으려면 '나' → '는' → '어제' → ... 순서대로 읽어야 했습니다. 긴 문장은 앞부분을 잊어버리는 문제가 있었습니다.

Transformer는 달랐습니다. 문장 전체를 한 번에 보면서 "어떤 단어가 어떤 단어와 연관되는가"를 동시에 계산합니다. '갔다'라는 동사를 해석할 때 '나'와 '병원'을 동시에 참조합니다. 의사가 환자 전체 차트를 한 번에 펼쳐보는 것과 비슷합니다.

## 이 논문에서 출발한 모델들

| 모델 | 회사 | 년도 | 현재 활용 |
|------|------|------|----------|
| BERT | Google | 2018 | 검색 엔진, 의료 텍스트 분류 |
| GPT 시리즈 | OpenAI | 2018~ | ChatGPT, 의료 문서 작성 |
| Claude | Anthropic | 2022~ | 임상 지원, 논문 요약 |
| Gemini | Google | 2023~ | 멀티모달 의료 AI |
| LLaMA | Meta | 2023~ | 병원 내부 배포용 |

## 논문 제목의 의미

"Attention is All You Need" — 주의 집중(Attention)만 있으면 됩니다. 순서대로 읽는 복잡한 구조(RNN, LSTM) 없이, Attention 메커니즘만으로 더 좋은 결과를 낼 수 있다는 선언이었습니다.

✅ 이 논문 이후 AI 번역, 대화, 요약, 진단 지원 모두 폭발적으로 발전했습니다.

⚠️ 하지만 Transformer도 긴 문서에서 중간 내용을 잃어버리는 한계가 있습니다.

---

## 더 알고 싶다면

- [왜 "신경망"이라고 부를까 — 뇌 구조에서 온 이름](/blog/aerini/history-neural-network-name)
- ["딥러닝"이라는 이름은 누가 지었나](/blog/aerini/history-deep-learning-name)
- [ChatGPT 탄생까지 — AI 70년 역사를 5분에](/blog/aerini/history-chatgpt-birth)
