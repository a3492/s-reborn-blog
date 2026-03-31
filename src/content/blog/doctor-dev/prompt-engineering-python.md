---
title: "Python으로 프롬프트 엔지니어링 — 반복 작업 자동화"
date: 2026-03-31
category: doctor-dev
description: "프롬프트를 코드로 관리하면 복사-붙여넣기 없이 수십 명 환자를 한 번에 분석할 수 있다."
thumbnail: ""
draft: false
---

## 한줄 요약

프롬프트를 코드로 관리하면 복사-붙여넣기 없이 수십 명 환자를 한 번에 분석할 수 있다.

---

## 프롬프트를 코드로 관리하는 이유

ChatGPT에 매번 같은 형식으로 증상을 입력하고 있다면, 그 반복 작업은 코드로 대체할 수 있다. Python으로 프롬프트를 관리하면:

- 동일한 형식이 보장된다
- 여러 환자를 한 번에 처리할 수 있다
- 결과를 자동으로 저장한다
- 나중에 프롬프트를 수정하면 모든 케이스에 일괄 적용된다

---

## 프롬프트 템플릿 함수

```python
def differential_diagnosis_prompt(age: int, sex: str,
                                   symptoms: str, vitals: str) -> str:
    return f"""당신은 가정의학과 전문의입니다.

환자: {age}세 {sex}
증상: {symptoms}
활력징후: {vitals}

감별진단 5가지를 가능성 순으로 제시해주세요.
각 진단에 대해 다음을 포함하세요:
1. 진단명
2. 이 진단을 지지하는 소견
3. 권장 추가 검사"""
```

---

## 단일 환자 분석

```python
import anthropic
import os

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

def analyze_patient(patient: dict) -> dict:
    prompt = differential_diagnosis_prompt(
        age=patient["age"],
        sex=patient["sex"],
        symptoms=patient["symptoms"],
        vitals=patient["vitals"]
    )
    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )
    return {
        **patient,
        "ai_analysis": message.content[0].text,
        "input_tokens": message.usage.input_tokens,
        "output_tokens": message.usage.output_tokens
    }
```

---

## 배치 처리 — 여러 환자 동시 분석

```python
patients = [
    {
        "id": "PT001",
        "age": 37, "sex": "여성",
        "symptoms": "우하복부 통증 12시간, 오심, 식욕 저하",
        "vitals": "T 38.2, BP 118/74, HR 96"
    },
    {
        "id": "PT002",
        "age": 54, "sex": "남성",
        "symptoms": "흉통 30분, 좌측 어깨 방사통, 식은땀",
        "vitals": "T 36.8, BP 145/90, HR 88"
    },
    {
        "id": "PT003",
        "age": 28, "sex": "여성",
        "symptoms": "두통 3일, 목 뻣뻣함, 발열",
        "vitals": "T 39.1, BP 110/70, HR 102"
    }
]

results = []
for patient in patients:
    print(f"분석 중: {patient['id']}...")
    result = analyze_patient(patient)
    results.append(result)
    print(f"완료 — 토큰: {result['input_tokens']} / {result['output_tokens']}")
```

---

## 결과를 CSV로 저장

```python
import pandas as pd

df = pd.DataFrame(results)[["id", "age", "sex", "symptoms", "ai_analysis"]]
df.to_csv("patient_analysis_results.csv",
          index=False, encoding="utf-8-sig")
print("결과 저장 완료: patient_analysis_results.csv")
```

---

## 결과를 JSON으로 저장

```python
import json
from datetime import datetime

output = {
    "generated_at": datetime.now().isoformat(),
    "model": "claude-sonnet-4-5",
    "total_patients": len(results),
    "total_tokens": sum(r["input_tokens"] + r["output_tokens"] for r in results),
    "results": results
}

with open("analysis_results.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
```

---

## 비용 계산

```python
# Sonnet 기준 (2025년 기준 참고)
INPUT_COST_PER_1K = 0.003   # $0.003 per 1K tokens
OUTPUT_COST_PER_1K = 0.015  # $0.015 per 1K tokens

total_input = sum(r["input_tokens"] for r in results)
total_output = sum(r["output_tokens"] for r in results)

cost_usd = (total_input / 1000 * INPUT_COST_PER_1K +
            total_output / 1000 * OUTPUT_COST_PER_1K)
cost_krw = cost_usd * 1350

print(f"총 입력 토큰: {total_input:,}")
print(f"총 출력 토큰: {total_output:,}")
print(f"예상 비용: ${cost_usd:.4f} (약 {cost_krw:.0f}원)")
```

---

## 프롬프트 버전 관리

```python
PROMPTS = {
    "v1": "감별진단 5가지를 제시해주세요.",
    "v2": "감별진단 5가지를 가능성 순으로 제시하고 각 진단에 필요한 검사를 포함해주세요.",
    "v3_structured": """감별진단을 다음 JSON 형식으로 반환해주세요:
{"diagnoses": [{"rank": 1, "name": "...", "evidence": "...", "workup": "..."}]}"""
}

def analyze_with_version(patient: dict, version: str = "v2") -> str:
    base_prompt = differential_diagnosis_prompt(**patient)
    full_prompt = base_prompt + "\n\n" + PROMPTS[version]
    # ... API 호출
```

---

## 핵심 정리

- 프롬프트를 함수로 만들면 일관성이 보장되고 수정이 쉬워진다
- 배치 처리로 수십 명 환자를 한 번에 분석할 수 있다
- 결과는 CSV(Excel 호환) 또는 JSON으로 저장해 재활용한다
- 비용 계산을 사전에 추정하는 습관을 들여라
- 프롬프트도 버전 관리를 하면 A/B 비교가 가능하다

## 관련 글

- [Claude API 첫 호출 — 10줄 코드로 의료 AI 만들기](/blog/doctor-dev/api-first-call)
- [Pandas로 임상 데이터 분석 — Excel을 Python으로 대체하는 법](/blog/doctor-dev/pandas-for-clinical-data)
- [Git — 의사가 코드를 관리하는 법](/blog/doctor-dev/git-for-doctors)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
