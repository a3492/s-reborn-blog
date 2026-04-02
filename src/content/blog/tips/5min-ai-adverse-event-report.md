---
title: "5분 안에: 의료 에러(Adverse Event)를 AI로 보고하기"
date: 2026-03-29
category: tips
subcategory: 5분실전
tags: ["이상반응", "약물부작용", "KAERS", "ChatGPT", "환자안전"]
description: "약물 이상반응 발생 시 AI를 활용해 KAERS 보고서 초안을 빠르게 작성하는 방법."
thumbnail: ""
draft: false
---

## 한줄 요약
이상반응 발생 정보를 구조화 프롬프트에 넣으면, ChatGPT가 KAERS(한국의약품안전관리원) 양식에 맞는 보고서 초안을 자동 생성한다.

## 본문

### 이상반응 보고가 중요한 이유

시판 후 조사(post-marketing surveillance)에서 약물 이상반응 보고율은 실제 발생의 5~10%에 불과하다. 보고서 작성이 번거롭기 때문이다. AI로 초안 작성 시간을 줄이면 보고율을 높이고 환자 안전에 기여할 수 있다.

### 준비물

| 도구 | 용도 |
|------|------|
| ChatGPT (GPT-4o) 또는 Claude | 보고서 초안 생성 |
| KAERS 온라인 시스템 | 최종 보고서 제출 (kaers.go.kr) |
| 환자 차트 | 이상반응 관련 정보 확인 |

### 이상반응 보고서 프롬프트

```
당신은 약물감시(Pharmacovigilance) 전문가입니다.
아래 이상반응 정보를 KAERS 보고 양식에 맞게 정리해주세요.

이상반응 정보:
- 환자: {연령}세 {성별}, {체중}kg
- 의심 약물: {약물명} {용량} {용법} {투여 시작일}
- 병용 약물: {약물 목록}
- 이상반응: {증상/진단명}
- 발생일: {날짜}
- 경과:
  {시간순으로 기술}
- 의심 약물 조치: {중단/감량/유지}
- 이상반응 결과: {회복/미회복/후유증/사망}
- Dechallenge: {중단 후 호전 여부}
- Rechallenge: {재투여 시 재발 여부 또는 미시행}

출력 형식:
1. 이상반응 요약 (2~3문장)
2. Naranjo 인과관계 평가 척도 점수 산출 (10개 항목 각각 채점)
3. WHO-UMC 인과관계 분류 (Certain/Probable/Possible/Unlikely)
4. MedDRA 용어 (PT level)
5. KAERS 보고서 서술란용 문장
```

### 실제 적용 예시

입력:

```
- 환자: 45세 남성, 72kg
- 의심 약물: Allopurinol 300mg qd, 2026-03-01 시작
- 병용 약물: Losartan 50mg qd, Metformin 500mg bid
- 이상반응: 전신 발진 + 발열 + 간수치 상승
- 발생일: 2026-03-22 (투여 21일째)
- 경과:
  3/22: 전신 홍반성 반구진 발진, BT 38.5°C
  3/23: AST 180, ALT 210, 호산구 12%
  3/24: Allopurinol 중단, 피부과 협진
  3/26: 발진 호전 시작, 간수치 하강 추세
  3/29: AST 45, ALT 52, 발진 거의 소실
- 의심 약물 조치: 영구 중단
- 이상반응 결과: 회복
- Dechallenge: 양성 (중단 후 호전)
- Rechallenge: 미시행 (금기)
```

AI 출력:

```
1. 요약:
Allopurinol 300mg 투여 21일째 전신 반구진 발진, 발열(38.5°C),
간수치 상승(AST 180, ALT 210), 호산구 증가(12%)가 발생하여
DRESS(Drug Reaction with Eosinophilia and Systemic Symptoms)
의심하에 약물을 중단하였고, 중단 1주 후 회복되었다.

2. Naranjo 척도:
| 항목 | 점수 |
|------|------|
| 이전에 보고된 반응인가? | +1 |
| 약물 투여 후 발생했는가? | +2 |
| 중단 후 호전되었는가? (Dechallenge) | +1 |
| 재투여 시 재발했는가? (Rechallenge) | 0 (미시행) |
| 다른 원인 가능성은? | +1 |
| 위약에도 발생하는가? | 0 |
| 혈중 농도가 독성 수준인가? | 0 |
| 용량 의존적인가? | 0 |
| 이전에 같은 약에 반응한 적 있는가? | 0 |
| 객관적 근거가 있는가? | +1 |
| 합계 | 6점 (Probable) |

3. WHO-UMC: Probable/Likely

4. MedDRA PT: Drug reaction with eosinophilia and
   systemic symptoms (DRESS syndrome)

5. KAERS 서술란:
"45세 남성 환자로, 통풍 치료 목적으로 Allopurinol 300mg을
2026-03-01부터 복용하였으며, 투여 21일째인 2026-03-22
전신 홍반성 반구진 발진과 38.5°C 발열이 발생하였다..."
```

### 이렇게 하세요

- Dechallenge/Rechallenge 정보를 반드시 포함한다 — 인과관계 평가의 핵심이다
- 시간순 경과를 날짜별로 상세히 기술한다
- AI가 산출한 Naranjo 점수를 직접 재계산하여 확인한다
- 보고서 초안을 KAERS에 입력한 뒤 약물 안전 담당자에게 최종 검토를 받는다

### 이렇게 하지 마세요

- AI 보고서를 의사 검토 없이 KAERS에 제출하지 않는다
- 환자 실명을 프롬프트에 넣지 않는다 (KAERS에는 이니셜만 기재)
- AI의 인과관계 판정을 최종 결론으로 채택하지 않는다
- 경미한 이상반응이라고 보고를 생략하지 않는다 — 축적된 데이터가 신호 탐지의 근거가 된다

## 핵심 정리

- 이상반응 정보를 구조화하여 입력하면 KAERS 양식에 맞는 보고서 초안이 자동 생성된다
- Naranjo 척도 자동 채점은 유용하지만 반드시 수기 확인한다
- Dechallenge/Rechallenge 정보가 인과관계 평가를 결정짓는다
- 보고서 작성 부담을 줄여 이상반응 보고율을 높이는 것이 궁극적 목표다

## 관련 글

- [5분 안에: 진료 후 처방약 AI로 검토하기](/blog/tips/5min-ai-prescription-review)
- [5분 안에: AI로 감별진단 순서 정하기](/blog/tips/5min-ai-differential-diagnosis)
- [5분 안에: 새로운 의료 가이드라인을 AI로 정리하기](/blog/tips/5min-ai-guideline-summary)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
