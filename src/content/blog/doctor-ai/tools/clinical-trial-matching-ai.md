---
title: "임상시험 매칭 AI: 환자에게 맞는 연구를 5분 만에 찾다"
date: "2026-03-29"
category: "doctor-ai"
series: "tools"
series_order: 2
subcategory: "AI도구리뷰"
thumbnail: ""
draft: false
tags: ["도구", "임상시험", "연구", "온콜로지"]
description: "Tempus One, TrialJectory, IBM Watson으로 환자 맞춤 임상시험을 5분 안에 매칭하는 방법"
read_time: 7
difficulty: "intermediate"
type: "review"
---

## 한줄 요약

HER2+ 유방암 환자에게 맞는 임상시험을 ClinicalTrials.gov에서 수동으로 찾으면 수 시간 — AI 매칭 도구를 쓰면 5분이면 충분하다.

## 제품 기본 정보

| 항목 | Tempus One | TrialJectory | IBM Watson CTM |
|------|-----------|-------------|---------------|
| 개발사 | Tempus AI (미국) | TrialJectory (미국) | IBM (중단, 레거시) |
| 특화 분야 | 암·희귀질환 | 전체 질환 | 암 중점 |
| 데이터 소스 | 유전체+EMR | ClinicalTrials.gov 8,000+ | NCI, ClinicalTrials |
| 환자 직접 사용 | 제한적 (의사 통해) | 가능 | 기관 계약 전용 |
| 가격 | 기관 계약 | 환자 무료 / 기관 유료 | 계약 종료 |
| 한국어 | 지원 없음 | 지원 없음 | 지원 없음 |
| 한국 임상 DB 연동 | 없음 | 부분 (ICTRP 통해) | 없음 |

## Tempus One

Tempus는 유전체 시퀀싱 데이터와 EMR을 결합해 암 환자에게 최적 임상시험을 매칭하는 플랫폼이다. 암 진단 전문 기관 400곳 이상과 계약되어 있으며, 환자의 종양 유전자 변이 프로파일(NGS 결과)을 기반으로 적격 기준을 자동 판별한다.

핵심 기능
- 유전체 변이(BRCA1/2, HER2 증폭, KRAS 등) 기반 자동 필터링
- 거리·언어·보험 적용 여부 기준 정렬
- 의사에게 적격 임상시험 리포트 자동 생성

## TrialJectory

환자 자가 입력 방식으로 ClinicalTrials.gov 8,000건 이상을 탐색한다. 의사 없이도 사용 가능하며, 복잡한 의학 용어를 일반인이 이해하는 질문으로 변환해 적격 기준을 확인한다.

실제 화면 흐름 (유방암 예시)
1. "진단명을 입력하세요" → '유방암, 2기, HER2 양성' 입력
2. 이전 치료 이력 선택 (허셉틴 6사이클 완료)
3. ECOG 수행도 척도 자가 입력
4. 지역·이동 가능 거리 설정
5. 매칭 결과: 적격 14건, 검토 필요 23건 출력

## IBM Watson for Clinical Trial Matching (역사적 참고)

IBM이 2015-2022년 운영하다 중단한 서비스다. 메모리얼 슬론 케터링(MSK), 메이요 클리닉 등에서 도입했으나 실제 환자 아웃컴 개선 근거 부족으로 계약이 줄어들었다. AI 임상시험 매칭의 초기 실패 사례로 현재도 연구된다.

교훈: 유전체 데이터 없이 텍스트 매칭만으로는 적격 기준 판별 정확도가 65-70% 수준에 그침 — 구조화된 데이터 통합이 필수.

## 실제 케이스: HER2+ 유방암 환자 임상시험 매칭

환자 프로필 (탈식별화):
- 51세 여성, HER2 3+ 증폭, HR 음성
- 허셉틴+탁솔 6사이클 후 부분 관해
- ECOG 1, eGFR 72, 서울 거주

Tempus One 매칭 결과 (5분):
| 순위 | 시험명 | 기관 | 단계 | 적격 기준 충족 |
|------|--------|------|------|------------|
| 1 | DESTINY-Breast06 확장 코호트 | 서울아산병원 | Phase 3 | 95% |
| 2 | HER2CLIMB-04 | 삼성서울병원 | Phase 2 | 88% |
| 3 | PATINA Korean cohort | 국립암센터 | Phase 3 | 81% |

*위 시험명은 예시이며 실제 운영 여부는 CRIS(임상연구정보서비스)에서 확인 필요.*

## 한국 임상시험 포털 연동 현황

외산 AI 매칭 도구는 한국 임상시험 데이터를 거의 포함하지 않는다. 현재 한국 환경에서 사용 가능한 경로:

| 포털 | 주소 | 특징 |
|------|------|------|
| CRIS (임상연구정보서비스) | cris.nih.go.kr | 식약처 등록 임상시험 전체 |
| ClinicalTrials.gov | clinicaltrials.gov | 한국 기관 등록 시험 일부 포함 |
| ICTRP (WHO) | trialsearch.who.int | CRIS 데이터 통합 |

현재 국내 AI 매칭 도구는 존재하지 않으며, 심평원·국립암센터 주도의 개발이 2026년 논의 중이다.

## 한계 및 주의사항

- 한국어 임상시험 데이터 부족: 외산 도구는 국내 등록 시험의 30% 미만 포함
- 적격 기준 오판: AI가 '제외 기준'을 놓치는 경우 (예: 이전 특정 항암제 사용 이력)
- 최종 확인은 임상시험팀: 매칭 결과는 반드시 해당 기관 임상시험팀에 문의 후 확인

## 핵심 정리

- Tempus One: 유전체 데이터가 있는 암 환자에게 가장 정확한 매칭 제공
- TrialJectory: 환자가 직접 탐색 가능한 무료 도구, 한국 시험 포함 제한적
- IBM Watson CTM: 2022년 사실상 중단, 과거 레퍼런스로만 참고
- 한국에서는 CRIS + ClinicalTrials.gov 수동 검색이 현실적 대안
- AI 매칭 결과는 최종 등록 전 임상팀 직접 확인 필수

## 관련 글

- [의료 영상 AI: Lunit vs Aidoc vs Qure.ai 임상 현장 비교](/doctor-ai/tools/medical-imaging-ai)
- [약물 상호작용 검사 AI: Lexi-Interact vs Epocrates vs Micromedex](/doctor-ai/tools/drug-interaction-ai)
- [진료 기록 자동 전사 AI: Nuance DAX vs Nabla vs Abridge](/doctor-ai/tools/clinical-note-transcription)
