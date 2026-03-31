---
title: "Python 기초 — 의사를 위한 첫 번째 코딩 수업"
date: 2026-03-31
category: doctor-dev
description: "이 글을 읽어보세요."
thumbnail: ""
draft: false
---

## 한줄 요약

Python은 의료 AI 생태계의 공용어다 — 설치부터 혈당 분류 코드까지 30분이면 시작할 수 있다.

---

## 왜 Python인가

TensorFlow, PyTorch, scikit-learn, LangChain — 의료 AI에 쓰이는 거의 모든 라이브러리가 Python으로 작성되어 있다. 논문 코드를 재현하거나, AI API를 호출하거나, 임상 데이터를 분석할 때 Python이 사실상 표준이다.

R은 통계에 강하고, Java는 병원 EMR 시스템에 많이 쓰이지만, **처음 배우기 쉽고 AI 도구와 연동이 가장 편한 언어**는 Python이다.

---

## 설치

1. [python.org](https://python.org) → 최신 버전 다운로드 및 설치 (Windows: "Add to PATH" 체크)
2. [code.visualstudio.com](https://code.visualstudio.com) → VS Code 설치
3. VS Code에서 Python 확장(Extension) 설치

터미널에서 확인:

```bash
python --version
# Python 3.12.x
```

---

## 변수 — 환자 정보를 저장하는 공간

변수는 환자 차트의 한 칸이라고 생각하면 된다.

```python
# 환자 기본 정보
patient_name = "김철수"
age = 45
height = 172.5      # cm
weight = 78.0       # kg
is_diabetic = True  # 당뇨 여부

print(patient_name, ":", age, "세")
# 출력: 김철수 : 45 세
```

---

## 리스트 — 환자 목록

```python
# 외래 대기 환자 목록
waiting_patients = ["김철수", "이영희", "박민준", "최수진"]

print(waiting_patients[0])   # 김철수 (첫 번째)
print(len(waiting_patients)) # 4 (총 인원)

waiting_patients.append("정다은")  # 추가
print(waiting_patients)
```

---

## 딕셔너리 — 환자 차트

키-값 쌍으로 구성된 딕셔너리는 환자 차트와 구조가 같다.

```python
patient_chart = {
    "name": "김철수",
    "age": 45,
    "chief_complaint": "우하복부 통증",
    "bp": "130/85",
    "hba1c": 7.2
}

print(patient_chart["chief_complaint"])  # 우하복부 통증
patient_chart["diagnosis"] = "급성 충수염 의증"  # 새 항목 추가
```

---

## 함수 — 의료 프로토콜

같은 처치를 반복하지 않듯, 반복되는 코드는 함수로 만든다.

```python
def calculate_bmi(weight_kg, height_cm):
    """BMI 계산 함수"""
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    return round(bmi, 1)

bmi = calculate_bmi(78, 172)
print("BMI:", bmi)  # BMI: 26.4
```

---

## 조건문 — 임상 의사결정

```python
def classify_blood_glucose(glucose_mg_dl):
    """공복혈당 분류 (ADA 기준)"""
    if glucose_mg_dl < 100:
        return "정상"
    elif glucose_mg_dl < 126:
        return "공복혈당장애 (전당뇨)"
    else:
        return "당뇨병 의심 — 추가 검사 필요"

# 실제 사용
glucose = 118
result = classify_blood_glucose(glucose)
print(f"공복혈당 {glucose} mg/dL → {result}")
# 출력: 공복혈당 118 mg/dL → 공복혈당장애 (전당뇨)
```

---

## 실습: BMI + 혈당 동시 평가

```python
def patient_metabolic_summary(name, weight, height, fasting_glucose):
    bmi = calculate_bmi(weight, height)
    glucose_status = classify_blood_glucose(fasting_glucose)

    print(f"=== {name} 대사 요약 ===")
    print(f"BMI: {bmi} → {'비만' if bmi >= 25 else '정상 범위'}")
    print(f"혈당: {fasting_glucose} mg/dL → {glucose_status}")

patient_metabolic_summary("김철수", 78, 172, 118)
```

이 코드를 VS Code에서 실행하면 즉시 결과를 확인할 수 있다.

---

## 핵심 정리

- Python은 의료 AI 생태계의 표준 언어 — 먼저 배울 이유가 충분하다
- 변수/리스트/딕셔너리는 환자 정보, 환자 목록, 환자 차트에 각각 대응한다
- 함수는 반복되는 의료 프로토콜을 코드로 표현한 것이다
- 조건문(`if/elif/else`)은 임상 의사결정 흐름과 동일한 구조다
- `print()`로 언제든 중간 결과를 확인하는 습관을 들여라

## 관련 글

- [Claude API 첫 호출 — 10줄 코드로 의료 AI 만들기](/blog/doctor-dev/api-first-call)
- [Pandas로 임상 데이터 분석 — Excel을 Python으로 대체하는 법](/blog/doctor-dev/pandas-for-clinical-data)
- [Python으로 반복 업무 자동화 — 의사의 일상을 코드로](/blog/doctor-dev/automation-with-python)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
