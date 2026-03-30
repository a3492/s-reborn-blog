---
title: "진료 기록 자동 전사 AI: Nuance DAX vs Nabla vs Abridge"
date: "2026-03-29"
category: "doctor-ai"
series: "tools"
series_order: 1
subcategory: "AI도구리뷰"
thumbnail: ""
draft: false
tags: ["도구", "기록", "자동화", "전사"]
description: "진료 중 음성을 SOAP 형식 의무기록으로 자동 변환하는 AI 도구 3종 실전 비교"
read_time: 8
difficulty: "beginner"
type: "review"
---

## 한줄 요약

진료실 대화를 자동으로 SOAP 의무기록으로 바꿔주는 AI — 미국 표준 Nuance DAX, 유럽 다국어 Nabla, 연구 기반 Abridge를 실제 가격·기능·한국어 지원 기준으로 비교했다.

## 제품 기본 정보

| 항목 | Nuance DAX | Nabla Copilot | Abridge |
|------|-----------|--------------|---------|
| 개발사 | Microsoft (Nuance) | Nabla (프랑스) | Abridge AI (미국) |
| 출시 | 2020년 | 2022년 | 2023년 |
| 가격 | 월 $149/의사 | 월 $99/의사 | 별도 문의 (병원 계약) |
| 한국어 지원 | 제한적 | 영/불/스/독/포 | 영어 전용 |
| HIPAA 준수 | O | O (GDPR) | O |
| EMR 연동 | Epic, Cerner, Oracle | FHIR HL7 | Epic 중점 |
| FDA 인허가 | SaMD 해당 없음 | EU MDR 검토 중 | 임상 연구 단계 |

## Nuance DAX (Microsoft)

미국 병원의 **60% 이상**이 Nuance의 제품군을 사용 중이다. DAX (Dragon Ambient eXperience)는 진료실 마이크 또는 스마트폰 앱으로 진료 대화를 녹음하고, 60초 이내에 SOAP 형식 노트 초안을 생성한다.

**주요 강점**
- Epic MyChart와 직접 연동 — 클릭 한 번으로 EMR에 삽입
- 의사 개인 서술 패턴 학습 (2-4주 적응 기간)
- 전문과별 템플릿: 내과, 정형외과, 정신건강의학과 등 20+ 종
- Microsoft Azure 인프라로 엔터프라이즈급 보안

**실제 사용 결과 (JAMIA 2024 연구)**: 방문당 문서 작성 시간 72분 → 29분으로 단축, 의사 번아웃 지수 유의미하게 감소.

## Nabla Copilot

유럽 기반으로 GDPR 준수가 강점이다. 프랑스어·스페인어·독일어·포르투갈어 지원으로 다국어 진료 환경에 적합하다. FHIR R4 표준을 통한 EMR 연동으로 한국 병원 정보시스템과도 커스텀 통합이 가능하다.

**주요 강점**
- 월 $99 — 3제품 중 가장 저렴
- 브라우저 기반 실행 (별도 앱 설치 불필요)
- 실시간 스트리밍 전사 (지연 2초 미만)
- 코드 노출 없는 API — IT 부서 개입 최소화

## Abridge

UPMC (피츠버그대 의료센터)와 공동 개발한 연구 기반 도구다. 전공의·레지던트의 만족도가 특히 높으며, 복잡한 케이스 진료에서 맥락 이해 정확도가 우수하다고 보고된다.

**핵심 차별점**: 단순 전사가 아닌 '임상 추론 보조' — 의사가 언급하지 않은 안전망 항목(예: 낙상 위험, 약물 알레르기 재확인)을 노트에 자동 삽입.

## 한국 환경: Clova Note vs 카카오 헬스케어

국내에서는 외산 도구의 한국어 전사 정확도가 낮아 실무 사용이 어렵다.

| 도구 | 개발사 | 한국어 정확도 | EMR 연동 | 가격 |
|------|--------|------------|---------|------|
| Clova Note Pro | NAVER | 매우 높음 | 별도 API 연동 필요 | 월 9,900원~ |
| 카카오 헬스케어 | Kakao | 높음 | 국내 EMR사 협의 중 | B2B 계약 |
| 뷰노 의료 음성 | VUNO | 높음 | 뷰노 EMR 한정 | 병원 계약 |

## SOAP 형식 자동 변환 예시

**진료 대화 입력 (20초 음성)**:
> "환자분 오늘 며칠째 기침이요? 사흘 됐어요? 열은요? 어제 38.2도. 가래는 있고요. 흉통은 없고. 청진해 볼게요. 숨 크게 쉬어보세요. 좌하엽에서 수포음 들립니다."

**AI 생성 SOAP 노트**:
```
S (Subjective):
  - 기침 3일, 가래 동반
  - 어제 발열 38.2°C
  - 흉통 없음

O (Objective):
  - 청진: 좌하엽 수포음(crackles) 청취
  - 발열 전날 확인

A (Assessment):
  - 지역사회획득폐렴(CAP) 의심 — 좌하엽
  - 감별: 바이러스성 기관지염

P (Plan):
  [의사 입력 필요: 항생제 처방, 흉부 X-ray 오더]
```

## 권장 사용법

- 녹음 시작 전 환자에게 동의 획득 (구두 또는 서면)
- 생성된 노트는 서명 전 반드시 의사가 검토·수정
- 민감 정보(정신건강, HIV, 임신) 포함 진료는 별도 설정 필요

## 비권장 상황

- 다중 환자 동시 녹음 (식별 오류 위험)
- 응급 처치 중 실시간 전사 (워크플로 방해)
- 인터넷 미연결 환경 (모든 제품 클라우드 의존)

## 개인정보 주의사항

- 미국 도구 사용 시 PHI(Protected Health Information)가 미국 서버 전송 — BAA(Business Associate Agreement) 체결 필수
- 한국: 개인정보보호법 제17조 — 환자 동의 없이 제3자 서버 전송 불가
- 실무 권고: 탈식별화 후 전사하거나 국내 서버 기반 도구 사용

## 핵심 정리

- Nuance DAX: Epic 연동 환경의 미국 표준, 가장 성숙한 제품이나 가격 높음
- Nabla Copilot: 다국어·저비용, 국내 도입 시 FHIR 연동으로 가능성 있음
- Abridge: 전공의 교육 환경에 강점, 단순 전사 이상의 임상 추론 보조
- 한국어 전사가 필요하면 Clova Note Pro 또는 카카오 헬스케어 검토
- 어떤 도구든 생성된 노트는 의사 최종 검토 필수

## 관련 글

- [처방 검토 AI 프롬프트: 다제약물 상호작용 확인](/doctor-ai/prompts/prescription-review-prompt)
- [약물 상호작용 검사 AI: Lexi-Interact vs Epocrates vs Micromedex](/doctor-ai/tools/drug-interaction-ai)
- [ICD 코딩 AI: 진단코드 자동 입력으로 청구 정확도 높이기](/doctor-ai/tools/icd-coding-ai)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
