---
title: "메타분석 기초 — Forest Plot 직접 만들고 해석하기"
date: 2026-03-31
category: clinical-research
thumbnail: ""
draft: false
---

## 한줄 요약

메타분석은 R `meta` 패키지 10줄로 시작할 수 있다 — Forest plot을 직접 그리고 이질성, 출판 편향, GRADE 수준까지 한 번에 해석하는 법을 정리한다.

## 메타분석의 목적

개별 연구는 샘플 크기의 한계로 결론이 엇갈리는 경우가 많다. 메타분석은 여러 연구의 결과를 통계적으로 통합해 더 정밀한 효과 추정값과 더 좁은 신뢰구간을 얻는다. 근거중심의학(EBM)에서 잘 수행된 메타분석은 가장 높은 근거 수준(GRADE 1a)을 갖는다.

단, 낮은 질의 연구를 통합해도 낮은 질의 결과가 나온다. "Garbage in, garbage out" 원칙은 메타분석에서도 동일하게 적용된다.

## Fixed Effect vs Random Effects

이질성(heterogeneity)에 따른 모델 선택이 핵심이다.

- **Fixed effect model**: 모든 연구가 동일한 참 효과 크기를 추정한다고 가정. I² 낮고 연구 간 차이가 표본 오차만으로 설명될 때 적합.
- **Random effects model**: 각 연구의 참 효과 크기가 분포를 따른다고 가정. 연구 간 실제 이질성이 있을 때 사용. 의료 메타분석의 대부분이 이 모델을 사용한다.

Random effects 추정 방법은 DerSimonian-Laird(기본값), REML(제한된 최대우도법), Paule-Mandel 등이 있으며, 최근에는 REML이 더 정확한 추정값을 준다는 근거가 축적되고 있다.

## 이질성 측정: I² 통계량

I²는 전체 변동 중 연구 간 이질성으로 설명되는 비율을 나타낸다.

| I² 범위 | 이질성 해석 | 대응 |
|---------|-----------|------|
| 0-25% | 낮음 | Fixed 또는 Random 모두 가능 |
| 26-50% | 중간 | Random effects 권장 |
| 51-75% | 높음 | 서브그룹 분석으로 원인 탐색 |
| >75% | 매우 높음 | 통합 추정값 해석 주의, 서술적 합성 고려 |

I²가 높을 때는 이질성의 원인을 탐색하는 메타회귀분석(meta-regression)이나 서브그룹 분석이 필요하다. 단, 사후(post-hoc) 서브그룹 분석은 우연에 의한 유의미한 결과를 만들 수 있으므로 사전(pre-specified) 분석과 명확히 구분해야 한다.

## R 코드: meta 패키지로 메타분석과 Forest Plot

```r
install.packages("meta")
library(meta)

# 연구 데이터 준비 (로그 오즈비와 표준오차)
study_data <- data.frame(
  study_name = c("Kim 2020", "Park 2021", "Lee 2022", "Choi 2023"),
  log_OR     = c(0.45, 0.62, 0.38, 0.71),   # 로그 오즈비
  se         = c(0.18, 0.22, 0.15, 0.28)    # 표준오차
)

# 메타분석 실행 (random effects)
m <- metagen(
  TE     = log_OR,        # 효과 크기 (로그 스케일)
  seTE   = se,            # 표준오차
  data   = study_data,
  studlab = study_name,   # 연구명 레이블
  common  = FALSE,        # fixed effect 모델 끄기
  random  = TRUE,         # random effects 모델 사용
  sm      = "OR",         # 효과 크기 유형: OR, RR, MD, SMD
  method.tau = "REML"     # 이질성 추정 방법
)

# 결과 요약
summary(m)

# Forest plot 생성
forest(m,
  sortvar    = TE,          # 효과 크기 순서로 정렬
  rightlabs  = c("OR", "95%-CI", "Weight"),
  leftlabs   = c("Study"),
  col.diamond = "steelblue"
)
```

오즈비가 아닌 평균 차이(Mean Difference)를 사용하는 경우 `sm = "MD"`, 표준화 평균 차이는 `sm = "SMD"`로 변경한다.

## Forest Plot 읽는 법

