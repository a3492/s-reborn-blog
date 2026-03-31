---
title: "생존 분석 기초 — Kaplan-Meier를 임상 연구에서 읽는 법"
date: 2026-03-31
category: medical-data-science
description: "이 글을 읽어보세요."
thumbnail: ""
draft: false
---

## 한줄 요약

중도절단 데이터가 있으면 t-test 대신 생존 분석을 써야 한다. KM 곡선을 읽을 줄 모르면 논문의 절반을 이해 못 한다.

---

## 생존 분석이 필요한 이유

임상 연구에서 "환자가 얼마나 오래 살았는가"를 단순 평균으로 분석하면 틀린다.

연구가 끝날 때까지 사건(사망, 재발 등)이 발생하지 않은 환자가 있다. 이 환자들을 제외하면 편향, 포함하면 어떻게 처리할지 모른다. 이것이 **중도절단(censoring)** 문제다.

- 연구 종료 시점까지 생존 → 우측 중도절단
- 추적 소실 → 우측 중도절단
- 관심 사건 이전에 다른 사건 발생 → 경쟁 위험

생존 분석은 이 중도절단 데이터를 올바르게 처리하는 방법론이다.

---

## Kaplan-Meier 곡선 읽는 법

```r
library(survival)
library(survminer)

# 당뇨병 환자 심혈관 사건 생존 분석 예시
# time: 추적 기간(일), event: 1=사건 발생, 0=중도절단
# group: 0=표준치료, 1=집중치료

fit <- survfit(Surv(time, event) ~ group, data = dm_cohort)

ggsurvplot(
  fit,
  pval = TRUE,
  conf.int = TRUE,
  risk.table = TRUE,
  xlab = "추적 기간 (개월)",
  ylab = "무사건 생존율",
  palette = c("#E7B800", "#2E9FDF")
)
```

KM 곡선에서 확인할 것:
1. **곡선이 낮을수록** 더 많은 사건 발생
2. **두 곡선의 분리** — 빨리 갈라질수록 조기 차이
3. **At risk table** — 하단 숫자가 줄어드는 것 = 중도절단
4. **신뢰구간** — 곡선 후반부로 갈수록 넓어짐 (환자 수 감소)

---

## Log-rank Test

두 생존 곡선이 통계적으로 차이가 나는지 검정한다.

```r
survdiff(Surv(time, event) ~ group, data = dm_cohort)
# Chi-squared p-value
```

p < 0.05이면 두 그룹의 생존 분포가 다르다고 결론. 단, **시간에 따라 위험비가 일정하지 않으면** log-rank test는 부적절하다.

---

## Cox 비례위험모형

여러 변수를 동시에 보정하면서 생존을 분석한다.

```r
cox_model <- coxph(
  Surv(time, event) ~ age + sex + hba1c + treatment,
  data = dm_cohort
)
summary(cox_model)
```

출력 결과에서 핵심은 **Hazard Ratio (HR)**:

| 변수 | HR | 95% CI | p-value |
|------|-----|--------|---------|
| 집중치료 | 0.72 | 0.58–0.89 | 0.002 |
| 나이(10년) | 1.34 | 1.21–1.48 | <0.001 |
| 남성 | 1.18 | 0.97–1.43 | 0.091 |

---

## HR(Hazard Ratio) 해석

- HR = 0.72 → 집중치료군이 표준치료군에 비해 사건 위험이 28% 낮음
- HR = 1.34 → 10세 증가할 때마다 사건 위험 34% 증가
- HR = 1.0 → 차이 없음
- HR의 95% CI가 1.0을 포함하지 않으면 통계적으로 유의

**OR과 HR의 차이:** OR은 단면 연구·로지스틱 회귀에서, HR은 시간 개념이 포함된 생존 분석에서 사용한다.

---

## 비례위험 가정 확인

Cox 모형은 "HR이 시간에 관계없이 일정하다"는 가정이 있다.

```r
# Schoenfeld 잔차로 비례위험 가정 검정
cox.zph(cox_model)
# p < 0.05이면 가정 위반
```

가정 위반 시 대안:
- 시간 구분 Cox 모형
- 가속 실패 시간(AFT) 모형
- 경쟁 위험 모형 (`cmprsk` 패키지)

---

## 실제 예시: UKPDS 당뇨병 코호트

UKPDS (UK Prospective Diabetes Study)는 제2형 당뇨병 환자 5,102명을 10년 추적했다.

- 집중혈당 조절군 vs 표준 치료군
- 주요 당뇨병 관련 종점 HR: 0.88 (95% CI 0.79–0.99)
- NNT(Number Needed to Treat): 약 21명

이 결과가 KM 곡선 + Cox 모형으로 분석됐다.

---

## 핵심 정리

- 중도절단 데이터 → 반드시 생존 분석 (단순 평균 금지)
- KM 곡선: 시각화 도구, log-rank test로 유의성 검정
- Cox 모형: 다변량 보정, 결과는 HR로 표현
- HR 95% CI가 1.0을 포함하지 않아야 통계적 유의
- 비례위험 가정은 `cox.zph()`로 반드시 확인

## 관련 글

- [로지스틱 회귀 — 입원 예측 모델 만드는 법](/blog/medical-data-science/logistic-regression-medical)
- [R vs Python — 의사가 선택하는 기준](/blog/medical-data-science/r-vs-python-for-doctors)
- [메타분석 기초 — Forest Plot을 직접 만들고 해석하기](/blog/clinical-research/meta-analysis-basics)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
