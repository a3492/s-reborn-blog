---
title: "도구 통합 컨텍스트 — 계산기·DB·검색을 AI에 연결하기"
date: 2026-03-30
category: context-engineering
subcategory: 설계
tags: ["도구사용", "FunctionCalling", "ToolUse", "약물상호작용", "의료AI"]
description: "AI가 텍스트 생성만 하는 것이 아니라 외부 도구를 호출하고 그 결과를 컨텍스트에 반영할 수 있다. 약물 상호작용 DB, BMI 계산기, PubMed 검색 등을 AI에 연결하는 방법을 다룬다."
read_time: 7
difficulty: "intermediate"
draft: false
thumbnail: ""
---

## 한줄 요약
AI는 외부 도구(DB 조회, 계산기, 검색 엔진)를 호출하고 그 결과를 답변에 반영할 수 있다 — 이 "도구 사용" 능력이 의료 AI의 정확성과 안전성을 크게 높인다.

## 본문

### AI의 본질적 한계: 계산과 실시간 데이터

LLM은 텍스트를 생성하는 모델이다. 다음 작업은 본질적으로 약하다.

- 정확한 계산: BMI, eGFR, 약물 용량 계산에서 종종 틀린다
- 실시간 데이터 조회: 현재 약물 가격, 보험 급여 기준을 모른다
- DB 검색: 약물 상호작용, 금기 사항을 체계적으로 확인할 수 없다

이 한계를 극복하는 방법이 도구 사용(Tool Use), 또는 함수 호출(Function Calling)이다.

---

### Function Calling의 작동 방식

1. AI에게 "사용할 수 있는 도구 목록"을 알려준다
2. AI가 답변 중 도구가 필요하다고 판단하면 호출을 요청한다
3. 시스템이 실제로 도구를 실행하고 결과를 AI에게 돌려준다
4. AI가 도구 결과를 참조하여 최종 답변을 생성한다

```
사용자: "이 환자의 eGFR을 계산해 주세요. Cr 1.8, 55세 남성"
AI → calculate_egfr(creatinine=1.8, age=55, sex="M")
시스템 → eGFR = 41.2 mL/min/1.73m²
AI: "CKD-EPI 공식 기준 eGFR은 41.2로, CKD 3b기에 해당합니다."
```

AI가 직접 계산하는 것이 아니라, 전용 계산기에 위임하고 결과를 받아서 답변한다.

---

### 의료 AI에 연결할 수 있는 도구들

약물 상호작용 DB: `check_drug_interaction(Losartan, Spironolactone)` → "고칼륨혈증 위험, K+ 모니터링 필수"

eGFR/BMI 계산기: `calculate_egfr(Cr=1.8, age=55, sex=M)` → eGFR 41.2, CKD 3b

PubMed 검색: `search_pubmed("SGLT2 inhibitor CKD mortality 2025")` → 최신 논문 목록 반환

보험 급여 조회: `check_insurance("Jardiance", indication="CKD")` → 급여 가능, 조건: eGFR 20-45

---

### 여러 도구의 순차 호출

복잡한 의료 질문에서는 여러 도구를 순차적으로 호출하는 경우가 많다.

```
질문: "55세 남성, Cr 1.8, Losartan+Spironolactone 복용 중.
      Amlodipine 추가를 고려하는데 괜찮을까?"

AI 내부:
1단계: calculate_egfr(1.8, 55, M) → eGFR 41.2
2단계: check_drug_interaction(Losartan, Amlodipine) → 유의한 상호작용 없음
3단계: check_drug_interaction(Spironolactone, Amlodipine) → 저혈압 주의
4단계: check_dose_adjustment(Amlodipine, egfr=41.2) → 용량 조절 불필요

답변: "eGFR 41.2에서 Amlodipine은 용량 조절 없이 사용 가능합니다.
      Spironolactone 병용 시 저혈압에 주의가 필요합니다."
```

---

### 실전: 처방 전 자동 상호작용 조회 시나리오

```
[시스템 프롬프트]
당신은 S클리닉의 처방 보조 AI입니다.
처방 관련 질문을 받으면 반드시 다음 도구를 사용하세요:
1. 환자의 eGFR을 계산하세요
2. 모든 약물 쌍의 상호작용을 조회하세요
3. 신기능에 따른 용량 조절 필요 여부를 확인하세요
4. 보험 급여 기준을 확인하세요
```

이 설정에서 의사가 "이 환자에게 Empagliflozin 추가해도 될까?"라고 물으면, AI가 자동으로 4가지 도구를 순차 호출하여 eGFR 확인, 상호작용 체크, 용량 조절 확인, 보험 급여 가능 여부까지 한 번에 답변한다.

---

### 도구 통합 시 주의사항

1. 도구 결과의 신뢰성: 도구가 반환하는 데이터의 출처와 최신성을 보장해야 한다
2. 에러 처리: 도구 호출이 실패했을 때 AI가 추측으로 답변하면 안 된다. 실패를 명시적으로 보고해야 한다
3. 도구 남용: 모든 질문에 모든 도구를 호출하면 응답 시간이 길어진다
4. 최종 책임: 도구 결과를 AI가 종합하더라도 최종 판단은 의료진이 한다

## 핵심 정리
- 도구 사용(Tool Use)은 AI가 외부 시스템을 호출하고 결과를 컨텍스트에 반영하는 메커니즘이다
- 약물 상호작용 DB, eGFR 계산기, PubMed 검색, 보험 조회 등을 연결할 수 있다
- 여러 도구를 순차 호출하면 하나의 질문에 다각도로 검증된 답변이 가능하다
- 도구 결과의 신뢰성과 에러 처리가 핵심이며, 최종 판단은 의료진의 몫이다

## 관련 글
- [RAG와 컨텍스트 — 외부 지식을 실시간으로 AI에 연결하는 법](/blog/context-engineering/rag-for-medical-ai/)
- [구조화된 입력 설계 — AI에게 정보를 전달하는 최적의 형식](/blog/context-engineering/structured-input-design/)
- [컨텍스트 엔지니어링이란 — 프롬프트를 넘어서는 AI 활용의 다음 단계](/blog/context-engineering/what-is-context-engineering/)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
