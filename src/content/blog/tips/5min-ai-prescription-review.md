---
title: "5분 안에: 진료 후 처방약 AI로 검토하기"
date: 2026-03-29
category: tips
subcategory: 5분실전
tags: ["처방검토", "약물상호작용", "ChatGPT", "Claude", "환자안전"]
description: "다약제 처방 환자의 약물 상호작용과 용량 적정성을 AI로 빠르게 검토하는 프롬프트."
thumbnail: ""
draft: false
---

## 한줄 요약
처방 목록을 구조화 프롬프트에 넣으면 ChatGPT가 약물 상호작용, 용량 적정성, 신기능 조절 필요 여부를 표로 정리해준다.

## 본문

### 다약제 처방 검토가 어려운 이유

65세 이상 환자의 평균 복용 약물 수는 7~8종이다. 약물 수가 5개를 넘으면 상호작용 조합은 기하급수적으로 증가하며, 수기로 모든 조합을 확인하기는 불가능에 가깝다.

### 준비물

| 도구 | 용도 |
|------|------|
| ChatGPT (GPT-4o) 또는 Claude | 상호작용 분석 |
| UpToDate / Lexicomp | AI 결과 교차 검증용 |

### 처방 검토 프롬프트

```
당신은 임상약리학 전문의입니다.
아래 환자의 전체 처방을 검토해주세요.

환자 정보:
- 연령/성별/체중: {연령}세 {성별} {체중}kg
- 진단: {진단 목록}
- eGFR: {수치} mL/min/1.73m²
- 간기능: AST {}, ALT {}, T.bil {}
- 알레르기: {약물 알레르기}

현재 처방:
{약물명 용량 용법 - 한 줄에 하나씩}

검토 항목:
1. 약물 상호작용 (임상적으로 유의한 것만, severity 표기)
2. 신기능/간기능에 따른 용량 조절 필요 여부
3. 중복 처방 확인 (같은 기전의 약물)
4. 고령 환자 부적절 약물 (Beers Criteria 해당 여부)
5. 추천 변경사항 (근거 포함)

출력 형식: 표로 정리
```

### 실제 적용 예시

입력:

```
- 78세 여성 52kg
- 진단: 심방세동, 고혈압, 제2형 당뇨, 골관절염, 불면증
- eGFR: 38 mL/min/1.73m²
- 간기능: AST 28, ALT 22, T.bil 0.8
- 알레르기: Sulfa drugs

현재 처방:
1. Rivaroxaban 20mg qd
2. Amlodipine 10mg qd
3. Metformin 1000mg bid
4. Glimepiride 2mg qd
5. Celecoxib 200mg bid
6. Diazepam 5mg qhs
7. Omeprazole 20mg qd
```

AI 출력:

| 약물 | 문제점 | Severity | 권고사항 |
|------|--------|----------|----------|
| Rivaroxaban 20mg | eGFR 38: 용량 조절 필요 | 높음 | 15mg qd로 감량 (CrCl 15-50에서 15mg 권고) |
| Metformin 1000mg bid | eGFR 38: 용량 과다 | 높음 | eGFR 30-45에서 500mg bid로 감량, 30 미만 시 중단 |
| Celecoxib + Rivaroxaban | 출혈 위험 증가 | 높음 | NSAIDs 가급적 중단, Acetaminophen으로 대체 검토 |
| Diazepam | Beers Criteria 부적절 약물 (78세) | 중간 | 낙상 위험 증가, 단기 사용 후 감량 또는 non-BZD 수면제 전환 |
| Glimepiride | 고령 + 신기능 저하: 저혈당 위험 | 중간 | DPP-4 억제제(Linagliptin 등)로 전환 검토 |
| Celecoxib | Sulfa 알레르기 교차반응 가능성 | 낮음 | Celecoxib은 sulfonamide 구조이나 교차반응은 드묾, 모니터링 |

### 이렇게 하세요

- eGFR과 체중을 반드시 포함한다 — 신기능 기반 용량 조절 판단의 핵심이다
- AI 결과를 Lexicomp이나 UpToDate로 교차 검증한다
- "임상적으로 유의한 것만"이라는 필터를 넣어야 노이즈가 줄어든다
- 매주 다약제 환자 리스트를 뽑아 정기 처방 검토(medication review)에 활용한다

### 이렇게 하지 마세요

- AI 결과만으로 처방을 변경하지 않는다 — 약사·임상약리 전문의와 협의한다
- "이 약 괜찮아?"라는 모호한 질문을 하지 않는다 — 환자 정보를 구조화해서 넣어야 한다
- AI가 "안전하다"고 답했다고 해서 상호작용이 없다고 확신하지 않는다
- 환자의 실명·주민번호를 프롬프트에 넣지 않는다

### 추가 프롬프트 — 처방 변경 시뮬레이션

```
위 검토 결과를 바탕으로 처방을 수정한다면,
변경 전후를 비교하는 표를 만들어주세요.
각 변경의 근거(가이드라인 또는 문헌)를 함께 표기하세요.
```

## 핵심 정리

- 다약제 처방 검토 시 eGFR·체중·간기능을 포함해야 정확한 결과를 얻는다
- Beers Criteria 부적절 약물 체크는 고령 환자에서 반드시 포함한다
- AI의 상호작용 분석은 1차 스크리닝이며, 최종 판단은 의료진의 몫이다
- Lexicomp 등 공인 DB와 교차 검증을 생활화한다

## 관련 글

- [5분 안에: AI로 감별진단 순서 정하기](/blog/tips/5min-ai-differential-diagnosis)
- [5분 안에: 의료 에러(Adverse Event)를 AI로 보고하기](/blog/tips/5min-ai-adverse-event-report)
- [5분 안에: 새로운 의료 가이드라인을 AI로 정리하기](/blog/tips/5min-ai-guideline-summary)
