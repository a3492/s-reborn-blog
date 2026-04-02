---
title: "약물 상호작용 감지: 고령 환자의 다제약물 처방 검토"
date: "2026-03-29"
category: "doctor-ai"
series: "cases"
series_order: 8
tags: ["케이스", "약물", "노년"]
description: "복용약물이 많은 고령 환자의 안전한 처방 관리"
read_time: 9
difficulty: "intermediate"
type: "casestudy"
thumbnail: ""
draft: false
---

## 한줄 요약

78세 여성이 10가지 약물을 복용 중 어지러움과 낙상으로 내원했고, AI는 3건의 약물 상호작용을 검출했지만 의사는 기립성 저혈압의 근본 원인을 파악하여 약물 4종을 조정했다.

## 환자 정보

| 항목 | 내용 |
|------|------|
| 나이/성별 | 78세 여성 |
| 주증상 | 어지러움, 2주 내 낙상 2회 |
| 기저질환 | 고혈압, Type 2 DM, 심부전 (EF 40%), 우울증, 골관절염, 골다공증 |
| 활력징후 | 앙와위 BP 148/82 → 기립 시 BP 112/68 (기립성 저혈압) |

## 현재 복용 약물 목록

| # | 약물명 | 용량 | 적응증 |
|---|--------|------|--------|
| 1 | Amlodipine | 10mg qd | 고혈압 |
| 2 | Losartan | 100mg qd | 고혈압, 심부전 |
| 3 | Furosemide | 40mg qd | 심부전 |
| 4 | Carvedilol | 25mg bid | 심부전 |
| 5 | Metformin | 500mg bid | 당뇨 |
| 6 | Gliclazide | 60mg qd | 당뇨 |
| 7 | Escitalopram | 10mg qd | 우울증 |
| 8 | Zolpidem | 5mg hs | 불면증 |
| 9 | Celecoxib | 200mg qd | 골관절염 |
| 10 | Alendronate | 70mg weekly | 골다공증 |

## AI에 입력한 프롬프트

```
78세 여성, 10가지 약물 복용 중.
주증상: 어지러움, 낙상 2회/2주.
기립성 저혈압 확인 (앙와위 148/82 → 기립 112/68).

[현재 약물]
1. Amlodipine 10mg qd
2. Losartan 100mg qd
3. Furosemide 40mg qd
4. Carvedilol 25mg bid
5. Metformin 500mg bid
6. Gliclazide 60mg qd
7. Escitalopram 10mg qd
8. Zolpidem 5mg hs
9. Celecoxib 200mg qd
10. Alendronate 70mg weekly

eGFR 48, Na 133, K 3.2, HbA1c 6.8%, BNP 420

약물 상호작용, 부적절한 약물(Beers criteria), 조정 방안을 분석하라.
```

## AI 분석 결과

### 검출된 약물 상호작용

| 위험도 | 약물 조합 | 상호작용 | 임상적 의미 |
|--------|-----------|----------|------------|
| :red_circle: | Celecoxib + Furosemide + Losartan | Triple whammy (NSAIDs + 이뇨제 + RAAS 차단제) | 급성 신손상 위험 |
| :red_circle: | Escitalopram + Zolpidem | CNS 억제 상승 | 낙상 위험 증가 |
| :yellow_circle: | Celecoxib + Losartan | 항고혈압 효과 감소 | 혈압 조절 불량 가능 |

### Beers Criteria 해당 약물 (65세 이상 부적절)

| 약물 | Beers 분류 | 이유 |
|------|-----------|------|
| Zolpidem | 사용 회피 권고 | 고령자 낙상, 섬망, 골절 위험 |
| Gliclazide | 주의 필요 | 고령자 저혈당 위험 (HbA1c 6.8%로 과도한 조절) |
| Celecoxib | 장기 사용 회피 | 심혈관 + 신장 + 위장관 위험 |

### AI 제안 조정

1. Celecoxib 중단 → Acetaminophen 500mg tid 전환
2. Zolpidem 중단 → 수면 위생 교육
3. Gliclazide 감량 60mg → 30mg (HbA1c 6.8%는 78세에서 과도한 조절)

## 의사가 추가로 잡아낸 점

| 위험도 | AI 미반영 사항 | 의사 판단 |
|--------|---------------|-----------|
| :red_circle: | 기립성 저혈압의 주 원인 | Amlodipine 10mg + Carvedilol 25mg bid → 과도한 혈압 강하 |
| :red_circle: | K 3.2 (저칼륨) | Furosemide + 불충분한 K 보충 → 부정맥 위험 |
| :yellow_circle: | Na 133 (경도 저나트륨) | Escitalopram의 SIADH 유발 가능성 |
| :yellow_circle: | 심부전 환자에서 Celecoxib | 체액 저류 → 심부전 악화 (AI는 신장만 언급) |

### 의사의 종합 판단

AI는 약물 상호작용 "쌍"을 잘 검출했지만, 기립성 저혈압이라는 증상에서 출발하여 원인 약물을 역추적하는 접근은 하지 못했다.

## 최종 약물 조정

| 변경 | 기존 | 변경 후 | 근거 |
|------|------|---------|------|
| :red_circle: 중단 | Celecoxib 200mg | 중단 | Triple whammy + 심부전 악화 |
| :red_circle: 중단 | Zolpidem 5mg | 중단 | Beers criteria, 낙상 위험 |
| :yellow_circle: 감량 | Amlodipine 10mg | 5mg | 기립성 저혈압 원인 |
| :yellow_circle: 감량 | Gliclazide 60mg | 30mg | HbA1c 6.8% 과조절 |
| :green_circle: 추가 | - | KCl 600mg bid | K 3.2 교정 |
| :green_circle: 추가 | - | Acetaminophen 500mg prn | 통증 대체 |
| :green_circle: 유지 | 나머지 6종 | 유지 | - |

## 2주 후 추적

| 항목 | 변경 전 | 2주 후 |
|------|---------|--------|
| 기립 시 BP | 112/68 | 128/74 |
| BP 차이 | 36/14 | 12/6 (정상) |
| K | 3.2 | 4.0 |
| Na | 133 | 136 |
| 낙상 | 2회/2주 | 0회 |
| 어지러움 | 매일 | 소실 |
| HbA1c | 6.8% | 추적 예정 |

## 이 케이스의 교훈

1. 다제약물 환자에서 AI는 상호작용 검출에 강하다 -- 사람이 10가지 약물의 모든 조합을 머릿속으로 검토하기 어렵다
2. 증상 기반 역추적은 의사의 고유 역할 -- "어지러움 → 기립성 저혈압 → 과도한 항고혈압 치료"라는 연결
3. 고령자의 HbA1c 목표는 완화되어야 한다 -- 78세에서 6.8%는 저혈당 위험이 혈당 조절 이득보다 크다

## 핵심 정리

- 고령 다제약물 환자에서 AI 처방 검토는 필수적인 안전장치
- Triple whammy (NSAID + 이뇨제 + RAAS 차단제)는 AI가 잘 잡아내는 대표적 조합
- 최종 약물 조정은 증상, 활력징후, 환자 목표를 종합한 의사 판단

## 관련 글

- [약물 상호작용 검사 AI 도구](/blog/doctor-ai/tools/drug-interaction-ai)
- [처방 검토 프롬프트](/blog/doctor-ai/prompts/prescription-review-prompt)
- [당뇨 관리 AI 케이스](/blog/doctor-ai/cases/diabetes-management-ai)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
