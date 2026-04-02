---
title: "머신러닝 vs 딥러닝 — 용어 차이 완전 정복"
date: 2026-04-01
category: aerini
difficulty: beginner
tags: [glossary, 머신러닝, 딥러닝, ML, DL, 용어사전, beginner-friendly]
reading-time: 5
description: "Feature, Overfitting, Epoch 등 ML/DL 필수 용어를 의료 예시로 쉽게 정리"
draft: false
---

머신러닝(ML)과 딥러닝(DL)은 자주 같은 용어를 씁니다. 하지만 의미가 조금씩 다릅니다. 내과와 외과가 같은 환자를 다르게 보는 것처럼 말이죠. 핵심 용어를 비교해서 살펴봅시다.

## ML/DL 핵심 용어 8개

| 용어 | ML에서의 의미 | DL에서의 의미 | 의료 예시 |
|------|-------------|-------------|----------|
| Feature (특징) | 사람이 직접 선택한 입력값 | 모델이 스스로 학습한 패턴 | ML: 나이·혈압, DL: MRI 픽셀 패턴 |
| Label (레이블) | 정답값 | 동일 | 질환 있음(1) / 없음(0) |
| Training set | 학습에 쓰는 데이터 | 동일 | 환자 데이터 70% |
| Validation set | 하이퍼파라미터 조정용 | 동일 | 환자 데이터 15% |
| Test set | 최종 성능 평가용 | 동일 | 환자 데이터 15% (절대 학습 미사용) |
| Overfitting | 학습 데이터에만 잘 맞는 현상 | 동일 | 특정 병원 데이터에만 최적화됨 |
| Underfitting | 너무 단순해서 패턴을 못 찾는 현상 | 동일 | 단순 규칙으로 복잡한 질환 예측 실패 |
| Epoch | 전체 학습 데이터를 한 번 훑는 것 | 동일 | 교과서를 처음부터 끝까지 한 번 읽는 것 |

## Batch와 Learning rate도 알아두기

| 용어 | 설명 | 비유 |
|------|------|------|
| Batch | 한 번에 학습하는 데이터 묶음 크기 | 한 번에 외우는 단어 수 |
| Learning rate | 한 번에 얼마나 크게 가중치를 바꾸는가 | 공부할 때 메모를 얼마나 크게 수정하는가 |

## 주의할 점

✅ Test set은 절대로 학습 중에 봐서는 안 됩니다. 시험지를 미리 보는 것과 같습니다.

❌ Overfitting된 모델은 다른 병원 데이터에서 성능이 급격히 떨어집니다.

⚠️ Learning rate가 너무 크면 학습이 불안정해집니다. 너무 작으면 학습이 너무 느립니다.

## ML vs DL 가장 큰 차이

ML은 의사가 "어떤 특징을 볼지" 직접 정해줍니다. DL은 AI가 스스로 중요한 패턴을 찾아냅니다. 흉부 X-ray 판독에서 ML은 "폐 면적 비율"을 입력값으로 사용하고, DL은 픽셀 전체를 보면서 패턴을 스스로 학습합니다.

---

## 더 알고 싶다면

- [AI를 어떻게 가르치나요? — 학습 용어 사전](/blog/aerini/glossary-training-terms)
- [AI 성능이 '좋다'는 게 뭔가요? — 평가 용어 사전](/blog/aerini/glossary-evaluation-terms)
- [의료 AI 논문에서 자주 보이는 용어 완전 정복](/blog/aerini/glossary-medical-ai-terms)
