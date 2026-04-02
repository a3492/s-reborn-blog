---
title: "5분 안에: 증례보고서를 AI로 작성하기"
date: 2026-03-29
category: tips
subcategory: 5분실전
tags: ["증례보고", "케이스리포트", "ChatGPT", "Claude", "학술"]
description: "흥미로운 임상 증례를 CARE 가이드라인에 맞는 논문 초안으로 빠르게 변환하는 프롬프트."
thumbnail: ""
draft: false
---

## 한줄 요약
증례 정보를 CARE 체크리스트 기반 프롬프트에 넣으면, ChatGPT가 학술지 투고 수준의 증례보고 초안을 생성한다.

## 본문

### 증례보고를 AI로 쓰는 이유

임상에서 흥미로운 증례를 만나도, 논문 형식으로 정리하는 데 수일이 걸려 포기하는 경우가 많다. AI를 활용하면 초안 작성 시간을 90% 이상 단축할 수 있어, "쓸까 말까" 고민하는 시간을 줄이고 일단 시작할 수 있다.

### CARE 가이드라인이란

CARE(CAse REport) 가이드라인은 증례보고 작성의 국제 표준 체크리스트다. 대부분의 학술지가 CARE 준수를 요구한다.

| 항목 | 내용 |
|------|------|
| Title | 진단명 + "A case report" |
| Abstract | 구조화 초록 (Background, Case, Conclusion) |
| Introduction | 이 증례가 보고할 가치가 있는 이유 |
| Patient Information | 인구학적 정보, 주소, 병력 |
| Clinical Findings | 신체검진 소견 |
| Timeline | 시간순 경과 |
| Diagnostic Assessment | 검사 결과 + 진단 근거 |
| Therapeutic Intervention | 치료 내용 |
| Follow-up and Outcomes | 경과 + 결과 |
| Discussion | 문헌 고찰 + 이 증례의 의의 |

### 증례보고 생성 프롬프트

```
당신은 의학 학술 저술 전문가입니다.
아래 임상 증례를 CARE 가이드라인에 따라
영문 증례보고 논문 초안으로 작성해주세요.

증례 정보:
- 환자: {연령}세 {성별}
- 주소: {주소}
- 현병력: {현병력}
- 과거력: {과거력}
- 약물력: {복용 중 약물}
- 활력징후: {BP, HR, BT, RR, SpO2}
- 신체검진: {소견}
- 검사결과:
  {혈액검사, 영상, 조직검사 등}
- 진단: {최종 진단}
- 치료: {치료 내용과 경과}
- 결과: {예후, 추적 기간}

작성 규칙:
1. CARE 체크리스트 13개 항목 모두 포함
2. Title은 "진단명: A Case Report" 형식
3. Abstract는 구조화(Background, Case Presentation,
   Conclusion) 250단어 이내
4. Timeline은 표로 작성
5. Discussion에서 유사 증례 문헌 5편 이상 인용
   (실제 존재하는 논문인지 확인 불가하므로
   "[저자, 연도]" 형식으로 placeholder 표기)
6. 학술적 영어(academic English) 사용
```

### 실제 입력 예시

```
- 환자: 32세 여성
- 주소: 2주간 진행하는 양측 하지 부종 + 거품뇨
- 현병력: 2주 전부터 발목 부종 시작, 점진적 악화,
  3일 전부터 안면 부종 동반. 소변에 거품이 심함.
  체중 4kg 증가. 최근 감기 앓은 적 없음.
- 과거력: 특이사항 없음
- 활력징후: BP 148/92, HR 78, BT 36.6, RR 16, SpO2 99%
- 검사결과:
  Albumin 2.1 g/dL, T.cholesterol 342 mg/dL
  24hr urine protein: 8.2 g/day
  BUN/Cr: 18/0.9
  신장 초음파: 양측 신장 크기 정상, 에코 증가
  신생검: Minimal change disease (MCD)
- 치료: Prednisolone 1mg/kg/day 시작
- 결과: 4주 후 완전 관해 (단백뇨 소실)
```

AI는 이 정보를 바탕으로 Title, Abstract, Introduction, Patient Information, Timeline 표, Discussion을 CARE 형식으로 생성한다.

### 이렇게 하세요

- 모든 시간순 이벤트를 가능한 한 상세히 입력한다 — Timeline 표의 정확도가 올라간다
- Discussion의 참고문헌은 AI가 생성한 것이므로 반드시 PubMed에서 실제 존재 여부를 확인한다
- 초안 생성 후 지도교수·공동저자와 함께 수정한다
- 투고 전 환자 동의서(informed consent)를 확보한다

### 이렇게 하지 마세요

- AI가 생성한 참고문헌을 검증 없이 reference list에 넣지 않는다 — 환각 논문이 섞일 수 있다
- AI 초안을 수정 없이 그대로 투고하지 않는다
- 환자를 식별할 수 있는 정보(입원 날짜, 병원명 등)를 프롬프트에 넣지 않는다
- AI 사용 사실을 숨기지 않는다 — 많은 학술지가 AI 사용 공개를 요구한다 (ICMJE 지침)

### 투고 전 체크리스트

```
위 초안을 CARE 체크리스트로 자체 점검해주세요.
각 항목에 대해 "포함됨/누락/보완 필요"로 표시하고,
보완이 필요한 항목은 구체적으로 무엇을 추가해야 하는지 알려주세요.
```

## 핵심 정리

- CARE 가이드라인 기반 프롬프트로 증례보고 초안 작성 시간을 90% 단축한다
- AI가 생성한 참고문헌은 100% 환각 가능성이 있으므로 반드시 검증한다
- 환자 동의서 확보와 비식별화는 법적 필수 사항이다
- AI 사용 사실을 투고 시 공개한다 (ICMJE 2023 지침)

## 관련 글

- [5분 안에: 논문 초록을 AI로 요약하기](/blog/tips/5min-ai-paper-summary)
- [5분 안에: 컨퍼런스 발표 슬라이드를 AI로 만들기](/blog/tips/5min-ai-presentation-slides)
- [5분 안에: 의료 에러(Adverse Event)를 AI로 보고하기](/blog/tips/5min-ai-adverse-event-report)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
