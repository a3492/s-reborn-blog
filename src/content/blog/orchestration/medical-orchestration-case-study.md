---
title: "의료 오케스트레이션 케이스 스터디 — 입원 환자 관리 AI 시스템"
date: 2026-04-01
category: orchestration
tags: ["케이스스터디", "의료AI", "오케스트레이션", "실전"]
description: "실제 병원에서 오케스트레이션을 어떻게 설계하는지, 입원 환자 통합 관리 AI를 예시로 전체 아키텍처를 그려본다."
read_time: 10
difficulty: "advanced"
draft: false
thumbnail: ""
---

## 한줄 요약
이론이 아닌 실제 병원 시스템을 설계한다면 — 입원 환자 통합 관리 AI의 전체 오케스트레이션 아키텍처를 단계별로 그린다.

## 본문

### 시나리오: 내과 병동 입원 환자 관리

**목표**: 주치의가 회진 시 각 환자에 대해 빠르게 상황을 파악하고 당일 처치를 결정할 수 있도록 AI가 자동으로 준비.

**입력**: 전날 밤 이후 수집된 환자 데이터

**출력**: 각 환자별 상황 요약 + 주의사항 + 제안 처치

---

### 전체 아키텍처

```
[트리거: 오전 7시 자동 실행]
          ↓
[환자 목록 수집 에이전트]
          ↓ (환자 리스트)
[팬아웃: 모든 환자 병렬 처리]
    ↓         ↓         ↓
환자 A    환자 B    환자 C ...
    ↓
[환자별 오케스트레이터]
    ├→ [데이터 수집 에이전트] (병렬)
    │       ├→ 활력징후 수집
    │       ├→ 당일 Lab 결과
    │       ├→ 간호 기록
    │       └→ 투약 기록
    │
    ├→ [분석 에이전트]
    │       ├→ 이상 징후 탐지
    │       ├→ 약물 상호작용 확인
    │       └→ 가이드라인 비교
    │
    └→ [요약 에이전트]
            → 의사용 1페이지 요약 생성
          ↓
[Human-in-the-Loop: 주치의 검토]
          ↓
[처치 계획 에이전트] (승인된 항목만)
          ↓
[EMR 기록 에이전트]
```

---

### 단계별 구현

**1단계: 트리거와 환자 목록 수집**

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('cron', hour=7, minute=0)
async def morning_rounding_prep():
    """매일 오전 7시 회진 준비 자동 실행"""

    # 해당 병동 담당 의사 목록
    physicians = await get_ward_physicians("내과 3병동")

    # 각 의사의 담당 환자 목록
    for physician in physicians:
        patients = await get_admitted_patients(physician.id)

        # 환자별 준비 워크플로우 병렬 실행
        await asyncio.gather(*[
            prepare_patient_summary(patient_id, physician.id)
            for patient_id in patients
        ])
```

**2단계: 환자별 데이터 수집 (병렬)**

```python
async def collect_patient_data(patient_id: str) -> PatientData:
    """활력징후, Lab, 간호기록, 투약 동시 수집"""

    vitals, labs, nursing_notes, medications = await asyncio.gather(
        emr.get_vitals(patient_id, hours=12),
        lab.get_results(patient_id, today=True),
        nursing.get_notes(patient_id, hours=12),
        pharmacy.get_medications(patient_id, active=True)
    )

    return PatientData(
        vitals=vitals,
        labs=labs,
        nursing_notes=nursing_notes,
        medications=medications
    )
```

**3단계: 이상 징후 탐지**

```python
async def detect_abnormalities(patient_data: PatientData) -> list[Alert]:
    alerts = []

    # 규칙 기반 빠른 체크
    if patient_data.vitals.latest_bp_systolic > 180:
        alerts.append(Alert("URGENT", "수축기 혈압 180 초과"))

    if patient_data.labs.potassium > 6.0:
        alerts.append(Alert("CRITICAL", "고칼륨혈증"))

    # AI 기반 패턴 분석
    trend_analysis = await llm.invoke(
        f"다음 12시간 활력징후 추이를 분석하고 악화 징후 있으면 알려줘:\n{patient_data.vitals.trend}"
    )

    if trend_analysis.has_concerning_trend:
        alerts.append(Alert("WARNING", trend_analysis.description))

    return sorted(alerts, key=lambda x: x.severity, reverse=True)
```

**4단계: 의사용 요약 생성**

```python
async def generate_physician_summary(
    patient: Patient,
    data: PatientData,
    alerts: list[Alert]
) -> str:

    return await llm.invoke(f"""
    다음 정보를 바탕으로 내과 전문의를 위한 1페이지 회진 요약을 작성하세요.

    환자: {patient.name} ({patient.age}세, {patient.sex})
    입원 진단: {patient.admission_diagnosis}
    입원 일수: {patient.days_admitted}일

    당일 활력징후: {data.vitals.summary}
    Lab 결과: {data.labs.significant_results}
    투약 중: {data.medications.active_list}

    [주의] 다음 이상 징후가 감지됨:
    {format_alerts(alerts)}

    형식:
    ## 오늘의 핵심 (3줄 이내)
    ## 주의사항
    ## 제안 처치 (검토 필요)
    ## 다음 추적 관찰 항목
    """)
```

**5단계: Human-in-the-Loop**

```python
async def present_to_physician(
    patient_id: str,
    summary: str,
    physician_id: str
) -> PhysicianDecision:

    # 의사 모바일 앱/대시보드에 전송
    await notification.send_to_dashboard(
        physician_id=physician_id,
        patient_id=patient_id,
        summary=summary,
        actions=[
            "처치 계획 승인",
            "수정 후 승인",
            "추가 검토 필요"
        ]
    )

    # 의사 응답 대기 (최대 2시간)
    decision = await wait_for_physician_response(
        patient_id=patient_id,
        timeout=timedelta(hours=2),
        fallback=PhysicianDecision.NEEDS_REVIEW
    )

    return decision
```

---

### 실제 구현 시 고려사항

**HIPAA / 개인정보 보호**
모든 환자 데이터는 병원 내부망에서만 처리. LLM API 호출 시 환자 식별 정보(이름, 주민번호) 제거 후 전송.

**EMR 시스템 통합**
대부분의 병원 EMR은 HL7 FHIR API를 지원한다. 표준 인터페이스로 연결 가능.

**장애 대응**
AI가 다운되거나 오류가 생겨도 의사는 기존 EMR에서 직접 확인할 수 있어야 한다. AI는 보조 도구, EMR이 원본.

**책임 추적**
"AI가 이상 없다고 했는데 환자가 악화됐다"는 상황을 위해 AI의 모든 판단과 근거를 기록으로 남긴다.

이 시스템이 완성되면 주치의는 회진 전 10분 만에 전체 환자 상태를 파악할 수 있다. 현재 수작업으로 30~60분 걸리는 일이다.
