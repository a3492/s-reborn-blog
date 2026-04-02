---
title: "Temperature가 뭐예요?"
date: 2026-03-31
category: aerini
difficulty: beginner
tags: [temperature, llm, prompt-engineering, ai-basics]
reading-time: 4
description: AI의 창의성을 조절하는 숫자 하나의 의미
draft: false
---

## 한줄 요약

Temperature는 AI 답변의 '창의성 조절 손잡이'예요. 0에 가까울수록 예측 가능한 답, 1에 가까울수록 다양하고 창의적인 답이 나와요.

---

## 왜 알아야 할까?

- 💡 같은 질문인데 왜 매번 다른 답이 나오는지 이해할 수 있어요
- 💡 진단 관련 질문엔 낮게, 아이디어 회의엔 높게 설정하면 효율이 올라가요
- 💡 ChatGPT나 Claude API를 직접 사용할 때 꼭 알아야 하는 개념이에요
- 💡 AI 답변이 왜 틀렸는지 파악하는 데 도움이 돼요

## 이게 뭐예요?

Temperature는 AI가 다음 단어를 고를 때 얼마나 '다양하게' 선택할지 결정하는 숫자예요. 보통 0에서 1 사이 값을 사용해요.

AI는 문장을 만들 때 "다음에 올 가능성이 높은 단어" 목록을 계산해요. Temperature가 낮으면 항상 1위 단어를 고르고, 높으면 2위, 3위 단어도 선택될 확률이 생기는 거예요.

🏥 비유 1: 의대 시험 vs 브레인스토밍

의대 시험에서는 "폐렴 치료 1차 항생제는?" 라는 질문에 정해진 답이 있어요. 틀리면 안 되죠. 이게 Temperature 0에 가까운 상황이에요. 반면 과 회의에서 "새로운 환자 교육 방법이 없을까?" 라고 물을 때는 다양한 아이디어가 환영받아요. 이게 Temperature 1에 가까운 상황이에요.

🏥 비유 2: 수술 중 정밀도 vs 아이디어 회의

수술 중엔 "이 다음 단계는?"이 딱 하나예요. 임의로 바꾸면 안 돼요. 하지만 신규 사업 아이디어 회의에서는 엉뚱한 제안도 가치 있어요. Temperature가 바로 이 차이를 만들어요.

한줄 정리: Temperature = AI 창의성의 볼륨 조절기. 낮으면 정확하고 예측 가능, 높으면 창의적이지만 가끔 엉뚱해요.

## 예시를 들어볼게

예시 1 — 일반 대화 (Temperature 0.7)

> 질문: "오늘 저녁 뭐 먹을까?"
> 답변 A: "파스타는 어때요?"
> 답변 B: "근처 한식당 추천해요!"
> 답변 C: "집에 있는 재료로 볶음밥 어때요?"

매번 다른 답이 나와요. 대화가 자연스럽고 다양해요.

예시 2 — 코드 생성 (Temperature 0.2)

> 질문: "파이썬으로 숫자 합산하는 함수 짜줘"
> 매번 거의 동일한 코드가 나와요. 코드는 정답이 있으니까요.

예시 3 — 의료 상황 (Temperature 0.1)

> 질문: "고혈압 1기 환자의 1차 약물 치료는?"
> 답변: "생활 습관 교정 후 ACE inhibitor 또는 ARB를 고려합니다."

Temperature가 낮을수록 가이드라인에 충실한 답이 나와요. 임의로 다른 답이 나오면 위험하죠.

## 의료에서는 이렇게 써요

활용 1: 진단 보조 — Temperature 낮게 (0.1~0.2)

❌ Temperature 0.8로 진단 질문: "흉통 환자에게 뭘 의심해야 할까?" → 매번 다른 순서, 가끔 엉뚱한 감별진단 포함

✅ Temperature 0.1로 진단 질문: 동일하게 → 가이드라인 기반의 일관된 감별진단 목록

진단처럼 정답이 중요한 영역은 낮은 Temperature가 필수예요.

활용 2: 환자 설명 자료 — Temperature 중간 (0.4~0.6)

❌ Temperature 0로 환자 설명 생성: 매번 같은 문장, 딱딱한 표현

✅ Temperature 0.5로 환자 설명 생성: 자연스럽고 친근한 표현, 약간의 다양성

환자 설명 자료는 정확하면서도 읽기 쉬워야 해요. 중간 값이 적절해요.

활용 3: 연구 아이디어 — Temperature 높게 (0.7~0.9)

❌ Temperature 0.1로 "새로운 연구 주제 추천해줘": 뻔한 주제만 나와요

✅ Temperature 0.8로 동일 질문: 예상 못한 새로운 관점과 아이디어가 나와요

창의성이 필요한 작업엔 높은 Temperature가 도움이 돼요.

## 주의할 점 ⚠️

⚠️ Temperature 높다고 항상 좋은 건 아니에요

Temperature가 너무 높으면 AI가 존재하지 않는 약물명이나 잘못된 가이드라인을 자신 있게 말할 수 있어요. 의료 정보는 반드시 낮은 Temperature와 함께 출처 확인이 필요해요.

⚠️ 0이 '항상 맞는 답'을 보장하지 않아요

Temperature 0은 "가장 그럴듯한 답을 항상 선택"하는 것이지, "항상 정확한 답"이 아니에요. AI 자체가 잘못 학습됐다면 0이어도 틀릴 수 있어요.

⚠️ Temperature는 모델마다 다르게 작동해요

같은 Temperature 0.5라도 GPT-4와 Claude의 결과물 스타일이 달라요. 모델을 바꿀 때마다 Temperature도 다시 조정해봐야 해요.

## 더 알고 싶다면

- [Prompt Engineering이 뭐예요?](/blog/aerini/what-is-prompt-engineering)
- [Hallucination이 뭐예요?](/blog/aerini/what-is-hallucination)
- [Chain of Thought가 뭐예요?](/blog/aerini/what-is-chain-of-thought)

[🩺 모든 애린이 글 보기](/blog/category/aerini)
