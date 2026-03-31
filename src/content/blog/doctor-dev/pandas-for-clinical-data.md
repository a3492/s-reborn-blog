---
title: "Pandas로 임상 데이터 분석 — Excel을 Python으로 대체하는 법"
date: 2026-03-31
category: doctor-dev
description: "Pandas는 Excel보다 빠르고 재현 가능하며 실수가 없다 — 한 번 코드를 짜면 다음 달도 버튼 하나로 돌린다."
thumbnail: ""
draft: false
---

## 한줄 요약

Pandas는 Excel보다 빠르고 재현 가능하며 실수가 없다 — 한 번 코드를 짜면 다음 달도 버튼 하나로 돌린다.

---

## pandas DataFrame = Excel 시트

Excel의 행과 열로 이루어진 표가 pandas에서는 DataFrame이다. 열 이름으로 접근하고, 조건으로 필터링하고, 통계를 낼 수 있다.

---

## 설치

```bash
pip install pandas matplotlib openpyxl
```

---

## 데이터 불러오기

```python
import pandas as pd

# CSV 파일 (내보내기 형식)
df = pd.read_csv("patients.csv", encoding="utf-8-sig")

# Excel 파일
df = pd.read_excel("clinic_data.xlsx", sheet_name="외래")

# 데이터 미리보기
print(df.head())      # 처음 5행
print(df.shape)       # (행 수, 열 수)
print(df.columns)     # 열 이름 목록
print(df.dtypes)      # 각 열의 데이터 타입
```

---

## 실습 데이터 만들기

```python
import pandas as pd
import numpy as np

# 가상의 외래 환자 데이터
data = {
    "patient_id": range(1, 21),
    "age": [45, 62, 38, 71, 55, 48, 67, 33, 59, 44,
            52, 70, 41, 63, 57, 49, 66, 36, 58, 43],
    "sex": ["M","F","M","F","M","F","M","F","M","F"] * 2,
    "diagnosis": ["DM2"] * 10 + ["HTN"] * 5 + ["DM2"] * 5,
    "hba1c": [7.2, 8.1, 6.5, 9.0, 7.8, 6.9, 8.5, None, 7.1, 7.6,
              None, 7.3, 8.8, 6.7, 7.9, 8.2, 6.4, 9.1, 7.0, 7.5],
    "fasting_glucose": [130, 165, 112, 198, 145, 125, 172, 108, 138, 142,
                        None, 131, 181, 116, 153, 169, 115, 204, 129, 140]
}
df = pd.DataFrame(data)
```

---

## 필터링 — 조건으로 환자 선택

```python
# 65세 이상 환자
elderly = df[df["age"] >= 65]
print(f"65세 이상: {len(elderly)}명")

# 당뇨병 환자 중 HbA1c 8 초과
poor_control = df[(df["diagnosis"] == "DM2") & (df["hba1c"] > 8.0)]
print(f"혈당 조절 불량(HbA1c>8): {len(poor_control)}명")
print(poor_control[["patient_id", "age", "hba1c"]])
```

---

## 그룹 분석 — 진단별 통계

```python
# 진단별 HbA1c 평균
summary = df.groupby("diagnosis")["hba1c"].agg(["mean", "std", "count"])
summary.columns = ["평균", "표준편차", "인원수"]
summary["평균"] = summary["평균"].round(1)
print(summary)

# 성별 × 진단 교차 분석
cross = pd.crosstab(df["sex"], df["diagnosis"])
print(cross)
```

---

## 결측값 처리

```python
# 결측값 확인
print(df.isnull().sum())

# HbA1c 결측값 → 해당 진단군 평균으로 대체
df["hba1c"] = df.groupby("diagnosis")["hba1c"].transform(
    lambda x: x.fillna(x.mean())
)
```

---

## 시각화 — 혈당 추세 그래프

```python
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

# 한국어 폰트 설정 (Windows)
plt.rcParams["font.family"] = "Malgun Gothic"

fig, axes = plt.subplots(1, 2, figsize=(12, 4))

# HbA1c 분포
df["hba1c"].hist(bins=10, ax=axes[0], color="steelblue", edgecolor="white")
axes[0].axvline(x=7.0, color="red", linestyle="--", label="목표 HbA1c 7.0")
axes[0].set_title("HbA1c 분포")
axes[0].set_xlabel("HbA1c (%)")
axes[0].legend()

# 나이대별 HbA1c 평균
df["age_group"] = pd.cut(df["age"], bins=[30, 50, 65, 80], labels=["30-50대", "50-65세", "65세+"])
age_hba1c = df.groupby("age_group")["hba1c"].mean()
age_hba1c.plot(kind="bar", ax=axes[1], color="coral", edgecolor="white")
axes[1].set_title("나이대별 평균 HbA1c")
axes[1].set_ylabel("HbA1c (%)")
axes[1].tick_params(axis="x", rotation=0)

plt.tight_layout()
plt.savefig("hba1c_analysis.png", dpi=150)
plt.show()
```

---

## Excel보다 pandas가 나은 상황

- 매월 같은 분석을 반복할 때 (코드 재실행)
- 100명 이상 데이터를 처리할 때 (Excel은 느려짐)
- 분석 과정을 동료에게 공유하고 검증받을 때
- 결측값, 이상치를 체계적으로 처리할 때

---

## 핵심 정리

- `pd.read_csv()` / `pd.read_excel()`로 기존 데이터를 즉시 불러올 수 있다
- `df[조건]`으로 Excel 자동 필터보다 정확하게 환자를 선별한다
- `groupby().agg()`로 진단군별 통계를 한 번에 낸다
- 결측값은 반드시 확인하고 처리 방법을 명시적으로 결정해야 한다
- matplotlib으로 논문/보고서용 그래프를 코드로 만들 수 있다

## 관련 글

- [Python 기초 — 의사를 위한 첫 번째 코딩 수업](/blog/doctor-dev/python-basics-for-doctors)
- [Python으로 반복 업무 자동화 — 의사의 일상을 코드로](/blog/doctor-dev/automation-with-python)
- [Streamlit으로 의료 도구 만들기 — 코딩 없이 UI 구현](/blog/doctor-dev/streamlit-medical-tool)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
