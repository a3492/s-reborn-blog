---
title: "EMR 기반 코호트 연구 — 대규모 데이터로 빠르게 연구하는 법"
date: 2026-03-31
category: clinical-research
tags:
  - "cu2604021805"
  - "임상연구"
  - "논문"
  - "EBM"
  - "cohort-study-ehr"

description: "HIRA 청구 데이터와 NHIS 표본코호트는 수십만 명 규모의 코호트 연구를 IRB 하나로 시작할 수 있는 한국의 강점이다."
thumbnail: ""
draft: false
---


## 한줄 요약

HIRA 청구 데이터와 NHIS 표본코호트는 수십만 명 규모의 코호트 연구를 IRB 하나로 시작할 수 있는 한국의 강점이다.

## EMR 코호트 연구의 장점

전향적 코호트 연구는 설계는 우수하지만 수년간의 추적이 필요하다. EMR 기반 후향적 코호트는 이미 쌓인 데이터를 활용해 빠르고 저렴하게 대규모 연구를 수행한다.

| 비교 항목 | 전향적 코호트 | EMR 기반 코호트 |
|-----------|--------------|----------------|
| 규모 | 수백~수천 명 | 수만~수십만 명 |
| 비용 | 높음 | 낮음 |
| 소요 기간 | 3-10년 | 3-12개월 |
| 데이터 품질 | 연구 목적에 최적화 | 진료 목적 수집, 불완전성 존재 |
| 노출/결과 측정 오류 | 낮음 | 높음 (misclassification) |

## 한국 활용 가능한 데이터 소스

### HIRA 청구 데이터 (건강보험심사평가원)

전 국민(약 5,200만 명)의 건강보험 청구 데이터를 포함한다. 진단코드(KCD), 처방 기록, 시술 코드, 의료기관 정보가 포함된다. 연구 목적 데이터 신청은 HIRA 데이터 서비스 포털(dataservice.hira.or.kr)을 통해 가능하며, IRB 승인서와 연구 계획서를 함께 제출한다.

강점은 전 국민 포괄성이지만, 검사 결과값(혈액 검사, 영상 판독 결과)이 없고 사망 데이터는 별도 연계가 필요하다는 한계가 있다.

### NHIS 표본코호트 (국민건강보험공단)

약 100만 명(전체 인구의 약 2%)을 무작위 추출한 대표 표본으로, 20년 이상의 종단 추적이 가능하다. HIRA 청구 데이터와 달리 건강검진 결과(BMI, 혈압, 혈당, 콜레스테롤)와 사망 정보가 포함된다.

NHIS-HealS (국민건강영양조사 연계)나 NHIS-NHID (건강정보 데이터베이스)로 신청 경로가 구분되므로, 연구에 필요한 변수에 따라 적합한 데이터를 선택해야 한다.

### 병원 EMR (SNUH, ASAN 등)

서울대병원, 아산병원, 삼성서울병원 등의 병원 EMR은 청구 데이터에 없는 상세 임상 정보(조직검사 결과, 영상 판독, 간호 기록)를 포함한다. 연구 허가는 각 기관 IRB를 통해야 하며, 공개 신청 절차가 없어 소속 연구자나 공동연구자 자격이 필요한 경우가 많다.

## Phenotyping: ICD 코드로 환자 정의

EMR 연구에서 가장 중요한 방법론적 결정이 phenotyping — 특정 질환이나 상태를 코드로 정의하는 것이다.

예를 들어 "제2형 당뇨병 환자"를 단순히 E11(KCD 코드) 1회 청구로 정의하면 오진이나 감별 진단으로 인한 위양성이 다수 포함된다. 알고리즘 검증이 필요하다.

```r
library(dplyr)

# 제2형 당뇨병 환자 정의: E11 코드 2회 이상 청구된 환자
dm_patients <- claims_data %>%
  filter(grepl("^E11", icd_code)) %>%
  group_by(patient_id) %>%
  filter(n() >= 2) %>%  # 2회 이상 진단
  summarise(first_dx_date = min(claim_date)) %>%
  distinct(patient_id, first_dx_date)

# 또는 처방 기준 추가: 혈당강하제 처방 이력 있는 경우
dm_with_rx <- claims_data %>%
  filter(grepl("^E11", icd_code) | drug_code %in% antidiabetic_codes) %>%
  group_by(patient_id) %>%
  filter(sum(grepl("^E11", icd_code)) >= 1 &
         sum(drug_code %in% antidiabetic_codes) >= 1)
```

