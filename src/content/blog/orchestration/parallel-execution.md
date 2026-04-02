---
title: "병렬 실행 — 여러 AI를 동시에 달리게 하는 법"
date: 2026-04-01
category: orchestration
tags: ["cu", "병렬실행", "동시성", "성능최적화", "오케스트레이션"]
description: "10분 걸리는 작업을 2분으로 줄이는 방법이 있다. 의존성 없는 태스크를 병렬로 실행하는 패턴과 주의점을 정리한다."
read_time: 6
difficulty: "intermediate"
draft: false
type: "guide"
series: "RoundPrep — 회진 브리핑을 만든다"
series_order: 5
thumbnail: ""
key_takeaways:
  - "10분 걸리는 작업을 2분으로 줄이는 방법이 있다. 의존성 없는 태스크를 병렬로 실행하는 패턴과 주의점을 정리한다."
  - "이 글은 설계 관점 정리이며, 프로덕션 도입 전 보안·비용·감사 요구를 별도 검토한다."
  - "태그 cu: Cursor 초안 — 프레임워크·API·병원 정책은 공식 문서를 본다."
---
> RoundPrep 제5화. Lab 조회가 끝나야 약 조회를 하게 해 두었더니 당직 교수가 “왜 순서대로만 가?”라고 물었다. 병렬을 안 주면 사람 손이 더 빠르다.



## 한줄 요약
병렬 실행은 독립적인 태스크를 동시에 처리해서 전체 시간을 줄이는 기술이다 — 의존성 없는 것만 병렬로 돌릴 수 있다.

## 본문

### 순차 실행의 낭비

환자 초기 평가를 위해 4가지 데이터를 수집해야 한다:
- 최근 EMR 기록 조회: 2초
- 최신 Lab 결과 조회: 3초
- 영상 판독 결과 조회: 2초
- 현재 복용 약물 조회: 1초

순차 실행: 2 + 3 + 2 + 1 = 8초

병렬 실행: max(2, 3, 2, 1) = 3초

이 4개는 서로 의존성이 없다. 동시에 실행해도 결과가 달라지지 않는다.

---

### 병렬 실행 패턴

Fan-out / Fan-in 패턴

하나의 입력을 여러 병렬 태스크에 분배하고, 결과를 하나로 합친다.

```python
import asyncio

async def collect_patient_data(patient_id: str) -> dict:
    # 4개 태스크를 동시에 실행
    emr, labs, imaging, meds = await asyncio.gather(
        fetch_emr(patient_id),
        fetch_labs(patient_id),
        fetch_imaging(patient_id),
        fetch_medications(patient_id)
    )

    return {
        "emr": emr,
        "labs": labs,
        "imaging": imaging,
        "medications": meds
    }
```

Map-Reduce 패턴

많은 항목에 같은 처리를 병렬 적용하고, 결과를 집계한다.

```python
async def analyze_all_patients(patient_ids: list[str]) -> list[dict]:
    # 모든 환자를 동시에 분석
    results = await asyncio.gather(*[
        analyze_single_patient(pid) for pid in patient_ids
    ])
    return results
```

---

### LangGraph에서 병렬 실행

LangGraph는 같은 노드에서 여러 엣지로 분기하면 자동으로 병렬 실행한다.

```python
# 데이터 수집 → 세 가지 분석을 동시에 실행 → 결과 통합

workflow.add_edge("collect_data", "analyze_labs")
workflow.add_edge("collect_data", "analyze_imaging")
workflow.add_edge("collect_data", "check_medications")

# 세 분석이 모두 끝나야 통합 단계 실행
workflow.add_edge("analyze_labs", "synthesize_results")
workflow.add_edge("analyze_imaging", "synthesize_results")
workflow.add_edge("check_medications", "synthesize_results")
```

세 분석 노드는 병렬로 실행되고, `synthesize_results`는 셋이 모두 끝나야 시작한다.

---

### 병렬 실행의 주의점

레이스 컨디션 (Race Condition)

두 태스크가 같은 상태 필드를 동시에 수정하면 충돌이 생긴다.

```python
# 위험: 두 에이전트가 동시에 같은 필드 수정
async def agent_a(state):
    state["result"] = "A의 결과"

async def agent_b(state):
    state["result"] = "B의 결과"  # A의 결과 덮어씀!
```

해결책: 각 에이전트가 고유한 필드를 사용하거나, 리듀서로 안전하게 합친다.

```python
class State(TypedDict):
    lab_analysis: str      # agent_a만 수정
    imaging_analysis: str  # agent_b만 수정
```

비용 폭증

10개 태스크를 병렬로 실행하면 LLM API를 동시에 10번 호출한다. 비용이 10배가 된다 (시간은 줄어도).

API rate limit에도 걸릴 수 있다. 동시 호출 수를 제한하는 세마포어가 필요하다.

```python
semaphore = asyncio.Semaphore(5)  # 동시 최대 5개

async def limited_call(task):
    async with semaphore:
        return await llm_call(task)
```

부분 실패 처리

10개 중 1개가 실패하면 어떻게 할까? 전체를 실패시킬 것인가, 성공한 9개로 진행할 것인가?

```python
results = await asyncio.gather(
    *tasks,
    return_exceptions=True  # 실패해도 전체를 중단하지 않음
)

successes = [r for r in results if not isinstance(r, Exception)]
failures = [r for r in results if isinstance(r, Exception)]

if len(failures) > len(successes):
    raise WorkflowError("너무 많은 태스크 실패")
else:
    return synthesize(successes)  # 성공한 것만으로 진행
```

---

### 병렬화로 얼마나 빨라지는가

실제 의료 오케스트레이션 예시 (가상):

| 태스크 | 소요 시간 |
|--------|----------|
| EMR 조회 | 2초 |
| Lab 조회 | 3초 |
| 약물 DB 조회 | 1초 |
| 가이드라인 검색 | 2초 |
| 감별진단 AI | 4초 |
| 치료 계획 AI | 3초 |
| 보고서 생성 | 2초 |

순차 실행: 17초

최적 병렬화:
```
[병렬] EMR + Lab + 약물 + 가이드라인 = 3초
[순차] 감별진단 = 4초
[순차] 치료 계획 = 3초
[순차] 보고서 = 2초
총: 3 + 4 + 3 + 2 = 12초
```

30% 단축. 태스크 수가 많을수록 병렬화 효과가 크다.


---

### 이야기 속에서 이어서

다음 화: [상태 관리 — 오케스트레이션의 기억 장치](/blog/orchestration/state-management/) — 같은 팀이 막혔던 지점에서 이어진다.


*편집 초안(cu). 프레임워크·API·임상 규정은 발행일 이후 바뀔 수 있으니 공식 문서와 병원 정책을 기준으로 확인한다.*
