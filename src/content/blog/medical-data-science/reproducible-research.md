---
title: "재현 가능한 연구 — R Markdown과 Quarto로 분석 보고서 만들기"
date: 2026-03-31
category: medical-data-science
description: "2005년 Ioannidis가 \"발표된 연구 결과의 대부분은 틀렸다\"고 했다. 재현 가능성은 선택이 아니라 연구 윤리다."
thumbnail: ""
draft: false
---

## 한줄 요약

2005년 Ioannidis가 "발표된 연구 결과의 대부분은 틀렸다"고 했다. 재현 가능성은 선택이 아니라 연구 윤리다.

---

## 재현 불가능성 위기

John Ioannidis의 2005년 논문 "Why Most Published Research Findings Are False" (PLOS Medicine)는 의학 연구의 재현 불가능성 문제를 처음으로 정량화했다.

주요 원인:
- **p-hacking:** 유의한 결과가 나올 때까지 분석을 반복
- **HARKing (Hypothesizing After Results are Known):** 결과 보고 후 가설을 역으로 설정
- **선택적 보고:** 유의하지 않은 결과 미발표
- **분석 환경 미기록:** 어떤 R 버전, 어떤 패키지 버전인지 기록 안 함

2015년 Reproducibility Project: Psychology에서 100개 심리학 연구 중 36%만 재현됨.

---

## R Markdown 기초

코드, 결과, 설명을 하나의 `.Rmd` 파일에 통합한다.

````markdown
---
title: "당뇨병 코호트 생존 분석"
author: "홍길동"
date: "`r Sys.Date()`"
output: html_document
---

## 연구 개요

2018-2022년 서울대병원 제2형 당뇨 환자 코호트 (n = 3,241).

```{r setup, include=FALSE}
library(survival)
library(survminer)
library(dplyr)
knitr::opts_chunk$set(echo = TRUE, warning = FALSE)
```

```{r load-data}
df <- readRDS("data/dm_cohort.rds")
glimpse(df)
```

```{r survival-analysis}
fit <- survfit(Surv(time_days, cvd_event) ~ treatment, data = df)
ggsurvplot(fit, pval = TRUE, risk.table = TRUE)
```
````

`Knit` 버튼 한 번으로 HTML/PDF/Word 보고서가 생성된다.

---

## Quarto — 차세대 R Markdown

Quarto는 R뿐만 아니라 Python, Julia, Observable도 지원한다.

```yaml
---
title: "임상 연구 보고서"
format:
  html:
    toc: true
    code-fold: true
  pdf:
    documentclass: article
execute:
  echo: true
  warning: false
---
```

```{python}
import pandas as pd
df = pd.read_csv("data/cohort.csv")
df.describe()
```

```{r}
library(ggplot2)
ggplot(df, aes(x = age)) + geom_histogram(bins = 30)
```

같은 문서에서 R과 Python을 혼용할 수 있다.

---

## GitHub로 분석 공유

```bash
# 분석 프로젝트 구조
my-study/
├── data/           # 원시 데이터 (절대 GitHub에 올리지 말 것)
├── data-clean/     # 전처리된 데이터
├── analysis/       # .Rmd / .qmd 파일
├── output/         # 그래프, 표
├── .gitignore      # data/ 폴더 제외
└── README.md

# .gitignore 예시
data/
*.csv
*.rds
```

GitHub에 코드를 올리면 심사자가 분석을 재현할 수 있다. NEJM, BMJ는 데이터 공유 정책을 강화하는 추세다.

---

## Docker로 환경 동결

R 패키지 버전이 바뀌면 결과가 달라질 수 있다.

```dockerfile
FROM rocker/tidyverse:4.3.2

RUN R -e "install.packages(c(
  'survival', 'survminer', 'tableone',
  'MatchIt', 'mice', 'pROC'
))"

COPY . /project
WORKDIR /project

CMD ["Rscript", "analysis/main.R"]
```

```bash
docker build -t my-study .
docker run my-study
```

분석 환경 자체를 컨테이너로 고정하면 5년 후에도 같은 결과가 나온다.

---

## renv — R 패키지 버전 고정

Docker까지 안 써도 `renv`로 패키지 버전을 고정할 수 있다.

```r
library(renv)
renv::init()     # 프로젝트 초기화
renv::snapshot() # 현재 패키지 버전 기록 (renv.lock 생성)
renv::restore()  # 다른 환경에서 동일 버전 복원
```

`renv.lock` 파일을 GitHub에 포함하면 협업자가 동일한 환경을 재현한다.

---

## 의학 저널의 데이터 공유 정책

| 저널 | 데이터 공유 정책 |
|------|----------------|
| NEJM | 분석 코드 공유 권장 |
| BMJ | 환자 데이터 공유 의무화 추진 |
| PLOS Medicine | 데이터 공유 강제 |
| Nature Medicine | 코드 공유 필수 |

---

## 핵심 정리

- Ioannidis (2005): 의학 연구 재현 불가능성 위기의 기폭제
- R Markdown: 코드+결과+설명을 한 파일에 통합
- Quarto: R Markdown의 후속, Python 혼용 가능
- renv: R 패키지 버전 고정 (최소한의 재현성 보장)
- Docker: 분석 환경 완전 동결 (완전한 재현성 보장)

## 관련 글

- [R vs Python — 의사가 선택하는 기준](/blog/medical-data-science/r-vs-python-for-doctors)
- [결측 데이터 처리 — 의료 데이터에서 가장 흔한 문제](/blog/medical-data-science/missing-data-handling)
- [AI로 논문 쓰기 — Methods부터 Discussion까지 단계별 가이드](/blog/clinical-research/ai-paper-writing)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
