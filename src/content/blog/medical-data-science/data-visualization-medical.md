---
title: "의료 데이터 시각화 — 논문 Figure 수준 그래프 만들기"
date: 2026-03-31
category: medical-data-science
tags:
  - "cu2604021805"
  - "의료데이터"
  - "통계"
  - "분석"
  - "data-visualization-medical"

description: "논문에 넣을 그래프는 예쁘면 안 된다 — 정보가 정확하고, 색이 색맹에게도 보이고, 300dpi여야 한다."
thumbnail: ""
draft: false
---


## 한줄 요약

논문에 넣을 그래프는 예쁘면 안 된다 — 정보가 정확하고, 색이 색맹에게도 보이고, 300dpi여야 한다.

---

## ggplot2 기초 문법

R의 ggplot2는 레이어를 쌓는 방식으로 그래프를 만든다.

```r
library(ggplot2)

ggplot(data = df, aes(x = hba1c, y = fbs, color = group)) +
  geom_point(alpha = 0.6, size = 2) +
  geom_smooth(method = "lm", se = TRUE) +
  labs(
    title = "HbA1c와 공복혈당의 관계",
    x = "당화혈색소 (%)",
    y = "공복혈당 (mg/dL)",
    color = "치료군"
  ) +
  theme_bw()
```

`data` → `aes()` → `geom_()` → `labs()` → `theme_()` 순서가 기본 구조다.

---

## 의학 논문 필수 그래프 1: Box Plot

```r
ggplot(df, aes(x = group, y = hba1c, fill = group)) +
  geom_boxplot(outlier.shape = 21, width = 0.5) +
  geom_jitter(width = 0.1, alpha = 0.3, size = 1) +
  stat_compare_means(comparisons = list(c("치료", "대조")),
                     method = "wilcox.test") +
  scale_fill_manual(values = c("#3C5488", "#E64B35")) +
  theme_classic() +
  theme(legend.position = "none")
```

jitter를 추가하면 데이터 분포가 보인다. 박스만 보여주는 것은 정보 은닉이라는 비판이 있다.

---

## 의학 논문 필수 그래프 2: Forest Plot

메타분석 또는 다변량 분석 결과를 시각화한다.

```r
library(forestplot)

# 데이터 준비
tabletext <- cbind(
  c("변수", "나이 (10년 증가)", "남성", "당뇨병", "흡연"),
  c("HR", "1.34", "1.18", "1.52", "1.41"),
  c("95% CI", "1.21–1.48", "0.97–1.43", "1.29–1.79", "1.19–1.67")
)

forestplot(
  labeltext = tabletext,
  mean  = c(NA, 1.34, 1.18, 1.52, 1.41),
  lower = c(NA, 1.21, 0.97, 1.29, 1.19),
  upper = c(NA, 1.48, 1.43, 1.79, 1.67),
  zero  = 1,
  col   = fpColors(box = "#E64B35", line = "black")
)
```

---

## 의학 논문 필수 그래프 3: ROC Curve

```r
library(pROC)

roc1 <- roc(df$outcome, df$model1_prob)
roc2 <- roc(df$outcome, df$model2_prob)

ggroc(list(Model1 = roc1, Model2 = roc2)) +
  annotate("text", x = 0.3, y = 0.2,
           label = paste0("Model 1 AUC = ", round(auc(roc1), 3))) +
  annotate("text", x = 0.3, y = 0.1,
           label = paste0("Model 2 AUC = ", round(auc(roc2), 3))) +
  geom_abline(slope = 1, intercept = 1, linetype = "dashed") +
  theme_bw()
```

---

## Table 1 만들기

```r
library(tableone)

vars      <- c("age", "sex", "bmi", "hba1c", "sbp", "egfr")
catvars   <- c("sex")
tab1      <- CreateTableOne(
  vars    = vars,
  strata  = "treatment",
  data    = df,
  factorVars = catvars
)
print(tab1, showAllLevels = TRUE, smd = TRUE)
```

`smd = TRUE`로 표준화 평균 차이를 추가하면 매칭 연구의 balance 확인에 유용하다.

---

## 색상 선택: 색맹 친화적 팔레트

전체 인구의 약 8% (남성 기준)가 색각 이상이다. Red-Green을 함께 쓰면 안 된다.

```r
# Okabe-Ito palette — 가장 널리 권장되는 색맹 친화 팔레트
okabe_ito <- c("#E69F00", "#56B4E9", "#009E73",
               "#F0E442", "#0072B2", "#D55E00", "#CC79A7")

# 또는 viridis
library(viridis)
scale_fill_viridis_d()   # 이산형
scale_fill_viridis_c()   # 연속형
```

---

## NEJM/Lancet 스타일 테마

```r
library(ggthemes)

# NEJM 스타일
scale_color_nejm()
scale_fill_nejm()

# Lancet 스타일
scale_color_lancet()
scale_fill_lancet()
```

---

## 논문 제출용 고해상도 저장

```r
ggsave(
  filename = "figure1_survival.tiff",
  plot     = last_plot(),
  width    = 7,
  height   = 5,
  dpi      = 300,
  compression = "lzw"
)
```

대부분의 의학 저널이 TIFF 300dpi를 요구한다. PDF는 벡터 형식으로 무한 확대 가능해서 심사자용으로 좋다.

---

## 핵심 정리

- ggplot2: data → aes → geom → labs → theme 레이어 구조
- Box plot에 jitter 추가: 데이터 분포 정직하게 표시
- Forest plot: `forestplot` 패키지, HR/OR 시각화 표준
- 색맹 친화: Okabe-Ito 또는 viridis 팔레트 사용
- 논문 제출: TIFF 300dpi, width 7인치 기준

## 관련 글

- [R vs Python — 의사가 선택하는 기준](/blog/medical-data-science/r-vs-python-for-doctors)
- [메타분석 기초 — Forest Plot을 직접 만들고 해석하기](/blog/clinical-research/meta-analysis-basics)
- [성향점수 매칭 — 관찰 연구에서 인과관계를 추론하는 법](/blog/medical-data-science/propensity-score-matching)
