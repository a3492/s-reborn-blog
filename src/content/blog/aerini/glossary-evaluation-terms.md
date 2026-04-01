---
title: "AI 성능이 '좋다'는 게 뭔가요? — 평가 용어 사전"
date: 2026-04-01
category: aerini
difficulty: beginner
tags: [glossary, 평가지표, Accuracy, Recall, AUC, beginner-friendly]
reading-time: 5
description: "Accuracy부터 Perplexity까지 AI 성능 평가 핵심 용어를 의료 현장 관점으로 정리"
draft: false
---

"이 AI 성능이 90%입니다"라는 말을 들으면 어떤가요? 좋은 것 같지만, 뭘 기준으로 90%인지 모르면 의미가 없습니다. 검사 민감도와 특이도가 다른 것처럼, AI 평가지표도 종류가 다릅니다.

## AI 평가 핵심 용어 7개

| 용어 | 공식 (간략) | 의료 AI 해석 |
|------|------------|-------------|
| **Accuracy (정확도)** | 전체 중 맞게 분류한 비율 | 암/정상 전체 중 맞게 분류한 비율 |
| **Precision (정밀도)** | 양성 예측 중 실제 양성 비율 | AI가 "암"이라 한 것 중 진짜 암 비율 |
| **Recall (재현율, 민감도)** | 실제 양성 중 양성 예측 비율 | 진짜 암 환자 중 AI가 찾아낸 비율 |
| **F1-score** | Precision과 Recall의 조화평균 | 두 지표를 동시에 고려한 종합 점수 |
| **AUC** | ROC 곡선 아래 면적 (0.5~1.0) | 전체적인 분류 능력의 요약값 |
| **BLEU** | 생성 텍스트와 정답 텍스트의 유사도 | AI 퇴원 요약의 품질 평가에 사용 |
| **Perplexity** | 언어 모델이 텍스트를 얼마나 잘 예측하는가 | 낮을수록 의료 언어를 잘 이해하는 것 |

## 의료 AI에서 Recall이 중요한 이유

암 진단 AI에서 Recall이 낮으면 진짜 암 환자를 놓칩니다. 이것은 치명적입니다. 반면 Precision이 낮으면 불필요한 추가 검사가 늘어납니다. 불편하지만 목숨에 지장은 없습니다.

✅ **선별 검사(Screening) AI** → Recall 최우선. 암을 하나라도 더 찾아야 합니다.

✅ **확진 검사(Confirmation) AI** → Precision 최우선. 불필요한 치료를 막아야 합니다.

❌ **Accuracy만 보는 것** → 100명 중 99명이 정상인 질병이라면, 항상 "정상"이라 해도 Accuracy 99%입니다.

## Accuracy의 함정 — 예시

| 상황 | 결과 |
|------|------|
| 희귀 질환 유병률 1% | 항상 "정상"이라 해도 Accuracy 99% |
| 이 경우 Recall | 0% (환자를 한 명도 못 찾음) |
| 올바른 평가 | AUC, F1-score, Recall 함께 봐야 함 |

⚠️ 불균형 데이터(희귀질환)에서는 Accuracy를 믿으면 안 됩니다.

---

## 더 알고 싶다면

- [의료 AI 논문에서 자주 보이는 용어 완전 정복](/blog/aerini/glossary-medical-ai-terms)
- [머신러닝 vs 딥러닝 — 용어 차이 완전 정복](/blog/aerini/glossary-ml-dl-terms)
- [AI 필수 용어 10개 — 이것만 알면 대화가 된다](/blog/aerini/glossary-ai-basics)
