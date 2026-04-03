---
title: "결측 데이터 처리 — 의료 데이터에서 가장 흔한 문제"
date: 2026-03-31
category: medical-data-science
tags:
  - "cu2604021805"
  - "의료데이터"
  - "통계"
  - "분석"
  - "missing-data-handling"

description: "의료 데이터에서 결측은 예외가 아니라 규칙이다. 처리 방법이 틀리면 연구 결론이 뒤집힌다."
thumbnail: ""
draft: false
---


## 한줄 요약

의료 데이터에서 결측은 예외가 아니라 규칙이다. 처리 방법이 틀리면 연구 결론이 뒤집힌다.

---

## 결측의 세 가지 유형

### MCAR — 완전 무작위 결측

결측이 데이터의 다른 어떤 값과도 관련 없음.

예: 검사 튜브가 파손돼 결과를 잃은 경우. 완전 무작위 결측은 드물고, 발생해도 분석에 미치는 영향이 비교적 적다.

### MAR — 무작위 결측

결측이 관측된 다른 변수와 관련 있지만, 결측된 변수 자체와는 관련 없음.

예: 남성 환자가 여성보다 외래 방문이 적어 HbA1c 검사 결측이 더 많음. 성별(관측)로 결측을 설명할 수 있다.

### MNAR — 비무작위 결측

결측이 결측된 값 자체와 관련 있음.

예: 우울 점수가 높을수록 설문을 완성하지 않아 PRO 데이터가 없음. 가장 심각하고, 통계적으로 해결하기 어렵다.

---

## 어떤 유형인지 진단하기

```r
library(naniar)

# 결측 패턴 시각화
vis_miss(df)

# 결측이 다른 변수와 관련 있는지
mcar_test(df)  # Little's MCAR test
# p > 0.05이면 MCAR 가능성
```

완전히 구분하는 것은 불가능하다. MAR 가정이 현실적으로 가장 많이 쓰인다.

---

## Complete Case Analysis의 함정

```r
# 결측 있는 행 제거
df_complete <- na.omit(df)
nrow(df_complete) / nrow(df)  # 보통 50-70%만 남음
```

결측이 MCAR이 아니라면 완전 케이스 분석은 편향을 유발한다. 특히 결측이 결과(outcome)와 관련 있다면 심각한 편향이 생긴다.

HbA1c 결측이 혈당 조절 불량(=나쁜 예후)과 관련 있다면, 결측 환자를 제외하면 좋은 환자만 남게 된다.

---

## 단순 대입의 문제

```r
# Mean imputation
df$hba1c[is.na(df$hba1c)] <- mean(df$hba1c, na.rm = TRUE)
```

평균으로 대입하면:
- 변수의 분산이 줄어든다
- 변수 간 상관관계가 왜곡된다
- 표준 오차가 과소 추정된다 (신뢰구간이 너무 좁아짐)

Median imputation도 같은 문제가 있다. 결측이 5% 미만이고 MCAR인 경우에만 허용 가능.

---

## MICE — Multiple Imputation by Chained Equations

MAR 가정 하에서 가장 권장되는 방법이다.

```r
library(mice)

# 5개의 완전 데이터셋 생성
imp <- mice(df, m = 5, method = "pmm", seed = 123)

# 각 데이터셋에서 분석 후 Rubin's rules로 결합
fit <- with(imp, lm(outcome ~ age + sex + hba1c + treatment))
pooled <- pool(fit)
summary(pooled)
```

MICE의 동작 원리:
1. 각 변수의 결측을 다른 변수들로 예측하는 회귀 모델 구성
2. 예측값으로 대입
3. 반복 (convergence까지)
4. m개의 완전 데이터셋 생성
5. 각각 분석 후 Rubin's rules로 통합

---

## method 선택

| 변수 유형 | mice method |
|----------|-------------|
| 연속형 | "pmm" (predictive mean matching) |
| 이진형 | "logreg" |
| 다범주형 | "polyreg" |
| 정렬된 범주형 | "polr" |

---

## 실용적 판단 기준

| 결측 비율 | 권장 처리 |
|----------|----------|
| < 5% | Complete case 또는 단순 대입 허용 |
| 5–20% | MICE 권장 |
| 20–50% | MICE + sensitivity analysis |
| > 50% | 변수 제거 고려 또는 결측 자체를 분석 |

---

## 결측을 그냥 두는 게 나은 경우

- 결측 자체가 임상 정보인 경우: "검사를 안 했다"는 것도 데이터
- 트리 기반 모델(XGBoost, LightGBM): 결측을 자체 처리

```python
import xgboost as xgb
# XGBoost는 NaN을 자체적으로 처리
model = xgb.XGBClassifier()
model.fit(X_train, y_train)  # NaN 포함 가능
```

---

## 핵심 정리

- MCAR/MAR/MNAR 구분이 처리 전략의 출발점
- Complete case analysis: 결측이 MCAR이고 5% 미만일 때만 허용
- 평균/중앙값 대입: 간편하지만 분산 축소, 상관관계 왜곡
- MICE: MAR 가정에서 최선의 방법, `mice` 패키지
- MNAR은 통계적으로 해결 불가 — sensitivity analysis로 한계 보고

## 관련 글

- [임상 예측 모델 만들기 — AUROC 0.8이 의미하는 것](/blog/medical-data-science/clinical-prediction-model)
- [EMR 데이터 이해하기 — 구조화·비구조화 데이터의 차이](/blog/medical-data-science/emr-data-basics)
- [재현 가능한 연구 — R Markdown과 Quarto로 분석 보고서 만들기](/blog/medical-data-science/reproducible-research)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
