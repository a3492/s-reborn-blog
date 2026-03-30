---
title: "약물 상호작용 검사 AI: Lexi-Interact vs Epocrates vs Micromedex"
date: "2026-03-29"
category: "doctor-ai"
series: "tools"
series_order: 3
subcategory: "AI도구리뷰"
thumbnail: ""
draft: false
tags: ["도구", "약물", "안전", "처방"]
description: "와파린+NSAIDs 등 실제 케이스로 비교한 약물 상호작용 검사 AI 4종 실전 가이드"
read_time: 7
difficulty: "beginner"
type: "review"
---

## 한줄 요약

다제약물 환자 한 명의 처방에서 Lexi-Interact는 상호작용 7건을 발견했고, Epocrates는 5건, Drugs.com은 4건을 찾았다 — 놓친 2-3건이 임상적으로 치명적일 수 있다.

## 제품 기본 정보

| 항목 | Lexi-Interact | Epocrates | Micromedex | Drugs.com |
|------|-------------|---------|-----------|----------|
| 개발사 | Wolters Kluwer | athenahealth | Merative (구 IBM) | Independent |
| 가격 | 월 $20-30 | 무료 / Plus $17/월 | 병원 기관 계약 | 무료 |
| 데이터베이스 | 수십만 쌍 | 300,000+ 쌍 | 가장 포괄적 | 제한적 |
| 업데이트 주기 | 매일 | 주 1-2회 | 매일 | 불정기 |
| 모바일 앱 | iOS/Android | iOS/Android | iOS/Android | 웹 중심 |
| 한국어 | 없음 | 없음 | 없음 | 없음 |
| 한국 의약품 | 일부 | 제한적 | 일부 | 제한적 |
| 임상 레퍼런스 | 포함 | 간략 | 상세 포함 | 기본 |

## Lexi-Interact (Wolters Kluwer)

임상 약사와 의사 사이에서 **Gold Standard**로 통용된다. UpToDate와 같은 Wolters Kluwer 생태계에 속해 있어, UpToDate 구독자는 추가 할인이 가능하다.

**등급 시스템 (A-X)**:
- A: 상호작용 없음 / B: 임상적 의미 미미
- C: 모니터링 권장 / D: 조합 수정 고려
- X: 금기 — 절대 병용 불가

**강점**: 각 상호작용마다 근거 문헌, 기전, 모니터링 파라미터, 대체 약물까지 상세 제공.

## Epocrates (athenahealth)

미국 의사의 30% 이상이 설치한 모바일 앱이다. 무료 버전에서도 기본 약물 상호작용 확인이 가능하며, 진료실에서 즉시 확인하는 용도로 널리 사용된다.

**무료 vs Plus 차이**:
| 기능 | 무료 | Plus ($17/월) |
|------|------|-------------|
| 약물 상호작용 | 기본 | 상세 (기전+근거) |
| 약물 정보 | 요약 | 전체 |
| 계산기 | 일부 | 의학 계산기 전체 |
| CME 크레딧 | 없음 | 포함 |

## Micromedex (Merative)

병원 약국 시스템에 내장된 가장 포괄적인 데이터베이스다. 개인 구독보다는 병원·대학 기관 계약 형태로 운영된다. 임상 연구 근거가 가장 상세하게 정리되어 있다.

**특화 기능**:
- DRUGDEX: 근거 기반 약물 정보 (허가 외 사용 포함)
- POISINDEX: 중독 응급처치 정보
- REPRORISK: 임신·수유 중 약물 안전성

## 실제 케이스 1: 와파린 + NSAIDs

**환자**: 65세 남성, 심방세동으로 와파린 5mg QD 복용 중, 무릎 통증으로 이부프로펜 400mg TID 요청.

**Lexi-Interact 결과**:
```
등급: D (조합 수정 강력 권고)
기전: NSAIDs → COX-1 억제 → 혈소판 기능 저하 + 위장관 점막 손상
     NSAIDs → 와파린 단백결합 경쟁 → INR 상승 가능
위험: 위장관 출혈 위험 3배 증가 (OR 3.16, 95% CI 2.58-3.87)
권고: 아세트아미노펜(타이레놀) 500-1000mg으로 대체
     불가피시: PPI 병용 + INR 주 1회 모니터링
```

## 실제 케이스 2: 메트포르민 + 조영제

**환자**: CT 조영제 촬영 예정, 메트포르민 1000mg BID 복용 중.

**Epocrates 결과**:
```
등급: C (모니터링 권장)
기전: 조영제 → 일시적 신기능 저하 → 메트포르민 축적 → 젖산산증
위험: eGFR < 30이거나 조영제 대량 사용 시 위험 증가
권고: 조영제 투여 전 메트포르민 48시간 중단
     투여 후 48시간 후 신기능 재확인 후 재개
참고: eGFR ≥ 60이면 대부분 기관에서 중단 불필요 (2023 ACR 가이드라인)
```

## AI 강화 기능 (2024-2026년 신규)

최신 버전들은 자연어 입력과 실시간 경고 기능이 추가되었다:

- **자연어 입력**: "75세 신부전 환자에게 항생제 처방하려는데 현재 디곡신 복용 중" → 자동으로 관련 상호작용 검색
- **EMR 연동 실시간 경고**: 처방 입력 시 팝업 알림 (Epic/Cerner 모듈)
- **다약제 일괄 검사**: 10-15가지 약물 한꺼번에 입력해 모든 쌍 조합 분석

## 한국 환경에서의 활용

국내에서는 DUR (Drug Utilization Review) 시스템이 심평원 주도로 운영된다. 처방전 발행 시 자동 경고가 뜨지만, 세부 기전·근거·대체약물 정보가 부족하다. 보완 도구로 Lexi-Interact 또는 Micromedex를 병행하는 것을 권장한다.

## 핵심 정리

- Lexi-Interact: 임상 정확도 최고, 근거 문헌 상세 — 개인 구독 시 최우선 선택
- Epocrates: 모바일 즉시 확인용, 무료 버전도 기본 검사 가능
- Micromedex: 병원 약국 기관용, 가장 포괄적이나 개인 구독 어려움
- Drugs.com: 환자 스스로 확인용, 임상 의사 결정에는 부족
- 한국 DUR 시스템을 기본으로, 복잡한 다제약물 처방엔 외산 도구 병행 추천

## 관련 글

- [처방 검토 AI 프롬프트: 다제약물 상호작용 확인](/doctor-ai/prompts/prescription-review-prompt)
- [ICD 코딩 AI: 진단코드 자동 입력으로 청구 정확도 높이기](/doctor-ai/tools/icd-coding-ai)
- [진료 기록 자동 전사 AI: Nuance DAX vs Nabla vs Abridge](/doctor-ai/tools/clinical-note-transcription)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
