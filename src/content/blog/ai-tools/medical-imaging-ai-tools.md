---
title: "의료 영상 AI 도구 비교: 2026년 현장 가이드"
date: 2026-03-29
category: "ai-tools-medical"
subcategory: "AI도구리뷰"
thumbnail: ""
draft: false
tags: ["리뷰", "의료영상", "루닛", "Aidoc", "흉부X선", "CT", "안저"]
description: "흉부 X-ray부터 내시경까지 — 식약처·FDA 허가 현황과 실제 민감도·특이도 데이터로 비교한 2026년 의료 영상 AI 현장 가이드."
read_time: 9
difficulty: "intermediate"
type: "review"
---

## 한줄 요약
루닛 INSIGHT CXR과 Aidoc은 현재 가장 넓게 배포된 영상 AI이고, 뇌출혈 CT에서는 Viz.ai가 응급 workflow를 바꿨다 — 한국 건강보험 수가는 아직 제한적이지만 2025년부터 일부 AI 판독보조 수가가 신설됐다.

## 영역별 주요 AI 도구 현황

### 흉부 X-ray

| 도구 | 개발사 | 식약처 허가 | FDA 허가 | 민감도 | 특이도 | 가격 모델 |
|------|--------|----------|---------|--------|--------|---------|
| Lunit INSIGHT CXR | 루닛 (한국) | 허가 | 510(k) | 97.3% (결절) | 93.7% | 판독당 과금 or 정액 |
| Aidoc CXR | Aidoc (미국/이스라엘) | 없음 | 510(k) | 94.1% (결절) | 91.2% | 기관 연간 계약 |
| Qure.ai qXR | Qure.ai (인도) | 없음 | 510(k) | 95.0% (폐결핵) | 90.5% | $0.50~1.5/판독 |

Lunit INSIGHT CXR은 흉부 X-ray에서 결절, 경화, 흉수, 기흉 등 10가지 소견을 동시 분석한다. 2024년 Lancet Digital Health에 게재된 다기관 연구에서 전문의 수준의 성능을 확인했다.

### CT 뇌출혈 & 응급 신경계

| 도구 | 적응증 | FDA 허가 | 민감도 | 특이도 | 알림 시간 |
|------|--------|---------|--------|--------|---------|
| Viz.ai LVO | 대혈관폐색 감지 | 510(k) De Novo | 91% | 94% | 5분 이내 |
| Aidoc ICH | 뇌출혈 | 510(k) | 93% | 95% | 판독의 대기열 우선순위 조정 |
| RapidAI | 뇌경색 반음영 분석 | 510(k) | 87% | 92% | 전문의 문자 알림 |

Viz.ai는 뇌졸중 workflow를 혁신한 도구로 평가받는다. CT 이미지를 분석해 LVO(Large Vessel Occlusion) 감지 시 신경외과 전문의에게 직접 알림을 보낸다. NEJM Evidence 2022에서 도입 병원의 치료 시작까지 시간이 평균 26분 단축된 것을 확인했다.

### 유방촬영 AI

| 도구 | 개발사 | FDA 허가 | 민감도 | 특이도 | 특징 |
|------|--------|---------|--------|--------|-----|
| iCAD PowerLook | iCAD (미국) | PMA | 91.9% | 79.3% | 2D/3D DBT 모두 지원 |
| Hologic Genius AI | Hologic (미국) | 510(k) | 94.2% | 81.1% | Hologic 장비 전용 |
| Screenpoint Transpara | ScreenPoint (네덜란드) | CE, 510(k) | 90.7% | 83.4% | 독립형, 장비 비의존 |

### 안저 AI

| 도구 | 적응증 | 허가 | 민감도 | 특이도 |
|------|--------|-----|--------|--------|
| Google DeepMind / Verily | 당뇨망막병증 | FDA De Novo | 90.3% | 98.1% |
| EyeWisdom (Visionary Medical) | 당뇨망막병증, 녹내장 | 식약처 허가 | 87.5% | 96.8% |
| IDx-DR (Digital Diagnostics) | 당뇨망막병증 | FDA De Novo (최초) | 87.2% | 90.7% |

IDx-DR은 2018년 FDA가 최초로 허가한 완전 자율 AI 진단 장치다. 안과 전문의 없이 1차 의료에서 스크리닝이 가능하다.

### 내시경 AI

EndoBRAIN (오림푸스): 대장내시경 중 폴립 실시간 분류. 과형성 폴립과 선종을 88% 정확도로 구분. 일본 후생노동성 승인, 국내 도입 병원 증가 중.

## 한국 건강보험 수가 현황

2025년 신설된 AI 판독보조 관련 수가:
- 흉부 X-ray AI 판독보조: 행위 분류 코드 신설 검토 중 (2026년 시행 예정)
- 안저 AI 스크리닝: 당뇨 환자 대상 시범사업 진행 중 (1차 의료기관)
- CT AI 보조: 현재 별도 수가 없음, 도구 비용 병원 부담

## 도입 전 체크리스트

```
1. 식약처/FDA 허가 여부 확인 (허가 없으면 연구용으로만 사용)
2. PACS 연동 방식 확인 (DICOM SR, HL7 보고서 삽입 방식)
3. 기존 판독 workflow와의 충돌 여부
4. 오판 시 책임 소재 (의사가 최종 판독 책임)
5. 연간 유지보수 비용 포함 TCO 계산
```

## 핵심 정리
- 흉부 X-ray에서는 루닛 INSIGHT CXR이 식약처·FDA 허가, 국내 병원 레퍼런스 모두 갖춘 현실적 선택이다
- 뇌졸중 응급에서 Viz.ai는 치료 시작 시간을 평균 26분 단축시킨 근거가 있다
- 유방촬영 AI는 Hologic 장비를 쓰는 병원이라면 Genius AI가 바로 적용 가능하다
- 안저 AI 스크리닝은 1차 의료에서 당뇨 환자에게 즉시 적용 가능하며, 한국 시범수가 시행 중이다
- 식약처 허가 없는 AI 도구를 진단에 활용하면 의료기기법 위반 소지가 있다

## 관련 글
- [영상의학과 AI 플랫폼: PACS 연동 시스템 비교](/blog/ai-tools/radiology-ai-platforms/)
- [병리과 AI 분석: 디지털 병리의 현재와 미래](/blog/ai-tools/pathology-ai-analysis/)
- [의료 AI 클라우드 vs 온프레미스: 병원 IT 선택 가이드](/blog/ai-tools/medical-ai-cloud-vs-onprem/)
