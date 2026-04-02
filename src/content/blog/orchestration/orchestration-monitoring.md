---
title: "오케스트레이션 모니터링 — 프로덕션 AI 시스템을 어떻게 지켜보는가"
date: 2026-04-01
category: orchestration
tags: ["cu", "모니터링", "관찰가능성", "프로덕션", "오케스트레이션"]
description: "배포한 AI 오케스트레이션 시스템이 제대로 동작하는지 실시간으로 파악하는 방법. 무엇을 측정하고, 언제 알람을 울리고, 어떻게 대응하는가."
read_time: 7
difficulty: "intermediate"
draft: false
type: "guide"
series: "RoundPrep — 회진 브리핑을 만든다"
series_order: 19
thumbnail: ""
key_takeaways:
  - "배포한 AI 오케스트레이션 시스템이 제대로 동작하는지 실시간으로 파악하는 방법. 무엇을 측정하고, 언제 알람을 울리고, 어떻게 대응하는가."
  - "이 글은 설계 관점 정리이며, 프로덕션 도입 전 보안·비용·감사 요구를 별도 검토한다."
  - "태그 cu: Cursor 초안 — 프레임워크·API·병원 정책은 공식 문서를 본다."
---
> RoundPrep 제19화. 정보국 과장은 코드는 안 본다. “지금도 잘 돌아가고 있나?”에 숫자로 대답할 수 있어야 산다.



## 한줄 요약
"배포하면 끝"이 아니다 — 프로덕션 AI 시스템은 데이터가 바뀌고 모델이 업데이트되고 사용 패턴이 달라지면서 조용히 품질이 떨어진다.

## 본문

### 왜 AI 모니터링이 특별히 어려운가

일반 소프트웨어는 오류가 명확하다. 에러 코드가 나오고, 스택 트레이스가 있고, 재현이 쉽다.

AI 오케스트레이션은 다르다:
- 조용한 실패: 에러는 없는데 답변 품질이 낮아진다
- 점진적 저하: 갑자기 망가지는 게 아니라 서서히 나빠진다
- 비결정론적: 같은 입력도 다른 출력이 나와서 이상한지 판단하기 어렵다
- 원인 추적 어려움: 어떤 에이전트에서 시작된 문제인지 찾기 어렵다

---

### 모니터링 메트릭 설계

운영 메트릭 (Operational Metrics)

```python
metrics = {
    # 속도
    "workflow_p50_latency_ms": ...,   # 중간 50%의 응답 시간
    "workflow_p95_latency_ms": ...,   # 상위 5% 느린 케이스
    "workflow_p99_latency_ms": ...,   # 상위 1% 극단적 케이스

    # 성공률
    "workflow_success_rate": ...,     # 완료 성공 비율
    "agent_error_rate": ...,          # 에이전트별 오류 비율
    "retry_rate": ...,                # 재시도 비율

    # 비용
    "tokens_per_workflow": ...,       # 워크플로우당 토큰 사용량
    "cost_per_workflow_usd": ...,     # 워크플로우당 비용
    "daily_cost_usd": ...,            # 일별 총 비용
}
```

품질 메트릭 (Quality Metrics)

```python
quality_metrics = {
    # 자동 검증 가능한 것
    "output_schema_compliance": ...,  # JSON 스키마 준수 비율
    "required_fields_present": ...,  # 필수 필드 존재 비율
    "human_approval_rate": ...,      # Human-in-the-Loop 승인 비율

    # AI 판별 모델이 측정
    "response_quality_score": ...,   # 응답 품질 점수 (1-5)
    "hallucination_flags": ...,      # 할루시네이션 탐지 건수

    # 사용자 피드백
    "thumbs_up_rate": ...,           # 긍정 피드백 비율
    "correction_rate": ...,          # 의사가 수정한 비율
}
```

---

### 알람 설정

