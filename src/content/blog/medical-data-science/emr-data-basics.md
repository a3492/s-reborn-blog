---
title: "EMR 데이터 이해하기 — 구조화·비구조화 데이터의 차이"
date: 2026-03-31
category: medical-data-science
tags:
  - "cu2604021805"
  - "의료데이터"
  - "통계"
  - "분석"
  - "emr-data-basics"

description: "EMR 데이터의 80%는 텍스트다. 구조화 데이터와 비구조화 데이터의 차이를 모르면 연구 설계 자체가 틀어진다."
thumbnail: ""
draft: false
---


## 한줄 요약

EMR 데이터의 80%는 텍스트다. 구조화 데이터와 비구조화 데이터의 차이를 모르면 연구 설계 자체가 틀어진다.

---

## 구조화 데이터 — 숫자와 코드

병원 데이터베이스에서 쿼리로 바로 꺼낼 수 있는 데이터다.

진단 코드 (ICD-10-CM)
- E11.9 — 합병증 없는 제2형 당뇨병
- I25.10 — 관상동맥질환, 폐쇄 명시 없음
- J18.9 — 상세 불명의 폐렴

약물 코드 (ATC)
- A10BA02 — Metformin
- C09AA01 — Captopril
- N06AB06 — Sertraline

검사 수치 (Lab values)

```
glucose: 126 mg/dL
HbA1c: 7.8%
eGFR: 62 mL/min/1.73m²
```

구조화 데이터는 분석하기 쉽지만 임상 맥락이 빠져 있다.

---

## 비구조화 데이터 — 텍스트, 영상, 파형

의무기록의 80%는 비구조화 데이터다.

- 의사 노트: "3개월 전부터 운동 시 흉통 발생. 계단 2층 오르면 호흡 곤란."
- 영상 판독문: "우하엽에 1.2cm 결절 확인. 추적 관찰 권장."
- 심전도 파형: 12-lead ECG raw signal
- 내시경 영상: JPEG/DICOM 파일

이 데이터는 SQL로 꺼낼 수 없다. NLP 또는 딥러닝이 필요하다.

---

## HL7 FHIR 표준

의료 데이터 교환 표준 중 현재 가장 널리 채택된 것이 HL7 FHIR R4다.

```json
{
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "4548-4",
      "display": "Hemoglobin A1c"
    }]
  },
  "valueQuantity": {
    "value": 7.8,
    "unit": "%"
  }
}
```

FHIR API를 통하면 병원 간 데이터 교환이 표준화된다. 미국 CMS는 2021년부터 FHIR API 의무화.

---

## MIMIC-IV 데이터셋

PhysioNet에서 신청 가능한 공개 ICU 데이터셋. 2008-2019년 Beth Israel Deaconess Medical Center 입원 환자 데이터.

- 환자 수: 약 40만 명
- 포함 데이터: 진단, 처방, 검사, 간호 기록, 파형
- 접근: PhysioNet 계정 + CITI 교육 수료 + Data Use Agreement

```sql
-- MIMIC-IV 당뇨병 환자 혈당 추이
SELECT p.subject_id, l.charttime, l.valuenum
FROM patients p
JOIN labevents l ON p.subject_id = l.subject_id
JOIN diagnoses_icd d ON p.subject_id = d.subject_id
WHERE d.icd_code LIKE 'E11%'
  AND l.itemid = 50931  -- glucose
ORDER BY p.subject_id, l.charttime;
```

---

## 한국 건강보험 청구 데이터 (HIRA)

건강보험심사평가원에서 연구자에게 제공하는 전국민 청구 데이터.

- 전국민 5,200만 명 포함
- 입원/외래/약국 청구 기록
- 신청: HIRA 연구지원포털 (hira.or.kr)
- 처리 기간: 약 3-6개월

한계: 검사 수치 없음, 사망 원인 연결 제한적.

---

## 데이터 품질 문제

결측값: HbA1c가 측정된 환자만 분석하면 선택 편향 발생

코딩 오류: ICD 코드 J18.9 (폐렴)이 실제로는 COPD 악화인 경우 다수

중복 기록: 전원 시 동일 입원이 두 병원에서 각각 집계

시간 정보 오류: 과거 병력이 현재 방문 날짜로 입력

---

## 의사가 데이터를 볼 때 주의할 편향

- 관찰 편향(Detection bias): 검사를 더 많이 받는 환자에서 진단이 더 많이 나옴
- 생존자 편향: 중증 환자가 탈락하고 경증만 남음
- 불멸 시간 편향(Immortal time bias): 약물 노출 정의 시 발생하는 고전적 오류

---

## 핵심 정리

- 구조화 데이터: ICD/ATC 코드, 검사 수치, 활력징후 — SQL로 분석 가능
- 비구조화 데이터: 의무기록 텍스트, 영상 — NLP/딥러닝 필요
- FHIR: 현재 의료 데이터 교환 표준, JSON 기반
- MIMIC-IV: 공개 ICU 데이터셋, 연구 시작점으로 최적
- HIRA 청구 데이터: 전국민 규모, 단 검사 수치 없음

## 관련 글

- [의무기록 텍스트 분석 — NLP로 비구조화 데이터 다루기](/blog/medical-data-science/nlp-for-medical-records)
- [EMR 기반 코호트 연구 — 대규모 데이터로 빠르게 연구하는 법](/blog/clinical-research/cohort-study-ehr)
- [결측 데이터 처리 — 의료 데이터에서 가장 흔한 문제](/blog/medical-data-science/missing-data-handling)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
