---
title: "의료 AI 논문에서 자주 보이는 용어 완전 정복"
date: 2026-04-01
category: aerini
difficulty: beginner
tags: [glossary, 의료AI, 논문, AUC, 통계, beginner-friendly]
reading-time: 5
description: "AUC-ROC부터 External validation까지 의료 AI 논문 핵심 용어 총정리"
draft: false
---

의료 AI 논문 결과 섹션에서 AUC 0.92, Sensitivity 89%... 이런 숫자들이 나옵니다. 이게 좋은 건지 나쁜 건지 모르면 논문 읽기가 막막합니다. 딱 8개 용어만 잡으면 결과 섹션이 술술 읽힙니다.

## 의료 AI 논문 핵심 용어 8개

| 용어 | 설명 | 임상 의미 |
|------|------|----------|
| **AUC-ROC** | 모델의 전반적 분류 능력 (0.5~1.0) | 0.9 이상이면 우수, 0.7 이하면 재검토 필요 |
| **Sensitivity (민감도)** | 실제 양성 중 AI가 양성으로 맞춘 비율 | 암 환자를 몇 명이나 찾아냈는가 |
| **Specificity (특이도)** | 실제 음성 중 AI가 음성으로 맞춘 비율 | 정상인을 얼마나 정확히 정상이라 했는가 |
| **PPV (양성예측도)** | AI가 양성이라 했을 때 실제 양성인 비율 | AI가 "암"이라고 했을 때 진짜 암일 확률 |
| **NPV (음성예측도)** | AI가 음성이라 했을 때 실제 음성인 비율 | AI가 "정상"이라 했을 때 진짜 정상일 확률 |
| **F1-score** | Sensitivity와 PPV의 조화평균 | 불균형 데이터셋에서 종합 성능 평가 |
| **Calibration** | AI의 확률값이 실제 발생 빈도와 일치하는 정도 | "90%라고 했으면 실제로 90%가 발생했는가" |
| **External validation** | 개발에 쓰이지 않은 외부 데이터로 검증 | 다른 병원에서도 잘 작동하는지 확인 |

## 논문 결과 섹션에서 이 단어들을 만났을 때

```
결과: AUC 0.94, Sensitivity 91%, Specificity 87%,
      PPV 84%, NPV 93%, F1-score 0.87
      External validation: AUC 0.89
```

이 숫자가 보이면 이렇게 해석하세요.

✅ AUC 0.94 → 꽤 좋은 모델입니다.

✅ NPV 93% → AI가 "정상"이라 하면 93%는 진짜 정상입니다.

⚠️ External validation AUC 0.89 → 개발 병원보다 낮아졌습니다. 다른 환경에서 성능이 떨어집니다.

❌ External validation 없는 논문 → 실제 임상 적용 전 주의가 필요합니다.

## 의료 AI에서 Sensitivity가 중요한 이유

암 진단 AI라면 Sensitivity가 높아야 합니다. 암 환자를 놓치면 안 되기 때문입니다. 선별 검사가 민감도 중심으로 설계되는 것과 같은 이치입니다. 반대로 불필요한 수술을 막으려면 Specificity가 중요합니다.

---

## 더 알고 싶다면

- [AI 성능이 '좋다'는 게 뭔가요? — 평가 용어 사전](/blog/aerini/glossary-evaluation-terms)
- [AI 필수 용어 10개 — 이것만 알면 대화가 된다](/blog/aerini/glossary-ai-basics)
- [머신러닝 vs 딥러닝 — 용어 차이 완전 정복](/blog/aerini/glossary-ml-dl-terms)