```python
ALERT_RULES = [
    {
        "name": "응답 시간 급증",
        "condition": "p95_latency > 30000ms",  # 30초
        "severity": "WARNING",
        "action": "팀 슬랙 알림"
    },
    {
        "name": "오류율 급증",
        "condition": "error_rate > 5% for 5min",
        "severity": "CRITICAL",
        "action": "온콜 담당자 페이징"
    },
    {
        "name": "품질 점수 하락",
        "condition": "quality_score < 3.5 (rolling 1hr avg)",
        "severity": "WARNING",
        "action": "품질팀 알림"
    },
    {
        "name": "비용 급증",
        "condition": "hourly_cost > 2x yesterday_same_hour",
        "severity": "WARNING",
        "action": "엔지니어링 알림"
    },
    {
        "name": "할루시네이션 급증",
        "condition": "hallucination_flags > 3 in 1hr",
        "severity": "CRITICAL",
        "action": "즉시 에스컬레이션, AI 보조 기능 일시 정지"
    }
]
```

---

### 드리프트 탐지

AI 성능이 시간이 지나면서 조용히 나빠지는 현상을 드리프트(Drift)라고 한다.

원인:
- 모델 제공사가 모델을 업데이트했다 (GPT-4o v1 → v2)
- 입력 데이터의 분포가 바뀌었다 (새로운 유형의 질문이 늘었다)
- 가이드라인 DB가 업데이트됐다

탐지 방법:
```python
def detect_quality_drift(
    recent_scores: list[float],
    baseline_scores: list[float]
) -> bool:
    """최근 품질이 기준치에서 통계적으로 유의하게 하락했는지"""

    from scipy import stats

    t_stat, p_value = stats.ttest_ind(recent_scores, baseline_scores)

    # p < 0.05이고 최근이 기준보다 낮으면 드리프트
    return p_value < 0.05 and mean(recent_scores) < mean(baseline_scores)
```

---

### 의료 AI 모니터링의 특수성

일반 AI와 달리 의료 AI는 "잘못된 것"이 무엇인지 더 명확하다.

즉시 알람이 필요한 경우:
- AI가 금기 약물을 권고한 경우
- 응급 상황을 탐지 못한 경우 (의사가 수동으로 발견)
- 환자 개인정보가 응답에 포함된 경우

주간 리뷰가 필요한 경우:
- 의사가 AI 제안을 수정한 비율
- 특정 진단 카테고리에서 품질 차이
- 사용되지 않는 기능 식별

```python
class MedicalAIMonitor:
    def alert_critical(self, incident: dict):
        """즉시 처리 필요한 의료 AI 사고"""
        # 1. AI 보조 기능 일시 비활성화
        feature_flags.disable("ai_prescription_assist")

        # 2. 온콜 의사에게 즉시 알림
        pager.page(on_call_physician, incident)

        # 3. 사고 기록
        incident_log.record(incident, severity="CRITICAL")

        # 4. 해당 환자에게 수동 검토 요청 표시
        emr.flag_for_manual_review(incident["patient_id"])
```

---

### 관찰 가능성 스택 (Observability Stack)

```
로그 수집: Datadog / CloudWatch
메트릭: Prometheus + Grafana
트레이싱: LangSmith / Langfuse
알람: PagerDuty / 슬랙
인시던트: Jira / Linear
```

프로덕션 AI 시스템에서 모니터링은 선택이 아닌 필수다. 특히 의료처럼 실패 비용이 높은 도메인에서는 무슨 일이 일어나고 있는지 항상 알아야 한다.


---

### 이야기 속에서 이어서

다음 화: [오케스트레이션 보안 — AI 여러 개가 연결될 때 생기는 새 위협](/blog/orchestration/orchestration-security/) — 같은 팀이 막혔던 지점에서 이어진다.


*편집 초안(cu). 프레임워크·API·임상 규정은 발행일 이후 바뀔 수 있으니 공식 문서와 병원 정책을 기준으로 확인한다.*
