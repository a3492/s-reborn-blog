---
title: "GPT-1에서 GPT-4까지 — OpenAI는 어떻게 세계를 바꿨나"
date: 2026-03-31
category: ai-history
description: "이 글을 읽어보세요."
thumbnail: ""
draft: false
---

## 한줄 요약

2018년 117M 파라미터짜리 GPT-1에서 시작한 OpenAI의 실험은, 4년 만에 전 세계 지식 노동의 판을 흔드는 ChatGPT로 이어졌다.

---

## GPT-1 (2018) — 전이학습의 가능성을 증명하다

2018년 6월, Alec Radford 등 OpenAI 연구진은 논문 *"Improving Language Understanding by Generative Pre-Training"*을 발표했다. 파라미터 수 1억 1700만(117M). 당시 기준으로도 크지 않았다.

핵심 아이디어는 단순했다. 대규모 텍스트로 언어 모델을 먼저 사전 훈련(pre-training)한 뒤, 소량의 레이블 데이터로 미세 조정(fine-tuning)하면 다양한 NLP 과제에서 좋은 성능을 낸다는 것이었다.

당시 NLP 연구자들에게는 충격적인 결과였다. 과제마다 별도 모델을 설계하던 관행이 뿌리째 흔들렸다.

---

## GPT-2 (2019) — "공개하기 너무 위험하다"

2019년 2월, GPT-2(1.5B 파라미터)가 등장했다. OpenAI는 모델 전체를 즉시 공개하지 않았다. 공식 이유는 "허위 정보 생성에 악용될 수 있다"였다.

결과는 역설적이었다. 단계적 공개 전략은 오히려 전 세계 언론의 집중 조명을 받았고, GPT-2는 아직 공개도 안 된 상태에서 가장 유명한 AI 모델이 됐다.

비판도 있었다. 많은 연구자들은 "실제 위험보다 마케팅 효과가 더 크다"고 지적했다. 어느 쪽이든, OpenAI는 AI 커뮤니케이션의 기술을 이 시점에 체득했다.

---

## GPT-3 (2020) — 175B, few-shot learning의 시대

2020년 5월, GPT-3(175B 파라미터)가 공개됐다. 전작의 100배 규모였다. 더 중요한 것은 *few-shot learning* 능력이었다.

프롬프트에 예시 몇 개만 넣으면, 별도 훈련 없이 새로운 과제를 수행했다. 번역, 요약, 코드 작성, 질문 답변 — 모두 하나의 모델로.

2020년 7월 API 베타 공개 이후, 수백 개의 스타트업이 GPT-3를 기반으로 창업했다. "프롬프트 엔지니어링"이라는 직군이 탄생했다.

---

## InstructGPT (2022) — RLHF, ChatGPT의 직접 전신

GPT-3는 강력했지만 제어하기 어려웠다. 지시를 따르지 않거나 유해한 내용을 생성했다.

2022년 1월, OpenAI는 InstructGPT를 발표했다. 핵심은 RLHF(Reinforcement Learning from Human Feedback). 사람이 더 나은 답변을 선택하면, 그 선호를 강화학습으로 모델에 반영하는 방식이었다.

Ouyang et al.의 논문은 "1.3B InstructGPT가 175B GPT-3보다 사람들이 선호하는 답변을 생성한다"는 결과를 보여줬다. 크기보다 정렬(alignment)이 중요하다는 첫 번째 대규모 실증이었다.

---

## ChatGPT (2022년 11월 30일) — 5일 만에 100만 사용자

Sam Altman은 훗날 이렇게 말했다. "우리는 연구 프리뷰로 조용히 내놓은 거였다."

2022년 11월 30일 출시된 ChatGPT는 5일 만에 사용자 100만 명을 돌파했다. 역사상 가장 빠른 소비자 서비스 성장이었다. 두 달 뒤에는 월간 활성 사용자 1억 명을 넘겼다.

인터페이스가 결정적이었다. API가 아니라 대화창. 누구나 즉시 사용할 수 있었다.

---

## GPT-4 (2023년 3월) — 멀티모달, USMLE 90th percentile

2023년 3월 14일 GPT-4 출시. OpenAI는 파라미터 수를 공개하지 않았지만, 성능은 명확했다.

미국 의사 면허 시험(USMLE)에서 90th percentile 수준의 점수를 기록했다. 변호사 시험(Bar Exam)에서는 상위 10% 수준. 이미지를 입력으로 받는 멀티모달 기능도 처음 공개됐다.

이후 GPT-o1(2024), GPT-o3(2025)로 이어지는 추론(reasoning) 특화 모델 라인이 분기됐다.

---

## "GPT"라는 이름이 담은 것

Generative Pre-trained Transformer. 세 단어가 이 기술의 본질을 담고 있다.

- Generative: 텍스트를 생성한다
- Pre-trained: 대규모 데이터로 미리 훈련된다
- Transformer: 2017년 Google의 *"Attention is All You Need"* 아키텍처

GPT-1부터 GPT-4까지, 아키텍처의 기본 구조는 크게 바뀌지 않았다. 달라진 것은 규모, 데이터, 그리고 정렬 기술이었다.

---

## 핵심 정리

- GPT-1(2018): 전이학습으로 NLP 과제 통합 접근 가능성 최초 증명
- GPT-2(2019): 단계적 공개로 AI 안전성 담론과 홍보 효과를 동시에 만들어냄
- GPT-3(2020): 175B, few-shot learning, API 생태계 폭발
- InstructGPT(2022): RLHF로 모델 정렬 문제를 실용적으로 해결
- ChatGPT(2022.11.30): 5일 100만 사용자, 역사상 가장 빠른 성장
- GPT-4(2023.3): USMLE 90th percentile, 멀티모달 처음 공개

---

## 관련 글

- [RLHF — AI를 '착하게' 만든 기술과 그 한계](/blog/ai-history/rlhf-instruct-tuning)
- [스케일링 법칙 — 모델을 크게 만들수록 왜 똑똑해지는가](/blog/ai-history/llm-scaling-law)
- [ChatGPT 출시 100일 — 의료계가 가장 먼저 반응한 이유](/blog/ai-history/chatgpt-launch-impact)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