Forest plot의 각 요소가 의미하는 것을 정확히 알아야 한다.

- **사각형**: 개별 연구의 효과 추정값. 크기는 해당 연구의 메타분석 내 가중치(weight)에 비례한다. 샘플이 크고 분산이 작을수록 사각형이 크다.
- **수평선**: 효과 추정값의 95% 신뢰구간. 선이 짧을수록 추정이 정밀하다.
- **수직선(null effect line)**: OR=1 또는 MD=0을 나타내는 기준선. 신뢰구간이 이 선을 포함하면 통계적으로 유의하지 않다.
- **다이아몬드**: 통합 효과 추정값. 다이아몬드의 좌우 끝이 통합 신뢰구간이다. 다이아몬드 전체가 null line의 한쪽에 있으면 유의한 결과다.

## Publication Bias: Funnel Plot + Egger's Test

출판 편향(publication bias)은 긍정적 결과를 보고한 연구가 부정적 결과 연구보다 더 많이 출판되는 현상이다. 메타분석에서 이를 확인하는 방법은 두 가지다.

```r
# Funnel plot
funnel(m, studlab = TRUE)

# Egger's test (소규모 연구 효과 검정)
metabias(m, method = "linreg")
# p < 0.10이면 출판 편향 의심
```

Funnel plot은 샘플 크기(y축)와 효과 크기(x축)의 산점도로, 편향이 없으면 역깔때기 모양의 대칭 분포를 보인다. 비대칭이면 출판 편향 또는 소규모 연구 효과(small-study effects)를 의심한다.

Egger's test는 통계적 검정이지만 연구 수가 10편 미만이면 검정력이 낮아 신뢰하기 어렵다.

## 민감도 분석

민감도 분석은 개별 연구를 하나씩 제거했을 때 통합 효과 크기가 얼마나 변하는지 확인한다.

```r
# leave-one-out 민감도 분석
metainf(m, pooled = "random")
```

한 연구를 제거했을 때 통합 효과의 방향이나 유의성이 크게 변한다면, 그 연구에 대한 질 평가와 영향 분석(influence analysis)이 추가로 필요하다.

## GRADE 근거 수준 적용

메타분석이라도 다음 요인들로 GRADE 근거 수준이 낮아진다: 비뚤림 위험(Risk of Bias), 비일관성(I² > 50%), 비직접성(연구 대상이 임상 질문의 환자군과 다름), 비정밀성(넓은 신뢰구간), 출판 편향. 반대로 관찰 연구라도 매우 큰 효과 크기(OR > 5)나 용량-반응 관계가 확인되면 근거 수준이 올라갈 수 있다.

## 의료 AI 메타분석의 특수성

의료 AI 논문의 메타분석은 QUADAS-2(Quality Assessment of Diagnostic Accuracy Studies-2) 도구로 편향 위험을 평가한다. 환자 선택, 검사 방법, 참조 표준, 검사 흐름의 네 영역을 점검한다. AI 연구 특유의 문제는 동일 데이터셋으로 훈련과 검증을 하거나, 여러 임계값(threshold) 중 최적만 보고하는 경우가 많다는 점이다. 이를 놓치면 요약 민감도/특이도가 과대 추정된다.

## 핵심 정리

- Random effects model이 의료 메타분석의 기본이며, REML 방법이 현재 권장된다
- I² > 50%이면 통합 추정값보다 이질성 원인 탐색이 더 중요하다
- Forest plot에서 다이아몬드 전체가 null line 한쪽에 위치할 때 통계적으로 유의하다
- Funnel plot 비대칭은 출판 편향의 신호이지만 연구 수 10편 미만에서는 해석에 주의한다
- 의료 AI 메타분석은 QUADAS-2로 개별 연구의 편향 위험을 평가해야 한다

## 관련 글

- [체계적 문헌고찰 AI 자동화 — 6개월 작업을 2주로 줄이는 법](/blog/clinical-research/systematic-review-ai)
- [의료 AI 논문을 비판적으로 읽는 법 — TRIPOD-AI 체크리스트](/blog/clinical-research/statistical-methods-ai-studies)
- [RCT 설계에서 AI 활용 — 설계부터 무작위 배정까지](/blog/clinical-research/rct-design-ai)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
