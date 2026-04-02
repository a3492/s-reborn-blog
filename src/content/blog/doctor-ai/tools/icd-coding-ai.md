---
title: "ICD 코딩 AI: 진단코드 자동 입력으로 청구 정확도 높이기"
date: "2026-03-29"
category: "doctor-ai"
series: "tools"
series_order: 4
subcategory: "AI도구리뷰"
thumbnail: ""
draft: false
tags: ["도구", "코딩", "행정", "청구", "ICD"]
description: "3M 360 Encompass, Fathom AI로 ICD 코딩 오류를 줄이고 삭감을 방지하는 방법"
read_time: 7
difficulty: "intermediate"
type: "review"
---

## 한줄 요약

코딩 오류 하나가 건당 수십만 원 삭감으로 이어진다 — AI 자동 코딩으로 정확도를 95%까지 높이고 청구 삭감을 최소화할 수 있다.

## 제품 기본 정보

| 항목 | 3M 360 Encompass | Fathom AI | Optum EncoderPro |
|------|-----------------|---------|-----------------|
| 개발사 | 3M Health (현 Solventum) | Fathom (미국) | Optum (UnitedHealth) |
| 코딩 체계 | ICD-10-CM/PCS, CPT | ICD-10, CPT, HCC | ICD-10-CM/PCS, CPT |
| AI 정확도 | 95% (내부 연구) | 96.1% (독립 검증) | 94% (내부 연구) |
| 가격 | 기관 계약 (대형병원) | 기관 계약 | 월 $49 (개인) |
| EMR 연동 | Epic, Cerner, MEDITECH | Epic 중점 | 다수 |
| 한국 KCD 지원 | 없음 | 없음 | 없음 |

## 3M 360 Encompass (현 Solventum)

미국 코딩 시장 점유율 1위다. 의무기록 텍스트(HIM 문서)에서 주진단, 부진단, 시술코드를 자동 추출하고 DRG(진단관련그룹)을 산출한다. 대형 의료 시스템(병상 200개 이상)에 최적화되어 있다.

핵심 기능:
- CAC (Computer-Assisted Coding): 의무기록 NLP로 코드 자동 제안
- DRG 옵티마이저: 합법적 최적 DRG 경로 제안
- 감사 추적: 코드 제안 근거 문장 하이라이트

## Fathom AI

2020년 창업 스타트업이나 독립 검증 정확도 96.1%로 3M을 앞선다는 평가다. 의원~중소병원 규모에서 비용 효율이 좋고, 구현 기간이 3M 대비 짧다(평균 6주 vs 6개월).

실제 도입 사례: 캘리포니아 지역 의원 체인 (32개 지점) 도입 후 코딩 오류율 18% → 3.2%, 월평균 삭감액 $47,000 감소.

## Optum EncoderPro

개인 구독 모델($49/월)이 있어 중소 의원에서 접근성이 높다. 코드 룩업 + 상호작용 가이드라인 + LCD (Local Coverage Determination) 확인 기능이 통합되어 있다.

## ICD-10 vs 한국 KCD-8 코딩 차이

한국은 KCD (Korean Classification of Diseases) 8차 개정판을 사용하며, WHO ICD-10을 기반으로 하되 한국 특수 코드가 추가되어 있다.

| 항목 | ICD-10-CM (미국) | KCD-8 (한국) |
|------|----------------|------------|
| 코드 수 | 70,000+ | 약 28,000 |
| 한국 특이 코드 | 없음 | U코드 일부 추가 |
| 청구 연동 | Medicare/Medicaid | 건강보험심사평가원 |
| AI 도구 지원 | 풍부 | 국내 EMR 내장 한정 |

## 한국 건강보험심사평가원(심평원) 청구 특수성

심평원은 EDI (Electronic Data Interchange) 청구 시 다음을 자동 검사한다:
- 주상병-수술코드 일치 여부
- 연령·성별 불일치 (예: 남성에 자궁 수술 코드)
- 허용 횟수 초과 (예: 동일 검사 월 2회 이상)
- 급여 기준 미충족 진단코드 조합

현재 국내 AI 코딩 도구는 비트컴퓨터, 이지케어텍, 유비케어 EMR에 내장된 DUR/코드 가이드 기능이 전부이며, 독립 AI 코딩 솔루션은 2026년 시장 초기 단계다.

## AI 코딩 정확도 연구

| 연구 | 비교 | AI 정확도 | 수동 정확도 |
|------|------|---------|----------|
| JAMIA 2023 (3M) | 주진단 코드 | 95.2% | 87.3% |
| J AHIMA 2024 (Fathom) | 복합 처치 코드 | 96.1% | 89.0% |
| 국내 미발표 (대학병원) | KCD 주상병 | 91.3% | 84.5% |

## 비용 절감 효과: 도입 ROI 계산 예시

가정: 월 외래 환자 3,000명, 입원 200건의 중소병원

| 항목 | AI 도입 전 | AI 도입 후 |
|------|---------|---------|
| 코딩 오류율 | 12% | 3% |
| 월 삭감 건수 | 420건 | 105건 |
| 건당 평균 삭감액 | 45,000원 | 45,000원 |
| 월 삭감 손실 | 18,900,000원 | 4,725,000원 |
| 월 절감액 | — | 14,175,000원 |
| AI 솔루션 월 비용 | — | 약 3,000,000원 |
| 순 절감액 | — | 11,175,000원 |

## 주의사항

- AI 코딩 결과는 반드시 의사 또는 인증 의무기록사(CCS/RHIA)의 최종 검토 후 청구
- 업코딩(과다청구)에 AI를 악용하면 사기·부당청구 법적 책임
- 코드 변경 시(연 1회 KCD 개정) AI 모델 재학습 시간 필요

## 핵심 정리

- 3M 360 Encompass: 대형병원 표준, 구현 복잡하나 가장 성숙
- Fathom AI: 정확도 최고, 중소병원에 비용 효율적
- Optum EncoderPro: 개인 구독 가능, 코드 검색+가이드라인 통합
- 한국에서는 KCD-8 전용 AI가 없어 EMR 내장 기능+수동 검토 병행
- 심평원 청구 삭감 감소가 핵심 ROI — 월 1천만 원 이상 절감 가능

## 관련 글

- [진료 기록 자동 전사 AI: Nuance DAX vs Nabla vs Abridge](/doctor-ai/tools/clinical-note-transcription)
- [처방 검토 AI 프롬프트: 다제약물 상호작용 확인](/doctor-ai/prompts/prescription-review-prompt)
- [약물 상호작용 검사 AI: Lexi-Interact vs Epocrates vs Micromedex](/doctor-ai/tools/drug-interaction-ai)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
