---
title: "AI로 작성하는 진단서 프롬프트 3종"
date: "2026-03-29"
category: "doctor-ai"
series: "prompts"
series_order: 7
subcategory: "프롬프트"
thumbnail: ""
draft: false
tags: ["프롬프트", "진단서", "문서", "의료법"]
description: "의료법 제17조 요건을 충족하는 진단서 초안을 AI로 3분 만에 작성하는 프롬프트 3종"
read_time: 6
difficulty: "beginner"
type: "template"
---

## 한줄 요약

진단서 초안 작성에 드는 5분을 1분으로 줄일 수 있다 — 단, 반드시 의사가 검토·서명해야 법적 효력이 생긴다.

## 진단서 작성의 법적 요건

의료법 제17조에 따라 진단서는 다음 요건을 충족해야 한다:
- 직접 진찰한 의사·치과의사·한의사만 작성 가능
- 환자명, 생년월일, 진단명, 치료 기간, 의사 면허번호·서명 필수
- 허위 진단서 작성 시 3년 이하 징역 또는 3,000만 원 이하 벌금

AI 사용 원칙: AI는 초안 작성 보조 도구이며, 최종 내용 확인과 서명은 반드시 담당 의사가 직접 수행한다.

## 탈식별화 방법 (입력 전 필수)

실제 환자 정보를 AI에 입력하기 전에 반드시 탈식별화한다:
- 실명 → [환자명] 또는 가명(예: 홍길동)
- 생년월일 → [YYYY-MM-DD] 또는 연령만
- 등록번호 → [환자번호]
- 최종 출력 후 실제 정보로 교체

---

## 프롬프트 1: 기본형 진단서

```
다음 정보를 바탕으로 진단서 초안을 작성해줘.
한국 의료법 제17조 형식에 맞게, 의학 용어와 한글을 함께 사용해줘.

환자명: [성명]
생년월일: [YYYY-MM-DD]
성별: [남/여]
진단명: [진단명 (ICD-10 코드 또는 KCD-8 코드 포함)]
주요 증상: [증상 기재]
발병일 / 진단일: [날짜]
치료 내용: [수술, 처방, 처치 등]
치료 기간 (향후): [○주 / ○개월]
안정 가료 필요 여부: [필요/불필요, 기간]
발급 목적: [보험청구 / 직장제출 / 법원제출 / 기타]

출력 형식:
- 제목: 진 단 서
- 본문: 위 환자는 [진단명]으로 진단받았으며, 향후 ○주간의 안정 가료가 필요합니다.
- 하단: 위와 같이 진단함 / 발급 연월일 / 의료기관명 / 의사명·면허번호 서명란
```

실제 입력 예시:
```
환자명: [홍○○]
생년월일: [1985-07-15]
성별: 남
진단명: 요추 추간판 탈출증 (M51.1)
주요 증상: 요통 및 좌측 하지 방사통 3주 지속
발병일: 2026-03-01
치료 내용: MRI 확인 후 물리치료 및 경구 진통제 처방
치료 기간: 4주
안정 가료 필요 여부: 필요, 2주
발급 목적: 직장 병가 제출
```

AI 출력 예시:
```
진  단  서

성  명: 홍○○          생년월일: 1985년 07월 15일 (남)

상기 환자는 요추 추간판 탈출증(Lumbar Disc Herniation, M51.1)으로
진단받았으며, 2026년 03월 01일 발병하여 현재 요통 및 좌측
하지 방사통이 지속되고 있습니다.

현재 자기공명영상(MRI) 검사 결과 확인 후 물리치료 및
경구 소염진통제를 처방받아 치료 중에 있으며,
향후 약 4주간의 치료 및 2주간의 안정 가료가 필요합니다.

위와 같이 진단합니다.

2026년 ○○월 ○○일

의료기관명: ____________________
진료과목:  ____________________
의사성명:  ________________ (인)
면허번호:  제        호
```

---

## 프롬프트 2: 보험청구용 진단서

```
보험사 제출용 진단서 초안을 작성해줘.
실손보험 청구에 필요한 항목을 모두 포함하고,
치료비 관련 내용을 구체적으로 기재해줘.

환자명: [성명]
진단명: [KCD-8 코드 포함]
입원 기간: [YYYY-MM-DD ~ YYYY-MM-DD, ○박 ○일]
수술명 (해당 시): [수술명 + 처치코드]
주요 처치: [검사, 시술, 처치 목록]
향후 치료 계획: [추가 입원/통원 여부]
보험청구 목적: [실손보험 / 상해보험 / 생명보험]

형식: 보험사 제출용, 항목별 구분, 영문 진단명 병기
```

---

## 프롬프트 3: 영문 진단서 (Medical Certificate in English)

```
Please draft a medical certificate in English for the following patient.
This certificate will be used for [visa application / insurance / overseas hospital].

Patient name: [Name as in passport]
Date of birth: [YYYY-MM-DD]
Diagnosis: [Diagnosis name in English + ICD-10 code]
Date of diagnosis: [YYYY-MM-DD]
Treatment provided: [Brief description]
Current condition: [Stable / Under treatment / Recovered]
Restrictions (if any): [Travel, physical activity, etc.]
Purpose of certificate: [Visa / Insurance / Second opinion abroad]

Format requirements:
- Header: MEDICAL CERTIFICATE
- Body: formal medical English, no abbreviations without definition
- Footer: Doctor's name, license number, hospital stamp area
- Language: English only
```

## 주의사항

- 탈식별화 없이 실제 환자 정보를 ChatGPT 등 외부 AI에 입력하지 말 것
- AI 출력은 초안 — 의학적 사실 관계와 날짜를 반드시 직접 확인
- 허위 내용이 포함된 진단서에 서명하면 의사의 법적 책임
- 보험사 제출 진단서는 해당 보험사 양식이 있는 경우 양식 우선

## 핵심 정리

- 프롬프트 1: 표준 한국어 진단서 — 직장 제출, 일반 용도
- 프롬프트 2: 보험청구용 — 실손·상해보험 항목 최적화
- 프롬프트 3: 영문 진단서 — 비자, 해외 의료기관, 유학
- 의료법 제17조: AI 초안 작성은 허용, 최종 서명은 담당 의사만 가능
- 입력 전 탈식별화, 출력 후 실제 정보 교체 — 이 두 단계가 핵심

## 관련 글

- [AI로 작성하는 퇴원 계획 프롬프트](/doctor-ai/prompts/discharge-plan-prompt)
- [건강검진 결과 설명 AI 프롬프트: 환자 맞춤 해석](/doctor-ai/prompts/health-screening-prompt)
- [처방 검토 AI 프롬프트: 다제약물 상호작용 확인](/doctor-ai/prompts/prescription-review-prompt)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
