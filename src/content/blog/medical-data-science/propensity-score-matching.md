---
title: "성향점수 매칭 — 관찰 연구에서 인과관계를 추론하는 법"
date: 2026-03-31
category: medical-data-science
description: "RCT를 할 수 없을 때 성향점수 매칭이 교란변수를 통제한다 — 단, 측정된 교란만 통제된다는 한계를 절대 잊지 말 것."
thumbnail: ""
draft: false
---

## 한줄 요약

RCT를 할 수 없을 때 성향점수 매칭이 교란변수를 통제한다 — 단, 측정된 교란만 통제된다는 한계를 절대 잊지 말 것.

---

## RCT vs 관찰 연구

**RCT (무작위 배정 임상시험):**
무작위 배정으로 측정되지 않은 교란까지 균형을 맞춘다. 인과 추론의 표준. 단, 비용이 크고, 윤리적 제약이 있고, 현실 반영이 부족하다.

**관찰 연구:**
실제 진료 데이터를 쓴다. 대규모, 저비용, 현실적. 단, 교란변수(confounding)가 문제다.

---

## 교란변수 문제

A 약물을 처방받은 환자가 B 약물 처방 환자보다 결과가 좋다고 관찰됐다. 그런데 A 약물을 쓰는 환자가 애초에 젊고 건강하다면?

나이와 건강 상태가 **교란변수**다. 처방 결정에도 영향을 미치고, 결과에도 영향을 미친다.

```
나이/건강 상태 → 약물 처방 선택
나이/건강 상태 → 치료 결과
약물 처방 → 치료 결과 (우리가 알고 싶은 것)
```

---

## Propensity Score의 개념

각 환자가 치료군에 배정될 **확률**을 계산한다.

```r
library(MatchIt)

# Step 1: 성향점수 계산 (로지스틱 회귀)
ps_model <- glm(
  treatment ~ age + sex + bmi + hba1c + sbp + n_comorbidities,
  family = binomial,
  data = df
)
df$ps <- predict(ps_model, type = "response")
```

성향점수가 비슷한 환자끼리 매칭하면, 처방 결정에 영향을 준 변수들이 두 그룹에서 균형을 이룬다.

---

## PSM (Propensity Score Matching)

```r
# 1:1 nearest neighbor matching
match_out <- matchit(
  treatment ~ age + sex + bmi + hba1c + sbp + n_comorbidities,
  data   = df,
  method = "nearest",
  ratio  = 1,
  caliper = 0.2  # PS 차이 0.2 SD 이내만 매칭
)

summary(match_out)
matched_df <- match.data(match_out)
```

---

## 매칭 후 Balance 확인

매칭이 잘 됐는지 **표준화 평균 차이(SMD)**로 확인한다.

```r
library(cobalt)

# Love plot — SMD 시각화
love.plot(match_out, threshold = 0.1, abs = TRUE)
```

SMD < 0.1 이면 균형 달성. 매칭 전후를 함께 보여주는 Love plot이 논문의 표준 그림이다.

| 변수 | 매칭 전 SMD | 매칭 후 SMD |
|------|------------|------------|
| 나이 | 0.42 | 0.03 |
| 성별 | 0.18 | 0.05 |
| HbA1c | 0.35 | 0.07 |

---

## PSM vs IPTW

**IPTW (Inverse Probability of Treatment Weighting):**

```r
# 각 환자에 가중치 부여
df$weight <- ifelse(
  df$treatment == 1,
  1 / df$ps,
  1 / (1 - df$ps)
)

# 가중 Cox 모형
library(survival)
cox_iptw <- coxph(
  Surv(time, event) ~ treatment,
  data    = df,
  weights = weight
)
```

PSM은 매칭되지 않는 환자를 버린다. IPTW는 모든 환자를 쓰는 대신 가중치를 준다. 일반적으로 IPTW가 통계적 효율이 높다.

---

## 한국 건강보험 청구 데이터 분석 예시

HIRA 데이터로 특정 당뇨 약물의 심혈관 효과를 분석한다고 하면:

- 처방 결정 교란변수: 나이, 성별, 신기능(eGFR), 심혈관 기왕력
- 단, HIRA에는 eGFR이 없다 → 측정 안 된 교란변수
- 성향점수로 통제 가능한 것: HIRA에 있는 변수들만

이것이 관찰 연구의 핵심 한계다.

---

## 측정되지 않은 교란

PSM과 IPTW가 통제할 수 없는 것이 **unmeasured confounding**이다.

대처 방법:
- **E-value:** 측정 안 된 교란이 결과를 뒤집으려면 얼마나 강해야 하는지 계산
- **Instrumental variable (IV):** 처방에는 영향을 주지만 결과에 직접 영향을 주지 않는 변수 활용
- **Sensitivity analysis:** 교란 강도를 변화시켜 결과가 얼마나 바뀌는지 확인

---

## 핵심 정리

- 성향점수: 관측 변수를 고려한 치료 배정 확률
- PSM: 성향점수가 비슷한 환자끼리 매칭 (1:1 또는 1:k)
- SMD < 0.1: 매칭 성공의 기준
- IPTW: PSM보다 통계 효율 높지만 극단적 가중치 주의
- 핵심 한계: 측정된 교란만 통제 가능

## 관련 글

- [EMR 기반 코호트 연구 — 대규모 데이터로 빠르게 연구하는 법](/blog/clinical-research/cohort-study-ehr)
- [로지스틱 회귀 — 입원 예측 모델 만드는 법](/blog/medical-data-science/logistic-regression-medical)
- [생존 분석 기초 — Kaplan-Meier를 임상 연구에서 읽는 법](/blog/medical-data-science/survival-analysis-basics)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