Phenotyping 알고리즘의 PPV(양성 예측도)는 무작위 표본의 차트를 직접 검토해 검증해야 한다. PPV ≥ 0.80이 일반적인 허용 기준이다.

## EMR 연구의 고유한 편향들

EMR 코호트 연구에서 무작위 배정이 없기 때문에 발생하는 편향들을 알고 대응해야 한다.

### Immortal Time Bias (불사 시간 편향)

코호트 진입 시점과 노출 정의 시점 사이의 기간 동안 환자는 사망하거나 결과가 발생할 수 없다(immortal). 이 기간을 노출 군에 잘못 포함하면 노출 군의 결과가 과소 추정된다.

예: "스타틴 복용자"를 첫 처방일 이전 기간도 노출군으로 분류하면 스타틴의 심혈관 보호 효과가 과대평가된다. 처방 시작일을 코호트 진입일로 맞추는 방법(incident user design)으로 대응한다.

### Detection Bias (탐지 편향)

특정 치료를 받는 환자가 모니터링을 더 자주 받아 진단 빈도가 높아지는 편향이다. 예: 당뇨약 복용자는 정기적으로 신장 기능 검사를 받으므로 만성 신장질환 진단율이 높게 보인다.

### Healthy User Bias (건강 사용자 편향)

예방 목적 약물을 복용하는 환자는 건강 행동 전반에 걸쳐 더 건강한 경향이 있다. 스타틴 복용자의 암 발생률이 낮게 보이는 현상이 대표적이다. 성향 점수 매칭(propensity score matching)으로 일부 보정한다.

## 발표 기준: STROBE 체크리스트

관찰 연구(코호트, 환자-대조군, 단면 연구) 보고는 STROBE(Strengthening the Reporting of Observational studies in Epidemiology) 체크리스트를 따른다. 22개 항목이며, 제목, 배경, 방법(대상자 선정, 변수 정의, 편향 대응, 통계 방법), 결과, 토의를 체계적으로 서술한다.

STROBE 체크리스트는 strobe-statement.org에서 무료로 내려받을 수 있다.

## 성향 점수 매칭(Propensity Score Matching)

EMR 코호트 연구에서 치료군과 대조군의 기저 특성 차이를 보정하는 가장 흔한 방법이다. 성향 점수는 관찰된 공변량을 바탕으로 치료를 받을 확률을 추정한 값이며, 이를 이용해 두 군을 매칭하거나 가중치를 부여한다.

```r
library(MatchIt)

# 성향 점수 매칭 (1:1, nearest neighbor)
m.out <- matchit(treatment ~ age + sex + bmi + comorbidity_score,
                 data = cohort_data,
                 method = "nearest",
                 ratio = 1)

matched_data <- match.data(m.out)
```

매칭 후에는 반드시 두 군의 공변량 균형(balance)을 표준화 평균 차이(Standardized Mean Difference, SMD)로 확인해야 한다. SMD < 0.10이면 균형이 양호하다고 판단한다. 매칭 결과는 'Love plot'으로 시각화하는 것이 관행이다.

## 핵심 정리

- HIRA 데이터는 전 국민 포괄성이 강점이지만 검사 결과값이 없다
- NHIS 표본코호트는 건강검진 결과와 20년 추적이 가능한 장기 연구에 최적이다
- Phenotyping 알고리즘은 반드시 차트 검토로 PPV를 검증해야 한다
- Immortal time bias는 코호트 진입일과 노출 정의 시점의 불일치로 발생한다
- STROBE 체크리스트로 관찰 연구 보고의 완결성을 점검해야 한다

## 관련 글

- [IRB와 AI 연구 — 동의서에 AI 사용을 어떻게 명시할까](/blog/clinical-research/irb-ai-research)
- [의료 AI 논문을 비판적으로 읽는 법 — TRIPOD-AI 체크리스트](/blog/clinical-research/statistical-methods-ai-studies)
- [메타분석 기초 — Forest Plot 직접 만들고 해석하기](/blog/clinical-research/meta-analysis-basics)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
