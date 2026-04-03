---
title: "R vs Python — 의사가 선택하는 기준"
date: 2026-03-31
category: medical-data-science
tags:
  - "cu2604021805"
  - "의료데이터"
  - "통계"
  - "분석"
  - "r-vs-python-for-doctors"

description: "통계 분석·논문 → R, ML·자동화·API → Python. 의사-연구자라면 R 먼저 배우는 게 맞다."
thumbnail: ""
draft: false
---


## 한줄 요약

통계 분석·논문 → R, ML·자동화·API → Python. 의사-연구자라면 R 먼저 배우는 게 맞다.

---

## 왜 이 질문이 중요한가

의학 연구에 입문하면 가장 먼저 듣는 조언이 엇갈린다. 교수님은 "SAS 쓰면 돼"라고 하고, 개발자 친구는 "Python 하나면 다 된다"고 한다. 현실은 둘 다 틀렸다.

2024년 기준 NEJM·Lancet·JAMA에 실린 통계 방법론 논문 상당수는 R로 작성됐다. 반면 의료 AI 스타트업의 90% 이상은 Python을 쓴다. 목적이 다르다.

---

## 통계 분석 중심이라면 R

R은 통계학자들이 만든 언어다. 의학 연구에 필요한 패키지가 CRAN에 이미 다 있다.

```r
# 생존 분석
library(survival)
library(survminer)

fit <- survfit(Surv(time, event) ~ treatment, data = df)
ggsurvplot(fit, pval = TRUE, risk.table = TRUE)

# 기저특성 표 (Table 1)
library(tableone)
vars <- c("age", "sex", "bmi", "hba1c")
CreateTableOne(vars = vars, strata = "group", data = df)
```

`tableone` 패키지 하나로 학술지 수준의 Table 1이 나온다. Python에서 같은 결과를 얻으려면 훨씬 많은 코드가 필요하다.

---

## ML·자동화·API라면 Python

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
import pandas as pd

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)
print(roc_auc_score(y_test, model.predict_proba(X_test)[:,1]))
```

생존 분석도 Python에서 가능하다. `lifelines` 패키지가 R의 `survival`과 거의 동일한 기능을 제공한다. 하지만 논문 투고 심사자가 R 코드를 더 신뢰하는 경향이 있다.

---

## 의학 저널의 현실

- NEJM, Lancet, BMJ — R 코드 보충자료 표준화 추세
- Statistics in Medicine, Biometrics — R 패키지 논문 다수
- Nature Medicine, npj Digital Medicine — Python 허용 증가

투고 저널이 통계 중심이면 R, AI/ML 방법론 중심이면 Python이 유리하다.

---

## tidyverse vs pandas 비교

| 작업 | R (tidyverse) | Python (pandas) |
|------|--------------|----------------|
| 데이터 필터링 | `filter(df, age > 60)` | `df[df.age > 60]` |
| 그룹 집계 | `group_by() %>% summarise()` | `groupby().agg()` |
| 결측 제거 | `drop_na()` | `dropna()` |
| 파이프 연산 | `%>%` 또는 `|>` | method chaining |

R의 파이프 문법은 의사가 읽기 더 쉽다는 평이 많다.

---

## 실제 의사-연구자들의 선택 패턴

- 임상역학·생물통계 전공 → R 90%
- 의료정보학 전공 → Python 70%
- 외과 레지던트 중 데이터 분석 → R 먼저 시작 후 필요 시 Python 추가
- 의료 AI 스타트업 창업 → Python 필수

---

## 추천 학습 순서

연구자 지향: R → tidyverse → ggplot2 → survival → 논문 1편 완성 → Python은 자동화 필요할 때

개발자 지향: Python → pandas → scikit-learn → FastAPI → R은 통계 검증 필요할 때

둘 다 배워야 한다. 순서의 문제다.

---

## 핵심 정리

- 의학 논문 투고 목적이라면 R이 현실적으로 유리하다
- ML 모델 개발·배포가 목표라면 Python이 필수다
- `tableone`, `survival`, `ggsurvplot` — R의 임상 연구 3대 패키지
- `scikit-learn`, `lifelines`, `pandas` — Python의 의료 데이터 3대 패키지
- 두 언어는 경쟁이 아니라 상호 보완 관계다

## 관련 글

- [생존 분석 기초 — Kaplan-Meier를 임상 연구에서 읽는 법](/blog/medical-data-science/survival-analysis-basics)
- [재현 가능한 연구 — R Markdown과 Quarto로 분석 보고서 만들기](/blog/medical-data-science/reproducible-research)
- [의료 데이터 시각화 — 논문 Figure 수준 그래프 만들기](/blog/medical-data-science/data-visualization-medical)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
