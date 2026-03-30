---
title: "영상의학과 AI 플랫폼: PACS 연동 시스템 비교"
date: 2026-03-29
category: "ai-tools"
subcategory: "AI도구리뷰"
thumbnail: ""
draft: false
tags: ["리뷰", "영상의학", "PACS", "Aidoc", "뷰노", "Annalise", "Intelerad"]
description: "Aidoc의 20+ FDA 허가부터 뷰노 VUNO Med까지 — PACS 연동 AI 플랫폼의 실제 판독 시간 단축 데이터와 한국 도입 현황."
read_time: 8
difficulty: "intermediate"
type: "review"
---

## 한줄 요약
Aidoc은 FDA 허가 수 20개로 가장 넓은 적응증을 커버하고, 국내에서는 뷰노의 VUNO Med-Chest X-ray가 식약처 허가와 건강보험 시범수가를 모두 갖춘 가장 현실적인 선택이다.

## PACS 연동 AI의 작동 방식

영상 AI는 PACS(Picture Archiving and Communication System)에서 DICOM 이미지를 실시간으로 받아 분석한 뒤 결과를 다시 PACS 또는 RIS(Radiology Information System)로 반환한다.

```
[촬영 장비] → [DICOM 전송] → [PACS 서버]
                                     ↓ (자동 라우팅)
                              [AI 분석 서버]
                                     ↓ (수초~수분)
                              [소견 DICOM SR로 반환]
                                     ↓
                     [판독의 워크리스트 — 긴급 케이스 상단 배치]
```

이 구조에서 AI는 판독의가 케이스를 열기 전에 분석을 완료하고, 긴급 소견(뇌출혈, 폐색전증 등)이 있으면 워크리스트 최상단에 올리거나 휴대폰 알림을 보낸다.

## 주요 플랫폼 비교 테이블

| 플랫폼 | 개발사 | FDA 허가 수 | 식약처 허가 | EMR 연동 | 가격 모델 | 특징 |
|--------|--------|-----------|----------|---------|---------|-----|
| Aidoc | Aidoc (미국/이스라엘) | 20+ | 없음 | Epic, Cerner | 기관 연간 계약 | 긴급 소견 우선 알림 특화 |
| Intelerad (Blackford) | Intelerad (캐나다) | 10+ | 없음 | 다수 PACS | 모듈별 과금 | 다기관 워크플로우 |
| Annalise AI | Annalise (호주) | CE 마크 | 없음 | 대부분 PACS | 판독당 과금 | 흉부 CXR 124개 소견 |
| VUNO Med-Chest X-ray | 뷰노 (한국) | 없음 | 허가 | 국내 EMR | 기관 계약 | 한국 건강보험 시범수가 |
| Lunit INSIGHT CXR | 루닛 (한국) | 510(k) | 허가 | 국내 EMR, Epic | 판독당/정액 | 글로벌 배포 최다 |

## 플랫폼별 상세 분석

### Aidoc
영상의학과 AI 시장에서 가장 넓은 FDA 허가 포트폴리오를 보유하고 있다:
- 뇌출혈(ICH), 뇌졸중 LVO, 폐색전증, 대동맥 박리, 기흉, 척추 골절 등
- 2024년 기준 미국 900개 이상 병원 도입
- 판독 시간 단축: PE(폐색전증) 케이스에서 평균 판독 착수 시간 67% 감소 (2022년 Academic Radiology)

### Annalise AI
호주 I-MED Radiology와 공동 개발. 흉부 X-ray 단일 모달리티에서 124개 소견을 동시 분석한다.

```
Annalise CXR 감지 소견 예시:
- 폐결절 (1~3cm, 3cm 이상 분류)
- 무기폐 (상엽/하엽/전체)
- 흉수 (소량/중등량/대량)
- 기흉 (경계선/중증)
- 심비대 (CTR > 0.5)
- 주요 혈관 이상 (대동맥 확장)
... 총 124개
```

2023년 Radiology 논문에서 4명의 방사선과 전문의 평균 대비 비열등성 확인.

### 뷰노 VUNO Med-Chest X-ray
- 식약처 2등급 의료기기 허가 취득 (2020)
- 2025년 한국 건강보험 흉부 X-ray AI 판독보조 시범수가 시행
- 폐결절, 폐경화, 흉수, 기흉, 심비대 5가지 소견 분석
- 국내 30개 이상 병원 도입 (2025년 기준)

### 루닛 INSIGHT CXR
- FDA 510(k) 허가 + 식약처 허가 동시 보유
- 아프리카, 동남아시아 결핵 스크리닝 사업에 대규모 배포
- 세계보건기구(WHO) 결핵 AI 도구 권고 목록 포함 (2021)

## 판독 시간 단축 데이터

| 연구 | 플랫폼 | 시나리오 | 결과 |
|------|--------|---------|------|
| Academic Radiology 2022 | Aidoc | 폐색전증 판독 착수 시간 | 67% 단축 |
| JAMA Network Open 2023 | 루닛 CXR | 흉부 X-ray 판독 시간 | 평균 11분 → 7분 |
| Radiology 2023 | Annalise CXR | 중요 소견 누락률 | 전문의 대비 동등 |
| 대한영상의학회지 2024 | 뷰노 CXR | 판독의 소요 시간 | 18% 단축 |

## 한국 영상의학과 도입 현황

- 식약처 허가 영상 AI 기기 수: 2025년 기준 약 70개 이상 (흉부, 뇌, 안저 포함)
- 건강보험 수가 적용: 흉부 X-ray AI 시범수가 2025년부터, CT·MRI는 미적용
- 대학병원 도입률: 상급종합병원 약 60% 이상에서 최소 1개 영상 AI 사용 중

## 핵심 정리
- Aidoc는 FDA 허가 20개로 가장 광범위한 긴급 소견 커버리지를 제공한다
- 뷰노 VUNO Med-Chest X-ray는 국내 식약처 허가와 건강보험 시범수가를 갖춘 현실적인 선택이다
- Annalise CXR의 흉부 X-ray 124개 소견 분석은 현존 단일 모달리티 최다 적응증이다
- 루닛 INSIGHT CXR는 글로벌 배포 범위와 WHO 결핵 프로그램 연동이 차별점이다
- PACS 연동 AI 도입 시 기존 판독 workflow와의 충돌, 판독 책임 소재, 수가 적용 여부를 먼저 검토해야 한다

## 관련 글
- [의료 영상 AI 도구 비교: 2026년 현장 가이드](/blog/ai-tools/medical-imaging-ai-tools/)
- [병리과 AI 분석: 디지털 병리의 현재와 미래](/blog/ai-tools/pathology-ai-analysis/)
- [의료 AI 클라우드 vs 온프레미스: 병원 IT 선택 가이드](/blog/ai-tools/medical-ai-cloud-vs-onprem/)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
