---
title: "로지스틱 회귀 — 입원 예측 모델 만드는 법"
date: 2026-03-31
category: medical-data-science
tags:
  - "cu2604021805"
  - "의료데이터"
  - "통계"
  - "분석"
  - "logistic-regression-medical"

description: "로지스틱 회귀는 \"이 환자가 30일 내 재입원할 확률이 얼마인가\"를 숫자로 내놓는 가장 검증된 방법이다."
thumbnail: ""
draft: false
---


## 한줄 요약

로지스틱 회귀는 "이 환자가 30일 내 재입원할 확률이 얼마인가"를 숫자로 내놓는 가장 검증된 방법이다.

---

## 로지스틱 회귀의 직관

선형 회귀는 연속형 결과(혈압, 혈당)를 예측한다. 로지스틱 회귀는 이진 결과(입원 여부, 사망 여부)를 예측한다.

확률을 직접 예측하면 0 미만이나 1 초과가 나올 수 있다. 그래서 log odds(로짓)를 선형 함수로 표현한다.

```
logit(p) = log(p / (1-p)) = β₀ + β₁·age + β₂·sex + ...
```

출력이 0~1 사이의 확률로 자동 변환된다.

---

## R로 모델 만들기

```r
# 30일 재입원 예측 모델
# readmit: 1=재입원, 0=미입원

model <- glm(
  readmit ~ age + sex + n_comorbidities + los + discharge_to_home,
  family = binomial(link = "logit"),
  data = train_data
)

summary(model)
```

출력 해석:

```
Coefficients:
                   Estimate Std. Error z value Pr(>|z|)
(Intercept)        -3.241    0.412    -7.87   <0.001 *
age                 0.034    0.006     5.67   <0.001 *
sexMale             0.218    0.089     2.45    0.014 *
n_comorbidities     0.412    0.071     5.80   <0.001 *
los                 0.089    0.021     4.24   <0.001 *
discharge_to_home  -0.631    0.105    -6.01   <0.001 ***
```

---

## OR(Odds Ratio) 계산

```r
exp(coef(model))        # OR
exp(confint(model))     # 95% CI
```

- `n_comorbidities` OR = exp(0.412) = 1.51 → 동반질환 1개 증가마다 재입원 오즈 51% 증가
- `discharge_to_home` OR = exp(-0.631) = 0.53 → 가정 퇴원 시 재입원 오즈 47% 감소

---

## OR과 HR의 차이

| | OR (Odds Ratio) | HR (Hazard Ratio) |
|---|---|---|
| 사용 분석 | 로지스틱 회귀, 단면 연구 | Cox 생존 분석 |
| 시간 개념 | 없음 | 있음 |
| 해석 | 오즈 비율 | 순간 위험 비율 |
| 희귀 결과에서 | RR 근사 | — |

---

## 모델 성능 평가

```r
library(pROC)

pred_prob <- predict(model, newdata = test_data, type = "response")
roc_obj   <- roc(test_data$readmit, pred_prob)
auc(roc_obj)   # AUROC

# Sensitivity / Specificity at cutoff 0.3
coords(roc_obj, 0.3, ret = c("sensitivity", "specificity"))
```

- AUROC = 0.80 이상이면 좋은 모델
- 컷오프를 낮추면 sensitivity 증가, specificity 감소
- 재입원 예방이 목적이면 sensitivity 우선

---

## 과적합 방지: LASSO 정규화

변수가 많으면 훈련 데이터에만 잘 맞는 모델이 나온다.

```r
library(glmnet)

X <- model.matrix(readmit ~ ., data = train_data)[,-1]
y <- train_data$readmit

# 10-fold cross-validation으로 최적 lambda 선택
cv_fit   <- cv.glmnet(X, y, family = "binomial", alpha = 1)
best_lam <- cv_fit$lambda.min

coef(cv_fit, s = "lambda.min")  # 0이 된 변수는 제거됨
```

LASSO는 불필요한 변수 계수를 자동으로 0으로 만들어 변수 선택 효과가 있다.

---

## 실제 예시: LACE 점수 vs ML 모델

전통적 30일 재입원 예측 도구인 LACE 점수 (Length of stay, Acuity, Comorbidities, ED visits)는 AUROC 약 0.68이다.

로지스틱 회귀에 변수를 잘 선택하면 AUROC 0.74~0.78까지 올라간다. 딥러닝이 항상 좋은 것은 아니다.

---

## Hosmer-Lemeshow Test

모델이 실제 확률을 잘 예측하는지 (calibration) 검정한다.

```r
library(ResourceSelection)
hoslem.test(train_data$readmit, fitted(model), g = 10)
# p > 0.05이면 calibration 양호
```

---

## 변수 선택 전략

1. 임상 지식 기반 사전 선택 (이미 알려진 위험인자 포함)
2. 단변량 분석에서 p < 0.2인 변수 후보 선정
3. 다변량 모델에서 backward elimination
4. LASSO로 재검증
5. 최종 모델 변수 수: 사건 수 / 10 규칙 (EPV ≥ 10)

---

## 핵심 정리

- `glm(..., family = binomial)` — R 로지스틱 회귀 기본 명령
- OR = exp(계수) — 1보다 크면 위험 증가, 작으면 감소
- AUROC: 0.7 이상 = 사용 가능, 0.8 이상 = 좋음
- LASSO로 과적합 방지 및 변수 선택 동시 수행
- Hosmer-Lemeshow test로 calibration 확인 필수

## 관련 글

- [임상 예측 모델 만들기 — AUROC 0.8이 의미하는 것](/blog/medical-data-science/clinical-prediction-model)
- [생존 분석 기초 — Kaplan-Meier를 임상 연구에서 읽는 법](/blog/medical-data-science/survival-analysis-basics)
- [성향점수 매칭 — 관찰 연구에서 인과관계를 추론하는 법](/blog/medical-data-science/propensity-score-matching)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
